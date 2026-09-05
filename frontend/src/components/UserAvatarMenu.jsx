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
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Calcula as iniciais do nome quando não houver foto (ex: "Roberto Silva" -> "RS", "Carlos" -> "CA")
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userName = profile?.name || 'Cuidador Familiar';
  const userEmail = profile?.email || 'familiar@betterdays.com';
  const initials = getInitials(userName);

  // URL absoluta da foto caso seja caminho relativo do backend
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

      {/* Botão Gatilho do Avatar */}
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

        {!isMobile && (
          <div className="avatar-text-details">
            <span className="avatar-user-name">{userName}</span>
            <span className="avatar-user-role">Cuidador Principal</span>
          </div>
        )}

        <i className={`fa-solid fa-chevron-down avatar-chevron ${isOpen ? 'open' : ''}`}></i>
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

          <div className="dropdown-divider"></div>

          {/* Opções do Menu */}
          <div className="dropdown-actions-list">
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
