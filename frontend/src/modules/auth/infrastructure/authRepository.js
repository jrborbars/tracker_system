/**
 * authRepository.js — Repositório de Infraestrutura do Domínio Auth
 */
import httpClient from '../../../core/api/httpClient.js';

export const authRepository = {
  /**
   * Realiza login do usuário
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ access_token: string, token_type: string, user: object }>}
   */
  async login(email, password) {
    return httpClient.post('/login', { email, password });
  },

  /**
   * Cadastra novo usuário familiar
   * @param {object} userData
   */
  async register(userData) {
    return httpClient.post('/register', userData);
  },
};

export default authRepository;
