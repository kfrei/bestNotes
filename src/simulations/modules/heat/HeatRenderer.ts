/**
 * 2.5D Monochrome Sketch Vector Renderer for the Heat & Thermodynamics Simulation.
 * BestNotes / ExplainBoards.
 *
 * Implements:
 * 1. Bunsen Burner (organic swaying & breathing flame inspired by CodePen YLGjvx, circular glow, collar with air slot)
 * 2. Laboratory Tripod (line-art cast legs, wire gauze crosshatch, central ceramic disc)
 * 3. Borosilicate Glass Beaker (plain clean glass with NO measurement lines, 2.5D elliptical rim & bottom depth curve)
 * 4. Wide Basin / Water Bath (Υδατόλουτρο, plain glass with NO measurement lines)
 * 5. Erlenmeyer Flask (narrow neck, conical body, plain glass with NO measurement lines)
 * 6. Precision Laboratory Thermometer (0-100°C column, tick marks, digital badge)
 * 7. Unified BestNotes Selection Frame: 4 corner scale handles, 4 side aspect-ratio handles, floating pill bar with red 🗑️ trash button
 * 8. Gorgeous Liquid Depth Gradients (multi-stop translucent surface to rich depth, 3D meniscus)
 * 9. Temperature - Time Diagram with Greek title "Διάγραμμα Θερμοκρασίας - Χρόνου (θ - t)" and θ(°C) axis
 */

import {
  HeatBurnerState,
  HeatContainerState,
  HeatGraphConfig,
  HeatObject,
  HeatObjectType,
  HeatSimConfig,
  HeatThermometerState,
  LiquidType,
  FlameIntensity,
} from './types';
import {
  findDippedVesselForThermometer,
  findParentVessel,
} from './heatPhysicsEngine';

// Helper: interpolate between two hex colors
function lerpColor(c1: string, c2: string, t: number): string {
  const clampT = Math.max(0, Math.min(1, t));
  const parse = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);
  const r = Math.round(r1 + (r2 - r1) * clampT);
  const g = Math.round(g1 + (g2 - g1) * clampT);
  const b = Math.round(b1 + (b2 - b1) * clampT);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Returns thermometer color for a given temperature (0 - 100 °C)
 * Blue (0°C) -> Green (30°C) -> Orange (60°C) -> Red (90-100°C)
 */
export function getThermometerColor(tempC: number): string {
  const clamped = Math.max(0, Math.min(100, tempC));
  if (clamped <= 30) {
    return lerpColor('#2563eb', '#10b981', clamped / 30); // Blue (0°C) -> Green (30°C)
  } else if (clamped <= 65) {
    return lerpColor('#10b981', '#f97316', (clamped - 30) / 35); // Green (30°C) -> Orange (65°C)
  } else {
    return lerpColor('#f97316', '#ef4444', (clamped - 65) / 35); // Orange (65°C) -> Red (100°C)
  }
}

/**
 * Dynamic Horizontal Time Axis Configuration (starting strictly from t = 0 to tMax)
 * Adapts dynamically:
 * - 0 to 30s: ticks at 10s, 20s, 30s
 * - 30 to 60s: ticks at 15s, 30s, 45s, 60s (1m)
 * - 60 to 120s: ticks at 30s, 1m, 1.5m, 2m
 * - 2 to 4+ min: ticks at 1m, 2m, 3m, 4m...
 */
export interface TimeAxisConfig {
  tMax: number;
  ticks: { t: number; label: string }[];
}

export function getTimeAxisConfig(elapsedT: number): TimeAxisConfig {
  let tMax = 30;
  let tickStep = 10;

  if (elapsedT <= 30) {
    tMax = 30;
    tickStep = 10;
  } else if (elapsedT <= 60) {
    tMax = 60;
    tickStep = 15;
  } else if (elapsedT <= 90) {
    tMax = 90;
    tickStep = 30;
  } else if (elapsedT <= 120) {
    tMax = 120;
    tickStep = 30;
  } else if (elapsedT <= 240) {
    tMax = Math.ceil(elapsedT / 60) * 60;
    tickStep = 60;
  } else {
    const mins = Math.ceil(elapsedT / 60);
    tMax = mins * 60;
    tickStep = mins > 8 ? 120 : 60;
  }

  const ticks: { t: number; label: string }[] = [];
  for (let t = tickStep; t <= tMax; t += tickStep) {
    let label = '';
    if (t < 60) {
      label = `${t}s`;
    } else if (t % 60 === 0) {
      label = `${t / 60}m`;
    } else {
      label = `${(t / 60).toFixed(1)}m`;
    }
    ticks.push({ t, label });
  }

  return { tMax, ticks };
}

/**
 * Dynamic Vertical Temperature Axis Configuration (starting strictly from 0 to tempMax)
 * Adapts dynamically with no upper limit:
 * - 0 to 50°C: max 50°C, ticks at 0°, 10°, 20°, 30°, 40°, 50°
 * - 50 to 100°C: max 100°C, ticks at 0°, 25°, 50°, 75°, 100°
 * - 100 to 150°C: max 150°C, ticks at 0°, 25°, 50°, 75°, 100°, 125°, 150°
 * - 150 to 250°C: max in steps of 50°C, ticks every 50°C
 * - 250+°C: expands continuously without upper limit in steps of 50°C or 100°C
 */
export interface TempAxisConfig {
  tempMax: number;
  ticks: { temp: number; label: string }[];
}

export function getTempAxisConfig(maxRecordedTemp: number): TempAxisConfig {
  let tempMax = 50;
  let tickStep = 10;

  if (maxRecordedTemp <= 50) {
    tempMax = 50;
    tickStep = 10;
  } else if (maxRecordedTemp <= 100) {
    tempMax = 100;
    tickStep = 25;
  } else if (maxRecordedTemp <= 150) {
    tempMax = 150;
    tickStep = 25;
  } else if (maxRecordedTemp <= 250) {
    tempMax = Math.ceil(maxRecordedTemp / 50) * 50;
    tickStep = 50;
  } else {
    tempMax = Math.ceil(maxRecordedTemp / 50) * 50;
    tickStep = tempMax > 400 ? 100 : 50;
  }

  const ticks: { temp: number; label: string }[] = [];
  for (let temp = 0; temp <= tempMax; temp += tickStep) {
    ticks.push({ temp, label: `${temp}°` });
  }

  return { tempMax, ticks };
}

/**
 * Metadata for container curve styling:
 * - Oil: Olive Green (`#65a30d`, `#4d7c0f`)
 * - Milk: Slate Grey (`#64748b`, `#475569`)
 * - Water: Sky Blue (`#0284c7`, `#1d4ed8`)
 * - Letter designation: 'A', 'B', 'C'...
 */
export interface ContainerCurveMeta {
  id: string;
  letter: string;
  color: string;
  outlineColor: string;
  liquidType: string;
  type: string;
  temperature: number;
}

export function getContainersCurveMeta(
  sim: HeatSimConfig,
  isDark: boolean
): Map<string, ContainerCurveMeta> {
  const containers = sim.objects.filter(
    (o) => o.type === 'beaker' || o.type === 'wide-basin' || o.type === 'flask'
  );

  // Compute nesting depth for each container (0 = outer/root, 1 = inside outer, 2 = inside inner...)
  const getNestingDepth = (c: HeatObject): number => {
    let depth = 0;
    let curr: HeatObject | undefined = c;
    const visited = new Set<string>();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      const parent = findParentVessel(curr, sim.objects);
      if (parent) {
        depth++;
        curr = parent;
      } else {
        break;
      }
    }
    return depth;
  };

  // Nested containers sorted by nesting depth ascending (1st nested = Β, 2nd nested = Γ, 3rd = Δ)
  const nestedContainers = containers
    .filter((c) => getNestingDepth(c) > 0)
    .sort((a, b) => {
      const da = getNestingDepth(a);
      const db = getNestingDepth(b);
      if (da !== db) return da - db;
      return b.width - a.width;
    });

  // Containers that currently contain liquid (volumeMl > 0), sorted so outer (Α) is first, then nested (Β, Γ...)
  const filledContainers = containers
    .filter((c) => (c.containerState?.volumeMl || 0) > 0)
    .sort((a, b) => {
      const da = getNestingDepth(a);
      const db = getNestingDepth(b);
      if (da !== db) return da - db;
      return b.width - a.width;
    });

  // Distinct high-contrast outline & curve colors for nested containers:
  // 1st nested (Β): Purple (#7c3aed), 2nd nested (Γ): Green (#16a34a), 3rd nested (Δ): Red (#dc2626)
  const nestedPalette = isDark
    ? ['#a78bfa', '#4ade80', '#f87171', '#fbbf24']
    : ['#7c3aed', '#16a34a', '#dc2626', '#d97706'];

  const defaultOuterOutline = isDark ? '#f8fafc' : '#111827';
  const defaultOuterCurve = isDark ? '#e2e8f0' : '#1e293b';

  // Greek capital letters: Α, Β, Γ, Δ, Ε
  const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];
  const metaMap = new Map<string, ContainerCurveMeta>();

  // Only assign letters and badges if there are 2 or more containers with liquid!
  const hasMultipleFilled = filledContainers.length >= 2;
  const hasAnyNested = nestedContainers.length > 0;

  let nonNestedFilledIdx = 0;

  containers.forEach((c) => {
    const isFilled = (c.containerState?.volumeMl || 0) > 0;
    const liquidType = c.containerState?.liquidType || 'water';
    const nestedIdx = nestedContainers.findIndex((nc) => nc.id === c.id);

    let outlineColor = c.strokeColor || defaultOuterOutline;
    let color = c.strokeColor || defaultOuterCurve;

    if (nestedIdx >= 0) {
      // Immediately assign distinct outline & curve color when a container is placed inside another!
      const nestedCol = c.strokeColor || nestedPalette[nestedIdx % nestedPalette.length];
      outlineColor = nestedCol;
      color = nestedCol;
    } else if (hasAnyNested || hasMultipleFilled) {
      // Outer / root container (Α): keeps its black/dark outline and uses matching dark charcoal on the graph
      if (!hasAnyNested && isFilled && nonNestedFilledIdx > 0) {
        const distinctCol =
          c.strokeColor || nestedPalette[(nonNestedFilledIdx - 1) % nestedPalette.length];
        outlineColor = distinctCol;
        color = distinctCol;
      } else {
        outlineColor = c.strokeColor || defaultOuterOutline;
        color = c.strokeColor || defaultOuterCurve;
      }
      if (isFilled) nonNestedFilledIdx++;
    } else {
      // Single standalone container with no nesting
      outlineColor = c.strokeColor || defaultOuterOutline;
      if (c.strokeColor) {
        color = c.strokeColor;
      } else if (liquidType === 'oil') {
        color = '#65a30d';
      } else if (liquidType === 'milk') {
        color = isDark ? '#cbd5e1' : '#64748b';
      } else {
        color = '#0284c7';
      }
    }

    let letter = '';
    if (hasMultipleFilled && isFilled) {
      const idx = filledContainers.findIndex((fc) => fc.id === c.id);
      if (idx >= 0) {
        letter = letters[idx % letters.length];
      }
    }

    metaMap.set(c.id, {
      id: c.id,
      letter,
      color,
      outlineColor,
      liquidType,
      type: c.type,
      temperature: c.containerState?.temperature ?? 20,
    });
  });

  return metaMap;
}

/**
 * Offscreen Bitmap Cache for Blurred Submerged Containers, Thermometers & Badges.
 * Why: Executing `ctx.filter = 'blur(...px)'` directly on the full-page Retina canvas (1600x2200px)
 * 14 times per frame at 60fps causes severe GPU/CPU frame drops when scrolling.
 * By rendering each blurred apparatus element onto a tiny tightly-sized offscreen canvas (e.g. 160x220px)
 * and reusing the cached bitmap whenever its state hasn't changed, Gaussian blur passes drop from 840/sec to ~0/sec!
 */
interface OffscreenBlurCacheEntry {
  canvas: HTMLCanvasElement;
  key: string;
}

const offscreenBlurCache = new Map<string, OffscreenBlurCacheEntry>();

function renderWithOffscreenBlurCache(
  ctx: CanvasRenderingContext2D,
  cacheId: string,
  cacheKey: string,
  w: number,
  h: number,
  padX: number,
  padY: number,
  drawFn: (offCtx: CanvasRenderingContext2D) => void
): void {
  if (typeof document === 'undefined') {
    drawFn(ctx);
    return;
  }
  const dpr = 2;
  const logicalW = Math.max(1, Math.ceil(w + padX * 2));
  const logicalH = Math.max(1, Math.ceil(h + padY * 2));
  const physW = logicalW * dpr;
  const physH = logicalH * dpr;

  let entry = offscreenBlurCache.get(cacheId);
  if (
    !entry ||
    entry.key !== cacheKey ||
    entry.canvas.width !== physW ||
    entry.canvas.height !== physH
  ) {
    const canvas = entry?.canvas || document.createElement('canvas');
    if (canvas.width !== physW) canvas.width = physW;
    if (canvas.height !== physH) canvas.height = physH;
    const offCtx = canvas.getContext('2d');
    if (!offCtx) {
      drawFn(ctx);
      return;
    }
    offCtx.save();
    offCtx.clearRect(0, 0, physW, physH);
    offCtx.scale(dpr, dpr);
    offCtx.translate(padX, padY);
    drawFn(offCtx);
    offCtx.restore();

    entry = { canvas, key: cacheKey };
    if (offscreenBlurCache.size > 64 && !offscreenBlurCache.has(cacheId)) {
      const oldestKey = offscreenBlurCache.keys().next().value;
      if (oldestKey) offscreenBlurCache.delete(oldestKey);
    }
    offscreenBlurCache.set(cacheId, entry);
  }

  ctx.drawImage(entry.canvas, -padX, -padY, logicalW, logicalH);
}

/**
 * Renders a letter badge (A, B...) inside the container at the bottom-left of its base.
 * When the container is nested inside an outer container, the badge is softly blurred and
 * slightly translucent so it visually reads as being inside the outer vessel.
 */
function renderContainerLetterBadge(
  ctx: CanvasRenderingContext2D,
  letter: string,
  color: string,
  badgeX: number,
  badgeY: number,
  isDark: boolean,
  isNestedInOuterVessel: boolean = false,
  isSubmergedInOuterLiquid: boolean = false,
  outerLiquidType?: LiquidType,
  isDoubleNested: boolean = false
): void {
  const drawBadge = (targetCtx: CanvasRenderingContext2D, cx: number, cy: number) => {
    targetCtx.save();
    if (isNestedInOuterVessel) {
      if (isDoubleNested) {
        if (isSubmergedInOuterLiquid) {
          if (outerLiquidType === 'milk') {
            targetCtx.globalAlpha = 0.22;
            targetCtx.filter = 'blur(2.6px)';
          } else if (outerLiquidType === 'oil') {
            targetCtx.globalAlpha = 0.30;
            targetCtx.filter = 'blur(2.2px)';
          } else {
            targetCtx.globalAlpha = 0.40;
            targetCtx.filter = 'blur(1.9px)';
          }
        } else {
          targetCtx.globalAlpha = 0.50;
          targetCtx.filter = 'blur(1.4px)';
        }
      } else if (isSubmergedInOuterLiquid) {
        if (outerLiquidType === 'milk') {
          targetCtx.globalAlpha = 0.36;
          targetCtx.filter = 'blur(1.7px)';
        } else if (outerLiquidType === 'oil') {
          targetCtx.globalAlpha = 0.50;
          targetCtx.filter = 'blur(1.35px)';
        } else {
          targetCtx.globalAlpha = 0.62;
          targetCtx.filter = 'blur(1.1px)';
        }
      } else {
        targetCtx.globalAlpha = 0.72;
        targetCtx.filter = 'blur(0.85px)';
      }
    }
    const r = 7.5;
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, r, 0, Math.PI * 2);
    targetCtx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.76)' : 'rgba(255, 255, 255, 0.88)';
    targetCtx.fill();
    targetCtx.strokeStyle = color;
    targetCtx.lineWidth = 1.35;
    targetCtx.stroke();

    targetCtx.fillStyle = color;
    targetCtx.font = 'bold 9.5px system-ui, sans-serif';
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';
    targetCtx.fillText(letter, cx, cy + 0.5);
    targetCtx.restore();
  };

  if (!isNestedInOuterVessel) {
    drawBadge(ctx, badgeX, badgeY);
    return;
  }

  ctx.save();
  ctx.translate(badgeX - 10, badgeY - 10);
  const badgeCacheId = `badge-${letter}`;
  const badgeCacheKey = `${letter}|${color}|${isDark ? 1 : 0}|${isDoubleNested ? 1 : 0}|${isSubmergedInOuterLiquid ? 1 : 0}|${outerLiquidType || ''}`;
  renderWithOffscreenBlurCache(ctx, badgeCacheId, badgeCacheKey, 20, 20, 8, 8, (offCtx) => {
    drawBadge(offCtx, 10, 10);
  });
  ctx.restore();
}

/**
 * Renders the container front rim / collar in front of any dipped thermometers,
 * so the vessel's rim line (χείλος) is always in front of the thermometer stem.
 */
