import { enableScreens } from 'react-native-screens';
enableScreens();
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import MainStack from './src/navigation/MainStack';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import SplashScreen from './src/screens/SplashScreen';

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
  const { user, loading } = useAuth();
  // const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

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
      <NavigationContainer theme={NAV_THEME}>
        <MainStack />
      </NavigationContainer>
      <Toast config={toastConfig} topOffset={60} />
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

const toastConfig = {
  videoReady: ({ text1, text2, onPress, props }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.toastContainer}
    >
      <View style={styles.toastAccent} />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    </TouchableOpacity>
  ),
  // Default handlers for other toast types used in the app
  error: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, { backgroundColor: '#DC2626' }]}>
      <View style={[styles.toastAccent, { backgroundColor: '#991B1B' }]} />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, { backgroundColor: '#2563EB' }]}>
      <View style={[styles.toastAccent, { backgroundColor: '#1E40AF' }]} />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    </View>
  ),
  success: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, { backgroundColor: '#059669' }]}>
      <View style={[styles.toastAccent, { backgroundColor: '#047857' }]} />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f0',
  },
  loadingText: { color: '#475569', marginTop: 16, fontSize: 16 },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  toastAccent: {
    width: 6,
    height: '100%',
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#A855F7',
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 6,
  },
  toastMessage: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
});
