/**
 * config.js
 * Central configuration for the mock backend.
 *
 * SECURITY NOTE: This mock deliberately uses its OWN fake signing secret.
 * No secrets from the real betterdays_tracker backend are ever read or used
 * here. Real secrets are not required (and should not be) for a mock.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const UPLOAD_FOLDER = path.resolve(
  ROOT,
  process.env.UPLOAD_FOLDER ?? './uploads'
);

function parseFileSize(value) {
  if (typeof value !== 'string') return 2 * 1024 * 1024; // 2 MB default
  const match = value.trim().match(/^(\d+)\s*([kKmMgG])?[bB]?$/);
  if (!match) return 2 * 1024 * 1024;
  const num = parseInt(match[1], 10);
  const unit = (match[2] || '').toLowerCase();
  if (unit === 'k') return num * 1024;
  if (unit === 'm') return num * 1024 * 1024;
  if (unit === 'g') return num * 1024 * 1024 * 1024;
  return num;
}

export const config = {
  port: Number(process.env.PORT || 8000),
  // Mock-only secret. Tokens the mock issues/accepts are signed with this.
  jwtSecret: process.env.MOCK_JWT_SECRET || 'change-me-mock-dev-secret',
  jwtAlgorithm: 'HS256',
  accessTokenExpireMs: 24 * 60 * 60 * 1000, // 1 day, like the real backend
  uploadFolder: UPLOAD_FOLDER,
  maxUploadBytes: parseFileSize(process.env.MAX_UPLOAD_BYTES),
  allowedUploadTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  telemetryEnabled: process.env.MOCK_TELEMETRY === '1',
  telemetryIntervalMs: Number(process.env.MOCK_TELEMETRY_INTERVAL_MS || 8000),
  // Mock-only API key for the /geofencing/data endpoint (mirrors the
  // backend's hardcoded demo key used for service-to-service auth).
  geofencingApiKey: process.env.MOCK_GEOFENCING_API_KEY || 'geofencing-service-key-2024',
  allowedOrigins: (process.env.CORS_ORIGINS || '').split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .concat(['http://localhost:8000', 'http://localhost:5173', 'http://127.0.0.1:8000', 'http://127.0.0.1:5173']),
  version: '1.0.0',
  title: 'GPS Tracking API',
  root: ROOT,
};

// Ensure upload folder exists (mirrors backend main.py behavior).
fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });

export default config;