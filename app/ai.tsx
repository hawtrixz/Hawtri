import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

interface Message { id: string; role: "user" | "ai"; text: string; timestamp: string }

const AI_RESPONSES: Record<string, string> = {
  "bonjour": "Bonjour ! Je suis l'IA Hawtrix, votre assistant personnel. Je peux vous aider à trouver des prestataires, des formations, des opportunités, ou répondre à toutes vos questions sur l'application. Comment puis-je vous aider ?",
  "prestataire": "Pour trouver un prestataire, rendez-vous dans l'onglet 'Prestataires' (icône loupe). Vous pouvez filtrer par métier, quartier, disponibilité et noter vos expériences. Vous pouvez aussi les contacter directement via la messagerie intégrée.",
  "formation": "Hawtrix propose plus de 12 formations sur : Trading, Crypto, Développement web, IA, Marketing digital, Entrepreneuriat, Graphisme, Comptabilité, Agriculture, Électricité, et plus encore. Chaque formation délivre un certificat Hawtrix.",
  "opportunité": "La section Opportunités contient des offres d'emploi, stages, bourses d'études (françaises, chinoises, CEDEAO...), concours de la fonction publique, financements FAIEJ, et événements professionnels au Togo et en Afrique.",
  "réseau": "Votre réseau Hawtrix vous permet de gagner des revenus en invitant des membres. Plus votre réseau grandit, plus votre grade augmente (Pionier, Saphir, Rubis, Émeraude, Magnat, Icône, Directeur). Chaque grade apporte de nouveaux avantages.",
  "grade": "Les grades Hawtrix récompensent la croissance de votre réseau : Pionier (10 membres), Saphir (35), Rubis (100), Émeraude (250), Magnat (500), Icône (1000), Directeur (10 000). Chaque grade donne accès à une carte numérique plus élégante.",
  "paiement": "L'inscription sur Hawtrix nécessite un paiement unique de 2 000 FCFA via TMoney ou Flooz. Ce paiement donne un accès à vie à toute la plateforme.",
  "cv": "Je peux vous aider à créer votre CV ! Commencez par me donner vos informations : nom, formation, expériences professionnelles, compétences, et langues parlées. Je vous guiderai pour rédiger un CV professionnel.",
  "aide": "Je peux vous aider avec :\n• Trouver un prestataire de service\n• Choisir une formation adaptée\n• Découvrir des opportunités\n• Comprendre le système de réseau\n• Créer votre CV\n• Naviguer dans l'application\n\nQue souhaitez-vous faire ?",
  "développement": "La section Développement Personnel de Hawtrix propose chaque jour des vidéos motivantes, citations inspirantes, conseils de leadership, entrepreneuriat, discipline, et finances personnelles. Le contenu est renouvelé quotidiennement.",
  "sécurité": "Hawtrix assure la sécurité de votre compte via une authentification par SMS, le chiffrement de vos données, et des sauvegardes automatiques. Vos informations personnelles sont protégées.",
  "default": "Je comprends votre question. En tant qu'assistant IA de Hawtrix, je peux vous aider avec les prestataires, les formations, les opportunités, votre réseau, ou la navigation dans l'application. Pouvez-vous me donner plus de détails ?"
};

function getAIResponse(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return AI_RESPONSES["default"];
}

const SUGGESTIONS = ["Trouver un électricien", "Formations disponibles", "Opportunités emploi", "Mon grade réseau", "Créer mon CV", "Comment gagner ?"];

export default function AIScreen() {
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "ai", text: `Bonjour ${user?.surname ?? ""}! Je suis l'IA Hawtrix. Je peux vous aider à trouver des prestataires, des formations, des opportunités, ou répondre à toutes vos questions. Comment puis-je vous aider aujourd'hui ?`, timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", text: getAIResponse(text), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, aiMsg]);
    setTyping(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
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
            <Text style={styles.headerSub}>{typing ? "En train d'écrire..." : "En ligne"}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={typing ? (
          <View style={[styles.bubble, styles.aiBubble, { flexDirection: "row", gap: 4, alignItems: "center", paddingVertical: 14 }]}>
            {[0, 1, 2].map(i => <View key={i} style={[styles.typingDot, { opacity: 0.4 + i * 0.3 }]} />)}
          </View>
        ) : null}
        renderItem={({ item }) => (
          <View style={item.role === "user" ? styles.userRow : styles.aiRow}>
            {item.role === "ai" && (
              <View style={styles.aiIcon}><Ionicons name="sparkles" size={14} color="#7C3AED" /></View>
            )}
            <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.aiBubble]}>
              <Text style={item.role === "user" ? styles.userText : styles.aiText}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      {messages.length === 1 && (
        <View style={styles.suggestionsRow}>
          <FlatList
            horizontal
            data={SUGGESTIONS}
            keyExtractor={s => s}
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
            placeholder="Posez votre question..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#7C3AED", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  userRow: { flexDirection: "row", justifyContent: "flex-end" },
  aiRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  aiIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubble: { maxWidth: "80%", borderRadius: 18, padding: 14 },
  userBubble: { backgroundColor: "#FF6B00", borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 4 },
  userText: { fontSize: 15, color: "#FFFFFF", fontFamily: "Inter_400Regular", lineHeight: 21 },
  aiText: { fontSize: 15, color: "#0A1628", fontFamily: "Inter_400Regular", lineHeight: 21 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#9CA3AF" },
  suggestionsRow: { paddingVertical: 8 },
  suggChip: { backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: "#E5E7EB" },
  suggChipText: { fontSize: 13, color: "#374151", fontFamily: "Inter_500Medium" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  input: { flex: 1, backgroundColor: "#F5F6FA", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: "#0A1628", fontFamily: "Inter_400Regular", maxHeight: 100, borderWidth: 1, borderColor: "#E5E7EB" },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#FDA96A" },
});
