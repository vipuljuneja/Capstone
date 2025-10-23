import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [signingOut, setSigningOut] = useState(false);
  const { user, mongoUser, refreshMongoUser } = useAuth();

  // Refresh user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshMongoUser();
    }, [])
  );

  const getSeverityBadgeStyle = (level) => {
    const styles = {
      LOW: { bg: '#dcfce7', text: '#166534' },
      MILD: { bg: '#fef3c7', text: '#92400e' },
      MODERATE: { bg: '#fce7f3', text: '#9f1239' },
      HIGH: { bg: '#fee2e2', text: '#991b1b' },
    };
    return styles[level] || styles.MODERATE;
  };

  const avatarImages = {
    pipo_set: require('../../assets/pipo_set.png'),
    bro_set: require('../../assets/bro_set.png'),
    cherry_set: require('../../assets/cherry_set.png'),
  };

  const getUserAvatar = () => {
    const avatarName = mongoUser?.avatarImage || 'pipo_set';
    return avatarImages[avatarName] || avatarImages.pipo_set;
  };

  const severityLevel = mongoUser?.profile?.severityLevel;
  const userName = mongoUser?.name || user?.email?.split('@')[0] || 'User';

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
          <Image source={getUserAvatar()} style={S.avatar} />
          <Text style={S.welcome}>Welcome, {userName}! 👋</Text>
          <Text style={S.email}>{user?.email}</Text>
          {severityLevel && (
            <View
              style={[
                S.severityBadge,
                { backgroundColor: getSeverityBadgeStyle(severityLevel).bg }
              ]}
            >
              <Text
                style={[
                  S.severityText,
                  { color: getSeverityBadgeStyle(severityLevel).text }
                ]}
              >
                Anxiety Level: {severityLevel}
              </Text>
            </View>
          )}
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

          <TouchableOpacity onPress={() => navigation.navigate('Onboarding')} style={S.card}>
            <Text style={S.icon}>🧠</Text>
            <View style={S.cardBody}>
              <Text style={S.title}>Anxiety Assessment</Text>
              <Text style={S.sub}>Take or retake the assessment</Text>
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
  avatar: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  welcome: { fontSize: 28, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  email: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  severityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  severityText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
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
