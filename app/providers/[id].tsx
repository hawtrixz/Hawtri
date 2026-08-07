import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderDetailScreen() {
  const params = useLocalSearchParams<{ id: string; name: string; profession: string; neighborhood: string; city: string; rating: string; reviews: string; available: string; experience: string; phone: string }>();
  const { getOrCreateConversation } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const rating = parseFloat(params.rating ?? "4.5");
  const reviews = parseInt(params.reviews ?? "0");
  const isAvailable = params.available === "true";

  const handleMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const convId = getOrCreateConversation(params.id ?? "", params.name ?? "Prestataire");
    router.push({ pathname: "/messages/[id]", params: { id: convId, name: params.name } });
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Appeler", `Appelez ${params.name}\n${params.phone}`, [
      { text: "Annuler", style: "cancel" },
      { text: "Appeler", onPress: () => {} },
    ]);
  };

  const handleQuote = () => {
    Alert.alert("Demande de devis", "Votre demande de devis a été envoyée à " + params.name + ". Vous serez contacté sous 24h.");
  };

  const SKILLS = ["Expérience confirmée", "Professionnel certifié", "Réactif", "Prix compétitifs", "Garantie travaux"];
  const SCHEDULE = ["Lun – Ven : 08h – 18h", "Samedi : 08h – 14h", "Dimanche : Sur rendez-vous"];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#1E293B"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil prestataire</Text>
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
          <Ionicons name="share-social" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: botPad + 120 }}>
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: isAvailable ? "#FF6B00" : "#9CA3AF" }]}>
            <Text style={styles.avatarText}>{(params.name ?? "?")[0]}</Text>
          </View>
          <Text style={styles.name}>{params.name}</Text>
          <Text style={styles.profession}>{params.profession}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#9CA3AF" />
            <Text style={styles.location}>{params.neighborhood}, {params.city}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, isAvailable ? styles.statusAvail : styles.statusUnavail]}>
              <View style={[styles.statusDot, { backgroundColor: isAvailable ? "#10B981" : "#EF4444" }]} />
              <Text style={[styles.statusText, { color: isAvailable ? "#065F46" : "#991B1B" }]}>
                {isAvailable ? "Disponible maintenant" : "Actuellement occupé"}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={styles.statVal}>{rating}</Text>
              <Text style={styles.statLbl}>Note</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="chatbubbles" size={18} color="#3B82F6" />
              <Text style={styles.statVal}>{reviews}</Text>
              <Text style={styles.statLbl}>Avis</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="briefcase" size={18} color="#10B981" />
              <Text style={styles.statVal}>{params.experience}</Text>
              <Text style={styles.statLbl}>Ans exp.</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compétences & Atouts</Text>
          <View style={styles.skillsWrap}>
            {SKILLS.map(s => (
              <View key={s} style={styles.skillChip}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.skillText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horaires de travail</Text>
          {SCHEDULE.map(s => (
            <View key={s} style={styles.scheduleRow}>
              <Ionicons name="time" size={16} color="#FF6B00" />
              <Text style={styles.scheduleText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact direct</Text>
          <View style={styles.contactRow}>
            <Ionicons name="phone-portrait" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{params.phone}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Avis clients ({reviews})</Text>
          {[
            { name: "K. Mawuli", rating: 5, text: "Excellent travail, très professionnel et ponctuel. Je recommande vivement !" },
            { name: "A. Foli", rating: 4, text: "Bon travail, tarif raisonnable. Quelques petits retards mais résultat final satisfaisant." },
            { name: "E. Dossou", rating: 5, text: "Parfait ! Rapide, efficace et honnête. N'hésitez pas à le contacter." },
          ].map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <View style={styles.reviewStars}>
                  {[...Array(5)].map((_, j) => (
                    <Ionicons key={j} name="star" size={12} color={j < r.rating ? "#F59E0B" : "#E5E7EB"} />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: botPad + 16 }]}>
        <TouchableOpacity style={styles.msgBtn} onPress={handleMessage} activeOpacity={0.85}>
          <Ionicons name="chatbubble" size={20} color="#FF6B00" />
          <Text style={styles.msgBtnText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quoteBtn} onPress={handleQuote} activeOpacity={0.85}>
          <Ionicons name="document-text" size={18} color="#FFFFFF" />
          <Text style={styles.quoteBtnText}>Devis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.85}>
          <Ionicons name="call" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  shareBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  profileCard: { backgroundColor: "#FFFFFF", margin: 16, borderRadius: 20, padding: 24, alignItems: "center", gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 36, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  name: { fontSize: 22, fontWeight: "800", color: "#0A1628", fontFamily: "Inter_700Bold" },
  profession: { fontSize: 15, color: "#FF6B00", fontFamily: "Inter_600SemiBold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 13, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  statusRow: { marginTop: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusAvail: { backgroundColor: "#D1FAE5" },
  statusUnavail: { backgroundColor: "#FEE2E2" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 24 },
  statItem: { alignItems: "center", gap: 4 },
  statVal: { fontSize: 18, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 32, backgroundColor: "#E5E7EB" },
  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  skillText: { fontSize: 12, color: "#065F46", fontFamily: "Inter_500Medium" },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  scheduleText: { fontSize: 14, color: "#374151", fontFamily: "Inter_400Regular" },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactText: { fontSize: 15, color: "#0A1628", fontFamily: "Inter_600SemiBold" },
  reviewCard: { backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12, gap: 6 },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewName: { fontSize: 13, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewText: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular", lineHeight: 18 },
  actionBar: { flexDirection: "row", gap: 10, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  msgBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 2, borderColor: "#FF6B00" },
  msgBtnText: { fontSize: 15, fontWeight: "700", color: "#FF6B00", fontFamily: "Inter_700Bold" },
  quoteBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#0A1628", borderRadius: 14, paddingVertical: 14 },
  quoteBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  callBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center" },
});
