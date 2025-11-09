// app/(tabs)/facesim_webview.tsx
import React, { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Platform, StatusBar, Alert } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { printImage } from "../controllers/facesim_controller";
import { Link } from "expo-router";

const HOST_URL = "https://facial-sim.onrender.com";

export default function FaceSimWebView() {
  const webviewRef = useRef<WebView | null>(null);
  let isPrinting = false;

  const injectedJS = `
    (function() {
      function post(obj){ window.ReactNativeWebView.postMessage(JSON.stringify(obj)); }
      if (!window._originalPrint) window._originalPrint = window.print;
      window.print = function(){
        var img=document.querySelector('#print-area img');
        post({type:'print-request', src: img ? img.src : null});
      };
      var btn=document.querySelector('#print-btn');
      if(btn){
        btn.onclick=function(ev){ev.preventDefault();window.print();};
      }
      post({type:'bridge-ready'});
    })();
    true;
  `;

  async function handleWebViewMessage(e: WebViewMessageEvent) {
    let msg: any = null;
    try {
      msg = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }

    if (msg?.type === "print-request") {
      if (isPrinting) return;
      const imgSrc = msg.src;
      if (!imgSrc) return Alert.alert("No report found.");
      isPrinting = true;
      await printImage(imgSrc);
      setTimeout(() => (isPrinting = false), 1500);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>FaceSim WebView</Text>
      </View>
      <WebView
        ref={webviewRef}
        source={{ uri: HOST_URL }}
        injectedJavaScript={injectedJS}
        onMessage={handleWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowsInlineMediaPlayback
        startInLoadingState
        style={{ flex: 1 }}
      />
      <View style={{ padding: 12 }}>
        <Link href="/facesim_native">→ Switch to Native Mode</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  header: { padding: 12, borderBottomWidth: 1, borderColor: "#ddd" },
  title: { fontSize: 18, fontWeight: "600" },
});
