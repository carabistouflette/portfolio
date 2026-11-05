import {
  siPython,
  siRust,
  siSlint,
  siTypescript,
  siOpenjdk,
  siC,
  siAstro,
  siReact,
  siNextdotjs,
  siVuedotjs,
  siNuxt,
  siTailwindcss,
  siFastapi,
  siFlask,
  siSpringboot,
  siThymeleaf,
  siPytorch,
  siScikitlearn,
  siPandas,
  siPolars,
  siHuggingface,
  siLangchain,
  siHaystack,
  siVllm,
  siPostgresql,
  siMysql,
  siMariadb,
  siSqlite,
  siMongodb,
  siApachecassandra,
  siNeo4j,
  siDocker,
  siPodman,
  siApachemaven,
  siAnsible,
  siTerraform,
  siGitlab,
  siGithubactions,
  siTokio,
  siWebassembly,
  siLinux,
  siCisco,
  siOpenssl,
  siWireshark,
  siZap,
  siNumpy,
  siNumba,
  siScipy,
  siLightning,
  siWeightsandbiases,
  siMlflow,
  siOptuna,
  siTensorflow,
  siPlotly,
  type SimpleIcon,
} from "simple-icons";

export interface ToolIconData {
  /** Full URL of a generated SVG or static WebP asset under /tool-icons/. */
  image?: string;
  /** Inline stroked fallback path for tools without brand icons. */
  glyph?: string;
}

const brands: Record<string, SimpleIcon> = {
  Python: siPython,
  Rust: siRust,
  Slint: siSlint,
  TypeScript: siTypescript,
  Java: siOpenjdk,
  C: siC,
  Astro: siAstro,
  React: siReact,
  "Next.js": siNextdotjs,
  "Vue.js": siVuedotjs,
  "Nuxt.js": siNuxt,
  "Tailwind CSS": siTailwindcss,
  FastAPI: siFastapi,
  Flask: siFlask,
  "Spring Boot": siSpringboot,
  Thymeleaf: siThymeleaf,
  PyTorch: siPytorch,
  "Scikit-learn": siScikitlearn,
  Pandas: siPandas,
  Polars: siPolars,
  Transformers: siHuggingface,
  LangChain: siLangchain,
  Haystack: siHaystack,
  vLLM: siVllm,
  PostgreSQL: siPostgresql,
  MySQL: siMysql,
  MariaDB: siMariadb,
  SQLite: siSqlite,
  MongoDB: siMongodb,
  Cassandra: siApachecassandra,
  Neo4j: siNeo4j,
  Docker: siDocker,
  Podman: siPodman,
  Maven: siApachemaven,
  Ansible: siAnsible,
  Terraform: siTerraform,
  "GitLab CI/CD": siGitlab,
  "GitHub Actions": siGithubactions,
  Tokio: siTokio,
  WebAssembly: siWebassembly,
  Linux: siLinux,
  "Cisco Packet Tracer": siCisco,
  OpenSSL: siOpenssl,
  Wireshark: siWireshark,
  "ZAP Proxy": siZap,
  NumPy: siNumpy,
  Numba: siNumba,
  SciPy: siScipy,
  Datasets: siHuggingface,
  Tokenizers: siHuggingface,
  Accelerate: siHuggingface,
  PEFT: siHuggingface,
  TRL: siHuggingface,
  Safetensors: siHuggingface,
  "PyTorch Lightning": siLightning,
  "Weights & Biases": siWeightsandbiases,
  TensorBoard: siTensorflow,
  MLflow: siMlflow,
  Optuna: siOptuna,
  Plotly: siPlotly,
};

const glyphs: Record<string, string> = {
  Pi: "M3 6h18M8 6v14M16 6v11a3 3 0 0 0 3 3",
  Nmap: "M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 12l9-9M12 3v9h9",
  gRPC: "M3 3h6v6H3zM15 15h6v6h-6zM6 9v9h9M9 6h9v9",
  Tantivy: "M15.5 15.5 21 21M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14",
  Jackson: "M8 3H6v6l-3 3 3 3v6h2M16 3h2v6l3 3-3 3v6h-2M10 9h4M10 15h4",
  Kwik: "M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4",
  "Bouncy Castle":
    "M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6l-8-3ZM8 14V9h2v2h4V9h2v5M8 14h8v3H8z",
};

const images: Record<string, string> = {
  Unsloth: "unsloth",
  bitsandbytes: "bitsandbytes",
  DeepSpeed: "deepspeed",
  Matplotlib: "matplotlib",
  Seaborn: "seaborn",
  Altair: "altair",
};

/** All brand icons referenced by `names`, deduplicated by slug. */
export const brandIconsFor = (names: string[]): SimpleIcon[] => {
  const bySlug = new Map<string, SimpleIcon>();
  for (const name of names) {
    const icon = brands[name];
    if (icon) bySlug.set(icon.slug, icon);
  }
  return [...bySlug.values()];
};

/** Every brand icon in the toolbox, deduplicated by slug. */
export const allBrandIcons: SimpleIcon[] = [
  ...new Map(Object.values(brands).map((icon) => [icon.slug, icon])).values(),
];

/** Lift dark brand colors against the portfolio's dark background. */
export const brandIconColor = (icon: SimpleIcon): string => {
  const channels = [0, 2, 4].map(
    (offset) => parseInt(icon.hex.slice(offset, offset + 2), 16) / 255,
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const luminance =
    0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return icon.hex === "000000"
    ? "#eaf4fa"
    : luminance < 0.12
      ? `color-mix(in srgb, #${icon.hex} 55%, #eaf4fa)`
      : `#${icon.hex}`;
};

export const resolveToolIcon = (name: string): ToolIconData => {
  const icon = brands[name];
  const glyph = glyphs[name];
  const image = images[name];
  if (!icon && !glyph && !image)
    throw new Error(`Missing toolbox icon: ${name}`);

  return {
    image: image
      ? `/tool-icons/${image}.webp`
      : icon
        ? `/tool-icons/${icon.slug}.svg`
        : undefined,
    glyph,
  };
};
