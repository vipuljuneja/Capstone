import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getArticleById, toggleBookmark } from '../services/api';
import ArticleHeader from '../Components/Articles/ArticleHeader';
import BlobCharacter from '../Components/Articles/BlobCharacter';
import ArticleMeta from '../Components/Articles/ArticleMeta';
import ArticleKeywords from '../Components/Articles/ArticleKeywords';

export default function ArticleDetail({ userId, articleId }) {
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
  

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BlobCharacter
          color={article.illustrationData?.backgroundColor || '#e0f2e9'}
          character={article.illustrationData?.character}
          style={styles.heroIllustration}
        />

        <View style={styles.articleHeaderSection}>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.metaRow}>
            <ArticleMeta
              author="Cameron Carter"
              dateText={formatDate()}
              readTime={article.readTime}
              align="left"
              style={styles.meta}
            />
            <TouchableOpacity 
              onPress={handleToggleBookmark}
              style={styles.bookmarkButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name={isBookmarked ? 'bookmark' : 'bookmark-o'}
                size={24}
                color="#111827"
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.articleContent}>{article.content}</Text>

        <ArticleKeywords keywords={article.keywords} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32
  },
  scrollArea: {
    flex: 1
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
  heroIllustration: {
    marginTop: 24,
    marginBottom: 20
  },
  articleHeaderSection: {
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  meta: {
    marginBottom: 0,
    flex: 1
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 12
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    marginBottom: 24
  }
});