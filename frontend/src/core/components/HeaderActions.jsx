import React from 'react';
import ThemeToggleBtn from './ThemeToggleBtn.jsx';
import NotificationBell from './NotificationBell.jsx';
import UserAvatarMenu from './UserAvatarMenu.jsx';

export default function HeaderActions({
  theme = 'light',
  onToggleTheme,
  messages = [],
  onNavigateTab,
  profile,
  onLogout,
  onProfileUpdated,
  token,
  showToast,
  devicesCount = 2,
  areasCount = 3,
  onEmergencySOS,
  subscription,
  onOpenSubscription,
  isMobile = false,
}) {
  return (
    <div className={`header-actions-wrapper ${isMobile ? 'mobile-mode' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Botão Circular de Alternância de Tema (Dark / Light) */}
      <ThemeToggleBtn theme={theme} onToggleTheme={onToggleTheme} />

      {/* Botão de Sino de Notificações estilo Facebook */}
      <NotificationBell messages={messages} onNavigateTab={onNavigateTab} />

      {/* Menu do Avatar do Usuário */}
      <UserAvatarMenu
        profile={profile}
        onNavigateTab={onNavigateTab}
        onLogout={onLogout}
        onProfileUpdated={onProfileUpdated}
        token={token}
        showToast={showToast}
        isMobile={isMobile}
        devicesCount={devicesCount}
        areasCount={areasCount}
        onEmergencySOS={onEmergencySOS}
        subscription={subscription}
        onOpenSubscription={onOpenSubscription}
      />
    </div>
  );
}
