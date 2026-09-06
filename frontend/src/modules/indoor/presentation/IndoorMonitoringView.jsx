import React, { useState, useEffect, useRef } from 'react';
import HeaderActions from '../../../core/components/HeaderActions.jsx';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';

// Ambientes monitorados (Residência / Clínica / Suíte Hospitalar)
const DEFAULT_ROOMS = [
  {
    id: 'bedroom',
    nameKey: 'indoor.bedroom',
    defaultName: 'Quarto Principal (Suíte)',
    icon: 'fa-solid fa-bed',
    sensorType: 'Radar Doppler UWB',
    sensorModel: 'UWB-Sens-204',
    hasCamera: true,
    cameraName: 'Câmera HD',
    cameraSnapshot: 'Quarto em repouso • Leito com oxímetro',
    maxSafeMinutes: 480, // 8 horas
    riskLevel: 'low',
    gridArea: 'bedroom',
  },
  {
    id: 'bathroom',
    nameKey: 'indoor.bathroom',
    defaultName: 'Banheiro Adaptado',
    icon: 'fa-solid fa-shower',
    sensorType: 'PIR-Thermal & Anti-Queda',
    sensorModel: 'PIR-Thermal-Safe',
    hasCamera: false, // Privacidade estrita
    cameraName: 'Sem Câmera',
    maxSafeMinutes: 15, // Alerta crítico se passar de 15 min
    riskLevel: 'high',
    gridArea: 'bathroom',
  },
  {
    id: 'living',
    nameKey: 'indoor.livingRoom',
    defaultName: 'Sala de Estar',
    icon: 'fa-solid fa-couch',
    sensorType: 'Sensor Óptico PIR',
    sensorModel: 'PIR-Optic-102',
    hasCamera: true,
    cameraName: 'Câmera Panorâmica Sala',
    cameraSnapshot: 'Sala de estar iluminada • Poltrona reclinável',
    maxSafeMinutes: 180,
    riskLevel: 'low',
    gridArea: 'living',
  },
  {
    id: 'kitchen',
    nameKey: 'indoor.kitchen',
    defaultName: 'Cozinha',
    icon: 'fa-solid fa-kitchen-set',
    sensorType: 'Sensor Magnético & Presença',
    sensorModel: 'Door-PIR-Combo',
    hasCamera: false,
    cameraName: 'Sem Câmera',
    maxSafeMinutes: 45,
    riskLevel: 'medium',
    gridArea: 'kitchen',
  },
  {
    id: 'balcony',
    nameKey: 'indoor.balcony',
    defaultName: 'Varanda / Área Externa',
    icon: 'fa-solid fa-tree',
    sensorType: 'Sensor Perimetral UWB',
    sensorModel: 'UWB-Out-401',
    hasCamera: true,
    cameraName: 'Câmera Externa Jardim',
    cameraSnapshot: 'Área externa arborizada • Piso nivelado antiderrapante',
    maxSafeMinutes: 60,
    riskLevel: 'medium',
    gridArea: 'balcony',
  },
];

