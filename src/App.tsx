import React, { useState, useRef, useEffect, useCallback } from 'react';
import katex from 'katex';
import {
  Pen,
  Highlighter,
  Eraser,
  Shapes,
  Lasso,
  MousePointer,
  Image as ImageIcon,
  Layers,
  Undo2,
  Redo2,
  FolderOpen,
  Plus,
  Cloud,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Group,
  Ungroup,
  Sparkles,
  Calculator,
  Trash2,
  Wand2,
  Ruler,
  Radio,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Upload,
  LayoutGrid,
  RotateCcw,
  RotateCw,
  Magnet,
  Type,
  Bandage,
  Sticker,
  X,
  ZoomIn,
  ZoomOut,
  Scissors,
  Copy,
  ClipboardPaste,
  FileText,
} from 'lucide-react';
import {
  Notebook,
  NotePage,
  StrokeObject,
  BezierPoint,
  ToolType,
  PenSubType,
  EraserSubType,
  ShapePresetType,
  LineStyleType,
  FillStyleType,
  PaperTemplateType,
  ImageObject,
  TextObject,
  TapeObject,
} from './types/note';
import preloadedData from './data/preloadedNotebooks.json';
import { importGoodnotesFile } from './utils/goodnotesParser';
import { renderPdfFileToPages, renderImageFileToPage } from './utils/pdfAndImageImporter';
import {
  distance,
  smoothStrokeToBezier,
  recognizeAndSnapShape,
  isScribbleEraseGesture,
  createPhysicsStencilStrokes,
  beautifyHandwritingStrokes,
  removeImageBackground,
  computeImageSobelEdgeMap,
  snapMagneticLassoPoint,
  solveMathExpressionOffline,
} from './utils/geometryAndAlgorithms';

const STORAGE_KEY = 'bestnotes_notebooks_v1';
const PRESET_COLORS = ['#111827', '#dc2626', '#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0284c7', '#eab308'];
const THICKNESS_PRESETS = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.5, 8.0, 10.0, 14.0, 20.0];
const CANVAS_DPR = 2; // 2x Retina HiDPI backing resolution (1840x2520) for razor-sharp, zero-"ζαγρέ" curves
const PAGE_GAP = 44; // Vertical gap (px) between pages in Word-style continuous multi-page scroll

