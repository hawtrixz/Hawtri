import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const TODAY = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

const DAILY_QUOTES = [
  { text: "Chaque petit progrès construit une grande réussite.", author: "Proverbe africain" },
  { text: "La discipline est le pont entre les objectifs et leur accomplissement.", author: "Jim Rohn" },
  { text: "La meilleure façon de prédire l'avenir est de le créer.", author: "Peter Drucker" },
  { text: "Un réseau solide se construit par la confiance, la constance et le partage.", author: "Hawtrix" },
  { text: "N'attendez pas d'être parfait pour commencer ; commencez pour progresser.", author: "Zig Ziglar" },
];

const VIDEOS = [
  { id: "1", title: "Les 5 habitudes des millionnaires africains", category: "Finance personnelle", duration: "12:34", views: "48K", color: "#F59E0B", icon: "cash" },
  { id: "2", title: "Comment développer une discipline de fer", category: "Discipline", duration: "18:21", views: "92K", color: "#EF4444", icon: "barbell" },
  { id: "3", title: "Leadership : Inspirer sans imposer", category: "Leadership", duration: "15:47", views: "67K", color: "#3B82F6", icon: "people" },
  { id: "4", title: "Gérer son argent intelligemment en Afrique", category: "Finance personnelle", duration: "22:09", views: "115K", color: "#10B981", icon: "wallet" },
  { id: "5", title: "Sortir de sa zone de confort en 21 jours", category: "Croissance personnelle", duration: "9:58", views: "230K", color: "#7C3AED", icon: "rocket" },
  { id: "6", title: "L'entrepreneuriat africain : défis et opportunités", category: "Entrepreneuriat", duration: "28:43", views: "81K", color: "#FF6B00", icon: "business" },
  { id: "7", title: "Maîtriser ses émotions pour réussir", category: "Intelligence émotionnelle", duration: "16:22", views: "54K", color: "#EC4899", icon: "heart" },
  { id: "8", title: "La puissance du réseau professionnel", category: "Réseau", duration: "11:15", views: "43K", color: "#0F52BA", icon: "git-network" },
];

const TIPS = [
  { icon: "time", text: "Planifiez vos 3 priorités du jour dès le matin", color: "#FF6B00" },
  { icon: "book", text: "Lisez 10 pages d'un livre inspirant chaque soir", color: "#3B82F6" },
  { icon: "water", text: "Commencez chaque journée par un verre d'eau", color: "#10B981" },
  { icon: "phone-portrait", text: "Réduisez votre temps d'écran passif de 30 minutes", color: "#7C3AED" },
  { icon: "walk", text: "30 minutes de marche quotidienne booste la créativité", color: "#F59E0B" },
];

const CATEGORIES_DEV = [
  { icon: "trending-up", label: "Réussite", color: "#10B981" },
  { icon: "cash", label: "Finances", color: "#F59E0B" },
  { icon: "people", label: "Leadership", color: "#3B82F6" },
  { icon: "rocket", label: "Entrepreneuriat", color: "#FF6B00" },
  { icon: "barbell", label: "Discipline", color: "#EF4444" },
  { icon: "heart", label: "Bien-être", color: "#EC4899" },
];

export default function DevelopmentScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
const now = new Date();
const dayKey = Math.floor(
  new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000
);
const dailyQuote = DAILY_QUOTES[
  ((dayKey % DAILY_QUOTES.length) + DAILY_QUOTES.length) % DAILY_QUOTES.length
];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#064E3B", "#065F46"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Développement Personnel</Text>
          <Text style={styles.headerDate}>{TODAY}</Text>
        </View>
        <View style={styles.refreshBadge}>
          <Ionicons name="refresh" size={14} color="#6EE7B7" />
          <Text style={styles.refreshText}>24h</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient colors={["#1F2937", "#111827"]} style={styles.quoteCard}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#FF6B00" />
          <Text style={styles.quoteText}>{DAILY_QUOTE.text}</Text>
          <View style={styles.quoteAuthor}>
            <View style={styles.quoteLine} />
            <Text style={styles.quoteAuthorText}>{DAILY_QUOTE.author}</Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thèmes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {CATEGORIES_DEV.map(c => (
              <TouchableOpacity key={c.label} style={styles.catChip} activeOpacity={0.8}>
                <Ionicons name={c.icon as any} size={16} color={c.color} />
                <Text style={[styles.catChipText, { color: c.color }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vidéos du jour</Text>
            <View style={styles.newBadge}><Text style={styles.newBadgeText}>NOUVEAU</Text></View>
          </View>
          {VIDEOS.map(v => (
            <TouchableOpacity key={v.id} style={styles.videoCard} activeOpacity={0.8}>
              <View style={[styles.videoThumb, { backgroundColor: v.color + "20" }]}>
                <Ionicons name={v.icon as any} size={28} color={v.color} />
                <View style={styles.playBtn}>
                  <Ionicons name="play" size={12} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoCategory}>{v.category}</Text>
                <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
                <View style={styles.videoMeta}>
                  <Ionicons name="time" size={12} color="#9CA3AF" />
                  <Text style={styles.videoMetaText}>{v.duration}</Text>
                  <Ionicons name="eye" size={12} color="#9CA3AF" style={{ marginLeft: 8 }} />
                  <Text style={styles.videoMetaText}>{v.views} vues</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conseils du jour</Text>
          {TIPS.map((t, i) => (
            <View key={i} style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: t.color + "20" }]}>
                <Ionicons name={t.icon as any} size={20} color={t.color} />
              </View>
              <Text style={styles.tipText}>{t.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerDate: { fontSize: 12, color: "#6EE7B7", fontFamily: "Inter_400Regular", textTransform: "capitalize" },
  refreshBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" },
  refreshText: { fontSize: 12, color: "#6EE7B7", fontFamily: "Inter_500Medium" },
  scroll: { flex: 1 },
  quoteCard: { margin: 16, borderRadius: 20, padding: 24, gap: 14 },
  quoteText: { fontSize: 16, color: "#FFFFFF", fontFamily: "Inter_400Regular", lineHeight: 26, fontStyle: "italic" },
  quoteAuthor: { flexDirection: "row", alignItems: "center", gap: 10 },
  quoteLine: { width: 24, height: 2, backgroundColor: "#FF6B00" },
  quoteAuthorText: { fontSize: 13, color: "#9CA3AF", fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 16, marginBottom: 20, gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  newBadge: { backgroundColor: "#FF6B00", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  newBadgeText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  catChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB" },
  catChipText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  videoCard: { flexDirection: "row", gap: 14, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, alignItems: "flex-start" },
  videoThumb: { width: 72, height: 72, borderRadius: 14, alignItems: "center", justifyContent: "center", position: "relative" },
  playBtn: { position: "absolute", bottom: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  videoInfo: { flex: 1, gap: 4 },
  videoCategory: { fontSize: 11, color: "#10B981", fontFamily: "Inter_600SemiBold" },
  videoTitle: { fontSize: 14, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", lineHeight: 19 },
  videoMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  videoMetaText: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  tipCard: { flexDirection: "row", gap: 12, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, alignItems: "center" },
  tipIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 14, color: "#374151", fontFamily: "Inter_400Regular", lineHeight: 20 },
});
