import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getUserBookmarkedArticles, removeBookmark } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// --- Blob assets ---
import articlePipo from '../../assets/pipo/articlePipo.png';
const blobGreen = require('../../assets/pipo/pipo-hi.png');
const blobPurple = require('../../assets/pipo/pipo-coffee.png');
const blobYellow = require('../../assets/pipo/pipo-job.png');

const blobImages = [articlePipo, blobGreen, blobPurple, blobYellow];
const pastelColors = [
  '#E9F5E9',
  '#FFF4E6',
  '#E6F0FF',
  '#FFE6EB',
  '#F5E6FF',
  '#FFF9E6',
  '#E6FAF8',
];

// --- Card component ---
const BookmarkedCard = ({ article, onPress, onRemoveBookmark }) => {
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.cardBackground,
          { backgroundColor: article.illustrationColor || '#f5f3ff' },
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.readTimeBadge}>
              <Text style={styles.readTimeText}>
                Read time: {article.readTime} min
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {article.title}
          </Text>

          <Text style={styles.cardMeta}>
            {article.author || 'Unknown Author'} | {formatDate(article.date)}
          </Text>
        </View>

        <View style={styles.cardRightSection}>
          <Pressable
            onPress={e => {
              e.stopPropagation();
              onRemoveBookmark(article);
            }}
            style={styles.bookmarkButton}
          >
            <Icon name="bookmark" size={20} color="#1f2937" />
          </Pressable>

          <View style={styles.cardImageContainer}>
            <Image
              source={article.blob}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function BookmarkedArticles({ navigation, onSelectArticle }) {
  const { user } = useAuth();
  const userId = user?.uid;
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userId) return;
    fetchBookmarkedArticles(userId);
  }, [userId]);

  const fetchBookmarkedArticles = async id => {
    try {
      setLoading(true);
      const response = await getUserBookmarkedArticles(id);
      const data = response?.data?.articles || [];

      // assign random colors and blobs
      const enriched = data.map((a, i) => ({
        ...a,
        illustrationColor: pastelColors[i % pastelColors.length],
        blob: blobImages[i % blobImages.length],
      }));

      setArticles(enriched);
    } catch (error) {
      console.error('Error fetching bookmarked articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async article => {
    try {
      if (!userId) return;
      await removeBookmark(userId, article._id);
      setArticles(prev => prev.filter(a => a._id !== article._id));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleSelectArticle = article => {
    if (onSelectArticle) {
      onSelectArticle(article);
      return;
    }

    if (navigation?.push && article?._id) {
      navigation.push('ArticleDetail', { articleId: article._id });
    }
  };

  const filteredArticles = articles.filter(a =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      {/* <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="chevron-left" size={18} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>READ</Text>
        <View style={styles.headerSpacer} />
      </View> */}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={18}
          color="#9ca3af"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Bookmarked Articles List */}
      <FlatList
        data={filteredArticles}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <BookmarkedCard
            article={item}
            onPress={() => handleSelectArticle(item)}
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
  container: { flex: 1, backgroundColor: '#ffffff' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 1,
  },
  headerSpacer: { width: 24, height: 24 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1f2937' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  listContent: { padding: 16, gap: 16 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },

  cardBackground: {
    flexDirection: 'row',
    padding: 16,
    minHeight: 140,
    alignItems: 'center',
  },

  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 8,
  },

  cardRightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },

  readTimeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  readTimeText: { fontSize: 11, color: '#6b7280', fontWeight: '500' },

  bookmarkButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 22,
    paddingRight: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  cardImageContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
