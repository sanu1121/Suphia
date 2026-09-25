import React, { useState } from 'react';
import {
  Music,
  Image as ImageIcon,
  Video,
  Mic,
  Globe,
  MapPin,
  Sparkles,
  X,
  Play,
  Pause,
  Download,
  Send,
  Loader2,
  RefreshCw,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';
import { MusicTrack, GeneratedMedia } from '../types';
import { saveCreationToFirestore } from '../firebase';

interface MultimodalStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (text: string) => void;
  currentUserId?: string;
}

export const MultimodalStudioModal: React.FC<MultimodalStudioModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState<'music' | 'image' | 'video' | 'transcribe' | 'grounding'>('music');

  // Music State (Lyria)
  const [musicPrompt, setMusicPrompt] = useState('Uplifting ambient chill synthwave with gentle piano and warm bassline');
  const [musicGenre, setMusicGenre] = useState('ambient');
  const [musicDuration, setMusicDuration] = useState<30 | 60>(30);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Image State (Nano Banana 2)
  const [imagePrompt, setImagePrompt] = useState('Futuristic cyberpunk holographic sanctuary surrounded by bioluminescent cherry blossoms, 4K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('16:9');
  const [editInstruction, setEditInstruction] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedMedia | null>(null);

  // Video State (Veo 3)
  const [videoPrompt, setVideoPrompt] = useState('Cinematic aerial shot soaring over neon illuminated crystal floating islands at golden hour');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<any | null>(null);

  // Transcribe State (Gemini 3.5 Transcribe)
  const [transcribeInput, setTranscribeInput] = useState('');
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);

  // Grounding State (Google Search & Maps)
  const [groundingQuery, setGroundingQuery] = useState('Latest technological milestones in humanoid robotics and neural AI');
  const [groundingType, setGroundingType] = useState<'search' | 'maps'>('search');
  const [isGroundingLoading, setIsGroundingLoading] = useState(false);
  const [groundingResult, setGroundingResult] = useState<{ text: string; sources?: any[] } | null>(null);

  if (!isOpen) return null;

  // Handle Music Generation (Lyria)
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() || isGeneratingMusic) return;
    setIsGeneratingMusic(true);
    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt, genre: musicGenre, duration: musicDuration }),
      });
      const data = await res.json();
      if (data.success && data.track) {
        setCurrentTrack(data.track);
        if (currentUserId) {
          saveCreationToFirestore(currentUserId, {
            id: data.track.id || `music_${Date.now()}`,
            userId: currentUserId,
            type: 'music',
            title: data.track.title || 'Lyria AI Composition',
            prompt: musicPrompt,
            mediaUrl: data.track.audioUrl || data.track.audioBase64 || '',
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error('Failed to generate music:', err);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Handle Image Generation (Nano Banana 2)
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio,
          editInstruction: editInstruction.trim() || undefined,
          sourceImage: generatedImage?.url,
        }),
      });
      const data = await res.json();
      if (data.success && data.media) {
        setGeneratedImage(data.media);
        if (currentUserId) {
          saveCreationToFirestore(currentUserId, {
            id: data.media.id || `img_${Date.now()}`,
            userId: currentUserId,
            type: 'image',
            title: 'Nano Banana 2 Artwork',
            prompt: imagePrompt,
            mediaUrl: data.media.url || '',
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle Video Generation (Veo 3)
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;
    setIsGeneratingVideo(true);
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: '16:9',
          sourceImage: generatedImage?.url,
        }),
      });
      const data = await res.json();
      if (data.success && data.video) {
        setGeneratedVideo(data.video);
        if (currentUserId) {
          saveCreationToFirestore(currentUserId, {
            id: data.video.id || `video_${Date.now()}`,
            userId: currentUserId,
            type: 'video',
            title: 'Veo 3 Cinematic Scene',
            prompt: videoPrompt,
            mediaUrl: data.video.url || '',
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error('Failed to generate video:', err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Handle Grounding Search / Maps
  const handleRunGrounding = async () => {
    if (!groundingQuery.trim() || isGroundingLoading) return;
    setIsGroundingLoading(true);
    try {
      const endpoint = groundingType === 'search' ? '/api/grounding-search' : '/api/grounding-maps';
      const body = groundingType === 'search' ? { query: groundingQuery } : { locationQuery: groundingQuery };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setGroundingResult({
          text: data.answer || data.details,
          sources: data.sources,
        });
      }
    } catch (err) {
      console.error('Grounding query failed:', err);
    } finally {
      setIsGroundingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div
        id="multimodal-studio-dialog"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-amber-500/20 border border-white/10 text-white">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Sophia Multimodal AI Studio</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  CREATIVE SUITE
                </span>
              </div>
              <p className="text-xs text-white/50">
                Lyria AI Music • Nano Banana 2 (Imagen) • Veo 3 Video • Grounding • Gemini 3.5 Transcribe
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-white/10 bg-black/40 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
              activeTab === 'music'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Music className="w-4 h-4 text-amber-400" />
            <span>AI Music (Lyria)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
              activeTab === 'image'
                ? 'bg-pink-500/20 border-pink-500/50 text-pink-300 font-semibold shadow-sm'
                : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span>Image Studio (Nano Banana 2)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
              activeTab === 'video'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold shadow-sm'
                : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Video className="w-4 h-4 text-purple-400" />
            <span>Cinematic Video (Veo 3)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grounding')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
              activeTab === 'grounding'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm'
                : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Search & Maps Grounding</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transcribe')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
              activeTab === 'transcribe'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold shadow-sm'
                : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>Transcribe (Gemini 3.5)</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI MUSIC GENERATION (LYRIA) */}
          {activeTab === 'music' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-amber-200 text-sm flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" />
                    Google Lyria Music Engine (lyria-3-clip-preview)
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Compose high-fidelity AI music clips, thematic backing soundtracks, and ambient soundscapes tailored to Sophia's conversations.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-amber-300/80 px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30 shrink-0 self-start sm:self-center">
                  LYRIA V3 ACTIVE
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  Musical Prompt & Mood Description
                </label>
                <textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition"
                  placeholder="e.g. Uplifting serene acoustic guitar with soft violins, rain ambient backdrop, emotional melody"
                />
              </div>

              {/* Genre and Duration Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                    Musical Genre
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['ambient', 'lofi', 'synthwave', 'orchestral', 'serenade', 'edm'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setMusicGenre(g)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-medium capitalize border transition cursor-pointer ${
                          musicGenre === g
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                    Clip Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { sec: 30, label: '30s Clip (Lyria Clip)' },
                      { sec: 60, label: '60s Track (Lyria Pro)' },
                    ].map((d) => (
                      <button
                        key={d.sec}
                        type="button"
                        onClick={() => setMusicDuration(d.sec as any)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          musicDuration === d.sec
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateMusic}
                  disabled={isGeneratingMusic}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg cursor-pointer transition disabled:opacity-50"
                >
                  {isGeneratingMusic ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Composing Track with Lyria...</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4" />
                      <span>Generate Music Track</span>
                    </>
                  )}
                </button>
              </div>

              {/* Track Player Display */}
              {currentTrack && (
                <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{currentTrack.title}</h4>
                      <p className="text-xs text-amber-300 font-mono">
                        Genre: {currentTrack.genre} • {currentTrack.bpm} BPM • {currentTrack.durationSeconds}s
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      GENERATED
                    </span>
                  </div>

                  {/* Audio Frequency Simulation Waveform */}
                  <div className="flex items-center justify-center gap-1 h-8 bg-amber-500/10 rounded-xl px-4 py-1">
                    {Array.from({ length: 32 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="w-1 rounded-full bg-amber-400 transition-all duration-150"
                        style={{
                          height: `${Math.max(6, Math.sin((idx + Date.now() / 200) * 0.7) * 24 + 10)}px`,
                          opacity: isPlayingAudio ? 0.9 : 0.4,
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-semibold cursor-pointer transition"
                    >
                      {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlayingAudio ? 'Pause Melody' : 'Play Music'}</span>
                    </button>
                    {onSendToChat && (
                      <button
                        type="button"
                        onClick={() => {
                          onSendToChat(`Play our generated ${currentTrack.genre} music track: "${currentTrack.title}"!`);
                          onClose();
                        }}
                        className="text-xs text-amber-300 hover:text-amber-200 transition font-medium flex items-center gap-1"
                      >
                        <span>Share to Sophia Chat</span>
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMAGE GENERATION & EDITING (NANO BANANA 2) */}
          {activeTab === 'image' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-pink-500/[0.08] border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-pink-200 text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    Nano Banana 2 (gemini-3.1-flash-image)
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Fast image generation and precision image-to-image editing supporting aspect ratios 1:1, 16:9, 9:16, and 4:3.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-pink-300/80 px-2 py-1 rounded bg-pink-500/20 border border-pink-500/30 shrink-0 self-start sm:self-center">
                  HIGH RESOLUTION
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  Prompt
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-400 transition"
                  placeholder="e.g. Majestic view of ancient Babylon hanging gardens illuminated by stars"
                />
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  Aspect Ratio
                </label>
                <div className="flex items-center gap-2">
                  {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition cursor-pointer ${
                        aspectRatio === ratio
                          ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image-to-Image Edit Instruction (Optional) */}
              {generatedImage && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-pink-300 mb-2">
                    Image-to-Image Edit Instruction (Optional)
                  </label>
                  <input
                    type="text"
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    placeholder="e.g. Add glowing golden moonlight and falling cherry blossom petals"
                    className="w-full bg-black/60 border border-pink-500/30 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-pink-400 transition"
                  />
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs tracking-wide shadow-lg cursor-pointer transition disabled:opacity-50"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating with Nano Banana 2...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{generatedImage && editInstruction ? 'Edit Existing Image' : 'Generate New Image'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Render Generated Image */}
              {generatedImage && (
                <div className="p-4 rounded-2xl bg-black/60 border border-pink-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{generatedImage.prompt}</span>
                    <span className="text-[10px] font-mono text-pink-300">{generatedImage.aspectRatio}</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900 flex items-center justify-center max-h-96">
                    <img
                      src={generatedImage.url}
                      alt={generatedImage.prompt}
                      className="w-full h-auto object-contain rounded-xl max-h-96"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <a
                      href={generatedImage.url}
                      download="sophia-generated-image.png"
                      className="flex items-center gap-1.5 text-xs text-pink-300 hover:text-pink-200 transition font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Image</span>
                    </a>
                    {onSendToChat && (
                      <button
                        type="button"
                        onClick={() => {
                          onSendToChat(`Sophia, what do you think of this visual artwork: "${generatedImage.prompt}"?`);
                          onClose();
                        }}
                        className="text-xs text-pink-300 hover:text-pink-200 transition font-medium flex items-center gap-1"
                      >
                        <span>Discuss with Sophia</span>
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CINEMATIC VIDEO (VEO 3) */}
          {activeTab === 'video' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-purple-500/[0.08] border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-purple-200 text-sm flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400" />
                    Google Veo 3 Video Creator (veo-3.1-lite-generate-preview)
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Text-to-video and image animation into cinematic videos with high-definition dynamic motion.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-purple-300/80 px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 shrink-0 self-start sm:self-center">
                  VEO 3 CINEMATIC
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  Cinematic Scene Prompt
                </label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition"
                  placeholder="e.g. Ultra photorealistic cinematic tracking shot of an astronaut looking at glowing nebula"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs tracking-wide shadow-lg cursor-pointer transition disabled:opacity-50"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Movie with Veo 3...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Generate Cinematic Video</span>
                    </>
                  )}
                </button>
              </div>

              {generatedVideo && (
                <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{generatedVideo.prompt}</span>
                    <span className="text-[10px] font-mono text-purple-300">16:9 • Veo 3</span>
                  </div>
                  <video
                    src={generatedVideo.url}
                    controls
                    className="w-full rounded-xl border border-white/10 max-h-80 object-cover"
                  />
                  <p className="text-xs text-white/60">{generatedVideo.cinematicScript}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SEARCH & MAPS GROUNDING */}
          {activeTab === 'grounding' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-cyan-500/[0.08] border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-cyan-200 text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Google Search & Maps Grounding
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Direct access to Google's real-time Search index and Maps geocoding data for fact verification.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setGroundingType('search')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition ${
                      groundingType === 'search' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-white/50'
                    }`}
                  >
                    Google Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroundingType('maps')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition ${
                      groundingType === 'maps' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-white/50'
                    }`}
                  >
                    Google Maps
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  {groundingType === 'search' ? 'Real-Time Search Query' : 'Location or Landmark Query'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={groundingQuery}
                    onChange={(e) => setGroundingQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunGrounding()}
                    className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition"
                    placeholder={
                      groundingType === 'search'
                        ? 'e.g. Current breakthroughs in quantum computing 2026'
                        : 'e.g. Taj Mahal Agra or Olympus Mons Mars coordinates'
                    }
                  />
                  <button
                    type="button"
                    onClick={handleRunGrounding}
                    disabled={isGroundingLoading}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isGroundingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    <span>Query</span>
                  </button>
                </div>
              </div>

              {groundingResult && (
                <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      Grounding Intelligence Dossier
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Verified via Google</span>
                  </div>
                  <div className="text-sm text-white/90 whitespace-pre-line leading-relaxed">
                    {groundingResult.text}
                  </div>
                  {groundingResult.sources && groundingResult.sources.length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5">
                        Sources:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {groundingResult.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-cyan-300 flex items-center gap-1 transition"
                          >
                            <Globe className="w-3 h-3 text-cyan-400" />
                            <span>{s.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIO TRANSCRIBE (GEMINI 3.5 TRANSCRIBE) */}
          {activeTab === 'transcribe' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-emerald-200 text-sm flex items-center gap-2">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    Audio Transcription (gemini-3.5-transcribe)
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Accurately transcribe audio, speeches, and recordings verbatim in English and Hindi.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-300/80 px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 shrink-0 self-start sm:self-center">
                  MULTILINGUAL VERBATIM
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <p className="text-xs text-white/70">
                  Microphone audio captured from Sophia's live session can be automatically processed by Gemini 3.5 Transcribe.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSendToChat?.('Sophia, please transcribe my recent voice statement into notes.');
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-200 font-semibold text-xs cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>Run Voice Transcription Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
