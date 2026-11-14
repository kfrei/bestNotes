/**
 * 2.5D Monochrome Sketch Vector Renderer for the Heat & Thermodynamics Simulation.
 * BestNotes / ExplainBoards.
 *
 * Implements clean hand-drawn monochrome sketch line-art matching notebook ink sketches:
 * 1. Bunsen Burner (monochrome flared base with dual rim, chimney with air collar, sketched line-art flame)
 * 2. Laboratory Tripod (line-art cast legs, wire gauze crosshatch, central ceramic disc)
 * 3. Borosilicate Glass Beaker (pouring spout, 2.5D elliptical rim & bottom depth curve, graduation marks)
 * 4. Wide Basin / Water Bath (Υδατόλουτρο, supports nested vessels & thermal equilibrium)
 * 5. Erlenmeyer Flask (narrow neck, conical body, 2.5D bottom curve, graduated marks)
 * 6. Precision Laboratory Thermometer (0-100°C column, tick marks, digital badge)
 * 7. Quick "Γέμισμα" (Fill) Pill Button & "✎" Edit Pencil Badge for all containers
 * 8. Gorgeous Liquid Depth Gradients (multi-stop translucent surface to rich depth, 3D meniscus)
 * 9. Layer separation: 'apparatus' on paper under pencil strokes, 'ui' for controls & graph on top
 */

import {
  HeatBurnerState,
  HeatContainerState,
  HeatObject,
  HeatSimConfig,
  HeatThermometerState,
  LiquidType,
  LIQUID_REGISTRY,
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
}

/**
 * Draws the Heat Simulation on a 2D canvas.
 * Supports rendering:
 * - 'apparatus': draws physical objects on paper (under pencil strokes so users can color them)
 * - 'ui': draws interactive buttons ([💧 Γέμισμα], [✎]) and dynamic T-t graph
 * - 'all': draws both (default)
 */
export function renderHeatSimulation(
  ctx: CanvasRenderingContext2D,
  sim: HeatSimConfig,
  options?: RenderHeatSimulationOptions
): void {
  const isDark = Boolean(options?.isDark);
  const layer = options?.layer || 'all';

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

  for (const obj of sorted) {
    ctx.save();
    ctx.translate(obj.x, obj.y);

    const isHovered = options?.hoveredObjectId === obj.id;
    const isSelected = sim.selectedObjectId === obj.id;

    switch (obj.type) {
      case 'burner':
        renderBurner(ctx, obj.width, obj.height, obj.burnerState, isDark, isSelected || isHovered, layer);
        break;
      case 'tripod':
        renderTripod(ctx, obj.width, obj.height, obj.tripodState?.wireGauzeTemp || 20, isDark, isSelected || isHovered, layer);
        break;
      case 'beaker':
        renderBeaker(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected || isHovered, layer);
        break;
      case 'wide-basin':
        renderWideBasin(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected || isHovered, layer);
        break;
      case 'flask':
        renderFlask(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected || isHovered, layer);
        break;
      case 'thermometer':
        renderThermometer(ctx, obj.width, obj.height, obj.thermometerState, isDark, isSelected || isHovered, layer);
        break;
    }

    ctx.restore();
  }

  // Render Dynamic T-t Graph if enabled (only in 'ui' or 'all' layer)
  if (sim.graph.visible && (layer === 'all' || layer === 'ui')) {
    renderThermalGraph(ctx, sim, isDark);
  }

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
  meniscusRy: number = 4.5
): void {
  // 1. Vertical linear depth gradient
  const grad = ctx.createLinearGradient(x, liquidTopY, x, bottomY);
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
  ctx.fillRect(x - 2, liquidTopY, bw + 6, liquidH + 12);

  // 2. Surface Meniscus with 3D elliptical curvature
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x + bw / 2, liquidTopY, bw / 2 - 1, meniscusRy, 0, 0, Math.PI * 2);

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
 * On-Canvas Action Badges: Quick Fill Button [💧 Γέμισμα] + Edit Pencil [✎]
 */
