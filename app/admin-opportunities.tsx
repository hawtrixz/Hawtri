import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { backend } from "@/utils/backend";
import { TYPES } from "@/data/opportunities";

const EMPTY = { type: "Emploi", title: "", org: "", country: "Togo", deadline: "", description: "", requirements: "", url: "", applyInfo: "", edition: "" };

type FormState = typeof EMPTY;

export default function AdminOpportunitiesScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await backend.adminGetOpportunities()); }
    catch (error) { Alert.alert("Erreur", error instanceof Error ? error.message : "Impossible de charger les opportunités"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setField = (key: keyof FormState, value: string) => setForm((old) => ({ ...old, [key]: value }));

  const create = async () => {
    if (!form.title.trim() || !form.deadline.trim() || !form.url.trim()) {
      Alert.alert("Champs obligatoires", "Remplissez au minimum le titre, la date limite et le lien officiel.");
      return;
    }
    setSaving(true);
    try {
      await backend.adminCreateOpportunity(form);
      setForm(EMPTY);
      await load();
      Alert.alert("Publié", "L'opportunité est maintenant disponible dans l'application.");
    } catch (error) { Alert.alert("Publication impossible", error instanceof Error ? error.message : "Vérifiez les informations saisies"); }
    finally { setSaving(false); }
  };

  const disable = (id: string) => Alert.alert("Désactiver l'offre", "Elle disparaîtra des utilisateurs mais restera visible dans votre panneau.", [
    { text: "Annuler", style: "cancel" },
    { text: "Désactiver", style: "destructive", onPress: async () => { try { await backend.adminDisableOpportunity(id); await load(); } catch (error) { Alert.alert("Erreur", error instanceof Error ? error.message : "Action impossible"); } } },
  ]);

  const field = (key: keyof FormState, label: string, placeholder: string, multiline = false) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={form[key]} onChangeText={(value) => setField(key, value)} placeholder={placeholder} placeholderTextColor="#9CA3AF" multiline={multiline} style={[styles.input, multiline && styles.multiline]} autoCapitalize="sentences" />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={24} color="#FFFFFF" /></TouchableOpacity>
          <Text style={styles.title}>Gestion des opportunités</Text>
          <Text style={styles.subtitle}>Publiez uniquement des offres vérifiées avec leur lien officiel.</Text>
        </LinearGradient>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Nouvelle opportunité</Text>
          <Text style={styles.label}>Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {TYPES.map((type) => <TouchableOpacity key={type} onPress={() => setField("type", type)} style={[styles.chip, form.type === type && styles.chipActive]}><Text style={[styles.chipText, form.type === type && styles.chipTextActive]}>{type}</Text></TouchableOpacity>)}
          </ScrollView>
          {field("title", "Titre *", "Ex. Bourse d'études 2027")}
          {field("org", "Organisme", "Ex. Ministère ou organisation")}
          {field("country", "Pays / zone", "Ex. Togo ou Afrique")}
          {field("deadline", "Date limite *", "Ex. 30 septembre 2027")}
          {field("url", "Lien officiel *", "https://site-officiel.org/candidature")}
          {field("edition", "Édition", "Ex. 2027-2028")}
          {field("description", "Description", "Présentez l'offre...", true)}
          {field("requirements", "Conditions", "Qui peut postuler ?", true)}
          {field("applyInfo", "Procédure", "Comment postuler officiellement ?", true)}
          <TouchableOpacity onPress={create} disabled={saving} style={styles.publish}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <><Ionicons name="cloud-upload" size={19} color="#FFFFFF" /><Text style={styles.publishText}>Publier l'opportunité</Text></>}</TouchableOpacity>
        </View>
        <View style={styles.listHeader}><Text style={styles.sectionTitle}>Offres publiées</Text><TouchableOpacity onPress={load}><Ionicons name="refresh" size={22} color="#FF6B00" /></TouchableOpacity></View>
        {loading ? <ActivityIndicator color="#FF6B00" style={{ marginTop: 20 }} /> : <FlatList scrollEnabled={false} data={items} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }} ListEmptyComponent={<Text style={styles.empty}>Aucune offre publiée.</Text>} renderItem={({ item }) => <View style={[styles.offer, !item.active && styles.offerOff]}><View style={{ flex: 1 }}><Text style={styles.offerTitle}>{item.title}</Text><Text style={styles.offerMeta}>{item.type} · limite : {item.deadline}</Text><Text style={styles.offerStatus}>{item.active ? "Visible par les utilisateurs" : "Désactivée"}</Text></View>{item.active && <TouchableOpacity onPress={() => disable(item.id)} style={styles.disable}><Ionicons name="eye-off" size={18} color="#FFFFFF" /></TouchableOpacity>}</View>} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  back: { marginBottom: 12 },
  title: { color: "#FFFFFF", fontSize: 23, fontWeight: "800" },
  subtitle: { color: "#CBD5E1", fontSize: 13, marginTop: 6, lineHeight: 19 },
  formCard: { backgroundColor: "#FFFFFF", margin: 16, borderRadius: 18, padding: 16, elevation: 2 },
  sectionTitle: { color: "#0A1628", fontSize: 18, fontWeight: "800" },
  label: { color: "#374151", fontSize: 12, fontWeight: "700", marginBottom: 6, marginTop: 12 },
  field: { marginTop: 1 },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: "#0A1628", backgroundColor: "#FAFAFA", fontSize: 14 },
  multiline: { minHeight: 82, textAlignVertical: "top" },
  chips: { gap: 7, paddingVertical: 4 },
  chip: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 18, paddingHorizontal: 11, paddingVertical: 8 },
  chipActive: { backgroundColor: "#FF6B00", borderColor: "#FF6B00" },
  chipText: { color: "#6B7280", fontSize: 12 },
  chipTextActive: { color: "#FFFFFF", fontWeight: "800" },
  publish: { marginTop: 18, backgroundColor: "#0A1628", borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  publishText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  listHeader: { paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  offer: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  offerOff: { opacity: 0.55 },
  offerTitle: { color: "#0A1628", fontWeight: "800", fontSize: 14 },
  offerMeta: { color: "#6B7280", fontSize: 12, marginTop: 4 },
  offerStatus: { color: "#059669", fontSize: 11, marginTop: 4, fontWeight: "700" },
  disable: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" },
  empty: { color: "#9CA3AF", textAlign: "center", padding: 20 },
});

