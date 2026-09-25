import React, { useState, useEffect, useRef } from 'react';
import { PersonalityMode, VoiceSettings, VoiceStatus } from '../types';
import { PERSONALITIES } from '../data/personalities';
import { SpeechSentiment, SENTIMENT_CONFIGS, SentimentVisualConfig } from '../utils/sentiment';
import {
  Mic,
  MicOff,
  Send,
  Square,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  AudioWaveform,
  Zap,
  Brain,
  Clock,
  Sun,
  Smile,
  Heart,
  Compass,
  Palette,
  Check,
  Pause,
  Play,
  Hand,
} from 'lucide-react';

interface VoiceHUDProps {
  mode: PersonalityMode;
  isSpeaking: boolean;
  isListening: boolean;
  isTranscribing?: boolean;
  sttProviderNotice?: string | null;
  isProcessing: boolean;
  onSendMessage: (text: string) => void;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
  voiceStatus?: VoiceStatus | null;
  onOpenVoiceMode?: () => void;
  onOpenFastLearner?: () => void;
  learnedInsightsCount?: number;
  liveTranscript?: string;
  currentSentiment?: SpeechSentiment;
  onSelectSentiment?: (sentiment: SpeechSentiment) => void;
  isSophiaPaused?: boolean;
  onTogglePauseResume?: () => void;
  onOpenGestureHUD?: () => void;
  isGestureEnabled?: boolean;
}

