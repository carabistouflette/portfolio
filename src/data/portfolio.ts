export type Locale = "fr" | "en";

export type ProjectId = "genomint" | "maestria" | "encrypted-voting" | "brio";
export type CaseStudyId = "genomint" | "maestria";

export interface Project {
  id: ProjectId;
  title: string;
  description: string;
  technologies: string;
  url?: string;
  linkLabel?: string;
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
  "projects" | "open-source" | "journey" | "skills" | "contact";

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
  understandLabel: string;
  technicalLabel: string;
  role: string;
  roleLabel: string;
  relatedProject?: { label: string; href: string };
  path: string;
  contextLabel: string;
  context: string;
  mediaLabel: string;
  figure: CaseStudyFigure;
  screenshots?: CaseStudyScreenshots;
  sections: CaseStudySection[];
  limitationsLabel?: string;
  limitations?: string[];
  sources?: { label: string; entries: CaseStudySource[] };
  sourcesNote?: string;
  homeLabel: string;
  counterpartLabel: string;
  languageLabel: string;
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
    cvCta: string;
    contactCta: string;
  };
  projects: {
    heading: string;
    otherHeading: string;
    entries: Project[];
  };
  openSource: {
    heading: string;
    intro: string;
    profileLink: { label: string; url: string };
    personal: string;
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
    capabilities: {
      title: string;
      claim: string;
      technologies: { name: string; projectId?: ProjectId }[];
    }[];
    catalogMoreLabel: string;
    catalogCloseLabel: string;
    projectLabel: string;
    groups: SkillGroup[];
  };
  personal: {
    heading: string;
    eyebrow: string;
    intro: string;
    photoAlt: string;
    interests: { title: string; description: string }[];
  };
  contact: {
    eyebrow?: string;
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
        "Alexis Robin — IA, systèmes logiciels et logiciel libre. GenomInt au CIRAD, recherche locale avec Maestria et contributions Rust à SteelMC.",
    },
    skipLink: "Aller au contenu principal",
    navigation: {
      primaryLabel: "Navigation principale",
      sections: {
        projects: { id: "projects", label: "Projets" },
        skills: { id: "skills", label: "Compétences" },
        journey: { id: "journey", label: "Parcours" },
        "open-source": { id: "open-source", label: "GitHub" },
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
      headline: "Étudiant en M1 à Centrale Lille",
      affiliation: "IA pour la santé · parcours MIAS",
      description:
        "Je développe des systèmes d’IA pour explorer des données et retrouver l’information utile.",
      availability: {
        label: "Recherche de stage",
        detail: "22 mars – 21 août 2027 · Montpellier ou Lille",
        note: "Alternance possible en M2 à partir de septembre 2027.",
      },
      cvCta: "Télécharger le CV",
      contactCta: "Me contacter",
    },
    projects: {
      heading: "Deux projets, deux terrains.",
      otherHeading: "Travaux complémentaires",
      entries: [
        {
          id: "genomint",
          title: "GenomInt",
          description:
            "Au CIRAD, j’ai développé l’agent IA et le backend de l’explorateur génomique : requêtes Neo4j, API et exports.",
          technologies:
            "Python · FastAPI · PostgreSQL · Neo4j · Docker · Linux",
          url: "/projets/genomint/",
          linkLabel: "Lire le dossier",
        },
        {
          id: "maestria",
          title: "Maestria",
          description:
            "Dans Brio, je contribue au lanceur Linux Maestria : recherche en Rust, ingestion vectorielle et évaluation de documents visuels.",
          technologies: "Rust · Tantivy · SQLite",
          url: "/projets/maestria/",
          linkLabel: "Lire le dossier",
        },
        {
          id: "encrypted-voting",
          title: "Vote chiffré",
          description:
            "Projet universitaire autour d’une question : comment vérifier les bulletins et compter les voix sans révéler les choix individuels ? Chiffrement El Gamal et preuves à connaissance zéro.",
          technologies: "Java · Spring · El Gamal",
        },
        {
          id: "brio",
          title: "Brio",
          description: "Site du projet, développé avec Next.js.",
          technologies: "Next.js",
          url: destinations.brio,
          linkLabel: "Visiter Brio",
        },
      ],
    },
    openSource: {
      heading: "Le travail continue sur GitHub.",
      intro:
        "Des changements proposés, discutés et intégrés. Ici, on peut suivre les projets, remonter au code et parcourir l’activité affichée sur",
      profileLink: {
        label: "mon profil GitHub.",
        url: "https://github.com/carabistouflette",
      },
      personal:
        "J’aime le logiciel libre, les sujets de recherche et trifouiller sur Linux.",
      projects: {
        heading: "Projets & communautés",
        entries: [
          {
            name: "Maestria",
            url: "https://github.com/brio-labs/maestria",
            role: "Projet personnel",
            description:
              "Dépôt public du lanceur Linux : code, documentation et benchmarks.",
          },
          {
            name: "SteelMC",
            url: "https://github.com/Steel-Foundation/SteelMC",
            role: "Contributeur",
            description:
              "Serveur Minecraft en Rust. Contributions sur le routage des paquets réseau et le durcissement de la lecture.",
          },
          {
            name: "HealthGraphBench",
            url: "https://github.com/carabistouflette/HealthGraphBench",
            role: "Projet personnel",
            description:
              "Benchmark reproductible qui évalue la valeur prédictive des graphes au-delà de baselines locales fortes, en ML de santé publique et réglementaire (FDA MAUDE, CMS).",
            zenodo: {
              label: "Expérimentation sur Zenodo",
              url: "https://zenodo.org/records/22796551",
            },
            publication:
              "Un article est en cours de rédaction, soumission à venir.",
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
      capabilities: [
        {
          title: "Agents & accès aux données",
          claim:
            "Construire le parcours d’une question en langage naturel jusqu’aux données, avec des contrôles explicites à chaque appel d’outil.",
          technologies: [
            { name: "Python", projectId: "genomint" },
            { name: "FastAPI", projectId: "genomint" },
            { name: "Neo4j", projectId: "genomint" },
            { name: "PostgreSQL", projectId: "genomint" },
            { name: "Docker", projectId: "genomint" },
            { name: "Linux", projectId: "genomint" },
          ],
        },
        {
          title: "Recherche & évaluation",
          claim:
            "Retrouver l’information pertinente (BM25, vectoriel, hybride), comparer les approches et documenter ce que les mesures ne prouvent pas.",
          technologies: [
            { name: "Rust", projectId: "maestria" },
            { name: "SQLite", projectId: "maestria" },
            { name: "SigLIP", projectId: "maestria" },
            { name: "RapidOCR", projectId: "maestria" },
          ],
        },
        {
          title: "Ingénierie & déploiement",
          claim:
            "Organiser les services, borner les coûts, automatiser la livraison et expliquer les compromis d’exploitation.",
          technologies: [
            { name: "Podman", projectId: "genomint" },
            { name: "Helm", projectId: "genomint" },
            { name: "K3s", projectId: "genomint" },
            { name: "GitLab CI/CD", projectId: "genomint" },
            { name: "GitHub Actions", projectId: "genomint" },
          ],
        },
      ],
      catalogMoreLabel: "Voir plus",
      catalogCloseLabel: "Refermer",
      projectLabel: "Voir dans le projet",
      groups: [
        {
          label: "Langages",
          description:
            "Écrire la logique, des scripts aux applications et aux systèmes.",
          items: [
            { name: "Python", projectIds: ["genomint"] },
            { name: "Rust", projectIds: ["maestria"] },
            { name: "TypeScript", projectIds: [] },
            { name: "Java", projectIds: ["encrypted-voting"] },
            { name: "C", projectIds: [] },
          ],
        },
        {
          label: "Web & interfaces",
          description:
            "Relier les interfaces, les API et les services applicatifs.",
          items: [
            { name: "Astro", projectIds: [] },
            { name: "React", projectIds: [] },
            { name: "Next.js", projectIds: ["brio"] },
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
            { name: "NumPy", projectIds: [] },
            { name: "SciPy", projectIds: [] },
            { name: "Scikit-learn", projectIds: [] },
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
            { name: "LangChain", projectIds: [] },
            { name: "Haystack", projectIds: [] },
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
            { name: "Matplotlib", projectIds: [] },
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
            { name: "SQLite", projectIds: ["maestria"] },
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
      eyebrow: "Un autre rythme",
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
      eyebrow: "Contact & opportunités",
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
        "Alexis Robin — AI, software systems and open source. GenomInt at CIRAD, local retrieval with Maestria and Rust contributions to SteelMC.",
    },
    skipLink: "Skip to main content",
    navigation: {
      primaryLabel: "Primary navigation",
      sections: {
        projects: { id: "projects", label: "Projects" },
        skills: { id: "skills", label: "Skills" },
        journey: { id: "journey", label: "Journey" },
        "open-source": { id: "open-source", label: "GitHub" },
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
      headline: "M1 student at Centrale Lille",
      affiliation: "AI for health · MIAS track",
      description:
        "I build AI systems to explore data and find useful information.",
      availability: {
        label: "Seeking an internship",
        detail: "22 March – 21 August 2027 · Montpellier or Lille",
        note: "Apprenticeship (M2) possible from September 2027.",
      },
      cvCta: "Download CV",
      contactCta: "Get in touch",
    },
    projects: {
      heading: "Two projects, two different worlds.",
      otherHeading: "Supplementary work",
      entries: [
        {
          id: "genomint",
          title: "GenomInt",
          description:
            "At CIRAD, I built the AI agent and the genomic graph explorer’s backend: Neo4j queries, APIs and exports.",
          technologies:
            "Python · FastAPI · PostgreSQL · Neo4j · Docker · Linux",
          url: "/en/projects/genomint/",
          linkLabel: "Read the case study",
        },
        {
          id: "maestria",
          title: "Maestria",
          description:
            "At Brio, I contribute to Maestria, a Linux launcher built in Rust: search, vector ingestion and visual-document evaluation.",
          technologies: "Rust · Tantivy · SQLite",
          url: "/en/projects/maestria/",
          linkLabel: "Read the case study",
        },
        {
          id: "encrypted-voting",
          title: "Encrypted voting",
          description:
            "An academic project exploring how to verify ballots and count votes without revealing individual choices, using El Gamal encryption and zero-knowledge proofs.",
          technologies: "Java · Spring · El Gamal",
        },
        {
          id: "brio",
          title: "Brio",
          description: "Project website, built with Next.js.",
          technologies: "Next.js",
          url: destinations.brio,
          linkLabel: "Visit Brio",
        },
      ],
    },
    openSource: {
      heading: "The work continues on GitHub.",
      intro:
        "Changes proposed, discussed and merged. Follow the projects, trace the code and explore the activity shown on",
      profileLink: {
        label: "my GitHub profile.",
        url: "https://github.com/carabistouflette",
      },
      personal:
        "I enjoy open source, research topics and tinkering with Linux.",
      projects: {
        heading: "Projects & communities",
        entries: [
          {
            name: "Maestria",
            url: "https://github.com/brio-labs/maestria",
            role: "Personal project",
            description:
              "Public repository for the Linux launcher: code, documentation and benchmarks.",
          },
          {
            name: "SteelMC",
            url: "https://github.com/Steel-Foundation/SteelMC",
            role: "Contributor",
            description:
              "A Minecraft server in Rust. Contributions to network packet routing and read-path hardening.",
          },
          {
            name: "HealthGraphBench",
            url: "https://github.com/carabistouflette/HealthGraphBench",
            role: "Personal project",
            description:
              "A reproducible benchmark evaluating the predictive value of graphs beyond strong local baselines, in public-health and regulatory ML (FDA MAUDE, CMS).",
            zenodo: {
              label: "Experiment on Zenodo",
              url: "https://zenodo.org/records/22796551",
            },
            publication:
              "A paper is in preparation and will be submitted soon.",
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
      capabilities: [
        {
          title: "Agents & data access",
          claim:
            "Build the path from a natural-language question to the data, with explicit controls on every tool call.",
          technologies: [
            { name: "Python", projectId: "genomint" },
            { name: "FastAPI", projectId: "genomint" },
            { name: "Neo4j", projectId: "genomint" },
            { name: "PostgreSQL", projectId: "genomint" },
            { name: "Docker", projectId: "genomint" },
            { name: "Linux", projectId: "genomint" },
          ],
        },
        {
          title: "Retrieval & evaluation",
          claim:
            "Retrieve the relevant information (BM25, vector, hybrid), compare approaches and document what measurements do not prove.",
          technologies: [
            { name: "Rust", projectId: "maestria" },
            { name: "SQLite", projectId: "maestria" },
            { name: "SigLIP", projectId: "maestria" },
            { name: "RapidOCR", projectId: "maestria" },
          ],
        },
        {
          title: "Engineering & deployment",
          claim:
            "Organize services, bound costs, automate delivery and explain operational trade-offs.",
          technologies: [
            { name: "Podman", projectId: "genomint" },
            { name: "Helm", projectId: "genomint" },
            { name: "K3s", projectId: "genomint" },
            { name: "GitLab CI/CD", projectId: "genomint" },
            { name: "GitHub Actions", projectId: "genomint" },
          ],
        },
      ],
      catalogMoreLabel: "See more",
      catalogCloseLabel: "Close",
      projectLabel: "See in project",
      groups: [
        {
          label: "Languages",
          description:
            "Write the logic, from scripts to applications and systems.",
          items: [
            { name: "Python", projectIds: ["genomint"] },
            { name: "Rust", projectIds: ["maestria"] },
            { name: "TypeScript", projectIds: [] },
            { name: "Java", projectIds: ["encrypted-voting"] },
            { name: "C", projectIds: [] },
          ],
        },
        {
          label: "Web & interfaces",
          description: "Connect interfaces, APIs and application services.",
          items: [
            { name: "Astro", projectIds: [] },
            { name: "React", projectIds: [] },
            { name: "Next.js", projectIds: ["brio"] },
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
            { name: "NumPy", projectIds: [] },
            { name: "SciPy", projectIds: [] },
            { name: "Scikit-learn", projectIds: [] },
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
            { name: "LangChain", projectIds: [] },
            { name: "Haystack", projectIds: [] },
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
            { name: "Matplotlib", projectIds: [] },
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
            { name: "SQLite", projectIds: ["maestria"] },
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
      eyebrow: "A different pace",
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
      eyebrow: "Contact & opportunities",
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
    "Sur Ganoderma, GenomInt combine dialogue et exploration du graphe. J’ai développé l’agent et le backend de l’explorateur : requêtes Neo4j et API.",
  atGlance: {
    label: "En bref",
    entries: [
      { label: "Cadre", value: "Stage CIRAD · UMR AGAP · avril–août 2026" },
      {
        label: "Ma part",
        value:
          "Agent Pi · backend de l’explorateur (requêtes Neo4j et API) · sécurité et déploiement",
      },
      {
        label: "Équipe",
        value:
          "Encadrement : Létizia Camus-Kulandaivelu · interface : Théodore de Boisseson",
      },
      {
        label: "Suite",
        value:
          "Code fermé · publication scientifique en préparation (co-auteur)",
      },
    ],
  },
  understandLabel: "Comprendre le projet",
  technicalLabel: "Examiner les choix techniques",
  role: "J’ai développé l’agent et le backend du GKG Explorer : requêtes Neo4j, API, parcours et exports. J’ai aussi travaillé sur la sécurité et le déploiement. Théodore de Boisseson a porté l’interface ; nous avons partagé les contrats d’API et l’intégration.",
  roleLabel: "Périmètre personnel",
  path: "/projets/genomint/",
  contextLabel: "Contexte et périmètre",
  context:
    "Le graphe Neo4j relie génomes, pangènes, transcrits et annotations pour étudier la pathogénie de Ganoderma. L’enjeu : rendre ces données interrogeables par les biologistes.",
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
      heading: "01 · Séparer dialogue et exécution",
      paragraphs: [
        "core-ai gère identité, sessions PostgreSQL et flux SSE ; Pi exécute l’agent et ses outils ; back-gkg sert les données du graphe.",
        "Le pont JSONL-RPC corrèle les requêtes et relaie les événements. Si la conversation ne peut pas être persistée, Pi est arrêté : aucune session orpheline.",
      ],
      points: [
        {
          label: "Compromis",
          detail:
            "Sur le VPS, Pi tourne en sous-processus : déploiement plus simple, isolation moindre et pas de reprise automatique entre réplicas.",
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
  limitationsLabel: "Ce que montrent les captures",
  limitations: [
    "Des écrans de l’interface et une requête en cours, pas un benchmark ni une validation biologique.",
    "Les contrôles Cypher ne remplacent pas un audit des privilèges Neo4j.",
    "Mémoire maximale et reprise d’un flux interrompu non mesurées.",
  ],
  sourcesNote:
    "Rapport de stage non public : diffusion soumise à l’accord du CIRAD.",
  homeLabel: "Retour au portfolio",
  counterpartLabel: "Read in English",
  languageLabel: "Changer de langue",
};

const genomintEn: CaseStudy = {
  title: "GenomInt",
  question: "Query a genomic graph without writing Cypher.",
  kicker: "CIRAD · 2026 internship · agentic genomics graph workbench",
  summary:
    "For Ganoderma, GenomInt combines dialogue with graph exploration. I built the agent and the explorer’s backend: Neo4j queries and APIs.",
  atGlance: {
    label: "At a glance",
    entries: [
      {
        label: "Setting",
        value: "CIRAD internship · UMR AGAP · April–August 2026",
      },
      {
        label: "My work",
        value:
          "Pi agent · graph explorer backend (Neo4j queries and APIs) · security and deployment",
      },
      {
        label: "Team",
        value:
          "Supervisor: Létizia Camus-Kulandaivelu · interface: Théodore de Boisseson",
      },
      {
        label: "Next",
        value: "Closed code · research paper in preparation (co-author)",
      },
    ],
  },
  understandLabel: "Understand the project",
  technicalLabel: "Examine the technical choices",
  role: "I built the agent and the GKG Explorer backend: Neo4j queries, APIs, traversals and exports. I also worked on security and deployment. Théodore de Boisseson led the interface; we shared API contracts and integration.",
  roleLabel: "Personal scope",
  path: "/en/projects/genomint/",
  contextLabel: "Context and scope",
  context:
    "The Neo4j graph connects genomes, pangenes, transcripts and annotations to study Ganoderma pathogenicity. The goal: let biologists query this data directly.",
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
      heading: "01 · Separate dialogue from execution",
      paragraphs: [
        "core-ai handles identity, PostgreSQL sessions and SSE streaming; Pi runs the agent and its tools; back-gkg serves graph data.",
        "The JSONL-RPC bridge correlates requests and forwards events. If the conversation cannot be persisted, Pi stops: no orphan session.",
      ],
      points: [
        {
          label: "Trade-off",
          detail:
            "On the VPS, Pi runs as a subprocess: simpler deployment, less isolation and no automatic resumption across replicas.",
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
  limitationsLabel: "What the screenshots show",
  limitations: [
    "Interface views and an in-progress query, not a benchmark or biological validation.",
    "Cypher controls do not replace a Neo4j privilege audit.",
    "Peak memory and recovery from an interrupted stream remain unmeasured.",
  ],
  sourcesNote:
    "Internship report not public: release subject to CIRAD approval.",
  homeLabel: "Back to portfolio",
  counterpartLabel: "Lire en français",
  languageLabel: "Change language",
};

const maestriaFr: CaseStudy = {
  title: "Maestria",
  question: "Un lanceur Linux, ancré dans vos fichiers.",
  kicker: "Rust · lanceur Linux · open source",
  summary:
    "Maestria est un lanceur Linux open source qui ouvre, calcule, exécute et, surtout, cherche vraiment dans vos fichiers : recherche lexicale et sémantique en local, avec les preuves attachées. Dans le cadre de Brio, je contribue au moteur de recherche, à l’ingestion vectorielle et à l’évaluation des documents visuels.",
  atGlance: {
    label: "Le projet en bref",
    entries: [
      { label: "Contexte", value: "Projet Brio · open source · Linux-first" },
      { label: "Depuis", value: "2026" },
      {
        label: "Ma part",
        value:
          "Moteur de recherche, ingestion vectorielle, évaluation des documents visuels",
      },
      { label: "Socle", value: "Rust · Tantivy · SQLite · ONNX Runtime" },
      { label: "État", value: "Lanceur natif en service · Studio retiré" },
    ],
  },
  understandLabel: "Comprendre le projet",
  technicalLabel: "Examiner les choix techniques",
  role: "Je travaille sur le moteur de recherche, l’ingestion vectorielle et l’évaluation des documents visuels. La recherche est le cœur du produit : c’est elle qui décide si le lanceur est bon.",
  roleLabel: "Mon travail",
  relatedProject: {
    label: "Dans le cadre du projet Brio",
    href: destinations.brio,
  },
  path: "/projets/maestria/",
  contextLabel: "La place de Maestria dans Brio",
  context:
    "Brio explore l’orchestration d’agents IA ; Maestria en est le volet local. Le projet a démarré par le socle de recherche : indexation, retrieval, preuves, et une interface web pour l’interroger. Cette interface a disparu : le lanceur natif l’a remplacée. Le daemon garde l’autorité sur les sources et les preuves ; les workflows avancés (tâches, mémoire) vivent au-dessus du socle.",
  figure: {
    kind: "diagram",
    title: "La boucle du lanceur",
    alt: "Trois étapes : invoquer le lanceur et taper une requête, chercher localement, exécuter le résultat choisi.",
    source: "github.com/brio-labs/maestria",
    sourceHref: "https://github.com/brio-labs/maestria",
    nodes: [
      {
        title: "Invoquer & taper",
        detail:
          "Un raccourci, une requête : fichiers, applications, commandes.",
      },
      {
        title: "Chercher localement",
        detail:
          "Recherche lexicale et vectorielle sur les fichiers indexés, extraits reliés à leur source.",
      },
      {
        title: "Exécuter",
        detail: "Ouvrir, copier, lancer, un résultat à la fois.",
      },
    ],
  },
  mediaLabel: "Le lanceur en pratique",
  sections: [
    {
      heading: "01 · Un lanceur, d’abord",
      paragraphs: [
        "Le produit tient dans une boucle : un raccourci, une requête, un choix, une action exécutée. Le lanceur ouvre des applications, expose les commandes enregistrées, fait de l’arithmétique et cherche dans les noms, les chemins et le contenu des fichiers. Les extensions ajoutent leurs commandes et leurs résultats à la même liste. « Commande » veut dire action enregistrée, jamais l’évaluation du shell de ce qu’on tape.",
        "L’interface web qui servait à interroger le moteur a disparu : le lanceur l’a rendue inutile. Ce qui reste, c’est la partie difficile. Retrouver le bon passage dans vos fichiers, localement, sans rien envoyer à personne.",
      ],
    },
    {
      heading: "02 · Une recherche qui rend ses preuves",
      paragraphs: [
        "Tout part de racines de lecture approuvées : l’instance n’indexe que ce qu’on lui concède. Chaque extrait reste relié à sa preuve : fichier et position ; page et région pour un PDF scanné.",
        "La voie lexicale (Tantivy) et la voie sémantique dense travaillent côte à côte. La CLI sait chercher, expliquer une recherche, ouvrir la preuve d’un résultat et rejouer son exécution. Le daemon encadre le tout : profils read-only ou trusted-workspace, reprise après interruption, journal d’événements durable. Sans OCR ou sans embeddings visuels, la capacité se déclare indisponible : le texte n’est jamais inventé.",
      ],
    },
    {
      heading: "03 · Un moteur plus simple",
      paragraphs: [
        "Le moteur traînait une façade asynchrone héritée d’une itération passée : une couche entière à lire et à maintenir, sans bénéfice, alors que les voies de recherche travaillent déjà en parallèle avec une concurrence bornée. Je l’ai remplacée par des interfaces synchrones. Le daemon reste le seul endroit où ce travail bloquant est encadré.",
        "Dans la CLI, une recherche dit si elle vient du daemon ou d’une exécution locale : on sait ce qu’on observe.",
      ],
    },
    {
      heading: "04 · Ingérer par document",
      paragraphs: [
        "L’indexation vectorielle créait un effet par fragment de texte : des dizaines d’écritures pour un seul fichier. Le travail est regroupé à l’échelle du document : un appel d’embedding par lot, une mise à jour de projection, un état d’attente rejouable après interruption.",
        "Les contrôles restent : l’identité de la génération est vérifiée, la réponse du fournisseur doit correspondre aux fragments demandés. Sur le jeu d’essai interne, l’ingestion dense est passée de 81,8 s à 40,6 s, deux fois plus vite.",
      ],
    },
    {
      heading: "05 · Mesurer avant d’activer",
      paragraphs: [
        "Pour les documents visuels, PDF scannés et captures, j’ai construit un banc d’évaluation qui fait réellement tourner SigLIP et RapidOCR, puis corrigé la sortie ONNX retenue et le recadrage des régions de page. Évaluer la bonne région compte autant que brancher un modèle.",
        "L’inférence CPU est plus rapide, mais quatre cas sur six dépassent le budget de bout en bout : la voie reste expérimentale. La voie dense, elle, n’a été activée qu’après un benchmark : six classes de requêtes, énergie mesurée, enregistrement de promotion lié au hash du rapport.",
        "La late interaction n’a pas convaincu. Ses résultats négatifs sont archivés dans le dépôt plutôt que d’ajouter un index dont personne ne veut.",
      ],
    },
  ],
  sources: {
    label: "Projet, code et docs",
    entries: [
      {
        label: "Brio · orchestration d’agents",
        href: destinations.brio,
        detail: "Le projet dans lequel s’inscrit Maestria.",
      },
      {
        label: "Dépôt Maestria",
        href: "https://github.com/brio-labs/maestria",
        detail: "README, code et historique publics.",
      },
      {
        label: "Journal de développement",
        href: "https://github.com/brio-labs/maestria/blob/main/CHANGELOG.md",
        detail: "Un log roulant, sans releases : main est le build courant.",
      },
      {
        label: "Recherche & benchmarks",
        href: "https://github.com/brio-labs/maestria/blob/main/docs/RESEARCH.md",
        detail: "Protocoles d’évaluation et profils de modèles locaux.",
      },
      {
        label: "Architecture",
        href: "https://github.com/brio-labs/maestria/blob/main/docs/ARCHITECTURE.md",
        detail: "Daemon, gouvernance, journal d’événements.",
      },
    ],
  },
  homeLabel: "Retour au portfolio",
  counterpartLabel: "Read in English",
  languageLabel: "Changer de langue",
};

const maestriaEn: CaseStudy = {
  title: "Maestria",
  question: "A Linux launcher, rooted in your files.",
  kicker: "Rust · Linux launcher · open source",
  summary:
    "Maestria is an open-source Linux launcher that opens, calculates, executes and, above all, really searches your files: lexical and semantic search, local, with evidence attached. As part of Brio, I work on the search engine, vector ingestion and visual-document evaluation.",
  atGlance: {
    label: "The project at a glance",
    entries: [
      { label: "Context", value: "Brio project · open source · Linux-first" },
      { label: "Since", value: "2026" },
      {
        label: "My part",
        value: "Search engine, vector ingestion, visual-document evaluation",
      },
      { label: "Stack", value: "Rust · Tantivy · SQLite · ONNX Runtime" },
      { label: "Status", value: "Native launcher shipped · Studio retired" },
    ],
  },
  understandLabel: "Understand the project",
  technicalLabel: "Examine the technical choices",
  role: "I work on the search engine, vector ingestion and visual-document evaluation. Search is the heart of the product: it decides whether the launcher is any good.",
  roleLabel: "My work",
  relatedProject: {
    label: "Part of the Brio project",
    href: destinations.brio,
  },
  path: "/en/projects/maestria/",
  contextLabel: "Maestria within Brio",
  context:
    "Brio explores AI agent orchestration; Maestria is its local pillar. The project started with the search backbone: indexing, retrieval, evidence, and a web interface to query it. That interface is gone: the native launcher replaced it. The daemon keeps authority over sources and evidence; advanced workflows (tasks, memory) live above the backbone.",
  figure: {
    kind: "diagram",
    title: "The launcher loop",
    alt: "Three steps: invoke the launcher and type a query, search locally, execute the chosen result.",
    source: "github.com/brio-labs/maestria",
    sourceHref: "https://github.com/brio-labs/maestria",
    nodes: [
      {
        title: "Invoke & type",
        detail: "One shortcut, one query: files, apps, commands.",
      },
      {
        title: "Search locally",
        detail:
          "Lexical and vector search over indexed files, excerpts linked to their source.",
      },
      {
        title: "Execute",
        detail: "Open, copy, run, one result at a time.",
      },
    ],
  },
  mediaLabel: "The launcher in practice",
  sections: [
    {
      heading: "01 · A launcher first",
      paragraphs: [
        "The product fits in one loop: a shortcut, a query, a choice, an action executed. The launcher opens applications, exposes registered commands, does arithmetic and searches file names, paths and content. Extensions add their commands and results to the same list. A “command” means a registered action, never shell-evaluating what you type.",
        "The web interface that used to query the engine is gone: the launcher made it pointless. What remains is the hard part. Finding the right passage in your files, locally, without sending anything to anyone.",
      ],
    },
    {
      heading: "02 · A search that hands over its evidence",
      paragraphs: [
        "Everything starts from approved read roots: the instance only indexes what you grant. Every excerpt stays linked to its evidence: file and position; page and region for a scanned PDF.",
        "The lexical lane (Tantivy) and the dense semantic lane work side by side. The CLI can search, explain a query, open a result’s evidence and replay its execution. The daemon frames it all: read-only or trusted-workspace profiles, resumption after interruption, a durable event journal. Without OCR or visual embeddings, the capability reports itself unavailable: text is never invented.",
      ],
    },
    {
      heading: "03 · A simpler engine",
      paragraphs: [
        "The engine carried an asynchronous façade inherited from an earlier iteration: a whole layer to read and maintain, for no benefit, while the retrieval lanes already run in parallel with bounded concurrency. I replaced it with synchronous interfaces. The daemon remains the only place where this blocking work is contained.",
        "In the CLI, a search says whether the daemon served it or it ran locally: you know what you are looking at.",
      ],
    },
    {
      heading: "04 · Ingest by document",
      paragraphs: [
        "Vector indexing used to create one effect per text chunk: dozens of writes for a single file. Work is grouped at the document level: one batched embedding call, one projection update, pending state that can be replayed after an interruption.",
        "The controls stay: the generation identity is checked, the provider response must match the requested chunks. On the internal test set, dense ingestion went from 81.8 s to 40.6 s, twice as fast.",
      ],
    },
    {
      heading: "05 · Measure before enabling",
      paragraphs: [
        "For visual documents, scanned PDFs and screenshots, I built an evaluation harness that actually runs SigLIP and RapidOCR, then fixed the selected ONNX output and page-region cropping. Evaluating the right region matters as much as wiring a model.",
        "CPU inference is faster, but four cases out of six exceed the end-to-end budget: the lane stays experimental. The dense lane, meanwhile, was only enabled after a benchmark: six query classes, measured energy, a promotion record bound to the report hash.",
        "Late interaction did not convince. Its negative results are archived in the repository rather than adding an index nobody wants.",
      ],
    },
  ],
  sources: {
    label: "Project, code and docs",
    entries: [
      {
        label: "Brio · agent orchestration",
        href: destinations.brio,
        detail: "The project Maestria belongs to.",
      },
      {
        label: "Maestria repository",
        href: "https://github.com/brio-labs/maestria",
        detail: "Public README, code and history.",
      },
      {
        label: "Development journal",
        href: "https://github.com/brio-labs/maestria/blob/main/CHANGELOG.md",
        detail: "A rolling log, no releases: main is the current build.",
      },
      {
        label: "Research & benchmarks",
        href: "https://github.com/brio-labs/maestria/blob/main/docs/RESEARCH.md",
        detail: "Evaluation protocols and local model profiles.",
      },
      {
        label: "Architecture",
        href: "https://github.com/brio-labs/maestria/blob/main/docs/ARCHITECTURE.md",
        detail: "Daemon, governance, event journal.",
      },
    ],
  },
  homeLabel: "Back to portfolio",
  counterpartLabel: "Lire en français",
  languageLabel: "Change language",
};

export const caseStudies: Record<Locale, Record<CaseStudyId, CaseStudy>> = {
  fr: { genomint: genomintFr, maestria: maestriaFr },
  en: { genomint: genomintEn, maestria: maestriaEn },
};
