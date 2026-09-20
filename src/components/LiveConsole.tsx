import React, { useRef, useEffect } from 'react';
import { ChatMessage, PersonalityMode } from '../types';
import { PERSONALITIES } from '../data/personalities';
import {
  Volume2,
  Globe,
  CheckSquare,
  Activity,
  Shuffle,
  Clock,
  Sparkles,
  Bot,
  User,
  Compass,
  MapPin,
  Orbit,
} from 'lucide-react';

interface LiveConsoleProps {
  messages: ChatMessage[];
  currentMode: PersonalityMode;
  isProcessing: boolean;
  onReplayAudio: (text: string, mode: PersonalityMode) => void;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({
  messages,
  currentMode,
  isProcessing,
  onReplayAudio,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const personality = PERSONALITIES[currentMode] || PERSONALITIES.girlfriend;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const renderToolBadge = (tool: any, idx = 0) => {
    const badgeKey = tool.id ? `${tool.id}-${idx}` : `tool-${tool.toolName}-${idx}`;
    switch (tool.toolName) {
      case 'exploreWorldKnowledge':
        return (
          <div
            key={badgeKey}
            id={`tool-badge-${tool.id || idx}`}
            className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-cyan-950/50 border border-emerald-500/40 text-xs text-emerald-100 flex flex-col gap-1.5 shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center justify-between font-semibold text-emerald-300">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '12s' }} />
                <span>Whole Worlds Knowledge: &quot;{tool.args?.query}&quot;</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                {tool.args?.realm || 'Universal'}
              </span>
            </div>
            {tool.result?.summary && (
              <p className="text-slate-200 text-[11px] leading-relaxed font-light">
                {tool.result.summary}
              </p>
            )}
            {tool.result?.groundingSources?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1 pt-1 border-t border-emerald-800/40">
                <span className="text-[10px] text-emerald-400/70 font-mono">Archive Sources:</span>
                {tool.result.groundingSources.slice(0, 3).map((src: any, idx: number) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded underline decoration-emerald-500 transition-colors"
                  >
                    {src.title || 'World Registry'}
                  </a>
                ))}
              </div>
            )}
          </div>
        );

      case 'webSearch':
        return (
          <div
            key={badgeKey}
            id={`tool-badge-${tool.id || idx}`}
            className="mt-2 p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 font-semibold text-blue-400">
              <Globe className="w-3.5 h-3.5" />
              <span>Web Search Executed: &quot;{tool.args?.query}&quot;</span>
            </div>
            {tool.result?.summary && (
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {tool.result.summary}
              </p>
            )}
            {tool.result?.groundingSources?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tool.result.groundingSources.slice(0, 3).map((src: any, srcIdx: number) => (
                  <a
                    key={`${src.url || 'src'}-${srcIdx}`}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] bg-blue-900/60 hover:bg-blue-800 text-blue-300 px-2 py-0.5 rounded underline decoration-blue-500"
                  >
                    {src.title || 'Source'}
                  </a>
                ))}
              </div>
            )}
          </div>
        );

      case 'manageTasks':
        return (
          <div
            key={badgeKey}
            id={`tool-badge-${tool.id || idx}`}
            className="mt-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>
                Task {tool.args?.action === 'add' ? 'Added' : 'Updated'}: &quot;
                {tool.args?.taskText || 'Task Item'}&quot;
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
              {tool.args?.priority || 'medium'}
            </span>
          </div>
        );

      case 'getSystemDiagnostics':
        return (
          <div
            key={badgeKey}
            id={`tool-badge-${tool.id || idx}`}
            className="mt-2 p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/60 text-xs text-purple-200 flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between font-semibold text-purple-300">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                Live System Diagnostics
              </span>
              <span className="text-[10px] font-mono bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded">
                STATUS: {tool.result?.status || 'OPTIMAL'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
              <div>CPU: {tool.result?.cpuUsage ?? 15}%</div>
              <div>RAM: {tool.result?.memoryUsedMb ?? 128} MB</div>
              <div>Ping: {tool.result?.pingMs ?? 22}ms</div>
            </div>
          </div>
        );

      case 'switchPersonalityMode':
        return (
          <div
            key={badgeKey}
            id={`tool-badge-${tool.id || idx}`}
            className="mt-2 p-2 rounded-lg bg-pink-950/40 border border-pink-800/60 text-xs text-pink-200 flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4 text-pink-400" />
            <span>Personality Mode Switched to <strong>{tool.args?.mode?.toUpperCase()}</strong></span>
          </div>
        );

      case 'setReminder':
        return (
          <div
            key={badgeKey}
            id={`tool-badge-${tool.id || idx}`}
            className="mt-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Reminder Set: &quot;{tool.args?.title}&quot; ({tool.args?.timeStr})</span>
          </div>
        );

      default:
        return (
          <div key={badgeKey} className="mt-2 text-xs text-slate-400 italic">
            Executed tool: {tool.toolName}
          </div>
        );
    }
  };

  return (
    <div
      id="sophia-live-console"
      className="w-full h-full flex flex-col immersive-widget overflow-hidden shadow-2xl"
    >
      {/* Console Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: personality.themeColor }}
          />
          <span className="immersive-label">
            Live Voice Dialogue Feed
          </span>
        </div>
        <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase">
          Neural Audio Engine
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[420px] sm:max-h-[500px]">
        {messages.map((msg) => {
          const isSophia = msg.role === 'assistant';
          const msgPersonality = PERSONALITIES[msg.mode] || personality;

          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`flex gap-3 ${isSophia ? 'justify-start' : 'justify-end'}`}
            >
              {isSophia && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border"
                  style={{
                    backgroundColor: `${msgPersonality.themeColor}22`,
                    borderColor: `${msgPersonality.themeColor}66`,
                    color: msgPersonality.themeColor,
                  }}
                >
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-[78%] flex flex-col ${isSophia ? 'items-start' : 'items-end'}`}>
                {/* Speaker Label */}
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: isSophia ? msgPersonality.themeColor : undefined }}>
                      {isSophia ? `Sophia • ${msgPersonality.name}` : 'You'}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono font-light">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {isSophia && (msg.thinkingEngine || msg.relayActive) && (
                    <div className="flex items-center gap-1.5 font-mono text-[9px]">
                      {msg.relayActive ? (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                          OPENAI ➔ ELEVENLABS RELAY
                        </span>
                      ) : msg.thinkingEngine === 'openai' ? (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {msg.thinkingModel || 'GPT-4O'} THINKING
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed ${
                    isSophia
                      ? 'bg-white/[0.04] border border-white/[0.09] text-white rounded-tl-sm backdrop-blur-xl'
                      : 'bg-white/[0.1] border border-white/20 text-white rounded-tr-sm backdrop-blur-xl shadow-lg'
                  }`}
                  style={
                    isSophia
                      ? {
                          borderColor: `${msgPersonality.themeColor}44`,
                          boxShadow: `0 4px 24px -4px ${msgPersonality.glowColor}`,
                        }
                      : undefined
                  }
                >
                  <p className="whitespace-pre-wrap font-light tracking-wide text-white/95">
                    {msg.content}
                  </p>

                  {/* Render any executed tools */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      {msg.toolCalls.map((t, idx) => renderToolBadge(t, idx))}
                    </div>
                  )}

                  {/* Audio Replay Button for Sophia's speech */}
                  {isSophia && (
                    <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between">
                      <button
                        id={`btn-replay-${msg.id}`}
                        onClick={() => onReplayAudio(msg.spokenText || msg.content, msg.mode)}
                        className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] cursor-pointer"
                        title="Replay Voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" style={{ color: msgPersonality.themeColor }} />
                        <span className="text-[11px] font-mono uppercase tracking-wider">Replay</span>
                      </button>
                      <span className="text-[10px] text-white/35 font-mono">Spoken output</span>
                    </div>
                  )}
                </div>
              </div>

              {!isSophia && (
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center border animate-spin"
              style={{
                borderColor: personality.themeColor,
                backgroundColor: `${personality.themeColor}22`,
                color: personality.themeColor,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.09] text-xs text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: personality.themeColor }} />
              <span className="font-mono tracking-wide">Sophia is thinking & executing tools...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
