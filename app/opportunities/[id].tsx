// app/opportunities/[id].tsx
//
// Hawtrix 2.86 — détail d'une opportunité OFFICIELLE
// ---------------------------------------------------------------
// - Données réelles datées : data/opportunities.ts (url, applyInfo,
//   edition).
// - "Voir l'offre officielle" ouvre le site de l'organisme dans le
//   navigateur (WebBrowser) : plus aucune "candidature simulée" en
//   interne.
// - Écran protégé par OfflineGate (strictement en ligne).

import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OPPORTUNITIES, TYPE_META } from "@/data/opportunities";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import OfflineGate from "@/components/OfflineGate";
import { isOnline } from "@/utils/network";

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const opp = OPPORTUNITIES.find(o => o.id === id);
  if (!opp) return null;

  const meta = TYPE_META[opp.type] ?? { icon: "star", color: "#FF6B00" };

  const handleOpenOfficial = async () => {
    if (!(await isOnline())) {
      Alert.alert("Connexion requise", "L'ouverture de l'offre officielle nécessite une connexion Internet.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await WebBrowser.openBrowserAsync(opp.url);
    } catch {
      Alert.alert("Impossible d'ouvrir", "La page officielle n'a pas pu s'ouvrir. Vérifiez votre connexion et réessayez.");
    }
  };

  return (
    <OfflineGate title="Offre officielle en ligne">
      <View style={[styles.container, { paddingTop: topPad }]}>
        <LinearGradient colors={[opp.color, opp.color + "99", "#0A1628"]} style={styles.hero}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={[styles.typeIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name={meta.icon as any} size={36} color="#FFFFFF" />
            </View>
            <View style={[styles.typeBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={styles.typeText}>{opp.type}</Text>
            </View>
            <Text style={styles.heroTitle}>{opp.title}</Text>
            <View style={styles.orgRow}>
              <Ionicons name="business" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.orgText}>{opp.org}</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: botPad + 120 }}>
          <View style={styles.infoStrip}>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={16} color="#FF6B00" />
              <Text style={styles.infoText}>{opp.country}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={16} color="#FF6B00" />
              <Text style={styles.infoText}>Limite : {opp.deadline}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.editionChip}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={styles.editionText}>Offre vérifiée — {opp.edition}</Text>
            </View>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.cardContent}>{opp.description}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Conditions requises</Text>
            <Text style={styles.cardContent}>{opp.requirements}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Comment postuler / s'informer</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="link" size={16} color="#FF6B00" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Site officiel</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{opp.url}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="help-circle" size={16} color="#FF6B00" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Procédure officielle</Text>
                <Text style={styles.infoValue}>{opp.applyInfo}</Text>
              </View>
            </View>
          </View>

          <View style={styles.alertCard}>
            <Ionicons name="information-circle" size={20} color="#0F52BA" />
            <Text style={styles.alertText}>La candidature se fait exclusivement sur le site officiel de l'organisme. Vérifiez toujours la date limite et l'adresse du site avant de transmettre vos documents.</Text>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: botPad + 16 }]}>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8}>
            <Ionicons name="bookmark-outline" size={22} color="#FF6B00" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: opp.color }]} onPress={handleOpenOfficial} activeOpacity={0.85}>
            <Ionicons name="open-outline" size={18} color="#FFFFFF" />
            <Text style={styles.applyBtnText}>Voir l'offre officielle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </OfflineGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  hero: { paddingHorizontal: 16, paddingBottom: 24 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginTop: 8 },
  heroContent: { gap: 10 },
  typeIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  typeText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold", lineHeight: 29 },
  orgRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  orgText: { fontSize: 14, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium" },
  scroll: { flex: 1 },
  infoStrip: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24, backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 14 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 13, fontWeight: "600", color: "#374151", fontFamily: "Inter_600SemiBold" },
  infoDivider: { width: 1, height: 20, backgroundColor: "#E5E7EB" },
  card: { marginHorizontal: 16, marginTop: 10, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10 },
  editionChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#ECFDF5", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" },
  editionText: { fontSize: 12, fontWeight: "700", color: "#059669", fontFamily: "Inter_700Bold" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  cardContent: { fontSize: 14, color: "#374151", lineHeight: 22, fontFamily: "Inter_400Regular" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#FFF1E6", alignItems: "center", justifyContent: "center" },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#0A1628", fontFamily: "Inter_600SemiBold" },
  alertCard: { flexDirection: "row", gap: 10, backgroundColor: "#EFF6FF", borderRadius: 14, padding: 14, marginHorizontal: 16, marginTop: 10, alignItems: "flex-start" },
  alertText: { flex: 1, fontSize: 13, color: "#1E40AF", fontFamily: "Inter_400Regular", lineHeight: 19 },
  bottomBar: { flexDirection: "row", gap: 12, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F0F0F0", alignItems: "center" },
  saveBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 2, borderColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  applyBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 16 },
  applyBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
