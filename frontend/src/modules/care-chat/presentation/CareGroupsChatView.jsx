import React, { useState, useRef, useEffect } from 'react';
import useCareSocket from './useCareSocket.js';
import useWebRTCCall from '../application/useWebRTCCall.js';
import CallModal from './CallModal.jsx';
import localVaultService from '../../../core/services/localVaultService.js';
import { CALL_TYPES, validateP2PFile } from '../domain/webrtcModel.js';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';

// Dados iniciais pré-configurados de grupos de cuidado com tipografia limpa e sem emojis
const INITIAL_CARE_GROUPS = [
  {
    id: 'grp-1',
    name: 'Família Mariana — Cuidado Geral',
    category: 'family',
    patientName: 'Mariana Silva',
    avatarBg: 'var(--color-bg-surface-subtle, #f1f5f9)',
    avatarColor: 'var(--color-primary, #0D9488)',
    avatarIcon: 'fa-solid fa-users',
    members: ['Você (Cuidador)', 'Mariana (Paciente)', 'Carlos Silva (Irmão)', 'Clara (Enfermeira)'],
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        sender: 'Carlos Silva',
        senderRole: 'Familiar',
        senderColor: '#64748b',
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
        senderColor: '#0D9488',
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
        senderColor: '#64748b',
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
    name: 'Cardiologia InCor & Suporte Clínico',
    category: 'medical',
    patientName: 'Mariana Silva',
    avatarBg: 'var(--color-bg-surface-subtle, #f1f5f9)',
    avatarColor: 'var(--color-primary, #0D9488)',
    avatarIcon: 'fa-solid fa-user-doctor',
    members: ['Dr. Roberto (Cardio InCor)', 'Dra. Helena (Pneumo)', 'Você (Cuidador)'],
    unreadCount: 0,
    messages: [
      {
        id: 'm201',
        sender: 'Dr. Roberto',
        senderRole: 'Cardiologista HC-FMUSP',
        senderColor: '#0D9488',
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
        senderColor: '#0D9488',
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
    name: 'Central SOS & Alertas Rápidos',
    category: 'alerts',
    patientName: 'Mariana Silva',
    avatarBg: 'var(--color-bg-surface-subtle, #f1f5f9)',
    avatarColor: 'var(--color-danger, #ef4444)',
    avatarIcon: 'fa-solid fa-bell',
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
    name: 'Farmácia & Oxigenioterapia',
    category: 'medical',
    patientName: 'Mariana Silva',
    avatarBg: 'var(--color-bg-surface-subtle, #f1f5f9)',
    avatarColor: 'var(--color-primary, #0D9488)',
    avatarIcon: 'fa-solid fa-pills',
    members: ['Farmacêutica Juliana (Oxigênio HomeCare)', 'Você (Cuidador)'],
    unreadCount: 0,
    messages: [
      {
        id: 'm401',
        sender: 'Juliana HomeCare',
        senderRole: 'Fornecedor de O2',
        senderColor: '#64748b',
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
  devices = [],
  onNavigateTab,
  showToast,
  onQuickLocate,
}) {
  const { t } = useI18n();
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

  // WebRTC Voice & Video Call Hook
  const callControls = useWebRTCCall({
    currentGroupId: selectedGroupId,
    currentUser: { name: 'Você (Cuidador)' },
    showToast,
  });

  // Transferência de Arquivo P2P & Cofre LGPD
  const [p2pTransfer, setP2pTransfer] = useState(null); // { fileName, progress, status }
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const fileInputRef = useRef(null);

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

  // Inicializar cofre local criptografado (Zero Nuvem / LGPD)
  useEffect(() => {
    localVaultService.init().catch((err) => console.warn('[LocalVault] Init fallback:', err));
  }, []);

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
        text: 'Dose de medicação e checagem de oximetria confirmada e registrada no prontuário.',
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
      if (showToast) showToast('Alerta SOS emitido via WebSocket para toda a rede de cuidado!');
    }
  };

  // Transferência de Arquivo P2P Direto (Sem Nuvem)
  const handleP2PFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateP2PFile(file);
      setP2pTransfer({ fileName: file.name, progress: 0, status: 'transferring' });
      
      if (showToast) showToast(`Iniciando transferência P2P de "${file.name}" (Zero-Cloud)...`);

      // Salvar no IndexedDB local seguro
      await localVaultService.saveFile(
        selectedGroupId,
        { name: file.name, size: file.size, mimeType: file.type },
        file
      );

      // Simulação de progresso de envio P2P em chunks
      let prog = 0;
      const interval = setInterval(() => {
        prog += 25;
        setP2pTransfer((p) => (p ? { ...p, progress: Math.min(100, prog) } : null));
        if (prog >= 100) {
          clearInterval(interval);
          setP2pTransfer((p) => (p ? { ...p, status: 'completed' } : null));
          setTimeout(() => setP2pTransfer(null), 3000);
        }
      }, 300);

      // Enviar mensagem de arquivo no grupo
      sendMessage({
        groupId: selectedGroupId,
        sender: 'Você',
        senderRole: 'Cuidador Principal',
        avatar: 'DU',
        isMe: true,
        type: 'p2p_file',
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        mimeType: file.type,
        text: `Arquivo médico transferido via túnel direto P2P (${file.name})`,
      });

      if (e.target) e.target.value = '';
    } catch (err) {
      console.error('[P2P File] Error:', err);
      if (showToast) showToast(err.message || 'Erro ao preparar arquivo P2P', 'error');
      setP2pTransfer(null);
    }
  };

  // LGPD: Exportar cofre local
  const handleExportVault = async () => {
    try {
      const jsonStr = await localVaultService.exportVaultJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `betterdays_vault_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      if (showToast) showToast('Cofre exportado com sucesso (Portabilidade LGPD)!');
    } catch (err) {
      if (showToast) showToast('Erro ao exportar cofre local.', 'error');
    }
  };

  // LGPD: Limpeza total de dados
  const handlePurgeData = async () => {
    if (window.confirm('Atenção: Todos os dados locais de mensagens e arquivos serão permanentemente excluídos deste celular (Conformidade LGPD). Deseja continuar?')) {
      await localVaultService.purgeAllData();
      setIsVaultModalOpen(false);
      if (showToast) showToast('Dados locais excluídos com sucesso.');
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
      avatarBg: 'var(--color-bg-surface-subtle, #f1f5f9)',
      avatarColor: 'var(--color-primary, #0D9488)',
      avatarIcon: newGroupCategory === 'medical' ? 'fa-solid fa-user-doctor' : newGroupCategory === 'alerts' ? 'fa-solid fa-bell' : 'fa-solid fa-users',
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
            <span
              className={`ws-live-badge ${isConnected ? 'connected' : 'connecting'}`}
              title={isConnected ? 'Conectado em tempo real via WebSocket' : 'Tentando conectar ao servidor WebSocket...'}
            >
              <span className="ws-dot"></span>
              {isConnected ? t('common.online') : t('common.loading')}
            </span>
          </div>
          <button
            type="button"
            className="btn-create-group"
            onClick={() => setIsNewGroupModalOpen(true)}
            title="Criar Novo Grupo"
          >
            <i className="fa-solid fa-plus"></i>
            <span>{t('common.actions')}</span>
          </button>
        </div>

        {/* Barra de Busca de Conversas */}
        <div className="chat-search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
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
            {t('chat.filterAll')}
          </button>
          <button
            type="button"
            className={`category-chip ${categoryFilter === 'family' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('family')}
          >
            <i className="fa-solid fa-users" style={{ marginRight: '5px' }}></i> {t('chat.filterFamily')}
          </button>
          <button
            type="button"
            className={`category-chip ${categoryFilter === 'medical' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('medical')}
          >
            <i className="fa-solid fa-user-doctor" style={{ marginRight: '5px' }}></i> {t('chat.filterMedical')}
          </button>
          <button
            type="button"
            className={`category-chip ${categoryFilter === 'alerts' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('alerts')}
          >
            <i className="fa-solid fa-bell" style={{ marginRight: '5px' }}></i> {t('chat.filterAlerts')}
          </button>
        </div>

        {/* Lista de Conversas / Grupos */}
        <div className="chat-groups-list">
          {filteredGroups.length === 0 ? (
            <div className="chat-empty-list">
              <i className="fa-solid fa-comment-slash"></i>
              <p>{t('common.emptyList')}</p>
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
                            <span><i className="fa-solid fa-location-dot" style={{ color: 'var(--color-primary)' }}></i> GPS</span>
                          ) : lastMsg.type === 'alert_card' ? (
                            <span style={{ color: 'var(--color-danger)' }}><i className="fa-solid fa-triangle-exclamation"></i> SOS</span>
                          ) : (
                            `${lastMsg.sender}: ${lastMsg.text}`
                          )
                        ) : (
                          t('common.emptyList')
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
            title={t('common.back')}
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
            {/* Chamada de Voz P2P */}
            <button
              type="button"
              className="btn-chat-header-action"
              title="Chamada de Voz P2P (WebRTC E2EE)"
              onClick={() => callControls.startCall(CALL_TYPES.AUDIO)}
            >
              <i className="fa-solid fa-phone"></i>
            </button>

            {/* Chamada de Vídeo P2P */}
            <button
              type="button"
              className="btn-chat-header-action"
              title="Chamada de Vídeo P2P (WebRTC E2EE)"
              onClick={() => callControls.startCall(CALL_TYPES.VIDEO)}
            >
              <i className="fa-solid fa-video"></i>
            </button>

            {/* Cofre LGPD & Armazenamento Local */}
            <button
              type="button"
              className="btn-chat-header-action"
              title="Cofre Local Criptografado & LGPD (Zero Nuvem)"
              onClick={() => setIsVaultModalOpen(true)}
            >
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-primary)' }}></i>
            </button>

            {/* Informações do Grupo */}
            <button
              type="button"
              className="btn-chat-header-action"
              title="Informações do Grupo"
              onClick={() => setIsGroupInfoOpen(!isGroupInfoOpen)}
            >
              <i className="fa-solid fa-circle-info"></i>
            </button>
          </div>
        </header>

        {/* Feed de Mensagens com Balões */}
        <div className="chat-messages-body">
          <div className="chat-date-divider">
            <span>{t('chat.subtitle')} • 🔒 Túnel P2P & Armazenamento Local</span>
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
                      <i className="fa-solid fa-map-location-dot"></i> {t('tracking.breadcrumb')}
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

            if (msg.type === 'p2p_file') {
              return (
                <div
                  key={msg.id}
                  className={`chat-bubble-row ${msg.isMe ? 'outgoing' : 'incoming'}`}
                >
                  {!msg.isMe && (
                    <div className="chat-bubble-avatar">{msg.avatar || 'U'}</div>
                  )}

                  <div className={`chat-bubble ${msg.isMe ? 'bubble-me' : 'bubble-other'} p2p-file-bubble`}>
                    {!msg.isMe && (
                      <div
                        className="bubble-sender-name"
                        style={{ color: msg.senderColor || 'var(--color-secondary)' }}
                      >
                        {msg.sender} <span className="sender-role">({msg.senderRole})</span>
                      </div>
                    )}

                    <div className="p2p-file-box">
                      <div className="p2p-file-icon-wrap">
                        <i className="fa-solid fa-file-medical"></i>
                      </div>
                      <div className="p2p-file-meta">
                        <strong className="p2p-name">{msg.fileName}</strong>
                        <span className="p2p-size">{msg.fileSize} &bull; Transferência Direta P2P</span>
                      </div>
                    </div>

                    <div className="bubble-footer">
                      <span className="bubble-time">{msg.timestamp}</span>
                      <span className="p2p-badge-tag" title="Armazenado apenas no celular (Zero Nuvem)">
                        <i className="fa-solid fa-lock"></i> E2EE Local
                      </span>
                    </div>
                  </div>
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
                      <span className="bubble-check" title="WebSocket / P2P">
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

        {/* Indicador de Progresso de Transferência P2P */}
        {p2pTransfer && (
          <div className="p2p-transfer-banner">
            <i className="fa-solid fa-circle-nodes fa-spin" style={{ color: 'var(--color-primary)' }}></i>
            <div className="p2p-transfer-info">
              <span>Transferindo "{p2pTransfer.fileName}" diretamente (P2P)...</span>
              <div className="p2p-progress-track">
                <div className="p2p-progress-fill" style={{ width: `${p2pTransfer.progress}%` }}></div>
              </div>
            </div>
            <span className="p2p-progress-pct">{p2pTransfer.progress}%</span>
          </div>
        )}

        {/* Barra de Ações Rápidas de 1 Toque */}
        <div className="chat-quick-actions-bar">
          <button
            type="button"
            className="quick-action-pill"
            onClick={() => handleQuickAction('gps')}
          >
            <i className="fa-solid fa-location-dot"></i>
            <span>GPS</span>
          </button>
          <button
            type="button"
            className="quick-action-pill"
            onClick={() => handleQuickAction('meds')}
          >
            <i className="fa-solid fa-pills"></i>
            <span>Medicação</span>
          </button>
          <button
            type="button"
            className="quick-action-pill sos-pill"
            onClick={() => handleQuickAction('sos')}
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{t('chat.quickAlert')}</span>
          </button>
        </div>

        {/* Barra de Digitação com Botão de Anexo P2P */}
        <form className="chat-input-bar" onSubmit={handleSendMessage}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleP2PFileSelect}
          />

          <button
            type="button"
            className="btn-chat-attach"
            title="Enviar Arquivo P2P Direto (Zero Nuvem / LGPD)"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fa-solid fa-paperclip"></i>
          </button>

          <input
            type="text"
            className="chat-text-input"
            placeholder={t('chat.inputPlaceholder')}
            value={inputText}
            onChange={handleInputChange}
          />

          <button
            type="submit"
            className={`btn-chat-send ${inputText.trim() ? 'active' : ''}`}
            title={t('chat.send')}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </section>

      {/* MODAL WEBRTC: CHAMADA DE VOZ & VÍDEO */}
      <CallModal
        {...callControls}
        groupName={selectedGroup?.name}
      />

      {/* MODAL LGPD: COFRE LOCAL CRIPTOGRAFADO (ZERO NUVEM) */}
      {isVaultModalOpen && (
        <div className="chat-modal-overlay" onClick={() => setIsVaultModalOpen(false)}>
          <div className="chat-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3>
                <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-primary)' }}></i>
                Cofre Local & Privacidade LGPD
              </h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsVaultModalOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: 'var(--text-main)' }}>
              <div style={{ background: 'var(--color-primary-light)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--color-primary-subtle)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="fa-solid fa-lock" style={{ fontSize: '20px', color: 'var(--color-primary)' }}></i>
                <div>
                  <strong>Zero-Cloud Knowledge Ativo</strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Suas conversas e exames ficam salvos exclusivamente na memória deste celular (IndexedDB + AES-256-GCM).
                  </p>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong>, você possui controle absoluto sobre seus dados médicos e mensagens.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={handleExportVault}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface-subtle)',
                    color: 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fa-solid fa-file-export" style={{ color: 'var(--color-primary)' }}></i>
                  Exportar Histórico e Prontuário (Portabilidade Art. 18)
                </button>

                <button
                  type="button"
                  onClick={handlePurgeData}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-danger-subtle)',
                    background: 'var(--color-danger-light)',
                    color: 'var(--color-danger-dark)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fa-solid fa-trash-can"></i>
                  Excluir Todos os Dados Locais deste Celular
                </button>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', padding: '12px 20px' }}>
              <button
                type="button"
                className="btn-modal-submit"
                onClick={() => setIsVaultModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL: CRIAR NOVO GRUPO DE CUIDADO */}
      {isNewGroupModalOpen && (
        <div className="chat-modal-overlay" onClick={() => setIsNewGroupModalOpen(false)}>
          <div className="chat-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3>
                <i className="fa-solid fa-users-medical" style={{ color: 'var(--color-primary)' }}></i>
                Criar Novo Grupo
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
                <label>Nome do Grupo *</label>
                <input
                  type="text"
                  placeholder="Ex: Dra. Helena - Pneumologista"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Categoria</label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                >
                  <option value="family">Familiar & Apoio</option>
                  <option value="medical">Equipe Médica & Especialistas</option>
                  <option value="alerts">Alertas & Emergências</option>
                </select>
              </div>

              <div className="form-field">
                <label>Paciente</label>
                <input
                  type="text"
                  value={newGroupPatient}
                  onChange={(e) => setNewGroupPatient(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Membros</label>
                <input
                  type="text"
                  placeholder="Você, Dr. Silva, Enfermeira"
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
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn-modal-submit">
                  <i className="fa-solid fa-check"></i> {t('common.confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
