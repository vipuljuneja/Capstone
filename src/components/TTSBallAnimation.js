import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Pressable, Platform } from "react-native";
import Tts from "react-native-tts";

export default function TTSBall() {
  const LINES = useMemo(
    () => [
      "Hello, how are you?",
      "Take a deep breath and relax.",
      "You’re doing great—keep going.",
      "Tell me about your day so far.",
      "Thanks for practicing with me."
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [speaking, setSpeaking] = useState(false);

 
  const scale = useRef(new Animated.Value(1)).current;
  const loopRef = useRef(null);

  const startPulse = useCallback(() => {
    if (loopRef.current) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 350, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
      ])
    );
    loopRef.current = loop;
    loop.start();
  }, [scale]);

  const stopPulse = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current = null;
    }
    Animated.timing(scale, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [scale]);


  const speakLine = useCallback(async (lineIndex) => {
    if (speaking) return;

    
    if (Platform.OS === "ios") {
      await Tts.setDefaultRate(0.5, true);
    } else {
      await Tts.setDefaultRate(0.5);
      try { await Tts.stop(); } catch {}
    }
    await Tts.setDefaultPitch(1.0);
    try {
      await Tts.setDefaultLanguage("en-US");
      if (Platform.OS === "ios") {
        try { await Tts.setDefaultVoice("com.apple.voice.compact.en-US.Samantha"); } catch {}
      }
    } catch {}

    setSpeaking(true);
    startPulse();
    Tts.speak(LINES[lineIndex]);
  }, [LINES, speaking, startPulse]);

 
  useEffect(() => {
    const onStart  = () => { setSpeaking(true);  startPulse(); };
    const onFinish = () => { setSpeaking(false); stopPulse(); };
    const onCancel = onFinish;

    let subStart, subFinish, subCancel;
    Tts.getInitStatus()
      .then(() => {
        subStart  = Tts.addEventListener("tts-start",  onStart);
        subFinish = Tts.addEventListener("tts-finish", onFinish);
        subCancel = Tts.addEventListener("tts-cancel", onCancel);
      })
      .catch(e => console.warn("[TTS] init error:", e));

    return () => {
      subStart?.remove?.();
      subFinish?.remove?.();
      subCancel?.remove?.();
      if (Platform.OS === "android") { try { Tts.stop(); } catch {} }
      stopPulse();
      setSpeaking(false);
    };
  }, [startPulse, stopPulse]);

 
  const onReplay = () => { if (!speaking) speakLine(idx); };
  const onPrev   = () => { if (speaking) return; const next = Math.max(0, idx - 1); setIdx(next); speakLine(next); };
  const onNext   = () => { if (speaking) return; const next = Math.min(LINES.length - 1, idx + 1); setIdx(next); speakLine(next); };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Orb (Sequence)</Text>

      <Pressable onPress={onReplay} style={{ alignItems: "center" }}>
        <Animated.View
          style={[
            styles.ball,
            { transform: [{ scale }], shadowOpacity: speaking ? 0.35 : 0.15 },
          ]}
        />
        <Text style={styles.caption}>{speaking ? "Speaking…" : "Tap the orb to play"}</Text>
      </Pressable>

      <Text style={styles.line}>"{LINES[idx]}"</Text>
      <Text style={styles.step}>{idx + 1} / {LINES.length}</Text>

      <View style={styles.row}>
        <TouchableOpacity onPress={onPrev} disabled={speaking || idx === 0} style={[styles.btn, (speaking || idx===0) && styles.btnDisabled]}>
          <Text style={styles.btnText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} disabled={speaking || idx === LINES.length - 1} style={[styles.btn, (speaking || idx===LINES.length-1) && styles.btnDisabled]}>
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
