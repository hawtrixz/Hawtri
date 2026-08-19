import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { backend } from "@/utils/backend";

/**
 * Carte honnête : elle affiche uniquement la position de l'utilisateur
 * (obtenue par GPS du téléphone) avec son quartier réel.
 * La position des autres utilisateurs n'est JAMAIS affichée (respect
 * de la vie privée). Les membres du réseau proches sont listés
 * sans aucune distance ni coordonnée.
 */
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [quartier, setQuartier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  // Obtenir la position GPS de l'utilisateur et son quartier réel.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("L'accès à la position a été refusé. Activez-le dans les paramètres du téléphone pour utiliser cette carte.");
          setLoading(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        if (!active) return;
        setLocation(coords);

        try {
          const geocode = await Location.reverseGeocodeAsync({ latitude: coords.latitude, longitude: coords.longitude });
          if (geocode.length > 0) {
            const g = geocode[0];
            const parts = [g.district || g.subregion, g.city, g.country].filter(Boolean);
            if (!active) return;
            setQuartier(parts.join(", "));
          }
        } catch {
          // Le quartier est un plus, mais ne bloque pas la carte.
        }
      } catch {
        if (!active) return;
        setError("Impossible de récupérer votre position. Vérifiez que le GPS est activé.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Charger les membres réels du réseau Hawtrix (sans leur position exacte).
  useEffect(() => {
    let active = true;
    backend.searchUsers("").then(users => {
      if (!active) return;
      setMembers((users ?? []).filter((u: any) => u.profession).slice(0, 12));
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma position</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: botPad + 24 }} showsVerticalScrollIndicator={false}>
        {/* Carte décorative : seul VOTRE point est affiché (position GPS réelle). */}
        <View style={styles.mapArea}>
          {loading ? (
            <View style={styles.mapCenter}>
              <ActivityIndicator size="large" color="#FF6B00" />
              <Text style={styles.mapStatus}>Localisation en cours...</Text>
            </View>
          ) : error ? (
            <View style={styles.mapCenter}>
              <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
              <Text style={styles.mapError}>{error}</Text>
            </View>
          ) : (
            <View style={styles.mapContent}>
              <View style={styles.radarCircleBig} />
              <View style={styles.radarCircleMid} />
              <View style={styles.mapCenter}>
                <View style={styles.pinPulse} />
                <View style={styles.pin}>
                  <Ionicons name="location" size={22} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.mapChip}>
                <Ionicons name="location-outline" size={14} color="#FFFFFF" />
                <Text style={styles.mapChipText}>
                  {quartier ?? `Position GPS : ${location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "..."}`}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Autour de moi ({members.length})</Text>
          <View style={styles.honestyNote}>
            <Ionicons name="shield-checkmark" size={18} color="#059669" />
            <Text style={styles.honestyText}>
              Pour respecter la vie privée de chacun, la carte n'affiche que votre position. Les positions exactes des autres membres ne sont pas partagées.
            </Text>
          </View>
          {members.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucun membre avec un métier recensé pour le moment</Text>
              <Text style={styles.emptySub}>Ils apparaîtront ici dès qu'ils complèteront leur profil</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {members.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.memberCard}
                  onPress={() => { router.push({ pathname: "/providers/[id]", params: { id: m.id, name: `${m.surname ?? ""} ${m.name ?? ""}`.trim(), profession: m.profession, neighborhood: m.neighborhood ?? "Lomé", city: "Lomé" } }); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{(m.surname ?? m.name ?? "M")[0]}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{m.surname ?? ""} {m.name ?? ""}</Text>
                    <Text style={styles.memberProfession}>{m.profession}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Composant LinearGradient extrait pour l'import direct.
function LinearGradient(props: any) {
  const ExpoLinearGradient = require("expo-linear-gradient").LinearGradient;
  return <ExpoLinearGradient {...props} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  mapArea: { margin: 16, height: 280, borderRadius: 20, overflow: "hidden", backgroundColor: "#0A1628", alignItems: "center", justifyContent: "center" },
  mapContent: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  radarCircleBig: { position: "absolute", width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: "rgba(255,107,0,0.25)" },
  radarCircleMid: { position: "absolute", width: 130, height: 130, borderRadius: 65, borderWidth: 1, borderColor: "rgba(255,107,0,0.4)" },
  mapCenter: { alignItems: "center", gap: 8 },
  pinPulse: { position: "absolute", width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255,107,0,0.35)" },
  pin: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFFFFF" },
  mapStatus: { fontSize: 13, color: "#FFFFFF", fontFamily: "Inter_400Regular", marginTop: 8 },
  mapError: { fontSize: 13, color: "#FCA5A5", fontFamily: "Inter_400Regular", marginTop: 8, textAlign: "center", paddingHorizontal: 30, lineHeight: 18 },
  mapChip: { position: "absolute", bottom: 14, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  mapChipText: { fontSize: 12, color: "#FFFFFF", fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", marginBottom: 10 },
  honestyNote: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#ECFDF5", borderRadius: 12, padding: 12, marginBottom: 12 },
  honestyText: { flex: 1, fontSize: 12, color: "#065F46", fontFamily: "Inter_400Regular", lineHeight: 17 },
  memberCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, padding: 12, gap: 12 },
  memberAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  memberAvatarText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  memberProfession: { fontSize: 12, color: "#FF6B00", fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 14, fontWeight: "600", color: "#6B7280", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySub: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", textAlign: "center" },
});
