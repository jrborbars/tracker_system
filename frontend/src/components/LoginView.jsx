import React, { useState } from 'react';
import { login, register, getProfile, getDevices } from '../api/client.js';
import logoIconSvg from '../assets/logo-icon.svg';
import logoTextSvg from '../assets/logo-text.svg';
import '../styles/LoginView.css';

export default function LoginView({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estado de sessão pós-login
  const [token, setToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [devices, setDevices] = useState([]);

  // Preenchimento rápido da conta demo
  const handleQuickFill = () => {
    setIsRegister(false);
    setEmail('demo@betterdays.com');
    setPassword('password123');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isRegister) {
        // Fluxo de Cadastro
        const newUser = await register({ email, password, name, phone });
        setSuccessMessage(`Cadastro realizado com sucesso para ${newUser.name}! Faça login para continuar.`);
        setIsRegister(false);
      } else {
        // Fluxo de Login
        const authData = await login(email, password);
        if (onLoginSuccess) {
          onLoginSuccess(authData.access_token);
        } else {
          setToken(authData.access_token);
          const profile = await getProfile(authData.access_token);
          setUserProfile(profile);
          const deviceList = await getDevices(authData.access_token);
          setDevices(deviceList);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Ocorreu um erro ao processar a requisição.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUserProfile(null);
    setDevices([]);
    setEmail('');
    setPassword('');
    setSuccessMessage('Sessão encerrada com sucesso.');
  };

  // Se o usuário estiver autenticado, exibe a visualização pós-login
  if (token && userProfile) {
    return (
      <div className="login-page">
        <header className="login-topbar">
          <div className="topbar-brand">
            <img src={logoIconSvg} alt="Betterdays Ícone" className="topbar-logo-icon" />
            <img src={logoTextSvg} alt="Betterdays Tecnologia Criativa" className="topbar-logo-text" />
          </div>
          <div className="topbar-badge">
            <i className="fa-solid fa-satellite-dish"></i>
            Sinal Satélite Conectado
          </div>
        </header>

        <main className="logged-container">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-info">
                <div className="profile-avatar">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700' }}>{userProfile.name}</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-envelope"></i> {userProfile.email} &bull; <i className="fa-solid fa-phone"></i> {userProfile.phone}
                  </p>
                </div>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i>
                Sair
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-primary-dark)' }}>
                <i className="fa-solid fa-satellite"></i> Rastreadores Satelitais Ativos ({devices.length})
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Status dos familiares monitorados
              </span>
            </div>

            <div className="devices-list">
              {devices.map((device) => (
                <div key={device.id} className="device-item">
                  <div className="device-item-header">
                    <strong>{device.name}</strong>
                    <span className="badge-battery">
                      <i className="fa-solid fa-battery-three-quarters"></i> {device.battery_level}%
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {device.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                    <span>ID: {device.device_id}</span>
                    <span>Tipo: {device.type}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-subtle)', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-primary)', fontSize: '22px' }}></i>
              <div>
                <strong style={{ color: 'var(--color-primary-dark)', fontSize: '14px', display: 'block' }}>
                  Logo Vetorial & Autenticação Validados!
                </strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  O logo oficial Betterdays em formato SVG leve e o favicon estão ativos no sistema.
                </span>
              </div>
            </div>
          </div>
        </main>

        <footer className="login-footer">
          Betterdays &copy; 2026 — Plataforma de Apoio e Rastreamento Satelital em Saúde
        </footer>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Topbar */}
      <header className="login-topbar">
        <div className="topbar-brand">
          <img src={logoIconSvg} alt="Betterdays Ícone" className="topbar-logo-icon" />
          <img src={logoTextSvg} alt="Betterdays Tecnologia Criativa" className="topbar-logo-text" />
        </div>
        <div className="topbar-badge">
          <i className="fa-solid fa-shield-halved"></i>
          Acesso Seguro para Cuidadores & Familiares
        </div>
      </header>

      {/* Conteúdo Principal em CSS Grid */}
      <main className="login-main">
        
        {/* Painel Esquerdo: Contexto de Saúde & Apoio */}
        <section className="info-panel">
          <div className="info-header">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-light)', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'var(--color-primary-dark)', fontSize: '12px', fontWeight: '700', marginBottom: '16px', border: '1px solid var(--color-primary-subtle)' }}>
              <i className="fa-solid fa-heart-pulse" style={{ color: 'var(--color-danger)' }}></i>
              MONITORAMENTO SÍNDROME DE EISENMENGER
            </div>
            <h1>Cuidado e localização rápida para quem você ama.</h1>
            <p>
              Sistema de alta precisão via satélite desenvolvido para o acompanhamento contínuo e resposta ágil a emergências de pessoas com <strong>Síndrome de Eisenmenger</strong>.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper satellite">
                <i className="fa-solid fa-satellite-dish"></i>
              </div>
              <strong>Rastreamento Satelital</strong>
              <span>Localização em tempo real com precisão geográfica mesmo sem sinal celular.</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper heart">
                <i className="fa-solid fa-heart-pulse"></i>
              </div>
              <strong>Protocolo Eisenmenger</strong>
              <span>Ficha médica instantânea com contato do cardiologista e tipo sanguíneo.</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper geofence">
                <i className="fa-solid fa-draw-polygon"></i>
              </div>
              <strong>Zonas Seguras</strong>
              <span>Notificações imediatas se o familiar sair do perímetro de casa ou clínica.</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper shield">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <strong>Tranquilidade Familiar</strong>
              <span>Alertas de bateria, movimentação e canal direto de emergência em 1 toque.</span>
            </div>
          </div>

          <div className="emergency-notice">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <div>
              <strong>Atenção a Sintomas Críticos</strong>
              <span>Episódios de desmaio, cianose intensa ou dispneia exigem acionamento imediato do botão SOS no painel.</span>
            </div>
          </div>
        </section>

        {/* Painel Direito: Card de Autenticação */}
        <section className="auth-card">
          
          {/* Tabs Entrar / Cadastrar */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`tab-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(false); setErrorMessage(''); }}
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              Entrar
            </button>
            <button
              type="button"
              className={`tab-btn ${isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(true); setErrorMessage(''); }}
            >
              <i className="fa-solid fa-user-plus"></i>
              Cadastrar Familiar
            </button>
          </div>

          <div className="auth-header">
            <h2>{isRegister ? 'Criar Conta de Familiar' : 'Acesse o Monitoramento'}</h2>
            <p>
              {isRegister
                ? 'Cadastre-se para conectar rastreadores e gerenciar zonas seguras.'
                : 'Insira suas credenciais para acessar a localização em tempo real.'}
            </p>
          </div>

          {/* Atalho Demo */}
          {!isRegister && (
            <div className="demo-quickfill">
              <div className="demo-text">
                <strong>Conta de Demonstração</strong>
                <span>demo@betterdays.com</span>
              </div>
              <button type="button" className="btn-quickfill" onClick={handleQuickFill}>
                <i className="fa-solid fa-bolt"></i> Preencher Demo
              </button>
            </div>
          )}

          {/* Mensagens de Feedback */}
          {errorMessage && (
            <div className="feedback-alert error" style={{ marginBottom: '16px' }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="feedback-alert success" style={{ marginBottom: '16px' }}>
              <i className="fa-solid fa-circle-check"></i>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulário */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="fa-solid fa-user"></i> Nome Completo
                  </label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-user input-icon"></i>
                    <input
                      id="name"
                      type="text"
                      className="input-control"
                      placeholder="Ex: Maria dos Santos"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fa-solid fa-phone"></i> Telefone / WhatsApp de Emergência
                  </label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-phone input-icon"></i>
                    <input
                      id="phone"
                      type="tel"
                      className="input-control"
                      placeholder="Ex: +55 (11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <i className="fa-solid fa-envelope"></i> E-mail
              </label>
              <div className="input-wrapper">
                <i className="fa-solid fa-envelope input-icon"></i>
                <input
                  id="email"
                  type="email"
                  className="input-control"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fa-solid fa-lock"></i> Senha
              </label>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  id="password"
                  type="password"
                  className="input-control"
                  placeholder="Sua senha secreta"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Processando...</span>
                </>
              ) : isRegister ? (
                <>
                  <i className="fa-solid fa-user-check"></i>
                  <span>Concluir Cadastro</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>

        </section>

      </main>

      {/* Footer */}
      <footer className="login-footer">
        Betterdays &copy; 2026 — Plataforma de Apoio e Rastreamento Satelital em Saúde
      </footer>
    </div>
  );
}
