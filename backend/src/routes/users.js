/**
 * routes/users.js
 * GET/PUT /profile — mirrors the backend's users router (JWT required).
 */
import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { publicUser } from '../db.js';

const router = Router();

router.get('/profile', requireAuth, (req, res) => {
  return res.json(publicUser(req.user));
});

router.put('/profile', requireAuth, (req, res) => {
  const { email, name, phone } = req.body || {};
  if (email !== undefined) req.user.email = email;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  return res.json(publicUser(req.user));
});

export default router;