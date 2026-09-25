import React, { useState, useEffect, useRef } from 'react';
import {
  WebcamGestureDetector,
  GestureSensitivity,
  GestureMetrics,
  WaveEvent,
} from '../utils/gestureDetector';
import { PersonalityMode } from '../types';
import { PERSONALITIES } from '../data/personalities';
import {
  Hand,
  Camera,
  CameraOff,
  Pause,
  Play,
  Activity,
  Crosshair,
  Sliders,
  Sparkles,
  ShieldCheck,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  VolumeX,
  GraduationCap,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { GestureTutorialOverlay, SkeletalHandSVG } from './GestureTutorialOverlay';

interface WebcamGestureInterfaceProps {
  isSophiaPaused: boolean;
  onTogglePauseResume: (source?: 'gesture' | 'manual') => void;
  mode: PersonalityMode;
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const WebcamGestureInterface: React.FC<WebcamGestureInterfaceProps> = ({
  isSophiaPaused,
  onTogglePauseResume,
  mode,
  isEnabled,
  onToggleEnabled,
  isOpen,
  onToggleOpen,
}) => {
  const personality = PERSONALITIES[mode] || PERSONALITIES.girlfriend;
  const detectorRef = useRef<WebcamGestureDetector | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  const [sensitivity, setSensitivity] = useState<GestureSensitivity>('medium');
  const [metrics, setMetrics] = useState<GestureMetrics>({
    motionEnergy: 0,
    handDetected: false,
    centroidX: 0.5,
    centroidY: 0.5,
    isWaving: false,
    waveConfidence: 0,
    fps: 0,
    lastGestureTime: 0,
  });

  const [lastWaveNotification, setLastWaveNotification] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSoundFeedback, setIsSoundFeedback] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showGhostGuide, setShowGhostGuide] = useState(true);

  // Initialize or terminate webcam gesture detector based on enabled state
  useEffect(() => {
    let detector: WebcamGestureDetector | null = null;

    if (isEnabled) {
      setIsInitializing(true);
      setCameraError(null);
      detector = new WebcamGestureDetector(sensitivity);
      detectorRef.current = detector;

      detector.onMetrics = (newMetrics) => {
        setMetrics(newMetrics);
      };

      detector.onWave = (event: WaveEvent) => {
        // Flash HUD notification
        const actionText = isSophiaPaused ? 'RESUMED' : 'PAUSED';
        setLastWaveNotification(`👋 WAVE RECOGNIZED! SOPHIA ${actionText}`);
        setTimeout(() => setLastWaveNotification(null), 2500);

        // Trigger pause or resume
        onTogglePauseResume('gesture');
      };

      detector.onError = (err) => {
        setCameraError(err);
        setIsInitializing(false);
      };

      detector.onCameraStateChange = (active) => {
        setIsInitializing(false);
        if (active && detector) {
          const videoEl = detector.getVideoElement();
          if (videoEl && videoContainerRef.current) {
            // Mount the video element into the UI container
            videoContainerRef.current.innerHTML = '';
            videoEl.className = 'w-full h-full object-cover scale-x-[-1] opacity-75 contrast-125';
            videoContainerRef.current.appendChild(videoEl);
          }
        }
      };

      detector.start().then((success) => {
        setIsInitializing(false);
        if (!success) {
          onToggleEnabled(false);
        }
      });
    } else {
      if (detectorRef.current) {
        detectorRef.current.stop();
        detectorRef.current = null;
      }
      if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = '';
      }
    }

    return () => {
      if (detector) {
        detector.stop();
      }
    };
  }, [isEnabled]);

  // Sync sensitivity changes
  useEffect(() => {
    if (detectorRef.current) {
      detectorRef.current.setSensitivity(sensitivity);
    }
  }, [sensitivity]);

  const handleSimulateWave = () => {
    if (detectorRef.current) {
      detectorRef.current.simulateWave();
    } else {
      const actionText = isSophiaPaused ? 'RESUMED' : 'PAUSED';
      setLastWaveNotification(`👋 SIMULATED WAVE! SOPHIA ${actionText}`);
      setTimeout(() => setLastWaveNotification(null), 2500);
      onTogglePauseResume('gesture');
    }
  };

  return (
    <>
      {/* Floating Futuristic Sensor Bar / Pill Trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleOpen}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer text-xs font-semibold backdrop-blur-md shadow-md group ${
            isEnabled
              ? isSophiaPaused
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'bg-white/[0.04] border-white/10 text-white/60 hover:text-white hover:border-white/20'
          }`}
          title="Toggle Futuristic Gesture Control Panel"
        >
          <div className="relative flex items-center justify-center">
            <Hand
              className={`w-3.5 h-3.5 transition-transform group-hover:rotate-12 ${
                isEnabled
                  ? isSophiaPaused
                    ? 'text-amber-400'
                    : 'text-cyan-400 animate-pulse'
                  : 'text-white/40'
              }`}
            />
            {isEnabled && (
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                  isSophiaPaused ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-ping'
                }`}
              />
            )}
          </div>
          <span className="tracking-wide hidden sm:inline">Gesture Sensor</span>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded tracking-widest uppercase ${
              isEnabled
                ? isSophiaPaused
                  ? 'bg-amber-950/70 text-amber-200 border border-amber-500/40'
                  : 'bg-cyan-950/70 text-cyan-200 border border-cyan-500/40'
                : 'bg-white/10 text-white/40'
            }`}
          >
            {isEnabled ? (isSophiaPaused ? 'PAUSED' : 'ACTIVE') : 'OFF'}
          </span>
        </button>

        {/* Quick Manual Pause/Resume Fallback Button */}
        <button
          type="button"
          onClick={() => onTogglePauseResume('manual')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isSophiaPaused
              ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 hover:bg-amber-500/30'
              : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80'
          }`}
          title={isSophiaPaused ? 'Click to Resume Sophia' : 'Click to Pause Sophia'}
        >
          {isSophiaPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span className="text-[11px] text-amber-300 hidden md:inline">Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-white/60" />
              <span className="text-[11px] text-white/50 hidden md:inline">Pause</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded Cyberpunk Gesture HUD Modal / Drawer */}
      {isOpen && (
        <div
          id="gesture-hud-container"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) onToggleOpen();
          }}
        >
          <div
            className="w-full max-w-lg bg-[#080d14]/95 border rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col relative"
            style={{
              borderColor: isSophiaPaused ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.4)',
              boxShadow: isSophiaPaused
                ? '0 20px 60px -10px rgba(245, 158, 11, 0.3), 0 0 30px rgba(245, 158, 11, 0.15)'
                : '0 20px 60px -10px rgba(6, 182, 212, 0.3), 0 0 30px rgba(6, 182, 212, 0.15)',
            }}
          >
            {/* Top Sci-Fi Header */}
            <div className="px-4 py-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Hand className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-white">
                      Futuristic Hand Gesture Interface
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                      OPTICAL-FLOW
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-300/70 font-light">
                    Wave your hand across the webcam to Pause / Resume Sophia
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Skeletal Tutorial Button */}
                <button
                  type="button"
                  id="btn-open-gesture-tutorial"
                  onClick={() => setIsTutorialOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-semibold transition cursor-pointer shadow-sm group"
                  title="Open Skeletal Hand Tracking Wave Tutorial"
                >
                  <GraduationCap className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">Tutorial Guide</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleOpen}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gesture Detection Notification Flash */}
            {lastWaveNotification && (
              <div className="w-full bg-gradient-to-r from-pink-600/90 via-purple-600/90 to-cyan-600/90 text-white font-bold text-xs py-2 px-4 text-center tracking-wider animate-bounce shadow-lg flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{lastWaveNotification}</span>
              </div>
            )}

            {/* Camera Viewport & Cyberpunk Scanner */}
            <div className="relative w-full aspect-video bg-black/90 overflow-hidden flex items-center justify-center border-b border-cyan-500/20 group">
              {/* Internal Video Element Container */}
              <div ref={videoContainerRef} className="absolute inset-0 w-full h-full" />

              {/* Holographic Cyberpunk Scanner Overlays */}
              {isEnabled && !cameraError && (
                <>
                  {/* Scanline Grid */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Animated Vertical Laser Sweep Line */}
                  <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-pulse pointer-events-none" />

                  {/* HUD Corner Tech Brackets */}
                  <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none shadow-[0_0_8px_#06b6d4]" />
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none shadow-[0_0_8px_#06b6d4]" />
                  <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none shadow-[0_0_8px_#06b6d4]" />
                  <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none shadow-[0_0_8px_#06b6d4]" />

                  {/* Real-Time Motion Reticle Tracking Hand Position */}
                  {metrics.handDetected && (
                    <div
                      className="absolute pointer-events-none transition-all duration-75 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                      style={{
                        // Mirror horizontal coordinate since webcam preview is mirrored
                        left: `${(1 - metrics.centroidX) * 100}%`,
                        top: `${metrics.centroidY * 100}%`,
                      }}
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-cyan-400/80 animate-ping opacity-60" />
                      <div className="absolute w-10 h-10 rounded-full border border-pink-400 flex items-center justify-center shadow-[0_0_12px_#ec4899]">
                        <Crosshair className="w-5 h-5 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
                      </div>
                      <span className="absolute -bottom-5 text-[9px] font-mono px-1 py-0.2 rounded bg-black/80 text-cyan-300 whitespace-nowrap border border-cyan-500/40">
                        TRACKING HAND
                      </span>
                    </div>
                  )}

                  {/* Telemetry HUD Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
                    <div className="flex items-center gap-1.5 pointer-events-none">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span>FPS: {metrics.fps || 30}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        <span>ENERGY: {Math.round(metrics.motionEnergy * 100)}%</span>
                      </div>
                    </div>

                    {/* Toggle Ghost Alignment Guide Button */}
                    <button
                      type="button"
                      onClick={() => setShowGhostGuide(!showGhostGuide)}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 hover:bg-black/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 transition cursor-pointer shadow-md w-fit"
                      title="Toggle augmented reality skeletal hand alignment guide on live camera"
                    >
                      {showGhostGuide ? (
                        <Eye className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-white/40" />
                      )}
                      <span>{showGhostGuide ? 'GHOST GUIDE: ON' : 'GHOST GUIDE: OFF'}</span>
                    </button>
                  </div>

                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1 pointer-events-none z-20">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shadow-lg ${
                        isSophiaPaused
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      }`}
                    >
                      {isSophiaPaused ? '⏸️ SOPHIA PAUSED' : '▶️ SOPHIA RUNNING'}
                    </span>
                  </div>

                  {/* On-Camera Augmented Reality Holographic Skeletal Ghost Alignment Guide */}
                  {showGhostGuide && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                      <div
                        className="w-36 h-36 sm:w-44 sm:h-44 relative transition-transform duration-75 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.7)] opacity-75"
                        style={{
                          transform: `translateX(${Math.sin(Date.now() / 400) * 45}px) rotate(${Math.sin(Date.now() / 400) * 8}deg)`,
                        }}
                      >
                        <SkeletalHandSVG
                          strokeColor="#06b6d4"
                          jointColor="#ffffff"
                          glowColor="#22d3ee"
                          accentJoints
                        />
                      </div>
                      <div className="absolute bottom-7 px-3 py-1 rounded-full bg-black/80 border border-cyan-400/40 text-[10px] font-mono text-cyan-200 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                        <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
                        <span>ALIGN OPEN PALM &amp; SWEEP SIDE-TO-SIDE</span>
                      </div>
                    </div>
                  )}

                  {/* Bottom Motion Energy Wave Bar */}
                  <div className="absolute bottom-2 inset-x-3 pointer-events-none flex flex-col gap-1 z-20">
                    <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300/80">
                      <span>WAVE ENERGY LEVEL</span>
                      <span>{metrics.handDetected ? 'HAND IN FRAME' : 'AWAITING WAVE'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 transition-all duration-75"
                        style={{ width: `${Math.min(100, Math.round(metrics.motionEnergy * 100))}%` }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Camera Offline / Disabled State */}
              {!isEnabled && (
                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40">
                    <CameraOff className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Gesture Sensor Standby</h4>
                    <p className="text-xs text-white/50 max-w-xs mt-1">
                      Activate the webcam sensor to pause/resume Sophia with a simple hand wave.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleEnabled(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Initialize Sensor</span>
                  </button>
                </div>
              )}

              {/* Error Notice */}
              {cameraError && isEnabled && (
                <div className="flex flex-col items-center justify-center gap-2.5 p-6 text-center z-10 bg-black/80">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                    <X className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-rose-300 font-medium max-w-sm">{cameraError}</p>
                  <button
                    type="button"
                    onClick={handleSimulateWave}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                  >
                    Simulate Wave Instead
                  </button>
                </div>
              )}
            </div>

            {/* Futuristic Controller Deck */}
            <div className="p-4 flex flex-col gap-3 bg-black/40">
              {/* Primary Interaction Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Wave Trigger Simulation */}
                <button
                  type="button"
                  onClick={handleSimulateWave}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition shadow-sm cursor-pointer group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-125 transition-transform" />
                  <span>Test Wave Gesture</span>
                </button>

                {/* Direct Pause / Resume Toggle */}
                <button
                  type="button"
                  onClick={() => onTogglePauseResume('manual')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition shadow-sm cursor-pointer ${
                    isSophiaPaused
                      ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 hover:bg-amber-500/35'
                      : 'bg-white/[0.05] border-white/15 text-white hover:bg-white/10'
                  }`}
                >
                  {isSophiaPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span>Resume Sophia</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-white" />
                      <span>Pause Sophia</span>
                    </>
                  )}
                </button>
              </div>

              {/* Skeletal Tutorial Banner Action */}
              <button
                type="button"
                id="btn-open-tutorial-banner"
                onClick={() => setIsTutorialOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-950/60 via-blue-950/50 to-indigo-950/60 hover:from-cyan-900/60 hover:to-indigo-900/60 border border-cyan-500/40 text-cyan-200 text-xs font-semibold transition cursor-pointer shadow-sm group"
              >
                <GraduationCap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Open Skeletal Hand Wave Tutorial &amp; Practice Guide</span>
              </button>

              {/* Sensor Configuration Matrix */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
                {/* Sensitivity Selector */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Sliders className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[11px] text-white/60 font-medium">Sensitivity:</span>
                  <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    {(['low', 'medium', 'high'] as GestureSensitivity[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSensitivity(level)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase transition cursor-pointer ${
                          sensitivity === level
                            ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold'
                            : 'text-white/40 hover:text-white'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sensor Power Toggle */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleEnabled(!isEnabled)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      isEnabled
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                        : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <CameraOff className="w-3.5 h-3.5" />
                        <span>Turn Off Sensor</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Turn On Sensor</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Privacy Reassurance Note */}
              <div className="flex items-center gap-2 text-[10px] text-white/40 bg-white/[0.02] p-2 rounded-xl border border-white/[0.05]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  100% In-Browser Optical Flow. No camera feeds or images are ever uploaded or stored.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holographic Skeletal Hand Wave Gesture Tutorial Modal */}
      <GestureTutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        metrics={metrics}
        isSophiaPaused={isSophiaPaused}
        onSimulateWave={handleSimulateWave}
        isCameraActive={isEnabled && !cameraError}
        onActivateCamera={() => onToggleEnabled(true)}
      />
    </>
  );
};
