import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface AuthInputProps extends TextInputProps {
  icon: string;
  iconSize?: number;
  isPassword?: boolean;
  error?: boolean;
}

export default function AuthInput({
  icon,
  iconSize = 20,
  isPassword = false,
  error = false,
  ...textInputProps
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, error && styles.containerError]}>
      <Icon
        name={icon}
        size={iconSize}
        color={error ? '#ef4444' : '#64748b'}
        style={styles.icon}
      />
      <TextInput
        {...textInputProps}
        style={[styles.input, textInputProps.style]}
        secureTextEntry={isPassword && !isPasswordVisible}
        placeholderTextColor="#94a3b8"
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeButton}
          accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          accessibilityRole="button"
        >
          <Icon
            name={isPasswordVisible ? 'eye' : 'eye-slash'}
            size={20}
            color="#64748b"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  containerError: {
    borderColor: '#ef4444',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

