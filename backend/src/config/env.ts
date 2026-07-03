// backend/src/config/env.ts
// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// @ts-ignore — import.meta.url is a Node.js ESM runtime feature
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root (two levels up: config/ -> src/ -> backend/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
