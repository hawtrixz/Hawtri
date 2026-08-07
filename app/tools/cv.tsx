import { useState } from "react";
import { router } from "expo-router";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Experience = { poste: string; entreprise: string; periode: string; description: string };
type Formation = { diplome: string; ecole: string; annee: string };

export default function CVScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep] = useState(0);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [metier, setMetier] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [ville, setVille] = useState("Lomé, Togo");
  const [resume, setResume] = useState("");
  const [competences, setCompetences] = useState("");
  const [langues, setLangues] = useState("Français, Éwé");
  const [experiences, setExperiences] = useState<Experience[]>([{ poste: "", entreprise: "", periode: "", description: "" }]);
  const [formations, setFormations] = useState<Formation[]>([{ diplome: "", ecole: "", annee: "" }]);
  const [preview, setPreview] = useState(false);

  const addExperience = () => setExperiences([...experiences, { poste: "", entreprise: "", periode: "", description: "" }]);
  const addFormation = () => setFormations([...formations, { diplome: "", ecole: "", annee: "" }]);

  const updateExp = (i: number, field: keyof Experience, val: string) => {
    const updated = [...experiences];
    updated[i] = { ...updated[i], [field]: val };
    setExperiences(updated);
  };

  const updateForm = (i: number, field: keyof Formation, val: string) => {
    const updated = [...formations];
    updated[i] = { ...updated[i], [field]: val };
    setFormations(updated);
  };

  const generateCV = () => {
    if (!nom || !prenom || !metier) {
      Alert.alert("Informations manquantes", "Veuillez remplir au minimum votre nom, prénom et métier.");
      return;
    }
    setPreview(true);
  };

  if (preview) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#0A1628", "#162035"]} style={[styles.header, { paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 12 }]}>
          <TouchableOpacity onPress={() => setPreview(false)} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aperçu du CV</Text>
        </LinearGradient>
        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={styles.cvCard}>
            <LinearGradient colors={["#0A1628", "#1E3A5F"]} style={styles.cvHeader}>
              <Text style={styles.cvName}>{prenom} {nom}</Text>
              <Text style={styles.cvMetier}>{metier}</Text>
              <View style={styles.cvContacts}>
                {telephone ? <Text style={styles.cvContact}>📞 {telephone}</Text> : null}
                {email ? <Text style={styles.cvContact}>✉️ {email}</Text> : null}
                {ville ? <Text style={styles.cvContact}>📍 {ville}</Text> : null}
              </View>
            </LinearGradient>

            {resume ? (
              <View style={styles.cvSection}>
                <Text style={styles.cvSectionTitle}>Profil professionnel</Text>
                <View style={styles.cvSectionBar} />
                <Text style={styles.cvSectionText}>{resume}</Text>
              </View>
            ) : null}

            {experiences.some(e => e.poste) ? (
              <View style={styles.cvSection}>
                <Text style={styles.cvSectionTitle}>Expériences professionnelles</Text>
                <View style={styles.cvSectionBar} />
                {experiences.filter(e => e.poste).map((exp, i) => (
                  <View key={i} style={styles.cvEntry}>
                    <Text style={styles.cvEntryTitle}>{exp.poste}</Text>
                    <Text style={styles.cvEntrySubtitle}>{exp.entreprise} • {exp.periode}</Text>
                    {exp.description ? <Text style={styles.cvEntryDesc}>{exp.description}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {formations.some(f => f.diplome) ? (
              <View style={styles.cvSection}>
                <Text style={styles.cvSectionTitle}>Formations</Text>
                <View style={styles.cvSectionBar} />
                {formations.filter(f => f.diplome).map((form, i) => (
                  <View key={i} style={styles.cvEntry}>
                    <Text style={styles.cvEntryTitle}>{form.diplome}</Text>
                    <Text style={styles.cvEntrySubtitle}>{form.ecole} • {form.annee}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {competences ? (
              <View style={styles.cvSection}>
                <Text style={styles.cvSectionTitle}>Compétences</Text>
                <View style={styles.cvSectionBar} />
                <View style={styles.skillsWrap}>
                  {competences.split(",").map((s, i) => (
                    <View key={i} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{s.trim()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {langues ? (
              <View style={styles.cvSection}>
                <Text style={styles.cvSectionTitle}>Langues</Text>
                <View style={styles.cvSectionBar} />
                <Text style={styles.cvSectionText}>{langues}</Text>
              </View>
            ) : null}

            <View style={styles.cvFooter}>
              <Text style={styles.cvFooterText}>Document généré via Hawtrix — Votre succès, notre mission.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8} onPress={() => Alert.alert("Partage", "Fonctionnalité de partage disponible dans la prochaine version !")}>
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>Partager / Télécharger</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const STEPS = ["Identité", "Expériences", "Formations", "Compétences"];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Générateur de CV</Text>
        <View style={styles.stepBar}>
          {STEPS.map((s, i) => (
            <View key={i} style={[styles.stepItem, i <= step && styles.stepItemActive]}>
              <Text style={[styles.stepText, i <= step && styles.stepTextActive]}>{s}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {step === 0 && (
            <View>
              <Text style={styles.sectionLabel}>Informations personnelles</Text>
              <TextInput style={styles.input} placeholder="Prénom *" value={prenom} onChangeText={setPrenom} placeholderTextColor="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Nom *" value={nom} onChangeText={setNom} placeholderTextColor="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Métier / Titre professionnel *" value={metier} onChangeText={setMetier} placeholderTextColor="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Téléphone (ex: +228 90 00 00 00)" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Email professionnel" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Ville, Pays" value={ville} onChangeText={setVille} placeholderTextColor="#9CA3AF" />
              <Text style={styles.sectionLabel}>Profil professionnel</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Décrivez-vous en 2-3 phrases (points forts, objectifs...)"
                value={resume} onChangeText={setResume}
                multiline numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={styles.sectionLabel}>Expériences professionnelles</Text>
              {experiences.map((exp, i) => (
                <View key={i} style={styles.entryCard}>
                  <Text style={styles.entryCardTitle}>Expérience {i + 1}</Text>
                  <TextInput style={styles.input} placeholder="Poste occupé" value={exp.poste} onChangeText={v => updateExp(i, "poste", v)} placeholderTextColor="#9CA3AF" />
                  <TextInput style={styles.input} placeholder="Entreprise / Organisation" value={exp.entreprise} onChangeText={v => updateExp(i, "entreprise", v)} placeholderTextColor="#9CA3AF" />
                  <TextInput style={styles.input} placeholder="Période (ex: Jan 2022 - Déc 2023)" value={exp.periode} onChangeText={v => updateExp(i, "periode", v)} placeholderTextColor="#9CA3AF" />
                  <TextInput style={[styles.input, styles.textArea]} placeholder="Description des tâches..." value={exp.description} onChangeText={v => updateExp(i, "description", v)} multiline numberOfLines={3} placeholderTextColor="#9CA3AF" />
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addExperience} activeOpacity={0.7}>
                <Ionicons name="add-circle-outline" size={20} color="#FF6B00" />
                <Text style={styles.addBtnText}>Ajouter une expérience</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.sectionLabel}>Formations</Text>
              {formations.map((form, i) => (
                <View key={i} style={styles.entryCard}>
                  <Text style={styles.entryCardTitle}>Formation {i + 1}</Text>
                  <TextInput style={styles.input} placeholder="Diplôme / Certification" value={form.diplome} onChangeText={v => updateForm(i, "diplome", v)} placeholderTextColor="#9CA3AF" />
                  <TextInput style={styles.input} placeholder="École / Université / Centre" value={form.ecole} onChangeText={v => updateForm(i, "ecole", v)} placeholderTextColor="#9CA3AF" />
                  <TextInput style={styles.input} placeholder="Année (ex: 2021)" value={form.annee} onChangeText={v => updateForm(i, "annee", v)} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addFormation} activeOpacity={0.7}>
                <Ionicons name="add-circle-outline" size={20} color="#FF6B00" />
                <Text style={styles.addBtnText}>Ajouter une formation</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.sectionLabel}>Compétences & Langues</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Compétences séparées par des virgules&#10;Ex: Électricité, Plomberie, Soudure, SAP"
                value={competences} onChangeText={setCompetences}
                multiline numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={styles.input}
                placeholder="Langues parlées (ex: Français, Éwé, Anglais)"
                value={langues} onChangeText={setLangues}
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.previewHint}>
                <Ionicons name="information-circle" size={18} color="#FF6B00" />
                <Text style={styles.previewHintText}>Votre CV est prêt à être généré. Cliquez sur "Générer mon CV" pour voir l'aperçu.</Text>
              </View>
            </View>
          )}

          <View style={styles.navRow}>
            {step < 3 ? (
              <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)} activeOpacity={0.8}>
                <Text style={styles.nextBtnText}>Suivant</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.generateBtn} onPress={generateCV} activeOpacity={0.8}>
                <Ionicons name="document-text" size={20} color="#FFFFFF" />
                <Text style={styles.generateBtnText}>Générer mon CV</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", marginBottom: 16 },
  stepBar: { flexDirection: "row", gap: 6 },
  stepItem: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 4, padding: 6, alignItems: "center" },
  stepItemActive: { backgroundColor: "#FF6B00" },
  stepText: { fontSize: 10, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_500Medium" },
  stepTextActive: { color: "#FFFFFF", fontWeight: "700" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 16, fontWeight: "700", color: "#0A1628", marginBottom: 12, marginTop: 8, fontFamily: "Inter_700Bold" },
  input: {
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14,
    fontSize: 14, color: "#0A1628", marginBottom: 10,
    borderWidth: 1, borderColor: "#E5E7EB", fontFamily: "Inter_400Regular",
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },
  entryCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  entryCardTitle: { fontSize: 13, fontWeight: "600", color: "#FF6B00", marginBottom: 10, fontFamily: "Inter_600SemiBold" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: "#FF6B00", borderStyle: "dashed", justifyContent: "center" },
  addBtnText: { fontSize: 14, color: "#FF6B00", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  previewHint: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#FFF3E0", borderRadius: 12, padding: 14, marginTop: 8 },
  previewHintText: { flex: 1, fontSize: 13, color: "#92400E", lineHeight: 20, fontFamily: "Inter_400Regular" },
  navRow: { marginTop: 24 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#0A1628", borderRadius: 14, padding: 16 },
  nextBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  generateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FF6B00", borderRadius: 14, padding: 16 },
  generateBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  cvCard: { backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden", marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  cvHeader: { padding: 24, alignItems: "center" },
  cvName: { fontSize: 24, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", textAlign: "center" },
  cvMetier: { fontSize: 15, color: "#FF6B00", marginTop: 4, fontFamily: "Inter_500Medium" },
  cvContacts: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12, justifyContent: "center" },
  cvContact: { fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular" },
  cvSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  cvSectionTitle: { fontSize: 14, fontWeight: "700", color: "#0A1628", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Inter_700Bold" },
  cvSectionBar: { width: 40, height: 3, backgroundColor: "#FF6B00", borderRadius: 2, marginTop: 6, marginBottom: 12 },
  cvSectionText: { fontSize: 13, color: "#4B5563", lineHeight: 20, fontFamily: "Inter_400Regular" },
  cvEntry: { marginBottom: 14 },
  cvEntryTitle: { fontSize: 14, fontWeight: "600", color: "#0A1628", fontFamily: "Inter_600SemiBold" },
  cvEntrySubtitle: { fontSize: 12, color: "#FF6B00", marginTop: 2, fontFamily: "Inter_500Medium" },
  cvEntryDesc: { fontSize: 13, color: "#6B7280", marginTop: 4, lineHeight: 19, fontFamily: "Inter_400Regular" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { backgroundColor: "#EDE9FE", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  skillChipText: { fontSize: 12, color: "#7C3AED", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  cvFooter: { padding: 16, alignItems: "center", backgroundColor: "#F9FAFB" },
  cvFooterText: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#FF6B00", borderRadius: 14, padding: 16 },
  shareBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