function renderContainerActions(
  ctx: CanvasRenderingContext2D,
  topRightX: number,
  topRightY: number,
  vol: number,
  cap: number,
  pencilHovered?: boolean,
  fillHovered?: boolean
): void {
  ctx.save();

  // 1. Quick Fill Pill Button [ 💧 Γέμισμα ] / [ 💧 250ml ]
  const pillW = 62;
  const pillH = 17;
  const pillX = topRightX - pillW - 12;
  const pillY = topRightY - pillH / 2;

  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = fillHovered
    ? '#234978'
    : vol > 0
    ? 'rgba(238, 242, 255, 0.94)'
    : 'rgba(255, 255, 255, 0.92)';
  ctx.fill();
  ctx.strokeStyle = fillHovered
    ? '#1c3c63'
    : vol > 0
    ? '#3b82f6'
    : 'rgba(100, 116, 139, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fillHovered ? '#ffffff' : vol > 0 ? '#1d4ed8' : '#334155';
  const label = vol > 0 ? `💧 ${vol}ml` : '💧 Γέμισμα';
  ctx.fillText(label, pillX + pillW / 2, pillY + pillH / 2);

  // 2. Pencil Badge [ ✎ ]
  const pencilR = 8.5;
  const pencilX = topRightX;
  const pencilY = topRightY;

  ctx.beginPath();
  ctx.arc(pencilX, pencilY, pencilR, 0, Math.PI * 2);
  ctx.fillStyle = pencilHovered ? '#234978' : 'rgba(255, 255, 255, 0.92)';
  ctx.fill();
  ctx.strokeStyle = pencilHovered ? '#1c3c63' : 'rgba(100, 116, 139, 0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = pencilHovered ? '#ffffff' : '#475569';
  ctx.font = '9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✎', pencilX, pencilY);

  ctx.restore();
}

/**
 * 1. Bunsen Burner - Monochrome hand-drawn sketch style matching notebook ink
 */
