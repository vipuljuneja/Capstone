import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QuestionCard from "../Components/Onboarding/QuestionCard";
import { updateSeverityLevel } from "../services/api";
import { useNavigation } from "@react-navigation/native";




const questionList = [
  "I feel uncomfortable speaking in a small group or meeting.",
  "Meeting new people for the first time makes me uneasy.",
  "Eating or drinking in public makes me self-conscious.",
  "Giving a formal speech or presentation worries me.",
  "Being the center of attention makes me uncomfortable.",
  "I worry about saying the wrong thing in conversation.",
  "Handling returns or customer service interactions stresses me.",
  "Attending a social gathering or party makes me anxious.",
];

function getSummary(responses) {
  const valid = responses.filter(v => typeof v === "number");
  const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;

  if (avg < 1.5)
    return { label: "LOW", title: "You’re feeling steady", message: "Great baseline!" };
  if (avg < 2.5)
    return { label: "MILD", title: "Just a few butterflies", message: "Totally normal." };
  if (avg < 3.5)
    return { label: "MODERATE", title: "Seems like you’ve got a bit on your mind", message: "We’ll move forward together." };
  return { label: "HIGH", title: "Carrying a lot right now", message: "We’ll go gently step by step." };
}

export default function Onboarding({ user }) {
  const [phase, setPhase] = useState("intro"); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState(Array(questionList.length).fill(null));
  const navigation = useNavigation(); 

  const selected = responses[currentIndex];
  const progress = (currentIndex + (selected ? 1 : 0)) / questionList.length;

  const startQuestions = () => setPhase("questions");

  const skipAll = async () => {
    try {
      const filled = responses.map(v => (v == null ? 0 : v));
      console.log("Onboarding skipped:", filled);
      await AsyncStorage.setItem("surveyResponses", JSON.stringify(filled));
      
      // Update with default MODERATE severity level
      if (user?.uid) {
        await updateSeverityLevel(user.uid, 'MODERATE');
        console.log("✅ Severity level set to MODERATE (skipped)");
      }
      
      navigation.goBack();
    } catch (error) {
      console.error("❌ Error in skipAll:", error);
      navigation.goBack();
    }
  };

  const handleSelect = (option) => {
    const updated = [...responses];
    updated[currentIndex] = option;
    setResponses(updated);
  };

  const next = async () => {
    if (responses[currentIndex] == null) {
      Alert.alert("Please select an option before continuing.");
      return;
    }

    if (currentIndex < questionList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem("surveyResponses", JSON.stringify(responses));
      setPhase("result");
    }
  };

  const back = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleFinish = async () => {
    try {
      const summary = getSummary(responses);
      console.log("Final results:", { responses, summary });
      
      // Update the severity level in the backend
      if (user?.uid) {
        await updateSeverityLevel(user.uid, summary.label);
        console.log("✅ Severity level updated:", summary.label);
        
        Alert.alert(
          "Assessment Complete! 🎉",
          `Your anxiety level: ${summary.label}\n\n${summary.message}`,
          [
            {
              text: "Let's Start!",
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        console.warn("⚠️ No user found, skipping backend update");
        navigation.goBack();
      }
    } catch (error) {
      console.error("❌ Error updating severity level:", error);
      Alert.alert(
        "Error",
        "Failed to save your assessment. Please try again.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  if (phase === "intro") {
    return (
      <View style={S.container}>
        <Pressable onPress={skipAll} style={S.skip}>
          <Text style={S.skipText}>SKIP</Text>
        </Pressable>
        <View style={S.center}>
          <Text style={S.title}>A quick self-check before you start</Text>
          <Text style={S.desc}>
            See how you are feeling with different situations to unlock your confidence.
          </Text>
        </View>
        <Pressable onPress={startQuestions} style={S.startBtn}>
          <Text style={S.startText}>START</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === "result") {
    const { label, title, message } = getSummary(responses);
    return (
      <View style={S.container}>
        <View style={S.center}>
          <Text style={S.badge}>{label}</Text>
          <Text style={S.title}>{title}</Text>
          <Text style={S.desc}>{message}</Text>
        </View>
        <Pressable onPress={handleFinish} style={S.startBtn}>
          <Text style={S.startText}>LET’S GO!</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={S.container}>
      <Pressable onPress={skipAll} style={S.skip}>
        <Text style={S.skipText}>SKIP</Text>
      </Pressable>

      <QuestionCard
        index={currentIndex}
        total={questionList.length}
        prompt={questionList[currentIndex]}
        value={selected}
        onChange={handleSelect}
      />

      <View style={S.footer}>
        <Pressable onPress={back} disabled={currentIndex === 0} style={[S.backBtn, currentIndex === 0 && S.disabled]}>
          <Text style={S.backText}>Back</Text>
        </Pressable>

        <Pressable onPress={next} style={S.nextBtn}>
          <Text style={S.nextText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 20 },
  skip: { alignSelf: "flex-end", marginBottom: 10 },
  skipText: { fontSize: 12, color: "#6b7280", letterSpacing: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827", textAlign: "center" },
  desc: { fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 20 },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#eef2ff",
    color: "#111827",
    fontWeight: "700",
    letterSpacing: 1,
  },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: "auto" },
  backBtn: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  backText: { color: "#111827", fontWeight: "600" },
  nextBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  nextText: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },
  startBtn: {
    backgroundColor: "#312e81",
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: "center",
  },
  startText: { color: "#fff", fontWeight: "700", letterSpacing: 1 },
  disabled: { opacity: 0.3 },
});
