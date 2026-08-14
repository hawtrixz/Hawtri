import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, AdminUserView } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

export default function AdminScreen() {
  const { user, refreshProfile, getAllUsers, banUser, suspendUser } = useApp();
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let active = true;
    (async () => {
      const serverUser = await refreshProfile();
      const phone = (serverUser?.phone || user?.phone || "").replace(/\s/g, "");
      const isPresident = serverUser?.grade === "president" || phone === "+22890496651";
      if (!active) return;
      if (!isPresident) {
        Alert.alert("Accès refusé", "Le compte connecté n’est pas le Président administrateur.");
        router.back();
        return;
      }
      fetchUsers();
    })();
    return () => { active = false; };
  }, [user?.id]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      // Sort by date descending
      setUsers(data.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur serveur inconnue";
      Alert.alert("Erreur d’administration", message);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = (userId: string, name: string) => {
    Alert.alert(
      "Bannir l'utilisateur",
      `Êtes-vous sûr de vouloir bannir ${name} ? Cela annulera les gains de parrainage associés.`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Bannir", 
          style: "destructive", 
          onPress: async () => {
            await banUser(userId);
            fetchUsers();
          } 
        }
      ]
    );
  };

  const handleSuspend = async (userId: string, currentStatus: boolean) => {
    await suspendUser(userId, !currentStatus);
    fetchUsers();
  };

  const renderUser = ({ item }: { item: AdminUserView }) => (
    <View style={[styles.userCard, item.isBanned && styles.bannedCard]}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name} {item.surname}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
        <Text style={styles.userDate}>Inscrit le {new Date(item.joinedAt).toLocaleDateString()}</Text>
        {item.referrerId && <Text style={styles.userReferrer}>Parrain: {item.referrerId}</Text>}
      </View>
      
      <View style={styles.actions}>
        {!item.isBanned && (
          <>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.suspendBtn]} 
              onPress={() => handleSuspend(item.id, item.isSuspended)}
            >
              <Ionicons name={item.isSuspended ? "play" : "pause"} size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.banBtn]} 
              onPress={() => handleBan(item.id, item.name)}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
        {item.isBanned && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>BANNI</Text>
          </View>
        )}
        {item.isSuspended && !item.isBanned && (
          <View style={[styles.statusBadge, { backgroundColor: "#F59E0B" }]}>
            <Text style={styles.statusText}>SUSPENDU</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administration</Text>
        <Text style={styles.headerSub}>Gestion des membres et lutte contre la fraude</Text>
          <TouchableOpacity onPress={fetchUsers} style={{ marginTop: 10 }}>
            <Text style={{ color: "#FFB26B", fontWeight: "700" }}>Actualiser la liste</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/admin-opportunities")} style={styles.opportunityButton}>
            <Ionicons name="briefcase" size={18} color="#0A1628" />
            <Text style={styles.opportunityButtonText}>Gérer les opportunités</Text>
          </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun utilisateur trouvé.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  backBtn: { marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  headerSub: { fontSize: 14, color: "#94A3B8", marginTop: 4 },
  userCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 1 },
  bannedCard: { opacity: 0.6, backgroundColor: "#FEE2E2" },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "700", color: "#0A1628" },
  userPhone: { fontSize: 14, color: "#4B5563", marginTop: 2 },
  userDate: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  userReferrer: { fontSize: 12, color: "#6B7280", marginTop: 2, fontStyle: "italic" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  suspendBtn: { backgroundColor: "#F59E0B" },
  banBtn: { backgroundColor: "#EF4444" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: "#EF4444" },
  statusText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  empty: { marginTop: 100, alignItems: "center" },
  emptyText: { color: "#9CA3AF", fontSize: 16 },
  opportunityButton: { marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFD166", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  opportunityButtonText: { color: "#0A1628", fontWeight: "800", fontSize: 13 },
});

