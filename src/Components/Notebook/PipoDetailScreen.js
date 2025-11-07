import React, { useEffect, useLayoutEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView, Image, Alert } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { deleteReflection,updateReflectionReadStatus } from "../../services/api";
import ConfirmDialog from '../AlertBox/ConfirmDialog'

export default function PipoDetailScreen({ route, navigation }) {
  const { pipo } = route.params || {};
  const [deleting, setDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const handleDelete = () => {
    if (!pipo?.id || deleting || isDeleted) return;
    setShowConfirm(true);
    // Alert.alert(
    //   "Delete note?",
    //   "This will permanently remove this Pipo note.",
    //   [
    //     { text: "Cancel", style: "cancel" },
    //     {
    //       text: "Delete",
    //       style: "destructive",
    //       onPress: async () => {
    //         setDeleting(true);
    //         try {
    //           await deleteReflection(pipo.id);
    //           setIsDeleted(true);
    //         } catch (e) {
    //           console.error("Delete failed:", e);
    //           Alert.alert("Error", "Could not delete. Please try again.");
    //         } finally {
    //           setDeleting(false);
    //         }
    //       },
    //     },
    //   ],
    //   { cancelable: true }
    // );
  };

  const confirmDelete = async () => {
  if (!pipo?.id) return;
  setDeleting(true);
  try {
    await deleteReflection(pipo.id);
    setIsDeleted(true);
    setShowConfirm(false);
  } catch (e) {
    console.error("Delete failed:", e);
    Alert.alert("Error", "Could not delete. Please try again.");
  } finally {
    setDeleting(false);
  }
};


  useLayoutEffect(() => {
    navigation.setOptions({
      
      headerRight: () =>
        isDeleted ? null : (
          <Pressable onPress={handleDelete} hitSlop={12} disabled={deleting}>
            <MaterialIcons
              name="delete-outline"
              size={22}
              color={deleting ? "#aaa" : "#000"}
            />
          </Pressable>
        ),
    });
  }, [navigation, deleting, isDeleted]);

 

  useEffect(() => {
    if (!pipo?.id) return;
    if (pipo?.readAt != null) return; 

    let stop = false;
    (async () => {
      try {
        await updateReflectionReadStatus(pipo?.id, { readAt: new Date().toISOString() });
      } catch (e) {
        if (!stop) console.error("Failed to set readAt:", e);
      }
    })();

    return () => { stop = true; };
  }, [pipo?.id, pipo?.readAt]);

//   useEffect(() => {
//   const reflectionId = pipo?._id || pipo?.id;
//   if (!reflectionId) return;

//   (async () => {
//     try {
//       // for testing
//       await updateReflectionReadStatus(reflectionId, { readAt: null });
//       console.log('readAt set to null for testing');
//     } catch (e) {
//       console.error('Failed to set readAt null:', e);
//     }
//   })();
// }, [pipo?._id, pipo?.id]);

  if (!pipo) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No data found</Text>
      </SafeAreaView>
    );
  }

  // Ensure image is valid, provide fallback
  const safeImage = pipo.image && (typeof pipo.image === 'object' || typeof pipo.image === 'number') 
    ? pipo.image 
    : require('../../../assets/pipo/pipo-hi.png'); // Fallback image

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
        {isDeleted ? (
          
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
            <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "700", color: "#1A1A1A" }}>
              Note deleted
            </Text>
            <Text style={{ marginTop: 6, color: "#666", textAlign: "center" }}>
              Use the back button to return to your Notebook.
            </Text>
          </View>
        ) : (
          <>
            <View style={{ alignItems: "center", marginTop: 20, marginBottom: 10 }}>
              {safeImage && <Image style={{ width: 126, height: 126 }} source={safeImage} resizeMode="contain" />}
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

            <Text style={{ fontSize: 14, lineHeight: 22, color: "#333", marginBottom: 16 }}>
              {pipo.subtitle || "Hi there, it’s me, Pipo! … (put your dynamic message here)."}
            </Text>

            {pipo?.sessionId ? (
              <View style={{ marginTop: 24 }}>
                <Pressable
                  onPress={() => navigation.navigate("Transcript", { sessionId: pipo.sessionId })}
                  style={styles.primary}
                  hitSlop={12}
                >
                  <Text style={styles.primaryText}>VIEW TRANSCRIPT</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
      <ConfirmDialog
  visible={showConfirm}
  title="Are you sure?"
  message="This action cannot be undone."
  secondaryMessage="All related data will be permanently removed."
  confirmText="DELETE"
  cancelText="CANCEL"
  onConfirm={confirmDelete}
  onCancel={() => setShowConfirm(false)}
  loading={deleting}
/>

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
