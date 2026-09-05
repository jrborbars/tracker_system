/**
 * telemetry.js
 * Optional background "MQTT" simulation. When enabled, it periodically
 * nudges device positions/last_seen and occasionally appends a message —
 * mimicking live GPS telemetry so the frontend feels alive.
 *
 * Completely mock data; there is no real broker connection.
 */
import config from './config.js';
import { store } from './db.js';
import { uuid } from './seed.js';
import { broadcastTelemetryUpdate } from './socket.js';

let timer = null;

const SAMPLE_ALERTS = [
  'Device position updated via periodic telemetry',
  'Heartbeat received',
  'Geofence proximity detected',
  'Battery level stable',
  'Signal strength nominal',
];

function jitter(base, amount) {
  return base + (Math.random() - 0.5) * amount;
}

function tick() {
  const active = store.devices.filter((d) => d.deleted === 0);
  const now = new Date().toISOString();

  for (const device of active) {
    // Nudge location + freshness + battery (small drift).
    if (device.lat !== null && device.lng !== null) {
      device.lat = Number(jitter(device.lat, 0.004).toFixed(6));
      device.lng = Number(jitter(device.lng, 0.004).toFixed(6));
    }
    if (device.battery_level !== null) {
      device.battery_level = Math.max(
        0,
        Math.min(100, Math.round(jitter(device.battery_level, 1)))
      );
    }
    device.last_seen = now;

    // Broadcast live telemetry via Socket.io
    broadcastTelemetryUpdate(device);
  }

  // Occasionally append a message.
  if (active.length && Math.random() < 0.4) {
    const device = active[Math.floor(Math.random() * active.length)];
    store.messages.push({
      id: uuid(),
      device_id: device.device_id,
      message: SAMPLE_ALERTS[Math.floor(Math.random() * SAMPLE_ALERTS.length)],
      severity: ['info', 'info', 'warning'][Math.floor(Math.random() * 3)],
      source: 'mqtt',
      active: true,
      timestamp: now,
    });
  }
}

export function startTelemetry() {
  if (!config.telemetryEnabled || timer) return;
  tick();
  timer = setInterval(tick, config.telemetryIntervalMs);
  // Do not keep the process alive just for the telemetry timer.
  if (timer.unref) timer.unref();
}

export function stopTelemetry() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export default { startTelemetry, stopTelemetry };