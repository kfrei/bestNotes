/**
 * BestNotes Canvas Tools Architecture
 * Domain 4: Master Index Facade
 * 
 * Provides unified access to:
 * - Tool types and categories (Pen, Pencil, Highlighter, Eraser, Lasso, Shapes, Ruler, Laser)
 * - Color palettes, thickness presets, and color algorithms (PRESET_COLORS, DEFAULT_COLOR_SLOTS, APP_NAVY)
 * - Tool catalog and descriptors
 * - Geometric algorithms and stroke bezier spline helpers
 */

export * from './types';
export * from './palette/colorPresets';
export * from './tools/toolCatalog';
export * from './geometry';
