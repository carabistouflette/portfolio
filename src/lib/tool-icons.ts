import {
  siPython,
  siRust,
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
  /** Simple-icons glyph rendered through the page sprite (`use` reference). */
  spriteId?: string;
  /** Static webp asset under /tool-icons/. */
  image?: string;
  /** Inline stroked fallback path for tools without brand icons. */
  glyph?: string;
  /** Resolved CSS color for brand icons. */
  color: string;
}

const brands: Record<string, SimpleIcon> = {
  Python: siPython,
  Rust: siRust,
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
  Nmap: "M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 12l9-9M12 3v9h9",
  gRPC: "M3 3h6v6H3zM15 15h6v6h-6zM6 9v9h9M9 6h9v9",
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

export const resolveToolIcon = (name: string): ToolIconData => {
  const icon = brands[name];
  const glyph = glyphs[name];
  const image = images[name];
  if (!icon && !glyph && !image)
    throw new Error(`Missing toolbox icon: ${name}`);

  let color = "#9dc7df";
  if (icon) {
    const channels = [0, 2, 4].map(
      (offset) => parseInt(icon.hex.slice(offset, offset + 2), 16) / 255,
    );
    const linear = channels.map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
    const luminance =
      0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    color =
      icon.hex === "000000"
        ? "#eaf4fa"
        : luminance < 0.12
          ? `color-mix(in srgb, #${icon.hex} 55%, #eaf4fa)`
          : `#${icon.hex}`;
  }

  return {
    spriteId: icon ? `tool-si-${icon.slug}` : undefined,
    image,
    glyph,
    color,
  };
};
