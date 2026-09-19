import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import ToolIcon from "./ToolIcon";
import { useEffect, useMemo, useState } from "react";

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

interface Props {
  groups: SkillGroup[];
  projects: Project[];
  projectLabel: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function SkillsCatalog({ groups, projects, projectLabel }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const toggle = (index: number): void => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        {groups.map((group, index) => {
          const isExpanded = expanded.has(index);
          const panelId = `skills-panel-${index}`;
          const summaryId = `skills-summary-${index}`;
          const previewItems = group.items.slice(0, 3);

          return (
            <motion.details
              key={group.label}
              open={isExpanded}
              data-motion-catalog=""
              layout
              className={`group min-w-0 rounded-xl border bg-[#07121b]/45 ${isExpanded ? "border-[#9dc7df]/60" : "border-rule/60"}`}
              transition={{ layout: { duration: reducedMotion ? 0 : 0.32, ease } }}
            >
              <summary
                id={summaryId}
                aria-controls={panelId}
                aria-expanded={hydrated ? isExpanded : undefined}
                className="cursor-pointer list-none rounded-xl p-6 focus-visible:outline-2 focus-visible:outline-[#9dc7df] focus-visible:outline-offset-4 sm:p-8 [&::-webkit-details-marker]:hidden"
                onClick={(event) => {
                  event.preventDefault();
                  toggle(index);
                }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <h4 className="text-xl font-medium tracking-tight sm:text-2xl">{group.label}</h4>
                    <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-muted">{group.description}</p>
                  </div>
                  <motion.span
                    className="mt-1 flex shrink-0 items-center gap-4 text-[#9dc7df]"
                    animate={{ color: isExpanded ? "#eaf4fa" : "#9dc7df" }}
                    transition={{ duration: reducedMotion ? 0 : 0.22 }}
                    aria-hidden="true"
                  >
                    <span className="font-mono text-xs">{group.items.length}</span>
                    <motion.span
                      className="text-2xl leading-none"
                      animate={{ rotate: isExpanded ? 45 : 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.22, ease }}
                    >
                      +
                    </motion.span>
                  </motion.span>
                </div>
                <div className={`skill-preview mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-paper/90 ${isExpanded ? "hidden" : ""}`} aria-hidden={isExpanded}>
                  {previewItems.map((skill) => <span key={skill.name} className="inline-flex items-center gap-3"><ToolIcon name={skill.name} />{skill.name}</span>)}
                  {group.items.length > 3 && <span className="font-mono text-xs text-muted">+{group.items.length - 3}</span>}
                </div>
              </summary>
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={summaryId}
                  initial={false}
                  animate={hydrated ? (isExpanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }) : undefined}
                  transition={{ duration: reducedMotion ? 0 : 0.32, ease }}
                  style={{ overflow: "hidden" }}
                >
                  <ul className="mx-6 grid gap-3 border-t border-rule/50 pb-6 pt-6 sm:mx-8 sm:grid-cols-2 sm:pb-8">
                    {group.items.map((skill) => {
                      const relatedProjects = skill.projectIds
                        .map((projectId) => projectById.get(projectId))
                        .filter((project): project is Project => Boolean(project));
                      return (
                        <motion.li
                          key={skill.name}
                          layout
                          whileHover={reducedMotion ? undefined : { y: -2, borderColor: "rgba(157, 199, 223, 0.6)" }}
                          transition={{ duration: reducedMotion ? 0 : 0.18, ease }}
                          className="flex min-w-0 flex-col justify-center rounded-md border border-rule/40 bg-[#050d14]/65 px-4 py-3"
                        >
                          <div className="flex items-center gap-3"><ToolIcon name={skill.name} /><span className="break-words font-mono text-sm">{skill.name}</span></div>
                          {relatedProjects.map((project) => <a key={project.id} className="mt-1 inline-flex min-h-11 items-center gap-2 text-xs text-[#9dc7df] underline hover:text-paper" href={project.url || `#project-${project.id}`}><span className="sr-only">{projectLabel} </span>{project.title}<span aria-hidden="true">↗</span></a>)}
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
            </motion.details>
          );
        })}
      </div>
    </MotionConfig>
  );
}
