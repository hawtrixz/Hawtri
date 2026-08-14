import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, View } from "react-native";
import { User, GRADE_INFO } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const CARD_GRADIENTS: Record<string, [string, string, string]> = {
  membre: ["#4B5563", "#1F2937", "#111827"], pionier: ["#A96224", "#713F12", "#321506"], saphir: ["#2563EB", "#172554", "#07152E"], rubis: ["#DC2626", "#7F1D1D", "#310B0B"], emeraude: ["#10B981", "#064E3B", "#022C22"], magnat: ["#D4A017", "#78350F", "#2A1404"], icone: ["#A855F7", "#4C1D95", "#1E103A"], directeur: ["#FF8A00", "#9A3412", "#3B1105"], directeur2: ["#F4D35E", "#9A6700", "#3A2200"], directeur5: ["#FFF4A3", "#C28B18", "#4A2700"], president: ["#FFF7B0", "#C99718", "#4A2A00"],
};

export function GradeCard({ user }: { user: User }) {
  const gradeInfo = GRADE_INFO[user.grade];
  const gradients = CARD_GRADIENTS[user.grade] ?? CARD_GRADIENTS.membre;
  const isGold = ["magnat", "directeur2", "directeur5", "president"].includes(user.grade);
  const stars = Math.min(5, Math.max(1, gradeInfo.cardLevel));

  return (
    <View style={[styles.cardWrap, isGold && styles.goldShadow]}>
      <LinearGradient colors={gradients} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.glowOne} /><View style={styles.glowTwo} />
        <View style={styles.watermarkRow}>{[...Array(8)].map((_, i) => <Text key={i} style={styles.watermarkText}>HAWTRIX</Text>)}</View>
        <View style={styles.cardTop}>
          <View style={styles.brandRow}><Image source={require("@/assets/images/icon.png")} style={styles.logoImg} resizeMode="contain" /><View style={styles.brandDivider} /><Text style={styles.memberText}>MEMBER</Text></View>
          <View style={[styles.levelBadge, { borderColor: gradeInfo.color }]}><Text style={[styles.levelText, { color: gradeInfo.color }]}>NIVEAU {gradeInfo.cardLevel}</Text></View>
        </View>
        <View style={styles.identityRow}>
          <View style={[styles.photoFrame, { borderColor: gradeInfo.color }]}>{user.avatar ? <Image source={{ uri: user.avatar }} style={styles.photo} /> : <Text style={styles.initial}>{user.surname?.[0]?.toUpperCase() || "H"}</Text>}</View>
          <View style={styles.identityText}><Text style={styles.cardName} numberOfLines={1}>{user.surname} {user.name}</Text><Text style={styles.profession} numberOfLines={1}>{user.profession || "Membre Hawtrix"}</Text><Text style={styles.cardCode}>ID {user.referralCode}</Text></View>
          <View style={styles.rankMark}><Ionicons name="ribbon" size={24} color={gradeInfo.color} /><Text style={[styles.rankName, { color: gradeInfo.color }]} numberOfLines={2}>{gradeInfo.label.toUpperCase()}</Text></View>
        </View>
        <View style={styles.ornamentRow}><View style={styles.ornamentLine} /><View style={styles.stars}>{[...Array(stars)].map((_, i) => <Text key={i} style={[styles.star, { color: gradeInfo.color }]}>★</Text>)}</View><View style={styles.ornamentLine} /></View>
        <View style={styles.cardBottom}><View style={styles.networkItem}><Ionicons name="people" size={13} color={gradeInfo.color} /><Text style={styles.networkText}>{user.networkCount ?? 0} membres réseau</Text></View><Text style={styles.official}>CARTE OFFICIELLE</Text></View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.32, shadowRadius: 18, elevation: 14 }, goldShadow: { shadowColor: "#D4A017", shadowOpacity: 0.42 }, card: { minHeight: 214, borderRadius: 22, padding: 18, gap: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" }, glowOne: { position: "absolute", width: 180, height: 180, borderRadius: 90, right: -70, top: -70, backgroundColor: "rgba(255,255,255,0.14)" }, glowTwo: { position: "absolute", width: 130, height: 130, borderRadius: 65, left: -70, bottom: -65, backgroundColor: "rgba(255,255,255,0.08)" }, watermarkRow: { position: "absolute", top: 30, left: -20, right: -20, bottom: 10, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.07, transform: [{ rotate: "-18deg" }] }, watermarkText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold", letterSpacing: 4 }, cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, brandRow: { flexDirection: "row", alignItems: "center", gap: 8 }, logoImg: { width: 68, height: 24 }, brandDivider: { height: 18, width: 1, backgroundColor: "rgba(255,255,255,0.4)" }, memberText: { fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.78)", fontFamily: "Inter_700Bold" }, levelBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, borderWidth: 1, backgroundColor: "rgba(0,0,0,0.18)" }, levelText: { fontSize: 10, fontWeight: "800", fontFamily: "Inter_700Bold" }, identityRow: { flexDirection: "row", alignItems: "center", gap: 11 }, photoFrame: { width: 62, height: 62, borderRadius: 19, borderWidth: 2, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center", overflow: "hidden" }, photo: { width: "100%", height: "100%" }, initial: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold" }, identityText: { flex: 1, gap: 3 }, cardName: { fontSize: 17, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold" }, profession: { fontSize: 11, color: "rgba(255,255,255,0.72)", fontFamily: "Inter_400Regular" }, cardCode: { fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: 1.2, fontFamily: "Inter_500Medium" }, rankMark: { width: 72, alignItems: "center", gap: 3 }, rankName: { fontSize: 9, fontWeight: "800", textAlign: "center", fontFamily: "Inter_700Bold" }, ornamentRow: { flexDirection: "row", alignItems: "center", gap: 8 }, ornamentLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.25)" }, stars: { flexDirection: "row", gap: 2 }, star: { fontSize: 14 }, cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, networkItem: { flexDirection: "row", alignItems: "center", gap: 5 }, networkText: { fontSize: 10, color: "rgba(255,255,255,0.64)", fontFamily: "Inter_400Regular" }, official: { fontSize: 8, color: "rgba(255,255,255,0.55)", letterSpacing: 1.3, fontFamily: "Inter_700Bold" },
});
