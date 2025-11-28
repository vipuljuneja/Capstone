import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
  ScrollView,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import dayjs from "dayjs";
import { getReflectionsByUser, createReflection, getReflectionDates, updateReflection, deleteReflection } from "../services/api";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FullCalendar from "../Components/Notebook/FullCalendar";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";
import AddReflectionCard from "../Components/Notebook/AddReflectionCard";
import { useAuth } from "../contexts/AuthContext";
import { ImageBackground } from "react-native";
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);
import { useFocusEffect } from '@react-navigation/native';
import ConfirmDialog from '../Components/AlertBox/ConfirmDialog'



const { width: screenWidth } = Dimensions.get("window");
const spacing = 16;
const cardWidth = (screenWidth - spacing * 2 - spacing) / 2;
const today = dayjs().format("YYYY-MM-DD");

const MOTIVATION_TITLES = [
  "You trusted yourself a little more today",
  "You showed up — and that’s brave",
  "You faced the moment with courage",
  "You’re learning to breathe through it",
  "You chose progress over fear",
  "One more step toward your confident self",
  "You spoke with strength today",
  "You turned anxiety into action",
  "You took control — not fear",
  "You’re becoming your own supporter",
  "Growth feels scary — and you did it anyway",
  "Your voice mattered today",
  "Courage whispered, and you listened",
  "You’re turning discomfort into power",
  "A small victory, a huge step forward"
];


const PIPO_NOTE_IMAGES = [
  'articlePipo.png',
  'pipo-coffee.png',
  'pipo-hi.png',
  'pipo-job.png',
  'pipo-loading.png',
  'pipo-complete.png',
  'loginPipo.png',
];


const getPipoImage = (filename) => {
  if (!filename) return require('../../assets/pipo-for-note/pipo-hi.png');

  try {
    // Map filename to require statement
    const imageMap = {
      'articlePipo.png': require('../../assets/pipo-for-note/articlePipo.png'),
      'pipo-coffee.png': require('../../assets/pipo-for-note/pipo-coffee.png'),
      'pipo-hi.png': require('../../assets/pipo-for-note/pipo-hi.png'),
      'pipo-job.png': require('../../assets/pipo-for-note/pipo-job.png'),
      'pipo-loading.png': require('../../assets/pipo-for-note/pipo-loading.png'),
      'pipo-complete.png': require('../../assets/pipo-for-note/pipo-complete.png'),
      'loginPipo.png': require('../../assets/pipo-for-note/loginPipo.png'),
    };

    return imageMap[filename] || require('../../assets/pipo-for-note/pipo-hi.png');
  } catch (e) {
    console.error('Error loading image:', filename, e);
    return require('../../assets/pipo-for-note/pipo-hi.png');
  }
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}



const SR = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 3 },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F1F1F",
    marginBottom: 10,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E7E7E7",
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: "#2F2F2F",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 14,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
});

function SupportModal({ visible, onClose, onGoSupport }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={M.backdrop}>
        <View style={M.card}>
          <Pressable onPress={onClose} hitSlop={12} style={M.close}>
            <MaterialIcons name="close" size={24} color="#111" />
          </Pressable>

          <Image source={require('../../assets/pipo-heart.png')} style={M.illust} resizeMode="contain" />

          <Text style={M.bodyLine}>It sounds like you might be in pain.</Text>
          <Text style={M.bodyLine}>You don’t have to face this alone.</Text>
          <Text style={[M.bodyLine, { marginBottom: 22 }]}>Help is available right now.</Text>

          <Pressable onPress={onGoSupport} style={M.primary}>
            <Text style={M.primaryText}>GO SUPPORT</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const M = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "88%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 8 },
    }),
  },
  close: { position: "absolute", top: 14, right: 14 },
  illust: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  illustFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EDE7FF",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  bodyLine: {
    fontSize: 16,
    lineHeight: 22,
    color: "#222",
    textAlign: "center",
  },
  primary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#342E4E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
});

function SelfReflectionCard({ title, description, onEdit, onDelete }) {
  return (
    <View style={SR.card}>
      <Text style={SR.title} numberOfLines={2}>
        {title ?? ""}
      </Text>
      <View style={SR.rule} />
      <Text style={SR.body}>{description ?? ""}</Text>

      <View style={SR.actions}>
        <Pressable onPress={onDelete} style={SR.actionBtn} hitSlop={8}>
          <MaterialIcons name="delete-outline" size={20} color="#222" />
        </Pressable>
        <Pressable onPress={onEdit} style={SR.actionBtn} hitSlop={8}>
          <MaterialIcons name="edit" size={20} color="#222" />
        </Pressable>
      </View>
    </View>
  );
}

