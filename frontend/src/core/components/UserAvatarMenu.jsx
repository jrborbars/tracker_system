import React, { useState, useRef, useEffect } from 'react';
import { getUserInitials, getAbsolutePhotoUrl } from '../../modules/profile/domain/profileModel.js';

export default function UserAvatarMenu({
  profile,
  onNavigateTab,
  onLogout,
  onProfileUpdated,
  token,
  showToast,
  isMobile = false,
  devicesCount = 2,
  areasCount = 3,
  onEmergencySOS,
  theme = 'light',
  onToggleTheme,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const menuRef = useRef(null);

  // Detectar se já está instalado ou rodando como PWA standalone
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (showToast) showToast('Aplicativo Betterdays instalado com sucesso!');
      }
      setDeferredPrompt(null);
      setIsOpen(false);
    } else {
      // Dispositivos iOS ou navegadores sem prompt nativo
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        if (showToast) {
          showToast('Para instalar no iPhone/iPad: Toque no botão Compartilhar ⎋ e selecione "Adicionar à Tela de Início ⊞"');
        }
      } else {
        if (showToast) {
          showToast('Para instalar o Betterdays: Clique no ícone de instalar (⊕) na barra de endereços do seu navegador.');
        }
      }
      setIsOpen(false);
    }
  };

  const userName = profile?.name || 'Demo User';
  const userEmail = profile?.email || 'familiar@betterdays.com';
  const initials = getUserInitials(userName);
  const avatarUrl = getAbsolutePhotoUrl(profile?.photo_url);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`user-avatar-menu-wrapper ${isMobile ? 'mobile' : ''}`} ref={menuRef}>
      {/* Botão Gatilho do Avatar (Apenas o Círculo do Avatar) */}
      <button
        type="button"
        className={`btn-user-avatar-trigger ${isOpen ? 'active' : ''} ${isMobile ? 'mobile-trigger' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Menu do Usuário (${userName})`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="avatar-circle">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="avatar-img" />
          ) : (
            <span className="avatar-initials">{initials}</span>
          )}
          <span className="avatar-online-dot" title="Sessão Ativa"></span>
        </div>
      </button>

      {/* Dropdown Menu Flutuante */}
      {isOpen && (
        <div className={`avatar-dropdown-menu ${isMobile ? 'mobile-dropdown' : ''}`}>
          {/* Cabeçalho do Dropdown */}
          <div className="dropdown-user-header">
            <div className="dropdown-avatar-large">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="avatar-img" />
              ) : (
                <span className="avatar-initials-large">{initials}</span>
              )}
            </div>
            <div className="dropdown-user-info">
              <h4 className="dropdown-name">{userName}</h4>
              <p className="dropdown-email">{userEmail}</p>
              <span className="dropdown-badge">
                <i className="fa-solid fa-shield-heart"></i> Cuidador Autorizado
              </span>
            </div>
          </div>

          {/* Botão de Emergência Rápida SOS dentro do Menu */}
          {onEmergencySOS && (
            <div className="dropdown-sos-container">
              <button
                type="button"
                className="dropdown-sos-action-btn"
                onClick={() => {
                  onEmergencySOS();
                  setIsOpen(false);
                }}
              >
                <i className="fa-solid fa-crosshairs"></i>
                <span>Disparar Protocolo SOS</span>
              </button>
            </div>
          )}

          {/* Seção de Status do Sistema & Satélite (Visível no Mobile e Desktop) */}
          <div className="dropdown-telemetry-box">
            <div className="dropdown-telemetry-title">
              <i className="fa-solid fa-satellite-dish" style={{ color: 'var(--color-primary)' }}></i>
              <span>Status do Satélite & Cercas</span>
            </div>
            <div className="dropdown-telemetry-tags">
              <div className="dropdown-tag gps-ok">
                <i className="fa-solid fa-circle-check"></i> GPS: Conectado (Leaflet)
              </div>
              <div className="dropdown-tag geofences">
                <i className="fa-solid fa-draw-polygon"></i> {areasCount} Cercas Ativas (InCor, Casa, Parque)
              </div>
              <div className="dropdown-tag trackers">
                <i className="fa-solid fa-user-check"></i> {devicesCount} Rastreadores no Radar
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Opções do Menu */}
          <div className="dropdown-actions-list">
            {/* Opção Tema: Alternar Modo Escuro / Claro */}
            {onToggleTheme && (
              <button
                type="button"
                className="dropdown-action-item"
                onClick={() => {
                  onToggleTheme();
                }}
              >
                <div className="action-icon-circle theme" style={{ backgroundColor: theme === 'dark' ? '#3B2D05' : '#FFF3E0', color: theme === 'dark' ? '#FBBF24' : '#E65100' }}>
                  <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                </div>
                <div className="action-text">
                  <span className="action-title">
                    {theme === 'dark' ? 'Claro' : 'Escuro'}
                  </span>
                  <span className="action-subtitle">Alternar tema visual</span>
                </div>
              </button>
            )}

            {/* Opção: Configurar Perfil */}
            <button
              type="button"
              className="dropdown-action-item"
              onClick={() => {
                if (onNavigateTab) onNavigateTab('profile');
                setIsOpen(false);
              }}
            >
              <div className="action-icon-circle settings">
                <i className="fa-solid fa-gear"></i>
              </div>
              <div className="action-text">
                <span className="action-title">Configurar</span>
                <span className="action-subtitle">Perfil e dados médicos</span>
              </div>
            </button>

            {/* Opção PWA: Instalar Aplicativo */}
            {!isStandalone && (
              <button
                type="button"
                className="dropdown-action-item"
                onClick={handleInstallPwa}
              >
                <div
                  className="action-icon-circle pwa"
                  style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                >
                  <i className="fa-solid fa-download"></i>
                </div>
                <div className="action-text">
                  <span className="action-title">Instalar</span>
                  <span className="action-subtitle">Adicionar à tela de início</span>
                </div>
              </button>
            )}

            {/* Opção PWA: Notificações do Sistema */}
            <button
              type="button"
              className="dropdown-action-item"
              onClick={async () => {
                if ('Notification' in window) {
                  if (Notification.permission === 'granted') {
                    if (showToast) showToast('🔔 Notificações do sistema ativas para alertas e SOS!');
                  } else {
                    const perm = await Notification.requestPermission();
                    if (perm === 'granted') {
                      if (showToast) showToast('✅ Notificações nativas ativadas com sucesso!');
                    } else {
                      if (showToast) showToast('⚠️ Permissão de notificação recusada no navegador.');
                    }
                  }
                } else {
                  if (showToast) showToast('Navegador não suporta notificações nativas.');
                }
                setIsOpen(false);
              }}
            >
              <div
                className="action-icon-circle"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}
              >
                <i className="fa-solid fa-bell"></i>
              </div>
              <div className="action-text">
                <span className="action-title">Notificações</span>
                <span className="action-subtitle">
                  {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
                    ? 'Ativas para alertas SOS'
                    : 'Ativar alertas no sistema'}
                </span>
              </div>
            </button>

            <div className="dropdown-divider"></div>

            {/* Opção 3: Sair */}
            <button
              type="button"
              className="dropdown-action-item logout"
              onClick={() => {
                setIsOpen(false);
                if (onLogout) onLogout();
              }}
            >
              <div className="action-icon-circle logout">
                <i className="fa-solid fa-right-from-bracket"></i>
              </div>
              <div className="action-text">
                <span className="action-title">Sair</span>
                <span className="action-subtitle">Encerrar sessão na central</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
