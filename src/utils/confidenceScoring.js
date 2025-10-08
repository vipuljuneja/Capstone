import {
  detectEyeRolls,
  analyzeBlinkPattern,
  calculateGazeStability,
  analyzeSmilePattern,
  detectMicroExpressions,
  calculateAverageTension,
  calculateHeadStability,
  calculateAverageEyeContact,
  detectFidgeting,
} from './facialAnalysis';

export const calculateConfidenceScore = frames => {
  if (frames.length === 0) {
    return {
      overall: 0,
      breakdown: {
        eyeContact: 0,
        posture: 0,
        expressiveness: 0,
        composure: 0,
        naturalness: 0,
      },
    };
  }

  const gazeStability = calculateGazeStability(frames);
  const headStability = calculateHeadStability(frames);
  const smilePattern = analyzeSmilePattern(frames);
  const blinkPattern = analyzeBlinkPattern(frames);
  const tension = calculateAverageTension(frames);
  const eyeRolls = detectEyeRolls(frames);
  const fidgeting = detectFidgeting(frames);

  const eyeContactScore = gazeStability.score;
  const postureScore = headStability.score;
  const expressivenessScore = calculateExpressiveness(smilePattern, frames);
  const composureScore = 100 - tension.average;
  const naturalnessScore = calculateNaturalness(
    blinkPattern,
    eyeRolls,
    fidgeting,
  );

  const weights = {
    eyeContact: 0.25, // 25% - Most important for confidence
    posture: 0.2, // 20% - Physical presence
    expressiveness: 0.2, // 20% - Emotional engagement
    composure: 0.2, // 20% - Calmness under pressure
    naturalness: 0.15, // 15% - Absence of nervous tics
  };

  const totalScore =
    eyeContactScore * weights.eyeContact +
    postureScore * weights.posture +
    expressivenessScore * weights.expressiveness +
    composureScore * weights.composure +
    naturalnessScore * weights.naturalness;

  return {
    overall: Math.round(totalScore),
    breakdown: {
      eyeContact: Math.round(eyeContactScore),
      posture: Math.round(postureScore),
      expressiveness: Math.round(expressivenessScore),
      composure: Math.round(composureScore),
      naturalness: Math.round(naturalnessScore),
    },
    weights: weights,
  };
};

const calculateExpressiveness = (smilePattern, frames) => {
  if (smilePattern.totalFramesSmiling === 0) {
    return 40;
  }

  let smileScore;
  if (smilePattern.smilePercentage < 20) {
    smileScore = smilePattern.smilePercentage * 2;
  } else if (smilePattern.smilePercentage > 70) {
    smileScore = 100 - (smilePattern.smilePercentage - 70);
  } else {
    smileScore = 40 + smilePattern.smilePercentage;
  }

  const authenticityBonus = smilePattern.authenticityRatio * 30;

  const expressionVariation = calculateExpressionVariation(frames);
  const variationBonus = expressionVariation * 10;

  const finalScore = smileScore + authenticityBonus + variationBonus;

  return Math.min(Math.max(finalScore, 0), 100);
};

const calculateExpressionVariation = frames => {
  if (frames.length < 2) return 0;

  let totalVariation = 0;

  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].blendshapes;
    const curr = frames[i].blendshapes;

    const variation =
      Math.abs(curr.mouthSmileLeft - prev.mouthSmileLeft) +
      Math.abs(curr.mouthSmileRight - prev.mouthSmileRight) +
      Math.abs(curr.browInnerUp - prev.browInnerUp) +
      Math.abs(curr.eyeSquintLeft - prev.eyeSquintLeft) +
      Math.abs(curr.eyeSquintRight - prev.eyeSquintRight);

    totalVariation += variation;
  }

  const avgVariation = totalVariation / (frames.length - 1);

  if (avgVariation < 0.05) return 30;
  if (avgVariation > 0.3) return 40;
  return 100;
};

