<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import ToolIcon from "./ToolIcon.vue";

interface SkillItem {
  name: string;
  projectIds: string[];
}

interface SkillGroup {
  label: string;
  description: string;
  items: SkillItem[];
}

interface Project {
  id: string;
  title: string;
  url?: string;
}

const props = defineProps<{
  groups: SkillGroup[];
  projects: Project[];
  projectLabel: string;
}>();

const expanded = ref(new Set<number>());
const closing = ref(new Set<number>());
const hydrated = ref(false);
const reducedMotion = ref(false);
let mediaQuery: MediaQueryList | undefined;
const catalogRoot = ref<HTMLElement | null>(null);
const closeTimers = new Map<number, number>();
const CLOSE_DURATION = 320;

const projectById = computed(() => new Map(props.projects.map((project) => [project.id, project])));
const cardMotion = computed(() => reducedMotion.value ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } });
const cardInitial = computed(() => reducedMotion.value ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 });

const isExpanded = (index: number): boolean => expanded.value.has(index);
const isOpen = (index: number): boolean => isExpanded(index) || closing.value.has(index);

const toggle = (index: number): void => {
  const nextExpanded = new Set(expanded.value);
  const nextClosing = new Set(closing.value);
  const activeTimer = closeTimers.get(index);
  if (activeTimer !== undefined) {
    window.clearTimeout(activeTimer);
    closeTimers.delete(index);
  }

  if (nextExpanded.has(index)) {
    nextExpanded.delete(index);
    nextClosing.add(index);
    const timer = window.setTimeout(() => {
      const current = new Set(closing.value);
      current.delete(index);
      closing.value = current;
      closeTimers.delete(index);
    }, CLOSE_DURATION);
    closeTimers.set(index, timer);
  } else {
    nextExpanded.add(index);
    nextClosing.delete(index);
  }

  expanded.value = nextExpanded;
  closing.value = nextClosing;
};

const relatedProjects = (skill: SkillItem): Project[] => skill.projectIds
  .map((projectId) => projectById.value.get(projectId))
  .filter((project): project is Project => Boolean(project));

const updateReducedMotion = (): void => {
  reducedMotion.value = mediaQuery?.matches ?? false;
};

onMounted(() => {
  const initialExpanded = new Set<number>();
  catalogRoot.value?.querySelectorAll<HTMLDetailsElement>("details").forEach((details, index) => {
    if (details.open) initialExpanded.add(index);
  });
  expanded.value = initialExpanded;
  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  updateReducedMotion();
  mediaQuery.addEventListener("change", updateReducedMotion);
  hydrated.value = true;
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener("change", updateReducedMotion);
  for (const timer of closeTimers.values()) window.clearTimeout(timer);
  closeTimers.clear();
});
</script>

<template>
  <div ref="catalogRoot" class="mt-6 grid items-start gap-6 lg:grid-cols-2">
    <details
      v-for="(group, index) in props.groups"
      :key="group.label"
      data-motion-catalog
      :open="isOpen(index)"
      :class="['group min-w-0 rounded-xl border bg-[#07121b]/45', isExpanded(index) ? 'border-[#9dc7df]/60' : 'border-rule/60']"
    >
      <summary
        :id="`skills-summary-${index}`"
        :aria-controls="`skills-panel-${index}`"
        :aria-expanded="hydrated ? isExpanded(index) : undefined"
        class="cursor-pointer list-none rounded-xl p-6 focus-visible:outline-2 focus-visible:outline-[#9dc7df] focus-visible:outline-offset-4 sm:p-8 [&::-webkit-details-marker]:hidden"
        @click.prevent="toggle(index)"
      >
        <div class="flex items-start justify-between gap-6">
          <div class="min-w-0">
            <h4 class="text-xl font-medium tracking-tight sm:text-2xl">{{ group.label }}</h4>
            <p class="mt-3 max-w-[48ch] text-sm leading-relaxed text-muted">{{ group.description }}</p>
          </div>
          <span class="mt-1 flex shrink-0 items-center gap-4 text-[#9dc7df]" aria-hidden="true">
            <span class="font-mono text-xs">{{ group.items.length }}</span>
            <span :class="['disclosure-mark text-2xl leading-none', isExpanded(index) && 'rotate-45']">+</span>
          </span>
        </div>
        <div :class="['skill-preview mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-paper/90', isExpanded(index) && 'hidden']" :aria-hidden="isExpanded(index)">
          <span v-for="skill in group.items.slice(0, 3)" :key="skill.name" class="inline-flex items-center gap-3"><ToolIcon :name="skill.name" />{{ skill.name }}</span>
          <span v-if="group.items.length > 3" class="font-mono text-xs text-muted">+{{ group.items.length - 3 }}</span>
        </div>
      </summary>

      <div
        :id="`skills-panel-${index}`"
        role="region"
        :class="['skills-panel overflow-hidden', hydrated && 'skills-panel-motion', hydrated && isExpanded(index) && 'skills-panel-open']"
      >
        <div class="skills-panel-inner">
          <ul class="mx-6 grid gap-3 border-t border-rule/50 pb-6 pt-6 sm:mx-8 sm:grid-cols-2 sm:pb-8">
            <li
              v-for="skill in group.items"
              :key="skill.name"
              v-motion
              :initial="cardInitial"
              :enter="cardMotion"
              :hovered="reducedMotion ? undefined : { y: -2, borderColor: 'rgba(157, 199, 223, 0.6)' }"
              class="flex min-w-0 flex-col justify-center rounded-md border border-rule/40 bg-[#050d14]/65 px-4 py-3"
            >
              <div class="flex items-center gap-3"><ToolIcon :name="skill.name" /><span class="break-words font-mono text-sm">{{ skill.name }}</span></div>
              <a v-for="project in relatedProjects(skill)" :key="project.id" class="mt-1 inline-flex min-h-11 items-center gap-2 text-xs text-[#9dc7df] underline hover:text-paper" :href="project.url || `#project-${project.id}`"><span class="sr-only">{{ props.projectLabel }} </span>{{ project.title }}<span aria-hidden="true">↗</span></a>
            </li>
          </ul>
        </div>
      </div>
    </details>
  </div>
</template>
