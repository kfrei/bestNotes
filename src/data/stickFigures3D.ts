import type { StickerCatalogItem } from './stickersCatalog';
import type { StrokeObject } from '../types/note';
import { STICKMAN_POSE_JOINTS } from './stickFiguresSvg';

/**
 * 3D Studio-Shaded Articulated Stickmen (`shapeType: 'stickman-3d'`, 11 draggable nodes)
 * + 12 3D Callout / Expression Stickmen (!, ?, Σκέφτομαι, Ιδέα, Προσοχή, Δεν Ξεχνώ, SOS, ✓, ✗).
 * Matches the matte-studio 3D shading of BestNotes shaded 3D shapes (cuboid/sphere/cylinder).
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

function draw3DCapsule(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  baseRgb: [number, number, number]
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // Perpendicular normal pointing slightly up-left for studio key light
  const nx = -dy / len;
  const ny = dx / len;
  const gx1 = (x1 + x2) * 0.5 + nx * width * 0.55;
  const gy1 = (y1 + y2) * 0.5 + ny * width * 0.55;
  const gx2 = (x1 + x2) * 0.5 - nx * width * 0.55;
  const gy2 = (y1 + y2) * 0.5 - ny * width * 0.55;

  const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
  grad.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.52));
  grad.addColorStop(0.35, mixRgb(baseRgb, [255, 255, 255], 0.16));
  grad.addColorStop(0.75, mixRgb(baseRgb, [15, 23, 42], 0.18));
  grad.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.48));

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Subtle outer depth rim
  ctx.strokeStyle = mixRgb(baseRgb, [15, 23, 42], 0.55);
  ctx.lineWidth = width + 1.4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Main 3D shaded capsule
  ctx.strokeStyle = grad;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Specular highlight ribbon
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = Math.max(1.2, width * 0.22);
  ctx.beginPath();
  ctx.moveTo(x1 + nx * width * 0.2, y1 + ny * width * 0.2);
  ctx.lineTo(x2 + nx * width * 0.2, y2 + ny * width * 0.2);
  ctx.stroke();
  ctx.restore();
}

export function drawStickman3DStroke(ctx: CanvasRenderingContext2D, s: StrokeObject): boolean {
  if (s.shapeType !== 'stickman-3d' || !s.points || s.points.length < 11) return false;
  const [head, neck, hip, lElbow, lHand, rElbow, rHand, lKnee, lFoot, rKnee, rFoot] = s.points;
  const baseRgb = parseHexRgb(s.color || '#475569');
  const torsoLen = Math.hypot(hip.x - neck.x, hip.y - neck.y);
  const headNeckLen = Math.hypot(head.x - neck.x, head.y - neck.y);
  const limbW = Math.max(8, (s.width || 6) * 1.9);
  const torsoW = limbW * 1.65;
  const headR = Math.max(11, Math.min(torsoLen * 0.4, headNeckLen * 0.78 || 20));

  ctx.save();
  ctx.globalAlpha = s.opacity ?? 1;

  // 1. Soft studio ground shadow beneath lowest foot
  const maxY = Math.max(lFoot.y, rFoot.y, hip.y);
  const midFootX = (lFoot.x + rFoot.x) * 0.5;
  const spreadX = Math.max(22, Math.abs(lFoot.x - rFoot.x) * 0.68);
  const shGrad = ctx.createRadialGradient(midFootX, maxY + 6, 2, midFootX, maxY + 6, spreadX);
  shGrad.addColorStop(0, 'rgba(15, 23, 42, 0.22)');
  shGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = shGrad;
  ctx.beginPath();
  ctx.ellipse(midFootX, maxY + 6, spreadX, Math.max(5, limbW * 0.55), 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Back limbs (left arm & left leg drawn first for subtle depth)
  draw3DCapsule(ctx, hip.x, hip.y, lKnee.x, lKnee.y, limbW * 1.05, baseRgb);
  draw3DCapsule(ctx, lKnee.x, lKnee.y, lFoot.x, lFoot.y, limbW * 0.95, baseRgb);
  draw3DCapsule(ctx, neck.x, neck.y, lElbow.x, lElbow.y, limbW * 0.92, baseRgb);
  draw3DCapsule(ctx, lElbow.x, lElbow.y, lHand.x, lHand.y, limbW * 0.85, baseRgb);

  // 3. Sculpted 3D Torso
  draw3DCapsule(ctx, neck.x, neck.y, hip.x, hip.y, torsoW, baseRgb);

  // 4. Front limbs (right leg & right arm)
  draw3DCapsule(ctx, hip.x, hip.y, rKnee.x, rKnee.y, limbW * 1.08, baseRgb);
  draw3DCapsule(ctx, rKnee.x, rKnee.y, rFoot.x, rFoot.y, limbW * 0.98, baseRgb);
  draw3DCapsule(ctx, neck.x, neck.y, rElbow.x, rElbow.y, limbW * 0.94, baseRgb);
  draw3DCapsule(ctx, rElbow.x, rElbow.y, rHand.x, rHand.y, limbW * 0.88, baseRgb);

  // 5. 3D Studio-Shaded Sphere Head
  const hGrad = ctx.createRadialGradient(
    head.x - headR * 0.34,
    head.y - headR * 0.34,
    headR * 0.1,
    head.x,
    head.y,
    headR
  );
  hGrad.addColorStop(0, mixRgb(baseRgb, [255, 255, 255], 0.72));
  hGrad.addColorStop(0.45, mixRgb(baseRgb, [255, 255, 255], 0.14));
  hGrad.addColorStop(0.85, mixRgb(baseRgb, [15, 23, 42], 0.25));
  hGrad.addColorStop(1, mixRgb(baseRgb, [15, 23, 42], 0.55));
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.arc(head.x, head.y, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = mixRgb(baseRgb, [15, 23, 42], 0.45);
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();
  return true;
}

export function buildStickman3DSvgMarkup(shapeKind: string, colorHex: string): string | null {
  if (!shapeKind.startsWith('stick3d-') && !shapeKind.startsWith('callout3d-')) return null;
  const rgb = parseHexRgb(colorHex || '#475569');
  const cLight = mixRgb(rgb, [255, 255, 255], 0.65);
  const cMid = mixRgb(rgb, [255, 255, 255], 0.12);
  const cDark = mixRgb(rgb, [15, 23, 42], 0.48);

  const defs = `
    <defs>
      <radialGradient id="g-head" cx="32%" cy="28%" r="68%">
        <stop offset="0%" stop-color="${cLight}"/>
        <stop offset="48%" stop-color="${cMid}"/>
        <stop offset="100%" stop-color="${cDark}"/>
      </radialGradient>
      <linearGradient id="g-limb" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${cLight}"/>
        <stop offset="45%" stop-color="${cMid}"/>
        <stop offset="100%" stop-color="${cDark}"/>
      </linearGradient>
      <radialGradient id="g-pearl" cx="32%" cy="28%" r="68%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="55%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </radialGradient>
      <linearGradient id="g-pearl-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="55%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
      <linearGradient id="g-red3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fecaca"/>
        <stop offset="45%" stop-color="#ef4444"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </linearGradient>
      <linearGradient id="g-blue3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#bfdbfe"/>
        <stop offset="45%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <linearGradient id="g-amber3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="45%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
      <linearGradient id="g-green3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#bbf7d0"/>
        <stop offset="45%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#14532d"/>
      </linearGradient>
      <filter id="sh3d" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.22"/>
      </filter>
    </defs>`;

  if (shapeKind.startsWith('stick3d-')) {
    const poseKey = shapeKind.replace('stick3d-', 'stickman-');
    const pts = STICKMAN_POSE_JOINTS[poseKey] || STICKMAN_POSE_JOINTS['stickman-standing'];
    const [head, neck, hip, lE, lH, rE, rH, lK, lF, rK, rF] = pts;
    const body = `
      <ellipse cx="${(lF[0] + rF[0]) / 2}" cy="205" rx="38" ry="7" fill="#0f172a" opacity="0.16"/>
      <g filter="url(#sh3d)" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M${hip[0]},${hip[1]} L${lK[0]},${lK[1]} L${lF[0]},${lF[1]}" stroke="url(#g-limb)" stroke-width="15"/>
        <path d="M${neck[0]},${neck[1]} L${lE[0]},${lE[1]} L${lH[0]},${lH[1]}" stroke="url(#g-limb)" stroke-width="13"/>
        <line x1="${neck[0]}" y1="${neck[1]}" x2="${hip[0]}" y2="${hip[1]}" stroke="url(#g-limb)" stroke-width="24"/>
        <path d="M${hip[0]},${hip[1]} L${rK[0]},${rK[1]} L${rF[0]},${rF[1]}" stroke="url(#g-limb)" stroke-width="15"/>
        <path d="M${neck[0]},${neck[1]} L${rE[0]},${rE[1]} L${rH[0]},${rH[1]}" stroke="url(#g-limb)" stroke-width="13"/>
        <circle cx="${head[0]}" cy="${head[1]}" r="21" fill="url(#g-head)" stroke="${cDark}" stroke-width="1.2"/>
      </g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">${defs}${body}</svg>`;
  }

  // 3D Expressive Callout Stickmen (pearl-silver 3D character + bold 3D symbol / label!)
  const charBase = (armR = 'M140,104 L176,68', armL = 'M104,104 L76,120') => `
    <ellipse cx="122" cy="204" rx="52" ry="8" fill="#0f172a" opacity="0.16"/>
    <g filter="url(#sh3d)" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M112,144 L102,194" stroke="url(#g-pearl-body)" stroke-width="16"/>
      <path d="M132,144 L142,194" stroke="url(#g-pearl-body)" stroke-width="16"/>
      <path d="${armL}" stroke="url(#g-pearl-body)" stroke-width="13"/>
      <rect x="104" y="92" width="36" height="58" rx="18" fill="url(#g-pearl-body)" stroke="#94a3b8" stroke-width="1"/>
      <path d="${armR}" stroke="url(#g-pearl-body)" stroke-width="13"/>
      <circle cx="122" cy="64" r="24" fill="url(#g-pearl)" stroke="#94a3b8" stroke-width="1.2"/>
    </g>`;

  let calloutBody = '';
  switch (shapeKind) {
    case 'callout3d-exclamation':
      calloutBody = `
        ${charBase('M140,104 L174,56', 'M104,106 L74,116')}
        <g filter="url(#sh3d)">
          <rect x="44" y="34" width="24" height="114" rx="10" fill="url(#g-red3d)" stroke="#991b1b" stroke-width="1.4"/>
          <circle cx="56" cy="174" r="14" fill="url(#g-red3d)" stroke="#991b1b" stroke-width="1.4"/>
        </g>`;
      break;
    case 'callout3d-question':
      calloutBody = `
        ${charBase('M140,104 L168,84 L152,66', 'M104,108 L76,122')}
        <g filter="url(#sh3d)">
          <text x="54" y="150" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="136" fill="url(#g-blue3d)" stroke="#1e3a8a" stroke-width="2">?</text>
        </g>`;
      break;
    case 'callout3d-thinking':
      calloutBody = `
        ${charBase('M140,106 L162,90 L144,72', 'M104,108 L80,132 L106,134')}
        <g filter="url(#sh3d)">
          <circle cx="164" cy="48" r="5" fill="#fff" stroke="#64748b" stroke-width="1.5"/>
          <circle cx="176" cy="36" r="8" fill="#fff" stroke="#64748b" stroke-width="1.5"/>
          <rect x="18" y="12" width="122" height="44" rx="22" fill="#ffffff" stroke="#2563eb" stroke-width="2.2"/>
          <text x="79" y="40" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="800" font-size="16" fill="#1e3a8a">Σκέφτομαι...</text>
        </g>`;
      break;
    case 'callout3d-idea':
      calloutBody = `
        ${charBase('M140,104 L174,56', 'M104,104 L74,70')}
        <g filter="url(#sh3d)">
          <circle cx="54" cy="54" r="24" fill="url(#g-amber3d)" stroke="#b45309" stroke-width="1.6"/>
          <rect x="45" y="78" width="18" height="12" rx="3" fill="#64748b"/>
          <path d="M54,18 L54,24 M20,54 L26,54 M82,54 L88,54 M30,30 L35,35 M78,30 L73,35" stroke="#f59e0b" stroke-width="3.2" stroke-linecap="round"/>
        </g>`;
      break;
    case 'callout3d-warning':
      calloutBody = `
        ${charBase('M140,106 L172,76', 'M104,108 L78,122')}
        <g filter="url(#sh3d)">
          <polygon points="56,36 96,112 16,112" fill="url(#g-amber3d)" stroke="#92400e" stroke-width="2.5" stroke-linejoin="round"/>
          <text x="56" y="100" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="48" fill="#1e293b">!</text>
          <rect x="16" y="122" width="84" height="26" rx="8" fill="#dc2626"/>
          <text x="58" y="140" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="800" font-size="12.5" fill="#ffffff">ΠΡΟΣΟΧΗ!</text>
        </g>`;
      break;
    case 'callout3d-remember':
      calloutBody = `
        ${charBase('M140,106 L174,64', 'M104,108 L84,120')}
        <g filter="url(#sh3d)">
          <rect x="14" y="42" width="88" height="86" rx="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
          <circle cx="58" cy="48" r="7" fill="url(#g-red3d)"/>
          <text x="58" y="82" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="14" fill="#991b1b">ΔΕΝ</text>
          <text x="58" y="104" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="14" fill="#991b1b">ΞΕΧΝΩ!</text>
        </g>`;
      break;
    case 'callout3d-check':
      calloutBody = `
        ${charBase('M140,104 L176,62', 'M104,106 L76,120')}
        <g filter="url(#sh3d)">
          <circle cx="56" cy="94" r="36" fill="url(#g-green3d)" stroke="#14532d" stroke-width="2"/>
          <path d="M38,94 L50,108 L76,78" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>`;
      break;
    case 'callout3d-wrong':
      calloutBody = `
        ${charBase('M140,106 L170,126', 'M104,106 L76,120')}
        <g filter="url(#sh3d)">
          <circle cx="56" cy="94" r="36" fill="url(#g-red3d)" stroke="#991b1b" stroke-width="2"/>
          <path d="M40,78 L72,110 M72,78 L40,110" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        </g>`;
      break;
    case 'callout3d-star':
      calloutBody = `
        ${charBase('M140,104 L176,58', 'M104,106 L78,118')}
        <g filter="url(#sh3d)">
          <polygon points="56,36 67,66 98,66 73,84 82,114 56,96 30,114 39,84 14,66 45,66" fill="url(#g-amber3d)" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/>
          <text x="56" y="84" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="900" font-size="16" fill="#7c2d12">SOS</text>
        </g>`;
      break;
    case 'callout3d-formula':
      calloutBody = `
        ${charBase('M140,104 L174,80', 'M104,104 L84,114')}
        <g filter="url(#sh3d)">
          <rect x="12" y="48" width="90" height="62" rx="10" fill="url(#g-blue3d)" stroke="#1e3a8a" stroke-width="2"/>
          <text x="57" y="76" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="17" fill="#ffffff">ΤΥΠΟΣ</text>
          <text x="57" y="96" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="13" fill="#dbeafe">F = m·α</text>
        </g>`;
      break;
    case 'callout3d-pointing':
      calloutBody = `
        ${charBase('M140,104 L196,104', 'M104,108 L78,132')}
        <g filter="url(#sh3d)">
          <polygon points="154,50 184,50 184,38 210,60 184,82 184,70 154,70" fill="url(#g-red3d)" stroke="#991b1b" stroke-width="1.4"/>
        </g>`;
      break;
    case 'callout3d-celebrate':
      calloutBody = `
        ${charBase('M140,104 L176,54', 'M104,104 L68,54')}
        <g filter="url(#sh3d)">
          <rect x="44" y="14" width="156" height="32" rx="16" fill="url(#g-green3d)"/>
          <text x="122" y="35" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="800" font-size="15" fill="#ffffff">ΜΠΡΑΒΟ! ★</text>
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
  // 12 Articulated 3D Studio-Shaded Stickmen (11 draggable nodes on canvas!)
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

  // 12 3D Expressive Callouts (!, ?, Σκέφτομαι, Ιδέα, Προσοχή, Δεν Ξεχνώ, SOS, ✓, ✗)
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
