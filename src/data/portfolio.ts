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

export type JourneyPoint = "2023" | "2024" | "2025" | "2026-but" | "2026-master" | "2027" | "2028";

export interface JourneyEntry {
  kind: "education" | "experience";
  title: string;
  subtitle: string;
  period: string;
  start: JourneyPoint;
  end?: JourneyPoint;
  detail?: string;
  projectId?: ProjectId;
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

export type SectionId = "projects" | "open-source" | "journey" | "skills" | "contact";

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
  caption: string;
  source: string;
  src?: string;
  nodes?: { title: string; detail: string }[];
  optional?: { title: string; detail: string };
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
  figure: CaseStudyFigure;
  sections: CaseStudySection[];
  limitationsLabel: string;
  limitations: string[];
  sourcesLabel: string;
  sources: CaseStudySource[];
  sourcesNote?: string;
  homeLabel: string;
  counterpartLabel: string;
  counterpartPath: string;
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
    description: string;
    availability: { label: string; detail: string; note: string };
    academic: string;
    projectsCta: string;
    cvCta: string;
    contactCta: string;
    motionToggle: string;
  };
  projects: {
    heading: string;
    otherHeading: string;
    entries: Project[];
  };
  openSource: {
    heading: string;
    intro: string;
    personal: string;
    profileLabel: string;
    profileUrl: string;
    selectedContributions: { title: string; url: string; state: string; problem: string; change: string }[];
    github: {
      eyebrow: string;
      exploreLabel: string;
      pageTitle: string;
      homeLabel: string;
      latestHeading: string;
      scopeLabel: string;
      scopes: Record<"recent" | "external" | "open", { label: string; description: string }>;
      states: Record<"open" | "merged" | "closed" | "draft", string>;
      relationships: Record<"personal" | "organization" | "external", string>;
      createdLabel: string;
      updatedLabel: string;
      mergedLabel: string;
      discussionLabel: string;
      filesLabel: string;
      commitsLabel: string;
      allPRLabel: string;
      emptyPRLabel: string;
      openCountLabel: string;
      mergedCountLabel: string;
      snapshotLabel: string;
      refreshLabel: string;
      refreshingLabel: string;
      refreshedLabel: string;
      cachedLabel: string;
      staleLabel: string;
      updateFailedLabel: string;
      refreshPolicy: string;
      methodHeading: string;
      methodParagraphs: string[];
      sourceLabel: string;
      calendar: {
        heading: string;
        intro: string;
        viewLabel: string;
        yearLabel: string;
        monthLabel: string;
        monthPickerLabel: string;
        previousLabel: string;
        nextLabel: string;
        lessLabel: string;
        moreLabel: string;
        daySingular: string;
        dayPlural: string;
        zeroDayLabel: string;
        inspectLabel: string;
        selectionLabel: string;
        navigationHint: string;
        activeDaysLabel: string;
        totalLabel: string;
        lastActiveLabel: string;
        noActivityLabel: string;
      };
    };
  };
  journey: {
    heading: string;
    intro: string;
    scaleNote: string;
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
    instruction: string;
    capabilities: { title: string; claim: string; technologies: { name: string; projectId?: ProjectId }[] }[];
    catalogHeading: string;
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
    description: string;
    email: string;
    linkedin: string;
    linkedinDescription: string;
    cv: string;
    cvDescription: string;
  };
}

export const destinations = {
  email: "mailto:arobin9999@gmail.com",
  linkedin: "https://www.linkedin.com/in/alexis-robin-41703a2ab/",
  brio: "https://brio.build/",
  cv: "/cv/Alexis-Robin-CV-2026.pdf",
} as const;

