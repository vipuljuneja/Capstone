import React, { useRef, useState } from "react";
import { encode as btoa } from "base-64";
import {
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Video from "react-native-video";
import { AVATAR_API_KEY } from "@env";

const DID_API_KEY = AVATAR_API_KEY;
const AVATAR_IMAGE_URL =
  "https://create-images-results.d-id.com/api_docs/assets/noelle.jpeg";
  

const QUESTIONS = [
  "Hi! How are you doing today?",
  "Tell me about a time you solved a problem creatively.",
  "What motivates you to keep going on tough days?",
  "Describe a recent achievement you’re proud of.",
  "How do you handle feedback or criticism?",
];

export default function AvatarGenerate() {
    console.log(AVATAR_API_KEY )
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const [urls, setUrls] = useState([]); 
  const [i, setI] = useState(0);
  const AUTH = "Basic " + btoa(`${DID_API_KEY}:`);

 
  const makeVideo = async (line) => {
    const create = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({
        script: {
          type: "text",
          input: line,
          provider: { type: "microsoft", voice_id: "en-US-JennyNeural" },
        },
        source_url: AVATAR_IMAGE_URL,
        config: { stitch: true },
      }),
    });

    if (!create.ok) throw new Error("Create talk failed: " + (await create.text()));
    const { id } = await create.json();
    if (!id) throw new Error("No talk id returned");

    
    for (let tries = 0; tries < 60; tries++) {
      await new Promise((r) => setTimeout(r, 1500));
      const res = await fetch(`https://api.d-id.com/talks/${id}`, {
        headers: { Authorization: AUTH },
      });
      if (!res.ok) throw new Error("Status check failed: " + (await res.text()));
      const j = await res.json();
      if (j.status === "done" && j.result_url) return j.result_url;
      if (j.status === "error") throw new Error(j.error || "D-ID job error");
    }
    throw new Error("Timed out waiting for video");
  };

 
  const runBatch = async () => {
    setBusy(true);
    setUrls([]);
    setI(0);
    try {
      const out = [];
      for (let k = 0; k < QUESTIONS.length; k++) {
        setHint(`Generating ${k + 1}/${QUESTIONS.length}…`);
        const url = await makeVideo(QUESTIONS[k]);
        out.push(url);
      }
      setUrls(out);
      setHint("All videos ready!");
    } catch (e) {
      Alert.alert("Error", e?.message || String(e));
    } finally {
      setBusy(false);
      setHint("");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Avatar</Text>

        <Button
          title={busy ? "Preparing Videos…" : "Generate Question Videos"}
          onPress={runBatch}
          disabled={busy}
        />

        {busy && (
          <View style={styles.center}>
            <ActivityIndicator style={{ marginTop: 16 }} />
            {!!hint && <Text style={styles.status}>{hint}</Text>}
          </View>
        )}

        {urls.length > 0 && (
          <View style={{ marginTop: 16, width: "100%" }}>
            <Text style={styles.counter}>
              Question {i + 1} of {urls.length}
            </Text>

           
            <Video
              source={{ uri: urls[i] }}
              style={{ width: "100%", height: 360, backgroundColor: "#000" }}
              controls
              resizeMode="contain"
              paused={false}
              onError={(e) => console.warn("video error", e)}
            />

            <View style={styles.row}>
              <Button title="Prev" onPress={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} />
              <Button
                title="Next"
                onPress={() => setI((n) => Math.min(urls.length - 1, n + 1))}
                disabled={i === urls.length - 1}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  title: { color: "#E5E7EB", fontSize: 20, fontWeight: "600", marginBottom: 12 },
  center: { alignItems: "center", justifyContent: "center" },
  status: { color: "#E5E7EB", marginTop: 8 },
  counter: { color: "#E5E7EB", textAlign: "center", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
});
