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
  HeatObject,
  HeatObjectType,
  HeatSimConfig,
  HeatThermometerState,
  LiquidType,
} from './types';

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

export interface RenderHeatSimulationOptions {
  isDark?: boolean;
  scale?: number;
  hoveredObjectId?: string | null;
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

  // Render objects sorted by z-order:
  // 1. Tripod
  // 2. Burner
  // 3. Wide Basin
  // 4. Beaker / Flask
  // 5. Thermometer
  const sorted = [...sim.objects].sort((a, b) => {
    const order: Record<string, number> = {
      tripod: 1,
      burner: 2,
      'wide-basin': 3,
      beaker: 4,
      flask: 4,
      thermometer: 5,
    };
    return (order[a.type] || 0) - (order[b.type] || 0);
  });

  const selectedIds = isSelectActive
    ? sim.selectedObjectIds && sim.selectedObjectIds.length > 0
      ? sim.selectedObjectIds
      : sim.selectedObjectId
      ? [sim.selectedObjectId]
      : []
    : [];

  const isMultiSelect = selectedIds.length > 1;

  for (const obj of sorted) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    const isHovered = options?.hoveredObjectId === obj.id;
    const isSelected = selectedIds.includes(obj.id);

    // Subtle individual highlight outline when part of a multi-selection
    if (isMultiSelect && isSelected && (layer === 'all' || layer === 'ui')) {
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(37, 99, 235, 0.40)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(-4, -4, obj.width + 8, obj.height + 8);
      ctx.restore();
    }

    switch (obj.type) {
      case 'burner':
        renderBurner(ctx, obj.width, obj.height, obj.burnerState, isDark, isSelected, layer, obj.strokeColor);
        break;
      case 'tripod':
        renderTripod(ctx, obj.width, obj.height, obj.tripodState?.wireGauzeTemp || 20, isDark, isSelected, layer, obj.strokeColor);
        break;
      case 'beaker': {
        const parentBasin = sim.objects.find(
          (b) =>
            b.type === 'wide-basin' &&
            obj.x >= b.x - 20 &&
            obj.x + obj.width <= b.x + b.width + 20 &&
            obj.y + obj.height >= b.y + 15
        );
        renderBeaker(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected, layer, obj.strokeColor, obj.id, obj.x, obj.y, parentBasin);
        break;
      }
      case 'wide-basin':
        renderWideBasin(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected, layer, obj.strokeColor, obj.id, obj.x, obj.y);
        break;
      case 'flask': {
        const parentBasin = sim.objects.find(
          (b) =>
            b.type === 'wide-basin' &&
            obj.x >= b.x - 20 &&
            obj.x + obj.width <= b.x + b.width + 20 &&
            obj.y + obj.height >= b.y + 15
        );
        renderFlask(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected, layer, obj.strokeColor, obj.id, obj.x, obj.y, parentBasin);
        break;
      }
      case 'thermometer': {
        const thermCx = obj.x + obj.width / 2;
        const thermBotY = obj.y + obj.height - 4;
        const dipped = sim.objects.find((c) => {
          if (c.type !== 'beaker' && c.type !== 'flask' && c.type !== 'wide-basin') return false;
          if (!c.containerState || c.containerState.volumeMl <= 0) return false;
          return (
            thermCx >= c.x - 4 &&
            thermCx <= c.x + c.width + 4 &&
            thermBotY >= c.y + 10 &&
            obj.y <= c.y + c.height
          );
        });
        renderThermometer(
          ctx,
          obj.width,
          obj.height,
          obj.thermometerState,
          isDark,
          isSelected,
          layer,
          obj.strokeColor,
          dipped,
          obj.x,
          obj.y
        );
        break;
      }
    }

    // Render Unified BestNotes Selection Frame if single object selected (in 'ui' or 'all' layer)
    if (!isMultiSelect && isSelected && (layer === 'all' || layer === 'ui')) {
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
  }

  // Render Unified Group Selection Frame when multiple objects are selected together
  if (isMultiSelect && (layer === 'all' || layer === 'ui')) {
    const selectedObjects = sim.objects.filter((o) => selectedIds.includes(o.id));
    renderGroupSelectionFrame(ctx, selectedObjects, isDark);
  }

