// backend/src/models/admin/AdminSettings.model.ts
import { adminMongoose, adminDb } from '../../config/db.js';

const adminSettingsSchema = new adminMongoose.Schema({
  storeName: {
    type: String,
    default: 'El-Tanany Store',
  },
  storeDescription: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  contactPhone: {
    type: String,
  },
  currency: {
    type: String,
    default: 'EGP',
  },
  taxRate: {
    type: Number,
    default: 0,
  },
  shippingFee: {
    type: Number,
    default: 0,
  },
  paymentMethods: {
    vodafoneCash: {
      type: String,
      default: '',
    },
    instaPay: {
      type: String,
      default: '',
    },
  },
  priceList: {
    url: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    uploadedAt: {
      type: Date,
    },
  },
}, {
  timestamps: true,
});

// Static method to get or create the singleton settings document
adminSettingsSchema.statics.getOrCreate = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Use defensive pattern to prevent overwrite errors during hot-reload
export default adminDb.models.AdminSettings || adminDb.model('AdminSettings', adminSettingsSchema);
