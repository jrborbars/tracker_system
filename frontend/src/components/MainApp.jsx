import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';
import AddDeviceModal from './AddDeviceModal.jsx';
import LeafletMapView from './LeafletMapView.jsx';
import IndoorMonitoringView from './IndoorMonitoringView.jsx';
import CareGroupsChatView from './CareGroupsChatView.jsx';
import TrackerManagementView from './TrackerManagementView.jsx';
import UserAvatarMenu from './UserAvatarMenu.jsx';
import logoIconSvg from '../assets/logo-icon.svg';
import logoTextSvg from '../assets/logo-text.svg';
import {
  getProfile,
  getDevices,
  getAreas,
  getMessages,
  createDevice,
  deleteDevice,
} from '../api/client.js';
import socketService from '../services/socketService.js';
import '../styles/MainApp.css';

export default function MainApp({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [devices, setDevices] = useState([]);
  const [areas, setAreas] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      showToast(`Tema alterado para ${next === 'dark' ? 'Modo Escuro 🌙' : 'Modo Claro ☀️'}`);
      return next;
    });
  };

  // Carrega todos os dados da API ao iniciar
  const loadData = async () => {
    try {
      const [profData, devData, areaData, msgData] = await Promise.all([
        getProfile(token),
        getDevices(token),
        getAreas(token),
        getMessages(token),
      ]);
      setProfile(profData);
      setDevices(devData);
      setAreas(areaData);
      setMessages(msgData);
    } catch (err) {
      console.error('Erro ao carregar dados do app:', err);
    }
  };

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
      showToast(`🚨 ALERTA SOS RECEBIDO: ${sosData.patient || 'Paciente'} (${sosData.location})`);
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
  }, [token]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Ação de Emergência SOS / Localizar Rápido
  const handleQuickLocate = () => {
    setSosActive(true);
    setActiveTab('map');
    showToast('🚨 Protocolo SOS Ativado! Localizando familiar via satélite e traçando rotas de socorro.');
    setTimeout(() => setSosActive(false), 8000);
  };

  // Cadastrar Dispositivo
  const handleAddDevice = async (deviceData) => {
    await createDevice(token, deviceData);
    await loadData();
    showToast(`Rastreador "${deviceData.name}" conectado com sucesso!`);
  };

  // Excluir Dispositivo
  const handleDeleteDevice = async (id, name) => {
    if (window.confirm(`Deseja realmente remover o rastreador "${name}"?`)) {
      await deleteDevice(token, id);
      await loadData();
      showToast(`Rastreador "${name}" removido.`);
    }
  };

  const avgBattery = devices.length
    ? Math.round(devices.reduce((acc, d) => acc + (d.battery_level || 0), 0) / devices.length)
    : 0;

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
        onOpenAddDevice={() => setIsAddModalOpen(true)}
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
          <UserAvatarMenu
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
                    <i className="fa-solid fa-house"></i> Dashboard
                  </span>
                </div>
              </div>
              <div className="page-actions">
                <UserAvatarMenu
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
                    <h3>Localização Rápida de Emergência (SOS)</h3>
                    <p>
                      Rastreio e socorro imediato via satélite em caso de emergência.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-locate-emergency"
                  onClick={handleQuickLocate}
                >
                  <i className="fa-solid fa-crosshairs"></i> LOCALIZAR AGORA
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
                    <div className="stat-label">Familiares Conectados</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon battery">
                    <i className="fa-solid fa-battery-three-quarters"></i>
                  </div>
                  <div className="stat-data">
                    <div className="stat-value">{avgBattery}%</div>
                    <div className="stat-label">Bateria Média dos Dispositivos</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon geofences">
                    <i className="fa-solid fa-draw-polygon"></i>
                  </div>
                  <div className="stat-data">
                    <div className="stat-value">{areas.length}</div>
                    <div className="stat-label">Zonas Seguras Configuradas</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon alerts">
                    <i className="fa-solid fa-bell"></i>
                  </div>
                  <div className="stat-data">
                    <div className="stat-value">{messages.length}</div>
                    <div className="stat-label">Alertas Registrados</div>
                  </div>
                </div>
              </div>

              {/* Lista de Rastreadores / Familiares */}
              <div className="section-heading">
                <h2>
                  <i className="fa-solid fa-satellite-dish" style={{ color: 'var(--color-primary)' }}></i>
                  Status dos Rastreadores Satelitais
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Atualização contínua via constelação GPS
                </span>
              </div>

              {devices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
                  <i className="fa-solid fa-satellite" style={{ fontSize: '36px', color: 'var(--color-primary-subtle)', marginBottom: '12px' }}></i>
                  <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>Nenhum rastreador conectado</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
                    Conecte a primeira pulseira ou dispositivo satelital para iniciar o acompanhamento.
                  </p>
                  <button type="button" className="btn-primary-action" style={{ margin: '0 auto' }} onClick={() => setIsAddModalOpen(true)}>
                    <i className="fa-solid fa-plus"></i> Conectar Primeiro Dispositivo
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
                          <i className="fa-solid fa-shield-halved"></i> Zona Segura Ativa
                        </span>
                        <span className={`badge-chip ${device.battery_level < 25 ? 'battery-low' : 'battery-ok'}`}>
                          <i className="fa-solid fa-battery-three-quarters"></i> {device.battery_level}%
                        </span>
                      </div>

                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {device.description}
                      </p>

                      <div style={{ fontSize: '11px', color: 'var(--text-light)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Lat: {device.lat ? device.lat.toFixed(4) : 'Simulado'}</span>
                        <span>Lng: {device.lng ? device.lng.toFixed(4) : 'Simulado'}</span>
                      </div>

                      <div className="device-actions">
                        <button
                          type="button"
                          className="btn-card-action primary"
                          onClick={() => {
                            setSelectedDevice(device);
                            setActiveTab('map');
                          }}
                        >
                          <i className="fa-solid fa-map-pin"></i> Ver no Mapa
                        </button>
                        <button
                          type="button"
                          className="btn-card-action danger"
                          onClick={() => handleDeleteDevice(device.id, device.name)}
                          title="Remover Dispositivo"
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
                    title="Voltar ao Dashboard"
                  >
                    <i className="fa-solid fa-house"></i> Dashboard
                  </button>
                  <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
                  <span className="breadcrumb-current">
                    <i className="fa-solid fa-map-location-dot" style={{ color: 'var(--color-primary)' }}></i> Mapa Satelital & Cercas
                  </span>
                </div>
              </div>
              <div className="page-actions">
                <button
                  type="button"
                  className="btn-locate-emergency"
                  onClick={handleQuickLocate}
                >
                  <i className="fa-solid fa-crosshairs"></i> Protocolo SOS
                </button>
                <UserAvatarMenu
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
                />
              </div>
            </div>

            <main className="tab-content-wrapper map-tab-wrapper">
              <div className="map-container-card">
                <div className="map-header-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    <i className="fa-solid fa-satellite" style={{ color: 'var(--color-primary)' }}></i>
                    Sinal GPS Satelital: <span style={{ color: 'var(--color-success-dark)', fontWeight: 700 }}>Conectado (Alta Precisão Leaflet)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge-chip safe">
                      <i className="fa-solid fa-draw-polygon"></i> 3 Cercas Ativas (InCor, Casa, Parque)
                    </span>
                    <span className="badge-chip battery-ok">
                      <i className="fa-solid fa-user-check"></i> {devices.length} Rastreadores no Radar
                    </span>
                  </div>
                </div>

                <div className="map-viewport">
                  <LeafletMapView
                    devices={devices}
                    areas={areas}
                    onEmergencyAlert={handleQuickLocate}
                    showToast={showToast}
                    theme={theme}
                  />
                </div>

              </div>
            </main>
          </>
        )}


        {/* -------------------------------------------------------------
            ABA INTERMEDIÁRIA: MONITORAMENTO INTERNO (SENSORES & CÔMODOS)
           ------------------------------------------------------------- */}
        {activeTab === 'indoor' && (
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
          />
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
                    title="Voltar ao Dashboard"
                  >
                    <i className="fa-solid fa-house"></i> Dashboard
                  </button>
                  <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
                  <span className="breadcrumb-current">
                    <i className="fa-solid fa-comments" style={{ color: 'var(--color-primary)' }}></i> Grupos & Mensagens
                  </span>
                </div>
              </div>
              <div className="page-actions">
                <UserAvatarMenu
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
                />
              </div>
            </div>

            <main className="tab-content-wrapper messages-tab-wrapper">
              <CareGroupsChatView
                profile={profile}
                devices={devices}
                onNavigateTab={setActiveTab}
                showToast={showToast}
                onQuickLocate={handleQuickLocate}
              />
            </main>
          </>
        )}

        {/* -------------------------------------------------------------
            ABA: RASTREADOR (GERENCIAMENTO DE DISPOSITIVOS GPS)
           ------------------------------------------------------------- */}
        {activeTab === 'tracker' && (
          <TrackerManagementView
            devices={devices}
            onNavigateTab={setActiveTab}
            onOpenAddDevice={() => setIsAddModalOpen(true)}
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
          />
        )}

        {/* -------------------------------------------------------------
            ABA 5: PERFIL FAMILIAR
           ------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <>
            <div className="page-header">
              <div className="page-title">
                <div className="header-breadcrumbs">
                  <button
                    type="button"
                    className="breadcrumb-home-btn"
                    onClick={() => setActiveTab('dashboard')}
                    title="Voltar ao Dashboard"
                  >
                    <i className="fa-solid fa-house"></i> Dashboard
                  </button>
                  <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
                  <span className="breadcrumb-current">
                    <i className="fa-solid fa-user-shield" style={{ color: 'var(--color-primary)' }}></i> Perfil do Cuidador
                  </span>
                </div>
              </div>
              <div className="page-actions">
                <UserAvatarMenu
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
                />
              </div>
            </div>

            <main className="tab-content-wrapper">
              <div className="profile-view-card">
                <div className="profile-avatar-large">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {profile ? profile.name : 'Carregando...'}
                </h2>
                <span style={{ fontSize: '13px', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                  Cuidador Principal Responsável
                </span>

                <div className="profile-details-grid">
                  <div className="profile-field">
                    <label>E-mail Cadastrado</label>
                    <span>{profile ? profile.email : '...'}</span>
                  </div>

                  <div className="profile-field">
                    <label>Telefone de Contato / WhatsApp</label>
                    <span>{profile ? profile.phone : '...'}</span>
                  </div>

                  <div className="profile-field">
                    <label>Plano de Monitoramento</label>
                    <span>Betterdays Satélite 24/7 (Ativo)</span>
                  </div>

                  <div className="profile-field">
                    <label>ID da Conta</label>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                      {profile ? profile.id.slice(0, 18) + '...' : '...'}
                    </span>
                  </div>
                </div>

                {/* Protocolo Médico da Síndrome de Eisenmenger */}
                <div className="medical-protocol-box">
                  <h4>
                    <i className="fa-solid fa-heart-pulse"></i>
                    Protocolo de Emergência — Síndrome de Eisenmenger
                  </h4>
                  <ul>
                    <li><strong>Cardiologista de Referência:</strong> Dr. Carlos Mendonça &bull; Tel: (11) 98765-4321</li>
                    <li><strong>Hospital de Emergência:</strong> Instituto do Coração (InCor) &bull; Pronto-Socorro 24h</li>
                    <li><strong>Observações Clínicas:</strong> Paciente cianótico crônico. Em caso de síncope, manter deitado, administrar O2 suplementar e acionar o socorro imediatamente.</li>
                  </ul>
                </div>

                <div style={{ marginTop: '28px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => showToast('Configurações salvas com sucesso.')}
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Editar Perfil
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={onLogout}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i> Encerrar Sessão
                  </button>
                </div>
              </div>
            </main>
          </>
        )}

      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (Barra inferior com botões) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={messages.filter((m) => m.active).length}
        onOpenAddDevice={() => setIsAddModalOpen(true)}
      />

      {/* 4. MODAL DE ADICIONAR DISPOSITIVO */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDevice={handleAddDevice}
      />
    </div>
  );
}
