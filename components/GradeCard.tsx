import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, View } from "react-native";
import { User, GRADE_INFO } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const CARD_GRADIENTS: Record<string, [string, string, string]> = {
  membre: ["#374151", "#1F2937", "#111827"],
  pionier: ["#92400E", "#78350F", "#451A03"],
  saphir: ["#1E3A8A", "#1D4ED8", "#1E40AF"],
  rubis: ["#7F1D1D", "#991B1B", "#B91C1C"],
  emeraude: ["#064E3B", "#065F46", "#047857"],
  magnat: ["#78350F", "#92400E", "#B45309"],
  icone: ["#4C1D95", "#5B21B6", "#6D28D9"],
  directeur: ["#7C2D12", "#C2410C", "#FF6B00"],
  president: ["#713F12", "#A16207", "#CA8A04"],
};

const PATTERNS: Record<string, string> = {
  membre: "●",
  pionier: "◆",
  saphir: "✦",
  rubis: "❋",
  emeraude: "⬡",
  magnat: "★",
  icone: "◈",
  directeur: "⬟",
  president: "♛",
};

export function GradeCard({ user }: { user: User }) {
  const gradeInfo = GRADE_INFO[user.grade];
  const gradients = CARD_GRADIENTS[user.grade];
  const pattern = PATTERNS[user.grade];
  const cardLevel = gradeInfo.cardLevel;

  return (
    <View style={styles.cardWrap}>
      <LinearGradient colors={gradients} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.watermarkRow}>
          {[...Array(6)].map((_, i) => (
            <Text key={i} style={styles.watermarkText}>HAWTRIX</Text>
          ))}
        </View>

        <View style={styles.cardTop}>
          <Image source={require("@/assets/images/icon.png")} style={styles.logoImg} resizeMode="contain" />
          <View style={[styles.levelBadge, { backgroundColor: gradeInfo.color + "30", borderColor: gradeInfo.color }]}>
            <Text style={[styles.levelText, { color: gradeInfo.color }]}>Niveau {cardLevel}</Text>
          </View>
        </View>

        <View style={styles.patternRow}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={[styles.patternChar, { opacity: 0.15 + i * 0.1 }]}>{pattern}</Text>
          ))}
        </View>

        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardName}>{user.surname} {user.name}</Text>
            <Text style={styles.cardCode}>{user.referralCode}</Text>
          </View>
          <View style={styles.gradeDisplay}>
            <Ionicons name="ribbon" size={18} color={gradeInfo.color} />
            <Text style={[styles.gradeName, { color: gradeInfo.color }]}>{gradeInfo.label.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.networkRow}>
          <Ionicons name="people" size={12} color="rgba(255,255,255,0.5)" />
          <Text style={styles.networkText}>{user.networkCount} membres</Text>
          <View style={styles.dot} />
          <Text style={styles.networkText}>Hawtrix</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 12 },
  card: { borderRadius: 20, padding: 20, gap: 12, overflow: "hidden", minHeight: 180 },
  watermarkRow: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0.06 },
  watermarkText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold", letterSpacing: 4 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoImg: { width: 70, height: 26 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  levelText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  patternRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  patternChar: { fontSize: 22, color: "#FFFFFF" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardName: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  cardCode: { fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_500Medium", letterSpacing: 1.5, marginTop: 2 },
  gradeDisplay: { flexDirection: "row", alignItems: "center", gap: 6 },
  gradeName: { fontSize: 14, fontWeight: "800", fontFamily: "Inter_700Bold" },
  networkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  networkText: { fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular" },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" },
});
