/**
 * app.js
 * Builds (but does not start) the Express application. Importing this module
 * never binds a port, which lets tests drive it via supertest/TestAgent.
 */
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import config from './config.js';
import api from './routes/index.js';
import { reseed } from './db.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.allowedOrigins, credentials: true }));

  // Serve previously uploaded files (mirrors mounted /uploads static dir).
  app.use(
    '/uploads',
    express.static(config.uploadFolder, { maxAge: '1d' })
  );

  app.use(express.json());

  // Root mirror: {"message":"GPS Tracking API"}
  app.get('/', (_req, res) =>
    res.json({ message: `${config.title} (mock)` })
  );

  // Health check with simulated MQTT status.
  app.get('/health', (_req, res) =>
    res.json({
      status: 'healthy',
      mqtt: { status: 'connected', broker: 'mock.local' },
    })
  );

  // Minimal fake Prometheus-metrics text (no real metrics).
  app.get('/metrics', (_req, res) => {
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(
      [
        '# HELP tracker_mock_requests_total Total requests handled by the mock.',
        '# TYPE tracker_mock_requests_total counter',
        `tracker_mock_requests_total 0`,
        '',
      ].join('\n')
    );
  });

  // Dev convenience: reseed the in-memory store with demo data.
  app.post('/reset', (_req, res) => {
    reseed();
    return res.json({ message: 'Mock database reseeded' });
  });

  // All domain routes.
  app.use(api);

  // 404 fallback (FastAPI returns {"detail":"Not Found"}).
  app.use((_req, res) => res.status(404).json({ detail: 'Not Found' }));

  // JSON error fallback.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = status === 413 ? 'File too large' : err.message;
    res.status(status).json({ detail: message });
  });

  return app;
}

export default createApp;
export { path, config };