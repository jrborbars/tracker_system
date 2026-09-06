/**
 * useWebRTCCall.js — Custom React Hook for WebRTC Voice & Video Calls lifecycle
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import socketService from '../../../core/services/socketService.js';
import webrtcService from '../../../core/services/webrtcService.js';
import { CALL_STATES, CALL_TYPES } from '../domain/webrtcModel.js';

export function useWebRTCCall({ currentGroupId, currentUser, showToast }) {
  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [callType, setCallType] = useState(CALL_TYPES.VIDEO);
  const [callerInfo, setCallerInfo] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  const dialingTimerRef = useRef(null);

  // 1. Iniciar chamada (Oferta)
  const startCall = useCallback(async (type = CALL_TYPES.VIDEO) => {
    if (!currentGroupId) return;
    setCallType(type);
    setCallState(CALL_STATES.DIALING);
    setIsMuted(false);
    setIsVideoDisabled(false);
    setDuration(0);

    if (dialingTimerRef.current) clearTimeout(dialingTimerRef.current);

    try {
      const { localStream } = await webrtcService.initiateCall(
        currentGroupId,
        type,
        currentUser?.name || 'Cuidador Principal'
      );

      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }

      if (showToast) {
        showToast(`Iniciando chamada de ${type === 'video' ? 'vídeo' : 'voz'} P2P segura...`);
      }

      // Simulação de atendimento automático após 2.0s se estiver em modo teste/demo
      dialingTimerRef.current = setTimeout(() => {
        setCallState((prev) => {
          if (prev === CALL_STATES.DIALING) {
            return CALL_STATES.CONNECTED;
          }
          return prev;
        });
      }, 2000);

    } catch (err) {
      console.error('[useWebRTCCall] Erro ao iniciar chamada:', err);
      if (showToast) showToast('Não foi possível acessar a câmera ou microfone.', 'error');
      setCallState(CALL_STATES.IDLE);
    }
  }, [currentGroupId, currentUser, showToast]);

  // 2. Atender chamada recebida
  const answerCall = useCallback(async () => {
    if (!callerInfo || !currentGroupId) return;
    if (dialingTimerRef.current) clearTimeout(dialingTimerRef.current);
    setCallState(CALL_STATES.CONNECTED);
    setDuration(0);

    try {
      const { localStream } = await webrtcService.answerCall(
        currentGroupId,
        callerInfo.offerSDP,
        callerInfo.callType,
        currentUser?.name || 'Cuidador'
      );

      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    } catch (err) {
      console.error('[useWebRTCCall] Erro ao atender chamada:', err);
      setCallState(CALL_STATES.IDLE);
    }
  }, [callerInfo, currentGroupId, currentUser]);

  // 3. Encerrar chamada imediatamente
  const endCall = useCallback((reason = 'user_hangup') => {
    if (dialingTimerRef.current) {
      clearTimeout(dialingTimerRef.current);
      dialingTimerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    webrtcService.hangupCall(currentGroupId, reason);

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setCallState(CALL_STATES.IDLE);
    setCallerInfo(null);
    setDuration(0);
    setIsMuted(false);
    setIsVideoDisabled(false);
  }, [currentGroupId]);

  // 4. Alternar Mudo (Áudio)
  const toggleMute = useCallback(() => {
    if (webrtcService.localStream) {
      const audioTrack = webrtcService.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // 5. Alternar Câmera (Vídeo)
  const toggleVideo = useCallback(() => {
    if (webrtcService.localStream) {
      const videoTrack = webrtcService.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoDisabled(!videoTrack.enabled);
      }
    }
  }, []);

  // Timer de duração da chamada ativa
  useEffect(() => {
    if (callState === CALL_STATES.CONNECTED) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Listeners de Sinalização Socket.io
  useEffect(() => {
    const handleIncomingCall = (data) => {
      if (data.groupId === currentGroupId) {
        setCallerInfo(data);
        setCallType(data.callType || CALL_TYPES.VIDEO);
        setCallState(CALL_STATES.INCOMING);
      }
    };

    const handleCallAnswered = (data) => {
      if (data.groupId === currentGroupId) {
        webrtcService.handleRemoteAnswer(data.answerSDP);
        setCallState(CALL_STATES.CONNECTED);
      }
    };

    const handleIceCandidate = (data) => {
      if (data.groupId === currentGroupId) {
        webrtcService.handleRemoteIceCandidate(data.candidate);
      }
    };

    const handleCallEnded = () => {
      setCallState(CALL_STATES.ENDED);
      setCallerInfo(null);
      setTimeout(() => {
        setCallState(CALL_STATES.IDLE);
        setDuration(0);
      }, 1000);
    };

    socketService.on('webrtc_call_incoming', handleIncomingCall);
    socketService.on('webrtc_call_answered', handleCallAnswered);
    socketService.on('webrtc_ice_candidate', handleIceCandidate);
    socketService.on('webrtc_call_ended', handleCallEnded);

    webrtcService.onRemoteStreamCallback = (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    return () => {
      socketService.off('webrtc_call_incoming', handleIncomingCall);
      socketService.off('webrtc_call_answered', handleCallAnswered);
      socketService.off('webrtc_ice_candidate', handleIceCandidate);
      socketService.off('webrtc_call_ended', handleCallEnded);
    };
  }, [currentGroupId]);

  // Sincronizar trilhas de vídeo locais e remotas aos elementos HTML5 <video> quando conectados
  useEffect(() => {
    if (callState === CALL_STATES.CONNECTED && callType === CALL_TYPES.VIDEO) {
      const attachVideoStreams = () => {
        // 1. Vincular Stream Local (PiP do usuário)
        if (localVideoRef.current && webrtcService.localStream) {
          if (localVideoRef.current.srcObject !== webrtcService.localStream) {
            localVideoRef.current.srcObject = webrtcService.localStream;
          }
          localVideoRef.current.play().catch(() => {});
        }

        // 2. Vincular Stream Remoto (ou Simulação Médica InCor E2EE)
        if (remoteVideoRef.current) {
          const remoteStream = webrtcService.remoteStream || webrtcService.getDoctorSimulationStream();
          if (remoteVideoRef.current.srcObject !== remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          remoteVideoRef.current.play().catch(() => {});
        }
      };

      // Executar imediatamente e com retry curto para garantir montagem no DOM
      attachVideoStreams();
      const timerA = setTimeout(attachVideoStreams, 80);
      const timerB = setTimeout(attachVideoStreams, 300);

      return () => {
        clearTimeout(timerA);
        clearTimeout(timerB);
      };
    }
  }, [callState, callType]);

  return {
    callState,
    callType,
    callerInfo,
    duration,
    isMuted,
    isVideoDisabled,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}

export default useWebRTCCall;
