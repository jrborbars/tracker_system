import { describe, it, expect } from 'vitest';
import { formatMessageTime, isEmergencyMessage } from './chatModel.js';

describe('chatModel domain logic', () => {
  describe('formatMessageTime', () => {
    it('returns formatted HH:mm time string', () => {
      const date = new Date('2026-09-06T14:35:00Z');
      const formatted = formatMessageTime(date.toISOString());
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('returns empty string for missing timestamp', () => {
      expect(formatMessageTime(null)).toBe('');
      expect(formatMessageTime(undefined)).toBe('');
    });
  });

  describe('isEmergencyMessage', () => {
    it('detects emergency by message type', () => {
      expect(isEmergencyMessage({ type: 'sos', content: 'Ajuda' })).toBe(true);
      expect(isEmergencyMessage({ type: 'emergency', content: 'Queda' })).toBe(true);
    });

    it('detects emergency by SOS emoji indicator', () => {
      expect(isEmergencyMessage({ type: 'chat', content: '🚨 Alerta de Queda' })).toBe(true);
    });

    it('returns false for normal messages', () => {
      expect(isEmergencyMessage({ type: 'chat', content: 'Tudo bem por aqui.' })).toBe(false);
      expect(isEmergencyMessage(null)).toBe(false);
    });
  });
});
