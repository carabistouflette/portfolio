import { onPageLoad } from "./page-lifecycle";
import { createCatRig, type CatRig, type CatRigPose } from "./hero-cat-rig";
import { CAT_RIG_CONFIG } from "./cat-rig-config";

const REST_POSE: CatRigPose = CAT_RIG_CONFIG.restPose;

const ease = (value: number): number => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

onPageLoad((signal) => {
  const cat = document.querySelector<HTMLElement>(".hero-cat");
  const canvas = cat?.querySelector<HTMLCanvasElement>(".hero-cat-rig");
  if (!cat || !canvas) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let bounds = cat.getBoundingClientRect();
  let rig: CatRig | null = null;
  let pointerX = 0;
  let pointerY = 0;
  let tracking = false;
  let armed = true;
  let frame = 0;
  let startedAt = 0;
  let nextPlay = 0;
  const preparation: CatRigPose = CAT_RIG_CONFIG.preparationPose;
  const tap: CatRigPose = { ...REST_POSE };

  const rest = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    cat.removeAttribute("data-playing");
  };
  const stop = () => {
    rest();
    tracking = false;
    armed = true;
  };
  const nearby = () => {
    if (!tracking || reducedMotion.matches || document.hidden) return false;
    const { character, playArea } = CAT_RIG_CONFIG;
    const x = bounds.left + bounds.width * (playArea.cx / character.width);
    const y = bounds.top + bounds.height * (playArea.cy / character.height);
    const radius = Math.min(140, bounds.width * 0.35);
    return Math.hypot(pointerX - x, pointerY - y) < radius;
  };
  const animate = (time: number) => {
    frame = 0;
    if (!rig) return;
    const elapsed = time - startedAt;
    if (elapsed >= 1100) {
      rest();
      nextPlay = time + 1200;
      return;
    }
    let from = REST_POSE;
    let to = preparation;
    let progress = elapsed / 240;
    if (elapsed >= 770) {
      from = preparation;
      to = REST_POSE;
      progress = (elapsed - 770) / 330;
    } else if (elapsed >= 680) {
      from = tap;
      to = preparation;
      progress = (elapsed - 680) / 90;
    } else if (elapsed >= 420) {
      from = tap;
      to = tap;
      progress = 1;
    } else if (elapsed >= 240) {
      from = preparation;
      to = tap;
      progress = (elapsed - 240) / 180;
    }
    const t = ease(progress);
    rig.draw(
      from.shoulder + (to.shoulder - from.shoulder) * t,
      from.elbow + (to.elbow - from.elbow) * t,
      from.wrist + (to.wrist - from.wrist) * t,
    );
    frame = requestAnimationFrame(animate);
  };
  const capturePose = (
    x: number,
    y: number,
    angle: number,
    into: CatRigPose,
  ) => {
    if (!rig) return;
    rig.solveTarget(x, y, angle);
    const pose = rig.inspect().pose;
    into.shoulder = pose.shoulder;
    into.elbow = pose.elbow;
    into.wrist = pose.wrist;
  };
  const wake = () => {
    if (!nearby()) {
      armed = true;
      return;
    }
    if (!rig || !armed || frame || performance.now() < nextPlay) return;
    armed = false;
    // Capture once in character pixels. Pointer motion cannot redirect a gesture.
    const { character } = CAT_RIG_CONFIG;
    const x = ((pointerX - bounds.left) / bounds.width) * character.width;
    const y = ((pointerY - bounds.top) / bounds.height) * character.height;
    capturePose(x, y, 0, tap);
    startedAt = performance.now();
    rig.draw(REST_POSE.shoulder, REST_POSE.elbow, REST_POSE.wrist);
    cat.setAttribute("data-playing", "left");
    frame = requestAnimationFrame(animate);
  };
  const measure = () => {
    bounds = cat.getBoundingClientRect();
    rig?.resize(bounds.width, bounds.height);
    wake();
  };
  const artwork = new Image();
  const initialize = () => {
    if (signal.aborted || rig) return;
    rig = createCatRig(canvas, artwork);
    rig?.resize(bounds.width, bounds.height);
    wake();
  };
  artwork.src = CAT_RIG_CONFIG.images.atlas;
  artwork
    .decode()
    .then(initialize)
    .catch((error: unknown) => {
      console.error("Unable to initialize the cat rig", error);
    });
  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      event.preventDefault();
      stop();
      rig?.destroy();
      rig = null;
    },
    { signal },
  );
  canvas.addEventListener("webglcontextrestored", initialize, { signal });
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") {
        stop();
        return;
      }
      pointerX = event.clientX;
      pointerY = event.clientY;
      tracking = true;
      wake();
    },
    { signal, passive: true },
  );
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "mouse") stop();
    },
    { signal, passive: true },
  );
  document.documentElement.addEventListener(
    "pointerleave",
    () => {
      tracking = false;
      armed = true;
    },
    { signal },
  );
  window.addEventListener("blur", stop, { signal });
  window.addEventListener("scroll", measure, { signal, passive: true });
  window.addEventListener("resize", measure, { signal, passive: true });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) stop();
    },
    { signal },
  );
  reducedMotion.addEventListener(
    "change",
    () => {
      if (reducedMotion.matches) stop();
    },
    { signal },
  );
  const observer = new ResizeObserver(measure);
  observer.observe(cat);
  signal.addEventListener(
    "abort",
    () => {
      stop();
      observer.disconnect();
      rig?.destroy();
    },
    { once: true },
  );
});
