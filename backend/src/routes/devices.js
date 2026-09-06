/**
 * routes/devices.js
 * GET/POST /devices/, PUT/DELETE /devices/:id (soft delete).
 * Mirrors the backend's devices router (JWT required).
 */
import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { store, activeDevicesForUser, ownedActiveDevice } from '../db.js';
import { uuid } from '../seed.js';

const router = Router();

// GET /devices/ — list the user's active (non soft-deleted) devices.
router.get('/devices/', requireAuth, (req, res) => {
  return res.json(activeDevicesForUser(req.user.id));
});

// POST /devices/ — create a device. Duplicate device_id => 400.
router.post('/devices/', requireAuth, (req, res) => {
  const { name, description, device_id, type, avatar, pairing_token, wear_mode, heart_rate, fall_detection } = req.body || {};

  if (!name || !description || !device_id || !type) {
    return res
      .status(422)
      .json({ detail: 'name, description, device_id and type are required' });
  }

  if (store.devices.some((d) => d.device_id === device_id && !d.deleted)) {
    return res.status(400).json({ detail: 'Device ID already exists' });
  }

  const device = {
    id: uuid(),
    name,
    description,
    device_id,
    pairing_token: pairing_token || `BD-${Math.floor(1000 + Math.random() * 9000)}`,
    wear_mode: wear_mode || (type.includes('clip') ? 'roupa' : 'pulso'),
    type,
    heart_rate: heart_rate || 72,
    fall_detection: fall_detection !== undefined ? fall_detection : true,
    last_seen: new Date().toISOString(),
    lat: -23.5505 + (Math.random() - 0.5) * 0.01,
    lng: -46.6333 + (Math.random() - 0.5) * 0.01,
    battery_level: 95,
    avatar: avatar ?? null,
    deleted: 0,
    user_id: req.user.id,
  };
  store.devices.push(device);
  return res.json(device);
});

// PUT /devices/:id — update fields. Missing device => 404.
router.put('/devices/:device_id', requireAuth, (req, res) => {
  const device = ownedActiveDevice(req.user.id, req.params.device_id);
  if (!device) {
    return res.status(404).json({ detail: 'Device not found' });
  }

  const { name, description, type, avatar } = req.body || {};
  if (name !== undefined) device.name = name;
  if (description !== undefined) device.description = description;
  if (type !== undefined) device.type = type;
  if (avatar !== undefined) device.avatar = avatar;
  return res.json(device);
});

// DELETE /devices/:id — soft delete (deleted = 1). Missing device => 404.
router.delete('/devices/:device_id', requireAuth, (req, res) => {
  const device = ownedActiveDevice(req.user.id, req.params.device_id);
  if (!device) {
    return res.status(404).json({ detail: 'Device not found' });
  }
  device.deleted = 1;
  return res.json({ message: 'Device deleted successfully' });
});

export default router;