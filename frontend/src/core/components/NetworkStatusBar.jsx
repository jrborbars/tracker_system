import React from 'react';
import useNetworkStatus from '../hooks/useNetworkStatus';

export default function NetworkStatusBar() {
  const { isOnline, showReconnected } = useNetworkStatus();

  if (isOnline && !showReconnected) {
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
          </>
        ) : (
          <>
            <i className="fa-solid fa-circle-check network-status-icon" aria-hidden="true"></i>
            <span className="network-status-text">
              <strong>Conexão restabelecida!</strong> Sincronizando telemetria e mensagens...
            </span>
          </>
        )}
      </div>
    </aside>
  );
}
