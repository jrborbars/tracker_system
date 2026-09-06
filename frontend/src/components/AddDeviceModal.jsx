import React, { useState } from 'react';

export default function AddDeviceModal({ isOpen, onClose, onAddDevice }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pairingToken, setPairingToken] = useState('');
  const [wearMode, setWearMode] = useState('pulso'); // 'pulso' | 'roupa'
  const [deviceModel, setDeviceModel] = useState('android-wear'); // 'android-wear' | 'clip-sensor' | 'smartband'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Instruções e Código, 2: Dados do Paciente

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
      setStep(1);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao parear relógio');
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
              <h3>Parear Relógio / Dispositivo Wearable</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Conecte o aplicativo Android do relógio à central familiar
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
              Modo de Uso no Paciente
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
                  <strong>No Pulso (Pulseira)</strong>
                  <span>Smartwatch Android / WearOS com sensor de batimentos e SOS</span>
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
                  <strong>Na Roupa (Clip Sensorial)</strong>
                  <span>Preso ao cinto ou gola com detector de quedas e localização</span>
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
                  Código de Pareamento (Token Android)
                </strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Digite o código exibido na tela do relógio ou gere um novo
                </p>
              </div>
              <button
                type="button"
                className="btn-generate-token"
                onClick={handleGenerateCode}
                title="Gerar código aleatório"
              >
                <i className="fa-solid fa-arrows-rotate"></i> Gerar Código
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
                <span>Pronto p/ Parear</span>
              </div>
            </div>
          </div>

          {/* Nome do Paciente / Dispositivo */}
          <div className="form-group">
            <label htmlFor="wearable-name" style={{ fontSize: '12px', fontWeight: 600 }}>
              Identificação do Paciente / Relógio
            </label>
            <input
              id="wearable-name"
              type="text"
              className="input-control"
              placeholder={wearMode === 'pulso' ? 'Ex: Relógio do Vô João' : 'Ex: Clip da Dona Maria'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Observações Clínicas / Cuidados */}
          <div className="form-group">
            <label htmlFor="wearable-desc" style={{ fontSize: '12px', fontWeight: 600 }}>
              Instruções de Monitoramento & Cuidados
            </label>
            <textarea
              id="wearable-desc"
              className="input-control"
              style={{ minHeight: '60px' }}
              placeholder="Ex: Paciente com diagnóstico de Eisenmenger, alertar em caso de batimentos fora de 60-100 BPM ou queda."
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
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Pareando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-link"></i> Concluir Pareamento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
