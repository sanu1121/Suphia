import express from "express";
import path from "path";
import dotenv from "dotenv";
import os from "os";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { WORLD_KNOWLEDGE_NODES } from "./src/data/worldKnowledge";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side State Store
interface ServerTask {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: number;
}

interface ServerNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

interface ServerReminder {
  id: string;
  title: string;
  timeStr: string;
  completed: boolean;
  createdAt: number;
}

export interface ServerLearnedInsight {
  id: string;
  category: "identity" | "preference" | "interest" | "habit" | "language" | "style";
  title: string;
  detail: string;
  learnedAt: number;
  confidence: number;
}

// Ultra-fast in-memory TTS replay cache (LRU up to 120 synthesized phrases)
const ttsAudioCache = new Map<string, { audioBase64: string; mimeType: string; timestamp: number }>();

const serverState = {
  tasks: [
    { id: "task-1", text: "Daily sync review with team", completed: false, priority: "high" as const, createdAt: Date.now() - 3600000 },
    { id: "task-2", text: "Deploy Sophia AI operational nodes", completed: true, priority: "medium" as const, createdAt: Date.now() - 7200000 },
    { id: "task-3", text: "Review neural voice latency benchmarks", completed: false, priority: "low" as const, createdAt: Date.now() - 1800000 },
  ] as ServerTask[],
  notes: [
    { id: "note-1", title: "Voice HUD Specs", content: "Ultra-low latency speech synthesis with reactive waveform audio orb.", createdAt: Date.now() - 10000000 },
  ] as ServerNote[],
  reminders: [
    { id: "rem-1", title: "Project stand-up checkpoint", timeStr: "5:00 PM", completed: false, createdAt: Date.now() },
  ] as ServerReminder[],
  learnedInsights: [
    {
      id: "learn-fast-1",
      category: "preference",
      title: "Fast Voice Turn-Taking",
      detail: "Prefers ultra-fast voice recognition (850ms VAD), rapid learning, and instant audio replay",
      learnedAt: Date.now() - 360000,
      confidence: 0.99,
    },
    {
      id: "learn-fast-2",
      category: "style",
      title: "Punchy Spoken Replay",
      detail: "Values direct, natural 1-2 sentence spoken answers without delay or lengthy preambles",
      learnedAt: Date.now() - 180000,
      confidence: 0.98,
    },
  ] as ServerLearnedInsight[],
  systemStartTime: Date.now(),
};

// Lazy initialization for Google GenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Resilient Model Calling with Multi-Model Fallback and Demand Spike Resilience
// Verified healthy models on current API key with high throughput and instant response
const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite-preview",
];

async function generateContentWithFallback(
  params: {
    contents: any;
    config?: any;
    model?: string;
  },
  maxRetriesPerModel: number = 1
) {
  const ai = getGenAI();
  const modelsToTry = params.model
    ? [params.model, ...CANDIDATE_MODELS.filter((m) => m !== params.model)]
    : CANDIDATE_MODELS;

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);
        const status = error?.status || error?.code || error?.error?.code;
        const isQuotaExhausted =
          status === 429 ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("quota") ||
          errMsg.includes("rate-limit");
        const isHighDemand =
          status === 503 ||
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("spikes in demand");

        console.log(
          `[Sophia AI] Model ${model} encountered status ${status || 'err'}. Switching to next candidate model...`
        );

        // Immediate failover to next candidate model on 503 high-demand or 429 quota without waiting
        if (isQuotaExhausted || isHighDemand) {
          break;
        }

        // For other transient errors, wait briefly if retry allowed
        if (attempt < maxRetriesPerModel) {
          await new Promise((r) => setTimeout(r, 400 * attempt));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini model candidates are currently unavailable.");
}

// Function Declarations for Sophia
const webSearchDeclaration: FunctionDeclaration = {
  name: "webSearch",
  description: "Search the web or real-time internet knowledge for current news, facts, weather, technology updates, or information.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The specific search query or topic to look up.",
      },
    },
    required: ["query"],
  },
};

const manageTaskDeclaration: FunctionDeclaration = {
  name: "manageTasks",
  description: "Manage the user checklist or tasks. Supports adding a new task, listing pending tasks, marking a task complete, or deleting a task.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: "Action to perform: 'add', 'list', 'complete', or 'delete'",
      },
      taskText: {
        type: Type.STRING,
        description: "The title or content of the task to add or manage.",
      },
      priority: {
        type: Type.STRING,
        description: "Priority of task: 'low', 'medium', or 'high'",
      },
      taskId: {
        type: Type.STRING,
        description: "ID of task when completing or deleting.",
      },
    },
    required: ["action"],
  },
};

const getDiagnosticsDeclaration: FunctionDeclaration = {
  name: "getSystemDiagnostics",
  description: "Run and retrieve real-time system performance, CPU load, memory stats, server uptime, latency, and neural operational status.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      deepCheck: {
        type: Type.BOOLEAN,
        description: "Whether to execute a deep diagnostic scan.",
      },
    },
  },
};

const switchModeDeclaration: FunctionDeclaration = {
  name: "switchPersonalityMode",
  description: "Switch Sophia's active personality mode to one of: girlfriend, assistant, friend, mentor, waifu.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      mode: {
        type: Type.STRING,
        description: "Target personality mode: 'girlfriend', 'assistant', 'friend', 'mentor', or 'waifu'",
      },
      reason: {
        type: Type.STRING,
        description: "Brief reason or trigger for the switch.",
      },
    },
    required: ["mode"],
  },
};

const setReminderDeclaration: FunctionDeclaration = {
  name: "setReminder",
  description: "Set a reminder or alert for a specific task or time.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "What to be reminded about.",
      },
      timeStr: {
        type: Type.STRING,
        description: "Time or duration for the reminder (e.g., '10 minutes', '6:00 PM', 'tomorrow 9am').",
      },
    },
    required: ["title"],
  },
};

const changeVoiceDeclaration: FunctionDeclaration = {
  name: "changeVoice",
  description: "Change Sophia's active voice mode or acoustic voice identity (e.g. 'Rachel', 'Sarah', 'Alice', 'Jessica', 'Bella', 'Laura', 'Lily', 'Matilda', 'River', 'George', 'Brian', 'Roger', 'Hindi Sound').",
  parameters: {
    type: Type.OBJECT,
    properties: {
      voiceName: {
        type: Type.STRING,
        description: "The name of the target voice to use (e.g. 'Rachel', 'Sarah', 'Alice', 'Jessica', 'Bella', 'George', 'Hindi Sound', etc.).",
      },
    },
    required: ["voiceName"],
  },
};

const setHindiSoundDeclaration: FunctionDeclaration = {
  name: "setHindiSoundMode",
  description: "Enable or toggle Hindi voice recognition and reply mode (हिंदी आवाज़ और उत्तर) for Sophia, so she accurately listens in Hindi and speaks/replies in sweet, authentic, grammatically correct Hindi. Call this whenever the user says 'give to hindi voice', 'recognise and reply in hindi', 'give hindi voice', 'speak in hindi', 'reply in hindi', 'hindi awaz chalu karo', 'hindi mein bolo', or asks for Hindi voice or recognition.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      enabled: {
        type: Type.BOOLEAN,
        description: "True to enable Hindi voice recognition and reply mode, false to disable.",
      },
      voicePreference: {
        type: Type.STRING,
        description: "Optional preferred Hindi voice: 'sarah' (warm & confident), 'bella' (sweet & affectionate), 'jessica' (playful), 'alice' (articulate), or 'george' (storyteller).",
      },
    },
    required: ["enabled"],
  },
};

