import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ArticleKeywordsProps = {
  keywords?: string[];
};

export default function ArticleKeywords({ keywords }: ArticleKeywordsProps) {
  if (!keywords || keywords.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {keywords.map(keyword => (
        <View key={keyword} style={styles.keyword}>
          <Text style={styles.text}>{keyword}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32
  },
  keyword: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  text: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500'
  }
});
