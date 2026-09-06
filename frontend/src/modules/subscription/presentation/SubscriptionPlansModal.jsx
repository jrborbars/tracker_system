import React, { useState } from 'react';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';
import { SUBSCRIPTION_PLANS, formatCurrency } from '../domain/subscriptionModel.js';
import MercadoPagoCheckoutModal from './MercadoPagoCheckoutModal.jsx';
import './SubscriptionPlansModal.css';

export default function SubscriptionPlansModal({
  isOpen,
  onClose,
  currentSubscription,
  token,
  onSubscriptionUpdated,
  showToast,
}) {
  const { t } = useI18n();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  if (!isOpen) return null;

  const currentPlanId = currentSubscription?.planId || 'free';
  const plans = [
    {
      ...SUBSCRIPTION_PLANS.free,
      features: [
        '1 Relógio / Dispositivo Conectado',
        '2 Cercas Virtuais Seguras',
        'Chat de Cuidado Familiar',
        'Histórico de Telemetria de 24h',
      ],
    },
    {
      ...SUBSCRIPTION_PLANS.family,
      features: [
        'Até 3 Relógios / Pacientes',
        'Cercas Virtuais Ilimitadas',
        'Histórico Completo de 30 Dias',
        'Notificações Push Prioritárias',
        'Multi-cuidadores na Mesma Conta',
        'Suporte Familiar Dedicado',
      ],
    },
    {
      ...SUBSCRIPTION_PLANS.clinical,
      features: [
        'Até 10 Relógios / Pacientes',
        'Planta Baixa & Monitoramento Indoor',
        'Exportação de Prontuários (PDF & CSV)',
        'Alertas Críticos com SLA Prioritário',
        'Visão Multi-paciente Integrada',
      ],
    },
  ];

  const handleSelectPlan = (plan) => {
    if (plan.id === currentPlanId) return;
    if (plan.id === 'free') {
      if (showToast) showToast('Seu plano atual é o gratuito.');
      return;
    }
    setSelectedPlanForCheckout(plan);
  };

  const handlePaymentSuccess = (updatedSubscription) => {
    if (onSubscriptionUpdated) {
      onSubscriptionUpdated(updatedSubscription);
    }
    setSelectedPlanForCheckout(null);
  };

  return (
    <>
      <div className="subscription-modal-overlay" onClick={onClose}>
        <div className="subscription-modal-card" onClick={(e) => e.stopPropagation()}>
          {/* Cabeçalho */}
          <div className="subscription-modal-header">
            <div className="subscription-header-text">
              <div className="subscription-badge-pill">
                <i className="fa-solid fa-crown"></i>
                <span>{t('subscription.menuItem')}</span>
              </div>
              <h2>{t('subscription.modalTitle')}</h2>
              <p>{t('subscription.modalSubtitle')}</p>
            </div>
            <button
              type="button"
              className="btn-close-subscription"
              onClick={onClose}
              title={t('common.close')}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Seletor de Ciclo de Cobrança (Mensal / Anual) */}
          <div className="subscription-cycle-toggle-wrapper">
            <div className="subscription-cycle-toggle">
              <button
                type="button"
                className={`cycle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                {t('subscription.monthly')}
              </button>
              <button
                type="button"
                className={`cycle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('yearly')}
              >
                <span>{t('subscription.yearly')}</span>
                <span className="discount-pill">{t('subscription.yearlyDiscount')}</span>
              </button>
            </div>
          </div>

          {/* Grid de Cards dos Planos */}
          <div className="subscription-plans-grid">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const isPopular = plan.popular;
              const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
              const monthlyEquivalent = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : null;

              return (
                <div
                  key={plan.id}
                  className={`subscription-plan-card ${isPopular ? 'popular' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  {isPopular && (
                    <div className="popular-badge">
                      <i className="fa-solid fa-star"></i> {t('subscription.popularBadge')}
                    </div>
                  )}

                  <div className="plan-card-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-pricing">
                      <span className="price-value">
                        {price === 0 ? 'Grátis' : formatCurrency(price)}
                      </span>
                      <span className="price-period">
                        {price === 0
                          ? ''
                          : billingCycle === 'yearly'
                          ? t('subscription.perYear')
                          : t('subscription.perMonth')}
                      </span>
                    </div>
                    {monthlyEquivalent && (
                      <span className="price-equivalent">
                        (equivale a {formatCurrency(monthlyEquivalent)}/mês)
                      </span>
                    )}
                  </div>

                  {/* Lista de Recursos */}
                  <ul className="plan-features-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <i className="fa-solid fa-circle-check feature-check-icon"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Botão de Ação */}
                  <div className="plan-card-footer">
                    {isCurrent ? (
                      <div className="current-plan-badge">
                        <i className="fa-solid fa-check"></i>
                        <span>{t('subscription.currentPlan')}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`btn-select-plan ${isPopular ? 'btn-primary-gradient' : ''}`}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        <i className="fa-brands fa-pix" style={{ marginRight: '6px' }}></i>
                        {t('subscription.choosePlan')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé Seguro Mercado Pago */}
          <div className="subscription-modal-footer">
            <div className="mp-secure-badge">
              <i className="fa-solid fa-lock"></i>
              <span>Pagamento processado com segurança via <strong>Mercado Pago</strong> (PIX & Cartão de Crédito)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Checkout do Mercado Pago */}
      {selectedPlanForCheckout && (
        <MercadoPagoCheckoutModal
          plan={selectedPlanForCheckout}
          cycle={billingCycle}
          token={token}
          onClose={() => setSelectedPlanForCheckout(null)}
          onPaymentSuccess={handlePaymentSuccess}
          showToast={showToast}
        />
      )}
    </>
  );
}
