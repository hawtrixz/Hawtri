// utils/version.ts
//
// Contrôle informatif des versions Hawtrix.
// L'application ne bloque jamais une ancienne version et ne télécharge
// jamais une APK directement depuis l'application.

import Constants from "expo-constants";
import { isOnline } from "@/utils/network";

export interface VersionInfo {
  latestVersion: string;
  notes?: string;
}

const VERSION_JSON_URL = "https://hawtrix.tg/version.json";

export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const pa = a.split(".").map(n => parseInt(n, 10) || 0);
  const pb = b.split(".").map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}

export function getAppVersion(): string {
  return Constants?.expoConfig?.version ?? "2.89.3";
}

export async function fetchVersionInfo(): Promise<VersionInfo | null> {
  try {
    if (!(await isOnline())) return null;
    const res = await fetch(`${VERSION_JSON_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<VersionInfo> & { minVersion?: string };
    const latestVersion = data.latestVersion ?? data.minVersion;
    if (!latestVersion) return null;
    return { latestVersion, notes: data.notes };
  } catch {
    return null;
  }
}

export async function checkUpdateAvailable(): Promise<{ available: boolean; latestVersion?: string; notes?: string }> {
  const info = await fetchVersionInfo();
  if (!info) return { available: false };
  return {
    available: compareVersions(getAppVersion(), info.latestVersion) < 0,
    latestVersion: info.latestVersion,
    notes: info.notes,
  };
}

// Compatibilité avec d'anciens appels éventuels : aucune ancienne APK ne sera bloquée.
export async function checkUpdateRequired(): Promise<{ required: false }> {
  return { required: false };
}

export const VERSION_JSON_URL_PUBLIC = VERSION_JSON_URL;
export const APP_UPDATE_POLICY = "inform-only" as const;
export const DIRECT_APK_DOWNLOAD_DISABLED = true as const;
