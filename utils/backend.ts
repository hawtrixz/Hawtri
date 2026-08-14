// utils/backend.ts
//
// Hawtrix 2.87.0 — Client du serveur Hawtrix
// ===========================================
// Remplace l'ancien stockage 100 % local par de vrais appels au serveur :
// inscription, connexion, chat partagé entre utilisateurs, notifications,
// retraits, et panneau admin.
//
// CONFIGURATION (une seule ligne à modifier) :
//   - Créez un fichier .env à la racine du projet avec :
//       EXPO_PUBLIC_API_URL=https://votre-url-backend.onrender.com
//   - OU définissez la variable dans EAS Build
//
// URL de production officielle du backend Render. La variable d’environnement
// reste prioritaire pour les environnements de test ou les déploiements futurs.
//
// Utilisation : import { backend } from "@/utils/backend";

export class BackendError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://hawtrix-server.onrender.com"
).replace(/\/+$/, "");

// BASE_URL possède un fallback de production afin que l’APK EAS fonctionne
// même si aucune variable publique n’est injectée dans l’environnement de build.

/** Lit le jeton JWT stocké localement */
export function getToken(): string | null {
  // Utilise AsyncStorage de manière synchrone n'est pas possible ;
  // les appels réseau attendent getAuthHeaders() en async.
  return null; // placeholder, voir getAuthHeaders
}

let tokenCache: string | null = null;

export async function setToken(token: string | null) {
  const storage = await import("@react-native-async-storage/async-storage");
  tokenCache = token;
  if (token) await storage.default.setItem("hawtrix_token", token);
  else await storage.default.removeItem("hawtrix_token");
}

async function loadToken(): Promise<string | null> {
  if (tokenCache) return tokenCache;
  const storage = await import("@react-native-async-storage/async-storage");
  tokenCache = await storage.default.getItem("hawtrix_token");
  return tokenCache;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await loadToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  if (!BASE_URL) {
    throw new BackendError(
      "Serveur non configuré. Définissez EXPO_PUBLIC_API_URL dans votre fichier .env.",
    );
  }
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // réponse non-JSON
  }
  if (!res.ok) {
    throw new BackendError(data?.message || `Erreur ${res.status}`, res.status);
  }
  return data as T;
}

/* =================== Types =================== */

export interface ServerUser {
  id: string;
  name: string;
  surname: string;
  phone: string;
  profession: string;
  neighborhood: string;
  referralCode: string;
  referrerId: string | null;
  grade: string;
  bio: string;
  skills: string[];
  avatar: string;
  balance: number;
  totalEarnings: number;
  networkCount: number;
  branches: Record<string, string[]>;
  inviteLimit: number | null;
  isBanned: boolean;
  isSuspended: boolean;
  tutorialSeen: boolean;
  joinedAt: string;
}

export interface ServerMessage {
  id: string;
  senderId: string;
  name?: string;
  surname?: string;
  text: string;
  timestamp: string;
  read?: number | boolean;
}

export interface ServerConversation {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
}

export interface ServerNotification {
  id: string;
  type: "mlm" | "training" | "opportunity" | "message" | "system";
  title: string;
  body: string;
  read: boolean;
  created_at?: string;
}

/* =================== Auth =================== */

