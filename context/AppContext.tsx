import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { backend } from "@/utils/backend";

export type Grade =
  | "membre"
  | "pionier"
  | "saphir"
  | "rubis"
  | "emeraude"
  | "magnat"
  | "icone"
  | "directeur"
  | "directeur2"
  | "directeur5"
  | "president";

export interface NetworkMember {
  id: string;
  name: string;
  grade: Grade;
  joinedAt: string;
  referrerId: string;
  referralCode: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  profession: string;
  neighborhood: string;
  phone: string;
  referralCode: string;
  referrerId: string | null;
  grade: Grade;
  joinedAt: string;
  totalEarnings: number;
  networkCount: number;
  branches: Record<string, string[]>;
  tutorialSeen: boolean;
  avatar?: string;
  bio?: string;
  skills?: string[];
  inviteLimit?: number | null;
  balance: number;
  isBanned?: boolean;
  isSuspended?: boolean;
}

export interface Withdrawal {
  id: string;
  amount: number;
  status: "pending" | "completed" | "rejected";
  timestamp: string;
  code: string;
}

export interface AdminUserView {
  id: string;
  name: string;
  surname: string;
  phone: string;
  profession: string;
  neighborhood: string;
  grade: Grade;
  balance: number;
  totalEarnings: number;
  networkCount: number;
  referrerId: string | null;
  referralCode: string;
  joinedAt: string;
  isBanned: boolean;
  isSuspended: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  timestamp: string;
  read: boolean;
}

export interface AppContextType {
  user: User | null;
  termsAccepted: boolean;
  paymentDone: boolean;
  conversations: Conversation[];
  notifications: Notification[];
  isLoading: boolean;
  setTermsAccepted: (v: boolean) => void;
  setPaymentDone: (v: boolean) => void;
  createUser: (data: Omit<User, "id" | "referralCode" | "grade" | "joinedAt" | "totalEarnings" | "networkCount" | "branches" | "tutorialSeen" | "balance"> & { password: string }) => Promise<void>;
  loginUser: (phone: string, password: string) => Promise<void>;
  refreshProfile: () => Promise<User | null>;
  refreshAll: () => Promise<User | null>;
  refreshConversations: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  markTutorialSeen: () => Promise<void>;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  getOrCreateConversation: (participantId: string, participantName: string) => Promise<string>;
  markConversationRead: (conversationId: string) => Promise<void>;
  logout: () => Promise<void>;
  isSpecialPhone: (phone: string) => boolean;
  withdraw: (amount: number, code: string) => Promise<{ success: boolean; message: string }>;
  banUser: (userId: string) => Promise<void>;
  suspendUser: (userId: string, status: boolean) => Promise<void>;
  getAllUsers: () => Promise<AdminUserView[]>;
}

