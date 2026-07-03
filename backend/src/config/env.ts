// backend/src/config/env.ts
// Load environment variables FIRST before any other imports

import dotenv from 'dotenv';
import path from 'path';

// __dirname is available globally in CommonJS mode
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Validate required vars
const required = ['USER_DB_URI', 'USER_JWT_SECRET', 'CLIENT_URL', 'NODE_ENV'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV!,
  mongoUri: process.env.USER_DB_URI!,
  jwtSecret: process.env.USER_JWT_SECRET!,
  clientUrl: process.env.CLIENT_URL!,
};
