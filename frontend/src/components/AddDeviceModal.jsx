import React, { useState } from 'react';

export default function AddDeviceModal({ isOpen, onClose, onAddDevice }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [type, setType] = useState('pulseira-gps');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onAddDevice({
        name,
        description,
        device_id: deviceId,
        type,
      });
      setName('');
      setDescription('');
      setDeviceId('');
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao adicionar dispositivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <i className="fa-solid fa-satellite" style={{ color: 'var(--color-primary)', marginRight: '8px' }}></i>
            Conectar Novo Rastreador
          </h3>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {error && (
          <div className="feedback-alert error" style={{ marginBottom: '16px' }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label htmlFor="dev-name">Nome do Ente Querido / Dispositivo</label>
            <input
              id="dev-name"
              type="text"
              className="input-control"
              style={{ paddingLeft: '14px' }}
              placeholder="Ex: Mariana Silva (Pulseira)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dev-id">Código do Rastreador (ID de Satélite)</label>
            <input
              id="dev-id"
              type="text"
              className="input-control"
              style={{ paddingLeft: '14px' }}
              placeholder="Ex: TRCK-30003"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dev-type">Tipo de Rastreador</label>
            <select
              id="dev-type"
              className="input-control"
              style={{ paddingLeft: '14px' }}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="pulseira-gps">Pulseira Satelital (Adulto/Infantil)</option>
              <option value="relogio-cardio">Smartwatch com Sensor Cardíaco</option>
              <option value="pingente-sos">Pingente com Botão SOS</option>
              <option value="gps-tracker">Rastreador Portátil de Bolso</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dev-desc">Observações Médicas ou Descrição</label>
            <textarea
              id="dev-desc"
              className="input-control"
              style={{ paddingLeft: '14px', minHeight: '70px' }}
              placeholder="Ex: Paciente com Síndrome de Eisenmenger, uso de oxigênio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
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
              {loading ? 'Salvando...' : 'Cadastrar Rastreador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
