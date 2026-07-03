// backend/src/models/admin/Admin.model.ts
import { adminMongoose, adminDb } from '../../config/db.js';

const adminSchema = new adminMongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin',
  },
  lastLogin: { type: Date },
  passwordChangedAt: { type: Date },
  permissions: [{ type: String }],
}, { timestamps: true });

// ── Password hashing middleware
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const bcrypt = (await import('bcryptjs')).default;
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Password comparison method
adminSchema.methods.comparePassword = async function(candidatePassword: string) {
  const bcrypt = (await import('bcryptjs')).default;
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Permission check helper
adminSchema.methods.hasPermission = function(permission: string): boolean {
  if (this.role === 'superadmin') return true;
  if (!this.permissions || this.permissions.length === 0) return false;
  return this.permissions.includes(permission);
};

export default adminDb.model('Admin', adminSchema);
