import React, { useState, useEffect } from 'react';
import { PersonalityMode } from '../types';
import { PERSONALITIES } from '../data/personalities';
import { Volume2, VolumeX, Trash2, Bell, Sparkles, Globe, Radio, AudioWaveform, Zap, Brain, LogIn, LogOut, Database, UserCheck, Hand } from 'lucide-react';

interface HeaderProps {
  currentMode: PersonalityMode;
  onSelectMode?: (mode: PersonalityMode) => void;
  isSpeaking: boolean;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onClearHistory: () => void;
  onOpenReminders: () => void;
  remindersCount: number;
  activeView: 'voice_hud' | 'world_knowledge';
  onSelectView: (view: 'voice_hud' | 'world_knowledge') => void;
  onOpenVoiceMode?: () => void;
  activeVoiceName?: string;
  onOpenFastLearner?: () => void;
  learnedInsightsCount?: number;
  onOpenStudio?: () => void;
  isSophiaPaused?: boolean;
  onOpenGestureHUD?: () => void;
  isGestureEnabled?: boolean;
  currentUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null; uid?: string } | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

const MODES_LIST: PersonalityMode[] = ['assistant', 'girlfriend', 'friend', 'mentor', 'waifu'];

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  isSpeaking,
  autoSpeak,
  onToggleAutoSpeak,
  onClearHistory,
  onOpenReminders,
  remindersCount,
  activeView,
  onSelectView,
  onOpenVoiceMode,
  activeVoiceName,
  onOpenFastLearner,
  learnedInsightsCount = 0,
  onOpenStudio,
  isSophiaPaused = false,
  onOpenGestureHUD,
  isGestureEnabled = false,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const personality = PERSONALITIES[currentMode] || PERSONALITIES.girlfriend;
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      id="sophia-main-header"
      className="w-full border-b border-white/[0.07] bg-[#050505]/70 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 transition-all duration-300"
    >
      {/* Brand & Identity */}
      <div className="flex items-center gap-3.5">
        <div
          className="relative w-8 h-8 rounded-full border border-white/20 flex items-center justify-center transition-all duration-500 bg-white/[0.02]"
          style={{
            borderColor: isSpeaking ? personality.themeColor : 'rgba(255, 255, 255, 0.2)',
            boxShadow: isSpeaking ? `0 0 16px ${personality.glowColor}` : 'none',
          }}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              isSpeaking ? 'scale-125 animate-pulse' : ''
            }`}
            style={{ backgroundColor: personality.themeColor }}
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-[0.2em] text-sm sm:text-base text-white">
              SOPHIA
            </span>
            <span className="font-mono text-[10px] tracking-widest text-white/40 font-light">
              v2.4
            </span>
          </div>
          <span className="text-[10px] tracking-wider text-white/40 uppercase hidden sm:inline">
            Adaptive Voice AI Companion
          </span>
        </div>
      </div>

      {/* Central Mode Selector Navigation (Immersive Style) */}
      <nav
        aria-label="Personality Modes"
        className="hidden md:flex items-center gap-5 sm:gap-7 text-[11px] font-medium tracking-[0.18em]"
      >
        {MODES_LIST.map((modeKey) => {
          const isActive = currentMode === modeKey;
          const modeInfo = PERSONALITIES[modeKey];
          return (
            <button
              key={modeKey}
              type="button"
              onClick={() => onSelectMode && onSelectMode(modeKey)}
              className={`transition-all duration-200 cursor-pointer uppercase py-1 relative ${
                isActive
                  ? 'font-bold scale-105'
                  : 'text-white/45 hover:text-white/80'
              }`}
              style={{
                color: isActive ? personality.themeColor : undefined,
                textShadow: isActive ? `0 0 12px ${personality.glowColor}` : 'none',
              }}
            >
              {modeInfo.name}
              {isActive && (
                <span
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-[2px] rounded-full"
                  style={{ backgroundColor: personality.themeColor }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* View Switcher: Voice HUD vs Whole Worlds Knowledge */}
      <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
        <button
          type="button"
          id="header-view-hud"
          onClick={() => onSelectView('voice_hud')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeView === 'voice_hud'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-pink-400" />
          <span className="tracking-wide">Voice HUD</span>
        </button>

        <button
          type="button"
          id="header-view-world-knowledge"
          onClick={() => onSelectView('world_knowledge')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeView === 'world_knowledge'
              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '18s' }} />
          <span className="tracking-wide">Whole Worlds</span>
        </button>
      </div>

      {/* Right Telemetry & Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Voice Mode / Change Voice Button */}
        <button
          type="button"
          id="header-btn-voice-mode"
          onClick={onOpenVoiceMode}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 border border-pink-500/30 hover:border-pink-500/60 text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(236,72,153,0.3)]"
          title="Change Voice Mode & Neural Sound Model"
        >
          <AudioWaveform className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
            Voice: <span className="text-pink-300">{activeVoiceName || 'Rachel'}</span>
          </span>
        </button>

        {/* Fast Learner Memory Button */}
        {onOpenFastLearner && (
          <button
            type="button"
            id="header-btn-fast-learner"
            onClick={onOpenFastLearner}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/50 text-amber-200 transition-all cursor-pointer shadow-sm"
            title="Open Fast Learner & Real-Time Memory"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold hidden sm:inline">Learner</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 font-bold border border-amber-400/40">
              {learnedInsightsCount}
            </span>
          </button>
        )}

        {/* System Active Timestamp */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono tracking-widest text-white/40 pr-2 border-r border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{timeString || '14:02 PM'}</span>
          <span className="text-white/20">•</span>
          <span className="text-white/50">SYSTEM ACTIVE</span>
        </div>

        {/* AI Multimodal Studio Button */}
        {onOpenStudio && (
          <button
            type="button"
            id="header-btn-ai-studio"
            onClick={onOpenStudio}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/40 text-white font-medium text-xs transition cursor-pointer shadow-sm group"
            title="Open Multimodal AI Studio (Lyria Music, Nano Banana 2 Images, Veo 3 Video, Grounding)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold text-amber-200 hidden sm:inline">AI Studio</span>
          </button>
        )}

        {/* Futuristic Wave Gesture Control Button */}
        {onOpenGestureHUD && (
          <button
            type="button"
            id="header-btn-gesture-hud"
            onClick={onOpenGestureHUD}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm group ${
              isGestureEnabled
                ? isSophiaPaused
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'bg-white/[0.04] border-white/10 text-white/60 hover:text-white hover:border-white/25'
            }`}
            title="Webcam Gesture Sensor: Wave hand to Pause / Resume Sophia"
          >
            <div className="relative flex items-center justify-center">
              <Hand
                className={`w-3.5 h-3.5 transition-transform group-hover:rotate-12 ${
                  isGestureEnabled
                    ? isSophiaPaused
                      ? 'text-amber-400'
                      : 'text-cyan-400 animate-pulse'
                    : 'text-white/40'
                }`}
              />
              {isGestureEnabled && (
                <span
                  className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${
                    isSophiaPaused ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-ping'
                  }`}
                />
              )}
            </div>
            <span className="hidden md:inline">Gesture</span>
            <span
              className={`text-[9px] font-mono px-1 py-0.2 rounded uppercase ${
                isGestureEnabled
                  ? isSophiaPaused
                    ? 'bg-amber-950 text-amber-300'
                    : 'bg-cyan-950 text-cyan-300'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {isGestureEnabled ? (isSophiaPaused ? 'PAUSE' : 'ON') : 'OFF'}
            </span>
          </button>
        )}

        {/* Firebase Authentication & Cloud Sync */}
        {currentUser ? (
          <div className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-white">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'User'}
                className="w-5 h-5 rounded-full object-cover border border-emerald-400/50"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                {(currentUser.displayName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[11px] font-medium leading-none text-emerald-200">
                {currentUser.displayName || 'Cloud User'}
              </span>
              <span className="text-[9px] font-mono text-emerald-400/70 flex items-center gap-1">
                <Database className="w-2.5 h-2.5" /> Firestore Synced
              </span>
            </div>
            {onLogout && (
              <button
                type="button"
                id="btn-header-signout"
                onClick={onLogout}
                className="p-1 text-white/50 hover:text-rose-300 transition-colors ml-1 cursor-pointer"
                title="Sign out of Firebase"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          onLogin && (
            <button
              type="button"
              id="btn-header-signin"
              onClick={onLogin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-white font-medium text-xs transition cursor-pointer shadow-sm"
              title="Sign in with Google to sync voice history, memories, and studio creations to Firebase"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )
        )}

        {/* Reminders / Alerts button */}
        <button
          type="button"
          id="btn-open-reminders"
          onClick={onOpenReminders}
          className="relative p-2 rounded-xl bg-white/[0.04] border border-white/[0.09] hover:border-white/25 text-white/70 hover:text-white transition-all cursor-pointer"
          title="View Active Memory & Reminders"
        >
          <Bell className="w-4 h-4" />
          {remindersCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              style={{ backgroundColor: personality.themeColor }}
            >
              {remindersCount}
            </span>
          )}
        </button>

        {/* Auto Speak Toggle */}
        <button
          type="button"
          id="btn-header-autospeak"
          onClick={onToggleAutoSpeak}
          className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
            autoSpeak
              ? 'bg-white/[0.06] border-white/20 text-white'
              : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70'
          }`}
          title={autoSpeak ? 'Voice Synthesis Enabled' : 'Voice Muted'}
        >
          {autoSpeak ? (
            <Volume2 className="w-3.5 h-3.5" style={{ color: personality.themeColor }} />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-white/40" />
          )}
          <span className="hidden sm:inline font-mono text-[10px] tracking-wider uppercase">
            {autoSpeak ? 'VOICE ON' : 'MUTED'}
          </span>
        </button>

        {/* Clear dialogue */}
        <button
          type="button"
          id="btn-clear-history"
          onClick={onClearHistory}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.09] hover:border-rose-500/40 text-white/40 hover:text-rose-400 transition-all cursor-pointer"
          title="Reset Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