function renderContainerFrontRim(
  ctx: CanvasRenderingContext2D,
  obj: HeatObject,
  isDark: boolean,
  crossingThermometers: HeatObject[],
  hasCrossingNestedVessel: boolean = false,
  customOutlineColor?: string
): void {
  if (crossingThermometers.length === 0 && !hasCrossingNestedVessel) return;
  const strokeColor = customOutlineColor || obj.strokeColor || (isDark ? '#f8fafc' : '#111827');
  const pad = 8;
  const bw = obj.width - pad * 2;
  const x = pad;
  const y = pad + 4;
  const beadH = 3.5;

  ctx.save();
  ctx.translate(obj.x, obj.y);

  // 1. Over any thermometer stems crossing this container's rim, fill the 3.5px glass bead
  //    so the thermometer stem & colored column are masked behind the rim
  if (crossingThermometers.length > 0) {
    ctx.save();
    ctx.beginPath();
    for (const t of crossingThermometers) {
      const localTx = t.x - obj.x;
      ctx.rect(localTx - 4, y - 4, t.width + 8, beadH + 10);
    }
    ctx.clip();

    if (obj.type === 'beaker' || obj.type === 'wide-basin') {
      const spoutW = obj.type === 'beaker' ? 12 : 10;
      ctx.beginPath();
      ctx.moveTo(x - spoutW, y + 1.5);
      ctx.lineTo(x, y);
      ctx.lineTo(x + bw, y);
      ctx.arc(x + bw, y + beadH / 2, beadH / 2, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x, y + beadH);
      ctx.lineTo(x - spoutW, y + 1.5);
      ctx.closePath();
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)';
      ctx.fill();
    } else if (obj.type === 'flask') {
      const cx = x + bw / 2;
      const neckW = bw * 0.30;
      const collarH = 4.5;
      const collarExt = 3.5;
      const collarLeft = cx - neckW / 2 - collarExt;
      const collarRight = cx + neckW / 2 + collarExt;
      ctx.beginPath();
      ctx.roundRect(collarLeft, y, collarRight - collarLeft, collarH, collarH / 2);
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)';
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Draw the crisp front rim contour & lip bead line across the container mouth
  //    so the outer container's rim is ALWAYS in front of both dipped thermometers and nested inner containers!
  if (!hasCrossingNestedVessel && crossingThermometers.length > 0) {
    ctx.beginPath();
    for (const t of crossingThermometers) {
      const localTx = t.x - obj.x;
      ctx.rect(localTx - 4, y - 4, t.width + 8, beadH + 10);
    }
    ctx.clip();
  }

  if (obj.type === 'beaker' || obj.type === 'wide-basin') {
    const spoutW = obj.type === 'beaker' ? 12 : 10;

    // Top horizontal rim stroke (in front of inner containers and thermometers)
    ctx.beginPath();
    ctx.moveTo(x - spoutW, y + 1.5);
    ctx.lineTo(x, y);
    ctx.lineTo(x + bw, y);
    ctx.arc(x + bw, y + beadH / 2, beadH / 2, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Rolled glass lip bead line right beneath top rim
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y + beadH);
    ctx.lineTo(x + bw, y + beadH);
    ctx.strokeStyle = strokeColor;
    ctx.globalAlpha *= 0.42;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();
  } else if (obj.type === 'flask') {
    const cx = x + bw / 2;
    const neckW = bw * 0.30;
    const collarH = 4.5;
    const collarExt = 3.5;
    const collarLeft = cx - neckW / 2 - collarExt;
    const collarRight = cx + neckW / 2 + collarExt;

    ctx.beginPath();
    ctx.roundRect(collarLeft, y, collarRight - collarLeft, collarH, collarH / 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  ctx.restore();
}

export interface RenderHeatSimulationOptions {
  isDark?: boolean;
  scale?: number;
  hoveredObjectId?: string | null;
  hoverPoint?: { x: number; y: number } | null;
  layer?: 'all' | 'apparatus' | 'ui';
  isSelectActive?: boolean;
}

/**
 * Draws the Heat Simulation on a 2D canvas.
 */
export function renderHeatSimulation(
  ctx: CanvasRenderingContext2D,
  sim: HeatSimConfig,
  options?: RenderHeatSimulationOptions
): void {
  const isDark = Boolean(options?.isDark);
  const layer = options?.layer || 'all';
  const isSelectActive = options?.isSelectActive !== false;

  ctx.save();

  const selectedIds = isSelectActive
    ? sim.selectedObjectIds && sim.selectedObjectIds.length > 0
      ? sim.selectedObjectIds
      : sim.selectedObjectId
      ? [sim.selectedObjectId]
      : []
    : [];

  const isMultiSelect = selectedIds.length > 1;
  const metaMap = getContainersCurveMeta(sim, isDark);

  // Helper to render an apparatus object
  const renderSingleObject = (obj: HeatObject, tripodPart?: 'back' | 'front') => {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    const isSelected = selectedIds.includes(obj.id);

    // Subtle individual highlight outline when part of a multi-selection
    if (isMultiSelect && isSelected && (layer === 'all' || layer === 'ui') && tripodPart !== 'back') {
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(37, 99, 235, 0.40)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(-4, -4, obj.width + 8, obj.height + 8);
      ctx.restore();
    }

    switch (obj.type) {
      case 'tripod': {
        const hasContainerOnTop = sim.objects.some((c) => {
          if (c.type !== 'beaker' && c.type !== 'flask' && c.type !== 'wide-basin') return false;
          const { dockX, dockY } = getTripodContainerDockPos(obj, c);
          return Math.abs(c.x - dockX) <= 14 && Math.abs(c.y - dockY) <= 6;
        });
        renderTripod(
          ctx,
          obj.width,
          obj.height,
          obj.tripodState?.wireGauzeTemp || 20,
          isDark,
          isSelected,
          layer,
          obj.strokeColor,
          tripodPart || 'all',
          hasContainerOnTop
        );
        break;
      }
      case 'burner': {
        // Compute ceiling Y if a container or tripod gauze is above this burner so the flame never enters inside the vessel
        let ceilingWorldY: number | undefined;
        const bCx = obj.x + obj.width / 2;
        for (const o of sim.objects) {
          if (o.type === 'beaker' || o.type === 'flask' || o.type === 'wide-basin') {
            const dx = Math.abs(o.x + o.width / 2 - bCx);
            const cBot = o.y + o.height - 2;
            if (dx <= 45 && cBot < obj.y + obj.height && cBot > obj.y - 80) {
              if (ceilingWorldY === undefined || cBot < ceilingWorldY) {
                ceilingWorldY = cBot;
              }
            }
          } else if (o.type === 'tripod') {
            const dx = Math.abs(o.x + o.width / 2 - bCx);
            if (dx <= 45 && o.y < obj.y + obj.height) {
              const collarW = o.width * 0.72;
              const collarH = Math.round(collarW * 0.15);
              const gauzeUndersideY = o.y + 4 + collarH;
              // If a container sits on this tripod, clamp flame at the underside of the gauze/container
              const hasVesselOnTripod = sim.objects.some((c) => {
                if (c.type !== 'beaker' && c.type !== 'flask' && c.type !== 'wide-basin') return false;
                const { dockX, dockY } = getTripodContainerDockPos(o, c);
                return Math.abs(c.x - dockX) <= 14 && Math.abs(c.y - dockY) <= 6;
              });
              if (hasVesselOnTripod) {
                if (ceilingWorldY === undefined || gauzeUndersideY < ceilingWorldY) {
                  ceilingWorldY = gauzeUndersideY;
                }
              }
            }
          }
        }
        const ceilingLocalY = ceilingWorldY !== undefined ? ceilingWorldY - obj.y : undefined;
        renderBurner(
          ctx,
          obj.width,
          obj.height,
          obj.burnerState,
          isDark,
          isSelected,
          layer,
          obj.strokeColor,
          obj.x,
          obj.y,
          options?.hoverPoint,
          ceilingLocalY
        );
        break;
      }
      case 'beaker': {
        const parentBasin = findParentVessel(obj, sim.objects);
        const isGraphActive = (sim.graphs || [sim.graph]).some(
          (g) => g.visible && g.boundContainerIds?.includes(obj.id)
        );
        const curveMeta = metaMap.get(obj.id);
        renderBeaker(
          ctx,
          obj.width,
          obj.height,
          obj.containerState,
          isDark,
          isSelected,
          layer,
          curveMeta?.outlineColor || obj.strokeColor,
          obj.id,
          obj.x,
          obj.y,
          parentBasin,
          isGraphActive,
          curveMeta?.letter,
          curveMeta?.color,
          sim.objects
        );
        break;
      }
      case 'wide-basin': {
        const isGraphActive = (sim.graphs || [sim.graph]).some(
          (g) => g.visible && g.boundContainerIds?.includes(obj.id)
        );
        const curveMeta = metaMap.get(obj.id);
        renderWideBasin(
          ctx,
          obj.width,
          obj.height,
          obj.containerState,
          isDark,
          isSelected,
          layer,
          curveMeta?.outlineColor || obj.strokeColor,
          obj.id,
          obj.x,
          obj.y,
          isGraphActive,
          curveMeta?.letter,
          curveMeta?.color
        );
        break;
      }
      case 'flask': {
        const parentBasin = findParentVessel(obj, sim.objects);
        const isGraphActive = (sim.graphs || [sim.graph]).some(
          (g) => g.visible && g.boundContainerIds?.includes(obj.id)
        );
        const curveMeta = metaMap.get(obj.id);
        renderFlask(
          ctx,
          obj.width,
          obj.height,
          obj.containerState,
          isDark,
          isSelected,
          layer,
          curveMeta?.outlineColor || obj.strokeColor,
          obj.id,
          obj.x,
          obj.y,
          parentBasin,
          isGraphActive,
          curveMeta?.letter,
          curveMeta?.color,
          sim.objects
        );
        break;
      }
      case 'thermometer': {
        const dipped = findDippedVesselForThermometer(obj, sim.objects, false);
        const outerDipped = dipped ? findParentVessel(dipped, sim.objects) : undefined;
        const outerMostDipped = outerDipped ? findParentVessel(outerDipped, sim.objects) : undefined;
        const dippedMeta = dipped ? metaMap.get(dipped.id) : undefined;
        renderThermometer(
          ctx,
          obj.width,
          obj.height,
          obj.thermometerState,
          isDark,
          isSelected,
          layer,
          obj.strokeColor || dippedMeta?.outlineColor,
          dipped,
          obj.x,
          obj.y,
          outerDipped,
          outerMostDipped
        );
        break;
      }
    }

    // Render Unified BestNotes Selection Frame if single object selected (only on front pass for tripod)
    if (!isMultiSelect && isSelected && (layer === 'all' || layer === 'ui') && tripodPart !== 'back') {
      renderObjectSelectionFrame(
        ctx,
        obj.width,
        obj.height,
        obj.type,
        obj.containerState?.volumeMl,
        obj.burnerState?.isOn,
        isDark
      );
    }

    ctx.restore();
  };

  // ---------------------------------------------------------------------------
  // 2.5D Layer Sandwich Rendering Pipeline:
  // 1. Tripod Back Half (Back Leg, Back Half of Gauze Mesh & Disc, Back Collar Arc)
  // 2. Burner (Apparatus body + Animated Flame) -> Flame is rendered IN FRONT of the back half of the mesh!
  // 3. Tripod Front Half (Front Half of Gauze Mesh & Disc, Front Collar Arc, Front Legs) -> Front half is IN FRONT of the flame!
  // 4. Wide Basin (Water bath)
  // 5. Beakers & Flasks (Glassware sitting on top of tripod/bath)
  // 6. Thermometers (Laboratory thermometers in immersion)
  // ---------------------------------------------------------------------------

  // 1. Tripod Back Half
  for (const obj of sim.objects) {
    if (obj.type === 'tripod') renderSingleObject(obj, 'back');
  }

  // 2. Burner (Body & Flame)
  for (const obj of sim.objects) {
    if (obj.type === 'burner') renderSingleObject(obj);
  }

  // 3. Tripod Front Half
  for (const obj of sim.objects) {
    if (obj.type === 'tripod') renderSingleObject(obj, 'front');
  }

  // 4. Wide Basin (Water bath)
  for (const obj of sim.objects) {
    if (obj.type === 'wide-basin') renderSingleObject(obj);
  }

  // 5. Beakers & Flasks (Sorted by width descending so larger outer vessels render before nested inner vessels)
  const glassware = sim.objects.filter((obj) => obj.type === 'beaker' || obj.type === 'flask');
  glassware.sort((a, b) => b.width - a.width);
  for (const obj of glassware) {
    renderSingleObject(obj);
  }

  // 6. Thermometers
  for (const obj of sim.objects) {
    if (obj.type === 'thermometer') renderSingleObject(obj);
  }

  // 7. Glassware Front Rim (renders cleanly in front of dipped thermometers AND nested inner containers!)
  if (layer === 'all' || layer === 'apparatus') {
    const containers = sim.objects.filter(
      (obj) => obj.type === 'beaker' || obj.type === 'flask' || obj.type === 'wide-basin'
    );
    const thermometers = sim.objects.filter((obj) => obj.type === 'thermometer');
    for (const c of containers) {
      const cRimY = c.y + 12;
      const crossingThermometers = thermometers.filter((t) => {
        const dippedVessel = findDippedVesselForThermometer(t, sim.objects, false);
        if (dippedVessel && dippedVessel.id !== c.id) return false;
        const tx = t.x + t.width / 2;
        const cLeft = c.x + 8;
        const cRight = c.x + c.width - 8;
        const isHorizInside = tx >= cLeft && tx <= cRight;
        const isVertCrossing = t.y < cRimY && t.y + t.height > cRimY;
        return isHorizInside && isVertCrossing;
      });

      const hasCrossingNestedVessel = containers.some((inner) => {
        if (inner.id === c.id) return false;
        const parent = findParentVessel(inner, sim.objects);
        if (!parent || parent.id !== c.id) return false;
        return inner.y < cRimY && inner.y + inner.height > cRimY;
      });

      if (crossingThermometers.length > 0 || hasCrossingNestedVessel) {
        renderContainerFrontRim(
          ctx,
          c,
          isDark,
          crossingThermometers,
          hasCrossingNestedVessel,
          metaMap.get(c.id)?.outlineColor
        );
      }
    }
  }

  // Render Unified Group Selection Frame when multiple objects are selected together
  if (isMultiSelect && (layer === 'all' || layer === 'ui')) {
    const selectedObjects = sim.objects.filter((o) => selectedIds.includes(o.id));
    renderGroupSelectionFrame(ctx, selectedObjects, isDark);
  }

  // Render Dynamic T-t Graph if enabled (only in 'ui' or 'all' layer)
  if (layer === 'all' || layer === 'ui') {
    const graphsToRender =
      sim.graphs && sim.graphs.length > 0
        ? sim.graphs.filter((g) => g.visible)
        : sim.graph.visible
        ? [sim.graph]
        : [];
    for (const g of graphsToRender) {
      renderThermalGraph(ctx, sim, isDark, g, options?.hoverPoint, metaMap);
    }
  }

  ctx.restore();
}

/**
 * Unified BestNotes Selection Bounding Box & Action Pill Bar
 * Provides:
 * - 4 Corner Handles (●) for proportional scaling
 * - 4 Side Midpoint Handles (●) for aspect-ratio stretch (αναλογία)
 * - Floating Action Bar with Red Trash Can Button (🗑️) + Quick Action Pills
 */
export function renderObjectSelectionFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  type: HeatObjectType,
  volumeMl?: number,
  burnerOn?: boolean,
  isDark?: boolean
): void {
  const pad = 8;
  const minX = -pad;
  const minY = -pad;
  const maxX = w + pad;
  const maxY = h + pad;
  const cx = w / 2;
  const boxW = maxX - minX;
  const boxH = maxY - minY;

  ctx.save();

  // 1. Dashed Selection Border (BestNotes style)
  ctx.strokeStyle = isDark ? '#38bdf8' : '#2563eb';
  ctx.lineWidth = 1.45;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(minX, minY, boxW, boxH);
  ctx.setLineDash([]);

  // 2. 4 Corner Proportional Resize Handles (smooth slate dots with white ring)
  const cornerR = 5.0;
  const corners = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
  for (const c of corners) {
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(c.x, c.y, cornerR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. 4 Side Midpoint Stretch Handles (Orange #f97316 dots for aspect-ratio stretch)
  const sideR = 5.2;
  const sideMidpoints = [
    { x: cx, y: minY }, // Top (height stretch)
    { x: maxX, y: h / 2 }, // Right (width stretch)
    { x: cx, y: maxY }, // Bottom (height stretch)
    { x: minX, y: h / 2 }, // Left (width stretch)
  ];
  for (const m of sideMidpoints) {
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(m.x, m.y, sideR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Unified BestNotes Group Selection Frame for multiple selected objects.
 * Enables selecting, moving, and proportional scaling of entire apparatus assemblies
 * (e.g., Beaker + Tripod + Burner together).
 */
export function renderGroupSelectionFrame(
  ctx: CanvasRenderingContext2D,
  selectedObjects: HeatObject[],
  isDark?: boolean
): void {
  if (selectedObjects.length <= 1) return;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const obj of selectedObjects) {
    minX = Math.min(minX, obj.x);
    minY = Math.min(minY, obj.y);
    maxX = Math.max(maxX, obj.x + obj.width);
    maxY = Math.max(maxY, obj.y + obj.height);
  }

  const pad = 10;
  const boxX = minX - pad;
  const boxY = minY - pad;
  const boxW = maxX - minX + pad * 2;
  const boxH = maxY - minY + pad * 2;
  const cx = boxX + boxW / 2;

  ctx.save();

  // 1. Group Selection Outer Dashed Frame
  ctx.strokeStyle = isDark ? '#38bdf8' : '#2563eb';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([7, 4]);
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  ctx.setLineDash([]);

  // 2. 4 Corner Proportional Scaling Handles (Slate dots with crisp white border)
  const cornerR = 5.8;
  const corners = [
    { x: boxX, y: boxY },
    { x: boxX + boxW, y: boxY },
    { x: boxX + boxW, y: boxY + boxH },
    { x: boxX, y: boxY + boxH },
  ];
  for (const c of corners) {
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(c.x, c.y, cornerR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. 4 Side Midpoint Stretch Handles (Orange dots with crisp white border)
  const sideR = 5.5;
  const sides = [
    { x: cx, y: boxY },
    { x: boxX + boxW, y: boxY + boxH / 2 },
    { x: cx, y: boxY + boxH },
    { x: boxX, y: boxY + boxH / 2 },
  ];
  for (const s of sides) {
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(s.x, s.y, sideR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 4. Floating Group Action Pill Bar
  const pillY = boxY < 48 ? boxY + boxH + 24 : boxY - 24;

  // Counter Badge Pill [ ✨ N Αντικείμενα ]
  const badgeW = 96;
  const badgeH = 22;
  const badgeX = cx;
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.20)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 1.5;
  ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
  ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(badgeX - badgeW / 2, pillY - badgeH / 2, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
  ctx.fillText(`✨ ${selectedObjects.length} Αντικείμενα`, badgeX, pillY);
  ctx.restore();

  ctx.restore();
}

/**
 * Dynamic Fluid Physics & Thermal Convection Simulation
 * - Real-time Inertial Sloshing: Damped harmonic oscillator tracking container velocity/acceleration on drag
 * - Thermal Convection Waves: Multi-harmonic sine/bezier wave profiles emerging with rising temperature
 */
interface ContainerSloshPhysics {
  lastX: number;
  lastY: number;
  lastFrameTime: number; // rendering loop frame time
  filteredVx: number; // smoothed velocity (px/s)
  externalVx: number; // injected velocity from mouse/drag
  targetAngle: number; // target tilt angle
  sloshAngle: number; // current surface tilt angle (radians)
  sloshAngularVel: number; // angular velocity (rad/s)
}

const containerSloshMap = new Map<string, ContainerSloshPhysics>();

export function resetHeatSloshPhysics(containerId?: string): void {
  if (containerId) {
    containerSloshMap.delete(containerId);
  } else {
    containerSloshMap.clear();
  }
}

/**
 * Notifies the slosh physics engine of direct pointer motion velocity during dragging.
 */
export function notifyContainerSloshMotion(
  containerId: string,
  vx: number,
  _ax: number = 0
): void {
  const nowMs = performance.now();
  let state = containerSloshMap.get(containerId);
  if (!state) {
    state = {
      lastX: 0,
      lastY: 0,
      lastFrameTime: nowMs,
      filteredVx: vx,
      externalVx: vx,
      targetAngle: 0,
      sloshAngle: 0,
      sloshAngularVel: 0,
    };
    containerSloshMap.set(containerId, state);
  }

  // Update external velocity with raw pointer drag speed
  state.externalVx = vx;

  // Impart an instantaneous angular torque impulse proportional to shaking speed
  // A fast shake of 1500 px/s injects an immediate noticeable angular surge!
  const impulse = vx * 0.0035;
  state.sloshAngularVel += impulse * 0.35;
  state.sloshAngularVel = Math.max(-12, Math.min(12, state.sloshAngularVel));
}

function updateAndGetSloshAngle(
  containerId: string | undefined,
  curX: number,
  curY: number,
  nowMs: number
): number {
  if (!containerId) return 0;

  let state = containerSloshMap.get(containerId);
  if (!state) {
    state = {
      lastX: curX,
      lastY: curY,
      lastFrameTime: nowMs,
      filteredVx: 0,
      externalVx: 0,
      targetAngle: 0,
      sloshAngle: 0,
      sloshAngularVel: 0,
    };
    containerSloshMap.set(containerId, state);
    return 0;
  }

  const dtMs = nowMs - state.lastFrameTime;
  if (dtMs < 4) {
    return state.sloshAngle;
  }

  if (dtMs > 300) {
    state.lastX = curX;
    state.lastY = curY;
    state.lastFrameTime = nowMs;
    state.filteredVx = 0;
    state.externalVx = 0;
    return state.sloshAngle;
  }

  const dt = Math.max(0.005, Math.min(0.05, dtMs / 1000));
  state.lastFrameTime = nowMs;

  const dx = curX - state.lastX;
  state.lastX = curX;
  state.lastY = curY;

  // Instantaneous velocity from object movement
  const posVx = dt > 0 ? dx / dt : 0;
  // Blend with external drag velocity
  const rawVx = Math.abs(state.externalVx) > Math.abs(posVx) ? state.externalVx : posVx;

  // Responsive smoothing (~40ms)
  const alphaV = Math.min(1.0, 24.0 * dt);
  state.filteredVx += (rawVx - state.filteredVx) * alphaV;

  // Fluid reorients along apparent gravity vector (lagging behind container motion)
  // Target tilt is directly proportional to how fast the user moves the container left/right!
  const targetAngle = Math.max(
    -0.55,
    Math.min(0.55, state.filteredVx * 0.00095)
  );

  // Damped harmonic oscillator for natural, bouncy liquid sloshing
  // Natural frequency fn ≈ 1.15 Hz => omega_n ≈ 7.2 rad/s
  // Light damping ratio zeta ≈ 0.13 (underdamped: energetic, lively sloshing that oscillates naturally)
  const omegaN = 7.2;
  const zeta = 0.13;

  const springTorque = -omegaN * omegaN * (state.sloshAngle - targetAngle);
  const dampingTorque = -2 * zeta * omegaN * state.sloshAngularVel;
  const angularAcc = springTorque + dampingTorque;

  state.sloshAngularVel += angularAcc * dt;
  state.sloshAngularVel = Math.max(-12, Math.min(12, state.sloshAngularVel));
  state.sloshAngle += state.sloshAngularVel * dt;
  state.sloshAngle = Math.max(-0.55, Math.min(0.55, state.sloshAngle));

  // Decay external drag velocity
  state.externalVx *= Math.max(0, 1 - 7.5 * dt);

  // Settle to true zero if movement has stopped and oscillations are imperceptible
  if (
    Math.abs(state.sloshAngle) < 0.001 &&
    Math.abs(state.sloshAngularVel) < 0.003 &&
    Math.abs(state.filteredVx) < 0.8
  ) {
    state.sloshAngle = 0;
    state.sloshAngularVel = 0;
  }

  return state.sloshAngle;
}

/**
 * Calculates dynamic fluid surface profile combining:
 * 1. Inertial sloshing tilt & fluid crest curvature when moved horizontally
 * 2. Multi-staged thermal convection & boiling rolling waves
 */
export function getLiquidSurfaceProfile(
  containerId: string | undefined,
  curX: number,
  curY: number,
  leftX: number,
  surfaceW: number,
  liquidTopY: number,
  liquidH: number,
  temperature: number,
  isBoiling: boolean,
  boilingIntensity: number,
  nowMs: number
): { x: number; y: number }[] {
  const sloshAngle = updateAndGetSloshAngle(containerId, curX, curY, nowMs);
  const sinAngle = Math.sin(sloshAngle);

  // Maximum vertical tilt displacement: up to 36px (very noticeable and exciting wave crests!)
  const maxTilt = Math.min(36, Math.max(12, liquidH * 0.55));

  // Multi-staged Thermal Convection & Boiling Waves (kept natural and gentle across temperatures):
  // Stage 1 (T <= 35°C & not sloshing): Calm resting fluid (0px wave so resting containers don't burn CPU/GPU)
  // Stage 2 (35°C - 60°C): Warm convection rolling (~0.45px - 1.35px)
  // Stage 3 (60°C - 85°C): Active simmering (~1.35px - 3.1px)
  // Stage 4 (85°C - 98°C): Pre-boil ripples (~3.1px - 4.8px)
  // Stage 5 (98°C - 100°C+): Full rolling boil (~5.0px - 7.0px)
  const isActuallyBoiling = isBoiling || temperature >= 98;
  if (temperature <= 35 && !isActuallyBoiling && Math.abs(sinAngle) < 0.001) {
    return [
      { x: leftX, y: liquidTopY },
      { x: leftX + surfaceW, y: liquidTopY },
    ];
  }

  let baseAmp = 0.25;
  if (temperature > 35 && temperature <= 60) {
    baseAmp = 0.45 + ((temperature - 35) / 25) * 0.9;
  } else if (temperature > 60 && temperature <= 85) {
    baseAmp = 1.35 + ((temperature - 60) / 25) * 1.75;
  } else if (temperature > 85 && temperature <= 98) {
    baseAmp = 3.1 + ((temperature - 85) / 13) * 1.7;
  } else if (temperature > 98) {
    baseAmp = 4.8 + Math.min(2.2, ((temperature - 98) / 4) * 2.2);
  }

  if (isActuallyBoiling) {
    baseAmp = Math.max(baseAmp, 5.0 + Math.max(0.3, boilingIntensity) * 2.0);
  }

  // Wave speed accelerates gently as heat builds up
  const speedMultiplier =
    temperature < 35
      ? 0.85
      : temperature < 65
      ? 1.25
      : temperature < 85
      ? 1.75
      : isActuallyBoiling
      ? 2.65
      : 2.15;

  const tSec = nowMs / 1000;
  const phase1 = tSec * speedMultiplier;
  const phase2 = -tSec * (speedMultiplier * 1.45) + 1.2;
  const phase3 = tSec * (speedMultiplier * 0.72) + 2.5;
  const phaseChurn = tSec * (speedMultiplier * 2.1) + 4.1;

  const spatialK = (Math.PI * 2) / Math.max(35, surfaceW * 0.75);

  const numSamples = 28;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const u = i / numSamples; // 0.0 at left wall, 1.0 at right wall
    const px = leftX + u * surfaceW;

    // 1. Inertial sloshing tilt with dynamic fluid wall climb
    const rawTiltDelta = (u - 0.5) * surfaceW * sinAngle;
    const clampedTiltDelta = Math.max(-maxTilt, Math.min(maxTilt, rawTiltDelta));
    // Dynamic fluid wall surge (liquid piles up against container wall on acceleration)
    const wallSurge = Math.sin(Math.PI * (u - 0.5)) * sinAngle * 5.5;
    // Traveling inertial slosh ripple across the surface when shaken actively
    const sloshRipple =
      Math.abs(sinAngle) > 0.03
        ? Math.sin(u * Math.PI * 3 + nowMs * 0.009) * Math.abs(sinAngle) * 5.5 * Math.sin(Math.PI * u)
        : 0;
    const sloshDeltaY = clampedTiltDelta + wallSurge + sloshRipple;

    // 2. Multi-harmonic thermal convection & boiling waves
    const xRel = u * surfaceW;
    const w1 = Math.sin(xRel * spatialK + phase1);
    const w2 = Math.sin(xRel * spatialK * 2.2 + phase2) * 0.42;
    const w3 = Math.cos(xRel * spatialK * 0.75 + phase3) * 0.28;
    // High-frequency boiling churning ripple when hot (T >= 70°C)
    const churn =
      temperature >= 70
        ? Math.sin(xRel * spatialK * 3.8 + phaseChurn) * 0.32 * Math.min(1.0, (temperature - 65) / 30)
        : 0;

    const rawWave = w1 + w2 + w3 + churn;

    // Smooth envelope anchoring cleanly to 0 at container walls (meniscus boundary)
    const envelope = Math.pow(Math.sin(Math.PI * Math.max(0, Math.min(1, u))), 0.55);
    const waveDeltaY = rawWave * baseAmp * envelope;

    points.push({
      x: px,
      y: liquidTopY + sloshDeltaY + waveDeltaY,
    });
  }

  return points;
}

/**
 * Helper: renders gorgeous multi-stop liquid depth gradient with dynamic fluid surface
 */
function renderLiquidBody(
  ctx: CanvasRenderingContext2D,
  liquidType: LiquidType,
  x: number,
  liquidTopY: number,
  bw: number,
  liquidH: number,
  bottomY: number,
  _meniscusRy: number = 4.5,
  fillMinX?: number,
  fillMaxX?: number,
  surfacePoints?: { x: number; y: number }[]
): void {
  const fx = fillMinX ?? (x - 4);
  const fw = fillMaxX !== undefined ? fillMaxX - fx : bw + 8;
  const fy = liquidTopY - 14;
  const fh = Math.max(1, bottomY - fy + 4);

  // 1. Beautiful, tall, smooth linear depth gradient (degrade) - enhanced transition towards the fill level
  const grad = ctx.createLinearGradient(x + bw / 2, liquidTopY, x + bw / 2, bottomY);
  if (liquidType === 'oil') {
    grad.addColorStop(0, 'rgba(101, 163, 13, 0.92)'); // Rich golden-olive at surface
    grad.addColorStop(0.20, 'rgba(132, 204, 22, 0.90)'); // Fresh lime olive oil
    grad.addColorStop(0.55, 'rgba(163, 230, 53, 0.89)'); // Golden-lime green body
    grad.addColorStop(0.85, 'rgba(190, 242, 100, 0.91)'); // Less transparent base so tripod underneath is softer
    grad.addColorStop(1, 'rgba(217, 249, 157, 0.93)'); // Pale luminous base
  } else if (liquidType === 'milk') {
    grad.addColorStop(0, 'rgba(203, 213, 225, 0.95)'); // Soft slate-grey top matching surface line!
    grad.addColorStop(0.25, 'rgba(226, 232, 240, 0.96)'); // Transition to cool light grey
    grad.addColorStop(0.60, 'rgba(241, 245, 249, 0.98)'); // Milky off-white
    grad.addColorStop(1, 'rgba(248, 250, 252, 0.99)'); // Crisp milky white base
  } else {
    // Water
    grad.addColorStop(0, 'rgba(2, 132, 199, 0.92)'); // Rich medium-dark blue right under surface! Matches surface stroke!
    grad.addColorStop(0.22, 'rgba(14, 165, 233, 0.90)'); // Vibrant sky blue
    grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.88)'); // Clear light cyan/blue (γαλάζιο)
    grad.addColorStop(0.85, 'rgba(125, 211, 252, 0.90)'); // Less transparent base so tripod underneath is softer
    grad.addColorStop(1, 'rgba(186, 230, 253, 0.92)'); // Soft clear crystal base
  }

  ctx.fillStyle = grad;
  ctx.fillRect(fx, fy, fw, fh);

  // 2. High-definition Meniscus and Surface Wave Line (crisp and clearly defined)
  ctx.save();
  const strokeColor =
    liquidType === 'oil'
      ? 'rgba(77, 124, 15, 0.90)'
      : liquidType === 'milk'
      ? 'rgba(148, 163, 184, 0.92)'
      : 'rgba(2, 132, 199, 0.92)';

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (surfacePoints && surfacePoints.length > 1) {
    ctx.moveTo(surfacePoints[0].x, surfacePoints[0].y);
    for (let i = 1; i < surfacePoints.length; i++) {
      ctx.lineTo(surfacePoints[i].x, surfacePoints[i].y);
    }
  } else {
    ctx.moveTo(x, liquidTopY);
    ctx.lineTo(x + bw, liquidTopY);
  }
  ctx.stroke();

  // Crisp luminous crest highlight right along the surface
  ctx.strokeStyle =
    liquidType === 'oil'
      ? 'rgba(247, 254, 231, 0.45)'
      : liquidType === 'milk'
      ? 'rgba(255, 255, 255, 0.45)'
      : 'rgba(224, 242, 254, 0.45)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  if (surfacePoints && surfacePoints.length > 2) {
    ctx.moveTo(surfacePoints[1].x, surfacePoints[1].y + 0.8);
    for (let i = 2; i < surfacePoints.length - 1; i++) {
      ctx.lineTo(surfacePoints[i].x, surfacePoints[i].y + 0.8);
    }
  } else {
    ctx.moveTo(x + 3, liquidTopY + 0.8);
    ctx.lineTo(x + bw - 3, liquidTopY + 0.8);
  }
  ctx.stroke();

  // Translucent 3D surface meniscus depth ribbon below the surface line
  ctx.strokeStyle =
    liquidType === 'oil'
      ? 'rgba(163, 230, 53, 0.35)'
      : liquidType === 'milk'
      ? 'rgba(226, 232, 240, 0.40)'
      : 'rgba(56, 189, 248, 0.38)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  if (surfacePoints && surfacePoints.length > 2) {
    ctx.moveTo(surfacePoints[1].x, surfacePoints[1].y + 2.0);
    for (let i = 2; i < surfacePoints.length - 1; i++) {
      ctx.lineTo(surfacePoints[i].x, surfacePoints[i].y + 2.0);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * 1. Bunsen Burner - Authentic 2.5D hand-drawn sketch perspective matching reference
 */
function renderBurner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatBurnerState | undefined,
  isDark: boolean,
  _isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string,
  worldX?: number,
  worldY?: number,
  hoverPoint?: { x: number; y: number } | null,
  ceilingLocalY?: number
): void {
  const strokeColor = customColor || (isDark ? '#f8fafc' : '#111827');
  const cx = w / 2;

  // 2.5D Proportions matching reference sketch in media_1794725655308_28bf8f8b.png
  const groundY = h - 12;
  const baseW = w * 0.67; // slightly narrower base
  const baseRy = 5.2;
  const footH = 4.8;
  const cyBot = groundY - baseRy;
  const cyTop = cyBot - footH;

  const coneTopY = cyTop - 11;
  const coneTopW = w * 0.17;

  const collarH = 12.5;
  const collarTopY = coneTopY - collarH;
  const collarW = coneTopW * 1.18;

  const stemW = coneTopW * 0.82;
  const nozzleH = 12;
  const nozzleTopY = Math.max(16, h * 0.24); // compact stem height so flame sits cleanly beneath tripod gauze
  const nozzleBotY = nozzleTopY + nozzleH;
  const nozzleW = stemW * 1.34;

  // 1. Physical Apparatus Sketch (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Flame when ON (realistic organic candle flame inspired by CodePen YLGjvx)
    // Dynamic animated fire: ONLY rendered in 'all' or 'ui' layers, NEVER baked into static paper background ('apparatus')!
    if (state?.isOn && layer !== 'apparatus') {
      const time = performance.now() / 1000;
      // 1. Organic gentle sway (sway like candle in air)
      const sway = Math.sin(time * 3.6) * 3.1 + Math.sin(time * 7.2) * 1.4;
      // 2. Flame height breathing
      const breathe = 1.0 + Math.sin(time * 4.4) * 0.09 + Math.cos(time * 7.8) * 0.04;

      const isLow = state.intensity === 'low' || state.intensity === 'safety';
      const isHigh = state.intensity === 'high' || state.intensity === 'roaring';

      const baseFlameH = isHigh ? h * 0.54 : isLow ? h * 0.28 : h * 0.41;
      let flameH = baseFlameH * breathe;
      let spreadBoost = 1.0;

      // Never allow flame to penetrate inside a container sitting above the burner;
      // instead convert blocked height into lively horizontal flame licking & flickering along the underside!
      if (ceilingLocalY !== undefined) {
        const maxAllowedH = Math.max(14, nozzleTopY - 2 - ceilingLocalY);
        if (flameH > maxAllowedH) {
          const compression = (flameH - maxAllowedH) / Math.max(10, baseFlameH);
          spreadBoost = 1.0 + Math.min(0.60, compression * 0.90) * (1.0 + Math.sin(time * 8.5) * 0.14);
          flameH = maxAllowedH + Math.sin(time * 6.2) * 1.3;
        }
      }

      const flameTipY = nozzleTopY - 3 - flameH;

      // 3. Soft circular ambient breathing glow (NO rectangular box!)
      ctx.save();
      const glowR = isHigh ? flameH * 1.20 : isLow ? flameH * 0.75 : flameH * 0.95;
      const glowCenterY = nozzleTopY - 3 - flameH * 0.45;
      const glow = ctx.createRadialGradient(cx, glowCenterY, 3, cx, glowCenterY, glowR);
      const glowAlpha = 0.22 + Math.sin(time * 5.0) * 0.05;

      if (isHigh) {
        glow.addColorStop(0, `rgba(249, 115, 22, ${glowAlpha + 0.24})`);
        glow.addColorStop(0.5, `rgba(251, 146, 60, ${glowAlpha * 0.65})`);
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else if (isLow) {
        glow.addColorStop(0, `rgba(245, 158, 11, ${glowAlpha + 0.12})`);
        glow.addColorStop(0.5, `rgba(251, 191, 36, ${glowAlpha * 0.35})`);
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        glow.addColorStop(0, `rgba(249, 115, 22, ${glowAlpha + 0.18})`);
        glow.addColorStop(0.5, `rgba(251, 146, 60, ${glowAlpha * 0.5})`);
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, glowCenterY, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Fluid teardrop flame silhouette emerging from nozzle mouth
      ctx.save();
      const widthScale = (isHigh ? 1.30 : isLow ? 0.70 : 1.0) * spreadBoost;
      const flameBaseW = nozzleW * 0.72 * (isLow ? 0.80 : isHigh ? 1.15 : 1.0);
      const flameMidW = nozzleW * 1.35 * widthScale * (1.0 - (breathe - 1.0) * 0.5);

      ctx.beginPath();
      ctx.moveTo(cx - flameBaseW / 2, nozzleTopY);
      // Left convex shoulder
      ctx.bezierCurveTo(
        cx - flameMidW,
        nozzleTopY - flameH * 0.35,
        cx - flameMidW * 0.6 + sway * 0.5,
        nozzleTopY - flameH * 0.75,
        cx + sway,
        flameTipY
      );
      // Right convex shoulder
      ctx.bezierCurveTo(
        cx + flameMidW * 0.6 + sway * 0.5,
        nozzleTopY - flameH * 0.75,
        cx + flameMidW,
        nozzleTopY - flameH * 0.35,
        cx + flameBaseW / 2,
        nozzleTopY
      );
      ctx.closePath();

      // Flame Gradient Fill
      const flameGrad = ctx.createLinearGradient(cx, nozzleTopY, cx + sway, flameTipY);
      if (isHigh) {
        flameGrad.addColorStop(0, 'rgba(185, 28, 28, 0.95)'); // Hot crimson base
        flameGrad.addColorStop(0.2, 'rgba(234, 88, 12, 0.90)'); // Rich orange
        flameGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.85)'); // Golden amber
        flameGrad.addColorStop(0.85, 'rgba(253, 224, 71, 0.80)'); // Bright yellow
        flameGrad.addColorStop(1, 'rgba(255, 255, 255, 0.75)'); // White tip
      } else if (isLow) {
        flameGrad.addColorStop(0, 'rgba(194, 65, 12, 0.85)');
        flameGrad.addColorStop(0.3, 'rgba(234, 88, 12, 0.80)');
        flameGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.75)');
        flameGrad.addColorStop(1, 'rgba(254, 240, 138, 0.60)');
      } else {
        flameGrad.addColorStop(0, 'rgba(194, 65, 12, 0.90)'); // Deep fire base
        flameGrad.addColorStop(0.25, 'rgba(234, 88, 12, 0.85)'); // Rich orange
        flameGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.80)'); // Golden amber
        flameGrad.addColorStop(0.9, 'rgba(253, 224, 71, 0.75)'); // Bright yellow
        flameGrad.addColorStop(1, 'rgba(255, 255, 255, 0.65)'); // White tip
      }
      ctx.fillStyle = flameGrad;
      ctx.fill();

      ctx.strokeStyle = isHigh ? '#dc2626' : isLow ? '#d97706' : '#ea580c';
      ctx.lineWidth = isHigh ? 1.4 : 1.25;
      ctx.stroke();

      // 5. Inner Bright Flame Core (teardrop)
      const coreH = flameH * (isHigh ? 0.58 : isLow ? 0.46 : 0.52);
      const coreTipY = nozzleTopY - coreH;
      const coreMidW = flameMidW * 0.48;

      ctx.beginPath();
      ctx.moveTo(cx - flameBaseW * 0.3, nozzleTopY);
      ctx.bezierCurveTo(
        cx - coreMidW,
        nozzleTopY - coreH * 0.35,
        cx - coreMidW * 0.5 + sway * 0.3,
        nozzleTopY - coreH * 0.75,
        cx + sway * 0.5,
        coreTipY
      );
      ctx.bezierCurveTo(
        cx + coreMidW * 0.5 + sway * 0.3,
        nozzleTopY - coreH * 0.75,
        cx + coreMidW,
        nozzleTopY - coreH * 0.35,
        cx + flameBaseW * 0.3,
        nozzleTopY
      );
      ctx.closePath();

      const coreGrad = ctx.createLinearGradient(cx, nozzleTopY, cx, coreTipY);
      coreGrad.addColorStop(0, 'rgba(253, 224, 71, 0.95)');
      coreGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.restore();
    }

    // 1. Heavy Cast-Iron 2.5D Base (matching reference sketch)
    // A. Conical Bell Flare (sweeping concave curves)
    ctx.beginPath();
    ctx.moveTo(cx - baseW / 2, cyTop);
    ctx.bezierCurveTo(
      cx - baseW * 0.32, cyTop - 1,
      cx - coneTopW * 0.85, coneTopY + 7,
      cx - coneTopW / 2, coneTopY
    );
    ctx.lineTo(cx + coneTopW / 2, coneTopY);
    ctx.bezierCurveTo(
      cx + coneTopW * 0.85, coneTopY + 7,
      cx + baseW * 0.32, cyTop - 1,
      cx + baseW / 2, cyTop
    );
    ctx.stroke();

    // B. Beveled Rim Edge of Foot
    ctx.beginPath();
    ctx.moveTo(cx - baseW / 2, cyTop);
    ctx.lineTo(cx - baseW / 2, cyBot);
    ctx.moveTo(cx + baseW / 2, cyTop);
    ctx.lineTo(cx + baseW / 2, cyBot);
    ctx.stroke();

    // C. Upper rim front ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cyTop, baseW / 2, baseRy, 0, 0, Math.PI);
    ctx.stroke();

    // D. Bottom base front ellipse resting on table
    ctx.beginPath();
    ctx.ellipse(cx, cyBot, baseW / 2, baseRy, 0, 0, Math.PI);
    ctx.stroke();

    // F. Left flare reflection line (hand-drawn sketch accent from reference)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - baseW * 0.34, cyTop - 1);
    ctx.quadraticCurveTo(cx - coneTopW * 0.9, coneTopY + 7, cx - coneTopW * 0.65, coneTopY + 2);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.45)' : 'rgba(17, 24, 39, 0.40)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // 2. Air Collar Sleeve with Vertical Vent Slot
    // A. Lower collar ring (front curve only)
    ctx.beginPath();
    ctx.ellipse(cx, coneTopY, collarW / 2, 2.5, 0, 0, Math.PI);
    ctx.stroke();

    // B. Collar cylinder sides
    ctx.beginPath();
    ctx.moveTo(cx - collarW / 2, collarTopY);
    ctx.lineTo(cx - collarW / 2, coneTopY);
    ctx.moveTo(cx + collarW / 2, collarTopY);
    ctx.lineTo(cx + collarW / 2, coneTopY);
    ctx.stroke();

    // C. Upper collar ring (front curve only)
    ctx.beginPath();
    ctx.ellipse(cx, collarTopY, collarW / 2, 2.5, 0, 0, Math.PI);
    ctx.stroke();

    // D. Vertical Oval Air Aperture Slot (exact from reference)
    ctx.beginPath();
    ctx.ellipse(cx, collarTopY + collarH * 0.5, 2.2, collarH * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();

    // E. Gas inlet knob / nub on right side
    ctx.beginPath();
    ctx.rect(cx + collarW / 2, collarTopY + collarH * 0.38, 3.2, collarH * 0.28);
    ctx.stroke();

    // 3. Vertical Barrel / Chimney Tube
    ctx.beginPath();
    ctx.moveTo(cx - stemW / 2, collarTopY);
    ctx.lineTo(cx - stemW / 2, nozzleBotY);
    ctx.moveTo(cx + stemW / 2, collarTopY);
    ctx.lineTo(cx + stemW / 2, nozzleBotY);
    ctx.stroke();

    // Left vertical tube highlight streak
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - stemW * 0.25, collarTopY - 2);
    ctx.lineTo(cx - stemW * 0.25, nozzleBotY + 2);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.42)' : 'rgba(17, 24, 39, 0.38)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // 4. Top Nozzle Head (Cup & Orifice)
    // A. Bottom of nozzle cup (front curve only)
    ctx.beginPath();
    ctx.ellipse(cx, nozzleBotY, nozzleW / 2, 2.4, 0, 0, Math.PI);
    ctx.stroke();

    // B. Nozzle cylinder sides
    ctx.beginPath();
    ctx.moveTo(cx - nozzleW / 2, nozzleBotY);
    ctx.lineTo(cx - nozzleW / 2, nozzleTopY);
    ctx.moveTo(cx + nozzleW / 2, nozzleBotY);
    ctx.lineTo(cx + nozzleW / 2, nozzleTopY);
    ctx.stroke();

    // C. Top opening: clean top rim with front bevel curve
    ctx.beginPath();
    ctx.moveTo(cx - nozzleW / 2, nozzleTopY);
    ctx.lineTo(cx + nozzleW / 2, nozzleTopY);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, nozzleTopY + 2.2, nozzleW / 2, 1.9, 0, 0, Math.PI);
    ctx.stroke();

    // Left nozzle highlight streak
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - nozzleW * 0.3, nozzleBotY - 1);
    ctx.lineTo(cx - nozzleW * 0.3, nozzleTopY + 2);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.42)' : 'rgba(17, 24, 39, 0.38)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 5. Permanent Flame Toggle Icon at bottom-right of cast-iron base (no outer box/frame)
    const { btnCenterX, btnCenterY, btnHalf } = getBurnerActionButtonLocalPos(w, h);
    const isOn = Boolean(state?.isOn);
    drawFlameIcon(ctx, btnCenterX, btnCenterY, isDark, isOn, state?.intensity);

    // 6. Intensity label pill ("Χαμηλή", "Μεσαία", "Υψηλή") next to flame button
    const btnWorldX = (worldX ?? 0) + btnCenterX;
    const btnWorldY = (worldY ?? 0) + btnCenterY;
    const isHovered = Boolean(
      hoverPoint && Math.hypot(hoverPoint.x - btnWorldX, hoverPoint.y - btnWorldY) <= 18
    );
    const nowMs = Date.now();
    const noticeTimeLeft = (state?.noticeUntil ?? 0) - nowMs;
    const isNoticeActive = noticeTimeLeft > 0;

    if (isNoticeActive || isHovered) {
      let labelText = 'Σβηστό';
      let themeColor = isDark ? '#94a3b8' : '#64748b';
      let borderColor = 'rgba(148, 163, 184, 0.4)';

      if (isOn) {
        const int = state?.intensity;
        if (int === 'low' || int === 'safety') {
          labelText = 'Χαμηλή';
          themeColor = isDark ? '#fbbf24' : '#d97706';
          borderColor = 'rgba(245, 158, 11, 0.45)';
        } else if (int === 'high' || int === 'roaring') {
          labelText = 'Υψηλή';
          themeColor = isDark ? '#fb7185' : '#e11d48';
          borderColor = 'rgba(225, 29, 72, 0.45)';
        } else {
          // medium / normal
          labelText = 'Μεσαία';
          themeColor = isDark ? '#fb923c' : '#ea580c';
          borderColor = 'rgba(234, 88, 12, 0.45)';
        }
      }

      ctx.save();
      // Smooth fade out in the last 400ms when not hovering
      if (!isHovered && isNoticeActive && noticeTimeLeft < 400) {
        ctx.globalAlpha = Math.max(0, noticeTimeLeft / 400);
      }

      ctx.font = 'bold 9.5px system-ui, sans-serif';
      const textW = ctx.measureText(labelText).width;
      const pillW = textW + 12;
      const pillH = 17;
      const pillX = btnCenterX + btnHalf + 5;
      const pillY = btnCenterY - pillH / 2;
      const r = pillH / 2;

      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, r);
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.94)';
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.fillStyle = themeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, pillX + pillW / 2, pillY + pillH / 2 + 0.5);

      ctx.restore();
    }

    ctx.restore();
  }
}

