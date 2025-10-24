// src/screens/home/HomeScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const scenarios = [
    {
      id: 1,
      title: 'Ordering Coffee',
      desc: 'Practice ordering drinks',
      emoji: '☕',
    },
    { id: 2, title: 'Restaurant', desc: 'Order food confidently', emoji: '🍽️' },
    { id: 3, title: 'Shopping', desc: 'Shopping conversations', emoji: '🛍️' },
  ];

  const handlePractice = scenario => {
    navigation.navigate('LevelOptions', {
      scenarioTitle: scenario.title,
      scenarioEmoji: scenario.emoji,
      scenarioId: scenario.id,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>📖</Text>
        <Text style={styles.icon}>📦</Text>
        <View style={styles.profile}>
          <Text>😊</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Scenarios - Always rendered, hidden with opacity */}
        <View
          style={[
            styles.scenariosWrapper,
            { opacity: visible ? 1 : 0, height: visible ? 180 : 0 },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pointerEvents={visible ? 'auto' : 'none'}
          >
            {scenarios.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardEmoji}>
                  <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePractice(item)}
                >
                  <Text style={styles.buttonText}>PRACTICE</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Character - Always rendered, changes size */}
        <View style={visible ? styles.characterSmall : styles.character}>
          <Text style={visible ? { fontSize: 50 } : { fontSize: 70 }}>💧</Text>
        </View>

        {/* Close Button - Always rendered, hidden with opacity */}
        <TouchableOpacity
          style={[styles.close, { opacity: visible ? 1 : 0 }]}
          onPress={() => setVisible(false)}
          disabled={!visible}
        >
          <Text style={{ fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Mic Button - Always rendered, hidden with opacity */}
      <View
        style={[
          styles.micWrapper,
          { opacity: visible ? 0 : 1, height: visible ? 0 : 'auto' },
        ]}
      >
        <TouchableOpacity
          style={styles.mic}
          onPress={() => setVisible(true)}
          disabled={visible}
        >
          <Text style={{ fontSize: 28 }}>🎤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  icon: {
    fontSize: 28,
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B8A4E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scenariosWrapper: {
    marginBottom: 15,
    overflow: 'hidden',
  },
  card: {
    width: 230,
    margin: 8,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  cardEmoji: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 11,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4A4458',
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
  },
  character: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#D4C4F8',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  characterSmall: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D4C4F8',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  close: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  micWrapper: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  mic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
