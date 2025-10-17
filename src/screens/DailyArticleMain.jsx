import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  InteractionManager
} from 'react-native';

export default function DailyArticleMain({ userId, onNavigate }) {
  void userId;

  const scrollViewRef = useRef(null);
  const isNavigatingRef = useRef(false);
  const isMountedRef = useRef(true);
  const interactionHandleRef = useRef(null);
  const rafHandleRef = useRef(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (interactionHandleRef.current && typeof interactionHandleRef.current.cancel === 'function') {
        interactionHandleRef.current.cancel();
        interactionHandleRef.current = null;
      }
      if (rafHandleRef.current != null) {
        cancelAnimationFrame(rafHandleRef.current);
        rafHandleRef.current = null;
      }
      isNavigatingRef.current = false;
    };
  }, []);

  const queueNavigation = (destination) => {
    if (isNavigatingRef.current) {
      return;
    }

    isNavigatingRef.current = true;
    if (isMountedRef.current) {
      setIsNavigating(true);
    }

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }

    // Let any momentum/gesture events settle before navigating away.
    if (interactionHandleRef.current && typeof interactionHandleRef.current.cancel === 'function') {
      interactionHandleRef.current.cancel();
      interactionHandleRef.current = null;
    }

    interactionHandleRef.current = InteractionManager.runAfterInteractions(() => {
      if (!isMountedRef.current) {
        return;
      }

      if (rafHandleRef.current != null) {
        cancelAnimationFrame(rafHandleRef.current);
      }

      rafHandleRef.current = requestAnimationFrame(() => {
        if (!isMountedRef.current) {
          rafHandleRef.current = null;
          return;
        }

        if (typeof onNavigate === 'function') {
          onNavigate(destination);
        }

        isNavigatingRef.current = false;
        interactionHandleRef.current = null;
        if (isMountedRef.current) {
          setIsNavigating(false);
        }
        rafHandleRef.current = null;
      });
    });
  };

  const handleBack = () => {
    queueNavigation('back');
  };

  const handleViewLast7Days = () => {
    queueNavigation('last7days');
  };

  const placeholderArticle = {
    title: 'Stay Confident During Presentations',
    subtitle: 'Practical tips and encouragement for your next talk.',
    readTime: '4 min',
    date: 'Tuesday, April 2',
    content: `Take a deep breath and remember that your audience wants you to succeed.
Break your presentation into three simple points, and practice transitions out loud.
Smiling naturally relaxes your facial muscles and projects confidence, even if you feel nervous.
Small pauses are your friend—they give listeners time to absorb your message.`,
    keywords: ['Public Speaking', 'Confidence', 'Mindfulness']
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>READ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
        scrollEnabled={!isNavigating}
        scrollEventThrottle={400}
      >
        <Text style={styles.todayLabel}>Today, Just for You</Text>
        <Text style={styles.dateText}>{placeholderArticle.date.toUpperCase()}</Text>

        <View style={styles.placeholderHero}>
          <Text style={styles.heroEmoji}>📰</Text>
        </View>

        <Text style={styles.readTime}>Read time: {placeholderArticle.readTime}</Text>
        <Text style={styles.title}>{placeholderArticle.title}</Text>
        <Text style={styles.subtitle}>{placeholderArticle.subtitle}</Text>

        <Text style={styles.articleContent}>{placeholderArticle.content}</Text>

        <View style={styles.keywordsContainer}>
          {placeholderArticle.keywords.map((keyword) => (
            <View key={keyword} style={styles.keyword}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.viewPastButton} onPress={handleViewLast7Days}>
          <Text style={styles.viewPastButtonText}>View Last 7 Days</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerSpacer: {
    width: 24
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  contentContainer: {
    paddingBottom: 40
  },
  todayLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4b5563',
    marginTop: 24
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 4,
    letterSpacing: 1
  },
  placeholderHero: {
    height: 180,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16
  },
  heroEmoji: {
    fontSize: 64
  },
  readTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 24
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24
  },
  keyword: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f3f4f6'
  },
  keywordText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563'
  },
  viewPastButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  viewPastButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  }
});
