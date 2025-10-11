import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScaleButtons from "../Components/Onboarding/ScaleButtons";

const QUESTIONS = [
  "Speaking in a small group or meeting.",
  "Meeting new people for the first time.",
  "Eating/drinking in front of others in public.",
  "Giving a formal speech or presentation.",
  "Being the center of attention.",
  "Worried about saying the wrong thing.",
  "Returning something / customer service.",
  "Attending a social gathering or party.",
];

export default function Onboarding() {
  const [step, setStep] = useState("intro");       
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);      
  const [score, setScore] = useState(null);        

  useEffect(() => {
    setScore(answers[index] ?? null);
  }, [index]);

  const handleSelect = (val) => {
    const updated = [...answers];
    updated[index] = val;
    setAnswers(updated);
    setScore(val);
  };

  const handleNext = async () => {
    if (step === "intro") {
      setStep("questions");
      return;
    }

    if (step === "questions") {
      if (score == null) {
        Alert.alert("Pick a value", "Please select an option to proceed.");
        return;
      }

      const updated = [...answers];
      updated[index] = score;
      setAnswers(updated);

      if (index < QUESTIONS.length - 1) {
        setIndex(index + 1);
        return;
      }

      await AsyncStorage.setItem("onboardingAnswers", JSON.stringify(updated));
      setStep("summary");
      return;
    }

    if (step === "summary") {
      const payload = {
        answers,
        completed: true,
        timestamp: Date.now(),
      };
      console.log("Final Results:", payload);
      await AsyncStorage.setItem("onboardingComplete", "true");
    }
  };

  const handleBack = () => {
    if (step === "questions" && index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* INTRO step */}
      {step === "intro" && (
        <View style={styles.center}>
          <Text style={styles.title}>Welcome to PIP</Text>
          <Text style={styles.text}>
            You’ll rate 8 social situations from 1–5:
            {"\n"}1 = Not at all, 5 = A lot
          </Text>
        </View>
      )}

      {/* QUESTIONS */}
      {step === "questions" && (
        <View style={styles.center}>
          <Text style={styles.progress}>
            {index + 1}/{QUESTIONS.length}
          </Text>
          <Text style={styles.question}>{QUESTIONS[index]}</Text>

          
          <ScaleButtons value={score} onChange={handleSelect} />
        </View>
      )}

      {/* SUMMARY */}
      {step === "summary" && (
        <ScrollView style={styles.scroll}>
          <Text style={styles.title}>Review your answers</Text>
          {QUESTIONS.map((q, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.qText}>{q}</Text>
              <Text style={styles.answer}>{answers[i] ?? "-"}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      
      <View style={styles.footer}>
        {step === "questions" && index > 0 && (
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        )}

        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {step === "intro"
              ? "Start"
              : step === "questions" && index === QUESTIONS.length - 1
              ? "Review"
              : step === "summary"
              ? "Finish"
              : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  center: { flex: 1, justifyContent: "center", gap: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  text: { fontSize: 16, color: "#374151" },
  question: { fontSize: 20, fontWeight: "600", color: "#111827" },
  progress: { alignSelf: "flex-end", color: "#6b7280", fontSize: 14 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    alignItems: "center",
  },
  backBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  backText: { fontWeight: "600" },
  nextBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextText: { color: "white", fontWeight: "700" },
  scroll: { flex: 1, marginTop: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
  },
  qText: { flex: 1, color: "#374151" },
  answer: { fontWeight: "bold", color: "#111827" },
});
