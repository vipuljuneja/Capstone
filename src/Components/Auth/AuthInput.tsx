import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface AuthInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  icon: string;
  iconSize?: number;
  isPassword?: boolean;
  error?: boolean;
  isPasswordVisible?: boolean;
  onPasswordVisibilityChange?: (visible: boolean) => void;
}

export default function AuthInput({
  icon,
  iconSize = 20,
  isPassword = false,
  error = false,
  isPasswordVisible: controlledVisibility,
  onPasswordVisibilityChange,
  ...textInputProps
}: AuthInputProps) {
  const [uncontrolledVisibility, setUncontrolledVisibility] = useState(false);
  const isPasswordVisible =
    typeof controlledVisibility === 'boolean'
      ? controlledVisibility
      : uncontrolledVisibility;

  const handleToggleVisibility = () => {
    const nextVisibility = !isPasswordVisible;
    onPasswordVisibilityChange?.(nextVisibility);
    if (typeof controlledVisibility !== 'boolean') {
      setUncontrolledVisibility(nextVisibility);
    }
  };

  // Conditionally render different TextInputs to avoid secureTextEntry toggle crashes
  // Using key prop ensures proper remounting, and since inputs are controlled (value prop),
  // the text value will be preserved
  const commonProps = {
    ...textInputProps,
    style: [styles.input, textInputProps.style],
    placeholderTextColor: '#94a3b8',
  };

  return (
    <View style={[styles.container, error && styles.containerError]}>
      <Icon
        name={icon}
        size={iconSize}
        color={error ? '#ef4444' : '#64748b'}
        style={styles.icon}
      />
      {isPassword ? (
        isPasswordVisible ? (
          <TextInput
            {...commonProps}
            key="password-visible"
            autoComplete={Platform.OS === 'ios' ? 'password' : 'password-new'}
            textContentType="password"
          />
        ) : (
          <TextInput
            {...commonProps}
            key="password-hidden"
            secureTextEntry={true}
            autoComplete={Platform.OS === 'ios' ? 'password' : 'password-new'}
            textContentType="password"
          />
        )
      ) : (
        <TextInput {...commonProps} />
      )}
      {isPassword && (
        <TouchableOpacity
          onPress={handleToggleVisibility}
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