function renderBurner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatBurnerState | undefined,
  isDark: boolean,
  highlight: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all'
): void {
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const cx = w / 2;
  const baseW = w * 0.74;
  const baseH = h * 0.22;
  const stemW = w * 0.17;
  const stemH = h * 0.52;
  const baseY = h - baseH - 14;
  const stemY = baseY - stemH;

  // Selection outline
  if (highlight && (layer === 'all' || layer === 'apparatus')) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-4, -4, w + 8, h + 8);
    ctx.restore();
  }

  // 1. Physical Apparatus Sketch (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Flame when ON (sketched line-art flame with warm inner gradient)
    if (state?.isOn) {
      const cycle = state.flameCycle || 0;
      const flicker1 = Math.sin(cycle * Math.PI * 2) * 2.2;
      const flicker2 = Math.cos(cycle * Math.PI * 4) * 1.4;
      const flameH = state.intensity === 'roaring' ? h * 0.65 : state.intensity === 'normal' ? h * 0.52 : h * 0.40;
      const flameTipY = stemY - 6 - flameH + flicker1;

      // Ambient thermal glow
      const glow = ctx.createRadialGradient(cx, stemY - flameH * 0.4, 4, cx, stemY - flameH * 0.4, flameH * 1.3);
      glow.addColorStop(0, state.intensity === 'roaring' ? 'rgba(59, 130, 246, 0.35)' : 'rgba(245, 158, 11, 0.35)');
      glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cx - flameH * 1.4, stemY - flameH * 1.5, flameH * 2.8, flameH * 2.0);

      // Outer flame contour
      ctx.beginPath();
      ctx.moveTo(cx - stemW * 0.55, stemY - 4);
      ctx.bezierCurveTo(
        cx - stemW * 1.1 + flicker2,
        stemY - flameH * 0.38,
        cx - stemW * 0.45 + flicker1,
        stemY - flameH * 0.78,
        cx,
        flameTipY
      );
      ctx.bezierCurveTo(
        cx + stemW * 0.45 - flicker1,
        stemY - flameH * 0.78,
        cx + stemW * 1.1 - flicker2,
        stemY - flameH * 0.38,
        cx + stemW * 0.55,
        stemY - 4
      );
      ctx.closePath();

      const outerFlameGrad = ctx.createLinearGradient(cx, stemY, cx, flameTipY);
      if (state.intensity === 'roaring') {
        outerFlameGrad.addColorStop(0, 'rgba(59, 130, 246, 0.50)');
        outerFlameGrad.addColorStop(0.6, 'rgba(147, 197, 253, 0.40)');
        outerFlameGrad.addColorStop(1, 'rgba(219, 234, 254, 0.30)');
      } else {
        outerFlameGrad.addColorStop(0, 'rgba(234, 88, 12, 0.55)');
        outerFlameGrad.addColorStop(0.65, 'rgba(250, 204, 21, 0.45)');
        outerFlameGrad.addColorStop(1, 'rgba(254, 240, 138, 0.30)');
      }
      ctx.fillStyle = outerFlameGrad;
      ctx.fill();
      ctx.strokeStyle = state.intensity === 'roaring' ? '#2563eb' : '#ea580c';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Inner bright flame core
      ctx.beginPath();
      ctx.moveTo(cx - stemW * 0.3, stemY - 4);
      ctx.bezierCurveTo(
        cx - stemW * 0.45,
        stemY - flameH * 0.22,
        cx - stemW * 0.18,
        stemY - flameH * 0.46,
        cx,
        stemY - flameH * 0.55
      );
      ctx.bezierCurveTo(
        cx + stemW * 0.18,
        stemY - flameH * 0.46,
        cx + stemW * 0.45,
        stemY - flameH * 0.22,
        cx + stemW * 0.3,
        stemY - 4
      );
      ctx.closePath();
      ctx.fillStyle = state.intensity === 'roaring' ? 'rgba(219, 234, 254, 0.85)' : 'rgba(254, 249, 195, 0.90)';
      ctx.fill();
      ctx.strokeStyle = state.intensity === 'roaring' ? '#60a5fa' : '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Flared Conical Base (Clean line art with double rim, matching sketch in media_1794694870640_233b6a5d.jpg)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.9;

    // Conical base slope
    ctx.beginPath();
    ctx.moveTo(cx - baseW / 2, baseY + baseH * 0.65);
    ctx.quadraticCurveTo(cx - stemW * 0.95, baseY + baseH * 0.22, cx - stemW * 0.72, baseY);
    ctx.lineTo(cx + stemW * 0.72, baseY);
    ctx.quadraticCurveTo(cx + stemW * 0.95, baseY + baseH * 0.22, cx + baseW / 2, baseY + baseH * 0.65);
    ctx.stroke();

    // Bottom dual rim ellipses (showing the foot rim thickness from sketch)
    ctx.beginPath();
    ctx.ellipse(cx, baseY + baseH * 0.65, baseW / 2, baseH * 0.26, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, baseY + baseH * 0.78, baseW / 2 - 2, baseH * 0.22, 0, 0, Math.PI * 2);
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Vertical Burner Barrel / Tube (Straight clean line art)
    ctx.lineWidth = 1.9;
    ctx.strokeRect(cx - stemW / 2, stemY, stemW, stemH);

    // Collar with air intake oval slot near bottom
    const collarY = stemY + stemH * 0.62;
    const collarH = stemH * 0.22;
    ctx.strokeRect(cx - stemW * 0.65, collarY, stemW * 1.3, collarH);

    // Air vent slot (oval/pill slot)
    ctx.beginPath();
    ctx.roundRect(cx - stemW * 0.28, collarY + collarH * 0.2, stemW * 0.56, collarH * 0.6, collarH * 0.3);
    ctx.stroke();

    // Top nozzle lip collar
    const nozzleW = stemW * 1.3;
    ctx.strokeRect(cx - nozzleW / 2, stemY - 5, nozzleW, 6);

    ctx.restore();
  }

  // 2. Interactive UI Controls (ui / all)
  if (layer === 'all' || layer === 'ui') {
    const btnY = baseY + baseH + 3;
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
  highlight: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all'
): void {
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const cx = w / 2;
  const collarW = w * 0.72;
  const collarH = h * 0.14;
  const topY = 4;
  const legBotY = h - 6;

  if (highlight && (layer === 'all' || layer === 'apparatus')) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-4, -4, w + 8, h + 8);
    ctx.restore();
  }

  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Left Leg
    ctx.beginPath();
    ctx.moveTo(cx - collarW * 0.38, topY + collarH * 0.5);
    ctx.lineTo(cx - collarW * 0.55, legBotY);
    ctx.stroke();

    // Right Leg
    ctx.beginPath();
    ctx.moveTo(cx + collarW * 0.38, topY + collarH * 0.5);
    ctx.lineTo(cx + collarW * 0.55, legBotY);
    ctx.stroke();

    // Center Back Leg
    ctx.beginPath();
    ctx.moveTo(cx, topY + collarH * 0.2);
    ctx.lineTo(cx, legBotY - 4);
    ctx.lineWidth = 2.0;
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
 * 3. Borosilicate Glass Beaker - Monochrome line-art matching the hand-drawn sketch
 */
