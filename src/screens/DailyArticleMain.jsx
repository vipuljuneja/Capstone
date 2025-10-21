import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getTodayArticle, toggleBookmark } from '../services/api';
import BlobCharacter from '../Components/Articles/BlobCharacter';
import ArticleMeta from '../Components/Articles/ArticleMeta';
import ArticleKeywords from '../Components/Articles/ArticleKeywords';


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
          <Text style={{ fontSize: 18 }}>{isBookmarked ? '🔖' : '📑'}</Text>
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

  return (
    <View style={S.page}>
      <ScrollView style={S.scroll} contentContainerStyle={S.body} showsVerticalScrollIndicator={false}>
        <View style={S.dateWrap}>
          <Text style={S.today}>Today, Just for You</Text>
          <Text style={S.date}>{dateLabel}</Text>
        </View>

        <BlobCharacter color={article.illustrationData?.backgroundColor || '#e0f2e9'} style={S.hero} />

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

        <Text style={S.content}>{article.content}</Text>

        <ArticleKeywords keywords={article.keywords} />

        <TouchableOpacity style={S.pastBtn} onPress={() => navigation.navigate('Last7Days')}>
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
  content: { fontSize: 16, lineHeight: 26, color: '#374151', marginBottom: 24 },
  pastBtn: { backgroundColor: '#1f2937', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 32 },
  pastTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
