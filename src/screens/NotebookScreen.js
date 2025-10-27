import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  SafeAreaView,
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
import dayjs from "dayjs";
import { getReflectionsByUser, createReflection, getReflectionDates, updateReflection, deleteReflection } from "../services/api";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FullCalendar from "../Components/Notebook/FullCalendar";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";
import AddReflectionCard from "../Components/Notebook/AddReflectionCard";
import { useAuth } from "../contexts/AuthContext";
import { ImageBackground } from "react-native";


const { width: screenWidth } = Dimensions.get("window");
const spacing = 16;
const cardWidth = (screenWidth - spacing * 2 - spacing) / 2;
const today = dayjs().format("YYYY-MM-DD");

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

function PipoCard({ title, subtitle, index, onPress }) {
  const isEven = index % 2 === 0;
  const tint = isEven ? "#EEF5FF" : "#FFF8E9";
  const border = isEven ? "#CFE0FF" : "#FFE8B8";

  return (
    <Pressable onPress={onPress} style={[styles.pipoCard, { backgroundColor: tint, borderColor: border }]}>
      <View style={styles.pipoIconWrap}>
        <View style={styles.pipoBlob} />
      </View>
      <Text style={styles.pipoTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.pipoSubtitle} numberOfLines={1}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

export default function NotebookScreen({ navigation }) {
  const { mongoUser } = useAuth();
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


  const isSelf = activeTab === "self";

  const onEditSelf = (item) => {
    setEditingSelf({ id: item.id, title: item.title, description: item.subtitle });

    setWriterOpen(true);
  };

  const onDeleteSelf = async (item) => {
    try {
      await deleteReflection(item.id);
      await fetchCards();

      const key = dayjs(item?.date || selectedDate).format("YYYY-MM-DD");
      setDotDates((prev) => {
        const curr = { ...(prev || {}) };
        const flags = curr[key] || {};
        delete flags.self;
        if (!flags.pipo) delete curr[key];
        else curr[key] = flags;
        return curr;
      });
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const toUICard = useCallback(
    (r, i) => ({
      id: String(r?._id ?? r?.id ?? i),
      type: r?.type ?? (isSelf ? "self" : "pipo"),
      date: r?.date ?? selectedDate,
      title: r?.title ?? "",
      subtitle: r?.description ?? "",
    }),
    [isSelf, selectedDate]
  );

  const fetchCards = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await getReflectionsByUser(userId, {
        date: selectedDate,
        type: activeTab,
      });
      const safe = Array.isArray(list) ? list : [];
      setItems(safe.map(toUICard));
    } catch (e) {
      console.error("Get reflections failed:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate, activeTab, toUICard]);

  const fetchDots = useCallback(async () => {
    if (!userId) return;
    const startDate = dayjs(selectedDate).startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs(selectedDate).endOf("month").format("YYYY-MM-DD");
    try {
      const dates = await getReflectionDates(userId, { startDate, endDate });
      const next = {};
      (Array.isArray(dates) ? dates : []).forEach((row) => {
        const ds = dayjs(row?.date).format("YYYY-MM-DD");
        const t = String(row?.type || "").toLowerCase();
        if (!ds) return;
        if (!next[ds]) next[ds] = {};
        if (t === "self") next[ds].self = true;
        if (t === "pipo") next[ds].pipo = true;
      });
      setDotDates(next);

    } catch (e) {
      console.error("Get reflection dates failed:", e);
      setDotDates({});
    }
  }, [userId, selectedDate]);



  useEffect(() => {
    fetchDots();
  }, [fetchDots]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);



  const markedDates = useMemo(() => {
    const marks = {};
    // console.log(dotDates);
    if (dotDates && typeof dotDates === "object") {
      Object.keys(dotDates).forEach((d0) => {
        const d = dayjs(d0).format("YYYY-MM-DD");
        const flags = dotDates[d0] || {};
        const dots = [];
        if (flags.pipo) dots.push({ key: "pipo", color: "#E53935", selectedDotColor: "#E53935" });
        if (flags.self) dots.push({ key: "self", color: "#1E88E5", selectedDotColor: "#1E88E5" });
        if (dots.length > 0) {
          marks[d] = { ...(marks[d] || {}), dots };
        }
      });
    }

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#CFCFCF",
      selectedTextColor: "#111",
    };
    return marks;
  }, [dotDates, selectedDate]);



  const handleSaveReflection = async ({ title, description }) => {
    if (!userId) return;
    const selfData = Array.isArray(items) ? items.filter((it) => it.type === "self") : [];
    const alreadyHasSelf = selfData.length > 0;
    if (alreadyHasSelf) {
      console.warn("A self reflection already exists for this date.");
      return;
    }

    try {
      const created = await createReflection({
        userId,
        title,
        description,
        date: selectedDate,
        type: "self",
      });
      await fetchCards();
      setDotDates((prev) => {
        const curr = prev || {};
        const existing = curr[selectedDate] || {};
        return { ...curr, [selectedDate]: { ...existing, self: true } };
      });

    } catch (e) {
      console.error("Create reflection failed:", e);
    }
  };

  const handleUpdateReflection = async ({ title, description }) => {
    if (!editingSelf) return;
    try {
      await updateReflection(editingSelf.id, { title, description, date: selectedDate, type: "self" });
      setEditingSelf(null);
      await fetchCards();

      const key = dayjs(selectedDate).format("YYYY-MM-DD");
      setDotDates((prev) => {
        const curr = prev || {};
        const existing = curr[key] || {};
        return { ...curr, [key]: { ...existing, self: true } };
      });
    } catch (e) {
      console.error("Update failed:", e);
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchCards(), fetchDots()]);
    } finally {
      setRefreshing(false);
    }
  };

  const pipoData = useMemo(() => (Array.isArray(items) ? items.filter((it) => it.type !== "self") : []), [items]);
  const selfData = useMemo(() => (Array.isArray(items) ? items.filter((it) => it.type === "self") : []), [items]);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text></Text>
        <Text style={styles.headerTitle}>
          {new Date(selectedDate)
            .toLocaleDateString("en-CA", {
              weekday: "long",
              month: "short",
              day: "2-digit",
              timeZone: "UTC",
            })
            .toUpperCase()}
        </Text>

        <Pressable onPress={() => setFullCalendarVisible(true)} hitSlop={12}>
          <MaterialIcons name="calendar-today" size={22} color="#000" />
        </Pressable>
      </View>
      <FullCalendar
        selectedDate={selectedDate}
        modalVisible={fullCalendarVisible}
        setSelectedDate={setSelectedDate}
        setModalVisible={setFullCalendarVisible}
      />
      <CalendarProvider date={selectedDate} onDateChanged={(d) => setSelectedDate(d)}>
        <WeekCalendar
          firstDay={1}
          markedDates={markedDates}
          markingType="multi-dot"
          allowShadow={false}
          style={styles.weekCalendar}
          onDayPress={(d) => setSelectedDate(d.dateString)}
          theme={{
            todayTextColor: "#111",
            selectedDayBackgroundColor: "#CFCFCF",
            textSectionTitleColor: "#666",
            dayTextColor: "#666",
          }}
        />
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

              <Pressable onPress={() => setWriterOpen(true)} style={styles.writeBtn} hitSlop={12}>
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
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 96, paddingHorizontal: 16 }}
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
              {pipoData.map((item, i) => (
                <PipoCard
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  index={i}
                  onPress={() =>
                    navigation.navigate("PipoDetail", {
                      pipo: {
                        id: item.id,
                        title: item.title,
                        subtitle: item.subtitle,
                        dateISO: selectedDate,
                        dateText: dayjs(selectedDate).format("ddd, MMM D").toUpperCase(),
                      },
                    })
                  }
                />
              ))}
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
            onPress={() => setActiveTab("pipo")}
          >
            <Text style={[styles.tabText, activeTab === "pipo" && styles.tabTextActive]}>From Pipo</Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === "self" && styles.tabActive]}
            onPress={() => setActiveTab("self")}
          >
            <Text style={[styles.tabText, activeTab === "self" && styles.tabTextActive]}>Self Reflection</Text>
          </Pressable>
        </ImageBackground>
      </View>
      <Modal
        visible={writerOpen}
        animationType="slide"
        onRequestClose={() => setWriterOpen(false)}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 12, gap: 12 }}>
            <Pressable onPress={() => setWriterOpen(false)} hitSlop={12}>
              <MaterialIcons name="arrow-back" size={22} color="#000" />
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Write</Text>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <View style={{ padding: 16, flex: 1 }}>
              <AddReflectionCard
                selectedDate={selectedDate}
                initialTitle={editingSelf?.title}
                initialDescription={editingSelf?.description}
                onCancel={() => {
                  setWriterOpen(false);
                  setEditingSelf(null);
                }}
                onSave={async ({ title, description }) => {
                  try {
                    if (editingSelf) {
                      await handleUpdateReflection({ title, description });
                    } else {
                      await handleSaveReflection({ title, description });
                    }
                  } catch (e) {
                    console.error("Save failed:", e);
                  } finally {
                    setWriterOpen(false);
                    setEditingSelf(null);
                  }
                }}
                onHarmfulDetected={() => {
                  setShowSupportModal(true);
                }}
              />


            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
            setTimeout(() => { goingToSupportRef.current = false; }, 300);
          });
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
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
  weekCalendar: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
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
    borderRadius: 28,
    backgroundColor: "#CFC3FF",
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

});
