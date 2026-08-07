import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, GRADE_INFO } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

export default function NetworkTreeScreen() {
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const gradeInfo = user ? GRADE_INFO[user.grade] : GRADE_INFO["membre"];

  const mockBranches = [
    { id: "b1", name: "Branche 1", count: Math.floor((user?.networkCount ?? 0) * 0.4), grade: "pionier" as const },
    { id: "b2", name: "Branche 2", count: Math.floor((user?.networkCount ?? 0) * 0.35), grade: "saphir" as const },
    { id: "b3", name: "Branche 3", count: Math.floor((user?.networkCount ?? 0) * 0.25), grade: "membre" as const },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arbre de mon réseau</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.treeContainer}>
          <View style={styles.rootNode}>
            <LinearGradient colors={[gradeInfo.color, gradeInfo.color + "AA"]} style={styles.rootGrad}>
              <View style={[styles.rootAvatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={styles.rootAvatarText}>{user?.surname?.[0] ?? "V"}</Text>
              </View>
              <Text style={styles.rootName}>{user?.surname} {user?.name}</Text>
              <Text style={styles.rootGrade}>{gradeInfo.label}</Text>
              <View style={styles.rootStats}>
                <View style={styles.rootStatItem}>
                  <Text style={styles.rootStatVal}>{user?.networkCount ?? 0}</Text>
                  <Text style={styles.rootStatLbl}>Total</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.connectorLine} />

          <View style={styles.branchesRow}>
            {mockBranches.map((b, i) => {
              const bInfo = GRADE_INFO[b.grade];
              return (
                <View key={b.id} style={styles.branchCol}>
                  <View style={styles.branchLine} />
                  <View style={[styles.branchNode, { borderColor: bInfo.color }]}>
                    <View style={[styles.branchAvatar, { backgroundColor: bInfo.color }]}>
                      <Text style={styles.branchAvatarText}>{String.fromCharCode(65 + i)}</Text>
                    </View>
                    <Text style={styles.branchName}>{b.name}</Text>
                    <Text style={[styles.branchGrade, { color: bInfo.color }]}>{bInfo.label}</Text>
                    <Text style={styles.branchCount}>{b.count} membres</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Statistiques réseau</Text>
          {[
            { label: "Membres directs", value: Math.min(user?.networkCount ?? 0, 10), icon: "people", color: "#FF6B00" },
            { label: "Total réseau", value: user?.networkCount ?? 0, icon: "git-network", color: "#10B981" },
            { label: "Branches actives", value: mockBranches.filter(b => b.count > 0).length, icon: "git-branch", color: "#3B82F6" },
          ].map(s => (
            <View key={s.label} style={styles.statRow}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "20" }]}>
                <Ionicons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  treeContainer: { alignItems: "center", padding: 24 },
  rootNode: { width: "80%", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  rootGrad: { alignItems: "center", padding: 20, gap: 8 },
  rootAvatar: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  rootAvatarText: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  rootName: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  rootGrade: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_500Medium" },
  rootStats: { flexDirection: "row", gap: 20, marginTop: 4 },
  rootStatItem: { alignItems: "center" },
  rootStatVal: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  rootStatLbl: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
  connectorLine: { width: 2, height: 30, backgroundColor: "#D1D5DB" },
  branchesRow: { flexDirection: "row", gap: 12, width: "100%" },
  branchCol: { flex: 1, alignItems: "center" },
  branchLine: { width: 2, height: 24, backgroundColor: "#D1D5DB" },
  branchNode: { width: "100%", borderRadius: 14, borderWidth: 2, padding: 12, alignItems: "center", gap: 6, backgroundColor: "#FFFFFF" },
  branchAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  branchAvatarText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  branchName: { fontSize: 12, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  branchGrade: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  branchCount: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  statsCard: { marginHorizontal: 16, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 14 },
  statsTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  statRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statLabel: { flex: 1, fontSize: 14, color: "#374151", fontFamily: "Inter_400Regular" },
  statValue: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
