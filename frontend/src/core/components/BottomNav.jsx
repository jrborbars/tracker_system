import React from 'react';
import { useI18n } from '../i18n/presentation/useI18n.js';

export default function BottomNav({ activeTab, setActiveTab, unreadCount }) {
  const { t } = useI18n();

  const navItems = [
    { id: 'map', label: t('nav.map'), icon: 'fa-solid fa-map-location-dot' },
    { id: 'indoor', label: t('nav.indoor'), icon: 'fa-solid fa-house-signal' },
    { id: 'messages', label: t('nav.messages'), icon: 'fa-solid fa-comments', badge: unreadCount },
  ];


  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação móvel">
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
          <div className="bottom-nav-icon-wrapper">
            <i className={item.icon}></i>
            {item.badge > 0 && (
              <span className="bottom-nav-badge">
                {item.badge}
              </span>
            )}
          </div>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