function PipoCard({ title, subtitle, index, onPress, motivation, imageFilename }) {
  const isEven = index % 2 === 0;
  const tint = isEven ? "#EEF5FF" : "#FFF8E9";
  const border = isEven ? "#CFE0FF" : "#FFE8B8";

  // Get image from filename
  const imageSource = getPipoImage(imageFilename);

  return (
    <Pressable onPress={onPress} style={[styles.pipoCard, { backgroundColor: tint, borderColor: border }]}>
      <View style={styles.pipoIconWrap}>
        {/* <View style={styles.pipoBlob} /> */}
        {imageSource && <Image source={imageSource} style={styles.pipoBlob} />}
      </View>
      <Text style={styles.pipoTitle} numberOfLines={2}>
        {motivation || "You've got this"}
      </Text>
      <Text style={styles.pipoSubtitle} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
}

export default function NotebookScreen({ navigation }) {
  const { mongoUser } = useAuth();
  const insets = useSafeAreaInsets();
  const userId = mongoUser?._id;
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState("pipo");
  const [fullCalendarVisible, setFullCalendarVisible] = useState(false);
  const [writerOpen, setWriterOpen] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const goingToSupportRef = useRef(false);


  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dotDates, setDotDates] = useState({});
  const [editingSelf, setEditingSelf] = useState(null);

  const [showConfirmSelf, setShowConfirmSelf] = useState(false);
  const [deletingSelf, setDeletingSelf] = useState(false);
  const deleteTargetRef = useRef(null);
  const currentFetchDateRef = useRef(null);
  const currentFetchTabRef = useRef("pipo"); // Initialize to match initial activeTab
  const dateChangeTimeoutRef = useRef(null);
  const tabChangeTimeoutRef = useRef(null);
  const pendingDateRef = useRef(null);
  const pendingTabRef = useRef(null);
  const isTabChangingRef = useRef(false);
  const isSavingRef = useRef(false);
  const writerModalTabRef = useRef(null);
  const writerModalTimeoutRef = useRef(null);
  const innerTabTimeoutRef = useRef(null);
  const goingToSupportTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const fetchRequestIdRef = useRef(0);
  const isFetchingCardsRef = useRef(false);
  const isFetchingDotsRef = useRef(false);
  const fetchCardsAbortControllerRef = useRef(null);
  const fetchDotsAbortControllerRef = useRef(null);
  const isDateChangingRef = useRef(false);
  const lastProcessedDateRef = useRef(null);
  const lastFetchedDateRef = useRef(null);
  const lastFetchedTabRef = useRef(null);
  const hasInitialFetchedRef = useRef(false);
  const isFocusFetchingRef = useRef(false);

  const isSelf = activeTab === 'self';

  const onEditSelf = item => {
    if (!item || !item.id) return;

    if (tabChangeTimeoutRef.current) {
      clearTimeout(tabChangeTimeoutRef.current);
      tabChangeTimeoutRef.current = null;
    }
    isTabChangingRef.current = false;
    pendingTabRef.current = null;

    setEditingSelf({
      id: item.id,
      title: item.title || '',
      description: item.subtitle || '',
    });

    if (activeTab !== 'self') {
      setActiveTab('self');
      currentFetchTabRef.current = 'self';
    }

    writerModalTabRef.current = 'self';
    if (writerModalTimeoutRef.current) {
      clearTimeout(writerModalTimeoutRef.current);
    }
    writerModalTimeoutRef.current = setTimeout(() => {
      setWriterOpen(true);
      writerModalTimeoutRef.current = null;
    }, 50);
  };

  // const onDeleteSelf = async (item) => {
  //   try {
  //     await deleteReflection(item.id);
  //     await fetchCards();

  //     const key = dayjs(item?.date || selectedDate).format("YYYY-MM-DD");
  //     setDotDates((prev) => {
  //       const curr = { ...(prev || {}) };
  //       const flags = curr[key] || {};
  //       delete flags.self;
  //       if (!flags.pipo) delete curr[key];
  //       else curr[key] = flags;
  //       return curr;
  //     });
  //   } catch (e) {
  //     console.error("Delete failed:", e);
  //   }
  // };

  const onDeleteSelf = item => {
    if (!item?.id || deletingSelf) return;
    deleteTargetRef.current = item;
    setShowConfirmSelf(true);
  };
  const confirmDeleteSelf = async () => {
    const item = deleteTargetRef.current;
    if (!item?.id) return;
    setDeletingSelf(true);
    try {
      await deleteReflection(item.id);
      if (fetchCards && fetchDots) {
        await Promise.all([fetchCards(), fetchDots()]);
      }
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setDeletingSelf(false);
      setShowConfirmSelf(false);
      deleteTargetRef.current = null;
    }
  };

  const toUICard = useCallback(
    (r, i) => ({
      id: String(r?._id ?? r?.id ?? i),
      type: r?.type ?? (isSelf ? 'self' : 'pipo'),
      date: r?.date ?? selectedDate,
      title: r?.title ?? '',
      subtitle: r?.description ?? '',
      sessionId: r?.linkedSessionId || null,
      scenarioId: r?.scenarioId || null,
      level: r?.level || null,
      imageName: r?.imageName || null,
      motivation: r?.motivation || null,
      readAt: r?.readAt || null,
    }),
    [isSelf, selectedDate],
  );

  const fetchCards = useCallback(async () => {
    if (!userId || !isMountedRef.current) return;

    const fetchDate = selectedDate;
    const fetchTab = activeTab;

    if (!fetchDate || !dayjs(fetchDate).isValid()) {
      console.warn('Invalid date in fetchCards:', fetchDate);
      return;
    }

    if (fetchCardsAbortControllerRef.current) {
      try {
        fetchCardsAbortControllerRef.current.abort();
      } catch (e) {}
      fetchCardsAbortControllerRef.current = null;
    }

    const abortController = new AbortController();
    fetchCardsAbortControllerRef.current = abortController;

    const requestId = ++fetchRequestIdRef.current;
    currentFetchDateRef.current = fetchDate;
    currentFetchTabRef.current = fetchTab;
    isFetchingCardsRef.current = true;

    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

      const list = await getReflectionsByUser(
        userId,
        {
          date: fetchDate,
          type: fetchTab,
        },
        abortController.signal,
      );

      if (
        !abortController.signal.aborted &&
        requestId === fetchRequestIdRef.current &&
        currentFetchDateRef.current === fetchDate &&
        currentFetchTabRef.current === fetchTab &&
        isMountedRef.current
      ) {
        try {
          const safe = Array.isArray(list) ? list : [];
          setItems(safe.map(toUICard));
          // Track what we've fetched
          lastFetchedDateRef.current = fetchDate;
          lastFetchedTabRef.current = fetchTab;
        } catch (stateError) {
          console.error('Error updating items state:', stateError);
        }
      }
    } catch (e) {
      const isCancelled =
        e?.name === 'AbortError' ||
        e?.name === 'CanceledError' ||
        e?.code === 'ERR_CANCELED' ||
        e?.message?.includes('canceled');

      if (!isCancelled) {
        if (requestId === fetchRequestIdRef.current && isMountedRef.current) {
          console.error('Get reflections failed:', e);
          if (
            currentFetchDateRef.current === fetchDate &&
            currentFetchTabRef.current === fetchTab
          ) {
            try {
              setItems([]);
            } catch (stateError) {
              console.error('Error setting empty items:', stateError);
            }
          }
        }
      }
    } finally {
      if (requestId === fetchRequestIdRef.current && isMountedRef.current) {
        try {
          if (
            currentFetchDateRef.current === fetchDate &&
            currentFetchTabRef.current === fetchTab
          ) {
            setLoading(false);
          }
        } catch (stateError) {
          console.error('Error updating loading state:', stateError);
        }
      }
      isFetchingCardsRef.current = false;

      if (fetchCardsAbortControllerRef.current === abortController) {
        fetchCardsAbortControllerRef.current = null;
      }
    }
  }, [userId, selectedDate, activeTab, toUICard]);

  const fetchDots = useCallback(async () => {
    if (!userId || !isMountedRef.current) return;

    const fetchDate = selectedDate;

    if (!fetchDate || !dayjs(fetchDate).isValid()) {
      console.warn('Invalid date in fetchDots:', fetchDate);
      return;
    }

    if (fetchDotsAbortControllerRef.current) {
      try {
        fetchDotsAbortControllerRef.current.abort();
      } catch (e) {}
      fetchDotsAbortControllerRef.current = null;
    }

    const startDate = dayjs(fetchDate).startOf('isoWeek').format('YYYY-MM-DD');
    const endDate = dayjs(fetchDate)
      .endOf('isoWeek')
      .add(1, 'day')
      .format('YYYY-MM-DD');

    if (
      !startDate ||
      !endDate ||
      !dayjs(startDate).isValid() ||
      !dayjs(endDate).isValid()
    ) {
      console.warn('Invalid date range in fetchDots:', { startDate, endDate });
      return;
    }

    const abortController = new AbortController();
    fetchDotsAbortControllerRef.current = abortController;

    isFetchingDotsRef.current = true;

    try {
      const dates = await getReflectionDates(
        userId,
        { startDate, endDate },
        abortController.signal,
      );

      if (
        !abortController.signal.aborted &&
        currentFetchDateRef.current === fetchDate &&
        isMountedRef.current
      ) {
        try {
          const next = {};
          (Array.isArray(dates) ? dates : []).forEach(row => {
            try {
              const ds = dayjs(row?.date).format('YYYY-MM-DD');
              const t = String(row?.type || '').toLowerCase();
              if (!ds || !dayjs(ds).isValid()) return;
              if (!next[ds]) next[ds] = { self: false, pipo: false };
              if (t === 'self') next[ds].self = true;
              if (t === 'pipo') next[ds].pipo = true;
            } catch (rowError) {
              console.error('Error processing date row:', rowError);
            }
          });
          setDotDates(next);
          // Track what we've fetched for dots
          lastFetchedDateRef.current = fetchDate;
        } catch (stateError) {
          console.error('Error updating dotDates state:', stateError);
        }
      }
    } catch (e) {
      const isCancelled =
        e?.name === 'AbortError' ||
        e?.name === 'CanceledError' ||
        e?.code === 'ERR_CANCELED' ||
        e?.message?.includes('canceled');

      if (!isCancelled) {
        if (currentFetchDateRef.current === fetchDate && isMountedRef.current) {
          console.error('Get reflection dates failed:', e);
          try {
            setDotDates({});
          } catch (stateError) {
            console.error('Error setting empty dotDates:', stateError);
          }
        }
      }
    } finally {
      isFetchingDotsRef.current = false;

      if (fetchDotsAbortControllerRef.current === abortController) {
        fetchDotsAbortControllerRef.current = null;
      }
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    if (userId && selectedDate && dayjs(selectedDate).isValid()) {
      // Skip if we've already fetched for this date, or if focus effect is fetching
      if (
        (lastFetchedDateRef.current === selectedDate &&
          hasInitialFetchedRef.current) ||
        isFocusFetchingRef.current
      ) {
        return;
      }

      const timeoutId = setTimeout(() => {
        if (
          isMountedRef.current &&
          !isDateChangingRef.current &&
          !isFocusFetchingRef.current
        ) {
          fetchDots();
        }
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [fetchDots, userId, selectedDate]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    if (userId && selectedDate && dayjs(selectedDate).isValid()) {
      // Skip if we've already fetched for this date and tab, or if focus effect is fetching
      if (
        (lastFetchedDateRef.current === selectedDate &&
          lastFetchedTabRef.current === activeTab &&
          hasInitialFetchedRef.current) ||
        isFocusFetchingRef.current
      ) {
        return;
      }

      const timeoutId = setTimeout(() => {
        if (
          isMountedRef.current &&
          !isDateChangingRef.current &&
          !isFocusFetchingRef.current
        ) {
          fetchCards();
        }
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [fetchCards, userId, selectedDate, activeTab]);

  const handleTabChange = useCallback(
    newTab => {
      if (isSavingRef.current || writerOpen) {
        console.warn('Cannot change tabs while saving or writer modal is open');
        return;
      }
      if (!newTab || newTab === activeTab || isTabChangingRef.current) return;

      pendingTabRef.current = newTab;

      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }

      isTabChangingRef.current = true;

      tabChangeTimeoutRef.current = setTimeout(() => {
        try {
          const pendingTab = pendingTabRef.current;
          if (
            pendingTab &&
            (pendingTab === 'pipo' || pendingTab === 'self') &&
            isMountedRef.current
          ) {
            setActiveTab(pendingTab);
            // Reset fetch tracking when tab changes
            lastFetchedTabRef.current = null;
            pendingTabRef.current = null;
          }
        } catch (e) {
          console.error('Error setting tab:', e);
          pendingTabRef.current = null;
        } finally {
          if (innerTabTimeoutRef.current) {
            clearTimeout(innerTabTimeoutRef.current);
          }
          innerTabTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              isTabChangingRef.current = false;
            }
            innerTabTimeoutRef.current = null;
          }, 300);
        }
      }, 150);
    },
    [activeTab],
  );

  useEffect(() => {
    isMountedRef.current = true;
    isFetchingCardsRef.current = false;
    isFetchingDotsRef.current = false;
    return () => {
      isMountedRef.current = false;
      isFetchingCardsRef.current = false;
      isFetchingDotsRef.current = false;

      if (fetchCardsAbortControllerRef.current) {
        try {
          fetchCardsAbortControllerRef.current.abort();
        } catch (e) {}
        fetchCardsAbortControllerRef.current = null;
      }
      if (fetchDotsAbortControllerRef.current) {
        try {
          fetchDotsAbortControllerRef.current.abort();
        } catch (e) {}
        fetchDotsAbortControllerRef.current = null;
      }

      if (dateChangeTimeoutRef.current) {
        clearTimeout(dateChangeTimeoutRef.current);
        dateChangeTimeoutRef.current = null;
      }
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
        tabChangeTimeoutRef.current = null;
      }
      if (writerModalTimeoutRef.current) {
        clearTimeout(writerModalTimeoutRef.current);
        writerModalTimeoutRef.current = null;
      }
      if (innerTabTimeoutRef.current) {
        clearTimeout(innerTabTimeoutRef.current);
        innerTabTimeoutRef.current = null;
      }
      if (goingToSupportTimeoutRef.current) {
        clearTimeout(goingToSupportTimeoutRef.current);
        goingToSupportTimeoutRef.current = null;
      }

      pendingDateRef.current = null;
      pendingTabRef.current = null;
      isDateChangingRef.current = false;
      lastProcessedDateRef.current = null;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isMountedRef.current || !userId) return;

      if (selectedDate && dayjs(selectedDate).isValid()) {
        // Only fetch on initial focus if we haven't fetched yet
        // Subsequent date/tab changes should be handled by useEffect hooks
        const needsFetch =
          !hasInitialFetchedRef.current &&
          lastFetchedDateRef.current !== selectedDate;

        if (!needsFetch) {
          return;
        }

        isFocusFetchingRef.current = true;
        const timeoutId = setTimeout(() => {
          if (
            isMountedRef.current &&
            userId &&
            selectedDate &&
            dayjs(selectedDate).isValid()
          ) {
            try {
              // Only fetch if still needed (date/tab hasn't changed and we haven't fetched)
              const stillNeedsFetch =
                !hasInitialFetchedRef.current &&
                lastFetchedDateRef.current !== selectedDate &&
                !isDateChangingRef.current;

              if (stillNeedsFetch) {
                Promise.all([fetchCards(), fetchDots()]).finally(() => {
                  hasInitialFetchedRef.current = true;
                  isFocusFetchingRef.current = false;
                });
              } else {
                isFocusFetchingRef.current = false;
              }
            } catch (e) {
              console.error('Error in useFocusEffect fetch:', e);
              isFocusFetchingRef.current = false;
            }
          } else {
            isFocusFetchingRef.current = false;
          }
        }, 100);

        return () => {
          clearTimeout(timeoutId);
          isFocusFetchingRef.current = false;
        };
      }
    }, [fetchCards, fetchDots, userId, selectedDate]),
  );

  const markedDates = useMemo(() => {
    try {
      const marks = {};

      if (dotDates && typeof dotDates === 'object') {
        Object.keys(dotDates).forEach(ds => {
          try {
            if (!ds || typeof ds !== 'string') return;

            const d = dayjs(ds).format('YYYY-MM-DD');
            if (!d || d === 'Invalid Date' || !dayjs(d).isValid()) return;

            const flags = dotDates[ds] || {};
            if (typeof flags !== 'object') return;

            const dots = [];

            if (flags.pipo)
              dots.push({
                key: 'pipo',
                color: 'rgba(23, 155, 255, 1)',
                selectedDotColor: 'rgba(23, 155, 255, 1)',
              });
            if (flags.self)
              dots.push({
                key: 'self',
                color: 'rgba(112, 73, 196, 1)',
                selectedDotColor: 'rgba(112, 73, 196, 1)',
              });

            if (dots.length) {
              marks[d] = { ...(marks[d] || {}), dots, marked: true };
            }
          } catch (e) {
            console.error('Error processing date in markedDates:', ds, e);
          }
        });
      }

      // Add selected date marker
      if (selectedDate && dayjs(selectedDate).isValid()) {
        try {
          const sel = dayjs(selectedDate).format('YYYY-MM-DD');
          if (sel && sel !== 'Invalid Date') {
            marks[sel] = {
              ...(marks[sel] || {}),
              selected: true,
              selectedColor: 'rgba(244, 239, 255, 1)',
              selectedTextColor: '#111',
            };
          }
        } catch (e) {
          console.error('Error setting selected date in markedDates:', e);
        }
      }

      return marks;
    } catch (e) {
      console.error('Error in markedDates useMemo:', e);
      return {};
    }
  }, [dotDates, selectedDate]);

  const handleSaveReflection = async ({ title, description }) => {
    if (!userId) return;

    if (isSavingRef.current) {
      console.warn('Save already in progress');
      return;
    }

    isSavingRef.current = true;

    try {
      if (!selectedDate || !dayjs(selectedDate).isValid()) {
        console.error('Invalid selectedDate:', selectedDate);
        isSavingRef.current = false;
        return;
      }

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        console.error('Invalid title provided');
        isSavingRef.current = false;
        return;
      }

      const selfData = Array.isArray(items)
        ? items.filter(it => it.type === 'self')
        : [];
      const alreadyHasSelf = selfData.length > 0;
      if (alreadyHasSelf) {
        console.warn('A self reflection already exists for this date.');
        isSavingRef.current = false;
        return;
      }

      const created = await createReflection({
        userId,
        title: title.trim(),
        description: description || '',
        date: selectedDate,
        type: 'self',
      });

      if (created) {
        try {
          const fetchDate = selectedDate;

          const list = await getReflectionsByUser(userId, {
            date: selectedDate,
            type: 'self',
          });

          if (
            (currentFetchDateRef.current === fetchDate ||
              !currentFetchDateRef.current) &&
            isMountedRef.current
          ) {
            const safe = Array.isArray(list) ? list : [];
            if (activeTab === 'self') {
              setItems(
                safe.map((r, i) => ({
                  id: String(r?._id ?? r?.id ?? i),
                  type: r?.type ?? 'self',
                  date: r?.date ?? selectedDate,
                  title: r?.title ?? '',
                  subtitle: r?.description ?? '',
                  sessionId: r?.linkedSessionId || null,
                  scenarioId: r?.scenarioId || null,
                  level: r?.level || null,
                  imageName: r?.imageName || null,
                  motivation: r?.motivation || null,
                  readAt: r?.readAt || null,
                })),
              );
            }
          }
        } catch (fetchError) {
          console.error('Failed to refresh cards after save:', fetchError);
        }

        try {
          const dateKey = dayjs(selectedDate).format('YYYY-MM-DD');
          if (dateKey && dayjs(dateKey).isValid() && isMountedRef.current) {
            setDotDates(prev => {
              const curr = prev || {};
              const existing = curr[dateKey] || {};
              return { ...curr, [dateKey]: { ...existing, self: true } };
            });
          }
        } catch (dateError) {
          console.error('Failed to update dot dates:', dateError);
        }
      }
    } catch (e) {
      console.error('Create reflection failed:', e);
      throw e;
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleUpdateReflection = async ({ title, description }) => {
    if (!editingSelf || !editingSelf.id) {
      console.error('Cannot update: editingSelf or id is missing');
      return;
    }

    if (isSavingRef.current) {
      console.warn('Save already in progress');
      return;
    }

    isSavingRef.current = true;

    try {
      if (!selectedDate || !dayjs(selectedDate).isValid()) {
        console.error('Invalid selectedDate:', selectedDate);
        isSavingRef.current = false;
        return;
      }

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        console.error('Invalid title provided');
        isSavingRef.current = false;
        return;
      }

      await updateReflection(editingSelf.id, {
        title: title.trim(),
        description: description || '',
        date: selectedDate,
        type: 'self',
      });

      if (isMountedRef.current) {
        setEditingSelf(null);
      }

      try {
        const fetchDate = selectedDate;
        const list = await getReflectionsByUser(userId, {
          date: selectedDate,
          type: 'self',
        });

        if (
          (currentFetchDateRef.current === fetchDate ||
            !currentFetchDateRef.current) &&
          isMountedRef.current
        ) {
          const safe = Array.isArray(list) ? list : [];
          if (activeTab === 'self') {
            setItems(
              safe.map((r, i) => ({
                id: String(r?._id ?? r?.id ?? i),
                type: r?.type ?? 'self',
                date: r?.date ?? selectedDate,
                title: r?.title ?? '',
                subtitle: r?.description ?? '',
                sessionId: r?.linkedSessionId || null,
                scenarioId: r?.scenarioId || null,
                level: r?.level || null,
                imageName: r?.imageName || null,
                motivation: r?.motivation || null,
                readAt: r?.readAt || null,
              })),
            );
          }
        }
      } catch (fetchError) {
        console.error('Failed to refresh cards after update:', fetchError);
      }

      try {
        const key = dayjs(selectedDate).format('YYYY-MM-DD');
        if (key && dayjs(key).isValid() && isMountedRef.current) {
          setDotDates(prev => {
            const curr = prev || {};
            const existing = curr[key] || {};
            return { ...curr, [key]: { ...existing, self: true } };
          });
        }
      } catch (dateError) {
        console.error('Failed to update dot dates:', dateError);
      }
    } catch (e) {
      console.error('Update failed:', e);
      throw e;
    } finally {
      isSavingRef.current = false;
    }
  };

  const onRefresh = async () => {
    if (!isMountedRef.current || !userId) return;

    if (refreshing || isFetchingCardsRef.current || isFetchingDotsRef.current) {
      return;
    }

    try {
      if (isMountedRef.current) {
        setRefreshing(true);
      }

      if (selectedDate && dayjs(selectedDate).isValid()) {
        // Reset tracking to force fresh fetch
        lastFetchedDateRef.current = null;
        lastFetchedTabRef.current = null;
        await Promise.all([fetchCards(), fetchDots()]);
      }
    } catch (e) {
      console.error('Error in onRefresh:', e);
    } finally {
      if (isMountedRef.current) {
        try {
          setRefreshing(false);
        } catch (stateError) {
          console.error('Error setting refreshing state:', stateError);
        }
      }
    }
  };

  const pipoData = useMemo(
    () => (Array.isArray(items) ? items.filter(it => it.type !== 'self') : []),
    [items],
  );
  const selfData = useMemo(
    () => (Array.isArray(items) ? items.filter(it => it.type === 'self') : []),
    [items],
  );

  const handleDateChange = useCallback(
    newDate => {
      if (!newDate || !isMountedRef.current) return;

      if (isDateChangingRef.current) {
        return;
      }

      try {
        const dateStr =
          typeof newDate === 'string'
            ? newDate
            : newDate?.dateString || newDate;
        if (!dateStr || typeof dateStr !== 'string') {
          console.warn('Invalid date format:', newDate);
          return;
        }

        if (!dayjs(dateStr).isValid()) {
          console.warn('Invalid date value:', dateStr);
          return;
        }

        const normalizedDate = dayjs(dateStr).format('YYYY-MM-DD');
        if (!normalizedDate || normalizedDate === 'Invalid Date') {
          console.warn('Could not normalize date:', dateStr);
          return;
        }

        if (
          normalizedDate === selectedDate ||
          normalizedDate === lastProcessedDateRef.current
        ) {
          return;
        }

        isDateChangingRef.current = true;
        lastProcessedDateRef.current = normalizedDate;
        // Reset fetch tracking when date changes
        lastFetchedDateRef.current = null;
        lastFetchedTabRef.current = null;

        if (fetchCardsAbortControllerRef.current) {
          try {
            fetchCardsAbortControllerRef.current.abort();
          } catch (e) {}
          fetchCardsAbortControllerRef.current = null;
        }
        if (fetchDotsAbortControllerRef.current) {
          try {
            fetchDotsAbortControllerRef.current.abort();
          } catch (e) {}
          fetchDotsAbortControllerRef.current = null;
        }

        pendingDateRef.current = normalizedDate;

        if (dateChangeTimeoutRef.current) {
          clearTimeout(dateChangeTimeoutRef.current);
          dateChangeTimeoutRef.current = null;
        }

        dateChangeTimeoutRef.current = setTimeout(() => {
          const processedDate = pendingDateRef.current || normalizedDate;
          try {
            const pendingDate = pendingDateRef.current;
            if (
              pendingDate &&
              typeof pendingDate === 'string' &&
              dayjs(pendingDate).isValid() &&
              isMountedRef.current
            ) {
              const finalDate = dayjs(pendingDate).format('YYYY-MM-DD');
              if (finalDate && finalDate !== 'Invalid Date') {
                setSelectedDate(finalDate);
              }
              pendingDateRef.current = null;
            }
          } catch (e) {
            console.error('Error setting date:', e);
            pendingDateRef.current = null;
          } finally {
            dateChangeTimeoutRef.current = null;
            setTimeout(() => {
              isDateChangingRef.current = false;
              setTimeout(() => {
                if (lastProcessedDateRef.current === processedDate) {
                  lastProcessedDateRef.current = null;
                }
              }, 100);
            }, 100);
          }
        }, 400);
      } catch (e) {
        console.error('Error in handleDateChange:', e);
        isDateChangingRef.current = false;
        lastProcessedDateRef.current = null;
      }
    },
    [selectedDate],
  );


  const pipoCardData = useMemo(() => {
    if (!Array.isArray(pipoData) || !pipoData.length || !selectedDate) return [];


    if (!dayjs(selectedDate).isValid()) {
      console.warn('Invalid selectedDate in pipoCardData:', selectedDate);
      return [];
    }

    try {
      const seedRandom = (seed) => {
        let value = Math.abs(seed || 0);
        return () => {
          value = (value * 9301 + 49297) % 233280;
          return value / 233280;
        };
      };

      return pipoData.map((item) => {
        if (!item || !item.id) return null;

        try {
          let motivation = item.motivation;
          if (!motivation) {
            const seed = parseInt(String(item.id || '').replace(/\D/g, ''), 10) || 0;
            const dateStr = String(selectedDate || '').split('-').join('');
            const dateSeed = parseInt(dateStr, 10) || 0;
            const combinedSeed = seed + dateSeed;
            const random = seedRandom(combinedSeed);
            const motivationIndex = Math.floor(random() * MOTIVATION_TITLES.length);
            motivation = MOTIVATION_TITLES[Math.max(0, Math.min(motivationIndex, MOTIVATION_TITLES.length - 1))] || MOTIVATION_TITLES[0];
          }

          let imageFilename = item.imageName;
          if (!imageFilename) {
            const seed = parseInt(String(item.id || '').replace(/\D/g, ''), 10) || 0;
            const dateStr = String(selectedDate || '').split('-').join('');
            const dateSeed = parseInt(dateStr, 10) || 0;
            const combinedSeed = seed + dateSeed;
            const random = seedRandom(combinedSeed);
            const imageIndex = Math.floor(random() * PIPO_NOTE_IMAGES.length);
            imageFilename = PIPO_NOTE_IMAGES[Math.max(0, Math.min(imageIndex, PIPO_NOTE_IMAGES.length - 1))] || PIPO_NOTE_IMAGES[0];
          }

          return {
            ...item,
            motivation: motivation || MOTIVATION_TITLES[0],
            imageFilename: imageFilename || PIPO_NOTE_IMAGES[0],
          };
        } catch (e) {
          console.error('Error generating card data for item:', item?.id, e);
          return {
            ...item,
            motivation: item.motivation || MOTIVATION_TITLES[0],
            imageFilename: item.imageName || PIPO_NOTE_IMAGES[0],
          };
        }
      }).filter(Boolean);
    } catch (e) {
      console.error('Error in pipoCardData memoization:', e);
      return [];
    }
  }, [pipoData, selectedDate]);

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Missing user</Text>
          <Text>Pass `userId` as a prop from your MainStack.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text></Text>
        <Text style={styles.headerTitle}>
          {(() => {
            try {
              if (!selectedDate) return '';
              const date = dayjs(selectedDate);
              if (!date.isValid()) return '';
              return date.format('dddd, MMM DD').toUpperCase();
            } catch (e) {
              return '';
            }
          })()}
        </Text>

        <Pressable onPress={() => setFullCalendarVisible(true)} hitSlop={12}>
          <MaterialIcons name="calendar-today" size={22} color="#000" />
        </Pressable>
      </View>
      <FullCalendar
        selectedDate={selectedDate}
        modalVisible={fullCalendarVisible}
        setSelectedDate={handleDateChange}
        setModalVisible={setFullCalendarVisible}
      />
      <CalendarProvider date={selectedDate} onDateChanged={(date) => {
        if (!isDateChangingRef.current && date && date !== selectedDate) {
          handleDateChange(date);
        }
      }}>
        <View style={styles.weekHeaderWrap}>
          <WeekCalendar
            firstDay={1}
            markedDates={markedDates}
            markingType="multi-dot"
            allowShadow={false}
            style={styles.weekCalendar}
            onDayPress={(d) => {
              try {
                if (d && d.dateString && typeof d.dateString === 'string') {
                  handleDateChange(d.dateString);
                }
              } catch (e) {
                console.error('Error in onDayPress:', e);
              }
            }}
            theme={{
              todayTextColor: "#111",
              selectedDayBackgroundColor: "#CFCFCF",
              textSectionTitleColor: "#666",
              dayTextColor: "#666",
            }}
          />


        </View>


      </CalendarProvider>



      {isSelf ? (
        <ScrollView
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >

          {loading && selfData.length === 0 ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator />
            </View>
          ) : selfData.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTextCenter}>Take a little moment just for you.</Text>

              <Pressable
                onPress={() => {
                  if (tabChangeTimeoutRef.current) {
                    clearTimeout(tabChangeTimeoutRef.current);
                    tabChangeTimeoutRef.current = null;
                  }
                  isTabChangingRef.current = false;
                  pendingTabRef.current = null;

                  if (activeTab !== "self") {
                    setActiveTab("self");
                    currentFetchTabRef.current = "self";
                  }

                  writerModalTabRef.current = "self";
                  if (writerModalTimeoutRef.current) {
                    clearTimeout(writerModalTimeoutRef.current);
                  }
                  writerModalTimeoutRef.current = setTimeout(() => {
                    setWriterOpen(true);
                    writerModalTimeoutRef.current = null;
                  }, 50);
                }}
                style={styles.writeBtn}
                hitSlop={12}
              >
                <MaterialIcons name="edit" size={18} color="#fff" />
                <Text style={styles.writeBtnText}>WRITE</Text>
              </Pressable>
            </View>
          ) : (
            selfData.map((item) => (
              <SelfReflectionCard
                key={item.id}
                title={item.title}
                description={item.subtitle}
                onEdit={() => onEditSelf(item)}
                onDelete={() => onDeleteSelf(item)}
              />
            ))
          )}
          <View style={{ height: 16 }} />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingTop: 90, paddingBottom: 96, paddingHorizontal: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading && pipoData.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text>Loading…</Text>
            </View>
          ) : pipoData.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                If you start now,{"\n"}I promise I'll cheer louder than anyone!
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {pipoCardData.map((item, i) => {
                const handleCardPress = () => {
                  try {
                    if (loading) {
                      console.warn('Still loading data, please wait');
                      return;
                    }

                    if (!item || !item.id) {
                      console.warn('Invalid item data, cannot navigate');
                      return;
                    }

                    const currentDate = pendingDateRef.current || selectedDate;
                    if (!currentDate || !dayjs(currentDate).isValid()) {
                      console.warn('Invalid date, cannot navigate');
                      return;
                    }

                    const imageFilename = item.imageFilename || PIPO_NOTE_IMAGES[0];
                    const safeMotivation = item.motivation || MOTIVATION_TITLES[0];

                    const pipoData = {
                      id: String(item.id),
                      imageFilename: imageFilename,
                      motivation: safeMotivation,
                      Motivation: safeMotivation,
                      title: String(item.title || ''),
                      subtitle: String(item.subtitle || ''),
                      dateISO: currentDate,
                      dateText: dayjs(currentDate).isValid()
                        ? dayjs(currentDate).format("ddd, MMM D").toUpperCase()
                        : '',
                      readAt: item.readAt,
                      sessionId: item.sessionId || null,
                      scenarioId: item.scenarioId || null,
                      level: item.level || null,
                    };

                    if (!pipoData.id || !pipoData.imageFilename) {
                      console.warn('Missing required pipo data, cannot navigate');
                      return;
                    }

                    navigation.navigate("PipoDetail", { pipo: pipoData });
                  } catch (e) {
                    console.error('Error navigating to PipoDetail:', e);
                  }
                };

                return (
                  <PipoCard
                    key={item.id}
                    imageFilename={item.imageFilename}
                    title={item.title}
                    subtitle={item.subtitle}
                    index={i}
                    motivation={item.motivation}
                    onPress={handleCardPress}
                  />
                );
              })}

            </View>
          )}
          <View style={{ height: 16 }} />
        </ScrollView>
      )}

      <View style={styles.tabContainer}>
        <ImageBackground
          source={require('../../assets/Tab_mailbox.png')}
          style={[styles.tabGroup, { overflow: 'hidden' }]}
          imageStyle={{ borderRadius: 26 }}
        >
          <Pressable
            style={[styles.tabButton, activeTab === "pipo" && styles.tabActive]}
            onPress={() => handleTabChange("pipo")}
          >
            <Text style={[styles.tabText, activeTab === "pipo" && styles.tabTextActive]}>FROM PIP</Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === "self" && styles.tabActive]}
            onPress={() => handleTabChange("self")}
          >
            <Text style={[styles.tabText, activeTab === "self" && styles.tabTextActive]}>TO MYSELF</Text>
          </Pressable>
        </ImageBackground>
      </View>
      {/* <Modal
        visible={writerOpen}
        animationType="slide"
        onRequestClose={() => {
          try {
            if (writerModalTimeoutRef.current) {
              clearTimeout(writerModalTimeoutRef.current);
              writerModalTimeoutRef.current = null;
            }
            setWriterOpen(false);
            setEditingSelf(null);
            writerModalTabRef.current = null;
          } catch (e) {
            console.error("Error in onRequestClose:", e);
          }
        }}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={['top', 'bottom', 'left', 'right']}>
          <View style={{ 
            flexDirection: "row", 
            alignItems: "center", 
            paddingHorizontal: 12, 
            paddingVertical: 12,
            paddingTop: 8,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: "#eee",
            backgroundColor: "#fff",
            zIndex: 10,
          }}>
            <Pressable 
              onPress={() => {
                try {
                  if (writerModalTimeoutRef.current) {
                    clearTimeout(writerModalTimeoutRef.current);
                    writerModalTimeoutRef.current = null;
                  }
                  setWriterOpen(false);
                  setEditingSelf(null);
                  writerModalTabRef.current = null;
                } catch (e) {
                  console.error("Error closing modal:", e);
                }
              }} 
              hitSlop={12}
            >
              <MaterialIcons name="arrow-back" size={22} color="#000" />
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: "700", marginLeft: 8 }}>Write</Text>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <AddReflectionCard
                selectedDate={selectedDate}
                initialTitle={editingSelf?.title}
                initialDescription={editingSelf?.description}
                onCancel={() => {
                  try {
                    if (writerModalTimeoutRef.current) {
                      clearTimeout(writerModalTimeoutRef.current);
                      writerModalTimeoutRef.current = null;
                    }
                    setWriterOpen(false);
                    setEditingSelf(null);
                    writerModalTabRef.current = null;
                  } catch (e) {
                    console.error("Error in onCancel:", e);
                  }
                }}
                onSave={async ({ title, description }) => {
                  try {
                    if (editingSelf) {
                      await handleUpdateReflection({ title, description });
                    } else {
                      await handleSaveReflection({ title, description });
                    }
                    if (writerModalTimeoutRef.current) {
                      clearTimeout(writerModalTimeoutRef.current);
                      writerModalTimeoutRef.current = null;
                    }
                    setWriterOpen(false);
                    setEditingSelf(null);
                    writerModalTabRef.current = null;
                  } catch (e) {
                    console.error("Save failed:", e);
                    console.error("Error details:", {
                      message: e?.message,
                      stack: e?.stack,
                      response: e?.response?.data,
                    });
                    throw e;
                  }
                }}
                onHarmfulDetected={() => {
                  try {
                    setShowSupportModal(true);
                  } catch (e) {
                    console.error("Error showing support modal:", e);
                  }
                }}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal> */}
      <Modal
        visible={writerOpen}
        animationType="slide"
        onRequestClose={() => {
          try {
            if (writerModalTimeoutRef.current) {
              clearTimeout(writerModalTimeoutRef.current);
              writerModalTimeoutRef.current = null;
            }
            setWriterOpen(false);
            setEditingSelf(null);
            writerModalTabRef.current = null;
          } catch (e) {
            console.error("Error in onRequestClose:", e);
          }
        }}
        presentationStyle="fullScreen"
      >

        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            paddingTop: insets.top,
          }}
        >
          <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={["bottom", "left", "right"]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: "#eee",
                backgroundColor: "#fff",
                zIndex: 10,
                elevation: 10,
              }}
            >
              <Pressable
                onPress={() => {
                  try {
                    if (writerModalTimeoutRef.current) {
                      clearTimeout(writerModalTimeoutRef.current);
                      writerModalTimeoutRef.current = null;
                    }
                    setWriterOpen(false);
                    setEditingSelf(null);
                    writerModalTabRef.current = null;
                  } catch (e) {
                    console.error("Error closing modal:", e);
                  }
                }}
                hitSlop={16}
              >
                <MaterialIcons name="arrow-back" size={22} color="#000" />
              </Pressable>
              <Text style={{ fontSize: 16, fontWeight: "700", marginLeft: 8 }}>
                Write
              </Text>
            </View>

            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                <AddReflectionCard
                  selectedDate={selectedDate}
                  initialTitle={editingSelf?.title}
                  initialDescription={editingSelf?.description}
                  onCancel={() => {
                    try {
                      if (writerModalTimeoutRef.current) {
                        clearTimeout(writerModalTimeoutRef.current);
                        writerModalTimeoutRef.current = null;
                      }
                      setWriterOpen(false);
                      setEditingSelf(null);
                      writerModalTabRef.current = null;
                    } catch (e) {
                      console.error("Error in onCancel:", e);
                    }
                  }}
                  onSave={async ({ title, description }) => {
                    try {
                      if (editingSelf) {
                        await handleUpdateReflection({ title, description });
                      } else {
                        await handleSaveReflection({ title, description });
                      }
                      if (writerModalTimeoutRef.current) {
                        clearTimeout(writerModalTimeoutRef.current);
                        writerModalTimeoutRef.current = null;
                      }
                      setWriterOpen(false);
                      setEditingSelf(null);
                      writerModalTabRef.current = null;
                    } catch (e) {
                      console.error("Save failed:", e);
                      console.error("Error details:", {
                        message: e?.message,
                        stack: e?.stack,
                        response: e?.response?.data,
                      });
                      throw e;
                    }
                  }}
                  onHarmfulDetected={() => {
                    try {
                      setShowSupportModal(true);
                    } catch (e) {
                      console.error("Error showing support modal:", e);
                    }
                  }}
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>

      <SupportModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        onGoSupport={() => {
          if (goingToSupportRef.current) return;
          goingToSupportRef.current = true;

          setShowSupportModal(false);

          requestAnimationFrame(() => {
            navigation.navigate("EmotionalSupport");
            if (goingToSupportTimeoutRef.current) {
              clearTimeout(goingToSupportTimeoutRef.current);
            }
            goingToSupportTimeoutRef.current = setTimeout(() => {
              goingToSupportRef.current = false;
              goingToSupportTimeoutRef.current = null;
            }, 300);
          });
        }}
      />


      <ConfirmDialog
        visible={showConfirmSelf}
        title="Delete note?"
        message="This action cannot be undone."
        secondaryMessage="All related data will be permanently removed."
        confirmText="DELETE"
        cancelText="CANCEL"
        loading={deletingSelf}
        onCancel={() => {
          setShowConfirmSelf(false);
          deleteTargetRef.current = null;
        }}
        onConfirm={confirmDeleteSelf}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 14,

    fontWeight: "700",
    letterSpacing: 0.5,
    alignItems: "center",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#EEE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: "flex-start",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#222",
  },
  cardSubtitle: { fontSize: 12, color: "#7A7A7A" },

  tabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tabGroup: {
    flexDirection: "row",
    // backgroundColor: "rgba(208, 217, 255, 0.8)",

    borderRadius: 26,
    padding: 4,
    width: 340,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
    }),
  },
  tabButton: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: "#FFFFFF" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#111", fontWeight: "700" },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: { color: "#777", fontSize: 14, textAlign: "center" },
  pipoCard: {
    width: cardWidth,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
    }),
  },
  pipoIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  pipoBlob: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  pipoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2A2A2A",
    marginTop: 6,
    marginBottom: 4,
    textAlign: "center",
  },
  pipoSubtitle: {
    fontSize: 12,
    color: "#737373",
    textAlign: "center",
  },
  emptyTextCenter: {
    color: "#222",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },

  writeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#342E4E",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
    }),
  },

  writeBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  weekHeaderWrap: {
    height: 80,
    paddingBottom: 19,
    backgroundColor: "#fff",
    zIndex: 100,
    overflow: "visible",


    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  weekCalendar: {
    paddingVertical: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
});
