import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { getArticleById, toggleBookmark } from '../services/api';
import FillNoIcon from '../../assets/icons/Fill=No.svg';
import FillYesIcon from '../../assets/icons/Fill=Yes.svg';
import ArticleHeader from '../Components/Articles/ArticleHeader';
import BlobCharacter from '../Components/Articles/BlobCharacter';
import ArticleMeta from '../Components/Articles/ArticleMeta';
import ArticleKeywords from '../Components/Articles/ArticleKeywords';
import { useAuth } from '../contexts/AuthContext';

export default function ArticleDetail({ route }) {
  const { user } = useAuth();
  const userId = user?.uid;
  const articleId = route?.params?.articleId;
  const heroIdx = route?.params?.heroIdx ?? 0;
  const [article, setArticle] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && articleId) {
      fetchArticle();
    }
  }, [articleId, userId]);

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
    if (!article || !userId) return;

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

  // Local illustrations to match DailyArticleMain choices
  const A_Little_Joy_Counts_Too = require('../../assets/Illustration/A_Little_Joy_Counts_Too.png');
  const Finding_Stillness_Between_Moments = require('../../assets/Illustration/Finding_Stillness_Between_Moments.png');
  const Making_Small = require('../../assets/Illustration/Making_Small.png');
  const Practicing_Patience = require('../../assets/Illustration/Practicing_Patience.png');
  const Small_Steps = require('../../assets/Illustration/Small_Steps.png');
  const Why_5_Minutes = require('../../assets/Illustration/Why_5_Minutes.png');
  const illustrationImages = [
    A_Little_Joy_Counts_Too,
    Finding_Stillness_Between_Moments,
    Making_Small,
    Practicing_Patience,
    Small_Steps,
    Why_5_Minutes,
  ];

  return (
    <View style={styles.container}>
  

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroIllustration}>
          <Image
            source={illustrationImages[heroIdx % illustrationImages.length]}
            style={{ width: '100%', height: '100%', borderRadius: 16 }}
            resizeMode="cover"
          />
        </View>

        <View style={styles.articleHeaderSection}>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.metaRow}>
            <ArticleMeta
              // author={article.author || 'Anonymous'}
              dateText={formatDate()}
              readTime={article.readTime || Math.max(1, Math.ceil((article.content || '').split(/\s+/).length / 180))}
              align="left"
              style={styles.meta}
            />
            <TouchableOpacity 
              onPress={handleToggleBookmark}
              style={styles.bookmarkButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isBookmarked ? (
                <FillYesIcon width={24} height={24} />
              ) : (
                <FillNoIcon width={24} height={24} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.articleContent}>{article.content}</Text>

        {Boolean(article.sourceUrl) && (
          <View style={styles.sourceContainer}>
            <View style={styles.sourceDivider} />
            <Text style={styles.sourceLabel}>Source</Text>
            <TouchableOpacity onPress={() => Linking.openURL(article.sourceUrl)}>
              <Text style={styles.sourceLink} numberOfLines={1}>
                {article.sourceUrl}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
  marginBottom: 20,
  width: '100%',
  height: 250,        
  alignSelf: 'center',
  borderRadius: 16
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
  },
  sourceContainer: {
    marginTop: 8,
    marginBottom: 24
  },
  sourceDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 12
  },
  sourceLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6
  },
  sourceLink: {
    fontSize: 14,
    color: '#2563eb',
    textDecorationLine: 'underline'
  }
});