import { healthgraphbench } from "./healthgraphbench";

export type Locale = "fr" | "en";

export type ProjectId =
  | "genomint"
  | "meddatatrace"
  | "sillage"
  | "nacre"
  | "encrypted-voting"
  | "justsyncit";
export type CaseStudyId =
  "genomint" | "meddatatrace" | "sillage" | "nacre" | "encrypted-voting";

export interface Project {
  id: ProjectId;
  title: string;
  description: string;
  technologies: string;
  url?: string;
  linkLabel?: string;
  status?: string;
}

export type JourneyPoint =
  "2023" | "2024" | "2025" | "2026-but" | "2026-master" | "2027" | "2028";

export interface JourneyEntry {
  kind: "education" | "experience";
  title: string;
  subtitle: string;
  period: string;
  start: JourneyPoint;
  end?: JourneyPoint;
  detail?: string;
  projectId?: ProjectId;
  logos?: string[];
}

export interface Skill {
  name: string;
  projectIds: ProjectId[];
}

export interface SkillGroup {
  label: string;
  description: string;
  items: Skill[];
}

export type SectionId =
  | "accueil"
  | "projects"
  | "open-source"
  | "journey"
  | "skills"
  | "personal"
  | "contact";

export interface NavigationSection {
  id: SectionId;
  label: string;
}

export interface PaginationEvidence {
  heading: string;
  intro: string;
  beforeLabel: string;
  beforeValue: string;
  afterLabel: string;
  afterValue: string;
  unit: string;
  notice: string;
}

export interface CaseStudySection {
  heading: string;
  paragraphs: string[];
  points?: { label: string; detail: string }[];
}

export interface CaseStudySource {
  label: string;
  href?: string;
  detail?: string;
}

export interface CaseStudyFigure {
  kind: "screenshot" | "diagram";
  title: string;
  alt: string;
  openLabel?: string;
  caption?: string;
  source: string;
  sourceHref?: string;
  src?: string;
  srcset?: string;
  width?: number;
  height?: number;
  nodes?: { title: string; detail: string }[];
  optional?: { title: string; detail: string };
}
export interface CaseStudyScreenshots {
  openLabel: string;
  items: {
    title: string;
    caption: string;
    alt: string;
    src: string;
    preview: string;
    width: number;
    height: number;
  }[];
}

export interface CaseStudy {
  title: string;
  question: string;
  kicker: string;
  summary: string;
  atGlance: { label: string; entries: { label: string; value: string }[] };
  technicalLabel: string;
  role?: string;
  roleLabel?: string;
  relatedProject?: { label: string; href: string };
  path: string;
  mediaLabel: string;
  figure: CaseStudyFigure;
  screenshots?: CaseStudyScreenshots;
  sections: CaseStudySection[];
  sources?: { label: string; entries: CaseStudySource[] };
  homeLabel: string;
  counterpartLabel: string;
  languageLabel: string;
  demonstration?: {
    heading: string;
    description: string;
    video?: { src: string; poster: string; captions: string; caption: string };
    output?: string;
    steps: { heading: string; description: string }[];
    transcript?: { label: string; text: string };
    download?: { label: string; href: string };
  };
  pagination?: PaginationEvidence;
}

export interface PortfolioContent {
  meta: {
    title: string;
    description: string;
  };
  skipLink: string;
  navigation: {
    primaryLabel: string;
    sections: Record<SectionId, NavigationSection>;
  };
  localeLabel: string;
  localeSwitch: {
    fr: string;
    en: string;
  };
  hero: {
    eyebrow: string;
    summaryTitle: string;
    title: string;
    headline: string;
    affiliation: string;
    description: string;
    availability: { label: string; detail: string; note: string };
    projectsCta: string;
    cvCta: string;
    contactCta: string;
  };
  projects: {
    heading: string;
    intro: string;
    otherHeading: string;
    entries: Project[];
  };
  openSource: {
    heading: string;
    intro: string;
    profileLink: { label: string; bannerLabel: string; url: string };
    security: {
      heading: string;
      intro: string;
      entries: {
        name: string;
        focus: string;
        role: string;
        description: string;
        detail: string;
        reference: string;
        link: { label: string; url: string };
      }[];
    };
    projects: {
      heading: string;
      entries: {
        name: string;
        url: string;
        role: string;
        description: string;
        zenodo?: { label: string; url: string };
        publication?: string;
      }[];
    };
    github: {
      eyebrow: string;
      pageTitle: string;
      homeLabel: string;
      calendar: {
        heading: string;
        totalLabel: string;
        lessLabel: string;
        moreLabel: string;
        daySingular: string;
        dayPlural: string;
        zeroDayLabel: string;
      };
    };
  };
  journey: {
    heading: string;
    detailLabel: string;
    labels: Record<"education" | "experience", string>;
    axis: { id: JourneyPoint; label: string; detail?: string }[];
    entries: JourneyEntry[];
    invitation: {
      title: string;
      description: string;
      linkLabel: string;
      start: JourneyPoint;
      end: JourneyPoint;
    };
  };
  skills: {
    heading: string;
    highlights: {
      name: string;
      description: string;
      projectIds: ProjectId[];
    }[];
    catalogMoreLabel: string;
    catalogCloseLabel: string;
    projectLabel: string;
    groups: SkillGroup[];
  };
  personal: {
    heading: string;
    intro: string;
    photoAlt: string;
    interests: { title: string; description: string }[];
  };
  contact: {
    heading?: string;
    email: string;
    emailCta?: string;
    copyEmail?: string;
    copiedEmail?: string;
    status?: string;
    location?: string;
    responseTime?: string;
    linkedin: string;
    linkedinDescription: string;
    github?: string;
    githubDescription?: string;
    cv: string;
    cvDescription: string;
    backToTop?: string;
    colophon?: string;
    legal?: string;
    moonAlt?: string;
  };
}

const contactEmail = "contact@alexisrob.in";

export const destinations = {
  email: `mailto:${contactEmail}`,
  linkedin: "https://www.linkedin.com/in/alexisr-dev",
  github: "https://github.com/carabistouflette",
  brio: "https://brio.build/",
  cv: "/cv/Alexis-Robin-CV-2026.pdf",
} as const;

