import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View, Text, StyleSheet, NativeModules, Platform } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import { extractFrameMetrics } from '../../utils/facialAnalysis';
import { generateInsights } from '../../utils/insightGenerator';

const sanitizePath = rawPath => {
  if (!rawPath) {
    return null;
  }

  return rawPath.startsWith('file://') ? rawPath.replace('file://', '') : rawPath;
};

const extractPhotoPath = photo => {
  if (!photo) {
    return null;
  }

  if (typeof photo.path === 'string') {
    return sanitizePath(photo.path);
  }

  if (typeof photo.filePath === 'string') {
    return sanitizePath(photo.filePath);
  }

  if (typeof photo.uri === 'string') {
    // Some devices return a file URI in `uri`
    if (photo.uri.startsWith('file://')) {
      return sanitizePath(photo.uri);
    }

    // Handle Photos framework URIs on iOS (ph://...) – not directly usable by UIImage
    if (Platform.OS === 'ios' && photo.uri.startsWith('ph://')) {
      return null;
    }
  }

  return null;
};

const sleep = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const { FaceLandmarkModule } = NativeModules;

import Toast from 'react-native-toast-message';

const CameraDetector = forwardRef(({ onAnalysisComplete }, ref) => {
  const camera = useRef(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [frameCount, setFrameCount] = useState(0);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Capture loop
  useEffect(() => {
    if (isCapturing) {
      intervalRef.current = setInterval(() => {
        if (camera.current && !isProcessing) {
          captureAndProcess();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCapturing, isProcessing]);

  const captureAndProcess = async () => {
    try {
      setIsProcessing(true);
      const photo = await camera.current.takePhoto();
      const imagePath = extractPhotoPath(photo);

      if (!imagePath) {
        console.warn('CameraDetector: No valid photo path returned', photo);
        Toast.show({
          type: 'error',
          text1: 'Camera error',
          text2: 'Unable to access captured photo. Please try again.',
          position: 'bottom',
          visibilityTime: 2000,
        });

        return;
      }

      // Ensure the native side has time to write the image to disk before processing it
      await sleep(120);

      const result = await FaceLandmarkModule.processImage(imagePath);

      console.log('results----', result);

      if (result.faceCount === 0) {
        Toast.show({
          type: 'info',
          text1: '👻 Where did you go?',
          text2: 'Keep your beautiful face in the center! 📸',
          position: 'bottom',
          visibilityTime: 2000,
        });

        return;
      }

      const frameMetrics = extractFrameMetrics(result);

      setCapturedFrames(prevFrames => [...prevFrames, frameMetrics]);
      setFrameCount(prev => prev + 1);

      console.log(`Frame ${frameCount + 1} captured`);
    } catch (error) {
      console.error('Error capturing frame:', error);

      if (error?.message?.includes('Cannot load image')) {
        Toast.show({
          type: 'error',
          text1: 'Camera error',
          text2: 'Unable to process the captured frame. Please try again.',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStart = () => {
    console.log('🎬 Starting facial analysis session...');
    setCapturedFrames([]);
    setFrameCount(0);
    setIsCapturing(true);
  };

  const handleStop = () => {
    console.log('⏹️  Stopping session...');
    setIsCapturing(false);

    if (capturedFrames.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('📊 FACIAL EXPRESSION CONFIDENCE ANALYSIS');
      console.log('='.repeat(80) + '\n');

      const insights = generateInsights(capturedFrames);

      // Display results in a formatted way
      displayInsights(insights);

      // **NEW: Pass insights to parent component via callback**
      if (onAnalysisComplete) {
        console.log('📤 Passing facial analysis data to parent...');
        onAnalysisComplete(insights);
      }

      // Also log raw data if needed
      console.log('\n' + '='.repeat(80));
      console.log('📁 RAW DATA (for debugging)');
      console.log('='.repeat(80));
      console.log(JSON.stringify(insights, null, 2));
    } else {
      console.log(
        '⚠️  No frames captured. Start the session and wait for at least one capture.',
      );

      // **NEW: Pass empty/error state to parent**
      if (onAnalysisComplete) {
        onAnalysisComplete({
          error: true,
          message: 'No frames captured',
        });
      }
    }
  };

  const displayInsights = insights => {
    console.log('📋 SUMMARY');
    console.log('-'.repeat(80));
    console.log(
      `Overall Confidence Score: ${insights.summary.overallScore}/100 (${insights.summary.level})`,
    );
    console.log(`Total Frames Analyzed: ${insights.summary.totalFrames}`);
    console.log(`Session Duration: ${insights.summary.duration} seconds`);
    console.log('');

    // Score Breakdown
    console.log('📊 SCORE BREAKDOWN');
    console.log('-'.repeat(80));
    Object.entries(insights.scores).forEach(([key, value]) => {
      const bar =
        '█'.repeat(Math.floor(value / 5)) +
        '░'.repeat(20 - Math.floor(value / 5));
      console.log(`${key.padEnd(20)}: ${bar} ${value}/100`);
    });
    console.log('');

    // Key Insights
    console.log('💡 KEY INSIGHTS');
    console.log('-'.repeat(80));
    insights.keyInsights.forEach((insight, i) => {
      console.log(`${i + 1}. ${insight}`);
    });
    console.log('');

    // Detailed Metrics
    console.log('📈 DETAILED METRICS');
    console.log('-'.repeat(80));
    console.log(`Eye Rolls: ${insights.detailedMetrics.eyeRolls.count} times`);
    console.log(
      `Blink Rate: ${insights.detailedMetrics.blinking.perMinute} per minute ${
        insights.detailedMetrics.blinking.isExcessive
          ? '(EXCESSIVE)'
          : '(Normal)'
      }`,
    );
    console.log(
      `Gaze Stability: ${insights.detailedMetrics.gaze.stabilityScore}/100 ${
        insights.detailedMetrics.gaze.isStable ? '✓' : '✗'
      }`,
    );
    console.log(
      `Smile Percentage: ${insights.detailedMetrics.smiles.percentage}%`,
    );
    console.log(
      `  - Genuine Smiles: ${insights.detailedMetrics.smiles.genuine}`,
    );
    console.log(`  - Forced Smiles: ${insights.detailedMetrics.smiles.forced}`);
    console.log(
      `  - Authenticity: ${insights.detailedMetrics.smiles.authenticityRatio}%`,
    );
    console.log(
      `Facial Tension: ${insights.detailedMetrics.tension.average}/100 ${
        insights.detailedMetrics.tension.isHigh ? '(HIGH)' : '(Low)'
      }`,
    );
    console.log(
      `Micro-expressions: ${insights.detailedMetrics.microExpressions.count} detected`,
    );
    if (
      Object.keys(insights.detailedMetrics.microExpressions.types).length > 0
    ) {
      Object.entries(insights.detailedMetrics.microExpressions.types).forEach(
        ([type, count]) => {
          console.log(`  - ${type}: ${count}`);
        },
      );
    }
    console.log('');

    // Strengths
    if (insights.strengths.length > 0) {
      console.log('💪 YOUR STRENGTHS');
      console.log('-'.repeat(80));
      insights.strengths.forEach((strength, i) => {
        console.log(`${i + 1}. ${strength.metric} (${strength.score}/100)`);
        console.log(`   ${strength.message}`);
      });
      console.log('');
    }

    // Weaknesses
    if (insights.weaknesses.length > 0) {
      console.log('⚠️  AREAS FOR IMPROVEMENT');
      console.log('-'.repeat(80));
      insights.weaknesses.forEach((weakness, i) => {
        const icon = weakness.severity === 'high' ? '🔴' : '🟡';
        console.log(
          `${i + 1}. ${icon} ${weakness.metric} (${weakness.score}/100)`,
        );
        console.log(`   Issue: ${weakness.issue}`);
      });
      console.log('');
    }

    // Recommendations
    if (insights.recommendations.length > 0) {
      console.log('🎯 PERSONALIZED RECOMMENDATIONS');
      console.log('-'.repeat(80));
      insights.recommendations.forEach((rec, i) => {
        const priority =
          rec.priority === 'high'
            ? '🔴 HIGH'
            : rec.priority === 'medium'
            ? '🟡 MEDIUM'
            : '🟢 LOW';
        console.log(`\n${i + 1}. ${rec.area} [${priority} PRIORITY]`);
        console.log(`   Issue: ${rec.issue}`);
        console.log(`   💡 Recommendation: ${rec.recommendation}`);
        console.log(`   🏋️  Exercise: ${rec.exercise}`);
        console.log(`   📊 Impact: ${rec.impact}`);
      });
      console.log('');
    }

    console.log('='.repeat(80));
  };

  // Expose start and stop methods to parent component
  useImperativeHandle(ref, () => ({
    startRecording: handleStart,
    stopRecording: handleStop,
    isRecording: isCapturing,
    frameCount: frameCount,
  }));

  if (!hasPermission || !device) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No camera access</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      {isCapturing && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>🔴 {frameCount} frames</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  camera: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CameraDetector;
