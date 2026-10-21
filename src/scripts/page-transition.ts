import type { TransitionBeforePreparationEvent } from "astro:transitions/client";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let active: Animation | undefined;

const cancelFade = (): void => {
  active?.cancel();
  active = undefined;
};

// Fetch first: a slow or failed request must not leave the current page blank.
document.addEventListener(
  "astro:before-preparation",
  (event: TransitionBeforePreparationEvent) => {
    const load = event.loader;
    event.loader = async () => {
      await load();
      if (
        event.defaultPrevented ||
        event.signal.aborted ||
        reducedMotion.matches
      )
        return;
      const content = document.querySelector<HTMLElement>(".site-content");
      if (!content) return;

      const opacity = getComputedStyle(content).opacity;
      cancelFade();
      const outgoing = content.animate([{ opacity }, { opacity: 0 }], {
        duration: 220,
        easing: "ease-out",
        fill: "forwards",
      });
      active = outgoing;
      event.signal.addEventListener(
        "abort",
        () => {
          if (active === outgoing) cancelFade();
        },
        { once: true },
      );
      try {
        await outgoing.finished;
      } catch {
        // A newer navigation or reduced-motion preference cancels this fade.
      }
    };
  },
);

// BaseLayout disables Astro's snapshot animations with transition:animate="none".
// Animate live content without skipping the native transition: skipping rejects
// its ready promise, even when the DOM swap itself succeeds.

document.addEventListener("astro:after-swap", () => {
  cancelFade();
  if (reducedMotion.matches) return;
  const content = document.querySelector<HTMLElement>(".site-content");
  if (!content) return;
  const incoming = content.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 420,
    easing: "ease-in-out",
    fill: "both",
  });
  active = incoming;
  incoming.onfinish = () => {
    if (active === incoming) active = undefined;
  };
});

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) cancelFade();
});
