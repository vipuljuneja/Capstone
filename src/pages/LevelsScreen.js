import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const SIZE = 100;

export default function LevelsScreen({ onSelectLevel }) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.circleBtn} onPress={() => onSelectLevel("level1")}>
        <Text style={styles.btnText}>Level 1</Text>
      </Pressable>

      <Pressable style={styles.circleBtn} onPress={() => onSelectLevel("level2")}>
        <Text style={styles.btnText}>Level 2</Text>
      </Pressable>

      <Pressable style={styles.circleBtn} onPress={() => onSelectLevel("level3")}>
        <Text style={styles.btnText}>Level 3</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center", gap: 25 },
  circleBtn: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: "#22c55e", justifyContent: "center", alignItems: "center", elevation: 4 },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
