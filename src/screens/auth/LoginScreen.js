import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { getAuthErrorMessage, validateEmail } from '../../utils/authErrors';
import AuthCard from '../../Components/Auth/AuthCard';
import AuthInput from '../../Components/Auth/AuthInput';
import AuthButton from '../../Components/Auth/AuthButton';
import GoogleAuthButton from '../../Components/Auth/GoogleAuthButton';
import { signInWithGoogle } from '../../services/googleAuth';
import { authStyles } from '../../Components/Auth/authStyles';

export default function LoginScreen({
  navigation,
  onSwitchToSignup = () => {},
  onSwitchToForgotPassword = () => {},
}) {
  // Handle navigation - use navigation prop if available, otherwise use callbacks
  const handleSwitchToSignup = () => {
    if (navigation) {
      navigation.navigate('Signup');
    } else if (onSwitchToSignup) {
      onSwitchToSignup();
    }
  };

  const handleSwitchToForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ForgotPassword');
    } else if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword();
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const handleEmailChange = text => {
    setEmail(text);
    setEmailError(null);
    setError(null);
  };

  const handlePasswordChange = text => {
    setPassword(text);
    setError(null);
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setEmailError(validation.error || null);
      }
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    setError(null);
    setEmailError(null);

    // Validate email before submission
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || null);
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Signing in...');
      await signInWithEmailAndPassword(auth, email.trim(), password)
        .then(userCredential => {
          navigation.navigate('Home');
        })
        .catch(err => {
          console.log('Errrorrr', err);
        });
      console.log('✅ Login successful');
      // Navigation will be handled by AuthContext automatically
    } catch (err) {
      console.error('❌ Login error:', err);
      const message = getAuthErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle({ ensureBackendUser: true });
      // Navigate to Home after successful Google login (same as regular login)
      if (navigation) {
        navigation.navigate('Home');
      }
    } catch (err) {
      console.error('❌ Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const canSubmit =
    email.trim() !== '' && password !== '' && !emailError && !loading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthCard
          title="Welcome back"
          blobTopMargin={keyboardVisible ? 20 : 110}
          coverEyes={isPasswordVisible}
        >
          <AuthInput
            icon="envelope"
            iconSize={18}
            value={email}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            editable={!loading}
            error={!!emailError}
            testID="login-email-input"
          />

          {emailError && (
            <Text style={[authStyles.helperText, authStyles.helperTextError]}>
              {emailError}
            </Text>
          )}

          <AuthInput
            icon="lock"
            iconSize={20}
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="Password"
            isPassword
            isPasswordVisible={isPasswordVisible}
            onPasswordVisibilityChange={setIsPasswordVisible}
            editable={!loading}
            testID="login-password-input"
          />

          {error && <Text style={authStyles.errorText}>{error}</Text>}

          <TouchableOpacity
            onPress={handleSwitchToForgotPassword}
            style={authStyles.linkButton}
            disabled={loading}
            testID="forgot-password-link"
          >
            <Text style={authStyles.linkSmall}>Forgot Password?</Text>
          </TouchableOpacity>

          <AuthButton
            title="SIGN IN"
            onPress={handleLogin}
            disabled={!canSubmit}
            loading={loading}
            testID="login-button"
          />

          {/* Divider */}
          <View style={{ height: 16 }} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 8,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: '#E6E8EB' }} />
            <Text style={{ marginHorizontal: 12, color: '#6B7280' }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E6E8EB' }} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <GoogleAuthButton
              onPress={handleGoogleLogin}
              loading={googleLoading}
            />
          </View>

          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={handleSwitchToSignup}
              disabled={loading}
              testID="switch-to-signup"
            >
              <Text style={authStyles.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </AuthCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
