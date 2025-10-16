// App.tsx
import React, { useEffect, useState } from 'react';
import AudioRecorder from './src/pages/AudioRecorder';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { User, signOut } from 'firebase/auth';
import LevelsScreen from './src/pages/LevelsScreen';
import Level1 from './src/screens/Level1';
import Level2 from './src/screens/Level2';
import Level3 from './src/screens/Level3';
import CameraDetector from './src/Components/Facial/CameraDetector';
import Levels from './src/pages/Levels/Levels';
import { auth } from './src/firebase';
import Toast from 'react-native-toast-message';

// Import Auth Context and Screens
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';

// SignedIn component with navigation
function SignedIn({ user }: { user: User }): React.JSX.Element {
  const [signingOut, setSigningOut] = useState(false);
  const [screen, setScreen] = useState('home');

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut(auth);
    } finally {
      setSigningOut(false);
    }
  };

  useEffect(() => {
    const getToken = async () => {
      const token = await user.getIdToken();
      console.log('🔑 Firebase Token:', token);
    };
    getToken();
  }, [user]);

  // Camera Screen
  if (screen === 'camera') {
    return (
      <View style={styles.flex}>
        <CameraDetector />
        <TouchableOpacity
          style={[styles.button, { margin: 16 }]}
          onPress={() => setScreen('home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Audio Recorder Screen
  if (screen === 'audio') {
    return (
      <View style={styles.flex}>
        <AudioRecorder />
        <TouchableOpacity
          style={[styles.button, { margin: 16 }]}
          onPress={() => setScreen('home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Levels Main Screen
  if (screen === 'levels') {
    return (
      <View style={styles.flex}>
        <Levels />
        <TouchableOpacity
          style={[styles.button, { margin: 16 }]}
          onPress={() => setScreen('home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Level Selection Screen
  if (screen === 'levelSelection') {
    return (
      <View style={styles.flex}>
        <LevelsScreen onSelectLevel={(lvl: any) => setScreen(lvl)} />
        <TouchableOpacity
          style={[styles.button, { margin: 16 }]}
          onPress={() => setScreen('home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Individual Level Screens
  if (screen === 'level1') {
    return (
      <View style={styles.flex}>
        <Level1 />
        <TouchableOpacity
          style={[styles.button, { margin: 16 }]}
          onPress={() => setScreen('levelSelection')}
        >
          <Text style={styles.buttonText}>Back to Levels</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'level2') {
    return (
      <View style={styles.flex}>
        <Level2 />
        <TouchableOpacity
          style={[styles.button, { margin: 16 }]}
          onPress={() => setScreen('levelSelection')}
        >
          <Text style={styles.buttonText}>Back to Levels</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'level3') {
    return (
      <View style={styles.flex}>
        <Level3 />
        <TouchableOpacity
          style={[styles.button, { margin: 16 }]}
          onPress={() => setScreen('levelSelection')}
        >
          <Text style={styles.buttonText}>Back to Levels</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Home Screen with all navigation buttons
  return (
    <View style={styles.content}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>{user.email ?? 'Signed in'}</Text>

      <TouchableOpacity
        onPress={() => setScreen('audio')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>🎙 Speech Analyzer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setScreen('camera')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>📷 Camera Detector</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setScreen('levels')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>🎮 Levels (Main)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setScreen('levelSelection')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>📊 Level Selection</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSignOut}
        style={[styles.button, styles.logoutButton]}
        disabled={signingOut}
      >
        {signingOut ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Log Out</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// AppContent handles auth state
function AppContent(): React.JSX.Element {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3a7afe" />
      </View>
    );
  }

  // If user is logged in, show the main app
  if (user) {
    return <SignedIn user={user} />;
  }

  // If not logged in, show login/signup screens
  return authMode === 'login' ? (
    <LoginScreen onSwitchToSignup={() => setAuthMode('signup')} />
  ) : (
    <SignupScreen onSwitchToLogin={() => setAuthMode('login')} />
  );
}

// Main App component
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: 'stretch',
    backgroundColor: '#101010',
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101010',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
  },
  errorText: {
    color: '#ff6b6b',
  },
  button: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#3a7afe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  toggleText: {
    color: '#cccccc',
  },
  toggleLink: {
    color: '#3a7afe',
    fontWeight: '600',
  },
});

export default App;