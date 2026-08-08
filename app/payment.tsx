import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert, Linking, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { isOnline } from "@/utils/network";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type Method = "tmoney" | "flooz";
type Step = "input" | "confirming" | "code";

const METHODS = [
  { id: "tmoney" as Method, label: "TMoney", sub: "Mixx by Yas", color: "#E53E3E", number: "+22891015682", ussd: "*145#", shortCode: "Transfert manuel" },
  { id: "flooz" as Method, label: "Flooz", sub: "Moov Africa", color: "#2563EB", number: "+22897076040", ussd: "*155#", shortCode: "Transfert manuel" },
];

const SUPPORT_WHATSAPP = "https://wa.me/message/ITZ45LLE2RKSM1";

// Code secret calculé à partir du numéro ayant effectué le dépôt
// (v2.85.3, conservé) :
// `code = (somme des 8 derniers chiffres du numéro) × 777 + 123456`
// Le support vérifie le dépôt reçu et envoie manuellement le code au client.
function activationCodeFor(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-8);
  const sum = digits.split("").reduce((total, digit) => total + Number(digit), 0);
  return String(sum * 777 + 123456);
}

export default function PaymentScreen() {
  const { setPaymentDone } = useApp();
  const [method, setMethod] = useState<Method>("tmoney");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [secretCode, setSecretCode] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const m = METHODS.find(x => x.id === method)!;

  const handleSendRequest = async () => {
    const clean = phone.replace(/\s/g, "").replace(/^00/, "+");
    if (!clean || clean.length < 8) {
      Alert.alert("Numéro invalide", "Veuillez entrer votre numéro de téléphone.");
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(false);
    setStep("confirming");
  };

  const handleConfirmCode = async () => {
    if (!secretCode || secretCode.length < 4) {
      Alert.alert("Code invalide", "Veuillez entrer votre code secret.");
      return;
    }
    // Vérification du code par la formule officielle — uniquement
    // EN LIGNE : sans Internet, la confirmation est impossible.
    if (!(await isOnline())) {
      Alert.alert("Connexion requise", "La validation du code d'activation nécessite une connexion Internet. Activez le Wi-Fi ou les données mobiles puis réessayez.");
      return;
    }
    const expectedCode = activationCodeFor(phone);
    if (secretCode !== expectedCode) {
      setLoading(false);
      Alert.alert("Code incorrect", "Ce code ne correspond pas au numéro qui a effectué le dépôt. Le code doit vous être envoyé par le support uniquement sur WhatsApp, au numéro utilisé pour le transfert de 2 000 FCFA.");
      return;
    }
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setPaymentDone(true);
    router.replace("/register");
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <View style={styles.headerInner}>
          <Text style={styles.headerTitle}>Activation du compte</Text>
          <Text style={styles.headerSub}>Paiement sécurisé · 2 000 FCFA</Text>
        </View>
      </LinearGradient>

      <KeyboardAwareScrollViewCompat style={styles.scroll} bottomOffset={120}>
        {/* Montant */}
        <View style={styles.amountCard}>
          <LinearGradient colors={["#FF6B00", "#E55A00"]} style={styles.amountGrad}>
            <Text style={styles.amountLabel}>Montant à payer</Text>
            <Text style={styles.amountValue}>2 000 FCFA</Text>
            <Text style={styles.amountNote}>Accès à vie · Toute la plateforme</Text>
          </LinearGradient>
        </View>

        {/* Choix opérateur */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choisissez votre opérateur</Text>
          <View style={styles.methodsRow}>
            {METHODS.map(op => (
              <TouchableOpacity
                key={op.id}
                style={[styles.methodCard, method === op.id && styles.methodCardActive, method === op.id && { borderColor: op.color }]}
                onPress={() => { setMethod(op.id); Haptics.selectionAsync(); }}
                activeOpacity={0.8}
                disabled={step !== "input"}
              >
                <View style={[styles.methodIcon, { backgroundColor: op.color + "20" }]}>
                  <Ionicons name="phone-portrait" size={26} color={op.color} />
                </View>
                <Text style={[styles.methodLabel, method === op.id && { color: op.color }]}>{op.label}</Text>
                <Text style={styles.methodSub}>{op.sub}</Text>
                {method === op.id && (
                  <View style={[styles.methodCheck, { backgroundColor: op.color }]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {step === "input" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Numéro de téléphone {m.label}</Text>
            <Text style={styles.inputHint}>Entrez le numéro associé à votre compte {m.label}</Text>
            <View style={styles.phoneRow}>
              <View style={styles.flagBox}>
                <Text style={styles.flagEmoji}>🇹🇬</Text>
                <Text style={styles.countryCode}>+228</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="XX XX XX XX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
                maxLength={12}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color="#FF6B00" />
              <Text style={styles.infoText}>
                Faites un transfert manuel de <Text style={styles.infoHighlight}>2 000 FCFA</Text> au numéro {m.label} <Text style={styles.infoHighlight}>{m.number}</Text>. Après réception, contactez le support via WhatsApp pour obtenir votre code d’activation.
              </Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(SUPPORT_WHATSAPP)} style={styles.supportBtn} activeOpacity={0.8}>
              <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
              <Text style={styles.supportBtnText}>Contacter le support sur WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "confirming" && (
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <LinearGradient colors={[m.color, m.color + "BB"]} style={styles.confirmIconGrad}>
                <Ionicons name="chatbubble-ellipses" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.confirmTitle}>📲 Message envoyé !</Text>
            <Text style={styles.confirmText}>
              Un message de confirmation a été envoyé sur{"\n"}
              <Text style={styles.confirmPhone}>{phone}</Text>
            </Text>
            <Text style={styles.confirmInstruction}>
              Entrez votre <Text style={{ fontWeight: "700", color: m.color }}>code secret {m.label}</Text> pour confirmer le paiement de <Text style={{ fontWeight: "700", color: "#0A1628" }}>2 000 FCFA</Text> à Hawtrix.
            </Text>

            <TextInput
              style={[styles.secretInput, { borderColor: m.color }]}
              placeholder="••••"
              value={secretCode}
              onChangeText={setSecretCode}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.secureNote}>
              <Ionicons name="lock-closed" size={12} color="#10B981" /> Activation contrôlée manuellement
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(SUPPORT_WHATSAPP)} style={styles.supportBtn} activeOpacity={0.8}>
              <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
              <Text style={styles.supportBtnText}>Contacter le support sur WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ paddingHorizontal: 16, paddingBottom: botPad + 24, gap: 10 }}>
          {step === "input" && (
            <TouchableOpacity
              style={[styles.payBtn, loading && styles.payBtnLoading]}
              onPress={handleSendRequest}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.payBtnInner}>
                  <Text style={styles.payBtnText}>Envoi en cours...</Text>
                </View>
              ) : (
                <View style={styles.payBtnInner}>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.payBtnText}>Envoyer la demande de paiement</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {step === "confirming" && (
            <>
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: m.color }, loading && styles.payBtnLoading]}
                onPress={handleConfirmCode}
                disabled={loading}
                activeOpacity={0.85}
              >
                <View style={styles.payBtnInner}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.payBtnText}>{loading ? "Validation en cours..." : "Confirmer le paiement"}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep("input")} style={styles.backLink}>
                <Text style={styles.backLinkText}>← Changer de numéro</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  headerInner: { gap: 4 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 14, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  scroll: { flex: 1 },
  amountCard: { margin: 16, borderRadius: 20, overflow: "hidden" },
  amountGrad: { padding: 24, alignItems: "center", gap: 4 },
  amountLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_500Medium" },
  amountValue: { fontSize: 42, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  amountNote: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold", marginBottom: 14 },
  methodsRow: { flexDirection: "row", gap: 12 },
  methodCard: { flex: 1, borderRadius: 14, borderWidth: 2, borderColor: "#E5E7EB", padding: 14, alignItems: "center", gap: 6, position: "relative" },
  methodCardActive: { backgroundColor: "#FFF8F5" },
  methodIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  methodLabel: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  methodSub: { fontSize: 11, color: "#6B7280", fontFamily: "Inter_400Regular" },
  methodCheck: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  inputHint: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular", marginBottom: 12, marginTop: -8 },
  phoneRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  flagBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F5F6FA", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  flagEmoji: { fontSize: 20 },
  countryCode: { fontSize: 15, fontWeight: "600", color: "#0A1628", fontFamily: "Inter_600SemiBold" },
  phoneInput: { flex: 1, backgroundColor: "#F5F6FA", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, color: "#0A1628", borderWidth: 1, borderColor: "#E5E7EB", fontFamily: "Inter_700Bold", letterSpacing: 2 },
  infoBox: { flexDirection: "row", gap: 10, backgroundColor: "#FFF8F5", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#FF6B0030", alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, color: "#374151", fontFamily: "Inter_400Regular", lineHeight: 19 },
  infoHighlight: { fontWeight: "700", color: "#FF6B00", fontFamily: "Inter_700Bold" },
  confirmCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", gap: 14 },
  confirmIconWrap: {},
  confirmIconGrad: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  confirmTitle: { fontSize: 22, fontWeight: "800", color: "#0A1628", fontFamily: "Inter_700Bold" },
  confirmText: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  confirmPhone: { fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  confirmInstruction: { fontSize: 15, color: "#374151", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  secretInput: { width: "60%", backgroundColor: "#F5F6FA", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 18, fontSize: 28, color: "#0A1628", borderWidth: 2, fontFamily: "Inter_700Bold", textAlign: "center", letterSpacing: 8 },
  secureNote: { fontSize: 12, color: "#10B981", fontFamily: "Inter_400Regular" },
  supportBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  supportBtnText: { fontSize: 13, color: "#16A34A", fontFamily: "Inter_600SemiBold" },
  payBtn: { backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  payBtnLoading: { backgroundColor: "#FDA96A" },
  payBtnInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  payBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  backLink: { alignItems: "center", paddingVertical: 8 },
  backLinkText: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular" },
});
