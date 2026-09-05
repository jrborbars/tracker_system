/**
 * socket.js — Socket.io WebSocket server layer for Betterdays real-time care messaging & telemetry.
 */
import { Server } from 'socket.io';
import config from './config.js';

let io = null;

// Grupos de cuidado e histórico em memória
export const careGroupsStore = [
  {
    id: 'grp-1',
    name: '👨‍👩‍👧‍👦 Família Mariana — Cuidado Geral',
    category: 'family',
    patientName: 'Mariana Silva',
    avatarBg: '#E0F2F1',
    avatarColor: '#00897B',
    avatarIcon: 'fa-solid fa-people-roof',
    members: ['Você (Cuidador)', 'Mariana (Paciente)', 'Carlos Silva (Irmão)', 'Clara (Enfermeira)'],
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        sender: 'Carlos Silva',
        senderRole: 'Familiar',
        senderColor: '#7E57C2',
        avatar: 'CS',
        text: 'Bom dia pessoal! A Mariana tomou o café e descansou bem esta noite. A saturação ao acordar estava em 89% (dentro do habitual dela).',
        timestamp: '08:30',
        isMe: false,
        status: 'read',
      },
      {
        id: 'm2',
        sender: 'Você',
        senderRole: 'Cuidador Principal',
        avatar: 'DU',
        text: 'Ótimo Carlos! Já preparei a medicação da manhã (Sildenafila 20mg). Ela já tomou.',
        timestamp: '08:42',
        isMe: true,
        status: 'read',
      },
      {
        id: 'm3',
        sender: 'Clara (Enfermeira)',
        senderRole: 'Equipe de Saúde',
        senderColor: '#00897B',
        avatar: 'CE',
        text: 'Perfeito. Lembrem-se de evitar qualquer caminhada sob sol forte hoje. Se ela for ao jardim, usar o concentrador portátil.',
        timestamp: '09:15',
        isMe: false,
        status: 'read',
      },
      {
        id: 'm4',
        sender: 'Sistema Tracker',
        senderRole: 'Telemetria Satelital',
        isSystem: true,
        type: 'gps_card',
        locationName: 'Residência Familiar (Zona Segura)',
        coordinates: '-23.5614, -46.6560',
        battery: '87%',
        timestamp: '10:05',
      },
      {
        id: 'm5',
        sender: 'Carlos Silva',
        senderRole: 'Familiar',
        senderColor: '#7E57C2',
        avatar: 'CS',
        text: 'Acabei de passar na farmácia e peguei os suplementos e as cânulas nasais reservas.',
        timestamp: '10:20',
        isMe: false,
        status: 'received',
      },
    ],
  },
  {
    id: 'grp-2',
    name: '🩺 Cardiologia InCor & Suporte Clínico',
    category: 'medical',
    patientName: 'Mariana Silva',
    avatarBg: '#EDE7F6',
    avatarColor: '#7E57C2',
    avatarIcon: 'fa-solid fa-user-doctor',
    members: ['Dr. Roberto (Cardio InCor)', 'Dra. Helena (Pneumo)', 'Você (Cuidador)'],
    unreadCount: 0,
    messages: [
      {
        id: 'm201',
        sender: 'Dr. Roberto',
        senderRole: 'Cardiologista HC-FMUSP',
        senderColor: '#7E57C2',
        avatar: 'DR',
        text: 'Olá! Analisei os dados do monitoramento desta semana. A frequência cardíaca média ficou estável em 78 bpm e sem picos de síncope.',
        timestamp: 'Ontem 16:40',
        isMe: false,
        status: 'read',
      },
      {
        id: 'm202',
        sender: 'Você',
        senderRole: 'Cuidador Principal',
        avatar: 'DU',
        text: 'Boa tarde Dr. Roberto. Ela teve um episódio rápido de cansaço na terça-feira ao subir uma pequena rampa, mas melhorou com 5 min de oxigênio a 2L/min.',
        timestamp: 'Ontem 17:05',
        isMe: true,
        status: 'read',
      },
      {
        id: 'm203',
        sender: 'Dr. Roberto',
        senderRole: 'Cardiologista HC-FMUSP',
        senderColor: '#7E57C2',
        avatar: 'DR',
        text: 'Excelente conduta. Manter a suplementação de oxigênio conforme prescrito. Agendamos a reavaliação de rotina para daqui a 3 semanas.',
        timestamp: '09:40',
        isMe: false,
        status: 'received',
      },
    ],
  },
  {
    id: 'grp-3',
    name: '🚨 Central SOS & Alertas Rápidos',
    category: 'alerts',
    patientName: 'Mariana Silva',
    avatarBg: '#FFEBEE',
    avatarColor: '#E53935',
    avatarIcon: 'fa-solid fa-triangle-exclamation',
    members: ['Central de Monitoramento Betterdays', 'Equipe de Resgate', 'Você (Cuidador)'],
    unreadCount: 0,
    messages: [
      {
        id: 'm301',
        sender: 'Central Betterdays',
        senderRole: 'Sistema Automático',
        isSystem: true,
        type: 'alert_card',
        title: 'Cerca Virtual: Saída de Perímetro Detectada',
        detail: 'Rastreador portátil se afastou da Zona Segura (Clínica Cardiológica).',
        timestamp: 'Hoje 10:14',
      },
      {
        id: 'm302',
        sender: 'Você',
        senderRole: 'Cuidador Principal',
        avatar: 'DU',
        text: 'Familiar já está acompanhada no carro a caminho de casa.',
        timestamp: 'Hoje 10:18',
        isMe: true,
        status: 'read',
      },
    ],
  },
  {
    id: 'grp-4',
    name: '💊 Farmácia & Oxigenioterapia',
    category: 'medical',
    patientName: 'Mariana Silva',
    avatarBg: '#FFF3E0',
    avatarColor: '#FB8C00',
    avatarIcon: 'fa-solid fa-prescription-bottle-medical',
    members: ['Farmacêutica Juliana (Oxigênio HomeCare)', 'Você (Cuidador)'],
    unreadCount: 0,
    messages: [
      {
        id: 'm401',
        sender: 'Juliana HomeCare',
        senderRole: 'Fornecedor de O2',
        senderColor: '#E65100',
        avatar: 'JH',
        text: 'Bom dia! A troca do cilindro backup de oxigênio medicinal está agendada para amanhã entre 14h e 16h.',
        timestamp: 'Ontem 11:30',
        isMe: false,
        status: 'read',
      },
      {
        id: 'm402',
        sender: 'Você',
        senderRole: 'Cuidador',
        avatar: 'DU',
        text: 'Confirmado Juliana! Estaremos aguardando no endereço cadastrado.',
        timestamp: 'Ontem 11:35',
        isMe: true,
        status: 'read',
      },
    ],
  },
];

