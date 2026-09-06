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
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const menuRef = useRef(null);
  const { t, language, changeLanguage, supportedLanguages, languageMeta } = useI18n();

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
      {/* Botão Gatilho do Avatar */}
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
        {!isMobile && (
          <div className="user-brief-info">
            <span className="user-brief-name">{profile?.name || 'Demo User'}</span>
            <span className="user-brief-role">{profile?.email || 'demo@betterdays.com'}</span>
          </div>
        )}
        <i className={`fa-solid fa-chevron-down avatar-chevron ${isOpen ? 'open' : ''}`}></i>
      </button>

      {/* Dropdown Menu Flutuante */}
      {isOpen && (
        <div className="user-avatar-dropdown animate-pop">
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

            {/* Status Médicos / Resumo Rápido */}
            <div className="dropdown-status-tags">
              <div className="dropdown-tag gps-ok">
                <i className="fa-solid fa-circle-check"></i> {t('tracking.gpsConnected')}
              </div>
              <div className="dropdown-tag geofences">
                <i className="fa-solid fa-draw-polygon"></i> {t('tracking.geofencesCount', { count: areasCount })}
              </div>
              <div className="dropdown-tag trackers">
                <i className="fa-solid fa-user-check"></i> {t('dashboard.stats.trackersOnline')}
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Seletor de Idioma */}
          <div style={{ padding: '10px 14px 6px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted, #64748b)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-globe" style={{ color: 'var(--color-primary)' }}></i>
              {t('common.language')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {supportedLanguages.map((lang) => {
                const isSelected = language === lang;
                const meta = languageMeta[lang];
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      changeLanguage(lang);
                      if (showToast) showToast(`${meta.flag} ${meta.name} (${meta.region})`);
                    }}
                    style={{
                      padding: '6px 4px',
                      border: isSelected ? '2px solid var(--color-primary, #0D9488)' : '1px solid var(--color-border, #e2e8f0)',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--color-primary-light, rgba(13, 148, 136, 0.12))' : 'transparent',
                      color: isSelected ? 'var(--color-primary, #0D9488)' : 'var(--color-text, #1e293b)',
                      fontSize: '11px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'all 0.2s ease',
                    }}
                    title={`${meta.name} (${meta.region})`}
                  >
                    <span style={{ fontSize: '15px' }}>{meta.flag}</span>
                    <span style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{meta.code.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="dropdown-divider"></div>

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
                <span>{t('dashboard.emergencyProtocol')}</span>
              </button>
            </div>
          )}

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
                    {theme === 'dark' ? t('common.themeLight') : t('common.themeDark')}
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
        </div>
      )}
    </div>
  );
}
