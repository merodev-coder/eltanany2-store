// backend/src/models/admin/Admin.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { adminDb } from '../../config/db.js';
import logger from '../../utils/logger.js';

// ── Types ────────────────────────────────────────────────
export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'superadmin';
  permissions: string[];
  passwordChangedAt?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  hasPermission(permission: string): boolean;
}

export interface IAdminModel extends mongoose.Model<IAdmin> {
  seedSuperadmin(): Promise<void>;
}

// ── Constants ────────────────────────────────────────────
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const DEFAULT_PERMISSIONS = [
  'products:read',
  'products:write',
  'orders:read',
  'orders:write',
  'users:read',
  'users:write',
];

// ── Schema ───────────────────────────────────────────────
const adminSchema = new Schema<IAdmin, IAdminModel>(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
      minlength: [2, 'الاسم يجب أن يكون 2 أحرف على الأقل'],
      maxlength: [50, 'الاسم يجب أن لا يتجاوز 50 حرف'],
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        'البريد الإلكتروني غير صالح',
      ],
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [12, 'كلمة المرور الإدارية يجب أن تكون 12 حرف على الأقل'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
    permissions: {
      type: [String],
      default: () => DEFAULT_PERMISSIONS,
    },
    passwordChangedAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Pre-save: Hash password ────────────────────────────
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  next();
});

// ── Instance Methods ─────────────────────────────────────
adminSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.hasPermission = function (permission: string): boolean {
  if (this.role === 'superadmin') return true;
  return this.permissions.includes(permission);
};

// ── Static Methods ─────────────────────────────────────
adminSchema.statics.seedSuperadmin = async function (): Promise<void> {
  try {
    const count = await this.countDocuments();
    if (count > 0) return;

    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@eltanany.com';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASS;

    if (!defaultPassword) {
      logger.warn('DEFAULT_ADMIN_PASS not set; skipping superadmin seed');
      return;
    }

    await this.create({
      name: 'مدير النظام',
      email: defaultEmail,
      password: defaultPassword,
      role: 'superadmin',
      permissions: [...DEFAULT_PERMISSIONS, 'admins:read', 'admins:write'],
    });

    logger.info(`✅ Superadmin seeded: ${defaultEmail}`);
  } catch (err) {
    logger.error('❌ Failed to seed superadmin:', err);
  }
};

// ── Model ──────────────────────────────────────────────
const Admin = adminDb.model<IAdmin, IAdminModel>('Admin', adminSchema);
export default Admin;
