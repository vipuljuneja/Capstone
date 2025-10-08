import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Pressable, Platform } from "react-native";
import RNFetchBlob from "react-native-blob-util";
import Sound from "react-native-sound";
import {TTS_API_KEY} from "@env"

const DEEPGRAM_API_KEY = TTS_API_KEY;
const DG_MODEL = "aura-2-thalia-en"; 

export default function VoiceOrb() {
  
  const LINES = useMemo(() => [
    "Hello, how are you?",
    "Take a deep breath and relax.",
    "You’re doing great—keep going.",
    "Tell me about your day so far.",
    "Thanks for practicing with me."
  ], []);

  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const loopRef = useRef(null);
  const startPulse = () => {
    if (loopRef.current) return;
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 360, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
  };
  const stopPulse = () => {
    if (loopRef.current) { loopRef.current.stop(); loopRef.current = null; }
    Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  };


  const soundRef = useRef(null);
  const cleanupSound = () => {
    try { soundRef.current?.stop?.(); soundRef.current?.release?.(); } catch {}
    soundRef.current = null;
  };
  useEffect(() => () => { cleanupSound(); stopPulse(); }, []);

  
  const cache = useRef(new Map());

  const fetchMp3 = async (text) => {
    const url = `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(DG_MODEL)}`;
    const res = await RNFetchBlob
      .config({ fileCache: true, appendExt: "mp3" })
      .fetch("POST", url, {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      }, JSON.stringify({ text }));
    return res.path();
  };

  const playPath = (path) =>
    new Promise((resolve, reject) => {
      if (Platform.OS === "ios") Sound.setCategory("Playback");
      cleanupSound();
      const snd = new Sound(path, "", (err) => {
        if (err) return reject(err);
        soundRef.current = snd;
        setSpeaking(true);
        startPulse();
        snd.play((ok) => {
          setSpeaking(false);
          stopPulse();
          cleanupSound();
          ok ? resolve(true) : reject(new Error("Playback failed"));
        });
      });
    });

  const speakIndex = async (lineIndex) => {
    if (loading || speaking) return;
    setLoading(true);
    try {
      const cached = cache.current.get(lineIndex);
      const path = cached || await fetchMp3(LINES[lineIndex]);
      if (!cached) cache.current.set(lineIndex, path);
      await playPath(path);
    } catch (e) {
      console.warn("[Deepgram] error:", e?.message || e);
      setSpeaking(false);
      stopPulse();
    } finally {
      setLoading(false);
    }
  };

 
  const replay = () => speakIndex(idx);
  const prev   = () => { if (loading || speaking) return; const n = Math.max(0, idx - 1); setIdx(n); speakIndex(n); };
  const next   = () => { if (loading || speaking) return; const n = Math.min(LINES.length - 1, idx + 1); setIdx(n); speakIndex(n); };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Orb</Text>

      <Pressable onPress={replay} disabled={loading} style={{ alignItems: "center" }}>
        <Animated.View
          style={[
            styles.ball,
            {
              transform: [{ scale }],
              opacity: loading ? 0.7 : 1,
              shadowOpacity: speaking ? 0.35 : 0.15
            }
          ]}
        />
        <Text style={styles.caption}>
          {speaking ? "Speaking…" : loading ? "Generating…" : "Tap the orb to play"}
        </Text>
      </Pressable>

      <Text style={styles.line}>"{LINES[idx]}"</Text>
      <Text style={styles.step}>{idx + 1} / {LINES.length}</Text>

      <View style={styles.row}>
        <TouchableOpacity onPress={prev} disabled={speaking || loading || idx === 0} style={[styles.btn, (speaking || loading || idx===0) && styles.btnDisabled]}>
          <Text style={styles.btnText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={next} disabled={speaking || loading || idx === LINES.length - 1} style={[styles.btn, (speaking || loading || idx===LINES.length-1) && styles.btnDisabled]}>
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const BALL = 140;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220", alignItems: "center", justifyContent: "center", padding: 20, gap: 16 },
  title: { color: "#E6ECFF", fontSize: 20, fontWeight: "700" },
  ball: {
    width: BALL, height: BALL, borderRadius: BALL / 2, backgroundColor: "#6EA8FE",
    shadowColor: "#6EA8FE", shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 12,
  },
  caption: { color: "#C9D6FF", marginTop: 10, fontSize: 14 },
  line: { color: "#9DB4FF", fontSize: 16, textAlign: "center", marginTop: 8 },
  step: { color: "#8AA2FF", fontSize: 12 },
  row: { flexDirection: "row", gap: 12, marginTop: 8 },
  btn: { paddingHorizontal: 16, height: 44, borderRadius: 10, backgroundColor: "#3a7afe", alignItems: "center", justifyContent: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontWeight: "600" },
});
