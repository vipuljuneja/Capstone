export const extractFrameMetrics = frameData => {
  const blendshapes = frameData.blendshapes.reduce((acc, item) => {
    acc[item.category] = item.score;
    return acc;
  }, {});

  return {
    timestamp: Date.now(),
    blendshapes,
    metrics: {
      eyeContact: calculateEyeContact(blendshapes),
      headPose: calculateHeadPose(blendshapes),
      facialTension: calculateFacialTension(blendshapes),
      smileQuality: calculateSmileQuality(blendshapes),
      eyeMovement: calculateEyeMovement(blendshapes),
    },
  };
};

const calculateEyeContact = blendshapes => {
  const lookDown =
    (blendshapes.eyeLookDownLeft + blendshapes.eyeLookDownRight) / 2;
  const lookUp = (blendshapes.eyeLookUpLeft + blendshapes.eyeLookUpRight) / 2;
  const lookSide =
    (blendshapes.eyeLookInLeft +
      blendshapes.eyeLookInRight +
      blendshapes.eyeLookOutLeft +
      blendshapes.eyeLookOutRight) /
    4;

  const distraction = lookDown + lookUp + lookSide;

  return Math.max(0, 100 - distraction * 100);
};

const calculateHeadPose = blendshapes => {
  const jawMovement =
    blendshapes.jawLeft + blendshapes.jawRight + blendshapes.jawForward;

  return {
    stability: Math.max(0, 100 - jawMovement * 200),
    jawTension: blendshapes.jawForward * 100,
  };
};

const calculateFacialTension = blendshapes => {
  const browTension =
    (blendshapes.browDownLeft + blendshapes.browDownRight) / 2;
  const jawTension = blendshapes.jawForward;
  const mouthPress =
    (blendshapes.mouthPressLeft + blendshapes.mouthPressRight) / 2;

  return {
    overall: ((browTension + jawTension + mouthPress) / 3) * 100,
    brow: browTension * 100,
    jaw: jawTension * 100,
    mouth: mouthPress * 100,
  };
};

const calculateSmileQuality = blendshapes => {
  const smileIntensity =
    (blendshapes.mouthSmileLeft + blendshapes.mouthSmileRight) / 2;
  const eyeInvolvement =
    (blendshapes.eyeSquintLeft + blendshapes.eyeSquintRight) / 2;
  const cheekRaise =
    (blendshapes.cheekSquintLeft + blendshapes.cheekSquintRight) / 2;

  const authenticity =
    smileIntensity > 0.1 ? (eyeInvolvement + cheekRaise) / smileIntensity : 0;

  return {
    isSmiling: smileIntensity > 0.1,
    intensity: smileIntensity * 100,
    authenticity: Math.min(100, authenticity * 100),
  };
};

const calculateEyeMovement = blendshapes => {
  return {
    lookingDown:
      (blendshapes.eyeLookDownLeft + blendshapes.eyeLookDownRight) / 2,
    lookingUp: (blendshapes.eyeLookUpLeft + blendshapes.eyeLookUpRight) / 2,
    lookingSide:
      (blendshapes.eyeLookInLeft +
        blendshapes.eyeLookInRight +
        blendshapes.eyeLookOutLeft +
        blendshapes.eyeLookOutRight) /
      4,
    blinkRate: (blendshapes.eyeBlinkLeft + blendshapes.eyeBlinkRight) / 2,
  };
};

export const detectEyeRolls = frames => {
  const eyeRolls = [];
  const THRESHOLD = 0.15;

  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].metrics.eyeMovement;
    const curr = frames[i].metrics.eyeMovement;

    const upwardMovement = curr.lookingUp - prev.lookingUp;

    if (upwardMovement > THRESHOLD) {
      eyeRolls.push({
        frameIndex: i,
        timestamp: frames[i].timestamp,
        intensity: upwardMovement,
        lookUpValue: curr.lookingUp,
      });
    }
  }

  return eyeRolls;
};

export const analyzeBlinkPattern = frames => {
  const blinks = [];
  let blinkCount = 0;
  const BLINK_THRESHOLD = 0.5;

  for (let i = 0; i < frames.length; i++) {
    const blinkRate = frames[i].metrics.eyeMovement.blinkRate;

    if (blinkRate > BLINK_THRESHOLD) {
      blinkCount++;
      blinks.push({
        frameIndex: i,
        timestamp: frames[i].timestamp,
        intensity: blinkRate,
      });
    }
  }

  const durationSeconds =
    frames.length > 1
      ? (frames[frames.length - 1].timestamp - frames[0].timestamp) / 1000
      : 1;
  const blinksPerMinute = (blinkCount / durationSeconds) * 60;

  return {
    totalBlinks: blinkCount,
    blinksPerMinute: blinksPerMinute,
    isExcessive: blinksPerMinute > 25,
    timestamps: blinks,
  };
};

