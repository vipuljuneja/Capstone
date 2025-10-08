import {
  detectEyeRolls,
  analyzeBlinkPattern,
  calculateGazeStability,
  analyzeSmilePattern,
  detectMicroExpressions,
  calculateAverageTension,
  calculateHeadStability,
} from './facialAnalysis';

import {
  calculateConfidenceScore,
  getConfidenceLevel,
  identifyStrengths,
  identifyWeaknesses,
} from './confidenceScoring';

export const generateInsights = frames => {
  if (frames.length === 0) {
    return { error: 'No frames to analyze' };
  }

  const confidenceScore = calculateConfidenceScore(frames);
  const confidenceLevel = getConfidenceLevel(confidenceScore.overall);

  const detailedAnalysis = {
    eyeRolls: detectEyeRolls(frames),
    blinkPattern: analyzeBlinkPattern(frames),
    gazeStability: calculateGazeStability(frames),
    smilePattern: analyzeSmilePattern(frames),
    microExpressions: detectMicroExpressions(frames),
    tension: calculateAverageTension(frames),
    headStability: calculateHeadStability(frames),
  };

  const strengths = identifyStrengths(confidenceScore, frames);
  const weaknesses = identifyWeaknesses(
    confidenceScore,
    frames,
    detailedAnalysis,
  );
  const recommendations = generateRecommendations(weaknesses, detailedAnalysis);

  return {
    summary: {
      overallScore: confidenceScore.overall,
      level: confidenceLevel.level,
      totalFrames: frames.length,
      duration: calculateDuration(frames),
      timestamp: new Date().toISOString(),
    },

    scores: confidenceScore.breakdown,

    detailedMetrics: {
      eyeRolls: {
        count: detailedAnalysis.eyeRolls.length,
        details: detailedAnalysis.eyeRolls,
      },
      blinking: {
        total: detailedAnalysis.blinkPattern.totalBlinks,
        perMinute: Math.round(detailedAnalysis.blinkPattern.blinksPerMinute),
        isExcessive: detailedAnalysis.blinkPattern.isExcessive,
      },
      gaze: {
        stabilityScore: Math.round(detailedAnalysis.gazeStability.score),
        isStable: detailedAnalysis.gazeStability.isStable,
      },
      smiles: {
        percentage: Math.round(detailedAnalysis.smilePattern.smilePercentage),
        genuine: detailedAnalysis.smilePattern.genuineSmiles,
        forced: detailedAnalysis.smilePattern.forcedSmiles,
        authenticityRatio: Math.round(
          detailedAnalysis.smilePattern.authenticityRatio * 100,
        ),
      },
      tension: {
        average: Math.round(detailedAnalysis.tension.average),
        max: Math.round(detailedAnalysis.tension.max),
        isHigh: detailedAnalysis.tension.isHigh,
      },
      microExpressions: {
        count: detailedAnalysis.microExpressions.length,
        types: groupMicroExpressions(detailedAnalysis.microExpressions),
      },
    },

    strengths: strengths,
    weaknesses: weaknesses,
    recommendations: recommendations,

    keyInsights: generateKeyInsights(detailedAnalysis, confidenceScore),
  };
};

const calculateDuration = frames => {
  if (frames.length < 2) return 0;

  const duration =
    (frames[frames.length - 1].timestamp - frames[0].timestamp) / 1000;
  return Math.round(duration);
};

const groupMicroExpressions = microExpressions => {
  const grouped = {};

  microExpressions.forEach(expr => {
    if (!grouped[expr.type]) {
      grouped[expr.type] = 0;
    }
    grouped[expr.type]++;
  });

  return grouped;
};