export const portfolio: Record<Locale, PortfolioContent> = {
  fr: {
    meta: {
      title: "Alexis Robin — IA & systèmes de données",
      description:
        "Alexis Robin — IA, systèmes logiciels et cybersécurité en Rust. GenomInt au CIRAD, Sillage, recherche HealthGraphBench, découverte d’une faille Tokio et sécurité réseau de SteelMC.",
    },
    skipLink: "Aller au contenu principal",
    navigation: {
      primaryLabel: "Navigation principale",
      sections: {
        accueil: { id: "accueil", label: "Accueil" },
        projects: { id: "projects", label: "Projets" },
        skills: { id: "skills", label: "Compétences" },
        journey: { id: "journey", label: "Parcours" },
        "open-source": { id: "open-source", label: "Contributions" },
        personal: { id: "personal", label: "À propos" },
        contact: { id: "contact", label: "Contact" },
      },
    },
    localeLabel: "Choisir la langue",
    localeSwitch: {
      fr: "FR",
      en: "EN",
    },
    hero: {
      eyebrow: "IA & systèmes de données",
      summaryTitle: "Sous le nom de carabistouflette",
      title: "Alexis Robin",
      headline: "Des outils d’IA pour interroger les données scientifiques.",
      affiliation: "M1 à Centrale Lille · IA pour la santé · parcours MIAS",
      description:
        "Je développe des outils d’IA pour les données scientifiques. Je m’intéresse aussi à la cybersécurité en Rust.",
      availability: {
        label: "Recherche de stage",
        detail: "22 mars – 21 août 2027 · Montpellier ou Lille",
        note: "Alternance possible en M2 à partir de septembre 2027.",
      },
      projectsCta: "Voir mes projets",
      cvCta: "Télécharger le CV",
      contactCta: "Me contacter",
    },
    projects: {
      heading: "Mes projets",
      intro: "Agents IA, données scientifiques et logiciels natifs.",
      otherHeading: "Travaux complémentaires",
      entries: [
        {
          id: "genomint",
          title: "GenomInt",
          description:
            "Au CIRAD, j’ai développé l’agent IA et le backend de l’explorateur génomique : requêtes Neo4j, API et exports.",
          technologies:
            "Python · FastAPI · Pi · LangChain · Haystack · PostgreSQL · Neo4j · Docker · Linux",
          url: "/projets/genomint/",
          linkLabel: "Lire le dossier",
        },
        {
          id: "meddatatrace",
          title: "HealthGraphBench",
          description:
            "Je compare des modèles tabulaires et relationnels sur les données FDA MAUDE et CMS, avec une évaluation temporelle.",
          technologies: "Python · NumPy · Scikit-learn · Numba · Matplotlib",
          url: "/projets/meddatatrace/",
          linkLabel: "Lire le dossier",
          status: "Recherche en cours · résultats exploratoires.",
        },
        {
          id: "sillage",
          title: "Sillage",
          description:
            "Dans Brio, je contribue à Sillage : un lanceur Linux natif et un moteur de recherche dans les documents, utilisable séparément.",
          technologies: "Rust · Slint · Tantivy · SQLite",
          url: "/projets/sillage/",
          linkLabel: "Lire le dossier",
        },
        {
          id: "nacre",
          title: "Nacre",
          description:
            "Compilateur natif expérimental écrit en Rust, à la syntaxe proche de Java : C11 vers GCC ou Clang par défaut, avec un backend LLVM direct en option.",
          technologies: "Rust · C11 · LLVM · Linux",
          url: "/projets/nacre/",
          linkLabel: "Lire le dossier",
        },
        {
          id: "encrypted-voting",
          title: "Vote El Gamal",
          description:
            "Vote vérifiable sans révéler les choix : chiffrement El Gamal et preuves à connaissance zéro.",
          technologies: "Java · Spring · El Gamal",
          url: "/projets/encrypted-voting/",
          linkLabel: "Lire le dossier",
        },
        {
          id: "justsyncit",
          title: "JustSyncIt",
          description:
            "Outil Java de sauvegarde avec snapshots, sauvegardes incrémentales, déduplication par contenu et transferts distants.",
          technologies: "Java · SQLite · Jackson · Kwik · Bouncy Castle",
          url: "https://github.com/carabistouflette/JustSyncIt/",
          linkLabel: "Voir le dépôt GitHub",
        },
      ],
    },
    openSource: {
      heading: "Open source & cybersécurité.",
      intro:
        "Des changements proposés, discutés et intégrés. Ici, on peut suivre les projets, remonter au code et parcourir l’activité affichée sur",
      profileLink: {
        label: "mon profil GitHub.",
        bannerLabel: "Mon profil GitHub",
        url: "https://github.com/carabistouflette",
      },
      security: {
        heading: "Cybersécurité & Rust",
        intro:
          "Comprendre les défaillances et rendre les logiciels plus robustes : un intérêt que je concrétise par la recherche de vulnérabilités et le durcissement réseau dans l’écosystème Rust.",
        entries: [
          {
            name: "Tokio",
            focus: "Sécurité mémoire",
            role: "Découverte & signalement responsable",
            description:
              "J’ai découvert et signalé en privé une condition de concurrence dans les intervalles de temps de Tokio 1.54.0. Sur le runtime multithread, elle peut provoquer un accès à de la mémoire libérée et des crashs, même depuis du code Rust sûr.",
            detail:
              "Crédité sous carabistouflette pour un signalement indépendant. Sévérité élevée ; corrigée dans Tokio 1.54.1.",
            reference: "GHSA-5wjr-9356-4wc8",
            link: {
              label: "Lire l’avis de sécurité",
              url: "https://github.com/tokio-rs/tokio/security/advisories/GHSA-5wjr-9356-4wc8",
            },
          },
          {
            name: "SteelMC",
            focus: "Sécurité réseau",
            role: "Contribution au durcissement réseau",
            description:
              "J’ai aussi travaillé sur la sécurité réseau de SteelMC, un serveur Minecraft écrit en Rust : durcissement de la lecture des paquets et gestion des entrées réseau malformées.",
            detail:
              "Une proposition de durcissement du protocole et de rejet des paquets invalides est consultable dans la pull request #547.",
            reference: "Steel-Foundation/SteelMC · #547",
            link: {
              label: "Voir la contribution réseau",
              url: "https://github.com/Steel-Foundation/SteelMC/pull/547",
            },
          },
        ],
      },
      projects: {
        heading: "Autres projets & communautés",
        entries: [
          {
            name: "Sillage",
            url: "https://github.com/brio-labs/maestria/tree/dev/sillage",
            role: "Projet personnel",
            description:
              "Lanceur Linux natif et moteur de recherche documentaire séparé. Code et documentation sur dev/sillage.",
          },
          {
            name: "HealthGraphBench",
            url: "https://github.com/carabistouflette/HealthGraphBench",
            role: "Projet de recherche personnel",
            description:
              "Benchmark temporel de l’apport prédictif des graphes sur les données FDA et CMS. Code, protocoles et rapports reproductibles.",
          },
          {
            name: "KolibriOS",
            url: "https://github.com/KolibriOS/kolibrios",
            role: "Projet passion",
            description:
              "Système d’exploitation minuscule en assembleur x86. J’en migre le code vers fasm2.",
          },
        ],
      },
      github: {
        eyebrow: "Contributions & activité",
        pageTitle: "Contributions & activité GitHub",
        homeLabel: "Retour au portfolio",
        calendar: {
          heading: "Au fil des jours",
          totalLabel: "contributions sur les douze derniers mois",
          lessLabel: "Moins",
          moreLabel: "Plus",
          daySingular: "{date} · {count} contribution",
          dayPlural: "{date} · {count} contributions",
          zeroDayLabel: "{date} · aucune contribution comptabilisée",
        },
      },
    },
    journey: {
      heading: "Expérience & formation",
      detailLabel: "Détails",
      labels: { education: "Formation", experience: "Expérience" },
      invitation: {
        title: "Vous ?",
        description:
          "Je cherche un stage du 22 mars au 21 août 2027, à Montpellier ou Lille. Une alternance en M2 est également possible à partir de septembre 2027.",
        linkLabel: "Proposer un stage",
        start: "2026-master",
        end: "2028",
      },
      axis: [
        { id: "2023", label: "2023" },
        { id: "2024", label: "2024" },
        { id: "2025", label: "2025" },
        { id: "2026-but", label: "2026", detail: "BUT" },
        { id: "2026-master", label: "2026", detail: "Master" },
        { id: "2027", label: "2027" },
        { id: "2028", label: "2028" },
      ],
      entries: [
        {
          kind: "education",
          title: "Master en IA · MIAS",
          subtitle: "Centrale Lille",
          period: "2026–2028",
          start: "2026-master",
          end: "2028",
          logos: ["/logos/centrale-lille.png"],
        },
        {
          kind: "experience",
          title: "CIRAD",
          subtitle: "Stage agentique / RAG",
          period: "Avril–août 2026",
          start: "2026-but",
          detail: "Stage de BUT · recherche en agronomie · projet GenomInt.",
          projectId: "genomint",
          logos: ["/logos/cirad.png"],
        },
        {
          kind: "experience",
          title: "SMAG",
          subtitle: "Stage full-stack",
          period: "Février–mai 2025",
          start: "2025",
          detail:
            "Outils de traitement CSV : import, jointures et export pour les équipes d’agriculture digitale.",
          logos: ["/logos/smag.png"],
        },
        {
          kind: "education",
          title: "BUT Informatique",
          subtitle: "Montpellier",
          period: "2023–2026",
          start: "2023",
          end: "2026-master",
          detail: "Déploiement et sécurisation des réseaux informatiques",
          logos: ["/logos/um-montpellier.png", "/logos/iut-swoosh.png"],
        },
      ],
    },
    skills: {
      heading: "Compétences",
      highlights: [
        {
          name: "Relier un agent aux données",
          description:
            "Agents Python, API FastAPI et requêtes Neo4j pour interroger des graphes génomiques ; déploiement des services avec Docker et K3s.",
          projectIds: ["genomint"],
        },
        {
          name: "Construire des logiciels natifs",
          description:
            "Contribuer à la recherche dans les documents avec Sillage, développer un compilateur avec Nacre : deux façons de travailler en Rust.",
          projectIds: ["sillage", "nacre"],
        },
        {
          name: "Évaluer les modèles dans le temps",
          description:
            "Préparer les données FDA/CMS, comparer des modèles tabulaires et relationnels et contrôler les coupures temporelles avec HealthGraphBench.",
          projectIds: ["meddatatrace"],
        },
      ],
      catalogMoreLabel: "Explorer toutes les compétences",
      catalogCloseLabel: "Refermer",
      projectLabel: "Voir dans le projet",
      groups: [
        {
          label: "Langages",
          description:
            "Écrire la logique, des scripts aux applications et aux systèmes.",
          items: [
            { name: "Python", projectIds: ["genomint", "meddatatrace"] },
            { name: "Rust", projectIds: ["sillage", "nacre"] },
            { name: "TypeScript", projectIds: [] },
            { name: "Java", projectIds: ["encrypted-voting", "justsyncit"] },
            { name: "C", projectIds: ["nacre"] },
          ],
        },
        {
          label: "Web & interfaces",
          description:
            "Relier les interfaces, les API et les services applicatifs.",
          items: [
            { name: "Astro", projectIds: [] },
            { name: "React", projectIds: [] },
            { name: "Next.js", projectIds: [] },
            { name: "Vue.js", projectIds: [] },
            { name: "Nuxt.js", projectIds: [] },
            { name: "Tailwind CSS", projectIds: [] },
            { name: "FastAPI", projectIds: ["genomint"] },
            { name: "Flask", projectIds: [] },
            { name: "Spring Boot", projectIds: ["encrypted-voting"] },
            { name: "Thymeleaf", projectIds: [] },
          ],
        },
        {
          label: "Données & analyse",
          description:
            "Préparer les datasets, transformer les tableaux et explorer les données.",
          items: [
            { name: "Polars", projectIds: [] },
            { name: "Pandas", projectIds: [] },
            { name: "Datasets", projectIds: [] },
            { name: "NumPy", projectIds: ["meddatatrace"] },
            { name: "SciPy", projectIds: [] },
            { name: "Scikit-learn", projectIds: ["meddatatrace"] },
          ],
        },
        {
          label: "IA & fine-tuning",
          description:
            "Adapter les modèles, préparer les tokens et optimiser l’inférence.",
          items: [
            { name: "PyTorch", projectIds: [] },
            { name: "Transformers", projectIds: [] },
            { name: "Unsloth", projectIds: [] },
            { name: "Tokenizers", projectIds: [] },
            { name: "PEFT", projectIds: [] },
            { name: "TRL", projectIds: [] },
            { name: "bitsandbytes", projectIds: [] },
            { name: "Safetensors", projectIds: [] },
            { name: "Pi", projectIds: ["genomint"] },
            { name: "LangChain", projectIds: ["genomint"] },
            { name: "Haystack", projectIds: ["genomint"] },
            { name: "vLLM", projectIds: [] },
          ],
        },
        {
          label: "Entraînement & suivi",
          description:
            "Exécuter les entraînements, comparer les expériences et suivre les métriques.",
          items: [
            { name: "Accelerate", projectIds: [] },
            { name: "PyTorch Lightning", projectIds: [] },
            { name: "Weights & Biases", projectIds: [] },
            { name: "DeepSpeed", projectIds: [] },
            { name: "TensorBoard", projectIds: [] },
            { name: "MLflow", projectIds: [] },
            { name: "Optuna", projectIds: [] },
          ],
        },
        {
          label: "Visualisation",
          description:
            "Lire les distributions, visualiser les résultats et construire des graphiques interactifs.",
          items: [
            { name: "Matplotlib", projectIds: ["meddatatrace"] },
            { name: "Seaborn", projectIds: [] },
            { name: "Plotly", projectIds: [] },
            { name: "Altair", projectIds: [] },
          ],
        },
        {
          label: "Bases de données",
          description:
            "Organiser les données, du relationnel aux documents et aux graphes.",
          items: [
            { name: "PostgreSQL", projectIds: ["genomint"] },
            { name: "MySQL", projectIds: [] },
            { name: "MariaDB", projectIds: [] },
            { name: "SQLite", projectIds: ["sillage", "justsyncit"] },
            { name: "MongoDB", projectIds: [] },
            { name: "Cassandra", projectIds: [] },
            { name: "Neo4j", projectIds: ["genomint"] },
          ],
        },
        {
          label: "Systèmes & déploiement",
          description:
            "Construire, automatiser et faire communiquer les services.",
          items: [
            { name: "Docker", projectIds: ["genomint"] },
            { name: "Podman", projectIds: [] },
            { name: "Maven", projectIds: [] },
            { name: "Ansible", projectIds: [] },
            { name: "Terraform", projectIds: [] },
            { name: "GitLab CI/CD", projectIds: [] },
            { name: "GitHub Actions", projectIds: [] },
            { name: "gRPC", projectIds: [] },
            { name: "Tokio", projectIds: [] },
            { name: "WebAssembly", projectIds: [] },
          ],
        },
        {
          label: "Sécurité & réseau",
          description:
            "Explorer les environnements, les échanges réseau et leur sécurité.",
          items: [
            { name: "Linux", projectIds: ["genomint"] },
            { name: "Nmap", projectIds: [] },
            { name: "Cisco Packet Tracer", projectIds: [] },
            { name: "OpenSSL", projectIds: [] },
            { name: "Wireshark", projectIds: [] },
            { name: "ZAP Proxy", projectIds: [] },
          ],
        },
      ],
    },
    personal: {
      heading: "Et loin du clavier ?",
      intro:
        "Je suis originaire de Montpellier. Loin du code, je fais de la randonnée en montagne et de la photographie. J’aime aussi le VTT et les voyages.",
      photoAlt:
        "Un ruisseau descend entre les rochers d’une forêt de conifères, dans la brume éclairée par le soleil.",
      interests: [
        {
          title: "Écrire & imaginer",
          description:
            "J’écris des histoires. La lecture et la philosophie font aussi partie de mes centres d’intérêt.",
        },
        {
          title: "Bricoler & partager",
          description:
            "Je bricole des PC, des Raspberry Pi et de l’électronique. Et j’aime les jeux de société.",
        },
      ],
    },
    contact: {
      heading: "Donnons vie à vos projets.",
      email: contactEmail,
      emailCta: "Envoyer un e-mail",
      copyEmail: "Copier l'adresse",
      copiedEmail: "Adresse copiée !",
      status: "Disponible pour de nouvelles opportunités",
      location: "Montpellier · Remote",
      responseTime: "Réponse habituelle sous 24h",
      linkedin: "LinkedIn",
      linkedinDescription: "Parcours professionnel & réseau",
      github: "GitHub",
      githubDescription: "Code source, projets & contributions",
      cv: "Télécharger le CV",
      cvDescription: "Formation & expériences · PDF en français",
      backToTop: "Haut de page",
      colophon: "Alexis Robin · IA, systèmes logiciels & open source",
      legal: "Tous droits réservés",
      moonAlt: "Croissant de lune céleste dans la nuit étoilée",
    },
  },
  en: {
    meta: {
      title: "Alexis Robin — AI & data systems",
      description:
        "Alexis Robin — AI, software systems and Rust cybersecurity. GenomInt at CIRAD, Sillage, HealthGraphBench research, a Tokio vulnerability discovery and SteelMC network security.",
    },
    skipLink: "Skip to main content",
    navigation: {
      primaryLabel: "Primary navigation",
      sections: {
        accueil: { id: "accueil", label: "Home" },
        projects: { id: "projects", label: "Projects" },
        skills: { id: "skills", label: "Skills" },
        journey: { id: "journey", label: "Journey" },
        "open-source": { id: "open-source", label: "Contributions" },
        personal: { id: "personal", label: "About" },
        contact: { id: "contact", label: "Contact" },
      },
    },
    localeLabel: "Choose language",
    localeSwitch: {
      fr: "FR",
      en: "EN",
    },
    hero: {
      eyebrow: "AI & data systems",
      summaryTitle: "Under the name carabistouflette",
      title: "Alexis Robin",
      headline: "AI tools for querying scientific data.",
      affiliation: "M1 at Centrale Lille · AI for health · MIAS track",
      description:
        "I build AI tools for scientific data. I am also interested in Rust cybersecurity.",
      availability: {
        label: "Seeking an internship",
        detail: "22 March – 21 August 2027 · Montpellier or Lille",
        note: "Apprenticeship (M2) possible from September 2027.",
      },
      projectsCta: "View my projects",
      cvCta: "Download CV",
      contactCta: "Get in touch",
    },
    projects: {
      heading: "My projects",
      intro: "AI agents, scientific data and native software.",
      otherHeading: "Supplementary work",
      entries: [
        {
          id: "genomint",
          title: "GenomInt",
          description:
            "At CIRAD, I built the AI agent and the genomic graph explorer’s backend: Neo4j queries, APIs and exports.",
          technologies:
            "Python · FastAPI · Pi · LangChain · Haystack · PostgreSQL · Neo4j · Docker · Linux",
          url: "/en/projects/genomint/",
          linkLabel: "Read the case study",
        },
        {
          id: "meddatatrace",
          title: "HealthGraphBench",
          description:
            "I compare tabular and relational models on FDA MAUDE and CMS data, using temporal evaluation.",
          technologies: "Python · NumPy · Scikit-learn · Numba · Matplotlib",
          url: "/en/projects/meddatatrace/",
          linkLabel: "Read the case study",
          status: "Research in progress · exploratory results.",
        },
        {
          id: "sillage",
          title: "Sillage",
          description:
            "At Brio, I contribute to Sillage: a native Linux launcher and a document search engine that can run separately.",
          technologies: "Rust · Slint · Tantivy · SQLite",
          url: "/en/projects/sillage/",
          linkLabel: "Read the case study",
        },
        {
          id: "nacre",
          title: "Nacre",
          description:
            "Experimental native compiler written in Rust, with Java-like syntax: C11 to GCC or Clang by default, with an optional direct LLVM backend.",
          technologies: "Rust · C11 · LLVM · Linux",
          url: "/en/projects/nacre/",
          linkLabel: "Read the case study",
        },
        {
          id: "encrypted-voting",
          title: "El Gamal voting",
          description:
            "Verifiable voting without revealing individual choices: El Gamal encryption and zero-knowledge proofs.",
          technologies: "Java · Spring · El Gamal",
          url: "/en/projects/encrypted-voting/",
          linkLabel: "Read the case study",
        },
        {
          id: "justsyncit",
          title: "JustSyncIt",
          description:
            "Java backup tool with snapshots, incremental backups, content-addressable deduplication and remote transfers.",
          technologies: "Java · SQLite · Jackson · Kwik · Bouncy Castle",
          url: "https://github.com/carabistouflette/JustSyncIt/",
          linkLabel: "View on GitHub",
        },
      ],
    },
    openSource: {
      heading: "Open source & cybersecurity.",
      intro:
        "Changes proposed, discussed and merged. Follow the projects, trace the code and explore the activity shown on",
      profileLink: {
        label: "my GitHub profile.",
        bannerLabel: "My GitHub profile",
        url: "https://github.com/carabistouflette",
      },
      security: {
        heading: "Cybersecurity & Rust",
        intro:
          "Understanding failures and making software more robust: I put this interest into practice through vulnerability research and network hardening in the Rust ecosystem.",
        entries: [
          {
            name: "Tokio",
            focus: "Memory safety",
            role: "Discovery & responsible disclosure",
            description:
              "I discovered and privately reported a race condition in Tokio 1.54.0’s time intervals. On the multithreaded runtime, it can cause use-after-free and crashes, even from safe Rust code.",
            detail:
              "Credited as carabistouflette for an independent report. High severity; fixed in Tokio 1.54.1.",
            reference: "GHSA-5wjr-9356-4wc8",
            link: {
              label: "Read the security advisory",
              url: "https://github.com/tokio-rs/tokio/security/advisories/GHSA-5wjr-9356-4wc8",
            },
          },
          {
            name: "SteelMC",
            focus: "Network security",
            role: "Network hardening contributor",
            description:
              "I also worked on network security for SteelMC, a Minecraft server written in Rust: hardening packet reads and handling malformed network input.",
            detail:
              "A proposal to harden the protocol and reject invalid packets is available in pull request #547.",
            reference: "Steel-Foundation/SteelMC · #547",
            link: {
              label: "View the network contribution",
              url: "https://github.com/Steel-Foundation/SteelMC/pull/547",
            },
          },
        ],
      },
      projects: {
        heading: "Other projects & communities",
        entries: [
          {
            name: "Sillage",
            url: "https://github.com/brio-labs/maestria/tree/dev/sillage",
            role: "Personal project",
            description:
              "Native Linux launcher and separate document search engine. Code and documentation on dev/sillage.",
          },
          {
            name: "HealthGraphBench",
            url: "https://github.com/carabistouflette/HealthGraphBench",
            role: "Personal research project",
            description:
              "A temporal benchmark of the predictive value of graphs on FDA and CMS data. Reproducible code, protocols and reports.",
          },
          {
            name: "KolibriOS",
            url: "https://github.com/KolibriOS/kolibrios",
            role: "Passion project",
            description:
              "A tiny operating system in x86 assembly. I am migrating its code to fasm2.",
          },
        ],
      },
      github: {
        eyebrow: "Contributions & activity",
        pageTitle: "GitHub contributions & activity",
        homeLabel: "Back to portfolio",
        calendar: {
          heading: "Day by day",
          totalLabel: "contributions in the last twelve months",
          lessLabel: "Less",
          moreLabel: "More",
          daySingular: "{date} · {count} contribution",
          dayPlural: "{date} · {count} contributions",
          zeroDayLabel: "{date} · no contributions counted",
        },
      },
    },
    journey: {
      heading: "Experience & education",
      detailLabel: "Details",
      labels: { education: "Education", experience: "Experience" },
      invitation: {
        title: "You?",
        description:
          "I’m looking for an internship from 22 March to 21 August 2027, in Montpellier or Lille. An M2 apprenticeship is also possible from September 2027.",
        linkLabel: "Discuss an internship",
        start: "2026-master",
        end: "2028",
      },
      axis: [
        { id: "2023", label: "2023" },
        { id: "2024", label: "2024" },
        { id: "2025", label: "2025" },
        { id: "2026-but", label: "2026", detail: "BUT" },
        { id: "2026-master", label: "2026", detail: "Master" },
        { id: "2027", label: "2027" },
        { id: "2028", label: "2028" },
      ],
      entries: [
        {
          kind: "education",
          title: "Master’s in AI · MIAS",
          subtitle: "Centrale Lille",
          period: "2026–2028",
          start: "2026-master",
          end: "2028",
          logos: ["/logos/centrale-lille.png"],
        },
        {
          kind: "experience",
          title: "CIRAD",
          subtitle: "Agentic AI / RAG internship",
          period: "April–August 2026",
          start: "2026-but",
          detail:
            "BUT degree internship · agronomy research · the GenomInt project.",
          projectId: "genomint",
          logos: ["/logos/cirad.png"],
        },
        {
          kind: "experience",
          title: "SMAG",
          subtitle: "Full-stack internship",
          period: "February–May 2025",
          start: "2025",
          detail:
            "CSV tools: imports, joins and exports for digital-agriculture teams.",
          logos: ["/logos/smag.png"],
        },
        {
          kind: "education",
          title: "BUT in Computer Science",
          subtitle: "Montpellier",
          period: "2023–2026",
          start: "2023",
          end: "2026-master",
          detail:
            "French three-year bachelor’s-equivalent degree · network deployment and security",
          logos: ["/logos/um-montpellier.png", "/logos/iut-swoosh.png"],
        },
      ],
    },
    skills: {
      heading: "Skills",
      highlights: [
        {
          name: "Connect an agent to data",
          description:
            "Python agents, FastAPI endpoints and Neo4j queries for exploring genomic graphs; service deployment with Docker and K3s.",
          projectIds: ["genomint"],
        },
        {
          name: "Build native software",
          description:
            "Contributing to document search in Sillage and developing a compiler in Nacre: two ways I work with Rust.",
          projectIds: ["sillage", "nacre"],
        },
        {
          name: "Evaluate models over time",
          description:
            "Preparing FDA/CMS data, comparing tabular and relational models and enforcing temporal cutoffs with HealthGraphBench.",
          projectIds: ["meddatatrace"],
        },
      ],
      catalogMoreLabel: "Explore all skills",
      catalogCloseLabel: "Close",
      projectLabel: "See in project",
      groups: [
        {
          label: "Languages",
          description:
            "Write the logic, from scripts to applications and systems.",
          items: [
            { name: "Python", projectIds: ["genomint", "meddatatrace"] },
            { name: "Rust", projectIds: ["sillage", "nacre"] },
            { name: "TypeScript", projectIds: [] },
            { name: "Java", projectIds: ["encrypted-voting", "justsyncit"] },
            { name: "C", projectIds: ["nacre"] },
          ],
        },
        {
          label: "Web & interfaces",
          description: "Connect interfaces, APIs and application services.",
          items: [
            { name: "Astro", projectIds: [] },
            { name: "React", projectIds: [] },
            { name: "Next.js", projectIds: [] },
            { name: "Vue.js", projectIds: [] },
            { name: "Nuxt.js", projectIds: [] },
            { name: "Tailwind CSS", projectIds: [] },
            { name: "FastAPI", projectIds: ["genomint"] },
            { name: "Flask", projectIds: [] },
            { name: "Spring Boot", projectIds: ["encrypted-voting"] },
            { name: "Thymeleaf", projectIds: [] },
          ],
        },
        {
          label: "Data & analysis",
          description: "Prepare datasets, transform tables and explore data.",
          items: [
            { name: "Polars", projectIds: [] },
            { name: "Pandas", projectIds: [] },
            { name: "Datasets", projectIds: [] },
            { name: "NumPy", projectIds: ["meddatatrace"] },
            { name: "SciPy", projectIds: [] },
            { name: "Scikit-learn", projectIds: ["meddatatrace"] },
          ],
        },
        {
          label: "AI & fine-tuning",
          description: "Adapt models, prepare tokens and optimize inference.",
          items: [
            { name: "PyTorch", projectIds: [] },
            { name: "Transformers", projectIds: [] },
            { name: "Unsloth", projectIds: [] },
            { name: "Tokenizers", projectIds: [] },
            { name: "PEFT", projectIds: [] },
            { name: "TRL", projectIds: [] },
            { name: "bitsandbytes", projectIds: [] },
            { name: "Safetensors", projectIds: [] },
            { name: "Pi", projectIds: ["genomint"] },
            { name: "LangChain", projectIds: ["genomint"] },
            { name: "Haystack", projectIds: ["genomint"] },
            { name: "vLLM", projectIds: [] },
          ],
        },
        {
          label: "Training & tracking",
          description:
            "Run training jobs, compare experiments and track metrics.",
          items: [
            { name: "Accelerate", projectIds: [] },
            { name: "PyTorch Lightning", projectIds: [] },
            { name: "Weights & Biases", projectIds: [] },
            { name: "DeepSpeed", projectIds: [] },
            { name: "TensorBoard", projectIds: [] },
            { name: "MLflow", projectIds: [] },
            { name: "Optuna", projectIds: [] },
          ],
        },
        {
          label: "Visualization",
          description:
            "Read distributions, visualize results and build interactive charts.",
          items: [
            { name: "Matplotlib", projectIds: ["meddatatrace"] },
            { name: "Seaborn", projectIds: [] },
            { name: "Plotly", projectIds: [] },
            { name: "Altair", projectIds: [] },
          ],
        },
        {
          label: "Databases",
          description: "Organize data, from relations to documents and graphs.",
          items: [
            { name: "PostgreSQL", projectIds: ["genomint"] },
            { name: "MySQL", projectIds: [] },
            { name: "MariaDB", projectIds: [] },
            { name: "SQLite", projectIds: ["sillage", "justsyncit"] },
            { name: "MongoDB", projectIds: [] },
            { name: "Cassandra", projectIds: [] },
            { name: "Neo4j", projectIds: ["genomint"] },
          ],
        },
        {
          label: "Systems & deployment",
          description: "Build, automate and connect services.",
          items: [
            { name: "Docker", projectIds: ["genomint"] },
            { name: "Podman", projectIds: [] },
            { name: "Maven", projectIds: [] },
            { name: "Ansible", projectIds: [] },
            { name: "Terraform", projectIds: [] },
            { name: "GitLab CI/CD", projectIds: [] },
            { name: "GitHub Actions", projectIds: [] },
            { name: "gRPC", projectIds: [] },
            { name: "Tokio", projectIds: [] },
            { name: "WebAssembly", projectIds: [] },
          ],
        },
        {
          label: "Security & networking",
          description: "Explore environments, network traffic and security.",
          items: [
            { name: "Linux", projectIds: ["genomint"] },
            { name: "Nmap", projectIds: [] },
            { name: "Cisco Packet Tracer", projectIds: [] },
            { name: "OpenSSL", projectIds: [] },
            { name: "Wireshark", projectIds: [] },
            { name: "ZAP Proxy", projectIds: [] },
          ],
        },
      ],
    },
    personal: {
      heading: "Away from the keyboard?",
      intro:
        "I’m from Montpellier. Away from code, I hike in the mountains and take photographs. I also enjoy mountain biking and travelling.",
      photoAlt:
        "A stream flows between rocks in a conifer forest, surrounded by mist lit by the sun.",
      interests: [
        {
          title: "Writing & imagining",
          description:
            "I write stories. Reading and philosophy are also among my interests.",
        },
        {
          title: "Making & sharing",
          description:
            "I tinker with PCs, Raspberry Pis and electronics. And I enjoy board games.",
        },
      ],
    },
    contact: {
      heading: "Let's build something together.",
      email: contactEmail,
      emailCta: "Send an email",
      copyEmail: "Copy address",
      copiedEmail: "Address copied!",
      status: "Available for new opportunities",
      location: "Montpellier · Remote",
      responseTime: "Typically replies within 24h",
      linkedin: "LinkedIn",
      linkedinDescription: "Professional background & network",
      github: "GitHub",
      githubDescription: "Source code, projects & contributions",
      cv: "Download CV",
      cvDescription: "Education & experience · PDF in French",
      backToTop: "Back to top",
      colophon: "Alexis Robin · AI, software systems & open source",
      legal: "All rights reserved",
      moonAlt: "Celestial crescent moon in the starry night",
    },
  },
};

