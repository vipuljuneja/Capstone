import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SimpleArticle({ userId }) {

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
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
  spacer: {
    width: 24,
    height: 24
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
