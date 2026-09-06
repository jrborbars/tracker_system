import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n/presentation/useI18n.js';
import './NotificationBell.css';

export default function NotificationBell({
  messages = [],
  onNavigateTab,
}) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
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

  const popoverRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleItemClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    if (notif.tab && onNavigateTab) {
      onNavigateTab(notif.tab);
    }
    setIsOpen(false);
  };

  return (
    <div className="notification-bell-container" ref={popoverRef}>
      {/* Botão de Sino estilo Facebook / Redes Sociais */}
      <button
        type="button"
        className="header-circle-btn notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Notificações"
        title="Notificações"
      >
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge-fb animate-badge-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Flutuante de Notificações */}
      {isOpen && (
        <div className="notification-popover animate-pop">
          {/* Cabeçalho do Popover */}
          <div className="notif-popover-header">
            <div className="notif-header-title">
              <h4>Notificações</h4>
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
                Marcar como lidas
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="notif-popover-list">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <i className="fa-solid fa-bell-slash"></i>
                <p>Nenhuma notificação no momento.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-popover-item ${notif.unread ? 'unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
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
      )}
    </div>
  );
}
