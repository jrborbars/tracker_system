import React, { useState } from 'react';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';

export default function AddDeviceModal({ isOpen, onClose, onAddDevice }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pairingToken, setPairingToken] = useState('');
  const [wearMode, setWearMode] = useState('pulso'); // 'pulso' | 'roupa'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Gerar código aleatório de pareamento (ex: BD-8492)
  const handleGenerateCode = () => {
    const randomCode = `BD-${Math.floor(1000 + Math.random() * 9000)}`;
    setPairingToken(randomCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const generatedToken = pairingToken.trim().toUpperCase() || `BD-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedDeviceId = `WATCH-${generatedToken.replace('BD-', '') || Math.floor(1000 + Math.random() * 9000)}`;

      await onAddDevice({
        name: name.trim(),
        description: description.trim(),
        device_id: generatedDeviceId,
        pairing_token: generatedToken,
        wear_mode: wearMode,
        type: wearMode === 'pulso' ? 'relogio-pulso' : 'relogio-clip',
        heart_rate: 72,
        fall_detection: true,
      });

      setName('');
      setDescription('');
      setPairingToken('');
      setWearMode('pulso');
      onClose();
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog wearable-modal" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho do Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="wearable-modal-icon">
              <i className="fa-solid fa-clock"></i>
            </div>
            <div>
              <h3>{t('tracker.modal.title')}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {t('tracker.modal.subtitle')}
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {error && (
          <div className="feedback-alert error" style={{ margin: '14px 0' }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px' }}>
          
          {/* Seletor de Modo de Uso do Paciente */}
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>
              {t('tracker.modal.wearModeLabel')}
            </label>
            <div className="wear-mode-selector">
              <button
                type="button"
                className={`wear-mode-card ${wearMode === 'pulso' ? 'active' : ''}`}
                onClick={() => setWearMode('pulso')}
              >
                <div className="wear-mode-icon">
                  <i className="fa-solid fa-hand-holding-hand"></i>
                </div>
                <div className="wear-mode-details">
                  <strong>{t('tracker.modal.wristModeTitle')}</strong>
                  <span>{t('tracker.modal.wristModeDesc')}</span>
                </div>
                {wearMode === 'pulso' && <i className="fa-solid fa-circle-check check-icon"></i>}
              </button>

              <button
                type="button"
                className={`wear-mode-card ${wearMode === 'roupa' ? 'active' : ''}`}
                onClick={() => setWearMode('roupa')}
              >
                <div className="wear-mode-icon">
                  <i className="fa-solid fa-shirt"></i>
                </div>
                <div className="wear-mode-details">
                  <strong>{t('tracker.modal.clothingModeTitle')}</strong>
                  <span>{t('tracker.modal.clothingModeDesc')}</span>
                </div>
                {wearMode === 'roupa' && <i className="fa-solid fa-circle-check check-icon"></i>}
              </button>
            </div>
          </div>

          {/* Token / Código de Pareamento Android */}
          <div className="pairing-token-box">
            <div className="pairing-token-header">
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                  <i className="fa-brands fa-android" style={{ color: '#3DDC84', marginRight: '6px' }}></i>
                  {t('tracker.modal.tokenHeader')}
                </strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {t('tracker.modal.tokenDesc')}
                </p>
              </div>
              <button
                type="button"
                className="btn-generate-token"
                onClick={handleGenerateCode}
                title={t('tracker.modal.generateToken')}
              >
                <i className="fa-solid fa-arrows-rotate"></i> {t('tracker.modal.generateToken')}
              </button>
            </div>

            <div className="pairing-input-row">
              <input
                type="text"
                className="input-control pairing-input"
                placeholder="Ex: BD-7492"
                value={pairingToken}
                onChange={(e) => setPairingToken(e.target.value.toUpperCase())}
                maxLength={8}
                required
              />
              <div className="pairing-badge-ready">
                <i className="fa-solid fa-wifi"></i>
                <span>{t('tracker.modal.readyToPair')}</span>
              </div>
            </div>
          </div>

          {/* Nome do Paciente / Dispositivo */}
          <div className="form-group">
            <label htmlFor="wearable-name" style={{ fontSize: '12px', fontWeight: 600 }}>
              {t('tracker.modal.patientNameLabel')}
            </label>
            <input
              id="wearable-name"
              type="text"
              className="input-control"
              placeholder={wearMode === 'pulso' ? t('tracker.modal.patientNameWristPlaceholder') : t('tracker.modal.patientNameClipPlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Observações Clínicas / Cuidados */}
          <div className="form-group">
            <label htmlFor="wearable-desc" style={{ fontSize: '12px', fontWeight: 600 }}>
              {t('tracker.modal.notesLabel')}
            </label>
            <textarea
              id="wearable-desc"
              className="input-control"
              style={{ minHeight: '60px' }}
              placeholder={t('tracker.modal.notesPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Ações do Modal */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={onClose}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> {t('tracker.modal.submittingBtn')}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-link"></i> {t('tracker.modal.submitBtn')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
