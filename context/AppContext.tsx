import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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
  joinedAt: string;
  referrerId: string | null;
  isBanned: boolean;
  isSuspended: boolean;
  profession?: string;
  neighborhood?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
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

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "mlm" | "training" | "opportunity" | "message" | "system";
  timestamp: string;
  read: boolean;
}

interface AppContextType {
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
  updateUser: (data: Partial<User>) => Promise<void>;
  markTutorialSeen: () => Promise<void>;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  getOrCreateConversation: (participantId: string, participantName: string) => string;
  markConversationRead: (id: string) => void;
  logout: () => Promise<void>;
  isSpecialPhone: (phone: string) => boolean;
  withdraw: (amount: number, code: string) => Promise<{ success: boolean; message: string }>;
  banUser: (userId: string) => Promise<void>;
  suspendUser: (userId: string, status: boolean) => Promise<void>;
  getAllUsers: () => Promise<AdminUserView[]>;
}

const AppContext = createContext<AppContextType | null>(null);

function generateCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = letters + digits;

  // Generate 4 random chars, then insert 1 guaranteed digit at a random position
  const arr: string[] = [];
  for (let i = 0; i < 4; i++) {
    arr.push(all[Math.floor(Math.random() * all.length)]);
  }
  const digitPos = Math.floor(Math.random() * 5);
  arr.splice(digitPos, 0, digits[Math.floor(Math.random() * digits.length)]);

  return arr.join(""); // 5 chars, e.g. "HK3MZ", "B7ACF"
}

// Comptes spéciaux pré-créés
const SPECIAL_ACCOUNTS: Record<string, User> = {
  "+22890496651": {
    id: "president-001",
    name: "Fondateur",
    surname: "Hawtrix",
    profession: "Président Fondateur",
    neighborhood: "Lomé, Togo",
    phone: "+22890496651",
    referralCode: "HWT-PRESIDENT",
    referrerId: null,
    grade: "president",
    joinedAt: "2025-01-01T00:00:00.000Z",
    totalEarnings: 0,
    networkCount: 0,
    branches: {},
    tutorialSeen: true,
    inviteLimit: 2,
    balance: 0,
  },
  "+22892525577": {
    id: "admin-002",
    name: "Admin",
    surname: "Hawtrix",
    profession: "Directeur Général",
    neighborhood: "Lomé, Togo",
    phone: "+22892525577",
    referralCode: "HWT-ADMIN001",
    referrerId: "HWT-PRESIDENT",
    grade: "directeur",
    joinedAt: "2025-01-01T00:00:00.000Z",
    totalEarnings: 0,
    networkCount: 0,
    branches: {},
    tutorialSeen: true,
    inviteLimit: null,
    balance: 0,
  },
};

function calculateGrade(networkCount: number, branches: Record<string, string[]>): Grade {
  const branchCount = Object.keys(branches).length;

  // Directeur 5★ : 1 000 000 personnes + 2 directeurs 2★ sur 2 branches différentes
  if (networkCount >= 1000000 && branchCount >= 2) return "directeur5";

  // Directeur 2★ : 100 000 personnes + 4 directeurs sur 4 branches différentes
  if (networkCount >= 100000 && branchCount >= 4) return "directeur2";

  // Directeur simple : 10 000 personnes
  if (networkCount >= 10000) return "directeur";

  if (networkCount >= 1000) return "icone";
  if (networkCount >= 500) return "magnat";
  if (networkCount >= 250) return "emeraude";
  if (networkCount >= 100) return "rubis";
  if (networkCount >= 35) return "saphir";
  if (networkCount >= 10) return "pionier";
  return "membre";
}

