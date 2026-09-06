import { describe, it, expect } from 'vitest';
import {
  CALL_STATES,
  CALL_TYPES,
  validateP2PFile,
  formatCallDuration,
  calculateTransferSpeed,
} from './webrtcModel.js';

describe('WebRTC Domain Model & Business Logic', () => {
  it('defines call states and types correctly', () => {
    expect(CALL_STATES.IDLE).toBe('idle');
    expect(CALL_STATES.CONNECTED).toBe('connected');
    expect(CALL_TYPES.AUDIO).toBe('audio');
    expect(CALL_TYPES.VIDEO).toBe('video');
  });

  it('validates small and medium P2P files and calculates 64KB chunks', () => {
    const mockFile = {
      name: 'ecocardiograma_mariana.pdf',
      size: 196608, // 192 KB = exactly 3 chunks of 64 KB
      type: 'application/pdf',
    };

    const validated = validateP2PFile(mockFile);
    expect(validated.name).toBe('ecocardiograma_mariana.pdf');
    expect(validated.totalChunks).toBe(3);
    expect(validated.chunkSize).toBe(65536);
  });

  it('rejects files larger than 100 MB limit', () => {
    const hugeFile = {
      name: 'video_gigante.mp4',
      size: 105 * 1024 * 1024, // 105 MB
      type: 'video/mp4',
    };

    expect(() => validateP2PFile(hugeFile)).toThrowError(/100 MB/);
  });

  it('formats call duration correctly', () => {
    expect(formatCallDuration(0)).toBe('00:00');
    expect(formatCallDuration(45)).toBe('00:45');
    expect(formatCallDuration(125)).toBe('02:05');
    expect(formatCallDuration(3600)).toBe('60:00');
  });

  it('calculates transfer speeds in KB/s and MB/s', () => {
    expect(calculateTransferSpeed(0, 0)).toBe('0 KB/s');
    expect(calculateTransferSpeed(512 * 1024, 2)).toBe('256 KB/s');
    expect(calculateTransferSpeed(4 * 1024 * 1024, 2)).toBe('2.0 MB/s');
  });
});
