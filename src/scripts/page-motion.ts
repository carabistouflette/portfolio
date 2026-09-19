import { onPageLoad } from "./page-lifecycle";

onPageLoad((signal) => {
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  // Reveal content blocks, not nested containers or individual calendar cells.
  const selector = ".section-shell > *, #projects > h2, #projects article, .journey-entry, .contact-inner > *";
  const targets = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.querySelector(selector) && element.getBoundingClientRect().top >= window.innerHeight,
  );
  const active = new Map<Element, Animation>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reducedMotion.matches || entry.target.contains(document.activeElement)) continue;

      // Content stays visible until this moment, including when scripting fails.
      const animation = entry.target.animate(
        [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
      active.set(entry.target, animation);
      animation.onfinish = animation.oncancel = () => active.delete(entry.target);
    }
  }, { threshold: 0 });
  signal.addEventListener("abort", () => {
    observer.disconnect();
    for (const animation of active.values()) animation.cancel();
    active.clear();
  }, { once: true });

  for (const target of targets) observer.observe(target);

  document.addEventListener("focusin", (event) => {
    if (!(event.target instanceof Node)) return;
    for (const target of targets) {
      if (!target.contains(event.target)) continue;
      observer.unobserve(target);
      active.get(target)?.cancel();
    }
  }, { signal });

  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    observer.disconnect();
    for (const animation of active.values()) animation.cancel();
    active.clear();
  }, { signal });
}
});