  // Render Dynamic T-t Graph if enabled (only in 'ui' or 'all' layer)
  if (sim.graph.visible && (layer === 'all' || layer === 'ui')) {
    renderThermalGraph(ctx, sim, isDark);
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
  lastTime: number;
  filteredVx: number; // smoothed velocity (px/s)
  sloshAngle: number; // surface tilt angle (radians)
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
      lastTime: nowMs,
      filteredVx: 0,
      sloshAngle: 0,
      sloshAngularVel: 0,
    };
    containerSloshMap.set(containerId, state);
    return 0;
  }

  // Handle large pause (tab switch, window resize) gracefully
  if (nowMs - state.lastTime > 250) {
    state.lastX = curX;
    state.lastY = curY;
    state.lastTime = nowMs;
    state.filteredVx = 0;
    return state.sloshAngle;
  }

  const dt = Math.max(0.001, Math.min(0.05, (nowMs - state.lastTime) / 1000));
  state.lastTime = nowMs;

  const dx = curX - state.lastX;
  state.lastX = curX;
  state.lastY = curY;

  const rawVx = Math.max(-1200, Math.min(1200, dx / dt));
  // Smooth velocity response (time constant ~65ms) to eliminate discrete pointer jitter
  const alphaV = Math.min(1.0, 15.0 * dt);
  const prevVx = state.filteredVx;
  state.filteredVx += (rawVx - state.filteredVx) * alphaV;

  // Horizontal acceleration from filtered velocity
  const ax = Math.max(-6000, Math.min(6000, (state.filteredVx - prevVx) / dt));

  // Fluid reorients along apparent gravity vector (opposite to acceleration direction)
  // Positive X motion (dx > 0) causes fluid to surge toward left wall (tilt angle > 0)
  const targetAngle = Math.max(-0.14, Math.min(0.14, ax * 0.000045 + state.filteredVx * 0.000075));

  // Damped harmonic oscillator for natural liquid sloshing
  // Natural frequency fn ≈ 1.15 Hz => omega_n ≈ 7.2 rad/s
  // Damping ratio zeta ≈ 0.30 (calm underdamped settling in 2-3 graceful waves)
  const omegaN = 7.2;
  const zeta = 0.30;

  const springTorque = -omegaN * omegaN * (state.sloshAngle - targetAngle);
  const dampingTorque = -2 * zeta * omegaN * state.sloshAngularVel;
  const angularAcc = springTorque + dampingTorque;

  state.sloshAngularVel += angularAcc * dt;
  state.sloshAngularVel = Math.max(-4.0, Math.min(4.0, state.sloshAngularVel));
  state.sloshAngle += state.sloshAngularVel * dt;
  state.sloshAngle = Math.max(-0.14, Math.min(0.14, state.sloshAngle));

  // Settle to true zero if movement has stopped and oscillations are imperceptible
  if (Math.abs(state.sloshAngle) < 0.0004 && Math.abs(state.sloshAngularVel) < 0.0015 && Math.abs(state.filteredVx) < 0.5) {
    state.sloshAngle = 0;
    state.sloshAngularVel = 0;
  }

  return state.sloshAngle;
}