function renderBeaker(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  highlight: boolean,
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
  const bottomH = 14;
  const spoutW = 12;

  if (highlight && (layer === 'all' || layer === 'apparatus')) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, 0, w, h);
    ctx.restore();
  }

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 500;
  const liquidType = state?.liquidType ?? 'water';

  const maxLiquidFraction = 0.86;
  const liquidFrac = Math.min(maxLiquidFraction, (vol / cap) * maxLiquidFraction);
  const liquidH = (bh - bottomH / 2) * liquidFrac;
  const liquidTopY = y + bh - bottomH / 2 - liquidH;

  // 1. Physical Beaker & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    // Draw Liquid Fill if volume > 0
    if (vol > 0 && liquidH > 2) {
      ctx.save();
      // Clip inside beaker cylindrical shape
      ctx.beginPath();
      ctx.moveTo(x, liquidTopY);
      ctx.lineTo(x, y + bh - bottomH / 2);
      ctx.ellipse(cx, y + bh - bottomH / 2, bw / 2, bottomH / 2, 0, Math.PI, 0, true);
      ctx.lineTo(x + bw, liquidTopY);
      ctx.closePath();
      ctx.clip();

      renderLiquidBody(ctx, liquidType, x, liquidTopY, bw, liquidH, y + bh, rimH * 0.35);

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
    ctx.lineTo(x + bw, y + bh - bottomH / 2);
    // Bottom outer curve (base)
    ctx.quadraticCurveTo(x + bw, y + bh, x + bw - 10, y + bh);
    ctx.lineTo(x + 10, y + bh);
    ctx.quadraticCurveTo(x, y + bh, x, y + bh - bottomH / 2);
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

    // Bottom 2.5D Depth Curve (visible through glass, exactly as in media_1794694870640_233b6a5d.jpg)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, y + bh - bottomH / 2, bw / 2, bottomH / 2, 0, 0, Math.PI);
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
    ctx.fillRect(x + bw - 14, y + rimH, 10, bh - rimH - bottomH);

    // Graduated Measurement Lines (e.g. 100, 200, 300, 400, 500 ml)
    ctx.strokeStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.lineWidth = 1.1;
    const numMarks = 5;
    for (let i = 1; i <= numMarks; i++) {
      const markFrac = (i / numMarks) * maxLiquidFraction;
      const my = y + bh - bottomH / 2 - (bh - bottomH / 2) * markFrac;
      const markVal = Math.round((i / numMarks) * cap);

      ctx.beginPath();
      ctx.moveTo(x + 3, my);
      ctx.lineTo(x + 14, my);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
      ctx.font = 'bold 8.5px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${markVal}`, x + 17, my + 3);
    }

    ctx.restore();
  }

  // 2. Interactive Action Badges (ui / all)
  if (layer === 'all' || layer === 'ui') {
    renderContainerActions(ctx, x + bw - 8, y - 8, vol, cap, state?.pencilHovered, state?.fillHovered);
  }
}

/**
 * 4. Wide Basin / Water Bath (Υδατόλουτρο) - Monochrome line art
 */
