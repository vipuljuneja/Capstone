import React from 'react';
import {
  TouchableOpacity,
  Image,
  ViewStyle,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';

type GoogleAuthButtonProps = {
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
  label?: string;
};

export default function GoogleAuthButton({
  onPress,
  loading,
  style,
  label = 'Sign in with Google',
}: GoogleAuthButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!!loading}
      style={[styles.box, loading && styles.disabledBox, style]}
      testID="google-auth-button"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <>
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../../assets/icons/google.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 52,
    borderRadius: 28,
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
    flexDirection: 'row',
    paddingHorizontal: 18,
    width: '100%',
  },
  disabledBox: {
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginLeft: 12,
  },
});
