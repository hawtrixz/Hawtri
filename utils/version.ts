// utils/version.ts
//
// Hawtrix 2.87 — contrôle de version & mise à jour forcée de l'APK
// ---------------------------------------------------------------
// - À chaque lancement, l'app interroge https://hawtrix.tg/version.json
//   qui retourne { minVersion: "2.87.0", apkUrl: "https://hawtrix.tg/hawtrix.apk" }.
// - Si la version installée est inférieure à minVersion, l'app est
//   bloquée et redirigée vers /update pour télécharger la nouvelle APK
//   directement depuis l'application. Les anciennes APK cessent ainsi
//   de fonctionner dès qu'une version plus récente est publiée.
// - En cas d'échec réseau, l'utilisateur peut continuer (pas de blocage
//   injustifié), mais une notification l'invite à mettre à jour.
//
// Déploiement: le fichier version.json et l'APK doivent être déposés sur
// le serveur https://hawtrix.tg (le workflow GitHub Actions .github/
// workflows/build-apk.yml peut être étendu pour le faire automatiquement).

import Constants from "expo-constants";
import { isOnline } from "@/utils/network";

export interface VersionInfo {
  minVersion: string;
  apkUrl: string;
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
  return Constants?.expoConfig?.version ?? "2.87.0";
}

export async function fetchVersionInfo(): Promise<VersionInfo | null> {
  try {
    if (!(await isOnline())) return null;
    const res = await fetch(`${VERSION_JSON_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as VersionInfo;
    if (!data.minVersion || !data.apkUrl) return null;
    return data;
  } catch {
    return null;
  }
}

export async function checkUpdateRequired(): Promise<{ required: boolean; apkUrl?: string }> {
  const info = await fetchVersionInfo();
  if (!info) return { required: false };
  const installed = getAppVersion();
  return {
    required: compareVersions(installed, info.minVersion) < 0,
    apkUrl: info.apkUrl,
  };
}
