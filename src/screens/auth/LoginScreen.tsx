import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

// Import your blob character image
const blobCharacter = require('../../../assets/pipo/loginPipo.png');

interface LoginScreenProps {
  onSwitchToSignup: () => void;
}

export default function LoginScreen({ onSwitchToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim() !== '' && password !== '';

  const handleLogin = async () => {
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);

    let isMounted = true;

    try {
      console.log('🔐 Signing in...');
      await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!isMounted) return;
      console.log('✅ Login successful');

      // Optional small delay helps prevent alert glitch on iOS
      setTimeout(() => {
        if (isMounted) {
          Alert.alert('Success', 'Welcome back!');
        }
      }, 150);

    } catch (err: any) {
      console.error('❌ Login error:', err);

      if (isMounted) {
        const message =
          err?.message ||
          'Failed to sign in. Please try again.';
        setError(message);
        Alert.alert('Error', message);
      }

    } finally {
      if (isMounted) setLoading(false);
    }

    // Cleanup guard when component unmounts
    return () => {
      isMounted = false;
    };
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F6EAC2', '#EEF3E7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.1, y: 0.5 }}
        locations={[0.2, 0.8]}
        style={StyleSheet.absoluteFill}
      />

      {/* Blob Character */}
      <View style={styles.blobContainer}>
        <Image source={blobCharacter} style={styles.blobImage} />
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Icon name="envelope" size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            style={styles.input}
            editable={!loading}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={!canSubmit || loading}
          style={[
            styles.button,
            (!canSubmit || loading) && styles.buttonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>SIGN IN</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={onSwitchToSignup} disabled={loading}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3e8',
  },
  blobContainer: {
    alignItems: 'center',
    marginTop: 110,
    zIndex: 1,
    position: 'relative',
  },
  blobImage: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: -19,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginTop: -40,
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  inputContainer: {
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    height: 56,
    backgroundColor: '#3b2764',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  link: {
    color: '#7c3aed',
    fontWeight: '600',
    fontSize: 14,
  },
});