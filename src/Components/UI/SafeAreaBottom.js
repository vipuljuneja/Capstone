import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SafeAreaBottom({
  color = '#fff',
  style,
  gradientProps = {},
  asGradient = true,
}) {
  const insets = useSafeAreaInsets();

  if (insets.bottom === 0) return null;

  return (
    <View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom,
          backgroundColor: color,
          zIndex: 999,
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
}
