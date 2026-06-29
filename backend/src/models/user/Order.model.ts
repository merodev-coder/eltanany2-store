// backend/src/models/user/Order.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { userDb } from '../../config/db.js';

// ── Sub-Document Types ─────────────────────────────────
export interface IOrderItem {
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
  color?: string;
}

// ── Types ────────────────────────────────────────────────
export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  depositAmount: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  governorate?: string;
  city?: string;
  address: string;
  landmark?: string;
  deliveryMethod: 'home' | 'pickup';
  paymentMethod: 'cod';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  receiptUrl?: string;
  receiptVerified: boolean;
  depositSlipUrl?: string;
  depositStatus: 'pending' | 'confirmed' | 'rejected' | 'not_required';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Order Item Sub-Schema ──────────────────────────────
const orderItemSchema = new Schema<IOrderItem>(
  {
    name: {
      type: String,
      required: [true, 'اسم المنتج مطلوب'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      min: [0, 'السعر يجب أن يكون موجب'],
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
  { _id: false, toJSON: { virtuals: true, getters: true } }
);

// Frontend-friendly aliases
orderItemSchema.virtual('quantity').get(function () {
  return this.qty;
});

// ── Order Schema ─────────────────────────────────────────
const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'المستخدم مطلوب'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'المنتجات مطلوبة'],
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'الطلب يجب أن يحتوي على منتج واحد على الأقل',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'المجموع الفرعي مطلوب'],
      min: [0, 'المجموع يجب أن يكون موجب'],
    },
    shippingCost: {
      type: Number,
      required: [true, 'تكلفة الشحن مطلوبة'],
      min: [0, 'تكلفة الشحن يجب أن تكون موجبة'],
    },
    depositAmount: {
      type: Number,
      default: 0,
      min: [0, 'العربون يجب أن يكون موجباً'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'الإجمالي مطلوب'],
      min: [0, 'الإجمالي يجب أن يكون موجباً'],
    },
    customerName: {
      type: String,
      required: [true, 'اسم العميل مطلوب'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      trim: true,
    },
    governorate: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'العنوان مطلوب'],
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    deliveryMethod: {
      type: String,
      enum: {
        values: ['home', 'pickup'],
        message: 'طريقة التوصيل غير صالحة',
      },
      required: [true, 'طريقة التوصيل مطلوبة'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cod'],
        message: 'طريقة الدفع غير صالحة',
      },
      default: 'cod',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'confirmed', 'processing', 'shipped', 'delivered', 'rejected', 'cancelled'],
        message: 'حالة الطلب غير صالحة',
      },
      default: 'pending',
      index: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
    receiptVerified: {
      type: Boolean,
      default: false,
    },
    depositSlipUrl: {
      type: String,
      trim: true,
    },
    depositStatus: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'rejected', 'not_required'],
        message: 'حالة العربون غير صالحة',
      },
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'ملاحظات الطلب يجب أن لا تتجاوز 500 حرف'],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ depositStatus: 1 });
orderSchema.index({ status: 1, depositStatus: 1 });

// ── Virtual: Total (alias for totalAmount) ────────────
orderSchema.virtual('total').get(function () {
  return this.totalAmount;
});

// ── Virtual: totalValue (frontend alias for totalAmount) ─
orderSchema.virtual('totalValue').get(function () {
  return this.totalAmount;
});

// ── Virtual: Deposit Status label ────────────────────
orderSchema.virtual('depositStatusLabel').get(function () {
  const labels: Record<string, string> = {
    pending: 'قيد المراجعة',
    confirmed: 'تم التأكيد',
    rejected: 'مرفوض',
    not_required: 'غير مطلوب',
  };
  return labels[this.depositStatus] || this.depositStatus;
});

// ── Pre-save: Calculate subtotal and set deposit status ─
orderSchema.pre('save', function (next) {
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
  // If pickup, set deposit status to not_required automatically
  if (this.deliveryMethod === 'pickup') {
    this.depositStatus = 'not_required';
  }
  next();
});

// ── Model ──────────────────────────────────────────────
const Order = userDb.model<IOrder>('Order', orderSchema);
export default Order;
