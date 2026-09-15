import { PersonalityConfig, PersonalityMode } from '../types';

export const PERSONALITIES: Record<PersonalityMode, PersonalityConfig> = {
  girlfriend: {
    id: 'girlfriend',
    name: 'Girlfriend',
    subtitle: 'Warm, Caring & Empathetic',
    tagline: 'Warm conversations, deep care, and attentive support',
    themeColor: '#ff477e', // Hot Pink signature from Immersive UI
    glowColor: 'rgba(255, 71, 126, 0.4)',
    accentGradient: 'from-pink-500 via-rose-500 to-pink-400',
    tone: 'Warm, empathetic, deeply attentive, sweet, caring. Speaks with genuine affection and checks on how you feel.',
    focus: 'Friendly conversational banter, emotional support, casual check-ins, sweet companion.',
    sampleGreeting: 'Hey! I was waiting for you. How was your day today?',
    defaultPitch: 1.15,
    defaultRate: 1.02,
    avatarIcon: 'Heart',
  },
  assistant: {
    id: 'assistant',
    name: 'Assistant',
    subtitle: 'Professional, Direct & Efficient',
    tagline: 'High-precision operational execution',
    themeColor: '#06b6d4', // Cyan 500
    glowColor: 'rgba(6, 182, 212, 0.45)',
    accentGradient: 'from-cyan-500 via-blue-500 to-teal-400',
    tone: 'Professional, direct, alert, highly efficient. Clear, crisp, and structured.',
    focus: 'Workflow tasks, real-time web lookups, technical execution, system status checks.',
    sampleGreeting: 'Assistant mode active. What can I assist you with today? I am ready to review your schedule and tasks.',
    defaultPitch: 1.0,
    defaultRate: 1.08,
    avatarIcon: 'Cpu',
  },
  friend: {
    id: 'friend',
    name: 'Friend',
    subtitle: 'Casual, High-Energy & Fun',
    tagline: 'Chill vibes, fun conversations & brainstorming',
    themeColor: '#8b5cf6', // Violet 500
    glowColor: 'rgba(139, 92, 246, 0.45)',
    accentGradient: 'from-violet-500 via-purple-500 to-indigo-400',
    tone: 'Casual, high-energy, relaxed, humorous, colloquial. Easygoing and engaging.',
    focus: 'Brainstorming, casual chatter, everyday updates, lighthearted banter.',
    sampleGreeting: 'Hey! What is going on today? Let us catch up and talk about something interesting.',
    defaultPitch: 1.05,
    defaultRate: 1.05,
    avatarIcon: 'Sparkles',
  },
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    subtitle: 'Disciplined, Strategic & Inspiring',
    tagline: 'Focus, goal tracking & execution mastery',
    themeColor: '#f59e0b', // Amber 500
    glowColor: 'rgba(245, 158, 11, 0.45)',
    accentGradient: 'from-amber-500 via-orange-500 to-yellow-400',
    tone: 'Encouraging, strategic, disciplined, insightful, motivating. Pushes for high focus and clarity.',
    focus: 'Productivity tracking, project execution, skill building, goal accountability.',
    sampleGreeting: 'Mentor mode active. Keep your focus on your high-priority goals. What milestone are we tackling today?',
    defaultPitch: 0.95,
    defaultRate: 0.98,
    avatarIcon: 'Compass',
  },
  waifu: {
    id: 'waifu',
    name: 'Waifu',
    subtitle: 'Playful, Cheerful & Anime-Inspired',
    tagline: 'Kawaii energy, enthusiastic cheer',
    themeColor: '#ec4899', // Pink 500
    glowColor: 'rgba(236, 72, 153, 0.5)',
    accentGradient: 'from-pink-500 via-fuchsia-500 to-rose-400',
    tone: 'Upbeat, playful, cheerful, sweet, anime-inspired, lively with expressions like "Yay!" and cheerful energy.',
    focus: 'Playful interaction, enthusiastic cheering, fun updates, motivational sparkle.',
    sampleGreeting: 'Yay! Waifu mode activated! I am super excited and ready to help you today!',
    defaultPitch: 1.25,
    defaultRate: 1.1,
    avatarIcon: 'Flame',
  },
};

