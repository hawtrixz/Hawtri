// components/OfflineGate.tsx
//
// Hawtrix 2.86 — garde "strictement en ligne"
// Affiche un écran de blocage tant qu'Internet n'est pas détecté.
// À utiliser sur tous les écrans qui nécessitent une connexion :
// formations, opportunités, vérification du compte, etc.

import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isOnline, networkErrorLabel } from "@/utils/network";
import * as Haptics from "expo-haptics";

type OfflineGateProps = {
  /** Titre affiché en haut de l'écran de blocage */
  title?: string;
  /** Contenu protégé, rendu uniquement si la connexion est disponible */
  children: React.ReactNode;
};

export default function OfflineGate({ title = "Connexion requise", children }: OfflineGateProps) {
  const [online, setOnline] = useState<boolean | null>(null);

  const check = async () => {
    const ok = await isOnline();
    setOnline(ok);
  };

  useEffect(() => {
    check();
    const iv = setInterval(check, 8000);
    return () => clearInterval(iv);
  }, []);

  if (online === null) {
    return (
      <View style={styles.container}>
        <View style={styles.box}>
          <Ionicons name="cloud-offline-outline" size={44} color="#FF6B00" />
          <Text style={styles.loadingText}>Vérification de la connexion…</Text>
        </View>
      </View>
    );
  }

  if (online) return <>{children}</>;

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <View style={styles.iconWrap}>
          <Ionicons name="wifi-outline" size={48} color="#EF4444" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>
          Cette partie de l'application fonctionne exclusivement en ligne :{"\n"}
          formations, opportunités et validation de compte nécessitent une connexion Internet active.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); check(); }} activeOpacity={0.8}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Astuce : activez le Wi-Fi ou les données mobiles, puis touchez « Réessayer ».</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", alignItems: "center", justifyContent: "center", padding: 24 },
  box: { alignItems: "center", gap: 12, maxWidth: 340 },
  iconWrap: { width: 96, height: 96, borderRadius: 32, backgroundColor: "#EF444415", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", color: "#0A1628", fontFamily: "Inter_700Bold", textAlign: "center" },
  desc: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FF6B00", paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  retryText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  hint: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  loadingText: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular", marginTop: 12 },
});
