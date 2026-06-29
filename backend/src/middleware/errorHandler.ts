// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

interface ErrorWithCode extends Error {
  code?: number | string;
  statusCode?: number;
  isOperational?: boolean;
  path?: string;
  value?: unknown;
  errors?: Record<string, { message: string }>;
}

function errorHandler(
  err: ErrorWithCode,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // ── Default to 500 ─────────────────────────────────────
  let statusCode = err.statusCode || 500;
  let message = err.message || 'حدث خطأ غير متوقع';
  let errors: Array<{ field: string; message: string }> | undefined;

  // ── Mongoose Validation Error ──────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'بيانات غير صالحة';
    errors = Object.values(err.errors || {}).map((e) => (
      'message' in e
        ? { field: '', message: e.message }
        : { field: '', message: 'خطأ في التحقق' }
    ));
  }

  // ── Mongoose Cast Error (invalid ObjectId) ─────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `المعرف ${err.value} غير صالح`;
  }

  // ── Duplicate Key (MongoDB 11000) ──────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    message = 'هذا البريد الإلكتروني مستخدم بالفعل';
  }

  // ── JWT Errors ─────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'رمز الوصول غير صالح';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'انتهت صلاحية الوصول';
  }

  // ── Operational vs Programming ─────────────────────────
  const isOperational = err.isOperational || false;

  // ── Log the error ──────────────────────────────────────
  if (statusCode >= 500 || !isOperational) {
    logger.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client Error:', {
      statusCode,
      message,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  // ── Send response ────────────────────────────────────────
  const isProd = process.env.NODE_ENV === 'production';
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(isProd ? {} : { stack: err.stack }),
  });
}

export default errorHandler;
