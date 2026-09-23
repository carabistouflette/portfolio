import { onPageLoad } from "./page-lifecycle";

onPageLoad((signal) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  for (const details of document.querySelectorAll<HTMLDetailsElement>(
    "details:not([data-motion-catalog])",
  )) {
    const summary = details.querySelector("summary");
    if (!summary) continue;
    const preview = summary.querySelector<HTMLElement>(".skill-preview");
    const panel = Array.from(details.children).find(
      (child): child is HTMLElement =>
        child !== summary && child instanceof HTMLElement,
    );
    let expanded = details.open;
    let animations: Animation[] = [];

    const revealPanel =
      panel && details.hasAttribute("data-disclosure-reveal") ? panel : null;
    // Keep SSR's native details for no-JS; with JS, the same panel can remain
    // visible and focusable beside its control while the rest is clipped.
    if (revealPanel) {
      details.dataset.disclosureExternal = "";
      details.after(revealPanel);
    }
    const heightTarget = revealPanel ?? details;
    const catalogCards = revealPanel
      ? [
          ...revealPanel.querySelectorAll<HTMLDetailsElement>(
            "[data-motion-catalog]",
          ),
        ]
      : [];
    const closeButton = revealPanel?.querySelector<HTMLButtonElement>(
      "[data-catalog-close]",
    );
    let pendingCategory: HTMLElement | null = null;

    const syncReveal = (): void => {
      if (!revealPanel) return;
      revealPanel.inert = false;
      catalogCards.forEach((card, index) => {
        card.inert = !expanded && index >= 2;
        const categoryPanel = card.querySelector<HTMLElement>(".skills-panel");
        if (categoryPanel) categoryPanel.inert = !expanded;
      });
      if (closeButton) closeButton.inert = !expanded;
    };

    const openPendingCategory = (): void => {
      if (!pendingCategory || !expanded || !details.open) return;
      const categorySummary = pendingCategory;
      pendingCategory = null;
      const category = categorySummary.parentElement as HTMLDetailsElement;
      if (
        categorySummary.getAttribute("aria-expanded") !== "true" &&
        !(
          categorySummary.getAttribute("aria-expanded") === null &&
          category.open
        )
      ) {
        categorySummary.click();
      }
      categorySummary.focus({ preventScroll: true });
    };

    if (revealPanel) {
      syncReveal();
      details.dataset.disclosureReady = "";
      details.addEventListener(
        "toggle",
        () => {
          if (animations.length) return;
          expanded = details.open;
          syncReveal();
          openPendingCategory();
        },
        { signal },
      );
      revealPanel.addEventListener(
        "click",
        (event) => {
          if (expanded || !(event.target instanceof Element)) return;
          const categorySummary = event.target.closest("summary");
          const category = categorySummary?.parentElement;
          event.preventDefault();
          event.stopImmediatePropagation();
          if (details.hasAttribute("data-disclosure-animating")) return;
          // Inert, faded cards retarget clicks to the grid; the teaser still opens.
          summary.click();
          if (
            categorySummary instanceof HTMLElement &&
            (category === catalogCards[0] || category === catalogCards[1])
          ) {
            pendingCategory = categorySummary;
          }
        },
        { capture: true, signal },
      );
      closeButton?.addEventListener(
        "click",
        () => {
          if (!expanded) return;
          pendingCategory = null;
          summary.focus();
          summary.click();
        },
        { signal },
      );
    }

    const settle = (): void => {
      for (const animation of animations) {
        animation.onfinish = null;
        animation.cancel();
      }
      animations = [];
      details.open = expanded;
      syncReveal();
      delete details.dataset.disclosureAnimating;
      openPendingCategory();
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

        const startHeight = heightTarget.getBoundingClientRect().height;
        const wasAnimating = animations.length > 0;
        const panelStyle =
          panel && !details.hasAttribute("data-disclosure-reveal")
            ? getComputedStyle(panel)
            : null;
        const previewStyle = preview ? getComputedStyle(preview) : null;
        const startPreview =
          preview && previewStyle
            ? {
                height: `${preview.getBoundingClientRect().height}px`,
                marginTop:
                  previewStyle.display === "none"
                    ? "0px"
                    : previewStyle.marginTop,
                opacity:
                  previewStyle.display === "none" ? "0" : previewStyle.opacity,
              }
            : null;
        // Read the current frame before canceling so rapid clicks reverse smoothly.
        expanded = animations.length ? !expanded : !details.open;
        settle();
        const endHeight = heightTarget.getBoundingClientRect().height;
        const endPreviewStyle = preview ? getComputedStyle(preview) : null;
        const endPreview =
          preview && endPreviewStyle
            ? {
                height: `${preview.getBoundingClientRect().height}px`,
                marginTop: expanded ? "0px" : endPreviewStyle.marginTop,
                opacity: expanded ? "0" : "1",
              }
            : null;

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
        const height = heightTarget.animate(
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
