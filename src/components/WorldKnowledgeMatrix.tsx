import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Globe,
  Compass,
  MapPin,
  Sparkles,
  Search,
  Volume2,
  ExternalLink,
  ChevronRight,
  Orbit,
  Mountain,
  History,
  Waves,
  Maximize2,
  RefreshCw,
  Info,
  X,
  Share2,
  Radio,
} from 'lucide-react';
import { WorldKnowledgeNode, WorldRealm, PersonalityMode } from '../types';
import { WORLD_KNOWLEDGE_NODES } from '../data/worldKnowledge';

interface WorldKnowledgeMatrixProps {
  currentMode: PersonalityMode;
  onAskSophia: (prompt: string) => void;
  isProcessing: boolean;
}

const REALM_TABS: { id: WorldRealm | 'all'; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'Whole Worlds', icon: Globe },
  { id: 'earth_wonders', label: 'Earth Wonders', icon: Mountain },
  { id: 'cosmic_planets', label: 'Cosmic Worlds', icon: Orbit },
  { id: 'civilizations', label: 'Civilizations', icon: History },
  { id: 'deep_frontiers', label: 'Deep Frontiers', icon: Waves },
];

export const WorldKnowledgeMatrix: React.FC<WorldKnowledgeMatrixProps> = ({
  currentMode,
  onAskSophia,
  isProcessing,
}) => {
  const [selectedRealm, setSelectedRealm] = useState<WorldRealm | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNode, setActiveNode] = useState<WorldKnowledgeNode | null>(WORLD_KNOWLEDGE_NODES[0]);
  const [deepScanLoading, setDeepScanLoading] = useState(false);
  const [deepScanResult, setDeepScanResult] = useState<{ content: string; sources: any[] } | null>(null);
  const [customWorldQuery, setCustomWorldQuery] = useState('');

  // 3D Canvas Globe State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef({ yaw: 0.3, pitch: 0.15 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return WORLD_KNOWLEDGE_NODES.filter((node) => {
      const matchesRealm = selectedRealm === 'all' || node.realm === selectedRealm;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        node.name.toLowerCase().includes(q) ||
        (node.subLocation && node.subLocation.toLowerCase().includes(q)) ||
        (node.nativeOrAlternateName && node.nativeOrAlternateName.toLowerCase().includes(q)) ||
        node.category.toLowerCase().includes(q) ||
        node.fascinatingFact.toLowerCase().includes(q);
      return matchesRealm && matchesQuery;
    });
  }, [selectedRealm, searchQuery]);

  // Deep AI Scan via /api/world-knowledge
  const handleDeepScan = async (node: WorldKnowledgeNode) => {
    setDeepScanLoading(true);
    setDeepScanResult(null);
    try {
      const response = await fetch('/api/world-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: node.name, realm: node.realm }),
      });
      const data = await response.json();
      if (data.success && data.content) {
        setDeepScanResult({
          content: data.content,
          sources: data.groundingSources || [],
        });
      }
    } catch (err) {
      console.error('Deep scan error:', err);
    } finally {
      setDeepScanLoading(false);
    }
  };

  // Ask Sophia Voice command
  const handleTriggerVoice = (node: WorldKnowledgeNode) => {
    const prompt = `Sophia, tell me all fascinating secrets and history of ${node.name} in your world knowledge!`;
    onAskSophia(prompt);
  };

  // Custom world knowledge query
  const handleCustomWorldSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWorldQuery.trim()) return;
    onAskSophia(`Explore world knowledge archive for: ${customWorldQuery.trim()}`);
    setCustomWorldQuery('');
  };

  // 3D Globe Vector Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      rotationRef.current.yaw += dx * 0.008;
      rotationRef.current.pitch = Math.max(-1.2, Math.min(1.2, rotationRef.current.pitch + dy * 0.008));
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch support for mobile/tablet
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMouseRef.current.x;
      const dy = e.touches[0].clientY - lastMouseRef.current.y;
      rotationRef.current.yaw += dx * 0.008;
      rotationRef.current.pitch = Math.max(-1.2, Math.min(1.2, rotationRef.current.pitch + dy * 0.008));
      lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Render loop
    const render = () => {
      if (!isDraggingRef.current) {
        rotationRef.current.yaw += 0.003; // Auto slow rotate
      }

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.42;

      ctx.clearRect(0, 0, width, height);

      // Sphere Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.25);
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.06)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Sphere Base Surface
      const baseGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      baseGrad.addColorStop(0, '#0f2922');
      baseGrad.addColorStop(0.7, '#071512');
      baseGrad.addColorStop(1, '#020606');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sphere Boundary Ring
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      const { yaw, pitch } = rotationRef.current;

      // Project 3D Lat/Lon to 2D
      const project = (latDeg: number, lonDeg: number) => {
        const phi = (latDeg * Math.PI) / 180;
        const theta = (lonDeg * Math.PI) / 180 + yaw;

        // Spherical to 3D Cartesian
        const x0 = Math.cos(phi) * Math.sin(theta);
        const y0 = Math.sin(phi);
        const z0 = Math.cos(phi) * Math.cos(theta);

        // Pitch rotation around X axis
        const y1 = y0 * Math.cos(pitch) - z0 * Math.sin(pitch);
        const z1 = y0 * Math.sin(pitch) + z0 * Math.cos(pitch);
        const x1 = x0;

        return {
          x: cx + x1 * radius,
          y: cy - y1 * radius,
          z: z1,
          visible: z1 > 0,
        };
      };

      // Draw Latitude Grids
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.14)';
      ctx.lineWidth = 0.8;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 10) {
          const pt = project(lat, lon);
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // Draw Longitude Grids
      for (let lon = -180; lon < 180; lon += 45) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 5) {
          const pt = project(lat, lon);
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // Draw Equator Highlight
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let startedEq = false;
      for (let lon = -180; lon <= 180; lon += 6) {
        const pt = project(0, lon);
        if (pt.visible) {
          if (!startedEq) {
            ctx.moveTo(pt.x, pt.y);
            startedEq = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        } else {
          startedEq = false;
        }
      }
      ctx.stroke();

      // Plot World Knowledge Nodes
      filteredNodes.forEach((node) => {
        const pt = project(node.coordinates.lat, node.coordinates.lng);
        if (!pt.visible) return;

        const isSelected = activeNode?.id === node.id;

        // Pulsing rings for selected
        if (isSelected) {
          const pulse = (Date.now() % 1500) / 1500;
          ctx.strokeStyle = `rgba(52, 211, 153, ${1 - pulse})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 7 + pulse * 14, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Marker Point
        ctx.fillStyle = isSelected ? '#10b981' : node.realm === 'cosmic_planets' ? '#f59e0b' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fill();

        // Label on hover or selected
        if (isSelected || pt.z > 0.6) {
          ctx.font = '10px monospace';
          ctx.fillStyle = isSelected ? '#34d399' : 'rgba(255,255,255,0.7)';
          ctx.fillText(node.name, pt.x + 8, pt.y + 3);
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [filteredNodes, activeNode]);

  // Icon helper
  const getNodeIcon = (node: WorldKnowledgeNode) => {
    switch (node.realm) {
      case 'earth_wonders':
        return '🏛️';
      case 'cosmic_planets':
        return '🪐';
      case 'civilizations':
        return '📜';
      case 'deep_frontiers':
        return '🌊';
      default:
        return '🌍';
    }
  };

  return (
    <div className="w-full flex flex-col gap-6" id="whole-worlds-matrix">
      {/* Top Banner & Omniscient Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/30 p-5 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Globe className="w-6 h-6 animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Worldwide Knowledge of the Whole Worlds
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  OMNISCIENT ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl font-light">
                Sophia&apos;s universal encyclopedic consciousness spans Earth wonders, ancient civilizations, deep oceanic abysses, and interplanetary celestial worlds.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/20 rounded-xl px-3.5 py-2 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-emerald-400/80">COVERAGE MATRIX</span>
              <span className="font-semibold text-white">195+ Nations &bull; Cosmic Moons &bull; 7 Wonders</span>
            </div>
          </div>
        </div>

        {/* Global Search & Ask Sophia Bar */}
        <form onSubmit={handleCustomWorldSearch} className="mt-4 flex gap-2 relative z-10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="world-knowledge-custom-search"
              type="text"
              value={customWorldQuery}
              onChange={(e) => setCustomWorldQuery(e.target.value)}
              placeholder="Ask Sophia to explore ANY country, planet, monument, or civilization (e.g. 'Machu Picchu', 'Saturn rings', 'Bermuda Triangle')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-emerald-500/30 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400 transition-colors shadow-inner"
            />
          </div>
          <button
            id="world-knowledge-query-btn"
            type="submit"
            disabled={isProcessing || !customWorldQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Search Whole Worlds</span>
          </button>
        </form>
      </div>

      {/* Main Dual-Panel Layout: 3D Vector Globe + Detailed World Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): 3D Globe Viewer & Realm Filters */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Realm Filters */}
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            {REALM_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedRealm === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`realm-tab-${tab.id}`}
                  type="button"
                  onClick={() => setSelectedRealm(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3D Globe Visualizer */}
          <div className="relative rounded-2xl bg-black/60 border border-emerald-500/20 p-4 flex flex-col items-center justify-center overflow-hidden shadow-xl min-h-[340px]">
            <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40 z-10">
              <Compass className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
              <span>SPHERICAL VECTOR MAP &bull; DRAG TO ROTATE</span>
            </div>

            <canvas
              ref={canvasRef}
              id="world-knowledge-canvas-globe"
              width={380}
              height={320}
              className="cursor-grab active:cursor-grabbing max-w-full drop-shadow-[0_0_25px_rgba(16,185,129,0.15)]"
            />

            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500">
              {filteredNodes.length} NODES PLOTTED
            </div>
          </div>

          {/* Search Node List Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="filter-node-list-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter current view landmarks..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Scrollable Node Cards Grid */}
          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
            {filteredNodes.map((node) => {
              const isSelected = activeNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  id={`node-item-${node.id}`}
                  onClick={() => {
                    setActiveNode(node);
                    setDeepScanResult(null);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getNodeIcon(node)}</span>
                      <h4 className="text-xs font-semibold text-white tracking-wide">{node.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-emerald-400/90 border border-emerald-900/50">
                      {node.subLocation || node.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 font-light">
                    {node.fascinatingFact}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 Cols): Active World Dossier */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {activeNode ? (
            <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-emerald-500/30 p-6 flex flex-col gap-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Header Dossier Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
                    {getNodeIcon(activeNode)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white tracking-tight">{activeNode.name}</h3>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {activeNode.realm.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {activeNode.subLocation || activeNode.category} &bull; {activeNode.eraOrScale}
                    </p>
                  </div>
                </div>

                {/* Voice Action Button */}
                <button
                  id="voice-narrate-btn"
                  type="button"
                  onClick={() => handleTriggerVoice(activeNode)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-50"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Ask Sophia to Speak</span>
                </button>
              </div>

              {/* Tagline & Coordinates Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono text-emerald-400/70 uppercase">Universal Position</span>
                  <span className="text-xs font-mono text-slate-200">
                    {activeNode.coordinates.lat.toFixed(4)}° N, {activeNode.coordinates.lng.toFixed(4)}° E {activeNode.coordinates.distanceOrAltitude ? `• ${activeNode.coordinates.distanceOrAltitude}` : ''}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono text-emerald-400/70 uppercase">Significance / Tagline</span>
                  <span className="text-xs text-slate-200 line-clamp-1 italic">
                    &quot;{activeNode.tagline}&quot;
                  </span>
                </div>
              </div>

              {/* Mind-Blowing Secret Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/40 flex flex-col gap-1.5 shadow-lg">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>MIND-BLOWING FACT &bull; ARCHIVE INTELLIGENCE</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-light">
                  {activeNode.fascinatingFact}
                </p>
              </div>

              {/* Encyclopedic Description */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                  Deep Overview
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {activeNode.description}
                </p>
              </div>

              {/* Metrics Grid */}
              {activeNode.metrics && Object.keys(activeNode.metrics).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(activeNode.metrics).map(([key, value]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex flex-col gap-0.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{key}</span>
                      <span className="text-xs font-semibold text-emerald-300">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Insights List */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                  Key Insights & Mysteries
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {activeNode.keyInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Scan with Gemini Live Intelligence */}
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-teal-400" />
                    Deep Satellite & Historical Grounding
                  </span>
                  <button
                    id="deep-scan-btn"
                    type="button"
                    onClick={() => handleDeepScan(activeNode)}
                    disabled={deepScanLoading}
                    className="px-3 py-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-700/60 text-teal-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${deepScanLoading ? 'animate-spin' : ''}`} />
                    <span>{deepScanLoading ? 'Scanning...' : 'Live Deep Scan'}</span>
                  </button>
                </div>

                {deepScanResult && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-teal-500/30 text-xs text-slate-200 flex flex-col gap-2">
                    <p className="leading-relaxed whitespace-pre-line font-light">
                      {deepScanResult.content}
                    </p>
                    {deepScanResult.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-teal-400 font-mono">Citations:</span>
                        {deepScanResult.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] bg-teal-900/40 hover:bg-teal-800 text-teal-300 px-2 py-0.5 rounded underline decoration-teal-500"
                          >
                            {src.title || 'Source'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full rounded-2xl bg-slate-900/40 border border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-500">
              <Globe className="w-12 h-12 mb-3 text-slate-700" />
              <p className="text-sm">Select any world node from the globe or list to inspect full dossier.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
