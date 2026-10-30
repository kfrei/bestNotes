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
  | 'hooked-weight'
  | 'spring-pointer'
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
  originalCircuitType?: 'bulb' | 'fan'; // Remembers if a converted 'resistor' originated from a 'bulb' or a 'fan'
  circuitBox?: {
    cx: number;
    termY: number;
    pictorialW: number;
    pictorialH: number;
    schematicW: number;
    schematicH: number;
  };
  springSupport?: {
    supportStrokeId: string;
    fixedEnd: 'start' | 'end';
  };
  attachedToWeightId?: string; // ID of the parent weight directly above this weight in a vertical hook-to-hook chain
  attachedToSpringId?: string; // ID of the spring stroke ('spring') whose free end this pointer needle ('spring-pointer' or 'arrow') is attached to
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

export interface CircuitSimConfig {
  id: string;
  name: string; // e.g. 'sim01', 'sim02'
  strokeIds: string[]; // Strokes belonging to this circuit simulation
}

export interface SpringGraphBox {
  visible: boolean;
  x?: number; // Custom canvas logical X if dragged by user
  y?: number; // Custom canvas logical Y if dragged by user
  width?: number;
  height?: number;
  customMoved?: boolean;
}

export interface HookeMeasurementRow {
  id: string;
  weightsCount: number; // e.g. 0, 1, 2, 3, 4
  forceN: number; // F_ελ in N (e.g. 0, 1, 2, 3, 4)
  lengthMm: number; // Total spring length l in mm (matching ruler 1:1)
  deltaLMm: number; // Elongation/compression Δl = |l - l0| in mm (matching ruler 1:1)
  plotted?: boolean; // Whether the user toggled the dot in the last column of the table to plot this point on the diagram
  springStrokeId?: string; // Associated spring stroke ID on the page
  pointerColor?: string; // Color of the attached pointer arrow
}

export interface SpringSimConfig {
  id: string;
  name: string; // e.g. 'ελ01', 'ελ02'
  naturalSpringStrokeId?: string; // Reference natural length (l0) spring stroke ID
  eqSpringStrokeId: string; // Equilibrium / oscillating spring stroke ID
  massStrokeId: string; // Attached mass block/sphere stroke ID
  supportStrokeId?: string; // Ceiling / floor / wall / incline line stroke ID
  fixedEnd: 'start' | 'end'; // Which end of eqSpringStroke is fixed to support
  naturalLengthPx: number; // l0 in canvas px
  baseSpringWidthPx: number; // Transverse width of spring coils
  baseMassWidthPx: number; // Reference width of mass block at m = 1.0
  baseMassHeightPx: number; // Reference height of mass block at m = 1.0
  mass: number; // Mass multiplier m (0.4 to 2.5, default 1.0)
  stiffness: number; // Spring constant k multiplier (0.5 to 2.5, default 1.0)
  amplitudePx: number; // Oscillation amplitude A in canvas px (default 55)
  initialPhaseMode: 'eq' | 'eqDown' | 'plusA' | 'minusA' | 'custom'; // t=0 starting position & initial velocity direction
  customInitialPhaseRad?: number;
  showNaturalSpring: boolean; // Show/hide natural length l0 spring
  showPositionScale?: boolean; // Show/hide left vertical +A / 0 / -A position scale & pointer arrow
  showAmplitudeLines: boolean; // Show black dashed Θ.Ι. + 2 blue dashed +A/-A lines with blue square handles
  showForceVectors: boolean; // Show dynamic force vectors (W, F_el, ΣF)
  hookeMeasurements?: HookeMeasurementRow[]; // Recorded rows for Hooke's Law study (F_ελ - Δl)
  hookePlottedWeights?: number[]; // Weights counts (0, 1, 2, 3, 4...) whose dot is toggled ON (blue) in the canvas table
  hookeLineDrawn?: boolean; // Whether the green checkbox on the diagram is checked to draw the F_ελ = k·Δl line
  showHookeCanvasTable?: boolean; // Show the F_ελ - Δl table of values on the canvas
  graphs: {
    xt: SpringGraphBox; // Position - Time x(t) [Red #ef4444]
    vt: SpringGraphBox; // Velocity - Time v(t) [Green #10b981]
    at: SpringGraphBox; // Acceleration - Time a(t) [Purple #8b5cf6]
    hooke?: SpringGraphBox; // Hooke's Law F_ελ - Δl [Blue #0284c7]
  };
}

export type ForceSimMode = 'analysis' | 'synthesis' | 'incline' | 'pendulum';

export interface ForceSimConfig {
  id: string;
  name: string; // e.g. 'δυν01', 'δυν02'
  mode: ForceSimMode;
  originX: number; // Canvas logical X (origin of F/F1+F2, incline base start X, or pendulum pivot X)
  originY: number; // Canvas logical Y
  // Linked strokes on the page (so user can draw/move/delete them with their own tools!)
  primaryStrokeId?: string; // 'analysis' -> F arrow; 'synthesis' -> F1 arrow; 'incline' -> incline-wedge; 'pendulum' -> rod line
  secondaryStrokeId?: string; // 'synthesis' -> F2 arrow; 'incline' -> incline-block; 'pendulum' -> bob circle/sphere
  supportStrokeId?: string; // optional ceiling/floor support stroke
  // Mode 1: 'analysis' (Ανάλυση Δύναμης σε Συνιστώσες F -> Fx, Fy)
  fxUnits?: number; // default 8 (in grid units, 1 unit = A4_GRID_STEP_PX = 23px)
  fyUnits?: number; // default 6
  snapToGrid?: boolean; // default true (integer Newtons on grid like forceanalysisinteger, or false for 0.1N floats)
  // Mode 2: 'synthesis' (Σύνθεση Δυνάμεων F1 + F2 = ΣF)
  f1xUnits?: number; // default 8
  f1yUnits?: number; // default 0
  f2xUnits?: number; // default 0
  f2yUnits?: number; // default 6
  synthesisStepMode?: boolean; // false = Άμεση, true = Βηματική
  // Mode 3: 'incline' (Κεκλιμένο Επίπεδο)
  inclineAngleDeg?: number; // default 30 (range 15..60)
  inclineLenPx?: number; // default 360
  // Mode 4: 'pendulum' (Εκκρεμές)
  rodLengthPx?: number; // default 230
  pendulumAngleRad?: number; // default Math.PI / 4
  pendulumAngVel?: number; // default 0
  isPaused?: boolean; // default false (swinging)
  showTrajectory?: boolean; // default false
  // Shared display / step-by-step analysis state
  showForces?: boolean; // for incline (B, N) & pendulum (B, T)
  showResultant?: boolean; // for synthesis (ΣF) & pendulum (ΣF)
  anMode?: 'none' | 'F' | 'B' | 'T'; // active analysis breakdown mode
  step?: number; // 0..6 (or 0..3 for synthesis)
  showCalc?: boolean; // Show Υπολογισμοί card on canvas
  calcBoxPos?: { x: number; y: number }; // Optional custom position for Υπολογισμοί card
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
  circuitSims?: CircuitSimConfig[];
  activeCircuitSimId?: string;
  springSims?: SpringSimConfig[];
  activeSpringSimId?: string;
  forceSims?: ForceSimConfig[];
  activeForceSimId?: string;
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

