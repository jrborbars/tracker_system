import React, { useState, useRef, useEffect } from 'react';
import { getUserInitials, getAbsolutePhotoUrl } from '../../modules/profile/domain/profileModel.js';
import { useI18n } from '../i18n/presentation/useI18n.js';
import './UserAvatarMenu.css';

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
  messages = [],
  subscription,
  onOpenSubscription,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuView, setMenuView] = useState('main'); // 'main' | 'notifications'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const menuRef = useRef(null);
  const { t, language, changeLanguage, supportedLanguages, languageMeta } = useI18n();

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'sos',
      title: 'Protocolo de Telemetria Ativo',
      desc: 'Relógio do Vô João conectado com sinal GPS de alta precisão.',
      time: 'há 2 min',
      unread: true,
      tab: 'map',
      icon: 'fa-solid fa-satellite-dish',
      iconColor: 'var(--color-primary, #00897b)',
    },
    {
      id: 'notif-2',
      type: 'geofence',
      title: 'Cerca Virtual Segura',
      desc: 'Paciente permaneceu dentro da área "Casa & Jardim" nas últimas 2 horas.',
      time: 'há 18 min',
      unread: true,
      tab: 'map',
      icon: 'fa-solid fa-draw-polygon',
      iconColor: 'var(--color-success, #10b981)',
    },
    {
      id: 'notif-3',
      type: 'chat',
      title: 'Mensagem da Equipe de Cuidado',
      desc: 'Dra. Mariana: "Saturação e batimentos cardíacos normais hoje."',
      time: 'há 45 min',
      unread: false,
      tab: 'messages',
      icon: 'fa-solid fa-comment-medical',
      iconColor: 'var(--color-primary, #00897b)',
    },
    {
      id: 'notif-4',
      type: 'battery',
      title: 'Status de Bateria do Clip',
      desc: 'Clip da Dona Maria com 63% de carga restante (autonomia estimada: 18h).',
      time: 'há 2h',
      unread: false,
      tab: 'tracker',
      icon: 'fa-solid fa-battery-three-quarters',
      iconColor: 'var(--color-warning, #f59e0b)',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotifItemClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    if (notif.tab && onNavigateTab) {
      onNavigateTab(notif.tab);
    }
    setIsOpen(false);
    setMenuView('main');
  };

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
        if (showToast) showToast(t('pwa.successInstalled'));
      }
      setDeferredPrompt(null);
      setIsOpen(false);
    } else {
      // Dispositivos iOS ou navegadores sem prompt nativo
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        if (showToast) {
          showToast(t('pwa.iosInstallHint'));
        }
      } else {
        if (showToast) {
          showToast(t('pwa.browserInstallHint'));
        }
      }
      setIsOpen(false);
    }
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setMenuView('main');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const avatarUrl = getAbsolutePhotoUrl(profile?.photo_url);

  return (
    <div className={`user-avatar-menu-container ${isMobile ? 'mobile-mode' : ''}`} ref={menuRef}>
      {/* Botão Gatilho do Avatar (Apenas o Círculo) */}
      <button
        type="button"
        className="user-avatar-trigger-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={t('nav.menu')}
        title={profile?.name || 'Perfil Familiar'}
      >
        <div className="avatar-circle-sm">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile?.name || 'Foto do perfil'}
              className="avatar-img-sm"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <span className="avatar-initials-sm">{getUserInitials(profile?.name)}</span>
          )}
          <span className="avatar-online-badge"></span>
        </div>
      </button>

      {/* Dropdown Menu Flutuante */}
      {isOpen && (
        <div className="user-avatar-dropdown animate-pop">
          {menuView === 'notifications' ? (
            /* Subview de Notificações Mobile / Dropdown */
            <div className="menu-notifications-view">
              <div className="menu-notif-header">
                <button
                  type="button"
                  className="btn-menu-back"
                  onClick={() => setMenuView('main')}
                  title="Voltar ao menu"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Voltar</span>
                </button>
                <div className="menu-notif-header-title">
                  <strong>Notificações</strong>
                  {unreadCount > 0 && (
                    <span className="notif-unread-count-pill">{unreadCount} novas</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="btn-mark-all-read"
                    onClick={handleMarkAllRead}
                  >
                    Marcar lidas
                  </button>
                )}
              </div>

              <div className="dropdown-divider"></div>

              <div className="menu-notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <i className="fa-solid fa-bell-slash"></i>
                    <p>Nenhuma notificação no momento.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`menu-notif-item ${notif.unread ? 'unread' : ''}`}
                      onClick={() => handleNotifItemClick(notif)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="notif-item-icon-wrapper" style={{ color: notif.iconColor }}>
                        <i className={notif.icon}></i>
                      </div>
                      <div className="notif-item-content">
                        <div className="notif-item-title-row">
                          <strong className="notif-item-title">{notif.title}</strong>
                          {notif.unread && <span className="notif-unread-dot"></span>}
                        </div>
                        <p className="notif-item-desc">{notif.desc}</p>
                        <span className="notif-item-time">{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Visualização Principal do Menu */
            <>
              {/* Cabeçalho do Dropdown com Foto e Status */}
              <div className="dropdown-user-card">
                <div className="dropdown-avatar-wrapper">
                  <div className="dropdown-avatar-lg">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={profile?.name || 'Foto do perfil'}
                        className="dropdown-avatar-img"
                      />
                    ) : (
                      <span className="dropdown-avatar-initials">{getUserInitials(profile?.name)}</span>
                    )}
                  </div>
                </div>

                <div className="dropdown-user-details">
                  <h4 className="dropdown-user-name">{profile?.name || 'Demo User'}</h4>
                  <span className="dropdown-user-email">{profile?.email || 'demo@betterdays.com'}</span>
                  <span className="dropdown-user-phone">{profile?.phone || '(11) 98765-4321'}</span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-actions-list">
                {/* Opção: Notificações (Disponível no Mobile) */}
                <button
                  type="button"
                  className="dropdown-action-item mobile-only"
                  onClick={() => setMenuView('notifications')}
                >
                  <div
                    className="action-icon-circle notifications"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}
                  >
                    <i className="fa-solid fa-bell"></i>
                  </div>
                  <div className="action-text" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="action-title">Notificações</span>
                      {unreadCount > 0 && (
                        <span className="mobile-menu-notif-badge">{unreadCount}</span>
                      )}
                    </div>
                    <span className="action-subtitle">
                      {unreadCount > 0 ? `${unreadCount} alertas não lidos` : 'Nenhum alerta recente'}
                    </span>
                  </div>
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}></i>
                </button>

                {/* Opção: Modo Escuro / Claro (Disponível no Mobile) */}
                <button
                  type="button"
                  className="dropdown-action-item mobile-only"
                  onClick={() => {
                    if (onToggleTheme) onToggleTheme();
                  }}
                >
                  <div
                    className="action-icon-circle theme"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: theme === 'dark' ? '#60a5fa' : '#d97706',
                    }}
                  >
                    <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                  </div>
                  <div className="action-text" style={{ flex: 1 }}>
                    <span className="action-title">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                    <span className="action-subtitle">{theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}</span>
                  </div>
                  <div className={`mini-toggle-pill ${theme === 'dark' ? 'active' : ''}`}>
                    <span className="mini-toggle-thumb"></span>
                  </div>
                </button>

                {/* Opção: Meu Plano & Assinatura (Mercado Pago) */}
                <button
                  type="button"
                  className="dropdown-action-item"
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenSubscription) onOpenSubscription();
                  }}
                >
                  <div className="action-icon-circle subscription" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    <i className="fa-solid fa-crown"></i>
                  </div>
                  <div className="action-text">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="action-title">{t('subscription.menuItem')}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                        {subscription?.planName || 'Gratuito'}
                      </span>
                    </div>
                    <span className="action-subtitle">Mercado Pago &bull; PIX e Cartão</span>
                  </div>
                </button>

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
                    <span className="action-title">{t('nav.profile')}</span>
                    <span className="action-subtitle">{t('profile.personalSection')}</span>
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
                      <span className="action-title">{t('pwa.installApp')}</span>
                      <span className="action-subtitle">PWA Standalone</span>
                    </div>
                  </button>
                )}

                <div className="dropdown-divider"></div>

                {/* Opção Sair */}
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
                    <span className="action-title">{t('nav.logout')}</span>
                    <span className="action-subtitle">Encerrar sessão</span>
                  </div>
                </button>
              </div>
            </>
          )}

          <div className="dropdown-divider"></div>

          {/* Rodapé com Versão e Idiomas Discretos */}
          <div className="dropdown-footer">
            <span className="dropdown-version">Betterdays v1.2.0</span>
            <div className="dropdown-lang-discrete-bar">
              {supportedLanguages.map((lang, idx) => {
                const isSelected = language === lang;
                const meta = languageMeta[lang];
                return (
                  <React.Fragment key={lang}>
                    {idx > 0 && <span className="lang-sep" aria-hidden="true">&bull;</span>}
                    <button
                      type="button"
                      className={`btn-lang-discrete ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        changeLanguage(lang);
                        if (showToast) showToast(`${meta.name} (${meta.region})`);
                      }}
                      title={`${meta.name} (${meta.region})`}
                    >
                      {meta.code.toUpperCase()}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
