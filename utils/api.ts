// utils/api.ts
//
// Hawtrix 2.86 — client d'appel STRICTEMENT EN LIGNE
// ---------------------------------------------------------------
// Plus de contenu simulé. Toutes les requêtes passent par le
// backend configuré (EXPO_PUBLIC_API_URL). En mode local sans
// backend, l'écran qui consomme le contenu doit pointer vers une
// ressource externe officielle (lien dans data/trainings.ts), et
// non plus afficher un contenu généré localement.
//
// Signature inchangée : apiPost<T>(path, body) -> Promise<T>

import { isOnline, NetworkRequiredError } from "@/utils/network";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export async function apiPost<T>(path: string, body?: Record<string, any>): Promise<T> {
  // 1) Internet obligatoire : sans connexion, on bloque immédiatement.
  if (!(await isOnline())) {
    throw new NetworkRequiredError();
  }

  // 2) Backend configuré : requête réelle uniquement.
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) throw new ApiError(`Requête échouée (${res.status})`, res.status);
    return (await res.json()) as T;
  }

  // 3) Pas de backend : pas de contenu simulé. L'appelant doit
  // ouvrir la ressource externe officielle associée (voir
  // data/trainings.ts).
  throw new ApiError("Cette fonctionnalité nécessite un backend configuré ou une ressource externe officielle.");
}
