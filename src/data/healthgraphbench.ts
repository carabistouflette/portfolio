import type { CaseStudy, Locale } from "./portfolio";

const repository = "https://github.com/carabistouflette/HealthGraphBench";
// Keep the existing portfolio URLs; the project now has its own public repository.
const source = `${repository}/blob/b010d5a49eae56837a920b2e30dece41c42c0c44`;
const temporalExampleOutput =
  "2019Q1 history: A -> [1]; B -> [2]\n2019Q2 candidates for A: [2]\n2019Q2 eligible new link: A -> 2\nProblem 3 excluded: not in past history\n2019Q3 history for A: [1, 2, 3]";

export const healthgraphbench: Record<Locale, CaseStudy> = {
  fr: {
    title: "HealthGraphBench",
    question: "Quand les graphes apportent-ils un gain prédictif ?",
    kicker: "Recherche personnelle · Python · données publiques de santé",
    summary:
      "Je compare des méthodes tabulaires et relationnelles sur des données publiques de santé : signalements FDA MAUDE, inspections d’établissements et prescriptions Medicare Part D.",
    atGlance: {
      label: "Repères du projet",
      entries: [
        {
          label: "Données étudiées",
          value: "FDA MAUDE · CMS inspections · Medicare Part D",
        },
        {
          label: "État",
          value: "Code et résultats publics · benchmark exploratoire",
        },
        {
          label: "Bibliothèques",
          value: "NumPy · Scikit-learn · Numba · Matplotlib",
        },
      ],
    },
    technicalLabel: "Examiner la démarche",
    roleLabel: "Mon travail",
    role: "Je définis les tâches et le protocole, développe le pipeline MAUDE en Python et compare les méthodes en respectant les coupures temporelles.",
    relatedProject: {
      label: "Voir le dépôt HealthGraphBench",
      href: repository,
    },
    path: "/projets/meddatatrace/",
    mediaLabel: "La démarche expérimentale",
    figure: {
      kind: "diagram",
      title: "Des données datées à la comparaison des modèles",
      alt: "Trois étapes : préparer les sources FDA et CMS, comparer les modèles, puis évaluer sur des périodes ultérieures.",
      caption:
        "Le protocole distingue l’apport des informations relationnelles de celui du modèle qui les exploite.",
      source: "Code et protocole HealthGraphBench",
      sourceHref: `${source}/README.md`,
      nodes: [
        {
          title: "Préparer les données",
          detail:
            "Relier les entités, dater les observations et auditer les sources.",
        },
        {
          title: "Comparer les méthodes",
          detail:
            "Historique local, agrégats de voisinage et représentations apprises.",
        },
        {
          title: "Évaluer dans le temps",
          detail:
            "Prédire les périodes suivantes et examiner les écarts et leur incertitude.",
        },
      ],
    },
    demonstration: {
      heading: "Un exemple exécuté : garder le futur hors de l’historique",
      description:
        "Deux trimestres fictifs passent dans les fonctions MAUDE du dépôt public. L’exemple vérifie la sélection des candidats, sans mesurer la qualité prédictive sur des données réelles.",
      output: temporalExampleOutput,
      steps: [
        {
          heading: "1 · Construire le passé",
          description:
            "Au premier trimestre, A est associé au problème 1 et B au problème 2. Seules ces observations entrent dans l’historique.",
        },
        {
          heading: "2 · Filtrer les candidats",
          description:
            "Pour A, le problème 2 est connu ailleurs. Le problème 3, encore inconnu dans l’historique, est exclu de cette évaluation.",
        },
        {
          heading: "3 · Avancer après l’évaluation",
          description:
            "Les observations du deuxième trimestre sont ajoutées après le classement des candidats, pour préparer le trimestre suivant.",
        },
      ],
      download: {
        label: "Télécharger la sortie de l’exécution",
        href: "/evidence/meddatatrace-output.txt",
      },
    },
    sections: [
      {
        heading: "01 · Trois tâches concrètes",
        paragraphs: [
          "Le projet étudie si le contexte relationnel apporte une information utile, puis si un modèle appris fait mieux que des agrégats simples. Un gain des graphes reste une question expérimentale.",
        ],
        points: [
          {
            label: "FDA MAUDE",
            detail:
              "Classer les liens produit–problème susceptibles d’être observés pour la première fois dans un trimestre ultérieur.",
          },
          {
            label: "CMS",
            detail:
              "Étudier les déficiences graves relevées lors d’inspections d’établissements, à partir de leur historique et des liens entre propriétaires.",
          },
          {
            label: "Medicare Part D",
            detail:
              "Classer les nouvelles relations publiées entre prescripteurs et médicaments, comme tâche de réplication dans la version 0.2.",
          },
        ],
      },
      {
        heading: "02 · Un pipeline MAUDE en Python",
        paragraphs: [
          "Le prototype lit les archives officielles, rapproche les signalements et les codes de problèmes, puis construit des instantanés trimestriels. Il conserve des audits de lecture et les empreintes des fichiers sources.",
          "Les méthodes incluent la popularité, la fréquence chez les voisins, la régression logistique, des arbres de profondeur un, une factorisation spectrale, des embeddings BPR et GraphSAGE.",
          "NumPy soutient les calculs numériques. Les expériences récentes utilisent scikit-learn et Numba ; Matplotlib sert aux figures des rapports.",
        ],
      },
      {
        heading: "03 · Respecter la chronologie",
        paragraphs: [
          "L’évaluation MAUDE progresse trimestre par trimestre, avec réentraînement annuel et mise à jour de l’historique après chaque classement. Recall@k, MRR et analyses par quantité d’historique décrivent les performances et leurs limites.",
          "Pour CMS, le protocole impose que les variables de l’établissement et de ses pairs précèdent l’inspection ciblée. Les comparaisons portent sur les mêmes observations, avec une analyse d’incertitude regroupée par entité.",
        ],
      },
      {
        heading: "04 · Un benchmark reproductible",
        paragraphs: [
          "Le dépôt publie les tâches, leurs contrats temporels, les manifestes de sources, les résultats et les rapports versionnés. Une interface commune permet de charger une tâche, produire des prédictions et les évaluer.",
          "Les analyses comparent les méthodes à observations identiques, avec ablations et intervalles d’incertitude. Les résultats restent exploratoires et ne constituent pas une conclusion générale sur la supériorité des graphes.",
        ],
      },
    ],
    sources: {
      label: "Sources et état de publication",
      entries: [
        {
          label: "Dépôt HealthGraphBench",
          href: repository,
          detail:
            "Code, contrats des tâches, rapports et résultats publics. Les expériences récentes prolongent le socle versionné.",
        },
        {
          label: "Dépendances et environnement",
          href: `${source}/pyproject.toml`,
          detail:
            "NumPy pour le socle ; scikit-learn et Numba dans les expériences récentes, Matplotlib pour les figures.",
        },
        {
          label: "FDA · fichiers MDR / MAUDE",
          href: "https://www.fda.gov/medical-devices/medical-device-reporting-mdr-how-report-medical-device-problems/mdr-data-files",
          detail:
            "Sources officielles des signalements de dispositifs médicaux.",
        },
        {
          label: "CMS · Health Citations",
          href: "https://data.cms.gov/provider-data/dataset/r5ix-sfxw",
          detail: "Source officielle des constats d’inspection.",
        },
        {
          label: "Exemple exécuté",
          href: "https://github.com/carabistouflette/portfolio/blob/main/scripts/evidence/meddatatrace_example.py",
          detail: "Scénario synthétique et assertions sur les fonctions MAUDE.",
        },
        {
          label: "Provenance de l’exécution",
          href: "/evidence/provenance.json",
          detail:
            "Empreintes des fichiers du prototype utilisés pour l’exemple.",
        },
      ],
    },
    homeLabel: "Retour au portfolio",
    counterpartLabel: "Read in English",
    languageLabel: "Changer de langue",
  },
  en: {
    title: "HealthGraphBench",
    question: "When does graph structure add predictive value?",
    kicker: "Independent research · Python · public health data",
    summary:
      "I compare tabular and relational methods on public health data: FDA MAUDE reports, facility inspections and Medicare Part D prescribing records.",
    atGlance: {
      label: "Project details",
      entries: [
        {
          label: "Data studied",
          value: "FDA MAUDE · CMS inspections · Medicare Part D",
        },
        {
          label: "Status",
          value: "Public code and results · exploratory benchmark",
        },
        {
          label: "Libraries",
          value: "NumPy · Scikit-learn · Numba · Matplotlib",
        },
      ],
    },
    technicalLabel: "Examine the approach",
    roleLabel: "My work",
    role: "I define the tasks and protocol, build the MAUDE pipeline in Python and compare methods while respecting temporal cutoffs.",
    relatedProject: {
      label: "View the HealthGraphBench repository",
      href: repository,
    },
    path: "/en/projects/meddatatrace/",
    mediaLabel: "The experimental approach",
    figure: {
      kind: "diagram",
      title: "From dated observations to model comparison",
      alt: "Three steps: prepare FDA and CMS sources, compare models, then evaluate on later periods.",
      caption:
        "The protocol separates the value of relational information from the value of the model using it.",
      source: "HealthGraphBench code and protocol",
      sourceHref: `${source}/README.md`,
      nodes: [
        {
          title: "Prepare the data",
          detail: "Link entities, date observations and audit the sources.",
        },
        {
          title: "Compare methods",
          detail:
            "Entity-local history, neighborhood aggregates and learned representations.",
        },
        {
          title: "Evaluate over time",
          detail:
            "Predict later periods and examine paired differences and uncertainty.",
        },
      ],
    },
    demonstration: {
      heading: "An executed example: keep the future out of history",
      description:
        "Two fictional quarters are passed to the public repository’s MAUDE functions. This example checks candidate selection without measuring predictive quality on real data.",
      output: temporalExampleOutput,
      steps: [
        {
          heading: "1 · Build the past",
          description:
            "In the first quarter, A is linked to problem 1 and B to problem 2. Only those observations enter the history.",
        },
        {
          heading: "2 · Filter candidates",
          description:
            "For A, problem 2 is known elsewhere. Problem 3, still unknown in the history, is excluded from this evaluation.",
        },
        {
          heading: "3 · Advance after evaluation",
          description:
            "Second-quarter observations are added after ranking candidates, preparing the history for the next quarter.",
        },
      ],
      download: {
        label: "Download the execution output",
        href: "/evidence/meddatatrace-output.txt",
      },
    },
    sections: [
      {
        heading: "01 · Three concrete tasks",
        paragraphs: [
          "The project asks whether relational context provides useful information, then whether a learned model improves on simple aggregates. A graph advantage remains an empirical question.",
        ],
        points: [
          {
            label: "FDA MAUDE",
            detail:
              "Rank product–problem relationships that may be observed for the first time in a later quarter.",
          },
          {
            label: "CMS",
            detail:
              "Study serious deficiencies recorded at facility inspections using facility history and ownership relationships.",
          },
          {
            label: "Medicare Part D",
            detail:
              "Rank first observed published prescriber–drug relationships as a replication task in version 0.2.",
          },
        ],
      },
      {
        heading: "02 · A Python MAUDE pipeline",
        paragraphs: [
          "The prototype reads official archives, joins reports and problem codes, then builds quarterly snapshots. It retains parser audits and source-file hashes.",
          "Methods include popularity, neighbor frequency, logistic regression, boosted stumps, spectral factorization, BPR embeddings and GraphSAGE.",
          "NumPy supports numerical computation. Recent experiments use scikit-learn and Numba; Matplotlib produces report figures.",
        ],
      },
      {
        heading: "03 · Respect temporal boundaries",
        paragraphs: [
          "MAUDE evaluation proceeds quarter by quarter, with annual refitting and history updates after each ranking. Recall@k, MRR and breakdowns by prior support describe performance and its limits.",
          "For CMS, the protocol requires facility and peer features to precede the target inspection. Comparisons use identical observations, with uncertainty clustered by entity.",
        ],
      },
      {
        heading: "04 · A reproducible benchmark",
        paragraphs: [
          "The repository publishes tasks, temporal contracts, source manifests, results and versioned reports. A common interface supports loading a task, producing predictions and evaluating them.",
          "Analyses compare methods on identical observations, with ablations and uncertainty intervals. Results remain exploratory and do not establish a general advantage for graph methods.",
        ],
      },
    ],
    sources: {
      label: "Sources and publication status",
      entries: [
        {
          label: "HealthGraphBench repository",
          href: repository,
          detail:
            "Public code, task contracts, reports and results. Recent experiments build on the versioned benchmark core.",
        },
        {
          label: "Dependencies and environment",
          href: `${source}/pyproject.toml`,
          detail:
            "NumPy for the core; scikit-learn and Numba for recent experiments, Matplotlib for figures.",
        },
        {
          label: "FDA · MDR / MAUDE data files",
          href: "https://www.fda.gov/medical-devices/medical-device-reporting-mdr-how-report-medical-device-problems/mdr-data-files",
          detail: "Official medical-device reporting sources.",
        },
        {
          label: "CMS · Health Citations",
          href: "https://data.cms.gov/provider-data/dataset/r5ix-sfxw",
          detail: "Official inspection citation data.",
        },
        {
          label: "Executed example",
          href: "https://github.com/carabistouflette/portfolio/blob/main/scripts/evidence/meddatatrace_example.py",
          detail: "Synthetic scenario and assertions using MAUDE functions.",
        },
        {
          label: "Execution provenance",
          href: "/evidence/provenance.json",
          detail: "Hashes of the prototype files used in the example.",
        },
      ],
    },
    homeLabel: "Back to portfolio",
    counterpartLabel: "Lire en français",
    languageLabel: "Change language",
  },
};
