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
    return lerpColor('#2563eb', '#059669', clamped / 30);
  } else if (clamped <= 65) {
    return lerpColor('#059669', '#d97706', (clamped - 30) / 35);
  } else {
    return lerpColor('#d97706', '#dc2626', (clamped - 65) / 35);
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
        renderBurner(ctx, obj.width, obj.height, obj.burnerState, isDark, isSelected, layer);
        break;
      case 'tripod':
        renderTripod(ctx, obj.width, obj.height, obj.tripodState?.wireGauzeTemp || 20, isDark, isSelected, layer);
        break;
      case 'beaker':
        renderBeaker(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected, layer);
        break;
      case 'wide-basin':
        renderWideBasin(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected, layer);
        break;
      case 'flask':
        renderFlask(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected, layer);
        break;
      case 'thermometer':
        renderThermometer(ctx, obj.width, obj.height, obj.thermometerState, isDark, isSelected, layer);
        break;
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

  // 4. Floating Action Bar (Pill Handles) positioned cleanly above or below the frame
  const pillY = minY < 45 ? maxY + 24 : minY - 24;
  const hasContainer = type === 'beaker' || type === 'wide-basin' || type === 'flask';
  const hasBurner = type === 'burner';

  // Trash Can Button (Red Circle with white trash icon)
  const trashX = hasContainer ? cx + 46 : hasBurner ? cx + 44 : cx;
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 1.5;
  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(trashX, pillY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White Trash Can Icon
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(trashX - 5, pillY - 3.5);
  ctx.lineTo(trashX + 5, pillY - 3.5);
  ctx.moveTo(trashX - 2, pillY - 3.5);
  ctx.lineTo(trashX - 2, pillY - 5.5);
  ctx.lineTo(trashX + 2, pillY - 5.5);
  ctx.lineTo(trashX + 2, pillY - 3.5);
  ctx.moveTo(trashX - 4, pillY - 3.5);
  ctx.lineTo(trashX - 3.2, pillY + 5);
  ctx.lineTo(trashX + 3.2, pillY + 5);
  ctx.lineTo(trashX + 4, pillY - 3.5);
  ctx.stroke();
  ctx.restore();

  // Quick Action Pills next to trash button
  if (hasContainer) {
    // Fill Pill [ 💧 Γέμισμα ] / [ 💧 250ml ]
    const fillX = cx - 24;
    const pillW = 60;
    const pillH = 20;
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = volumeMl && volumeMl > 0 ? '#2563eb' : '#ffffff';
    ctx.strokeStyle = volumeMl && volumeMl > 0 ? '#1d4ed8' : '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(fillX - pillW / 2, pillY - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 9.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = volumeMl && volumeMl > 0 ? '#ffffff' : '#1e293b';
    ctx.fillText(volumeMl && volumeMl > 0 ? `💧 ${volumeMl}ml` : '💧 Γέμισμα', fillX, pillY);

    // Edit Pencil Button [ ✎ ]
    const editX = cx + 18;
    ctx.fillStyle = '#234978';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(editX, pillY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('✎', editX, pillY);
    ctx.restore();
  } else if (hasBurner) {
    // Flame Toggle Pill [ 🔥 ON / OFF ]
    const flameX = cx - 12;
    const pillW = 68;
    const pillH = 20;
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = burnerOn ? '#16a34a' : '#ffffff';
    ctx.strokeStyle = burnerOn ? '#15803d' : '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(flameX - pillW / 2, pillY - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 9.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = burnerOn ? '#ffffff' : '#1e293b';
    ctx.fillText(burnerOn ? '🔥 ON' : '🔥 OFF', flameX, pillY);
    ctx.restore();
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

  // A. Counter Badge Pill [ ✨ N Αντικείμενα ]
  const badgeW = 96;
  const badgeH = 22;
  const badgeX = cx - 18;
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

  // B. Group Red Trash Can Button [ 🗑️ ]
  const trashX = cx + 46;
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 1.5;
  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(trashX, pillY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White Trash Can Icon
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(trashX - 5, pillY - 3.5);
  ctx.lineTo(trashX + 5, pillY - 3.5);
  ctx.moveTo(trashX - 2, pillY - 3.5);
  ctx.lineTo(trashX - 2, pillY - 5.5);
  ctx.lineTo(trashX + 2, pillY - 5.5);
  ctx.lineTo(trashX + 2, pillY - 3.5);
  ctx.moveTo(trashX - 4, pillY - 3.5);
  ctx.lineTo(trashX - 3.2, pillY + 5);
  ctx.lineTo(trashX + 3.2, pillY + 5);
  ctx.lineTo(trashX + 4, pillY - 3.5);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * Helper: renders gorgeous multi-stop liquid depth gradient with 3D elliptical meniscus
 */
function renderLiquidBody(
  ctx: CanvasRenderingContext2D,
  liquidType: LiquidType,
  x: number,
  liquidTopY: number,
  bw: number,
  liquidH: number,
  bottomY: number,
  meniscusRy: number = 4.5,
  fillMinX?: number,
  fillMaxX?: number
): void {
  const fx = fillMinX ?? (x - 4);
  const fw = fillMaxX !== undefined ? fillMaxX - fx : bw + 8;
  const fy = liquidTopY - meniscusRy * 0.5;
  const fh = Math.max(1, bottomY - fy + 6);

  // 1. Vertical linear depth gradient
  const grad = ctx.createLinearGradient(x + bw / 2, liquidTopY, x + bw / 2, bottomY);
  if (liquidType === 'oil') {
    grad.addColorStop(0, 'rgba(254, 249, 195, 0.85)'); // Golden surface sheen
    grad.addColorStop(0.18, 'rgba(250, 204, 21, 0.70)'); // Luminous olive oil
    grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.75)'); // Amber midtone
    grad.addColorStop(1, 'rgba(180, 83, 9, 0.85)'); // Rich golden depth
  } else if (liquidType === 'milk') {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.96)'); // Pure white cream top
    grad.addColorStop(0.25, 'rgba(254, 252, 232, 0.92)'); // Ivory milk
    grad.addColorStop(0.7, 'rgba(254, 243, 199, 0.88)'); // Soft warm milk
    grad.addColorStop(1, 'rgba(253, 230, 138, 0.82)'); // Base density
  } else {
    // Water
    grad.addColorStop(0, 'rgba(224, 242, 254, 0.88)'); // Crystal clear highlight
    grad.addColorStop(0.15, 'rgba(186, 230, 253, 0.70)'); // Sky water
    grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.62)'); // Aquamarine
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.78)'); // Deep clear blue
  }

  ctx.fillStyle = grad;
  ctx.fillRect(fx, fy, fw, fh);

  // 2. Surface Meniscus with 3D elliptical curvature
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x + bw / 2, liquidTopY, bw / 2, meniscusRy, 0, 0, Math.PI * 2);

  const meniscusGrad = ctx.createRadialGradient(
    x + bw / 2, liquidTopY, 2,
    x + bw / 2, liquidTopY, bw / 2
  );
  if (liquidType === 'oil') {
    meniscusGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    meniscusGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.75)');
    meniscusGrad.addColorStop(1, 'rgba(180, 83, 9, 0.85)');
  } else if (liquidType === 'milk') {
    meniscusGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    meniscusGrad.addColorStop(1, 'rgba(254, 243, 199, 0.88)');
  } else {
    meniscusGrad.addColorStop(0, 'rgba(240, 249, 255, 0.98)');
    meniscusGrad.addColorStop(0.6, 'rgba(125, 211, 252, 0.80)');
    meniscusGrad.addColorStop(1, 'rgba(2, 132, 199, 0.85)');
  }

  ctx.fillStyle = meniscusGrad;
  ctx.fill();

  ctx.strokeStyle = liquidType === 'oil' ? '#b45309' : liquidType === 'milk' ? '#ca8a04' : '#0284c7';
  ctx.lineWidth = 1.3;
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
  layer: 'all' | 'apparatus' | 'ui' = 'all'
): void {
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const cx = w / 2;

  // 2.5D Proportions matching reference sketch in media_1794725655308_28bf8f8b.png
  const groundY = h - 14;
  const baseW = w * 0.78;
  const baseRy = 6.2;
  const footH = 5.5;
  const cyBot = groundY - baseRy;
  const cyTop = cyBot - footH;

  const coneTopY = cyTop - 13;
  const coneTopW = w * 0.18;

  const collarH = 13;
  const collarTopY = coneTopY - collarH;
  const collarW = coneTopW * 1.15;

  const stemW = coneTopW * 0.82;
  const nozzleH = 12.5;
  const nozzleTopY = Math.max(16, h * 0.22);
  const nozzleBotY = nozzleTopY + nozzleH;
  const nozzleW = stemW * 1.35;

  // 1. Physical Apparatus Sketch (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Flame when ON (realistic organic candle flame inspired by CodePen YLGjvx)
    if (state?.isOn) {
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

    // E. Bottom base back curve (subtle ground ellipse)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cyBot, baseW / 2, baseRy, 0, Math.PI, 0);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.25)' : 'rgba(17, 24, 39, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // F. Left flare reflection line (hand-drawn sketch accent from reference)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - baseW * 0.34, cyTop - 1);
    ctx.quadraticCurveTo(cx - coneTopW * 0.9, coneTopY + 8, cx - coneTopW * 0.65, coneTopY + 2);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.45)' : 'rgba(17, 24, 39, 0.40)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // 2. Air Collar Sleeve with Vertical Vent Slot
    // A. Lower collar ring
    ctx.beginPath();
    ctx.ellipse(cx, coneTopY, collarW / 2, 2.6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // B. Collar cylinder sides
    ctx.beginPath();
    ctx.moveTo(cx - collarW / 2, collarTopY);
    ctx.lineTo(cx - collarW / 2, coneTopY);
    ctx.moveTo(cx + collarW / 2, collarTopY);
    ctx.lineTo(cx + collarW / 2, coneTopY);
    ctx.stroke();

    // C. Upper collar ring
    ctx.beginPath();
    ctx.ellipse(cx, collarTopY, collarW / 2, 2.6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // D. Vertical Oval Air Aperture Slot (exact from reference)
    ctx.beginPath();
    ctx.ellipse(cx, collarTopY + collarH * 0.5, 2.3, collarH * 0.28, 0, 0, Math.PI * 2);
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
    // A. Neck step under nozzle
    ctx.beginPath();
    ctx.ellipse(cx, nozzleBotY, stemW * 0.72, 2.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // B. Nozzle cylinder sides
    ctx.beginPath();
    ctx.moveTo(cx - nozzleW / 2, nozzleBotY);
    ctx.lineTo(cx - nozzleW / 2, nozzleTopY);
    ctx.moveTo(cx + nozzleW / 2, nozzleBotY);
    ctx.lineTo(cx + nozzleW / 2, nozzleTopY);
    ctx.stroke();

    // C. Top rim 2.5D open mouth ellipse
    ctx.beginPath();
    ctx.ellipse(cx, nozzleTopY, nozzleW / 2, 3.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // D. Inner orifice depth ellipse
    ctx.beginPath();
    ctx.ellipse(cx, nozzleTopY, nozzleW / 2 - 2, 2.0, 0, 0, Math.PI * 2);
    ctx.stroke();

    // E. Left nozzle highlight streak
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - nozzleW * 0.3, nozzleBotY - 1);
    ctx.lineTo(cx - nozzleW * 0.3, nozzleTopY + 2);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.42)' : 'rgba(17, 24, 39, 0.38)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // 2. Interactive UI Controls (ui / all)
  if (layer === 'all' || layer === 'ui') {
    const btnY = cyBot + baseRy + 4;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - 28, btnY, 56, 17, 8.5);
    ctx.fillStyle = state?.isOn ? '#16a34a' : isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.92)';
    ctx.fill();
    ctx.strokeStyle = state?.isOn ? '#15803d' : 'rgba(100, 116, 139, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = state?.isOn ? '#ffffff' : isDark ? '#f8fafc' : '#334155';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state?.isOn ? 'ΦΛΟΓΑ ON' : 'OFF', cx, btnY + 8.5);
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
  layer: 'all' | 'apparatus' | 'ui' = 'all'
): void {
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const cx = w / 2;
  const collarW = w * 0.72;
  const collarH = h * 0.14;
  const topY = 4;
  const legBotY = h - 6;

  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Recessed Back Leg (rotated off-center to the left, rendered faint gray so burner placed underneath remains crystal-clear)
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.40)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - collarW * 0.20, topY + collarH * 0.20);
    ctx.lineTo(cx - collarW * 0.30, legBotY - 6);
    ctx.stroke();
    ctx.restore();

    // 2. Front Left Leg (crisp foreground line-art)
    ctx.beginPath();
    ctx.moveTo(cx - collarW * 0.44, topY + collarH * 0.58);
    ctx.lineTo(cx - collarW * 0.58, legBotY);
    ctx.stroke();

    // 3. Front Right Leg (crisp foreground line-art)
    ctx.beginPath();
    ctx.moveTo(cx + collarW * 0.34, topY + collarH * 0.54);
    ctx.lineTo(cx + collarW * 0.50, legBotY);
    ctx.stroke();

    // Circular Top Collar Ring
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(cx, topY + collarH * 0.5, collarW / 2, collarH / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Wire Gauze mesh crosshatch
    const gauzeW = collarW * 0.88;
    const gauzeH = collarH * 0.88;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, topY + collarH * 0.5, gauzeW / 2, gauzeH / 2, 0, 0, Math.PI * 2);
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

    // Central ceramic circle (heats up with burner)
    const ceramicR = gauzeH * 0.52;
    const heatFraction = Math.max(0, Math.min(1, (gauzeTempC - 20) / 450));

    ctx.beginPath();
    ctx.ellipse(cx, topY + collarH * 0.5, ceramicR * 1.5, ceramicR, 0, 0, Math.PI * 2);
    if (heatFraction > 0.05) {
      const discGlow = ctx.createRadialGradient(cx, topY + collarH * 0.5, 2, cx, topY + collarH * 0.5, ceramicR * 1.5);
      discGlow.addColorStop(0, '#fef08a');
      discGlow.addColorStop(0.4, '#f97316');
      discGlow.addColorStop(0.85, '#dc2626');
      discGlow.addColorStop(1, 'rgba(185, 28, 28, 0.4)');
      ctx.fillStyle = discGlow;
    } else {
      ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.75)';
    }
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
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
  layer: 'all' | 'apparatus' | 'ui' = 'all'
): void {
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const pad = 8;
  const bw = w - pad * 2;
  const bh = h - pad * 2 - 6;
  const x = pad;
  const y = pad + 4;
  const cx = x + bw / 2;
  const rimH = 14;
  const bottomRy = 6.5;
  const cyBot = y + bh - bottomRy;
  const baseRx = bw / 2;
  const spoutW = 12;

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 500;
  const liquidType = state?.liquidType ?? 'water';

  const maxLiquidFraction = 0.86;
  const liquidFrac = Math.min(maxLiquidFraction, (vol / cap) * maxLiquidFraction);
  const liquidH = (bh - 10) * liquidFrac;
  const liquidTopY = y + bh - liquidH;

  // 1. Physical Beaker & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    // Draw Liquid Fill if volume > 0 - Fills 100% of curved beaker base with NO white gaps!
    if (vol > 0 && liquidH > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, liquidTopY);
      ctx.lineTo(x, cyBot);
      ctx.ellipse(cx, cyBot, baseRx, bottomRy, 0, Math.PI, 0, true);
      ctx.lineTo(x + bw, liquidTopY);
      ctx.ellipse(cx, liquidTopY, baseRx, rimH * 0.35, 0, 0, Math.PI, true);
      ctx.closePath();
      ctx.clip();

      renderLiquidBody(ctx, liquidType, x, liquidTopY, bw, liquidH, y + bh, rimH * 0.35, x - 4, x + bw + 4);

      // Boiling Bubbles & Steam
      if (state?.isBoiling) {
        renderBoilingBubbles(ctx, x, liquidTopY, bw, liquidH);
        renderSteam(ctx, cx, liquidTopY - 6, bw);
      }

      ctx.restore();
    }

    // Outer Glass Beaker Path (with left pouring spout & curved rim flare)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Spout tip
    ctx.moveTo(x - spoutW, y + 2);
    // Spout top curve blending into top rim
    ctx.quadraticCurveTo(x - 2, y, x + 4, y);
    // Top rim to right flare
    ctx.lineTo(x + bw - 4, y);
    ctx.quadraticCurveTo(x + bw + 3, y + 2, x + bw, y + rimH / 2);
    // Right vertical wall
    ctx.lineTo(x + bw, cyBot);
    // Bottom outer curve (base 2.5D ellipse)
    ctx.ellipse(cx, cyBot, baseRx, bottomRy, 0, 0, Math.PI, false);
    // Left vertical wall
    ctx.lineTo(x, y + rimH / 2 + 5);
    // Spout under-curve
    ctx.quadraticCurveTo(x - 2, y + 6, x - spoutW, y + 2);
    ctx.stroke();

    // Top Rim 2.5D Ellipse (Open beaker mouth from sketch)
    ctx.beginPath();
    ctx.ellipse(cx, y + rimH / 2, bw / 2, rimH / 2, 0, 0, Math.PI * 2);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Inner Glass Lip (Double lip from reference sketch)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, y + rimH / 2, bw / 2 - 2.2, rimH / 2 - 1.6, 0, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.40)' : 'rgba(17, 24, 39, 0.35)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();

    // Bottom 2.5D Depth Curve (visible through glass, exactly as in media_1794694870640_233b6a5d.jpg)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cyBot, baseRx, bottomRy, 0, Math.PI, 0, false);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.40)' : 'rgba(17, 24, 39, 0.35)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // Vertical glass reflection sheen strip on right side
    const reflectGrad = ctx.createLinearGradient(x + bw - 14, y, x + bw - 4, y);
    reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    reflectGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = reflectGrad;
    ctx.fillRect(x + bw - 14, y + rimH, 10, bh - rimH - bottomRy * 2);

    ctx.restore();
  }
}

