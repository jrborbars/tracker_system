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
  subscription,
  onOpenSubscription,
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

          {/* Seletor de Idioma */}
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
                <div className="action-icon-circle theme">
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