export const portfolio: Record<Locale, PortfolioContent> = {
  fr: {
    meta: {
      title: "Alexis Robin — IA & systèmes logiciels",
      description:
        "Alexis Robin — IA, systèmes logiciels et logiciel libre. GenomInt au CIRAD, recherche locale avec Maestria et contributions Rust à SteelMC.",
    },
    skipLink: "Aller au contenu principal",
    navigation: {
      primaryLabel: "Navigation principale",
      sections: {
        projects: { id: "projects", label: "Projets" },
        "open-source": { id: "open-source", label: "GitHub" },
        journey: { id: "journey", label: "Parcours" },
        skills: { id: "skills", label: "Compétences" },
        contact: { id: "contact", label: "Contact" },
      },
    },
    localeLabel: "Choisir la langue",
    localeSwitch: {
      fr: "FR",
      en: "EN",
    },
    hero: {
      eyebrow: "IA & systèmes logiciels",
      summaryTitle: "Sous le nom de carabistouflette",
      title: "Alexis Robin",
      headline: "Agents IA & systèmes de données",
      description:
        "Je développe des systèmes d’IA pour explorer des données et retrouver l’information utile.",
      availability: {
        label: "Recherche de stage",
        detail: "22 mars – 21 août 2027 · Montpellier ou Lille",
        note: "Alternance possible en M2 à partir de septembre 2027.",
      },
      academic: "Master MIAS · IA pour la santé · Centrale Lille",
      projectsCta: "Voir mes réalisations",
      cvCta: "Télécharger le CV",
      contactCta: "Me contacter",
      motionToggle: "Pause de l’animation",
    },
    projects: {
      heading: "Deux projets, deux terrains.",
      otherHeading: "Travaux complémentaires",
      entries: [
        {
          id: "genomint",
          title: "GenomInt",
          description:
            "Au CIRAD, j’ai relié des agents IA à un graphe de données génomiques. Mon travail : l’orchestration, les services Python et l’accès aux données.",
          technologies: "Python · FastAPI · PostgreSQL · Neo4j · Docker · Linux",
          url: "/projets/genomint/",
          linkLabel: "Lire le dossier",
        },
        {
          id: "maestria",
          title: "Maestria",
          description:
            "Dans le cadre de Brio, je contribue à ce runtime Rust qui relie fichiers locaux, recherche, mémoire et tâches. Mon travail porte notamment sur le moteur, l’ingestion vectorielle et l’évaluation des documents visuels.",
          technologies: "Rust · Tantivy · SQLite · Dioxus",
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
          description: "Le projet d’orchestration d’agents IA dans lequel s’inscrit Maestria. J’en développe aussi le site avec Next.js.",
          technologies: "Next.js",
          url: destinations.brio,
          linkLabel: "Visiter Brio",
        },
      ],
    },
    openSource: {
      heading: "Le travail continue sur GitHub.",
      intro: "Des changements proposés, discutés et intégrés. Ici, on peut suivre les projets, remonter au code et parcourir l’activité affichée sur mon profil.",
      personal: "Python en autodidacte, puis C et Rust en explorant Linux. J’aime le logiciel libre.",
      profileLabel: "carabistouflette sur GitHub",
      profileUrl: "https://github.com/carabistouflette",
      selectedContributions: [
        {
          title: "Résultat négatif : late-interaction",
          url: "https://github.com/brio-labs/maestria/pull/511",
          state: "Fusionnée · brio-labs/maestria",
          problem: "Une voie de recherche séduisante sur le papier : mieux classer les passages pour les agents.",
          change: "Les mesures ne l’ont pas justifiée : pas de nouvel index introduit, les résultats négatifs sont archivés et consultables dans la PR.",
        },
        {
          title: "Ingestion vectorielle à l’échelle du document",
          url: "https://github.com/brio-labs/maestria/pull/485",
          state: "Fusionnée · brio-labs/maestria",
          problem: "L’indexation créait un effet par fragment : échanges et écritures multipliés, état difficile à rejouer.",
          change: "Le travail est regroupé par document : un appel d’embedding par lot, un état rejouable, des contrôles de cohérence conservés.",
        },
        {
          title: "Moteur de recherche : interfaces synchrones",
          url: "https://github.com/brio-labs/maestria/pull/501",
          state: "Fusionnée · brio-labs/maestria",
          problem: "Une façade asynchrone imposait une complexité que le travail réel n’exigeait pas.",
          change: "Des interfaces synchrones adaptées au travail exécuté, un parallélisme sur threads à concurrence bornée, une frontière explicite côté daemon.",
        },
      ],
      github: {
        eyebrow: "Contributions & activité",
        exploreLabel: "Explorer mon activité GitHub",
        pageTitle: "Contributions & activité GitHub",
        homeLabel: "Retour au portfolio",
        latestHeading: "Les dernières contributions",
        scopeLabel: "Contributions à afficher",
        scopes: {
          recent: { label: "Les plus récentes", description: "Les trois dernières pull requests publiques que j’ai ouvertes, tous statuts confondus, par date de création." },
          external: { label: "Hors dépôts personnels", description: "Les trois dernières PR hors de mes dépôts personnels. Les projets d’organisations auxquelles je participe sont inclus et distingués." },
          open: { label: "En cours", description: "Jusqu’à trois PR encore ouvertes, triées par dernière mise à jour. Les brouillons sont indiqués." },
        },
        states: { open: "Ouverte", merged: "Fusionnée", closed: "Fermée sans fusion", draft: "Brouillon" },
        relationships: { personal: "Dépôt personnel", organization: "Membre / propriétaire de l’organisation", external: "Autre dépôt" },
        createdLabel: "Ouverte le",
        updatedLabel: "Actualisée le",
        mergedLabel: "Fusionnée le",
        discussionLabel: "Discussion",
        filesLabel: "Fichiers modifiés",
        commitsLabel: "Commits",
        allPRLabel: "Toutes mes PR publiques",
        emptyPRLabel: "Aucune pull request publique dans cette sélection.",
        openCountLabel: "PR publiques ouvertes",
        mergedCountLabel: "PR publiques fusionnées",
        snapshotLabel: "Données synchronisées le",
        refreshLabel: "Actualiser",
        refreshingLabel: "Récupération du dernier instantané…",
        refreshedLabel: "Dernier instantané récupéré.",
        cachedLabel: "Instantané conservé dans ce navigateur.",
        staleLabel: "Cet instantané date de plus de 36 heures. GitHub peut afficher une activité plus récente.",
        updateFailedLabel: "La vérification en ligne est indisponible. Les données datées restent consultables.",
        refreshPolicy: "Synchronisation horaire prévue via GitHub Actions. Le calendrier suit les délais de comptabilisation de GitHub.",
        methodHeading: "Ce que montrent ces données",
        methodParagraphs: [
          "Les PR viennent de l’API publique GitHub et sont attribuées à carabistouflette. Une PR sur un dépôt personnel n’est pas présentée comme une contribution à un projet tiers. L’association à une organisation est celle indiquée par GitHub sur la PR.",
          "Le calendrier reproduit les contributions comptabilisées sur le profil public, pas tous les événements GitHub. Selon les réglages du profil, il peut inclure des nombres anonymisés de contributions privées ; aucun contenu privé n’est récupéré.",
          "Une case vide signifie qu’aucune contribution n’est comptabilisée ce jour-là. Ce n’est pas une mesure du temps de travail ni de la productivité. Les journées absentes des données ne sont pas inventées.",
          "Les totaux de PR ouvertes et fusionnées portent sur l’ensemble des PR publiques du compte. Les chiffres du calendrier portent uniquement sur la période affichée.",
        ],
        sourceLabel: "Comprendre le calendrier GitHub",
        calendar: {
          heading: "Au fil des jours",
          intro: "Une année d’activité telle que GitHub la comptabilise. Sélectionnez une journée pour en retrouver la trace.",
          viewLabel: "Vue du calendrier",
          yearLabel: "Année",
          monthLabel: "Mois",
          monthPickerLabel: "Mois à afficher",
          previousLabel: "Mois précédent",
          nextLabel: "Mois suivant",
          lessLabel: "Moins",
          moreLabel: "Plus",
          daySingular: "{date} · {count} contribution",
          dayPlural: "{date} · {count} contributions",
          zeroDayLabel: "{date} · aucune contribution comptabilisée",
          inspectLabel: "Voir cette journée sur GitHub",
          selectionLabel: "Journée sélectionnée",
          navigationHint: "Au clavier : flèches pour changer de jour, Début / Fin pour parcourir une ligne.",
          activeDaysLabel: "Jours avec contributions",
          totalLabel: "Contributions sur la période",
          lastActiveLabel: "Dernier jour avec contribution",
          noActivityLabel: "Aucune sur cette période",
        },
      },
    },
    journey: {
      heading: "Expérience & formation",
      intro: "Du développement full-stack à l’IA appliquée, en parallèle de ma formation en informatique.",
      scaleNote: "En 2026, le stage CIRAD fait partie du BUT et précède l’entrée en master. Les espacements de la frise sont schématiques.",
      labels: { education: "Formation", experience: "Expérience" },
      invitation: {
        title: "Vous ?",
        description: "Je cherche un stage du 22 mars au 21 août 2027, à Montpellier ou Lille. Une alternance en M2 est également possible à partir de septembre 2027.",
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
        },
        {
          kind: "experience",
          title: "CIRAD",
          subtitle: "Stage agentique / RAG",
          period: "Avril–août 2026",
          start: "2026-but",
          detail: "Stage de BUT · recherche en agronomie · projet GenomInt.",
          projectId: "genomint",
        },
        {
          kind: "experience",
          title: "SMAG",
          subtitle: "Stage full-stack",
          period: "Février–mai 2025",
          start: "2025",
          detail: "Outils de traitement CSV : import, jointures et export pour les équipes d’agriculture digitale.",
        },
        {
          kind: "education",
          title: "BUT Informatique",
          subtitle: "Montpellier",
          period: "2023–2026",
          start: "2023",
          end: "2026-master",
          detail: "Déploiement et sécurisation des réseaux informatiques",
        },
      ],
    },
    skills: {
      heading: "Compétences démontrées",
      instruction:
        "Trois domaines structurent ce que je construis. Chaque technologie renvoie au projet où elle a servi. Le catalogue complet reste consultable ci-dessous, regroupé par usage.",
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
      catalogHeading: "Le catalogue complet",
      projectLabel: "Voir dans le projet",
      groups: [
        { label: "Langages", description: "Écrire la logique, des scripts aux applications et aux systèmes.", items: [
          { name: "Python", projectIds: ["genomint"] },
          { name: "Rust", projectIds: ["maestria"] },
          { name: "TypeScript", projectIds: [] },
          { name: "Java", projectIds: ["encrypted-voting"] },
          { name: "C", projectIds: [] },
        ] },
        { label: "Web & interfaces", description: "Relier les interfaces, les API et les services applicatifs.", items: [
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
        ] },
        { label: "Données & analyse", description: "Préparer les datasets, transformer les tableaux et explorer les données.", items: [
          { name: "Polars", projectIds: [] },
          { name: "Pandas", projectIds: [] },
          { name: "Datasets", projectIds: [] },
          { name: "NumPy", projectIds: [] },
          { name: "SciPy", projectIds: [] },
          { name: "Scikit-learn", projectIds: [] },
        ] },
        { label: "IA & fine-tuning", description: "Adapter les modèles, préparer les tokens et optimiser l’inférence.", items: [
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
        ] },
        { label: "Entraînement & suivi", description: "Exécuter les entraînements, comparer les expériences et suivre les métriques.", items: [
          { name: "Accelerate", projectIds: [] },
          { name: "PyTorch Lightning", projectIds: [] },
          { name: "Weights & Biases", projectIds: [] },
          { name: "DeepSpeed", projectIds: [] },
          { name: "TensorBoard", projectIds: [] },
          { name: "MLflow", projectIds: [] },
          { name: "Optuna", projectIds: [] },
        ] },
        { label: "Visualisation", description: "Lire les distributions, visualiser les résultats et construire des graphiques interactifs.", items: [
          { name: "Matplotlib", projectIds: [] },
          { name: "Seaborn", projectIds: [] },
          { name: "Plotly", projectIds: [] },
          { name: "Altair", projectIds: [] },
        ] },
        { label: "Bases de données", description: "Organiser les données, du relationnel aux documents et aux graphes.", items: [
          { name: "PostgreSQL", projectIds: ["genomint"] },
          { name: "MySQL", projectIds: [] },
          { name: "MariaDB", projectIds: [] },
          { name: "SQLite", projectIds: ["maestria"] },
          { name: "MongoDB", projectIds: [] },
          { name: "Cassandra", projectIds: [] },
          { name: "Neo4j", projectIds: ["genomint"] },
        ] },
        { label: "Systèmes & déploiement", description: "Construire, automatiser et faire communiquer les services.", items: [
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
        ] },
        { label: "Sécurité & réseau", description: "Explorer les environnements, les échanges réseau et leur sécurité.", items: [
          { name: "Linux", projectIds: ["genomint"] },
          { name: "Nmap", projectIds: [] },
          { name: "Cisco Packet Tracer", projectIds: [] },
          { name: "OpenSSL", projectIds: [] },
          { name: "Wireshark", projectIds: [] },
          { name: "ZAP Proxy", projectIds: [] },
        ] },
      ],
    },
    personal: {
      heading: "Et loin du clavier ?",
      eyebrow: "Un autre rythme",
      intro: "Je suis originaire de Montpellier. Loin du code, je fais de la randonnée en montagne et de la photographie. J’aime aussi le VTT et les voyages.",
      photoAlt: "Un ruisseau descend entre les rochers d’une forêt de conifères, dans la brume éclairée par le soleil.",
      interests: [
        { title: "Écrire & imaginer", description: "J’écris des histoires. La lecture et la philosophie font aussi partie de mes centres d’intérêt." },
        { title: "Bricoler & partager", description: "Je bricole des PC, des Raspberry Pi et de l’électronique. Et j’aime les jeux de société." },
      ],
    },
    contact: {
      description: "Quelques lignes suffisent : le contexte, votre objectif et ce que vous aimeriez construire.",
      email: "arobin9999@gmail.com",
      linkedin: "LinkedIn",
      linkedinDescription: "Parcours professionnel & réseau",
      cv: "Télécharger le CV",
      cvDescription: "Formation & expériences · PDF en français",
    },
  },
  en: {
    meta: {
      title: "Alexis Robin — AI & software systems",
      description:
        "Alexis Robin — AI, software systems and open source. GenomInt at CIRAD, local retrieval with Maestria and Rust contributions to SteelMC.",
    },
    skipLink: "Skip to main content",
    navigation: {
      primaryLabel: "Primary navigation",
      sections: {
        projects: { id: "projects", label: "Projects" },
        "open-source": { id: "open-source", label: "GitHub" },
        journey: { id: "journey", label: "Journey" },
        skills: { id: "skills", label: "Skills" },
        contact: { id: "contact", label: "Contact" },
      },
    },
    localeLabel: "Choose language",
    localeSwitch: {
      fr: "FR",
      en: "EN",
    },
    hero: {
      eyebrow: "AI & software systems",
      summaryTitle: "Under the name carabistouflette",
      title: "Alexis Robin",
      headline: "AI agents & data systems",
      description:
        "I build AI systems to explore data and find useful information.",
      availability: {
        label: "Seeking an internship",
        detail: "22 March – 21 August 2027 · Montpellier or Lille",
        note: "Apprenticeship (M2) possible from September 2027.",
      },
      academic: "MIAS master’s in AI for health · Centrale Lille",
      projectsCta: "See the work",
      cvCta: "Download CV",
      contactCta: "Get in touch",
      motionToggle: "Pause animation",
    },
    projects: {
      heading: "Two projects, two different worlds.",
      otherHeading: "Supplementary work",
      entries: [
        {
          id: "genomint",
          title: "GenomInt",
          description:
            "At CIRAD, I connected AI agents to a genomic knowledge graph. My work covered orchestration, Python services and data access.",
          technologies: "Python · FastAPI · PostgreSQL · Neo4j · Docker · Linux",
          url: "/en/projects/genomint/",
          linkLabel: "Read the case study",
        },
        {
          id: "maestria",
          title: "Maestria",
          description:
            "As part of Brio, I contribute to this Rust runtime connecting local files, retrieval, memory and tasks. My work includes the search engine, vector ingestion and visual-document evaluation.",
          technologies: "Rust · Tantivy · SQLite · Dioxus",
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
          description: "The AI agent orchestration project that Maestria belongs to. I also build its website with Next.js.",
          technologies: "Next.js",
          url: destinations.brio,
          linkLabel: "Visit Brio",
        },
      ],
    },
    openSource: {
      heading: "The work continues on GitHub.",
      intro: "Changes proposed, discussed and merged. Follow the projects, trace the code and explore the activity shown on my profile.",
      personal: "Self-taught Python, then C and Rust through Linux. I love open source.",
      profileLabel: "carabistouflette on GitHub",
      profileUrl: "https://github.com/carabistouflette",
      selectedContributions: [
        {
          title: "Negative result: late-interaction",
          url: "https://github.com/brio-labs/maestria/pull/511",
          state: "Merged · brio-labs/maestria",
          problem: "A retrieval lane that looked attractive on paper: better passage ranking for agents.",
          change: "The measurements did not justify it: no new index introduced, negative results archived and reviewable in the PR.",
        },
        {
          title: "Per-document vector ingestion",
          url: "https://github.com/brio-labs/maestria/pull/485",
          state: "Merged · brio-labs/maestria",
          problem: "Indexing created one effect per chunk: multiplied exchanges and writes, state that was hard to replay.",
          change: "Work is grouped per document: one batch embedding call, replayable state, consistency checks preserved.",
        },
        {
          title: "Search engine: synchronous interfaces",
          url: "https://github.com/brio-labs/maestria/pull/501",
          state: "Merged · brio-labs/maestria",
          problem: "An asynchronous façade imposed complexity the actual work did not require.",
          change: "Synchronous interfaces fitted to the work executed, parallelism on bounded-concurrency threads, an explicit boundary in the daemon.",
        },
      ],
      github: {
        eyebrow: "Contributions & activity",
        exploreLabel: "Explore my GitHub activity",
        pageTitle: "GitHub contributions & activity",
        homeLabel: "Back to portfolio",
        latestHeading: "Latest contributions",
        scopeLabel: "Contributions to display",
        scopes: {
          recent: { label: "Most recent", description: "The three latest public pull requests I opened, across all statuses, ordered by creation date." },
          external: { label: "Outside personal repos", description: "The three latest PRs outside my personal repositories. Projects in organizations I participate in are included and identified." },
          open: { label: "In progress", description: "Up to three PRs that are still open, ordered by latest update. Drafts are identified." },
        },
        states: { open: "Open", merged: "Merged", closed: "Closed without merging", draft: "Draft" },
        relationships: { personal: "Personal repository", organization: "Organization member / owner", external: "Other repository" },
        createdLabel: "Opened on",
        updatedLabel: "Updated on",
        mergedLabel: "Merged on",
        discussionLabel: "Discussion",
        filesLabel: "Changed files",
        commitsLabel: "Commits",
        allPRLabel: "All my public PRs",
        emptyPRLabel: "No public pull requests in this selection.",
        openCountLabel: "Open public PRs",
        mergedCountLabel: "Merged public PRs",
        snapshotLabel: "Data synchronized on",
        refreshLabel: "Refresh",
        refreshingLabel: "Fetching the latest snapshot…",
        refreshedLabel: "Latest snapshot retrieved.",
        cachedLabel: "Snapshot saved in this browser.",
        staleLabel: "This snapshot is over 36 hours old. GitHub may show more recent activity.",
        updateFailedLabel: "The online check is unavailable. The dated snapshot remains accessible.",
        refreshPolicy: "Hourly synchronization scheduled through GitHub Actions. The calendar follows GitHub’s contribution counting delays.",
        methodHeading: "What these data show",
        methodParagraphs: [
          "PRs come from GitHub’s public API and are authored by carabistouflette. A PR in a personal repository is not presented as a contribution to a third-party project. Organization association is the one GitHub reports on the PR.",
          "The calendar reproduces contributions counted on the public profile, not every GitHub event. Depending on profile settings, it may include anonymized private contribution counts; no private content is retrieved.",
          "An empty square means no contribution was counted that day. It does not measure working time or productivity. Days missing from the source are not invented.",
          "Open and merged PR totals cover all public PRs authored by this account. Calendar figures cover only the displayed date range.",
        ],
        sourceLabel: "How GitHub counts contributions",
        calendar: {
          heading: "Day by day",
          intro: "A year of activity as GitHub counts it. Select a day to trace it back to the source.",
          viewLabel: "Calendar view",
          yearLabel: "Year",
          monthLabel: "Month",
          monthPickerLabel: "Month to display",
          previousLabel: "Previous month",
          nextLabel: "Next month",
          lessLabel: "Less",
          moreLabel: "More",
          daySingular: "{date} · {count} contribution",
          dayPlural: "{date} · {count} contributions",
          zeroDayLabel: "{date} · no contributions counted",
          inspectLabel: "View this day on GitHub",
          selectionLabel: "Selected day",
          navigationHint: "Keyboard: use arrows to change days, Home / End to move within a row.",
          activeDaysLabel: "Days with contributions",
          totalLabel: "Contributions in this period",
          lastActiveLabel: "Last day with a contribution",
          noActivityLabel: "None in this period",
        },
      },
    },
    journey: {
      heading: "Experience & education",
      intro: "From full-stack development to applied AI, alongside my computer science studies.",
      scaleNote: "In 2026, the CIRAD internship belongs to the BUT degree and precedes the master’s programme. Timeline spacing is schematic.",
      labels: { education: "Education", experience: "Experience" },
      invitation: {
        title: "You?",
        description: "I’m looking for an internship from 22 March to 21 August 2027, in Montpellier or Lille. An M2 apprenticeship is also possible from September 2027.",
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
        },
        {
          kind: "experience",
          title: "CIRAD",
          subtitle: "Agentic AI / RAG internship",
          period: "April–August 2026",
          start: "2026-but",
          detail: "BUT degree internship · agronomy research · the GenomInt project.",
          projectId: "genomint",
        },
        {
          kind: "experience",
          title: "SMAG",
          subtitle: "Full-stack internship",
          period: "February–May 2025",
          start: "2025",
          detail: "CSV tools: imports, joins and exports for digital-agriculture teams.",
        },
        {
          kind: "education",
          title: "BUT in Computer Science",
          subtitle: "Montpellier",
          period: "2023–2026",
          start: "2023",
          end: "2026-master",
          detail: "French three-year bachelor’s-equivalent degree · network deployment and security",
        },
      ],
    },
    skills: {
      heading: "Demonstrated skills",
      instruction:
        "Three areas structure what I build. Each technology links to the project where it was used. The full catalog remains below, grouped by purpose.",
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
      catalogHeading: "The full catalog",
      projectLabel: "See in project",
      groups: [
        { label: "Languages", description: "Write the logic, from scripts to applications and systems.", items: [
          { name: "Python", projectIds: ["genomint"] },
          { name: "Rust", projectIds: ["maestria"] },
          { name: "TypeScript", projectIds: [] },
          { name: "Java", projectIds: ["encrypted-voting"] },
          { name: "C", projectIds: [] },
        ] },
        { label: "Web & interfaces", description: "Connect interfaces, APIs and application services.", items: [
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
        ] },
        { label: "Data & analysis", description: "Prepare datasets, transform tables and explore data.", items: [
          { name: "Polars", projectIds: [] },
          { name: "Pandas", projectIds: [] },
          { name: "Datasets", projectIds: [] },
          { name: "NumPy", projectIds: [] },
          { name: "SciPy", projectIds: [] },
          { name: "Scikit-learn", projectIds: [] },
        ] },
        { label: "AI & fine-tuning", description: "Adapt models, prepare tokens and optimize inference.", items: [
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
        ] },
        { label: "Training & tracking", description: "Run training jobs, compare experiments and track metrics.", items: [
          { name: "Accelerate", projectIds: [] },
          { name: "PyTorch Lightning", projectIds: [] },
          { name: "Weights & Biases", projectIds: [] },
          { name: "DeepSpeed", projectIds: [] },
          { name: "TensorBoard", projectIds: [] },
          { name: "MLflow", projectIds: [] },
          { name: "Optuna", projectIds: [] },
        ] },
        { label: "Visualization", description: "Read distributions, visualize results and build interactive charts.", items: [
          { name: "Matplotlib", projectIds: [] },
          { name: "Seaborn", projectIds: [] },
          { name: "Plotly", projectIds: [] },
          { name: "Altair", projectIds: [] },
        ] },
        { label: "Databases", description: "Organize data, from relations to documents and graphs.", items: [
          { name: "PostgreSQL", projectIds: ["genomint"] },
          { name: "MySQL", projectIds: [] },
          { name: "MariaDB", projectIds: [] },
          { name: "SQLite", projectIds: ["maestria"] },
          { name: "MongoDB", projectIds: [] },
          { name: "Cassandra", projectIds: [] },
          { name: "Neo4j", projectIds: ["genomint"] },
        ] },
        { label: "Systems & deployment", description: "Build, automate and connect services.", items: [
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
        ] },
        { label: "Security & networking", description: "Explore environments, network traffic and security.", items: [
          { name: "Linux", projectIds: ["genomint"] },
          { name: "Nmap", projectIds: [] },
          { name: "Cisco Packet Tracer", projectIds: [] },
          { name: "OpenSSL", projectIds: [] },
          { name: "Wireshark", projectIds: [] },
          { name: "ZAP Proxy", projectIds: [] },
        ] },
      ],
    },
    personal: {
      heading: "Away from the keyboard?",
      eyebrow: "A different pace",
      intro: "I’m from Montpellier. Away from code, I hike in the mountains and take photographs. I also enjoy mountain biking and travelling.",
      photoAlt: "A stream flows between rocks in a conifer forest, surrounded by mist lit by the sun.",
      interests: [
        { title: "Writing & imagining", description: "I write stories. Reading and philosophy are also among my interests." },
        { title: "Making & sharing", description: "I tinker with PCs, Raspberry Pis and electronics. And I enjoy board games." },
      ],
    },
    contact: {
      description: "A few lines are enough: the context, your goal and what you would like to build.",
      email: "arobin9999@gmail.com",
      linkedin: "LinkedIn",
      linkedinDescription: "Professional background & network",
      cv: "Download CV",
      cvDescription: "Education & experience · PDF in French",
    },
  },
};