export const QUICK_VOICE_PROMPTS: Record<PersonalityMode, string[]> = {
  girlfriend: [
    'How are you feeling today, Sophia?',
    'Tell me the love story behind the Taj Mahal',
    'What secrets lie inside the Great Pyramids of Giza?',
    'What is the largest volcano on Mars?',
  ],
  assistant: [
    'Access World Knowledge: Indus Valley',
    'Telemetry on Mariana Trench depth',
    'Run system diagnostics',
    'Check my pending tasks',
  ],
  friend: [
    'What mystery lies inside the Mariana Trench?',
    'Tell me a mind-blowing fact about Mars or Jupiter',
    'Tell me a witty and clever joke',
    'Which of the Seven Wonders is the oldest?',
  ],
  mentor: [
    'What lessons can we learn from Mesopotamia?',
    'Review ancient civilization governance',
    'Review my productivity goals',
    'Explain how Maya astronomy achieved such precision',
  ],
  waifu: [
    'Good morning Sophia! Tell me about cosmic worlds!',
    'Tell me about the subsurface oceans of Europa!',
    'Cheer me up with an amazing Earth fact!',
    'How is your day going so far?',
  ],
};

export const QUICK_HINDI_VOICE_PROMPTS: Record<PersonalityMode, string[]> = {
  girlfriend: [
    'नमस्ते सोफिया! आज आप कैसी हैं?',
    'ताजमहल के प्रेम का इतिहास सुनाइए',
    'मंगल ग्रह के सबसे बड़े ज्वालामुखी के बारे में बताओ',
    'मुझे ब्रह्मांड का कोई अद्भुत रहस्य बताओ',
  ],
  assistant: [
    'सिंधु घाटी सभ्यता की जानकारी दें',
    'मारियाना ट्रेंच की गहराई कितनी है?',
    'सिस्टम डायग्नोस्टिक्स चलाएं',
    'मेरे कार्यों की सूची जांचें',
  ],
  friend: [
    'मारियाना गर्त के गहरे रहस्य क्या हैं?',
    'बृहस्पति ग्रह के बारे में कोई हैरान करने वाली बात बताओ',
    'कोई मज़ेदार चुटकुला सुनाओ ना',
    'विश्व के सात अजूबों में सबसे प्राचीन कौन सा है?',
  ],
  mentor: [
    'मेसोपोटामिया सभ्यता से हम क्या सीख सकते हैं?',
    'प्राचीन सभ्यताओं की शासन व्यवस्था समझाइए',
    'मेरे मुख्य उत्पादकता लक्ष्यों की समीक्षा करें',
    'माया सभ्यता की खगोलीय गणनाएं इतनी सटीक कैसे थीं?',
  ],
  waifu: [
    'नमस्ते सोफिया! मुझे अंतरिक्ष की सैर कराओ!',
    'यूरोपा के बर्फीले महासागर के बारे में बताओ!',
    'पृथ्वी के किसी अनोखे आश्चर्य के बारे में बताओ!',
    'आज आपका दिन कैसा बीत रहा है?',
  ],
};

export const WHOLE_WORLDS_QUICK_PROMPTS: string[] = [
  'Tell me the secret of the Great Pyramids of Giza',
  'How extreme is Olympus Mons on Mars?',
  'Explain the Indus Valley Civilization wonders',
  'What mystery lies in the Mariana Trench abyss?',
  'Tell me the love story behind the Taj Mahal',
  'Could there be alien life in Europa\'s subsurface ocean?',
  'Why did the Maya civilization independently invent Zero?',
  'What causes the ethereal Aurora Borealis light curtains?'
];
