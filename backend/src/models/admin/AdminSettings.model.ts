// backend/src/models/admin/AdminSettings.model.ts
import { adminMongoose, adminDb } from '../../config/db.js';
import type { Model, Document } from 'mongoose';

const adminSettingsSchema = new adminMongoose.Schema({
  storeName: { type: String, default: 'El-Tanany Store' },
  storeDescription: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  currency: { type: String, default: 'EGP' },
  taxRate: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  paymentMethods: {
    vodafoneCash: { type: String, default: '' },
    instaPay: { type: String, default: '' },
  },
}, { timestamps: true });

// ── In-memory cache ──────────────────────────────────────────
let cachedSettings: any = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000;

interface DocType extends Document {
  storeName: string;
  storeDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  currency: string;
  taxRate: number;
  shippingFee: number;
  paymentMethods: { vodafoneCash: string; instaPay: string; };
  getOrCreate(): Promise<DocType>;
  invalidateCache(): void;
}

type AdminSettingsModelType = Model<DocType> & {
  getOrCreate(): Promise<DocType>;
  invalidateCache(): void;
};

const AdminSettings = adminDb.model(
  'AdminSettings',
  adminSettingsSchema,
) as unknown as AdminSettingsModelType;

(adminSettingsSchema.statics as any).getOrCreate = async function (
  this: AdminSettingsModelType,
): Promise<DocType> {
  const now = Date.now();
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSettings;
  }
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  cachedSettings = settings as DocType;
  cacheTimestamp = now;
  return cachedSettings;
};

(adminSettingsSchema.statics as any).invalidateCache = function (
  this: AdminSettingsModelType,
): void {
  cachedSettings = null;
  cacheTimestamp = 0;
};

export default AdminSettings;