/**
 * 2. Laboratory Tripod - Monochrome line-art with wire gauze crosshatch
 * Supports 2-pass 2.5D optical sandwich:
 * - 'back': Recessed back leg, back half of wire gauze mesh & ceramic disc, back collar arc (behind flame)
 * - 'front': Front half of wire gauze mesh & ceramic disc, front collar arc, front legs (in front of flame)
 * - 'all': Complete tripod in a single pass
 */
function renderTripod(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  gauzeTempC: number,
  isDark: boolean,
  _isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string,
  part: 'all' | 'back' | 'front' = 'all',
  hasContainerOnTop: boolean = false
): void {
  const strokeColor = customColor || (isDark ? '#f8fafc' : '#111827');
  const cx = w / 2;
  const collarW = w * 0.72;
  // Reduce vertical perspective for a gentler, more authentic 2.5D elevation
  const collarH = Math.round(collarW * 0.15); // ~13px (flatter 2.5D ellipse with Ry ≈ 6.5px)
  const topY = 4;
  const collarCy = topY + collarH * 0.5;
  const collarRx = collarW / 2;
  const collarRy = collarH / 2;
  const legBotY = h - 6;

  const gauzeW = collarW * 0.88;
  const gauzeH = collarH * 0.88;
  const ceramicScale = 0.38;
  const ceramicRx = collarRx * ceramicScale;
  const ceramicRy = collarRy * ceramicScale;

  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // -------------------------------------------------------------------------
    // PASS 1: BACK HALF (Rendered BEHIND burner flame)
    // -------------------------------------------------------------------------
    if (part === 'all' || part === 'back') {
      // 1. Recessed Back Leg (Starts on bottom edge of outer collar, underneath wire gauze)
      const backRatio = 0.26;
      const backStartX = cx - collarRx * backRatio;
      const backStartY = collarCy + collarRy * Math.sqrt(1 - backRatio * backRatio);
      const backEndX = cx - collarW * 0.24;
      const backEndY = legBotY - 6;

      ctx.save();
      if (hasContainerOnTop) {
        ctx.filter = 'blur(1.2px)';
      }
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.28)' : 'rgba(100, 116, 139, 0.24)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(backStartX, backStartY);
      ctx.lineTo(backEndX, backEndY);
      ctx.stroke();
      ctx.restore();

      // When a container sits on top of the tripod, its glass base & liquid cover the wire gauze,
      // inner ring, and back collar arc: soften with glass blur & reduced opacity ("σαν να βάλαμε μπροστά γυαλί")!
      ctx.save();
      if (hasContainerOnTop) {
        ctx.globalAlpha = 0.22;
        ctx.filter = 'blur(2.6px)';
      }
      const coveredRingStroke = hasContainerOnTop
        ? (isDark ? 'rgba(203, 213, 225, 0.65)' : 'rgba(71, 85, 105, 0.60)')
        : strokeColor;

      // 2. Wire Gauze mesh crosshatch (Top/Back half: y <= collarCy + 0.5)
      // Clipped with evenodd donut: mesh exists ONLY on the ring, central opening is completely transparent!
      ctx.save();
      if (part === 'back') {
        ctx.beginPath();
        ctx.rect(-w, -h, w * 3, collarCy + h + 0.5);
        ctx.clip();
      }

      ctx.beginPath();
      ctx.ellipse(cx, collarCy, gauzeW / 2, gauzeH / 2, 0, 0, Math.PI * 2);
      ctx.ellipse(cx, collarCy, ceramicRx, ceramicRy, 0, 0, Math.PI * 2);
      ctx.clip('evenodd');

      ctx.strokeStyle = isDark ? 'rgba(203, 213, 225, 0.50)' : 'rgba(71, 85, 105, 0.48)';
      ctx.lineWidth = 0.8;
      const step = 4;
      for (let x = cx - gauzeW / 2; x <= cx + gauzeW / 2; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, topY + collarH);
        ctx.stroke();
      }
      for (let y = topY; y <= topY + collarH; y += step) {
        ctx.beginPath();
        ctx.moveTo(cx - gauzeW / 2, y);
        ctx.lineTo(cx + gauzeW / 2, y);
        ctx.stroke();
      }
      ctx.restore(); // restore from gauze donut clip and back clip

      // 3. Central Opening Inner Ring (Back Arc: Math.PI to Math.PI * 2) - NO FILL (100% transparent)
      ctx.save();
      ctx.beginPath();
      if (part === 'back') {
        ctx.ellipse(cx, collarCy, ceramicRx, ceramicRy, 0, Math.PI, Math.PI * 2);
      } else {
        ctx.ellipse(cx, collarCy, ceramicRx, ceramicRy, 0, 0, Math.PI * 2);
      }
      ctx.strokeStyle = coveredRingStroke;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // 4. Back Arc of Circular Top Collar Ring
      ctx.save();
      ctx.strokeStyle = coveredRingStroke;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (part === 'back') {
        ctx.ellipse(cx, collarCy, collarRx, collarRy, 0, Math.PI, Math.PI * 2);
      } else {
        ctx.ellipse(cx, collarCy, collarRx, collarRy, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // restore from hasContainerOnTop blur/alpha
    }

    // -------------------------------------------------------------------------
    // PASS 2: FRONT HALF (Rendered IN FRONT OF burner flame)
    // -------------------------------------------------------------------------
    if (part === 'all' || part === 'front') {
      if (part === 'front') {
        ctx.save();
        if (hasContainerOnTop) {
          ctx.globalAlpha = 0.22;
          ctx.filter = 'blur(2.6px)';
        }
        const coveredFrontRingStroke = hasContainerOnTop
          ? (isDark ? 'rgba(203, 213, 225, 0.65)' : 'rgba(71, 85, 105, 0.60)')
          : strokeColor;

        // Wire Gauze mesh crosshatch (Bottom/Front half: y >= collarCy - 0.5)
        // Clipped with evenodd donut: mesh exists ONLY on the ring, central opening is completely transparent!
        ctx.save();
        ctx.beginPath();
        ctx.rect(-w, collarCy - 0.5, w * 3, h * 2);
        ctx.clip();

        ctx.beginPath();
        ctx.ellipse(cx, collarCy, gauzeW / 2, gauzeH / 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cx, collarCy, ceramicRx, ceramicRy, 0, 0, Math.PI * 2);
        ctx.clip('evenodd');

        ctx.strokeStyle = isDark ? 'rgba(203, 213, 225, 0.50)' : 'rgba(71, 85, 105, 0.48)';
        ctx.lineWidth = 0.8;
        const step = 4;
        for (let x = cx - gauzeW / 2; x <= cx + gauzeW / 2; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x, topY + collarH);
          ctx.stroke();
        }
        for (let y = topY; y <= topY + collarH; y += step) {
          ctx.beginPath();
          ctx.moveTo(cx - gauzeW / 2, y);
          ctx.lineTo(cx + gauzeW / 2, y);
          ctx.stroke();
        }
        ctx.restore(); // restore from front gauze donut clip

        // Central Opening Inner Ring (Front Arc: 0 to Math.PI) - NO FILL (100% transparent)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, collarCy, ceramicRx, ceramicRy, 0, 0, Math.PI);
        ctx.strokeStyle = coveredFrontRingStroke;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        ctx.restore(); // restore from hasContainerOnTop blur/alpha

        // Front Arc of Circular Top Collar Ring (from 0 to PI) - remains 100% sharp as the foreground lip!
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.ellipse(cx, collarCy, collarRx, collarRy, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Front Left and Front Right Legs (crisp foreground line-art)
      const frontRatio = 0.82;
      const frontYOffset = collarRy * Math.sqrt(1 - frontRatio * frontRatio);
      const leftStartX = cx - collarRx * frontRatio;
      const leftStartY = collarCy + frontYOffset;
      const leftEndX = cx - collarW * 0.62;

      const rightStartX = cx + collarRx * frontRatio;
      const rightStartY = collarCy + frontYOffset;
      const rightEndX = cx + collarW * 0.62;

      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(leftStartX, leftStartY);
      ctx.lineTo(leftEndX, legBotY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightStartX, rightStartY);
      ctx.lineTo(rightEndX, legBotY);
      ctx.stroke();
    }

    ctx.restore();
  }
}

