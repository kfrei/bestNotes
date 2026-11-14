/**
 * 2.5D Canvas Vector Renderer for the Heat & Thermodynamics Simulation.
 * BestNotes / ExplainBoards.
 *
 * Implements clean 2.5D academic laboratory visuals for:
 * 1. Bunsen Burner (flame animation, ambient glow, on/off click target)
 * 2. Laboratory Tripod (wire gauze ceramic plate with thermal glow)
 * 3. Borosilicate Glass Beaker (graduations, meniscus, bubbles, steam, faint pencil icon)
 * 4. Wide Basin / Water Bath (Υδατόλουτρο, supports nesting other vessels)
 * 5. Erlenmeyer Flask (narrow neck, graduated lines, liquid fill)
 * 6. Precision Laboratory Thermometer (0-100°C gradient fill, live digital badge)
 * 7. Dynamic Transparent T-t Real-Time Graph (single/dual curves for thermal equilibrium)
 */

import {
  HeatBurnerState,
  HeatContainerState,
  HeatObject,
  HeatSimConfig,
  HeatThermometerState,
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
    return lerpColor('#2563eb', '#059669', clamped / 30); // Blue to Green
  } else if (clamped <= 65) {
    return lerpColor('#059669', '#d97706', (clamped - 30) / 35); // Green to Orange
  } else {
    return lerpColor('#d97706', '#dc2626', (clamped - 65) / 35); // Orange to Red
  }
}

/**
 * Draws the complete Heat Simulation on a 2D canvas.
 */
export function renderHeatSimulation(
  ctx: CanvasRenderingContext2D,
  sim: HeatSimConfig,
  options?: {
    isDark?: boolean;
    scale?: number;
    hoveredObjectId?: string | null;
  }
): void {
  const isDark = Boolean(options?.isDark);

  ctx.save();

  // Render objects sorted by z-order:
  // 1. Tripod
  // 2. Burner (behind vessel, underneath tripod)
  // 3. Wide Basin
  // 4. Beaker / Flask
  // 5. Thermometer (foreground)
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
        renderBurner(ctx, obj.width, obj.height, obj.burnerState, isDark, isSelected || isHovered);
        break;
      case 'tripod':
        renderTripod(ctx, obj.width, obj.height, obj.tripodState?.wireGauzeTemp || 20, isDark, isSelected || isHovered);
        break;
      case 'beaker':
        renderBeaker(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected || isHovered);
        break;
      case 'wide-basin':
        renderWideBasin(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected || isHovered);
        break;
      case 'flask':
        renderFlask(ctx, obj.width, obj.height, obj.containerState, isDark, isSelected || isHovered);
        break;
      case 'thermometer':
        renderThermometer(ctx, obj.width, obj.height, obj.thermometerState, isDark, isSelected || isHovered);
        break;
    }

    ctx.restore();
  }

  // Render Dynamic T-t Graph if enabled
  if (sim.graph.visible) {
    renderThermalGraph(ctx, sim, isDark);
  }

  ctx.restore();
}

/**
 * 1. Bunsen Burner 2.5D vector rendering
 */
