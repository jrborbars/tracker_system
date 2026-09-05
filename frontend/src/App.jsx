import React, { useState } from 'react';
import LoginView from './components/LoginView.jsx';
import MainApp from './components/MainApp.jsx';

export default function App() {
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (authToken) => {
    setToken(authToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return <MainApp token={token} onLogout={handleLogout} />;
}
