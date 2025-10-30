import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>


      <ScrollView style={styles.scroll}>
        <Text style={styles.text}>
          This Privacy Policy describes how the PIP development team ("we," "us,"
          or "our") collects, uses, and protects your information when you use
          the PIP mobile application (the "App"). Your privacy and data security
          are critically important to us.
        </Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.text}>
          To provide a personalized and effective experience, we collect the
          following types of information:{"\n"}
          • <Text style={styles.bold}>Account Information:</Text> When you
          create an account, we may collect your name, email address, and
          password for secure login.{"\n"}
          • <Text style={styles.bold}>User-Generated Content:</Text> During your
          use of the App, we collect the data you generate in practice
          scenarios, including:{"\n"}
          – Audio and Video Recordings: The App records you via your device's
          microphone and front camera to analyze your tone, pace, filler words,
          eye contact, and expressions.{"\n"}
          – Transcripts: We transcribe your speech to analyze responses and
          provide review transcripts.{"\n"}
          – Usage and Progress Data: We track performance, results, and
          completion of levels to adapt and personalize your training sessions.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          Your data is used to power the core features of the App and improve
          your experience:{"\n"}
          • To Provide AI-Powered Feedback{"\n"}
          • To Personalize Your Training{"\n"}
          • To Motivate and Encourage{"\n"}
          • To Operate and Secure the Service
        </Text>

        <Text style={styles.heading}>3. Data Storage and Security</Text>
        <Text style={styles.text}>
          We are committed to protecting your data.{"\n"}
          • Cloud Storage: All user data is securely stored via Firebase or
          Supabase.{"\n"}
          • Encryption: We use encryption and HTTPS for all communication and
          storage.
        </Text>

        <Text style={styles.heading}>4. Data Sharing and Disclosure</Text>
        <Text style={styles.text}>
          We do not sell your personal data. Sharing happens only when:{"\n"}
          • With Service Providers (e.g., Firebase, MongoDB Atlas){"\n"}
          • To Meet Legal Requirements
        </Text>

        <Text style={styles.heading}>5. Your Rights and Choices</Text>
        <Text style={styles.text}>
          You may request to access, correct, or delete your personal
          information by contacting us.
        </Text>

        <Text style={styles.heading}>6. A Note on Clinical Use</Text>
        <Text style={styles.text}>
          The data collected by PIP is for self-improvement and communication
          growth only. It is not clinical data or intended for medical
          diagnosis.
        </Text>

        <Text style={styles.heading}>7. Changes to This Privacy Policy</Text>
        <Text style={styles.text}>
          We may update our Privacy Policy periodically. Updates will be posted
          in the App.
        </Text>

        <Text style={styles.heading}>8. Contact Us</Text>
        <Text style={styles.text}>
          If you have questions or concerns, please contact us at pip.wmdd.ca.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 18, fontWeight: "600", marginLeft: 16 },
  scroll: { padding: 16 },
  text: { fontSize: 14, color: "#111", lineHeight: 22, marginBottom: 12 },
  heading: { fontSize: 16, fontWeight: "700", marginTop: 10, marginBottom: 4 },
  bold: { fontWeight: "600" },
});
