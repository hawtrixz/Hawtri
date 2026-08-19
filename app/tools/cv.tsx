import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

type ModelId = 0 | 1 | 2;

const MODELS = [
  { id: 0 as ModelId, name: "Classique", accent: "#0A1628", second: "#1E3A5F", desc: "Bleu marine sobre, idéal pour les entreprises" },
  { id: 1 as ModelId, name: "Moderne", accent: "#FF6B00", second: "#FF8C3A", desc: "Orange dynamique, idéal pour le commerce" },
  { id: 2 as ModelId, name: "Élégant", accent: "#374151", second: "#059669", desc: "Gris anthracite et vert, idéal pour les services" },
];

const LANG_SUGGESTIONS = ["Français", "Anglais", "Éwé", "Kabyè", "Mina"];

interface CvData {
  fullName: string;
  profession: string;
  phone: string;
  email: string;
  address: string;
  profile: string;
  experiences: string[];
  educations: string[];
  skills: string[];
  languages: string[];
}

const initialData: CvData = {
  fullName: "",
  profession: "",
  phone: "",
  email: "",
  address: "",
  profile: "",
  experiences: [""],
  educations: [""],
  skills: [""],
  languages: [""],
};

function sectionToHtml(title: string, items: string[]): string {
  const valid = items.filter(i => i.trim());
  if (valid.length === 0) return "";
  return `
    <div class="section">
      <div class="section-title"><span></span>${title}</div>
      ${valid.map(i => `<div class="item">${i.trim()}</div>`).join("")}
    </div>`;
}

