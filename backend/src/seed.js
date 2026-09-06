/**
 * seed.js
 * Demo data used to populate the in-memory store so the mock returns
 * something meaningful immediately (mirrors the "demo account" idea while
 * using mock-only credentials).
 */

let counter = 0;
export function uuid() {
  // Simple UUIDv4-ish for the mock (group 4 variant, v7-style not required).
  counter = (counter + 1) % 0xfff;
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// Global output is replaced entirely by db.reseed() which calls this.
export function buildSeed() {
  const now = Date.now();
  const iso = (offsetMs = 0) => new Date(now - offsetMs).toISOString();

  const userId = uuid();
  const deviceAId = uuid();
  const deviceBId = uuid();

  return {
    users: [
      {
        id: userId,
        email: 'demo@betterdays.com',
        name: 'Demo User',
        phone: '+1 555 0100',
        // Mock-only secure demo password to avoid browser password leak alerts
        password: 'bdCare2026!Demo',
      },
    ],
    devices: [
      {
        id: deviceAId,
        name: 'Relógio do Vô João',
        description: 'Paciente com Síndrome de Eisenmenger. Relógio no pulso esquerdo com monitoramento de batimentos e GPS ativo.',
        device_id: 'WATCH-7492',
        pairing_token: 'BD-7492',
        wear_mode: 'pulso',
        type: 'relogio-pulso',
        heart_rate: 74,
        fall_detection: true,
        last_seen: iso(2 * 60 * 1000),
        lat: -23.5505,
        lng: -46.6333,
        battery_level: 87,
        avatar: null,
        deleted: 0,
        user_id: userId,
      },
      {
        id: deviceBId,
        name: 'Clip da Dona Maria',
        description: 'Fixado na roupa/cinto. Monitoramento de passos, detecção de queda e cerca perimetral.',
        device_id: 'CLIP-3810',
        pairing_token: 'BD-3810',
        wear_mode: 'roupa',
        type: 'relogio-clip',
        heart_rate: 68,
        fall_detection: true,
        last_seen: iso(12 * 60 * 1000),
        lat: -23.5612,
        lng: -46.6564,
        battery_level: 63,
        avatar: null,
        deleted: 0,
        user_id: userId,
      },
    ],
    areas: [
      {
        id: uuid(),
        name: 'Depot Perimeter',
        // GeoJSON-style polygon ring: array of [lng, lat] pairs.
        points: [[-46.6355, -23.551], [-46.632, -23.552], [-46.631, -23.55], [-46.634, -23.549], [-46.6355, -23.551]],
        user_id: userId,
        device_id: deviceAId,
        created_at: iso(20 * 24 * 60 * 60 * 1000),
        updated_at: iso(3 * 24 * 60 * 60 * 1000),
      },
      {
        id: uuid(),
        name: 'Loading Bay Zone',
        points: [[-46.634, -23.5508], [-46.633, -23.551], [-46.633, -23.5505], [-46.634, -23.5503], [-46.634, -23.5508]],
        user_id: userId,
        device_id: deviceAId,
        created_at: iso(18 * 24 * 60 * 60 * 1000),
        updated_at: iso(2 * 24 * 60 * 60 * 1000),
      },
    ],
    messages: [
      {
        id: uuid(),
        device_id: 'WATCH-7492',
        message: 'Device entered geofence: Depot Perimeter',
        severity: 'info',
        source: 'geofencing',
        active: true,
        timestamp: iso(15 * 60 * 1000),
      },
      {
        id: uuid(),
        device_id: 'WATCH-7492',
        message: 'Low battery warning (below 20%)',
        severity: 'warning',
        source: 'mqtt',
        active: true,
        timestamp: iso(45 * 60 * 1000),
      },
      {
        id: uuid(),
        device_id: 'CLIP-3810',
        message: 'Device reported an anomaly: speed out of range',
        severity: 'error',
        source: 'api',
        active: true,
        timestamp: iso(3 * 60 * 60 * 1000),
      },
    ],
  };
}