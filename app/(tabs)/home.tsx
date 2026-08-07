import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, GRADE_INFO } from "@/context/AppContext";
import { OPPORTUNITIES } from "@/data/opportunities";
import { TRAININGS } from "@/data/trainings";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIES = [
  { icon: "build", label: "Électricité", color: "#F59E0B" },
  { icon: "water", label: "Plomberie", color: "#3B82F6" },
  { icon: "laptop", label: "Informatique", color: "#8B5CF6" },
  { icon: "cut", label: "Coiffure", color: "#EC4899" },
  { icon: "car", label: "Mécanique", color: "#EF4444" },
  { icon: "construct", label: "Maçonnerie", color: "#92400E" },
  { icon: "phone-portrait", label: "Réparation Tel", color: "#10B981" },
  { icon: "restaurant", label: "Restauration", color: "#FF6B00" },
];

const QUICK_ACTIONS = [
  { icon: "sparkles", label: "IA Hawtrix", color: "#7C3AED", route: "/ai" },
  { icon: "people", label: "Réseau", color: "#FF6B00", route: "/network" },
  { icon: "briefcase", label: "Outils Pro", color: "#10B981", route: "/tools" },
  { icon: "chatbubbles", label: "Messages", color: "#0F52BA", route: "/messages" },
  { icon: "trending-up", label: "Dev. perso", color: "#059669", route: "/development" },
  { icon: "map", label: "Carte", color: "#EF4444", route: "/map" },
];

// Vraies opportunités officielles (liens et dates vérifiés)
const SAMPLE_OPPORTUNITIES = OPPORTUNITIES.slice(0, 3);

// Vraies formations officielles avec plateformes réelles
const SAMPLE_TRAININGS = TRAININGS.slice(0, 3);

const TRAIN_TYPE_COLOR: Record<string, string> = { "Bourse": "#8B5CF6", "Concours": "#EF4444", "Stage": "#FF6B00", "Emploi": "#10B981", "Financement": "#059669", "Événement": "#7C3AED" };

