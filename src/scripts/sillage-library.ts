import { onPageLoad } from "./page-lifecycle";

interface BookMotion {
  slot: HTMLElement;
  volume: HTMLElement;
  depth: number;
  shift: number;
  position: number;
  velocity: number;
  target: number;
}

const smoothstep = (value: number): number => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

onPageLoad((signal) => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  for (const library of document.querySelectorAll<HTMLElement>(
    ".library-art",
  )) {
    const surface = library.closest<HTMLElement>(".tile-surface");
    const slots = [...library.querySelectorAll<HTMLElement>(".library-book")];
    const moving = new Map<HTMLElement, BookMotion>();
    let frame = 0;
    let previousTime = 0;

    const putAway = (state: BookMotion) => {
      state.volume.style.removeProperty("transform");
      state.slot.removeAttribute("data-book-active");
      moving.delete(state.slot);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      for (const state of moving.values()) putAway(state);
    };
    const render = (state: BookMotion) => {
      // Pull the book clear of the shelf before turning its cover toward us.
      // The return follows the same path in reverse, including interruptions.
      const pull = smoothstep(state.position / 0.58);
      const turn = smoothstep((state.position - 0.36) / 0.64);
      state.volume.style.transform =
        `translate3d(${-state.shift * turn}px, ${-6 * turn}px, ${(state.depth + 20) * pull}px) ` +
        `rotateX(${-4 * turn}deg) rotateY(${-48 * turn}deg)`;
    };
    const tick = (time: number) => {
      frame = 0;
      const dt = previousTime
        ? Math.min((time - previousTime) / 1000, 1 / 30)
        : 1 / 60;
      previousTime = time;
      let unsettled = false;
      for (const state of moving.values()) {
        if (state.position === state.target && state.velocity === 0) continue;
        // Substeps keep the damped spring stable on slower displays.
        for (let step = 0; step < 2; step++) {
          const acceleration =
            190 * (state.target - state.position) - 25 * state.velocity;
          state.velocity += (acceleration * dt) / 2;
          state.position += (state.velocity * dt) / 2;
        }
        if (
          Math.abs(state.target - state.position) < 0.001 &&
          Math.abs(state.velocity) < 0.01
        ) {
          state.position = state.target;
          state.velocity = 0;
          if (state.target === 0) {
            putAway(state);
            continue;
          }
        } else {
          unsettled = true;
        }
        render(state);
      }
      if (unsettled) frame = requestAnimationFrame(tick);
      else previousTime = 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const select = (slot: HTMLElement) => {
      if (reduced.matches) return;
      for (const state of moving.values())
        state.target = state.slot === slot ? 1 : 0;
      let state = moving.get(slot);
      if (!state) {
        const volume = slot.querySelector<HTMLElement>(".book-volume");
        const cover = slot.querySelector<HTMLElement>(".book-cover");
        if (!volume || !cover || !surface) return;
        slot.setAttribute("data-book-active", "");
        const depth = cover.getBoundingClientRect().height
          ? parseFloat(getComputedStyle(cover).width)
          : 72;
        // Keep the last books' covers inside the card when they turn.
        const available =
          surface.getBoundingClientRect().right -
          slot.getBoundingClientRect().right -
          16;
        state = {
          slot,
          volume,
          depth,
          shift: Math.max(0, depth * 0.75 - available),
          position: 0,
          velocity: 0,
          target: 1,
        };
        moving.set(slot, state);
      }
      state.target = 1;
      wake();
    };
    for (const slot of slots) {
      slot.addEventListener(
        "pointerenter",
        (event) => {
          if (event.pointerType !== "touch") select(slot);
        },
        { signal },
      );
      slot.addEventListener(
        "pointerleave",
        () => {
          const state = moving.get(slot);
          if (state) {
            state.target = 0;
            wake();
          }
        },
        { signal },
      );
    }
    // The card remains one link; keyboard focus previews a central book.
    const previewBook = slots[Math.min(5, slots.length - 1)];
    surface?.addEventListener(
      "focus",
      () => {
        if (previewBook && surface.matches(":focus-visible"))
          select(previewBook);
      },
      { signal },
    );
    surface?.addEventListener(
      "blur",
      () => {
        for (const state of moving.values()) state.target = 0;
        if (moving.size) wake();
      },
      { signal },
    );
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) reset();
      },
      { signal },
    );
    reduced.addEventListener("change", reset, { signal });
    signal.addEventListener("abort", reset, { once: true });
  }
});
