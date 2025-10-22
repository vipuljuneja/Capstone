import { IPracticeSession } from '../models/PracticeSession';
import Scenario from '../models/Scenario';

interface PipoMessageContent {
  title: string;
  body: string;
  imageName: string;
}

/**
 * Generates a friendly Pipo message from a practice session
 */
export const generatePipoMessageFromSession = async (
  session: IPracticeSession
): Promise<PipoMessageContent> => {
  // Fetch scenario to get the title
  const scenario = await Scenario.findById(session.scenarioId);
  const scenarioName = scenario?.title || 'Practice';

  // Generate title
  const title = `${scenarioName} : Level ${session.level}`;

  // Generate friendly body message
  const body = generateFriendlyMessage(session, scenarioName);

  // Default Pipo image
  const imageName = 'articlePipo.png';

  return { title, body, imageName };
};

/**
 * Generates the friendly message body
 */
const generateFriendlyMessage = (
  session: IPracticeSession,
  scenarioName: string
): string => {
  const { aggregate, steps, aiFeedbackCards } = session;
  
  let message = `Hey there! 🎉 I watched your ${scenarioName} practice and I'm so proud of you!\n\n`;

  // Add strengths section
  message += `**What you did great:**\n`;
  
  const strengths = [];
  
  // Eye contact
  if (aggregate.eyeContactRatio && aggregate.eyeContactRatio >= 0.7) {
    strengths.push(`- Your eye contact was amazing! ${Math.round(aggregate.eyeContactRatio * 100)}% maintained 👀`);
  }
  
  // Speaking pace
  if (aggregate.wpmAvg >= 120 && aggregate.wpmAvg <= 160) {
    strengths.push(`- You spoke at a great pace (${aggregate.wpmAvg} WPM) 🗣️`);
  } else if (aggregate.wpmAvg > 0) {
    strengths.push(`- Your speaking pace was ${aggregate.wpmAvg} WPM 🗣️`);
  }
  
  // Tone
  if (aggregate.toneScore >= 70) {
    strengths.push(`- I loved how confident you sounded! Your tone was on point! 💪`);
  }
  
  // Overall score
  if (aggregate.score >= 80) {
    strengths.push(`- Amazing overall score of ${aggregate.score}/100! 🌟`);
  }
  
  // Add praise feedback from AI
  const praiseCards = aiFeedbackCards.filter(card => card.type === 'praise');
  if (praiseCards.length > 0) {
    praiseCards.slice(0, 2).forEach(card => {
      strengths.push(`- ${card.body}`);
    });
  }
  
  if (strengths.length > 0) {
    message += strengths.join('\n') + '\n\n';
  } else {
    message += `- Great job completing the practice! 🎯\n\n`;
  }

  // Add transcript if available
  if (steps.length > 0 && steps[0].transcript) {
    message += `**Here's what you said:**\n`;
    const firstTranscript = steps[0].transcript;
    const truncatedTranscript = firstTranscript.length > 200 
      ? firstTranscript.substring(0, 200) + '...' 
      : firstTranscript;
    message += `"${truncatedTranscript}"\n\n`;
  }

  // Add areas for improvement
  const improvements = [];
  
  // Filler words
  if (aggregate.fillersPerMin > 3) {
    improvements.push(`- Try to reduce filler words like "um" and "uh" (you averaged ${aggregate.fillersPerMin.toFixed(1)} per minute)`);
  }
  
  // Eye contact
  if (aggregate.eyeContactRatio && aggregate.eyeContactRatio < 0.6) {
    improvements.push(`- Practice maintaining eye contact a bit more (${Math.round(aggregate.eyeContactRatio * 100)}% this time)`);
  }
  
  // Speaking pace
  if (aggregate.wpmAvg < 100) {
    improvements.push(`- Try speaking a bit faster - you can do it! 🚀`);
  } else if (aggregate.wpmAvg > 180) {
    improvements.push(`- Take a breath! Slow down just a little to be more clear 🌬️`);
  }
  
  // Add tip feedback from AI
  const tipCards = aiFeedbackCards.filter(card => card.type === 'tip');
  if (tipCards.length > 0) {
    tipCards.slice(0, 2).forEach(card => {
      improvements.push(`- ${card.body}`);
    });
  }
  
  if (improvements.length > 0) {
    message += `**Small tips for next time:**\n`;
    message += improvements.join('\n') + '\n\n';
  }

  // Add encouraging ending
  if (aggregate.score >= 80) {
    message += `Keep crushing it! You're doing awesome! 💪✨`;
  } else if (aggregate.score >= 60) {
    message += `You're making great progress! Keep practicing and you'll be amazing! 🌟`;
  } else {
    message += `Remember, every practice makes you better! You've got this! 💪 Keep going!`;
  }

  return message;
};

/**
 * Generates a simple summary for quick display
 */
export const generateQuickSummary = (session: IPracticeSession): string => {
  const { aggregate } = session;
  
  if (aggregate.score >= 80) {
    return `Excellent work! Score: ${aggregate.score}/100 🌟`;
  } else if (aggregate.score >= 60) {
    return `Great practice! Score: ${aggregate.score}/100 👏`;
  } else {
    return `Good effort! Score: ${aggregate.score}/100 💪`;
  }
};

