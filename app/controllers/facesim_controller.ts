// controllers/facesim_controller.ts
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

export async function printImage(base64Uri: string) {
  if (!base64Uri) return Alert.alert("No image", "Please pick or generate an image first.");
  try {
    await Print.printAsync({
      html: `<html><body style="margin:0"><img src="${base64Uri}" style="width:100%;height:auto" /></body></html>`,
    });
  } catch (e: any) {
    Alert.alert("Print failed", e.message || String(e));
  }
}

export async function shareImage(base64Uri: string) {
  if (!base64Uri) return Alert.alert("No image", "Please pick or generate an image first.");
  try {
    const base64 = base64Uri.split(",")[1];
    const file = `${FileSystem.cacheDirectory}facesim_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(file, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file, { mimeType: "image/png" });
    } else {
      Alert.alert("Sharing not available on this device.");
    }
  } catch (e: any) {
    Alert.alert("Share failed", e.message || String(e));
  }
}
