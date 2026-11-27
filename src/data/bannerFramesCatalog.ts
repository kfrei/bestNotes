import type { BezierPoint, StrokeObject } from '../types/note';
import type { StickerCatalogItem } from './stickersCatalog';

export interface BannerFrameDef {
  id: string;
  key: string; // suffix after 'custom-svg:banner-'
  title: string;
  tags: string[];
  aspectW: number; // default world width when inserted on canvas
  aspectH: number; // default world height when inserted on canvas
}

export const BANNER_FRAME_DEFS: BannerFrameDef[] = [
  {
    id: 'banner-flag-shadow',
    key: 'flag-shadow',
    title: 'Πλαίσιο Σημαία με Σκιά',
    tags: ['πλαίσιο', 'σημαία', 'κορδέλα', 'τίτλος', 'banner', 'ribbon', 'flag', 'σκιά', 'κουτί', 'επικεφαλίδα'],
    aspectW: 340,
    aspectH: 78,
  },
  {
    id: 'banner-ribbon-3d',
    key: 'ribbon-3d',
    title: 'Κορδέλα Τίτλου 3D με Ραφή',
    tags: ['κορδέλα', 'πλαίσιο', 'τίτλος', 'banner', 'ribbon', '3d', 'ραφή', 'επικεφαλίδα', 'σκιά'],
    aspectW: 360,
    aspectH: 96,
  },
  {
    id: 'banner-ribbon-classic',
    key: 'ribbon-classic',
    title: 'Κλασική Κορδέλα Τίτλου',
    tags: ['κορδέλα', 'πλαίσιο', 'τίτλος', 'banner', 'ribbon', 'κλασική', 'επικεφαλίδα', 'σημειώσεις'],
    aspectW: 340,
    aspectH: 94,
  },
  {
    id: 'banner-ribbon-wave',
    key: 'ribbon-wave',
    title: 'Κυματιστή Κορδέλα Τίτλου',
    tags: ['κορδέλα', 'κυματιστή', 'καμπύλη', 'banner', 'ribbon', 'wave', 'τίτλος', 'επικεφαλίδα'],
    aspectW: 370,
    aspectH: 92,
  },
  {
    id: 'banner-ribbon-arch',
    key: 'ribbon-arch',
    title: 'Καμπύλη Κορδέλα (Arch)',
    tags: ['κορδέλα', 'καμπύλη', 'τόξο', 'banner', 'ribbon', 'arch', 'τίτλος', 'επικεφαλίδα'],
    aspectW: 330,
    aspectH: 112,
  },
  {
    id: 'banner-taped-note',
    key: 'taped-note',
    title: 'Πλαίσιο με Αυτοκόλλητες Ταινίες',
    tags: ['πλαίσιο', 'σημείωση', 'ταινία', 'tape', 'sticky', 'note', 'frame', 'χαρτάκι', 'κάδρο'],
    aspectW: 240,
    aspectH: 290,
  },
  {
    id: 'banner-scroll-parchment',
    key: 'scroll-parchment',
    title: 'Πάπυρος / Περγαμηνή',
    tags: ['πάπυρος', 'περγαμηνή', 'scroll', 'parchment', 'πλαίσιο', 'ιστορία', 'αρχαία', 'σημείωση'],
    aspectW: 230,
    aspectH: 300,
  },
  {
    id: 'banner-wood-sign',
    key: 'wood-sign',
    title: 'Ξύλινη Ταμπέλα',
    tags: ['ταμπέλα', 'ξύλινη', 'πινακίδα', 'sign', 'wood', 'board', 'πλαίσιο', 'τίτλος'],
    aspectW: 290,
    aspectH: 230,
  },
];

export const BANNER_FRAMES_STICKERS: StickerCatalogItem[] = BANNER_FRAME_DEFS.map((b) => ({
  id: b.id,
  iconifyId: `custom-svg:banner-${b.key}:#1e293b:6`,
  title: b.title,
  category: 'Πλαίσια & Κορδέλες',
  colorStyle: 'monochrome',
  tags: b.tags,
}));

