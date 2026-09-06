/**
 * chatRepository.js — Repositório de Infraestrutura do Domínio Care Chat
 */
import httpClient from '../../../core/api/httpClient.js';

export const chatRepository = {
  async getMessages(token) {
    return httpClient.get('/messages/', token);
  },

  async getGroups(token) {
    return httpClient.get('/groups/', token).catch(() => []);
  },
};

export default chatRepository;
