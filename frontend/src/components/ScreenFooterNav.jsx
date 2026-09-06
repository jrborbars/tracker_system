import React from 'react';

const SCREEN_CONFIG = {
  dashboard: {
    name: 'Painel de Monitoramento',
    icon: 'fa-solid fa-table-columns',
    category: 'Visão Geral',
    description: 'Painel central com telemetria satelital, status dos dispositivos e alertas em tempo real.',
    isHome: true,
  },
  map: {
    name: 'Mapa Satelital & Cercas Virtuais',
    icon: 'fa-solid fa-map-location-dot',
    category: 'Localização Geográfica',
    description: 'Rastreamento por satélite com perímetros de segurança e rotas de emergência.',
    isHome: false,
  },
  indoor: {
    name: 'Monitoramento Interno de Cômodos',
    icon: 'fa-solid fa-house-signal',
    category: 'Presença e Sensores',
    description: 'Detecção de presença e micro-movimentos em cômodos via radar Doppler e sensores térmicos.',
    isHome: false,
  },
  messages: {
    name: 'Grupos de Cuidado & Mensagens',
    icon: 'fa-solid fa-comments',
    category: 'Comunicação',
    description: 'Canal instantâneo entre familiares, cuidadores e equipe médica com suporte a áudio e anexos.',
    isHome: false,
  },
  profile: {
    name: 'Perfil do Cuidador & Protocolo Médico',
    icon: 'fa-solid fa-user-shield',
    category: 'Configurações & Protocolos',
    description: 'Ficha médica da Síndrome de Eisenmenger, contatos de emergência e gestão da conta.',
    isHome: false,
  },
};

export default function ScreenFooterNav({ activeTab, onNavigateTab }) {
  const currentScreen = SCREEN_CONFIG[activeTab] || SCREEN_CONFIG.dashboard;

  return (
    <footer className="screen-footer-nav" aria-label="Navegação e detalhes da tela atual">
      <div className="footer-nav-content">
        {/* Lado Esquerdo: Identificação da Tela Atual & Breadcrumb */}
        <div className="footer-screen-info">
          <div className="footer-breadcrumbs">
            <button
              type="button"
              className="breadcrumb-home-link"
              onClick={() => onNavigateTab('dashboard')}
              title="Ir para o Dashboard Principal"
            >
              <i className="fa-solid fa-house"></i>
              <span>Dashboard</span>
            </button>
            <i className="fa-solid fa-chevron-right breadcrumb-separator"></i>
            <span className="breadcrumb-current">{currentScreen.name}</span>
          </div>

          <div className="footer-screen-desc">
            <i className={`${currentScreen.icon} footer-screen-icon`}></i>
            <span className="footer-screen-text">
              <strong>{currentScreen.category}:</strong> {currentScreen.description}
            </span>
          </div>
        </div>

        {/* Lado Direito: Ação Rápida de Retorno ao Dashboard */}
        <div className="footer-screen-actions">
          {activeTab !== 'dashboard' ? (
            <button
              type="button"
              className="btn-footer-goto-dash"
              onClick={() => onNavigateTab('dashboard')}
              title="Voltar ao Painel Principal de Monitoramento"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Ir para o Dashboard</span>
            </button>
          ) : (
            <div className="footer-current-badge">
              <span className="live-status-dot"></span>
              <span>Tela Principal Ativa</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