// Helper: convert normalized [0..100, 0..100] coordinates into world BezierPoints
function toWorldPts(
  normPts: Array<[number, number]>,
  x0: number,
  y0: number,
  w: number,
  h: number
): BezierPoint[] {
  return normPts.map(([nx, ny]) => ({
    x: x0 + (nx / 100) * w,
    y: y0 + (ny / 100) * h,
  }));
}

// Helper: sample a quadratic bezier curve into polyline points
function sampleQuad(
  p0: [number, number],
  cp: [number, number],
  p1: [number, number],
  steps = 10
): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    out.push([
      mt * mt * p0[0] + 2 * mt * t * cp[0] + t * t * p1[0],
      mt * mt * p0[1] + 2 * mt * t * cp[1] + t * t * p1[1],
    ]);
  }
  return out;
}

// Helper: sample a cubic bezier curve into polyline points
function sampleCubic(
  p0: [number, number],
  c1: [number, number],
  c2: [number, number],
  p1: [number, number],
  steps = 12
): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    out.push([
      mt * mt * mt * p0[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t * t * t * p1[0],
      mt * mt * mt * p0[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t * t * t * p1[1],
    ]);
  }
  return out;
}

interface RawVectorPart {
  role: 'body' | 'accent-solid' | 'detail' | 'detail-dashed';
  pts: Array<[number, number]>;
  widthScale?: number;
}

