import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, GRADE_INFO } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { GradeCard } from "@/components/GradeCard";

export default function ProfileScreen() {
  const { user, logout, notifications } = useApp();
  
  const MENU_ITEMS = [
    { icon: "person-circle", label: "Modifier le profil", color: "#3B82F6", route: "/profile-edit" },
    { icon: "cash", label: "Retirer mes gains", color: "#10B981", route: "/withdraw" },
    { icon: "people", label: "Mon réseau & parrainage", color: "#FF6B00", route: "/network" },
    { icon: "notifications", label: "Notifications", color: "#F59E0B", route: "/notifications" },
    ...(user?.grade === "president" ? [{ icon: "settings", label: "Administration", color: "#EF4444", route: "/admin" }] : []),
    { icon: "shield-checkmark", label: "Sécurité du compte", color: "#10B981", route: null },
    { icon: "help-circle", label: "Support & Aide", color: "#8B5CF6", route: null },
    { icon: "information-circle", label: "À propos de Hawtrix", color: "#6B7280", route: null },
  ];
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const gradeInfo = user ? GRADE_INFO[user.grade] : GRADE_INFO["membre"];
  const unread = notifications.filter(n => !n.read).length;

  const nextGrade = user ? Object.entries(GRADE_INFO).find(([, info]) => info.minCount > (user.networkCount ?? 0)) : null;
  const progress = nextGrade && user ? Math.min((user.networkCount / nextGrade[1].minCount) * 100, 100) : 100;

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnecter", style: "destructive", onPress: async () => { await logout(); router.replace("/welcome"); } },
    ]);
  };

  const showAbout = () => {
    Alert.alert(
      "À propos de Hawtrix",
      "Hawtrix est un projet ambitieux conçu par un groupe d'entrepreneurs visionnaires, sous l'impulsion du DG Haweil et de ses collaborateurs. \n\nNotre mission est de permettre à chaque Africain de générer des revenus complémentaires et d'offrir à ceux qui le souhaitent vraiment l'opportunité de s'immerger totalement pour réussir leur vie, se bâtir un nom et obtenir un titre de prestige. \n\nHawtrix est plus qu'une application, c'est un tremplin vers votre succès. \n\nBonne chance à toutes et à tous dans cette aventure !",
      [{ text: "C'est parti !" }]
    );
  };

  const contactSupport = () => {
    const msg = `Bonjour, je suis ${user?.surname} ${user?.name} (ID: ${user?.referralCode}). J'ai besoin d'assistance sur Hawtrix.`;
    const url = `https://wa.me/22890496651?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };

  if (!user) return null;

  const MENU_ITEMS = [
    { icon: "person-circle", label: "Modifier le profil", color: "#3B82F6", route: "/profile-edit" },
    { icon: "cash", label: "Retirer mes gains", color: "#10B981", route: "/withdraw" },
    { icon: "people", label: "Mon réseau & parrainage", color: "#FF6B00", route: "/network" },
    { icon: "notifications", label: "Notifications", color: "#F59E0B", route: "/notifications" },
    ...(user?.grade === "president" ? [{ icon: "settings", label: "Administration", color: "#EF4444", route: "/admin" }] : []),
    { icon: "chatbox-ellipses", label: "IA Hawtrix (Support)", color: "#8B5CF6", route: "/ai" },
    { icon: "logo-whatsapp", label: "Contacter sur WhatsApp", color: "#25D366", action: contactSupport },
    { icon: "information-circle", label: "À propos de Hawtrix", color: "#6B7280", action: showAbout },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <TouchableOpacity onPress={() => router.push("/notifications")} style={styles.notifBtn} activeOpacity={0.7}>
            <Ionicons name="notifications" size={22} color="#FFFFFF" />
            {unread > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unread}</Text></View>}
          </TouchableOpacity>
        </View>
        <View style={styles.profileTop}>
          <View style={[styles.avatarLarge, { backgroundColor: gradeInfo.color }]}>
            <Text style={styles.avatarText}>{user.surname[0]?.toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.fullName}>{user.surname} {user.name}</Text>
              <View style={[styles.gradePill, { backgroundColor: gradeInfo.color + "30", borderColor: gradeInfo.color }]}>
                <Ionicons name="ribbon" size={11} color={gradeInfo.color} />
                <Text style={[styles.gradeText, { color: gradeInfo.color }]}>{gradeInfo.label}</Text>
              </View>
            </View>
            <Text style={styles.profession}>{user.profession}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color="#94A3B8" />
              <Text style={styles.location}>{user.neighborhood}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.statsRow}>
          {[
            { label: "Réseau", value: user.networkCount, icon: "people", color: "#FF6B00" },
            { label: "Gains", value: `${user.totalEarnings} F`, icon: "cash", color: "#10B981" },
            { label: "Grade", value: gradeInfo.label, icon: "ribbon", color: gradeInfo.color },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, typeof s.value === "string" && s.value.length > 8 ? styles.statValueSmall : {}]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma carte membre</Text>
          <GradeCard user={user} />
        </View>

        {nextGrade && !["president"].includes(user.grade) && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Objectif : {GRADE_INFO[nextGrade[0] as keyof typeof GRADE_INFO]?.label}</Text>
              <Text style={styles.progressCount}>{user.networkCount} / {nextGrade[1].minCount}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: gradeInfo.color }]} />
            </View>
            <Text style={styles.progressHint}>
              Encore <Text style={{ fontWeight: "700", color: "#FF6B00" }}>{nextGrade[1].minCount - user.networkCount}</Text> membres à inviter pour atteindre le rang de {GRADE_INFO[nextGrade[0] as keyof typeof GRADE_INFO]?.label}. Continuez vos efforts !
            </Text>
          </View>
        )}

        <View style={styles.referralCard}>
          <View style={styles.referralLeft}>
            <Text style={styles.referralLabel}>Mon code de parrainage</Text>
            <Text style={styles.referralCode}>{user.referralCode}</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert("Copié", "Code copié dans le presse-papier"); }} activeOpacity={0.7}>
            <Ionicons name="copy" size={20} color="#FF6B00" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={() => router.push("/network")} activeOpacity={0.8}>
            <Ionicons name="share-social" size={18} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>Partager</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, i === 0 && styles.menuItemFirst, i === MENU_ITEMS.length - 1 && styles.menuItemLast]}
              onPress={() => { 
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                if (item.action) item.action();
                else if (item.route) router.push(item.route as any); 
                else Alert.alert("Bientôt disponible", "Cette fonctionnalité arrive très prochainement."); 
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Hawtrix v2.86.0 · Togo</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  notifBtn: { position: "relative", width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  notifBadge: { position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  notifBadgeText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  profileTop: { flexDirection: "row", gap: 16, alignItems: "center" },
  avatarLarge: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 32, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  profileInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  fullName: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  gradePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  gradeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  profession: { fontSize: 14, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 13, color: "#64748B", fontFamily: "Inter_400Regular" },
  scroll: { flex: 1 },
  statsRow: { flexDirection: "row", padding: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, alignItems: "center", gap: 6 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  statValueSmall: { fontSize: 13 },
  statLabel: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  section: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", marginBottom: 12 },
  progressCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: 14, fontWeight: "600", color: "#0A1628", fontFamily: "Inter_600SemiBold" },
  progressCount: { fontSize: 13, color: "#FF6B00", fontFamily: "Inter_700Bold" },
  progressBar: { height: 8, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressHint: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  referralCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: "#0A1628", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  referralLeft: { flex: 1 },
  referralLabel: { fontSize: 12, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  referralCode: { fontSize: 20, fontWeight: "800", color: "#FF6B00", fontFamily: "Inter_700Bold", letterSpacing: 2 },
  copyBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FF6B00", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  shareBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  menuSection: { marginHorizontal: 16, marginBottom: 16, backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: "#F5F6FA" },
  menuItemFirst: { borderTopWidth: 0 },
  menuItemLast: {},
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: "#0A1628", fontFamily: "Inter_500Medium" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: "#FEE2E2", borderRadius: 14, paddingVertical: 14 },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#EF4444", fontFamily: "Inter_700Bold" },
  version: { textAlign: "center", fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginBottom: 8 },
});