const genomintFr: CaseStudy = {
  title: "GenomInt",
  question: "Interroger un graphe génomique sans écrire de Cypher.",
  kicker: "CIRAD · stage 2026 · système agentique pour graphe génomique",
  summary:
    "GenomInt aide les biologistes à explorer les données pangénomiques de Ganoderma, par dialogue et navigation dans un graphe Neo4j.",
  atGlance: {
    label: "Repères du projet",
    entries: [
      {
        label: "Cadre",
        value: "Stage CIRAD · UMR AGAP · avril–août 2026",
      },
      {
        label: "Équipe",
        value:
          "Encadrement : Létizia Camus-Kulandaivelu · interface : Théodore de Boisseson",
      },
      {
        label: "Accès",
        value:
          "Code fermé · publication scientifique en préparation (co-auteur)",
      },
    ],
  },
  technicalLabel: "Examiner les choix techniques",
  role: "J’ai développé l’agent et le backend du GKG Explorer : requêtes Neo4j, API, parcours et exports. J’ai aussi travaillé sur la sécurité et le déploiement. J’ai partagé les contrats d’API et l’intégration avec le développeur de l’interface.",
  roleLabel: "Périmètre personnel",
  path: "/projets/genomint/",
  figure: {
    kind: "screenshot",
    title: "Explorer le graphe génomique",
    alt: "GKG Explorer : filtres de chromosome, réseau de nœuds et table de gènes.",
    source: "Capture de l’interface GenomInt.",
    src: "/images/genomint-explorer.webp",
    srcset:
      "/images/genomint-explorer-1100.webp 1100w, /images/genomint-explorer.webp 2877w",
    width: 2877,
    height: 1743,
    openLabel: "Agrandir la capture",
  },
  mediaLabel: "L’interface en images",
  screenshots: {
    openLabel: "Voir la capture en taille réelle",
    items: [
      {
        title: "Accueil",
        caption:
          "Les trois accès au projet : dialogue, exploration et requête directe.",
        alt: "Accueil GenomInt vert, avec présentation des accès Chat, GKG Explorer et Graph Query.",
        src: "/images/genomint-home.webp",
        preview: "/images/genomint-home-1100.webp",
        width: 2877,
        height: 1742,
      },
      {
        title: "Explorer le graphe",
        caption: "Filtres génomiques, réseau de nœuds et données associées.",
        alt: "GKG Explorer : filtres de chromosome à gauche, graphe de nœuds au centre et table de gènes à droite.",
        src: "/images/genomint-explorer.webp",
        preview: "/images/genomint-explorer-1100.webp",
        width: 2877,
        height: 1743,
      },
      {
        title: "Suivre l’agent",
        caption:
          "Question biologique, appels d’outils et requête Neo4j visibles.",
        alt: "Chat GenomInt affichant une question sur le core genome de G. boninense et les appels READ_SKILL, GET_GRAPH_SCHEMA et QUERY_NEO4J.",
        src: "/images/genomint-chat.webp",
        preview: "/images/genomint-chat-1100.webp",
        width: 2877,
        height: 1739,
      },
      {
        title: "Administrer les accès",
        caption:
          "Rôles, capacités et statuts ; comptes masqués sur la capture.",
        alt: "Administration GenomInt : rôles et capacités, statuts des comptes et actions ; identités masquées.",
        src: "/images/genomint-admin.webp",
        preview: "/images/genomint-admin-1100.webp",
        width: 2877,
        height: 1745,
      },
    ],
  },
  pagination: {
    heading: "Pagination : moins de pages, pas un benchmark",
    intro: "Pour 15 615 segments, pages de 1 000 → 10 000.",
    beforeValue: "16",
    beforeLabel: "Avant · 1 000 / page",
    afterValue: "2",
    afterLabel: "Après · 10 000 / page",
    unit: "pages",
    notice:
      "14 requêtes de page en moins ; aucun gain de temps ou de mémoire mesuré.",
  },
  sections: [
    {
      heading: "01 · Choisir la stratégie de retrieval",
      paragraphs: [
        "Pour le retrieval, j’ai comparé un RAG classique, où un index figé fournit un contexte unique avant la génération, et un RAG complètement agentique : le modèle décide lui-même des outils à appeler, itère et vérifie. Sur un graphe pangénomique, la comparaison a tranché : les réponses vivent dans le schéma et les traversées Cypher, pas dans des passages de texte. L’agent pilote donc GET_GRAPH_SCHEMA, READ_SKILL et QUERY_NEO4J au fil de la question.",
        "Ce pilotage agentique est accompagné d’un petit système de RAG adapté aux données en graphe pangénomique : l’index vectoriel natif de Neo4j, utilisé en recherche hybride. Les descriptions de pangènes et les annotations sont plongées dans la base ; la similarité vectorielle retrouve les nœuds qu’une requête littérale aurait manqués, puis une à deux traversées les rattachent aux génomes, transcrits et annotations voisins.",
        "La répartition reste stricte : le vecteur suggère, Cypher prouve. Les faits de séquence, comme la présence d’un pangène ou l’appartenance au core genome, sortent du graphe, jamais des paramètres du modèle.",
      ],
      points: [
        {
          label: "Compromis",
          detail:
            "Le retrieval agentique coûte plus de tours d’outils et de tokens qu’un contexte pré-calculé ; en échange, chaque réponse reste traçable jusqu’aux nœuds du graphe.",
        },
      ],
    },
    {
      heading: "02 · Servir l’explorateur et les exports",
      paragraphs: [
        "Pour le GKG Explorer, j’ai développé les requêtes et les API qui alimentent les filtres, le graphe et les résultats. Les filtres restent côté serveur ; la pagination précède l’enrichissement pour éviter de préparer un chromosome entier.",
        "Pour les exports, les séquences sont résolues par lots, les segments FASTA respectent leur orientation et les états volumineux passent par SQLite ou JSONL avant la construction de l’archive.",
      ],
      points: [
        {
          label: "Limite",
          detail:
            "Taille des lignes, tampons Neo4j et ZIP non bornés en octets : pic mémoire et tenue en charge à mesurer.",
        },
      ],
    },
    {
      heading: "03 · Encadrer Cypher",
      paragraphs: [
        "Le validateur normalise et tokenise Cypher, refuse les écritures et inspecte les sous-requêtes. QueryService ajoute lecture seule et délai ; le client ouvre une session Neo4j READ_ACCESS.",
        "La route impose permissions et limitation de débit. Ces contrôles applicatifs ne prouvent pas que le compte Neo4j dispose des privilèges minimaux.",
      ],
      points: [
        {
          label: "Hors preuve",
          detail:
            "Fuzzing adversarial, test d’intrusion et audit des privilèges Neo4j.",
        },
      ],
    },
    {
      heading: "04 · Déployer et vérifier",
      paragraphs: [
        "Images Podman, registre OCI compatible, Helm et K3s. Un miroir local a contourné une incompatibilité de format avec le registre GitLab.",
        "helm upgrade --install --atomic --wait, puis vérification des pods, services et routes protégées : une procédure reproductible, pas une garantie de disponibilité sous charge.",
      ],
      points: [
        {
          label: "À établir",
          detail:
            "Reprise des flux entre réplicas, comportement sous charge et validation biologique.",
        },
      ],
    },
  ],
  homeLabel: "Retour au portfolio",
  counterpartLabel: "Read in English",
  languageLabel: "Changer de langue",
};

