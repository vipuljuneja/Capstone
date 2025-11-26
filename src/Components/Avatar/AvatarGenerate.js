import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import Video from 'react-native-video';

const AvatarGenerator = memo(
  forwardRef((props, ref) => {
    const { questionsData = [] } = props;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    const videoRef = useRef(null);
    const shouldPlayRef = useRef(false);
    const questionsDataRef = useRef(questionsData);
    const timeoutRef = useRef(null);

    // Extract video URLs from questionsData - compare by content, not reference
    const videoUrls = useMemo(() => {
      const urls = questionsData.map(q => q.videoUrl).filter(Boolean);
      const prevUrls = questionsDataRef.current
        .map(q => q.videoUrl)
        .filter(Boolean);

      // Only update if URLs actually changed
      if (
        urls.length !== prevUrls.length ||
        urls.some((url, idx) => url !== prevUrls[idx])
      ) {
        questionsDataRef.current = questionsData;
        return urls;
      }
      return prevUrls;
    }, [questionsData]);

    // Store videoUrls length in ref to avoid dependency issues
    const videoUrlsLengthRef = useRef(videoUrls.length);
    videoUrlsLengthRef.current = videoUrls.length;

    // Store currentIndex in ref for stable callbacks
    const currentIndexRef = useRef(currentIndex);
    currentIndexRef.current = currentIndex;

    // Store isPlaying in ref to avoid useImperativeHandle dependencies
    const isPlayingRef = useRef(isPlaying);
    isPlayingRef.current = isPlaying;

    // Reset component
    const reset = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setCurrentIndex(0);
      setIsPlaying(false);
      setVideoLoaded(false);
      shouldPlayRef.current = false;
      if (videoRef.current) {
        videoRef.current.seek(0);
      }
    }, []);

    // Play video at specific index - use refs to avoid dependencies
    const playVideo = useCallback(index => {
      if (index < 0 || index >= videoUrlsLengthRef.current) return;

      // Set shouldPlay to true BEFORE updating index
      shouldPlayRef.current = true;

      // If already at this index
      if (currentIndexRef.current === index) {
        // If video is already loaded, play it immediately
        if (videoLoaded && videoRef.current) {
          videoRef.current.seek(0);
          setIsPlaying(true);
          return;
        }
        // Video not loaded yet - onLoad will handle playing when it loads
        // Just ensure we're ready to play
        return;
      }

      // Different index - stop current video and change index
      setIsPlaying(false);
      setVideoLoaded(false);
      setCurrentIndex(index);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, [videoLoaded]);

    // Start playing first video
    const start = useCallback(() => {
      if (videoUrlsLengthRef.current > 0) {
        playVideo(0);
      }
    }, [playVideo]);

    // Replay current video
    const replay = useCallback(() => {
      if (videoUrlsLengthRef.current > 0) {
        shouldPlayRef.current = true;
        if (videoRef.current) {
          videoRef.current.seek(0);
          setIsPlaying(true);
        }
      }
    }, []);

    // Play next video (auto-play)
    const next = useCallback(() => {
      if (videoUrlsLengthRef.current === 0) return;

      const nextIndex = Math.min(
        videoUrlsLengthRef.current - 1,
        currentIndexRef.current + 1,
      );
      playVideo(nextIndex);
    }, [playVideo]);

    // Stop current video
    const stop = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      shouldPlayRef.current = false;
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.seek(0);
      }
    }, []);

    // Expose methods via ref - use stable references
    // Remove isPlaying from dependencies to prevent ref recreation
    useImperativeHandle(
      ref,
      () => ({
        start,
        replay,
        next,
        stop,
        reset,
        getState: () => ({
          currentIndex: currentIndexRef.current,
          isPlaying: isPlayingRef.current,
          totalVideos: videoUrlsLengthRef.current,
        }),
      }),
      [start, replay, next, stop, reset],
    );

    // Handle video load - only play if we should be playing
    const handleVideoLoad = useCallback(() => {
      setVideoLoaded(true);
      if (shouldPlayRef.current) {
        // Small delay to ensure video is ready
        setTimeout(() => {
          if (videoRef.current && shouldPlayRef.current) {
            videoRef.current.seek(0);
            setIsPlaying(true);
          }
        }, 50);
      }
    }, []);

    // Handle video end
    const handleVideoEnd = useCallback(() => {
      shouldPlayRef.current = false;
      setIsPlaying(false);
    }, []);

    // Handle video error
    const handleVideoError = useCallback(error => {
      console.error('Video error:', error);
      shouldPlayRef.current = false;
      setIsPlaying(false);
    }, []);

    // Handle tap to replay - use stable reference
    const handleVideoTap = useCallback(() => {
      if (videoUrlsLengthRef.current === 0) return;
      replay();
    }, [replay]);

    // Reset on questionsData change - compare by content, not reference
    useEffect(() => {
      const prevData = questionsDataRef.current;
      const currentUrls = questionsData.map(q => q.videoUrl).filter(Boolean);
      const prevUrls = prevData.map(q => q.videoUrl).filter(Boolean);

      // Only reset if URLs actually changed
      if (
        currentUrls.length !== prevUrls.length ||
        currentUrls.some((url, idx) => url !== prevUrls[idx])
      ) {
        reset();
        questionsDataRef.current = questionsData;
      }
    }, [questionsData, reset]);

    // Handle source URI change - ensure video loads when source changes
    useEffect(() => {
      if (videoUrls.length > 0 && currentIndex < videoUrls.length) {
        // Reset video loaded state when source changes
        setVideoLoaded(false);
        // Video will load and trigger onLoad, which will check shouldPlayRef and start playing
      }
    }, [currentIndex, videoUrls]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }, []);

    const currentVideoUrl = videoUrls[currentIndex] || null;

    return (
      <View style={styles.container}>
        {currentVideoUrl ? (
          <TouchableWithoutFeedback onPress={handleVideoTap}>
            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                source={{ uri: currentVideoUrl }}
                style={styles.video}
                resizeMode="contain"
                paused={!isPlaying}
                repeat={false}
                controls={false}
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="ignore"
                mixWithOthers={true}
                allowsExternalPlayback={false}
                audioOnly={false}
                onLoad={handleVideoLoad}
                onEnd={handleVideoEnd}
                onError={handleVideoError}
                onLoadStart={() => {
                  setVideoLoaded(false);
                }}
                onReadyForDisplay={() => {
                  // Video is ready - if we should play, play it
                  if (shouldPlayRef.current && !isPlaying && videoRef.current) {
                    videoRef.current.seek(0);
                    setIsPlaying(true);
                  }
                }}
              />
              {!isPlaying && videoLoaded && (
                <View style={styles.tapOverlay}>
                  <Text style={styles.tapText}>Tap to replay</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No videos available</Text>
          </View>
        )}
      </View>
    );
  }),
  // Custom comparison to prevent re-renders when questionsData reference changes but content is same
  (prevProps, nextProps) => {
    const prevUrls = (prevProps.questionsData || [])
      .map(q => q.videoUrl)
      .filter(Boolean);
    const nextUrls = (nextProps.questionsData || [])
      .map(q => q.videoUrl)
      .filter(Boolean);

    // Only re-render if URLs actually changed
    return (
      prevUrls.length === nextUrls.length &&
      prevUrls.every((url, idx) => url === nextUrls[idx])
    );
  },
);

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
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
});

export default AvatarGenerator;
