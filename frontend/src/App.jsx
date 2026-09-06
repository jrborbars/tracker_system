import React, { useState } from 'react';
import LoginView from './modules/auth/presentation/LoginView.jsx';
import MainApp from './modules/dashboard/presentation/MainApp.jsx';
import { I18nProvider } from './core/i18n/presentation/I18nContext.jsx';

const AUTH_TOKEN_KEY = 'betterdays_auth_token';

export default function App() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (authToken) => {
    if (authToken) {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      } catch (err) {
        console.error('Erro ao salvar token de autenticação:', err);
      }
    }
    setToken(authToken);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem('betterdays_active_tab');
    } catch (err) {
      console.error('Erro ao limpar sessão:', err);
    }
    setToken(null);
  };

  return (
    <I18nProvider>
      {!token ? (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      ) : (
        <MainApp token={token} onLogout={handleLogout} />
      )}
    </I18nProvider>
  );
}
