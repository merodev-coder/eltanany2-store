import { adminMongoose, adminDb } from '../../config/db.js';

const productSchema = new adminMongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المنتج مطلوب'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'الفئة مطلوبة'],
    trim: true,
  },
  // ── Strict dropdown fields ────────────────────────────
  brand: {
    type: String,
    enum: ['HP', 'Dell', 'Lenovo'],
    required: [true, 'الماركة مطلوبة'],
    trim: true,
  },
  // ── Specs (nested for laptops; optional for accessories) ──
  specs: {
    cpu: {
      type: String,
      enum: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen'],
      trim: true,
    },
    gpu: {
      type: String,
      enum: ['Intel', 'NVIDIA', 'AMD'],
      trim: true,
    },
    ram: {
      type: String,
      enum: ['8 GB', '16 GB', '32 GB', '64 GB'],
      trim: true,
    },
    storage: {
      type: String,
      enum: ['128 GB', '256 GB', '512 GB'],
      trim: true,
    },
  },
  // ── Pricing ───────────────────────────────────────────
  // price = selling price (displayed to customers)
  // buyingPrice (original purchase cost) removed per requirements
  price: {
    type: Number,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: [true, 'الكمية المتاحة مطلوبة'],
    min: 0,
    default: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: adminMongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  governorate: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Indexes for fast queries — the list endpoint filters on isPublished,
// sorts on createdAt, and optionally filters on category. These compound
// indexes let MongoDB serve the query entirely from the index.
productSchema.index({ isPublished: 1, createdAt: -1 });
productSchema.index({ isPublished: 1, category: 1, createdAt: -1 });
productSchema.index({ createdAt: -1 });

export default adminDb.model('Product', productSchema);
