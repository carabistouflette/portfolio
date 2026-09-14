const toggle = document.querySelector<HTMLButtonElement>("#motion-toggle");

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
    toggle.setAttribute("aria-pressed", String(nextPaused));
    if (nextPaused) {
      api.pause();
    } else {
      api.play();
    }
  };

  toggle.addEventListener("click", toggleMotion);
  reducedMotion.addEventListener("change", syncControl);
  window.addEventListener("butterflyfieldready", syncControl);
  syncControl();
}
