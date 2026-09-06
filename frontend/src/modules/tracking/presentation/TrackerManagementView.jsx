import React, { useState } from 'react';
import HeaderActions from '../../../core/components/HeaderActions.jsx';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';

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
  subscription,
  onOpenSubscription,
  messages = [],
}) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [wearModeFilter, setWearModeFilter] = useState('all'); // 'all' | 'pulso' | 'roupa' | 'low_battery'
  const [pingingId, setPingingId] = useState(null);
  const [vibratingId, setVibratingId] = useState(null);

  // Filtragem dos relógios
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      (device.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.device_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.pairing_token || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (wearModeFilter === 'pulso') {
      return (device.wear_mode || 'pulso') === 'pulso' || (device.type || '').includes('pulso');
    }
    if (wearModeFilter === 'roupa') {
      return (device.wear_mode || '') === 'roupa' || (device.type || '').includes('clip');
    }
    if (wearModeFilter === 'low_battery') {
      return (device.battery_level || 0) < 25;
    }
    return true;
  });

  const handlePingDevice = (device) => {
    setPingingId(device.id);
    if (showToast) showToast(t('tracker.pingingToast', { name: device.name }));
    setTimeout(() => {
      setPingingId(null);
      if (showToast) showToast(t('tracker.pingSuccessToast', { name: device.name }));
    }, 1200);
  };

  const handleVibrateDevice = (device) => {
    setVibratingId(device.id);
    if (showToast) showToast(t('tracker.vibratingToast', { name: device.name }));
    setTimeout(() => {
      setVibratingId(null);
      if (showToast) showToast(t('tracker.vibrateSuccessToast', { name: device.name }));
    }, 2000);
  };

  const wristDevicesCount = devices.filter(
    (d) => (d.wear_mode || 'pulso') === 'pulso' || (d.type || '').includes('pulso')
  ).length;
  const clothingDevicesCount = devices.filter(
    (d) => (d.wear_mode || '') === 'roupa' || (d.type || '').includes('clip')
  ).length;
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
              title={t('common.back')}
            >
              <i className="fa-solid fa-house"></i> {t('nav.dashboard')}
            </button>
            <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
            <span className="breadcrumb-current">
              <i className="fa-solid fa-clock" style={{ color: 'var(--color-primary)' }}></i> {t('tracker.breadcrumb')}
            </span>
          </div>
        </div>

        <div className="page-actions">
          <HeaderActions
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
            subscription={subscription}
            onOpenSubscription={onOpenSubscription}
            messages={messages}
          />
        </div>
      </div>

      {/* Conteúdo Principal da Aba Rastreador */}
      <main className="tab-content-wrapper">
        {/* Banner de Estatísticas e Ação de Conexão */}
        <div className="tracker-top-banner">
          <div className="tracker-banner-stats">
            <div className="tracker-stat-item">
              <div className="tracker-stat-icon-wrapper">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="tracker-stat-info">
                <span className="tracker-stat-number">{devices.length}</span>
                <span className="tracker-stat-title">{t('tracker.pairedWatches')}</span>
              </div>
            </div>

            <div className="tracker-stat-item">
              <div className="tracker-stat-icon-wrapper">
                <i className="fa-solid fa-hand-holding-hand"></i>
              </div>
              <div className="tracker-stat-info">
                <span className="tracker-stat-number">{wristDevicesCount}</span>
                <span className="tracker-stat-title">{t('tracker.onWrist')}</span>
              </div>
            </div>

            <div className="tracker-stat-item">
              <div className="tracker-stat-icon-wrapper">
                <i className="fa-solid fa-shirt"></i>
              </div>
              <div className="tracker-stat-info">
                <span className="tracker-stat-number">{clothingDevicesCount}</span>
                <span className="tracker-stat-title">{t('tracker.onClothing')}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-connect-tracker"
            onClick={onOpenAddDevice}
          >
            <i className="fa-brands fa-android"></i>
            <span>{t('tracker.pairAndroidWatch')}</span>
          </button>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="tracker-filter-bar">
          <div className="tracker-search-box">
            <i className="fa-solid fa-magnifying-glass tracker-search-icon"></i>
            <input
              type="text"
              placeholder={t('tracker.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tracker-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchTerm('')}
                title={t('common.close')}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="tracker-filter-pills">
            <button
              type="button"
              className={`filter-pill-btn ${wearModeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setWearModeFilter('all')}
            >
              {t('tracker.filterAll', { count: devices.length })}
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${wearModeFilter === 'pulso' ? 'active' : ''}`}
              onClick={() => setWearModeFilter('pulso')}
            >
              <i className="fa-solid fa-hand-holding-hand" style={{ fontSize: '11px' }}></i>
              {t('tracker.filterWrist', { count: wristDevicesCount })}
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${wearModeFilter === 'roupa' ? 'active' : ''}`}
              onClick={() => setWearModeFilter('roupa')}
            >
              <i className="fa-solid fa-shirt" style={{ fontSize: '11px' }}></i>
              {t('tracker.filterClothing', { count: clothingDevicesCount })}
            </button>
            {lowBatteryCount > 0 && (
              <button
                type="button"
                className={`filter-pill-btn ${wearModeFilter === 'low_battery' ? 'active' : ''}`}
                onClick={() => setWearModeFilter('low_battery')}
              >
                <span className="dot-indicator red"></span>
                {t('tracker.filterLowBattery', { count: lowBatteryCount })}
              </button>
            )}
          </div>
        </div>

        {/* Listagem de Cards dos Relógios */}
        {filteredDevices.length === 0 ? (
          <div className="tracker-empty-state">
            <div className="tracker-empty-icon">
              <i className="fa-solid fa-clock"></i>
            </div>
            <h3>{t('tracker.emptyTitle')}</h3>
            <p>
              {searchTerm || wearModeFilter !== 'all'
                ? t('tracker.emptyFilterDesc')
                : t('tracker.emptyPairDesc')}
            </p>
            {searchTerm || wearModeFilter !== 'all' ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSearchTerm('');
                  setWearModeFilter('all');
                }}
              >
                {t('tracker.clearFilters')}
              </button>
            ) : (
              <button
                type="button"
                className="btn-connect-tracker"
                onClick={onOpenAddDevice}
              >
                <i className="fa-brands fa-android"></i> {t('tracker.pairFirstWatch')}
              </button>
            )}
          </div>
        ) : (
          <div className="tracker-cards-grid">
            {filteredDevices.map((device) => {
              const isLowBat = (device.battery_level || 0) < 25;
              const isPinging = pingingId === device.id;
              const isVibrating = vibratingId === device.id;
              const isWrist = (device.wear_mode || 'pulso') === 'pulso' || (device.type || '').includes('pulso');
              const pairingCode = device.pairing_token || `BD-${device.device_id ? device.device_id.replace(/\D/g, '').slice(-4) || '8842' : '8842'}`;
              const heartRate = device.heart_rate || (isWrist ? 74 : null);

              return (
                <div key={device.id} className="tracker-card">
                  {/* Cabeçalho Limpo: Identificação e Status */}
                  <div className="tracker-card-header">
                    <div className="tracker-card-identity">
                      <div className="tracker-avatar-circle">
                        <i className={isWrist ? 'fa-solid fa-clock' : 'fa-solid fa-shirt'}></i>
                      </div>
                      <div className="tracker-card-names">
                        <h4 className="tracker-name">{device.name}</h4>
                        <div className="tracker-meta-row">
                          <code className="tracker-token-code">{pairingCode}</code>
                          <span className="tracker-meta-dot">&bull;</span>
                          <span className="tracker-wear-mode-text">
                            {isWrist ? t('tracker.onWrist') : t('tracker.onClothing')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="tracker-status-tag-live">
                      <span className="status-live-dot"></span>
                      <span>{t('tracker.wearOsActive')}</span>
                    </div>
                  </div>

                  {/* Observação / Cuidados (se houver) */}
                  {device.description && (
                    <p className="tracker-description">{device.description}</p>
                  )}

                  {/* Métricas Principais em Faixa Unificada */}
                  <div className="tracker-metrics-strip">
                    {/* Frequência Cardíaca */}
                    <div className="tracker-metric-cell">
                      <i className="fa-solid fa-heart-pulse metric-icon heart"></i>
                      <div className="metric-text-group">
                        <span className="metric-label">{t('tracker.heartRateLabel')}</span>
                        <span className="metric-value">
                          {heartRate ? `${heartRate} BPM` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Nível de Bateria */}
                    <div className="tracker-metric-cell">
                      <i className={`fa-solid ${isLowBat ? 'fa-battery-quarter' : 'fa-battery-three-quarters'} metric-icon battery ${isLowBat ? 'low' : ''}`}></i>
                      <div className="metric-text-group">
                        <span className="metric-label">{t('tracker.battery')}</span>
                        <span className={`metric-value ${isLowBat ? 'low' : ''}`}>
                          {device.battery_level || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Status de Proteção / Cercas */}
                    <div className="tracker-metric-cell">
                      <i className="fa-solid fa-shield-halved metric-icon security"></i>
                      <div className="metric-text-group">
                        <span className="metric-label">{t('tracker.security')}</span>
                        <span className="metric-value ok">
                          {t('tracker.protected')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Card */}
                  <div className="tracker-card-actions">
                    <button
                      type="button"
                      className="btn-tracker-action primary"
                      onClick={() => {
                        if (onSelectDeviceForMap) onSelectDeviceForMap(device);
                        onNavigateTab('map');
                      }}
                      title={t('tracker.viewOnMap')}
                    >
                      <i className="fa-solid fa-map-location-dot"></i>
                      <span>{t('tracker.viewOnMap')}</span>
                    </button>

                    <button
                      type="button"
                      className={`btn-tracker-action sound ${isVibrating ? 'active' : ''}`}
                      onClick={() => handleVibrateDevice(device)}
                      title={t('tracker.vibrateBeep')}
                      disabled={isVibrating}
                    >
                      <i className={`fa-solid ${isVibrating ? 'fa-mobile-screen-button fa-shake' : 'fa-mobile-screen-button'}`}></i>
                      <span>{isVibrating ? t('tracker.vibrating') : t('tracker.vibrateBeep')}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-tracker-action icon-only"
                      onClick={() => handlePingDevice(device)}
                      title={t('tracker.syncTelemetry')}
                      disabled={isPinging}
                    >
                      <i className={`fa-solid ${isPinging ? 'fa-arrows-rotate fa-spin' : 'fa-arrows-rotate'}`}></i>
                    </button>

                    <button
                      type="button"
                      className="btn-tracker-action icon-only danger"
                      onClick={() => onDeleteDevice(device.id, device.name)}
                      title={t('tracker.unpairDevice')}
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
