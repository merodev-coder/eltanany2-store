// backend/src/models/admin/Product.model.ts
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
price: {
type: Number,
required: [true, 'السعر مطلوب'],
min: 0,
},
sellingPrice: {
type: Number,
min: 0,
},
buyingPrice: {
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
