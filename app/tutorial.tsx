import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const STEPS = [
  {
    icon: "home" as const,
    color: "#FF6B00",
    title: "Accueil",
    desc: "Votre tableau de bord principal. Accédez rapidement aux opportunités du jour, formations populaires, et à l'IA Hawtrix.",
  },
  {
    icon: "search" as const,
    color: "#0F52BA",
    title: "Recherche de prestataires",
    desc: "Trouvez le professionnel qu'il vous faut par métier, quartier, ville ou disponibilité. Contactez directement via l'application.",
  },
  {
    icon: "briefcase" as const,
    color: "#10B981",
    title: "Opportunités",
    desc: "Consultez les offres d'emploi, stages, bourses d'études, concours et appels à projets adaptés à votre profil.",
  },
  {
    icon: "school" as const,
    color: "#8B008B",
    title: "Formations",
    desc: "Apprenez à votre rythme avec nos cours vidéo sur le trading, la crypto, l'informatique, et bien plus encore.",
  },
  {
    icon: "people" as const,
    color: "#B8860B",
    title: "Réseau & Parrainage",
    desc: "Partagez votre code personnel, invitez des membres et accédez à des avantages financiers croissants selon votre niveau.",
  },
  {
    icon: "sparkles" as const,
    color: "#7C3AED",
    title: "IA Hawtrix",
    desc: "Votre assistant personnel intelligent. Posez toutes vos questions sur l'application, obtenez des recommandations personnalisées.",
  },
  {
    icon: "chatbubbles" as const,
    color: "#EF4444",
    title: "Messagerie",
    desc: "Communiquez directement avec les prestataires, contactez des membres de la communauté, échangez des fichiers.",
  },
  {
    icon: "trending-up" as const,
    color: "#059669",
    title: "Développement personnel",
    desc: "Des vidéos motivantes, citations et conseils mis à jour quotidiennement pour vous aider à exceller chaque jour.",
  },
];

export default function TutorialScreen() {
  const { markTutorialSeen } = useApp();
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await markTutorialSeen();
    router.replace("/(tabs)/home");
  };

  const current = STEPS[step];

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad + 24 }]}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
        ))}
      </View>

      <Animated.View entering={SlideInRight.duration(300)} exiting={SlideOutLeft.duration(200)} key={step} style={styles.content}>
        <LinearGradient colors={[current.color + "20", current.color + "08"]} style={styles.iconCard}>
          <View style={[styles.iconCircle, { backgroundColor: current.color }]}>
            <Ionicons name={current.icon} size={48} color="#FFFFFF" />
          </View>
        </LinearGradient>

        <Image source={require("@/assets/images/icon.png")} style={styles.logoSmall} resizeMode="contain" />

        <Text style={styles.stepNum}>{step + 1} / {STEPS.length}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.desc}</Text>
      </Animated.View>

      <View style={styles.btnArea}>
        {step > 0 && (
          <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(s => s - 1)} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: current.color }]} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>{step === STEPS.length - 1 ? "Commencer" : "Suivant"}</Text>
          <Ionicons name={step === STEPS.length - 1 ? "rocket" : "arrow-forward"} size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1628", paddingHorizontal: 24 },
  skipRow: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 8 },
  skipBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  skipText: { fontSize: 14, color: "#94A3B8", fontFamily: "Inter_500Medium" },
  dotsRow: { flexDirection: "row", gap: 6, justifyContent: "center", marginVertical: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#334155" },
  dotActive: { width: 20, backgroundColor: "#FF6B00" },
  dotDone: { backgroundColor: "#475569" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  iconCard: { width: width * 0.55, height: width * 0.55, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  iconCircle: { width: 100, height: 100, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  logoSmall: { width: 80, height: 30, marginTop: 8 },
  stepNum: { fontSize: 13, color: "#64748B", fontFamily: "Inter_500Medium" },
  title: { fontSize: 28, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold", textAlign: "center" },
  desc: { fontSize: 16, color: "#94A3B8", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24, paddingHorizontal: 8 },
  btnArea: { flexDirection: "row", gap: 12, alignItems: "center" },
  prevBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" },
  nextBtn: { flex: 1, flexDirection: "row", borderRadius: 16, paddingVertical: 18, alignItems: "center", justifyContent: "center", gap: 8 },
  nextBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
