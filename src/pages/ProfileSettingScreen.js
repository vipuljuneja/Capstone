import React, { useState, useLayoutEffect } from "react"; 
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

export default function ProfileSettingScreen({ navigation }) {
  const [name, setName] = useState("Pipo");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const avatars = [
    require("../../assets/pipo_set.png"),
    require("../../assets/bro_set.png"),
    require("../../assets/cherry_set.png"),
  ];

 const handleSave = () => {
  console.log("Saved data:", { name, password, selectedAvatar });


//   if (navigation.canGoBack()) {
//     navigation.goBack();
//   } else {
//     navigation.navigate("Home");
//   }
    navigation.navigate("Home");

};


  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ marginRight: 12 }}>
          <Feather name="check" size={22} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, name, password, selectedAvatar]);

  return (
    <SafeAreaView style={styles.container}>
      

      {/* Big avatar */}
      <Image source={avatars[selectedAvatar]} style={styles.avatar} />

     
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Enter name"
          placeholderTextColor="#8A8A8A"
        />
      </View>

      
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#555"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Avatar Picker */}
      <View style={styles.avatarPicker}>
        {avatars.map((img, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedAvatar(index)}
            style={[
              styles.avatarOption,
              selectedAvatar === index && styles.selectedAvatar,
            ]}
          >
            <Image source={img} style={styles.smallAvatar} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF1FF", alignItems: "center" },
  avatar: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 30,
    marginTop: 40,
  },
  field: { width: "85%", marginBottom: 20 },
  label: { fontSize: 15, color: "#222", marginBottom: 8 },
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
  avatarPicker: {
    flexDirection: "row",
    backgroundColor: "#E4EDFF",
    padding: 10,
    borderRadius: 20,
    marginTop: 30,
  },
  avatarOption: { borderRadius: 16, padding: 6, marginHorizontal: 8 },
  selectedAvatar: { backgroundColor: "#FFF6D9" },
  smallAvatar: { width: 60, height: 60, resizeMode: "contain" },
});
