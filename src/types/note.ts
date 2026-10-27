export type ToolType =
  | 'pen'
  | 'pencil'
  | 'highlighter'
  | 'eraser'
  | 'shape'
  | 'lasso'
  | 'magnetic-lasso'
  | 'direct-node'
  | 'text'
  | 'image'
  | 'tape'
  | 'laser'
  | 'ruler'
  | 'pan';

export type PenSubType = 'fountain' | 'ballpoint' | 'brush';
export type EraserSubType = 'stroke' | 'precision' | 'highlighter-only';
export type ShapePresetType =
  | 'auto'
  | 'line'
  | 'arrow'
  | 'double-arrow'
  | 'rectangle'
  | 'parallelogram'
  | 'trapezoid'
  | 'ellipse'
  | 'triangle'
  | 'arc'
  | 'parabola'
  | 'hyperbola'
  | 'sine'
  | 'cosine'
  | 'cuboid'
  | 'cylinder'
  | 'sphere'
  | 'pyramid'
  | 'axes'
  | 'wave-axes'
  | 'resistor'
  | 'spring'
  | 'bulb'
  | 'battery'
  | 'voltage-source'
  | 'inclined-plane'
  | 'switch'
  | 'fan';

export type LineStyleType = 'solid' | 'dashed' | 'dotted';
export type FillStyleType = 'none' | 'solid' | 'hatching' | 'gradient';
export type PaperTemplateType = 'grid' | 'ruled' | 'dotted' | 'cornell' | 'blank' | 'dark-grid';

export interface BezierPoint {
  x: number;
  y: number;
  cx?: number;
  cy?: number;
  inDx?: number; // Incoming Illustrator Bézier handle offset from x
  inDy?: number; // Incoming Illustrator Bézier handle offset from y
  outDx?: number; // Outgoing Illustrator Bézier handle offset from x
  outDy?: number; // Outgoing Illustrator Bézier handle offset from y
  smooth?: boolean; // Symmetrical smooth arc node when true
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
  twist?: number; // Apple Pencil Pro barrel roll (0-359) or 777 when Bézier handle is manually locked
}

export interface StrokeObject {
  id: string;
  tool: 'pen' | 'pencil' | 'highlighter';
  penType?: PenSubType;
  color: string;
  fillColor?: string;
  fillStyle?: FillStyleType;
  fillTransparency?: 0 | 25 | 45 | 90 | 20 | 50; // Fill transparency percentage: 90% (very transparent, default), 45% (medium), 25% (more solid), 0% (opaque)
  width: number;
  opacity: number;
  lineStyle?: LineStyleType;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  points: BezierPoint[];
  layerId: string;
  groupId?: string;
  isShape?: boolean;
  shapeType?: string;
  keyNodeIndices?: number[]; // Sparse key-node indices (2 endpoints + distinct peaks/vertices) for freehand Direct-Node editing
  rotation?: number; // Rotation angle in radians for oriented selection bounding box
  zOrder?: number; // Unified Z-Order shared across both Images and Strokes/Shapes
  switchClosed?: boolean; // For circuit switches ('switch'): true = closed (green ON), false = open (red OFF)
}

export type TextFontStyle =
  | 'sans'
  | 'calligraphic'
  | 'neohellenic'
  | 'handwritten'
  | 'marker'
  | 'mansalva';

export interface TextObject {
  id: string;
  x: number;
  y: number;
  boxWidth?: number;
  boxHeight?: number;
  text: string;
  latex?: string;
  isMath?: boolean;
  color: string;
  fontSize: number;
  bold?: boolean;
  fontFamily?: TextFontStyle;
  layerId: string;
  groupId?: string;
}

export interface ImageObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth?: number;
  naturalHeight?: number;
  rotation?: number; // Rotation in degrees
  dataUrl: string;
  originalDataUrl?: string;
  clipPolygon?: { x: number; y: number }[]; // Freehand or Magnetic Lasso crop mask (relative 0..width, 0..height)
  transparentBg?: boolean;
  layerId: string;
  groupId?: string;
  zOrder?: number; // Unified Z-Order shared across both Images and Strokes/Shapes
}

export interface TapeObject {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  color: string;
  revealed: boolean;
  layerId: string;
}

export interface LayerItem {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

export interface NotePage {
  id: string;
  title: string;
  tags?: string[];
  template: PaperTemplateType;
  orientation?: 'portrait' | 'landscape';
  customWidth?: number; // Exact page width for standalone imported PDFs/images (no letterbox border)
  customHeight?: number; // Exact page height for standalone imported PDFs/images (no letterbox border)
  rotation?: number; // 0, 90, 180, 270
  backgroundDataUrl?: string; // Full-page PDF page or imported JPG/PNG background to write on top of
  layers: LayerItem[];
  strokes: StrokeObject[];
  shapes?: StrokeObject[];
  texts: TextObject[];
  images: ImageObject[];
  tapes: TapeObject[];
}

export interface Notebook {
  id: string;
  title: string;
  folder: string;
  tags?: string[];
  coverColor: string;
  updatedAt: string;
  sourceFormat?: '.goodnotes' | '.bestnotes' | '.bestNotes';
  pages: NotePage[];
}

// Exact ISO A4 aspect ratio (58 / 41 = 1.414634 vs 297 / 210 = 1.414285, i.e. 99.98% A4)
// with an exact integer grid of 41 x 58 squares of 23x23px (0px remainder on right & bottom in Portrait & Landscape!)
export const A4_GRID_STEP_PX = 23;
export const A4_SHORT_PX = 41 * A4_GRID_STEP_PX; // 943px
export const A4_LONG_PX = 58 * A4_GRID_STEP_PX; // 1334px

export function getPageLogicalWidth(page?: NotePage): number {
  if (page?.customWidth && page.customWidth >= 200) return page.customWidth;
  return page?.orientation === 'landscape' ? A4_LONG_PX : A4_SHORT_PX;
}

export function getPageLogicalHeight(page?: NotePage): number {
  if (page?.customHeight && page.customHeight >= 200) return page.customHeight;
  return page?.orientation === 'landscape' ? A4_SHORT_PX : A4_LONG_PX;
}

