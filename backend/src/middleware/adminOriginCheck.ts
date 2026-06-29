// backend/src/middleware/adminOriginCheck.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify the X-Admin-Origin custom header.
 * Returns 404 (not 401/403) to avoid confirming the route exists.
 * This sits in front of all /api/v1/admin/* routes.
 */
export default function adminOriginCheck(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const adminOriginToken = process.env.ADMIN_ORIGIN_TOKEN;
  const requestHeader = req.headers['x-admin-origin'];

  // If token not configured, skip the check (dev mode)
  if (!adminOriginToken) {
    return next();
  }

  // Check header — return 404 to not reveal admin routes exist
  if (!requestHeader || requestHeader !== adminOriginToken) {
    return res.status(404).json({
      success: false,
      message: 'Not Found',
    });
  }

  next();
}
