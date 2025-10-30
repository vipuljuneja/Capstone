import OpenAI from 'openai';
import DailyArticle from '../models/DailyArticle';

interface GeneratedArticle {
  title: string;
  content: string;
  keywords: string[];
  readTime: number;
  author?: string;
  sourceUrl?: string;
}

const TOPICS = [
  'building confidence in social situations',
  'managing anxiety before presentations',
  'small steps to feel more self-assured',
  'overcoming fear of judgment',
  'practicing patience with yourself',
  'making small moves toward big goals',
  'finding clarity in moments of doubt',
  'embracing progress over perfection',
  'grounding techniques for public speaking',
  'reframing negative self-talk',
  'micro-habits for steady growth',
  'navigating social fears in new environments',
  'self-compassion practices that stick',
  'building momentum from small wins',
  'mindful breathing for calm presence',
  'dealing with awkward silences gracefully'
];

const STYLES = [
  'include one short personal anecdote',
  'use a metaphor extended lightly throughout',
  'frame as a mini step-by-step guide',
  'sprinkle gentle humor in one paragraph',
  'end with a 3-bullet action checklist',
  'weave in a nature-inspired analogy',
  'use a warm coach-like tone',
  'emphasize small experiments over big changes'
];

export const generateDailyArticle = async (): Promise<GeneratedArticle> => {
  console.log('🔍 Checking OPENAI_API_KEY...');
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY in environment variables');
    throw new Error('OPENAI_API_KEY is not configured');
  }

  console.log('✅ OPENAI_API_KEY found');

  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];

  // Fetch last 30 titles to avoid repeats
  const recent = await DailyArticle.find({}, { title: 1 })
    .sort({ date: -1 })
    .limit(30)
    .lean();
  const recentTitles = recent.map((r: any) => r.title).filter(Boolean);

  console.log('📝 Selected topic/style:', topic, '|', style);

  const prompt = `Write a short, encouraging article (250–700 words) about "${topic}" and ${style}.
The article should:
- Be warm, supportive, and practical
- Include actionable tips
- Be written in a friendly, conversational tone
- Help people dealing with social anxiety

Constraints:
- The title must be unique and must NOT match any of these recent titles: ${JSON.stringify(
    recentTitles
  )}
- The title must be 3–8 words and not reuse the exact phrasing of the topic.

Format your response as **pure JSON**, like this:
{
  "title": "Article title (sentence case, 3–8 words)",
  "content": "Full article text with paragraphs separated by \\n\\n",
  "keywords": ["3–5 relevant keywords"],
  "author": "Original author name (string). If unknown, use 'Anonymous'",
  "sourceUrl": "Public, verifiable URL where ideas were sourced; if none, use an empty string"
}`;

  try {
    console.log('🚀 Calling OpenAI gpt-4.1-mini...');
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini', // 💰 Cheapest capable model
      messages: [
        { role: 'system', content: 'You are a helpful assistant that only outputs valid JSON as specified.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.95,
    });

    const generatedText = response.choices[0].message?.content?.trim();
    if (!generatedText) throw new Error('Empty response from OpenAI');

    console.log('📝 Generated text preview:', generatedText.substring(0, 150) + '...');

    // Clean and parse JSON
    const cleaned = generatedText.replace(/```json\s*|\s*```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to extract JSON from response');

    const jsonString = jsonMatch[0];
    const parsed = JSON.parse(jsonString);

    const wordCount = parsed.content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 180));

    console.log('✅ Parsed:', parsed.title);
    console.log('📊 Word count:', wordCount, '| Read time:', readTime, 'min');

    return {
      title: parsed.title,
      content: parsed.content,
      keywords: parsed.keywords || [],
      readTime,
      author: parsed.author || 'Anonymous',
      sourceUrl: typeof parsed.sourceUrl === 'string' ? parsed.sourceUrl : ''
    };
  } catch (error: any) {
    console.error('❌ OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to generate article with OpenAI');
  }
};