/**
 * Calculates dynamic fluid surface profile combining:
 * 1. Inertial sloshing tilt & fluid crest curvature when moved horizontally
 * 2. Thermal convection multi-harmonic rolling waves when heated (CodePen wave style, refined & subtle)
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

  // Maximum vertical tilt displacement clamped to safe vessel fraction
  const maxTilt = Math.min(8.5, liquidH * 0.28);

  // Thermal convection waves: ambient <= 25°C is calm, heat builds organic rippling up to 100°C
  const thermalFrac = Math.max(0, Math.min(1, (temperature - 25) / 75));

  // Amplitude scaling: subtle and elegant ("λιγότερο έντονη", ~0.15px ambient to ~2.4px boiling)
  let baseAmp = 0.15 + 1.4 * thermalFrac;
  if (isBoiling) {
    baseAmp += 0.85 * Math.max(0.35, boilingIntensity);
  }

  const tSec = nowMs / 1000;
  const waveSpeed = 1.6 + thermalFrac * 1.5 + (isBoiling ? 1.0 : 0);
  const phase1 = tSec * waveSpeed;
  const phase2 = -tSec * (waveSpeed * 1.35) + 1.2;
  const phase3 = tSec * (waveSpeed * 0.75) + 2.4;

  const spatialK = (Math.PI * 2) / Math.max(45, surfaceW * 0.85);

  const numSamples = 24;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const u = i / numSamples; // 0.0 at left wall, 1.0 at right wall
    const px = leftX + u * surfaceW;

    // 1. Inertial sloshing tilt (preserves liquid volume around center u=0.5)
    const rawTiltDelta = (u - 0.5) * surfaceW * sinAngle;
    const clampedTiltDelta = Math.max(-maxTilt, Math.min(maxTilt, rawTiltDelta));
    // Gentle fluid meniscus crest curvature when tilted
    const fluidCurvature = 0.12 * Math.sin(Math.PI * 2 * (u - 0.5)) * clampedTiltDelta;
    const sloshDeltaY = clampedTiltDelta + fluidCurvature;

    // 2. Multi-harmonic thermal convection ripples (CodePen wave style, refined & subtle)
    const xRel = u * surfaceW;
    const w1 = Math.sin(xRel * spatialK + phase1);
    const w2 = Math.sin(xRel * spatialK * 2.2 + phase2) * 0.38;
    const w3 = Math.cos(xRel * spatialK * 0.7 + phase3) * 0.22;
    const rawWave = w1 + w2 + w3;

    // Smooth envelope anchoring to 0 at container walls (glass contact angle boundary condition)
    const envelope = Math.pow(Math.sin(Math.PI * Math.max(0, Math.min(1, u))), 0.65);
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
    grad.addColorStop(0, 'rgba(247, 254, 231, 0.96)'); // Luminous pale lime sheen
    grad.addColorStop(0.12, 'rgba(217, 249, 157, 0.90)'); // Fresh lime olive oil
    grad.addColorStop(0.38, 'rgba(163, 230, 53, 0.85)'); // Golden-lime green body
    grad.addColorStop(0.70, 'rgba(101, 163, 13, 0.85)'); // Rich virgin olive oil
    grad.addColorStop(1, 'rgba(63, 98, 18, 0.92)'); // Deep rich olive base
  } else if (liquidType === 'milk') {
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)'); // Pure white top
    grad.addColorStop(0.40, 'rgba(255, 255, 255, 0.99)'); // Crisp pure white body
    grad.addColorStop(0.75, 'rgba(248, 249, 250, 0.98)'); // Subtle neutral transition
    grad.addColorStop(1, 'rgba(229, 231, 235, 0.96)'); // Barely neutral grey at bottom depth (no other hue)
  } else {
    // Water
    grad.addColorStop(0, 'rgba(240, 249, 255, 0.96)'); // Luminous crystal surface sheen
    grad.addColorStop(0.10, 'rgba(224, 242, 254, 0.90)'); // Clear sky water
    grad.addColorStop(0.32, 'rgba(186, 230, 253, 0.82)'); // Aquamarine transition
    grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.78)'); // Vibrant blue body
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.90)'); // Deep rich blue base
  }

  ctx.fillStyle = grad;
  ctx.fillRect(fx, fy, fw, fh);

  // 2. Ultra-soft, delicate surface line following dynamic surface profile (barely perceptible)
  ctx.save();
  ctx.strokeStyle =
    liquidType === 'oil'
      ? 'rgba(101, 163, 13, 0.08)'
      : liquidType === 'milk'
      ? 'rgba(209, 213, 219, 0.07)'
      : 'rgba(2, 132, 199, 0.07)'; // Whisper-faint, barely perceptible meniscus line
  ctx.lineWidth = 0.5;
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

  // Subtle luminous reflection highlight just below the surface (whisper-soft)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  if (surfacePoints && surfacePoints.length > 2) {
    ctx.moveTo(surfacePoints[1].x, surfacePoints[1].y + 1.0);
    for (let i = 2; i < surfacePoints.length - 1; i++) {
      ctx.lineTo(surfacePoints[i].x, surfacePoints[i].y + 1.0);
    }
  } else {
    ctx.moveTo(x + 3, liquidTopY + 1.0);
    ctx.lineTo(x + bw - 3, liquidTopY + 1.0);
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
  customColor?: string
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
  const nozzleTopY = Math.max(8, h * 0.11); // taller stem & chimney tube
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
      const sway = Math.sin(time * 3.2) * 2.8 + Math.sin(time * 6.5) * 1.2;
      // 2. Flame height breathing
      const breathe = 1.0 + Math.sin(time * 4.0) * 0.08 + Math.cos(time * 7.0) * 0.03;
      const baseFlameH = state.intensity === 'roaring' ? h * 0.65 : state.intensity === 'normal' ? h * 0.50 : h * 0.38;
      const flameH = baseFlameH * breathe;
      const flameTipY = nozzleTopY - 4 - flameH;

      // 3. Soft circular ambient breathing glow (NO rectangular box!)
      ctx.save();
      const glowR = flameH * 0.95;
      const glowCenterY = nozzleTopY - 4 - flameH * 0.45;
      const glow = ctx.createRadialGradient(cx, glowCenterY, 3, cx, glowCenterY, glowR);
      const isRoar = state.intensity === 'roaring';
      const glowAlpha = 0.22 + Math.sin(time * 5.0) * 0.05;
      glow.addColorStop(0, isRoar ? `rgba(59, 130, 246, ${glowAlpha + 0.15})` : `rgba(249, 115, 22, ${glowAlpha + 0.18})`);
      glow.addColorStop(0.5, isRoar ? `rgba(96, 165, 250, ${glowAlpha * 0.5})` : `rgba(251, 146, 60, ${glowAlpha * 0.5})`);
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, glowCenterY, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Fluid teardrop flame silhouette emerging from nozzle mouth
      ctx.save();
      const flameBaseW = nozzleW * 0.72;
      const flameMidW = nozzleW * 1.35 * (1.0 - (breathe - 1.0) * 0.5);

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
      if (isRoar) {
        flameGrad.addColorStop(0, 'rgba(29, 78, 216, 0.85)');
        flameGrad.addColorStop(0.35, 'rgba(37, 99, 235, 0.75)');
        flameGrad.addColorStop(0.7, 'rgba(96, 165, 250, 0.65)');
        flameGrad.addColorStop(1, 'rgba(219, 234, 254, 0.55)');
      } else {
        flameGrad.addColorStop(0, 'rgba(194, 65, 12, 0.90)'); // Deep fire base
        flameGrad.addColorStop(0.25, 'rgba(234, 88, 12, 0.85)'); // Rich orange
        flameGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.80)'); // Golden amber
        flameGrad.addColorStop(0.9, 'rgba(253, 224, 71, 0.75)'); // Bright yellow
        flameGrad.addColorStop(1, 'rgba(255, 255, 255, 0.65)'); // White tip
      }
      ctx.fillStyle = flameGrad;
      ctx.fill();

      ctx.strokeStyle = isRoar ? '#2563eb' : '#ea580c';
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // 5. Inner Bright Flame Core (teardrop)
      const coreH = flameH * 0.52;
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
      if (isRoar) {
        coreGrad.addColorStop(0, 'rgba(147, 197, 253, 0.85)');
        coreGrad.addColorStop(1, '#ffffff');
      } else {
        coreGrad.addColorStop(0, 'rgba(253, 224, 71, 0.95)');
        coreGrad.addColorStop(1, '#ffffff');
      }
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

    // 5. Permanent Flame Toggle Button at bottom-right of cast-iron base
    const { btnCenterX, btnCenterY, btnSize, btnHalf } = getBurnerActionButtonLocalPos(w, h);
    const isOn = Boolean(state?.isOn);

    const frameGrey = isDark
      ? 'rgba(255, 255, 255, 0.22)'
      : 'rgba(156, 163, 175, 0.68)'; // Soft, faint neutral whisper-grey

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1.0;

    // Soft grey/beige squircle container
    ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.95)' : '#fdfbf7';
    ctx.strokeStyle = isOn
      ? 'rgba(234, 88, 12, 0.60)'
      : frameGrey;
    ctx.lineWidth = 1.1;

    ctx.beginPath();
    ctx.roundRect(btnCenterX - btnHalf, btnCenterY - btnHalf, btnSize, btnSize, 5.5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Small monochrome flame icon inside squircle (same grey as frame when OFF)
    ctx.save();
    ctx.translate(btnCenterX, btnCenterY);

    ctx.beginPath();
    ctx.moveTo(0.4, -5.2);
    // Right convex curve going down
    ctx.bezierCurveTo(2.3, -2.4, 3.4, 0.4, 2.9, 2.6);
    ctx.bezierCurveTo(2.4, 4.4, 0.2, 5.2, -1.8, 4.4);
    // Bottom left curve
    ctx.bezierCurveTo(-3.4, 3.6, -3.7, 2.0, -2.9, 0.6);
    // Inward flick / notch on left
    ctx.bezierCurveTo(-2.1, -0.3, -1.1, 0.0, -1.4, 1.3);
    // Curving up to top tip
    ctx.bezierCurveTo(-1.6, -1.0, -0.8, -3.0, 0.4, -5.2);
    ctx.closePath();

    if (isOn) {
      ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(234, 88, 12, 0.45)';
      ctx.shadowBlur = 3;
      ctx.stroke();
    } else {
      ctx.strokeStyle = frameGrey;
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }
}

/**
 * 2. Laboratory Tripod - Monochrome line-art with wire gauze crosshatch
 */
