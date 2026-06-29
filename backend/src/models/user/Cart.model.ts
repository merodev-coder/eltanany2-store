// backend/src/models/user/Cart.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { userDb } from '../../config/db.js';

// ── Types ────────────────────────────────────────────────
export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
  color?: string;
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userEmail: string;
  items: ICartItem[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ── Cart Item Sub-Schema ───────────────────────────────
const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: String,
      required: [true, 'معرف المنتج مطلوب'],
    },
    name: {
      type: String,
      required: [true, 'اسم المنتج مطلوب'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      min: [0, 'السعر يجب أن يكون موجباً'],
    },
    qty: {
      type: Number,
      required: [true, 'الكمية مطلوبة'],
      min: [1, 'الكمية يجب أن تكون على الأقل 1'],
    },
    imageUrl: {
      type: String,
      required: [true, 'صورة المنتج مطلوبة'],
    },
    color: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// ── Cart Schema ─────────────────────────────────────────
const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'المستخدم مطلوب'],
      unique: true,
      index: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: total items count ─────────────────────────
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.qty, 0);
});

// ── Virtual: total price ───────────────────────────────
cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
});

// ── Model ──────────────────────────────────────────────
const Cart = userDb.model<ICart>('Cart', cartSchema);
export default Cart;
