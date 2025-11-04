import React from 'react';
import { TouchableOpacity, Image, ViewStyle, StyleSheet, View } from 'react-native';

type GoogleAuthButtonProps = {
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
};

export default function GoogleAuthButton({ onPress, loading, style }: GoogleAuthButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!!loading}
      style={[styles.box, loading && styles.disabledBox, style]}
      testID="google-auth-button"
    >
      <View style={styles.iconWrapper}>
        <Image
          source={require('../../../assets/icons/google.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DADCE0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  disabledBox: {
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconWrapper: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 26,
    height: 26,
  },
});


