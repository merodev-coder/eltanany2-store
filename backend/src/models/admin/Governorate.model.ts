// backend/src/models/admin/Governorate.model.ts
import { adminMongoose, adminDb } from '../../config/db.js';

const governorateSchema = new adminMongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  shippingFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  cities: [{ type: String }],
  carrierId: { type: String, default: '' },
}, { timestamps: true });

export default adminDb.model('Governorate', governorateSchema);
