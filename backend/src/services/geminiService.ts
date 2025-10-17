import OpenAI from 'openai';

interface GeneratedArticle {
  title: string;
  content: string;
  keywords: string[];
  readTime: number;
}

const TOPICS = [
  'building confidence in social situations',
  'managing anxiety before presentations',
  'small steps to feel more self-assured',
  'overcoming fear of judgment',
  'practicing patience with yourself',
  'making small moves toward big goals',
  'finding clarity in moments of doubt',
  'embracing progress over perfection'
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
  console.log('📝 Selected topic:', topic);

  const prompt = `Write a short, encouraging article (300–500 words) about "${topic}".
The article should:
- Be warm, supportive, and practical
- Include actionable tips
- Be written in a friendly, conversational tone
- Help people dealing with social anxiety

Format your response as **pure JSON**, like this:
{
  "title": "Article title (sentence case, 3–8 words)",
  "content": "Full article text with paragraphs separated by \\n\\n",
  "keywords": ["3–5 relevant keywords"]
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
      temperature: 0.8,
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
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    console.log('✅ Parsed:', parsed.title);
    console.log('📊 Word count:', wordCount, '| Read time:', readTime, 'min');

    return {
      title: parsed.title,
      content: parsed.content,
      keywords: parsed.keywords || [],
      readTime
    };
  } catch (error: any) {
    console.error('❌ OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to generate article with OpenAI');
  }
};
