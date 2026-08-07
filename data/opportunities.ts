// data/opportunities.ts
//
// Hawtrix 2.86 — Opportunités OFFICIELLES Togo / Afrique
// Chaque opportunité est datée, vérifiable et reliée à son lien
// officiel. Les dates limites correspondent aux éditions 2026
// publiées par les organismes (annuelles quand applicable).
// L'écran détail ouvre le site officiel via "Voir l'offre officielle".

export type OpportunityType = "Emploi" | "Stage" | "Bourse" | "Concours" | "Projet" | "Financement" | "Appel d'offres" | "Événement";

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  org: string;
  country: string;
  /** Date limite de l'édition actuelle, ou "Annuel — candidature ouverte" */
  deadline: string;
  description: string;
  requirements: string;
  /** Lien officiel de l'annonce ou de la candidature */
  url: string;
  /** Où postuler / s'informer (canal officiel) */
  applyInfo: string;
  image: string;
  color: string;
  /** Année/édition vérifiée */
  edition: string;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    type: "Bourse",
    title: "Bourses France Excellence — Mobilité doctorale 2026-2027",
    org: "Ambassade de France au Togo (SCAC)",
    country: "Togo → France",
    deadline: "24 mai 2026",
    description: "Le Service de Coopération et d'Action Culturelle de l'Ambassade de France au Togo accompagne les étudiants togolais en formation doctorale souhaitant une mobilité dans un établissement supérieur français (appel à candidature édition 2026-2027).",
    requirements: "Être étudiant togolais inscrit en doctorat. Postuler via le formulaire officiel de candidature 2026-2027 (PDF sur la page de l'Ambassade).",
    url: "https://tg.diplomatie.gouv.fr/poursuivez-vos-etudes-superieures-2026-2027-en-france-grace-aux-bourses-france-excellence",
    applyInfo: "Formulaire de demande de bourse 2026-2027 téléchargeable sur la page officielle de l'Ambassade de France au Togo.",
    image: "school",
    color: "#1D4ED8",
    edition: "2026-2027 (vérifié 08/2026)",
  },
  {
    id: "opp-2",
    type: "Bourse",
    title: "Hubert H. Humphrey Fellowship 2027-2028",
    org: "Ambassade des États-Unis au Togo (Fulbright)",
    country: "Togo → États-Unis",
    deadline: "3 juillet 2026",
    description: "Fellowship d'un an aux États-Unis pour professionnels togolais en milieu de carrière : leadership, réseaux professionnels et développement académique. Domaines : journalisme, droit et gouvernance, ressources naturelles, politiques publiques et économiques, santé publique.",
    requirements: "Nationalité et résidence togolaise, passeport valide, au moins une licence (bac+4), 5 ans minimum d'expérience professionnelle, score TOEFL/Duolingo/IELTS ≥ 72/100/6.0.",
    url: "https://tg.usembassy.gov/scholarship-opportunities/",
    applyInfo: "Postuler en ligne via https://apply.iie.org/huberthhumphrey — l'annonce officielle et les PDF du programme sont sur le site de l'Ambassade des USA au Togo.",
    image: "flag",
    color: "#0F52BA",
    edition: "2027-2028 (vérifié 08/2026)",
  },
  {
    id: "opp-3",
    type: "Bourse",
    title: "Bourses du Gouvernement Chinois (CSC)",
    org: "China Scholarship Council",
    country: "Togo/Afrique → Chine",
    deadline: "Janvier à avril (annuel)",
    description: "Environ 30 000 bourses complètes par an (frais de scolarité, logement, allocation mensuelle, assurance) pour Licence, Master et Doctorat, toutes disciplines, ouvertes aux étudiants de tous les pays africains via le CSC et les universités chinoises.",
    requirements: "Être inscrit ou admis dans une université chinoise partenaire (bilateral program) ou postuler en autonomie (self-application) selon la procédure CSC en ligne.",
    url: "https://www.csc.edu.cn/studyinchina",
    applyInfo: "Créer un compte et postuler sur la plateforme officielle du CSC (campuschina.org). Vérifiez chaque année les dates sur le site.",
    image: "school",
    color: "#DC2626",
    edition: "Cycle annuel 2026-2027 (vérifié 08/2026)",
  },
  {
    id: "opp-4",
    type: "Bourse",
    title: "Türkiye Burslari — Bourses du Gouvernement Turc",
    org: "Türkiye Scholarships (gouvernement de Türkiye)",
    country: "Afrique → Türkiye",
    deadline: "Janvier à février (annuel)",
    description: "Bourse complète du gouvernement turc : placement universitaire, frais de scolarité, logement, allocation mensuelle et assurance pour Licence, Master et Doctorat. Candidature 100 % en ligne et gratuite.",
    requirements: "Être de nationalité non turque, répondre aux critères académiques par niveau (moyenne minimale de 70 % pour Licence, 75 % Master, 90 % Doctorat).",
    url: "https://www.turkiyeburslari.gov.tr/",
    applyInfo: "Portail de candidature officiel : turkiyeburslari.gov.tr. Une seule candidature suffit pour toutes les universités.",
    image: "school",
    color: "#B91C1C",
    edition: "Cycle annuel 2026-2027 (vérifié 08/2026)",
  },
  {
    id: "opp-5",
    type: "Bourse",
    title: "Mastercard Foundation Scholars Program",
    org: "Mastercard Foundation",
    country: "Afrique → universités partenaires",
    deadline: "Via les universités partenaires (octobre, annuel)",
    description: "Bourses complètes pour étudiants africains brillants issus de familles à faibles revenus : Licence et Master dans des universités partenaires (Université de Cambridge, UC Berkeley, Arizona State, University of Botswana, University of Lagos, etc.).",
    requirements: "Être d'origine africaine, méritant académiquement et financièrement défavorisé ; postuler directement auprès d'une université partenaire du programme.",
    url: "https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/",
    applyInfo: "Voir la liste des universités partenaires et leurs délais sur mastercardfdn.org (page Where to apply).",
    image: "school",
    color: "#B8860B",
    edition: "2026-2027 (vérifié 08/2026)",
  },
  {
    id: "opp-6",
    type: "Bourse",
    title: "Renouvellement des bourses d'État — Direction des Bourses et Stages",
    org: "Ministère de l'Enseignement Supérieur (Togo)",
    country: "Togo",
    deadline: "Octobre (annuel, édition précédente : 17 oct. 2025)",
    description: "Les étudiants togolais boursiers de l'étranger (boursiers du gouvernement et de la coopération) doivent soumettre chaque année leur dossier de renouvellement en ligne auprès de la Direction des Bourses et Stages (DBS).",
    requirements: "Être boursier de l'État togolais à l'étranger, éligible au renouvellement ; soumission en ligne avant la date limite de l'édition en cours.",
    url: "https://edusup.gouv.tg/",
    applyInfo: "Annonce officielle : republiquetogolaise.tg — Portail du MESRS : edusup.gouv.tg. Suivez aussi @MESR_Tg sur X (Twitter).",
    image: "ribbon",
    color: "#7C3AED",
    edition: "Édition annuelle (renouvellement 2025-2026 vérifié 08/2026)",
  },
  {
    id: "opp-7",
    type: "Stage",
    title: "Stages subventionnés — Délégation de l'UE au Togo",
    org: "Délégation de l'Union européenne au Togo",
    country: "Togo (Lomé)",
    deadline: "Mars (édition 2026 : 27 mars 2026)",
    description: "Stages subventionnés de 6 mois maximum pour jeunes diplômés au sein de la Délégation de l'UE au Togo (politique, presse et information). Subvention mensuelle de subsistance. Édition annuelle : consultez la liste des postes vacants pour la prochaine édition.",
    requirements: "BAC+3 en sciences politiques, journalisme/communication, économie ou droit ; résider au Togo ; moins d'un an d'expérience ; CV Europass + lettre de motivation.",
    url: "https://www.eeas.europa.eu/eeas/postes-vacants_fr?f%5B0%5D=vacancy_site%3ATogo",
    applyInfo: "Envoyer CV Europass, lettre de motivation et formulaire officiel à DELEGATION-TOGO-JOB-APPLICATIONS@eeas.europa.eu.",
    image: "school",
    color: "#1D4ED8",
    edition: "2026 (vérifié 08/2026)",
  },
  {
    id: "opp-8",
    type: "Concours",
    title: "Concours nationaux de la fonction publique togolaise",
    org: "Ministère de la Fonction Publique, du Travail et du Dialogue social",
    country: "Togo",
    deadline: "Sessions annuelles (ex. : élèves-professeurs 2026-2028, 400 postes)",
    description: "Le ministère publie régulièrement les concours nationaux de recrutement (enseignants, administration, finances, sécurité). L'édition 2026-2028 du concours d'élèves-professeurs ouvre 400 postes. Les avis officiels et résultats sont publiés sur le portail du ministère.",
    requirements: "Nationalité togolaise, âge et diplômes selon chaque concours ; suivre les avis sur fonctionpublique.gouv.tg et Togo Officiel.",
    url: "https://fonctionpublique.gouv.tg/",
    applyInfo: "Avis officiels sur fonctionpublique.gouv.tg ; infos complémentaires sur republiquetogolaise.tg.",
    image: "trophy",
    color: "#F59E0B",
    edition: "2026 (vérifié 08/2026)",
  },
  {
    id: "opp-9",
    type: "Financement",
    title: "Tony Elumelu Foundation (TEF) Entrepreneurship Programme 2026",
    org: "Tony Elumelu Foundation",
    country: "Togo / 54 pays africains",
    deadline: "1er janvier — 1er mars (annuel)",
    description: "Programme panafricain d'entrepreneuriat : formation de 12 semaines, mentorat et capital d'amorçage de 5 000 USD non remboursable pour les lauréats. Ouvert aux entrepreneurs des 54 pays africains. Plus de 24 000 entrepreneurs financés depuis 2015.",
    requirements: "Être fondateur d'une entreprise (ou porteur d'idée) en Afrique ; postuler gratuitement en ligne sur TEFConnect entre le 1er janvier et le 1er mars.",
    url: "https://www.tonyelumelufoundation.org/press-releases/apply-tef-entrepreneurship-programme-2026",
    applyInfo: "Candidature 100 % en ligne et gratuite : https://tefconnect.com/",
    image: "cash",
    color: "#059669",
    edition: "2026 (vérifié 08/2026)",
  },
  {
    id: "opp-10",
    type: "Financement",
    title: "Programme SAIS de préparation à l'investissement 2026 (GIZ/VC4A)",
    org: "GIZ + VC4A",
    country: "Afrique (hors Afrique du Sud)",
    deadline: "28 septembre (annuel)",
    description: "Accélérateur gratuit d'un an pour start-ups numériques africaines à impact agricole (agritech, climat, élevage, fintech, logistique). Jusqu'à 20 000 € d'assistance technique et accès à un crédit allant jusqu'à 50 000 € à 1,5 % d'intérêt.",
    requirements: "Start-up numérique africaine (immatriculée hors Afrique du Sud) avec impact dans l'agriculture ou secteurs connexes ; candidature en français ou en anglais.",
    url: "https://vc4a.com/giz-sais/2026/?lang=fr",
    applyInfo: "Candidater en ligne sur la page officielle du programme (lien ci-dessus) avant le 28 septembre.",
    image: "trending-up",
    color: "#16A34A",
    edition: "2026 (vérifié 08/2026)",
  },
  {
    id: "opp-11",
    type: "Emploi",
    title: "Offres d'emploi et de recrutement au Togo",
    org: "Emploi.tg + Portail de l'État",
    country: "Togo",
    deadline: "Offres continues",
    description: "Plateforme togolaise de référence qui regroupe les offres d'emploi des entreprises privées et les recrutements de la fonction publique au Togo. Déposez votre CV et postulez aux offres publiées.",
    requirements: "Profil conforme à chaque offre ; inscription gratuite sur Emploi.tg.",
    url: "https://www.emploi.tg/recrutement-fonction-publique",
    applyInfo: "Créer un compte et déposer son CV sur emploi.tg ; vérifier aussi republiquetogolaise.tg.",
    image: "briefcase",
    color: "#10B981",
    edition: "Plateforme active (vérifié 08/2026)",
  },
  {
    id: "opp-12",
    type: "Événement",
    title: "Biashara Afrika 2026 — Lomé",
    org: "Biashara Afrika / partenaires africains",
    country: "Togo (Lomé)",
    deadline: "Gratuit — inscription en ligne",
    description: "Forum panafricain des affaires qui réunit entrepreneurs, investisseurs et institutions de 12+ pays africains : panels, networking, ateliers pratiques et expo-stands à Lomé.",
    requirements: "Inscription gratuite en ligne ; priorité aux entrepreneurs et porteurs de projets africains.",
    url: "https://www.biasharaafrica.com/",
    applyInfo: "Suivre les prochaines éditions et l'inscription sur biasharaafrica.com.",
    image: "people",
    color: "#7C3AED",
    edition: "Édition 2026 (vérifié 08/2026)",
  },
];

