/**
 * client.js — Fachada (Facade) Unificada da Camada de Infraestrutura / Repositórios
 * Mantém 100% de compatibilidade com os módulos e centraliza chamadas aos repositórios de domínio.
 */
import authRepository from '../modules/auth/infrastructure/authRepository.js';
import profileRepository from '../modules/profile/infrastructure/profileRepository.js';
import trackingRepository from '../modules/tracking/infrastructure/trackingRepository.js';
import chatRepository from '../modules/care-chat/infrastructure/chatRepository.js';

// 1. Auth Domain
export const login = (email, password) => authRepository.login(email, password);
export const register = (user) => authRepository.register(user);

// 2. Profile Domain
export const getProfile = (token) => profileRepository.getProfile(token);
export const updateProfile = (token, data) => profileRepository.updateProfile(token, data);
export const uploadPhoto = (token, file) => profileRepository.uploadPhoto(token, file);

// 3. Tracking Domain
export const getDevices = (token) => trackingRepository.getDevices(token);
export const createDevice = (token, data) => trackingRepository.createDevice(token, data);
export const deleteDevice = (token, id) => trackingRepository.deleteDevice(token, id);
export const getAreas = (token) => trackingRepository.getAreas(token);

// 4. Care Chat Domain
export const getMessages = (token) => chatRepository.getMessages(token);
export const getGroups = (token) => chatRepository.getGroups(token);

export default {
  login,
  register,
  getProfile,
  updateProfile,
  uploadPhoto,
  getDevices,
  createDevice,
  deleteDevice,
  getAreas,
  getMessages,
  getGroups,
};
