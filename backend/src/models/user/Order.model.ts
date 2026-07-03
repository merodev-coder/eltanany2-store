// backend/src/models/user/Order.model.ts
import { userMongoose, userDb } from '../../config/db.js';

const orderItemSchema = new userMongoose.Schema({
  product: {
    type: userMongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  color: { type: String },
}, { _id: false });

const orderSchema = new userMongoose.Schema({
  user: {
    type: userMongoose.Schema.Types.ObjectId,
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

// Compound index for common "unfulfilled orders" queries by the admin
orderSchema.index({ status: 1, createdAt: -1 });

// TTL index: MongoDB automatically removes the document 15 days after creation
// NOTE: TTL requires a single-field index on a date — this only fires on `createdAt`
// so any document where only `updatedAt` changes will NOT be inadvertently removed.
orderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15 * 24 * 60 * 60 });

// Auto-generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await userDb.models.Order.countDocuments({
      createdAt: { $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()) },
    });
    this.orderNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Register the model on userDb (the correct connection for orders)
const Order = userDb.models.Order || userDb.model('Order', orderSchema);
export default Order;