/** Sources officielles permanentes pour vérifier les actualisations */
export const OFFICIAL_SOURCES = [
  { label: "Portail officiel de la République Togolaise", url: "https://www.republiquetogolaise.tg/" },
  { label: "Ambassade de France au Togo", url: "https://tg.diplomatie.gouv.fr/" },
  { label: "Ambassade des États-Unis au Togo", url: "https://tg.usembassy.gov/scholarship-opportunities/" },
  { label: "Ministère Enseignement Supérieur (Togo)", url: "https://edusup.gouv.tg/" },
  { label: "Délégation de l'UE au Togo", url: "https://www.eeas.europa.eu/delegations/togo_fr?s=125" },
];

export const TYPES: OpportunityType[] = ["Emploi", "Stage", "Bourse", "Concours", "Projet", "Financement", "Appel d'offres", "Événement"];

export const TYPE_META: Record<string, { icon: string; color: string }> = {
  "Emploi": { icon: "briefcase", color: "#10B981" },
  "Stage": { icon: "school", color: "#FF6B00" },
  "Bourse": { icon: "ribbon", color: "#8B5CF6" },
  "Concours": { icon: "trophy", color: "#F59E0B" },
  "Projet": { icon: "flash", color: "#EF4444" },
  "Financement": { icon: "cash", color: "#059669" },
  "Appel d'offres": { icon: "document-text", color: "#0F52BA" },
  "Événement": { icon: "calendar", color: "#7C3AED" },
};