function renderWideBasin(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  highlight: boolean,
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
  const bottomH = 14;

  if (highlight && (layer === 'all' || layer === 'apparatus')) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, 0, w, h);
    ctx.restore();
  }

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 800;
  const liquidType = state?.liquidType ?? 'water';

  const maxLiquidFraction = 0.85;
  const liquidFrac = Math.min(maxLiquidFraction, (vol / cap) * maxLiquidFraction);
  const liquidH = (bh - bottomH / 2) * liquidFrac;
  const liquidTopY = y + bh - bottomH / 2 - liquidH;

  // 1. Physical Basin Sketch & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    // Liquid Fill
    if (vol > 0 && liquidH > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, liquidTopY);
      ctx.lineTo(x, y + bh - bottomH / 2);
      ctx.ellipse(cx, y + bh - bottomH / 2, bw / 2, bottomH / 2, 0, Math.PI, 0, true);
      ctx.lineTo(x + bw, liquidTopY);
      ctx.closePath();
      ctx.clip();

      renderLiquidBody(ctx, liquidType, x, liquidTopY, bw, liquidH, y + bh, rimH * 0.4);

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
    ctx.lineTo(x, y + bh - bottomH / 2);
    ctx.quadraticCurveTo(x, y + bh, x + 14, y + bh);
    ctx.lineTo(x + bw - 14, y + bh);
    ctx.quadraticCurveTo(x + bw, y + bh, x + bw, y + bh - bottomH / 2);
    ctx.lineTo(x + bw, y + 14);
    ctx.quadraticCurveTo(x + bw, y + 4, x + bw + 8, y + 2);
    ctx.stroke();

    // Top Rim 2.5D Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, y + rimH / 2, bw / 2, rimH / 2, 0, 0, Math.PI * 2);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Bottom 2.5D Depth Curve
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, y + bh - bottomH / 2, bw / 2, bottomH / 2, 0, 0, Math.PI);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.40)' : 'rgba(17, 24, 39, 0.35)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // Graduated marks on left
    ctx.strokeStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.lineWidth = 1.1;
    for (let i = 1; i <= 3; i++) {
      const my = y + bh - bottomH / 2 - (bh - bottomH / 2) * 0.85 * (i / 3);
      ctx.beginPath();
      ctx.moveTo(x + 3, my);
      ctx.lineTo(x + 12, my);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 2. Interactive Action Badges (ui / all)
  if (layer === 'all' || layer === 'ui') {
    renderContainerActions(ctx, x + bw - 8, y - 8, vol, cap, state?.pencilHovered, state?.fillHovered);
  }
}

/**
 * 5. Erlenmeyer Flask (Κωνική Φιάλη) - Monochrome line art
 */