const calculateNaturalness = (blinkPattern, eyeRolls, fidgeting) => {
  let score = 100;

  if (blinkPattern.isExcessive) {
    const excessAmount = blinkPattern.blinksPerMinute - 25;
    score -= Math.min(excessAmount * 2, 30);
  }

  const eyeRollPenalty = Math.min(eyeRolls.length * 10, 40);
  score -= eyeRollPenalty;

  if (fidgeting.isExcessive) {
    score -= Math.min(fidgeting.rate, 20);
  }

  return Math.max(score, 0);
};

export const getConfidenceLevel = score => {
  if (score >= 85) {
    return {
      level: 'Excellent',
      color: '#4CAF50',
      emoji: '🌟',
      description: 'You project strong confidence and presence',
    };
  }
  if (score >= 70) {
    return {
      level: 'Very Good',
      color: '#8BC34A',
      emoji: '😊',
      description:
        'You show confident body language with minor areas to polish',
    };
  }
  if (score >= 55) {
    return {
      level: 'Good',
      color: '#FFC107',
      emoji: '🙂',
      description: 'You have a solid foundation with room for improvement',
    };
  }
  if (score >= 40) {
    return {
      level: 'Moderate',
      color: '#FF9800',
      emoji: '😐',
      description: 'Your confidence could use some work',
    };
  }
  if (score >= 25) {
    return {
      level: 'Needs Work',
      color: '#FF5722',
      emoji: '😟',
      description: 'Significant improvements needed',
    };
  }
  return {
    level: 'Poor',
    color: '#F44336',
    emoji: '😰',
    description: 'Focus on building basic confidence skills',
  };
};

export const identifyStrengths = (confidenceScore, frames) => {
  const strengths = [];
  const breakdown = confidenceScore.breakdown;

  if (breakdown.eyeContact >= 75) {
    strengths.push({
      metric: 'Eye Contact',
      score: breakdown.eyeContact,
      icon: '👁️',
      message: 'You maintained excellent eye contact throughout the session',
      impact: 'This makes you appear engaged, trustworthy, and confident',
    });
  }

  if (breakdown.posture >= 75) {
    strengths.push({
      metric: 'Head Posture',
      score: breakdown.posture,
      icon: '🎯',
      message: 'Your head position was steady and composed',
      impact: 'Stable posture projects authority and self-assurance',
    });
  }

  if (breakdown.expressiveness >= 70) {
    strengths.push({
      metric: 'Facial Expressiveness',
      score: breakdown.expressiveness,
      icon: '😊',
      message: 'You showed great facial expressions and authentic emotions',
      impact: 'Natural expressions make you more relatable and charismatic',
    });
  }

  if (breakdown.composure >= 75) {
    strengths.push({
      metric: 'Composure',
      score: breakdown.composure,
      icon: '😌',
      message: 'You appeared relaxed with minimal facial tension',
      impact: 'Calmness under pressure inspires confidence in others',
    });
  }

  if (breakdown.naturalness >= 80) {
    strengths.push({
      metric: 'Natural Behavior',
      score: breakdown.naturalness,
      icon: '✨',
      message: 'Your expressions were natural without nervous tics',
      impact: 'Authenticity builds trust and connection',
    });
  }

  return strengths.sort((a, b) => b.score - a.score);
};

