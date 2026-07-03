// backend/src/utils/generateToken.ts
import jwt from 'jsonwebtoken';
import { Response } from 'express';

// ── Constants ─────────────────────────────────────────────
const ACCESS_MAX_AGE = 4 * 24 * 60 * 60 * 1000; // 4 days in ms
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
} = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  path: '/',
};

// ── User tokens ───────────────────────────────────────────
export function generateUserTokens(userId: string) {
  const userPayload = { userId };
  const userRefreshPayload = { sub: userId, type: 'user_refresh' };

  const accessToken = jwt.sign(
    userPayload,
    process.env.USER_JWT_SECRET!,
    { expiresIn: '4d' } as jwt.SignOptions,
  );

  const refreshToken = jwt.sign(
    userRefreshPayload,
    process.env.USER_JWT_REFRESH_SECRET!,
    { expiresIn: '30d' } as jwt.SignOptions,
  );

  return { accessToken, refreshToken };
}

// ── Admin tokens ──────────────────────────────────────────
export function generateAdminTokens(adminId: string) {
  const adminPayload = { adminId };
  const adminRefreshPayload = { sub: adminId, type: 'admin_refresh' };

  const accessToken = jwt.sign(
    adminPayload,
    process.env.ADMIN_JWT_SECRET!,
    { expiresIn: '4d' } as jwt.SignOptions,
  );

  const refreshToken = jwt.sign(
    adminRefreshPayload,
    process.env.ADMIN_JWT_REFRESH_SECRET!,
    { expiresIn: '30d' } as jwt.SignOptions,
  );

  return { accessToken, refreshToken };
}

// ── Cookie setters ────────────────────────────────────────
export function setUserCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie('user_access', tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_MAX_AGE,
  });
  res.cookie('user_refresh', tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_MAX_AGE,
  });
}

export function setAdminCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie('admin_access', tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_MAX_AGE,
  });
  res.cookie('admin_refresh', tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_MAX_AGE,
  });
}

// ── Cookie clearers ───────────────────────────────────────
export function clearUserCookies(res: Response) {
  res.clearCookie('user_access', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie('user_refresh', { ...COOKIE_OPTIONS, maxAge: 0 });
}

export function clearAdminCookies(res: Response) {
  res.clearCookie('admin_access', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie('admin_refresh', { ...COOKIE_OPTIONS, maxAge: 0 });
}
