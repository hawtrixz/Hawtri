import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAppVersion, checkUpdateAvailable } from "@/utils/version";

export default function UpdateScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)/home");
  };

  const handleCheck = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const update = await checkUpdateAvailable();
    if (update.available) {
      Alert.alert(
        "Mise à jour disponible",
        `La version ${update.latestVersion} est disponible. Consulte le canal officiel de Hawtrix pour obtenir les instructions d'installation.`,
      );
    } else {
      Alert.alert("Application à jour", "Aucune nouvelle version n'est signalée pour le moment.");
    }
  };

  return (
    <LinearGradient colors={["#0A1628", "#162035", "#0A1628"]} style={[styles.container, { paddingTop: topPad }]}>

      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <LinearGradient colors={["#FF6B00", "#E55A00"]} style={styles.iconGrad}>
            <Ionicons name="information" size={44} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Nouvelle version disponible</Text>
        <Text style={styles.subtitle}>
          Une nouvelle mise à jour de Hawtrix peut être disponible. Tu peux continuer à utiliser cette version sans blocage.
        </Text>

        <View style={styles.versionCard}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Version installée</Text>
            <Text style={styles.versionValue}>{getAppVersion()}</Text>
          </View>
          <View style={styles.versionDivider} />
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Politique</Text>
            <Text style={[styles.versionValue, { color: "#10B981" }]}>Mise à jour facultative</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Hawtrix ne bloque pas les anciennes versions et ne télécharge pas de fichier APK directement depuis l'application. Utilise uniquement le canal officiel communiqué par l'équipe.
          </Text>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          <Text style={styles.continueBtnText}>Continuer dans Hawtrix</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkBtn} onPress={handleCheck} activeOpacity={0.8}>
          <Ionicons name="refresh" size={16} color="#FFB578" />
          <Text style={styles.checkBtnText}>Vérifier à nouveau</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingBottom: 40, gap: 16 },
  iconWrap: { marginBottom: 4 },
  iconGrad: { width: 96, height: 96, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, color: "#94A3B8", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 23 },
  versionCard: { width: "100%", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  versionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  versionLabel: { fontSize: 13, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  versionValue: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  versionDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 8 },
  infoCard: { width: "100%", flexDirection: "row", gap: 12, backgroundColor: "rgba(59,130,246,0.1)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(59,130,246,0.25)" },
  infoText: { flex: 1, fontSize: 13, color: "#BFDBFE", fontFamily: "Inter_400Regular", lineHeight: 19 },
  continueBtn: { width: "100%", flexDirection: "row", backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 17, alignItems: "center", justifyContent: "center", gap: 10 },
  continueBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  checkBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkBtnText: { fontSize: 14, color: "#FFB578", fontFamily: "Inter_600SemiBold" },
});
