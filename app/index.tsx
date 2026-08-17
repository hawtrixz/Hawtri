import { Redirect } from "expo-router";
import { useApp } from "@/context/AppContext";
import { ActivityIndicator, Alert, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { checkUpdateAvailable } from "@/utils/version";
import { hasPassword, isDeviceTrusted } from "@/utils/auth2fa";
import { useEffect, useRef, useState } from "react";

export default function Index() {
  const { isLoading, termsAccepted, paymentDone, user } = useApp();
  const colors = useColors();
  const [guard, setGuard] = useState<string | null>(null);
  const updateAlertShown = useRef(false);

  useEffect(() => {
    void runGuards();
  }, [user, isLoading]);

  const runGuards = async () => {
    if (!user || isLoading) return;

    try {
      // Contrôle informatif uniquement : aucune ancienne APK n'est bloquée.
      const update = await checkUpdateAvailable();
      if (update.available && !updateAlertShown.current) {
        updateAlertShown.current = true;
        Alert.alert(
          "Nouvelle mise à jour disponible",
          `La version ${update.latestVersion} de Hawtrix est disponible. Tu peux continuer à utiliser cette version et effectuer la mise à jour plus tard depuis le canal officiel.`,
          [{ text: "Compris", style: "default" }],
        );
      }

      // Double facteur : mot de passe défini sur un appareil non reconnu.
      const hasPw = await hasPassword();
      if (hasPw && !(await isDeviceTrusted())) {
        setGuard("unlock");
        return;
      }
    } catch {
      // Le contrôle de version et le contrôle 2FA sont non bloquants.
    }

    setGuard(null);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.navyDark }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (guard) return <Redirect href={`/${guard}` as any} />;

  if (!termsAccepted) return <Redirect href="/welcome" />;
  if (!paymentDone) return <Redirect href="/payment" />;
  if (!user) return <Redirect href="/welcome" />;
  if (user.isBanned) return <Redirect href="/welcome" />;
  if (!user.tutorialSeen) return <Redirect href="/tutorial" />;
  return <Redirect href="/(tabs)/home" />;
}
