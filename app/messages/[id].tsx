import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

function timeStr(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { user, conversations, sendMessage, markConversationRead } = useApp();
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const conv = conversations.find(c => c.id === id);
  const messages = conv?.messages ?? [];

  const handleSend = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(id ?? "", input.trim());
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(name ?? "?")[0]}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerSub}>En ligne</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} activeOpacity={0.7}>
          <Ionicons name="call" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Démarrez la conversation avec {name}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.id || item.senderId === "me";
          return (
            <View style={isMe ? styles.myRow : styles.theirRow}>
              <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                <Text style={isMe ? styles.myText : styles.theirText}>{item.text}</Text>
                <Text style={isMe ? styles.myTime : styles.theirTime}>{timeStr(item.timestamp)}</Text>
              </View>
            </View>
          );
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.inputBar, { paddingBottom: botPad + 12 }]}>
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
            <Ionicons name="attach" size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Écrivez un message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.micBtn} activeOpacity={0.7}>
            <Ionicons name="mic" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerName: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 11, color: "#10B981", fontFamily: "Inter_400Regular" },
  callBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  myRow: { flexDirection: "row", justifyContent: "flex-end" },
  theirRow: { flexDirection: "row" },
  bubble: { maxWidth: "78%", borderRadius: 18, padding: 12 },
  myBubble: { backgroundColor: "#FF6B00", borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 4 },
  myText: { fontSize: 15, color: "#FFFFFF", fontFamily: "Inter_400Regular", lineHeight: 20 },
  theirText: { fontSize: 15, color: "#0A1628", fontFamily: "Inter_400Regular", lineHeight: 20 },
  myTime: { fontSize: 10, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "right" },
  theirTime: { fontSize: 10, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 4 },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 10, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  attachBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, backgroundColor: "#F5F6FA", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: "#0A1628", fontFamily: "Inter_400Regular", maxHeight: 100, borderWidth: 1, borderColor: "#E5E7EB" },
  micBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#FDA96A" },
});
