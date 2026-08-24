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
  type: 'onstart' | 'onresult' | 'onerror' | 'onend' | 'restart';
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
  startListening: (options?: { lang?: string }) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setTranscriptManual: (text: string) => void;
  testMicrophone: () => Promise<boolean>;
  clearEventLogs: () => void;
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
  const [lastEvent, setLastEvent] = useState<string>('Initialized');
  const [eventLogs, setEventLogs] = useState<SpeechEventLog[]>([]);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isExplicitlyListeningRef = useRef<boolean>(false);
  const transcriptRef = useRef<string>('');
  const langRef = useRef<string>('en-US');
  const restartTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync transcript ref
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Check browser support and permissions on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const supported = Boolean(SpeechRecognitionConstructor);
      setIsSupported(supported);
      if (!supported) {
        setMicInitState('unsupported');
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
            } else {
              setHasMicPermission(null);
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
            // Permissions API for mic might not be supported in some browsers
          });
      }
    }
  }, []);

  // Audio level analyzer with device detection and decibel calculation
  const startAudioAnalyzer = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setAudioStreamActive(false);
        return;
      }

      setMicInitState('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      microphoneStreamRef.current = stream;
      setHasMicPermission(true);
      setAudioStreamActive(true);

      // Extract device label
      const tracks = stream.getAudioTracks();
      if (tracks && tracks.length > 0 && tracks[0].label) {
        setMicDeviceName(tracks[0].label);
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setMicInitState('listening');
        return;
      }

      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current || !isExplicitlyListeningRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
          if (dataArray[i] > peak) peak = dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        
        // Approximate dB relative to full scale
        const dB = peak > 0 ? Math.round(20 * Math.log10(peak / 255)) : -100;
        
        setAudioLevel(normalized);
        setRawDecibels(dB);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      setMicInitState('listening');
      updateLevel();
    } catch (err: any) {
      console.warn('Audio analyzer initialization issue:', err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setHasMicPermission(false);
        setMicInitState('denied');
        setError('Microphone permission was denied. Please allow microphone access in your browser.');
      } else {
        setMicInitState('error');
      }
      setAudioStreamActive(false);
    }
  };

  const stopAudioAnalyzer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioStreamActive(false);
    setAudioLevel(0);
    setRawDecibels(-100);
    if (micInitState === 'listening' || micInitState === 'requesting') {
      setMicInitState('ready');
    }
  };

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
        // Release test stream
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

  const clearEventLogs = useCallback(() => {
    setEventLogs([]);
    setLastEvent('Cleared');
  }, []);

  // Internal initialization of speech instance
  const initAndStartEngine = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      addEventLog('onerror', 'Web Speech API not supported in this browser', undefined, true);
      setError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setIsListening(false);
      isExplicitlyListeningRef.current = false;
      return;
    }

    try {
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
        setIsListening(true);
        setSpeechEngineState('active');
        setError(null);
        addEventLog('onstart', 'Speech recognition engine started & listening', `lang: ${recognition.lang}`);
        startAudioAnalyzer().catch(() => {});
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
          addEventLog('onresult', `Final text: "${currentFinal.trim()}"`, `Confidence: ${Math.round((event.results[0]?.[0]?.confidence || 0.9) * 100)}%`);
          setTranscript((prev) => {
            const combined = (prev + ' ' + currentFinal).replace(/\s+/g, ' ').trim();
            return combined;
          });
        }
        if (currentInterim) {
          addEventLog('onresult', `Interim: "${currentInterim}"`);
        }
        setInterimTranscript(currentInterim);
        setError(null);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        addEventLog('onerror', `Code: ${event.error}`, event.message, event.error !== 'no-speech');

        // 'no-speech' is a normal silence timeout in Chrome/Edge/Safari.
        if (event.error === 'no-speech') {
          return;
        }

        if (event.error === 'aborted') {
          return;
        }

        console.warn('Speech Recognition notice:', event.error, event.message);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isExplicitlyListeningRef.current = false;
          setIsListening(false);
          setMicInitState('denied');
          stopAudioAnalyzer();
          setError('Microphone permission was denied. Please allow microphone access in your browser address bar.');
          return;
        }

        if (event.error === 'audio-capture') {
          isExplicitlyListeningRef.current = false;
          setIsListening(false);
          setMicInitState('error');
          stopAudioAnalyzer();
          setError('No microphone hardware detected. Please check your mic connection.');
          return;
        }

        if (event.error === 'network') {
          setError('Speech network service momentarily busy. You can speak again or type your prompt.');
          return;
        }

        setError('Voice engine paused. Tap the microphone to resume or click sample queries below.');
      };

      // Auto restart after idle silence if still recording
      recognition.onend = () => {
        setSpeechEngineState('idle');
        addEventLog('onend', 'Speech engine session ended', isExplicitlyListeningRef.current ? 'Auto-restarting keepalive...' : 'Stopped by user');
        if (isExplicitlyListeningRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isExplicitlyListeningRef.current) {
              try {
                addEventLog('restart', 'Restarting speech recognizer instance');
                initAndStartEngine();
              } catch (e: any) {
                addEventLog('onerror', 'Auto-restart failure', e?.message, true);
              }
            }
          }, 100);
        } else {
          setIsListening(false);
          setInterimTranscript('');
          stopAudioAnalyzer();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      addEventLog('onerror', 'Recognition start exception', err?.message, true);
      if (err?.name === 'InvalidStateError') {
        setIsListening(true);
        return;
      }
      setIsListening(false);
      isExplicitlyListeningRef.current = false;
      stopAudioAnalyzer();
      setError('Tap the blue microphone button to speak, or type / click suggestions below.');
    }
  }, [addEventLog]);

  // Start speech recognition
  const startListening = useCallback(
    (options?: { lang?: string }) => {
      setError(null);
      setInterimTranscript('');
      isExplicitlyListeningRef.current = true;
      if (options?.lang) {
        langRef.current = options.lang;
      }
      initAndStartEngine();
    },
    [initAndStartEngine]
  );

  // Stop speech recognition
  const stopListening = useCallback(() => {
    isExplicitlyListeningRef.current = false;
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
    stopAudioAnalyzer();
  }, []);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isExplicitlyListeningRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAudioAnalyzer();
    };
  }, []);

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
    startListening,
    stopListening,
    resetTranscript,
    setTranscriptManual,
    testMicrophone,
    clearEventLogs,
  };
}
