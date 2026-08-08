import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { isDeviceTrusted, trustDevice, verifyPassword } from "@/utils/auth2fa";

export default function UnlockScreen() {
  const { user } = useApp();
  const [password, setPasswordState] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleUnlock = async () => {
    if (!password) {
      Alert.alert("Champ vide", "Entrez votre mot de passe personnel.");
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const ok = await verifyPassword(password);
      if (!ok) {
        setAttempts(a => a + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (attempts + 1 >= 3) {
          Alert.alert(
            "Mot de passe incorrect",
            "Vous avez effectué trop de tentatives. Pour la sécurité de votre compte, redémarrez l'application et réessayez avec votre mot de passe exact.",
            [{ text: "OK", onPress: () => router.replace("/welcome") }]
          );
          return;
        }
        Alert.alert("Mot de passe incorrect", `Tentative ${attempts + 1}/3. Votre compte est protégé par votre mot de passe personnel.`);
        return;
      }
      await trustDevice();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/home");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <LinearGradient colors={["#0A1628", "#162035", "#0A1628"]} style={[styles.container, { paddingTop: topPad }]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: botPad + 24 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.inner}>
            <View style={styles.iconWrap}>
              <LinearGradient colors={["#FF6B00", "#E55A00"]} style={styles.iconGrad}>
                <Ionicons name="lock-closed" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Nouveau téléphone détecté</Text>
            <Text style={styles.subtitle}>
              Bonjour {user?.surname ?? "Membre"} ! Pour protéger votre compte, entrez votre mot de passe personnel sur cet appareil.
            </Text>

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={[styles.input, password && styles.inputFilled]}
              value={password}
              onChangeText={setPasswordState}
              placeholder="Votre mot de passe secret"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              maxLength={40}
              onSubmitEditing={handleUnlock}
              returnKeyType="done"
            />

            <View style={styles.warnCard}>
              <Ionicons name="warning" size={18} color="#EF4444" />
              <Text style={styles.warnText}>
                Compte irrécupérable si mot de passe oublié. Hawtrix ne peut ni récupérer ni réinitialiser votre mot de passe.
              </Text>
            </View>

            <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]} onPress={handleUnlock} disabled={loading} activeOpacity={0.85}>
              <Text style={styles.btnPrimaryText}>{loading ? "Vérification..." : "Déverrouiller"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { alignItems: "center", gap: 14, width: "100%" },
  iconWrap: { marginBottom: 4 },
  iconGrad: { width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, color: "#94A3B8", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  label: { width: "100%", fontSize: 14, fontWeight: "600", color: "#FFFFFF", fontFamily: "Inter_600SemiBold", alignSelf: "flex-start", marginTop: 8 },
  input: { width: "100%", backgroundColor: "#162035", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, color: "#FFFFFF", fontFamily: "Inter_500Medium", borderWidth: 2, borderColor: "#2D3A52", marginTop: 6 },
  inputFilled: { borderColor: "#FF6B00" },
  warnCard: { width: "100%", flexDirection: "row", gap: 10, backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" },
  warnText: { flex: 1, fontSize: 12.5, color: "#FCA5A5", fontFamily: "Inter_400Regular", lineHeight: 18 },
  btnPrimary: { width: "100%", backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 17, alignItems: "center", marginTop: 8 },
  btnPrimaryText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  btnPrimaryDisabled: { backgroundColor: "#FDA96A" },
});
