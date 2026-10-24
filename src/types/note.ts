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
  | 'resistor'
  | 'spring';

export type LineStyleType = 'solid' | 'dashed' | 'dotted';
export type FillStyleType = 'none' | 'solid' | 'hatching' | 'gradient';
export type PaperTemplateType = 'grid' | 'ruled' | 'dotted' | 'cornell' | 'blank' | 'dark-grid';

export interface BezierPoint {
  x: number;
  y: number;
  cx?: number;
  cy?: number;
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
  twist?: number; // Apple Pencil Pro barrel roll (0-359)
}

export interface StrokeObject {
  id: string;
  tool: 'pen' | 'pencil' | 'highlighter';
  penType?: PenSubType;
  color: string;
  fillColor?: string;
  fillStyle?: FillStyleType;
  fillTransparency?: 20 | 50 | 90; // Fill transparency percentage: 90% (very transparent, default), 50% (medium), 20% (almost solid)
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
}

export interface TextObject {
  id: string;
  x: number;
  y: number;
  text: string;
  latex?: string;
  isMath?: boolean;
  color: string;
  fontSize: number;
  bold?: boolean;
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
  template: PaperTemplateType;
  orientation?: 'portrait' | 'landscape';
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
  coverColor: string;
  updatedAt: string;
  sourceFormat?: '.goodnotes' | '.bestnotes';
  pages: NotePage[];
}
