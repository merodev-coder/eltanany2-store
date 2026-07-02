// backend/src/models/admin/Admin.model.ts
import { adminMongoose, adminDb } from '../../config/db.js';

const adminSchema = new adminMongoose.Schema({
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
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin',
  },
}, {
  timestamps: true,
});

// ── Password hashing middleware ───────────────────────────
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const bcrypt = (await import('bcryptjs')).default;
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Password comparison method ───────────────────────────
adminSchema.methods.comparePassword = async function(candidatePassword: string) {
  const bcrypt = (await import('bcryptjs')).default;
  return bcrypt.compare(candidatePassword, this.password);
};

export default adminDb.model('Admin', adminSchema);
