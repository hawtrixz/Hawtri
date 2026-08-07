// app/training/[id].tsx
//
// Hawtrix 2.86 — détail d'une formation RÉELLE
// ---------------------------------------------------------------
// L'écran présente la formation officielle puis ouvre le site de la
// plateforme (lien officiel) dans le navigateur du téléphone via
// "Suivre le cours". Il n'y a plus de leçons générées localement
// ni de contenu simulé : la formation se consomme sur la
// plateforme officielle, qui délivre son propre certificat.

import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TRAININGS, LEVEL_COLORS } from "@/data/trainings";
import OfflineGate from "@/components/OfflineGate";
import { networkErrorLabel } from "@/utils/network";

export default function TrainingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [error, setError] = useState<string | null>(null);

  const training = TRAININGS.find(t => t.id === id);
  if (!training) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A1628", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="alert-circle" size={48} color="#FF6B00" />
        <Text style={{ color: "#FFFFFF", fontSize: 16, marginTop: 12, fontFamily: "Inter_500Medium" }}>Formation introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, backgroundColor: "#FF6B00", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleStartCourse = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await WebBrowser.openBrowserAsync(training.url);
    } catch (err) {
      setError(networkErrorLabel(err));
    }
  };

  return (
    <OfflineGate title="Cours accessible en ligne uniquement">
      <View style={{ flex: 1, backgroundColor: "#F5F6FA", paddingTop: topPad }}>
        <LinearGradient colors={[training.color, training.color + "BB", "#0A1628"]} style={styles.heroBanner}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <Ionicons name={training.icon as any} size={48} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroTitle}>{training.title}</Text>
            <Text style={styles.heroInstructor}>{training.platform} · Par {training.instructor}</Text>
            <View style={styles.heroBadges}>
              <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[training.level] + "30", borderColor: LEVEL_COLORS[training.level] }]}>
                <Text style={[styles.levelText, { color: LEVEL_COLORS[training.level] }]}>{training.level}</Text>
              </View>
              <View style={styles.statBadge}>
                <Ionicons name="time" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statBadgeText}>{training.duration}</Text>
              </View>
              <View style={styles.statBadge}>
                <Ionicons name="ribbon" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statBadgeText}>{training.freeCertificate ? "Certificat gratuit" : "Certificat disponible"}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: botPad + 120 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>À propos de cette formation</Text>
            <Text style={styles.description}>{training.description}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Programme (modules de la plateforme)</Text>
            {training.modules.map((m, i) => (
              <View key={i} style={styles.moduleRow}>
                <View style={[styles.moduleNum, { backgroundColor: training.color }]}>
                  <Text style={styles.moduleNumTxt}>{i + 1}</Text>
                </View>
                <Text style={styles.moduleText}>{m}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Comment suivre ce cours</Text>
            <View style={styles.stepsRow}>
              <Ionicons name="open-outline" size={22} color={training.color} />
              <Text style={styles.stepsText}>Le cours se déroule sur <Text style={{ fontWeight: "700" }}>{training.platform}</Text> : créez un compte gratuit, suivez les modules et obtenez votre certificat officiel directement sur la plateforme.</Text>
            </View>
            <View style={[styles.linkCard, { backgroundColor: training.color + "10" }]}>
              <Ionicons name="link" size={18} color={training.color} />
              <Text style={styles.linkText} numberOfLines={2}>{training.url}</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: botPad + 16 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.freeLabel}>Formation officielle</Text>
            <Text style={styles.freeSub}>Ressource externe · {training.platform}</Text>
          </View>
          <TouchableOpacity style={[styles.enrollBtn, { backgroundColor: training.color }]} onPress={handleStartCourse} activeOpacity={0.85}>
            <Text style={styles.enrollBtnText}>Suivre le cours</Text>
            <Ionicons name="open-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </OfflineGate>
  );
}

const styles = StyleSheet.create({
  heroBanner: { paddingHorizontal: 16, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginTop: 8, marginBottom: 8 },
  heroContent: { gap: 8 },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold", lineHeight: 28 },
  heroInstructor: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },
  heroBadges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  levelText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statBadgeText: { fontSize: 11, color: "#FFFFFF", fontFamily: "Inter_400Regular" },
  scroll: { flex: 1 },
  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  description: { fontSize: 14, color: "#374151", lineHeight: 21, fontFamily: "Inter_400Regular" },
  moduleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  moduleNum: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  moduleNumTxt: { fontSize: 12, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  moduleText: { flex: 1, fontSize: 14, color: "#374151", fontFamily: "Inter_400Regular" },
  stepsRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  stepsText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 21, fontFamily: "Inter_400Regular" },
  linkCard: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 12 },
  linkText: { flex: 1, fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular" },
  errorCard: { flexDirection: "row", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 12, padding: 14, marginHorizontal: 16, marginTop: 10, alignItems: "center" },
  errorText: { flex: 1, fontSize: 13, color: "#B91C1C", fontFamily: "Inter_400Regular" },
  bottomBar: { flexDirection: "row", gap: 12, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F0F0F0", alignItems: "center" },
  freeLabel: { fontSize: 13, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  freeSub: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  enrollBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14 },
  enrollBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
