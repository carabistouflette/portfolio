import type { CaseStudy, Locale } from "./portfolio";

const repository = "https://github.com/carabistouflette/MedDataTrace";
// Public main inspected for this page; local research drafts may differ.
const source = `${repository}/blob/71f1d6e6545c1effb5c1b687afaf5b853a2c5191`;

export const meddatatrace: Record<Locale, CaseStudy> = {
  fr: {
    title: "MedDataTrace",
    question: "Quelle preuve relie une évaluation médicale à ses données ?",
    kicker: "Recherche personnelle · Python · provenance des données",
    summary:
      "Le nom d’un jeu de données dans un article ne suffit pas à identifier sa version ou son utilisation dans une expérience. MedDataTrace cherche à reconstruire cette chaîne de preuves pour les évaluations en imagerie médicale.",
    atGlance: {
      label: "Repères du projet",
      entries: [
        {
          label: "Livrables publics",
          value: "Spécification, code de référence et protocole pilote",
        },
        {
          label: "État",
          value: "Recherche en cours · pilote public à activer",
        },
      ],
    },
    technicalLabel: "Examiner la méthode",
    roleLabel: "Mon travail",
    role: "Je travaille sur la spécification, la sémantique de référence et les conditions d’admission des références. L’objectif est de rendre explicites les preuves nécessaires pour conclure et les cas où il faut s’abstenir.",
    path: "/projets/meddatatrace/",
    mediaLabel: "Quatre états de preuve",
    figure: {
      kind: "diagram",
      title: "Les états de l’implémentation de référence",
      alt: "Quatre états indépendants : preuve insuffisante, présence étayée, absence étayée, preuves contradictoires.",
      caption:
        "Les états portent sur un périmètre explicite. Ce schéma présente la sémantique synthétique du code.",
      source: "reference_semantics/semantics.py",
      sourceHref: `${source}/research/specs/reference_semantics/semantics.py`,
      nodes: [
        {
          title: "UNKNOWN",
          detail: "Les éléments disponibles ne permettent pas de conclure.",
        },
        {
          title: "APPLIES",
          detail: "Une preuve positive étaye la présence du problème.",
        },
        {
          title: "NOT_APPLICABLE",
          detail:
            "Une preuve négative étaye son absence dans le périmètre examiné.",
        },
        {
          title: "CONFLICTING",
          detail: "Les éléments positifs et négatifs se contredisent.",
        },
      ],
    },
    demonstration: {
      heading: "Un exemple exécuté : quand faut-il s’abstenir ?",
      description:
        "Ces entrées synthétiques sont passées aux fonctions du dépôt public. Elles illustrent le contrat du code, sans évaluer une étude médicale réelle.",
      output:
        "presence=false, absence=false -> UNKNOWN\npresence=true, absence=false -> APPLIES\npresence=false, absence=true -> NOT_APPLICABLE\npresence=true, absence=true -> CONFLICTING\nIncomplete artifact linkage -> REFERENCE_UNSCORABLE; gold_state=None",
      steps: [
        {
          heading: "1 · Distinguer les preuves",
          description:
            "Deux indicateurs disent si une preuve positive ou négative est disponible. Sans l’une ni l’autre, la réponse reste UNKNOWN ; une absence de preuve ne devient pas une preuve d’absence.",
        },
        {
          heading: "2 · Examiner la chaîne",
          description:
            "Dans le dernier cas, une évaluation est identifiée, mais son lien avec un artefact n’est pas étayé. Une référence fiable ne peut donc pas être constituée.",
        },
        {
          heading: "3 · Refuser une fausse certitude",
          description:
            "La fonction admit renvoie REFERENCE_UNSCORABLE et aucun état de référence. Ce refus est distinct de UNKNOWN : il concerne la possibilité même d’évaluer la méthode.",
        },
      ],
      download: {
        label: "Télécharger la sortie de l’exécution",
        href: "/evidence/meddatatrace-output.txt",
      },
    },
    sections: [
      {
        heading: "01 · Définir ce que l’on évalue",
        paragraphs: [
          "Chaque évaluation précise le problème, le périmètre, l’instantané des données et la nature de l’affirmation : dispositif rapporté, procédure documentée ou artefact lié à l’exécution.",
        ],
      },
      {
        heading: "02 · Admettre une référence",
        paragraphs: [
          "Le code distingue un état de preuve d’une référence utilisable pour évaluer une méthode. Une chaîne incomplète entre évaluation et artefact conduit à REFERENCE_UNSCORABLE. Une incertitude explicitement justifiée peut, elle, constituer une référence reproductible.",
        ],
      },
      {
        heading: "03 · Vérifier le contrat du code",
        paragraphs: [
          "Les tests de conformité vérifient la gestion des états et les règles d’admission sur des exemples synthétiques. Ils ne vérifient ni le contenu scientifique des sources ni l’utilité de la méthode sur des études réelles.",
        ],
      },
      {
        heading: "04 · Passer du protocole à l’étude",
        paragraphs: [
          "Le dépôt public documente les gabarits et les conditions d’activation du micro-pilote. Les performances d’extraction, la validité scientifique et les bénéfices pour les utilisateurs restent à mesurer.",
        ],
        points: [
          {
            label: "État présenté",
            detail:
              "Le protocole public ne fournit pas de mesure de précision ni de résultat clinique validé.",
          },
        ],
      },
    ],
    sources: {
      label: "Code et documents de référence",
      entries: [
        {
          label: "Exemple exécuté",
          href: "https://github.com/carabistouflette/portfolio/blob/main/scripts/evidence/meddatatrace_example.py",
          detail: "Entrées synthétiques et assertions de la démonstration.",
        },
        {
          label: "README public",
          href: `${source}/README.md`,
          detail: "Périmètre du projet et état du pilote.",
        },
        {
          label: "Sémantique et tests",
          href: `${repository}/tree/71f1d6e6545c1effb5c1b687afaf5b853a2c5191/research/specs/reference_semantics`,
          detail:
            "États de preuve, admission des références et tests synthétiques.",
        },
        {
          label: "Protocole pilote",
          href: `${source}/research/specs/pilot_templates/operational_record.json`,
          detail: "Conditions d’activation et statut du pilote public.",
        },
      ],
    },
    homeLabel: "Retour au portfolio",
    counterpartLabel: "Read in English",
    languageLabel: "Changer de langue",
  },
  en: {
    title: "MedDataTrace",
    question: "What evidence links a medical evaluation to its datasets?",
    kicker: "Personal research · Python · dataset provenance",
    summary:
      "A dataset name in a paper does not identify its version or how it was used in an experiment. MedDataTrace seeks to reconstruct this evidence chain for medical-imaging evaluations.",
    atGlance: {
      label: "Project details",
      entries: [
        {
          label: "Public artifacts",
          value: "Specification, reference code and pilot protocol",
        },
        {
          label: "Status",
          value: "Research in progress · public pilot not yet activated",
        },
      ],
    },
    technicalLabel: "Examine the method",
    roleLabel: "My work",
    role: "I work on the specification, reference semantics and reference-admission rules. The goal is to make the evidence needed for a conclusion explicit, including when to abstain.",
    path: "/en/projects/meddatatrace/",
    mediaLabel: "Four evidence states",
    figure: {
      kind: "diagram",
      title: "States in the reference implementation",
      alt: "Four independent states: insufficient evidence, supported presence, supported absence and conflicting evidence.",
      caption:
        "States apply to an explicit scope. This diagram describes the code’s synthetic semantics.",
      source: "reference_semantics/semantics.py",
      sourceHref: `${source}/research/specs/reference_semantics/semantics.py`,
      nodes: [
        {
          title: "UNKNOWN",
          detail: "Available evidence does not support a conclusion.",
        },
        {
          title: "APPLIES",
          detail: "Positive evidence supports the issue’s presence.",
        },
        {
          title: "NOT_APPLICABLE",
          detail:
            "Negative evidence supports its absence within the assessed scope.",
        },
        {
          title: "CONFLICTING",
          detail: "Positive and negative evidence conflict.",
        },
      ],
    },
    demonstration: {
      heading: "An executed example: when should the method abstain?",
      description:
        "These synthetic inputs were passed to the public repository’s functions. They illustrate the code’s contract without assessing a real medical study.",
      output:
        "presence=false, absence=false -> UNKNOWN\npresence=true, absence=false -> APPLIES\npresence=false, absence=true -> NOT_APPLICABLE\npresence=true, absence=true -> CONFLICTING\nIncomplete artifact linkage -> REFERENCE_UNSCORABLE; gold_state=None",
      steps: [
        {
          heading: "1 · Separate the evidence",
          description:
            "Two flags indicate whether positive or negative support exists. With neither, the answer remains UNKNOWN; missing evidence does not become evidence of absence.",
        },
        {
          heading: "2 · Inspect the chain",
          description:
            "In the last case, an evaluation is identified, but its link to an artifact is unsupported. A reliable reference cannot therefore be established.",
        },
        {
          heading: "3 · Avoid false certainty",
          description:
            "The admit function returns REFERENCE_UNSCORABLE and no reference state. This differs from UNKNOWN: it concerns whether the method can be evaluated at all.",
        },
      ],
      download: {
        label: "Download the execution output",
        href: "/evidence/meddatatrace-output.txt",
      },
    },
    sections: [
      {
        heading: "01 · Define the assessment",
        paragraphs: [
          "Each assessment identifies the issue, scope, data snapshot and claim target: a reported setup, a documented procedure or an execution-linked artifact.",
        ],
      },
      {
        heading: "02 · Admit a reference",
        paragraphs: [
          "The code separates an evidence state from a reference suitable for evaluating a method. An incomplete evaluation-to-artifact chain yields REFERENCE_UNSCORABLE. Explicitly justified uncertainty can itself be a reproducible reference.",
        ],
      },
      {
        heading: "03 · Check the code’s contract",
        paragraphs: [
          "Conformance tests check state handling and admission rules on synthetic examples. They do not verify scientific source content or establish usefulness on real studies.",
        ],
      },
      {
        heading: "04 · Move from protocol to study",
        paragraphs: [
          "The public repository documents templates and activation conditions for the micro-pilot. Extraction performance, scientific validity and user benefit remain to be measured.",
        ],
        points: [
          {
            label: "Presented scope",
            detail:
              "The public protocol provides no measured accuracy or validated clinical result.",
          },
        ],
      },
    ],
    sources: {
      label: "Reference code and documents",
      entries: [
        {
          label: "Executed example",
          href: "https://github.com/carabistouflette/portfolio/blob/main/scripts/evidence/meddatatrace_example.py",
          detail: "Synthetic inputs and demonstration assertions.",
        },
        {
          label: "Public README",
          href: `${source}/README.md`,
          detail: "Project scope and pilot status.",
        },
        {
          label: "Semantics and tests",
          href: `${repository}/tree/71f1d6e6545c1effb5c1b687afaf5b853a2c5191/research/specs/reference_semantics`,
          detail: "Evidence states, reference admission and synthetic tests.",
        },
        {
          label: "Pilot protocol",
          href: `${source}/research/specs/pilot_templates/operational_record.json`,
          detail: "Public pilot activation conditions and status.",
        },
      ],
    },
    homeLabel: "Back to portfolio",
    counterpartLabel: "Lire en français",
    languageLabel: "Change language",
  },
};
