// app/(tabs)/facesim_native.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { printImage, shareImage } from "../controllers/facesim_controller";
import { Link } from "expo-router";

export default function FaceSimNative() {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [resultB64, setResultB64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function pickImageFromCamera() {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return Alert.alert("Permission required", "Camera access needed.");
      const res = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 });
      if (res.canceled || !res.assets?.length) return;
      const { uri, base64 } = res.assets[0];
      setLocalUri(uri);
      setResultB64(`data:image/jpeg;base64,${base64}`);
    } catch (err: any) {
      Alert.alert("Camera error", err.message || String(err));
    }
  }

  async function pickImageFromGallery() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert("Permission required", "Gallery access needed.");
      const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });
      if (res.canceled || !res.assets?.length) return;
      const { uri, base64 } = res.assets[0];
      setLocalUri(uri);
      setResultB64(`data:image/jpeg;base64,${base64}`);
    } catch (err: any) {
      Alert.alert("Gallery error", err.message || String(err));
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>FaceSim Native (Offline)</Text>
      </View>

      <View style={styles.controls}>
        <Button title="Take Photo" onPress={pickImageFromCamera} />
        <View style={{ width: 12 }} />
        <Button title="Pick Photo" onPress={pickImageFromGallery} />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {localUri && (
        <View style={styles.previewBox}>
          <Text style={styles.sub}>Preview</Text>
          <Image source={{ uri: localUri }} style={styles.preview} />
        </View>
      )}

      {resultB64 && (
        <View style={styles.previewBox}>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => printImage(resultB64)}>
              <Text style={styles.actionText}>Print</Text>
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity style={styles.actionBtn} onPress={() => shareImage(resultB64)}>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ padding: 12 }}>
        <Link href="/facesim_webview">← Back to WebView Mode</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "600" },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
  previewBox: { alignItems: "center", marginTop: 12 },
  preview: { width: 300, height: 400, resizeMode: "contain", borderWidth: 1, borderColor: "#ccc" },
  sub: { marginBottom: 8, fontWeight: "600" },
  actionBtn: { padding: 10, backgroundColor: "#007bff", borderRadius: 8 },
  actionText: { color: "#fff", fontWeight: "600" },
});
