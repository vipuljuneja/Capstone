import { enableScreens } from 'react-native-screens';
enableScreens();
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import MainStack from './src/navigation/MainStack';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';

const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f5f5f0',
    card: '#ffffff',
    primary: '#111827',
    text: '#111827',
    border: '#e5e7eb',
  },
};

function RootApp() {
  const { user, loading, mongoUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {user ? (
        <NavigationContainer theme={NAV_THEME}>
          <MainStack user={user} mongoUser={mongoUser} />
        </NavigationContainer>
      ) : mode === 'signup' ? (
        <SignupScreen onSwitchToLogin={() => setMode('login')} />
      ) : (
        <LoginScreen onSwitchToSignup={() => setMode('signup')} />
      )}
      <Toast />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RootApp />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f0',
  },
  loadingText: { color: '#475569', marginTop: 16, fontSize: 16 },
});
