/**
 * test/mock.test.js
 * Parity tests for the Express mock using Node's built-in test runner +
 * supertest. Verifies the same status codes, JSON shapes and ownership
 * semantics as the real betterdays_tracker backend.
 */
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { reseed, findUserByEmail } from '../src/db.js';
import { signToken } from '../src/auth.js';

const app = createApp();
const DEMO_EMAIL = 'demo@betterdays.com';
const DEMO_PASS = 'password123';

function demoHeaders() {
  const user = findUserByEmail(DEMO_EMAIL);
  return { Authorization: `Bearer ${signToken(user)}` };
}

before(() => reseed());
beforeEach(() => reseed());

// ---- root / meta ---------------------------------------------------------

test('GET / returns the API banner', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.ok(res.body.message.includes('GPS Tracking API'));
});

test('GET /health reports healthy with connected MQTT', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'healthy');
  assert.equal(res.body.mqtt.status, 'connected');
});

test('GET /metrics returns a Prometheus text body', async () => {
  const res = await request(app).get('/metrics');
  assert.equal(res.status, 200);
  assert.match(res.text, /tracker_mock_requests_total/);
});

test('GET /openapi.json returns OpenAPI 3.0 spec', async () => {
  const res = await request(app).get('/openapi.json');
  assert.equal(res.status, 200);
  assert.equal(res.body.openapi, '3.0.3');
  assert.ok(res.body.paths['/devices/']);
  assert.ok(res.body.paths['/subscriptions/plans']);
});

test('GET /docs returns Swagger UI HTML', async () => {
  const res = await request(app).get('/docs');
  assert.equal(res.status, 200);
  assert.match(res.text, /swagger-ui/);
  assert.match(res.text, /Betterdays Tracker/);
});

test('GET /redoc returns ReDoc HTML', async () => {
  const res = await request(app).get('/redoc');
  assert.equal(res.status, 200);
  assert.match(res.text, /redoc/);
});

test('unknown route returns 404 with FastAPI-style detail', async () => {
  const res = await request(app).get('/nope');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { detail: 'Not Found' });
});

// ---- auth ----------------------------------------------------------------

test('POST /register creates a user', async () => {
  const res = await request(app)
    .post('/register')
    .send({
      email: 'new@mock.com',
      password: 'secret123',
      name: 'New Mock User',
      phone: '+1 555 9999',
    });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'new@mock.com');
  assert.equal(res.body.name, 'New Mock User');
  assert.ok(res.body.id);
  assert.equal(res.body.password, undefined);
});

test('POST /register rejects duplicate email with 400', async () => {
  const res = await request(app)
    .post('/register')
    .send({ email: DEMO_EMAIL, password: 'x', name: 'Dup', phone: '1' });
  assert.equal(res.status, 400);
  assert.equal(res.body.detail, 'Email already registered');
});

test('POST /login success returns bearer token', async () => {
  const res = await request(app)
    .post('/login')
    .send({ email: DEMO_EMAIL, password: DEMO_PASS });
  assert.equal(res.status, 200);
  assert.ok(res.body.access_token);
  assert.equal(res.body.token_type, 'bearer');
});

test('POST /login with bad credentials returns 401', async () => {
  const res = await request(app)
    .post('/login')
    .send({ email: DEMO_EMAIL, password: 'wrong' });
  assert.equal(res.status, 401);
  assert.equal(res.body.detail, 'Incorrect email or password');
});

// ---- protected routes: missing header => 403, invalid token => 401 -------

test('protected route without header returns 403', async () => {
  const res = await request(app).get('/devices/');
  assert.equal(res.status, 403);
});

test('protected route with invalid token returns 401', async () => {
  const res = await request(app)
    .get('/devices/')
    .set('Authorization', 'Bearer not.a.jwt');
  assert.equal(res.status, 401);
});

test('protected route with unknown subject returns 401', async () => {
  const bad = jwt.sign(
    { sub: 'ghost@mock.com' },
    'change-me-mock-dev-secret',
    { algorithm: 'HS256' }
  );
  const res = await request(app)
    .get('/devices/')
    .set('Authorization', `Bearer ${bad}`);
  assert.equal(res.status, 401);
});