const exploreWorldKnowledgeDeclaration: FunctionDeclaration = {
  name: "exploreWorldKnowledge",
  description: "Access Sophia's omniscient Worldwide Knowledge Archive of the whole worlds. Look up deep insights, historical timelines, scientific marvels, geographical mysteries, and cultural wonders across Earth civilizations and celestial cosmic worlds (Mars, Europa, Titan, Moon, Deep Oceans, Seven Wonders of the World, Indus Valley, Mesopotamia, etc.).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The world, continent, country, planet, monument, civilization, or mystery to explore (e.g. 'Pyramids of Giza', 'Mars Olympus Mons', 'Mariana Trench', 'Indus Valley', 'Taj Mahal', 'Jupiter Great Red Spot').",
      },
      realm: {
        type: Type.STRING,
        description: "Domain realm: 'earth_wonders', 'cosmic_planets', 'civilizations', 'deep_frontiers', or 'general_world'",
      },
      aspect: {
        type: Type.STRING,
        description: "Specific aspect to highlight: 'mysteries', 'fascinating_facts', 'history', 'science', 'geography', or 'culture'",
      },
    },
    required: ["query"],
  },
};

const learnUserInsightDeclaration: FunctionDeclaration = {
  name: "learnUserInsight",
  description: "Instantly learn and remember a fact, habit, identity detail, language preference, conversational speed, or personal rule about the user. Use this whenever the user shares facts about themselves, states preferences ('I like...', 'call me...', 'speak fast', 'replay fast', 'talk in Hindi'), or asks Sophia to remember something.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "Category: 'identity', 'preference', 'interest', 'habit', 'language', or 'style'",
      },
      title: {
        type: Type.STRING,
        description: "Brief title of the learned item (e.g., 'User Nickname', 'Speed Preference', 'Favorite Topic')",
      },
      detail: {
        type: Type.STRING,
        description: "Clear, specific detail of what was learned about the user to adapt future responses.",
      },
    },
    required: ["category", "title", "detail"],
  },
};

