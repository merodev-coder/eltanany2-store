// backend/src/models/admin/Product.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { adminDb } from '../../config/db.js';

// ── Types ────────────────────────────────────────────────
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'اسم المنتج مطلوب'],
      trim: true,
      minlength: [2, 'اسم المنتج يجب أن يكون 2 أحرف على الأقل'],
      maxlength: [120, 'اسم المنتج يجب أن لا يتجاوز 120 حرف'],
    },
    description: {
      type: String,
      required: [true, 'وصف المنتج مطلوب'],
      maxlength: [2000, 'الوصف يجب أن لا يتجاوز 2000 حرف'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      min: [0, 'السعر يجب أن يكون أكبر من أو يساوي 0'],
    },
    stock: {
      type: Number,
      required: [true, 'المخزون مطلوب'],
      min: [0, 'المخزون يجب أن يكون أكبر من أو يساوي 0'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'التصنيف مطلوب'],
      trim: true,
      index: true,
    },
    images: {
      type: [String],
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: 'لا يمكن رفع أكثر من 5 صور',
      },
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 1 });

// ── Virtual: isInStock ─────────────────────────────────
productSchema.virtual('isInStock').get(function () {
  return this.stock > 0;
});

// ── Model ──────────────────────────────────────────────
const Product = adminDb.model<IProduct>('Product', productSchema);
export default Product;