export const backend = {
  /** Inscription : crée le compte et sauvegarde le jeton */
  async register(data: {
    name: string;
    surname: string;
    phone: string;
    password: string;
    profession?: string;
    neighborhood?: string;
    referrerCode?: string;
  }): Promise<{ user: ServerUser; token: string }> {
    const res = await request<{ success: boolean; user: ServerUser; token: string }>(
      "POST", "/auth/register", data,
    );
    await setToken(res.token);
    return { user: res.user, token: res.token };
  },

  /** Connexion : vérifie téléphone + mot de passe */
  async login(phone: string, password: string): Promise<{ user: ServerUser; token: string }> {
    const res = await request<{ success: boolean; user: ServerUser; token: string }>(
      "POST", "/auth/login", { phone, password },
    );
    await setToken(res.token);
    return { user: res.user, token: res.token };
  },

  /** Profil de l'utilisateur connecté */
  async getMe(): Promise<ServerUser> {
    const res = await request<{ success: boolean; user: ServerUser }>("GET", "/auth/me");
    return res.user;
  },

  /** Mise à jour du profil */
  async updateProfile(data: Partial<ServerUser>): Promise<ServerUser> {
    const res = await request<{ success: boolean; user: ServerUser }>("PUT", "/auth/me", data);
    return res.user;
  },

  /* =================== Chat =================== */

  /** Liste des conversations */
  async getConversations(): Promise<ServerConversation[]> {
    const res = await request<{ success: boolean; conversations: any[] }>("GET", "/chat/conversations");
    return res.conversations.map((c: any) => ({
      id: c.id,
      participantId: c.participantId ?? c.participant_id,
      participantName: c.participantName ?? c.participant_name ?? "Utilisateur",
      lastMessage: c.lastMessage ?? c.last_message ?? "",
      lastTimestamp: c.lastTimestamp ?? c.last_timestamp ?? new Date().toISOString(),
      unread: Number(c.unread ?? 0),
    }));
  },

  /** Recherche de contacts */
  async searchUsers(query?: string): Promise<any[]> {
    const q = query ? `?q=${encodeURIComponent(query)}` : "";
    const res = await request<{ success: boolean; users: any[] }>(
      "GET", `/chat/users${q}`,
    );
    return res.users;
  },

  /** Ouvrir une conversation avec un utilisateur */
  async openConversation(participantId: string) {
    const res = await request<{ success: boolean; conversation: ServerConversation }>(
      "POST", "/chat/conversations", { participantId },
    );
    return res.conversation;
  },

  /** Messages d'une conversation */
  async getMessages(conversationId: string): Promise<ServerMessage[]> {
    const res = await request<{ success: boolean; messages: any[] }>("GET", `/chat/conversations/${conversationId}`);
    return res.messages.map((m: any) => ({
      id: m.id,
      senderId: m.senderId ?? m.sender_id,
      name: m.name,
      surname: m.surname,
      text: m.text,
      timestamp: m.timestamp ?? m.created_at,
      read: Boolean(m.read),
    }));
  },

  /** Envoyer un message */
  async sendMessage(conversationId: string, text: string): Promise<ServerMessage> {
    const res = await request<{ success: boolean; message: ServerMessage }>(
      "POST", `/chat/conversations/${conversationId}`, { text },
    );
    return res.message;
  },

  /* =================== Notifications =================== */

  async getNotifications(): Promise<ServerNotification[]> {
    const res = await request<{ success: boolean; notifications: ServerNotification[] }>(
      "GET", "/notifications",
    );
    return res.notifications;
  },

  async markNotificationRead(id: string) {
    await request("PUT", `/notifications/${id}`);
  },

  async markAllNotificationsRead() {
    await request("POST", "/notifications/read-all");
  },

  /* =================== Retraits =================== */

  async withdraw(amount: number, code: string) {
    return request<{ success: boolean; message: string }>(
      "POST", "/withdrawals", { amount, code },
    );
  },

  async getWithdrawals() {
    const res = await request<{ success: boolean; withdrawals: any[] }>("GET", "/withdrawals");
    return res.withdrawals;
  },

  /* =================== Opportunités =================== */

  async getOpportunities() {
    const res = await request<{ success: boolean; opportunities: any[] }>("GET", "/opportunities");
    return res.opportunities;
  },

  async adminGetOpportunities() {
    const res = await request<{ success: boolean; opportunities: any[] }>("GET", "/admin/opportunities");
    return res.opportunities;
  },

  async adminCreateOpportunity(data: Record<string, unknown>) {
    const res = await request<{ success: boolean; opportunity: any }>("POST", "/admin/opportunities", data);
    return res.opportunity;
  },

  async adminUpdateOpportunity(id: string, data: Record<string, unknown>) {
    const res = await request<{ success: boolean; opportunity: any }>("PATCH", `/admin/opportunities/${id}`, data);
    return res.opportunity;
  },

  async adminDisableOpportunity(id: string) {
    return request("DELETE", `/admin/opportunities/${id}`);
  },

  /* =================== Admin =================== */

  async adminGetUsers() {
    const res = await request<{ success: boolean; users: any[] }>("GET", "/admin/users");
    return res.users;
  },

  async adminBanUser(userId: string, banned: boolean) {
    return request("PATCH", `/admin/users/${userId}/ban`, { banned });
  },

  async adminSuspendUser(userId: string, suspended: boolean) {
    return request("PATCH", `/admin/users/${userId}/suspend`, { suspended });
  },

  async adminSendNotificationToAll(title: string, body: string, type = "system") {
    return request("POST", "/admin/notifications", { title, body, type });
  },

  /** Déconnexion locale */
  async logout() {
    await setToken(null);
  },
};

