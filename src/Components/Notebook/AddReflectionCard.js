import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, TextInput, Pressable } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function AddReflectionCard({
  selectedDate,
  onSave,
  onCancel,
  initialTitle,
  initialDescription,
}) {
  const [title, setTitle] = useState(initialTitle || "");
  const [desc, setDesc] = useState(initialDescription || "");
  const [saving, setSaving] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    setTitle(initialTitle || "");
  }, [initialTitle]);

  useEffect(() => {
    setDesc(initialDescription || "");
  }, [initialDescription]);

  const canSave = title.trim().length > 0 && !saving;

  const handlePressSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave?.({ title: title.trim(), description: desc.trim() });
    } finally {
      if (isMountedRef.current) setSaving(false);
    }
  };

  return (
    <View style={S.wrap}>
      <Text style={S.date}>
        {new Date(selectedDate).toLocaleDateString("en-CA", {
          weekday: "long",
          month: "short",
          day: "2-digit",
          timeZone: "UTC",
        }).toUpperCase()}
      </Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        style={S.input}
        returnKeyType="done"
      />

      <TextInput
        value={desc}
        onChangeText={setDesc}
        placeholder="Description"
        style={S.textarea}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <View style={S.actions}>
        {onCancel && (
          <Pressable onPress={onCancel} style={[S.btn, S.btnGhost]}>
            <Text style={[S.btnText, { color: "#111" }]}>Cancel</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handlePressSave}
          style={[S.btn, (!canSave) && S.btnDisabled]}
          disabled={!canSave}
        >
          <MaterialIcons name="save" size={18} color="#fff" />
          <Text style={S.btnText}>{saving ? "Saving…" : "Save"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { padding: 16, gap: 12, alignItems: "stretch" },
  date: { fontSize: 14, fontWeight: "700", letterSpacing: 0.5, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: "#fff",
  },
  textarea: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: "#fff",
    minHeight: 120,
  },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  btn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#111", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
  },
  btnGhost: { backgroundColor: "#eee" },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
