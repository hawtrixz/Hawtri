import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <LinearGradient colors={["#0A1628", "#162035", "#0A1628"]} style={styles.container}>
      <View style={[styles.inner, { paddingTop: topPad + 20, paddingBottom: botPad + 20 }]}>
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.logoWrap}>
          <Image source={require("@/assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600).duration(800)} style={styles.taglineWrap}>
          <Text style={styles.tagline}>Trouvez. Connectez.</Text>
          <Text style={[styles.tagline, { color: "#FF6B00" }]}>Réussissez.</Text>
          <Text style={styles.description}>
            La plateforme tout-en-un pour les professionnels africains. Annuaire, formations, opportunités et réseau dans une seule application.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(900).duration(700)} style={styles.featuresRow}>
          {[
            { icon: "🔧", label: "Prestataires" },
            { icon: "📚", label: "Formations" },
            { icon: "💼", label: "Opportunités" },
            { icon: "🌐", label: "Réseau" },
          ].map((f) => (
            <View key={f.label} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{f.icon}</Text>
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(1100).duration(700)} style={styles.btnArea}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push("/terms")} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>Commencer</Text>
          </TouchableOpacity>
          <Text style={styles.version}>Hawtrix v1.0 · Togo</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24 },
  logoWrap: { alignItems: "center", marginTop: 20 },
  logo: { width: 160, height: 160, borderRadius: 32 },
  taglineWrap: { alignItems: "center", gap: 4 },
  tagline: { fontSize: 32, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5, fontFamily: "Inter_700Bold" },
  description: { fontSize: 15, color: "#94A3B8", textAlign: "center", lineHeight: 22, marginTop: 16, fontFamily: "Inter_400Regular" },
  featuresRow: { flexDirection: "row", gap: 20, justifyContent: "center" },
  featureItem: { alignItems: "center", gap: 8 },
  featureIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(255,107,0,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  featureEmoji: { fontSize: 22 },
  featureLabel: { fontSize: 11, color: "#94A3B8", fontFamily: "Inter_500Medium" },
  btnArea: { width: "100%", alignItems: "center", gap: 12 },
  btnPrimary: { width: "100%", backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  btnPrimaryText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  version: { fontSize: 12, color: "#475569", fontFamily: "Inter_400Regular" },
});
