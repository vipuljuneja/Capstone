import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';

// Feature Screens
import DailyArticleMain from './src/screens/DailyArticleMain';

import { auth } from './src/firebase';
import { AuthProvider } from './src/contexts/AuthContext';
import Toast from 'react-native-toast-message';

function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {initializing ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : user ? (
            <LoggedInScreen user={user} />
          ) : (
            <AuthScreens />
          )}
          <Toast />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

function AuthScreens(): React.JSX.Element {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  if (mode === 'signup') {
    return <SignupScreen onSwitchToLogin={() => setMode('login')} />;
  }

  return <LoginScreen onSwitchToSignup={() => setMode('signup')} />;
}

function LoggedInScreen({ user }: { user: User }): React.JSX.Element {
  const [signingOut, setSigningOut] = useState(false);
  const [screen, setScreen] = useState<'home' | 'article' | 'levels' | 'notebook'>('home');
  const [showArticle, setShowArticle] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    
    console.log('🚪 Starting sign out...');
    setSigningOut(true);
    
    try {
      await signOut(auth);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    } finally {
      setSigningOut(false);
    }
  };

  const handleMenuPress = (screenName: 'article' | 'levels' | 'notebook') => {
    console.log('📱 Navigating to:', screenName);
    if (screenName === 'article') {
      setShowArticle(true);
      setScreen('article');
    } else {
      setScreen(screenName);
    }
  };

  const handleBackFromArticle = () => {
    console.log('🔙 Back from article');
    setShowArticle(false);
    // Wait a frame before changing screen
    requestAnimationFrame(() => {
      setScreen('home');
    });
  };

  // Don't render anything else when article is showing
  if (showArticle && screen === 'article') {
    return (
      <View style={styles.flex}>
        <DailyArticleMain 
          userId={user.uid}
          onNavigate={(destination) => {
            if (destination === 'back') {
              handleBackFromArticle();
            }
          }}
        />
      </View>
    );
  }

  // Home Screen
  return (
    <View style={styles.loggedInContainer}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome! 👋</Text>
        <Text style={styles.emailText}>{user.email}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          onPress={() => handleMenuPress('article')}
          style={styles.menuCard}
        >
          <Text style={styles.menuIcon}>📰</Text>
          <View style={styles.menuCardContent}>
            <Text style={styles.menuCardTitle}>Daily Article</Text>
            <Text style={styles.menuCardSubtitle}>Read today's article</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMenuPress('levels')}
          style={styles.menuCard}
        >
          <Text style={styles.menuIcon}>🎯</Text>
          <View style={styles.menuCardContent}>
            <Text style={styles.menuCardTitle}>Practice Levels</Text>
            <Text style={styles.menuCardSubtitle}>Improve your skills</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMenuPress('notebook')}
          style={styles.menuCard}
        >
          <Text style={styles.menuIcon}>📓</Text>
          <View style={styles.menuCardContent}>
            <Text style={styles.menuCardTitle}>Notebook</Text>
            <Text style={styles.menuCardSubtitle}>Track your progress</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSignOut}
        style={[styles.logoutButton, signingOut && styles.buttonDisabled]}
        disabled={signingOut}
      >
        {signingOut ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.logoutButtonText}>Log Out</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  loggedInContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSection: {
    flex: 1,
    gap: 16,
    paddingTop: 40,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  menuCardContent: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  menuCardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  submessage: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;