const genomintFr: CaseStudy = {
  title: "GenomInt",
  question: "Interroger un graphe génomique sans écrire de Cypher.",
  kicker: "CIRAD · stage 2026 · système agentique pour graphe génomique",
  summary:
    "Les biologistes posent une question sur Ganoderma. L’agent consulte le schéma du graphe, appelle les outils de requête et restitue des gènes et leurs annotations. Derrière ce parcours : des conversations persistées, des accès contrôlés et des exports réutilisables.",
  atGlance: {
    label: "Le projet en bref",
    entries: [
      { label: "Contexte", value: "Stage au CIRAD · UMR AGAP (Montpellier) · sujet officiel : un chatbot LLM qui génère des requêtes Cypher en langage naturel" },
      { label: "Période", value: "20 avril – 7 août 2026" },
      { label: "Équipe", value: "Encadrante : Létizia Camus-Kulandaivelu · interface web portée par Théodore de Boisseson" },
      { label: "Ma part", value: "Orchestration agentique, services Python, accès aux données, sécurité, déploiement" },
      { label: "État", value: "Stage achevé · code fermé pendant la préparation de la publication" },
      { label: "Valorisation", value: "Publication scientifique issue du stage en préparation · co-auteur" },
      { label: "Démonstration", value: "Trace réelle : question → outils → réponse sourcée" },
    ],
  },
  understandLabel: "Comprendre le projet",
  technicalLabel: "Examiner les choix techniques",
  role:
    "J’ai travaillé sur l’orchestration Pi, les services Python, les parcours et exports Neo4j, la sécurité et le déploiement. Théodore DE BOISSESON portait principalement l’interface web ; nous avons partagé l’intégration et les contrats d’API.",
  roleLabel: "Périmètre personnel",
  path: "/projets/genomint/",
  contextLabel: "Contexte et périmètre",
  context:
    "Le cas d’usage porte sur la pathogénie de Ganoderma et sur un graphe de connaissances Neo4j réunissant génomes, pangènes, transcrits et annotations. Les chercheurs gardent une question biologique ; le système doit rendre le vocabulaire du graphe et la complexité des requêtes progressivement accessibles.",
  figure: {
    kind: "screenshot",
    title: "Une question, trois appels d’outil, une réponse sourcée",
    alt:
      "Capture d’une trace GenomInt montrant la question sur les gènes du core genome de G. boninense, puis READ_SKILL, GET_GRAPH_SCHEMA, QUERY_NEO4J et la réponse avec des identifiants de gènes et de pangènes.",
    caption:
      "Trace réelle reproduite sur l’environnement de développement le 31 juillet 2026 : la question déclenche READ_SKILL → GET_GRAPH_SCHEMA → QUERY_NEO4J ; la requête est limitée à 100 résultats et la conversation est persistée.",
    source: "Rapport de stage · annexe B · observation du 31 juillet 2026.",
    src: "/images/genomint-evidence.webp",
    openLabel: "Agrandir la capture",
  },
  pagination: {
    heading: "Un calcul de pagination, pas un benchmark",
    intro:
      "Pour les 15 615 segments du cas de régression décrit au §5.2.1, la pagination passe arithmétiquement de 16 pages de 1 000 à 2 pages de 10 000.",
    beforeValue: "16",
    beforeLabel: "Avant · 1 000 / page",
    afterValue: "2",
    afterLabel: "Après · 10 000 / page",
    unit: "pages",
    notice:
      "Illustration du nombre d’allers-retours (ceil(S / taille de page)), pas une mesure de temps, de mémoire ou d’accélération.",
  },
  sections: [
    {
      heading: "01 · Séparer le dialogue de l’exécution",
      paragraphs: [
        "Le premier prototype mélangeait la boucle agentique et l’API. La frontière retenue confie à core-ai les sessions, l’identité, la persistance, le cycle de vie et le flux SSE ; Pi exécute la boucle et ses outils, tandis que back-gkg reste le service métier du graphe.",
        "Le pont JSONL-RPC sérialise des requêtes corrélées par identifiant, maintient un lecteur unique pour démultiplexer réponses et événements, et signale les délais ou l’arrêt du processus. Une conversation PostgreSQL doit être créée avant de considérer la session comme valide : si cette persistance échoue, Pi est arrêté au lieu de laisser vivre une session introuvable.",
      ],
      points: [
        { label: "Choix", detail: "Découpler les responsabilités sans prétendre isoler totalement l’agent : Pi peut tourner comme sous-processus local ou dans un conteneur." },
        { label: "Compromis", detail: "Le mode local retenu sur le VPS simplifie le déploiement, mais offre moins d’isolation que le mode conteneur ; une reconnexion sur un autre réplica ne reprend pas automatiquement un Pi en cours." },
      ],
    },
    {
      heading: "02 · Réduire le périmètre avant de produire",
      paragraphs: [
        "Les exports et les parcours GKG ne devaient pas préparer un chromosome entier pour une sélection étroite. Les filtres restent côté serveur, la pagination intervient avant l’enrichissement, les séquences sont résolues par lots et les états volumineux sont externalisés dans SQLite ou JSONL avant la construction progressive de l’archive.",
        "Pour les exports biologiques, les chemins suivent la hiérarchie exacte demandée (par exemple gène → ARNm → exon → CDS → UTR). Les marches FASTA respectent l’orientation avant la découpe des coordonnées ; les pages de segments et les lots de résolution sont bornés par construction.",
      ],
      points: [
        { label: "Effet calculable", detail: "15 615 segments : 16 pages de 1 000 deviennent 2 pages de 10 000, soit 14 requêtes de page en moins et 87,5 % de requêtes en moins — pas 87,5 % de temps en moins." },
        { label: "Garde-fou", detail: "La taille des lignes, les tampons du pilote Neo4j et les fichiers ZIP ne sont pas tous bornés en octets ; le pic RSS et la tenue en charge restent à mesurer." },
      ],
    },
    {
      heading: "03 · Faire de Cypher une chaîne de contrôles",
      paragraphs: [
        "Une expression régulière seule ne suffit pas face aux commentaires, homoglyphes, littéraux et sous-requêtes. Le validateur normalise et tokenise la requête, inspecte les clauses et procédures autorisées, refuse les écritures et vérifie récursivement les sous-requêtes et chaînes susceptibles de dissimuler du Cypher.",
        "Après cette barrière, QueryService impose une exécution en lecture seule et un délai ; le client Neo4j refuse les appels non read-only et ouvre une session READ_ACCESS. La route ajoute encore capacité, permission ou scope de service et limitation de débit. Ces couches réduisent le risque applicatif, mais ne prouvent pas à elles seules que le compte Neo4j est configuré avec des privilèges minimaux.",
      ],
      points: [
        { label: "Défense", detail: "Validation applicative → service de lecture → session Neo4j orientée lecture → droits de la base." },
        { label: "Limite", detail: "Les tests ciblent les contournements connus ; fuzzing adversarial, test d’intrusion et validation de la configuration de privilèges restent hors preuve." },
      ],
    },
    {
      heading: "04 · Rendre la livraison rejouable",
      paragraphs: [
        "Le chemin de livraison assemble des images Podman, un registre OCI compatible avec l’exécuteur, des charts Helm et K3s. Une incompatibilité de format et de compression avec le registre GitLab a conduit à un registre miroir local sur les VPS : une image construite n’est pas automatiquement une image consommable par le cluster.",
        "Le déploiement utilise helm upgrade --install avec --atomic, --wait et un plafond de quinze minutes, puis vérifie les déploiements, les pods, les services et plusieurs routes protégées. Cette procédure donne une livraison reproductible et observable, pas une promesse de disponibilité sous charge.",
      ],
      points: [
        { label: "Preuve", detail: "Le rapport documente le chemin CI/CD, les contrôles post-déploiement et un parcours agentique observé sur l’environnement de développement." },
        { label: "Limite", detail: "La continuité d’un flux Pi entre réplicas, le comportement sous charge et une validation biologique de bout en bout restent à établir." },
      ],
    },
  ],
  limitationsLabel: "Ce que cette preuve ne dit pas",
  limitations: [
    "La capture montre un parcours nominal et des résultats rendus ; elle ne constitue ni un benchmark de latence, ni une preuve de qualité biologique des résultats.",
    "Les contrôles Cypher sont une défense en profondeur applicative, pas un test d’intrusion ni une garantie de privilèges minimaux côté Neo4j.",
    "Le rapport établit des bornes de parcours, de pagination et de lots ; la mémoire maximale, la charge et la reprise transparente d’un flux interrompu restent ouvertes.",
  ],
  sourcesLabel: "Sources de la lecture",
  sources: [
    { label: "Rapport de stage · §4.1–4.4 · architecture et périmètre", detail: "Architecture du système et répartition des contributions." },
    { label: "Rapport de stage · §5.1.3–5.1.7 · core-ai, Pi et persistance", detail: "Contrats JSONL-RPC, cycle de vie et scénario observé." },
    { label: "Rapport de stage · §5.2.1–5.2.4 · exports et coûts structurels", detail: "Pagination, parcours sélectionnés et limites des gains." },
    { label: "Rapport de stage · §5.3 et §5.4 · sécurité et livraison", detail: "Contrôles Cypher, Helm, K3s et vérifications post-déploiement." },
  ],
  sourcesNote:
    "Le rapport de stage n’est pas public (sa diffusion relève de l’autorisation du CIRAD) et l’attestation de stage contient des données personnelles qui ne sont pas republiées. Le code reste fermé pendant la préparation de la publication scientifique, qui créditera cette contribution ; les sections citées du rapport indiquent en attendant où chaque preuve est documentée.",
  homeLabel: "Retour au portfolio",
  counterpartLabel: "Read in English",
  counterpartPath: "/projets/genomint/",
  languageLabel: "Changer de langue",
};

