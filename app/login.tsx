import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function LoginScreen() {
  const { loginUser } = useApp();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = async () => {
    const cleanPhone = phone.replace(/\s/g, "");
    if (!cleanPhone || !password) {
      Alert.alert("Champs manquants", "Saisissez votre numéro de téléphone et votre mot de passe à deux facteurs.");
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await loginUser(cleanPhone, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Connexion impossible", error instanceof Error ? error.message : "Numéro de téléphone ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.iconWrap}><Ionicons name="lock-closed" size={34} color="#FFFFFF" /></View>
        <Text style={styles.title}>Se connecter</Text>
        <Text style={styles.subtitle}>Retrouvez votre compte Hawtrix sur ce téléphone</Text>
      </LinearGradient>
      <View style={[styles.body, { paddingBottom: botPad + 24 }]}>
        <Text style={styles.label}>Numéro de téléphone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+228 XX XX XX XX" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" autoCapitalize="none" />
        <Text style={styles.label}>Mot de passe à deux facteurs</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Votre mot de passe permanent" placeholderTextColor="#9CA3AF" secureTextEntry autoCapitalize="none" />
        <Text style={styles.hint}>Le numéro doit être exactement celui utilisé lors de l’inscription. Le mot de passe est vérifié par le serveur et n’est pas réinitialisé par l’application.</Text>
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{loading ? "Connexion..." : "Se connecter"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/register")} style={styles.linkBtn} activeOpacity={0.8}>
          <Text style={styles.linkText}>Je n’ai pas encore de compte</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 24, paddingBottom: 28, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  iconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: "rgba(255,107,0,0.9)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { fontSize: 26, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, color: "#94A3B8", marginTop: 6, textAlign: "center", fontFamily: "Inter_400Regular" },
  body: { flex: 1, padding: 24, paddingTop: 28 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", fontFamily: "Inter_600SemiBold", marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, color: "#0A1628", borderWidth: 1, borderColor: "#E5E7EB", fontFamily: "Inter_400Regular" },
  hint: { fontSize: 12, color: "#6B7280", lineHeight: 18, marginTop: 12, fontFamily: "Inter_400Regular" },
  button: { backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 17, alignItems: "center", marginTop: 26 },
  buttonDisabled: { backgroundColor: "#FDA96A" },
  buttonText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  linkBtn: { alignItems: "center", marginTop: 22 },
  linkText: { fontSize: 14, color: "#FF6B00", fontFamily: "Inter_600SemiBold" },
});
