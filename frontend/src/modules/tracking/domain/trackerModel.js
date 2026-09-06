/**
 * trackerModel.js — Modelo e Regras de Domínio para Rastreadores e Telemetria
 */

export function isBatteryCritical(batteryLevel) {
  return typeof batteryLevel === 'number' && batteryLevel <= 20;
}

export function isBatteryLow(batteryLevel) {
  return typeof batteryLevel === 'number' && batteryLevel <= 35;
}

export function getBatteryStatusClass(batteryLevel) {
  if (batteryLevel === undefined || batteryLevel === null) return 'unknown';
  if (batteryLevel <= 20) return 'critical';
  if (batteryLevel <= 35) return 'low';
  if (batteryLevel <= 60) return 'medium';
  return 'good';
}

export function getBatteryStatusColor(batteryLevel) {
  if (batteryLevel === undefined || batteryLevel === null) return '#94A3B8';
  if (batteryLevel <= 20) return '#E53935'; // Coral SOS
  if (batteryLevel <= 35) return '#FB8C00'; // Âmbar Atenção
  if (batteryLevel <= 60) return '#0D9488'; // Teal
  return '#10B981'; // Verde Sucesso
}

export function formatCoordinate(val, type = 'lat') {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const dir = type === 'lat' ? (val >= 0 ? 'N' : 'S') : val >= 0 ? 'E' : 'W';
  return `${Math.abs(val).toFixed(5)}° ${dir}`;
}

export function isDeviceOnline(lastSeenTimestamp, thresholdSeconds = 120) {
  if (!lastSeenTimestamp) return false;
  const last = new Date(lastSeenTimestamp).getTime();
  const now = Date.now();
  return (now - last) / 1000 <= thresholdSeconds;
}
