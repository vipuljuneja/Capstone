import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");


const scenarioContent = {
  "Ordering Coffee": {
    mascot: require("../../../assets/pipo/pipo-coffee.png"),
    missionText: "go order that coffee!",
    card1: "Congrats! You've reached the final level. Look how far you've come. Now it's time for your real-life mission:",
    card2: "Remember it's completely okay to feel a little nervous. PIP is always here for you.",
    card3: "Feel free to come back and practice or share your experience with the community.",
  },
  "Connecting": {
    mascot: require("../../../assets/pipo/pipo-hi.png"),
    missionText: "go make that connection!",
    card1: "Congratulations! You've mastered all the levels. Now it's time to put your skills to the test in the real world:",
    card2: "Whether it's a networking event, a meetup, or just introducing yourself to someone new, you've got this! Remember, everyone feels a bit nervous at first.",
    card3: "You've practiced your voice, your expressions, and your confidence. Trust in the work you've put in and take that first step.",
  },
  "Job Interview": {
    mascot: require("../../../assets/pipo/pipo-job.png"),
    missionText: "ace that job interview!",
    card1: "Amazing work! You've completed all the practice levels. Now you're ready for the real deal:",
    card2: "You've practiced your answers, your body language, and your confidence. Walk into that interview knowing you've prepared well.",
    card3: "Remember, interviews are conversations. Be yourself, be confident, and show them why you're the right fit. You've got this!",
  },
};

export default function SpecialMissionScreen({ navigation, onDone }) {
  const route = useRoute();
  const { scenarioTitle = "Ordering Coffee" } = route?.params || {};
  
  const content = scenarioContent[scenarioTitle] || scenarioContent["Ordering Coffee"];

  const handlePress = () => {
    if (onDone) onDone();
    else navigation?.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={require("../../../assets/onboard-bg.png")} 
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.subtitle}>You've unlocked</Text>
          <Text style={styles.title}>Special Mission!</Text>

          <Image
            source={content.mascot}
            style={styles.mascot}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <Text style={styles.text}>
              {content.card1}{" "}
              <Text style={{ fontWeight: "bold" }}>{content.missionText}</Text>
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.text}>{content.card2}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.text}>{content.card3}</Text>
          </View>

          <Pressable style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>I CAN DO THIS!</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bg: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#111",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  mascot: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#2D2550", 
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 30,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
  },
});
