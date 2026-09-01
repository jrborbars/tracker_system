/**
 * routes/auth.js
 * POST /register and POST /login — mirrors the backend's auth router.
 */
import { Router } from 'express';
import { store, findUserByEmail, publicUser } from '../db.js';
import { uuid } from '../seed.js';
import { signToken } from '../auth.js';

const router = Router();

// POST /register — create a new user. Duplicate email => 400.
router.post('/register', (req, res) => {
  const { email, password, name, phone } = req.body || {};

  if (!email || !password || !name || !phone) {
    return res
      .status(422)
      .json({ detail: 'email, password, name and phone are required' });
  }

  if (findUserByEmail(email)) {
    return res.status(400).json({ detail: 'Email already registered' });
  }

  const user = {
    id: uuid(),
    email,
    name,
    phone,
    // Mock only: plaintext. The real backend stores an Argon2 hash.
    password,
  };
  store.users.push(user);
  return res.json(publicUser(user));
});

// POST /login — validate credentials, return a JWT.
// Bad credentials => 401 (like the backend).
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return res
      .status(401)
      .json({ detail: 'Incorrect email or password' });
  }

  const access_token = signToken(user);
  return res.json({ access_token, token_type: 'bearer' });
});

export default router;