import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const TOOLS = [
  {
    id: "cv",
    icon: "document-text" as const,
    label: "Générateur de CV",
    desc: "Créez un CV professionnel en quelques minutes",
    color: "#7C3AED",
    bg: "#EDE9FE",
    route: "/tools/cv",
  },
  {
    id: "devis",
    icon: "receipt" as const,
    label: "Créateur de Devis",
    desc: "Établissez des devis clairs et professionnels",
    color: "#0F52BA",
    bg: "#DBEAFE",
    route: "/tools/devis",
  },
  {
    id: "facture",
    icon: "cash" as const,
    label: "Générateur de Facture",
    desc: "Produisez des factures numérotées automatiquement",
    color: "#10B981",
    bg: "#D1FAE5",
    route: "/tools/facture",
  },
];

const TIPS = [
  "Un CV bien structuré augmente vos chances de 60%",
  "Incluez toujours vos tarifs dans vos devis pour éviter les malentendus",
  "Une facture numérotée vous protège juridiquement",
];

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Outils Pro</Text>
          <Text style={styles.headerSub}>Tous les outils du professionnel moderne</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.introBadge}>
            <Ionicons name="briefcase" size={16} color="#FF6B00" />
            <Text style={styles.introBadgeText}>Conçu pour les professionnels Hawtrix</Text>
          </View>
          <Text style={styles.introText}>
            Gérez votre activité professionnelle efficacement. Créez des documents de qualité, envoyez-les à vos clients et développez votre réputation.
          </Text>
        </View>

        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.toolCard}
            onPress={() => router.push(tool.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.toolIcon, { backgroundColor: tool.bg }]}>
              <Ionicons name={tool.icon} size={28} color={tool.color} />
            </View>
            <View style={styles.toolInfo}>
              <Text style={styles.toolLabel}>{tool.label}</Text>
              <Text style={styles.toolDesc}>{tool.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Conseils Pro</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.comingSoon}>
          <Ionicons name="construct" size={32} color="#FF6B00" />
          <Text style={styles.comingSoonTitle}>Bientôt disponible</Text>
          <Text style={styles.comingSoonText}>Calculateur de tarifs • Contrats • Portfolio en ligne • Agenda professionnel</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginBottom: 16 },
  headerContent: {},
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4, fontFamily: "Inter_400Regular" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  intro: { marginBottom: 24 },
  introBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FFF3E0", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, alignSelf: "flex-start", marginBottom: 12,
  },
  introBadgeText: { fontSize: 13, color: "#FF6B00", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  introText: { fontSize: 14, color: "#4B5563", lineHeight: 22, fontFamily: "Inter_400Regular" },
  toolCard: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18,
    marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toolIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  toolInfo: { flex: 1 },
  toolLabel: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  toolDesc: { fontSize: 13, color: "#6B7280", marginTop: 3, fontFamily: "Inter_400Regular" },
  tipsSection: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18, marginTop: 8, marginBottom: 16 },
  tipsTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", marginBottom: 14, fontFamily: "Inter_700Bold" },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF6B00", marginTop: 7 },
  tipText: { flex: 1, fontSize: 13, color: "#4B5563", lineHeight: 20, fontFamily: "Inter_400Regular" },
  comingSoon: {
    alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24,
    borderWidth: 2, borderColor: "#FFF3E0", borderStyle: "dashed",
  },
  comingSoonTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", marginTop: 10, marginBottom: 6, fontFamily: "Inter_700Bold" },
  comingSoonText: { fontSize: 12, color: "#6B7280", textAlign: "center", lineHeight: 20, fontFamily: "Inter_400Regular" },
});
