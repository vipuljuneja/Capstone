import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Pressable, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getLast7DaysArticles, toggleBookmark as toggleBookmarkApi } from '../services/api';
import ArticleHeader from '../Components/Articles/ArticleHeader';
import { characterImageFor } from '../Components/Articles/characterImages';
import { useAuth } from '../contexts/AuthContext';

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
    return article.illustrationData?.backgroundColor || '#f5f3ff';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.cardIllustration, { backgroundColor: getBackgroundColor() }]}>
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
            onBookmark(article);
          }}
            style={styles.bookmarkButton}
          >
            <Icon
              name={article.isBookmarked ? 'bookmark' : 'bookmark-o'}
              size={20}
              color="#1f2937"
            />
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

export default function Last7DaysScreen({ navigation }) {
  const { user } = useAuth();
  const userId = user?.uid;
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLast7Days = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await getLast7DaysArticles(userId);
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

  const handleSelectArticle = (article) => {
    if (!article?._id) return;
    navigation.navigate('ArticleDetail', { articleId: article._id });
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
      <ArticleHeader
        title="LAST 7 DAYS"
      />

      {/* Articles List */}
      <FlatList
        data={articles}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => handleSelectArticle(item)}
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
