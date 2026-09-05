import React, { useState, useRef, useEffect } from 'react';
import useCareSocket from '../hooks/useCareSocket';

// Dados iniciais pré-configurados de grupos de cuidado inspirados no caso de uso Eisenmenger
const INITIAL_CARE_GROUPS = [
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

export default function CareGroupsChatView({
  profile,
  devices = [],
  onNavigateTab,
  showToast,
  onQuickLocate,
}) {
  const {
    isConnected,
    groups,
    setGroups,
    typingUsers,
    joinGroup,
    sendMessage,
    sendTypingStatus,
    triggerSos,
  } = useCareSocket(INITIAL_CARE_GROUPS);

  const [selectedGroupId, setSelectedGroupId] = useState(INITIAL_CARE_GROUPS[0].id);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'family' | 'medical' | 'alerts'
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Formulário para novo grupo
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('family');
  const [newGroupPatient, setNewGroupPatient] = useState('Mariana Silva');
  const [newGroupMembers, setNewGroupMembers] = useState('Você (Cuidador), Carlos, Dra. Helena');

  const chatMessagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  // Conectar na sala do grupo selecionado no WebSocket
  useEffect(() => {
    if (selectedGroupId) {
      joinGroup(selectedGroupId);
    }
  }, [selectedGroupId, joinGroup]);

  // Auto-scroll ao receber ou enviar mensagens
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedGroupId, selectedGroup?.messages?.length, typingUsers[selectedGroupId]]);

  // Filtragem de grupos
  const filteredGroups = groups.filter((g) => {
    const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Mudança no texto do input com disparo de typing status via WebSocket
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    // Emitir typing status
    sendTypingStatus(selectedGroupId, 'Você', true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTypingStatus(selectedGroupId, 'Você', false);
    }, 1500);
  };

  // Enviar Mensagem via Socket.io
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');
    sendTypingStatus(selectedGroupId, 'Você', false);

    // Envio com WebSocket
    sendMessage(
      {
        groupId: selectedGroupId,
        text: messageText,
        sender: 'Você',
        senderRole: 'Cuidador Principal',
        avatar: 'DU',
        isMe: true,
      },
      (ack) => {
        if (showToast && ack?.success) {
          showToast('Mensagem transmitida em tempo real via WebSocket!');
        }
      }
    );
  };

  // Envio de Ação Rápida no Chat (ex: Compartilhar GPS ou Notificar Medicação)
  const handleQuickAction = (actionType) => {
    if (actionType === 'gps') {
      sendMessage({
        groupId: selectedGroupId,
        sender: 'Você',
        senderRole: 'Telemetria Compartilhada',
        isSystem: true,
        type: 'gps_card',
        locationName: 'Localização Atual da Mariana (Via Satélite)',
        coordinates: '-23.5614, -46.6560',
        battery: devices[0]?.battery_level ? `${devices[0].battery_level}%` : '85%',
      });
      if (showToast) showToast('Localização GPS compartilhada no grupo!');
    } else if (actionType === 'meds') {
      sendMessage({
        groupId: selectedGroupId,
        sender: 'Você',
        senderRole: 'Cuidador Principal',
        avatar: 'DU',
        text: '💊 Dose de medicação e checagem de oximetria confirmada e registrada no prontuário.',
        isMe: true,
      });
      if (showToast) showToast('Confirmação de medicação enviada!');
    } else if (actionType === 'sos') {
      if (onQuickLocate) onQuickLocate();
      triggerSos({
        patient: selectedGroup.patientName || 'Mariana Silva',
        location: '-23.5614, -46.6560',
        sender: 'Cuidador Principal',
        details: 'Protocolo de resgate satelital iniciado via chat de cuidado.',
      });
      if (showToast) showToast('🚨 Alerta SOS emitido via WebSocket para toda a rede de cuidado!');
    }
  };

  // Criar Novo Grupo
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      category: newGroupCategory,
      patientName: newGroupPatient.trim() || 'Mariana Silva',
      avatarBg: newGroupCategory === 'medical' ? '#EDE7F6' : '#E0F2F1',
      avatarColor: newGroupCategory === 'medical' ? '#7E57C2' : '#00897B',
      avatarIcon: newGroupCategory === 'medical' ? 'fa-solid fa-user-doctor' : 'fa-solid fa-users',
      members: newGroupMembers.split(',').map((m) => m.trim()),
      unreadCount: 0,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'Sistema Betterdays',
          senderRole: 'Informação',
          text: `Grupo de cuidado "${newGroupName}" criado para o acompanhamento seguro do paciente.`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isSystem: false,
          isMe: false,
          avatar: 'BD',
          status: 'read',
        },
      ],
    };

    setGroups([newGroup, ...groups]);
    setSelectedGroupId(newGroup.id);
    setIsNewGroupModalOpen(false);
    setNewGroupName('');
    if (showToast) showToast(`Novo grupo de cuidado "${newGroup.name}" criado!`);
  };

  return (
    <div className="whatsapp-chat-container">
      {/* 1. PAINEL ESQUERDO: LISTA DE GRUPOS DE CUIDADO (WhatsApp Style) */}
      <aside className={`chat-sidebar ${isMobileChatOpen ? 'mobile-hidden' : ''}`}>
        {/* Cabeçalho da Sidebar */}
        <div className="chat-sidebar-header">
          <div className="chat-sidebar-title">
            <i className="fa-solid fa-comments" style={{ color: 'var(--color-primary)' }}></i>
            <h2>Grupos de Cuidado</h2>
            <span
              className={`ws-live-badge ${isConnected ? 'connected' : 'connecting'}`}
              title={isConnected ? 'Conectado em tempo real via WebSocket' : 'Tentando conectar ao servidor WebSocket...'}
            >
              <span className="ws-dot"></span>
              {isConnected ? 'Ao Vivo' : 'Conectando'}
            </span>
          </div>
          <button
            type="button"
            className="btn-create-group"
            onClick={() => setIsNewGroupModalOpen(true)}
            title="Criar Novo Grupo de Acompanhamento"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Novo Grupo</span>
          </button>
        </div>

        {/* Barra de Busca de Conversas */}
        <div className="chat-search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Pesquisar grupos ou paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="btn-clear-search" onClick={() => setSearchQuery('')}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        {/* Filtros de Categoria em Chips */}
        <div className="chat-category-chips">
          <button
            type="button"
            className={`category-chip ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            Todos
          </button>
          <button
            type="button"
            className={`category-chip ${categoryFilter === 'family' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('family')}
          >
            👨‍👩‍👦 Família
          </button>
          <button
            type="button"
            className={`category-chip ${categoryFilter === 'medical' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('medical')}
          >
            🩺 Médicos
          </button>
          <button
            type="button"
            className={`category-chip ${categoryFilter === 'alerts' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('alerts')}
          >
            🚨 Alertas SOS
          </button>
        </div>

        {/* Lista de Conversas / Grupos */}
        <div className="chat-groups-list">
          {filteredGroups.length === 0 ? (
            <div className="chat-empty-list">
              <i className="fa-solid fa-comment-slash"></i>
              <p>Nenhum grupo encontrado com este filtro.</p>
            </div>
          ) : (
            filteredGroups.map((grp) => {
              const lastMsg = grp.messages[grp.messages.length - 1];
              const isSelected = grp.id === selectedGroupId;

              return (
                <div
                  key={grp.id}
                  className={`chat-group-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedGroupId(grp.id);
                    setIsMobileChatOpen(true);
                  }}
                >
                  <div
                    className="chat-group-avatar"
                    style={{ backgroundColor: grp.avatarBg, color: grp.avatarColor }}
                  >
                    <i className={grp.avatarIcon}></i>
                  </div>

                  <div className="chat-group-content">
                    <div className="chat-group-top">
                      <h4 className="chat-group-name">{grp.name}</h4>
                      <span className="chat-group-time">{lastMsg ? lastMsg.timestamp : ''}</span>
                    </div>

                    <div className="chat-group-bottom">
                      <p className="chat-group-preview">
                        {typingUsers[grp.id] ? (
                          <span style={{ color: 'var(--color-primary)', fontStyle: 'italic', fontWeight: 600 }}>
                            <i className="fa-solid fa-ellipsis fa-fade"></i> {typingUsers[grp.id]} está digitando...
                          </span>
                        ) : lastMsg ? (
                          lastMsg.type === 'gps_card' ? (
                            <span><i className="fa-solid fa-location-dot" style={{ color: 'var(--color-primary)' }}></i> Compartilhou localização</span>
                          ) : lastMsg.type === 'alert_card' ? (
                            <span style={{ color: 'var(--color-danger)' }}><i className="fa-solid fa-triangle-exclamation"></i> Alerta de Emergência</span>
                          ) : (
                            `${lastMsg.sender}: ${lastMsg.text}`
                          )
                        ) : (
                          'Nenhuma mensagem ainda.'
                        )}
                      </p>

                      {grp.unreadCount > 0 && (
                        <span className="chat-unread-badge">{grp.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. PAINEL DIREITO: CONVERSA ATIVA (WhatsApp Style Feed) */}
      <section className={`chat-main-conversation ${!isMobileChatOpen ? 'mobile-hidden' : ''}`}>
        {/* Cabeçalho da Conversa Ativa */}
        <header className="chat-conv-header">
          {/* Botão Voltar no Mobile */}
          <button
            type="button"
            className="btn-chat-back-mobile"
            onClick={() => setIsMobileChatOpen(false)}
            title="Voltar para a Lista de Grupos"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <div
            className="chat-conv-avatar"
            style={{ backgroundColor: selectedGroup.avatarBg, color: selectedGroup.avatarColor }}
          >
            <i className={selectedGroup.avatarIcon}></i>
          </div>

          <div className="chat-conv-info">
            <h3 className="chat-conv-title">{selectedGroup.name}</h3>
            <p className="chat-conv-members">
              <span className={`online-indicator ${isConnected ? 'online' : 'offline'}`}></span>
              {typingUsers[selectedGroupId] ? (
                <strong style={{ color: 'var(--color-primary)' }}>{typingUsers[selectedGroupId]} está digitando...</strong>
              ) : (
                selectedGroup.members.join(', ')
              )}
            </p>
          </div>

          <div className="chat-conv-actions">
            <button
              type="button"
              className="btn-chat-header-action"
              title="Teleconsulta / Chamada Rápida"
              onClick={() => showToast && showToast('Iniciando sala segura de áudio/vídeo com a equipe médica...')}
            >
              <i className="fa-solid fa-phone"></i>
            </button>
            <button
              type="button"
              className="btn-chat-header-action"
              title="Informações do Grupo e Paciente"
              onClick={() => setIsGroupInfoOpen(!isGroupInfoOpen)}
            >
              <i className="fa-solid fa-circle-info"></i>
            </button>
          </div>
        </header>

        {/* Feed de Mensagens com Balões */}
        <div className="chat-messages-body">
          <div className="chat-date-divider">
            <span>Hoje • Monitoramento Ativo em Tempo Real</span>
          </div>

          {selectedGroup.messages.map((msg) => {
            if (msg.type === 'gps_card') {
              return (
                <div key={msg.id} className="chat-system-card gps">
                  <div className="system-card-icon">
                    <i className="fa-solid fa-satellite-dish"></i>
                  </div>
                  <div className="system-card-details">
                    <strong>{msg.locationName}</strong>
                    <span>Coordenadas: {msg.coordinates} &bull; Bateria: {msg.battery}</span>
                    <button
                      type="button"
                      className="btn-system-card-action"
                      onClick={() => onNavigateTab && onNavigateTab('map')}
                    >
                      <i className="fa-solid fa-map-location-dot"></i> Abrir no Mapa Satelital
                    </button>
                  </div>
                  <span className="system-card-time">{msg.timestamp}</span>
                </div>
              );
            }

            if (msg.type === 'alert_card') {
              return (
                <div key={msg.id} className="chat-system-card alert">
                  <div className="system-card-icon alert-icon">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div className="system-card-details">
                    <strong style={{ color: 'var(--color-danger-dark)' }}>{msg.title}</strong>
                    <span>{msg.detail}</span>
                  </div>
                  <span className="system-card-time">{msg.timestamp}</span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.isMe ? 'outgoing' : 'incoming'}`}
              >
                {!msg.isMe && (
                  <div className="chat-bubble-avatar">{msg.avatar || 'U'}</div>
                )}

                <div className={`chat-bubble ${msg.isMe ? 'bubble-me' : 'bubble-other'}`}>
                  {!msg.isMe && (
                    <div
                      className="bubble-sender-name"
                      style={{ color: msg.senderColor || 'var(--color-secondary)' }}
                    >
                      {msg.sender} <span className="sender-role">({msg.senderRole})</span>
                    </div>
                  )}

                  <div className="bubble-text">{msg.text}</div>

                  <div className="bubble-footer">
                    <span className="bubble-time">{msg.timestamp}</span>
                    {msg.isMe && (
                      <span className="bubble-check" title="Transmitido via WebSocket">
                        <i className="fa-solid fa-check-double" style={{ color: '#0284C7' }}></i>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Balão animado de Digitação */}
          {typingUsers[selectedGroupId] && (
            <div className="chat-bubble-row incoming typing-bubble-row">
              <div className="chat-typing-bubble">
                <div className="typing-dots-animation">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">{typingUsers[selectedGroupId]} está digitando...</span>
              </div>
            </div>
          )}

          <div ref={chatMessagesEndRef} />
        </div>

        {/* Barra de Ações Rápidas de 1 Toque */}
        <div className="chat-quick-actions-bar">
          <button
            type="button"
            className="quick-action-pill"
            onClick={() => handleQuickAction('gps')}
          >
            <i className="fa-solid fa-location-dot" style={{ color: 'var(--color-primary)' }}></i>
            <span>Compartilhar GPS</span>
          </button>
          <button
            type="button"
            className="quick-action-pill"
            onClick={() => handleQuickAction('meds')}
          >
            <i className="fa-solid fa-pills" style={{ color: 'var(--color-success)' }}></i>
            <span>Confirmar Medicação</span>
          </button>
          <button
            type="button"
            className="quick-action-pill sos-pill"
            onClick={() => handleQuickAction('sos')}
          >
            <i className="fa-solid fa-crosshairs"></i>
            <span>Disparo SOS</span>
          </button>
        </div>

        {/* Barra de Digitação (WhatsApp Style Input) */}
        <form className="chat-input-bar" onSubmit={handleSendMessage}>
          <button
            type="button"
            className="btn-chat-attach"
            title="Anexar Exame / Foto / Prontuário"
            onClick={() => showToast && showToast('Anexo de exames médicos selecionado.')}
          >
            <i className="fa-solid fa-paperclip"></i>
          </button>

          <input
            type="text"
            className="chat-text-input"
            placeholder="Digite uma mensagem para o grupo de cuidado..."
            value={inputText}
            onChange={handleInputChange}
          />

          <button
            type="submit"
            className={`btn-chat-send ${inputText.trim() ? 'active' : ''}`}
            title="Enviar Mensagem"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </section>

      {/* 3. MODAL: CRIAR NOVO GRUPO DE CUIDADO */}
      {isNewGroupModalOpen && (
        <div className="chat-modal-overlay" onClick={() => setIsNewGroupModalOpen(false)}>
          <div className="chat-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3>
                <i className="fa-solid fa-users-medical" style={{ color: 'var(--color-primary)' }}></i>
                Criar Novo Grupo de Cuidado
              </h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsNewGroupModalOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="form-field">
                <label>Nome do Grupo de Cuidado *</label>
                <input
                  type="text"
                  placeholder="Ex: 🩺 Dra. Helena - Pneumologista"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Categoria do Grupo</label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                >
                  <option value="family">👨‍👩‍👧‍👦 Familiar & Apoio Diário</option>
                  <option value="medical">🩺 Médicos & Especialistas Cardiológicos</option>
                  <option value="alerts">🚨 Plantão & Emergências</option>
                </select>
              </div>

              <div className="form-field">
                <label>Paciente Associado</label>
                <input
                  type="text"
                  value={newGroupPatient}
                  onChange={(e) => setNewGroupPatient(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Membros (Separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="Você, Dr. Silva, Enfermeira Ana"
                  value={newGroupMembers}
                  onChange={(e) => setNewGroupMembers(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsNewGroupModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-modal-submit">
                  <i className="fa-solid fa-check"></i> Criar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
