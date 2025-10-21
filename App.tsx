import { enableScreens } from 'react-native-screens';

enableScreens();
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import MainStack from './src/navigation/MainStack';

import { auth } from './src/firebase';
import { AuthProvider } from './src/contexts/AuthContext';
import Toast from 'react-native-toast-message';




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

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [mode, setMode] = useState('login'); // login/signup switch

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsub;
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
            <NavigationContainer theme={NAV_THEME}>
              <MainStack user={user} />
            </NavigationContainer>
          ) : mode === 'signup' ? (
            <SignupScreen onSwitchToLogin={() => setMode('login')} />
          ) : (
            <LoginScreen onSwitchToSignup={() => setMode('signup')} />
          )}
          <Toast />
        </SafeAreaView>
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
