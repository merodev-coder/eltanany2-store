// backend/src/models/user/User.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { userDb } from '../../config/db.js';

// ── Types ────────────────────────────────────────────────
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: 'customer';
  isVerified: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  passwordResetOTP?: string;
  passwordResetOTPExpires?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  isLocked(): boolean;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

// ── Constants ────────────────────────────────────────────
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// ── Schema ───────────────────────────────────────────────
const userSchema = new Schema<IUser>(
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
      minlength: [8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'رقم الهاتف غير صالح (E.164)'],
    },
    avatar: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer'],
      default: 'customer',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: undefined,
    },
    passwordResetOTP: {
      type: String,
      select: false,
    },
    passwordResetOTPExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────
userSchema.index({ lockUntil: 1 });

// ── Pre-save: Hash password ────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  next();
});

// ── Instance Methods ─────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.methods.incLoginAttempts = async function (): Promise<void> {
  this.loginAttempts += 1;

  // Check if we need to lock the account
  const withinWindow =
    !this.lockUntil ||
    this.lockUntil < new Date(Date.now() - LOCK_WINDOW_MS);

  if (this.loginAttempts >= MAX_ATTEMPTS && withinWindow) {
    this.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
  }

  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save({ validateBeforeSave: false });
};

// ── Model ──────────────────────────────────────────────
const User = userDb.model<IUser>('User', userSchema);
export default User;
