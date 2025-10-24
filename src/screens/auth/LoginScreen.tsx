import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { auth } from '../../firebase';
import { getAuthErrorMessage, validateEmail } from '../../utils/authErrors';
import AuthCard from '../../Components/Auth/AuthCard';
import AuthInput from '../../Components/Auth/AuthInput';
import AuthButton from '../../Components/Auth/AuthButton';
import { authStyles } from '../../Components/Auth/authStyles';

interface LoginScreenProps {
  navigation?: any;
  onSwitchToSignup?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginScreen({ 
  navigation,
  onSwitchToSignup, 
  onSwitchToForgotPassword 
}: LoginScreenProps) {
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
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(null);
    setError(null);
  };

  const handlePasswordChange = (text: string) => {
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
      await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('✅ Login successful');
      // Navigation will be handled by AuthContext automatically
    } catch (err: any) {
      console.error('❌ Login error:', err);
      const message = getAuthErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = email.trim() !== '' && password !== '' && !emailError && !loading;

  return (
    // <KeyboardAwareScrollView
    //   contentContainerStyle={{ flexGrow: 1 }}
    //   keyboardShouldPersistTaps="handled"
    //   enableOnAndroid
    //   extraScrollHeight={20}
    // >
      <AuthCard title="Welcome back" blobTopMargin={110}>
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
    // </KeyboardAwareScrollView>
  );
}
