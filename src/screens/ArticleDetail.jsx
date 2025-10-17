import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { getArticleById, toggleBookmark } from '../services/api';

const BlobCharacter = ({ color }) => (
  <View style={[styles.blobContainer, { backgroundColor: color }]}>
    <View style={styles.blob}>
      <View style={styles.blobFace}>
        <View style={styles.blobEyes}>
          <View style={styles.blobEye} />
          <View style={styles.blobEye} />
        </View>
        <View style={styles.blobMouth} />
      </View>
      <View style={styles.blobHand} />
      <View style={styles.blobLegs}>
        <View style={styles.blobLeg} />
        <View style={styles.blobLeg} />
      </View>
    </View>
  </View>
);

export default function ArticleDetail({ userId, articleId, onNavigate }) {
  const [article, setArticle] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await getArticleById(articleId, userId);
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
        <Text style={styles.errorText}>Article not found</Text>
      </View>
    );
  }

  const formatDate = () => {
    const date = new Date(article.date);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => onNavigate && onNavigate('back')}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>READ</Text>
        <Pressable onPress={handleToggleBookmark}>
          <Text style={styles.bookmarkIcon}>
            {isBookmarked ? '🔖' : '📑'}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Character Illustration */}
        <BlobCharacter 
          color={article.illustrationData?.backgroundColor || '#e0f2e9'} 
        />

        {/* Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Meta Information */}
        <Text style={styles.meta}>
          Cameron Carter | {formatDate()} | Read time: {article.readTime} min
        </Text>

        {/* Content */}
        <Text style={styles.articleContent}>{article.content}</Text>

        {/* Keywords */}
        {article.keywords && article.keywords.length > 0 && (
          <View style={styles.keywordsContainer}>
            {article.keywords.map((keyword, index) => (
              <View key={index} style={styles.keyword}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    fontSize: 24,
    color: '#1f2937'
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 1
  },
  bookmarkIcon: {
    fontSize: 24
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
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
  blobContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20
  },
  blob: {
    alignItems: 'center'
  },
  blobFace: {
    width: 80,
    height: 80,
    backgroundColor: '#a78bfa',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  blobEyes: {
    flexDirection: 'row',
    gap: 16
  },
  blobEye: {
    width: 8,
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4
  },
  blobMouth: {
    width: 20,
    height: 10,
    backgroundColor: '#c084fc',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 8
  },
  blobHand: {
    width: 30,
    height: 40,
    backgroundColor: '#a78bfa',
    borderRadius: 15,
    position: 'absolute',
    right: -20,
    top: 30,
    transform: [{ rotate: '20deg' }]
  },
  blobLegs: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  blobLeg: {
    width: 24,
    height: 32,
    backgroundColor: '#a78bfa',
    borderRadius: 12
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 24
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    marginBottom: 24
  },
  keywordsContainer: {
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
  keywordText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500'
  }
});