import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { auth } from '../../firebase';
import { createUserInBackend } from '../../services/api';
import { 
  getAuthErrorMessage, 
  validateEmail, 
  validatePassword, 
  validateName 
} from '../../utils/authErrors';
import AuthCard from '../../Components/Auth/AuthCard';
import AuthInput from '../../Components/Auth/AuthInput';
import AuthButton from '../../Components/Auth/AuthButton';
import { authStyles } from '../../Components/Auth/authStyles';

interface SignupScreenProps {
  navigation?: any;
  onSwitchToLogin?: () => void;
}

export default function SignupScreen({ navigation, onSwitchToLogin }: SignupScreenProps) {
  // Handle navigation - use navigation prop if available, otherwise use callback
  const handleSwitchToLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
    } else if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Field-specific errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const handleNameChange = (text: string) => {
    setName(text);
    setNameError(null);
    setError(null);
  };

  const handleNameBlur = () => {
    if (name.trim()) {
      const validation = validateName(name);
      if (!validation.isValid) {
        setNameError(validation.error || null);
      }
    }
  };

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

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(null);
    setError(null);
    
    if (text) {
      const validation = validatePassword(text);
      if (!validation.isValid) {
        setPasswordError(validation.error || null);
        setPasswordStrength(null);
      } else {
        setPasswordStrength(validation.strength || null);
      }
    } else {
      setPasswordStrength(null);
    }

    // Check if passwords match
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    
    if (text && password && text !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError(null);
    }
    
    setError(null);
  };

  const handleSignup = async () => {
    setError(null);
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    // Validate all fields
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    let hasError = false;

    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || null);
      hasError = true;
    }

    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || null);
      hasError = true;
    }

    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || null);
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    let firebaseUser = null;

    try {
      console.log('📝 Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      firebaseUser = userCredential.user;
      console.log('✅ Firebase user created:', firebaseUser.uid);

      console.log('📝 Creating MongoDB user...');
      await createUserInBackend({
        authUid: firebaseUser.uid,
        email: email.trim(),
        name: name.trim(),
      });

      console.log('✅ MongoDB user created successfully.');
      // Navigation will be handled by AuthContext automatically

    } catch (err: any) {
      console.error('❌ Signup error:', err);

      // Rollback if Firebase user was created but backend failed
      if (firebaseUser) {
        try {
          console.log('🔄 Rolling back Firebase user...');
          await firebaseUser.delete();
          console.log('✅ Firebase user deleted (rollback successful)');
        } catch (deleteErr) {
          console.error('❌ Rollback failed:', deleteErr);
        }
      }

      const message = getAuthErrorMessage(err);
      setError(message);

    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    name.trim() !== '' &&
    email.trim() !== '' &&
    password !== '' &&
    confirmPassword !== '' &&
    password === confirmPassword &&
    !nameError &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError &&
    !loading;

  return (
    // <KeyboardAwareScrollView
    //   contentContainerStyle={{ flexGrow: 1 }}
    //   keyboardShouldPersistTaps="handled"
    //   enableOnAndroid
    //   extraScrollHeight={20}
    // >
      <AuthCard title="Sign up" blobTopMargin={110}>
        <AuthInput
          icon="user"
          iconSize={20}
          value={name}
          onChangeText={handleNameChange}
          onBlur={handleNameBlur}
          placeholder="Name"
          editable={!loading}
          error={!!nameError}
          testID="signup-name-input"
        />

        {nameError && (
          <Text style={[authStyles.helperText, authStyles.helperTextError]}>
            {nameError}
          </Text>
        )}

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
          testID="signup-email-input"
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
          error={!!passwordError}
          testID="signup-password-input"
        />

        {passwordError && (
          <Text style={[authStyles.helperText, authStyles.helperTextError]}>
            {passwordError}
          </Text>
        )}

        {password && !passwordError && passwordStrength && (
          <>
            <View style={authStyles.passwordStrengthContainer}>
              <View
                style={[
                  authStyles.passwordStrengthBar,
                  authStyles.passwordStrengthBarFilled,
                  passwordStrength === 'weak' && authStyles.passwordStrengthBarWeak,
                  passwordStrength === 'medium' && authStyles.passwordStrengthBarMedium,
                  passwordStrength === 'strong' && authStyles.passwordStrengthBarStrong,
                ]}
              />
              <View
                style={[
                  authStyles.passwordStrengthBar,
                  (passwordStrength === 'medium' || passwordStrength === 'strong') &&
                    authStyles.passwordStrengthBarFilled,
                  passwordStrength === 'medium' && authStyles.passwordStrengthBarMedium,
                  passwordStrength === 'strong' && authStyles.passwordStrengthBarStrong,
                ]}
              />
              <View
                style={[
                  authStyles.passwordStrengthBar,
                  passwordStrength === 'strong' &&
                    authStyles.passwordStrengthBarFilled &&
                    authStyles.passwordStrengthBarStrong,
                ]}
              />
            </View>
            <Text style={authStyles.passwordStrengthText}>
              Password strength: {passwordStrength}
            </Text>
          </>
        )}

        <AuthInput
          icon="lock"
          iconSize={20}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          placeholder="Confirm Password"
          isPassword
          editable={!loading}
          error={!!confirmPasswordError}
          testID="signup-confirm-password-input"
        />

        {confirmPasswordError && (
          <Text style={[authStyles.helperText, authStyles.helperTextError]}>
            {confirmPasswordError}
          </Text>
        )}

        {error && <Text style={authStyles.errorText}>{error}</Text>}

        <View style={authStyles.termsContainer}>
          <Text style={authStyles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={authStyles.link}>Terms of Use</Text> and{' '}
            <Text style={authStyles.link}>Privacy Policy</Text>
          </Text>
        </View>

        <AuthButton
          title="SIGN UP"
          onPress={handleSignup}
          disabled={!canSubmit}
          loading={loading}
          testID="signup-button"
        />

        <View style={authStyles.footer}>
          <Text style={authStyles.footerText}>Already have an account?</Text>
          <TouchableOpacity 
            onPress={handleSwitchToLogin} 
            disabled={loading}
            testID="switch-to-login"
          >
            <Text style={authStyles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </AuthCard>
    // </KeyboardAwareScrollView>
  );
}
