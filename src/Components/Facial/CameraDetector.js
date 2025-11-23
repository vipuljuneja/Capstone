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
import Toast from 'react-native-toast-message';

const { FaceLandmarkModule } = NativeModules;

// Utility Functions
const sanitizePath = rawPath => {
  if (!rawPath) return null;
  return rawPath.startsWith('file://')
    ? rawPath.replace('file://', '')
    : rawPath;
};

const extractPhotoPath = photo => {
  if (!photo) return null;

  if (typeof photo.path === 'string') {
    return sanitizePath(photo.path);
  }

  if (typeof photo.filePath === 'string') {
    return sanitizePath(photo.filePath);
  }

  if (typeof photo.uri === 'string') {
    if (photo.uri.startsWith('file://')) {
      return sanitizePath(photo.uri);
    }
    if (Platform.OS === 'ios' && photo.uri.startsWith('ph://')) {
      return null;
    }
  }

  return null;
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Main Component
const CameraDetector = forwardRef(({ onAnalysisComplete }, ref) => {
  const camera = useRef(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [frameCount, setFrameCount] = useState(0);

  const intervalRef = useRef(null);

  // Request camera permission
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

  // Capture and process frame
  const captureAndProcess = async () => {
    try {
      setIsProcessing(true);
      const photo = await camera.current.takePhoto();
      const imagePath = extractPhotoPath(photo);

      if (!imagePath) {
        return;
      }

      await sleep(120);

      const result = await FaceLandmarkModule.processImage(imagePath);

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
    } catch (error) {
      // Silent error handling
    } finally {
      setIsProcessing(false);
    }
  };

  // Start recording
  const start = () => {
    setCapturedFrames([]);
    setFrameCount(0);
    setIsCapturing(true);
  };

  // Stop recording and reset
  const stop = () => {
    setIsCapturing(false);
    reset();
  };

  // Reset component
  const reset = () => {
    setIsCapturing(false);
    setCapturedFrames([]);
    setFrameCount(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Finish recording and compile results
  const finish = () => {
    setIsCapturing(false);

    if (capturedFrames.length === 0) {
      const errorResult = {
        error: true,
        message: 'No frames captured',
      };
      if (onAnalysisComplete) {
        onAnalysisComplete(errorResult);
      }
      return errorResult;
    }

    const insights = generateInsights(capturedFrames);
    const result = {
      ...insights,
      frameCount: capturedFrames.length,
    };

    console.log('Final facial analysis result:', result);

    if (onAnalysisComplete) {
      onAnalysisComplete(result);
    }

    return result;
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    start,
    stop,
    reset,
    finish,
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
