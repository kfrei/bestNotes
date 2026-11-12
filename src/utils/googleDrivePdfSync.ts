import katex from 'katex';
import {
  Notebook,
  NotePage,
  StrokeObject,
  TextObject,
  CircuitSimConfig,
  HookeMeasurementRow,
  A4_GRID_STEP_PX,
  getPageLogicalWidth,
  getPageLogicalHeight,
  getEffectivePaperColor,
  isDarkPaperColor,
  getPaperRuleColors,
} from '../types/note';
import {
  computeResistorOrSpringPoints,
  distance,
  isFreehandLoopClosed,
  ensureWaveBezierPoints,
  getCubicSegmentControlPoints,
  analyzeCircuitForSimulation,
  convertPlainTextToMathLatex,
  splitAndCleanMathLatexLines,
} from './geometryAndAlgorithms';

function getStrokeBounds(s: StrokeObject): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of s.points || []) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return Number.isFinite(minX) ? { minX, maxX, minY, maxY } : { minX: 0, maxX: 0, minY: 0, maxY: 0 };
}
import {
  getPeriodicElementByZ,
  validateAndCorrectChemicalEquation,
  get3DMoleculeModel,
  inferReactionFromCanvasAtoms,
  getNaturalNucleusRadiusPx,
  getNaturalOuterOrbitRadiusPx,
  normalizeCovalentAtomPositions,
} from './periodicTableData';
import { ensurePdfPageDataUrl } from './pdfAndImageImporter';

export interface PageRulerSnapshotState {
  visible: boolean;
  x: number;
  y: number;
  angle: number;
  showMm?: boolean;
  lengthPx?: number;
}

export interface PdfExportOptions {
  activePageId?: string;
  liveSimCanvas?: HTMLCanvasElement | null;
  rulersByPageId?: Record<string, PageRulerSnapshotState>;
  isCircuitSimulating?: boolean;
  circuitSwitchClosed?: boolean;
  circuitShowElectrons?: boolean;
  circuitFlowDirection?: 'electrons' | 'conventional';
  circuitShowDarkWireTrack?: boolean;
}

const PDF_SCALE = 1.32; // Balanced high-clarity A4 PDF page render with ~65% smaller file size

