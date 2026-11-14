/**
 * BestNotes Palette & Color System
 * Domain 4: Colors, Thickness Presets, and Color Similarity Algorithms
 */

export const PRESET_COLORS: string[] = [
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
  '#4f46e5',
  '#64748b',
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
