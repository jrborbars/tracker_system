/**
 * routes/areas.js
 * GET /areas/, GET /areas/device/:deviceId, POST /areas/:deviceId,
 * PUT/DELETE /areas/:deviceId/:areaId. Mirrors the backend's areas router.
 */
import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { store, ownedActiveDevice } from '../db.js';
import { uuid } from '../seed.js';

const router = Router();

// GET /areas/ — all areas owned by the user.
router.get('/areas/', requireAuth, (req, res) => {
  const areas = store.areas.filter((a) => a.user_id === req.user.id);
  return res.json(areas);
});

// GET /areas/device/:deviceId — areas for one of the user's devices.
router.get('/areas/device/:device_id', requireAuth, (req, res) => {
  const areas = store.areas.filter(
    (a) => a.user_id === req.user.id && a.device_id === req.params.device_id
  );
  return res.json(areas);
});

// POST /areas/:deviceId — create an area for a user-owned device (404 otherwise).
router.post('/areas/:device_id', requireAuth, (req, res) => {
  const device = ownedActiveDevice(req.user.id, req.params.device_id);
  if (!device) {
    return res.status(404).json({ detail: 'Device not found' });
  }

  const { name, points } = req.body || {};
  if (!name || !Array.isArray(points)) {
    return res
      .status(422)
      .json({ detail: 'name and points (array) are required' });
  }

  const area = {
    id: uuid(),
    name,
    points,
    user_id: req.user.id,
    device_id: req.params.device_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.areas.push(area);
  return res.json(area);
});

// PUT /areas/:deviceId/:areaId — update area. Missing => 404.
router.put('/areas/:device_id/:area_id', requireAuth, (req, res) => {
  const area = store.areas.find(
    (a) =>
      a.id === req.params.area_id &&
      a.device_id === req.params.device_id &&
      a.user_id === req.user.id
  );
  if (!area) {
    return res.status(404).json({ detail: 'Area not found' });
  }

  const { name, points } = req.body || {};
  if (name !== undefined) area.name = name;
  if (points !== undefined) area.points = points;
  area.updated_at = new Date().toISOString();
  return res.json(area);
});

// DELETE /areas/:deviceId/:areaId — remove area. Missing => 404.
router.delete('/areas/:device_id/:area_id', requireAuth, (req, res) => {
  const idx = store.areas.findIndex(
    (a) =>
      a.id === req.params.area_id &&
      a.device_id === req.params.device_id &&
      a.user_id === req.user.id
  );
  if (idx === -1) {
    return res.status(404).json({ detail: 'Area not found' });
  }
  store.areas.splice(idx, 1);
  return res.json({ message: 'Area deleted successfully' });
});

export default router;