function renderTripod(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  gauzeTempC: number,
  isDark: boolean,
  _isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string
): void {
  const strokeColor = customColor || (isDark ? '#f8fafc' : '#111827');
  const cx = w / 2;
  const collarW = w * 0.72;
  const collarH = h * 0.14;
  const topY = 4;
  const collarCy = topY + collarH * 0.5;
  const collarRx = collarW / 2;
  const collarRy = collarH / 2;
  const legBotY = h - 6;

  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Recessed Back Leg (rotated off-center to the left, rendered faint gray so burner placed underneath remains crystal-clear)
    // Starts EXACTLY on the upper perimeter of the outer collar ellipse outline!
    const backRatio = 0.26;
    const backStartX = cx - collarRx * backRatio;
    const backStartY = collarCy - collarRy * Math.sqrt(1 - backRatio * backRatio);
    const backEndX = cx - collarW * 0.24;
    const backEndY = legBotY - 6;

    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.42)' : 'rgba(100, 116, 139, 0.38)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(backStartX, backStartY);
    ctx.lineTo(backEndX, backEndY);
    ctx.stroke();
    ctx.restore();

    // 2. Wire Gauze mesh crosshatch (contained inside the collar ring)
    const gauzeW = collarW * 0.88;
    const gauzeH = collarH * 0.88;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, collarCy, gauzeW / 2, gauzeH / 2, 0, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = isDark ? 'rgba(203, 213, 225, 0.55)' : 'rgba(71, 85, 105, 0.55)';
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

    // 3. Central ceramic disc (matches exact perspective aspect ratio of outer collar ellipse!)
    const ceramicScale = 0.38;
    const ceramicRx = collarRx * ceramicScale;
    const ceramicRy = collarRy * ceramicScale;
    const heatFraction = Math.max(0, Math.min(1, (gauzeTempC - 20) / 450));

    ctx.beginPath();
    ctx.ellipse(cx, collarCy, ceramicRx, ceramicRy, 0, 0, Math.PI * 2);
    if (heatFraction > 0.05) {
      const discGlow = ctx.createRadialGradient(cx, collarCy, 2, cx, collarCy, ceramicRx);
      discGlow.addColorStop(0, '#fef08a');
      discGlow.addColorStop(0.4, '#f97316');
      discGlow.addColorStop(0.85, '#dc2626');
      discGlow.addColorStop(1, 'rgba(185, 28, 28, 0.4)');
      ctx.fillStyle = discGlow;
    } else {
      ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.85)';
    }
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore(); // restore from gauze clip

    // 4. Circular Top Collar Ring (crisp 2.4px outline)
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(cx, collarCy, collarRx, collarRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Front Left and Front Right Legs (crisp foreground line-art)
    // Both start EXACTLY on the lower perimeter of the collar ellipse outline!
    // Widened symmetrically for a stable, balanced laboratory tripod stance.
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
 * Coordinate calculators for the permanent discreet action buttons (Droplet & Pencil)
 * positioned at the bottom-right of container glassware (beaker, wide-basin, flask).
 */
export function getContainerActionButtonsLocalPos(w: number, h: number) {
  const pad = 8;
  const bw = w - pad * 2;
  const bh = h - pad * 2 - 6;
  const glassRightX = pad + bw;
  const glassBottomY = pad + 4 + bh;
  const btnSize = 19;
  const btnHalf = btnSize / 2;
  // Gap from glass wall: reduced to 7.5px ("λίγο πιο κοντά στο δοχείο .. λίγο")
  const gap = 7.5;
  const dropletX = glassRightX + gap + btnHalf;
  const dropletY = glassBottomY - btnHalf - 1;
  // Pencil stacked vertically ABOVE the droplet ("φέρε το μολύβι πάνω από τη σταγόνα")
  const pencilX = dropletX;
  const pencilY = dropletY - btnSize - 4;
  return { dropletX, dropletY, pencilX, pencilY, btnSize, btnHalf, glassRightX, glassBottomY };
}

export function getContainerActionButtonsWorldPos(obj: HeatObject) {
  const local = getContainerActionButtonsLocalPos(obj.width, obj.height);
  return {
    dropletX: obj.x + local.dropletX,
    dropletY: obj.y + local.dropletY,
    pencilX: obj.x + local.pencilX,
    pencilY: obj.y + local.pencilY,
    btnSize: local.btnSize,
    btnHalf: local.btnHalf,
    glassRightX: obj.x + local.glassRightX,
    glassBottomY: obj.y + local.glassBottomY,
  };
}

/**
 * Coordinate calculators for the permanent flame toggle button
 * positioned at the bottom-right of the Bunsen burner cast-iron base.
 */
export function getBurnerActionButtonLocalPos(w: number, h: number) {
  const cx = w / 2;
  const baseW = w * 0.67;
  const groundY = h - 12;
  const cyBot = groundY - 5.2;
  const btnSize = 19;
  const btnHalf = btnSize / 2;
  // 7.5px gap to the right of the cast-iron base edge so it never touches or sticks to the base
  const btnCenterX = cx + baseW / 2 + btnHalf + 7.5;
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
 * Small monochrome droplet icon outline (no text).
 */
function drawDropletIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  // Pointed top tip
  ctx.moveTo(0, -4.8);
  // Curve down right
  ctx.bezierCurveTo(2.4, -1.8, 3.5, 0.8, 3.5, 2.2);
  // Bottom rounded base
  ctx.bezierCurveTo(3.5, 4.3, 2.0, 5.0, 0, 5.0);
  ctx.bezierCurveTo(-2.0, 5.0, -3.5, 4.3, -3.5, 2.2);
  // Curve up left to tip
  ctx.bezierCurveTo(-3.5, 0.8, -2.4, -1.8, 0, -4.8);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

/**
 * Small monochrome pencil icon outline in grey (on white/beige squircle background, not black).
 */
function drawPencilIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4); // tilted 45 degrees
  ctx.beginPath();
  // Pencil body
  ctx.rect(-1.7, -3.2, 3.4, 5.2);
  // Pointed lead tip
  ctx.moveTo(-1.7, 2.0);
  ctx.lineTo(0, 4.7);
  ctx.lineTo(1.7, 2.0);
  // Eraser / ferrule division line
  ctx.moveTo(-1.7, -1.6);
  ctx.lineTo(1.7, -1.6);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.15;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

/**
 * Renders the 2 permanent discreet monochrome action buttons (Droplet & Pencil)
 * and the ephemeral 1.5s fade-out volume badge for containers.
 */
function renderContainerActionButtons(
  ctx: CanvasRenderingContext2D,
  objId: string | undefined,
  w: number,
  h: number,
  isDark: boolean
): void {
  const { dropletX, dropletY, pencilX, pencilY, btnSize, btnHalf, glassRightX } = getContainerActionButtonsLocalPos(w, h);

  const frameGrey = isDark
    ? 'rgba(255, 255, 255, 0.22)'
    : 'rgba(156, 163, 175, 0.68)'; // Soft, faint neutral whisper-grey (matches burner flame button)

  const iconGrey = isDark
    ? 'rgba(255, 255, 255, 0.65)'
    : 'rgba(100, 116, 139, 0.88)'; // Soft neutral grey for icons

  const bgFill = isDark ? 'rgba(30, 41, 59, 0.95)' : '#fdfbf7';

  // 1. Droplet Squircle Button (Fill cycle)
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1.0;
  ctx.fillStyle = bgFill;
  ctx.strokeStyle = frameGrey;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.roundRect(dropletX - btnHalf, dropletY - btnHalf, btnSize, btnSize, 5.5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Droplet icon inside (monochrome outline only, NO text)
  drawDropletIcon(ctx, dropletX, dropletY, iconGrey);

  // 2. Pencil Squircle Button (Settings)
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1.0;
  ctx.fillStyle = bgFill;
  ctx.strokeStyle = frameGrey;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.roundRect(pencilX - btnHalf, pencilY - btnHalf, btnSize, btnSize, 5.5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Pencil icon inside (grey on soft white/beige background)
  drawPencilIcon(ctx, pencilX, pencilY, iconGrey);

  // 3. Ephemeral 1.5s Fade-out Volume Feedback Badge
  if (objId) {
    const feedback = containerFillFeedbackMap.get(objId);
    if (feedback) {
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
        const badgeCenterY = pencilY - btnHalf - 12 - floatUp;

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
  _isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string,
  objId?: string,
  objX?: number,
  objY?: number,
  parentBasin?: HeatObject
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

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 500;
  const liquidType = state?.liquidType ?? 'water';

  // Headspace gap at 100% capacity: reduced to ~40% of previous gap so liquid is much closer to the rim
  const fullHeadspace = (0.14 * bh + 8.6) * 0.40;
  const fillRatio = Math.max(0, Math.min(1.0, vol / cap));
  const liquidH = Math.max(0, (bh - fullHeadspace) * fillRatio);
  const liquidTopY = y + bh - liquidH;

  // 1. Physical Beaker & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

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
      ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh);
      ctx.lineTo(x + cornerR, y + bh);
      ctx.quadraticCurveTo(x, y + bh, x, y + bh - cornerR);
      ctx.lineTo(surface[0].x, surface[0].y);
      ctx.closePath();
      ctx.clip();

      renderLiquidBody(ctx, liquidType, x, liquidTopY, bw, liquidH, y + bh, 0, x - 4, x + bw + 4, surface);

      // Boiling Bubbles & Steam (dynamic animation, never on static paper background)
      if (state?.isBoiling && layer !== 'apparatus') {
        renderBoilingBubbles(ctx, x, liquidTopY, bw, liquidH);
        renderSteam(ctx, x + bw / 2, liquidTopY - 6, bw);
      }

      ctx.restore();
    }

    // Outer Glass Beaker Path (clean straight elevation with rolled bead rim and left spout matching Image 6)
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
    ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh);
    // Flat resting base
    ctx.lineTo(x + cornerR, y + bh);
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
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.45)' : 'rgba(17, 24, 39, 0.40)';
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

    // If submerged inside a wide-basin water bath, apply water refraction overlay on submerged base
    if (parentBasin && parentBasin.containerState && parentBasin.containerState.volumeMl > 0) {
      const bcs = parentBasin.containerState;
      const bFillRatio = Math.max(0, Math.min(1.0, bcs.volumeMl / bcs.capacityMl));
      const bPad = 8;
      const bBh = parentBasin.height - bPad * 2 - 6;
      const bHeadspace = (0.15 * bBh + 8.5) * 0.40;
      const bLiquidH = Math.max(0, (bBh - bHeadspace) * bFillRatio);
      const bLiquidTopY = bPad + 4 + bBh - bLiquidH;
      const basinWaterGlobalY = parentBasin.y + bLiquidTopY;
      const basinWaterLocalY = basinWaterGlobalY - (objY ?? 0);

      if (basinWaterLocalY < y + bh) {
        ctx.save();
        ctx.beginPath();
        const subY = Math.max(y, basinWaterLocalY);
        ctx.moveTo(x - 2, subY);
        ctx.lineTo(x + bw + 2, subY);
        ctx.lineTo(x + bw + 2, y + bh - cornerR);
        ctx.quadraticCurveTo(x + bw + 2, y + bh + 1, x + bw - cornerR, y + bh + 1);
        ctx.lineTo(x + cornerR, y + bh + 1);
        ctx.quadraticCurveTo(x - 2, y + bh + 1, x - 2, y + bh - cornerR);
        ctx.closePath();
        ctx.fillStyle =
          bcs.liquidType === 'oil'
            ? 'rgba(163, 230, 53, 0.22)'
            : bcs.liquidType === 'milk'
            ? 'rgba(255, 255, 255, 0.45)'
            : 'rgba(56, 189, 248, 0.22)';
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // 2. Permanent Discreet Action Buttons (Droplet & Pencil) at bottom-right
  if (layer === 'all' || layer === 'ui') {
    renderContainerActionButtons(ctx, objId, w, h, isDark);
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
  _isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string,
  objId?: string,
  objX?: number,
  objY?: number
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
      ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh);
      ctx.lineTo(x + cornerR, y + bh);
      ctx.quadraticCurveTo(x, y + bh, x, y + bh - cornerR);
      ctx.lineTo(surface[0].x, surface[0].y);
      ctx.closePath();
      ctx.clip();

      renderLiquidBody(ctx, liquidType, x, liquidTopY, bw, liquidH, y + bh, 0, x - 4, x + bw + 4, surface);

      if (state?.isBoiling && layer !== 'apparatus') {
        renderBoilingBubbles(ctx, x, liquidTopY, bw, liquidH);
        renderSteam(ctx, x + bw / 2, liquidTopY - 6, bw);
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
    ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh);
    // Flat resting base
    ctx.lineTo(x + cornerR, y + bh);
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
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.45)' : 'rgba(17, 24, 39, 0.40)';
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

  // 2. Permanent Discreet Action Buttons (Droplet & Pencil) at bottom-right
  if (layer === 'all' || layer === 'ui') {
    renderContainerActionButtons(ctx, objId, w, h, isDark);
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
  _isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all',
  customColor?: string,
  objId?: string,
  objX?: number,
  objY?: number,
  parentBasin?: HeatObject
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

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 500;
  const liquidType = state?.liquidType ?? 'water';

  // Headspace gap at 100% capacity: reduced to ~40% of previous gap so liquid is much closer to the rim
  const fullHeadspace = (0.14 * bh + 8.6) * 0.40;
  const fillRatio = Math.max(0, Math.min(1.0, vol / cap));
  const liquidH = Math.max(0, (bh - fullHeadspace) * fillRatio);
  const liquidTopY = y + bh - liquidH;

  // 1. Physical Flask & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    const coneTopY = y + neckH;
    const coneBotY = y + bh - cornerR;
    const isAboveNeck = liquidTopY < coneTopY;
    const t = isAboveNeck ? 0 : Math.max(0, Math.min(1, (liquidTopY - coneTopY) / Math.max(1, coneBotY - coneTopY)));
    const surfaceHalfW = isAboveNeck ? neckW / 2 : (neckW / 2) + t * (baseHalfW - neckW / 2);

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
      ctx.quadraticCurveTo(cx + baseHalfW, y + bh, cx + baseHalfW - cornerR, y + bh);
      ctx.lineTo(cx - baseHalfW + cornerR, y + bh);
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
        y + bh,
        0,
        cx - baseHalfW - 4,
        cx + baseHalfW + 4,
        surface
      );

      if (state?.isBoiling && layer !== 'apparatus') {
        renderBoilingBubbles(ctx, cx - surfaceHalfW * 0.7, liquidTopY, surfaceHalfW * 1.4, liquidH);
        renderSteam(ctx, cx, y - 4, neckW);
      }
      ctx.restore();
    }

    // Outer Flask Line-Art (straight neck with rolled mouth bead collar & conical body, exactly matching Image 6)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
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
    ctx.quadraticCurveTo(cx + baseHalfW, y + bh, cx + baseHalfW - cornerR, y + bh);
    // Flat resting base
    ctx.lineTo(cx - baseHalfW + cornerR, y + bh);
    // Bottom left corner
    ctx.quadraticCurveTo(cx - baseHalfW, y + bh, cx - baseHalfW, y + bh - cornerR);
    // Conical left wall
    ctx.lineTo(cx - neckW / 2, y + neckH);
    // Neck left wall
    ctx.lineTo(cx - neckW / 2, y + collarH);
    ctx.stroke();

    // Rolled Glass Mouth Collar / Bead (straight horizontal flange on top of neck)
    ctx.beginPath();
    ctx.roundRect(collarLeft, y, collarRight - collarLeft, collarH, collarH / 2);
    ctx.stroke();

    ctx.restore();
  }

  // 2. Permanent Discreet Action Buttons (Droplet & Pencil) at bottom-right
  if (layer === 'all' || layer === 'ui') {
    renderContainerActionButtons(ctx, objId, w, h, isDark);
  }
}

