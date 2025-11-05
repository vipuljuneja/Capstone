import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile } from "../services/api";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../firebase";
import LinearGradient from 'react-native-linear-gradient';
import { ImageBackground } from "react-native";


import ConfirmDialog from '../Components/AlertBox/ConfirmDialog'
const TILE_SIZE = 97;
const TILE_RADIUS = 18;
export default function ProfileSettingScreen({ navigation }) {
  const { user, mongoUser, refreshMongoUser } = useAuth();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const avatars = [
    // { name: "pipo_set", image: require("../../assets/pipo_set.png") },
    { name: "bro_set", image: require("../../assets/bro_set.png") },
    { name: "cherry_set", image: require("../../assets/cherry_set.png") },
    { name: "mshrom_set", image: require("../../assets/mshrom_set.png") }
  ];
  const miniBg = [
    require('../../assets/gradients/bl_gradient.png'),
    require('../../assets/gradients/purp_gradient.png'),
    require('../../assets/gradients/yel-gradient.png')
  ]

  function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const [avatarBgSources] = useState(() =>
    avatars.map(() => getRandomElement(miniBg))
  );


  // Load user data when component mounts
  useEffect(() => {
    if (mongoUser) {
      setName(mongoUser.name || "");
      const avatarIndex = avatars.findIndex(a => a.name === mongoUser.avatarImage);
      if (avatarIndex !== -1) {
        setSelectedAvatar(avatarIndex);
      }
      setInitialLoading(false);
    }
  }, [mongoUser]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to update your profile.");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      // Update name and avatar in backend
      await updateUserProfile(user.uid, {
        name: name.trim(),
        avatarImage: avatars[selectedAvatar].name,
      });

      // Update password in Firebase if provided
      // if (currentPassword && newPassword) {
      //   if (newPassword.length < 6) {
      //     Alert.alert("Error", "New password must be at least 6 characters long.");
      //     setLoading(false);
      //     return;
      //   }

      //   try {
      //     // Reauthenticate user with current password
      //     const credential = EmailAuthProvider.credential(
      //       user.email,
      //       currentPassword
      //     );
      //     await reauthenticateWithCredential(user, credential);

      //     // Update password
      //     await updatePassword(user, newPassword);

      //     Alert.alert(
      //       "Success",
      //       "Profile and password updated successfully!",
      //       [
      //         {
      //           text: "OK",
      //           onPress: () => {
      //             setCurrentPassword("");
      //             setNewPassword("");
      //           }
      //         }
      //       ]
      //     );
      //   } catch (passwordError) {
      //     console.error("Password update error:", passwordError);
      //     if (passwordError.code === "auth/wrong-password") {
      //       Alert.alert("Error", "Current password is incorrect.");
      //     } else if (passwordError.code === "auth/too-many-requests") {
      //       Alert.alert("Error", "Too many failed attempts. Please try again later.");
      //     } else {
      //       Alert.alert("Error", "Failed to update password. Please try again.");
      //     }
      //     setLoading(false);
      //     return;
      //   }
      // } else {
      //   Alert.alert("Success", "Profile updated successfully!");
      // }

      // Refresh MongoDB user data
      await refreshMongoUser();

      setLoading(false);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
      setLoading(false);
    }
  };



  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FAFAFA', '#C7DFFF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Big avatar */}
          <Image source={avatars[selectedAvatar].image} style={styles.avatar} />

          {/* Avatar Picker */}
          {/* <View style={styles.avatarPicker}>
          {avatars.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedAvatar(index)}
              style={[
                styles.avatarOption,
                selectedAvatar === index && styles.selectedAvatar,
              ]}
            >
              <Image source={item.image} style={styles.smallAvatar} />
            </TouchableOpacity>
          ))}
        </View> */}
          <View style={styles.avatarPicker}>
            {avatars.map((item, index) => {
              const isSelected = selectedAvatar === index;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPress={() => setSelectedAvatar(index)}
                  style={styles.tileTouch}
                >

                  <View style={[styles.tileRing, isSelected && styles.tileRingSelected]}>

                    <View style={styles.tileShadow}>

                      <View style={styles.tileCard}>
                        <ImageBackground
                          source={avatarBgSources[index]}
                          style={styles.tileBg}
                          imageStyle={styles.tileBgImg}
                        >
                          <Image source={item.image} style={styles.tileIcon} />
                        </ImageBackground>

                        <View style={styles.tileInnerStroke} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>


          {/* Name Field */}

          <View style={styles.nameFieldWrapper}>
            <View style={styles.nameInputContainer}>
              <Text style={styles.nameLabel}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.nameTextInput}
                placeholder="Shroom"
                placeholderTextColor="#8A8A8A"
                editable={!loading}
              />
            </View>
          </View>


          {/* <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Change Password (Optional)</Text>
        <Text style={styles.sectionSubtitle}>Leave blank to keep current password</Text>
      
        <View style={styles.field}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter current password"
              placeholderTextColor="#8A8A8A"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeButton}
            >
              <Feather
                name={showCurrentPassword ? "eye" : "eye-off"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter new password"
              placeholderTextColor="#8A8A8A"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeButton}
            >
              <Feather
                name={showNewPassword ? "eye" : "eye-off"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>
        </View> */}



          {/* Save Button */}
          <TouchableOpacity
            onPress={() => setShowConfirm(true)}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 20 }} />

        </ScrollView>
      </LinearGradient>
      <ConfirmDialog
        visible={showConfirm}
        title="Save changes?"
        message="This will update your profile details."
        secondaryMessage="You can edit them again anytime."
        confirmText="SAVE"
        cancelText="CANCEL"
        loading={loading}
        blockDismiss={loading}
        primaryColor="rgba(62, 49, 83, 1)"
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          await handleSave();
          setShowConfirm(false);
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  avatar: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 20,
    marginTop: 30,
  },
  // avatarPicker: {
  //   flexDirection: "row",
  //   backgroundColor: "rgba(255, 255, 255, 0.3)",
  //   padding: 10,
  //   borderRadius: 20,
  //   marginBottom: 30,
  // },
  avatarPicker: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 10,
    borderRadius: 20,
    marginBottom: 30,
  },
  tileTouch: {
    marginHorizontal: 10,
  },
  tileRing: {
    borderRadius: TILE_RADIUS + 6,
    padding: 3,
  },
  tileRingSelected: {
    borderWidth: 2,
    borderColor: "#6FA0FF",
    shadowColor: "#6FA0FF",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tileShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderRadius: TILE_RADIUS,
    backgroundColor: "transparent",
  }, tileCard: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: TILE_RADIUS,
    overflow: "hidden",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E3DDF4",
  },


  tileBg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tileBgImg: {
    borderRadius: TILE_RADIUS,
    resizeMode: "cover",
  },


  tileIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  tileInnerStroke: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: TILE_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },

  avatarOption: { borderRadius: 16, padding: 6, marginHorizontal: 8, backgroundColor: "red" },
  selectedAvatar: { backgroundColor: "#FFF6D9" },
  smallAvatar: { width: 60, height: 60, resizeMode: "contain" },
  field: { width: "85%", marginBottom: 20 },
  label: {
    fontSize: 15,
    color: "#222",
    marginBottom: 8,
    fontWeight: "500",
  },
  nameFieldWrapper: {
    width: "85%",
    marginBottom: 20,
  },

  nameInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3E9FB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  nameLabel: {
    fontSize: 15,
    color: "#000",
    fontWeight: "600",
    marginRight: 10,
  },
  nameInput: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    paddingVertical: 10,
  },
  nameTextInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
    textAlign: "right",
    paddingVertical: 0,
  },

  input: {
    backgroundColor: "#F7FAFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eyeButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
  },
  divider: {
    width: "85%",
    height: 1,
    backgroundColor: "#D0D9E8",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
    marginBottom: 5,
    width: "85%",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
    width: "85%",
  },
  saveButton: {
    backgroundColor: "rgba(62, 49, 83, 1)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 30,
    width: "85%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto",
  },
});
