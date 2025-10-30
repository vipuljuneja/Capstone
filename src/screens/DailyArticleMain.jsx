import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  getTodayArticle,
  getLast7DaysArticles,
  toggleBookmark,
} from '../services/api';
import BlobCharacter from '../Components/Articles/BlobCharacter';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Extract ArticleCard as a separate component
const ArticleCard = ({ article, index, currentIndex, navigation, cardBgColor, underlined, rest, dateLabel }) => {
  return (
    <View style={S.cardWrapper}>
      <View style={S.dateWrap}>
        <Text style={S.today}>
          {index === 0 ? 'Today, Just for You' : 'Previously for You'}
        </Text>
        {dateLabel ? <Text style={S.date}>{dateLabel}</Text> : null}
      </View>

      <View style={[S.card, { backgroundColor: cardBgColor }]}>
        <View style={S.heroContainer}>
          {/* <View
            style={[S.glowCircle, { backgroundColor: `${cardBgColor}90` }]}
          /> */}
          <BlobCharacter
            color="transparent"
            character={article.illustrationData?.character}
            style={S.hero}
            imageStyle={{ width: '100%', height: '75%' ,borderRadius: 16}}
          />
        </View>

        <Text style={S.readTimeLabel}>
          Read time : {(article.readTime || Math.max(1, Math.ceil((article.content || '').split(/\s+/).length / 180)))} min
        </Text>

        <Text style={S.cardTitle}>{article.title}</Text>
        <Text style={S.cardAuthor}>{article.author || 'Anonymous'}</Text>

        <View style={S.contentPreview}>
          <Text style={S.cardSummary}>
            <Text style={S.underlinedText}>{underlined}</Text>
            {rest && ' '}
            {rest}
          </Text>
        </View>

        <TouchableOpacity
          style={S.readButton}
          activeOpacity={0.8}
          onPress={() =>
            navigation.push('ArticleDetail', {
              articleId: article._id,
            })
          }
        >
          <Text style={S.readButtonTxt}>READ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function DailyArticleMain({ route, navigation }) {
  const { user } = useAuth();
  const userId = user?.uid;
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const alive = useRef(true);

  const translateX = useSharedValue(0);

  const safeFetch = async (fn) => {
    try {
      return await fn();
    } catch (err) {
      console.error('❌ Fetch failed:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) return;
    alive.current = true;

    (async () => {
      setLoading(true);
      // 📰 getLast7DaysArticles auto-generates today's article if missing (backend ensures this)
      const res = await safeFetch(() => getLast7DaysArticles(userId));
      if (!alive.current) return;

      const list = Array.isArray(res?.data?.articles)
        ? res.data.articles
        : [];

      if (list.length > 0) {
        setArticles(list);
        setCurrentIndex(0);
      } else {
        // Fallback: if no articles in last 7 days, try to get today's article
        const todayRes = await safeFetch(() => getTodayArticle(userId));
        if (!alive.current) return;
        const todayArticle = todayRes?.data?.article;
        if (todayArticle) {
          setArticles([
            {
              ...todayArticle,
              isBookmarked: todayRes?.data?.isBookmarked ?? false,
            },
          ]);
        } else setArticles([]);
      }
      if (alive.current) setLoading(false);
    })();

    return () => {
      alive.current = false;
    };
  }, [userId]);

  const currentArticle = articles[currentIndex];

  const onToggleBookmark = async () => {
    if (!currentArticle || !userId) return;
    try {
      await toggleBookmark(
        userId,
        currentArticle._id,
        currentArticle.isBookmarked,
      );
      if (!alive.current) return;
      setArticles((prev) =>
        prev.map((a, i) =>
          i === currentIndex ? { ...a, isBookmarked: !a.isBookmarked } : a,
        ),
      );
    } catch (e) {
      console.error('❌ Bookmark toggle failed:', e);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('BookmarkedArticles')}
          hitSlop={16}
        >
          <Icon name="bookmark" size={22} color="#111827" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // --- IMPROVED SWIPE LOGIC ---
  const handleGesture = ({ nativeEvent }) => {
    const tx = nativeEvent.translationX;
    translateX.value = tx;
  };

  const handleGestureEnd = ({ nativeEvent }) => {
    const tx = nativeEvent.translationX;
    const threshold = 80;
    
    if (tx > threshold && currentIndex > 0) {
      // Swipe right - go to previous
      translateX.value = withTiming(width, { duration: 200 }, () => {
        runOnJS(switchArticle)(-1);
      });
    } else if (tx < -threshold && currentIndex < articles.length - 1) {
      // Swipe left - go to next
      translateX.value = withTiming(-width, { duration: 200 }, () => {
        runOnJS(switchArticle)(1);
      });
    } else {
      // Snap back
      translateX.value = withTiming(0, { duration: 150 });
    }
  };

  const switchArticle = (direction) => {
    setCurrentIndex((i) => i + direction);
    translateX.value = 0;
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value - currentIndex * width }],
  }));

  // Process article data for all articles
  const processedArticles = useMemo(() => {
    return articles.map((article) => {
      const dt = article.date ? new Date(article.date) : null;
      const dateLabel = dt
        ? dt
            .toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })
            .toUpperCase()
        : '';

      const bg = article?.illustrationData?.backgroundColor || '#e0f2e9';
      const normalized = article.content?.replace(/\s+/g, ' ').trim() || '';
      const preview =
        normalized.length > 280
          ? `${normalized.slice(0, 277).trim()}...`
          : normalized;
      const firstSentence = preview.match(/^[^.!?]+[.!?]/)?.[0];
      const splitIndex =
        !firstSentence || firstSentence.length > 100
          ? preview.indexOf(' ', 80)
          : firstSentence.length;
      const hasSplit = splitIndex > 0;
      const underlined = hasSplit
        ? preview.slice(0, splitIndex).trim()
        : preview;
      const rest = hasSplit ? preview.slice(splitIndex).trim() : '';

      return { article, cardBgColor: bg, dateLabel, underlined, rest };
    });
  }, [articles]);

  if (loading)
    return (
      <View style={S.loading}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );

  if (!articles.length || !currentArticle)
    return (
      <View style={S.loading}>
        <Text style={S.errText}>No articles available</Text>
      </View>
    );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={S.page}>
        <PanGestureHandler onGestureEvent={handleGesture} onEnded={handleGestureEnd}>
          <Animated.View style={[S.carouselContainer, containerStyle]}>
            {processedArticles.map((data, index) => (
              <View key={data.article._id} style={S.articlePage}>
                <ScrollView
                  style={S.scroll}
                  contentContainerStyle={S.body}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  <ArticleCard
                    article={data.article}
                    index={index}
                    currentIndex={currentIndex}
                    navigation={navigation}
                    cardBgColor={data.cardBgColor}
                    underlined={data.underlined}
                    rest={data.rest}
                    dateLabel={data.dateLabel}
                  />
                </ScrollView>
              </View>
            ))}
          </Animated.View>
        </PanGestureHandler>

        {/* {articles.length > 1 && (
          <View style={S.footer}>
            <View style={S.indicator}>
              {articles.map((_, idx) => (
                <View
                  key={`dot-${idx}`}
                  style={[S.dot, idx === currentIndex && S.dotActive]}
                />
              ))}
            </View>
          </View>
        )} */}
      </View>
    </GestureHandlerRootView>
  );
}

const S = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errText: { fontSize: 16, color: '#6b7280' },
  carouselContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  articlePage: {
    width: width,
  },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 20, paddingBottom: 120 },
  cardWrapper: { flex: 1 },
  dateWrap: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  today: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 8, letterSpacing: 0.5 },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 250,
    height: 150,
    borderRadius: 125,
  },
  hero: { height: 260, width: '100%', zIndex: 1 },
  readTimeLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 34,
  },
  cardAuthor: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  contentPreview: { marginBottom: 28 },
  cardSummary: { fontSize: 15, lineHeight: 24, color: '#374151' },
  underlinedText: {
    textDecorationLine: 'underline',
    textDecorationColor: '#a78bfa',
  },
  readButton: {
    backgroundColor: '#3E3153',
    borderRadius: 20,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 115,
  },
  readButtonTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  indicator: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: { backgroundColor: '#3730a3', width: 24 },
});