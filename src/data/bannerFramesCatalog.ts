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
  {
    id: 'banner-photo-corners-frame',
    key: 'photo-corners-frame',
    title: 'Πλαίσιο Άλμπουμ με Γωνίες',
    tags: ['πλαίσιο', 'γωνίες', 'άλμπουμ', 'φωτογραφία', 'ραφή', 'frame', 'photo', 'corners', 'note', 'σημείωση'],
    aspectW: 225,
    aspectH: 275,
  },
  {
    id: 'banner-comic-burst-alert',
    key: 'comic-burst-alert',
    title: 'Κόμικ Έκρηξη με Θαυμαστικό (!)',
    tags: ['κόμικ', 'έκρηξη', 'θαυμαστικό', 'συννεφάκι', 'προσοχή', 'comic', 'burst', 'alert', 'pow', 'boom', 'sos', '!'],
    aspectW: 290,
    aspectH: 250,
  },
  {
    id: 'banner-comic-burst-stars',
    key: 'comic-burst-stars',
    title: 'Κόμικ Έκρηξη με Αστέρια',
    tags: ['κόμικ', 'έκρηξη', 'αστέρια', 'ακτίνες', 'συννεφάκι', 'comic', 'burst', 'stars', 'wow', 'boom', 'τίτλος'],
    aspectW: 330,
    aspectH: 245,
  },
  {
    id: 'banner-bookmark-layered',
    key: 'bookmark-layered',
    title: 'Σελιδοδείκτης / Κάθετη Σημαία',
    tags: ['σελιδοδείκτης', 'σημαία', 'κάθετη', 'πλαίσιο', 'bookmark', 'ribbon', 'flag', 'banner', 'σημείωση'],
    aspectW: 195,
    aspectH: 250,
  },
  {
    id: 'banner-spiral-pad-vertical',
    key: 'spiral-pad-vertical',
    title: 'Μπλοκ Σπιράλ Κάθετο 3D',
    tags: ['μπλοκ', 'σπιράλ', 'τετράδιο', 'σημειώσεις', 'notepad', 'spiral', 'pad', 'πλαίσιο', '3d'],
    aspectW: 215,
    aspectH: 265,
  },
  {
    id: 'banner-spiral-pad-horizontal',
    key: 'spiral-pad-horizontal',
    title: 'Μπλοκ Σπιράλ Οριζόντιο',
    tags: ['μπλοκ', 'σπιράλ', 'οριζόντιο', 'σημειώσεις', 'notepad', 'spiral', 'pad', 'πλαίσιο', 'κάρτα'],
    aspectW: 320,
    aspectH: 175,
  },
  {
    id: 'banner-corner-ribbon-card',
    key: 'corner-ribbon-card',
    title: 'Κάρτα με Γωνιακή Κορδέλα',
    tags: ['κάρτα', 'κορδέλα', 'γωνία', 'ταινία', 'πλαίσιο', 'card', 'ribbon', 'corner', 'σημείωση'],
    aspectW: 300,
    aspectH: 180,
  },
  {
    id: 'banner-card-with-banner',
    key: 'card-with-banner',
    title: 'Κάρτα με Κορδέλα Τίτλου',
    tags: ['κάρτα', 'κορδέλα', 'τίτλος', 'πλαίσιο', 'card', 'banner', 'ribbon', 'σημείωση'],
    aspectW: 235,
    aspectH: 265,
  },
  {
    id: 'banner-notebook-spiral-left',
    key: 'notebook-spiral-left',
    title: 'Σελίδα Τετραδίου με Σπιράλ',
    tags: ['τετράδιο', 'σελίδα', 'σπιράλ', 'σημειώσεις', 'notebook', 'spiral', 'page', 'πλαίσιο'],
    aspectW: 235,
    aspectH: 310,
  },
  {
    id: 'banner-pinned-sticky-note',
    key: 'pinned-sticky-note',
    title: 'Χαρτάκι με Πινέζα & Σκιά',
    tags: ['χαρτάκι', 'πινέζα', 'σημείωση', 'sticky', 'note', 'pin', 'pushpin', 'σκιά', 'πλαίσιο'],
    aspectW: 245,
    aspectH: 280,
  },
  {
    id: 'banner-idea-bulb-box',
    key: 'idea-bulb-box',
    title: 'Πλαίσιο Ιδέας με Λάμπα',
    tags: ['ιδέα', 'λάμπα', 'λαμπτήρας', 'πλαίσιο', 'σημείωση', 'idea', 'bulb', 'lightbulb', 'tip', 'συμβουλή'],
    aspectW: 330,
    aspectH: 210,
  },
  {
    id: 'banner-lightning-triple-vertical',
    key: 'lightning-triple-vertical',
    title: 'Κεραυνός 3D (Μαύρο Περίγραμμα)',
    tags: ['κεραυνός', 'κεραυνοί', 'αστραπή', 'ενέργεια', 'ηλεκτρισμός', 'κόμικ', 'lightning', 'bolt', 'flash', '3d', 'εφέ'],
    aspectW: 120,
    aspectH: 210,
  },
  // --- Φαρδιά Πλαίσια Τίτλου Σελίδας (Native ~6:1 αναλογία, χωρίς παραμόρφωση) ---
  {
    id: 'banner-header-spiral-wide',
    key: 'header-spiral-wide',
    title: 'Τίτλος Σελίδας: Σπιράλ (Φαρδύ)',
    tags: ['τίτλος', 'σελίδας', 'επικεφαλίδα', 'φαρδύ', 'σπιράλ', 'μπλοκ', 'header', 'wide', 'title', 'spiral', 'πλαίσιο'],
    aspectW: 620,
    aspectH: 106,
  },
  {
    id: 'banner-header-corner-ribbon-wide',
    key: 'header-corner-ribbon-wide',
    title: 'Τίτλος Σελίδας: Γωνιακή Κορδέλα (Φαρδύ)',
    tags: ['τίτλος', 'σελίδας', 'επικεφαλίδα', 'φαρδύ', 'κορδέλα', 'κάρτα', 'header', 'wide', 'title', 'ribbon', 'πλαίσιο'],
    aspectW: 620,
    aspectH: 98,
  },
  {
    id: 'banner-header-comic-wide',
    key: 'header-comic-wide',
    title: 'Τίτλος Σελίδας: Κόμικ Έκρηξη (Φαρδύ)',
    tags: ['τίτλος', 'σελίδας', 'επικεφαλίδα', 'φαρδύ', 'κόμικ', 'έκρηξη', 'αστέρια', 'header', 'wide', 'comic', 'πλαίσιο'],
    aspectW: 620,
    aspectH: 116,
  },
  {
    id: 'banner-header-ribbon-banner-wide',
    key: 'header-ribbon-banner-wide',
    title: 'Τίτλος Σελίδας: Κορδέλα Banner (Φαρδύ)',
    tags: ['τίτλος', 'σελίδας', 'επικεφαλίδα', 'φαρδύ', 'κορδέλα', 'banner', 'ribbon', 'header', 'wide', 'πλαίσιο'],
    aspectW: 620,
    aspectH: 98,
  },
  {
    id: 'banner-header-taped-banner-wide',
    key: 'header-taped-banner-wide',
    title: 'Τίτλος Σελίδας: Με Ταινίες (Φαρδύ)',
    tags: ['τίτλος', 'σελίδας', 'επικεφαλίδα', 'φαρδύ', 'ταινίες', 'tape', 'header', 'wide', 'title', 'πλαίσιο'],
    aspectW: 620,
    aspectH: 100,
  },
  // --- Μικρά Εικονίδια Προσοχής & Πινέζες (Μαύρο Περίγραμμα + Μεταβλητό Γέμισμα) ---
  {
    id: 'banner-badge-exclamation-burst',
    key: 'badge-exclamation-burst',
    title: 'Θαυμαστικό σε Έκρηξη (!)',
    tags: ['θαυμαστικό', 'προσοχή', 'έκρηξη', 'σημαντικό', 'sos', 'alert', 'burst', 'exclamation', 'badge', '!'],
    aspectW: 110,
    aspectH: 118,
  },
  {
    id: 'banner-badge-exclamation-shadow',
    key: 'badge-exclamation-shadow',
    title: 'Θαυμαστικό 3D με Σκιά (!)',
    tags: ['θαυμαστικό', 'προσοχή', 'σκιά', 'σημαντικό', 'sos', 'alert', 'exclamation', 'shadow', '3d', '!'],
    aspectW: 86,
    aspectH: 126,
  },
  {
    id: 'banner-pushpin-horizontal',
    key: 'pushpin-horizontal',
    title: 'Πινέζα Οριζόντια',
    tags: ['πινέζα', 'καρφίτσα', 'σημείωση', 'pin', 'pushpin', 'thumbtack', 'οριζόντια', 'εικονίδιο'],
    aspectW: 120,
    aspectH: 82,
  },
  {
    id: 'banner-pushpin-angled',
    key: 'pushpin-angled',
    title: 'Πινέζα Πλάγια',
    tags: ['πινέζα', 'καρφίτσα', 'σημείωση', 'pin', 'pushpin', 'thumbtack', 'πλάγια', 'εικονίδιο'],
    aspectW: 96,
    aspectH: 122,
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
  role: 'body' | 'accent-solid' | 'accent-shade' | 'shade-soft' | 'detail' | 'detail-dashed';
  pts: Array<[number, number]>;
  widthScale?: number;
  shadeTrans?: number; // 0-95 transparency for accent-shade / shade-soft (default 68)
  shadeGrad?: number;  // 0-100 vertical gradient for accent-shade / shade-soft (default 60)
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

    // 9. Photo Album Frame with 4 Triangular Corner Pockets & Inset Dashed Border
    case 'photo-corners-frame':
      return [
        // Chamfered main fillable frame (all 4 corners cleanly hidden behind the 4 corner triangles)
        {
          role: 'body',
          pts: [
            [27, 12],
            [73, 12],
            [88, 25],
            [88, 75],
            [73, 88],
            [27, 88],
            [12, 75],
            [12, 25],
            [27, 12],
          ],
        },
        // 4 crisp corner photo-pocket triangles (flush on the 4 chamfered edges)
        {
          role: 'body',
          pts: [
            [9, 9],
            [30, 9],
            [9, 28],
            [9, 9],
          ],
          widthScale: 0.9,
        },
        {
          role: 'body',
          pts: [
            [91, 9],
            [70, 9],
            [91, 28],
            [91, 9],
          ],
          widthScale: 0.9,
        },
        {
          role: 'body',
          pts: [
            [9, 91],
            [30, 91],
            [9, 72],
            [9, 91],
          ],
          widthScale: 0.9,
        },
        {
          role: 'body',
          pts: [
            [91, 91],
            [70, 91],
            [91, 72],
            [91, 91],
          ],
          widthScale: 0.9,
        },
        // Inset dashed stitching border (4 clean sides inside the corners)
        {
          role: 'detail-dashed',
          pts: [
            [26, 17],
            [74, 17],
          ],
          widthScale: 0.85,
        },
        {
          role: 'detail-dashed',
          pts: [
            [83, 25],
            [83, 75],
          ],
          widthScale: 0.85,
        },
        {
          role: 'detail-dashed',
          pts: [
            [74, 83],
            [26, 83],
          ],
          widthScale: 0.85,
        },
        {
          role: 'detail-dashed',
          pts: [
            [17, 75],
            [17, 25],
          ],
          widthScale: 0.85,
        },
      ];

    // 10. Comic Book Starburst with Bold Tilted Exclamation Mark (!)
    case 'comic-burst-alert': {
      const spikes: Array<[number, number]> = [
        [36, 18],
        [60, 23],
        [91, 18],
        [81, 46],
        [95, 64],
        [83, 79],
        [92, 92],
        [60, 96],
        [34, 94],
        [15, 84],
        [31, 66],
        [13, 57],
        [31, 44],
      ];
      const cx = 56;
      const cy = 58;
      const burstPts: Array<[number, number]> = [spikes[0]];
      for (let i = 0; i < spikes.length; i++) {
        const a = spikes[i];
        const b = spikes[(i + 1) % spikes.length];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        // Pull midpoint inward toward center for crisp comic concave arcs
        const cp: [number, number] = [mx + (cx - mx) * 0.42, my + (cy - my) * 0.42];
        burstPts.push(...sampleQuad(a, cp, b, 6));
      }
      const makeDot = (dx: number, dy: number, rx: number, ry: number): Array<[number, number]> => {
        const out: Array<[number, number]> = [];
        const steps = 14;
        for (let i = 0; i <= steps; i++) {
          const ang = (i / steps) * Math.PI * 2;
          out.push([dx + Math.cos(ang) * rx, dy + Math.sin(ang) * ry]);
        }
        return out;
      };
      return [
        // Main fillable comic starburst
        {
          role: 'body',
          pts: burstPts,
        },
        // Exclamation wedge comic drop shadow
        {
          role: 'accent-solid',
          pts: [
            [9, 13],
            [24, 33],
            [21, 35.5],
            [6.5, 16.5],
            [9, 13],
          ],
          widthScale: 0.65,
        },
        // Exclamation wedge body
        {
          role: 'body',
          pts: [
            [7, 11],
            [17.5, 4.5],
            [26.5, 31],
            [7, 11],
          ],
          widthScale: 0.9,
        },
        // Exclamation dot shadow
        {
          role: 'accent-solid',
          pts: makeDot(28, 41.5, 3.2, 3.6),
          widthScale: 0.6,
        },
        // Exclamation dot body
        {
          role: 'body',
          pts: makeDot(29.5, 38.2, 3.4, 3.8),
          widthScale: 0.85,
        },
      ];
    }

    // 11. Comic Book Starburst with Solid 5-Pointed Stars & Speed Rays
    case 'comic-burst-stars': {
      const spikes: Array<[number, number]> = [
        [24, 21],
        [41, 22],
        [63, 15],
        [75, 26],
        [90, 34],
        [96, 61],
        [89, 85],
        [68, 93],
        [50, 96],
        [31, 95],
        [15, 88],
        [6, 70],
        [11, 43],
      ];
      const cx = 52;
      const cy = 56;
      const burstPts: Array<[number, number]> = [spikes[0]];
      for (let i = 0; i < spikes.length; i++) {
        const a = spikes[i];
        const b = spikes[(i + 1) % spikes.length];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const cp: [number, number] = [mx + (cx - mx) * 0.36, my + (cy - my) * 0.36];
        burstPts.push(...sampleQuad(a, cp, b, 6));
      }
      const makeStar = (sx: number, sy: number, rOut: number, rIn: number): Array<[number, number]> => {
        const out: Array<[number, number]> = [];
        for (let i = 0; i <= 10; i++) {
          const ang = -Math.PI / 2 + (i * Math.PI) / 5;
          const rad = i % 2 === 0 ? rOut : rIn;
          out.push([sx + Math.cos(ang) * rad, sy + Math.sin(ang) * rad * 1.25]);
        }
        return out;
      };
      return [
        // Main fillable comic starburst
        {
          role: 'body',
          pts: burstPts,
        },
        // 4 solid 5-pointed comic stars
        { role: 'accent-solid', pts: makeStar(35, 16, 3.1, 1.35), widthScale: 0.55 },
        { role: 'accent-solid', pts: makeStar(43, 8.5, 2.2, 0.95), widthScale: 0.5 },
        { role: 'accent-solid', pts: makeStar(93, 27, 2.5, 1.1), widthScale: 0.5 },
        { role: 'accent-solid', pts: makeStar(7.5, 83, 2.9, 1.25), widthScale: 0.55 },
        // Top-left speed rays
        { role: 'accent-solid', pts: [[9, 23], [18, 32], [17, 33.2], [7.5, 25], [9, 23]], widthScale: 0.5 },
        { role: 'accent-solid', pts: [[8, 29], [16.5, 34.5], [16, 35.4], [7.2, 31], [8, 29]], widthScale: 0.5 },
        // Top-center speed rays
        { role: 'accent-solid', pts: [[47, 9], [49.5, 22], [48.6, 22.2], [45.2, 9.5], [47, 9]], widthScale: 0.5 },
        { role: 'accent-solid', pts: [[53.5, 6], [52.5, 21.5], [51.6, 21.5], [51.5, 6.2], [53.5, 6]], widthScale: 0.5 },
        // Right speed rays
        { role: 'accent-solid', pts: [[97, 36], [89.5, 48], [88.8, 47.2], [95.4, 34.5], [97, 36]], widthScale: 0.5 },
        { role: 'accent-solid', pts: [[98, 43], [91.5, 50], [90.9, 49.2], [97, 41.5], [98, 43]], widthScale: 0.5 },
        // Bottom-right speed rays
        { role: 'accent-solid', pts: [[81, 89], [89, 97], [87.4, 97.5], [80.3, 89.6], [81, 89]], widthScale: 0.5 },
        { role: 'accent-solid', pts: [[84.5, 87.5], [92, 94.5], [90.7, 95.3], [83.9, 88.2], [84.5, 87.5]], widthScale: 0.5 },
      ];
    }

    // 12. Layered Vertical Swallowtail Bookmark / Pennant Flag (zero inner crossing lines)
    case 'bookmark-layered':
      return [
        // Back offset layer (only the visible outer L-strip on left & bottom chevron, flush with front)
        {
          role: 'body',
          pts: [
            [18, 13],
            [10, 13],
            [10, 93],
            [54, 74],
            [90, 92],
            [90, 86],
            [54, 68],
            [18, 86],
            [18, 13],
          ],
          widthScale: 0.9,
        },
        // Front fillable bookmark (clean roomy interior)
        {
          role: 'body',
          pts: [
            [18, 7],
            [90, 7],
            [90, 86],
            [54, 68],
            [18, 86],
            [18, 7],
          ],
        },
      ];

    // 13. 3D Vertical Spiral Notepad with Shaded Page Block & 5 Top Wire Rings
    case 'spiral-pad-vertical': {
      const parts: RawVectorPart[] = [
        // 3D right page-stack thickness (shaded with gradient φωτοσκίαση)
        {
          role: 'accent-shade',
          shadeTrans: 68,
          shadeGrad: 75,
          pts: [
            [82, 16],
            [90, 21],
            [89, 89],
            [82, 85],
            [82, 16],
          ],
          widthScale: 0.9,
        },
        // 3D bottom page-stack thickness (slightly darker shade)
        {
          role: 'accent-shade',
          shadeTrans: 58,
          shadeGrad: 55,
          pts: [
            [11, 85],
            [82, 85],
            [89, 89],
            [16, 91],
            [11, 85],
          ],
          widthScale: 0.9,
        },
        // Main fillable front page
        {
          role: 'body',
          pts: [
            [11, 17],
            [82, 16],
            [82, 85],
            [11, 85],
            [11, 17],
          ],
        },
      ];
      // 5 spiral rings + punch holes along the top
      const ringXs = [19, 33, 47, 61, 74];
      for (const rx of ringXs) {
        // Punch hole dot
        const dotPts: Array<[number, number]> = [];
        for (let i = 0; i <= 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          dotPts.push([rx + Math.cos(a) * 2.1, 22.5 + Math.sin(a) * 1.9]);
        }
        parts.push({ role: 'accent-solid', pts: dotPts, widthScale: 0.55 });
        // Curved wire loop arching over top edge
        parts.push({
          role: 'detail',
          pts: [
            [rx - 0.8, 22],
            ...sampleCubic([rx - 0.8, 22], [rx - 7.5, 18], [rx - 5, 7], [rx + 1.2, 8.5], 10),
            ...sampleQuad([rx + 1.2, 8.5], [rx + 5, 10], [rx + 3.2, 16.5], 5),
          ],
          widthScale: 1.05,
        });
      }
      return parts;
    }

    // 14. Horizontal Spiral Flip-Pad with 2 Pages (front + 1 back page) & 9 Top Spiral Loops
    case 'spiral-pad-horizontal': {
      const parts: RawVectorPart[] = [
        // Single back page L-strip (2 pages total)
        {
          role: 'accent-shade',
          shadeTrans: 76,
          shadeGrad: 55,
          pts: [
            [11, 20],
            [7, 20],
            [7, 90],
            [91.5, 90],
            [91.5, 85],
            [11, 85],
            [11, 20],
          ],
          widthScale: 0.8,
        },
        // Main wide fillable front page
        {
          role: 'body',
          pts: [
            [11, 16],
            [94, 16],
            [94, 85],
            [11, 85],
            [11, 16],
          ],
        },
      ];
      // 9 top wire rings + punch dots
      for (let i = 0; i < 9; i++) {
        const rx = 17.5 + i * 9;
        const dotPts: Array<[number, number]> = [];
        for (let k = 0; k <= 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          dotPts.push([rx + Math.cos(a) * 1.35, 26.5 + Math.sin(a) * 2.1]);
        }
        parts.push({ role: 'accent-solid', pts: dotPts, widthScale: 0.5 });
        parts.push({
          role: 'detail',
          pts: [
            [rx, 26],
            ...sampleCubic([rx, 26], [rx + 1.5, 14], [rx - 1.5, 6], [rx - 3.6, 11], 8),
            [rx - 4.2, 16],
          ],
          widthScale: 0.85,
        });
      }
      return parts;
    }

    // 15. Horizontal Note Card with Shaded Diagonal Corner Ribbon
    case 'corner-ribbon-card':
      return [
        // Subtle soft shadow under the diagonal ribbon
        {
          role: 'shade-soft',
          shadeTrans: 78,
          shadeGrad: 65,
          pts: [
            [10, 52],
            [36, 12],
            [39, 14],
            [12, 55],
            [10, 52],
          ],
        },
        // Main fillable note card
        {
          role: 'body',
          pts: [
            [10, 12],
            [92, 12],
            [92, 88],
            [10, 88],
            [10, 12],
          ],
        },
        // Shaded diagonal corner ribbon tucked over top-left corner
        {
          role: 'accent-shade',
          shadeTrans: 62,
          shadeGrad: 78,
          pts: [
            [7.5, 39],
            [27, 8],
            ...sampleQuad([27, 8], [32, 6], [36, 11], 5),
            [10, 52],
            ...sampleQuad([10, 52], [6.5, 47], [7.5, 39], 5),
          ],
          widthScale: 0.95,
        },
      ];

    // 16. Vertical Card Wrapped with Shaded Title Ribbon & Soft Bottom Shadow
    case 'card-with-banner':
      return [
        // Soft bottom cast shadow
        {
          role: 'shade-soft',
          shadeTrans: 76,
          shadeGrad: 70,
          pts: [
            [22, 89],
            [82, 89],
            [84, 95],
            [24, 95],
            [22, 89],
          ],
        },
        // Left swallowtail ribbon end (flush with card left x=21)
        {
          role: 'accent-shade',
          shadeTrans: 60,
          shadeGrad: 75,
          pts: [
            [7, 36],
            [21, 36],
            [21, 51],
            [6, 51],
            [13, 43.5],
            [7, 36],
          ],
          widthScale: 0.9,
        },
        // Right swallowtail ribbon end (flush with card right x=81)
        {
          role: 'accent-shade',
          shadeTrans: 60,
          shadeGrad: 75,
          pts: [
            [81, 36],
            [94, 36],
            [88, 43.5],
            [95, 51],
            [81, 51],
            [81, 36],
          ],
          widthScale: 0.9,
        },
        // Main fillable vertical card
        {
          role: 'body',
          pts: [
            [21, 9],
            [81, 9],
            [81, 89],
            [21, 89],
            [21, 9],
          ],
        },
        // Shaded horizontal title ribbon band wrapping across the card
        {
          role: 'accent-shade',
          shadeTrans: 66,
          shadeGrad: 72,
          pts: [
            [20, 27],
            [82, 27],
            [82, 42],
            [20, 42],
            [20, 27],
          ],
          widthScale: 0.95,
        },
      ];

    // 17. Tall Spiral-Bound Notebook Page (Left Double-Wire Spiral)
    case 'notebook-spiral-left': {
      const parts: RawVectorPart[] = [
        // Subtle soft shadow along right & bottom edge
        {
          role: 'shade-soft',
          shadeTrans: 80,
          shadeGrad: 55,
          pts: [
            [92, 9],
            [95.5, 11],
            [95.5, 96],
            [14, 96],
            [12, 93],
            [92, 93],
            [92, 9],
          ],
        },
        // Main tall fillable notebook page
        {
          role: 'body',
          pts: [
            [12, 6],
            [92, 6],
            [92, 93],
            [12, 93],
            [12, 6],
          ],
        },
      ];
      // 10 crisp double-wire left spiral coils + neat square punch holes
      for (let i = 0; i < 10; i++) {
        const py = 11.5 + i * 8.4;
        // Square punch hole
        parts.push({
          role: 'accent-shade',
          shadeTrans: 72,
          shadeGrad: 50,
          pts: [
            [14.2, py - 1.5],
            [18.2, py - 1.5],
            [18.2, py + 1.5],
            [14.2, py + 1.5],
            [14.2, py - 1.5],
          ],
          widthScale: 0.72,
        });
        // Double wire loop wrapping from left edge into punch hole
        parts.push({
          role: 'detail',
          pts: [
            [16.2, py - 0.6],
            ...sampleQuad([16.2, py - 0.6], [8.5, py - 2.2], [7.2, py + 0.2], 5),
            [8.5, py + 1.4],
          ],
          widthScale: 0.78,
        });
        parts.push({
          role: 'detail',
          pts: [
            [16.2, py + 0.7],
            ...sampleQuad([16.2, py + 0.7], [8.8, py - 0.5], [7.4, py + 1.8], 5),
            [9.4, py + 2.5],
          ],
          widthScale: 0.78,
        });
      }
      return parts;
    }

    // 18. Pinned Sticky Note with Curled Corner & Soft Realistic Cast Shadows
    case 'pinned-sticky-note': {
      const makeEllipse = (ex: number, ey: number, rx: number, ry: number): Array<[number, number]> => {
        const out: Array<[number, number]> = [];
        for (let i = 0; i <= 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          out.push([ex + Math.cos(a) * rx, ey + Math.sin(a) * ry]);
        }
        return out;
      };
      const rightEdgeCurve = sampleQuad([81, 14], [83, 46], [93, 72], 10);
      const bottomEdgeCurve = sampleQuad([76, 81], [48, 86], [16, 87], 10);
      const leftEdgeCurve = sampleQuad([16, 87], [13, 52], [11, 17], 10);
      return [
        // Soft cast shadow behind sticky note (bottom-left + under curl)
        {
          role: 'shade-soft',
          shadeTrans: 78,
          shadeGrad: 65,
          pts: [
            [9, 22],
            [11, 94],
            [86, 83],
            [81, 75],
            [16, 87],
            [11, 19],
            [9, 22],
          ],
        },
        // Subtle shadow behind the curled corner
        {
          role: 'shade-soft',
          shadeTrans: 72,
          shadeGrad: 80,
          pts: [
            [74, 82],
            [79, 64],
            [87, 70],
            [92, 72],
            [74, 82],
          ],
        },
        // Main fillable sticky note body (with curled-up bottom-right corner)
        {
          role: 'body',
          pts: [
            [11, 17],
            [81, 14],
            ...rightEdgeCurve,
            ...sampleQuad([93, 72], [84, 71], [81, 67], 5),
            ...sampleQuad([81, 67], [78, 75], [76, 81], 5),
            ...bottomEdgeCurve,
            ...leftEdgeCurve,
          ],
        },
        // Shaded curled-up corner flap (φωτοσκίαση)
        {
          role: 'accent-shade',
          shadeTrans: 55,
          shadeGrad: 85,
          pts: [
            [76, 81],
            ...sampleQuad([76, 81], [78, 75], [81, 67], 5),
            ...sampleQuad([81, 67], [86, 70], [93, 72], 5),
            [76, 81],
          ],
          widthScale: 0.9,
        },
        // Soft circular cast shadow under the pushpin
        {
          role: 'shade-soft',
          shadeTrans: 76,
          shadeGrad: 55,
          pts: makeEllipse(42, 20.5, 6.2, 4.6),
        },
        // Pushpin dark shaded body/stem
        {
          role: 'accent-shade',
          shadeTrans: 32,
          shadeGrad: 85,
          pts: [
            [42, 14],
            [49, 14],
            [51, 22],
            ...sampleQuad([51, 22], [45, 25], [39.5, 21.5], 6),
            [42, 14],
          ],
          widthScale: 0.95,
        },
        // Pushpin top head cap
        {
          role: 'body',
          pts: makeEllipse(46.5, 11.5, 5.2, 4.4),
          widthScale: 0.95,
        },
        // Inner pushpin ring highlight
        {
          role: 'detail',
          pts: makeEllipse(47.2, 11.2, 2.1, 1.8),
          widthScale: 0.7,
        },
      ];
    }

    // 19. Idea Box with Radiant Lightbulb on Top-Right Edge
    case 'idea-bulb-box': {
      // Rounded rectangle coordinates: x=8..86, y=42..92, r=6
      const boxPts: Array<[number, number]> = [
        [14, 42],
        [80, 42],
        ...sampleQuad([80, 42], [86, 42], [86, 49], 5),
        [86, 85],
        ...sampleQuad([86, 85], [86, 92], [80, 92], 5),
        [14, 92],
        ...sampleQuad([14, 92], [8, 92], [8, 85], 5),
        [8, 49],
        ...sampleQuad([8, 49], [8, 42], [14, 42], 5),
      ];
      // Bulb glass silhouette centered at (69, 23)
      const bulbPts: Array<[number, number]> = [
        [65.5, 34],
        ...sampleCubic([65.5, 34], [65, 30], [61.5, 27], [61.5, 22], 7),
        ...sampleCubic([61.5, 22], [61.5, 14.5], [76.5, 14.5], [76.5, 22], 10),
        ...sampleCubic([76.5, 22], [76.5, 27], [73, 30], [72.5, 34], 7),
        [65.5, 34],
      ];
      const parts: RawVectorPart[] = [
        // Main fillable rounded idea box
        {
          role: 'body',
          pts: boxPts,
        },
        // Warm soft glow tint inside the lightbulb glass
        {
          role: 'accent-shade',
          shadeTrans: 72,
          shadeGrad: 80,
          pts: bulbPts,
          widthScale: 0.95,
        },
        // Filament inside bulb
        {
          role: 'detail',
          pts: [
            [67.2, 33.5],
            [66.4, 24.5],
            [67.8, 25.5],
            [69, 24.3],
            [70.2, 25.5],
            [71.6, 24.5],
            [70.8, 33.5],
          ],
          widthScale: 0.65,
        },
        // Screw base threads
        { role: 'detail', pts: [[66.2, 36.2], [71.8, 36.2]], widthScale: 0.85 },
        { role: 'detail', pts: [[66.8, 38.4], [71.2, 38.4]], widthScale: 0.85 },
        { role: 'detail', pts: [[67.8, 40.4], [70.2, 40.4]], widthScale: 0.85 },
        { role: 'detail', pts: [[69, 40.4], [69, 42]], widthScale: 0.85 },
      ];
      // 9 crisp radial light rays around the bulb
      const rayAngles = [-165, -142, -118, -90, -62, -38, -15, 12, 168];
      for (const deg of rayAngles) {
        const rad = (deg * Math.PI) / 180;
        const r1 = 10.2;
        const r2 = deg === -90 || deg === -142 || deg === -38 ? 15.2 : 13.8;
        parts.push({
          role: 'detail',
          pts: [
            [69 + Math.cos(rad) * r1, 22 + Math.sin(rad) * r1 * 1.15],
            [69 + Math.cos(rad) * r2, 22 + Math.sin(rad) * r2 * 1.15],
          ],
          widthScale: 0.72,
        });
      }
      return parts;
    }

    // 20. Clean Iconic Vertical 3D Comic Lightning Bolt (zero self-intersection, crisp black outline + gradient fill)
    case 'lightning-triple-vertical': {
      const bolt: Array<[number, number]> = [
        [38, 6],
        [72, 6],
        [52, 44],
        [76, 44],
        [26, 95],
        [44, 55],
        [22, 55],
        [38, 6],
      ];
      const shadowBolt: Array<[number, number]> = bolt.map(([x, y]) => [x + 5, y + 2.5]);
      return [
        // Crisp black 3D drop shadow behind the lightning bolt
        { role: 'accent-solid', pts: shadowBolt, widthScale: 0.7 },
        // Clean fillable lightning bolt body (always black outline, gradient fill in chosen color)
        { role: 'body', pts: bolt },
      ];
    }

    // 21. Wide Page-Title Header: Single-Page Spiral Strip (620×106 — 19 dense aspect-true circular holes & wire rings)
    case 'header-spiral-wide': {
      const ar = 620 / 106; // ~5.85:1
      const parts: RawVectorPart[] = [
        // Single clean wide fillable header sheet
        {
          role: 'body',
          pts: [
            [2, 18],
            [98, 18],
            [98, 89],
            [2, 89],
            [2, 18],
          ],
        },
      ];
      // 19 denser, evenly spaced true-circle punch holes & crisp vertical spiral wire loops
      const count = 19;
      const startX = 5.4;
      const endX = 95.4;
      const stepX = (endX - startX) / (count - 1);
      for (let i = 0; i < count; i++) {
        const rx = startX + i * stepX;
        const rY = 3.2; // radius in % of height (~3.4px)
        const rX = rY / ar; // exact true circle in world pixels!
        const dotPts: Array<[number, number]> = [];
        for (let k = 0; k <= 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          dotPts.push([rx + Math.cos(a) * rX, 28.5 + Math.sin(a) * rY]);
        }
        parts.push({ role: 'accent-solid', pts: dotPts, widthScale: 0.5 });
        parts.push({
          role: 'detail',
          pts: [
            [rx, 27.5],
            ...sampleCubic([rx, 27.5], [rx + 0.45, 13.5], [rx - 0.45, 4.5], [rx - 1.2, 10.5], 8),
            [rx - 1.38, 18],
          ],
          widthScale: 0.85,
        });
      }
      return parts;
    }

    // 22. Wide Page-Title Header: Clean Card with True 45° Shaded Corner Ribbon (620×98)
    case 'header-corner-ribbon-wide': {
      // At 620×98 (ar ≈ 6.33), 45° diagonal means dx_pct = dy_pct / 6.33
      return [
        // Subtle soft bottom drop shadow
        {
          role: 'shade-soft',
          shadeTrans: 78,
          shadeGrad: 65,
          pts: [
            [4, 88],
            [98, 88],
            [98.6, 95],
            [4.6, 95],
            [4, 88],
          ],
        },
        // Main wide fillable header card
        {
          role: 'body',
          pts: [
            [3, 14],
            [98, 14],
            [98, 88],
            [3, 88],
            [3, 14],
          ],
        },
        // Subtle shadow strip under the 45° corner ribbon
        {
          role: 'shade-soft',
          shadeTrans: 76,
          shadeGrad: 60,
          pts: [
            [3, 62],
            [11.8, 14],
            [12.7, 16],
            [3.7, 66],
            [3, 62],
          ],
        },
        // True 45° shaded corner ribbon tucked cleanly over the top-left corner
        {
          role: 'accent-shade',
          shadeTrans: 58,
          shadeGrad: 75,
          pts: [
            [2.1, 46],
            [8.4, 9],
            ...sampleQuad([8.4, 9], [10.4, 7], [11.8, 13], 5),
            [3, 62],
            ...sampleQuad([3, 62], [1.7, 55], [2.1, 46], 5),
          ],
          widthScale: 0.92,
        },
      ];
    }

    // 23. Wide Page-Title Header: Comic Starburst with Dense Lively Zig-Zag Spikes, True-Aspect Stars & Side Rays (620×116)
    case 'header-comic-wide': {
      const ar = 620 / 116; // ~5.34
      // 26 dense, punchy, lively comic spikes (10 across top, 3 right, 10 across bottom, 3 left)
      const spikes: Array<[number, number]> = [
        // Top edge (10 lively spikes with varied heights)
        [10, 18],
        [18, 12],
        [26, 17],
        [34, 11],
        [42, 16],
        [50, 10],
        [58, 16],
        [66, 11],
        [74, 17],
        [82, 12],
        [90, 18],
        // Right flank (3 dramatic burst spikes)
        [96.2, 33],
        [98.4, 54],
        [95.5, 76],
        // Bottom edge (10 lively spikes with varied depths)
        [89, 86],
        [81, 92],
        [73, 86],
        [65, 93],
        [57, 87],
        [49, 94],
        [41, 87],
        [33, 93],
        [25, 86],
        [17, 92],
        [9.5, 85],
        // Left flank (3 dramatic burst spikes)
        [4.5, 73],
        [2.0, 53],
        [4.8, 33],
      ];
      const cx = 50;
      const cy = 53;
      const burstPts: Array<[number, number]> = [spikes[0]];
      for (let i = 0; i < spikes.length; i++) {
        const a = spikes[i];
        const b = spikes[(i + 1) % spikes.length];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const isSide = Math.abs(mx - cx) > 40;
        const pullX = isSide ? 0.14 : 0.02;
        const pullY = isSide ? 0.18 : 0.44; // deeper, punchier concave comic scallops between dense spikes!
        const cp: [number, number] = [mx + (cx - mx) * pullX, my + (cy - my) * pullY];
        burstPts.push(...sampleQuad(a, cp, b, 4));
      }
      // Aspect-compensated true symmetrical 5-pointed star!
      const makeTrueStar = (sx: number, sy: number, rOutY: number): Array<[number, number]> => {
        const rInY = rOutY * 0.44;
        const out: Array<[number, number]> = [];
        for (let i = 0; i <= 10; i++) {
          const ang = -Math.PI / 2 + (i * Math.PI) / 5;
          const ry = i % 2 === 0 ? rOutY : rInY;
          const rx = ry / ar;
          out.push([sx + Math.cos(ang) * rx, sy + Math.sin(ang) * ry]);
        }
        return out;
      };
      return [
        // Main fillable wide comic starburst
        {
          role: 'body',
          pts: burstPts,
        },
        // 5 perfectly proportioned non-squished 5-pointed stars
        { role: 'accent-solid', pts: makeTrueStar(22, 8.5, 5.8), widthScale: 0.5 },
        { role: 'accent-solid', pts: makeTrueStar(50, 5.5, 4.6), widthScale: 0.45 },
        { role: 'accent-solid', pts: makeTrueStar(78, 8.5, 5.6), widthScale: 0.5 },
        { role: 'accent-solid', pts: makeTrueStar(2.8, 86, 5.4), widthScale: 0.5 },
        { role: 'accent-solid', pts: makeTrueStar(97.2, 18, 5.0), widthScale: 0.48 },
        // Crisp comic speed rays on left & right flanks
        { role: 'accent-solid', pts: [[1.0, 21], [5.8, 29], [5.4, 31.5], [0.6, 25], [1.0, 21]], widthScale: 0.45 },
        { role: 'accent-solid', pts: [[0.8, 34], [5.0, 38], [4.8, 40.2], [0.5, 37.5], [0.8, 34]], widthScale: 0.45 },
        { role: 'accent-solid', pts: [[99.0, 35], [95.0, 41], [95.3, 43.2], [99.4, 38.5], [99.0, 35]], widthScale: 0.45 },
        { role: 'accent-solid', pts: [[98.8, 74], [94.2, 80], [94.7, 82.5], [99.2, 78], [98.8, 74]], widthScale: 0.45 },
      ];
    }

    // 24. Wide Page-Title Header: Elegant Full-Width Ribbon Banner (620×98 — compact crisp tails)
    case 'header-ribbon-banner-wide':
      return [
        // Left compact swallowtail (flush with center left edge x=11)
        {
          role: 'body',
          pts: [
            [1.5, 32],
            [11, 32],
            [11, 68],
            [15.5, 86],
            [1.5, 86],
            [5.8, 59],
            [1.5, 32],
          ],
        },
        // Right compact swallowtail (flush with center right edge x=89)
        {
          role: 'body',
          pts: [
            [89, 32],
            [98.5, 32],
            [94.2, 59],
            [98.5, 86],
            [84.5, 86],
            [89, 68],
            [89, 32],
          ],
        },
        // Left fold shadow triangle
        {
          role: 'accent-solid',
          pts: [
            [11, 68],
            [15.5, 68],
            [15.5, 86],
            [11, 68],
          ],
          widthScale: 0.65,
        },
        // Right fold shadow triangle
        {
          role: 'accent-solid',
          pts: [
            [89, 68],
            [84.5, 68],
            [84.5, 86],
            [89, 68],
          ],
          widthScale: 0.65,
        },
        // Wide spacious center title banner box (x=11..89)
        {
          role: 'body',
          pts: [
            [11, 11],
            [89, 11],
            [89, 68],
            [11, 68],
            [11, 11],
          ],
        },
      ];

    // 25. Wide Page-Title Header: Taped Note Strip with 4 True-45° Washi Tape Corners (620×100)
    case 'header-taped-banner-wide':
      return [
        // Chamfered wide header card (corners cleanly hidden behind the 4 diagonal tape strips)
        {
          role: 'body',
          pts: [
            [7.2, 15],
            [50, 14],
            [92.8, 15],
            [96.6, 36],
            [96.9, 50],
            [96.6, 64],
            [92.8, 85],
            [50, 86],
            [7.2, 85],
            [3.4, 64],
            [3.1, 50],
            [3.4, 36],
            [7.2, 15],
          ],
        },
        // Top-left true-45° shaded washi tape strip
        {
          role: 'accent-shade',
          shadeTrans: 62,
          shadeGrad: 70,
          pts: [
            [2.4, 41],
            [8.2, 10],
            [7.2, 8],
            [7.4, 4.5],
            [6.1, 6.5],
            [5.5, 3],
            [1.0, 27],
            [1.8, 29],
            [1.4, 34],
            [2.1, 33],
            [2.4, 41],
          ],
          widthScale: 0.78,
        },
        // Top-right true-45° shaded washi tape strip
        {
          role: 'accent-shade',
          shadeTrans: 62,
          shadeGrad: 70,
          pts: [
            [91.8, 10],
            [97.6, 41],
            [97.9, 33],
            [98.6, 34],
            [98.2, 29],
            [99.0, 27],
            [94.5, 3],
            [93.9, 6.5],
            [92.6, 4.5],
            [92.8, 8],
            [91.8, 10],
          ],
          widthScale: 0.78,
        },
        // Bottom-left true-45° shaded washi tape strip
        {
          role: 'accent-shade',
          shadeTrans: 62,
          shadeGrad: 70,
          pts: [
            [2.4, 59],
            [8.2, 90],
            [7.2, 92],
            [7.4, 95.5],
            [6.1, 93.5],
            [5.5, 97],
            [1.0, 73],
            [1.8, 71],
            [1.4, 66],
            [2.1, 67],
            [2.4, 59],
          ],
          widthScale: 0.78,
        },
        // Bottom-right true-45° shaded washi tape strip
        {
          role: 'accent-shade',
          shadeTrans: 62,
          shadeGrad: 70,
          pts: [
            [91.8, 90],
            [97.6, 59],
            [97.9, 67],
            [98.6, 66],
            [98.2, 71],
            [99.0, 73],
            [94.5, 97],
            [93.9, 93.5],
            [92.6, 95.5],
            [92.8, 92],
            [91.8, 90],
          ],
          widthScale: 0.78,
        },
      ];

    // 26. Exclamation Mark Burst Badge (always black outline, changeable fill + gradient)
    case 'badge-exclamation-burst': {
      const spikes: Array<[number, number]> = [
        [37, 17],
        [63, 21],
        [83, 27],
        [77, 47],
        [89, 64],
        [66, 86],
        [33, 89],
        [12, 68],
        [14, 38],
      ];
      const cx = 50;
      const cy = 54;
      const burstPts: Array<[number, number]> = [spikes[0]];
      for (let i = 0; i < spikes.length; i++) {
        const a = spikes[i];
        const b = spikes[(i + 1) % spikes.length];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const cp: [number, number] = [mx + (cx - mx) * 0.36, my + (cy - my) * 0.36];
        burstPts.push(...sampleQuad(a, cp, b, 6));
      }
      const dotPts: Array<[number, number]> = [];
      for (let i = 0; i <= 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        dotPts.push([46 + Math.cos(a) * 6.8, 63 + Math.sin(a) * 6.2]);
      }
      return [
        // Main fillable starburst badge
        { role: 'body', pts: burstPts },
        // Bold slightly-tilted exclamation wedge (darker accent shade of chosen color)
        {
          role: 'accent-shade',
          shadeTrans: 25,
          shadeGrad: 65,
          pts: [
            [50, 12],
            [68, 16],
            [54, 48],
            [44, 45],
            [50, 12],
          ],
          widthScale: 0.95,
        },
        // Exclamation dot (darker accent shade of chosen color)
        {
          role: 'accent-shade',
          shadeTrans: 25,
          shadeGrad: 65,
          pts: dotPts,
          widthScale: 0.95,
        },
      ];
    }

    // 26b. Bold Exclamation Mark with Soft Offset Drop Shadow (no radial rays, always black outline + variable fill)
    case 'badge-exclamation-shadow': {
      const ar = 86 / 126; // ~0.683
      // Slightly organic tapered comic exclamation wedge
      const wedgePts: Array<[number, number]> = [
        [24, 10],
        [74, 18],
        ...sampleQuad([74, 18], [60, 44], [52, 69], 8),
        [33, 69],
        ...sampleQuad([33, 69], [34, 40], [24, 10], 8),
      ];
      const wedgeShadow: Array<[number, number]> = wedgePts.map(([x, y]) => [x + 9, y + 5.5]);
      // Aspect-true circular dot
      const rY = 9.5;
      const rX = rY / ar; // true circle in world pixels
      const dotPts: Array<[number, number]> = [];
      for (let i = 0; i <= 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        dotPts.push([41 + Math.cos(a) * rX, 83 + Math.sin(a) * rY]);
      }
      const dotShadow: Array<[number, number]> = dotPts.map(([x, y]) => [x + 8.5, y + 5.5]);
      return [
        // Soft borderless drop shadows behind wedge & dot
        { role: 'shade-soft', shadeTrans: 70, shadeGrad: 45, pts: wedgeShadow },
        { role: 'shade-soft', shadeTrans: 70, shadeGrad: 45, pts: dotShadow },
        // Main fillable wedge & dot (always crisp black outline, variable fill + gradient)
        { role: 'body', pts: wedgePts },
        { role: 'body', pts: dotPts },
      ];
    }

    // 27. Horizontal 3D Pushpin (clean — NO 3 motion lines, always black outline + variable fill)
    case 'pushpin-horizontal': {
      return [
        // Metallic pin needle pointing left
        {
          role: 'accent-shade',
          shadeTrans: 72,
          shadeGrad: 50,
          pts: [
            [8, 52],
            [16, 47.5],
            [38, 44],
            [38, 53],
            [16, 54.5],
            [8, 52],
          ],
          widthScale: 0.85,
        },
        // Rounded base collar flange (fillable body)
        {
          role: 'body',
          pts: [
            [39, 25],
            ...sampleCubic([39, 25], [56, 22], [62, 36], [60, 50], 10),
            ...sampleCubic([60, 50], [58, 68], [46, 77], [37, 71], 10),
            ...sampleCubic([37, 71], [31, 60], [31, 35], [39, 25], 10),
          ],
        },
        // Cylindrical neck connecting collar to cap (fillable body)
        {
          role: 'body',
          pts: [
            [54, 34],
            [74, 31],
            [76, 57],
            [55, 62],
            ...sampleQuad([55, 62], [51, 48], [54, 34], 6),
          ],
        },
        // Rounded top cap head (fillable body)
        {
          role: 'body',
          pts: [
            [75, 22],
            ...sampleCubic([75, 22], [90, 21], [94, 38], [91, 52], 10),
            ...sampleCubic([91, 52], [88, 66], [76, 70], [72, 62], 10),
            ...sampleCubic([72, 62], [68, 48], [69, 30], [75, 22], 10),
          ],
        },
      ];
    }

    // 28. Angled 3D Pushpin pointing down-left (clean — NO 3 motion lines, always black outline + variable fill)
    case 'pushpin-angled': {
      return [
        // Sharp pin needle pointing down-left
        {
          role: 'accent-shade',
          shadeTrans: 72,
          shadeGrad: 50,
          pts: [
            [24, 92],
            [34, 77],
            [47, 56],
            [53, 60],
            [38, 82],
            [24, 92],
          ],
          widthScale: 0.85,
        },
        // Rounded lower flange base (fillable body)
        {
          role: 'body',
          pts: [
            [31, 46],
            ...sampleCubic([31, 46], [42, 36], [62, 42], [72, 54], 10),
            ...sampleCubic([72, 54], [76, 66], [62, 72], [47, 65], 10),
            ...sampleCubic([47, 65], [32, 58], [26, 52], [31, 46], 10),
          ],
        },
        // Angled cylindrical stem (fillable body)
        {
          role: 'body',
          pts: [
            [44, 46],
            [58, 22],
            [78, 32],
            [64, 55],
            ...sampleQuad([64, 55], [52, 53], [44, 46], 6),
          ],
        },
        // Rounded top cap head (fillable body)
        {
          role: 'body',
          pts: [
            [52, 13],
            ...sampleCubic([52, 13], [60, 6], [78, 12], [87, 21], 10),
            ...sampleCubic([87, 21], [91, 29], [80, 35], [68, 29], 10),
            ...sampleCubic([68, 29], [54, 24], [48, 18], [52, 13], 10),
          ],
        },
      ];
    }

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

  const outlineColor = '#111827';
  const isDarkDefault =
    !color ||
    color.toLowerCase() === '#111827' ||
    color.toLowerCase() === '#0f172a' ||
    color.toLowerCase() === '#1e293b';
  const isSolidColorIcon =
    key === 'lightning-triple-vertical' ||
    key === 'badge-exclamation-burst' ||
    key === 'badge-exclamation-shadow' ||
    key === 'pushpin-horizontal' ||
    key === 'pushpin-angled';
  const fillTint = isDarkDefault
    ? key === 'lightning-triple-vertical' || key === 'badge-exclamation-burst'
      ? '#facc15'
      : key === 'badge-exclamation-shadow' || key === 'pushpin-horizontal' || key === 'pushpin-angled'
      ? '#ef4444'
      : '#64748b'
    : color;
  const gradId = `bfg-${key.replace(/[^a-z0-9]/gi, '')}`;
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
        return `<path d="${d} Z" fill="${outlineColor}" stroke="${outlineColor}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      if (part.role === 'shade-soft') {
        const op = Math.max(0.12, Math.min(0.45, (100 - (part.shadeTrans ?? 76)) / 100)).toFixed(2);
        return `<path d="${d} Z" fill="${fillTint}" fill-opacity="${op}" stroke="none"/>`;
      }
      if (part.role === 'accent-shade') {
        return `<path d="${d} Z" fill="url(#${gradId})" stroke="${outlineColor}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      if (part.role === 'body') {
        if (isSolidColorIcon) {
          return `<path d="${d} Z" fill="${fillTint}" fill-opacity="0.88" stroke="${outlineColor}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
        }
        return `<path d="${d} Z" fill="${isDarkDefault ? '#ffffff' : fillTint}" fill-opacity="${isDarkDefault ? '0.88' : '0.24'}" stroke="${outlineColor}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      if (part.role === 'detail-dashed') {
        return `<path d="${d}" fill="none" stroke="${outlineColor}" stroke-width="${sw}" stroke-dasharray="5 5" stroke-linecap="round"/>`;
      }
      return `<path d="${d}" fill="none" stroke="${outlineColor}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${fillTint}" stop-opacity="0.46"/><stop offset="100%" stop-color="${fillTint}" stop-opacity="0.16"/></linearGradient></defs>${elements}</svg>`;
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
  fillGradient = 50
): StrokeObject[] {
  const def = BANNER_FRAME_DEFS.find((d) => d.key === key);
  const parts = getBannerNormalizedParts(key);
  if (!def || parts.length === 0) return [];

  const x0 = cx - def.aspectW / 2;
  const y0 = cy - def.aspectH / 2;
  const groupId = `grp-banner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const baseW = Math.max(1.8, Math.min(4.2, strokeWidth || 2.4));
  // Always crisp black outline (#111827); user's chosen color drives the interior fill & shading!
  const outlineHex = '#111827';
  const isDarkColor =
    !color ||
    color.toLowerCase() === '#111827' ||
    color.toLowerCase() === '#0f172a' ||
    color.toLowerCase() === '#1e293b';
  const isAccentColorIcon =
    key === 'lightning-triple-vertical' ||
    key === 'badge-exclamation-burst' ||
    key === 'badge-exclamation-shadow' ||
    key === 'pushpin-horizontal' ||
    key === 'pushpin-angled';
  const resolvedFillHex =
    isDarkColor && (key === 'lightning-triple-vertical' || key === 'badge-exclamation-burst')
      ? '#facc15'
      : isDarkColor && (key === 'badge-exclamation-shadow' || key === 'pushpin-horizontal' || key === 'pushpin-angled')
      ? '#ef4444'
      : color || '#2563eb';
  const bodyFillStyle =
    isAccentColorIcon
      ? 'solid'
      : !isDarkColor && fillStyle === 'none'
      ? 'solid'
      : fillStyle;
  const bodyFillTrans =
    isAccentColorIcon
      ? 10
      : !isDarkColor && fillStyle === 'none'
      ? Math.min(80, fillTransparency)
      : fillTransparency;
  const bodyFillGrad =
    isAccentColorIcon && fillGradient === 0 ? 55 : fillGradient;

  return parts.map((part, idx) => {
    const pts = toWorldPts(part.pts, x0, y0, def.aspectW, def.aspectH);
    const id = `stk-banner-${key}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`;
    const zOrder = baseZOrder + idx;
    const width = Number((baseW * (part.widthScale ?? 1)).toFixed(2));

    if (part.role === 'accent-solid') {
      return {
        id,
        tool: 'pen',
        color: outlineHex,
        fillColor: outlineHex,
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
    if (part.role === 'shade-soft') {
      return {
        id,
        tool: 'pen',
        color: outlineHex,
        fillColor: resolvedFillHex,
        fillStyle: 'solid',
        fillTransparency: part.shadeTrans ?? 76,
        fillGradient: part.shadeGrad ?? 65,
        width: 0.5,
        opacity: 1,
        points: pts,
        layerId,
        groupId,
        isShape: true,
        shapeType: 'banner-shade-soft',
        zOrder,
      };
    }
    if (part.role === 'accent-shade') {
      return {
        id,
        tool: 'pen',
        color: outlineHex,
        fillColor: resolvedFillHex,
        fillStyle: 'solid',
        fillTransparency: part.shadeTrans ?? 65,
        fillGradient: part.shadeGrad ?? 70,
        width,
        opacity: 1,
        points: pts,
        layerId,
        groupId,
        isShape: true,
        shapeType: 'banner-accent-shade',
        zOrder,
      };
    }
    if (part.role === 'body') {
      return {
        id,
        tool: 'pen',
        color: outlineHex,
        fillColor: resolvedFillHex,
        fillStyle: bodyFillStyle,
        fillTransparency: bodyFillTrans,
        fillGradient: bodyFillGrad,
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
      color: outlineHex,
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
