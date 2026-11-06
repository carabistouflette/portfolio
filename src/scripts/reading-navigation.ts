import { onPageLoad } from "./page-lifecycle";

onPageLoad((signal) => {
  let frame = 0;

  const revealFragment = (): void => {
    cancelAnimationFrame(frame);
    if (!location.hash) return;
    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;

    let parent: Element | null = target;
    let revealed = false;
    while (parent) {
      if (parent instanceof HTMLDetailsElement && !parent.open) {
        parent.open = true;
        revealed = true;
      }
      parent = parent.parentElement;
    }

    if (revealed) {
      frame = requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "instant", block: "start" });
      });
    }
  };

  revealFragment();
  window.addEventListener("hashchange", revealFragment, { signal });
  signal.addEventListener("abort", () => cancelAnimationFrame(frame), {
    once: true,
  });
});
