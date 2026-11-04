import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const images = fileURLToPath(new URL("../public/images/", import.meta.url));
const manifest = fileURLToPath(
  new URL("../src/data/cat-rig-artwork.json", import.meta.url),
);
const temporary = mkdtempSync(join(tmpdir(), "portfolio-cat-rig-"));
const temp = (name) => join(temporary, name);
const image = (name) => join(images, name);
const scale = 4;
const point = (x, y) => ({ x: 30 + x * scale, y: 110 + y * scale });
const bones = {
  root: point(78, 138),
  elbow: point(58, 150),
  wrist: point(34, 160),
  tip: point(20, 161),
};
const restPose = { shoulder: -1.6, elbow: 0, wrist: 0 };
const layout = {
  character: { width: 981, height: 1204 },
  atlas: { width: 981, height: 1616 },
  layers: {
    body: {
      placement: { x: 0, y: 0, width: 981, height: 1204 },
      atlas: { x: 0, y: 0, width: 981, height: 1204 },
    },
    leg: {
      placement: { x: 30, y: 582, width: 400, height: 320 },
      atlas: { x: 0, y: 1204, width: 400, height: 320 },
    },
    collar: {
      placement: { x: 310, y: 582, width: 400, height: 400 },
      atlas: { x: 420, y: 1204, width: 400, height: 400 },
    },
  },
  bones,
  restPose,
};
const size = ({ width, height }) => `${width}x${height}`;
const position = ({ x, y }) => `+${x}+${y}`;
const { body, leg, collar } = layout.layers;
const magick = (...args) => {
  const result = spawnSync("magick", args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(result.stderr || "ImageMagick failed");
};

// Keep the first composite's resting character fixed; take the actual extended
// foreleg from the third composite, instead of inventing an arm from an oval.
const bodyOutline =
  "path 'M 46,15 C 34,12 30,37 29,59 C 22,80 27,102 40,112 L 60,124 C 50,137 41,149 45,168 C 48,179 56,184 57,194 L 58,208 C 65,225 85,223 97,216 C 113,226 137,225 144,209 L 149,189 C 174,205 205,198 216,177 C 224,160 217,145 208,138 C 201,130 189,132 181,137 C 171,143 172,154 176,164 C 180,179 168,177 158,165 L 148,139 C 142,126 137,120 131,115 C 155,101 161,80 157,60 L 157,32 C 157,8 145,10 132,21 L 104,46 C 86,43 78,48 67,41 Z'";
const whiskers =
  "path 'M 57,107 C 45,106 27,112 22,118 L 24,124 C 34,117 48,114 62,114 Z' " +
  "path 'M 59,114 C 46,117 31,124 26,130 L 29,135 C 40,127 51,123 65,121 Z' " +
  "path 'M 63,121 C 53,125 39,132 33,139 L 39,141 C 48,135 57,131 68,128 Z' " +
  "path 'M 133,108 C 145,109 158,115 164,121 L 162,126 C 151,119 140,117 130,115 Z' " +
  "path 'M 130,116 C 143,119 156,126 162,133 L 157,138 C 147,130 138,127 126,124 Z' " +
  "path 'M 126,124 C 136,128 148,136 155,142 L 149,146 C 139,137 131,133 123,131 Z'";
const pawOutline =
  "path 'M 80,127 C 72,134 58,141 44,144 C 30,148 17,145 13,156 C 8,167 13,176 24,180 C 35,183 52,175 66,170 C 78,166 86,160 91,153 L 94,132 Z'";
const extract = (name, paths, crop, source = temp("composite.png")) => {
  const mask = temp(`${name}-mask.png`);
  magick(
    "-size",
    "230x230",
    "xc:none",
    "-fill",
    "white",
    "-draw",
    paths,
    "-channel",
    "A",
    "-blur",
    "0x0.65",
    "+channel",
    mask,
  );
  magick(
    source,
    "-alpha",
    "set",
    mask,
    "-compose",
    "DstIn",
    "-composite",
    "-crop",
    crop,
    "+repage",
    "-define",
    "webp:lossless=true",
    image(`${name}.webp`),
  );
};

try {
  magick(
    image("cat-rig-sheet.png"),
    "-background",
    "#071018",
    "-alpha",
    "remove",
    "-alpha",
    "off",
    "-crop",
    "230x230+480+695",
    "+repage",
    temp("composite.png"),
  );
  magick(
    temp("composite.png"),
    "-define",
    "webp:lossless=true",
    image("cat-rig-reference.webp"),
  );
  magick(
    image("cat-rig-sheet.png"),
    "-crop",
    "1110x360+15+650",
    "+repage",
    "-define",
    "webp:lossless=true",
    image("cat-rig-sequence.webp"),
  );
  magick(
    image("cat-rig-sheet.png"),
    "-background",
    "#071018",
    "-alpha",
    "remove",
    "-alpha",
    "off",
    "-crop",
    "230x230+20+695",
    "+repage",
    temp("rest-source.png"),
  );
  extract(
    "cat-rig-body-source",
    `${bodyOutline} ${whiskers}`,
    "230x230+0+0",
    temp("rest-source.png"),
  );
  extract("cat-rig-front-paw", pawOutline, "100x80+0+118");
  magick(
    image("cat-rig-body-source.webp"),
    "-resize",
    "400%",
    temp("body.png"),
  );
  magick(
    "-size",
    size(layout.character),
    "xc:none",
    temp("body.png"),
    "-geometry",
    "+30+110",
    "-compose",
    "Over",
    "-composite",
    "-define",
    "webp:lossless=true",
    image("cat-rig-body.webp"),
  );
  magick(
    image("cat-rig-front-paw.webp"),
    "-resize",
    "400%",
    "-define",
    "webp:lossless=true",
    image("cat-rig-leg.webp"),
  );

  // Medial chest pixels conceal the tucked arm, leaving the lateral shoulder
  // and extended foreleg unobstructed. Feather across the attachment, not its tip.
  magick(
    image("cat-rig-body.webp"),
    "-crop",
    `${size(collar.placement)}${position(collar.placement)}`,
    "+repage",
    "-channel",
    "A",
    "-fx",
    "fade=min(1,max(0,i/40)); u*fade*fade*(3-2*fade)",
    "+channel",
    "-define",
    "webp:lossless=true",
    image("cat-rig-collar.webp"),
  );
  magick(
    image("cat-rig-leg.webp"),
    "-virtual-pixel",
    "transparent",
    "-define",
    `distort:viewport=${size(layout.character)}+0+0`,
    "-distort",
    "SRT",
    `${bones.root.x - leg.placement.x},${bones.root.y - leg.placement.y} 1 ${(restPose.shoulder * 180) / Math.PI} ${bones.root.x},${bones.root.y}`,
    "+repage",
    temp("rest-paw.png"),
  );
  magick(
    image("cat-rig-body.webp"),
    temp("rest-paw.png"),
    "-compose",
    "Over",
    "-composite",
    image("cat-rig-collar.webp"),
    "-geometry",
    position(collar.placement),
    "-composite",
    "-define",
    "webp:lossless=true",
    temp("cat-rig-rest.webp"),
  );
  magick(
    temp("cat-rig-rest.webp"),
    "-resize",
    "640x785!",
    "-define",
    "webp:lossless=true",
    temp("cat-rig-rest-640.webp"),
  );
  magick(
    "-size",
    size(layout.atlas),
    "xc:none",
    image("cat-rig-body.webp"),
    "-geometry",
    position(body.atlas),
    "-compose",
    "Over",
    "-composite",
    image("cat-rig-leg.webp"),
    "-geometry",
    position(leg.atlas),
    "-composite",
    image("cat-rig-collar.webp"),
    "-geometry",
    position(collar.atlas),
    "-composite",
    "-define",
    "webp:lossless=true",
    temp("cat-rig-atlas.webp"),
  );

  // Immutable pixels are complete before the matching layout becomes visible.
  const previous = existsSync(manifest)
    ? JSON.parse(readFileSync(manifest, "utf8"))
    : null;
  const urls = {};
  for (const [key, name] of Object.entries({
    atlas: "cat-rig-atlas",
    rest: "cat-rig-rest",
    rest640: "cat-rig-rest-640",
  })) {
    const bytes = readFileSync(temp(`${name}.webp`));
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    const filename = `${name}-${hash}.webp`;
    if (!existsSync(image(filename))) writeFileSync(image(filename), bytes);
    urls[key] = `/images/${filename}`;
  }
  const next = `${JSON.stringify({ ...layout, images: urls }, null, 2)}\n`;
  if (!existsSync(manifest) || readFileSync(manifest, "utf8") !== next) {
    writeFileSync(`${manifest}.tmp`, next);
    renameSync(`${manifest}.tmp`, manifest);
  }
  for (const url of Object.values(previous?.images ?? {})) {
    if (!Object.values(urls).includes(url))
      rmSync(image(url.slice("/images/".length)), { force: true });
  }
  console.log(
    "Extracted the extension composite; published the shoulder-connected rig and its derived rest pose.",
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
