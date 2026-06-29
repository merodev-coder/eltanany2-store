// backend/src/controllers/user/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store uploads in a public directory
const UPLOAD_ROOT = path.resolve(__dirname, '..', '..', '..', 'public', 'uploads', 'receipts');
const PUBLIC_PATH = '/uploads/receipts';

export const uploadReceipt = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { file: base64File, fileName, mimeType } = req.body;

  if (!base64File || !fileName || !mimeType) {
    throw new AppError('File, fileName, and mimeType are all required', 400);
  }

  // Validate it's an image
  if (!mimeType.startsWith('image/')) {
    throw new AppError('Only image files are allowed', 400);
  }

  // Validate filename extension
  const ext = path.extname(fileName).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
    throw new AppError('Unsupported file type. Allowed: jpg, png, webp, gif', 400);
  }

  // Create unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeFileName = `receipt-${timestamp}-${random}${ext}`;

  // Ensure directory exists
  if (!existsSync(UPLOAD_ROOT)) {
    mkdirSync(UPLOAD_ROOT, { recursive: true });
  }

  // Decode and save
  try {
    const buffer = Buffer.from(base64File, 'base64');
    const filePath = path.join(UPLOAD_ROOT, safeFileName);
    writeFileSync(filePath, buffer);

    const publicUrl = `${PUBLIC_PATH}/${safeFileName}`;

    res.status(201).json({
      success: true,
      message: 'Receipt uploaded successfully',
      data: {
        url: publicUrl,
        originalName: fileName,
        size: buffer.length,
      },
    });
  } catch (error) {
    throw new AppError('Failed to save the receipt file', 500);
  }
});
