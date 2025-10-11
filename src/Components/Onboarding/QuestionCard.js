import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScaleButtons from "./ScaleButtons"; 

export default function QuestionCard({ index, total, prompt, value, onChange }) {
  return (
    <View style={S.wrap}>
      <Text style={S.progress}>{`${index + 1}/${total}`}</Text>
      <Text style={S.prompt}>{prompt}</Text>
      <ScaleButtons value={value} onChange={onChange} />
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { gap: 16 },
  progress: { alignSelf: "flex-end", color: "#6b7280", fontSize: 14 },
  prompt: { fontSize: 20, fontWeight: "600", color: "#111827", marginTop: 6 },
});