export default function HomeScreen() {
  const { user, notifications } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const unread = notifications.filter(n => !n.read).length;
  const gradeInfo = user ? GRADE_INFO[user.grade] : null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.surname ?? "Membre"} {user?.name ?? ""}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push("/notifications")} activeOpacity={0.7}>
              <Ionicons name="notifications" size={22} color="#FFFFFF" />
              {unread > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unread}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.7}>
              <View style={[styles.avatar, { backgroundColor: gradeInfo?.color ?? "#FF6B00" }]}>
                <Text style={styles.avatarText}>{(user?.surname?.[0] ?? "H").toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {gradeInfo && user?.grade !== "membre" && (
          <TouchableOpacity style={[styles.gradePill, { backgroundColor: gradeInfo.color + "25", borderColor: gradeInfo.color + "50" }]} onPress={() => router.push("/network")} activeOpacity={0.8}>
            <Ionicons name="ribbon" size={14} color={gradeInfo.color} />
            <Text style={[styles.gradeText, { color: gradeInfo.color }]}>{gradeInfo.label} · {user?.networkCount ?? 0} membres</Text>
          </TouchableOpacity>
        )}

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un prestataire, service..."
            placeholderTextColor="#9CA3AF"
            onFocus={() => router.push("/(tabs)/explore")}
          />
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <Ionicons name="options" size={18} color="#FF6B00" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map(a => (
            <TouchableOpacity
              key={a.label}
              style={styles.quickCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(a.route as any); }}
              activeOpacity={0.8}
            >
              <LinearGradient colors={[a.color + "20", a.color + "10"]} style={styles.quickGrad}>
                <View style={[styles.quickIcon, { backgroundColor: a.color }]}>
                  <Ionicons name={a.icon as any} size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories de services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c.label} style={styles.catCard} onPress={() => router.push({ pathname: "/(tabs)/explore", params: { category: c.label } })} activeOpacity={0.8}>
                <View style={[styles.catIcon, { backgroundColor: c.color + "20" }]}>
                  <Ionicons name={c.icon as any} size={24} color={c.color} />
                </View>
                <Text style={styles.catLabel}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Opportunités du jour</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/opportunities")} activeOpacity={0.7}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {SAMPLE_OPPORTUNITIES.map(o => (
            <TouchableOpacity key={o.id} style={styles.oppCard} onPress={() => router.push({ pathname: "/opportunities/[id]", params: { id: o.id } })} activeOpacity={0.8}>
              <View style={[styles.oppBadge, { backgroundColor: (TRAIN_TYPE_COLOR[o.type] ?? "#10B981") + "20" }]}>
                <Text style={[styles.oppBadgeText, { color: TRAIN_TYPE_COLOR[o.type] ?? "#10B981" }]}>{o.type}</Text>
              </View>
              <View style={styles.oppInfo}>
                <Text style={styles.oppTitle} numberOfLines={1}>{o.title}</Text>
                <Text style={styles.oppMeta}>{o.org} · {o.deadline}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Formations populaires</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/training")} activeOpacity={0.7}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {SAMPLE_TRAININGS.map(t => (
              <TouchableOpacity key={t.id} style={styles.trainCard} onPress={() => router.push({ pathname: "/training/[id]", params: { id: t.id } })} activeOpacity={0.8}>
                <LinearGradient colors={[t.color, t.color + "BB"]} style={styles.trainGrad}>
                  <Ionicons name={t.icon as any} size={32} color="#FFFFFF" />
                  <Text style={styles.trainTitle}>{t.title}</Text>
                  <Text style={styles.trainPlatform}>{t.platform}</Text>
                  <View style={styles.trainMeta}>
                    <Text style={styles.trainMetaText}>{t.level}</Text>
                    <Text style={styles.trainMetaText}>· {t.duration}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.devBanner} onPress={() => router.push("/development")} activeOpacity={0.85}>
          <LinearGradient colors={["#059669", "#065F46"]} style={styles.devBannerGrad}>
            <View>
              <Text style={styles.devBannerTitle}>Développement personnel</Text>
              <Text style={styles.devBannerSub}>Contenu motivant mis à jour quotidiennement</Text>
            </View>
            <Ionicons name="trending-up" size={40} color="rgba(255,255,255,0.4)" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { fontSize: 13, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  userName: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  notifBtn: { position: "relative", width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  notifBadge: { position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  notifBadgeText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  gradePill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  gradeText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, height: 46, fontSize: 14, color: "#FFFFFF", fontFamily: "Inter_400Regular" },
  filterBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  quickCard: { width: "30.5%", borderRadius: 16, overflow: "hidden" },
  quickGrad: { padding: 14, alignItems: "center", gap: 8 },
  quickIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 11, fontWeight: "600", color: "#374151", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", marginBottom: 12 },
  seeAll: { fontSize: 13, color: "#FF6B00", fontFamily: "Inter_600SemiBold" },
  catCard: { alignItems: "center", gap: 8, width: 72 },
  catIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  catLabel: { fontSize: 11, color: "#374151", fontFamily: "Inter_500Medium", textAlign: "center" },
  oppCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, marginBottom: 8, gap: 12 },
  oppBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  oppBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  oppInfo: { flex: 1 },
  oppTitle: { fontSize: 14, fontWeight: "600", color: "#0A1628", fontFamily: "Inter_600SemiBold" },
  oppMeta: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 2 },
  trainCard: { width: 200, borderRadius: 18, overflow: "hidden" },
  trainGrad: { padding: 20, gap: 10, minHeight: 160 },
  trainTitle: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", lineHeight: 20 },
  trainMeta: { flexDirection: "row", gap: 4 },
  trainMetaText: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_400Regular" },
  trainPlatform: { fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium", marginTop: 2 },
  devBanner: { marginHorizontal: 16, marginBottom: 24, borderRadius: 18, overflow: "hidden" },
  devBannerGrad: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
  devBannerTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  devBannerSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", marginTop: 4 },
});
