import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert , Image} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QuestionCard from "../Components/Onboarding/QuestionCard";
import { updateSeverityLevel } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";




const questionList = [
  "I avoid certain social situations because I’m afraid of embarrassing myself.",
  "My heart races or I overthink before speaking in front of others.",
  "I criticize myself harshly after social interactions.",
  "I find it hard to relax or fall asleep after a party or social event.",
  "I worry for a long time, replaying what I said or did.",
];

const SLIDES = [
  {
    key: "data",
    title: "Your data is safe",
    desc:
      "PIP uses your voice and video data to personalize AI feedback and help you grow.\n\n" +
      "Your information stays secure and is never shared without your consent.",
    image: require("../../assets/pipo/pipo-onboard2.png"),
    cta: "NEXT",
  },
  {
    key: "notClinical",
    title: "PIP is a self-help tool",
    desc:
      "PIP focuses on learning and self-growth. It’s not a replacement for clinical therapy.\n\n" +
      "For persistent conditions or neurodivergent concerns, please consult a qualified professional.",
    image: require("../../assets/pipo/pipo-onboard1.png"),
    cta: "NEXT",
  },
  {
    key: "questionIntro",
    title: "Let’s take a quick self-check",
    desc:
      "This is a safe space for self-discovery, not a diagnosis. If discomfort persists or affects daily life, " +
      "consider reaching out to a mental-health professional.",
    image: require("../../assets/pipo/loginPipo.png"),
    cta: "START",
  },
];

function getSummary(responses) {
  const valid = responses.filter(v => typeof v === "number");
  const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;

  if (avg < 1.5)
    return { label: "Minimal", title: "Little to no social anxiety symptoms. ", message: "You’re doing great! Keep nurturing your confidence." };
  if (avg < 2.5)
    return { label: "Mild", title: "Some anxiety in specific social situations.", message: "Seems like you’ve got a bit on your mind" };
  if (avg < 3.5)
    return { label: "Moderate", title: "Noticeable distress or avoidance.", message: "Sometimes things can be overwhelming." };
  return { label: "Severe", title: "Frequent, intense anxiety affecting daily life.", message: "That sounds tough but you are not alone!" };
}

export default function Onboarding() {
  const { user } = useAuth();
  const [phase, setPhase] = useState("slides");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState(Array(questionList.length).fill(null));
  const [slideIndex, setSlideIndex] = useState(0);

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

  // if (phase === "intro") {
  //   return (
  //     <View style={S.container}>
  //       <Pressable onPress={skipAll} style={S.skip}>
  //         <Text style={S.skipText}>SKIP</Text>
  //       </Pressable>
  //       <View style={S.center}>
  //         <Text style={S.title}>A quick self-check before you start</Text>
  //         <Text style={S.desc}>
  //           See how you are feeling with different situations to unlock your confidence.
  //         </Text>
  //       </View>
  //       <Pressable onPress={startQuestions} style={S.startBtn}>
  //         <Text style={S.startText}>START</Text>
  //       </Pressable>
  //     </View>
  //   );
  // }
  if (phase === "slides") {
    const slide = SLIDES[slideIndex];
    const onPrimary = () => {
      if (slideIndex < SLIDES.length - 1) {
        setSlideIndex(i => i + 1);
      } else {
        setPhase("questions"); 
      }
    };

    return (
      <View style={S.container}>
        <Pressable onPress={skipAll} style={S.skip}>
          <Text style={S.skipText}>SKIP</Text>
        </Pressable>

        <View style={S.center}>
          {
            <Image source={slide.image} style={{ width: 180, height: 180, marginBottom: 16 }} resizeMode="contain" />
          }

          
          <View style={S.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[S.dot, i === slideIndex ? S.dotActive : null]}
              />
            ))}
          </View>

          <Text style={S.title}>{slide.title}</Text>
          <Text style={S.desc}>{slide.desc}</Text>
        </View>

        <Pressable onPress={onPrimary} style={S.startBtn}>
          <Text style={S.startText}>{slide.cta}</Text>
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
          <Text style={S.title}>{message}</Text>
          {/* <Text style={S.desc}>{message}</Text> */}
          <Text style={S.desc}> {"\n"} Let’s move forward together {"\n"} One step at a time.</Text>
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
  dotsRow: { flexDirection: "row", gap: 8, marginBottom: 4, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#d1d5db" },
  dotActive: { width: 22, borderRadius: 5, backgroundColor: "#4b5563" },
});
