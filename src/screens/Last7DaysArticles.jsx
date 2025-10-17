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
import { getLast7DaysArticles, toggleBookmark as toggleBookmarkApi } from '../services/api';

const ArticleCard = ({ article, onPress, onBookmark }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBackgroundColor = () => {
    return article.illustrationData?.backgroundColor || '#e0f2e9';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.cardIllustration, { backgroundColor: getBackgroundColor() }]}>
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
            onBookmark(article);
          }}>
            <Text style={styles.bookmarkIcon}>
              {article.isBookmarked ? '🔖' : '📑'}
            </Text>
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

export default function Last7DaysArticles({ userId, onNavigate, onSelectArticle }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLast7Days = async () => {
      try {
        setLoading(true);
        const response = await getLast7DaysArticles(userId || undefined);
        if (!isMounted) return;

        const articlesData = response?.data?.articles;
        setArticles(Array.isArray(articlesData) ? articlesData : []);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching articles:', error);
          setArticles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLast7Days();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleToggleBookmark = async (article) => {
    if (!userId) return;

    try {
      await toggleBookmarkApi(userId, article._id, article.isBookmarked);
      setArticles(prev => 
        prev.map(a => 
          a._id === article._id 
            ? { ...a, isBookmarked: !a.isBookmarked }
            : a
        )
      );
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => onNavigate && onNavigate('back')}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>LAST 7 DAYS</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Articles List */}
      <FlatList
        data={articles}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => onSelectArticle && onSelectArticle(item)}
            onBookmark={handleToggleBookmark}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No articles available</Text>
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
    height: 120,
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
  bookmarkIcon: {
    fontSize: 20
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 24
  },
  cardMeta: {
    fontSize: 12,
    color: '#6b7280'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280'
  }
});
