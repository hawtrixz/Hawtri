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
  const { conversations, user } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

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
            <Ionicons name="chatbubbles-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptySub}>Contactez un prestataire depuis l'annuaire pour commencer à discuter</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/(tabs)/explore")} activeOpacity={0.8}>
              <Text style={styles.emptyBtnText}>Trouver un prestataire</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.convCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/messages/[id]", params: { id: item.id, name: item.participantName } }); }}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.participantName[0]}</Text>
            </View>
            <View style={styles.convBody}>
              <View style={styles.convTop}>
                <Text style={styles.convName}>{item.participantName}</Text>
                <Text style={styles.convTime}>{timeAgo(item.lastTimestamp)}</Text>
              </View>
              <View style={styles.convBottom}>
                <Text style={styles.convLast} numberOfLines={1}>{item.lastMessage || "Nouvelle conversation"}</Text>
                {item.unread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  composeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  convCard: { flexDirection: "row", backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 14, gap: 12, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F5F6FA" },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  convBody: { flex: 1, gap: 4 },
  convTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  convName: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  convTime: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  convBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  convLast: { flex: 1, fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular" },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  unreadText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  emptyBtn: { backgroundColor: "#FF6B00", borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
