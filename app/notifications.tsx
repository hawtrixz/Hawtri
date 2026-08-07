import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const TYPE_META = {
  mlm: { icon: "people", color: "#FF6B00" },
  training: { icon: "school", color: "#8B5CF6" },
  opportunity: { icon: "briefcase", color: "#10B981" },
  message: { icon: "chatbubble", color: "#3B82F6" },
  system: { icon: "notifications", color: "#6B7280" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return `Il y a ${Math.floor(hrs / 24)}j`;
}

export default function NotificationsScreen() {
  const { notifications, markNotificationRead } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && <Text style={styles.headerSub}>{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySub}>Vos notifications apparaîtront ici</Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type];
          return (
            <TouchableOpacity
              style={[styles.notifCard, !item.read && styles.notifCardUnread]}
              onPress={() => markNotificationRead(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.notifIcon, { backgroundColor: meta.color + "20" }]}>
                <Ionicons name={meta.icon as any} size={22} color={meta.color} />
              </View>
              <View style={styles.notifBody}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifText} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.notifTime}>{timeAgo(item.timestamp)}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, color: "#FF6B00", fontFamily: "Inter_400Regular" },
  notifCard: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, gap: 12, alignItems: "flex-start" },
  notifCardUnread: { backgroundColor: "#FFF8F5", borderLeftWidth: 3, borderLeftColor: "#FF6B00" },
  notifIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  notifBody: { flex: 1, gap: 3 },
  notifTitle: { fontSize: 14, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  notifText: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular", lineHeight: 18 },
  notifTime: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF6B00", marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151", fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
});
