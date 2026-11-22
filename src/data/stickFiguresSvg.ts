import type { StickerCatalogItem } from './stickersCatalog';
import type { StrokeObject } from '../types/note';

/**
 * 20 Minimalist Articulated Stick Figures (Ανθρωπάκια / Stickmen)
 * 11-joint skeleton: [head, neck, hip, lElbow, lHand, rElbow, rHand, lKnee, lFoot, rKnee, rFoot]
 * - Previewed in Σκίτσα as crisp live-colored SVGs
 * - Inserted on canvas as native `shapeType: 'stickman'` StrokeObjects with 11 draggable nodes
 *   so users can bend or lengthen any arm, leg, torso, or head directly on the page!
 */
export const STICKMAN_POSE_JOINTS: Record<string, [number, number][]> = {
  'stickman-pull-left': [
    [118, 46], [116, 78], [112, 134],
    [82, 96], [48, 114], [86, 100], [54, 118],
    [84, 166], [56, 200], [134, 158], [104, 200],
  ],
  'stickman-standing': [
    [110, 44], [110, 74], [110, 132],
    [93, 98], [76, 118], [127, 98], [144, 118],
    [98, 164], [86, 196], [122, 164], [134, 196],
  ],
  'stickman-walking': [
    [114, 42], [111, 72], [106, 128],
    [93, 96], [76, 112], [127, 94], [144, 108],
    [82, 162], [66, 196], [138, 162], [146, 196],
  ],
  'stickman-running': [
    [134, 42], [122, 72], [102, 122],
    [80, 96], [64, 116], [156, 94], [168, 78],
    [70, 152], [44, 142], [142, 144], [158, 188],
  ],
  'stickman-pushing': [
    [138, 50], [120, 78], [94, 132],
    [144, 86], [172, 88], [142, 100], [172, 104],
    [64, 164], [44, 196], [132, 162], [136, 196],
  ],
  'stickman-pulling': [
    [80, 50], [95, 78], [116, 132],
    [126, 92], [160, 100], [126, 104], [160, 110],
    [88, 164], [78, 196], [144, 164], [164, 196],
  ],
  'stickman-lifting': [
    [110, 62], [110, 88], [110, 136],
    [74, 76], [74, 40], [146, 76], [146, 40],
    [82, 164], [82, 196], [138, 164], [138, 196],
  ],
  'stickman-carrying': [
    [110, 44], [107, 74], [102, 130],
    [138, 104], [162, 94], [132, 116], [156, 108],
    [78, 164], [68, 196], [132, 164], [138, 196],
  ],
  'stickman-sitting': [
    [92, 52], [92, 82], [92, 136],
    [110, 104], [130, 118], [104, 112], [124, 126],
    [146, 136], [152, 194], [138, 144], [142, 194],
  ],
  'stickman-hanging': [
    [110, 74], [110, 100], [110, 152],
    [82, 66], [82, 30], [138, 66], [138, 30],
    [102, 174], [96, 196], [118, 174], [126, 194],
  ],
  'stickman-jumping': [
    [110, 38], [110, 66], [110, 116],
    [86, 56], [68, 42], [134, 56], [152, 42],
    [80, 148], [92, 178], [140, 144], [152, 172],
  ],
  'stickman-falling': [
    [122, 58], [110, 84], [94, 132],
    [86, 76], [64, 66], [134, 82], [156, 76],
    [64, 162], [52, 188], [124, 158], [146, 178],
  ],
  'stickman-throwing': [
    [106, 44], [103, 74], [100, 130],
    [84, 92], [68, 106], [142, 64], [164, 46],
    [74, 164], [60, 196], [134, 162], [144, 196],
  ],
  'stickman-kicking': [
    [96, 44], [99, 74], [104, 130],
    [82, 94], [66, 108], [120, 92], [138, 104],
    [94, 164], [84, 196], [144, 152], [170, 134],
  ],
  'stickman-climbing': [
    [114, 42], [111, 72], [104, 126],
    [90, 88], [74, 98], [128, 60], [144, 44],
    [78, 162], [84, 198], [138, 140], [134, 178],
  ],
  'stickman-waving': [
    [110, 44], [110, 74], [110, 132],
    [92, 98], [76, 118], [144, 58], [164, 38],
    [98, 164], [86, 196], [122, 164], [134, 196],
  ],
  'stickman-thinking': [
    [106, 46], [106, 76], [106, 134],
    [74, 114], [94, 130], [138, 94], [126, 64],
    [96, 166], [86, 196], [116, 166], [126, 196],
  ],
  'stickman-balancing': [
    [110, 42], [110, 72], [110, 126],
    [76, 76], [44, 72], [144, 84], [176, 88],
    [110, 162], [110, 196], [146, 144], [156, 168],
  ],
  'stickman-sliding': [
    [128, 52], [116, 80], [98, 124],
    [94, 90], [72, 98], [136, 94], [156, 102],
    [76, 154], [94, 186], [132, 148], [120, 182],
  ],
  'stickman-cycling': [
    [122, 46], [112, 74], [94, 114],
    [132, 86], [152, 96], [126, 94], [148, 102],
    [82, 148], [68, 166], [122, 136], [112, 162],
  ],
  'stickman-celebrating': [
    [110, 44], [110, 74], [110, 130],
    [74, 56], [60, 34], [146, 56], [160, 34],
    [96, 164], [84, 196], [124, 164], [136, 196],
  ],
};