// ---- users ----------------------------------------------------------------

test('GET /profile returns the current user', async () => {
  const res = await request(app).get('/profile').set(demoHeaders());
  assert.equal(res.status, 200);
  assert.equal(res.body.email, DEMO_EMAIL);
  assert.equal(res.body.password, undefined);
});

test('PUT /profile updates the user', async () => {
  const res = await request(app)
    .put('/profile')
    .set(demoHeaders())
    .send({ name: 'Demo Updated', phone: '+1 555 0001' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Demo Updated');
  assert.equal(res.body.phone, '+1 555 0001');
});

// ---- devices --------------------------------------------------------------

test('GET /devices/ lists demo devices', async () => {
  const res = await request(app).get('/devices/').set(demoHeaders());
  assert.equal(res.status, 200);
  assert.ok(res.body.length >= 2);
  assert.ok(res.body.every((d) => d.deleted === undefined || d.deleted === 0));
});

test('POST /devices/ creates a device', async () => {
  const res = await request(app)
    .post('/devices/')
    .set(demoHeaders())
    .send({
      name: 'Cargo Drone',
      description: 'Aerial delivery unit',
      device_id: 'DRONE-001',
      type: 'drone',
    });
  assert.equal(res.status, 200);
  assert.equal(res.body.device_id, 'DRONE-001');
  assert.equal(res.body.user_id, findUserByEmail(DEMO_EMAIL).id);
});

test('POST /devices/ rejects duplicate device_id with 400', async () => {
  const res = await request(app)
    .post('/devices/')
    .set(demoHeaders())
    .send({
      name: 'Dup',
      description: 'dup',
      device_id: 'WATCH-7492', // exists in seed
      type: 'gps-tracker',
    });
  assert.equal(res.status, 400);
  assert.equal(res.body.detail, 'Device ID already exists');
});

test('PUT /devices/:id updates a device', async () => {
  const list = await request(app).get('/devices/').set(demoHeaders());
  const id = list.body[0].id;
  const res = await request(app)
    .put(`/devices/${id}`)
    .set(demoHeaders())
    .send({ name: 'Renamed Van', avatar: '/uploads/x/a.jpg' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Renamed Van');
  assert.equal(res.body.avatar, '/uploads/x/a.jpg');
});

test('PUT /devices/:id missing device returns 404', async () => {
  const res = await request(app).put('/devices/nope').set(demoHeaders()).send({ name: 'x' });
  assert.equal(res.status, 404);
});

test('DELETE /devices/:id soft-deletes (disappears from list)', async () => {
  const list = await request(app).get('/devices/').set(demoHeaders());
  const beforeCount = list.body.length;
  const id = list.body[0].id;

  const del = await request(app).delete(`/devices/${id}`).set(demoHeaders());
  assert.equal(del.status, 200);
  assert.equal(del.body.message, 'Device deleted successfully');

  const after = await request(app).get('/devices/').set(demoHeaders());
  assert.equal(after.body.length, beforeCount - 1);
  assert.ok(!after.body.some((d) => d.id === id));
});

// ---- areas -----------------------------------------------------------------

test('GET /areas/ lists demo areas', async () => {
  const res = await request(app).get('/areas/').set(demoHeaders());
  assert.equal(res.status, 200);
  assert.ok(res.body.length >= 2);
  assert.ok(res.body[0].points.length >= 4);
});

test('GET /areas/device/:id filters by device', async () => {
  const list = await request(app).get('/devices/').set(demoHeaders());
  const deviceId = list.body[0].id;
  const res = await request(app).get(`/areas/device/${deviceId}`).set(demoHeaders());
  assert.equal(res.status, 200);
  assert.ok(res.body.every((a) => a.device_id === deviceId));
});

test('POST /areas/:deviceId creates an area', async () => {
  const list = await request(app).get('/devices/').set(demoHeaders());
  const deviceId = list.body[0].id;
  const res = await request(app)
    .post(`/areas/${deviceId}`)
    .set(demoHeaders())
    .send({ name: 'New Zone', points: [[0, 0], [1, 0], [1, 1], [0, 0]] });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'New Zone');
  assert.equal(res.body.device_id, deviceId);
});

test('POST /areas/:deviceId unknown device returns 404', async () => {
  const res = await request(app)
    .post('/areas/unknown-device')
    .set(demoHeaders())
    .send({ name: 'x', points: [] });
  assert.equal(res.status, 404);
});

test('PUT DELETE /areas/:deviceId/:areaId work + 404 for missing', async () => {
  const areas = await request(app).get('/areas/').set(demoHeaders());
  const area = areas.body[0];

  const put = await request(app)
    .put(`/areas/${area.device_id}/${area.id}`)
    .set(demoHeaders())
    .send({ name: 'Renamed Zone' });
  assert.equal(put.status, 200);
  assert.equal(put.body.name, 'Renamed Zone');

  const del = await request(app)
    .delete(`/areas/${area.device_id}/${area.id}`)
    .set(demoHeaders());
  assert.equal(del.status, 200);
  assert.equal(del.body.message, 'Area deleted successfully');

  const missing = await request(app)
    .put(`/areas/${area.device_id}/nope`)
    .set(demoHeaders())
    .send({ name: 'x' });
  assert.equal(missing.status, 404);
});

// ---- messages ----------------------------------------------------------------

test('GET /messages/ returns demo messages', async () => {
  const res = await request(app).get('/messages/').set(demoHeaders());
  assert.equal(res.status, 200);
  assert.ok(res.body.length >= 1);
});

test('POST /messages/ for owned device creates message', async () => {
  const res = await request(app)
    .post('/messages/')
    .set(demoHeaders())
    .send({
      device_id: 'WATCH-7492',
      message: 'Manual note',
      severity: 'info',
      source: 'api',
      active: true,
    });
  assert.equal(res.status, 200);
  assert.equal(res.body.device_id, 'WATCH-7492');
  assert.equal(res.body.message, 'Manual note');
});

test('POST /messages/ for unowned device returns 404', async () => {
  const res = await request(app)
    .post('/messages/')
    .set(demoHeaders())
    .send({
      device_id: 'ALIEN-999',
      message: 'x',
      severity: 'info',
      source: 'api',
      active: true,
    });
  assert.equal(res.status, 404);
});

test('PUT /messages/:id updates active flag', async () => {
  const list = await request(app).get('/messages/').set(demoHeaders());
  const msg = list.body[0];
  const res = await request(app)
    .put(`/messages/${msg.id}`)
    .set(demoHeaders())
    .send({ active: false });
  assert.equal(res.status, 200);
  assert.equal(res.body.active, false);
});

test('DELETE /messages/:id removes the message', async () => {
  const list = await request(app).get('/messages/').set(demoHeaders());
  const msg = list.body[0];
  const res = await request(app).delete(`/messages/${msg.id}`).set(demoHeaders());
  assert.equal(res.status, 200);
});

// ---- upload ---------------------------------------------------------------

test('POST /upload/ with valid image returns url', async () => {
  const res = await request(app)
    .post('/upload/')
    .set(demoHeaders())
    .attach('file', Buffer.from('fake-png-bytes'), {
      filename: 'pic.png',
      contentType: 'image/png',
    });
  assert.equal(res.status, 200);
  assert.ok(res.body.url.startsWith('/uploads/'));
  assert.ok(res.body.filename);
});

test('POST /upload/ with disallowed type returns 400', async () => {
  const res = await request(app)
    .post('/upload/')
    .set(demoHeaders())
    .attach('file', Buffer.from('hello'), {
      filename: 'a.txt',
      contentType: 'text/plain',
    });
  assert.equal(res.status, 400);
  assert.equal(res.body.detail, 'File type not allowed');
});

// ---- geofencing ----------------------------------------------------------

test('GET /geofencing/data without key returns 401', async () => {
  const res = await request(app).get('/geofencing/data');
  assert.equal(res.status, 401);
});

test('GET /geofencing/data with key returns devices+areas', async () => {
  const res = await request(app)
    .get('/geofencing/data')
    .set('X-API-Key', 'geofencing-service-key-2024');
  assert.equal(res.status, 200);
  assert.ok(res.body.devices.length >= 1);
  assert.ok('areas' in res.body.devices[0]);
});