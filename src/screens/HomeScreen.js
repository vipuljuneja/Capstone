import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function HomeScreen({ navigation, user }) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View style={S.wrap}>
      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={S.header}>
          <Text style={S.welcome}>Welcome 👋</Text>
          <Text style={S.email}>{user?.email}</Text>
        </View>

        <View style={S.menu}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Article', { userId: user?.uid })}
            style={S.card}
          >
            <Text style={S.icon}>📰</Text>
            <View style={S.cardBody}>
              <Text style={S.title}>Daily Article</Text>
              <Text style={S.sub}>Read today’s article</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Levels')} style={S.card}>
            <Text style={S.icon}>🎯</Text>
            <View style={S.cardBody}>
              <Text style={S.title}>Practice Levels</Text>
              <Text style={S.sub}>Improve your skills</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Last7Days', { userId: user?.uid })}
            style={S.card}
          >
            <Text style={S.icon}>🗓️</Text>
            <View style={S.cardBody}>
              <Text style={S.title}>Last 7 Days</Text>
              <Text style={S.sub}>Catch up on recent articles</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Notebook')} style={S.card}>
            <Text style={S.icon}>📓</Text>
            <View style={S.cardBody}>
              <Text style={S.title}>Notebook</Text>
              <Text style={S.sub}>Track your progress</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('BookmarkedArticles')} style={S.card}>
            <Icon name="bookmark" size={32} color="#38bdf8" style={S.icon} />
            <View style={S.cardBody}>
              <Text style={S.title}>Bookmarked Articles</Text>
              <Text style={S.sub}>Find your saved reads</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ProfileSettingScreen')} style={S.card}>
            <Text style={S.icon}>⚙️</Text>
            <View style={S.cardBody}>
              <Text style={S.title}>Profile Settings</Text>
              <Text style={S.sub}>Manage your account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed logout button at bottom */}
      <View style={S.footer}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={[S.logout, signingOut && S.disabled]}
          disabled={signingOut}
        >
          {signingOut ? <ActivityIndicator color="#fff" /> : <Text style={S.logoutTxt}>Log Out</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: { alignItems: 'center', paddingTop: 60 },
  welcome: { fontSize: 32, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  email: { fontSize: 16, color: '#6b7280' },
  menu: { flex: 1, gap: 16, paddingTop: 40, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  icon: { fontSize: 32, marginRight: 16 },
  cardBody: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6b7280' },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#f5f5f0',
  },
  logout: {
    backgroundColor: '#312e81',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  disabled: { opacity: 0.6 },
  logoutTxt: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
});
