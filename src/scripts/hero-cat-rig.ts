import { CAT_RIG_CONFIG, type CatRigRect } from "./cat-rig-config";

export interface CatRigPose {
  shoulder: number;
  elbow: number;
  wrist: number;
}

export interface CatRigInspection {
  pose: CatRigPose;
  joints: Float32Array;
  vertices: Float32Array;
  triangles: Uint16Array;
  weights: Float32Array;
  target: { x: number; y: number };
  effectiveTarget: { x: number; y: number };
  playArea: { cx: number; cy: number; rx: number; ry: number };
}

export interface CatRig {
  resize(width: number, height: number): void;
  draw(shoulder: number, elbow: number, wrist: number): void;
  solveTarget(x: number, y: number, tipAngle?: number): void;
  inspect(): CatRigInspection;
  setVisibleLayers(body: boolean, leg: boolean, collar: boolean): void;
  destroy(): void;
}

const clamp = (value: number, low: number, high: number): number =>
  Math.max(low, Math.min(high, value));

const smooth = (low: number, high: number, value: number): number => {
  const t = clamp((value - low) / (high - low), 0, 1);
  return t * t * (3 - 2 * t);
};

const wrapAngle = (angle: number): number => {
  let wrapped = angle % (Math.PI * 2);
  if (wrapped > Math.PI) wrapped -= Math.PI * 2;
  if (wrapped < -Math.PI) wrapped += Math.PI * 2;
  return wrapped;
};

const makeJointMatrix = (
  out: Float32Array,
  angle: number,
  x: number,
  y: number,
): void => {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  out[0] = cosine;
  out[1] = sine;
  out[2] = 0;
  out[3] = -sine;
  out[4] = cosine;
  out[5] = 0;
  out[6] = x - cosine * x + sine * y;
  out[7] = y - sine * x - cosine * y;
  out[8] = 1;
};

const multiplyMatrices = (
  out: Float32Array,
  parent: Float32Array,
  local: Float32Array,
): void => {
  for (let column = 0; column < 3; column++) {
    for (let row = 0; row < 3; row++) {
      out[column * 3 + row] =
        parent[row] * local[column * 3] +
        parent[3 + row] * local[column * 3 + 1] +
        parent[6 + row] * local[column * 3 + 2];
    }
  }
};

const pointX = (matrix: Float32Array, x: number, y: number): number =>
  matrix[0] * x + matrix[3] * y + matrix[6];

const pointY = (matrix: Float32Array, x: number, y: number): number =>
  matrix[1] * x + matrix[4] * y + matrix[7];

// Planar dual-quaternion skinning blends rigid rotations without the elbow
// collapsing as it does when the rotation-matrix coefficients are averaged.
const makeDualTransform = (
  out: Float32Array,
  matrix: Float32Array,
  angle: number,
): void => {
  const half = wrapAngle(angle) * 0.5;
  const real = Math.cos(half);
  const imaginary = Math.sin(half);
  out[0] = real;
  out[1] = imaginary;
  out[2] = 0.5 * (matrix[6] * real + matrix[7] * imaginary);
  out[3] = 0.5 * (matrix[7] * real - matrix[6] * imaginary);
};