const genomintEn: CaseStudy = {
  title: "GenomInt",
  question: "Query a genomic graph without writing Cypher.",
  kicker: "CIRAD · 2026 internship · agentic genomics graph workbench",
  summary:
    "Biologists ask a question about Ganoderma. The agent inspects the graph schema, calls query tools and returns genes and annotations. Behind that interaction: persistent conversations, controlled access and reusable biological exports.",
  atGlance: {
    label: "The project at a glance",
    entries: [
      { label: "Context", value: "Internship at CIRAD · UMR AGAP (Montpellier) · official topic: an LLM chatbot generating Cypher queries from natural language" },
      { label: "Period", value: "20 April – 7 August 2026" },
      { label: "Team", value: "Supervisor: Létizia Camus-Kulandaivelu · web interface built by Théodore de Boisseson" },
      { label: "My part", value: "Agent orchestration, Python services, data access, security, deployment" },
      { label: "Status", value: "Internship completed · code closed while the research publication is in preparation" },
      { label: "Output", value: "Research publication from this internship in preparation · co-author" },
      { label: "Demonstration", value: "Real trace: question → tools → sourced answer" },
    ],
  },
  understandLabel: "Understand the project",
  technicalLabel: "Examine the technical choices",
  role:
    "I worked on Pi orchestration, Python services, Neo4j traversals and exports, security and deployment. Théodore DE BOISSESON primarily developed the web interface; we shared integration and API contracts.",
  roleLabel: "Personal scope",
  path: "/en/projects/genomint/",
  contextLabel: "Context and scope",
  context:
    "The use case concerns Ganoderma pathogenicity and a Neo4j knowledge graph combining genomes, pangenes, transcripts and annotations. Researchers bring a biological question; the system must make graph vocabulary and query complexity progressively accessible.",
  figure: {
    kind: "screenshot",
    title: "One question, three tool calls, one traceable answer",
    alt:
      "GenomInt trace showing a question about genes in the core genome of G. boninense, followed by READ_SKILL, GET_GRAPH_SCHEMA, QUERY_NEO4J and an answer with gene and pangene identifiers.",
    caption:
      "Real trace replayed on the development environment on 31 July 2026: the question triggers READ_SKILL → GET_GRAPH_SCHEMA → QUERY_NEO4J; the query is limited to 100 results and the conversation is persisted.",
    source: "Internship report · Appendix B · observed on 31 July 2026.",
    src: "/images/genomint-evidence.webp",
    openLabel: "View full-size capture",
  },
  pagination: {
    heading: "A pagination calculation, not a benchmark",
    intro:
      "For the 15,615 segments in the regression case described in §5.2.1, pagination arithmetically moves from 16 pages of 1,000 to 2 pages of 10,000.",
    beforeValue: "16",
    beforeLabel: "Before · 1,000 / page",
    afterValue: "2",
    afterLabel: "After · 10,000 / page",
    unit: "pages",
    notice:
      "Illustrates the number of page requests (ceil(S / page size)), not time, memory or speed-up measurement.",
  },
  sections: [
    {
      heading: "01 · Separate dialogue from execution",
      paragraphs: [
        "The first prototype mixed the agent loop and the API. The resulting boundary gives core-ai sessions, identity, persistence, lifecycle and SSE streaming; Pi runs the loop and its tools, while back-gkg remains the graph’s domain service.",
        "The JSONL-RPC bridge serializes requests correlated by ID, keeps one reader to demultiplex responses and events, and reports timeouts or process exit. A PostgreSQL conversation must exist before a session is considered valid: if persistence fails, Pi is terminated rather than leaving an untraceable session alive.",
      ],
      points: [
        { label: "Decision", detail: "Decouple responsibilities without claiming total isolation: Pi can run as a local subprocess or in a container." },
        { label: "Trade-off", detail: "The VPS uses local mode for simpler deployment, but with less isolation than the container mode; a replica switch does not automatically resume an in-flight Pi." },
      ],
    },
    {
      heading: "02 · Reduce scope before producing output",
      paragraphs: [
        "Exports and GKG traversals should not prepare a whole chromosome for a narrow selection. Filters stay server-side, pagination happens before enrichment, sequences resolve in batches, and large state is externalized to SQLite or JSONL before the archive is built progressively.",
        "For biological exports, paths follow the exact requested hierarchy (for example gene → mRNA → exon → CDS → UTR). FASTA walks orient segments before slicing coordinates; segment pages and resolution batches are bounded by construction.",
      ],
      points: [
        { label: "Calculable effect", detail: "15,615 segments: 16 pages of 1,000 become 2 pages of 10,000, 14 fewer page requests and 87.5% fewer requests — not 87.5% less time." },
        { label: "Guardrail", detail: "Row size, Neo4j driver buffers and ZIP output files are not all bounded in bytes; peak RSS and load behavior remain unmeasured." },
      ],
    },
    {
      heading: "03 · Make Cypher a chain of controls",
      paragraphs: [
        "A single regular expression cannot safely handle comments, homoglyphs, literals and subqueries. The validator normalizes and tokenizes the query, checks clauses and approved procedures, rejects writes, and recursively checks subqueries and strings that could hide Cypher.",
        "After that barrier, QueryService enforces read-only execution and a timeout; the Neo4j client rejects non-read-only calls and opens a READ_ACCESS session. The route adds capability, user permission or service scope, and rate limiting. These layers reduce application risk, but do not on their own prove least-privilege Neo4j credentials.",
      ],
      points: [
        { label: "Defense", detail: "Application validation → read service → read-oriented Neo4j session → database privileges." },
        { label: "Limit", detail: "Tests target known bypass classes; adversarial fuzzing, penetration testing and privilege configuration review remain outside the evidence." },
      ],
    },
    {
      heading: "04 · Make delivery reproducible",
      paragraphs: [
        "The delivery path combines Podman images, an OCI registry compatible with the runtime, Helm charts and K3s. An image-format and compression mismatch with the GitLab registry led to a local mirror on the VPS: a built image is not automatically an image the cluster can consume.",
        "Deployment uses helm upgrade --install with --atomic, --wait and a fifteen-minute ceiling, then checks deployments, pods, services and protected routes. This makes delivery reproducible and observable, not a promise of availability under load.",
      ],
      points: [
        { label: "Evidence", detail: "The report documents the CI/CD path, post-deployment checks and an agentic scenario observed in the development environment." },
        { label: "Limit", detail: "Continuity of an in-flight Pi stream across replicas, load behavior and end-to-end biological validation remain open." },
      ],
    },
  ],
  limitationsLabel: "What this evidence does not say",
  limitations: [
    "The capture shows a nominal path and rendered results; it is neither a latency benchmark nor evidence of biological result quality.",
    "Cypher controls are application-layer defense in depth, not a penetration test or a guarantee of least-privilege Neo4j credentials.",
    "The report establishes traversal, pagination and batch bounds; maximum memory, load behavior and transparent recovery of an interrupted stream remain open.",
  ],
  sourcesLabel: "Sources for this reading",
  sources: [
    { label: "Internship report · §§4.1–4.4 · architecture and scope", detail: "System architecture and division of contributions." },
    { label: "Internship report · §§5.1.3–5.1.7 · core-ai, Pi and persistence", detail: "JSONL-RPC contracts, lifecycle and observed scenario." },
    { label: "Internship report · §§5.2.1–5.2.4 · exports and structural cost", detail: "Pagination, selected traversals and limits of the gains." },
    { label: "Internship report · §§5.3 and 5.4 · security and delivery", detail: "Cypher controls, Helm, K3s and post-deployment checks." },
  ],
  sourcesNote:
    "The internship report is not public (its release is subject to CIRAD authorization) and the internship certificate contains personal data that is not republished. The code stays closed while the research publication is in preparation; it will credit this contribution. Until then, the cited report sections show where each piece of evidence is documented.",
  homeLabel: "Back to portfolio",
  counterpartLabel: "Lire en français",
  counterpartPath: "/projets/genomint/",
  languageLabel: "Change language",
};

