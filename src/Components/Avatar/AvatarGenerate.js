import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from 'react';
import { encode as btoa } from 'base-64';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import Video from 'react-native-video';
import { AVATAR_API_KEY } from '@env';

const DID_API_KEY = AVATAR_API_KEY;
const AVATAR_IMAGE_URL =
  'https://create-images-results.d-id.com/api_docs/assets/noelle.jpeg';

const { width } = Dimensions.get('window');

const AvatarGenerator = forwardRef((props, ref) => {
  const {
    onStateChange,
    onInitialized,
    lines = [],
    imgURL = AVATAR_IMAGE_URL,
    videoUrls = null, // Optional: pre-generated video URLs (array of strings)
  } = props;

  // Memoize questions to prevent unnecessary re-renders
  const QUESTIONS = useMemo(() => lines, [lines.join(',')]);
  
  // Memoize videoUrls to prevent unnecessary re-initialization
  const stableVideoUrls = useMemo(() => {
    if (!videoUrls || !Array.isArray(videoUrls)) return null;
    return videoUrls;
  }, [videoUrls?.join(',')]);

  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [urls, setUrls] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const videoRef = useRef(null);
  const cache = useRef(new Map());
  const AUTH = 'Basic ' + btoa(`${DID_API_KEY}:`);
  const shouldPlayRef = useRef(false);
  const lastInitKeyRef = useRef(null);

  // Expose methods via ref (same API as VoiceOrb)
  useImperativeHandle(ref, () => ({
    start: () => {
      if (isInitialized) {
        playVideo(idx);
      }
    },
    stop: () => {
      stopVideo();
    },
    replay: () => {
      playVideo(idx);
    },
    next: () => {
      if (loading || speaking) return;
      const n = Math.min(QUESTIONS.length - 1, idx + 1);
      setIdx(n);
      setVideoLoaded(false);
      setTimeout(() => playVideo(n), 100);
    },
    prev: () => {
      if (loading || speaking) return;
      const n = Math.max(0, idx - 1);
      setIdx(n);
      setVideoLoaded(false);
      setTimeout(() => playVideo(n), 100);
    },
    getState: () => ({
      speaking,
      loading,
      idx,
      totalLines: QUESTIONS.length,
      isInitialized, // Important: parent can check this
    }),
    isReady: () => isInitialized, // Convenience method
  }));

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        speaking,
        loading,
        idx,
        totalLines: QUESTIONS.length,
        isInitialized,
      });
    }
  }, [speaking, loading, idx, isInitialized, onStateChange, QUESTIONS.length]);

  useEffect(() => {
    // Create a unique key for this initialization
    const questionsKey = QUESTIONS.join(',');
    const urlsKey = stableVideoUrls?.join(',') || 'no-urls';
    const initKey = `${questionsKey}-${urlsKey}`;
    
    // Prevent duplicate initialization for the same questions/videoUrls
    if (lastInitKeyRef.current === initKey && isInitialized) {
      return;
    }
    
    lastInitKeyRef.current = initKey;
    // Reset initialization state when questions/videoUrls change
    setIsInitialized(false);
    setUrls([]);
    initializeVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsKey, urlsKey]);

  // Notify parent when initialization completes
  useEffect(() => {
    if (isInitialized && onInitialized) {
      onInitialized();
    }
  }, [isInitialized, onInitialized]);

  // Generate a single video
  const makeVideo = async (line, lineIndex) => {
    // Check cache first
    const cached = cache.current.get(lineIndex);
    if (cached) {
      console.log(`✅ Using cached video for question ${lineIndex}`);
      return cached;
    }

    console.log(`🎬 Generating video for question ${lineIndex}: "${line}"`);

    const create = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: AUTH },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: line,
          provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
        },
        source_url: imgURL,
        config: { stitch: true },
      }),
    });

    // Handle rate limit errors
    if (create.status === 429) {
      const errorText = await create.text();
      throw new Error('Rate limit exceeded (429): ' + errorText);
    }

    if (!create.ok) {
      const errorText = await create.text();
      throw new Error('Create talk failed: ' + errorText);
    }

    const { id } = await create.json();
    if (!id) throw new Error('No talk id returned');

    // Poll for video completion
    for (let tries = 0; tries < 120; tries++) {
      await new Promise(r => setTimeout(r, 2000));

      const res = await fetch(`https://api.d-id.com/talks/${id}`, {
        headers: { Authorization: AUTH },
      });

      // Handle rate limit during polling
      if (res.status === 429) {
        console.log('⏳ Rate limited during polling. Waiting 10s...');
        await new Promise(r => setTimeout(r, 10000));
        continue; // Retry the same poll
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Status check failed: ' + errorText);
      }

      const j = await res.json();

      console.log(
        `Question ${lineIndex} - Try ${tries + 1}: Status = ${j.status}`,
      );

      if (j.status === 'done' && j.result_url) {
        console.log(`✅ Video ready for question ${lineIndex}:`, j.result_url);
        cache.current.set(lineIndex, j.result_url);
        return j.result_url;
      }

      if (j.status === 'error') {
        throw new Error(j.error?.description || j.error || 'D-ID job error');
      }
    }
    throw new Error('Timed out waiting for video (4 minutes)');
  };

  // Initialize all videos (generate them in background OR use provided URLs)
  const initializeVideos = async () => {
    if (isInitialized || loading) return;

    // If videoUrls are provided, use them directly (no generation needed)
    if (stableVideoUrls && Array.isArray(stableVideoUrls) && stableVideoUrls.length > 0) {
      console.log('✅ Using provided video URLs (pre-generated videos)');
      setUrls(stableVideoUrls);
      setIsInitialized(true);
      return;
    }

    // Otherwise, generate videos using D-ID API
    setLoading(true);
    setGenerationProgress(0);
    console.log('🎬 Pre-generating all avatar videos...');

    try {
      const generatedUrls = [];
      const DELAY_BETWEEN_VIDEOS = 5000; // 5 seconds between requests to avoid rate limits

      // Generate all videos sequentially with delays
      for (let k = 0; k < QUESTIONS.length; k++) {
        // Add delay before each video (except the first one)
        if (k > 0) {
          console.log(`⏳ Waiting ${DELAY_BETWEEN_VIDEOS / 1000}s before next video to avoid rate limits...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_VIDEOS));
        }
        
        console.log(`Generating video ${k + 1}/${QUESTIONS.length}...`);
        try {
          const url = await makeVideo(QUESTIONS[k], k);
          generatedUrls.push(url);
          setGenerationProgress(((k + 1) / QUESTIONS.length) * 100);
        } catch (error) {
          console.error(`❌ Failed to generate video ${k + 1}:`, error);
          // If rate limited, wait longer before next attempt
          if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
            console.log('⏳ Rate limited. Waiting 15s before next video...');
            await new Promise(resolve => setTimeout(resolve, 15000));
          }
          // Continue with next video even if one fails
        }
      }

      setUrls(generatedUrls);
      setIsInitialized(true);
      console.log('✅ All videos pre-generated and ready!');
    } catch (e) {
      console.error('Error initializing videos:', e);
      setVideoError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  // Play a specific video by index
  const playVideo = index => {
    if (loading || !isInitialized) return;

    console.log(`▶️  Playing video ${index}`);
    setVideoError(null);
    shouldPlayRef.current = true;

    // If video is already loaded, start speaking immediately
    if (videoLoaded) {
      setSpeaking(true);
    }
    // Otherwise, wait for onLoad callback
  };

  // Stop current video
  const stopVideo = () => {
    console.log('⏹️  Stopping video');
    shouldPlayRef.current = false;
    setSpeaking(false);
  };

  // Handle tap on video to replay
  const handleVideoTap = () => {
    if (!isInitialized || loading) return;

    console.log('👆 Video tapped - Replaying');

    // Seek to start and replay
    if (videoRef.current) {
      videoRef.current.seek(0);
    }

    shouldPlayRef.current = true;
    setSpeaking(true);
  };

  // Handle video load - this is called when video is ready to play
  const handleVideoLoad = () => {
    console.log('✅ Video loaded successfully');
    setVideoError(null);
    setVideoLoaded(true);

    // If we should be playing, start now
    if (shouldPlayRef.current) {
      setSpeaking(true);
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    console.log('🏁 Video ended');
    shouldPlayRef.current = false;
    setSpeaking(false);
  };

  // Handle video errors
  const handleVideoError = e => {
    console.error('❌ Video error:', e);
    setVideoError(JSON.stringify(e));
    setSpeaking(false);
    shouldPlayRef.current = false;
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6EA8FE" />
          <Text style={styles.loadingText}>Generating avatar videos...</Text>
          <Text style={styles.progressText}>
            {Math.round(generationProgress)}% complete
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${generationProgress}%` }]}
            />
          </View>
        </View>
      )}

      {isInitialized && urls.length > 0 && urls[idx] && (
        <TouchableWithoutFeedback onPress={handleVideoTap}>
          <View style={styles.videoWrapper}>
            <Video
              key={`video-${idx}`}
              ref={videoRef}
              source={{ uri: urls[idx] }}
              style={styles.video}
              resizeMode="contain"
              paused={!speaking}
              repeat={false}
              controls={false}
              playInBackground={false}
              playWhenInactive={false}
              onLoad={handleVideoLoad}
              onEnd={handleVideoEnd}
              onError={handleVideoError}
              onLoadStart={() => {
                console.log('⏳ Video loading started');
                setVideoLoaded(false);
              }}
              onBuffer={({ isBuffering }) => {
                console.log(
                  `${isBuffering ? '⏸️' : '▶️'} Buffering: ${isBuffering}`,
                );
              }}
            />
            {!speaking && (
              <View style={styles.tapOverlay}>
                <Text style={styles.tapText}>Tap to replay</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      )}

      {!isInitialized && !loading && videoError && (
        <View style={styles.placeholder}>
          <Text style={styles.errorText}>
            Failed to generate videos. Please check your API key and try again.
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  tapOverlay: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tapText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  progressText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6EA8FE',
    borderRadius: 4,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AvatarGenerator;
