import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

type ArticleMetaProps = {
  author?: string;
  dateText: string;
  readTime?: number | string;
  align?: 'left' | 'center';
  style?: TextStyle;
};

export default function ArticleMeta({
  author,
  dateText,
  readTime,
  align = 'left',
  style
}: ArticleMetaProps) {
  const metaParts = [
    author,
    dateText,
    readTime !== undefined ? `Read time: ${readTime} min` : undefined
  ].filter(Boolean);

  return (
    <Text style={[styles.text, { textAlign: align }, style]}>
      {metaParts.join(' | ')}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 24
  }
});
