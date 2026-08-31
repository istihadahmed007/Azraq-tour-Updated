import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type declarations for browser compatibility
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
  type: 'onstart' | 'onresult' | 'onerror' | 'onend' | 'restart' | 'tts' | 'recording';
  message: string;
  details?: string;
  isError?: boolean;
}

export interface VoiceAudioPayload {
  transcript: string;
  audioBase64?: string;
  mimeType?: string;
}

export interface UseVoiceSpeechReturn {
  isSupported: boolean;
  isListening: boolean;
  isWebSpeechSupported: boolean;
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
  recordedAudioBase64: string | null;
  recordedMimeType: string;
  startListening: (options?: { lang?: string }) => Promise<boolean>;
  stopListening: () => Promise<VoiceAudioPayload>;
  resetTranscript: () => void;
  setTranscriptManual: (text: string) => void;
  testMicrophone: () => Promise<boolean>;
  clearEventLogs: () => void;
  setSelectedLang: (lang: string) => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
}

export function useVoiceSpeech(): UseVoiceSpeechReturn {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isWebSpeechSupported, setIsWebSpeechSupported] = useState<boolean>(false);
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
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('audio/webm');
  const [error, setError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string>('Ready');
  const [eventLogs, setEventLogs] = useState<SpeechEventLog[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isExplicitlyListeningRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const transcriptRef = useRef<string>('');
  const langRef = useRef<string>('en-US');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync refs
  useEffect(() => {
    langRef.current = selectedLang;
  }, [selectedLang]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const addEventLog = useCallback(
    (type: SpeechEventLog['type'], message: string, details?: string, isError?: boolean) => {
      const time =
        new Date().toLocaleTimeString([], {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) +
        '.' +
        String(new Date().getMilliseconds()).padStart(3, '0');
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
    },
    []
  );

  // Check browser support and permissions on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const hasWebSpeech = Boolean(SpeechRecognitionConstructor);
      const hasMedia = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

      setIsWebSpeechSupported(hasWebSpeech);
      setIsSupported(hasWebSpeech || hasMedia);

      if (!hasWebSpeech && !hasMedia) {
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
          .catch(() => {});
      }
    }
  }, []);

  // Gracefully stop audio hardware and visualizer
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
    setAudioLevel(0);
    setRawDecibels(-100);
  }, []);

  // Connect Web Audio API Analyser for real-time live volume & decibels
  const startAudioVisualizer = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!isExplicitlyListeningRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        // Decibels calculation
        const db = average > 0 ? Math.round(20 * Math.log10(average / 255)) : -100;

        setAudioLevel(normalized);
        setRawDecibels(db);

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      animationFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (e) {
      console.warn('AudioContext visualizer initialization notice:', e);
    }
  }, []);

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
        tracks.forEach((t) => t.stop());
        return true;
      }
      setMicInitState('error');
      return false;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setHasMicPermission(false);
        setMicInitState('denied');
        setError('Microphone access denied. Please click the lock icon in your browser address bar to allow microphone access.');
      } else {
        setMicInitState('error');
        setError('Could not connect to microphone. Please check your mic connection.');
      }
      return false;
    }
  }, []);

  const clearEventLogs = useCallback(() => {
    setEventLogs([]);
    setLastEvent('Cleared');
  }, []);

  // Convert Blob to Base64 string
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Start listening (Dual engine: MediaRecorder + Web Speech API)
  const startListening = useCallback(
    async (options?: { lang?: string }): Promise<boolean> => {
      if (typeof window === 'undefined') return false;
      if (isStartingRef.current || isExplicitlyListeningRef.current) return true;

      isStartingRef.current = true;
      setError(null);
      setInterimTranscript('');
      setRecordedAudioBase64(null);
      audioChunksRef.current = [];

      const targetLang = options?.lang || langRef.current || 'en-US';
      if (options?.lang) {
        langRef.current = options.lang;
        setSelectedLang(options.lang);
      }

      try {
        setMicInitState('requesting');

        // 1. Request microphone stream
        let stream: MediaStream | null = null;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          microphoneStreamRef.current = stream;
          setAudioStreamActive(true);
          setHasMicPermission(true);

          const tracks = stream.getAudioTracks();
          if (tracks.length > 0 && tracks[0].label) {
            setMicDeviceName(tracks[0].label);
          }

          // Start Audio Visualizer
          startAudioVisualizer(stream);

          // 2. Initialize MediaRecorder for multimodal audio fallback
          let mime = 'audio/webm';
          if (typeof MediaRecorder !== 'undefined') {
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
              mime = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
              mime = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
              mime = 'audio/mp4';
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
              mime = 'audio/ogg';
            }

            setRecordedMimeType(mime);
            const recorder = new MediaRecorder(stream, { mimeType: mime });
            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) {
                audioChunksRef.current.push(e.data);
              }
            };
            mediaRecorderRef.current = recorder;
            recorder.start(250);
            addEventLog('recording', 'MediaRecorder audio capture started', `MIME: ${mime}`);
          }
        }

        isExplicitlyListeningRef.current = true;
        setIsListening(true);
        setSpeechEngineState('active');
        setMicInitState('listening');

        // 3. Initialize Web Speech API for live transcription
        const SpeechRecognitionConstructor =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognitionConstructor) {
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
            recognition.lang = targetLang;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
              addEventLog('onstart', 'Speech recognition engine started & listening', `lang: ${recognition.lang}`);
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
                setInterimTranscript(currentInterim);
              }
              setError(null);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
              addEventLog('onerror', `Code: ${event.error}`, event.message, event.error !== 'no-speech');
              if (event.error === 'no-speech' || event.error === 'aborted') {
                return;
              }
              if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                // Keep recording via MediaRecorder! Just inform user that live speech streaming is restricted
                addEventLog('onerror', 'Web Speech API restricted; using direct audio recording mode.');
              }
            };

            recognition.onend = () => {
              // If user is still actively speaking, auto-resume speech recognition
              if (isExplicitlyListeningRef.current && recognitionRef.current) {
                try {
                  recognition.start();
                } catch {}
              }
            };

            recognitionRef.current = recognition;
            recognition.start();
          } catch (speechErr: any) {
            console.warn('SpeechRecognition start notice (falling back to audio recording):', speechErr);
          }
        }

        isStartingRef.current = false;
        return true;
      } catch (err: any) {
        isStartingRef.current = false;
        isExplicitlyListeningRef.current = false;
        setIsListening(false);
        stopAudioHardware();

        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setHasMicPermission(false);
          setMicInitState('denied');
          setError('Microphone access was denied. Please allow microphone permissions in your browser or select a sample query below.');
        } else {
          setMicInitState('error');
          setError('Could not access microphone hardware. You can type your request or tap a sample below.');
        }
        return false;
      }
    },
    [addEventLog, startAudioVisualizer, stopAudioHardware]
  );

  // Stop listening and finalize audio/transcript payload
  const stopListening = useCallback(async (): Promise<VoiceAudioPayload> => {
    isExplicitlyListeningRef.current = false;
    isStartingRef.current = false;
    setIsListening(false);
    setSpeechEngineState('idle');
    setMicInitState('ready');
    setInterimTranscript('');

    // 1. Stop SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // 2. Stop MediaRecorder and extract recorded audio
    let audioBase64: string | undefined = undefined;
    const mime = recordedMimeType || 'audio/webm';

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        await new Promise<void>((resolve) => {
          if (!mediaRecorderRef.current) return resolve();
          mediaRecorderRef.current.onstop = () => resolve();
          mediaRecorderRef.current.stop();
        });

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mime });
          if (audioBlob.size > 200) {
            const base64 = await blobToBase64(audioBlob);
            audioBase64 = base64;
            setRecordedAudioBase64(base64);
            addEventLog('recording', `Audio captured successfully (${Math.round(audioBlob.size / 1024)} KB)`);
          }
        }
      } catch (e) {
        console.warn('Error finalizing recorded audio:', e);
      }
      mediaRecorderRef.current = null;
    }

    stopAudioHardware();

    return {
      transcript: transcriptRef.current,
      audioBase64,
      mimeType: mime,
    };
  }, [addEventLog, recordedMimeType, stopAudioHardware]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = '';
    setRecordedAudioBase64(null);
    audioChunksRef.current = [];
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
        utterance.pitch = 1.02;

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
        console.warn('Speech synthesis notice:', err);
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
    isWebSpeechSupported,
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
    recordedAudioBase64,
    recordedMimeType,
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
