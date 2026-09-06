import { describe, it, expect } from 'vitest';
import {
  formatWhatsAppNumber,
  getUserInitials,
  getAbsolutePhotoUrl,
} from './profileModel.js';

describe('profileModel domain logic', () => {
  describe('formatWhatsAppNumber', () => {
    it('formats 11 digit Brazilian phone numbers correctly', () => {
      expect(formatWhatsAppNumber('11987654321')).toBe('(11) 98765-4321');
      expect(formatWhatsAppNumber('(11) 98765-4321')).toBe('(11) 98765-4321');
    });

    it('formats 10 digit Brazilian landline numbers correctly', () => {
      expect(formatWhatsAppNumber('1133334444')).toBe('(11) 3333-4444');
    });

    it('handles empty or non-standard inputs gracefully', () => {
      expect(formatWhatsAppNumber('')).toBe('');
      expect(formatWhatsAppNumber(null)).toBe('');
      expect(formatWhatsAppNumber('123')).toBe('123');
    });
  });

  describe('getUserInitials', () => {
    it('returns two initials for full names', () => {
      expect(getUserInitials('Vagner Ribas')).toBe('VR');
      expect(getUserInitials('Maria Silva Souza')).toBe('MS');
    });

    it('returns first two letters for single names', () => {
      expect(getUserInitials('Carlos')).toBe('CA');
    });

    it('returns default initial for empty or invalid names', () => {
      expect(getUserInitials('')).toBe('U');
      expect(getUserInitials(null)).toBe('U');
    });
  });

  describe('getAbsolutePhotoUrl', () => {
    it('returns null if no photo url is provided', () => {
      expect(getAbsolutePhotoUrl(null)).toBeNull();
      expect(getAbsolutePhotoUrl('')).toBeNull();
    });

    it('returns untouched url if it is already http or data-uri', () => {
      expect(getAbsolutePhotoUrl('https://example.com/avatar.jpg')).toBe(
        'https://example.com/avatar.jpg'
      );
      expect(getAbsolutePhotoUrl('data:image/png;base64,...')).toBe(
        'data:image/png;base64,...'
      );
    });

    it('prepends base url for relative backend upload paths', () => {
      expect(getAbsolutePhotoUrl('/uploads/users/avatar.jpg')).toBe(
        'http://localhost:8000/uploads/users/avatar.jpg'
      );
    });
  });
});