const genomintEn: CaseStudy = {
  title: "GenomInt",
  question: "Query a genomic graph without writing Cypher.",
  kicker: "CIRAD · 2026 internship · agentic genomics graph workbench",
  summary:
    "GenomInt helps biologists explore Ganoderma pangenomic data through dialogue and navigation in a Neo4j graph.",
  atGlance: {
    label: "Project details",
    entries: [
      {
        label: "Setting",
        value: "CIRAD internship · UMR AGAP · April–August 2026",
      },
      {
        label: "Team",
        value:
          "Supervisor: Létizia Camus-Kulandaivelu · interface: Théodore de Boisseson",
      },
      {
        label: "Access",
        value: "Closed code · research paper in preparation (co-author)",
      },
    ],
  },
  technicalLabel: "Examine the technical choices",
  role: "I built the agent and the GKG Explorer backend: Neo4j queries, APIs, traversals and exports. I also worked on security and deployment. I shared API contracts and integration with the interface developer.",
  roleLabel: "Personal scope",
  path: "/en/projects/genomint/",
  figure: {
    kind: "screenshot",
    title: "Explore the genomic graph",
    alt: "GKG Explorer with chromosome filters, a node network and a gene table.",
    source: "GenomInt interface screenshot.",
    src: "/images/genomint-explorer.webp",
    srcset:
      "/images/genomint-explorer-1100.webp 1100w, /images/genomint-explorer.webp 2877w",
    width: 2877,
    height: 1743,
    openLabel: "View full-size capture",
  },
  mediaLabel: "The interface",
  screenshots: {
    openLabel: "View full-size screenshot",
    items: [
      {
        title: "Home",
        caption: "Three ways in: chat, graph exploration and direct queries.",
        alt: "Green GenomInt home screen presenting Chat, GKG Explorer and Graph Query.",
        src: "/images/genomint-home.webp",
        preview: "/images/genomint-home-1100.webp",
        width: 2877,
        height: 1742,
      },
      {
        title: "Explore the graph",
        caption: "Genomic filters, node network and linked data.",
        alt: "GKG Explorer with chromosome filters on the left, a node graph in the center and a gene table on the right.",
        src: "/images/genomint-explorer.webp",
        preview: "/images/genomint-explorer-1100.webp",
        width: 2877,
        height: 1743,
      },
      {
        title: "Follow the agent",
        caption: "Biological question, tool calls and Neo4j query in view.",
        alt: "GenomInt chat showing a question about the G. boninense core genome and READ_SKILL, GET_GRAPH_SCHEMA and QUERY_NEO4J calls.",
        src: "/images/genomint-chat.webp",
        preview: "/images/genomint-chat-1100.webp",
        width: 2877,
        height: 1739,
      },
      {
        title: "Manage access",
        caption: "Roles, capabilities and statuses; account details redacted.",
        alt: "GenomInt administration view showing roles, capabilities, account statuses and actions, with identities redacted.",
        src: "/images/genomint-admin.webp",
        preview: "/images/genomint-admin-1100.webp",
        width: 2877,
        height: 1745,
      },
    ],
  },
  pagination: {
    heading: "Pagination: fewer pages, not a benchmark",
    intro: "For 15,615 segments, page size 1,000 → 10,000.",
    beforeValue: "16",
    beforeLabel: "Before · 1,000 / page",
    afterValue: "2",
    afterLabel: "After · 10,000 / page",
    unit: "pages",
    notice: "14 fewer page requests; no measured time or memory gain.",
  },
  sections: [
    {
      heading: "01 · Choose the retrieval strategy",
      paragraphs: [
        "For retrieval, I compared a classic RAG pipeline, where a frozen index supplies one context before generation, with a fully agentic RAG: the model chooses its own tool calls, iterates and verifies. On a pangenomic graph, the comparison was decisive. The answers live in the schema and in Cypher traversals, not in text passages, so the agent drives GET_GRAPH_SCHEMA, READ_SKILL and QUERY_NEO4J as the question unfolds.",
        "That agentic steering is paired with a small RAG system suited to pangenomic graph data: Neo4j’s native vector index, used for hybrid search. Pangene descriptions and annotations are embedded in the database; vector similarity surfaces nodes a literal query would have missed, then one or two traversals tie them back to neighbouring genomes, transcripts and annotations.",
        "The division of labor stays strict: the vector suggests, Cypher proves. Sequence facts, such as pangene presence or core-genome membership, come from the graph, never from the model’s parameters.",
      ],
      points: [
        {
          label: "Trade-off",
          detail:
            "Agentic retrieval spends more tool calls and tokens than a precomputed context; in exchange, every answer remains traceable to the graph nodes behind it.",
        },
      ],
    },
    {
      heading: "02 · Serve the explorer and exports",
      paragraphs: [
        "For GKG Explorer, I built the queries and APIs behind the filters, graph and results. Filters stay server-side; pagination precedes enrichment so narrow selections do not prepare an entire chromosome.",
        "For exports, sequences resolve in batches, FASTA segments retain their orientation and large state moves to SQLite or JSONL before the archive is assembled.",
      ],
      points: [
        {
          label: "Limit",
          detail:
            "Row size, Neo4j buffers and ZIP files are not all byte-bounded: peak memory and load behavior remain unmeasured.",
        },
      ],
    },
    {
      heading: "03 · Constrain Cypher",
      paragraphs: [
        "The validator normalizes and tokenizes Cypher, rejects writes and inspects subqueries. QueryService adds read-only execution and a timeout; the client opens a Neo4j READ_ACCESS session.",
        "The route enforces permissions and rate limits. These application controls do not prove least-privilege Neo4j credentials.",
      ],
      points: [
        {
          label: "Not established",
          detail:
            "Adversarial fuzzing, penetration testing and a Neo4j privilege audit.",
        },
      ],
    },
    {
      heading: "04 · Deploy and verify",
      paragraphs: [
        "Podman images, a compatible OCI registry, Helm and K3s. A local mirror worked around an image-format mismatch with the GitLab registry.",
        "helm upgrade --install --atomic --wait, followed by checks of pods, services and protected routes: a repeatable procedure, not a guarantee under load.",
      ],
      points: [
        {
          label: "Still open",
          detail:
            "Cross-replica stream resumption, load behavior and biological validation.",
        },
      ],
    },
  ],
  homeLabel: "Back to portfolio",
  counterpartLabel: "Lire en français",
  languageLabel: "Change language",
};

