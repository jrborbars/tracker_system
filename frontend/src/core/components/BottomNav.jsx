import React from 'react';
import { useI18n } from '../i18n/presentation/useI18n.js';

export default function BottomNav({ activeTab, setActiveTab, unreadCount }) {
  const { t } = useI18n();

  const navItems = [
    { id: 'map', label: 'Mapa', icon: 'fa-solid fa-map-location-dot' },
    { id: 'indoor', label: 'Monitoramento', icon: 'fa-solid fa-house-signal' },
    { id: 'messages', label: 'Notificações', icon: 'fa-solid fa-bell', badge: unreadCount },
  ];


  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => {
            if (item.action) {
              item.action();
            } else {
              setActiveTab(item.id);
            }
          }}
        >
          <div style={{ position: 'relative' }}>
            <i className={item.icon}></i>
            {item.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  backgroundColor: 'var(--color-danger)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: '999px',
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