export const createCatRig = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
): CatRig | null => {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
  });
  if (!gl) return null;

  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  if (
    imageWidth !== CAT_RIG_CONFIG.atlas.width ||
    imageHeight !== CAT_RIG_CONFIG.atlas.height
  ) {
    throw new Error(
      `Cat rig atlas must be ${CAT_RIG_CONFIG.atlas.width}×${CAT_RIG_CONFIG.atlas.height}px`,
    );
  }

  const shaders: WebGLShader[] = [];
  const buffers: WebGLBuffer[] = [];
  const program = gl.createProgram();
  const texture = gl.createTexture();
  if (!program || !texture) {
    if (program) gl.deleteProgram(program);
    if (texture) gl.deleteTexture(texture);
    return null;
  }

  let destroyed = false;
  const destroyResources = (): void => {
    if (destroyed) return;
    destroyed = true;
    for (const buffer of buffers) gl.deleteBuffer(buffer);
    for (const shader of shaders) gl.deleteShader(shader);
    gl.deleteTexture(texture);
    gl.deleteProgram(program);
  };

  try {
    const compile = (type: number, source: string): WebGLShader => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Unable to create cat rig shader");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(
          gl.getShaderInfoLog(shader) ?? "Cat rig shader compilation failed",
        );
      }
      return shader;
    };

    gl.attachShader(
      program,
      compile(
        gl.VERTEX_SHADER,
        `
          attribute vec2 position;
          attribute vec2 texCoord;
          attribute vec4 weights;
          uniform vec4 upper;
          uniform vec4 lower;
          uniform vec4 wrist;
          uniform vec2 viewScale;
          varying vec2 uv;
          void main() {
            vec4 transform = vec4(1.0, 0.0, 0.0, 0.0) * weights.x
              + upper * weights.y + lower * weights.z + wrist * weights.w;
            float inverseNorm = 1.0 / dot(transform.xy, transform.xy);
            float c = (transform.x * transform.x - transform.y * transform.y) * inverseNorm;
            float s = 2.0 * transform.x * transform.y * inverseNorm;
            vec2 translation = 2.0 * vec2(
              transform.z * transform.x - transform.w * transform.y,
              transform.z * transform.y + transform.w * transform.x
            ) * inverseNorm;
            vec2 skinned = vec2(c * position.x - s * position.y, s * position.x + c * position.y) + translation;
            gl_Position = vec4(
              (skinned.x - ${(CAT_RIG_CONFIG.character.width / 2).toFixed(1)}) * viewScale.x,
              -(skinned.y - ${(CAT_RIG_CONFIG.character.height / 2).toFixed(1)}) * viewScale.y,
              0.0,
              1.0
            );
            uv = texCoord;
          }
        `,
      ),
    );
    gl.attachShader(
      program,
      compile(
        gl.FRAGMENT_SHADER,
        `
          precision mediump float;
          uniform sampler2D artwork;
          varying vec2 uv;
          void main() {
            gl_FragColor = texture2D(artwork, uv);
          }
        `,
      ),
    );
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "Cat rig link failed");
    }

    const attribute = (name: string): number => {
      const location = gl.getAttribLocation(program, name);
      if (location < 0) throw new Error(`Cat rig attribute ${name} is missing`);
      return location;
    };
    const uniform = (name: string): WebGLUniformLocation => {
      const location = gl.getUniformLocation(program, name);
      if (location === null)
        throw new Error(`Cat rig uniform ${name} is missing`);
      return location;
    };

    const positionLocation = attribute("position");
    const texCoordLocation = attribute("texCoord");
    const weightsLocation = attribute("weights");
    const upperLocation = uniform("upper");
    const lowerLocation = uniform("lower");
    const wristLocation = uniform("wrist");
    const viewScaleLocation = uniform("viewScale");
    const artworkLocation = uniform("artwork");

    const createBuffer = (): WebGLBuffer => {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error("Unable to create cat rig buffer");
      buffers.push(buffer);
      return buffer;
    };

    const {
      character,
      atlas,
      layers,
      bones,
      limits,
      weights: weightConfig,
    } = CAT_RIG_CONFIG;
    const columns = CAT_RIG_CONFIG.mesh.columns;
    const rows = CAT_RIG_CONFIG.mesh.rows;
    const vertexCount = (columns + 1) * (rows + 1);
    const bindVertices = new Float32Array(vertexCount * 2);
    const inspectionVertices = new Float32Array(vertexCount * 2);
    const inspectionWeights = new Float32Array(vertexCount * 4);
    const meshData = new Float32Array(vertexCount * 8);
    const triangles = new Uint16Array(columns * rows * 6);
    const legPlacement = layers.leg.placement;
    const legAtlas = layers.leg.atlas;
    const axisLength = Math.hypot(
      bones.tip.x - bones.root.x,
      bones.tip.y - bones.root.y,
    );
    const axisX = (bones.tip.x - bones.root.x) / axisLength;
    const axisY = (bones.tip.y - bones.root.y) / axisLength;

    for (let row = 0; row <= rows; row++) {
      for (let column = 0; column <= columns; column++) {
        const vertexIndex = row * (columns + 1) + column;
        const positionOffset = vertexIndex * 2;
        const weightOffset = vertexIndex * 4;
        const meshOffset = vertexIndex * 8;
        const u = column / columns;
        const v = row / rows;
        const x = legPlacement.x + legPlacement.width * u;
        const y = legPlacement.y + legPlacement.height * v;
        const alongPaw =
          (x - bones.root.x) * axisX + (y - bones.root.y) * axisY;
        const elbow = smooth(
          weightConfig.elbowBlendStart,
          weightConfig.elbowBlendEnd,
          alongPaw,
        );
        const wrist = smooth(
          weightConfig.wristBlendStart,
          weightConfig.wristBlendEnd,
          alongPaw,
        );
        const upperWeight = 1 - elbow;
        const lowerWeight = elbow * (1 - wrist);
        const wristWeight = elbow * wrist;
        const textureU =
          (legAtlas.x + 0.5 + (legAtlas.width - 1) * u) / atlas.width;
        const textureV =
          (legAtlas.y + 0.5 + (legAtlas.height - 1) * v) / atlas.height;

        bindVertices[positionOffset] = x;
        bindVertices[positionOffset + 1] = y;
        inspectionWeights[weightOffset] = 0;
        inspectionWeights[weightOffset + 1] = upperWeight;
        inspectionWeights[weightOffset + 2] = lowerWeight;
        inspectionWeights[weightOffset + 3] = wristWeight;
        meshData[meshOffset] = x;
        meshData[meshOffset + 1] = y;
        meshData[meshOffset + 2] = textureU;
        meshData[meshOffset + 3] = textureV;
        meshData[meshOffset + 4] = 0;
        meshData[meshOffset + 5] = upperWeight;
        meshData[meshOffset + 6] = lowerWeight;
        meshData[meshOffset + 7] = wristWeight;
      }
    }

    let triangleOffset = 0;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const topLeft = row * (columns + 1) + column;
        const topRight = topLeft + 1;
        const bottomLeft = topLeft + columns + 1;
        const bottomRight = bottomLeft + 1;
        triangles[triangleOffset++] = topLeft;
        triangles[triangleOffset++] = topRight;
        triangles[triangleOffset++] = bottomLeft;
        triangles[triangleOffset++] = topRight;
        triangles[triangleOffset++] = bottomRight;
        triangles[triangleOffset++] = bottomLeft;
      }
    }

    const makeQuad = (
      placement: CatRigRect,
      source: CatRigRect,
    ): Float32Array => {
      const left = (source.x + 0.5) / atlas.width;
      const right = (source.x + source.width - 0.5) / atlas.width;
      const top = (source.y + 0.5) / atlas.height;
      const bottom = (source.y + source.height - 0.5) / atlas.height;
      return new Float32Array([
        placement.x,
        placement.y,
        left,
        top,
        placement.x,
        placement.y + placement.height,
        left,
        bottom,
        placement.x + placement.width,
        placement.y,
        right,
        top,
        placement.x + placement.width,
        placement.y + placement.height,
        right,
        bottom,
      ]);
    };

    const bodyBuffer = createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bodyBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      makeQuad(layers.body.placement, layers.body.atlas),
      gl.STATIC_DRAW,
    );
    const collarBuffer = createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, collarBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      makeQuad(layers.collar.placement, layers.collar.atlas),
      gl.STATIC_DRAW,
    );
    const legBuffer = createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, legBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, meshData, gl.STATIC_DRAW);
    const triangleBuffer = createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.uniform1i(artworkLocation, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const upper = new Float32Array(9);
    const lower = new Float32Array(9);
    const wrist = new Float32Array(9);
    const elbowLocal = new Float32Array(9);
    const wristLocal = new Float32Array(9);
    const upperDual = new Float32Array(4);
    const lowerDual = new Float32Array(4);
    const wristDual = new Float32Array(4);
    const pose: CatRigPose = { shoulder: 0, elbow: 0, wrist: 0 };
    const joints = new Float32Array(8);
    const target: CatRigInspection["target"] = {
      x: bones.tip.x,
      y: bones.tip.y,
    };
    const effectiveTarget: CatRigInspection["effectiveTarget"] = {
      x: bones.tip.x,
      y: bones.tip.y,
    };
    const playArea = {
      cx: CAT_RIG_CONFIG.playArea.cx,
      cy: CAT_RIG_CONFIG.playArea.cy,
      rx: CAT_RIG_CONFIG.playArea.rx,
      ry: CAT_RIG_CONFIG.playArea.ry,
    };
    const inspection: CatRigInspection = {
      pose,
      joints,
      vertices: inspectionVertices,
      triangles,
      weights: inspectionWeights,
      target,
      effectiveTarget,
      playArea,
    };

    const upperLength = Math.hypot(
      bones.elbow.x - bones.root.x,
      bones.elbow.y - bones.root.y,
    );
    const lowerLength = Math.hypot(
      bones.wrist.x - bones.elbow.x,
      bones.wrist.y - bones.elbow.y,
    );
    const tipLength = Math.hypot(
      bones.tip.x - bones.wrist.x,
      bones.tip.y - bones.wrist.y,
    );
    const upperBindAngle = Math.atan2(
      bones.elbow.y - bones.root.y,
      bones.elbow.x - bones.root.x,
    );
    const lowerBindAngle = Math.atan2(
      bones.wrist.y - bones.elbow.y,
      bones.wrist.x - bones.elbow.x,
    );
    const tipBindAngle = Math.atan2(
      bones.tip.y - bones.wrist.y,
      bones.tip.x - bones.wrist.x,
    );
    const bindBend = wrapAngle(lowerBindAngle - upperBindAngle);
    const rootToWristAngle = Math.atan2(
      bones.wrist.y - bones.root.y,
      bones.wrist.x - bones.root.x,
    );
    const minimumReach = Math.abs(upperLength - lowerLength) + 0.001;
    const maximumReach = upperLength + lowerLength - 0.001;
    const visible = { body: true, leg: true, collar: true };
    let viewScaleX = 0;
    let viewScaleY = 0;
    let hasPose = false;
    let verticesDirty = true;
    let preserveTargetOnNextDraw = false;
    let render = (): void => {};

    const updateView = (width: number, height: number): void => {
      const scale = Math.min(
        width / character.width,
        height / character.height,
      );
      viewScaleX = (2 * scale) / width;
      viewScaleY = (2 * scale) / height;
    };

    const setPoint = (
      output: Float32Array,
      offset: number,
      matrix: Float32Array,
      x: number,
      y: number,
    ): void => {
      output[offset] = pointX(matrix, x, y);
      output[offset + 1] = pointY(matrix, x, y);
    };

    const updateGeometry = (): void => {
      makeJointMatrix(upper, pose.shoulder, bones.root.x, bones.root.y);
      makeJointMatrix(elbowLocal, pose.elbow, bones.elbow.x, bones.elbow.y);
      multiplyMatrices(lower, upper, elbowLocal);
      makeJointMatrix(wristLocal, pose.wrist, bones.wrist.x, bones.wrist.y);
      multiplyMatrices(wrist, lower, wristLocal);
      makeDualTransform(upperDual, upper, pose.shoulder);
      makeDualTransform(lowerDual, lower, pose.shoulder + pose.elbow);
      makeDualTransform(
        wristDual,
        wrist,
        pose.shoulder + pose.elbow + pose.wrist,
      );

      setPoint(joints, 0, upper, bones.root.x, bones.root.y);
      setPoint(joints, 2, upper, bones.elbow.x, bones.elbow.y);
      setPoint(joints, 4, lower, bones.wrist.x, bones.wrist.y);
      setPoint(joints, 6, wrist, bones.tip.x, bones.tip.y);

      effectiveTarget.x = joints[6];
      effectiveTarget.y = joints[7];
      verticesDirty = true;
      hasPose = true;
    };

    const updateInspectionVertices = (): void => {
      for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
        const positionOffset = vertexIndex * 2;
        const weightOffset = vertexIndex * 4;
        const x = bindVertices[positionOffset];
        const y = bindVertices[positionOffset + 1];
        const pinned = inspectionWeights[weightOffset];
        const u = inspectionWeights[weightOffset + 1];
        const l = inspectionWeights[weightOffset + 2];
        const w = inspectionWeights[weightOffset + 3];
        const real =
          pinned + upperDual[0] * u + lowerDual[0] * l + wristDual[0] * w;
        const imaginary =
          upperDual[1] * u + lowerDual[1] * l + wristDual[1] * w;
        const dualX = upperDual[2] * u + lowerDual[2] * l + wristDual[2] * w;
        const dualY = upperDual[3] * u + lowerDual[3] * l + wristDual[3] * w;
        const inverseNorm = 1 / (real * real + imaginary * imaginary);
        const cosine = (real * real - imaginary * imaginary) * inverseNorm;
        const sine = 2 * real * imaginary * inverseNorm;
        inspectionVertices[positionOffset] =
          cosine * x -
          sine * y +
          2 * (dualX * real - dualY * imaginary) * inverseNorm;
        inspectionVertices[positionOffset + 1] =
          sine * x +
          cosine * y +
          2 * (dualX * imaginary + dualY * real) * inverseNorm;
      }
      verticesDirty = false;
    };

    const drawQuad = (buffer: WebGLBuffer): void => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);
      gl.disableVertexAttribArray(weightsLocation);
      gl.vertexAttrib4f(weightsLocation, 1, 0, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    render = (): void => {
      if (destroyed) return;
      gl.useProgram(program);
      gl.uniform4fv(upperLocation, upperDual);
      gl.uniform4fv(lowerLocation, lowerDual);
      gl.uniform4fv(wristLocation, wristDual);
      gl.uniform2f(viewScaleLocation, viewScaleX, viewScaleY);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (visible.body) drawQuad(bodyBuffer);
      if (visible.leg) {
        gl.bindBuffer(gl.ARRAY_BUFFER, legBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 32, 0);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 32, 8);
        gl.enableVertexAttribArray(weightsLocation);
        gl.vertexAttribPointer(weightsLocation, 4, gl.FLOAT, false, 32, 16);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
        gl.drawElements(gl.TRIANGLES, triangles.length, gl.UNSIGNED_SHORT, 0);
      }
      if (visible.collar) drawQuad(collarBuffer);
    };

    const solveTwoBone = (wristX: number, wristY: number): void => {
      let dx = wristX - bones.root.x;
      let dy = wristY - bones.root.y;
      let distance = Math.hypot(dx, dy);
      if (distance < minimumReach) {
        if (distance < 0.000001) {
          dx = Math.cos(rootToWristAngle) * minimumReach;
          dy = Math.sin(rootToWristAngle) * minimumReach;
        } else {
          const scale = minimumReach / distance;
          dx *= scale;
          dy *= scale;
        }
        distance = minimumReach;
      } else if (distance > maximumReach) {
        const scale = maximumReach / distance;
        dx *= scale;
        dy *= scale;
        distance = maximumReach;
      }

      const cosine = clamp(
        (distance * distance -
          upperLength * upperLength -
          lowerLength * lowerLength) /
          (2 * upperLength * lowerLength),
        -1,
        1,
      );
      const bend = (bindBend < 0 ? -1 : 1) * Math.acos(cosine);
      const upperOffset = Math.atan2(
        lowerLength * Math.sin(bend),
        upperLength + lowerLength * Math.cos(bend),
      );
      const upperWorldAngle = Math.atan2(dy, dx) - upperOffset;
      pose.shoulder = clamp(
        wrapAngle(upperWorldAngle - upperBindAngle),
        limits.shoulder.min,
        limits.shoulder.max,
      );
      pose.elbow = clamp(
        wrapAngle(bend - bindBend),
        limits.elbow.min,
        limits.elbow.max,
      );
    };

    const resizeCanvas = (width: number, height: number): void => {
      const ratio =
        typeof window === "undefined"
          ? 1
          : Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.max(1, Math.round(width * ratio));
      const pixelHeight = Math.max(1, Math.round(height * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      gl.viewport(0, 0, pixelWidth, pixelHeight);
      updateView(pixelWidth, pixelHeight);
      if (hasPose) render();
    };

    updateView(Math.max(1, canvas.width), Math.max(1, canvas.height));
    gl.viewport(0, 0, Math.max(1, canvas.width), Math.max(1, canvas.height));

    const rig: CatRig = {
      resize(width: number, height: number): void {
        if (destroyed) return;
        resizeCanvas(width, height);
      },
      draw(shoulder: number, elbow: number, wristAngle: number): void {
        if (destroyed) return;
        const nextShoulder = clamp(
          shoulder,
          limits.shoulder.min,
          limits.shoulder.max,
        );
        const nextElbow = clamp(elbow, limits.elbow.min, limits.elbow.max);
        const nextWrist = clamp(wristAngle, limits.wrist.min, limits.wrist.max);
        const preserveTarget =
          preserveTargetOnNextDraw &&
          nextShoulder === pose.shoulder &&
          nextElbow === pose.elbow &&
          nextWrist === pose.wrist;
        preserveTargetOnNextDraw = false;
        pose.shoulder = nextShoulder;
        pose.elbow = nextElbow;
        pose.wrist = nextWrist;
        updateGeometry();
        if (!preserveTarget) {
          target.x = effectiveTarget.x;
          target.y = effectiveTarget.y;
        }
        render();
      },
      solveTarget(x: number, y: number, tipAngle = 0): void {
        if (destroyed) return;
        target.x = x;
        target.y = y;

        let aimX = x;
        let aimY = y;
        const ellipseX = (aimX - playArea.cx) / playArea.rx;
        const ellipseY = (aimY - playArea.cy) / playArea.ry;
        const ellipseDistance = Math.hypot(ellipseX, ellipseY);
        if (ellipseDistance > 1) {
          aimX = playArea.cx + (ellipseX / ellipseDistance) * playArea.rx;
          aimY = playArea.cy + (ellipseY / ellipseDistance) * playArea.ry;
        }

        const requestedTipAngle = wrapAngle(tipAngle);
        let assumedTipAngle = tipBindAngle + requestedTipAngle;
        for (let attempt = 0; attempt < 4; attempt++) {
          const desiredWristX = aimX - Math.cos(assumedTipAngle) * tipLength;
          const desiredWristY = aimY - Math.sin(assumedTipAngle) * tipLength;
          solveTwoBone(desiredWristX, desiredWristY);
          pose.wrist = clamp(
            requestedTipAngle - pose.shoulder - pose.elbow,
            limits.wrist.min,
            limits.wrist.max,
          );
          const actualTipAngle =
            tipBindAngle + pose.shoulder + pose.elbow + pose.wrist;
          const difference = wrapAngle(actualTipAngle - assumedTipAngle);
          assumedTipAngle = actualTipAngle;
          if (Math.abs(difference) < 0.00001) break;
        }

        updateGeometry();
        preserveTargetOnNextDraw = true;
      },
      inspect(): CatRigInspection {
        if (verticesDirty) updateInspectionVertices();
        return inspection;
      },
      setVisibleLayers(body: boolean, leg: boolean, collar: boolean): void {
        if (destroyed) return;
        visible.body = body;
        visible.leg = leg;
        visible.collar = collar;
        if (hasPose) render();
      },
      destroy(): void {
        destroyResources();
      },
    };

    const rest = CAT_RIG_CONFIG.restPose;
    rig.draw(rest.shoulder, rest.elbow, rest.wrist);
    return rig;
  } catch (error) {
    destroyResources();
    throw error;
  }
};
