import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";

export default function StepProgressBar({
  current = 2,
  total = 5,
  height = 14,
  trackColor = "#E6E7EB",
  fillColor = "#342A4A",
  radius,
  animated = true,
  duration = 500,
  showLabel = true,
}) {
  const safeTotal = total || 1;
  let progress = current / safeTotal;
  if (progress < 0) progress = 0;
  if (progress > 1) progress = 1;

  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = progress * 100;
    if (animated) {
      Animated.timing(widthAnim, {
        toValue,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(toValue);
    }
  }, [progress, animated, duration, widthAnim]);

  const r = radius ?? height / 2;

  return (
    <View style={styles.wrapper}>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ now: Math.round(progress * 100), min: 0, max: 100 }}
        style={[styles.track, { height, backgroundColor: trackColor, borderRadius: r }]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
              backgroundColor: fillColor,
              borderRadius: r,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {current} of {total}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
 wrapper: { marginTop: 30 , width: "90%", alignItems: "center", alignSelf: "center" },
  track: { width: "100%", overflow: "hidden" },
  fill: { height: "100%" },
  label: { marginTop: 30, fontSize: 14, fontWeight: "600", color: "#374151" },
});
