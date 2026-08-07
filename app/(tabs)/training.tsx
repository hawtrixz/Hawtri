// app/(tabs)/training.tsx
//
// Hawtrix 2.86 — Formations RÉELLES uniquement
// - Écran protégé par OfflineGate (strictement en ligne).
// - Chaque formation renvoie vers la ressource externe officielle.

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TRAININGS, CATEGORIES, LEVEL_COLORS } from "@/data/trainings";
import OfflineGate from "@/components/OfflineGate";

export default function TrainingScreen() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = activeCategory === "Tous" ? TRAININGS : TRAININGS.filter(t => t.category === activeCategory);

  const body = (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <Text style={styles.headerTitle}>Formations</Text>
        <Text style={styles.headerSub}>{TRAININGS.length} cours officiels en ligne · Certificats des plateformes</Text>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, activeCategory === item && styles.catChipActive]}
              onPress={() => { setActiveCategory(item); Haptics.selectionAsync(); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.catChipText, activeCategory === item && styles.catChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/training/${item.id}` as any);
            }}
            activeOpacity={0.85}
          >
            <View style={[styles.cardBanner, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={32} color="rgba(255,255,255,0.9)" />
              <View style={styles.cardBannerRight}>
                <Text style={styles.cardCategory}>{item.platform}</Text>
                <Text style={styles.cardDuration}>{item.duration}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.cardMeta}>
                <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[item.level] + "20" }]}>
                  <Text style={[styles.levelText, { color: LEVEL_COLORS[item.level] }]}>{item.level}</Text>
                </View>
                <Ionicons name="ribbon" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{item.freeCertificate ? "Certificat gratuit" : "Certificat disponible"}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <OfflineGate title="Formations en ligne requises">
      <View style={{ flex: 1, backgroundColor: "#F5F6FA", paddingTop: topPad }}>{body}</View>
    </OfflineGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", paddingTop: 8 },
  headerSub: { fontSize: 13, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  catChipActive: { backgroundColor: "#FF6B00", borderColor: "#FF6B00" },
  catChipText: { fontSize: 12, color: "#94A3B8", fontFamily: "Inter_500Medium" },
  catChipTextActive: { color: "#FFFFFF" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden" },
  cardBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  cardBannerRight: { alignItems: "flex-end" },
  cardCategory: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_500Medium" },
  cardDuration: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  cardBody: { padding: 16, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", lineHeight: 21 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  levelText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  metaText: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
});
