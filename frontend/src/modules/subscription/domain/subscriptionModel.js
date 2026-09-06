/**
 * subscriptionModel.js — Modelo de Domínio para Planos de Assinatura e SaaS
 * Regras de limites de uso, cálculo de preços por ciclo e verificação de recursos.
 */

export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    key: 'free',
    name: 'Gratuito / Essencial',
    priceMonthly: 0,
    priceYearly: 0,
    maxDevices: 1,
    maxGeofences: 2,
    historyDays: 1,
    tier: 1,
  },
  family: {
    id: 'family',
    key: 'family',
    name: 'Cuidado Familiar',
    priceMonthly: 29.90,
    priceYearly: 299.00,
    maxDevices: 3,
    maxGeofences: 999,
    historyDays: 30,
    popular: true,
    tier: 2,
  },
  clinical: {
    id: 'clinical',
    key: 'clinical',
    name: 'Clínico & Especialistas',
    priceMonthly: 79.90,
    priceYearly: 799.00,
    maxDevices: 10,
    maxGeofences: 999,
    historyDays: 365,
    tier: 3,
  },
};

/**
 * Calcula a economia percentual ao assinar o plano anual
 */
export function calculateYearlyDiscount(plan) {
  if (!plan || !plan.priceMonthly || !plan.priceYearly) return 0;
  const fullYearPrice = plan.priceMonthly * 12;
  const savings = ((fullYearPrice - plan.priceYearly) / fullYearPrice) * 100;
  return Math.round(savings);
}

/**
 * Formata valor monetário para o padrão BRL (R$ 29,90)
 */
export function formatCurrency(amount, currency = 'BRL', locale = 'pt-BR') {
  if (typeof amount !== 'number' || isNaN(amount)) return 'R$ 0,00';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Verifica se o usuário pode adicionar mais um dispositivo baseado no plano atual
 */
export function canAddDevice(currentDevicesCount = 0, subscription = null) {
  const planId = subscription?.planId || 'free';
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
  return currentDevicesCount < plan.maxDevices;
}

/**
 * Verifica se o usuário pode criar mais uma cerca virtual
 */
export function canAddGeofence(currentGeofencesCount = 0, subscription = null) {
  const planId = subscription?.planId || 'free';
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
  return currentGeofencesCount < plan.maxGeofences;
}

/**
 * Verifica se um recurso específico está disponível no plano
 */
export function isFeatureAvailable(featureKey, subscription = null) {
  const planId = subscription?.planId || 'free';
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;

  switch (featureKey) {
    case 'indoor_monitoring':
    case 'export_reports':
    case 'sla_priority':
      return plan.tier >= 3;
    case 'unlimited_geofences':
    case 'priority_push':
    case 'multi_caregivers':
    case 'history_30_days':
      return plan.tier >= 2;
    default:
      return true;
  }
}