const generateRecommendations = (weaknesses, detailedAnalysis) => {
  const recommendations = [];

  weaknesses.forEach(weakness => {
    switch (weakness.metric) {
      case 'Eye Contact':
        recommendations.push({
          priority: weakness.severity,
          area: 'Eye Contact',
          issue: weakness.issue,
          recommendation:
            'Practice the "Triangle Technique": Look at one eye, then the other, then the mouth. This creates natural eye contact without staring.',
          exercise:
            'Exercise: During conversations, maintain eye contact for 3-5 seconds before briefly looking away. Gradually increase duration.',
          impact: 'Improves perceived confidence by 40-50%',
        });
        break;

      case 'Eye Rolling':
        recommendations.push({
          priority: weakness.severity,
          area: 'Eye Rolling',
          issue: weakness.issue,
          recommendation:
            'Eye rolling signals dismissiveness or frustration. Be mindful when thinking or reacting to information.',
          exercise:
            'Exercise: When processing information, keep your gaze forward and slightly down rather than looking up. Practice active listening with a neutral face.',
          impact: 'Eliminates negative perception and improves approachability',
        });
        break;

      case 'Blinking':
        recommendations.push({
          priority: weakness.severity,
          area: 'Blinking Pattern',
          issue: weakness.issue,
          recommendation:
            'Excessive blinking indicates nervousness. Practice relaxation techniques before important interactions.',
          exercise:
            'Exercise: Deep breathing before conversations. Inhale for 4 counts, hold for 4, exhale for 6. This calms the nervous system.',
          impact: 'Reduces anxiety indicators by 30-40%',
        });
        break;

      case 'Head Stability':
        recommendations.push({
          priority: weakness.severity,
          area: 'Posture & Head Position',
          issue: weakness.issue,
          recommendation:
            'Keep your head level and still. Excessive movement suggests uncertainty or nervousness.',
          exercise:
            'Exercise: Practice speaking with a book balanced on your head for 5 minutes daily. This trains muscle memory for stable posture.',
          impact: 'Increases perceived authority and confidence by 35%',
        });
        break;

      case 'Expressiveness':
        recommendations.push({
          priority: weakness.severity,
          area: 'Facial Expressions',
          issue: weakness.issue,
          recommendation:
            'Your face appears too neutral. Confident people show appropriate emotions through facial expressions.',
          exercise:
            "Exercise: Practice smiling in the mirror. A genuine smile engages the eyes (crow's feet appear). Smile at 3 strangers daily.",
          impact: 'Improves likability and approachability by 60%',
        });
        break;

      case 'Composure':
        recommendations.push({
          priority: weakness.severity,
          area: 'Facial Tension',
          issue: weakness.issue,
          recommendation:
            'High facial tension (jaw, brow) signals stress. Practice progressive muscle relaxation.',
          exercise:
            'Exercise: Jaw relaxation - Open your mouth wide, then close gently. Repeat 10x. Do this before stressful situations.',
          impact: 'Reduces stress perception and improves warmth by 45%',
        });
        break;
    }
  });

  if (detailedAnalysis.smilePattern.authenticityRatio < 0.5) {
    recommendations.push({
      priority: 'medium',
      area: 'Smile Authenticity',
      issue: 'Your smiles appear forced or inauthentic',
      recommendation:
        'Think of genuinely happy memories when smiling. Authentic smiles engage the eye muscles naturally.',
      exercise:
        'Exercise: Before important interactions, recall a happy memory for 10 seconds. This primes genuine facial expressions.',
      impact: 'Increases trust and rapport by 50%',
    });
  }

  if (detailedAnalysis.microExpressions.length > 10) {
    recommendations.push({
      priority: 'low',
      area: 'Micro-expressions',
      issue: 'Frequent micro-expressions detected',
      recommendation:
        'These brief expressions can reveal hidden emotions. Practice emotional awareness and regulation.',
      exercise:
        'Exercise: Journal emotions before important events. This helps process feelings rather than suppressing them.',
      impact: 'Improves emotional control and authenticity',
    });
  }

  return recommendations.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority];
  });
};

const generateKeyInsights = (detailedAnalysis, confidenceScore) => {
  const insights = [];

  // Eye contact insight
  if (detailedAnalysis.gazeStability.isStable) {
    insights.push(
      '✓ You maintained steady eye contact, which projects confidence and engagement',
    );
  } else {
    insights.push(
      '⚠ Your gaze wandered frequently, which can signal discomfort or disinterest',
    );
  }

  if (detailedAnalysis.eyeRolls.length > 0) {
    insights.push(
      `⚠ Eye rolling detected ${detailedAnalysis.eyeRolls.length} time(s) - this can appear dismissive or disrespectful`,
    );
  }

  if (detailedAnalysis.blinkPattern.isExcessive) {
    insights.push(
      `⚠ Blink rate of ${Math.round(
        detailedAnalysis.blinkPattern.blinksPerMinute,
      )}/min is above normal (15-20) - suggests nervousness`,
    );
  } else {
    insights.push(
      '✓ Normal blink rate indicates you were comfortable and relaxed',
    );
  }

  // Smile insight
  if (detailedAnalysis.smilePattern.smilePercentage > 30) {
    const ratio = Math.round(
      detailedAnalysis.smilePattern.authenticityRatio * 100,
    );
    if (ratio > 70) {
      insights.push(
        `✓ You smiled ${Math.round(
          detailedAnalysis.smilePattern.smilePercentage,
        )}% of the time with ${ratio}% authenticity - excellent!`,
      );
    } else {
      insights.push(
        `⚠ You smiled ${Math.round(
          detailedAnalysis.smilePattern.smilePercentage,
        )}% of the time, but only ${ratio}% appeared genuine`,
      );
    }
  } else {
    insights.push(
      '⚠ Limited smiling detected - consider showing more positive emotions',
    );
  }

  // Tension insight
  if (detailedAnalysis.tension.isHigh) {
    insights.push(
      '⚠ High facial tension detected - practice relaxation techniques to appear more at ease',
    );
  } else {
    insights.push(
      '✓ Low facial tension indicates you were relaxed and comfortable',
    );
  }

  // Head stability insight
  if (detailedAnalysis.headStability.isStable) {
    insights.push('✓ Steady head position projects confidence and authority');
  } else {
    insights.push('⚠ Excessive head movement can appear nervous or uncertain');
  }

  // Overall confidence insight
  const level =
    confidenceScore.overall >= 70
      ? 'high'
      : confidenceScore.overall >= 50
      ? 'moderate'
      : 'low';
  insights.push(
    `📊 Overall confidence level: ${level.toUpperCase()} (${
      confidenceScore.overall
    }/100)`,
  );

  return insights;
};
