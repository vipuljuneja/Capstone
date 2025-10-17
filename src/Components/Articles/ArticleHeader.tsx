import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type ArticleHeaderProps = {
  title: string;
  onBack?: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  showBookmark?: boolean;
};

export default function ArticleHeader({
  title,
  onBack,
  onToggleBookmark,
  isBookmarked,
  showBookmark = false
}: ArticleHeaderProps) {
  const renderBookmark = showBookmark ? (
    <Pressable onPress={onToggleBookmark} hitSlop={16}>
      <Text style={styles.bookmarkIcon}>{isBookmarked ? '🔖' : '📑'}</Text>
    </Pressable>
  ) : (
    <View style={styles.bookmarkPlaceholder} />
  );

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} hitSlop={16}>
        <Text style={styles.backButton}>←</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      {renderBookmark}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff'
  },
  backButton: {
    fontSize: 24,
    color: '#1f2937'
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 1
  },
  bookmarkIcon: {
    fontSize: 24
  },
  bookmarkPlaceholder: {
    width: 24,
    height: 24
  }
});
