import { useState } from "react";
import { router } from "expo-router";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Ligne = { description: string; quantite: string; prixUnit: string };

const formatNumber = (n: number) => n.toLocaleString("fr-FR");

let factureCounter = 1;

export default function FactureScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [preview, setPreview] = useState(false);
  const [nomPrestataire, setNomPrestataire] = useState("");
  const [metierPrestataire, setMetierPrestataire] = useState("");
  const [telPrestataire, setTelPrestataire] = useState("");
  const [rccm, setRccm] = useState("");
  const [nomClient, setNomClient] = useState("");
  const [telClient, setTelClient] = useState("");
  const [adresseClient, setAdresseClient] = useState("");
  const [objet, setObjet] = useState("");
  const [modePaiement, setModePaiement] = useState("TMoney / Flooz");
  const [lignes, setLignes] = useState<Ligne[]>([
    { description: "", quantite: "1", prixUnit: "" },
  ]);
  const [factureNum] = useState(() => {
    const num = factureCounter++;
    const year = new Date().getFullYear();
    return `FAC-${year}-${String(num).padStart(4, "0")}`;
  });

  const addLigne = () => setLignes([...lignes, { description: "", quantite: "1", prixUnit: "" }]);
  const removeLigne = (i: number) => setLignes(lignes.filter((_, idx) => idx !== i));
  const updateLigne = (i: number, field: keyof Ligne, val: string) => {
    const updated = [...lignes];
    updated[i] = { ...updated[i], [field]: val };
    setLignes(updated);
  };

  const calcTotal = () =>
    lignes.reduce((sum, l) => {
      const q = parseFloat(l.quantite) || 0;
      const p = parseFloat(l.prixUnit) || 0;
      return sum + q * p;
    }, 0);

  const today = new Date().toLocaleDateString("fr-FR");

  const generer = () => {
    if (!nomPrestataire || !nomClient || !objet || !lignes[0].description) {
      Alert.alert("Informations manquantes", "Remplissez au minimum : votre nom, le client, l'objet et au moins une prestation.");
      return;
    }
    setPreview(true);
  };

  if (preview) {
    const total = calcTotal();
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#0A1628", "#162035"]} style={[styles.header, { paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 12 }]}>
          <TouchableOpacity onPress={() => setPreview(false)} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aperçu de la Facture</Text>
        </LinearGradient>
        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={styles.docCard}>
            <LinearGradient colors={["#0A1628", "#1E3A5F"]} style={styles.docTop}>
              <View>
                <Text style={styles.docTypeLabel}>FACTURE</Text>
                <Text style={styles.docNum}>N° {factureNum}</Text>
                <Text style={styles.docDate}>Date d'émission : {today}</Text>
              </View>
              <View style={styles.docBrand}>
                <Text style={styles.docBrandName}>{nomPrestataire}</Text>
                <Text style={styles.docBrandMeta}>{metierPrestataire}</Text>
                {telPrestataire ? <Text style={styles.docBrandMeta}>📞 {telPrestataire}</Text> : null}
                {rccm ? <Text style={styles.docBrandMeta}>RCCM: {rccm}</Text> : null}
              </View>
            </LinearGradient>

            <View style={styles.docClientSection}>
              <Text style={styles.docClientLabel}>FACTURÉ À :</Text>
              <Text style={styles.docClientName}>{nomClient}</Text>
              {telClient ? <Text style={styles.docClientMeta}>📞 {telClient}</Text> : null}
              {adresseClient ? <Text style={styles.docClientMeta}>📍 {adresseClient}</Text> : null}
            </View>

            <View style={styles.docObjRow}>
              <Ionicons name="briefcase-outline" size={16} color="#10B981" />
              <Text style={styles.docObjText}>Objet : <Text style={{ fontWeight: "700" }}>{objet}</Text></Text>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Désignation</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>Qté</Text>
              <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>P.U. (FCFA)</Text>
              <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>Montant</Text>
            </View>

            {lignes.filter(l => l.description).map((l, i) => {
              const t = (parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnit) || 0);
              return (
                <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                  <Text style={[styles.tableCellBody, { flex: 3 }]}>{l.description}</Text>
                  <Text style={[styles.tableCellBody, { flex: 1, textAlign: "center" }]}>{l.quantite}</Text>
                  <Text style={[styles.tableCellBody, { flex: 2, textAlign: "right" }]}>{formatNumber(parseFloat(l.prixUnit) || 0)}</Text>
                  <Text style={[styles.tableCellBody, { flex: 2, textAlign: "right", fontWeight: "600", color: "#0A1628" }]}>{formatNumber(t)}</Text>
                </View>
              );
            })}

            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total HT</Text>
                <Text style={styles.totalVal}>{formatNumber(total)} FCFA</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TVA (18%)</Text>
                <Text style={styles.totalVal}>{formatNumber(Math.round(total * 0.18))} FCFA</Text>
              </View>
              <View style={[styles.totalRow, styles.totalFinalRow]}>
                <Text style={styles.totalFinalLabel}>TOTAL TTC</Text>
                <Text style={styles.totalFinalAmount}>{formatNumber(Math.round(total * 1.18))} FCFA</Text>
              </View>
            </View>

            <View style={styles.paySection}>
              <Text style={styles.paySectionTitle}>Modalités de paiement</Text>
              <View style={styles.payRow}>
                <Ionicons name="phone-portrait-outline" size={16} color="#10B981" />
                <Text style={styles.payText}>{modePaiement}</Text>
              </View>
              <Text style={styles.payNote}>Paiement dû à réception de la facture.</Text>
            </View>

            <View style={styles.signRow}>
              <View style={styles.signBox}>
                <Text style={styles.signLabel}>Signature & Cachet</Text>
                <View style={styles.signLine} />
                <Text style={styles.signName}>{nomPrestataire}</Text>
              </View>
              <View style={styles.signBox}>
                <Text style={styles.signLabel}>Reçu & Approuvé</Text>
                <View style={styles.signLine} />
                <Text style={styles.signName}>{nomClient}</Text>
              </View>
            </View>

            <View style={styles.docFooter}>
              <Text style={styles.docFooterText}>Document officiel généré via Hawtrix — Votre succès, notre mission.</Text>
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

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Générateur de Facture</Text>
        <Text style={styles.headerSub}>Facture professionnelle numérotée automatiquement</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.factureNumBadge}>
            <Ionicons name="document" size={16} color="#10B981" />
            <Text style={styles.factureNumText}>Numéro de facture : <Text style={{ fontWeight: "700" }}>{factureNum}</Text></Text>
          </View>

          <Text style={styles.sectionLabel}>Vos informations</Text>
          <TextInput style={styles.input} placeholder="Votre nom complet *" value={nomPrestataire} onChangeText={setNomPrestataire} placeholderTextColor="#9CA3AF" />
          <TextInput style={styles.input} placeholder="Votre métier / activité" value={metierPrestataire} onChangeText={setMetierPrestataire} placeholderTextColor="#9CA3AF" />
          <TextInput style={styles.input} placeholder="Votre téléphone" value={telPrestataire} onChangeText={setTelPrestataire} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />
          <TextInput style={styles.input} placeholder="N° RCCM (optionnel)" value={rccm} onChangeText={setRccm} placeholderTextColor="#9CA3AF" />

          <Text style={styles.sectionLabel}>Client</Text>
          <TextInput style={styles.input} placeholder="Nom du client *" value={nomClient} onChangeText={setNomClient} placeholderTextColor="#9CA3AF" />
          <TextInput style={styles.input} placeholder="Téléphone du client" value={telClient} onChangeText={setTelClient} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />
          <TextInput style={styles.input} placeholder="Adresse / Quartier du client" value={adresseClient} onChangeText={setAdresseClient} placeholderTextColor="#9CA3AF" />

          <Text style={styles.sectionLabel}>Détail de la facturation</Text>
          <TextInput style={styles.input} placeholder="Objet de la facture *" value={objet} onChangeText={setObjet} placeholderTextColor="#9CA3AF" />

          {lignes.map((l, i) => (
            <View key={i} style={styles.ligneCard}>
              <View style={styles.ligneCardHeader}>
                <Text style={styles.ligneCardTitle}>Article / Prestation {i + 1}</Text>
                {i > 0 && (
                  <TouchableOpacity onPress={() => removeLigne(i)} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput style={styles.input} placeholder="Désignation *" value={l.description} onChangeText={v => updateLigne(i, "description", v)} placeholderTextColor="#9CA3AF" />
              <View style={styles.ligneRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Qté"
                  value={l.quantite}
                  onChangeText={v => updateLigne(i, "quantite", v)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={[styles.input, { flex: 2, marginLeft: 10 }]}
                  placeholder="Prix unitaire HT (FCFA)"
                  value={l.prixUnit}
                  onChangeText={v => updateLigne(i, "prixUnit", v)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addLigne} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={20} color="#10B981" />
            <Text style={[styles.addBtnText, { color: "#10B981" }]}>Ajouter un article</Text>
          </TouchableOpacity>

          {calcTotal() > 0 && (
            <View style={styles.totalPreview}>
              <View style={styles.totalPreviewRow}>
                <Text style={styles.totalPreviewLabel}>Total HT</Text>
                <Text style={styles.totalPreviewVal}>{formatNumber(calcTotal())} FCFA</Text>
              </View>
              <View style={styles.totalPreviewRow}>
                <Text style={styles.totalPreviewLabel}>TVA 18%</Text>
                <Text style={styles.totalPreviewVal}>{formatNumber(Math.round(calcTotal() * 0.18))} FCFA</Text>
              </View>
              <View style={[styles.totalPreviewRow, { borderTopWidth: 1, borderTopColor: "#D1FAE5", paddingTop: 10, marginTop: 4 }]}>
                <Text style={[styles.totalPreviewLabel, { color: "#10B981", fontWeight: "700" }]}>Total TTC</Text>
                <Text style={[styles.totalPreviewVal, { color: "#10B981", fontWeight: "700", fontSize: 18 }]}>{formatNumber(Math.round(calcTotal() * 1.18))} FCFA</Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionLabel}>Paiement</Text>
          <TextInput
            style={styles.input}
            placeholder="Mode de paiement (ex: TMoney / Flooz)"
            value={modePaiement}
            onChangeText={setModePaiement}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={[styles.generateBtn, { backgroundColor: "#10B981" }]} onPress={generer} activeOpacity={0.8}>
            <Ionicons name="cash" size={20} color="#FFFFFF" />
            <Text style={styles.generateBtnText}>Générer la Facture</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4, fontFamily: "Inter_400Regular" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  factureNumBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#D1FAE5", borderRadius: 10, padding: 12, marginBottom: 20 },
  factureNumText: { fontSize: 14, color: "#065F46", fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 16, fontWeight: "700", color: "#0A1628", marginBottom: 12, marginTop: 8, fontFamily: "Inter_700Bold" },
  input: {
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14,
    fontSize: 14, color: "#0A1628", marginBottom: 10,
    borderWidth: 1, borderColor: "#E5E7EB", fontFamily: "Inter_400Regular",
  },
  ligneCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  ligneCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  ligneCardTitle: { fontSize: 13, fontWeight: "600", color: "#10B981", fontFamily: "Inter_600SemiBold" },
  ligneRow: { flexDirection: "row" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: "#10B981", borderStyle: "dashed", justifyContent: "center", marginBottom: 16 },
  addBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  totalPreview: { backgroundColor: "#D1FAE5", borderRadius: 12, padding: 16, marginBottom: 16 },
  totalPreviewRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalPreviewLabel: { fontSize: 14, color: "#065F46", fontFamily: "Inter_400Regular" },
  totalPreviewVal: { fontSize: 14, color: "#065F46", fontFamily: "Inter_500Medium" },
  generateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, padding: 16, marginTop: 8 },
  generateBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  docCard: { backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden", marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  docTop: { flexDirection: "row", justifyContent: "space-between", padding: 20 },
  docTypeLabel: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  docNum: { fontSize: 13, color: "#10B981", fontFamily: "Inter_500Medium" },
  docDate: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2, fontFamily: "Inter_400Regular" },
  docBrand: { alignItems: "flex-end" },
  docBrandName: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", textAlign: "right" },
  docBrandMeta: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", textAlign: "right" },
  docClientSection: { padding: 20, backgroundColor: "#F9FAFB", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  docClientLabel: { fontSize: 10, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontFamily: "Inter_700Bold" },
  docClientName: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  docClientMeta: { fontSize: 13, color: "#4B5563", fontFamily: "Inter_400Regular", marginTop: 2 },
  docObjRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#D1FAE5", marginHorizontal: 20, borderRadius: 8, padding: 10, marginVertical: 12 },
  docObjText: { fontSize: 13, color: "#065F46", fontFamily: "Inter_400Regular", flex: 1 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0A1628", paddingHorizontal: 16, paddingVertical: 10 },
  tableCell: { fontSize: 11, color: "#FFFFFF", fontWeight: "700", textTransform: "uppercase", fontFamily: "Inter_700Bold" },
  tableRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10 },
  tableRowAlt: { backgroundColor: "#F9FAFB" },
  tableCellBody: { fontSize: 13, color: "#4B5563", fontFamily: "Inter_400Regular" },
  totalSection: { borderTopWidth: 2, borderTopColor: "#0A1628", padding: 20 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  totalLabel: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular" },
  totalVal: { fontSize: 14, color: "#0A1628", fontFamily: "Inter_500Medium" },
  totalFinalRow: { backgroundColor: "#10B981", borderRadius: 8, padding: 12, marginTop: 4 },
  totalFinalLabel: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  totalFinalAmount: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  paySection: { padding: 20, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  paySectionTitle: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginBottom: 8, fontFamily: "Inter_600SemiBold" },
  payRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  payText: { fontSize: 14, color: "#0A1628", fontFamily: "Inter_500Medium" },
  payNote: { fontSize: 12, color: "#9CA3AF", marginTop: 6, fontFamily: "Inter_400Regular" },
  signRow: { flexDirection: "row", padding: 20, gap: 16, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  signBox: { flex: 1, alignItems: "center" },
  signLabel: { fontSize: 11, color: "#6B7280", textAlign: "center", marginBottom: 30, fontFamily: "Inter_400Regular" },
  signLine: { width: "100%", height: 1, backgroundColor: "#D1D5DB", marginBottom: 6 },
  signName: { fontSize: 12, color: "#0A1628", fontFamily: "Inter_500Medium" },
  docFooter: { padding: 16, alignItems: "center", backgroundColor: "#F9FAFB" },
  docFooterText: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#FF6B00", borderRadius: 14, padding: 16 },
  shareBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
