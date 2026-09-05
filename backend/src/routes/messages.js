/**
 * routes/messages.js
 * GET/POST /messages/, PUT/DELETE /messages/:id.
 * Mirrors the backend's messages router:
 *  - GET scopes to the user's device raw ids.
 *  - POST verifies device ownership => 404 if not owned.
 *  - PUT/DELETE return 404 if missing, 403 ("Access denied") if not owned.
 */
import { Router } from 'express';
import { requireAuth } from '../auth.js';
import {
  store,
  activeDevicesForUser,
  ownedActiveDeviceByRawId,
} from '../db.js';
import { uuid } from '../seed.js';

const router = Router();

// GET /messages/ — messages for the user's active devices, newest first.
router.get('/messages/', requireAuth, (req, res) => {
  const deviceIds = activeDevicesForUser(req.user.id).map((d) => d.device_id);
  if (deviceIds.length === 0) return res.json([]);

  const messages = store.messages
    .filter((m) => deviceIds.includes(m.device_id))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return res.json(messages);
});

// POST /messages/ — create a message for a user-owned device (404 otherwise).
router.post('/messages/', requireAuth, (req, res) => {
  const { device_id, message, severity, source, active } = req.body || {};

  if (!ownedActiveDeviceByRawId(req.user.id, device_id)) {
    return res
      .status(404)
      .json({ detail: 'Device not found or access denied' });
  }

  const created = {
    id: uuid(),
    device_id,
    message,
    severity: severity ?? 'info',
    source: source ?? 'api',
    active: active ?? true,
    timestamp: new Date().toISOString(),
  };
  store.messages.push(created);
  return res.json(created);
});

// shared ownership helper for update/delete
function findOwnedMessage(user, messageId) {
  const msg = store.messages.find((m) => m.id === messageId);
  if (!msg) return { code: 404, detail: 'Message not found' };
  if (!ownedActiveDeviceByRawId(user.id, msg.device_id)) {
    return { code: 403, detail: 'Access denied' };
  }
  return { msg };
}

// PUT /messages/:id — toggle/update, e.g. { "active": false }.
router.put('/messages/:message_id', requireAuth, (req, res) => {
  const found = findOwnedMessage(req.user, req.params.message_id);
  if (found.code) return res.status(found.code).json({ detail: found.detail });

  const { active } = req.body || {};
  if (active !== undefined) found.msg.active = active;
  return res.json(found.msg);
});

// DELETE /messages/:id — remove a message.
router.delete('/messages/:message_id', requireAuth, (req, res) => {
  const found = findOwnedMessage(req.user, req.params.message_id);
  if (found.code) return res.status(found.code).json({ detail: found.detail });

  store.messages.splice(store.messages.indexOf(found.msg), 1);
  return res.json({ message: 'Message deleted successfully' });
});

export default router;