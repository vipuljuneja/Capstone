import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function SimpleArticle({ userId, onNavigate }) {
  const handleBack = () => {
    console.log('🔙 Simple back pressed');
    if (onNavigate) {
      onNavigate('back');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>TEST ARTICLE</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>This is a simple test screen.</Text>
        <Text style={styles.text}>User ID: {userId}</Text>
        <Text style={styles.text}>If back button works, the crash is from DailyArticleMain components.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 20
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  text: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center'
  }
});