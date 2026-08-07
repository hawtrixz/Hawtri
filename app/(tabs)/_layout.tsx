import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF6B00",
        tabBarInactiveTintColor: "#64748B",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#0A1628",
          borderTopWidth: 0,
          elevation: 0,
          height: isWeb ? 84 : 72,
          paddingBottom: isWeb ? 34 : 12,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null,
        tabBarLabelStyle: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: -2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Prestataires",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="opportunities"
        options={{
          title: "Opportunités",
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Formations",
          tabBarIcon: ({ color, size }) => <Ionicons name="school" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
