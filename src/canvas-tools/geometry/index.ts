/**
 * BestNotes Canvas Geometry & Drawing Algorithms Facade
 * Domain 4: Bezier Splines, Control Points, Smoothing, Math Graph Stroke Computation, and Snapshots
 */

export {
  getCubicSegmentControlPoints,
  recomputeAutoSmoothHandles,
  reverseBezierPointsExact,
  convertOpenStrokeToBezierSplinePoints,
  ensureWaveBezierPoints,
  buildMathGraphStrokesFromEquation,
  prepareMathGraphStrokesForAnimation,
  computeMathGraphAnimationFrameWithPen,
  splitAndCleanMathLatexLines,
  renderPageStrokesToSnapshotDataUrl,
  analyzeImageForSmartSketchAnimation,
  renderSmartSketchOverlayFrame,
  SmartSketchAudioEngine,
} from '../../utils/geometryAndAlgorithms';

export type {
  WaveTwoVarDetection,
} from '../../utils/geometryAndAlgorithms';
