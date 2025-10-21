
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
          <Text style={S.icon}>🎯</Text>
          <View style={S.cardBody}>
            <Text style={S.title}>ProfileSettingScreen</Text>
            <Text style={S.sub}>Improve your skills</Text>
          </View>
        </TouchableOpacity>

      </View>
      

      <TouchableOpacity
        onPress={handleSignOut}
        style={[S.logout, signingOut && S.disabled]}
        disabled={signingOut}
      >
        {signingOut ? <ActivityIndicator color="#fff" /> : <Text style={S.logoutTxt}>Log Out</Text>}
      </TouchableOpacity>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, paddingVertical: 48, justifyContent: 'space-between', backgroundColor: '#0f172a' },
  header: { alignItems: 'center', paddingTop: 60 },
  welcome: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  email: { fontSize: 16, color: '#94a3b8' },
  menu: { flex: 1, gap: 16, paddingTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  icon: { fontSize: 32, marginRight: 16 },
  cardBody: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 14, color: '#94a3b8' },
  logout: { backgroundColor: '#dc2626', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.6 },
  logoutTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
