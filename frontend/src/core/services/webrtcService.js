/**
 * webrtcService.js — WebRTC PeerConnection, MediaStreams (Voz/Vídeo) & RTCDataChannel P2P Engine
 * 
 * Gerencia o ciclo de vida de conexões P2P diretas entre smartphones/browsers
 * para chamadas de áudio, vídeo e transferência de arquivos em chunks de 64 KB.
 */
import socketService from './socketService.js';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const CHUNK_SIZE = 64 * 1024; // 64 KB por fragmento

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.localStream = null;
    this.remoteStream = null;
    this.simulationStream = null;
    this.activeGroupId = null;
    this._animTimers = [];

    // Callbacks de eventos
    this.onRemoteStreamCallback = null;
    this.onCallEndedCallback = null;
    this.onDataChannelMessageCallback = null;
    this.onFileTransferProgressCallback = null;

    this.receivingFile = null;
  }

  /**
   * Inicializa RTCPeerConnection com STUN do Google
   */
  _createPeerConnection(groupId) {
    this.activeGroupId = groupId;
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Enviar ICE Candidate gerado localmente para o peer via Socket.io
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.emit('webrtc_ice_candidate', {
          groupId,
          candidate: event.candidate,
        });
      }
    };

    // Receber trilhas de áudio/vídeo remotas
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Trilha de mídia remota recebida:', event.streams);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      }
    };

    // Receber DataChannel do peer remoto
    this.peerConnection.ondatachannel = (event) => {
      console.log('[WebRTC] RTCDataChannel recebido do peer remoto');
      this._setupDataChannel(event.channel);
    };

    return this.peerConnection;
  }

  /**
   * Configura listeners do RTCDataChannel para chat e arquivos P2P
   */
  _setupDataChannel(channel) {
    this.dataChannel = channel;
    this.dataChannel.binaryType = 'arraybuffer';

    this.dataChannel.onopen = () => {
      console.log('[WebRTC] RTCDataChannel P2P aberto com sucesso!');
    };

    this.dataChannel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'FILE_START') {
            this.receivingFile = {
              ...parsed,
              receivedChunks: [],
              receivedBytes: 0,
            };
            console.log(`[WebRTC] Iniciando recebimento P2P do arquivo: ${parsed.name}`);
          } else if (parsed.type === 'FILE_END') {
            if (this.receivingFile) {
              const completeBlob = new Blob(this.receivingFile.receivedChunks, {
                type: this.receivingFile.mimeType || 'application/octet-stream',
              });
              console.log(`[WebRTC] Arquivo P2P recebido com sucesso: ${this.receivingFile.name} (${completeBlob.size} bytes)`);
              if (this.onDataChannelMessageCallback) {
                this.onDataChannelMessageCallback({
                  type: 'file_received',
                  file: this.receivingFile,
                  blob: completeBlob,
                });
              }
              this.receivingFile = null;
            }
          } else {
            // Mensagem de texto direta E2EE
            if (this.onDataChannelMessageCallback) {
              this.onDataChannelMessageCallback(parsed);
            }
          }
        } catch (err) {
          console.warn('[WebRTC] Erro ao parsear mensagem DataChannel:', err);
        }
      } else if (event.data instanceof ArrayBuffer) {
        // Chunk binário do arquivo
        if (this.receivingFile) {
          this.receivingFile.receivedChunks.push(event.data);
          this.receivingFile.receivedBytes += event.data.byteLength;
          const progress = Math.min(
            100,
            Math.round((this.receivingFile.receivedBytes / this.receivingFile.size) * 100)
          );
          if (this.onFileTransferProgressCallback) {
            this.onFileTransferProgressCallback({
              fileId: this.receivingFile.id,
              progress,
              status: 'receiving',
            });
          }
        }
      }
    };
  }

  /**
   * Captura áudio e vídeo do dispositivo do usuário (com fallback animado se necessário)
   */
  async getLocalUserMedia(callType = 'video') {
    const isVideo = callType === 'video';
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: isVideo ? {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        facingMode: 'user',
      } : false,
    };

    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        return this.localStream;
      } catch (err) {
        console.warn('[WebRTC] Câmera/Microfone real não disponível ou permissão negada. Ativando fallback animado:', err);
      }
    }

    // Fallback animado caso não haja câmera física ou permissão negada
    this.localStream = this._createAnimatedStream('local', isVideo);
    return this.localStream;
  }

  /**
   * Inicia chamada P2P (Offer SDP)
   */
  async initiateCall(groupId, callType = 'video', callerName = 'Cuidador') {
    this._createPeerConnection(groupId);
    
    // Criar DataChannel para comunicação direta
    const channel = this.peerConnection.createDataChannel('betterdays-p2p', {
      ordered: true,
    });
    this._setupDataChannel(channel);

    // Obter mídia local
    const stream = await this.getLocalUserMedia(callType);
    if (stream && stream.getTracks) {
      stream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, stream);
      });
    }

    // Criar Offer SDP
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Emitir sinalização via Socket.io
    socketService.emit('webrtc_call_initiate', {
      groupId,
      callType,
      callerName,
      offerSDP: offer,
    });

    return { localStream: this.localStream, offer };
  }

  /**
   * Atende chamada recebida (Answer SDP)
   */
  async answerCall(groupId, offerSDP, callType = 'video', responderName = 'Equipe Médica') {
    this._createPeerConnection(groupId);

    const stream = await this.getLocalUserMedia(callType);
    if (stream && stream.getTracks) {
      stream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, stream);
      });
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSDP));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    socketService.emit('webrtc_call_answer', {
      groupId,
      responderName,
      answerSDP: answer,
    });

    return { localStream: this.localStream, answer };
  }

  /**
   * Aplica a resposta SDP remota
   */
  async handleRemoteAnswer(answerSDP) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSDP));
      console.log('[WebRTC] SDP Answer remota aplicada com sucesso!');
    }
  }

  /**
   * Adiciona candidato ICE remoto
   */
  async handleRemoteIceCandidate(candidate) {
    if (this.peerConnection && candidate) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTC] Erro ao adicionar ICE candidate remoto:', err);
      }
    }
  }

  /**
   * Envia arquivo diretamente para o celular remoto em Chunks P2P via DataChannel
   */
  async sendFileP2P(file, onProgress) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Canal P2P DataChannel não está aberto.');
    }

    const fileMeta = {
      id: `file-${Date.now()}`,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
    };

    // 1. Enviar cabeçalho
    this.dataChannel.send(JSON.stringify({ type: 'FILE_START', ...fileMeta }));

    // 2. Transmitir Chunks
    let offset = 0;
    while (offset < file.size) {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const buffer = await slice.arrayBuffer();
      this.dataChannel.send(buffer);
      offset += CHUNK_SIZE;

      const progress = Math.min(100, Math.round((offset / file.size) * 100));
      if (onProgress) onProgress(progress);
      if (this.onFileTransferProgressCallback) {
        this.onFileTransferProgressCallback({ fileId: fileMeta.id, progress, status: 'sending' });
      }
    }

    // 3. Enviar sinalizador de encerramento
    this.dataChannel.send(JSON.stringify({ type: 'FILE_END', id: fileMeta.id }));
    return fileMeta;
  }

  /**
   * Retorna stream de simulação médica para chamadas de demonstração/teste
   */
  getDoctorSimulationStream() {
    if (!this.simulationStream) {
      this.simulationStream = this._createAnimatedStream('doctor', true);
    }
    return this.simulationStream;
  }

  /**
   * Encerra a chamada WebRTC e libera os streams e animações
   */
  hangupCall(groupId, reason = 'user_hangup') {
    if (this.activeGroupId || groupId) {
      socketService.emit('webrtc_call_hangup', {
        groupId: groupId || this.activeGroupId,
        reason,
      });
    }

    // Limpar timers de animação de canvas
    this._animTimers.forEach((timer) => clearInterval(timer));
    this._animTimers = [];

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }

    if (this.simulationStream) {
      this.simulationStream.getTracks().forEach((track) => track.stop());
      this.simulationStream = null;
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.activeGroupId = null;

    if (this.onCallEndedCallback) {
      this.onCallEndedCallback(reason);
    }
  }

  /**
   * Gerador dinâmico de vídeo com animação contínua a 30 FPS
   */
  _createAnimatedStream(type = 'doctor', hasVideo = true) {
    if (typeof document === 'undefined') {
      return new MediaStream();
    }

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new MediaStream();

    let frame = 0;
    const isDoctor = type === 'doctor';

    const drawFrame = () => {
      frame++;
      const timeSec = (Date.now() / 1000).toFixed(1);

      // Fundo em gradiente suave moderno
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (isDoctor) {
        gradient.addColorStop(0, '#0F172A');
        gradient.addColorStop(1, '#020617');
      } else {
        gradient.addColorStop(0, '#042F2E');
        gradient.addColorStop(1, '#0F172A');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grade sutil de telemetria
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (isDoctor) {
        // 1. Círculo do avatar médico com anel de pulso
        const centerX = canvas.width / 2;
        const centerY = 160;
        const pulseSize = 48 + Math.sin(frame * 0.08) * 4;

        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize + 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(13, 148, 136, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 48, 0, Math.PI * 2);
        ctx.fillStyle = '#0D9488';
        ctx.fill();

        // Ícone/Texto do Médico
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🩺', centerX, centerY);

        // Identificação do Médico
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#F8FAFC';
        ctx.fillText('Dr. Roberto Albuquerque', centerX, 235);

        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Cardiologista de Plantão • CRM 148.920-SP', centerX, 258);

        // 2. Gráfico de ECG animado (Heartbeat Waveform)
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const ecgY = 340;
        const ecgWidth = 460;
        const ecgStartX = (canvas.width - ecgWidth) / 2;

        ctx.moveTo(ecgStartX, ecgY);
        for (let i = 0; i < ecgWidth; i += 4) {
          const x = ecgStartX + i;
          const phase = (i - (frame * 4) % ecgWidth + ecgWidth) % ecgWidth;
          let yOffset = 0;
          if (phase > 180 && phase < 220) {
            if (phase < 190) yOffset = -(phase - 180) * 2;
            else if (phase < 205) yOffset = (phase - 190) * 4 - 20;
            else yOffset = -(phase - 205) * 3 + 40;
          }
          ctx.lineTo(x, ecgY + yOffset);
        }
        ctx.stroke();

        // 3. Indicadores de Telemetria ao vivo
        ctx.textAlign = 'left';
        ctx.font = '12px monospace';
        ctx.fillStyle = '#34D399';
        ctx.fillText(`♥ BPM: 72 bpm`, ecgStartX, 385);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`⚡ SpO2: 99%`, ecgStartX + 140, 385);
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(`📡 Latência: 12ms P2P`, ecgStartX + 260, 385);

        // Header do feed médico
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(16, 16, 210, 32);
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(30, 32, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('INCOR TELEMEDICINA', 42, 36);

      } else {
        // Feed Local do Usuário
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 20;

        ctx.beginPath();
        ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
        ctx.fillStyle = '#0F766E';
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👤', centerX, centerY);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#F1F5F9';
        ctx.fillText('Você (Câmera Local)', centerX, centerY + 65);

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Túnel WebRTC Criptografado E2EE', centerX, centerY + 88);
      }
    };

    // Desenhar primeiro frame imediatamente
    drawFrame();

    // Rodar a 25 fps para streaming contínuo e estável
    const timer = setInterval(drawFrame, 40);
    this._animTimers.push(timer);

    const stream = canvas.captureStream ? canvas.captureStream(25) : new MediaStream();
    return stream;
  }
}

export const webrtcService = new WebRTCService();
export default webrtcService;