const sillageFr: CaseStudy = {
  title: "Sillage",
  question:
    "Lancer une application ou retrouver un passage dans ses documents.",
  kicker: "Projet Brio · Rust · Linux · open source",
  summary:
    "Sillage permet de lancer une application ou de retrouver un passage dans un dossier autorisé, avec le fichier et la ligne ou la page source. Son moteur de recherche peut être installé sans le lanceur.",
  atGlance: {
    label: "Repères du projet",
    entries: [
      {
        label: "Cadre",
        value: "Projet Brio · anciennement Maestria",
      },
      {
        label: "Socle",
        value: "Rust · Slint · Tantivy · SQLite",
      },
      {
        label: "État",
        value: "Développement sur dev/sillage · aucune release publiée",
      },
    ],
  },
  technicalLabel: "Examiner les choix techniques",
  role: "Je contribue au moteur de recherche, au traitement des documents pour l’indexation vectorielle et aux essais d’OCR et de recherche dans les documents visuels.",
  roleLabel: "Mon travail",
  relatedProject: {
    label: "Dans le cadre du projet Brio",
    href: destinations.brio,
  },
  path: "/projets/sillage/",
  figure: {
    kind: "diagram",
    title: "Activer la recherche documentaire",
    alt: "Choisir et autoriser un dossier, indexer ses documents, puis consulter un extrait avec son fichier et sa ligne ou sa page.",
    source: "README · branche dev/sillage",
    sourceHref:
      "https://github.com/brio-labs/maestria/blob/dev/sillage/README.md",
    nodes: [
      {
        title: "Choisir un dossier",
        detail:
          "Installer le composant de recherche, puis autoriser le dossier dans les préférences.",
      },
      {
        title: "Indexer et chercher",
        detail:
          "Suivre l’indexation, puis rechercher dans le texte sans charger de modèle.",
      },
      {
        title: "Consulter la source",
        detail:
          "Lire l’extrait et sa position ; ouvrir le fichier ou copier après vérification de l’accès.",
      },
    ],
  },
  mediaLabel: "Du dossier autorisé à l’extrait",
  demonstration: {
    heading: "Rechercher un passage et inspecter sa source",
    description:
      "Capture du lanceur natif Slint sur un document créé pour la démonstration. La recherche est lexicale, sans modèle ni OCR. La vidéo montre le résultat réel puis l’ouverture du passage cité.",
    video: {
      src: "/evidence/sillage-search-demo.webm",
      poster: "/evidence/sillage-search-poster.webp",
      captions: "/evidence/sillage-demo-fr.vtt",
      caption:
        "Build développeur local · document de démonstration · 12 secondes · sans son.",
    },
    steps: [
      {
        heading: "1 · Saisir la requête",
        description:
          "La saisie de « provenance » interroge le contenu du dossier de démonstration autorisé.",
      },
      {
        heading: "2 · Retrouver le passage",
        description:
          "Le résultat identifie notes-recherche.md et les lignes 1–2, plutôt qu’un simple nom de fichier.",
      },
      {
        heading: "3 · Inspecter la source",
        description:
          "Flèche bas puis Entrée ouvrent le panneau de preuve : passage, citation, version de l’artefact et empreinte du contenu.",
      },
    ],
    transcript: {
      label: "Lire la transcription",
      text: "Dans le lanceur vide, la requête provenance est saisie. Un résultat apparaît pour notes-recherche.md, lignes 1–2 : « Dataset provenance links an evaluation to its source data. An evaluation keeps a pinned dataset version and a source citation. » Le résultat est sélectionné au clavier puis ouvert avec Entrée. Le panneau affiche ce passage, sa source et son empreinte ; aucune application externe n’est ouverte.",
    },
    download: {
      label: "Télécharger la vidéo",
      href: "/evidence/sillage-search-demo.webm",
    },
  },
  sections: [
    {
      heading: "01 · Un lanceur utilisable sans recherche documentaire",
      paragraphs: [
        "Au premier démarrage, le lanceur cherche les applications installées. Il expose aussi des commandes enregistrées et un calculateur. Le texte saisi n’est pas exécuté comme une commande shell.",
        "Fermer la fenêtre masque le lanceur sans arrêter le processus. L’interface Slint utilise un rendu logiciel, sans embarquer Node ni WebKitGTK. La recherche d’applications reste disponible lorsque la recherche documentaire est désactivée ou indisponible.",
      ],
    },
    {
      heading: "02 · Un moteur installable sans le lanceur",
      paragraphs: [
        "Le paquet Debian sillage-search fournit le service de recherche sans interface graphique. Un client local peut rechercher des passages et consulter leurs sources par socket Unix, sans lancer le lanceur ni charger un modèle.",
        "Dans le lanceur, la recherche documentaire demande l’installation de ce composant, le choix d’un dossier et une activation explicite. Les préférences affichent la progression de l’indexation et permettent de désactiver la recherche.",
      ],
    },
    {
      heading:
        "03 · Des extraits vérifiables, pas seulement des noms de fichiers",
      paragraphs: [
        "Les résultats documentaires montrent le passage trouvé, le fichier et sa ligne ou sa page. Avant d’afficher la preuve, de copier ou d’ouvrir la source, le service vérifie à nouveau l’autorisation d’accès.",
        "La recherche lexicale fonctionne sans modèle. La recherche sémantique et l’OCR sont optionnels ; ils ne sont pas activés par défaut dans le lanceur. Ouvrir un fichier ne garantit pas que le lecteur externe se positionne à la ligne ou à la page citée.",
      ],
    },
    {
      heading: "04 · Ce qui reste à valider",
      paragraphs: [
        "Des paquets Debian et AppImage sont construits et testés, mais aucune release n’est publiée. La parité complète de l’interface Slint et les mesures de performance de la version distribuable restent ouvertes.",
        "Sous X11, le raccourci global se configure dans les préférences. Sous Wayland, il dépend du portail du bureau ; un raccourci configuré dans le compositeur reste nécessaire sur certains systèmes.",
        "Les extensions sont optionnelles. Leur installation et leurs permissions ont fait l’objet d’essais, mais le SDK et la validation complète du produit ne sont pas terminés. Les essais d’OCR et de recherche sémantique ne constituent pas une mesure générale de qualité ou de consommation mémoire.",
      ],
    },
  ],
  sources: {
    label: "Code et état du développement",
    entries: [
      {
        label: "Sillage · dev/sillage",
        href: "https://github.com/brio-labs/maestria/tree/dev/sillage",
        detail:
          "Le dépôt conserve le nom maestria ; le développement présenté est sur dev/sillage.",
      },
      {
        label: "Capacités et installation",
        href: "https://github.com/brio-labs/maestria/blob/dev/sillage/README.md",
        detail:
          "Fonctions disponibles, composants optionnels et limites connues.",
      },
      {
        label: "Feuille de route",
        href: "https://github.com/brio-labs/maestria/blob/dev/sillage/docs/ROADMAP.md",
        detail: "Travail restant pour le lanceur, le moteur et les extensions.",
      },
      {
        label: "Journal de développement",
        href: "https://github.com/brio-labs/maestria/blob/dev/sillage/CHANGELOG.md",
        detail: "Changements du moteur, du lanceur et des intégrations.",
      },
    ],
  },
  homeLabel: "Retour au portfolio",
  counterpartLabel: "Read in English",
  languageLabel: "Changer de langue",
};

