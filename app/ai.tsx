import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

interface AIHistory {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Comment fonctionne Hawtrix ?",
  "Quelles formations choisir ?",
  "C'est quoi le statut Entrepreneur ?",
  "C'est quoi le statut Employé ?",
  "Comment gagner avec mon réseau ?",
  "Aide-moi à réussir",
];

export default function AIScreen() {
  const { user, backend } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "ai",
      text: `Salut ${user?.surname ? user.surname.split(" ")[0] : ""} ! Je suis l'IA Hawtrix, ton assistant personnel. Je connais toute la plateforme : formations, opportunités, profil professionnel, réseau et travail avec Hawtrix. Pose-moi ta question, je t'accompagne pas à pas.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [history, setHistory] = useState<AIHistory[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const sendMessage = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: clean,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setHistory((prev) => [...prev, { role: "user", text: clean }]);

    try {
      const data = await backend.aiChat(clean, history);
      const reply = data?.reply || "Désolé, je n'ai pas pu te répondre. Réessaie dans un instant.";
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setHistory((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "Je n'arrive pas à joindre le serveur pour le moment. Vérifie ta connexion et réessaie, ou écris au support WhatsApp si le problème persiste.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>IA Hawtrix</Text>
            <Text style={styles.headerSub}>{loading ? "Réflexion..." : "En ligne"}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <View style={[styles.bubble, styles.aiBubble, { flexDirection: "row", gap: 4, alignItems: "center", paddingVertical: 14 }]}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.typingDot, { opacity: 0.4 + i * 0.3 }]} />
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={item.role === "user" ? styles.userRow : styles.aiRow}>
            {item.role === "ai" && (
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles" size={14} color="#7C3AED" />
              </View>
            )}
            <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.aiBubble]}>
              <Text style={item.role === "user" ? styles.userText : styles.aiText}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      {messages.length === 1 && !loading && (
        <View style={styles.suggestionsRow}>
          <FlatList
            horizontal
            data={SUGGESTIONS}
            keyExtractor={(s) => s}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggChip} onPress={() => sendMessage(item)} activeOpacity={0.8}>
                <Text style={styles.suggChipText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        <View style={[styles.inputBar, { paddingBottom: botPad + 12 }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pose ta question..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  userRow: { flexDirection: "row", justifyContent: "flex-end" },
  aiRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: { maxWidth: "80%", borderRadius: 18, padding: 14 },
  userBubble: { backgroundColor: "#FF6B00", borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 4 },
  userText: { fontSize: 15, color: "#FFFFFF", fontFamily: "Inter_400Regular", lineHeight: 21 },
  aiText: { fontSize: 15, color: "#0A1628", fontFamily: "Inter_400Regular", lineHeight: 21 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#9CA3AF" },
  suggestionsRow: { paddingVertical: 8 },
  suggChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  suggChipText: { fontSize: 13, color: "#374151", fontFamily: "Inter_500Medium" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0A1628",
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#FDA96A" },
});