const maestriaFr: CaseStudy = {
  title: "Maestria",
  question: "Des fichiers locaux à une mémoire traçable.",
  kicker: "Rust · runtime local-first · en développement",
  summary:
    "Maestria se développe dans le cadre du projet Brio. Il indexe des fichiers, retrouve des passages et relie les preuves aux agents, à la mémoire et aux tâches. L’enjeu dépasse la recherche : conserver le lien entre ce qu’un agent utilise et les sources qui permettent de le vérifier.",
  atGlance: {
    label: "Le projet en bref",
    entries: [
      { label: "Contexte", value: "Projet open source Brio · runtime local de connaissances et de preuves" },
      { label: "Depuis", value: "2026 · en développement" },
      { label: "Ma part", value: "Moteur de recherche, ingestion vectorielle, évaluation des documents visuels" },
      { label: "État", value: "PR fusionnées jusqu’à #514 · #515 ouverte" },
      { label: "Décision issue de l’évaluation", value: "La voie visuelle reste expérimentale : 4 des 6 cas dépassent encore le budget de bout en bout malgré l’optimisation du calcul (PR #514)" },
      { label: "Preuves", value: "PR fusionnées publiques : #411, #485, #493, #501, #507, #511, #514" },
    ],
  },
  understandLabel: "Comprendre le projet",
  technicalLabel: "Examiner les choix techniques",
  role:
    "Je contribue au moteur de recherche, à l’ingestion vectorielle et à l’évaluation des documents visuels. Les PR présentées ici montrent des changements fusionnés : simplifier l’exécution, regrouper le travail par document et mesurer les modèles locaux avant d’en autoriser l’usage.",
  roleLabel: "Mon travail",
  relatedProject: { label: "Dans le cadre du projet Brio", href: destinations.brio },
  path: "/projets/maestria/",
  contextLabel: "La place de Maestria dans Brio",
  context:
    "Brio explore l’orchestration d’agents IA. Maestria s’inscrit dans ce projet avec un runtime local de connaissances et de preuves : des sources choisies, un contexte inspectable et des changements soumis à validation. Ce n’est ni un fournisseur de modèles ni simplement une interface de chat.",
  figure: {
    kind: "diagram",
    title: "Des sources au travail de l’agent",
    alt: "Trois étapes : choisir les fichiers, retrouver des extraits sourcés, puis utiliser ces preuves dans Studio, la mémoire et les tâches.",
    caption: "Vue fonctionnelle simplifiée, pas une capture du logiciel. Les interfaces et les règles de validation sont décrites dans les PR et le code publics.",
    source: "Studio #411 · moteur #501 · ingestion #485",
    nodes: [
      { title: "Choisir les sources", detail: "Des fichiers locaux, indexés et explicitement rattachés au notebook." },
      { title: "Retrouver les passages", detail: "Une recherche dans le périmètre autorisé, avec des extraits reliés à leur source et à leur version." },
      { title: "Travailler avec les preuves", detail: "Du contexte pour les agents ; des références pour les réponses, la mémoire et les tâches." },
    ],
    optional: { title: "Des actions explicites", detail: "Studio ne sauvegarde pas automatiquement les réponses. Les propositions de mémoire passent par un circuit de validation." },
  },
  sections: [
    {
      heading: "01 · Du fichier au notebook",
      paragraphs: [
        "Dans Studio, le parcours commence par un notebook et des sources choisies. On peut poser une question, consulter les extraits associés aux citations, puis transférer un brouillon et décider de le sauvegarder. Le contexte ne doit pas s’étendre silencieusement à tous les fichiers de la machine.",
        "L’interface est écrite en Rust avec Dioxus. Studio est la surface HTTP du navigateur ; le daemon conserve l’autorité sur les sources, les preuves et les révisions. L’agent externe communique via ACP : Maestria lui fournit un contexte, sans devenir lui-même un fournisseur de modèles.",
      ],
      points: [
        { label: "Usage", detail: "Retrouver un passage, inspecter sa source et choisir ce que l’on conserve." },
        { label: "Architecture", detail: "Une interface de travail distincte du runtime qui détient l’état durable." },
      ],
    },
    {
      heading: "02 · Simplifier le moteur",
      paragraphs: [
        "J’ai remplacé la façade asynchrone du moteur de recherche par des interfaces synchrones adaptées au travail réellement exécuté. Les voies de recherche peuvent toujours travailler en parallèle, sur des threads à portée limitée et avec une concurrence bornée. Le daemon conserve une frontière explicite pour ce travail bloquant (PR #501).",
        "J’ai aussi rendu visible l’origine d’une recherche dans la CLI : servie par le daemon ou exécutée localement (PR #493). Cette attribution permet de savoir quel chemin on observe, plutôt que de comparer des exécutions différentes sans le voir.",
      ],
      points: [
        { label: "Choix", detail: "Retirer une couche inutile sans confondre synchrone et séquentiel." },
        { label: "Contrôle", detail: "Des budgets et une annulation coopérative, pas une promesse d’interruption instantanée." },
      ],
    },
    {
      heading: "03 · Ingérer à l’échelle du document",
      paragraphs: [
        "Pour l’indexation vectorielle, j’ai regroupé le travail par artefact plutôt que de multiplier les effets pour chaque fragment. Les fragments en attente passent dans un appel d’embedding par lot, suivi d’une mise à jour de projection et d’une complétion métier (PR #485).",
        "Ce changement touche aussi le cycle de vie : l’état en attente peut être rejoué, l’identité de la génération est vérifiée et la réponse du fournisseur doit correspondre aux fragments demandés. L’objectif est de réduire les échanges et les écritures intermédiaires sans perdre ces contrôles.",
      ],
      points: [
        { label: "Unité de travail", detail: "Le document et ses fragments, plutôt qu’une succession d’effets isolés." },
        { label: "Portée", detail: "Une amélioration du chemin vectoriel, pas un chiffre de performance valable pour toute recherche." },
      ],
    },
    {
      heading: "04 · Évaluer avant d’activer",
      paragraphs: [
        "Pour les documents visuels, j’ai construit un banc utilisant réellement SigLIP et RapidOCR, puis corrigé le protocole d’intégration, la sortie ONNX retenue et le recadrage des régions de page (PR #507). Évaluer la bonne région compte autant que brancher un modèle.",
        "J’ai ensuite ajusté l’exécution CPU de SigLIP et renforcé les critères de mesure : une consommation d’énergie ou une télémétrie indisponible ne doit pas passer pour un zéro mesuré (PR #514). Le calcul du modèle est plus rapide dans le protocole étudié, mais quatre des six cas visuels dépassent encore leur budget de bout en bout. La voie reste expérimentale, sans promotion.",
        "Le même principe vaut pour les pistes qui ne convainquent pas : les résultats négatifs de la recherche late-interaction sont archivés, sans introduire un nouvel index non justifié (PR #511).",
      ],
      points: [
        { label: "Contribution", detail: "Banc réel, corrections d’intégration et critères d’activation explicites." },
        { label: "Décision", detail: "Conserver les limites et les résultats négatifs, plutôt que présenter une expérimentation comme un gain produit." },
      ],
    },
  ],
  limitationsLabel: "État et limites",
  limitations: [
    "Cette présentation s’appuie sur les PR fusionnées jusqu’à #514. La factorisation de télémétrie proposée dans #515 est encore ouverte à la date de consultation, le 14 septembre 2026.",
    "L’évaluation visuelle porte sur six cas préparés et une référence simplifiée. Elle ne mesure pas la qualité générale du moteur sur les documents des utilisateurs.",
    "Une citation présente dans le contexte autorisé ne garantit pas que chaque phrase générée soit correcte. Les capacités expérimentales et les changements de mémoire restent soumis à leurs règles d’activation ou de validation.",
  ],
  sourcesLabel: "Projet, code et contributions",
  sources: [
    { label: "Brio · orchestration d’agents", href: destinations.brio, detail: "Le projet dans lequel s’inscrit Maestria." },
    { label: "Dépôt Maestria", href: "https://github.com/brio-labs/maestria", detail: "Runtime, interfaces et historique public." },
    { label: "Studio · espace notebook · #411", href: "https://github.com/brio-labs/maestria/pull/411", detail: "Fusionnée · Dioxus, sources, questions, citations et brouillons." },
    { label: "Moteur synchrone · #501", href: "https://github.com/brio-labs/maestria/pull/501", detail: "Fusionnée · interfaces synchrones et concurrence bornée." },
    { label: "Attribution des recherches · #493", href: "https://github.com/brio-labs/maestria/pull/493", detail: "Fusionnée · distinguer daemon et exécution locale." },
    { label: "Ingestion par artefact · #485", href: "https://github.com/brio-labs/maestria/pull/485", detail: "Fusionnée · effets vectoriels regroupés et état rejouable." },
    { label: "Évaluation visuelle · #507", href: "https://github.com/brio-labs/maestria/pull/507", detail: "Fusionnée · SigLIP, RapidOCR et corrections de recadrage." },
    { label: "Latence et télémétrie visuelles · #514", href: "https://github.com/brio-labs/maestria/pull/514", detail: "Fusionnée · optimisation CPU et limites de promotion." },
    { label: "Résultat négatif late-interaction · #511", href: "https://github.com/brio-labs/maestria/pull/511", detail: "Fusionnée · preuves de recherche, sans nouvel index." },
    { label: "Télémétrie partagée · #515", href: "https://github.com/brio-labs/maestria/pull/515", detail: "Ouverte lors de la consultation · non présentée comme livrée." },
  ],
  homeLabel: "Retour au portfolio",
  counterpartLabel: "Read in English",
  counterpartPath: "/en/projects/maestria/",
  languageLabel: "Changer de langue",
};

