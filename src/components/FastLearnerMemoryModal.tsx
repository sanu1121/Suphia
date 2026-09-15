import React, { useState } from 'react';
import { PersonalityMode, LearnedInsight, VoiceSettings } from '../types';
import { PERSONALITIES } from '../data/personalities';
import {
  Zap,
  Brain,
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Sliders,
  Gauge,
  Volume2,
  Clock,
  Flame,
} from 'lucide-react';

interface FastLearnerMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: PersonalityMode;
  learnedInsights: LearnedInsight[];
  onAddInsight: (title: string, detail: string, category?: string) => Promise<void>;
  onDeleteInsight: (id: string) => Promise<void>;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
}

export const FastLearnerMemoryModal: React.FC<FastLearnerMemoryModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  learnedInsights,
  onAddInsight,
  onDeleteInsight,
  voiceSettings,
  onUpdateVoiceSettings,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'name' | 'language' | 'speed' | 'fact'>('preference');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const personality = PERSONALITIES[currentMode] || PERSONALITIES.girlfriend;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDetail.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddInsight(newTitle.trim(), newDetail.trim(), newCategory);
      setNewTitle('');
      setNewDetail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'speed':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'language':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'name':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div
      id="fast-learner-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="fast-learner-modal-container"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0b0c10] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-white transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
              style={{
                borderColor: `${personality.themeColor}50`,
                backgroundColor: `${personality.themeColor}15`,
              }}
            >
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-wide">Fast Learner & Neural Memory</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  REAL-TIME ADAPTATION
                </span>
              </div>
              <p className="text-xs text-white/50">
                Sophia learns your preferences, name, speech habits, and speeds instantly across conversations.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-fast-learner"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/50 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Fast Voice Mode & Speed Tuning Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-purple-950/30 border border-amber-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Fast Voice Mode (Low Latency Replay)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      ⚡ ~75ms Model
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    Accelerates speech recognition pause detection and routes TTS to ElevenLabs Flash V2.5.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="toggle-fast-voice-mode"
                onClick={() =>
                  onUpdateVoiceSettings({
                    fastVoiceMode: !voiceSettings.fastVoiceMode,
                    silenceDetectionMs: !voiceSettings.fastVoiceMode ? 1000 : 2200,
                  })
                }
                className={`px-3.5 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  voiceSettings.fastVoiceMode
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-white/[0.06] text-white/70 border-white/15 hover:bg-white/[0.1]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{voiceSettings.fastVoiceMode ? 'FAST MODE: ON' : 'FAST MODE: OFF'}</span>
              </button>
            </div>

            {/* Silence Detection Sensitivity Slider */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5 text-white/70">
                  <span className="font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Speech Pause Threshold (Recognition Latency):
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {(voiceSettings.silenceDetectionMs || 2200) / 1000}s
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
                <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
                  <span>Fast (~0.8s)</span>
                  <span>Balanced (~1.5s)</span>
                  <span>Full Thought (~2.8s)</span>
                </div>
              </div>

              {/* Speech Playback Speed */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-white/70">
                  <span className="font-medium flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                    Audio Synthesis Rate:
                  </span>
                  <span className="font-mono text-pink-300 font-bold">
                    {voiceSettings.rate.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.9"
                  max="1.35"
                  step="0.05"
                  value={voiceSettings.rate}
                  onChange={(e) =>
                    onUpdateVoiceSettings({ rate: parseFloat(e.target.value) })
                  }
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
                  <span>Standard (1.0x)</span>
                  <span>Energetic (1.15x)</span>
                  <span>Rapid (1.35x)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Teach / Add Insight Form */}
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-pink-400" />
                Teach Sophia Instantly (Manual Input)
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                Also learns automatically from voice
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              >
                <option value="preference">Preference</option>
                <option value="speed">Speech Speed</option>
                <option value="language">Language Mode</option>
                <option value="name">User Name</option>
                <option value="fact">Personal Fact</option>
              </select>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Topic (e.g. Preferred Name, Speed)"
                className="bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />

              <input
                type="text"
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
                placeholder="Fact (e.g. Always respond fast)"
                className="bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newTitle.trim() || !newDetail.trim() || isSubmitting}
                className="px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save to Neural Memory</span>
              </button>
            </div>
          </form>

          {/* Active Learned Memories List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-white/60 px-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-white/80 flex items-center gap-1.5">
                <span>Active Learned Insights</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 font-mono text-[10px] text-white">
                  {learnedInsights.length}
                </span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Injected directly into Sophia's prompts
              </span>
            </div>

            {learnedInsights.length === 0 ? (
              <div className="p-8 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-2">
                <Brain className="w-8 h-8 text-white/20 mx-auto" />
                <p className="text-xs text-white/50">
                  No memories yet. Speak to Sophia (e.g., &ldquo;Call me Alex&rdquo; or &ldquo;Reply fast&rdquo;) to watch her learn!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {learnedInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex items-start justify-between gap-2.5 transition"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${getCategoryBadge(insight.category)}`}>
                          {insight.category}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">
                          {insight.title}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 line-clamp-2">
                        {insight.detail}
                      </p>
                      <div className="text-[10px] text-white/30 font-mono">
                        Learned {new Date(insight.learnedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteInsight(insight.id)}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition cursor-pointer shrink-0"
                      title="Forget this memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/50">
          <span>Sophia adapts continuously with every message</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
