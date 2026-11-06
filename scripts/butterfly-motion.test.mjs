import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync(
  new URL("../src/scripts/butterfly-field.js", import.meta.url),
  "utf8",
);

function createField({ reducedMotion = false } = {}) {
  const frames = new Map();
  let nextFrame = 0;
  let timestamp = 1000;
  // Keep the real scheduler and butterfly physics; replace only browser I/O.
  const context = {
    URLSearchParams,
    location: { search: "" },
    scrollY: 0,
    performance: { now: () => timestamp },
    requestAnimationFrame: (callback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: () => 1,
    clearTimeout: () => {},
    addEventListener: () => {},
    matchMedia: () => ({ matches: reducedMotion }),
    document: {
      readyState: "loading",
      hidden: false,
      getElementById: () => ({}),
      querySelector: (selector) =>
        selector === ".hero"
          ? {
              getBoundingClientRect: () => ({ bottom: 1000 - context.scrollY }),
            }
          : null,
    },
  };
  context.window = context;
  // Expose setup within the closure without adding a production testing API.
  const anchor = "window.butterflyField = api;";
  assert.equal(source.split(anchor).length, 2);
  runInNewContext(
    source.replace(
      anchor,
      `${anchor}
      window.setupField = () => {
        width = 1280;
        height = 800;
        cfg.count = 1;
        renderer = { draw() {} };
        ready = true;
        reset();
        measureHero();
        updateMotion();
      };
      window.scrollField = scrollChange;`,
    ),
    context,
  );
  context.setupField();
  return {
    state: () => context.butterflyField.getState(),
    pending: () => frames.size,
    scroll: (y) => {
      context.scrollY = y;
      context.scrollField();
    },
    advance: (count, beforeFrame = () => {}) => {
      for (let i = 0; i < count; i++) {
        beforeFrame(i);
        timestamp += 1000 / 60;
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((callback) => callback(timestamp));
      }
    },
  };
}

test("scrolling over the hero keeps flight and wingbeats moving", () => {
  const field = createField();
  field.advance(2);
  const before = field.state();
  field.advance(30, (i) => field.scroll(20 + i * 3));
  const after = field.state();
  assert.ok(after.time > before.time, "scroll must not cancel the animation");
  assert.notEqual(after.butterflies[0].phase, before.butterflies[0].phase);
  assert.notEqual(after.butterflies[0].x, before.butterflies[0].x);
});

test("motion slows progressively as the hero leaves the viewport", () => {
  const simulated = [0, 250, 500, 750].map((scrollY) => {
    const field = createField();
    field.scroll(scrollY);
    field.advance(60);
    return field.state().time;
  });
  assert.ok(simulated.every((time) => time > 0));
  for (let i = 1; i < simulated.length; i++)
    assert.ok(simulated[i] < simulated[i - 1]);
});

test("motion stops beyond the hero and resumes when scrolling back", () => {
  const field = createField();
  field.advance(10);
  field.scroll(1000);
  const stopped = field.state().time;
  field.advance(60, () => field.scroll(1100));
  assert.equal(field.state().time, stopped);
  assert.equal(field.pending(), 0, "no animation loop outside the hero");
  field.scroll(250);
  field.advance(20);
  assert.ok(field.state().time > stopped);
  assert.equal(field.pending(), 1, "resume a single animation loop");
});

test("scrolling does not animate when reduced motion is requested", () => {
  const field = createField({ reducedMotion: true });
  field.advance(60, (i) => field.scroll(i));
  assert.equal(field.state().time, 0);
  assert.equal(field.pending(), 0);
});
