<script setup lang="ts">
import {
  siPython, siRust, siTypescript, siOpenjdk, siC, siAstro, siReact,
  siNextdotjs, siVuedotjs, siNuxt, siTailwindcss, siFastapi, siFlask,
  siSpringboot, siThymeleaf, siPytorch, siScikitlearn, siPandas, siPolars,
  siHuggingface, siLangchain, siHaystack, siVllm, siPostgresql,
  siMysql, siMariadb, siSqlite, siMongodb, siApachecassandra, siNeo4j,
  siDocker, siPodman, siApachemaven, siAnsible, siTerraform,
  siGitlab, siGithubactions, siTokio, siWebassembly, siLinux,
  siCisco, siOpenssl, siWireshark, siZap,
  siNumpy, siScipy, siLightning, siWeightsandbiases, siMlflow,
  siOptuna, siTensorflow, siPlotly,
  type SimpleIcon,
} from "simple-icons";

const props = withDefaults(defineProps<{ name: string; className?: string }>(), {
  className: "h-6 w-6 shrink-0",
});

const brands: Record<string, SimpleIcon> = {
  Python: siPython, Rust: siRust, TypeScript: siTypescript, Java: siOpenjdk,
  C: siC, Astro: siAstro, React: siReact, "Next.js": siNextdotjs,
  "Vue.js": siVuedotjs, "Nuxt.js": siNuxt, "Tailwind CSS": siTailwindcss,
  FastAPI: siFastapi, Flask: siFlask, "Spring Boot": siSpringboot,
  Thymeleaf: siThymeleaf, PyTorch: siPytorch, "Scikit-learn": siScikitlearn,
  Pandas: siPandas, Polars: siPolars, Transformers: siHuggingface, LangChain: siLangchain,
  Haystack: siHaystack, vLLM: siVllm, PostgreSQL: siPostgresql,
  MySQL: siMysql, MariaDB: siMariadb, SQLite: siSqlite, MongoDB: siMongodb,
  Cassandra: siApachecassandra, Neo4j: siNeo4j, Docker: siDocker,
  Podman: siPodman, Maven: siApachemaven, Ansible: siAnsible,
  Terraform: siTerraform, "GitLab CI/CD": siGitlab,
  "GitHub Actions": siGithubactions, Tokio: siTokio, WebAssembly: siWebassembly,
  Linux: siLinux, "Cisco Packet Tracer": siCisco, OpenSSL: siOpenssl,
  Wireshark: siWireshark, "ZAP Proxy": siZap,
  NumPy: siNumpy, SciPy: siScipy, Datasets: siHuggingface,
  Tokenizers: siHuggingface, Accelerate: siHuggingface, PEFT: siHuggingface,
  TRL: siHuggingface, Safetensors: siHuggingface,
  "PyTorch Lightning": siLightning, "Weights & Biases": siWeightsandbiases,
  TensorBoard: siTensorflow, MLflow: siMlflow, Optuna: siOptuna, Plotly: siPlotly,
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

const icon = brands[props.name];
const glyph = glyphs[props.name];
const image = images[props.name];
if (!icon && !glyph && !image) throw new Error(`Missing toolbox icon: ${props.name}`);

const color = (() => {
  if (!icon) return "#9dc7df";
  const channels = [0, 2, 4].map((offset) => parseInt(icon.hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return icon.hex === "000000" ? "#eaf4fa" : luminance < 0.12 ? `color-mix(in srgb, #${icon.hex} 55%, #eaf4fa)` : `#${icon.hex}`;
})();
</script>

<template>
  <img v-if="image" :src="`/tool-icons/${image}.webp`" alt="" width="24" height="24" :class="`${props.className} object-contain`" aria-hidden="true" data-tool-icon />
  <svg v-else :class="props.className" :style="{ color }" viewBox="0 0 24 24" :fill="icon ? 'currentColor' : 'none'" :stroke="icon ? undefined : 'currentColor'" :stroke-width="icon ? undefined : 1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" data-tool-icon>
    <path :d="icon ? icon.path : glyph" />
  </svg>
</template>
