import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const NEARBY = [
  { id: "1", name: "Kossi Atcha", profession: "Électricien", distance: "0.3 km", available: true, rating: 4.8 },
  { id: "2", name: "Abla Foli", profession: "Réparation téléphones", distance: "0.5 km", available: true, rating: 4.7 },
  { id: "3", name: "Kwame Agbo", profession: "Mécanicien", distance: "0.8 km", available: false, rating: 4.4 },
  { id: "4", name: "Afi Mensah", profession: "Coiffeuse", distance: "1.1 km", available: true, rating: 4.6 },
  { id: "5", name: "Kodzo Dossou", profession: "Plombier", distance: "1.4 km", available: true, rating: 4.5 },
  { id: "6", name: "Yawa Segla", profession: "Comptable", distance: "2.0 km", available: true, rating: 4.9 },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carte des prestataires</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.mapPlaceholder}>
        <LinearGradient colors={["#1E3A5F", "#0F2547"]} style={styles.mapGrad}>
          <View style={styles.mapCenter}>
            <View style={styles.pulseOuter}><View style={styles.pulseInner} /></View>
            <Ionicons name="location" size={36} color="#FF6B00" />
          </View>
          {NEARBY.slice(0, 4).map((p, i) => {
            const positions = [
              { top: "20%", left: "25%" },
              { top: "35%", right: "20%" },
              { bottom: "30%", left: "18%" },
              { bottom: "25%", right: "25%" },
            ];
            return (
              <View key={p.id} style={[styles.mapPin, positions[i] as any]}>
                <View style={[styles.pinDot, { backgroundColor: p.available ? "#FF6B00" : "#9CA3AF" }]} />
              </View>
            );
          })}
          <View style={styles.mapInfo}>
            <Ionicons name="location" size={14} color="#94A3B8" />
            <Text style={styles.mapInfoText}>Lomé, Togo · Rayon 5 km</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Prestataires à proximité ({NEARBY.length})</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: botPad + 24 }}>
          {NEARBY.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.nearbyCard}
              onPress={() => router.push({ pathname: "/providers/[id]", params: { id: p.id, name: p.name, profession: p.profession, neighborhood: "Lomé", city: "Lomé", rating: p.rating.toString(), reviews: "20", available: p.available.toString(), experience: "5", phone: "+228 90 00 00 00" } })}
              activeOpacity={0.8}
            >
              <View style={[styles.nearbyAvatar, { backgroundColor: p.available ? "#FF6B00" : "#9CA3AF" }]}>
                <Text style={styles.nearbyAvatarText}>{p.name[0]}</Text>
              </View>
              <View style={styles.nearbyInfo}>
                <Text style={styles.nearbyName}>{p.name}</Text>
                <Text style={styles.nearbyProfession}>{p.profession}</Text>
              </View>
              <View style={styles.nearbyRight}>
                <View style={styles.distanceChip}>
                  <Ionicons name="navigate" size={12} color="#FF6B00" />
                  <Text style={styles.distanceText}>{p.distance}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{p.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  mapPlaceholder: { height: 220, margin: 0 },
  mapGrad: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  mapCenter: { alignItems: "center", justifyContent: "center" },
  pulseOuter: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,107,0,0.15)", alignItems: "center", justifyContent: "center" },
  pulseInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,107,0,0.25)" },
  mapPin: { position: "absolute", width: 14, height: 14, borderRadius: 7 },
  pinDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#FFFFFF" },
  mapInfo: { position: "absolute", bottom: 12, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  mapInfoText: { fontSize: 12, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  listSection: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 20 },
  listTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", marginBottom: 12 },
  nearbyCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 14, padding: 14, gap: 12 },
  nearbyAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  nearbyAvatarText: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  nearbyInfo: { flex: 1, gap: 3 },
  nearbyName: { fontSize: 14, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  nearbyProfession: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular" },
  nearbyRight: { alignItems: "flex-end", gap: 6 },
  distanceChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF1E6", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  distanceText: { fontSize: 12, fontWeight: "600", color: "#FF6B00", fontFamily: "Inter_600SemiBold" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_500Medium" },
});
