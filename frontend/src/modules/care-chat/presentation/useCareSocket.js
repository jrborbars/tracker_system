/**
 * useCareSocket.js — React custom hook for real-time care chat, typing indicators, SOS, and telemetry.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../../../core/services/socketService.js';

export function useCareSocket(initialGroups = []) {
  const [isConnected, setIsConnected] = useState(false);
  const [groups, setGroups] = useState(initialGroups);
  const [typingUsers, setTypingUsers] = useState({}); // { [groupId]: 'Dr. Roberto está digitando...' }
  const [lastSosAlert, setLastSosAlert] = useState(null);
  const [liveTelemetry, setLiveTelemetry] = useState(null);

  const activeGroupRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    // 1. Receber grupos iniciais sincronizados com o backend
    const handleInitialGroups = (serverGroups) => {
      if (serverGroups && Array.isArray(serverGroups) && serverGroups.length > 0) {
        setGroups(serverGroups);
      }
    };

    // 2. Receber nova mensagem em tempo real
    const handleReceiveMessage = ({ groupId, message }) => {
      setGroups((prevGroups) =>
        prevGroups.map((grp) => {
          if (grp.id === groupId) {
            // Evitar duplicação caso a mensagem já exista
            const exists = grp.messages.some((m) => m.id === message.id);
            if (exists) return grp;

            return {
              ...grp,
              messages: [...grp.messages, message],
            };
          }
          return grp;
        })
      );
    };

    // 3. Indicador de digitação
    const handleUserTyping = ({ groupId, user, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [groupId]: isTyping ? user : null,
      }));
    };

    // 4. Mensagens lidas
    const handleMessagesRead = ({ groupId, messageIds }) => {
      setGroups((prev) =>
        prev.map((grp) => {
          if (grp.id === groupId) {
            return {
              ...grp,
              messages: grp.messages.map((m) =>
                messageIds.includes(m.id) ? { ...m, status: 'read' } : m
              ),
            };
          }
          return grp;
        })
      );
    };

    // 5. Alerta de emergência SOS global
    const handleSosAlert = (sosData) => {
      console.warn('[useCareSocket] 🚨 Global SOS alert received:', sosData);
      setLastSosAlert(sosData);
    };

    // 6. Pulso de telemetria GPS
    const handleTelemetryPulse = (telemetryData) => {
      setLiveTelemetry(telemetryData);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('initial_groups', handleInitialGroups);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_marked_read', handleMessagesRead);
    socket.on('sos_alert', handleSosAlert);
    socket.on('telemetry_pulse', handleTelemetryPulse);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('initial_groups', handleInitialGroups);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_marked_read', handleMessagesRead);
      socket.off('sos_alert', handleSosAlert);
      socket.off('telemetry_pulse', handleTelemetryPulse);
    };
  }, []);

  // Entrar em uma sala de grupo
  const joinGroup = useCallback((groupId) => {
    const socket = socketService.getSocket();
    if (activeGroupRef.current && activeGroupRef.current !== groupId) {
      socket.emit('leave_group', { groupId: activeGroupRef.current });
    }
    activeGroupRef.current = groupId;
    socket.emit('join_group', { groupId });
  }, []);

  // Enviar mensagem via Socket.io
  const sendMessage = useCallback((payload, onAck) => {
    const socket = socketService.getSocket();
    socket.emit('send_message', payload, (response) => {
      if (onAck) onAck(response);
    });
  }, []);

  // Emitir status de digitação com debounce
  const sendTypingStatus = useCallback((groupId, user, isTyping) => {
    const socket = socketService.getSocket();
    socket.emit('typing_status', { groupId, user, isTyping });
  }, []);

  // Disparar SOS global
  const triggerSos = useCallback((sosData) => {
    const socket = socketService.getSocket();
    socket.emit('sos_trigger', sosData);
  }, []);

  // Marcar mensagens como lidas
  const markAsRead = useCallback((groupId, messageIds) => {
    const socket = socketService.getSocket();
    socket.emit('mark_as_read', { groupId, messageIds });
  }, []);

  return {
    isConnected,
    groups,
    setGroups,
    typingUsers,
    lastSosAlert,
    liveTelemetry,
    joinGroup,
    sendMessage,
    sendTypingStatus,
    triggerSos,
    markAsRead,
  };
}

export default useCareSocket;