export const GRADE_INFO: Record<Grade, { label: string; color: string; minCount: number; dividendPct: number; cardLevel: number }> = {
  membre:     { label: "Membre",             color: "#6B7280", minCount: 0,        dividendPct: 0,   cardLevel: 0 },
  pionier:    { label: "Pionier",            color: "#CD7F32", minCount: 10,       dividendPct: 0,   cardLevel: 1 },
  saphir:     { label: "Saphir",             color: "#0F52BA", minCount: 35,       dividendPct: 0,   cardLevel: 2 },
  rubis:      { label: "Rubis",              color: "#9B111E", minCount: 100,      dividendPct: 0,   cardLevel: 3 },
  emeraude:   { label: "Emeraude",           color: "#50C878", minCount: 250,      dividendPct: 0,   cardLevel: 4 },
  magnat:     { label: "Magnat",             color: "#B8860B", minCount: 500,      dividendPct: 4,   cardLevel: 5 },
  icone:      { label: "Icone",              color: "#8B008B", minCount: 1000,     dividendPct: 8,   cardLevel: 6 },
  directeur:  { label: "Directeur",          color: "#FF6B00", minCount: 10000,    dividendPct: 6,   cardLevel: 7 },
  directeur2: { label: "Directeur ⭐⭐",     color: "#E8B800", minCount: 100000,   dividendPct: 14,  cardLevel: 8 },
  directeur5: { label: "Directeur ⭐⭐⭐⭐⭐", color: "#C0A020", minCount: 1000000, dividendPct: 30,  cardLevel: 9 },
  president:  { label: "Président Fondateur",color: "#FFD700", minCount: 99999999999,  dividendPct: 40,  cardLevel: 10 },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [termsAccepted, setTermsAcceptedState] = useState(false);
  const [paymentDone, setPaymentDoneState] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [termsRaw, paymentRaw, userRaw, convsRaw, notifsRaw] = await Promise.all([
        AsyncStorage.getItem("hawtrix_terms"),
        AsyncStorage.getItem("hawtrix_payment"),
        AsyncStorage.getItem("hawtrix_user"),
        AsyncStorage.getItem("hawtrix_conversations"),
        AsyncStorage.getItem("hawtrix_notifications"),
      ]);
      if (termsRaw) setTermsAcceptedState(JSON.parse(termsRaw));
      if (paymentRaw) setPaymentDoneState(JSON.parse(paymentRaw));
      if (userRaw) setUser(JSON.parse(userRaw));
      if (convsRaw) setConversations(JSON.parse(convsRaw));
      if (notifsRaw) setNotifications(JSON.parse(notifsRaw));
      } finally {
    setIsLoading(false);
  }
};

const refreshProfile = useCallback(async (): Promise<User | null> => {
  try {
    const remoteUser = await backend.getMe();
    const nextUser = remoteUser as unknown as User;
    setUser(nextUser);
    await AsyncStorage.setItem("hawtrix_user", JSON.stringify(nextUser));
    return nextUser;
  } catch {
    return null;
  }
}, []);

