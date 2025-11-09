import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, TextInput, Pressable } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const HARMFUL_WORDS = [
  "suicide","kill myself","end my life","want to die","self harm","self-harm",
  "hurt myself","cut myself","i can't go on","i cant go on","no reason to live",
  "take my life","ending it","depressed","hopeless","worthless"
].map(s => s.toLowerCase());

const looksHarmful = (title, desc) => {
  const t = `${title || ""} ${desc || ""}`.toLowerCase();
  return HARMFUL_WORDS.some(k => t.includes(k));
};

export default function AddReflectionCard({
  selectedDate,
  onSave,
  onCancel,
  initialTitle,
  initialDescription,
  onHarmfulDetected,
}) {
  const [title, setTitle] = useState(initialTitle || "");
  const [desc, setDesc] = useState(initialDescription || "");
  const [saving, setSaving] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => { setTitle(initialTitle || ""); }, [initialTitle]);
  useEffect(() => { setDesc(initialDescription || ""); }, [initialDescription]);

  const canSave = title && typeof title === 'string' && title.trim().length > 0 && !saving;

  const handlePressSave = async () => {
    if (!canSave || saving) return;
    
    const trimmedTitle = title?.trim() || "";
    const trimmedDesc = desc?.trim() || "";
    
    if (!trimmedTitle || trimmedTitle.length === 0) {
      console.warn("Cannot save: title is empty");
      return;
    }
    
    if (!onSave) {
      console.error("onSave callback is not provided");
      return;
    }
    
    if (!isMountedRef.current) {
      console.warn("Component unmounted, cannot save");
      return;
    }
    
    setSaving(true);
    try {
      await onSave({ title: trimmedTitle, description: trimmedDesc });

      if (isMountedRef.current && looksHarmful(trimmedTitle, trimmedDesc)) {
        try {
          onHarmfulDetected?.(); 
        } catch (e) {
          console.error("Error in onHarmfulDetected:", e);
        }
      }
    } catch (error) {
      console.error("Error in handlePressSave:", error);
      throw error;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    if (!isMountedRef.current) {
      console.warn("Component unmounted, cannot cancel");
      return;
    }
    
    try {
      onCancel?.();
    } catch (e) {
      console.error("Error in onCancel:", e);
    }
  };

  return (
    <View style={S.wrap}>
      <Text style={S.date}>
        {(() => {
          try {
            if (!selectedDate) return '';
            const date = new Date(selectedDate);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString("en-CA", {
              weekday: "long",
              month: "short",
              day: "2-digit",
              timeZone: "UTC",
            }).toUpperCase();
          } catch (e) {
            return '';
          }
        })()}
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
          <Pressable 
            onPress={handleCancel} 
            style={[S.btn, S.btnGhost]}
            disabled={saving}
          >
            <Text style={[S.btnText, { color: "#111" }]}>Cancel</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handlePressSave}
          style={[S.btn, (!canSave) && S.btnDisabled]}
          disabled={!canSave || saving}
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
