/**
 * chatModel.js — Modelo e Regras de Domínio para Mensageria e Grupos de Cuidado
 */

export function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function isEmergencyMessage(message) {
  if (!message) return false;
  return (
    message.type === 'sos' ||
    message.type === 'emergency' ||
    (typeof message.content === 'string' && message.content.includes('🚨'))
  );
}
