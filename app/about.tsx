import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAppVersion } from "@/utils/version";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À propos de Hawtrix</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: botPad + 30 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <LinearGradient colors={["#10223C", "#0A1628"]} style={styles.hero}>
            <Image source={require("@/assets/images/icon.png")} style={styles.heroLogo} resizeMode="contain" />
            <Text style={styles.heroTitle}>HAWTRIX</Text>
            <Text style={styles.heroTagline}>Trouvez. Connectez. Réussissez.</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre histoire</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bodyBold}>Hawtrix</Text> est un projet ambitieux conçu par un groupe d'entrepreneurs visionnaires, sous l'impulsion du <Text style={styles.bodyBold}>DG Haweil</Text> et de ses collaborateurs.
          </Text>
          <Text style={styles.bodyText}>
            Notre mission est simple et puissante : permettre à <Text style={styles.bodyBold}>chacun</Text> de trouver des opportunités, de se bâtir un <Text style={styles.bodyBold}>réseau local de clientèle</Text> et de générer des <Text style={styles.bodyBold}>revenus supplémentaires</Text> à son actif.
          </Text>
          <Text style={styles.bodyText}>
            Hawtrix offre à toute personne qui le souhaite vraiment la possibilité de <Text style={styles.bodyBold}>s'immerger totalement</Text>, de <Text style={styles.bodyBold}>réussir dans la vie</Text> et de <Text style={styles.bodyBold}>se faire un nom</Text>, d'obtenir un <Text style={styles.bodyBold}>titre</Text> qui témoigne de son parcours et de sa persévérance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ce que Hawtrix vous apporte</Text>
          {[
            { icon: "briefcase", color: "#FF6B00", title: "Des opportunités réelles", desc: "Emplois, stages, bourses, financements et concours au Togo et en Afrique." },
            { icon: "people", color: "#3B82F6", title: "Un réseau local de clientèle", desc: "Développez votre clientèle de proximité et faites connaître vos services." },
            { icon: "cash", color: "#10B981", title: "Des revenus à votre actif", desc: "Gagnez en invitant des membres et montez en grade dans la hiérarchie Hawtrix." },
            { icon: "ribbon", color: "#CD7F32", title: "Un nom, un titre", desc: "Chaque grade est une reconnaissance : Pionier, Saphir, Rubis, Émeraude, Magnat, Icône, Directeur." },
          ].map((item, i) => (
            <View key={i} style={styles.valueCard}>
              <View style={[styles.valueIcon, { backgroundColor: item.color + "18" }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.valueInfo}>
                <Text style={styles.valueTitle}>{item.title}</Text>
                <Text style={styles.valueDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <LinearGradient colors={["#FF6B00", "#E55A00"]} style={styles.motivationCard}>
            <Ionicons name="flame" size={28} color="#FFFFFF" />
            <Text style={styles.motivationText}>
              Vous avez tout entre les mains. Hawtrix est votre tremplin, votre réseau et votre accélérateur de réussite. Osez, persévérez et bâtissez l'avenir que vous méritez.
            </Text>
            <Text style={styles.motivationSignature}>— L'équipe Hawtrix</Text>
          </LinearGradient>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerVersion}>Hawtrix v{getAppVersion()} · Togo</Text>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Hawtrix — Tous droits réservés.</Text>
          <Text style={styles.footerBlessing}>Bonne chance à toutes et à tous dans cette aventure !</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  heroWrap: { paddingHorizontal: 16, marginTop: 8 },
  hero: { borderRadius: 20, paddingVertical: 32, alignItems: "center", gap: 10 },
  heroLogo: { width: 110, height: 110, borderRadius: 26 },
  heroTitle: { fontSize: 30, fontWeight: "800", color: "#FFFFFF", fontFamily: "Inter_700Bold", letterSpacing: 6 },
  heroTagline: { fontSize: 14, color: "#FFB578", fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  section: { paddingHorizontal: 16, marginTop: 24, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  bodyText: { fontSize: 14.5, color: "#4B5563", fontFamily: "Inter_400Regular", lineHeight: 23 },
  bodyBold: { fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  valueCard: { flexDirection: "row", gap: 14, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, alignItems: "flex-start" },
  valueIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  valueInfo: { flex: 1, gap: 3 },
  valueTitle: { fontSize: 15, fontWeight: "700", color: "#0A1628", fontFamily: "Inter_700Bold" },
  valueDesc: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular", lineHeight: 19 },
  motivationCard: { borderRadius: 20, padding: 24, gap: 12, alignItems: "center" },
  motivationText: { fontSize: 15, color: "#FFFFFF", fontFamily: "Inter_500Medium", textAlign: "center", lineHeight: 24, fontStyle: "italic" },
  motivationSignature: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_600SemiBold" },
  footer: { alignItems: "center", gap: 6, marginTop: 28, paddingHorizontal: 16 },
  footerVersion: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  footerText: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  footerBlessing: { fontSize: 14, fontWeight: "700", color: "#FF6B00", fontFamily: "Inter_700Bold", marginTop: 4 },
});
