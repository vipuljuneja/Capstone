import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

export default function ProfileScreen({ navigation }) {
    const { mongoUser, refreshMongoUser } = useAuth();
    const [signingOut, setSigningOut] = useState(false);
    const handleSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut(auth);
    //   navigation.dispatch(
    //   CommonActions.reset({
    //     index: 0,
    //     routes: [{ name: 'Login' }], 
    //   })
    // );
    
    } catch (e) {
      console.error("Sign out error:", e);
      Alert.alert("Sign out failed", "Please try again.");
    } finally {
        
      setSigningOut(false);
    }
  }, [signingOut]);

    const getFirebaseToken = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                console.log('🔥 Firebase Token:', token);
                alert(`Token copied to console!\n\nFirst 50 chars: ${token.substring(0, 50)}...`);
            } else {
                alert('No user logged in');
            }
        } catch (error) {
            console.error('Error getting token:', error);
            alert('Error getting token: ' + error.message);
        }
    };
    const images = {
        set_lock: require("../../assets/set_lock.png"),
        set_PP: require("../../assets/set_PP.png"),
        set_revisit: require("../../assets/set_revisit.png"),
        set_TOU: require("../../assets/set_TOU.png"),

    };

    useFocusEffect(
        React.useCallback(() => {
            refreshMongoUser();
        }, [])
    );
    const avatarImages = {
        pipo_set: require('../../assets/pipo_set.png'),
        bro_set: require('../../assets/bro_set.png'),
        cherry_set: require('../../assets/cherry_set.png'),
        mshrom_set: require('../../assets/mshrom_set.png')
    };

    const getUserAvatar = () => {
        const avatarName = mongoUser?.avatarImage || 'pipo_set';
        return avatarImages[avatarName] || avatarImages.pipo_set;
    };

    // Safety check - if no user data, show loading
    if (!mongoUser) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#3b2764" />
                <Text style={{ marginTop: 16, color: '#6b7280' }}>Loading profile...</Text>
            </View>
        );
    }
    const items = [
        {
            title: "Change Password",
            desc: "Update your password safely",
            icon: images.set_lock,
            onPress: () => navigation && navigation.navigate?.("ChangePasswordScreen"),
        },
    ];

    const debug = [
        {
            title: "Get Firebase Token",
            desc: "Copy token to console for API testing",
            icon: images.set_lock, // Using existing icon
            onPress: getFirebaseToken,
        },
    ];

    const help = [
        {
            title: "Revisit Guide",
            desc: "Review the essential steps anytime",
            icon: images.set_revisit,
            onPress: () => navigation && navigation.navigate?.("Guide"),
        },
        {
            title: "Terms Of Use",
            desc: "App rules at a glance",
            icon: images.set_TOU,
            onPress: () => navigation && navigation.navigate?.("Terms"),
        },
        {
            title: "Privacy Policy",
            desc: "How we handle your data",
            icon: images.set_PP,
            onPress: () => navigation && navigation.navigate?.("PrivacyPolicy"),
        },
    ];

    return (
        <ScrollView style={S.container} showsVerticalScrollIndicator={false}>

            {/* Avatar */}
            <View style={S.avatarSection}>
                <View style={S.avatarWrap}>
                    <Image
                        source={getUserAvatar()}
                        style={S.avatar}
                    />
                    <Pressable style={S.editFab} onPress={() => navigation.navigate("ProfileSettingScreen")}>
                        <MaterialIcons name="edit" size={16} color="#111" />
                    </Pressable>
                </View>
                <Text style={S.userName}>{mongoUser.name}</Text>
            </View>

            {/* Profile Setting */}
            <View style={S.section}>
                <Text style={S.sectionTitle}>Profile Setting</Text>
                {items.map((it, i) => (
                    <OptionRow key={i} {...it} />
                ))}
            </View>

            {/* Debug Section */}
            <View style={S.section}>
                <Text style={S.sectionTitle}>Debug</Text>
                {debug.map((it, i) => (
                    <OptionRow key={i} {...it} />
                ))}
            </View>

            {/* Help & Guide */}
            <View style={S.section}>
                <Text style={S.sectionTitle}>Help & Guide</Text>
                {help.map((it, i) => (
                    <OptionRow key={i} {...it} />
                ))}
            </View>
            <View style={{ paddingVertical: 8, paddingBottom: 24 }}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={[S.logout, signingOut && S.disabled]}
          disabled={signingOut}
        >
          {signingOut ? <ActivityIndicator color="#fff" /> : <Text style={S.logoutTxt}>Log Out</Text>}
        </TouchableOpacity>
      </View>
        </ScrollView>
    );
}

function OptionRow({ title, desc, icon, onPress }) {
    const source =  icon;

    return (
        <Pressable style={S.option} onPress={onPress}>
            <View style={S.optionLeft}>
                <Image source={source} style={S.optionIcon} />
                <View>
                    <Text style={S.optionTitle}>{title}</Text>
                    <Text style={S.optionSubtitle}>{desc}</Text>
                </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#111" />
        </Pressable>
    );
}

const S = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
    },
    headerTitle: { fontSize: 16, fontWeight: "600", color: "#111" },

    avatarSection: { alignItems: "center", marginTop: 10, marginBottom: 20 },
    avatarWrap: { position: "relative" },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    editFab: {
        position: "absolute",
        bottom: 4,
        right: 4,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 6,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    userName: { fontSize: 16, fontWeight: "600", marginTop: 8, color: "#111" },

    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
        color: "#111",
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f6f7f9",
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
    },
    optionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    optionIcon: { width: 48, height: 48, borderRadius: 12 },
    optionTitle: { fontSize: 14, fontWeight: "600", color: "#111" },
    optionSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
    logout: {
    backgroundColor: '#312e81',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  disabled: { opacity: 0.6 },
  logoutTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
