import type { StickerCatalogItem } from './stickersCatalog';
import type { StrokeObject } from '../types/note';
import { STICKMAN_POSE_JOINTS } from './stickFiguresSvg';

/**
 * Seamless 3D Studio-Sculpted Articulated Stickmen (`shapeType: 'stickman-3d'`, 11 draggable nodes)
 * + 12 Seamless 3D Clay Callout Stickmen (!, ?, Σκέφτομαι, Ιδέα, Προσοχή, Δεν Ξεχνώ, SOS, ✓, ✗).
 * Uses unified multi-pass organic silhouette shading (ZERO joint seams!) and SVG 3D studio lighting.
 */

function parseHexRgb(hex: string): [number, number, number] {
  const clean = (hex || '#475569').replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(num)) return [71, 85, 105];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mixRgb(rgb: [number, number, number], target: [number, number, number], t: number): string {
  const r = Math.round(rgb[0] + (target[0] - rgb[0]) * t);
  const g = Math.round(rgb[1] + (target[1] - rgb[1]) * t);
  const b = Math.round(rgb[2] + (target[2] - rgb[2]) * t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Draws the entire articulated 3D stickman as ONE seamless organic sculpted body
 * (no dark seams at shoulders/elbows/hips/knees!), with tapered torso, rounded hands/feet,
 * soft chin ambient occlusion, studio key-light highlight, and soft ground contact shadow.
 */
export function drawStickman3DStroke(ctx: CanvasRenderingContext2D, s: StrokeObject): boolean {
  if (s.shapeType !== 'stickman-3d' || !s.points || s.points.length < 11) return false;
  const [head, neck, hip, lElbow, lHand, rElbow, rHand, lKnee, lFoot, rKnee, rFoot] = s.points;
  const baseRgb = parseHexRgb(s.color || '#475569');
  const torsoLen = Math.hypot(hip.x - neck.x, hip.y - neck.y) || 40;
  const headNeckLen = Math.hypot(head.x - neck.x, head.y - neck.y) || 26;
  const limbW = Math.max(9, (s.width || 6) * 2.05);
  const torsoW = limbW * 1.72;
  const headR = Math.max(12, Math.min(torsoLen * 0.42, headNeckLen * 0.8 || 21));

  // Compute bounding box for global studio lighting gradient across the entire seamless figure
  const xs = s.points.map((p) => p.x);
  const ys = s.points.map((p) => p.y);
  const minX = Math.min(...xs) - headR;
  const maxX = Math.max(...xs) + headR;
  const minY = Math.min(...ys) - headR;
  const maxY = Math.max(...ys) + limbW;

  const traceUnifiedSkeleton = (
    offsetX: number,
    offsetY: number,
    widthScale: number,
    strokeStyle: string | CanvasGradient
  ) => {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = strokeStyle;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Smooth curved limbs using quadratic curve through elbow/knee so bends look organic
    ctx.lineWidth = limbW * 1.04 * widthScale;
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    ctx.quadraticCurveTo(lKnee.x, lKnee.y, lFoot.x, lFoot.y);
    ctx.moveTo(hip.x, hip.y);
    ctx.quadraticCurveTo(rKnee.x, rKnee.y, rFoot.x, rFoot.y);
    ctx.stroke();

    ctx.lineWidth = limbW * 0.9 * widthScale;
    ctx.beginPath();
    ctx.moveTo(neck.x, neck.y);
    ctx.quadraticCurveTo(lElbow.x, lElbow.y, lHand.x, lHand.y);
    ctx.moveTo(neck.x, neck.y);
    ctx.quadraticCurveTo(rElbow.x, rElbow.y, rHand.x, rHand.y);
    ctx.stroke();

    // Sculpted neck + fuller organic torso
    ctx.lineWidth = torsoW * widthScale;
    ctx.beginPath();
    ctx.moveTo(neck.x, neck.y);
    ctx.lineTo(hip.x, hip.y);
    ctx.stroke();

    ctx.lineWidth = limbW * 0.72 * widthScale;
    ctx.beginPath();
    ctx.moveTo(head.x, head.y);
    ctx.lineTo(neck.x, neck.y);
    ctx.stroke();

    // Rounded sculpted hands & feet
    const handR = limbW * 0.56 * widthScale;
    const footRx = limbW * 0.78 * widthScale;
    const footRy = limbW * 0.44 * widthScale;
    for (const hPt of [lHand, rHand]) {
      ctx.beginPath();
      ctx.arc(hPt.x, hPt.y, handR, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const fPt of [lFoot, rFoot]) {
      ctx.beginPath();
      ctx.ellipse(fPt.x + footRx * 0.22, fPt.y + footRy * 0.15, footRx, footRy, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  ctx.save();
  ctx.globalAlpha = s.opacity ?? 1;

  // 1. Soft studio ground shadow
  const groundY = Math.max(lFoot.y, rFoot.y, hip.y) + limbW * 0.55;
  const midFootX = (lFoot.x + rFoot.x) * 0.5;
  const spreadX = Math.max(26, Math.abs(lFoot.x - rFoot.x) * 0.74);
  const shGrad = ctx.createRadialGradient(midFootX, groundY, 2, midFootX, groundY, spreadX);
  shGrad.addColorStop(0, 'rgba(15, 23, 42, 0.24)');
  shGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = shGrad;
  ctx.beginPath();
  ctx.ellipse(midFootX, groundY, spreadX, Math.max(5.5, limbW * 0.52), 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Unified dark ambient rim (entire body drawn together -> ZERO joint seams!)
  traceUnifiedSkeleton(0, 0, 1.06, mixRgb(baseRgb, [15, 23, 42], 0.52));

  // 3. Unified base 3D studio clay gradient across the whole connected body
  const bodyGrad = ctx.createLinearGradient(minX, minY, maxX, maxY);
  bodyGrad.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.48));
  bodyGrad.addColorStop(0.45, mixRgb(baseRgb, [255, 255, 255], 0.12));
  bodyGrad.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.42));
  traceUnifiedSkeleton(0, 0, 0.96, bodyGrad);

  // 4. Inner soft key-light volume highlight (shifted slightly up-left for smooth 3D roundness)
  const hiGrad = ctx.createLinearGradient(minX, minY, maxX, maxY);
  hiGrad.addColorStop(0, 'rgba(255, 255, 255, 0.48)');
  hiGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.16)');
  hiGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  traceUnifiedSkeleton(-limbW * 0.15, -limbW * 0.14, 0.58, hiGrad);

  // 5. Subtle chin ambient occlusion shadow on upper chest/neck
  const aoGrad = ctx.createRadialGradient(neck.x, neck.y, 1, neck.x, neck.y, headR * 0.65);
  aoGrad.addColorStop(0, 'rgba(15, 23, 42, 0.28)');
  aoGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = aoGrad;
  ctx.beginPath();
  ctx.arc(neck.x, neck.y, headR * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // 6. Sculpted 3D Sphere Head (smooth 4-stop studio gradient)
  const hGrad = ctx.createRadialGradient(
    head.x - headR * 0.34,
    head.y - headR * 0.36,
    headR * 0.08,
    head.x,
    head.y,
    headR
  );
  hGrad.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.78));
  hGrad.addColorStop(0.42, mixRgb(baseRgb, [255, 255, 255], 0.18));
  hGrad.addColorStop(0.84, mixRgb(baseRgb, [15, 23, 42], 0.26));
  hGrad.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.52));
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.arc(head.x, head.y, headR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return true;
}

