import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  NativeModules,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import { extractFrameMetrics } from '../utils/facialAnalysis';
import { generateInsights } from '../utils/insightGenerator';

const { FaceLandmarkModule } = NativeModules;

const CameraDetector = () => {
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
      }, 2000);
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
      const result = await FaceLandmarkModule.processImage(photo.path);

      // Extract metrics from frame
      const frameMetrics = extractFrameMetrics(result);

      // Add to captured frames array
      setCapturedFrames(prevFrames => [...prevFrames, frameMetrics]);
      setFrameCount(prev => prev + 1);

      console.log(`Frame ${frameCount + 1} captured`);
    } catch (error) {
      console.error('Error capturing frame:', error);
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

    // Generate and display insights
    if (capturedFrames.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('📊 FACIAL EXPRESSION CONFIDENCE ANALYSIS');
      console.log('='.repeat(80) + '\n');

      const insights = generateInsights(capturedFrames);

      // Display results in a formatted way
      displayInsights(insights);

      // Also log raw data if needed
      console.log('\n' + '='.repeat(80));
      console.log('📁 RAW DATA (for debugging)');
      console.log('='.repeat(80));
      console.log(JSON.stringify(insights, null, 2));
    } else {
      console.log(
        '⚠️  No frames captured. Start the session and wait for at least one capture.',
      );
    }
  };

  const displayInsights = insights => {
    // Summary
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

  if (!hasPermission || !device) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No camera access</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Confidence Analyzer</Text>
          <Text style={styles.subtitle}>
            {isCapturing
              ? `Recording... ${frameCount} frames`
              : 'Ready to analyze'}
          </Text>
        </View>

        <View style={styles.bottomContainer}>
          <Text style={styles.statusText}>
            {isProcessing
              ? '📸 Processing...'
              : isCapturing
              ? '🔴 Recording'
              : '⚪ Stopped'}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.startButton,
                isCapturing && styles.buttonDisabled,
              ]}
              onPress={handleStart}
              disabled={isCapturing}
            >
              <Text style={styles.buttonText}>▶ Start</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.stopButton,
                !isCapturing && styles.buttonDisabled,
              ]}
              onPress={handleStop}
              disabled={!isCapturing}
            >
              <Text style={styles.buttonText}>⏹ Stop</Text>
            </TouchableOpacity>
          </View>

          {frameCount > 0 && (
            <Text style={styles.hintText}>
              💡 Capture at least 10 frames for better analysis
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomContainer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default CameraDetector;
