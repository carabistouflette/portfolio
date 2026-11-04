import artwork from "../data/cat-rig-artwork.json";

export interface CatRigPoint {
  readonly x: number;
  readonly y: number;
}

export interface CatRigRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface CatRigAngleLimit {
  readonly min: number;
  readonly max: number;
}

export const CAT_RIG_CONFIG = {
  character: artwork.character,
  atlas: artwork.atlas,
  layers: artwork.layers,
  images: artwork.images,
  bones: artwork.bones,
  restPose: artwork.restPose,
  preparationPose: { shoulder: -1.72, elbow: 1.34, wrist: 0.38 },
  limits: {
    shoulder: { min: -1.9, max: 0.25 },
    elbow: { min: -0.6, max: 1.6 },
    wrist: { min: -Math.PI / 6, max: Math.PI / 6 },
  },
  playArea: { cx: 110, cy: 754, rx: 35, ry: 25 },
  mesh: { columns: 18, rows: 30 },
  weights: {
    elbowBlendStart: 30,
    elbowBlendEnd: 185,
    wristBlendStart: 150,
    wristBlendEnd: 240,
  },
} as const satisfies {
  character: { width: number; height: number };
  atlas: { width: number; height: number };
  images: { atlas: string; rest: string; rest640: string };
  layers: Record<
    "body" | "leg" | "collar",
    {
      placement: CatRigRect;
      atlas: CatRigRect;
    }
  >;
  bones: Record<"root" | "elbow" | "wrist" | "tip", CatRigPoint>;
  restPose: { shoulder: number; elbow: number; wrist: number };
  preparationPose: { shoulder: number; elbow: number; wrist: number };
  limits: Record<"shoulder" | "elbow" | "wrist", CatRigAngleLimit>;
  playArea: { cx: number; cy: number; rx: number; ry: number };
  mesh: { columns: number; rows: number };
  weights: {
    elbowBlendStart: number;
    elbowBlendEnd: number;
    wristBlendStart: number;
    wristBlendEnd: number;
  };
};
