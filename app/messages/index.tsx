import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Maintenant";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function MessagesScreen() {
  const { conversations, user, refreshConversations } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  // Rafraîchir la liste des conversations depuis le serveur au chargement
  // puis toutes les 5 secondes afin de voir les nouveaux messages et non-lus.
  useEffect(() => {
    let active = true;
    const poll = async () => {
      while (active) {
        try {
          await refreshConversations();
        } catch {
          // Le serveur est temporairement injoignable : on retentera au prochain cycle.
        }
        await new Promise(r => setTimeout(r, 5000));
      }
    };
    poll();
    return () => { active = false; };
  }, [refreshConversations]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnread > 0 && <Text style={styles.headerSub}>{totalUnread} message{totalUnread > 1 ? "s" : ""} non lu{totalUnread > 1 ? "s" : ""}</Text>}
        </View>
        <TouchableOpacity style={styles.composeBtn} onPress={() => router.push("/(tabs)/explore")} activeOpacity={0.7}>
          <Ionicons name="create" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={conversations}
        keyExtractor={c => c.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptySub}>Explorez le réseau et démarrez votre première conversation</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: "/messages/[id]", params: { id: item.id, name: item.participantName } })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.participantName || "?")[0]}</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>{item.participantName}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage || "Nouveau message"}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.time}>{timeAgo(item.lastTimestamp)}</Text>
              {item.unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{item.unread > 99 ? "99+" : item.unread}</Text></View>}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, color: "#10B981", fontFamily: "Inter_400Regular" },
  composeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", marginHorizontal: 12, marginVertical: 4, borderRadius: 16, gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  lastMessage: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular", marginTop: 2 },
  meta: { alignItems: "flex-end", gap: 6 },
  time: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  empty: { paddingTop: 80, alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, color: "#9CA3AF", fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
});
