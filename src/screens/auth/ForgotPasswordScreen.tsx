import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { auth } from '../../firebase';
import { getAuthErrorMessage, validateEmail } from '../../utils/authErrors';
import AuthCard from '../../Components/Auth/AuthCard';
import AuthInput from '../../Components/Auth/AuthInput';
import AuthButton from '../../Components/Auth/AuthButton';
import { authStyles } from '../../Components/Auth/authStyles';

interface ForgotPasswordScreenProps {
  navigation?: any;
  onBackToLogin?: () => void;
}

export default function ForgotPasswordScreen({ navigation, onBackToLogin }: ForgotPasswordScreenProps) {
  // Handle navigation - use navigation prop if available, otherwise use callback
  const handleBackToLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
    } else if (onBackToLogin) {
      onBackToLogin();
    }
  };
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(null);
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

  const handleResetPassword = async () => {
    setError(null);
    setEmailError(null);

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || null);
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Password reset instructions have been sent to your email.',
        [
          {
            text: 'OK',
            onPress: handleBackToLogin,
          },
        ]
      );
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      const message = getAuthErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = email.trim() !== '' && !emailError && !loading;

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
      <AuthCard title="Reset Password" blobTopMargin={120}>
        {!emailSent ? (
          <>
            <Text style={[authStyles.helperText, { textAlign: 'center', marginBottom: 24, marginTop: -16 }]}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>

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
              testID="forgot-password-email-input"
            />

            {emailError && (
              <Text style={[authStyles.helperText, authStyles.helperTextError]}>
                {emailError}
              </Text>
            )}

            {error && <Text style={authStyles.errorText}>{error}</Text>}

            <AuthButton
              title="SEND RESET LINK"
              onPress={handleResetPassword}
              disabled={!canSubmit}
              loading={loading}
              testID="send-reset-button"
            />

            <View style={authStyles.footer}>
              <Text style={authStyles.footerText}>Remember your password?</Text>
              <Text onPress={handleBackToLogin} style={authStyles.link}>
                Sign In
              </Text>
            </View>
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ fontSize: 16, color: '#10b981', marginBottom: 16, textAlign: 'center' }}>
              ✓ Password reset email sent!
            </Text>
            <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Check your inbox for instructions to reset your password.
            </Text>
            <AuthButton
              title="BACK TO LOGIN"
              onPress={handleBackToLogin}
              testID="back-to-login-button"
            />
          </View>
        )}
      </AuthCard>
    </KeyboardAwareScrollView>
  );
}