export const VoiceHUD: React.FC<VoiceHUDProps> = ({
  mode,
  isSpeaking,
  isListening,
  isTranscribing,
  sttProviderNotice,
  isProcessing,
  onSendMessage,
  onToggleListening,
  onStopSpeaking,
  voiceSettings,
  onUpdateVoiceSettings,
  availableVoices,
  voiceStatus,
  onOpenVoiceMode,
  onOpenFastLearner,
  learnedInsightsCount,
  liveTranscript,
  currentSentiment = 'calm',
  onSelectSentiment,
  isSophiaPaused = false,
  onTogglePauseResume,
  onOpenGestureHUD,
  isGestureEnabled = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showSentimentPicker, setShowSentimentPicker] = useState(false);
  const personality = PERSONALITIES[mode] || PERSONALITIES.girlfriend;
  const inputRef = useRef<HTMLInputElement>(null);

  const sentimentConfig = SENTIMENT_CONFIGS[currentSentiment] || SENTIMENT_CONFIGS.calm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const getSentimentIcon = (sentiment: SpeechSentiment | string) => {
    switch (sentiment) {
      case 'happy':
        return <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />;
      case 'calm':
        return <Compass className="w-3.5 h-3.5 text-sky-400" />;
      case 'loving':
        return <Heart className="w-3.5 h-3.5 text-pink-400 animate-pulse" />;
      case 'thoughtful':
        return <Brain className="w-3.5 h-3.5 text-purple-400" />;
      case 'empathetic':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'energetic':
        return <Zap className="w-3.5 h-3.5 text-orange-400 animate-bounce" />;
    }
  };

  return (
    <div
      id="sophia-voice-hud"
      className="w-full bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-3 sm:p-4 shadow-2xl relative transition-all duration-500 border"
      style={{
        borderColor: isSpeaking ? sentimentConfig.borderTint : 'rgba(255, 255, 255, 0.08)',
        boxShadow: isSpeaking
          ? `0 16px 50px -6px ${sentimentConfig.glowColor}, 0 0 25px ${sentimentConfig.glowColor}`
          : `0 12px 40px -10px ${personality.glowColor}`,
      }}
    >
      {/* Dynamic Visual Sentiment Indicator Bar */}
      <div
        id="hud-sentiment-indicator"
        className={`mb-3 px-3 py-2 rounded-xl transition-all duration-500 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
          isSpeaking
            ? 'scale-[1.01] shadow-lg animate-pulse'
            : 'bg-white/[0.02] border-white/[0.06]'
        }`}
        style={{
          backgroundColor: isSpeaking ? sentimentConfig.bgTint : undefined,
          borderColor: isSpeaking ? sentimentConfig.borderTint : undefined,
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Glowing Sentiment Pulsing Dot & Icon */}
          <div className="relative flex items-center justify-center">
            <span
              className={`absolute w-5 h-5 rounded-full opacity-60 ${
                isSpeaking ? 'animate-ping' : ''
              }`}
              style={{ backgroundColor: sentimentConfig.primaryColor }}
            />
            <div
              className="relative p-1.5 rounded-lg border flex items-center justify-center shadow-inner"
              style={{
                backgroundColor: isSpeaking ? `${sentimentConfig.primaryColor}22` : 'rgba(255, 255, 255, 0.04)',
                borderColor: sentimentConfig.borderTint,
              }}
            >
              {getSentimentIcon(currentSentiment)}
            </div>
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/50">
                {isSpeaking ? "Sophia's Active Vocal Sentiment:" : "Speech Sentiment Tone:"}
              </span>
              <span
                className="text-xs font-bold transition-colors duration-300 flex items-center gap-1.5"
                style={{ color: sentimentConfig.primaryColor }}
              >
                <span>{sentimentConfig.name}</span>
                <span className="text-[10px] font-normal opacity-80">({sentimentConfig.nameHindi})</span>
              </span>
            </div>
            <p className="text-[11px] text-white/60 leading-tight">
              {isSpeaking
                ? (voiceSettings.hindiSound ? sentimentConfig.descriptionHindi : sentimentConfig.description)
                : 'Dynamic emotional feedback shifts colors subtly in real-time as Sophia speaks.'}
            </p>
          </div>
        </div>

        {/* Sentiment Audition / Override Selector */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <button
            type="button"
            id="btn-toggle-sentiment-picker"
            onClick={() => setShowSentimentPicker(!showSentimentPicker)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer"
            style={{
              borderColor: sentimentConfig.borderTint,
              color: sentimentConfig.primaryColor,
              backgroundColor: `${sentimentConfig.primaryColor}15`,
            }}
            title="Audition or switch voice speech sentiment colors"
          >
            <Palette className="w-3 h-3" />
            <span>Audition Sentiments</span>
            <span className="text-[9px] opacity-70">▾</span>
          </button>
        </div>
      </div>

      {/* Interactive Sentiment Palette Audition Row (when opened) */}
      {showSentimentPicker && (
        <div
          id="sentiment-palette-drawer"
          className="mb-3 p-2.5 rounded-xl bg-black/60 border border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 animate-fadeIn"
        >
          {(Object.keys(SENTIMENT_CONFIGS) as SpeechSentiment[]).map((sentKey) => {
            const cfg = SENTIMENT_CONFIGS[sentKey];
            const isSelected = currentSentiment === sentKey;
            return (
              <button
                key={sentKey}
                type="button"
                onClick={() => {
                  onSelectSentiment?.(sentKey);
                }}
                className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between gap-1 cursor-pointer group ${
                  isSelected
                    ? 'ring-2 shadow-md'
                    : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06]'
                }`}
                style={{
                  borderColor: isSelected ? cfg.primaryColor : undefined,
                  boxShadow: isSelected ? `0 0 14px ${cfg.glowColor}` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cfg.primaryColor }}
                    />
                    <span className="text-[11px] font-semibold text-white truncate">{cfg.name.split(' ')[0]}</span>
                  </div>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[9px] text-white/50 truncate group-hover:text-white/80">{cfg.name.split('(')[1]?.replace(')', '') || ''}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Audio Wave Visualizer Line when Speaking/Listening */}
      <div className="flex items-center justify-center gap-1.5 h-6 mb-2.5">
        {Array.from({ length: 20 }).map((_, i) => {
          const dynamicHeight = isSpeaking
            ? Math.max(4, Math.sin((i + Date.now() / 100) * 0.8) * 18 + 10)
            : isListening
            ? Math.max(4, Math.sin(i * 0.9 + Date.now() / 150) * 14 + 8)
            : 3;

          return (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-75"
              style={{
                height: `${dynamicHeight}px`,
                backgroundColor: isSpeaking
                  ? sentimentConfig.primaryColor
                  : isListening
                  ? '#10b981'
                  : 'rgba(255, 255, 255, 0.12)',
                boxShadow: isSpeaking ? `0 0 8px ${sentimentConfig.glowColor}` : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Voice Mode Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-white/40 font-mono text-[10px] uppercase tracking-wider">Voice:</span>
          <button
            type="button"
            id="hud-voice-mode-trigger"
            onClick={onOpenVoiceMode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-pink-500/50 text-white transition cursor-pointer font-medium shadow-sm group"
            title="Click to change Sophia's voice"
          >
            <AudioWaveform className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
            <span className="text-pink-300 font-semibold">{voiceSettings.activeVoiceName || 'Sarah'}</span>
            <span className="text-[10px] text-white/40 group-hover:text-white/70 transition font-mono">(Voice Studio)</span>
          </button>

          {/* Dedicated Fast Mode Toggle */}
          <button
            type="button"
            id="hud-fast-mode-toggle"
            onClick={() =>
              onUpdateVoiceSettings({
                fastVoiceMode: !voiceSettings.fastVoiceMode,
                silenceDetectionMs: !voiceSettings.fastVoiceMode ? 1000 : 2200,
                rate: !voiceSettings.fastVoiceMode ? 1.15 : 1.0,
              })
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium shadow-sm ${
              voiceSettings.fastVoiceMode
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.08]'
            }`}
            title={
              voiceSettings.fastVoiceMode
                ? 'Fast Recognition (~1s pause) & Instant Replay (~75ms model) active'
                : 'Switch to Fast Voice Mode for low-latency recognition and instant replay'
            }
          >
            <Zap className={`w-3.5 h-3.5 ${voiceSettings.fastVoiceMode ? 'text-amber-300 fill-amber-300 animate-pulse' : 'text-white/40'}`} />
            <span>Fast Replay:</span>
            <strong className={voiceSettings.fastVoiceMode ? 'text-amber-300 font-bold' : 'text-white/40 font-normal'}>
              {voiceSettings.fastVoiceMode ? 'ON (~1s)' : 'OFF'}
            </strong>
          </button>

          {/* Fast Learner Memory Trigger */}
          {onOpenFastLearner && (
            <button
              type="button"
              id="hud-fast-learner-trigger"
              onClick={onOpenFastLearner}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-purple-500/50 text-white transition cursor-pointer font-medium shadow-sm group"
              title="Open Fast Learner Neural Memory & Preferences"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-purple-300 font-semibold">Fast Learner</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
                {learnedInsightsCount ?? 0}
              </span>
            </button>
          )}

          {/* Dedicated One-Click Hindi Voice & Reply Toggle */}
          <button
            type="button"
            id="hud-hindi-sound-toggle"
            onClick={() => onUpdateVoiceSettings({ hindiSound: !voiceSettings.hindiSound })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium shadow-sm ${
              voiceSettings.hindiSound
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.08]'
            }`}
            title={
              voiceSettings.hindiSound
                ? 'Hindi Voice Recognition & Reply Active - Click to switch to English'
                : 'Click to activate Hindi Voice Recognition & Reply Mode (हिंदी आवाज़ और उत्तर)'
            }
          >
            <span className="text-xs">🇮🇳</span>
            <span>Hindi Mode:</span>
            <strong className={voiceSettings.hindiSound ? 'text-amber-300 font-bold' : 'text-white/40 font-normal'}>
              {voiceSettings.hindiSound ? 'ON (हिंदी)' : 'OFF (EN)'}
            </strong>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {voiceStatus?.openAIActive ? (
            <span
              className="text-[10px] text-cyan-300 font-mono flex items-center gap-1 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30"
              title="OpenAI GPT-4o Thinking Power & Reasoning Relay Active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              OpenAI {voiceStatus?.openAIModel || 'GPT-4o'} (Thinking)
            </span>
          ) : (
            <span
              className="text-[10px] text-blue-300/70 font-mono flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20"
              title="Gemini Flash Thinking Engine Active"
            >
              Gemini Flash (Thinking)
            </span>
          )}

          {voiceStatus?.elevenLabsActive ? (
            <span
              className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20"
              title="ElevenLabs Neural Voice Synthesis & Scribe Speech-to-Text Active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ElevenLabs {voiceSettings.fastVoiceMode ? 'Flash V2.5 (~75ms)' : 'Voice & STT'}
            </span>
          ) : (
            <span className="text-[10px] text-white/40 font-mono">
              Neural Voice Fallback
            </span>
          )}

          {voiceStatus?.relayActive && (
            <span
              className="text-[10px] text-purple-300 font-mono flex items-center gap-1 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold"
              title="Relay: OpenAI Reasoning Engine relayed directly with ElevenLabs Voice Synthesis"
            >
              ⚡ Relay Active
            </span>
          )}
        </div>
      </div>

      {/* Live Voice Recognition Transcript Banner */}
      {isListening && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 mb-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs shadow-inner">
          <div className="flex items-center gap-2 truncate">
            <Mic className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-300 shrink-0 font-bold">
              {voiceStatus?.elevenLabsActive
                ? (voiceSettings.hindiSound ? 'ElevenLabs Scribe (hi):' : 'ElevenLabs Scribe (STT):')
                : (voiceSettings.hindiSound ? 'हिंदी पहचान (hi-IN):' : 'Listening (en-US):')}
            </span>
            <span className="truncate font-medium text-white italic">
              {liveTranscript ? `"${liveTranscript}"` : (voiceSettings.hindiSound ? 'पूरा वाक्य बोलिए, सोफिया सुन रही है...' : 'Speak your full thought, Sophia is listening...')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-emerald-300/80 font-mono hidden sm:inline">
              {voiceSettings.hindiSound ? 'रुकने पर स्वतः उत्तर' : 'Auto-replies on pause'}
            </span>
            <span className="text-[10px] text-emerald-300 font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 font-bold border border-emerald-500/30 animate-pulse">
              {voiceStatus?.elevenLabsActive ? 'ELEVENLABS REC' : 'LIVE'}
            </span>
          </div>
        </div>
      )}

      {/* Live Voice Transcribing with ElevenLabs Banner */}
      {isTranscribing && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 mb-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs shadow-inner animate-pulse">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 animate-spin" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-purple-300 shrink-0 font-bold">
              {voiceStatus?.elevenLabsActive ? 'ElevenLabs Scribe STT:' : 'Voice-to-Text:'}
            </span>
            <span className="truncate font-medium text-white italic">
              {voiceSettings.hindiSound ? 'सोफिया आपकी आवाज़ समझ रही है...' : 'Sophia is transcribing your voice with ElevenLabs...'}
            </span>
          </div>
          <span className="text-[10px] text-purple-300 font-mono px-2 py-0.5 rounded bg-purple-500/30 font-bold border border-purple-500/40">
            TRANSCRIBING
          </span>
        </div>
      )}

      {/* STT Provider Notice */}
      {sttProviderNotice && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{sttProviderNotice}</span>
        </div>
      )}

      {/* Sophia Paused Banner */}
      {isSophiaPaused && (
        <div
          id="hud-sophia-paused-alert"
          className="flex items-center justify-between gap-3 px-3.5 py-2.5 mb-2.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-amber-900/50 to-orange-950/70 border border-amber-500/50 text-amber-200 text-xs shadow-lg shadow-amber-950/50 animate-pulse"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <Pause className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-bold text-white block tracking-wide">
                Sophia is currently Paused
              </span>
              <span className="text-[11px] text-amber-300/80 flex items-center gap-1.5">
                <Hand className="w-3 h-3 text-amber-400" />
                <span>Wave hand in front of camera or click Resume</span>
              </span>
            </div>
          </div>
          {onTogglePauseResume && (
            <button
              type="button"
              id="hud-btn-resume"
              onClick={onTogglePauseResume}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
          )}
        </div>
      )}

      {/* Input & Control Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
        {/* Main Microphone Action Button */}
        <button
          type="button"
          id="btn-voice-mic"
          onClick={onToggleListening}
          disabled={isProcessing}
          className={`relative p-3 sm:p-3.5 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isListening
              ? 'border-white text-white shadow-xl scale-105 animate-pulse'
              : isTranscribing
              ? 'border-purple-400 text-purple-200 bg-purple-500/20 shadow-xl animate-pulse'
              : 'bg-white/[0.05] border-white/10 text-white/80 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
          }`}
          style={{
            backgroundColor: isListening ? personality.themeColor : undefined,
            boxShadow: isListening ? `0 0 25px ${personality.glowColor}` : undefined,
          }}
          title={
            isListening
              ? 'Click to stop and transcribe immediately'
              : isTranscribing
              ? 'Transcribing speech with ElevenLabs...'
              : (voiceSettings.hindiSound ? 'हिंदी में बोलिए (ElevenLabs Voice to Text)' : 'Speak to Sophia (ElevenLabs Voice to Text)')
          }
        >
          {isTranscribing ? (
            <Sparkles className="w-5 h-5 animate-spin text-purple-300" />
          ) : isListening ? (
            <Mic className="w-5 h-5 animate-bounce" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Hand Wave Gesture Interface Trigger */}
        {onOpenGestureHUD && (
          <button
            type="button"
            id="btn-hud-gesture"
            onClick={onOpenGestureHUD}
            className={`p-3 rounded-xl border transition-all cursor-pointer relative flex items-center justify-center ${
              isGestureEnabled
                ? isSophiaPaused
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-white/[0.04] border-white/10 text-white/40 hover:text-white hover:border-white/20'
            }`}
            title="Webcam Gesture Sensor: Wave hand to Pause / Resume"
          >
            <Hand
              className={`w-5 h-5 ${
                isGestureEnabled
                  ? isSophiaPaused
                    ? 'text-amber-400'
                    : 'text-cyan-400 animate-pulse'
                  : ''
              }`}
            />
            {isGestureEnabled && (
              <span
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black ${
                  isSophiaPaused ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-ping'
                }`}
              />
            )}
          </button>
        )}

        {/* Manual Pause / Resume Button */}
        {onTogglePauseResume && (
          <button
            type="button"
            id="btn-hud-toggle-pause"
            onClick={onTogglePauseResume}
            className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
              isSophiaPaused
                ? 'bg-amber-500/25 border-amber-500/60 text-amber-300 hover:bg-amber-500/35'
                : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white hover:border-white/20'
            }`}
            title={isSophiaPaused ? 'Resume Sophia' : 'Pause Sophia (or wave hand)'}
          >
            {isSophiaPaused ? (
              <Play className="w-5 h-5 fill-current text-amber-400" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Text Prompt Input for Keyboard / Voice Synthesis */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            id="input-voice-text"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? (liveTranscript ? `🎙️ "${liveTranscript}"` : (voiceSettings.hindiSound ? 'हिंदी में बोलिए, मैं सुन रही हूँ...' : 'Listening to your voice...'))
                : (voiceSettings.hindiSound
                    ? 'हिंदी में बोलिए या टाइप करें... (उदा. "नमस्ते सोफिया, तुम कैसी हो?")'
                    : `Talk to Sophia (${personality.name} Mode)...`)
            }
            disabled={isProcessing}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors pr-10"
          />
          {inputText.trim() && (
            <button
              type="submit"
              disabled={isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white transition-opacity cursor-pointer shadow-md"
              style={{ backgroundColor: personality.themeColor }}
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stop Speaking button if Sophia is speaking */}
        {isSpeaking && (
          <button
            type="button"
            id="btn-stop-speech"
            onClick={onStopSpeaking}
            className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Stop Sophia Speaking"
          >
            <Square className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline font-mono tracking-wider">MUTE</span>
          </button>
        )}

        {/* Audio / Voice Settings Toggle */}
        <button
          type="button"
          id="btn-voice-settings"
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-xl border transition-colors cursor-pointer relative ${
            showSettings
              ? 'bg-white/[0.1] border-white/30 text-white'
              : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white hover:border-white/20'
          }`}
          title="Voice & Speech Settings"
        >
          <Sliders className="w-5 h-5" />
          {voiceStatus?.elevenLabsActive && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 border border-black animate-pulse" />
          )}
        </button>
      </form>

      {/* Expandable Voice & Speech Settings Drawer */}
      {showSettings && (
        <div
          id="sophia-voice-settings-panel"
          className="mt-3 pt-3 border-t border-white/[0.08] text-xs text-white/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-black/40 p-3.5 rounded-xl animate-fadeIn border border-white/[0.05]"
        >
          {/* ElevenLabs Sound Engine Status Bar */}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg border ${
                  voiceStatus?.elevenLabsActive
                    ? 'bg-pink-500/15 border-pink-500/30 text-pink-400'
                    : 'bg-white/[0.04] border-white/10 text-white/40'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white/95 text-xs flex items-center gap-2">
                  <span>ElevenLabs Neural Sound</span>
                  {voiceStatus?.elevenLabsActive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-white/50 bg-white/[0.06] border border-white/10">
                      FALLBACK READY
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/55 mt-0.5">
                  {voiceStatus?.elevenLabsActive
                    ? 'Powered by ElevenLabs Multilingual V2 for ultra-realistic human vocal delivery.'
                    : 'Configure ELEVENLABS_API_KEY in AI Studio Settings to activate lifelike neural voices.'}
                </div>
              </div>
            </div>

            {voiceStatus?.elevenLabsActive && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/50 font-mono">Current Voice:</span>
                  <span className="text-xs font-semibold text-pink-300">
                    {voiceSettings.activeVoiceName || 'Rachel (21m00Tcm4TlvDq8ikWAM)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenVoiceMode}
                  className="py-1 px-2.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-xs text-pink-200 font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <AudioWaveform className="w-3.5 h-3.5 text-pink-400" />
                  <span>Open Voice Mode Studio</span>
                </button>
              </div>
            )}
          </div>
          {/* Fast Voice Mode Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/30">
            <div>
              <span className="flex items-center gap-2 font-medium text-amber-200">
                <Zap className="w-4 h-4 text-amber-400" />
                Fast Recognition & Replay
              </span>
              <p className="text-[10px] text-white/40 ml-6">
                ~1s silence trigger + ElevenLabs Flash V2.5 (~75ms)
              </p>
            </div>
            <input
              type="checkbox"
              id="chk-fast-voice-mode"
              checked={!!voiceSettings.fastVoiceMode}
              onChange={(e) =>
                onUpdateVoiceSettings({
                  fastVoiceMode: e.target.checked,
                  silenceDetectionMs: e.target.checked ? 1000 : 2200,
                  rate: e.target.checked ? 1.15 : 1.0,
                })
              }
              className="accent-amber-500 rounded cursor-pointer w-4 h-4"
            />
          </div>

          {/* Silence Pause Detection Slider */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex justify-between mb-1 text-[11px] uppercase tracking-wider text-white/50">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Silence Pause
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {((voiceSettings.silenceDetectionMs || 2200) / 1000).toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="800"
              max="2800"
              step="100"
              value={voiceSettings.silenceDetectionMs || 2200}
              onChange={(e) =>
                onUpdateVoiceSettings({ silenceDetectionMs: parseInt(e.target.value, 10) })
              }
              className="w-full accent-amber-500"
            />
          </div>

          {/* Auto-Speak Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="flex items-center gap-2 font-medium text-white/80">
              {voiceSettings.autoSpeak ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-white/40" />
              )}
              Auto-Speak
            </span>
            <input
              type="checkbox"
              id="chk-auto-speak"
              checked={voiceSettings.autoSpeak}
              onChange={(e) => onUpdateVoiceSettings({ autoSpeak: e.target.checked })}
              className="accent-pink-500 rounded cursor-pointer"
            />
          </div>

          {/* Hindi Sound Mode Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20">
            <div>
              <span className="flex items-center gap-2 font-medium text-amber-200">
                <span className="text-sm">🇮🇳</span>
                Hindi Sound (हिंदी आवाज़)
              </span>
              <p className="text-[10px] text-white/40 ml-6">
                Enables authentic Hindi inflection and sweet expressions
              </p>
            </div>
            <input
              type="checkbox"
              id="chk-hindi-sound"
              checked={!!voiceSettings.hindiSound}
              onChange={(e) => onUpdateVoiceSettings({ hindiSound: e.target.checked })}
              className="accent-amber-500 rounded cursor-pointer w-4 h-4"
            />
          </div>

          {/* Speech Rate Slider */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex justify-between mb-1 text-[11px] uppercase tracking-wider text-white/50">
              <span>Speech Speed</span>
              <span className="font-mono text-white/80">{voiceSettings.rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.4"
              step="0.05"
              value={voiceSettings.rate}
              onChange={(e) => onUpdateVoiceSettings({ rate: parseFloat(e.target.value) })}
              className="w-full accent-pink-500"
            />
          </div>

          {/* Speech Pitch Slider */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex justify-between mb-1 text-[11px] uppercase tracking-wider text-white/50">
              <span>Voice Pitch</span>
              <span className="font-mono text-white/80">{voiceSettings.pitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={voiceSettings.pitch}
              onChange={(e) => onUpdateVoiceSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-pink-500"
            />
          </div>

          {/* Voice selector */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <label className="block mb-1 text-[10px] uppercase tracking-wider text-white/50 font-semibold">
              TTS Engine
            </label>
            <select
              value={voiceSettings.selectedVoiceURI}
              onChange={(e) => onUpdateVoiceSettings({ selectedVoiceURI: e.target.value })}
              className="w-full bg-black/80 border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="">Auto (Default Neural Voice)</option>
              {availableVoices.map((v, idx) => (
                <option key={`${v.voiceURI || v.name}_${v.lang}_${idx}`} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
