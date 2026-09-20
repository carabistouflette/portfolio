import { onPageLoad } from "./page-lifecycle";

const MAX_SHIFT = 56;
const PARALLAX_FACTOR = 0.08;

onPageLoad((signal) => {
  const frame = document.querySelector<HTMLElement>("[data-parallax-photo]");
  const image = frame?.querySelector<HTMLElement>(".personal-photo-image");
  if (!frame || !image) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frameRequest = 0;

  const reset = (): void => {
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    image.style.removeProperty("--personal-photo-shift");
  };

  const update = (): void => {
    frameRequest = 0;
    if (reducedMotion.matches) {
      reset();
      return;
    }

    const bounds = frame.getBoundingClientRect();
    const distanceFromCenter =
      window.innerHeight / 2 - (bounds.top + bounds.height / 2);
    const shift = Math.max(
      -MAX_SHIFT,
      Math.min(MAX_SHIFT, distanceFromCenter * PARALLAX_FACTOR),
    );
    image.style.setProperty("--personal-photo-shift", `${shift.toFixed(2)}px`);
  };

  const schedule = (): void => {
    if (reducedMotion.matches || frameRequest) return;
    frameRequest = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", schedule, { passive: true, signal });
  window.addEventListener("resize", schedule, { passive: true, signal });
  reducedMotion.addEventListener(
    "change",
    () => {
      if (reducedMotion.matches) reset();
      else schedule();
    },
    { signal },
  );
  signal.addEventListener("abort", reset, { once: true });
  schedule();
});
