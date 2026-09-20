import { onPageLoad } from "./page-lifecycle";

onPageLoad((signal) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    // Reveal content blocks, not nested containers or individual calendar cells.
    const selector =
      ".section-shell > *, [data-motion-reveal], #projects > h2, #projects article, .journey-entry, .contact-inner > *";
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    ).filter(
      (element) =>
        !element.querySelector(selector) &&
        element.getBoundingClientRect().top >= window.innerHeight,
    );
    const active = new Map<HTMLElement, Animation>();
    const pendingStyles = new Map<
      HTMLElement,
      {
        opacity: string;
        filter: string;
        transform: string;
        willChange: string;
      }
    >();

    const holdBlurredStart = (target: HTMLElement): void => {
      pendingStyles.set(target, {
        opacity: target.style.opacity,
        filter: target.style.filter,
        transform: target.style.transform,
        willChange: target.style.willChange,
      });
      target.style.opacity = "0";
      target.style.filter = "blur(14px)";
      target.style.transform = "translateY(14px)";
    };

    const restoreInlineStyles = (target: HTMLElement): void => {
      const styles = pendingStyles.get(target);
      if (!styles) return;
      target.style.opacity = styles.opacity;
      target.style.filter = styles.filter;
      target.style.transform = styles.transform;
      target.style.willChange = styles.willChange;
      pendingStyles.delete(target);
    };

    const stopAnimation = (target: HTMLElement): void => {
      const animation = active.get(target);
      if (animation) {
        animation.onfinish = null;
        animation.oncancel = null;
        animation.cancel();
        active.delete(target);
      }
      restoreInlineStyles(target);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          observer.unobserve(target);
          if (
            reducedMotion.matches ||
            target.contains(document.activeElement)
          ) {
            stopAnimation(target);
            continue;
          }

          target.style.willChange = "opacity, transform, filter";
          const animation = target.animate(
            [
              {
                opacity: 0,
                transform: "translateY(14px)",
                filter: "blur(14px)",
              },
              { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
            ],
            {
              duration: 680,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
            },
          );
          active.set(target, animation);
          animation.onfinish = animation.oncancel = () => {
            active.delete(target);
            restoreInlineStyles(target);
          };
        }
      },
      { rootMargin: "0px 0px 80px 0px", threshold: 0 },
    );

    signal.addEventListener(
      "abort",
      () => {
        observer.disconnect();
        for (const target of targets) stopAnimation(target);
        active.clear();
      },
      { once: true },
    );

    for (const target of targets) {
      holdBlurredStart(target);
      observer.observe(target);
    }

    document.addEventListener(
      "focusin",
      (event) => {
        if (!(event.target instanceof Node)) return;
        for (const target of targets) {
          if (!target.contains(event.target)) continue;
          observer.unobserve(target);
          stopAnimation(target);
        }
      },
      { signal },
    );

    reducedMotion.addEventListener(
      "change",
      () => {
        if (!reducedMotion.matches) return;
        observer.disconnect();
        for (const target of targets) stopAnimation(target);
        active.clear();
      },
      { signal },
    );
  }
});
