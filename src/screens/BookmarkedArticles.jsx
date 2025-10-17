import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { getUserBookmarkedArticles, removeBookmark } from '../services/api';

const BookmarkedCard = ({ article, onPress, onRemoveBookmark }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.cardIllustration, { 
        backgroundColor: article.illustrationData?.backgroundColor || '#e0f2e9' 
      }]}>
        <View style={styles.miniBlob}>
          <View style={styles.miniBlobEyes}>
            <View style={styles.miniBlobEye} />
            <View style={styles.miniBlobEye} />
          </View>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardReadTime}>Read time: {article.readTime} min</Text>
          <Pressable onPress={(e) => {
            e.stopPropagation();
            onRemoveBookmark(article);
          }}>
            <Text style={styles.removeIcon}>🔖</Text>
          </Pressable>
        </View>
        
        <Text style={styles.cardTitle} numberOfLines={2}>
          {article.title}
        </Text>
        
        <Text style={styles.cardMeta}>
          {formatDate(article.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function BookmarkedArticles({ userId, onNavigate, onSelectArticle }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarkedArticles();
  }, []);

  const fetchBookmarkedArticles = async () => {
    try {
      setLoading(true);
      const response = await getUserBookmarkedArticles(userId);
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching bookmarked articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (article: any) => {
    try {
      await removeBookmark(userId, article._id);
      setArticles(prev => prev.filter(a => a._id !== article._id));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => onNavigate && onNavigate('back')}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>BOOKMARKED</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search</Text>
      </View>

      {/* Bookmarked Articles List */}
      <FlatList
        data={articles}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BookmarkedCard
            article={item}
            onPress={() => onSelectArticle && onSelectArticle(item)}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookmarked articles yet</Text>
            <Text style={styles.emptySubtext}>
              Bookmark articles to save them for later
            </Text>
          </View>
        }
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#9ca3af'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  listContent: {
    padding: 16,
    gap: 16
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden'
  },
  cardIllustration: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  miniBlob: {
    width: 50,
    height: 50,
    backgroundColor: '#a78bfa',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  miniBlobEyes: {
    flexDirection: 'row',
    gap: 10
  },
  miniBlobEye: {
    width: 6,
    height: 6,
    backgroundColor: '#1f2937',
    borderRadius: 3
  },
  cardContent: {
    padding: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardReadTime: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500'
  },
  removeIcon: {
    fontSize: 20
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 22
  },
  cardMeta: {
    fontSize: 12,
    color: '#6b7280'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  }
});