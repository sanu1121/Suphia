import { VoiceProfile } from '../types';

export const VOICE_PROFILES: VoiceProfile[] = [
  // Primary & Popular Voices
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah (हिंदी & English)',
    gender: 'female',
    tone: 'Warm, Reassuring & Sweet (सहज मधुर)',
    description: 'Deeply affectionate, mature vocal presence with comforting melodic rhythm and warm delivery.',
    sampleText: 'I am always right here with you. How was your day today?',
    hindiSampleText: 'नमस्ते! मैं सोफ़िया हूँ। आपकी आवाज़ सुनकर बहुत ख़ुशी हुई, बताइए आज आपका दिन कैसा रहा?',
    accent: 'Multilingual & Soft American',
    recommendedModes: ['girlfriend', 'mentor'],
    avatarColor: '#f43f5e', // Rose
    category: 'hindi',
    isHindiSpecialist: true,
  },
  {
    id: 'hpp4J3VqNfWAUOO0d1Us',
    name: 'Bella (हिंदी कोमल आवाज़)',
    gender: 'female',
    tone: 'Sweet, Gentle & Affectionate (कोमल और प्यारी)',
    description: 'Bright and intimate voice with soft dynamic range, authentic inflection and sweet warmth.',
    sampleText: 'Welcome back! I was waiting for you. What can I do for you right now?',
    hindiSampleText: 'सुनो ना, मैं कब से आपका इंतज़ार कर रही थी! बताइए, आज हम क्या ख़ास बात करने वाले हैं?',
    accent: 'Sweet, Warm & Expressive',
    recommendedModes: ['girlfriend', 'waifu'],
    avatarColor: '#a855f7', // Purple
    category: 'hindi',
    isHindiSpecialist: true,
  },
  {
    id: 'cgSgspJ2msm6clMCkdW9',
    name: 'Jessica (हिंदी चुलबुली)',
    gender: 'female',
    tone: 'Playful, Bright & Warm (मस्त और चुलबुली)',
    description: 'Vibrant, smiling voice quality full of youthful enthusiasm, laughter, and cheerful banter.',
    sampleText: 'Hey there! What is the plan today? Let us do something super fun together!',
    hindiSampleText: 'अरे वाह! आज का मूड तो बहुत मस्त लग रहा है। चलो आज मिलकर कुछ नया और मज़ेदार करते हैं!',
    accent: 'Playful & Bright English',
    recommendedModes: ['friend', 'waifu', 'girlfriend'],
    avatarColor: '#eab308', // Amber
    category: 'hindi',
    isHindiSpecialist: true,
  },
  {
    id: 'Xb7hH8MSUJpSbSDYk0k2',
    name: 'Alice (हिंदी स्पष्ट & ज्ञानवर्धक)',
    gender: 'female',
    tone: 'Clear, Engaging Educator (स्पष्ट और ज्ञानवर्धक)',
    description: 'Polished inflection, pristine articulation, and articulate delivery for smart assistance.',
    sampleText: 'Greetings! I am ready to assist with any query, research, or complex concept.',
    hindiSampleText: 'नमस्ते! मैं आपकी AI सहायक सोफ़िया हूँ। विश्व इतिहास, विज्ञान या किसी भी विषय पर मुझसे पूछिए।',
    accent: 'Articulate & British English',
    recommendedModes: ['assistant', 'mentor'],
    avatarColor: '#3b82f6', // Blue
    category: 'hindi',
    isHindiSpecialist: true,
  },
  {
    id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George (हिंदी कथावाचक)',
    gender: 'male',
    tone: 'Warm Storyteller (गंभीर और आत्मीय)',
    description: 'Rich, resonant narrative voice with mature depth and welcoming storytelling cadence.',
    sampleText: 'Welcome back. Let us explore the wonders of the world together.',
    hindiSampleText: 'नमस्ते। दुनिया के अनसुलझे रहस्यों और प्राचीन सभ्यताओं के सफ़र पर आपका दिल से स्वागत है।',
    accent: 'Deep & Resonant Warm',
    recommendedModes: ['mentor'],
    avatarColor: '#f97316', // Orange
    category: 'hindi',
    isHindiSpecialist: true,
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'female',
    tone: 'Calm, Articulate & Crisp',
    description: 'Crisp enunciation, steady gentle composure, and naturally articulate tone.',
    sampleText: 'Hello, I am Sophia. Everything is calm and ready whenever you are.',
    hindiSampleText: 'नमस्ते! मैं सोफ़िया हूँ। जब भी आप चाहें, मैं बात करने के लिए तैयार हूँ।',
    accent: 'American / Neutral English',
    recommendedModes: ['girlfriend', 'assistant'],
    avatarColor: '#ec4899', // Pink
    category: 'primary',
  },
  {
    id: 'FGY2WhTYpPnrIDTdsKH5',
    name: 'Laura',
    gender: 'female',
    tone: 'Enthusiast & Quirky',
    description: 'Full of dynamic attitude, quick comedic pacing, and genuine curiosity.',
    sampleText: 'That sounds fascinating! Tell me everything, do not leave out any details.',
    hindiSampleText: 'अरे वाह! यह तो बहुत दिलचस्प लग रहा है। मुझे सब कुछ बताओ, कोई बात मत छुपाना!',
    accent: 'Expressive American',
    recommendedModes: ['friend', 'waifu'],
    avatarColor: '#10b981', // Emerald
    category: 'expressive',
  },
  {
    id: 'pFZP5JQG7iQjIQuC4Bku',
    name: 'Lily',
    gender: 'female',
    tone: 'Velvety & Soothing',
    description: 'Silky, delicate and intimate cadence designed for gentle evening conversations.',
    sampleText: 'Take a moment to relax and breathe. Let us take things one step at a time.',
    hindiSampleText: 'थोड़ा रिलैक्स कर लो। गहरी साँस लो, सब अच्छा होगा।',
    accent: 'Soft British',
    recommendedModes: ['girlfriend', 'waifu'],
    avatarColor: '#d946ef', // Fuchsia
    category: 'calm',
  },
  {
    id: 'XrExE9yKIg1WjnnlVkGX',
    name: 'Matilda',
    gender: 'female',
    tone: 'Knowledgeable & Steady',
    description: 'Authoritative, calm, and thoughtful demeanor with structured analytical delivery.',
    sampleText: 'Analysis complete. Here is the structured breakdown of what you need to know.',
    hindiSampleText: 'विश्लेषण पूरा हो चुका है। यहाँ आपके लिए पूरी जानकारी क्रमबद्ध है।',
    accent: 'Formal Neutral',
    recommendedModes: ['mentor', 'assistant'],
    avatarColor: '#06b6d4', // Cyan
    category: 'calm',
  },
  {
    id: 'SAz9YHcvj6GT2YYXdXww',
    name: 'River',
    gender: 'female',
    tone: 'Relaxed & Informative',
    description: 'Modern, balanced and conversational tone with neutral cadence.',
    sampleText: 'All systems running smoothly. What is on your agenda today?',
    hindiSampleText: 'सभी सिस्टम सुचारू रूप से चल रहे हैं। आज आपका क्या प्लान है?',
    accent: 'Modern Neutral',
    recommendedModes: ['assistant', 'friend'],
    avatarColor: '#14b8a6', // Teal
    category: 'calm',
  },
  {
    id: 'nPczCjzI2devNBz1zQrb',
    name: 'Brian',
    gender: 'male',
    tone: 'Deep & Comforting',
    description: 'Low-register reassuring baritone voice with calm pacing.',
    sampleText: 'Do not worry about a thing. I am right here keeping track of everything for you.',
    hindiSampleText: 'चिंता की कोई बात नहीं। मैं सब कुछ संभाल रहा हूँ।',
    accent: 'Deep Neutral',
    recommendedModes: ['mentor', 'assistant'],
    avatarColor: '#6366f1', // Indigo
    category: 'storyteller',
  },
  {
    id: 'CwhRBWXzGAHq8TQ4Fs17',
    name: 'Roger',
    gender: 'male',
    tone: 'Laid-Back & Resonant',
    description: 'Casual, grounded conversational style with easygoing humor.',
    sampleText: 'Hey man, what is up? Let us get this done and make it look easy.',
    hindiSampleText: 'और भाई, क्या हाल-चाल? चलो यह काम झटपट निपटाते हैं!',
    accent: 'Casual American',
    recommendedModes: ['friend'],
    avatarColor: '#84cc16', // Lime
    category: 'storyteller',
  },
];

export const getVoiceById = (id?: string): VoiceProfile | undefined => {
  if (!id) return undefined;
  return VOICE_PROFILES.find((v) => v.id.toLowerCase() === id.toLowerCase());
};

export const getVoiceByName = (name?: string): VoiceProfile | undefined => {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();
  return VOICE_PROFILES.find(
    (v) => v.name.toLowerCase().includes(clean) || clean.includes(v.name.toLowerCase())
  );
};
