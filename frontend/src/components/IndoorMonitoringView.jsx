import React, { useState, useEffect } from 'react';

// Ambientes monitorados (Residência / Clínica / Suíte Hospitalar)
const DEFAULT_ROOMS = [
  {
    id: 'bedroom',
    name: 'Quarto Principal (Suíte)',
    icon: 'fa-solid fa-bed',
    sensorType: 'Radar Doppler de Presença & Micro-movimentos',
    sensorModel: 'UWB-Sens-204',
    hasCamera: true,
    cameraName: 'Câmera Noturna Quarto (HD)',
    cameraSnapshot: 'Quarto em repouso • Leito hospitalar com oxímetro ao lado',
    maxSafeMinutes: 480, // 8 horas
    riskLevel: 'low',
    gridArea: 'bedroom',
  },
  {
    id: 'bathroom',
    name: 'Banheiro Adaptado',
    icon: 'fa-solid fa-shower',
    sensorType: 'Sensor Térmico & Radar Anti-Queda',
    sensorModel: 'PIR-Thermal-Safe',
    hasCamera: false, // Privacidade estrita
    cameraName: 'Sem Câmera (Privacidade Total)',
    maxSafeMinutes: 15, // Alerta crítico se passar de 15 min
    riskLevel: 'high',
    gridArea: 'bathroom',
  },
  {
    id: 'living',
    name: 'Sala de Estar & Convivência',
    icon: 'fa-solid fa-couch',
    sensorType: 'Sensor Óptico de Movimento & Presença',
    sensorModel: 'PIR-Optic-102',
    hasCamera: true,
    cameraName: 'Câmera Panorâmica Sala',
    cameraSnapshot: 'Sala de estar iluminada • Poltrona reclinável de repouso',
    maxSafeMinutes: 180,
    riskLevel: 'low',
    gridArea: 'living',
  },
  {
    id: 'kitchen',
    name: 'Cozinha / Copa',
    icon: 'fa-solid fa-kitchen-set',
    sensorType: 'Sensor Magnético de Porta & Presença',
    sensorModel: 'Door-PIR-Combo',
    hasCamera: false,
    cameraName: 'Sem Câmera',
    maxSafeMinutes: 45,
    riskLevel: 'medium',
    gridArea: 'kitchen',
  },
  {
    id: 'balcony',
    name: 'Varanda / Área Externa',
    icon: 'fa-solid fa-tree',
    sensorType: 'Sensor de Presença Perimetral',
    sensorModel: 'UWB-Out-401',
    hasCamera: true,
    cameraName: 'Câmera Externa Jardim',
    cameraSnapshot: 'Área externa arborizada • Piso nivelado antiderrapante',
    maxSafeMinutes: 60,
    riskLevel: 'medium',
    gridArea: 'balcony',
  },
];

