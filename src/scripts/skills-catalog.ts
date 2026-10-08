import { onPageLoad } from "./page-lifecycle";

const CLOSE_DURATION = 320;

interface Flight {
  clones: HTMLElement[];
  animations: Animation[];
}

interface CatalogItem {
  details: HTMLDetailsElement;
  panel: HTMLElement;
  summary: HTMLElement;
  preview: HTMLElement | null;
  mark: HTMLElement | null;
  expanded: boolean;
  closing: boolean;
  closeTimer?: number;
  flightFrame?: number;
  flight?: Flight;
}

/** Mirrors Vue's `:open="isOpen(index)"`: stays open while the close animation runs. */
const syncItem = (item: CatalogItem): void => {
  const { details, panel, expanded, closing } = item;
  details.open = expanded || closing;
  panel.classList.toggle("skills-panel-open", expanded);
  details.classList.toggle("border-[#9dc7df]/60", expanded);
  details.classList.toggle("border-rule/60", !expanded);
  item.mark?.classList.toggle("rotate-45", expanded);
  if (item.preview) {
    item.preview.classList.toggle("hidden", expanded);
    item.preview.setAttribute("aria-hidden", String(expanded));
  }
  item.summary.setAttribute("aria-expanded", String(expanded));
};

const clearFlight = (item: CatalogItem): void => {
  if (item.flightFrame !== undefined) {
    cancelAnimationFrame(item.flightFrame);
    item.flightFrame = undefined;
  }
  if (item.flight) {
    for (const animation of item.flight.animations) animation.cancel();
    for (const clone of item.flight.clones) clone.remove();
    item.flight = undefined;
  }
  item.details.classList.remove("skills-icons-moving");
};

const clearCloseTimer = (item: CatalogItem): void => {
  if (item.closeTimer !== undefined) {
    window.clearTimeout(item.closeTimer);
    item.closeTimer = undefined;
  }
};

const playIconFlight = (
  item: CatalogItem,
  sources: HTMLElement[],
  sourceRects: DOMRect[],
  targetSelector: string,
  signal: AbortSignal,
  reducedMotion: MediaQueryList,
): void => {
  item.flightFrame = requestAnimationFrame(() => {
    item.flightFrame = undefined;
    if (signal.aborted || reducedMotion.matches) {
      clearFlight(item);
      return;
    }
    const targets = [
      ...item.details.querySelectorAll<HTMLElement>(targetSelector),
    ].slice(0, sources.length);
    if (targets.length !== sources.length) {
      clearFlight(item);
      return;
    }
    const targetRects = targets.map((target) => target.getBoundingClientRect());

    const clones: HTMLElement[] = [];
    const animations: Animation[] = [];
    for (const [iconIndex, source] of sources.entries()) {
      const sourceRect = sourceRects[iconIndex];
      const targetRect = targetRects[iconIndex];
      const clone = source.cloneNode(true) as HTMLElement;
      clone.removeAttribute("data-preview-icon");
      clone.removeAttribute("data-panel-icon");
      clone.removeAttribute("style");
      clone.classList.add("skills-icon-flight");
      Object.assign(clone.style, {
        left: `${sourceRect.left}px`,
        top: `${sourceRect.top}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
      });
      document.body.appendChild(clone);
      clones.push(clone);
      animations.push(
        clone.animate(
          [
            { transform: "translate3d(0, 0, 0)" },
            {
              transform: `translate3d(${targetRect.left - sourceRect.left}px, ${targetRect.top - sourceRect.top}px, 0)`,
            },
          ],
          {
            duration: CLOSE_DURATION,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "both",
          },
        ),
      );
    }

    item.flight = { clones, animations };
    for (const animation of animations) {
      animation.finished
        .catch(() => undefined)
        .then(() => {
          if (item.flight?.animations === animations) clearFlight(item);
        });
    }
  });
};

const setupCatalog = (root: HTMLElement, signal: AbortSignal): void => {
  const items: CatalogItem[] = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  for (const details of root.querySelectorAll<HTMLDetailsElement>(
    "details[data-motion-catalog]",
  )) {
    const summary = details.querySelector("summary");
    const panel = details.querySelector<HTMLElement>(".skills-panel");
    if (!summary || !panel) continue;
    items.push({
      details,
      panel,
      summary,
      preview: details.querySelector<HTMLElement>(".skill-preview"),
      mark: details.querySelector<HTMLElement>(".disclosure-mark"),
      expanded: details.open,
      closing: false,
    });
  }

  for (const item of items) {
    // With JS the panel animates through the grid-rows motion classes;
    // without JS the native <details> behavior stays intact.
    item.panel.classList.add("skills-panel-motion");
    syncItem(item);

    item.summary.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        clearFlight(item);
        clearCloseTimer(item);

        if (reducedMotion.matches) {
          item.expanded = !item.expanded;
          item.closing = false;
          syncItem(item);
          return;
        }

        const opening = !item.expanded;
        const sourceSelector = opening
          ? "[data-preview-icon]"
          : "[data-panel-icon]";
        const targetSelector = opening
          ? "[data-panel-icon]"
          : "[data-preview-icon]";
        const sources = [
          ...item.details.querySelectorAll<HTMLElement>(sourceSelector),
        ].slice(0, 3);
        if (!sources.length) {
          item.expanded = opening;
          item.closing = false;
          syncItem(item);
          return;
        }
        const sourceRects = sources.map((source) =>
          source.getBoundingClientRect(),
        );

        item.details.classList.add("skills-icons-moving");
        item.expanded = opening;
        item.closing = !opening;
        syncItem(item);

        playIconFlight(
          item,
          sources,
          sourceRects,
          targetSelector,
          signal,
          reducedMotion,
        );

        if (!opening) {
          item.closeTimer = window.setTimeout(() => {
            item.closeTimer = undefined;
            item.closing = false;
            syncItem(item);
          }, CLOSE_DURATION);
        }
      },
      { signal },
    );

    reducedMotion.addEventListener(
      "change",
      () => {
        if (!reducedMotion.matches) return;
        clearCloseTimer(item);
        clearFlight(item);
        item.closing = false;
        syncItem(item);
      },
      { signal },
    );

    signal.addEventListener(
      "abort",
      () => {
        clearCloseTimer(item);
        clearFlight(item);
      },
      { once: true },
    );
  }
};

onPageLoad((signal) => {
  for (const root of document.querySelectorAll<HTMLElement>(
    "[data-skills-catalog]",
  )) {
    setupCatalog(root, signal);
  }
});
