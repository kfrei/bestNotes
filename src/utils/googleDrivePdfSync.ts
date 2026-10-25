import {
  Notebook,
  NotePage,
  StrokeObject,
  A4_GRID_STEP_PX,
  getPageLogicalWidth,
  getPageLogicalHeight,
} from '../types/note';
import {
  computeResistorOrSpringPoints,
  distance,
  isFreehandLoopClosed,
} from './geometryAndAlgorithms';

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

  // 3D Shapes
  if (
    (s.shapeType === 'cuboid' ||
      s.shapeType === 'cylinder' ||
      s.shapeType === 'sphere' ||
      s.shapeType === 'pyramid') &&
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
  } else if ((s.shapeType === 'sine' || s.shapeType === 'cosine') && s.points.length >= 2) {
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
    for (let i = 0; i <= 72; i++) {
      const t = i / 72;
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
    } else {
      for (let i = 1; i < s.points.length; i++) {
        const pt = s.points[i];
        if (pt.cx !== undefined && pt.cy !== undefined) {
          ctx.quadraticCurveTo(pt.cx, pt.cy, pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
    }
  }

  const canFillShape =
    s.shapeType !== 'line' &&
    s.shapeType !== 'arrow' &&
    s.shapeType !== 'double-arrow' &&
    s.shapeType !== 'resistor' &&
    s.shapeType !== 'spring' &&
    s.shapeType !== 'sine' &&
    s.shapeType !== 'cosine' &&
    s.fillStyle &&
    s.fillStyle !== 'none' &&
    s.points.length > 2 &&
    (s.isShape || isFreehandLoopClosed(s.points, true));

  if (canFillShape) {
    const shadeColor = s.color || s.fillColor || '#2563eb';
    const fillTrans = s.fillTransparency ?? 90;
    ctx.save();
    ctx.fillStyle = shadeColor;
    ctx.globalAlpha =
      fillTrans === 25 || fillTrans === 20
        ? 0.75
        : fillTrans === 45 || fillTrans === 50
        ? 0.55
        : 0.11;
    ctx.fill();
    ctx.restore();
  }

  ctx.stroke();

  if ((s.arrowEnd || s.shapeType === 'arrow' || s.shapeType === 'double-arrow') && s.points.length >= 2) {
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
 * Renders all pages of a Notebook into a standard multi-page PDF-1.4 binary Blob (`application/pdf`).
 */
export async function exportNotebookToPdfBlob(notebook: Notebook): Promise<Blob> {
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

    for (const tx of page.texts || []) {
      if (!tx.text) continue;
      ctx.save();
      ctx.fillStyle = tx.color || '#111827';
      const fontStack =
        tx.fontFamily === 'calligraphic'
          ? '"ExplainBoardsPen", "Mynerve", "Arima", cursive, sans-serif'
          : tx.fontFamily === 'neohellenic'
          ? 'italic "GFS Neohellenic", "Arima", cursive, serif'
          : tx.fontFamily === 'handwritten'
          ? '"Playpen Sans", "Arima", "Mansalva", cursive, sans-serif'
          : tx.fontFamily === 'mansalva'
          ? '"Mansalva", "Mynerve", "Playpen Sans", cursive, sans-serif'
          : tx.fontFamily === 'marker'
          ? '"ExplainBoardsHand", "Mynerve", "Mansalva", cursive, sans-serif'
          : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.font = `${tx.bold ? 'bold ' : ''}${tx.fontSize || 20}px ${fontStack}`;
      const lines = tx.text.split('\n');
      lines.forEach((line, idx) => {
        ctx.fillText(line, tx.x, tx.y + (idx + 1) * (tx.fontSize || 20) * 1.25);
      });
      ctx.restore();
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
  notebook: Notebook
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
  const pdfBlob = await exportNotebookToPdfBlob(notebook);
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
