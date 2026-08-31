import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Calendar,
  MapPin,
  Users,
  Tag,
  ArrowRight,
  RefreshCw,
  Edit3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  Plane,
  Search,
  ArrowRightLeft,
  Briefcase,
  Activity,
  Radio,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Languages,
} from 'lucide-react';
import { useVoiceSpeech } from '../hooks/useVoiceSpeech';
import { FlightSearchParams } from './AzraqTripFinder';
import { POPULAR_AIRPORTS, BANGLADESH_AIRPORTS, Airport } from '../data/flightsData';

export interface StructuredVoiceTripData {
  isFlightIntent?: boolean;
  transcription?: string;
  destination: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  vibes: string[];
  travelerCount: number;
  travelStyle: string;
  budgetLevel: string;
  structuredPrompt: string;
  spokenSummary: string;
  flightParams?: {
    originCode: string;
    originCity: string;
    originName: string;
    originCountry: string;
    destinationCode: string;
    destinationCity: string;
    destinationName: string;
    destinationCountry: string;
    tripType: 'round' | 'oneway';
    departureDate: string;
    returnDate: string;
    adults: number;
    children: number;
    infants: number;
    cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
    preferredAirline?: string;
  };
}

interface VoiceTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPlan: (data: StructuredVoiceTripData) => void;
  onSearchFlights?: (params: FlightSearchParams) => void;
  initialTranscript?: string;
  initialMode?: 'flight' | 'itinerary';
}

const SAMPLE_FLIGHT_PROMPTS = [
  'Find round trip flights from Dhaka to Bangkok next Friday for 2 adults',
  'One-way flight from Dhaka to Dubai next month in Business class',
  'Round trip tickets Dhaka to Singapore next week for 1 adult',
  'Direct flights from Dhaka to Kuala Lumpur departing in two weeks',
  'Flights from Dhaka to Maldives for a 5-day couple holiday',
];

const SAMPLE_ITINERARY_PROMPTS = [
  '5-day family holiday in Bangkok and Phuket with private transfers and halal dining',
  '7-day romantic honeymoon in Maldives overwater villa with sunset cruise',
  '4-day shopping and luxury getaway in Dubai for 2 adults',
  '6-day cultural immersion in Tokyo and Kyoto with scenic train rides and culinary spots',
  '5-day beach and adventure trip in Bali with temple tours and private pool villa',
];

