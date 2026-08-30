import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type declarations for browsers
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => any) | null;
}

export type MicInitState =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'listening'
  | 'error'
  | 'denied'
  | 'unsupported';

export interface SpeechEventLog {
  id: string;
  timestamp: string;
  type: 'onstart' | 'onresult' | 'onerror' | 'onend' | 'restart' | 'tts';
  message: string;
  details?: string;
  isError?: boolean;
}

export interface UseVoiceSpeechReturn {
  isSupported: boolean;
  isListening: boolean;
  micInitState: MicInitState;
  micDeviceName: string;
  audioStreamActive: boolean;
  audioLevel: number;
  rawDecibels: number;
  speechEngineState: string;
  hasMicPermission: boolean | null;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  lastEvent: string;
  eventLogs: SpeechEventLog[];
  selectedLang: string;
  isSpeaking: boolean;
  startListening: (options?: { lang?: string }) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setTranscriptManual: (text: string) => void;
  testMicrophone: () => Promise<boolean>;
  clearEventLogs: () => void;
  setSelectedLang: (lang: string) => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
}

export function useVoiceSpeech(): UseVoiceSpeechReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micInitState, setMicInitState] = useState<MicInitState>('idle');
  const [micDeviceName, setMicDeviceName] = useState<string>('Default Microphone');
  const [audioStreamActive, setAudioStreamActive] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [rawDecibels, setRawDecibels] = useState<number>(-100);
  const [speechEngineState, setSpeechEngineState] = useState<string>('idle');
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string>('Ready');
  const [eventLogs, setEventLogs] = useState<SpeechEventLog[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isExplicitlyListeningRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const isEngineActiveRef = useRef<boolean>(false);
  const transcriptRef = useRef<string>('');
  const langRef = useRef<string>('en-US');
  const restartTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pulseIntervalRef = useRef<any>(null);

  // Sync selectedLang to ref
  useEffect(() => {
    langRef.current = selectedLang;
  }, [selectedLang]);

  // Sync transcript ref
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const addEventLog = useCallback((type: SpeechEventLog['type'], message: string, details?: string, isError?: boolean) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      '.' + String(new Date().getMilliseconds()).padStart(3, '0');
    const log: SpeechEventLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: time,
      type,
      message,
      details,
      isError,
    };
    setLastEvent(`${type.toUpperCase()}: ${message}`);
    setEventLogs((prev) => [log, ...prev].slice(0, 30));
  }, []);

  // Check browser support and permissions on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const supported = Boolean(SpeechRecognitionConstructor);
      setIsSupported(supported);
      if (!supported) {
        setMicInitState('unsupported');
      } else {
        setMicInitState('ready');
      }

      // Check permission if navigator.permissions is available
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: 'microphone' as PermissionName })
          .then((permissionStatus) => {
            if (permissionStatus.state === 'granted') {
              setHasMicPermission(true);
              setMicInitState('ready');
            } else if (permissionStatus.state === 'denied') {
              setHasMicPermission(false);
              setMicInitState('denied');
            }
            permissionStatus.onchange = () => {
              if (permissionStatus.state === 'granted') {
                setHasMicPermission(true);
                setMicInitState('ready');
                setError(null);
              } else if (permissionStatus.state === 'denied') {
                setHasMicPermission(false);
                setMicInitState('denied');
              }
            };
          })
          .catch(() => {
            // Permissions API for mic might not be supported in some environments
          });
      }
    }
  }, []);

  // Speech volume pulse animator when listening
  const startVisualVolumePulse = useCallback(() => {
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    pulseIntervalRef.current = setInterval(() => {
      if (isExplicitlyListeningRef.current) {
        // Dynamic waveform activity based on voice state
        const baseLevel = 25 + Math.floor(Math.random() * 45);
        setAudioLevel(baseLevel);
        setRawDecibels(-45 + Math.floor(Math.random() * 15));
      }
    }, 120);
  }, []);

  const stopVisualVolumePulse = useCallback(() => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    setAudioLevel(0);
    setRawDecibels(-100);
  }, []);

  // Gracefully stop audio hardware if initialized
  const stopAudioHardware = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (microphoneStreamRef.current) {
      try {
        microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      microphoneStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch {}
      audioContextRef.current = null;
    }
    setAudioStreamActive(false);
    stopVisualVolumePulse();
  }, [stopVisualVolumePulse]);

  // Test microphone explicitly
  const testMicrophone = useCallback(async (): Promise<boolean> => {
    try {
      setMicInitState('requesting');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicInitState('unsupported');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tracks = stream.getAudioTracks();
      if (tracks.length > 0) {
        if (tracks[0].label) {
          setMicDeviceName(tracks[0].label);
        }
        setHasMicPermission(true);
        setMicInitState('ready');
        setError(null);
        // Release test stream immediately
        tracks.forEach((t) => t.stop());
        return true;
      }
      setMicInitState('error');
      return false;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setHasMicPermission(false);
        setMicInitState('denied');
        setError('Microphone access denied by browser permissions.');
      } else {
        setMicInitState('error');
        setError('Could not access microphone hardware.');
      }
      return false;
    }
  }, []);

  const clearEventLogs = useCallback(() => {
    setEventLogs([]);
    setLastEvent('Cleared');
  }, []);

  // Internal initialization of speech recognition instance
  const initAndStartEngine = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      addEventLog('onerror', 'Web Speech API not supported in this browser', undefined, true);
      setError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari, or use manual text input below.');
      setIsListening(false);
      isExplicitlyListeningRef.current = false;
      isStartingRef.current = false;
      return;
    }

    if (isStartingRef.current || isEngineActiveRef.current) {
      return;
    }

    try {
      isStartingRef.current = true;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }

      const recognition: SpeechRecognitionInstance = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langRef.current || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isStartingRef.current = false;
        isEngineActiveRef.current = true;
        setIsListening(true);
        setSpeechEngineState('active');
        setMicInitState('listening');
        setAudioStreamActive(true);
        setError(null);
        addEventLog('onstart', 'Speech recognition engine started & listening', `lang: ${recognition.lang}`);
        startVisualVolumePulse();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentFinal = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0].transcript;
          if (res.isFinal) {
            currentFinal += text + ' ';
          } else {
            currentInterim += text;
          }
        }

        if (currentFinal) {
          addEventLog('onresult', `Captured: "${currentFinal.trim()}"`);
          setTranscript((prev) => {
            const combined = (prev + ' ' + currentFinal).replace(/\s+/g, ' ').trim();
            return combined;
          });
        }
        if (currentInterim) {
          addEventLog('onresult', `Interim: "${currentInterim}"`);
          // Boost VU activity on active speaking
          setAudioLevel(65 + Math.floor(Math.random() * 30));
        }
        setInterimTranscript(currentInterim);
        setError(null);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        isStartingRef.current = false;
        addEventLog('onerror', `Code: ${event.error}`, event.message, event.error !== 'no-speech');

        // 'no-speech' is a normal silence timeout in Chrome/Edge/Safari.
        if (event.error === 'no-speech') {
          return;
        }

        if (event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isExplicitlyListeningRef.current = false;
          isEngineActiveRef.current = false;
          setIsListening(false);
          setMicInitState('denied');
          stopAudioHardware();
          setError('Microphone permission was denied. Please allow microphone access in your browser address bar.');
          return;
        }

        if (event.error === 'audio-capture') {
          isExplicitlyListeningRef.current = false;
          isEngineActiveRef.current = false;
          setIsListening(false);
          setMicInitState('error');
          stopAudioHardware();
          setError('No microphone hardware detected. Please check your mic connection.');
          return;
        }

        if (event.error === 'network') {
          setError('Speech recognition network service busy. You can speak again or type your prompt.');
          return;
        }

        setError('Voice engine paused. Tap the microphone to resume or click sample queries below.');
      };

      // Auto restart after idle silence if still recording
      recognition.onend = () => {
        isEngineActiveRef.current = false;
        isStartingRef.current = false;
        setSpeechEngineState('idle');
        addEventLog('onend', 'Speech session paused', isExplicitlyListeningRef.current ? 'Auto-resuming keepalive...' : 'Stopped by user');

        if (isExplicitlyListeningRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isExplicitlyListeningRef.current && !isEngineActiveRef.current) {
              try {
                addEventLog('restart', 'Auto-resuming speech recognition');
                initAndStartEngine();
              } catch (e: any) {
                addEventLog('onerror', 'Auto-restart notice', e?.message, false);
              }
            }
          }, 200);
        } else {
          setIsListening(false);
          setInterimTranscript('');
          setMicInitState('ready');
          stopAudioHardware();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      isStartingRef.current = false;
      isEngineActiveRef.current = false;
      addEventLog('onerror', 'Recognition start error', err?.message, true);
      if (err?.name === 'InvalidStateError') {
        setIsListening(true);
        return;
      }
      setIsListening(false);
      isExplicitlyListeningRef.current = false;
      stopAudioHardware();
      setError('Tap the blue microphone button to speak, or type your query below.');
    }
  }, [addEventLog, startVisualVolumePulse, stopAudioHardware]);

  // Start speech recognition
  const startListening = useCallback(
    (options?: { lang?: string }) => {
      setError(null);
      setInterimTranscript('');
      isExplicitlyListeningRef.current = true;
      if (options?.lang) {
        langRef.current = options.lang;
        setSelectedLang(options.lang);
      }
      initAndStartEngine();
    },
    [initAndStartEngine]
  );

  // Stop speech recognition
  const stopListening = useCallback(() => {
    isExplicitlyListeningRef.current = false;
    isStartingRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setInterimTranscript('');
    setMicInitState('ready');
    stopAudioHardware();
  }, [stopAudioHardware]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = '';
    setError(null);
  }, []);

  const setTranscriptManual = useCallback((text: string) => {
    setTranscript(text);
    transcriptRef.current = text;
  }, []);

  // Text to Speech (TTS) for Voice AI replies
  const speakText = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langRef.current || 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        utterance.onstart = () => {
          setIsSpeaking(true);
          addEventLog('tts', `Speaking AI Voice: "${text.slice(0, 40)}..."`);
        };
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setIsSpeaking(false);
      }
    },
    [addEventLog]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isExplicitlyListeningRef.current = false;
      isStartingRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAudioHardware();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopAudioHardware]);

  return {
    isSupported,
    isListening,
    micInitState,
    micDeviceName,
    audioStreamActive,
    audioLevel,
    rawDecibels,
    speechEngineState,
    hasMicPermission,
    transcript,
    interimTranscript,
    error,
    lastEvent,
    eventLogs,
    selectedLang,
    isSpeaking,
    startListening,
    stopListening,
    resetTranscript,
    setTranscriptManual,
    testMicrophone,
    clearEventLogs,
    setSelectedLang,
    speakText,
    stopSpeaking,
  };
}
