import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Sidebar from '../../../core/components/Sidebar.jsx';
import BottomNav from '../../../core/components/BottomNav.jsx';
import HeaderActions from '../../../core/components/HeaderActions.jsx';
import NetworkStatusBar from '../../../core/components/NetworkStatusBar.jsx';
import logoIconSvg from '../../../assets/logo-icon.svg';
import logoTextSvg from '../../../assets/logo-text.svg';
import profileRepository from '../../profile/infrastructure/profileRepository.js';
import trackingRepository from '../../tracking/infrastructure/trackingRepository.js';
import chatRepository from '../../care-chat/infrastructure/chatRepository.js';
import subscriptionRepository from '../../subscription/infrastructure/subscriptionRepository.js';
import { canAddDevice } from '../../subscription/domain/subscriptionModel.js';
import socketService from '../../../core/services/socketService.js';
import notificationService from '../../../core/services/notificationService.js';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';
import '../../../styles/MainApp.css';

// Code Splitting sob demanda para carregamento instantâneo do bundle
const LeafletMapView = lazy(() => import('../../tracking/presentation/LeafletMapView.jsx'));
const TrackerManagementView = lazy(() => import('../../tracking/presentation/TrackerManagementView.jsx'));
const AddDeviceModal = lazy(() => import('../../tracking/presentation/AddDeviceModal.jsx'));
const IndoorMonitoringView = lazy(() => import('../../indoor/presentation/IndoorMonitoringView.jsx'));
const CareGroupsChatView = lazy(() => import('../../care-chat/presentation/CareGroupsChatView.jsx'));
const ProfileView = lazy(() => import('../../profile/presentation/ProfileView.jsx'));
const SubscriptionPlansModal = lazy(() => import('../../subscription/presentation/SubscriptionPlansModal.jsx'));

function TabLoadingFallback() {
  const { t } = useI18n();
  return (
    <div
      className="tab-loading-fallback"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '320px',
        padding: '40px 20px',
        gap: '14px',
        color: 'var(--color-text-muted, #64748b)',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(13, 148, 136, 0.2)',
          borderTopColor: 'var(--color-primary, #0D9488)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text, #1e293b)' }}>
        {t('common.loadingModule')}
      </span>
    </div>
  );
}

