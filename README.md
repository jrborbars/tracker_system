# tracker_system — BetterDays Backend Mock

A self-contained **Node + Express** mock of the
[`betterdays_tracker`](https://github.com/jrborbars/tracker_system) FastAPI backend
(`/srv/http/py/betterdays_tracker/backend`). It serves the **same REST endpoints,
JSON shapes, and status codes** as the real backend so a frontend can be developed
and tested without PostgreSQL, MQTT, Argon2, or OpenTelemetry.

> ⚠️ **Security note:** this mock never reads or uses any real backend secret —
> no production `JWT_SECRET_KEY`, no certs, no `.env` values. It signs its own
> tokens with a fake, mock-only secret. All credentials/keys here are demo values.

---

## Quick start

Prerequisites: Node.js `>= 20`.

```bash
npm install
npm start          # listens on http://localhost:8000 (PORT override via env)
```

Then open the demo account:

```bash
curl -s -X POST http://localhost:8000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@betterdays.com","password":"password123"}'
```

**Demo account**

| email | password |
| --- | --- |
| `demo@betterdays.com` | `password123` |

**Static demo JWT** (already signed with the mock secret, valid ~1 year):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGJldHRlcmRheXMuY29tIiwiaWF0IjoxNzg4MzAzMjU1LCJleHAiOjE4MTk4MzkyNTV9.nQNwHkvo7zU500joaCy1l5jw_zlf-qYxcbpojjsvEZg
```

Use it with any protected endpoint:

```bash
curl http://localhost:8000/devices/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vQGJldHRlcmRheXMuY29tIiwiaWF0IjoxNzg4MzAzMjU1LCJleHAiOjE4MTk4MzkyNTV9.nQNwHkvo7zU500joaCy1l5jw_zlf-qYxcbpojjsvEZg"
```

Mint a fresh token for any registered email with `npm run token [-- -e you@x.com]`.

---

## Running the tests

```bash
npm test
```

`test/mock.test.js` (Node's built-in test runner + `supertest`) verifies parity:
login/register, CRUD, status codes (400/401/403/404), ownership isolation, uploads,
and geofencing.

---

## API reference

All responses are JSON; errors use FastAPI's `{"detail": "..."}` shape.

### Meta

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | `{"message":"GPS Tracking API (mock)"}` |
| GET | `/health` | `{"status":"healthy","mqtt":{"status":"connected",...}}` |
| GET | `/metrics` | Minimal fake Prometheus text |
| POST | `/reset` | Reseed the in-memory store with demo data |

### Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | — | Create user `{email,password,name,phone}` → user. Duplicate email ⇒ **400** |
| POST | `/login` | — | `{email,password}` → `{access_token, token_type}`. Bad creds ⇒ **401** |

### Devices (soft delete)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/devices/` | Bearer | List user's active devices |
| POST | `/devices/` | Bearer | Create `{name,description,device_id,type,avatar?}`. Duplicate `device_id` ⇒ **400** |
| PUT | `/devices/:id` | Bearer | Update `{name,description,type,avatar}`. Missing ⇒ **404** |
| DELETE | `/devices/:id` | Bearer | Soft delete (`deleted=1`). Missing ⇒ **404** |

### Areas (secure geofences)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/areas/` | Bearer | All areas for the user |
| GET | `/areas/device/:deviceId` | Bearer | Areas for one device |
| POST | `/areas/:deviceId` | Bearer | Create `{name, points}` for an owned device. Not owned ⇒ **404** |
| PUT | `/areas/:deviceId/:areaId` | Bearer | Update area. Missing ⇒ **404** |
| DELETE | `/areas/:deviceId/:areaId` | Bearer | Delete area. Missing ⇒ **404** |

`points` is an array of `[lng, lat]` pairs (GeoJSON ring).

### Messages

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/messages/` | Bearer | Messages for the user's devices, newest first |
| POST | `/messages/` | Bearer | Create for an owned device `{device_id,message,severity,source,active}`. Not owned ⇒ **404** |
| PUT | `/messages/:id` | Bearer | Update (e.g. `{active:false}`). Missing ⇒ **404**; not owned ⇒ **403** |
| DELETE | `/messages/:id` | Bearer | Delete. Missing ⇒ **404**; not owned ⇒ **403** |

### Upload

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/upload/` | Bearer | Multipart `file` (image/jpeg,png,gif,webp; ≤2&nbsp;MB) → `{filename, url}` |

Uploaded files are served from `/uploads/<userId>/<filename>`.

### Geofencing (service-to-service)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/geofencing/data` | `X-API-Key` | All active devices + areas → `{devices:[{id,device_id,name,areas}]}` |

Demo key: `geofencing-service-key-2024` (mock-only value).

### Parity notes

- Missing `Authorization` header ⇒ **403**; invalid/unknown token ⇒ **401** (matches the
  backend's `HTTPBearer` + `get_current_user`).
- Every query is scoped to the authenticated user's id; devices are soft-deleted.
- Passwords are stored in plaintext **only** for this mock (the real backend uses Argon2).

---

## Configuration

Copy `.env.example` → `.env` and adjust (all mock-only values):

| Var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8000` | Listen port |
| `MOCK_JWT_SECRET` | `change-me-mock-dev-secret` | Mock-only JWT signing secret |
| `MOCK_TELEMETRY` | `0` | `1` = simulate live GPS telemetry (moves devices, appends messages) |
| `MOCK_TELEMETRY_INTERVAL_MS` | `8000` | Telemetry tick interval |
| `MAX_UPLOAD_BYTES` | `2 MB` | Upload size cap |
| `UPLOAD_FOLDER` | `./uploads` | Where uploads are stored/served |
| `MOCK_GEOFENCING_API_KEY` | `geofencing-service-key-2024` | Key for `/geofencing/data` |
| `CORS_ORIGINS` | dev defaults | Comma-separated allowed origins |

---

## Project layout

```
src/
  server.js      # entry point (starts listener)
  app.js         # builds the Express app (no listener) — testable
  config.js      # env config + mock-only secrets
  db.js          # in-memory store + lookups
  seed.js        # demo user / devices / areas / messages
  auth.js        # JWT sign/verify + requireAuth middleware
  telemetry.js   # optional simulated MQTT telemetry
  routes/        # one file per endpoint group
scripts/
  mint-token.mjs # mint a demo JWT
test/
  mock.test.js   # parity tests
```
