import { SpeechSentiment } from './utils/sentiment';
export type { SpeechSentiment };

export type PersonalityMode = 'girlfriend' | 'assistant' | 'friend' | 'mentor' | 'waifu';

export interface PersonalityConfig {
  id: PersonalityMode;
  name: string;
  subtitle: string;
  tagline: string;
  themeColor: string; // Tailwind hex or class
  glowColor: string;
  accentGradient: string;
  tone: string;
  focus: string;
  sampleGreeting: string;
  defaultPitch: number;
  defaultRate: number;
  avatarIcon: string;
}

export interface ToolExecutionRecord {
  id: string;
  toolName: string;
  displayName: string;
  args: Record<string, any>;
  result: any;
  timestamp: number;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  spokenText?: string;
  mode: PersonalityMode;
  timestamp: number;
  toolCalls?: ToolExecutionRecord[];
  audioBase64?: string;
  isStreaming?: boolean;
  thinkingEngine?: 'openai' | 'gemini';
  thinkingModel?: string;
  relayActive?: boolean;
  voiceProvider?: string;
  sentiment?: SpeechSentiment;
}

export interface MusicTrack {
  id: string;
  title: string;
  prompt: string;
  audioUrl?: string;
  audioBase64?: string;
  durationSeconds: number;
  genre: string;
  bpm?: number;
  createdAt: number;
  model: string;
}

export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  url: string;
  aspectRatio: string;
  model: string;
  createdAt: number;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  category?: string;
}

export interface DiagnosticMetrics {
  cpuUsage: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  memoryPercent: number;
  pingMs: number;
  uptimeSeconds: number;
  neuralCoreLoad: number;
  audioEngineLatencyMs: number;
  status: 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
  activeConnections: number;
  activeMode: PersonalityMode;
  timestamp: number;
}

export interface ReminderItem {
  id: string;
  title: string;
  timeStr: string;
  completed: boolean;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'female' | 'male';
  tone: string;
  description: string;
  sampleText: string;
  hindiSampleText?: string;
  accent: string;
  recommendedModes: PersonalityMode[];
  isCustom?: boolean;
  avatarColor: string;
  category: 'primary' | 'expressive' | 'calm' | 'storyteller' | 'hindi';
  isHindiSpecialist?: boolean;
}

export interface VoiceSettings {
  autoSpeak: boolean;
  autoListen: boolean;
  pitch: number;
  rate: number;
  selectedVoiceURI: string;
  soundEffects: boolean;
  micSensitivity: number;
  voiceEngine?: 'auto' | 'elevenlabs' | 'gemini' | 'webspeech';
  elevenLabsVoiceId?: string;
  activeVoiceName?: string;
  modeVoiceOverrides?: Partial<Record<PersonalityMode, string>>;
  hindiSound?: boolean;
  fastVoiceMode?: boolean; // Ultra-fast speech recognition & instant reply (850ms VAD)
  silenceDetectionMs?: number; // Configurable pause detection window (default: 850ms)
  thinkingEngine?: 'auto' | 'openai' | 'gemini';
}

export interface LearnedInsight {
  id: string;
  category: 'identity' | 'preference' | 'interest' | 'habit' | 'language' | 'style';
  title: string;
  detail: string;
  learnedAt: number;
  confidence: number;
}

export interface VoiceStatus {
  elevenLabsActive: boolean;
  elevenLabsSTTActive?: boolean;
  openAIActive?: boolean;
  openAIModel?: string;
  thinkingEngine?: 'openai' | 'gemini';
  relayActive?: boolean;
  provider: string;
  sttProvider?: string;
  defaultVoices?: Record<string, any>;
}

export type WorldRealm = 'earth_wonders' | 'cosmic_planets' | 'civilizations' | 'deep_frontiers';

export interface WorldKnowledgeNode {
  id: string;
  name: string;
  nativeOrAlternateName?: string;
  realm: WorldRealm;
  category: string;
  subLocation?: string;
  coordinates: {
    lat: number;
    lng: number;
    distanceOrAltitude?: string;
  };
  eraOrScale: string;
  tagline: string;
  fascinatingFact: string;
  description: string;
  keyInsights: string[];
  metrics: Record<string, string>;
  iconType: string;
  colorAccent: string;
}
