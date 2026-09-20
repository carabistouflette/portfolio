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
      if (
        !api?.ready ||
        reducedMotion.matches ||
        api.getState().reducedMotion
      ) {
        toggle.setAttribute("aria-hidden", "true");
        toggle.tabIndex = -1;
        return;
      }

      const paused = api.getState().paused;
      toggle.setAttribute("aria-hidden", "false");
      toggle.tabIndex = 0;
      toggle.setAttribute("aria-pressed", String(!paused));
      toggle.textContent = paused
        ? (toggle.dataset.motionOff ?? "OFF")
        : (toggle.dataset.motionOn ?? "ON");
    };

    const toggleMotion = (): void => {
      const api = window.butterflyField;
      if (
        !api?.ready ||
        reducedMotion.matches ||
        api.getState().reducedMotion
      ) {
        return;
      }

      const nextPaused = !api.getState().paused;
      savePausePreference(nextPaused);
      if (nextPaused) {
        api.pause();
      } else {
        api.play();
      }
      syncControl();
    };

    toggle.addEventListener("click", toggleMotion, { signal });
    reducedMotion.addEventListener("change", syncControl, { signal });
    window.addEventListener("butterflyfieldready", syncControl, { signal });
    syncControl();
  }
});
