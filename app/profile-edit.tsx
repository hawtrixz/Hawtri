import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function ProfileEditScreen() {
  const { user, updateUser } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name ?? "");
  const [surname, setSurname] = useState(user?.surname ?? "");
  const [profession, setProfession] = useState(user?.profession ?? "");
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Autorisation nécessaire", "Autorisez l’accès aux photos dans les réglages du téléphone pour choisir une photo de profil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) setAvatar(result.assets[0].uri);
  };

  const save = async () => {
    if (!name.trim() || !surname.trim()) {
      Alert.alert("Informations manquantes", "Le nom et le prénom sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        surname: surname.trim(),
        profession: profession.trim(),
        neighborhood: neighborhood.trim(),
        bio: bio.trim(),
        avatar: avatar || undefined,
      });
      Alert.alert("Profil enregistré", "Vos informations et votre photo ont été sauvegardées.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert("Enregistrement impossible", error?.message || "Vérifiez votre connexion puis réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : <Text style={styles.avatarLetter}>{surname[0]?.toUpperCase() || "H"}</Text>}
            <TouchableOpacity style={styles.cameraButton} onPress={choosePhoto} activeOpacity={0.8}>
              <Ionicons name="camera" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoTitle}>Photo de profil</Text>
          <Text style={styles.photoHint}>Choisissez une photo carrée et nette</Text>
        </View>

        <View style={styles.formCard}>
          <Field label="Nom" value={surname} onChangeText={setSurname} placeholder="Votre nom" />
          <Field label="Prénom" value={name} onChangeText={setName} placeholder="Votre prénom" />
          <Field label="Profession" value={profession} onChangeText={setProfession} placeholder="Ex. Entrepreneur" />
          <Field label="Quartier / ville" value={neighborhood} onChangeText={setNeighborhood} placeholder="Ex. Lomé, Togo" />
          <Field label="Présentation" value={bio} onChangeText={setBio} placeholder="Parlez brièvement de vous" multiline />
        </View>

        <TouchableOpacity style={[styles.saveButton, saving && styles.saveDisabled]} onPress={save} disabled={saving} activeOpacity={0.85}>
          <Ionicons name={saving ? "hourglass" : "checkmark-circle"} size={20} color="#FFFFFF" />
          <Text style={styles.saveText}>{saving ? "Enregistrement..." : "Enregistrer les modifications"}</Text>
        </TouchableOpacity>
        <Text style={styles.privacy}>Vos informations restent liées à votre compte et ne sont pas supprimées lors d’une mise à jour de l’application.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline = false }: { label: string; value: string; onChangeText: (text: string) => void; placeholder: string; multiline?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9CA3AF" multiline={multiline} textAlignVertical={multiline ? "top" : "center"} style={[styles.input, multiline && styles.multiline]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 19, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", textAlign: "center" },
  headerSpacer: { width: 40 },
  content: { padding: 16, paddingBottom: 40 },
  avatarSection: { alignItems: "center", marginBottom: 22 },
  avatarWrap: { width: 112, height: 112, borderRadius: 34, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center", shadowColor: "#FF6B00", shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  avatar: { width: 112, height: 112, borderRadius: 34 },
  avatarLetter: { fontSize: 48, color: "#FFFFFF", fontWeight: "800", fontFamily: "Inter_700Bold" },
  cameraButton: { position: "absolute", right: -4, bottom: -4, width: 36, height: 36, borderRadius: 18, backgroundColor: "#0A1628", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#F5F6FA" },
  photoTitle: { marginTop: 14, fontSize: 16, color: "#0A1628", fontWeight: "700", fontFamily: "Inter_700Bold" },
  photoHint: { marginTop: 4, fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  formCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, gap: 14 },
  field: { gap: 7 },
  label: { fontSize: 13, color: "#374151", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#FAFAFA", paddingHorizontal: 14, color: "#0A1628", fontSize: 14, fontFamily: "Inter_400Regular" },
  multiline: { minHeight: 92, paddingTop: 13 },
  saveButton: { marginTop: 18, minHeight: 52, borderRadius: 14, backgroundColor: "#FF6B00", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveDisabled: { opacity: 0.65 },
  saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  privacy: { textAlign: "center", color: "#9CA3AF", fontSize: 11, lineHeight: 17, marginTop: 12, fontFamily: "Inter_400Regular" },
});