const maestriaEn: CaseStudy = {
  title: "Maestria",
  question: "From local files to traceable memory.",
  kicker: "Rust · local-first runtime · in development",
  summary:
    "Maestria is being developed as part of Brio. It indexes files, retrieves passages and connects evidence to agents, memory and tasks. The challenge goes beyond search: preserving the link between what an agent uses and the sources that let someone check it.",
  atGlance: {
    label: "The project at a glance",
    entries: [
      { label: "Context", value: "Brio open-source project · local knowledge and evidence runtime" },
      { label: "Since", value: "2026 · in development" },
      { label: "My part", value: "Search engine, vector ingestion, visual-document evaluation" },
      { label: "Status", value: "PRs merged through #514 · #515 open" },
      { label: "Evaluation outcome", value: "The visual lane stays experimental: 4 of 6 cases still exceed the end-to-end budget despite faster inference (PR #514)" },
      { label: "Evidence", value: "Public merged PRs: #411, #485, #493, #501, #507, #511, #514" },
    ],
  },
  understandLabel: "Understand the project",
  technicalLabel: "Examine the technical choices",
  role:
    "I contribute to the search engine, vector ingestion and visual-document evaluation. The PRs presented here show merged changes: simplifying execution, batching work by document and measuring local models before allowing their use.",
  roleLabel: "My work",
  relatedProject: { label: "Part of the Brio project", href: destinations.brio },
  path: "/en/projects/maestria/",
  contextLabel: "Maestria within Brio",
  context:
    "Brio explores AI agent orchestration. Maestria belongs to that project as a local knowledge and evidence runtime: selected sources, inspectable context and changes subject to validation. It is neither a model provider nor simply a chat interface.",
  figure: {
    kind: "diagram",
    title: "From sources to agent work",
    alt: "Three steps: select files, retrieve source-linked excerpts, then use this evidence in Studio, memory and tasks.",
    caption: "Simplified functional overview, not an application screenshot. The public PRs and code describe the interfaces and validation rules.",
    source: "Studio #411 · engine #501 · ingestion #485",
    nodes: [
      { title: "Select the sources", detail: "Local files, indexed and explicitly attached to the notebook." },
      { title: "Retrieve passages", detail: "Search within the allowed scope, with excerpts linked to their source and version." },
      { title: "Work with evidence", detail: "Context for agents; references for answers, memory and tasks." },
    ],
    optional: { title: "Explicit actions", detail: "Studio does not save answers automatically. Memory proposals go through a validation process." },
  },
  sections: [
    {
      heading: "01 · From files to notebooks",
      paragraphs: [
        "In Studio, the workflow starts with a notebook and selected sources. You can ask a question, inspect the excerpts behind citations, then transfer a draft and decide whether to save it. Context should not silently expand to every file on the machine.",
        "The interface is written in Rust with Dioxus. Studio is the browser-facing HTTP surface; the daemon retains authority over sources, evidence and revisions. The external agent communicates through ACP: Maestria supplies context without becoming a model provider itself.",
      ],
      points: [
        { label: "Workflow", detail: "Find a passage, inspect its source and choose what to keep." },
        { label: "Architecture", detail: "A working interface separate from the runtime that owns durable state." },
      ],
    },
    {
      heading: "02 · Simplifying the engine",
      paragraphs: [
        "I replaced the search engine’s asynchronous façade with synchronous interfaces suited to the work actually being done. Retrieval lanes can still run in parallel, on scoped threads with bounded concurrency. The daemon keeps an explicit boundary for this blocking work (PR #501).",
        "I also made the origin of a CLI search visible: served by the daemon or executed locally (PR #493). That attribution makes it possible to tell which path is being observed, rather than unknowingly comparing different execution paths.",
      ],
      points: [
        { label: "Decision", detail: "Remove an unnecessary layer without confusing synchronous with sequential." },
        { label: "Control", detail: "Budgets and cooperative cancellation, not a promise of instant interruption." },
      ],
    },
    {
      heading: "03 · Ingesting by document",
      paragraphs: [
        "For vector indexing, I grouped work by artifact instead of creating an effect for every chunk. Pending chunks go through one batch embedding call, followed by a projection update and a domain completion (PR #485).",
        "The change also addresses lifecycle: pending state can be replayed, generation identity is checked and the provider response must match the requested chunks. The aim is to reduce intermediate exchanges and writes without losing those checks.",
      ],
      points: [
        { label: "Unit of work", detail: "The document and its chunks, rather than a sequence of isolated effects." },
        { label: "Scope", detail: "An improvement to vector ingestion, not a performance figure that applies to every search." },
      ],
    },
    {
      heading: "04 · Evaluate before enabling",
      paragraphs: [
        "For visual documents, I built an evaluation harness using real SigLIP and RapidOCR providers, then fixed the integration protocol, ONNX output selection and page-region cropping (PR #507). Evaluating the right region matters as much as connecting a model.",
        "I then tuned SigLIP’s CPU execution and strengthened measurement criteria: unavailable energy or telemetry must not count as a measured zero (PR #514). Model inference is faster in the studied protocol, but four of the six visual cases still exceed their end-to-end budget. The lane remains experimental, without promotion.",
        "The same principle applies to approaches that do not justify adoption: negative late-interaction results are archived without introducing an unsupported new index (PR #511).",
      ],
      points: [
        { label: "Contribution", detail: "A real-provider harness, integration fixes and explicit activation criteria." },
        { label: "Decision", detail: "Keep limitations and negative results visible instead of presenting an experiment as a product gain." },
      ],
    },
  ],
  limitationsLabel: "Status and limitations",
  limitations: [
    "This presentation is based on PRs merged through #514. The telemetry refactoring proposed in #515 remains open as of the review date, 14 September 2026.",
    "Visual evaluation covers six prepared cases and a simplified baseline. It does not measure the engine’s general quality on users’ documents.",
    "A citation belonging to the allowed context does not guarantee that every generated sentence is correct. Experimental capabilities and memory changes remain subject to their activation or validation rules.",
  ],
  sourcesLabel: "Project, code and contributions",
  sources: [
    { label: "Brio · agent orchestration", href: destinations.brio, detail: "The project that Maestria belongs to." },
    { label: "Maestria repository", href: "https://github.com/brio-labs/maestria", detail: "Runtime, interfaces and public history." },
    { label: "Studio · notebook workspace · #411", href: "https://github.com/brio-labs/maestria/pull/411", detail: "Merged · Dioxus, sources, questions, citations and drafts." },
    { label: "Synchronous engine · #501", href: "https://github.com/brio-labs/maestria/pull/501", detail: "Merged · synchronous interfaces and bounded concurrency." },
    { label: "Search attribution · #493", href: "https://github.com/brio-labs/maestria/pull/493", detail: "Merged · distinguish daemon and local execution." },
    { label: "Per-artifact ingestion · #485", href: "https://github.com/brio-labs/maestria/pull/485", detail: "Merged · batched vector effects and replayable state." },
    { label: "Visual evaluation · #507", href: "https://github.com/brio-labs/maestria/pull/507", detail: "Merged · SigLIP, RapidOCR and cropping fixes." },
    { label: "Visual latency and telemetry · #514", href: "https://github.com/brio-labs/maestria/pull/514", detail: "Merged · CPU tuning and promotion limitations." },
    { label: "Negative late-interaction result · #511", href: "https://github.com/brio-labs/maestria/pull/511", detail: "Merged · research evidence, without a new index." },
    { label: "Shared telemetry · #515", href: "https://github.com/brio-labs/maestria/pull/515", detail: "Open when reviewed · not presented as shipped." },
  ],
  homeLabel: "Back to portfolio",
  counterpartLabel: "Lire en français",
  counterpartPath: "/projets/maestria/",
  languageLabel: "Change language",
};

export const caseStudies: Record<Locale, Record<CaseStudyId, CaseStudy>> = {
  fr: { genomint: genomintFr, maestria: maestriaFr },
  en: { genomint: genomintEn, maestria: maestriaEn },
};
