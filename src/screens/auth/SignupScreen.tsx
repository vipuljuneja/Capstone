// src/screens/auth/SignupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { createUserInBackend } from '../../services/api';

interface SignupScreenProps {
  onSwitchToLogin: () => void;
}

export default function SignupScreen({ onSwitchToLogin }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    name.trim() !== '' &&
    email.trim() !== '' &&
    password !== '' &&
    confirmPassword !== '' &&
    password === confirmPassword;

  const handleSignup = async () => {
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);
    let firebaseUser = null;

    try {
      // Step 1: Create Firebase user (but DON'T let auth state propagate yet)
      console.log('📝 Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      firebaseUser = userCredential.user;
      console.log('✅ Firebase user created:', firebaseUser.uid);

      // Step 2: IMMEDIATELY create user in MongoDB BEFORE auth state updates
      console.log('📝 Creating user in MongoDB...');
      await createUserInBackend({
        authUid: firebaseUser.uid,
        email: email.trim(),
        name: name.trim(),
      });
      console.log('✅ User created in MongoDB successfully!');
      
      // Success! Auth state can now update and user will be found in MongoDB
      Alert.alert('Success', 'Account created successfully!');
      
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      
      // ROLLBACK: If MongoDB creation failed, delete Firebase user
      if (firebaseUser) {
        try {
          console.log('🔄 Rolling back Firebase user...');
          await firebaseUser.delete();
          console.log('✅ Firebase user deleted - rollback successful');
          
          setError('Failed to create account. Please try again.');
          Alert.alert(
            'Account Creation Failed',
            'Unable to create your account. Please try again.'
          );
        } catch (deleteErr) {
          console.error('❌ Failed to delete Firebase user:', deleteErr);
          
          setError('Account created but profile save failed. Please contact support.');
          Alert.alert(
            'Profile Save Failed',
            'Your account was created but there was an issue saving your profile. Please contact support.'
          );
        }
      } else {
        // Firebase creation itself failed
        const message = err.message || 'Failed to create account';
        setError(message);
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          editable={!loading}
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          editable={!loading}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.input}
          editable={!loading}
        />

        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.input}
          editable={!loading}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          onPress={handleSignup}
          disabled={!canSubmit || loading}
          style={[
            styles.button,
            (!canSubmit || loading) && styles.buttonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={onSwitchToLogin} disabled={loading}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 32 },
  input: {
    height: 50,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    height: 50,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#334155' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#ef4444', marginBottom: 16, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: { color: '#94a3b8', fontSize: 14 },
  link: { color: '#22c55e', fontSize: 14, fontWeight: '600' },
});