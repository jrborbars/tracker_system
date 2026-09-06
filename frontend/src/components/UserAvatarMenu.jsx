import React, { useState, useRef, useEffect } from 'react';
import { uploadPhoto, updateProfile } from '../api/client.js';

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
  const [isUploading, setIsUploading] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Calcula as iniciais do nome quando não houver foto
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userName = profile?.name || 'Demo User';
  const userEmail = profile?.email || 'familiar@betterdays.com';
  const initials = getInitials(userName);

  // URL absoluta da foto
  const avatarUrl = profile?.photo_url
    ? profile.photo_url.startsWith('http') || profile.photo_url.startsWith('data:')
      ? profile.photo_url
      : `http://localhost:8000${profile.photo_url}`
    : null;

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

  // Manipular upload de foto de perfil
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (showToast) showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      if (showToast) showToast('Enviando nova foto de perfil...');

      const uploadRes = await uploadPhoto(token, file);
      const newPhotoUrl = uploadRes.url;

      const updated = await updateProfile(token, {
        name: profile?.name,
        email: profile?.email,
        phone: profile?.phone,
        emergency_contact: profile?.emergency_contact,
        patient_diagnosis: profile?.patient_diagnosis,
        photo_url: newPhotoUrl,
      });

      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      if (showToast) showToast('Foto de perfil atualizada com sucesso!');
      setIsOpen(false);
    } catch (err) {
      if (showToast) showToast(`Erro ao atualizar foto: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`user-avatar-menu-wrapper ${isMobile ? 'mobile' : ''}`} ref={menuRef}>
      {/* Input oculto para upload de imagem */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
      />

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
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </span>
                  <span className="action-subtitle">Alternar tema visual</span>
                </div>
              </button>
            )}

            {/* Opção 1: Foto do Usuário */}
            <button
              type="button"
              className="dropdown-action-item"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <div className="action-icon-circle photo">
                <i className="fa-solid fa-camera"></i>
              </div>
              <div className="action-text">
                <span className="action-title">
                  {isUploading ? 'Enviando foto...' : 'Foto do Usuário'}
                </span>
                <span className="action-subtitle">Alterar imagem de perfil</span>
              </div>
            </button>

            {/* Opção 2: Configurar Perfil */}
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
                <span className="action-subtitle">Perfil, contatos e dados médicos</span>
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
