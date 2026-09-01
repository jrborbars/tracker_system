/**
 * auth.js
 * JWT issuance/verification + Express middleware for protected routes.
 *
 * Parity notes (matching the real FastAPI backend):
 *  - No `Authorization` header => 403 (HTTPBearer returns 403 when missing).
 *  - Invalid/expired token or unknown user => 401.
 *  - Token payload carries `sub` = user email (like the real `create_access_token`).
 */
import jwt from 'jsonwebtoken';
import config from './config.js';
import { findUserByEmail } from './db.js';

export function signToken(user, expiresInMs = config.accessTokenExpireMs) {
  const options = expiresInMs
    ? { algorithm: config.jwtAlgorithm, expiresIn: Math.floor(expiresInMs / 1000) }
    : { algorithm: config.jwtAlgorithm };
  return jwt.sign({ sub: user.email }, config.jwtSecret, options);
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret, {
      algorithms: [config.jwtAlgorithm],
    });
  } catch {
    return null;
  }
}

/**
 * Express middleware. On success attaches `req.user` (the full user record).
 * Mirrors FastAPI's HTTPBearer + get_current_user behavior (403 / 401).
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(403).json({ detail: 'Not authenticated' });
  }

  const token = header.slice('Bearer '.length).trim();
  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  const user = findUserByEmail(payload.sub);
  if (!user) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  req.user = user;
  return next();
}

/** Build the `Authorization` header value for a given user (tests / tooling). */
export function bearerHeader(user, expiresInMs) {
  return `Bearer ${signToken(user, expiresInMs)}`;
}

export default { signToken, verifyToken, requireAuth, bearerHeader };