/**
 * Generates seamless 3D clay-sculpted SVG previews using real SVG 3D studio lighting
 * (`feGaussianBlur` + `feSpecularLighting` + `feDiffuseLighting`) on unified silhouettes!
 */
export function buildStickman3DSvgMarkup(shapeKind: string, colorHex: string): string | null {
  if (!shapeKind.startsWith('stick3d-') && !shapeKind.startsWith('callout3d-')) return null;
  const rgb = parseHexRgb(colorHex || '#475569');
  const cBase = mixRgb(rgb, [255, 255, 255], 0.18);
  const cHi = mixRgb(rgb, [255, 255, 255], 0.74);
  const cDark = mixRgb(rgb, [15, 23, 42], 0.48);

  const defs = `
    <defs>
      <!-- Real 3D Clay Bevel & Studio Lighting Filter (seamless organic volume!) -->
      <filter id="clay3d" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4.5" result="blur"/>
        <feSpecularLighting in="blur" surfaceScale="6" specularConstant="0.85" specularExponent="22" lighting-color="#ffffff" result="specOut">
          <fePointLight x="-80" y="-120" z="180"/>
        </feSpecularLighting>
        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specClipped"/>
        <feDiffuseLighting in="blur" surfaceScale="5" diffuseConstant="0.9" lighting-color="#ffffff" result="diffOut">
          <fePointLight x="-60" y="-100" z="160"/>
        </feDiffuseLighting>
        <feComposite in="diffOut" in2="SourceAlpha" operator="in" result="diffClipped"/>
        <feBlend in="SourceGraphic" in2="diffClipped" mode="multiply" result="litBase"/>
        <feComposite in="litBase" in2="specClipped" operator="arithmetic" k1="0" k2="1" k3="0.65" k4="0" result="litFinal"/>
        <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#0f172a" flood-opacity="0.22"/>
      </filter>
      <radialGradient id="g-head-dark" cx="32%" cy="28%" r="68%">
        <stop offset="0%" stop-color="${cHi}"/>
        <stop offset="48%" stop-color="${cBase}"/>
        <stop offset="100%" stop-color="${cDark}"/>
      </radialGradient>
      <radialGradient id="g-head-pearl" cx="32%" cy="26%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="52%" stop-color="#e2e8f0"/>
        <stop offset="88%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </radialGradient>
      <linearGradient id="g-red3d" x1="15%" y1="10%" x2="85%" y2="95%">
        <stop offset="0%" stop-color="#fecaca"/>
        <stop offset="35%" stop-color="#ef4444"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </linearGradient>
      <linearGradient id="g-blue3d" x1="15%" y1="10%" x2="85%" y2="95%">
        <stop offset="0%" stop-color="#bfdbfe"/>
        <stop offset="35%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <linearGradient id="g-amber3d" x1="15%" y1="10%" x2="85%" y2="95%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="35%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
      <linearGradient id="g-green3d" x1="15%" y1="10%" x2="85%" y2="95%">
        <stop offset="0%" stop-color="#bbf7d0"/>
        <stop offset="35%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#14532d"/>
      </linearGradient>
      <filter id="prop-sh" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.22"/>
      </filter>
    </defs>`;

  // 1. Seamless 3D Articulated Stickman Preview
  if (shapeKind.startsWith('stick3d-')) {
    const poseKey = shapeKind.replace('stick3d-', 'stickman-');
    const pts = STICKMAN_POSE_JOINTS[poseKey] || STICKMAN_POSE_JOINTS['stickman-standing'];
    const [head, neck, hip, lE, lH, rE, rH, lK, lF, rK, rF] = pts;
    const body = `
      <ellipse cx="${(lF[0] + rF[0]) / 2}" cy="205" rx="40" ry="7" fill="#0f172a" opacity="0.18"/>
      <g filter="url(#clay3d)" stroke="${cBase}" fill="${cBase}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M${hip[0]},${hip[1]} Q${lK[0]},${lK[1]} ${lF[0]},${lF[1]}" fill="none" stroke-width="16"/>
        <path d="M${hip[0]},${hip[1]} Q${rK[0]},${rK[1]} ${rF[0]},${rF[1]}" fill="none" stroke-width="16"/>
        <path d="M${neck[0]},${neck[1]} Q${lE[0]},${lE[1]} ${lH[0]},${lH[1]}" fill="none" stroke-width="13"/>
        <path d="M${neck[0]},${neck[1]} Q${rE[0]},${rE[1]} ${rH[0]},${rH[1]}" fill="none" stroke-width="13"/>
        <line x1="${neck[0]}" y1="${neck[1]}" x2="${hip[0]}" y2="${hip[1]}" stroke-width="25"/>
        <line x1="${head[0]}" y1="${head[1]}" x2="${neck[0]}" y2="${neck[1]}" stroke-width="11"/>
        <circle cx="${lH[0]}" cy="${lH[1]}" r="7.5" stroke="none"/>
        <circle cx="${rH[0]}" cy="${rH[1]}" r="7.5" stroke="none"/>
        <ellipse cx="${lF[0] + 3}" cy="${lF[1] + 2}" rx="11" ry="6.5" stroke="none"/>
        <ellipse cx="${rF[0] + 3}" cy="${rF[1] + 2}" rx="11" ry="6.5" stroke="none"/>
      </g>
      <circle cx="${head[0]}" cy="${head[1]}" r="22" fill="url(#g-head-dark)" filter="url(#prop-sh)"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">${defs}${body}</svg>`;
  }

  // 2. Seamless Sculpted Pearl-White 3D Mannequin for Callouts (matching reference images 1 & 2!)
  const pearlMannequin = (
    lArmPath = 'M116,96 Q94,102 74,112',
    rArmPath = 'M144,96 Q168,84 182,54',
    lHandPt: [number, number] = [74, 112],
    rHandPt: [number, number] = [182, 54]
  ) => `
    <ellipse cx="128" cy="204" rx="54" ry="8.5" fill="#0f172a" opacity="0.16"/>
    <!-- Single unified seamless sculpted pearl-clay mannequin silhouette -->
    <g filter="url(#clay3d)" fill="#e8edf3" stroke="#e8edf3" stroke-linecap="round" stroke-linejoin="round">
      <!-- Smooth curved torso + hips + tapered legs + sculpted feet as ONE seamless organic shape -->
      <path stroke="none" d="
        M122,82 L138,82
        C149,84 154,94 152,110
        C150,124 148,136 150,148
        L154,190 C156,197 166,198 168,202
        C169,206 146,207 142,202
        L136,154 C133,148 127,148 124,154
        L118,202 C114,207 91,206 92,202
        C94,198 104,197 106,190
        L110,148 C112,136 110,124 108,110
        C106,94 111,84 122,82 Z"/>
      <!-- Organic curved arms welded seamlessly into shoulders -->
      <path d="${lArmPath}" fill="none" stroke-width="14"/>
      <path d="${rArmPath}" fill="none" stroke-width="14"/>
      <circle cx="${lHandPt[0]}" cy="${lHandPt[1]}" r="8" stroke="none"/>
      <circle cx="${rHandPt[0]}" cy="${rHandPt[1]}" r="8" stroke="none"/>
    </g>
    <!-- Soft chin shadow -->
    <ellipse cx="130" cy="85" rx="14" ry="5" fill="#64748b" opacity="0.22"/>
    <!-- Sculpted 3D Sphere Head -->
    <circle cx="130" cy="58" r="26" fill="url(#g-head-pearl)" filter="url(#prop-sh)"/>`;

  let calloutBody = '';
  switch (shapeKind) {
    case 'callout3d-exclamation':
      calloutBody = `
        ${pearlMannequin('M114,98 Q92,108 72,110', 'M146,98 Q170,82 180,46', [72, 110], [180, 46])}
        <g filter="url(#prop-sh)">
          <rect x="44" y="30" width="24" height="118" rx="11" fill="url(#g-red3d)" stroke="#991b1b" stroke-width="1.2"/>
          <rect x="49" y="38" width="5" height="98" rx="2.5" fill="#ffffff" opacity="0.35"/>
          <circle cx="56" cy="174" r="14" fill="url(#g-red3d)" stroke="#991b1b" stroke-width="1.2"/>
          <circle cx="52" cy="170" r="4" fill="#ffffff" opacity="0.38"/>
        </g>`;
      break;
    case 'callout3d-question':
      calloutBody = `
        ${pearlMannequin('M114,98 Q92,110 74,116', 'M146,98 Q168,94 152,72', [74, 116], [152, 72])}
        <g filter="url(#prop-sh)">
          <text x="52" y="156" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="140" fill="url(#g-blue3d)" stroke="#1e3a8a" stroke-width="1.8">?</text>
        </g>`;
      break;
    case 'callout3d-thinking':
      calloutBody = `
        ${pearlMannequin('M114,98 Q88,124 120,126', 'M146,98 Q166,110 144,78', [120, 126], [144, 78])}
        <g filter="url(#prop-sh)">
          <circle cx="164" cy="48" r="5" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4"/>
          <circle cx="176" cy="36" r="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4"/>
          <rect x="14" y="10" width="128" height="44" rx="22" fill="#ffffff" stroke="#2563eb" stroke-width="2.2"/>
          <text x="78" y="38" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="800" font-size="16" fill="#1e3a8a">Σκέφτομαι...</text>
        </g>`;
      break;
    case 'callout3d-idea':
      calloutBody = `
        ${pearlMannequin('M114,98 Q88,84 74,64', 'M146,98 Q170,80 180,50', [74, 64], [180, 50])}
        <g filter="url(#prop-sh)">
          <circle cx="52" cy="54" r="24" fill="url(#g-amber3d)" stroke="#b45309" stroke-width="1.4"/>
          <circle cx="44" cy="46" r="7" fill="#ffffff" opacity="0.45"/>
          <rect x="43" y="78" width="18" height="12" rx="3" fill="#64748b"/>
          <path d="M52,16 L52,23 M18,54 L25,54 M80,54 L87,54 M28,30 L33,35 M76,30 L71,35" stroke="#f59e0b" stroke-width="3.2" stroke-linecap="round"/>
        </g>`;
      break;
    case 'callout3d-warning':
      calloutBody = `
        ${pearlMannequin('M114,98 Q92,110 78,118', 'M146,98 Q172,82 180,56', [78, 118], [180, 56])}
        <g filter="url(#prop-sh)">
          <polygon points="54,32 96,110 12,110" fill="url(#g-amber3d)" stroke="#92400e" stroke-width="2.4" stroke-linejoin="round"/>
          <text x="54" y="98" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="48" fill="#1e293b">!</text>
          <rect x="12" y="120" width="86" height="26" rx="8" fill="url(#g-red3d)"/>
          <text x="55" y="138" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="800" font-size="12.5" fill="#ffffff">ΠΡΟΣΟΧΗ!</text>
        </g>`;
      break;
    case 'callout3d-remember':
      calloutBody = `
        ${pearlMannequin('M114,98 Q96,110 86,116', 'M146,98 Q172,80 180,54', [86, 116], [180, 54])}
        <g filter="url(#prop-sh)">
          <rect x="12" y="42" width="88" height="86" rx="10" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
          <circle cx="56" cy="48" r="7.5" fill="url(#g-red3d)"/>
          <text x="56" y="82" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="14" fill="#991b1b">ΔΕΝ</text>
          <text x="56" y="104" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="14" fill="#991b1b">ΞΕΧΝΩ!</text>
        </g>`;
      break;
    case 'callout3d-check':
      calloutBody = `
        ${pearlMannequin('M114,98 Q92,108 78,112', 'M146,98 Q172,78 182,52', [78, 112], [182, 52])}
        <g filter="url(#prop-sh)">
          <circle cx="54" cy="94" r="36" fill="url(#g-green3d)" stroke="#14532d" stroke-width="1.8"/>
          <path d="M36,94 L48,108 L74,78" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>`;
      break;
    case 'callout3d-wrong':
      calloutBody = `
        ${pearlMannequin('M114,98 Q92,108 78,112', 'M146,98 Q166,116 176,128', [78, 112], [176, 128])}
        <g filter="url(#prop-sh)">
          <circle cx="54" cy="94" r="36" fill="url(#g-red3d)" stroke="#991b1b" stroke-width="1.8"/>
          <path d="M38,78 L70,110 M70,78 L38,110" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        </g>`;
      break;
    case 'callout3d-star':
      calloutBody = `
        ${pearlMannequin('M114,98 Q92,108 78,112', 'M146,98 Q172,78 182,52', [78, 112], [182, 52])}
        <g filter="url(#prop-sh)">
          <polygon points="54,34 65,64 96,64 71,82 80,112 54,94 28,112 37,82 12,64 43,64" fill="url(#g-amber3d)" stroke="#b45309" stroke-width="1.8" stroke-linejoin="round"/>
          <text x="54" y="82" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="16" fill="#7c2d12">SOS</text>
        </g>`;
      break;
    case 'callout3d-formula':
      calloutBody = `
        ${pearlMannequin('M114,98 Q96,108 86,112', 'M146,98 Q170,84 180,68', [86, 112], [180, 68])}
        <g filter="url(#prop-sh)">
          <rect x="10" y="48" width="90" height="62" rx="12" fill="url(#g-blue3d)" stroke="#1e3a8a" stroke-width="1.8"/>
          <text x="55" y="76" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="17" fill="#ffffff">ΤΥΠΟΣ</text>
          <text x="55" y="96" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="13" fill="#dbeafe">F = m·α</text>
        </g>`;
      break;
    case 'callout3d-pointing':
      calloutBody = `
        ${pearlMannequin('M114,98 Q94,118 88,134', 'M146,98 Q174,98 198,98', [88, 134], [198, 98])}
        <g filter="url(#prop-sh)">
          <polygon points="154,48 184,48 184,36 210,58 184,80 184,68 154,68" fill="url(#g-red3d)" stroke="#991b1b" stroke-width="1.2"/>
        </g>`;
      break;
    case 'callout3d-celebrate':
      calloutBody = `
        ${pearlMannequin('M114,98 Q86,78 72,48', 'M146,98 Q174,78 188,48', [72, 48], [188, 48])}
        <g filter="url(#prop-sh)">
          <rect x="44" y="10" width="156" height="32" rx="16" fill="url(#g-green3d)"/>
          <text x="122" y="31" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="800" font-size="15" fill="#ffffff">ΜΠΡΑΒΟ! ★</text>
        </g>`;
      break;
    default:
      return null;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">${defs}${calloutBody}</svg>`;
}

const STICK3D_TAGS = ['stickman 3d', 'stickman', '3d', 'ανθρωπάκι', '3d ανθρωπάκι', 'φωτοσκίαση', 'vector'];
const CALLOUT3D_TAGS = ['3d', 'stickman 3d', 'ανθρωπάκι', 'σημείωση', 'επισήμανση', 'προσοχή', 'δεν ξεχνώ', 'vector'];

export const STICK_FIGURES_3D_STICKERS: StickerCatalogItem[] = [
  // 12 Seamless Articulated 3D Studio-Sculpted Stickmen (11 draggable nodes on canvas!)
  { id: 'sk-stick3d-pushing', title: '3D Stickman — Σπρώχνει (11 Nodes)', iconifyId: 'custom-svg:stick3d-pushing:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'σπρώχνω', 'δύναμη', 'κιβώτιο', 'τριβή'] },
  { id: 'sk-stick3d-pulling', title: '3D Stickman — Τραβάει (11 Nodes)', iconifyId: 'custom-svg:stick3d-pulling:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'τραβάω', 'έλξη', 'σχοινί', 'τάση'] },
  { id: 'sk-stick3d-running', title: '3D Stickman — Τρέχει (11 Nodes)', iconifyId: 'custom-svg:stick3d-running:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'τρέχω', 'ταχύτητα', 'κίνηση'] },
  { id: 'sk-stick3d-walking', title: '3D Stickman — Περπατάει (11 Nodes)', iconifyId: 'custom-svg:stick3d-walking:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'περπατάω', 'βάδισμα', 'κίνηση'] },
  { id: 'sk-stick3d-standing', title: '3D Stickman — Όρθιος (11 Nodes)', iconifyId: 'custom-svg:stick3d-standing:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'όρθιος', 'στάση'] },
  { id: 'sk-stick3d-lifting', title: '3D Stickman — Σηκώνει Βάρος (11 Nodes)', iconifyId: 'custom-svg:stick3d-lifting:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'σηκώνω', 'βάρος', 'ανύψωση'] },
  { id: 'sk-stick3d-sitting', title: '3D Stickman — Κάθεται (11 Nodes)', iconifyId: 'custom-svg:stick3d-sitting:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'κάθομαι', 'καθιστός'] },
  { id: 'sk-stick3d-hanging', title: '3D Stickman — Κρέμεται (11 Nodes)', iconifyId: 'custom-svg:stick3d-hanging:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'κρέμομαι', 'τάση', 'βάρος'] },
  { id: 'sk-stick3d-jumping', title: '3D Stickman — Πηδάει (11 Nodes)', iconifyId: 'custom-svg:stick3d-jumping:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'πηδάω', 'άλμα', 'βαρύτητα'] },
  { id: 'sk-stick3d-throwing', title: '3D Stickman — Πετάει (Βολή, 11 Nodes)', iconifyId: 'custom-svg:stick3d-throwing:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'πετάω', 'βολή'] },
  { id: 'sk-stick3d-balancing', title: '3D Stickman — Ισορροπεί (11 Nodes)', iconifyId: 'custom-svg:stick3d-balancing:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'ισορροπία', 'κέντρο μάζας'] },
  { id: 'sk-stick3d-pull-left', title: '3D Stickman — Προφίλ Αριστερά (11 Nodes)', iconifyId: 'custom-svg:stick3d-pull-left:#475569:12', category: 'Μονόχρωμα Σκίτσα', colorStyle: 'monochrome', tags: [...STICK3D_TAGS, 'προφίλ', 'αριστερά', 'βήμα'] },

  // 12 Seamless 3D Clay Callouts (!, ?, Σκέφτομαι, Ιδέα, Προσοχή, Δεν Ξεχνώ, SOS, ✓, ✗)
  { id: 'sk-callout3d-exclamation', title: '3D Θαυμαστικό (!) — Σημαντικό', iconifyId: 'custom-svg:callout3d-exclamation:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'θαυμαστικό', 'σημαντικό', '!'] },
  { id: 'sk-callout3d-question', title: '3D Ερωτηματικό (?) — Απορία', iconifyId: 'custom-svg:callout3d-question:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'ερωτηματικό', 'απορία', 'ερώτηση', '?'] },
  { id: 'sk-callout3d-thinking', title: '3D Σκέφτομαι... (Συννεφάκι)', iconifyId: 'custom-svg:callout3d-thinking:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'σκέφτομαι', 'απορία', 'ιδέα'] },
  { id: 'sk-callout3d-idea', title: '3D Ιδέα! (Φωτεινή Λάμπα)', iconifyId: 'custom-svg:callout3d-idea:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'ιδέα', 'λάμπα', 'λύση', 'έμπνευση'] },
  { id: 'sk-callout3d-warning', title: '3D ΠΡΟΣΟΧΗ! (Τρίγωνο Κινδύνου)', iconifyId: 'custom-svg:callout3d-warning:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'προσοχή', 'κίνδυνος', 'παγίδα', 'θαυμαστικό'] },
  { id: 'sk-callout3d-remember', title: '3D ΔΕΝ ΞΕΧΝΩ! (Σημείωμα)', iconifyId: 'custom-svg:callout3d-remember:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'δεν ξεχνώ', 'θυμάμαι', 'υπενθύμιση', 'σημείωμα'] },
  { id: 'sk-callout3d-check', title: '3D Σωστό! (Πράσινο ✓)', iconifyId: 'custom-svg:callout3d-check:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'σωστό', 'ναι', 'ok', 'check'] },
  { id: 'sk-callout3d-wrong', title: '3D Λάθος! (Κόκκινο ✗)', iconifyId: 'custom-svg:callout3d-wrong:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'λάθος', 'όχι', 'προσοχή', 'απαγορεύεται'] },
  { id: 'sk-callout3d-star', title: '3D SOS! (Χρυσό Αστέρι Εξετάσεων)', iconifyId: 'custom-svg:callout3d-star:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'sos', 'εξετάσεις', 'αστέρι', 'σημαντικό'] },
  { id: 'sk-callout3d-formula', title: '3D Τύπος / Νόμος (F = m·α)', iconifyId: 'custom-svg:callout3d-formula:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'τύπος', 'νόμος', 'κανόνας', 'εξίσωση'] },
  { id: 'sk-callout3d-pointing', title: '3D Δες Εδώ! (Δείχνει Δεξιά →)', iconifyId: 'custom-svg:callout3d-pointing:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'δείχνω', 'βέλος', 'δες εδώ', 'προσοχή'] },
  { id: 'sk-callout3d-celebrate', title: '3D Μπράβο! (Επιτυχία ★)', iconifyId: 'custom-svg:callout3d-celebrate:#475569:12', category: 'Κεραυνοί & Εφέ', colorStyle: 'multicolor', tags: [...CALLOUT3D_TAGS, 'μπράβο', 'επιτυχία', 'νίκη', 'πανηγυρίζω'] },
];
