import React from 'react';
import { PersonalityMode } from '../types';
import { QUICK_VOICE_PROMPTS, QUICK_HINDI_VOICE_PROMPTS, PERSONALITIES } from '../data/personalities';
import { MessageSquareCode, Sparkles } from 'lucide-react';

interface QuickPromptsProps {
  mode: PersonalityMode;
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
  hindiSound?: boolean;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  mode,
  onSelectPrompt,
  disabled = false,
  hindiSound = false,
}) => {
  const promptList = hindiSound
    ? QUICK_HINDI_VOICE_PROMPTS[mode] || QUICK_HINDI_VOICE_PROMPTS.girlfriend
    : QUICK_VOICE_PROMPTS[mode] || QUICK_VOICE_PROMPTS.girlfriend;
  const personality = PERSONALITIES[mode] || PERSONALITIES.girlfriend;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3 h-3" style={{ color: personality.themeColor }} />
        <span className="immersive-label">
          {hindiSound ? 'त्वरित वॉयस सुझाव (Hindi Voice Prompts)' : `Quick Triggers • ${personality.name}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {promptList.map((prompt, idx) => (
          <button
            key={idx}
            id={`quick-prompt-${idx}`}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            disabled={disabled}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.03] border border-white/[0.08] hover:border-white/25 hover:bg-white/[0.06] text-white/70 hover:text-white transition-all duration-200 hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md"
          >
            <MessageSquareCode className="w-3 h-3 text-white/40" />
            <span className="font-light tracking-wide">&quot;{prompt}&quot;</span>
          </button>
        ))}
      </div>
    </div>
  );
};
