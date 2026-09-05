import React from 'react';
import logoIconSvg from '../assets/logo-icon.svg';
import logoTextSvg from '../assets/logo-text.svg';

export default function Sidebar({ activeTab, setActiveTab, unreadCount, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-table-columns' },
    { id: 'map', label: 'Mapa Satelital', icon: 'fa-solid fa-map-location-dot' },
    { id: 'indoor', label: 'Monitoramento Interno', icon: 'fa-solid fa-house-signal' },
    { id: 'messages', label: 'Mensagens', icon: 'fa-solid fa-bell', badge: unreadCount },
    { id: 'profile', label: 'Perfil Familiar', icon: 'fa-solid fa-user-shield' },
  ];


  return (
    <aside className="sidebar">
      {/* Brand no topo da Sidebar */}
      <div className="sidebar-brand">
        <img src={logoIconSvg} alt="Betterdays Icon" className="sidebar-logo-icon" />
        <img src={logoTextSvg} alt="Betterdays" className="sidebar-logo-text" />
      </div>

      {/* Navegação Principal */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
            {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="sidebar-footer">
        <div className="satellite-status">
          <i className="fa-solid fa-satellite-dish" style={{ color: 'var(--color-primary)' }}></i>
          <span>GPS Satélite Ativo</span>
        </div>

        <button type="button" className="btn-sidebar-logout" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
