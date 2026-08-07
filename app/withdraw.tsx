import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

export default function WithdrawScreen() {
  const { user, withdraw } = useApp();
  const [step, setStep] = useState<"amount" | "verify">("amount");
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    const val = parseInt(amount, 10);
    if (isNaN(val) || val <= 0) {
      Alert.alert("Montant invalide", "Veuillez entrer un montant correct.");
      return;
    }
    if (user && val > user.balance) {
      Alert.alert("Solde insuffisant", `Votre solde actuel est de ${user.balance} F CFA.`);
      return;
    }
    setStep("verify");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleWithdraw = async () => {
    if (code.length < 6) {
      Alert.alert("Code incomplet", "Veuillez entrer le code de retrait à 6 chiffres.");
      return;
    }
    setLoading(true);
    try {
      const res = await withdraw(parseInt(amount, 10), code);
      if (res.success) {
        Alert.alert("Succès", res.message, [
          { text: "OK", onPress: () => router.replace("/(tabs)/profile") }
        ]);
      } else {
        Alert.alert("Erreur", res.message);
      }
    } catch (err) {
      Alert.alert("Erreur", "Une erreur est survenue lors du retrait.");
    } finally {
      setLoading(false);
    }
  };

  const contactSupport = () => {
    const msg = `Bonjour, je souhaite effectuer un retrait de ${amount} F CFA sur mon compte Hawtrix. Mon numéro est ${user?.phone}. Merci de me fournir le code de retrait.`;
    const url = `https://wa.me/22890496651?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => step === "verify" ? setStep("amount") : router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retrait de gains</Text>
        <Text style={styles.headerSub}>Récupérez vos commissions en toute sécurité</Text>
      </LinearGradient>

      <KeyboardAwareScrollViewCompat style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {step === "amount" ? (
          <View style={styles.card}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceValue}>{user?.balance ?? 0} F CFA</Text>
            
            <View style={styles.divider} />

            <Text style={styles.label}>Montant à retirer</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Ex: 5000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            <Text style={styles.hint}>Le montant doit être inférieur ou égal à votre solde.</Text>

            <TouchableOpacity style={styles.submitBtn} onPress={handleNext}>
              <Text style={styles.submitBtnText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.verifyIcon}>
              <Ionicons name="shield-checkmark" size={48} color="#FF6B00" />
            </View>
            <Text style={styles.verifyTitle}>Vérification sécurisée</Text>
            <Text style={styles.verifyText}>
              Pour valider votre retrait de <Text style={{ fontWeight: "700", color: "#FF6B00" }}>{amount} F CFA</Text>, veuillez saisir le code de retrait fourni par le support.
            </Text>

            <Text style={styles.label}>Code de retrait (6 chiffres)</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={6}
            />

            <TouchableOpacity style={[styles.submitBtn, loading && styles.disabled]} onPress={handleWithdraw} disabled={loading}>
              <Text style={styles.submitBtnText}>{loading ? "Traitement..." : "Confirmer le retrait"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportBtn} onPress={contactSupport}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={styles.supportBtnText}>Contacter le support pour le code</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  backBtn: { marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 14, color: "#94A3B8", fontFamily: "Inter_400Regular", marginTop: 4 },
  scroll: { flex: 1 },
  card: { margin: 16, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  balanceLabel: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular", textAlign: "center" },
  balanceValue: { fontSize: 32, fontWeight: "800", color: "#0A1628", fontFamily: "Inter_800ExtraBold", textAlign: "center", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: { backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#0A1628", borderWidth: 1, borderColor: "#E5E7EB" },
  hint: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },
  submitBtn: { flexDirection: "row", backgroundColor: "#FF6B00", borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  disabled: { opacity: 0.6 },
  verifyIcon: { alignSelf: "center", marginBottom: 16 },
  verifyTitle: { fontSize: 18, fontWeight: "700", color: "#0A1628", textAlign: "center", marginBottom: 8 },
  verifyText: { fontSize: 14, color: "#4B5563", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  codeInput: { textAlign: "center", fontSize: 24, letterSpacing: 8, fontWeight: "700" },
  supportBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20, paddingVertical: 10 },
  supportBtnText: { fontSize: 14, color: "#25D366", fontWeight: "600" },
});
