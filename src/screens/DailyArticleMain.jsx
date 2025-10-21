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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
  getTodayArticle,
  getLast7DaysArticles,
  toggleBookmark,
} from '../services/api';
import BlobCharacter from '../Components/Articles/BlobCharacter';

export default function DailyArticleMain({ route, navigation, userId }) {
  const paramUserId = route?.params?.userId || userId;
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const alive = useRef(true);

  const safeFetch = async (fn) => {
    try {
      return await fn();
    } catch (err) {
      console.error('❌ Fetch failed:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!paramUserId) return;

    alive.current = true;
    (async () => {
      setLoading(true);
      const res = await safeFetch(() => getLast7DaysArticles(paramUserId));
      if (!alive.current) return;

      const list = Array.isArray(res?.data?.articles)
        ? res.data.articles
        : [];

      if (list.length > 0) {
        setArticles(list);
        setCurrentIndex(0);
      } else {
        const todayRes = await safeFetch(() => getTodayArticle(paramUserId));
        if (!alive.current) return;
        const todayArticle = todayRes?.data?.article;
        if (todayArticle) {
          setArticles([
            {
              ...todayArticle,
              isBookmarked: todayRes?.data?.isBookmarked ?? false,
            },
          ]);
          setCurrentIndex(0);
        } else setArticles([]);
      }
      if (alive.current) setLoading(false);
    })();

    return () => {
      alive.current = false;
    };
  }, [paramUserId]);

  const currentArticle = articles[currentIndex];

  const onToggleBookmark = async () => {
    if (!currentArticle) return;
    try {
      await toggleBookmark(
        paramUserId,
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
        <TouchableOpacity onPress={onToggleBookmark} hitSlop={16}>
          <Icon
            name={currentArticle?.isBookmarked ? 'bookmark' : 'bookmark-o'}
            size={22}
            color="#111827"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentArticle]);

  // ✅ stable swipe handler
  const handleSwipe = ({ nativeEvent }) => {
    if (!nativeEvent || nativeEvent.state !== 5) return; // only act on end
    const tx = nativeEvent.translationX ?? 0;
    if (tx > 50) setCurrentIndex((i) => Math.max(i - 1, 0));
    else if (tx < -50)
      setCurrentIndex((i) => Math.min(i + 1, articles.length - 1));
  };

  const { underlined, rest, cardBgColor, dateLabel } = useMemo(() => {
    if (!currentArticle)
      return { underlined: '', rest: '', cardBgColor: '#e0f2e9', dateLabel: '' };

    const dt = currentArticle.date ? new Date(currentArticle.date) : null;
    const dateLabel = dt
      ? dt
          .toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })
          .toUpperCase()
      : '';

    const bg = currentArticle?.illustrationData?.backgroundColor || '#e0f2e9';
    const normalized =
      currentArticle.content?.replace(/\s+/g, ' ').trim() || '';
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

    return { underlined, rest, cardBgColor: bg, dateLabel };
  }, [currentArticle]);

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
      <PanGestureHandler onHandlerStateChange={handleSwipe}>
        <View style={S.page}>
          <ScrollView
            style={S.scroll}
            contentContainerStyle={S.body}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View style={S.dateWrap}>
              <Text style={S.today}>
                {currentIndex === 0 ? 'Today, Just for You' : 'Previously for You'}
              </Text>
              {dateLabel ? <Text style={S.date}>{dateLabel}</Text> : null}
            </View>

            <View style={[S.card, { backgroundColor: cardBgColor }]}>
              <View style={S.heroContainer}>
                <View
                  style={[S.glowCircle, { backgroundColor: `${cardBgColor}90` }]}
                />
                <BlobCharacter
                  color="transparent"
                  character={currentArticle.illustrationData?.character}
                  style={S.hero}
                />
              </View>

              <Text style={S.readTimeLabel}>
                Read time : {currentArticle.readTime} min
              </Text>

              <Text style={S.cardTitle}>{currentArticle.title}</Text>
              <Text style={S.cardAuthor}>Cameron Carter</Text>

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
                    articleId: currentArticle._id,
                  })
                }
              >
                <Text style={S.readButtonTxt}>READ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {articles.length > 1 && (
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
          )}
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const S = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errText: { fontSize: 16, color: '#6b7280' },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 20, paddingBottom: 120 },
  dateWrap: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  today: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 8, letterSpacing: 0.5 },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  hero: { height: 280, width: '100%', zIndex: 1 },
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
    backgroundColor: '#3730a3',
    borderRadius: 999,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 100,
  },
  readButtonTxt: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 1.2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
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
