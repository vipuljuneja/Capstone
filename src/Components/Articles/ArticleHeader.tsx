import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

type ArticleHeaderProps = {
  title: string;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  showBookmark?: boolean;
};

export default function ArticleHeader({
  title,
  onToggleBookmark,
  isBookmarked,
  showBookmark = false
}: ArticleHeaderProps) {
  const renderBookmark = showBookmark ? (
    <Pressable onPress={onToggleBookmark} hitSlop={16} style={styles.iconButton}>
      <Icon
        name={isBookmarked ? 'bookmark' : 'bookmark-o'}
        size={24}
        color="#1f2937"
      />
    </Pressable>
  ) : (
    <View style={styles.bookmarkPlaceholder} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
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
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 1
  },
  spacer: {
    width: 24,
    height: 24
  },
  iconButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bookmarkPlaceholder: {
    width: 24,
    height: 24
  }
});