export function createStickmanStrokePoints(
  poseKey: string,
  centerX: number,
  centerY: number,
  targetHeight = 165
): StrokeObject['points'] {
  const joints = STICKMAN_POSE_JOINTS[poseKey] || STICKMAN_POSE_JOINTS['stickman-standing'];
  const scale = targetHeight / 170;
  return joints.map(([jx, jy]) => ({
    x: Math.round((centerX + (jx - 110) * scale) * 10) / 10,
    y: Math.round((centerY + (jy - 115) * scale) * 10) / 10,
    pressure: 0.5,
  }));
}

export function drawStickmanStroke(ctx: CanvasRenderingContext2D, s: StrokeObject): boolean {
  if (s.shapeType !== 'stickman' || !s.points || s.points.length < 11) return false;
  const [head, neck, hip, lElbow, lHand, rElbow, rHand, lKnee, lFoot, rKnee, rFoot] = s.points;
  const torsoLen = Math.hypot(hip.x - neck.x, hip.y - neck.y);
  const headNeckLen = Math.hypot(head.x - neck.x, head.y - neck.y);
  const headR = Math.max(7, Math.min(torsoLen * 0.36, headNeckLen * 0.68 || 16));
  const lw = Math.max(2.5, s.width || 6);

  ctx.save();
  ctx.globalAlpha = s.opacity ?? 1;
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Head (solid filled circle, just like classic stickman)
  ctx.beginPath();
  ctx.arc(head.x, head.y, headR, 0, Math.PI * 2);
  ctx.fill();

  // Skeleton limbs (neck->head, torso, left arm, right arm, left leg, right leg)
  ctx.beginPath();
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(neck.x, neck.y);
  ctx.lineTo(hip.x, hip.y);

  ctx.moveTo(neck.x, neck.y);
  ctx.lineTo(lElbow.x, lElbow.y);
  ctx.lineTo(lHand.x, lHand.y);

  ctx.moveTo(neck.x, neck.y);
  ctx.lineTo(rElbow.x, rElbow.y);
  ctx.lineTo(rHand.x, rHand.y);

  ctx.moveTo(hip.x, hip.y);
  ctx.lineTo(lKnee.x, lKnee.y);
  ctx.lineTo(lFoot.x, lFoot.y);

  ctx.moveTo(hip.x, hip.y);
  ctx.lineTo(rKnee.x, rKnee.y);
  ctx.lineTo(rFoot.x, rFoot.y);

  ctx.stroke();
  ctx.restore();
  return true;
}

