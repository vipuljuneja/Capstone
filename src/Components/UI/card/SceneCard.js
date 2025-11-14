import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';

export default function SceneCard({ iconSource, sceneNumber, title, onPress }) {
  return (
    <View style={styles.card}>
      <Image source={iconSource} style={styles.characterImage} />
      <Text style={styles.sectionHeader}>SCENE {sceneNumber}</Text>
      <View style={styles.divider} />
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>PRACTICE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 10,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3.92 },
    shadowOpacity: 0.25,
    shadowRadius: 3.92,
    elevation: 6,
  },
  characterImage: {
    width: 70,
    height: 70,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#232323',
    letterSpacing: 1,
    marginBottom: 2,
  },
  divider: {
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#5e496b',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#232323',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#493855',
    borderRadius: 30,
    width: '100%',
    padding: 16,
    alignItems: 'center',
    // marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.2,
  },
});
