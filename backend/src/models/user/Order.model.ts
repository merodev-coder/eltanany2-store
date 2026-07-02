// backend/src/models/user/Order.model.ts
import { receiptMongoose, receiptDb } from '../../config/db.js';

const orderItemSchema = new receiptMongoose.Schema({
  product: {
    type: receiptMongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  color: { type: String },
}, { _id: false });

const orderSchema = new receiptMongoose.Schema({
  user: {
    type: receiptMongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  orderNumber: {
    type: String,
    unique: true,
    index: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'confirmed', 'processing', 'shipped', 'delivered', 'rejected', 'cancelled'],
    default: 'pending',
    index: true,
  },
  deliveryType: {
    type: String,
    enum: ['shipping', 'pickup'],
    default: 'shipping',
  },
  shippingAddress: {
    governorate: { type: String },
    city: { type: String },
    street: { type: String },
    building: { type: String },
    floor: { type: String },
    apartment: { type: String },
    phone: { type: String },
  },
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    notes: { type: String },
  },
  paymentMethod: {
    type: String,
    enum: ['vodafone_cash', 'instapay', 'cash_on_delivery'],
    default: 'vodafone_cash',
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: Date,
  receiptUrl: String,
  receiptVerified: {
    type: Boolean,
    default: false,
  },
  // Profit tracking fields
  totalCost: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  netProfit: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Auto-generate order number before saving
// Use receiptDb.model('Order') — the same connection this schema is registered on
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await receiptDb.model('Order').countDocuments({
      createdAt: { $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()) },
    });
    this.orderNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Export the model registered on receiptDb (the correct connection for orders)
// Use defensive pattern to prevent overwrite errors during hot-reload.
const Order = receiptDb.models.Order || receiptDb.model('Order', orderSchema);
export default Order;