function getBannerNormalizedParts(key: string): RawVectorPart[] {
  switch (key) {
    // 1. Horizontal Flag / Pennant Banner with bold lower shadow
    case 'flag-shadow':
      return [
        // Solid lower + notch drop shadow
        {
          role: 'accent-solid',
          pts: [
            [4, 79],
            [95, 79],
            [83, 49],
            [95, 22],
            [97, 26],
            [86, 51],
            [97, 87],
            [4, 87],
            [4, 79],
          ],
          widthScale: 0.7,
        },
        // Main fillable flag body
        {
          role: 'body',
          pts: [
            [4, 16],
            [95, 16],
            [81, 47],
            [95, 79],
            [4, 79],
            [4, 16],
          ],
        },
      ];

    // 2. Classic 3D Ribbon Banner with notched ends & bold folded shadows (clean center, no dashed lines)
    case 'ribbon-3d':
      return [
        // Left tail shadow
        {
          role: 'accent-solid',
          pts: [
            [5, 81],
            [27, 81],
            [27, 88],
            [5, 88],
            [15, 57],
            [5, 34],
            [8, 34],
            [18, 57],
            [5, 81],
          ],
          widthScale: 0.6,
        },
        // Right tail shadow
        {
          role: 'accent-solid',
          pts: [
            [73, 81],
            [95, 81],
            [85, 57],
            [95, 34],
            [92, 34],
            [82, 57],
            [95, 88],
            [73, 88],
            [73, 81],
          ],
          widthScale: 0.6,
        },
        // Left tail body (flush with center box left edge x=19 — zero inner line)
        {
          role: 'body',
          pts: [
            [5, 32],
            [19, 32],
            [19, 65],
            [27, 81],
            [5, 81],
            [15, 56],
            [5, 32],
          ],
        },
        // Right tail body (flush with center box right edge x=81 — zero inner line)
        {
          role: 'body',
          pts: [
            [81, 32],
            [95, 32],
            [85, 56],
            [95, 81],
            [73, 81],
            [81, 65],
            [81, 32],
          ],
        },
        // Dark folded under-ribbon shadow bar
        {
          role: 'accent-solid',
          pts: [
            [19, 65],
            [81, 65],
            [73, 81],
            [73, 73],
            [27, 73],
            [27, 81],
            [19, 65],
          ],
          widthScale: 0.6,
        },
        // Main center ribbon box (fillable, completely clean interior)
        {
          role: 'body',
          pts: [
            [19, 11],
            [81, 11],
            [81, 65],
            [19, 65],
            [19, 11],
          ],
        },
      ];

    // 3. Clean Notebook Classic Folded Ribbon Banner
    case 'ribbon-classic':
      return [
        // Left tail (flush with center box left edge x=21)
        {
          role: 'body',
          pts: [
            [5, 34],
            [21, 34],
            [21, 63],
            [29, 84],
            [5, 84],
            [14, 59],
            [5, 34],
          ],
        },
        // Right tail (flush with center box right edge x=79)
        {
          role: 'body',
          pts: [
            [79, 34],
            [95, 34],
            [86, 59],
            [95, 84],
            [71, 84],
            [79, 63],
            [79, 34],
          ],
        },
        // Left fold triangle
        {
          role: 'accent-solid',
          pts: [
            [21, 63],
            [29, 63],
            [29, 84],
            [21, 63],
          ],
          widthScale: 0.7,
        },
        // Right fold triangle
        {
          role: 'accent-solid',
          pts: [
            [79, 63],
            [71, 63],
            [71, 84],
            [79, 63],
          ],
          widthScale: 0.7,
        },
        // Main center banner box
        {
          role: 'body',
          pts: [
            [21, 14],
            [79, 14],
            [79, 63],
            [21, 63],
            [21, 14],
          ],
        },
      ];

    // 4. Wavy Flowing Ribbon Banner (tails flush along outer center edges — zero inner lines)
    case 'ribbon-wave': {
      const centerTop = sampleQuad([18, 22], [50, 8], [82, 22], 14);
      const centerRight = sampleQuad([82, 22], [79, 44], [83, 66], 8);
      const centerBot = sampleQuad([83, 66], [50, 52], [17, 66], 14);
      const centerLeft = sampleQuad([17, 66], [21, 44], [18, 22], 8);
      // Exact shared edge segments where tails meet the center ribbon (indices 0..5 of centerLeft/Right)
      const leftSharedEdgeUp: Array<[number, number]> = [[17, 66], ...centerLeft.slice(0, 6)];
      const leftAttach = leftSharedEdgeUp[leftSharedEdgeUp.length - 1];
      const rightSharedEdgeDown: Array<[number, number]> = centerRight.slice(2);
      const rightAttach = rightSharedEdgeDown[0];
      const rightSharedEdgeUp: Array<[number, number]> = [...rightSharedEdgeDown].reverse();

      const leftTailTop = sampleQuad(leftAttach, [12, 42], [5, 36], 8);
      const leftTailNotch1 = sampleQuad([5, 36], [11, 47], [14, 58], 6);
      const leftTailNotch2 = sampleQuad([14, 58], [8, 68], [5, 84], 6);
      const leftTailBot = sampleQuad([5, 84], [16, 78], [24, 70], 8);
      const rightTailTop = sampleQuad(rightAttach, [88, 42], [95, 36], 8);
      const rightTailNotch1 = sampleQuad([95, 36], [89, 47], [86, 58], 6);
      const rightTailNotch2 = sampleQuad([86, 58], [92, 68], [95, 84], 6);
      const rightTailBot = sampleQuad([95, 84], [84, 78], [76, 70], 8);
      return [
        // Left wavy tail (closes along shared outer edge — zero inner line)
        {
          role: 'body',
          pts: [leftAttach, ...leftTailTop, ...leftTailNotch1, ...leftTailNotch2, ...leftTailBot, ...leftSharedEdgeUp],
        },
        // Right wavy tail (closes along shared outer edge — zero inner line)
        {
          role: 'body',
          pts: [rightAttach, ...rightTailTop, ...rightTailNotch1, ...rightTailNotch2, ...rightTailBot, ...rightSharedEdgeUp],
        },
        // Left & right fold triangles (hugging exact centerBot curve points — zero protrusion)
        {
          role: 'accent-solid',
          pts: [
            ...centerBot.slice(11),
            [24, 70],
            centerBot[11],
          ],
          widthScale: 0.65,
        },
        {
          role: 'accent-solid',
          pts: [
            [83, 66],
            ...centerBot.slice(0, 3),
            [76, 70],
            [83, 66],
          ],
          widthScale: 0.65,
        },
        // Main arched ribbon body
        {
          role: 'body',
          pts: [[18, 22], ...centerTop, ...centerRight, ...centerBot, ...centerLeft],
        },
      ];
    }

    // 5. Bold Curved Arch Scroll Banner (wings flush along center edges — zero inner lines)
    case 'ribbon-arch': {
      const topArch = sampleCubic([26, 16], [42, 26], [58, 26], [74, 16], 14);
      const botArch = sampleCubic([78, 66], [58, 82], [42, 82], [22, 66], 14);
      const leftTailBot = sampleQuad([14, 82], [22, 88], [28, 84], 6);
      const rightTailBot = sampleQuad([86, 82], [78, 88], [72, 84], 6);
      return [
        // Left wing (closes along exact center left edge [22,66] -> [23.9,42])
        {
          role: 'body',
          pts: [
            [23.9, 42],
            [18, 42],
            [14, 82],
            ...leftTailBot,
            [22, 66],
            [23.9, 42],
          ],
        },
        // Right wing (closes along exact center right edge [78,66] -> [76.1,42])
        {
          role: 'body',
          pts: [
            [76.1, 42],
            [82, 42],
            [86, 82],
            ...rightTailBot,
            [78, 66],
            [76.1, 42],
          ],
        },
        // Left deep shadow fold (hugs exact botArch curve — zero upward protrusion)
        {
          role: 'accent-solid',
          pts: [
            ...botArch.slice(11),
            [28, 84],
            botArch[11],
          ],
          widthScale: 0.65,
        },
        // Right deep shadow fold (hugs exact botArch curve — zero upward protrusion)
        {
          role: 'accent-solid',
          pts: [
            [78, 66],
            ...botArch.slice(0, 3),
            [72, 84],
            [78, 66],
          ],
          widthScale: 0.65,
        },
        // Main curved center body
        {
          role: 'body',
          pts: [
            [26, 16],
            ...topArch,
            [78, 66],
            ...botArch,
            [26, 16],
          ],
        },
      ];
    }

    // 6. Taped Note / Sticky Paper Frame with 4 Jagged Washi Tape Corners (corners hidden behind tape)
    case 'taped-note':
      return [
        // Chamfered organic paper frame — all 4 corners sit flush along the inner edge of each tape strip
        {
          role: 'body',
          pts: [
            [26, 16],
            [50, 15.2],
            [74, 16],
            [82, 24],
            [83, 50],
            [82, 76],
            [74, 84],
            [50, 84.8],
            [26, 84],
            [18, 76],
            [17, 50],
            [18, 24],
            [26, 16],
          ],
        },
        // Top-left jagged tape strip (inner edge flush on [18,24]..[26,16])
        {
          role: 'body',
          pts: [
            [15, 27],
            [29, 13],
            [26, 11.5],
            [26.5, 8.5],
            [23.5, 10],
            [22, 7],
            [9, 20],
            [11.5, 21.5],
            [10.5, 24.5],
            [13.5, 23.5],
            [15, 27],
          ],
          widthScale: 0.78,
        },
        // Top-right jagged tape strip (inner edge flush on [74,16]..[82,24])
        {
          role: 'body',
          pts: [
            [71, 13],
            [85, 27],
            [86.5, 23.5],
            [89.5, 24.5],
            [88.5, 21.5],
            [91, 20],
            [78, 7],
            [76.5, 10],
            [73.5, 8.5],
            [74, 11.5],
            [71, 13],
          ],
          widthScale: 0.78,
        },
        // Bottom-left jagged tape strip (inner edge flush on [18,76]..[26,84])
        {
          role: 'body',
          pts: [
            [15, 73],
            [29, 87],
            [26, 88.5],
            [26.5, 91.5],
            [23.5, 90],
            [22, 93],
            [9, 80],
            [11.5, 78.5],
            [10.5, 75.5],
            [13.5, 76.5],
            [15, 73],
          ],
          widthScale: 0.78,
        },
        // Bottom-right jagged tape strip (inner edge flush on [74,84]..[82,76])
        {
          role: 'body',
          pts: [
            [71, 87],
            [85, 73],
            [86.5, 76.5],
            [89.5, 75.5],
            [88.5, 78.5],
            [91, 80],
            [78, 93],
            [76.5, 90],
            [73.5, 91.5],
            [74, 88.5],
            [71, 87],
          ],
          widthScale: 0.78,
        },
      ];

    // 7. Vintage Parchment Scroll with Curled Top/Bottom Rollers & Aged Notches
    case 'scroll-parchment': {
      const topCurve = sampleQuad([15, 11], [50, 15], [85, 11], 10);
      const botCurve = sampleQuad([83, 86], [50, 91], [17, 86], 10);
      return [
        // Main fillable parchment sheet with aged side notches
        {
          role: 'body',
          pts: [
            [15, 11],
            ...topCurve,
            [84, 24],
            [78, 27],
            [84, 30],
            [85, 48],
            [79, 51],
            [85, 55],
            [84, 72],
            [80, 74],
            [84, 77],
            [83, 86],
            ...botCurve,
            [16, 76],
            [21, 73],
            [16, 70],
            [15, 53],
            [23, 49],
            [15, 46],
            [16, 26],
            [21, 23],
            [16, 20],
            [15, 11],
          ],
        },
        // Top-left curl
        {
          role: 'detail',
          pts: [
            [15, 11],
            ...sampleQuad([15, 11], [6, 12], [7, 19], 6),
            ...sampleQuad([7, 19], [9, 24], [16, 20], 6),
          ],
          widthScale: 0.9,
        },
        // Top-right curl
        {
          role: 'detail',
          pts: [
            [85, 11],
            ...sampleQuad([85, 11], [94, 12], [93, 18], 6),
            ...sampleQuad([93, 18], [91, 22], [84, 19], 6),
          ],
          widthScale: 0.9,
        },
        // Bottom roller outline
        {
          role: 'detail',
          pts: [
            [17, 86],
            ...sampleQuad([17, 86], [11, 91], [16, 95], 6),
            ...sampleQuad([16, 95], [50, 97], [84, 95], 10),
            ...sampleQuad([84, 95], [89, 91], [83, 86], 6),
          ],
          widthScale: 0.9,
        },
        // Bottom-left & bottom-right inner roll spirals
        {
          role: 'detail',
          pts: [
            [16, 93],
            [22, 91],
            [21, 88],
            [17, 89],
          ],
          widthScale: 0.75,
        },
        {
          role: 'detail',
          pts: [
            [84, 93],
            [78, 91],
            [79, 88],
            [83, 89],
          ],
          widthScale: 0.75,
        },
      ];
    }

    // 8. Rustic Wooden Signpost Board
    case 'wood-sign':
      return [
        // Top post stub
        {
          role: 'body',
          pts: [
            [47, 7],
            [54, 7],
            [54.5, 15],
            [46.5, 15],
            [47, 7],
          ],
          widthScale: 0.85,
        },
        // Bottom wooden post
        {
          role: 'body',
          pts: [
            [46.5, 73],
            [54.5, 73],
            [54, 95],
            [46.5, 95],
            [46.5, 73],
          ],
          widthScale: 0.85,
        },
        // Under-board post shadow
        {
          role: 'accent-solid',
          pts: [
            [46.5, 73],
            [54.5, 73],
            [54.5, 79],
            [46.5, 77],
            [46.5, 73],
          ],
          widthScale: 0.6,
        },
        // Main rustic wooden board with rough edges (fillable)
        {
          role: 'body',
          pts: [
            [10, 16],
            [50, 14.5],
            [91, 16.5],
            [89, 22],
            [92, 26],
            [88, 31],
            [91, 38],
            [87, 43],
            [91, 50],
            [88, 56],
            [92, 62],
            [89, 67],
            [91, 72],
            [50, 74],
            [10, 72.5],
            [12, 66],
            [9, 60],
            [13, 55],
            [9, 50],
            [18, 48],
            [9, 46],
            [12, 39],
            [8, 33],
            [12, 27],
            [9, 21],
            [10, 16],
          ],
        },
        // Subtle nail dots & wood grain lines
        {
          role: 'detail',
          pts: [
            [12, 23],
            [18, 23],
          ],
          widthScale: 0.65,
        },
        {
          role: 'detail',
          pts: [
            [83, 25],
            [90, 25],
          ],
          widthScale: 0.65,
        },
        {
          role: 'detail',
          pts: [
            [82, 62],
            [90, 62],
          ],
          widthScale: 0.65,
        },
        {
          role: 'detail',
          pts: [
            [49.5, 19],
            [50.5, 19],
          ],
          widthScale: 1.2,
        },
        {
          role: 'detail',
          pts: [
            [49.5, 69],
            [50.5, 69],
          ],
          widthScale: 1.2,
        },
      ];

    default:
      return [];
  }
}

