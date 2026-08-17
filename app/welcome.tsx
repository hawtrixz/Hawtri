import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const [ready, setReady] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]).start();
    }, 250);
    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim]);

  const handlePrimary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/register");
  };

  const handleSecondary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/login");
  };

  return (
    <LinearGradient colors={["#0A1628", "#101F38", "#0A1628"]} style={[styles.container, { paddingTop: topPad }]}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoWrap}>
          <LinearGradient colors={["#FF6B00", "#E55A00"]} style={styles.logoGrad}>
            <Ionicons name="briefcase" size={56} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.title}>Hawtrix</Text>
        <Text style={styles.subtitle}>La plateforme des professionnels africains</Text>
        <Text style={styles.description}>
          Rejoignez un réseau de professionnels, développez vos compétences,
          partagez des opportunités et recevez des récompenses.
        </Text>

        <View style={styles.statsRow}>
          {[
            { label: "Membres actifs", value: "12,482", icon: "people" },
            { label: "Opportunités", value: "3,291", icon: "trending-up" },
            { label: "Pays", value: "18", icon: "globe" },
          ].map((s, i) => (
            <View key={i} style={styles.stat}>
              <Ionicons name={s.icon as any} size={22} color="#FF6B00" />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.btnPrimary} onPress={handlePrimary} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>Commencer</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleSecondary} activeOpacity={0.85}>
            <Text style={styles.btnSecondaryText}>Se connecter</Text>
          </TouchableOpacity>
          <Text style={styles.version}>Hawtrix v2.89.3 · Togo</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  logoWrap: { marginBottom: 28 },
  logoGrad: { width: 104, height: 104, borderRadius: 32, alignItems: "center", justifyContent: "center", shadowColor: "#FF6B00", shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  title: { fontSize: 44, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_800ExtraBold", letterSpacing: 1 },
  subtitle: { fontSize: 17, fontWeight: "600", color: "#FFD9B3", fontFamily: "Inter_600SemiBold", marginTop: 8, textAlign: "center" },
  description: { fontSize: 14, color: "#B9C4D6", fontFamily: "Inter_400Regular", lineHeight: 22, textAlign: "center", marginTop: 18 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 40, marginBottom: 44, paddingHorizontal: 4 },
  stat: { flex: 1, alignItems: "center", gap: 4, paddingHorizontal: 4 },
  statValue: { fontSize: 19, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_800ExtraBold" },
  statLabel: { fontSize: 11, color: "#94A3B8", fontFamily: "Inter_400Regular" },
  buttons: { width: "100%", gap: 14 },
  btnPrimary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#FF6B00", borderRadius: 16, paddingVertical: 18, shadowColor: "#FF6B00", shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16, fontFamily: "Inter_800ExtraBold" },
  btnSecondary: { alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)", borderRadius: 16, paddingVertical: 17 },
  btnSecondaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15, fontFamily: "Inter_700Bold" },
  version: { textAlign: "center", fontSize: 12, color: "#64748B", fontFamily: "Inter_400Regular", marginTop: 12 },
});
