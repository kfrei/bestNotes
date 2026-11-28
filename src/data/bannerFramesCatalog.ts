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
    aspectW: 420,
    aspectH: 78,
  },
  {
    id: 'banner-ribbon-3d',
    key: 'ribbon-3d',
    title: 'Κορδέλα Τίτλου 3D',
    tags: ['κορδέλα', 'πλαίσιο', 'τίτλος', 'banner', 'ribbon', '3d', 'επικεφαλίδα', 'σκιά'],
    aspectW: 440,
    aspectH: 94,
  },
  {
    id: 'banner-ribbon-classic',
    key: 'ribbon-classic',
    title: 'Κλασική Κορδέλα Τίτλου',
    tags: ['κορδέλα', 'πλαίσιο', 'τίτλος', 'banner', 'ribbon', 'κλασική', 'επικεφαλίδα', 'σημειώσεις'],
    aspectW: 440,
    aspectH: 92,
  },
  {
    id: 'banner-ribbon-wave',
    key: 'ribbon-wave',
    title: 'Κυματιστή Κορδέλα Τίτλου',
    tags: ['κορδέλα', 'κυματιστή', 'καμπύλη', 'banner', 'ribbon', 'wave', 'τίτλος', 'επικεφαλίδα'],
    aspectW: 440,
    aspectH: 90,
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
    aspectW: 480,
    aspectH: 175,
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
  {
    id: 'banner-arrow-curved-3d-hatched',
    key: 'arrow-curved-3d-hatched',
    title: 'Καμπύλο Βέλος 3D με Σκίαση',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', '3d', 'σκίαση', 'arrow', 'curved', 'hatched', 'sketch', 'δείκτης'],
    aspectW: 190,
    aspectH: 155,
  },
  {
    id: 'banner-hanging-lightbulb',
    key: 'hanging-lightbulb',
    title: 'Κρεμαστή Λάμπα Ιδέας',
    tags: ['λάμπα', 'λαμπτήρας', 'κρεμαστή', 'ιδέα', 'φως', 'σχοινί', 'bulb', 'lightbulb', 'hanging', 'idea', 'tip'],
    aspectW: 105,
    aspectH: 310,
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
    // 1. Horizontal Flag / Pennant Banner with sleek compact right notch & bold lower shadow
    case 'flag-shadow':
      return [
        // Solid lower + notch drop shadow
        {
          role: 'accent-solid',
          pts: [
            [3, 79],
            [96, 79],
            [90.5, 48],
            [96, 21],
            [97.5, 25],
            [92.5, 50],
            [97.5, 86],
            [3, 86],
            [3, 79],
          ],
          widthScale: 0.7,
        },
        // Main fillable flag body (compact crisp notch)
        {
          role: 'body',
          pts: [
            [3, 16],
            [96, 16],
            [89.5, 47.5],
            [96, 79],
            [3, 79],
            [3, 16],
          ],
        },
      ];

    // 2. Classic 3D Ribbon Banner with sleek compact swallowtail ends & bold folded shadows
    case 'ribbon-3d':
      return [
        // Left compact tail shadow
        {
          role: 'accent-solid',
          pts: [
            [3, 81],
            [15.5, 81],
            [15.5, 87],
            [3, 87],
            [7.2, 57],
            [3, 35],
            [4.5, 35],
            [8.6, 57],
            [3, 81],
          ],
          widthScale: 0.6,
        },
        // Right compact tail shadow
        {
          role: 'accent-solid',
          pts: [
            [84.5, 81],
            [97, 81],
            [92.8, 57],
            [97, 35],
            [95.5, 35],
            [91.4, 57],
            [97, 87],
            [84.5, 87],
            [84.5, 81],
          ],
          widthScale: 0.6,
        },
        // Left compact tail body (flush with center box left edge x=12)
        {
          role: 'body',
          pts: [
            [3, 33],
            [12, 33],
            [12, 66],
            [15.5, 81],
            [3, 81],
            [6.8, 57],
            [3, 33],
          ],
        },
        // Right compact tail body (flush with center box right edge x=88)
        {
          role: 'body',
          pts: [
            [88, 33],
            [97, 33],
            [93.2, 57],
            [97, 81],
            [84.5, 81],
            [88, 66],
            [88, 33],
          ],
        },
        // Dark folded under-ribbon shadow bar
        {
          role: 'accent-solid',
          pts: [
            [12, 66],
            [88, 66],
            [84.5, 81],
            [84.5, 73],
            [15.5, 73],
            [15.5, 81],
            [12, 66],
          ],
          widthScale: 0.6,
        },
        // Main spacious center ribbon box (x=12..88)
        {
          role: 'body',
          pts: [
            [12, 11],
            [88, 11],
            [88, 66],
            [12, 66],
            [12, 11],
          ],
        },
      ];

    // 3. Clean Notebook Classic Folded Ribbon Banner (sleek compact tails)
    case 'ribbon-classic':
      return [
        // Left compact tail (flush with center box left edge x=12)
        {
          role: 'body',
          pts: [
            [3, 34],
            [12, 34],
            [12, 64],
            [15.5, 83],
            [3, 83],
            [6.8, 58.5],
            [3, 34],
          ],
        },
        // Right compact tail (flush with center box right edge x=88)
        {
          role: 'body',
          pts: [
            [88, 34],
            [97, 34],
            [93.2, 58.5],
            [97, 83],
            [84.5, 83],
            [88, 64],
            [88, 34],
          ],
        },
        // Left compact fold triangle
        {
          role: 'accent-solid',
          pts: [
            [12, 64],
            [15.5, 64],
            [15.5, 83],
            [12, 64],
          ],
          widthScale: 0.7,
        },
        // Right compact fold triangle
        {
          role: 'accent-solid',
          pts: [
            [88, 64],
            [84.5, 64],
            [84.5, 83],
            [88, 64],
          ],
          widthScale: 0.7,
        },
        // Main spacious center banner box (x=12..88)
        {
          role: 'body',
          pts: [
            [12, 14],
            [88, 14],
            [88, 64],
            [12, 64],
            [12, 14],
          ],
        },
      ];

    // 4. Wavy Flowing Ribbon Banner (compact sleek tails flush along outer center edges)
    case 'ribbon-wave': {
      const centerTop = sampleQuad([12, 22], [50, 9], [88, 22], 14);
      const centerRight = sampleQuad([88, 22], [86.5, 44], [88.5, 66], 8);
      const centerBot = sampleQuad([88.5, 66], [50, 53], [11.5, 66], 14);
      const centerLeft = sampleQuad([11.5, 66], [13.5, 44], [12, 22], 8);
      const leftSharedEdgeUp: Array<[number, number]> = [[11.5, 66], ...centerLeft.slice(0, 6)];
      const leftAttach = leftSharedEdgeUp[leftSharedEdgeUp.length - 1];
      const rightSharedEdgeDown: Array<[number, number]> = centerRight.slice(2);
      const rightAttach = rightSharedEdgeDown[0];
      const rightSharedEdgeUp: Array<[number, number]> = [...rightSharedEdgeDown].reverse();

      const leftTailTop = sampleQuad(leftAttach, [8, 41], [3, 36], 6);
      const leftTailNotch1 = sampleQuad([3, 36], [6, 47], [7.5, 58], 5);
      const leftTailNotch2 = sampleQuad([7.5, 58], [5, 68], [3, 83], 5);
      const leftTailBot = sampleQuad([3, 83], [9.5, 78], [15.5, 70], 6);
      const rightTailTop = sampleQuad(rightAttach, [92, 41], [97, 36], 6);
      const rightTailNotch1 = sampleQuad([97, 36], [94, 47], [92.5, 58], 5);
      const rightTailNotch2 = sampleQuad([92.5, 58], [95, 68], [97, 83], 5);
      const rightTailBot = sampleQuad([97, 83], [90.5, 78], [84.5, 70], 6);
      return [
        {
          role: 'body',
          pts: [leftAttach, ...leftTailTop, ...leftTailNotch1, ...leftTailNotch2, ...leftTailBot, ...leftSharedEdgeUp],
        },
        {
          role: 'body',
          pts: [rightAttach, ...rightTailTop, ...rightTailNotch1, ...rightTailNotch2, ...rightTailBot, ...rightSharedEdgeUp],
        },
        {
          role: 'accent-solid',
          pts: [
            ...centerBot.slice(12),
            [15.5, 70],
            centerBot[12],
          ],
          widthScale: 0.65,
        },
        {
          role: 'accent-solid',
          pts: [
            [88.5, 66],
            ...centerBot.slice(0, 2),
            [84.5, 70],
            [88.5, 66],
          ],
          widthScale: 0.65,
        },
        {
          role: 'body',
          pts: [[12, 22], ...centerTop, ...centerRight, ...centerBot, ...centerLeft],
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

    // 11. Comic Book Starburst with Dense Spikes, Aspect-True 5-Pointed Stars & Speed Rays (480×175 wide title ratio)
    case 'comic-burst-stars': {
      const ar = 480 / 175; // ~2.74:1 wide title ratio
      // 26 dense, lively comic spikes around the perimeter so it looks awesome even when stretched wide!
      const spikes: Array<[number, number]> = [
        // Top edge (9 dense spikes)
        [14, 21],
        [23, 15],
        [32, 20],
        [41, 14],
        [50, 19],
        [59, 13],
        [68, 19],
        [77, 15],
        [86, 22],
        // Right flank (4 dynamic spikes)
        [94, 34],
        [97, 50],
        [94.5, 68],
        [90, 82],
        // Bottom edge (9 dense spikes)
        [82, 89],
        [73, 85],
        [64, 92],
        [55, 86],
        [46, 93],
        [37, 86],
        [28, 92],
        [19, 86],
        [11, 82],
        // Left flank (4 dynamic spikes)
        [6.5, 69],
        [3.5, 53],
        [6.5, 37],
      ];
      const cx = 50;
      const cy = 54;
      const burstPts: Array<[number, number]> = [spikes[0]];
      for (let i = 0; i < spikes.length; i++) {
        const a = spikes[i];
        const b = spikes[(i + 1) % spikes.length];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const isSide = Math.abs(mx - cx) > 38;
        const pullX = isSide ? 0.16 : 0.04;
        const pullY = isSide ? 0.18 : 0.4;
        const cp: [number, number] = [mx + (cx - mx) * pullX, my + (cy - my) * pullY];
        burstPts.push(...sampleQuad(a, cp, b, 5));
      }
      const makeStar = (sx: number, sy: number, rOutY: number): Array<[number, number]> => {
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
        // Main fillable comic starburst
        {
          role: 'body',
          pts: burstPts,
        },
        // 4 aspect-true solid 5-pointed comic stars
        { role: 'accent-solid', pts: makeStar(34, 10, 5.2), widthScale: 0.5 },
        { role: 'accent-solid', pts: makeStar(44, 6, 3.8), widthScale: 0.48 },
        { role: 'accent-solid', pts: makeStar(93.5, 22, 4.4), widthScale: 0.5 },
        { role: 'accent-solid', pts: makeStar(5.5, 84, 5.0), widthScale: 0.5 },
        // Top-left speed rays
        { role: 'accent-solid', pts: [[5, 22], [12.5, 30], [11.8, 32], [4, 25], [5, 22]], widthScale: 0.48 },
        { role: 'accent-solid', pts: [[4.5, 30], [11, 34.5], [10.6, 36.2], [3.8, 32.5], [4.5, 30]], widthScale: 0.48 },
        // Top-center speed rays
        { role: 'accent-solid', pts: [[48.5, 4.5], [50, 15.5], [49.1, 15.8], [46.8, 5.2], [48.5, 4.5]], widthScale: 0.48 },
        { role: 'accent-solid', pts: [[53.5, 3.5], [52.2, 15], [51.3, 15], [51.8, 3.8], [53.5, 3.5]], widthScale: 0.48 },
        // Right speed rays
        { role: 'accent-solid', pts: [[97.5, 31], [92, 42], [91.3, 41], [96.2, 29.5], [97.5, 31]], widthScale: 0.48 },
        { role: 'accent-solid', pts: [[98.2, 39], [93.2, 46], [92.6, 45], [97.2, 37.5], [98.2, 39]], widthScale: 0.48 },
        // Bottom-right speed rays
        { role: 'accent-solid', pts: [[85, 88], [92, 96], [90.6, 97], [84.2, 89], [85, 88]], widthScale: 0.48 },
        { role: 'accent-solid', pts: [[88, 86], [94.5, 93], [93.3, 94.2], [87.3, 87], [88, 86]], widthScale: 0.48 },
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
        // Slim 3D right page-stack thickness (shaded with gradient φωτοσκίαση)
        {
          role: 'accent-shade',
          shadeTrans: 68,
          shadeGrad: 75,
          pts: [
            [82, 16],
            [85.2, 18.2],
            [85.0, 87.2],
            [82, 85],
            [82, 16],
          ],
          widthScale: 0.9,
        },
        // Slim 3D bottom page-stack thickness (slightly darker shade)
        {
          role: 'accent-shade',
          shadeTrans: 58,
          shadeGrad: 55,
          pts: [
            [11, 85],
            [82, 85],
            [85.0, 87.2],
            [13.8, 87.6],
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
        // Left swallowtail ribbon end (flush with card left x=21, tucked cleanly behind card)
        {
          role: 'accent-shade',
          shadeTrans: 58,
          shadeGrad: 75,
          pts: [
            [8.5, 20],
            [21, 20],
            [21, 33],
            [8, 33],
            [13.5, 26.5],
            [8.5, 20],
          ],
          widthScale: 0.9,
        },
        // Right swallowtail ribbon end (flush with card right x=81, tucked cleanly behind card)
        {
          role: 'accent-shade',
          shadeTrans: 58,
          shadeGrad: 75,
          pts: [
            [81, 20],
            [93.5, 20],
            [88.5, 26.5],
            [94, 33],
            [81, 33],
            [81, 20],
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
        // Left 3D under-fold triangle where ribbon wraps behind the left card edge
        {
          role: 'accent-solid',
          pts: [
            [21, 28],
            [21, 33],
            [17.5, 28],
            [21, 28],
          ],
          widthScale: 0.7,
        },
        // Right 3D under-fold triangle where ribbon wraps behind the right card edge
        {
          role: 'accent-solid',
          pts: [
            [81, 28],
            [84.5, 28],
            [81, 33],
            [81, 28],
          ],
          widthScale: 0.7,
        },
        // Shaded horizontal title ribbon band wrapping flush across the upper card (x=21..81, y=14..28)
        {
          role: 'accent-shade',
          shadeTrans: 64,
          shadeGrad: 72,
          pts: [
            [21, 14],
            [81, 14],
            [81, 28],
            [21, 28],
            [21, 14],
          ],
          widthScale: 0.95,
        },
      ];

    // 17. Tall Spiral-Bound Notebook Page (Left Double-Wire Spiral)
    case 'notebook-spiral-left': {
      const parts: RawVectorPart[] = [
        // Slim soft shadow along right & bottom edge
        {
          role: 'shade-soft',
          shadeTrans: 80,
          shadeGrad: 55,
          pts: [
            [92, 8],
            [94, 9.5],
            [94, 94.8],
            [13.5, 94.8],
            [12, 93],
            [92, 93],
            [92, 8],
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
          pts: makeEllipse(42.5, 20.5, 6.2, 4.6),
        },
        // Pushpin shaded body/stem
        {
          role: 'accent-shade',
          shadeTrans: 36,
          shadeGrad: 70,
          pts: [
            [42, 14],
            [49, 14],
            [51, 22],
            ...sampleQuad([51, 22], [45.2, 24.8], [39.5, 21.5], 6),
            [42, 14],
          ],
          widthScale: 0.95,
        },
        // Pushpin top head cap — richly filled to match the stem seamlessly
        {
          role: 'accent-shade',
          shadeTrans: 24,
          shadeGrad: 65,
          pts: (() => {
            const cap = makeEllipse(45.5, 11.2, 5.2, 4.4);
            return [...cap, cap[0]];
          })(),
          widthScale: 0.95,
        },
        // Inner pushpin ring highlight (cleanly closed loop)
        {
          role: 'detail',
          pts: (() => {
            const inner = makeEllipse(45.9, 10.9, 2.0, 1.7);
            return [...inner, inner[0]];
          })(),
          widthScale: 0.72,
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
      // Aspect-true narrow, balanced lightbulb silhouette (aspectW=330, aspectH=210 => ar=1.5714)
      const ar = 330 / 210;
      const bulbCx = 74;
      const sx = (dx: number) => bulbCx + dx / ar;
      const bulbPts: Array<[number, number]> = [
        [sx(-4.4), 34.2],
        ...sampleCubic([sx(-4.4), 34.2], [sx(-4.8), 29.5], [sx(-9.4), 26.8], [sx(-9.4), 21.5], 8),
        ...sampleCubic([sx(-9.4), 21.5], [sx(-9.4), 13.4], [sx(9.4), 13.4], [sx(9.4), 21.5], 12),
        ...sampleCubic([sx(9.4), 21.5], [sx(9.4), 26.8], [sx(4.8), 29.5], [sx(4.4), 34.2], 8),
        [sx(-4.4), 34.2],
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
        // Delicate filament inside bulb
        {
          role: 'detail',
          pts: [
            [sx(-2.3), 33.8],
            [sx(-3.0), 23.8],
            [sx(-1.3), 25.0],
            [sx(0), 23.5],
            [sx(1.3), 25.0],
            [sx(3.0), 23.8],
            [sx(2.3), 33.8],
          ],
          widthScale: 0.62,
        },
        // Screw base threads
        { role: 'detail', pts: [[sx(-3.8), 36.2], [sx(3.8), 36.2]], widthScale: 0.85 },
        { role: 'detail', pts: [[sx(-3.0), 38.3], [sx(3.0), 38.3]], widthScale: 0.85 },
        { role: 'detail', pts: [[sx(-1.8), 40.3], [sx(1.8), 40.3]], widthScale: 0.85 },
        { role: 'detail', pts: [[sx(0), 40.3], [sx(0), 42]], widthScale: 0.85 },
      ];
      // 9 crisp aspect-true radial light rays around the bulb
      const rayAngles = [-165, -142, -118, -90, -62, -38, -15, 12, 168];
      for (const deg of rayAngles) {
        const rad = (deg * Math.PI) / 180;
        const r1 = 12.2;
        const r2 = deg === -90 || deg === -142 || deg === -38 ? 17.4 : 15.8;
        parts.push({
          role: 'detail',
          pts: [
            [sx(Math.cos(rad) * r1), 21.5 + Math.sin(rad) * r1],
            [sx(Math.cos(rad) * r2), 21.5 + Math.sin(rad) * r2],
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

    // 24. Wide Page-Title Header: Elegant Full-Width Ribbon Banner (620×98 — sleek petite swallowtails)
    case 'header-ribbon-banner-wide':
      return [
        // Left petite swallowtail (flush with center left edge x=8)
        {
          role: 'body',
          pts: [
            [2, 33],
            [8, 33],
            [8, 69],
            [10.5, 85],
            [2, 85],
            [4.4, 59],
            [2, 33],
          ],
        },
        // Right petite swallowtail (flush with center right edge x=92)
        {
          role: 'body',
          pts: [
            [92, 33],
            [98, 33],
            [95.6, 59],
            [98, 85],
            [89.5, 85],
            [92, 69],
            [92, 33],
          ],
        },
        // Left petite fold shadow triangle
        {
          role: 'accent-solid',
          pts: [
            [8, 69],
            [10.5, 69],
            [10.5, 85],
            [8, 69],
          ],
          widthScale: 0.65,
        },
        // Right petite fold shadow triangle
        {
          role: 'accent-solid',
          pts: [
            [92, 69],
            [89.5, 69],
            [89.5, 85],
            [92, 69],
          ],
          widthScale: 0.65,
        },
        // Huge spacious center title banner box (x=8..92)
        {
          role: 'body',
          pts: [
            [8, 12],
            [92, 12],
            [92, 69],
            [8, 69],
            [8, 12],
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
        // Main fillable starburst cloud (variable fill color + gradient)
        { role: 'body', pts: burstPts },
        // Solid crisp black exclamation wedge
        {
          role: 'accent-solid',
          pts: [
            [50, 12],
            [68, 16],
            [54, 48],
            [44, 45],
            [50, 12],
          ],
          widthScale: 0.9,
        },
        // Solid crisp black exclamation dot
        {
          role: 'accent-solid',
          pts: dotPts,
          widthScale: 0.9,
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

    // 27. Horizontal 3D Pushpin (single unified silhouette + clean 3D contour lines, NO X-ray overlap, NO motion lines)
    case 'pushpin-horizontal': {
      return [
        // Sleek tapered needle stopping exactly flush on collar left contour (x=36.45) — role: 'body' so transparent mode clears it too
        {
          role: 'body',
          pts: [
            [8, 55.5],
            [16, 51.2],
            [36.45, 48.8],
            [36.45, 53.6],
            [16.5, 57.4],
            [8, 55.5],
          ],
          widthScale: 0.85,
        },
        // Single unified fillable plastic pushpin silhouette (collar + neck + cap — ZERO inner crossing lines)
        {
          role: 'body',
          pts: [
            [40, 26],
            ...sampleCubic([40, 26], [52, 22], [58, 28], [60.5, 35], 8),
            [73, 32],
            ...sampleQuad([73, 32], [75, 22], [80, 19], 5),
            ...sampleCubic([80, 19], [91, 17], [96, 36], [92.5, 53], 10),
            ...sampleCubic([92.5, 53], [89.5, 65], [81, 69], [75, 63], 8),
            ...sampleQuad([75, 63], [73.5, 60], [73.5, 56], 4),
            [61.5, 61.5],
            ...sampleCubic([61.5, 61.5], [58, 76], [46, 84], [39, 73], 10),
            ...sampleCubic([39, 73], [35.5, 62], [35.5, 37], [40, 26], 10),
          ],
        },
        // Clean 3D contour seam where neck enters collar
        {
          role: 'detail',
          pts: [
            [56.5, 36],
            ...sampleQuad([56.5, 36], [52.5, 49], [57, 61], 7),
          ],
          widthScale: 0.85,
        },
        // Clean 3D contour seam where neck meets cap bevel
        {
          role: 'detail',
          pts: [
            [73, 32],
            ...sampleQuad([73, 32], [71, 45], [73.5, 56], 7),
          ],
          widthScale: 0.85,
        },
        // Clean 3D front cap face arc
        {
          role: 'detail',
          pts: [
            [81.5, 19.5],
            ...sampleCubic([81.5, 19.5], [75.5, 34], [76.5, 54], [83, 66], 10),
          ],
          widthScale: 0.82,
        },
      ];
    }

    // 28. Angled 3D Pushpin pointing down-left (single unified silhouette + clean 3D contour lines, NO motion lines)
    case 'pushpin-angled': {
      return [
        // Sleek tapered needle pointing down-left, stopping exactly flush on lower flange outer curve — role: 'body' so transparent mode clears it too
        {
          role: 'body',
          pts: [
            [26, 94],
            [32.5, 79.5],
            [42.4, 63.65],
            [46.9, 65.35],
            [35.5, 83.5],
            [26, 94],
          ],
          widthScale: 0.85,
        },
        // Single unified fillable plastic pushpin silhouette (flange + stem + cap — ZERO inner crossing lines)
        {
          role: 'body',
          pts: [
            [28, 49],
            ...sampleQuad([28, 49], [33, 41], [43, 41.5], 6),
            [55.5, 22],
            ...sampleCubic([55.5, 22], [49, 15], [53, 7], [63, 9.5], 8),
            ...sampleCubic([63, 9.5], [76, 13], [88, 20], [85.5, 27.5], 10),
            ...sampleQuad([85.5, 27.5], [82, 31.5], [74, 31], 6),
            [63, 52],
            ...sampleCubic([63, 52], [72, 59], [71, 70], [58, 68.5], 10),
            ...sampleCubic([58, 68.5], [44, 65.5], [24, 57], [28, 49], 10),
          ],
        },
        // Clean 3D seam where stem enters lower flange
        {
          role: 'detail',
          pts: [
            [43, 41.5],
            ...sampleQuad([43, 41.5], [50.5, 49], [62, 52.5], 7),
          ],
          widthScale: 0.85,
        },
        // Clean 3D cap underside lip
        {
          role: 'detail',
          pts: [
            [55.5, 22],
            ...sampleQuad([55.5, 22], [63, 28], [73.5, 31], 7),
          ],
          widthScale: 0.85,
        },
        // Subtle top cap highlight ridge
        {
          role: 'detail',
          pts: [
            [60, 13],
            ...sampleQuad([60, 13], [69, 16.5], [78, 21.5], 6),
          ],
          widthScale: 0.75,
        },
      ];
    }

    // 29. Curved 3D Sketch Arrow with Black Hatched Extrusion & Variable Fill Color
    case 'arrow-curved-3d-hatched': {
      // Smooth curved arrow edges
      const topShaft = sampleQuad([12, 58], [32, 34], [64, 27], 12);
      const innerHeadRight = sampleQuad([91, 20], [82, 35], [77, 52], 8);
      const botShaft = sampleQuad([70, 38], [45, 48], [33, 81], 12);

      // 3D underside outer contours (shifted down-right along extrusion vector)
      const shaftExtrudeOuter = botShaft.map(([x, y], i) => {
        const t = i / (botShaft.length - 1); // 0 near head, 1 at tail
        const dx = 2.5 + t * 5.2;
        const dy = 5.5 + t * 1.6;
        return [x + dx, y + dy] as [number, number];
      });
      const headExtrudeOuter = innerHeadRight.map(([x, y]) => [x + 5.2, y + 4.2] as [number, number]);

      const parts: RawVectorPart[] = [
        // 3D underside of curved shaft (subtle shaded fill in chosen color)
        {
          role: 'accent-shade',
          shadeTrans: 58,
          shadeGrad: 65,
          pts: [
            [70, 38],
            ...botShaft,
            ...shaftExtrudeOuter.slice().reverse(),
            [70, 38],
          ],
          widthScale: 0.9,
        },
        // 3D underside of arrowhead right edge (subtle shaded fill)
        {
          role: 'accent-shade',
          shadeTrans: 58,
          shadeGrad: 65,
          pts: [
            [91, 20],
            ...innerHeadRight,
            ...headExtrudeOuter.slice().reverse(),
            [91, 20],
          ],
          widthScale: 0.9,
        },
        // Main fillable curved arrow face (always crisp black outline, variable fill + gradient)
        {
          role: 'body',
          pts: [
            [12, 58],
            ...topShaft,
            [57, 17],
            [91, 20],
            ...innerHeadRight,
            [70, 38],
            ...botShaft,
            [12, 58],
          ],
        },
      ];

      // Crisp black hatch lines across the curved shaft 3D extrusion
      for (let i = 1; i < botShaft.length - 1; i++) {
        parts.push({
          role: 'detail',
          pts: [botShaft[i], shaftExtrudeOuter[i]],
          widthScale: 0.65,
        });
      }
      // Crisp black hatch lines across the arrowhead 3D extrusion
      for (let i = 1; i < innerHeadRight.length - 1; i++) {
        parts.push({
          role: 'detail',
          pts: [innerHeadRight[i], headExtrudeOuter[i]],
          widthScale: 0.65,
        });
      }
      return parts;
    }

    // 30. Hanging Ceiling Lightbulb with Long Vertical Cord, Curly Filament & Rays
    case 'hanging-lightbulb': {
      const ar = 105 / 310; // ~0.339 (tall)
      // Bulb glass silhouette hanging down (y=69..90)
      const bulbGlass: Array<[number, number]> = [
        [37, 69],
        ...sampleCubic([37, 69], [36, 74], [25, 77], [25, 82.5], 8),
        ...sampleCubic([25, 82.5], [25, 91.5], [75, 91.5], [75, 82.5], 12),
        ...sampleCubic([75, 82.5], [75, 77], [64, 74], [63, 69], 8),
        [37, 69],
      ];
      // Screw socket cap (y=61.5..69)
      const socketCap: Array<[number, number]> = [
        [43, 61.5],
        [57, 61.5],
        ...sampleQuad([57, 61.5], [64, 63], [63, 69], 5),
        [37, 69],
        ...sampleQuad([37, 69], [36, 63], [43, 61.5], 5),
      ];
      const parts: RawVectorPart[] = [
        // Long vertical hanging cord (y=2..61.5)
        {
          role: 'detail',
          pts: [
            [50, 2],
            [50, 61.5],
          ],
          widthScale: 1.05,
        },
        // Small cord-entry collar
        {
          role: 'detail',
          pts: [
            [45.5, 61.5],
            [45.5, 59.8],
            [54.5, 59.8],
            [54.5, 61.5],
          ],
          widthScale: 0.85,
        },
        // Main fillable hanging bulb glass (always black outline, variable fill + gradient)
        {
          role: 'body',
          pts: bulbGlass,
        },
        // Shaded screw socket cap
        {
          role: 'accent-shade',
          shadeTrans: 58,
          shadeGrad: 60,
          pts: socketCap,
          widthScale: 0.9,
        },
        // Socket screw thread lines
        { role: 'detail', pts: [[38.5, 64.2], [61.5, 64.2]], widthScale: 0.72 },
        { role: 'detail', pts: [[37.5, 66.6], [62.5, 66.6]], widthScale: 0.72 },
        // Cute curly filament inside the hanging bulb
        {
          role: 'detail',
          pts: [
            [44, 69],
            [46, 80.5],
            ...sampleCubic([46, 80.5], [36, 79], [36, 83.5], [44.5, 83], 8),
            ...sampleCubic([44.5, 83], [52, 82.5], [51, 79], [48.5, 81.5], 6),
            ...sampleCubic([48.5, 81.5], [56, 84], [62, 82.5], [55.5, 80.5], 8),
            [56, 69],
          ],
          widthScale: 0.7,
        },
        // Subtle inner glass reflection highlight arc on bottom-right
        {
          role: 'detail',
          pts: [
            [68.5, 83],
            ...sampleQuad([68.5, 83], [67, 86.5], [59.5, 88], 6),
          ],
          widthScale: 0.72,
        },
      ];
      // 9 crisp radial light rays around bottom & sides of the bulb (aspect-true!)
      const rayAngles = [160, 180, 140, 115, 90, 65, 40, 20, 0];
      for (const deg of rayAngles) {
        const rad = (deg * Math.PI) / 180;
        const r1X = 33;
        const r2X = deg === 90 || deg === 180 || deg === 0 ? 45 : 43;
        parts.push({
          role: 'detail',
          pts: [
            [50 + Math.cos(rad) * r1X, 82.5 + Math.sin(rad) * r1X * ar],
            [50 + Math.cos(rad) * r2X, 82.5 + Math.sin(rad) * r2X * ar],
          ],
          widthScale: 0.8,
        });
      }
      return parts;
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
    key === 'pushpin-angled' ||
    key === 'arrow-curved-3d-hatched' ||
    key === 'hanging-lightbulb';
  const fillTint = isDarkDefault
    ? key === 'lightning-triple-vertical' || key === 'badge-exclamation-burst' || key === 'hanging-lightbulb'
      ? '#facc15'
      : key === 'badge-exclamation-shadow' || key === 'pushpin-horizontal' || key === 'pushpin-angled'
      ? '#ef4444'
      : key === 'arrow-curved-3d-hatched'
      ? '#3b82f6'
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
    key === 'pushpin-angled' ||
    key === 'arrow-curved-3d-hatched' ||
    key === 'hanging-lightbulb';
  const resolvedFillHex =
    isDarkColor && (key === 'lightning-triple-vertical' || key === 'badge-exclamation-burst' || key === 'hanging-lightbulb')
      ? '#facc15'
      : isDarkColor && (key === 'badge-exclamation-shadow' || key === 'pushpin-horizontal' || key === 'pushpin-angled')
      ? '#ef4444'
      : isDarkColor && key === 'arrow-curved-3d-hatched'
      ? '#3b82f6'
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
