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
    this.activeGroupId = null;

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
   * Captura áudio e vídeo do dispositivo do usuário
   */
  async getLocalUserMedia(callType = 'video') {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: callType === 'video' ? {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        facingMode: 'user',
      } : false,
    };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (err) {
      console.warn('[WebRTC] Câmera/Microfone não disponível ou negado, simulando stream:', err);
      // Fallback para canvas/áudio simulado caso não haja câmera física
      this.localStream = this._createFallbackStream(callType === 'video');
      return this.localStream;
    }
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
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream);
    });

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
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream);
    });

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
   * Encerra a chamada WebRTC e libera os streams
   */
  hangupCall(groupId, reason = 'user_hangup') {
    if (this.activeGroupId || groupId) {
      socketService.emit('webrtc_call_hangup', {
        groupId: groupId || this.activeGroupId,
        reason,
      });
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.activeGroupId = null;

    if (this.onCallEndedCallback) {
      this.onCallEndedCallback(reason);
    }
  }

  /**
   * Fallback visual caso câmera não esteja disponível no ambiente de teste
   */
  _createFallbackStream(hasVideo) {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0D9488';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Roboto, sans-serif';
      ctx.fillText('Betterdays P2P Stream', 40, 120);
    }
    const stream = canvas.captureStream ? canvas.captureStream(15) : new MediaStream();
    return stream;
  }
}

export const webrtcService = new WebRTCService();
export default webrtcService;
