/**
 * mercadoPagoService.js
 * Serviço de integração com o gateway de pagamentos Mercado Pago (PIX, Cartão e Checkout Pro).
 */
import crypto from 'node:crypto';

// Credenciais configuráveis via variáveis de ambiente
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000';
const MP_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || 'TEST-00000000-0000-0000-0000-000000000000';

export const PLANS_CONFIG = {
  free: {
    id: 'free',
    name: 'Gratuito / Essencial',
    priceMonthly: 0,
    priceYearly: 0,
    maxDevices: 1,
    maxGeofences: 2,
    historyDays: 1,
    features: [
      '1 Relógio / Dispositivo Conectado',
      '2 Cercas Virtuais Seguras',
      'Chat de Cuidado Básico',
      'Histórico de 24 Horas',
    ],
  },
  family: {
    id: 'family',
    name: 'Cuidado Familiar',
    priceMonthly: 29.90,
    priceYearly: 299.00, // Economia de 2 meses
    maxDevices: 3,
    maxGeofences: 999, // Ilimitado
    historyDays: 30,
    popular: true,
    features: [
      'Até 3 Relógios / Dispositivos',
      'Cercas Virtuais Ilimitadas',
      'Histórico de 30 Dias de Telemetria e Oximetria',
      'Notificações Nativas e Push Prioritário',
      'Multi-cuidadores na Mesma Conta',
      'Atendimento Prioritário',
    ],
  },
  clinical: {
    id: 'clinical',
    name: 'Clínico & Especialistas',
    priceMonthly: 79.90,
    priceYearly: 799.00,
    maxDevices: 10,
    maxGeofences: 999,
    historyDays: 365,
    features: [
      'Até 10 Relógios / Pacientes Simultâneos',
      'Planta Baixa & Monitoramento Indoor',
      'Exportação de Prontuários em PDF & CSV',
      'Alertas Médicos Críticos com SLA 24/7',
      'Dashboard com Visão Multi-paciente',
    ],
  },
};

/**
 * Cria uma preferência de Checkout do Mercado Pago
 */
export async function createCheckoutPreference({ planId, cycle = 'monthly', user, backUrls = {} }) {
  const plan = PLANS_CONFIG[planId];
  if (!plan) {
    throw new Error(`Plano inválido: ${planId}`);
  }

  const unitPrice = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const preferenceId = `pref_mp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const title = `Betterdays Tracker — Plano ${plan.name} (${cycle === 'yearly' ? 'Anual' : 'Mensal'})`;

  // Em produção, aqui chamaria a API oficial: POST https://api.mercadopago.com/checkout/preferences
  const preferenceData = {
    id: preferenceId,
    items: [
      {
        id: `${plan.id}_${cycle}`,
        title,
        description: `Assinatura de telemetria e monitoramento de saúde do paciente (${cycle === 'yearly' ? '12 meses com desconto' : 'mensal recorrente'})`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: unitPrice,
      },
    ],
    payer: {
      name: user.name || 'Cuidador Familiar',
      email: user.email,
    },
    back_urls: {
      success: backUrls.success || 'http://localhost:5173/?status=success',
      pending: backUrls.pending || 'http://localhost:5173/?status=pending',
      failure: backUrls.failure || 'http://localhost:5173/?status=failure',
    },
    auto_return: 'approved',
    external_reference: JSON.stringify({ userId: user.id, planId, cycle }),
    init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`,
    sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`,
  };

  return preferenceData;
}

/**
 * Cria um pagamento direto via PIX instantâneo do Mercado Pago
 */
export async function createPixPayment({ planId, cycle = 'monthly', user }) {
  const plan = PLANS_CONFIG[planId];
  if (!plan) {
    throw new Error(`Plano inválido: ${planId}`);
  }

  const amount = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const paymentId = `mp_pix_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  // Código Copia-e-Cola PIX padrão Banco Central / Mercado Pago (EMV BR Code)
  const qrCodeText = `00020126580014br.gov.bcb.pix0136${crypto.randomUUID()}520400005303986540${amount.toFixed(2)}5802BR5918BETTERDAYS TRACKER6009SAO PAULO62070503***6304${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  
  // Em produção, aqui chamaria: POST https://api.mercadopago.com/v1/payments com payment_method_id: 'pix'
  return {
    id: paymentId,
    status: 'pending',
    status_detail: 'waiting_transfer',
    transaction_amount: amount,
    date_created: new Date().toISOString(),
    date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
    payment_method_id: 'pix',
    point_of_interaction: {
      type: 'CHECKOUT',
      transaction_data: {
        qr_code: qrCodeText,
        qr_code_base64: '', // QR visual pode ser renderizado no front via canvas/svg
        ticket_url: `https://www.mercadopago.com.br/payments/${paymentId}/ticket`,
      },
    },
    planId,
    cycle,
    userId: user.id,
  };
}

/**
 * Processa a notificação de Webhook enviada pelo Mercado Pago
 */
export function processWebhook(payload) {
  const { action, type, data } = payload || {};
  return {
    received: true,
    action: action || 'payment.updated',
    resourceId: data?.id || 'unknown',
    processedAt: new Date().toISOString(),
  };
}

export default {
  PLANS_CONFIG,
  createCheckoutPreference,
  createPixPayment,
  processWebhook,
};