export default function IndoorMonitoringView({ showToast }) {
  const [currentRoomId, setCurrentRoomId] = useState('bathroom'); // Inicia simulando o banheiro para demonstrar o cronômetro e alerta
  const [secondsInRoom, setSecondsInRoom] = useState(874); // ~14 minutos e 34 segundos
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facilityType, setFacilityType] = useState('residence'); // 'residence' | 'clinic' | 'hospital'
  const [audioActive, setAudioActive] = useState(false);

  // Histórico recente de movimentação pelos cômodos
  const [roomHistory, setRoomHistory] = useState([
    { roomId: 'bedroom', duration: '1h 45m', timeRange: '08:30 - 10:15', date: 'Hoje' },
    { roomId: 'kitchen', duration: '25m', timeRange: '08:05 - 08:30', date: 'Hoje' },
    { roomId: 'bedroom', duration: '7h 35m', timeRange: '00:30 - 08:05', date: 'Hoje' },
  ]);

  // Cronômetro em tempo real do tempo de permanência no cômodo atual
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsInRoom((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Formata os segundos em MM:SS ou HH:MM:SS
  const formatDwellTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const currentRoom = DEFAULT_ROOMS.find((r) => r.id === currentRoomId) || DEFAULT_ROOMS[0];
  const minutesInCurrentRoom = Math.floor(secondsInRoom / 60);
  const isTimeExceeded = minutesInCurrentRoom >= currentRoom.maxSafeMinutes;

  // Trocar de cômodo (simulação de transição)
  const handleChangeRoom = (newRoomId) => {
    if (newRoomId === currentRoomId) return;

    const previousRoom = currentRoom;
    const durationFormatted = formatDwellTime(secondsInRoom);

    // Registra no histórico
    setRoomHistory((prev) => [
      {
        roomId: previousRoom.id,
        duration: durationFormatted,
        timeRange: `Últimos ${durationFormatted}`,
        date: 'Agora',
      },
      ...prev.slice(0, 5),
    ]);

    setCurrentRoomId(newRoomId);
    setSecondsInRoom(0);
    setIsCameraActive(false);

    const targetRoom = DEFAULT_ROOMS.find((r) => r.id === newRoomId);
    if (showToast) {
      showToast(`Sensor detectou paciente em: ${targetRoom?.name}`);
    }
  };

  return (
    <div className="indoor-monitoring-container">
      {/* 1. Header com Status de Presença e Seletor de Imóvel */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <i className="fa-solid fa-house-signal" style={{ color: 'var(--color-primary)' }}></i>
            Monitoramento Interno de Presença
          </h1>
          <p>Localização em tempo real nos cômodos via sensores térmicos e radar (Privacidade preservada)</p>
        </div>

        <div className="page-actions">
          {/* Seletor do Tipo de Imóvel */}
          <div className="facility-selector">
            <button
              type="button"
              className={`btn-facility ${facilityType === 'residence' ? 'active' : ''}`}
              onClick={() => setFacilityType('residence')}
            >
              <i className="fa-solid fa-house-user"></i> Residência
            </button>
            <button
              type="button"
              className={`btn-facility ${facilityType === 'clinic' ? 'active' : ''}`}
              onClick={() => setFacilityType('clinic')}
            >
              <i className="fa-solid fa-hospital-user"></i> Clínica
            </button>
            <button
              type="button"
              className={`btn-facility ${facilityType === 'hospital' ? 'active' : ''}`}
              onClick={() => setFacilityType('hospital')}
            >
              <i className="fa-solid fa-bed-pulse"></i> Suíte InCor
            </button>
          </div>
        </div>
      </div>

      <div className="tab-content-wrapper">
        {/* 2. Banner de Status Imediato do Paciente */}
        <div className={`indoor-status-card ${isTimeExceeded ? 'alert-warning' : 'status-normal'}`}>
          <div className="status-main-info">
            <div className="status-sensor-pulse">
              <div className="sensor-beacon-ring"></div>
              <i className={currentRoom.icon}></i>
            </div>

            <div className="status-text-block">
              <div className="patient-location-badge">
                <span className="live-dot"></span>
                <span>PRESENÇA DETECTADA VIA SENSOR</span>
              </div>
              <h2 className="current-room-heading">
                Paciente está no(a) <strong>{currentRoom.name}</strong>
              </h2>
              <p className="sensor-tech-desc">
                <i className="fa-solid fa-microchip" style={{ color: 'var(--color-primary)' }}></i>
                Dispositivo: <code>{currentRoom.sensorModel}</code> &bull; Tecnologia: {currentRoom.sensorType}
              </p>
            </div>
          </div>

          <div className="dwell-timer-box">
            <span className="timer-label">TEMPO DE PERMANÊNCIA:</span>
            <div className="timer-display">
              <i className="fa-solid fa-stopwatch" style={{ color: isTimeExceeded ? 'var(--color-danger)' : 'var(--color-primary)' }}></i>
              <span>{formatDwellTime(secondsInRoom)}</span>
            </div>
            <span className="timer-threshold">
              Limite seguro sugerido: <strong>{currentRoom.maxSafeMinutes} min</strong>
            </span>
          </div>
        </div>

        {/* Alerta de Tempo Prolongado (Especialmente no Banheiro) */}
        {isTimeExceeded && (
          <div className="indoor-critical-alert">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <div className="alert-content">
              <strong>Atenção do Cuidador: Tempo Elevado no {currentRoom.name}!</strong>
              <p>
                O paciente com Síndrome de Eisenmenger está há mais de {currentRoom.maxSafeMinutes} minutos neste cômodo.
                Recomenda-se checar se houve síncope, mal-estar respiratório ou necessidade de apoio.
              </p>
            </div>
            <button
              type="button"
              className="btn-alert-ack"
              onClick={() => showToast && showToast('Alerta confirmado pelo cuidador.')}
            >
              Verificar Paciente
            </button>
          </div>
        )}

        {/* 3. Grid Principal: Planta Baixa Interativa e Painel Lateral de Detalhes */}
        <div className="indoor-layout-grid">
          {/* Planta Baixa Virtual do Imóvel */}
          <div className="floorplan-card">
            <div className="floorplan-header">
              <div className="floorplan-title">
                <i className="fa-solid fa-draw-polygon" style={{ color: 'var(--color-primary)' }}></i>
                <span>Planta Baixa Interativa do Imóvel</span>
              </div>
              <span className="floorplan-hint">
                <i className="fa-solid fa-hand-pointer"></i> Clique em um cômodo para simular movimentação
              </span>
            </div>

            <div className="floorplan-blueprint-view">
              <div className="blueprint-grid">
                {DEFAULT_ROOMS.map((room) => {
                  const isPatientHere = room.id === currentRoomId;
                  return (
                    <div
                      key={room.id}
                      className={`room-zone ${room.id} ${isPatientHere ? 'active-patient' : ''}`}
                      onClick={() => handleChangeRoom(room.id)}
                    >
                      <div className="room-zone-header">
                        <div className="room-icon-title">
                          <i className={room.icon}></i>
                          <span className="room-name">{room.name}</span>
                        </div>
                        {room.hasCamera && (
                          <span className="camera-pill" title="Câmera de Apoio Disponível">
                            <i className="fa-solid fa-video"></i>
                          </span>
                        )}
                        {!room.hasCamera && (
                          <span className="privacy-pill" title="100% Privado (Sem Câmera)">
                            <i className="fa-solid fa-user-shield"></i>
                          </span>
                        )}
                      </div>

                      {isPatientHere && (
                        <div className="patient-presence-marker">
                          <div className="presence-pulse-beacon"></div>
                          <div className="presence-avatar">
                            <i className="fa-solid fa-person-walking"></i>
                          </div>
                          <span className="presence-tag">
                            Paciente Aqui ({formatDwellTime(secondsInRoom)})
                          </span>
                        </div>
                      )}

                      <div className="room-sensor-footer">
                        <span className="sensor-id">
                          <i className="fa-solid fa-satellite-dish"></i> {room.sensorModel}
                        </span>
                        <span className="sensor-status-dot"></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Painel Lateral: Câmera sob Demanda & Histórico */}
          <div className="indoor-sidebar-details">
            {/* Card da Câmera sob Demanda */}
            <div className="camera-control-card">
              <div className="card-header-camera">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-video" style={{ color: currentRoom.hasCamera ? 'var(--color-primary)' : 'var(--text-muted)' }}></i>
                  <h3>Câmera de Apoio sob Demanda</h3>
                </div>
                {currentRoom.hasCamera && (
                  <span className={`cam-status-badge ${isCameraActive ? 'active' : 'idle'}`}>
                    {isCameraActive ? 'TRANSMISSÃO AO VIVO' : 'STANDBY'}
                  </span>
                )}
              </div>

              {currentRoom.hasCamera ? (
                <div className="camera-feed-viewport">
                  {isCameraActive ? (
                    <div className="camera-live-stream">
                      <div className="stream-header-overlay">
                        <span className="rec-dot">
                          <i className="fa-solid fa-circle"></i> AO VIVO
                        </span>
                        <span className="stream-cam-name">{currentRoom.cameraName}</span>
                        <span className="stream-timestamp">{new Date().toLocaleTimeString('pt-BR')}</span>
                      </div>

                      <div className="stream-visual-placeholder">
                        <div className="stream-sensor-telemetry">
                          <div className="telemetry-pill">
                            <i className="fa-solid fa-heart-pulse" style={{ color: 'var(--color-danger)' }}></i>
                            <span>74 BPM</span>
                          </div>
                          <div className="telemetry-pill">
                            <i className="fa-solid fa-lungs" style={{ color: 'var(--color-primary)' }}></i>
                            <span>SpO2 93%</span>
                          </div>
                        </div>

                        <div className="stream-caption-box">
                          <i className="fa-solid fa-eye"></i>
                          <span>{currentRoom.cameraSnapshot}</span>
                        </div>
                      </div>

                      <div className="stream-controls-bar">
                        <button
                          type="button"
                          className={`btn-stream-audio ${audioActive ? 'active' : ''}`}
                          onClick={() => setAudioActive(!audioActive)}
                        >
                          <i className={`fa-solid ${audioActive ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
                          <span>{audioActive ? 'Áudio Ativo' : 'Ouvir Ambiente'}</span>
                        </button>
                        <button
                          type="button"
                          className="btn-stream-stop"
                          onClick={() => setIsCameraActive(false)}
                        >
                          <i className="fa-solid fa-power-off"></i> Desativar Câmera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="camera-offline-view">
                      <div className="cam-offline-icon">
                        <i className="fa-solid fa-video-slash"></i>
                      </div>
                      <h4>Câmera Desativada por Padrão</h4>
                      <p>Para preservar a privacidade, a câmera só é ativada quando você autorizar expressamente.</p>
                      <button
                        type="button"
                        className="btn-activate-camera"
                        onClick={() => setIsCameraActive(true)}
                      >
                        <i className="fa-solid fa-play"></i> Acionar Câmera do Cômodo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="camera-privacy-guaranteed">
                  <div className="privacy-shield-icon">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h4>Área com Privacidade 100% Protegida</h4>
                  <p>
                    O <strong>{currentRoom.name}</strong> não possui câmera. O monitoramento de segurança é realizado exclusivamente via <strong>Radar Térmico e Sensor Anti-Queda</strong>.
                  </p>
                  <span className="privacy-certified-badge">
                    <i className="fa-solid fa-lock"></i> Protocolo de Dignidade Médica
                  </span>
                </div>
              )}
            </div>

            {/* Histórico Recente de Permanência nos Cômodos */}
            <div className="room-history-card">
              <div className="card-header-history">
                <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--color-primary)' }}></i>
                <h3>Histórico de Permanência Recente</h3>
              </div>

              <div className="history-timeline">
                {/* Cômodo Atual */}
                <div className="history-item current">
                  <div className="history-bullet active"></div>
                  <div className="history-info">
                    <div className="history-room-name">
                      <strong>{currentRoom.name}</strong>
                      <span className="tag-current">Agora</span>
                    </div>
                    <span className="history-time-spent">
                      <i className="fa-solid fa-stopwatch"></i> {formatDwellTime(secondsInRoom)} em andamento
                    </span>
                  </div>
                </div>

                {/* Itens Anteriores */}
                {roomHistory.map((item, idx) => {
                  const roomMeta = DEFAULT_ROOMS.find((r) => r.id === item.roomId) || DEFAULT_ROOMS[0];
                  return (
                    <div key={idx} className="history-item">
                      <div className="history-bullet"></div>
                      <div className="history-info">
                        <div className="history-room-name">
                          <span>{roomMeta.name}</span>
                          <span className="history-time-range">{item.timeRange}</span>
                        </div>
                        <span className="history-time-spent">
                          Permanência: <strong>{item.duration}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
