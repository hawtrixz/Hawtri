import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, GRADE_INFO, Grade } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const MLM_EXPLANATION = {
  title: "Comment fonctionne le réseau Hawtrix ?",
  intro: "En partageant votre code personnel, vous invitez des membres à rejoindre Hawtrix. Pour chaque membre que vous parrainez directement, vous générez des revenus. Et vos filleuls peuvent à leur tour en faire de même, créant un réseau puissant.",
  earnings: [
    { level: "Parrainage direct", amount: "500 FCFA", desc: "À chaque membre que vous invitez directement" },
    { level: "Réseau étendu", amount: "Progressif", desc: "Vous gagnez aussi sur les membres de vos filleuls" },
    { level: "Dividendes", amount: "Selon grade", desc: "À partir du grade Magnat, recevez des % des revenus de la plateforme" },
  ],
};

const GRADES_DISPLAY = [
  { grade: "pionier" as Grade, minCount: 10, benefit: "Gains directs + cartes premium" },
  { grade: "saphir" as Grade, minCount: 35, benefit: "Avantages supérieurs + arbre des filleuls" },
  { grade: "rubis" as Grade, minCount: 100, benefit: "Statut honorifique + carte élégante" },
  { grade: "emeraude" as Grade, minCount: 250, benefit: "Carte prestige + avantages exclusifs" },
  { grade: "magnat" as Grade, minCount: 500, benefit: "Dividendes 4% sur revenus plateforme" },
  { grade: "icone" as Grade, minCount: 1000, benefit: "Dividendes 8% majorés + statut d'icône" },
  { grade: "directeur" as Grade, minCount: 10000, benefit: "Directeur : 6% dividendes + avantages directs" },
  { grade: "directeur2" as Grade, minCount: 100000, benefit: "⭐⭐ 100 000 membres + 4 directeurs sur 4 branches · 14% dividendes" },
  { grade: "directeur5" as Grade, minCount: 1000000, benefit: "⭐⭐⭐⭐⭐ 1 000 000 membres + 2 Directeurs ⭐⭐ sur 2 branches · 30% dividendes" },
];

