import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import Sound from 'react-native-sound';
import { TTS_API_KEY } from '@env';

const DEEPGRAM_API_KEY = TTS_API_KEY;
const DG_MODEL = 'aura-2-thalia-en';

const VoiceOrb = forwardRef((props, ref) => {
  const { onStateChange, lines } = props; // Accept dynamic lines

  const LINES = useMemo(() => {
    if (Array.isArray(lines) && lines.length > 0) return lines;
    return [
      'Hello, how are you?',
      'Take a deep breath and relax.',
      "You're doing great—keep going.",
      'Tell me about your day so far.',
      'Thanks for practicing with me.',
    ];
  }, [lines]);

  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const showGif = speaking;

  // Call onStateChange whenever state changes
  useEffect(() => {
    if (onStateChange) {
      const state = {
        speaking,
        loading,
        idx,
        totalLines: LINES.length,
      };
      console.log('📡 VoiceOrb state changed:', state);
      onStateChange(state);
    }
  }, [speaking, loading, idx, LINES.length, onStateChange]);

  const scale = useRef(new Animated.Value(1)).current;
  const loopRef = useRef(null);

  const startPulse = () => {
    if (loopRef.current) return;
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.25,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: 360,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loopRef.current.start();
  };

  const stopPulse = () => {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current = null;
    }
    Animated.timing(scale, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const soundRef = useRef(null);

  const cleanupSound = () => {
    try {
      soundRef.current?.stop?.();
      soundRef.current?.release?.();
    } catch {}
    soundRef.current = null;
  };

  useEffect(
    () => () => {
      cleanupSound();
      stopPulse();
    },
    [],
  );

  const cache = useRef(new Map());

  const fetchMp3 = async text => {
    const url = `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(
      DG_MODEL,
    )}`;
    const res = await RNFetchBlob.config({
      fileCache: true,
      appendExt: 'mp3',
    }).fetch(
      'POST',
      url,
      {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      JSON.stringify({ text }),
    );
    return res.path();
  };

  const playPath = path =>
    new Promise((resolve, reject) => {
      if (Platform.OS === 'ios') Sound.setCategory('Playback');
      cleanupSound();
      const snd = new Sound(path, '', err => {
        if (err) return reject(err);
        soundRef.current = snd;
        setSpeaking(true);
        startPulse();
        snd.play(ok => {
          setSpeaking(false);
          stopPulse();
          cleanupSound();
          ok ? resolve(true) : reject(new Error('Playback failed'));
        });
      });
    });

  const speakIndex = async lineIndex => {
    if (loading || speaking) return;
    setLoading(true);
    try {
      const cached = cache.current.get(lineIndex);
      const path = cached || (await fetchMp3(LINES[lineIndex]));
      if (!cached) cache.current.set(lineIndex, path);
      await playPath(path);
    } catch (e) {
      console.warn('[Deepgram] error:', e?.message || e);
      setSpeaking(false);
      stopPulse();
    } finally {
      setLoading(false);
    }
  };

  // Add reset method
  const reset = () => {
    console.log('🔄 Resetting VoiceOrb to index 0');
    cleanupSound();
    stopPulse();
    setSpeaking(false);
    setLoading(false);
    setIdx(0);
  };

  useImperativeHandle(ref, () => ({
    start: () => {
      speakIndex(idx);
    },
    stop: () => {
      cleanupSound();
      stopPulse();
      setSpeaking(false);
      setLoading(false);
    },
    reset: reset,
    replay: () => {
      speakIndex(idx);
    },
    next: () => {
      if (loading || speaking) return;
      const n = Math.min(LINES.length - 1, idx + 1);
      setIdx(n);
      speakIndex(n);
    },
    prev: () => {
      if (loading || speaking) return;
      const n = Math.max(0, idx - 1);
      setIdx(n);
      speakIndex(n);
    },
    getState: () => ({
      speaking,
      loading,
      idx,
      totalLines: LINES.length,
    }),
  }));

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => speakIndex(idx)}
        disabled={loading}
        style={{ alignItems: 'center' }}
      >
        {/* <Animated.View
          style={[
            styles.ball,
            {
              transform: [{ scale }],
              opacity: 0.2,
              backgroundColor: '#6EA8FE',
              shadowOpacity: 0.15,
            },
          ]}
        /> */}

        <Image
          source={require('../../../assets/gifs/PipoORB.gif')}
          style={[styles.gif, { width: BALL, height: BALL }]}
          resizeMode="contain"
        />

        {/* If you want tap interaction only on the GIF+ball area,
        wrap Image and Animated.View together in a parent View */}
      </Pressable>

      {/* <Text style={styles.line}>"{LINES[idx]}"</Text> */}
    </View>
  );
});

const BALL = 330;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  ball: {
    width: BALL,
    height: BALL,
    borderRadius: BALL / 2,
    backgroundColor: '#6EA8FE',
    shadowColor: '#6EA8FE',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
  },
  line: {
    color: '#9DB4FF',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  gif: {
    borderRadius: BALL / 2,
    // position is set inline to 'absolute'
    // Add shadow if desired consistent with ball style
  },
});

export default VoiceOrb;
