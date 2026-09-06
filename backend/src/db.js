/**
 * db.js
 * In-memory data store for the mock. Provides the same conceptual entities
 * as the real backend (User, Device with soft-delete, Area, Message) but
 * backed by plain arrays — there is no persistence and no database.
 */
import { buildSeed } from './seed.js';

export const store = {
  users: [],
  devices: [],
  areas: [],
  messages: [],
};

export function reseed() {
  const data = buildSeed();
  store.users = data.users;
  store.devices = data.devices;
  store.areas = data.areas;
  store.messages = data.messages;
  return data;
}

reseed();

// ---- lookups ------------------------------------------------------------

export function findUserByEmail(email) {
  return store.users.find((u) => u.email === email);
}

export function findUserById(id) {
  return store.users.find((u) => u.id === id);
}

/**
 * Active (non soft-deleted) devices owned by a user — mirrors the backend's
 * `filter(Device.user_id == id, Device.deleted == 0)`.
 */
export function activeDevicesForUser(userId) {
  return store.devices.filter((d) => d.user_id === userId && d.deleted === 0);
}

export function ownedActiveDevice(userId, deviceId) {
  return store.devices.find(
    (d) => d.user_id === userId && d.id === deviceId && d.deleted === 0
  );
}

/**
 * Raw device_id (the string field, e.g. "TRCK-10001") owned by a user,
 * used by the messages endpoints — mirrors Message filtering on the device
 * string while scoping to user-owned devices.
 */
export function ownedActiveDeviceByRawId(userId, rawDeviceId) {
  return store.devices.find(
    (d) => d.user_id === userId && d.device_id === rawDeviceId && d.deleted === 0
  );
}

/** Serialize a user, always stripping the (mock) password field. */
export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    photo_url: user.photo_url || null,
    emergency_contact: user.emergency_contact || null,
    patient_diagnosis: user.patient_diagnosis || null,
    doctor_contact: user.doctor_contact || null,
    hospital_reference: user.hospital_reference || null,
  };
}

export default store;