import { onPageLoad } from "./page-lifecycle";

onPageLoad((signal) => {
const toggle = document.querySelector<HTMLButtonElement>("#motion-toggle");
const MOTION_STORAGE_KEY = "portfolio.butterflies.paused";

const savePausePreference = (paused: boolean): void => {
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, String(paused));
  } catch {
    // Storage is optional: private browsing must not disable the control.
  }
};

if (toggle) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const syncControl = (): void => {
    const api = window.butterflyField;
    if (!api?.ready || reducedMotion.matches || api.getState().reducedMotion) {
      toggle.hidden = true;
      return;
    }

    toggle.hidden = false;
    toggle.setAttribute("aria-pressed", String(api.getState().paused));
  };

  const toggleMotion = (): void => {
    const api = window.butterflyField;
    if (!api?.ready || reducedMotion.matches || api.getState().reducedMotion) {
      return;
    }

    const nextPaused = !api.getState().paused;
    savePausePreference(nextPaused);
    toggle.setAttribute("aria-pressed", String(nextPaused));
    if (nextPaused) {
      api.pause();
    } else {
      api.play();
    }
  };

  toggle.addEventListener("click", toggleMotion, { signal });
  reducedMotion.addEventListener("change", syncControl, { signal });
  window.addEventListener("butterflyfieldready", syncControl, { signal });
  syncControl();
}
});
