// backend/src/models/admin/PriceList.model.ts
// Singleton PriceList — stored in MongoDB (admin DB).
// New uploads atomically replace the existing document via $set + upsert.

import { adminMongoose, adminDb } from '../../config/db.js';
import type { Model, Document } from 'mongoose';

const priceListSchema = new adminMongoose.Schema(
{
url: {
type: String,
required: [true, 'رابط الملف مطلوب'],
},
fileName: {
type: String,
required: [true, 'اسم الملف مطلوب'],
trim: true,
},
uploadedAt: {
type: Date,
default: Date.now,
},
},
{ timestamps: true }
);

priceListSchema.index({ createdAt: -1 });

// ── Singleton enforcement: atomic upsert ─────────────────
// Uses findOneAndUpdate with upsert:true — one round-trip, no race condition.
// The query {} always matches (there's only ever 0 or 1 docs).
// ReturnDocument.AFTER gives us the saved doc.

export interface PriceListDoc extends Document {
url: string;
fileName: string;
uploadedAt: Date;
createdAt: Date;
updatedAt: Date;
}

export type PriceListModelType = Model<PriceListDoc> & {
upsertSingleton(payload: { url: string; fileName: string }): Promise<PriceListDoc>;
};

const PriceList = adminDb.model(
'PriceList',
priceListSchema
) as unknown as PriceListModelType;

(priceListSchema.statics as any).upsertSingleton = async function (
this: PriceListModelType,
payload: { url: string; fileName: string }
): Promise<PriceListDoc> {
const doc = await this.findOneAndUpdate(
{},
{
$set: {
url: payload.url,
fileName: payload.fileName,
uploadedAt: new Date(),
},
$setOnInsert: {
createdAt: new Date(),
},
},
{
new: true,
upsert: true,
sort: { createdAt: -1 },
}
);
return doc;
};

export default PriceList;
