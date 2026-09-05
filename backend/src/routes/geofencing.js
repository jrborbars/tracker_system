/**
 * routes/geofencing.js
 * GET /geofencing/data — service-to-service endpoint for the geofencing
 * daemon. Requires X-API-Key: <geofencingApiKey> (mock-only value).
 * Mirrors the backend's geofencing router.
 */
import { Router } from 'express';
import config from '../config.js';
import { store } from '../db.js';

const router = Router();

router.get('/geofencing/data', (req, res) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== config.geofencingApiKey) {
    return res.status(401).json({ detail: 'Invalid API key' });
  }

  const active = store.devices.filter((d) => d.deleted === 0);
  const devices = active.map((device) => ({
    id: device.id,
    device_id: device.device_id,
    name: device.name,
    areas: store.areas
      .filter((a) => a.device_id === device.id)
      .map((a) => ({ id: a.id, name: a.name, points: a.points })),
  }));

  return res.json({ devices });
});

export default router;