/**
 * Ephemeral Volume Fill Feedback for container droplet clicks (1.5s fade out).
 */
export interface ContainerFillFeedback {
  volumeMl: number;
  capacityMl: number;
  startTime: number;
}

export const containerFillFeedbackMap = new Map<string, ContainerFillFeedback>();

export function triggerContainerFillFeedback(containerId: string, volumeMl: number, capacityMl: number): void {
  containerFillFeedbackMap.set(containerId, {
    volumeMl,
    capacityMl,
    startTime: performance.now(),
  });
}

/**
 * Tests if a container is nested / submerged inside another container (water bath / outer vessel).
 */
export function isContainerSubmerged(obj: HeatObject, allObjects?: HeatObject[]): boolean {
  return Boolean(findParentVessel(obj, allObjects));
}

/**
 * Coordinate calculators for the permanent discreet action buttons (Droplet, Pencil & Graph).
 * When normal: positioned at bottom-right of container glassware.
 * When submerged in another container: slides up to the top-right above the outer rim!
 */
export function getContainerActionButtonsLocalPos(
  w: number,
  h: number,
  isSubmerged?: boolean,
  containerType?: string,
  outerRimLocalY?: number | null
) {
  const pad = 8;
  const bw = w - pad * 2;
  const bh = h - pad * 2 - 6;
  const glassRightX = pad + bw;
  const glassBottomY = pad + 4 + bh;

  const btnSize = 18;
  const btnHalf = btnSize / 2;
  const gap = 4.5;

  if (isSubmerged) {
    // When submerged in another vessel:
    // 1. Horizontal position:
    // For a conical flask (flask), the buttons hug the narrow neck closely ("και πιο κοντα ομως στο λαιμο του κωνικου"),
    // rather than floating out at the wide base edge!
    let btnX: number;
    if (containerType === 'flask') {
      const cx = pad + bw / 2;
      const neckW = bw * 0.30;
      const neckRightX = cx + neckW / 2 + 3.5; // right edge of neck glass + collar
      btnX = Math.round(neckRightX + gap + btnHalf);
    } else {
      btnX = glassRightX + gap + btnHalf;
    }

    // 2. Vertical position:
    // The droplet must ALWAYS be slightly above the rim of the wide outer vessel ("η σταγονα του κωνικου δοχειου να ειναι παντα λιγο πιο πανω απο το χειλος του φαρδιου δοχειου")!
    // And stacked above it: pencil, and stacked above pencil: graph ("και ας ειναι το πιο πανω το διαγραμμα πιο πανω απο το χειλος του κωνικου δεν πειραζει αυτο")!
    let dropletY: number;
    if (outerRimLocalY !== undefined && outerRimLocalY !== null) {
      // Bottom of droplet is ~7px clearly above the outer vessel's rim
      dropletY = Math.round(outerRimLocalY - btnHalf - 7);
    } else {
      // Fallback if outer rim is unknown
      const beadH = 3.5;
      const topMargin = pad + 4 + beadH + 2;
      dropletY = topMargin + btnHalf + (btnSize + 4) * 2;
    }

    const pencilX = btnX;
    const pencilY = dropletY - btnSize - 4;
    const graphX = btnX;
    const graphY = pencilY - btnSize - 4;
    const dropletX = btnX;

    return { dropletX, dropletY, pencilX, pencilY, graphX, graphY, btnSize, btnHalf, glassRightX, glassBottomY };
  }

  // Normal position at bottom-right
  const dropletX = glassRightX + gap + btnHalf;
  const dropletY = glassBottomY - btnHalf - 1;
  const pencilX = dropletX;
  const pencilY = dropletY - btnSize - 4;
  const graphX = dropletX;
  const graphY = pencilY - btnSize - 4;
  return { dropletX, dropletY, pencilX, pencilY, graphX, graphY, btnSize, btnHalf, glassRightX, glassBottomY };
}

export function computeEffectiveOuterRimLocalY(
  objX: number,
  objY: number,
  w: number,
  type: string | undefined,
  parentBasin: HeatObject | undefined,
  allObjects?: HeatObject[]
): number | null {
  if (!parentBasin) return null;
  const bPad = 8;
  let effectiveRimWorldY = parentBasin.y + bPad + 4;

  // If the parent container (e.g. B) is itself submerged in a grandparent container (e.g. A),
  // check if B's upward-stacked action buttons (💧, ✏️, 📈 above A's rim) reach above B's rim
  // and are horizontally close to this inner container's (Γ's) action buttons!
  if (allObjects) {
    const grandParent = findParentVessel(parentBasin, allObjects);
    if (grandParent && isContainerSubmerged(parentBasin, allObjects)) {
      const parentBtnX =
        parentBasin.x +
        (parentBasin.type === 'flask'
          ? 8 + (parentBasin.width - 16) * 0.65 + 17
          : parentBasin.width - 8 + 13.5);
      const innerBtnX =
        objX + (type === 'flask' ? 8 + (w - 16) * 0.65 + 17 : w - 8 + 13.5);
      if (Math.abs(innerBtnX - parentBtnX) < 26) {
        const grandParentRimWorldY = grandParent.y + bPad + 4;
        // Top of parent B's 3-button stack above A's rim:
        const parentButtonsTopWorldY = grandParentRimWorldY - 7 - 18 * 3 - 4 * 2;
        effectiveRimWorldY = Math.min(effectiveRimWorldY, parentButtonsTopWorldY);
      }
    }
  }
  return effectiveRimWorldY - objY;
}

export function getContainerActionButtonsWorldPos(obj: HeatObject, allObjects?: HeatObject[]) {
  const isSubmerged = allObjects ? isContainerSubmerged(obj, allObjects) : false;
  let outerRimLocalY: number | null = null;
  if (isSubmerged && allObjects) {
    const parentBasin = findParentVessel(obj, allObjects);
    if (parentBasin) {
      outerRimLocalY = computeEffectiveOuterRimLocalY(
        obj.x,
        obj.y,
        obj.width,
        obj.type,
        parentBasin,
        allObjects
      );
    }
  }
  const local = getContainerActionButtonsLocalPos(obj.width, obj.height, isSubmerged, obj.type, outerRimLocalY);
  return {
    dropletX: obj.x + local.dropletX,
    dropletY: obj.y + local.dropletY,
    pencilX: obj.x + local.pencilX,
    pencilY: obj.y + local.pencilY,
    graphX: obj.x + local.graphX,
    graphY: obj.y + local.graphY,
    btnSize: local.btnSize,
    btnHalf: local.btnHalf,
    glassRightX: obj.x + local.glassRightX,
    glassBottomY: obj.y + local.glassBottomY,
  };
}

/**
 * Calculates the exact magnetic docking position for a container (flask, beaker, wide-basin)
 * resting level on the wire gauze ring of the tripod apparatus.
 */
export function getTripodContainerDockPos(
  tripod: HeatObject,
  container: HeatObject
): { dockX: number; dockY: number } {
  const tripodCenterX = tripod.x + tripod.width / 2;
  const collarW = tripod.width * 0.72;
  const collarH = Math.round(collarW * 0.15);
  const topY = 4;
  const collarCy = topY + collarH * 0.5;
  const collarRy = collarH / 2;

  const pad = 8;
  const bw = container.width - pad * 2;
  const botCurve = Math.round(bw * 0.055);

  const dockX = Math.round(tripodCenterX - container.width / 2);
  const dockY = Math.round(tripod.y + collarCy + collarRy - (container.height - 10) - botCurve);

  return { dockX, dockY };
}

/**
 * Calculates the magnetic docking position for a Bunsen burner centered underneath a tripod.
 */
export function getTripodBurnerDockPos(
  tripod: HeatObject,
  burner: HeatObject
): { dockX: number; dockY: number } {
  const tripodCenterX = tripod.x + tripod.width / 2;
  const dockX = Math.round(tripodCenterX - burner.width / 2);
  // Lock the burner at a lower position under the tripod so the entire animated flame
  // sits clearly beneath the wire gauze without piercing into the vessel above!
  const dockY = Math.round(tripod.y + tripod.height - burner.height + 24);
  return { dockX, dockY };
}

/**
 * Calculates the magnetic docking position for a nested vessel resting inside a water bath (wide-basin).
 */
export function getWaterBathNestedDockPos(
  basin: HeatObject,
  vessel: HeatObject
): { dockX: number; dockY: number } {
  const basinCenterX = basin.x + basin.width / 2;
  const dockX = Math.round(basinCenterX - vessel.width / 2);
  const bPad = 8;
  const basinBottomY = basin.y + basin.height - bPad - 2;
  const dockY = Math.round(basinBottomY - (vessel.height - 10));
  return { dockX, dockY };
}

/**
 * Coordinate calculators for the permanent flame toggle button
 * positioned at the bottom-right of the Bunsen burner cast-iron base.
 * Shifted slightly more to the left ("και ισως λιγο πιο αριστερα").
 */
export function getBurnerActionButtonLocalPos(w: number, h: number) {
  const cx = w / 2;
  const baseW = w * 0.67;
  const groundY = h - 12;
  const cyBot = groundY - 5.2;
  const btnSize = 19;
  const btnHalf = btnSize / 2;
  // Clean 4.5px gap to the right of the cast-iron base edge ("και ισως λιγο πιο αριστερα")
  const btnCenterX = cx + baseW / 2 + btnHalf + 4.5;
  const btnCenterY = cyBot + 1;
  return { btnCenterX, btnCenterY, btnSize, btnHalf };
}

export function getBurnerActionButtonWorldPos(obj: HeatObject) {
  const local = getBurnerActionButtonLocalPos(obj.width, obj.height);
  return {
    btnCenterX: obj.x + local.btnCenterX,
    btnCenterY: obj.y + local.btnCenterY,
    btnSize: local.btnSize,
    btnHalf: local.btnHalf,
  };
}

/**
 * Distance from point (px, py) to line segment (x1, y1) -> (x2, y2).
 */
export function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/**
 * Tests if logical canvas point (lx, ly) hits the visible contours, lines, or solid body of a HeatObject.
 * Specifically for the Tripod, it checks near the wire gauze collar ring and the 3 legs,
 * returning FALSE for the empty central open space beneath the tripod.
 */
export function isPointOnHeatObject(
  obj: HeatObject,
  lx: number,
  ly: number,
  margin = 12
): boolean {
  // Quick AABB rejection
  if (
    lx < obj.x - margin ||
    lx > obj.x + obj.width + margin ||
    ly < obj.y - margin ||
    ly > obj.y + obj.height + margin
  ) {
    return false;
  }

  const cx = obj.x + obj.width / 2;
  const w = obj.width;
  const h = obj.height;

  switch (obj.type) {
    case 'tripod': {
      // 1. Top Collar & Wire Gauze Ring:
      const collarW = w * 0.72;
      const collarH = Math.round(collarW * 0.15);
      const topY = obj.y + 4;
      const collarCy = topY + collarH * 0.5;
      const collarRx = collarW / 2;
      const collarRy = collarH / 2;

      // Top ring / wire gauze area hit test (ellipse with margin)
      const dxCollar = (lx - cx) / (collarRx + margin);
      const dyCollar = (ly - collarCy) / (collarRy + margin);
      if (dxCollar * dxCollar + dyCollar * dyCollar <= 1.0) {
        return true;
      }

      // 2. Front Left Leg
      const legBotY = obj.y + h - 6;
      const frontRatio = 0.82;
      const frontYOffset = collarRy * Math.sqrt(1 - frontRatio * frontRatio);
      const leftStartX = cx - collarRx * frontRatio;
      const leftStartY = collarCy + frontYOffset;
      const leftEndX = cx - collarW * 0.62;
      const leftEndY = legBotY;

      if (distToSegment(lx, ly, leftStartX, leftStartY, leftEndX, leftEndY) <= margin) {
        return true;
      }

      // 3. Front Right Leg
      const rightStartX = cx + collarRx * frontRatio;
      const rightStartY = collarCy + frontYOffset;
      const rightEndX = cx + collarW * 0.62;
      const rightEndY = legBotY;

      if (distToSegment(lx, ly, rightStartX, rightStartY, rightEndX, rightEndY) <= margin) {
        return true;
      }

      // 4. Back Leg
      const backRatio = 0.26;
      const backStartX = cx - collarRx * backRatio;
      const backStartY = collarCy + collarRy * Math.sqrt(1 - backRatio * backRatio);
      const backEndX = cx - collarW * 0.24;
      const backEndY = legBotY - 6;

      if (distToSegment(lx, ly, backStartX, backStartY, backEndX, backEndY) <= margin) {
        return true;
      }

      // Open space inside the tripod is EMPTY!
      return false;
    }

    case 'burner': {
      // 1. Cast-iron Foot Base at bottom
      const baseW = w * 0.67;
      const groundY = obj.y + h - 12;
      const baseTopY = groundY - 26;
      if (
        ly >= baseTopY - margin &&
        ly <= obj.y + h + margin &&
        Math.abs(lx - cx) <= baseW / 2 + margin
      ) {
        return true;
      }

      // 2. Vertical Chimney / Tube
      const tubeHalfW = Math.max(12, w * 0.09);
      const tubeTopY = obj.y + 24;
      if (
        ly >= tubeTopY - margin &&
        ly <= groundY &&
        Math.abs(lx - cx) <= tubeHalfW + margin
      ) {
        return true;
      }

      // 3. Flame (if on)
      if (obj.burnerState?.isOn) {
        const flameHalfW = Math.max(20, w * 0.16);
        if (
          ly >= obj.y - margin &&
          ly <= tubeTopY + 12 &&
          Math.abs(lx - cx) <= flameHalfW + margin
        ) {
          return true;
        }
      }

      // 4. Flame toggle button (at bottom-right of base)
      const { btnCenterX, btnCenterY } = getBurnerActionButtonWorldPos(obj);
      if (Math.hypot(lx - btnCenterX, ly - btnCenterY) <= 18) {
        return true;
      }

      return false;
    }

    case 'flask': {
      const pad = 8;
      const bw = w - pad * 2;
      const bh = h - pad * 2;
      const neckW = Math.max(22, bw * 0.26);
      const neckH = bh * 0.28;
      const topLipY = obj.y + pad;
      const neckBottomY = topLipY + neckH;
      const baseBottomY = obj.y + h - pad;

      // Neck
      if (
        ly >= topLipY - margin &&
        ly <= neckBottomY + 2 &&
        Math.abs(lx - cx) <= neckW / 2 + margin
      ) {
        return true;
      }

      // Conical Body: width expands linearly with depth
      if (ly >= neckBottomY && ly <= baseBottomY + margin) {
        const t = Math.min(1, Math.max(0, (ly - neckBottomY) / (baseBottomY - neckBottomY)));
        const halfW = neckW / 2 + t * (bw / 2 - neckW / 2);
        if (Math.abs(lx - cx) <= halfW + margin) {
          return true;
        }
      }

      return false;
    }

    case 'beaker': {
      const pad = 8;
      const bw = w - pad * 2;
      const topY = obj.y + pad;
      const botY = obj.y + h - pad;
      if (
        ly >= topY - margin &&
        ly <= botY + margin &&
        Math.abs(lx - cx) <= bw / 2 + margin
      ) {
        return true;
      }
      return false;
    }

    case 'wide-basin': {
      const pad = 8;
      const bw = w - pad * 2;
      const topY = obj.y + pad;
      const botY = obj.y + h - pad;
      if (
        ly >= topY - margin &&
        ly <= botY + margin &&
        Math.abs(lx - cx) <= bw / 2 + margin
      ) {
        return true;
      }
      return false;
    }

    case 'thermometer': {
      const tubeHalfW = Math.max(12, w * 0.18);
      if (
        ly >= obj.y - margin &&
        ly <= obj.y + obj.height + margin &&
        Math.abs(lx - cx) <= tubeHalfW + margin
      ) {
        return true;
      }
      return false;
    }

    default:
      return (
        lx >= obj.x - margin &&
        lx <= obj.x + obj.width + margin &&
        ly >= obj.y - margin &&
        ly <= obj.y + obj.height + margin
      );
  }
}

/**
 * Standalone droplet icon: slightly larger, darker grey outline,
 * very pale soft cyan inside when idle, more intense vibrant cyan when pressed/active.
 * (No box, no frame, no white background).
 */
function drawDropletIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  isDark: boolean,
  isIntense: boolean,
  liquidType: LiquidType = 'water',
  customOutlineColor?: string
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  // Pointed top tip
  ctx.moveTo(0, -6.5);
  // Curve down right
  ctx.bezierCurveTo(3.2, -2.4, 4.8, 1.0, 4.8, 3.0);
  // Bottom rounded base
  ctx.bezierCurveTo(4.8, 5.8, 2.7, 6.8, 0, 6.8);
  ctx.bezierCurveTo(-2.7, 6.8, -4.8, 5.8, -4.8, 3.0);
  // Curve up left to tip
  ctx.bezierCurveTo(-4.8, 1.0, -3.2, -2.4, 0, -6.5);
  ctx.closePath();

  // Color matches the liquid contents of the container, slightly softer/fainter ("ισως λιγο πιο αχνο")
  let fillCol: string;
  let strokeCol: string;
  let shadowCol = 'transparent';

  if (liquidType === 'oil') {
    // Olive Oil: Golden-lime green hue
    if (isIntense) {
      fillCol = isDark ? 'rgba(163, 230, 53, 0.35)' : 'rgba(190, 242, 100, 0.45)';
      strokeCol = isDark ? '#a3e635' : 'rgba(101, 163, 13, 0.88)';
      shadowCol = 'rgba(132, 204, 22, 0.25)';
    } else {
      fillCol = isDark ? 'rgba(163, 230, 53, 0.12)' : 'rgba(217, 249, 157, 0.22)';
      strokeCol = isDark ? 'rgba(241, 245, 249, 0.85)' : '#475569';
    }
  } else if (liquidType === 'milk') {
    // Milk: Soft slate-grey stroke with milky off-white fill
    if (isIntense) {
      fillCol = isDark ? 'rgba(226, 232, 240, 0.40)' : 'rgba(241, 245, 249, 0.80)';
      strokeCol = isDark ? 'rgba(203, 213, 225, 0.90)' : 'rgba(100, 116, 139, 0.82)';
      shadowCol = 'rgba(148, 163, 184, 0.20)';
    } else {
      fillCol = isDark ? 'rgba(226, 232, 240, 0.12)' : 'rgba(241, 245, 249, 0.30)';
      strokeCol = isDark ? 'rgba(241, 245, 249, 0.85)' : '#475569';
    }
  } else {
    // Water: Soft sky blue / cyan, paler and more delicate than previous dark blue
    if (isIntense) {
      fillCol = isDark ? 'rgba(56, 189, 248, 0.40)' : 'rgba(125, 211, 252, 0.42)';
      strokeCol = isDark ? '#38bdf8' : 'rgba(2, 132, 199, 0.82)';
      shadowCol = 'rgba(56, 189, 248, 0.25)';
    } else {
      fillCol = isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(186, 230, 253, 0.22)';
      strokeCol = isDark ? 'rgba(241, 245, 249, 0.85)' : '#475569';
    }
  }

  if (customOutlineColor) {
    strokeCol = customOutlineColor;
  }

  ctx.fillStyle = fillCol;
  ctx.fill();

  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = isIntense ? 1.4 : 1.25;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (isIntense && shadowCol !== 'transparent') {
    ctx.shadowColor = shadowCol;
    ctx.shadowBlur = 3;
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * Standalone flame icon: slightly larger, darker grey outline,
 * very pale soft pink inside when OFF, more intense vibrant pink/coral when ON/pressed.
 * (No box, no frame, no white background).
 */
function drawFlameIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  isDark: boolean,
  isOn: boolean,
  intensity?: FlameIntensity
): void {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.moveTo(0.5, -7.0);
  // Right convex curve going down
  ctx.bezierCurveTo(3.1, -3.2, 4.6, 0.5, 3.9, 3.5);
  ctx.bezierCurveTo(3.2, 5.9, 0.3, 7.0, -2.4, 5.9);
  // Bottom left curve
  ctx.bezierCurveTo(-4.6, 4.9, -5.0, 2.7, -3.9, 0.8);
  // Inward flick / notch on left
  ctx.bezierCurveTo(-2.8, -0.4, -1.5, 0.0, -1.9, 1.8);
  // Curving up to top tip
  ctx.bezierCurveTo(-2.2, -1.3, -1.1, -4.0, 0.5, -7.0);
  ctx.closePath();

  const isLow = intensity === 'low' || intensity === 'safety';
  const isHigh = intensity === 'high' || intensity === 'roaring';

  let fillCol: string;
  let strokeCol: string;
  let shadowCol = 'transparent';

  if (!isOn) {
    fillCol = isDark ? 'rgba(251, 113, 133, 0.22)' : 'rgba(254, 205, 211, 0.45)';
    strokeCol = isDark ? 'rgba(241, 245, 249, 0.85)' : '#475569';
  } else if (isLow) {
    fillCol = isDark ? 'rgba(251, 191, 36, 0.70)' : 'rgba(245, 158, 11, 0.65)';
    strokeCol = isDark ? '#fbbf24' : '#d97706';
    shadowCol = 'rgba(245, 158, 11, 0.45)';
  } else if (isHigh) {
    fillCol = isDark ? 'rgba(244, 63, 94, 0.85)' : 'rgba(225, 29, 72, 0.80)';
    strokeCol = isDark ? '#fb7185' : '#e11d48';
    shadowCol = 'rgba(225, 29, 72, 0.55)';
  } else {
    // Medium
    fillCol = isDark ? 'rgba(251, 113, 133, 0.70)' : 'rgba(244, 63, 94, 0.65)';
    strokeCol = isDark ? '#fb7185' : '#e11d48';
    shadowCol = 'rgba(244, 63, 94, 0.45)';
  }

  ctx.fillStyle = fillCol;
  ctx.fill();

  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = isOn ? 1.5 : 1.3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (isOn && shadowCol !== 'transparent') {
    ctx.shadowColor = shadowCol;
    ctx.shadowBlur = 4;
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * Standalone pencil icon: slightly larger, darker grey outline.
 * (No box, no frame, no white background).
 */
function drawPencilIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  isDark: boolean,
  customOutlineColor?: string
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4); // tilted 45 degrees
  ctx.beginPath();
  // Pencil body
  ctx.rect(-2.2, -4.2, 4.4, 6.8);
  // Pointed lead tip
  ctx.moveTo(-2.2, 2.6);
  ctx.lineTo(0, 6.2);
  ctx.lineTo(2.2, 2.6);
  // Eraser / ferrule division line
  ctx.moveTo(-2.2, -2.1);
  ctx.lineTo(2.2, -2.1);

  ctx.strokeStyle = customOutlineColor || (isDark ? 'rgba(241, 245, 249, 0.85)' : '#475569');
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

/**
 * Standalone Graph Action Icon (diagonal line with zig-zag trend curve 📈)
 * Placed above the pencil icon ("πανω απο μολυβο").
 */
function drawGraphIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  isDark: boolean,
  isActive: boolean,
  customOutlineColor?: string
): void {
  ctx.save();
  ctx.translate(cx, cy);

  if (isActive) {
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.28)' : 'rgba(99, 102, 241, 0.16)';
    ctx.fill();
  }

  // Diagonal line with zig-zag (📈 trendline graph)
  ctx.beginPath();
  ctx.moveTo(-5.5, 4.0);
  ctx.lineTo(-2.0, -0.5);
  ctx.lineTo(0.5, 2.2);
  ctx.lineTo(5.5, -4.5);

  const iconStroke =
    customOutlineColor ||
    (isActive
      ? isDark
        ? '#818cf8'
        : '#4f46e5'
      : isDark
      ? 'rgba(241, 245, 249, 0.85)'
      : '#475569');

  ctx.strokeStyle = iconStroke;
  ctx.lineWidth = isActive ? 1.5 : 1.35;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Small dot on apex
  ctx.beginPath();
  ctx.arc(5.5, -4.5, 1.1, 0, Math.PI * 2);
  ctx.fillStyle = iconStroke;
  ctx.fill();

  ctx.restore();
}

