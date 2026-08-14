import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { OPPORTUNITIES, TYPES, TYPE_META, isOpportunityActive, Opportunity } from "@/data/opportunities";
import OfflineGate from "@/components/OfflineGate";
import { backend } from "@/utils/backend";

type RemoteOpportunity = Opportunity & { active?: boolean; createdAt?: string; updatedAt?: string };

function normalizeOpportunity(row: any): Opportunity {
  return {
    id: String(row.id),
    type: row.type,
    title: row.title || "Opportunité",
    org: row.org || "",
    country: row.country || "",
    deadline: row.deadline || "",
    description: row.description || "",
    requirements: row.requirements || "",
    url: row.url,
    applyInfo: row.applyInfo || "Consultez le lien officiel.",
    image: row.image || "briefcase",
    color: row.color || "#10B981",
    edition: row.edition || "Publié par Hawtrix",
  };
}

export default function OpportunitiesScreen() {
  const [activeType, setActiveType] = useState<string>("Tous");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverError, setServerError] = useState("");
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const loadOpportunities = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true); else setLoading(true);
    try {
      const remote = await backend.getOpportunities();
      setOpportunities(remote.map(normalizeOpportunity));
      setServerError("");
    } catch {
      setOpportunities(OPPORTUNITIES);
      setServerError("Mode secours : affichage de la dernière liste intégrée.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadOpportunities(); }, [loadOpportunities]);

  const activeOpportunities = useMemo(
    () => opportunities.filter((o) => isOpportunityActive(o)),
    [opportunities],
  );
  const filtered = activeType === "Tous" ? activeOpportunities : activeOpportunities.filter(o => o.type === activeType);

  const body = (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Opportunités</Text>
            <Text style={styles.headerSub}>{activeOpportunities.length} offres actuellement ouvertes · liens officiels</Text>
          </View>
          <TouchableOpacity onPress={() => loadOpportunities(true)} style={styles.refreshButton} disabled={refreshing}>
            {refreshing ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Ionicons name="refresh" size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
        {!!serverError && <Text style={styles.warning}>{serverError}</Text>}
        <FlatList
          horizontal
          data={["Tous", ...TYPES]}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.typeChip, activeType === item && styles.typeChipActive]} onPress={() => { setActiveType(item); Haptics.selectionAsync(); }} activeOpacity={0.8}>
              {item !== "Tous" && TYPE_META[item] && <Ionicons name={TYPE_META[item].icon as any} size={13} color={activeType === item ? "#FFFFFF" : "#94A3B8"} />}
              <Text style={[styles.typeChipText, activeType === item && styles.typeChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </LinearGradient>

      {loading ? <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 50 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadOpportunities(true)} tintColor="#FF6B00" />}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="briefcase-outline" size={48} color="#D1D5DB" /><Text style={styles.emptyText}>Aucune opportunité actuellement ouverte</Text></View>}
          renderItem={({ item }) => {
            const meta = TYPE_META[item.type] ?? { icon: "star", color: item.color || "#FF6B00" };
            return (
              <TouchableOpacity style={styles.card} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/opportunities/[id]", params: { id: item.id } }); }} activeOpacity={0.85}>
                <View style={[styles.cardIcon, { backgroundColor: meta.color + "20" }]}><Ionicons name={meta.icon as any} size={26} color={meta.color} /></View>
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}><View style={[styles.typeBadge, { backgroundColor: meta.color + "15" }]}><Text style={[styles.typeBadgeText, { color: meta.color }]}>{item.type}</Text></View><Text style={styles.deadline}>{item.deadline}</Text></View>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.cardMeta}><Ionicons name="business" size={12} color="#9CA3AF" /><Text style={styles.cardMetaText} numberOfLines={1}>{item.org}</Text><Ionicons name="location" size={12} color="#9CA3AF" style={{ marginLeft: 8 }} /><Text style={styles.cardMetaText}>{item.country}</Text></View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );

  return <OfflineGate title="Opportunités accessibles en ligne uniquement"><View style={[styles.container, { paddingTop: topPad }]}>{body}</View></OfflineGate>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", paddingTop: 8 },
  headerSub: { fontSize: 13, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  refreshButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.15)" },
  warning: { color: "#FBBF24", fontSize: 12 },
  typeChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  typeChipActive: { backgroundColor: "#FF6B00", borderColor: "#FF6B00" },
  typeChipText: { fontSize: 12, color: "#94A3B8", fontFamily: "Inter_500Medium" },
  typeChipTextActive: { color: "#FFFFFF" },
  card: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, gap: 14, alignItems: "flex-start" },
  cardIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardBody: { flex: 1, gap: 6 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  deadline: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", lineHeight: 20 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMetaText: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 15, color: "#9CA3AF", fontFamily: "Inter_400Regular", textAlign: "center" },
});

export type { RemoteOpportunity };

