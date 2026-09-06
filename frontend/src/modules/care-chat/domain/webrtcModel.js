/**
 * webrtcModel.js — Domain entities & business rules for WebRTC P2P calls & file transfers
 */

export const CALL_STATES = {
  IDLE: 'idle',
  DIALING: 'dialing',
  INCOMING: 'incoming',
  CONNECTED: 'connected',
  ENDED: 'ended',
};

export const CALL_TYPES = {
  AUDIO: 'audio',
  VIDEO: 'video',
};

/**
 * Valida metadados de arquivo para transferência P2P
 */
export function validateP2PFile(file) {
  if (!file) throw new Error('Arquivo não fornecido.');
  const MAX_SIZE = 100 * 1024 * 1024; // 100 MB limite P2P
  if (file.size > MAX_SIZE) {
    throw new Error('Tamanho máximo permitido para transferência P2P é 100 MB.');
  }

  const CHUNK_SIZE = 64 * 1024;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  return {
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    totalChunks,
    chunkSize: CHUNK_SIZE,
  };
}

/**
 * Formata duração de chamada em MM:SS
 */
export function formatCallDuration(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calcula taxa de transferência P2P em KB/s
 */
export function calculateTransferSpeed(bytesTransferred, elapsedSeconds) {
  if (!elapsedSeconds || elapsedSeconds <= 0) return '0 KB/s';
  const kbs = bytesTransferred / 1024 / elapsedSeconds;
  if (kbs > 1024) {
    return `${(kbs / 1024).toFixed(1)} MB/s`;
  }
  return `${Math.round(kbs)} KB/s`;
}