function renderBurner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatBurnerState | undefined,
  isDark: boolean,
  highlight: boolean
): void {
  const cx = w / 2;
  const baseW = w * 0.76;
  const baseH = h * 0.18;
  const stemW = w * 0.18;
  const stemH = h * 0.58;
  const baseY = h - baseH;
  const stemY = baseY - stemH;

  // Selection outline
  if (highlight) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-4, -4, w + 8, h + 8);
    ctx.restore();
  }

  // Flame when ON
  if (state?.isOn) {
    const cycle = state.flameCycle || 0;
    const flicker1 = Math.sin(cycle * Math.PI * 2) * 3;
    const flicker2 = Math.cos(cycle * Math.PI * 4) * 2;
    const flameH = state.intensity === 'roaring' ? h * 0.72 : state.intensity === 'normal' ? h * 0.58 : h * 0.42;
    const flameTipY = stemY - flameH + flicker1;

    // Ambient thermal glow
    const glow = ctx.createRadialGradient(cx, stemY - flameH * 0.4, 4, cx, stemY - flameH * 0.4, flameH * 1.4);
    glow.addColorStop(0, state.intensity === 'roaring' ? 'rgba(59, 130, 246, 0.45)' : 'rgba(245, 158, 11, 0.45)');
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - flameH * 1.5, stemY - flameH * 1.6, flameH * 3, flameH * 2.2);

    // Outer flame body (yellow -> orange -> red tip)
    ctx.beginPath();
    ctx.moveTo(cx - stemW * 0.65, stemY);
    ctx.bezierCurveTo(
      cx - stemW * 1.1 + flicker2,
      stemY - flameH * 0.4,
      cx - stemW * 0.4 + flicker1,
      stemY - flameH * 0.8,
      cx,
      flameTipY
    );
    ctx.bezierCurveTo(
      cx + stemW * 0.4 - flicker1,
      stemY - flameH * 0.8,
      cx + stemW * 1.1 - flicker2,
      stemY - flameH * 0.4,
      cx + stemW * 0.65,
      stemY
    );
    ctx.closePath();

    const outerFlameGrad = ctx.createLinearGradient(cx, stemY, cx, flameTipY);
    if (state.intensity === 'roaring') {
      outerFlameGrad.addColorStop(0, '#3b82f6'); // Vibrant blue
      outerFlameGrad.addColorStop(0.5, '#60a5fa');
      outerFlameGrad.addColorStop(1, '#93c5fd');
    } else {
      outerFlameGrad.addColorStop(0, '#f97316'); // Orange
      outerFlameGrad.addColorStop(0.65, '#eab308'); // Yellow
      outerFlameGrad.addColorStop(1, '#ef4444'); // Red flick
    }
    ctx.fillStyle = outerFlameGrad;
    ctx.fill();

    // Inner bright core
    ctx.beginPath();
    ctx.moveTo(cx - stemW * 0.35, stemY);
    ctx.bezierCurveTo(
      cx - stemW * 0.5,
      stemY - flameH * 0.25,
      cx - stemW * 0.2,
      stemY - flameH * 0.5,
      cx,
      stemY - flameH * 0.6
    );
    ctx.bezierCurveTo(
      cx + stemW * 0.2,
      stemY - flameH * 0.5,
      cx + stemW * 0.5,
      stemY - flameH * 0.25,
      cx + stemW * 0.35,
      stemY
    );
    ctx.closePath();
    ctx.fillStyle = state.intensity === 'roaring' ? '#bfdbfe' : '#fef08a';
    ctx.fill();
  }

  // Cast Metal Flared Base
  ctx.save();
  const baseGrad = ctx.createLinearGradient(cx - baseW / 2, baseY, cx + baseW / 2, baseY);
  baseGrad.addColorStop(0, isDark ? '#1e293b' : '#334155');
  baseGrad.addColorStop(0.35, isDark ? '#475569' : '#64748b');
  baseGrad.addColorStop(0.7, isDark ? '#334155' : '#475569');
  baseGrad.addColorStop(1, isDark ? '#0f172a' : '#1e293b');

  ctx.beginPath();
  ctx.ellipse(cx, baseY + baseH * 0.65, baseW / 2, baseH * 0.32, 0, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? '#0f172a' : '#1e293b';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx - baseW / 2, baseY + baseH * 0.65);
  ctx.quadraticCurveTo(cx - stemW * 0.9, baseY + baseH * 0.2, cx - stemW * 0.7, baseY);
  ctx.lineTo(cx + stemW * 0.7, baseY);
  ctx.quadraticCurveTo(cx + stemW * 0.9, baseY + baseH * 0.2, cx + baseW / 2, baseY + baseH * 0.65);
  ctx.closePath();
  ctx.fillStyle = baseGrad;
  ctx.fill();
  ctx.strokeStyle = isDark ? '#334155' : '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Vertical Chrome Burner Barrel / Tube
  const stemGrad = ctx.createLinearGradient(cx - stemW / 2, stemY, cx + stemW / 2, stemY);
  stemGrad.addColorStop(0, '#64748b');
  stemGrad.addColorStop(0.35, '#cbd5e1'); // Highlight reflection
  stemGrad.addColorStop(0.75, '#94a3b8');
  stemGrad.addColorStop(1, '#475569');

  ctx.fillStyle = stemGrad;
  ctx.fillRect(cx - stemW / 2, stemY, stemW, stemH);
  ctx.strokeRect(cx - stemW / 2, stemY, stemW, stemH);

  // Air hole ring / collar near bottom of barrel
  const collarY = stemY + stemH * 0.65;
  const collarH = stemH * 0.22;
  ctx.fillStyle = isDark ? '#1e293b' : '#334155';
  ctx.fillRect(cx - stemW * 0.6, collarY, stemW * 1.2, collarH);
  ctx.strokeStyle = '#94a3b8';
  ctx.strokeRect(cx - stemW * 0.6, collarY, stemW * 1.2, collarH);

  // Air vent hole slot
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - stemW * 0.25, collarY + collarH * 0.25, stemW * 0.5, collarH * 0.5);

  // Top brass nozzle lip
  ctx.fillStyle = '#d97706';
  ctx.fillRect(cx - stemW * 0.55, stemY - 2, stemW * 1.1, 4);
  ctx.restore();

  // On/Off Indicator Button below base
  const btnY = baseY + baseH * 0.85;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cx - 28, btnY, 56, 18, 9);
  ctx.fillStyle = state?.isOn ? '#16a34a' : isDark ? '#334155' : '#e2e8f0';
  ctx.fill();
  ctx.strokeStyle = state?.isOn ? '#15803d' : '#94a3b8';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = state?.isOn ? '#ffffff' : isDark ? '#f8fafc' : '#334155';
  ctx.font = 'bold 9.5px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state?.isOn ? 'ΦΛΟΓΑ ON' : 'OFF', cx, btnY + 9);
  ctx.restore();
}

