// backend/src/middleware/adminOriginCheck.ts
import { Request, Response, NextFunction } from 'express';

export default function adminOriginCheck(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const adminOriginToken = process.env.ADMIN_ORIGIN_TOKEN;
  const requestHeader = req.headers['x-admin-origin'];

  // If token not configured, skip the check (dev mode)
  if (!adminOriginToken) {
    next();
    return;
  }

  // Check header — return 404 to not reveal admin routes exist
  if (!requestHeader || requestHeader !== adminOriginToken) {
    res.status(404).json({
      success: false,
      message: 'Not Found',
    });
    return;
  }

  next();
}
