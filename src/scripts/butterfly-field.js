/* Butterfly Field v4 — image-textured wings with pose-driven 3D kinematics.
 * No spritesheet, frame crossfade, SVG butterfly, framework, CDN or network request.
 * Transparent raster textures now come from FOUR tightly controlled butterfly variants. Each butterfly still uses one rig, but picks one photo-textured wing/body set at birth.
 * Naturalism comes from a four-phase wingbeat plus steering-based flight intentions: short traverses, altitude corrections, glides and beat-linked impulses.
 * Each wing also gets coherent feathering (pitch), sweep, camber and a tiny spanwise lag.
 * There is no cloth/spring solver: the motion is analytic, deterministic and GPU-deformed.
 * This is an art-directed kinematic model, not a species-calibrated aerodynamic simulation.
 * Edit DEFAULTS below, or set window.BUTTERFLY_OPTIONS before this script.
 */
(() => {
  "use strict";
  const ASSET_SETS = [
    {
      forewing: "/butterflies/master_forewing.webp",
      hindwing: "/butterflies/master_hindwing.webp",
      body: "/butterflies/master_body.webp",
    },
    {
      forewing: "/butterflies/softA_forewing.webp",
      hindwing: "/butterflies/softA_hindwing.webp",
      body: "/butterflies/softA_body.webp",
    },
    {
      forewing: "/butterflies/softB_forewing.webp",
      hindwing: "/butterflies/softB_hindwing.webp",
      body: "/butterflies/softB_body.webp",
    },
    {
      forewing: "/butterflies/softC_forewing.webp",
      hindwing: "/butterflies/softC_hindwing.webp",
      body: "/butterflies/softC_body.webp",
    },
  ];
  const TEXTURE_PARTS = ["forewing", "hindwing", "body"];
  const MAX_CANVAS_BLUR_RADIUS = 6 * 1.15;
  const CANVAS_BLUR_PADDING = Math.ceil(MAX_CANVAS_BLUR_RADIUS * 3 + 1);
  const DEFAULTS = Object.freeze({
    seed: 49177,
    count: 0, // 0: responsive; desktop 7–9, phone 4.
    speed: 1, // Translation multiplier; NOT the wing rate.
    wingSpeed: 1, // Independent wing-rate multiplier.
    minWingSpan: 48, // Projected upper-wing length in CSS px.
    maxWingSpan: 104,
    maxPixelRatio: 1.75,
    maxRenderPixels: 3000000, // Pixel budget for HiDPI/large screens.
    wingArticulation: 1, // Feathering/sweep/camber. 0 = simple hinged flap.
    wingFlex: 0.72, // Small spanwise lag. Kept deliberately subtle.
    exposure: 1.14,
    grain: 0.78,
    bloom: 0.14,
    gradient: 1,
    butterflyBlur: 1.8, // Base blur in px/texel space applied directly to butterflies.
    butterflyDepthBlur: 2.15, // Extra blur for distant butterflies.
    butterflyMotionBlur: 0.62, // Extra blur when wing/body motion is faster.

    allowGlides: true,
    respectReducedMotion: true,
  });
  const cfg = { ...DEFAULTS };
  let canvas = document.getElementById("butterfly-field");
  const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (x) => {
    x = clamp(x, 0, 1);
    return x * x * (3 - 2 * x);
  };
  const smoother = (x) => {
    x = clamp(x, 0, 1);
    return x * x * x * (x * (x * 6 - 15) + 10);
  };
  const fract = (x) => x - Math.floor(x);
  const damp = (a, b, rate, dt) => mix(a, b, 1 - Math.exp(-rate * dt));
  const finite = (value, fallback) =>
    Number.isFinite(Number(value)) ? Number(value) : fallback;

  const numericOptions = {
    count: [0, 28],
    speed: [0, 3],
    wingSpeed: [0.15, 3],
    minWingSpan: [16, 150],
    maxWingSpan: [24, 240],
    maxPixelRatio: [0.5, 2.5],
    maxRenderPixels: [300000, 8300000],
    exposure: [0.3, 2],
    grain: [0, 2],
    bloom: [0, 0.5],
    gradient: [0, 2],
    butterflyBlur: [0, 6],
    butterflyDepthBlur: [0, 6],
    butterflyMotionBlur: [0, 3],
    wingArticulation: [0, 1.6],
    wingFlex: [0, 1.5],
  };
  function applyOptions(options) {
    if (!options || typeof options !== "object") return;
    for (const [key, [lo, hi]] of Object.entries(numericOptions))
      if (Object.prototype.hasOwnProperty.call(options, key))
        cfg[key] = clamp(finite(options[key], cfg[key]), lo, hi);
    for (const k of ["allowGlides", "respectReducedMotion"])
      if (typeof options[k] === "boolean") cfg[k] = options[k];
    if (Object.prototype.hasOwnProperty.call(options, "seed"))
      cfg.seed = finite(options.seed, cfg.seed) >>> 0;
    cfg.count = Math.round(cfg.count);
    if (cfg.minWingSpan > cfg.maxWingSpan) cfg.minWingSpan = cfg.maxWingSpan;
  }
  applyOptions(window.BUTTERFLY_OPTIONS);

  class Random {
    constructor(seed) {
      this.state = seed >>> 0;
    }
    next() {
      let t = (this.state += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    range(a, b) {
      return mix(a, b, this.next());
    }
  }
  function hash(n, s) {
    return fract(Math.sin(n * 127.1 + s * 31.79) * 43758.5453);
  }
  function noise(t, s) {
    const i = Math.floor(t),
      f = fract(t);
    return mix(hash(i, s), hash(i + 1, s), smoother(f)) * 2 - 1;
  }

  // A butterfly wingbeat is not a sinusoid. The important visual events are the
  // fast power stroke, the rapid pitch flip at the bottom, the slower recovery,
  // and a second pitch flip while the wing briefly hangs at the top.
  // Values are art-directed for this side-profile artwork.
  const _flapPose = { angle: 0, feather: 0, sweep: 0, camber: 0, power: 0 };
  function wingCycle(phase) {
    const p = fract(phase);
    const downEnd = 0.34,
      bottomFlipEnd = 0.415,
      upEnd = 0.91;
    let angle,
      feather,
      sweep,
      camber,
      power = 0;
    if (p < downEnd) {
      const s = smoother(p / downEnd);
      angle = mix(1.14, -0.5, s);
      feather = mix(0.36, 0.24, smooth(s));
      sweep = mix(-0.03, 0.05, s);
      camber = 0.052 * Math.sin(Math.PI * s);
      power = Math.pow(Math.sin(Math.PI * s), 1.55);
    } else if (p < bottomFlipEnd) {
      const s = smoother((p - downEnd) / (bottomFlipEnd - downEnd));
      angle = -0.5 + 0.022 * Math.sin(Math.PI * s);
      feather = mix(0.24, -0.31, s);
      sweep = mix(0.05, 0.035, s);
      camber = mix(0.012, -0.008, s);
    } else if (p < upEnd) {
      const s = smoother((p - bottomFlipEnd) / (upEnd - bottomFlipEnd));
      angle = mix(-0.5, 1.14, s);
      feather = mix(-0.31, -0.2, smooth(s));
      sweep = mix(0.035, -0.035, s);
      camber = -0.024 * Math.sin(Math.PI * s);
    } else {
      const s = smoother((p - upEnd) / (1 - upEnd));
      angle = 1.14 - 0.014 * Math.sin(Math.PI * s);
      feather = mix(-0.2, 0.36, s);
      sweep = mix(-0.035, -0.03, s);
      camber = mix(-0.006, 0, s);
    }
    _flapPose.angle = angle;
    _flapPose.feather = feather;
    _flapPose.sweep = sweep;
    _flapPose.camber = camber;
    _flapPose.power = power;
    return _flapPose;
  }

  const _glidePose = {
    angle: 0,
    feather: 0,
    sweep: -0.018,
    camber: 0.01,
    power: 0,
  };
  function glidePose(t, seed) {
    _glidePose.angle = 0.82 + 0.025 * noise(t * 0.42, seed + 72);
    _glidePose.feather = 0.055 + 0.018 * noise(t * 0.31, seed + 19);
    return _glidePose;
  }

  let width = 1,
    height = 1,
    dpr = 1,
    time = 0,
    accumulator = 0;
  let birds = [],
    ordered = [],
    raf = 0,
    lastTimestamp = 0,
    paused = false,
    overlaySuspended = false,
    destroyed = false;
  let ready = false,
    lost = false,
    renderer = null,
    images = null,
    overlayObserver = null;
  let cameraY = window.scrollY;
  // scrollY at which the hero fully exits the viewport; 0 = page without a hero.
  let heroStopY = 0;
  let motionScale = 1;
  const VARIANT_COUNT = ASSET_SETS ? ASSET_SETS.length : 0;
  const params = new URLSearchParams(location.search);
  const solo = params.get("solo") === "1"; // Inspection mode, no added interface.
  const manual = params.get("manual") === "1";
  const fixedDT = 1 / 60;
  const maxSubsteps = 4;
  // Adaptive quality: software WebGL / weak iGPUs cannot hold the frame budget.
  // One-way degradation ladder: full → lower resolution → fewer butterflies →
  // frozen frame. Stage 3 is sticky until reseed()/setOptions() states new intent.
  const adapt = { stage: 0, seen: 0, samples: [], windowMs: 0 };
  const ADAPT_WARMUP = 12; // Ignore startup (JIT, texture upload) frames.
  const ADAPT_WINDOW = 18; // Sustained-mean window, in frames.
  const ADAPT_DEGRADE_MS = 42; // < ~24 fps sustained → drop one stage.
  const ADAPT_FREEZE_MS = 95; // < ~10 fps sustained after both drops → freeze.
  const stats = {
    frames: 0,
    physicsTotal: 0,
    physicsMax: 0,
    submitTotal: 0,
    frameIntervals: 0,
    intervalCount: 0,
    discardedCatchups: 0,
    simulationSteps: 0,
  };
  const byDepth = (a, b) => a.depth - b.depth;
  function drawOrder() {
    ordered.length = birds.length;
    for (let i = 0; i < birds.length; i++) ordered[i] = birds[i];
    return ordered.sort(byDepth);
  }

  class Butterfly {
    constructor(index, count) {
      this.id = index;
      this.random = new Random(
        (cfg.seed ^ Math.imul(index + 1, 2654435761)) >>> 0,
      );
      this.seed = this.random.range(1, 9999);
      this.depth = clamp(
        (index + 0.5) / count + this.random.range(-0.055, 0.055),
        0.1,
        0.92,
      );
      this.view = {};
      this.reset(true);
    }
    chooseBurst() {
      this.beatsRemaining = Math.floor(this.random.range(2, 10));
      this.burstRate = this.rate * this.random.range(0.78, 1.18);
    }
    pickWaypoint(force = false, reason = "cruise") {
      const r = this.random;
      const marginTop =
        this.flightCeiling ?? Math.min(height * 0.18, this.span + 42);
      const marginBottom =
        this.flightFloor ?? Math.max(marginTop + 60, height - marginTop);
      const bandCenter = this.cruiseY ?? this.y;
      const centerPull = clamp((bandCenter - this.y) * 0.4, -52, 52);
      let dy;
      if (this.gliding) {
        dy = r.range(6, 34) + centerPull * 0.35;
        if (this.y < marginTop + 24) dy = Math.max(dy, r.range(18, 54));
      } else if (reason === "climb") {
        dy = r.range(-72, -22) + centerPull;
      } else if (reason === "descend") {
        dy = r.range(20, 78) + centerPull;
      } else if (reason === "correct-top") {
        dy = r.range(28, 84);
      } else if (reason === "correct-bottom") {
        dy = r.range(-84, -28);
      } else if (reason === "initial") {
        dy = r.range(-16, 16);
      } else {
        const pick = r.next();
        if (this.y < marginTop + 36) dy = r.range(20, 70);
        else if (this.y > marginBottom - 36) dy = r.range(-70, -20);
        else if (pick < 0.22) dy = r.range(-60, -18) + centerPull;
        else if (pick < 0.44) dy = r.range(18, 60) + centerPull;
        else dy = r.range(-24, 24) + centerPull * 0.65;
      }
      const ahead =
        r.range(this.span * 1.8, this.span * 4.0) *
        clamp(width / 1000, 0.82, 1.2);
      this.targetX = this.x + this.direction * ahead;
      this.targetY = clamp(this.y + dy, marginTop, marginBottom);
      this.segmentRemaining = this.gliding
        ? r.range(0.42, 1.0)
        : r.range(0.22, 0.66);
      const pace = this.gliding ? r.range(0.58, 0.86) : r.range(0.78, 1.16);
      this.desiredSpeed = this.baseSpeed * cfg.speed * pace;
      this.segmentKind = reason;
      if (force) {
        this.targetY = clamp(this.targetY, marginTop, marginBottom);
      }
    }
    reset(initial = false) {
      const r = this.random;
      this.direction = initial
        ? this.id % 2 === 0
          ? 1
          : -1
        : r.next() < 0.5
          ? 1
          : -1;
      this.depth = clamp(this.depth + r.range(-0.035, 0.035), 0.1, 0.92);
      const mobileScale = clamp(width / 850, 0.7, 1);
      this.span =
        mix(cfg.minWingSpan, cfg.maxWingSpan, this.depth) *
        r.range(0.94, 1.06) *
        mobileScale;
      this.scale = this.span / 326;
      // Stable individual pace, independent of apparent depth.
      this.baseSpeed =
        mix(33, 78, this.depth) *
        mix(0.65, 1.45, hash(this.id, this.seed + 127)) *
        mobileScale;
      this.opacity = mix(0.47, 0.95, this.depth);
      // Frequency belongs to the animal, not to display depth. The old slow 2.5–3.5 Hz
      // cycle read like a mechanical flap; this range gives a short, crisp butterfly beat.
      this.rate = r.range(4.15, 5.25);
      this.phase = r.next();
      this.age = r.range(0, 30);
      this.gliding = false;
      this.glideRemaining = 0;
      this.glideBlend = 0;
      this.chooseBurst();
      if (!Number.isInteger(this.variantIndex))
        this.variantIndex = Math.floor(
          this.random.next() * Math.max(1, VARIANT_COUNT),
        );
      const pose = wingCycle(this.phase);
      this.angle = pose.angle;
      this.feather = pose.feather;
      this.sweep = pose.sweep;
      this.camber = pose.camber;
      this.power = pose.power;
      this.tipFlex = 0;
      this.angularVelocity = 0;
      this.angularAcceleration = 0;
      this.pitch = r.range(-0.045, 0.045);
      this.yaw = r.range(0.1, 0.27);
      this.elevation = r.range(0.13, 0.23);
      const yMargin = Math.min(height * 0.18, this.span + 42);
      this.flightCeiling = yMargin;
      this.flightFloor = Math.max(this.flightCeiling + 60, height - yMargin);
      this.cruiseY = r.range(this.flightCeiling, this.flightFloor);
      this.y = this.cruiseY;
      this.vy = r.range(-3, 3);
      this.vx = this.direction * this.baseSpeed * cfg.speed;
      this.heading = 0;
      this.desiredSpeed = this.baseSpeed * cfg.speed;
      this.targetX = 0;
      this.targetY = this.y;
      this.segmentRemaining = 0;
      this.segmentKind = "cruise";
      this.x = initial
        ? width * fract(0.11 + this.id * 0.61803398875 + r.range(-0.028, 0.028))
        : this.direction > 0
          ? -this.span * 2.7
          : width + this.span * 2.7;
      if (initial) {
        this.cruiseY =
          height *
          mix(
            0.18,
            0.82,
            fract(0.27 + this.id * 0.38196601125 + r.range(-0.075, 0.075)),
          );
        this.y = this.cruiseY;
      }
      if (solo) {
        this.direction = 1;
        this.depth = 0.9;
        this.opacity = 0.94;
        this.span = height * 0.34;
        this.scale = this.span / 326;
        this.x = width * 0.54;
        this.y = height * 0.54;
        this.cruiseY = this.y;
      }
      this.pickWaypoint(true, "initial");
      this.capturePrevious();
    }
    capturePrevious() {
      this.previousX = this.x;
      this.previousY = this.y;
      this.previousAngle = this.angle;
      this.previousPitch = this.pitch;
      this.previousYaw = this.yaw;
      this.previousVelocity = this.angularVelocity;
      this.previousFeather = this.feather;
      this.previousSweep = this.sweep;
      this.previousCamber = this.camber;
      this.previousTipFlex = this.tipFlex;
    }
    pose(alpha = 1) {
      const v = this.view;
      v.x = mix(this.previousX ?? this.x, this.x, alpha);
      v.y = mix(this.previousY ?? this.y, this.y, alpha);
      if (!solo) {
        // Recycle only beyond the viewport, keeping scroll reversible and flight intact.
        const margin = this.span * 3.1,
          period = height + margin * 2;
        const worldY =
          v.y - cameraY * (isReduced() ? 1 : mix(0.35, 0.85, this.depth));
        const band = Math.floor((worldY + margin) / period);
        v.y = worldY - band * period;
        if (band !== 0)
          v.x = width * fract(v.x / width + hash(band, this.seed + 149) * 0.6);
      }
      v.angle = mix(this.previousAngle ?? this.angle, this.angle, alpha);
      v.pitch = mix(this.previousPitch ?? this.pitch, this.pitch, alpha);
      v.yaw = mix(this.previousYaw ?? this.yaw, this.yaw, alpha);
      v.angularVelocity = mix(
        this.previousVelocity ?? this.angularVelocity,
        this.angularVelocity,
        alpha,
      );
      v.feather = mix(
        this.previousFeather ?? this.feather,
        this.feather,
        alpha,
      );
      v.sweep = mix(this.previousSweep ?? this.sweep, this.sweep, alpha);
      v.camber = mix(this.previousCamber ?? this.camber, this.camber, alpha);
      v.tipFlex = mix(
        this.previousTipFlex ?? this.tipFlex,
        this.tipFlex,
        alpha,
      );
      v.elevation = this.elevation;
      v.depth = this.depth;
      v.opacity = this.opacity;
      v.seed = this.seed;
      v.span = this.span;
      v.scale = this.scale;
      v.direction = this.direction;
      v.gliding = this.gliding;
      v.variantIndex = Number.isInteger(this.variantIndex)
        ? this.variantIndex
        : 0;
      return v;
    }
    update(dt) {
      this.capturePrevious();
      this.age += dt;
      const t = this.age;

      // Bursts end only at the top reversal. A glide can therefore never freeze an
      // arbitrary mid-stroke pose, which was a major source of mechanical-looking motion.
      if (this.gliding) {
        this.glideRemaining -= dt;
        if (this.glideRemaining <= 0) {
          this.gliding = false;
          this.phase = 0;
          this.chooseBurst();
        }
      } else {
        // Continuous, individual tempo drift rather than per-frame random jitter.
        const tempo =
          1 +
          0.19 * noise(t * 0.73, this.seed + 103) +
          0.08 * noise(t * 1.91, this.seed + 107);
        const advance = dt * this.burstRate * tempo * cfg.wingSpeed;
        const total = this.phase + advance;
        const wraps = Math.floor(total);
        this.phase = fract(total);
        if (wraps > 0) {
          this.beatsRemaining -= wraps;
          if (!solo && this.random.next() < 0.52) {
            const reason =
              this.random.next() < 0.27
                ? this.random.next() < 0.5
                  ? "climb"
                  : "descend"
                : "cruise";
            this.pickWaypoint(false, reason);
          }
          if (cfg.allowGlides && this.beatsRemaining <= 0) {
            this.gliding = true;
            this.phase = 0;
            this.glideRemaining = this.random.range(0.22, 0.95);
            if (!solo) this.pickWaypoint(false, "glide");
          } else if (this.beatsRemaining <= 0) this.chooseBurst();
        }
      }
      this.glideBlend = damp(this.glideBlend, this.gliding ? 1 : 0, 13, dt);

      const flap = wingCycle(this.phase),
        glide = glidePose(t, this.seed);
      const g = this.glideBlend;
      // Vary stroke depth smoothly while keeping both wings mechanically coupled.
      const amplitude = 0.88 + 0.12 * noise(t * 0.61, this.seed + 113);
      const nextAngle = mix(
        0.32 + (flap.angle - 0.32) * amplitude,
        glide.angle,
        g,
      );
      const nextFeather =
        mix(flap.feather, glide.feather, g) * cfg.wingArticulation;
      const nextSweep = mix(flap.sweep, glide.sweep, g) * cfg.wingArticulation;
      const nextCamber =
        mix(flap.camber, glide.camber, g) * cfg.wingArticulation;
      this.power = flap.power * amplitude * (1 - g);

      const lastVelocity = this.angularVelocity;
      this.angularVelocity = (nextAngle - this.angle) / dt;
      this.angularAcceleration = (this.angularVelocity - lastVelocity) / dt;
      this.angle = nextAngle;
      this.feather = nextFeather;
      this.sweep = nextSweep;
      this.camber = nextCamber;
      // A tiny velocity-derived spanwise lag: the root changes direction first, the tip
      // follows by only a few degrees. No oscillation is stored, so it cannot become rubbery.
      const flexTarget = clamp(
        -this.angularVelocity * 0.0048 * cfg.wingFlex,
        -0.125,
        0.125,
      );
      this.tipFlex = damp(this.tipFlex, flexTarget, 32, dt);

      if (!solo) {
        this.segmentRemaining -= dt;
        const reached =
          this.direction > 0 ? this.x >= this.targetX : this.x <= this.targetX;
        if (this.y < this.flightCeiling + 10)
          this.pickWaypoint(false, "correct-top");
        else if (this.y > this.flightFloor - 10)
          this.pickWaypoint(false, "correct-bottom");
        else if (this.segmentRemaining <= 0 || reached) this.pickWaypoint();
      }

      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const wander = !this.gliding
        ? noise(t * 0.43, this.seed + 51) * 0.055
        : noise(t * 0.33, this.seed + 51) * 0.02;
      const desiredHeading = clamp(
        Math.atan2(-dy, Math.abs(dx) || 1) + wander,
        -0.34,
        0.34,
      );
      this.heading = damp(
        this.heading,
        desiredHeading,
        this.gliding ? 1.25 : 2.2,
        dt,
      );
      const desiredVX =
        this.direction *
        Math.cos(this.heading) *
        this.desiredSpeed *
        (1 + 0.12 * noise(t * 0.37, this.seed + 11));
      const desiredVY =
        -Math.sin(this.heading) * this.desiredSpeed +
        (this.gliding ? 7.0 : 0.0);
      this.vx = damp(this.vx, desiredVX, this.gliding ? 1.15 : 3.2, dt);
      this.vy = damp(this.vy, desiredVY, this.gliding ? 1.05 : 1.85, dt);

      // Stroke-linked thrust and recovery drag produce short accelerations.
      // Scale with individual pace; zero translation speed still means no thrust.
      const thrust = this.baseSpeed * cfg.speed;
      this.vx += this.direction * thrust * 4.2 * this.power * dt;
      this.vy += thrust * (-1.8 * this.power + 0.26 * (1 - g) + 0.12 * g) * dt;
      this.vy = clamp(this.vy, -92, 92);
      this.y += this.vy * dt;
      this.x += this.vx * dt;
      // Body attitude follows the flight path with inertia, not a separate wobble.
      const targetPitch = clamp(
        Math.atan2(-this.vy, Math.max(Math.abs(this.vx), 20)) * 0.58 +
          0.045 * this.power -
          0.025 * g,
        -0.22,
        0.22,
      );
      this.pitch = damp(this.pitch, targetPitch, 3.4, dt);
      const turn = clamp(desiredHeading - this.heading, -0.25, 0.25);
      this.yaw = damp(
        this.yaw,
        0.17 +
          0.38 * turn +
          0.025 * noise(t * 0.16, this.seed + 90) +
          0.018 * g,
        1.8,
        dt,
      );
      if (solo) {
        this.x = width * 0.54;
        this.y = height * 0.56;
      }
      const margin = this.span * 3.1;
      if (
        !solo &&
        ((this.direction > 0 && this.x > width + margin) ||
          (this.direction < 0 && this.x < -margin))
      )
        this.reset(false);
    }
  }

  const VERTEX = `
    precision highp float;
    attribute vec2 a_xy;
    attribute vec2 a_uv;
    uniform vec2 u_resolution;
    uniform vec2 u_origin;
    uniform float u_scale, u_direction, u_pitch, u_yaw, u_elevation;
    uniform float u_angle, u_velocity, u_side, u_part, u_time;
    uniform vec4 u_kinematic; // feather, sweep, camber, spanwise phase lag
    varying vec2 v_uv;
    varying float v_facing;
    void main() {
      float x=a_xy.x;
      float y=-a_xy.y;
      float z=0.0;
      v_facing=1.0;
      if(u_part>0.5) {
        float span=max(y,0.0);
        float spanLimit=u_part>1.5?185.0:333.0;
        float radial=clamp(span/spanLimit,0.0,1.0);
        float r2=radial*radial;
        float leading=u_part>1.5?(-38.0*radial-48.0*r2):(145.0*radial-75.0*r2);
        float chord=u_part>1.5?242.0*sin(2.0420352*radial):175.0*sin(2.5132741*radial);
        chord=max(chord,18.0);
        float trailing=clamp((leading-x)/chord,0.0,1.0);
        float vein=leading-.20*chord;
        float chordOffset=x-vein;

        // 1) Fore/aft sweep: a coherent whole-wing degree of freedom.
        float sweepFactor=.20+.80*radial;
        x+=u_kinematic.y*span*sweepFactor;
        vein+=u_kinematic.y*span*sweepFactor;

        // 2) Feathering/pronation: rotate the chord around the spanwise venation axis.
        // The root is stiff, while the outer/trailing membrane follows the pitch flip.
        float feather=u_kinematic.x*(.30+.70*r2)*(.72+.28*trailing);
        float normal=-chordOffset*sin(feather);
        x=vein+chordOffset*cos(feather);

        // 3) Camber is quasi-static and reverses with the aerodynamic stroke.
        normal+=u_kinematic.z*chord*1.15*trailing*(1.0-trailing)*smoothstep(.05,.42,radial);

        // 4) The tip lags the hinge by a few degrees. This is intentionally not a
        // spring/cloth mode; it is a bounded spanwise phase lag tied to stroke speed.
        float localAngle=u_angle+u_kinematic.w*(.10*radial+.90*r2);
        x-=span*.030;
        y=span*sin(localAngle)+normal*cos(localAngle);
        z=u_side*(span*cos(localAngle)-normal*sin(localAngle)+4.0);

        // Edge-on wing sections are slightly dimmer. Projection already provides the
        // actual silhouette change, so this remains a restrained photometric cue.
        float chordFacing=.68+.32*abs(cos(feather));
        float flapFacing=.80+.20*abs(sin(localAngle+u_side*u_elevation));
        v_facing=chordFacing*flapFacing;
      } else {
        float tail=clamp(-x/150.0,0.0,1.0);
        y+=tail*tail*(1.6*sin(u_time*2.7)+u_velocity*.055);
        float antenna=clamp((x-50.0)/140.0,0.0,1.0);
        y+=antenna*antenna*1.6*sin(u_time*3.7);
      }
      float cx=x*cos(u_yaw)+z*sin(u_yaw);
      float cz=-x*sin(u_yaw)+z*cos(u_yaw);
      float cy=y*cos(u_elevation)-cz*sin(u_elevation);
      float depth=y*sin(u_elevation)+cz*cos(u_elevation);
      float perspective=1400.0/(1400.0-depth);
      vec2 q=vec2(cx,cy)*perspective*u_scale;
      vec2 rotated=vec2(q.x*cos(u_pitch)-q.y*sin(u_pitch), q.x*sin(u_pitch)+q.y*cos(u_pitch));
      vec2 screen=u_origin+vec2(rotated.x*u_direction,-rotated.y);
      gl_Position=vec4(screen.x/u_resolution.x*2.0-1.0,1.0-screen.y/u_resolution.y*2.0,0.0,1.0);
      v_uv=a_uv;
    }
  `;
  const FRAGMENT = `
    precision highp float;
    uniform sampler2D u_texture;
    uniform float u_opacity, u_exposure, u_softness, u_blur;
    uniform vec2 u_texel;
    varying vec2 v_uv;
    varying float v_facing;
    void main() {
      vec4 texel;
      if(u_blur > 0.05) {
        vec2 d = u_texel * u_blur;
        texel = texture2D(u_texture, v_uv, u_softness) * 0.40;
        texel += (texture2D(u_texture, v_uv + vec2(d.x, d.y), u_softness)
                + texture2D(u_texture, v_uv - vec2(d.x, d.y), u_softness)
                + texture2D(u_texture, v_uv + vec2(-d.x, d.y), u_softness)
                + texture2D(u_texture, v_uv + vec2(d.x, -d.y), u_softness)) * 0.15;
      } else {
        texel = texture2D(u_texture, v_uv, u_softness);
      }
      if(texel.a<.002) discard;
      gl_FragColor=vec4(texel.rgb*u_exposure*v_facing*u_opacity,texel.a*u_opacity);
    }
  `;
  const SCREEN_VERTEX = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.0,1.0);}
  `;
  const BACKGROUND_FRAGMENT = `
    precision highp float;
    varying vec2 v_uv;
    uniform float u_gradient;
    void main() {
      vec2 p=(v_uv-vec2(.50,.53))*vec2(1.03,1.0);
      float glow=exp(-dot(p,p)*6.0);
      float core=exp(-dot(p-vec2(-.07,.04),p-vec2(-.07,.04))*13.0);
      vec3 col=vec3(.0009,.0017,.0033)+vec3(.016,.041,.068)*glow*u_gradient
        +vec3(.002,.008,.013)*core*u_gradient;
      gl_FragColor=vec4(col,1.0);
    }
  `;
  const POST_FRAGMENT = `
    precision highp float;
    uniform sampler2D u_scene;
    uniform vec2 u_pixels;
    uniform float u_time,u_grain,u_bloom;
    varying vec2 v_uv;
    float random(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}
    vec3 lightAt(vec2 uv){vec3 s=texture2D(u_scene,uv).rgb;return max(s-vec3(.23),vec3(0.0));}
    void main(){
      vec3 c=texture2D(u_scene,v_uv).rgb;
      vec2 d=u_pixels*2.2;
      if(u_bloom>.0001) {
      vec3 halo=lightAt(v_uv+vec2(d.x,0.0))+lightAt(v_uv-vec2(d.x,0.0))
        +lightAt(v_uv+vec2(0.0,d.y))+lightAt(v_uv-vec2(0.0,d.y));
      halo+=.5*(lightAt(v_uv+d*2.0)+lightAt(v_uv-d*2.0)
        +lightAt(v_uv+vec2(d.x,-d.y)*2.0)+lightAt(v_uv+vec2(-d.x,d.y)*2.0));
      c+=halo*(u_bloom/6.0);
      }
      float l=dot(c,vec3(.2126,.7152,.0722));
      float tick=floor(u_time*16.0);
      float grain=random(gl_FragCoord.xy+vec2(tick*7.1,tick*13.7))-.5;
      c+=grain*(.009+min(l,.8)*.32)*u_grain;
      vec2 p=v_uv-vec2(.5);
      float vignette=1.0-.26*smoothstep(.16,.64,length(p));
      gl_FragColor=vec4(max(c*vignette,vec3(0.0)),1.0);
    }
  `;

  class Renderer {
    constructor() {
      this.kind = "webgl";
      this.gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: true,
        premultipliedAlpha: true,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
      });
      if (!this.gl) throw new Error("WebGL is not available.");
      const g = this.gl;
      this.resources = [];
      this.extVAO = g.getExtension("OES_vertex_array_object");
      this.wing = this.program(
        VERTEX,
        FRAGMENT,
        ["a_xy", "a_uv"],
        [
          "u_resolution",
          "u_origin",
          "u_scale",
          "u_direction",
          "u_pitch",
          "u_yaw",
          "u_elevation",
          "u_angle",
          "u_velocity",
          "u_side",
          "u_part",
          "u_time",
          "u_opacity",
          "u_exposure",
          "u_softness",
          "u_blur",
          "u_texel",
          "u_texture",
          "u_kinematic",
        ],
      );
      this.background = this.program(
        SCREEN_VERTEX,
        BACKGROUND_FRAGMENT,
        ["a_position"],
        ["u_gradient"],
      );
      this.post = this.program(
        SCREEN_VERTEX,
        POST_FRAGMENT,
        ["a_position"],
        ["u_scene", "u_pixels", "u_time", "u_grain", "u_bloom"],
      );
      this.quad = g.createBuffer();
      this.resources.push(["Buffer", this.quad]);
      g.bindBuffer(g.ARRAY_BUFFER, this.quad);
      g.bufferData(
        g.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        g.STATIC_DRAW,
      );
      // Both wing textures use the same UV rectangle: the grids are shared.
      // Distance changes tessellation, not the simulated material properties.
      this.meshes = {
        low: this.mesh([-275, -365, 160, 8], 8, 6),
        medium: this.mesh([-275, -365, 160, 8], 12, 8),
        high: this.mesh([-275, -365, 160, 8], 16, 12),
        body: this.mesh([-190, -155, 218, 136], 10, 6),
      };
      this.textures = images.map((set) => {
        const uploaded = {};
        for (const name of TEXTURE_PARTS)
          uploaded[name] = this.texture(set[name]);
        return uploaded;
      });
      this.scene = g.createTexture();
      this.resources.push(["Texture", this.scene]);
      g.bindTexture(g.TEXTURE_2D, this.scene);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      this.framebuffer = g.createFramebuffer();
      this.resources.push(["Framebuffer", this.framebuffer]);
      g.disable(g.DEPTH_TEST);
      g.disable(g.CULL_FACE);
      this.currentVAO = null;
      this.currentTex = null;
      this.currentBuf = null;
    }
    program(vs, fs, attribs, uniforms) {
      const g = this.gl,
        p = g.createProgram();
      for (const [type, source] of [
        [g.VERTEX_SHADER, vs],
        [g.FRAGMENT_SHADER, fs],
      ]) {
        const s = g.createShader(type);
        g.shaderSource(s, source);
        g.compileShader(s);
        if (!g.getShaderParameter(s, g.COMPILE_STATUS)) {
          const log = g.getShaderInfoLog(s);
          g.deleteShader(s);
          throw new Error(log);
        }
        g.attachShader(p, s);
        g.deleteShader(s);
      }
      g.linkProgram(p);
      if (!g.getProgramParameter(p, g.LINK_STATUS))
        throw new Error(g.getProgramInfoLog(p));
      this.resources.push(["Program", p]);
      const loc = {};
      attribs.forEach((n) => (loc[n] = g.getAttribLocation(p, n)));
      uniforms.forEach((n) => (loc[n] = g.getUniformLocation(p, n)));
      return { p, ...loc };
    }
    mesh(rect, nx, ny) {
      const g = this.gl,
        data = [],
        indices = [];
      for (let y = 0; y <= ny; y++)
        for (let x = 0; x <= nx; x++) {
          const u = x / nx,
            v = y / ny;
          data.push(mix(rect[0], rect[2], u), mix(rect[1], rect[3], v), u, v);
        }
      for (let y = 0; y < ny; y++)
        for (let x = 0; x < nx; x++) {
          const a = y * (nx + 1) + x,
            b = a + 1,
            c = a + nx + 1,
            d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      const vertices = g.createBuffer(),
        elements = g.createBuffer();
      this.resources.push(["Buffer", vertices], ["Buffer", elements]);
      g.bindBuffer(g.ARRAY_BUFFER, vertices);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array(data), g.STATIC_DRAW);
      g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, elements);
      g.bufferData(
        g.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        g.STATIC_DRAW,
      );
      let vao = null;
      if (this.extVAO) {
        vao = this.extVAO.createVertexArrayOES();
        this.extVAO.bindVertexArrayOES(vao);
        g.bindBuffer(g.ARRAY_BUFFER, vertices);
        g.enableVertexAttribArray(this.wing.a_xy);
        g.enableVertexAttribArray(this.wing.a_uv);
        g.vertexAttribPointer(this.wing.a_xy, 2, g.FLOAT, false, 16, 0);
        g.vertexAttribPointer(this.wing.a_uv, 2, g.FLOAT, false, 16, 8);
        g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, elements);
        this.extVAO.bindVertexArrayOES(null);
      }
      return {
        vertices,
        elements,
        vao,
        count: indices.length,
        vertexCount: (nx + 1) * (ny + 1),
      };
    }
    texture(image) {
      const g = this.gl,
        t = g.createTexture();
      this.resources.push(["Texture", t]);
      g.bindTexture(g.TEXTURE_2D, t);
      g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, image);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      g.texParameteri(
        g.TEXTURE_2D,
        g.TEXTURE_MIN_FILTER,
        g.LINEAR_MIPMAP_LINEAR,
      );
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      g.generateMipmap(g.TEXTURE_2D);
      return t;
    }
    resize() {
      const g = this.gl;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      g.bindTexture(g.TEXTURE_2D, this.scene);
      g.texImage2D(
        g.TEXTURE_2D,
        0,
        g.RGBA,
        canvas.width,
        canvas.height,
        0,
        g.RGBA,
        g.UNSIGNED_BYTE,
        null,
      );
      g.bindFramebuffer(g.FRAMEBUFFER, this.framebuffer);
      g.framebufferTexture2D(
        g.FRAMEBUFFER,
        g.COLOR_ATTACHMENT0,
        g.TEXTURE_2D,
        this.scene,
        0,
      );
      if (g.checkFramebufferStatus(g.FRAMEBUFFER) !== g.FRAMEBUFFER_COMPLETE)
        throw new Error("Unable to create the render target.");
      g.bindFramebuffer(g.FRAMEBUFFER, null);
    }
    fullScreen(p) {
      const g = this.gl;
      g.bindBuffer(g.ARRAY_BUFFER, this.quad);
      g.enableVertexAttribArray(p.a_position);
      g.vertexAttribPointer(p.a_position, 2, g.FLOAT, false, 0, 0);
      g.drawArrays(g.TRIANGLES, 0, 6);
      g.disableVertexAttribArray(p.a_position);
    }
    meshFor(b, part) {
      return part < 0.5
        ? this.meshes.body
        : this.meshes[
            b.span * dpr > 145 ? "high" : b.span * dpr > 65 ? "medium" : "low"
          ];
    }
    part(b, name, side, part, angle, opacity) {
      const g = this.gl,
        p = this.wing,
        m = this.meshFor(b, part);
      const hind = part > 1.5;
      const sideScale = side < 0 ? 0.985 : 1.015;
      if (part > 0.5)
        g.uniform4f(
          p.u_kinematic,
          b.feather * (hind ? 0.84 : 1) * sideScale,
          b.sweep * (hind ? 0.78 : 1),
          b.camber * (hind ? 1.12 : 1),
          b.tipFlex * (hind ? 0.86 : 1),
        );
      else g.uniform4f(p.u_kinematic, 0, 0, 0, 0);
      this.vertexCount += m.vertexCount;
      this.drawCalls++;
      g.uniform1f(p.u_angle, angle);
      g.uniform1f(p.u_side, side);
      g.uniform1f(p.u_part, part);
      g.uniform1f(p.u_opacity, opacity);
      const softness =
        mix(0.55, -0.28, b.depth) +
        (part > 0.5 ? Math.abs(b.angularVelocity) * 0.0045 : 0);
      g.uniform1f(p.u_softness, softness);
      const blur = clamp(
        cfg.butterflyBlur +
          (1 - b.depth) * cfg.butterflyDepthBlur +
          Math.abs(b.angularVelocity) * cfg.butterflyMotionBlur * 0.018,
        0,
        6,
      );
      g.uniform1f(p.u_blur, blur);
      const textures =
        this.textures[(b.variantIndex ?? 0) % this.textures.length] ||
        this.textures[0];
      const tex = textures[name];
      if (this.currentTex !== tex) {
        g.activeTexture(g.TEXTURE0);
        g.bindTexture(g.TEXTURE_2D, tex);
        this.currentTex = tex;
      }
      if (this.extVAO) {
        if (this.currentVAO !== m.vao) {
          this.extVAO.bindVertexArrayOES(m.vao);
          this.currentVAO = m.vao;
        }
      } else {
        if (this.currentBuf !== m.vertices) {
          g.bindBuffer(g.ARRAY_BUFFER, m.vertices);
          g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, m.elements);
          g.vertexAttribPointer(p.a_xy, 2, g.FLOAT, false, 16, 0);
          g.vertexAttribPointer(p.a_uv, 2, g.FLOAT, false, 16, 8);
          this.currentBuf = m.vertices;
        }
      }
      g.drawElements(g.TRIANGLES, m.count, g.UNSIGNED_SHORT, 0);
    }
    draw(t, alpha = 1) {
      const g = this.gl;
      this.vertexCount = 0;
      this.drawCalls = 2;
      g.viewport(0, 0, canvas.width, canvas.height);
      g.bindFramebuffer(g.FRAMEBUFFER, this.framebuffer);
      g.disable(g.BLEND);
      g.useProgram(this.background.p);
      g.uniform1f(this.background.u_gradient, cfg.gradient);
      this.fullScreen(this.background);
      g.enable(g.BLEND);
      g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
      const p = this.wing;
      g.useProgram(p.p);
      g.uniform2f(p.u_resolution, width, height);
      g.uniform1f(p.u_exposure, cfg.exposure);
      g.uniform2f(p.u_texel, 1 / 512, 1 / 512);
      g.uniform1i(p.u_texture, 0);
      g.activeTexture(g.TEXTURE0);
      this.currentVAO = null;
      this.currentTex = null;
      this.currentBuf = null;
      if (!this.extVAO) {
        g.enableVertexAttribArray(p.a_xy);
        g.enableVertexAttribArray(p.a_uv);
      }
      for (const bird of drawOrder()) {
        const b = bird.pose(alpha);
        if (b.x < -b.span * 2.7 || b.x > width + b.span * 2.7) continue;
        g.uniform2f(p.u_origin, b.x, b.y);
        g.uniform1f(p.u_scale, b.scale);
        g.uniform1f(p.u_direction, b.direction);
        g.uniform1f(p.u_pitch, b.pitch);
        g.uniform1f(p.u_yaw, b.yaw);
        g.uniform1f(p.u_elevation, b.elevation);
        g.uniform1f(p.u_velocity, b.angularVelocity);
        g.uniform1f(p.u_time, t + b.seed);
        // Fore- and hindwings are mechanically coupled: no fake asynchronous flapping.
        // Tiny anatomical offsets only prevent perfect coplanar overlap.
        const rearAngle = b.angle - 0.018;
        this.part(b, "hindwing", -1, 2, rearAngle - 0.006, b.opacity * 0.66);
        this.part(b, "forewing", -1, 1, b.angle - 0.005, b.opacity * 0.69);
        this.part(b, "hindwing", 1, 2, rearAngle + 0.006, b.opacity * 0.93);
        this.part(b, "forewing", 1, 1, b.angle + 0.005, b.opacity);
        this.part(b, "body", 0, 0, 0, b.opacity);
      }
      if (this.extVAO) {
        this.extVAO.bindVertexArrayOES(null);
      } else {
        g.disableVertexAttribArray(p.a_xy);
        g.disableVertexAttribArray(p.a_uv);
      }
      g.disable(g.BLEND);
      g.bindFramebuffer(g.FRAMEBUFFER, null);
      const q = this.post;
      g.useProgram(q.p);
      g.activeTexture(g.TEXTURE0);
      g.bindTexture(g.TEXTURE_2D, this.scene);
      g.uniform1i(q.u_scene, 0);
      g.uniform2f(q.u_pixels, 1 / canvas.width, 1 / canvas.height);
      g.uniform1f(q.u_time, t);
      g.uniform1f(q.u_grain, cfg.grain);
      g.uniform1f(q.u_bloom, cfg.bloom);
      this.fullScreen(q);
    }
    destroy() {
      if (this.extVAO) {
        for (const m of Object.values(this.meshes))
          if (m.vao) this.extVAO.deleteVertexArrayOES(m.vao);
      }
      for (const [type, obj] of this.resources) this.gl[`delete${type}`](obj);
      this.resources = [];
    }
  }

  /** The same wing rig in a lower-cost CPU renderer when WebGL is unavailable.
   * Projected raster strips approximate the flexible mesh; no pose images are swapped.
   */
  class CanvasRenderer {
    constructor() {
      this.kind = "canvas2d";
      this.resources = [];
      this.ctx = canvas.getContext("2d", { alpha: false });
      if (!this.ctx) {
        const replacement = canvas.cloneNode();
        canvas.replaceWith(replacement);
        canvas = replacement;
        this.ctx = canvas.getContext("2d", { alpha: false });
      }
      if (!this.ctx)
        throw new Error("No canvas rendering context is available.");
      this.textures = images.map((set) => {
        const variant = {};
        for (const name of TEXTURE_PARTS) {
          const texture = document.createElement("canvas");
          texture.width = texture.height = 512;
          const ctx = texture.getContext("2d");
          ctx.filter = `brightness(${cfg.exposure})`;
          ctx.drawImage(set[name], 0, 0);
          variant[name] = texture;
        }
        return variant;
      });
      this.layer = document.createElement("canvas");
      this.lc = this.layer.getContext("2d");
      this.blurLayer = document.createElement("canvas");
      this.bc = this.blurLayer.getContext("2d");
      this.back = document.createElement("canvas");
      this.grain = document.createElement("canvas");
      this.grain.width = this.grain.height = 192;
      this.grainFrame = document.createElement("canvas");
      this.grainContext = this.grainFrame.getContext("2d");
      this.grainTick = -1;
      this.viewportWidth = 0;
      this.viewportHeight = 0;
      this.pixelRatio = 0;
      this.backgroundGradient = null;
      const gc = this.grain.getContext("2d"),
        data = gc.createImageData(192, 192),
        r = new Random(91331);
      for (let i = 0; i < data.data.length; i += 4) {
        const n = Math.floor(r.next() * 40);
        data.data[i] = n * 0.72;
        data.data[i + 1] = n * 0.86;
        data.data[i + 2] = n;
        data.data[i + 3] = 255;
      }
      gc.putImageData(data, 0, 0);
      this.pattern = this.grainContext.createPattern(this.grain, "repeat");
    }
    resize() {
      const renderWidth = Math.round(width * dpr),
        renderHeight = Math.round(height * dpr);
      const viewportChanged =
        this.viewportWidth !== width ||
        this.viewportHeight !== height ||
        this.pixelRatio !== dpr;
      if (viewportChanged) {
        if (canvas.width !== renderWidth) canvas.width = renderWidth;
        if (canvas.height !== renderHeight) canvas.height = renderHeight;
        if (this.back.width !== renderWidth) this.back.width = renderWidth;
        if (this.back.height !== renderHeight) this.back.height = renderHeight;
        if (this.grainFrame.width !== renderWidth)
          this.grainFrame.width = renderWidth;
        if (this.grainFrame.height !== renderHeight)
          this.grainFrame.height = renderHeight;
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.pixelRatio = dpr;
        this.grainTick = -1;
      }
      if (!viewportChanged && this.backgroundGradient === cfg.gradient) return;
      const ctx = this.back.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#010204";
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width * 0.5, height * 0.47);
      ctx.scale(width * 0.76, height * 0.83);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      const k = cfg.gradient;
      g.addColorStop(
        0,
        `rgb(${Math.round(5 * k)},${Math.round(14 * k)},${Math.round(24 * k)})`,
      );
      g.addColorStop(
        0.45,
        `rgb(${Math.round(2 * k)},${Math.round(6 * k)},${Math.round(10 * k)})`,
      );
      g.addColorStop(1, "#000102");
      ctx.fillStyle = g;
      ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
      this.backgroundGradient = cfg.gradient;
    }
    project(v, b, side, part, angle, t) {
      let x = v.x,
        y = -v.y,
        z = 0;
      if (part > 0.5) {
        const limit = part > 1.5 ? 185 : 333,
          span = Math.max(y, 0),
          r = clamp(span / limit, 0, 1),
          r2 = r * r;
        const leading = part > 1.5 ? -38 * r - 48 * r2 : 145 * r - 75 * r2;
        const chord = Math.max(
          18,
          part > 1.5
            ? 242 * Math.sin(2.0420352 * r)
            : 175 * Math.sin(2.5132741 * r),
        );
        const trailing = clamp((leading - x) / chord, 0, 1);
        let vein = leading - 0.2 * chord;
        const offset = x - vein;
        const hind = part > 1.5,
          feather =
            b.feather *
            (hind ? 0.84 : 1) *
            (0.3 + 0.7 * r2) *
            (0.72 + 0.28 * trailing);
        const sweep = b.sweep * (hind ? 0.78 : 1);
        vein += sweep * span * (0.2 + 0.8 * r);
        let normal = -offset * Math.sin(feather);
        x = vein + offset * Math.cos(feather);
        normal +=
          b.camber *
          (hind ? 1.12 : 1) *
          chord *
          1.15 *
          trailing *
          (1 - trailing) *
          smooth(r / 0.42);
        const localAngle =
          angle + b.tipFlex * (hind ? 0.86 : 1) * (0.1 * r + 0.9 * r2);
        x -= span * 0.03;
        y = span * Math.sin(localAngle) + normal * Math.cos(localAngle);
        z =
          side *
          (span * Math.cos(localAngle) - normal * Math.sin(localAngle) + 4);
      } else {
        const tail = clamp(-x / 150, 0, 1),
          antenna = clamp((x - 50) / 140, 0, 1);
        y +=
          tail * tail * (1.6 * Math.sin(t * 2.7) + b.angularVelocity * 0.055) +
          antenna * antenna * 1.6 * Math.sin(t * 3.7);
      }
      const cx = x * b.cosYaw + z * b.sinYaw,
        cz = -x * b.sinYaw + z * b.cosYaw;
      const cy = y * b.cosElevation - cz * b.sinElevation,
        depth = y * b.sinElevation + cz * b.cosElevation;
      const k = (b.scale * 1400) / (1400 - depth),
        qx = cx * k,
        qy = cy * k;
      return {
        x: (qx * b.cosPitch - qy * b.sinPitch) * b.direction,
        y: -(qx * b.sinPitch + qy * b.cosPitch),
        u: v.u,
        v: v.v,
      };
    }
    part(b, name, side, part, angle, opacity, t, origin) {
      const textures =
        this.textures[(b.variantIndex ?? 0) % this.textures.length] ||
        this.textures[0];
      const tex = textures[name];
      const rect =
        name === "body" ? [-190, -155, 218, 136] : [-275, -365, 160, 8];
      const count = part > 0.5 ? 24 : 4;
      const context = this.lc;
      const facing =
        part > 0.5
          ? 0.8 + 0.2 * Math.abs(Math.sin(angle + side * b.elevation))
          : 1;
      context.globalAlpha = opacity * facing;
      // Continuous 3D strip projection. Cropped raster strips avoid thousands of
      // CPU clipping operations; every strip still follows the hinged/flexible wing.
      const middleX = (rect[0] + rect[2]) / 2;
      let previousEnd;
      for (let row = 0; row < count; row++) {
        const v0 = row / count,
          v1 = (row + 1) / count,
          vm = (v0 + v1) / 2;
        const sy = v0 * tex.height,
          sh = (v1 - v0) * tex.height;
        const p0 =
          previousEnd ||
          this.project(
            { x: middleX, y: mix(rect[1], rect[3], v0) },
            b,
            side,
            part,
            angle,
            t + b.seed,
          );
        const p1 = this.project(
          { x: middleX, y: mix(rect[1], rect[3], v1) },
          b,
          side,
          part,
          angle,
          t + b.seed,
        );
        previousEnd = p1;
        const left = this.project(
          { x: rect[0], y: mix(rect[1], rect[3], vm) },
          b,
          side,
          part,
          angle,
          t + b.seed,
        );
        const right = this.project(
          { x: rect[2], y: mix(rect[1], rect[3], vm) },
          b,
          side,
          part,
          angle,
          t + b.seed,
        );
        const A = (right.x - left.x) / tex.width,
          B = (right.y - left.y) / tex.width,
          C = (p1.x - p0.x) / sh,
          D = (p1.y - p0.y) / sh;
        if (Math.abs(A * D - B * C) < 0.000003) continue;
        const E = p0.x - (A * tex.width) / 2 - C * sy,
          F = p0.y - (B * tex.width) / 2 - D * sy;
        context.setTransform(
          A * dpr,
          B * dpr,
          C * dpr,
          D * dpr,
          (E + origin) * dpr,
          (F + origin) * dpr,
        );
        // A half source pixel of overlap closes subpixel rasterization cracks.
        const overlap = 0.5,
          top = Math.max(0, sy - overlap),
          bottom = Math.min(tex.height, sy + sh + overlap);
        context.drawImage(
          tex,
          0,
          top,
          tex.width,
          bottom - top,
          0,
          top,
          tex.width,
          bottom - top,
        );
      }
    }
    draw(t, alpha = 1) {
      const ctx = this.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.drawImage(this.back, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      let maxSpan = 1;
      for (const b of birds) maxSpan = Math.max(maxSpan, b.span);
      const logicalSize = Math.ceil(maxSpan * 3.8),
        size = Math.ceil(logicalSize * dpr),
        origin = logicalSize / 2;
      if (this.layer.width !== size || this.layer.height !== size) {
        this.layer.width = this.layer.height = size;
      }
      const blurLayerSize = size + CANVAS_BLUR_PADDING * 2 + 2;
      if (
        this.blurLayer.width !== blurLayerSize ||
        this.blurLayer.height !== blurLayerSize
      ) {
        this.blurLayer.width = this.blurLayer.height = blurLayerSize;
      }
      for (const bird of drawOrder()) {
        const b = bird.pose(alpha);
        if (b.x < -b.span * 2.7 || b.x > width + b.span * 2.7) continue;
        b.cosYaw = Math.cos(b.yaw);
        b.sinYaw = Math.sin(b.yaw);
        b.cosElevation = Math.cos(b.elevation);
        b.sinElevation = Math.sin(b.elevation);
        b.cosPitch = Math.cos(b.pitch);
        b.sinPitch = Math.sin(b.pitch);
        this.lc.setTransform(1, 0, 0, 1, 0, 0);
        this.lc.clearRect(0, 0, size, size);
        const rear = b.angle - 0.018;
        this.part(
          b,
          "hindwing",
          -1,
          2,
          rear - 0.006,
          b.opacity * 0.66,
          t,
          origin,
        );
        this.part(
          b,
          "forewing",
          -1,
          1,
          b.angle - 0.005,
          b.opacity * 0.69,
          t,
          origin,
        );
        this.part(
          b,
          "hindwing",
          1,
          2,
          rear + 0.006,
          b.opacity * 0.93,
          t,
          origin,
        );
        this.part(b, "forewing", 1, 1, b.angle + 0.005, b.opacity, t, origin);
        this.part(b, "body", 0, 0, 0, b.opacity, t, origin);
        const blur = clamp(
          cfg.butterflyBlur +
            (1 - b.depth) * cfg.butterflyDepthBlur +
            Math.abs(b.angularVelocity) * cfg.butterflyMotionBlur * 0.22,
          0,
          6,
        );
        const blurRadius = (blur * 1.15).toFixed(2);
        ctx.globalAlpha = 1;
        if (blurRadius === "0.00") {
          ctx.drawImage(
            this.layer,
            b.x - origin,
            b.y - origin,
            logicalSize,
            logicalSize,
          );
        } else {
          const blurCtx = this.bc;
          const nativeX = (b.x - origin) * dpr,
            nativeY = (b.y - origin) * dpr,
            floorX = Math.floor(nativeX),
            floorY = Math.floor(nativeY),
            fractionX = nativeX - floorX,
            fractionY = nativeY - floorY,
            padding = CANVAS_BLUR_PADDING;
          blurCtx.setTransform(1, 0, 0, 1, 0, 0);
          blurCtx.globalAlpha = 1;
          blurCtx.globalCompositeOperation = "source-over";
          blurCtx.filter = "none";
          blurCtx.clearRect(0, 0, this.blurLayer.width, this.blurLayer.height);
          blurCtx.filter = `blur(${blurRadius}px)`;
          blurCtx.drawImage(
            this.layer,
            padding + fractionX,
            padding + fractionY,
            logicalSize * dpr,
            logicalSize * dpr,
          );
          blurCtx.filter = "none";
          ctx.drawImage(
            this.blurLayer,
            (floorX - padding) / dpr,
            (floorY - padding) / dpr,
            this.blurLayer.width / dpr,
            this.blurLayer.height / dpr,
          );
        }
      }
      if (cfg.grain > 0) {
        // The tile only moves at 16 Hz. Rasterize its viewport-sized repetition
        // once per phase, then blend the cached native bitmap over the wings.
        const tick = Math.floor(t * 16);
        if (tick !== this.grainTick) {
          const dx = (tick * 37) % 192,
            dy = (tick * 73) % 192;
          const grainCtx = this.grainContext;
          grainCtx.setTransform(1, 0, 0, 1, 0, 0);
          grainCtx.clearRect(
            0,
            0,
            this.grainFrame.width,
            this.grainFrame.height,
          );
          grainCtx.setTransform(dpr, 0, 0, dpr, -dx * dpr, -dy * dpr);
          grainCtx.fillStyle = this.pattern;
          grainCtx.fillRect(0, 0, width + 192, height + 192);
          this.grainTick = tick;
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = cfg.grain * 0.07;
        ctx.drawImage(this.grainFrame, 0, 0);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
    refreshTextures() {
      for (let variant = 0; variant < this.textures.length; variant++)
        for (const name of TEXTURE_PARTS) {
          const texture = this.textures[variant][name];
          const ctx = texture.getContext("2d");
          ctx.clearRect(0, 0, 512, 512);
          ctx.filter = `brightness(${cfg.exposure})`;
          ctx.drawImage(images[variant][name], 0, 0);
        }
    }
    destroy() {
      this.layer.width =
        this.layer.height =
        this.blurLayer.width =
        this.blurLayer.height =
        this.back.width =
        this.back.height =
        this.grainFrame.width =
        this.grainFrame.height =
          1;
      for (const set of this.textures)
        for (const name of TEXTURE_PARTS)
          set[name].width = set[name].height = 1;
    }
  }

  function countForViewport() {
    if (solo) return 1;
    if (cfg.count > 0) return clamp(Math.round(cfg.count), 1, 28);
    return clamp(Math.round((width * height) / 175000), width < 700 ? 4 : 6, 9);
  }
  function countForQuality() {
    const count = countForViewport();
    return adapt.stage >= 2
      ? Math.min(count, Math.max(3, Math.round(count / 2)))
      : count;
  }
  function adaptReset() {
    adapt.stage = 0;
    adapt.seen = 0;
    adapt.samples.length = 0;
    adapt.windowMs = 0;
  }
  function adaptApply() {
    const is2d = renderer && renderer.kind === "canvas2d";
    if (adapt.stage === 0 && !is2d) {
      // GL path: cut pixels first (monotone min(): never raise a user-lowered value).
      adapt.stage = 1;
      cfg.maxPixelRatio = Math.min(
        cfg.maxPixelRatio,
        Math.max(0.75, cfg.maxPixelRatio * 0.6),
      );
      cfg.maxRenderPixels = Math.min(
        cfg.maxRenderPixels,
        Math.max(600000, Math.round(cfg.maxRenderPixels * 0.35)),
      );
      resize();
    } else if (adapt.stage <= 1) {
      // GL after resolution cut; canvas2d is already DPR-pinned so it starts here.
      adapt.stage = 2;
      const n = Math.min(birds.length, countForQuality());
      if (n < birds.length) birds.length = n;
      if (renderer) renderer.draw(time);
    } else {
      adapt.stage = 3;
      cancelAnimationFrame(raf);
      raf = 0;
      lastTimestamp = 0;
      if (renderer) renderer.draw(time); // Leave one settled, static frame.
    }
    adapt.seen = 0;
    adapt.samples.length = 0;
    adapt.windowMs = 0;
  }
  function adaptSample(intervalMs) {
    if (adapt.stage >= 3) return;
    adapt.seen++;
    if (adapt.seen <= ADAPT_WARMUP) return;
    const samples = adapt.samples;
    samples.push(intervalMs);
    adapt.windowMs += intervalMs;
    if (samples.length > ADAPT_WINDOW) {
      adapt.windowMs -= samples.shift();
    }
    // Decide on 18 frames OR ~2s of evidence (min 6 frames): at 4 fps a pure
    // frame-count window would stretch decisions into half-minute waits.
    if (
      samples.length < 6 ||
      (samples.length < ADAPT_WINDOW && adapt.windowMs < 2000)
    )
      return;
    const mean = adapt.windowMs / samples.length;
    const budget = adapt.stage >= 2 ? ADAPT_FREEZE_MS : ADAPT_DEGRADE_MS;
    if (mean > budget) adaptApply();
    else {
      samples.length = 0;
      adapt.windowMs = 0;
    }
  }
  function reset() {
    time = 0;
    accumulator = 0;
    const n = countForQuality();
    birds = Array.from({ length: n }, (_, i) => new Butterfly(i, n));
    // Bring motion and wing activation into a settled state without moving across the field.
    for (let j = 0; j < 18; j++)
      for (const b of birds) {
        const x = b.x,
          y = b.y;
        b.update(fixedDT);
        b.x = x;
        b.y = y;
      }
    for (const b of birds) b.capturePrevious();
  }
  function isReduced() {
    return cfg.respectReducedMotion && reducedQuery.matches;
  }
  function measureHero() {
    const hero = document.querySelector(".hero");
    heroStopY = hero
      ? Math.max(1, hero.getBoundingClientRect().bottom + window.scrollY)
      : 0;
  }
  // Full speed over the hero, smootherstep slowdown while it scrolls out,
  // complete stop exactly when the hero leaves the viewport.
  function targetMotionScale() {
    if (solo) return 1;
    if (heroStopY <= 0) return 0;
    return 1 - smoother(clamp(window.scrollY / heroStopY, 0, 1));
  }
  function updateOverlaySuspension() {
    const suspended = !!document.querySelector(
      ".site-header[data-menu-open], [data-evidence-dialog][open]",
    );
    if (suspended === overlaySuspended) return;
    overlaySuspended = suspended;
    if (suspended) {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTimestamp = 0;
    } else updateMotion();
  }
  function observeOverlaySuspension() {
    overlayObserver = new MutationObserver((mutations) => {
      const relevant = mutations.some(({ target, attributeName }) =>
        attributeName === "data-menu-open"
          ? target.matches(".site-header")
          : attributeName === "open" &&
            target.matches("[data-evidence-dialog]"),
      );
      if (relevant) updateOverlaySuspension();
    });
    overlayObserver.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-menu-open", "open"],
    });
    updateOverlaySuspension();
  }
  function updateMotion(redraw = true) {
    motionScale = targetMotionScale();
    if (
      destroyed ||
      lost ||
      !ready ||
      document.hidden ||
      paused ||
      manual ||
      isReduced() ||
      overlaySuspended
    )
      return;
    if (motionScale <= 0 || adapt.stage >= 3) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        lastTimestamp = 0;
      }
      if (redraw !== false && renderer) renderer.draw(time);
    } else if (!raf) {
      play();
    }
  }
  function resize(force = false) {
    if (destroyed) return;
    const oldW = width,
      oldH = height;
    const nextWidth = Math.max(1, innerWidth),
      nextHeight = Math.max(1, innerHeight);
    let nextDpr = Math.min(
      devicePixelRatio || 1,
      cfg.maxPixelRatio,
      Math.sqrt(cfg.maxRenderPixels / (nextWidth * nextHeight)),
    );
    if (renderer && renderer.kind === "canvas2d")
      nextDpr = Math.min(nextDpr, 1);
    if (
      ready &&
      force !== true &&
      nextWidth === width &&
      nextHeight === height &&
      nextDpr === dpr
    )
      return;
    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    if (!birds.length) reset();
    else {
      if (width !== oldW || height !== oldH) {
        const xRatio = width / oldW,
          yRatio = height / oldH,
          scaleRatio = clamp(width / 850, 0.7, 1) / clamp(oldW / 850, 0.7, 1);
        for (const b of birds) {
          b.x *= xRatio;
          b.y *= yRatio;
          b.cruiseY *= yRatio;
          b.targetX *= xRatio;
          b.targetY *= yRatio;
          b.span = solo ? height * 0.34 : b.span * scaleRatio;
          b.scale = b.span / 326;
          b.baseSpeed *= scaleRatio;
          b.flightCeiling = Math.min(height * 0.18, b.span + 42);
          b.flightFloor = Math.max(
            b.flightCeiling + 60,
            height - b.flightCeiling,
          );
          b.cruiseY = clamp(b.cruiseY, b.flightCeiling, b.flightFloor);
          b.targetY = clamp(b.targetY, b.flightCeiling, b.flightFloor);
          b.capturePrevious();
        }
      }
      const n = countForQuality();
      if (n < birds.length) birds.length = n;
      while (birds.length < n) birds.push(new Butterfly(birds.length, n));
    }
    if (renderer) {
      renderer.resize();
      renderer.draw(time);
    } else if (images) drawFallback();
    measureHero();
    updateMotion(false);
  }
  function step(dt) {
    time += dt;
    for (const b of birds) b.update(dt);
  }
  function renderFrame(timestamp) {
    raf = 0;
    if (
      destroyed ||
      lost ||
      paused ||
      document.hidden ||
      !ready ||
      overlaySuspended ||
      isReduced() ||
      manual ||
      adapt.stage >= 3 // Sticky freeze: loop stays dead until explicit reseed.
    )
      return;
    if (motionScale <= 0) {
      renderer.draw(time);
      return;
    }
    const rawDT = lastTimestamp
      ? Math.max(0, (timestamp - lastTimestamp) / 1000)
      : 1 / 60;
    if (lastTimestamp) {
      stats.frameIntervals += rawDT * 1000;
      stats.intervalCount++;
      adaptSample(rawDT * 1000);
    }
    if (adapt.stage >= 3) return; // Frozen mid-loop by adaptation; frame already drawn.
    if (rawDT > fixedDT * maxSubsteps) stats.discardedCatchups++;
    lastTimestamp = timestamp;
    accumulator += Math.min(rawDT, fixedDT * maxSubsteps) * motionScale;
    const start = performance.now();
    let steps = 0;
    while (accumulator >= fixedDT && steps < maxSubsteps) {
      step(fixedDT);
      accumulator -= fixedDT;
      steps++;
    }
    if (accumulator >= fixedDT) accumulator %= fixedDT;
    const afterPhysics = performance.now();
    const alpha = clamp(accumulator / fixedDT, 0, 1);
    renderer.draw(Math.max(0, time - fixedDT + accumulator), alpha);
    stats.frames++;
    stats.simulationSteps += steps;
    const cpu = afterPhysics - start;
    stats.physicsTotal += cpu;
    stats.physicsMax = Math.max(stats.physicsMax, cpu);
    stats.submitTotal += performance.now() - afterPhysics;
    // adaptApply() may re-enter play() via resize() mid-frame; never double-chain.
    if (!raf) raf = requestAnimationFrame(renderFrame);
  }
  function play() {
    paused = false;
    lastTimestamp = 0;
    if (
      renderer &&
      ready &&
      !raf &&
      !destroyed &&
      !lost &&
      !document.hidden &&
      !isReduced() &&
      !overlaySuspended &&
      adapt.stage < 3 &&
      !manual
    )
      raf = requestAnimationFrame(renderFrame);
  }
  function pause() {
    paused = true;
    cancelAnimationFrame(raf);
    raf = 0;
    lastTimestamp = 0;
  }
  function visibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTimestamp = 0;
    } else if (!paused) updateMotion();
  }
  function motionChange(redraw = true) {
    if (isReduced()) {
      cancelAnimationFrame(raf);
      raf = 0;
      if (redraw !== false && renderer && !overlaySuspended)
        renderer.draw(time);
    } else if (!paused) updateMotion(redraw);
  }
  function drawFallback() {
    // A static raster composition, never a broken/slideshow imitation of the rig.
    let target = canvas;
    if (canvas.getContext("webgl")) {
      target = canvas.cloneNode();
      canvas.replaceWith(target);
    }
    const ctx = target.getContext("2d");
    if (!ctx) return;
    target.width = Math.round(width * dpr);
    target.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      0,
      width * 0.5,
      height * 0.48,
      Math.max(width, height) * 0.66,
    );
    gradient.addColorStop(0, "#091927");
    gradient.addColorStop(0.55, "#02070c");
    gradient.addColorStop(1, "#000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    for (const b of birds) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(b.direction * b.scale, b.scale);
      ctx.globalAlpha = b.opacity;
      const set = images[(b.variantIndex ?? 0) % images.length] || images[0];
      for (const [name, r] of Object.entries({
        hindwing: [-275, -365, 435, 373],
        forewing: [-275, -365, 435, 373],
        body: [-190, -155, 408, 291],
      }))
        ctx.drawImage(set[name], ...r);
      ctx.restore();
    }
  }
  const api = {
    ready: false,
    reseed(seed = cfg.seed + 173) {
      cfg.seed = finite(seed, cfg.seed) >>> 0;
      adaptReset(); // Explicit intent: let the machine re-prove itself.
      reset();
      if (renderer) renderer.draw(time);
      updateMotion(false);
    },
    setOptions(options = {}) {
      if (!options || typeof options !== "object") return { ...cfg };
      const before = { ...cfg };
      const resetPopulation = adapt.stage >= 2;
      applyOptions(options);
      adaptReset(); // Explicit intent: let the machine re-prove itself.
      const rebuild = [
        "seed",
        "count",
        "speed",
        "wingSpeed",
        "minWingSpan",
        "maxWingSpan",
      ].some((k) => before[k] !== cfg[k]);
      if (rebuild || resetPopulation) reset();
      if (
        renderer &&
        renderer.kind === "canvas2d" &&
        before.exposure !== cfg.exposure
      )
        renderer.refreshTextures();
      if (
        before.maxPixelRatio !== cfg.maxPixelRatio ||
        before.maxRenderPixels !== cfg.maxRenderPixels ||
        before.gradient !== cfg.gradient ||
        rebuild ||
        resetPopulation
      )
        resize(true);
      else if (renderer) renderer.draw(time);
      motionChange(false);
      return { ...cfg };
    },
    // Deterministic capture/testing helper. Calling it pauses real-time playback.
    renderAt(seconds) {
      if (!ready) throw new Error("Wait for butterflyField.ready first.");
      seconds = clamp(finite(seconds, 0), 0, 3600);
      pause();
      if (seconds < time) reset();
      while (time + fixedDT <= seconds + 1e-7) step(fixedDT);
      if (renderer) renderer.draw(time);
      return this.getState();
    },
    getState() {
      return {
        version: "7.3",
        time,
        width,
        height,
        paused,
        adaptiveStage: adapt.stage,
        renderer: renderer ? renderer.kind : "static",
        reducedMotion: isReduced(),
        config: { ...cfg },
        butterflies: birds.map((b) => ({
          id: b.id,
          x: b.x,
          y: b.y,
          direction: b.direction,
          depth: b.depth,
          span: b.span,
          variantIndex: b.variantIndex,
          phase: b.phase,
          angle: b.angle,
          feather: b.feather,
          sweep: b.sweep,
          camber: b.camber,
          tipFlex: b.tipFlex,
          angularVelocity: b.angularVelocity,
          gliding: b.gliding,
          beatsRemaining: b.beatsRemaining,
        })),
      };
    },
    getPerformance() {
      return {
        renderer: renderer ? renderer.kind : "static",
        frames: stats.frames,
        simulationHz: 1 / fixedDT,
        oscillators: 0,
        physicsMsPerFrame: stats.physicsTotal / Math.max(1, stats.frames),
        physicsMaxMs: stats.physicsMax,
        renderSubmissionMsPerFrame:
          stats.submitTotal / Math.max(1, stats.frames),
        averageFrameIntervalMs:
          stats.frameIntervals / Math.max(1, stats.intervalCount),
        simulatedSteps: stats.simulationSteps,
        discardedCatchups: stats.discardedCatchups,
        backingWidth: canvas.width,
        backingHeight: canvas.height,
        pixelRatio: dpr,
        submittedVertices: renderer?.vertexCount ?? null,
        drawCalls: renderer?.drawCalls ?? null,
        note: "CPU timings and rAF intervals only, not a GPU time measurement or FPS guarantee.",
      };
    },
    resetPerformance() {
      for (const k of Object.keys(stats)) stats[k] = 0;
    },
    destroy() {
      pause();
      destroyed = true;
      if (overlayObserver) {
        overlayObserver.disconnect();
        overlayObserver = null;
      }
      removeEventListener("resize", resize);
      removeEventListener("scroll", scrollChange);
      document.removeEventListener("astro:page-load", onPageSwap);
      document.removeEventListener("visibilitychange", visibilityChange);
      reducedQuery.removeEventListener("change", motionChange);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      if (renderer) renderer.destroy();
    },
  };
  window.butterflyField = api;
  function scrollChange() {
    cameraY = window.scrollY;
    // In frozen states, scrolling still re-projects the viewpoint without advancing the clock.
    if (
      ready &&
      renderer &&
      !destroyed &&
      !lost &&
      !document.hidden &&
      !overlaySuspended &&
      (paused || isReduced() || manual)
    )
      renderer.draw(time);
    updateMotion();
  }
  function contextLost(e) {
    e.preventDefault();
    lost = true;
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function contextRestored() {
    lost = false;
    try {
      renderer = new Renderer();
      resize();
      if (!paused) updateMotion();
    } catch (e) {
      console.error(e);
    }
  }
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      if ("fetchPriority" in image) image.fetchPriority = "low";
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(new Error("A butterfly texture variant could not be loaded."));
      image.src = src;
    });
  }
  // Astro SPA navigations keep the transition:persist canvas; re-measure the hero and re-evaluate motion.
  const onPageSwap = () => {
    measureHero();
    updateOverlaySuspension();
    updateMotion();
  };
  async function init() {
    try {
      canvas = document.getElementById("butterfly-field");
      if (!canvas) throw new Error("Butterfly canvas is unavailable.");
      images = await Promise.all(
        ASSET_SETS.map(async (set) => {
          const entries = await Promise.all(
            Object.entries(set).map(async ([name, url]) => [
              name,
              await loadImage(url),
            ]),
          );
          return Object.fromEntries(entries);
        }),
      );
      try {
        if (params.get("renderer") !== "webgl")
          throw new Error("Canvas 2D source renderer selected.");
        renderer = new Renderer();
      } catch (error) {
        console.info("Using the Canvas 2D wing-rig renderer:", error.message);
        renderer = new CanvasRenderer();
      }
      resize();
      ready = true;
      api.ready = true;
      addEventListener("resize", resize, { passive: true });
      addEventListener("scroll", scrollChange, { passive: true });
      document.addEventListener("visibilitychange", visibilityChange);
      reducedQuery.addEventListener("change", motionChange);
      document.addEventListener("astro:page-load", onPageSwap);
      observeOverlaySuspension();
      if (renderer) {
        renderer.draw(time);
        measureHero();
        updateMotion();
      }
      requestAnimationFrame(() => {
        canvas.dataset.ready = "true";
      });
      dispatchEvent(new Event("butterflyfieldready"));
    } catch (error) {
      console.error(error);
    }
  }
  // Texture downloads start only once the page is idle, so the ~1.1 MB of
  // wing textures never compete with LCP assets (hero image, font, CSS).
  const startWhenIdle = () => {
    if (typeof requestIdleCallback === "function")
      requestIdleCallback(() => void init(), { timeout: 2500 });
    else setTimeout(() => void init(), 1200);
  };
  if (document.readyState === "complete") startWhenIdle();
  else addEventListener("load", startWhenIdle, { once: true });
})();
