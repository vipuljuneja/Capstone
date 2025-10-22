import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import dayjs from "dayjs";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";

import FullCalendar from "../Components/Notebook/FullCalendar";
import AddReflectionCard from "../Components/Notebook/AddReflectionCard";


import {
  createReflection,
  getReflectionsByUser,
  getReflectionDates,
} from "../services/api";

const { width: screenWidth } = Dimensions.get("window");
const spacing = 16;
const cardWidth = (screenWidth - spacing * 2 - spacing) / 2;
const today = dayjs().format("YYYY-MM-DD");

export default function NotebookScreen({ userId, navigation, mongoUser }) {
  console.log(userId)
  console.log(mongoUser)
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState("pipo"); 
  const [fullCalendarVisible, setFullCalendarVisible] = useState(false);
  const [writerOpen, setWriterOpen] = useState(false);

 
  const [noteCards, setNoteCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  
  const [dotDates, setDotDates] = useState({}); 

  const toUICard = (r) => ({
    id: r._id,
    type: r.type,
    date: r.date,
    title: r.title,
    subtitle: r.description || "",
  });

  const fetchCards = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const items = await getReflectionsByUser(userId, {
        date: selectedDate,
        type: activeTab,
      });
      setNoteCards(items.map(toUICard));
    } catch (e) {
      console.error("Get reflections failed:", e);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate, activeTab]);

  const fetchDots = useCallback(async () => {
    if (!userId) return;
    const startDate = dayjs(selectedDate).startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs(selectedDate).endOf("month").format("YYYY-MM-DD");
    try {
      const dates = await getReflectionDates(userId, { startDate, endDate });
      const next = {};
      dates.forEach((d) => {
        next[d.date] = true; 
      });
      setDotDates(next);
    } catch (e) {
      console.error("Get reflection dates failed:", e);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    fetchDots();
  }, [fetchDots]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchCards(), fetchDots()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveReflection = async ({ title, description }) => {
    if (!userId) return;
    try {
      const created = await createReflection({
        userId,
        title,
        description,
        date: selectedDate,
        type: activeTab,
      });

      
      setNoteCards((prev) => [toUICard(created), ...prev]);
      setDotDates((prev) => ({ ...prev, [selectedDate]: true }));
    } catch (e) {
      console.error("Create reflection failed:", e);
    }
  };

  const markedDates = useMemo(() => {
    const marks = {};
    Object.keys(dotDates).forEach((d) => {
      marks[d] = { marked: true, dotColor: "#111" };
    });
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#CFCFCF",
      selectedTextColor: "#111",
    };
    return marks;
  }, [dotDates, selectedDate]);

  const visibleCards = noteCards; 
  const onAddCard = () => setWriterOpen(true);

  if (!userId) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          Missing user
        </Text>
        <Text>Pass `userId` as a prop from your MainStack.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => {}} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color="#000" />
        </Pressable>

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

      {/* Week calendar strip */}
      <CalendarProvider date={selectedDate} onDateChanged={(d) => setSelectedDate(d)}>
        <WeekCalendar
          firstDay={1}
          markedDates={markedDates}
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

      {/* Notes grid */}
      <FlatList
        data={visibleCards}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: spacing, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 96, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
        )}
        ListFooterComponent={<View style={{ height: 16 }} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              {activeTab === "pipo" ? (
                <Text style={styles.emptyText}>
                  If you start now,{"\n"}I promise I’ll cheer louder than anyone!
                </Text>
              ) : (
                <View style={styles.emptyWrap}>
                  <Text>Take a little moment just for you.</Text>
                  <Pressable onPress={onAddCard} style={styles.addBtn}>
                    <MaterialIcons name="edit" size={18} color="#fff" />
                    <Text style={styles.addBtnText}>Write</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )
        }
      />

      {/* footer Button control */}
      <View style={styles.tabContainer}>
        <View style={styles.tabGroup}>
          <Pressable
            style={[styles.tabButton, activeTab === "pipo" && styles.tabActive]}
            onPress={() => setActiveTab("pipo")}
          >
            <Text style={[styles.tabText, activeTab === "pipo" && styles.tabTextActive]}>
              From Pipo
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === "self" && styles.tabActive]}
            onPress={() => setActiveTab("self")}
          >
            <Text style={[styles.tabText, activeTab === "self" && styles.tabTextActive]}>
              Self Reflection
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Full calendar modal */}
      <FullCalendar
        selectedDate={selectedDate}
        modalVisible={fullCalendarVisible}
        setSelectedDate={setSelectedDate}
        setModalVisible={setFullCalendarVisible}
      />

      {/* Fullscreen Writer */}
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
                onCancel={() => setWriterOpen(false)}
                onSave={async ({ title, description }) => {
                  await handleSaveReflection({ title, description });
                  setWriterOpen(false);
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  },

  weekCalendar: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },

  card: {
    width: cardWidth,
    height: 180,
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
  },
  tabGroup: {
    flexDirection: "row",
    backgroundColor: "#E6E6E6",
    borderRadius: 22,
    padding: 6,
    width: 280,
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#FFF" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#333" },
  tabTextActive: { color: "#111" },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: { color: "#777", fontSize: 14, textAlign: "center" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
