import {
  Notebook,
  NotePage,
  StrokeObject,
  TextObject,
  HookeMeasurementRow,
  A4_GRID_STEP_PX,
  getPageLogicalWidth,
  getPageLogicalHeight,
} from '../types/note';
import {
  computeResistorOrSpringPoints,
  distance,
  isFreehandLoopClosed,
  ensureWaveBezierPoints,
  getCubicSegmentControlPoints,
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
} from './periodicTableData';

export interface PdfExportOptions {
  activePageId?: string;
  liveSimCanvas?: HTMLCanvasElement | null;
}

const PDF_SCALE = 1.5; // High-clarity A4 PDF page render

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
  h: number
) {
  ctx.save();
  ctx.fillStyle = template === 'dark-grid' ? '#0f172a' : '#fffdf7';
  ctx.fillRect(0, 0, w, h);

  if (template === 'blank') {
    ctx.restore();
    return;
  }

  ctx.strokeStyle =
    template === 'dark-grid' ? 'rgba(148, 163, 184, 0.16)' : 'rgba(71, 85, 105, 0.14)';
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
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(step * 10, lineStep * 2);
      ctx.lineTo(step * 10, h - lineStep * 5);
      ctx.moveTo(step * 2, h - lineStep * 5);
      ctx.lineTo(w - step * 2, h - lineStep * 5);
      ctx.stroke();
    }
  } else if (template === 'dotted') {
    ctx.fillStyle = 'rgba(120, 130, 145, 0.45)';
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

  if (s.tool === 'highlighter') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.38;
  } else {
    ctx.globalAlpha = s.opacity ?? 1;
  }

  ctx.strokeStyle = s.color;
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
    } else {
      const isStencilCustomFill =
        s.shapeType === 'fan-blade' ||
        s.shapeType === 'fan-hub' ||
        s.shapeType === 'incline-wedge' ||
        s.shapeType === 'incline-block' ||
        s.shapeType === 'switch' ||
        s.shapeType === 'switch-knob';
      const shadeColor = isStencilCustomFill
        ? s.fillColor || s.color || '#2563eb'
        : s.color || s.fillColor || '#2563eb';
      const fillTrans =
        s.shapeType === 'fan-blade' || s.shapeType === 'fan-hub'
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

/**
 * Renders a static snapshot of all active simulations on a page (atoms, 3D molecules, circuits,
 * force vectors/pendulums/inclines, and spring graphs) when exporting to PDF without a live simCanvas.
 */
function drawPageSimulationsSnapshotForPdf(ctx: CanvasRenderingContext2D, page: NotePage) {
  // 1. Atom & Chemistry Simulations (Bohr Orbits, Paired Electrons, Bonds, Reaction Header & 3D Molecule)
  const atomPalette = ['#2563eb', '#dc2626', '#7c3aed', '#0d9488', '#d97706', '#db2777'];
  for (const aSim of page.atomSims || []) {
    if (!aSim.atoms || aSim.atoms.length === 0) continue;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const at of aSim.atoms) {
      const rOut = at.outerRadiusPx || getNaturalOuterOrbitRadiusPx(at.z);
      if (at.x - rOut < minX) minX = at.x - rOut;
      if (at.x + rOut > maxX) maxX = at.x + rOut;
      if (at.y - rOut < minY) minY = at.y - rOut;
      if (at.y + rOut > maxY) maxY = at.y + rOut;
    }
    const simCenterX = Number.isFinite(minX) ? (minX + maxX) / 2 : 360;
    const topBarY = Math.max(28, (Number.isFinite(minY) ? minY : 180) - 54);

    if (aSim.showReactionEquation) {
      const inferred = inferReactionFromCanvasAtoms(aSim.atoms.map((a) => a.z));
      const rawForCheck =
        aSim.userRawReactionText || aSim.reactionEquationText || inferred.equationDisplay;
      const chemVal = validateAndCorrectChemicalEquation(rawForCheck);
      ctx.save();
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const eqText = chemVal.correctedEquation || rawForCheck;
      const cardW = Math.max(210, ctx.measureText(eqText).width + 86);
      const cardX = Math.max(16, simCenterX - cardW / 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = chemVal.hasCorrections ? '#fca5a5' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX, topBarY, cardW, 38, 12);
      ctx.fill();
      ctx.stroke();

      let curX = cardX + 18;
      const midY = topBarY + 19;
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
      const colorByZ = new Map<number, string>();
      aSim.atoms.forEach((atom, atomIdx) => {
        if (!colorByZ.has(atom.z)) {
          colorByZ.set(atom.z, atom.color || atomPalette[colorByZ.size % atomPalette.length]);
        }
        const el = getPeriodicElementByZ(atom.z);
        const col = atom.customColor
          ? atom.color || colorByZ.get(atom.z)!
          : colorByZ.get(atom.z)!;
        const rOuter = atom.outerRadiusPx || getNaturalOuterOrbitRadiusPx(atom.z);
        const rNuc = Math.max(13, Math.min(26, getNaturalNucleusRadiusPx(atom.z)));
        const nShells = Math.max(1, el.shells.length);

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

          const eCount = Math.max(0, el.shells[s] + (isOuter ? atom.extraElectrons || 0 : 0));
          const numPairs = Math.floor(eCount / 2);
          const hasUnpaired = eCount % 2 === 1;
          const totalSlots = Math.max(1, numPairs + (hasUnpaired ? 1 : 0));
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
            const ex = atom.x + r_s * Math.cos(ang);
            const ey = atom.y + r_s * Math.sin(ang);
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
        const isSingleAtom = aSim.atoms.length === 1;
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
    const isDarkGrid = page.template === 'dark-grid';
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

/**
 * Renders a `TextObject` onto the PDF 2D canvas context with:
 * - Valid CSS `ctx.font` ordering (`italic` BEFORE `bold ${fSize}px`, preventing Canvas fallback to 10px!)
 * - Exact padding matching the canvas DOM (`px-1 py-0` for `math-graph-txt-` labels vs `px-3 py-1.5` for text boxes)
 * - True superscripts (`^2`, `^{2}`), subscripts (`_max`, `_0`, `_1`, `_{max}`), stacked fractions (`\frac{1}{2}`), and math symbols!
 */
function drawTextObjectForPdf(
  ctx: CanvasRenderingContext2D,
  tx: TextObject,
  page: NotePage
) {
  const rawSource = (tx.isMath ? tx.latex || tx.text : tx.text || tx.latex) || '';
  if (!rawSource.trim()) return;

  ctx.save();
  const isMathLabel =
    tx.id.startsWith('math-graph-txt-') || Boolean(tx.groupId?.startsWith('math-graph-grp-'));
  const fSize = tx.fontSize || 20;
  const isItalic = tx.fontFamily === 'neohellenic' || Boolean(tx.isMath);
  const fontStyle = isItalic ? 'italic ' : '';
  const fontWeight = tx.bold ? 'bold ' : tx.isMath ? '600 ' : '500 ';
  const fontStack =
    tx.fontFamily === 'calligraphic'
      ? '"ExplainBoardsHand", "Alegreya Sans", cursive, sans-serif'
      : tx.fontFamily === 'neohellenic'
      ? '"GFS Neohellenic", "Arima", Georgia, "Times New Roman", serif'
      : tx.fontFamily === 'handwritten'
      ? '"Playpen Sans", "Arima", "Mansalva", cursive, sans-serif'
      : tx.fontFamily === 'mansalva'
      ? '"Mansalva", "Mynerve", "Playpen Sans", cursive, sans-serif'
      : tx.fontFamily === 'marker'
      ? '"ExplainBoardsPen", "Mynerve", "Mansalva", cursive, sans-serif'
      : tx.isMath
      ? '"GFS Neohellenic", Georgia, "Times New Roman", serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const makeFont = (sz: number, boldOverride?: boolean) =>
    `${fontStyle}${boldOverride ? 'bold ' : fontWeight}${Math.max(7, sz).toFixed(1)}px ${fontStack}`;

  const cleanLatexLine = (str: string): string =>
    str
      .replace(/\\displaystyle\b|\\left\b|\\right\b/g, '')
      .replace(/\\(?:text|mathrm|operatorname)\{([^}]*)\}/g, '$1')
      .replace(/\\sigma\s*\\upsilon\s*\\nu/gi, 'συν')
      .replace(/\\eta\s*\\mu/gi, 'ημ')
      .replace(/\\omega\b/g, 'ω')
      .replace(/\\Lambda\b/g, 'Λ')
      .replace(/\\lambda\b/g, 'λ')
      .replace(/\\Delta\b/g, 'Δ')
      .replace(/\\Sigma\b/g, 'Σ')
      .replace(/\\pi\b/g, 'π')
      .replace(/\\alpha\b/g, 'α')
      .replace(/\\beta\b/g, 'β')
      .replace(/\\gamma\b/g, 'γ')
      .replace(/\\theta\b/g, 'θ')
      .replace(/\\mu\b/g, 'μ')
      .replace(/\\cdot\b|\\times\b/g, '·')
      .replace(/\\le\b/g, '≤')
      .replace(/\\ge\b/g, '≥')
      .replace(/\\ne\b/g, '≠')
      .replace(/\\pm\b/g, '±')
      .replace(/\\Rightarrow\b/g, '⇒')
      .replace(/\\Leftrightarrow\b/g, '⇔')
      .replace(/\\sin\b/g, 'sin')
      .replace(/\\cos\b/g, 'cos')
      .replace(/\\tan\b/g, 'tan')
      .replace(/\\ln\b/g, 'ln')
      .replace(/\\log\b/g, 'log');

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

  ctx.font = makeFont(fSize);
  const rawParas = rawSource.split(/\r?\n/);
  const wrappedLines: string[] = [];
  const maxLineW = !tx.isMath && tx.boxWidth ? Math.max(24, tx.boxWidth - 24) : 0;

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

  const padX = isMathLabel ? 4 : 12;
  const padY = isMathLabel ? 0 : 6;
  const lineH = isMathLabel ? fSize * 1.05 : fSize * 1.35;
  const multiM = tx.id.match(/-(math-graph-grp-[a-z0-9-]+)-multi$/);
  const multiGrp = multiM ? multiM[1] : null;

  wrappedLines.forEach((line, idx) => {
    const rowFnColor = multiGrp
      ? (page.strokes || []).find(
          (s) => s.groupId === multiGrp && s.id.includes(`-crv-fn${idx + 1}-`)
        )?.color
      : undefined;
    const effectiveColor = rowFnColor || tx.color || '#111827';
    const baseY = tx.y + padY + (idx + 0.82) * lineH;
    drawRichMathLine(line, tx.x + padX, baseY, effectiveColor);
  });

  ctx.restore();
}

/**
 * Renders all pages of a Notebook into a standard multi-page PDF-1.4 binary Blob (`application/pdf`).
 * Includes all live simulations (atoms, 3D molecules, circuits, springs, pendulums, force vectors).
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

    if (page.backgroundDataUrl) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, logicalW, logicalH);
      const bgImg = await loadImageElement(page.backgroundDataUrl);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, logicalW, logicalH);
      }
    } else {
      drawPaperTemplateForPdf(ctx, page.template, logicalW, logicalH);
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

    for (const st of page.strokes || []) {
      if (visibleLayerIds.size > 0 && st.layerId && !visibleLayerIds.has(st.layerId)) continue;
      drawStrokeForPdf(ctx, st);
    }

    // Composite live simulation canvas on active page OR static simulation snapshot on other pages!
    if (
      options?.activePageId === page.id &&
      options?.liveSimCanvas &&
      options.liveSimCanvas.width > 0 &&
      options.liveSimCanvas.height > 0
    ) {
      ctx.save();
      ctx.drawImage(options.liveSimCanvas, 0, 0, logicalW, logicalH);
      ctx.restore();
    } else {
      drawPageSimulationsSnapshotForPdf(ctx, page);
    }

    for (const tx of page.texts || []) {
      drawTextObjectForPdf(ctx, tx, page);
    }

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.91);
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

async function ensureDriveFolder(
  accessToken: string,
  folderName: string,
  parentId = 'root'
): Promise<string> {
  const escaped = folderName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const q = `mimeType='application/vnd.google-apps.folder' and name='${escaped}' and '${parentId}' in parents and trashed=false`;
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=files(id,name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!searchRes.ok) {
    await throwDriveError(searchRes, 'Drive API error');
  }
  const data = await searchRes.json();
  if (Array.isArray(data.files) && data.files.length > 0) {
    return data.files[0].id as string;
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });
  if (!createRes.ok) {
    await throwDriveError(createRes, `Αποτυχία δημιουργίας φακέλου ${folderName}`);
  }
  const created = await createRes.json();
  return created.id as string;
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
    )}&fields=files(id,name,webViewLink)&spaces=drive`,
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
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart&fields=id,name,webViewLink`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

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
 * Syncs a Notebook to Google Drive inside `/BestNotes` (and `/BestNotes/<folder>` if folder is set),
 * converting it to `<NoteTitle>.pdf` and overwriting the exact same PDF filename on every update!
 */
export async function syncNotebookPdfToGoogleDrive(
  accessToken: string,
  notebook: Notebook,
  options?: PdfExportOptions
): Promise<{
  folderId: string;
  pdfFileId: string;
  pdfFileName: string;
  webViewLink?: string;
}> {
  // 1. Ensure root '/BestNotes' folder exists in Google Drive
  const rootBestNotesId = await ensureDriveFolder(accessToken, 'BestNotes', 'root');

  // 2. If notebook has a folder name, ensure '/BestNotes/<folder>' exists as well,
  //    and sync the PDF inside '/BestNotes' (plus inside the subfolder if custom)
  let targetFolderId = rootBestNotesId;
  if (notebook.folder && notebook.folder.trim() !== '') {
    targetFolderId = await ensureDriveFolder(
      accessToken,
      notebook.folder.trim(),
      rootBestNotesId
    );
  }

  // 3. Export notebook pages to a real multi-page PDF Blob
  const pdfBlob = await exportNotebookToPdfBlob(notebook, options);
  const safeTitle = (notebook.title || 'Σημείωση').trim().replace(/[/\\?%*:|"<>]/g, '-');
  const pdfFileName = safeTitle.toLowerCase().endsWith('.pdf') ? safeTitle : `${safeTitle}.pdf`;

  // 4. Upload or overwrite the exact same `<safeTitle>.pdf` inside `/BestNotes` (and subfolder if applicable)
  const rootUploaded = await uploadOrUpdateDriveFile(
    accessToken,
    rootBestNotesId,
    pdfFileName,
    'application/pdf',
    pdfBlob
  );

  if (targetFolderId !== rootBestNotesId) {
    await uploadOrUpdateDriveFile(
      accessToken,
      targetFolderId,
      pdfFileName,
      'application/pdf',
      pdfBlob
    );
  }

  return {
    folderId: rootBestNotesId,
    pdfFileId: rootUploaded.id,
    pdfFileName,
    webViewLink: rootUploaded.webViewLink,
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

    if (page.backgroundDataUrl) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, logicalW, logicalH);
      const bgImg = await loadImageElement(page.backgroundDataUrl);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, logicalW, logicalH);
      }
    } else {
      drawPaperTemplateForPdf(ctx, page.template, logicalW, logicalH);
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

    for (const tx of page.texts || []) {
      drawTextObjectForPdf(ctx, tx, page);
    }

    // Enrich atomSims with precomputed 2D element info & 3D molecule geometry for standalone player
    const enrichedAtomSims = (page.atomSims || []).map((aSim) => {
      const inferred = inferReactionFromCanvasAtoms((aSim.atoms || []).map((a) => a.z));
      const rawEq =
        aSim.userRawReactionText || aSim.reactionEquationText || inferred.equationDisplay;
      const chemVal = validateAndCorrectChemicalEquation(rawEq);
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
      bgDataUrl: canvas.toDataURL('image/jpeg', 0.92),
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
              ctx.fillStyle = '#facc15';
              ctx.strokeStyle = '#ca8a04';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(ex, ey, 3.8, 0, Math.PI * 2);
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

