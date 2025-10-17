import axios from 'axios';

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
  console.log('🔍 Checking GEMINI_API_KEY...');
  
  // Read the env variable inside the function, not at module level
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not configured in environment variables');
    console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
    throw new Error('GEMINI_API_KEY is not configured');
  }
  
  console.log('✅ GEMINI_API_KEY found');

  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  console.log('📝 Selected topic:', topic);
  
  const prompt = `Write a short, encouraging article (300-500 words) about "${topic}". 
  The article should:
  - Be warm, supportive, and practical
  - Include actionable tips
  - Be written in a friendly, conversational tone
  - Help people dealing with social anxiety
  
  Format your response as JSON with this structure:
  {
    "title": "Article title (sentence case, 3-8 words)",
    "content": "Full article content with paragraphs separated by \\n\\n",
    "keywords": ["3-5 relevant keywords"]
  }
  
  Return ONLY the JSON, no additional text.`;

  try {
    console.log('🚀 Calling Gemini API...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Gemini API responded successfully');
    
    const generatedText = response.data.candidates[0].content.parts[0].text;
    console.log('📝 Generated text preview:', generatedText.substring(0, 100) + '...');
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Failed to extract JSON from response:', generatedText);
      throw new Error('Failed to extract JSON from Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed article:', parsed.title);
    
    const wordCount = parsed.content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    console.log('📊 Word count:', wordCount, '| Read time:', readTime, 'min');

    return {
      title: parsed.title,
      content: parsed.content,
      keywords: parsed.keywords || [],
      readTime
    };
  } catch (error) {
    console.error('❌ Gemini API error details:');
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    } else {
      console.error(error);
    }
    throw new Error('Failed to generate article with Gemini');
  }
};