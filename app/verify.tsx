// app/verify.tsx
//
// Hawtrix 2.86 — vérification de compte STRICTEMENT EN LIGNE
// ---------------------------------------------------------------
// - Écran protégé par OfflineGate : sans Internet, l'utilisateur
//   ne peut même pas accéder au formulaire de vérification.
// - Le code de vérification est reçu via un service réel :
//   l'application ouvre le lien officiel de vérification Hawtrix
//   (à configurer sur le backend) dans le navigateur du téléphone.
// - Aucun code codé en dur, aucune validation 100 % locale.

import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { useRef, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import OfflineGate from "@/components/OfflineGate";
import { isOnline } from "@/utils/network";

// URL officielle de vérification de compte Hawtrix (backend réel).
// À remplacer par l'URL réelle de votre serveur de vérification.
const VERIFY_URL = (process.env.EXPO_PUBLIC_VERIFY_URL ?? "https://hawtrix.tg/verify").toString();

export default function VerifyScreen() {
  const params = useLocalSearchParams<{ phone: string; name: string; surname: string; profession: string; neighborhood: string; referrerId: string }>();
  const { createUser } = useApp();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef<Array<TextInput | null>>([]);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleChange = (val: string, idx: number) => {
    const clean = val.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[idx] = clean;
    setOtp(next);
    if (clean && idx < 5) refs.current[idx + 1]?.focus();
    if (!clean && idx > 0) refs.current[idx - 1]?.focus();
  };

  const openOfficialVerification = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Ouvre la page officielle de vérification dans le navigateur
    // du téléphone pour que le code SMS soit reçu réellement.
    await WebBrowser.openBrowserAsync(VERIFY_URL);
  };

  const handleVerify = async () => {
    const entered = otp.join("");
    if (entered.length < 6) {
      Alert.alert("Erreur", "Entrez le code à 6 chiffres reçu par SMS.");
      return;
    }
    // Contrôle réseau au moment de la validation finale.
    if (!(await isOnline())) {
      Alert.alert("Connexion requise", "La validation de votre compte nécessite une connexion Internet. Activez le Wi-Fi ou les données mobiles puis réessayez.");
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await fetch(`${VERIFY_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: params.phone, code: entered }),
      });
      if (!res.ok) {
        throw new Error(`Code invalide ou expiré (HTTP ${res.status}). Vérifiez le SMS officiel reçu depuis ${VERIFY_URL}.`);
      }
      await createUser({
        name: params.name ?? "",
        surname: params.surname ?? "",
        profession: params.profession ?? "",
        neighborhood: params.neighborhood ?? "",
        phone: params.phone ?? "",
        referrerId: params.referrerId || null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/tutorial");
    } catch (err) {
      setLoading(false);
      Alert.alert("Vérification impossible", err instanceof Error ? err.message : "Impossible de valider votre code pour le moment. Vérifiez votre connexion et réessayez.");
    }
  };

  return (
    <OfflineGate title="Vérification en ligne requise">
      <View style={[styles.container, { paddingTop: topPad }]}>
        <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification SMS</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <View style={[styles.body, { paddingBottom: botPad + 24 }]}>
          <View style={styles.iconWrap}>
            <LinearGradient colors={["#FF6B00", "#E55A00"]} style={styles.iconGrad}>
              <Ionicons name="chatbubble-ellipses" size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Entrez le code SMS officiel</Text>
          <Text style={styles.subtitle}>Un code de vérification à 6 chiffres est envoyé au{"\n"}<Text style={styles.phone}>{params.phone}</Text>{"\n"}par le service officiel Hawtrix.</Text>

          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={r => { refs.current[i] = r; }}
                style={[styles.otpBox, digit && styles.otpBoxFilled]}
                value={digit}
                onChangeText={v => handleChange(v, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity style={[styles.verifyBtn, loading && styles.verifyBtnLoading]} onPress={handleVerify} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.verifyBtnText}>{loading ? "Vérification..." : "Confirmer"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendBtn} onPress={openOfficialVerification} activeOpacity={0.8}>
            <Ionicons name="globe-outline" size={14} color="#FF6B00" />
            <Text style={styles.resendText}>Ouvrir la page officielle de vérification</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Le code officiel est émis par {VERIFY_URL}. Sans ce code, aucun compte ne peut être créé.</Text>
        </View>
      </View>
    </OfflineGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 16 },
  iconWrap: { marginBottom: 8 },
  iconGrad: { width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: "#0A1628", fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, color: "#6B7280", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  phone: { fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  otpRow: { flexDirection: "row", gap: 10, marginVertical: 8 },
  otpBox: { width: 48, height: 58, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 2, borderColor: "#E5E7EB", fontSize: 24, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  otpBoxFilled: { borderColor: "#FF6B00", backgroundColor: "#FFF8F5" },
  verifyBtn: { width: "100%", backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  verifyBtnLoading: { backgroundColor: "#FDA96A" },
  verifyBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  resendBtn: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  resendText: { fontSize: 14, color: "#FF6B00", fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16, maxWidth: 320 },
});
