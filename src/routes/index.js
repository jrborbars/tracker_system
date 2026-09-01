/**
 * routes/index.js
 * Aggregates all domain routers — mirrors the backend's api_router.
 */
import { Router } from 'express';
import authRouter from './auth.js';
import usersRouter from './users.js';
import devicesRouter from './devices.js';
import areasRouter from './areas.js';
import messagesRouter from './messages.js';
import uploadRouter from './upload.js';
import geofencingRouter from './geofencing.js';

const api = Router();
api.use(authRouter); // POST /register, /login
api.use(usersRouter); // GET/PUT /profile
api.use(devicesRouter); // /devices/*
api.use(areasRouter); // /areas/*
api.use(messagesRouter); // /messages/*
api.use(uploadRouter); // /upload/
api.use(geofencingRouter); // /geofencing/data

export default api;