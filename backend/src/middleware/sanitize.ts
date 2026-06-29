// backend/src/middleware/sanitize.ts
import mongoSanitize from 'mongo-sanitize';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

/**
 * Recursively sanitize an object by replacing $ and . characters
 * in keys that would be interpreted as MongoDB operators.
 */
function deepSanitize(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Replace $ and . in keys
    const safeKey = key.replace(/[\$.]/g, '_');
    if (safeKey !== key) {
      logger.warn(`Sanitized key: "${key}" → "${safeKey}"`);
    }
    sanitized[safeKey] = deepSanitize(value);
  }
  return sanitized;
}

/**
 * Express middleware to sanitize request body, query, and params
 * against NoSQL injection attacks.
 */
export default function sanitizeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = deepSanitize(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = deepSanitize(req.params);
  }
  next();
}