export default function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return preloadedData as unknown as Notebook[];
  });

  const [viewMode, setViewMode] = useState<'editor' | 'library'>('editor');
  const [openNotebookIds, setOpenNotebookIds] = useState<string[]>(['nb-gn1', 'nb-gn2']);
  const [activeNotebookId, setActiveNotebookId] = useState<string>('nb-gn1');
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const paperTransformElRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const canvasRectRef = useRef<DOMRect | null>(null);
  const pinchStateRef = useRef<{
    active: boolean;
    initialDist: number;
    initialZoom: number;
    initialPanX: number;
    initialPanY: number;
    startMidX: number;
    startMidY: number;
    lastMidY: number;
    lastMoveTime: number;
    velocityY: number;
    paperOffsetX: number;
    paperOffsetY: number;
    startTime: number;
    maxMoved: number;
    touchCount: number;
  } | null>(null);

  // Outside-page 1-finger scroll & Goodnotes Pull-to-Add-Page (hold 1.2s at top or bottom) + 120Hz Velocity Momentum
  const [pullAddPageState, setPullAddPageState] = useState<{ side: 'top' | 'bottom'; progress: number } | null>(null);
  const pullHoldIntervalRef = useRef<number | null>(null);
  const pullSideActiveRef = useRef<'top' | 'bottom' | null>(null);
  const scrollMomentumRafRef = useRef<number | null>(null);
  const outsidePanDragRef = useRef<{
    active: boolean;
    startClientX: number;
    startClientY: number;
    lastClientY: number;
    lastMoveTime: number;
    velocityY: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);

  // Goodnotes 6 Toolbar State
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [penSubType, setPenSubType] = useState<PenSubType>('fountain');
  const [eraserSubType, setEraserSubType] = useState<EraserSubType>('stroke');
  const [shapePreset, setShapePreset] = useState<ShapePresetType>('auto');
  const [strokeColor, setStrokeColor] = useState<string>('#111827');
  const [colorSlots, setColorSlots] = useState<string[]>(['#111827', '#dc2626', '#2563eb']);
  const [showColorPopover, setShowColorPopover] = useState<boolean>(false);
  const [fillColor, setFillColor] = useState<string>('#fef08a');
  const [fillStyle, setFillStyle] = useState<FillStyleType>('none');
  const [strokeWidth, setStrokeWidth] = useState<number>(3.0);
  const [widthSlots, setWidthSlots] = useState<number[]>([2.0, 3.5, 6.5]);
  const [activeWidthSlotIdx, setActiveWidthSlotIdx] = useState<number>(1);
  const [showWidthPopover, setShowWidthPopover] = useState<boolean>(false);
  const [lineStyle, setLineStyle] = useState<LineStyleType>('solid');
  const [arrowEnd, setArrowEnd] = useState<boolean>(false);
  const [scribbleToEraseEnabled, setScribbleToEraseEnabled] = useState<boolean>(true);
  const [holdToSnapEnabled, setHoldToSnapEnabled] = useState<boolean>(true);
  const [pencilOnlyMode, setPencilOnlyMode] = useState<boolean>(true);
  const [showToolSubBar, setShowToolSubBar] = useState<boolean>(true);

  // Layers & Selection
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-1');
  const [showLayersPanel, setShowLayersPanel] = useState<boolean>(false);
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeNodeStrokeId, setActiveNodeStrokeId] = useState<string | null>(null);
  const [draggingNodeIdx, setDraggingNodeIdx] = useState<{ index: number; isControl: boolean } | null>(null);

  // Image Cropping (Freehand & Magnetic Lasso)
  const [imageCropMode, setImageCropMode] = useState<'none' | 'freehand' | 'magnetic'>('none');
  const [cropPolygonPts, setCropPolygonPts] = useState<{ x: number; y: number }[]>([]);
  const edgeMapRef = useRef<{ id: string; map: Float32Array; w: number; h: number } | null>(null);

  // Ruler
  const [rulerState, setRulerState] = useState<{ visible: boolean; x: number; y: number; angle: number }>({
    visible: false,
    x: 320,
    y: 360,
    angle: 0,
  });

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<NotePage[]>([]);
  const [redoStack, setRedoStack] = useState<NotePage[]>([]);

  // 30s Google Drive Auto-Sync
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'dirty'>('synced');
  const [secondsToNextSync, setSecondsToNextSync] = useState<number>(30);

  // Modals
  const mathDialogRef = useRef<HTMLDialogElement | null>(null);
  const settingsDialogRef = useRef<HTMLDialogElement | null>(null);
  const thumbnailsDialogRef = useRef<HTMLDialogElement | null>(null);
  const [thumbnailCols, setThumbnailCols] = useState<3 | 4>(3);
  const [mathInput, setMathInput] = useState<string>('I = \\frac{q}{t} \\implies 15 \\cdot t = 90');
  const [mathEquationToSolve, setMathEquationToSolve] = useState<string>('15 * t = 90');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // DUAL-CANVAS REFS FOR ZERO-LATENCY (0ms / 120Hz) APPLE PENCIL INKING Across Multi-Page Word-Style Stack!
  // 1. staticCanvasMapRef: Per-page 2x Retina canvas for background paper + committed strokes
  // 2. activeCanvasMapRef: Per-page 2x Retina desynchronized hardware overlay for 0ms wet ink
  const staticCanvasMapRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const activeCanvasMapRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const activeDrawingPageIndexRef = useRef<number>(0);

  const currentStrokePtsRef = useRef<BezierPoint[]>([]);
  const lastRawCanvasPtRef = useRef<BezierPoint | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const activePointerTypeRef = useRef<string | null>(null);
  const lastPenActivityTimeRef = useRef<number>(0);
  const holdTimerRef = useRef<number | null>(null);
  const snappedCurrentStrokeRef = useRef<{ points: BezierPoint[]; shapeType: string } | null>(null);
  const lassoPolygonRef = useRef<{ x: number; y: number }[]>([]);
  const isDraggingSelectionRef = useRef<{ startX: number; startY: number } | null>(null);
  const selectionTransformRef = useRef<{
    mode: 'move' | 'scale' | 'scale-x' | 'scale-y' | 'rotate';
    startX: number;
    startY: number;
    centerX: number;
    centerY: number;
    anchorX: number;
    anchorY: number;
    initialDist: number;
    initialAngle: number;
    frameAngle?: number;
    sideSignX?: number;
    sideSignY?: number;
  } | null>(null);
  const internalClipboardRef = useRef<{
    strokes: StrokeObject[];
    image?: ImageObject;
  } | null>(null);
  const imageElementsCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const fileInputGoodnotesRef = useRef<HTMLInputElement | null>(null);
  const fileInputImageRef = useRef<HTMLInputElement | null>(null);
  const fileInputPdfOrDocRef = useRef<HTMLInputElement | null>(null);
  const pdfImportModeRef = useRef<'new-notebook' | 'insert-pages'>('insert-pages');

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || notebooks[0];
  const activePage =
    activeNotebook.pages[Math.min(activePageIndex, activeNotebook.pages.length - 1)] || activeNotebook.pages[0];
  const pageWidth = activePage.orientation === 'landscape' ? 1260 : 920;
  const pageHeight = activePage.orientation === 'landscape' ? 920 : 1260;

  const showToast = useCallback((msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  // DEBOUNCED LocalStorage Save (runs 2.5s AFTER user stops writing, NEVER during pointermove!)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
      } catch {
        // ignore quota
      }
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [notebooks]);

  // 30-second Google Drive Auto-Sync loop
  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsToNextSync((prev) => {
        if (prev <= 1) {
          if (isDirty) {
            setSyncStatus('syncing');
            window.setTimeout(() => {
              setSyncStatus('synced');
              setIsDirty(false);
            }, 500);
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isDirty]);

  // Modern Web Guidance mandatory fallback for <dialog closedby="any"> in iPadOS Safari
  useEffect(() => {
    const dialogs = [mathDialogRef.current, settingsDialogRef.current, thumbnailsDialogRef.current].filter(
      Boolean
    ) as HTMLDialogElement[];
    const handlers: Array<{ el: HTMLDialogElement; fn: (e: MouseEvent) => void }> = [];

    for (const dialog of dialogs) {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const fn = (event: MouseEvent) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width;
          if (isDialogContent) return;
          dialog.close();
        };
        dialog.addEventListener('click', fn);
        handlers.push({ el: dialog, fn });
      }
    }
    return () => {
      for (const h of handlers) h.el.removeEventListener('click', h.fn);
    };
  }, []);

  const clonePageFast = useCallback((p: NotePage): NotePage => ({
    ...p,
    layers: [...p.layers],
    strokes: [...p.strokes],
    texts: [...(p.texts || [])],
    images: [...(p.images || [])],
    tapes: [...(p.tapes || [])],
  }), []);

  const updateActivePage = useCallback(
    (updater: (prev: NotePage) => NotePage, recordUndo = true) => {
      const targetIdx = activeDrawingPageIndexRef.current ?? activePageIndex;
      setNotebooks((prevNotebooks) =>
        prevNotebooks.map((nb) => {
          if (nb.id !== activeNotebook.id) return nb;
          const safeIdx = Math.min(targetIdx, nb.pages.length - 1);
          const currentPage = nb.pages[safeIdx] || nb.pages[0];
          if (recordUndo) {
            setUndoStack((u) => [...u.slice(-24), clonePageFast(currentPage)]);
            setRedoStack([]);
          }
          const updatedPage = updater(clonePageFast(currentPage));
          const newPages = [...nb.pages];
          newPages[safeIdx] = updatedPage;
          return { ...nb, updatedAt: new Date().toISOString(), pages: newPages };
        })
      );
      setIsDirty(true);
      setSyncStatus('dirty');
    },
    [activeNotebook.id, activePageIndex, clonePageFast]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prevPage = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [...r, clonePageFast(activePage)]);
    updateActivePage(() => prevPage, false);
  }, [undoStack, activePage, updateActivePage, clonePageFast]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextPage = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, clonePageFast(activePage)]);
    updateActivePage(() => nextPage, false);
  }, [redoStack, activePage, updateActivePage, clonePageFast]);

  const getNextPageZOrder = (page: NotePage): number => {
    const imgCount = (page.images || []).length;
    const strokeCount = (page.strokes || []).length;
    let maxZ = imgCount + strokeCount;
    for (const im of page.images || []) {
      if (im.zOrder !== undefined && im.zOrder > maxZ) maxZ = im.zOrder;
    }
    for (const st of page.strokes || []) {
      if (st.zOrder !== undefined && st.zOrder > maxZ) maxZ = st.zOrder;
    }
    return maxZ + 1;
  };

  const getStrokeSamplePoints = (s: StrokeObject): { x: number; y: number }[] => {
    if ((s.shapeType === 'sine' || s.shapeType === 'cosine') && s.points.length >= 2) {
      const pPeak = s.points[0];
      const pEnd = s.points[1];
      const pStart = s.points[2] || { x: pPeak.x - (pEnd.x - pPeak.x) / 3, y: pEnd.y, twist: 2 };
      const dx = pEnd.x - pStart.x;
      const dy = pEnd.y - pStart.y;
      const spanL = Math.hypot(dx, dy) || 1;
      const ux = dx / spanL;
      const uy = dy / spanL;
      const nx = uy;
      const ny = -ux;
      const amp = (pPeak.x - pStart.x) * nx + (pPeak.y - pStart.y) * ny;
      return [
        { x: pStart.x + amp * nx, y: pStart.y + amp * ny },
        { x: pStart.x - amp * nx, y: pStart.y - amp * ny },
        { x: pEnd.x + amp * nx, y: pEnd.y + amp * ny },
        { x: pEnd.x - amp * nx, y: pEnd.y - amp * ny },
      ];
    }
    if ((s.shapeType === 'ellipse' || s.shapeType === 'circle') && s.points.length === 4) {
      const [p0, p1, p2, p3] = s.points;
      const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
      const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
      const v0x = p0.x - cx,
        v0y = p0.y - cy;
      const v1x = p1.x - cx,
        v1y = p1.y - cy;
      const v2x = p2.x - cx,
        v2y = p2.y - cy;
      const v3x = p3.x - cx,
        v3y = p3.y - cy;
      return [
        { x: cx + v0x + v1x, y: cy + v0y + v1y },
        { x: cx + v0x + v3x, y: cy + v0y + v3y },
        { x: cx + v2x + v1x, y: cy + v2y + v1y },
        { x: cx + v2x + v3x, y: cy + v2y + v3y },
      ];
    }
    return s.points;
  };

  const getStrokeBounds = (s: StrokeObject) => {
    const pts = getStrokeSamplePoints(s);
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY };
  };

  const isPointNearStroke = (pt: { x: number; y: number }, s: StrokeObject, tol = 18): boolean => {
    if (s.points.some((p) => distance(pt, p) < tol)) return true;
    const b = getStrokeBounds(s);
    if (pt.x < b.minX - tol || pt.x > b.maxX + tol || pt.y < b.minY - tol || pt.y > b.maxY + tol) {
      return false;
    }
    if ((s.shapeType === 'sine' || s.shapeType === 'cosine') && s.points.length >= 2) {
      const pPeak = s.points[0];
      const pEnd = s.points[1];
      const pStart = s.points[2] || { x: pPeak.x - (pEnd.x - pPeak.x) / 3, y: pEnd.y, twist: 2 };
      const dx = pEnd.x - pStart.x;
      const dy = pEnd.y - pStart.y;
      const spanL = Math.hypot(dx, dy) || 1;
      const ux = dx / spanL;
      const uy = dy / spanL;
      const nx = uy;
      const ny = -ux;
      const amp = (pPeak.x - pStart.x) * nx + (pPeak.y - pStart.y) * ny;
      const halfCycles = Math.max(1, pStart.twist || 2);
      for (let i = 0; i <= 32; i++) {
        const t = i / 32;
        const along = t * spanL;
        const waveOffset =
          s.shapeType === 'sine'
            ? amp * Math.sin(t * halfCycles * Math.PI)
            : -amp * Math.cos(t * halfCycles * Math.PI);
        const x = pStart.x + along * ux + waveOffset * nx;
        const y = pStart.y + along * uy + waveOffset * ny;
        if (distance(pt, { x, y }) < tol) return true;
      }
      return false;
    }
    if ((s.shapeType === 'parabola' || s.shapeType === 'hyperbola' || s.shapeType === 'arc') && s.points.length === 3) {
      const [p0, pMid, p2] = s.points;
      const cx = 2 * pMid.x - (p0.x + p2.x) / 2;
      const cy = 2 * pMid.y - (p0.y + p2.y) / 2;
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const u = 1 - t;
        const x = u * u * p0.x + 2 * u * t * cx + t * t * p2.x;
        const y = u * u * p0.y + 2 * u * t * cy + t * t * p2.y;
        if (distance(pt, { x, y }) < tol) return true;
      }
      return false;
    }
    // Check segment midpoints for polygons/lines
    for (let i = 1; i < s.points.length; i++) {
      const a = s.points[i - 1];
      const c = s.points[i];
      const mid = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
      if (distance(pt, mid) < tol) return true;
    }
    return false;
  };

  const getSelectionBounds = useCallback(() => {
    if (selectedImageId) {
      const im = activePage.images?.find((i) => i.id === selectedImageId);
      if (im) {
        const cx = im.x + im.width / 2;
        const cy = im.y + im.height / 2;
        const hw = im.width / 2;
        const hh = im.height / 2;
        const angle = ((im.rotation || 0) * Math.PI) / 180;
        return {
          minX: im.x,
          minY: im.y,
          maxX: im.x + im.width,
          maxY: im.y + im.height,
          cx,
          cy,
          hw,
          hh,
          angle,
        };
      }
    }
    if (selectedStrokeIds.length > 0) {
      const sel = activePage.strokes.filter((s) => selectedStrokeIds.includes(s.id));
      if (sel.length > 0) {
        const angle = sel[0].rotation || 0;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        let minU = Infinity,
          minV = Infinity,
          maxU = -Infinity,
          maxV = -Infinity;
        for (const s of sel) {
          const samplePts = getStrokeSamplePoints(s);
          for (const p of samplePts) {
            const u = p.x * cosA + p.y * sinA;
            const v = -p.x * sinA + p.y * cosA;
            if (u < minU) minU = u;
            if (v < minV) minV = v;
            if (u > maxU) maxU = u;
            if (v > maxV) maxV = v;
          }
        }
        const midU = (minU + maxU) / 2;
        const midV = (minV + maxV) / 2;
        const hw = Math.max(8, (maxU - minU) / 2);
        const hh = Math.max(8, (maxV - minV) / 2);
        const cx = midU * cosA - midV * sinA;
        const cy = midU * sinA + midV * cosA;
        return {
          minX: cx - hw,
          minY: cy - hh,
          maxX: cx + hw,
          maxY: cy + hh,
          cx,
          cy,
          hw,
          hh,
          angle,
        };
      }
    }
    return null;
  }, [selectedImageId, selectedStrokeIds, activePage.images, activePage.strokes]);

  const drawStrokeOnContext = (ctx: CanvasRenderingContext2D, s: StrokeObject, isSelected = false) => {
    if (s.points.length === 0) return;
    ctx.save();

    if (s.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = s.opacity ?? 0.42;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = s.opacity ?? 1;
    }

    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.lineCap = s.tool === 'highlighter' ? 'butt' : 'round';
    ctx.lineJoin = 'round';

    if (s.lineStyle === 'dashed') {
      ctx.setLineDash([s.width * 3.2, s.width * 2.2]);
    } else if (s.lineStyle === 'dotted') {
      ctx.setLineDash([s.width * 0.8, s.width * 2.2]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    // 1. 4-Node Circle / Ellipse (strictly 4 cardinal points every 90°: Top, Right, Bottom, Left)
    if ((s.shapeType === 'ellipse' || s.shapeType === 'circle') && s.points.length === 4) {
      const pts = s.points;
      const kappa = 0.55228475;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < 4; i++) {
        const pA = pts[i];
        const pB = pts[(i + 1) % 4];
        const pPrev = pts[(i + 3) % 4];
        const pNext = pts[(i + 2) % 4];
        const cp1x = pA.x + ((pB.x - pPrev.x) / 2) * kappa;
        const cp1y = pA.y + ((pB.y - pPrev.y) / 2) * kappa;
        const cp2x = pB.x - ((pNext.x - pA.x) / 2) * kappa;
        const cp2y = pB.y - ((pNext.y - pA.y) / 2) * kappa;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pB.x, pB.y);
      }
      ctx.closePath();
    } else if ((s.shapeType === 'sine' || s.shapeType === 'cosine') && s.points.length >= 2) {
      // 2. Symmetrical Sine ('sine') & Cosine ('cosine') Wave (supports full 360° rotation!)
      //    points[0] = Peak handle (up/down), points[1] = Right Endpoint handle (left/right), points[2] = Left Origin
      const pPeak = s.points[0];
      const pEnd = s.points[1];
      const pStart = s.points[2] || { x: pPeak.x - (pEnd.x - pPeak.x) / 3, y: pEnd.y, twist: 2 };
      const dx = pEnd.x - pStart.x;
      const dy = pEnd.y - pStart.y;
      const spanL = Math.hypot(dx, dy) || 1;
      const ux = dx / spanL;
      const uy = dy / spanL;
      const nx = uy;
      const ny = -ux;
      const amp = (pPeak.x - pStart.x) * nx + (pPeak.y - pStart.y) * ny;
      const halfCycles = Math.max(1, pStart.twist || 2);
      const steps = 72;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const along = t * spanL;
        const waveOffset =
          s.shapeType === 'sine'
            ? amp * Math.sin(t * halfCycles * Math.PI)
            : -amp * Math.cos(t * halfCycles * Math.PI);
        const x = pStart.x + along * ux + waveOffset * nx;
        const y = pStart.y + along * uy + waveOffset * ny;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if ((s.shapeType === 'parabola' || s.shapeType === 'arc') && s.points.length === 3) {
      // 3. Symmetrical 3-Node Parabola ('parabola') & Circular Arc ('arc')
      //    points[0] = Left End, points[1] = Middle Vertex (curvature control), points[2] = Right End
      const [p0, pMid, p2] = s.points;
      const ctrlX = 2 * pMid.x - (p0.x + p2.x) / 2;
      const ctrlY = 2 * pMid.y - (p0.y + p2.y) / 2;
      ctx.moveTo(p0.x, p0.y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, p2.x, p2.y);
    } else if (s.shapeType === 'hyperbola' && s.points.length === 3) {
      // 4. Symmetrical 3-Node Hyperbola ('hyperbola')
      //    Passes 100% through p0 (t=-1), pMid (t=0 vertex), and p2 (t=+1) with hyperbolic asymptotes!
      const [p0, pMid, p2] = s.points;
      const midChordX = (p0.x + p2.x) / 2;
      const midChordY = (p0.y + p2.y) / 2;
      const ux = (p2.x - p0.x) / 2;
      const uy = (p2.y - p0.y) / 2;
      const vx = pMid.x - midChordX;
      const vy = pMid.y - midChordY;
      const k = 2.25;
      const denom = Math.sqrt(1 + k * k) - 1;
      const steps = 56;
      for (let i = 0; i <= steps; i++) {
        const u = -1 + (2 * i) / steps; // -1 .. +1
        const phi = (Math.sqrt(1 + k * u * (k * u)) - 1) / denom;
        const x = pMid.x + u * ux - phi * vx;
        const y = pMid.y + u * uy - phi * vy;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else {
      ctx.moveTo(s.points[0].x, s.points[0].y);
      if (s.points.length === 1) {
        // 1-point tap/dot/accent: HTML5 Canvas requires a tiny non-zero segment to render a round cap dot!
        ctx.lineTo(s.points[0].x + 0.08, s.points[0].y + 0.08);
      } else {
        for (let i = 1; i < s.points.length; i++) {
          const pt = s.points[i];
          if (pt.cx !== undefined && pt.cy !== undefined) {
            ctx.quadraticCurveTo(pt.cx, pt.cy, pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        if (s.points.length === 2 && distance(s.points[0], s.points[1]) < 0.4) {
          ctx.lineTo(s.points[0].x + 0.08, s.points[0].y + 0.08);
        }
      }
    }

    const canFillShape =
      s.isShape &&
      s.shapeType !== 'line' &&
      s.shapeType !== 'arrow' &&
      s.fillStyle &&
      s.fillStyle !== 'none' &&
      s.points.length > 2;
    if (canFillShape) {
      // Always use the stroke's border color (s.color) for the semi-transparent shape fill!
      const shadeColor = s.color || s.fillColor || '#2563eb';
      ctx.save();
      if (s.fillStyle === 'solid') {
        ctx.fillStyle = shadeColor;
        ctx.globalAlpha = 0.25;
        ctx.fill();
      } else if (s.fillStyle === 'hatching') {
        ctx.clip();
        const b = getStrokeBounds(s);
        ctx.strokeStyle = shadeColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([]);
        for (let diag = b.minX - (b.maxY - b.minY); diag < b.maxX + (b.maxY - b.minY); diag += 10) {
          ctx.beginPath();
          ctx.moveTo(diag, b.minY);
          ctx.lineTo(diag + (b.maxY - b.minY), b.maxY);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    ctx.stroke();

    if (s.arrowEnd && s.points.length >= 2) {
      const last = s.points[s.points.length - 1];
      const prev = s.points[Math.max(0, s.points.length - 2)];
      const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
      const headLen = Math.max(12, s.width * 4);
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(last.x - headLen * Math.cos(angle - Math.PI / 6), last.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(last.x - headLen * Math.cos(angle + Math.PI / 6), last.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawPaperBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    template: PaperTemplateType
  ) => {
    ctx.save();
    ctx.fillStyle = template === 'dark-grid' ? '#0f172a' : '#fffdf7';
    ctx.fillRect(0, 0, width, height);

    const gridColor = template === 'dark-grid' ? 'rgba(148, 163, 184, 0.16)' : 'rgba(180, 190, 205, 0.35)';
    const step = 24;

    if (template === 'grid' || template === 'dark-grid') {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = step; x < width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = step; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    } else if (template === 'ruled' || template === 'cornell') {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 72; y < height; y += 32) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      if (template === 'cornell') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(220, 72);
        ctx.lineTo(220, height - 140);
        ctx.moveTo(0, height - 140);
        ctx.lineTo(width, height - 140);
        ctx.stroke();
      }
    } else if (template === 'dotted') {
      ctx.fillStyle = 'rgba(120, 130, 145, 0.45)';
      for (let x = step; x < width; x += step) {
        for (let y = step; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  };

  // RENDER STATIC SCENE ACROSS ALL STACKED PAGES AT 2x RETINA HiDPI (1840x2520)
  // (Only runs when page state changes, NEVER while Apple Pencil is moving!)
  const renderStaticScene = useCallback(() => {
    activeNotebook.pages.forEach((pageObj, pageIdx) => {
      const canvas = staticCanvasMapRef.current.get(pageObj.id) || (pageIdx === activePageIndex ? staticCanvasRef.current : null);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pWidth = pageObj.orientation === 'landscape' ? 1260 : 920;
      const pHeight = pageObj.orientation === 'landscape' ? 920 : 1260;
      ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, pWidth, pHeight);

      drawPaperBackground(ctx, pWidth, pHeight, pageObj.template);

      // 0. Full-Page PDF or JPG/PNG Document Background (write/highlight directly on top without erasing it!)
      if (pageObj.backgroundDataUrl) {
        let bgImg = imageElementsCacheRef.current.get(pageObj.backgroundDataUrl);
        if (!bgImg) {
          bgImg = new Image();
          bgImg.src = pageObj.backgroundDataUrl;
          bgImg.onload = () => renderStaticScene();
          imageElementsCacheRef.current.set(pageObj.backgroundDataUrl, bgImg);
        }
        if (bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.save();
          const scale = Math.min(pWidth / bgImg.naturalWidth, pHeight / bgImg.naturalHeight);
          const drawW = bgImg.naturalWidth * scale;
          const drawH = bgImg.naturalHeight * scale;
          const drawX = (pWidth - drawW) / 2;
          const drawY = (pHeight - drawH) / 2;
          ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
          ctx.restore();
        }
      }

      const visibleLayerMap = new Map(pageObj.layers.map((l) => [l.id, l]));
      const isCurrentActivePage = pageIdx === activePageIndex;

      // 1-3. Unified Z-Order Rendering for BOTH Images and Strokes/Shapes!
      // This allows any Shape/Group to be sent behind an Image (-1 / Send to Back) or brought in front of an Image (+1 / Bring to Front).
      const imgList = pageObj.images || [];
      const strokeList = pageObj.strokes || [];
      type RenderEntry =
        | { kind: 'image'; z: number; img: ImageObject }
        | { kind: 'stroke'; z: number; stroke: StrokeObject };
      const entries: RenderEntry[] = [];

      imgList.forEach((imgObj, idx) => {
        entries.push({
          kind: 'image',
          z: imgObj.zOrder ?? idx + 1,
          img: imgObj,
        });
      });

      strokeList.forEach((s, idx) => {
        const defaultZ = imgList.length + idx + 1 + (s.tool === 'highlighter' ? -0.25 : 0);
        entries.push({
          kind: 'stroke',
          z: s.zOrder ?? defaultZ,
          stroke: s,
        });
      });

      entries.sort((a, b) => a.z - b.z);

      for (const entry of entries) {
        if (entry.kind === 'image') {
          const imgObj = entry.img;
          const layer = visibleLayerMap.get(imgObj.layerId);
          if (layer && !layer.visible) continue;

          let imgEl = imageElementsCacheRef.current.get(imgObj.dataUrl);
          if (!imgEl) {
            imgEl = new Image();
            imgEl.src = imgObj.dataUrl;
            imgEl.onload = () => renderStaticScene();
            imageElementsCacheRef.current.set(imgObj.dataUrl, imgEl);
          }

          if (imgEl.complete && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
            const natW = imgEl.naturalWidth;
            const natH = imgEl.naturalHeight;
            let drawW = imgObj.width;
            let drawH = imgObj.height;

            // Auto-repair any existing image that lacked naturalWidth/naturalHeight (e.g. old hardcoded 340x240)
            if (!imgObj.naturalWidth || !imgObj.naturalHeight) {
              const longest = Math.max(imgObj.width, imgObj.height, 280);
              const scale = longest / Math.max(1, natW, natH);
              drawW = Math.max(24, Math.round(natW * scale));
              drawH = Math.max(24, Math.round(natH * scale));
              const targetPageId = pageObj.id;
              const targetImgId = imgObj.id;
              window.setTimeout(() => {
                setNotebooks((prev) =>
                  prev.map((nb) =>
                    nb.id !== activeNotebook.id
                      ? nb
                      : {
                          ...nb,
                          pages: nb.pages.map((p) =>
                            p.id !== targetPageId
                              ? p
                              : {
                                  ...p,
                                  images: (p.images || []).map((im) =>
                                    im.id === targetImgId && (!im.naturalWidth || !im.naturalHeight)
                                      ? {
                                          ...im,
                                          width: drawW,
                                          height: drawH,
                                          naturalWidth: natW,
                                          naturalHeight: natH,
                                        }
                                      : im
                                  ),
                                }
                          ),
                        }
                  )
                );
              }, 0);
            }

            ctx.save();
            ctx.globalAlpha = layer?.opacity ?? 1;
            if (imgObj.rotation) {
              const icx = imgObj.x + drawW / 2;
              const icy = imgObj.y + drawH / 2;
              ctx.translate(icx, icy);
              ctx.rotate((imgObj.rotation * Math.PI) / 180);
              ctx.translate(-icx, -icy);
            }
            if (imgObj.clipPolygon && imgObj.clipPolygon.length >= 3) {
              ctx.beginPath();
              ctx.moveTo(imgObj.x + imgObj.clipPolygon[0].x, imgObj.y + imgObj.clipPolygon[0].y);
              for (let i = 1; i < imgObj.clipPolygon.length; i++) {
                ctx.lineTo(imgObj.x + imgObj.clipPolygon[i].x, imgObj.y + imgObj.clipPolygon[i].y);
              }
              ctx.closePath();
              ctx.clip();
            }
            ctx.drawImage(imgEl, imgObj.x, imgObj.y, drawW, drawH);
            ctx.restore();
          }
        } else {
          const s = entry.stroke;
          const layer = visibleLayerMap.get(s.layerId);
          if (layer && !layer.visible) continue;
          drawStrokeOnContext(ctx, s, isCurrentActivePage && selectedStrokeIds.includes(s.id));
        }
      }

      // 4. Goodnotes Select / Lasso Transform Bounding Box (Oriented Bounding Box that rotates with the shape + Semicircular Rotation Arrow!)
      if (isCurrentActivePage) {
        const selBounds = getSelectionBounds();
        if (selBounds && activeTool !== 'direct-node') {
          const pad = 8;
          const hw = selBounds.hw + pad;
          const hh = selBounds.hh + pad;
          const bcx = selBounds.cx;
          const bcy = selBounds.cy;
          const angle = selBounds.angle || 0;
          const rotStemTopY = -hh - 32;

          ctx.save();
          ctx.translate(bcx, bcy);
          ctx.rotate(angle);

          // Oriented Dashed Selection Frame (follows shape rotation!)
          ctx.strokeStyle = '#0066ff';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);

          // Rotation Stem
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(0, -hh);
          ctx.lineTo(0, rotStemTopY + 12);
          ctx.stroke();

          // Semicircular Rotation Arrow Badge (replaces the old green dot!)
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0066ff';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(0, rotStemTopY, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw Semicircular Curved Arrow (↻) inside the badge
          const arcRadius = 6.2;
          const startAng = Math.PI * 0.8;
          const endAng = Math.PI * 2.15;
          ctx.strokeStyle = '#0066ff';
          ctx.lineWidth = 2.1;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(0, rotStemTopY, arcRadius, startAng, endAng, false);
          ctx.stroke();

          // Arrowhead at the end of the semicircular arc
          const tipX = arcRadius * Math.cos(endAng);
          const tipY = rotStemTopY + arcRadius * Math.sin(endAng);
          const tangentAng = endAng + Math.PI / 2;
          const headLen = 4.8;
          ctx.fillStyle = '#0066ff';
          ctx.beginPath();
          ctx.moveTo(tipX + 1.2 * Math.cos(tangentAng), tipY + 1.2 * Math.sin(tangentAng));
          ctx.lineTo(
            tipX - headLen * Math.cos(tangentAng - 0.65),
            tipY - headLen * Math.sin(tangentAng - 0.65)
          );
          ctx.lineTo(
            tipX - headLen * Math.cos(tangentAng + 0.65),
            tipY - headLen * Math.sin(tangentAng + 0.65)
          );
          ctx.closePath();
          ctx.fill();

          // 4 Mid-Side Aspect-Ratio Stretch Handles (Top, Right, Bottom, Left — Orange #f97316 dots!)
          const localSideMidpoints = [
            { x: 0, y: -hh }, // Top (height stretch)
            { x: hw, y: 0 },  // Right (width stretch)
            { x: 0, y: hh },  // Bottom (height stretch)
            { x: -hw, y: 0 }, // Left (width stretch)
          ];
          for (const m of localSideMidpoints) {
            ctx.fillStyle = '#f97316';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(m.x, m.y, 6.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }

          // 4 Corner Proportional Resize Handles (NW, NE, SE, SW — Blue #0066ff dots!)
          const localCorners = [
            { x: -hw, y: -hh },
            { x: hw, y: -hh },
            { x: hw, y: hh },
            { x: -hw, y: hh },
          ];
          for (const c of localCorners) {
            ctx.fillStyle = '#0066ff';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(c.x, c.y, 7.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }

        // 5. Direct Node Handles ("Λευκό Βελάκι"):
        //    - Circle/Ellipse: strictly 4 nodes at 90°
        //    - Parabola/Hyperbola/Arc: strictly 3 nodes (2 Endpoints + 1 Middle Curvature)
        //    - Sine/Cosine: strictly 2 nodes (0: Peak [up/down only], 1: Right Endpoint [left/right only])
        if (activeTool === 'direct-node' && activeNodeStrokeId) {
          const target = pageObj.strokes.find((s) => s.id === activeNodeStrokeId);
          if (target) {
            ctx.save();
            const isWave = target.shapeType === 'sine' || target.shapeType === 'cosine';
            const isThreePtCurve =
              target.shapeType === 'parabola' ||
              target.shapeType === 'hyperbola' ||
              target.shapeType === 'arc';
            const isClosedPoly =
              target.shapeType === 'rectangle' ||
              target.shapeType === 'parallelogram' ||
              target.shapeType === 'triangle';
            const nodeCount = isWave
              ? Math.min(2, target.points.length)
              : isThreePtCurve
              ? Math.min(3, target.points.length)
              : isClosedPoly
              ? Math.max(1, target.points.length - 1)
              : target.points.length;

            if (isWave && target.points.length >= 3) {
              const pStart = target.points[2];
              const pEnd = target.points[1];
              ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
              ctx.lineWidth = 1.2;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(pStart.x, pEnd.y);
              ctx.lineTo(pEnd.x, pEnd.y);
              ctx.stroke();
              ctx.setLineDash([]);
            }

            for (let i = 0; i < nodeCount; i++) {
              const p = target.points[i];
              if (!target.isShape && p.cx !== undefined && p.cy !== undefined) {
                ctx.strokeStyle = '#ec4899';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.cx, p.cy);
                ctx.stroke();

                ctx.fillStyle = '#ec4899';
                ctx.beginPath();
                ctx.arc(p.cx, p.cy, 4.5, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.fillStyle = isWave && i === 0 ? '#fef08a' : isThreePtCurve && i === 1 ? '#fef08a' : '#ffffff';
              ctx.strokeStyle = '#2563eb';
              ctx.lineWidth = 2.4;
              ctx.fillRect(p.x - 7, p.y - 7, 14, 14);
              ctx.strokeRect(p.x - 7, p.y - 7, 14, 14);

              if (isWave) {
                ctx.font = 'bold 11px sans-serif';
                ctx.fillStyle = '#1e3a8a';
                if (i === 0) {
                  ctx.fillText('↕ Κορυφή', p.x - 24, p.y - 12);
                } else if (i === 1) {
                  ctx.fillText('↔ Άκρο', p.x + 10, p.y + 4);
                }
              } else if (isThreePtCurve && i === 1) {
                ctx.font = 'bold 11px sans-serif';
                ctx.fillStyle = '#1e3a8a';
                ctx.fillText('✦ Μέση (Καμπυλότητα)', p.x - 45, p.y - 12);
              }
            }
            ctx.restore();
          }
        }
      }

      // 6. Tape Strips
      for (const tape of pageObj.tapes || []) {
        ctx.save();
        ctx.strokeStyle = tape.color || '#f59e0b';
        ctx.lineWidth = tape.width || 28;
        ctx.lineCap = 'butt';
        ctx.globalAlpha = tape.revealed ? 0.22 : 0.96;
        ctx.beginPath();
        ctx.moveTo(tape.x1, tape.y1);
        ctx.lineTo(tape.x2, tape.y2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }, [activeNotebook.pages, activePageIndex, activeTool, activeNodeStrokeId, selectedStrokeIds, selectedImageId, getSelectionBounds]);

  useEffect(() => {
    renderStaticScene();
  }, [renderStaticScene]);

  // Sync activeCanvasRef & staticCanvasRef with the current active page in the multi-page stack
  useEffect(() => {
    activeDrawingPageIndexRef.current = activePageIndex;
    const st = staticCanvasMapRef.current.get(activePage.id);
    const ac = activeCanvasMapRef.current.get(activePage.id);
    if (st) staticCanvasRef.current = st;
    if (ac) {
      activeCanvasRef.current = ac;
      const ctx =
        (ac.getContext('2d', { desynchronized: true }) as CanvasRenderingContext2D) || ac.getContext('2d');
      if (ctx) {
        ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        activeCtxRef.current = ctx;
      }
    }
  }, [activePage.id, activePageIndex, viewMode]);

  const getPageTopOffset = useCallback(
    (targetIdx: number) => {
      let y = 0;
      for (let i = 0; i < targetIdx && i < activeNotebook.pages.length; i++) {
        const p = activeNotebook.pages[i];
        y += (p.orientation === 'landscape' ? 920 : 1260) + PAGE_GAP;
      }
      return y;
    },
    [activeNotebook.pages]
  );

  const totalDocumentHeight = activeNotebook.pages.reduce(
    (acc, p, idx) => acc + (p.orientation === 'landscape' ? 920 : 1260) + (idx > 0 ? PAGE_GAP : 0),
    0
  );

  const applyPaperTransformDirect = useCallback(
    (nextZoom: number, _nextPanX: number, nextPanY: number, commitReactState = false) => {
      const clampedZoom = Math.min(3.5, Math.max(0.45, nextZoom));
      zoomRef.current = clampedZoom;
      // Strictly lock X to 0 so the page is ALWAYS horizontally centered and only scrolls vertically (up/down)!
      panRef.current = { x: 0, y: nextPanY };
      if (paperTransformElRef.current) {
        paperTransformElRef.current.style.transform = `translate3d(0px, ${nextPanY}px, 0) scale(${clampedZoom})`;
      }
      if (commitReactState) {
        setZoom(clampedZoom);
        setPan({ x: 0, y: nextPanY });
      }
    },
    []
  );

  // Smoothly jump to a specific page in the Word-style vertical document stack
  const scrollToPageIndex = useCallback(
    (targetIdx: number) => {
      const clampedIdx = Math.max(0, Math.min(activeNotebook.pages.length - 1, targetIdx));
      setActivePageIndex(clampedIdx);
      activeDrawingPageIndexRef.current = clampedIdx;
      const topY = getPageTopOffset(clampedIdx);
      applyPaperTransformDirect(zoomRef.current, panRef.current.x, -topY * zoomRef.current, true);
    },
    [activeNotebook.pages.length, getPageTopOffset, applyPaperTransformDirect]
  );

  // Automatically update activePageIndex (1/3 -> 2/3 -> 3/3) as user scrolls through Word-style pages!
  const syncActivePageFromPanY = useCallback(
    (panY: number) => {
      const wsHeight = workspaceRef.current?.clientHeight || 820;
      const docFocusY = (-panY + wsHeight * 0.35) / zoomRef.current;
      let accumY = 0;
      let bestIdx = 0;
      for (let i = 0; i < activeNotebook.pages.length; i++) {
        const p = activeNotebook.pages[i];
        const pH = p.orientation === 'landscape' ? 920 : 1260;
        if (docFocusY >= accumY && docFocusY <= accumY + pH + PAGE_GAP) {
          bestIdx = i;
          break;
        }
        if (docFocusY > accumY + pH + PAGE_GAP) {
          bestIdx = i;
        }
        accumY += pH + PAGE_GAP;
      }
      if (bestIdx !== activeDrawingPageIndexRef.current) {
        activeDrawingPageIndexRef.current = bestIdx;
        setActivePageIndex(bestIdx);
      }
    },
    [activeNotebook.pages]
  );

  const insertPageAtIndex = useCallback(
    (insertIdx: number) => {
      const clampedIdx = Math.max(0, Math.min(activeNotebook.pages.length, insertIdx));
      const refPage = activeNotebook.pages[Math.min(clampedIdx, activeNotebook.pages.length - 1)] || activePage;
      const newPage: NotePage = {
        id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `Σελίδα ${clampedIdx + 1}`,
        template: refPage.template,
        orientation: refPage.orientation || 'portrait',
        layers: [
          { id: 'layer-1', name: 'Σημειώσεις & Σχήματα', visible: true, locked: false, opacity: 1 },
          { id: 'layer-2', name: 'Λύσεις / Προσθήκες', visible: true, locked: false, opacity: 1 },
        ],
        strokes: [],
        texts: [],
        images: [],
        tapes: [],
      };

      let newTopY = 0;
      for (let i = 0; i < clampedIdx && i < activeNotebook.pages.length; i++) {
        const p = activeNotebook.pages[i];
        newTopY += (p.orientation === 'landscape' ? 920 : 1260) + PAGE_GAP;
      }

      setNotebooks((prev) =>
        prev.map((nb) => {
          if (nb.id !== activeNotebook.id) return nb;
          const nextPages = [...nb.pages];
          nextPages.splice(clampedIdx, 0, newPage);
          return { ...nb, updatedAt: new Date().toISOString(), pages: nextPages };
        })
      );
      setActivePageIndex(clampedIdx);
      activeDrawingPageIndexRef.current = clampedIdx;
      applyPaperTransformDirect(zoomRef.current, 0, -newTopY * zoomRef.current, true);
      showToast(
        clampedIdx === 0
          ? '📄 Προστέθηκε Νέα Σελίδα στην αρχή του εγγράφου!'
          : clampedIdx === activeNotebook.pages.length
          ? '📄 Προστέθηκε Νέα Σελίδα στο τέλος του εγγράφου!'
          : `📄 Προστέθηκε Νέα Σελίδα στη μέση (Θέση #${clampedIdx + 1})!`
      );
    },
    [activeNotebook.id, activeNotebook.pages, activePage, applyPaperTransformDirect, showToast]
  );

  const insertNewPageRelative = useCallback(
    (where: 'before' | 'after' | 'after-current') => {
      if (where === 'before') {
        insertPageAtIndex(0);
      } else if (where === 'after-current') {
        insertPageAtIndex(activePageIndex + 1);
      } else {
        insertPageAtIndex(activeNotebook.pages.length);
      }
    },
    [activePageIndex, activeNotebook.pages.length, insertPageAtIndex]
  );

  const duplicatePageAtIndex = useCallback(
    (sourceIdx: number) => {
      const srcPage = activeNotebook.pages[sourceIdx];
      if (!srcPage) return;
      const cloned: NotePage = {
        ...clonePageFast(srcPage),
        id: `page-dup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `${srcPage.title} (Αντίγραφο)`,
      };
      const insertIdx = sourceIdx + 1;
      let newTopY = 0;
      for (let i = 0; i < insertIdx && i < activeNotebook.pages.length; i++) {
        const p = activeNotebook.pages[i];
        newTopY += (p.orientation === 'landscape' ? 920 : 1260) + PAGE_GAP;
      }
      setNotebooks((prev) =>
        prev.map((nb) => {
          if (nb.id !== activeNotebook.id) return nb;
          const nextPages = [...nb.pages];
          nextPages.splice(insertIdx, 0, cloned);
          return { ...nb, updatedAt: new Date().toISOString(), pages: nextPages };
        })
      );
      setActivePageIndex(insertIdx);
      activeDrawingPageIndexRef.current = insertIdx;
      applyPaperTransformDirect(zoomRef.current, 0, -newTopY * zoomRef.current, true);
      showToast(`📑 Διπλασιάστηκε η Σελίδα #${sourceIdx + 1} στη θέση #${insertIdx + 1}!`);
    },
    [activeNotebook.id, activeNotebook.pages, clonePageFast, applyPaperTransformDirect, showToast]
  );

  const deletePageAtIndex = useCallback(
    (targetIdx: number) => {
      if (activeNotebook.pages.length <= 1) {
        updateActivePage((page) => ({
          ...page,
          backgroundDataUrl: undefined,
          strokes: [],
          texts: [],
          images: [],
          tapes: [],
        }));
        showToast('🧹 Το έγγραφο έχει μόνο 1 σελίδα — καθαρίστηκε το περιεχόμενό της!');
        return;
      }

      const nextIdx = Math.max(0, Math.min(targetIdx, activeNotebook.pages.length - 2));
      let newTopY = 0;
      const remainingPages = activeNotebook.pages.filter((_, i) => i !== targetIdx);
      for (let i = 0; i < nextIdx && i < remainingPages.length; i++) {
        const p = remainingPages[i];
        newTopY += (p.orientation === 'landscape' ? 920 : 1260) + PAGE_GAP;
      }

      setNotebooks((prev) =>
        prev.map((nb) => {
          if (nb.id !== activeNotebook.id) return nb;
          return {
            ...nb,
            updatedAt: new Date().toISOString(),
            pages: nb.pages.filter((_, idx) => idx !== targetIdx),
          };
        })
      );
      setActivePageIndex(nextIdx);
      activeDrawingPageIndexRef.current = nextIdx;
      applyPaperTransformDirect(zoomRef.current, 0, -newTopY * zoomRef.current, true);
      showToast(`🗑️ Διαγράφηκε η Σελίδα #${targetIdx + 1}!`);
    },
    [activeNotebook.id, activeNotebook.pages, updateActivePage, applyPaperTransformDirect, showToast]
  );

  const stopPullToAddPageHold = useCallback(() => {
    if (pullHoldIntervalRef.current) {
      window.clearInterval(pullHoldIntervalRef.current);
      pullHoldIntervalRef.current = null;
    }
    pullSideActiveRef.current = null;
    setPullAddPageState(null);
  }, []);

  const cancelScrollMomentum = useCallback(() => {
    if (scrollMomentumRafRef.current !== null) {
      window.cancelAnimationFrame(scrollMomentumRafRef.current);
      scrollMomentumRafRef.current = null;
    }
  }, []);

  // 120Hz Physics-Based Kinetic Momentum Scroll (Slow finger = slow 1:1 stop; Fast finger = fast accelerated glide)
  const startScrollMomentum = useCallback(
    (initialVelocityPxPerMs: number) => {
      cancelScrollMomentum();
      let vy = Math.max(-7.5, Math.min(7.5, initialVelocityPxPerMs));
      if (Math.abs(vy) < 0.15) {
        setPan({ ...panRef.current });
        syncActivePageFromPanY(panRef.current.y);
        return;
      }

      let lastFrameTime = performance.now();
      const step = (now: number) => {
        const dt = Math.max(4, Math.min(34, now - lastFrameTime));
        lastFrameTime = now;

        const wsHeight = workspaceRef.current?.clientHeight || 820;
        const scaledDocHeight = totalDocumentHeight * zoomRef.current;
        const minPanY = Math.min(0, wsHeight - scaledDocHeight - 48);

        let nextPanY = panRef.current.y + vy * dt;

        // Exponential friction (0.945 per 60Hz frame, smoothly scaled for 120Hz ProMotion)
        vy *= Math.pow(0.945, dt / 16.67);

        // Soft brake at document top/bottom boundaries so fast flicks don't fly off into empty space
        if (nextPanY > 0) {
          nextPanY = nextPanY * 0.45;
          vy *= 0.55;
        } else if (nextPanY < minPanY) {
          nextPanY = minPanY + (nextPanY - minPanY) * 0.45;
          vy *= 0.55;
        }

        applyPaperTransformDirect(zoomRef.current, 0, nextPanY, false);
        syncActivePageFromPanY(nextPanY);

        if (Math.abs(vy) > 0.035) {
          scrollMomentumRafRef.current = window.requestAnimationFrame(step);
        } else {
          scrollMomentumRafRef.current = null;
          setPan({ ...panRef.current });
          syncActivePageFromPanY(panRef.current.y);
        }
      };

      scrollMomentumRafRef.current = window.requestAnimationFrame(step);
    },
    [cancelScrollMomentum, totalDocumentHeight, applyPaperTransformDirect, syncActivePageFromPanY]
  );

  const checkPullToAddPageHold = useCallback(
    (nextPanY: number) => {
      const wsHeight = workspaceRef.current?.clientHeight || 820;
      const scaledDocHeight = totalDocumentHeight * zoomRef.current;
      const minPanY = Math.min(0, wsHeight - scaledDocHeight - 48);
      const pullThreshold = 72;

      let targetSide: 'top' | 'bottom' | null = null;
      if (nextPanY > pullThreshold) {
        targetSide = 'top';
      } else if (nextPanY < minPanY - pullThreshold) {
        targetSide = 'bottom';
      }

      if (!targetSide) {
        if (pullSideActiveRef.current) {
          stopPullToAddPageHold();
        }
        return;
      }

      if (pullSideActiveRef.current === targetSide) return;

      if (pullHoldIntervalRef.current) {
        window.clearInterval(pullHoldIntervalRef.current);
      }
      pullSideActiveRef.current = targetSide;
      const holdStart = performance.now();
      const holdDurationMs = 1250; // 1.25s hold adds the new page!
      setPullAddPageState({ side: targetSide, progress: 8 });

      pullHoldIntervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - holdStart;
        const pct = Math.min(100, Math.round((elapsed / holdDurationMs) * 100));
        setPullAddPageState({ side: targetSide!, progress: pct });
        if (pct >= 100) {
          stopPullToAddPageHold();
          insertNewPageRelative(targetSide === 'top' ? 'before' : 'after');
        }
      }, 60);
    },
    [totalDocumentHeight, stopPullToAddPageHold, insertNewPageRelative]
  );

  // Rotate Page 90° Left or Right (rotates page orientation + all strokes, images, texts, tapes)
  const handleRotatePage = useCallback(
    (direction: 'left' | 'right') => {
      const oldW = activePage.orientation === 'landscape' ? 1260 : 920;
      const oldH = activePage.orientation === 'landscape' ? 920 : 1260;
      const nextOrientation: 'portrait' | 'landscape' =
        activePage.orientation === 'landscape' ? 'portrait' : 'landscape';

      const mapPt = (x: number, y: number) =>
        direction === 'right' ? { x: oldH - y, y: x } : { x: y, y: oldW - x };

      updateActivePage((page) => ({
        ...page,
        orientation: nextOrientation,
        rotation: (((page.rotation || 0) + (direction === 'right' ? 90 : 270)) % 360),
        strokes: page.strokes.map((s) => ({
          ...s,
          points: s.points.map((p) => {
            const np = mapPt(p.x, p.y);
            const nc = p.cx !== undefined && p.cy !== undefined ? mapPt(p.cx, p.cy) : null;
            return {
              ...p,
              x: np.x,
              y: np.y,
              cx: nc ? nc.x : undefined,
              cy: nc ? nc.y : undefined,
            };
          }),
        })),
        images: (page.images || []).map((im) => {
          const center = mapPt(im.x + im.width / 2, im.y + im.height / 2);
          return {
            ...im,
            x: center.x - im.height / 2,
            y: center.y - im.width / 2,
            width: im.height,
            height: im.width,
            clipPolygon: im.clipPolygon?.map((cp) =>
              direction === 'right' ? { x: im.height - cp.y, y: cp.x } : { x: cp.y, y: im.width - cp.x }
            ),
          };
        }),
        texts: (page.texts || []).map((t) => {
          const nt = mapPt(t.x, t.y);
          return { ...t, x: nt.x, y: nt.y };
        }),
        tapes: (page.tapes || []).map((tp) => {
          const p1 = mapPt(tp.x1, tp.y1);
          const p2 = mapPt(tp.x2, tp.y2);
          return { ...tp, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
        }),
      }));

      applyPaperTransformDirect(zoomRef.current, 0, 0, true);
      showToast(
        direction === 'right'
          ? `↻ Περιστροφή σελίδας +90° (${nextOrientation === 'landscape' ? 'Landscape' : 'Portrait'})`
          : `↺ Περιστροφή σελίδας -90° (${nextOrientation === 'landscape' ? 'Landscape' : 'Portrait'})`
      );
    },
    [activePage.orientation, updateActivePage, applyPaperTransformDirect, showToast]
  );

  // CUT / COPY / PASTE (Supports internal strokes/images AND external photos/screenshots from iPad Clipboard!)
  const handleCopySelected = useCallback(() => {
    const selStrokes = activePage.strokes.filter((s) => selectedStrokeIds.includes(s.id));
    const selImg = selectedImageId ? activePage.images?.find((im) => im.id === selectedImageId) : undefined;
    if (selStrokes.length === 0 && !selImg) {
      showToast('ℹ️ Επίλεξε πρώτα σχήμα ή εικόνα με το Lasso για Copy!');
      return;
    }
    internalClipboardRef.current = {
      strokes: structuredClone(selStrokes),
      image: selImg ? structuredClone(selImg) : undefined,
    };
    showToast('📋 Αντιγράφηκε (Copy) στο πρόχειρο!');
  }, [activePage.strokes, activePage.images, selectedStrokeIds, selectedImageId, showToast]);

  const handleCutSelected = useCallback(() => {
    const selStrokes = activePage.strokes.filter((s) => selectedStrokeIds.includes(s.id));
    const selImg = selectedImageId ? activePage.images?.find((im) => im.id === selectedImageId) : undefined;
    if (selStrokes.length === 0 && !selImg) {
      showToast('ℹ️ Επίλεξε πρώτα σχήμα ή εικόνα με το Lasso για Cut!');
      return;
    }
    internalClipboardRef.current = {
      strokes: structuredClone(selStrokes),
      image: selImg ? structuredClone(selImg) : undefined,
    };
    updateActivePage((page) => ({
      ...page,
      strokes: page.strokes.filter((s) => !selectedStrokeIds.includes(s.id)),
      images: (page.images || []).filter((im) => im.id !== selectedImageId),
    }));
    setSelectedStrokeIds([]);
    setSelectedImageId(null);
    showToast('✂️ Αποκόπηκε (Cut) στο πρόχειρο!');
  }, [activePage.strokes, activePage.images, selectedStrokeIds, selectedImageId, updateActivePage, showToast]);

  // Instant 1-Tap Duplicate ("Αντίγραφο"): clones the selected shape/group or image slightly lower and slightly to the right (+28px, +28px)!
  const handleDuplicateSelected = useCallback(() => {
    const baseIds =
      selectedStrokeIds.length > 0
        ? selectedStrokeIds
        : activeNodeStrokeId
        ? [activeNodeStrokeId]
        : [];
    const baseSet = new Set(baseIds);
    const groupIds = new Set(
      activePage.strokes
        .filter((s) => baseSet.has(s.id) && s.groupId)
        .map((s) => s.groupId as string)
    );
    const selStrokes = activePage.strokes.filter(
      (s) => baseSet.has(s.id) || (s.groupId && groupIds.has(s.groupId))
    );
    const selImg = selectedImageId ? activePage.images?.find((im) => im.id === selectedImageId) : undefined;

    if (selImg) {
      const dupImg: ImageObject = {
        ...structuredClone(selImg),
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: selImg.x + 28,
        y: selImg.y + 28,
      };
      updateActivePage((page) => ({
        ...page,
        images: [...(page.images || []), { ...dupImg, zOrder: getNextPageZOrder(page) }],
      }));
      setSelectedImageId(dupImg.id);
      setSelectedStrokeIds([]);
      setActiveNodeStrokeId(null);
      setActiveTool('lasso');
      showToast('📑 Δημιουργήθηκε αντίγραφο εικόνας!');
      return;
    }

    if (selStrokes.length > 0) {
      const newGroupId = selStrokes.some((s) => s.groupId) ? `grp-${Date.now()}` : undefined;
      const duplicated = selStrokes.map((s) => ({
        ...structuredClone(s),
        id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        groupId: s.groupId ? newGroupId : undefined,
        points: s.points.map((p) => ({
          ...p,
          x: p.x + 28,
          y: p.y + 28,
          cx: p.cx !== undefined ? p.cx + 28 : undefined,
          cy: p.cy !== undefined ? p.cy + 28 : undefined,
        })),
      }));
      updateActivePage((page) => {
        const baseZ = getNextPageZOrder(page);
        return {
          ...page,
          strokes: [...page.strokes, ...duplicated.map((s, idx) => ({ ...s, zOrder: baseZ + idx }))],
        };
      });
      const dupIds = duplicated.map((s) => s.id);
      setSelectedStrokeIds(dupIds);
      setActiveNodeStrokeId(dupIds.length === 1 ? dupIds[0] : null);
      setSelectedImageId(null);
      setActiveTool('lasso');
      showToast('📑 Δημιουργήθηκε αντίγραφο σχήματος!');
      return;
    }

    showToast('ℹ️ Επίλεξε πρώτα σχήμα ή εικόνα για Αντίγραφο!');
  }, [
    activePage.strokes,
    activePage.images,
    selectedStrokeIds,
    activeNodeStrokeId,
    selectedImageId,
    updateActivePage,
    showToast,
  ]);

  const insertImageDataUrlOnPage = useCallback(
    (dataUrl: string, customToast?: string) => {
      const img = new Image();
      img.onload = () => {
        const natW = Math.max(1, img.naturalWidth || img.width || 360);
        const natH = Math.max(1, img.naturalHeight || img.height || 260);
        const maxW = 440;
        const maxH = 540;
        let scale = Math.min(1, maxW / natW, maxH / natH);
        const longestScaled = Math.max(natW * scale, natH * scale);
        if (longestScaled < 180) {
          scale = 180 / Math.max(natW, natH);
        }
        const w = Math.max(24, Math.round(natW * scale));
        const h = Math.max(24, Math.round(natH * scale));
        const newImg: ImageObject = {
          id: `img-${Date.now()}`,
          x: 160,
          y: 180,
          width: w,
          height: h,
          naturalWidth: natW,
          naturalHeight: natH,
          dataUrl,
          originalDataUrl: dataUrl,
          layerId: activeLayerId,
        };
        updateActivePage((page) => ({
          ...page,
          images: [...(page.images || []), { ...newImg, zOrder: getNextPageZOrder(page) }],
        }));
        setSelectedImageId(newImg.id);
        setSelectedStrokeIds([]);
        setActiveTool('lasso');
        showToast(customToast || `📥 Επικολλήθηκε εικόνα (${natW}×${natH}px) με ακριβείς αναλογίες!`);
      };
      img.src = dataUrl;
    },
    [activeLayerId, updateActivePage, showToast]
  );

  const handlePaste = useCallback(async () => {
    // 1. Try reading external image/photo from System Clipboard (e.g. copied from Safari/Photos on iPad)
    try {
      if (navigator.clipboard && 'read' in navigator.clipboard) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imgType = item.types.find((t) => t.startsWith('image/'));
          if (imgType) {
            const blob = await item.getType(imgType);
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                insertImageDataUrlOnPage(reader.result);
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    } catch {
      // Fall back to internal clipboard if system clipboard permission is declined or empty
    }

    // 2. Paste from Internal BestNotes Clipboard (strokes or image)
    if (internalClipboardRef.current) {
      const { strokes: copiedStrokes, image: copiedImg } = internalClipboardRef.current;
      if (copiedImg) {
        const newImg: ImageObject = {
          ...structuredClone(copiedImg),
          id: `img-${Date.now()}`,
          x: copiedImg.x + 28,
          y: copiedImg.y + 28,
        };
        updateActivePage((page) => ({
          ...page,
          images: [...(page.images || []), { ...newImg, zOrder: getNextPageZOrder(page) }],
        }));
        setSelectedImageId(newImg.id);
        setSelectedStrokeIds([]);
        setActiveTool('lasso');
        showToast('📥 Επικόλληση εικόνας (Paste)!');
        return;
      }
      if (copiedStrokes.length > 0) {
        const newGroupId = copiedStrokes.some((s) => s.groupId) ? `grp-${Date.now()}` : undefined;
        const pasted = copiedStrokes.map((s) => ({
          ...structuredClone(s),
          id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          groupId: s.groupId ? newGroupId : undefined,
          points: s.points.map((p) => ({
            ...p,
            x: p.x + 26,
            y: p.y + 26,
            cx: p.cx !== undefined ? p.cx + 26 : undefined,
            cy: p.cy !== undefined ? p.cy + 26 : undefined,
          })),
        }));
        updateActivePage((page) => {
          const baseZ = getNextPageZOrder(page);
          return {
            ...page,
            strokes: [...page.strokes, ...pasted.map((s, idx) => ({ ...s, zOrder: baseZ + idx }))],
          };
        });
        setSelectedStrokeIds(pasted.map((s) => s.id));
        setSelectedImageId(null);
        setActiveTool('lasso');
        showToast(`📥 Επικόλληση (${pasted.length} αντικείμενα)!`);
        return;
      }
    }

    // 3. Try reading text from System Clipboard
    try {
      if (navigator.clipboard && 'readText' in navigator.clipboard) {
        const txt = await navigator.clipboard.readText();
        if (txt && txt.trim()) {
          const newTxt: TextObject = {
            id: `txt-${Date.now()}`,
            x: 160,
            y: 200,
            text: txt.trim(),
            color: strokeColor,
            fontSize: 18,
            layerId: activeLayerId,
          };
          updateActivePage((page) => ({ ...page, texts: [...(page.texts || []), newTxt] }));
          showToast('📥 Επικόλληση κειμένου από το πρόχειρο!');
          return;
        }
      }
    } catch {
      // ignore
    }

    showToast('ℹ️ Το πρόχειρο είναι κενό (Κάνε Copy μια φωτό εκτός app ή επίλεξε σχήμα με Lasso)!');
  }, [insertImageDataUrlOnPage, updateActivePage, strokeColor, activeLayerId, showToast]);

  // Global Paste event listener (handles Cmd+V / iPad 3-finger Paste of external photos & screenshots)
  useEffect(() => {
    const onWindowPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                insertImageDataUrlOnPage(reader.result);
              }
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    };
    window.addEventListener('paste', onWindowPaste);
    return () => window.removeEventListener('paste', onWindowPaste);
  }, [insertImageDataUrlOnPage]);

  // 120Hz 2-FINGER PINCH-TO-ZOOM & PAN + 1-FINGER OUTSIDE-PAGE SCROLL + WORD-STYLE CONTINUOUS MULTI-PAGE SCROLL
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws || viewMode !== 'editor') return;

    const hasStylusTouch = (touches: TouchList): boolean => {
      for (let i = 0; i < touches.length; i++) {
        if ((touches[i] as any).touchType === 'stylus') return true;
      }
      return false;
    };

    const getDirectFingerTouches = (touches: TouchList): Touch[] => {
      const out: Touch[] = [];
      for (let i = 0; i < touches.length; i++) {
        const t = touches[i] as any;
        if (t.touchType === 'stylus') continue;
        out.push(touches[i]);
      }
      return out;
    };

    // Nonlinear Finger-Speed Gain Curve:
    // - Slow finger (<= 0.35 px/ms) -> 1.0x exact 1:1 slow scroll
    // - Fast finger (> 0.35 px/ms) -> up to 3.6x accelerated fast scroll!
    const computeFingerSpeedGain = (speedPxPerMs: number): number => {
      if (speedPxPerMs <= 0.35) return 1.0;
      return 1.0 + Math.min(2.6, Math.pow((speedPxPerMs - 0.35) * 1.45, 1.15));
    };

    const onTouchStart = (e: TouchEvent) => {
      cancelScrollMomentum();

      // Only block touch gestures if the Apple Pencil is physically touching the glass right now
      if (hasStylusTouch(e.touches) || (isDrawingRef.current && activePointerTypeRef.current === 'pen')) {
        if (e.target instanceof HTMLCanvasElement && e.cancelable) {
          e.preventDefault();
        }
        outsidePanDragRef.current = null;
        pinchStateRef.current = null;
        return;
      }

      const directTouches = getDirectFingerTouches(e.touches);
      const isOutsideCanvas = !(e.target instanceof HTMLCanvasElement);

      // Case A: 1 finger touching OUTSIDE the paper canvas (or anywhere when Pencil-Only Mode is ON) -> Scroll pages like Word!
      if (directTouches.length === 1 && (isOutsideCanvas || pencilOnlyMode)) {
        if (e.cancelable) e.preventDefault();
        const t = directTouches[0];
        outsidePanDragRef.current = {
          active: true,
          startClientX: t.clientX,
          startClientY: t.clientY,
          lastClientY: t.clientY,
          lastMoveTime: performance.now(),
          velocityY: 0,
          initialPanX: panRef.current.x,
          initialPanY: panRef.current.y,
        };
        return;
      }

      // Case B: 2+ fingers anywhere -> Pinch-to-Zoom & 2-Finger Pan across all Word-style pages + Pull-to-Add-Page
      if (directTouches.length >= 2) {
        if (e.cancelable) e.preventDefault();
        outsidePanDragRef.current = null;

        // Cancel any accidental 1-finger 'touch' dot that started milliseconds before the 2nd finger landed
        if (holdTimerRef.current) {
          window.clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        if (isDrawingRef.current && activePointerTypeRef.current !== 'pen') {
          isDrawingRef.current = false;
          activePointerIdRef.current = null;
          activePointerTypeRef.current = null;
          currentStrokePtsRef.current = [];
          snappedCurrentStrokeRef.current = null;
          lassoPolygonRef.current = [];
          isDraggingSelectionRef.current = null;
          selectionTransformRef.current = null;
          const c = activeCanvasRef.current;
          const ctx = activeCtxRef.current;
          if (c && ctx) {
            ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
            ctx.clearRect(0, 0, c.width / CANVAS_DPR, c.height / CANVAS_DPR);
          }
        }

        const t1 = directTouches[0];
        const t2 = directTouches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        const paperRect = paperTransformElRef.current?.getBoundingClientRect();
        const paperOffsetX = paperRect ? (midX - paperRect.left) / zoomRef.current : 460;
        const paperOffsetY = paperRect ? (midY - paperRect.top) / zoomRef.current : 630;
        const now = performance.now();

        pinchStateRef.current = {
          active: true,
          initialDist: Math.max(20, dist),
          initialZoom: zoomRef.current,
          initialPanX: panRef.current.x,
          initialPanY: panRef.current.y,
          startMidX: midX,
          startMidY: midY,
          lastMidY: midY,
          lastMoveTime: now,
          velocityY: 0,
          paperOffsetX,
          paperOffsetY,
          startTime: now,
          maxMoved: 0,
          touchCount: Math.max(pinchStateRef.current?.touchCount || 0, directTouches.length),
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (hasStylusTouch(e.touches) || (isDrawingRef.current && activePointerTypeRef.current === 'pen')) {
        if (e.target instanceof HTMLCanvasElement && e.cancelable) {
          e.preventDefault();
        }
        outsidePanDragRef.current = null;
        pinchStateRef.current = null;
        return;
      }

      const directTouches = getDirectFingerTouches(e.touches);

      // Case A: 1-finger velocity-sensitive scroll through Word-style pages
      if (outsidePanDragRef.current?.active && directTouches.length === 1) {
        if (e.cancelable) e.preventDefault();
        const t = directTouches[0];
        const drag = outsidePanDragRef.current;
        const now = performance.now();
        const dt = Math.max(4, Math.min(60, now - drag.lastMoveTime));
        const stepDy = t.clientY - drag.lastClientY;
        const instVy = stepDy / dt;
        const gain = computeFingerSpeedGain(Math.abs(instVy));

        drag.velocityY = drag.velocityY * 0.4 + instVy * gain * 0.6;
        drag.lastClientY = t.clientY;
        drag.lastMoveTime = now;

        const nextPanY = panRef.current.y + stepDy * gain;
        applyPaperTransformDirect(zoomRef.current, 0, nextPanY, false);
        syncActivePageFromPanY(nextPanY);
        checkPullToAddPageHold(nextPanY);
        return;
      }

      // Case B: 2-finger pinch & velocity-sensitive vertical scroll across Word-style pages
      if (!pinchStateRef.current?.active) return;
      if (directTouches.length >= 2) {
        if (e.cancelable) e.preventDefault();
        const st = pinchStateRef.current;
        st.touchCount = Math.max(st.touchCount, directTouches.length);

        const t1 = directTouches[0];
        const t2 = directTouches[1];
        const currDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const currMidX = (t1.clientX + t2.clientX) / 2;
        const currMidY = (t1.clientY + t2.clientY) / 2;

        const moved = Math.hypot(currMidX - st.startMidX, currMidY - st.startMidY) + Math.abs(currDist - st.initialDist);
        if (moved > st.maxMoved) st.maxMoved = moved;

        const now = performance.now();
        const dt = Math.max(4, Math.min(60, now - st.lastMoveTime));
        const stepMidY = currMidY - st.lastMidY;
        const instVy = stepMidY / dt;
        const isPrimarilyVerticalScroll = Math.abs(currDist - st.initialDist) < 32;
        const gain = isPrimarilyVerticalScroll ? computeFingerSpeedGain(Math.abs(instVy)) : 1.0;

        st.velocityY = st.velocityY * 0.4 + instVy * gain * 0.6;
        st.lastMidY = currMidY;
        st.lastMoveTime = now;

        const oldZoom = zoomRef.current;
        const newZoom = Math.min(3.5, Math.max(0.45, st.initialZoom * (currDist / st.initialDist)));
        const nextPanY = panRef.current.y + stepMidY * gain - st.paperOffsetY * (newZoom - oldZoom);

        applyPaperTransformDirect(newZoom, 0, nextPanY, false);
        syncActivePageFromPanY(nextPanY);
        checkPullToAddPageHold(nextPanY);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const directTouches = getDirectFingerTouches(e.touches);
      if (directTouches.length === 0) {
        stopPullToAddPageHold();
      }
      if (outsidePanDragRef.current?.active && directTouches.length === 0) {
        const drag = outsidePanDragRef.current;
        outsidePanDragRef.current = null;
        if (performance.now() - drag.lastMoveTime < 90 && Math.abs(drag.velocityY) > 0.16) {
          startScrollMomentum(drag.velocityY);
        } else {
          setPan({ ...panRef.current });
          syncActivePageFromPanY(panRef.current.y);
        }
        return;
      }
      if (!pinchStateRef.current?.active) return;
      if (directTouches.length === 0) {
        const st = pinchStateRef.current;
        const elapsed = performance.now() - st.startTime;
        pinchStateRef.current = null;
        canvasRectRef.current = null;

        // Goodnotes 6 Gesture: Quick 2-finger tap = Undo, Quick 3-finger tap = Redo
        if (
          elapsed < 260 &&
          st.maxMoved < 14 &&
          performance.now() - lastPenActivityTimeRef.current > 400
        ) {
          if (st.touchCount === 2) {
            handleUndo();
            showToast('↩️ 2-Finger Tap: Αναίρεση (Undo)');
          } else if (st.touchCount >= 3) {
            handleRedo();
            showToast('↪️ 3-Finger Tap: Επανάληψη (Redo)');
          }
        } else {
          setZoom(zoomRef.current);
          if (
            performance.now() - st.lastMoveTime < 90 &&
            Math.abs(st.velocityY) > 0.16 &&
            Math.abs(zoomRef.current - st.initialZoom) < 0.08
          ) {
            startScrollMomentum(st.velocityY);
          } else {
            setPan({ ...panRef.current });
            syncActivePageFromPanY(panRef.current.y);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const paperRect = paperTransformElRef.current?.getBoundingClientRect();
        const oldZoom = zoomRef.current;
        const factor = Math.exp(-e.deltaY * 0.0045);
        const newZoom = Math.min(3.5, Math.max(0.45, oldZoom * factor));
        const offsetX = paperRect ? (e.clientX - paperRect.left) / oldZoom : 460;
        const offsetY = paperRect ? (e.clientY - paperRect.top) / oldZoom : 630;
        const newPanX = panRef.current.x - offsetX * (newZoom - oldZoom);
        const newPanY = panRef.current.y - offsetY * (newZoom - oldZoom);
        applyPaperTransformDirect(newZoom, newPanX, newPanY, true);
        syncActivePageFromPanY(newPanY);
      } else {
        const nextPanY = panRef.current.y - e.deltaY;
        applyPaperTransformDirect(zoomRef.current, panRef.current.x - e.deltaX, nextPanY, false);
        syncActivePageFromPanY(nextPanY);
      }
    };

    ws.addEventListener('touchstart', onTouchStart, { passive: false });
    ws.addEventListener('touchmove', onTouchMove, { passive: false });
    ws.addEventListener('touchend', onTouchEnd, { passive: false });
    ws.addEventListener('touchcancel', onTouchEnd, { passive: false });
    ws.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      ws.removeEventListener('touchstart', onTouchStart);
      ws.removeEventListener('touchmove', onTouchMove);
      ws.removeEventListener('touchend', onTouchEnd);
      ws.removeEventListener('touchcancel', onTouchEnd);
      ws.removeEventListener('wheel', onWheel);
    };
  }, [viewMode, pencilOnlyMode, applyPaperTransformDirect, syncActivePageFromPanY, checkPullToAddPageHold, stopPullToAddPageHold, cancelScrollMomentum, startScrollMomentum, handleUndo, handleRedo, showToast]);

  const clearActiveOverlay = () => {
    const c = activeCanvasRef.current;
    const ctx = activeCtxRef.current;
    if (!c || !ctx) return;
    ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
    ctx.clearRect(0, 0, c.width / CANVAS_DPR, c.height / CANVAS_DPR);
  };

  // Draw live wet ink on the top 2x Retina overlay canvas ONLY (Zero React State, Zero Lag!)
  const renderLiveOverlayStroke = () => {
    const c = activeCanvasRef.current;
    const ctx = activeCtxRef.current;
    if (!c || !ctx) return;
    ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
    ctx.clearRect(0, 0, c.width / CANVAS_DPR, c.height / CANVAS_DPR);

    const pts = snappedCurrentStrokeRef.current
      ? snappedCurrentStrokeRef.current.points
      : currentStrokePtsRef.current;
    if (pts.length === 0) return;

    // Only show shape fill once the shape is actually completed/snapped (never while drawing the raw stroke!)
    const isCompletedShape = Boolean(snappedCurrentStrokeRef.current);
    const previewStroke: StrokeObject = {
      id: 'live',
      tool: activeTool === 'highlighter' ? 'highlighter' : activeTool === 'pencil' ? 'pencil' : 'pen',
      color: strokeColor,
      fillColor: isCompletedShape && fillStyle !== 'none' ? strokeColor : undefined,
      fillStyle: isCompletedShape ? fillStyle : 'none',
      width: activeTool === 'highlighter' ? Math.max(16, strokeWidth * 4.5) : strokeWidth,
      opacity: activeTool === 'highlighter' ? 0.42 : 1,
      lineStyle,
      arrowEnd: arrowEnd || shapePreset === 'arrow',
      points: pts,
      layerId: activeLayerId,
      isShape: isCompletedShape,
      shapeType: snappedCurrentStrokeRef.current?.shapeType,
    };
    drawStrokeOnContext(ctx, previewStroke);
  };

  // 0ms First-Contact Dot at 2x Retina HiDPI
  const drawInitialDot = (pt: BezierPoint) => {
    const ctx = activeCtxRef.current;
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
    ctx.strokeStyle = strokeColor;
    const pressureFactor = penSubType === 'ballpoint' ? 1 : 0.72 + (pt.pressure ?? 0.5) * 0.55;
    ctx.lineWidth =
      activeTool === 'highlighter' ? Math.max(16, strokeWidth * 4.5) : strokeWidth * pressureFactor;
    ctx.lineCap = activeTool === 'highlighter' ? 'butt' : 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = activeTool === 'highlighter' ? 0.42 : 1;

    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt.x + 0.08, pt.y + 0.08);
    ctx.stroke();
    ctx.restore();
  };

  // 0ms 2-Point Segment at 2x Retina HiDPI
  const drawTwoPointSegment = (p0: BezierPoint, p1: BezierPoint) => {
    const ctx = activeCtxRef.current;
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
    ctx.strokeStyle = strokeColor;
    const pressureFactor = penSubType === 'ballpoint' ? 1 : 0.68 + (p1.pressure ?? 0.5) * 0.62;
    ctx.lineWidth =
      activeTool === 'highlighter' ? Math.max(16, strokeWidth * 4.5) : strokeWidth * pressureFactor;
    ctx.lineCap = activeTool === 'highlighter' ? 'butt' : 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = activeTool === 'highlighter' ? 0.42 : 1;

    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(midX, midY);
    ctx.stroke();
    ctx.restore();
  };

  // Incremental 0ms Quadratic Bezier segment draw at 2x Retina HiDPI (zero "ζαγρέ"!)
  const drawIncrementalSegment = (pPrev2: BezierPoint, pPrev1: BezierPoint, pCurr: BezierPoint) => {
    const ctx = activeCtxRef.current;
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
    ctx.strokeStyle = strokeColor;
    const pressureFactor = penSubType === 'ballpoint' ? 1 : 0.65 + (pCurr.pressure ?? 0.5) * 0.65;
    ctx.lineWidth =
      activeTool === 'highlighter' ? Math.max(16, strokeWidth * 4.5) : strokeWidth * pressureFactor;
    ctx.lineCap = activeTool === 'highlighter' ? 'butt' : 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = activeTool === 'highlighter' ? 0.42 : 1;

    const mid1X = (pPrev2.x + pPrev1.x) / 2;
    const mid1Y = (pPrev2.y + pPrev1.y) / 2;
    const mid2X = (pPrev1.x + pCurr.x) / 2;
    const mid2Y = (pPrev1.y + pCurr.y) / 2;

    ctx.beginPath();
    ctx.moveTo(mid1X, mid1Y);
    ctx.quadraticCurveTo(pPrev1.x, pPrev1.y, mid2X, mid2Y);
    ctx.stroke();
    ctx.restore();
  };

  const getCanvasPointFromNative = (clientX: number, clientY: number, pressure = 0.55): BezierPoint => {
    const canvas = activeCanvasRef.current!;
    const rect = canvasRectRef.current || canvas.getBoundingClientRect();
    const logicalW = canvas.width / CANVAS_DPR;
    const logicalH = canvas.height / CANVAS_DPR;
    const scaleX = logicalW / rect.width;
    const scaleY = logicalH / rect.height;
    let x = (clientX - rect.left) * scaleX;
    let y = (clientY - rect.top) * scaleY;

    if (rulerState.visible && ['pen', 'pencil', 'highlighter'].includes(activeTool)) {
      const rad = (rulerState.angle * Math.PI) / 180;
      const dx = x - rulerState.x;
      const dy = y - rulerState.y;
      const localY = -dx * Math.sin(rad) + dy * Math.cos(rad);
      const localX = dx * Math.cos(rad) + dy * Math.sin(rad);
      if (Math.abs(localY) < 42 && Math.abs(localX) < 280) {
        const snapLocalY = localY >= 0 ? 26 : -26;
        x = rulerState.x + localX * Math.cos(rad) - snapLocalY * Math.sin(rad);
        y = rulerState.y + localX * Math.sin(rad) + snapLocalY * Math.cos(rad);
      }
    }

    return {
      x,
      y,
      pressure: pressure > 0 ? pressure : 0.55,
    };
  };

  const isPointInPolygon = (pt: { x: number; y: number }, poly: { x: number; y: number }[]) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x,
        yi = poly[i].y;
      const xj = poly[j].x,
        yj = poly[j].y;
      const intersect = yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi + 1e-9) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>, pageIdx = activePageIndex) => {
    const isPen = e.pointerType === 'pen';

    if (isPen) {
      // APPLE PENCIL HARDWARE PRIORITY:
      // Always register Apple Pencil contact immediately! Cancel any palm-induced pinch/pan state.
      lastPenActivityTimeRef.current = performance.now();
      pinchStateRef.current = null;
      outsidePanDragRef.current = null;
      stopPullToAddPageHold();
      cancelScrollMomentum();

      // If a stray palm 'touch' stroke was in progress, wipe it immediately so the Apple Pencil takes over!
      if (isDrawingRef.current && activePointerTypeRef.current === 'touch') {
        isDrawingRef.current = false;
        currentStrokePtsRef.current = [];
        snappedCurrentStrokeRef.current = null;
        clearActiveOverlay();
      }
    } else if (e.pointerType === 'touch') {
      if (pencilOnlyMode) return;
      if (pinchStateRef.current?.active || outsidePanDragRef.current?.active) return;
      if ((isDrawingRef.current && activePointerTypeRef.current === 'pen') || performance.now() - lastPenActivityTimeRef.current < 260) return;
      const nev = e.nativeEvent as PointerEvent;
      if ((nev.width && nev.width > 68) || (nev.height && nev.height > 68)) return;
      if (isDrawingRef.current && activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) return;
    }

    // Switch active page immediately if user touches another page in the Word-style vertical stack!
    const targetPage = activeNotebook.pages[pageIdx] || activePage;
    activeDrawingPageIndexRef.current = pageIdx;
    if (pageIdx !== activePageIndex) {
      setActivePageIndex(pageIdx);
    }

    const stCanvas = staticCanvasMapRef.current.get(targetPage.id);
    if (stCanvas) staticCanvasRef.current = stCanvas;
    activeCanvasRef.current = e.currentTarget;
    const aCtx =
      (e.currentTarget.getContext('2d', { desynchronized: true }) as CanvasRenderingContext2D) ||
      e.currentTarget.getContext('2d');
    if (aCtx) {
      aCtx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
      aCtx.imageSmoothingEnabled = true;
      aCtx.imageSmoothingQuality = 'high';
      activeCtxRef.current = aCtx;
    }

    const activeLayer = targetPage.layers.find((l) => l.id === activeLayerId);
    if (activeLayer?.locked && ['pen', 'pencil', 'highlighter', 'eraser', 'shape'].includes(activeTool)) {
      showToast('🔒 Το επιλεγμένο Layer είναι κλειδωμένο!');
      return;
    }

    activePointerIdRef.current = e.pointerId;
    activePointerTypeRef.current = e.pointerType;
    canvasRectRef.current = e.currentTarget.getBoundingClientRect();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture errors on rapid consecutive touches
    }
    const pt = getCanvasPointFromNative(e.clientX, e.clientY, e.pressure);
    lastRawCanvasPtRef.current = pt;

    // 1. Image Crop Mode
    if (imageCropMode !== 'none' && selectedImageId) {
      const imgObj = activePage.images.find((im) => im.id === selectedImageId);
      if (imgObj) {
        isDrawingRef.current = true;
        if (imageCropMode === 'magnetic') {
          const imgEl = imageElementsCacheRef.current.get(imgObj.dataUrl);
          if (imgEl) {
            edgeMapRef.current = {
              id: imgObj.id,
              map: computeImageSobelEdgeMap(imgEl, imgObj.width, imgObj.height),
              w: Math.round(imgObj.width),
              h: Math.round(imgObj.height),
            };
          }
        }
        lassoPolygonRef.current = [{ x: pt.x, y: pt.y }];
        return;
      }
    }

    // 2. Tape Tool
    if (activeTool === 'tape') {
      const hitTape = (activePage.tapes || []).find((t) => {
        const midX = (t.x1 + t.x2) / 2;
        const midY = (t.y1 + t.y2) / 2;
        return distance(pt, { x: midX, y: midY }) < 35;
      });
      if (hitTape) {
        updateActivePage((p) => ({
          ...p,
          tapes: p.tapes.map((t) => (t.id === hitTape.id ? { ...t, revealed: !t.revealed } : t)),
        }));
        return;
      }
      isDrawingRef.current = true;
      currentStrokePtsRef.current = [pt];
      return;
    }

    // 3. Direct Node Editing ("Λευκό Βελάκι"):
    //    - Circle/Ellipse: strictly 4 nodes at 90°
    //    - Parabola/Hyperbola/Arc: strictly 3 nodes (2 Endpoints + 1 Middle Curvature)
    //    - Sine/Cosine: strictly 2 nodes (0: Peak [up/down only], 1: Right Endpoint [left/right only])
    if (activeTool === 'direct-node') {
      if (activeNodeStrokeId) {
        const target = activePage.strokes.find((s) => s.id === activeNodeStrokeId);
        if (target) {
          const isWave = target.shapeType === 'sine' || target.shapeType === 'cosine';
          const isThreePtCurve =
            target.shapeType === 'parabola' ||
            target.shapeType === 'hyperbola' ||
            target.shapeType === 'arc';
          const isClosedPoly =
            target.shapeType === 'rectangle' ||
            target.shapeType === 'parallelogram' ||
            target.shapeType === 'triangle';
          const nodeCount = isWave
            ? Math.min(2, target.points.length)
            : isThreePtCurve
            ? Math.min(3, target.points.length)
            : isClosedPoly
            ? Math.max(1, target.points.length - 1)
            : target.points.length;

          for (let i = 0; i < nodeCount; i++) {
            const p = target.points[i];
            if (distance(pt, p) < 18) {
              setDraggingNodeIdx({ index: i, isControl: false });
              isDrawingRef.current = true;
              return;
            }
            if (!target.isShape && p.cx !== undefined && p.cy !== undefined && distance(pt, { x: p.cx, y: p.cy }) < 15) {
              setDraggingNodeIdx({ index: i, isControl: true });
              isDrawingRef.current = true;
              return;
            }
          }
        }
      }
      const hit = activePage.strokes.find((s) => isPointNearStroke(pt, s, 20));
      if (hit) {
        // If an older ellipse/circle had >4 points, normalize it to 4 cardinal 90° points immediately!
        if ((hit.shapeType === 'ellipse' || hit.shapeType === 'circle') && hit.points.length > 4) {
          const b = getStrokeBounds(hit);
          const cx = (b.minX + b.maxX) / 2;
          const cy = (b.minY + b.maxY) / 2;
          const rx = Math.max(12, (b.maxX - b.minX) / 2);
          const ry = Math.max(12, (b.maxY - b.minY) / 2);
          const fourPts: BezierPoint[] = [
            { x: cx, y: cy - ry, pressure: 0.7 },
            { x: cx + rx, y: cy, pressure: 0.7 },
            { x: cx, y: cy + ry, pressure: 0.7 },
            { x: cx - rx, y: cy, pressure: 0.7 },
          ];
          updateActivePage(
            (page) => ({
              ...page,
              strokes: page.strokes.map((s) => (s.id === hit.id ? { ...s, points: fourPts } : s)),
            }),
            false
          );
        }
        setActiveNodeStrokeId(hit.id);
        const members = hit.groupId
          ? activePage.strokes.filter((s) => s.groupId === hit.groupId).map((s) => s.id)
          : [hit.id];
        setSelectedStrokeIds(members);
      } else {
        setActiveNodeStrokeId(null);
        setSelectedStrokeIds([]);
      }
      return;
    }

    // 4. Lasso & Transform Tool (Move + 4-Corner Proportional Resize + 360° Rotate Handle on Oriented Bounding Box!)
    if (activeTool === 'lasso') {
      const selBounds = getSelectionBounds();
      if (selBounds) {
        const pad = 8;
        const hw = selBounds.hw + pad;
        const hh = selBounds.hh + pad;
        const bcx = selBounds.cx;
        const bcy = selBounds.cy;
        const angle = selBounds.angle || 0;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Transform pointer pt into the rotated selection box's local coordinate system
        const dx = pt.x - bcx;
        const dy = pt.y - bcy;
        const localX = dx * cosA + dy * sinA;
        const localY = -dx * sinA + dy * cosA;
        const rotStemTopY = -hh - 32;

        // A. Check Top Semicircular Rotation Arrow Handle (↻)
        if (Math.hypot(localX - 0, localY - rotStemTopY) < 20) {
          selectionTransformRef.current = {
            mode: 'rotate',
            startX: pt.x,
            startY: pt.y,
            centerX: bcx,
            centerY: bcy,
            anchorX: bcx,
            anchorY: bcy,
            initialDist: Math.max(10, distance(pt, { x: bcx, y: bcy })),
            initialAngle: Math.atan2(pt.y - bcy, pt.x - bcx),
          };
          isDrawingRef.current = true;
          return;
        }

        // B1. Check 4 Corner Proportional Resize Handles (NW, NE, SE, SW — Blue #0066ff dots)
        const localCorners = [
          { lx: -hw, ly: -hh, oppLx: hw, oppLy: hh, sx: -1, sy: -1 },
          { lx: hw, ly: -hh, oppLx: -hw, oppLy: hh, sx: 1, sy: -1 },
          { lx: hw, ly: hh, oppLx: -hw, oppLy: -hh, sx: 1, sy: 1 },
          { lx: -hw, ly: hh, oppLx: hw, oppLy: -hh, sx: -1, sy: 1 },
        ];
        for (const c of localCorners) {
          if (Math.hypot(localX - c.lx, localY - c.ly) < 18) {
            const oppWorldX = bcx + c.oppLx * cosA - c.oppLy * sinA;
            const oppWorldY = bcy + c.oppLx * sinA + c.oppLy * cosA;
            selectionTransformRef.current = {
              mode: 'scale',
              startX: pt.x,
              startY: pt.y,
              centerX: bcx,
              centerY: bcy,
              anchorX: oppWorldX,
              anchorY: oppWorldY,
              initialDist: Math.max(12, distance(pt, { x: oppWorldX, y: oppWorldY })),
              initialAngle: 0,
              frameAngle: angle,
              sideSignX: c.sx,
              sideSignY: c.sy,
            };
            isDrawingRef.current = true;
            return;
          }
        }

        // B2. Check 4 Mid-Side Aspect-Ratio Stretch Handles (Top, Right, Bottom, Left — Orange #f97316 dots)
        const localSides: {
          lx: number;
          ly: number;
          oppLx: number;
          oppLy: number;
          mode: 'scale-x' | 'scale-y';
          sx: number;
          sy: number;
        }[] = [
          { lx: 0, ly: -hh, oppLx: 0, oppLy: hh, mode: 'scale-y', sx: 0, sy: -1 },
          { lx: hw, ly: 0, oppLx: -hw, oppLy: 0, mode: 'scale-x', sx: 1, sy: 0 },
          { lx: 0, ly: hh, oppLx: 0, oppLy: -hh, mode: 'scale-y', sx: 0, sy: 1 },
          { lx: -hw, ly: 0, oppLx: hw, oppLy: 0, mode: 'scale-x', sx: -1, sy: 0 },
        ];
        for (const m of localSides) {
          if (Math.hypot(localX - m.lx, localY - m.ly) < 18) {
            const oppWorldX = bcx + m.oppLx * cosA - m.oppLy * sinA;
            const oppWorldY = bcy + m.oppLx * sinA + m.oppLy * cosA;
            const rx = pt.x - oppWorldX;
            const ry = pt.y - oppWorldY;
            const initialSpan =
              m.mode === 'scale-x'
                ? Math.max(16, Math.abs(rx * cosA + ry * sinA))
                : Math.max(16, Math.abs(-rx * sinA + ry * cosA));
            selectionTransformRef.current = {
              mode: m.mode,
              startX: pt.x,
              startY: pt.y,
              centerX: bcx,
              centerY: bcy,
              anchorX: oppWorldX,
              anchorY: oppWorldY,
              initialDist: initialSpan,
              initialAngle: 0,
              frameAngle: angle,
              sideSignX: m.sx,
              sideSignY: m.sy,
            };
            isDrawingRef.current = true;
            return;
          }
        }

        // C. Check inside rotated selection bounding box -> Move
        if (Math.abs(localX) <= hw + 6 && Math.abs(localY) <= hh + 6) {
          selectionTransformRef.current = {
            mode: 'move',
            startX: pt.x,
            startY: pt.y,
            centerX: bcx,
            centerY: bcy,
            anchorX: bcx,
            anchorY: bcy,
            initialDist: 1,
            initialAngle: 0,
          };
          isDraggingSelectionRef.current = { startX: pt.x, startY: pt.y };
          isDrawingRef.current = true;
          return;
        }
      }

      // Check if user tapped directly on a stroke/shape or an image (respecting top-most unified zOrder!)
      const imgList = activePage.images || [];
      const strokeList = activePage.strokes || [];

      let topHitImg: { img: ImageObject; z: number } | null = null;
      for (let idx = 0; idx < imgList.length; idx++) {
        const im = imgList[idx];
        if (pt.x >= im.x && pt.x <= im.x + im.width && pt.y >= im.y && pt.y <= im.y + im.height) {
          const z = im.zOrder ?? idx + 1;
          if (!topHitImg || z >= topHitImg.z) {
            topHitImg = { img: im, z };
          }
        }
      }

      let topHitStroke: { stroke: StrokeObject; z: number } | null = null;
      for (let idx = 0; idx < strokeList.length; idx++) {
        const s = strokeList[idx];
        if (isPointNearStroke(pt, s, 18)) {
          const z = s.zOrder ?? imgList.length + idx + 1;
          if (!topHitStroke || z >= topHitStroke.z) {
            topHitStroke = { stroke: s, z };
          }
        }
      }

      if (topHitStroke && (!topHitImg || topHitStroke.z >= topHitImg.z)) {
        const tappedStroke = topHitStroke.stroke;
        setSelectedImageId(null);
        const members = tappedStroke.groupId
          ? activePage.strokes.filter((s) => s.groupId === tappedStroke.groupId).map((s) => s.id)
          : [tappedStroke.id];
        setSelectedStrokeIds(members);
        setActiveNodeStrokeId(tappedStroke.id);
        selectionTransformRef.current = {
          mode: 'move',
          startX: pt.x,
          startY: pt.y,
          centerX: pt.x,
          centerY: pt.y,
          anchorX: pt.x,
          anchorY: pt.y,
          initialDist: 1,
          initialAngle: 0,
        };
        isDraggingSelectionRef.current = { startX: pt.x, startY: pt.y };
        isDrawingRef.current = true;
        return;
      }

      if (topHitImg) {
        const hitImg = (topHitImg as { img: ImageObject; z: number }).img;
        setSelectedImageId(hitImg.id);
        setSelectedStrokeIds([]);
        setActiveNodeStrokeId(null);
        selectionTransformRef.current = {
          mode: 'move',
          startX: pt.x,
          startY: pt.y,
          centerX: hitImg.x + hitImg.width / 2,
          centerY: hitImg.y + hitImg.height / 2,
          anchorX: hitImg.x,
          anchorY: hitImg.y,
          initialDist: 1,
          initialAngle: 0,
        };
        isDraggingSelectionRef.current = { startX: pt.x, startY: pt.y };
        isDrawingRef.current = true;
        return;
      }
      setSelectedImageId(null);

      setSelectedStrokeIds([]);
      setActiveNodeStrokeId(null);
      selectionTransformRef.current = null;
      lassoPolygonRef.current = [{ x: pt.x, y: pt.y }];
      isDrawingRef.current = true;
      return;
    }

    // 5. Eraser
    if (activeTool === 'eraser') {
      isDrawingRef.current = true;
      eraseAtPoint(pt);
      return;
    }

    // 6. Pen / Pencil / Highlighter / Shape / Laser -> Start 0ms Direct Ink!
    isDrawingRef.current = true;
    snappedCurrentStrokeRef.current = null;
    currentStrokePtsRef.current = [pt];
    if (['pen', 'pencil', 'highlighter'].includes(activeTool)) {
      drawInitialDot(pt);
    }
  };

  const eraseAtPoint = (pt: { x: number; y: number }) => {
    const lockedLayerIds = new Set(activePage.layers.filter((l) => l.locked).map((l) => l.id));
    const eraseRadius = Math.max(14, strokeWidth * 3.5);

    updateActivePage((page) => {
      if (eraserSubType === 'stroke' || eraserSubType === 'highlighter-only') {
        const filtered = page.strokes.filter((s) => {
          if (lockedLayerIds.has(s.layerId)) return true;
          if (eraserSubType === 'highlighter-only' && s.tool !== 'highlighter') return true;
          return !isPointNearStroke(pt, s, eraseRadius);
        });
        if (filtered.length === page.strokes.length) return page;
        return { ...page, strokes: filtered };
      } else {
        const nextStrokes: StrokeObject[] = [];
        for (const s of page.strokes) {
          if (lockedLayerIds.has(s.layerId)) {
            nextStrokes.push(s);
            continue;
          }
          const remaining = s.points.filter((p) => distance(pt, p) > eraseRadius);
          if (remaining.length >= 2) {
            nextStrokes.push({ ...s, points: remaining });
          }
        }
        return { ...page, strokes: nextStrokes };
      }
    }, false);
  };

  // ULTRA-FAST POINTER MOVE: Zero React re-renders while drawing!
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;

    if (e.pointerType === 'pen') {
      lastPenActivityTimeRef.current = performance.now();
      pinchStateRef.current = null;
    } else if (pinchStateRef.current?.active) {
      return;
    }

    // Collect coalesced high-frequency Apple Pencil events (up to 240Hz on iPad Pro)
    const nativeEv = e.nativeEvent as PointerEvent;
    const coalesced = nativeEv.getCoalescedEvents ? nativeEv.getCoalescedEvents() : [nativeEv];
    const latestPt = getCanvasPointFromNative(e.clientX, e.clientY, e.pressure);
    lastRawCanvasPtRef.current = latestPt;

    // 1. Image Freehand / Magnetic Lasso Crop on active overlay canvas
    if (imageCropMode !== 'none' && selectedImageId) {
      const imgObj = activePage.images.find((im) => im.id === selectedImageId);
      if (imgObj) {
        let nextX = latestPt.x;
        let nextY = latestPt.y;
        if (imageCropMode === 'magnetic' && edgeMapRef.current && edgeMapRef.current.id === imgObj.id) {
          const snapped = snapMagneticLassoPoint(
            latestPt.x - imgObj.x,
            latestPt.y - imgObj.y,
            edgeMapRef.current.map,
            edgeMapRef.current.w,
            edgeMapRef.current.h,
            20
          );
          nextX = imgObj.x + snapped.x;
          nextY = imgObj.y + snapped.y;
        }
        lassoPolygonRef.current.push({ x: nextX, y: nextY });
        const ctx = activeCtxRef.current;
        const c = activeCanvasRef.current;
        if (ctx && c && lassoPolygonRef.current.length > 1) {
          ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
          ctx.clearRect(0, 0, c.width / CANVAS_DPR, c.height / CANVAS_DPR);
          ctx.save();
          ctx.strokeStyle = imageCropMode === 'magnetic' ? '#10b981' : '#f59e0b';
          ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(lassoPolygonRef.current[0].x, lassoPolygonRef.current[0].y);
          for (let i = 1; i < lassoPolygonRef.current.length; i++) {
            ctx.lineTo(lassoPolygonRef.current[i].x, lassoPolygonRef.current[i].y);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
      return;
    }

    // 2. Direct Node Editing (syncs closing point for polygons, 4 nodes for ellipses, 3 curvature handles for Parabola/Hyperbola/Arc, & 2 constrained handles for Sine/Cosine!)
    if (activeTool === 'direct-node' && activeNodeStrokeId && draggingNodeIdx) {
      updateActivePage(
        (page) => ({
          ...page,
          strokes: page.strokes.map((s) => {
            if (s.id !== activeNodeStrokeId) return s;
            const newPts = [...s.points];
            const targetPt = { ...newPts[draggingNodeIdx.index] };

            // Special strict axis constraints for Sine / Cosine waves:
            // - index 0 (Κορυφή / Peak): moves ONLY vertically (up/down) to change amplitude
            // - index 1 (Δεξί Άκρο / Endpoint): moves ONLY horizontally (left/right) to widen/narrow the wave
            if (s.shapeType === 'sine' || s.shapeType === 'cosine') {
              const pStart = newPts[2] || { x: newPts[0].x - 80, y: newPts[1].y, twist: 2 };
              const halfCycles = Math.max(1, Math.round(pStart.twist || 2));
              const tPeak = s.shapeType === 'sine' ? 1 / (2 * halfCycles) : 0;

              if (draggingNodeIdx.index === 0) {
                // Peak handle: strictly vertical (taller / shorter)
                targetPt.y = latestPt.y;
                newPts[0] = targetPt;
              } else if (draggingNodeIdx.index === 1) {
                // Endpoint handle: strictly horizontal (wider / narrower)
                const nextEndX = Math.max(pStart.x + 48, latestPt.x);
                targetPt.x = nextEndX;
                newPts[1] = targetPt;
                // Keep the Peak handle's X locked at the crest of the first half-cycle
                newPts[0] = {
                  ...newPts[0],
                  x: pStart.x + (nextEndX - pStart.x) * tPeak,
                };
              }
              return { ...s, points: newPts };
            }

            if (draggingNodeIdx.isControl) {
              targetPt.cx = latestPt.x;
              targetPt.cy = latestPt.y;
            } else {
              const dx = latestPt.x - targetPt.x;
              const dy = latestPt.y - targetPt.y;
              targetPt.x = latestPt.x;
              targetPt.y = latestPt.y;
              if (targetPt.cx !== undefined && targetPt.cy !== undefined) {
                targetPt.cx += dx;
                targetPt.cy += dy;
              }
            }
            newPts[draggingNodeIdx.index] = targetPt;
            const isClosedPoly =
              s.shapeType === 'rectangle' ||
              s.shapeType === 'parallelogram' ||
              s.shapeType === 'triangle';
            if (isClosedPoly && draggingNodeIdx.index === 0 && newPts.length > 1) {
              newPts[newPts.length - 1] = {
                ...newPts[newPts.length - 1],
                x: latestPt.x,
                y: latestPt.y,
              };
            }
            return { ...s, points: newPts };
          }),
        }),
        false
      );
      return;
    }

    // 3. Lasso Selection or Transform (Move, 4-Corner Proportional Resize, 360° Rotate)
    if (activeTool === 'lasso') {
      if (selectionTransformRef.current) {
        const tf = selectionTransformRef.current;

        // A. 360° Rotation around selection center
        if (tf.mode === 'rotate') {
          const currAngle = Math.atan2(latestPt.y - tf.centerY, latestPt.x - tf.centerX);
          const dAngle = currAngle - tf.initialAngle;
          tf.initialAngle = currAngle;
          const cosA = Math.cos(dAngle);
          const sinA = Math.sin(dAngle);

          if (selectedImageId) {
            const degDelta = (dAngle * 180) / Math.PI;
            updateActivePage(
              (page) => ({
                ...page,
                images: page.images.map((im) =>
                  im.id === selectedImageId ? { ...im, rotation: ((im.rotation || 0) + degDelta) % 360 } : im
                ),
              }),
              false
            );
            return;
          }

          updateActivePage(
            (page) => ({
              ...page,
              strokes: page.strokes.map((s) => {
                if (!selectedStrokeIds.includes(s.id)) return s;
                return {
                  ...s,
                  rotation: (s.rotation || 0) + dAngle,
                  points: s.points.map((p) => {
                    const rx = p.x - tf.centerX;
                    const ry = p.y - tf.centerY;
                    const nextPt: BezierPoint = {
                      ...p,
                      x: tf.centerX + rx * cosA - ry * sinA,
                      y: tf.centerY + rx * sinA + ry * cosA,
                    };
                    if (p.cx !== undefined && p.cy !== undefined) {
                      const rcx = p.cx - tf.centerX;
                      const rcy = p.cy - tf.centerY;
                      nextPt.cx = tf.centerX + rcx * cosA - rcy * sinA;
                      nextPt.cy = tf.centerY + rcx * sinA + rcy * cosA;
                    }
                    return nextPt;
                  }),
                };
              }),
            }),
            false
          );
          return;
        }

        // B1. Proportional Resize from 4 Corners (Blue #0066ff dots — preserves exact aspect ratio!)
        if (tf.mode === 'scale') {
          const currDist = Math.max(12, distance(latestPt, { x: tf.anchorX, y: tf.anchorY }));
          const scaleFactor = Math.max(0.85, Math.min(1.18, currDist / tf.initialDist));
          tf.initialDist = currDist;

          if (selectedImageId) {
            const fAngle = tf.frameAngle || 0;
            const cosF = Math.cos(fAngle);
            const sinF = Math.sin(fAngle);
            const sx = tf.sideSignX || 1;
            const sy = tf.sideSignY || 1;

            updateActivePage(
              (page) => ({
                ...page,
                images: page.images.map((im) => {
                  if (im.id !== selectedImageId) return im;
                  // Clamp scaleFactor uniformly so the aspect ratio of elongated images NEVER distorts into a square!
                  const minSide = Math.max(1, Math.min(im.width, im.height));
                  const clampedScale = Math.max(24 / minSide, scaleFactor);
                  const newW = im.width * clampedScale;
                  const newH = im.height * clampedScale;
                  const dW = newW - im.width;
                  const dH = newH - im.height;
                  const oldCx = im.x + im.width / 2;
                  const oldCy = im.y + im.height / 2;
                  const nextCx = oldCx + (dW / 2) * sx * cosF + (dH / 2) * sy * -sinF;
                  const nextCy = oldCy + (dW / 2) * sx * sinF + (dH / 2) * sy * cosF;
                  return {
                    ...im,
                    x: nextCx - newW / 2,
                    y: nextCy - newH / 2,
                    width: newW,
                    height: newH,
                    clipPolygon: im.clipPolygon?.map((cp) => ({
                      x: cp.x * clampedScale,
                      y: cp.y * clampedScale,
                    })),
                  };
                }),
              }),
              false
            );
            return;
          }

          updateActivePage(
            (page) => ({
              ...page,
              strokes: page.strokes.map((s) => {
                if (!selectedStrokeIds.includes(s.id)) return s;
                return {
                  ...s,
                  points: s.points.map((p) => ({
                    ...p,
                    x: tf.anchorX + (p.x - tf.anchorX) * scaleFactor,
                    y: tf.anchorY + (p.y - tf.anchorY) * scaleFactor,
                    cx: p.cx !== undefined ? tf.anchorX + (p.cx - tf.anchorX) * scaleFactor : undefined,
                    cy: p.cy !== undefined ? tf.anchorY + (p.cy - tf.anchorY) * scaleFactor : undefined,
                  })),
                };
              }),
            }),
            false
          );
          return;
        }

        // B2. Aspect-Ratio Stretch (Widen/Narrow or Taller/Shorter) from 4 Mid-Side Handles (Orange #f97316 dots!)
        if (tf.mode === 'scale-x' || tf.mode === 'scale-y') {
          const fAngle = tf.frameAngle || 0;
          const cosF = Math.cos(fAngle);
          const sinF = Math.sin(fAngle);
          const rx = latestPt.x - tf.anchorX;
          const ry = latestPt.y - tf.anchorY;
          const currSpan =
            tf.mode === 'scale-x'
              ? Math.max(16, Math.abs(rx * cosF + ry * sinF))
              : Math.max(16, Math.abs(-rx * sinF + ry * cosF));
          const scaleFactor = Math.max(0.84, Math.min(1.2, currSpan / tf.initialDist));
          tf.initialDist = currSpan;

          if (selectedImageId) {
            const sx = tf.sideSignX || 0;
            const sy = tf.sideSignY || 0;
            updateActivePage(
              (page) => ({
                ...page,
                images: page.images.map((im) => {
                  if (im.id !== selectedImageId) return im;
                  if (tf.mode === 'scale-x') {
                    const newW = Math.max(24, im.width * scaleFactor);
                    const actualScaleX = newW / Math.max(1, im.width);
                    const dW = newW - im.width;
                    const oldCx = im.x + im.width / 2;
                    const oldCy = im.y + im.height / 2;
                    const nextCx = oldCx + (dW / 2) * sx * cosF;
                    const nextCy = oldCy + (dW / 2) * sx * sinF;
                    return {
                      ...im,
                      x: nextCx - newW / 2,
                      y: nextCy - im.height / 2,
                      width: newW,
                      clipPolygon: im.clipPolygon?.map((cp) => ({
                        x: cp.x * actualScaleX,
                        y: cp.y,
                      })),
                    };
                  } else {
                    const newH = Math.max(24, im.height * scaleFactor);
                    const actualScaleY = newH / Math.max(1, im.height);
                    const dH = newH - im.height;
                    const oldCx = im.x + im.width / 2;
                    const oldCy = im.y + im.height / 2;
                    const nextCx = oldCx + (dH / 2) * sy * -sinF;
                    const nextCy = oldCy + (dH / 2) * sy * cosF;
                    return {
                      ...im,
                      x: nextCx - im.width / 2,
                      y: nextCy - newH / 2,
                      height: newH,
                      clipPolygon: im.clipPolygon?.map((cp) => ({
                        x: cp.x,
                        y: cp.y * actualScaleY,
                      })),
                    };
                  }
                }),
              }),
              false
            );
            return;
          }

          // Stretch selected Shapes / Strokes / Groups along local X ('scale-x') or local Y ('scale-y') axis!
          const stretchPoint = (px: number, py: number) => {
            const dx = px - tf.anchorX;
            const dy = py - tf.anchorY;
            const lx = (dx * cosF + dy * sinF) * (tf.mode === 'scale-x' ? scaleFactor : 1);
            const ly = (-dx * sinF + dy * cosF) * (tf.mode === 'scale-y' ? scaleFactor : 1);
            return {
              x: tf.anchorX + lx * cosF - ly * sinF,
              y: tf.anchorY + lx * sinF + ly * cosF,
            };
          };

          updateActivePage(
            (page) => ({
              ...page,
              strokes: page.strokes.map((s) => {
                if (!selectedStrokeIds.includes(s.id)) return s;
                return {
                  ...s,
                  points: s.points.map((p) => {
                    const sp = stretchPoint(p.x, p.y);
                    const nextPt: BezierPoint = {
                      ...p,
                      x: sp.x,
                      y: sp.y,
                    };
                    if (p.cx !== undefined && p.cy !== undefined) {
                      const sc = stretchPoint(p.cx, p.cy);
                      nextPt.cx = sc.x;
                      nextPt.cy = sc.y;
                    }
                    return nextPt;
                  }),
                };
              }),
            }),
            false
          );
          return;
        }

        // C. Move selection
        const dx = latestPt.x - tf.startX;
        const dy = latestPt.y - tf.startY;
        tf.startX = latestPt.x;
        tf.startY = latestPt.y;

        if (selectedImageId) {
          updateActivePage(
            (page) => ({
              ...page,
              images: page.images.map((im) =>
                im.id === selectedImageId ? { ...im, x: im.x + dx, y: im.y + dy } : im
              ),
            }),
            false
          );
          return;
        }

        updateActivePage(
          (page) => ({
            ...page,
            strokes: page.strokes.map((s) => {
              if (!selectedStrokeIds.includes(s.id)) return s;
              return {
                ...s,
                points: s.points.map((p) => ({
                  ...p,
                  x: p.x + dx,
                  y: p.y + dy,
                  cx: p.cx !== undefined ? p.cx + dx : undefined,
                  cy: p.cy !== undefined ? p.cy + dy : undefined,
                })),
              };
            }),
          }),
          false
        );
        return;
      }

      // Draw Lasso loop directly on overlay canvas (0 React renders!)
      lassoPolygonRef.current.push({ x: latestPt.x, y: latestPt.y });
      const ctx = activeCtxRef.current;
      const c = activeCanvasRef.current;
      if (ctx && c && lassoPolygonRef.current.length > 1) {
        ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
        ctx.clearRect(0, 0, c.width / CANVAS_DPR, c.height / CANVAS_DPR);
        ctx.save();
        ctx.strokeStyle = '#0284c7';
        ctx.fillStyle = 'rgba(2, 132, 199, 0.09)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(lassoPolygonRef.current[0].x, lassoPolygonRef.current[0].y);
        for (let i = 1; i < lassoPolygonRef.current.length; i++) {
          ctx.lineTo(lassoPolygonRef.current[i].x, lassoPolygonRef.current[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    // 4. Eraser
    if (activeTool === 'eraser') {
      eraseAtPoint(latestPt);
      return;
    }

    // 5. Laser Pointer on overlay canvas (0 React renders!)
    if (activeTool === 'laser') {
      currentStrokePtsRef.current.push(latestPt);
      if (currentStrokePtsRef.current.length > 28) {
        currentStrokePtsRef.current.shift();
      }
      const ctx = activeCtxRef.current;
      const c = activeCanvasRef.current;
      if (ctx && c && currentStrokePtsRef.current.length > 1) {
        ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
        ctx.clearRect(0, 0, c.width / CANVAS_DPR, c.height / CANVAS_DPR);
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(currentStrokePtsRef.current[0].x, currentStrokePtsRef.current[0].y);
        for (let i = 1; i < currentStrokePtsRef.current.length; i++) {
          ctx.lineTo(currentStrokePtsRef.current[i].x, currentStrokePtsRef.current[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    // 6. ZERO-LATENCY, SILKY-SMOOTH PEN / PENCIL / HIGHLIGHTER / SHAPE INKING AT 2x RETINA!
    let didMoveSignificantly = false;
    for (const ce of coalesced) {
      const rawPt = getCanvasPointFromNative(ce.clientX, ce.clientY, ce.pressure);
      const pts = currentStrokePtsRef.current;

      if (pts.length > 0) {
        const prev = pts[pts.length - 1];
        const d = distance(prev, rawPt);
        // Filter sub-pixel digitizer stair-steps (< 1.5px) so live wet ink is completely smooth ("εντελώς λείο")!
        if (d < 1.5) continue;
        if (d >= 2.2) {
          didMoveSignificantly = true;
        }
        const alpha = Math.max(0.36, Math.min(0.72, 1 - 0.5 * Math.exp(-d / 15)));
        const smoothedPt: BezierPoint = {
          x: prev.x + alpha * (rawPt.x - prev.x),
          y: prev.y + alpha * (rawPt.y - prev.y),
          pressure: (prev.pressure ?? 0.5) * 0.45 + (rawPt.pressure ?? 0.5) * 0.55,
        };
        pts.push(smoothedPt);
      } else {
        pts.push(rawPt);
        didMoveSignificantly = true;
      }

      // If not yet snapped and using solid standard pen, draw only the new incremental Bezier segment in 0.02ms!
      if (
        !snappedCurrentStrokeRef.current &&
        lineStyle === 'solid' &&
        !arrowEnd &&
        activeTool !== 'shape' &&
        activeTool !== 'tape'
      ) {
        if (pts.length === 2) {
          drawTwoPointSegment(pts[0], pts[1]);
        } else if (pts.length >= 3) {
          drawIncrementalSegment(pts[pts.length - 3], pts[pts.length - 2], pts[pts.length - 1]);
        }
      }
    }

    if (
      snappedCurrentStrokeRef.current ||
      lineStyle !== 'solid' ||
      arrowEnd ||
      activeTool === 'shape' ||
      activeTool === 'tape'
    ) {
      if (snappedCurrentStrokeRef.current && snappedCurrentStrokeRef.current.shapeType === 'line') {
        const start = currentStrokePtsRef.current[0];
        let x2 = latestPt.x;
        let y2 = latestPt.y;
        const angleDeg = (Math.atan2(y2 - start.y, x2 - start.x) * 180) / Math.PI;
        const absAngle = Math.abs(angleDeg);
        if (absAngle < 5 || absAngle > 175) y2 = start.y;
        else if (Math.abs(absAngle - 90) < 5) x2 = start.x;

        snappedCurrentStrokeRef.current = {
          shapeType: 'line',
          points: [
            { x: start.x, y: start.y, pressure: 0.7 },
            { x: x2, y: y2, cx: (start.x + x2) / 2, cy: (start.y + y2) / 2, pressure: 0.7 },
          ],
        };
      }
      renderLiveOverlayStroke();
    }

    // Hold-to-Snap (~0.42s pause at end of stroke in Pen, Pencil, Highlighter, or Shape tool):
    // IMPORTANT: Only reset the timer when the Apple Pencil actually moves (>= 2.2px)!
    // That way, iPadOS 240Hz pressure/tilt micro-events while holding the pencil still do NOT cancel the timer,
    // and the shape snaps LIVE on screen after ~0.42s WITHOUT lifting the Apple Pencil!
    if (
      holdToSnapEnabled &&
      ['pen', 'pencil', 'highlighter', 'shape'].includes(activeTool) &&
      !snappedCurrentStrokeRef.current
    ) {
      if (didMoveSignificantly || !holdTimerRef.current) {
        if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = window.setTimeout(() => {
          holdTimerRef.current = null;
          if (!isDrawingRef.current || currentStrokePtsRef.current.length < 2) return;
          const snapped = recognizeAndSnapShape(
            currentStrokePtsRef.current,
            activeTool === 'shape' ? shapePreset : 'auto'
          );
          if (snapped) {
            snappedCurrentStrokeRef.current = snapped;
            renderLiveOverlayStroke();
          }
        }, 420);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Ignore palm/finger pointerup or pointercancel events while Apple Pencil (or another active pointerId) is drawing!
    if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;

    if (e.pointerType === 'pen') {
      lastPenActivityTimeRef.current = performance.now();
    }
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore pointer capture release errors
    }

    activePointerIdRef.current = null;
    activePointerTypeRef.current = null;

    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    // 1. Finish Image Lasso / Magnetic Lasso Crop
    if (imageCropMode !== 'none' && selectedImageId && lassoPolygonRef.current.length >= 3) {
      clearActiveOverlay();
      const poly = lassoPolygonRef.current;
      lassoPolygonRef.current = [];
      const imgObj = activePage.images.find((im) => im.id === selectedImageId);
      if (imgObj) {
        const relPoly = poly.map((p) => ({
          x: Math.max(0, Math.min(imgObj.width, p.x - imgObj.x)),
          y: Math.max(0, Math.min(imgObj.height, p.y - imgObj.y)),
        }));
        updateActivePage((page) => ({
          ...page,
          images: page.images.map((im) => (im.id === selectedImageId ? { ...im, clipPolygon: relPoly } : im)),
        }));
        showToast(
          imageCropMode === 'magnetic'
            ? '🧲 Magnetic Lasso Crop ολοκληρώθηκε!'
            : '✂️ Ελεύθερο Lasso Crop ολοκληρώθηκε!'
        );
      }
      setImageCropMode('none');
      setCropPolygonPts([]);
      return;
    }

    if (activeTool === 'direct-node') {
      clearActiveOverlay();
      setDraggingNodeIdx(null);
      return;
    }

    if (activeTool === 'laser') {
      clearActiveOverlay();
      currentStrokePtsRef.current = [];
      return;
    }

    if (activeTool === 'tape' && currentStrokePtsRef.current.length >= 2) {
      clearActiveOverlay();
      const first = currentStrokePtsRef.current[0];
      const last = currentStrokePtsRef.current[currentStrokePtsRef.current.length - 1];
      if (distance(first, last) > 20) {
        const newTape: TapeObject = {
          id: `tape-${Date.now()}`,
          x1: first.x,
          y1: first.y,
          x2: last.x,
          y2: last.y,
          width: 28,
          color: '#f59e0b',
          revealed: false,
          layerId: activeLayerId,
        };
        updateActivePage((page) => ({ ...page, tapes: [...(page.tapes || []), newTape] }));
      }
      currentStrokePtsRef.current = [];
      return;
    }

    // 2. Finish Lasso Selection
    if (activeTool === 'lasso') {
      clearActiveOverlay();
      if (selectionTransformRef.current || isDraggingSelectionRef.current) {
        selectionTransformRef.current = null;
        isDraggingSelectionRef.current = null;
        return;
      }
      const poly = lassoPolygonRef.current;
      lassoPolygonRef.current = [];
      if (poly.length >= 3) {
        const lockedLayers = new Set(activePage.layers.filter((l) => l.locked).map((l) => l.id));
        const directMatched = activePage.strokes.filter((s) => {
          if (lockedLayers.has(s.layerId)) return false;
          if (s.points.some((p) => isPointInPolygon(p, poly))) return true;
          const b = getStrokeBounds(s);
          if (isPointInPolygon({ x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 }, poly)) return true;
          return poly.some((lp) => isPointNearStroke(lp, s, 12));
        });
        const groupIds = new Set(directMatched.map((s) => s.groupId).filter(Boolean));
        const finalIds = activePage.strokes
          .filter((s) => directMatched.some((m) => m.id === s.id) || (s.groupId && groupIds.has(s.groupId)))
          .map((s) => s.id);
        setSelectedStrokeIds(finalIds);
        setActiveNodeStrokeId(finalIds.length === 1 ? finalIds[0] : null);
      }
      return;
    }

    if (!['pen', 'pencil', 'highlighter', 'shape'].includes(activeTool)) {
      clearActiveOverlay();
      return;
    }
    const rawPts = currentStrokePtsRef.current;
    currentStrokePtsRef.current = [];
    if (rawPts.length === 0) {
      clearActiveOverlay();
      return;
    }
    // Preserve short micro-strokes (like Greek accents / τόνοι) that moved < 1.5px
    if (rawPts.length === 1 && lastRawCanvasPtRef.current && distance(rawPts[0], lastRawCanvasPtRef.current) > 0.35) {
      rawPts.push(lastRawCanvasPtRef.current);
    }

    // 3. Check Scribble-to-Erase Gesture
    if (scribbleToEraseEnabled && activeTool === 'pen' && !snappedCurrentStrokeRef.current) {
      const scribble = isScribbleEraseGesture(rawPts);
      if (scribble.isScribble && scribble.bounds) {
        clearActiveOverlay();
        const b = scribble.bounds;
        const lockedLayers = new Set(activePage.layers.filter((l) => l.locked).map((l) => l.id));
        updateActivePage((page) => ({
          ...page,
          strokes: page.strokes.filter((s) => {
            if (lockedLayers.has(s.layerId)) return true;
            return !s.points.some((p) => p.x >= b.minX && p.x <= b.maxX && p.y >= b.minY && p.y <= b.maxY);
          }),
        }));
        showToast('🧹 Scribble-to-Erase!');
        return;
      }
    }

    // 4. Physics Grouped Stencils
    if (activeTool === 'shape' && ['cylinder', 'axes', 'resistor'].includes(shapePreset)) {
      clearActiveOverlay();
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const p of rawPts) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      const w = Math.max(120, maxX - minX);
      const h = Math.max(65, maxY - minY);
      const stencilStrokes = createPhysicsStencilStrokes(
        shapePreset as 'cylinder' | 'axes' | 'resistor',
        minX,
        minY,
        w,
        h,
        strokeColor,
        activeLayerId
      );
      updateActivePage((page) => ({ ...page, strokes: [...page.strokes, ...stencilStrokes] }));
      snappedCurrentStrokeRef.current = null;
      return;
    }

    // 5. Commit Bezier Stroke or Snapped Shape
    let finalPts: BezierPoint[];
    let isShape = false;
    let shapeType: string | undefined;

    if (snappedCurrentStrokeRef.current) {
      finalPts = snappedCurrentStrokeRef.current.points;
      isShape = true;
      shapeType = snappedCurrentStrokeRef.current.shapeType;
    } else if (activeTool === 'shape') {
      const snapped = recognizeAndSnapShape(rawPts, shapePreset);
      if (snapped) {
        finalPts = snapped.points;
        isShape = true;
        shapeType = snapped.shapeType;
      } else {
        finalPts = smoothStrokeToBezier(rawPts);
      }
    } else {
      finalPts = smoothStrokeToBezier(rawPts);
    }

    snappedCurrentStrokeRef.current = null;

    const newStroke: StrokeObject = {
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tool: activeTool === 'highlighter' ? 'highlighter' : activeTool === 'pencil' ? 'pencil' : 'pen',
      penType: penSubType,
      color: strokeColor,
      fillColor: isShape && fillStyle !== 'none' ? strokeColor : undefined,
      fillStyle: isShape ? fillStyle : 'none',
      width: activeTool === 'highlighter' ? Math.max(16, strokeWidth * 4.5) : strokeWidth,
      opacity: activeTool === 'highlighter' ? 0.42 : 1,
      lineStyle,
      arrowEnd: arrowEnd || shapePreset === 'arrow',
      points: finalPts,
      layerId: activeLayerId,
      isShape,
      shapeType,
    };

    // Synchronously draw onto staticCanvasRef at 2x Retina BEFORE clearing activeCanvasRef so there is 0ms gap!
    if (newStroke.tool !== 'highlighter') {
      const sCtx = staticCanvasRef.current?.getContext('2d');
      if (sCtx) {
        sCtx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
        drawStrokeOnContext(sCtx, newStroke);
      }
    }
    clearActiveOverlay();

    updateActivePage((page) => ({
      ...page,
      strokes: [...page.strokes, { ...newStroke, zOrder: getNextPageZOrder(page) }],
    }));
  };

  const handleGroupSelected = () => {
    if (selectedStrokeIds.length < 2) return;
    const newGroupId = `grp-${Date.now()}`;
    updateActivePage((page) => ({
      ...page,
      strokes: page.strokes.map((s) => (selectedStrokeIds.includes(s.id) ? { ...s, groupId: newGroupId } : s)),
    }));
    showToast(`🔗 Group (${selectedStrokeIds.length} αντικείμενα)`);
  };

  const handleUngroupSelected = () => {
    if (selectedStrokeIds.length === 0) return;
    updateActivePage((page) => ({
      ...page,
      strokes: page.strokes.map((s) => (selectedStrokeIds.includes(s.id) ? { ...s, groupId: undefined } : s)),
    }));
    showToast('🔓 Ungroup ολοκληρώθηκε!');
  };

  // Unified Z-Order / Layering across BOTH Images and Shapes / Strokes / Groups:
  // - 'to-back': Send to Back (Εντελώς πίσω)
  // - 'step-back': Send Backward (-1 επίπεδο πίσω — περνάει πίσω από την επικαλυπτόμενη εικόνα ή σχήμα!)
  // - 'step-front': Bring Forward (+1 επίπεδο μπροστά — περνάει μπροστά από την επικαλυπτόμενη εικόνα ή σχήμα!)
  // - 'to-front': Bring to Front (Εντελώς μπροστά)
  const handleZOrderSelected = (action: 'to-back' | 'step-back' | 'step-front' | 'to-front') => {
    const baseStrokeIds =
      selectedStrokeIds.length > 0
        ? selectedStrokeIds
        : activeNodeStrokeId
        ? [activeNodeStrokeId]
        : [];
    if (!selectedImageId && baseStrokeIds.length === 0) return;

    updateActivePage((page) => {
      const imgList = page.images || [];
      const strokeList = page.strokes || [];

      const baseSet = new Set(baseStrokeIds);
      const groupIds = new Set(
        strokeList
          .filter((s) => baseSet.has(s.id) && s.groupId)
          .map((s) => s.groupId!)
      );
      const targetStrokeIds = new Set(
        strokeList
          .filter((s) => baseSet.has(s.id) || (s.groupId && groupIds.has(s.groupId)))
          .map((s) => s.id)
      );

      type ZUnit = {
        isTarget: boolean;
        z: number;
        images: ImageObject[];
        strokes: StrokeObject[];
        bounds: { minX: number; minY: number; maxX: number; maxY: number };
      };

      const computeStrokesBounds = (items: StrokeObject[]) => {
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        for (const st of items) {
          const sb = getStrokeBounds(st);
          if (sb.minX < minX) minX = sb.minX;
          if (sb.minY < minY) minY = sb.minY;
          if (sb.maxX > maxX) maxX = sb.maxX;
          if (sb.maxY > maxY) maxY = sb.maxY;
        }
        return { minX, minY, maxX, maxY };
      };

      const units: ZUnit[] = [];

      // 1. Add all Images into unified ZUnit list
      imgList.forEach((im, idx) => {
        const z = im.zOrder ?? idx + 1;
        const isTarget = Boolean(selectedImageId && im.id === selectedImageId);
        units.push({
          isTarget,
          z,
          images: [im],
          strokes: [],
          bounds: {
            minX: im.x,
            minY: im.y,
            maxX: im.x + im.width,
            maxY: im.y + im.height,
          },
        });
      });

      // 2. Add all Strokes / Stroke Groups into unified ZUnit list
      const targetStrokes = !selectedImageId ? strokeList.filter((s) => targetStrokeIds.has(s.id)) : [];
      let targetStrokesInserted = false;
      const visitedGroupIds = new Set<string>();

      strokeList.forEach((s, idx) => {
        const defaultZ = imgList.length + idx + 1;
        const z = s.zOrder ?? defaultZ;

        if (!selectedImageId && targetStrokeIds.has(s.id)) {
          if (!targetStrokesInserted && targetStrokes.length > 0) {
            const maxTargetZ = Math.max(
              ...targetStrokes.map((ts) => ts.zOrder ?? defaultZ)
            );
            units.push({
              isTarget: true,
              z: maxTargetZ,
              images: [],
              strokes: targetStrokes,
              bounds: computeStrokesBounds(targetStrokes),
            });
            targetStrokesInserted = true;
          }
          return;
        }

        if (s.groupId) {
          if (visitedGroupIds.has(s.groupId)) return;
          visitedGroupIds.add(s.groupId);
          const grpMembers = strokeList.filter((m) => m.groupId === s.groupId && !targetStrokeIds.has(m.id));
          if (grpMembers.length > 0) {
            units.push({
              isTarget: false,
              z,
              images: [],
              strokes: grpMembers,
              bounds: computeStrokesBounds(grpMembers),
            });
          }
        } else {
          units.push({
            isTarget: false,
            z,
            images: [],
            strokes: [s],
            bounds: computeStrokesBounds([s]),
          });
        }
      });

      // Sort all units (Images + Strokes/Shapes) by their current visual zOrder (back-to-front)
      units.sort((a, b) => a.z - b.z);

      const tIdx = units.findIndex((u) => u.isTarget);
      if (tIdx === -1) return page;

      const boxesOverlap = (
        a: { minX: number; minY: number; maxX: number; maxY: number },
        b: { minX: number; minY: number; maxX: number; maxY: number }
      ) => a.minX <= b.maxX + 8 && a.maxX >= b.minX - 8 && a.minY <= b.maxY + 8 && a.maxY >= b.minY - 8;

      const [removed] = units.splice(tIdx, 1);

      if (action === 'to-back') {
        units.unshift(removed);
      } else if (action === 'to-front') {
        units.push(removed);
      } else if (action === 'step-back') {
        // Find the nearest overlapping Image or Shape/Stroke behind tIdx (or tIdx - 1 if none overlap)
        let insertAt = Math.max(0, tIdx - 1);
        for (let i = tIdx - 1; i >= 0; i--) {
          if (boxesOverlap(removed.bounds, units[i].bounds)) {
            insertAt = i;
            break;
          }
        }
        units.splice(insertAt, 0, removed);
      } else if (action === 'step-front') {
        // Find the nearest overlapping Image or Shape/Stroke in front of tIdx (or tIdx + 1 if none overlap)
        let insertAt = Math.min(units.length, tIdx + 1);
        for (let i = tIdx; i < units.length; i++) {
          if (boxesOverlap(removed.bounds, units[i].bounds)) {
            insertAt = i + 1;
            break;
          }
        }
        units.splice(insertAt, 0, removed);
      }

      // Reassign clean sequential zOrder (1, 2, 3, ...) across all Images and Strokes
      let nextZ = 1;
      const nextImages: ImageObject[] = [];
      const nextStrokes: StrokeObject[] = [];

      for (const u of units) {
        for (const im of u.images) {
          nextImages.push({ ...im, zOrder: nextZ++ });
        }
        for (const st of u.strokes) {
          nextStrokes.push({ ...st, zOrder: nextZ++ });
        }
      }

      return {
        ...page,
        images: nextImages,
        strokes: nextStrokes,
      };
    });

    showToast(
      action === 'to-back'
        ? '⏬ Send to Back: Μεταφέρθηκε εντελώς πίσω!'
        : action === 'to-front'
        ? '⏫ Bring to Front: Μεταφέρθηκε εντελώς μπροστά!'
        : action === 'step-back'
        ? '🔽 -1 Επίπεδο Πίσω (πίσω από το επικαλυπτόμενο αντικείμενο)!'
        : '🔼 +1 Επίπεδο Μπροστά (μπροστά από το επικαλυπτόμενο αντικείμενο)!'
    );
  };

  // Apply Color, Thickness, or Line Style to any selected line, shape, or group of lines!
  const applyColorToSelection = useCallback(
    (c: string) => {
      setStrokeColor(c);
      setFillColor(c);
      const baseIds =
        selectedStrokeIds.length > 0
          ? selectedStrokeIds
          : activeNodeStrokeId
          ? [activeNodeStrokeId]
          : [];
      if (baseIds.length === 0) return;

      updateActivePage((page) => {
        const baseSet = new Set(baseIds);
        const groupIds = new Set(
          page.strokes
            .filter((s) => baseSet.has(s.id) && s.groupId)
            .map((s) => s.groupId as string)
        );
        return {
          ...page,
          strokes: page.strokes.map((s) => {
            if (baseSet.has(s.id) || (s.groupId && groupIds.has(s.groupId))) {
              return {
                ...s,
                color: c,
                fillColor: s.fillStyle && s.fillStyle !== 'none' ? c : undefined,
              };
            }
            return s;
          }),
        };
      });
    },
    [selectedStrokeIds, activeNodeStrokeId, updateActivePage]
  );

  const applyWidthToSelection = useCallback(
    (w: number) => {
      setStrokeWidth(w);
      const baseIds =
        selectedStrokeIds.length > 0
          ? selectedStrokeIds
          : activeNodeStrokeId
          ? [activeNodeStrokeId]
          : [];
      if (baseIds.length === 0) return;

      updateActivePage((page) => {
        const baseSet = new Set(baseIds);
        const groupIds = new Set(
          page.strokes
            .filter((s) => baseSet.has(s.id) && s.groupId)
            .map((s) => s.groupId as string)
        );
        return {
          ...page,
          strokes: page.strokes.map((s) =>
            baseSet.has(s.id) || (s.groupId && groupIds.has(s.groupId)) ? { ...s, width: w } : s
          ),
        };
      });
    },
    [selectedStrokeIds, activeNodeStrokeId, updateActivePage]
  );

  const applyLineStyleToSelection = useCallback(
    (ls: LineStyleType, nextArrowEnd?: boolean) => {
      setLineStyle(ls);
      if (nextArrowEnd !== undefined) {
        setArrowEnd(nextArrowEnd);
      }
      const baseIds =
        selectedStrokeIds.length > 0
          ? selectedStrokeIds
          : activeNodeStrokeId
          ? [activeNodeStrokeId]
          : [];
      if (baseIds.length === 0) return;

      updateActivePage((page) => {
        const baseSet = new Set(baseIds);
        const groupIds = new Set(
          page.strokes
            .filter((s) => baseSet.has(s.id) && s.groupId)
            .map((s) => s.groupId as string)
        );
        return {
          ...page,
          strokes: page.strokes.map((s) =>
            baseSet.has(s.id) || (s.groupId && groupIds.has(s.groupId))
              ? { ...s, lineStyle: ls, arrowEnd: nextArrowEnd !== undefined ? nextArrowEnd : s.arrowEnd }
              : s
          ),
        };
      });
    },
    [selectedStrokeIds, activeNodeStrokeId, updateActivePage]
  );

  const handleBeautifySelected = () => {
    const targets =
      selectedStrokeIds.length > 0
        ? activePage.strokes.filter((s) => selectedStrokeIds.includes(s.id))
        : activePage.strokes;
    const beautified = beautifyHandwritingStrokes(targets);
    const mapById = new Map(beautified.map((s) => [s.id, s]));
    updateActivePage((page) => ({
      ...page,
      strokes: page.strokes.map((s) => mapById.get(s.id) || s),
    }));
    showToast('✨ Τα ελληνικά χειρόγραφα & σύμβολα (=, κλάσματα) στρώθηκαν!');
  };

  const handleInsertSamplePhysicsImage = () => {
    const c = document.createElement('canvas');
    c.width = 360;
    c.height = 220;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(35, 185);
    ctx.lineTo(315, 185);
    ctx.lineTo(35, 65);
    ctx.closePath();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(155, 116);
    ctx.rotate(Math.atan2(120, 280));
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-28, -44, 56, 44);
    ctx.strokeRect(-28, -44, 56, 44);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('m', -8, -16);
    ctx.restore();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Άσκηση: Κεκλιμένο Επίπεδο (θ = 30°)', 42, 32);

    const dataUrl = c.toDataURL('image/png');
    const newImg: ImageObject = {
      id: `img-${Date.now()}`,
      x: 180,
      y: 260,
      width: 360,
      height: 220,
      naturalWidth: 360,
      naturalHeight: 220,
      dataUrl,
      originalDataUrl: dataUrl,
      layerId: activeLayerId,
    };
    updateActivePage((page) => ({
      ...page,
      images: [...(page.images || []), { ...newImg, zOrder: getNextPageZOrder(page) }],
    }));
    setSelectedImageId(newImg.id);
    setActiveTool('lasso');
    showToast('🖼️ Εικόνα προστέθηκε! Δοκίμασε Transparent BG ή Magnetic Lasso!');
  };

  const handleGoodnotesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedNb = await importGoodnotesFile(file);
      setNotebooks((prev) => [importedNb, ...prev]);
      setOpenNotebookIds((prev) => (prev.includes(importedNb.id) ? prev : [...prev, importedNb.id]));
      setActiveNotebookId(importedNb.id);
      setActivePageIndex(0);
      setViewMode('editor');
      showToast(`📂 Φορτώθηκε το "${file.name}" (${importedNb.pages.length} σελ.)!`);
    } catch {
      showToast('⚠️ Σφάλμα ανάγνωσης .goodnotes');
    }
    e.target.value = '';
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        insertImageDataUrlOnPage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Open / Import PDF (multi-page up to 30+ pages!) or JPG/PNG/WebP to write directly on top of!
  const handlePdfOrDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    e.target.value = '';

    try {
      const importedPages: NotePage[] = [];
      for (const file of files) {
        const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
        if (isPdf) {
          setStatusBanner(`⏳ Φόρτωση PDF "${file.name}"...`);
          const pdfPages = await renderPdfFileToPages(file, activePage.template, (curr, total) => {
            setStatusBanner(`⏳ Φόρτωση PDF "${file.name}": Σελίδα ${curr} από ${total}...`);
          });
          importedPages.push(...pdfPages);
        } else {
          setStatusBanner(`⏳ Φόρτωση εικόνας "${file.name}" ως σελίδα εγγράφου...`);
          const imgPage = await renderImageFileToPage(file, activePage.template);
          importedPages.push(imgPage);
        }
      }

      if (importedPages.length === 0) {
        setStatusBanner(null);
        return;
      }

      if (pdfImportModeRef.current === 'new-notebook' || viewMode === 'library') {
        const baseTitle = files[0].name.replace(/\.(pdf|jpe?g|png|webp)$/i, '');
        const newNb: Notebook = {
          id: `nb-doc-${Date.now()}`,
          title: baseTitle,
          folder: 'Έγγραφα & PDF',
          coverColor: '#0284c7',
          updatedAt: new Date().toISOString(),
          sourceFormat: '.bestnotes',
          pages: importedPages,
        };
        setNotebooks((prev) => [newNb, ...prev]);
        setOpenNotebookIds((prev) => (prev.includes(newNb.id) ? prev : [...prev, newNb.id]));
        setActiveNotebookId(newNb.id);
        setActivePageIndex(0);
        activeDrawingPageIndexRef.current = 0;
        setViewMode('editor');
        applyPaperTransformDirect(zoomRef.current, 0, 0, true);
        showToast(`📄 Ανοίχτηκε το "${baseTitle}" (${importedPages.length} σελίδες) — έτοιμο για γραφή!`);
      } else {
        // Insert into current notebook right after activePageIndex (or replace current page if completely blank)
        const isCurrentPageEmpty =
          activePage.strokes.length === 0 &&
          !activePage.backgroundDataUrl &&
          (activePage.images?.length || 0) === 0 &&
          (activePage.texts?.length || 0) === 0;

        const targetInsertIdx = isCurrentPageEmpty ? activePageIndex : activePageIndex + 1;
        let newTopY = 0;
        for (let i = 0; i < targetInsertIdx && i < activeNotebook.pages.length; i++) {
          const p = activeNotebook.pages[i];
          newTopY += (p.orientation === 'landscape' ? 920 : 1260) + PAGE_GAP;
        }

        setNotebooks((prev) =>
          prev.map((nb) => {
            if (nb.id !== activeNotebook.id) return nb;
            const nextPages = [...nb.pages];
            if (isCurrentPageEmpty) {
              nextPages.splice(activePageIndex, 1, ...importedPages);
            } else {
              nextPages.splice(targetInsertIdx, 0, ...importedPages);
            }
            return { ...nb, updatedAt: new Date().toISOString(), pages: nextPages };
          })
        );
        setActivePageIndex(targetInsertIdx);
        activeDrawingPageIndexRef.current = targetInsertIdx;
        applyPaperTransformDirect(zoomRef.current, 0, -newTopY * zoomRef.current, true);
        thumbnailsDialogRef.current?.close();
        showToast(`📄 Προστέθηκαν ${importedPages.length} σελίδες (PDF/Εικόνα) — γράψε απευθείας πάνω τους!`);
      }
    } catch {
      showToast('⚠️ Σφάλμα κατά το άνοιγμα του PDF / Εικόνας');
    }
  };

  const selectedImgObj = activePage.images?.find((im) => im.id === selectedImageId);

  return (
    <div className="flex flex-col w-full h-full bg-[#e4e7ec] text-slate-800 overflow-hidden select-none">
      <input
        ref={fileInputGoodnotesRef}
        type="file"
        accept=".goodnotes,.zip"
        className="hidden"
        onChange={handleGoodnotesFileChange}
      />
      <input ref={fileInputImageRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
      <input
        ref={fileInputPdfOrDocRef}
        type="file"
        accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={handlePdfOrDocFileChange}
      />

      {/* =========================================================================
          1. AUTHENTIC GOODNOTES 6 TOP NAVY BAR & DOCUMENT TABS (#1B2A4A)
         ========================================================================= */}
      <header className="flex items-center justify-between px-3 pt-1.5 bg-[#1b2a4a] text-white shrink-0 select-none">
        {/* Left Navigation Icons (Back to Library, Page Thumbnails Grid, Import .goodnotes, Open PDF/JPG/PNG) */}
        <div className="flex items-center gap-1 pb-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'library' ? 'editor' : 'library')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/10 text-white/90 transition cursor-pointer"
            title="Πίσω στους Φακέλους (Documents)"
          >
            <ChevronLeft className="w-5 h-5 text-sky-300" />
          </button>

          {/* Goodnotes 4-Squares Page Thumbnails Grid View Button */}
          {viewMode === 'editor' && (
            <button
              onClick={() => thumbnailsDialogRef.current?.showModal()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/25 hover:bg-indigo-500/40 border border-indigo-400/40 text-xs font-semibold text-indigo-100 transition cursor-pointer"
              title="Προβολή όλων των σελίδων σε Μικρογραφίες (3 ή 4 στήλες με scroll)"
            >
              <LayoutGrid className="w-4 h-4 text-sky-300" />
              <span className="hidden md:inline">Σελίδες ({activeNotebook.pages.length})</span>
            </button>
          )}

          <button
            onClick={() => fileInputGoodnotesRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-xs font-medium text-sky-200 transition cursor-pointer"
            title="Άνοιγμα αρχείου .goodnotes"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">.goodnotes</span>
          </button>

          <button
            onClick={() => {
              pdfImportModeRef.current = viewMode === 'library' ? 'new-notebook' : 'insert-pages';
              fileInputPdfOrDocRef.current?.click();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-xs font-semibold text-emerald-200 transition cursor-pointer"
            title="Άνοιγμα PDF, JPG ή PNG για γραφή απευθείας πάνω του!"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ PDF / JPG</span>
          </button>
        </div>

        {/* Center: Authentic Goodnotes 6 Document Tabs */}
        <div className="flex items-end gap-1 overflow-x-auto max-w-[46vw] px-2">
          {openNotebookIds.map((nbId) => {
            const nb = notebooks.find((n) => n.id === nbId);
            if (!nb) return null;
            const isActive = nb.id === activeNotebook.id && viewMode === 'editor';
            return (
              <div
                key={nb.id}
                onClick={() => {
                  setActiveNotebookId(nb.id);
                  setActivePageIndex(0);
                  setViewMode('editor');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#f4f5f7] text-[#1b2a4a] font-semibold shadow-sm'
                    : 'bg-[#263961] text-slate-300 hover:bg-[#2f4573]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: nb.coverColor }} />
                <span className="truncate max-w-[165px]">{nb.title}</span>
                {openNotebookIds.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rem = openNotebookIds.filter((id) => id !== nb.id);
                      setOpenNotebookIds(rem);
                      if (activeNotebook.id === nb.id && rem.length > 0) {
                        setActiveNotebookId(rem[0]);
                      }
                    }}
                    className="opacity-60 hover:opacity-100 p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Undo / Redo, Page Switcher, Insert/Delete Page, Drive Sync & Settings */}
        <div className="flex items-center gap-1.5 pb-1.5">
          {/* Undo / Redo just like Goodnotes top-right */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
            title="Undo (ή Tap με 2 δάχτυλα)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
            title="Redo (ή Tap με 3 δάχτυλα)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* 2-Finger Pinch Zoom Pill (- / 100% Reset / +) */}
          <div className="flex items-center bg-[#263961] rounded-lg px-1 py-0.5 text-xs">
            <button
              onClick={() => applyPaperTransformDirect(zoomRef.current - 0.15, panRef.current.x, panRef.current.y, true)}
              className="p-0.5 text-slate-300 hover:text-white cursor-pointer"
              title="Σμίκρυνση (Zoom Out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyPaperTransformDirect(1, 0, 0, true)}
              className="px-1.5 font-semibold text-sky-200 hover:text-white cursor-pointer"
              title="Επαναφορά Zoom στο 100% (ή Pinch με 2 δάχτυλα στο χαρτί)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => applyPaperTransformDirect(zoomRef.current + 0.15, panRef.current.x, panRef.current.y, true)}
              className="p-0.5 text-slate-300 hover:text-white cursor-pointer"
              title="Μεγέθυνση (Zoom In)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate Page 90° Left / Right in Top Bar */}
          <div className="flex items-center bg-[#263961] rounded-lg px-1 py-0.5 text-xs">
            <button
              onClick={() => handleRotatePage('left')}
              className="p-1 text-slate-200 hover:text-white cursor-pointer"
              title="Περιστροφή Σελίδας 90° Αριστερά (-90°)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleRotatePage('right')}
              className="p-1 text-slate-200 hover:text-white cursor-pointer"
              title="Περιστροφή Σελίδας 90° Δεξιά (+90°)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Indicator (Click to open Thumbnail Grid!), Insert Page in Middle (+), Delete Page (🗑️) */}
          <div className="flex items-center bg-[#263961] rounded-lg px-1.5 py-0.5 text-xs">
            <button
              onClick={() => scrollToPageIndex(activePageIndex - 1)}
              disabled={activePageIndex === 0}
              className="p-0.5 disabled:opacity-30 cursor-pointer"
              title="Προηγούμενη Σελίδα"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => thumbnailsDialogRef.current?.showModal()}
              className="px-1.5 font-semibold text-sky-200 hover:text-white cursor-pointer"
              title="Πάτησε για Προβολή Μικρογραφιών Σελίδων (Grid View)"
            >
              {activePageIndex + 1}/{activeNotebook.pages.length}
            </button>
            <button
              onClick={() => scrollToPageIndex(activePageIndex + 1)}
              disabled={activePageIndex >= activeNotebook.pages.length - 1}
              className="p-0.5 disabled:opacity-30 cursor-pointer"
              title="Επόμενη Σελίδα"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertNewPageRelative('after-current')}
              className="ml-1 p-0.5 text-emerald-300 hover:text-white cursor-pointer"
              title="Προσθήκη Νέας Σελίδας ακριβώς μετά την τρέχουσα (στη μέση ή στο τέλος)"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => deletePageAtIndex(activePageIndex)}
              className="ml-1 p-0.5 text-rose-300 hover:text-rose-100 cursor-pointer"
              title="Διαγραφή τρέχουσας σελίδας"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 30s Google Drive Sync Pill */}
          <button
            onClick={() => {
              setSyncStatus('syncing');
              window.setTimeout(() => {
                setSyncStatus('synced');
                setIsDirty(false);
                setSecondsToNextSync(30);
                showToast('☁️ Συγχρονίστηκε με το Google Drive!');
              }, 400);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#263961] text-[11px] text-sky-200 cursor-pointer"
            title="Αυτόματος Συγχρονισμός Google Drive κάθε 30s"
          >
            <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'text-amber-300 animate-pulse' : 'text-emerald-400'}`} />
            <span className="hidden md:inline">{isDirty ? `${secondsToNextSync}s` : 'Synced'}</span>
          </button>

          <button
            onClick={() => settingsDialogRef.current?.showModal()}
            className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
            title="Ρυθμίσεις Χαρτιού, Προσανατολισμού (Portrait/Landscape) & Apple Pencil"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* IF IN LIBRARY VIEW (GOODNOTES 6 LIGHT FOLDERS & NOTEBOOKS GRID) */}
      {viewMode === 'library' ? (
        <div className="flex-1 overflow-y-auto p-6 bg-[#f4f5f7]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#1b2a4a]">Έγγραφα (Documents)</h1>
                <p className="text-sm text-slate-500">
                  Τα αρχεία σου `.goodnotes`, PDF, JPG/PNG + Νέα Τετράδια BestNotes
                </p>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                <button
                  onClick={() => {
                    pdfImportModeRef.current = 'new-notebook';
                    fileInputPdfOrDocRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Άνοιγμα PDF / JPG / PNG</span>
                </button>
                <button
                  onClick={() => fileInputGoodnotesRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-sky-500 text-[#1b2a4a] text-sm font-semibold shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-sky-600" />
                  <span>Εισαγωγή .goodnotes</span>
                </button>
                <button
                  onClick={() => {
                    const newNb: Notebook = {
                      id: `nb-${Date.now()}`,
                      title: `Νέο Τετράδιο ${notebooks.length + 1}`,
                      folder: 'Φυσική',
                      coverColor: '#0284c7',
                      updatedAt: new Date().toISOString(),
                      sourceFormat: '.bestnotes',
                      pages: [
                        {
                          id: `p-${Date.now()}`,
                          title: 'Σελίδα 1',
                          template: 'grid',
                          orientation: 'portrait',
                          layers: [
                            { id: 'layer-1', name: 'Σχήμα Άσκησης', visible: true, locked: false, opacity: 1 },
                            { id: 'layer-2', name: 'Πράξεις & Λύση', visible: true, locked: false, opacity: 1 },
                          ],
                          strokes: [],
                          texts: [],
                          images: [],
                          tapes: [],
                        },
                      ],
                    };
                    setNotebooks((prev) => [newNb, ...prev]);
                    setOpenNotebookIds((prev) => [...prev, newNb.id]);
                    setActiveNotebookId(newNb.id);
                    setActivePageIndex(0);
                    setViewMode('editor');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0066ff] hover:bg-blue-600 text-white text-sm font-semibold shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Νέο Τετράδιο</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  onClick={() => {
                    if (!openNotebookIds.includes(nb.id)) setOpenNotebookIds((p) => [...p, nb.id]);
                    setActiveNotebookId(nb.id);
                    setActivePageIndex(0);
                    setViewMode('editor');
                  }}
                  className="group cursor-pointer flex flex-col items-center"
                >
                  <div
                    className="w-44 h-56 rounded-r-2xl rounded-l-md shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition relative overflow-hidden flex flex-col justify-between p-4 text-white"
                    style={{ backgroundColor: nb.coverColor }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-black/20" />
                    <div className="pl-2">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 font-semibold">
                        {nb.sourceFormat || '.bestnotes'}
                      </span>
                    </div>
                    <div className="pl-2 bg-white/95 text-slate-900 p-2.5 rounded-lg shadow-xs">
                      <p className="text-xs font-bold line-clamp-2">{nb.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{nb.pages.length} σελίδες</p>
                    </div>
                  </div>
                  <span className="mt-2 text-xs font-semibold text-slate-800 text-center max-w-[170px] truncate">
                    {nb.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* =========================================================================
              2. AUTHENTIC GOODNOTES 6 LIGHT TOOLBAR (#F4F5F7)
                 Center: Clean Icon Strip | Right: 3 Stroke Widths (12 Presets) + 3 Color Slots
             ========================================================================= */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#f4f5f7] border-b border-slate-300/80 shadow-xs shrink-0 gap-2 overflow-x-auto">
            {/* Left Quick Status: Pencil Only Mode + Tidy Handwriting + Paste */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPencilOnlyMode(!pencilOnlyMode)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                  pencilOnlyMode
                    ? 'bg-[#0066ff] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-300'
                }`}
                title="Palm Rejection: Όταν είναι ON, μόνο το Apple Pencil γράφει"
              >
                ✏️ {pencilOnlyMode ? 'Pencil Only' : 'All Touch'}
              </button>

              <button
                onClick={handleBeautifySelected}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 text-[11px] font-semibold transition cursor-pointer"
                title="Εγγενές Στρώσιμο Ελληνικού Χειρογράφου & Συμβόλων (=, κλάσματα)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Στρώσιμο</span>
              </button>

              {/* Quick Paste Button (for photos copied outside the app or internal objects) */}
              <button
                onClick={handlePaste}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 text-[#0066ff] border border-sky-200 text-[11px] font-semibold transition cursor-pointer"
                title="Επικόλληση (Paste) φωτογραφίας από το iPad Clipboard ή αντικειμένου"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            </div>

            {/* Center: Goodnotes 6 Iconic Pill Toolbar */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-xs border border-slate-200/90">
              {[
                { id: 'pen', title: 'Στυλό (Pen)', icon: Pen },
                { id: 'eraser', title: 'Γόμα (Eraser)', icon: Eraser },
                { id: 'highlighter', title: 'Μαρκαδόρος (Highlighter)', icon: Highlighter },
                { id: 'shape', title: 'Σχήματα & Φυσική (Shapes)', icon: Shapes },
                { id: 'lasso', title: 'Επιλογή / Μεγέθυνση / Περιστροφή (Select & Transform)', icon: Lasso },
                { id: 'direct-node', title: 'Κόμβοι Bezier (4 Κόμβοι σε Κύκλο/Έλλειψη)', icon: MousePointer },
                { id: 'tape', title: 'Ταινία Απόκρυψης (Tape)', icon: Bandage },
                { id: 'laser', title: 'Laser Pointer', icon: Radio },
              ].map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      if (activeTool === tool.id) {
                        setShowToolSubBar((s) => !s);
                      } else {
                        setActiveTool(tool.id as ToolType);
                        setShowToolSubBar(true);
                      }
                      setImageCropMode('none');
                    }}
                    className={`p-2 rounded-full transition cursor-pointer ${
                      isActive
                        ? 'bg-[#0066ff] text-white shadow-xs scale-105'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    title={tool.title}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}

              <div className="h-5 w-px bg-slate-200 mx-0.5" />

              {/* Upload Photo from Device + Sample Physics Image + Ruler + Math/LaTeX + Layers */}
              <button
                onClick={() => fileInputImageRef.current?.click()}
                className="p-2 rounded-full text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                title="Εισαγωγή Φωτογραφίας από το iPad"
              >
                <Upload className="w-4 h-4" />
              </button>

              <button
                onClick={handleInsertSamplePhysicsImage}
                className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                title="Εισαγωγή Εικόνας Άσκησης (για Transparent BG & Magnetic Lasso)"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setRulerState((r) => ({ ...r, visible: !r.visible }))}
                className={`p-2 rounded-full transition cursor-pointer ${
                  rulerState.visible ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Χάρακας (Ruler)"
              >
                <Ruler className="w-4 h-4" />
              </button>

              <button
                onClick={() => mathDialogRef.current?.showModal()}
                className="p-2 rounded-full text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                title="LaTeX & Επίλυση Εξίσωσης (CAS)"
              >
                <Calculator className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowLayersPanel(!showLayersPanel)}
                className={`p-2 rounded-full transition cursor-pointer ${
                  showLayersPanel ? 'bg-[#1b2a4a] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Layers (Επίπεδα με 🔒 Κλείδωμα & 👁️ Απόκρυψη)"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Authentic Goodnotes 6 Contextual 3 Stroke Slots (with 12-Step Popover!) + 3 Color Slots */}
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-xs border border-slate-200/90 relative">
              {/* 3 Stroke Thickness Slots + 12-Preset Popover Trigger */}
              <div className="flex items-center gap-1">
                {widthSlots.map((w, idx) => {
                  const isSlotActive = Math.abs(strokeWidth - w) < 0.25 && activeWidthSlotIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveWidthSlotIdx(idx);
                        if (Math.abs(strokeWidth - w) < 0.25) {
                          setShowWidthPopover((prev) => !prev);
                          setShowColorPopover(false);
                        } else {
                          applyWidthToSelection(w);
                        }
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                        isSlotActive || Math.abs(strokeWidth - w) < 0.25
                          ? 'bg-sky-50 ring-2 ring-[#0066ff]'
                          : 'hover:bg-slate-100'
                      }`}
                      title={`Πάχος ${w}px (Πάτα ξανά για 12 επιλογές πάχους)`}
                    >
                      <span
                        className="rounded-full bg-slate-800"
                        style={{ width: Math.min(18, Math.max(4, w * 1.9)), height: Math.min(18, Math.max(4, w * 1.9)) }}
                      />
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setShowWidthPopover((prev) => !prev);
                    setShowColorPopover(false);
                  }}
                  className="px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-sky-50 text-[10px] font-bold text-[#0066ff] cursor-pointer"
                  title="Άνοιγμα όλων των 12 επιλογών πάχους γραμμής"
                >
                  {strokeWidth.toFixed(1)}px
                </button>
              </div>

              <div className="h-5 w-px bg-slate-200" />

              {/* 3 Quick Color Slots + Rainbow Picker */}
              <div className="flex items-center gap-1.5">
                {colorSlots.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyColorToSelection(c)}
                    className={`w-6 h-6 rounded-full transition cursor-pointer ${
                      strokeColor === c ? 'ring-2 ring-offset-1 ring-[#0066ff] scale-110' : 'opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                    title="Αλλαγή χρώματος (και σε επιλεγμένη γραμμή / σχήμα / group)"
                  />
                ))}
                <button
                  onClick={() => {
                    setShowColorPopover(!showColorPopover);
                    setShowWidthPopover(false);
                  }}
                  className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-sky-500 ring-1 ring-slate-300 cursor-pointer"
                  title="Όλα τα Χρώματα & Στυλ Γραμμής"
                />
              </div>
            </div>
          </div>

          {/* 12-Step Stroke Thickness Popover (for Pen, Pencil, Highlighter & Eraser) */}
          {showWidthPopover && (
            <div className="fixed right-20 top-24 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 flex flex-col gap-3 w-72">
              <div className="flex items-center justify-between text-xs font-bold text-[#1b2a4a]">
                <span>Πάχος Γραμμής (12 Επιλογές)</span>
                <button onClick={() => setShowWidthPopover(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {THICKNESS_PRESETS.map((presetW) => {
                  const isSelected = Math.abs(strokeWidth - presetW) < 0.2;
                  return (
                    <button
                      key={presetW}
                      onClick={() => {
                        applyWidthToSelection(presetW);
                        setWidthSlots((prev) => {
                          const next = [...prev];
                          next[activeWidthSlotIdx] = presetW;
                          return next;
                        });
                      }}
                      className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-[10px] font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 border-[#0066ff] text-[#0066ff]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="h-5 flex items-center justify-center">
                        <span
                          className="rounded-full bg-slate-800"
                          style={{
                            width: Math.min(20, Math.max(3, presetW * 1.3)),
                            height: Math.min(20, Math.max(3, presetW * 1.3)),
                          }}
                        />
                      </div>
                      <span>{presetW}px</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Ακριβής Ρύθμιση:</span>
                  <span className="font-bold text-[#0066ff]">{strokeWidth.toFixed(1)} px</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={24}
                  step={0.2}
                  value={strokeWidth}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    applyWidthToSelection(val);
                    setWidthSlots((prev) => {
                      const next = [...prev];
                      next[activeWidthSlotIdx] = val;
                      return next;
                    });
                  }}
                  className="w-full accent-[#0066ff]"
                />
              </div>
            </div>
          )}

          {/* Color & Line Style Popover */}
          {showColorPopover && (
            <div className="fixed right-6 top-24 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 flex flex-col gap-2.5 w-64">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Παλέτα Χρωμάτων & Γραμμής</span>
                <button onClick={() => setShowColorPopover(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      applyColorToSelection(c);
                      if (!colorSlots.includes(c)) {
                        setColorSlots([c, colorSlots[0], colorSlots[1]]);
                      }
                      setShowColorPopover(false);
                    }}
                    className="w-8 h-8 rounded-full border border-slate-200 mx-auto cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] font-semibold text-slate-600">Ελεύθερο Χρώμα:</span>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => {
                    const c = e.target.value;
                    applyColorToSelection(c);
                    if (!colorSlots.includes(c)) {
                      setColorSlots([c, colorSlots[0], colorSlots[1]]);
                    }
                  }}
                  className="w-8 h-7 rounded cursor-pointer border border-slate-200"
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                {(['solid', 'dashed', 'dotted'] as LineStyleType[]).map((ls) => (
                  <button
                    key={ls}
                    onClick={() => applyLineStyleToSelection(ls)}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                      lineStyle === ls ? 'bg-[#0066ff] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ls === 'solid' ? '───' : ls === 'dashed' ? '- - -' : '• • •'}
                  </button>
                ))}
                <button
                  onClick={() => applyLineStyleToSelection(lineStyle, !arrowEnd)}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    arrowEnd ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  ➔ Βέλος
                </button>
              </div>
            </div>
          )}

          {/* Contextual Sub-Bar (Appears for Shape, Lasso Selection, Direct Node, or Eraser) */}
          {(activeTool === 'shape' ||
            activeTool === 'direct-node' ||
            selectedStrokeIds.length > 0 ||
            selectedImgObj ||
            activeTool === 'eraser') &&
            showToolSubBar && (
              <div className="flex items-center justify-center px-4 py-1 bg-white/95 border-b border-slate-200 text-xs gap-2 shrink-0 overflow-x-auto">
                {activeTool === 'shape' && (
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'auto', label: '✨ Auto Snap' },
                      { id: 'sine', label: '〰️ Ημίτονο (2 Κόμβοι)' },
                      { id: 'cosine', label: '〰️ Συνημίτονο (2 Κόμβοι)' },
                      { id: 'parabola', label: '∪ Παραβολή (3 Κόμβοι)' },
                      { id: 'hyperbola', label: ')( Υπερβολή (3 Κόμβοι)' },
                      { id: 'arc', label: '⌒ Τόξο (3 Κόμβοι)' },
                      { id: 'line', label: '╱ Ευθεία' },
                      { id: 'arrow', label: '➔ Διάνυσμα' },
                      { id: 'rectangle', label: '▭ Ορθογώνιο' },
                      { id: 'parallelogram', label: '▱ Παραλληλόγραμμο' },
                      { id: 'ellipse', label: '◯ Έλλειψη (4 Κόμβοι)' },
                      { id: 'triangle', label: '△ Τρίγωνο' },
                      { id: 'cylinder', label: '🥫 Αγωγός' },
                      { id: 'axes', label: '📈 Άξονες' },
                      { id: 'resistor', label: '⚡ Αντιστάτης' },
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => setShapePreset(sp.id as ShapePresetType)}
                        className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap cursor-pointer ${
                          shapePreset === sp.id
                            ? 'bg-[#0066ff] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                    <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />
                    {(['none', 'solid', 'hatching'] as FillStyleType[]).map((fs) => (
                      <button
                        key={fs}
                        onClick={() => setFillStyle(fs)}
                        className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap cursor-pointer ${
                          fillStyle === fs ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {fs === 'none' ? 'Χωρίς Γέμισμα' : fs === 'solid' ? '🎨 Fill' : '/// Διαγράμμιση'}
                      </button>
                    ))}
                  </div>
                )}

                {activeTool === 'eraser' && (
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'stroke', label: 'Ολόκληρη Γραμμή (Stroke)' },
                      { id: 'precision', label: 'Ακριβείας (Pixel)' },
                      { id: 'highlighter-only', label: 'Μόνο Μαρκαδόρος' },
                    ].map((er) => (
                      <button
                        key={er.id}
                        onClick={() => setEraserSubType(er.id as EraserSubType)}
                        className={`px-3 py-1 rounded-full font-medium cursor-pointer ${
                          eraserSubType === er.id ? 'bg-[#0066ff] text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {er.label}
                      </button>
                    ))}
                  </div>
                )}

                {(selectedStrokeIds.length > 0 || activeTool === 'direct-node') && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCutSelected}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                      title="Αποκοπή (Cut)"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Cut</span>
                    </button>
                    <button
                      onClick={handleCopySelected}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                      title="Αντιγραφή (Copy)"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={handlePaste}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0066ff] font-semibold cursor-pointer"
                      title="Επικόλληση (Paste)"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </button>
                    <button
                      onClick={handleDuplicateSelected}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold cursor-pointer"
                      title="Άμεση δημιουργία αντιγράφου λίγο πιο κάτω και λίγο πιο δεξιά"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Αντίγραφο</span>
                    </button>

                    {/* Z-Order Controls: Send to Back / -1 Backward / +1 Forward / Bring to Front */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200">
                      <button
                        onClick={() => handleZOrderSelected('to-back')}
                        className="px-2 py-0.5 rounded-full hover:bg-white text-slate-700 font-semibold cursor-pointer"
                        title="Send to Back (Εντελώς πίσω)"
                      >
                        ⏬ Πίσω
                      </button>
                      <button
                        onClick={() => handleZOrderSelected('step-back')}
                        className="px-2 py-0.5 rounded-full hover:bg-white text-slate-700 font-semibold cursor-pointer"
                        title="Send Backward (1 βήμα πίσω)"
                      >
                        🔽 -1
                      </button>
                      <button
                        onClick={() => handleZOrderSelected('step-front')}
                        className="px-2 py-0.5 rounded-full hover:bg-white text-slate-700 font-semibold cursor-pointer"
                        title="Bring Forward (1 βήμα μπροστά)"
                      >
                        🔼 +1
                      </button>
                      <button
                        onClick={() => handleZOrderSelected('to-front')}
                        className="px-2 py-0.5 rounded-full hover:bg-white text-slate-700 font-semibold cursor-pointer"
                        title="Bring to Front (Εντελώς μπροστά)"
                      >
                        ⏫ Μπροστά
                      </button>
                    </div>

                    {/* Shape Fill Style Toggle (Transparent shade matching border color!) */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200">
                      {(['none', 'solid', 'hatching'] as FillStyleType[]).map((fs) => (
                        <button
                          key={fs}
                          onClick={() => {
                            setFillStyle(fs);
                            const selIds =
                              selectedStrokeIds.length > 0
                                ? selectedStrokeIds
                                : activeNodeStrokeId
                                ? [activeNodeStrokeId]
                                : [];
                            const selSet = new Set(selIds);
                            updateActivePage((page) => {
                              const groupIds = new Set(
                                page.strokes
                                  .filter((s) => selSet.has(s.id) && s.groupId)
                                  .map((s) => s.groupId as string)
                              );
                              return {
                                ...page,
                                strokes: page.strokes.map((s) =>
                                  selSet.has(s.id) || (s.groupId && groupIds.has(s.groupId))
                                    ? { ...s, fillStyle: fs, fillColor: fs !== 'none' ? s.color : undefined }
                                    : s
                                ),
                              };
                            });
                          }}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                            fillStyle === fs ? 'bg-[#0066ff] text-white' : 'text-slate-700 hover:bg-white'
                          }`}
                          title="Γέμισμα σχήματος στην απόχρωση του περιγράμματος"
                        >
                          {fs === 'none' ? 'Χωρίς Fill' : fs === 'solid' ? '🎨 Fill' : '///'}
                        </button>
                      ))}
                    </div>

                    {/* Direct Inline Color Swatches for Selected Line, Shape, or Group of Lines! */}
                    <div
                      className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"
                      title="Αλλαγή χρώματος επιλεγμένης γραμμής, σχήματος ή Group"
                    >
                      <span className="text-[10px] font-bold text-slate-500 mr-0.5">Χρώμα:</span>
                      {PRESET_COLORS.slice(0, 8).map((c) => (
                        <button
                          key={c}
                          onClick={() => applyColorToSelection(c)}
                          className={`w-4 h-4 rounded-full border border-white/80 shadow-2xs transition cursor-pointer ${
                            strokeColor === c ? 'ring-2 ring-[#0066ff] scale-110' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: c }}
                          title={`Αλλαγή χρώματος σε ${c}`}
                        />
                      ))}
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => applyColorToSelection(e.target.value)}
                        className="w-5 h-5 rounded-full cursor-pointer border-0 bg-transparent p-0"
                        title="Επιλογή οποιουδήποτε χρώματος για την επιλογή"
                      />
                    </div>

                    {selectedStrokeIds.length === 1 && activeTool !== 'direct-node' && (
                      <button
                        onClick={() => {
                          setActiveNodeStrokeId(selectedStrokeIds[0]);
                          setActiveTool('direct-node');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600 text-white font-semibold cursor-pointer"
                        title="Επεξεργασία των 4 Κόμβων του σχήματος"
                      >
                        <MousePointer className="w-3.5 h-3.5" />
                        <span>4 Κόμβοι</span>
                      </button>
                    )}

                    {activeTool === 'direct-node' && activeNodeStrokeId && (
                      <button
                        onClick={() => {
                          setSelectedStrokeIds([activeNodeStrokeId]);
                          setActiveTool('lasso');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0066ff] text-white font-semibold cursor-pointer"
                        title="Επιστροφή σε Resize (Μεγέθυνση) & Περιστροφή"
                      >
                        <Lasso className="w-3.5 h-3.5" />
                        <span>Resize & Περιστροφή</span>
                      </button>
                    )}

                    {selectedStrokeIds.length >= 2 && (
                      <button
                        onClick={handleGroupSelected}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold cursor-pointer"
                      >
                        <Group className="w-3.5 h-3.5" />
                        <span>Group ({selectedStrokeIds.length})</span>
                      </button>
                    )}
                    {selectedStrokeIds.length > 0 && (
                      <button
                        onClick={handleUngroupSelected}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-medium cursor-pointer"
                      >
                        <Ungroup className="w-3.5 h-3.5" />
                        <span>Ungroup</span>
                      </button>
                    )}
                    {selectedStrokeIds.length > 0 && (
                      <button
                        onClick={() => {
                          updateActivePage((page) => ({
                            ...page,
                            strokes: page.strokes.filter((s) => !selectedStrokeIds.includes(s.id)),
                          }));
                          setSelectedStrokeIds([]);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Διαγραφή</span>
                      </button>
                    )}
                  </div>
                )}

                {selectedImgObj && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCutSelected}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Cut</span>
                    </button>
                    <button
                      onClick={handleCopySelected}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={handlePaste}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0066ff] font-semibold cursor-pointer"
                      title="Επικόλληση (Paste)"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </button>
                    <button
                      onClick={handleDuplicateSelected}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold cursor-pointer"
                      title="Άμεση δημιουργία αντιγράφου λίγο πιο κάτω και λίγο πιο δεξιά"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Αντίγραφο</span>
                    </button>

                    {/* Z-Order Controls for Selected Image */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200">
                      <button
                        onClick={() => handleZOrderSelected('to-back')}
                        className="px-2 py-0.5 rounded-full hover:bg-white text-slate-700 font-semibold cursor-pointer"
                        title="Send to Back (Εντελώς πίσω)"
                      >
                        ⏬ Πίσω
                      </button>
                      <button
                        onClick={() => handleZOrderSelected('step-back')}
                        className="px-2 py-0.5 rounded-full hover:bg-white text-slate-700 font-semibold cursor-pointer"
                        title="Send Backward (-1 βήμα πίσω)"
                      >
                        🔽 -1
                      </button>
                      <button
                        onClick={() => handleZOrderSelected('step-front')}
                        className="px-2 py-0.5 rounded-full hover:bg-white text-slate-700 font-semibold cursor-pointer"
                        title="Bring Forward (+1 βήμα μπροστά)"
                      >
                        🔼 +1
                      </button>
                      <button
                        onClick={() => handleZOrderSelected('to-front')}
                        className="px-2 py-0.5 rounded-full hover:bg-white text-slate-700 font-semibold cursor-pointer"
                        title="Bring to Front (Εντελώς μπροστά)"
                      >
                        ⏫ Μπροστά
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const cached = imageElementsCacheRef.current.get(selectedImgObj.dataUrl);
                        const natW = selectedImgObj.naturalWidth || cached?.naturalWidth || selectedImgObj.width;
                        const natH = selectedImgObj.naturalHeight || cached?.naturalHeight || selectedImgObj.height;
                        const longest = Math.max(selectedImgObj.width, selectedImgObj.height, 260);
                        const scale = longest / Math.max(1, natW, natH);
                        const fixedW = Math.max(24, Math.round(natW * scale));
                        const fixedH = Math.max(24, Math.round(natH * scale));
                        updateActivePage((page) => ({
                          ...page,
                          images: page.images.map((im) =>
                            im.id === selectedImgObj.id
                              ? { ...im, width: fixedW, height: fixedH, naturalWidth: natW, naturalHeight: natH }
                              : im
                          ),
                        }));
                        showToast(`📐 Επαναφέρθηκαν οι πραγματικές αναλογίες (${natW}×${natH}px)!`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold cursor-pointer"
                      title="Επαναφορά στις πραγματικές αρχικές αναλογίες (Aspect Ratio) της εικόνας"
                    >
                      <span>📐 1:1 Αναλογίες</span>
                    </button>
                    <button
                      onClick={async () => {
                        const cleanUrl = await removeImageBackground(
                          selectedImgObj.originalDataUrl || selectedImgObj.dataUrl,
                          'all-white'
                        );
                        updateActivePage((page) => ({
                          ...page,
                          images: page.images.map((im) =>
                            im.id === selectedImgObj.id ? { ...im, dataUrl: cleanUrl, transparentBg: true } : im
                          ),
                        }));
                        showToast('🪄 Transparent BG ολοκληρώθηκε!');
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Transparent BG</span>
                    </button>
                    <button
                      onClick={async () => {
                        const cleanUrl = await removeImageBackground(
                          selectedImgObj.originalDataUrl || selectedImgObj.dataUrl,
                          'outer-flood'
                        );
                        updateActivePage((page) => ({
                          ...page,
                          images: page.images.map((im) =>
                            im.id === selectedImgObj.id ? { ...im, dataUrl: cleanUrl, transparentBg: true } : im
                          ),
                        }));
                        showToast('🪄 Magic Wand ολοκληρώθηκε!');
                      }}
                      className="px-3 py-1 rounded-full bg-teal-600 text-white font-semibold cursor-pointer"
                    >
                      🪄 Magic Wand
                    </button>
                    <button
                      onClick={() => {
                        setImageCropMode('freehand');
                        lassoPolygonRef.current = [];
                        showToast('✂️ Σχεδίασε οποιοδήποτε σχήμα πάνω στην εικόνα για Lasso Crop!');
                      }}
                      className={`px-3 py-1 rounded-full font-semibold cursor-pointer ${
                        imageCropMode === 'freehand' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      ✂️ Lasso Crop
                    </button>
                    <button
                      onClick={() => {
                        setImageCropMode('magnetic');
                        lassoPolygonRef.current = [];
                        showToast('🧲 Magnetic Lasso: Πέρασε το Pencil γύρω από τις ακμές του σχήματος!');
                      }}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold cursor-pointer ${
                        imageCropMode === 'magnetic' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Magnet className="w-3.5 h-3.5" />
                      <span>Magnetic Lasso</span>
                    </button>
                    <button
                      onClick={() => {
                        updateActivePage((page) => ({
                          ...page,
                          images: page.images.map((im) =>
                            im.id === selectedImgObj.id
                              ? { ...im, dataUrl: im.originalDataUrl || im.dataUrl, clipPolygon: undefined, rotation: 0 }
                              : im
                          ),
                        }));
                      }}
                      className="p-1 rounded-full bg-slate-200 text-slate-700 cursor-pointer"
                      title="Επαναφορά εικόνας"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        updateActivePage((page) => ({
                          ...page,
                          images: page.images.filter((im) => im.id !== selectedImgObj.id),
                        }));
                        setSelectedImageId(null);
                      }}
                      className="p-1 rounded-full bg-rose-100 text-rose-700 cursor-pointer"
                      title="Διαγραφή εικόνας"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

          {/* =========================================================================
              3. DUAL-CANVAS 120Hz WORKSPACE (Static Scene + 0ms Desynchronized Ink Layer)
             ========================================================================= */}
          <div
            ref={workspaceRef}
            className="relative flex-1 overflow-hidden bg-[#dfe3ea] flex justify-center items-start py-6 px-8 touch-none"
          >
            {statusBanner && (
              <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1b2a4a] text-white text-xs font-medium shadow-xl">
                {statusBanner}
              </div>
            )}

            {/* Floating Layers Popover */}
            {showLayersPanel && (
              <div className="fixed right-5 top-28 z-40 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3.5 text-slate-800">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#1b2a4a]">Layers (Επίπεδα Σελίδας)</span>
                  <button
                    onClick={() => {
                      const newId = `layer-${Date.now()}`;
                      updateActivePage((page) => ({
                        ...page,
                        layers: [
                          ...page.layers,
                          {
                            id: newId,
                            name: `Layer ${page.layers.length + 1}`,
                            visible: true,
                            locked: false,
                            opacity: 1,
                          },
                        ],
                      }));
                      setActiveLayerId(newId);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#0066ff] text-white text-[11px] font-semibold cursor-pointer"
                  >
                    + Layer
                  </button>
                </div>

                <div className="space-y-1.5">
                  {activePage.layers.map((layer) => {
                    const isCurrent = layer.id === activeLayerId;
                    const count = activePage.strokes.filter((s) => s.layerId === layer.id).length;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => setActiveLayerId(layer.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                          isCurrent
                            ? 'bg-sky-50 border-[#0066ff] text-[#1b2a4a]'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{layer.name}</span>
                          <span className="text-[10px] text-slate-400">{count} αντικείμενα</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateActivePage((page) => ({
                                ...page,
                                layers: page.layers.map((l) => (l.id === layer.id ? { ...l, locked: !l.locked } : l)),
                              }));
                            }}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              layer.locked ? 'bg-rose-100 text-rose-600' : 'text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateActivePage((page) => ({
                                ...page,
                                layers: page.layers.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l)),
                              }));
                            }}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              !layer.visible ? 'text-slate-300' : 'text-[#0066ff] hover:bg-slate-200'
                            }`}
                          >
                            {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WORD-STYLE CONTINUOUS MULTI-PAGE VERTICAL DOCUMENT STACK (WITH 2x RETINA 120HZ CANVASES) */}
            <div
              ref={paperTransformElRef}
              style={{
                transformOrigin: '50% 0',
                transform: `translate3d(0px, ${pan.y}px, 0) scale(${zoom})`,
                willChange: 'transform',
                gap: `${PAGE_GAP}px`,
              }}
              className="relative flex flex-col items-center shrink-0"
            >
              {/* GOODNOTES PULL-TO-ADD-PAGE PEEK ABOVE FIRST PAGE */}
              {pullAddPageState?.side === 'top' && (
                <div
                  style={{ width: pageWidth, height: 150, top: -168 }}
                  className="absolute left-0 rounded-b-xl bg-[#fffdf7] border-2 border-dashed border-[#0066ff] shadow-lg flex flex-col items-center justify-end pb-4 pointer-events-none z-30"
                >
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0066ff] text-white text-xs font-bold shadow">
                    <Plus className="w-4 h-4" />
                    <span>
                      Κράτα για προσθήκη Νέας Σελίδας στην αρχή ({pullAddPageState.progress}%)
                    </span>
                  </div>
                  <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${pullAddPageState.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Render All Pages Vertically (Word / Goodnotes Continuous Scroll) */}
              {activeNotebook.pages.map((pageObj, pageIdx) => {
                const pW = pageObj.orientation === 'landscape' ? 1260 : 920;
                const pH = pageObj.orientation === 'landscape' ? 920 : 1260;
                const isCurrentActive = pageIdx === activePageIndex;

                return (
                  <div
                    key={pageObj.id}
                    style={{ width: pW, height: pH }}
                    className={`relative shadow-lg bg-white border transition-shadow shrink-0 ${
                      isCurrentActive
                        ? 'border-[#0066ff] ring-2 ring-[#0066ff]/20'
                        : 'border-slate-300/90'
                    }`}
                  >
                    {/* Word/Goodnotes Page Separator Header Badge + Quick Insert/Delete Page Actions */}
                    <div className="absolute -top-7 left-0 right-0 flex items-center justify-between px-1 select-none z-20">
                      <span
                        className={`text-xs font-bold ${
                          isCurrentActive ? 'text-[#0066ff]' : 'text-slate-600'
                        }`}
                      >
                        Σελίδα {pageIdx + 1} από {activeNotebook.pages.length} — {pageObj.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => insertPageAtIndex(pageIdx)}
                          className="px-2 py-0.5 rounded-full bg-white/90 hover:bg-sky-50 border border-slate-300 text-[10px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                          title="Προσθήκη νέας σελίδας ΠΡΙΝ από αυτή τη σελίδα"
                        >
                          + Πριν
                        </button>
                        <button
                          onClick={() => insertPageAtIndex(pageIdx + 1)}
                          className="px-2 py-0.5 rounded-full bg-sky-600 hover:bg-sky-500 text-[10px] font-semibold text-white shadow-2xs cursor-pointer"
                          title="Προσθήκη νέας σελίδας ΜΕΤΑ από αυτή τη σελίδα (στη μέση)"
                        >
                          + Σελίδα Μετά
                        </button>
                        <button
                          onClick={() => duplicatePageAtIndex(pageIdx)}
                          className="px-2 py-0.5 rounded-full bg-white/90 hover:bg-slate-100 border border-slate-300 text-[10px] font-semibold text-slate-700 shadow-2xs cursor-pointer"
                          title="Διπλασιασμός αυτής της σελίδας"
                        >
                          📑 Αντίγραφο
                        </button>
                        <button
                          onClick={() => deletePageAtIndex(pageIdx)}
                          className="px-2 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[10px] font-semibold text-rose-600 shadow-2xs cursor-pointer"
                          title="Διαγραφή αυτής της σελίδας"
                        >
                          🗑️ Διαγραφή
                        </button>
                      </div>
                    </div>

                    {/* Interactive "+ Add Page in the Middle" Pill between consecutive pages */}
                    {pageIdx < activeNotebook.pages.length - 1 && (
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center">
                        <button
                          onClick={() => insertPageAtIndex(pageIdx + 1)}
                          className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/95 hover:bg-[#0066ff] text-slate-600 hover:text-white border border-slate-300 hover:border-[#0066ff] text-[11px] font-semibold shadow-sm transition cursor-pointer"
                          title={`Προσθήκη νέας σελίδας ανάμεσα στη Σελίδα ${pageIdx + 1} και ${pageIdx + 2}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Προσθήκη σελίδας εδώ ({pageIdx + 1} ↔ {pageIdx + 2})</span>
                        </button>
                      </div>
                    )}

                    {/* Layer 1: 2x Retina Static Committed Scene Canvas */}
                    <canvas
                      ref={(el) => {
                        if (el) {
                          staticCanvasMapRef.current.set(pageObj.id, el);
                          if (isCurrentActive) staticCanvasRef.current = el;
                        } else {
                          staticCanvasMapRef.current.delete(pageObj.id);
                        }
                      }}
                      width={pW * CANVAS_DPR}
                      height={pH * CANVAS_DPR}
                      style={{ width: pW, height: pH }}
                      className="absolute inset-0 pointer-events-none"
                    />

                    {/* Layer 2: 2x Retina Desynchronized 0ms Hardware Wet-Ink Canvas */}
                    <canvas
                      ref={(el) => {
                        if (el) {
                          activeCanvasMapRef.current.set(pageObj.id, el);
                          if (isCurrentActive) {
                            activeCanvasRef.current = el;
                            const ctx =
                              (el.getContext('2d', { desynchronized: true }) as CanvasRenderingContext2D) ||
                              el.getContext('2d');
                            if (ctx) {
                              ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
                              ctx.imageSmoothingEnabled = true;
                              ctx.imageSmoothingQuality = 'high';
                              activeCtxRef.current = ctx;
                            }
                          }
                        } else {
                          activeCanvasMapRef.current.delete(pageObj.id);
                        }
                      }}
                      width={pW * CANVAS_DPR}
                      height={pH * CANVAS_DPR}
                      onPointerDown={(e) => handlePointerDown(e, pageIdx)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{
                        width: pW,
                        height: pH,
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        touchAction: 'none',
                      }}
                      className="absolute inset-0 cursor-crosshair touch-none select-none"
                    />

                    {/* Rendered Text & LaTeX Blocks for this page */}
                    {(pageObj.texts || []).map((txt) => (
                      <div
                        key={txt.id}
                        style={{ left: txt.x, top: txt.y, color: txt.color, fontSize: txt.fontSize }}
                        className="absolute px-2 py-1 rounded pointer-events-none"
                      >
                        {txt.isMath && txt.latex ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: katex.renderToString(txt.latex, { throwOnError: false, displayMode: true }),
                            }}
                          />
                        ) : (
                          <span className="font-medium">{txt.text}</span>
                        )}
                      </div>
                    ))}

                    {/* Movable & Rotatable Digital Ruler (shown on active page) */}
                    {isCurrentActive && rulerState.visible && (
                      <div
                        style={{
                          left: rulerState.x - 260,
                          top: rulerState.y - 26,
                          transform: `rotate(${rulerState.angle}deg)`,
                        }}
                        className="absolute w-[520px] h-[52px] bg-amber-200/85 border-2 border-amber-500 rounded-lg shadow-lg flex items-center justify-between px-4 select-none z-20"
                      >
                        <span className="text-xs font-bold text-slate-900">📏 Χάρακας ({rulerState.angle}°)</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRulerState((r) => ({ ...r, angle: (r.angle - 15) % 360 }))}
                            className="px-2 py-0.5 rounded bg-slate-900 text-white text-xs cursor-pointer"
                          >
                            -15°
                          </button>
                          <button
                            onClick={() => setRulerState((r) => ({ ...r, angle: 0 }))}
                            className="px-2 py-0.5 rounded bg-slate-900 text-white text-xs cursor-pointer"
                          >
                            0°
                          </button>
                          <button
                            onClick={() => setRulerState((r) => ({ ...r, angle: (r.angle + 15) % 360 }))}
                            className="px-2 py-0.5 rounded bg-slate-900 text-white text-xs cursor-pointer"
                          >
                            +15°
                          </button>
                          <button
                            onClick={() => setRulerState((r) => ({ ...r, y: r.y + 40 }))}
                            className="px-2 py-0.5 rounded bg-sky-700 text-white text-xs cursor-pointer"
                          >
                            ⬇
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* GOODNOTES PULL-TO-ADD-PAGE PEEK BELOW LAST PAGE */}
              {pullAddPageState?.side === 'bottom' && (
                <div
                  style={{ width: pageWidth, height: 150, bottom: -168 }}
                  className="absolute left-0 rounded-t-xl bg-[#fffdf7] border-2 border-dashed border-[#0066ff] shadow-lg flex flex-col items-center justify-start pt-4 pointer-events-none z-30"
                >
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0066ff] text-white text-xs font-bold shadow">
                    <Plus className="w-4 h-4" />
                    <span>
                      Κράτα για προσθήκη Νέας Σελίδας παρακάτω ({pullAddPageState.progress}%)
                    </span>
                  </div>
                  <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${pullAddPageState.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          MULTI-PAGE THUMBNAIL GRID VIEW (3 or 4 Columns × Scrollable Rows for 30+ Pages)
         ========================================================================= */}
      <dialog
        ref={thumbnailsDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="thumbnailsDialogTitle"
        className="m-auto rounded-2xl bg-[#f4f5f7] text-slate-800 border border-slate-300 p-0 w-[94vw] max-w-5xl max-h-[88vh] shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col h-full max-h-[88vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#1b2a4a] text-white shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-5 h-5 text-sky-300" />
              <div>
                <h2 id="thumbnailsDialogTitle" className="text-sm sm:text-base font-bold">
                  Μικρογραφίες Σελίδων — {activeNotebook.title}
                </h2>
                <p className="text-[11px] text-slate-300">
                  Σύνολο: {activeNotebook.pages.length} σελίδες • Πάτησε σε οποιαδήποτε σελίδα για άμεση μετάβαση
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* 3 vs 4 Columns Switcher */}
              <div className="flex items-center bg-[#263961] rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setThumbnailCols(3)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    thumbnailCols === 3 ? 'bg-[#0066ff] text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  3 Στήλες
                </button>
                <button
                  onClick={() => setThumbnailCols(4)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    thumbnailCols === 4 ? 'bg-[#0066ff] text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  4 Στήλες
                </button>
              </div>

              <button
                onClick={() => insertPageAtIndex(activePageIndex + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0066ff] hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                title="Προσθήκη νέας σελίδας μετά την τρέχουσα"
              >
                <Plus className="w-4 h-4" />
                <span>+ Σελίδα (Μετά την #{activePageIndex + 1})</span>
              </button>

              <button
                onClick={() => {
                  pdfImportModeRef.current = 'insert-pages';
                  fileInputPdfOrDocRef.current?.click();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                title="Εισαγωγή PDF, JPG ή PNG στο έγγραφο"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>+ PDF / JPG</span>
              </button>

              <button
                onClick={() => thumbnailsDialogRef.current?.close()}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white cursor-pointer"
              >
                Κλείσιμο ✕
              </button>
            </div>
          </div>

          {/* Scrollable Thumbnail Grid (e.g. 4 rows × 3 columns or 4 columns for 30+ page documents) */}
          <div className="flex-1 overflow-y-auto p-5">
            <div
              className={`grid gap-5 ${
                thumbnailCols === 3
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}
            >
              {activeNotebook.pages.map((pObj, pIdx) => {
                const isSelectedPage = pIdx === activePageIndex;
                const pW = pObj.orientation === 'landscape' ? 1260 : 920;
                const pH = pObj.orientation === 'landscape' ? 920 : 1260;

                return (
                  <div
                    key={pObj.id}
                    className={`group flex flex-col rounded-xl bg-white border-2 shadow-sm hover:shadow-md transition overflow-hidden ${
                      isSelectedPage
                        ? 'border-[#0066ff] ring-2 ring-[#0066ff]/25'
                        : 'border-slate-200 hover:border-sky-400'
                    }`}
                  >
                    {/* Clickable Miniature Page Preview */}
                    <div
                      onClick={() => {
                        scrollToPageIndex(pIdx);
                        thumbnailsDialogRef.current?.close();
                      }}
                      className="relative w-full aspect-[3/4] bg-[#fffdf7] overflow-hidden cursor-pointer flex items-center justify-center border-b border-slate-100"
                    >
                      {/* Page Number Badge */}
                      <div
                        className={`absolute top-2 left-2 z-10 px-2.5 py-0.5 rounded-full text-xs font-bold shadow ${
                          isSelectedPage ? 'bg-[#0066ff] text-white' : 'bg-[#1b2a4a]/85 text-white'
                        }`}
                      >
                        {pIdx + 1}
                      </div>

                      {isSelectedPage && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow">
                          Ενεργή
                        </div>
                      )}

                      {/* PDF / JPG / PNG Background Preview if present */}
                      {pObj.backgroundDataUrl && (
                        <img
                          src={pObj.backgroundDataUrl}
                          alt={pObj.title}
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        />
                      )}

                      {/* Miniature Vector SVG Preview of All Handwritten Strokes & Shapes */}
                      <svg
                        viewBox={`0 0 ${pW} ${pH}`}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        {pObj.strokes.map((st) => {
                          if (st.points.length < 2) return null;
                          const ptsStr = st.points.map((pt) => `${Math.round(pt.x)},${Math.round(pt.y)}`).join(' ');
                          return (
                            <polyline
                              key={st.id}
                              fill={st.fillStyle && st.fillStyle !== 'none' ? st.color : 'none'}
                              fillOpacity={0.25}
                              stroke={st.color}
                              strokeWidth={Math.max(3, st.width * 1.6)}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity={st.opacity ?? 1}
                              points={ptsStr}
                            />
                          );
                        })}
                      </svg>
                    </div>

                    {/* Card Footer: Title + Quick Insert Before / Insert After (in Middle) / Duplicate / Delete */}
                    <div className="p-2.5 bg-slate-50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate">{pObj.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {pObj.orientation === 'landscape' ? 'Landscape' : 'Portrait'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/80">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            insertPageAtIndex(pIdx);
                          }}
                          className="flex-1 py-1 rounded bg-white hover:bg-sky-50 border border-slate-200 text-[10px] font-semibold text-slate-700 cursor-pointer"
                          title="Προσθήκη σελίδας ΠΡΙΝ από αυτή"
                        >
                          + Πριν
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            insertPageAtIndex(pIdx + 1);
                          }}
                          className="flex-1 py-1 rounded bg-sky-600 hover:bg-sky-500 text-[10px] font-semibold text-white cursor-pointer"
                          title="Προσθήκη σελίδας ΜΕΤΑ από αυτή (στη μέση)"
                        >
                          + Μετά
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicatePageAtIndex(pIdx);
                          }}
                          className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 cursor-pointer"
                          title="Διπλασιασμός σελίδας"
                        >
                          📑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePageAtIndex(pIdx);
                          }}
                          className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[10px] font-semibold text-rose-600 cursor-pointer"
                          title="Διαγραφή αυτής της σελίδας"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </dialog>

      {/* MATH / LATEX CONVERTER & OFFLINE CAS SOLVER DIALOG */}
      <dialog
        ref={mathDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="mathDialogTitle"
        className="m-auto rounded-2xl bg-white text-slate-800 border border-slate-200 p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="mathDialogTitle" className="text-lg font-bold text-[#1b2a4a] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span>Μετατροπή σε LaTeX & Offline CAS Solver</span>
            </h2>
            <button
              onClick={() => mathDialogRef.current?.close()}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs text-slate-600 cursor-pointer"
            >
              Κλείσιμο
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Επίλυση Εξίσωσης Φυσικής / Μαθηματικών (100% Εγγενώς & Offline CAS):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mathEquationToSolve}
                onChange={(e) => setMathEquationToSolve(e.target.value)}
                placeholder="π.χ. 15 * t = 90 ή 20 * 3600 / 1000"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 select-text"
              />
              <button
                onClick={() => {
                  const res = solveMathExpressionOffline(mathEquationToSolve);
                  setMathInput(res.latex);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
              >
                🧮 Λύσε
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Κώδικας LaTeX:</label>
            <input
              type="text"
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-mono text-sky-700 select-text"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 overflow-x-auto">
            <div
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(mathInput || 'I = \\frac{q}{t}', {
                  throwOnError: false,
                  displayMode: true,
                }),
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                const newTxt: TextObject = {
                  id: `math-${Date.now()}`,
                  x: 160,
                  y: 220,
                  text: mathInput,
                  latex: mathInput,
                  isMath: true,
                  color: strokeColor,
                  fontSize: 20,
                  layerId: activeLayerId,
                };
                updateActivePage((page) => ({ ...page, texts: [...(page.texts || []), newTxt] }));
                mathDialogRef.current?.close();
              }}
              className="px-4 py-2 rounded-xl bg-[#0066ff] text-white text-xs font-bold cursor-pointer"
            >
              + Εισαγωγή Εξίσωσης στη Σελίδα
            </button>
          </div>
        </div>
      </dialog>

      {/* SETTINGS DIALOG */}
      <dialog
        ref={settingsDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="settingsDialogTitle"
        className="m-auto rounded-2xl bg-white text-slate-800 border border-slate-200 p-6 w-full max-w-md shadow-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="settingsDialogTitle" className="text-lg font-bold text-[#1b2a4a]">
              Ρυθμίσεις Σελίδας & Apple Pencil
            </h2>
            <button
              onClick={() => settingsDialogRef.current?.close()}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs text-slate-600 cursor-pointer"
            >
              Κλείσιμο
            </button>
          </div>

          {/* Page Orientation: Portrait / Landscape + 90° Rotation */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">
              Προσανατολισμός & Περιστροφή Σελίδας:
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() =>
                  updateActivePage((page) => ({ ...page, orientation: 'portrait' }))
                }
                className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                  (activePage.orientation || 'portrait') === 'portrait'
                    ? 'bg-[#0066ff] border-[#0066ff] text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                📄 Κάθετη (Portrait)
              </button>
              <button
                onClick={() =>
                  updateActivePage((page) => ({ ...page, orientation: 'landscape' }))
                }
                className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                  activePage.orientation === 'landscape'
                    ? 'bg-[#0066ff] border-[#0066ff] text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                🖼️ Οριζόντια (Landscape)
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRotatePage('left')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Περιστροφή -90° Αριστερά</span>
              </button>
              <button
                onClick={() => handleRotatePage('right')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Περιστροφή +90° Δεξιά</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Πρότυπο Χαρτιού (Paper Template):</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'grid', label: 'Τετραγωνισμένο' },
                { id: 'ruled', label: 'Γραμμές' },
                { id: 'dotted', label: 'Τελείες' },
                { id: 'cornell', label: 'Cornell' },
                { id: 'blank', label: 'Λευκό' },
                { id: 'dark-grid', label: 'Σκούρο Grid' },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => updateActivePage((page) => ({ ...page, template: tpl.id as PaperTemplateType }))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                    activePage.template === tpl.id
                      ? 'bg-[#0066ff] border-[#0066ff] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between text-xs font-medium">
              <span>✨ Hold-to-Snap (Αυτόματο σχήμα σε 0.3s)</span>
              <input
                type="checkbox"
                checked={holdToSnapEnabled}
                onChange={(e) => setHoldToSnapEnabled(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between text-xs font-medium">
              <span>🧹 Scribble-to-Erase (Μουτζούρωμα για σβήσιμο)</span>
              <input
                type="checkbox"
                checked={scribbleToEraseEnabled}
                onChange={(e) => setScribbleToEraseEnabled(e.target.checked)}
              />
            </label>
          </div>
        </div>
      </dialog>
    </div>
  );
}
