import { describe, it, expect } from 'vitest';
import {
  isBatteryCritical,
  isBatteryLow,
  getBatteryStatusClass,
  getBatteryStatusColor,
  formatCoordinate,
  isDeviceOnline,
} from './trackerModel.js';

describe('trackerModel domain logic', () => {
  describe('Battery level classification', () => {
    it('correctly identifies critical and low battery levels', () => {
      expect(isBatteryCritical(15)).toBe(true);
      expect(isBatteryCritical(20)).toBe(true);
      expect(isBatteryCritical(21)).toBe(false);

      expect(isBatteryLow(30)).toBe(true);
      expect(isBatteryLow(35)).toBe(true);
      expect(isBatteryLow(36)).toBe(false);
    });

    it('returns appropriate CSS class names for battery brackets', () => {
      expect(getBatteryStatusClass(null)).toBe('unknown');
      expect(getBatteryStatusClass(15)).toBe('critical');
      expect(getBatteryStatusClass(30)).toBe('low');
      expect(getBatteryStatusClass(50)).toBe('medium');
      expect(getBatteryStatusClass(85)).toBe('good');
    });

    it('returns valid hex color tokens for UI battery gauges', () => {
      expect(getBatteryStatusColor(15)).toBe('#E53935');
      expect(getBatteryStatusColor(30)).toBe('#FB8C00');
      expect(getBatteryStatusColor(50)).toBe('#0D9488');
      expect(getBatteryStatusColor(90)).toBe('#10B981');
      expect(getBatteryStatusColor(null)).toBe('#94A3B8');
    });
  });

  describe('formatCoordinate', () => {
    it('formats latitude with N/S hemisphere labels', () => {
      expect(formatCoordinate(-23.5505, 'lat')).toBe('23.55050° S');
      expect(formatCoordinate(40.7128, 'lat')).toBe('40.71280° N');
    });

    it('formats longitude with E/W hemisphere labels', () => {
      expect(formatCoordinate(-46.6333, 'lng')).toBe('46.63330° W');
      expect(formatCoordinate(12.4964, 'lng')).toBe('12.49640° E');
    });

    it('handles invalid or empty coordinates gracefully', () => {
      expect(formatCoordinate(null)).toBe('—');
      expect(formatCoordinate(undefined)).toBe('—');
      expect(formatCoordinate(NaN)).toBe('—');
    });
  });

  describe('isDeviceOnline', () => {
    it('returns true if device reported within threshold', () => {
      const recentTimestamp = new Date(Date.now() - 30 * 1000).toISOString();
      expect(isDeviceOnline(recentTimestamp, 120)).toBe(true);
    });

    it('returns false if device report is stale', () => {
      const oldTimestamp = new Date(Date.now() - 300 * 1000).toISOString();
      expect(isDeviceOnline(oldTimestamp, 120)).toBe(false);
    });

    it('returns false if lastSeen is missing', () => {
      expect(isDeviceOnline(null)).toBe(false);
    });
  });
});
