/**
 * routes/subscriptions.js
 * Endpoints REST para planos de assinatura e integração com Mercado Pago.
 */
import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { store, findUserById } from '../db.js';
import mercadoPagoService, { PLANS_CONFIG } from '../services/mercadoPagoService.js';

const router = Router();

/**
 * GET /subscriptions/plans
 * Retorna todos os planos disponíveis, preços e recursos
 */
router.get('/subscriptions/plans', (_req, res) => {
  return res.json({
    plans: Object.values(PLANS_CONFIG),
    currency: 'BRL',
    supportedPaymentMethods: ['pix', 'credit_card', 'mercado_pago_checkout'],
  });
});

/**
 * GET /subscriptions/current
 * Retorna a assinatura ativa do usuário autenticado e seus limites
 */
router.get('/subscriptions/current', requireAuth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ detail: 'Usuário não encontrado' });
  }

  const subscription = user.subscription || {
    planId: 'free',
    planName: PLANS_CONFIG.free.name,
    status: 'active',
    cycle: 'monthly',
    maxDevices: PLANS_CONFIG.free.maxDevices,
    maxGeofences: PLANS_CONFIG.free.maxGeofences,
    historyDays: PLANS_CONFIG.free.historyDays,
    expiresAt: null,
  };

  const userDevicesCount = store.devices.filter((d) => d.user_id === user.id && !d.deleted).length;
  const userAreasCount = store.areas.filter((a) => a.user_id === user.id).length;

  return res.json({
    subscription,
    usage: {
      devicesCount: userDevicesCount,
      devicesLimit: subscription.maxDevices,
      areasCount: userAreasCount,
      areasLimit: subscription.maxGeofences,
    },
  });
});

/**
 * POST /subscriptions/create-preference
 * Cria uma transação de pagamento no Mercado Pago (PIX ou Checkout Pro)
 */
router.post('/subscriptions/create-preference', requireAuth, async (req, res) => {
  const { planId, cycle = 'monthly', paymentType = 'pix', backUrls } = req.body;

  if (!PLANS_CONFIG[planId]) {
    return res.status(400).json({ detail: `Plano inválido: ${planId}` });
  }

  try {
    if (paymentType === 'pix') {
      const pixPayment = await mercadoPagoService.createPixPayment({
        planId,
        cycle,
        user: req.user,
      });
      return res.json({
        type: 'pix',
        payment: pixPayment,
      });
    }

    // Checkout Pro Padrão
    const preference = await mercadoPagoService.createCheckoutPreference({
      planId,
      cycle,
      user: req.user,
      backUrls,
    });

    return res.json({
      type: 'checkout_pro',
      preference,
    });
  } catch (err) {
    console.error('Erro ao gerar pagamento Mercado Pago:', err);
    return res.status(500).json({ detail: err.message || 'Erro ao processar pagamento' });
  }
});

/**
 * POST /subscriptions/simulate-payment
 * Simula a confirmação imediata do pagamento (PIX / Cartão) em ambiente de demonstração
 */
router.post('/subscriptions/simulate-payment', requireAuth, (req, res) => {
  const { planId, cycle = 'monthly', paymentId } = req.body;
  const plan = PLANS_CONFIG[planId];

  if (!plan) {
    return res.status(400).json({ detail: `Plano inválido: ${planId}` });
  }

  const user = findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ detail: 'Usuário não encontrado' });
  }

  const durationDays = cycle === 'yearly' ? 365 : 30;
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  // Atualiza assinatura no banco em memória
  user.subscription = {
    planId: plan.id,
    planName: plan.name,
    status: 'active',
    cycle,
    maxDevices: plan.maxDevices,
    maxGeofences: plan.maxGeofences,
    historyDays: plan.historyDays,
    expiresAt,
    paymentMethod: 'mercado_pago_pix',
    lastPaymentId: paymentId || `mp_${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };

  return res.json({
    success: true,
    message: `Plano "${plan.name}" ativado com sucesso!`,
    subscription: user.subscription,
  });
});

/**
 * POST /subscriptions/webhook
 * Webhook oficial para receber notificações de pagamento do Mercado Pago
 */
router.post('/subscriptions/webhook', (req, res) => {
  const result = mercadoPagoService.processWebhook(req.body);
  return res.status(200).json(result);
});

export default router;
