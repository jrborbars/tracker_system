import React, { useState, useEffect } from 'react';
import authRepository from '../infrastructure/authRepository.js';
import logoIconSvg from '../../../assets/logo-icon.svg';
import logoTextSvg from '../../../assets/logo-text.svg';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';
import './LoginView.css';

export default function LoginView({ onLoginSuccess }) {
  const { t, language, changeLanguage, supportedLanguages, languageMeta } = useI18n();
  const [theme, setTheme] = useState(() => localStorage.getItem('betterdays_theme') || 'light');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Controle de visibilidade de senha
  const [showPassword, setShowPassword] = useState(false);

  // Modais de suporte (Termos e Privacidade)
  const [modalType, setModalType] = useState(null); // 'terms' | 'privacy' | null

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
    setPassword('bdCare2026!Demo');
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
        const newUser = await authRepository.register({ email, password, name, phone });
        setSuccessMessage(`Cadastro realizado com sucesso para ${newUser.name}! Faça login para continuar.`);
        setIsRegister(false);
      } else {
        // Fluxo de Login
        const authData = await authRepository.login(email, password);
        if (onLoginSuccess) {
          onLoginSuccess(authData.access_token);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || t('auth.errorLogin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      {/* Ações no topo superior à direita (Tema + Idioma) */}
      <div className="login-top-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Seletor rápido de idioma */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg-card, rgba(255,255,255,0.8))', padding: '3px 4px', borderRadius: '20px', border: '1px solid var(--color-border, #e2e8f0)' }}>
          {supportedLanguages.map((lang) => {
            const isSelected = language === lang;
            const meta = languageMeta[lang];
            return (
              <button
                key={lang}
                type="button"
                onClick={() => changeLanguage(lang)}
                style={{
                  background: isSelected ? 'var(--color-primary, #0D9488)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--color-text-muted, #64748b)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                }}
                title={`${meta.name} (${meta.region})`}
              >
                <span style={{ letterSpacing: '0.5px' }}>{meta.code.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* Botão de alternar tema */}
        <button
          type="button"
          className="login-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('common.themeLight') : t('common.themeDark')}
          aria-label={theme === 'dark' ? t('common.themeLight') : t('common.themeDark')}
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


          {/* Atalho Demo */}
          {!isRegister && (
            <div className="demo-quickfill">
              <div className="demo-text">
                <strong>{t('auth.demoShortcut')}</strong>
                <span>{t('auth.demoDesc')}</span>
              </div>
              <button type="button" className="btn-quickfill" onClick={handleQuickFill}>
                <i className="fa-solid fa-bolt"></i> {t('auth.demoButton')}
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

          {/* Formulário com Floating Labels (Estilo Gmail) */}
          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            {isRegister && (
              <>
                {/* Nome Completo */}
                <div className="floating-group">
                  <div className="floating-input-wrapper">
                    <i className="fa-solid fa-user floating-prefix-icon"></i>
                    <input
                      id="input-name"
                      type="text"
                      className="floating-input"
                      placeholder=" "
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      required
                    />
                    <label htmlFor="input-name" className="floating-label">
                      {t('auth.nameLabel')}
                    </label>
                  </div>
                </div>

                {/* Telefone */}
                <div className="floating-group">
                  <div className="floating-input-wrapper">
                    <i className="fa-solid fa-phone floating-prefix-icon"></i>
                    <input
                      id="input-phone"
                      type="tel"
                      className="floating-input"
                      placeholder=" "
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="off"
                      required
                    />
                    <label htmlFor="input-phone" className="floating-label">
                      {t('auth.phoneLabel')}
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* E-mail */}
            <div className="floating-group">
              <div className="floating-input-wrapper">
                <i className="fa-solid fa-envelope floating-prefix-icon"></i>
                <input
                  id="input-email"
                  type="email"
                  className="floating-input"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
                <label htmlFor="input-email" className="floating-label">
                  {t('auth.emailLabel')}
                </label>
              </div>
            </div>

            {/* Senha com Botão Olho */}
            <div className="floating-group">
              <div className="floating-input-wrapper">
                <i className="fa-solid fa-lock floating-prefix-icon"></i>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  className="floating-input has-suffix"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  data-lpignore="true"
                  required
                />
                <label htmlFor="input-password" className="floating-label">
                  {t('auth.passwordLabel')}
                </label>
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Botão de Envio */}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>{t('auth.loadingButton')}</span>
                </>
              ) : isRegister ? (
                <>
                  <i className="fa-solid fa-user-plus"></i>
                  <span>Criar Minha Conta</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  <span>{t('auth.loginButton')}</span>
                </>
              )}
            </button>

            {/* Links Secundários Abaixo do Botão de Entrar */}
            <div className="auth-secondary-actions">
              {!isRegister ? (
                <>
                  <button
                    type="button"
                    className="btn-link-forgot"
                    onClick={() => setModalType('forgot')}
                  >
                    <i className="fa-solid fa-key"></i>
                    <span>Esqueci a senha</span>
                  </button>

                  <div className="auth-switch-prompt">
                    <span>Não tem uma conta?</span>
                    <button
                      type="button"
                      className="btn-link-switch"
                      onClick={() => {
                        setIsRegister(true);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                    >
                      Cadastre-se
                    </button>
                  </div>
                </>
              ) : (
                <div className="auth-switch-prompt">
                  <span>Já possui uma conta?</span>
                  <button
                    type="button"
                    className="btn-link-switch"
                    onClick={() => {
                      setIsRegister(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                  >
                    Fazer Login
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Termos de Uso e Privacidade */}
          <div className="auth-legal-footer">
            Ao continuar, você concorda com os{' '}
            <button
              type="button"
              className="btn-legal-link"
              onClick={() => setModalType('terms')}
            >
              Termos de Uso
            </button>{' '}
            e a{' '}
            <button
              type="button"
              className="btn-legal-link"
              onClick={() => setModalType('privacy')}
            >
              Política de Privacidade
            </button>
            .
          </div>

        </section>
      </main>

      {/* Modal: Recuperação de Senha */}
      {modalType === 'forgot' && (
        <div className="login-modal-overlay" onClick={() => setModalType(null)}>
          <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-header">
              <div className="login-modal-icon">
                <i className="fa-solid fa-key"></i>
              </div>
              <div>
                <h3>Recuperação de Senha</h3>
                <p>Enviaremos as instruções para seu e-mail cadastrado</p>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setModalType(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSuccessMessage('Instruções de recuperação enviadas para o seu e-mail!');
                setModalType(null);
              }}
            >
              <div className="login-modal-body">
                <div className="floating-group" style={{ marginBottom: '16px' }}>
                  <div className="floating-input-wrapper">
                    <i className="fa-solid fa-envelope floating-prefix-icon"></i>
                    <input
                      id="forgot-input-email"
                      type="email"
                      className="floating-input"
                      placeholder=" "
                      defaultValue={email}
                      required
                    />
                    <label htmlFor="forgot-input-email" className="floating-label">
                      E-mail cadastrado
                    </label>
                  </div>
                </div>
              </div>

              <div className="login-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalType(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  Enviar Instruções
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Modal: Termos de Uso */}
      {modalType === 'terms' && (
        <div className="login-modal-overlay" onClick={() => setModalType(null)}>
          <div className="login-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-header">
              <div className="login-modal-icon">
                <i className="fa-solid fa-file-contract"></i>
              </div>
              <div>
                <h3>Termos de Uso</h3>
                <p>Betterdays Tecnologia Criativa • Versão 2.4 (2026)</p>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setModalType(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="login-modal-body">
              <h4>1. Objeto e Finalidade</h4>
              <p>O sistema Betterdays é uma plataforma de monitoramento satelital e apoio ao cuidado de pessoas com necessidades especiais de saúde (como Síndrome de Eisenmenger).</p>
              
              <h4>2. Uso de Dados de Geolocalização</h4>
              <p>Os dados de telemetria e localização em tempo real são transmitidos de forma criptografada de ponta a ponta para a tranquilidade da rede de cuidadores autorizados.</p>

              <h4>3. Protocolo de Emergência</h4>
              <p>O acionamento do botão SOS notifica imediatamente a rede familiar. Em situações de emergência médica crítica, os serviços locais de resgate (SAMU 192 / Emergência) devem ser acionados simultaneamente.</p>
            </div>

            <div className="login-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setModalType(null)}
              >
                Entendi e Aceito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Política de Privacidade */}
      {modalType === 'privacy' && (
        <div className="login-modal-overlay" onClick={() => setModalType(null)}>
          <div className="login-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-header">
              <div className="login-modal-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <h3>Política de Privacidade</h3>
                <p>Conformidade LGPD & Proteção de Dados de Saúde</p>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setModalType(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="login-modal-body">
              <h4>1. Coleta Mínima Necessária</h4>
              <p>Coletamos apenas dados cadastrais essenciais (nome, e-mail, telefone) e telemetria de dispositivos vinculados pelo responsável legal.</p>
              
              <h4>2. Armazenamento Seguro</h4>
              <p>Todos os registros médicos, contatos de emergência e logs de localização são protegidos por criptografia AES-256 e tokens de autenticação JWT seguros.</p>

              <h4>3. Não Compartilhamento</h4>
              <p>Seus dados nunca são vendidos ou compartilhados com terceiros para fins comerciais.</p>
            </div>

            <div className="login-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setModalType(null)}
              >
                Compreendi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
