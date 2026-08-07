// data/trainings.ts
//
// Hawtrix 2.86 — Formations RÉELLES uniquement
// Chaque formation pointe vers une ressource externe officielle,
// gratuite (ou gratuite en audit) et toujours accessible en ligne.
// La consommation du cours se fait sur le site officiel via le
// bouton "Suivre le cours", qui ouvre le lien en navigateur.

export interface Training {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  color: string;
  icon: string;
  instructor: string;
  description: string;
  modules: string[];
  /** Lien officiel vers le cours (plateforme réelle) */
  url: string;
  /** Nom de la plateforme officielle qui délivre le cours */
  platform: string;
  /** Le certificat est-il gratuit sur la plateforme ? */
  freeCertificate: boolean;
}

export const TRAININGS: Training[] = [
  {
    id: "1",
    title: "Fondamentaux du Marketing Digital (Google)",
    category: "Marketing",
    level: "Débutant",
    duration: "40h",
    color: "#10B981",
    icon: "megaphone",
    instructor: "Google Ateliers Numériques",
    description: "Certification officielle Google gratuite : principes du marketing numérique, SEO, publicité en ligne, e-commerce, réseaux sociaux. Reconnue par Interactive Advertising Bureau Europe et The Open University.",
    modules: ["Principes du marketing en ligne", "Présence en ligne", "SEO et publicités de recherche", "Publicité display et mobile", "Mesure et analyse", "Commerce en ligne"],
    url: "https://grow.google/intl/ssa-fr/courses-and-tools/",
    platform: "Google Ateliers Numériques",
    freeCertificate: true,
  },
  {
    id: "2",
    title: "Certificats de Carrière Google (Data, Gestion de projet, Support IT)",
    category: "Informatique",
    level: "Débutant",
    duration: "3-6 mois",
    color: "#3B82F6",
    icon: "code-slash",
    instructor: "Google Career Certificates",
    description: "Certificats professionnels Google reconnus par des employeurs du monde entier : Analyse de données, Gestion de projet, Support informatique, UX Design, Automatisez vos tâches avec Python. Bourses disponibles pour l'Afrique.",
    modules: ["Analyse de données avec Google", "Gestion de projet", "Support informatique (IT)", "UX Design", "Automatisation Python", "Marketing digital"],
    url: "https://grow.google/intl/ssa-fr/google-career-certificates/",
    platform: "Grow with Google Afrique",
    freeCertificate: true,
  },
  {
    id: "3",
    title: "Développement Web & Python (OpenClassrooms)",
    category: "Informatique",
    level: "Intermédiaire",
    duration: "À votre rythme",
    color: "#7C3AED",
    icon: "laptop",
    instructor: "OpenClassrooms",
    description: "OpenClassrooms propose plus de 600 cours en accès libre et gratuit : Python, HTML/CSS, JavaScript, bases de données, Git. Cours en libre accès immédiatement, sans inscription payante.",
    modules: ["Apprenez les bases du langage Python", "Maîtrisez les fondamentaux d'Excel", "Intégrez JavaScript dans un site web", "Découvrez le langage SQL", "Gérez votre code avec Git et GitHub"],
    url: "https://openclassrooms.com/",
    platform: "OpenClassrooms",
    freeCertificate: false,
  },
  {
    id: "4",
    title: "Microsoft Learn — IA, Cloud & Productivité",
    category: "Informatique",
    level: "Débutant",
    duration: "À votre rythme",
    color: "#0F52BA",
    icon: "school",
    instructor: "Microsoft Learn",
    description: "Formations officielles gratuites Microsoft : Intelligence artificielle générative (IA-2000), Azure Cloud, Power BI, Microsoft 365, développement. Parcours en français avec badges officiels.",
    modules: ["IA générative (Get started with AI-900/2000)", "Azure Fundamentals (AZ-900)", "Power BI pour la data", "Microsoft 365 Fundamentals", "Python pour débutants"],
    url: "https://learn.microsoft.com/fr-fr/training/",
    platform: "Microsoft Learn",
    freeCertificate: true,
  },
  {
    id: "5",
    title: "Meta Blueprint — Marketing des Réseaux Sociaux",
    category: "Marketing",
    level: "Débutant",
    duration: "À votre rythme",
    color: "#059669",
    icon: "logo-facebook",
    instructor: "Meta",
    description: "Formations officielles Meta pour maîtriser la publicité et la gestion des pages Facebook et Instagram. Des parcours gratuits aux certifications professionnelles payantes, accessibles depuis l'Afrique.",
    modules: ["Facebook Business Suite", "Instagram pour les entreprises", "Publicité Meta Ads", "Communauté et engagement", "Commerce sur Facebook"],
    url: "https://www.facebook.com/business/learn",
    platform: "Meta Blueprint",
    freeCertificate: false,
  },
  {
    id: "6",
    title: "Cours gratuits avec certificat (Coursera)",
    category: "Informatique",
    level: "Intermédiaire",
    duration: "À votre rythme",
    color: "#EC4899",
    icon: "globe",
    instructor: "Coursera",
    description: "Catalogue de milliers de cours gratuits en « mode audit » (écoute libre) : informatique, business, data, langues. Aide financière disponible pour obtenir le certificat gratuitement.",
    modules: ["Cours d'informatique en audit gratuit", "Data Science (Johns Hopkins, IBM)", "Business & entrepreneuriat", "Langues et communication", "Aide financière Coursera"],
    url: "https://www.coursera.org/courses?query=free",
    platform: "Coursera",
    freeCertificate: false,
  },
  {
    id: "7",
    title: "Agriculture & Alimentation Durable (FAO e-learning)",
    category: "Agriculture",
    level: "Débutant",
    duration: "À votre rythme",
    color: "#65A30D",
    icon: "leaf",
    instructor: "FAO — Organisation des Nations Unies",
    description: "Académie e-learning gratuite de la FAO : agriculture durable, sécurité alimentaire, foresterie, pêche, changement climatique. Cours certifiants gratuits en français, reconnus internationalement.",
    modules: ["Sécurité alimentaire et nutrition", "Agriculture durable et sols", "Ressources génétiques et biodiversité", "Climat et agriculture", "Foresterie et pêche"],
    url: "https://www.fao.org/e-learning/fr/",
    platform: "FAO e-learning Academy",
    freeCertificate: true,
  },
  {
    id: "8",
    title: "Études en France — Campus France",
    category: "Études supérieures",
    level: "Licence/Master",
    duration: "Procédure annuelle",
    color: "#1D4ED8",
    icon: "airplane",
    instructor: "Campus France",
    description: "Portail officiel pour étudier en France : recherche de formations, bourses France Excellence (Ambassade de France au Togo), procédure Études en France. Ressources gratuites de préparation aux démarches.",
    modules: ["Trouver sa formation en France", "Bourses France Excellence", "Procédure Études en France", "Préparer son dossier", "Vivre en France"],
    url: "https://www.campusfrance.org/fr",
    platform: "Campus France",
    freeCertificate: false,
  },
  {
    id: "9",
    title: "Finance & Gestion — Banque Mondiale Open Learning",
    category: "Finance",
    level: "Intermédiaire",
    duration: "À votre rythme",
    color: "#F59E0B",
    icon: "trending-up",
    instructor: "Open Learning Campus (Banque mondiale)",
    description: "Formations gratuites de la Banque mondiale : développement, finance publique, entrepreneuriat, climat. Certificats de complétion gratuits délivrés en ligne.",
    modules: ["Finances publiques et fiscalité", "Développement entrepreneurial", "Économie et croissance", "Climat et développement", "Gouvernance"],
    url: "https://olc.worldbank.org/fr",
    platform: "Open Learning Campus",
    freeCertificate: true,
  },
  {
    id: "10",
    title: "Entrepreneuriat — Tony Elumelu Foundation",
    category: "Business",
    level: "Débutant",
    duration: "12 semaines",
    color: "#FF6B00",
    icon: "rocket",
    instructor: "Tony Elumelu Foundation (TEF)",
    description: "Programme panafricain d'entrepreneuriat : formation de 12 semaines en ligne sur TEFConnect (business plan, finance, marketing), mentorat et capital d'amorçage de 5 000 USD pour les lauréats. Candidature annuelle du 1er janvier au 1er mars.",
    modules: ["Idéation et plan d'affaires", "Finance et comptabilité de base", "Marketing et ventes", "Stratégie opérationnelle", "Pitch et mentorat"],
    url: "https://tefconnect.com/",
    platform: "TEFConnect (Tony Elumelu Foundation)",
    freeCertificate: true,
  },
  {
    id: "11",
    title: "Formations en ligne des Nations Unies (UNITAR/UN)",
    category: "Développement",
    level: "Intermédiaire",
    duration: "À votre rythme",
    color: "#8B5CF6",
    icon: "earth",
    instructor: "UNITAR / Nations Unies",
    description: "Plateforme officielle des Nations Unies : diplomacy, paix, développement durable, leadership, ODD. Cours gratuits en français avec attestation de complétion.",
    modules: ["Objectifs de développement durable", "Diplomatie et négociation", "Leadership et gestion", "Paix et sécurité", "Changement climatique"],
    url: "https://unitar.org/",
    platform: "UNITAR (ONU)",
    freeCertificate: true,
  },
  {
    id: "12",
    title: "Excel & Bureautique (Microsoft / LinkedIn Learning)",
    category: "Finance",
    level: "Débutant",
    duration: "À votre rythme",
    color: "#16A34A",
    icon: "calculator",
    instructor: "Microsoft 365 Training Center",
    description: "Formations officielles et gratuites sur Excel, Word, PowerPoint : tableaux croisés, formules, automatisations. Certificats de complétion gratuits délivrés par Microsoft.",
    modules: ["Excel : les fondamentaux", "Formules et fonctions Excel", "Tableaux croisés dynamiques", "PowerPoint professionnel", "Word : mise en forme"],
    url: "https://support.microsoft.com/fr-fr/training",
    platform: "Microsoft Support & Training",
    freeCertificate: true,
  },
];

export const CATEGORIES = ["Tous", "Marketing", "Informatique", "Agriculture", "Finance", "Business", "Études supérieures", "Développement"];

export const LEVEL_COLORS: Record<string, string> = {
  Débutant: "#10B981",
  Intermédiaire: "#F59E0B",
  Avancé: "#EF4444",
  "Licence/Master": "#1D4ED8",
};
