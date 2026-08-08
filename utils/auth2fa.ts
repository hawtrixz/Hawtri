// utils/auth2fa.ts
//
// Hawtrix 2.87 — identification à double facteur (mot de passe personnel)
// -----------------------------------------------------------------------
// - Après l'inscription, l'utilisateur est invité à définir un mot de passe
//   personnel (facultatif, peut être ignoré).
// - Ce mot de passe est demandé :
//     • à chaque connexion sur un NOUVEAU téléphone (appareil non reconnu)
//     • à chaque demande de RETRAIT de gains
// - Le mot de passe est conservé uniquement sur l'appareil (AsyncStorage),
//   jamais transmis à un serveur. S'il est oublié, le compte est
//   IRRÉCUPÉRABLE : c'est le prix de la sécurité totale du compte.
// - La reconnaissance de l'appareil utilise un identifiant unique généré
//   à la première ouverture de l'app et conservé localement.

import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_DEVICE_ID = "hawtrix_device_id";
const KEY_PASS_HASH = "hawtrix_pass_hash";
const KEY_PASS_SET = "hawtrix_pass_set";

function genHex(len: number): string {
  const chars = "abcdef0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(KEY_DEVICE_ID);
  if (!id) {
    id = `${genHex(8)}-${genHex(4)}-${genHex(4)}-${genHex(4)}-${genHex(12)}`;
    await AsyncStorage.setItem(KEY_DEVICE_ID, id);
  }
  return id;
}

export async function hashPassword(password: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return hash;
}

/** Enregistre le mot de passe (hashé) pour ce compte, indépendamment des appareils. */
export async function setPassword(password: string): Promise<void> {
  const hash = await hashPassword(password);
  await AsyncStorage.setItem(KEY_PASS_HASH, hash);
  await AsyncStorage.setItem(KEY_PASS_SET, "1");
}

/** Supprime le mot de passe du compte (l'utilisateur renonce volontairement à la double authentification). */
export async function clearPassword(): Promise<void> {
  await AsyncStorage.multiRemove([KEY_PASS_HASH, KEY_PASS_SET]);
}

export async function hasPassword(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY_PASS_SET)) === "1";
}

export async function verifyPassword(password: string): Promise<boolean> {
  const stored = await AsyncStorage.getItem(KEY_PASS_HASH);
  if (!stored) return false;
  const hash = await hashPassword(password);
  return hash === stored;
}

/** Cet appareil a-t-il déjà prouvé le mot de passe ? */
export async function isDeviceTrusted(): Promise<boolean> {
  const deviceId = await getDeviceId();
  return (await AsyncStorage.getItem(`${KEY_PASS_HASH}_device_${deviceId}`)) === "1";
}

/** Marquer l'appareil actuel comme de confiance (après saisie correcte du mot de passe). */
export async function trustDevice(): Promise<void> {
  const deviceId = await getDeviceId();
  await AsyncStorage.setItem(`${KEY_PASS_HASH}_device_${deviceId}`, "1");
}

/**
 * Au logout on efface la session, mais PAS le mot de passe du compte
 * (KEY_PASS_HASH / KEY_PASS_SET sont conservés) : sur un téléphone
 * déjà connu, le mot de passe n'est plus redemandé. Sur un nouveau
 * téléphone (device non marqué), il sera demandé à la connexion suivante.
 */
export async function resetDeviceTrust(): Promise<void> {
  const deviceId = await getDeviceId();
  await AsyncStorage.removeItem(`${KEY_PASS_HASH}_device_${deviceId}`);
}
