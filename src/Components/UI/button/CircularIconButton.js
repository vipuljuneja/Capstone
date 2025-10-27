import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const CircularIconButton = ({
  children,
  size = 52,
  borderColor = '#E5E5E5',
  backgroundColor = '#fff',
  shadowColor = '#000',
  style,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0}>
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: '50%',
          borderWidth: 1,
          borderColor,
          backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  </TouchableOpacity>
);

export default CircularIconButton;
