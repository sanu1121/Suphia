import React, { useState } from 'react';
import { PersonalityMode, VoiceProfile, VoiceSettings } from '../types';
import { VOICE_PROFILES } from '../data/voices';
import { PERSONALITIES } from '../data/personalities';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Check,
  Sparkles,
  Sliders,
  Radio,
  X,
  AudioWaveform,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: PersonalityMode;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  onPreviewVoice: (voiceId: string, text: string) => Promise<void>;
  isPreviewing: boolean;
  previewingVoiceId: string | null;
  onStopPreview: () => void;
  voiceStatus: { elevenLabsActive: boolean; provider: string } | null;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  voiceSettings,
  onUpdateVoiceSettings,
  onPreviewVoice,
  isPreviewing,
  previewingVoiceId,
  onStopPreview,
  voiceStatus,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hindi' | 'primary' | 'female' | 'male'>('hindi');
  const [customInputId, setCustomInputId] = useState('');
  const [applyGlobally, setApplyGlobally] = useState(true);

  if (!isOpen) return null;

  const personality = PERSONALITIES[currentMode] || PERSONALITIES.girlfriend;

  // Active voice ID for the current mode
  const currentVoiceId =
    (!applyGlobally && voiceSettings.modeVoiceOverrides?.[currentMode]) ||
    voiceSettings.elevenLabsVoiceId ||
    'EXAVITQu4vr4xnSDxMaL'; // Default to Sarah (Verified multilingual Hindi & English)

  const filteredVoices = VOICE_PROFILES.filter((voice) => {
    if (selectedFilter === 'hindi') return voice.category === 'hindi' || voice.isHindiSpecialist;
    if (selectedFilter === 'primary') return voice.category === 'primary' || voice.recommendedModes.includes(currentMode);
    if (selectedFilter === 'female') return voice.gender === 'female';
    if (selectedFilter === 'male') return voice.gender === 'male';
    return true;
  });

  const handleSelectVoice = (voice: VoiceProfile) => {
    if (applyGlobally) {
      onUpdateVoiceSettings({
        elevenLabsVoiceId: voice.id,
        activeVoiceName: voice.name,
        modeVoiceOverrides: {
          ...voiceSettings.modeVoiceOverrides,
          [currentMode]: voice.id,
        },
      });
    } else {
      onUpdateVoiceSettings({
        modeVoiceOverrides: {
          ...voiceSettings.modeVoiceOverrides,
          [currentMode]: voice.id,
        },
        activeVoiceName: voice.name,
      });
    }
  };

  const handleApplyCustomVoice = () => {
    const trimmed = customInputId.trim();
    if (!trimmed) return;
    onUpdateVoiceSettings({
      elevenLabsVoiceId: trimmed,
      activeVoiceName: `Custom (${trimmed.slice(0, 6)}...)`,
      modeVoiceOverrides: {
        ...voiceSettings.modeVoiceOverrides,
        [currentMode]: trimmed,
      },
    });
    setCustomInputId('');
  };

  return (
    <div
      id="voice-mode-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="voice-mode-modal-container"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b0c10] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-white transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
              style={{
                borderColor: `${personality.themeColor}50`,
                backgroundColor: `${personality.themeColor}15`,
              }}
            >
              <AudioWaveform className="w-5 h-5" style={{ color: personality.themeColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-wide">Voice Mode Studio</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {voiceStatus?.elevenLabsActive ? 'ElevenLabs V2' : 'Neural Core'}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Choose Sophia's vocal identity or listen to instant audio previews.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
            title="Close Voice Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader Toolbar & Scope Selector */}
        <div className="px-6 py-3 border-b border-white/[0.07] bg-white/[0.01] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedFilter('hindi')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === 'hindi'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>🇮🇳</span>
              <span>Hindi Sound (हिंदी)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {VOICE_PROFILES.filter((v) => v.category === 'hindi' || v.isHindiSpecialist).length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              All Voices ({VOICE_PROFILES.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('primary')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                selectedFilter === 'primary'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              Recommended for {personality.name}
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('female')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedFilter === 'female'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Female
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('male')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedFilter === 'male'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Male
            </button>
          </div>

          {/* Scope Selector: Apply to Current Mode vs All */}
          <div className="flex items-center gap-2 bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setApplyGlobally(true)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                applyGlobally ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-white/50 hover:text-white/80'
              }`}
            >
              Apply to All Modes
            </button>
            <button
              type="button"
              onClick={() => setApplyGlobally(false)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                !applyGlobally
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Only {personality.name} Mode
            </button>
          </div>
        </div>

        {/* Hindi Sound Master Control Banner */}
        <div className="mx-6 mt-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
              🇮🇳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-100">Hindi Sound Mode (हिंदी आवाज़)</span>
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                    voiceSettings.hindiSound
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/10 text-white/50 border-white/10'
                  }`}
                >
                  {voiceSettings.hindiSound ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Authentic Hindi speech synthesis, melodic cadence, and sweet conversational expressions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onUpdateVoiceSettings({ hindiSound: !voiceSettings.hindiSound })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
              voiceSettings.hindiSound
                ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <span>{voiceSettings.hindiSound ? 'Turn Off Hindi Sound' : 'Enable Hindi Sound'}</span>
          </button>
        </div>

        {/* ElevenLabs Voice-to-Text (Scribe STT) Integration Card */}
        <div className="mx-6 mt-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-purple-200">ElevenLabs Voice-to-Text (Scribe STT)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-300 border border-purple-500/35 font-semibold">
                  {voiceStatus?.elevenLabsActive ? 'Scribe STT Connected' : 'Neural Mode'}
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">
                Sophia listens to your full spoken voice and transcribes speech using ElevenLabs ASR models across 90+ languages including Hindi and English.
              </p>
            </div>
          </div>
        </div>

        {/* Voice Cards Grid Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredVoices.map((voice) => {
              const isActive = currentVoiceId === voice.id;
              const isPlayingThis = isPreviewing && previewingVoiceId === voice.id;
              const previewPhrase =
                (voiceSettings.hindiSound || selectedFilter === 'hindi') && voice.hindiSampleText
                  ? voice.hindiSampleText
                  : voice.sampleText;

              return (
                <div
                  key={voice.id}
                  id={`voice-card-${voice.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className={`group relative p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? 'bg-white/[0.08] border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                      : 'bg-white/[0.03] border-white/[0.09] hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  {/* Top card row: Name, Avatar, Category, Active badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow"
                          style={{ backgroundColor: `${voice.avatarColor}33`, borderColor: voice.avatarColor, borderWidth: 1 }}
                        >
                          {voice.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white tracking-wide text-sm">
                              {voice.name}
                            </span>
                            {isActive && (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Check className="w-3 h-3" /> ACTIVE
                              </span>
                            )}
                            {voice.isHindiSpecialist && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <span>🇮🇳</span> हिंदी
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-white/50">{voice.tone}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-white/40 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                        {voice.accent}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/70 leading-relaxed mb-3">
                      {voice.description}
                    </p>

                    {/* Sample Phrase Preview Text */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-white/70 italic mb-3">
                      <div className="flex items-center gap-1 text-[10px] not-italic text-amber-300/80 mb-1 font-mono uppercase">
                        <span>🇮🇳 Preview Sample:</span>
                      </div>
                      "{previewPhrase}"
                    </div>
                  </div>

                  {/* Bottom Action Row: Preview & Select */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingThis) {
                          onStopPreview();
                        } else {
                          onPreviewVoice(voice.id, previewPhrase);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isPlayingThis
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border border-white/10'
                      }`}
                      title="Listen to how this voice sounds"
                    >
                      {isPlayingThis ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop Preview</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Preview Audio</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectVoice(voice)}
                      disabled={isActive}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Select Voice</span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Voice ID Section */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-white/70 w-full sm:w-auto">
              <Zap className="w-4 h-4 text-pink-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Custom ElevenLabs Voice ID:</span>
                <p className="text-[11px] text-white/40">
                  Paste any custom clone or library voice ID from your ElevenLabs dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={customInputId}
                onChange={(e) => setCustomInputId(e.target.value)}
                placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                className="w-full sm:w-56 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-pink-500 font-mono"
              />
              <button
                type="button"
                onClick={handleApplyCustomVoice}
                className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-semibold cursor-pointer whitespace-nowrap transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              Active Voice for {personality.name}:{' '}
              <strong className="text-white font-medium">
                {VOICE_PROFILES.find((v) => v.id === currentVoiceId)?.name || 'Rachel'}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
