# Hawtrix v2.87.0 — Notes de version

## Nouveautés

### Profil totalement disponible
Le profil a été nettoyé : toutes les entrées autrefois marquées « non disponible » ou « prochainement » sont maintenant fonctionnelles. Le menu propose désormais **Modifier le profil**, **Retirer mes gains**, **Mon réseau & parrainage**, **Notifications**, **Sécurité du compte**, **IA Hawtrix (Support)**, **Contacter sur WhatsApp** et **À propos de Hawtrix**.

### Carte membre officielle
La carte membre est affichée dès que l'utilisateur atteint le grade **Pionier**. Tant que le membre n'est pas Pionier, un encart explique que la carte se débloque à ce grade.

### Conditions du niveau suivant (uniquement au profil)
La liste des grades du réseau ne mentionne plus les conditions chiffrées (nombre de filleuls requis, pourcentages). Le profil reste le seul endroit qui affiche l'objectif vers le grade suivant, avec la progression en cours.

### Contact & Support : IA Hawtrix + WhatsApp
La section Contact & Support regroupe désormais l'**IA Hawtrix** (le conseiller virtuel intégré) et un bouton dédié qui ouvre une conversation **WhatsApp** avec le support, avec un message pré-rempli contenant le nom et le code de référence du membre.

### À propos de Hawtrix
Un écran dédié présente le projet : conçu par un groupe d'entrepreneurs sous l'impulsion du **DG Haweil** et de ses collaborateurs, Hawtrix permet à chacun de trouver des opportunités, de se bâtir un réseau local de clientèle, de générer des revenus, et — pour ceux qui le souhaitent vraiment — de s'immerger totalement, de réussir dans la vie et de se faire un nom, un titre. L'écran se conclut par un message de motivation et un souhait de bonne chance à toutes et à tous.

### Identification à double facteur (mot de passe personnel)
Après son inscription, chaque utilisateur est invité à définir un mot de passe personnel (facultatif : il peut choisir de ne pas en mettre). Ce mot de passe :
- est demandé **à chaque connexion sur un nouveau téléphone** ;
- est demandé **à chaque demande de retrait de gains** ;
- est mentionné avec la phrase « **Compte irrécupérable si mot de passe oublié** », car il n'est stocké que sur l'appareil et Hawtrix ne peut ni le récupérer ni le réinitialiser.

L'utilisateur peut changer ou supprimer son mot de passe à tout moment depuis **Profil → Sécurité du compte**.

### Mise à jour automatique de l'APK
Un contrôle de version s'exécute à chaque lancement. Dès qu'une nouvelle version est publiée sur le serveur `https://hawtrix.tg/version.json`, **les APK précédentes cessent de fonctionner** et affichent un écran de blocage « Mise à jour requise » proposant le **téléchargement direct du fichier APK** depuis l'application.

**Configuration serveur requise :**
| Fichier | URL | Contenu |
|---|---|---|
| `version.json` | `https://hawtrix.tg/version.json` | `{"minVersion": "2.87.0", "apkUrl": "https://hawtrix.tg/hawtrix.apk"}` |
| `hawtrix.apk` | `https://hawtrix.tg/hawtrix.apk` | Le fichier APK de la version en cours |

Pour bloquer les versions antérieures, il suffit de mettre à jour `minVersion` dans `version.json` et d'y déposer le nouvel APK. Si le fichier `version.json` est inaccessible (hors ligne), l'utilisateur peut continuer à utiliser l'application.

### Détail technique
| Élément | Valeur |
|---|---|
| Version | 2.87.0 (versionCode Android 28700) |
| Nouveaux écrans | `/security`, `/unlock`, `/about`, `/update` |
| Nouvelles dépendances | `expo-crypto` (hashage SHA-256 natif) |
| Supprimé | `@noble/hashes` (remplacé par expo-crypto) |

## Fichiers modifiés
`app.json`, `package.json`, `app/(tabs)/profile.tsx`, `app/(tabs)/explore.tsx`, `app/network/index.tsx`, `app/index.tsx`, `app/verify.tsx`, `app/withdraw.tsx`, `app/_layout.tsx`, `app/welcome.tsx`, `context/AppContext.tsx`

## Fichiers ajoutés
`app/security.tsx`, `app/unlock.tsx`, `app/about.tsx`, `app/update.tsx`, `utils/version.ts`, `utils/auth2fa.ts`