const isSpecialPhone = useCallback((phone: string): boolean => {
    const clean = phone.replace(/\s/g, "");
    return clean in SPECIAL_ACCOUNTS;
  }, []);


  const setTermsAccepted = useCallback(async (v: boolean) => {
    setTermsAcceptedState(v);
    await AsyncStorage.setItem("hawtrix_terms", JSON.stringify(v));
  }, []);

  const setPaymentDone = useCallback(async (v: boolean) => {
    setPaymentDoneState(v);
    await AsyncStorage.setItem("hawtrix_payment", JSON.stringify(v));
  }, []);

  const createUser = useCallback(async (data: Omit<User, "id" | "referralCode" | "grade" | "joinedAt" | "totalEarnings" | "networkCount" | "branches" | "tutorialSeen" | "balance"> & { password: string }) => {
    const cleanPhone = (data.phone ?? "").replace(/\s/g, "");

    // Les comptes avec mot de passe sont persistés côté serveur. Le mot de passe
    // n'est jamais écrit dans AsyncStorage et ne peut pas être réinitialisé par l'APK.
    const remote = await backend.register({
      name: data.name,
      surname: data.surname,
      phone: cleanPhone,
      password: data.password,
      profession: data.profession,
      neighborhood: data.neighborhood,
      referrerCode: data.referrerId ?? undefined,
    });
    const remoteUser = remote.user as unknown as User;
    setUser(remoteUser);
    await AsyncStorage.setItem("hawtrix_user", JSON.stringify(remoteUser));
    await setTermsAccepted(true);
    await setPaymentDone(true);
    return;
  }, [setPaymentDone, setTermsAccepted]);

  const loginUser = useCallback(async (phone: string, password: string) => {
    const remote = await backend.login(phone.replace(/\s/g, ""), password);
    const remoteUser = remote.user as unknown as User;
    setUser(remoteUser);
    await AsyncStorage.setItem("hawtrix_user", JSON.stringify(remoteUser));
    await setTermsAccepted(true);
    await setPaymentDone(true);
  }, [setPaymentDone, setTermsAccepted]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      if (updated.phone && !SPECIAL_ACCOUNTS[updated.phone.replace(/\s/g, "")]) {
        updated.grade = calculateGrade(updated.networkCount, updated.branches);
      }
      AsyncStorage.setItem("hawtrix_user", JSON.stringify(updated));
      
      // Update in global list too
      AsyncStorage.getItem("hawtrix_all_users").then(raw => {
        if (raw) {
          const all = JSON.parse(raw) as User[];
          const idx = all.findIndex(u => u.id === updated.id);
          if (idx !== -1) {
            all[idx] = updated;
            AsyncStorage.setItem("hawtrix_all_users", JSON.stringify(all));
          }
        }
      });

      return updated;
    });
  }, []);

  const markTutorialSeen = useCallback(async () => {
    await updateUser({ tutorialSeen: true });
  }, [updateUser]);

  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp" | "read">) => {
    const notif: Notification = {
      ...n,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => {
      const updated = [notif, ...prev].slice(0, 50);
      AsyncStorage.setItem("hawtrix_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      AsyncStorage.setItem("hawtrix_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getOrCreateConversation = useCallback((participantId: string, participantName: string): string => {
    const existing = conversations.find(c => c.participantId === participantId);
    if (existing) return existing.id;
    const newConv: Conversation = {
      id: Date.now().toString(),
      participantId,
      participantName,
      lastMessage: "",
      lastTimestamp: new Date().toISOString(),
      unread: 0,
      messages: [],
    };
    setConversations(prev => {
      const updated = [newConv, ...prev];
      AsyncStorage.setItem("hawtrix_conversations", JSON.stringify(updated));
      return updated;
    });
    return newConv.id;
  }, [conversations]);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      senderId: user?.id ?? "me",
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== conversationId) return c;
        return { ...c, lastMessage: text, lastTimestamp: msg.timestamp, messages: [...c.messages, msg] };
      });
      AsyncStorage.setItem("hawtrix_conversations", JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const markConversationRead = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c);
      AsyncStorage.setItem("hawtrix_conversations", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const calculateWithdrawalCode = (amount: number, date: Date): string => {
    const amountStr = amount.toString();
    let sumDigitsAmount = 0;
    for (const char of amountStr) {
      if (/[0-9]/.test(char)) sumDigitsAmount += parseInt(char, 10);
    }

    const base = sumDigitsAmount * 888 + 987654;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const dateStr = day + month + year;

    let sumDigitsDate = 0;
    for (const char of dateStr) {
      sumDigitsDate += parseInt(char, 10);
    }

    const result = (base + sumDigitsDate).toString();
    return result.slice(-6).padStart(6, '0');
  };

  const getAllUsers = useCallback(async (): Promise<AdminUserView[]> => {
    const raw = await AsyncStorage.getItem("hawtrix_all_users");
    if (!raw) return [];
    const users: User[] = JSON.parse(raw);
    return users.map(u => ({
      id: u.id,
      name: u.name,
      surname: u.surname,
      phone: u.phone,
      joinedAt: u.joinedAt,
      referrerId: u.referrerId,
      isBanned: !!u.isBanned,
      isSuspended: !!u.isSuspended,
      profession: u.profession ?? undefined,
      neighborhood: u.neighborhood ?? undefined,
    }));
  }, []);

  const withdraw = useCallback(async (amount: number, code: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "Utilisateur non connecté" };
    if (user.balance < amount) return { success: false, message: "Solde insuffisant" };

    const expectedCode = calculateWithdrawalCode(amount, new Date());
    if (code !== expectedCode) {
      return { success: false, message: "Code de retrait invalide" };
    }

    const newBalance = user.balance - amount;
    await updateUser({ balance: newBalance });
    
    addNotification({
      title: "Retrait effectué",
      body: `Votre demande de retrait de ${amount} F CFA a été traitée.`,
      type: "system"
    });

    return { success: true, message: "Retrait effectué avec succès" };
  }, [user, updateUser, addNotification]);

  const banUser = useCallback(async (userId: string) => {
    const raw = await AsyncStorage.getItem("hawtrix_all_users");
    if (!raw) return;
    let users: User[] = JSON.parse(raw);
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || targetUser.isBanned) return;

    // Marquer comme banni
    users = users.map(u => u.id === userId ? { ...u, isBanned: true } : u);
    
    // Annulation des gains (Algorithme inverse)
    let remainingToCancel = 2000;
    
    // 1. Annulation Président (p0 = 750f)
    const president = users.find(u => u.grade === "president");
    if (president) {
      president.balance -= 750;
      president.totalEarnings -= 750;
      remainingToCancel -= 750;
    }

    // 2. Annulation Réseau
    let currentReferrerId = targetUser.referrerId;
    let currentLevelPayment = 500;
    while (currentReferrerId && remainingToCancel > 0) {
      const referrer = users.find(u => u.referralCode === currentReferrerId);
      if (referrer) {
        const amountToCancel = Math.min(currentLevelPayment, remainingToCancel);
        referrer.balance -= amountToCancel;
        referrer.totalEarnings -= amountToCancel;
        referrer.networkCount = Math.max(0, (referrer.networkCount || 0) - 1);
        
        remainingToCancel -= amountToCancel;
        currentLevelPayment = Math.floor(amountToCancel / 3);
        currentReferrerId = referrer.referrerId;
        if (currentLevelPayment <= 0) break;
      } else {
        break;
      }
    }

    // 3. Annulation reliquat Président
    if (remainingToCancel > 0 && president) {
      president.balance -= remainingToCancel;
      president.totalEarnings -= remainingToCancel;
    }

    await AsyncStorage.setItem("hawtrix_all_users", JSON.stringify(users));
    
    if (user?.id === userId) {
      setUser({ ...user, isBanned: true });
    }
  }, [user]);

  const suspendUser = useCallback(async (userId: string, status: boolean) => {
    const raw = await AsyncStorage.getItem("hawtrix_all_users");
    if (!raw) return;
    let users: User[] = JSON.parse(raw);
    users = users.map(u => u.id === userId ? { ...u, isSuspended: status } : u);
    await AsyncStorage.setItem("hawtrix_all_users", JSON.stringify(users));
    
    if (user?.id === userId) {
      setUser({ ...user, isSuspended: status });
    }
  }, [user]);

  const logout = useCallback(async () => {
    // Le mot de passe 2FA (hawtrix_pass_hash / hawtrix_pass_set) n'est PAS
    // effacé : il appartient au compte, pas à la session. Seul l'appareil
    // actuel est dé-sécurisé (hawtrix_pass_hash_device_<id>) au logout.
    const deviceId = await AsyncStorage.getItem("hawtrix_device_id");
    const keys = ["hawtrix_terms", "hawtrix_payment", "hawtrix_user"];
    if (deviceId) keys.push(`hawtrix_pass_hash_device_${deviceId}`);
    await AsyncStorage.multiRemove(keys);
    setUser(null);
    setTermsAcceptedState(false);
    setPaymentDoneState(false);
  }, []);

  return (
    <AppContext.Provider value={{
      user, termsAccepted, paymentDone, conversations, notifications, isLoading,
      setTermsAccepted, setPaymentDone, createUser, loginUser, refreshProfile, updateUser, markTutorialSeen,
      addNotification, markNotificationRead, sendMessage, getOrCreateConversation,
      markConversationRead, logout, isSpecialPhone,
      withdraw, banUser, suspendUser, getAllUsers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
