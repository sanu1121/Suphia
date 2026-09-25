// Web Audio API and Speech Synthesis Manager for Sophia AI

class AudioManager {
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isSpeechPaused = false;
  private onSpeakingStateChange?: (speaking: boolean) => void;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private isMicActive = false;
  private activeBufferSource: AudioBufferSourceNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingMimeType: string = 'audio/webm';
  private isRecordingAudio: boolean = false;

  public getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setSpeakingCallback(cb: (speaking: boolean) => void) {
    this.onSpeakingStateChange = cb;
  }

  // Initialize Web Audio API AnalyserNode from live microphone input
  public async startMicAnalyser(fftSize: number = 128): Promise<AnalyserNode | null> {
    if (this.micAnalyser && this.micStream && this.micStream.active) {
      return this.micAnalyser;
    }
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      console.warn('getUserMedia not supported in this environment');
      return null;
    }
    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.micStream = stream;
      const source = ctx.createMediaStreamSource(stream);
      this.micSource = source;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = 0.75;
      // Connect to analyser only (no feedback loop to destination)
      source.connect(analyser);

      this.micAnalyser = analyser;
      this.isMicActive = true;
      return analyser;
    } catch (err) {
      console.warn('Could not initialize microphone AnalyserNode:', err);
      return null;
    }
  }

  // Stop microphone stream and disconnect AnalyserNode cleanly
  public stopMicAnalyser(): void {
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {}
      this.micSource = null;
    }
    if (this.micAnalyser) {
      try {
        this.micAnalyser.disconnect();
      } catch {}
      this.micAnalyser = null;
    }
    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.micStream = null;
    }
    this.isMicActive = false;
  }

  public getMicAnalyser(): AnalyserNode | null {
    return this.micAnalyser;
  }

  public isMicrophoneStreaming(): boolean {
    return this.isMicActive && !!this.micStream?.active;
  }

  public isRecording(): boolean {
    return this.isRecordingAudio;
  }

  // Start recording microphone audio into high-fidelity compressed audio chunks for STT
  public async startAudioRecording(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      // Ensure micStream is active
      if (!this.micStream || !this.micStream.active) {
        if (!navigator.mediaDevices?.getUserMedia) return false;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.micStream = stream;
        this.isMicActive = true;
      }

      // Check supported recording format (prefer Opus/WebM for high fidelity with compact size)
      const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
      ];
      let selectedMime = '';
      if (typeof MediaRecorder !== 'undefined') {
        for (const candidate of candidates) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidate)) {
            selectedMime = candidate;
            break;
          }
        }
      }

      this.recordingMimeType = selectedMime || 'audio/webm';
      const recorder = selectedMime
        ? new MediaRecorder(this.micStream, { mimeType: selectedMime })
        : new MediaRecorder(this.micStream);

      this.audioChunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      recorder.start(100);
      this.mediaRecorder = recorder;
      this.isRecordingAudio = true;
      return true;
    } catch (err) {
      console.warn('Could not start MediaRecorder:', err);
      this.isRecordingAudio = false;
      return false;
    }
  }

  // Stop recording and return base64 encoded audio with MIME type
  public async stopAudioRecording(): Promise<{ base64: string; mimeType: string } | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      this.isRecordingAudio = false;
      return null;
    }

    return new Promise((resolve) => {
      const recorder = this.mediaRecorder!;
      recorder.onstop = () => {
        try {
          const blob = new Blob(this.audioChunks, { type: this.recordingMimeType });
          this.audioChunks = [];
          this.mediaRecorder = null;
          this.isRecordingAudio = false;

          if (blob.size === 0) {
            resolve(null);
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1] || '';
            resolve({ base64, mimeType: this.recordingMimeType });
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        } catch {
          this.isRecordingAudio = false;
          resolve(null);
        }
      };

      try {
        recorder.stop();
      } catch {
        this.isRecordingAudio = false;
        resolve(null);
      }
    });
  }

  // Send captured speech audio to ElevenLabs Speech-to-Text API (/api/transcribe)
  public async transcribeAudio(
    audioBase64: string,
    mimeType: string,
    language?: string
  ): Promise<{ text: string; provider: string; model?: string } | null> {
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          language,
        }),
      });

      if (!response.ok) {
        console.warn('STT transcription API returned status:', response.status);
        return null;
      }

      const data = await response.json();
      if (data?.text && typeof data.text === 'string' && data.text.trim()) {
        return {
          text: data.text.trim(),
          provider: data.provider || 'elevenlabs',
          model: data.model,
        };
      }
      return null;
    } catch (err) {
      console.warn('Failed to call /api/transcribe:', err);
      return null;
    }
  }

  // Play synthetic sci-fi UI sound effects using Web Audio API oscillators
  public playSoundEffect(type: 'activate' | 'switch' | 'listening' | 'tool' | 'success' | 'error' | 'pause' | 'resume') {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'activate') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'pause') {
        // Sci-Fi Cryogenic Stasis Pause Chime: Descending dual harmonic warp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.28);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'resume') {
        // Sci-Fi Re-engagement Shimmer: Ascending bright resonance
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.setValueAtTime(520, now + 0.08);
        osc.frequency.setValueAtTime(880, now + 0.16);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.28);
        gain.gain.setValueAtTime(0.13, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'switch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'listening') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'tool') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.setValueAtTime(1200, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Audio effects disabled or blocked:', e);
    }
  }

  // Get available SpeechSynthesis voices
  public getBestVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    const rawVoices = window.speechSynthesis.getVoices();
    const seenURIs = new Set<string>();
    const seenNameLang = new Set<string>();

    return rawVoices.filter((v) => {
      const uri = v.voiceURI?.trim();
      const nameLang = `${v.name?.trim()}_${v.lang?.trim()}`;

      if (uri) {
        if (seenURIs.has(uri)) return false;
        seenURIs.add(uri);
      }
      if (seenNameLang.has(nameLang)) return false;
      seenNameLang.add(nameLang);

      return true;
    });
  }

  public findIndianOrFemaleVoice(voiceURI?: string, hindiSound = false): SpeechSynthesisVoice | null {
    const voices = this.getBestVoices();
    if (voices.length === 0) return null;

    if (voiceURI) {
      const match = voices.find((v) => v.voiceURI === voiceURI);
      if (match) return match;
    }

    if (hindiSound) {
      // 1. Check Hindi voice (hi, hi-IN, or name containing Hindi)
      const hindiVoice = voices.find((v) => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        return lang.startsWith('hi') || lang === 'hi-in' || name.includes('hindi') || name.includes('हिन्दी');
      });
      if (hindiVoice) return hindiVoice;

      // 2. Check Indian English voice
      const indianEn = voices.find((v) => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        return lang === 'en-in' || lang.startsWith('en-in') || name.includes('india') || name.includes('heera') || name.includes('veena') || name.includes('neerja');
      });
      if (indianEn) return indianEn;
    }

    // Default to natural English female/warm voice
    const naturalFemale = voices.find((v) => {
      const name = v.name.toLowerCase();
      return (name.includes('female') || name.includes('samantha') || name.includes('victoria') || name.includes('zira') || name.includes('karen') || name.includes('google') || name.includes('natural')) && v.lang.startsWith('en');
    });
    if (naturalFemale) return naturalFemale;

    const anyEnglish = voices.find((v) => v.lang.startsWith('en'));
    if (anyEnglish) return anyEnglish;

    return voices[0] || null;
  }

  // Stop any active speech immediately
  public stopSpeaking() {
    this.isSpeechPaused = false;
    if (this.activeBufferSource) {
      try {
        this.activeBufferSource.stop();
        this.activeBufferSource.disconnect();
      } catch {}
      this.activeBufferSource = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    if (this.onSpeakingStateChange) {
      this.onSpeakingStateChange(false);
    }
  }

  // Pause active speech (Web Audio buffer suspension or SpeechSynthesis pause)
  public pauseSpeaking(): boolean {
    if (!this.isSpeaking && !this.isSpeechPaused) return false;
    this.isSpeechPaused = true;

    // 1. Suspend Web Audio Context if playing neural audio buffer
    if (this.audioCtx && this.audioCtx.state === 'running' && this.activeBufferSource) {
      try {
        this.audioCtx.suspend();
      } catch (err) {
        console.warn('AudioContext pause/suspend exception:', err);
      }
    }

    // 2. Pause Web Speech Synthesis if speaking via browser voice
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.pause();
      } catch (err) {
        console.warn('SpeechSynthesis pause exception:', err);
      }
    }

    if (this.onSpeakingStateChange) {
      this.onSpeakingStateChange(false);
    }
    return true;
  }

  // Resume paused speech
  public resumeSpeaking(): boolean {
    if (!this.isSpeechPaused) return false;
    this.isSpeechPaused = false;

    // 1. Resume Web Audio Context if suspended
    if (this.audioCtx && this.audioCtx.state === 'suspended' && this.activeBufferSource) {
      try {
        this.audioCtx.resume();
        this.isSpeaking = true;
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(true);
        }
        return true;
      } catch (err) {
        console.warn('AudioContext resume exception:', err);
      }
    }

    // 2. Resume Web Speech Synthesis if paused
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
        this.isSpeaking = true;
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(true);
        }
        return true;
      } catch (err) {
        console.warn('SpeechSynthesis resume exception:', err);
      }
    }

    return false;
  }

  public isSpeakingPaused(): boolean {
    return this.isSpeechPaused;
  }

  // Play Decoded Audio (ElevenLabs MP3 / AAC / WAV) via Web Audio API decodeAudioData
  public async playEncodedAudio(base64Data: string): Promise<boolean> {
    try {
      this.stopSpeaking();
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const binary = window.atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer.slice(0);
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      this.activeBufferSource = source;

      this.isSpeaking = true;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);

      source.onended = () => {
        this.activeBufferSource = null;
        this.isSpeaking = false;
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
      };

      source.start();
      return true;
    } catch (e) {
      console.warn('Failed to decode/play ElevenLabs encoded audio:', e);
      return false;
    }
  }

  // Play Raw PCM Base64 from Gemini TTS if returned
  public async playPCM24kAudio(base64Data: string): Promise<boolean> {
    try {
      this.stopSpeaking();
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const binary = window.atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Convert 16-bit PCM to Float32
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      this.activeBufferSource = source;

      this.isSpeaking = true;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);

      source.onended = () => {
        this.activeBufferSource = null;
        this.isSpeaking = false;
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
      };

      source.start();
      return true;
    } catch (e) {
      console.warn('Failed to play PCM audio, will fallback to Web Speech:', e);
      return false;
    }
  }

  // Unified audio dispatcher: plays ElevenLabs MP3 or Gemini PCM audio automatically
  public async playAudioResponse(base64Data: string, mimeType?: string): Promise<boolean> {
    if (mimeType && mimeType.includes('pcm')) {
      return this.playPCM24kAudio(base64Data);
    }
    return this.playEncodedAudio(base64Data);
  }

  // Speak text using Web Speech API
  public speakText(
    text: string,
    options: {
      pitch?: number;
      rate?: number;
      voiceURI?: string;
      hindiSound?: boolean;
      onStart?: () => void;
      onEnd?: () => void;
    } = {}
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not available.');
      return;
    }

    this.stopSpeaking();

    // Clean any residual markdown characters
    const cleanText = text
      .replace(/[*#`_~[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
    const isHindi = Boolean(options.hindiSound) || hasDevanagari;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const chosenVoice = this.findIndianOrFemaleVoice(options.voiceURI, isHindi);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang || (isHindi ? 'hi-IN' : 'en-US');
    } else {
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    }

    utterance.pitch = options.pitch ?? 1.1;
    utterance.rate = options.rate ?? 1.05;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
      if (options.onEnd) options.onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }
}

export const audioService = new AudioManager();
