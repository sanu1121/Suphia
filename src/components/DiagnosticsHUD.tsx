import React from 'react';
import { DiagnosticMetrics, PersonalityMode } from '../types';
import { PERSONALITIES } from '../data/personalities';
import { Activity, Cpu, Server, Wifi, Clock, RefreshCw, Zap } from 'lucide-react';

interface DiagnosticsHUDProps {
  diagnostics: DiagnosticMetrics;
  mode: PersonalityMode;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const DiagnosticsHUD: React.FC<DiagnosticsHUDProps> = ({
  diagnostics,
  mode,
  onRefresh,
  isLoading = false,
}) => {
  const personality = PERSONALITIES[mode] || PERSONALITIES.girlfriend;

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
  };

  return (
    <div
      id="sophia-diagnostics-hud"
      className="w-full immersive-widget p-4 sm:p-5 flex flex-col h-full shadow-2xl"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pink-500" />
          <h3 className="immersive-label">
            Operational Health & Telemetry
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border tracking-widest uppercase"
            style={{
              borderColor: `${personality.themeColor}88`,
              backgroundColor: `${personality.themeColor}22`,
              color: personality.themeColor,
            }}
          >
            {diagnostics.status}
          </span>
          <button
            type="button"
            id="btn-refresh-diagnostics"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Refresh Diagnostics"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* CPU Load */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-white/50 font-light">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-pink-400" /> CPU Load
            </span>
            <span className="font-mono text-white font-semibold">{diagnostics.cpuUsage}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1 mt-2.5 overflow-hidden">
            <div
              className="h-full bg-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, diagnostics.cpuUsage)}%` }}
            />
          </div>
        </div>

        {/* Memory Allocation */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-white/50 font-light">
            <span className="flex items-center gap-1.5">
              <Server className="w-3 h-3 text-white/60" /> Heap RAM
            </span>
            <span className="font-mono text-white font-semibold">{diagnostics.memoryUsedMb} MB</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1 mt-2.5 overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (diagnostics.memoryUsedMb / 512) * 100)}%` }}
            />
          </div>
        </div>

        {/* Network Ping */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-white/50 font-light">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-emerald-400" /> Latency
            </span>
            <span className="font-mono text-emerald-400 font-semibold">{diagnostics.pingMs}ms</span>
          </div>
          <div className="text-[9px] text-white/30 font-mono mt-2 tracking-wider">
            AUDIO SYNC: {diagnostics.audioEngineLatencyMs}ms
          </div>
        </div>

        {/* Node Uptime */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-white/50 font-light">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-pink-400" /> Uptime
            </span>
            <span className="font-mono text-white font-semibold">
              {formatUptime(diagnostics.uptimeSeconds)}
            </span>
          </div>
          <div className="text-[9px] text-white/30 font-mono mt-2 flex items-center gap-1 tracking-wider">
            <Zap className="w-2.5 h-2.5 text-pink-400" /> CORE NOMINAL
          </div>
        </div>
      </div>
    </div>
  );
};
