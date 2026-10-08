import { onPageLoad } from "./page-lifecycle";

const MAX_SHIFT = 56;
const PARALLAX_FACTOR = 0.08;

onPageLoad((signal) => {
  const frame = document.querySelector<HTMLElement>("[data-parallax-photo]");
  const image = frame?.querySelector<HTMLElement>(".personal-photo-image");
  if (!frame || !image) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frameRequest = 0;
  let lastShift: string | null = null;
  let inRange = !("IntersectionObserver" in window);
  let centerScroll: number | null = null;

  const reset = (): void => {
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    if (lastShift !== null) {
      image.style.removeProperty("--personal-photo-shift");
      lastShift = null;
    }
  };

  const applyShift = (bounds: DOMRectReadOnly): void => {
    if (signal.aborted || reducedMotion.matches) return;
    centerScroll =
      window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2;
    const distanceFromCenter =
      window.innerHeight / 2 - (bounds.top + bounds.height / 2);
    const shift = Math.max(
      -MAX_SHIFT,
      Math.min(MAX_SHIFT, distanceFromCenter * PARALLAX_FACTOR),
    );
    const value = `${shift.toFixed(2)}px`;
    if (value === lastShift) return;
    image.style.setProperty("--personal-photo-shift", value);
    lastShift = value;
  };

  const update = (): void => {
    frameRequest = 0;
    if (signal.aborted || reducedMotion.matches) return;
    applyShift(frame.getBoundingClientRect());
  };

  const schedule = (force = false): void => {
    if (
      signal.aborted ||
      reducedMotion.matches ||
      frameRequest ||
      (!inRange && !force)
    )
      return;
    frameRequest = requestAnimationFrame(update);
  };

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            if (signal.aborted) return;
            for (const entry of entries) {
              inRange = entry.isIntersecting;
              if (frameRequest) cancelAnimationFrame(frameRequest);
              frameRequest = 0;
              // The margin covers the full +/-56px plateau. Apply both entry and
              // exit geometry immediately before suspending off-screen scrolls.
              applyShift(entry.boundingClientRect);
            }
          },
          { rootMargin: "700px" },
        )
      : null;
  observer?.observe(frame);
  // Expanding content can move the photo while it stays outside the observer.
  // Refresh the cached center on layout changes, not on every distant scroll.
  const layoutObserver =
    "ResizeObserver" in window
      ? new ResizeObserver(() => schedule(true))
      : null;
  layoutObserver?.observe(document.body);

  window.addEventListener(
    "scroll",
    () => {
      // A jump can cross the entire observer zone between notifications.
      // Compare the cached center without measuring off-screen geometry.
      const crossedCenter =
        centerScroll !== null &&
        ((lastShift === "-56.00px" && window.scrollY >= centerScroll) ||
          (lastShift === "56.00px" && window.scrollY <= centerScroll));
      schedule(crossedCenter);
    },
    { passive: true, signal },
  );
  window.addEventListener("resize", () => schedule(true), {
    passive: true,
    signal,
  });
  reducedMotion.addEventListener(
    "change",
    () => {
      if (reducedMotion.matches) reset();
      else schedule(true);
    },
    { signal },
  );
  signal.addEventListener(
    "abort",
    () => {
      observer?.disconnect();
      layoutObserver?.disconnect();
      reset();
    },
    { once: true },
  );
  schedule(true);
});
