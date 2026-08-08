import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { setPassword, clearPassword, hasPassword } from "@/utils/auth2fa";

type Mode = "intro" | "create" | "confirm" | "done" | "unset";

export default function SecurityScreen() {
  const { user } = useApp();
  const params = useLocalSearchParams<{ flow?: string }>();
  const isRegistration = params.flow === "registration";
  const [mode, setMode] = useState<Mode>("intro");
  const [password, setPasswordState] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [uninstalling, setUninstalling] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = async () => {
    if (password.length < 4) {
      Alert.alert("Trop court", "Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Non identiques", "Les deux mots de passe ne correspondent pas. Veuillez recommencer.");
      setMode("create");
      setPasswordState("");
      setConfirm("");
      return;
    }
    setLoading(true);
    try {
      await setPassword(password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMode("done");
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const finishSecuritySetup = () => {
    // Après une inscription, ne jamais remonter la pile vers /verify puis /register.
    // Le compte vient d'être créé : le tutoriel est l'étape suivante du parcours.
    if (isRegistration) {
      router.replace("/tutorial");
    } else {
      router.back();
    }
  };

  const handleRemove = () => {
    Alert.alert(
      "Supprimer le mot de passe ?",
      "Sans mot de passe, votre compte sera moins protégé : n'importe qui ayant accès à votre téléphone pourra consulter votre compte et vos gains.",
      [
        { text: "Garder le mot de passe", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setUninstalling(true);
            await clearPassword();
            setUninstalling(false);
            setMode("intro");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: topPad }]}>
        <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
          <TouchableOpacity onPress={() => (mode === "intro" || mode === "done" ? router.back() : setMode("intro"))} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sécurité du compte</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: botPad + 24, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {mode === "intro" && (
            <View style={styles.body}>
              <View style={styles.iconWrap}>
                <LinearGradient colors={["#10B981", "#059669"]} style={styles.iconGrad}>
                  <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Identification à double facteur</Text>
              <Text style={styles.subtitle}>
                Définissez un mot de passe personnel qui protège votre compte Hawtrix.
              </Text>
              <View style={styles.infoCard}>
                <Ionicons name="phone-portrait" size={20} color="#3B82F6" />
                <Text style={styles.infoText}>
                  Votre mot de passe vous sera demandé à chaque <Text style={styles.infoBold}>connexion sur un nouveau téléphone</Text> et à chaque <Text style={styles.infoBold}>retrait de gains</Text>.
                </Text>
              </View>
              <View style={[styles.infoCard, { borderColor: "#FEE2E2", backgroundColor: "#FFF7F7" }]}>
                <Ionicons name="warning" size={20} color="#EF4444" />
                <Text style={styles.infoText}>
                  <Text style={[styles.infoBold, { color: "#EF4444" }]}>Compte irrécupérable si mot de passe oublié.</Text> Le mot de passe n'est stocké que sur votre téléphone. Hawtrix ne peut pas le récupérer ni le réinitialiser.
                </Text>
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => setMode("create")} activeOpacity={0.85}>
                <Text style={styles.btnPrimaryText}>Définir mon mot de passe</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode("unset"); }} activeOpacity={0.85}>
                <Text style={styles.btnSecondaryText}>Je préfère ne pas mettre de mot de passe</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === "create" && (
            <View style={styles.body}>
              <View style={styles.iconWrap}>
                <LinearGradient colors={["#10B981", "#059669"]} style={styles.iconGrad}>
                  <Ionicons name="lock-closed" size={40} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Choisissez votre mot de passe</Text>
              <Text style={styles.subtitle}>
                Choisissez un mot de passe d'au moins 4 caractères que vous serez le seul à connaître.
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
              />
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={[styles.input, confirm && (confirm === password ? styles.inputFilled : styles.inputError)]}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Ressaisissez le même mot de passe"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                maxLength={40}
              />
              <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                <Text style={styles.btnPrimaryText}>{loading ? "Enregistrement..." : "Enregistrer le mot de passe"}</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === "done" && (
            <View style={styles.body}>
              <View style={styles.iconWrap}>
                <LinearGradient colors={["#10B981", "#059669"]} style={styles.iconGrad}>
                  <Ionicons name="checkmark" size={44} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Mot de passe enregistré !</Text>
              <Text style={styles.subtitle}>
                Votre compte {user?.surname ?? ""} est maintenant protégé. Votre mot de passe vous sera demandé sur chaque nouveau téléphone et à chaque retrait.
              </Text>
              <View style={[styles.infoCard, { borderColor: "#FEE2E2", backgroundColor: "#FFF7F7" }]}>
                <Ionicons name="warning" size={20} color="#EF4444" />
                <Text style={styles.infoText}>
                  Ne l'oubliez jamais : <Text style={[styles.infoBold, { color: "#EF4444" }]}>compte irrécupérable si mot de passe oublié</Text>.
                </Text>
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={finishSecuritySetup} activeOpacity={0.85}>
                <Text style={styles.btnPrimaryText}>C'est parti !</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnTertiary} onPress={handleRemove} disabled={uninstalling} activeOpacity={0.85}>
                <Text style={styles.btnTertiaryText}>Supprimer le mot de passe</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === "unset" && (
            <View style={styles.body}>
              <View style={styles.iconWrap}>
                <LinearGradient colors={["#6B7280", "#4B5563"]} style={styles.iconGrad}>
                  <Ionicons name="shield-outline" size={40} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Mode sans mot de passe</Text>
              <Text style={styles.subtitle}>
                Vous avez choisi de ne pas définir de mot de passe. Votre compte reste accessible librement sur cet appareil.
              </Text>
              <View style={[styles.infoCard, { borderColor: "#FEE2E2", backgroundColor: "#FFF7F7" }]}>
                <Ionicons name="warning" size={20} color="#EF4444" />
                <Text style={styles.infoText}>
                  Attention : sans mot de passe, toute personne ayant accès à votre téléphone peut consulter votre compte et vos gains.
                </Text>
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={async () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); finishSecuritySetup(); }} activeOpacity={0.85}>
                <Text style={styles.btnPrimaryText}>Compris, continuer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnTertiary} onPress={() => setMode("create")} activeOpacity={0.85}>
                <Text style={styles.btnTertiaryText}>Finalement, définir un mot de passe</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 16, paddingVertical: 24 },
  iconWrap: { marginBottom: 4 },
  iconGrad: { width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: "#0A1628", fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, color: "#6B7280", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  infoCard: { width: "100%", flexDirection: "row", gap: 12, backgroundColor: "#F0FDF4", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#DCFCE7" },
  infoText: { flex: 1, fontSize: 13, color: "#374151", fontFamily: "Inter_400Regular", lineHeight: 19 },
  infoBold: { fontWeight: "700", fontFamily: "Inter_700Bold", color: "#0A1628" },
  label: { width: "100%", fontSize: 14, fontWeight: "600", color: "#374151", fontFamily: "Inter_600SemiBold", marginTop: 8 },
  input: { width: "100%", backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, color: "#0A1628", fontFamily: "Inter_500Medium", borderWidth: 2, borderColor: "#E5E7EB", marginTop: 6 },
  inputFilled: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FFF7F7" },
  btnPrimary: { width: "100%", backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 17, alignItems: "center", marginTop: 4 },
  btnPrimaryText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  btnPrimaryDisabled: { backgroundColor: "#FDA96A" },
  btnSecondary: { width: "100%", borderRadius: 16, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: "#D1D5DB" },
  btnSecondaryText: { fontSize: 15, fontWeight: "600", color: "#6B7280", fontFamily: "Inter_600SemiBold" },
  btnTertiary: { marginTop: 4 },
  btnTertiaryText: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_500Medium", textDecorationLine: "underline" },
});