const sillageEn: CaseStudy = {
  title: "Sillage",
  question: "Launch an application or find a passage in your documents.",
  kicker: "Brio project · Rust · Linux · open source",
  summary:
    "Sillage launches applications and finds passages in an approved folder, with their source file and line or page. Its search engine can be installed without the launcher.",
  atGlance: {
    label: "Project details",
    entries: [
      {
        label: "Setting",
        value: "Brio project · formerly Maestria",
      },
      {
        label: "Stack",
        value: "Rust · Slint · Tantivy · SQLite",
      },
      {
        label: "Status",
        value: "Development on dev/sillage · no published release",
      },
    ],
  },
  technicalLabel: "Examine the technical choices",
  role: "I contribute to the search engine, document processing for vector indexing, and experiments with OCR and visual-document retrieval.",
  roleLabel: "My work",
  relatedProject: {
    label: "Part of the Brio project",
    href: destinations.brio,
  },
  path: "/en/projects/sillage/",
  figure: {
    kind: "diagram",
    title: "Enable document search",
    alt: "Choose and approve a folder, index its documents, then inspect an excerpt with its file and line or page.",
    source: "README · dev/sillage branch",
    sourceHref:
      "https://github.com/brio-labs/maestria/blob/dev/sillage/README.md",
    nodes: [
      {
        title: "Choose a folder",
        detail:
          "Install the search component, then approve the folder in Preferences.",
      },
      {
        title: "Index and search",
        detail:
          "Follow indexing progress, then search the text without loading a model.",
      },
      {
        title: "Inspect the source",
        detail:
          "Read the excerpt and its position; open or copy after an access check.",
      },
    ],
  },
  mediaLabel: "From approved folder to excerpt",
  demonstration: {
    heading: "Find a passage and inspect its source",
    description:
      "A recording of the native Slint launcher using a document created for this demonstration. Search is lexical, without a model or OCR. The video shows the real result and opens the cited passage.",
    video: {
      src: "/evidence/sillage-search-demo.webm",
      poster: "/evidence/sillage-search-poster.webp",
      captions: "/evidence/sillage-demo-en.vtt",
      caption:
        "Local developer build · demonstration document · 12 seconds · no audio.",
    },
    steps: [
      {
        heading: "1 · Type the query",
        description:
          "Typing “provenance” searches the contents of the approved demonstration folder.",
      },
      {
        heading: "2 · Find the passage",
        description:
          "The result identifies notes-recherche.md and lines 1–2, rather than only a filename.",
      },
      {
        heading: "3 · Inspect the source",
        description:
          "Down then Enter open the evidence pane: excerpt, citation, artifact version and content hash.",
      },
    ],
    transcript: {
      label: "Read the transcript",
      text: "The query provenance is typed into the empty launcher. A result appears for notes-recherche.md, lines 1–2: “Dataset provenance links an evaluation to its source data. An evaluation keeps a pinned dataset version and a source citation.” The result is selected using the keyboard and opened with Enter. The pane displays the excerpt, its source and content hash; no external application is opened.",
    },
    download: {
      label: "Download the video",
      href: "/evidence/sillage-search-demo.webm",
    },
  },
  sections: [
    {
      heading: "01 · A launcher that works without document search",
      paragraphs: [
        "On first launch, the launcher searches installed applications. It also exposes registered commands and a calculator. Typed text is not evaluated as a shell command.",
        "Closing the window hides the launcher without ending its process. The Slint interface uses software rendering, without embedding Node or WebKitGTK. Application search remains available when document search is disabled or unavailable.",
      ],
    },
    {
      heading: "02 · An engine that runs without the launcher",
      paragraphs: [
        "The sillage-search Debian package provides a headless search service. A local client can retrieve passages and inspect their sources over a Unix socket, without starting the launcher or loading a model.",
        "In the launcher, document search requires installing this component, choosing a folder and explicitly enabling it. Preferences displays indexing progress and lets the user disable search.",
      ],
    },
    {
      heading: "03 · Inspectable excerpts, not just matching filenames",
      paragraphs: [
        "Document results show the matching passage, file and line or page. Before displaying evidence, copying or opening the source, the service checks access authorization again.",
        "Lexical search works without a model. Semantic search and OCR are optional, not launcher defaults. Opening a file does not guarantee that the external viewer jumps to the cited line or page.",
      ],
    },
    {
      heading: "04 · What remains to be validated",
      paragraphs: [
        "Debian and AppImage packages are built and tested, but no release is published. Full Slint interface parity and release performance measurements remain open.",
        "On X11, the global shortcut is configured in Preferences. On Wayland, it depends on the desktop portal; some systems still require a compositor-configured shortcut.",
        "Extensions are opt-in. Installation and permission flows have been exercised, but the SDK and complete product validation are unfinished. OCR and semantic-search experiments do not establish general retrieval quality or memory usage.",
      ],
    },
  ],
  sources: {
    label: "Code and development status",
    entries: [
      {
        label: "Sillage · dev/sillage",
        href: "https://github.com/brio-labs/maestria/tree/dev/sillage",
        detail:
          "The repository retains the maestria name; the work described is on dev/sillage.",
      },
      {
        label: "Capabilities and installation",
        href: "https://github.com/brio-labs/maestria/blob/dev/sillage/README.md",
        detail:
          "Available features, optional components and known limitations.",
      },
      {
        label: "Roadmap",
        href: "https://github.com/brio-labs/maestria/blob/dev/sillage/docs/ROADMAP.md",
        detail: "Remaining launcher, engine and extension work.",
      },
      {
        label: "Development journal",
        href: "https://github.com/brio-labs/maestria/blob/dev/sillage/CHANGELOG.md",
        detail: "Search engine, launcher and integration changes.",
      },
    ],
  },
  homeLabel: "Back to portfolio",
  counterpartLabel: "Lire en français",
  languageLabel: "Change language",
};
const encryptedVotingFr: CaseStudy = {
  title: "Vote El Gamal",
  question: "Comment vérifier un vote sans révéler les choix individuels ?",
  kicker: "Projet universitaire · Java · Spring",
  summary:
    "Ce projet universitaire explore la vérification des bulletins et le décompte d’un vote chiffré, sans publier les choix individuels.",
  atGlance: {
    label: "Repères du projet",
    entries: [
      {
        label: "Cadre",
        value: "Projet universitaire · Java · Spring",
      },
      {
        label: "Accès",
        value: "Bibliothèque Java publique ; ancienne interface inaccessible",
      },
    ],
  },
  technicalLabel: "Examiner le parcours dans le code",
  roleLabel: "Ma contribution",
  role: "J’ai développé la partie cryptographique et participé au frontend ainsi qu’à l’intégration entre le frontend et le backend.",
  path: "/projets/encrypted-voting/",
  mediaLabel: "Un schéma pédagogique",
  figure: {
    kind: "diagram",
    title: "Trois repères autour du vote chiffré",
    alt: "Repères conceptuels distincts : chiffrement El Gamal, preuves à connaissance zéro et décompte sans révéler les choix.",
    caption:
      "Ces repères sont juxtaposés à titre pédagogique ; leur disposition ne décrit pas le déroulé d’un vote.",
    source:
      "Schéma conceptuel, sans représentation de l’architecture ou du protocole implémenté.",
    nodes: [
      {
        title: "Confidentialité des choix",
        detail:
          "Le chiffrement El Gamal est au cœur du sujet de confidentialité des choix.",
      },
      {
        title: "Vérification des bulletins",
        detail:
          "Une preuve à connaissance zéro permet de démontrer une propriété sans révéler le secret utilisé.",
      },
      {
        title: "Décompte",
        detail:
          "Compter les suffrages sans rendre publics les choix individuels.",
      },
    ],
    optional: {
      title: "Portée",
      detail:
        "Ce schéma n’est ni une preuve de sécurité ni une description du protocole de l’implémentation.",
    },
  },
  demonstration: {
    heading: "Trois bulletins, une exécution réelle",
    description:
      "Un programme de démonstration appelle la bibliothèque Java publique sur les entrées synthétiques Yes, Yes, No. Il chiffre les bulletins, vérifie chaque preuve puis décompte le total. L’interface historique n’étant plus accessible, cette sortie présente le parcours du code disponible.",
    output:
      "Synthetic inputs: Yes, Yes, No\nBallot 1: encrypted; validity proof verified = true\nBallot 2: encrypted; validity proof verified = true\nBallot 3: encrypted; validity proof verified = true\nAggregate tally: 2 Yes / 3 ballots\nExpected tally matched = true",
    steps: [
      {
        heading: "1 · Chiffrer",
        description:
          "castVote encode Yes et No comme deux éléments du groupe, chiffre le choix avec El Gamal et produit une preuve disjonctive de Chaum-Pedersen.",
      },
      {
        heading: "2 · Vérifier",
        description:
          "verifyVote vérifie la preuve associée à chaque bulletin chiffré. La démonstration s’arrête si une preuve est rejetée.",
      },
      {
        heading: "3 · Décompter",
        description:
          "tallyVotes agrège les chiffrés et retrouve deux Yes sur trois bulletins. Ce cas exécuté n’est pas un audit de sécurité du système complet.",
      },
    ],
    download: {
      label: "Télécharger la sortie de l’exécution",
      href: "/evidence/voting-output.txt",
    },
  },
  sections: [
    {
      heading: "01 · Chiffrer sans exposer les choix",
      paragraphs: [
        "Le chiffrement protège le contenu d’un bulletin. Le projet étudie El Gamal pour aborder la confidentialité des choix dans un système de vote.",
      ],
    },
    {
      heading: "02 · Vérifier les bulletins",
      paragraphs: [
        "La vérification ne doit pas obliger à révéler le vote. Les preuves à connaissance zéro permettent d’étudier cette séparation entre une propriété à vérifier et les informations qui doivent rester privées.",
      ],
    },
    {
      heading: "03 · Décompter sans révéler les choix",
      paragraphs: [
        "Le décompte s’intéresse au résultat collectif, plutôt qu’à la publication de chaque choix. Le sujet du projet associe ce résultat à la vérification des bulletins, sans exposer les votes individuels.",
      ],
    },
  ],
  sources: {
    label: "Code consultable",
    entries: [
      {
        label: "VoteServiceImpl.java",
        href: "https://github.com/carabistouflette/Voteomatic-cryptography/blob/386dbb6aa9a9348d0155b99604dafd197254d608/src/main/java/com/voteomatic/cryptography/voting/VoteServiceImpl.java",
        detail: "Chiffrement, preuves et agrégation des bulletins.",
      },
      {
        label: "EndToEndTest.java",
        href: "https://github.com/carabistouflette/Voteomatic-cryptography/blob/386dbb6aa9a9348d0155b99604dafd197254d608/src/test/java/com/voteomatic/cryptography/EndToEndTest.java",
        detail: "Le scénario de trois votes dont est tirée la démonstration.",
      },
      {
        label: "Programme de démonstration",
        href: "https://github.com/carabistouflette/portfolio/blob/main/scripts/evidence/PortfolioVotingDemo.java",
      },
    ],
  },
  homeLabel: "Retour au portfolio",
  counterpartLabel: "Read in English",
  languageLabel: "Changer de langue",
};

