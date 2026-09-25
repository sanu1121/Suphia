import React, { useState, useEffect, useRef } from 'react';
import { PersonalityMode, SpeechSentiment } from '../types';
import { PERSONALITIES } from '../data/personalities';
import { SENTIMENT_CONFIGS } from '../utils/sentiment';
import { Mic, Volume2, Sparkles, Radio, AudioWaveform, Activity, Waves, Pause, Hand } from 'lucide-react';
import { audioService } from '../utils/audio';

interface HolographicOrbProps {
  mode: PersonalityMode;
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isPaused?: boolean;
  onOrbClick?: () => void;
  currentSentiment?: SpeechSentiment;
}

export const HolographicOrb: React.FC<HolographicOrbProps> = ({
  mode,
  isSpeaking,
  isListening,
  isProcessing,
  isPaused = false,
  onOrbClick,
  currentSentiment = 'calm',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const innerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const personality = PERSONALITIES[mode] || PERSONALITIES.girlfriend;

  // Real-time audio metrics for HUD overlay
  const [audioMetrics, setAudioMetrics] = useState({
    active: false,
    peakDb: -60,
    avgFreq: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    peakHz: 0,
  });

  // Manage Web Audio API AnalyserNode lifecycle based on listening state
  useEffect(() => {
    let isMounted = true;
    if (isListening) {
      audioService.startMicAnalyser(128).then((analyser) => {
        if (isMounted && analyser) {
          analyserRef.current = analyser;
          setAudioMetrics((prev) => ({ ...prev, active: true }));
        }
      });
    } else {
      audioService.stopMicAnalyser();
      analyserRef.current = null;
      setAudioMetrics({
        active: false,
        peakDb: -60,
        avgFreq: 0,
        bass: 0,
        mid: 0,
        treble: 0,
        peakHz: 0,
      });
    }

    return () => {
      isMounted = false;
      if (isListening) {
        audioService.stopMicAnalyser();
      }
    };
  }, [isListening]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let frameCount = 0;

    // Resize canvas to match display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const innerCanvas = innerCanvasRef.current;
      if (innerCanvas) {
        const innerRect = innerCanvas.getBoundingClientRect();
        innerCanvas.width = innerRect.width * dpr;
        innerCanvas.height = innerRect.height * dpr;
        const innerCtx = innerCanvas.getContext('2d');
        if (innerCtx) {
          innerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle nodes for holographic field
    const numParticles = 48;
    const particles: Array<{
      angle: number;
      distance: number;
      speed: number;
      size: number;
      baseAlpha: number;
      phase: number;
    }> = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        angle: (i / numParticles) * Math.PI * 2,
        distance: 50 + Math.random() * 65,
        speed: (0.005 + Math.random() * 0.01) * (i % 2 === 0 ? 1 : -1),
        size: 1 + Math.random() * 2.2,
        baseAlpha: 0.2 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      time += 0.03;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Extract real-time frequency data if mic is listening
      const analyser = analyserRef.current;
      const bufferLength = analyser ? analyser.frequencyBinCount : 64;
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      let avgEnergy = 0;
      let peakValue = 0;
      let peakIndex = 0;

      if (isListening && analyser) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = freqData[i];
          sum += val;
          if (val > peakValue) {
            peakValue = val;
            peakIndex = i;
          }
        }
        avgEnergy = sum / bufferLength;
      } else if (isListening) {
        // Subtle acoustic simulation wave during mic handshake
        for (let i = 0; i < bufferLength; i++) {
          freqData[i] = Math.floor(
            (Math.sin(time * 5 + i * 0.25) * 0.5 + 0.5) * 50 +
            (Math.cos(time * 3 + i * 0.5) * 0.5 + 0.5) * 30
          );
          timeData[i] = Math.floor(128 + Math.sin(time * 6 + i * 0.3) * 15);
        }
        avgEnergy = 35;
      }

      const normalizedEnergy = avgEnergy / 255;

      // Update state for HUD display periodically (every 6 frames ~ 100ms)
      frameCount++;
      if (isListening && frameCount % 6 === 0) {
        const bassSum = (freqData[0] + freqData[1] + freqData[2] + freqData[3]) / 4;
        const midSum = (freqData[8] + freqData[12] + freqData[16] + freqData[20]) / 4;
        const trebleSum = (freqData[30] + freqData[36] + freqData[42] + freqData[48]) / 4;
        const dbVal = 20 * Math.log10(Math.max(avgEnergy, 0.5) / 255);

        setAudioMetrics({
          active: !!analyser,
          peakDb: Math.max(-60, dbVal),
          avgFreq: Math.round(avgEnergy),
          bass: Math.round(bassSum),
          mid: Math.round(midSum),
          treble: Math.round(trebleSum),
          peakHz: Math.round(peakIndex * (24000 / bufferLength)),
        });
      }

      // Intensity multipliers
      let energyMultiplier = 1.0;
      if (isSpeaking) energyMultiplier = 2.4;
      else if (isListening) energyMultiplier = 1.6 + normalizedEnergy * 1.5;
      else if (isProcessing) energyMultiplier = 1.6;

      const sentimentConfig = SENTIMENT_CONFIGS[currentSentiment] || SENTIMENT_CONFIGS.calm;
      const baseColor = isSpeaking ? sentimentConfig.primaryColor : personality.themeColor;

      // 1. Ambient Background Glow
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        Math.min(centerX, centerY) * 0.95
      );
      const glowAlpha = isListening
        ? Math.floor((0.25 + normalizedEnergy * 0.35) * 255).toString(16).padStart(2, '0')
        : '44';
      bgGrad.addColorStop(0, `${baseColor}${glowAlpha}`);
      bgGrad.addColorStop(0.4, `${baseColor}18`);
      bgGrad.addColorStop(0.8, `${baseColor}05`);
      bgGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(centerX, centerY) * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Holographic Energy Rings
      const numRings = 3;
      for (let r = 0; r < numRings; r++) {
        const ringRadius = 60 + r * 28 + Math.sin(time * 2 + r) * (4 * energyMultiplier);
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `${baseColor}${Math.floor((0.15 + (isSpeaking ? 0.3 : 0.1)) * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1 + (r === 1 ? 1 : 0);
        ctx.setLineDash(r % 2 === 0 ? [8, 12] : [4, 6]);
        ctx.lineDashOffset = (time * 15 * (r % 2 === 0 ? 1 : -1));
        ctx.stroke();
        ctx.restore();
      }

      // 3. Orbital Arc Rotations
      for (let a = 0; a < 2; a++) {
        const arcRadius = 78 + a * 20;
        const startAngle = time * (a === 0 ? 0.8 : -0.6);
        const arcLength = Math.PI * (0.6 + Math.sin(time + a) * 0.2);

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, arcRadius, startAngle, startAngle + arcLength);
        ctx.strokeStyle = `${baseColor}${isProcessing ? 'dd' : '77'}`;
        ctx.lineWidth = 2;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // 4. SOUNDWAVE OVERLAY: Real-Time Mic Input Frequency Visualizer
      if (isListening) {
        // --- 4A. Radial 360° Soundwave Frequency Spikes (Equalizer Crown) ---
        const numSpikes = 54;
        const baseRadius = 72 + Math.sin(time * 2) * 2;
        const outerWavePoints: Array<{ x: number; y: number }> = [];

        for (let s = 0; s < numSpikes; s++) {
          const angle = (s / numSpikes) * Math.PI * 2 - Math.PI / 2;
          // Symmetrical mapping around circumference: voice fundamentals bloom smoothly
          const bin = s < numSpikes / 2
            ? Math.floor((s / (numSpikes / 2)) * (bufferLength * 0.75))
            : Math.floor(((numSpikes - s) / (numSpikes / 2)) * (bufferLength * 0.75));
          const freqVal = freqData[bin] || 0;
          const spikeLength = 6 + (freqVal / 255) * 50 * (1 + normalizedEnergy * 0.8);

          const innerX = centerX + Math.cos(angle) * baseRadius;
          const innerY = centerY + Math.sin(angle) * baseRadius;
          const outerX = centerX + Math.cos(angle) * (baseRadius + spikeLength);
          const outerY = centerY + Math.sin(angle) * (baseRadius + spikeLength);
          outerWavePoints.push({ x: outerX, y: outerY });

          // Draw Soundwave Frequency Pin
          ctx.save();
          const spikeGrad = ctx.createLinearGradient(innerX, innerY, outerX, outerY);
          spikeGrad.addColorStop(0, `${baseColor}55`);
          spikeGrad.addColorStop(0.5, '#10b981cc');
          spikeGrad.addColorStop(1, '#ffffff');

          ctx.beginPath();
          ctx.moveTo(innerX, innerY);
          ctx.lineTo(outerX, outerY);
          ctx.strokeStyle = spikeGrad;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = freqVal > 60 ? 14 : 4;
          ctx.stroke();

          // Luminous tip dot
          ctx.beginPath();
          ctx.arc(outerX, outerY, 1.4 + (freqVal / 255) * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = freqVal > 110 ? '#ffffff' : '#34d399';
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }

        // --- 4B. Closed Fluid Soundwave Ribbon ---
        if (outerWavePoints.length > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(outerWavePoints[0].x, outerWavePoints[0].y);
          for (let i = 1; i < outerWavePoints.length; i++) {
            const prev = outerWavePoints[i - 1];
            const curr = outerWavePoints[i];
            const midX = (prev.x + curr.x) / 2;
            const midY = (prev.y + curr.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
          }
          const last = outerWavePoints[outerWavePoints.length - 1];
          const first = outerWavePoints[0];
          ctx.quadraticCurveTo(last.x, last.y, first.x, first.y);
          ctx.closePath();

          ctx.strokeStyle = '#34d399ee';
          ctx.lineWidth = 2.2;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 16;
          ctx.stroke();

          // Translucent gradient fill responding to voice volume
          const ribbonGrad = ctx.createRadialGradient(centerX, centerY, baseRadius, centerX, centerY, baseRadius + 45);
          ribbonGrad.addColorStop(0, `${baseColor}08`);
          ribbonGrad.addColorStop(0.6, `rgba(16, 185, 129, ${0.15 + normalizedEnergy * 0.25})`);
          ribbonGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = ribbonGrad;
          ctx.fill();
          ctx.restore();
        }

        // --- 4C. Concentric Soundwave Shockwaves on Voice Detection ---
        if (avgEnergy > 30) {
          const wavePhase = (time * 75) % 70;
          const shockRadius = baseRadius + 18 + wavePhase;
          const shockAlpha = Math.max(0, 0.45 * (1 - wavePhase / 70));
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(52, 211, 153, ${shockAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 7]);
          ctx.stroke();
          ctx.restore();
        }

        // --- 4D. Real-time Oscilloscope Waveform Orbit ---
        ctx.save();
        ctx.beginPath();
        const oscRadius = 62;
        const oscSegments = 36;
        for (let o = 0; o <= oscSegments; o++) {
          const angle = (o / oscSegments) * Math.PI * 2;
          const sampleIdx = Math.floor((o / oscSegments) * bufferLength);
          const tVal = (timeData[sampleIdx] - 128) / 128;
          const r = oscRadius + tVal * 14;
          const ox = centerX + Math.cos(angle) * r;
          const oy = centerY + Math.sin(angle) * r;
          if (o === 0) ctx.moveTo(ox, oy);
          else ctx.lineTo(ox, oy);
        }
        ctx.closePath();
        ctx.strokeStyle = '#6ee7b7aa';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // --- 4E. Inner Glass Core Real-Time Soundwave Canvas ---
        const innerCanvas = innerCanvasRef.current;
        if (innerCanvas) {
          const innerCtx = innerCanvas.getContext('2d');
          if (innerCtx) {
            const iw = innerCanvas.getBoundingClientRect().width;
            const ih = innerCanvas.getBoundingClientRect().height;
            innerCtx.clearRect(0, 0, iw, ih);

            // 14-band live mini EQ spectrum
            const miniBars = 14;
            const gap = 2;
            const barW = Math.max(2, (iw - (miniBars - 1) * gap) / miniBars);
            for (let b = 0; b < miniBars; b++) {
              const binIdx = Math.floor((b / miniBars) * bufferLength * 0.75);
              const bVal = freqData[binIdx] || 0;
              const barH = Math.max(2.5, (bVal / 255) * (ih - 5));
              const bx = b * (barW + gap);
              const by = ih - barH;

              const barGrad = innerCtx.createLinearGradient(0, by, 0, ih);
              barGrad.addColorStop(0, '#34d399');
              barGrad.addColorStop(1, '#065f46');
              innerCtx.fillStyle = barGrad;
              innerCtx.fillRect(bx, by, barW, barH);

              // Luminous peak cap
              innerCtx.fillStyle = '#ffffff';
              innerCtx.fillRect(bx, by - 1.5, barW, 1.5);
            }

            // Real-time oscilloscope audio wave trace across mini canvas
            innerCtx.beginPath();
            const sliceW = iw / bufferLength;
            for (let t = 0; t < bufferLength; t++) {
              const tv = (timeData[t] - 128) / 128;
              const tx = t * sliceW;
              const ty = ih / 2 + tv * (ih * 0.45);
              if (t === 0) innerCtx.moveTo(tx, ty);
              else innerCtx.lineTo(tx, ty);
            }
            innerCtx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            innerCtx.lineWidth = 1;
            innerCtx.stroke();
          }
        }
      } else if (isSpeaking) {
        // Waveform Oscillation if Speaking
        ctx.save();
        ctx.beginPath();
        const wavePoints = 40;
        const waveRadius = 72;
        for (let i = 0; i <= wavePoints; i++) {
          const angle = (i / wavePoints) * Math.PI * 2;
          const offset = Math.sin(angle * 6 + time * 8) * (8 * energyMultiplier) +
            Math.cos(angle * 3 - time * 5) * 4;
          const r = waveRadius + offset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `${baseColor}bb`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // 5. Floating Holographic Particles
      particles.forEach((p) => {
        p.angle += p.speed * (isSpeaking ? 2 : isListening ? 1.5 : 1);
        const dynamicDistance = p.distance + Math.sin(time * 3 + p.phase) * (6 * energyMultiplier);
        const px = centerX + Math.cos(p.angle) * dynamicDistance;
        const py = centerY + Math.sin(p.angle) * dynamicDistance;

        const alpha = Math.min(1, Math.max(0.1, p.baseAlpha * (0.6 + Math.sin(time * 2 + p.phase) * 0.4)));

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, p.size * (isSpeaking ? 1.3 : 1), 0, Math.PI * 2);
        ctx.fillStyle = `${baseColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      // 6. Glowing Inner Core Orb
      const corePulse = Math.sin(time * 3) * (isSpeaking ? 8 : isListening ? 4 + normalizedEnergy * 8 : 3);
      const coreRadius = 46 + corePulse;

      const coreGrad = ctx.createRadialGradient(
        centerX - 8,
        centerY - 8,
        5,
        centerX,
        centerY,
        coreRadius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, isListening ? '#10b981' : baseColor);
      coreGrad.addColorStop(0.8, isListening ? '#04785799' : `${baseColor}99`);
      coreGrad.addColorStop(1, `${baseColor}11`);

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = isListening ? '#10b981' : baseColor;
      ctx.shadowBlur = 24 * (isSpeaking ? 1.6 : isListening ? 1.3 + normalizedEnergy * 0.8 : 1);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, isSpeaking, isListening, isProcessing, personality]);

  return (
    <div
      id="sophia-holographic-orb-container"
      className="relative flex flex-col items-center justify-center cursor-pointer select-none group"
      onClick={onOrbClick}
      title="Click to interact with Sophia"
    >
      {/* Soundwave Overlay Header HUD Badge */}
      {isListening && (
        <div
          id="soundwave-overlay-hud"
          className="absolute -top-7 z-30 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/90 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono shadow-2xl backdrop-blur-xl animate-fadeIn tracking-wider select-none pointer-events-none"
          style={{
            boxShadow: '0 0 24px rgba(16, 185, 129, 0.35)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-semibold text-white tracking-widest text-[10px]">
              SOUNDWAVE OVERLAY
            </span>
          </div>
          <span className="text-white/30 text-[10px]">|</span>
          <span className="text-[10px] text-emerald-400">
            {audioMetrics.active ? 'WEB AUDIO ANALYSER' : 'MIC ACTIVE'}
          </span>
          <span className="text-white/30 text-[10px]">|</span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-white/50 text-[9px]">LEVEL:</span>
            <span className="font-bold text-emerald-300">
              {audioMetrics.peakDb > -58 ? `${audioMetrics.peakDb.toFixed(1)} dB` : '-INF'}
            </span>
          </div>
        </div>
      )}

      {/* Center Dynamic Status Orb Core */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
        {/* Deep ambient halo glow */}
        <div
          className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full pointer-events-none transition-all duration-700"
          style={{
            backgroundColor: isListening ? '#10b981' : personality.themeColor,
            filter: 'blur(80px)',
            opacity: isSpeaking ? 0.35 : isListening ? 0.35 : 0.2,
          }}
        />

        {/* Concentric Wave Rings (Immersive Theme) */}
        <div
          className="absolute inset-4 sm:inset-6 rounded-full border border-white/[0.08] pointer-events-none transition-all duration-700 scale-95"
          style={{
            borderColor: isSpeaking
              ? `${personality.themeColor}55`
              : isListening
              ? 'rgba(16, 185, 129, 0.4)'
              : 'rgba(255, 255, 255, 0.08)',
          }}
        />
        <div
          className={`absolute inset-8 sm:inset-12 rounded-full border pointer-events-none transition-all duration-500 ${
            isSpeaking
              ? 'animate-pulse scale-100'
              : isListening
              ? 'animate-pulse opacity-50 scale-102'
              : 'opacity-40'
          }`}
          style={{
            borderColor: isListening ? '#10b981' : personality.themeColor,
            boxShadow: `0 0 20px ${isListening ? 'rgba(16, 185, 129, 0.4)' : personality.glowColor}`,
          }}
        />

        {/* Dynamic Canvas Particle Waves & 360° Soundwave Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Center Orb Core (Immersive Theme Glass Core) */}
        <div
          className={`relative z-20 w-36 h-36 sm:w-44 sm:h-44 rounded-full border flex flex-col items-center justify-center transition-all duration-500 backdrop-blur-xl ${
            isSpeaking
              ? 'scale-105 shadow-2xl'
              : isListening
              ? 'scale-105 shadow-2xl border-emerald-400/50'
              : 'group-hover:scale-102 border-white/20'
          }`}
          style={{
            backgroundColor: 'rgba(5, 5, 5, 0.88)',
            borderColor: isListening
              ? '#10b981'
              : isSpeaking
              ? personality.themeColor
              : 'rgba(255, 255, 255, 0.18)',
            boxShadow: `0 0 45px ${isListening ? 'rgba(16, 185, 129, 0.4)' : personality.glowColor}`,
          }}
        >
          {/* Status Label & Soundwave Waveform */}
          <div className="text-center flex flex-col items-center gap-1.5 px-3 w-full">
            {isListening ? (
              <div className="flex flex-col items-center gap-1 w-full animate-fadeIn">
                <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] font-semibold text-emerald-400 uppercase">
                  <AudioWaveform className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>LISTENING</span>
                </div>

                {/* Real-Time Live Mini-Visualizer Canvas */}
                <canvas
                  ref={innerCanvasRef}
                  className="w-24 sm:w-28 h-7 my-0.5 pointer-events-none"
                />

                <div className="text-[9px] tracking-wider font-mono text-emerald-300/80 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{audioMetrics.peakDb > -58 ? `${audioMetrics.peakDb.toFixed(0)} dB` : 'LIVE MIC'}</span>
                  <span>•</span>
                  <span>FFT 128</span>
                </div>
              </div>
            ) : isPaused ? (
              <>
                <div className="text-[10px] tracking-[0.2em] font-bold text-amber-400 uppercase flex items-center gap-1">
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSED</span>
                </div>

                <div className="flex items-center gap-1.5 my-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40">
                  <Hand className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  <span className="text-[9px] font-mono text-amber-200">WAVE TO RESUME</span>
                </div>

                <div className="text-[9px] tracking-widest font-mono text-white/40">
                  TAP OR WAVE HAND
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] tracking-[0.2em] font-semibold text-white/50 uppercase">
                  {isProcessing
                    ? 'PROCESSING'
                    : isSpeaking
                    ? 'SPEAKING'
                    : `${personality.name.toUpperCase()}`}
                </div>

                {/* Core Animated Indicator */}
                {isProcessing ? (
                  <Sparkles className="w-5 h-5 animate-spin my-1" style={{ color: personality.themeColor }} />
                ) : isSpeaking ? (
                  <div className="flex items-center gap-1 h-5 my-0.5">
                    <span className="w-1 h-3 rounded-full animate-pulse" style={{ backgroundColor: personality.themeColor }} />
                    <span className="w-1 h-5 rounded-full animate-pulse delay-75" style={{ backgroundColor: personality.themeColor }} />
                    <span className="w-1 h-4 rounded-full animate-pulse delay-150" style={{ backgroundColor: personality.themeColor }} />
                    <span className="w-1 h-2 rounded-full animate-pulse delay-100" style={{ backgroundColor: personality.themeColor }} />
                  </div>
                ) : (
                  <div
                    className="w-10 h-[2px] rounded-full mx-auto my-1 transition-all duration-500"
                    style={{ backgroundColor: personality.themeColor }}
                  />
                )}

                <div className="text-[9px] tracking-widest font-mono text-white/35">
                  {isSpeaking ? 'NEURAL TTS' : 'TAP TO TALK'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mode Status Pill */}
      <div
        id="sophia-orb-status-badge"
        className="mt-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border backdrop-blur-md transition-all duration-300 flex items-center gap-2"
        style={{
          backgroundColor: isPaused
            ? 'rgba(245, 158, 11, 0.2)'
            : isListening
            ? 'rgba(16, 185, 129, 0.15)'
            : `${personality.themeColor}18`,
          borderColor: isPaused
            ? 'rgba(245, 158, 11, 0.5)'
            : isListening
            ? 'rgba(16, 185, 129, 0.4)'
            : `${personality.themeColor}55`,
          color: '#ffffff',
          boxShadow: `0 0 16px ${
            isPaused
              ? 'rgba(245, 158, 11, 0.35)'
              : isListening
              ? 'rgba(16, 185, 129, 0.3)'
              : personality.glowColor
          }`,
        }}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isPaused
              ? 'bg-amber-400 animate-ping'
              : isSpeaking
              ? 'animate-ping'
              : isListening
              ? 'animate-pulse bg-emerald-400'
              : 'bg-white'
          }`}
          style={{
            backgroundColor: isPaused
              ? '#f59e0b'
              : isListening
              ? '#10b981'
              : personality.themeColor,
          }}
        />
        <span>
          {isPaused
            ? '⏸️ Sophia Paused (Wave to Resume)'
            : isProcessing
            ? 'Sophia Processing...'
            : isSpeaking
            ? 'Sophia Speaking'
            : isListening
            ? 'Listening to your voice...'
            : `${personality.name} Mode Active`}
        </span>
      </div>

      {/* Real-time Frequency Spectrum Band Meter (Bass / Voice / Treble) */}
      {isListening && (
        <div
          id="soundwave-frequency-bands-hud"
          className="mt-2 flex items-center gap-3.5 px-3.5 py-1 rounded-xl bg-black/70 border border-emerald-500/30 text-[10px] font-mono text-white/80 backdrop-blur-md shadow-lg animate-fadeIn"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-white/40 text-[9px] uppercase">Bass</span>
            <div className="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: `${Math.min(100, (audioMetrics.bass / 255) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 text-[9px] uppercase font-semibold">Voice</span>
            <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-300 transition-all duration-75"
                style={{ width: `${Math.min(100, (audioMetrics.mid / 255) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/40 text-[9px] uppercase">High</span>
            <div className="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 transition-all duration-75"
                style={{ width: `${Math.min(100, (audioMetrics.treble / 255) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
