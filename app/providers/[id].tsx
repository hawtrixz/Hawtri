import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { backend, type ServerReview } from "@/utils/backend";
import { Ionicons } from "@expo/vector-icons";

const REVIEW_COMMENTS = [
  "Très professionnel, je recommande.",
  "Bon travail et prix correct.",
  "Ponctuel et sérieux.",
  "Résultat excellent, merci !",
  "Fiable et rapide.",
  "Très satisfait du service.",
  "Un vrai professionnel.",
  "À recommander sans hésiter.",
];

export default function ProviderScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    profession?: string;
    neighborhood?: string;
    city?: string;
    rating?: string;
    reviews?: string;
    available?: string;
    experience?: string;
    phone?: string;
  }>();
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const name = params.name ?? "Prestataire";
  const profession = params.profession ?? "Prestataire";
  const phone = params.phone ?? "";
  const isAvailable = params.available !== "false";

  // Avis réels chargés depuis le serveur.
  const [reviews, setReviews] = useState<ServerReview[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    backend.getReviews(params.id).then(setReviews).catch(() => {});
  }, [params.id]);

  // Moyenne réelle à partir des avis publiés, sinon la note affichée du profil.
  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : Number(params.rating ?? "5.0");

  const handleCall = () => {
    if (!phone) {
      Alert.alert("Appel", "Ce prestataire n'a pas de numéro enregistré.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Ouvre l'application d'appels par défaut du téléphone.
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Appel impossible", "Votre téléphone ne peut pas passer d'appel pour le moment."),
    );
  };

  const publishReview = async () => {
    const text = newText.trim();
    if (text.length < 3) {
      Alert.alert("Avis", "Écrivez au moins 3 caractères pour publier votre avis.");
      return;
    }
    if (text.length > 500) {
      Alert.alert("Avis", "Votre avis est trop long (maximum 500 caractères).");
      return;
    }
    setSending(true);
    try {
      await backend.setReview(params.id, newRating, text);
      setNewText("");
      const updated = await backend.getReviews(params.id);
      setReviews(updated);
      Alert.alert("Merci !", "Votre avis a été publié. Il est maintenant visible par tous les membres.");
    } catch {
      Alert.alert("Erreur", "Impossible de publier l'avis. Vérifiez votre connexion et réessayez.");
    } finally {
      setSending(false);
    }
  };

  const Stars = ({ count, size = 16, color = "#F59E0B", onPress }: { count: number; size?: number; color?: string; onPress?: (n: number) => void }) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={onPress ? () => { onPress(n); Haptics.selectionAsync(); } : undefined} disabled={!onPress}>
          <Ionicons name={n <= count ? "star" : "star-outline"} size={size} color={n <= count ? color : "#D1D5DB"} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil prestataire</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: botPad + 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <LinearGradient colors={["#FF6B00", "#FF8C3A"]} style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{name[0]}</Text>
          </LinearGradient>
          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroProfession}>{profession}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroRating}>
              <Stars count={Math.round(avgRating)} />
              <Text style={styles.heroRatingText}> {avgRating.toFixed(1)} · {reviews.length} avis</Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: isAvailable ? "#D1FAE5" : "#FEE2E2" }]}>
              <Text style={[styles.heroBadgeText, { color: isAvailable ? "#065F46" : "#991B1B" }]}>
                {isAvailable ? "Disponible" : "Occupé"}
              </Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{params.neighborhood ?? "Lomé"}</Text>
              <Text style={styles.heroStatLabel}>Quartier</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{params.experience ?? "0"} ans</Text>
              <Text style={styles.heroStatLabel}>Expérience</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{REVIEW_COMMENTS.length}</Text>
              <Text style={styles.heroStatLabel}>Avis publiés</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact direct</Text>
          <View style={styles.phoneCard}>
            <Ionicons name="call" size={18} color="#0A1628" />
            <Text style={styles.phoneText}>{phone || "+228 00 00 00 00"}</Text>
            {phone ? (
              <TouchableOpacity style={styles.phoneCallBtn} onPress={handleCall} activeOpacity={0.7}>
                <Text style={styles.phoneCallText}>Appeler</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avis clients ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <View style={styles.noReview}>
              <Ionicons name="chatbubble-outline" size={32} color="#D1D5DB" />
              <Text style={styles.noReviewText}>Aucun avis publié pour le moment.</Text>
              <Text style={styles.noReviewSub}>Soyez le premier à donner votre avis !</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {reviews.map(r => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{(r.name || r.surname || "M")[0]}</Text>
                    </View>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewName}>{r.name} {r.surname}</Text>
                      <Stars count={r.rating} size={13} />
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{r.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donnez votre avis</Text>
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Votre note</Text>
            <Stars count={newRating} size={26} color="#FF6B00" onPress={setNewRating} />
            <TextInput
              style={styles.formInput}
              placeholder="Parlez de votre expérience avec ce prestataire..."
              placeholderTextColor="#9CA3AF"
              value={newText}
              onChangeText={setNewText}
              multiline
              maxLength={500}
            />
            <Text style={styles.formHint}>{newText.length}/500 caractères</Text>
            <TouchableOpacity
              style={[styles.submitBtn, sending && styles.submitBtnDisabled]}
              onPress={publishReview}
              disabled={sending}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>{sending ? "Publication..." : "Publier mon avis"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: botPad }]}>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/messages", params: { newChatWith: params.id, name } }); }}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble" size={18} color="#FF6B00" />
          <Text style={[styles.bottomBtnText, { color: "#FF6B00" }]}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtnQuote} onPress={() => Alert.alert("Bientôt", "La demande de devis arrive dans la prochaine version.")} activeOpacity={0.8}>
          <Ionicons name="document-text" size={18} color="#FFFFFF" />
          <Text style={styles.bottomBtnQuoteText}>Devis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtnCall} onPress={handleCall} activeOpacity={0.8}>
          <Ionicons name="call" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  hero: { backgroundColor: "#FFFFFF", margin: 16, borderRadius: 20, padding: 20, alignItems: "center", gap: 8 },
  heroAvatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  heroAvatarText: { fontSize: 32, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  heroName: { fontSize: 20, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  heroProfession: { fontSize: 15, color: "#FF6B00", fontFamily: "Inter_600SemiBold" },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  heroRating: { flexDirection: "row", alignItems: "center" },
  heroRatingText: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_500Medium" },
  heroBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  heroBadgeText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  heroStats: { flexDirection: "row", gap: 24, marginTop: 12 },
  heroStat: { alignItems: "center" },
  heroStatValue: { fontSize: 14, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  heroStatLabel: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", marginBottom: 10 },
  phoneCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 12 },
  phoneText: { flex: 1, fontSize: 17, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  phoneCallBtn: { backgroundColor: "#10B981", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  phoneCallText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF", fontFamily: "Inter_600SemiBold" },
  noReview: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, alignItems: "center", gap: 8 },
  noReviewText: { fontSize: 14, fontWeight: "600", color: "#6B7280", fontFamily: "Inter_600SemiBold" },
  noReviewSub: { fontSize: 13, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  reviewCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, gap: 8 },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  reviewAvatarText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  reviewInfo: { flex: 1 },
  reviewName: { fontSize: 13, fontWeight: "600", color: "#0A1628", fontFamily: "Inter_600SemiBold" },
  starsRow: { flexDirection: "row", gap: 2 },
  reviewText: { fontSize: 14, color: "#374151", fontFamily: "Inter_400Regular", lineHeight: 20 },
  formCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10 },
  formLabel: { fontSize: 14, fontWeight: "600", color: "#0A1628", fontFamily: "Inter_600SemiBold" },
  formInput: { backgroundColor: "#F5F6FA", borderRadius: 12, padding: 12, fontSize: 14, color: "#0A1628", fontFamily: "Inter_400Regular", minHeight: 90, textAlignVertical: "top", borderWidth: 1, borderColor: "#E5E7EB" },
  formHint: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular", textAlign: "right" },
  submitBtn: { backgroundColor: "#FF6B00", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  submitBtnDisabled: { backgroundColor: "#FDA96A" },
  submitText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: "#F5F6FA", borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  bottomBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#FF6B00" },
  bottomBtnText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  bottomBtnQuote: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: "#0A1628" },
  bottomBtnQuoteText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  bottomBtnCall: { width: 52, borderRadius: 16, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center" },
});
