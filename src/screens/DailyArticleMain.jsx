import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getTodayArticle, toggleBookmark } from '../services/api';
import BlobCharacter from '../Components/Articles/BlobCharacter';
import ArticleMeta from '../Components/Articles/ArticleMeta';


export default function DailyArticleMain({ route, navigation, userId }) {
  const paramUserId = route?.params?.userId || userId;
  const [article, setArticle] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);



  useEffect(() => {
    alive.current = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getTodayArticle(paramUserId);
        if (!alive.current) return;
        setArticle(res.data.article);
        setIsBookmarked(res.data.isBookmarked);
      } catch (e) {
        if (alive.current) console.error('Error fetching article:', e);
      } finally {
        if (alive.current) setLoading(false);
      }
    })();
    return () => { alive.current = false; };
  }, [paramUserId]);

  const onToggleBookmark = async () => {
    if (!article) return;
    try {
      await toggleBookmark(paramUserId, article._id, isBookmarked);
      if (!alive.current) return;
      setIsBookmarked(v => !v);
    } catch (e) {
      console.error('Error toggling bookmark:', e);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onToggleBookmark} hitSlop={16}>
          <Icon
            name={isBookmarked ? 'bookmark' : 'bookmark-o'}
            size={22}
            color="#ffffff"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isBookmarked, article]);

  if (loading) {
    return (
      <View style={S.loading}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={S.loading}>
        <Text style={S.errText}>Failed to load today's article</Text>
      </View>
    );
  }

  const dt = new Date(article.date);
  const dateLabel = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
  const previewText = (() => {
    const normalized = article.content?.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    return normalized.length > 180 ? `${normalized.slice(0, 177).trim()}...` : normalized;
  })();

  return (
    <View style={S.page}>
      <ScrollView style={S.scroll} contentContainerStyle={S.body} showsVerticalScrollIndicator={false}>
        <View style={S.dateWrap}>
          <Text style={S.today}>Today, Just for You</Text>
          <Text style={S.date}>{dateLabel}</Text>
        </View>

        <BlobCharacter
          color={article.illustrationData?.backgroundColor || '#e0f2e9'}
          character={article.illustrationData?.character}
          style={S.hero}
        />

        <View style={S.head}>
          <Text style={S.title}>{article.title}</Text>
          <ArticleMeta
            author="Cameron Carter"
            dateText={dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            readTime={article.readTime}
            align="center"
            style={S.meta}
          />
        </View>

        <View style={S.card}>
          <View style={S.cardMetaRow}>
            <Text style={S.cardMetaLabel}>Read time</Text>
            <Text style={S.cardMetaValue}>{article.readTime} min</Text>
          </View>

          <Text style={S.cardTitle}>{article.title}</Text>
          <Text style={S.cardAuthor}>Cameron Carter</Text>
          <Text style={S.cardSummary}>{previewText}</Text>

          <TouchableOpacity
            style={S.readButton}
            onPress={() => navigation.navigate('ArticleDetail', { articleId: article._id })}
          >
            <Text style={S.readButtonTxt}>READ</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={S.pastBtn}
          onPress={() => navigation.navigate('Last7Days', { userId: paramUserId })}
        >
          <Text style={S.pastTxt}>View Last 7 Days</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errText: { fontSize: 16, color: '#6b7280' },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 20, paddingBottom: 32 },
  dateWrap: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  today: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 8, letterSpacing: 0.5 },
  hero: { marginBottom: 20 },
  head: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: 12 },
  meta: { marginBottom: 0 },
  card: { backgroundColor: '#f9fafb', borderRadius: 20, padding: 24, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardMetaLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  cardMetaValue: { fontSize: 13, color: '#1f2937', fontWeight: '600' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  cardAuthor: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  cardSummary: { fontSize: 15, lineHeight: 24, color: '#374151', marginBottom: 20 },
  readButton: { backgroundColor: '#312e81', borderRadius: 999, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 36 },
  readButtonTxt: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  pastBtn: { backgroundColor: '#1f2937', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 32 },
  pastTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
