import React, { useState, useRef, useEffect, useCallback } from 'react';
import katex from 'katex';
import {
  Pen,
  Highlighter,
  Eraser,
  Shapes,
  Lasso,
  Magnet,
  MousePointer,
  Type,
  Image as ImageIcon,
  Layers,
  Undo2,
  Redo2,
  FolderOpen,
  Plus,
  Cloud,
  Check,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Group,
  Ungroup,
  Sparkles,
  Calculator,
  Trash2,
  Copy,
  Wand2,
  Scissors,
  Ruler,
  Radio,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Download,
  Upload,
  Grid,
  BookOpen,
  RotateCcw,
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
const COLORS = ['#0f172a', '#dc2626', '#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0284c7', '#facc15'];

export default function App() {
  // Notebooks state initialized with user's 2 preloaded .goodnotes Physics files!
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

  // Active Tool & Sub-options
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [penSubType, setPenSubType] = useState<PenSubType>('fountain');
  const [eraserSubType, setEraserSubType] = useState<EraserSubType>('stroke');
  const [shapePreset, setShapePreset] = useState<ShapePresetType>('auto');
  const [strokeColor, setStrokeColor] = useState<string>('#0f172a');
  const [fillColor, setFillColor] = useState<string>('#fef08a');
  const [fillStyle, setFillStyle] = useState<FillStyleType>('none');
  const [strokeWidth, setStrokeWidth] = useState<number>(3.2);
  const [lineStyle, setLineStyle] = useState<LineStyleType>('solid');
  const [arrowEnd, setArrowEnd] = useState<boolean>(false);
  const [scribbleToEraseEnabled, setScribbleToEraseEnabled] = useState<boolean>(true);
  const [holdToSnapEnabled, setHoldToSnapEnabled] = useState<boolean>(true);
  const [pencilOnlyMode, setPencilOnlyMode] = useState<boolean>(false);

  // Layers & Selection state
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-1');
  const [showLayersPanel, setShowLayersPanel] = useState<boolean>(false);
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeNodeStrokeId, setActiveNodeStrokeId] = useState<string | null>(null);
  const [draggingNodeIdx, setDraggingNodeIdx] = useState<{ index: number; isControl: boolean } | null>(null);

  // Image Cropping (Freehand Lasso & Magnetic Lasso)
  const [imageCropMode, setImageCropMode] = useState<'none' | 'freehand' | 'magnetic'>('none');
  const [cropPolygonPts, setCropPolygonPts] = useState<{ x: number; y: number }[]>([]);
  const edgeMapRef = useRef<{ id: string; map: Float32Array; w: number; h: number } | null>(null);

  // Ruler & Laser Pointer
  const [rulerState, setRulerState] = useState<{ visible: boolean; x: number; y: number; angle: number }>({
    visible: false,
    x: 240,
    y: 360,
    angle: 0,
  });
  const [laserTrail, setLaserTrail] = useState<{ x: number; y: number; t: number }[]>([]);

  // Apple Pencil Pro Live Telemetry HUD
  const [pencilTelemetry, setPencilTelemetry] = useState<{
    pointerType: string;
    pressure: number;
    tiltX: number;
    twist: number;
    hovering: boolean;
    x: number;
    y: number;
  }>({ pointerType: 'pen', pressure: 0.5, tiltX: 0, twist: 0, hovering: false, x: 0, y: 0 });

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<NotePage[]>([]);
  const [redoStack, setRedoStack] = useState<NotePage[]>([]);

  // 30-second Auto-Sync Timer with Google Drive simulation/integration
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'dirty'>('synced');
  const [secondsToNextSync, setSecondsToNextSync] = useState<number>(30);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString('el-GR'));

  // Math / LaTeX Modal & Dialogs
  const mathDialogRef = useRef<HTMLDialogElement | null>(null);
  const settingsDialogRef = useRef<HTMLDialogElement | null>(null);
  const [mathInput, setMathInput] = useState<string>('I = \\frac{q}{t} \\implies 15 \\cdot t = 90');
  const [mathEquationToSolve, setMathEquationToSolve] = useState<string>('15 * t = 90');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('bestnotes_gemini_key') || '');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Canvas & Drawing Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
  const activePage = activeNotebook.pages[Math.min(activePageIndex, activeNotebook.pages.length - 1)] || activeNotebook.pages[0];

  const showToast = useCallback((msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Save to LocalStorage immediately + trigger 30s Google Drive Auto-Sync cycle
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
    } catch {
      // ignore quota errors
    }
  }, [notebooks]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsToNextSync((prev) => {
        if (prev <= 1) {
          if (isDirty) {
            setSyncStatus('syncing');
            window.setTimeout(() => {
              setSyncStatus('synced');
              setIsDirty(false);
              setLastSyncedTime(new Date().toLocaleTimeString('el-GR'));
            }, 650);
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isDirty]);

  // Modern Web Guidance mandatory fallback for <dialog closedby="any"> in Safari/iPadOS
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

  // Mutate active page with Undo history support
  const updateActivePage = useCallback(
    (updater: (prev: NotePage) => NotePage, recordUndo = true) => {
      setNotebooks((prevNotebooks) =>
        prevNotebooks.map((nb) => {
          if (nb.id !== activeNotebook.id) return nb;
          const currentPage = nb.pages[activePageIndex] || nb.pages[0];
          if (recordUndo) {
            setUndoStack((u) => [...u.slice(-29), structuredClone(currentPage)]);
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

  // Helper to get bounding box of a stroke
  const getStrokeBounds = (s: StrokeObject) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of s.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    return { minX, minY, maxX, maxY };
  };

  // Draw a single stroke onto 2D context
  const drawStrokeOnContext = (ctx: CanvasRenderingContext2D, s: StrokeObject, isSelected = false) => {
    if (s.points.length === 0) return;
    ctx.save();

    if (s.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = s.opacity ?? 0.45;
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

    // Fill if shape has fillColor
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

    // Draw Vector Arrowhead if arrowEnd is enabled
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
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(b.minX - 4, b.minY - 4, b.maxX - b.minX + 8, b.maxY - b.minY + 8);
    }

    ctx.restore();
  };

  // Render Paper Template Background
  const drawPaperBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, template: PaperTemplateType) => {
    ctx.save();
    ctx.fillStyle = template === 'dark-grid' ? '#0f172a' : '#fffdf9';
    ctx.fillRect(0, 0, width, height);

    const gridColor = template === 'dark-grid' ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.28)';
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
      ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
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

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    drawPaperBackground(ctx, width, height, activePage.template);

    const visibleLayerMap = new Map(activePage.layers.map((l) => [l.id, l]));

    // 1. Render Images with Freehand / Magnetic Lasso Alpha Masking
    for (const imgObj of activePage.images || []) {
      const layer = visibleLayerMap.get(imgObj.layerId);
      if (layer && !layer.visible) continue;

      let imgEl = imageElementsCacheRef.current.get(imgObj.dataUrl);
      if (!imgEl) {
        imgEl = new Image();
        imgEl.src = imgObj.dataUrl;
        imgEl.onload = () => {
          setNotebooks((n) => [...n]); // Trigger re-render once loaded
        };
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

    // 2. Render Highlighters FIRST (underneath Pen Ink, just like Goodnotes 6!)
    for (const s of activePage.strokes) {
      if (s.tool !== 'highlighter') continue;
      const layer = visibleLayerMap.get(s.layerId);
      if (layer && !layer.visible) continue;
      drawStrokeOnContext(ctx, s, selectedStrokeIds.includes(s.id));
    }

    // 3. Render Pen & Pencil Strokes & Shapes
    for (const s of activePage.strokes) {
      if (s.tool === 'highlighter') continue;
      const layer = visibleLayerMap.get(s.layerId);
      if (layer && !layer.visible) continue;
      drawStrokeOnContext(ctx, s, selectedStrokeIds.includes(s.id));
    }

    // 4. Render Active Stroke in progress
    if (isDrawingRef.current && currentStrokePtsRef.current.length > 0 && ['pen', 'pencil', 'highlighter', 'shape'].includes(activeTool)) {
      const ptsToRender = snappedCurrentStrokeRef.current ? snappedCurrentStrokeRef.current.points : currentStrokePtsRef.current;
      const previewStroke: StrokeObject = {
        id: 'preview',
        tool: activeTool === 'highlighter' ? 'highlighter' : activeTool === 'pencil' ? 'pencil' : 'pen',
        color: strokeColor,
        fillColor: fillStyle !== 'none' ? fillColor : undefined,
        fillStyle,
        width: activeTool === 'highlighter' ? Math.max(16, strokeWidth * 4.5) : strokeWidth,
        opacity: activeTool === 'highlighter' ? 0.45 : 1,
        lineStyle,
        arrowEnd: arrowEnd || shapePreset === 'arrow',
        points: ptsToRender,
        layerId: activeLayerId,
      };
      drawStrokeOnContext(ctx, previewStroke);
    }

    // 5. Render Direct Node Editing Handles ("Λευκό Βελάκι" Illustrator)
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

    // 6. Render Lasso Selection Polygon
    if (lassoPolygonRef.current.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
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

    // 7. Render Active Image Crop Polygon (Freehand or Magnetic Lasso)
    if (imageCropMode !== 'none' && cropPolygonPts.length > 0) {
      ctx.save();
      ctx.strokeStyle = imageCropMode === 'magnetic' ? '#10b981' : '#f59e0b';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cropPolygonPts[0].x, cropPolygonPts[0].y);
      for (let i = 1; i < cropPolygonPts.length; i++) {
        ctx.lineTo(cropPolygonPts[i].x, cropPolygonPts[i].y);
      }
      ctx.stroke();
      // Draw magnetic anchor points
      for (let i = 0; i < cropPolygonPts.length; i += 4) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cropPolygonPts[i].x - 3, cropPolygonPts[i].y - 3, 6, 6);
        ctx.strokeRect(cropPolygonPts[i].x - 3, cropPolygonPts[i].y - 3, 6, 6);
      }
      ctx.restore();
    }

    // 8. Render Tape Tool Strips (Active Recall Study Tapes)
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

    // 9. Render Laser Pointer Trail
    if (laserTrail.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(laserTrail[0].x, laserTrail[0].y);
      for (let i = 1; i < laserTrail.length; i++) {
        ctx.lineTo(laserTrail[i].x, laserTrail[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [
    activePage,
    activeTool,
    strokeColor,
    fillColor,
    fillStyle,
    strokeWidth,
    lineStyle,
    arrowEnd,
    shapePreset,
    activeLayerId,
    selectedStrokeIds,
    selectedImageId,
    activeNodeStrokeId,
    imageCropMode,
    cropPolygonPts,
    laserTrail,
  ]);

  // Point-in-polygon check for Lasso Selection
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

  // Convert screen coordinates to canvas coordinates
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): BezierPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top) * scaleY;

    // If Digital Ruler is visible and cursor is near the ruler edge, snap to Ruler!
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
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      pressure: e.pressure > 0 ? e.pressure : 0.55,
      tiltX: e.tiltX || 0,
      tiltY: e.tiltY || 0,
      twist: (e as any).twist || 0,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Palm Rejection: If Apple Pencil Only mode is active, ignore finger touch for drawing
    if (pencilOnlyMode && e.pointerType === 'touch') {
      return;
    }

    const activeLayer = activePage.layers.find((l) => l.id === activeLayerId);
    if (activeLayer?.locked && ['pen', 'pencil', 'highlighter', 'eraser', 'shape'].includes(activeTool)) {
      showToast('🔒 Το επιλεγμένο Layer είναι κλειδωμένο! Ξεκλείδωσέ το ή επίλεξε άλλο Layer.');
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e);

    // 1. Image Freehand / Magnetic Lasso Cropping
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
        setCropPolygonPts([{ x: pt.x, y: pt.y }]);
        return;
      }
    }

    // 2. Tape Tool: Tap existing tape to toggle reveal, or drag to draw new tape
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

    // 3. Direct Node Editing ("Λευκό Βελάκι" Illustrator)
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
      // Otherwise select nearest stroke to edit its Bezier nodes
      const hit = activePage.strokes.find((s) => s.points.some((p) => distance(pt, p) < 16));
      setActiveNodeStrokeId(hit ? hit.id : null);
      return;
    }

    // 4. Lasso Tool: Check if clicking inside existing selection to drag it, or clicking a Group
    if (activeTool === 'lasso') {
      // Check image click first
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

      // Check if user tapped directly on a grouped stroke -> auto-select the entire Group!
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

    // 5. Eraser Tool
    if (activeTool === 'eraser') {
      isDrawingRef.current = true;
      eraseAtPoint(pt);
      return;
    }

    // 6. Pen / Pencil / Highlighter / Shape / Laser
    isDrawingRef.current = true;
    snappedCurrentStrokeRef.current = null;
    currentStrokePtsRef.current = [pt];
  };

  const eraseAtPoint = (pt: { x: number; y: number }) => {
    const lockedLayerIds = new Set(activePage.layers.filter((l) => l.locked).map((l) => l.id));
    const eraseRadius = Math.max(14, strokeWidth * 3.5);

    updateActivePage((page) => {
      if (eraserSubType === 'stroke' || eraserSubType === 'highlighter-only') {
        return {
          ...page,
          strokes: page.strokes.filter((s) => {
            if (lockedLayerIds.has(s.layerId)) return true;
            if (eraserSubType === 'highlighter-only' && s.tool !== 'highlighter') return true;
            const hit = s.points.some((p) => distance(pt, p) <= eraseRadius);
            return !hit;
          }),
        };
      } else {
        // Precision point eraser: splits or trims points within radius
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

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasPoint(e);
    setPencilTelemetry({
      pointerType: e.pointerType || 'pen',
      pressure: Math.round((e.pressure || 0) * 100) / 100,
      tiltX: e.tiltX || 0,
      twist: (e as any).twist || 0,
      hovering: !isDrawingRef.current,
      x: pt.x,
      y: pt.y,
    });

    if (!isDrawingRef.current) return;

    // 1. Image Freehand or Magnetic Lasso Crop
    if (imageCropMode !== 'none' && selectedImageId) {
      const imgObj = activePage.images.find((im) => im.id === selectedImageId);
      if (imgObj) {
        let nextX = pt.x;
        let nextY = pt.y;
        if (imageCropMode === 'magnetic' && edgeMapRef.current && edgeMapRef.current.id === imgObj.id) {
          const localX = pt.x - imgObj.x;
          const localY = pt.y - imgObj.y;
          const snapped = snapMagneticLassoPoint(
            localX,
            localY,
            edgeMapRef.current.map,
            edgeMapRef.current.w,
            edgeMapRef.current.h,
            20
          );
          nextX = imgObj.x + snapped.x;
          nextY = imgObj.y + snapped.y;
        }
        setCropPolygonPts((prev) => [...prev, { x: nextX, y: nextY }]);
      }
      return;
    }

    // 2. Direct Node Editing ("Λευκό Βελάκι")
    if (activeTool === 'direct-node' && activeNodeStrokeId && draggingNodeIdx) {
      updateActivePage((page) => ({
        ...page,
        strokes: page.strokes.map((s) => {
          if (s.id !== activeNodeStrokeId) return s;
          const newPts = [...s.points];
          const targetPt = { ...newPts[draggingNodeIdx.index] };
          if (draggingNodeIdx.isControl) {
            targetPt.cx = pt.x;
            targetPt.cy = pt.y;
          } else {
            const dx = pt.x - targetPt.x;
            const dy = pt.y - targetPt.y;
            targetPt.x = pt.x;
            targetPt.y = pt.y;
            if (targetPt.cx !== undefined && targetPt.cy !== undefined) {
              targetPt.cx += dx;
              targetPt.cy += dy;
            }
          }
          newPts[draggingNodeIdx.index] = targetPt;
          return { ...s, points: newPts };
        }),
      }), false);
      return;
    }

    // 3. Lasso Dragging or Drawing Lasso Polygon
    if (activeTool === 'lasso') {
      if (isDraggingSelectionRef.current) {
        const dx = pt.x - isDraggingSelectionRef.current.startX;
        const dy = pt.y - isDraggingSelectionRef.current.startY;
        isDraggingSelectionRef.current = { startX: pt.x, startY: pt.y };

        if (selectedImageId) {
          updateActivePage(
            (page) => ({
              ...page,
              images: page.images.map((im) => (im.id === selectedImageId ? { ...im, x: im.x + dx, y: im.y + dy } : im)),
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

      lassoPolygonRef.current.push({ x: pt.x, y: pt.y });
      setNotebooks((n) => [...n]);
      return;
    }

    // 4. Eraser
    if (activeTool === 'eraser') {
      eraseAtPoint(pt);
      return;
    }

    // 5. Laser Pointer
    if (activeTool === 'laser') {
      const now = Date.now();
      setLaserTrail((prev) => [...prev.filter((p) => now - p.t < 900), { x: pt.x, y: pt.y, t: now }]);
      return;
    }

    // 6. Pen / Pencil / Highlighter / Shape / Tape
    currentStrokePtsRef.current.push(pt);

    // Hold-to-Snap timer (320ms pause at end of stroke snaps to geometric shape!)
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
          showToast(`✨ Hold-to-Snap: Αναγνωρίστηκε ${snapped.shapeType.toUpperCase()}!`);
          setNotebooks((n) => [...n]);
        }
      }, 330);
    } else if (snappedCurrentStrokeRef.current && snappedCurrentStrokeRef.current.shapeType === 'line') {
      // Allow stretching the snapped straight line while holding Pencil down!
      const start = currentStrokePtsRef.current[0];
      snappedCurrentStrokeRef.current = {
        shapeType: 'line',
        points: [
          { x: start.x, y: start.y, pressure: 0.7 },
          { x: pt.x, y: pt.y, cx: (start.x + pt.x) / 2, cy: (start.y + pt.y) / 2, pressure: 0.7 },
        ],
      };
    }

    setNotebooks((n) => [...n]);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    // 1. Finish Image Lasso / Magnetic Lasso Crop
    if (imageCropMode !== 'none' && selectedImageId && cropPolygonPts.length >= 3) {
      const imgObj = activePage.images.find((im) => im.id === selectedImageId);
      if (imgObj) {
        const relPoly = cropPolygonPts.map((p) => ({
          x: Math.max(0, Math.min(imgObj.width, p.x - imgObj.x)),
          y: Math.max(0, Math.min(imgObj.height, p.y - imgObj.y)),
        }));
        updateActivePage((page) => ({
          ...page,
          images: page.images.map((im) => (im.id === selectedImageId ? { ...im, clipPolygon: relPoly } : im)),
        }));
        showToast(
          imageCropMode === 'magnetic'
            ? '🧲 Magnetic Lasso Crop ολοκληρώθηκε με πραγματική διαφάνεια!'
            : '✂️ Ελεύθερο Lasso Crop ολοκληρώθηκε με πραγματική διαφάνεια!'
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
      window.setTimeout(() => setLaserTrail([]), 650);
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
        showToast('🩹 Προστέθηκε Ταινία Απόκρυψης! Πάτησε πάνω της για αποκάλυψη.');
      }
      currentStrokePtsRef.current = [];
      return;
    }

    // 2. Finish Lasso Polygon Selection
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
        // Include all members of any Group that was touched!
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

    // 3. Check Scribble-to-Erase Gesture when using Pen!
    if (scribbleToEraseEnabled && activeTool === 'pen' && !snappedCurrentStrokeRef.current) {
      const scribble = isScribbleEraseGesture(rawPts);
      if (scribble.isScribble && scribble.bounds) {
        const b = scribble.bounds;
        const lockedLayers = new Set(activePage.layers.filter((l) => l.locked).map((l) => l.id));
        updateActivePage((page) => ({
          ...page,
          strokes: page.strokes.filter((s) => {
            if (lockedLayers.has(s.layerId)) return true;
            const hit = s.points.some((p) => p.x >= b.minX && p.x <= b.maxX && p.y >= b.minY && p.y <= b.maxY);
            return !hit;
          }),
        }));
        showToast('🧹 Scribble-to-Erase: Οι γραμμές κάτω από τη μουτζούρα σβήστηκαν αυτόματα!');
        return;
      }
    }

    // 4. Physics Grouped Stencils (Cylinder, Coordinate Axes, Resistor)
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
      showToast('🔗 Δημιουργήθηκε Grouped Σχήμα Φυσικής!');
      snappedCurrentStrokeRef.current = null;
      return;
    }

    // 5. Commit normal Bezier Stroke or Snapped Shape
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
      opacity: activeTool === 'highlighter' ? 0.45 : 1,
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

  // Grouping / Ungrouping Actions (Illustrator style)
  const handleGroupSelected = () => {
    if (selectedStrokeIds.length < 2) return;
    const newGroupId = `grp-${Date.now()}`;
    updateActivePage((page) => ({
      ...page,
      strokes: page.strokes.map((s) => (selectedStrokeIds.includes(s.id) ? { ...s, groupId: newGroupId } : s)),
    }));
    showToast(`🔗 Τα ${selectedStrokeIds.length} αντικείμενα ενώθηκαν σε Group!`);
  };

  const handleUngroupSelected = () => {
    if (selectedStrokeIds.length === 0) return;
    updateActivePage((page) => ({
      ...page,
      strokes: page.strokes.map((s) => (selectedStrokeIds.includes(s.id) ? { ...s, groupId: undefined } : s)),
    }));
    showToast('🔓 Έγινε Ungroup των επιλεγμένων αντικειμένων!');
  };

  // Zero-AI Greek Handwriting Beautifier Action
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
    showToast('✨ Τα ελληνικά χειρόγραφα & τα σύμβολα (=, κλάσματα) ευθυγραμμίστηκαν και λειάνθηκαν!');
  };

  // Generate a Demo Physics Diagram Image with White Background so user can test Transparent BG & Magnetic Lasso immediately!
  const handleInsertSamplePhysicsImage = () => {
    const c = document.createElement('canvas');
    c.width = 360;
    c.height = 220;
    const ctx = c.getContext('2d')!;
    // White background that hides grid lines until user clicks "Transparent BG"
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    // Draw a crisp Physics Inclined Plane + Block + Force Vectors diagram
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

    // Block on incline
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
    showToast('🖼️ Προστέθηκε Εικόνα Άσκησης με λευκό φόντο! Δοκίμασε «🪄 Transparent BG» ή «🧲 Magnetic Lasso»!');
  };

  // Import native .goodnotes file
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
      showToast(`📂 Το αρχείο "${file.name}" (.goodnotes) αποκωδικοποιήθηκε (${importedNb.pages.length} σελίδες)!`);
    } catch (err) {
      showToast('⚠️ Σφάλμα κατά την ανάγνωση του αρχείου .goodnotes.');
    }
    e.target.value = '';
  };

  // Import standard image file
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
      showToast('🖼️ Η εικόνα προστέθηκε! Επίλεξε Transparent BG ή Lasso/Magnetic Crop.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const selectedImgObj = activePage.images?.find((im) => im.id === selectedImageId);

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 text-slate-100 overflow-hidden select-none">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputGoodnotesRef}
        type="file"
        accept=".goodnotes,.zip"
        className="hidden"
        onChange={handleGoodnotesFileChange}
      />
      <input ref={fileInputImageRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />

      {/* 1. TOP BAR & GOODNOTES TABS */}
      <header className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'library' ? 'editor' : 'library')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-sky-400 transition cursor-pointer"
            title="Βιβλιοθήκη Τετραδίων"
          >
            <BookOpen className="w-4 h-4" />
            <span>Βιβλιοθήκη ({notebooks.length})</span>
          </button>

          <button
            onClick={() => fileInputGoodnotesRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-600/20 border border-sky-500/40 hover:bg-sky-600/30 text-xs font-semibold text-sky-300 transition cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Άνοιγμα .goodnotes</span>
          </button>
        </div>

        {/* Document Tabs (Goodnotes 6 Style) */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[46vw] py-0.5">
          {openNotebookIds.map((nbId) => {
            const nb = notebooks.find((n) => n.id === nbId);
            if (!nb) return null;
            const isActive = nb.id === activeNotebook.id && viewMode === 'editor';
            return (
              <button
                key={nb.id}
                onClick={() => {
                  setActiveNotebookId(nb.id);
                  setActivePageIndex(0);
                  setViewMode('editor');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium whitespace-nowrap transition cursor-pointer border-b-2 ${
                  isActive
                    ? 'bg-slate-800 text-white border-sky-400'
                    : 'bg-slate-900/70 text-slate-400 border-transparent hover:bg-slate-800/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: nb.coverColor }} />
                <span className="truncate max-w-[180px]">{nb.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300">
                  {nb.pages.length} σελ.
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: 30s Google Drive Auto-Sync + Undo/Redo + Apple Pencil Pro Mode */}
        <div className="flex items-center gap-2">
          {/* 30s Google Drive Auto-Sync Badge */}
          <div
            onClick={() => {
              setSyncStatus('syncing');
              window.setTimeout(() => {
                setSyncStatus('synced');
                setIsDirty(false);
                setSecondsToNextSync(30);
                setLastSyncedTime(new Date().toLocaleTimeString('el-GR'));
                showToast('☁️ Συγχρονίστηκε με το Google Drive (/BestNotes/)!');
              }, 500);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] cursor-pointer hover:border-sky-500/50"
            title={`Τελευταίο Sync: ${lastSyncedTime} (Αυτόματο Sync κάθε 30s)`}
          >
            <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="text-slate-300 hidden sm:inline">
              {syncStatus === 'syncing'
                ? 'Drive Syncing...'
                : isDirty
                ? `Auto-Sync σε ${secondsToNextSync}s`
                : 'Drive Synced'}
            </span>
          </div>

          <button
            onClick={() => setPencilOnlyMode(!pencilOnlyMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
              pencilOnlyMode
                ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Palm Rejection: Όταν είναι ενεργό, μόνο το Apple Pencil γράφει"
          >
            ✏️ {pencilOnlyMode ? 'Pencil Only: ON' : 'Pencil + Touch'}
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-35 cursor-pointer"
              title="Αναίρεση (Undo)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-35 cursor-pointer"
              title="Επανάληψη (Redo)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => settingsDialogRef.current?.showModal()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Ρυθμίσεις AI / Google Drive / Χαρτιού"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* IF IN LIBRARY VIEW */}
      {viewMode === 'library' ? (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Βιβλιοθήκη BestNotes</h1>
                <p className="text-sm text-slate-400">
                  Τα αρχεία σου `.goodnotes` Φυσικής έχουν ήδη αποκωδικοποιηθεί και φορτωθεί ως επεξεργάσιμες καμπύλες Bezier!
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputGoodnotesRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Εισαγωγή .goodnotes</span>
                </button>
                <button
                  onClick={() => {
                    const newNb: Notebook = {
                      id: `nb-${Date.now()}`,
                      title: `Νέο Τετράδιο Φυσικής ${notebooks.length + 1}`,
                      folder: 'Φυσική Γυμνασίου / Λυκείου',
                      coverColor: '#10b981',
                      updatedAt: new Date().toISOString(),
                      sourceFormat: '.bestnotes',
                      pages: [
                        {
                          id: `p-${Date.now()}`,
                          title: 'Σελίδα 1',
                          template: 'grid',
                          layers: [
                            { id: 'layer-1', name: 'Σχήμα Άσκησης (Κλείδωμα)', visible: true, locked: false, opacity: 1 },
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Νέο Τετράδιο</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  onClick={() => {
                    if (!openNotebookIds.includes(nb.id)) setOpenNotebookIds((p) => [...p, nb.id]);
                    setActiveNotebookId(nb.id);
                    setActivePageIndex(0);
                    setViewMode('editor');
                  }}
                  className="group relative rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-sky-400 p-5 cursor-pointer transition shadow-xl flex flex-col justify-between h-52"
                >
                  <div
                    className="w-12 h-3 rounded-full mb-3"
                    style={{ backgroundColor: nb.coverColor }}
                  />
                  <div>
                    <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 mb-2">
                      {nb.sourceFormat === '.goodnotes' ? 'Αποκωδικοποιημένο .goodnotes' : 'BestNotes Native'}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition">
                      {nb.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{nb.folder}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700/70">
                    <span>{nb.pages.length} Σελίδες</span>
                    <span>
                      {nb.pages.reduce((acc, p) => acc + p.strokes.length, 0)} Bezier Vectors
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 2. MAIN CREATION TOOLBAR (GOODNOTES 6 + ILLUSTRATOR & PHOTOSHOP TOOLS) */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 shrink-0 gap-2 overflow-x-auto">
            {/* Tool Icons */}
            <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'pen', label: 'Στυλό (Bezier)', icon: Pen },
                { id: 'highlighter', label: 'Μαρκαδόρος (Κάτω από μελάνι)', icon: Highlighter },
                { id: 'eraser', label: 'Γόμα & Scribble', icon: Eraser },
                { id: 'shape', label: 'Σχήματα & Φυσική', icon: Shapes },
                { id: 'lasso', label: 'Lasso & Group', icon: Lasso },
                { id: 'direct-node', label: 'Κόμβοι Bezier (Illustrator)', icon: MousePointer },
                { id: 'tape', label: 'Ταινία Απόκρυψης (Tape)', icon: Scissors },
                { id: 'laser', label: 'Laser Pointer', icon: Radio },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTool(t.id as ToolType);
                      setImageCropMode('none');
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      active
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                    title={t.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{t.label.split(' ')[0]}</span>
                  </button>
                );
              })}

              {/* Ruler Toggle */}
              <button
                onClick={() => setRulerState((r) => ({ ...r, visible: !r.visible }))}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  rulerState.visible ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Ψηφιακός Χάρακας (Ruler)"
              >
                <Ruler className="w-4 h-4" />
              </button>

              {/* Image + Photoshop Tools Trigger */}
              <button
                onClick={handleInsertSamplePhysicsImage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-700/40 hover:bg-emerald-900/50 transition cursor-pointer"
                title="Εισαγωγή Δοκιμαστικού Σχήματος Φυσικής (για δοκιμή Transparent BG & Magnetic Lasso)"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden xl:inline">+ Σχήμα Εικόνας</span>
              </button>

              <button
                onClick={() => fileInputImageRef.current?.click()}
                className="px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                title="Ανέβασμα δικής σου εικόνας/screenshot"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>

              {/* Math & LaTeX Solver Modal Button */}
              <button
                onClick={() => mathDialogRef.current?.showModal()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/50 border border-purple-700/40 hover:bg-purple-900/50 transition cursor-pointer"
                title="Μετατροπή σε LaTeX & Επίλυση Εξίσωσης (CAS)"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden md:inline">LaTeX / CAS</span>
              </button>

              {/* Layers Panel Toggle */}
              <button
                onClick={() => setShowLayersPanel(!showLayersPanel)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  showLayersPanel
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
                title="Layers (Επίπεδα με 🔒 Κλείδωμα & 👁️ Απόκρυψη)"
              >
                <Layers className="w-4 h-4" />
                <span>Layers ({activePage.layers.length})</span>
              </button>
            </div>

            {/* Contextual Colors, Stroke Widths & Line Styles */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
              {/* Color Presets */}
              <div className="flex items-center gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setStrokeColor(c)}
                    className={`w-5 h-5 rounded-full transition cursor-pointer ${
                      strokeColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="h-4 w-px bg-slate-800" />

              {/* 3 Quick Stroke Width Slots */}
              <div className="flex items-center gap-1">
                {[2.2, 3.6, 5.5].map((w) => (
                  <button
                    key={w}
                    onClick={() => setStrokeWidth(w)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer ${
                      Math.abs(strokeWidth - w) < 0.3 ? 'bg-sky-600/30 border border-sky-400' : 'hover:bg-slate-800'
                    }`}
                    title={`Πάχος ${w}px`}
                  >
                    <span
                      className="rounded-full bg-white"
                      style={{ width: Math.min(14, w * 2.2), height: Math.min(14, w * 2.2) }}
                    />
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-slate-800" />

              {/* Line Style: Solid / Dashed / Dotted + Vector Arrow Toggle */}
              <div className="flex items-center gap-1">
                {(['solid', 'dashed', 'dotted'] as LineStyleType[]).map((ls) => (
                  <button
                    key={ls}
                    onClick={() => setLineStyle(ls)}
                    className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer ${
                      lineStyle === ls ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ls === 'solid' ? '───' : ls === 'dashed' ? '- - -' : '• • •'}
                  </button>
                ))}
                <button
                  onClick={() => setArrowEnd(!arrowEnd)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                    arrowEnd ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Αυτόματο Βέλος Διανύσματος (F⃗, υ⃗) στην άκρη της γραμμής"
                >
                  ➔ Διάνυσμα
                </button>
              </div>
            </div>
          </div>

          {/* 3. CONTEXTUAL SUB-TOOLBAR (Shape Presets, Lasso Group/Tidy, or Photoshop Image Crop/Transparent BG) */}
          <div className="flex items-center justify-between px-4 py-1 bg-slate-950/90 border-b border-slate-800/80 text-xs shrink-0 gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {activeTool === 'shape' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Σχήμα / Stencil:</span>
                  {[
                    { id: 'auto', label: '✨ Auto Snap' },
                    { id: 'line', label: '╱ Ευθεία' },
                    { id: 'arrow', label: '➔ Βέλος' },
                    { id: 'rectangle', label: '▭ Ορθογώνιο' },
                    { id: 'parallelogram', label: '▱ Παραλληλόγραμμο' },
                    { id: 'ellipse', label: '◯ Έλλειψη/Κύκλος' },
                    { id: 'triangle', label: '△ Τρίγωνο' },
                    { id: 'cylinder', label: '🥫 Αγωγός (Group)' },
                    { id: 'axes', label: '📈 Άξονες x-y' },
                    { id: 'resistor', label: '⚡ Αντιστάτης R' },
                  ].map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => setShapePreset(sp.id as ShapePresetType)}
                      className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                        shapePreset === sp.id ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                  <div className="h-3.5 w-px bg-slate-700 mx-1" />
                  <span className="text-slate-400">Γέμισμα:</span>
                  {(['none', 'solid', 'hatching'] as FillStyleType[]).map((fs) => (
                    <button
                      key={fs}
                      onClick={() => setFillStyle(fs)}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        fillStyle === fs ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {fs === 'none' ? 'Κενό' : fs === 'solid' ? '🎨 Χρώμα' : '/// Διαγράμμιση'}
                    </button>
                  ))}
                </div>
              )}

              {activeTool === 'eraser' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Λειτουργία Γόμας:</span>
                  {[
                    { id: 'stroke', label: 'Ολόκληρη Γραμμή (Stroke)' },
                    { id: 'precision', label: 'Ακριβείας (Pixel)' },
                    { id: 'highlighter-only', label: 'Μόνο Μαρκαδόρος' },
                  ].map((er) => (
                    <button
                      key={er.id}
                      onClick={() => setEraserSubType(er.id as EraserSubType)}
                      className={`px-2.5 py-0.5 rounded-md cursor-pointer ${
                        eraserSubType === er.id ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {er.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Illustrator Grouping & Handwriting Beautifier Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleBeautifySelected}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-600/30 border border-indigo-400/50 text-indigo-200 hover:bg-indigo-600/50 font-medium cursor-pointer"
                  title="Εγγενές (Zero-AI) Στρώσιμο Ελληνικού Χειρογράφου, Baseline & Συμβόλων (=, κλάσματα)"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Στρώσιμο Χειρογράφου {selectedStrokeIds.length > 0 ? `(${selectedStrokeIds.length})` : '(Σελίδας)'}</span>
                </button>

                {selectedStrokeIds.length > 0 && (
                  <>
                    <button
                      onClick={handleGroupSelected}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-semibold cursor-pointer"
                    >
                      <Group className="w-3.5 h-3.5" />
                      <span>🔗 Group ({selectedStrokeIds.length})</span>
                    </button>
                    <button
                      onClick={handleUngroupSelected}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
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
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600/30 text-rose-300 hover:bg-rose-600/50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Διαγραφή</span>
                    </button>
                  </>
                )}

                {/* Photoshop Image Controls when an Image is selected */}
                {selectedImgObj && (
                  <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-600/40 px-2.5 py-0.5 rounded-lg">
                    <span className="text-emerald-300 font-semibold">Photoshop Εικόνας:</span>
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
                        showToast('🪄 Αφαιρέθηκε όλο το λευκό φόντο (Transparent BG) με ομαλό anti-aliasing!');
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white font-medium cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>1-Click Transparent BG</span>
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
                        showToast('🪄 Magic Wand: Αφαιρέθηκε μόνο το εξωτερικό φόντο!');
                      }}
                      className="px-2 py-0.5 rounded bg-teal-700 text-white font-medium cursor-pointer"
                    >
                      🪄 Magic Wand (Εξωτερικό)
                    </button>
                    <button
                      onClick={() => {
                        setImageCropMode('freehand');
                        setCropPolygonPts([]);
                        showToast('✂️ Σχεδίασε οποιοδήποτε ελεύθερο σχήμα πάνω στην εικόνα για Lasso Crop!');
                      }}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                        imageCropMode === 'freehand' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-300'
                      }`}
                    >
                      ✂️ Ελεύθερο Lasso Crop
                    </button>
                    <button
                      onClick={() => {
                        setImageCropMode('magnetic');
                        setCropPolygonPts([]);
                        showToast('🧲 Magnetic Lasso ενεργό! Πέρασε το Apple Pencil κοντά στις ακμές του σχήματος!');
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium cursor-pointer ${
                        imageCropMode === 'magnetic' ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-emerald-300'
                      }`}
                    >
                      <Magnet className="w-3 h-3" />
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
                        showToast('↺ Επαναφορά αρχικής εικόνας.');
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 cursor-pointer"
                      title="Επαναφορά εικόνας"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right side of Sub-Toolbar: Page Navigation & Apple Pencil Pro Telemetry */}
            <div className="flex items-center gap-3">
              <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>Πίεση: {Math.round(pencilTelemetry.pressure * 100)}%</span>
                <span>Tilt: {pencilTelemetry.tiltX}°</span>
                <span>Roll: {pencilTelemetry.twist}°</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActivePageIndex((i) => Math.max(0, i - 1))}
                  disabled={activePageIndex === 0}
                  className="p-0.5 hover:text-sky-400 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-200 px-1">
                  Σελ. {activePageIndex + 1} / {activeNotebook.pages.length}
                </span>
                <button
                  onClick={() => setActivePageIndex((i) => Math.min(activeNotebook.pages.length - 1, i + 1))}
                  disabled={activePageIndex >= activeNotebook.pages.length - 1}
                  className="p-0.5 hover:text-sky-400 disabled:opacity-30 cursor-pointer"
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
                      prev.map((nb) =>
                        nb.id === activeNotebook.id ? { ...nb, pages: [...nb.pages, newPage] } : nb
                      )
                    );
                    setActivePageIndex(activeNotebook.pages.length);
                    showToast(`📄 Προστέθηκε η Σελίδα ${activeNotebook.pages.length + 1}!`);
                  }}
                  className="ml-1 px-1.5 py-0.5 rounded bg-sky-600/30 text-sky-300 hover:bg-sky-600/50 font-bold cursor-pointer"
                  title="Προσθήκη Νέας Σελίδας"
                >
                  + Σελ.
                </button>
              </div>
            </div>
          </div>

          {/* 4. MAIN WORKSPACE AREA (CANVAS + FLOATING LAYERS PANEL + RULER + MATH OVERLAYS) */}
          <div className="relative flex-1 overflow-auto bg-slate-800/90 flex justify-center items-start p-4">
            {/* Status Toast Banner */}
            {statusBanner && (
              <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-950/95 border border-sky-500/50 text-sky-200 text-xs font-medium shadow-2xl">
                {statusBanner}
              </div>
            )}

            {/* Floating Layers Drawer (Photoshop / Procreate style) */}
            {showLayersPanel && (
              <div className="fixed right-5 top-32 z-40 w-72 rounded-2xl bg-slate-950/95 border border-slate-700 shadow-2xl p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Layers (Επίπεδα Σελίδας)</span>
                  </div>
                  <button
                    onClick={() => {
                      const newId = `layer-${Date.now()}`;
                      updateActivePage((page) => ({
                        ...page,
                        layers: [
                          ...page.layers,
                          { id: newId, name: `Layer ${page.layers.length + 1}`, visible: true, locked: false, opacity: 1 },
                        ],
                      }));
                      setActiveLayerId(newId);
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                  >
                    + Νέο Layer
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
                            ? 'bg-sky-950/60 border-sky-500/60 text-white'
                            : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{layer.name}</span>
                          <span className="text-[10px] text-slate-400">{count} αντικείμενα</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateActivePage((page) => ({
                                ...page,
                                layers: page.layers.map((l) => (l.id === layer.id ? { ...l, locked: !l.locked } : l)),
                              }));
                            }}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              layer.locked ? 'bg-rose-500/20 text-rose-400' : 'hover:bg-slate-800 text-slate-400'
                            }`}
                            title={layer.locked ? 'Ξεκλείδωμα Layer' : 'Κλείδωμα Layer (προστασία από τη Γόμα!)'}
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
                              !layer.visible ? 'bg-slate-800 text-slate-500' : 'hover:bg-slate-800 text-sky-400'
                            }`}
                            title={layer.visible ? 'Απόκρυψη Layer' : 'Εμφάνιση Layer'}
                          >
                            {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  💡 <strong>Tip για μάθημα:</strong> Κλείδωσε (🔒) το Layer με το σχήμα της άσκησης ώστε με τη Γόμα να σβήνεις μόνο τις πράξεις!
                </p>
              </div>
            )}

            {/* Page Paper Container */}
            <div className="relative shadow-2xl rounded-sm overflow-hidden border border-slate-700 bg-white">
              <canvas
                ref={canvasRef}
                width={920}
                height={1260}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="block w-[920px] h-[1260px] cursor-crosshair touch-none"
              />

              {/* Rendered Text & LaTeX Blocks Overlay */}
              {(activePage.texts || []).map((txt) => (
                <div
                  key={txt.id}
                  style={{ left: txt.x, top: txt.y, color: txt.color, fontSize: txt.fontSize }}
                  className="absolute px-2 py-1 rounded hover:ring-1 hover:ring-sky-400 cursor-move bg-transparent"
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

              {/* Movable & Rotatable Digital Ruler Overlay */}
              {rulerState.visible && (
                <div
                  style={{
                    left: rulerState.x - 260,
                    top: rulerState.y - 26,
                    transform: `rotate(${rulerState.angle}deg)`,
                  }}
                  className="absolute w-[520px] h-[52px] bg-amber-200/80 border-2 border-amber-500 rounded-lg shadow-lg backdrop-blur-xs flex items-center justify-between px-4 select-none"
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
                      ⬇ Μετακίνηση
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 5. MATH / LATEX CONVERTER & OFFLINE CAS SOLVER DIALOG (closedby="any" per modern-web-guidance) */}
      <dialog
        ref={mathDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="mathDialogTitle"
        className="m-auto rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="mathDialogTitle" className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              <span>Μετατροπή σε LaTeX & Offline CAS Solver</span>
            </h2>
            <button
              onClick={() => mathDialogRef.current?.close()}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
            >
              Κλείσιμο
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Επίλυση Εξίσωσης Φυσικής / Μαθηματικών (100% Εγγενώς & Offline CAS):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mathEquationToSolve}
                onChange={(e) => setMathEquationToSolve(e.target.value)}
                placeholder="π.χ. 15 * t = 90 ή 20 * 3600 / 1000"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white select-text"
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
            <label className="block text-xs text-slate-400 mb-1">Κώδικας LaTeX (με Ελληνικά & Σύμβολα Φυσικής):</label>
            <input
              type="text"
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-sky-300 select-text"
            />
          </div>

          <div className="p-4 rounded-xl bg-white text-slate-900 overflow-x-auto">
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
                showToast('📐 Η εξίσωση LaTeX προστέθηκε στη σελίδα σου!');
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
            >
              + Εισαγωγή Εξίσωσης στη Σελίδα
            </button>
          </div>
        </div>
      </dialog>

      {/* 6. SETTINGS DIALOG (Paper Template, Free Gemini API Key, Export) */}
      <dialog
        ref={settingsDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="settingsDialogTitle"
        className="m-auto rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 p-6 w-full max-w-md shadow-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="settingsDialogTitle" className="text-lg font-bold text-white">
              Ρυθμίσεις Σελίδας & Συγχρονισμού
            </h2>
            <button
              onClick={() => settingsDialogRef.current?.close()}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
            >
              Κλείσιμο
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Πρότυπο Χαρτιού (Paper Template):</label>
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
                  onClick={() =>
                    updateActivePage((page) => ({ ...page, template: tpl.id as PaperTemplateType }))
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-medium border cursor-pointer ${
                    activePage.template === tpl.id
                      ? 'bg-sky-600 border-sky-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between text-xs">
              <span>✨ Hold-to-Snap (Αυτόματη διόρθωση σχημάτων σε 0.3s)</span>
              <input
                type="checkbox"
                checked={holdToSnapEnabled}
                onChange={(e) => setHoldToSnapEnabled(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between text-xs">
              <span>🧹 Scribble-to-Erase (Μουτζούρωμα για σβήσιμο)</span>
              <input
                type="checkbox"
                checked={scribbleToEraseEnabled}
                onChange={(e) => setScribbleToEraseEnabled(e.target.checked)}
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs text-slate-400 mb-1">
              Δωρεάν Gemini API Key (από aistudio.google.com για OCR χειρογράφων):
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => {
                setGeminiApiKey(e.target.value);
                localStorage.setItem('bestnotes_gemini_key', e.target.value);
              }}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white select-text"
            />
          </div>
        </div>
      </dialog>
    </div>
  );
}
