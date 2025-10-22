// src/screens/auth/SignupScreen.tsx
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';

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
  ScrollView,
  Image,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { createUserInBackend } from '../../services/api';
// import Icon from 'react-native-vector-icons/FontAwesome';

// Import your blob character image
// Replace with your actual blob image path
// const blobCharacter = require('../../../assets/pip/articlePipo.png');

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';


const blobCharacter = require('../../../assets/pipo/loginPipo.png');

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
      console.log('📝 Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      firebaseUser = userCredential.user;
      console.log('✅ Firebase user created:', firebaseUser.uid);

      console.log('📝 Creating user in MongoDB...');
      await createUserInBackend({
        authUid: firebaseUser.uid,
        email: email.trim(),
        name: name.trim(),
      });
      console.log('✅ User created in MongoDB successfully!');
      
      Alert.alert('Success', 'Account created successfully!');
      
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      
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
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
<LinearGradient
        colors={['#F6EAC2', '#EEF3E7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.1, y: 0.5 }}
        locations={[0.2, 0.8]}
        style={StyleSheet.absoluteFill}
      />





    {/* <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    > */}
      {/* Blob Character */}
      <View style={styles.blobContainer}>
        <Image source={blobCharacter} style={styles.blobImage} />
        
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Sign up</Text>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            editable={!loading}
          />
        </View>

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

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            style={styles.input}
            editable={!loading}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.link}>Terms of Use</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSignup}
          disabled={!canSubmit || loading}
          style={[
            styles.button,
            (!canSubmit || loading) && styles.buttonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>
      </View>
    {/* </ScrollView> */}
  </KeyboardAvoidingView>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3e8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  blobContainer: {
    alignItems: 'center',
    marginTop: 210,
    zIndex: 1, // blob sits behind the card
    position: 'relative',
  },
  blobBackground: {
    width: 200,
    height: 200,
  
  },
  blobImage: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: -19,
  },
card: {
  flex: 1, // allow it to fill vertical space
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
  marginTop: -40, // keeps blob overlapping
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
  termsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  button: {
    height: 56,
    backgroundColor: '#3b2764',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
});