/**
 * 2. Laboratory Tripod 2.5D with Wire Gauze
 */
function renderTripod(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  gauzeTempC: number,
  isDark: boolean,
  highlight: boolean
): void {
  const cx = w / 2;
  const collarW = w * 0.72;
  const collarH = h * 0.14;
  const topY = 4;
  const legBotY = h - 6;

  if (highlight) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-4, -4, w + 8, h + 8);
    ctx.restore();
  }

  ctx.save();
  // 3 Black Cast Iron Legs
  const legColor = isDark ? '#334155' : '#1e293b';
  ctx.strokeStyle = legColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

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

  // Center Back Leg (perspective foreshortened)
  ctx.beginPath();
  ctx.moveTo(cx, topY + collarH * 0.2);
  ctx.lineTo(cx, legBotY - 4);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = isDark ? '#1e293b' : '#334155';
  ctx.stroke();

  // Circular Top Ring / Collar
  ctx.lineWidth = 3;
  ctx.strokeStyle = legColor;
  ctx.fillStyle = isDark ? '#0f172a' : '#0f172a';
  ctx.beginPath();
  ctx.ellipse(cx, topY + collarH * 0.5, collarW / 2, collarH / 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Wire Gauze (Πυράντοχο Πλέγμα Αμιάντου) resting on collar
  const gauzeW = collarW * 0.88;
  const gauzeH = collarH * 0.88;

  // Grid mesh lines
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, topY + collarH * 0.5, gauzeW / 2, gauzeH / 2, 0, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = '#94a3b8';
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

  // Central ceramic disc (turns radiant glowing orange/red when heated by burner)
  const ceramicR = gauzeH * 0.55;
  const heatFraction = Math.max(0, Math.min(1, (gauzeTempC - 20) / 450));

  ctx.beginPath();
  ctx.ellipse(cx, topY + collarH * 0.5, ceramicR * 1.5, ceramicR, 0, 0, Math.PI * 2);
  if (heatFraction > 0.05) {
    const discGlow = ctx.createRadialGradient(cx, topY + collarH * 0.5, 2, cx, topY + collarH * 0.5, ceramicR * 1.5);
    discGlow.addColorStop(0, '#fef08a'); // Hot center
    discGlow.addColorStop(0.4, '#f97316'); // Orange
    discGlow.addColorStop(0.85, '#dc2626'); // Red
    discGlow.addColorStop(1, 'rgba(185, 28, 28, 0.4)');
    ctx.fillStyle = discGlow;
  } else {
    ctx.fillStyle = '#e2e8f0'; // Cold white ceramic
  }
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * 3. Borosilicate Glass Beaker (2.5D with Liquid, Bubbles, Steam & Pencil Button)
 */
function renderBeaker(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  highlight: boolean
): void {
  const pad = 6;
  const bw = w - pad * 2;
  const bh = h - pad * 2;
  const x = pad;
  const y = pad;

  if (highlight) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, 0, w, h);
    ctx.restore();
  }

  const vol = state?.volumeMl ?? 250;
  const cap = state?.capacityMl ?? 500;
  const liquidProp = LIQUID_REGISTRY[state?.liquidType ?? 'water'];

  // Calculate liquid height: leaving a mandatory thin headspace even when 100% full
  const maxLiquidFraction = 0.88;
  const liquidFrac = Math.min(maxLiquidFraction, (vol / cap) * maxLiquidFraction);
  const liquidH = bh * liquidFrac;
  const liquidTopY = y + bh - liquidH;

  ctx.save();

  // Glass Beaker Path (with left pouring spout)
  const spoutW = 10;
  ctx.beginPath();
  ctx.moveTo(x - spoutW, y + 2); // Spout tip
  ctx.quadraticCurveTo(x, y + 6, x, y + 14); // Spout blend to left rim
  ctx.lineTo(x, y + bh - 10);
  ctx.quadraticCurveTo(x, y + bh, x + 10, y + bh); // Bottom left rounded corner
  ctx.lineTo(x + bw - 10, y + bh);
  ctx.quadraticCurveTo(x + bw, y + bh, x + bw, y + bh - 10); // Bottom right
  ctx.lineTo(x + bw, y + 10);
  ctx.quadraticCurveTo(x + bw, y + 2, x + bw - 4, y); // Right rim flare
  ctx.lineTo(x + 4, y);
  ctx.closePath();

  // Draw Liquid Fill if volume > 0
  if (vol > 0 && liquidH > 2) {
    ctx.save();
    ctx.clip(); // Clip within beaker shape

    // Liquid Body Fill
    ctx.fillStyle = liquidProp.color;
    ctx.fillRect(x - 2, liquidTopY, bw + 14, liquidH + 10);

    // Liquid Surface Meniscus
    ctx.beginPath();
    ctx.ellipse(x + bw / 2, liquidTopY, bw / 2 - 1, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = liquidProp.glowColor;
    ctx.fill();
    ctx.strokeStyle = liquidProp.deepColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Boiling Bubbles & Steam
    if (state?.isBoiling) {
      renderBoilingBubbles(ctx, x, liquidTopY, bw, liquidH);
      renderSteam(ctx, x + bw / 2, liquidTopY - 6, bw);
    }

    ctx.restore();
  }

  // Borosilicate Glass Reflections & Outer Strokes
  ctx.strokeStyle = isDark ? '#94a3b8' : '#475569';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Vertical highlight reflection strip on right glass wall
  const reflectGrad = ctx.createLinearGradient(x + bw - 14, y, x + bw - 4, y);
  reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  reflectGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
  reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = reflectGrad;
  ctx.fillRect(x + bw - 14, y + 8, 10, bh - 16);

  // Graduated Measurement Lines (e.g. 100, 200, 300, 400, 500 ml)
  ctx.strokeStyle = isDark ? '#e2e8f0' : '#1e293b';
  ctx.lineWidth = 1;
  const numMarks = 5;
  for (let i = 1; i <= numMarks; i++) {
    const markFrac = (i / numMarks) * maxLiquidFraction;
    const my = y + bh - bh * markFrac;
    const markVal = Math.round((i / numMarks) * cap);

    ctx.beginPath();
    ctx.moveTo(x + 2, my);
    ctx.lineTo(x + 14, my);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
    ctx.font = '8px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${markVal}`, x + 17, my + 3);
  }

  // Faint Pencil Icon on Top Right
  renderPencilBadge(ctx, x + bw - 14, y - 6, state?.pencilHovered);

  ctx.restore();
}

