/**
 * subscriptionModel.test.js
 * Testes unitários para regras de domínio de planos e limites.
 */
import { describe, it, expect } from 'vitest';
import {
  SUBSCRIPTION_PLANS,
  canAddDevice,
  canAddGeofence,
  isFeatureAvailable,
  calculateYearlyDiscount,
  formatCurrency,
} from './subscriptionModel.js';

describe('subscriptionModel Domain Rules', () => {
  it('should enforce free plan device limits (max 1)', () => {
    const freeSub = { planId: 'free' };
    expect(canAddDevice(0, freeSub)).toBe(true);
    expect(canAddDevice(1, freeSub)).toBe(false);
    expect(canAddDevice(2, freeSub)).toBe(false);
  });

  it('should enforce family plan device limits (max 3)', () => {
    const familySub = { planId: 'family' };
    expect(canAddDevice(0, familySub)).toBe(true);
    expect(canAddDevice(2, familySub)).toBe(true);
    expect(canAddDevice(3, familySub)).toBe(false);
  });

  it('should enforce clinical plan device limits (max 10)', () => {
    const clinicalSub = { planId: 'clinical' };
    expect(canAddDevice(9, clinicalSub)).toBe(true);
    expect(canAddDevice(10, clinicalSub)).toBe(false);
  });

  it('should check geofence creation limits correctly', () => {
    expect(canAddGeofence(1, { planId: 'free' })).toBe(true);
    expect(canAddGeofence(2, { planId: 'free' })).toBe(false);
    expect(canAddGeofence(50, { planId: 'family' })).toBe(true);
  });

  it('should calculate feature availability per tier', () => {
    expect(isFeatureAvailable('indoor_monitoring', { planId: 'free' })).toBe(false);
    expect(isFeatureAvailable('indoor_monitoring', { planId: 'family' })).toBe(false);
    expect(isFeatureAvailable('indoor_monitoring', { planId: 'clinical' })).toBe(true);

    expect(isFeatureAvailable('unlimited_geofences', { planId: 'free' })).toBe(false);
    expect(isFeatureAvailable('unlimited_geofences', { planId: 'family' })).toBe(true);
  });

  it('should calculate yearly discount percentage', () => {
    const discount = calculateYearlyDiscount(SUBSCRIPTION_PLANS.family);
    expect(discount).toBeGreaterThan(15);
  });

  it('should format currency correctly in BRL', () => {
    const formatted = formatCurrency(29.90);
    expect(formatted).toContain('29,90');
  });
});
