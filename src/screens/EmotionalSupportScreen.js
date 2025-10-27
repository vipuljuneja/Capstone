import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const callNumber = (num) => Linking.openURL(`tel:${num}`);
const openLink = (url) => Linking.openURL(url);

const RESOURCES = [
  {
    title: "988 Suicide Crisis Helpline",
    line: [
      { t: "Call or text " },
      { t: "988", link: () => callNumber("988") },
      { t: " anytime" },
    ],
  },
  {
    title: "310MentalHealth",
    line: [
      { t: "" },
      { t: "310-6789", link: () => callNumber("3106789") },
      { t: " — local 24/7 support" },
    ],
  },
  {
    title: "Talk Suicide Canada",
    line: [
      { t: "" },
      { t: "1-833-456-4566", link: () => callNumber("18334564566") },
      { t: " | " },
      { t: "talksuicide.ca", link: () => openLink("https://talksuicide.ca") },
    ],
  },
  {
    title: "Wellness Together Canada",
    line: [
      { t: "" },
      {
        t: "www.wellnesstogether.ca",
        link: () => openLink("https://www.wellnesstogether.ca"),
      },
    ],
  },
];

export default function EmotionalSupportScreen({ navigation }) {
  return (
    <SafeAreaView style={S.container}>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={S.panel}>
          <Image
            source={require("../../assets/pipo-heart.png")}
            style={S.mascot}
            resizeMode="contain"
          />
          <Text style={S.head1}>Feeling heavy?</Text>
          <Text style={S.head2}>We’re here for you.</Text>

          {RESOURCES.map((r, i) => (
            <View key={i} style={S.card}>
              <View style={S.badgeShadow}>
                <View style={S.badge}>
                  <MaterialIcons name="favorite" size={16} color="#F16C7F" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.cardTitle}>{r.title}</Text>
                <Text style={S.cardSub}>
                  {r.line.map((part, idx) => (
                    <Text
                      key={idx}
                      onPress={part.link}
                      style={
                        part.link
                          ? {
                              textDecorationLine: "underline",
                              color: "#1D4ED8",
                            }
                          : null
                      }
                    >
                      {part.t}
                    </Text>
                  ))}
                </Text>
              </View>
            </View>
          ))}

          <Text style={S.disclaimer}>
            Not a substitute for professional care.{"\n"}
            Resources listed here are for emotional support only.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  panel: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#FFF6E0",
  },
  mascot: {
    width: 96,
    height: 96,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 6,
  },
  head1: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "#111",
    marginTop: 6,
  },
  head2: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "#111",
    marginTop: 2,
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginTop: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
    }),
  },
  badgeShadow: {
    borderRadius: 16,
    backgroundColor: "#FFF",
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE6EA",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#1F1F1F" },
  cardSub: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  disclaimer: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 12,
    marginTop: 20,
  },
});