/**
 * 4. Wide Basin / Water Bath (Υδατόλουτρο)
 */
function renderWideBasin(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  highlight: boolean
): void {
  const pad = 6;
  const bw = w - pad * 2;
  const bh = h - pad * 2;
  const x = pad;
  const y = pad;

  if (highlight) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, 0, w, h);
    ctx.restore();
  }

  const vol = state?.volumeMl ?? 450;
  const cap = state?.capacityMl ?? 800;
  const liquidProp = LIQUID_REGISTRY[state?.liquidType ?? 'water'];

  const maxLiquidFraction = 0.85;
  const liquidFrac = Math.min(maxLiquidFraction, (vol / cap) * maxLiquidFraction);
  const liquidH = bh * liquidFrac;
  const liquidTopY = y + bh - liquidH;

  ctx.save();

  // Wide Low Basin Shape
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 2); // Left rim lip
  ctx.quadraticCurveTo(x, y + 4, x, y + 12);
  ctx.lineTo(x, y + bh - 12);
  ctx.quadraticCurveTo(x, y + bh, x + 14, y + bh);
  ctx.lineTo(x + bw - 14, y + bh);
  ctx.quadraticCurveTo(x + bw, y + bh, x + bw, y + bh - 12);
  ctx.lineTo(x + bw, y + 12);
  ctx.quadraticCurveTo(x + bw, y + 4, x + bw + 6, y + 2);
  ctx.closePath();

  // Liquid Fill
  if (vol > 0 && liquidH > 2) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = liquidProp.color;
    ctx.fillRect(x - 2, liquidTopY, bw + 10, liquidH + 6);

    // Liquid Surface
    ctx.beginPath();
    ctx.ellipse(x + bw / 2, liquidTopY, bw / 2 - 1, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = liquidProp.glowColor;
    ctx.fill();
    ctx.strokeStyle = liquidProp.deepColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (state?.isBoiling) {
      renderBoilingBubbles(ctx, x, liquidTopY, bw, liquidH);
      renderSteam(ctx, x + bw / 2, liquidTopY - 6, bw);
    }
    ctx.restore();
  }

  // Glass Stroke
  ctx.strokeStyle = isDark ? '#94a3b8' : '#475569';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Graduated marks on left
  ctx.strokeStyle = isDark ? '#e2e8f0' : '#1e293b';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const my = y + bh - (bh * 0.85 * (i / 3));
    ctx.beginPath();
    ctx.moveTo(x + 2, my);
    ctx.lineTo(x + 10, my);
    ctx.stroke();
  }

  // Faint Pencil Icon on Top Right
  renderPencilBadge(ctx, x + bw - 14, y - 6, state?.pencilHovered);

  ctx.restore();
}

