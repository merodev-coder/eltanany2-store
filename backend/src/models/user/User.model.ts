// backend/src/models/user/User.model.ts
import { userMongoose, userDb } from '../../config/db.js';

const userSchema = new userMongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: 8,
    select: false,
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  passwordResetOTP: String,
  passwordResetOTPExpires: Date,
  passwordChangedAt: Date,
}, {
  timestamps: true,
});

// ── Password hashing middleware ───────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const bcrypt = (await import('bcryptjs')).default;
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Password comparison method ───────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  const bcrypt = (await import('bcryptjs')).default;
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Login attempt tracking ───────────────────────────────
userSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $unset: { loginAttempts: 1, lockUntil: 1 } });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({ $unset: { loginAttempts: 1, lockUntil: 1 } });
};

// ── Account lock check ───────────────────────────────────
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// CRITICAL: Register on userDb (the connection that owns this model).
// The schema is created with userMongoose so it's compatible with userDb.
// Use defensive pattern to prevent overwrite errors during hot-reload.
const User = userDb.models.User || userDb.model('User', userSchema);
export default User;