export default function NetworkScreen() {
  const { user } = useApp();
  const [showExplain, setShowExplain] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const gradeInfo = user ? GRADE_INFO[user.grade] : GRADE_INFO["membre"];

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Partager mon code",
      `Rejoins Hawtrix avec mon code ${user?.referralCode ?? ""} et accède à une plateforme unique de services, formations et opportunités !\n\nTélécharge l'application et entre le code lors de l'inscription.`,
      [{ text: "OK" }]
    );
  };

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#1E293B"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon Réseau</Text>
          {user.grade === "saphir" || user.grade === "rubis" || user.grade === "emeraude" || user.grade === "magnat" || user.grade === "icone" || user.grade === "directeur" ? (
            <TouchableOpacity onPress={() => router.push("/network/tree" as any)} style={styles.treeBtn} activeOpacity={0.7}>
              <Ionicons name="git-network" size={22} color="#FF6B00" />
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Votre code personnel</Text>
          <Text style={styles.codeValue}>{user.referralCode}</Text>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert("Copié", "Code copié !"); }} activeOpacity={0.8}>
              <Ionicons name="copy" size={16} color="#FF6B00" />
              <Text style={styles.copyBtnText}>Copier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
              <Ionicons name="share-social" size={16} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Partager</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.statsRow}>
          {[
            { label: "Membres invités", value: user.networkCount, icon: "people", color: "#FF6B00" },
            { label: "Gains totaux", value: `${user.totalEarnings} F`, icon: "cash", color: "#10B981" },
            { label: "Grade actuel", value: gradeInfo.label, icon: "ribbon", color: gradeInfo.color },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "20" }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.explainBtn} onPress={() => setShowExplain(v => !v)} activeOpacity={0.8}>
          <View style={styles.explainBtnLeft}>
            <View style={styles.explainIcon}>
              <Ionicons name="cash" size={22} color="#FF6B00" />
            </View>
            <View>
              <Text style={styles.explainTitle}>Comment gagner de l'argent ?</Text>
              <Text style={styles.explainSub}>Découvrez votre potentiel de gains</Text>
            </View>
          </View>
          <Ionicons name={showExplain ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {showExplain && (
          <View style={styles.explainContent}>
            <Text style={styles.explainIntro}>{MLM_EXPLANATION.intro}</Text>
            {MLM_EXPLANATION.earnings.map((e, i) => (
              <View key={i} style={styles.earningItem}>
                <View style={styles.earningDot} />
                <View style={styles.earningInfo}>
                  <View style={styles.earningTop}>
                    <Text style={styles.earningLevel}>{e.level}</Text>
                    <Text style={styles.earningAmount}>{e.amount}</Text>
                  </View>
                  <Text style={styles.earningDesc}>{e.desc}</Text>
                </View>
              </View>
            ))}
            <View style={styles.potentialBox}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
              <Text style={styles.potentialText}>En atteignant les grades supérieurs, il est possible de percevoir des dividendes réguliers sur les revenus de la plateforme. Chaque grade ouvre de nouveaux avantages.</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Les grades Hawtrix</Text>
          {GRADES_DISPLAY.map((g, i) => {
            const info = GRADE_INFO[g.grade];
            const isAchieved = user.networkCount >= g.minCount;
            const isCurrent = user.grade === g.grade;
            return (
              <View key={i} style={[styles.gradeRow, isCurrent && styles.gradeRowCurrent]}>
                <View style={[styles.gradeIconWrap, { backgroundColor: info.color + "20" }]}>
                  <Ionicons name="ribbon" size={20} color={info.color} />
                </View>
                <View style={styles.gradeInfo}>
                  <View style={styles.gradeTop}>
                    <Text style={[styles.gradeName, isCurrent && { color: info.color }]}>{info.label}</Text>
                    {isCurrent && <View style={[styles.currentBadge, { backgroundColor: info.color }]}><Text style={styles.currentText}>Actuel</Text></View>}
                    {isAchieved && !isCurrent && <Ionicons name="checkmark-circle" size={16} color="#10B981" />}
                  </View>
                  <Text style={styles.gradeMin}>{g.minCount}+ membres requis</Text>
                  <Text style={styles.gradeBenefit}>{g.benefit}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  treeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  codeCard: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 18, padding: 20, gap: 12, borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  codeLabel: { fontSize: 13, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  codeValue: { fontSize: 28, fontWeight: "800", color: "#FF6B00", fontFamily: "Inter_700Bold", letterSpacing: 4 },
  codeActions: { flexDirection: "row", gap: 10 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: "#FF6B00" },
  copyBtnText: { fontSize: 13, fontWeight: "700", color: "#FF6B00", fontFamily: "Inter_700Bold" },
  shareBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: "#FF6B00" },
  shareBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  statsRow: { flexDirection: "row", padding: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, alignItems: "center", gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", textAlign: "center" },
  statLabel: { fontSize: 10, color: "#9CA3AF", fontFamily: "Inter_400Regular", textAlign: "center" },
  explainBtn: { marginHorizontal: 16, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  explainBtnLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  explainIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#FFF1E6", alignItems: "center", justifyContent: "center" },
  explainTitle: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  explainSub: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  explainContent: { marginHorizontal: 16, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 14, marginBottom: 12 },
  explainIntro: { fontSize: 14, color: "#374151", lineHeight: 21, fontFamily: "Inter_400Regular" },
  earningItem: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  earningDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF6B00", marginTop: 6 },
  earningInfo: { flex: 1, gap: 3 },
  earningTop: { flexDirection: "row", justifyContent: "space-between" },
  earningLevel: { fontSize: 14, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  earningAmount: { fontSize: 14, fontWeight: "700", color: "#10B981", fontFamily: "Inter_700Bold" },
  earningDesc: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular" },
  potentialBox: { flexDirection: "row", gap: 10, backgroundColor: "#ECFDF5", borderRadius: 12, padding: 12, alignItems: "flex-start" },
  potentialText: { flex: 1, fontSize: 13, color: "#065F46", fontFamily: "Inter_400Regular", lineHeight: 19 },
  section: { padding: 16, gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", marginBottom: 4 },
  gradeRow: { flexDirection: "row", gap: 12, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, alignItems: "flex-start" },
  gradeRowCurrent: { borderWidth: 2, borderColor: "#FF6B00" },
  gradeIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  gradeInfo: { flex: 1, gap: 3 },
  gradeTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  gradeName: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  currentText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  gradeMin: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular" },
  gradeBenefit: { fontSize: 12, color: "#FF6B00", fontFamily: "Inter_500Medium" },
});
