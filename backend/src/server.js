/**
 * server.js — entry point that starts the mock HTTP server.
 *
 *   npm start    # start on PORT (default 8000)
 *   npm run dev  # start with auto-reload (node --watch)
 */
import { createApp } from './app.js';
import { config } from './config.js';
import { startTelemetry } from './telemetry.js';

const app = createApp();

startTelemetry();

const server = app.listen(config.port, () => {
  console.log(`Mock backend listening on http://localhost:${config.port}`);
  console.log(`  Root:       http://localhost:${config.port}/`);
  console.log(`  Health:     http://localhost:${config.port}/health`);
  console.log(`  Login:      POST http://localhost:${config.port}/login`);
  console.log(`  Demo login: demo@betterdays.com / password123`);
  console.log(`  Telemetry:  ${config.telemetryEnabled ? 'ON' : 'OFF'} (set MOCK_TELEMETRY=1 to enable)`);
});

export default server;