const encryptedVotingEn: CaseStudy = {
  title: "El Gamal voting",
  question: "How can a vote be verified without revealing individual choices?",
  kicker: "University project · Java · Spring",
  summary:
    "This university project explores ballot verification and encrypted vote tallying without publishing individual choices.",
  atGlance: {
    label: "Project details",
    entries: [
      {
        label: "Setting",
        value: "University project · Java · Spring",
      },
      {
        label: "Access",
        value: "Public Java library; original interface no longer accessible",
      },
    ],
  },
  technicalLabel: "Explore the conceptual map",
  roleLabel: "My contribution",
  role: "I developed the cryptographic part and contributed to the frontend and frontend/backend integration.",
  path: "/en/projects/encrypted-voting/",
  mediaLabel: "A teaching diagram",
  figure: {
    kind: "diagram",
    title: "Three concepts in encrypted voting",
    alt: "Distinct conceptual points: El Gamal encryption, zero-knowledge proofs, and tallying without revealing choices.",
    caption:
      "These concepts are juxtaposed for teaching; their layout does not describe the steps of a vote.",
    source:
      "Conceptual diagram, not a representation of the implementation architecture or protocol.",
    nodes: [
      {
        title: "Keeping choices private",
        detail:
          "El Gamal encryption is central to the topic of keeping individual choices private.",
      },
      {
        title: "Verifying ballots",
        detail:
          "A zero-knowledge proof demonstrates a property without revealing the secret used.",
      },
      {
        title: "Tallying",
        detail: "Counting votes without making individual choices public.",
      },
    ],
    optional: {
      title: "Scope",
      detail:
        "This diagram is neither a security proof nor a description of the implementation protocol.",
    },
  },
  demonstration: {
    heading: "Three ballots, a real execution",
    description:
      "A demonstration program calls the public Java library with synthetic inputs Yes, Yes, No. It encrypts ballots, verifies each proof and tallies the result. Since the original interface is no longer accessible, this output shows the available code workflow.",
    output:
      "Synthetic inputs: Yes, Yes, No\nBallot 1: encrypted; validity proof verified = true\nBallot 2: encrypted; validity proof verified = true\nBallot 3: encrypted; validity proof verified = true\nAggregate tally: 2 Yes / 3 ballots\nExpected tally matched = true",
    steps: [
      {
        heading: "1 · Encrypt",
        description:
          "castVote encodes Yes and No as two group elements, encrypts the choice with El Gamal and generates a disjunctive Chaum-Pedersen proof.",
      },
      {
        heading: "2 · Verify",
        description:
          "verifyVote checks the proof attached to each encrypted ballot. The demonstration stops if a proof is rejected.",
      },
      {
        heading: "3 · Tally",
        description:
          "tallyVotes aggregates ciphertexts and recovers two Yes votes from three ballots. This executed case is not a security audit of the complete system.",
      },
    ],
    download: {
      label: "Download the execution output",
      href: "/evidence/voting-output.txt",
    },
  },
  sections: [
    {
      heading: "01 · Encrypting without exposing choices",
      paragraphs: [
        "Encryption protects a ballot’s contents. The project studies El Gamal to explore the confidentiality of individual choices in a voting system.",
      ],
    },
    {
      heading: "02 · Verifying ballots",
      paragraphs: [
        "Verification should not require revealing a vote. Zero-knowledge proofs allow exploration of the distinction between a property to verify and the information that must remain private.",
      ],
    },
    {
      heading: "03 · Tallying without revealing choices",
      paragraphs: [
        "Tallying concerns the collective result rather than publishing every choice. The project’s subject combines that result with ballot verification without exposing individual votes.",
      ],
    },
  ],
  sources: {
    label: "Inspectable code",
    entries: [
      {
        label: "VoteServiceImpl.java",
        href: "https://github.com/carabistouflette/Voteomatic-cryptography/blob/386dbb6aa9a9348d0155b99604dafd197254d608/src/main/java/com/voteomatic/cryptography/voting/VoteServiceImpl.java",
        detail: "Ballot encryption, proofs and aggregation.",
      },
      {
        label: "EndToEndTest.java",
        href: "https://github.com/carabistouflette/Voteomatic-cryptography/blob/386dbb6aa9a9348d0155b99604dafd197254d608/src/test/java/com/voteomatic/cryptography/EndToEndTest.java",
        detail: "The three-ballot scenario used for the demonstration.",
      },
      {
        label: "Demonstration program",
        href: "https://github.com/carabistouflette/portfolio/blob/main/scripts/evidence/PortfolioVotingDemo.java",
      },
    ],
  },
  homeLabel: "Back to portfolio",
  counterpartLabel: "Lire en français",
  languageLabel: "Change language",
};

