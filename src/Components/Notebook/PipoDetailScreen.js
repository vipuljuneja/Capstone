import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView, Image } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


export default function PipoDetailScreen({ route, navigation }) {
  const { pipo } = route.params || {};

  if (!pipo) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No data found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
        
        <Pressable onPress={() => console.log("Delete pressed")} hitSlop={12}>
          <MaterialIcons name="delete-outline" size={22} color="#000" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
        <View style={{ alignItems: "center", marginTop: 20, marginBottom: 10 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: "#CFC3FF" }} />
        </View>

        <Text style={{ textAlign: "center", color: "#999", fontSize: 13, marginBottom: 4 }}>
          {pipo.dateText || "SUN, 28 SEP"}
        </Text>

        <Text style={{ textAlign: "center", fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 10 }}>
          {pipo.Motivation}
        </Text>

        <View style={{ alignSelf: "center", backgroundColor: "#E6E0FF", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 20 }}>
          <Text style={{ color: "#4B3EA3", fontWeight: "600", fontSize: 13 }}>
            {pipo.title}
          </Text>
        </View>

        {/* Long message */}
        <Text style={{ fontSize: 14, lineHeight: 22, color: "#333", marginBottom: 16 }}>
          {pipo.subtitle || "Hi there, it’s me, Pipo! … (put your dynamic message here)."}
        </Text>
        {pipo?.sessionId ? (
          <View style={{ marginTop: 24 }}>
            <Pressable
              onPress={() => navigation.navigate('Transcript', { sessionId: pipo.sessionId })}
              style={styles.primary}
              hitSlop={12}
            >
              <Text style={styles.primaryText}>VIEW TRANSCRIPT</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#342E4E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
