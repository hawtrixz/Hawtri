import { Redirect } from "expo-router";
import { useApp } from "@/context/AppContext";
import { ActivityIndicator, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function Index() {
  const { isLoading, termsAccepted, paymentDone, user } = useApp();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.navyDark }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!termsAccepted) return <Redirect href="/welcome" />;
  if (!paymentDone) return <Redirect href="/payment" />;
  if (!user) return <Redirect href="/register" />;
  if (user.isBanned) {
    return <Redirect href="/welcome" />; // Or a specific blocked screen
  }
  if (!user.tutorialSeen) return <Redirect href="/tutorial" />;
  return <Redirect href="/(tabs)/home" />;
}