/**
 * 5. Erlenmeyer Flask (Κωνική Φιάλη)
 */
function renderFlask(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: HeatContainerState | undefined,
  isDark: boolean,
  highlight: boolean
): void {
  const pad = 6;
  const bw = w - pad * 2;
  const bh = h - pad * 2;
  const x = pad;
  const y = pad;
  const cx = x + bw / 2;
  const neckW = bw * 0.28;
  const neckH = bh * 0.38;

  if (highlight) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, 0, w, h);
    ctx.restore();
  }

  const vol = state?.volumeMl ?? 250;
  const cap = state?.capacityMl ?? 500;
  const liquidProp = LIQUID_REGISTRY[state?.liquidType ?? 'water'];

  const maxLiquidFraction = 0.86;
  const liquidFrac = Math.min(maxLiquidFraction, (vol / cap) * maxLiquidFraction);
  const liquidH = bh * liquidFrac;
  const liquidTopY = y + bh - liquidH;

  ctx.save();

  // Erlenmeyer Flask Path
  ctx.beginPath();
  // Flared top rim
  ctx.moveTo(cx - neckW * 0.65, y);
  ctx.lineTo(cx + neckW * 0.65, y);
  // Neck
  ctx.lineTo(cx + neckW / 2, y + neckH);
  // Conical bottom slope
  ctx.lineTo(x + bw - 6, y + bh - 8);
  ctx.quadraticCurveTo(x + bw, y + bh, x + bw - 10, y + bh);
  ctx.lineTo(x + 10, y + bh);
  ctx.quadraticCurveTo(x, y + bh, x + 6, y + bh - 8);
  ctx.lineTo(cx - neckW / 2, y + neckH);
  ctx.closePath();

  // Liquid Fill
  if (vol > 0 && liquidH > 2) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = liquidProp.color;
    ctx.fillRect(x - 2, liquidTopY, bw + 10, liquidH + 10);

    // Meniscus
    const currentSpanW = cx - (cx - neckW / 2) + ((bw / 2 - neckW / 2) * (liquidH / (bh - neckH)));
    ctx.beginPath();
    ctx.ellipse(cx, liquidTopY, Math.min(bw / 2 - 2, currentSpanW), 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = liquidProp.glowColor;
    ctx.fill();
    ctx.strokeStyle = liquidProp.deepColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (state?.isBoiling) {
      renderBoilingBubbles(ctx, cx - currentSpanW * 0.7, liquidTopY, currentSpanW * 1.4, liquidH);
      renderSteam(ctx, cx, y - 4, neckW);
    }
    ctx.restore();
  }

  // Glass Stroke
  ctx.strokeStyle = isDark ? '#94a3b8' : '#475569';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Graduated marks on lower conical body
  ctx.strokeStyle = isDark ? '#cbd5e1' : '#334155';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    const my = y + bh - bh * 0.55 * (i / 4);
    ctx.beginPath();
    ctx.moveTo(cx - neckW * 0.9 - i * 3, my);
    ctx.lineTo(cx - neckW * 0.4, my);
    ctx.stroke();
  }

  // Faint Pencil Icon on Top Right
  renderPencilBadge(ctx, cx + neckW / 2 + 6, y - 4, state?.pencilHovered);

  ctx.restore();
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
  highlight: boolean
): void {
  const cx = w / 2;
  const stemW = 8;
  const bulbR = 7.5;
  const topY = 16;
  const botY = h - bulbR - 4;
  const stemH = botY - topY;

  if (highlight) {
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

  ctx.save();

  // Glass Outer Stem
  ctx.beginPath();
  ctx.roundRect(cx - stemW / 2, topY, stemW, stemH, stemW / 2);
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.65)';
  ctx.fill();
  ctx.strokeStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Glass Bulb at bottom
  ctx.beginPath();
  ctx.arc(cx, botY + 2, bulbR, 0, Math.PI * 2);
  ctx.fillStyle = liquidColor;
  ctx.fill();
  ctx.strokeStyle = isDark ? '#cbd5e1' : '#475569';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Liquid Column inside stem
  const colW = stemW - 3;
  ctx.beginPath();
  ctx.roundRect(cx - colW / 2, liquidTopY, colW, botY - liquidTopY + 2, [colW / 2, colW / 2, 0, 0]);
  ctx.fillStyle = liquidColor;
  ctx.fill();

  // Calibration Tick Marks (0 to 100 °C)
  ctx.strokeStyle = isDark ? '#cbd5e1' : '#1e293b';
  ctx.lineWidth = 0.8;
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
      ctx.font = '7.5px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${t}`, cx + stemW / 2 + 8, ty + 2.5);
    }
  }

  // Live Digital Badge above/beside thermometer
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

/**
 * Faint Pencil Badge on Container Top-Right (Click to configure)
 */
function renderPencilBadge(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  isHovered?: boolean
): void {
  ctx.save();
  const r = 9;
  ctx.beginPath();
  ctx.arc(bx, by, r, 0, Math.PI * 2);
  ctx.fillStyle = isHovered ? '#234978' : 'rgba(100, 116, 139, 0.18)';
  ctx.fill();
  ctx.strokeStyle = isHovered ? '#38bdf8' : 'rgba(100, 116, 139, 0.45)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw clean vector pencil icon
  ctx.fillStyle = isHovered ? '#ffffff' : '#64748b';
  ctx.font = '9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✎', bx, by);
  ctx.restore();
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
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
  ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(253, 251, 247, 0.75)';
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
