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
  const {
    email,
    name,
    phone,
    password,
    photo_url,
    emergency_contact,
    patient_diagnosis,
    doctor_contact,
    hospital_reference,
  } = req.body || {};

  if (email !== undefined) req.user.email = email;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (password && typeof password === 'string' && password.trim().length > 0) {
    req.user.password = password.trim();
  }
  if (photo_url !== undefined) req.user.photo_url = photo_url;
  if (emergency_contact !== undefined) req.user.emergency_contact = emergency_contact;
  if (patient_diagnosis !== undefined) req.user.patient_diagnosis = patient_diagnosis;
  if (doctor_contact !== undefined) req.user.doctor_contact = doctor_contact;
  if (hospital_reference !== undefined) req.user.hospital_reference = hospital_reference;

  return res.json(publicUser(req.user));
});

export default router;