// backend/src/routes/public/priceList.routes.ts
// Public endpoints — no authentication required.
// Reads price-list metadata from MongoDB (admin DB).
import { Router } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import PriceList from '../../models/admin/PriceList.model.js';

const router = Router();

// GET /api/v1/public/price-list
// Returns the current PriceList document, or null if none exists yet.
router.get(
'/',
catchAsync(async (_req, res) => {
const doc = await PriceList.findOne().sort({ createdAt: -1 }).lean();
res.status(200).json({ success: true, data: doc });
})
);

// GET /api/v1/public/price-list/file
// Proxy fallback: streams the .docx through our server so CORS from
// UploadThing's CDN can never block a client-side fetch.
router.get(
'/file',
catchAsync(async (req, res) => {
const doc = (await PriceList.findOne()
.sort({ createdAt: -1 })
.lean()) as { url: string; fileName: string } | null;

if (!doc?.url) {
return res.status(404).json({
success: false,
message: 'لا توجد قائمة أسعار متوفرة',
});
}

// Fetch the file bytes from UploadThing CDN server-side
const ac = new AbortController();
const timer = setTimeout(() => ac.abort(), 15000);

let upstream: Response;
try {
upstream = await fetch(doc.url, { signal: ac.signal });
} finally {
clearTimeout(timer);
}

if (!upstream.ok) {
return res.status(502).json({
success: false,
message: 'تعذر تحميل الملف من الخادم',
});
}

const buf = Buffer.from(await upstream.arrayBuffer());
res.setHeader(
'Content-Type',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
);
res.setHeader('Content-Length', buf.length);
res.setHeader('Cache-Control', 'public, max-age=300');
res.send(buf);
})
);

export default router;
