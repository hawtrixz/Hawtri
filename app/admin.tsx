import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, AdminUserView } from "@/context/AppContext";
import { backend, AdminWithdrawal } from "@/utils/backend";
import { Ionicons } from "@expo/vector-icons";

type PendingRegistration = {
  id: string;
  name: string;
  surname: string;
  phone: string;
  referrerId: string | null;
  status: string;
  createdAt: string;
};

export default function AdminScreen() {
  const { user, refreshProfile, getAllUsers, banUser, suspendUser } = useApp();
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<string | null>(null);
  const [processingRegistration, setProcessingRegistration] = useState<string | null>(null);
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
      await Promise.all([fetchUsers(), fetchWithdrawals(), fetchRegistrations()]);
    })().catch((error) => {
      if (active) Alert.alert("Erreur d’administration", error instanceof Error ? error.message : "Erreur serveur");
    });
    return () => { active = false; };
  }, [user?.id]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur serveur inconnue";
      Alert.alert("Erreur des membres", message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    setWithdrawalsLoading(true);
    try {
      setWithdrawals(await backend.adminGetWithdrawals());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur serveur inconnue";
      Alert.alert("Erreur des retraits", message);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setRegistrationsLoading(true);
    try {
      setRegistrations(await backend.adminGetPendingRegistrations());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur serveur inconnue";
      Alert.alert("Erreur des inscriptions", message);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleWithdrawal = (item: AdminWithdrawal, status: "completed" | "rejected") => {
    const action = status === "completed" ? "valider" : "refuser";
    Alert.alert(
      `${action.charAt(0).toUpperCase()}${action.slice(1)} le retrait`,
      `${status === "completed" ? "Confirmer" : "Refuser"} le retrait de ${item.amount.toLocaleString("fr-FR")} FCFA demandé par ${item.userName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: status === "rejected" ? "destructive" : "default",
          onPress: async () => {
            setProcessingWithdrawal(item.id);
            try {
              await backend.adminUpdateWithdrawal(item.id, status);
              await fetchWithdrawals();
              Alert.alert("Opération réussie", status === "completed" ? "Le retrait est validé." : "Le retrait est refusé et le montant est remboursé.");
            } catch (error) {
              Alert.alert("Impossible de traiter le retrait", error instanceof Error ? error.message : "Erreur serveur");
            } finally {
              setProcessingWithdrawal(null);
            }
          },
        },
      ],
    );
  };

  const handleRegistration = (item: PendingRegistration, status: "active" | "rejected") => {
    const action = status === "active" ? "valider" : "refuser";
    const fullName = `${item.surname} ${item.name}`.trim() || "ce membre";
    Alert.alert(
      `${action.charAt(0).toUpperCase()}${action.slice(1)} l'inscription`,
      `${status === "active" ? "Confirmer" : "Refuser"} l'inscription de ${fullName} (${item.phone}) ? ${status === "active" ? "Les commissions d'adhésion seront distribuées à ce moment." : "L'inscription sera refusée et aucune commission ne sera versée."}`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: status === "rejected" ? "destructive" : "default",
          onPress: async () => {
            setProcessingRegistration(item.id);
            try {
              await backend.adminSetRegistrationStatus(item.id, status);
              await fetchRegistrations();
              if (item.referrerId) {
                const data = await getAllUsers();
                setUsers(data.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
              }
              Alert.alert("Opération réussie", status === "active" ? "L'inscription est validée. Les commissions ont été distribuées." : "L'inscription est refusée.");
            } catch (error) {
              Alert.alert("Impossible de traiter l'inscription", error instanceof Error ? error.message : "Erreur serveur");
            } finally {
              setProcessingRegistration(null);
            }
          },
        },
      ],
    );
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
          },
        },
      ],
    );
  };

  const handleSuspend = async (userId: string, currentStatus: boolean) => {
    await suspendUser(userId, !currentStatus);
    fetchUsers();
  };

  const renderWithdrawal = ({ item }: { item: AdminWithdrawal }) => (
    <View style={styles.withdrawalCard}>
      <View style={styles.withdrawalInfo}>
        <Text style={styles.withdrawalTitle}>{item.userName}</Text>
        <Text style={styles.withdrawalPhone}>{item.userPhone}</Text>
        <Text style={styles.withdrawalAmount}>{item.amount.toLocaleString("fr-FR")} FCFA</Text>
        <Text style={styles.withdrawalDate}>Demandé le {new Date(item.createdAt).toLocaleString("fr-FR")}</Text>
      </View>
      {item.status === "pending" ? (
        <View style={styles.withdrawalActions}>
          <TouchableOpacity
            style={[styles.withdrawalButton, styles.approveButton]}
            disabled={processingWithdrawal === item.id}
            onPress={() => handleWithdrawal(item, "completed")}
          >
            {processingWithdrawal === item.id ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="checkmark" size={22} color="#FFFFFF" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.withdrawalButton, styles.rejectButton]}
            disabled={processingWithdrawal === item.id}
            onPress={() => handleWithdrawal(item, "rejected")}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.statusBadge, item.status === "completed" ? styles.completedBadge : styles.rejectedBadge]}>
          <Text style={styles.statusText}>{item.status === "completed" ? "VALIDÉ" : "REFUSÉ"}</Text>
        </View>
      )}
    </View>
  );

  const renderRegistration = ({ item }: { item: PendingRegistration }) => (
    <View style={styles.registrationCard}>
      <View style={styles.registrationInfo}>
        <Text style={styles.registrationTitle}>{item.surname} {item.name}</Text>
        <Text style={styles.registrationPhone}>{item.phone}</Text>
        <Text style={styles.registrationDate}>Inscrit le {new Date(item.createdAt).toLocaleDateString("fr-FR")}</Text>
      </View>
      <View style={styles.registrationActions}>
        <TouchableOpacity
          style={[styles.registrationButton, styles.approveButton]}
          disabled={processingRegistration === item.id}
          onPress={() => handleRegistration(item, "active")}
        >
          {processingRegistration === item.id ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="checkmark" size={22} color="#FFFFFF" />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.registrationButton, styles.rejectButton]}
          disabled={processingRegistration === item.id}
          onPress={() => handleRegistration(item, "rejected")}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
            <TouchableOpacity style={[styles.actionBtn, styles.suspendBtn]} onPress={() => handleSuspend(item.id, item.isSuspended)}>
              <Ionicons name={item.isSuspended ? "play" : "pause"} size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.banBtn]} onPress={() => handleBan(item.id, item.name)}>
              <Ionicons name="trash" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
        {item.isBanned && <View style={styles.statusBadge}><Text style={styles.statusText}>BANNI</Text></View>}
        {item.isSuspended && !item.isBanned && <View style={[styles.statusBadge, { backgroundColor: "#F59E0B" }]}><Text style={styles.statusText}>SUSPENDU</Text></View>}
      </View>
    </View>
  );

  const sectionHeader = (
    <View>
      <View style={styles.withdrawalSectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Inscriptions en attente</Text>
          <Text style={styles.sectionSubtitle}>Validez chaque nouvelle adhésion avant qu'elle ne devienne active</Text>
        </View>
        <TouchableOpacity onPress={fetchRegistrations} style={styles.refreshWithdrawalButton}>
          <Ionicons name="refresh" size={18} color="#0A1628" />
        </TouchableOpacity>
      </View>
      {registrationsLoading ? (
        <ActivityIndicator color="#FF6B00" style={{ marginVertical: 20 }} />
      ) : registrations.length === 0 ? (
        <View style={styles.emptyWithdrawal}><Text style={styles.emptyWithdrawalText}>Aucune inscription en attente.</Text></View>
      ) : (
        registrations.map((item) => <View key={item.id}>{renderRegistration({ item })}</View>)
      )}
      <View style={styles.withdrawalSectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Demandes de retrait</Text>
          <Text style={styles.sectionSubtitle}>Validation obligatoire par le Président</Text>
        </View>
        <TouchableOpacity onPress={fetchWithdrawals} style={styles.refreshWithdrawalButton}>
          <Ionicons name="refresh" size={18} color="#0A1628" />
        </TouchableOpacity>
      </View>
      {withdrawalsLoading ? (
        <ActivityIndicator color="#FF6B00" style={{ marginVertical: 20 }} />
      ) : withdrawals.length === 0 ? (
        <View style={styles.emptyWithdrawal}><Text style={styles.emptyWithdrawalText}>Aucune demande de retrait en attente.</Text></View>
      ) : (
        withdrawals.map((item) => <View key={item.id}>{renderWithdrawal({ item })}</View>)
      )}
      <Text style={styles.membersTitle}>Membres inscrits</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={["#0A1628", "#162035"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#FFFFFF" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Administration</Text>
        <Text style={styles.headerSub}>Gestion des membres, inscriptions, retraits et lutte contre la fraude</Text>
        <TouchableOpacity onPress={() => { fetchUsers(); fetchWithdrawals(); fetchRegistrations(); }} style={{ marginTop: 10 }}><Text style={{ color: "#FFB26B", fontWeight: "700" }}>Actualiser la liste</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/admin-opportunities")} style={styles.opportunityButton}>
          <Ionicons name="briefcase" size={18} color="#0A1628" /><Text style={styles.opportunityButtonText}>Gérer les opportunités</Text>
        </TouchableOpacity>
      </LinearGradient>
      {loading ? <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 50 }} /> : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
          ListHeaderComponent={sectionHeader}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Aucun utilisateur trouvé.</Text></View>}
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
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  completedBadge: { backgroundColor: "#16A34A" },
  rejectedBadge: { backgroundColor: "#DC2626" },
  statusText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  empty: { marginTop: 100, alignItems: "center" },
  emptyText: { color: "#9CA3AF", fontSize: 16 },
  opportunityButton: { marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFD166", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  opportunityButtonText: { color: "#0A1628", fontWeight: "800", fontSize: 13 },
  withdrawalSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { color: "#0A1628", fontSize: 19, fontWeight: "800" },
  sectionSubtitle: { color: "#64748B", fontSize: 12, marginTop: 3 },
  refreshWithdrawalButton: { backgroundColor: "#FFD166", width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  emptyWithdrawal: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 18 },
  emptyWithdrawalText: { color: "#64748B", fontSize: 13 },
  withdrawalCard: { backgroundColor: "#FFF7ED", borderColor: "#FDBA74", borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  withdrawalInfo: { flex: 1 },
  withdrawalTitle: { color: "#0A1628", fontSize: 16, fontWeight: "800" },
  withdrawalPhone: { color: "#475569", fontSize: 13, marginTop: 2 },
  withdrawalAmount: { color: "#C2410C", fontSize: 17, fontWeight: "800", marginTop: 5 },
  withdrawalDate: { color: "#64748B", fontSize: 11, marginTop: 3 },
  withdrawalActions: { flexDirection: "row", gap: 8, marginLeft: 10 },
  withdrawalButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  approveButton: { backgroundColor: "#16A34A" },
  rejectButton: { backgroundColor: "#DC2626" },
  registrationCard: { backgroundColor: "#ECFDF5", borderColor: "#6EE7B7", borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  registrationInfo: { flex: 1 },
  registrationTitle: { color: "#0A1628", fontSize: 16, fontWeight: "800" },
  registrationPhone: { color: "#475569", fontSize: 13, marginTop: 2 },
  registrationDate: { color: "#64748B", fontSize: 11, marginTop: 3 },
  registrationActions: { flexDirection: "row", gap: 8, marginLeft: 10 },
  registrationButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  membersTitle: { color: "#0A1628", fontSize: 19, fontWeight: "800", marginTop: 14, marginBottom: 10 },
});
