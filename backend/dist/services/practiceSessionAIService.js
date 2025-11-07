"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNextLevelQuestions = exports.prepareSessionDataForAI = exports.generatePipoNote = exports.generateAIFeedbackCards = void 0;
const openai_1 = __importDefault(require("openai"));
const generateAIFeedbackCards = async (sessionData) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        console.error('❌ Missing OPENAI_API_KEY');
        throw new Error('OPENAI_API_KEY is not configured');
    }
    const prompt = `Analyze this practice session and generate 4-5 specific, actionable feedback cards.

**Session Metrics:**
- Speaking Pace: ${sessionData.wpmAvg} WPM
- Filler Words: ${sessionData.totalFillers} total (${sessionData.fillersPerMin.toFixed(1)} per minute)
- Pauses: ${sessionData.pauseCount} pauses (avg ${sessionData.avgPauseDuration.toFixed(1)}s each)
- Eye Contact: ${sessionData.eyeContactRatio ? Math.round(sessionData.eyeContactRatio * 100) + '%' : 'Not available'}
- Overall Score: ${sessionData.overallScore}/100
- Duration: ${sessionData.duration}s

**What they said:**
"${sessionData.transcript}"

**Generate 4-5 feedback cards covering:**
1. **Pace** - Comment on speaking speed (ideal: 120-160 WPM)
2. **Eye Contact** - If available, comment on eye contact
3. **Fillers** - Comment on filler word usage (ideal: <3 per minute)
4. **Pauses** - Comment on pause frequency and length
5. **Answer Quality** - Comment on their answer content and clarity

**Card Guidelines:**
- Be specific and actionable
- Use encouraging, supportive tone
- Focus on ONE thing per card
- If something is good, use type "praise"
- If something needs work but not critical, use "tip"
- If something is concerning, use "warning"
- Keep body to 2-3 sentences max

Format as **pure JSON**:
{
  "cards": [
    {
      "title": "Clear, specific title (3-5 words)",
      "body": "Specific, actionable feedback. Include the actual metric.",
      "type": "tip" | "praise" | "warning"
    }
  ]
}`;
    try {
        console.log('🤖 Generating AI feedback cards...');
        const client = new openai_1.default({ apiKey: OPENAI_API_KEY });
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini', // Cheapest capable model
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert communication coach who provides specific, actionable feedback. Output only valid JSON.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });
        const generatedText = response.choices[0].message?.content?.trim();
        if (!generatedText)
            throw new Error('Empty response from OpenAI');
        const cleaned = generatedText.replace(/```json\s*|\s*```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            throw new Error('Failed to extract JSON from response');
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Generated', parsed.cards?.length || 0, 'feedback cards');
        return parsed.cards || [];
    }
    catch (error) {
        console.error('❌ OpenAI API error:', error.response?.data || error.message);
        return [];
    }
};
exports.generateAIFeedbackCards = generateAIFeedbackCards;
const generatePipoNote = async (sessionData) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        console.error('❌ Missing OPENAI_API_KEY');
        throw new Error('OPENAI_API_KEY is not configured');
    }
    const scenarioTitle = sessionData.scenarioTitle || 'Practice';
    const hasTranscript = sessionData.transcript && sessionData.transcript !== 'No transcript available' && sessionData.transcript.trim().length > 0;
    const hasFillers = sessionData.totalFillers > 0;
    let metricsSection = `**Session:**
- Scenario: ${scenarioTitle} (Level ${sessionData.level})`;
    if (sessionData.wpmAvg > 0) {
        metricsSection += `\n- Speaking Pace: ${sessionData.wpmAvg} WPM`;
    }
    if (hasFillers) {
        metricsSection += `\n- Filler Words: ${sessionData.totalFillers} total (${sessionData.fillersPerMin.toFixed(1)} per minute)`;
    }
    if (sessionData.eyeContactRatio !== null) {
        metricsSection += `\n- Eye Contact: ${Math.round(sessionData.eyeContactRatio * 100)}%`;
    }
    if (sessionData.pauseCount > 0) {
        metricsSection += `\n- Pauses: ${sessionData.pauseCount} (avg ${sessionData.avgPauseDuration.toFixed(1)}s each)`;
    }
    let transcriptSection = '';
    if (hasTranscript) {
        transcriptSection = `\n\n**What they said:**\n"${sessionData.transcript}"`;
    }
    const prompt = `Create a warm, encouraging note from Pipo (a friendly AI companion) about this practice session.

${metricsSection}${transcriptSection}

**Write Pipo's note:**
- Start with "Hey there! 🎉" or similar friendly greeting
- Celebrate what they did well (be specific with the metrics provided above)
${hasTranscript ? '- Include a short snippet or reference to what they said (if appropriate)' : ''}
- Give 1-2 gentle tips for improvement based on the metrics
- End with encouraging words
- Use emojis naturally (but not too many)
- Keep it warm, personal, and supportive
- Length: 200-300 words
- IMPORTANT: Only mention metrics that were provided above. Do NOT mention scores, transcripts, or fillers if they weren't included.

Format as **pure JSON**:
{
  "title": "${scenarioTitle} : Level ${sessionData.level}",
  "body": "The complete Pipo note with \\n\\n for paragraph breaks"
}`;
    try {
        console.log('📝 Generating Pipo note with AI...');
        const client = new openai_1.default({ apiKey: OPENAI_API_KEY });
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are Pipo, a warm and encouraging AI companion helping people practice communication. Write in a friendly, supportive tone. Output only valid JSON.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.9,
            max_tokens: 800,
        });
        const generatedText = response.choices[0].message?.content?.trim();
        if (!generatedText)
            throw new Error('Empty response from OpenAI');
        const cleaned = generatedText.replace(/```json\s*|\s*```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            throw new Error('Failed to extract JSON from response');
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Generated Pipo note:', parsed.title);
        return {
            title: parsed.title || `${scenarioTitle} : Level ${sessionData.level}`,
            body: parsed.body || 'Great job practicing today! Keep it up! 💪'
        };
    }
    catch (error) {
        console.error('❌ OpenAI API error for Pipo note:', error.response?.data || error.message);
        return {
            title: `${scenarioTitle} : Level ${sessionData.level}`,
            body: `Hey there! 🎉\n\nYou completed ${scenarioTitle} practice at Level ${sessionData.level}! Great job taking the time to practice your communication skills.\n\nKeep practicing - you're making great progress! 💪✨`
        };
    }
};
exports.generatePipoNote = generatePipoNote;
const prepareSessionDataForAI = (session, scenarioTitle) => {
    const { aggregate, steps } = session;
    let totalPauseDuration = 0;
    let totalPauses = 0;
    steps.forEach((step) => {
        if (step.metrics?.pauses) {
            step.metrics.pauses.forEach((pause) => {
                totalPauseDuration += pause.len || 0;
                totalPauses++;
            });
        }
    });
    const avgPauseDuration = totalPauses > 0 ? totalPauseDuration / totalPauses : 0;
    let totalFillers = 0;
    steps.forEach((step) => {
        totalFillers += step.metrics?.fillers?.length || 0;
    });
    const transcript = steps.map((s) => s.transcript).join(' ').trim() || 'No transcript available';
    const totalDuration = steps.reduce((sum, step) => sum + (step.metrics?.durationSec || 0), 0);
    return {
        wpmAvg: aggregate.wpmAvg || 0,
        fillersPerMin: aggregate.fillersPerMin || 0,
        totalFillers,
        pauseCount: totalPauses,
        avgPauseDuration,
        eyeContactRatio: aggregate.eyeContactRatio,
        overallScore: aggregate.score || 0,
        transcript,
        duration: Math.round(totalDuration),
        scenarioTitle,
        level: session.level || 1
    };
};
exports.prepareSessionDataForAI = prepareSessionDataForAI;
// Generate 3–4 next-level questions based on scenario and level (independent questions, not dependent on previous answers)
const generateNextLevelQuestions = async (sessionData) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        console.error('❌ Missing OPENAI_API_KEY');
        throw new Error('OPENAI_API_KEY is not configured');
    }
    const transcriptText = sessionData.transcript || '';
    const scenarioTitle = sessionData.scenarioTitle || 'Practice';
    const level = sessionData.level;
    const nextLevel = sessionData.nextLevel;
    const system = 'You design short role-play prompts. Output only valid JSON as specified.';
    const userPrompt = `
Create ${nextLevel === 2 ? '3-4' : '3-4'} next-step questions for a user practicing "${scenarioTitle}".

Context:
- Current Level: ${level}
- Next Level: ${nextLevel}
- Transcript (what they said): "${transcriptText}"

Guidelines:
- Voice and Perspective: Choose the role that naturally asks the user questions, based on scenario:
  - If it's a service setting (e.g., Restaurant, Café, Coffee, Shopping): write as STAFF addressing the user (customer).
  - If it's an Interview (e.g., Interview, Job, Hiring): write as the INTERVIEWER addressing the candidate.
  - Otherwise: write as a FACILITATOR guiding the user.
- Use "you" to refer to the user. Do NOT flip the roles into the user asking questions.
- Preferred patterns: Service → "Would you like...", "Do you prefer..."; Interview → "Can you tell me...", "How did you...", "What would you..."; Facilitator → "Could you try...", "Tell me about...".
- Make the questions slightly more advanced than the previous level.
- Keep each question short and natural.

- IMPORTANT: Questions must be INDEPENDENT and GENERAL. Each question should stand alone and make sense.
- Questions should be appropriate for the scenario 
- Include a videoUrl placeholder like "${scenarioTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_level${nextLevel}_q{n}.mp4".
- Provide an ordered list starting at 1.

Return JSON only:
{
  "questions": [
    { "order": 1, "text": "...", "videoUrl": "..." }
  ]
}`.trim();
    try {
        console.log('🧩 Generating next-level questions...', { scenarioTitle, level, nextLevel });
        const client = new openai_1.default({ apiKey: OPENAI_API_KEY });
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 600
        });
        const generatedText = response.choices[0].message?.content?.trim();
        if (!generatedText)
            throw new Error('Empty response from OpenAI');
        const cleaned = generatedText.replace(/```json\s*|```/g, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match)
            throw new Error('Failed to extract JSON from response');
        const parsed = JSON.parse(match[0]);
        const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
        console.log('🧪 Next-level questions preview:', questions.slice(0, 2));
        return questions;
    }
    catch (error) {
        console.error('❌ OpenAI error generating next questions:', error.response?.data || error.message);
        return [];
    }
};
exports.generateNextLevelQuestions = generateNextLevelQuestions;
//# sourceMappingURL=practiceSessionAIService.js.map