export function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.allowedOrigins,
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;
    console.log(`[Socket.io] Client connected: ${socket.id} (${clientIp})`);

    // Enviar lista de grupos inicial ao conectar
    socket.emit('initial_groups', careGroupsStore);

    // 1. Entrar em uma sala de grupo de cuidado
    socket.on('join_group', ({ groupId }) => {
      if (!groupId) return;
      socket.join(`group:${groupId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined group:${groupId}`);
      socket.emit('joined_group_ack', { groupId, timestamp: new Date().toISOString() });
    });

    // 2. Sair da sala do grupo
    socket.on('leave_group', ({ groupId }) => {
      if (!groupId) return;
      socket.leave(`group:${groupId}`);
      console.log(`[Socket.io] Socket ${socket.id} left group:${groupId}`);
    });

    // 3. Enviar mensagem de chat
    socket.on('send_message', (payload, callback) => {
      const {
        groupId,
        text,
        sender = 'Você',
        senderRole = 'Cuidador Principal',
        avatar = 'DU',
        isSystem = false,
        type = 'text',
        locationName,
        coordinates,
        battery,
        title,
        detail,
      } = payload;

      const group = careGroupsStore.find((g) => g.id === groupId);
      if (!group) {
        if (callback) callback({ error: 'Grupo de cuidado não encontrado.' });
        return;
      }

      const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const newMsg = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sender,
        senderRole,
        avatar,
        text,
        timestamp: timeNow,
        isSystem,
        type,
        locationName,
        coordinates,
        battery,
        title,
        detail,
        status: 'sent',
      };

      // Armazenar no histórico
      group.messages.push(newMsg);

      // Broadcast para todos na sala do grupo
      io.to(`group:${groupId}`).emit('receive_message', {
        groupId,
        message: newMsg,
      });

      // Se foi enviado pelo usuário, retornar ACK de confirmação
      if (callback) {
        callback({ success: true, messageId: newMsg.id, timestamp: timeNow });
      }

      // Resposta inteligente simulada da equipe médica/familiar para dinamismo
      simulateCareReply(groupId, text, sender);
    });

    // 4. Indicador de Digitação (Typing status)
    socket.on('typing_status', ({ groupId, user, isTyping }) => {
      socket.to(`group:${groupId}`).emit('user_typing', {
        groupId,
        user,
        isTyping,
      });
    });

    // 5. Confirmação de Leitura
    socket.on('mark_as_read', ({ groupId, messageIds }) => {
      const group = careGroupsStore.find((g) => g.id === groupId);
      if (group && Array.isArray(messageIds)) {
        group.messages.forEach((m) => {
          if (messageIds.includes(m.id)) {
            m.status = 'read';
          }
        });
        io.to(`group:${groupId}`).emit('messages_marked_read', { groupId, messageIds });
      }
    });

    // 6. Disparo de SOS / Emergência em Tempo Real
    socket.on('sos_trigger', (sosData) => {
      console.log('[Socket.io] 🚨 SOS EMERGENCY TRIGGERED:', sosData);
      const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Emissão global para todos os clientes conectados
      io.emit('sos_alert', {
        id: `sos-${Date.now()}`,
        patient: sosData.patient || 'Mariana Silva',
        location: sosData.location || '-23.5614, -46.6560',
        timestamp: timeNow,
        details: sosData.details || 'Botão de pânico ou queda abrupta de saturação O2.',
      });

      // Inserir card de alerta no grupo de emergência (grp-3)
      const sosGroup = careGroupsStore.find((g) => g.id === 'grp-3');
      if (sosGroup) {
        const sosMsg = {
          id: `sos-msg-${Date.now()}`,
          sender: 'Central SOS Betterdays',
          senderRole: 'Disparo Imediato',
          isSystem: true,
          type: 'alert_card',
          title: '🚨 PROTOCOLO SOS ACIONADO',
          detail: `Localização: ${sosData.location || '-23.5614, -46.6560'} • Acionado por ${sosData.sender || 'Cuidador'}`,
          timestamp: timeNow,
        };
        sosGroup.messages.push(sosMsg);
        io.to('group:grp-3').emit('receive_message', { groupId: 'grp-3', message: sosMsg });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
}

// Resposta médica/familiar automática simulada
function simulateCareReply(groupId, userText, senderName) {
  if (senderName !== 'Você') return;

  const responsesByGroup = {
    'grp-1': [
      { sender: 'Carlos Silva', role: 'Familiar', avatar: 'CS', color: '#7E57C2', text: 'Entendido! Estou acompanhando por aqui também.' },
      { sender: 'Clara (Enfermeira)', role: 'Equipe de Saúde', avatar: 'CE', color: '#00897B', text: 'Perfeito, qualquer oscilação na oximetria nos avisem imediatamente.' },
    ],
    'grp-2': [
      { sender: 'Dr. Roberto', role: 'Cardiologista HC-FMUSP', avatar: 'DR', color: '#7E57C2', text: 'Recebido. O registro foi anexado ao histórico clínico da Mariana.' },
      { sender: 'Dra. Helena', role: 'Pneumologista', avatar: 'DH', color: '#7E57C2', text: 'Ótima observação. Manter a oximetria alvo entre 88% e 92% em repouso.' },
    ],
    'grp-4': [
      { sender: 'Juliana HomeCare', role: 'Fornecedor de O2', avatar: 'JH', color: '#E65100', text: 'Pedido registrado e separado pela equipe de logística.' },
    ],
  };

  const pool = responsesByGroup[groupId];
  if (!pool || pool.length === 0) return;

  const reply = pool[Math.floor(Math.random() * pool.length)];

  // 1. Iniciar indicador de digitação após 1.2s
  setTimeout(() => {
    if (!io) return;
    io.to(`group:${groupId}`).emit('user_typing', {
      groupId,
      user: reply.sender,
      isTyping: true,
    });

    // 2. Enviar a mensagem após 2.8s
    setTimeout(() => {
      if (!io) return;
      io.to(`group:${groupId}`).emit('user_typing', {
        groupId,
        user: reply.sender,
        isTyping: false,
      });

      const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const replyMsg = {
        id: `msg-auto-${Date.now()}`,
        sender: reply.sender,
        senderRole: reply.role,
        senderColor: reply.color,
        avatar: reply.avatar,
        text: reply.text,
        timestamp: timeNow,
        isMe: false,
        status: 'received',
      };

      const group = careGroupsStore.find((g) => g.id === groupId);
      if (group) group.messages.push(replyMsg);

      io.to(`group:${groupId}`).emit('receive_message', {
        groupId,
        message: replyMsg,
      });
    }, 1800);
  }, 1200);
}

// Broadcast de telemetria emitido pelo backend
export function broadcastTelemetryUpdate(deviceData) {
  if (!io) return;
  io.emit('telemetry_pulse', {
    deviceId: deviceData.device_id,
    lat: deviceData.lat,
    lng: deviceData.lng,
    battery: deviceData.battery_level,
    timestamp: new Date().toISOString(),
  });
}

export function getIO() {
  return io;
}