/**
 * Renders the 3 permanent discreet standalone icons (Droplet, Pencil, and Graph)
 * and the ephemeral 1.5s fade-out volume badge for containers.
 * NO outer frame boxes, NO white background!
 */
function renderContainerActionButtons(
  ctx: CanvasRenderingContext2D,
  objId: string | undefined,
  w: number,
  h: number,
  isDark: boolean,
  state?: HeatContainerState,
  isGraphActive?: boolean,
  isSubmerged?: boolean,
  containerType?: string,
  outerRimLocalY?: number | null,
  customOutlineColor?: string
): void {
  const { dropletX, dropletY, pencilX, pencilY, graphX, graphY, btnHalf, glassRightX } =
    getContainerActionButtonsLocalPos(w, h, isSubmerged, containerType, outerRimLocalY);

  const feedback = objId ? containerFillFeedbackMap.get(objId) : undefined;
  const isFilled = Boolean(state && state.volumeMl > 0);
  const isDropletIntense = isFilled || Boolean(feedback);
  const liquidType: LiquidType = state?.liquidType || 'water';

  const frameGrey = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(156, 163, 175, 0.68)';

  // 1. Standalone Droplet Icon (interior fill matches liquid contents; outline matches container outline)
  drawDropletIcon(ctx, dropletX, dropletY, isDark, isDropletIntense, liquidType, customOutlineColor);

  // 2. Standalone Pencil Icon (outline matches container outline)
  drawPencilIcon(ctx, pencilX, pencilY, isDark, customOutlineColor);

  // 3. Standalone Graph Icon (diagonal line with zig-zag curve above pencil; outline matches container outline)
  drawGraphIcon(ctx, graphX, graphY, isDark, Boolean(isGraphActive), customOutlineColor);

  // 3. Ephemeral 1.5s Fade-out Volume Feedback Badge
  if (objId && feedback) {
    const now = performance.now();
    const elapsed = now - feedback.startTime;
    const totalDuration = 1500;
    const fadeDuration = 450;

    if (elapsed >= totalDuration) {
      containerFillFeedbackMap.delete(objId);
    } else {
      let alpha = 1.0;
      if (elapsed > totalDuration - fadeDuration) {
        alpha = Math.max(0, (totalDuration - elapsed) / fadeDuration);
      }
      const floatUp = Math.min(5, (elapsed / totalDuration) * 5);

      ctx.save();
      ctx.globalAlpha = alpha;

      const badgeText = feedback.volumeMl > 0 ? `💧 ${feedback.volumeMl} ml` : '💧 Άδειο (0 ml)';

      ctx.font = 'bold 9.5px system-ui, sans-serif';
      const textMetrics = ctx.measureText(badgeText);
      const badgeW = textMetrics.width + 16;
      const badgeH = 19;
      let badgeCenterX = dropletX;
      const minCenterX = glassRightX + 4 + badgeW / 2;
      if (badgeCenterX < minCenterX) {
        badgeCenterX = minCenterX;
      }
      const badgeCenterY = isSubmerged
        ? graphY - btnHalf - badgeH / 2 - 4 - floatUp
        : pencilY - btnHalf - 12 - floatUp;

      // Shadow & pill container
      ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1.2;

      ctx.beginPath();
      ctx.roundRect(badgeCenterX - badgeW / 2, badgeCenterY - badgeH / 2, badgeW, badgeH, badgeH / 2);
      ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.94)' : 'rgba(255, 255, 255, 0.96)';
      ctx.fill();
      ctx.strokeStyle = feedback.volumeMl > 0 ? 'rgba(59, 130, 246, 0.65)' : frameGrey;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, badgeCenterX, badgeCenterY + 0.5);

      ctx.restore();
    }
  }
}

/**
 * Core physical drawing of beaker: liquid fill & outer glass lines.
 */
function drawBeakerPhysical(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  x: number,
  y: number,
  bw: number,
  bh: number,
  cornerR: number,
  botCurve: number,
  spoutW: number,
  beadH: number,
  state: HeatContainerState | undefined,
  liquidType: LiquidType,
  vol: number,
  liquidH: number,
  liquidTopY: number,
  strokeColor: string,
  isDark: boolean,
  objId?: string,
  objX?: number,
  objY?: number,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  isSubmergedPass: boolean = false
): void {
  const span = bw - 2 * cornerR;

  // 0. Subtle Borosilicate Glass Body Sheen (so even when empty or above the liquid, the vessel looks like real glass!)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - spoutW, y + 1.5);
  ctx.lineTo(x, y);
  ctx.lineTo(x + bw, y);
  ctx.arc(x + bw, y + beadH / 2, beadH / 2, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + bw, y + bh - cornerR);
  ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh + botCurve * 0.25);
  ctx.bezierCurveTo(
    x + bw - cornerR - span * 0.28,
    y + bh + botCurve * 1.25,
    x + cornerR + span * 0.28,
    y + bh + botCurve * 1.25,
    x + cornerR,
    y + bh + botCurve * 0.25
  );
  ctx.quadraticCurveTo(x, y + bh, x, y + bh - cornerR);
  ctx.lineTo(x, y + 13);
  ctx.lineTo(x - spoutW, y + 1.5);
  ctx.closePath();

  const glassBodyGrad = ctx.createLinearGradient(x, y, x + bw, y);
  if (isDark) {
    glassBodyGrad.addColorStop(0, 'rgba(148, 163, 184, 0.16)');
    glassBodyGrad.addColorStop(0.18, 'rgba(203, 213, 225, 0.10)');
    glassBodyGrad.addColorStop(0.55, 'rgba(148, 163, 184, 0.06)');
    glassBodyGrad.addColorStop(0.88, 'rgba(226, 232, 240, 0.14)');
    glassBodyGrad.addColorStop(1, 'rgba(148, 163, 184, 0.18)');
  } else {
    glassBodyGrad.addColorStop(0, 'rgba(226, 232, 240, 0.36)');
    glassBodyGrad.addColorStop(0.16, 'rgba(255, 255, 255, 0.46)');
    glassBodyGrad.addColorStop(0.52, 'rgba(241, 245, 249, 0.26)');
    glassBodyGrad.addColorStop(0.86, 'rgba(255, 255, 255, 0.48)');
    glassBodyGrad.addColorStop(1, 'rgba(226, 232, 240, 0.34)');
  }
  ctx.fillStyle = glassBodyGrad;
  ctx.fill();
  ctx.restore();

  // Draw Liquid Fill if volume > 0 - Dynamic wave/slosh surface + perfectly filling curved base
  if (vol > 0 && liquidH > 2) {
    const surface = getLiquidSurfaceProfile(
      objId,
      objX ?? x,
      objY ?? y,
      x,
      bw,
      liquidTopY,
      liquidH,
      state?.temperature ?? 20,
      state?.isBoiling ?? false,
      state?.boilingIntensity ?? 0,
      performance.now()
    );

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(surface[0].x, surface[0].y);
    for (let i = 1; i < surface.length; i++) {
      ctx.lineTo(surface[i].x, surface[i].y);
    }
    ctx.lineTo(x + bw, y + bh - cornerR);
    ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh + botCurve * 0.25);
    ctx.bezierCurveTo(
      x + bw - cornerR - span * 0.28,
      y + bh + botCurve * 1.25,
      x + cornerR + span * 0.28,
      y + bh + botCurve * 1.25,
      x + cornerR,
      y + bh + botCurve * 0.25
    );
    ctx.quadraticCurveTo(x, y + bh, x, y + bh - cornerR);
    ctx.lineTo(surface[0].x, surface[0].y);
    ctx.closePath();
    ctx.clip();

    renderLiquidBody(ctx, liquidType, x, liquidTopY, bw, liquidH, y + bh + botCurve, 0, x - 4, x + bw + 4, surface);

    // Staged animated thermal convection, rising bubbles & billowing steam
    if (layer !== 'apparatus' && !isSubmergedPass) {
      const temp = state?.temperature ?? 20;
      const isBoil = Boolean(state?.isBoiling || temp >= 98);
      const intensity = state?.boilingIntensity ?? (temp >= 98 ? 0.85 : 0);
      const nowMs = performance.now();

      // 1. Thermal Convection Currents (bottom to top, staged from 50°C with graded motion)
      if (temp >= 50) {
        renderThermalConvection(ctx, x, liquidTopY, bw, liquidH, y + bh + botCurve, temp, liquidType, nowMs);
      }

      // 2. Rising Bubbles (starts very small at 80°C, growing towards 90°C+)
      if (temp >= 80 || isBoil) {
        renderBoilingBubbles(ctx, x, liquidTopY, bw, liquidH, temp, isBoil, intensity, nowMs);
      }

      // 3. Billowing Steam (rising above the liquid into the air - only on emergent pass)
      if (temp >= 58 || isBoil) {
        renderSteam(ctx, x + bw / 2, liquidTopY - 4, bw, temp, isBoil, intensity, nowMs);
      }
    } else if (isSubmergedPass && layer !== 'apparatus') {
      const temp = state?.temperature ?? 20;
      const isBoil = Boolean(state?.isBoiling || temp >= 98);
      const intensity = state?.boilingIntensity ?? (temp >= 98 ? 0.85 : 0);
      const nowMs = performance.now();
      if (temp >= 50) {
        renderThermalConvection(ctx, x, liquidTopY, bw, liquidH, y + bh + botCurve, temp, liquidType, nowMs);
      }
      if (temp >= 80 || isBoil) {
        renderBoilingBubbles(ctx, x, liquidTopY, bw, liquidH, temp, isBoil, intensity, nowMs);
      }
    }

    ctx.restore();
  }

  // Outer Glass Beaker Path
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isSubmergedPass ? 1.6 : 2.0;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  // Spout top tip
  ctx.moveTo(x - spoutW, y + 1.5);
  // Spout top edge blending into horizontal rim
  ctx.lineTo(x, y);
  // Top horizontal rim
  ctx.lineTo(x + bw, y);
  // Rolled right rim bead corner
  ctx.arc(x + bw, y + beadH / 2, beadH / 2, -Math.PI / 2, Math.PI / 2);
  // Right vertical wall
  ctx.lineTo(x + bw, y + bh - cornerR);
  // Bottom right rounded corner
  ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh + botCurve * 0.25);
  // Subtle 2.5D downward curved base (matching tripod wire gauze ring curvature)
  ctx.bezierCurveTo(
    x + bw - cornerR - span * 0.28,
    y + bh + botCurve * 1.25,
    x + cornerR + span * 0.28,
    y + bh + botCurve * 1.25,
    x + cornerR,
    y + bh + botCurve * 0.25
  );
  // Bottom left rounded corner
  ctx.quadraticCurveTo(x, y + bh, x, y + bh - cornerR);
  // Left vertical wall up to spout start
  ctx.lineTo(x, y + 13);
  // Spout lower diagonal edge
  ctx.lineTo(x - spoutW, y + 1.5);
  ctx.stroke();

  // Rolled glass lip bead line (horizontal line right beneath top rim - only on emergent pass)
  if (!isSubmergedPass) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y + beadH);
    ctx.lineTo(x + bw, y + beadH);
    ctx.strokeStyle = strokeColor;
    ctx.globalAlpha *= 0.42;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // Vertical glass reflection sheen strip on right side
    const reflectGrad = ctx.createLinearGradient(x + bw - 12, y, x + bw - 3, y);
    reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    reflectGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = reflectGrad;
    ctx.fillRect(x + bw - 12, y + beadH + 2, 9, bh - beadH - cornerR - 2);
  }
}

/**
 * 3. Borosilicate Glass Beaker - Plain clean glass (NO measurement lines) matching the hand-drawn sketch
 */
function renderBeaker(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string,
  objId?: string,
  objX?: number,
  objY?: number,
  parentBasin?: HeatObject,
  isGraphActive?: boolean,
  letter?: string,
  color?: string,
  _allObjects?: HeatObject[]
): void {
  const strokeColor = customColor || (isDark ? '#f8fafc' : '#111827');
  const pad = 8;
  const bw = w - pad * 2;
  const bh = h - pad * 2 - 6;
  const x = pad;
  const y = pad + 4;
  const beadH = 3.5;
  const cornerR = 9;
  const spoutW = 12;
  // Subtle 2.5D downward curve for container bottom to match tripod base perspective
  const botCurve = Math.round(bw * 0.055);

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 500;
  const liquidType = state?.liquidType ?? 'water';

  // Headspace gap at 100% capacity: reduced to ~40% of previous gap so liquid is much closer to the rim
  const fullHeadspace = (0.14 * bh + 8.6) * 0.40;
  const fillRatio = Math.max(0, Math.min(1.0, vol / cap));
  const liquidH = Math.max(0, (bh - fullHeadspace) * fillRatio);
  const liquidTopY = y + bh - liquidH;

  // Submerged calculation if placed inside another vessel / water bath
  const grandParentBasin =
    parentBasin && _allObjects ? findParentVessel(parentBasin, _allObjects) : undefined;
  const isDoubleNested = Boolean(grandParentBasin);
  let basinWaterLocalY: number | null = null;
  let isSubmerged = false;
  if (parentBasin && parentBasin.containerState && parentBasin.containerState.volumeMl > 0) {
    const bcs = parentBasin.containerState;
    const bFillRatio = Math.max(0, Math.min(1.0, bcs.volumeMl / bcs.capacityMl));
    const bPad = 8;
    const bBh = parentBasin.height - bPad * 2 - 6;
    const isBasin = parentBasin.type === 'wide-basin';
    const bHeadspace = isBasin ? (0.15 * bBh + 8.5) * 0.40 : (0.14 * bBh + 8.6) * 0.40;
    const bLiquidH = Math.max(0, (bBh - bHeadspace) * bFillRatio);
    const bLiquidTopY = bPad + 4 + bBh - bLiquidH;
    const basinWaterGlobalY = parentBasin.y + bLiquidTopY;
    basinWaterLocalY = basinWaterGlobalY - (objY ?? 0);
    isSubmerged = basinWaterLocalY < y + bh + botCurve;
  } else if (parentBasin) {
    const bPad = 8;
    const basinRimGlobalY = parentBasin.y + bPad + 4;
    const basinRimLocalY = basinRimGlobalY - (objY ?? 0);
    if (basinRimLocalY < y + bh + botCurve) {
      isSubmerged = true;
    }
  }

  // 1. Physical Beaker & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    if (!isSubmerged) {
      // Normal Sharp Render
      drawBeakerPhysical(
        ctx, w, h, x, y, bw, bh, cornerR, botCurve, spoutW, beadH,
        state, liquidType, vol, liquidH, liquidTopY, strokeColor, isDark,
        objId, objX, objY, layer, false
      );
    } else {
      const bcs = parentBasin?.containerState;
      const mySlosh = objId ? containerSloshMap.get(objId) : undefined;
      const pSlosh = parentBasin?.id ? containerSloshMap.get(parentBasin.id) : undefined;
      const isAnim =
        (state?.temperature ?? 20) > 35 ||
        Boolean(state?.isBoiling) ||
        (bcs?.temperature ?? 20) > 35 ||
        Boolean(bcs?.isBoiling) ||
        Boolean(mySlosh && (Math.abs(mySlosh.sloshAngle) > 0.001 || Math.abs(mySlosh.sloshAngularVel) > 0.003)) ||
        Boolean(pSlosh && (Math.abs(pSlosh.sloshAngle) > 0.001 || Math.abs(pSlosh.sloshAngularVel) > 0.003));
      const animTick = isAnim ? Math.floor(performance.now() / 75) : 0;
      const cacheId = `beaker-${objId || 'anon'}-${layer}`;
      const cacheKey = `${w}|${h}|${Math.round(objX ?? 0)}|${Math.round(objY ?? 0)}|${Math.round(vol)}|${liquidType}|${strokeColor}|${isDark ? 1 : 0}|${isDoubleNested ? 1 : 0}|${parentBasin?.id || ''}|${Math.round(parentBasin?.x ?? 0)}|${Math.round(parentBasin?.y ?? 0)}|${parentBasin?.width ?? 0}|${parentBasin?.height ?? 0}|${Math.round(bcs?.volumeMl ?? 0)}|${bcs?.liquidType || ''}|${animTick}`;

      renderWithOffscreenBlurCache(ctx, cacheId, cacheKey, w, h, 30, 35, (offCtx) => {
        if (basinWaterLocalY === null) {
          // Nested inside an EMPTY outer container:
          // Above outer container rim -> 100% sharp; Below outer container rim -> softened behind outer glass wall!
          const bPad = 8;
          const basinRimLocalY = parentBasin!.y + bPad + 4 - (objY ?? 0);
          const splitY = Math.max(y, basinRimLocalY);

          if (splitY > y) {
            offCtx.save();
            offCtx.beginPath();
            offCtx.rect(-30, -30, w + 60, splitY + 30);
            offCtx.clip();
            drawBeakerPhysical(
              offCtx, w, h, x, y, bw, bh, cornerR, botCurve, spoutW, beadH,
              state, liquidType, vol, liquidH, liquidTopY, strokeColor, isDark,
              objId, objX, objY, layer, false
            );
            offCtx.restore();
          }

          offCtx.save();
          offCtx.beginPath();
          offCtx.rect(-30, splitY, w + 60, h - splitY + 40);
          offCtx.clip();
          offCtx.globalAlpha = isDoubleNested ? 0.38 : 0.58;
          offCtx.filter = isDoubleNested ? 'blur(3.2px)' : 'blur(2.0px)';
          drawBeakerPhysical(
            offCtx, w, h, x, y, bw, bh, cornerR, botCurve, spoutW, beadH,
            state, liquidType, vol, liquidH, liquidTopY, strokeColor, isDark,
            objId, objX, objY, layer, true
          );
          offCtx.restore();
        } else {
          const bPad = 8;
          const basinRimLocalY = parentBasin!.y + bPad + 4 - (objY ?? 0);
          const rimSplitY = Math.max(y, basinRimLocalY);
          const surfaceY = Math.max(rimSplitY, basinWaterLocalY);
          const bcsNonNull = parentBasin!.containerState!;
          const bBw = parentBasin!.width - bPad * 2;
          const bBh = parentBasin!.height - bPad * 2 - 6;
          const isBasin = parentBasin!.type === 'wide-basin';
          const bHeadspace = isBasin ? (0.15 * bBh + 8.5) * 0.40 : (0.14 * bBh + 8.6) * 0.40;
          const bFillRatio = Math.max(0, Math.min(1.0, bcsNonNull.volumeMl / bcsNonNull.capacityMl));
          const bLiquidH = Math.max(0, (bBh - bHeadspace) * bFillRatio);
          const bLiquidTopY = bPad + 4 + bBh - bLiquidH;
          const basinSurface = getLiquidSurfaceProfile(
            parentBasin!.id,
            parentBasin!.x,
            parentBasin!.y,
            bPad,
            bBw,
            bLiquidTopY,
            bLiquidH,
            bcsNonNull.temperature ?? 20,
            bcsNonNull.isBoiling ?? false,
            bcsNonNull.boilingIntensity ?? 0,
            performance.now()
          );
          const dxBasin = parentBasin!.x - (objX ?? 0);
          const dyBasin = parentBasin!.y - (objY ?? 0);

          // PASS 1: Emergent Part above the outer container's rim (in open air: from top down to rimSplitY) - 100% sharp and crisp
          if (rimSplitY > y) {
            offCtx.save();
            offCtx.beginPath();
            offCtx.rect(-30, -30, w + 60, rimSplitY + 30);
            offCtx.clip();
            drawBeakerPhysical(
              offCtx, w, h, x, y, bw, bh, cornerR, botCurve, spoutW, beadH,
              state, liquidType, vol, liquidH, liquidTopY, strokeColor, isDark,
              objId, objX, objY, layer, false
            );
            offCtx.restore();
          }

          // PASS 1.5: Inside the outer container's empty glass region (from rimSplitY down to outer wavy liquid surface) - glass blur
          if (surfaceY > rimSplitY - 4) {
            offCtx.save();
            offCtx.beginPath();
            if (basinSurface.length > 1) {
              offCtx.moveTo(-30, rimSplitY);
              offCtx.lineTo(w + 30, rimSplitY);
              offCtx.lineTo(w + 30, basinSurface[basinSurface.length - 1].y + dyBasin);
              for (let i = basinSurface.length - 1; i >= 0; i--) {
                offCtx.lineTo(basinSurface[i].x + dxBasin, basinSurface[i].y + dyBasin);
              }
              offCtx.lineTo(-30, basinSurface[0].y + dyBasin);
              offCtx.closePath();
            } else {
              offCtx.rect(-15, rimSplitY, w + 30, Math.max(0, surfaceY - rimSplitY));
            }
            offCtx.clip();
            offCtx.globalAlpha = isDoubleNested ? 0.42 : 0.62;
            offCtx.filter = isDoubleNested ? 'blur(2.8px)' : 'blur(1.8px)';
            drawBeakerPhysical(
              offCtx, w, h, x, y, bw, bh, cornerR, botCurve, spoutW, beadH,
              state, liquidType, vol, liquidH, liquidTopY, strokeColor, isDark,
              objId, objX, objY, layer, true
            );
            offCtx.restore();
          }

          // PASS 2: Submerged Part (inside liquid: from outer wavy surface downwards) - diffused blur & softened contrast
          offCtx.save();
          offCtx.beginPath();
          if (basinSurface.length > 1) {
            offCtx.moveTo(-30, basinSurface[0].y + dyBasin);
            for (let i = 0; i < basinSurface.length; i++) {
              offCtx.lineTo(basinSurface[i].x + dxBasin, basinSurface[i].y + dyBasin);
            }
            offCtx.lineTo(w + 30, basinSurface[basinSurface.length - 1].y + dyBasin);
            offCtx.lineTo(w + 30, h + 40);
            offCtx.lineTo(-30, h + 40);
            offCtx.closePath();
          } else {
            offCtx.rect(-15, surfaceY, w + 30, h - surfaceY + 30);
          }
          offCtx.clip();

          if (bcsNonNull.liquidType === 'milk') {
            offCtx.globalAlpha = isDoubleNested ? 0.12 : 0.20;
            offCtx.filter = isDoubleNested ? 'blur(6.5px)' : 'blur(4.5px)';
          } else if (bcsNonNull.liquidType === 'oil') {
            offCtx.globalAlpha = isDoubleNested ? 0.18 : 0.28;
            offCtx.filter = isDoubleNested ? 'blur(5.6px)' : 'blur(3.8px)';
          } else {
            offCtx.globalAlpha = isDoubleNested ? 0.28 : 0.48;
            offCtx.filter = isDoubleNested ? 'blur(4.8px)' : 'blur(3.0px)';
          }

          drawBeakerPhysical(
            offCtx, w, h, x, y, bw, bh, cornerR, botCurve, spoutW, beadH,
            state, liquidType, vol, liquidH, liquidTopY, strokeColor, isDark,
            objId, objX, objY, layer, true
          );
          offCtx.restore();
        }
      });
    }

    ctx.restore();
  }

  // 2. Permanent Discreet Action Buttons (Droplet, Pencil & Graph)
  // Hidden when the container's selection frame is active so the right-side orange resize handle is unobstructed!
  if (layer === 'all' || layer === 'ui') {
    if (!isSelected) {
      const outerRimLocalY = computeEffectiveOuterRimLocalY(
        objX ?? 0,
        objY ?? 0,
        w,
        'beaker',
        parentBasin,
        _allObjects
      );
      renderContainerActionButtons(
        ctx,
        objId,
        w,
        h,
        isDark,
        state,
        isGraphActive,
        isSubmerged,
        'beaker',
        outerRimLocalY,
        customColor
      );
    }
    if (letter && color) {
      renderContainerLetterBadge(
        ctx,
        letter,
        color,
        x + 16,
        y + bh - 10,
        isDark,
        Boolean(parentBasin),
        isSubmerged,
        parentBasin?.containerState?.liquidType,
        isDoubleNested
      );
    }
  }
}

