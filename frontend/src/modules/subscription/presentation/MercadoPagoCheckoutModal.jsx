import React, { useState, useEffect } from 'react';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';
import subscriptionRepository from '../infrastructure/subscriptionRepository.js';
import { formatCurrency } from '../domain/subscriptionModel.js';
import './MercadoPagoCheckoutModal.css';

export default function MercadoPagoCheckoutModal({
  plan,
  cycle = 'monthly',
  token,
  onClose,
  onPaymentSuccess,
  showToast,
}) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('pix'); // 'pix' | 'card'
  const [loading, setLoading] = useState(true);
  const [processingSimulation, setProcessingSimulation] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [preferenceData, setPreferenceData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min em segundos

  const amount = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

  // Carrega transação inicial do Mercado Pago
  useEffect(() => {
    let isMounted = true;
    async function initCheckout() {
      try {
        setLoading(true);
        // Criação de PIX
        const pixRes = await subscriptionRepository.createCheckoutPreference(plan.id, cycle, 'pix', token);
        // Criação de Checkout Pro
        const prefRes = await subscriptionRepository.createCheckoutPreference(plan.id, cycle, 'checkout_pro', token);
        
        if (isMounted) {
          setPixData(pixRes?.payment);
          setPreferenceData(prefRes?.preference);
        }
      } catch (err) {
        console.error('Erro ao inicializar checkout Mercado Pago:', err);
        if (showToast) showToast('Erro ao gerar cobrança no Mercado Pago.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initCheckout();
    return () => { isMounted = false; };
  }, [plan.id, cycle, token, showToast]);

  // Timer regressivo do PIX
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyPix = () => {
    const qrCode = pixData?.point_of_interaction?.transaction_data?.qr_code;
    if (!qrCode) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      if (showToast) showToast(t('subscription.pixCopied'));
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Simulação imediata de aprovação em ambiente de testes
  const handleSimulateApproval = async () => {
    try {
      setProcessingSimulation(true);
      const res = await subscriptionRepository.simulatePayment(
        plan.id,
        cycle,
        pixData?.id || preferenceData?.id,
        token
      );
      if (showToast) showToast(t('subscription.paymentSuccess'));
      if (onPaymentSuccess) {
        onPaymentSuccess(res.subscription);
      }
      onClose();
    } catch (err) {
      console.error('Erro na simulação de pagamento:', err);
      if (showToast) showToast(err.message || 'Falha ao confirmar pagamento.');
    } finally {
      setProcessingSimulation(false);
    }
  };

  return (
    <div className="mp-checkout-overlay" onClick={onClose}>
      <div className="mp-checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho do Modal */}
        <div className="mp-checkout-header">
          <div className="mp-header-brand">
            <div className="mp-badge-icon">
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div>
              <h3>Mercado Pago &bull; Checkout Seguro</h3>
              <p>Plano {plan.name} ({cycle === 'yearly' ? t('subscription.yearly') : t('subscription.monthly')})</p>
            </div>
          </div>
          <button type="button" className="btn-close-mp" onClick={onClose} title={t('common.close')}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Resumo do Valor */}
        <div className="mp-amount-summary">
          <span className="mp-summary-label">Total a Pagar:</span>
          <span className="mp-summary-value">{formatCurrency(amount)}</span>
        </div>

        {/* Abas de Método de Pagamento */}
        <div className="mp-method-tabs">
          <button
            type="button"
            className={`mp-tab-btn ${activeTab === 'pix' ? 'active' : ''}`}
            onClick={() => setActiveTab('pix')}
          >
            <i className="fa-brands fa-pix"></i>
            <span>PIX Instantâneo</span>
          </button>
          <button
            type="button"
            className={`mp-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
            onClick={() => setActiveTab('card')}
          >
            <i className="fa-solid fa-credit-card"></i>
            <span>Cartão / Mercado Pago</span>
          </button>
        </div>

        {/* Conteúdo do Método Selecionado */}
        {loading ? (
          <div className="mp-loading-state">
            <i className="fa-solid fa-arrows-rotate fa-spin"></i>
            <p>Gerando cobrança segura no Mercado Pago...</p>
          </div>
        ) : (
          <div className="mp-method-content">
            {activeTab === 'pix' ? (
              <div className="mp-pix-container">
                <p className="mp-pix-instruction">{t('subscription.pixDesc')}</p>

                {/* QR Code Simulado / Renderizado */}
                <div className="mp-qr-box">
                  <svg
                    className="mp-qr-svg"
                    viewBox="0 0 100 100"
                    width="140"
                    height="140"
                    fill="currentColor"
                  >
                    {/* Visual de QR Code vetorial limpo */}
                    <rect width="100" height="100" fill="var(--bg-surface-subtle)" rx="6" />
                    <rect x="10" y="10" width="26" height="26" fill="var(--color-primary)" rx="4" />
                    <rect x="16" y="16" width="14" height="14" fill="var(--bg-surface)" rx="2" />
                    <rect x="64" y="10" width="26" height="26" fill="var(--color-primary)" rx="4" />
                    <rect x="70" y="16" width="14" height="14" fill="var(--bg-surface)" rx="2" />
                    <rect x="10" y="64" width="26" height="26" fill="var(--color-primary)" rx="4" />
                    <rect x="16" y="70" width="14" height="14" fill="var(--bg-surface)" rx="2" />
                    <rect x="42" y="12" width="16" height="6" fill="var(--text-main)" rx="1" />
                    <rect x="42" y="24" width="8" height="12" fill="var(--text-main)" rx="1" />
                    <rect x="42" y="42" width="16" height="16" fill="var(--color-primary)" rx="3" />
                    <rect x="64" y="42" width="12" height="6" fill="var(--text-main)" rx="1" />
                    <rect x="12" y="42" width="22" height="8" fill="var(--text-main)" rx="1" />
                    <rect x="64" y="64" width="26" height="12" fill="var(--text-main)" rx="2" />
                    <rect x="42" y="64" width="14" height="26" fill="var(--text-main)" rx="2" />
                    <rect x="64" y="82" width="24" height="8" fill="var(--color-primary)" rx="2" />
                  </svg>
                  <div className="mp-qr-timer">
                    <i className="fa-solid fa-stopwatch"></i>
                    <span>{t('subscription.pixExpiresIn')} ({formatTimer(timeLeft)})</span>
                  </div>
                </div>

                {/* Código Copia-e-Cola */}
                <div className="mp-copia-cola-box">
                  <input
                    type="text"
                    readOnly
                    value={pixData?.point_of_interaction?.transaction_data?.qr_code || '00020126580014br.gov.bcb.pix0136mp-pix-key'}
                    className="mp-copia-cola-input"
                  />
                  <button
                    type="button"
                    className={`btn-copy-pix ${copied ? 'copied' : ''}`}
                    onClick={handleCopyPix}
                  >
                    <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                    <span>{copied ? 'Copiado!' : t('subscription.copyPix')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mp-card-container">
                <div className="mp-card-info-box">
                  <i className="fa-solid fa-lock" style={{ color: 'var(--color-primary)' }}></i>
                  <p>Você será redirecionado para o ambiente seguro do Mercado Pago para concluir com Cartão de Crédito em até 12x.</p>
                </div>

                <a
                  href={preferenceData?.init_point || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-redirect-mp"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  <span>Abrir Checkout Oficial Mercado Pago</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Rodapé com Ação de Teste / Conclusão */}
        <div className="mp-checkout-footer">
          <button
            type="button"
            className="btn-simulate-mp"
            onClick={handleSimulateApproval}
            disabled={processingSimulation || loading}
          >
            <i className={`fa-solid ${processingSimulation ? 'fa-arrows-rotate fa-spin' : 'fa-circle-check'}`}></i>
            <span>{processingSimulation ? 'Validando...' : t('subscription.simulateApproval')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