export function buildStickFigureSvgMarkup(
  shapeKind: string,
  color: string,
  strokeWidth = 10
): string | null {
  if (!shapeKind.startsWith('stickman-')) return null;
  const sw = Math.max(5, Math.min(20, Math.round(strokeWidth)));
  const c = color || '#16a34a';
  const common = `fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  let body = '';

  switch (shapeKind) {
    case 'stickman-pull-left':
      body = `
        <circle cx="118" cy="46" r="18" fill="${c}"/>
        <path ${common} d="M116,64 L112,134 M114,82 L48,114 M112,134 L56,200 M112,134 L134,158 L104,200"/>
      `;
      break;
    case 'stickman-standing':
      body = `
        <circle cx="110" cy="46" r="18" fill="${c}"/>
        <path ${common} d="M110,64 L110,132 M110,82 L76,118 M110,82 L144,118 M110,132 L86,196 M110,132 L134,196"/>
      `;
      break;
    case 'stickman-walking':
      body = `
        <circle cx="114" cy="44" r="18" fill="${c}"/>
        <path ${common} d="M112,62 L106,128 M110,80 L144,108 M110,80 L76,112 M106,128 L138,162 L146,196 M106,128 L82,162 L66,196"/>
      `;
      break;
    case 'stickman-running':
      body = `
        <circle cx="134" cy="44" r="18" fill="${c}"/>
        <path ${common} d="M126,62 L102,122 M118,80 L156,94 L168,78 M118,80 L80,96 L64,116 M102,122 L142,144 L158,188 M102,122 L70,152 L44,142"/>
      `;
      break;
    case 'stickman-pushing':
      body = `
        <circle cx="138" cy="52" r="18" fill="${c}"/>
        <path ${common} d="M126,68 L94,132 M116,86 L168,90 M112,96 L168,104 M94,132 L132,162 L136,196 M94,132 L64,164 L44,196"/>
      `;
      break;
    case 'stickman-pulling':
      body = `
        <circle cx="80" cy="52" r="18" fill="${c}"/>
        <path ${common} d="M90,68 L116,132 M98,86 L156,102 M102,98 L156,108 M116,132 L144,164 L164,196 M116,132 L88,164 L78,196"/>
      `;
      break;
    case 'stickman-lifting':
      body = `
        <circle cx="110" cy="64" r="17" fill="${c}"/>
        <path ${common} d="M110,81 L110,136 M110,96 L74,76 L74,40 M110,96 L146,76 L146,40 M110,136 L82,164 L82,196 M110,136 L138,164 L138,196"/>
      `;
      break;
    case 'stickman-carrying':
      body = `
        <circle cx="110" cy="46" r="17" fill="${c}"/>
        <path ${common} d="M108,63 L102,130 M106,82 L138,106 L160,96 M106,90 L132,116 L154,108 M102,130 L132,164 L138,196 M102,130 L78,164 L68,196"/>
      `;
      break;
    case 'stickman-sitting':
      body = `
        <circle cx="92" cy="54" r="18" fill="${c}"/>
        <path ${common} d="M92,72 L92,136 M92,92 L126,118 M92,136 L146,136 L152,194"/>
      `;
      break;
    case 'stickman-hanging':
      body = `
        <circle cx="110" cy="76" r="17" fill="${c}"/>
        <path ${common} d="M110,93 L110,152 M110,104 L82,66 L82,30 M110,104 L138,66 L138,30 M110,152 L96,196 M110,152 L126,192"/>
      `;
      break;
    case 'stickman-jumping':
      body = `
        <circle cx="110" cy="38" r="17" fill="${c}"/>
        <path ${common} d="M110,55 L110,116 M110,72 L72,46 M110,72 L148,46 M110,116 L80,148 L92,178 M110,116 L140,144 L152,172"/>
      `;
      break;
    case 'stickman-falling':
      body = `
        <circle cx="122" cy="60" r="17" fill="${c}"/>
        <path ${common} d="M114,76 L94,132 M106,92 L66,68 M108,92 L152,78 M94,132 L64,162 L52,188 M94,132 L124,158 L146,178"/>
      `;
      break;
    case 'stickman-throwing':
      body = `
        <circle cx="106" cy="46" r="17" fill="${c}"/>
        <path ${common} d="M104,63 L100,130 M102,82 L144,64 L162,48 M102,82 L68,104 M100,130 L134,162 L144,196 M100,130 L74,164 L60,196"/>
        <circle cx="174" cy="40" r="8" fill="${c}"/>
      `;
      break;
    case 'stickman-kicking':
      body = `
        <circle cx="96" cy="46" r="17" fill="${c}"/>
        <path ${common} d="M98,63 L104,130 M100,82 L68,108 M100,82 L134,104 M104,130 L84,196 M104,130 L146,154 L166,138"/>
        <circle cx="182" cy="128" r="9" fill="${c}"/>
      `;
      break;
    case 'stickman-climbing':
      body = `
        <circle cx="114" cy="44" r="17" fill="${c}"/>
        <path ${common} d="M112,61 L104,126 M110,78 L142,48 M110,82 L76,98 M104,126 L138,140 L134,178 M104,126 L78,162 L84,198"/>
      `;
      break;
    case 'stickman-waving':
      body = `
        <circle cx="110" cy="46" r="18" fill="${c}"/>
        <path ${common} d="M110,64 L110,132 M110,82 L148,54 L164,38 M110,82 L76,118 M110,132 L86,196 M110,132 L134,196"/>
      `;
      break;
    case 'stickman-thinking':
      body = `
        <circle cx="106" cy="48" r="18" fill="${c}"/>
        <path ${common} d="M106,66 L106,134 M106,86 L138,94 L126,64 M106,86 L74,114 L92,130 M106,134 L86,196 M106,134 L126,196"/>
      `;
      break;
    case 'stickman-balancing':
      body = `
        <circle cx="110" cy="44" r="17" fill="${c}"/>
        <path ${common} d="M110,61 L110,126 M110,80 L44,72 M110,80 L176,88 M110,126 L110,196 M110,126 L146,144 L156,168"/>
      `;
      break;
    case 'stickman-sliding':
      body = `
        <circle cx="128" cy="54" r="17" fill="${c}"/>
        <path ${common} d="M120,70 L98,124 M112,86 L152,102 M112,86 L74,98 M98,124 L132,148 L120,182 M98,124 L76,154 L94,186"/>
        <line x1="48" y1="186" x2="176" y2="198" stroke="${c}" stroke-width="${Math.max(4, Math.round(sw * 0.65))}" stroke-linecap="round"/>
      `;
      break;
    case 'stickman-cycling':
      body = `
        <circle cx="122" cy="48" r="15" fill="${c}"/>
        <path ${common} d="M116,62 L94,114 M110,78 L148,96 M94,114 L122,136 L112,162 M94,114 L82,148"/>
        <circle cx="66" cy="166" r="24" fill="none" stroke="${c}" stroke-width="${Math.max(4, Math.round(sw * 0.65))}"/>
        <circle cx="158" cy="166" r="24" fill="none" stroke="${c}" stroke-width="${Math.max(4, Math.round(sw * 0.65))}"/>
        <path fill="none" stroke="${c}" stroke-width="${Math.max(4, Math.round(sw * 0.6))}" stroke-linecap="round" stroke-linejoin="round" d="M66,166 L108,166 L146,104 L158,166 M108,166 L94,114"/>
      `;
      break;
    case 'stickman-celebrating':
      body = `
        <circle cx="110" cy="46" r="18" fill="${c}"/>
        <path ${common} d="M110,64 L110,130 M110,84 L74,56 L62,36 M110,84 L146,56 L158,36 M110,130 L84,196 M110,130 L136,196"/>
      `;
      break;
    default:
      return null;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">${body}</svg>`;
}

