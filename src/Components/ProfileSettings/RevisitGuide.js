import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RevisitGuide({ slides, onStartOver }) {
  const insets = useSafeAreaInsets();

  const data = useMemo(
    () =>
      slides?.length
        ? slides
        : [
            {
              image: require("../../../assets/RevisitGuide/guide1.png"),
              title: "Scene Practice",
              subtitle: "Tap here to select scenes to practice",
            },
            {
              image: require("../../../assets/RevisitGuide/guide2.png"),
              title: "Read",
              subtitle: "Explore daily article tailored just for you",
            },
            {
              image: require("../../../assets/RevisitGuide/guide3.png"),
              title: "Mailbox",
              subtitle: "Write quick reflections and track your progress",
            },
            {
              image: require("../../../assets/RevisitGuide/guide4.png"),
              title: "Profile",
              subtitle: "You can manage your profile and settings here",
            },
          ],
    [slides]
  );

  const [i, setI] = useState(0);
  const isFirst = i === 0;
  const isLast = i === data.length - 1;

  const next = () => setI(v => Math.min(v + 1, data.length - 1));
  const back = () => setI(v => Math.max(v - 1, 0));
  const startOver = () => {
    onStartOver?.();
    setI(0);
  };

  const W = Dimensions.get("window").width;
  const PANEL_W = Math.min(W - 32, 360);
  const PHONE_W = PANEL_W - 64;
  const PHONE_H = Math.min(PHONE_W * 1.9, 620);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Gradient panel */}
        <View style={[styles.panelClip, { width: PANEL_W }]}>
          <ImageBackground
            source={require("../../../assets/gradients/RV-gradient.png")}
            resizeMode="cover"
            style={[
              styles.panelBg,
              { paddingBottom: 18 + insets.bottom },
            ]}
          >
            {/* Inner phone mock */}
            <View style={[styles.phoneWrap, { width: PHONE_W, height: PHONE_H }]}>
              <Image
                source={data[i].image}
                resizeMode="contain"
                style={{ width: "94%", height: "94%" }}
              />
            </View>

            {/* Text content */}
            <View style={styles.copy}>
              <Text style={styles.title}>{data[i].title}</Text>
              <Text style={styles.subtitle}>{data[i].subtitle}</Text>
              <Text style={styles.counter}>
                {i + 1} / {data.length}
              </Text>
            </View>

            {/* Footer  */}
            <View style={styles.footerRow}>
              {isFirst ? (
                <Pressable
                  style={[styles.primaryBtn, { width: "100%", alignSelf: "center" }]}
                  onPress={next}
                >
                  <Text style={styles.primaryText}>NEXT</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable style={styles.ghostBtn} onPress={back}>
                    <Text style={styles.ghostText}>BACK</Text>
                  </Pressable>
                  {isLast ? (
                    <Pressable style={styles.primaryBtn} onPress={startOver}>
                      <Text style={styles.primaryText}>START OVER</Text>
                    </Pressable>
                  ) : (
                    <Pressable style={styles.primaryBtn} onPress={next}>
                      <Text style={styles.primaryText}>NEXT</Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </ImageBackground>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scroll: { alignItems: "center", paddingTop: 8 },

  panelClip: {
    alignSelf: "center",
    borderRadius: 24,
    overflow: "hidden",
  },
  panelBg: {
    width: "100%",
    paddingTop: 8,
    borderRadius: 24,
  },

  phoneWrap: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },

  copy: { marginTop: 10, paddingHorizontal: 18, alignSelf: "stretch" },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#5C5C66" },
  counter: { textAlign: "right", fontSize: 12, color: "#6B6B75", marginTop: 4 },

  footerRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    paddingHorizontal: 18,
  },

  primaryBtn: {
    minWidth: 116,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#433155",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontWeight: "800", letterSpacing: 0.5 },

  ghostBtn: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3DDF4",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: { fontWeight: "800", letterSpacing: 0.5, color: "#0F0F14" },
});
