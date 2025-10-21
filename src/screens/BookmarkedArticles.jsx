import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getUserBookmarkedArticles, removeBookmark } from '../services/api';
import { characterImageFor } from '../Components/Articles/characterImages';

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
      <View
        style={[styles.cardIllustration, {
          backgroundColor: article.illustrationData?.backgroundColor || '#f5f3ff'
        }]}
      >
        <Image
          source={characterImageFor(article.illustrationData?.character)}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardReadTime}>Read time: {article.readTime} min</Text>
          <Pressable
            onPress={(e) => {
            e.stopPropagation();
            onRemoveBookmark(article);
          }}
            style={styles.bookmarkButton}
          >
            <Icon name="bookmark" size={20} color="#1f2937" />
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

export default function BookmarkedArticles({ userId, onSelectArticle }) {
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
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>BOOKMARKED</Text>
        <View style={styles.headerSpacer} />
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
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 1
  },
  headerSpacer: {
    width: 24,
    height: 24
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
  cardImage: {
    width: '70%',
    height: '70%'
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
  bookmarkButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
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
