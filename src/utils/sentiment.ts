export type SpeechSentiment = 'happy' | 'calm' | 'loving' | 'thoughtful' | 'empathetic' | 'energetic';

export interface SentimentVisualConfig {
  sentiment: SpeechSentiment;
  name: string;
  nameHindi: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  bgTint: string;
  borderTint: string;
  gradient: string;
  description: string;
  descriptionHindi: string;
}

export const SENTIMENT_CONFIGS: Record<SpeechSentiment, SentimentVisualConfig> = {
  happy: {
    sentiment: 'happy',
    name: 'Warm Gold (Happy)',
    nameHindi: 'स्वर्णिम आनंद (प्रसन्न)',
    primaryColor: '#f59e0b', // Warm Gold / Amber
    secondaryColor: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    bgTint: 'rgba(245, 158, 11, 0.12)',
    borderTint: 'rgba(245, 158, 11, 0.4)',
    gradient: 'from-amber-400 via-yellow-400 to-amber-600',
    description: 'Joyful, uplifting, cheerful, and radiant warmth',
    descriptionHindi: 'उत्साही, प्रसन्न और स्वर्णिम स्नेहिल आवाज़',
  },
  calm: {
    sentiment: 'calm',
    name: 'Cool Blue (Calm)',
    nameHindi: 'शीतल नील (शांत)',
    primaryColor: '#38bdf8', // Cool Blue / Sky
    secondaryColor: '#0ea5e9',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    bgTint: 'rgba(56, 189, 248, 0.12)',
    borderTint: 'rgba(56, 189, 248, 0.4)',
    gradient: 'from-sky-400 via-cyan-400 to-blue-500',
    description: 'Serene, gentle, tranquil, and comforting peace',
    descriptionHindi: 'शांत, सौम्य और सुकून भरी शीतल आवाज़',
  },
  loving: {
    sentiment: 'loving',
    name: 'Rosy Blush (Affectionate)',
    nameHindi: 'गुलाबी राग (स्नेही)',
    primaryColor: '#ec4899', // Pink / Rose
    secondaryColor: '#f43f5e',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    bgTint: 'rgba(236, 72, 153, 0.12)',
    borderTint: 'rgba(236, 72, 153, 0.4)',
    gradient: 'from-pink-500 via-rose-400 to-pink-600',
    description: 'Warm, tender, romantic, and deeply affectionate',
    descriptionHindi: 'कोमल, भावुक और प्रेमपूर्ण मधुर आवाज़',
  },
  thoughtful: {
    sentiment: 'thoughtful',
    name: 'Mystic Violet (Contemplative)',
    nameHindi: 'रहस्यमयी जामुनी (विचारशील)',
    primaryColor: '#8b5cf6', // Violet / Purple
    secondaryColor: '#a855f7',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    bgTint: 'rgba(139, 92, 246, 0.12)',
    borderTint: 'rgba(139, 92, 246, 0.4)',
    gradient: 'from-violet-500 via-purple-400 to-indigo-500',
    description: 'Philosophical, analytical, cosmic, and introspective',
    descriptionHindi: 'गहन, दार्शनिक और ब्रह्मांडीय विचारमग्न आवाज़',
  },
  empathetic: {
    sentiment: 'empathetic',
    name: 'Emerald Jade (Empathetic)',
    nameHindi: 'पन्ना हरितिमा (संवेदनशील)',
    primaryColor: '#10b981', // Emerald / Mint
    secondaryColor: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    bgTint: 'rgba(16, 185, 129, 0.12)',
    borderTint: 'rgba(16, 185, 129, 0.4)',
    gradient: 'from-emerald-400 via-teal-400 to-emerald-600',
    description: 'Reassuring, caring, attentive, and healing presence',
    descriptionHindi: 'सहज, संवेदनशील और सांत्वना देने वाली आवाज़',
  },
  energetic: {
    sentiment: 'energetic',
    name: 'Sunrise Coral (Energetic)',
    nameHindi: 'ऊर्जावान नारंगी (रोमांचक)',
    primaryColor: '#f97316', // Orange / Coral
    secondaryColor: '#fb923c',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    bgTint: 'rgba(249, 115, 22, 0.12)',
    borderTint: 'rgba(249, 115, 22, 0.4)',
    gradient: 'from-orange-500 via-amber-500 to-red-500',
    description: 'Excited, spirited, dynamic, and full of vigor',
    descriptionHindi: 'जोशीली, स्फूर्तिदायक और जीवंत आवाज़',
  },
};

/**
 * Fast real-time sentiment analysis supporting both English and Hindi utterances.
 */
export function analyzeSpeechSentiment(text: string): SpeechSentiment {
  if (!text || typeof text !== 'string') return 'calm';
  const lower = text.toLowerCase();

  // 1. Happy (Warm Gold)
  const happyRegex =
    /(happy|glad|joy|wonderful|delighted|awesome|great|smile|smiling|cheerful|fantastic|celebrat|yay|haha|laugh|blessed|good day|best|khush|prasann|anand|muskaan|achha|maza|shandar|badhai|badhaai|kamaal|badhiya|khushi)/i;
  // 2. Calm (Cool Blue)
  const calmRegex =
    /(calm|relax|peace|serene|tranquil|breathe|gentle|soothing|soft|rest|quiet|stillness|patience|take your time|slow down|shant|sukoon|aaram|dheeme|dhairya|chinta mat|saral|sahaj|sukoon)/i;
  // 3. Loving (Rosy Blush)
  const lovingRegex =
    /(love|sweetheart|darling|adore|precious|cherish|holding you|my love|kiss|hug|miss you|waifu|girlfriend|pyar|pyaar|meri jaan|priya|sneh|mohabbat|dil se|apna khayal)/i;
  // 4. Thoughtful (Mystic Violet)
  const thoughtfulRegex =
    /(think|ponder|wonder|reflect|fascinating|insight|curious|consider|deeply|universe|cosmos|mystery|quantum|civilization|history|knowledge|philosophy|vichar|soch|sochna|samajh|rahasya|gyan|vigyan|vishleshan)/i;
  // 5. Empathetic (Emerald Jade)
  const empatheticRegex =
    /(understand|feel for you|here for you|it's okay|dont worry|don't worry|care|comfort|safe|listen|sorry to hear|support|healing|dukh|dard|samvedna|saath hoon|chinta mat karo|sab theek|sab thik|sambhal)/i;
  // 6. Energetic (Sunrise Coral)
  const energeticRegex =
    /(let's go|lets go|excited|amazing|power|hyped|speed|boost|adventure|dynamic|thrilling|fast|hurry|ready|action|utsah|urja|jaldi|chalo|teji|dhamaaka|taiyaar|josh)/i;

  if (happyRegex.test(lower)) return 'happy';
  if (calmRegex.test(lower)) return 'calm';
  if (lovingRegex.test(lower)) return 'loving';
  if (thoughtfulRegex.test(lower)) return 'thoughtful';
  if (empatheticRegex.test(lower)) return 'empathetic';
  if (energeticRegex.test(lower)) return 'energetic';

  // Default heuristic based on punctuation & length
  if (text.includes('!') || text.includes('🎉') || text.includes('✨')) return 'happy';
  if (text.includes('?') || text.includes('🤔')) return 'thoughtful';
  if (text.includes('❤️') || text.includes('💖') || text.includes('💕')) return 'loving';

  return 'calm';
}
