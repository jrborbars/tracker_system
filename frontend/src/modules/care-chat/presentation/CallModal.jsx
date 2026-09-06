import React from 'react';
import { CALL_STATES, CALL_TYPES, formatCallDuration } from '../domain/webrtcModel.js';
import './CallModal.css';

export default function CallModal({
  callState,
  callType,
  callerInfo,
  duration,
  isMuted,
  isVideoDisabled,
  localVideoRef,
  remoteVideoRef,
  onAnswer,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  groupName,
}) {
  if (callState === CALL_STATES.IDLE) return null;

  const isIncoming = callState === CALL_STATES.INCOMING;
  const isDialing = callState === CALL_STATES.DIALING;
  const isConnected = callState === CALL_STATES.CONNECTED;
  const isEnded = callState === CALL_STATES.ENDED;
  const isVideo = callType === CALL_TYPES.VIDEO;

  return (
    <div className="call-modal-overlay">
      <div className={`call-modal-card ${isVideo ? 'video-mode' : 'audio-mode'}`}>
        
        {/* Cabeçalho da Chamada */}
        <div className="call-header">
          <div className="call-badge-e2ee">
            <i className="fa-solid fa-lock"></i>
            <span>P2P WebRTC E2EE • Zero Nuvem</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="call-status-tag">
              {isDialing && 'Discando...'}
              {isIncoming && 'Chamada Recebida'}
              {isConnected && `Conectado (${formatCallDuration(duration)})`}
              {isEnded && 'Encerrada'}
            </span>
            <button
              type="button"
              className="btn-modal-close"
              onClick={() => onEndCall('user_hangup')}
              title="Fechar Chamada"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Corpo Visual da Chamada */}
        <div className="call-body">
          {isVideo && isConnected ? (
            <div className="video-streams-container">
              {/* Vídeo Remoto (Tela Principal) */}
              <div className="remote-video-wrapper">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="remote-video-element"
                />
                <div className="video-participant-label">
                  <i className="fa-solid fa-user-doctor"></i>
                  <span>{callerInfo?.callerName || 'Equipe Médica InCor'}</span>
                </div>
              </div>

              {/* Vídeo Local (Picture-in-Picture) */}
              <div className={`local-pip-wrapper ${isVideoDisabled ? 'camera-off' : ''}`}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="local-video-element"
                />
                {isVideoDisabled && (
                  <div className="pip-avatar-placeholder">
                    <i className="fa-solid fa-video-slash"></i>
                  </div>
                )}
                <span className="pip-label">Você</span>
              </div>
            </div>
          ) : (
            /* Chamada de Áudio ou Estado de Espera / Discagem */
            <div className="audio-call-display">
              <div className={`call-avatar-pulse ${isDialing || isIncoming ? 'pulsing' : ''}`}>
                <div className="call-avatar-circle">
                  <i className={`fa-solid ${isVideo ? 'fa-video' : 'fa-phone-volume'}`}></i>
                </div>
              </div>

              <h3 className="call-contact-name">
                {isIncoming ? (callerInfo?.callerName || 'Dr. Roberto (InCor)') : (groupName || 'Família Mariana')}
              </h3>
              <p className="call-subtext">
                {isIncoming
                  ? `Chamada de ${isVideo ? 'Vídeo' : 'Voz'} para atendimento prioritário`
                  : isDialing
                  ? 'Estabelecendo túnel direto WebRTC P2P...'
                  : isConnected
                  ? `Sinal Direto • Latência < 30ms • Duração: ${formatCallDuration(duration)}`
                  : 'Desconectando túnel...'}
              </p>

              {/* Ondas Sonoras / Audio Wave Simulation */}
              {isConnected && (
                <div className="audio-wave-bars">
                  <span className="bar bar-1"></span>
                  <span className="bar bar-2"></span>
                  <span className="bar bar-3"></span>
                  <span className="bar bar-4"></span>
                  <span className="bar bar-5"></span>
                  <span className="bar bar-4"></span>
                  <span className="bar bar-2"></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé com Controles de Chamada */}
        <div className="call-controls-footer">
          {isIncoming ? (
            /* Controles para Chamada Recebida (Aceitar / Recusar) */
            <div className="incoming-actions">
              <button
                type="button"
                className="btn-call-action btn-reject"
                onClick={() => onEndCall('rejected')}
                title="Recusar"
              >
                <i className="fa-solid fa-phone-slash"></i>
                <span>Recusar</span>
              </button>

              <button
                type="button"
                className="btn-call-action btn-accept"
                onClick={onAnswer}
                title="Atender"
              >
                <i className={`fa-solid ${isVideo ? 'fa-video' : 'fa-phone'}`}></i>
                <span>Atender</span>
              </button>
            </div>
          ) : (
            /* Controles durante Chamada Ativa ou Discagem */
            <div className="active-call-actions">
              <button
                type="button"
                className={`btn-control-circle ${isMuted ? 'active-mute' : ''}`}
                onClick={onToggleMute}
                title={isMuted ? 'Ativar Microfone' : 'Silenciar Microfone'}
                disabled={isEnded}
              >
                <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
              </button>

              {isVideo && (
                <button
                  type="button"
                  className={`btn-control-circle ${isVideoDisabled ? 'active-mute' : ''}`}
                  onClick={onToggleVideo}
                  title={isVideoDisabled ? 'Ligar Câmera' : 'Desligar Câmera'}
                  disabled={isEnded}
                >
                  <i className={`fa-solid ${isVideoDisabled ? 'fa-video-slash' : 'fa-video'}`}></i>
                </button>
              )}

              <button
                type="button"
                className="btn-control-circle btn-hangup"
                onClick={() => onEndCall('user_hangup')}
                title="Encerrar Chamada"
              >
                <i className="fa-solid fa-phone-slash"></i>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
