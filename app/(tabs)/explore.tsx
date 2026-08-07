import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

const STATIC_PROVIDERS = [
  { id: "1", name: "Kossi Atcha", profession: "Électricien", neighborhood: "Tokoin", city: "Lomé", rating: 4.8, reviews: 34, available: true, experience: 8, phone: "+228 90 12 34 56" },
  { id: "2", name: "Akossiwa Manu", profession: "Couturière", neighborhood: "Bè", city: "Lomé", rating: 4.9, reviews: 67, available: true, experience: 12, phone: "+228 91 23 45 67" },
  { id: "3", name: "Mawuli Koffi", profession: "Développeur web", neighborhood: "Agbalepedogan", city: "Lomé", rating: 4.7, reviews: 21, available: false, experience: 5, phone: "+228 92 34 56 78" },
  { id: "4", name: "Afi Mensah", profession: "Coiffeuse", neighborhood: "Agoè", city: "Lomé", rating: 4.6, reviews: 89, available: true, experience: 7, phone: "+228 93 45 67 89" },
  { id: "5", name: "Kodzo Dossou", profession: "Plombier", neighborhood: "Hévié", city: "Lomé", rating: 4.5, reviews: 45, available: true, experience: 10, phone: "+228 94 56 78 90" },
  { id: "6", name: "Yawa Segla", profession: "Comptable", neighborhood: "Djidjolé", city: "Lomé", rating: 4.9, reviews: 28, available: true, experience: 9, phone: "+228 95 67 89 01" },
  { id: "7", name: "Kwame Agbo", profession: "Mécanicien", neighborhood: "Kégué", city: "Lomé", rating: 4.4, reviews: 112, available: false, experience: 15, phone: "+228 96 78 90 12" },
  { id: "8", name: "Abla Foli", profession: "Réparation téléphones", neighborhood: "Tokoin", city: "Lomé", rating: 4.7, reviews: 58, available: true, experience: 6, phone: "+228 97 89 01 23" },
  { id: "9", name: "Edem Lawson", profession: "Maçon", neighborhood: "Nyékonakpoè", city: "Lomé", rating: 4.6, reviews: 33, available: true, experience: 11, phone: "+228 98 90 12 34" },
  { id: "10", name: "Sena Amavi", profession: "Photographe", neighborhood: "Adawlato", city: "Lomé", rating: 5.0, reviews: 19, available: true, experience: 4, phone: "+228 99 01 23 45" },
];

const FILTERS = ["Tous", "Disponibles", "Électricité", "Informatique", "Couture", "Coiffure", "Plomberie", "Mécanique"];

export default function ExploreScreen() {
  const { getAllUsers, user: currentUser } = useApp();
  const params = useLocalSearchParams<{ category?: string }>();
  const [search, setSearch] = useState(params.category ?? "");
  const [activeFilter, setActiveFilter] = useState(params.category ?? "Tous");
  const [allProviders, setAllProviders] = useState<any[]>(STATIC_PROVIDERS);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const users = await getAllUsers();
    const mappedUsers = users
      .filter(u => u.id !== currentUser?.id && !u.isBanned)
      .map(u => ({
        id: u.id,
        name: `${u.surname} ${u.name}`,
        profession: u.profession,
        neighborhood: u.neighborhood,
        city: "Lomé", // Default
        rating: 5.0,
        reviews: 0,
        available: !u.isSuspended,
        experience: 0,
        phone: u.phone,
        isRealUser: true
      }));
    setAllProviders([...STATIC_PROVIDERS, ...mappedUsers]);
  };

  const filtered = allProviders.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.profession.toLowerCase().includes(search.toLowerCase()) || p.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "Tous" ? true : activeFilter === "Disponibles" ? p.available : p.profession.toLowerCase().includes(activeFilter.toLowerCase());
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
