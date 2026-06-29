// backend/src/models/admin/AdminSettings.model.ts
// Singleton settings model — one document, auto-created on first read.

import mongoose, { Schema, Document } from 'mongoose';
import { adminDb } from '../../config/db.js';

// ── Types ────────────────────────────────────────────────
export interface IAdminSettings extends Document {
  _id: mongoose.Types.ObjectId;
  paymentMethods: {
    vodafoneCash?: string;
    instaPay?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────
const adminSettingsSchema = new Schema<IAdminSettings>(
  {
    paymentMethods: {
      vodafoneCash: {
        type: String,
        trim: true,
        default: '',
      },
      instaPay: {
        type: String,
        trim: true,
        default: '',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Singleton: getOrCreate ───────────────────────────────
adminSettingsSchema.statics.getOrCreate = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ paymentMethods: {} });
  }
  return settings;
};

// ── Model ────────────────────────────────────────────────
const AdminSettings = adminDb.model<IAdminSettings>('AdminSettings', adminSettingsSchema);
export default AdminSettings;