const nacreFr: CaseStudy = {
  title: "Nacre",
  question: "Comment compiler un langage à syntaxe Java sans JVM ?",
  kicker: "Compilateur natif expérimental · Rust · Linux · alpha",
  summary:
    "Nacre compile un langage à syntaxe proche de Java en exécutables natifs Linux, sans JVM. Deux voies sont disponibles : génération de C11 ou backend LLVM direct.",
  atGlance: {
    label: "Repères du projet",
    entries: [
      {
        label: "Socle",
        value: "Rust · runtime C · Linux",
      },
      {
        label: "État",
        value: "Alpha pré-1.0 · aucune compatibilité garantie entre versions",
      },
    ],
  },
  technicalLabel: "Examiner les choix techniques",
  path: "/projets/nacre/",
  mediaLabel: "Des sources à l’exécutable",
  figure: {
    kind: "diagram",
    title: "Le pipeline de compilation de Nacre",
    alt: "Les sources Nacre passent par l’analyse Rust, puis par C11 et GCC ou Clang par défaut ; l’option directe émet du LLVM pour le code utilisateur et relie le support C compilé en bitcode.",
    source: "README.md · docs/ARCHITECTURE.md",
    sourceHref: "https://github.com/carabistouflette/nacre",
    nodes: [
      {
        title: "Sources Nacre",
        detail:
          "Le frontend collecte les fichiers, résout les modules et vérifie les types, l’ownership et les emprunts.",
      },
      {
        title: "Génération C11",
        detail:
          "Le backend par défaut génère du C11 et le compile avec GCC ou Clang pour produire un exécutable natif.",
      },
      {
        title: "Exécutable Linux",
        detail:
          "Le compilateur natif s’appuie sur le toolchain C du système et sur le runtime fourni par Nacre.",
      },
    ],
    optional: {
      title: "Option --direct",
      detail:
        "Les fonctions utilisateur et main sont émises en LLVM ; le runtime et le support de bibliothèque sont compilés séparément en bitcode puis liés avec llvm-link avant l’édition de liens Clang.",
    },
  },
  sections: [
    {
      heading: "01 · Une syntaxe familière, une compilation native",
      paragraphs: [
        "Nacre est un compilateur expérimental écrit en Rust, pour un langage dont la syntaxe rappelle Java. Il ne traduit pas les programmes vers une JVM : la cible décrite est un exécutable natif Linux.",
        "Par défaut, le compilateur génère du C11 puis laisse GCC ou Clang construire l’exécutable. L’option --direct offre une autre voie : les fonctions utilisateur et main deviennent du LLVM, tandis que le runtime C est compilé à part en bitcode puis lié au module utilisateur.",
      ],
    },
    {
      heading: "02 · Possession affine et emprunts explicites",
      paragraphs: [
        "Les valeurs propriétaires ordinaires sont affines : déplacer une valeur transfère sa responsabilité de destruction. Le langage distingue les emprunts partagés des emprunts exclusifs, et le compilateur vérifie leurs conflits ainsi que les déplacements.",
        "Ce modèle n’utilise ni ramasse-miettes, ni JVM, ni comptage implicite des références. Il décrit les règles du langage, pas une garantie de sûreté générale : le runtime C fait partie du socle natif et les programmes ne sont pas sandboxés.",
      ],
    },
    {
      heading: "03 · Une bibliothèque standard et des programmes concrets",
      paragraphs: [
        "La bibliothèque standard est injectée dans les programmes. Elle comprend des collections affines, Text en UTF-8, des tampons binaires, des options et résultats, ainsi que des API pour les fichiers, processus, threads, synchronisation explicite, expressions régulières, temps et sockets TCP/UDP.",
        "Le dépôt accompagne le langage d’exemples plus complets : carnet de contacts, bureau de prêt, Sudoku, jeu de la vie et serveur HTTP. Ils illustrent notamment les collections, les emprunts et les API natives ; leur présence ne transforme pas l’alpha en version stabilisée.",
      ],
    },
    {
      heading: "04 · Un alpha Linux avec des limites assumées",
      paragraphs: [
        "Linux est la seule cible native annoncée. Le projet est pré-1.0 et ne garantit pas la compatibilité du langage ou de sa bibliothèque standard entre versions.",
        "Les paramètres de durée de vie et les itérateurs empruntés qui s’échappent ne sont pas pris en charge ; le FFI général, l’héritage de classes, l’interface graphique et l’exécution JVM ne font pas partie du langage actuel. Le dépôt précise aussi que Nacre n’est pas un bac à sable ni une certification de sécurité.",
      ],
    },
  ],
  sources: {
    label: "Code, documentation et état du développement",
    entries: [
      {
        label: "Dépôt Nacre",
        href: "https://github.com/carabistouflette/nacre",
        detail:
          "README.md : présentation, backend par défaut, mode LLVM optionnel, bibliothèque standard et exemples.",
      },
      {
        label: "Architecture et ownership",
        href: "https://github.com/carabistouflette/nacre",
        detail:
          "docs/ARCHITECTURE.md et docs/BORROWING.md : pipeline du compilateur, représentation native et règles d’emprunt.",
      },
      {
        label: "Feuille de route",
        href: "https://github.com/carabistouflette/nacre",
        detail:
          "docs/ROADMAP.md : capacités actuelles, portée expérimentale et limites connues.",
      },
    ],
  },
  homeLabel: "Retour au portfolio",
  counterpartLabel: "Read in English",
  languageLabel: "Changer de langue",
};

const nacreEn: CaseStudy = {
  title: "Nacre",
  question: "How do you compile a Java-like language without a JVM?",
  kicker: "Experimental native compiler · Rust · Linux · alpha",
  summary:
    "Nacre compiles a Java-like language into native Linux executables without a JVM. It provides two routes: C11 generation or a direct LLVM backend.",
  atGlance: {
    label: "Project details",
    entries: [
      {
        label: "Stack",
        value: "Rust · C runtime · Linux",
      },
      {
        label: "Status",
        value: "Pre-1.0 alpha · no cross-version compatibility guarantee",
      },
    ],
  },
  technicalLabel: "Examine the technical choices",
  path: "/en/projects/nacre/",
  mediaLabel: "From source to executable",
  figure: {
    kind: "diagram",
    title: "Nacre’s compilation pipeline",
    alt: "Nacre source goes through Rust analysis, then C11 and GCC or Clang by default; the direct option emits LLVM for user code and links separately compiled C support bitcode.",
    source: "README.md · docs/ARCHITECTURE.md",
    sourceHref: "https://github.com/carabistouflette/nacre",
    nodes: [
      {
        title: "Nacre source",
        detail:
          "The frontend collects files, resolves modules, and checks types, ownership and borrowing.",
      },
      {
        title: "C11 generation",
        detail:
          "The default backend generates C11 and compiles it with GCC or Clang into a native executable.",
      },
      {
        title: "Linux executable",
        detail:
          "Native compilation uses the system C toolchain and Nacre’s supplied runtime.",
      },
    ],
    optional: {
      title: "--direct option",
      detail:
        "User functions and main are emitted as LLVM; the runtime and library support are compiled separately to bitcode and linked with llvm-link before Clang links the executable.",
    },
  },
  sections: [
    {
      heading: "01 · Familiar syntax, native compilation",
      paragraphs: [
        "Nacre is an experimental compiler written in Rust for a language whose syntax is reminiscent of Java. It does not translate programs to a JVM: its stated native target is Linux executables.",
        "By default, the compiler generates C11 and lets GCC or Clang build the executable. The --direct option provides another route: user functions and main are emitted as LLVM, while the C runtime is compiled separately to bitcode and linked with the user module.",
      ],
    },
    {
      heading: "02 · Affine ownership and explicit borrowing",
      paragraphs: [
        "Ordinary owning values are affine: moving a value transfers its cleanup responsibility. The language distinguishes shared and exclusive borrows, and the compiler checks their conflicts as well as moves.",
        "This model uses no garbage collector, JVM or implicit reference counting. It describes the language rules, not a general safety guarantee: the C runtime is part of the native trusted base, and programs are not sandboxed.",
      ],
    },
    {
      heading: "03 · A standard library and working examples",
      paragraphs: [
        "The standard library is injected into programs. It includes affine collections, UTF-8 Text, binary buffers, options and results, plus APIs for files, processes, threads, explicit synchronization, regular expressions, time and TCP/UDP sockets.",
        "The repository includes fuller examples such as a contact book, lending desk, Sudoku, Game of Life and an HTTP server. They exercise collections, borrowing and native APIs; their presence does not make the alpha a stabilized release.",
      ],
    },
    {
      heading: "04 · A Linux alpha with explicit limits",
      paragraphs: [
        "Linux is the only stated native target. The project is pre-1.0 and does not guarantee language or standard-library compatibility between versions.",
        "Lifetime parameters and escaping borrowed iterators are not supported; general FFI, class inheritance, GUI applications and JVM execution are outside the current language. The repository also states that Nacre is neither a sandbox nor a security certification.",
      ],
    },
  ],
  sources: {
    label: "Code, documentation and development status",
    entries: [
      {
        label: "Nacre repository",
        href: "https://github.com/carabistouflette/nacre",
        detail:
          "README.md: overview, default backend, optional LLVM mode, standard library and examples.",
      },
      {
        label: "Architecture and ownership",
        href: "https://github.com/carabistouflette/nacre",
        detail:
          "docs/ARCHITECTURE.md and docs/BORROWING.md: compiler pipeline, native representation and borrowing rules.",
      },
      {
        label: "Roadmap",
        href: "https://github.com/carabistouflette/nacre",
        detail:
          "docs/ROADMAP.md: current capabilities, experimental scope and known limits.",
      },
    ],
  },
  homeLabel: "Back to portfolio",
  counterpartLabel: "Lire en français",
  languageLabel: "Change language",
};

export const caseStudies: Record<Locale, Record<CaseStudyId, CaseStudy>> = {
  fr: {
    genomint: genomintFr,
    meddatatrace: healthgraphbench.fr,
    sillage: sillageFr,
    nacre: nacreFr,
    "encrypted-voting": encryptedVotingFr,
  },
  en: {
    genomint: genomintEn,
    meddatatrace: healthgraphbench.en,
    sillage: sillageEn,
    nacre: nacreEn,
    "encrypted-voting": encryptedVotingEn,
  },
};