/**
 * 6. Precision Laboratory Thermometer
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
  thermY?: number
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

  // Compute depth & submerged level if thermometer is dipped into a liquid container
  let submergedLocalY: number | null = null;
  let dippedLiquidType: LiquidType = 'water';
  if (dippedContainer && dippedContainer.containerState && dippedContainer.containerState.volumeMl > 0) {
    const cs = dippedContainer.containerState;
    dippedLiquidType = cs.liquidType || 'water';
    const fillRatio = Math.max(0, Math.min(1.0, cs.volumeMl / cs.capacityMl));
    const cPad = 8;
    const cBh = dippedContainer.height - cPad * 2 - 6;
    const isBasin = dippedContainer.type === 'wide-basin';
    const cHeadspace = isBasin ? (0.15 * cBh + 8.5) * 0.40 : (0.14 * cBh + 8.6) * 0.40;
    const cLiquidH = Math.max(0, (cBh - cHeadspace) * fillRatio);
    const cLiquidTopY = cPad + 4 + cBh - cLiquidH;
    const containerLiquidTopGlobalY = dippedContainer.y + cLiquidTopY;
    submergedLocalY = containerLiquidTopGlobalY - (thermY ?? 0);
  }

  // 1. Physical Thermometer Sketch (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    // Glass Outer Stem
    ctx.beginPath();
    ctx.roundRect(cx - stemW / 2, topY, stemW, stemH, stemW / 2);
    ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.65)';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Glass Bulb at bottom
    ctx.beginPath();
    ctx.arc(cx, botY + 2, bulbR, 0, Math.PI * 2);
    const bulbGrad = ctx.createRadialGradient(cx - 2, botY, 1, cx, botY + 2, bulbR);
    bulbGrad.addColorStop(0, '#60a5fa');
    bulbGrad.addColorStop(0.7, '#2563eb');
    bulbGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = bulbGrad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Liquid Column inside stem with gradient: Blue (0°C) -> Green (30°C) -> Orange (65°C) -> Red (100°C)
    const colW = stemW - 3;
    if (tempFrac > 0.005) {
      const colGrad = ctx.createLinearGradient(cx, botY + 2, cx, liquidTopY);
      colGrad.addColorStop(0, '#2563eb'); // Blue at 0°C base
      if (temp > 30) {
        colGrad.addColorStop(Math.min(0.85, 30 / temp), '#10b981'); // Green
      }
      if (temp > 65) {
        colGrad.addColorStop(Math.min(0.92, 65 / temp), '#f97316'); // Orange
      }
      colGrad.addColorStop(1, liquidColor); // Exact current temperature color at top meniscus

      ctx.beginPath();
      ctx.roundRect(cx - colW / 2, liquidTopY, colW, botY - liquidTopY + 2, [colW / 2, colW / 2, 0, 0]);
      ctx.fillStyle = colGrad;
      ctx.fill();
    }

    // Calibration Tick Marks (0 to 100 °C)
    for (let t = 0; t <= 100; t += 10) {
      const ty = botY - stemH * (t / 100);
      const isSubmerged = submergedLocalY !== null && ty >= submergedLocalY;
      const isMajor = t === 0 || t === 50 || t === 100;
      const tickLen = isMajor ? 6 : 3.5;

      ctx.beginPath();
      ctx.moveTo(cx + stemW / 2, ty);
      ctx.lineTo(cx + stemW / 2 + tickLen, ty);
      ctx.strokeStyle = isSubmerged
        ? (isDark ? 'rgba(248, 250, 252, 0.22)' : 'rgba(17, 24, 39, 0.24)')
        : strokeColor;
      ctx.lineWidth = isSubmerged ? 0.7 : 0.9;
      ctx.stroke();

      if (isMajor) {
        // Soft gentle grey for 0, 50, 100 scale labels
        ctx.fillStyle = isSubmerged
          ? (isDark ? 'rgba(248, 250, 252, 0.20)' : 'rgba(148, 163, 184, 0.35)')
          : (isDark ? 'rgba(248, 250, 252, 0.50)' : '#94a3b8');
        ctx.font = 'bold 7.5px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${t}`, cx + stemW / 2 + 7.5, ty + 2.5);
      }
    }

    // If submerged in liquid, apply soft immersion wash and soften the outer glass & bulb stroke
    if (submergedLocalY !== null && submergedLocalY < botY + bulbR) {
      const subTop = Math.max(topY, submergedLocalY);
      const subH = (botY + bulbR + 4) - subTop;

      ctx.save();
      // 1. Soft immersion veil over the submerged portion of the thermometer
      ctx.beginPath();
      ctx.roundRect(cx - bulbR - 4, subTop, (bulbR + 4) * 2, subH, 6);
      ctx.fillStyle =
        dippedLiquidType === 'oil'
          ? 'rgba(163, 230, 53, 0.28)'
          : dippedLiquidType === 'milk'
          ? 'rgba(255, 255, 255, 0.55)'
          : 'rgba(56, 189, 248, 0.28)'; // water
      ctx.fill();

      // 2. Soften the harsh black outer stroke underwater to simulate light refraction
      ctx.strokeStyle = isDark
        ? 'rgba(30, 41, 59, 0.55)'
        : 'rgba(255, 255, 255, 0.50)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();
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
    ctx.strokeStyle = liquidColor;
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
 * Animated Boiling Bubbles
 */
