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
import FillYesIcon from '../../assets/icons/Fill=Yes.svg';

import imgMakingSmall2 from '../../assets/Illustration/Making_Small2.png';
import imgSmallSteps2 from '../../assets/Illustration/Small_Steps2.png';
import imgPracticingPatience2 from '../../assets/Illustration/Practicing_Patience2.png';
import imgJoyCountsToo2 from '../../assets/Illustration/A_Little_Joy_Counts_Too2.png';

const blobImages = [
  imgMakingSmall2,
  imgSmallSteps2,
  imgPracticingPatience2,
  imgJoyCountsToo2,
];

const pastelColors = [
  '#EEF3E7',
  '#DEECFF',
  '#D8D2FF',
  '#E0E0E0',
  '#8690DA',
  '#FAFAFA',
];

const hexToRgb = hex => {
  if (!hex || typeof hex !== 'string') {
    return null;
  }

  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return null;
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const getRelativeLuminance = color => {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return 1; // Default to light if unknown format
  }

  const transformChannel = value => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const r = transformChannel(rgb.r);
  const g = transformChannel(rgb.g);
  const b = transformChannel(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getCardPalette = backgroundColor => {
  const luminance = getRelativeLuminance(backgroundColor);
  const isDarkBackground = luminance < 0.55;

  if (isDarkBackground) {
    return {
      titleColor: '#FFFFFF',
      metaColor: 'rgba(255,255,255,0.85)',
      readTimeBackground: 'rgba(255,255,255,0.9)',
      readTimeTextColor: '#3E3153',
    };
  }

  return {
    titleColor: '#1C1C1E',
    metaColor: '#3E3153',
    readTimeBackground: '#FFFFFF',
    readTimeTextColor: '#3E3153',
  };
};

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

  const cardBackgroundColor = article.illustrationColor || '#f5f3ff';
  const palette = getCardPalette(cardBackgroundColor);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.cardBackground,
          { backgroundColor: cardBackgroundColor },
        ]}
      >
        <View style={styles.cardContent}>
          <View
            style={[
              styles.readTimeBadge,
              { backgroundColor: palette.readTimeBackground },
            ]}
          >
            <Text
              style={[
                styles.readTimeText,
                { color: palette.readTimeTextColor },
              ]}
            >
              Read time: {article.readTime || Math.max(1, Math.ceil((article.content || '').split(/\s+/).length / 180))} min
            </Text>
          </View>

          <Text
            style={[styles.cardTitle, { color: palette.titleColor }]}
            numberOfLines={2}
          >
            {article.title}
          </Text>

          <Text style={[styles.cardMeta, { color: palette.metaColor }]}>
            {formatDate(article.date)}
          </Text>
        </View>

        <View style={styles.cardRightSection}>
          <View style={styles.cardImageContainer}>
            <Image
              source={article.blob}
              style={styles.cardImage}
              resizeMode="contain"
            />
            <Pressable
              onPress={e => {
                e.stopPropagation();
                onRemoveBookmark(article);
              }}
              style={styles.bookmarkButton}
            >
              <FillYesIcon width={24} height={24} />
            </Pressable>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },

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
    backgroundColor: '#F2F2F2',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1C1C1E' },

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
    padding: 20,
    minHeight: 160,
    alignItems: 'center',
  },

  cardContent: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingRight: 12,
  },

  cardRightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },

  readTimeBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  readTimeText: { fontSize: 12, color: '#3E3153', fontWeight: '600' },

  bookmarkButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    lineHeight: 22,
    paddingRight: 8,
  },
  cardMeta: {
    fontSize: 13,
    color: '#3E3153',
    marginTop: 4,
  },

  cardImageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
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
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#707070',
    textAlign: 'center',
  },
});