const SPECIAL_ACCOUNTS: Record<string, Grade> = {
  "+22890496651": "president",
  "22890496651": "president",
};

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [paymentDone, setPaymentDone] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const [termsRaw, paymentRaw, userRaw, convsRaw, notifsRaw] = await Promise.all([
          AsyncStorage.getItem("hawtrix_terms"),
          AsyncStorage.getItem("hawtrix_payment"),
          AsyncStorage.getItem("hawtrix_user"),
          AsyncStorage.getItem("hawtrix_conversations"),
          AsyncStorage.getItem("hawtrix_notifications"),
        ]);
        setTermsAccepted(termsRaw === "true");
        setPaymentDone(paymentRaw === "true");
        if (userRaw) {
          const localUser = JSON.parse(userRaw) as User;
          setUser(localUser);
          // Le serveur reste la source de vérité : rafraîchir le profil et
          // les conversations depuis la base de données.
          try {
            const remoteUser = await backend.getMe();
            setUser(remoteUser as unknown as User);
            await AsyncStorage.setItem("hawtrix_user", JSON.stringify(remoteUser));
            const remoteConversations = await backend.getConversations();
            const normalized = remoteConversations.map((c: any) => ({
              id: c.id,
              participantId: c.participantId,
              participantName: c.participantName,
              lastMessage: c.lastMessage || "",
              lastTimestamp: c.lastTimestamp || new Date().toISOString(),
              unread: Number(c.unread || 0),
              messages: [],
            }));
            setConversations(normalized);
            await AsyncStorage.setItem("hawtrix_conversations", JSON.stringify(normalized));
          } catch {
            // Le serveur est injoignable : conserver l'état local.
            if (convsRaw) setConversations(JSON.parse(convsRaw));
          }
        } else {
          // Après une réinstallation ou un changement de téléphone, le profil local
          // peut avoir disparu. Le serveur reste la source de vérité : si un jeton
          // persistant existe, restaurer le compte avant d'afficher l'inscription.
          try {
            const remoteUser = await backend.getMe();
            setUser(remoteUser as unknown as User);
            await AsyncStorage.setItem("hawtrix_user", JSON.stringify(remoteUser));
            // Restaurer aussi les conversations depuis le serveur après la restauration du compte.
            const remoteConversations = await backend.getConversations();
            const restored = remoteConversations.map((c: any) => ({
              id: c.id,
              participantId: c.participantId,
              participantName: c.participantName,
              lastMessage: c.lastMessage || "",
              lastTimestamp: c.lastTimestamp || new Date().toISOString(),
              unread: Number(c.unread || 0),
              messages: [],
            }));
            setConversations(restored);
            await AsyncStorage.setItem("hawtrix_conversations", JSON.stringify(restored));
          } catch {
            // Aucun jeton valide : l'écran d'accueil proposera connexion ou inscription.
            if (convsRaw) setConversations(JSON.parse(convsRaw));
          }
        }
        if (notifsRaw) setNotifications(JSON.parse(notifsRaw));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const isSpecialPhone = useCallback((phone: string): boolean => {
    const clean = phone.replace(/\s/g, "");
    return clean in SPECIAL_ACCOUNTS;
  }, []);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    try {
      const remoteUser = await backend.getMe();
      setUser(remoteUser as unknown as User);
      await AsyncStorage.setItem("hawtrix_user", JSON.stringify(remoteUser));
      return remoteUser as unknown as User;
    } catch {
      return null;
    }
  }, []);

  const refreshConversations = useCallback(async (): Promise<void> => {
    try {
      const remoteConversations = await backend.getConversations();
      const normalized = remoteConversations.map((c: any) => ({
        id: c.id,
        participantId: c.participantId,
        participantName: c.participantName,
        lastMessage: c.lastMessage || "",
        lastTimestamp: c.lastTimestamp || new Date().toISOString(),
        unread: Number(c.unread || 0),
        messages: [],
      }));
      setConversations(normalized);
      await AsyncStorage.setItem("hawtrix_conversations", JSON.stringify(normalized));
    } catch {
      // Conserver les conversations locales si le réseau est indisponible.
    }
  }, []);

  const refreshAll = useCallback(async (): Promise<User | null> => {
    const nextUser = await refreshProfile();
    await refreshConversations();
    try {
      const remoteNotifications = await backend.getNotifications();
      const normalized = remoteNotifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        timestamp: n.created_at || n.timestamp || new Date().toISOString(),
        read: Boolean(n.read),
      }));
      setNotifications(normalized);
      await AsyncStorage.setItem("hawtrix_notifications", JSON.stringify(normalized));
    } catch {
      // Conserver les notifications locales si le réseau est indisponible.
    }
    return nextUser;
  }, [refreshProfile, refreshConversations]);

  const loginUser = useCallback(async (phone: string, password: string) => {
    const remote = await backend.login(phone.replace(/\s/g, ""), password);
    const remoteUser = remote.user as unknown as User;
    setUser(remoteUser);
    await AsyncStorage.setItem("hawtrix_user", JSON.stringify(remoteUser));
    await setTermsAccepted(true);
    await setPaymentDone(true);
  }, [setPaymentDone, setTermsAccepted]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error("Utilisateur non connecté");
    const next = { ...user, ...data } as User;
    setUser(next);
    await AsyncStorage.setItem("hawtrix_user", JSON.stringify(next));
  }, [user]);

  const markTutorialSeen = useCallback(async () => {
    if (!user) return;
    const next = { ...user, tutorialSeen: true };
    setUser(next);
    await AsyncStorage.setItem("hawtrix_user", JSON.stringify(next));
    try {
      await backend.setTutorialSeen(true);
    } catch {
      // Le serveur est injoignable : l'état local est conservé.
    }
  }, [user]);

  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp" | "read">) => {
    setNotifications(prev => {
      const fresh: Notification[] = [
        { ...n, id: `local_${Date.now()}`, timestamp: new Date().toISOString(), read: false },
        ...prev,
      ];
      AsyncStorage.setItem("hawtrix_notifications", JSON.stringify(fresh.slice(0, 50))).catch(() => {});
      return fresh;
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const convId = conversationId;
    const outbound: Message = {
      id: `local_${Date.now()}`,
      conversationId: convId,
      senderId: "me",
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setConversations(prev =>
      prev.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, outbound], lastMessage: text, lastTimestamp: outbound.timestamp }
          : c,
      ),
    );
    backend
      .sendMessage(convId, text)
      .catch(() => {
        // Échec réseau : le message local reste affiché, la resynchronisation
        // reprendra au prochain cycle de rafraîchissement.
      });
  }, []);

  const getOrCreateConversation = useCallback(async (participantId: string, participantName: string): Promise<string> => {
    const existing = conversations.find(c => c.participantId === participantId);
    if (existing) return existing.id;
    try {
      const conv = await backend.getOrCreateConversation(participantId);
      const fresh: Conversation = {
        id: conv.id,
        participantId: conv.participantId,
        participantName: conv.participantName || participantName,
        lastMessage: "",
        lastTimestamp: conv.lastTimestamp || new Date().toISOString(),
        unread: 0,
        messages: [],
      };
      setConversations(prev => [fresh, ...prev]);
      return fresh.id;
    } catch {
      const fallbackId = `local_${Date.now()}`;
      const fallback: Conversation = {
        id: fallbackId,
        participantId,
        participantName,
        lastMessage: "",
        lastTimestamp: new Date().toISOString(),
        unread: 0,
        messages: [],
      };
      setConversations(prev => [fallback, ...prev]);
      return fallbackId;
    }
  }, [conversations]);

  const markConversationRead = useCallback(async (conversationId: string) => {
    try {
      const messages = await backend.getMessages(conversationId);
      const normalized: Message[] = messages.map((m: any) => ({
        id: String(m.id),
        conversationId: String(m.conversation_id ?? conversationId),
        senderId: String(m.sender_id ?? m.senderId),
        text: m.text ?? "",
        timestamp: m.created_at || m.timestamp || new Date().toISOString(),
        read: Boolean(m.read),
      }));
      await backend.markConversationRead(conversationId).catch(() => {});
      setConversations(prev =>
        prev.map(c => (c.id === conversationId ? { ...c, messages: normalized, unread: 0 } : c)),
      );
      await AsyncStorage.setItem("hawtrix_conversations", JSON.stringify(conversations.map(c => (c.id === conversationId ? { ...c, messages: normalized, unread: 0 } : c))));
    } catch {
      // Le serveur est temporairement injoignable.
    }
  }, [conversations]);

  const calculateWithdrawalCode = (amount: number, date: Date): string => {
    const salt = "hawtrix_withdraw_2026";
    const raw = `${salt}_${amount}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const digits = "23456789";
    const absHash = Math.abs(hash);
    return `${letters.charAt(absHash % 24)}${digits.charAt(absHash % 8)}${letters.charAt((absHash >> 3) % 24)}`;
  };

  const withdraw = useCallback(async (amount: number, code: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "Utilisateur non connecté" };
    if (user.balance < amount) return { success: false, message: "Solde insuffisant" };

    const expectedCode = calculateWithdrawalCode(amount, new Date());
    if (code !== expectedCode) {
      return { success: false, message: "Code de retrait invalide" };
    }

    // La demande de retrait est envoyée au serveur : il déduit le montant du
    // vrai solde (SQLite) et ouvre la demande à la validation de l'administrateur.
    try {
      const res = await backend.withdraw(amount, code);
      if (!res.success) {
        return { success: false, message: res.message || "Échec du retrait" };
      }
    } catch {
      return { success: false, message: "Le serveur est injoignable, réessayez dans quelques instants." };
    }

    // Le solde du serveur fait foi : recharger le profil depuis la source de vérité.
    await refreshProfile();

    addNotification({
      title: "Retrait demandé",
      body: `Votre demande de retrait de ${amount} F CFA est en attente de validation par l'administrateur.`,
      type: "system"
    });

    return { success: true, message: "Demande de retrait envoyée. En attente de validation." };
  }, [user, refreshProfile, addNotification]);

  const banUser = useCallback(async (userId: string) => {
    await backend.adminBanUser(userId, true);
    if (user?.id === userId) setUser({ ...user, isBanned: true });
  }, [user]);

  const suspendUser = useCallback(async (userId: string, status: boolean) => {
    await backend.adminSuspendUser(userId, status);
    if (user?.id === userId) setUser({ ...user, isSuspended: status });
  }, [user]);

  const logout = useCallback(async () => {
    await backend.logout();
    // Le mot de passe 2FA (hawtrix_pass_hash / hawtrix_pass_set) n'est PAS
    // effacé : il appartient au compte, pas à la session. Seul l'appareil
    // perd la session ; le numéro et le mot de passe restent valables.
    await AsyncStorage.multiRemove([
      "hawtrix_user",
      "hawtrix_terms",
      "hawtrix_payment",
      "hawtrix_conversations",
      "hawtrix_notifications",
    ]);
    setUser(null);
    setConversations([]);
    setNotifications([]);
  }, []);

  const getAllUsers = useCallback(async (): Promise<AdminUserView[]> => {
    const users = await backend.getAllUsers();
    return users.map((u: any) => ({
      id: String(u.id),
      name: u.first_name || u.name || "",
      surname: u.last_name || u.surname || "",
      phone: u.phone || "",
      profession: u.profession || "",
      neighborhood: u.neighborhood || "",
      grade: (u.grade || "membre") as Grade,
      balance: Number(u.balance || 0),
      totalEarnings: Number(u.total_earnings || 0),
      networkCount: Number(u.network_count || 0),
      referrerId: u.referrer_id || null,
      referralCode: u.referral_code || "",
      joinedAt: u.joined_at || "",
      isBanned: Boolean(u.is_banned),
      isSuspended: Boolean(u.is_suspended),
    }));
  }, []);

  return (
    <AppContext.Provider value={{
      user, termsAccepted, paymentDone, conversations, notifications, isLoading,
      setTermsAccepted, setPaymentDone, updateUser, markTutorialSeen, addNotification, markNotificationRead, sendMessage, getOrCreateConversation,
      markConversationRead, logout, isSpecialPhone,
      withdraw, banUser, suspendUser, getAllUsers, refreshProfile, refreshAll, refreshConversations, loginUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}
