import { onPageLoad } from "./page-lifecycle";

// Activates the traced "Robin" outline only when motion is allowed; otherwise
// the plain fallback text stays visible (CSS keeps the SVG hidden).
onPageLoad((signal) => {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const sync = (): void => {
    for (const target of document.querySelectorAll<HTMLElement>(
      "[data-robin-trace]",
    )) {
      const animated = !mediaQuery.matches;
      target
        .querySelector("svg")
        ?.classList.toggle("hero-robin-trace-active", animated);
      target
        .querySelector<HTMLElement>(".hero-name-fallback")
        ?.classList.toggle("hero-name-fallback-active", animated);
    }
  };

  sync();
  mediaQuery.addEventListener("change", sync, { signal });
});