/**
 * 4. Wide Basin / Water Bath (Υδατόλουτρο / Πλατιά Λεκάνη)
 * Clean straight rectangular glass elevation with rolled bead rim and spout,
 * identical to the beaker in style, in a wide low-profile basin aspect ratio.
 */
function renderWideBasin(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string,
  objId?: string,
  objX?: number,
  objY?: number,
  isGraphActive?: boolean,
  letter?: string,
  color?: string
): void {
  const strokeColor = customColor || (isDark ? '#f8fafc' : '#111827');
  const pad = 8;
  const bw = w - pad * 2;
  const bh = h - pad * 2 - 6;
  const x = pad;
  const y = pad + 4;
  const beadH = 3.5;
  const spoutW = 10;
  const cornerR = 12;
  // Subtle 2.5D downward curve for container bottom to match tripod base perspective
  const botCurve = Math.round(bw * 0.035);

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 800;
  const liquidType = state?.liquidType ?? 'water';

  // Headspace gap at 100% capacity: reduced to ~40% of previous gap so liquid is much closer to the rim
  const fullHeadspace = (0.15 * bh + 8.5) * 0.40;
  const fillRatio = Math.max(0, Math.min(1.0, vol / cap));
  const liquidH = Math.max(0, (bh - fullHeadspace) * fillRatio);
  const liquidTopY = y + bh - liquidH;

  // 1. Physical Basin Sketch & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    const span = bw - 2 * cornerR;

    // 0. Subtle Borosilicate Glass Body Sheen (so even when empty or above the liquid, the basin looks like real glass!)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - spoutW, y + 1.5);
    ctx.lineTo(x, y);
    ctx.lineTo(x + bw, y);
    ctx.arc(x + bw, y + beadH / 2, beadH / 2, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + bw, y + bh - cornerR);
    ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh + botCurve * 0.25);
    ctx.bezierCurveTo(
      x + bw - cornerR - span * 0.28,
      y + bh + botCurve * 1.25,
      x + cornerR + span * 0.28,
      y + bh + botCurve * 1.25,
      x + cornerR,
      y + bh + botCurve * 0.25
    );
    ctx.quadraticCurveTo(x, y + bh, x, y + bh - cornerR);
    ctx.lineTo(x, y + 13);
    ctx.lineTo(x - spoutW, y + 1.5);
    ctx.closePath();

    const glassBodyGrad = ctx.createLinearGradient(x, y, x + bw, y);
    if (isDark) {
      glassBodyGrad.addColorStop(0, 'rgba(148, 163, 184, 0.16)');
      glassBodyGrad.addColorStop(0.18, 'rgba(203, 213, 225, 0.10)');
      glassBodyGrad.addColorStop(0.55, 'rgba(148, 163, 184, 0.06)');
      glassBodyGrad.addColorStop(0.88, 'rgba(226, 232, 240, 0.14)');
      glassBodyGrad.addColorStop(1, 'rgba(148, 163, 184, 0.18)');
    } else {
      glassBodyGrad.addColorStop(0, 'rgba(226, 232, 240, 0.36)');
      glassBodyGrad.addColorStop(0.16, 'rgba(255, 255, 255, 0.46)');
      glassBodyGrad.addColorStop(0.52, 'rgba(241, 245, 249, 0.26)');
      glassBodyGrad.addColorStop(0.86, 'rgba(255, 255, 255, 0.48)');
      glassBodyGrad.addColorStop(1, 'rgba(226, 232, 240, 0.34)');
    }
    ctx.fillStyle = glassBodyGrad;
    ctx.fill();
    ctx.restore();

    // Liquid Fill - Dynamic wave/slosh surface + rounded base (fills 100% with no gaps)
    if (vol > 0 && liquidH > 2) {
      const surface = getLiquidSurfaceProfile(
        objId,
        objX ?? x,
        objY ?? y,
        x,
        bw,
        liquidTopY,
        liquidH,
        state?.temperature ?? 20,
        state?.isBoiling ?? false,
        state?.boilingIntensity ?? 0,
        performance.now()
      );

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(surface[0].x, surface[0].y);
      for (let i = 1; i < surface.length; i++) {
        ctx.lineTo(surface[i].x, surface[i].y);
      }
      ctx.lineTo(x + bw, y + bh - cornerR);
      ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh + botCurve * 0.25);
      ctx.bezierCurveTo(
        x + bw - cornerR - span * 0.28,
        y + bh + botCurve * 1.25,
        x + cornerR + span * 0.28,
        y + bh + botCurve * 1.25,
        x + cornerR,
        y + bh + botCurve * 0.25
      );
      ctx.quadraticCurveTo(x, y + bh, x, y + bh - cornerR);
      ctx.lineTo(surface[0].x, surface[0].y);
      ctx.closePath();
      ctx.clip();

      renderLiquidBody(ctx, liquidType, x, liquidTopY, bw, liquidH, y + bh + botCurve, 0, x - 4, x + bw + 4, surface);

      // Staged animated thermal convection, rising bubbles & billowing steam (from bottom to top)
      if (layer !== 'apparatus') {
        const temp = state?.temperature ?? 20;
        const isBoil = Boolean(state?.isBoiling || temp >= 98);
        const intensity = state?.boilingIntensity ?? (temp >= 98 ? 0.85 : 0);
        const nowMs = performance.now();

        // 1. Thermal Convection Currents (bottom to top, staged from 50°C with graded motion)
        if (temp >= 50) {
          renderThermalConvection(ctx, x, liquidTopY, bw, liquidH, y + bh + botCurve, temp, liquidType, nowMs);
        }

        // 2. Rising Bubbles (starts very small at 80°C, growing towards 90°C+)
        if (temp >= 80 || isBoil) {
          renderBoilingBubbles(ctx, x, liquidTopY, bw, liquidH, temp, isBoil, intensity, nowMs);
        }

        // 3. Billowing Steam (rising above the liquid into the air)
        if (temp >= 58 || isBoil) {
          renderSteam(ctx, x + bw / 2, liquidTopY - 4, bw, temp, isBoil, intensity, nowMs);
        }
      }
      ctx.restore();
    }

    // Outer Glass Basin Path (clean rectangular elevation with rolled bead rim and left spout matching beaker)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Spout top tip
    ctx.moveTo(x - spoutW, y + 1.5);
    // Spout top edge blending into horizontal rim
    ctx.lineTo(x, y);
    // Top horizontal rim
    ctx.lineTo(x + bw, y);
    // Rolled right rim bead corner
    ctx.arc(x + bw, y + beadH / 2, beadH / 2, -Math.PI / 2, Math.PI / 2);
    // Right vertical wall
    ctx.lineTo(x + bw, y + bh - cornerR);
    // Bottom right rounded corner
    ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh + botCurve * 0.25);
    // Subtle 2.5D downward curved base (matching tripod wire gauze ring curvature)
    ctx.bezierCurveTo(
      x + bw - cornerR - span * 0.28,
      y + bh + botCurve * 1.25,
      x + cornerR + span * 0.28,
      y + bh + botCurve * 1.25,
      x + cornerR,
      y + bh + botCurve * 0.25
    );
    // Bottom left rounded corner
    ctx.quadraticCurveTo(x, y + bh, x, y + bh - cornerR);
    // Left vertical wall up to spout start
    ctx.lineTo(x, y + 13);
    // Spout lower diagonal edge
    ctx.lineTo(x - spoutW, y + 1.5);
    ctx.stroke();

    // Rolled glass lip bead line (horizontal line right beneath top rim)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y + beadH);
    ctx.lineTo(x + bw, y + beadH);
    ctx.strokeStyle = strokeColor;
    ctx.globalAlpha *= 0.42;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // Vertical glass reflection sheen strip on right side
    const reflectGrad = ctx.createLinearGradient(x + bw - 14, y, x + bw - 4, y);
    reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    reflectGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = reflectGrad;
    ctx.fillRect(x + bw - 14, y + beadH + 2, 10, bh - beadH - cornerR - 2);

    ctx.restore();
  }

  // 2. Permanent Discreet Action Buttons (Droplet, Pencil & Graph) at bottom-right
  // Hidden when the container's selection frame is active so the right-side orange resize handle is unobstructed!
  if (layer === 'all' || layer === 'ui') {
    if (!isSelected) {
      renderContainerActionButtons(
        ctx,
        objId,
        w,
        h,
        isDark,
        state,
        isGraphActive,
        false,
        'wide-basin',
        null,
        customColor
      );
    }
    if (letter && color) {
      renderContainerLetterBadge(ctx, letter, color, x + 16, y + bh - 10, isDark);
    }
  }
}

/**
 * Core physical drawing of Erlenmeyer flask: liquid fill & outer conical glass lines.
 */
function drawFlaskPhysical(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  x: number,
  y: number,
  cx: number,
  neckW: number,
  neckH: number,
  collarH: number,
  collarExt: number,
  cornerR: number,
  baseHalfW: number,
  botCurve: number,
  bh: number,
  state: HeatContainerState | undefined,
  liquidType: LiquidType,
  vol: number,
  liquidH: number,
  liquidTopY: number,
  strokeColor: string,
  objId?: string,
  objX?: number,
  objY?: number,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  isSubmergedPass: boolean = false
): void {
  const coneTopY = y + neckH;
  const coneBotY = y + bh - cornerR;
  const isAboveNeck = liquidTopY < coneTopY;
  const t = isAboveNeck ? 0 : Math.max(0, Math.min(1, (liquidTopY - coneTopY) / Math.max(1, coneBotY - coneTopY)));
  const surfaceHalfW = isAboveNeck ? neckW / 2 : (neckW / 2) + t * (baseHalfW - neckW / 2);
  const span = baseHalfW * 2 - 2 * cornerR;

  // 0. Subtle Borosilicate Glass Body Sheen (so even when empty or above the liquid, the flask looks like real glass!)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx + neckW / 2, y + collarH);
  ctx.lineTo(cx + neckW / 2, y + neckH);
  ctx.lineTo(cx + baseHalfW, y + bh - cornerR);
  ctx.quadraticCurveTo(cx + baseHalfW, y + bh, cx + baseHalfW - cornerR, y + bh + botCurve * 0.25);
  ctx.bezierCurveTo(
    cx + baseHalfW - cornerR - span * 0.28,
    y + bh + botCurve * 1.25,
    cx - baseHalfW + cornerR + span * 0.28,
    y + bh + botCurve * 1.25,
    cx - baseHalfW + cornerR,
    y + bh + botCurve * 0.25
  );
  ctx.quadraticCurveTo(cx - baseHalfW, y + bh, cx - baseHalfW, y + bh - cornerR);
  ctx.lineTo(cx - neckW / 2, y + neckH);
  ctx.lineTo(cx - neckW / 2, y + collarH);
  ctx.closePath();

  const glassBodyGrad = ctx.createLinearGradient(cx - baseHalfW, y, cx + baseHalfW, y);
  glassBodyGrad.addColorStop(0, 'rgba(226, 232, 240, 0.34)');
  glassBodyGrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.44)');
  glassBodyGrad.addColorStop(0.52, 'rgba(241, 245, 249, 0.24)');
  glassBodyGrad.addColorStop(0.86, 'rgba(255, 255, 255, 0.46)');
  glassBodyGrad.addColorStop(1, 'rgba(226, 232, 240, 0.32)');
  ctx.fillStyle = glassBodyGrad;
  ctx.fill();
  ctx.restore();

  // Liquid Fill - Dynamic wave/slosh surface + smooth conical base
  if (vol > 0 && liquidH > 2) {
    const surface = getLiquidSurfaceProfile(
      objId,
      objX ?? cx,
      objY ?? y,
      cx - surfaceHalfW,
      surfaceHalfW * 2,
      liquidTopY,
      liquidH,
      state?.temperature ?? 20,
      state?.isBoiling ?? false,
      state?.boilingIntensity ?? 0,
      performance.now()
    );

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(surface[0].x, surface[0].y);
    for (let i = 1; i < surface.length; i++) {
      ctx.lineTo(surface[i].x, surface[i].y);
    }
    if (isAboveNeck) {
      ctx.lineTo(cx + neckW / 2, coneTopY);
    }
    ctx.lineTo(cx + baseHalfW, coneBotY);
    ctx.quadraticCurveTo(cx + baseHalfW, y + bh, cx + baseHalfW - cornerR, y + bh + botCurve * 0.25);
    ctx.bezierCurveTo(
      cx + baseHalfW - cornerR - span * 0.28,
      y + bh + botCurve * 1.25,
      cx - baseHalfW + cornerR + span * 0.28,
      y + bh + botCurve * 1.25,
      cx - baseHalfW + cornerR,
      y + bh + botCurve * 0.25
    );
    ctx.quadraticCurveTo(cx - baseHalfW, y + bh, cx - baseHalfW, coneBotY);
    if (isAboveNeck) {
      ctx.lineTo(cx - neckW / 2, coneTopY);
    }
    ctx.lineTo(surface[0].x, surface[0].y);
    ctx.closePath();
    ctx.clip();

    renderLiquidBody(
      ctx,
      liquidType,
      cx - surfaceHalfW,
      liquidTopY,
      surfaceHalfW * 2,
      liquidH,
      y + bh + botCurve,
      0,
      cx - baseHalfW - 4,
      cx + baseHalfW + 4,
      surface
    );

    // Staged animated thermal convection, rising bubbles & billowing steam
    if (layer !== 'apparatus' && !isSubmergedPass) {
      const temp = state?.temperature ?? 20;
      const isBoil = Boolean(state?.isBoiling || temp >= 98);
      const intensity = state?.boilingIntensity ?? (temp >= 98 ? 0.85 : 0);
      const nowMs = performance.now();

      // 1. Thermal Convection Currents (bottom to top, staged from 50°C with graded motion)
      if (temp >= 50) {
        renderThermalConvection(
          ctx,
          cx - surfaceHalfW,
          liquidTopY,
          surfaceHalfW * 2,
          liquidH,
          y + bh + botCurve,
          temp,
          liquidType,
          nowMs
        );
      }

      // 2. Rising Bubbles (starts very small at 80°C, growing towards 90°C+)
      if (temp >= 80 || isBoil) {
        renderBoilingBubbles(
          ctx,
          cx - surfaceHalfW * 0.85,
          liquidTopY,
          surfaceHalfW * 1.7,
          liquidH,
          temp,
          isBoil,
          intensity,
          nowMs
        );
      }

      // 3. Billowing Steam (rising above the liquid into the air - only emergent pass)
      if (temp >= 58 || isBoil) {
        renderSteam(ctx, cx, y - 4, neckW, temp, isBoil, intensity, nowMs);
      }
    } else if (isSubmergedPass && layer !== 'apparatus') {
      const temp = state?.temperature ?? 20;
      const isBoil = Boolean(state?.isBoiling || temp >= 98);
      const intensity = state?.boilingIntensity ?? (temp >= 98 ? 0.85 : 0);
      const nowMs = performance.now();
      if (temp >= 50) {
        renderThermalConvection(
          ctx,
          cx - surfaceHalfW,
          liquidTopY,
          surfaceHalfW * 2,
          liquidH,
          y + bh + botCurve,
          temp,
          liquidType,
          nowMs
        );
      }
      if (temp >= 80 || isBoil) {
        renderBoilingBubbles(
          ctx,
          cx - surfaceHalfW * 0.85,
          liquidTopY,
          surfaceHalfW * 1.7,
          liquidH,
          temp,
          isBoil,
          intensity,
          nowMs
        );
      }
    }
    ctx.restore();
  }

  // Outer Flask Line-Art
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isSubmergedPass ? 1.6 : 2.0;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const collarLeft = cx - neckW / 2 - collarExt;
  const collarRight = cx + neckW / 2 + collarExt;

  // Body & Neck Outline
  ctx.beginPath();
  // Neck right wall
  ctx.moveTo(cx + neckW / 2, y + collarH);
  ctx.lineTo(cx + neckW / 2, y + neckH);
  // Conical right wall
  ctx.lineTo(cx + baseHalfW, y + bh - cornerR);
  // Bottom right corner
  ctx.quadraticCurveTo(cx + baseHalfW, y + bh, cx + baseHalfW - cornerR, y + bh + botCurve * 0.25);
  // Subtle 2.5D downward curved base
  ctx.bezierCurveTo(
    cx + baseHalfW - cornerR - span * 0.28,
    y + bh + botCurve * 1.25,
    cx - baseHalfW + cornerR + span * 0.28,
    y + bh + botCurve * 1.25,
    cx - baseHalfW + cornerR,
    y + bh + botCurve * 0.25
  );
  // Bottom left corner
  ctx.quadraticCurveTo(cx - baseHalfW, y + bh, cx - baseHalfW, y + bh - cornerR);
  // Conical left wall
  ctx.lineTo(cx - neckW / 2, y + neckH);
  // Neck left wall
  ctx.lineTo(cx - neckW / 2, y + collarH);
  ctx.stroke();

  // Rolled Glass Mouth Collar / Bead (only emergent pass)
  if (!isSubmergedPass) {
    ctx.beginPath();
    ctx.roundRect(collarLeft, y, collarRight - collarLeft, collarH, collarH / 2);
    ctx.stroke();
  }
}

/**
 * 5. Erlenmeyer Flask (Κωνική Φιάλη) - Plain clean glass (NO measurement lines)
 */
function renderFlask(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string,
  objId?: string,
  objX?: number,
  objY?: number,
  parentBasin?: HeatObject,
  isGraphActive?: boolean,
  letter?: string,
  color?: string,
  _allObjects?: HeatObject[]
): void {
  const strokeColor = customColor || (isDark ? '#f8fafc' : '#111827');
  const pad = 8;
  const bw = w - pad * 2;
  const bh = h - pad * 2 - 6;
  const x = pad;
  const y = pad + 4;
  const cx = x + bw / 2;
  const neckW = bw * 0.30;
  const neckH = bh * 0.36;
  const collarH = 4.5;
  const collarExt = 3.5;
  const cornerR = 9;
  const baseHalfW = bw / 2;
  // Subtle 2.5D downward curve for container bottom to match tripod base perspective
  const botCurve = Math.round(bw * 0.055);

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 500;
  const liquidType = state?.liquidType ?? 'water';

  // Headspace gap at 100% capacity: reduced to ~40% of previous gap so liquid is much closer to the rim
  const fullHeadspace = (0.14 * bh + 8.6) * 0.40;
  const fillRatio = Math.max(0, Math.min(1.0, vol / cap));
  const liquidH = Math.max(0, (bh - fullHeadspace) * fillRatio);
  const liquidTopY = y + bh - liquidH;

  // Submerged calculation if placed inside another vessel / water bath
  const grandParentBasin =
    parentBasin && _allObjects ? findParentVessel(parentBasin, _allObjects) : undefined;
  const isDoubleNested = Boolean(grandParentBasin);
  let basinWaterLocalY: number | null = null;
  let isSubmerged = false;
  if (parentBasin && parentBasin.containerState && parentBasin.containerState.volumeMl > 0) {
    const bcs = parentBasin.containerState;
    const bFillRatio = Math.max(0, Math.min(1.0, bcs.volumeMl / bcs.capacityMl));
    const bPad = 8;
    const bBh = parentBasin.height - bPad * 2 - 6;
    const isBasin = parentBasin.type === 'wide-basin';
    const bHeadspace = isBasin ? (0.15 * bBh + 8.5) * 0.40 : (0.14 * bBh + 8.6) * 0.40;
    const bLiquidH = Math.max(0, (bBh - bHeadspace) * bFillRatio);
    const bLiquidTopY = bPad + 4 + bBh - bLiquidH;
    const basinWaterGlobalY = parentBasin.y + bLiquidTopY;
    basinWaterLocalY = basinWaterGlobalY - (objY ?? 0);
    isSubmerged = basinWaterLocalY < y + bh + botCurve;
  } else if (parentBasin) {
    const bPad = 8;
    const basinRimGlobalY = parentBasin.y + bPad + 4;
    const basinRimLocalY = basinRimGlobalY - (objY ?? 0);
    if (basinRimLocalY < y + bh + botCurve) {
      isSubmerged = true;
    }
  }

  // 1. Physical Flask & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    if (!isSubmerged) {
      drawFlaskPhysical(
        ctx, w, h, x, y, cx, neckW, neckH, collarH, collarExt, cornerR, baseHalfW, botCurve, bh,
        state, liquidType, vol, liquidH, liquidTopY, strokeColor, objId, objX, objY, layer, false
      );
    } else {
      const bcs = parentBasin?.containerState;
      const mySlosh = objId ? containerSloshMap.get(objId) : undefined;
      const pSlosh = parentBasin?.id ? containerSloshMap.get(parentBasin.id) : undefined;
      const isAnim =
        (state?.temperature ?? 20) > 35 ||
        Boolean(state?.isBoiling) ||
        (bcs?.temperature ?? 20) > 35 ||
        Boolean(bcs?.isBoiling) ||
        Boolean(mySlosh && (Math.abs(mySlosh.sloshAngle) > 0.001 || Math.abs(mySlosh.sloshAngularVel) > 0.003)) ||
        Boolean(pSlosh && (Math.abs(pSlosh.sloshAngle) > 0.001 || Math.abs(pSlosh.sloshAngularVel) > 0.003));
      const animTick = isAnim ? Math.floor(performance.now() / 75) : 0;
      const cacheId = `flask-${objId || 'anon'}-${layer}`;
      const cacheKey = `${w}|${h}|${Math.round(objX ?? 0)}|${Math.round(objY ?? 0)}|${Math.round(vol)}|${liquidType}|${strokeColor}|${isDark ? 1 : 0}|${isDoubleNested ? 1 : 0}|${parentBasin?.id || ''}|${Math.round(parentBasin?.x ?? 0)}|${Math.round(parentBasin?.y ?? 0)}|${parentBasin?.width ?? 0}|${parentBasin?.height ?? 0}|${Math.round(bcs?.volumeMl ?? 0)}|${bcs?.liquidType || ''}|${animTick}`;

      renderWithOffscreenBlurCache(ctx, cacheId, cacheKey, w, h, 30, 35, (offCtx) => {
        if (basinWaterLocalY === null) {
          const bPad = 8;
          const basinRimLocalY = parentBasin!.y + bPad + 4 - (objY ?? 0);
          const splitY = Math.max(y, basinRimLocalY);

          if (splitY > y) {
            offCtx.save();
            offCtx.beginPath();
            offCtx.rect(-30, -30, w + 60, splitY + 30);
            offCtx.clip();
            drawFlaskPhysical(
              offCtx, w, h, x, y, cx, neckW, neckH, collarH, collarExt, cornerR, baseHalfW, botCurve, bh,
              state, liquidType, vol, liquidH, liquidTopY, strokeColor, objId, objX, objY, layer, false
            );
            offCtx.restore();
          }

          offCtx.save();
          offCtx.beginPath();
          offCtx.rect(-30, splitY, w + 60, h - splitY + 40);
          offCtx.clip();
          offCtx.globalAlpha = isDoubleNested ? 0.38 : 0.58;
          offCtx.filter = isDoubleNested ? 'blur(3.2px)' : 'blur(2.0px)';
          drawFlaskPhysical(
            offCtx, w, h, x, y, cx, neckW, neckH, collarH, collarExt, cornerR, baseHalfW, botCurve, bh,
            state, liquidType, vol, liquidH, liquidTopY, strokeColor, objId,
            objX, objY, layer, true
          );
          offCtx.restore();
        } else {
          const bPad = 8;
          const basinRimLocalY = parentBasin!.y + bPad + 4 - (objY ?? 0);
          const rimSplitY = Math.max(y, basinRimLocalY);
          const surfaceY = Math.max(rimSplitY, basinWaterLocalY);
          const bcsNonNull = parentBasin!.containerState!;
          const bBw = parentBasin!.width - bPad * 2;
          const bBh = parentBasin!.height - bPad * 2 - 6;
          const isBasin = parentBasin!.type === 'wide-basin';
          const bHeadspace = isBasin ? (0.15 * bBh + 8.5) * 0.40 : (0.14 * bBh + 8.6) * 0.40;
          const bFillRatio = Math.max(0, Math.min(1.0, bcsNonNull.volumeMl / bcsNonNull.capacityMl));
          const bLiquidH = Math.max(0, (bBh - bHeadspace) * bFillRatio);
          const bLiquidTopY = bPad + 4 + bBh - bLiquidH;
          const basinSurface = getLiquidSurfaceProfile(
            parentBasin!.id,
            parentBasin!.x,
            parentBasin!.y,
            bPad,
            bBw,
            bLiquidTopY,
            bLiquidH,
            bcsNonNull.temperature ?? 20,
            bcsNonNull.isBoiling ?? false,
            bcsNonNull.boilingIntensity ?? 0,
            performance.now()
          );
          const dxBasin = parentBasin!.x - (objX ?? 0);
          const dyBasin = parentBasin!.y - (objY ?? 0);

          // PASS 1: Emergent Part above outer container's rim (in open air: from top down to rimSplitY) - 100% sharp and crisp
          if (rimSplitY > y) {
            offCtx.save();
            offCtx.beginPath();
            offCtx.rect(-30, -30, w + 60, rimSplitY + 30);
            offCtx.clip();
            drawFlaskPhysical(
              offCtx, w, h, x, y, cx, neckW, neckH, collarH, collarExt, cornerR, baseHalfW, botCurve, bh,
              state, liquidType, vol, liquidH, liquidTopY, strokeColor, objId, objX, objY, layer, false
            );
            offCtx.restore();
          }

          // PASS 1.5: Inside the outer container's empty glass region (from rimSplitY down to outer wavy liquid surface) - glass blur
          if (surfaceY > rimSplitY - 4) {
            offCtx.save();
            offCtx.beginPath();
            if (basinSurface.length > 1) {
              offCtx.moveTo(-30, rimSplitY);
              offCtx.lineTo(w + 30, rimSplitY);
              offCtx.lineTo(w + 30, basinSurface[basinSurface.length - 1].y + dyBasin);
              for (let i = basinSurface.length - 1; i >= 0; i--) {
                offCtx.lineTo(basinSurface[i].x + dxBasin, basinSurface[i].y + dyBasin);
              }
              offCtx.lineTo(-30, basinSurface[0].y + dyBasin);
              offCtx.closePath();
            } else {
              offCtx.rect(-15, rimSplitY, w + 30, Math.max(0, surfaceY - rimSplitY));
            }
            offCtx.clip();
            offCtx.globalAlpha = isDoubleNested ? 0.42 : 0.62;
            offCtx.filter = isDoubleNested ? 'blur(2.8px)' : 'blur(1.8px)';
            drawFlaskPhysical(
              offCtx, w, h, x, y, cx, neckW, neckH, collarH, collarExt, cornerR, baseHalfW, botCurve, bh,
              state, liquidType, vol, liquidH, liquidTopY, strokeColor, objId, objX, objY, layer, true
            );
            offCtx.restore();
          }

          // PASS 2: Submerged Part (inside liquid: from outer wavy surface downwards) - diffused blur & softened contrast
          offCtx.save();
          offCtx.beginPath();
          if (basinSurface.length > 1) {
            offCtx.moveTo(-30, basinSurface[0].y + dyBasin);
            for (let i = 0; i < basinSurface.length; i++) {
              offCtx.lineTo(basinSurface[i].x + dxBasin, basinSurface[i].y + dyBasin);
            }
            offCtx.lineTo(w + 30, basinSurface[basinSurface.length - 1].y + dyBasin);
            offCtx.lineTo(w + 30, h + 40);
            offCtx.lineTo(-30, h + 40);
            offCtx.closePath();
          } else {
            offCtx.rect(-15, surfaceY, w + 30, h - surfaceY + 30);
          }
          offCtx.clip();

          if (bcsNonNull.liquidType === 'milk') {
            offCtx.globalAlpha = isDoubleNested ? 0.12 : 0.20;
            offCtx.filter = isDoubleNested ? 'blur(6.5px)' : 'blur(4.5px)';
          } else if (bcsNonNull.liquidType === 'oil') {
            offCtx.globalAlpha = isDoubleNested ? 0.18 : 0.28;
            offCtx.filter = isDoubleNested ? 'blur(5.6px)' : 'blur(3.8px)';
          } else {
            offCtx.globalAlpha = isDoubleNested ? 0.28 : 0.48;
            offCtx.filter = isDoubleNested ? 'blur(4.8px)' : 'blur(3.0px)';
          }

          drawFlaskPhysical(
            offCtx, w, h, x, y, cx, neckW, neckH, collarH, collarExt, cornerR, baseHalfW, botCurve, bh,
            state, liquidType, vol, liquidH, liquidTopY, strokeColor, objId, objX, objY, layer, true
          );
          offCtx.restore();
        }
      });
    }

    ctx.restore();
  }

  // 2. Permanent Discreet Action Buttons (Droplet, Pencil & Graph)
  // Hidden when the container's selection frame is active so the right-side orange resize handle is unobstructed!
  if (layer === 'all' || layer === 'ui') {
    if (!isSelected) {
      const outerRimLocalY = computeEffectiveOuterRimLocalY(
        objX ?? 0,
        objY ?? 0,
        w,
        'flask',
        parentBasin,
        _allObjects
      );
      renderContainerActionButtons(
        ctx,
        objId,
        w,
        h,
        isDark,
        state,
        isGraphActive,
        isSubmerged,
        'flask',
        outerRimLocalY,
        customColor
      );
    }
    if (letter && color) {
      renderContainerLetterBadge(
        ctx,
        letter,
        color,
        x + 16,
        y + bh - 10,
        isDark,
        Boolean(parentBasin),
        isSubmerged,
        parentBasin?.containerState?.liquidType,
        isDoubleNested
      );
    }
  }
}