/**
 * 4. Wide Basin / Water Bath (Υδατόλουτρο) - Plain clean glass (NO measurement lines)
 */
function renderWideBasin(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  _isSelected: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all'
): void {
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const pad = 8;
  const bw = w - pad * 2;
  const bh = h - pad * 2 - 6;
  const x = pad;
  const y = pad + 4;
  const cx = x + bw / 2;
  const rimH = 14;
  const bottomRy = 7.0;
  const cyBot = y + bh - bottomRy;
  const baseRx = bw / 2;

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 800;
  const liquidType = state?.liquidType ?? 'water';

  const maxLiquidFraction = 0.85;
  const liquidFrac = Math.min(maxLiquidFraction, (vol / cap) * maxLiquidFraction);
  const liquidH = (bh - 10) * liquidFrac;
  const liquidTopY = y + bh - liquidH;

  // 1. Physical Basin Sketch & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    // Liquid Fill - Fills 100% of basin base with NO white gaps!
    if (vol > 0 && liquidH > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, liquidTopY);
      ctx.lineTo(x, cyBot);
      ctx.ellipse(cx, cyBot, baseRx, bottomRy, 0, Math.PI, 0, true);
      ctx.lineTo(x + bw, liquidTopY);
      ctx.ellipse(cx, liquidTopY, baseRx, rimH * 0.4, 0, 0, Math.PI, true);
      ctx.closePath();
      ctx.clip();

      renderLiquidBody(ctx, liquidType, x, liquidTopY, bw, liquidH, y + bh, rimH * 0.4, x - 4, x + bw + 4);

      if (state?.isBoiling) {
        renderBoilingBubbles(ctx, x, liquidTopY, bw, liquidH);
        renderSteam(ctx, cx, liquidTopY - 6, bw);
      }
      ctx.restore();
    }

    // Basin Outer Outline
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(x - 8, y + 2);
    ctx.quadraticCurveTo(x, y + 4, x, y + 14);
    ctx.lineTo(x, cyBot);
    // Bottom outer curve
    ctx.ellipse(cx, cyBot, baseRx, bottomRy, 0, 0, Math.PI, false);
    ctx.lineTo(x + bw, y + 14);
    ctx.quadraticCurveTo(x + bw, y + 4, x + bw + 8, y + 2);
    ctx.stroke();

    // Top Rim 2.5D Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, y + rimH / 2, bw / 2, rimH / 2, 0, 0, Math.PI * 2);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Inner rim line
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, y + rimH / 2, bw / 2 - 2, rimH / 2 - 1.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.40)' : 'rgba(17, 24, 39, 0.35)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();

    // Bottom 2.5D Depth Curve
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cyBot, baseRx, bottomRy, 0, Math.PI, 0, false);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.40)' : 'rgba(17, 24, 39, 0.35)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
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
  layer: 'all' | 'apparatus' | 'ui' = 'all'
): void {
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const pad = 8;
  const bw = w - pad * 2;
  const bh = h - pad * 2 - 6;
  const x = pad;
  const y = pad + 4;
  const cx = x + bw / 2;
  const neckW = bw * 0.28;
  const neckH = bh * 0.36;
  const bottomRy = 6.5;
  const cyBot = y + bh - bottomRy;
  const baseRx = bw / 2 - 5;

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 500;
  const liquidType = state?.liquidType ?? 'water';

  const maxLiquidFraction = 0.86;
  const liquidFrac = Math.min(maxLiquidFraction, (vol / cap) * maxLiquidFraction);
  const liquidH = (bh - 10) * liquidFrac;
  const liquidTopY = y + bh - liquidH;

  // 1. Physical Flask & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    const coneTop = y + neckH;
    const coneBottom = cyBot;
    const t = Math.max(0, Math.min(1, (liquidTopY - coneTop) / Math.max(1, coneBottom - coneTop)));
    const surfaceHalfW = (neckW / 2) + t * (baseRx - neckW / 2);

    // Liquid Fill - Fills 100% of conical flask base conforming to 2.5D bottom ellipse with NO white gaps!
    if (vol > 0 && liquidH > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - surfaceHalfW, liquidTopY);
      ctx.lineTo(cx - baseRx, cyBot);
      ctx.ellipse(cx, cyBot, baseRx, bottomRy, 0, Math.PI, 0, true);
      ctx.lineTo(cx + surfaceHalfW, liquidTopY);
      ctx.ellipse(cx, liquidTopY, surfaceHalfW, 3.5, 0, 0, Math.PI, true);
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
        3.5,
        x - 4,
        x + bw + 4
      );

      if (state?.isBoiling) {
        renderBoilingBubbles(ctx, cx - surfaceHalfW * 0.7, liquidTopY, surfaceHalfW * 1.4, liquidH);
        renderSteam(ctx, cx, y - 4, neckW);
      }
      ctx.restore();
    }

    // Flask Outer Glass Outline
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - neckW * 0.65, y + 2);
    ctx.lineTo(cx + neckW * 0.65, y + 2);
    ctx.lineTo(cx + neckW / 2, y + neckH);
    ctx.lineTo(cx + baseRx, cyBot);
    // Lower front ellipse curve (base)
    ctx.ellipse(cx, cyBot, baseRx, bottomRy, 0, 0, Math.PI, false);
    // Left conical wall up to neck
    ctx.lineTo(cx - neckW / 2, y + neckH);
    ctx.closePath();
    ctx.stroke();

    // Flared top rim ellipse
    ctx.beginPath();
    ctx.ellipse(cx, y + 2, neckW * 0.65, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner rim line
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, y + 2, neckW * 0.65 - 2, 2.2, 0, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.40)' : 'rgba(17, 24, 39, 0.35)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();

    // Bottom 2.5D Depth Curve (visible through glass, exactly matching baseRx & bottomRy)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cyBot, baseRx, bottomRy, 0, Math.PI, 0, false);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.40)' : 'rgba(17, 24, 39, 0.35)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
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
  layer: 'all' | 'apparatus' | 'ui' = 'all'
): void {
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const cx = w / 2;
  const stemW = 8;
  const bulbR = 7.5;
  const topY = 16;
  const botY = h - bulbR - 4;
  const stemH = botY - topY;

  const temp = state?.temperature ?? 20.0;
  const tempFrac = Math.max(0, Math.min(1, temp / 100));
  const liquidTopY = botY - stemH * tempFrac;
  const liquidColor = getThermometerColor(temp);

  // 1. Physical Thermometer Sketch (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    // Glass Outer Stem
    ctx.beginPath();
    ctx.roundRect(cx - stemW / 2, topY, stemW, stemH, stemW / 2);
    ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.55)';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Glass Bulb at bottom
    ctx.beginPath();
    ctx.arc(cx, botY + 2, bulbR, 0, Math.PI * 2);
    ctx.fillStyle = liquidColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Liquid Column inside stem
    const colW = stemW - 3;
    ctx.beginPath();
    ctx.roundRect(cx - colW / 2, liquidTopY, colW, botY - liquidTopY + 2, [colW / 2, colW / 2, 0, 0]);
    ctx.fillStyle = liquidColor;
    ctx.fill();

    // Calibration Tick Marks (0 to 100 °C)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.9;
    for (let t = 0; t <= 100; t += 10) {
      const ty = botY - stemH * (t / 100);
      const isMajor = t === 0 || t === 50 || t === 100;
      const tickLen = isMajor ? 6 : 3.5;

      ctx.beginPath();
      ctx.moveTo(cx + stemW / 2, ty);
      ctx.lineTo(cx + stemW / 2 + tickLen, ty);
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
        ctx.font = 'bold 7.5px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${t}`, cx + stemW / 2 + 8, ty + 2.5);
      }
    }

    ctx.restore();
  }

  // 2. Interactive Digital Badge (ui / all)
  if (layer === 'all' || layer === 'ui') {
    ctx.save();
    const badgeText = `${temp.toFixed(1)} °C`;
    ctx.font = 'bold 10px system-ui, sans-serif';
    const badgeW = ctx.measureText(badgeText).width + 18;
    const badgeH = 18;
    const badgeX = cx - badgeW / 2;
    const badgeY = topY - badgeH - 3;

    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.94)';
    ctx.fill();
    ctx.strokeStyle = liquidColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Color indicator dot
    ctx.beginPath();
    ctx.arc(badgeX + 8, badgeY + badgeH / 2, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = liquidColor;
    ctx.fill();

    // Numeric text
    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + 15, badgeY + badgeH / 2);
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
