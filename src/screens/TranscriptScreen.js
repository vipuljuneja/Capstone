import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';
import { getPracticeSessionById } from '../services/api';

export default function TranscriptScreen({ route }) {
  const { sessionId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!sessionId) {
        setError('Missing sessionId');
        setLoading(false);
        return;
      }
      try {
        const s = await getPracticeSessionById(sessionId);
        if (mounted) setSession(s);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load session');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  const steps = Array.isArray(session?.steps) ? session.steps : [];
  const scenarioTitle = session?.scenarioId?.title || 'Transcript';
  const level = session?.level ? ` : Level ${session.level}` : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingVertical: 12, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '700' }}>Transcript</Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text style={styles.title}>{scenarioTitle}{level}</Text>
      </View>
      {loading ? (
        <View style={styles.center}><Text>Loading…</Text></View>
      ) : error ? (
        <View style={styles.center}><Text>{error}</Text></View>
      ) : (
        <FlatList
          data={steps}
          keyExtractor={(item, idx) => `${idx}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item, index }) => {
            const isUser = index % 2 === 1; // simple alternation: speaker then you
            return (
              <View>
                <Text style={isUser ? styles.youLabel : styles.speakerLabel}>
                  {isUser ? 'You' : 'Speaker'}
                </Text>
                <Text style={styles.line}>{item.transcript || ''}</Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1A1A1A',
  },
  speakerLabel: { color: '#9CA3AF', fontWeight: '700', marginBottom: 4 },
  youLabel: { color: '#4B5563', fontWeight: '700', marginBottom: 4 },
  line: { color: '#111827', fontSize: 14, lineHeight: 20 },
  sep: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
});




