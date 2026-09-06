import React from 'react';
import logoIconSvg from '../../assets/logo-icon.svg';
import logoTextSvg from '../../assets/logo-text.svg';
import { useI18n } from '../i18n/presentation/useI18n.js';

export default function Sidebar({
  activeTab,
  setActiveTab,
  unreadCount,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
  theme = 'light',
  onToggleTheme,
  onOpenAddDevice,
}) {
  const { t } = useI18n();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: 'fa-solid fa-table-columns' },
    { id: 'map', label: t('nav.map'), icon: 'fa-solid fa-map-location-dot' },
    { id: 'tracker', label: t('nav.tracker'), icon: 'fa-solid fa-microchip' },
    { id: 'indoor', label: t('nav.indoor'), icon: 'fa-solid fa-house-signal' },
    { id: 'messages', label: t('nav.messages'), icon: 'fa-solid fa-comments', badge: unreadCount },
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
          title={isCollapsed ? 'Expandir' : 'Recolher'}
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
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                setActiveTab(item.id);
              }
            }}
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

      {/* Rodapé da Sidebar com Versão da Aplicação */}
      <div className="sidebar-footer">
        <div className="sidebar-app-version" title="Betterdays v1.0.0">
          {!isCollapsed ? (
            <>
              <span className="app-version-label">Versão</span>
              <span className="app-version-number">v1.0.0</span>
            </>
          ) : (
            <span className="app-version-number collapsed">v1.0</span>
          )}
        </div>
      </div>
    </aside>
  );
}