/**
 * 6. Precision Laboratory Thermometer
 */
/**
 * Helper to render physical thermometer apparatus elements (stem, bulb, mercury column, calibration ticks).
 * Supports both crisp emergent air pass and softened/blurred submerged liquid pass.
 */
function drawThermometerApparatus(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  botY: number,
  stemW: number,
  stemH: number,
  bulbR: number,
  temp: number,
  tempFrac: number,
  liquidTopY: number,
  liquidColor: string,
  strokeColor: string,
  isDark: boolean,
  isSubmergedPass: boolean = false
) {
  // 1. Glass Outer Stem
  ctx.beginPath();
  ctx.roundRect(cx - stemW / 2, topY, stemW, stemH, stemW / 2);
  ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.65)';
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isSubmergedPass ? 1.1 : 1.6;
  ctx.stroke();

  // 2. Glass Bulb at bottom
  ctx.beginPath();
  ctx.arc(cx, botY + 2, bulbR, 0, Math.PI * 2);
  const bulbGrad = ctx.createRadialGradient(cx - 2, botY, 1, cx, botY + 2, bulbR);
  bulbGrad.addColorStop(0, '#60a5fa');
  bulbGrad.addColorStop(0.7, '#2563eb');
  bulbGrad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = bulbGrad;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isSubmergedPass ? 1.1 : 1.6;
  ctx.stroke();

  // 3. Liquid Column inside stem with gradient
  const colW = stemW - 3;
  if (tempFrac > 0.005) {
    const colGrad = ctx.createLinearGradient(cx, botY + 2, cx, liquidTopY);
    colGrad.addColorStop(0, '#2563eb');
    if (temp > 30) {
      colGrad.addColorStop(Math.min(0.85, 30 / temp), '#10b981');
    }
    if (temp > 65) {
      colGrad.addColorStop(Math.min(0.92, 65 / temp), '#f97316');
    }
    colGrad.addColorStop(1, liquidColor);

    ctx.beginPath();
    ctx.roundRect(cx - colW / 2, liquidTopY, colW, botY - liquidTopY + 2, [colW / 2, colW / 2, 0, 0]);
    ctx.fillStyle = colGrad;
    ctx.fill();
  }

  // 4. Calibration Tick Marks (0 to 100 °C)
  for (let t = 0; t <= 100; t += 10) {
    const ty = botY - stemH * (t / 100);
    const isMajor = t === 0 || t === 50 || t === 100;
    const tickLen = isMajor ? 6 : 3.5;

    ctx.beginPath();
    ctx.moveTo(cx + stemW / 2, ty);
    ctx.lineTo(cx + stemW / 2 + tickLen, ty);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isMajor ? 1.0 : 0.8;
    ctx.stroke();

    if (isMajor) {
      ctx.fillStyle = isSubmergedPass
        ? (isDark ? 'rgba(248, 250, 252, 0.30)' : 'rgba(148, 163, 184, 0.40)')
        : (isDark ? 'rgba(248, 250, 252, 0.50)' : '#94a3b8');
      ctx.font = 'bold 7.5px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${t}`, cx + stemW / 2 + 7.5, ty + 2.5);
    }
  }
}

/**
 * 6. Laboratory Thermometer (0 to 100 °C)
 * Features dynamic liquid diffusion / blur & optical immersion:
 * - Emergent part in air: 100% crisp, sharp and clean.
 * - Submerged part in water: strong diffusion blur (θόλωμα υγρού).
 * - Submerged part in oil: heavily obscured & diffused.
 * - Submerged part in milk: almost completely invisible (σχεδόν αόρατο).
 * - Dynamic emergence: clears up smoothly as it is pulled out of the liquid.
 */
function renderThermometer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatThermometerState | undefined,
  isDark: boolean,
  _isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string,
  dippedContainer?: HeatObject,
  _thermX?: number,
  thermY?: number,
  outerDippedContainer?: HeatObject,
  outerMostDippedContainer?: HeatObject
): void {
  const strokeColor = customColor || (isDark ? '#f8fafc' : '#111827');
  const cx = w / 2;
  const stemW = 8;
  const bulbR = 7.5;
  const topY = 26; // shifted down so badge has generous breathing room above 100°C mark
  const botY = h - bulbR - 4;
  const stemH = botY - topY;

  const temp = state?.temperature ?? 20.0;
  const tempFrac = Math.max(0, Math.min(1, temp / 100));
  const liquidTopY = botY - stemH * tempFrac;
  const liquidColor = getThermometerColor(temp);

  // Compute glass rim level & liquid submerged level if thermometer is placed inside a container
  let glassRimLocalY: number | null = null;
  let submergedLocalY: number | null = null;
  let dippedLiquidType: LiquidType = 'water';
  if (dippedContainer) {
    const cPad = 8;
    const containerRimGlobalY = dippedContainer.y + cPad + 4;
    glassRimLocalY = containerRimGlobalY - (thermY ?? 0);

    if (dippedContainer.containerState && dippedContainer.containerState.volumeMl > 0) {
      const cs = dippedContainer.containerState;
      dippedLiquidType = cs.liquidType || 'water';
      const fillRatio = Math.max(0, Math.min(1.0, cs.volumeMl / cs.capacityMl));
      const cBh = dippedContainer.height - cPad * 2 - 6;
      const isBasin = dippedContainer.type === 'wide-basin';
      const cHeadspace = isBasin ? (0.15 * cBh + 8.5) * 0.40 : (0.14 * cBh + 8.6) * 0.40;
      const cLiquidH = Math.max(0, (cBh - cHeadspace) * fillRatio);
      const cLiquidTopY = cPad + 4 + cBh - cLiquidH;
      const containerLiquidTopGlobalY = dippedContainer.y + cLiquidTopY;
      submergedLocalY = containerLiquidTopGlobalY - (thermY ?? 0);
    }
  }

  // If the dipped container is itself nested inside an outer container (e.g. B inside A),
  // compute the outer container's rim and liquid level so the nested thermometer gets double-layer optical blur!
  let outerRimLocalY: number | null = null;
  let outerSubmergedLocalY: number | null = null;
  let outerLiquidType: LiquidType = 'water';
  if (outerDippedContainer) {
    const oPad = 8;
    outerRimLocalY = outerDippedContainer.y + oPad + 4 - (thermY ?? 0);
    if (outerDippedContainer.containerState && outerDippedContainer.containerState.volumeMl > 0) {
      const ocs = outerDippedContainer.containerState;
      outerLiquidType = ocs.liquidType || 'water';
      const oFillRatio = Math.max(0, Math.min(1.0, ocs.volumeMl / ocs.capacityMl));
      const oBh = outerDippedContainer.height - oPad * 2 - 6;
      const oIsBasin = outerDippedContainer.type === 'wide-basin';
      const oHeadspace = oIsBasin ? (0.15 * oBh + 8.5) * 0.40 : (0.14 * oBh + 8.6) * 0.40;
      const oLiquidH = Math.max(0, (oBh - oHeadspace) * oFillRatio);
      const oLiquidTopY = oPad + 4 + oBh - oLiquidH;
      outerSubmergedLocalY = outerDippedContainer.y + oLiquidTopY - (thermY ?? 0);
    }
  }
  const isNestedThermometer = Boolean(outerDippedContainer);
  const isDoubleNestedThermometer = Boolean(outerMostDippedContainer);

  // 1. Physical Thermometer Sketch (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    const isInsideGlass = glassRimLocalY !== null && glassRimLocalY < botY + bulbR + 3;
    const isDippedInLiquid = submergedLocalY !== null && submergedLocalY < botY + bulbR + 3;

    if (!isInsideGlass && !isDippedInLiquid) {
      // Completely outside in open air: 100% sharp and crisp
      drawThermometerApparatus(
        ctx,
        cx,
        topY,
        botY,
        stemW,
        stemH,
        bulbR,
        temp,
        tempFrac,
        liquidTopY,
        liquidColor,
        strokeColor,
        isDark,
        false
      );
    } else {
      const rimY = glassRimLocalY !== null ? Math.max(topY, glassRimLocalY) : topY;
      const surfaceY = isDippedInLiquid ? Math.max(rimY, submergedLocalY!) : h + 10;
      const thermCacheId = `therm-${dippedContainer?.id || 'anon'}-${Math.round(_thermX ?? 0)}-${layer}`;
      const thermCacheKey = `${w}|${h}|${Math.round(temp * 5)}|${strokeColor}|${isDark ? 1 : 0}|${Math.round(rimY)}|${Math.round(surfaceY)}|${dippedLiquidType}|${isNestedThermometer ? 1 : 0}|${isDoubleNestedThermometer ? 1 : 0}|${Math.round(outerRimLocalY ?? -1)}|${Math.round(outerSubmergedLocalY ?? -1)}|${outerLiquidType}`;

      renderWithOffscreenBlurCache(ctx, thermCacheId, thermCacheKey, w, h, 16, 16, (offCtx) => {
        // PASS 1: Emergent Part above the container rim (in open air: from 0 down to rimY)
        // Crystal clear, unblurred, full contrast
        if (rimY > topY) {
          offCtx.save();
          offCtx.beginPath();
          offCtx.rect(0, 0, w, rimY);
          offCtx.clip();
          drawThermometerApparatus(
            offCtx,
            cx,
            topY,
            botY,
            stemW,
            stemH,
            bulbR,
            temp,
            tempFrac,
            liquidTopY,
            liquidColor,
            strokeColor,
            isDark,
            false
          );
          offCtx.restore();
        }

        // PASS 2: Inside the Empty Glass Part of the Container (from rimY down to surfaceY)
        // Softened and blurred as if viewed through the front borosilicate glass wall ("σαν να βάλαμε μπροστά γυαλί")!
        if (surfaceY > rimY) {
          offCtx.save();
          offCtx.beginPath();
          offCtx.rect(0, rimY, w, surfaceY - rimY);
          offCtx.clip();
          offCtx.globalAlpha = isDoubleNestedThermometer ? 0.28 : isNestedThermometer ? 0.36 : 0.50;
          offCtx.filter = isDoubleNestedThermometer
            ? 'blur(3.8px)'
            : isNestedThermometer
            ? 'blur(3.2px)'
            : 'blur(2.2px)';
          drawThermometerApparatus(
            offCtx,
            cx,
            topY,
            botY,
            stemW,
            stemH,
            bulbR,
            temp,
            tempFrac,
            liquidTopY,
            liquidColor,
            strokeColor,
            isDark,
            true
          );
          offCtx.restore();
        }

        // PASS 3: Submerged Part inside Liquid (from surfaceY downwards)
        if (isDippedInLiquid) {
          if (!isNestedThermometer) {
            offCtx.save();
            offCtx.beginPath();
            offCtx.rect(0, surfaceY, w, h - surfaceY + 10);
            offCtx.clip();

            if (dippedLiquidType === 'milk') {
              offCtx.globalAlpha = 0.22;
              offCtx.filter = 'blur(4.5px)';
            } else if (dippedLiquidType === 'oil') {
              offCtx.globalAlpha = 0.32;
              offCtx.filter = 'blur(3.8px)';
            } else {
              offCtx.globalAlpha = 0.48;
              offCtx.filter = 'blur(3.2px)';
            }

            drawThermometerApparatus(
              offCtx,
              cx,
              topY,
              botY,
              stemW,
              stemH,
              bulbR,
              temp,
              tempFrac,
              liquidTopY,
              liquidColor,
              strokeColor,
              isDark,
              true
            );
            offCtx.restore();
          } else {
            const outerBoundaryY =
              outerRimLocalY !== null
                ? Math.max(surfaceY, outerRimLocalY)
                : outerSubmergedLocalY !== null
                ? Math.max(surfaceY, outerSubmergedLocalY)
                : surfaceY;

            if (outerBoundaryY > surfaceY) {
              offCtx.save();
              offCtx.beginPath();
              offCtx.rect(0, surfaceY, w, outerBoundaryY - surfaceY);
              offCtx.clip();

              if (dippedLiquidType === 'milk') {
                offCtx.globalAlpha = isDoubleNestedThermometer ? 0.12 : 0.18;
                offCtx.filter = isDoubleNestedThermometer ? 'blur(5.8px)' : 'blur(4.8px)';
              } else if (dippedLiquidType === 'oil') {
                offCtx.globalAlpha = isDoubleNestedThermometer ? 0.18 : 0.26;
                offCtx.filter = isDoubleNestedThermometer ? 'blur(5.0px)' : 'blur(4.1px)';
              } else {
                offCtx.globalAlpha = isDoubleNestedThermometer ? 0.26 : 0.38;
                offCtx.filter = isDoubleNestedThermometer ? 'blur(4.6px)' : 'blur(3.7px)';
              }

              drawThermometerApparatus(
                offCtx,
                cx,
                topY,
                botY,
                stemW,
                stemH,
                bulbR,
                temp,
                tempFrac,
                liquidTopY,
                liquidColor,
                strokeColor,
                isDark,
                true
              );
              offCtx.restore();
            }

            offCtx.save();
            offCtx.beginPath();
            offCtx.rect(0, outerBoundaryY, w, h - outerBoundaryY + 10);
            offCtx.clip();

            if (dippedLiquidType === 'milk' || outerLiquidType === 'milk') {
              offCtx.globalAlpha = isDoubleNestedThermometer ? 0.08 : 0.12;
              offCtx.filter = isDoubleNestedThermometer ? 'blur(7.8px)' : 'blur(6.2px)';
            } else if (dippedLiquidType === 'oil' || outerLiquidType === 'oil') {
              offCtx.globalAlpha = isDoubleNestedThermometer ? 0.12 : 0.19;
              offCtx.filter = isDoubleNestedThermometer ? 'blur(7.0px)' : 'blur(5.4px)';
            } else {
              offCtx.globalAlpha = isDoubleNestedThermometer ? 0.16 : 0.27;
              offCtx.filter = isDoubleNestedThermometer ? 'blur(6.4px)' : 'blur(4.8px)';
            }

            drawThermometerApparatus(
              offCtx,
              cx,
              topY,
              botY,
              stemW,
              stemH,
              bulbR,
              temp,
              tempFrac,
              liquidTopY,
              liquidColor,
              strokeColor,
              isDark,
              true
            );
            offCtx.restore();
          }
        }
      });
    }

    ctx.restore();
  }

  // 2. Interactive Digital Badge (ui / all)
  if (layer === 'all' || layer === 'ui') {
    ctx.save();
    const badgeText = `${temp.toFixed(1)} °C`;
    ctx.font = 'bold 10px system-ui, sans-serif';
    const textW = ctx.measureText(badgeText).width;
    const badgeW = textW + 20;
    const badgeH = 19;
    const badgeX = cx - badgeW / 2;
    const badgeY = topY - badgeH - 10; // clearly separated above the 100°C mark

    // Small connecting hairline from badge to thermometer top
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.20)' : 'rgba(17, 24, 39, 0.15)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, badgeY + badgeH);
    ctx.lineTo(cx, topY);
    ctx.stroke();
    ctx.restore();

    // Badge card with subtle drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1.2;

    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6.5);
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)';
    ctx.fill();
    ctx.strokeStyle = customColor || liquidColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // Color indicator dot in current temperature color
    ctx.beginPath();
    ctx.arc(badgeX + 8.5, badgeY + badgeH / 2, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = liquidColor;
    ctx.fill();

    // Numeric text
    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + 16, badgeY + badgeH / 2 + 0.5);
    ctx.restore();
  }
}

/**
 * Animated Thermal Convection Current Streamlines (from bottom heated base upwards to top surface)
 * Active from 50°C to 90°C+ with graded motion (διαβάθμιση κίνησης).
 */
