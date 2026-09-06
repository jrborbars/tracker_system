/**
 * trackingRepository.js — Repositório de Infraestrutura do Domínio Tracking & Geofences
 */
import httpClient from '../../../core/api/httpClient.js';

export const trackingRepository = {
  async getDevices(token) {
    return httpClient.get('/devices/', token);
  },

  async createDevice(token, deviceData) {
    return httpClient.post('/devices/', deviceData, token);
  },

  async deleteDevice(token, deviceId) {
    return httpClient.delete(`/devices/${deviceId}`, token);
  },

  async getAreas(token) {
    return httpClient.get('/areas/', token);
  },
};

export default trackingRepository;
