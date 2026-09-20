<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const glyphs = [
  {
    d: "M719 772l20 2v26h-105c-159 0 -203 -146 -297 -319h-67v251c0 48 46 39 102 41v27h-347v-27c60 -2 102 7 102 -41v-559c0 -53 -4 -51 -102 -51v-27h347c161 0 268 56 268 174c0 84 -59 161 -169 194h2c42 85 148 298 246 309zM338 449c96 0 162 -75 162 -155c0 -109 -66 -165 -172 -165h-58v320h68z",
  },
  {
    transform: "translate(674 0)",
    d: "M320 811c-155 0 -276 -108 -276 -267c0 -158 131 -262 276 -262s276 104 276 262c0 159 -121 267 -276 267zM320 319c-91 0 -133 87 -133 222s40 233 133 233c92 0 133 -98 133 -233s-41 -222 -133 -222z",
  },
  {
    transform: "translate(1249 0)",
    d: "M219 403c58 -42 104 -64 129 -64c70 0 140 68 140 195c0 151 -70 236 -160 236c-52 0 -85 -25 -109 -49v-318zM-8 109c23 -6 42 -10 56 -10c24 0 35 12 35 47v608c42 20 138 57 235 57c201 0 308 -115 308 -290c0 -170 -127 -239 -244 -239c-60 0 -136 56 -163 75v-328l-227 51v29z",
  },
  {
    transform: "translate(1854 0)",
    d: "M30 360v-28l223 -50v446c0 48 32 43 87 45v27h-310v-27c45 -2 87 3 87 -45v-325c0 -57 -2 -60 -87 -43zM184 193c43 0 85 -33 85 -82s-42 -82 -85 -82s-85 33 -85 82s42 82 85 82z",
  },
  {
    transform: "translate(2142 0)",
    d: "M465 455c0 -70 -24 -104 -79 -104c-49 0 -99 46 -133 68v309c0 48 37 43 87 45v27h-310v-27c45 -2 87 3 87 -45v-324c0 -38 -1 -51 -26 -51c-13 0 -32 3 -61 9v-27l223 -51v90c57 -35 132 -92 194 -92c107 0 154 61 154 154v292c0 48 32 43 87 45v27h-310v-27c45 -2 87 3 87 -45v-273z",
  },
] as const;

const hydrated = ref(false);
const reducedMotion = ref(false);
let mediaQuery: MediaQueryList | undefined;

const animated = computed(() => hydrated.value && !reducedMotion.value);

const updateReducedMotion = (): void => {
  reducedMotion.value = mediaQuery?.matches ?? false;
};

onMounted(() => {
  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  updateReducedMotion();
  mediaQuery.addEventListener("change", updateReducedMotion);
  hydrated.value = true;
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener("change", updateReducedMotion);
});
</script>

<template>
  <span
    aria-hidden="true"
    class="hero-name-last block relative ml-[0.12em] mt-3 text-transparent [-webkit-text-stroke:1px_#a9c8db] md:[-webkit-text-stroke:1.5px_#a9c8db] forced-colors:text-[CanvasText]"
  >
    <span
      :class="['hero-name-fallback', animated && 'hero-name-fallback-active']"
      >Robin</span
    >
    <svg
      v-if="animated"
      class="hero-robin-trace hero-robin-trace-active"
      viewBox="0 0 2890 1000"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g
        v-for="(glyph, index) in glyphs"
        :key="index"
        :transform="glyph.transform"
      >
        <path
          v-for="(path, pathIndex) in glyph.d.split(/(?=M)/)"
          :key="pathIndex"
          pathLength="1"
          :d="path"
        />
      </g>
    </svg>
  </span>
</template>