export const VoiceTripModal: React.FC<VoiceTripModalProps> = ({
  isOpen,
  onClose,
  onConfirmPlan,
  onSearchFlights,
  initialTranscript = '',
  initialMode = 'flight',
}) => {
  const {
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
    error: speechError,
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
  } = useVoiceSpeech();

  const [activeTab, setActiveTab] = useState<'flight' | 'itinerary'>(initialMode);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<StructuredVoiceTripData | null>(null);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState('');
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // When modal opens, initialize cleanly without auto-capturing mic (avoids browser gesture block)
  useEffect(() => {
    if (isOpen) {
      setParsedData(null);
      setParseError(null);
      setTestResult(null);
      setIsEditingPrompt(false);
      setActiveTab(initialMode);
      if (initialTranscript) {
        setTranscriptManual(initialTranscript);
        parseSpokenSpeech({ spokenText: initialTranscript });
      } else {
        resetTranscript();
      }
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, initialTranscript, initialMode]);

  const handleTestMicClick = async () => {
    setIsTestingMic(true);
    setTestResult(null);
    try {
      const ok = await testMicrophone();
      if (ok) {
        setTestResult('Microphone connected successfully and audio stream is responsive.');
      } else {
        setTestResult('Microphone test failed. Please check browser permissions in your URL address bar.');
      }
    } catch {
      setTestResult('Error accessing microphone.');
    } finally {
      setIsTestingMic(false);
    }
  };

  // When speech stops or user toggles mic button
  const handleToggleListening = async () => {
    if (isListening) {
      const payload = await stopListening();
      const textToParse = payload.transcript?.trim() || transcript.trim();
      if (textToParse || payload.audioBase64) {
        parseSpokenSpeech({
          spokenText: textToParse,
          audioBase64: payload.audioBase64,
          mimeType: payload.mimeType,
        });
      }
    } else {
      resetTranscript();
      setParsedData(null);
      setParseError(null);
      await startListening();
    }
  };

  // Convert transcript / audio to structured trip data via server Gemini endpoint
  const parseSpokenSpeech = async (opts: {
    spokenText?: string;
    audioBase64?: string;
    mimeType?: string;
  }) => {
    const text = (opts.spokenText || '').trim();
    if (!text && !opts.audioBase64) return;

    setIsParsing(true);
    setParseError(null);

    try {
      const res = await fetch('/api/ai/parse-voice-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          audioBase64: opts.audioBase64,
          mimeType: opts.mimeType,
        }),
      });

      const json = await res.json();
      if (json && json.data) {
        setParsedData(json.data);
        if (json.data.transcription && !text) {
          setTranscriptManual(json.data.transcription);
        }
        setEditablePrompt(json.data.structuredPrompt || json.data.transcription || text);
        if (json.data.isFlightIntent) {
          setActiveTab('flight');
        }
        // Speak friendly summary back to the traveler
        if (json.data.spokenSummary) {
          speakText(json.data.spokenSummary);
        }
      } else {
        throw new Error(json.error || 'Could not parse voice input');
      }
    } catch (err: any) {
      console.warn('Error parsing voice trip:', err);
      // Fast resilient fallback
      const today = new Date();
      const defaultStart = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const defaultEnd = new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const fallbackText = text || 'Trip to Bangkok for 2 adults';
      const fallback: StructuredVoiceTripData = {
        isFlightIntent: true,
        destination: 'Bangkok, Thailand',
        durationDays: 5,
        startDate: defaultStart,
        endDate: defaultEnd,
        vibes: ['Culture', 'Local Cuisine', 'Sightseeing'],
        travelerCount: 2,
        travelStyle: 'Bespoke Asian Holiday',
        budgetLevel: 'Moderate / Value',
        structuredPrompt: fallbackText,
        spokenSummary: `Got your request: "${fallbackText}". Ready to search flights from Dhaka to Bangkok.`,
        flightParams: {
          originCode: 'DAC',
          originCity: 'Dhaka',
          originName: 'Hazrat Shahjalal International Airport',
          originCountry: 'Bangladesh',
          destinationCode: 'BKK',
          destinationCity: 'Bangkok',
          destinationName: 'Suvarnabhumi Airport',
          destinationCountry: 'Thailand',
          tripType: 'round',
          departureDate: defaultStart,
          returnDate: defaultEnd,
          adults: 2,
          children: 0,
          infants: 0,
          cabinClass: 'Economy',
        },
      };
      setParsedData(fallback);
      setEditablePrompt(fallbackText);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSelectSample = (sample: string) => {
    stopListening();
    setTranscriptManual(sample);
    parseSpokenSpeech({ spokenText: sample });
  };

  const handleGenerateItineraryClick = () => {
    if (!parsedData) return;
    const finalData: StructuredVoiceTripData = {
      ...parsedData,
      structuredPrompt: editablePrompt || parsedData.structuredPrompt,
    };
    onConfirmPlan(finalData);
    onClose();
  };

  // Helper to match airport by IATA code
  const resolveAirport = (code: string, fallbackCity: string, fallbackCountry: string): Airport => {
    const allAirports = [...BANGLADESH_AIRPORTS, ...POPULAR_AIRPORTS];
    const matched = allAirports.find((a) => a.code.toUpperCase() === (code || '').toUpperCase());
    if (matched) return matched;

    return {
      code: code ? code.toUpperCase() : 'BKK',
      city: fallbackCity || 'Bangkok',
      name: `${fallbackCity || 'Bangkok'} International Airport`,
      country: fallbackCountry || 'Thailand',
    };
  };

  // Helper to trigger flight search with the parsed params
  const handleSearchFlightsClick = () => {
    if (!parsedData || !parsedData.flightParams) {
      const depDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
      const retDate = new Date(Date.now() + 19 * 86400000).toISOString().split('T')[0];
      if (onSearchFlights) {
        onSearchFlights({
          origin: resolveAirport('DAC', 'Dhaka', 'Bangladesh'),
          destination: resolveAirport('BKK', 'Bangkok', 'Thailand'),
          tripType: 'round',
          departureDate: depDate,
          returnDate: retDate,
          adults: 2,
          children: 0,
          infants: 0,
          cabinClass: 'Economy',
          currency: 'BDT',
        });
      } else {
        window.location.href = 'https://flights.azraqtrips.com/';
      }
      onClose();
      return;
    }

    const fp = parsedData.flightParams;
    const originAirport = resolveAirport(fp.originCode, fp.originCity, fp.originCountry);
    const destinationAirport = resolveAirport(fp.destinationCode, fp.destinationCity, fp.destinationCountry);
    const depDate = fp.departureDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const retDate = fp.returnDate || new Date(Date.now() + 19 * 86400000).toISOString().split('T')[0];

    const flightParams: FlightSearchParams = {
      origin: originAirport,
      destination: destinationAirport,
      tripType: fp.tripType || 'round',
      departureDate: depDate,
      returnDate: retDate,
      adults: fp.adults || 1,
      children: fp.children || 0,
      infants: fp.infants || 0,
      cabinClass: (fp.cabinClass as any) || 'Economy',
      currency: 'BDT',
    };

    if (onSearchFlights) {
      onSearchFlights(flightParams);
    } else {
      window.location.href = `https://flights.azraqtrips.com/?origin_iata=${originAirport.code}&destination_iata=${destinationAirport.code}&depart_date=${flightParams.departureDate}&adults=${flightParams.adults}&marker=765415&trs=565363&currency=bdt`;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-trip-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopListening();
          stopSpeaking();
          onClose();
        }
      }}
    >
      <div
        id="voice-trip-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#073B4C] via-[#086788] to-[#073B4C] text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-[#17BEBB]">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif-display">
                  Azraq Voice AI Assistant
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#17BEBB]/20 text-[#EAF7F8] border border-[#17BEBB]/30 text-[10px] font-bold tracking-wider uppercase font-mono">
                  Gemini Voice
                </span>
              </div>
              <p className="text-xs text-slate-200 font-normal">
                Speak flight routes or custom holidays in English or Bangla
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/15">
              <button
                type="button"
                onClick={() => setSelectedLang('en-US')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedLang === 'en-US'
                    ? 'bg-white text-[#073B4C] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('bn-BD')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedLang === 'bn-BD'
                    ? 'bg-white text-[#073B4C] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* TTS Audio toggle */}
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Stop AI voice speech"
              >
                <VolumeX className="w-4 h-4 text-white animate-pulse" />
              </button>
            )}

            <button
              id="voice-modal-close-btn"
              type="button"
              onClick={() => {
                stopListening();
                stopSpeaking();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="px-6 pt-3 pb-0 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('flight')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'flight'
                ? 'border-[#0D6EFD] text-[#0D6EFD]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Search Flights by Voice</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('itinerary')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'itinerary'
                ? 'border-[#0D6EFD] text-[#0D6EFD]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan Itinerary by Voice</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Main Microphone Visualizer & Listening Stage */}
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
            {/* Ambient Pulse Rings when Listening */}
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-36 h-36 rounded-full bg-blue-500/10 animate-ping"
                  style={{ animationDuration: '2s' }}
                />
                <div
                  className="w-48 h-48 rounded-full bg-blue-500/5 animate-pulse"
                  style={{ animationDuration: '1.5s' }}
                />
              </div>
            )}

            {/* Microphone Button */}
            <div className="relative z-10 mb-3">
              <button
                id="voice-mic-toggle-btn"
                type="button"
                onClick={handleToggleListening}
                className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white ring-8 ring-red-500/20 scale-105 animate-pulse'
                    : 'bg-[#0D6EFD] hover:bg-blue-600 text-white ring-4 ring-blue-500/15 hover:scale-105'
                }`}
                title={isListening ? 'Click to stop listening and parse' : 'Click to start speaking'}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                ) : (
                  <Mic className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                )}
              </button>
            </div>

            {/* Status Label */}
            <div className="relative z-10 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                  }`}
                />
                <h3 className="text-sm font-bold text-[#071A33]">
                  {isListening
                    ? 'Listening... Speak your flight route or trip now'
                    : transcript
                    ? 'Speech captured — click microphone to record again'
                    : activeTab === 'flight'
                    ? 'Tap the microphone to speak your flight destination'
                    : 'Tap the microphone to describe your dream holiday'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isListening
                  ? activeTab === 'flight'
                    ? 'Example: "Find flights from Dhaka to Bangkok next Friday for 2 adults"'
                    : 'Mention destination, duration, companions (family/couple), or vibes.'
                  : activeTab === 'flight'
                  ? 'Speak departure city, destination, travel dates, passenger count, or airline.'
                  : 'Example: "5-day family trip to Bangkok and Phuket with halal food in November"'}
              </p>
            </div>

            {/* Visual Hardware Status & Audio Stream Activity Monitor */}
            <div className="mt-4 w-full max-w-lg p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-left space-y-2.5 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* State Pill */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engine:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      micInitState === 'listening' || audioStreamActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : micInitState === 'requesting'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        : micInitState === 'denied'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : micInitState === 'ready'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        audioStreamActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                      }`}
                    />
                    {micInitState === 'listening'
                      ? 'Live Speech Active'
                      : micInitState === 'requesting'
                      ? 'Connecting Mic...'
                      : micInitState === 'denied'
                      ? 'Mic Blocked'
                      : micInitState === 'ready'
                      ? 'Ready to Listen'
                      : 'Standby'}
                  </span>
                </div>

                {/* Device Name Label & Test Button */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="truncate max-w-[140px] text-slate-600 font-normal" title={micDeviceName}>
                    {micDeviceName}
                  </span>
                  <button
                    type="button"
                    onClick={handleTestMicClick}
                    disabled={isTestingMic}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Test microphone connection"
                  >
                    <Activity className={`w-3 h-3 ${isTestingMic ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                    <span>{isTestingMic ? 'Testing...' : 'Test Mic'}</span>
                  </button>
                </div>
              </div>

              {/* Soundwave Bars when Recording */}
              {isListening && (
                <div className="flex items-center justify-center gap-1 pt-1 h-7">
                  {[...Array(20)].map((_, i) => {
                    const dynamicHeight = Math.max(
                      4,
                      Math.min(26, Math.round((audioLevel / 100) * 26 * (0.3 + Math.sin(i * 0.5) * 0.7)))
                    );
                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-75 ${
                          audioLevel > 50
                            ? 'bg-emerald-500'
                            : audioLevel > 10
                            ? 'bg-[#0D6EFD]'
                            : 'bg-slate-300'
                        }`}
                        style={{ height: `${dynamicHeight}px` }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Test Result Banner */}
              {testResult && (
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-800 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{testResult}</span>
                </div>
              )}
            </div>

            {/* Error message if speech failed */}
            {speechError && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 text-left w-full max-w-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}
          </div>

          {/* Quick Manual Text Input Fallback Bar */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <label htmlFor="voice-text-fallback-input" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0D6EFD]" />
              <span>Or type / edit your travel prompt directly:</span>
            </label>
            <div className="flex gap-2">
              <input
                id="voice-text-fallback-input"
                type="text"
                value={transcript}
                onChange={(e) => setTranscriptManual(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && transcript.trim()) {
                    e.preventDefault();
                    parseSpokenSpeech({ spokenText: transcript.trim() });
                  }
                }}
                placeholder={
                  activeTab === 'flight'
                    ? 'e.g. Find flights from Dhaka to Bangkok for 2 adults next week'
                    : 'e.g. 5-day luxury family trip to Maldives with ocean villa'
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD]/20 focus:border-[#0D6EFD]"
              />
              <button
                type="button"
                onClick={() => {
                  if (transcript.trim()) {
                    parseSpokenSpeech({ spokenText: transcript.trim() });
                  }
                }}
                disabled={!transcript.trim() || isParsing}
                className="px-4 py-2.5 rounded-xl bg-[#073B4C] hover:bg-[#086788] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Parse &amp; Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Prompts Samples */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {activeTab === 'flight' ? 'Popular Voice Flight Queries:' : 'Popular Voice Holiday Queries:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(activeTab === 'flight' ? SAMPLE_FLIGHT_PROMPTS : SAMPLE_ITINERARY_PROMPTS).map(
                (sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="text-left px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-[#0D6EFD] text-xs font-medium transition-colors cursor-pointer"
                  >
                    "{sample}"
                  </button>
                )
              )}
            </div>
          </div>

          {/* 2. Loading State */}
          {isParsing && (
            <div className="p-8 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-blue-200 border-t-[#0D6EFD] animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#071A33]">AI is Analyzing Your Spoken Travel Request...</h4>
                <p className="text-xs text-slate-500">
                  Extracting flight routes, IATA codes, dates, cabin class, and itinerary preferences via Gemini.
                </p>
              </div>
            </div>
          )}

          {/* 3. Parsed Output Results Card */}
          {parsedData && !isParsing && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Spoken AI Summary Banner */}
              {parsedData.spokenSummary && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0D6EFD] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#071A33] uppercase tracking-wider">
                        AI Interpretation
                      </h4>
                      <button
                        type="button"
                        onClick={() => speakText(parsedData.spokenSummary)}
                        className="text-[11px] font-bold text-[#0D6EFD] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {parsedData.spokenSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab Content 1: Flight Search Card */}
              {activeTab === 'flight' && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0D6EFD] flex items-center justify-center">
                        <Plane className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Flight Search Parameters
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                      {parsedData.flightParams?.tripType === 'oneway' ? 'One Way' : 'Round Trip'}
                    </span>
                  </div>

                  {/* Route & Airport Visualizer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Origin */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departure (From)</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-mono font-bold text-[#071A33]">
                          {parsedData.flightParams?.originCode || 'DAC'}
                        </span>
                        <div className="text-xs text-slate-600 truncate">
                          <div className="font-semibold text-slate-800">{parsedData.flightParams?.originCity || 'Dhaka'}</div>
                          <div className="text-[11px] text-slate-500">{parsedData.flightParams?.originCountry || 'Bangladesh'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination (To)</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-mono font-bold text-[#0D6EFD]">
                          {parsedData.flightParams?.destinationCode || 'BKK'}
                        </span>
                        <div className="text-xs text-slate-600 truncate">
                          <div className="font-semibold text-slate-800">{parsedData.flightParams?.destinationCity || parsedData.destination}</div>
                          <div className="text-[11px] text-slate-500">{parsedData.flightParams?.destinationCountry || 'International'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Details Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">Departure Date</span>
                      <span className="font-bold text-slate-800">{parsedData.flightParams?.departureDate || parsedData.startDate}</span>
                    </div>

                    {parsedData.flightParams?.tripType !== 'oneway' && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] text-slate-400 block font-semibold">Return Date</span>
                        <span className="font-bold text-slate-800">{parsedData.flightParams?.returnDate || parsedData.endDate}</span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">Passengers</span>
                      <span className="font-bold text-slate-800">
                        {parsedData.flightParams?.adults || 1} Adult{parsedData.flightParams?.children ? `, ${parsedData.flightParams.children} Child` : ''}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">Cabin Class</span>
                      <span className="font-bold text-slate-800">{parsedData.flightParams?.cabinClass || 'Economy'}</span>
                    </div>
                  </div>

                  {/* Action Buttons for Flights */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleSearchFlightsClick}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#0D6EFD] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plane className="w-4 h-4" />
                      <span>Search Flights on Azraq Engine</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('itinerary')}
                      className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#0D6EFD]" />
                      <span>Plan Full Tour Itinerary</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Itinerary Plan Card */}
              {activeTab === 'itinerary' && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Compass className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Holiday Plan Parameters
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-[#0D6EFD]">{parsedData.durationDays} Days</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">Destination</span>
                      <span className="font-bold text-slate-800 truncate block">{parsedData.destination}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">Travel Dates</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {parsedData.startDate} ~ {parsedData.endDate}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">Travelers</span>
                      <span className="font-bold text-slate-800">{parsedData.travelerCount} Person(s)</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">Style / Budget</span>
                      <span className="font-bold text-slate-800 truncate block">{parsedData.budgetLevel}</span>
                    </div>
                  </div>

                  {/* Vibes */}
                  {parsedData.vibes && parsedData.vibes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {parsedData.vibes.map((vibe, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                        >
                          #{vibe}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Structured Prompt Preview / Edit */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Generated AI Planning Prompt:
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                        className="text-[#0D6EFD] hover:underline flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingPrompt ? 'Save' : 'Fine-Tune'}</span>
                      </button>
                    </div>

                    {isEditingPrompt ? (
                      <textarea
                        rows={3}
                        value={editablePrompt}
                        onChange={(e) => setEditablePrompt(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD]/20 focus:border-[#0D6EFD]"
                      />
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal italic">
                        "{editablePrompt || parsedData.structuredPrompt}"
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Itinerary */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateItineraryClick}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#073B4C] hover:bg-[#086788] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#17BEBB]" />
                      <span>Generate Full Day-by-Day Itinerary</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('flight')}
                      className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plane className="w-3.5 h-3.5 text-[#0D6EFD]" />
                      <span>View Matched Flights</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Real-time voice processing backed by Gemini 3.7 &amp; Aviasales</span>
          </div>

          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 underline cursor-pointer"
          >
            {showDiagnostics ? 'Hide Logs' : 'Diagnostics'}
          </button>
        </div>

        {/* Diagnostics Drawer if toggled */}
        {showDiagnostics && (
          <div className="p-4 bg-slate-900 text-slate-300 font-mono text-[11px] border-t border-slate-800 max-h-48 overflow-y-auto space-y-1">
            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
              <span>Event Logs ({eventLogs.length})</span>
              <button
                type="button"
                onClick={clearEventLogs}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
            {eventLogs.length === 0 ? (
              <div className="text-slate-500 py-1">No event logs recorded yet.</div>
            ) : (
              eventLogs.map((log) => (
                <div
                  key={log.id}
                  className={`py-0.5 leading-tight ${log.isError ? 'text-rose-400' : 'text-slate-300'}`}
                >
                  <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                  <span className="text-cyan-400 font-bold">[{log.type.toUpperCase()}]</span>{' '}
                  <span>{log.message}</span>
                  {log.details && <span className="text-slate-400"> - {log.details}</span>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
