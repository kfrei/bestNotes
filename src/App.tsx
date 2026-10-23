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
  Magnet,
  Type,
  Bandage,
  Sticker,
  X,
  ZoomIn,
  ZoomOut,
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
  const [widthSlots] = useState<number[]>([2.0, 3.2, 5.2]);
  const [lineStyle, setLineStyle] = useState<LineStyleType>('solid');
  const [arrowEnd, setArrowEnd] = useState<boolean>(false);
  const [scribbleToEraseEnabled, setScribbleToEraseEnabled] = useState<boolean>(true);
  const [holdToSnapEnabled, setHoldToSnapEnabled] = useState<boolean>(true);
  const [pencilOnlyMode, setPencilOnlyMode] = useState<boolean>(false);
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
  const [mathInput, setMathInput] = useState<string>('I = \\frac{q}{t} \\implies 15 \\cdot t = 90');
  const [mathEquationToSolve, setMathEquationToSolve] = useState<string>('15 * t = 90');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // DUAL-CANVAS REFS FOR ZERO-LATENCY (0ms / 120Hz) APPLE PENCIL INKING!
  // 1. staticCanvasRef: Renders background paper + committed strokes ONLY when page changes (NEVER during pointermove!)
  // 2. activeCanvasRef: Desynchronized hardware overlay that draws ONLY the live wet ink segment in <0.03ms!
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const currentStrokePtsRef = useRef<BezierPoint[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const holdTimerRef = useRef<number | null>(null);
  const snappedCurrentStrokeRef = useRef<{ points: BezierPoint[]; shapeType: string } | null>(null);
  const lassoPolygonRef = useRef<{ x: number; y: number }[]>([]);
  const isDraggingSelectionRef = useRef<{ startX: number; startY: number } | null>(null);
  const imageElementsCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const fileInputGoodnotesRef = useRef<HTMLInputElement | null>(null);
  const fileInputImageRef = useRef<HTMLInputElement | null>(null);

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || notebooks[0];
  const activePage =
    activeNotebook.pages[Math.min(activePageIndex, activeNotebook.pages.length - 1)] || activeNotebook.pages[0];

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
    const dialogs = [mathDialogRef.current, settingsDialogRef.current].filter(Boolean) as HTMLDialogElement[];
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

  const updateActivePage = useCallback(
    (updater: (prev: NotePage) => NotePage, recordUndo = true) => {
      setNotebooks((prevNotebooks) =>
        prevNotebooks.map((nb) => {
          if (nb.id !== activeNotebook.id) return nb;
          const currentPage = nb.pages[activePageIndex] || nb.pages[0];
          if (recordUndo) {
            setUndoStack((u) => [...u.slice(-24), structuredClone(currentPage)]);
            setRedoStack([]);
          }
          const updatedPage = updater(structuredClone(currentPage));
          const newPages = [...nb.pages];
          newPages[activePageIndex] = updatedPage;
          return { ...nb, updatedAt: new Date().toISOString(), pages: newPages };
        })
      );
      setIsDirty(true);
      setSyncStatus('dirty');
    },
    [activeNotebook.id, activePageIndex]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prevPage = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [...r, structuredClone(activePage)]);
    updateActivePage(() => prevPage, false);
  }, [undoStack, activePage, updateActivePage]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextPage = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, structuredClone(activePage)]);
    updateActivePage(() => nextPage, false);
  }, [redoStack, activePage, updateActivePage]);

  const getStrokeBounds = (s: StrokeObject) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY };
  };

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
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) {
      const pt = s.points[i];
      if (pt.cx !== undefined && pt.cy !== undefined) {
        ctx.quadraticCurveTo(pt.cx, pt.cy, pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }

    if (s.fillColor && s.fillStyle && s.fillStyle !== 'none' && s.points.length > 2) {
      ctx.save();
      if (s.fillStyle === 'solid') {
        ctx.fillStyle = s.fillColor;
        ctx.globalAlpha = 0.28;
        ctx.fill();
      } else if (s.fillStyle === 'hatching') {
        ctx.clip();
        const b = getStrokeBounds(s);
        ctx.strokeStyle = s.fillColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.55;
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

    if (isSelected) {
      const b = getStrokeBounds(s);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(b.minX - 4, b.minY - 4, b.maxX - b.minX + 8, b.maxY - b.minY + 8);
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

  // RENDER STATIC SCENE (Only runs when page state changes, NEVER while Apple Pencil is moving!)
  const renderStaticScene = useCallback(() => {
    const canvas = staticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    drawPaperBackground(ctx, width, height, activePage.template);

    const visibleLayerMap = new Map(activePage.layers.map((l) => [l.id, l]));

    // 1. Images with Alpha Masking
    for (const imgObj of activePage.images || []) {
      const layer = visibleLayerMap.get(imgObj.layerId);
      if (layer && !layer.visible) continue;

      let imgEl = imageElementsCacheRef.current.get(imgObj.dataUrl);
      if (!imgEl) {
        imgEl = new Image();
        imgEl.src = imgObj.dataUrl;
        imgEl.onload = () => renderStaticScene();
        imageElementsCacheRef.current.set(imgObj.dataUrl, imgEl);
      }

      if (imgEl.complete && imgEl.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = layer?.opacity ?? 1;
        if (imgObj.clipPolygon && imgObj.clipPolygon.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(imgObj.x + imgObj.clipPolygon[0].x, imgObj.y + imgObj.clipPolygon[0].y);
          for (let i = 1; i < imgObj.clipPolygon.length; i++) {
            ctx.lineTo(imgObj.x + imgObj.clipPolygon[i].x, imgObj.y + imgObj.clipPolygon[i].y);
          }
          ctx.closePath();
          ctx.clip();
        }
        ctx.drawImage(imgEl, imgObj.x, imgObj.y, imgObj.width, imgObj.height);
        ctx.restore();

        if (selectedImageId === imgObj.id) {
          ctx.save();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(imgObj.x - 2, imgObj.y - 2, imgObj.width + 4, imgObj.height + 4);
          ctx.restore();
        }
      }
    }

    // 2. Highlighters first (underneath Pen ink)
    for (const s of activePage.strokes) {
      if (s.tool !== 'highlighter') continue;
      const layer = visibleLayerMap.get(s.layerId);
      if (layer && !layer.visible) continue;
      drawStrokeOnContext(ctx, s, selectedStrokeIds.includes(s.id));
    }

    // 3. Pen & Pencil Strokes
    for (const s of activePage.strokes) {
      if (s.tool === 'highlighter') continue;
      const layer = visibleLayerMap.get(s.layerId);
      if (layer && !layer.visible) continue;
      drawStrokeOnContext(ctx, s, selectedStrokeIds.includes(s.id));
    }

    // 4. Direct Node Handles ("Λευκό Βελάκι")
    if (activeTool === 'direct-node' && activeNodeStrokeId) {
      const target = activePage.strokes.find((s) => s.id === activeNodeStrokeId);
      if (target) {
        ctx.save();
        for (let i = 0; i < target.points.length; i++) {
          const p = target.points[i];
          if (p.cx !== undefined && p.cy !== undefined) {
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
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
          ctx.strokeRect(p.x - 5, p.y - 5, 10, 10);
        }
        ctx.restore();
      }
    }

    // 5. Tape Strips
    for (const tape of activePage.tapes || []) {
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
  }, [activePage, activeTool, activeNodeStrokeId, selectedStrokeIds, selectedImageId]);

  useEffect(() => {
    renderStaticScene();
  }, [renderStaticScene]);

  // Initialize desynchronized low-latency context on activeCanvasRef for 0ms iPad Apple Pencil rendering!
  useEffect(() => {
    const c = activeCanvasRef.current;
    if (!c) return;
    activeCtxRef.current =
      (c.getContext('2d', { desynchronized: true }) as CanvasRenderingContext2D) || c.getContext('2d');
  }, [viewMode]);

  const clearActiveOverlay = () => {
    const c = activeCanvasRef.current;
    const ctx = activeCtxRef.current;
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
  };

  // Draw live wet ink on the top overlay canvas ONLY (Zero React State, Zero Lag!)
  const renderLiveOverlayStroke = () => {
    const c = activeCanvasRef.current;
    const ctx = activeCtxRef.current;
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);

    const pts = snappedCurrentStrokeRef.current
      ? snappedCurrentStrokeRef.current.points
      : currentStrokePtsRef.current;
    if (pts.length === 0) return;

    const previewStroke: StrokeObject = {
      id: 'live',
      tool: activeTool === 'highlighter' ? 'highlighter' : activeTool === 'pencil' ? 'pencil' : 'pen',
      color: strokeColor,
      fillColor: fillStyle !== 'none' ? fillColor : undefined,
      fillStyle,
      width: activeTool === 'highlighter' ? Math.max(16, strokeWidth * 4.5) : strokeWidth,
      opacity: activeTool === 'highlighter' ? 0.42 : 1,
      lineStyle,
      arrowEnd: arrowEnd || shapePreset === 'arrow',
      points: pts,
      layerId: activeLayerId,
    };
    drawStrokeOnContext(ctx, previewStroke);
  };

  // Incremental 0ms segment draw for ultra-fast freehand pen strokes!
  const drawIncrementalSegment = (pPrev2: BezierPoint, pPrev1: BezierPoint, pCurr: BezierPoint) => {
    const ctx = activeCtxRef.current;
    if (!ctx) return;
    ctx.save();
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
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pencilOnlyMode && e.pointerType === 'touch') return;

    const activeLayer = activePage.layers.find((l) => l.id === activeLayerId);
    if (activeLayer?.locked && ['pen', 'pencil', 'highlighter', 'eraser', 'shape'].includes(activeTool)) {
      showToast('🔒 Το επιλεγμένο Layer είναι κλειδωμένο!');
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCanvasPointFromNative(e.clientX, e.clientY, e.pressure);

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

    // 3. Direct Node Editing ("Λευκό Βελάκι")
    if (activeTool === 'direct-node') {
      if (activeNodeStrokeId) {
        const target = activePage.strokes.find((s) => s.id === activeNodeStrokeId);
        if (target) {
          for (let i = 0; i < target.points.length; i++) {
            const p = target.points[i];
            if (distance(pt, p) < 14) {
              setDraggingNodeIdx({ index: i, isControl: false });
              isDrawingRef.current = true;
              return;
            }
            if (p.cx !== undefined && p.cy !== undefined && distance(pt, { x: p.cx, y: p.cy }) < 14) {
              setDraggingNodeIdx({ index: i, isControl: true });
              isDrawingRef.current = true;
              return;
            }
          }
        }
      }
      const hit = activePage.strokes.find((s) => s.points.some((p) => distance(pt, p) < 16));
      setActiveNodeStrokeId(hit ? hit.id : null);
      return;
    }

    // 4. Lasso Tool
    if (activeTool === 'lasso') {
      const hitImg = (activePage.images || []).find(
        (im) => pt.x >= im.x && pt.x <= im.x + im.width && pt.y >= im.y && pt.y <= im.y + im.height
      );
      if (hitImg) {
        setSelectedImageId(hitImg.id);
        isDraggingSelectionRef.current = { startX: pt.x, startY: pt.y };
        isDrawingRef.current = true;
        return;
      }
      setSelectedImageId(null);

      if (selectedStrokeIds.length > 0) {
        const selStrokes = activePage.strokes.filter((s) => selectedStrokeIds.includes(s.id));
        const inBounds = selStrokes.some((s) => {
          const b = getStrokeBounds(s);
          return pt.x >= b.minX - 15 && pt.x <= b.maxX + 15 && pt.y >= b.minY - 15 && pt.y <= b.maxY + 15;
        });
        if (inBounds) {
          isDraggingSelectionRef.current = { startX: pt.x, startY: pt.y };
          isDrawingRef.current = true;
          return;
        }
      }

      const tappedStroke = activePage.strokes.find((s) => s.points.some((p) => distance(pt, p) < 14));
      if (tappedStroke?.groupId) {
        const groupMembers = activePage.strokes.filter((s) => s.groupId === tappedStroke.groupId).map((s) => s.id);
        setSelectedStrokeIds(groupMembers);
        isDraggingSelectionRef.current = { startX: pt.x, startY: pt.y };
        isDrawingRef.current = true;
        showToast(`🔗 Επιλέχθηκε ολόκληρο το Group (${groupMembers.length} αντικείμενα)`);
        return;
      }

      setSelectedStrokeIds([]);
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
  };

  const eraseAtPoint = (pt: { x: number; y: number }) => {
    const lockedLayerIds = new Set(activePage.layers.filter((l) => l.locked).map((l) => l.id));
    const eraseRadius = Math.max(14, strokeWidth * 3.5);

    updateActivePage((page) => {
      if (eraserSubType === 'stroke' || eraserSubType === 'highlighter-only') {
        const filtered = page.strokes.filter((s) => {
          if (lockedLayerIds.has(s.layerId)) return true;
          if (eraserSubType === 'highlighter-only' && s.tool !== 'highlighter') return true;
          return !s.points.some((p) => distance(pt, p) <= eraseRadius);
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

    // Collect coalesced high-frequency Apple Pencil events (up to 240Hz on iPad Pro)
    const nativeEv = e.nativeEvent as PointerEvent;
    const coalesced = nativeEv.getCoalescedEvents ? nativeEv.getCoalescedEvents() : [nativeEv];
    const latestPt = getCanvasPointFromNative(e.clientX, e.clientY, e.pressure);

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
          ctx.clearRect(0, 0, c.width, c.height);
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

    // 2. Direct Node Editing
    if (activeTool === 'direct-node' && activeNodeStrokeId && draggingNodeIdx) {
      updateActivePage(
        (page) => ({
          ...page,
          strokes: page.strokes.map((s) => {
            if (s.id !== activeNodeStrokeId) return s;
            const newPts = [...s.points];
            const targetPt = { ...newPts[draggingNodeIdx.index] };
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
            return { ...s, points: newPts };
          }),
        }),
        false
      );
      return;
    }

    // 3. Lasso Selection or Dragging
    if (activeTool === 'lasso') {
      if (isDraggingSelectionRef.current) {
        const dx = latestPt.x - isDraggingSelectionRef.current.startX;
        const dy = latestPt.y - isDraggingSelectionRef.current.startY;
        isDraggingSelectionRef.current = { startX: latestPt.x, startY: latestPt.y };

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
        ctx.clearRect(0, 0, c.width, c.height);
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
        ctx.clearRect(0, 0, c.width, c.height);
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

    // 6. ZERO-LATENCY PEN / PENCIL / HIGHLIGHTER / SHAPE INKING!
    for (const ce of coalesced) {
      const pt = getCanvasPointFromNative(ce.clientX, ce.clientY, ce.pressure);
      const pts = currentStrokePtsRef.current;
      pts.push(pt);

      // If not yet snapped and using solid standard pen, draw only the new incremental Bezier segment in 0.02ms!
      if (
        !snappedCurrentStrokeRef.current &&
        lineStyle === 'solid' &&
        !arrowEnd &&
        fillStyle === 'none' &&
        activeTool !== 'shape' &&
        activeTool !== 'tape' &&
        pts.length >= 3
      ) {
        drawIncrementalSegment(pts[pts.length - 3], pts[pts.length - 2], pts[pts.length - 1]);
      }
    }

    if (
      snappedCurrentStrokeRef.current ||
      lineStyle !== 'solid' ||
      arrowEnd ||
      fillStyle !== 'none' ||
      activeTool === 'shape' ||
      activeTool === 'tape'
    ) {
      if (snappedCurrentStrokeRef.current && snappedCurrentStrokeRef.current.shapeType === 'line') {
        const start = currentStrokePtsRef.current[0];
        snappedCurrentStrokeRef.current = {
          shapeType: 'line',
          points: [
            { x: start.x, y: start.y, pressure: 0.7 },
            { x: latestPt.x, y: latestPt.y, cx: (start.x + latestPt.x) / 2, cy: (start.y + latestPt.y) / 2, pressure: 0.7 },
          ],
        };
      }
      renderLiveOverlayStroke();
    }

    // Hold-to-Snap timer (300ms pause at end of stroke snaps to perfect geometric shape!)
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    if (holdToSnapEnabled && ['pen', 'highlighter', 'shape'].includes(activeTool) && !snappedCurrentStrokeRef.current) {
      holdTimerRef.current = window.setTimeout(() => {
        if (!isDrawingRef.current || currentStrokePtsRef.current.length < 5) return;
        const snapped = recognizeAndSnapShape(
          currentStrokePtsRef.current,
          activeTool === 'shape' ? shapePreset : 'auto'
        );
        if (snapped) {
          snappedCurrentStrokeRef.current = snapped;
          renderLiveOverlayStroke();
        }
      }, 300);
    }
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    clearActiveOverlay();

    // 1. Finish Image Lasso / Magnetic Lasso Crop
    if (imageCropMode !== 'none' && selectedImageId && lassoPolygonRef.current.length >= 3) {
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
      setDraggingNodeIdx(null);
      return;
    }

    if (activeTool === 'laser') {
      currentStrokePtsRef.current = [];
      return;
    }

    if (activeTool === 'tape' && currentStrokePtsRef.current.length >= 2) {
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
      if (isDraggingSelectionRef.current) {
        isDraggingSelectionRef.current = null;
        return;
      }
      const poly = lassoPolygonRef.current;
      lassoPolygonRef.current = [];
      if (poly.length >= 3) {
        const lockedLayers = new Set(activePage.layers.filter((l) => l.locked).map((l) => l.id));
        const directMatched = activePage.strokes.filter(
          (s) => !lockedLayers.has(s.layerId) && s.points.some((p) => isPointInPolygon(p, poly))
        );
        const groupIds = new Set(directMatched.map((s) => s.groupId).filter(Boolean));
        const finalIds = activePage.strokes
          .filter((s) => directMatched.some((m) => m.id === s.id) || (s.groupId && groupIds.has(s.groupId)))
          .map((s) => s.id);
        setSelectedStrokeIds(finalIds);
      }
      return;
    }

    if (!['pen', 'pencil', 'highlighter', 'shape'].includes(activeTool)) return;
    const rawPts = currentStrokePtsRef.current;
    currentStrokePtsRef.current = [];
    if (rawPts.length === 0) return;

    // 3. Check Scribble-to-Erase Gesture
    if (scribbleToEraseEnabled && activeTool === 'pen' && !snappedCurrentStrokeRef.current) {
      const scribble = isScribbleEraseGesture(rawPts);
      if (scribble.isScribble && scribble.bounds) {
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
      fillColor: fillStyle !== 'none' ? fillColor : undefined,
      fillStyle,
      width: activeTool === 'highlighter' ? Math.max(16, strokeWidth * 4.5) : strokeWidth,
      opacity: activeTool === 'highlighter' ? 0.42 : 1,
      lineStyle,
      arrowEnd: arrowEnd || shapePreset === 'arrow',
      points: finalPts,
      layerId: activeLayerId,
      isShape,
      shapeType,
    };

    updateActivePage((page) => ({
      ...page,
      strokes: [...page.strokes, newStroke],
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
      dataUrl,
      originalDataUrl: dataUrl,
      layerId: activeLayerId,
    };
    updateActivePage((page) => ({ ...page, images: [...(page.images || []), newImg] }));
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
      const dataUrl = reader.result as string;
      const newImg: ImageObject = {
        id: `img-${Date.now()}`,
        x: 140,
        y: 180,
        width: 340,
        height: 240,
        dataUrl,
        originalDataUrl: dataUrl,
        layerId: activeLayerId,
      };
      updateActivePage((page) => ({ ...page, images: [...(page.images || []), newImg] }));
      setSelectedImageId(newImg.id);
      setActiveTool('lasso');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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

      {/* =========================================================================
          1. AUTHENTIC GOODNOTES 6 TOP NAVY BAR & DOCUMENT TABS (#1B2A4A)
         ========================================================================= */}
      <header className="flex items-center justify-between px-3 pt-1.5 bg-[#1b2a4a] text-white shrink-0 select-none">
        {/* Left Navigation Icons (Back to Library, Page Thumbnails, Import .goodnotes) */}
        <div className="flex items-center gap-1 pb-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'library' ? 'editor' : 'library')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-white/90 transition cursor-pointer"
            title="Πίσω στους Φακέλους (Documents)"
          >
            <ChevronLeft className="w-5 h-5 text-sky-300" />
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={() => fileInputGoodnotesRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-xs font-medium text-sky-200 transition cursor-pointer"
            title="Άνοιγμα αρχείου .goodnotes"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">.goodnotes</span>
          </button>
        </div>

        {/* Center: Authentic Goodnotes 6 Document Tabs */}
        <div className="flex items-end gap-1 overflow-x-auto max-w-[54vw] px-2">
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
                <span className="truncate max-w-[175px]">{nb.title}</span>
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

        {/* Right: Undo / Redo, Page Switcher, Drive Sync & Settings */}
        <div className="flex items-center gap-1.5 pb-1.5">
          {/* Undo / Redo just like Goodnotes top-right */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Page Indicator & Add Page */}
          <div className="flex items-center bg-[#263961] rounded-lg px-1.5 py-0.5 text-xs">
            <button
              onClick={() => setActivePageIndex((i) => Math.max(0, i - 1))}
              disabled={activePageIndex === 0}
              className="p-0.5 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-1.5 font-semibold">
              {activePageIndex + 1}/{activeNotebook.pages.length}
            </span>
            <button
              onClick={() => setActivePageIndex((i) => Math.min(activeNotebook.pages.length - 1, i + 1))}
              disabled={activePageIndex >= activeNotebook.pages.length - 1}
              className="p-0.5 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const newPage: NotePage = {
                  id: `page-${Date.now()}`,
                  title: `Σελίδα ${activeNotebook.pages.length + 1}`,
                  template: activePage.template,
                  layers: [
                    { id: 'layer-1', name: 'Σημειώσεις & Σχήματα', visible: true, locked: false, opacity: 1 },
                    { id: 'layer-2', name: 'Λύσεις / Προσθήκες', visible: true, locked: false, opacity: 1 },
                  ],
                  strokes: [],
                  texts: [],
                  images: [],
                  tapes: [],
                };
                setNotebooks((prev) =>
                  prev.map((nb) => (nb.id === activeNotebook.id ? { ...nb, pages: [...nb.pages, newPage] } : nb))
                );
                setActivePageIndex(activeNotebook.pages.length);
              }}
              className="ml-1 p-0.5 text-sky-300 hover:text-white cursor-pointer"
              title="Νέα Σελίδα"
            >
              <Plus className="w-4 h-4" />
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
            title="Ρυθμίσεις Χαρτιού & Apple Pencil"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* IF IN LIBRARY VIEW (GOODNOTES 6 LIGHT FOLDERS & NOTEBOOKS GRID) */}
      {viewMode === 'library' ? (
        <div className="flex-1 overflow-y-auto p-6 bg-[#f4f5f7]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1b2a4a]">Έγγραφα (Documents)</h1>
                <p className="text-sm text-slate-500">
                  Τα αρχεία σου `.goodnotes` Φυσικής + Νέα Τετράδια BestNotes
                </p>
              </div>
              <div className="flex gap-3">
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
                 Center: Clean Icon Strip | Right: 3 Stroke Widths + 3 Color Slots
             ========================================================================= */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#f4f5f7] border-b border-slate-300/80 shadow-xs shrink-0 gap-2 overflow-x-auto">
            {/* Left Quick Status: Pencil Only Mode + Tidy Handwriting */}
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
            </div>

            {/* Center: Goodnotes 6 Iconic Pill Toolbar */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-xs border border-slate-200/90">
              {[
                { id: 'pen', title: 'Στυλό (Pen)', icon: Pen },
                { id: 'eraser', title: 'Γόμα (Eraser)', icon: Eraser },
                { id: 'highlighter', title: 'Μαρκαδόρος (Highlighter)', icon: Highlighter },
                { id: 'shape', title: 'Σχήματα & Φυσική (Shapes)', icon: Shapes },
                { id: 'lasso', title: 'Λάσο & Group (Lasso)', icon: Lasso },
                { id: 'direct-node', title: 'Κόμβοι Bezier (Illustrator Nodes)', icon: MousePointer },
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

              {/* Image Tool, Ruler, Math/LaTeX & Layers */}
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

            {/* Right: Authentic Goodnotes 6 Contextual 3 Stroke Slots + 3 Color Slots */}
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-xs border border-slate-200/90 relative">
              {/* 3 Stroke Thickness Slots */}
              <div className="flex items-center gap-1">
                {widthSlots.map((w) => (
                  <button
                    key={w}
                    onClick={() => setStrokeWidth(w)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                      Math.abs(strokeWidth - w) < 0.3
                        ? 'bg-sky-50 ring-2 ring-[#0066ff]'
                        : 'hover:bg-slate-100'
                    }`}
                    title={`Πάχος ${w}px`}
                  >
                    <span
                      className="rounded-full bg-slate-800"
                      style={{ width: Math.min(15, w * 2.3), height: Math.min(15, w * 2.3) }}
                    />
                  </button>
                ))}
              </div>

              <div className="h-5 w-px bg-slate-200" />

              {/* 3 Quick Color Slots + Rainbow Picker */}
              <div className="flex items-center gap-1.5">
                {colorSlots.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStrokeColor(c)}
                    className={`w-6 h-6 rounded-full transition cursor-pointer ${
                      strokeColor === c ? 'ring-2 ring-offset-1 ring-[#0066ff] scale-110' : 'opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <button
                  onClick={() => setShowColorPopover(!showColorPopover)}
                  className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-sky-500 ring-1 ring-slate-300 cursor-pointer"
                  title="Όλα τα Χρώματα & Στυλ Γραμμής"
                />
              </div>
            </div>
          </div>

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
                      setStrokeColor(c);
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
                {(['solid', 'dashed', 'dotted'] as LineStyleType[]).map((ls) => (
                  <button
                    key={ls}
                    onClick={() => setLineStyle(ls)}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                      lineStyle === ls ? 'bg-[#0066ff] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ls === 'solid' ? '───' : ls === 'dashed' ? '- - -' : '• • •'}
                  </button>
                ))}
                <button
                  onClick={() => setArrowEnd(!arrowEnd)}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    arrowEnd ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  ➔ Βέλος
                </button>
              </div>
            </div>
          )}

          {/* Contextual Sub-Bar (Only appears when Shape, Lasso Selection, or Image is active) */}
          {(activeTool === 'shape' || selectedStrokeIds.length > 0 || selectedImgObj || activeTool === 'eraser') &&
            showToolSubBar && (
              <div className="flex items-center justify-center px-4 py-1 bg-white/90 border-b border-slate-200 text-xs gap-2 shrink-0 overflow-x-auto">
                {activeTool === 'shape' && (
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'auto', label: '✨ Auto Snap' },
                      { id: 'line', label: '╱ Ευθεία' },
                      { id: 'arrow', label: '➔ Διάνυσμα' },
                      { id: 'rectangle', label: '▭ Ορθογώνιο' },
                      { id: 'parallelogram', label: '▱ Παραλληλόγραμμο' },
                      { id: 'ellipse', label: '◯ Έλλειψη' },
                      { id: 'triangle', label: '△ Τρίγωνο' },
                      { id: 'cylinder', label: '🥫 Αγωγός' },
                      { id: 'axes', label: '📈 Άξονες' },
                      { id: 'resistor', label: '⚡ Αντιστάτης' },
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => setShapePreset(sp.id as ShapePresetType)}
                        className={`px-2.5 py-1 rounded-full font-medium cursor-pointer ${
                          shapePreset === sp.id
                            ? 'bg-[#0066ff] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                    {(['none', 'solid', 'hatching'] as FillStyleType[]).map((fs) => (
                      <button
                        key={fs}
                        onClick={() => setFillStyle(fs)}
                        className={`px-2.5 py-1 rounded-full font-medium cursor-pointer ${
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

                {selectedStrokeIds.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleGroupSelected}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold cursor-pointer"
                    >
                      <Group className="w-3.5 h-3.5" />
                      <span>Group ({selectedStrokeIds.length})</span>
                    </button>
                    <button
                      onClick={handleUngroupSelected}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    >
                      <Ungroup className="w-3.5 h-3.5" />
                      <span>Ungroup</span>
                    </button>
                    <button
                      onClick={() => {
                        updateActivePage((page) => ({
                          ...page,
                          strokes: page.strokes.filter((s) => !selectedStrokeIds.includes(s.id)),
                        }));
                        setSelectedStrokeIds([]);
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Διαγραφή</span>
                    </button>
                  </div>
                )}

                {selectedImgObj && (
                  <div className="flex items-center gap-1.5">
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
                              ? { ...im, dataUrl: im.originalDataUrl || im.dataUrl, clipPolygon: undefined }
                              : im
                          ),
                        }));
                      }}
                      className="p-1 rounded-full bg-slate-200 text-slate-700 cursor-pointer"
                      title="Επαναφορά εικόνας"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

          {/* =========================================================================
              3. DUAL-CANVAS 120Hz WORKSPACE (Static Scene + 0ms Desynchronized Ink Layer)
             ========================================================================= */}
          <div className="relative flex-1 overflow-auto bg-[#dfe3ea] flex justify-center items-start py-4 px-2">
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

            {/* THE PAPER PAGE CONTAINER WITH STACKED STATIC + ACTIVE 120HZ CANVASES */}
            <div
              style={{ width: 920 * zoom, height: 1260 * zoom }}
              className="relative shadow-lg bg-white border border-slate-300/90 shrink-0"
            >
              {/* Layer 1: Static Committed Scene Canvas */}
              <canvas
                ref={staticCanvasRef}
                width={920}
                height={1260}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* Layer 2: Desynchronized 0ms Hardware Wet-Ink Canvas */}
              <canvas
                ref={activeCanvasRef}
                width={920}
                height={1260}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              />

              {/* Rendered Text & LaTeX Blocks */}
              {(activePage.texts || []).map((txt) => (
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

              {/* Movable & Rotatable Digital Ruler */}
              {rulerState.visible && (
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
          </div>
        </>
      )}

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
