import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      

      <ScrollView style={styles.scroll}>
        <Text style={styles.text}>
          Welcome to PIP!{"\n\n"}
          These Terms of Use ("Terms") govern your use of the PIP mobile
          application (the "App"), provided by the PIP development team ("we,"
          "us," or "our"). By downloading, accessing, or using our App, you
          agree to be bound by these Terms.
        </Text>

        <Text style={styles.heading}>1. About the App</Text>
        <Text style={styles.text}>
          PIP is a mobile application designed as a self-improvement tool to
          help individuals who experience mild to moderate social anxiety or
          discomfort practice social interactions in a safe, private space. The
          App uses AI-powered analysis of verbal and non-verbal cues to provide
          objective, actionable feedback and offers a progressive, level-based
          training system to help users build confidence at their own pace.
        </Text>

        <Text style={styles.heading}>2. Important Disclaimer: Not a Medical Service</Text>
        <Text style={styles.text}>
          PIP is positioned within the Mental Wellness and Communication Tech
          industry and is intended for personal and social growth. It is a
          supportive tool, not a clinical solution or a substitute for
          professional medical advice, diagnosis, or treatment. The App is not
          designed to treat a clinical illness.{"\n\n"}
          If you are experiencing high levels of anxiety, severe social anxiety
          disorder, or any other mental health condition, you should consult
          with a qualified psychiatrist, therapist, or other healthcare
          professional. Do not disregard professional medical advice or delay in
          seeking it because of information or features within this App.
        </Text>

        <Text style={styles.heading}>3. User Accounts</Text>
        <Text style={styles.text}>
          To use certain features of the App, you may need to create an account.
          You are responsible for maintaining the confidentiality of your account
          information and for all activities that occur under your account. You
          agree to notify us immediately of any unauthorized use of your account.
        </Text>

        <Text style={styles.heading}>4. Use of Device Features</Text>
        <Text style={styles.text}>
          To provide its core functionality, PIP requires access to your mobile
          device's features:{"\n\n"}
          <Text style={styles.bold}>• Microphone and Front-Facing Camera:</Text>{" "}
          The App uses these to capture your verbal and non-verbal data during
          practice scenarios. This data is analyzed by our AI to provide
          feedback on your tone of voice, eye contact, facial expressions, and
          other cues.{"\n"}
          <Text style={styles.bold}>• Push Notifications:</Text> We may use push
          notifications to send reminders, updates, and motivational messages
          from your "Encouragement Notebook."
        </Text>

        <Text style={styles.heading}>5. User Conduct</Text>
        <Text style={styles.text}>
          You agree not to use the App for any unlawful purpose or in any way
          that could damage, disable, or impair the service. You are solely
          responsible for your interactions and the content you generate within
          the App.
        </Text>

        <Text style={styles.heading}>6. Intellectual Property</Text>
        <Text style={styles.text}>
          All content, features, and functionality of the App, including but not
          limited to text, graphics, logos, avatars, and software, are the
          exclusive property of the PIP development team and are protected by
          international copyright, trademark, and other intellectual property
          laws.
        </Text>

        <Text style={styles.heading}>7. Termination</Text>
        <Text style={styles.text}>
          We may terminate or suspend your access to the App at any time,
          without prior notice or liability, for any reason, including if you
          breach these Terms.
        </Text>

        <Text style={styles.heading}>8. Limitation of Liability</Text>
        <Text style={styles.text}>
          The App is provided on an "as is" and "as available" basis. To the
          fullest extent permitted by law, we disclaim all warranties, express
          or implied. We are not liable for any indirect, incidental, or
          consequential damages arising from your use of the App.
        </Text>

        <Text style={styles.heading}>9. Changes to Terms</Text>
        <Text style={styles.text}>
          We reserve the right to modify these Terms at any time. We will notify
          you of any changes by posting the new Terms within the App. Continued
          use of the App after changes constitutes acceptance.
        </Text>

        <Text style={styles.heading}>10. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions about these Terms, please contact us at
          pip.wmdd.ca.
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
