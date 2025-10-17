import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getTodayArticle, toggleBookmark } from '../services/api';
import ArticleHeader from '../Components/Articles/ArticleHeader';
import BlobCharacter from '../Components/Articles/BlobCharacter';
import ArticleMeta from '../Components/Articles/ArticleMeta';
import ArticleKeywords from '../Components/Articles/ArticleKeywords';

export default function DailyArticleMain({ userId, onNavigate }) {
  const [article, setArticle] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayArticle();
  }, []);

  const fetchTodayArticle = async () => {
    try {
      setLoading(true);
      const response = await getTodayArticle(userId);
      setArticle(response.data.article);
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!article) return;

    try {
      await toggleBookmark(userId, article._id, isBookmarked);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load today's article</Text>
      </View>
    );
  }

  const formatDate = () => {
    const date = new Date(article.date);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <ArticleHeader
        title="READ"
        onBack={() => onNavigate && onNavigate('back')}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={isBookmarked}
        showBookmark
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateSection}>
          <Text style={styles.todayLabel}>Today, Just for You</Text>
          <Text style={styles.dateText}>{formatDate().toUpperCase()}</Text>
        </View>

        <BlobCharacter
          color={article.illustrationData?.backgroundColor || '#e0f2e9'}
          style={styles.heroIllustration}
        />

        <View style={styles.articleHeaderSection}>
          <Text style={styles.title}>{article.title}</Text>
          <ArticleMeta
            author="Cameron Carter"
            dateText={new Date(article.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
            readTime={article.readTime}
            align="center"
            style={styles.meta}
          />
        </View>

        <Text style={styles.articleContent}>{article.content}</Text>

        <ArticleKeywords keywords={article.keywords} />

        <TouchableOpacity
          style={styles.viewPastButton}
          onPress={() => onNavigate && onNavigate('last7days')}
        >
          <Text style={styles.viewPastButtonText}>View Last 7 Days</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280'
  },
  scrollArea: {
    flex: 1
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32
  },
  dateSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24
  },
  todayLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937'
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    letterSpacing: 0.5
  },
  heroIllustration: {
    marginBottom: 20
  },
  articleHeaderSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12
  },
  meta: {
    marginBottom: 0
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    marginBottom: 24
  },
  viewPastButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32
  },
  viewPastButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  }
});