function renderThermalConvection(
  ctx: CanvasRenderingContext2D,
  lx: number,
  ly: number,
  lw: number,
  lh: number,
  bottomY: number,
  temperature: number,
  liquidType: LiquidType,
  nowMs: number
): void {
  if (temperature < 50 || lh < 8) return;

  ctx.save();
  const tSec = nowMs / 1000;

  // Graded motion from 50°C to 90°C+
  const tFrac = Math.max(0, Math.min(1.25, (temperature - 50) / 40));
  const flowSpeed = 1.1 + tFrac * 2.2;
  const numPlumes = lw > 120 ? 6 : 4;
  const maxAlpha = Math.min(0.38, 0.10 + tFrac * 0.25);

  const plumeColor =
    liquidType === 'oil'
      ? `rgba(247, 254, 231, ${maxAlpha})`
      : liquidType === 'milk'
      ? `rgba(255, 255, 255, ${maxAlpha * 0.65})`
      : `rgba(224, 242, 254, ${maxAlpha})`;

  ctx.strokeStyle = plumeColor;
  ctx.lineWidth = 1.25;
  ctx.lineCap = 'round';

  const segStep = 6;
  const plumeSpacing = lw / (numPlumes + 1);

  // Graded sway amplitude based on temperature
  const swayBase = 1.2 + tFrac * 1.5;
  const swayHeightScale = 2.0 + tFrac * 3.0;

  for (let p = 0; p < numPlumes; p++) {
    const basePx = lx + (p + 1) * plumeSpacing;
    const pPhase = p * 1.35;
    const pFreq = 0.045 + (p % 2) * 0.015;

    ctx.beginPath();
    let started = false;

    // Plumes rise from bottom base (bottomY) up towards liquid surface (ly)
    for (let curY = bottomY - 3; curY >= ly + 2; curY -= segStep) {
      const heightFrac = (bottomY - curY) / lh;
      const sway = Math.sin(curY * pFreq - tSec * flowSpeed + pPhase) * (swayBase + heightFrac * swayHeightScale);
      const px = basePx + sway;

      if (!started) {
        ctx.moveTo(px, curY);
        started = true;
      } else {
        ctx.lineTo(px, curY);
      }
    }
    ctx.stroke();

    // Subtle upward-moving convection thermal eddies (δίνες)
    const eddyPhase = (tSec * flowSpeed * 0.45 + p * 0.28) % 1;
    const eddyY = bottomY - 4 - eddyPhase * (lh - 8);
    const eddyHeightFrac = (bottomY - eddyY) / lh;
    const eddySway = Math.sin(eddyY * pFreq - tSec * flowSpeed + pPhase) * (swayBase + eddyHeightFrac * swayHeightScale);
    const eddyX = basePx + eddySway;
    const eddyR = 0.85 + ((p % 3) * 0.4) * (0.8 + tFrac * 0.35);

    ctx.beginPath();
    ctx.arc(eddyX, eddyY, eddyR, 0, Math.PI * 2);
    ctx.fillStyle = plumeColor;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Animated Boiling Bubbles:
 * - < 80°C: No bubbles (only thermal convection eddies).
 * - 80°C - 90°C: Starts very small ("πολυ πολυ μικρες"), gradually growing ("σιγα σιγα μεγαλωνε τες").
 * - > 90°C: Obvious bubbles ("φανερες φυσαλιδες"), but kept reasonably small ("και μικρες") expanding with boil.
 */
function renderBoilingBubbles(
  ctx: CanvasRenderingContext2D,
  lx: number,
  ly: number,
  lw: number,
  lh: number,
  temperature: number,
  isBoiling: boolean,
  boilingIntensity: number,
  nowMs: number
): void {
  if (lh < 8) return;
  if (temperature < 80 && !isBoiling) return;

  ctx.save();
  const time = nowMs / 1000;

  let numBubbles: number;
  let riseSpeed: number;
  let bubbleSizeScale: number;
  let isSimmer = false;

  if (temperature >= 90 || isBoiling) {
    // Obvious boiling bubbles after 90°C, kept neat and small ("και μικρες")
    const tBoil = Math.max(0, Math.min(1, (temperature - 90) / 10));
    const effectiveIntensity = isBoiling ? Math.max(tBoil, Math.max(0.4, boilingIntensity)) : tBoil;

    numBubbles = Math.round(14 + effectiveIntensity * 18);
    riseSpeed = 2.0 + effectiveIntensity * 1.8;
    bubbleSizeScale = 0.85 + effectiveIntensity * 0.35; // 0.85 at 90°C, 1.20 at full boil
  } else {
    // 80°C to 90°C: Micro-bubbles starting very small and gradually growing
    isSimmer = true;
    const tSimmer = Math.max(0, Math.min(1, (temperature - 80) / 10)); // 0.0 at 80°C, 1.0 at 90°C

    numBubbles = Math.round(4 + tSimmer * 9); // 4 at 80°C up to 13 at 90°C
    riseSpeed = 1.1 + tSimmer * 0.8;
    bubbleSizeScale = 0.45 + tSimmer * 0.35; // 0.45 at 80°C ("πολυ πολυ μικρες") to 0.80 at 90°C
  }

  for (let i = 0; i < numBubbles; i++) {
    const seed = (i * 37.7) % 1;
    const colSeed = (i * 61.3) % Math.max(10, lw - 16);
    const speedVariation = 0.8 + ((i * 17) % 5) * 0.1;
    const phase = (time * riseSpeed * speedVariation + seed) % 1;

    // Organic horizontal wobble as bubbles navigate liquid currents
    const wobble = Math.sin(time * 5.2 + i * 1.7) * (1.2 + phase * 2.2);
    const bx = lx + 8 + colSeed + wobble;
    // Rises from bottom base up to liquid surface
    const by = ly + lh - 4 - phase * (lh - 6);

    // Gas expansion: starts small, expands slightly near the surface
    const baseR = (1.0 + (i % 4) * 0.45) * bubbleSizeScale;
    const r = Math.max(0.65, baseR * (0.8 + phase * 0.45));

    // Glowing translucent bubble body
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = isSimmer ? 'rgba(255, 255, 255, 0.42)' : 'rgba(255, 255, 255, 0.58)';
    ctx.fill();

    // Luminous glass-like bubble rim
    ctx.strokeStyle = isSimmer ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = Math.max(0.5, r * 0.18);
    ctx.stroke();

    // Specular highlight gleam on top-left of bubble (for visible bubbles r >= 1.2)
    if (r >= 1.2) {
      ctx.beginPath();
      ctx.arc(bx - r * 0.32, by - r * 0.32, Math.max(0.4, r * 0.25), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
      ctx.fill();
    }

    // Micro-splash burst when bubble reaches top surface (phase > 0.94, after 90°C)
    if (!isSimmer && phase > 0.94) {
      const popFrac = (phase - 0.94) / 0.06;
      ctx.beginPath();
      ctx.arc(bx, ly, r * (1.1 + popFrac * 1.2), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * (1 - popFrac)})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Animated Billowing Steam Puffs rising into the air from the hot liquid surface
 */
function renderSteam(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  temperature: number,
  isBoiling: boolean,
  boilingIntensity: number,
  nowMs: number
): void {
  if (temperature < 58 && !isBoiling) return;

  ctx.save();
  const time = nowMs / 1000;

  // Staged steam puffs:
  // 60-80°C: 5 gentle vapor puffs
  // 80-95°C: 9 active steam plumes
  // 95-100°C+: 14 billowing steam clouds
  let numPuffs = 5;
  let riseH = 45;
  let maxAlpha = 0.22;

  if (temperature >= 95 || isBoiling) {
    numPuffs = 14;
    riseH = 85;
    maxAlpha = 0.40;
  } else if (temperature >= 80) {
    numPuffs = 9;
    riseH = 65;
    maxAlpha = 0.30;
  } else {
    numPuffs = 5;
    riseH = 45;
    maxAlpha = 0.18;
  }

  for (let i = 0; i < numPuffs; i++) {
    const seed = (i * 29.3) % 1;
    const speed = 0.7 + ((i * 13) % 5) * 0.12;
    const phase = (time * speed + seed) % 1;

    // Organic billowing expansion and lateral drift in ambient air
    const spreadX = ((i - (numPuffs - 1) / 2) / (numPuffs / 2)) * (sw * 0.38);
    const sway = Math.sin(time * 2.2 + i * 1.6) * 14;
    const px = sx + spreadX + sway;
    const py = sy - phase * riseH;

    // Puffs expand as they rise into the air
    const radius = 6 + phase * (16 + (i % 3) * 6);
    // Smooth bell-curve opacity: starts soft, reaches apex, then gracefully disperses
    const fadeIn = Math.min(1.0, phase * 3.5);
    const fadeOut = Math.max(0, 1.0 - phase);
    const opacity = fadeIn * fadeOut * maxAlpha;

    const grad = ctx.createRadialGradient(px, py, 2, px, py, radius);
    grad.addColorStop(0, `rgba(255, 255, 255, ${opacity * 1.2})`);
    grad.addColorStop(0.55, `rgba(255, 255, 255, ${opacity * 0.7})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 7. Dynamic Transparent T - t Real-Time Graph
 * Title: "Διάγραμμα Θερμοκρασίας - Χρόνου (θ - t)"
 * Vertical Axis: θ (°C), Horizontal Axis: t (s)
 */
function renderThermalGraph(
  ctx: CanvasRenderingContext2D,
  sim: HeatSimConfig,
  isDark: boolean,
  g: HeatGraphConfig = sim.graph,
  hoverPoint?: { x: number; y: number } | null,
  metaMap?: Map<string, ContainerCurveMeta>
): void {
  const gx = g.x;
  const gy = g.y;
  const gw = g.width;
  const gh = g.height;

  ctx.save();

  // Glass Card Background (iPadOS frosted glass)
  ctx.beginPath();
  ctx.roundRect(gx, gy, gw, gh, 16);
  ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(253, 251, 247, 0.88)';
  ctx.fill();
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.90)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Close Button '✕' at top right (gx + gw - 18, gy + 17)
  ctx.save();
  ctx.beginPath();
  ctx.arc(gx + gw - 18, gy + 17, 9, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
  ctx.fill();
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(gx + gw - 21.5, gy + 13.5);
  ctx.lineTo(gx + gw - 14.5, gy + 20.5);
  ctx.moveTo(gx + gw - 14.5, gy + 13.5);
  ctx.lineTo(gx + gw - 21.5, gy + 20.5);
  ctx.strokeStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.lineWidth = 1.35;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // Header Title - Clean Greek θ - t title
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = isDark ? '#f8fafc' : '#234978';
  ctx.textAlign = 'left';
  ctx.fillText('Διάγραμμα Θερμοκρασίας - Χρόνου (θ - t)', gx + 16, gy + 19);

  // Plot Area with ample margin so title and axes never collide!
  const plotX = gx + 46;
  const plotY = gy + 48;
  const plotW = gw - 68;
  const plotH = gh - 76;

  const effectiveMeta = metaMap || getContainersCurveMeta(sim, isDark);
  const allContainers = sim.objects.filter(
    (o) => o.type === 'beaker' || o.type === 'wide-basin' || o.type === 'flask'
  );
  let boundIds = g.boundContainerIds && g.boundContainerIds.length > 0 ? [...g.boundContainerIds] : [];
  if (boundIds.length === 0) {
    boundIds = allContainers.map((c) => c.id);
  } else if (boundIds.length === 1) {
    // If 1 container is bound and it is part of a nested multi-container system (e.g., A, B, Γ nested together),
    // automatically include all filled containers in that nested chain so all 2 or 3 interacting curves plot together!
    const getRootVesselId = (c: HeatObject): string => {
      let cur: HeatObject | undefined = c;
      let safety = 0;
      while (cur && safety < 6) {
        const p = findParentVessel(cur, allContainers);
        if (!p) return cur.id;
        cur = p;
        safety++;
      }
      return c.id;
    };
    const seedObj = allContainers.find((c) => c.id === boundIds[0]);
    if (seedObj) {
      const rootId = getRootVesselId(seedObj);
      const chainContainers = allContainers.filter(
        (c) => (c.containerState?.volumeMl ?? 0) > 0 && getRootVesselId(c) === rootId
      );
      if (chainContainers.length > 1) {
        boundIds = chainContainers.map((c) => c.id);
      }
    }
  }

  // Calculate highest recorded temperature among plotted containers to configure dynamic vertical axis
  let maxRecordedTemp = sim.ambientTemperature ?? 20.0;
  for (const cId of boundIds) {
    const cObj = sim.objects.find((o) => o.id === cId);
    if (cObj?.containerState?.temperature !== undefined) {
      maxRecordedTemp = Math.max(maxRecordedTemp, cObj.containerState.temperature);
    }
  }
  for (const pt of sim.history) {
    if (pt.tempEquilibrium !== undefined) {
      maxRecordedTemp = Math.max(maxRecordedTemp, pt.tempEquilibrium);
    }
    if (boundIds.length > 0) {
      for (let i = 0; i < boundIds.length; i++) {
        const cId = boundIds[i];
        const tempVal =
          pt.tempsByContainerId?.[cId] ??
          (i === 0 ? pt.temp1 : i === 1 ? pt.temp2 : undefined);
        if (tempVal !== undefined) {
          maxRecordedTemp = Math.max(maxRecordedTemp, tempVal);
        }
      }
    } else {
      if (typeof pt.temp1 === 'number') maxRecordedTemp = Math.max(maxRecordedTemp, pt.temp1);
      if (typeof pt.temp2 === 'number') maxRecordedTemp = Math.max(maxRecordedTemp, pt.temp2);
      if (pt.tempsByContainerId) {
        for (const t of Object.values(pt.tempsByContainerId)) {
          if (typeof t === 'number') maxRecordedTemp = Math.max(maxRecordedTemp, t);
        }
      }
    }
  }

  // Dynamic Temperature Axis configuration (50 -> 100 -> 150 -> 200+ without upper limit)
  const { tempMax, ticks: tempTicks } = getTempAxisConfig(maxRecordedTemp);

  // Time Axis configuration (dynamic, starting strictly from t = 0)
  const lastT = sim.history.length > 0 ? sim.history[sim.history.length - 1].timeSec : 0;
  const { tMax, ticks } = getTimeAxisConfig(lastT);

  const mapX = (t: number) => plotX + (Math.max(0, t) / tMax) * plotW;
  const mapY = (temp: number) => plotY + plotH - (Math.max(0, Math.min(tempMax, temp)) / tempMax) * plotH;

  // Temperature Grid lines (dynamic based on tempTicks)
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 1;
  for (const tick of tempTicks) {
    const py = mapY(tick.temp);
    ctx.beginPath();
    ctx.moveTo(plotX, py);
    ctx.lineTo(plotX + plotW, py);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(tick.label, plotX - 6, py + 3);
  }

  // Vertical grid lines and dynamic time ticks along the horizontal axis
  for (const tick of ticks) {
    const tx = mapX(tick.t);
    if (tx > plotX + plotW) continue;

    // Faint vertical grid line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tx, plotY);
    ctx.lineTo(tx, plotY + plotH);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Axis tick mark
    ctx.beginPath();
    ctx.moveTo(tx, plotY + plotH);
    ctx.lineTo(tx, plotY + plotH + 4);
    ctx.strokeStyle = isDark ? '#94a3b8' : '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Dynamic Time Label
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tick.label, tx, plotY + plotH + 13);
  }

  // Time & Temp Axes
  ctx.strokeStyle = isDark ? '#94a3b8' : '#334155';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  // Vertical Axis θ
  ctx.moveTo(plotX, plotY - 4);
  ctx.lineTo(plotX, plotY + plotH);
  // Horizontal Axis t
  ctx.lineTo(plotX + plotW + 4, plotY + plotH);
  ctx.stroke();

  // Axis Labels - θ (°C) placed cleanly above vertical axis without colliding!
  ctx.fillStyle = isDark ? '#cbd5e1' : '#1e293b';
  ctx.font = 'bold 9.5px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('θ (°C)', plotX - 8, plotY - 10);
  ctx.textAlign = 'left';
  ctx.fillText(tMax >= 120 ? 't (min)' : 't (s)', plotX + plotW + 6, plotY + plotH + 3.5);

  // Plot Curves from history
  if (sim.history.length > 1) {
    // Only draw the ambient room temperature line (θπεριβάλλοντος);
    // do NOT draw a dashed spoiler line at θισορ so students discover the equilibrium temperature themselves!
    const ambient = sim.ambientTemperature ?? 20.0;
    const eqY = mapY(ambient);
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.34)' : 'rgba(100, 116, 139, 0.34)';
    ctx.lineWidth = 1.0;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotX, eqY);
    ctx.lineTo(plotX + plotW, eqY);
    ctx.stroke();
    ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.48)' : 'rgba(100, 116, 139, 0.48)';
    ctx.font = '500 8px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`θπεριβάλλοντος = ${ambient.toFixed(1)}°C`, plotX + plotW - 4, eqY + 10);
    ctx.restore();

    let legendX = plotX + 32;
    const legendY = gy + 34;

    const curvesToPlot: {
      cId: string;
      letter: string;
      color: string;
      label: string;
      liquidLabel: string;
      currentTemp: number;
      lastX?: number;
      lastY?: number;
      lastTempVal?: number;
    }[] = [];

    const orderedBoundIds = [...boundIds].sort((a, b) => {
      const la = effectiveMeta.get(a)?.letter || 'Ω';
      const lb = effectiveMeta.get(b)?.letter || 'Ω';
      return la.localeCompare(lb, 'el');
    });

    orderedBoundIds.forEach((cId: string) => {
      const idx = boundIds.indexOf(cId);
      const meta = effectiveMeta.get(cId);
      const container = sim.objects.find((o) => o.id === cId);
      const letter = meta?.letter ?? '';
      const color = meta?.color ?? (idx === 0 ? '#1e293b' : '#7c3aed');
      const liquidType = container?.containerState?.liquidType ?? meta?.liquidType ?? 'water';
      const liquidLabel =
        liquidType === 'oil' ? 'Λάδι' : liquidType === 'milk' ? 'Γάλα' : 'Νερό';
      const currentTemp = container?.containerState?.temperature ?? 20;

      // Draw Curve Line (decimated to <= 150 points for O(1) rendering speed on long 15+ min runs)
      ctx.save();
      ctx.beginPath();
      let started = false;
      let lastX: number | undefined;
      let lastY: number | undefined;
      let lastTempVal: number | undefined;
      const histLen = sim.history.length;
      const stepStride = histLen > 150 ? Math.ceil(histLen / 150) : 1;
      for (let hIdx = 0; hIdx < histLen; hIdx++) {
        if (hIdx !== 0 && hIdx !== histLen - 1 && hIdx % stepStride !== 0) continue;
        const pt = sim.history[hIdx];
        const tempVal =
          pt.tempsByContainerId?.[cId] ??
          (idx === 0 ? pt.temp1 : idx === 1 ? pt.temp2 : undefined);
        if (tempVal === undefined) continue;
        const x = mapX(pt.timeSec);
        const y = mapY(tempVal);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
        lastX = x;
        lastY = y;
        lastTempVal = tempVal;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();

      curvesToPlot.push({
        cId,
        letter,
        color,
        label: letter ? `θ${letter}` : 'θ',
        liquidLabel,
        currentTemp,
        lastX,
        lastY,
        lastTempVal,
      });

      // Legend Item: "— θΑ (Νερό): 24°C" or "— θ (Νερό): 24°C" when single filled container
      const isCompactLegend = boundIds.length >= 3;
      ctx.font = isCompactLegend
        ? 'bold 8.5px system-ui, sans-serif'
        : 'bold 9.5px system-ui, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      const labelPrefix = letter ? `θ${letter}` : 'θ';
      const itemText = isCompactLegend
        ? `— ${labelPrefix}: ${Math.round(currentTemp)}°C`
        : `— ${labelPrefix} (${liquidLabel}): ${Math.round(currentTemp)}°C`;
      ctx.fillText(itemText, legendX, legendY);
      legendX += ctx.measureText(itemText).width + (isCompactLegend ? 10 : 14);
    });

    // Determine if mouse is currently hovering inside the plot area
    const isHoveringPlot = Boolean(
      hoverPoint &&
        hoverPoint.x >= plotX &&
        hoverPoint.x <= plotX + plotW &&
        hoverPoint.y >= plotY - 12 &&
        hoverPoint.y <= plotY + plotH + 12
    );

    let hoverClosestPt: (typeof sim.history)[0] | null = null;
    if (isHoveringPlot && hoverPoint) {
      const hoverT = Math.max(0, Math.min(tMax, ((hoverPoint.x - plotX) / plotW) * tMax));
      hoverClosestPt = sim.history[0];
      let minDiff = Math.abs(hoverClosestPt.timeSec - hoverT);
      for (let i = 1; i < sim.history.length; i++) {
        const diff = Math.abs(sim.history[i].timeSec - hoverT);
        if (diff < minDiff) {
          minDiff = diff;
          hoverClosestPt = sim.history[i];
        }
      }
    }

    // -------------------------------------------------------------------------
    // Live Tip Readout at the End of Each Curve (same look as mouse hover on curve)
    // -------------------------------------------------------------------------
    const hoverCx = hoverClosestPt ? mapX(hoverClosestPt.timeSec) : null;
    const sortedByLastY = [...curvesToPlot]
      .filter((c) => c.lastY !== undefined)
      .sort((a, b) => (a.lastY ?? 0) - (b.lastY ?? 0));
    curvesToPlot.forEach((curve, idx) => {
      if (curve.lastX === undefined || curve.lastY === undefined) return;
      // Avoid overlapping with the active hover readout when the cursor is right on the curve tip
      if (hoverCx !== null && Math.abs(hoverCx - curve.lastX) < 28) return;

      const tipTemp = curve.lastTempVal ?? curve.currentTemp;
      const cx = curve.lastX;
      const cy = curve.lastY;

      ctx.save();
      // Small circular dot at the tip of the curve
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = curve.color;
      ctx.fill();
      ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Frameless small temperature text at the tip of the curve
      ctx.fillStyle = curve.color;
      ctx.font = 'bold 9.5px system-ui, sans-serif';
      ctx.textAlign = 'left';
      const tipText = `${tipTemp.toFixed(1)}°`;
      const tipTextW = ctx.measureText(tipText).width;
      const rankIdx = sortedByLastY.findIndex((c) => c.cId === curve.cId);
      const effectiveRank = rankIdx >= 0 ? rankIdx : idx;
      const textOffsetY =
        sortedByLastY.length >= 3
          ? effectiveRank === 0
            ? -8
            : effectiveRank === 1
            ? 3
            : 14
          : effectiveRank % 2 === 0
          ? -6
          : 12;
      const rawTextX = cx + 6;
      const clampedTextX = Math.min(rawTextX, gx + gw - 6 - tipTextW);
      ctx.fillText(tipText, clampedTextX, cy + textOffsetY);
      ctx.restore();
    });

    // -------------------------------------------------------------------------
    // Clean Hover Inspection (Frameless Temperature Readout & Faint Dashed Projections)
    // -------------------------------------------------------------------------
    if (isHoveringPlot && hoverClosestPt) {
      const closestPt = hoverClosestPt;
      if (closestPt) {
        curvesToPlot.forEach((curve, idx) => {
          const tempVal =
            closestPt.tempsByContainerId?.[curve.cId] ??
            (idx === 0 ? closestPt.temp1 : idx === 1 ? closestPt.temp2 : undefined);
          if (tempVal === undefined) return;

          const cx = mapX(closestPt.timeSec);
          const cy = mapY(tempVal);

          ctx.save();
          // Faint dashed projection lines parallel to axes
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.40)' : 'rgba(0, 0, 0, 0.32)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          // Projection to vertical temperature axis (parallel to horizontal time axis)
          ctx.moveTo(plotX, cy);
          ctx.lineTo(cx, cy);
          // Projection to horizontal time axis (parallel to vertical temperature axis)
          ctx.lineTo(cx, plotY + plotH);
          ctx.stroke();
          ctx.restore();

          // Small circular dot on the curve
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = curve.color;
          ctx.fill();
          ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Frameless small temperature text (no box, simple small number)
          ctx.fillStyle = curve.color;
          ctx.font = 'bold 9.5px system-ui, sans-serif';
          ctx.textAlign = 'left';
          // Offset text slightly so it doesn't collide with the curve or other curves
          const textOffsetY = idx % 2 === 0 ? -6 : 12;
          ctx.fillText(`${tempVal.toFixed(1)}°`, cx + 6, cy + textOffsetY);

          // Axis projection readout on the vertical axis
          ctx.fillStyle = curve.color;
          ctx.font = 'bold 8.5px system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`${tempVal.toFixed(1)}°`, plotX - 5, cy + 3);
          ctx.restore();
        });

        // Time readout at bottom axis
        ctx.save();
        const timeLabel =
          closestPt.timeSec < 60
            ? `${closestPt.timeSec.toFixed(1)}s`
            : `${(closestPt.timeSec / 60).toFixed(2)}m`;
        const cx = mapX(closestPt.timeSec);
        ctx.fillStyle = isDark ? '#cbd5e1' : '#1e293b';
        ctx.font = 'bold 8.5px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(timeLabel, cx, plotY + plotH + 24);
        ctx.restore();
      }
    }
  }

  // Resize handle on bottom right
  ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(gx + gw - 12, gy + gh - 4);
  ctx.lineTo(gx + gw - 4, gy + gh - 12);
  ctx.moveTo(gx + gw - 8, gy + gh - 4);
  ctx.lineTo(gx + gw - 4, gy + gh - 8);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Returns true ONLY when the Heat Simulation requires continuous 60fps animation frames:
 * - Simulation is actively running (`isRunning === true`), OR
 * - Any burner is ON (`isOn === true`), OR
 * - Any container liquid is > 35°C or boiling (convection/waves/bubbles/steam), OR
 * - Any container is actively sloshing from a drag/shake, OR
 * - An ephemeral fill feedback badge (1.5s) is fading out.
 * When false (e.g. paused at <= 35°C or resting), the simulation needs 0 continuous RAF frames!
 */
export function isHeatSimulationVisuallyActive(sim: HeatSimConfig | null | undefined): boolean {
  if (!sim) return false;
  if (sim.isRunning) return true;
  const now = performance.now();
  for (const obj of sim.objects) {
    if (obj.type === 'burner' && obj.burnerState?.isOn) return true;
    if (obj.containerState && (obj.containerState.volumeMl ?? 0) > 0) {
      if ((obj.containerState.temperature ?? 20) > 50 || obj.containerState.isBoiling) {
        return true;
      }
      const slosh = containerSloshMap.get(obj.id);
      if (
        slosh &&
        (Math.abs(slosh.sloshAngle) > 0.001 ||
          Math.abs(slosh.sloshAngularVel) > 0.003 ||
          Math.abs(slosh.externalVx) > 0.8)
      ) {
        return true;
      }
      const fb = containerFillFeedbackMap.get(obj.id);
      if (fb && now - fb.startTime < 1550) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Computes the logical bounding box of a Heat Simulation (all apparatus objects + visible graphs)
 * on the page so offscreen simulations can skip canvas rendering when scrolled out of view.
 */
export function getHeatSimulationWorldBounds(
  sim: HeatSimConfig
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const obj of sim.objects) {
    minX = Math.min(minX, obj.x - 40);
    minY = Math.min(minY, obj.y - 60);
    maxX = Math.max(maxX, obj.x + obj.width + 45);
    maxY = Math.max(maxY, obj.y + obj.height + 40);
  }

  const graphs =
    sim.graphs && sim.graphs.length > 0
      ? sim.graphs.filter((g) => g.visible)
      : sim.graph?.visible
      ? [sim.graph]
      : [];
  for (const g of graphs) {
    minX = Math.min(minX, g.x - 20);
    minY = Math.min(minY, g.y - 20);
    maxX = Math.max(maxX, g.x + g.width + 20);
    maxY = Math.max(maxY, g.y + g.height + 20);
  }

  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}
