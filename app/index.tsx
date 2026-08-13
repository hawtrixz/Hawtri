import { Redirect } from "expo-router";
import { useApp } from "@/context/AppContext";
import { ActivityIndicator, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { checkUpdateRequired } from "@/utils/version";
import { hasPassword, isDeviceTrusted } from "@/utils/auth2fa";
import { useEffect, useState } from "react";

export default function Index() {
  const { isLoading, termsAccepted, paymentDone, user } = useApp();
  const colors = useColors();
  const [guard, setGuard] = useState<string | null>(null);

  useEffect(() => {
    runGuards();
  }, [user]);

  const runGuards = async () => {
    if (!user || isLoading) return;
    // 1) Contrôle de version : une version plus récente publiée bloque l'app.
    const { required, apkUrl } = await checkUpdateRequired();
    if (required) {
      setGuard(apkUrl ? `update&apk=${encodeURIComponent(apkUrl)}` : "update");
      return;
    }
    // 2) Double facteur : mot de passe défini sur un appareil non reconnu.
    const hasPw = await hasPassword();
    if (hasPw && !(await isDeviceTrusted())) {
      setGuard("unlock");
      return;
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

  // Garde de version / 2FA prioritaire sur les autres redirections.
  if (guard) {
    if (guard.startsWith("update&apk=")) {
      return <Redirect href={{ pathname: "/update", params: { apkUrl: decodeURIComponent(guard.slice(11)) } } as any} />;
    }
    return <Redirect href={`/${guard}` as any} />;
  }

  if (!termsAccepted) return <Redirect href="/welcome" />;
  if (!paymentDone) return <Redirect href="/payment" />;
  if (!user) return <Redirect href="/welcome" />;
  if (user.isBanned) {
    return <Redirect href="/welcome" />; // Or a specific blocked screen
  }
  if (!user.tutorialSeen) return <Redirect href="/tutorial" />;
  return <Redirect href="/(tabs)/home" />;
}
