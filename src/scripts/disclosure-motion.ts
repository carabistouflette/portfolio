import { onPageLoad } from "./page-lifecycle";

onPageLoad((signal) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  for (const details of document.querySelectorAll<HTMLDetailsElement>(
    "details:not([data-motion-catalog])",
  )) {
    const summary = details.querySelector("summary");
    if (!summary) continue;
    const panel = Array.from(details.children).find(
      (child): child is HTMLElement =>
        child !== summary && child instanceof HTMLElement,
    );
    let expanded = details.open;
    let animations: Animation[] = [];

    const settle = (): void => {
      for (const animation of animations) {
        animation.onfinish = null;
        animation.cancel();
      }
      animations = [];
      details.open = expanded;
      delete details.dataset.disclosureAnimating;
    };

    summary.addEventListener(
      "click",
      (event) => {
        if (
          event.target instanceof Element &&
          event.target.closest("a, button, input, select, textarea")
        )
          return;
        if (reducedMotion.matches || !details.animate) return;
        event.preventDefault();

        const startHeight = details.getBoundingClientRect().height;
        const wasAnimating = animations.length > 0;
        const panelStyle = panel ? getComputedStyle(panel) : null;
        // Read the current frame before canceling so rapid clicks reverse smoothly.
        expanded = animations.length ? !expanded : !details.open;
        settle();
        const endHeight = details.getBoundingClientRect().height;

        // Keep the contents rendered until the closing animation has completed.
        details.open = true;
        details.dataset.disclosureAnimating = "";
        const timing: KeyframeAnimationOptions = {
          duration: 320,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        };
        if (panel && panelStyle) {
          const panelStart = wasAnimating
            ? { opacity: panelStyle.opacity, filter: panelStyle.filter }
            : expanded
              ? { opacity: "0", filter: "blur(14px)" }
              : { opacity: "1", filter: "blur(0)" };
          const panelEnd = expanded
            ? { opacity: "1", filter: "blur(0)" }
            : { opacity: "0", filter: "blur(14px)" };
          animations.push(panel.animate([panelStart, panelEnd], timing));
        }
        const height = details.animate(
          [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
          timing,
        );
        animations.push(height);
        height.onfinish = settle;
      },
      { signal },
    );

    reducedMotion.addEventListener(
      "change",
      () => {
        if (animations.length) settle();
      },
      { signal },
    );
    window.addEventListener(
      "resize",
      () => {
        if (animations.length) settle();
      },
      { signal },
    );
    signal.addEventListener("abort", settle, { once: true });
  }
});
