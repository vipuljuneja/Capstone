import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScaleButtons from "./ScaleButtons";

export default function QuestionCard({ index, total, prompt, value, onChange }) {
  return (
    <View style={S.wrap}>
      <Text style={S.counter}>{`${index + 1} of ${total}`}</Text>
      <Text style={S.prompt}>{prompt}</Text>
      <View style={S.card}>
        <ScaleButtons value={value} onChange={onChange} />
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { gap: 18 },
  counter: { alignSelf: "center", color: "#6b7280", fontSize: 14, marginVertical: 10 },
  prompt: { fontSize: 22, fontWeight: "800", color: "#111827", lineHeight: 28 },
  card: {
    marginTop: 8,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
});