function renderFlask(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  highlight: boolean,
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
  const bottomH = 12;

  if (highlight && (layer === 'all' || layer === 'apparatus')) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, 0, w, h);
    ctx.restore();
  }

  const vol = state?.volumeMl ?? 0;
  const cap = state?.capacityMl ?? 500;
  const liquidType = state?.liquidType ?? 'water';

  const maxLiquidFraction = 0.86;
  const liquidFrac = Math.min(maxLiquidFraction, (vol / cap) * maxLiquidFraction);
  const liquidH = (bh - bottomH / 2) * liquidFrac;
  const liquidTopY = y + bh - bottomH / 2 - liquidH;

  // 1. Physical Flask & Liquid Body (apparatus / all)
  if (layer === 'all' || layer === 'apparatus') {
    ctx.save();

    // Flask Path
    const createFlaskPath = () => {
      ctx.beginPath();
      ctx.moveTo(cx - neckW * 0.65, y);
      ctx.lineTo(cx + neckW * 0.65, y);
      ctx.lineTo(cx + neckW / 2, y + neckH);
      ctx.lineTo(x + bw - 6, y + bh - 8);
      ctx.quadraticCurveTo(x + bw, y + bh, x + bw - 10, y + bh);
      ctx.lineTo(x + 10, y + bh);
      ctx.quadraticCurveTo(x, y + bh, x + 6, y + bh - 8);
      ctx.lineTo(cx - neckW / 2, y + neckH);
      ctx.closePath();
    };

    // Liquid Fill
    if (vol > 0 && liquidH > 2) {
      ctx.save();
      createFlaskPath();
      ctx.clip();

      const currentSpanW = cx - (cx - neckW / 2) + ((bw / 2 - neckW / 2) * (liquidH / (bh - neckH)));
      renderLiquidBody(ctx, liquidType, cx - currentSpanW, liquidTopY, currentSpanW * 2, liquidH, y + bh, 4.0);

      if (state?.isBoiling) {
        renderBoilingBubbles(ctx, cx - currentSpanW * 0.7, liquidTopY, currentSpanW * 1.4, liquidH);
        renderSteam(ctx, cx, y - 4, neckW);
      }
      ctx.restore();
    }

    // Flask Outer Glass Outline
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    createFlaskPath();
    ctx.stroke();

    // Flared top rim ellipse
    ctx.beginPath();
    ctx.ellipse(cx, y + 2, neckW * 0.65, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom 2.5D Depth Curve
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, y + bh - bottomH / 2, bw / 2 - 6, bottomH / 2, 0, 0, Math.PI);
    ctx.strokeStyle = isDark ? 'rgba(248, 250, 252, 0.40)' : 'rgba(17, 24, 39, 0.35)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // Graduated marks on lower conical body
    ctx.strokeStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.lineWidth = 1.1;
    for (let i = 1; i <= 4; i++) {
      const my = y + bh - bh * 0.55 * (i / 4);
      ctx.beginPath();
      ctx.moveTo(cx - neckW * 0.9 - i * 3, my);
      ctx.lineTo(cx - neckW * 0.4, my);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 2. Interactive Action Badges (ui / all)
  if (layer === 'all' || layer === 'ui') {
    renderContainerActions(ctx, cx + neckW / 2 + 32, y - 6, vol, cap, state?.pencilHovered, state?.fillHovered);
  }
}

/**
 * 6. Precision Laboratory Thermometer - Monochrome sketch style with dynamic temperature indicator
 */
function renderThermometer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatThermometerState | undefined,
  isDark: boolean,
  highlight: boolean,
  layer: 'all' | 'apparatus' | 'ui' = 'all'
): void {
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const cx = w / 2;
  const stemW = 8;
  const bulbR = 7.5;
  const topY = 16;
  const botY = h - bulbR - 4;
  const stemH = botY - topY;

  if (highlight && (layer === 'all' || layer === 'apparatus')) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-4, -4, w + 8, h + 8);
    ctx.restore();
  }

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
  sw: number
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
 * 7. Dynamic Transparent T - t Real-Time Graph (Harmonic Oscillation Style)
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
  ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(253, 251, 247, 0.82)';
  ctx.fill();
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Header Title
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = isDark ? '#f8fafc' : '#234978';
  ctx.textAlign = 'left';
  ctx.fillText('Διάγραμμα Θερμοκρασίας: T(t)', gx + 16, gy + 20);

  // Plot Area
  const plotX = gx + 42;
  const plotY = gy + 32;
  const plotW = gw - 58;
  const plotH = gh - 54;

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
  // Vertical Axis T
  ctx.moveTo(plotX, plotY - 4);
  ctx.lineTo(plotX, plotY + plotH);
  // Horizontal Axis t
  ctx.lineTo(plotX + plotW + 4, plotY + plotH);
  ctx.stroke();

  // Axis Labels
  ctx.fillStyle = isDark ? '#cbd5e1' : '#1e293b';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('T (°C)', plotX, plotY - 8);
  ctx.fillText('t (s)', plotX + plotW + 6, plotY + plotH + 14);

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
      ctx.fillText(`Tισορ = ${lastEq.toFixed(1)}°C`, plotX + plotW - 4, eqY - 4);
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
    ctx.fillText('— Δοχείο 1', plotX + 8, gy + 19);

    if (hasCurve2) {
      ctx.fillStyle = '#0284c7';
      ctx.fillText('— Υδατόλουτρο', plotX + 75, gy + 19);
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
