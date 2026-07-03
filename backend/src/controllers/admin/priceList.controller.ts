// backend/src/controllers/admin/priceList.controller.ts
// MongoDB-backed singleton price-list.
// The admin uploads via UploadThing; we store the file URL + filename
// so the public page can fetch the binary and render it inline.

import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import PriceList from '../../models/admin/PriceList.model.js';

// ── GET /admin/settings/price-list ─────────────────────────
export const getPriceList = catchAsync(
async (_req: Request, res: Response) => {
const doc = await PriceList.findOne().sort({ createdAt: -1 }).lean();
res.json({ success: true, data: doc });
}
);

// ── POST /admin/settings/price-list ─────────────────────────
// Upserts the singleton with { url, fileName } from the UploadThing callback.
export const createPriceList = catchAsync(
async (req: Request, res: Response, next: NextFunction) => {
const { url, fileName } = req.body;

if (!url?.trim() || !fileName?.trim()) {
return next(new Error('URL and fileName required'));
}

const doc = await (PriceList as any).upsertSingleton({
url: url.trim(),
fileName: fileName.trim(),
});

res.status(200).json({
success: true,
message: 'قائمة الأسعار تم حفظها بنجاح',
data: doc,
});
}
);

// ── DELETE /admin/settings/price-list ───────────────────────
export const removePriceList = catchAsync(
async (_req: Request, res: Response) => {
await PriceList.deleteMany({});
res.json({ success: true, data: null });
}
);
