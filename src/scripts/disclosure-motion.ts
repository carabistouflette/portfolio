import { onPageLoad } from "./page-lifecycle";

onPageLoad((signal) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  for (const details of document.querySelectorAll<HTMLDetailsElement>("details")) {
    const summary = details.querySelector("summary");
    if (!summary) continue;
    const preview = summary.querySelector<HTMLElement>(".skill-preview");
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

    summary.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a, button, input, select, textarea")) return;
      if (reducedMotion.matches || !details.animate) return;
      event.preventDefault();

      const startHeight = details.getBoundingClientRect().height;
      const previewStyle = preview ? getComputedStyle(preview) : null;
      const startPreview = preview && previewStyle ? {
        height: `${preview.getBoundingClientRect().height}px`,
        marginTop: previewStyle.display === "none" ? "0px" : previewStyle.marginTop,
        opacity: previewStyle.display === "none" ? "0" : previewStyle.opacity,
      } : null;
      // Read the current frame before canceling so rapid clicks reverse smoothly.
      expanded = animations.length ? !expanded : !details.open;
      settle();
      const endHeight = details.getBoundingClientRect().height;
      const endPreviewStyle = preview ? getComputedStyle(preview) : null;
      const endPreview = preview && endPreviewStyle ? {
        height: `${preview.getBoundingClientRect().height}px`,
        marginTop: expanded ? "0px" : endPreviewStyle.marginTop,
        opacity: expanded ? "0" : "1",
      } : null;

      // Keep the contents rendered until the closing animation has completed.
      details.open = true;
      details.dataset.disclosureAnimating = "";
      const timing: KeyframeAnimationOptions = {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      };
      if (preview && startPreview && endPreview) {
        animations.push(preview.animate([startPreview, endPreview], timing));
      }
      const height = details.animate(
        [{ height: `${startHeight}px` }, { height: `${endHeight}px` }], timing,
      );
      animations.push(height);
      height.onfinish = settle;
    }, { signal });

    reducedMotion.addEventListener("change", () => {
      if (animations.length) settle();
    }, { signal });
    window.addEventListener("resize", () => {
      if (animations.length) settle();
    }, { signal });
    signal.addEventListener("abort", settle, { once: true });
  }
});
