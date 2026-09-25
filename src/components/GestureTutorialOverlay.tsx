import React, { useState, useEffect } from 'react';
import { GestureMetrics } from '../utils/gestureDetector';
import {
  Hand,
  CheckCircle2,
  ArrowLeftRight,
  Sparkles,
  HelpCircle,
  X,
  Play,
  RotateCcw,
  ShieldCheck,
  Eye,
  Sliders,
  Camera,
} from 'lucide-react';

interface GestureTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: GestureMetrics;
  isSophiaPaused: boolean;
  onSimulateWave: () => void;
  isCameraActive: boolean;
  onActivateCamera: () => void;
}

// 21 Anatomical Skeletal Hand Landmarks (normalized 0 to 1 space for base hand pose)
const HAND_LANDMARKS = {
  wrist: { x: 0.5, y: 0.88 },
  // Thumb
  thumbCmc: { x: 0.42, y: 0.76 },
  thumbMcp: { x: 0.35, y: 0.65 },
  thumbIp: { x: 0.30, y: 0.54 },
  thumbTip: { x: 0.25, y: 0.46 },
  // Index
  indexMcp: { x: 0.42, y: 0.56 },
  indexPip: { x: 0.40, y: 0.40 },
  indexDip: { x: 0.39, y: 0.28 },
  indexTip: { x: 0.38, y: 0.18 },
  // Middle
  middleMcp: { x: 0.50, y: 0.54 },
  middlePip: { x: 0.50, y: 0.37 },
  middleDip: { x: 0.50, y: 0.24 },
  middleTip: { x: 0.50, y: 0.14 },
  // Ring
  ringMcp: { x: 0.58, y: 0.56 },
  ringPip: { x: 0.60, y: 0.40 },
  ringDip: { x: 0.61, y: 0.28 },
  ringTip: { x: 0.62, y: 0.18 },
  // Pinky
  pinkyMcp: { x: 0.66, y: 0.60 },
  pinkyPip: { x: 0.70, y: 0.48 },
  pinkyDip: { x: 0.72, y: 0.38 },
  pinkyTip: { x: 0.74, y: 0.29 },
};

// Skeletal bone connections (pairs of landmark names)
const BONE_SEGMENTS: Array<[keyof typeof HAND_LANDMARKS, keyof typeof HAND_LANDMARKS]> = [
  // Thumb chain
  ['wrist', 'thumbCmc'],
  ['thumbCmc', 'thumbMcp'],
  ['thumbMcp', 'thumbIp'],
  ['thumbIp', 'thumbTip'],
  // Index chain
  ['wrist', 'indexMcp'],
  ['indexMcp', 'indexPip'],
  ['indexPip', 'indexDip'],
  ['indexDip', 'indexTip'],
  // Middle chain
  ['wrist', 'middleMcp'],
  ['middleMcp', 'middlePip'],
  ['middlePip', 'middleDip'],
  ['middleDip', 'middleTip'],
  // Ring chain
  ['wrist', 'ringMcp'],
  ['ringMcp', 'ringPip'],
  ['ringPip', 'ringDip'],
  ['ringDip', 'ringTip'],
  // Pinky chain
  ['wrist', 'pinkyMcp'],
  ['pinkyMcp', 'pinkyPip'],
  ['pinkyPip', 'pinkyDip'],
  ['pinkyDip', 'pinkyTip'],
  // Metacarpal palm arch
  ['thumbCmc', 'indexMcp'],
  ['indexMcp', 'middleMcp'],
  ['middleMcp', 'ringMcp'],
  ['ringMcp', 'pinkyMcp'],
];

