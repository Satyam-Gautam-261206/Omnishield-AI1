import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve .env relative to the project root (up 2 directories from src/config)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 8000,
  jwtSecret: process.env.JWT_SECRET || 'super_secret_key_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  claudeApiKey: process.env.CLAUDE_API_KEY || ''
};