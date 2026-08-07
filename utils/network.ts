// utils/network.ts
//
// Hawtrix 2.86 — mode STRICTEMENT EN LIGNE
// ---------------------------------------------------------------
// Aucune fonctionnalité sensible (validation du compte à
// l'inscription, formations, opportunités) ne peut être utilisée
// sans connexion Internet. Ce module centralise la vérification.
//
// Il utilise `expo-network` (Network.isConnectedAsync) et, en
// secours sur web, un ping HTTP léger vers un endpoint fiable.

import * as Network from "expo-network";

export const ONLINE_CHECK_URL = "https://www.google.com/generate_204";

export async function isOnline(): Promise<boolean> {
  try {
    // 1) Détection native du réseau (expo-network)
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected) return false;

    // 2) Double contrôle HTTP : même avec un réseau "connecté",
    // on exige une réponse serveur (pas de portail captif sans
    // internet, pas de Wi-Fi sans sortie).
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(ONLINE_CHECK_URL, {
      method: "HEAD",
      headers: { "Cache-Control": "no-cache" },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    // 204 (Google) ou toute réponse HTTP 2xx/3xx = internet réel
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Garde d'exécution : exécute fn() uniquement si Internet est
 * disponible, sinon rejette avec un ApiError réseau explicite.
 */
export async function requireOnline<T>(fn: () => Promise<T>): Promise<T> {
  if (!(await isOnline())) {
    throw new NetworkRequiredError();
  }
  return fn();
}

export class NetworkRequiredError extends Error {
  constructor() {
    super("Connexion Internet requise. Veuillez réactiver votre connexion puis réessayer.");
    this.name = "NetworkRequiredError";
  }
}

/** Version humaine lisible pour les écrans */
export function networkErrorLabel(err: unknown): string {
  if (err instanceof NetworkRequiredError) return err.message;
  const msg = err instanceof Error ? err.message : String(err);
  if (/network|internet|fetch|timeout/i.test(msg)) {
    return "Connexion Internet requise. Veuillez réactiver votre connexion puis réessayer.";
  }
  return msg || "Une erreur est survenue.";
}