function renderBoilingBubbles(
  ctx: CanvasRenderingContext2D,
  lx: number,
  ly: number,
  lw: number,
  lh: number
): void {
  ctx.save();
  const time = Date.now() / 1000;
  const numBubbles = 8;
  for (let i = 0; i < numBubbles; i++) {
    const phase = (time * 1.5 + i * 0.35) % 1;
    const bx = lx + 8 + ((i * 37) % (lw - 16)) + Math.sin(time * 3 + i) * 3;
    const by = ly + lh - 4 - phase * (lh - 8);
    const r = 1.5 + ((i % 3) * 1.2);

    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Animated Rising Steam Puffs
 */
function renderSteam(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  _sw: number
): void {
  ctx.save();
  const time = Date.now() / 1000;
  for (let i = 0; i < 4; i++) {
    const phase = (time * 0.8 + i * 0.25) % 1;
    const px = sx + Math.sin(time * 2 + i * 1.5) * 12 + (i - 1.5) * 6;
    const py = sy - phase * 32;
    const radius = 5 + phase * 10;
    const opacity = (1.0 - phase) * 0.35;

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
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
  isDark: boolean
): void {
  const g = sim.graph;
  const gx = g.x;
  const gy = g.y;
  const gw = g.width;
  const gh = g.height;

  ctx.save();

  // Glass Card Background (iPadOS frosted glass)
  ctx.beginPath();
  ctx.roundRect(gx, gy, gw, gh, 16);
  ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(253, 251, 247, 0.86)';
  ctx.fill();
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.90)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Header Title - Clean Greek θ - t title
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = isDark ? '#f8fafc' : '#234978';
  ctx.textAlign = 'left';
  ctx.fillText('Διάγραμμα Θερμοκρασίας - Χρόνου (θ - t)', gx + 16, gy + 19);

  // Plot Area with ample margin so title and axes never collide!
  const plotX = gx + 46;
  const plotY = gy + 46;
  const plotW = gw - 68;
  const plotH = gh - 68;

  // Grid lines (0, 25, 50, 75, 100 °C)
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 1;
  for (let temp = 0; temp <= 100; temp += 25) {
    const py = plotY + plotH - (temp / 100) * plotH;
    ctx.beginPath();
    ctx.moveTo(plotX, py);
    ctx.lineTo(plotX + plotW, py);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${temp}°`, plotX - 6, py + 3);
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
  ctx.fillText('t (s)', plotX + plotW + 8, plotY + plotH + 3.5);

  // Plot Curves from history
  if (sim.history.length > 1) {
    const lastT = sim.history[sim.history.length - 1].timeSec;
    const windowSec = Math.max(30, lastT);
    const startT = Math.max(0, lastT - windowSec);

    const mapX = (t: number) => plotX + ((t - startT) / windowSec) * plotW;
    const mapY = (temp: number) => plotY + plotH - (Math.max(0, Math.min(100, temp)) / 100) * plotH;

    // Asymptote line if thermal equilibrium exists
    const lastEq = sim.history[sim.history.length - 1].tempEquilibrium;
    if (lastEq !== undefined) {
      const eqY = mapY(lastEq);
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(plotX, eqY);
      ctx.lineTo(plotX + plotW, eqY);
      ctx.stroke();
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 8.5px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`θισορ = ${lastEq.toFixed(1)}°C`, plotX + plotW - 4, eqY - 4);
      ctx.restore();
    }

    // Curve 1 (Primary container / Inner vessel) - Orange `#f97316`
    ctx.save();
    ctx.beginPath();
    let started1 = false;
    for (const pt of sim.history) {
      if (pt.timeSec < startT) continue;
      const x = mapX(pt.timeSec);
      const y = mapY(pt.temp1);
      if (!started1) {
        ctx.moveTo(x, y);
        started1 = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();

    // Curve 2 (Water bath / Outer basin) if present - Cyan `#0284c7`
    const hasCurve2 = sim.history.some((p) => p.temp2 !== undefined);
    if (hasCurve2) {
      ctx.save();
      ctx.beginPath();
      let started2 = false;
      for (const pt of sim.history) {
        if (pt.timeSec < startT || pt.temp2 === undefined) continue;
        const x = mapX(pt.timeSec);
        const y = mapY(pt.temp2);
        if (!started2) {
          ctx.moveTo(x, y);
          started2 = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }

    // Legend
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillStyle = '#f97316';
    ctx.textAlign = 'left';
    ctx.fillText('— Δοχείο 1', plotX + 8, gy + 32);

    if (hasCurve2) {
      ctx.fillStyle = '#0284c7';
      ctx.fillText('— Υδατόλουτρο', plotX + 75, gy + 32);
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