export default function MainApp({ token, onLogout }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return sessionStorage.getItem('betterdays_active_tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  const [profile, setProfile] = useState(null);
  const [devices, setDevices] = useState([]);
  const [areas, setAreas] = useState([]);
  const [messages, setMessages] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('betterdays_theme') || 'light');

  // Sincronizar tema com atributo data-theme no HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('betterdays_theme', theme);
  }, [theme]);

  // Sincronizar aba ativa para persistir durante recarregamento
  useEffect(() => {
    try {
      sessionStorage.setItem('betterdays_active_tab', activeTab);
    } catch (err) {
      console.error('Erro ao salvar aba ativa:', err);
    }
  }, [activeTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      showToast(`Tema alterado para ${next === 'dark' ? 'Modo Escuro' : 'Modo Claro'}`);
      return next;
    });
  };

  // Carrega todos os dados da API ao iniciar
  const loadData = useCallback(async () => {
    try {
      const [profData, devData, areaData, msgData, subData] = await Promise.all([
        profileRepository.getProfile(token),
        trackingRepository.getDevices(token),
        trackingRepository.getAreas(token),
        chatRepository.getMessages(token),
        subscriptionRepository.getCurrentSubscription(token).catch(() => null),
      ]);
      setProfile(profData);
      setDevices(devData);
      setAreas(areaData);
      setMessages(msgData);
      if (subData?.subscription) {
        setSubscription(subData.subscription);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do app:', err);
      const errMsg = err?.message || '';
      if (
        errMsg.includes('401') ||
        errMsg.toLowerCase().includes('unauthorized') ||
        errMsg.toLowerCase().includes('token') ||
        errMsg.toLowerCase().includes('não autorizado')
      ) {
        if (onLogout) onLogout();
      }
    }
  }, [token, onLogout]);

  useEffect(() => {
    loadData();

    // Conectar WebSocket para atualizações em tempo real instantâneas
    const socket = socketService.connect();

    const handleTelemetryPulse = (data) => {
      setDevices((prevDevices) =>
        prevDevices.map((dev) => {
          if (dev.device_id === data.deviceId) {
            return {
              ...dev,
              lat: data.lat ?? dev.lat,
              lng: data.lng ?? dev.lng,
              battery_level: data.battery ?? dev.battery_level,
              last_seen: data.timestamp ?? dev.last_seen,
            };
          }
          return dev;
        })
      );
    };

    const handleSosAlert = (sosData) => {
      setSosActive(true);
      showToast(`ALERTA SOS RECEBIDO: ${sosData.patient || 'Paciente'} (${sosData.location})`);
      // Disparar notificação nativa do sistema operacional (Desktop / Android)
      notificationService.notifyEmergencySOS(
        sosData.patient || 'Familiar / Paciente',
        `Localização: ${sosData.location || 'Coordenadas GPS transmitidas'}`
      );
      setTimeout(() => setSosActive(false), 8000);
    };

    socket.on('telemetry_pulse', handleTelemetryPulse);
    socket.on('sos_alert', handleSosAlert);

    // Polling de fallback a cada 15 segundos
    const interval = setInterval(loadData, 15000);

    return () => {
      socket.off('telemetry_pulse', handleTelemetryPulse);
      socket.off('sos_alert', handleSosAlert);
      clearInterval(interval);
    };
  }, [loadData]);

  // Ação de Emergência SOS / Localizar Rápido
  const handleQuickLocate = () => {
    setSosActive(true);
    setActiveTab('map');
    showToast(t('dashboard.emergencyActive'));
  };

  const handleOpenAddDevice = () => {
    if (!canAddDevice(devices.length, subscription)) {
      showToast(t('subscription.deviceLimitReached', { max: subscription?.maxDevices || 1 }));
      setIsSubscriptionModalOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleAddDevice = async (deviceData) => {
    try {
      if (!canAddDevice(devices.length, subscription)) {
        showToast(t('subscription.deviceLimitReached', { max: subscription?.maxDevices || 1 }));
        setIsSubscriptionModalOpen(true);
        return;
      }
      const created = await trackingRepository.createDevice(token, deviceData);
      setDevices((prev) => [...prev, created]);
      showToast(t('tracking.addSuccess'));
      setIsAddModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Erro ao parear dispositivo.');
    }
  };

  const handleDeleteDevice = async (id, name) => {
    if (window.confirm(t('tracking.deleteConfirm'))) {
      await trackingRepository.deleteDevice(token, id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
      showToast(t('tracking.deleteSuccess'));
    }
  };

  const avgBattery = devices.length
    ? Math.round(devices.reduce((acc, d) => acc + (d.battery_level || 0), 0) / devices.length)
    : 0;

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Indicador Global de Rede (PWA Offline / Reconnected) */}
      <NetworkStatusBar />

      {/* 1. SIDEBAR DESKTOP (Menu à esquerda) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={messages.filter((m) => m.active).length}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAddDevice={handleOpenAddDevice}
      />


      {/* 2. ÁREA PRINCIPAL */}
      <div className="main-content">
        
        {/* Topbar Mobile (Visível apenas em telas menores) */}
        <header className="mobile-topbar">
          <div className="mobile-topbar-spacer" aria-hidden="true"></div>
          <div className="mobile-brand">
            <img src={logoIconSvg} alt="Betterdays" className="mobile-logo-icon" />
            <img src={logoTextSvg} alt="Betterdays" className="mobile-logo-text" />
          </div>
          <HeaderActions
            profile={profile}
            onNavigateTab={setActiveTab}
            onLogout={onLogout}
            onProfileUpdated={setProfile}
            token={token}
            showToast={showToast}
            isMobile={true}
            devicesCount={devices.length}
            areasCount={areas.length || 3}
            onEmergencySOS={handleQuickLocate}
            theme={theme}
            onToggleTheme={toggleTheme}
            subscription={subscription}
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
            messages={messages}
          />
        </header>

        {/* Notificação Toast Flutuante */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              backgroundColor: 'var(--color-primary-dark)',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <i className="fa-solid fa-bell" style={{ color: 'var(--color-warning)' }}></i>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* -------------------------------------------------------------
            ABA 1: DASHBOARD
           ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <>
            <div className="page-header">
              <div className="page-title">
                <div className="header-breadcrumbs">
                  <span className="breadcrumb-current">
                    <i className="fa-solid fa-house"></i> {t('dashboard.breadcrumb')}
                  </span>
                </div>
              </div>
              <div className="page-actions">
                <HeaderActions
                  profile={profile}
                  onNavigateTab={setActiveTab}
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
                  onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
                  messages={messages}
                />
              </div>
            </div>

            <main className="tab-content-wrapper">
              {/* Card de Emergência SOS */}
              <div className="dash-sos-banner">
                <div className="sos-info">
                  <div className="sos-pulse-icon">
                    <i className="fa-solid fa-heart-pulse"></i>
                  </div>
                  <div className="sos-text">
                    <h3>{t('dashboard.sosTitle')}</h3>
                    <p>
                      {t('dashboard.sosDesc')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-locate-emergency"
                  onClick={handleQuickLocate}
                >
                  <i className="fa-solid fa-crosshairs"></i> {t('dashboard.locateNow')}
                </button>
              </div>

              {/* Grid de Estatísticas Rápidas */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon devices">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div className="stat-data">
                    <div className="stat-value">{devices.length}</div>
                    <div className="stat-label">{t('dashboard.stats.trackersOnline')}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon battery">
                    <i className="fa-solid fa-battery-three-quarters"></i>
                  </div>
                  <div className="stat-data">
                    <div className="stat-value">{avgBattery}%</div>
                    <div className="stat-label">{t('dashboard.devicesList.battery')}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon geofences">
                    <i className="fa-solid fa-draw-polygon"></i>
                  </div>
                  <div className="stat-data">
                    <div className="stat-value">{areas.length}</div>
                    <div className="stat-label">{t('dashboard.stats.geofencesActive')}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon alerts">
                    <i className="fa-solid fa-bell"></i>
                  </div>
                  <div className="stat-data">
                    <div className="stat-value">{messages.length}</div>
                    <div className="stat-label">{t('dashboard.stats.unreadAlerts')}</div>
                  </div>
                </div>
              </div>

              {/* Lista de Rastreadores / Familiares */}
              <div className="section-heading">
                <h2>
                  <i className="fa-solid fa-satellite-dish" style={{ color: 'var(--color-primary)' }}></i>
                  {t('dashboard.devicesList.title')}
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('dashboard.devicesList.subtitle')}
                </span>
              </div>

              {devices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
                  <i className="fa-solid fa-satellite" style={{ fontSize: '36px', color: 'var(--color-primary-subtle)', marginBottom: '12px' }}></i>
                  <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>{t('dashboard.devicesList.noDevices')}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
                    {t('tracking.addDeviceSubtitle')}
                  </p>
                  <button type="button" className="btn-primary-action" style={{ margin: '0 auto' }} onClick={handleOpenAddDevice}>
                    <i className="fa-solid fa-plus"></i> {t('tracking.addDeviceTitle')}
                  </button>
                </div>
              ) : (
                <div className="devices-cards-grid">
                  {devices.map((device) => (
                    <div key={device.id} className="device-card">
                      <div className="device-card-header">
                        <div className="device-avatar">
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <div className="device-title">
                          <strong>{device.name}</strong>
                          <span>ID: {device.device_id} &bull; {device.type}</span>
                        </div>
                      </div>

                      <div className="device-badge-row">
                        <span className="badge-chip safe">
                          <i className="fa-solid fa-shield-halved"></i> {t('dashboard.stats.geofencesActive')}
                        </span>
                        <span className={`badge-chip ${device.battery_level < 25 ? 'battery-low' : 'battery-ok'}`}>
                          <i className={`fa-solid ${device.battery_level < 25 ? 'fa-battery-quarter' : 'fa-battery-three-quarters'}`}></i> {device.battery_level}%
                        </span>
                      </div>

                      {device.description && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', margin: '0' }}>
                          {device.description}
                        </p>
                      )}

                      <div className="device-actions">
                        <button
                          type="button"
                          className="btn-card-action primary"
                          onClick={() => {
                            setSelectedDevice(device);
                            setActiveTab('map');
                          }}
                        >
                          <i className="fa-solid fa-map-pin"></i> {t('dashboard.devicesList.viewOnMap')}
                        </button>
                        <button
                          type="button"
                          className="btn-card-action danger"
                          onClick={() => handleDeleteDevice(device.id, device.name)}
                          title={t('common.delete')}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        {/* -------------------------------------------------------------
            ABA 2: MAPA SATELITAL REAL (LEAFLET + CARTODB / ESRI)
           ------------------------------------------------------------- */}
        {activeTab === 'map' && (
          <>
            <div className="page-header map-page-header">
              <div className="page-title">
                <div className="header-breadcrumbs">
                  <button
                    type="button"
                    className="breadcrumb-home-btn"
                    onClick={() => setActiveTab('dashboard')}
                    title={t('nav.dashboard')}
                  >
                    <i className="fa-solid fa-house"></i> {t('nav.dashboard')}
                  </button>
                  <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
                  <span className="breadcrumb-current">
                    <i className="fa-solid fa-map-location-dot" style={{ color: 'var(--color-primary)' }}></i> {t('tracking.breadcrumb')}
                  </span>
                </div>
              </div>
              <div className="page-actions">
                <HeaderActions
                  profile={profile}
                  onNavigateTab={setActiveTab}
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
                  onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
                  messages={messages}
                />
              </div>
            </div>

            <main className="tab-content-wrapper map-tab-wrapper">
              <div className="map-container-card">
                <div className="map-header-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    <i className="fa-solid fa-satellite" style={{ color: 'var(--color-primary)' }}></i>
                    {t('tracking.gpsSignal')} <span style={{ color: 'var(--color-success-dark)', fontWeight: 700 }}>{t('tracking.gpsConnected')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge-chip safe">
                      <i className="fa-solid fa-draw-polygon"></i> {t('tracking.geofencesCount', { count: areas.length || 3 })}
                    </span>
                    <span className="badge-chip battery-ok">
                      <i className="fa-solid fa-user-check"></i> {t('tracking.trackersRadar', { count: devices.length })}
                    </span>
                  </div>
                </div>

                <div className="map-viewport">
                  <Suspense fallback={<TabLoadingFallback />}>
                    <LeafletMapView
                      devices={devices}
                      areas={areas}
                      showToast={showToast}
                      theme={theme}
                    />
                  </Suspense>
                </div>

              </div>
            </main>
          </>
        )}


        {/* -------------------------------------------------------------
            ABA INTERMEDIÁRIA: MONITORAMENTO INTERNO (SENSORES & CÔMODOS)
           ------------------------------------------------------------- */}
        {activeTab === 'indoor' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <IndoorMonitoringView
              showToast={showToast}
              profile={profile}
              onNavigateTab={setActiveTab}
              onLogout={onLogout}
              onProfileUpdated={setProfile}
              token={token}
              devicesCount={devices.length}
              areasCount={areas.length || 3}
              onEmergencySOS={handleQuickLocate}
              theme={theme}
              onToggleTheme={toggleTheme}
              subscription={subscription}
              onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
              messages={messages}
            />
          </Suspense>
        )}

        {/* -------------------------------------------------------------
            ABA 4: MENSAGENS & GRUPOS DE CUIDADO (ESTILO WHATSAPP)
           ------------------------------------------------------------- */}
        {activeTab === 'messages' && (
          <>
            <div className="page-header messages-page-header">
              <div className="page-title">
                <div className="header-breadcrumbs">
                  <button
                    type="button"
                    className="breadcrumb-home-btn"
                    onClick={() => setActiveTab('dashboard')}
                    title={t('nav.dashboard')}
                  >
                    <i className="fa-solid fa-house"></i> {t('nav.dashboard')}
                  </button>
                  <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
                  <span className="breadcrumb-current">
                    <i className="fa-solid fa-comments" style={{ color: 'var(--color-primary)' }}></i> {t('chat.breadcrumb')}
                  </span>
                </div>
              </div>
              <div className="page-actions">
                <HeaderActions
                  profile={profile}
                  onNavigateTab={setActiveTab}
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
                  onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
                  messages={messages}
                />
              </div>
            </div>

            <main className="tab-content-wrapper messages-tab-wrapper">
              <Suspense fallback={<TabLoadingFallback />}>
                <CareGroupsChatView
                  profile={profile}
                  devices={devices}
                  onNavigateTab={setActiveTab}
                  showToast={showToast}
                  onQuickLocate={handleQuickLocate}
                />
              </Suspense>
            </main>
          </>
        )}

        {/* -------------------------------------------------------------
            ABA: RASTREADOR (GERENCIAMENTO DE DISPOSITIVOS GPS)
           ------------------------------------------------------------- */}
        {activeTab === 'tracker' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <TrackerManagementView
              devices={devices}
              onNavigateTab={setActiveTab}
              onOpenAddDevice={handleOpenAddDevice}
              onDeleteDevice={handleDeleteDevice}
              onSelectDeviceForMap={(dev) => setSelectedDevice(dev)}
              showToast={showToast}
              profile={profile}
              onLogout={onLogout}
              setProfile={setProfile}
              token={token}
              areas={areas}
              handleQuickLocate={handleQuickLocate}
              theme={theme}
              toggleTheme={toggleTheme}
              subscription={subscription}
              onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
              messages={messages}
            />
          </Suspense>
        )}

        {/* -------------------------------------------------------------
            ABA 5: PERFIL FAMILIAR (EDITÁVEL & UPLOAD DE FOTO)
           ------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <ProfileView
              profile={profile}
              setProfile={setProfile}
              token={token}
              onNavigateTab={setActiveTab}
              onLogout={onLogout}
              showToast={showToast}
              devicesCount={devices.length}
              areasCount={areas.length || 3}
              handleQuickLocate={handleQuickLocate}
              theme={theme}
              toggleTheme={toggleTheme}
              subscription={subscription}
              onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
              messages={messages}
            />
          </Suspense>
        )}

      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (Barra inferior com botões) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={messages.filter((m) => m.active).length}
        onOpenAddDevice={handleOpenAddDevice}
      />

      {/* 4. MODAL DE ADICIONAR DISPOSITIVO */}
      {isAddModalOpen && (
        <Suspense fallback={null}>
          <AddDeviceModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddDevice={handleAddDevice}
          />
        </Suspense>
      )}

      {/* 5. MODAL DE PLANOS & ASSINATURA MERCADO PAGO */}
      {isSubscriptionModalOpen && (
        <Suspense fallback={null}>
          <SubscriptionPlansModal
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            currentSubscription={subscription}
            token={token}
            onSubscriptionUpdated={(sub) => setSubscription(sub)}
            showToast={showToast}
          />
        </Suspense>
      )}
    </div>
  );
}

