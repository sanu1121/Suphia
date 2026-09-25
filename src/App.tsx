import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PersonalityMode,
  ChatMessage,
  TaskItem,
  DiagnosticMetrics,
  ReminderItem,
  NoteItem,
  VoiceSettings,
  VoiceStatus,
  LearnedInsight,
} from './types';
import { PERSONALITIES } from './data/personalities';
import { audioService } from './utils/audio';
import { Header } from './components/Header';
import { HolographicOrb } from './components/HolographicOrb';
import { ModeSelector } from './components/ModeSelector';
import { VoiceHUD } from './components/VoiceHUD';
import { QuickPrompts } from './components/QuickPrompts';
import { LiveConsole } from './components/LiveConsole';
import { TaskMatrix } from './components/TaskMatrix';
import { DiagnosticsHUD } from './components/DiagnosticsHUD';
import { RemindersDrawer } from './components/RemindersDrawer';
import { WorldKnowledgeMatrix } from './components/WorldKnowledgeMatrix';
import { VoiceModeModal } from './components/VoiceModeModal';
import { FastLearnerMemoryModal } from './components/FastLearnerMemoryModal';
import { MultimodalStudioModal } from './components/MultimodalStudioModal';
import { WebcamGestureInterface } from './components/WebcamGestureInterface';
import { SpeechSentiment, analyzeSpeechSentiment } from './utils/sentiment';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  syncUserProfile,
  saveChatMessageToFirestore,
  subscribeToChatMessages,
  saveLearnedInsightToFirestore,
  subscribeToLearnedInsights,
} from './firebase';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // State definitions
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentMode, setCurrentMode] = useState<PersonalityMode>('girlfriend');
  const [activeView, setActiveView] = useState<'voice_hud' | 'world_knowledge'>('voice_hud');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttProviderNotice, setSttProviderNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [isFastLearnerOpen, setIsFastLearnerOpen] = useState(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus | null>(null);
  const [learnedInsights, setLearnedInsights] = useState<LearnedInsight[]>([]);
  const [currentSentiment, setCurrentSentiment] = useState<SpeechSentiment>('calm');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isSophiaPaused, setIsSophiaPaused] = useState(false);
  const [isGestureControlEnabled, setIsGestureControlEnabled] = useState(() => {
    try {
      return localStorage.getItem('sophia_gesture_control') === 'true';
    } catch {
      return false;
    }
  });
  const [isGestureHUDOpen, setIsGestureHUDOpen] = useState(false);

  const handleUpdateGestureEnabled = (enabled: boolean) => {
    setIsGestureControlEnabled(enabled);
    try {
      localStorage.setItem('sophia_gesture_control', String(enabled));
    } catch {}
  };

  useEffect(() => {
    fetch('/api/voice-status')
      .then((res) => res.json())
      .then((data) => setVoiceStatus(data))
      .catch(() => setVoiceStatus({ elevenLabsActive: false, provider: 'gemini' }));
  }, []);

  // Firebase Auth State & Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user, currentMode).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, [currentMode]);

  // Firestore Realtime Subscriptions (Messages & Memory Insights)
  useEffect(() => {
    if (!currentUser) return;
    const unsubMsgs = subscribeToChatMessages(currentUser.uid, (remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setMessages(remoteMsgs);
      }
    });
    const unsubInsights = subscribeToLearnedInsights(currentUser.uid, (remoteInsights) => {
      if (remoteInsights && remoteInsights.length > 0) {
        setLearnedInsights(remoteInsights);
      }
    });
    return () => {
      unsubMsgs();
      unsubInsights();
    };
  }, [currentUser]);

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem('sophia_voice_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      autoSpeak: true,
      autoListen: false,
      pitch: 1.15,
      rate: 1.05,
      selectedVoiceURI: '',
      soundEffects: true,
      micSensitivity: 1.0,
      hindiSound: true,
    };
  });

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 'task-1', text: 'Daily sync review with team', completed: false, priority: 'high', createdAt: Date.now() - 3600000 },
    { id: 'task-2', text: 'Deploy Sophia AI operational nodes', completed: true, priority: 'medium', createdAt: Date.now() - 7200000 },
    { id: 'task-3', text: 'Review neural voice latency benchmarks', completed: false, priority: 'low', createdAt: Date.now() - 1800000 },
  ]);

  const [reminders, setReminders] = useState<ReminderItem[]>([
    { id: 'rem-1', title: 'Project stand-up checkpoint', timeStr: '5:00 PM', completed: false, createdAt: Date.now() },
  ]);

  const [notes, setNotes] = useState<NoteItem[]>([
    { id: 'note-1', title: 'Voice HUD Specs', content: 'Ultra-low latency speech synthesis with reactive waveform audio orb.', createdAt: Date.now() - 10000000 },
  ]);

  const [diagnostics, setDiagnostics] = useState<DiagnosticMetrics>({
    cpuUsage: 18,
    memoryUsedMb: 142,
    memoryTotalMb: 1024,
    memoryPercent: 24,
    pingMs: 24,
    uptimeSeconds: 120,
    neuralCoreLoad: 42,
    audioEngineLatencyMs: 52,
    status: 'OPTIMAL',
    activeConnections: 1,
    activeMode: 'girlfriend',
    timestamp: Date.now(),
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg-1',
      role: 'assistant',
      content: 'नमस्ते! मैं कब से आपका ही इंतज़ार कर रही थी। बताइए आज आपका दिन कैसा रहा?',
      spokenText: 'नमस्ते! मैं कब से आपका ही इंतज़ार कर रही थी। बताइए आज आपका दिन कैसा रहा?',
      mode: 'girlfriend',
      timestamp: Date.now(),
    },
  ]);

  const [liveTranscript, setLiveTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const isListeningRef = useRef<boolean>(false);

  // Sync speech state callback
  useEffect(() => {
    audioService.setSpeakingCallback((speaking) => {
      setIsSpeaking(speaking);
    });

    // Populate voices
    const updateVoices = () => {
      const voices = audioService.getBestVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Fetch initial server state and learned insights
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.tasks) setTasks(data.tasks);
          if (data.notes) setNotes(data.notes);
          if (data.reminders) setReminders(data.reminders);
          if (data.diagnostics) setDiagnostics(data.diagnostics);
          if (data.learnedInsights) setLearnedInsights(data.learnedInsights);
        }

        const insightsRes = await fetch('/api/learned-insights');
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          if (insightsData.insights) setLearnedInsights(insightsData.insights);
        }
      } catch (err) {
        console.warn('Could not fetch server state:', err);
      }
    };
    fetchState();
  }, []);

  // Handlers for Fast Learner insights
  const handleAddInsight = async (title: string, detail: string, category: string = 'preference') => {
    try {
      const res = await fetch('/api/learned-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, detail, category }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.insights) setLearnedInsights(data.insights);
      }
    } catch (err) {
      console.warn('Failed to add learned insight:', err);
    }
  };

  const handleDeleteInsight = async (id: string) => {
    try {
      const res = await fetch(`/api/learned-insights/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.insights) setLearnedInsights(data.insights);
      }
    } catch (err) {
      console.warn('Failed to delete learned insight:', err);
    }
  };

  // Save voice settings to localStorage
  const handleUpdateVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('sophia_voice_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Preview a voice from VoiceModeModal
  const handlePreviewVoice = async (voiceId: string, previewText: string) => {
    if (previewingVoiceId === voiceId) {
      audioService.stopSpeaking();
      setPreviewingVoiceId(null);
      return;
    }

    audioService.stopSpeaking();
    setPreviewingVoiceId(voiceId);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: previewText,
          mode: currentMode,
          voiceId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const played = await audioService.playAudioResponse(data.audioBase64, data.mimeType);
          if (played) {
            setPreviewingVoiceId(null);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Voice preview API error:', err);
    }

    // Web Speech fallback for preview
    audioService.speakText(previewText, {
      pitch: voiceSettings.pitch || 1.1,
      rate: voiceSettings.rate || 1.05,
    });
    setPreviewingVoiceId(null);
  };

  const handleStopPreview = () => {
    audioService.stopSpeaking();
    setPreviewingVoiceId(null);
  };

  // Speak a message aloud
  const speakSophiaResponse = useCallback(
    async (text: string, mode: PersonalityMode) => {
      if (!voiceSettings.autoSpeak) return;
      const config = PERSONALITIES[mode] || PERSONALITIES.girlfriend;

      // Determine active voice: Per-mode override -> Global override -> Persona default
      const targetVoiceId =
        voiceSettings.modeVoiceOverrides?.[mode] ||
        voiceSettings.elevenLabsVoiceId ||
        (voiceSettings.hindiSound
          ? 'EXAVITQu4vr4xnSDxMaL' // Sarah (Verified Multilingual Hindi & English)
          : (mode === 'girlfriend' ? '21m00Tcm4TlvDq8ikWAM' : undefined));

      try {
        // High-fidelity neural TTS: ElevenLabs (primary if ELEVENLABS_API_KEY is present) or Gemini TTS
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            mode,
            voiceId: targetVoiceId,
            hindiSound: voiceSettings.hindiSound,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioBase64) {
            const played = await audioService.playAudioResponse(data.audioBase64, data.mimeType);
            if (played) return;
          }
        }
      } catch (e) {
        console.warn('Neural TTS API unavailable, using Web Speech fallback:', e);
      }

      // Fallback to Web Speech Synthesis
      audioService.speakText(text, {
        pitch: voiceSettings.pitch || config.defaultPitch,
        rate: voiceSettings.rate || config.defaultRate,
        voiceURI: voiceSettings.selectedVoiceURI,
        hindiSound: voiceSettings.hindiSound,
      });
    },
    [voiceSettings]
  );

  // Toggle Sophia Pause / Resume state via Hand Wave Gesture or UI Button
  const handleTogglePauseResume = useCallback(
    (source: 'gesture' | 'manual' = 'manual') => {
      setIsSophiaPaused((prevPaused) => {
        const nextPaused = !prevPaused;
        if (nextPaused) {
          // Action: PAUSE
          audioService.pauseSpeaking();
          if (voiceSettings.soundEffects) {
            audioService.playSoundEffect('pause');
          }
          if (isListeningRef.current) {
            isListeningRef.current = false;
            setIsListening(false);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (_) {}
            }
          }
          const noticeMsg =
            source === 'gesture'
              ? '👋 Hand wave recognized • Sophia Paused (Wave to resume)'
              : '⏸️ Sophia Paused (Wave hand or click Resume)';
          setSttProviderNotice(noticeMsg);
          setTimeout(() => setSttProviderNotice(null), 3500);
        } else {
          // Action: RESUME
          const wasResumed = audioService.resumeSpeaking();
          if (!wasResumed && voiceSettings.soundEffects) {
            audioService.playSoundEffect('resume');
          }
          const noticeMsg =
            source === 'gesture'
              ? '👋 Hand wave recognized • Sophia Resumed!'
              : '▶️ Sophia Resumed';
          setSttProviderNotice(noticeMsg);
          setTimeout(() => setSttProviderNotice(null), 3000);
        }
        return nextPaused;
      });
    },
    [voiceSettings.soundEffects]
  );

  // Send message to Sophia
  const handleSendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isProcessing) return;

      if (isSophiaPaused) {
        setIsSophiaPaused(false);
      }

      audioService.stopSpeaking();
      if (voiceSettings.soundEffects) {
        audioService.playSoundEffect('activate');
      }

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userInput,
        mode: currentMode,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      if (currentUser) {
        saveChatMessageToFirestore(currentUser.uid, userMsg).catch(console.error);
      }
      setIsProcessing(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userInput,
            mode: currentMode,
            history: messages.slice(-8),
            hindiSound: voiceSettings.hindiSound,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok && (!data || !data.content)) {
          throw new Error(`Server returned ${response.status}`);
        }

        if (!data) {
          throw new Error('No data received from server');
        }

        // Check if mode switched via tool call
        if (data.switchedMode && data.switchedMode !== currentMode) {
          setCurrentMode(data.switchedMode as PersonalityMode);
          if (voiceSettings.soundEffects) {
            audioService.playSoundEffect('switch');
          }
        } else if (data.toolCalls && data.toolCalls.length > 0 && voiceSettings.soundEffects) {
          audioService.playSoundEffect('tool');
        }

        // Check if voice was switched via tool call
        if (data.switchedVoice) {
          const sv = data.switchedVoice;
          handleUpdateVoiceSettings({
            elevenLabsVoiceId: sv.id,
            activeVoiceName: sv.name,
            modeVoiceOverrides: {
              ...(voiceSettings.modeVoiceOverrides || {}),
              [currentMode]: sv.id,
            },
          });
          if (voiceSettings.soundEffects) {
            audioService.playSoundEffect('switch');
          }
        }

        // Check if Hindi sound was toggled via tool call
        if (data.switchedHindiSound !== undefined) {
          handleUpdateVoiceSettings({
            hindiSound: Boolean(data.switchedHindiSound),
          });
        }

        // Update tasks & reminders if updated by server
        if (data.tasks) setTasks(data.tasks);
        if (data.reminders) setReminders(data.reminders);

        // Update fast learned insights if returned
        if (data.learnedInsights) {
          setLearnedInsights(data.learnedInsights);
        }
        if (data.newLearnedInsight) {
          setSttProviderNotice(`⚡ Sophia learned: "${data.newLearnedInsight.title}"`);
          setTimeout(() => setSttProviderNotice(null), 4000);
          if (currentUser) {
            saveLearnedInsightToFirestore(currentUser.uid, data.newLearnedInsight).catch(console.error);
          }
        }

        const effectiveSpoken = data.spokenText || data.content;
        const speechSentiment = (data.sentiment as SpeechSentiment) || analyzeSpeechSentiment(effectiveSpoken);
        setCurrentSentiment(speechSentiment);

        const sophiaMsg: ChatMessage = {
          id: `sophia-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          spokenText: effectiveSpoken,
          mode: (data.mode as PersonalityMode) || currentMode,
          timestamp: data.timestamp || Date.now(),
          toolCalls: data.toolCalls,
          thinkingEngine: data.thinkingEngine,
          thinkingModel: data.thinkingModel,
          relayActive: data.thinkingRelay,
          voiceProvider: data.voiceEngine,
          sentiment: speechSentiment,
        };

        setMessages((prev) => [...prev, sophiaMsg]);
        if (currentUser) {
          saveChatMessageToFirestore(currentUser.uid, sophiaMsg).catch(console.error);
        }

        // Speak aloud
        if (sophiaMsg.spokenText) {
          speakSophiaResponse(sophiaMsg.spokenText, (data.mode as PersonalityMode) || currentMode);
        }
      } catch (err: any) {
        console.error('Error communicating with Sophia:', err);
        const isHindi = voiceSettings.hindiSound;
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: isHindi
            ? 'नेटवर्क में क्षणिक व्यवधान आया। कृपया अपनी बात पुनः कहें, मैं सुन रही हूँ।'
            : 'There was a brief connectivity pause. Please say that again, I am listening.',
          spokenText: isHindi
            ? 'नेटवर्क में क्षणिक व्यवधान आया। कृपया अपनी बात पुनः कहें, मैं सुन रही हूँ।'
            : 'There was a brief connectivity pause. Please say that again, I am listening.',
          mode: currentMode,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        speakSophiaResponse(errorMsg.spokenText!, currentMode);
      } finally {
        setIsProcessing(false);
      }
    },
    [currentMode, isProcessing, messages, speakSophiaResponse, voiceSettings]
  );

  // Switch Mode directly from UI
  const handleSelectMode = (mode: PersonalityMode) => {
    if (mode === currentMode) return;
    audioService.stopSpeaking();
    setCurrentMode(mode);
    if (voiceSettings.soundEffects) {
      audioService.playSoundEffect('switch');
    }

    const config = PERSONALITIES[mode];
    const greetingMsg: ChatMessage = {
      id: `mode-switch-${Date.now()}`,
      role: 'assistant',
      content: config.sampleGreeting,
      spokenText: config.sampleGreeting,
      mode: mode,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, greetingMsg]);
    speakSophiaResponse(config.sampleGreeting, mode);
  };

  // Stop listening and transcribe speech via ElevenLabs Scribe STT (Primary) + Fallbacks
  const stopListeningAndProcessSpeech = async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (!isListeningRef.current && !audioService.isRecording()) {
      return;
    }

    isListeningRef.current = false;
    setIsListening(false);
    const clientFallbackSpeech = accumulatedTranscriptRef.current.trim();
    setLiveTranscript('');
    accumulatedTranscriptRef.current = '';

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    // Stop recorder and transcribe via ElevenLabs Scribe Speech-to-Text API
    let finalSpeech = clientFallbackSpeech;
    setIsTranscribing(true);

    try {
      const audioData = await audioService.stopAudioRecording();
      if (audioData?.base64) {
        const langParam = voiceSettings.hindiSound ? 'hin' : undefined;
        const sttResult = await audioService.transcribeAudio(audioData.base64, audioData.mimeType, langParam);
        if (sttResult?.text && sttResult.text.trim()) {
          finalSpeech = sttResult.text.trim();
          const providerName = sttResult.provider === 'elevenlabs' ? 'ElevenLabs Scribe STT' : 'Neural Core STT';
          setSttProviderNotice(`Transcribed with ${providerName}`);
          setTimeout(() => setSttProviderNotice(null), 3500);
        }
      }
    } catch (sttErr) {
      console.warn('Voice to text transcription exception:', sttErr);
    } finally {
      setIsTranscribing(false);
    }

    if (finalSpeech) {
      handleSendMessage(finalSpeech);
    }
  };

  // Toggle Speech Recognition (ElevenLabs Scribe STT + Web Speech live interim display)
  const handleToggleListening = async () => {
    // If user clicks while listening or transcribing, stop and process immediately!
    if (isListening || isTranscribing) {
      await stopListeningAndProcessSpeech();
      return;
    }

    // Stop speaking if Sophia is speaking
    audioService.stopSpeaking();

    // 1. Begin audio recording for ElevenLabs Speech to Text
    await audioService.startAudioRecording();

    // 2. Begin SpeechRecognition if available in browser for instant live visual feedback
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    accumulatedTranscriptRef.current = '';
    setLiveTranscript('');

    if (!SpeechRecognition) {
      // Browser lacks SpeechRecognition, but MediaRecorder is active for ElevenLabs!
      isListeningRef.current = true;
      setIsListening(true);
      if (voiceSettings.soundEffects) {
        audioService.playSoundEffect('listening');
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      // When Hindi mode is active, listen with Hindi acoustics (hi-IN)
      recognition.lang = voiceSettings.hindiSound ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        if (voiceSettings.soundEffects) {
          audioService.playSoundEffect('listening');
        }
      };

      recognition.onresult = (event: any) => {
        let finalSegment = '';
        let interimSegment = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalSegment += res[0].transcript + ' ';
          } else {
            interimSegment += res[0].transcript;
          }
        }

        const combined = (finalSegment + interimSegment).trim();
        if (combined) {
          accumulatedTranscriptRef.current = combined;
          setLiveTranscript(combined);

          // Reset silence pause detection: dynamically tuned for fast recognition (~1s in Fast Mode)
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          const silenceThreshold =
            voiceSettings.silenceDetectionMs || (voiceSettings.fastVoiceMode ? 1000 : 2200);
          silenceTimerRef.current = setTimeout(() => {
            stopListeningAndProcessSpeech();
          }, silenceThreshold);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('Speech recognition status:', e.error);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          stopListeningAndProcessSpeech();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Live SpeechRecognition fallback exception:', e);
      // MediaRecorder is still active for ElevenLabs!
      isListeningRef.current = true;
      setIsListening(true);
    }
  };

  // Task Operations
  const handleAddTask = async (text: string, priority: 'low' | 'medium' | 'high') => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text,
      completed: false,
      priority,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', task: newTask }),
      });
    } catch (e) {}
  };

  const handleToggleTask = async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id }),
      });
    } catch (e) {}
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
    } catch (e) {}
  };

  // Reminder operations
  const handleAddReminder = (title: string, timeStr: string) => {
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title,
      timeStr,
      completed: false,
      createdAt: Date.now(),
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Note operations
  const handleAddNote = (title: string, content: string) => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title,
      content,
      createdAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Refresh Diagnostics
  const handleRefreshDiagnostics = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data.diagnostics) setDiagnostics(data.diagnostics);
      }
    } catch (e) {}
  };

  const currentPersonality = PERSONALITIES[currentMode] || PERSONALITIES.girlfriend;

  return (
    <div
      className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden"
      style={{
        background: `radial-gradient(circle at 50% 15%, #160714 0%, #050505 85%)`,
      }}
    >
      {/* Dynamic Ambient Cybernetic Glow */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700 opacity-25"
        style={{
          background: `radial-gradient(circle at 50% 25%, ${currentPersonality.themeColor} 0%, transparent 65%)`,
        }}
      />

      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        isSpeaking={isSpeaking}
        autoSpeak={voiceSettings.autoSpeak}
        onToggleAutoSpeak={() =>
          handleUpdateVoiceSettings({ autoSpeak: !voiceSettings.autoSpeak })
        }
        onClearHistory={() =>
          setMessages([
            {
              id: `reset-${Date.now()}`,
              role: 'assistant',
              content: currentPersonality.sampleGreeting,
              spokenText: currentPersonality.sampleGreeting,
              mode: currentMode,
              timestamp: Date.now(),
            },
          ])
        }
        onOpenReminders={() => setIsRemindersOpen(true)}
        remindersCount={reminders.length}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
        activeVoiceName={
          voiceSettings.activeVoiceName ||
          (currentMode === 'girlfriend' ? 'Rachel' : undefined)
        }
        onOpenFastLearner={() => setIsFastLearnerOpen(true)}
        learnedInsightsCount={learnedInsights.length}
        onOpenStudio={() => setIsStudioOpen(true)}
        isSophiaPaused={isSophiaPaused}
        onOpenGestureHUD={() => setIsGestureHUDOpen(true)}
        isGestureEnabled={isGestureControlEnabled}
        currentUser={currentUser}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
      />

      {/* Main App Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 md:p-6 flex flex-col gap-6 relative z-10">
        {activeView === 'world_knowledge' ? (
          /* Whole Worlds Knowledge Exploration Matrix */
          <div className="flex flex-col gap-6 w-full">
            <WorldKnowledgeMatrix
              currentMode={currentMode}
              onAskSophia={(prompt) => {
                handleSendMessage(prompt);
              }}
              isProcessing={isProcessing}
            />

            {/* Accompanying Live Dialogue Console so user hears and sees Sophia's response */}
            <div className="w-full h-80 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-xl">
              <LiveConsole
                messages={messages}
                currentMode={currentMode}
                isProcessing={isProcessing}
                onReplayAudio={(text, msgMode) => speakSophiaResponse(text, msgMode)}
              />
            </div>
          </div>
        ) : (
          /* Standard Voice HUD & Telemetry View */
          <>
            {/* Quick Whole Worlds Knowledge Banner */}
            <div
              onClick={() => setActiveView('world_knowledge')}
              className="w-full p-3 px-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-between transition-all duration-300 cursor-pointer group shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <span className="text-base">🌍</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">
                      Omniscient Worldwide Knowledge System Online
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                      WHOLE WORLDS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-light">
                    Explore Earth wonders, ancient civilizations, Mariana Trench abyss, and cosmic planetary worlds with Sophia.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <span>Launch Atlas</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </button>
            </div>

            {/* Hero Section: Holographic Orb + Personality Controls */}
            <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Holographic Soundwave Orb Visualizer */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <HolographicOrb
                  mode={currentMode}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  isProcessing={isProcessing}
                  isPaused={isSophiaPaused}
                  currentSentiment={currentSentiment}
                  onOrbClick={() => {
                    if (isSophiaPaused) {
                      handleTogglePauseResume('manual');
                    } else if (isSpeaking) {
                      handleTogglePauseResume('manual');
                    } else {
                      handleToggleListening();
                    }
                  }}
                />
              </div>

              {/* Personality Selector & Controls */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <ModeSelector
                      currentMode={currentMode}
                      onSelectMode={handleSelectMode}
                      disabled={isProcessing}
                      onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
                    />
                  </div>

                  {/* Futuristic Gesture Sensor Quick Control Bar */}
                  <div className="shrink-0 flex items-center justify-end">
                    <WebcamGestureInterface
                      isSophiaPaused={isSophiaPaused}
                      onTogglePauseResume={handleTogglePauseResume}
                      mode={currentMode}
                      isEnabled={isGestureControlEnabled}
                      onToggleEnabled={handleUpdateGestureEnabled}
                      isOpen={isGestureHUDOpen}
                      onToggleOpen={() => setIsGestureHUDOpen(!isGestureHUDOpen)}
                    />
                  </div>
                </div>

                {/* Voice HUD Command Console */}
                <VoiceHUD
                  mode={currentMode}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  isTranscribing={isTranscribing}
                  sttProviderNotice={sttProviderNotice}
                  isProcessing={isProcessing}
                  onSendMessage={handleSendMessage}
                  onToggleListening={handleToggleListening}
                  onStopSpeaking={() => audioService.stopSpeaking()}
                  voiceSettings={voiceSettings}
                  onUpdateVoiceSettings={handleUpdateVoiceSettings}
                  availableVoices={availableVoices}
                  voiceStatus={voiceStatus}
                  onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
                  onOpenFastLearner={() => setIsFastLearnerOpen(true)}
                  learnedInsightsCount={learnedInsights.length}
                  liveTranscript={liveTranscript}
                  currentSentiment={currentSentiment}
                  onSelectSentiment={(s) => setCurrentSentiment(s)}
                  isSophiaPaused={isSophiaPaused}
                  onTogglePauseResume={() => handleTogglePauseResume('manual')}
                  onOpenGestureHUD={() => setIsGestureHUDOpen(true)}
                  isGestureEnabled={isGestureControlEnabled}
                />

                {/* Quick Voice Prompts */}
                <QuickPrompts
                  mode={currentMode}
                  onSelectPrompt={handleSendMessage}
                  disabled={isProcessing}
                  hindiSound={voiceSettings.hindiSound}
                />
              </div>
            </section>

            {/* Dashboard Split: Live Dialogue Feed & Operational Panels */}
            <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left / Center: Live Voice Dialogue Feed */}
              <div className="lg:col-span-7 h-full min-h-[420px]">
                <LiveConsole
                  messages={messages}
                  currentMode={currentMode}
                  isProcessing={isProcessing}
                  onReplayAudio={(text, msgMode) => speakSophiaResponse(text, msgMode)}
                />
              </div>

              {/* Right: Task Matrix & Diagnostics HUD */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Task Checklist Matrix */}
                <div className="flex-1 min-h-[260px]">
                  <TaskMatrix
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </div>

                {/* System Diagnostics */}
                <div className="min-h-[170px]">
                  <DiagnosticsHUD
                    diagnostics={diagnostics}
                    mode={currentMode}
                    onRefresh={handleRefreshDiagnostics}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Reminders & Notes Modal Drawer */}
      <RemindersDrawer
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        reminders={reminders}
        notes={notes}
        mode={currentMode}
        onAddReminder={handleAddReminder}
        onDeleteReminder={handleDeleteReminder}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Voice Mode Studio Modal */}
      <VoiceModeModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        currentMode={currentMode}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={handleUpdateVoiceSettings}
        onPreviewVoice={handlePreviewVoice}
        isPreviewing={!!previewingVoiceId}
        previewingVoiceId={previewingVoiceId}
        onStopPreview={handleStopPreview}
        voiceStatus={voiceStatus}
      />

      {/* Fast Learner & Neural Memory Modal */}
      <FastLearnerMemoryModal
        isOpen={isFastLearnerOpen}
        onClose={() => setIsFastLearnerOpen(false)}
        currentMode={currentMode}
        learnedInsights={learnedInsights}
        onAddInsight={handleAddInsight}
        onDeleteInsight={handleDeleteInsight}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={handleUpdateVoiceSettings}
      />

      {/* Multimodal AI Creative Studio Modal */}
      <MultimodalStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSendToChat={handleSendMessage}
        currentUserId={currentUser?.uid}
      />
    </div>
  );
}
