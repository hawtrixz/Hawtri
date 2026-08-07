import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const SECTIONS = [
  {
    title: "Notre Mission",
    content: `Hawtrix est une plateforme numérique panafricaine conçue pour connecter les professionnels, les prestataires de services et les apprenants dans un écosystème unique et puissant.\n\nNotre mission est de faciliter l'accès aux opportunités professionnelles, aux formations de qualité, et aux prestataires de confiance pour tout Togolais et Africain cherchant à progresser dans sa carrière ou son activité.`,
  },
  {
    title: "Services Proposés",
    content: `• Annuaire intelligent de prestataires de services\n• Plateforme e-learning avec certificats\n• Centre d'opportunités (emplois, stages, bourses, concours)\n• Espace de développement personnel\n• Assistant IA intégré\n• Communauté et réseau professionnel\n• Messagerie instantanée\n• Géolocalisation de prestataires`,
  },
  {
    title: "Notre Vision",
    content: `Hawtrix aspire à devenir la référence numérique incontournable pour les professionnels d'Afrique de l'Ouest. Nous croyons que chaque individu mérite d'avoir accès aux meilleures ressources pour développer ses compétences, trouver des opportunités et construire un réseau solide.\n\nNous construisons un écosystème numérique inclusif, moderne et évolutif, pensé pour l'Afrique par l'Afrique.`,
  },
  {
    title: "Conditions d'Accès",
    content: `L'accès complet à la plateforme Hawtrix nécessite un paiement unique d'activation de 2 000 FCFA. Ce paiement unique vous ouvre l'accès à vie à l'ensemble des services de la plateforme.\n\nModes de paiement acceptés :\n• TMoney (Togocom)\n• Flooz (Moov Africa)\n\nCe montant couvre les frais d'inscription et de maintenance de votre compte sur la plateforme.`,
  },
  {
    title: "Engagement et Responsabilité",
    content: `En utilisant Hawtrix, vous vous engagez à :\n• Fournir des informations exactes lors de l'inscription\n• Respecter les autres membres de la communauté\n• Ne pas publier de contenu illégal ou offensant\n• Utiliser la plateforme de manière éthique et professionnelle\n\nHawtrix se réserve le droit de suspendre tout compte ne respectant pas ces conditions.`,
  },
  {
    title: "Protection des Données",
    content: `Vos données personnelles sont protégées conformément aux lois en vigueur sur la protection de la vie privée. Hawtrix s'engage à ne jamais vendre vos données à des tiers et à les utiliser uniquement pour améliorer votre expérience sur la plateforme.`,
  },
];

export default function TermsScreen() {
  const { setTermsAccepted } = useApp();
  const [accepted, setAccepted] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleAccept = async () => {
    await setTermsAccepted(true);
    router.replace("/payment");
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: botPad + 120 }}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Bienvenue sur Hawtrix</Text>
          <Text style={styles.introText}>
            Veuillez lire attentivement les conditions ci-dessous avant de continuer. Votre acceptation est obligatoire pour accéder à la plateforme.
          </Text>
        </View>

        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNum}>
                <Text style={styles.sectionNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.sectionTitle}>{s.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{s.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: botPad + 16 }]}>
        <TouchableOpacity style={styles.checkRow} onPress={() => setAccepted(v => !v)} activeOpacity={0.7}>
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkLabel}>J'ai lu et j'accepte les conditions d'utilisation de Hawtrix</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.acceptBtn, !accepted && styles.acceptBtnDisabled]}
          onPress={handleAccept}
          disabled={!accepted}
          activeOpacity={0.85}
        >
          <Text style={styles.acceptBtnText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  introCard: { margin: 16, padding: 20, backgroundColor: "#0A1628", borderRadius: 16 },
  introTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", marginBottom: 8 },
  introText: { fontSize: 14, color: "#94A3B8", lineHeight: 20, fontFamily: "Inter_400Regular" },
  section: { marginHorizontal: 16, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  sectionNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
  sectionNumText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  sectionContent: { fontSize: 14, color: "#374151", lineHeight: 22, fontFamily: "Inter_400Regular" },
  footer: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkboxChecked: { backgroundColor: "#FF6B00", borderColor: "#FF6B00" },
  checkLabel: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 19, fontFamily: "Inter_400Regular" },
  acceptBtn: { backgroundColor: "#FF6B00", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  acceptBtnDisabled: { backgroundColor: "#D1D5DB" },
  acceptBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
