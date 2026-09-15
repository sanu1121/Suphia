import React from 'react';
import { PersonalityMode } from '../types';
import { PERSONALITIES } from '../data/personalities';
import { Heart, Cpu, Sparkles, Compass, Flame, AudioWaveform } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: PersonalityMode;
  onSelectMode: (mode: PersonalityMode) => void;
  disabled?: boolean;
  onOpenVoiceMode?: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  disabled = false,
  onOpenVoiceMode,
}) => {
  const modes: PersonalityMode[] = ['girlfriend', 'assistant', 'friend', 'mentor', 'waifu'];

  const getIcon = (mode: PersonalityMode) => {
    switch (mode) {
      case 'girlfriend':
        return <Heart className="w-4 h-4" />;
      case 'assistant':
        return <Cpu className="w-4 h-4" />;
      case 'friend':
        return <Sparkles className="w-4 h-4" />;
      case 'mentor':
        return <Compass className="w-4 h-4" />;
      case 'waifu':
        return <Flame className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span className="immersive-label">
          Personality Modes
        </span>
        <div className="flex items-center gap-2">
          {onOpenVoiceMode && (
            <button
              type="button"
              onClick={onOpenVoiceMode}
              className="text-[10px] font-semibold text-pink-300 hover:text-pink-200 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer"
              title="Open Voice Mode Studio"
            >
              <AudioWaveform className="w-3 h-3 text-pink-400 animate-pulse" />
              <span>Voice Mode</span>
            </button>
          )}
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">5 Modes Online</span>
        </div>
      </div>

      <div
        id="sophia-mode-selector-grid"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5"
      >
        {modes.map((modeKey) => {
          const config = PERSONALITIES[modeKey];
          const isSelected = currentMode === modeKey;

          return (
            <button
              key={modeKey}
              id={`mode-btn-${modeKey}`}
              onClick={() => onSelectMode(modeKey)}
              disabled={disabled}
              className={`relative group px-3.5 py-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer backdrop-blur-xl ${
                isSelected
                  ? 'bg-white/[0.07] border-white/30 shadow-lg scale-[1.02]'
                  : 'bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/20'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                borderColor: isSelected ? config.themeColor : undefined,
                boxShadow: isSelected ? `0 0 20px ${config.glowColor}` : undefined,
              }}
            >
              {/* Active mode accent glow line */}
              {isSelected && (
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: config.themeColor }}
                />
              )}

              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className="p-1.5 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: isSelected ? `${config.themeColor}33` : 'rgba(255,255,255,0.05)',
                    color: isSelected ? config.themeColor : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {getIcon(modeKey)}
                </div>
                {isSelected && (
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase"
                    style={{
                      backgroundColor: config.themeColor,
                      color: '#ffffff',
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-white tracking-wider uppercase">
                  {config.name}
                </div>
                <div className="text-[10px] text-white/45 line-clamp-1 mt-0.5 font-light">
                  {config.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
