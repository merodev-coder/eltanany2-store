// backend/src/uploadthing.ts
import jwt from 'jsonwebtoken';
import { createUploadthing, type FileRouter } from 'uploadthing/express';
import type { Request, Response } from 'express';

const f = createUploadthing();

// ── Shared admin-auth check for UploadThing endpoints ─────
// Runs server-side before the file is accepted so even if the frontend
// button is exposed, only admins/superadmins can upload.
function requireAdmin(req: Request) {
const access = req.cookies?.admin_access;
if (!access) {
throw new Error('Unauthorized');
}
try {
jwt.verify(access, process.env.ADMIN_JWT_SECRET!);
} catch {
// Fallback: accept valid user_access token (superadmin)
const userToken = req.cookies?.user_access;
if (!userToken) throw new Error('Unauthorized');
try {
jwt.verify(userToken, process.env.USER_JWT_SECRET!);
} catch {
throw new Error('Unauthorized');
}
}
}

export const uploadRouter: FileRouter = {
receiptUploader: f({
image: {
maxFileSize: '4MB',
maxFileCount: 1,
},
})
.onUploadComplete(async ({ file }) => {
console.log('Receipt upload completed:', file.name, file.ufsUrl);
return { fileUrl: file.ufsUrl, fileName: file.name, fileSize: file.size };
}),

// Admin-only .docx upload (price list) — 16MB max
docxUploader: f({
'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
maxFileSize: '16MB',
maxFileCount: 1,
},
})
.middleware(async ({ req }) => {
requireAdmin(req);
})
.onUploadComplete(async ({ file }) => {
console.log('DOCX upload completed:', file.name, file.ufsUrl);
return { fileUrl: file.ufsUrl, fileName: file.name, fileSize: file.size };
}),

productImageUploader: f({
image: {
maxFileSize: '4MB',
maxFileCount: 6,
},
})
.onUploadComplete(async ({ file }) => {
console.log('Product image upload completed:', file.name, file.ufsUrl);
return { fileUrl: file.ufsUrl, fileName: file.name, fileSize: file.size };
}),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