export const GestureTutorialOverlay: React.FC<GestureTutorialOverlayProps> = ({
  isOpen,
  onClose,
  metrics,
  isSophiaPaused,
  onSimulateWave,
  isCameraActive,
  onActivateCamera,
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [tutorialStep, setTutorialStep] = useState<1 | 2 | 3>(1);
  const [practiceSuccess, setPracticeSuccess] = useState(false);

  // Dynamic animation clock for the holographic skeletal hand wave simulation
  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      setAnimationPhase(elapsed);
      animId = requestAnimationFrame(render);
    };

    if (isOpen) {
      animId = requestAnimationFrame(render);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen]);

  // Track user practice progress live based on real camera metrics
  useEffect(() => {
    if (!isOpen) return;

    if (metrics.handDetected && tutorialStep === 1) {
      setTutorialStep(2);
    } else if (metrics.motionEnergy > 0.08 && tutorialStep === 2) {
      setTutorialStep(3);
    }

    if (metrics.isWaving) {
      setPracticeSuccess(true);
      const timer = setTimeout(() => {
        setPracticeSuccess(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [metrics, isOpen, tutorialStep]);

  if (!isOpen) return null;

  // Calculate animated position of the tutorial skeletal hand (sinusoidal horizontal sweep)
  // Sweeps between x: -50px and +50px with natural rotational tilt
  const waveCycle = Math.sin(animationPhase * 2.8);
  const handSweepX = waveCycle * 65; // Horizontal offset in pixels
  const handTiltDeg = waveCycle * 14; // Degrees of wrist deflection
  const trailGhostX1 = Math.sin((animationPhase - 0.08) * 2.8) * 65;
  const trailGhostX2 = Math.sin((animationPhase - 0.16) * 2.8) * 65;

  return (
    <div
      id="gesture-tutorial-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#070b12] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_25px_70px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] relative">
        {/* Top Holographic Navigation Bar */}
        <div className="px-5 py-3.5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/50 via-indigo-950/40 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Hand className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Hand Wave Gesture Guide
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/40">
                  SKELETAL TRACKING
                </span>
              </div>
              <p className="text-[11px] text-cyan-300/70 font-light">
                Master the futuristic wave gesture to pause and resume Sophia seamlessly
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Practice Banner */}
        {practiceSuccess && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>PERFECT WAVE! Gesture detected and Sophia toggled successfully!</span>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
          {/* Main Visualizer Deck: Animated Skeletal Hand Visualizer */}
          <div className="w-full rounded-2xl bg-gradient-to-b from-[#09101c] to-[#04070c] border border-cyan-500/30 p-4 sm:p-6 relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
            {/* Cyberpunk Grid Background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(6, 182, 212, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.25) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* Sweep Direction Range Arc Guides */}
            <div className="absolute top-4 inset-x-8 flex items-center justify-between text-[10px] font-mono text-cyan-400/60 pointer-events-none">
              <span className="flex items-center gap-1">
                <span>◀ LEFT BOUND</span>
              </span>
              <div className="flex-1 mx-4 h-[1px] bg-gradient-to-r from-cyan-500/20 via-cyan-400/60 to-cyan-500/20 relative">
                <div
                  className="absolute -top-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] -translate-x-1/2"
                  style={{ left: `${50 + waveCycle * 42}%` }}
                />
              </div>
              <span className="flex items-center gap-1">
                <span>RIGHT BOUND ▶</span>
              </span>
            </div>

            {/* Skeletal Hand Animated SVG Canvas */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
              {/* Trail Ghost 2 (Pink/Purple) */}
              <div
                className="absolute inset-0 transition-transform duration-75 opacity-15 pointer-events-none"
                style={{
                  transform: `translateX(${trailGhostX2}px) rotate(${handTiltDeg * 0.5}deg)`,
                }}
              >
                <SkeletalHandSVG strokeColor="#ec4899" jointColor="#f472b6" glowColor="#db2777" />
              </div>

              {/* Trail Ghost 1 (Cyan) */}
              <div
                className="absolute inset-0 transition-transform duration-75 opacity-30 pointer-events-none"
                style={{
                  transform: `translateX(${trailGhostX1}px) rotate(${handTiltDeg * 0.75}deg)`,
                }}
              >
                <SkeletalHandSVG strokeColor="#06b6d4" jointColor="#38bdf8" glowColor="#0284c7" />
              </div>

              {/* Main Primary Skeletal Hand */}
              <div
                className="absolute inset-0 transition-transform duration-75 pointer-events-none filter drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                style={{
                  transform: `translateX(${handSweepX}px) rotate(${handTiltDeg}deg)`,
                }}
              >
                <SkeletalHandSVG
                  strokeColor="#22d3ee"
                  jointColor="#ffffff"
                  glowColor="#06b6d4"
                  accentJoints
                />
              </div>

              {/* Holographic Motion Wave Sweep Guidance Indicator */}
              <div className="absolute -bottom-1 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md shadow-lg">
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>
                  {waveCycle > 0.3 ? 'SWEEPING RIGHT ➔' : waveCycle < -0.3 ? '◀ SWEEPING LEFT' : 'REVERSING DIRECTION'}
                </span>
              </div>
            </div>

            {/* Bottom Trajectory Cadence Legend */}
            <div className="mt-2 text-center">
              <span className="text-xs font-semibold text-white tracking-wide">
                Optimal Motion: Continuous 2-phase sweep (Left ↔ Right ↔ Left)
              </span>
              <p className="text-[11px] text-white/50 mt-0.5">
                Approx. 0.8–1.2 seconds across a 12–18 inch horizontal span
              </p>
            </div>
          </div>

          {/* 3 Step Interactive Checklist & Live Tracking Validation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                metrics.handDetected
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                  STEP 01
                </span>
                {metrics.handDetected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Position Hand</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Raise an open palm 1.5–2.5 feet directly in front of the webcam at chest height.
              </p>
              <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40">SENSOR STATUS:</span>
                <span className={metrics.handDetected ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
                  {metrics.handDetected ? '✓ HAND DETECTED' : 'AWAITING HAND'}
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                metrics.motionEnergy > 0.06
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                  STEP 02
                </span>
                {metrics.motionEnergy > 0.06 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Smooth Sweep</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Wave your hand horizontally from side to side in a smooth, fluid arc.
              </p>
              <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40">MOTION ENERGY:</span>
                <span className="text-cyan-300 font-bold">{Math.round(metrics.motionEnergy * 100)}%</span>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                metrics.isWaving || practiceSuccess
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                  STEP 03
                </span>
                {metrics.isWaving || practiceSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Reverse Direction</h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Oscillate back (at least 2 direction reversals). Sophia will pause or resume instantly!
              </p>
              <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40">SOPHIA STATE:</span>
                <span className={isSophiaPaused ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'}>
                  {isSophiaPaused ? '⏸️ PAUSED' : '▶️ RESUMED'}
                </span>
              </div>
            </div>
          </div>

          {/* Pro Tips Bar */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Tip:</strong> Keep fingers loosely spread rather than balled in a fist. Good frontal lighting ensures instant recognition.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onSimulateWave}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title="Test how Sophia toggles when a wave is recognized"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Wave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% In-Browser Optical Flow • Completely Private</span>
          </div>

          <div className="flex items-center gap-2">
            {!isCameraActive && (
              <button
                type="button"
                onClick={onActivateCamera}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Turn On Camera</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Practice in App</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Holographic Skeletal Hand SVG Component (renders 21 anatomical nodes and laser bone lines)
interface SkeletalHandSVGProps {
  strokeColor: string;
  jointColor: string;
  glowColor: string;
  accentJoints?: boolean;
}

export const SkeletalHandSVG: React.FC<SkeletalHandSVGProps> = ({
  strokeColor,
  jointColor,
  glowColor,
  accentJoints = false,
}) => {
  // SVG Viewbox coordinates: 0 0 200 240
  const scaleX = (val: number) => val * 200;
  const scaleY = (val: number) => val * 240;

  return (
    <svg viewBox="0 0 200 240" className="w-full h-full overflow-visible">
      <defs>
        <filter id={`glow-${glowColor}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Laser Bones */}
      <g stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" filter={`url(#glow-${glowColor})`}>
        {BONE_SEGMENTS.map(([startKey, endKey], idx) => {
          const start = HAND_LANDMARKS[startKey];
          const end = HAND_LANDMARKS[endKey];
          return (
            <line
              key={idx}
              x1={scaleX(start.x)}
              y1={scaleY(start.y)}
              x2={scaleX(end.x)}
              y2={scaleY(end.y)}
              opacity="0.85"
            />
          );
        })}
      </g>

      {/* Palm Translucent Webbing Matrix */}
      <polygon
        points={`
          ${scaleX(HAND_LANDMARKS.wrist.x)},${scaleY(HAND_LANDMARKS.wrist.y)}
          ${scaleX(HAND_LANDMARKS.thumbCmc.x)},${scaleY(HAND_LANDMARKS.thumbCmc.y)}
          ${scaleX(HAND_LANDMARKS.indexMcp.x)},${scaleY(HAND_LANDMARKS.indexMcp.y)}
          ${scaleX(HAND_LANDMARKS.middleMcp.x)},${scaleY(HAND_LANDMARKS.middleMcp.y)}
          ${scaleX(HAND_LANDMARKS.ringMcp.x)},${scaleY(HAND_LANDMARKS.ringMcp.y)}
          ${scaleX(HAND_LANDMARKS.pinkyMcp.x)},${scaleY(HAND_LANDMARKS.pinkyMcp.y)}
        `}
        fill={strokeColor}
        fillOpacity="0.08"
        stroke={strokeColor}
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* Joint Nodes */}
      <g>
        {Object.entries(HAND_LANDMARKS).map(([key, pos]) => {
          const isFingertip = key.endsWith('Tip');
          const isWrist = key === 'wrist';
          const r = isFingertip ? 4.5 : isWrist ? 5 : 3.5;

          return (
            <g key={key}>
              {/* Outer Glowing Halo */}
              <circle
                cx={scaleX(pos.x)}
                cy={scaleY(pos.y)}
                r={r + 3}
                fill={glowColor}
                fillOpacity={accentJoints ? (isFingertip ? '0.45' : '0.25') : '0.2'}
              />
              {/* Core Luminous Joint */}
              <circle
                cx={scaleX(pos.x)}
                cy={scaleY(pos.y)}
                r={r}
                fill={isFingertip ? '#ffffff' : jointColor}
                stroke={strokeColor}
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