function buildCvHtml(data: CvData, model: typeof MODELS[number]): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
  .page { width: 210mm; min-height: 297mm; }
  .head { background: linear-gradient(135deg, ${model.accent}, ${model.second}); color: #fff; padding: 30px 32px 26px; }
  .head h1 { font-size: 26px; margin-bottom: 6px; }
  .head h2 { font-size: 15px; font-weight: 500; color: ${model.id === 2 ? "#D1FAE5" : "#FFC999"}; margin-bottom: 14px; }
  .contact { font-size: 12px; opacity: 0.92; display: flex; flex-wrap: wrap; gap: 14px; }
  .contact div { display: flex; align-items: center; gap: 5px; }
  .body { padding: 24px 32px; }
  .profile { font-size: 13px; line-height: 1.55; color: #444; margin-bottom: 18px; }
  .section { margin-bottom: 16px; }
  .section-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${model.accent}; margin-bottom: 8px; }
  .section-title span { width: 26px; height: 3px; background: ${model.accent}; display: inline-block; }
  .item { font-size: 13px; color: #444; padding: 4px 0 4px 14px; border-left: 2px solid ${model.id === 2 ? model.second : model.accent + "55"}; margin-bottom: 5px; line-height: 1.45; }
</style>
</head>
<body>
  <div class="page">
    <div class="head">
      <h1>${data.fullName || "Prénom Nom"}</h1>
      <h2>${data.profession || "Votre métier"}</h2>
      <div class="contact">
        ${data.phone ? `<div>&#9742; ${data.phone}</div>` : ""}
        ${data.email ? `<div>&#9993; ${data.email}</div>` : ""}
        ${data.address ? `<div>&#9906; ${data.address}</div>` : ""}
      </div>
    </div>
    <div class="body">
      ${data.profile.trim() ? `<div class="profile">${data.profile.trim()}</div>` : ""}
      ${sectionToHtml("Expériences", data.experiences)}
      ${sectionToHtml("Formations", data.educations)}
      ${sectionToHtml("Compétences", data.skills)}
      ${sectionToHtml("Langues", data.languages)}
    </div>
  </div>
</body>
</html>`;
}

export default function CvScreen() {
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState<number>(-1); // -1 : choix du modèle, 0 : formulaire, 1 : aperçu
  const [model, setModel] = useState<ModelId>(0);
  const [data, setData] = useState<CvData>({ ...initialData, fullName: `${user?.surname ?? ""} ${user?.name ?? ""}`.trim(), profession: user?.profession ?? "" });
  const [saving, setSaving] = useState(false);

  const setField = (key: keyof CvData, value: string) => setData(d => ({ ...d, [key]: value }));
  const setListItem = (key: "experiences" | "educations" | "skills" | "languages", index: number, value: string) =>
    setData(d => ({ ...d, [key]: d[key].map((v, i) => (i === index ? value : v)) }));
  const addListItem = (key: "experiences" | "educations" | "skills" | "languages") =>
    setData(d => ({ ...d, [key]: [...d[key], ""] }));

  const selectedModel = MODELS.find(m => m.id === model)!;

  const exportPdf = async () => {
    setSaving(true);
    try {
      const html = buildCvHtml(data, selectedModel);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
      } else {
        Alert.alert("CV exporté", `Le PDF A4 de votre CV a été créé : ${uri}`);
      }
    } catch {
      Alert.alert("Erreur", "Impossible de générer le PDF. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  // --- Écran de choix du modèle ---
  if (step === -1) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer mon CV</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: botPad + 32 }}>
          <Text style={styles.intro}>Choisissez un modèle pour commencer, puis remplissez vos informations.</Text>
          {MODELS.map(m => (
            <TouchableOpacity key={m.id} style={styles.modelCard} onPress={() => { setModel(m.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(0); }} activeOpacity={0.8}>
              <LinearGradient colors={[m.accent, m.second]} style={styles.modelPreview}>
                <View style={styles.modelPreviewHead}>
                  <View style={styles.modelPreviewName} />
                  <View style={[styles.modelPreviewJob, { backgroundColor: m.id === 2 ? "#D1FAE5" : "rgba(255,255,255,0.35)" }]} />
                </View>
                <View style={styles.modelPreviewLines}>
                  <View style={styles.modelPreviewLine} />
                  <View style={[styles.modelPreviewLine, { width: "70%" }]} />
                </View>
              </LinearGradient>
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>{m.name}</Text>
                <Text style={styles.modelDesc}>{m.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // --- Écran de remplissage ---
  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: topPad }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => setStep(-1)} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon CV · {selectedModel.name}</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: botPad + 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations personnelles</Text>
          <TextInput style={styles.input} placeholder="Prénom et nom *" placeholderTextColor="#9CA3AF" value={data.fullName} onChangeText={v => setField("fullName", v)} />
          <TextInput style={styles.input} placeholder="Métier ou titre (ex : Informaticien) *" placeholderTextColor="#9CA3AF" value={data.profession} onChangeText={v => setField("profession", v)} />
          <TextInput style={styles.input} placeholder="Téléphone (ex : +228 90 00 00 00)" placeholderTextColor="#9CA3AF" value={data.phone} onChangeText={v => setField("phone", v)} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9CA3AF" value={data.email} onChangeText={v => setField("email", v)} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Ville / Quartier" placeholderTextColor="#9CA3AF" value={data.address} onChangeText={v => setField("address", v)} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="Petit résumé de vous : votre parcours, vos objectifs, ce qui vous motive..." placeholderTextColor="#9CA3AF" value={data.profile} onChangeText={v => setField("profile", v)} multiline maxLength={400} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Expériences professionnelles</Text>
            <TouchableOpacity onPress={() => addListItem("experiences")} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={24} color="#FF6B00" />
            </TouchableOpacity>
          </View>
          {data.experiences.map((exp, i) => (
            <TextInput key={i} style={[styles.input, styles.textArea, styles.small]} placeholder={`Ex : Électricien chez Entreprise X (2022 - 2024)`} placeholderTextColor="#9CA3AF" value={exp} onChangeText={v => setListItem("experiences", i, v)} multiline />
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Formations</Text>
            <TouchableOpacity onPress={() => addListItem("educations")} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={24} color="#FF6B00" />
            </TouchableOpacity>
          </View>
          {data.educations.map((edu, i) => (
            <TextInput key={i} style={[styles.input, styles.textArea, styles.small]} placeholder={`Ex : BTS Informatique, Université de Lomé (2020 - 2022)`} placeholderTextColor="#9CA3AF" value={edu} onChangeText={v => setListItem("educations", i, v)} multiline />
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Compétences</Text>
            <TouchableOpacity onPress={() => addListItem("skills")} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={24} color="#FF6B00" />
            </TouchableOpacity>
          </View>
          {data.skills.map((skill, i) => (
            <TextInput key={i} style={[styles.input, styles.small]} placeholder={`Ex : Réparation téléphonique, HTML, relation client (${i + 1})`} placeholderTextColor="#9CA3AF" value={skill} onChangeText={v => setListItem("skills", i, v)} />
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Langues</Text>
            <TouchableOpacity onPress={() => addListItem("languages")} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={24} color="#FF6B00" />
            </TouchableOpacity>
          </View>
          {data.languages.map((lang, i) => (
            <View key={i} style={styles.langRow}>
              <TextInput style={[styles.input, styles.small, styles.langInput]} placeholder={`Langue (${i + 1})`} placeholderTextColor="#9CA3AF" value={lang} onChangeText={v => setListItem("languages", i, v)} />
              {LANG_SUGGESTIONS.map(s => (
                <TouchableOpacity key={s} style={[styles.langChip, lang.toLowerCase().includes(s.toLowerCase()) && styles.langChipActive]} onPress={() => setListItem("languages", i, s)} activeOpacity={0.7}>
                  <Text style={[styles.langChipText, lang.toLowerCase().includes(s.toLowerCase()) && styles.langChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.previewBtn} onPress={() => {
          if (!data.fullName.trim() || !data.profession.trim()) {
            Alert.alert("Champs obligatoires", "Remplissez au moins votre nom et votre métier pour générer le CV.");
            return;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setStep(1);
        }} activeOpacity={0.8}>
          <Text style={styles.previewBtnText}>Voir mon CV (format A4)</Text>
        </TouchableOpacity>
      </ScrollView>

      {step === 1 && (
        <View style={[styles.previewOverlay, { paddingBottom: botPad }]}>
          <ScrollView style={styles.previewScroll} contentContainerStyle={{ padding: 16, paddingBottom: 16 }}>
            <LinearGradient colors={[selectedModel.accent, selectedModel.second]} style={styles.previewHead}>
              <Text style={styles.previewName}>{data.fullName}</Text>
              <Text style={styles.previewProfession}>{data.profession}</Text>
              <View style={styles.previewContact}>
                {data.phone ? <Text style={styles.previewContactItem}>☎ {data.phone}</Text> : null}
                {data.email ? <Text style={styles.previewContactItem}>✉ {data.email}</Text> : null}
                {data.address ? <Text style={styles.previewContactItem}>📍 {data.address}</Text> : null}
              </View>
            </LinearGradient>
            {data.profile.trim() ? <View style={styles.previewSection}><Text style={styles.previewSectionTitle}>Profil</Text><Text style={styles.previewText}>{data.profile}</Text></View> : null}
            <View style={styles.previewSection}>{["Expériences", "Formations", "Compétences", "Langues"].map((title, ti) => {
              const key = ["experiences", "educations", "skills", "languages"][ti] as keyof CvData;
              const items = (data[key] as string[]).filter(i => i.trim());
              return items.length > 0 ? (
                <View key={title} style={styles.previewSubSection}>
                  <Text style={[styles.previewSectionTitle, { color: selectedModel.accent }]}>{title}</Text>
                  {items.map((item, ii) => (
                    <Text key={ii} style={styles.previewItem}>• {item}</Text>
                  ))}
                </View>
              ) : null;
            })}</View>
          </ScrollView>
          <TouchableOpacity style={[styles.exportBtn, saving && styles.exportBtnDisabled]} onPress={exportPdf} disabled={saving} activeOpacity={0.8}>
            <Ionicons name="share-social" size={18} color="#FFFFFF" />
            <Text style={styles.exportBtnText}>{saving ? "Génération..." : "Partager / Télécharger (PDF A4)"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closePreviewBtn} onPress={() => setStep(0)} activeOpacity={0.7}>
            <Text style={styles.closePreviewText}>Modifier encore</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  intro: { fontSize: 15, color: "#6B7280", fontFamily: "Inter_400Regular", lineHeight: 22 },
  modelCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, gap: 12 },
  modelPreview: { width: 80, height: 100, borderRadius: 10, padding: 10, gap: 6 },
  modelPreviewHead: { gap: 4 },
  modelPreviewName: { width: "60%", height: 8, backgroundColor: "#FFFFFF", borderRadius: 4 },
  modelPreviewJob: { width: "45%", height: 6, borderRadius: 3 },
  modelPreviewLines: { gap: 4, marginTop: 6 },
  modelPreviewLine: { height: 4, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 2 },
  modelInfo: { flex: 1, gap: 2 },
  modelName: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  modelDesc: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  cardTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  input: { backgroundColor: "#F5F6FA", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#0A1628", fontFamily: "Inter_400Regular", borderWidth: 1, borderColor: "#E5E7EB" },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  small: { minHeight: 46 },
  langRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  langInput: { flex: 1, minWidth: 120, marginBottom: 6 },
  langChip: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  langChipActive: { backgroundColor: "#FF6B00" },
  langChipText: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_500Medium" },
  langChipTextActive: { color: "#FFFFFF" },
  previewBtn: { backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  previewBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  previewOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#F5F6FA" },
  previewScroll: { flex: 1 },
  previewHead: { borderRadius: 16, padding: 24, alignItems: "center", gap: 6, marginBottom: 16 },
  previewName: { fontSize: 24, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  previewProfession: { fontSize: 15, color: "#FFC999", fontFamily: "Inter_600SemiBold" },
  previewContact: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 8 },
  previewContactItem: { fontSize: 12, color: "#FFFFFF" },
  previewSection: { gap: 6, marginBottom: 12 },
  previewSubSection: { gap: 4, marginBottom: 10 },
  previewSectionTitle: { fontSize: 14, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", textTransform: "uppercase" },
  previewText: { fontSize: 13, color: "#4B5563", fontFamily: "Inter_400Regular", lineHeight: 20 },
  previewItem: { fontSize: 13, color: "#4B5563", fontFamily: "Inter_400Regular", lineHeight: 20, paddingLeft: 6 },
  exportBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 16, marginHorizontal: 16 },
  exportBtnDisabled: { backgroundColor: "#FDA96A" },
  exportBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  closePreviewBtn: { paddingVertical: 10, alignItems: "center" },
  closePreviewText: { fontSize: 13, color: "#FF6B00", fontFamily: "Inter_600SemiBold" },
});