export const calculateGazeStability = frames => {
  if (frames.length < 2) {
    return {
      score: 100,
      isStable: true,
      averageMovement: 0,
    };
  }

  let totalMovement = 0;

  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].metrics.eyeMovement;
    const curr = frames[i].metrics.eyeMovement;

    const movement =
      Math.abs(curr.lookingSide - prev.lookingSide) +
      Math.abs(curr.lookingDown - prev.lookingDown) +
      Math.abs(curr.lookingUp - prev.lookingUp);

    totalMovement += movement;
  }

  const avgMovement = totalMovement / (frames.length - 1);

  const stability = Math.max(0, 100 - avgMovement * 200);

  return {
    score: stability,
    isStable: stability > 70,
    averageMovement: avgMovement,
  };
};

export const analyzeSmilePattern = frames => {
  let genuineSmiles = 0;
  let forcedSmiles = 0;
  let totalSmileTime = 0;
  const AUTHENTICITY_THRESHOLD = 50;

  frames.forEach((frame, index) => {
    const smile = frame.metrics.smileQuality;

    if (smile.isSmiling) {
      totalSmileTime++;

      if (smile.authenticity > AUTHENTICITY_THRESHOLD) {
        genuineSmiles++;
      } else {
        forcedSmiles++;
      }
    }
  });

  const smilePercentage =
    frames.length > 0 ? (totalSmileTime / frames.length) * 100 : 0;

  const totalSmiles = genuineSmiles + forcedSmiles;
  const authenticityRatio = totalSmiles > 0 ? genuineSmiles / totalSmiles : 0;

  return {
    totalFramesSmiling: totalSmileTime,
    smilePercentage,
    genuineSmiles,
    forcedSmiles,
    authenticityRatio,
  };
};

export const detectMicroExpressions = frames => {
  if (frames.length < 3) return [];

  const microExpressions = [];
  const CHANGE_THRESHOLD = 0.3;

  for (let i = 1; i < frames.length - 1; i++) {
    const prev = frames[i - 1].blendshapes;
    const curr = frames[i].blendshapes;
    const next = frames[i + 1].blendshapes;

    const browChange = Math.abs(
      curr.browDownLeft +
        curr.browDownRight -
        (prev.browDownLeft + prev.browDownRight),
    );

    if (browChange > CHANGE_THRESHOLD) {
      microExpressions.push({
        type: 'concern',
        frameIndex: i,
        timestamp: frames[i].timestamp,
        intensity: browChange,
      });
    }

    const lipPress = (curr.mouthPressLeft + curr.mouthPressRight) / 2;
    if (lipPress > CHANGE_THRESHOLD) {
      microExpressions.push({
        type: 'suppression',
        frameIndex: i,
        timestamp: frames[i].timestamp,
        intensity: lipPress,
      });
    }

    const noseSneer = (curr.noseSneerLeft + curr.noseSneerRight) / 2;
    if (noseSneer > 0.2) {
      microExpressions.push({
        type: 'contempt',
        frameIndex: i,
        timestamp: frames[i].timestamp,
        intensity: noseSneer,
      });
    }

    const mouthFrown = (curr.mouthFrownLeft + curr.mouthFrownRight) / 2;
    if (mouthFrown > 0.25) {
      microExpressions.push({
        type: 'disapproval',
        frameIndex: i,
        timestamp: frames[i].timestamp,
        intensity: mouthFrown,
      });
    }
  }

  return microExpressions;
};

export const calculateAverageTension = frames => {
  if (frames.length === 0) {
    return {
      average: 0,
      max: 0,
      min: 0,
      isHigh: false,
    };
  }

  const tensions = frames.map(f => f.metrics.facialTension.overall);

  const sum = tensions.reduce((a, b) => a + b, 0);
  const avg = sum / tensions.length;

  return {
    average: avg,
    max: Math.max(...tensions),
    min: Math.min(...tensions),
    isHigh: avg > 50,
  };
};

export const calculateHeadStability = frames => {
  if (frames.length === 0) {
    return {
      score: 0,
      isStable: false,
    };
  }

  const stabilities = frames.map(f => f.metrics.headPose.stability);

  const sum = stabilities.reduce((a, b) => a + b, 0);
  const avg = sum / stabilities.length;

  return {
    score: avg,
    isStable: avg > 70,
  };
};

export const calculateAverageEyeContact = frames => {
  if (frames.length === 0) return 0;

  const eyeContactScores = frames.map(f => f.metrics.eyeContact);
  const sum = eyeContactScores.reduce((a, b) => a + b, 0);

  return sum / eyeContactScores.length;
};

export const detectFidgeting = frames => {
  if (frames.length < 2) return { count: 0, isExcessive: false };

  let fidgetCount = 0;
  const FIDGET_THRESHOLD = 0.2;

  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].blendshapes;
    const curr = frames[i].blendshapes;

    const totalChange =
      Math.abs(curr.jawLeft - prev.jawLeft) +
      Math.abs(curr.jawRight - prev.jawRight) +
      Math.abs(curr.browInnerUp - prev.browInnerUp) +
      Math.abs(curr.mouthLeft - prev.mouthLeft) +
      Math.abs(curr.mouthRight - prev.mouthRight);

    if (totalChange > FIDGET_THRESHOLD) {
      fidgetCount++;
    }
  }

  const fidgetRate = (fidgetCount / frames.length) * 100;

  return {
    count: fidgetCount,
    rate: fidgetRate,
    isExcessive: fidgetRate > 30,
  };
};