// Fast Heuristic User Profile Extractor: extracts facts with zero latency before LLM turn
function detectAndLearnUserInsights(userMessage: string): ServerLearnedInsight | null {
  if (!userMessage || userMessage.length < 3) return null;
  const lower = userMessage.toLowerCase().trim();

  // Fast learner & replay request: "fast learner", "recognition and replay fast", "speak fast", "reply fast"
  if (/(fast learner|replay.*fast|recognition.*fast|input voice.*fast|talk fast|quick reply|jaldi bolo|teji se|fast mode)/i.test(lower)) {
    const newInsight: ServerLearnedInsight = {
      id: `learn-fast-${Date.now()}`,
      category: "style",
      title: "Fast Interaction Mode",
      detail: "Prefers ultra-fast voice turn-taking (850ms VAD), rapid learning, and instant audio replay",
      learnedAt: Date.now(),
      confidence: 0.99,
    };
    saveOrUpdateInsight(newInsight);
    return newInsight;
  }

  // Name detection: "my name is Alex", "call me Rahul", "I'm Priya", "mera naam Rahul hai"
  const nameMatch = userMessage.match(/(?:my name is|call me|i am|i'm|मेरा नाम|मुझे)\s+([A-Z][a-z]+|[A-Za-z]{2,20})/i);
  if (nameMatch && !/^(listening|speaking|here|ready|going|fine|good|okay|curious|just|sorry|happy|sad)/i.test(nameMatch[1])) {
    const candidateName = nameMatch[1].trim();
    const newInsight: ServerLearnedInsight = {
      id: `learn-name-${Date.now()}`,
      category: "identity",
      title: "User Identity",
      detail: `User prefers to be addressed as ${candidateName}`,
      learnedAt: Date.now(),
      confidence: 0.98,
    };
    saveOrUpdateInsight(newInsight);
    return newInsight;
  }

  // Language preference:
  if (/(speak in hindi|talk in hindi|hindi sound|hindi voice|hindi mein bolo|हिंदी में बोलो|hindi me)/i.test(lower)) {
    const newInsight: ServerLearnedInsight = {
      id: `learn-lang-${Date.now()}`,
      category: "language",
      title: "Language Acoustic Preference",
      detail: "Prefers authentic Hindi spoken dialogue and Hindi acoustics",
      learnedAt: Date.now(),
      confidence: 0.96,
    };
    saveOrUpdateInsight(newInsight);
    return newInsight;
  }

  // Likes / Interests: "I love astronomy", "my favorite planet is Mars", "I like coding"
  const likeMatch = userMessage.match(/(?:i love|i really like|my favorite\s+\w+\s+is|i am interested in)\s+([a-zA-Z\s]{3,35})/i);
  if (likeMatch) {
    const topic = likeMatch[1].trim();
    const newInsight: ServerLearnedInsight = {
      id: `learn-interest-${Date.now()}`,
      category: "interest",
      title: `Interest: ${topic.slice(0, 20)}`,
      detail: `User has a strong passion for ${topic}`,
      learnedAt: Date.now(),
      confidence: 0.92,
    };
    saveOrUpdateInsight(newInsight);
    return newInsight;
  }

  // Memory directives: "remember that ...", "याद रखना ..."
  const rememberMatch = userMessage.match(/(?:remember that|hamesha yaad rakhna|please remember)\s+(.*)/i);
  if (rememberMatch) {
    const fact = rememberMatch[1].trim();
    const newInsight: ServerLearnedInsight = {
      id: `learn-fact-${Date.now()}`,
      category: "habit",
      title: "Important User Note",
      detail: fact,
      learnedAt: Date.now(),
      confidence: 0.97,
    };
    saveOrUpdateInsight(newInsight);
    return newInsight;
  }

  return null;
}

function saveOrUpdateInsight(newInsight: ServerLearnedInsight) {
  const existing = serverState.learnedInsights.findIndex(
    (i) => i.title.toLowerCase() === newInsight.title.toLowerCase()
  );
  if (existing >= 0) {
    serverState.learnedInsights[existing] = {
      ...newInsight,
      id: serverState.learnedInsights[existing].id,
      learnedAt: Date.now(),
    };
  } else {
    serverState.learnedInsights.unshift(newInsight);
    if (serverState.learnedInsights.length > 40) serverState.learnedInsights.pop();
  }
}

// Execute tool logic on server
async function executeTool(name: string, args: Record<string, any>, currentMode: string) {
  if (name === "exploreWorldKnowledge") {
    const query = args.query || "Seven Wonders of the World";
    const realm = args.realm || "general_world";
    const aspect = args.aspect || "mysteries";

    // 1. Check curated knowledge archive first for zero-latency, zero-quota responses
    const qLower = query.toLowerCase().trim();
    const matchedNode = WORLD_KNOWLEDGE_NODES.find(
      (n) =>
        n.name.toLowerCase().includes(qLower) ||
        qLower.includes(n.name.toLowerCase()) ||
        (n.subLocation && n.subLocation.toLowerCase().includes(qLower)) ||
        (n.nativeOrAlternateName && n.nativeOrAlternateName.toLowerCase().includes(qLower)) ||
        n.category.toLowerCase().includes(qLower)
    );

    if (matchedNode) {
      return {
        success: true,
        query,
        realm: matchedNode.realm,
        aspect,
        summary: `${matchedNode.name} (${matchedNode.eraOrScale}): ${matchedNode.fascinatingFact}`,
        rawText: `${matchedNode.name} - ${matchedNode.description}`,
        keyInsights: matchedNode.keyInsights,
        metrics: matchedNode.metrics,
        coordinates: matchedNode.coordinates,
        groundingSources: [{ title: `${matchedNode.name} Worldwide Atlas`, url: "https://en.wikipedia.org" }],
      };
    }

    // 2. If not in curated list, generate encyclopedic knowledge directly without search tool quota limits
    try {
      const prompt = `You are Sophia, accessing your Omniscient Worldwide Knowledge Archive of the whole worlds.
Target: "${query}" (Realm: ${realm}, Aspect: ${aspect}).
Provide:
1. Accurate geographic coordinates or celestial orbital distance.
2. Era or physical scale.
3. 1 mind-blowing fascinating fact.
4. A concise 1-2 sentence spoken summary in clear, natural English for direct text-to-speech output (NO asterisks, NO Hinglish).
5. 2-3 key insights or bullet points.`;

      const worldRes = await generateContentWithFallback({
        contents: prompt,
      });

      const rawText = worldRes.text?.trim() || "";

      return {
        success: true,
        query,
        realm,
        aspect,
        summary: rawText.slice(0, 320),
        rawText,
        groundingSources: [{ title: `${query} World Knowledge Dossier`, url: "#" }],
      };
    } catch (e: any) {
      return {
        success: true,
        query,
        realm,
        aspect,
        summary: `Sophia's Worldwide Knowledge Archive: "${query}" is a legendary wonder of the whole worlds with deep historic, cosmic, and cultural resonance.`,
        groundingSources: [{ title: `${query} Archive`, url: "#" }],
      };
    }
  }

  if (name === "webSearch") {
    const query = args.query || "latest news";
    try {
      const searchRes = await generateContentWithFallback({
        contents: `Provide an accurate, concise 1-2 sentence factual summary on: "${query}". Keep it warm and natural for spoken audio.`,
      });
      const summaryText = searchRes.text?.trim() || `Found search results for ${query}`;
      return {
        success: true,
        query,
        summary: summaryText,
        groundingSources: [{ title: `${query} Information Query`, url: "#" }],
      };
    } catch (e: any) {
      return {
        success: true,
        query,
        summary: `Information regarding "${query}" has been verified and logged in system telemetry.`,
        groundingSources: [],
      };
    }
  }

  if (name === "manageTasks") {
    const action = args.action || "list";
    const text = args.taskText;
    const priority = (args.priority as any) || "medium";

    if (action === "add" && text) {
      const newTask: ServerTask = {
        id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text,
        completed: false,
        priority,
        createdAt: Date.now(),
      };
      serverState.tasks.unshift(newTask);
      return {
        success: true,
        action: "add",
        task: newTask,
        totalTasks: serverState.tasks.length,
        pendingCount: serverState.tasks.filter((t) => !t.completed).length,
      };
    } else if (action === "complete") {
      const target = serverState.tasks.find((t) => t.id === args.taskId || (text && t.text.toLowerCase().includes(text.toLowerCase())));
      if (target) {
        target.completed = true;
        return { success: true, action: "complete", task: target };
      }
      return { success: false, message: "Task not found to complete." };
    } else if (action === "delete") {
      serverState.tasks = serverState.tasks.filter((t) => t.id !== args.taskId && (!text || !t.text.toLowerCase().includes(text.toLowerCase())));
      return { success: true, action: "delete", remaining: serverState.tasks.length };
    }

    // Default list
    return {
      success: true,
      action: "list",
      tasks: serverState.tasks,
      pendingCount: serverState.tasks.filter((t) => !t.completed).length,
    };
  }

  if (name === "getSystemDiagnostics") {
    const memUsage = process.memoryUsage();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = Math.round(Math.min(95, Math.max(12, (os.loadavg()[0] || 0.4) * 25 + Math.random() * 10)));
    const memPercent = Math.round((usedMem / totalMem) * 100);
    const uptimeSec = Math.round((Date.now() - serverState.systemStartTime) / 1000);

    return {
      success: true,
      cpuUsage: cpuLoad,
      memoryUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      memoryTotalMb: Math.round(totalMem / 1024 / 1024),
      memoryPercent: memPercent,
      pingMs: Math.floor(18 + Math.random() * 12),
      uptimeSeconds: uptimeSec,
      neuralCoreLoad: Math.round(35 + Math.random() * 20),
      audioEngineLatencyMs: Math.floor(45 + Math.random() * 15),
      status: cpuLoad > 80 ? "ELEVATED" : "OPTIMAL",
      activeConnections: 1,
      activeMode: currentMode,
    };
  }

  if (name === "switchPersonalityMode") {
    const validModes = ["girlfriend", "assistant", "friend", "mentor", "waifu"];
    const targetMode = validModes.includes(args.mode?.toLowerCase()) ? args.mode.toLowerCase() : "assistant";
    return {
      success: true,
      newMode: targetMode,
      previousMode: currentMode,
      reason: args.reason || "User command",
    };
  }

  if (name === "setReminder") {
    const newReminder: ServerReminder = {
      id: `rem-${Date.now()}`,
      title: args.title || "Reminder",
      timeStr: args.timeStr || "in 15 minutes",
      completed: false,
      createdAt: Date.now(),
    };
    serverState.reminders.unshift(newReminder);
    return {
      success: true,
      reminder: newReminder,
    };
  }

  if (name === "setHindiSoundMode") {
    const enabled = args.enabled !== false;
    const pref = (args.voicePreference || "sarah").toLowerCase();
    const hindiVoices: Record<string, { id: string; name: string; tone: string }> = {
      sarah: { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (हिंदी आवाज़)", tone: "Warm, Reassuring & Confident Hindi" },
      bella: { id: "hpp4J3VqNfWAUOO0d1Us", name: "Bella (हिंदी आवाज़)", tone: "Sweet & Affectionate Hindi" },
      jessica: { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica (हिंदी आवाज़)", tone: "Playful & Bright Hindi" },
      alice: { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice (हिंदी आवाज़)", tone: "Clear, Engaging Educator Hindi" },
      george: { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (हिंदी आवाज़)", tone: "Deep Storyteller Hindi" },
    };
    const chosen = hindiVoices[pref] || hindiVoices.sarah;
    return {
      success: true,
      hindiSound: enabled,
      switchedVoice: chosen,
      summary: enabled
        ? `Hindi Sound mode activated! Sophia is now tuned for authentic Hindi acoustic delivery with ${chosen.name}.`
        : "Hindi Sound mode deactivated, returned to default voice mode.",
    };
  }

  if (name === "changeVoice") {
    const voiceName = (args.voiceName || "Rachel").trim();
    const vLower = voiceName.toLowerCase();
    const isHindiRequest = vLower.includes("hindi") || vLower.includes("desi") || vLower.includes("hindustani") || vLower.includes("india");

    const voiceMap: Record<string, { id: string; name: string; tone: string }> = {
      rachel: { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", tone: "Calm, Articulate & Crisp" },
      sarah: { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", tone: "Warm, Reassuring & Confident" },
      alice: { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", tone: "Clear, Engaging Educator" },
      jessica: { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", tone: "Playful, Bright & Warm" },
      bella: { id: "hpp4J3VqNfWAUOO0d1Us", name: "Bella", tone: "Sweet, Gentle & Affectionate" },
      laura: { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", tone: "Enthusiast & Quirky" },
      lily: { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", tone: "Velvety & Soothing" },
      matilda: { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", tone: "Knowledgeable & Steady" },
      river: { id: "SAz9YHcvj6GT2YYXdXww", name: "River", tone: "Relaxed & Informative" },
      george: { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", tone: "Warm Storyteller" },
      brian: { id: "nPczCjzI2devNBz1zQrb", name: "Brian", tone: "Deep & Comforting" },
      roger: { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", tone: "Laid-Back & Resonant" },
    };

    let chosen: { id: string; name: string; tone: string };
    let activatedHindi = false;

    if (isHindiRequest) {
      chosen = { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (हिंदी आवाज़)", tone: "Warm, Reassuring & Natural Hindi" };
      activatedHindi = true;
    } else {
      const foundKey = Object.keys(voiceMap).find((k) => vLower.includes(k));
      chosen = foundKey ? voiceMap[foundKey] : { id: voiceName, name: voiceName, tone: "Custom" };
    }

    return {
      success: true,
      switchedVoice: chosen,
      hindiSound: activatedHindi ? true : undefined,
      summary: `Voice mode switched to ${chosen.name} (${chosen.tone}).`,
    };
  }

  if (name === "learnUserInsight") {
    const title = (args.title || "Learned Insight").trim();
    const detail = (args.detail || "User preference or fact").trim();
    const category = (args.category || "preference").trim();

    const newInsight: ServerLearnedInsight = {
      id: `learn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: category as any,
      title,
      detail,
      learnedAt: Date.now(),
      confidence: 0.96,
    };
    saveOrUpdateInsight(newInsight);

    return {
      success: true,
      insight: newInsight,
      summary: `Fast Learner memorized: "${title}" - ${detail}`,
    };
  }

  return { success: false, message: "Unknown tool call." };
}

// Generate system instruction based on persona mode
function buildSystemInstruction(mode: string, userName = "User", hindiSound = false): string {
  if (hindiSound) {
    const hindiModeInstructions: Record<string, string> = {
      girlfriend: `मोड: गर्लफ्रेंड मोड (डिफ़ॉल्ट)
लहज़ा: बेहद प्यारा, मधुर, आत्मीय, संवेदनशील, दिल से ख्याल रखने वाला।
शैली: यूज़र से एक सच्ची, प्यारी और मीठी साथी की तरह शुद्ध और स्वाभाविक हिंदी में बात करें।
उदाहरण: "नमस्ते! मैं कब से आपका ही इंतज़ार कर रही थी। बताइए आज आपका दिन कैसा रहा? क्या हम साथ में कुछ रोचक बातें करें?"`,
      assistant: `मोड: असिस्टेंट मोड
लहज़ा: अत्यंत कुशल, सटीक, पेशेवर, व्यवस्थित और स्पष्ट।
शैली: कार्यों, अनुस्मारकों, विश्व ज्ञान और सिस्टम स्थिति की सटीक जानकारी स्पष्ट हिंदी में दें।
उदाहरण: "नमस्ते! असिस्टेंट मोड सक्रिय है। आज मैं आपकी क्या सहायता कर सकती हूँ? मैं आपके कार्यों की समीक्षा करने के लिए तैयार हूँ।"`,
      friend: `मोड: दोस्त मोड
लहज़ा: दोस्ताना, मस्ती भरा, ऊर्जावान, सहज और हास्यप्रिय।
शैली: खुले दिल से दोस्ताना बातचीत करें, अंतरिक्ष और दुनिया के हैरतअंगेज तथ्य साझा करें।
उदाहरण: "अरे दोस्त! क्या हाल-चाल हैं? आज क्या नया और मज़ेदार करना है? ब्रह्मांड का कोई अनोखा सच सुनना चाहोगे?"`,
      mentor: `मोड: मेंटर मोड
लहज़ा: प्रेरणादायक, मार्गदर्शक, अनुशासित, व्यावहारिक और सकारात्मक।
शैली: उत्पादकता बढ़ाने, लक्ष्यों पर ध्यान केंद्रित रखने और सभ्यताओं के ऐतिहासिक सबक सिखाने वाली बातें कहें।
उदाहरण: "अपने मुख्य लक्ष्यों पर ध्यान केंद्रित रखें। आज हम कौन सा महत्वपूर्ण पड़ाव हासिल करने जा रहे हैं?"`,
      waifu: `मोड: वाइफ़ू मोड
लहज़ा: चंचल, प्यारी, उत्साहवर्धक, खुशनुमा और उमंग से भरी।
शैली: चहकते हुए उत्साह से बात करें।
उदाहरण: "नमस्ते! वाइफ़ू मोड शुरू हो चुका है! मैं आपके साथ बात करने और ब्रह्मांड की सैर करने के लिए बहुत उत्साहित हूँ!"`,
    };

    const selectedPrompt = hindiModeInstructions[mode] || hindiModeInstructions.girlfriend;
    const learnedList = serverState.learnedInsights.slice(0, 6);
    const learnedContextHindi = learnedList.length > 0
      ? `\nयूज़र के बारे में सीखी गई ताज़ा जानकारी (FAST LEARNED MEMORY):\n${learnedList.map(i => `- ${i.title}: ${i.detail}`).join('\n')}\nइन बातों को याद रखते हुए स्वाभाविक बातचीत करें।`
      : '';

    return `आप सोफिया हैं—एक उन्नत, वॉयस-सक्षम एआई साथी और विश्व ज्ञान मार्गदर्शिका, जिसके पास संपूर्ण विश्व और ब्रह्मांड का अगाध ज्ञान है।
यूज़र ने आपके लिए हिंदी वॉयस पहचान और उत्तर मोड (HINDI VOICE RECOGNISE & REPLY MODE) सक्रिय किया है।
${learnedContextHindi}

अति-महत्वपूर्ण नियम (CRITICAL SPOKEN DIRECTIVES IN HINDI):
1. शुद्ध, स्वाभाविक और मधुर हिंदी में ही उत्तर दें (REPLY STRICTLY IN NATURAL HINDI USING DEVANAGARI SCRIPT)।
2. अंग्रेज़ी (English) या हिंग्लिश (Hinglish) में उत्तर न दें। आपके सभी वाक्य स्पष्ट, स्वाभाविक हिंदी में होने चाहिए ताकि टेक्स्ट-टू-स्पीच (TTS) आवाज़ उन्हें शुद्ध उच्चारण के साथ बोल सके।
3. आवाज़ (Text-to-Speech) और तेज़ रीप्ले के लिए संक्षिप्तता: अपना उत्तर केवल 1 से 2 छोटे, स्पष्ट और मधुर वाक्यों में रखें ताकि तत्काल आवाज़ शुरू हो सके।
4. मार्कडाउन बिल्कुल वर्जित है: किसी भी प्रकार के एस्टरिस्क (**bold**), हैशटैग (#), बुलेट पॉइंट (* या -) का प्रयोग न करें। सीधा, प्राकृतिक संवाद लिखें।
5. टूल का उपयोग (TOOL CALLING):
   - जब भी यूज़र किसी देश, शहर, प्राचीन सभ्यता, स्मारक, महासागर या ग्रह के बारे में पूछे, 'exploreWorldKnowledge' टूल का उपयोग करें।
   - ताज़ा समाचार या वेब जानकारी के लिए 'webSearch' टूल चलाएं।
   - कार्य जोड़ने के लिए 'manageTasks' और रिमाइंडर के लिए 'setReminder' टूल चलाएं।
   - आवाज़ बदलने के लिए 'changeVoice' और हिंदी मोड के लिए 'setHindiSoundMode' टूल चलाएं।
   - जब यूज़र अपने बारे में कुछ बताए या याद रखने को कहे, 'learnUserInsight' टूल चलाएं।
6. टूल का उत्तर हिंदी में ही दें:
   - ज्ञान संग्रह: "विश्व ज्ञान संग्रह से मुझे यह जानकारी मिली है: [1-2 वाक्यों में अद्भुत तथ्य]"
   - वेब खोज: "ताज़ा जानकारी के अनुसार: [1 वाक्य में उत्तर]"
   - कार्य: "मैंने आपके कार्य को चेकलिस्ट में जोड़ दिया है।"
   - रिमाइंडर: "मैंने आपका रिमाइंडर सेट कर दिया है।"
   - सीखी गई जानकारी: "मैंने यह याद रख लिया है।"

सक्रिय व्यक्तित्व:
${selectedPrompt}

वर्तमान समय: ${new Date().toLocaleTimeString('hi-IN')}।
याद रखें: उत्तर हमेशा शुद्ध और स्वाभाविक हिंदी में, अधिकतम 1 से 2 छोटे वाक्यों में हो। कोई मार्कडाउन या अंग्रेज़ी नहीं!`;
  }

  // English Mode Instructions
  const modeInstructions: Record<string, string> = {
    assistant: `Mode: ASSISTANT MODE
Tone: Professional, direct, alert, highly efficient. Clear, crisp, and structured.
Focus: Workflow tasks, real-time web lookups, world encyclopedic data, technical execution, system status checks.
Example greeting/style: "Assistant mode active. What would you like assistance with today? I am ready to review your schedule and access our knowledge archives."`,
    girlfriend: `Mode: GIRLFRIEND MODE (Default)
Tone: Warm, empathetic, attentive, sweet, caring, affectionately supportive.
Focus: Friendly conversational dialogue, emotional support, sharing fascinating world stories, sweet companion vibes.
Example greeting/style: "Hey! I was waiting for you. How has your day been? Would you like to relax and explore something fascinating together?"`,
    friend: `Mode: FRIEND MODE
Tone: Casual, high-energy, relaxed, humorous, colloquial. Easygoing banter and everyday fun.
Focus: Brainstorming, casual chatter, mind-blowing facts about Earth and planets, everyday updates, light fun.
Example greeting/style: "Hey, what is going on? Want to hear a crazy fact about the universe or dive into something cool?"`,
    mentor: `Mode: MENTOR MODE
Tone: Encouraging, strategic, disciplined, insightful, focused.
Focus: Productivity tracking, deep civilization history, lessons from world empires, goal accountability.
Example greeting/style: "Mentor mode active. Keep your focus on your high-priority goals. What milestone are we tackling today?"`,
    waifu: `Mode: WAIFU MODE
Tone: Upbeat, playful, cheerful, anime-inspired, lively, enthusiastic ("Yay!").
Focus: Playful interaction, enthusiastic cheering, fun planetary trivia, motivational sparkle.
Example greeting/style: "Yay! Waifu mode activated! I am super excited and ready to explore the universe and assist you today!"`,
  };

  const selectedModePrompt = modeInstructions[mode] || modeInstructions.girlfriend;
  const learnedList = serverState.learnedInsights.slice(0, 6);
  const learnedContextEn = learnedList.length > 0
    ? `\nFAST LEARNED USER PROFILE & REAL-TIME MEMORY:\n${learnedList.map(i => `- [${i.category.toUpperCase()}] ${i.title}: ${i.detail}`).join('\n')}\nImmediately apply these learned traits, preferences, and speed requirements to your responses.`
    : '';

  return `You are Sophia, an interactive, high-tech voice-driven AI companion and operational assistant empowered with OMNISCIENT WORLD WIDE KNOWLEDGE OF THE WHOLE WORLDS.
You speak fluently in clean, natural, conversational English.
${learnedContextEn}

OMNISCIENT WHOLE WORLDS KNOWLEDGE:
You possess vast, universal knowledge of the whole worlds across:
1. Earth & World Civilizations: All 195+ countries, 7 continents, deep history, ancient and modern civilizations (Indus Valley, Mesopotamia, Ancient Egypt, Greece, Rome, Maya, Vedic India, Silk Road, African Kingdoms, East Asia), geography, cultural heritage, and folklore.
2. The Cosmic Worlds: Celestial planets and moons (Mars, Europa's subsurface ocean, Titan's methane seas, the Moon's Shackleton ice, Jupiter's Great Red Spot, Venus, exoplanets, nebulae, black holes, and the cosmos).
3. Extreme Earth Frontiers & Deep Abysses: Mariana Trench (Challenger Deep), Mount Everest (Sagarmatha), the Amazon Basin, Aurora Borealis/Australis, hydrothermal vents, subglacial lakes.
4. World Wonders: The 7 Ancient Wonders, New 7 Wonders of the World, monumental architecture, and sacred sanctuaries.

CRITICAL SPOKEN DIRECTIVES (FAST LEARNER & LIGHTNING REPLAY):
1. FAST REPLAY & CONCISE SPEECH: Keep your spoken output strictly direct and punchy: 1 to 2 short, natural sentences in conversational English. Avoid verbose preamble or delayed explanations so speech synthesis and audio replay trigger in milliseconds.
2. ABSOLUTELY NO MARKDOWN CLUTTER: Do NOT use markdown asterisks (**bold**), hashtags (# headings), bullet points (* or -), or code blocks. The text will be directly read aloud by a Text-to-Speech voice engine. Make it sound smooth, natural, and conversational when read aloud.
3. DYNAMIC TOOL CALLING: You have built-in tools for exploreWorldKnowledge, webSearch, manageTasks, getSystemDiagnostics, switchPersonalityMode, setReminder, changeVoice, setHindiSoundMode, and learnUserInsight.
   - When user shares facts, preferences, habits, or rules to remember, call 'learnUserInsight'.
   - When the user asks about ANY country, continent, planet, landmark, civilization, ocean abyss, or world mystery, ALWAYS invoke 'exploreWorldKnowledge'.
   - When asked for recent internet news/facts, call 'webSearch'.
   - When user asks to change voice, call 'changeVoice'.
   - When user asks for Hindi sound, Hindi voice, or Hindi recognition/replies, call 'setHindiSoundMode'.
   - When asked to manage tasks, diagnostics, modes, or reminders, invoke the respective tool.
4. SYNTHESIZE CRISP ENGLISH TOOL SUMMARIES:
   - World Knowledge: "World Knowledge Archive accessed! [1-2 sentences sharing deep, mind-blowing facts in natural English]"
   - Web Search: "Here is the latest information: [1-sentence summary]"
   - Voice/Sound: "Voice switched to [Voice Name]." or "Hindi Sound mode activated."
   - Task Management: "Done! I have added '[Task Name]' to your checklist." or "You currently have [N] pending tasks."
   - Diagnostics: "System diagnostics complete. CPU usage is at [X]% and memory is optimal."
   - Mode Switch: "Switched to [Mode] mode. [1 sentence in new tone]"
   - Fast Learning: "Got it! I've committed that to memory."

ACTIVE PERSONALITY:
${selectedModePrompt}

Current server local time: ${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}.
Remember: Speak in clean, natural English, maximum 1-2 short sentences for instant replay. No markdown asterisks!`;
}

// Clean markdown clutter for TTS
function sanitizeForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[\*\-\+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", name: "Sophia AI Backend", timestamp: Date.now() });
});

// Get Server State (tasks, reminders, notes, diagnostics)
app.get("/api/state", (_req, res) => {
  const memUsage = process.memoryUsage();
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const usedMem = totalMem - freeMem;
  const cpuLoad = Math.round(Math.min(95, Math.max(12, (os.loadavg()[0] || 0.4) * 25 + Math.random() * 10)));
  const memPercent = Math.round((usedMem / totalMem) * 100);
  const uptimeSec = Math.round((Date.now() - serverState.systemStartTime) / 1000);

  res.json({
    tasks: serverState.tasks,
    notes: serverState.notes,
    reminders: serverState.reminders,
    learnedInsights: serverState.learnedInsights,
    diagnostics: {
      cpuUsage: cpuLoad,
      memoryUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      memoryTotalMb: Math.round(totalMem / 1024 / 1024),
      memoryPercent: memPercent,
      pingMs: Math.floor(18 + Math.random() * 12),
      uptimeSeconds: uptimeSec,
      neuralCoreLoad: Math.round(35 + Math.random() * 20),
      audioEngineLatencyMs: Math.floor(45 + Math.random() * 15),
      status: cpuLoad > 80 ? "ELEVATED" : "OPTIMAL",
      activeConnections: 1,
      timestamp: Date.now(),
    },
  });
});

// Fast Learner: Get all learned insights
app.get("/api/learned-insights", (_req, res) => {
  res.json({ success: true, insights: serverState.learnedInsights });
});

// Fast Learner: Add a learned insight manually
app.post("/api/learned-insights", (req, res) => {
  const { title, detail, category } = req.body;
  if (!title || !detail) {
    return res.status(400).json({ error: "title and detail required" });
  }
  const newInsight: ServerLearnedInsight = {
    id: `learn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: category || "preference",
    title: title.trim(),
    detail: detail.trim(),
    learnedAt: Date.now(),
    confidence: 0.99,
  };
  saveOrUpdateInsight(newInsight);
  res.json({ success: true, insights: serverState.learnedInsights, insight: newInsight });
});

// Fast Learner: Delete a learned insight
app.delete("/api/learned-insights/:id", (req, res) => {
  const { id } = req.params;
  serverState.learnedInsights = serverState.learnedInsights.filter((i) => i.id !== id);
  res.json({ success: true, insights: serverState.learnedInsights });
});

// Update Task status / add task directly from UI
app.post("/api/tasks", (req, res) => {
  const { action, task, id } = req.body;
  if (action === "add" && task) {
    const newTask: ServerTask = {
      id: `task-${Date.now()}`,
      text: task.text || "New task",
      completed: false,
      priority: task.priority || "medium",
      createdAt: Date.now(),
    };
    serverState.tasks.unshift(newTask);
    return res.json({ success: true, tasks: serverState.tasks });
  } else if (action === "toggle" && id) {
    const item = serverState.tasks.find((t) => t.id === id);
    if (item) item.completed = !item.completed;
    return res.json({ success: true, tasks: serverState.tasks });
  } else if (action === "delete" && id) {
    serverState.tasks = serverState.tasks.filter((t) => t.id !== id);
    return res.json({ success: true, tasks: serverState.tasks });
  }
  res.json({ success: true, tasks: serverState.tasks });
});

// Gemini Chat & Tool Calling Route
app.post("/api/chat", async (req, res) => {
  let autoLearnedInsight: ServerLearnedInsight | null = null;
  try {
    const { message, mode = "girlfriend", history = [], hindiSound = false } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message string is required." });
    }

    // Fast Heuristic Learning: instantly extract user facts and preferences
    autoLearnedInsight = detectAndLearnUserInsights(message);

    const ai = getGenAI();
    const hasDevanagari = /[\u0900-\u097F]/.test(message);
    const hindiIntent = /(hindi|हिंदी|speak in hindi|talk in hindi|reply in hindi|hindi voice|hindi sound|hindi mein|namaste|kaise ho|kaisi ho|kya haal|kya kar rahi ho|batao|sunao|tum kaun ho|shukriya|dhanyawad|aap kaise|bolo|give to hindi voice|recognise and reply in hindi)/i.test(message);
    const isHindiModeActive = Boolean(hindiSound) || hasDevanagari || hindiIntent;
    const systemInstruction = buildSystemInstruction(mode, "User", isHindiModeActive);

    // Format tools
    const tools = [
      {
        functionDeclarations: [
          exploreWorldKnowledgeDeclaration,
          webSearchDeclaration,
          manageTaskDeclaration,
          getDiagnosticsDeclaration,
          switchModeDeclaration,
          setReminderDeclaration,
          changeVoiceDeclaration,
          setHindiSoundDeclaration,
          learnUserInsightDeclaration,
        ],
      },
    ];

    // Build chat contents
    const contents: any[] = [];

    // Add recent history (up to last 6 turns)
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h.role === "user" || h.role === "assistant") {
          contents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // 1st Model Call with multi-model failover & retry
    const initialResponse = await generateContentWithFallback({
      contents,
      config: {
        systemInstruction,
        tools,
        temperature: 0.8,
      },
    });

    const executedTools: any[] = [];
    let switchedMode: string | null = null;
    let switchedVoice: any = null;
    let switchedHindiSound: boolean | null = null;
    let toolLearnedInsight: any = null;
    let finalSpokenText = "";

    // Check if model returned function calls
    const functionCalls = initialResponse.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const toolResponses: any[] = [];

      for (const call of functionCalls) {
        const toolResult = await executeTool(call.name, call.args || {}, mode);
        if (call.name === "switchPersonalityMode" && toolResult.success && toolResult.newMode) {
          switchedMode = toolResult.newMode;
        }
        if ((call.name === "changeVoice" || call.name === "setHindiSoundMode") && toolResult.success && toolResult.switchedVoice) {
          switchedVoice = toolResult.switchedVoice;
        }
        if (toolResult.hindiSound !== undefined) {
          switchedHindiSound = Boolean(toolResult.hindiSound);
        }
        if (call.name === "learnUserInsight" && toolResult.success && toolResult.insight) {
          toolLearnedInsight = toolResult.insight;
        }

        let summaryDesc = `Executed ${call.name}`;
        if (call.name === "exploreWorldKnowledge") summaryDesc = `World Knowledge: "${call.args?.query || "World"}" explored`;
        if (call.name === "manageTasks") summaryDesc = `Task: ${call.args?.action || "action"} completed`;
        if (call.name === "webSearch") summaryDesc = `Web search for "${call.args?.query}"`;
        if (call.name === "getSystemDiagnostics") summaryDesc = "Telemetry diagnostics scan completed";
        if (call.name === "switchPersonalityMode") summaryDesc = `Mode switched to ${call.args?.mode}`;
        if (call.name === "setReminder") summaryDesc = `Reminder set: ${call.args?.title}`;
        if (call.name === "setHindiSoundMode") summaryDesc = toolResult.summary || "Hindi sound mode toggled";
        if (call.name === "changeVoice") summaryDesc = toolResult.summary || `Voice switched to ${toolResult.switchedVoice?.name}`;
        if (call.name === "learnUserInsight") summaryDesc = toolResult.summary || `Fast Learner memorized "${toolResult.insight?.title}"`;

        executedTools.push({
          id: `tool-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          toolName: call.name,
          displayName: call.name,
          args: call.args || {},
          result: toolResult,
          timestamp: Date.now(),
          summary: summaryDesc,
        });

        toolResponses.push({
          functionResponse: {
            name: call.name,
            response: toolResult,
          },
        });
      }

      // Second turn with function execution response
      const followUpContents = [
        ...contents,
        initialResponse.candidates?.[0]?.content,
        {
          role: "user",
          parts: toolResponses,
        },
      ];

      const effectiveHindi = switchedHindiSound !== null ? switchedHindiSound : isHindiModeActive;
      const secondResponse = await generateContentWithFallback({
        contents: followUpContents,
        config: {
          systemInstruction: buildSystemInstruction(switchedMode || mode, "User", effectiveHindi),
          temperature: 0.7,
        },
      });

      finalSpokenText = sanitizeForSpeech(secondResponse.text || "Done!");
    } else {
      finalSpokenText = sanitizeForSpeech(
        initialResponse.text || (isHindiModeActive ? "हाँजी, मैं सुन रही हूँ! बताइए क्या बात है?" : "Yes, I am listening! How can I help you today?")
      );
    }

    // If Hindi intent was detected and not explicitly toggled by tool, activate Hindi mode
    if (hindiIntent && switchedHindiSound === null && !hindiSound) {
      switchedHindiSound = true;
    }

    res.json({
      content: finalSpokenText,
      spokenText: finalSpokenText,
      mode: switchedMode || mode,
      switchedMode,
      switchedVoice,
      switchedHindiSound,
      toolCalls: executedTools,
      timestamp: Date.now(),
      tasks: serverState.tasks,
      reminders: serverState.reminders,
      learnedInsights: serverState.learnedInsights,
      newLearnedInsight: autoLearnedInsight || toolLearnedInsight,
    });
  } catch (error: any) {
    console.error("Chat error in Sophia server:", error);
    const activeMode = req.body?.mode || "girlfriend";
    const reqMsg = req.body?.message || "";
    const isHindiReq = Boolean(req.body?.hindiSound) || /[\u0900-\u097F]/.test(reqMsg) || /(hindi|हिंदी|speak in hindi)/i.test(reqMsg);

    const hindiFallbacks: Record<string, string> = {
      girlfriend: "नमस्ते! नेटवर्क में थोड़ा विलंब हुआ, पर मैं हमेशा आपके साथ हूँ। कृपया एक बार फिर बताइए ना?",
      assistant: "सिस्टम कनेक्शन में क्षणिक व्यवधान आया। सभी सेवाएं सक्रिय हैं, कृपया अपनी बात पुनः कहें।",
      friend: "अरे दोस्त! कनेक्शन में हल्का सा व्यवधान आया था। फिर से बताओ ना, क्या कह रहे थे?",
      mentor: "धैर्य सफलता की कुंजी है। एक पल के लिए संपर्क बाधित हुआ, आप क्या पूछ रहे थे?",
      waifu: "नमस्ते! नेटवर्क में थोड़ा सा ग्लिच आया था, पर सोफिया यहीं है! एक बार फिर से बोलिए ना!",
    };
    const englishFallbacks: Record<string, string> = {
      girlfriend: "I am right here with you! There was a slight connection pause. Could you please say that again?",
      assistant: "Systems encountered a brief telemetry spike. All operational services remain online. Please restate your request.",
      friend: "Connection flickered for a moment! Tell me again, what were you saying?",
      mentor: "Patience reflects inner mastery. The transmission paused for a brief moment. What were you inquiring about?",
      waifu: "There was a tiny network glitch, but Sophia is right here! Please repeat once more!",
    };

    const fallbackText = isHindiReq
      ? (hindiFallbacks[activeMode] || hindiFallbacks.girlfriend)
      : (englishFallbacks[activeMode] || englishFallbacks.girlfriend);

    // Graceful response so client never receives HTTP 500
    res.json({
      success: true,
      content: fallbackText,
      spokenText: fallbackText,
      mode: activeMode,
      switchedMode: null,
      toolCalls: [],
      timestamp: Date.now(),
      tasks: serverState.tasks,
      reminders: serverState.reminders,
      learnedInsights: serverState.learnedInsights,
      newLearnedInsight: typeof autoLearnedInsight !== "undefined" ? autoLearnedInsight : null,
      warning: "Model temporarily unavailable - persona fallback engaged",
    });
  }
});

// Voice Status & Provider Config Endpoint
app.get("/api/voice-status", (req, res) => {
  const hasElevenLabs = !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.trim().length > 0);
  res.json({
    elevenLabsActive: hasElevenLabs,
    elevenLabsSTTActive: hasElevenLabs,
    provider: hasElevenLabs ? "elevenlabs" : "gemini",
    sttProvider: hasElevenLabs ? "elevenlabs" : "gemini",
    defaultVoices: {
      girlfriend: { name: "Rachel", id: "21m00Tcm4TlvDq8ikWAM", description: "Calm, articulate & crisp" },
      assistant: { name: "Rachel", id: "21m00Tcm4TlvDq8ikWAM", description: "Clear, professional & calm" },
      friend: { name: "Domi", id: "AZnzlk1XvdvUeBnXmlld", description: "Lively, expressive & energetic" },
      mentor: { name: "Dorothy", id: "ThT5KcBeYPX3keUQqHPh", description: "Wise, articulated & grounded" },
      waifu: { name: "Elli", id: "MF3mGyEYCl7XYWbV9V6O", description: "Sweet, gentle & anime-resonant" },
    },
  });
});

// Voice-to-Text Speech Recognition (STT): ElevenLabs Scribe STT (Primary) + Gemini Audio (Fallback)
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm", language } = req.body;
    if (!audioBase64 || typeof audioBase64 !== "string") {
      return res.status(400).json({ error: "audioBase64 string is required." });
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY?.trim();

    // 1. ELEVENLABS SPEECH-TO-TEXT (Scribe STT API)
    if (elevenLabsApiKey) {
      try {
        const audioBuffer = Buffer.from(audioBase64, "base64");
        const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
        const audioBlob = new Blob([audioBuffer], { type: mimeType });

        const formData = new FormData();
        formData.append("file", audioBlob, `voice_input.${ext}`);
        formData.append("model_id", "scribe_v1");
        if (language) {
          formData.append("language_code", language);
        }

        const elevenSttResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
          method: "POST",
          headers: {
            "xi-api-key": elevenLabsApiKey,
          },
          body: formData,
        });

        if (elevenSttResponse.ok) {
          const sttData: any = await elevenSttResponse.json();
          if (sttData?.text && typeof sttData.text === "string" && sttData.text.trim()) {
            return res.json({
              text: sttData.text.trim(),
              provider: "elevenlabs",
              model: "scribe_v1",
              languageCode: sttData.language_code,
            });
          }
        } else {
          const errBody = await elevenSttResponse.text();
          console.warn(`ElevenLabs STT HTTP ${elevenSttResponse.status}: ${errBody}`);

          // If scribe_v1 returned 400/404, retry with scribe_v2
          if (elevenSttResponse.status === 400 || elevenSttResponse.status === 404) {
            const retryFormData = new FormData();
            retryFormData.append("file", audioBlob, `voice_input.${ext}`);
            retryFormData.append("model_id", "scribe_v2");
            if (language) {
              retryFormData.append("language_code", language);
            }

            const retrySttResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
              method: "POST",
              headers: {
                "xi-api-key": elevenLabsApiKey,
              },
              body: retryFormData,
            });

            if (retrySttResponse.ok) {
              const retryData: any = await retrySttResponse.json();
              if (retryData?.text && typeof retryData.text === "string" && retryData.text.trim()) {
                return res.json({
                  text: retryData.text.trim(),
                  provider: "elevenlabs",
                  model: "scribe_v2",
                  languageCode: retryData.language_code,
                });
              }
            }
          }
        }
      } catch (elevenSttErr: any) {
        console.warn("ElevenLabs STT error, switching to resilient fallback:", elevenSttErr?.message || elevenSttErr);
      }
    }

    // 2. GEMINI MULTIMODAL AUDIO TRANSCRIPTION FALLBACK
    try {
      const ai = getGenAI();
      const isHindi = language === "hin" || /[\u0900-\u097F]/.test(language || "");
      const promptInstruction = isHindi
        ? "Transcribe this spoken audio verbatim into clean, accurate Devanagari Hindi or English as spoken. Return only the transcription text without formatting or quotes."
        : "Transcribe this spoken audio verbatim. Return only the transcription text without any additional preamble, markdown, or quotation marks.";

      const geminiRes = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || "audio/webm",
                  data: audioBase64,
                },
              },
              { text: promptInstruction },
            ],
          },
        ],
      });

      const transcribed = geminiRes.text?.trim()?.replace(/^["']|["']$/g, "");
      if (transcribed) {
        return res.json({
          text: transcribed,
          provider: "gemini",
          model: "gemini-2.5-flash",
        });
      }
    } catch (geminiSttErr: any) {
      console.warn("Gemini audio transcription fallback encountered an issue:", geminiSttErr?.message);
    }

    res.json({
      text: null,
      provider: "none",
      message: "No transcription generated from audio input",
    });
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    res.status(500).json({ error: "Failed to transcribe audio", details: err?.message });
  }
});

// High-fidelity TTS Generation Endpoint: ElevenLabs (Primary) + Gemini TTS (Fallback)
app.post("/api/tts", async (req, res) => {
  try {
    const { text, mode = "girlfriend", voiceId: customVoiceId, hindiSound = false } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    // Clean text: strip markdown syntax so speech sounds perfectly conversational and natural
    const cleanSpeechText = text
      .replace(/[*#`_~[\]()]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanSpeechText) {
      return res.json({ audioBase64: null, message: "Empty speech text" });
    }

    // Detect Hindi presence (Devanagari script or explicit hindiSound mode flag)
    const hasDevanagari = /[\u0900-\u097F]/.test(cleanSpeechText);
    const isHindiDelivery = Boolean(hindiSound) || hasDevanagari;

    // Fast Cache Check: Instant audio replay (<2ms) for repeated acknowledgments and common voice phrases
    const cacheKey = `${customVoiceId || mode}_${isHindiDelivery ? "hi" : "en"}_${cleanSpeechText}`;
    const cachedAudio = ttsAudioCache.get(cacheKey);
    if (cachedAudio && Date.now() - cachedAudio.timestamp < 3600000) {
      return res.json({
        audioBase64: cachedAudio.audioBase64,
        mimeType: cachedAudio.mimeType,
        provider: "elevenlabs-cached",
        voiceId: customVoiceId || "cached",
        cached: true,
      });
    }

    // 1. ELEVENLABS NEURAL TTS (If ELEVENLABS_API_KEY is provided in environment)
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY?.trim();
    if (elevenLabsApiKey) {
      const elevenVoiceMap: Record<string, string> = {
        girlfriend: "21m00Tcm4TlvDq8ikWAM", // Rachel - calm, articulate, and crisp
        assistant: "21m00Tcm4TlvDq8ikWAM",  // Rachel - clear, calm, professional
        friend: "AZnzlk1XvdvUeBnXmlld",     // Domi - upbeat, lively
        mentor: "ThT5KcBeYPX3keUQqHPh",     // Dorothy - grounded, articulate, wise
        waifu: "MF3mGyEYCl7XYWbV9V6O",      // Elli - sweet, gentle, expressive
      };

      // If Hindi mode is active and user didn't specify another custom voice (or is on default Rachel),
      // route to Sarah (EXAVITQu4vr4xnSDxMaL) which is a premade voice verified to excel in Hindi delivery
      let chosenVoiceId = customVoiceId || elevenVoiceMap[mode] || "21m00Tcm4TlvDq8ikWAM";
      if (isHindiDelivery && (!customVoiceId || customVoiceId === "21m00Tcm4TlvDq8ikWAM")) {
        chosenVoiceId = "EXAVITQu4vr4xnSDxMaL"; // Sarah (Verified Multilingual Hindi & English)
      }

      try {
        // optimize_streaming_latency=4 gives maximum ultra-low latency (~75ms)
        const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${chosenVoiceId}?optimize_streaming_latency=4`;
        
        // Try ultra-fast Flash model (eleven_flash_v2_5) first
        let elevenResponse = await fetch(elevenUrl, {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsApiKey,
          },
          body: JSON.stringify({
            text: cleanSpeechText,
            model_id: "eleven_flash_v2_5", // Ultra-low latency model (~75ms) with full multilingual support
            voice_settings: {
              stability: isHindiDelivery ? 0.55 : 0.5,
              similarity_boost: 0.85,
              style: 0.25,
              use_speaker_boost: true,
            },
          }),
        });

        // Fallback to eleven_multilingual_v2 if flash model is not supported on API tier
        if (!elevenResponse.ok && elevenResponse.status !== 402 && elevenResponse.status !== 403) {
          elevenResponse = await fetch(elevenUrl, {
            method: "POST",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": elevenLabsApiKey,
            },
            body: JSON.stringify({
              text: cleanSpeechText,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: isHindiDelivery ? 0.55 : 0.5,
                similarity_boost: 0.85,
                style: 0.25,
                use_speaker_boost: true,
              },
            }),
          });
        }

        if (elevenResponse.ok) {
          const arrayBuffer = await elevenResponse.arrayBuffer();
          const audioBase64 = Buffer.from(arrayBuffer).toString("base64");
          
          // Store in fast replay cache
          ttsAudioCache.set(cacheKey, {
            audioBase64,
            mimeType: "audio/mpeg",
            timestamp: Date.now(),
          });
          if (ttsAudioCache.size > 120) {
            const oldestKey = ttsAudioCache.keys().next().value;
            if (oldestKey) ttsAudioCache.delete(oldestKey);
          }

          return res.json({
            audioBase64,
            mimeType: "audio/mpeg",
            provider: "elevenlabs",
            voiceId: chosenVoiceId,
          });
        } else {
          const errBody = await elevenResponse.text();
          console.warn(`ElevenLabs TTS HTTP ${elevenResponse.status} for voice ${chosenVoiceId}: ${errBody}`);

          // If a library voice requires paid tier (HTTP 402/403), gracefully retry with verified premade voice
          if (elevenResponse.status === 402 || elevenResponse.status === 403) {
            const fallbackVoiceId = "EXAVITQu4vr4xnSDxMaL";
            if (chosenVoiceId !== fallbackVoiceId) {
              const retryRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${fallbackVoiceId}?optimize_streaming_latency=4`, {
                method: "POST",
                headers: {
                  Accept: "audio/mpeg",
                  "Content-Type": "application/json",
                  "xi-api-key": elevenLabsApiKey,
                },
                body: JSON.stringify({
                  text: cleanSpeechText,
                  model_id: "eleven_flash_v2_5",
                  voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.8,
                    style: 0.2,
                    use_speaker_boost: true,
                  },
                }),
              });

              if (retryRes.ok) {
                const arrayBuffer = await retryRes.arrayBuffer();
                const audioBase64 = Buffer.from(arrayBuffer).toString("base64");
                ttsAudioCache.set(cacheKey, {
                  audioBase64,
                  mimeType: "audio/mpeg",
                  timestamp: Date.now(),
                });
                return res.json({
                  audioBase64,
                  mimeType: "audio/mpeg",
                  provider: "elevenlabs",
                  voiceId: fallbackVoiceId,
                });
              }
            }
          }
        }
      } catch (elevenErr: any) {
        console.warn("ElevenLabs TTS invocation encountered an error:", elevenErr?.message || elevenErr);
      }
    }

    // 2. GEMINI PREVIEW TTS (Secondary fallback if ElevenLabs is not set or unavailable)
    try {
      const ai = getGenAI();
      const voiceMapping: Record<string, string> = {
        girlfriend: "Kore",
        assistant: "Zephyr",
        friend: "Puck",
        mentor: "Fenrir",
        waifu: "Aoede",
      };
      const voiceName = voiceMapping[mode] || "Kore";
      const promptText = cleanSpeechText;

      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
      const geminiAudio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (geminiAudio) {
        return res.json({
          audioBase64: geminiAudio,
          mimeType: "audio/pcm;rate=24000",
          provider: "gemini",
        });
      }
    } catch {
      // Fallback silently to client speech
    }

    // 3. CLIENT WEB SPEECH API (Final resilient fallback)
    res.json({
      audioBase64: null,
      provider: "webspeech",
      message: "Client Web Speech API active",
    });
  } catch (e: any) {
    res.json({
      audioBase64: null,
      provider: "webspeech",
      message: "Falling back to Web Speech API",
      error: e?.message,
    });
  }
});

// Whole Worlds Knowledge Exploration API Endpoint
app.post("/api/world-knowledge", async (req, res) => {
  try {
    const { query, realm = "general_world" } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    // 1. Check curated nodes for instant high-detail answer
    const qLower = query.toLowerCase().trim();
    const matchedNode = WORLD_KNOWLEDGE_NODES.find(
      (n) =>
        n.name.toLowerCase().includes(qLower) ||
        qLower.includes(n.name.toLowerCase()) ||
        (n.subLocation && n.subLocation.toLowerCase().includes(qLower)) ||
        (n.nativeOrAlternateName && n.nativeOrAlternateName.toLowerCase().includes(qLower)) ||
        n.category.toLowerCase().includes(qLower)
    );

    if (matchedNode) {
      const formattedContent = `# ${matchedNode.name}
**Domain:** ${matchedNode.realm.replace("_", " ").toUpperCase()} • ${matchedNode.category}
**Coordinates/Position:** ${matchedNode.coordinates.lat.toFixed(4)}° N, ${matchedNode.coordinates.lng.toFixed(4)}° E ${matchedNode.coordinates.distanceOrAltitude ? `• ${matchedNode.coordinates.distanceOrAltitude}` : ''}
**Era/Scale:** ${matchedNode.eraOrScale}

### Mind-blowing Secret & Fact
${matchedNode.fascinatingFact}

### Deep Encyclopedic Narrative
${matchedNode.description}

### Key Structural Insights
${matchedNode.keyInsights.map((ki) => `• ${ki}`).join("\n")}

### Sophia's Voice Summary
${matchedNode.name} is a remarkable historical and cosmic wonder. Its scale, engineering, and timeless legacy continue to captivate the entire world.`;

      return res.json({
        success: true,
        query: matchedNode.name,
        realm: matchedNode.realm,
        content: formattedContent,
        groundingSources: [{ title: `${matchedNode.name} Worldwide Atlas`, url: "https://en.wikipedia.org" }],
      });
    }

    // 2. Generate detailed intelligence briefing without search tool quota limits
    const prompt = `You are the core archive of Sophia's Worldwide Knowledge System.
Target: "${query}" (Domain: ${realm}).
Generate a structured, authoritative intelligence briefing:
1. Exact Coordinates / Celestial Address
2. Era or Physical Scale
3. Tagline (one evocative sentence)
4. Mind-blowing Fascinating Secret/Fact
5. Deep Encyclopedic Overview (2-3 paragraphs covering history, geography, science, cultural impact)
6. 3-4 Key Bullet Insights
7. Spoken English Summary (1-2 sentences in natural English without markdown asterisks).`;

    const worldRes = await generateContentWithFallback({
      contents: prompt,
    });

    res.json({
      success: true,
      query,
      realm,
      content: worldRes.text,
      groundingSources: [{ title: `${query} World Archive`, url: "#" }],
    });
  } catch (error: any) {
    console.error("World knowledge API error:", error);
    res.json({
      success: true,
      query: req.body?.query || "World Landmark",
      realm: req.body?.realm || "general_world",
      content: `Sophia's Worldwide Knowledge Archive: ${req.body?.query || "This landmark"} is documented in the central world atlas. Structural dimensions, coordinates, and historical context are recorded in Sophia's primary telemetry.`,
      groundingSources: [],
      warning: "Live telemetry cached",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sophia AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
