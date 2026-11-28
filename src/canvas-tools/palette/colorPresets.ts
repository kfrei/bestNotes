/**
 * BestNotes Palette & Color System
 * Domain 4: Colors, Thickness Presets, and Color Similarity Algorithms
 */

// 6×4 Structured Color Palette:
// Col 1 = 5 primary toolbar colors + Orange; Cols 2→4 = Dark → Airy Mid → Soft Light shades per family
export const PRESET_COLORS: string[] = [
  // Row 1: Black & Grays
  '#111827',
  '#475569',
  '#94a3b8',
  '#cbd5e1',
  // Row 2: Red → Burgundy → Bright Rose → Soft Blush Pink
  '#dc2626',
  '#881337',
  '#ec4899',
  '#fbcfe8',
  // Row 3: Blue → Navy → Bright Teal → Soft Sky Blue
  '#2563eb',
  '#1e3a8a',
  '#14b8a6',
  '#7dd3fc',
  // Row 4: Green → Forest → Bright Mint → Soft Pastel Mint
  '#16a34a',
  '#14532d',
  '#34d399',
  '#bbf7d0',
  // Row 5: Purple → Deep Plum → Soft Periwinkle → Pastel Lilac
  '#9333ea',
  '#4c1d95',
  '#818cf8',
  '#d8b4fe',
  // Row 6: Orange → Golden Yellow → Bright Canary → Soft Sunny Yellow
  '#f97316',
  '#f59e0b',
  '#fde047',
  '#fef08a',
];

// 5 Primary Color Memories (indices 0..4) + 5 Most Recent Colors (indices 5..9, revealed on horizontal scroll)
export const DEFAULT_COLOR_SLOTS: string[] = [
  '#111827',
  '#dc2626',
  '#2563eb',
  '#16a34a',
  '#9333ea',
  '#ea580c',
  '#0284c7',
  '#eab308',
  '#db2777',
  '#0d9488',
];

// Dedicated soft translucent-style pastel palette for the Highlighter tool:
// Page 1 (indices 0..4): Classic Yellow, Soft Green, Soft Sky Blue, Soft Pink, Soft Peach
// Page 2 (indices 5..9): Soft Lilac, Soft Mint/Teal, Soft Coral, Soft Lime, Soft Cool Gray
export const HIGHLIGHTER_COLOR_SLOTS: string[] = [
  '#fff000', // Κλασικό Κίτρινο Καναρινί
  '#86efac', // Απαλό Πράσινο
  '#7dd3fc', // Απαλό Σιέλ
  '#f9a8d4', // Απαλό Ροζ
  '#fdba74', // Απαλό Πορτοκαλί
  '#d8b4fe', // Απαλό Λιλά
  '#5eead4', // Απαλό Τυρκουάζ
  '#fda4af', // Απαλό Κοραλί
  '#bef264', // Απαλό Λεμονί
  '#cbd5e1', // Απαλό Γκρι
];

export const THICKNESS_PRESETS: number[] = [
  1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.5, 8.0, 10.0, 14.0, 20.0,
];

// Central Navy Blue Theme Tokens
export const APP_NAVY = '#234978';
export const APP_NAVY_HOVER = '#1c3c63';

export function parseHexColor(hex: string): [number, number, number] {
  let clean = (hex || '').trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map((ch) => ch + ch).join('');
  }
  const n = parseInt(clean, 16);
  if (isNaN(n) || clean.length < 6) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function areColorsSimilar(c1: string, c2: string, threshold = 26): boolean {
  if (!c1 || !c2) return false;
  if (c1.toLowerCase() === c2.toLowerCase()) return true;
  const [r1, g1, b1] = parseHexColor(c1);
  const [r2, g2, b2] = parseHexColor(c2);
  const rMean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  const dist = Math.sqrt(
    (2 + rMean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rMean) / 256) * db * db
  );
  return dist < threshold;
}
