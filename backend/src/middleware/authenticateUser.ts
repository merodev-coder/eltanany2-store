// backend/src/middleware/authenticateUser.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user/User.model.js';
import { userDb } from '../config/db.js';
import { generateUserTokens, setUserCookies } from '../utils/generateToken.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

interface UserJWTPayload {
  userId: string;
}

interface RefreshJWTPayload {
  sub: string;
  type: string;
}

export default async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // ── 1. Extract access token from cookie ──────────────
    const accessToken = req.cookies?.user_access;

    if (!accessToken) {
      throw new AppError('يجب تسجيل الدخول أولاً', 401);
    }

    // ── 2. Verify access token ──────────────────────────
    let decoded: UserJWTPayload;
    try {
      decoded = jwt.verify(accessToken, process.env.USER_JWT_SECRET!) as UserJWTPayload;
    } catch (err) {
      // ── 3. Expired/invalid → attempt silent refresh ─
      const refreshToken = req.cookies?.user_refresh;

      if (!refreshToken) {
        res.clearCookie('user_access');
        res.clearCookie('user_refresh');
        throw new AppError('انتهت جلسة تسجيل الدخول، يرجى إعادة تسجيل الدخول', 401);
      }

      try {
        const refreshDecoded = jwt.verify(
          refreshToken,
          process.env.USER_REFRESH_SECRET!
        ) as RefreshJWTPayload;

        if (refreshDecoded.type !== 'user_refresh') {
          res.clearCookie('user_access');
          res.clearCookie('user_refresh');
          throw new AppError('رمز التحديث غير صالح', 401);
        }

        // Fetch user to ensure they still exist
        const user = await User.findById(refreshDecoded.sub);
        if (!user) {
          res.clearCookie('user_access');
          res.clearCookie('user_refresh');
          throw new AppError('المستخدم غير موجود', 401);
        }

        // Check if password was changed after refresh token was issued
        if (user.passwordChangedAt) {
          const tokenIat = (jwt.decode(refreshToken) as { iat?: number })?.iat || 0;
          if (user.passwordChangedAt.getTime() / 1000 > tokenIat) {
            res.clearCookie('user_access');
            res.clearCookie('user_refresh');
            throw new AppError('تم تغيير كلمة المرور، يرجى إعادة تسجيل الدخول', 401);
          }
        }

        // Rotate tokens
        const newTokens = generateUserTokens(user._id.toString());
        setUserCookies(res, newTokens);

        decoded = { userId: user._id.toString() };
      } catch (refreshErr) {
        res.clearCookie('user_access');
        res.clearCookie('user_refresh');
        throw new AppError('انتهت جلسة تسجيل الدخول، يرجى إعادة تسجيل الدخول', 401);
      }
    }

    // ── 4. Fetch and validate user ──────────────────────
    const user = await User.findById(decoded.userId).select('_id name email role lockUntil passwordChangedAt');
    if (!user) {
      res.clearCookie('user_access');
      res.clearCookie('user_refresh');
      throw new AppError('المستخدم غير موجود', 401);
    }

    // ── 5. Check account lock ─────────────────────────────
    if (user.isLocked()) {
      throw new AppError(
        `تم إغلاق الحساب حتى ${user.lockUntil?.toISOString()}`,
        423
      );
    }

    // ── 6. Attach user to request ───────────────────────
    (req as any).user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}
