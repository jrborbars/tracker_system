import http from 'node:http';
import { createApp } from './app.js';
import { config } from './config.js';
import { startTelemetry } from './telemetry.js';
import { initSocketServer } from './socket.js';

const app = createApp();
const httpServer = http.createServer(app);

// Initialize Socket.io WebSocket Layer
const io = initSocketServer(httpServer);

startTelemetry();

httpServer.listen(config.port, () => {
  console.log(`Mock backend with Socket.io listening on http://localhost:${config.port}`);
  console.log(`  Root:       http://localhost:${config.port}/`);
  console.log(`  Health:     http://localhost:${config.port}/health`);
  console.log(`  Login:      POST http://localhost:${config.port}/login`);
  console.log(`  Demo login: demo@betterdays.com / password123`);
  console.log(`  WebSocket:  Socket.io active on ws://localhost:${config.port}/socket.io/`);
  console.log(`  Telemetry:  ${config.telemetryEnabled ? 'ON' : 'OFF'} (set MOCK_TELEMETRY=1 to enable)`);
});

export default httpServer;
export { io };