import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function ScaleButtons({ value, onChange }) {
  const items = [
    { n: 1, label: "Less" },
    { n: 2, label: "Mild" },
    { n: 3, label: "Moderate" },
    { n: 4, label: "High" },
    { n: 5, label: "Very high" },
  ];

  return (
    <View style={styles.row}>
      {items.map(({ n, label }) => {
        const selected = value === n;
        return (
          <View key={n} style={styles.col}>
            <Text style={styles.number}>{n}</Text>

            <Pressable
              onPress={() => onChange(n)}
              style={[styles.circle, selected && styles.circleSelected]}
              hitSlop={8}
            >
              {selected && <View style={styles.dot} />}
            </Pressable>

            <Text style={styles.caption} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const SIZE = 36;
const DOT = 16;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
    marginTop: 6,
  },
  col: {
    flex: 1,                 
    alignItems: "center",    
  },
  number: {
    fontSize: 15,
    color: "#1e1e1e",
    marginBottom: 6,
    textAlign: "center",
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: "#5a5a5a",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  circleSelected: { borderColor: "#4f46e5" },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: "#4f46e5",
  },
  caption: {
    marginTop: 6,
    fontSize: 13,
    color: "#555",
    textAlign: "center",
  },
});
