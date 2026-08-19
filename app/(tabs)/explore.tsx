import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { backend } from "@/utils/backend";

const FILTERS = ["Tous", "Disponibles", "Électricité", "Informatique", "Couture", "Coiffure", "Plomberie", "Mécanique"];

/**
 * Normalise une chaîne pour la recherche :
 * - met tout en minuscules
 * - enlève les accents (é → e, ô → o, ù → u, etc.)
 * Ainsi "etudiant" trouve "Étudiant", "tegù" trouve "Tégu".
 */
function stripAccents(text: string): string {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function ExploreScreen() {
  const { user: currentUser } = useApp();
  const params = useLocalSearchParams<{ category?: string }>();
  const [search, setSearch] = useState(params.category ?? "");
  const [activeFilter, setActiveFilter] = useState(params.category ?? "Tous");
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const users = await backend.searchUsers(search.trim());
        if (!cancelled) {
          setAllProviders(users
            .filter((u: any) => u.id !== currentUser?.id && !u.is_banned)
            .map((u: any) => ({
              id: u.id,
              name: `${u.surname || ""} ${u.name || ""}`.trim(),
              profession: u.profession || "Membre Hawtrix",
              neighborhood: u.neighborhood || "Lomé",
              city: "Lomé",
              rating: 5.0,
              reviews: 0,
              available: !u.is_suspended,
              experience: 0,
              phone: u.phone || "",
              isRealUser: true,
            })));
        }
      } catch {
        if (!cancelled) setAllProviders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, currentUser?.id, reloadKey]);

  // Recherche sans accents : les deux textes sont normalisés avant comparaison.
  const searchNorm = stripAccents(search);
  const filtered = allProviders.filter(p => {
    const matchSearch = !search ||
      stripAccents(p.name).includes(searchNorm) ||
      stripAccents(p.profession).includes(searchNorm) ||
      stripAccents(p.neighborhood).includes(searchNorm);
    const matchFilter = activeFilter === "Tous" ? true :
      activeFilter === "Disponibles" ? p.available :
      stripAccents(p.profession).includes(stripAccents(activeFilter));
    return matchSearch && matchFilter;
  });

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <Text style={styles.headerTitle}>Prestataires de services</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Métier, quartier, ville..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search ? <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity> : null}
        </View>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}
              onPress={() => { setActiveFilter(item); Haptics.selectionAsync(); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, activeFilter === item && styles.filterChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Aucun prestataire trouvé</Text>
            <Text style={styles.emptySubText}>Essayez d'autres termes de recherche</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/providers/[id]", params: { id: item.id, name: item.name, profession: item.profession, neighborhood: item.neighborhood, city: item.city, rating: item.rating.toString(), reviews: item.reviews.toString(), available: item.available.toString(), experience: item.experience.toString(), phone: item.phone } }); }}
            activeOpacity={0.8}
          >
            <View style={styles.cardLeft}>
              <View style={[styles.avatar, { backgroundColor: item.available ? "#FF6B00" : "#9CA3AF" }]}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.providerName}>{item.name}</Text>
                {item.available ? (
                  <View style={styles.availBadge}><Text style={styles.availText}>Disponible</Text></View>
                ) : (
                  <View style={styles.unavailBadge}><Text style={styles.unavailText}>Occupé</Text></View>
                )}
              </View>
              <Text style={styles.profession}>{item.profession}</Text>
              <View style={styles.cardMeta}>
                <Ionicons name="location" size={12} color="#9CA3AF" />
                <Text style={styles.metaText}>{item.neighborhood}, {item.city}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
                </View>
              </View>
              <Text style={styles.experience}>{item.experience} ans d'expérience</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", paddingTop: 8 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: "#FFFFFF", fontFamily: "Inter_400Regular" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  filterChipActive: { backgroundColor: "#FF6B00", borderColor: "#FF6B00" },
  filterChipText: { fontSize: 13, color: "#94A3B8", fontFamily: "Inter_500Medium" },
  filterChipTextActive: { color: "#FFFFFF" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, gap: 12 },
  cardLeft: {},
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  cardBody: { flex: 1, gap: 3 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  providerName: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  availBadge: { backgroundColor: "#D1FAE5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  availText: { fontSize: 11, color: "#065F46", fontFamily: "Inter_600SemiBold" },
  unavailBadge: { backgroundColor: "#FEE2E2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  unavailText: { fontSize: 11, color: "#991B1B", fontFamily: "Inter_600SemiBold" },
  profession: { fontSize: 13, color: "#FF6B00", fontFamily: "Inter_600SemiBold" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginLeft: 8 },
  ratingText: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_500Medium" },
  experience: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#374151", fontFamily: "Inter_600SemiBold" },
  emptySubText: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
});