export const identifyWeaknesses = (
  confidenceScore,
  frames,
  detailedAnalysis,
) => {
  const weaknesses = [];
  const breakdown = confidenceScore.breakdown;

  if (breakdown.eyeContact < 60) {
    weaknesses.push({
      metric: 'Eye Contact',
      score: breakdown.eyeContact,
      severity: breakdown.eyeContact < 40 ? 'high' : 'medium',
      icon: '👁️',
      issue: 'Inconsistent eye contact detected',
      why: 'Poor eye contact can make you appear uncertain, disinterested, or untrustworthy',
    });
  }

  if (breakdown.posture < 65) {
    weaknesses.push({
      metric: 'Head Stability',
      score: breakdown.posture,
      severity: breakdown.posture < 45 ? 'high' : 'medium',
      icon: '🎯',
      issue: 'Excessive head movement or unstable posture',
      why: 'Fidgety head movements signal nervousness and lack of composure',
    });
  }

  if (breakdown.expressiveness < 55) {
    weaknesses.push({
      metric: 'Expressiveness',
      score: breakdown.expressiveness,
      severity: breakdown.expressiveness < 35 ? 'high' : 'medium',
      icon: '😐',
      issue: 'Limited facial expressions or inauthentic smiles',
      why: 'A neutral or stiff face appears unapproachable and disengaged',
    });
  }

  if (breakdown.composure < 60) {
    weaknesses.push({
      metric: 'Composure',
      score: breakdown.composure,
      severity: breakdown.composure < 40 ? 'high' : 'medium',
      icon: '😰',
      issue: 'High facial tension detected (jaw, brow, mouth)',
      why: 'Visible tension reveals stress and can make others uncomfortable',
    });
  }

  if (detailedAnalysis.eyeRolls.length > 0) {
    weaknesses.push({
      metric: 'Eye Rolling',
      score: breakdown.naturalness,
      severity: detailedAnalysis.eyeRolls.length > 3 ? 'high' : 'medium',
      icon: '🙄',
      issue: `Eye rolling detected ${detailedAnalysis.eyeRolls.length} time${
        detailedAnalysis.eyeRolls.length > 1 ? 's' : ''
      }`,
      why: 'Eye rolling appears dismissive, disrespectful, or condescending',
    });
  }

  if (detailedAnalysis.blinkPattern.isExcessive) {
    weaknesses.push({
      metric: 'Blinking',
      score: breakdown.naturalness,
      severity:
        detailedAnalysis.blinkPattern.blinksPerMinute > 35 ? 'high' : 'medium',
      icon: '😣',
      issue: `Excessive blinking (${Math.round(
        detailedAnalysis.blinkPattern.blinksPerMinute,
      )} blinks/min vs normal 15-20)`,
      why: 'Rapid blinking is a classic nervousness indicator',
    });
  }

  return weaknesses.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === 'high' ? -1 : 1;
    }
    return a.score - b.score;
  });
};

export const getPercentileRanking = score => {
  if (score >= 85) return { percentile: 95, message: 'Top 5% - Exceptional' };
  if (score >= 75) return { percentile: 80, message: 'Top 20% - Very Strong' };
  if (score >= 65) return { percentile: 65, message: 'Above Average' };
  if (score >= 50) return { percentile: 50, message: 'Average' };
  if (score >= 40) return { percentile: 35, message: 'Below Average' };
  if (score >= 30) return { percentile: 20, message: 'Bottom 20%' };
  return { percentile: 10, message: 'Bottom 10%' };
};

export const calculateImprovementPotential = confidenceScore => {
  const breakdown = confidenceScore.breakdown;
  const improvements = [];

  Object.entries(breakdown).forEach(([metric, score]) => {
    const potential = 100 - score;
    if (potential > 20) {
      improvements.push({
        metric,
        currentScore: score,
        potential,
        projectedScore: Math.min(score + potential * 0.7, 95),
      });
    }
  });

  return improvements.sort((a, b) => b.potential - a.potential);
};

export const identifyQuickWins = (confidenceScore, detailedAnalysis) => {
  const quickWins = [];

  if (detailedAnalysis.eyeRolls.length > 0) {
    quickWins.push({
      area: 'Stop Eye Rolling',
      difficulty: 'Easy',
      timeframe: 'Immediate',
      impact: 'High',
      tip: 'Simply be aware when you look up while thinking. Keep gaze forward.',
    });
  }

  if (detailedAnalysis.blinkPattern.isExcessive) {
    quickWins.push({
      area: 'Reduce Blinking',
      difficulty: 'Easy',
      timeframe: '1-2 days',
      impact: 'Medium',
      tip: 'Take 3 deep breaths before conversations to calm nerves.',
    });
  }

  if (detailedAnalysis.smilePattern.smilePercentage < 20) {
    quickWins.push({
      area: 'Smile More',
      difficulty: 'Easy',
      timeframe: 'Immediate',
      impact: 'High',
      tip: 'Think of something pleasant before interactions. Natural smiles follow.',
    });
  }

  return quickWins;
};
