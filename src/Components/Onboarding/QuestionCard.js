import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScaleButtons from "./ScaleButtons";
import StepProgressBar from './StepProgressBar'

export default function QuestionCard({ index, total, prompt, value, onChange }) {
  const current = index + 1;
  
  return (
    <View style={S.wrap}>
      <StepProgressBar current={current} total={total} />
      {/* <Text style={S.counter}>{`${index + 1} of ${total}`}</Text> */}
      <Text style={S.prompt}>{prompt}</Text>
      <View style={S.card}>
        <ScaleButtons value={value} onChange={onChange} />
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { gap: 18 },
  counter: { alignSelf: "center", color: "#6b7280", fontSize: 14, marginVertical: 6 },
  prompt: { fontSize: 19, fontWeight: "500", color: "#111827", lineHeight: 28 , textAlign:'center'},
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
