// backend/src/models/admin/Governorate.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { adminDb } from '../../config/db.js';

// ── Types ────────────────────────────────────────────────
export interface IGovernorate extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  shippingFee: number;
  active: boolean;
  cities: string[];
  carrierId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────
const governorateSchema = new Schema<IGovernorate>(
  {
    name: {
      type: String,
      required: [true, 'اسم المحافظة مطلوب'],
      trim: true,
      unique: true,
    },
    shippingFee: {
      type: Number,
      required: [true, 'تكلفة الشحن مطلوبة'],
      min: [0, 'تكلفة الشحن يجب أن تكون موجبة'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    cities: {
      type: [String],
      default: [],
    },
    carrierId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: isActive (alias for active) ──────────────
governorateSchema.virtual('isActive').get(function () {
  return this.active;
});

// ── Indexes ────────────────────────────────────────────
governorateSchema.index({ name: 1 });
governorateSchema.index({ active: 1 });

// ── Model ──────────────────────────────────────────────
const Governorate = adminDb.model<IGovernorate>('Governorate', governorateSchema);
export default Governorate;
