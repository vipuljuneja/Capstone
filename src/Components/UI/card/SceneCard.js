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
    width: 80,
    height: 80,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#232323',
    letterSpacing: 2,
    marginBottom: 3,
  },
  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#5e496b',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#232323',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#493855',
    borderRadius: 30,
    width: '100%',
    paddingVertical: 16,
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
