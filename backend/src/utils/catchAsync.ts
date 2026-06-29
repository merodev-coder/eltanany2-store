// backend/src/utils/catchAsync.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper for Express controllers.
 * Catches rejected promises and passes them to the error handler.
 */
export default function catchAsync<T extends (req: Request, res: Response, next: NextFunction) => Promise<any>>(
  fn: T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
