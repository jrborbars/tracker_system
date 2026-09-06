import React from 'react';
import useNetworkStatus from '../hooks/useNetworkStatus';

export default function NetworkStatusBar() {
  const { isOnline, showReconnected, isDismissed, dismiss, checkConnectivity } = useNetworkStatus();

  if ((isOnline && !showReconnected) || isDismissed) {
    return null;
  }

  return (
    <aside
      className={`network-status-bar ${!isOnline ? 'offline' : 'reconnected'}`}
      role="status"
      aria-live="polite"
    >
      <div className="network-status-content">
        {!isOnline ? (
          <>
            <i className="fa-solid fa-wifi-slash network-status-icon" aria-hidden="true"></i>
            <span className="network-status-text">
              <strong>Modo Offline</strong> — Sem conexão com a internet. Exibindo dados locais em cache.
            </span>
            <div className="network-status-actions">
              <button
                type="button"
                className="network-status-btn-retry"
                onClick={() => checkConnectivity()}
                title="Testar conexão com o servidor local"
              >
                <i className="fa-solid fa-rotate-right"></i> Reconectar
              </button>
              <button
                type="button"
                className="network-status-btn-close"
                onClick={dismiss}
                title="Dispensar aviso"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </>
        ) : (
          <>
            <i className="fa-solid fa-circle-check network-status-icon" aria-hidden="true"></i>
            <span className="network-status-text">
              <strong>Conexão restabelecida!</strong> Sincronizando telemetria e mensagens...
            </span>
            <button
              type="button"
              className="network-status-btn-close"
              onClick={dismiss}
              title="Dispensar aviso"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