function loadImageElement(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawPaperTemplateForPdf(
  ctx: CanvasRenderingContext2D,
  template: NotePage['template'],
  w: number,
  h: number,
  paperColor?: string
) {
  ctx.save();
  const bgHex = getEffectivePaperColor({ template, paperColor });
  const ruleColors = getPaperRuleColors(bgHex);
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, w, h);

  if (template === 'blank') {
    ctx.restore();
    return;
  }

  ctx.strokeStyle = ruleColors.pdfGrid;
  ctx.lineWidth = 1;
  const step = A4_GRID_STEP_PX;

  if (template === 'grid' || template === 'dark-grid') {
    ctx.beginPath();
    for (let x = step; x < w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = step; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  } else if (template === 'ruled' || template === 'cornell') {
    const lineStep = 29; // Divides 1334 (46*29) cleanly
    ctx.beginPath();
    for (let y = lineStep * 3; y < h - lineStep; y += lineStep) {
      ctx.moveTo(step * 2, y);
      ctx.lineTo(w - step * 2, y);
    }
    ctx.stroke();
    if (template === 'cornell') {
      ctx.strokeStyle = ruleColors.cornell;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(step * 10, lineStep * 2);
      ctx.lineTo(step * 10, h - lineStep * 5);
      ctx.moveTo(step * 2, h - lineStep * 5);
      ctx.lineTo(w - step * 2, h - lineStep * 5);
      ctx.stroke();
    }
  } else if (template === 'dotted') {
    ctx.fillStyle = ruleColors.dot;
    for (let x = step; x < w; x += step) {
      for (let y = step; y < h; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawStrokeForPdf(ctx: CanvasRenderingContext2D, s: StrokeObject) {
  if (!s.points || s.points.length === 0) return;
  ctx.save();

  const isBulbInternalFilamentOrLead =
    s.shapeType === 'bulb' &&
    (s.id.includes('-bulb-coil') ||
      s.id.includes('-bulb-lead-') ||
      s.id.includes('-bulb-fil'));

  if (s.tool === 'highlighter') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.38;
  } else {
    ctx.globalAlpha = isBulbInternalFilamentOrLead ? 0.9 : s.opacity ?? 1;
  }

  ctx.strokeStyle = isBulbInternalFilamentOrLead ? s.color || '#334155' : s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = s.tool === 'highlighter' ? 'butt' : 'round';
  ctx.lineJoin = 'round';

  if (s.lineStyle === 'dashed') {
    ctx.setLineDash([s.width * 3, s.width * 2.2]);
  } else if (s.lineStyle === 'dotted') {
    ctx.setLineDash([s.width * 0.8, s.width * 2.2]);
  } else {
    ctx.setLineDash([]);
  }

  // 3D Shapes & Hooked Lab Weight
  if (
    (s.shapeType === 'cuboid' ||
      s.shapeType === 'cylinder' ||
      s.shapeType === 'sphere' ||
      s.shapeType === 'pyramid' ||
      s.shapeType === 'hooked-weight') &&
    s.points.length >= 4
  ) {
    const [q0, q1, q2, q3] = s.points;
    const bilerp = (u: number, v: number) => ({
      x: (1 - u) * (1 - v) * q0.x + u * (1 - v) * q1.x + u * v * q2.x + (1 - u) * v * q3.x,
      y: (1 - u) * (1 - v) * q0.y + u * (1 - v) * q1.y + u * v * q2.y + (1 - u) * v * q3.y,
    });
    const isFilled3D = Boolean(s.fillStyle && s.fillStyle !== 'none');
    const shadeColor = s.color || s.fillColor || '#2563eb';
    const fillTrans3D = s.fillTransparency ?? 90;
    const alphaScale3D =
      (fillTrans3D === 25 || fillTrans3D === 20
        ? 0.75
        : fillTrans3D === 45 || fillTrans3D === 50
        ? 0.55
        : 0.11) / 0.24;

    const traceEllipseBilerp = (
      uc: number,
      vc: number,
      ru: number,
      rv: number,
      startAng = 0,
      endAng = Math.PI * 2,
      moveToFirst = true
    ) => {
      const steps = 48;
      for (let i = 0; i <= steps; i++) {
        const ang = startAng + ((endAng - startAng) * i) / steps;
        const pt = bilerp(uc + ru * Math.cos(ang), vc + rv * Math.sin(ang));
        if (i === 0 && moveToFirst) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
    };

    if (s.shapeType === 'hooked-weight') {
      const bTL = bilerp(0.10, 0.20);
      const bTR = bilerp(0.90, 0.20);
      const bBR = bilerp(0.90, 0.80);
      const bBL = bilerp(0.10, 0.80);
      ctx.save();
      ctx.fillStyle = isFilled3D ? s.fillColor || '#cbd5e1' : '#cbd5e1';
      ctx.globalAlpha = isFilled3D ? Math.min(0.92, 0.28 * alphaScale3D) : 0.68;
      ctx.beginPath();
      ctx.moveTo(bTL.x, bTL.y);
      ctx.lineTo(bTR.x, bTR.y);
      ctx.lineTo(bBR.x, bBR.y);
      ctx.lineTo(bBL.x, bBL.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const topStemBot = bilerp(0.5, 0.20);
      const topStemTop = bilerp(0.5, 0.13);
      const botStemTop = bilerp(0.5, 0.80);
      const botStemBot = bilerp(0.5, 0.87);
      ctx.beginPath();
      ctx.moveTo(bTL.x, bTL.y);
      ctx.lineTo(bTR.x, bTR.y);
      ctx.lineTo(bBR.x, bBR.y);
      ctx.lineTo(bBL.x, bBL.y);
      ctx.closePath();
      ctx.moveTo(topStemBot.x, topStemBot.y);
      ctx.lineTo(topStemTop.x, topStemTop.y);
      traceEllipseBilerp(0.5, 0.068, 0.19, 0.064, Math.PI * 0.5, Math.PI * 2.15, true);
      ctx.moveTo(botStemTop.x, botStemTop.y);
      ctx.lineTo(botStemBot.x, botStemBot.y);
      traceEllipseBilerp(0.5, 0.932, 0.19, 0.064, -Math.PI * 0.5, Math.PI * 1.15, true);
      ctx.stroke();

      // Crisp mass label ("0,1 kg" -> W = m·10 = 1 N) inside the weight body
      const bodyCenter = bilerp(0.5, 0.5);
      const bodyW = Math.hypot(bTR.x - bTL.x, bTR.y - bTL.y);
      const bodyH = Math.hypot(bBL.x - bTL.x, bBL.y - bTL.y);
      if (bodyW >= 11 && bodyH >= 12) {
        const rotAng = Math.atan2(bTR.y - bTL.y, bTR.x - bTL.x);
        ctx.save();
        ctx.translate(bodyCenter.x, bodyCenter.y);
        ctx.rotate(rotAng);
        ctx.fillStyle = s.color || '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (bodyW >= 28 || bodyH < 18) {
          const fSz = Math.max(7, Math.min(10.5, Math.min(bodyW * 0.28, bodyH * 0.45)));
          ctx.font = `800 ${fSz.toFixed(1)}px system-ui, -apple-system, sans-serif`;
          ctx.fillText('0,1 kg', 0, 0.5);
        } else {
          const fSz = Math.max(6.8, Math.min(9.5, Math.min(bodyW * 0.48, bodyH * 0.34)));
          ctx.font = `800 ${fSz.toFixed(1)}px system-ui, -apple-system, sans-serif`;
          ctx.fillText('0,1', 0, -fSz * 0.48);
          ctx.font = `700 ${(fSz * 0.88).toFixed(1)}px system-ui, -apple-system, sans-serif`;
          ctx.fillText('kg', 0, fSz * 0.52);
        }
        ctx.restore();
      }

      ctx.restore();
      return;
    }

    if (s.shapeType === 'cuboid') {
      const fTL = bilerp(0, 0.26);
      const fTR = bilerp(0.78, 0.26);
      const fBR = bilerp(0.78, 1.0);
      const fBL = bilerp(0, 1.0);
      const bTL = bilerp(0.22, 0);
      const bTR = bilerp(1.0, 0);
      const bBR = bilerp(1.0, 0.74);
      if (isFilled3D) {
        ctx.save();
        ctx.fillStyle = shadeColor;
        ctx.globalAlpha = Math.min(0.92, 0.22 * alphaScale3D);
        ctx.beginPath();
        ctx.moveTo(fTL.x, fTL.y);
        ctx.lineTo(fTR.x, fTR.y);
        ctx.lineTo(fBR.x, fBR.y);
        ctx.lineTo(fBL.x, fBL.y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = Math.min(0.92, 0.16 * alphaScale3D);
        ctx.beginPath();
        ctx.moveTo(fTL.x, fTL.y);
        ctx.lineTo(bTL.x, bTL.y);
        ctx.lineTo(bTR.x, bTR.y);
        ctx.lineTo(fTR.x, fTR.y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = Math.min(0.92, 0.36 * alphaScale3D);
        ctx.beginPath();
        ctx.moveTo(fTR.x, fTR.y);
        ctx.lineTo(bTR.x, bTR.y);
        ctx.lineTo(bBR.x, bBR.y);
        ctx.lineTo(fBR.x, fBR.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.moveTo(fTL.x, fTL.y);
      ctx.lineTo(fTR.x, fTR.y);
      ctx.lineTo(fBR.x, fBR.y);
      ctx.lineTo(fBL.x, fBL.y);
      ctx.closePath();
      ctx.moveTo(fTL.x, fTL.y);
      ctx.lineTo(bTL.x, bTL.y);
      ctx.lineTo(bTR.x, bTR.y);
      ctx.lineTo(fTR.x, fTR.y);
      ctx.moveTo(bTR.x, bTR.y);
      ctx.lineTo(bBR.x, bBR.y);
      ctx.lineTo(fBR.x, fBR.y);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (s.shapeType === 'cylinder') {
      const topLeft = bilerp(0, 0.14);
      const topRight = bilerp(1, 0.14);
      const botLeft = bilerp(0, 0.86);
      const botRight = bilerp(1, 0.86);
      if (isFilled3D) {
        ctx.save();
        ctx.fillStyle = shadeColor;
        ctx.globalAlpha = Math.min(0.92, 0.22 * alphaScale3D);
        ctx.beginPath();
        traceEllipseBilerp(0.5, 0.14, 0.5, 0.14, Math.PI, Math.PI * 2, true);
        ctx.lineTo(botRight.x, botRight.y);
        traceEllipseBilerp(0.5, 0.86, 0.5, 0.14, 0, Math.PI, false);
        ctx.lineTo(topLeft.x, topLeft.y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = Math.min(0.92, 0.36 * alphaScale3D);
        ctx.beginPath();
        traceEllipseBilerp(0.5, 0.14, 0.5, 0.14, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      traceEllipseBilerp(0.5, 0.14, 0.5, 0.14, 0, Math.PI * 2, true);
      traceEllipseBilerp(0.5, 0.86, 0.5, 0.14, 0, Math.PI * 2, true);
      ctx.moveTo(topLeft.x, topLeft.y);
      ctx.lineTo(botLeft.x, botLeft.y);
      ctx.moveTo(topRight.x, topRight.y);
      ctx.lineTo(botRight.x, botRight.y);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (s.shapeType === 'sphere') {
      if (isFilled3D) {
        ctx.save();
        ctx.fillStyle = shadeColor;
        ctx.globalAlpha = Math.min(0.92, 0.24 * alphaScale3D);
        ctx.beginPath();
        traceEllipseBilerp(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      traceEllipseBilerp(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, true);
      traceEllipseBilerp(0.5, 0.5, 0.5, 0.18, 0, Math.PI, true);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (s.shapeType === 'pyramid') {
      const pApex = bilerp(0.5, 0);
      const pLeft = bilerp(0, 0.76);
      const pFront = bilerp(0.5, 1.0);
      const pRight = bilerp(1.0, 0.76);
      if (isFilled3D) {
        ctx.save();
        ctx.fillStyle = shadeColor;
        ctx.globalAlpha = Math.min(0.92, 0.22 * alphaScale3D);
        ctx.beginPath();
        ctx.moveTo(pApex.x, pApex.y);
        ctx.lineTo(pLeft.x, pLeft.y);
        ctx.lineTo(pFront.x, pFront.y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = Math.min(0.92, 0.38 * alphaScale3D);
        ctx.beginPath();
        ctx.moveTo(pApex.x, pApex.y);
        ctx.lineTo(pFront.x, pFront.y);
        ctx.lineTo(pRight.x, pRight.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.moveTo(pApex.x, pApex.y);
      ctx.lineTo(pLeft.x, pLeft.y);
      ctx.lineTo(pFront.x, pFront.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.closePath();
      ctx.moveTo(pApex.x, pApex.y);
      ctx.lineTo(pFront.x, pFront.y);
      ctx.stroke();
      ctx.restore();
      return;
    }
  }

  if ((s.shapeType === 'resistor' || s.shapeType === 'spring') && s.points.length >= 4) {
    const polyPts = computeResistorOrSpringPoints(s.shapeType, s.points);
    if (polyPts.length > 0) {
      ctx.beginPath();
      ctx.moveTo(polyPts[0].x, polyPts[0].y);
      for (let i = 1; i < polyPts.length; i++) {
        ctx.lineTo(polyPts[i].x, polyPts[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (s.shapeType === 'title-box' && s.points.length >= 4) {
    const [q0, q1, q2, q3] = s.points;
    const wDx = q1.x - q0.x;
    const wDy = q1.y - q0.y;
    const hDx = q3.x - q0.x;
    const hDy = q3.y - q0.y;
    const wLen = Math.hypot(wDx, wDy);
    const hLen = Math.hypot(hDx, hDy);
    if (wLen > 2 && hLen > 2) {
      const ux = wDx / wLen;
      const uy = wDy / wLen;
      const vx = hDx / hLen;
      const vy = hDy / hLen;
      const rCorner = Math.max(3.5, Math.min(7.5, Math.min(wLen, hLen) * 0.1));

      const traceRoundedQuad = (
        c0: { x: number; y: number },
        c1: { x: number; y: number },
        c2: { x: number; y: number },
        c3: { x: number; y: number },
        rad: number
      ) => {
        const corners = [c0, c1, c2, c3];
        ctx.moveTo((c3.x + c0.x) * 0.5, (c3.y + c0.y) * 0.5);
        for (let ci = 0; ci < 4; ci++) {
          const prevC = corners[(ci + 3) % 4];
          const curC = corners[ci];
          const nextC = corners[(ci + 1) % 4];
          const lenA = Math.hypot(curC.x - prevC.x, curC.y - prevC.y);
          const lenB = Math.hypot(nextC.x - curC.x, nextC.y - curC.y);
          const effR = Math.max(0, Math.min(rad, lenA * 0.46, lenB * 0.46));
          ctx.arcTo(curC.x, curC.y, (curC.x + nextC.x) * 0.5, (curC.y + nextC.y) * 0.5, effR);
        }
        ctx.closePath();
      };

      const bMinX = Math.min(q0.x, q1.x, q2.x, q3.x);
      const bMaxX = Math.max(q0.x, q1.x, q2.x, q3.x);
      const bMinY = Math.min(q0.y, q1.y, q2.y, q3.y);
      const bMaxY = Math.max(q0.y, q1.y, q2.y, q3.y);
      const shadowScale = Math.max(0.62, Math.min(1.18, Math.min(wLen, hLen) / 74));
      const baseAlpha = s.opacity ?? 1;

      ctx.save();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.rect(bMinX - 52, bMinY - 52, bMaxX - bMinX + 104, bMaxY - bMinY + 104);
      traceRoundedQuad(q0, q1, q2, q3, rCorner);
      ctx.clip('evenodd');

      const grad = ctx.createLinearGradient(bMinX, bMinY, bMaxX + 14, bMaxY + 14);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.55, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;

      const SHADOW_STEPS = 16;
      for (let step = 0; step < SHADOW_STEPS; step++) {
        const u = step / (SHADOW_STEPS - 1);
        const shiftX = (1.1 + u * 9.6) * shadowScale;
        const shiftY = (1.3 + u * 10.2) * shadowScale;
        const leadInset = (1.6 + u * 2.2) * shadowScale;
        const feather = u * 2.4 * shadowScale;

        const s0 = {
          x: q0.x + shiftX + ux * leadInset + vx * leadInset,
          y: q0.y + shiftY + uy * leadInset + vy * leadInset,
        };
        const s1 = {
          x: q1.x + shiftX + ux * feather + vx * leadInset,
          y: q1.y + shiftY + uy * feather + vy * leadInset,
        };
        const s2 = {
          x: q2.x + shiftX + ux * feather + vx * feather,
          y: q2.y + shiftY + uy * feather + vy * feather,
        };
        const s3 = {
          x: q3.x + shiftX + ux * leadInset + vx * feather,
          y: q3.y + shiftY + uy * leadInset + vy * feather,
        };

        const layerAlpha = (0.056 * Math.pow(1 - u, 0.55) + 0.012) * baseAlpha;
        ctx.globalAlpha = layerAlpha;
        ctx.beginPath();
        traceRoundedQuad(s0, s1, s2, s3, rCorner + feather * 0.85 + 1.2);
        ctx.fill();
      }
      ctx.restore();

      ctx.beginPath();
      traceRoundedQuad(q0, q1, q2, q3, rCorner);
      if (s.fillStyle && s.fillStyle !== 'none') {
        const fillTrans = s.fillTransparency ?? 90;
        ctx.save();
        ctx.fillStyle = s.fillColor || s.color || '#2563eb';
        ctx.globalAlpha =
          (fillTrans === 0 ? 0.94 : Math.max(0.05, Math.min(0.95, (100 - fillTrans) / 100))) *
          baseAlpha;
        ctx.fill();
        ctx.restore();
      }

      ctx.stroke();
      ctx.restore();
      return;
    }
  }

  ctx.beginPath();
  if ((s.shapeType === 'ellipse' || s.shapeType === 'circle') && s.points.length === 4) {
    const pts = s.points;
    const kappa = 0.55228475;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < 4; i++) {
      const pA = pts[i];
      const pB = pts[(i + 1) % 4];
      const pPrev = pts[(i + 3) % 4];
      const pNext = pts[(i + 2) % 4];
      ctx.bezierCurveTo(
        pA.x + ((pB.x - pPrev.x) / 2) * kappa,
        pA.y + ((pB.y - pPrev.y) / 2) * kappa,
        pB.x - ((pNext.x - pA.x) / 2) * kappa,
        pB.y - ((pNext.y - pA.y) / 2) * kappa,
        pB.x,
        pB.y
      );
    }
    ctx.closePath();
  } else if (
    (s.shapeType === 'sine' || s.shapeType === 'cosine') &&
    s.points.length >= 2 &&
    s.points.length <= 3 &&
    s.points[0]?.outDx === undefined
  ) {
    const wavePts = ensureWaveBezierPoints(s);
    ctx.moveTo(wavePts[0].x, wavePts[0].y);
    for (let i = 1; i < wavePts.length; i++) {
      const prevPt = wavePts[i - 1];
      const pt = wavePts[i];
      const cubicCtrl = getCubicSegmentControlPoints(prevPt, pt);
      if (cubicCtrl) {
        ctx.bezierCurveTo(cubicCtrl.cp1x, cubicCtrl.cp1y, cubicCtrl.cp2x, cubicCtrl.cp2y, pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }
  } else if ((s.shapeType === 'parabola' || s.shapeType === 'arc') && s.points.length === 3) {
    const [p0, pMid, p2] = s.points;
    const ctrlX = 2 * pMid.x - (p0.x + p2.x) / 2;
    const ctrlY = 2 * pMid.y - (p0.y + p2.y) / 2;
    ctx.moveTo(p0.x, p0.y);
    ctx.quadraticCurveTo(ctrlX, ctrlY, p2.x, p2.y);
  } else if (s.shapeType === 'hyperbola' && s.points.length === 3) {
    const [p0, pMid, p2] = s.points;
    const wHyp = 1.85;
    const midX = (p0.x + p2.x) / 2;
    const midY = (p0.y + p2.y) / 2;
    const ctrlX = midX + ((1 + wHyp) / wHyp) * (pMid.x - midX);
    const ctrlY = midY + ((1 + wHyp) / wHyp) * (pMid.y - midY);
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const u = 1 - t;
      const b0 = u * u;
      const b1 = 2 * wHyp * u * t;
      const b2 = t * t;
      const denom = b0 + b1 + b2;
      const x = (b0 * p0.x + b1 * ctrlX + b2 * p2.x) / denom;
      const y = (b0 * p0.y + b1 * ctrlY + b2 * p2.y) / denom;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  } else {
    ctx.moveTo(s.points[0].x, s.points[0].y);
    if (s.points.length === 1) {
      ctx.lineTo(s.points[0].x + 0.08, s.points[0].y + 0.08);
    } else if (
      !s.groupId?.startsWith('math-graph-grp-') &&
      (s.shapeType === 'wave-guide-top' ||
        s.shapeType === 'wave-guide-bottom' ||
        s.shapeType === 'wave-axis-x' ||
        s.shapeType === 'wave-axis-y')
    ) {
      const endPt = s.points[s.points.length - 1];
      ctx.lineTo(endPt.x, endPt.y);
    } else {
      for (let i = 1; i < s.points.length; i++) {
        const prevPt = s.points[i - 1];
        const pt = s.points[i];
        const cubicCtrl = getCubicSegmentControlPoints(prevPt, pt);
        if (cubicCtrl) {
          ctx.bezierCurveTo(cubicCtrl.cp1x, cubicCtrl.cp1y, cubicCtrl.cp2x, cubicCtrl.cp2y, pt.x, pt.y);
        } else if (pt.cx !== undefined && pt.cy !== undefined) {
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

  const isFanRingBackplate = s.shapeType === 'fan' && s.points.length > 2;
  const isClosedSplineOrFreehand = s.points[0]?.twist === 999 || isFreehandLoopClosed(s.points, true);
  const canFillShape =
    isFanRingBackplate ||
    ((s.shapeType !== 'line' || isClosedSplineOrFreehand) &&
      s.shapeType !== 'arrow' &&
      s.shapeType !== 'double-arrow' &&
      s.shapeType !== 'resistor' &&
      s.shapeType !== 'spring' &&
      s.shapeType !== 'sine' &&
      s.shapeType !== 'cosine' &&
      s.fillStyle &&
      s.fillStyle !== 'none' &&
      s.points.length > 2 &&
      (s.isShape || isClosedSplineOrFreehand));

  if (canFillShape) {
    if (isFanRingBackplate) {
      ctx.save();
      ctx.fillStyle = '#cbd5e1';
      ctx.globalAlpha = 0.78;
      ctx.fill();
      ctx.restore();
    } else if (s.shapeType === 'bulb' && s.id.includes('-bulb-term-side')) {
      // Side screw terminal pad stays unfilled so only the bottom cap is solid black
    } else if (
      s.shapeType === 'bulb' &&
      (s.id.includes('-bulb-term-bot') || (s.fillStyle === 'solid' && s.points.length >= 6))
    ) {
      ctx.save();
      ctx.fillStyle = s.fillColor || s.color || '#111827';
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.restore();
    } else {
      const isStencilCustomFill =
        s.shapeType === 'fan-blade' ||
        s.shapeType === 'fan-hub' ||
        s.shapeType === 'ammeter-needle' ||
        s.shapeType === 'voltmeter-needle' ||
        s.shapeType === 'incline-wedge' ||
        s.shapeType === 'incline-block' ||
        s.shapeType === 'switch' ||
        s.shapeType === 'switch-knob';
      const shadeColor = isStencilCustomFill
        ? s.fillColor || s.color || '#2563eb'
        : s.color || s.fillColor || '#2563eb';
      const fillTrans =
        s.shapeType === 'fan-blade' ||
        s.shapeType === 'fan-hub' ||
        s.shapeType === 'ammeter-needle' ||
        s.shapeType === 'voltmeter-needle'
          ? 0
          : s.fillTransparency ?? 90;
      ctx.save();
      ctx.fillStyle = shadeColor;
      ctx.globalAlpha =
        fillTrans === 0
          ? 0.94
          : isStencilCustomFill && s.fillTransparency === undefined
          ? 0.85
          : Math.max(0.05, Math.min(0.95, (100 - fillTrans) / 100));
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.stroke();

  if ((s.arrowStart || s.shapeType === 'double-arrow') && s.points.length >= 2) {
    const first = s.points[0];
    const second = s.points[Math.min(s.points.length - 1, 1)];
    const cubicStart = getCubicSegmentControlPoints(first, second);
    const refStart =
      cubicStart && Math.hypot(first.x - cubicStart.cp1x, first.y - cubicStart.cp1y) > 2
        ? { x: cubicStart.cp1x, y: cubicStart.cp1y }
        : second;
    const angle = Math.atan2(first.y - refStart.y, first.x - refStart.x);
    const headLen = Math.max(12, s.width * 4);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    ctx.lineTo(
      first.x - headLen * Math.cos(angle - Math.PI / 6),
      first.y - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(first.x, first.y);
    ctx.lineTo(
      first.x - headLen * Math.cos(angle + Math.PI / 6),
      first.y - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }

  if ((s.arrowEnd || s.shapeType === 'arrow' || s.shapeType === 'double-arrow') && s.points.length >= 2) {
    const last = s.points[s.points.length - 1];
    const prev = s.points[Math.max(0, s.points.length - 2)];
    const cubicEnd = getCubicSegmentControlPoints(prev, last);
    const refEnd =
      cubicEnd && Math.hypot(last.x - cubicEnd.cp2x, last.y - cubicEnd.cp2y) > 2
        ? { x: cubicEnd.cp2x, y: cubicEnd.cp2y }
        : prev;
    const angle = Math.atan2(last.y - refEnd.y, last.x - refEnd.x);
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
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

function isCircuitEligibleStrokeForPdf(s: StrokeObject): boolean {
  if (!s.isShape) return false;
  if (s.shapeType === 'line') {
    if (s.arrowStart || s.arrowEnd) return false;
    if (s.points[0]?.twist === 999) return false;
    if (s.fillStyle && s.fillStyle !== 'none') return false;
    return s.points.length >= 2;
  }
  return (
    s.shapeType === 'battery' ||
    s.shapeType === 'voltage-source' ||
    s.shapeType === 'bulb' ||
    s.shapeType === 'bulb-symbol' ||
    s.shapeType === 'resistor' ||
    s.shapeType === 'switch' ||
    s.shapeType === 'switch-blade' ||
    s.shapeType === 'switch-knob' ||
    s.shapeType === 'fan' ||
    s.shapeType === 'fan-blade' ||
    s.shapeType === 'fan-hub' ||
    s.shapeType === 'ammeter' ||
    s.shapeType === 'ammeter-needle' ||
    s.shapeType === 'ammeter-label' ||
    s.shapeType === 'voltmeter' ||
    s.shapeType === 'voltmeter-needle' ||
    s.shapeType === 'voltmeter-label'
  );
}

function isPointNearSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
  tol: number
): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y) <= tol;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY) <= tol;
}

function areStrokesWithinCircuitTolForPdf(a: StrokeObject, b: StrokeObject, tol = 40): boolean {
  for (const pt of a.points) {
    if (b.points.length === 1) {
      if (Math.hypot(pt.x - b.points[0].x, pt.y - b.points[0].y) <= tol) return true;
    } else {
      for (let i = 0; i < b.points.length - 1; i++) {
        if (isPointNearSegment(pt, b.points[i], b.points[i + 1], tol)) return true;
      }
    }
  }
  for (const pt of b.points) {
    if (a.points.length === 1) {
      if (Math.hypot(pt.x - a.points[0].x, pt.y - a.points[0].y) <= tol) return true;
    } else {
      for (let i = 0; i < a.points.length - 1; i++) {
        if (isPointNearSegment(pt, a.points[i], a.points[i + 1], tol)) return true;
      }
    }
  }
  return false;
}

function getExpandedCircuitClustersForPdf(page: NotePage, visibleLayerIds: Set<string>): StrokeObject[][] {
  const allVisible = (page.strokes || []).filter(
    (s) => visibleLayerIds.size === 0 || !s.layerId || visibleLayerIds.has(s.layerId)
  );
  const clusters: StrokeObject[][] = [];
  const usedIds = new Set<string>();

  for (const sim of page.circuitSims || []) {
    const baseSet = new Set(sim.strokeIds || []);
    const groupIds = new Set(
      allVisible
        .filter((s) => baseSet.has(s.id) && isCircuitEligibleStrokeForPdf(s) && s.groupId)
        .map((s) => s.groupId!)
    );
    const out = new Set<string>();
    for (const s of allVisible) {
      if (
        isCircuitEligibleStrokeForPdf(s) &&
        (baseSet.has(s.id) || (s.groupId && groupIds.has(s.groupId)))
      ) {
        out.add(s.id);
      }
    }
    const otherSimIds = new Set<string>();
    for (const other of page.circuitSims || []) {
      if (other.id === sim.id) continue;
      for (const id of other.strokeIds || []) otherSimIds.add(id);
    }
    const eligible = allVisible.filter(
      (s) => !otherSimIds.has(s.id) && (out.has(s.id) || isCircuitEligibleStrokeForPdf(s))
    );
    let changed = true;
    while (changed) {
      changed = false;
      const currentMembers = eligible.filter((s) => out.has(s.id));
      for (const cand of eligible) {
        if (out.has(cand.id)) continue;
        if (currentMembers.some((m) => areStrokesWithinCircuitTolForPdf(cand, m, 40))) {
          out.add(cand.id);
          changed = true;
          if (cand.groupId) {
            for (const g of allVisible) {
              if (g.groupId === cand.groupId && !out.has(g.id)) {
                out.add(g.id);
              }
            }
          }
        }
      }
    }
    const clusterStrokes = allVisible.filter((s) => out.has(s.id));
    if (clusterStrokes.length >= 2) {
      for (const s of clusterStrokes) usedIds.add(s.id);
      clusters.push(clusterStrokes);
    }
  }

  // Also include any unregistered circuit cluster on the page that contains a battery/voltage-source and a load
  const remaining = allVisible.filter(
    (s) => !usedIds.has(s.id) && isCircuitEligibleStrokeForPdf(s)
  );
  const visited = new Set<string>();
  for (const seed of remaining) {
    if (visited.has(seed.id)) continue;
    const compIds = new Set<string>([seed.id]);
    if (seed.groupId) {
      for (const g of remaining) {
        if (g.groupId === seed.groupId) compIds.add(g.id);
      }
    }
    let changed = true;
    while (changed) {
      changed = false;
      const curMembers = remaining.filter((s) => compIds.has(s.id));
      for (const cand of remaining) {
        if (compIds.has(cand.id)) continue;
        if (curMembers.some((m) => areStrokesWithinCircuitTolForPdf(cand, m, 40))) {
          compIds.add(cand.id);
          changed = true;
          if (cand.groupId) {
            for (const g of remaining) {
              if (g.groupId === cand.groupId) compIds.add(g.id);
            }
          }
        }
      }
    }
    for (const id of compIds) visited.add(id);
    const clusterStrokes = remaining.filter((s) => compIds.has(s.id));
    const hasSource = clusterStrokes.some(
      (s) => s.shapeType === 'battery' || s.shapeType === 'voltage-source'
    );
    const hasLoadOrWire = clusterStrokes.some(
      (s) =>
        s.shapeType === 'bulb' ||
        s.shapeType === 'bulb-symbol' ||
        s.shapeType === 'resistor' ||
        s.shapeType === 'fan' ||
        s.shapeType === 'ammeter' ||
        s.shapeType === 'voltmeter' ||
        s.shapeType === 'line'
    );
    if (hasSource && hasLoadOrWire) {
      clusters.push(clusterStrokes);
    }
  }

  return clusters;
}

/**
 * Renders a static snapshot of all active simulations on a page (atoms, 3D molecules, circuits,
 * force vectors/pendulums/inclines, and spring graphs) when exporting to PDF.
 */
function drawPageSimulationsSnapshotForPdf(
  ctx: CanvasRenderingContext2D,
  page: NotePage,
  options?: PdfExportOptions,
  skipCircuits = false
) {
  const visibleLayerIds = new Set(
    (page.layers || []).filter((l) => l.visible).map((l) => l.id)
  );

  // 0. Circuit Simulations (Glowing Bulbs, Fans, Interactive Switch with Green/Red Dot, and Clean Charge Spheres when Switch is Closed!)
  if (!skipCircuits) {
    const circuitClusters = getExpandedCircuitClustersForPdf(page, visibleLayerIds);
    const isThisActivePage = options?.activePageId === page.id;
    const switchClosed =
      isThisActivePage && options?.circuitSwitchClosed !== undefined
        ? options.circuitSwitchClosed
        : true;
    const showElectrons =
      options?.circuitShowElectrons !== undefined ? options.circuitShowElectrons : true;
    const flowDir = options?.circuitFlowDirection || 'electrons';
    const showDarkTrack = Boolean(options?.circuitShowDarkWireTrack);

    for (const clusterStrokes of circuitClusters) {
      const simData = analyzeCircuitForSimulation(clusterStrokes, switchClosed);
      if (simData.components.length === 0) continue;

      // 0A. Optional dark conductive tube track behind particles
      if (showDarkTrack && simData.wireSegments.length > 0) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 11.5;
        for (const seg of simData.wireSegments) {
          if (!seg.inClosedLoop) continue;
          ctx.beginPath();
          if (seg.pathPoints && seg.pathPoints.length >= 2) {
            ctx.moveTo(seg.pathPoints[0].x, seg.pathPoints[0].y);
            for (let pIdx = 1; pIdx < seg.pathPoints.length; pIdx++) {
              ctx.lineTo(seg.pathPoints[pIdx].x, seg.pathPoints[pIdx].y);
            }
          } else {
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 0B. Bulb Glow, Radiating Light Rays & Heated Filament (when active / switch closed!)
      for (const cs of simData.components) {
        if (cs.comp.kind !== 'bulb' || !cs.active || cs.powerFactor <= 0.01) continue;
        const b = cs.comp;
        const domeCx = b.cx;
        const domeRx = Math.max(14, Math.min(b.w * 0.27, b.h * 0.34));
        const domeRy = Math.max(14, b.h * 0.33);
        const domeCy = b.minY + domeRy + b.h * 0.02;
        const domeR = Math.max(16, (domeRx + domeRy) / 2);
        const pwr = Math.min(1.6, Math.max(0.45, cs.powerFactor));
        const glowRadius = domeR * (2.05 + pwr * 1.25);

        ctx.save();
        const grad = ctx.createRadialGradient(
          domeCx,
          domeCy,
          domeR * 0.12,
          domeCx,
          domeCy,
          glowRadius
        );
        grad.addColorStop(0, `rgba(254, 240, 138, ${Math.min(0.92, 0.72 * pwr)})`);
        grad.addColorStop(0.45, `rgba(250, 204, 21, ${Math.min(0.65, 0.44 * pwr)})`);
        grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(domeCx, domeCy, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        const numRays = 12;
        const startAng = -Math.PI * 1.18;
        const endAng = Math.PI * 0.18;
        ctx.lineCap = 'round';
        for (let i = 0; i < numRays; i++) {
          const ang = startAng + ((endAng - startAng) * i) / (numRays - 1);
          const rInner = domeR * 1.14;
          const rOuter = domeR * (1.52 + 0.56 * pwr);
          ctx.strokeStyle = `rgba(245, 158, 11, ${Math.min(0.95, 0.78 * pwr)})`;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(domeCx + Math.cos(ang) * rInner, domeCy + Math.sin(ang) * rInner);
          ctx.lineTo(domeCx + Math.cos(ang) * rOuter, domeCy + Math.sin(ang) * rOuter);
          ctx.stroke();
        }

        const filY = domeCy - domeRy * 0.02;
        const coilHalfW = Math.max(7, domeRx * 0.34);
        const coilHalfH = Math.max(4, domeRy * 0.15);
        const filLeftX = domeCx - coilHalfW;
        const filRightX = domeCx + coilHalfW;
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3.2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        const numCoilSteps = 6;
        for (let i = 0; i <= numCoilSteps; i++) {
          const t = i / numCoilSteps;
          const px = filLeftX + (filRightX - filLeftX) * t;
          const py =
            i === 0 || i === numCoilSteps
              ? filY
              : i % 2 === 1
                ? filY - coilHalfH
                : filY + coilHalfH * 0.55;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 0C. Fan / Propeller Blades
      for (const cs of simData.components) {
        if (cs.comp.kind !== 'fan') continue;
        const f = cs.comp;
        const rOuter = Math.max(20, Math.min(f.w * 0.36, f.h * 0.45));
        const rHub = Math.max(5.5, rOuter * 0.22);
        const fanStrokes = clusterStrokes.filter((s) => f.strokeIds.includes(s.id));
        const ringStroke = fanStrokes.find((s) => s.shapeType === 'fan' && s.points.length > 2);
        const bladeStroke = fanStrokes.find((s) => s.shapeType === 'fan-blade');
        const ringPerimeterColor = ringStroke?.color || '#1e293b';
        const bladeFillColor =
          bladeStroke?.fillStyle === 'none'
            ? 'transparent'
            : bladeStroke?.fillColor || bladeStroke?.color || '#0284c7';
        const bladeBorderColor = bladeStroke?.color || '#0369a1';

        ctx.save();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        if (f.cx - rOuter > f.minX + 2) {
          ctx.beginPath();
          ctx.moveTo(f.minX, f.cy);
          ctx.lineTo(f.cx - rOuter, f.cy);
          ctx.stroke();
        }
        if (f.maxX > f.cx + rOuter + 2) {
          ctx.beginPath();
          ctx.moveTo(f.cx + rOuter, f.cy);
          ctx.lineTo(f.maxX, f.cy);
          ctx.stroke();
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = ringPerimeterColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(f.cx, f.cy, rOuter, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        for (let b = 0; b < 3; b++) {
          const baseAng = (b * Math.PI * 2) / 3 - Math.PI / 2;
          const bladeLen = rOuter * 0.85;
          const spread = 0.36;
          ctx.beginPath();
          ctx.moveTo(
            f.cx + Math.cos(baseAng - 0.18) * rHub * 0.85,
            f.cy + Math.sin(baseAng - 0.18) * rHub * 0.85
          );
          const arcSteps = 10;
          for (let k = 0; k <= arcSteps; k++) {
            const t = k / arcSteps;
            const ang = baseAng - spread + t * (spread * 2);
            const rCurve = bladeLen * (0.86 + 0.14 * Math.sin(t * Math.PI));
            ctx.lineTo(f.cx + Math.cos(ang) * rCurve, f.cy + Math.sin(ang) * rCurve);
          }
          ctx.lineTo(
            f.cx + Math.cos(baseAng + 0.18) * rHub * 0.85,
            f.cy + Math.sin(baseAng + 0.18) * rHub * 0.85
          );
          ctx.closePath();
          if (bladeFillColor !== 'transparent') {
            ctx.fillStyle = bladeFillColor;
            ctx.fill();
          }
          ctx.strokeStyle = bladeBorderColor;
          ctx.lineWidth = 1.9;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(f.cx, f.cy, rHub, 0, Math.PI * 2);
        ctx.fillStyle = bladeFillColor !== 'transparent' ? bladeFillColor : bladeBorderColor;
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
      }

      // 0D. Charge Carriers / Electrons along Active Wire Segments (ONLY when switch is CLOSED & current flows!)
      if (
        showElectrons &&
        simData.isCircuitClosed &&
        (!simData.autoSwitch || simData.autoSwitch.closed) &&
        simData.wireSegments.length > 0
      ) {
        const spacing = 32;
        for (const seg of simData.wireSegments) {
          if (!seg.inClosedLoop || !seg.active || seg.currentSpeed <= 0.001) continue;
          const polyPts =
            seg.pathPoints && seg.pathPoints.length >= 2
              ? seg.pathPoints
              : [
                  { x: seg.x1, y: seg.y1 },
                  { x: seg.x2, y: seg.y2 },
                ];
          const cumDist: number[] = [0];
          for (let i = 0; i < polyPts.length - 1; i++) {
            const sdx = polyPts[i + 1].x - polyPts[i].x;
            const sdy = polyPts[i + 1].y - polyPts[i].y;
            cumDist.push(cumDist[i] + Math.hypot(sdx, sdy));
          }
          const totalPolyLen = Math.max(1, cumDist[cumDist.length - 1]);
          const isResistorZigZag = Boolean(seg.pathPoints && seg.pathPoints.length >= 8);
          const horizSpan = Math.max(24, Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1));
          const count = isResistorZigZag
            ? Math.max(2, Math.min(4, Math.round(horizSpan / 26)))
            : Math.max(1, Math.round(totalPolyLen / spacing));
          const stepDist = totalPolyLen / count;
          const rawOffset = stepDist * 0.35;

          ctx.save();
          for (let k = 0; k < count; k++) {
            const d = rawOffset + k * stepDist;
            if (d < 2 || d > totalPolyLen - 2) continue;
            let subIdx = 0;
            while (subIdx < cumDist.length - 2 && cumDist[subIdx + 1] < d) {
              subIdx++;
            }
            const segLenSub = Math.max(1e-4, cumDist[subIdx + 1] - cumDist[subIdx]);
            const tSub = Math.max(0, Math.min(1, (d - cumDist[subIdx]) / segLenSub));
            const px =
              polyPts[subIdx].x + tSub * (polyPts[subIdx + 1].x - polyPts[subIdx].x);
            const py =
              polyPts[subIdx].y + tSub * (polyPts[subIdx + 1].y - polyPts[subIdx].y);

            ctx.beginPath();
            ctx.arc(px, py, 4.8, 0, Math.PI * 2);
            if (flowDir === 'electrons') {
              ctx.fillStyle = '#84cc16';
              ctx.shadowColor = '#4ade80';
              ctx.shadowBlur = 7;
            } else {
              ctx.fillStyle = '#38bdf8';
              ctx.shadowColor = '#0ea5e9';
              ctx.shadowBlur = 7;
            }
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // 0E. Automatic Switch on the Left Vertical Conductor (with Green 🟢 or Red 🔴 indicator dot)
      if (simData.autoSwitch) {
        const sw = simData.autoSwitch;
        ctx.save();
        const paperBg = getEffectivePaperColor(page);
        ctx.strokeStyle = paperBg;
        ctx.lineWidth = showDarkTrack ? 16 : 10;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.moveTo(sw.x, sw.yTop + 2);
        ctx.lineTo(sw.x, sw.yBottom - 2);
        ctx.stroke();

        for (const ty of [sw.yTop, sw.yBottom]) {
          ctx.beginPath();
          ctx.arc(sw.x, ty, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = '#334155';
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        if (!sw.closed) {
          const bladeTipX = sw.x + 25;
          const bladeTipY = sw.yTop + 4;
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sw.x, sw.yBottom);
          ctx.lineTo(bladeTipX, bladeTipY);
          ctx.stroke();

          const knobX = sw.x + (bladeTipX - sw.x) * 0.78;
          const knobY = sw.yBottom + (bladeTipY - sw.yBottom) * 0.78;
          ctx.beginPath();
          ctx.arc(knobX, knobY, 6.4, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.strokeStyle = '#fecaca';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sw.x, sw.yBottom);
          ctx.lineTo(sw.x, sw.yTop);
          ctx.stroke();

          const knobX = sw.x + 14.5;
          const knobY = sw.yCenter;
          ctx.beginPath();
          ctx.arc(knobX, knobY, 6.4, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
          ctx.strokeStyle = '#bbf7d0';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }
  // 1. Atom & Chemistry Simulations (Bohr Orbits, Paired Electrons, Bonds, Reaction Header & 3D Molecule)
  const atomPalette = ['#2563eb', '#dc2626', '#7c3aed', '#0d9488', '#d97706', '#db2777'];
  for (const aSim of page.atomSims || []) {
    if (!aSim.atoms || aSim.atoms.length === 0) continue;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    const normAtoms = normalizeCovalentAtomPositions(aSim.atoms, aSim.bonds);
    for (const at of normAtoms) {
      const rOut = at.outerRadiusPx || getNaturalOuterOrbitRadiusPx(at.z);
      if (at.x - rOut < minX) minX = at.x - rOut;
      if (at.x + rOut > maxX) maxX = at.x + rOut;
      if (at.y - rOut < minY) minY = at.y - rOut;
      if (at.y + rOut > maxY) maxY = at.y + rOut;
    }
    const rScale = Math.max(0.55, Math.min(3.0, aSim.reactionScale || 1));
    const simCenterX =
      aSim.reactionBarX !== undefined
        ? aSim.reactionBarX
        : Number.isFinite(minX)
        ? (minX + maxX) / 2
        : 360;
    const topBarY =
      aSim.reactionBarY !== undefined
        ? aSim.reactionBarY
        : Math.max(28, (Number.isFinite(minY) ? minY : 180) - 54);

    if (aSim.showReactionEquation) {
      const inferred = inferReactionFromCanvasAtoms(aSim.atoms.map((a) => a.z));
      const rawForCheck =
        aSim.userRawReactionText || aSim.reactionEquationText || inferred.equationDisplay;
      const chemVal = validateAndCorrectChemicalEquation(
        rawForCheck,
        aSim.reactionEquationText
      );
      ctx.save();
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const eqText = chemVal.correctedEquation || rawForCheck;
      const cardW = Math.max(210, ctx.measureText(eqText).width + 86);
      const scaledCardW = cardW * rScale;
      const scaledCardX = Math.max(8, simCenterX - scaledCardW / 2);
      ctx.translate(scaledCardX, topBarY);
      ctx.scale(rScale, rScale);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = chemVal.hasCorrections ? '#fca5a5' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(0, 0, cardW, 38, 12);
      ctx.fill();
      ctx.stroke();

      let curX = 18;
      const midY = 19;
      for (const seg of chemVal.segments) {
        const w = ctx.measureText(seg.text).width;
        if (seg.isCorrection && seg.text.trim()) {
          ctx.fillStyle = '#dc2626';
        } else {
          ctx.fillStyle = '#0f172a';
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(seg.text, curX, midY);
        curX += w + (seg.isCorrection ? 1 : 0);
      }
      ctx.restore();
    }

    if (aSim.showAtomsBelowReaction !== false) {
      const covalentSharedByAtom = new Map<string, number>();
      for (const b of aSim.bonds || []) {
        if (b.kind === 'covalent') {
          covalentSharedByAtom.set(
            b.fromAtomId,
            (covalentSharedByAtom.get(b.fromAtomId) || 0) + (b.count || 1)
          );
          covalentSharedByAtom.set(
            b.toAtomId,
            (covalentSharedByAtom.get(b.toAtomId) || 0) + (b.count || 1)
          );
        }
      }
      const colorByZ = new Map<number, string>();
      const colByAtomId = new Map<string, string>();
      normAtoms.forEach((atom, atomIdx) => {
        if (!colorByZ.has(atom.z)) {
          colorByZ.set(atom.z, atom.color || atomPalette[colorByZ.size % atomPalette.length]);
        }
        const el = getPeriodicElementByZ(atom.z);
        const col = atom.customColor
          ? atom.color || colorByZ.get(atom.z)!
          : colorByZ.get(atom.z)!;
        colByAtomId.set(atom.id, col);
        const rOuter = atom.outerRadiusPx || getNaturalOuterOrbitRadiusPx(atom.z);
        const rNuc = Math.max(13, Math.min(26, getNaturalNucleusRadiusPx(atom.z)));
        const nShells = Math.max(1, el.shells.length);

        const atomCovBondAngles: number[] = [];
        for (const cb of aSim.bonds || []) {
          if (cb.kind !== 'covalent') continue;
          const otherId =
            cb.fromAtomId === atom.id
              ? cb.toAtomId
              : cb.toAtomId === atom.id
              ? cb.fromAtomId
              : null;
          if (!otherId) continue;
          const otherAt = normAtoms.find((a) => a.id === otherId);
          if (otherAt) {
            atomCovBondAngles.push(Math.atan2(otherAt.y - atom.y, otherAt.x - atom.x));
          }
        }

        for (let s = 0; s < nShells; s++) {
          const isOuter = s === nShells - 1;
          const r_s =
            nShells === 1
              ? rOuter
              : rNuc + 14 + ((rOuter - (rNuc + 14)) * (s + 1)) / nShells;
          ctx.save();
          ctx.strokeStyle = col;
          ctx.globalAlpha = isOuter ? 0.85 : 0.35;
          ctx.lineWidth = isOuter ? 1.8 : 1.1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(atom.x, atom.y, r_s, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          const covUsed = isOuter ? covalentSharedByAtom.get(atom.id) || 0 : 0;
          const initShellE = Math.max(0, el.shells[s] + (isOuter ? atom.extraElectrons || 0 : 0));
          const eCount = Math.max(0, initShellE - covUsed);
          if (eCount <= 0) continue;
          const naturalPairs =
            s === 0 || !isOuter
              ? Math.floor(initShellE / 2)
              : initShellE <= 4
              ? 0
              : Math.min(Math.floor(initShellE / 2), initShellE - 4);
          const numPairs = Math.min(Math.floor(eCount / 2), naturalPairs);
          const numUnpaired = Math.max(0, eCount - numPairs * 2);
          const totalSlots = Math.max(1, numPairs + numUnpaired);
          const pairHalfAng = Math.min(0.16, 6.5 / r_s);
          const eAngles: number[] = [];
          for (let g = 0; g < totalSlots; g++) {
            const slotAng = atomIdx * 0.55 - Math.PI / 2 + (g * Math.PI * 2) / totalSlots;
            if (g < numPairs) {
              eAngles.push(slotAng - pairHalfAng);
              eAngles.push(slotAng + pairHalfAng);
            } else {
              eAngles.push(slotAng);
            }
          }
          for (const ang of eAngles) {
            let rEff = r_s;
            if (isOuter && atomCovBondAngles.length > 0) {
              let maxBondOverlap = 0;
              for (const bAng of atomCovBondAngles) {
                const cosDiff = Math.cos(ang - bAng);
                if (cosDiff > 0) {
                  maxBondOverlap = Math.max(maxBondOverlap, Math.pow(cosDiff, 8));
                }
              }
              if (maxBondOverlap > 0.001) {
                rEff = Math.max(rNuc + 10, r_s - 5.2 * maxBondOverlap);
              }
            }
            const ex = atom.x + rEff * Math.cos(ang);
            const ey = atom.y + rEff * Math.sin(ang);
            ctx.save();
            ctx.fillStyle = col;
            ctx.globalAlpha = isOuter ? 0.96 : 0.5;
            ctx.beginPath();
            ctx.arc(ex, ey, isOuter ? 4.2 : 3.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Nucleus
        ctx.save();
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, rNuc, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = col;
        ctx.globalAlpha = 1;
        ctx.stroke();

        // Symbol badge below nucleus
        const isSingleAtom = normAtoms.length === 1;
        const labelTxt = isSingleAtom ? `${el.symbol} , ${el.nameEl}` : el.symbol;
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const bw = Math.max(32, ctx.measureText(labelTxt).width + 20);
        const bx = atom.x - bw / 2;
        const by = atom.y + rNuc + 4;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, 22, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelTxt, atom.x + 3, by + 11);
        ctx.restore();
      });

      // Σχεδίαση ομοιοπολικών δεσμών (σιέλ έλλειψη & κοινά ζεύγη ηλεκτρονίων) στο PDF
      for (const bond of aSim.bonds || []) {
        if (bond.kind !== 'covalent') continue;
        const fromAt = normAtoms.find((a) => a.id === bond.fromAtomId);
        const toAt = normAtoms.find((a) => a.id === bond.toAtomId);
        if (!fromAt || !toAt) continue;
        const natFrom = getNaturalOuterOrbitRadiusPx(fromAt.z);
        const natTo = getNaturalOuterOrbitRadiusPx(toAt.z);
        const rFrom = fromAt.outerRadiusPx || natFrom;
        const rTo = toAt.outerRadiusPx || natTo;
        const dx = toAt.x - fromAt.x;
        const dy = toAt.y - fromAt.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / dist;
        const uy = dy / dist;
        const nx = -uy;
        const ny = ux;
        const midOverlapX = (fromAt.x + ux * rFrom + (toAt.x - ux * rTo)) / 2;
        const midOverlapY = (fromAt.y + uy * rFrom + (toAt.y - uy * rTo)) / 2;
        const avgBondScale = Math.max(
          0.55,
          Math.min(2.2, (rFrom / natFrom + rTo / natTo) / 2)
        );
        const halfShellGap = Math.max(8 * avgBondScale, (dist - (rFrom + rTo)) / 2);

        ctx.save();
        ctx.translate(midOverlapX, midOverlapY);
        ctx.rotate(Math.atan2(dy, dx));
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.65)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        const capRadialRx = Math.min(15 * avgBondScale, halfShellGap + 1.5 * avgBondScale);
        const capPerpRy = (9.5 + (bond.count - 1) * 6.2) * avgBondScale;
        ctx.beginPath();
        ctx.ellipse(0, 0, capRadialRx, capPerpRy, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        const colFrom = colByAtomId.get(fromAt.id) || '#2563eb';
        const colTo = colByAtomId.get(toAt.id) || '#ef4444';
        const pairSpacingPerp = 12.4 * avgBondScale;
        const radialPairSep = 3.8 * avgBondScale;
        for (let pIdx = 0; pIdx < bond.count; pIdx++) {
          const pairOffsetPerp = (pIdx - (bond.count - 1) / 2) * pairSpacingPerp;
          const pairCenterX = midOverlapX + nx * pairOffsetPerp;
          const pairCenterY = midOverlapY + ny * pairOffsetPerp;
          const e1x = pairCenterX - ux * radialPairSep;
          const e1y = pairCenterY - uy * radialPairSep;
          const e2x = pairCenterX + ux * radialPairSep;
          const e2y = pairCenterY + uy * radialPairSep;

          ctx.save();
          ctx.fillStyle = colFrom;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(e1x, e1y, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = colTo;
          ctx.beginPath();
          ctx.arc(e2x, e2y, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    if (aSim.show3DMolecule) {
      const inferred = inferReactionFromCanvasAtoms(aSim.atoms.map((a) => a.z));
      const mol3D = get3DMoleculeModel(
        aSim.activeReactionTerm || aSim.reactionEquationText || inferred.equationDisplay,
        aSim.atoms.map((a) => a.z),
        aSim.selected3DMolId || aSim.activeReactionTerm
      );
      const boxW = 440;
      const boxH = 224;
      const defaultBoxX = Math.max(18, simCenterX - boxW / 2);
      const defaultBoxY =
        aSim.showReactionEquation === false && aSim.showAtomsBelowReaction === false
          ? Math.max(36, (aSim.atoms[0]?.y ?? 220) - boxH / 2)
          : aSim.showAtomsBelowReaction === false
          ? topBarY + 50
          : Math.max(topBarY + 60, (Number.isFinite(maxY) ? maxY : 320) + 38);
      const boxX = aSim.mol3DBoxX ?? defaultBoxX;
      const boxY = aSim.mol3DBoxY ?? defaultBoxY;
      const cx3d = boxX + boxW * 0.45;
      const cy3d = boxY + 118;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 16);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(`🧊 ${mol3D.nameEl}`, boxX + 14, boxY + 20);

      const yaw = aSim.rot3DYaw ?? 0.42;
      const pitch = aSim.rot3DPitch ?? 0.24;
      const cosY = Math.cos(yaw),
        sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch),
        sinP = Math.sin(pitch);
      const scale3D = 64;
      const proj = (x: number, y: number, z3d: number) => {
        const x1 = x * cosY + z3d * sinY;
        const z1 = -x * sinY + z3d * cosY;
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP;
        const persp = 1 / (1 - z2 * 0.14);
        return { px: cx3d + x1 * scale3D * persp, py: cy3d + y2 * scale3D * persp, z2, persp };
      };
      const projAtoms = mol3D.atoms.map((at, idx) => {
        const p = proj(at.x, at.y, at.z3d);
        return { ...at, idx, px: p.px, py: p.py, depth: p.z2, rPx: 22 * at.radiusFactor * p.persp };
      });
      for (const b of mol3D.bonds) {
        const a1 = projAtoms[b.fromIdx];
        const a2 = projAtoms[b.toIdx];
        if (!a1 || !a2) continue;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(a1.px, a1.py);
        ctx.lineTo(a2.px, a2.py);
        ctx.stroke();
      }
      for (const at of [...projAtoms].sort((a, b) => a.depth - b.depth)) {
        ctx.fillStyle = at.color;
        ctx.beginPath();
        ctx.arc(at.px, at.py, at.rPx, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(at.symbol, at.px, at.py);
      }
      ctx.restore();
    }
  }

  // 2. Spring Simulations — Hooke's Law Table of Values & Elastic Deformation Diagram F_ελ(N) – Δl(cm)
  const springSims = page.springSims || [];
  const hookeSim = springSims.find(
    (sm) => Boolean(sm.showHookeCanvasTable) || Boolean(sm.graphs?.hooke?.visible)
  );
  if (hookeSim) {
    const oneMmPx = 4.6;
    const w = getPageLogicalWidth(page);
    const isDarkGrid = isDarkPaperColor(getEffectivePaperColor(page));
    const axisInk = isDarkGrid ? '#f8fafc' : '#0f172a';

    const getSpringLengthPx = (sp: StrokeObject): number => {
      if (sp.points.length >= 4) {
        const sTerm = {
          x: (sp.points[0].x + sp.points[3].x) / 2,
          y: (sp.points[0].y + sp.points[3].y) / 2,
        };
        const eTerm = {
          x: (sp.points[1].x + sp.points[2].x) / 2,
          y: (sp.points[1].y + sp.points[2].y) / 2,
        };
        return Math.max(8, Math.hypot(eTerm.x - sTerm.x, eTerm.y - sTerm.y));
      }
      if (sp.points.length >= 2) {
        const p0 = sp.points[0];
        const p1 = sp.points[sp.points.length - 1];
        return Math.max(8, Math.hypot(p1.x - p0.x, p1.y - p0.y));
      }
      return 92;
    };

    const getWeightChainCount = (rootWeightId: string): number => {
      const visited = new Set<string>();
      const queue = [rootWeightId];
      while (queue.length > 0) {
        const currId = queue.shift()!;
        if (visited.has(currId)) continue;
        const st = (page.strokes || []).find((s) => s.id === currId);
        if (!st) continue;
        visited.add(currId);
        for (const s of page.strokes || []) {
          if (s.attachedToWeightId === currId && !visited.has(s.id)) {
            queue.push(s.id);
          }
        }
      }
      return visited.size;
    };

    const plottedSet = new Set<number>(hookeSim.hookePlottedWeights || []);
    for (const sm of springSims) {
      for (const pw of sm.hookePlottedWeights || []) {
        plottedSet.add(pw);
      }
    }

    const byWeight = new Map<number, HookeMeasurementRow>();
    const allSprings = (page.strokes || []).filter((s) => s.shapeType === 'spring');
    for (const sp of allSprings) {
      const ptr = (page.strokes || []).find(
        (s) => s.attachedToSpringId === sp.id && s.points.length >= 2
      );
      if (!ptr) continue;
      const spLen = getSpringLengthPx(sp);
      const sm = springSims.find((m) => m.eqSpringStrokeId === sp.id);
      const ptrColor = ptr.color || '#dc2626';
      if (sm) {
        const chainCount = getWeightChainCount(sm.massStrokeId);
        const forceN = chainCount * 1.0;
        const smL0Mm = Math.round(sm.naturalLengthPx / oneMmPx);
        const smDeltaLMm = Math.round(Math.abs(spLen - sm.naturalLengthPx) / oneMmPx);
        byWeight.set(chainCount, {
          id: `hm-pdf-${sp.id}-${chainCount}`,
          weightsCount: chainCount,
          forceN,
          lengthMm: smL0Mm + smDeltaLMm,
          deltaLMm: smDeltaLMm,
          plotted: plottedSet.has(chainCount),
          springStrokeId: sp.id,
          pointerColor: ptrColor,
        });
      } else {
        const spLMm = Math.round(spLen / oneMmPx);
        byWeight.set(0, {
          id: `hm-pdf-${sp.id}-0`,
          weightsCount: 0,
          forceN: 0,
          lengthMm: spLMm,
          deltaLMm: 0,
          plotted: plottedSet.has(0),
          springStrokeId: sp.id,
          pointerColor: ptrColor,
        });
      }
    }

    const recordedRows = Array.from(byWeight.values()).sort(
      (a, b) => a.weightsCount - b.weightsCount || a.deltaLMm - b.deltaLMm
    );

    const eqSpring =
      (page.strokes || []).find((s) => s.id === hookeSim.eqSpringStrokeId) || allSprings[0];
    const eqSpBounds = eqSpring
      ? getStrokeBounds(eqSpring)
      : { minX: 200, maxX: 260, minY: 80, maxY: 260 };
    const hCfg = hookeSim.graphs?.hooke || { visible: false };
    const defaultHookeW = 248;
    const hW = Math.max(160, Math.min(520, hCfg.width || defaultHookeW));
    const uiScale = Math.max(0.66, Math.min(1.24, hW / defaultHookeW));
    const hPlotH = Math.max(70, Math.min(280, (hCfg.height || 62) * 2));
    const baseDefaultX = Math.max(20, eqSpBounds.maxX + 56);
    const defaultHookeX = Math.min(baseDefaultX, w - hW - 14);
    const defaultHookeY = Math.max(48, eqSpBounds.minY + 8);
    const rawHx = hCfg.customMoved && hCfg.x !== undefined ? hCfg.x : defaultHookeX;
    const hx = Math.max(8, Math.min(w - hW - 14, rawHx));
    const hy = hCfg.customMoved && hCfg.y !== undefined ? hCfg.y : defaultHookeY;

    let diagramTopY = hy;

    // 2A. Hooke's Law Canvas Table of Values
    if (hookeSim.showHookeCanvasTable) {
      const rowH = Math.max(16, Math.round(20 * uiScale));
      const headerH = Math.max(18, Math.round(22 * uiScale));
      const displayRowCount = Math.max(1, recordedRows.length);
      const tblW = hW;
      const tblH = headerH + displayRowCount * rowH + 5;
      const tblX = hx;
      const tblY = hy;
      diagramTopY = tblY + tblH + Math.round(20 * uiScale);

      ctx.save();
      ctx.fillStyle = isDarkGrid ? 'rgba(15, 23, 42, 0.93)' : 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = isDarkGrid ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(tblX, tblY, tblW, tblH, 8);
      ctx.fill();
      ctx.stroke();

      const hdrY = tblY + 1;
      ctx.fillStyle = isDarkGrid ? '#1e293b' : '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(tblX + 1, hdrY, tblW - 2, headerH, [7, 7, 0, 0]);
      ctx.fill();

      const colX = [
        tblX + tblW * 0.11,
        tblX + tblW * 0.30,
        tblX + tblW * 0.53,
        tblX + tblW * 0.76,
        tblX + tblW * 0.92,
      ];
      ctx.font = `bold ${Math.max(8, Math.round(10 * uiScale))}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = isDarkGrid ? '#e2e8f0' : '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Βάρη', colX[0], hdrY + headerH / 2);
      ctx.fillText('m (kg)', colX[1], hdrY + headerH / 2);
      ctx.fillText('W=Fελ(N)', colX[2], hdrY + headerH / 2);
      ctx.fillText('Δl (cm)', colX[3], hdrY + headerH / 2);

      ctx.beginPath();
      ctx.arc(colX[4], hdrY + headerH / 2, Math.max(3.5, 4.2 * uiScale), 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();

      const rowsStartY = hdrY + headerH;
      if (recordedRows.length === 0) {
        ctx.font = `italic ${Math.max(8, Math.round(9.2 * uiScale))}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = isDarkGrid ? '#94a3b8' : '#64748b';
        ctx.fillText(
          'Βάλε δείκτη (βελονάκι) σε ελατήριο δίπλα στον χάρακα',
          tblX + tblW / 2,
          rowsStartY + rowH / 2
        );
      } else {
        for (let rIdx = 0; rIdx < recordedRows.length; rIdx++) {
          const r = recordedRows[rIdx];
          const ry = rowsStartY + rIdx * rowH;
          ctx.strokeStyle = isDarkGrid ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.9)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tblX + 4, ry);
          ctx.lineTo(tblX + tblW - 4, ry);
          ctx.stroke();

          const rowFontPx = Math.max(8.5, Math.round(10.2 * uiScale));
          ctx.font = `600 ${rowFontPx}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = isDarkGrid ? '#f1f5f9' : '#334155';
          const massKgStr =
            r.forceN === 0 ? '0' : (r.forceN / 10).toFixed(1).replace('.', ',');
          const forceStr = Number(r.forceN.toFixed(1)).toString().replace('.', ',');
          const deltaLCmStr = Number((r.deltaLMm / 10).toFixed(1))
            .toString()
            .replace('.', ',');
          ctx.fillText(String(r.weightsCount), colX[0], ry + rowH / 2 + 1);
          ctx.fillText(massKgStr, colX[1], ry + rowH / 2 + 1);
          ctx.fillText(forceStr, colX[2], ry + rowH / 2 + 1);
          ctx.fillText(deltaLCmStr, colX[3], ry + rowH / 2 + 1);

          const dotX = colX[4];
          const dotY = ry + rowH / 2;
          const dotR = Math.max(4.5, 5.5 * uiScale);
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
          if (r.plotted) {
            ctx.fillStyle = '#0284c7';
            ctx.fill();
            ctx.strokeStyle = '#0369a1';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // 2B. Hooke's Law Diagram F_ελ(N) – Δl(cm)
    if (hookeSim.graphs?.hooke?.visible) {
      const leftPad = Math.max(22, Math.round(30 * uiScale));
      const rightPad = Math.max(12, Math.round(16 * uiScale));
      const axisLeftX = hx + leftPad;
      const axisRightX = hx + hW - rightPad;
      const axisTopY = diagramTopY + Math.round(14 * uiScale);
      const axisBotY = axisTopY + hPlotH;
      const plotSpanW = Math.max(70, axisRightX - axisLeftX - Math.round(18 * uiScale));
      const plotSpanH = Math.max(52, axisBotY - axisTopY - Math.round(18 * uiScale));

      const deltaL1Mm = 10;
      const maxRowForce = Math.max(4, ...recordedRows.map((r) => r.forceN));
      const maxRowDeltaL = Math.max(deltaL1Mm * 4, ...recordedRows.map((r) => r.deltaLMm));

      ctx.save();
      ctx.strokeStyle = axisInk;
      ctx.fillStyle = axisInk;
      ctx.lineWidth = Math.max(1.8, 2.3 * uiScale);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(axisLeftX, axisBotY);
      ctx.lineTo(axisLeftX, axisTopY);
      ctx.moveTo(axisLeftX - 5, axisTopY + 7);
      ctx.lineTo(axisLeftX, axisTopY);
      ctx.lineTo(axisLeftX + 5, axisTopY + 7);
      ctx.moveTo(axisLeftX, axisBotY);
      ctx.lineTo(axisRightX, axisBotY);
      ctx.moveTo(axisRightX - 7, axisBotY - 5);
      ctx.lineTo(axisRightX, axisBotY);
      ctx.lineTo(axisRightX - 7, axisBotY + 5);
      ctx.stroke();

      const titleFontPx = Math.max(11, Math.round(14 * uiScale));
      ctx.font = `italic bold ${titleFontPx}px Georgia, "Times New Roman", serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Fελ (N)', axisLeftX + 7, axisTopY + 4);
      ctx.textAlign = 'right';
      ctx.fillText('Δl (cm)', axisRightX - 2, axisBotY - Math.max(10, Math.round(13 * uiScale)));
      ctx.font = `bold ${Math.max(9.5, Math.round(11 * uiScale))}px system-ui, -apple-system, sans-serif`;
      ctx.fillText('0', axisLeftX - 5, axisBotY + 9);

      const isLineDrawn =
        Boolean(hookeSim.hookeLineDrawn) || springSims.some((sm) => sm.hookeLineDrawn);
      const cbSize = Math.max(12, Math.round(14 * uiScale));
      const cbBoxW = Math.max(58, Math.round(68 * uiScale));
      const cbBoxH = Math.max(18, Math.round(21 * uiScale));
      const cbBoxX = axisRightX - cbBoxW;
      const cbBoxY = axisTopY - Math.round(5 * uiScale);
      const cbSqX = cbBoxX + 4;
      const cbSqY = cbBoxY + (cbBoxH - cbSize) / 2;

      ctx.save();
      ctx.fillStyle = isDarkGrid ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)';
      ctx.strokeStyle = isLineDrawn ? '#16a34a' : isDarkGrid ? '#475569' : '#cbd5e1';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.roundRect(cbBoxX, cbBoxY, cbBoxW, cbBoxH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(cbSqX, cbSqY, cbSize, cbSize, 3);
      if (isLineDrawn) {
        ctx.fillStyle = '#16a34a';
        ctx.fill();
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cbSqX + cbSize * 0.22, cbSqY + cbSize * 0.52);
        ctx.lineTo(cbSqX + cbSize * 0.44, cbSqY + cbSize * 0.74);
        ctx.lineTo(cbSqX + cbSize * 0.78, cbSqY + cbSize * 0.26);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.font = `bold ${Math.max(8, Math.round(9.5 * uiScale))}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = isLineDrawn ? '#15803d' : isDarkGrid ? '#e2e8f0' : '#334155';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Γραμμή', cbSqX + cbSize + 4, cbBoxY + cbBoxH / 2 + 0.5);
      ctx.restore();

      const plottedRows = recordedRows.filter((r) => r.plotted);

      for (const row of plottedRows) {
        const px =
          axisLeftX + (Math.max(0, row.deltaLMm) / Math.max(1, maxRowDeltaL)) * plotSpanW;
        const py =
          axisBotY - (Math.max(0, row.forceN) / Math.max(1, maxRowForce)) * plotSpanH;
        if (row.deltaLMm > 0 || row.forceN > 0) {
          ctx.save();
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.58)';
          ctx.lineWidth = 1.35;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, axisBotY);
          ctx.moveTo(px, py);
          ctx.lineTo(axisLeftX, py);
          ctx.stroke();
          ctx.restore();

          const tickFontPx = Math.max(8.5, Math.round(10 * uiScale));
          const rowDeltaLCm = Number((row.deltaLMm / 10).toFixed(1))
            .toString()
            .replace('.', ',');
          ctx.save();
          ctx.font = `bold ${tickFontPx}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = axisInk;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(rowDeltaLCm, px, axisBotY + 4);
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            `${Number(row.forceN.toFixed(1)).toString().replace('.', ',')}`,
            axisLeftX - 5,
            py
          );
          ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = 'rgba(2, 132, 199, 0.2)';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(5.5, 7 * uiScale), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(3.5, 4.3 * uiScale), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (isLineDrawn) {
        const maxPlottedDeltaL =
          plottedRows.length > 0 ? Math.max(...plottedRows.map((r) => r.deltaLMm)) : 0;
        const lineMaxDeltaL = maxPlottedDeltaL > 0 ? maxPlottedDeltaL : maxRowDeltaL;
        let endRayDeltaL = lineMaxDeltaL;
        let endRayForce = (lineMaxDeltaL / Math.max(1, deltaL1Mm)) * 1.0;
        if (endRayForce > maxRowForce) {
          endRayForce = maxRowForce;
          endRayDeltaL = endRayForce * deltaL1Mm;
        }
        const rayEndX =
          axisLeftX + (endRayDeltaL / Math.max(1, maxRowDeltaL)) * plotSpanW;
        const rayEndY = axisBotY - (endRayForce / Math.max(1, maxRowForce)) * plotSpanH;

        ctx.save();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = Math.max(2.0, 2.7 * uiScale);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(axisLeftX, axisBotY);
        ctx.lineTo(rayEndX, rayEndY);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // 3. Force Vector / Pendulum / Inclined Plane Simulations
  for (const fSim of page.forceSims || []) {
    ctx.save();
    if (fSim.mode === 'analysis') {
      const ox = fSim.originX;
      const oy = fSim.originY;
      const fxPx = (fSim.fxUnits ?? 8) * A4_GRID_STEP_PX;
      const fyPx = -(fSim.fyUnits ?? 6) * A4_GRID_STEP_PX;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ox + fxPx, oy);
      ctx.lineTo(ox + fxPx, oy + fyPx);
      ctx.lineTo(ox, oy + fyPx);
      ctx.stroke();
      ctx.setLineDash([]);
      // Fx & Fy arrows
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + fxPx, oy);
      ctx.stroke();
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy + fyPx);
      ctx.stroke();
    } else if (fSim.mode === 'pendulum') {
      const px = fSim.originX;
      const py = fSim.originY;
      const L = fSim.rodLengthPx || 230;
      const ang = fSim.pendulumAngleRad ?? Math.PI / 5;
      const bx = px + L * Math.sin(ang);
      const by = py + L * Math.cos(ang);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(bx, by, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

let katexFontsReadyPromise: Promise<void> | null = null;
function ensureKatexFontsLoadedForPdf(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  if (!katexFontsReadyPromise) {
    katexFontsReadyPromise = Promise.race([
      Promise.allSettled([
        document.fonts.ready,
        document.fonts.load('italic 20px KaTeX_Math'),
        document.fonts.load('20px KaTeX_Main'),
        document.fonts.load('bold 20px KaTeX_Main'),
        document.fonts.load('20px KaTeX_AMS'),
        document.fonts.load('20px KaTeX_Size1'),
        document.fonts.load('20px KaTeX_Size2'),
      ]).then(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ]);
  }
  return katexFontsReadyPromise;
}

/**
 * Renders a MathOCR / LaTeX `TextObject` (`tx.isMath === true`) onto the 2D PDF canvas
 * using real KaTeX DOM layout + native 2D Canvas glyph/border/Path2D vector primitives
 * (zero `<foreignObject>` tainting, 100% Safari/iPadOS/Chrome compatible, identical to the editor!).
 */
async function drawKatexMathObjectForPdf(
  ctx: CanvasRenderingContext2D,
  tx: TextObject,
  page: NotePage,
  isMathLabel: boolean,
  customFontStack: string
): Promise<boolean> {
  if (typeof document === 'undefined' || !document.body) return false;
  const effectiveLatex = (tx.latex || convertPlainTextToMathLatex(tx.text || '') || '').trim();
  if (!effectiveLatex) return false;

  await ensureKatexFontsLoadedForPdf();

  const fSize = tx.fontSize || 20;
  const mathRows = splitAndCleanMathLatexLines(effectiveLatex);
  const rowsToRender = mathRows.length > 0 ? mathRows : [effectiveLatex];
  const multiM = tx.id.match(/-(math-graph-grp-[a-z0-9-]+)-multi$/);
  const multiGrp = multiM ? multiM[1] : null;
  const useCustomFont = Boolean(tx.fontFamily && tx.fontFamily !== 'sans');

  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '0px';
  host.style.top = '0px';
  host.style.opacity = '0';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '-9999';
  host.style.width = 'max-content';
  host.style.height = 'auto';
  host.style.padding = isMathLabel ? '0px 4px' : '2px 6px';
  host.style.border = '1px solid transparent';
  host.style.boxSizing = 'border-box';
  host.style.fontSize = `${fSize}px`;
  host.style.color = tx.color || '#111827';
  host.style.lineHeight = isMathLabel ? '1' : '1.18';
  if (useCustomFont) {
    host.style.fontFamily = customFontStack;
  }

  const innerDiv = document.createElement('div');
  innerDiv.style.display = 'flex';
  innerDiv.style.flexDirection = 'column';
  innerDiv.style.gap = '8px';
  innerDiv.style.alignItems =
    tx.textAlign === 'center' ? 'center' : tx.textAlign === 'right' ? 'flex-end' : 'flex-start';
  innerDiv.style.textAlign = tx.textAlign || 'left';

  rowsToRender.forEach((rowLatex, rIdx) => {
    const rowFnColor = multiGrp
      ? (page.strokes || []).find(
          (s) => s.groupId === multiGrp && s.id.includes(`-crv-fn${rIdx + 1}-`)
        )?.color
      : undefined;
    const rowEl = document.createElement('div');
    if (rowFnColor) {
      rowEl.style.color = rowFnColor;
    }
    rowEl.innerHTML = katex.renderToString(rowLatex, {
      throwOnError: false,
      strict: false,
      displayMode: true,
    });
    rowEl.querySelectorAll<HTMLElement>('.katex-display').forEach((dispEl) => {
      dispEl.style.margin = '0px';
      dispEl.style.textAlign = tx.textAlign || 'left';
    });
    if (useCustomFont) {
      rowEl.querySelectorAll<HTMLElement>('.katex, .katex *').forEach((kEl) => {
        kEl.style.fontFamily = 'inherit';
        kEl.style.fontWeight = 'normal';
      });
    }
    innerDiv.appendChild(rowEl);
  });

  host.appendChild(innerDiv);
  document.body.appendChild(host);

  try {
    const hostRect = host.getBoundingClientRect();
    const katexRoots = Array.from(host.querySelectorAll<HTMLElement>('.katex-html'));
    if (katexRoots.length === 0 || hostRect.width <= 0.5 || hostRect.height <= 0.5) {
      return false;
    }
    const originLeft = hostRect.left;
    const originTop = hostRect.top;
    let drawnItemsCount = 0;

    const getClippedBounds = (
      baseRect: DOMRect,
      startNode: HTMLElement | null
    ): { left: number; top: number; right: number; bottom: number } => {
      let left = baseRect.left;
      let top = baseRect.top;
      let right = baseRect.right;
      let bottom = baseRect.bottom;
      let anc = startNode;
      while (anc && anc !== host) {
        const acs = window.getComputedStyle(anc);
        const ov = `${acs.overflow} ${acs.overflowX} ${acs.overflowY}`;
        if (ov.includes('hidden') || ov.includes('clip')) {
          const ar = anc.getBoundingClientRect();
          if (ar.left > left) left = ar.left;
          if (ar.top > top) top = ar.top;
          if (ar.right < right) right = ar.right;
          if (ar.bottom < bottom) bottom = ar.bottom;
        }
        anc = anc.parentElement;
      }
      return { left, top, right, bottom };
    };

    ctx.save();
    if (tx.shadow) {
      ctx.shadowColor = 'rgba(71, 85, 105, 0.35)';
      ctx.shadowOffsetX = Math.max(0.7, fSize * 0.035);
      ctx.shadowOffsetY = Math.max(1.1, fSize * 0.055);
      ctx.shadowBlur = Math.max(2.0, fSize * 0.08);
    }
    for (const kRoot of katexRoots) {
      // 1. CSS backgrounds & borders (fraction bars `.frac-line`, overlines, underlines, matrix rules)
      const allEls: HTMLElement[] = [kRoot, ...Array.from(kRoot.querySelectorAll<HTMLElement>('*'))];
      for (const el of allEls) {
        if (el.closest('svg, .katex-mathml')) continue;
        const cs = window.getComputedStyle(el);
        if (cs.display === 'none') {
          continue;
        }
        const er = el.getBoundingClientRect();
        if (er.width <= 0.05 && er.height <= 0.05) continue;

        if (
          cs.backgroundColor &&
          cs.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          cs.backgroundColor !== 'transparent'
        ) {
          ctx.fillStyle = cs.backgroundColor;
          ctx.fillRect(
            tx.x + (er.left - originLeft),
            tx.y + (er.top - originTop),
            er.width,
            er.height
          );
          drawnItemsCount++;
        }

        const bbw = cs.borderBottomStyle !== 'none' ? parseFloat(cs.borderBottomWidth || '0') : 0;
        if (bbw > 0.05 && er.width > 0.2) {
          const drawH = Math.max(0.85, bbw);
          ctx.fillStyle = cs.borderBottomColor || cs.color || tx.color || '#111827';
          ctx.fillRect(
            tx.x + (er.left - originLeft),
            tx.y + (er.bottom - originTop) - drawH,
            er.width,
            drawH
          );
          drawnItemsCount++;
        }
        const btw = cs.borderTopStyle !== 'none' ? parseFloat(cs.borderTopWidth || '0') : 0;
        if (btw > 0.05 && er.width > 0.2) {
          const drawH = Math.max(0.85, btw);
          ctx.fillStyle = cs.borderTopColor || cs.color || tx.color || '#111827';
          ctx.fillRect(
            tx.x + (er.left - originLeft),
            tx.y + (er.top - originTop),
            er.width,
            drawH
          );
          drawnItemsCount++;
        }
        const blw = cs.borderLeftStyle !== 'none' ? parseFloat(cs.borderLeftWidth || '0') : 0;
        if (blw > 0.05 && er.height > 0.2) {
          const drawW = Math.max(0.85, blw);
          ctx.fillStyle = cs.borderLeftColor || cs.color || tx.color || '#111827';
          ctx.fillRect(
            tx.x + (er.left - originLeft),
            tx.y + (er.top - originTop),
            drawW,
            er.height
          );
          drawnItemsCount++;
        }
        const brw = cs.borderRightStyle !== 'none' ? parseFloat(cs.borderRightWidth || '0') : 0;
        if (brw > 0.05 && er.height > 0.2) {
          const drawW = Math.max(0.85, brw);
          ctx.fillStyle = cs.borderRightColor || cs.color || tx.color || '#111827';
          ctx.fillRect(
            tx.x + (er.right - originLeft) - drawW,
            tx.y + (er.top - originTop),
            drawW,
            er.height
          );
          drawnItemsCount++;
        }
      }

      // 2. Vector `<svg>` paths (`\sqrt{...}`, `\vec{...}`, `\widehat{...}`, extensible arrows, tall braces)
      for (const svgEl of Array.from(kRoot.querySelectorAll('svg'))) {
        const svgCs = window.getComputedStyle(svgEl);
        if (svgCs.display === 'none') continue;
        const sr = svgEl.getBoundingClientRect();
        if (sr.width <= 0.2 || sr.height <= 0.2) continue;
        const clip = getClippedBounds(sr, svgEl.parentElement);
        if (clip.right - clip.left <= 0.2 || clip.bottom - clip.top <= 0.2) continue;

        const vbAttr = (svgEl.getAttribute('viewBox') || '').trim();
        const vbParts = vbAttr ? vbAttr.split(/[\s,]+/).map(Number) : [];
        const vbMinX = vbParts.length === 4 && Number.isFinite(vbParts[0]) ? vbParts[0] : 0;
        const vbMinY = vbParts.length === 4 && Number.isFinite(vbParts[1]) ? vbParts[1] : 0;
        const vbW =
          vbParts.length === 4 && Number.isFinite(vbParts[2]) && vbParts[2] > 0
            ? vbParts[2]
            : sr.width;
        const vbH =
          vbParts.length === 4 && Number.isFinite(vbParts[3]) && vbParts[3] > 0
            ? vbParts[3]
            : sr.height;

        const par = (svgEl.getAttribute('preserveAspectRatio') || 'xMidYMid meet').trim();
        let scaleX = sr.width / vbW;
        let scaleY = sr.height / vbH;
        let mapOriginX = sr.left - vbMinX * scaleX;
        let mapOriginY = sr.top - vbMinY * scaleY;

        if (par !== 'none') {
          const isSlice = par.includes('slice');
          const uniScale = isSlice ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
          scaleX = uniScale;
          scaleY = uniScale;
          const extraW = sr.width - vbW * uniScale;
          const extraH = sr.height - vbH * uniScale;
          const xAlignOffset = par.includes('xMin') ? 0 : par.includes('xMax') ? extraW : extraW / 2;
          const yAlignOffset = par.includes('YMin') ? 0 : par.includes('YMax') ? extraH : extraH / 2;
          mapOriginX = sr.left + xAlignOffset - vbMinX * uniScale;
          mapOriginY = sr.top + yAlignOffset - vbMinY * uniScale;
        }

        const svgColor = svgCs.color || tx.color || '#111827';
        ctx.save();
        ctx.beginPath();
        ctx.rect(
          tx.x + (clip.left - originLeft),
          tx.y + (clip.top - originTop),
          clip.right - clip.left,
          clip.bottom - clip.top
        );
        ctx.clip();
        ctx.translate(tx.x + (mapOriginX - originLeft), tx.y + (mapOriginY - originTop));
        ctx.scale(scaleX, scaleY);
        ctx.fillStyle = svgColor;
        for (const pathEl of Array.from(svgEl.querySelectorAll('path'))) {
          const dAttr = pathEl.getAttribute('d');
          if (!dAttr) continue;
          try {
            ctx.fill(new Path2D(dAttr));
            drawnItemsCount++;
          } catch {
            // ignore malformed path
          }
        }
        ctx.restore();
      }

      // 3. KaTeX glyph runs (`Text` nodes inside `.katex-html`)
      const walker = document.createTreeWalker(kRoot, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let curNode = walker.nextNode();
      while (curNode) {
        const targetTextNode = curNode;
        const rawStr = targetTextNode.nodeValue || '';
        const parentEl = targetTextNode.parentElement;
        curNode = walker.nextNode();
        if (!rawStr || /^[\u200B\s]*$/.test(rawStr) || !parentEl) continue;
        if (parentEl.closest('svg, .katex-mathml')) continue;
        const cs = window.getComputedStyle(parentEl);
        if (cs.display === 'none') {
          continue;
        }
        range.selectNodeContents(targetTextNode);
        let rRect = range.getBoundingClientRect();
        if (rRect.width <= 0.1 || rRect.height <= 0.1) {
          rRect = parentEl.getBoundingClientRect();
        }
        if (rRect.width <= 0.1 || rRect.height <= 0.1) continue;

        const fStyle = cs.fontStyle && cs.fontStyle !== 'normal' ? `${cs.fontStyle} ` : '';
        const fWeight =
          cs.fontWeight && cs.fontWeight !== 'normal' && cs.fontWeight !== '400'
            ? `${cs.fontWeight} `
            : '';
        const fSizeCss = cs.fontSize || `${fSize}px`;
        const fFam = cs.fontFamily || 'KaTeX_Main, "Times New Roman", serif';
        ctx.font = `${fStyle}${fWeight}${fSizeCss} ${fFam}`;
        ctx.fillStyle = cs.color || tx.color || '#111827';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        const m = ctx.measureText(rawStr);
        let baseY: number;
        if (
          typeof m.fontBoundingBoxAscent === 'number' &&
          typeof m.fontBoundingBoxDescent === 'number' &&
          m.fontBoundingBoxAscent + m.fontBoundingBoxDescent > 0
        ) {
          const fontBoxH = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
          baseY =
            tx.y + (rRect.top - originTop) + (rRect.height - fontBoxH) / 2 + m.fontBoundingBoxAscent;
        } else if (typeof m.actualBoundingBoxAscent === 'number') {
          baseY =
            tx.y +
            (rRect.top - originTop) +
            m.actualBoundingBoxAscent +
            Math.max(0, (rRect.height - (m.actualBoundingBoxAscent + (m.actualBoundingBoxDescent || 0))) * 0.5);
        } else {
          baseY = tx.y + (rRect.top - originTop) + rRect.height * 0.8;
        }

        ctx.fillText(rawStr, tx.x + (rRect.left - originLeft), baseY);
        drawnItemsCount++;
      }
    }
    ctx.restore();
    return drawnItemsCount > 0;
  } catch {
    return false;
  } finally {
    host.remove();
  }
}

/**
 * Renders a `TextObject` onto the PDF 2D canvas context with:
 * - Authentic KaTeX layout & typography when `tx.isMath` is true
 * - Valid CSS `ctx.font` ordering (`italic` BEFORE `bold ${fSize}px`, preventing Canvas fallback to 10px!)
 * - Exact padding matching the canvas DOM (`px-1 py-0` for `math-graph-txt-` labels vs `px-3 py-1.5` for text boxes)
 * - True superscripts (`^2`, `^{2}`), subscripts (`_max`, `_0`, `_1`, `_{max}`), stacked fractions (`\frac{1}{2}`), and math symbols!
 */
async function drawTextObjectForPdf(
  ctx: CanvasRenderingContext2D,
  tx: TextObject,
  page: NotePage
) {
  const rawSource = (tx.isMath ? tx.latex || tx.text : tx.text || tx.latex) || '';
  if (!rawSource.trim()) return;

  const isMathLabel =
    tx.id.startsWith('math-graph-txt-') || Boolean(tx.groupId?.startsWith('math-graph-grp-'));
  const fSize = tx.fontSize || 20;
  const isItalic = tx.fontFamily === 'neohellenic' || Boolean(tx.isMath);
  const fontStyle = isItalic ? 'italic ' : '';
  const fontWeight = tx.bold ? 'bold ' : tx.isMath ? '600 ' : '500 ';
  const fontStack =
    tx.fontFamily === 'calligraphic'
      ? '"ExplainBoardsHand", "Alegreya Sans", cursive, sans-serif'
      : tx.fontFamily === 'calligraphic-bold'
      ? '"ExplainBoardsHandBold", "ExplainBoardsHand", "Alegreya Sans", cursive, sans-serif'
      : tx.fontFamily === 'neohellenic'
      ? '"GFS Neohellenic", "Arima", Georgia, "Times New Roman", serif'
      : tx.fontFamily === 'handwritten'
      ? '"Playpen Sans", "Arima", "Mansalva", cursive, sans-serif'
      : tx.fontFamily === 'mansalva'
      ? '"Mansalva", "Mynerve", "Playpen Sans", cursive, sans-serif'
      : tx.fontFamily === 'marker'
      ? tx.bold
        ? '"ExplainBoardsPenBold", "ExplainBoardsPen", "Alegreya Sans", cursive, sans-serif'
        : '"ExplainBoardsPen", "Alegreya Sans", cursive, sans-serif'
      : tx.isMath
      ? '"GFS Neohellenic", Georgia, "Times New Roman", serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  if (tx.isMath) {
    const renderedKatex = await drawKatexMathObjectForPdf(ctx, tx, page, isMathLabel, fontStack);
    if (renderedKatex) return;
  }

  ctx.save();
  if (tx.shadow) {
    ctx.shadowColor = 'rgba(71, 85, 105, 0.35)';
    ctx.shadowOffsetX = Math.max(0.7, fSize * 0.035);
    ctx.shadowOffsetY = Math.max(1.1, fSize * 0.055);
    ctx.shadowBlur = Math.max(2.0, fSize * 0.08);
  }
  const makeFont = (sz: number, boldOverride?: boolean) =>
    `${fontStyle}${boldOverride ? 'bold ' : fontWeight}${Math.max(7, sz).toFixed(1)}px ${fontStack}`;

  const cleanLatexLine = (str: string): string =>
    str
      .replace(/\\displaystyle\b|\\textstyle\b|\\left\b|\\right\b/g, '')
      .replace(/\\(?:text|mathrm|mathbf|mathit|operatorname)\{([^}]*)\}/g, '$1')
      .replace(/\\vec\{([^}]*)\}/g, '$1\u20D7')
      .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
      .replace(/\\,/g, '\u2009')
      .replace(/\\;|\\:/g, ' ')
      .replace(/\\!/g, '')
      .replace(/\\qquad(?![A-Za-z])/g, '    ')
      .replace(/\\quad(?![A-Za-z])/g, '  ')
      .replace(/\\sigma\s*\\upsilon\s*\\nu/gi, 'συν')
      .replace(/\\eta\s*\\mu/gi, 'ημ')
      .replace(/\\(?:varepsilon|epsilon)(?![A-Za-z])/g, 'ε')
      .replace(/\\(?:varphi|phi)(?![A-Za-z])/g, 'φ')
      .replace(/\\(?:vartheta|theta)(?![A-Za-z])/g, 'θ')
      .replace(/\\omega(?![A-Za-z])/g, 'ω')
      .replace(/\\Omega(?![A-Za-z])/g, 'Ω')
      .replace(/\\Lambda(?![A-Za-z])/g, 'Λ')
      .replace(/\\lambda(?![A-Za-z])/g, 'λ')
      .replace(/\\Delta(?![A-Za-z])/g, 'Δ')
      .replace(/\\delta(?![A-Za-z])/g, 'δ')
      .replace(/\\Sigma(?![A-Za-z])/g, 'Σ')
      .replace(/\\sigma(?![A-Za-z])/g, 'σ')
      .replace(/\\Gamma(?![A-Za-z])/g, 'Γ')
      .replace(/\\Theta(?![A-Za-z])/g, 'Θ')
      .replace(/\\Phi(?![A-Za-z])/g, 'Φ')
      .replace(/\\Psi(?![A-Za-z])/g, 'Ψ')
      .replace(/\\pi(?![A-Za-z])/g, 'π')
      .replace(/\\alpha(?![A-Za-z])/g, 'α')
      .replace(/\\beta(?![A-Za-z])/g, 'β')
      .replace(/\\gamma(?![A-Za-z])/g, 'γ')
      .replace(/\\mu(?![A-Za-z])/g, 'μ')
      .replace(/\\nu(?![A-Za-z])/g, 'ν')
      .replace(/\\rho(?![A-Za-z])/g, 'ρ')
      .replace(/\\tau(?![A-Za-z])/g, 'τ')
      .replace(/\\kappa(?![A-Za-z])/g, 'κ')
      .replace(/\\zeta(?![A-Za-z])/g, 'ζ')
      .replace(/\\eta(?![A-Za-z])/g, 'η')
      .replace(/\\xi(?![A-Za-z])/g, 'ξ')
      .replace(/\\chi(?![A-Za-z])/g, 'χ')
      .replace(/\\psi(?![A-Za-z])/g, 'ψ')
      .replace(/\\cdot(?![A-Za-z])/g, '·')
      .replace(/\\times(?![A-Za-z])/g, '×')
      .replace(/\\div(?![A-Za-z])/g, '÷')
      .replace(/\\(?:le|leq)(?![A-Za-z])/g, '≤')
      .replace(/\\(?:ge|geq)(?![A-Za-z])/g, '≥')
      .replace(/\\(?:ne|neq)(?![A-Za-z])/g, '≠')
      .replace(/\\simeq(?![A-Za-z])/g, '≃')
      .replace(/\\cong(?![A-Za-z])/g, '≅')
      .replace(/\\sim(?![A-Za-z])/g, '∼')
      .replace(/\\approx(?![A-Za-z])/g, '≈')
      .replace(/\\propto(?![A-Za-z])/g, '∝')
      .replace(/\\equiv(?![A-Za-z])/g, '≡')
      .replace(/\\perp(?![A-Za-z])/g, '⊥')
      .replace(/\\parallel(?![A-Za-z])/g, '∥')
      .replace(/\\(?:circ|degree)(?![A-Za-z])/g, '°')
      .replace(/\\pm(?![A-Za-z])/g, '±')
      .replace(/\\(?:rightarrow|to)(?![A-Za-z])/g, '→')
      .replace(/\\leftarrow(?![A-Za-z])/g, '←')
      .replace(/\\Rightarrow(?![A-Za-z])/g, '⇒')
      .replace(/\\Leftrightarrow(?![A-Za-z])/g, '⇔')
      .replace(/\\infty(?![A-Za-z])/g, '∞')
      .replace(/\\partial(?![A-Za-z])/g, '∂')
      .replace(/\\nabla(?![A-Za-z])/g, '∇')
      .replace(/\\sin(?![A-Za-z])/g, 'sin')
      .replace(/\\cos(?![A-Za-z])/g, 'cos')
      .replace(/\\tan(?![A-Za-z])/g, 'tan')
      .replace(/\\ln(?![A-Za-z])/g, 'ln')
      .replace(/\\log(?![A-Za-z])/g, 'log');

  const drawRichMathLine = (lineStr: string, startX: number, baseY: number, lineColor: string) => {
    const cleaned = cleanLatexLine(lineStr);
    const tokenRe =
      /(\\frac\{[^{}]*\}\{[^{}]*\}|\^(?:\([^)]+\)|\{[^}]+\}|[+-]?[A-Za-zΑ-Ωα-ω0-9.,]+)|_(?:\([^)]+\)|\{[^}]+\}|[+-]?[A-Za-zΑ-Ωα-ω0-9.,]+))/g;
    const parts = cleaned.split(tokenRe).filter(Boolean);
    let curX = startX;

    ctx.fillStyle = lineColor;
    ctx.strokeStyle = lineColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    for (const part of parts) {
      if (part.startsWith('\\frac{')) {
        const m = part.match(/^\\frac\{([^{}]*)\}\{([^{}]*)\}$/);
        if (m) {
          const numTxt = m[1].trim();
          const denTxt = m[2].trim();
          const fracSz = fSize * 0.74;
          ctx.font = makeFont(fracSz, true);
          const numW = ctx.measureText(numTxt).width;
          const denW = ctx.measureText(denTxt).width;
          const barW = Math.max(numW, denW) + 4;
          const midX = curX + barW / 2;
          ctx.textAlign = 'center';
          ctx.fillText(numTxt, midX, baseY - fSize * 0.34);
          ctx.fillText(denTxt, midX, baseY + fSize * 0.36);
          ctx.lineWidth = Math.max(1.2, fSize * 0.07);
          ctx.beginPath();
          ctx.moveTo(curX + 1, baseY - fSize * 0.24);
          ctx.lineTo(curX + barW - 1, baseY - fSize * 0.24);
          ctx.stroke();
          ctx.textAlign = 'left';
          curX += barW + 2;
          continue;
        }
      }
      if ((part.startsWith('^') || part.startsWith('_')) && part.length > 1) {
        const isSup = part[0] === '^';
        let inner = part.slice(1);
        if (
          (inner.startsWith('(') && inner.endsWith(')')) ||
          (inner.startsWith('{') && inner.endsWith('}'))
        ) {
          inner = inner.slice(1, -1);
        }
        const subSz = fSize * 0.72;
        ctx.font = makeFont(subSz);
        const yOff = isSup ? -fSize * 0.36 : fSize * 0.22;
        ctx.fillText(inner, curX, baseY + yOff);
        curX += ctx.measureText(inner).width + 0.8;
        continue;
      }
      const plain = part.replace(/[{}]/g, '');
      if (!plain) continue;
      ctx.font = makeFont(fSize);
      ctx.fillText(plain, curX, baseY);
      curX += ctx.measureText(plain).width;
    }
  };

  const logicalW = getPageLogicalWidth(page);
  const padX = isMathLabel ? 4 : 6;
  const padY = isMathLabel ? 0 : 2;
  const effectiveBoxW =
    !tx.isMath
      ? tx.boxWidth && tx.boxWidth > 20
        ? Math.min(tx.boxWidth, Math.max(48, logicalW - tx.x))
        : Math.max(48, logicalW - tx.x)
      : 0;
  const maxLineW = !tx.isMath ? Math.max(36, effectiveBoxW - padX * 2) : 0;

  if (!tx.isMath && tx.spans && tx.spans.length > 0) {
    const getFontStackForFamily = (fam: TextObject['fontFamily'], isBold?: boolean) =>
      fam === 'calligraphic'
        ? isBold
          ? '"ExplainBoardsHandBold", "ExplainBoardsHand", "Alegreya Sans", cursive, sans-serif'
          : '"ExplainBoardsHand", "Alegreya Sans", cursive, sans-serif'
        : fam === 'calligraphic-bold'
        ? '"ExplainBoardsHandBold", "ExplainBoardsHand", "Alegreya Sans", cursive, sans-serif'
        : fam === 'neohellenic'
        ? '"GFS Neohellenic", "Arima", Georgia, "Times New Roman", serif'
        : fam === 'handwritten'
        ? '"Playpen Sans", "Arima", "Mansalva", cursive, sans-serif'
        : fam === 'mansalva'
        ? '"Mansalva", "Mynerve", "Playpen Sans", cursive, sans-serif'
        : fam === 'marker'
        ? isBold
          ? '"ExplainBoardsPenBold", "ExplainBoardsPen", "Alegreya Sans", cursive, sans-serif'
          : '"ExplainBoardsPen", "Alegreya Sans", cursive, sans-serif'
        : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const getStyleAt = (charIdx: number) => {
      let segSz = fSize;
      let segBold = Boolean(tx.bold || tx.fontFamily === 'calligraphic-bold');
      let segShadow = Boolean(tx.shadow);
      let segColor = tx.color || '#111827';
      let segFam = tx.fontFamily;
      for (const sp of tx.spans || []) {
        if (charIdx >= sp.start && charIdx < sp.end) {
          if (sp.fontSize !== undefined) segSz = sp.fontSize;
          if (sp.bold !== undefined) segBold = sp.bold;
          if (sp.shadow !== undefined) segShadow = sp.shadow;
          if (sp.color !== undefined) segColor = sp.color;
          if (sp.fontFamily !== undefined) segFam = sp.fontFamily;
        }
      }
      const segItalic = segFam === 'neohellenic';
      const segFont = `${segItalic ? 'italic ' : ''}${segBold ? 'bold ' : '500 '}${Math.max(
        7,
        segSz
      ).toFixed(1)}px ${getFontStackForFamily(segFam, segBold)}`;
      return { sz: segSz, bold: segBold, shadow: segShadow, color: segColor, font: segFont };
    };

    const splitIntoStyleRuns = (s: number, e: number) => {
      const bSet = new Set<number>([s, e]);
      for (const sp of tx.spans || []) {
        if (sp.start > s && sp.start < e) bSet.add(sp.start);
        if (sp.end > s && sp.end < e) bSet.add(sp.end);
      }
      const bounds = Array.from(bSet).sort((a, b) => a - b);
      const runs: { text: string; sz: number; bold: boolean; shadow: boolean; color: string; font: string; width: number }[] = [];
      for (let i = 0; i < bounds.length - 1; i++) {
        const rs = bounds[i];
        const re = bounds[i + 1];
        if (re <= rs) continue;
        const st = getStyleAt(rs);
        const txt = rawSource.slice(rs, re);
        ctx.font = st.font;
        const w = ctx.measureText(txt).width;
        runs.push({ text: txt, ...st, width: w });
      }
      return runs;
    };

    const measureRangeWidth = (s: number, e: number): number => {
      if (e <= s) return 0;
      const runs = splitIntoStyleRuns(s, e);
      let totalW = 0;
      for (const r of runs) totalW += r.width;
      return totalW;
    };

    const rawLines = rawSource.split('\n');
    let charOffset = 0;
    const visualLines: { start: number; end: number }[] = [];

    for (let lIdx = 0; lIdx < rawLines.length; lIdx++) {
      const ln = rawLines[lIdx];
      const lineStart = charOffset;
      const lineEnd = lineStart + ln.length;
      charOffset = lineEnd + 1;

      if (lineEnd <= lineStart) {
        visualLines.push({ start: lineStart, end: lineEnd });
        continue;
      }

      const tokRe = /\s+|\S+/g;
      const tokens: { start: number; end: number; isSpace: boolean }[] = [];
      let m: RegExpExecArray | null;
      while ((m = tokRe.exec(ln)) !== null) {
        tokens.push({
          start: lineStart + m.index,
          end: lineStart + m.index + m[0].length,
          isSpace: /^\s+$/.test(m[0]),
        });
      }

      let curStart: number | null = null;
      let curEnd = lineStart;
      for (const tok of tokens) {
        if (curStart === null) {
          if (tok.isSpace && visualLines.length > 0) continue;
          curStart = tok.start;
          curEnd = tok.end;
          continue;
        }
        if (tok.isSpace) {
          continue;
        }
        const candidateW = measureRangeWidth(curStart, tok.end);
        if (maxLineW > 0 && candidateW > maxLineW) {
          visualLines.push({ start: curStart, end: curEnd });
          curStart = tok.start;
          curEnd = tok.end;
        } else {
          curEnd = tok.end;
        }
      }
      if (curStart !== null) {
        visualLines.push({ start: curStart, end: curEnd });
      } else {
        visualLines.push({ start: lineStart, end: lineStart });
      }
    }

    const alignMode = tx.textAlign || 'left';
    const renderedLines = visualLines.map((vl) => {
      const runs = splitIntoStyleRuns(vl.start, vl.end);
      let maxSzInLine = fSize;
      let lineW = 0;
      for (const r of runs) {
        if (r.sz > maxSzInLine) maxSzInLine = r.sz;
        lineW += r.width;
      }
      return { runs, maxSzInLine, lineW };
    });
    const contentAreaW =
      tx.boxWidth && tx.boxWidth > 20
        ? Math.max(maxLineW, ...renderedLines.map((rl) => rl.lineW))
        : Math.max(0, ...renderedLines.map((rl) => rl.lineW));

    let curTopY = tx.y + padY;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    for (const rl of renderedLines) {
      const hasMarkerRun = tx.fontFamily === 'marker' || rl.runs.some((r) => r.font.includes('ExplainBoardsPen'));
      const rowH = rl.maxSzInLine * (tx.lineHeight || (hasMarkerRun ? 1.44 : 1.18));
      const baseY = curTopY + rl.maxSzInLine * (hasMarkerRun ? 1.06 : 0.92);
      const alignOffsetX =
        alignMode === 'center'
          ? Math.max(0, (contentAreaW - rl.lineW) / 2)
          : alignMode === 'right'
          ? Math.max(0, contentAreaW - rl.lineW)
          : 0;
      let curX = tx.x + padX + alignOffsetX;
      for (const seg of rl.runs) {
        ctx.font = seg.font;
        ctx.fillStyle = seg.color;
        if (seg.shadow) {
          ctx.shadowColor = 'rgba(71, 85, 105, 0.35)';
          ctx.shadowOffsetX = Math.max(0.7, seg.sz * 0.035);
          ctx.shadowOffsetY = Math.max(1.1, seg.sz * 0.055);
          ctx.shadowBlur = Math.max(2.0, seg.sz * 0.08);
        } else {
          ctx.shadowColor = 'transparent';
        }
        ctx.fillText(seg.text, curX, baseY);
        curX += seg.width;
      }
      curTopY += rowH;
    }
    ctx.restore();
    return;
  }

  ctx.font = makeFont(fSize);
  const rawParas = rawSource.split(/\r?\n/);
  const wrappedLines: string[] = [];

  for (const para of rawParas) {
    if (!maxLineW || para.includes('^') || para.includes('_') || para.includes('\\')) {
      wrappedLines.push(para);
      continue;
    }
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      wrappedLines.push('');
      continue;
    }
    let currentLine = words[0];
    for (let wIdx = 1; wIdx < words.length; wIdx++) {
      const candidate = `${currentLine} ${words[wIdx]}`;
      if (ctx.measureText(candidate).width <= maxLineW) {
        currentLine = candidate;
      } else {
        wrappedLines.push(currentLine);
        currentLine = words[wIdx];
      }
    }
    wrappedLines.push(currentLine);
  }

  const lineH = isMathLabel
    ? fSize * 1.05
    : fSize * (tx.lineHeight || (tx.fontFamily === 'marker' ? 1.44 : 1.18));
  const multiM = tx.id.match(/-(math-graph-grp-[a-z0-9-]+)-multi$/);
  const multiGrp = multiM ? multiM[1] : null;
  const alignMode = tx.textAlign || 'left';

  // Compute max rendered line width for center / right alignment when boxWidth is not explicitly set
  ctx.font = makeFont(fSize);
  const lineWidths = wrappedLines.map((ln) => ctx.measureText(cleanLatexLine(ln).replace(/[{}]/g, '')).width);
  const contentAreaW = Math.max(0, ...lineWidths);

  wrappedLines.forEach((line, idx) => {
    const rowFnColor = multiGrp
      ? (page.strokes || []).find(
          (s) => s.groupId === multiGrp && s.id.includes(`-crv-fn${idx + 1}-`)
        )?.color
      : undefined;
    const effectiveColor = rowFnColor || tx.color || '#111827';
    const baseY = tx.y + padY + (idx + 0.82) * lineH;
    const lnW = lineWidths[idx] || 0;
    const alignOffsetX =
      alignMode === 'center'
        ? Math.max(0, (contentAreaW - lnW) / 2)
        : alignMode === 'right'
        ? Math.max(0, contentAreaW - lnW)
        : 0;
    drawRichMathLine(line, tx.x + padX + alignOffsetX, baseY, effectiveColor);
  });

  ctx.restore();
}

function getStoredRulersByPageId(
  options?: PdfExportOptions
): Record<string, PageRulerSnapshotState> {
  if (options?.rulersByPageId) return options.rulersByPageId;
  try {
    const raw = localStorage.getItem('bestnotes_rulers_by_page_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, PageRulerSnapshotState>;
      }
    }
  } catch {
    // ignore storage parse errors
  }
  return {};
}

function getEffectiveRulerGeometryForPdf(
  rState: PageRulerSnapshotState,
  pW: number,
  pH: number
) {
  const defaultLen = Math.round(pW * 0.8);
  const userLength = Math.max(69, Math.min(Math.max(pW, pH), rState.lengthPx ?? defaultLen));
  const rulerH = 54;
  const rad = (rState.angle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const EDGE_PAD = 10;
  const marginX = Math.abs(sinA) * (rulerH / 2) + EDGE_PAD;
  const marginY = Math.abs(cosA) * (rulerH / 2) + EDGE_PAD;

  const rawOriginX = rState.x - (userLength / 2) * cosA;
  const rawOriginY = rState.y - (userLength / 2) * sinA;
  const originX = Math.max(marginX, Math.min(pW - marginX, rawOriginX));
  const originY = Math.max(marginY, Math.min(pH - marginY, rawOriginY));

  let maxLenToPageEdge = Math.max(pW, pH) * 1.5;
  if (cosA > 1e-4) {
    maxLenToPageEdge = Math.min(maxLenToPageEdge, (pW - marginX - originX) / cosA);
  } else if (cosA < -1e-4) {
    maxLenToPageEdge = Math.min(maxLenToPageEdge, (marginX - originX) / cosA);
  }
  if (sinA > 1e-4) {
    maxLenToPageEdge = Math.min(maxLenToPageEdge, (pH - marginY - originY) / sinA);
  } else if (sinA < -1e-4) {
    maxLenToPageEdge = Math.min(maxLenToPageEdge, (marginY - originY) / sinA);
  }
  maxLenToPageEdge = Math.max(69, Math.floor(maxLenToPageEdge));

  const effectiveRulerW = Math.max(69, Math.min(userLength, maxLenToPageEdge));
  const centerX = originX + (effectiveRulerW / 2) * cosA;
  const centerY = originY + (effectiveRulerW / 2) * sinA;

  return {
    userLength,
    effectiveRulerW,
    maxLenToPageEdge,
    rulerH,
    originX,
    originY,
    centerX,
    centerY,
    cosA,
    sinA,
  };
}

function computeRulerPointerReadoutForPdf(
  ptrStroke: StrokeObject,
  rState: PageRulerSnapshotState,
  pW: number,
  targetPage: NotePage
) {
  if (!rState.visible || ptrStroke.points.length < 2) return null;
  if (!ptrStroke.attachedToSpringId) return null;

  const pH = getPageLogicalHeight(targetPage);
  const rGeom = getEffectiveRulerGeometryForPdf(rState, pW, pH);
  const rulerW = rGeom.effectiveRulerW;
  const rulerH = rGeom.rulerH;
  const oneMmPx = 920 / 20 / 10; // 4.6px per 1mm (46px per 1cm)
  const cosA = rGeom.cosA;
  const sinA = rGeom.sinA;

  if (Math.abs(sinA) < 0.96) return null;

  const closeEdgeThreshold = rulerH / 2 + 36;
  const maxPerp = 880;
  let isLockedAtZero = false;
  let zeroRefXPos = 0;
  let bestZeroAbs = Infinity;
  const validCandidates: { id: string; xPos: number }[] = [];

  for (const cand of targetPage.strokes || []) {
    if (!cand.attachedToSpringId || cand.points.length < 2) continue;
    const cP0 = cand.points[0];
    const cPEnd = cand.points[cand.points.length - 1];
    const sPerp0 = -(cP0.x - rGeom.centerX) * sinA + (cP0.y - rGeom.centerY) * cosA;
    const sPerpEnd = -(cPEnd.x - rGeom.centerX) * sinA + (cPEnd.y - rGeom.centerY) * cosA;
    const segPerpDist =
      sPerp0 * sPerpEnd <= 0 ? 0 : Math.min(Math.abs(sPerp0), Math.abs(sPerpEnd));
    const cTip = Math.abs(sPerpEnd) <= Math.abs(sPerp0) ? cPEnd : cP0;
    const cLocalX = (cTip.x - rGeom.centerX) * cosA + (cTip.y - rGeom.centerY) * sinA;
    const cLocalY = -(cTip.x - rGeom.centerX) * sinA + (cTip.y - rGeom.centerY) * cosA;
    const cXPos = cLocalX + rulerW / 2;
    if (cXPos >= -6 && cXPos <= rulerW + 6 && Math.abs(cLocalY) <= maxPerp) {
      validCandidates.push({ id: cand.id, xPos: cXPos });
      if (segPerpDist <= closeEdgeThreshold && Math.abs(cXPos) <= 2.3) {
        isLockedAtZero = true;
        if (Math.abs(cXPos) < bestZeroAbs) {
          bestZeroAbs = Math.abs(cXPos);
          zeroRefXPos = cXPos;
        }
      }
    }
  }
  if (!isLockedAtZero) return null;

  const p0 = ptrStroke.points[0];
  const pEnd = ptrStroke.points[ptrStroke.points.length - 1];
  const sPerp0Self = -(p0.x - rGeom.centerX) * sinA + (p0.y - rGeom.centerY) * cosA;
  const sPerpEndSelf = -(pEnd.x - rGeom.centerX) * sinA + (pEnd.y - rGeom.centerY) * cosA;
  const tipPt = Math.abs(sPerpEndSelf) <= Math.abs(sPerp0Self) ? pEnd : p0;

  const dx = tipPt.x - rGeom.centerX;
  const dy = tipPt.y - rGeom.centerY;
  const localX = dx * cosA + dy * sinA;
  const localY = -dx * sinA + dy * cosA;
  const xPos = localX + rulerW / 2;

  if (xPos < -6 || xPos > rulerW + 6 || Math.abs(localY) > maxPerp) {
    return null;
  }

  const clampedXPos = Math.max(0, Math.min(rulerW, xPos));
  const relXPos = Math.max(0, xPos - zeroRefXPos);
  const mmVal = Math.max(0, Math.round(relXPos / oneMmPx));
  const cmVal = Number((mmVal / 10).toFixed(1));
  const cmStr = `${cmVal.toString().replace('.', ',')} cm`;
  const ptrColor = ptrStroke.color || '#dc2626';
  const localAlong = clampedXPos - rulerW / 2;
  const axisPtX = rGeom.centerX + localAlong * cosA;
  const axisPtY = rGeom.centerY + localAlong * sinA;

  const isMostlyVertical = Math.abs(sinA) >= 0.35;
  const rightNormalSign = isMostlyVertical ? (-sinA >= 0 ? 1 : -1) : -1;
  const normX = rightNormalSign * -sinA;
  const normY = rightNormalSign * cosA;
  const badgeX = axisPtX + normX * (rulerH / 2 + 8);
  const badgeY = axisPtY + normY * (rulerH / 2 + 8);

  const toTipDotNorm = (tipPt.x - axisPtX) * normX + (tipPt.y - axisPtY) * normY;
  const edgeSign = toTipDotNorm >= 0 ? 1 : -1;
  const rulerEdgeX = axisPtX + edgeSign * normX * (rulerH / 2);
  const rulerEdgeY = axisPtY + edgeSign * normY * (rulerH / 2);
  const dashDx = rulerEdgeX - tipPt.x;
  const dashDy = rulerEdgeY - tipPt.y;
  const dashLen = Math.abs(localY) > rulerH / 2 + 1 ? Math.hypot(dashDx, dashDy) : 0;

  return {
    clampedXPos,
    cmStr,
    ptrColor,
    badgeX,
    badgeY,
    isMostlyVertical,
    isLockedAtZero,
    tipX: tipPt.x,
    tipY: tipPt.y,
    rulerEdgeX,
    rulerEdgeY,
    dashLen,
  };
}

function drawRulerAndPointersForPdf(
  ctx: CanvasRenderingContext2D,
  page: NotePage,
  options?: PdfExportOptions
) {
  const rulersMap = getStoredRulersByPageId(options);
  const pageRuler = rulersMap[page.id] || page.ruler;
  if (!pageRuler || !pageRuler.visible) return;

  const pW = getPageLogicalWidth(page);
  const pH = getPageLogicalHeight(page);
  const rGeom = getEffectiveRulerGeometryForPdf(pageRuler, pW, pH);
  const rulerW = rGeom.effectiveRulerW;
  const rulerH = rGeom.rulerH;
  const oneCmPx = 920 / 20; // 46px
  const halfCmPx = oneCmPx / 2; // 23px
  const totalHalfCmSteps = Math.floor(rulerW / halfCmPx);
  const showMm = pageRuler.showMm !== false;
  const rad = (pageRuler.angle * Math.PI) / 180;

  const pointerCandidates = (page.strokes || []).filter(
    (s) =>
      (s.shapeType === 'spring-pointer' ||
        Boolean(s.attachedToSpringId) ||
        s.shapeType === 'arrow' ||
        Boolean(s.arrowEnd)) &&
      s.points.length >= 2 &&
      !(
        s.groupId &&
        (s.groupId.startsWith('axes-') ||
          s.groupId.startsWith('wave-axes-') ||
          s.groupId.startsWith('math-graph-'))
      )
  );
  const pointerInfos = pointerCandidates
    .map((pSt) => computeRulerPointerReadoutForPdf(pSt, pageRuler, pW, page))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  // 1. Dashed Projection Lines from Pointer Arrow Tips to Ruler Edge
  for (const info of pointerInfos) {
    if (info.isLockedAtZero && info.dashLen > 1) {
      ctx.save();
      ctx.strokeStyle = info.ptrColor;
      ctx.lineWidth = 1.45;
      ctx.setLineDash([5, 3.5]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(info.tipX, info.tipY);
      ctx.lineTo(info.rulerEdgeX, info.rulerEdgeY);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 2. Ruler Body, Ticks, Upright cm Labels, Center Buttons & Colored Indicator Lines
  ctx.save();
  ctx.translate(rGeom.centerX, rGeom.centerY);
  ctx.rotate(rad);
  ctx.translate(-rulerW / 2, -rulerH / 2);

  ctx.fillStyle = 'rgba(226, 232, 240, 0.72)';
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.75)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.roundRect(0, 0, rulerW, rulerH, 6);
  ctx.fill();
  ctx.stroke();

  // Subtle center groove
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12, rulerH / 2);
  ctx.lineTo(rulerW - 12, rulerH / 2);
  ctx.stroke();

  if (showMm) {
    // 0 cm origin label
    ctx.save();
    ctx.translate(7, rulerH / 2);
    ctx.rotate(-rad);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
    ctx.beginPath();
    ctx.roundRect(-4.5, -5.5, 9, 11, 2);
    ctx.fill();
    ctx.font = 'bold 8.5px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('0', 0, 0.5);
    ctx.restore();

    const maxMm = Math.floor(rulerW / (oneCmPx / 10)) - 1;
    for (let mmIdx = 1; mmIdx <= maxMm; mmIdx++) {
      const isFullCm = mmIdx % 10 === 0;
      const isHalfCm = mmIdx % 5 === 0 && !isFullCm;
      const xPos = mmIdx * (oneCmPx / 10);
      const tickH = isFullCm ? 13 : isHalfCm ? 8.5 : 4.5;
      const tickW = isFullCm ? 1.5 : isHalfCm ? 1.15 : 0.85;
      ctx.fillStyle = isFullCm
        ? 'rgba(51, 65, 85, 0.85)'
        : isHalfCm
        ? 'rgba(71, 85, 105, 0.68)'
        : 'rgba(100, 116, 139, 0.48)';
      ctx.fillRect(xPos - tickW / 2, 0, tickW, tickH);
      ctx.fillRect(xPos - tickW / 2, rulerH - tickH, tickW, tickH);

      if (isFullCm && xPos < rulerW - 14) {
        const cmNumStr = String(mmIdx / 10);
        ctx.save();
        ctx.translate(xPos, rulerH / 2);
        ctx.rotate(-rad);
        const pillW = cmNumStr.length > 1 ? 13 : 9;
        ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
        ctx.beginPath();
        ctx.roundRect(-pillW / 2, -5.5, pillW, 11, 2);
        ctx.fill();
        ctx.font = '800 9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cmNumStr, 0, 0.5);
        ctx.restore();
      }
    }
  } else {
    for (let stepIdx = 1; stepIdx < totalHalfCmSteps; stepIdx++) {
      const isFullCm = stepIdx % 2 === 0;
      const xPos = stepIdx * halfCmPx;
      const tickH = isFullCm ? 12 : 6;
      const tickW = isFullCm ? 1.5 : 1;
      ctx.fillStyle = isFullCm ? 'rgba(100, 116, 139, 0.6)' : 'rgba(148, 163, 184, 0.45)';
      ctx.fillRect(xPos - tickW / 2, 0, tickW, tickH);
      ctx.fillRect(xPos - tickW / 2, rulerH - tickH, tickW, tickH);
    }
  }

  // Colored indicator lines across the ruler
  for (const info of pointerInfos) {
    ctx.fillStyle = info.ptrColor;
    ctx.fillRect(info.clampedXPos - 1, 0, 2, rulerH);
  }

  // Center 'cm' badge on the right edge of the ruler
  ctx.save();
  ctx.translate(rulerW / 2, rulerH - 13);
  ctx.rotate(-rad);
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fillStyle = showMm ? '#0066ff' : 'rgba(255, 255, 255, 0.9)';
  ctx.fill();
  ctx.strokeStyle = showMm ? '#60a5fa' : '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = '800 7.5px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = showMm ? '#ffffff' : '#334155';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('cm', 0, 0.5);
  ctx.restore();

  ctx.restore();

  // 3. Colored Readout Badges (◀ 0 cm, ◀ 1 cm, ◀ 2 cm, ◀ 3 cm) outside the Ruler
  for (const info of pointerInfos) {
    ctx.save();
    ctx.font = '800 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    const valW = ctx.measureText(info.cmStr).width;
    const pillW = Math.ceil(valW + 22);
    const pillH = 19;
    const bx = info.isMostlyVertical ? info.badgeX : info.badgeX - pillW / 2;
    const by = info.isMostlyVertical ? info.badgeY - pillH / 2 : info.badgeY - pillH;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = info.ptrColor;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.roundRect(bx, by, pillW, pillH, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = info.ptrColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = 'bold 8.5px system-ui, -apple-system, sans-serif';
    ctx.fillText('◀', bx + 5, by + pillH / 2 + 0.5);
    ctx.font = '800 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.fillText(info.cmStr, bx + 15, by + pillH / 2 + 0.5);
    ctx.restore();
  }
}

function hasCanvasAnyVisiblePixels(srcCanvas: HTMLCanvasElement): boolean {
  try {
    if (srcCanvas.width <= 0 || srcCanvas.height <= 0) return false;
    const probe = document.createElement('canvas');
    probe.width = 48;
    probe.height = 48;
    const pCtx = probe.getContext('2d');
    if (!pCtx) return false;
    pCtx.drawImage(srcCanvas, 0, 0, 48, 48);
    const data = pCtx.getImageData(0, 0, 48, 48).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 4) return true;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Renders all pages of a Notebook into a standard multi-page PDF-1.4 binary Blob (`application/pdf`).
 * Includes all live simulations (atoms, 3D molecules, circuits, springs, pendulums, force vectors) and the Ruler.
 */
export async function exportNotebookToPdfBlob(
  notebook: Notebook,
  options?: PdfExportOptions
): Promise<Blob> {
  const pageImages: {
    jpegBytes: Uint8Array;
    pixelW: number;
    pixelH: number;
    ptW: number;
    ptH: number;
  }[] = [];

  for (const page of notebook.pages) {
    const logicalW = getPageLogicalWidth(page);
    const logicalH = getPageLogicalHeight(page);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(logicalW * PDF_SCALE);
    canvas.height = Math.round(logicalH * PDF_SCALE);
    const ctx = canvas.getContext('2d')!;
    ctx.scale(PDF_SCALE, PDF_SCALE);

    const effectiveBgUrl =
      page.backgroundDataUrl ||
      (page.pdfPageNumber ? await ensurePdfPageDataUrl(notebook.id, page.pdfPageNumber, 'full') : null);

    if (effectiveBgUrl) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, logicalW, logicalH);
      const bgImg = await loadImageElement(effectiveBgUrl);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, logicalW, logicalH);
      }
    } else {
      drawPaperTemplateForPdf(ctx, page.template, logicalW, logicalH, page.paperColor);
    }

    const visibleLayerIds = new Set(
      (page.layers || []).filter((l) => l.visible).map((l) => l.id)
    );

    for (const im of page.images || []) {
      if (!im || !im.dataUrl) continue;
      if (visibleLayerIds.size > 0 && im.layerId && !visibleLayerIds.has(im.layerId)) continue;
      try {
        const imgEl = await loadImageElement(im.dataUrl);
        if (!imgEl) continue;
        ctx.save();
        if (im.rotation) {
          const cx = im.x + im.width / 2;
          const cy = im.y + im.height / 2;
          ctx.translate(cx, cy);
          ctx.rotate((im.rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }
        ctx.drawImage(imgEl, im.x, im.y, im.width, im.height);
        ctx.restore();
      } catch {
        // ignore broken image
      }
    }

    for (const st of page.strokes || []) {
      if (visibleLayerIds.size > 0 && st.layerId && !visibleLayerIds.has(st.layerId)) continue;
      try {
        drawStrokeForPdf(ctx, st);
      } catch {
        // ignore malformed stroke
      }
    }

    // Render all active simulations (circuits, bulbs, switches, electrons, Hooke tables/graphs, pendulums, forces, atoms & 3D molecules) in crisp vector quality!
    try {
      drawPageSimulationsSnapshotForPdf(ctx, page, options, false);
    } catch {
      // ignore simulation render error
    }

    // Render Ruler (Χάρακας) and its Pointer Laser Projections & < X cm Readouts if visible on this page!
    try {
      drawRulerAndPointersForPdf(ctx, page, options);
    } catch {
      // ignore ruler render error
    }

    for (const tx of page.texts || []) {
      if (visibleLayerIds.size > 0 && tx.layerId && !visibleLayerIds.has(tx.layerId)) continue;
      try {
        await drawTextObjectForPdf(ctx, tx, page);
      } catch {
        // ignore text render error
      }
    }

    // Use 0.75 JPEG quality (enables 4:2:0 chroma subsampling in browsers vs 4:4:4 at >0.90),
    // reducing exported PDF size by ~65-70% while keeping vector strokes & text sharp!
    const hasPhotos = Boolean(page.backgroundDataUrl || (page.images && page.images.length > 0));
    const jpegDataUrl = canvas.toDataURL('image/jpeg', hasPhotos ? 0.76 : 0.72);
    const jpegBytes = dataUrlToUint8Array(jpegDataUrl);
    const isLandscape = logicalW > logicalH;
    const ptLong = 841.89;
    pageImages.push({
      jpegBytes,
      pixelW: canvas.width,
      pixelH: canvas.height,
      ptW: isLandscape ? ptLong : Math.round(ptLong * (logicalW / Math.max(1, logicalH)) * 100) / 100,
      ptH: isLandscape ? Math.round(ptLong * (logicalH / Math.max(1, logicalW)) * 100) / 100 : ptLong,
    });
  }

  // Construct valid multi-page PDF-1.4 binary stream
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let offset = 0;
  const xrefOffsets: number[] = [0]; // obj 0 is free

  const pushStr = (s: string) => {
    const b = encoder.encode(s);
    chunks.push(b);
    offset += b.byteLength;
  };
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    offset += b.byteLength;
  };

  pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  // Object 1: Catalog
  xrefOffsets[1] = offset;
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages (kids are 3, 6, 9, ...)
  const pageObjIds = pageImages.map((_, idx) => 3 + idx * 3);
  xrefOffsets[2] = offset;
  pushStr(
    `2 0 obj\n<< /Type /Pages /Count ${pageImages.length} /Kids [${pageObjIds
      .map((id) => `${id} 0 R`)
      .join(' ')}] >>\nendobj\n`
  );

  // For each page: Page obj (3+3i), Content stream obj (4+3i), Image XObject (5+3i)
  pageImages.forEach((pg, idx) => {
    const pageId = 3 + idx * 3;
    const contentId = 4 + idx * 3;
    const imgId = 5 + idx * 3;
    const imgName = `/Im${idx + 1}`;

    xrefOffsets[pageId] = offset;
    pushStr(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pg.ptW.toFixed(
        2
      )} ${pg.ptH.toFixed(
        2
      )}] /Resources << /XObject << ${imgName} ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`
    );

    const contentStream = `q\n${pg.ptW.toFixed(2)} 0 0 ${pg.ptH.toFixed(
      2
    )} 0 0 cm\n${imgName} Do\nQ\n`;
    const contentBytes = encoder.encode(contentStream);
    xrefOffsets[contentId] = offset;
    pushStr(`${contentId} 0 obj\n<< /Length ${contentBytes.byteLength} >>\nstream\n`);
    pushBytes(contentBytes);
    pushStr('\nendstream\nendobj\n');

    xrefOffsets[imgId] = offset;
    pushStr(
      `${imgId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pg.pixelW} /Height ${pg.pixelH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpegBytes.byteLength} >>\nstream\n`
    );
    pushBytes(pg.jpegBytes);
    pushStr('\nendstream\nendobj\n');
  });

  const xrefStart = offset;
  const totalObjs = xrefOffsets.length;
  pushStr(`xref\n0 ${totalObjs}\n0000000000 65535 f \n`);
  for (let i = 1; i < totalObjs; i++) {
    const offStr = String(xrefOffsets[i]).padStart(10, '0');
    pushStr(`${offStr} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  );

  return new Blob(chunks, { type: 'application/pdf' });
}

async function throwDriveError(res: Response, contextLabel: string): Promise<never> {
  if (res.status === 401) {
    throw new Error('DRIVE_TOKEN_EXPIRED');
  }
  let detail = '';
  try {
    const errJson = await res.json();
    const msg = errJson?.error?.message || '';
    const reason = errJson?.error?.errors?.[0]?.reason || '';
    if (res.status === 403 && (reason === 'insufficientPermissions' || msg.toLowerCase().includes('insufficient'))) {
      throw new Error('DRIVE_SCOPE_MISSING');
    }
    if (msg) detail = `: ${msg}`;
  } catch (e: any) {
    if (e?.message === 'DRIVE_SCOPE_MISSING') throw e;
  }
  throw new Error(`${contextLabel} (${res.status})${detail}`);
}

export const DEFAULT_DRIVE_BASE_PATH = 'GoodNotes/x Σ Χ Ο Λ Ε Ι Α/2025-2026/Γυμνάσιο Αρναίας';

function normalizeDriveFolderMatchKey(raw: string): string {
  const homoglyphMap: Record<string, string> = {
    α: 'a',
    β: 'b',
    ε: 'e',
    ζ: 'z',
    η: 'h',
    ι: 'i',
    κ: 'k',
    μ: 'm',
    ν: 'n',
    ο: 'o',
    ρ: 'p',
    τ: 't',
    υ: 'y',
    χ: 'x',
  };
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .split('')
    .map((ch) => homoglyphMap[ch] || ch)
    .join('');
}

const verifiedTokenScopeCache = new Map<string, { valid: boolean; hasFullDriveScope: boolean; checkedAt: number }>();
const resolvedFolderCache = new Map<
  string,
  { folderId: string; folderIds: string[]; resolvedPathDisplay: string; cachedAt: number }
>();

export function clearDriveFolderResolutionCache(): void {
  resolvedFolderCache.clear();
}

export async function verifyDriveAccessToken(
  accessToken: string
): Promise<{ valid: boolean; hasFullDriveScope: boolean }> {
  const cached = verifiedTokenScopeCache.get(accessToken);
  if (cached && Date.now() - cached.checkedAt < 4 * 60 * 1000) {
    return { valid: cached.valid, hasFullDriveScope: cached.hasFullDriveScope };
  }
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    );
    if (!res.ok) {
      return { valid: false, hasFullDriveScope: false };
    }
    const data = await res.json();
    const expiresIn = Number(data.expires_in || 0);
    if (expiresIn <= 25) {
      return { valid: false, hasFullDriveScope: false };
    }
    const scopes = String(data.scope || '').split(/\s+/);
    const hasFullDriveScope = scopes.includes('https://www.googleapis.com/auth/drive');
    const result = { valid: true, hasFullDriveScope };
    verifiedTokenScopeCache.set(accessToken, { ...result, checkedAt: Date.now() });
    return result;
  } catch {
    return { valid: true, hasFullDriveScope: true };
  }
}

interface DriveFolderMeta {
  id: string;
  name: string;
  parents?: string[];
  createdTime?: string;
  shared?: boolean;
}

function sortCandidateDriveFolders(candidates: DriveFolderMeta[]): DriveFolderMeta[] {
  return [...candidates].sort((a, b) => {
    // 1. Prefer shared folders (e.g. school folders shared in Google Drive with 👥 icon)
    const aShared = a.shared ? 1 : 0;
    const bShared = b.shared ? 1 : 0;
    if (aShared !== bShared) return bShared - aShared;
    // 2. Prefer oldest createdTime (the original GoodNotes folder over any newer duplicate folder)
    const aTime = a.createdTime ? Date.parse(a.createdTime) : Number.MAX_SAFE_INTEGER;
    const bTime = b.createdTime ? Date.parse(b.createdTime) : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

async function searchGlobalDriveFoldersByName(
  accessToken: string,
  folderName: string
): Promise<DriveFolderMeta[]> {
  const trimmed = folderName.trim();
  if (!trimmed) return [];
  const escapedFull = trimmed.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const firstWord = trimmed.split(/\s+/)[0] || trimmed;
  const prefix = firstWord.slice(0, Math.min(4, firstWord.length));
  const escapedPrefix = prefix.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const nameClause =
    escapedPrefix.length >= 2 && escapedPrefix !== escapedFull
      ? `(name='${escapedFull}' or name contains '${escapedPrefix}')`
      : `name='${escapedFull}'`;
  const q = `mimeType='application/vnd.google-apps.folder' and ${nameClause} and trashed=false`;
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        q
      )}&pageSize=100&orderBy=createdTime&includeItemsFromAllDrives=true&supportsAllDrives=true&fields=files(id,name,parents,createdTime,shared)&spaces=drive`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const files: DriveFolderMeta[] = Array.isArray(data.files) ? data.files : [];
    const targetKey = normalizeDriveFolderMatchKey(trimmed);
    const exact = files.filter((f) => (f.name || '').trim() === trimmed);
    const fuzzy = targetKey
      ? files.filter((f) => normalizeDriveFolderMatchKey(f.name || '') === targetKey)
      : [];
    const matched = exact.length > 0 ? exact : fuzzy;
    return sortCandidateDriveFolders(matched);
  } catch {
    return [];
  }
}

async function ensureDriveFolderAcrossParents(
  accessToken: string,
  folderName: string,
  parentIds: string[] = ['root'],
  alsoSearchGlobally = false
): Promise<{ ids: string[]; primaryId: string; name: string }> {
  const trimmedTarget = folderName.trim();
  const validParents = Array.from(new Set(parentIds.filter(Boolean)));
  if (validParents.length === 0) validParents.push('root');

  const parentClause =
    validParents.length === 1
      ? `'${validParents[0]}' in parents`
      : `(${validParents.slice(0, 25).map((id) => `'${id}' in parents`).join(' or ')})`;
  const q = `mimeType='application/vnd.google-apps.folder' and ${parentClause} and trashed=false`;
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&pageSize=100&orderBy=createdTime&includeItemsFromAllDrives=true&supportsAllDrives=true&fields=files(id,name,parents,createdTime,shared)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!searchRes.ok) {
    await throwDriveError(searchRes, 'Drive API error');
  }
  const data = await searchRes.json();
  const files: DriveFolderMeta[] = Array.isArray(data.files) ? data.files : [];

  // Collect all matching folders (exact trimmed or normalized homoglyph/space-insensitive match)
  const targetKey = normalizeDriveFolderMatchKey(trimmedTarget);
  const exactMatches = files.filter((f) => (f.name || '').trim() === trimmedTarget);
  const fuzzyMatches = targetKey
    ? files.filter((f) => normalizeDriveFolderMatchKey(f.name || '') === targetKey)
    : [];

  let combinedMatches = exactMatches.length > 0 ? exactMatches : fuzzyMatches;

  // For school / class folders (like "Γυμνάσιο Αρναίας" or "Γ2"), also check global Drive folders
  // in case an upper ancestor folder in Drive has a different path or resides under Computers / Shared!
  if (alsoSearchGlobally) {
    const globalMatches = await searchGlobalDriveFoldersByName(accessToken, trimmedTarget);
    if (globalMatches.length > 0) {
      const byId = new Map<string, DriveFolderMeta>();
      for (const m of [...globalMatches, ...combinedMatches]) {
        const existing = byId.get(m.id);
        if (!existing || (m.shared && !existing.shared)) {
          byId.set(m.id, m);
        }
      }
      combinedMatches = Array.from(byId.values());
    }
  }

  if (combinedMatches.length > 0) {
    const sorted = sortCandidateDriveFolders(combinedMatches);
    return {
      ids: sorted.map((f) => f.id),
      primaryId: sorted[0].id,
      name: sorted[0].name,
    };
  }

  // Create subfolder inside the primary (oldest/shared) parent only if no match exists
  const primaryParentId = validParents[0];
  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id,name',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: trimmedTarget,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [primaryParentId],
      }),
    }
  );
  if (!createRes.ok) {
    await throwDriveError(createRes, `Αποτυχία δημιουργίας φακέλου ${trimmedTarget}`);
  }
  const created = await createRes.json();
  const createdId = created.id as string;
  return {
    ids: [createdId],
    primaryId: createdId,
    name: (created.name as string) || trimmedTarget,
  };
}

async function resolveDriveTargetFolder(
  accessToken: string,
  basePathInput?: string,
  notebookFolder?: string
): Promise<{ folderId: string; folderIds: string[]; resolvedPathDisplay: string }> {
  const rawBase = (basePathInput || DEFAULT_DRIVE_BASE_PATH).trim();
  const cacheKey = `${accessToken.slice(-16)}|${rawBase}|${(notebookFolder || '').trim()}`;
  const cached = resolvedFolderCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < 5 * 60 * 1000) {
    return {
      folderId: cached.folderId,
      folderIds: cached.folderIds,
      resolvedPathDisplay: cached.resolvedPathDisplay,
    };
  }

  const nbSegments = (notebookFolder || '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  // Support direct Google Drive folder URL (e.g. https://drive.google.com/drive/folders/1AbC...)
  const urlMatch = rawBase.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (urlMatch) {
    let currentIds = [urlMatch[1]];
    const resolvedNames: string[] = ['Drive Folder'];
    for (const seg of nbSegments) {
      const next = await ensureDriveFolderAcrossParents(accessToken, seg, currentIds, false);
      currentIds = next.ids;
      resolvedNames.push(next.name);
    }
    const res = {
      folderId: currentIds[0],
      folderIds: currentIds,
      resolvedPathDisplay: resolvedNames.join(' / '),
    };
    resolvedFolderCache.set(cacheKey, { ...res, cachedAt: Date.now() });
    return res;
  }

  const baseSegments = rawBase
    .replace(/>>/g, '/')
    .replace(/>/g, '/')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  // Deduplicate overlapping segments between baseSegments and nbSegments:
  // e.g. if baseSegments ends with "Γυμνάσιο Αρναίας" and nbSegments is ["Γυμνάσιο Αρναίας", "Α1"],
  // avoid creating "Γυμνάσιο Αρναίας/Γυμνάσιο Αρναίας/Α1"!
  const combinedSegments = [...baseSegments];
  if (nbSegments.length > 0) {
    const firstNbKey = normalizeDriveFolderMatchKey(nbSegments[0]);
    const matchIdx = combinedSegments.findIndex(
      (bSeg) => normalizeDriveFolderMatchKey(bSeg) === firstNbKey
    );
    if (matchIdx !== -1) {
      // Truncate combinedSegments up to matchIdx and append nbSegments from there
      combinedSegments.splice(matchIdx, combinedSegments.length - matchIdx, ...nbSegments);
    } else {
      combinedSegments.push(...nbSegments);
    }
  }

  if (combinedSegments.length === 0) {
    combinedSegments.push('BestNotes');
  }

  let currentParentIds = ['root'];
  const resolvedNames: string[] = [];
  for (let idx = 0; idx < combinedSegments.length; idx++) {
    const seg = combinedSegments[idx];
    // Search globally for the root anchor ("GoodNotes") and the school base folder ("Γυμνάσιο Αρναίας")
    // so even if upper folders in Drive differ or if duplicate folders exist, we always include the real school folder!
    const isSchoolAnchor =
      idx === 0 ||
      (seg.length >= 5 &&
        (idx === baseSegments.length - 1 ||
          normalizeDriveFolderMatchKey(seg).includes('gymn') ||
          normalizeDriveFolderMatchKey(seg).includes('arn')));
    const folder = await ensureDriveFolderAcrossParents(
      accessToken,
      seg,
      currentParentIds,
      isSchoolAnchor
    );
    currentParentIds = folder.ids;
    resolvedNames.push(folder.name);
  }

  const result = {
    folderId: currentParentIds[0],
    folderIds: currentParentIds,
    resolvedPathDisplay: resolvedNames.join(' / '),
  };
  resolvedFolderCache.set(cacheKey, { ...result, cachedAt: Date.now() });
  return result;
}

async function uploadOrUpdateDriveFile(
  accessToken: string,
  parentFolderId: string,
  fileName: string,
  mimeType: string,
  blob: Blob
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const escaped = fileName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const q = `'${parentFolderId}' in parents and name='${escaped}' and trashed=false`;
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&includeItemsFromAllDrives=true&supportsAllDrives=true&fields=files(id,name,webViewLink)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!searchRes.ok) {
    await throwDriveError(searchRes, 'Drive search error');
  }
  const searchData = await searchRes.json();
  const existingFile = Array.isArray(searchData.files) && searchData.files[0] ? searchData.files[0] : null;

  const metadata: Record<string, unknown> = existingFile
    ? { name: fileName, mimeType }
    : { name: fileName, mimeType, parents: [parentFolderId] };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const url = existingFile
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink';

  const uploadRes = await fetch(url, {
    method: existingFile ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!uploadRes.ok) {
    await throwDriveError(uploadRes, 'Drive upload error');
  }
  return await uploadRes.json();
}

/**
 * Ensures a folder path (e.g. `Γυμνάσιο Αρναίας` or `Γυμνάσιο Αρναίας/Α1`) exists inside the configured
 * Google Drive folder hierarchy even if it currently contains 0 notebooks, without deleting anything.
 */
export async function syncDriveFolderStructureToGoogleDrive(
  accessToken: string,
  folderPath: string,
  customBasePath?: string
): Promise<{
  folderId: string;
  folderIds: string[];
  targetPathDisplay: string;
  folderWebViewLink: string;
}> {
  const tokenCheck = await verifyDriveAccessToken(accessToken);
  if (!tokenCheck.valid) {
    throw new Error('DRIVE_TOKEN_EXPIRED');
  }
  if (!tokenCheck.hasFullDriveScope) {
    throw new Error('DRIVE_SCOPE_MISSING');
  }

  const {
    folderId,
    folderIds,
    resolvedPathDisplay,
  } = await resolveDriveTargetFolder(accessToken, customBasePath, folderPath);

  return {
    folderId,
    folderIds,
    targetPathDisplay: resolvedPathDisplay,
    folderWebViewLink: `https://drive.google.com/drive/folders/${folderId}`,
  };
}

/**
 * Syncs a Notebook to Google Drive inside the configured Drive folder hierarchy
 * (default: `GoodNotes / x Σ Χ Ο Λ Ε Ι Α / 2025-2026 / Γυμνάσιο Αρναίας` + subfolder e.g. `Α1`, `Β1`, `Γ1`, `Γ2`),
 * sending ONLY the `<NoteTitle>.pdf` file and NEVER deleting any existing files or folders in Google Drive!
 */
export async function syncNotebookPdfToGoogleDrive(
  accessToken: string,
  notebook: Notebook,
  options?: PdfExportOptions,
  customBasePath?: string
): Promise<{
  folderId: string;
  targetPathDisplay: string;
  pdfFileId: string;
  pdfFileName: string;
  webViewLink?: string;
  folderWebViewLink?: string;
}> {
  // 0. Verify token validity & full Drive scope so we can see existing GoodNotes folders
  const tokenCheck = await verifyDriveAccessToken(accessToken);
  if (!tokenCheck.valid) {
    throw new Error('DRIVE_TOKEN_EXPIRED');
  }
  if (!tokenCheck.hasFullDriveScope) {
    throw new Error('DRIVE_SCOPE_MISSING');
  }

  // 1. Resolve the exact target folder(s) in Google Drive (matching existing GoodNotes folders without creating duplicates)
  const {
    folderId: targetFolderId,
    folderIds: allTargetFolderIds,
    resolvedPathDisplay,
  } = await resolveDriveTargetFolder(accessToken, customBasePath, notebook.folder);

  // 2. Export notebook pages to a real multi-page PDF Blob
  const pdfBlob = await exportNotebookToPdfBlob(notebook, options);
  const safeTitle = (notebook.title || 'Σημείωση').trim().replace(/[/\\?%*:|"<>]/g, '-');
  const pdfFileName = safeTitle.toLowerCase().endsWith('.pdf') ? safeTitle : `${safeTitle}.pdf`;

  // 3. Upload or update `<safeTitle>.pdf` inside the primary target folder AND any secondary matching folder
  //    (e.g. if an earlier sync created a duplicate folder alongside the shared GoodNotes folder)
  const uniqueFolderIds = Array.from(new Set([targetFolderId, ...(allTargetFolderIds || [])])).slice(
    0,
    3
  );
  let primaryUploaded: { id: string; name: string; webViewLink?: string } | null = null;
  for (let i = 0; i < uniqueFolderIds.length; i++) {
    const fId = uniqueFolderIds[i];
    try {
      const up = await uploadOrUpdateDriveFile(
        accessToken,
        fId,
        pdfFileName,
        'application/pdf',
        pdfBlob
      );
      if (i === 0 || !primaryUploaded) {
        primaryUploaded = up;
      }
    } catch (err) {
      if (i === 0) throw err;
    }
  }

  if (!primaryUploaded) {
    throw new Error('Αποτυχία μεταφόρτωσης PDF στο Google Drive.');
  }

  return {
    folderId: targetFolderId,
    targetPathDisplay: resolvedPathDisplay,
    pdfFileId: primaryUploaded.id,
    pdfFileName,
    webViewLink: primaryUploaded.webViewLink,
    folderWebViewLink: `https://drive.google.com/drive/folders/${targetFolderId}`,
  };
}

/**
 * Exports a Notebook as a standalone, self-contained Interactive "Live PDF" (.live.html) file.
 * Has zero editing/drawing tools, looks like a clean PDF reader, draws a subtle interactive
 * border ONLY around animated simulations with Play/Stop controls, and allows full interaction
 * with circuits (switch ON/OFF), pendulums (drag & drop), springs (drag & drop), force vectors
 * (angle drag, synthesis & analysis), and 2D/3D atoms & molecules.
 */
export async function exportNotebookToLivePdfHtml(notebook: Notebook): Promise<Blob> {
  const pagesPayload: any[] = [];

  for (const page of notebook.pages) {
    const logicalW = getPageLogicalWidth(page);
    const logicalH = getPageLogicalHeight(page);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(logicalW * PDF_SCALE);
    canvas.height = Math.round(logicalH * PDF_SCALE);
    const ctx = canvas.getContext('2d')!;
    ctx.scale(PDF_SCALE, PDF_SCALE);

    const effectiveBgUrl =
      page.backgroundDataUrl ||
      (page.pdfPageNumber ? await ensurePdfPageDataUrl(notebook.id, page.pdfPageNumber, 'full') : null);

    if (effectiveBgUrl) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, logicalW, logicalH);
      const bgImg = await loadImageElement(effectiveBgUrl);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, logicalW, logicalH);
      }
    } else {
      drawPaperTemplateForPdf(ctx, page.template, logicalW, logicalH, page.paperColor);
    }

    const visibleLayerIds = new Set(
      (page.layers || []).filter((l) => l.visible).map((l) => l.id)
    );

    for (const im of page.images || []) {
      if (visibleLayerIds.size > 0 && im.layerId && !visibleLayerIds.has(im.layerId)) continue;
      const imgEl = await loadImageElement(im.dataUrl);
      if (!imgEl) continue;
      ctx.save();
      if (im.rotation) {
        const cx = im.x + im.width / 2;
        const cy = im.y + im.height / 2;
        ctx.translate(cx, cy);
        ctx.rotate((im.rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }
      ctx.drawImage(imgEl, im.x, im.y, im.width, im.height);
      ctx.restore();
    }

    // Collect stroke IDs that will be dynamically animated in the Live PDF player
    // (pendulum rod/bob, oscillating spring/mass, and draggable force vectors)
    const dynamicStrokeIds = new Set<string>();
    for (const sp of page.springSims || []) {
      if (sp.eqSpringStrokeId) dynamicStrokeIds.add(sp.eqSpringStrokeId);
      if (sp.massStrokeId) dynamicStrokeIds.add(sp.massStrokeId);
    }
    for (const fs of page.forceSims || []) {
      if (fs.primaryStrokeId) dynamicStrokeIds.add(fs.primaryStrokeId);
      if (fs.secondaryStrokeId) dynamicStrokeIds.add(fs.secondaryStrokeId);
    }

    for (const st of page.strokes || []) {
      if (visibleLayerIds.size > 0 && st.layerId && !visibleLayerIds.has(st.layerId)) continue;
      if (dynamicStrokeIds.has(st.id)) continue;
      drawStrokeForPdf(ctx, st);
    }

    // Render static Hooke tables/graphs and the Ruler (Χάρακας) if visible on the page
    drawPageSimulationsSnapshotForPdf(ctx, page, undefined, true);
    drawRulerAndPointersForPdf(ctx, page);

    for (const tx of page.texts || []) {
      if (visibleLayerIds.size > 0 && tx.layerId && !visibleLayerIds.has(tx.layerId)) continue;
      await drawTextObjectForPdf(ctx, tx, page);
    }

    // Enrich atomSims with precomputed 2D element info & 3D molecule geometry for standalone player
    const enrichedAtomSims = (page.atomSims || []).map((aSim) => {
      const inferred = inferReactionFromCanvasAtoms((aSim.atoms || []).map((a) => a.z));
      const rawEq =
        aSim.userRawReactionText || aSim.reactionEquationText || inferred.equationDisplay;
      const chemVal = validateAndCorrectChemicalEquation(rawEq, aSim.reactionEquationText);
      const mol3D = get3DMoleculeModel(
        aSim.activeReactionTerm || aSim.reactionEquationText || inferred.equationDisplay,
        (aSim.atoms || []).map((a) => a.z),
        aSim.selected3DMolId || aSim.activeReactionTerm
      );
      return {
        ...aSim,
        chemVal,
        mol3D,
        atomsMeta: (aSim.atoms || []).map((at) => {
          const el = getPeriodicElementByZ(at.z);
          return {
            ...at,
            symbol: el.symbol,
            nameEl: el.nameEl,
            massNum: el.a,
            shells: el.shells,
            rNuc: Math.max(13, Math.min(26, getNaturalNucleusRadiusPx(at.z))),
            rOuter: at.outerRadiusPx || getNaturalOuterOrbitRadiusPx(at.z),
          };
        }),
      };
    });

    pagesPayload.push({
      id: page.id,
      title: page.title,
      width: logicalW,
      height: logicalH,
      bgDataUrl: canvas.toDataURL('image/jpeg', 0.75),
      strokes: page.strokes || [],
      circuitSims: page.circuitSims || [],
      springSims: page.springSims || [],
      forceSims: page.forceSims || [],
      atomSims: enrichedAtomSims,
    });
  }

  const safeDocTitle = (notebook.title || 'ExplainBoards Live PDF')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeDocTitle} — Live PDF (Διαδραστικές Προσομοιώσεις)</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
  body { background: #1e293b; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
  header { position: sticky; top: 0; z-index: 50; background: #0f172a; border-bottom: 1px solid #334155; padding: 10px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; box-shadow: 0 4px 16px rgba(0,0,0,0.28); }
  .brand { display: flex; align-items: center; gap: 10px; }
  .badge-live { background: linear-gradient(135deg, #0284c7, #2563eb); color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.03em; display: inline-flex; align-items: center; gap: 5px; }
  .doc-title { font-size: 15px; font-weight: 700; color: #f1f5f9; }
  .controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .btn { background: #1e293b; border: 1px solid #475569; color: #e2e8f0; font-size: 12px; font-weight: 700; padding: 6px 13px; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
  .btn:hover { background: #334155; color: #fff; }
  .btn-play { background: #059669; border-color: #10b981; color: #fff; }
  .btn-play.paused { background: #d97706; border-color: #f59e0b; }
  .hint-bar { background: rgba(15, 23, 42, 0.85); color: #94a3b8; font-size: 12px; text-align: center; padding: 6px 12px; border-bottom: 1px solid #1e293b; }
  .hint-bar b { color: #38bdf8; }
  main { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 24px 12px 48px; gap: 28px; overflow: auto; }
  .page-wrap { position: relative; background: #fff; border-radius: 10px; box-shadow: 0 16px 40px rgba(0,0,0,0.42); overflow: hidden; transform-origin: top center; }
  .page-bg { display: block; width: 100%; height: 100%; pointer-events: none; }
  .sim-canvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; cursor: default; }
  @media print {
    header, .hint-bar { display: none !important; }
    body { background: #fff; }
    main { padding: 0; gap: 0; }
    .page-wrap { box-shadow: none; border-radius: 0; page-break-after: always; }
  }
</style>
</head>
<body>
<header>
  <div class="brand">
    <span class="badge-live">🎬 LIVE PDF</span>
    <span class="doc-title">${safeDocTitle}</span>
  </div>
  <div class="controls">
    <button id="globalPlayBtn" class="btn btn-play" onclick="toggleGlobalPlay()">⏸ Παύση Όλων των Animations</button>
    <button class="btn" onclick="changeZoom(-0.12)">➖</button>
    <span id="zoomLabel" style="font-size:12px;font-weight:700;min-width:44px;text-align:center;">100%</span>
    <button class="btn" onclick="changeZoom(0.12)">➕</button>
    <button class="btn" onclick="window.print()">🖨️ Εκτύπωση / PDF</button>
  </div>
</header>
<div class="hint-bar">
  🔒 <b>Λειτουργία Ανάγνωσης &amp; Ζωντανών Προσομοιώσεων (Χωρίς Εργαλεία Σχεδίασης):</b> Κάντε κλικ στα περιγράμματα των προσομοιώσεων για <b>Play/Stop</b>, ανοίξτε/κλείστε τον <b>διακόπτη κυκλώματος (ON/OFF)</b>, σύρετε το <b>εκκρεμές</b>, το <b>ελατήριο</b>, τα <b>διανύσματα δυνάμεων</b> ή περιστρέψτε το <b>3D μόριο</b>!
</div>
<main id="pagesContainer"></main>
<script>
const PAGES = ${JSON.stringify(pagesPayload)};
let globalPlaying = true;
let currentZoom = 1;

function toggleGlobalPlay() {
  globalPlaying = !globalPlaying;
  const btn = document.getElementById('globalPlayBtn');
  if (btn) {
    btn.textContent = globalPlaying ? '⏸ Παύση Όλων των Animations' : '▶ Εκκίνηση Όλων των Animations';
    btn.className = globalPlaying ? 'btn btn-play' : 'btn btn-play paused';
  }
}

function changeZoom(delta) {
  currentZoom = Math.max(0.5, Math.min(1.8, Math.round((currentZoom + delta) * 100) / 100));
  document.getElementById('zoomLabel').textContent = Math.round(currentZoom * 100) + '%';
  document.querySelectorAll('.page-wrap').forEach((el, idx) => {
    const pg = PAGES[idx];
    el.style.width = (pg.width * currentZoom) + 'px';
    el.style.height = (pg.height * currentZoom) + 'px';
  });
}

const container = document.getElementById('pagesContainer');
const pageStates = PAGES.map((pg, pIdx) => {
  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';
  wrap.style.width = pg.width + 'px';
  wrap.style.height = pg.height + 'px';

  const img = document.createElement('img');
  img.className = 'page-bg';
  img.src = pg.bgDataUrl;
  wrap.appendChild(img);

  const cv = document.createElement('canvas');
  cv.className = 'sim-canvas';
  cv.width = pg.width * 2;
  cv.height = pg.height * 2;
  wrap.appendChild(cv);
  container.appendChild(wrap);

  // Per-simulation interactive state
  const circuits = (pg.circuitSims || []).map((c) => ({
    ...c,
    playing: true,
    switchClosed: true,
  }));
  const springs = (pg.springSims || []).map((s) => ({
    ...s,
    playing: true,
    dispPx: (s.amplitudePx || 50) * 0.7,
    velPx: 0,
  }));
  const forces = (pg.forceSims || []).map((f) => ({
    ...f,
    playing: !f.isPaused,
    angleRad: f.pendulumAngleRad ?? Math.PI / 5,
    angVel: 0,
    showDecomp: true,
    showRes: true,
    fxPx: (f.fxUnits ?? 8) * 23,
    fyPx: -(f.fyUnits ?? 6) * 23,
    f1xPx: (f.f1xUnits ?? 8) * 23,
    f1yPx: -(f.f1yUnits ?? 0) * 23,
    f2xPx: (f.f2xUnits ?? 0) * 23,
    f2yPx: -(f.f2yUnits ?? 6) * 23,
  }));
  const atoms = (pg.atomSims || []).map((a) => ({
    ...a,
    playing: a.isRotating !== false,
    yawOffset: 0,
    rot3DYaw: a.rot3DYaw ?? 0.42,
    rot3DPitch: a.rot3DPitch ?? 0.24,
    show3DMolecule: Boolean(a.show3DMolecule),
    showChargeCloud: a.showChargeCloud !== false,
  }));

  return { pg, cv, ctx: cv.getContext('2d'), circuits, springs, forces, atoms, hitButtons: [], dragTarget: null };
});

function drawSimBorderAndHeader(ctx, x, y, w, h, title, isPlaying, simRef, hitButtons, extraBtns) {
  ctx.save();
  ctx.strokeStyle = isPlaying ? 'rgba(14, 165, 233, 0.78)' : 'rgba(148, 163, 184, 0.65)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.stroke();
  ctx.setLineDash([]);

  // Top-left label badge
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const lblW = ctx.measureText(title).width + 16;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y - 11, lblW, 20, 999);
  ctx.fill();
  ctx.fillStyle = '#e0f2fe';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, x + 16, y - 1);

  // Top-right Play/Stop button + extra buttons
  let curRightX = x + w - 8;
  const playLabel = isPlaying ? '⏸ Stop' : '▶ Play';
  const playW = ctx.measureText(playLabel).width + 18;
  curRightX -= playW;
  ctx.fillStyle = isPlaying ? '#059669' : '#d97706';
  ctx.beginPath();
  ctx.roundRect(curRightX, y - 11, playW, 20, 999);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(playLabel, curRightX + playW / 2, y - 1);
  hitButtons.push({ x1: curRightX, y1: y - 13, x2: curRightX + playW, y2: y + 11, onClick: () => { simRef.playing = !simRef.playing; } });

  for (const eb of (extraBtns || [])) {
    const bw = ctx.measureText(eb.label).width + 16;
    curRightX -= (bw + 6);
    ctx.fillStyle = eb.active ? '#2563eb' : '#334155';
    ctx.beginPath();
    ctx.roundRect(curRightX, y - 11, bw, 20, 999);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(eb.label, curRightX + bw / 2, y - 1);
    hitButtons.push({ x1: curRightX, y1: y - 13, x2: curRightX + bw, y2: y + 11, onClick: eb.onClick });
  }
  ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, color, width, label) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const head = 11;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - Math.PI / 6), y2 - head * Math.sin(ang - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(ang + Math.PI / 6), y2 - head * Math.sin(ang + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  if (label) {
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillText(label, x2 + 12 * Math.cos(ang), y2 + 12 * Math.sin(ang));
  }
  ctx.restore();
}

let lastNow = performance.now();
function tick(now) {
  const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
  lastNow = now;

  pageStates.forEach((st) => {
    const ctx = st.ctx;
    const w = st.pg.width;
    const h = st.pg.height;
    ctx.save();
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, w, h);
    st.hitButtons = [];

    // 1. CIRCUITS
    st.circuits.forEach((cSim) => {
      const idSet = new Set(cSim.strokeIds || []);
      const simStrokes = (st.pg.strokes || []).filter((s) => idSet.has(s.id));
      if (simStrokes.length === 0) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      simStrokes.forEach((s) => (s.points || []).forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }));
      if (!Number.isFinite(minX)) return;
      const isAct = globalPlaying && cSim.playing;
      drawSimBorderAndHeader(
        ctx,
        minX - 24,
        minY - 24,
        maxX - minX + 48,
        maxY - minY + 48,
        '⚡ Κύκλωμα',
        isAct,
        cSim,
        st.hitButtons,
        [{
          label: cSim.switchClosed ? '🟢 Διακόπτης ON' : '🔴 Διακόπτης OFF',
          active: cSim.switchClosed,
          onClick: () => { cSim.switchClosed = !cSim.switchClosed; }
        }]
      );

      if (cSim.switchClosed) {
        simStrokes.forEach((s) => {
          if (s.shapeType === 'bulb' && s.points.length >= 2) {
            const cx = (s.points[0].x + s.points[1].x) / 2;
            const cy = (s.points[0].y + s.points[1].y) / 2;
            const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 36);
            grad.addColorStop(0, 'rgba(250, 204, 21, 0.78)');
            grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, 36, 0, Math.PI * 2);
            ctx.fill();
          } else if (s.shapeType === 'line' && s.points.length >= 2) {
            const p0 = s.points[0];
            const p1 = s.points[s.points.length - 1];
            const len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            const cnt = Math.max(1, Math.floor(len / 28));
            const phase = isAct ? ((now * 0.0018) % 1) : 0.35;
            for (let k = 0; k < cnt; k++) {
              const t = (k + phase) / cnt;
              const ex = p0.x + (p1.x - p0.x) * t;
              const ey = p0.y + (p1.y - p0.y) * t;
              ctx.fillStyle = '#84cc16';
              ctx.strokeStyle = '#4ade80';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(ex, ey, 4.4, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
          }
        });
      }
    });

    // 2. SPRINGS
    st.springs.forEach((spSim) => {
      const spStroke = (st.pg.strokes || []).find((s) => s.id === spSim.eqSpringStrokeId);
      if (!spStroke || spStroke.points.length < 2) return;
      const pTop = spStroke.points[0];
      const pBot = spStroke.points[1] || { x: pTop.x, y: pTop.y + 140 };
      const eqLen = Math.hypot(pBot.x - pTop.x, pBot.y - pTop.y) || 140;
      const isAct = globalPlaying && spSim.playing && (!st.dragTarget || st.dragTarget.sim !== spSim);
      if (isAct) {
        const omega = 2.6 * Math.sqrt((spSim.stiffness || 1) / Math.max(0.2, spSim.mass || 1));
        const acc = -omega * omega * spSim.dispPx;
        spSim.velPx += acc * dt;
        spSim.dispPx += spSim.velPx * dt;
      }
      const curEndY = pTop.y + eqLen + spSim.dispPx;
      drawSimBorderAndHeader(
        ctx,
        pTop.x - 75,
        pTop.y - 24,
        150,
        eqLen + (spSim.amplitudePx || 55) + 95,
        '🌀 Ελατήριο (Drag & Drop)',
        globalPlaying && spSim.playing,
        spSim,
        st.hitButtons,
        []
      );
      // Draw spring coils
      ctx.save();
      ctx.strokeStyle = spStroke.color || '#2563eb';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y);
      const coils = 9;
      for (let i = 1; i <= coils * 2; i++) {
        const ty = pTop.y + ((curEndY - 22 - pTop.y) * i) / (coils * 2 + 1);
        const tx = pTop.x + (i % 2 === 0 ? -14 : 14);
        ctx.lineTo(tx, ty);
      }
      ctx.lineTo(pTop.x, curEndY - 18);
      ctx.stroke();
      // Draw hanging mass block
      ctx.fillStyle = '#dbeafe';
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pTop.x - 22, curEndY - 18, 44, 36, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      spSim._massCenter = { x: pTop.x, y: curEndY, eqY: pTop.y + eqLen };
    });

    // 3. FORCES / PENDULUM / INCLINE
    st.forces.forEach((fSim) => {
      const ox = fSim.originX;
      const oy = fSim.originY;
      if (fSim.mode === 'pendulum') {
        const L = fSim.rodLengthPx || 220;
        const isAct = globalPlaying && fSim.playing && (!st.dragTarget || st.dragTarget.sim !== fSim);
        if (isAct) {
          const gOverL = (9.81 * 32) / Math.max(80, L);
          const angAcc = -gOverL * Math.sin(fSim.angleRad);
          fSim.angVel += angAcc * dt;
          fSim.angVel *= 0.999;
          fSim.angleRad += fSim.angVel * dt;
        }
        const bx = ox + L * Math.sin(fSim.angleRad);
        const by = oy + L * Math.cos(fSim.angleRad);
        fSim._bobPt = { x: bx, y: by };

        drawSimBorderAndHeader(
          ctx,
          ox - L - 28,
          oy - 24,
          L * 2 + 56,
          L + 75,
          '⏱️ Εκκρεμές (Drag & Drop)',
          globalPlaying && fSim.playing,
          fSim,
          st.hitButtons,
          [{
            label: fSim.showDecomp ? '📐 Δυνάμεις ON' : '📐 Δυνάμεις OFF',
            active: fSim.showDecomp,
            onClick: () => { fSim.showDecomp = !fSim.showDecomp; }
          }]
        );

        ctx.save();
        ctx.strokeStyle = '#94a3b8';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox, oy + L + 16);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(bx, by);
        ctx.stroke();

        if (fSim.showDecomp) {
          drawArrow(ctx, bx, by, bx, by + 56, '#dc2626', 2.2, 'B');
          drawArrow(ctx, bx, by, bx - 52 * Math.sin(fSim.angleRad), by - 52 * Math.cos(fSim.angleRad), '#0284c7', 2.2, 'T');
        }

        ctx.fillStyle = '#2563eb';
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        // Force Analysis / Synthesis
        drawSimBorderAndHeader(
          ctx,
          ox - 190,
          oy - 190,
          380,
          310,
          fSim.mode === 'synthesis' ? '🎯 Σύνθεση Δυνάμεων' : '🎯 Ανάλυση Δύναμης (Drag Κορυφή)',
          globalPlaying && fSim.playing,
          fSim,
          st.hitButtons,
          [
            {
              label: fSim.showDecomp ? 'Fx/Fy ON' : 'Fx/Fy OFF',
              active: fSim.showDecomp,
              onClick: () => { fSim.showDecomp = !fSim.showDecomp; }
            },
            {
              label: fSim.showRes ? 'ΣF ON' : 'ΣF OFF',
              active: fSim.showRes,
              onClick: () => { fSim.showRes = !fSim.showRes; }
            }
          ]
        );
        const tx = ox + fSim.fxPx;
        const ty = oy + fSim.fyPx;
        fSim._tipPt = { x: tx, y: ty };
        if (fSim.showDecomp) {
          ctx.save();
          ctx.strokeStyle = '#94a3b8';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(tx, oy);
          ctx.lineTo(tx, ty);
          ctx.lineTo(ox, ty);
          ctx.stroke();
          ctx.restore();
          drawArrow(ctx, ox, oy, tx, oy, '#16a34a', 2.4, 'Fx');
          drawArrow(ctx, ox, oy, ox, ty, '#dc2626', 2.4, 'Fy');
        }
        if (fSim.showRes) {
          drawArrow(ctx, ox, oy, tx, ty, '#2563eb', 3.2, 'F');
        }
      }
    });

    // 4. ATOMS & 3D MOLECULES
    const atomPalette = ['#2563eb', '#dc2626', '#7c3aed', '#0d9488', '#d97706', '#db2777'];
    st.atoms.forEach((aSim) => {
      const metas = aSim.atomsMeta || [];
      if (metas.length === 0) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      metas.forEach((m) => {
        if (m.x - m.rOuter < minX) minX = m.x - m.rOuter;
        if (m.x + m.rOuter > maxX) maxX = m.x + m.rOuter;
        if (m.y - m.rOuter < minY) minY = m.y - m.rOuter;
        if (m.y + m.rOuter > maxY) maxY = m.y + m.rOuter;
      });
      const simCenterX = (minX + maxX) / 2;
      const topBarY = Math.max(28, minY - 54);
      const isAct = globalPlaying && aSim.playing;
      if (isAct && (!st.dragTarget || st.dragTarget.sim !== aSim)) {
        aSim.yawOffset = (aSim.yawOffset + dt * 0.45) % (Math.PI * 2);
      }

      const bX = Math.min(minX - 28, simCenterX - 230);
      const bW = Math.max(maxX - minX + 56, 460);
      const bH = (aSim.show3DMolecule ? 260 : 0) + (maxY - topBarY) + 64;
      drawSimBorderAndHeader(
        ctx,
        bX,
        topBarY - 18,
        bW,
        bH,
        '⚛️ Άτομο & 3D Μόριο',
        isAct,
        aSim,
        st.hitButtons,
        [
          {
            label: aSim.show3DMolecule ? '🧊 3D ON' : '🧊 3D OFF',
            active: aSim.show3DMolecule,
            onClick: () => { aSim.show3DMolecule = !aSim.show3DMolecule; }
          }
        ]
      );

      if (aSim.showAtomsBelowReaction !== false) {
        const colorByZ = new Map();
        metas.forEach((atom, atomIdx) => {
          if (!colorByZ.has(atom.z)) colorByZ.set(atom.z, atom.color || atomPalette[colorByZ.size % atomPalette.length]);
          const col = colorByZ.get(atom.z);
          const nShells = Math.max(1, atom.shells.length);
          for (let s = 0; s < nShells; s++) {
            const isOuter = s === nShells - 1;
            const r_s = nShells === 1 ? atom.rOuter : atom.rNuc + 14 + ((atom.rOuter - (atom.rNuc + 14)) * (s + 1)) / nShells;
            ctx.save();
            ctx.strokeStyle = col;
            ctx.globalAlpha = isOuter ? 0.85 : 0.35;
            ctx.lineWidth = isOuter ? 1.8 : 1.1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(atom.x, atom.y, r_s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            const eCount = Math.max(0, atom.shells[s] + (isOuter ? atom.extraElectrons || 0 : 0));
            const numPairs = Math.floor(eCount / 2);
            const hasUnpaired = eCount % 2 === 1;
            const totalSlots = Math.max(1, numPairs + (hasUnpaired ? 1 : 0));
            const pairHalfAng = Math.min(0.16, 6.5 / r_s);
            const baseRot = (isAct ? now * 0.00036 * (s % 2 === 0 ? 1 : -0.75) : 0) + atomIdx * 0.55;
            for (let g = 0; g < totalSlots; g++) {
              const slotAng = baseRot - Math.PI / 2 + (g * Math.PI * 2) / totalSlots;
              const angs = g < numPairs ? [slotAng - pairHalfAng, slotAng + pairHalfAng] : [slotAng];
              angs.forEach((ang) => {
                ctx.save();
                ctx.fillStyle = col;
                ctx.globalAlpha = isOuter ? 0.95 : 0.5;
                ctx.beginPath();
                ctx.arc(atom.x + r_s * Math.cos(ang), atom.y + r_s * Math.sin(ang), isOuter ? 4.2 : 3.1, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              });
            }
          }
          ctx.save();
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(atom.x, atom.y, atom.rNuc, 0, Math.PI * 2);
          ctx.fill();
          const lbl = metas.length === 1 ? (atom.symbol + ' , ' + atom.nameEl) : atom.symbol;
          ctx.font = 'bold 12px -apple-system, sans-serif';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(atom.symbol, atom.x, atom.y);
          ctx.fillStyle = col;
          ctx.fillText(lbl, atom.x, atom.y + atom.rNuc + 14);
          ctx.restore();
        });
      }

      if (aSim.show3DMolecule && aSim.mol3D) {
        const mol3D = aSim.mol3D;
        const boxW = 420, boxH = 216;
        const boxX = aSim.mol3DBoxX ?? Math.max(18, simCenterX - boxW / 2);
        const boxY = aSim.mol3DBoxY ?? Math.max(topBarY + 50, maxY + 34);
        const cx3d = boxX + boxW * 0.5, cy3d = boxY + 116;
        aSim._mol3DBox = { x1: boxX, y1: boxY, x2: boxX + boxW, y2: boxY + boxH };

        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px -apple-system, sans-serif';
        ctx.fillText('🧊 ' + mol3D.nameEl + ' (Σύρετε με το ποντίκι για 3D περιστροφή)', boxX + 14, boxY + 20);

        const yaw = aSim.rot3DYaw + aSim.yawOffset;
        const pitch = aSim.rot3DPitch;
        const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
        const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
        const scale3D = 62;
        const projAtoms = (mol3D.atoms || []).map((at, idx) => {
          const x1 = at.x * cosY + at.z3d * sinY;
          const z1 = -at.x * sinY + at.z3d * cosY;
          const y2 = at.y * cosP - z1 * sinP;
          const z2 = at.y * sinP + z1 * cosP;
          const persp = 1 / (1 - z2 * 0.14);
          return { ...at, idx, px: cx3d + x1 * scale3D * persp, py: cy3d + y2 * scale3D * persp, depth: z2, rPx: 21 * at.radiusFactor * persp };
        });
        (mol3D.bonds || []).forEach((b) => {
          const a1 = projAtoms[b.fromIdx], a2 = projAtoms[b.toIdx];
          if (!a1 || !a2) return;
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(a1.px, a1.py);
          ctx.lineTo(a2.px, a2.py);
          ctx.stroke();
        });
        [...projAtoms].sort((a, b) => a.depth - b.depth).forEach((at) => {
          ctx.fillStyle = at.color;
          ctx.beginPath();
          ctx.arc(at.px, at.py, at.rPx, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(at.symbol, at.px, at.py);
        });
        ctx.restore();
      }
    });

    ctx.restore();
  });

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Pointer events for interactive simulations (Zero drawing/editing tools!)
pageStates.forEach((st) => {
  const getPt = (e) => {
    const r = st.cv.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * st.pg.width,
      y: ((e.clientY - r.top) / r.height) * st.pg.height,
    };
  };

  st.cv.addEventListener('pointerdown', (e) => {
    const pt = getPt(e);
    for (const btn of st.hitButtons) {
      if (pt.x >= btn.x1 && pt.x <= btn.x2 && pt.y >= btn.y1 && pt.y <= btn.y2) {
        btn.onClick();
        return;
      }
    }
    for (const fSim of st.forces) {
      if (fSim.mode === 'pendulum' && fSim._bobPt && Math.hypot(pt.x - fSim._bobPt.x, pt.y - fSim._bobPt.y) <= 28) {
        st.dragTarget = { kind: 'pendulum', sim: fSim };
        st.cv.setPointerCapture(e.pointerId);
        return;
      }
      if (fSim.mode !== 'pendulum' && fSim._tipPt && Math.hypot(pt.x - fSim._tipPt.x, pt.y - fSim._tipPt.y) <= 28) {
        st.dragTarget = { kind: 'force-tip', sim: fSim };
        st.cv.setPointerCapture(e.pointerId);
        return;
      }
    }
    for (const spSim of st.springs) {
      if (spSim._massCenter && Math.hypot(pt.x - spSim._massCenter.x, pt.y - spSim._massCenter.y) <= 34) {
        st.dragTarget = { kind: 'spring-mass', sim: spSim };
        st.cv.setPointerCapture(e.pointerId);
        return;
      }
    }
    for (const aSim of st.atoms) {
      const b = aSim._mol3DBox;
      if (b && pt.x >= b.x1 && pt.x <= b.x2 && pt.y >= b.y1 && pt.y <= b.y2) {
        st.dragTarget = { kind: 'mol3d', sim: aSim, startX: pt.x, startY: pt.y, origYaw: aSim.rot3DYaw, origPitch: aSim.rot3DPitch };
        st.cv.setPointerCapture(e.pointerId);
        return;
      }
    }
  });

  st.cv.addEventListener('pointermove', (e) => {
    if (!st.dragTarget) return;
    const pt = getPt(e);
    const dtg = st.dragTarget;
    if (dtg.kind === 'pendulum') {
      dtg.sim.angleRad = Math.max(-1.35, Math.min(1.35, Math.atan2(pt.x - dtg.sim.originX, Math.max(20, pt.y - dtg.sim.originY))));
      dtg.sim.angVel = 0;
    } else if (dtg.kind === 'force-tip') {
      dtg.sim.fxPx = Math.max(-180, Math.min(180, pt.x - dtg.sim.originX));
      dtg.sim.fyPx = Math.max(-180, Math.min(180, pt.y - dtg.sim.originY));
    } else if (dtg.kind === 'spring-mass') {
      dtg.sim.dispPx = Math.max(-85, Math.min(85, pt.y - dtg.sim._massCenter.eqY));
      dtg.sim.velPx = 0;
    } else if (dtg.kind === 'mol3d') {
      dtg.sim.rot3DYaw = dtg.origYaw + (pt.x - dtg.startX) * 0.0085;
      dtg.sim.rot3DPitch = Math.max(-1.35, Math.min(1.35, dtg.origPitch - (pt.y - dtg.startY) * 0.0075));
    }
  });

  const endDrag = () => { st.dragTarget = null; };
  st.cv.addEventListener('pointerup', endDrag);
  st.cv.addEventListener('pointercancel', endDrag);
});
</script>
</body>
</html>`;

  return new Blob([html], { type: 'text/html;charset=utf-8' });
}

