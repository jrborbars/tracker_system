import React from 'react';
import logoIconSvg from '../assets/logo-icon.svg';
import logoTextSvg from '../assets/logo-text.svg';

export default function Sidebar({
  activeTab,
  setActiveTab,
  unreadCount,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
  theme = 'light',
  onToggleTheme,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-table-columns' },
    { id: 'map', label: 'Mapa Satelital', icon: 'fa-solid fa-map-location-dot' },
    { id: 'indoor', label: 'Monitoramento Interno', icon: 'fa-solid fa-house-signal' },
    { id: 'messages', label: 'Mensagens', icon: 'fa-solid fa-comments', badge: unreadCount },
    { id: 'profile', label: 'Perfil Familiar', icon: 'fa-solid fa-user-shield' },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand no topo da Sidebar com Botão de Abrir / Fechar */}
      <div className="sidebar-brand">
        <div className="brand-logo-area">
          <img src={logoIconSvg} alt="Betterdays Icon" className="sidebar-logo-icon" />
          {!isCollapsed && (
            <img src={logoTextSvg} alt="Betterdays" className="sidebar-logo-text" />
          )}
        </div>

        {/* Botão para Alternar Abrir / Fechar */}
        <button
          type="button"
          className="btn-toggle-sidebar"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
          aria-label={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          <i className={`fa-solid ${isCollapsed ? 'fa-bars' : 'fa-angles-left'}`}></i>
        </button>
      </div>

      {/* Navegação Principal com Ícones e Atalhos */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
          >
            <div className="nav-item-icon-wrapper">
              <i className={item.icon}></i>
              {item.badge > 0 && isCollapsed && (
                <span className="nav-badge-dot" title={`${item.badge} não lidas`}></span>
              )}
            </div>

            {!isCollapsed && <span className="nav-item-label">{item.label}</span>}
            {!isCollapsed && item.badge > 0 && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="sidebar-footer">
        {/* Alternador de Modo Escuro / Claro */}
        <button
          type="button"
          className="btn-sidebar-theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} style={{ color: theme === 'dark' ? '#FBBF24' : 'var(--color-primary)' }}></i>
          {!isCollapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>

        <div className="satellite-status" title="GPS Satélite Ativo">
          <i className="fa-solid fa-satellite-dish" style={{ color: 'var(--color-primary)' }}></i>
          {!isCollapsed && <span>GPS Satélite Ativo</span>}
        </div>

        <button
          type="button"
          className="btn-sidebar-logout"
          onClick={onLogout}
          title="Encerrar Sessão"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          {!isCollapsed && <span>Encerrar Sessão</span>}
        </button>
      </div>
    </aside>
  );
}
