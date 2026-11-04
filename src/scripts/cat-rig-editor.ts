import { onPageLoad } from "./page-lifecycle";
import {
  createCatRig,
  type CatRig,
  type CatRigInspection,
  type CatRigPose,
} from "./hero-cat-rig";
import { CAT_RIG_CONFIG } from "./cat-rig-config";

const CHARACTER_WIDTH = CAT_RIG_CONFIG.character.width;
const CHARACTER_HEIGHT = CAT_RIG_CONFIG.character.height;
const SVG_NS = "http://www.w3.org/2000/svg";
const WEIGHT_COLORS = [
  [67, 190, 232],
  [166, 133, 255],
  [255, 183, 83],
  [255, 111, 151],
] as const;
const formatNumber = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});

onPageLoad((signal) => {
  const page = document.querySelector<HTMLElement>("[data-cat-rig-editor]");
  if (!page) return;

  const stage = page.querySelector<HTMLElement>("[data-rig-stage]");
  const canvas = page.querySelector<HTMLCanvasElement>("[data-rig-canvas]");
  const fallback = page.querySelector<HTMLImageElement>("[data-rig-fallback]");
  const overlay = page.querySelector<SVGSVGElement>("[data-rig-overlay]");
  const status = page.querySelector<HTMLElement>("[data-rig-status]");
  const targetHandle = page.querySelector<SVGGElement>("[data-rig-target]");
  const requestMarker = page.querySelector<SVGCircleElement>(
    "[data-target-requested]",
  );
  const effectiveMarker = page.querySelector<SVGCircleElement>(
    "[data-target-effective]",
  );
  const targetConnector = page.querySelector<SVGLineElement>(
    "[data-target-connector]",
  );
  const playArea = page.querySelector<SVGEllipseElement>("[data-play-area]");
  const boneLayer = page.querySelector<SVGGElement>(
    '[data-overlay-layer="bones"]',
  );
  const triangleLayer = page.querySelector<SVGGElement>(
    '[data-overlay-layer="triangles"]',
  );
  const weightLayer = page.querySelector<SVGGElement>(
    '[data-overlay-layer="weights"]',
  );
  const boneLines = Array.from(
    page.querySelectorAll<SVGLineElement>("[data-bone]"),
  );
  const jointMarkers = Array.from(
    page.querySelectorAll<SVGCircleElement>("[data-joint]"),
  );
  const jointLabels = Array.from(
    page.querySelectorAll<SVGTextElement>("[data-joint-label]"),
  );
  const meshPath = page.querySelector<SVGPathElement>("[data-mesh-triangles]");
  const weightsGroup = page.querySelector<SVGGElement>("[data-weight-points]");
  const wristSlider =
    page.querySelector<HTMLInputElement>("[data-wrist-angle]");
  const wristOutput = page.querySelector<HTMLOutputElement>(
    "[data-wrist-output]",
  );
  const targetOutput = page.querySelector<HTMLElement>(
    "[data-requested-output]",
  );
  const effectiveOutput = page.querySelector<HTMLElement>(
    "[data-effective-output]",
  );
  const errorOutput = page.querySelector<HTMLElement>("[data-target-error]");
  const poseOutputs = [
    page.querySelector<HTMLElement>("[data-pose-shoulder]"),
    page.querySelector<HTMLElement>("[data-pose-elbow]"),
    page.querySelector<HTMLElement>("[data-pose-wrist]"),
  ];
  const layerInputs = [
    page.querySelector<HTMLInputElement>('[data-layer="body"]'),
    page.querySelector<HTMLInputElement>('[data-layer="leg"]'),
    page.querySelector<HTMLInputElement>('[data-layer="collar"]'),
  ];
  const overlayInputs = Array.from(
    page.querySelectorAll<HTMLInputElement>("[data-overlay-toggle]"),
  );
  const controlButtons = Array.from(
    page.querySelectorAll<HTMLButtonElement>("[data-rig-preset]"),
  );
  if (
    !stage ||
    !canvas ||
    !fallback ||
    !overlay ||
    !status ||
    !targetHandle ||
    !requestMarker ||
    !effectiveMarker ||
    !targetConnector ||
    !playArea ||
    !boneLayer ||
    !triangleLayer ||
    !weightLayer ||
    boneLines.length !== 3 ||
    jointMarkers.length !== 4 ||
    jointLabels.length !== 4 ||
    !meshPath ||
    !weightsGroup ||
    !wristSlider ||
    !wristOutput ||
    !targetOutput ||
    !effectiveOutput ||
    !errorOutput ||
    poseOutputs.some((output) => !output) ||
    layerInputs.some((input) => !input)
  ) {
    return;
  }

  const requiredPoseOutputs = poseOutputs as HTMLElement[];
  const requiredLayerInputs = layerInputs as HTMLInputElement[];
  const artwork = new Image();
  let rig: CatRig | null = null;
  let inspection: CatRigInspection | null = null;
  let observer: ResizeObserver | null = null;
  let disposed = false;
  let dragPointer: number | null = null;
  let requestedX: number = CAT_RIG_CONFIG.bones.tip.x;
  let requestedY: number = CAT_RIG_CONFIG.bones.tip.y;
  let selectedTipAngle = Number(wristSlider.value);
  let presetPose: CatRigPose | null = CAT_RIG_CONFIG.restPose;
  let activeStatus = "";

  const setStatus = (message: string, state: "loading" | "ready" | "error") => {
    if (activeStatus !== message || stage.dataset.state !== state) {
      status.textContent = message;
      activeStatus = message;
      stage.dataset.state = state;
    }
  };

  const setControlsEnabled = (enabled: boolean) => {
    for (const control of [
      wristSlider,
      ...requiredLayerInputs,
      ...controlButtons,
    ]) {
      control.disabled = !enabled;
    }
    targetHandle.setAttribute("aria-disabled", String(!enabled));
    targetHandle.setAttribute("tabindex", enabled ? "0" : "-1");
  };

  const disposeRig = () => {
    const current = rig;
    rig = null;
    inspection = null;
    if (!current) return;
    try {
      current.destroy();
    } catch (error) {
      console.error("Impossible de libérer le rendu du rig de chat.", error);
    }
  };

  const failGraphics = (error: unknown) => {
    if (disposed || signal.aborted) return;
    disposeRig();
    stage.dataset.ready = "false";
    setControlsEnabled(false);
    setStatus(
      error instanceof Error
        ? `Rendu indisponible : ${error.message}`
        : "Rendu indisponible : erreur graphique inconnue.",
      "error",
    );
  };

  const updateInspection = (inspection: CatRigInspection) => {
    const joints = inspection.joints;
    const vertices = inspection.vertices;
    const weights = inspection.weights;
    const triangleIndices = inspection.triangles;

    playArea.setAttribute("cx", String(inspection.playArea.cx));
    playArea.setAttribute("cy", String(inspection.playArea.cy));
    playArea.setAttribute("rx", String(inspection.playArea.rx));
    playArea.setAttribute("ry", String(inspection.playArea.ry));

    if (boneLayer.getAttribute("display") !== "none") {
      for (let index = 0; index < boneLines.length; index += 1) {
        const offset = index * 2;
        boneLines[index].setAttribute("x1", String(joints[offset]));
        boneLines[index].setAttribute("y1", String(joints[offset + 1]));
        boneLines[index].setAttribute("x2", String(joints[offset + 2]));
        boneLines[index].setAttribute("y2", String(joints[offset + 3]));
      }
      for (let index = 0; index < jointMarkers.length; index += 1) {
        const offset = index * 2;
        jointMarkers[index].setAttribute("cx", String(joints[offset]));
        jointMarkers[index].setAttribute("cy", String(joints[offset + 1]));
        jointLabels[index].setAttribute("x", String(joints[offset] + 10));
        jointLabels[index].setAttribute("y", String(joints[offset + 1] - 11));
      }
    }

    if (triangleLayer.getAttribute("display") !== "none") {
      let trianglePath = "";
      for (let index = 0; index < triangleIndices.length; index += 3) {
        const first = triangleIndices[index] * 2;
        const second = triangleIndices[index + 1] * 2;
        const third = triangleIndices[index + 2] * 2;
        trianglePath += `M${vertices[first]} ${vertices[first + 1]}L${vertices[second]} ${vertices[second + 1]}L${vertices[third]} ${vertices[third + 1]}Z`;
      }
      meshPath.setAttribute("d", trianglePath);
    }

    if (weightLayer.getAttribute("display") !== "none") {
      const vertexCount = vertices.length / 2;
      while (weightsGroup.childElementCount < vertexCount) {
        const vertex = weightsGroup.childElementCount;
        const weightOffset = vertex * 4;
        let total = 0;
        let red = 0;
        let green = 0;
        let blue = 0;
        for (let influence = 0; influence < 4; influence += 1) {
          const weight = weights[weightOffset + influence];
          const color = WEIGHT_COLORS[influence];
          total += weight;
          red += color[0] * weight;
          green += color[1] * weight;
          blue += color[2] * weight;
        }
        const divisor = total > 0 ? total : 1;
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("r", "4.5");
        dot.setAttribute("class", "rig-weight-point");
        dot.setAttribute(
          "fill",
          `rgb(${Math.round(red / divisor)} ${Math.round(green / divisor)} ${Math.round(blue / divisor)})`,
        );
        weightsGroup.append(dot);
      }
      while (weightsGroup.childElementCount > vertexCount) {
        weightsGroup.lastElementChild?.remove();
      }
      for (let vertex = 0; vertex < vertexCount; vertex += 1) {
        const offset = vertex * 2;
        const dot = weightsGroup.children[vertex] as SVGCircleElement;
        dot.setAttribute("cx", String(vertices[offset]));
        dot.setAttribute("cy", String(vertices[offset + 1]));
      }
    }

    const requested = inspection.target;
    const effective = inspection.effectiveTarget;
    requestedX = requested.x;
    requestedY = requested.y;
    requestMarker.setAttribute("cx", String(requested.x));
    requestMarker.setAttribute("cy", String(requested.y));
    effectiveMarker.setAttribute("cx", String(effective.x));
    effectiveMarker.setAttribute("cy", String(effective.y));
    targetConnector.setAttribute("x1", String(requested.x));
    targetConnector.setAttribute("y1", String(requested.y));
    targetConnector.setAttribute("x2", String(effective.x));
    targetConnector.setAttribute("y2", String(effective.y));
    targetHandle.setAttribute(
      "transform",
      `translate(${requested.x} ${requested.y})`,
    );
    targetHandle.setAttribute(
      "aria-label",
      `Cible IK, x ${formatNumber.format(requested.x)}, y ${formatNumber.format(requested.y)}. Déplacez-la avec les flèches du clavier.`,
    );

    targetOutput.textContent = `${formatNumber.format(requested.x)} · ${formatNumber.format(requested.y)} px`;
    effectiveOutput.textContent = `${formatNumber.format(effective.x)} · ${formatNumber.format(effective.y)} px`;
    const targetError = Math.hypot(
      requested.x - effective.x,
      requested.y - effective.y,
    );
    errorOutput.textContent = `${formatNumber.format(targetError)} px`;
    errorOutput.dataset.limited = String(targetError > 1);

    const pose: CatRigPose = inspection.pose;
    requiredPoseOutputs[0].textContent = `${formatNumber.format((pose.shoulder * 180) / Math.PI)}°`;
    requiredPoseOutputs[1].textContent = `${formatNumber.format((pose.elbow * 180) / Math.PI)}°`;
    requiredPoseOutputs[2].textContent = `${formatNumber.format((pose.wrist * 180) / Math.PI)}°`;
  };

  const solveAndDraw = (x: number, y: number, tipAngle = selectedTipAngle) => {
    if (!rig || !inspection) return;
    presetPose = null;
    requestedX = x;
    requestedY = y;
    selectedTipAngle = tipAngle;
    rig.solveTarget(x, y, (tipAngle * Math.PI) / 180);
    const pose = inspection.pose;
    rig.draw(pose.shoulder, pose.elbow, pose.wrist);
    inspection = rig.inspect();
    updateInspection(inspection);
  };

  const setLayerVisibility = () => {
    if (!rig) return;
    try {
      rig.setVisibleLayers(
        requiredLayerInputs[0].checked,
        requiredLayerInputs[1].checked,
        requiredLayerInputs[2].checked,
      );
    } catch (error) {
      failGraphics(error);
    }
  };

  const setOverlayVisibility = () => {
    for (const input of overlayInputs) {
      const layer = page.querySelector<SVGGElement>(
        `[data-overlay-layer="${input.dataset.overlayToggle}"]`,
      );
      if (layer)
        layer.setAttribute("display", input.checked ? "inline" : "none");
    }
    if (rig) {
      inspection = rig.inspect();
      updateInspection(inspection);
    }
  };

  const renderAtCurrentSize = () => {
    if (!rig || disposed || signal.aborted) return;
    const bounds = stage.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    try {
      rig.resize(bounds.width, bounds.height);
    } catch (error) {
      failGraphics(error);
    }
  };

  const enableEditor = () => {
    if (
      !artwork.complete ||
      !artwork.naturalWidth ||
      disposed ||
      signal.aborted
    )
      return;
    const savedX = requestedX;
    const savedY = requestedY;
    const renderer = createCatRig(canvas, artwork);
    if (!renderer) {
      failGraphics(new Error("WebGL n’est pas disponible sur ce navigateur."));
      return;
    }
    rig = renderer;
    const bounds = stage.getBoundingClientRect();
    rig.resize(bounds.width, bounds.height);
    const initialPose = presetPose ?? CAT_RIG_CONFIG.restPose;
    rig.draw(initialPose.shoulder, initialPose.elbow, initialPose.wrist);
    stage.dataset.ready = "true";
    setControlsEnabled(true);
    setStatus(
      "Rendu actif · glissez la cible ou utilisez les flèches du clavier.",
      "ready",
    );
    setLayerVisibility();
    setOverlayVisibility();
    if (!rig || !inspection) return;
    if (!presetPose) solveAndDraw(savedX, savedY, selectedTipAngle);
  };

  const toCharacterPoint = (clientX: number, clientY: number) => {
    const bounds = overlay.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return null;
    return {
      x: Math.max(
        0,
        Math.min(
          CHARACTER_WIDTH,
          ((clientX - bounds.left) / bounds.width) * CHARACTER_WIDTH,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          CHARACTER_HEIGHT,
          ((clientY - bounds.top) / bounds.height) * CHARACTER_HEIGHT,
        ),
      ),
    };
  };

  const moveTarget = (x: number, y: number) => {
    if (!rig || disposed || signal.aborted) return;
    try {
      solveAndDraw(x, y);
    } catch (error) {
      failGraphics(error);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!rig || event.button !== 0 || signal.aborted) return;
    event.preventDefault();
    dragPointer = event.pointerId;
    targetHandle.focus({ preventScroll: true });
    try {
      targetHandle.setPointerCapture(event.pointerId);
    } catch {
      dragPointer = null;
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== dragPointer) return;
    const point = toCharacterPoint(event.clientX, event.clientY);
    if (point) moveTarget(point.x, point.y);
  };

  const endDrag = (event: PointerEvent) => {
    if (event.pointerId === dragPointer) dragPointer = null;
  };

  const onTargetKeyDown = (event: KeyboardEvent) => {
    if (!rig) return;
    const step = event.shiftKey ? 12 : 3;
    let x = requestedX;
    let y = requestedY;
    switch (event.key) {
      case "ArrowLeft":
        x -= step;
        break;
      case "ArrowRight":
        x += step;
        break;
      case "ArrowUp":
        y -= step;
        break;
      case "ArrowDown":
        y += step;
        break;
      default:
        return;
    }
    event.preventDefault();
    moveTarget(
      Math.max(0, Math.min(CHARACTER_WIDTH, x)),
      Math.max(0, Math.min(CHARACTER_HEIGHT, y)),
    );
  };

  const onPreset = (event: Event) => {
    const button = (event.currentTarget as HTMLButtonElement).dataset.rigPreset;
    if (!button || !rig) return;
    try {
      if (button === "rest" || button === "folded") {
        selectedTipAngle = 0;
        wristSlider.value = "0";
        wristOutput.value = "0°";
        presetPose =
          button === "rest"
            ? CAT_RIG_CONFIG.restPose
            : CAT_RIG_CONFIG.preparationPose;
        rig.draw(presetPose.shoulder, presetPose.elbow, presetPose.wrist);
        inspection = rig.inspect();
        updateInspection(inspection);
        return;
      }
      const target = { ...CAT_RIG_CONFIG.bones.tip, orientation: 0 };
      wristSlider.value = String(target.orientation);
      wristOutput.value = `${formatNumber.format(target.orientation)}°`;
      solveAndDraw(target.x, target.y, target.orientation);
    } catch (error) {
      failGraphics(error);
    }
  };

  const onWristInput = () => {
    if (!rig) return;
    const angle = Number(wristSlider.value);
    wristOutput.value = `${formatNumber.format(angle)}°`;
    try {
      solveAndDraw(requestedX, requestedY, angle);
    } catch (error) {
      failGraphics(error);
    }
  };

  const handleContextLoss = (event: Event) => {
    event.preventDefault();
    disposeRig();
    stage.dataset.ready = "false";
    setControlsEnabled(false);
    setStatus(
      "Contexte graphique perdu · la pose de repos reste visible. Reprise à la restauration du contexte.",
      "error",
    );
  };

  const handleContextRestore = () => {
    if (disposed || signal.aborted) return;
    try {
      enableEditor();
    } catch (error) {
      failGraphics(error);
    }
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    observer = null;
    disposeRig();
    if (dragPointer !== null && targetHandle.hasPointerCapture(dragPointer)) {
      targetHandle.releasePointerCapture(dragPointer);
    }
    dragPointer = null;
  };

  signal.addEventListener("abort", cleanup, { once: true });
  for (const input of requiredLayerInputs) {
    input.addEventListener("change", setLayerVisibility, { signal });
  }
  for (const input of overlayInputs) {
    input.addEventListener("change", setOverlayVisibility, { signal });
  }
  for (const button of controlButtons) {
    button.addEventListener("click", onPreset, { signal });
  }
  wristSlider.addEventListener("input", onWristInput, { signal });
  targetHandle.addEventListener("keydown", onTargetKeyDown, { signal });
  targetHandle.addEventListener("pointerdown", onPointerDown, { signal });
  targetHandle.addEventListener("pointermove", onPointerMove, { signal });
  targetHandle.addEventListener("pointerup", endDrag, { signal });
  targetHandle.addEventListener("pointercancel", endDrag, { signal });
  targetHandle.addEventListener("lostpointercapture", endDrag, { signal });
  // WebGL context events belong to the canvas.
  canvas.addEventListener("webglcontextlost", handleContextLoss, { signal });
  canvas.addEventListener("webglcontextrestored", handleContextRestore, {
    signal,
  });

  for (const group of page.querySelectorAll<SVGGElement>(
    "[data-overlay-layer]",
  )) {
    const matchingInput = overlayInputs.find(
      (input) => input.dataset.overlayToggle === group.dataset.overlayLayer,
    );
    if (matchingInput)
      group.setAttribute("display", matchingInput.checked ? "inline" : "none");
  }
  setControlsEnabled(false);
  setStatus("Chargement des textures et du moteur graphique…", "loading");

  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(renderAtCurrentSize);
    observer.observe(stage);
  } else {
    window.addEventListener("resize", renderAtCurrentSize, { signal });
  }

  artwork.src = CAT_RIG_CONFIG.images.atlas;
  void artwork
    .decode()
    .then(() => {
      if (disposed || signal.aborted) return;
      try {
        enableEditor();
      } catch (error) {
        failGraphics(error);
      }
    })
    .catch((error: unknown) => {
      failGraphics(error);
    });
});