export default function IndoorMonitoringView({
  showToast,
  profile,
  onNavigateTab,
  onLogout,
  onProfileUpdated,
  token,
  devicesCount,
  areasCount,
  onEmergencySOS,
  theme,
  onToggleTheme,
  toggleTheme,
  subscription,
  onOpenSubscription,
  messages = [],
}) {
  const { t, locale } = useI18n();
  const [currentRoomId, setCurrentRoomId] = useState('bathroom'); // Inicia simulando o banheiro para demonstrar o cronômetro e alerta
  const [secondsInRoom, setSecondsInRoom] = useState(874); // ~14 minutos e 34 segundos
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facilityType, setFacilityType] = useState('residence'); // 'residence' | 'clinic' | 'hospital'
  const [audioActive, setAudioActive] = useState(false);

  // Controle de visibilidade dos cards dispensáveis (movíveis/fecháveis)
  const [isStatusCardDismissed, setIsStatusCardDismissed] = useState(false);
  const [isAlertCardDismissed, setIsAlertCardDismissed] = useState(false);

  // Histórico recente de movimentação pelos cômodos
  const [roomHistory, setRoomHistory] = useState([
    { roomId: 'bedroom', duration: '1h 45m', timeRange: '08:30 - 10:15', dateKey: 'indoor.now' },
    { roomId: 'kitchen', duration: '25m', timeRange: '08:05 - 08:30', dateKey: 'indoor.now' },
    { roomId: 'bedroom', duration: '7h 35m', timeRange: '00:30 - 08:05', dateKey: 'indoor.now' },
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

  const getRoomName = (room) => {
    return t(room.nameKey) || room.defaultName;
  };

  const currentRoom = DEFAULT_ROOMS.find((r) => r.id === currentRoomId) || DEFAULT_ROOMS[0];
  const currentRoomName = getRoomName(currentRoom);
  const minutesInCurrentRoom = Math.floor(secondsInRoom / 60);
  const isTimeExceeded = minutesInCurrentRoom >= currentRoom.maxSafeMinutes;

  // Reabre o alerta do cuidador sempre que o limite de tempo seguro é ultrapassado (nova ação exigida)
  const prevExceededRef = useRef(false);
  useEffect(() => {
    if (!prevExceededRef.current && isTimeExceeded) {
      setIsAlertCardDismissed(false);
    }
    prevExceededRef.current = isTimeExceeded;
  }, [isTimeExceeded]);

  // Trocar de cômodo (simulação de transição de cômodo/peça da casa)
  const handleChangeRoom = (newRoomId) => {
    if (newRoomId === currentRoomId) return;

    const previousRoom = currentRoom;
    const durationFormatted = formatDwellTime(secondsInRoom);

    // Registra no histórico
    setRoomHistory((prev) => [
      {
        roomId: previousRoom.id,
        duration: durationFormatted,
        timeRange: `${durationFormatted}`,
        dateKey: 'indoor.now',
      },
      ...prev.slice(0, 5),
    ]);

    setCurrentRoomId(newRoomId);
    setSecondsInRoom(0);
    setIsCameraActive(false);

    // Sempre reabre o card de presença ao mudar para uma peça diferente da casa!
    setIsStatusCardDismissed(false);
    setIsAlertCardDismissed(false);

    const targetRoom = DEFAULT_ROOMS.find((r) => r.id === newRoomId);
    const targetName = targetRoom ? getRoomName(targetRoom) : '';
    if (showToast) {
      showToast(t('indoor.sensorDetectedToast', { room: targetName }));
    }
  };

  return (
    <div className="indoor-monitoring-container">
      {/* 1. Header com Status de Presença e Seletor de Imóvel */}
      <div className="page-header">
        <div className="page-title">
          <div className="header-breadcrumbs">
            <button
              type="button"
              className="breadcrumb-home-btn"
              onClick={() => onNavigateTab && onNavigateTab('dashboard')}
              title={t('common.back')}
            >
              <i className="fa-solid fa-house"></i> {t('nav.dashboard')}
            </button>
            <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
            <span className="breadcrumb-current">
              <i className="fa-solid fa-house-signal" style={{ color: 'var(--color-primary)' }}></i> {t('indoor.breadcrumb')}
            </span>
          </div>
        </div>

        <div className="page-actions">
          {/* Seletor do Tipo de Imóvel */}
          <div className="facility-selector">
            <button
              type="button"
              className={`btn-facility ${facilityType === 'residence' ? 'active' : ''}`}
              onClick={() => setFacilityType('residence')}
            >
              <i className="fa-solid fa-house-user"></i> {t('indoor.facilityResidence')}
            </button>
            <button
              type="button"
              className={`btn-facility ${facilityType === 'clinic' ? 'active' : ''}`}
              onClick={() => setFacilityType('clinic')}
            >
              <i className="fa-solid fa-hospital-user"></i> {t('indoor.facilityClinic')}
            </button>
            <button
              type="button"
              className={`btn-facility ${facilityType === 'hospital' ? 'active' : ''}`}
              onClick={() => setFacilityType('hospital')}
            >
              <i className="fa-solid fa-bed-pulse"></i> {t('indoor.facilityHospital')}
            </button>
          </div>

          <HeaderActions
            profile={profile}
            onNavigateTab={onNavigateTab}
            onLogout={onLogout}
            onProfileUpdated={onProfileUpdated}
            token={token}
            showToast={showToast}
            devicesCount={devicesCount}
            areasCount={areasCount}
            onEmergencySOS={onEmergencySOS}
            theme={theme}
            onToggleTheme={onToggleTheme || toggleTheme}
            subscription={subscription}
            onOpenSubscription={onOpenSubscription}
            messages={messages}
          />
        </div>
      </div>

      <div className="tab-content-wrapper">
        {/* 2. Banner de Status Imediato do Paciente (Fechável via 'X' e reaparece ao trocar de cômodo) */}
        {!isStatusCardDismissed && (
          <div className={`indoor-status-card ${isTimeExceeded ? 'alert-warning' : 'status-normal'}`}>
            <button
              type="button"
              className="btn-card-dismiss"
              onClick={() => setIsStatusCardDismissed(true)}
              title={t('common.close')}
              aria-label={t('common.close')}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="status-main-info">
              <div className="status-sensor-pulse">
                <div className="sensor-beacon-ring"></div>
                <i className={currentRoom.icon}></i>
              </div>

              <div className="status-text-block">
                <div className="patient-location-badge">
                  <span className="live-dot"></span>
                  <span>{t('indoor.presenceDetected')}</span>
                </div>
                <h2 className="current-room-heading">
                  {t('indoor.patientInRoom')} <strong>{currentRoomName}</strong>
                </h2>
                <p className="sensor-tech-desc">
                  <i className="fa-solid fa-microchip" style={{ color: 'var(--color-primary)' }}></i>
                  {t('indoor.device')} <code>{currentRoom.sensorModel}</code> &bull; {t('indoor.technology')} {currentRoom.sensorType}
                </p>
              </div>
            </div>

            <div className="dwell-timer-box">
              <span className="timer-label">{t('indoor.dwellTimeLabel')}</span>
              <div className="timer-display">
                <i className="fa-solid fa-stopwatch" style={{ color: isTimeExceeded ? 'var(--color-danger)' : 'var(--color-primary)' }}></i>
                <span>{formatDwellTime(secondsInRoom)}</span>
              </div>
              <span className="timer-threshold">
                {t('indoor.safeLimit')} <strong>{currentRoom.maxSafeMinutes} min</strong>
              </span>
            </div>
          </div>
        )}

        {/* Alerta de Tempo Prolongado / Ação do Cuidador */}
        {isTimeExceeded && !isAlertCardDismissed && (
          <div className="indoor-critical-alert">
            <button
              type="button"
              className="btn-card-dismiss alert-dismiss"
              onClick={() => setIsAlertCardDismissed(true)}
              title={t('common.close')}
              aria-label={t('common.close')}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <i className="fa-solid fa-triangle-exclamation"></i>
            <div className="alert-content">
              <strong>{t('indoor.caregiverAttention', { room: currentRoomName })}</strong>
              <p>
                {t('indoor.caregiverWarningDesc', { minutes: currentRoom.maxSafeMinutes })}
              </p>
            </div>
            <button
              type="button"
              className="btn-alert-ack"
              onClick={() => {
                setIsAlertCardDismissed(true);
                if (showToast) showToast(t('indoor.actionConfirmed'));
              }}
            >
              {t('indoor.verifyPatient')}
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
                <span>{t('indoor.floorplanTitle')}</span>
              </div>
              <span className="floorplan-hint">
                <i className="fa-solid fa-hand-pointer"></i> {t('indoor.floorplanHint')}
              </span>
            </div>

            <div className="floorplan-blueprint-view">
              <div className="blueprint-grid">
                {DEFAULT_ROOMS.map((room) => {
                  const isPatientHere = room.id === currentRoomId;
                  const name = getRoomName(room);
                  return (
                    <div
                      key={room.id}
                      className={`room-zone ${room.id} ${isPatientHere ? 'active-patient' : ''}`}
                      onClick={() => handleChangeRoom(room.id)}
                    >
                      <div className="room-zone-header">
                        <div className="room-icon-title">
                          <i className={room.icon}></i>
                          <span className="room-name">{name}</span>
                        </div>
                        {room.hasCamera && (
                          <span className="camera-pill" title={t('indoor.cameraAvailable')}>
                            <i className="fa-solid fa-video"></i>
                          </span>
                        )}
                        {!room.hasCamera && (
                          <span className="privacy-pill" title={t('indoor.privacyGuaranteed')}>
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
                            {t('indoor.patientHere', { time: formatDwellTime(secondsInRoom) })}
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
                  <h3>{t('indoor.cameraTitle')}</h3>
                </div>
                {currentRoom.hasCamera && (
                  <span className={`cam-status-badge ${isCameraActive ? 'active' : 'idle'}`}>
                    {isCameraActive ? t('indoor.liveStream') : t('indoor.standby')}
                  </span>
                )}
              </div>

              {currentRoom.hasCamera ? (
                <div className="camera-feed-viewport">
                  {isCameraActive ? (
                    <div className="camera-live-stream">
                      <div className="stream-header-overlay">
                        <span className="rec-dot">
                          <i className="fa-solid fa-circle"></i> {t('indoor.liveBadge')}
                        </span>
                        <span className="stream-cam-name">{currentRoom.cameraName}</span>
                        <span className="stream-timestamp">{new Date().toLocaleTimeString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR')}</span>
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
                          <span>{audioActive ? t('indoor.audioActive') : t('indoor.listenRoom')}</span>
                        </button>
                        <button
                          type="button"
                          className="btn-stream-stop"
                          onClick={() => setIsCameraActive(false)}
                        >
                          <i className="fa-solid fa-power-off"></i> {t('indoor.turnOffCamera')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="camera-offline-view">
                      <div className="cam-offline-icon">
                        <i className="fa-solid fa-video-slash"></i>
                      </div>
                      <h4>{t('indoor.cameraOffTitle')}</h4>
                      <p>{t('indoor.cameraOffDesc')}</p>
                      <button
                        type="button"
                        className="btn-activate-camera"
                        onClick={() => setIsCameraActive(true)}
                      >
                        <i className="fa-solid fa-play"></i> {t('indoor.activateCamera')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="camera-privacy-guaranteed">
                  <div className="privacy-shield-icon">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h4>{t('indoor.privacyAreaTitle')}</h4>
                  <p>
                    {t('indoor.privacyAreaDesc')}
                  </p>
                  <span className="privacy-certified-badge">
                    <i className="fa-solid fa-lock"></i> {t('indoor.dignityProtocol')}
                  </span>
                </div>
              )}
            </div>

            {/* Histórico Recente de Permanência nos Cômodos */}
            <div className="room-history-card">
              <div className="card-header-history">
                <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--color-primary)' }}></i>
                <h3>{t('indoor.recentHistory')}</h3>
              </div>

              <div className="history-timeline">
                {/* Cômodo Atual */}
                <div className="history-item current">
                  <div className="history-bullet active"></div>
                  <div className="history-info">
                    <div className="history-room-name">
                      <strong>{currentRoomName}</strong>
                      <span className="tag-current">{t('indoor.now')}</span>
                    </div>
                    <span className="history-time-spent">
                      <i className="fa-solid fa-stopwatch"></i> {formatDwellTime(secondsInRoom)} {t('indoor.inProgress')}
                    </span>
                  </div>
                </div>

                {/* Itens Anteriores */}
                {roomHistory.map((item, idx) => {
                  const roomMeta = DEFAULT_ROOMS.find((r) => r.id === item.roomId) || DEFAULT_ROOMS[0];
                  const roomTitle = getRoomName(roomMeta);
                  return (
                    <div key={idx} className="history-item">
                      <div className="history-bullet"></div>
                      <div className="history-info">
                        <div className="history-room-name">
                          <span>{roomTitle}</span>
                          <span className="history-time-range">{item.timeRange}</span>
                        </div>
                        <span className="history-time-spent">
                          {t('indoor.dwellDuration')} <strong>{item.duration}</strong>
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
