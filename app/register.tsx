import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

const PROFESSIONS = [
  "Informaticien", "Développeur web", "Médecin", "Infirmier", "Comptable",
  "Electricien", "Plombier", "Maçon", "Menuisier", "Couturier", "Coiffeur",
  "Mécanicien", "Réparateur téléphones", "Enseignant", "Juriste", "Architecte",
  "Photographe", "Designer graphique", "Marketing", "Commerce", "Agriculture",
  "Restaurateur", "Chauffeur", "Gardien", "Entrepreneur", "Étudiant",
];

export default function RegisterScreen() {
  const { createUser } = useApp();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [profession, setProfession] = useState("");
  const [showProfSuggest, setShowProfSuggest] = useState(false);
  const [neighborhood, setNeighborhood] = useState("");
  const [referrerId, setReferrerId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const profSuggestions = profession.length > 1
    ? PROFESSIONS.filter(p => p.toLowerCase().includes(profession.toLowerCase())).slice(0, 4)
    : [];

  const handleSubmit = async () => {
    if (!name.trim() || !surname.trim() || !profession.trim() || !neighborhood.trim() || !phone.trim()) {
      Alert.alert("Champs manquants", "Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (phone.length < 8) {
      Alert.alert("Téléphone invalide", "Veuillez entrer un numéro de téléphone valide.");
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(r => setTimeout(r, 800));
    router.push({ pathname: "/verify", params: { phone, name, surname, profession, neighborhood, referrerId } });
    setLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <Text style={styles.headerTitle}>Créer votre compte</Text>
        <Text style={styles.headerSub}>Rejoignez la communauté Hawtrix</Text>
      </LinearGradient>

      <KeyboardAwareScrollViewCompat style={styles.scroll} bottomOffset={100} contentContainerStyle={{ paddingBottom: botPad + 100 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations personnelles</Text>

          <Text style={styles.label}>Nom <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Votre nom de famille" placeholderTextColor="#9CA3AF" autoCapitalize="words" />

          <Text style={styles.label}>Prénom(s) <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} value={surname} onChangeText={setSurname} placeholder="Votre prénom" placeholderTextColor="#9CA3AF" autoCapitalize="words" />

          <Text style={styles.label}>Quartier de résidence / travail <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholder="Ex: Tokoin, Bè, Agoè..." placeholderTextColor="#9CA3AF" autoCapitalize="words" />

          <Text style={styles.label}>Profession / Statut <Text style={styles.required}>*</Text></Text>
          <View>
            <TextInput
              style={styles.input}
              value={profession}
              onChangeText={t => { setProfession(t); setShowProfSuggest(true); }}
              placeholder="Ex: Informaticien, Couturier, Étudiant..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              onBlur={() => setTimeout(() => setShowProfSuggest(false), 200)}
            />
            {showProfSuggest && profSuggestions.length > 0 && (
              <View style={styles.suggestions}>
                {profSuggestions.map(s => (
                  <TouchableOpacity key={s} style={styles.suggItem} onPress={() => { setProfession(s); setShowProfSuggest(false); }}>
                    <Text style={styles.suggText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {profession.toLowerCase().includes("étudiant") && (
            <View style={styles.clarifyBox}>
              <Ionicons name="information-circle" size={16} color="#FF6B00" />
              <Text style={styles.clarifyText}>Précisez votre filière d'études ci-dessous (ex: Étudiant en Droit, Étudiant en Informatique...)</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
          <Text style={styles.label}>Numéro de téléphone <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+228 XX XX XX XX" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" />
          <Text style={styles.hint}>Un code de vérification SMS sera envoyé à ce numéro</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Code d'identification</Text>
          <Text style={styles.label}>N°ID <Text style={styles.optional}>(optionnel)</Text></Text>
          <TextInput
            style={styles.input}
            value={referrerId}
            onChangeText={t => setReferrerId(t.toUpperCase())}
            placeholder="ex: HK3MZ"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            maxLength={12}
          />
          <Text style={styles.hint}>Code 5 caractères de votre parrain (ex: HK3MZ)</Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>{loading ? "Traitement..." : "Vérifier mon numéro"}</Text>
            {!loading && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 14, color: "#94A3B8", fontFamily: "Inter_400Regular", marginTop: 4 },
  scroll: { flex: 1 },
  card: { margin: 16, marginBottom: 0, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 8 },
  required: { color: "#EF4444" },
  optional: { color: "#9CA3AF", fontWeight: "400", fontFamily: "Inter_400Regular" },
  input: { backgroundColor: "#F5F6FA", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#0A1628", borderWidth: 1, borderColor: "#E5E7EB", fontFamily: "Inter_400Regular" },
  suggestions: { position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", zIndex: 100, elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  suggItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F6FA" },
  suggText: { fontSize: 14, color: "#0A1628", fontFamily: "Inter_400Regular" },
  clarifyBox: { flexDirection: "row", gap: 8, backgroundColor: "#FFF8F5", borderRadius: 10, padding: 12, marginTop: 8, alignItems: "flex-start" },
  clarifyText: { flex: 1, fontSize: 13, color: "#374151", fontFamily: "Inter_400Regular", lineHeight: 18 },
  hint: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 6 },
  submitBtn: { flexDirection: "row", backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 18, alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 },
  submitBtnDisabled: { backgroundColor: "#FDA96A" },
  submitBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
