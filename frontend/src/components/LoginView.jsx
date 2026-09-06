import React, { useState, useEffect } from 'react';
import { login, register, getProfile, getDevices } from '../api/client.js';
import logoIconSvg from '../assets/logo-icon.svg';
import logoTextSvg from '../assets/logo-text.svg';
import '../styles/LoginView.css';

export default function LoginView({ onLoginSuccess }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('betterdays_theme') || 'light');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sincronizar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('betterdays_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('betterdays_theme', nextTheme);
      return nextTheme;
    });
  };

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
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Ocorreu um erro ao processar a requisição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      {/* Botão de alternar tema no topo superior à direita */}
      <div className="login-top-actions">
        <button
          type="button"
          className="login-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          aria-label={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
        >
          <i
            className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}
            style={{ color: theme === 'dark' ? '#FBBF24' : 'var(--color-primary)' }}
          ></i>
        </button>
      </div>

      {/* Card Central de Login */}
      <main className="login-card-container">
        <section className="login-card">
          
          {/* Logo dentro da área de login */}
          <div className="login-card-brand">
            <img src={logoIconSvg} alt="Betterdays Ícone" className="login-logo-icon" />
            <img src={logoTextSvg} alt="Betterdays" className="login-logo-text" />
          </div>

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
    </div>
  );
}