const STICK_COMMON_TAGS = ['stickman', 'stick figure', 'ανθρωπάκι', 'ανθρωπάκια', 'φιγούρα', 'vector'];

export const STICK_FIGURES_STICKERS: StickerCatalogItem[] = [
  {
    id: 'sk-stickman-pull-left',
    title: 'Stickman — Βήμα / Τράβηγμα Αριστερά (Προφίλ)',
    iconifyId: 'custom-svg:stickman-pull-left:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'προφίλ', 'αριστερά', 'βήμα', 'τραβάω', 'σπρώχνω', 'κίνηση', 'δύναμη'],
  },
  {
    id: 'sk-stickman-standing',
    title: 'Stickman — Όρθιο Ανθρωπάκι',
    iconifyId: 'custom-svg:stickman-standing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'όρθιος', 'στάση', 'ηρεμία', 'άνθρωπος'],
  },
  {
    id: 'sk-stickman-walking',
    title: 'Stickman — Περπατάει',
    iconifyId: 'custom-svg:stickman-walking:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'περπατάω', 'περπάτημα', 'βάδισμα', 'κίνηση'],
  },
  {
    id: 'sk-stickman-running',
    title: 'Stickman — Τρέχει',
    iconifyId: 'custom-svg:stickman-running:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'τρέχω', 'τρέξιμο', 'ταχύτητα', 'sprint', 'κίνηση'],
  },
  {
    id: 'sk-stickman-pushing',
    title: 'Stickman — Σπρώχνει (Δύναμη)',
    iconifyId: 'custom-svg:stickman-pushing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'σπρώχνω', 'ώθηση', 'δύναμη', 'κιβώτιο', 'τριβή'],
  },
  {
    id: 'sk-stickman-pulling',
    title: 'Stickman — Τραβάει (Έλξη / Σχοινί)',
    iconifyId: 'custom-svg:stickman-pulling:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'τραβάω', 'έλξη', 'σχοινί', 'τάση', 'δύναμη'],
  },
  {
    id: 'sk-stickman-lifting',
    title: 'Stickman — Σηκώνει Βάρος',
    iconifyId: 'custom-svg:stickman-lifting:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'σηκώνω', 'ανύψωση', 'βάρος', 'έργο', 'δύναμη'],
  },
  {
    id: 'sk-stickman-carrying',
    title: 'Stickman — Κουβαλάει Φορτίο',
    iconifyId: 'custom-svg:stickman-carrying:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'κουβαλάω', 'μεταφέρω', 'φορτίο', 'έργο'],
  },
  {
    id: 'sk-stickman-sitting',
    title: 'Stickman — Κάθεται',
    iconifyId: 'custom-svg:stickman-sitting:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'κάθομαι', 'καθιστός', 'καρέκλα', 'ισορροπία'],
  },
  {
    id: 'sk-stickman-hanging',
    title: 'Stickman — Κρέμεται',
    iconifyId: 'custom-svg:stickman-hanging:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'κρέμομαι', 'μονόζυγο', 'τάση', 'βάρος', 'ισορροπία'],
  },
  {
    id: 'sk-stickman-jumping',
    title: 'Stickman — Πηδάει (Άλμα)',
    iconifyId: 'custom-svg:stickman-jumping:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'πηδάω', 'άλμα', 'βαρύτητα', 'ενέργεια'],
  },
  {
    id: 'sk-stickman-falling',
    title: 'Stickman — Πέφτει (Πτώση)',
    iconifyId: 'custom-svg:stickman-falling:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'πέφτω', 'πτώση', 'ελεύθερη πτώση', 'βαρύτητα'],
  },
  {
    id: 'sk-stickman-throwing',
    title: 'Stickman — Πετάει Μπάλα (Βολή)',
    iconifyId: 'custom-svg:stickman-throwing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'πετάω', 'βολή', 'μπάλα', 'οριζόντια βολή', 'πλάγια βολή'],
  },
  {
    id: 'sk-stickman-kicking',
    title: 'Stickman — Κλωτσάει Μπάλα',
    iconifyId: 'custom-svg:stickman-kicking:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'κλωτσάω', 'μπάλα', 'κρούση', 'ώθηση', 'ποδόσφαιρο'],
  },
  {
    id: 'sk-stickman-climbing',
    title: 'Stickman — Σκαρφαλώνει',
    iconifyId: 'custom-svg:stickman-climbing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'σκαρφαλώνω', 'ανάβαση', 'σκάλα', 'δυναμική ενέργεια'],
  },
  {
    id: 'sk-stickman-waving',
    title: 'Stickman — Χαιρετάει / Δείχνει',
    iconifyId: 'custom-svg:stickman-waving:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'χαιρετάω', 'δείχνω', 'χέρι', 'παρουσίαση'],
  },
  {
    id: 'sk-stickman-thinking',
    title: 'Stickman — Σκέφτεται (Απορία)',
    iconifyId: 'custom-svg:stickman-thinking:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'σκέφτομαι', 'απορία', 'ερώτηση', 'ιδέα'],
  },
  {
    id: 'sk-stickman-balancing',
    title: 'Stickman — Ισορροπεί',
    iconifyId: 'custom-svg:stickman-balancing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'ισορροπώ', 'ισορροπία', 'κέντρο μάζας', 'ροπή'],
  },
  {
    id: 'sk-stickman-sliding',
    title: 'Stickman — Γλιστράει / Σκι',
    iconifyId: 'custom-svg:stickman-sliding:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'γλιστράω', 'ολίσθηση', 'σκι', 'τριβή', 'κεκλιμένο'],
  },
  {
    id: 'sk-stickman-cycling',
    title: 'Stickman — Ποδήλατο',
    iconifyId: 'custom-svg:stickman-cycling:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'ποδήλατο', 'ποδηλάτης', 'κίνηση', 'ταχύτητα', 'κύλιση'],
  },
  {
    id: 'sk-stickman-celebrating',
    title: 'Stickman — Πανηγυρίζει (Χέρια Ψηλά)',
    iconifyId: 'custom-svg:stickman-celebrating:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'πανηγυρίζω', 'επιτυχία', 'νίκη', 'χαρά'],
  },
];
