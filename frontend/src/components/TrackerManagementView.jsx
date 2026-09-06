import React, { useState } from 'react';
import UserAvatarMenu from './UserAvatarMenu.jsx';

export default function TrackerManagementView({
  devices = [],
  onNavigateTab,
  onOpenAddDevice,
  onDeleteDevice,
  onSelectDeviceForMap,
  showToast,
  profile,
  onLogout,
  setProfile,
  token,
  areas = [],
  handleQuickLocate,
  theme,
  toggleTheme,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'online' | 'low_battery'
  const [pingingId, setPingingId] = useState(null);
  const [beepingId, setBeepingId] = useState(null);

  // Filtragem dos dispositivos
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      (device.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.device_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'online') {
      return (device.battery_level || 0) > 0;
    }
    if (statusFilter === 'low_battery') {
      return (device.battery_level || 0) < 25;
    }
    return true;
  });

  const handlePingDevice = (device) => {
    setPingingId(device.id);
    if (showToast) showToast(`Atualizando telemetria do rastreador ${device.name}...`);
    setTimeout(() => {
      setPingingId(null);
      if (showToast) showToast(`Sinal do rastreador ${device.name} recebido com sucesso (GPS Satélite 100%).`);
    }, 1200);
  };

  const handleBeepDevice = (device) => {
    setBeepingId(device.id);
    if (showToast) showToast(`Enviando sinal sonoro para ${device.name} (Buzzer ativado)...`);
    setTimeout(() => {
      setBeepingId(null);
      if (showToast) showToast(`Alerta sonoro executado no dispositivo ${device.name}.`);
    }, 2000);
  };

  const healthyBatteryCount = devices.filter((d) => (d.battery_level || 0) >= 25).length;
  const lowBatteryCount = devices.filter((d) => (d.battery_level || 0) < 25).length;

  return (
    <>
      {/* Header Compacto da Página */}
      <div className="page-header">
        <div className="page-title">
          <div className="header-breadcrumbs">
            <button
              type="button"
              className="breadcrumb-home-btn"
              onClick={() => onNavigateTab('dashboard')}
              title="Voltar ao Dashboard"
            >
              <i className="fa-solid fa-house"></i> Dashboard
            </button>
            <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
            <span className="breadcrumb-current">
              <i className="fa-solid fa-microchip" style={{ color: 'var(--color-primary)' }}></i> Rastreador
            </span>
          </div>
        </div>

        <div className="page-actions">
          <UserAvatarMenu
            profile={profile}
            onNavigateTab={onNavigateTab}
            onLogout={onLogout}
            onProfileUpdated={setProfile}
            token={token}
            showToast={showToast}
            devicesCount={devices.length}
            areasCount={areas.length || 3}
            onEmergencySOS={handleQuickLocate}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      </div>

      {/* Conteúdo Principal da Aba Rastreador */}
      <main className="tab-content-wrapper">
        {/* Banner de Estatísticas e Ação de Conexão */}
        <div className="tracker-top-banner">
          <div className="tracker-banner-stats">
            <div className="tracker-stat-item">
              <div className="tracker-stat-icon-wrapper primary">
                <i className="fa-solid fa-microchip"></i>
              </div>
              <div className="tracker-stat-info">
                <span className="tracker-stat-number">{devices.length}</span>
                <span className="tracker-stat-title">Rastreadores Pareados</span>
              </div>
            </div>

            <div className="tracker-stat-item">
              <div className="tracker-stat-icon-wrapper success">
                <i className="fa-solid fa-satellite"></i>
              </div>
              <div className="tracker-stat-info">
                <span className="tracker-stat-number">{healthyBatteryCount}</span>
                <span className="tracker-stat-title">Sinal GPS Ativo</span>
              </div>
            </div>

            <div className="tracker-stat-item">
              <div className={`tracker-stat-icon-wrapper ${lowBatteryCount > 0 ? 'warning' : 'neutral'}`}>
                <i className="fa-solid fa-battery-half"></i>
              </div>
              <div className="tracker-stat-info">
                <span className="tracker-stat-number">{lowBatteryCount}</span>
                <span className="tracker-stat-title">Bateria Baixa</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-connect-tracker"
            onClick={onOpenAddDevice}
          >
            <i className="fa-solid fa-plus"></i>
            <span>Conectar Novo Rastreador</span>
          </button>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="tracker-filter-bar">
          <div className="tracker-search-box">
            <i className="fa-solid fa-magnifying-glass tracker-search-icon"></i>
            <input
              type="text"
              placeholder="Buscar por nome, ID (ex: TRCK-10001) ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tracker-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchTerm('')}
                title="Limpar busca"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="tracker-filter-pills">
            <button
              type="button"
              className={`filter-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Todos ({devices.length})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${statusFilter === 'online' ? 'active' : ''}`}
              onClick={() => setStatusFilter('online')}
            >
              <span className="dot-indicator green"></span>
              Online ({healthyBatteryCount})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${statusFilter === 'low_battery' ? 'active' : ''}`}
              onClick={() => setStatusFilter('low_battery')}
            >
              <span className="dot-indicator red"></span>
              Bateria Baixa ({lowBatteryCount})
            </button>
          </div>
        </div>

        {/* Listagem de Cards de Rastreadores */}
        {filteredDevices.length === 0 ? (
          <div className="tracker-empty-state">
            <div className="tracker-empty-icon">
              <i className="fa-solid fa-satellite-dish"></i>
            </div>
            <h3>Nenhum rastreador encontrado</h3>
            <p>
              {searchTerm || statusFilter !== 'all'
                ? 'Nenhum dispositivo corresponde aos filtros aplicados.'
                : 'Conecte sua primeira pulseira ou dispositivo satelital para começar a monitorar em tempo real.'}
            </p>
            {searchTerm || statusFilter !== 'all' ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Limpar Filtros
              </button>
            ) : (
              <button
                type="button"
                className="btn-connect-tracker"
                onClick={onOpenAddDevice}
              >
                <i className="fa-solid fa-plus"></i> Conectar Primeiro Rastreador
              </button>
            )}
          </div>
        ) : (
          <div className="tracker-cards-grid">
            {filteredDevices.map((device) => {
              const isLowBat = (device.battery_level || 0) < 25;
              const isCriticalBat = (device.battery_level || 0) < 15;
              const isPinging = pingingId === device.id;
              const isBeeping = beepingId === device.id;

              return (
                <div key={device.id} className="tracker-card">
                  {/* Cabeçalho do Card */}
                  <div className="tracker-card-header">
                    <div className="tracker-card-identity">
                      <div className="tracker-avatar-circle">
                        <i className="fa-solid fa-satellite"></i>
                        <span className="tracker-pulse-dot" title="Transmitindo GPS"></span>
                      </div>
                      <div className="tracker-card-names">
                        <h4 className="tracker-name">{device.name}</h4>
                        <div className="tracker-id-badge">
                          <code>{device.device_id || 'TRCK-DEFAULT'}</code>
                          <span className="tracker-type-pill">{device.type || 'GPS Tracker'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="tracker-status-tag-live">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>Conectado</span>
                    </div>
                  </div>

                  {/* Descrição do dispositivo */}
                  {device.description && (
                    <p className="tracker-description">{device.description}</p>
                  )}

                  {/* Nível da Bateria com Barra */}
                  <div className="tracker-battery-section">
                    <div className="tracker-battery-header">
                      <span className="tracker-battery-label">
                        <i
                          className={`fa-solid ${
                            isLowBat ? 'fa-battery-quarter' : 'fa-battery-full'
                          }`}
                          style={{ color: isCriticalBat ? 'var(--color-danger)' : isLowBat ? 'var(--color-warning)' : 'var(--color-success)' }}
                        ></i>
                        Bateria do Dispositivo
                      </span>
                      <strong className={`tracker-battery-val ${isLowBat ? 'low' : 'ok'}`}>
                        {device.battery_level || 0}%
                      </strong>
                    </div>
                    <div className="tracker-battery-bar-track">
                      <div
                        className={`tracker-battery-bar-fill ${
                          isCriticalBat ? 'critical' : isLowBat ? 'warning' : 'healthy'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, device.battery_level || 0))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Telemetria e Coordenadas */}
                  <div className="tracker-telemetry-box">
                    <div className="tracker-telemetry-row">
                      <span className="telemetry-label">
                        <i className="fa-solid fa-location-crosshairs"></i> Posição GPS:
                      </span>
                      <span className="telemetry-val">
                        {device.lat ? device.lat.toFixed(5) : '-23.5505'}, {device.lng ? device.lng.toFixed(5) : '-46.6333'}
                      </span>
                    </div>
                    <div className="tracker-telemetry-row">
                      <span className="telemetry-label">
                        <i className="fa-solid fa-shield-heart"></i> Segurança:
                      </span>
                      <span className="telemetry-val safe">
                        3 Cercas Ativas (InCor, Casa, Parque)
                      </span>
                    </div>
                  </div>

                  {/* Ações do Rastreador */}
                  <div className="tracker-card-actions">
                    <button
                      type="button"
                      className="btn-tracker-action primary"
                      onClick={() => {
                        if (onSelectDeviceForMap) onSelectDeviceForMap(device);
                        onNavigateTab('map');
                      }}
                      title="Localizar no Mapa Satelital"
                    >
                      <i className="fa-solid fa-map-location-dot"></i>
                      <span>Ver no Mapa</span>
                    </button>

                    <button
                      type="button"
                      className={`btn-tracker-action sound ${isBeeping ? 'active' : ''}`}
                      onClick={() => handleBeepDevice(device)}
                      title="Disparar bipe sonoro no rastreador"
                      disabled={isBeeping}
                    >
                      <i className={`fa-solid ${isBeeping ? 'fa-volume-high fa-bounce' : 'fa-volume-high'}`}></i>
                      <span>{isBeeping ? 'Bipando...' : 'Tocar Bip'}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-tracker-action refresh"
                      onClick={() => handlePingDevice(device)}
                      title="Solicitar ping de localização"
                      disabled={isPinging}
                    >
                      <i className={`fa-solid ${isPinging ? 'fa-arrows-rotate fa-spin' : 'fa-arrows-rotate'}`}></i>
                    </button>

                    <button
                      type="button"
                      className="btn-tracker-action danger"
                      onClick={() => onDeleteDevice(device.id, device.name)}
                      title="Desconectar e excluir rastreador"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