/**
 * Generates crisp monochrome SVG markup for preview inside the «Εικονίδια» Library grid.
 */
export function buildBannerFrameSvgMarkup(key: string, color: string): string {
  const parts = getBannerNormalizedParts(key);
  if (parts.length === 0) return '';
  const def = BANNER_FRAME_DEFS.find((d) => d.key === key);
  const w = def ? def.aspectW : 300;
  const h = def ? def.aspectH : 120;
  const maxDim = Math.max(w, h);
  const scale = 200 / maxDim;
  const vw = Math.round(w * scale);
  const vh = Math.round(h * scale);
  const padX = Math.round((220 - vw) / 2);
  const padY = Math.round((220 - vh) / 2);

  const elements = parts
    .map((part) => {
      const d = part.pts
        .map(([nx, ny], idx) => {
          const px = (padX + (nx / 100) * vw).toFixed(1);
          const py = (padY + (ny / 100) * vh).toFixed(1);
          return `${idx === 0 ? 'M' : 'L'}${px},${py}`;
        })
        .join(' ');
      const sw = (3.4 * (part.widthScale ?? 1)).toFixed(1);
      if (part.role === 'accent-solid') {
        return `<path d="${d} Z" fill="${color}" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      if (part.role === 'body') {
        return `<path d="${d} Z" fill="#ffffff" fill-opacity="0.88" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      if (part.role === 'detail-dashed') {
        return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-dasharray="5 5" stroke-linecap="round"/>`;
      }
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">${elements}</svg>`;
}

/**
 * Creates native vector StrokeObject[] grouped together so the user can:
 * - write inside them (Apple Pencil or Text Box)
 * - fill them with solid/transparent color AND vertical gradient (Διαβάθμιση 0–100%)
 * - resize, rotate, recolor, and Undo in 1 click
 */
export function createBannerFrameStrokes(
  key: string,
  cx: number,
  cy: number,
  color: string,
  strokeWidth: number,
  layerId: string,
  baseZOrder: number,
  fillStyle: 'none' | 'solid' | 'hatching' | 'gradient' = 'none',
  fillTransparency = 90,
  fillGradient = 0
): StrokeObject[] {
  const def = BANNER_FRAME_DEFS.find((d) => d.key === key);
  const parts = getBannerNormalizedParts(key);
  if (!def || parts.length === 0) return [];

  const x0 = cx - def.aspectW / 2;
  const y0 = cy - def.aspectH / 2;
  const groupId = `grp-banner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const baseW = Math.max(1.8, Math.min(4.2, strokeWidth || 2.4));

  return parts.map((part, idx) => {
    const pts = toWorldPts(part.pts, x0, y0, def.aspectW, def.aspectH);
    const id = `stk-banner-${key}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`;
    const zOrder = baseZOrder + idx;
    const width = Number((baseW * (part.widthScale ?? 1)).toFixed(2));

    if (part.role === 'accent-solid') {
      return {
        id,
        tool: 'pen',
        color,
        fillColor: color,
        fillStyle: 'solid',
        fillTransparency: 0,
        fillGradient: 0,
        width,
        opacity: 1,
        points: pts,
        layerId,
        groupId,
        isShape: true,
        shapeType: 'banner-accent-solid',
        zOrder,
      };
    }
    if (part.role === 'body') {
      return {
        id,
        tool: 'pen',
        color,
        fillColor: color,
        fillStyle,
        fillTransparency,
        fillGradient,
        width,
        opacity: 1,
        points: pts,
        layerId,
        groupId,
        isShape: true,
        shapeType: 'banner-body',
        zOrder,
      };
    }
    return {
      id,
      tool: 'pen',
      color,
      fillStyle: 'none',
      width,
      opacity: 1,
      lineStyle: part.role === 'detail-dashed' ? 'dashed' : 'solid',
      points: pts,
      layerId,
      groupId,
      isShape: false,
      shapeType: 'banner-detail',
      zOrder,
    };
  });
}
