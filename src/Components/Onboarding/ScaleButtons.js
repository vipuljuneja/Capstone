import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const OPTIONS = [
  { value: 1, label: "Not at all" },
  { value: 2, label: "Slightly" },
  { value: 3, label: "Moderately" },
  { value: 4, label: "Frequently" },
];

export default function ScaleButtons({ value, onChange }) {
  return (
    <View style={S.wrap}>
      {OPTIONS.map(opt => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[S.item, selected && S.selected]}
            android_ripple={{ color: "#e5e7eb" }}
          >
            <Text style={[S.label, selected && S.labelSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { gap: 18, paddingHorizontal: 15, paddingVertical: 15 },
  item: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { borderColor: "#4f46e5", backgroundColor: "#eef2ff" },
  label: { fontSize: 15, color: "#111827" },
  labelSelected: { color: "#1f2937", fontWeight: "600" },
});
