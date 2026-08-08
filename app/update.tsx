import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAppVersion } from "@/utils/version";

export default function UpdateScreen() {
  const params = useLocalSearchParams<{ apkUrl?: string }>();
  const apkUrl = params.apkUrl ?? "https://hawtrix.tg/hawtrix.apk";
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleDownload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "web") {
      Linking.openURL(apkUrl);
    } else {
      // Téléchargement direct du fichier APK dans l'appareil
      Linking.openURL(apkUrl);
    }
  };

  const handleRetry = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Re-vérifie la version : si elle est à jour, on débloque l'app.
    const { checkUpdateRequired } = await import("@/utils/version");
    const { required } = await checkUpdateRequired();
    if (!required) {
      router.replace("/(tabs)/home");
    } else {
      Alert.alert("Mise à jour requise", "Une nouvelle version de Hawtrix est disponible. Téléchargez-la pour continuer à utiliser l'application.");
    }
  };

  return (
    <LinearGradient colors={["#0A1628", "#162035", "#0A1628"]} style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <LinearGradient colors={["#FF6B00", "#E55A00"]} style={styles.iconGrad}>
            <Ionicons name="refresh" size={44} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Mise à jour requise</Text>
        <Text style={styles.subtitle}>
          Une nouvelle version de Hawtrix est disponible. Pour votre sécurité et pour accéder à toutes les fonctionnalités, mettez à jour votre application.
        </Text>

        <View style={styles.versionCard}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Version installée</Text>
            <Text style={styles.versionValue}>{getAppVersion()}</Text>
          </View>
          <View style={styles.versionDivider} />
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Dernière version</Text>
            <Text style={[styles.versionValue, { color: "#10B981" }]}>Disponible</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Les versions précédentes ne fonctionnent plus. Le fichier APK de la nouvelle version se télécharge directement depuis ce bouton.
          </Text>
        </View>

        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.85}>
          <Ionicons name="download" size={22} color="#FFFFFF" />
          <Text style={styles.downloadBtnText}>Télécharger la nouvelle version</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
          <Ionicons name="refresh" size={16} color="#FFB578" />
          <Text style={styles.retryBtnText}>J'ai mis à jour, vérifier</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Après le téléchargement, ouvrez le fichier APK puis installez-le. Autorisez l'installation depuis les sources inconnues si demandé.
        </Text>
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
  downloadBtn: { width: "100%", flexDirection: "row", backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 17, alignItems: "center", justifyContent: "center", gap: 10 },
  downloadBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  retryBtnText: { fontSize: 14, color: "#FFB578", fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 11.5, color: "#64748B", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17, maxWidth: 320 },
});
