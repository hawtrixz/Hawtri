# Hawtrix 2.86.0

Cette version est basée sur la version 1 originale : l'interface, la navigation, les écrans, les grades et toutes les fonctionnalités existantes sont conservés. Les modifications portent sur le passage de l'application en **mode strictement en ligne** et sur le remplacement des contenus simulés par de **vraies ressources externes officielles**.

## Strictement en ligne

Sans connexion Internet, l'utilisateur ne peut plus accéder aux formations, aux opportunités ni valider son compte. Un contrôle réseau (`utils/network.ts`) vérifie à la fois l'état natif du réseau (`expo-network`, `isConnectedAsync`) et une réponse HTTP réelle (`generate_204`) pour écarter les réseaux sans sortie réelle. Le composant `OfflineGate` affiche un écran de blocage avec bouton « Réessayer » sur tous les écrans sensibles, et `payment.tsx` exige aussi Internet pour la validation du code d'activation.

## Suppression des contenus simulés

| Élément simulé (2.85.3) | Remplacement (2.86.0) |
|---|---|
| Code d'activation — validation hors ligne possible | La formule d'activation est conservée (`code = somme des 8 derniers chiffres du numéro × 777 + 123456`) mais la validation exige désormais une connexion Internet : sans Internet, aucun code n'est accepté |
| Code OTP codé en dur / vérification locale | Écran `verify.tsx` protégé : ouverture de la page officielle de vérification (`WebBrowser`), validation `POST /api/verify` côté serveur |
| Leçons et contenus de cours générés localement | Chaque formation pointe vers sa plateforme officielle réelle (`data/trainings.ts`, 12 cours) et le bouton « Suivre le cours » ouvre le site officiel |
| Opportunités fictives (dates périmées, sans lien) | 12 offres officielles datées et vérifiables Togo/Afrique (`data/opportunities.ts`) avec lien officiel, édition vérifiée et procédure de candidature |
| `api.ts` fallback local | `api.ts` refuse toute requête sans Internet et lève une erreur explicite sans backend |

## Formations réelles (liens officiels)

Google Ateliers Numériques (certification gratuite), Google Career Certificates, OpenClassrooms, Microsoft Learn (IA/Azure/Power BI), Meta Blueprint, Coursera (audit gratuit), FAO e-learning Academy (certificat gratuit), Campus France, Open Learning Campus de la Banque mondiale, TEFConnect (Tony Elumelu Foundation), UNITAR (ONU) et Microsoft Support & Training (Excel/Office).

## Opportunités Togo/Afrique datées et vérifiables (août 2026)

Bourses France Excellence doctorat 2026-2027 (deadline 24/05/2026, Ambassade de France au Togo), Humphrey Fellowship 2027-2028 (deadline 03/07/2026, Ambassade des USA au Togo), bourses CSC Chine, Türkiye Burslari, Mastercard Foundation Scholars, renouvellement des bourses d'État togolaises (DBS/MESRS), stages subventionnés de la Délégation de l'UE au Togo, concours nationaux de la fonction publique togolaise, TEF Entrepreneurship Programme 2026 (5 000 USD, 01/01–01/03), Programme SAIS GIZ/VC4A 2026 (deadline 28/09), Emploi.tg et Biashara Afrika 2026 (Lomé). Chaque fiche affiche son édition vérifiée et ouvre le site officiel de l'organisme via « Voir l'offre officielle ».

## Configuration à prévoir côté serveur

La validation du code d'activation se fait localement par la formule officielle, mais uniquement en ligne (`isOnline()`). Aucune variable d'environnement n'est plus nécessaire pour le paiement.

## Versioing

Le manifeste est en version `2.86.0` avec `versionCode` Android `28600`. La dépendance `expo-network@~56.0.5` (compatible Expo SDK 54) a été ajoutée. Le type-check TypeScript est requis avant toute publication GitHub.

## Paiement

Les coordonnées TMoney/Mixx (+228 91 01 56 82) et Flooz (+228 97 07 60 40) sont conservées. Le client effectue un transfert manuel de 2 000 FCFA, puis le propriétaire vérifie le dépôt et envoie manuellement par WhatsApp, sur le numéro ayant effectué le dépôt, le code calculé par la formule `(somme des 8 derniers chiffres du numéro) × 777 + 123456`. Le support WhatsApp reste actif : https://wa.me/message/ITZ45LLE2RKSM1. La validation du code exige une connexion Internet ; sans Internet, aucun code n'est accepté.
