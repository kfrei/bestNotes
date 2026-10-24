import { BezierPoint, StrokeObject, ShapePresetType } from '../types/note';

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Converts raw Apple Pencil points into smooth Quadratic Bezier curves with StreamLine filtering.
 */
export function smoothStrokeToBezier(rawPoints: BezierPoint[], streamline = 0.54): BezierPoint[] {
  if (rawPoints.length === 0) return [];
  if (rawPoints.length === 1) return [{ ...rawPoints[0] }];
  if (rawPoints.length === 2) {
    const p0 = rawPoints[0];
    const p1 = rawPoints[1];
    return [
      { ...p0 },
      {
        ...p1,
        cx: (p0.x + p1.x) / 2,
        cy: (p0.y + p1.y) / 2,
      },
    ];
  }

  // Step 1: Decimate micro-jitter stair-steps (< 1.8px) & apply StreamLine EMA filter
  const filtered: BezierPoint[] = [{ ...rawPoints[0] }];
  for (let i = 1; i < rawPoints.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = rawPoints[i];
    const d = distance(prev, curr);
    const isLast = i === rawPoints.length - 1;
    if (d < 1.8 && !isLast) continue;

    const alpha = isLast
      ? 0.78
      : Math.max(0.28, Math.min(0.72, 1 - streamline * Math.exp(-d / 16)));
    filtered.push({
      x: prev.x + alpha * (curr.x - prev.x),
      y: prev.y + alpha * (curr.y - prev.y),
      pressure: (prev.pressure ?? 0.5) * 0.45 + (curr.pressure ?? 0.5) * 0.55,
      tiltX: curr.tiltX,
      tiltY: curr.tiltY,
      twist: curr.twist,
    });
  }

  if (filtered.length === 1) return filtered;
  if (filtered.length === 2) {
    return [
      { ...filtered[0] },
      {
        ...filtered[1],
        cx: (filtered[0].x + filtered[1].x) / 2,
        cy: (filtered[0].y + filtered[1].y) / 2,
      },
    ];
  }

  // Step 2: Two passes of Gaussian-Laplacian relaxation to eliminate digitizer stair-steps ("ζαγρέ")
  let relaxed = filtered.map((p) => ({ ...p }));
  for (let pass = 0; pass < 2; pass++) {
    const next = relaxed.map((p) => ({ ...p }));
    for (let i = 1; i < relaxed.length - 1; i++) {
      next[i].x = 0.22 * relaxed[i - 1].x + 0.56 * relaxed[i].x + 0.22 * relaxed[i + 1].x;
      next[i].y = 0.22 * relaxed[i - 1].y + 0.56 * relaxed[i].y + 0.22 * relaxed[i + 1].y;
    }
    relaxed = next;
  }

  // Step 3: True C1-continuous Quadratic Bezier Midpoint Spline (zero end-hooks!)
  const result: BezierPoint[] = [{ ...relaxed[0] }];
  const firstMidX = (relaxed[0].x + relaxed[1].x) / 2;
  const firstMidY = (relaxed[0].y + relaxed[1].y) / 2;
  result.push({
    x: firstMidX,
    y: firstMidY,
    cx: (relaxed[0].x + firstMidX) / 2,
    cy: (relaxed[0].y + firstMidY) / 2,
    pressure: relaxed[0].pressure,
    tiltX: relaxed[0].tiltX,
    tiltY: relaxed[0].tiltY,
    twist: relaxed[0].twist,
  });

  for (let i = 1; i < relaxed.length - 1; i++) {
    const p0 = relaxed[i];
    const p1 = relaxed[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    result.push({
      x: midX,
      y: midY,
      cx: p0.x,
      cy: p0.y,
      pressure: p0.pressure,
      tiltX: p0.tiltX,
      tiltY: p0.tiltY,
      twist: p0.twist,
    });
  }

  const last = relaxed[relaxed.length - 1];
  const prevEnd = result[result.length - 1];
  result.push({
    x: last.x,
    y: last.y,
    cx: (prevEnd.x + last.x) / 2,
    cy: (prevEnd.y + last.y) / 2,
    pressure: last.pressure,
    tiltX: last.tiltX,
    tiltY: last.tiltY,
    twist: last.twist,
  });

  return result;
}

/**
 * Ramer-Douglas-Peucker polygon simplification for corner detection.
 */
function rdpSimplify(pts: BezierPoint[], epsilon: number): BezierPoint[] {
  if (pts.length < 3) return pts;
  let dmax = 0;
  let index = 0;
  const end = pts.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(pts[i], pts[0], pts[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const rec1 = rdpSimplify(pts.slice(0, index + 1), epsilon);
    const rec2 = rdpSimplify(pts.slice(index, end + 1), epsilon);
    return rec1.slice(0, rec1.length - 1).concat(rec2);
  } else {
    return [pts[0], pts[end]];
  }
}

function perpendicularDistance(
  pt: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const mag = Math.hypot(dx, dy);
  if (mag === 0) return distance(pt, lineStart);
  return Math.abs(dy * pt.x - dx * pt.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / mag;
}

/**
 * Detects if a stroke is a quick "Scribble-to-Erase" gesture.
 */
export function isScribbleEraseGesture(pts: BezierPoint[]): { isScribble: boolean; bounds?: { minX: number; minY: number; maxX: number; maxY: number } } {
  if (pts.length < 28) return { isScribble: false };
  let pathLen = 0;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let xReversals = 0;
  let lastDxSign = 0;

  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    pathLen += Math.hypot(dx, dy);
    minX = Math.min(minX, pts[i].x);
    minY = Math.min(minY, pts[i].y);
    maxX = Math.max(maxX, pts[i].x);
    maxY = Math.max(maxY, pts[i].y);

    if (Math.abs(dx) > 4.5) {
      const sign = dx > 0 ? 1 : -1;
      if (lastDxSign !== 0 && sign !== lastDxSign) {
        xReversals++;
      }
      lastDxSign = sign;
    }
  }

  const diag = Math.hypot(maxX - minX, maxY - minY);
  // Require deliberate dense scribble (at least 6 wide horizontal reversals) so Greek curvy letters (ξ, ζ, Σ) are never erased
  if (xReversals >= 6 && diag > 24 && pathLen / Math.max(1, diag) > 4.2) {
    return {
      isScribble: true,
      bounds: { minX: minX - 8, minY: minY - 8, maxX: maxX + 8, maxY: maxY + 8 },
    };
  }
  return { isScribble: false };
}

/**
 * Hold-to-Snap & Geometric Shape Recognizer (Line, Circle, Ellipse, Square, Rectangle, Parallelogram, Triangle).
 * Triggered automatically after ~0.42s hold in Pen, Pencil, Highlighter, or Shape tools WITHOUT lifting the Apple Pencil!
 */
export function recognizeAndSnapShape(
  rawPoints: BezierPoint[],
  forcedPreset: ShapePresetType = 'auto'
): { points: BezierPoint[]; shapeType: string } | null {
  if (rawPoints.length < 2) return null;

  const start = rawPoints[0];
  const end = rawPoints[rawPoints.length - 1];
  let totalLen = 0;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (let i = 0; i < rawPoints.length; i++) {
    if (i > 0) totalLen += distance(rawPoints[i - 1], rawPoints[i]);
    minX = Math.min(minX, rawPoints[i].x);
    minY = Math.min(minY, rawPoints[i].y);
    maxX = Math.max(maxX, rawPoints[i].x);
    maxY = Math.max(maxY, rawPoints[i].y);
  }

  // Forced presets when user picks a specific shape from the Shape toolbar
  if (forcedPreset !== 'auto' && totalLen >= 3) {
    return buildPresetShape(start, end, minX, minY, maxX, maxY, forcedPreset);
  }

  if (totalLen < 18) return null;
  const directDist = distance(start, end);
  const straightness = directDist / totalLen;

  // 1. Straight Line Test (snaps to 0°, 45°, 90° if close)
  if (straightness > 0.85) {
    let x2 = end.x;
    let y2 = end.y;
    const angleDeg = (Math.atan2(y2 - start.y, x2 - start.x) * 180) / Math.PI;
    const absAngle = Math.abs(angleDeg);

    if (absAngle < 5.5 || absAngle > 174.5) {
      y2 = start.y; // Horizontal snap
    } else if (Math.abs(absAngle - 90) < 5.5) {
      x2 = start.x; // Vertical snap
    }

    return {
      shapeType: 'line',
      points: [
        { x: start.x, y: start.y, pressure: 0.7 },
        { x: x2, y: y2, cx: (start.x + x2) / 2, cy: (start.y + y2) / 2, pressure: 0.7 },
      ],
    };
  }

  // 2. Closed Shape Test (Circle, Ellipse, Square, Rectangle, Parallelogram, Triangle)
  const w = Math.max(16, maxX - minX);
  const h = Math.max(16, maxY - minY);
  const diag = Math.hypot(w, h);
  const isClosed = directDist < totalLen * 0.35 || directDist < Math.max(52, diag * 0.32);

  if (isClosed && diag > 22) {
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = w / 2;
    const ry = h / 2;

    // Measure how closely rawPoints hug the Bounding Box vs an Inscribed Ellipse (in identical px/diag units!)
    let rectErrSum = 0;
    let ellipseDistErrSum = 0;
    let ellipseErrSum = 0;
    for (const p of rawPoints) {
      const distToBoxEdge = Math.min(
        Math.abs(p.x - minX),
        Math.abs(maxX - p.x),
        Math.abs(p.y - minY),
        Math.abs(maxY - p.y)
      );
      rectErrSum += distToBoxEdge / diag;

      const normEllipseR = Math.hypot((p.x - cx) / Math.max(1, rx), (p.y - cy) / Math.max(1, ry));
      ellipseErrSum += Math.abs(normEllipseR - 1);

      const ang = Math.atan2((p.y - cy) / Math.max(1, ry), (p.x - cx) / Math.max(1, rx));
      const ex = cx + rx * Math.cos(ang);
      const ey = cy + ry * Math.sin(ang);
      ellipseDistErrSum += Math.hypot(p.x - ex, p.y - ey) / diag;
    }
    const rectErr = rectErrSum / rawPoints.length;
    const ellipseDistErr = ellipseDistErrSum / rawPoints.length;
    const ellipseErr = ellipseErrSum / rawPoints.length;

    // Measure how close the stroke gets to the 4 corners of the bounding box:
    // - A circle/ellipse stays ~0.146 * diag away from the 4 corners of its bounding box!
    // - A square/rectangle with obvious corners goes right into the 4 corners (< 0.088 * diag).
    const boxCorners = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];
    let cornerDistSum = 0;
    for (const bc of boxCorners) {
      let minD = Infinity;
      for (const p of rawPoints) {
        const d = distance(bc, p);
        if (d < minD) minD = d;
      }
      cornerDistSum += minD / diag;
    }
    const avgBoxCornerDist = cornerDistSum / 4;

    // Count localized sharp corner bends along the stroke (arm length ~ 0.11 * diag, bend angle >= 56°):
    // Hand-drawn circles have smooth curvature (0-1 sharp bend at closure), while squares/triangles have distinct sharp corners!
    const armLen = Math.max(12, diag * 0.11);
    const sharpPeaks: BezierPoint[] = [];
    for (let i = 1; i < rawPoints.length - 1; i++) {
      const curr = rawPoints[i];
      let prevIdx = i - 1;
      while (prevIdx > 0 && distance(rawPoints[prevIdx], curr) < armLen) prevIdx--;
      let nextIdx = i + 1;
      while (nextIdx < rawPoints.length - 1 && distance(rawPoints[nextIdx], curr) < armLen) nextIdx++;

      const prev = rawPoints[prevIdx];
      const next = rawPoints[nextIdx];
      const d1 = distance(prev, curr);
      const d2 = distance(curr, next);
      if (d1 < armLen * 0.65 || d2 < armLen * 0.65) continue;

      const v1x = curr.x - prev.x,
        v1y = curr.y - prev.y;
      const v2x = next.x - curr.x,
        v2y = next.y - curr.y;
      const cosBend = (v1x * v2x + v1y * v2y) / (d1 * d2);
      // cos(56°) ≈ 0.559 -> sharp local corner bend >= 56°
      if (cosBend < 0.56) {
        if (
          sharpPeaks.length === 0 ||
          distance(sharpPeaks[sharpPeaks.length - 1], curr) > diag * 0.18
        ) {
          sharpPeaks.push(curr);
        }
      }
    }
    const sharpCornerCount = sharpPeaks.length;

    // Simplify polygon and merge nearby vertices + remove nearly-collinear points
    const rdp = rdpSimplify(rawPoints, diag * 0.072);
    const mergedCorners: BezierPoint[] = [];
    for (const pt of rdp) {
      if (mergedCorners.length === 0 || distance(mergedCorners[mergedCorners.length - 1], pt) > diag * 0.15) {
        mergedCorners.push(pt);
      }
    }
    if (mergedCorners.length > 2 && distance(mergedCorners[0], mergedCorners[mergedCorners.length - 1]) < diag * 0.22) {
      mergedCorners.pop();
    }

    // Filter out collinear mid-side vertices (require a genuinely obvious corner turn angle > 38°, cosTurn < 0.788)
    const trueCorners: BezierPoint[] = [];
    const nC = mergedCorners.length;
    if (nC >= 3) {
      for (let i = 0; i < nC; i++) {
        const prev = mergedCorners[(i - 1 + nC) % nC];
        const curr = mergedCorners[i];
        const next = mergedCorners[(i + 1) % nC];
        const v1x = curr.x - prev.x,
          v1y = curr.y - prev.y;
        const v2x = next.x - curr.x,
          v2y = next.y - curr.y;
        const m1 = Math.hypot(v1x, v1y);
        const m2 = Math.hypot(v2x, v2y);
        if (m1 < 1 || m2 < 1) continue;
        const cosTurn = (v1x * v2x + v1y * v2y) / (m1 * m2);
        if (cosTurn < 0.788) {
          trueCorners.push(curr);
        }
      }
    }

    // A. Triangle (3 distinct sharp corners and clearly not an ellipse)
    if (
      trueCorners.length === 3 &&
      sharpCornerCount >= 2 &&
      ellipseErr > 0.15 &&
      ellipseDistErr > 0.055
    ) {
      const [p0, p1, p2] = trueCorners;
      return {
        shapeType: 'triangle',
        points: makePolygonBezier([p0, p1, p2]),
      };
    }

    // B. Square / Rectangle / Parallelogram:
    // Require genuinely obvious corners (sharpCornerCount >= 3 AND stroke reaches near the 4 box corners AND hugs box edges closer than ellipse!)
    // That way, any hand-drawn circle or oval prioritizes snapping to Circle/Ellipse!
    const isBoxLike =
      sharpCornerCount >= 3 &&
      avgBoxCornerDist < 0.092 &&
      rectErr < ellipseDistErr * 0.82 &&
      ((trueCorners.length === 4 && ellipseErr > 0.165) ||
        (trueCorners.length >= 4 && rectErr < 0.055));

    if (isBoxLike) {
      if (trueCorners.length === 4) {
        const [p0, p1, p2] = trueCorners;
        const v1x = p1.x - p0.x,
          v1y = p1.y - p0.y;
        const v2x = p2.x - p1.x,
          v2y = p2.y - p1.y;
        const cosAngle =
          (v1x * v2x + v1y * v2y) / (Math.max(1, Math.hypot(v1x, v1y)) * Math.max(1, Math.hypot(v2x, v2y)));

        // Tilted Parallelogram
        if (Math.abs(cosAngle) >= 0.26) {
          const paraPts = [
            { x: p0.x, y: p0.y },
            { x: p1.x, y: p1.y },
            { x: p2.x, y: p2.y },
            { x: p0.x + (p2.x - p1.x), y: p0.y + (p2.y - p1.y) },
          ];
          return {
            shapeType: 'parallelogram',
            points: makePolygonBezier(paraPts),
          };
        }
      }

      // Check if it's a Square (width and height within 16% of each other) vs Rectangle
      const isSquare = Math.abs(w - h) < Math.max(w, h) * 0.16;
      const halfW = isSquare ? (w + h) / 4 : w / 2;
      const halfH = isSquare ? (w + h) / 4 : h / 2;
      const rectPts = [
        { x: cx - halfW, y: cy - halfH },
        { x: cx + halfW, y: cy - halfH },
        { x: cx + halfW, y: cy + halfH },
        { x: cx - halfW, y: cy + halfH },
      ];
      return {
        shapeType: 'rectangle',
        points: makePolygonBezier(rectPts),
      };
    }

    // C. Smooth closed loop -> Perfect Circle (equal radius) or Ellipse (4 cardinal 90° nodes)!
    const isCircle = Math.abs(w - h) < Math.max(w, h) * 0.28;
    const finalRx = isCircle ? (w + h) / 4 : rx;
    const finalRy = isCircle ? (w + h) / 4 : ry;
    return {
      shapeType: isCircle ? 'circle' : 'ellipse',
      points: makeEllipseBezier(cx, cy, finalRx, finalRy),
    };
  }

  // 3. Open Mathematical Curves:
  //    - Sine ('sine') & Cosine ('cosine') waves -> 2 interactive handles (Peak + Right Endpoint)
  //    - Parabola ('parabola'), Hyperbola ('hyperbola'), Circular Arc ('arc') -> 3 handles (2 Endpoints + 1 Middle)
  if (!isClosed && totalLen > 36) {
    const yMid = (minY + maxY) / 2;
    const amp = Math.max(18, h / 2);

    // A. Check if stroke is a Sine or Cosine wave (oscillates across yMid with >= 2 lobes)
    if (w > 50 && h > 20) {
      // Sort or walk points along X and count significant extrema / zero-crossings around yMid
      let crossings = 0;
      let lastSign = 0;
      const deadband = Math.max(4, amp * 0.18);
      let firstLobeSign = 0;

      for (const p of rawPoints) {
        const dy = p.y - yMid;
        if (Math.abs(dy) > deadband) {
          const sign = dy < 0 ? 1 : -1; // +1 = above midline (screen Y smaller), -1 = below midline
          if (firstLobeSign === 0) firstLobeSign = sign;
          if (lastSign !== 0 && sign !== lastSign) {
            crossings++;
          }
          lastSign = sign;
        }
      }

      // At least 1 crossing (2 half-lobes = 1 full wave period) and predominantly horizontal progression
      if (crossings >= 1 && Math.abs(end.x - start.x) > w * 0.65) {
        const halfCycles = Math.max(2, Math.min(6, crossings + 1));
        const startDistFromMid = Math.abs(start.y - yMid);
        const isCosine = startDistFromMid >= amp * 0.48;
        const leftX = Math.min(start.x, end.x);
        const rightX = Math.max(start.x, end.x);
        const spanW = Math.max(80, rightX - leftX);
        const signDir = firstLobeSign !== 0 ? firstLobeSign : 1;

        if (isCosine) {
          // Cosine wave: Peak control point at central extremum t = 1 / halfCycles
          const tPeak = 1 / halfCycles;
          const peakPt: BezierPoint = {
            x: leftX + spanW * tPeak,
            y: yMid - signDir * amp,
            pressure: 0.7,
          };
          const rightEndPt: BezierPoint = {
            x: leftX + spanW,
            y: yMid,
            pressure: 0.7,
          };
          const leftOriginPt: BezierPoint = {
            x: leftX,
            y: yMid,
            twist: halfCycles,
            pressure: 0.7,
          };
          return {
            shapeType: 'cosine',
            points: [peakPt, rightEndPt, leftOriginPt],
          };
        } else {
          // Sine wave: Peak control point at first crest t = 1 / (2 * halfCycles)
          const tPeak = 1 / (2 * halfCycles);
          const peakPt: BezierPoint = {
            x: leftX + spanW * tPeak,
            y: yMid - signDir * amp,
            pressure: 0.7,
          };
          const rightEndPt: BezierPoint = {
            x: leftX + spanW,
            y: yMid,
            pressure: 0.7,
          };
          const leftOriginPt: BezierPoint = {
            x: leftX,
            y: yMid,
            twist: halfCycles,
            pressure: 0.7,
          };
          return {
            shapeType: 'sine',
            points: [peakPt, rightEndPt, leftOriginPt],
          };
        }
      }
    }

    // B. Single-Arch Open Curve -> Symmetrical Circular Arc ('arc'), Parabola ('parabola'), or Hyperbola ('hyperbola')
    //    Strictly 3 Control Points: [Endpoint 1, Middle Apex, Endpoint 2]
    let maxPerpDist = 0;
    let apexIdx = Math.floor(rawPoints.length / 2);
    for (let i = 1; i < rawPoints.length - 1; i++) {
      const d = perpendicularDistance(rawPoints[i], start, end);
      if (d > maxPerpDist) {
        maxPerpDist = d;
        apexIdx = i;
      }
    }

    if (maxPerpDist > 14 && directDist > 28) {
      let x0 = start.x,
        y0 = start.y;
      let x2 = end.x,
        y2 = end.y;

      // Symmetrize endpoints: if chord is nearly horizontal or vertical (within 16°), level the endpoints!
      const chordAngleDeg = (Math.atan2(y2 - y0, x2 - x0) * 180) / Math.PI;
      const absChordDeg = Math.abs(chordAngleDeg);
      if (absChordDeg < 16 || absChordDeg > 164) {
        const avgY = (y0 + y2) / 2;
        y0 = avgY;
        y2 = avgY;
      } else if (Math.abs(absChordDeg - 90) < 16) {
        const avgX = (x0 + x2) / 2;
        x0 = avgX;
        x2 = avgX;
      }

      const chordMidX = (x0 + x2) / 2;
      const chordMidY = (y0 + y2) / 2;
      const cdx = x2 - x0;
      const cdy = y2 - y0;
      const chordLen = Math.max(20, Math.hypot(cdx, cdy));
      // Unit normal perpendicular to chord
      const nx = -cdy / chordLen;
      const ny = cdx / chordLen;

      const rawApex = rawPoints[apexIdx];
      const signedH = (rawApex.x - chordMidX) * nx + (rawApex.y - chordMidY) * ny;
      const symMidX = chordMidX + nx * signedH;
      const symMidY = chordMidY + ny * signedH;

      // Measure width at half-height (0.5 * signedH) to distinguish Arc vs Parabola vs Hyperbola
      const halfH = signedH * 0.5;
      let minHalfProj = Infinity;
      let maxHalfProj = -Infinity;
      const ux = cdx / chordLen;
      const uy = cdy / chordLen;

      for (const p of rawPoints) {
        const pH = (p.x - chordMidX) * nx + (p.y - chordMidY) * ny;
        if (Math.abs(pH - halfH) < Math.abs(signedH) * 0.22) {
          const projU = (p.x - chordMidX) * ux + (p.y - chordMidY) * uy;
          if (projU < minHalfProj) minHalfProj = projU;
          if (projU > maxHalfProj) maxHalfProj = projU;
        }
      }

      const halfWidthRatio =
        maxHalfProj > minHalfProj ? (maxHalfProj - minHalfProj) / chordLen : 0.7;
      const archRatio = Math.abs(signedH) / chordLen;

      let curveType: 'arc' | 'parabola' | 'hyperbola' = 'parabola';
      if (archRatio < 0.36 || halfWidthRatio > 0.77) {
        curveType = 'arc';
      } else if (halfWidthRatio < 0.61) {
        curveType = 'hyperbola';
      } else {
        curveType = 'parabola';
      }

      return {
        shapeType: curveType,
        points: [
          { x: x0, y: y0, pressure: 0.7 },
          { x: symMidX, y: symMidY, pressure: 0.7 },
          { x: x2, y: y2, pressure: 0.7 },
        ],
      };
    }
  }

  return null;
}

export function makePolygonBezier(corners: { x: number; y: number }[]): BezierPoint[] {
  const pts: BezierPoint[] = [{ x: corners[0].x, y: corners[0].y, pressure: 0.7 }];
  for (let i = 1; i <= corners.length; i++) {
    const curr = corners[i % corners.length];
    pts.push({
      x: curr.x,
      y: curr.y,
      pressure: 0.7,
    });
  }
  return pts;
}

export function makeEllipseBezier(cx: number, cy: number, rx: number, ry: number): BezierPoint[] {
  // Strictly 4 cardinal nodes every 90 degrees (Top 270°, Right 0°, Bottom 90°, Left 180°)
  return [
    { x: cx, y: cy - ry, pressure: 0.7 },
    { x: cx + rx, y: cy, pressure: 0.7 },
    { x: cx, y: cy + ry, pressure: 0.7 },
    { x: cx - rx, y: cy, pressure: 0.7 },
  ];
}

/**
 * Computes the high-precision polyline points for a Physics Resistor ('resistor' with 10 zig-zag peaks/valleys)
 * or Helical Coiled Spring ('spring' with 9 full coils / σπείρες) mapped onto the 4 bounding quad corners.
 * Supports 360° rotation, proportional corner scaling, and independent width/height side stretching!
 */
export function computeResistorOrSpringPoints(
  shapeType: 'resistor' | 'spring',
  corners: BezierPoint[]
): BezierPoint[] {
  if (corners.length < 4) return corners;
  const [q0, q1, q2, q3] = corners;
  const bilerp = (u: number, v: number): BezierPoint => ({
    x: (1 - u) * (1 - v) * q0.x + u * (1 - v) * q1.x + u * v * q2.x + (1 - u) * v * q3.x,
    y: (1 - u) * (1 - v) * q0.y + u * (1 - v) * q1.y + u * v * q2.y + (1 - u) * v * q3.y,
    pressure: 0.7,
  });

  if (shapeType === 'resistor') {
    // 10 zig-zag peaks/valleys (5 top crests + 5 bottom troughs) with straight lead terminals on both ends
    const uStart = 0.12;
    const uEnd = 0.88;
    const uSpan = uEnd - uStart;
    const numPeaks = 10;
    const out: BezierPoint[] = [bilerp(0, 0.5), bilerp(uStart, 0.5)];
    for (let k = 0; k < numPeaks; k++) {
      const u = uStart + ((k + 0.5) / numPeaks) * uSpan;
      const v = k % 2 === 0 ? 0.04 : 0.96;
      out.push(bilerp(u, v));
    }
    out.push(bilerp(uEnd, 0.5));
    out.push(bilerp(1, 0.5));
    return out;
  }

  // Helical coiled spring ('spring') with 9 full inner coils (σπείρες) and straight lead ends
  const uStart = 0.08;
  const uEnd = 0.92;
  const numCoils = 9;
  const ru = 0.038;
  const rv = 0.46;
  const theta0 = -Math.PI / 2;
  const theta1 = 2 * Math.PI * numCoils + Math.PI / 2;
  const dTheta = theta1 - theta0;
  const steps = 216;

  const out: BezierPoint[] = [bilerp(0, 0.5)];
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const theta = theta0 + s * dTheta;
    const uBase = uStart + ru + s * (uEnd - ru - (uStart + ru));
    const u = uBase + ru * Math.sin(theta);
    const v = 0.5 - rv * Math.cos(theta);
    out.push(bilerp(u, v));
  }
  out.push(bilerp(1, 0.5));
  return out;
}

function buildPresetShape(
  start: BezierPoint,
  end: BezierPoint,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  preset: ShapePresetType
): { points: BezierPoint[]; shapeType: string } {
  const w = Math.max(40, maxX - minX);
  const h = Math.max(32, maxY - minY);
  if (preset === 'line' || preset === 'arrow' || preset === 'double-arrow') {
    let x2 = end.x;
    let y2 = end.y;
    const angleDeg = (Math.atan2(y2 - start.y, x2 - start.x) * 180) / Math.PI;
    const absAngle = Math.abs(angleDeg);
    if (absAngle < 5.5 || absAngle > 174.5) {
      y2 = start.y;
    } else if (Math.abs(absAngle - 90) < 5.5) {
      x2 = start.x;
    }
    return {
      shapeType: preset,
      points: [
        { x: start.x, y: start.y, pressure: 0.7 },
        { x: x2, y: y2, cx: (start.x + x2) / 2, cy: (start.y + y2) / 2, pressure: 0.7 },
      ],
    };
  }
  if (preset === 'sine') {
    const yAxis = (minY + maxY) / 2;
    const amp = Math.max(24, h / 2);
    return {
      shapeType: 'sine',
      points: [
        { x: minX + w * 0.25, y: yAxis - amp, pressure: 0.7 }, // Handle 0: Peak (up/down only)
        { x: minX + w, y: yAxis, pressure: 0.7 }, // Handle 1: Right Endpoint (left/right only)
        { x: minX, y: yAxis, twist: 2, pressure: 0.7 }, // Origin anchor
      ],
    };
  }
  if (preset === 'cosine') {
    const yAxis = (minY + maxY) / 2;
    const amp = Math.max(24, h / 2);
    return {
      shapeType: 'cosine',
      points: [
        { x: minX + w * 0.5, y: yAxis - amp, pressure: 0.7 }, // Handle 0: Peak (up/down only)
        { x: minX + w, y: yAxis, pressure: 0.7 }, // Handle 1: Right Endpoint (left/right only)
        { x: minX, y: yAxis, twist: 2, pressure: 0.7 }, // Origin anchor
      ],
    };
  }
  if (preset === 'parabola' || preset === 'hyperbola' || preset === 'arc') {
    const isInverted = start.y > minY + h * 0.5 && end.y > minY + h * 0.5;
    const yEnds = isInverted ? minY + h : minY;
    const yVertex = isInverted ? minY : minY + h;
    return {
      shapeType: preset,
      points: [
        { x: minX, y: yEnds, pressure: 0.7 },
        { x: minX + w / 2, y: yVertex, pressure: 0.7 },
        { x: minX + w, y: yEnds, pressure: 0.7 },
      ],
    };
  }
  if (preset === 'cuboid' || preset === 'cylinder' || preset === 'sphere' || preset === 'pyramid') {
    const w3d = Math.max(72, maxX - minX);
    const h3d = Math.max(72, maxY - minY);
    const cx = minX + w3d / 2;
    const cy = minY + h3d / 2;
    const isNearSquare = Math.abs(w3d - h3d) < Math.max(w3d, h3d) * 0.24;
    const finalW = preset === 'sphere' || (preset === 'cuboid' && isNearSquare) ? (w3d + h3d) / 2 : w3d;
    const finalH = preset === 'sphere' || (preset === 'cuboid' && isNearSquare) ? (w3d + h3d) / 2 : h3d;
    const halfW = finalW / 2;
    const halfH = finalH / 2;
    return {
      shapeType: preset,
      points: makePolygonBezier([
        { x: cx - halfW, y: cy - halfH },
        { x: cx + halfW, y: cy - halfH },
        { x: cx + halfW, y: cy + halfH },
        { x: cx - halfW, y: cy + halfH },
      ]),
    };
  }
  if (preset === 'resistor' || preset === 'spring') {
    const rawW = maxX - minX;
    const rawH = maxY - minY;
    const isVertical = rawH > rawW * 1.35;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    if (isVertical) {
      const spanLen = Math.max(120, rawH);
      const defaultThick = Math.max(42, Math.min(72, spanLen * 0.3));
      const thick = rawW < 32 ? defaultThick : Math.max(38, rawW);
      const halfW = thick / 2;
      const halfH = spanLen / 2;
      return {
        shapeType: preset,
        points: makePolygonBezier([
          { x: cx + halfW, y: cy - halfH },
          { x: cx + halfW, y: cy + halfH },
          { x: cx - halfW, y: cy + halfH },
          { x: cx - halfW, y: cy - halfH },
        ]),
      };
    } else {
      const spanLen = Math.max(120, rawW);
      const defaultThick = Math.max(42, Math.min(72, spanLen * 0.3));
      const thick = rawH < 32 ? defaultThick : Math.max(38, rawH);
      const halfW = spanLen / 2;
      const halfH = thick / 2;
      return {
        shapeType: preset,
        points: makePolygonBezier([
          { x: cx - halfW, y: cy - halfH },
          { x: cx + halfW, y: cy - halfH },
          { x: cx + halfW, y: cy + halfH },
          { x: cx - halfW, y: cy + halfH },
        ]),
      };
    }
  }
  if (preset === 'rectangle') {
    return {
      shapeType: 'rectangle',
      points: makePolygonBezier([
        { x: minX, y: minY },
        { x: minX + w, y: minY },
        { x: minX + w, y: minY + h },
        { x: minX, y: minY + h },
      ]),
    };
  }
  if (preset === 'parallelogram') {
    const skew = Math.min(w * 0.25, 45);
    return {
      shapeType: 'parallelogram',
      points: makePolygonBezier([
        { x: minX + skew, y: minY },
        { x: minX + w, y: minY },
        { x: minX + w - skew, y: minY + h },
        { x: minX, y: minY + h },
      ]),
    };
  }
  if (preset === 'triangle') {
    return {
      shapeType: 'triangle',
      points: makePolygonBezier([
        { x: minX + w / 2, y: minY },
        { x: minX + w, y: minY + h },
        { x: minX, y: minY + h },
      ]),
    };
  }
  return {
    shapeType: 'ellipse',
    points: makeEllipseBezier(minX + w / 2, minY + h / 2, w / 2, h / 2),
  };
}

/**
 * Generates multi-stroke grouped Physics Stencils (e.g. Cylindrical Conductor, Coordinate Axes, Resistor)
 */
export function createPhysicsStencilStrokes(
  preset: 'cylinder' | 'axes' | 'resistor',
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  layerId: string
): StrokeObject[] {
  const groupId = `group-${Date.now()}`;
  const out: StrokeObject[] = [];

  if (preset === 'cylinder') {
    // Cylindrical conductor like the user's "Ένταση Ηλεκτρικού Ρεύματος" diagram!
    const rx = Math.max(16, Math.min(36, w * 0.08));
    const ry = h / 2;
    const leftCx = x + rx;
    const rightCx = x + w - rx;
    const midCx = (leftCx + rightCx) / 2;
    const cy = y + ry;

    // Top & bottom horizontal lines
    out.push({
      id: `st-${Date.now()}-1`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x: leftCx, y: y, pressure: 0.7 },
        { x: rightCx, y: y, cx: midCx, cy: y, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
    });
    out.push({
      id: `st-${Date.now()}-2`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: [
        { x: leftCx, y: y + h, pressure: 0.7 },
        { x: rightCx, y: y + h, cx: midCx, cy: y + h, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
    });
    // Left, Middle (yellow filled cross-section!), and Right ellipses
    out.push({
      id: `st-${Date.now()}-3`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: makeEllipseBezier(leftCx, cy, rx, ry),
      layerId,
      groupId,
      isShape: true,
    });
    out.push({
      id: `st-${Date.now()}-4`,
      tool: 'pen',
      color,
      fillColor: '#fef08a',
      fillStyle: 'solid',
      width: 2.8,
      opacity: 1,
      points: makeEllipseBezier(midCx, cy, rx, ry),
      layerId,
      groupId,
      isShape: true,
    });
    out.push({
      id: `st-${Date.now()}-5`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: makeEllipseBezier(rightCx, cy, rx, ry),
      layerId,
      groupId,
      isShape: true,
    });
  } else if (preset === 'axes') {
    // X and Y axes with arrows
    out.push({
      id: `st-${Date.now()}-ax1`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x, y: y + h, pressure: 0.7 },
        { x: x + w, y: y + h, cx: x + w / 2, cy: y + h, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
    });
    out.push({
      id: `st-${Date.now()}-ax2`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x, y: y + h, pressure: 0.7 },
        { x, y, cx: x, cy: y + h / 2, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
    });
  } else if (preset === 'resistor') {
    const corners = makePolygonBezier([
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ]);
    out.push({
      id: `st-${Date.now()}-res`,
      tool: 'pen',
      color,
      width: 2.8,
      opacity: 1,
      points: corners,
      layerId,
      groupId,
      isShape: true,
      shapeType: 'resistor',
    });
  }

  return out;
}

/**
 * Zero-AI Greek Handwriting Beautifier & Math Symbol Straightener:
 * - Aligns word baselines horizontally
 * - Applies Laplacian curve smoothing to Bezier control points
 * - Automatically straightens horizontal bars (fractions, equals '=' signs)
 */
export function beautifyHandwritingStrokes(strokes: StrokeObject[]): StrokeObject[] {
  if (strokes.length === 0) return strokes;

  // Compute global baseline average for the selected strokes
  const bboxes = strokes.map((s) => {
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
    return { id: s.id, minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
  });

  // Group strokes into horizontal text rows
  const sortedByY = [...bboxes].sort((a, b) => a.maxY - b.maxY);
  const rows: (typeof bboxes)[] = [];
  for (const box of sortedByY) {
    const existingRow = rows.find((r) => {
      const avgMaxY = r.reduce((acc, item) => acc + item.maxY, 0) / r.length;
      return Math.abs(box.maxY - avgMaxY) < 28;
    });
    if (existingRow) existingRow.push(box);
    else rows.push([box]);
  }

  const dyByStroke = new Map<string, number>();
  for (const row of rows) {
    const targetBaseline = row.reduce((acc, item) => acc + item.maxY, 0) / row.length;
    // Snap targetBaseline to nearest 24px grid line for extra neatness
    const snappedBaseline = Math.round(targetBaseline / 24) * 24;
    for (const item of row) {
      // Only shift normal character strokes, not tall brackets/fractions
      if (item.h < 55) {
        dyByStroke.set(item.id, (snappedBaseline - item.maxY) * 0.45);
      }
    }
  }

  return strokes.map((stroke) => {
    const box = bboxes.find((b) => b.id === stroke.id)!;
    const dy = dyByStroke.get(stroke.id) ?? 0;

    // Check if stroke is a horizontal bar (fraction bar, minus, or part of '=')
    if (box.w > 14 && box.h < box.w * 0.22 && stroke.points.length >= 2) {
      const midY = (box.minY + box.maxY) / 2 + dy;
      return {
        ...stroke,
        points: [
          { x: box.minX, y: midY, pressure: 0.7 },
          { x: box.maxX, y: midY, cx: (box.minX + box.maxX) / 2, cy: midY, pressure: 0.7 },
        ],
      };
    }

    // Apply gentle Laplacian smoothing + baseline alignment while preserving user's Greek handwriting style
    const pts = stroke.points.map((p) => ({ ...p, y: p.y + dy, cy: p.cy !== undefined ? p.cy + dy : undefined }));
    if (pts.length >= 3) {
      for (let i = 1; i < pts.length - 1; i++) {
        pts[i].x = pts[i].x * 0.7 + ((pts[i - 1].x + pts[i + 1].x) / 2) * 0.3;
        pts[i].y = pts[i].y * 0.7 + ((pts[i - 1].y + pts[i + 1].y) / 2) * 0.3;
        if (pts[i].cx !== undefined && pts[i].cy !== undefined) {
          pts[i].cx = (pts[i - 1].x + pts[i].x) / 2;
          pts[i].cy = (pts[i - 1].y + pts[i].y) / 2;
        }
      }
    }

    return {
      ...stroke,
      points: pts,
    };
  });
}

/**
 * Photoshop 1-Click Transparent Background (Zero-AI Color-to-Alpha + Flood Fill Magic Wand)
 */
export async function removeImageBackground(
  dataUrl: string,
  mode: 'all-white' | 'outer-flood' = 'all-white',
  tolerance = 42
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample corner pixel as background reference color (usually white/light grey paper)
      const bgR = data[0] > 180 ? data[0] : 255;
      const bgG = data[1] > 180 ? data[1] : 255;
      const bgB = data[2] > 180 ? data[2] : 255;

      const colorDist = (idx: number) => {
        const dr = data[idx] - bgR;
        const dg = data[idx + 1] - bgG;
        const db = data[idx + 2] - bgB;
        return Math.sqrt(dr * dr + dg * dg + db * db);
      };

      if (mode === 'all-white') {
        const lowT = tolerance * 0.7;
        const highT = tolerance * 1.65;
        for (let i = 0; i < data.length; i += 4) {
          const d = colorDist(i);
          if (d <= lowT) {
            data[i + 3] = 0;
          } else if (d < highT) {
            // Smooth anti-aliased alpha transition so black diagram lines stay razor-sharp
            const factor = (d - lowT) / (highT - lowT);
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
        }
      } else {
        // Outer Flood-Fill (Magic Wand from image borders - keeps white insides of shapes opaque!)
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];
        for (let x = 0; x < w; x++) {
          queue.push(x, (h - 1) * w + x);
        }
        for (let y = 0; y < h; y++) {
          queue.push(y * w, y * w + (w - 1));
        }

        while (queue.length > 0) {
          const pIdx = queue.pop()!;
          if (visited[pIdx]) continue;
          visited[pIdx] = 1;
          const byteIdx = pIdx * 4;
          const d = colorDist(byteIdx);
          if (d <= tolerance * 1.35) {
            data[byteIdx + 3] = d <= tolerance * 0.8 ? 0 : Math.round(255 * ((d - tolerance * 0.8) / (tolerance * 0.55)));
            const px = pIdx % w;
            const py = Math.floor(pIdx / w);
            if (px > 0 && !visited[pIdx - 1]) queue.push(pIdx - 1);
            if (px < w - 1 && !visited[pIdx + 1]) queue.push(pIdx + 1);
            if (py > 0 && !visited[pIdx - w]) queue.push(pIdx - w);
            if (py < h - 1 && !visited[pIdx + w]) queue.push(pIdx + w);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Photoshop Magnetic Lasso: Computes Sobel Edge Gradient Map and snaps cursor to strongest contour edge.
 */
export function computeImageSobelEdgeMap(imgElement: HTMLImageElement, width: number, height: number): Float32Array {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const edgeMap = new Float32Array(w * h);
  if (!ctx) return edgeMap;

  ctx.drawImage(imgElement, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -gray[(y - 1) * w + (x - 1)] +
        gray[(y - 1) * w + (x + 1)] -
        2 * gray[y * w + (x - 1)] +
        2 * gray[y * w + (x + 1)] -
        gray[(y + 1) * w + (x - 1)] +
        gray[(y + 1) * w + (x + 1)];
      const gy =
        -gray[(y - 1) * w + (x - 1)] -
        2 * gray[(y - 1) * w + x] -
        gray[(y - 1) * w + (x + 1)] +
        gray[(y + 1) * w + (x - 1)] +
        2 * gray[(y + 1) * w + x] +
        gray[(y + 1) * w + (x + 1)];
      edgeMap[y * w + x] = Math.hypot(gx, gy);
    }
  }
  return edgeMap;
}

export function snapMagneticLassoPoint(
  localX: number,
  localY: number,
  edgeMap: Float32Array,
  w: number,
  h: number,
  searchRadius = 18
): { x: number; y: number } {
  const cx = Math.round(localX);
  const cy = Math.round(localY);
  let bestScore = -1;
  let bestX = localX;
  let bestY = localY;

  const r = Math.round(searchRadius);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist > searchRadius) continue;
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 1 || nx >= w - 1 || ny < 1 || ny >= h - 1) continue;
      const grad = edgeMap[ny * w + nx];
      // Weight strong edges while slightly preferring closer pixels
      const score = grad * (1 - (dist / (searchRadius * 1.4)) * 0.35);
      if (score > bestScore && grad > 35) {
        bestScore = score;
        bestX = nx;
        bestY = ny;
      }
    }
  }

  return { x: bestX, y: bestY };
}

/**
 * Offline Symbolic/Numeric CAS Equation Solver (Zero-AI, 100% Free & Instant)
 */
export function solveMathExpressionOffline(input: string): { latex: string; solution: string } {
  const clean = input.trim();
  // Check if linear equation in 1 variable e.g. "15 * t = 90" or "20 * 3600 / 1000"
  if (clean.includes('=')) {
    const [lhs, rhs] = clean.split('=').map((s) => s.trim());
    // Find variable name (t, x, I, q, u, v)
    const varMatch = clean.match(/[a-zA-Zα-ωΑ-Ω]+/);
    if (varMatch && lhs && rhs) {
      const v = varMatch[0];
      // Evaluate f(v) = lhs - (rhs) at v=0 and v=1 to solve linear equation a*v + b = 0
      const evalAt = (val: number) => {
        const expr = `(${lhs.replace(new RegExp(v, 'g'), `(${val})`)}) - (${rhs.replace(new RegExp(v, 'g'), `(${val})`)})`
          .replace(/⋅|·/g, '*')
          .replace(/:/g, '/');
        return Function(`"use strict"; return (${expr});`)() as number;
      };
      try {
        const f0 = evalAt(0);
        const f1 = evalAt(1);
        const a = f1 - f0;
        if (Math.abs(a) > 1e-9) {
          const sol = -f0 / a;
          const rounded = Math.round(sol * 1000) / 1000;
          return {
            latex: `${clean.replace(/\*/g, ' \\cdot ')} \\implies ${v} = ${rounded}`,
            solution: `${v} = ${rounded}`,
          };
        }
      } catch {
        // Fallback below
      }
    }
  }

  try {
    const safeExpr = clean.replace(/⋅|·/g, '*').replace(/=/g, '');
    const val = Function(`"use strict"; return (${safeExpr});`)();
    if (typeof val === 'number' && !Number.isNaN(val)) {
      const rounded = Math.round(val * 1000) / 1000;
      return {
        latex: `${clean.replace(/\*/g, ' \\cdot ')} = ${rounded}`,
        solution: `${rounded}`,
      };
    }
  } catch {
    // Non-numeric expression
  }

  return {
    latex: clean,
    solution: clean,
  };
}

/**
 * Extracts a sparse, meaningful set of Key Node indices for a freehand stroke:
 * - Always includes the 2 endpoints (index 0 and index n - 1)
 * - Places interior nodes strictly at distinct peaks, valleys, and sharp turning corners ("διακριτές κορυφές")
 *   (e.g. ~5 interior peaks -> ~7 total nodes for a multi-peak wave, and capped at 8-10 nodes even for complex lines).
 */
export function computeFreehandKeyNodeIndices(pts: BezierPoint[]): number[] {
  const n = pts.length;
  if (n === 0) return [];
  if (n === 1) return [0];
  if (n === 2) return [0, 1];
  if (n <= 5) return pts.map((_, idx) => idx);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const cumLen = new Float64Array(n);
  cumLen[0] = 0;

  for (let i = 0; i < n; i++) {
    const p = pts[i];
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    if (i > 0) {
      cumLen[i] = cumLen[i - 1] + distance(pts[i - 1], p);
    }
  }

  const totalLen = cumLen[n - 1];
  const diag = Math.hypot(maxX - minX, maxY - minY);
  if (totalLen < 24 || diag < 16) {
    return [0, Math.floor((n - 1) / 2), n - 1];
  }

  // Lightly smooth a copy of points (3 passes) so 1-2px hand tremor never triggers false peaks
  let sm = pts.map((p) => ({ x: p.x, y: p.y }));
  for (let pass = 0; pass < 3; pass++) {
    const next = sm.map((p) => ({ ...p }));
    for (let i = 1; i < n - 1; i++) {
      next[i].x = 0.25 * sm[i - 1].x + 0.5 * sm[i].x + 0.25 * sm[i + 1].x;
      next[i].y = 0.25 * sm[i - 1].y + 0.5 * sm[i].y + 0.25 * sm[i + 1].y;
    }
    sm = next;
  }

  // 1. Compute local turning angle (0..180 deg) at each interior point over an arc-length window
  const lookDist = Math.max(10, Math.min(28, diag * 0.09, totalLen * 0.065));
  const turnDeg = new Float64Array(n);
  for (let i = 1; i < n - 1; i++) {
    let prev = i - 1;
    while (prev > 0 && cumLen[i] - cumLen[prev] < lookDist) prev--;
    let next = i + 1;
    while (next < n - 1 && cumLen[next] - cumLen[i] < lookDist) next++;

    const v1x = sm[i].x - sm[prev].x;
    const v1y = sm[i].y - sm[prev].y;
    const v2x = sm[next].x - sm[i].x;
    const v2y = sm[next].y - sm[i].y;
    const m1 = Math.hypot(v1x, v1y);
    const m2 = Math.hypot(v2x, v2y);
    if (m1 > 1e-3 && m2 > 1e-3) {
      const cosA = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)));
      turnDeg[i] = (Math.acos(cosA) * 180) / Math.PI;
    }
  }

  // 2. Hysteresis 1D Local Extrema detector (finds true crests & troughs without slope noise)
  const findHysteresisExtrema = (coord: 'x' | 'y', prom: number): { idx: number; prominence: number }[] => {
    const out: { idx: number; prominence: number }[] = [];
    let minVal = sm[0][coord];
    let maxVal = sm[0][coord];
    let minIdx = 0;
    let maxIdx = 0;
    let mode: 'max' | 'min' | 'both' = 'both';

    for (let i = 1; i < n; i++) {
      const v = sm[i][coord];
      if (mode === 'both') {
        if (v > maxVal) {
          maxVal = v;
          maxIdx = i;
        }
        if (v < minVal) {
          minVal = v;
          minIdx = i;
        }
        if (maxVal - v >= prom && maxIdx > 0) {
          out.push({ idx: maxIdx, prominence: maxVal - minVal });
          minVal = v;
          minIdx = i;
          mode = 'min';
        } else if (v - minVal >= prom && minIdx > 0) {
          out.push({ idx: minIdx, prominence: maxVal - minVal });
          maxVal = v;
          maxIdx = i;
          mode = 'max';
        }
      } else if (mode === 'max') {
        if (v > maxVal) {
          maxVal = v;
          maxIdx = i;
        } else if (maxVal - v >= prom) {
          out.push({ idx: maxIdx, prominence: maxVal - minVal });
          minVal = v;
          minIdx = i;
          mode = 'min';
        }
      } else {
        if (v < minVal) {
          minVal = v;
          minIdx = i;
        } else if (v - minVal >= prom) {
          out.push({ idx: minIdx, prominence: maxVal - minVal });
          maxVal = v;
          maxIdx = i;
          mode = 'max';
        }
      }
    }
    return out;
  };

  const prominenceThreshold = Math.max(5.5, diag * 0.042);
  const yExtrema = findHysteresisExtrema('y', prominenceThreshold);
  const xExtrema = findHysteresisExtrema('x', prominenceThreshold * 1.15);

  const candidateMap = new Map<number, number>(); // idx -> score
  const minEndArc = Math.max(12, Math.min(30, totalLen * 0.055));

  const addCandidate = (rawIdx: number, bonusScore: number) => {
    // Refine within a small local neighborhood to sit right on the sharpest apex of the peak
    let bestIdx = rawIdx;
    let bestTurn = turnDeg[rawIdx];
    for (let j = Math.max(1, rawIdx - 4); j <= Math.min(n - 2, rawIdx + 4); j++) {
      if (Math.abs(cumLen[j] - cumLen[rawIdx]) <= lookDist * 0.65 && turnDeg[j] > bestTurn * 1.05) {
        bestTurn = turnDeg[j];
        bestIdx = j;
      }
    }
    if (cumLen[bestIdx] < minEndArc || totalLen - cumLen[bestIdx] < minEndArc) return;
    const score = bestTurn + bonusScore;
    const prevScore = candidateMap.get(bestIdx) ?? -1;
    if (score > prevScore) {
      candidateMap.set(bestIdx, score);
    }
  };

  for (const ex of yExtrema) addCandidate(ex.idx, 45 + Math.min(40, ex.prominence * 0.4));
  for (const ex of xExtrema) addCandidate(ex.idx, 35 + Math.min(35, ex.prominence * 0.35));

  // Also include sharp local turning-angle peaks (e.g., diagonal corners that don't reverse X or Y)
  for (let i = 2; i < n - 2; i++) {
    if (turnDeg[i] >= 36 && turnDeg[i] >= turnDeg[i - 1] && turnDeg[i] >= turnDeg[i + 1]) {
      addCandidate(i, 15);
    }
  }

  // 3. Sort candidates along the stroke and merge any candidates that are too close to each other
  const sortedCandidates = Array.from(candidateMap.entries())
    .map(([idx, score]) => ({ idx, score }))
    .sort((a, b) => a.idx - b.idx);

  const minNodeArc = Math.max(16, Math.min(40, totalLen * 0.068, diag * 0.095));
  const minNodeEuclid = Math.max(12, diag * 0.065);
  const merged: { idx: number; score: number }[] = [];

  for (const cand of sortedCandidates) {
    if (merged.length === 0) {
      merged.push(cand);
      continue;
    }
    const prev = merged[merged.length - 1];
    const arcDiff = cumLen[cand.idx] - cumLen[prev.idx];
    const euclidDiff = distance(pts[cand.idx], pts[prev.idx]);
    if (arcDiff < minNodeArc || euclidDiff < minNodeEuclid) {
      if (cand.score > prev.score) {
        merged[merged.length - 1] = cand;
      }
    } else {
      merged.push(cand);
    }
  }

  // 4. Cap maximum interior nodes so even very complex lines have a clean, small set of nodes (e.g. <= 7 interior + 2 ends = <= 9 nodes)
  const maxInterior = totalLen > diag * 3.2 ? 7 : 6;
  let finalInteriorIndices: number[];
  if (merged.length > maxInterior) {
    finalInteriorIndices = [...merged]
      .sort((a, b) => b.score - a.score)
      .slice(0, maxInterior)
      .map((c) => c.idx)
      .sort((a, b) => a - b);
  } else {
    finalInteriorIndices = merged.map((c) => c.idx);
  }

  // 5. Fallback for smooth single-arch or gentle curves that had 0 or 1 extrema:
  //    Add the point(s) of maximum perpendicular deviation from the chord so the user still has 1-2 middle nodes to bend the line!
  if (finalInteriorIndices.length === 0) {
    let bestIdx = Math.floor((n - 1) / 2);
    let maxDev = -1;
    for (let i = 1; i < n - 1; i++) {
      const d = perpendicularDistance(pts[i], pts[0], pts[n - 1]);
      if (d > maxDev) {
        maxDev = d;
        bestIdx = i;
      }
    }
    if (totalLen >= 80 && n >= 7) {
      const q1 = Math.max(1, Math.floor((n - 1) / 3));
      const q2 = Math.min(n - 2, Math.floor(((n - 1) * 2) / 3));
      finalInteriorIndices = q1 !== q2 ? [q1, q2] : [bestIdx];
    } else {
      finalInteriorIndices = [bestIdx];
    }
  }

  return [0, ...finalInteriorIndices, n - 1];
}

/**
 * Smoothly deforms a freehand stroke when the user drags one of its sparse Key Nodes (`keyNodePosIdx`),
 * using a C1-continuous Cosine Hermite bell curve anchored at the neighboring key nodes (`keyNodePosIdx - 1` and `keyNodePosIdx + 1`).
 */
export function deformStrokeAtKeyNode(
  pts: BezierPoint[],
  keyNodeIndices: number[],
  keyNodePosIdx: number,
  targetX: number,
  targetY: number
): BezierPoint[] {
  const n = pts.length;
  if (n === 0 || keyNodePosIdx < 0 || keyNodePosIdx >= keyNodeIndices.length) return pts;

  const centerIdx = Math.max(0, Math.min(n - 1, keyNodeIndices[keyNodePosIdx]));
  const dx = targetX - pts[centerIdx].x;
  const dy = targetY - pts[centerIdx].y;
  if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) return pts;

  const leftIdx = keyNodePosIdx > 0 ? Math.max(0, keyNodeIndices[keyNodePosIdx - 1]) : 0;
  const rightIdx =
    keyNodePosIdx < keyNodeIndices.length - 1
      ? Math.min(n - 1, keyNodeIndices[keyNodePosIdx + 1])
      : n - 1;

  // Precompute cumulative arc lengths along [leftIdx .. rightIdx]
  const cum = new Float64Array(n);
  for (let i = leftIdx + 1; i <= rightIdx; i++) {
    cum[i] = cum[i - 1] + distance(pts[i - 1], pts[i]);
  }

  const leftSpan = Math.max(1e-4, cum[centerIdx] - cum[leftIdx]);
  const rightSpan = Math.max(1e-4, cum[rightIdx] - cum[centerIdx]);

  const weights = new Float64Array(n);
  weights[centerIdx] = 1.0;

  if (centerIdx > leftIdx) {
    for (let i = leftIdx; i < centerIdx; i++) {
      if (keyNodePosIdx === 0 && i === leftIdx) {
        weights[i] = 1.0;
      } else {
        const u = (cum[i] - cum[leftIdx]) / leftSpan; // 0 at leftIdx -> 1 at centerIdx
        weights[i] = 0.5 - 0.5 * Math.cos(Math.PI * u);
      }
    }
  }

  if (rightIdx > centerIdx) {
    for (let i = centerIdx + 1; i <= rightIdx; i++) {
      if (keyNodePosIdx === keyNodeIndices.length - 1 && i === rightIdx) {
        weights[i] = 1.0;
      } else {
        const v = (cum[i] - cum[centerIdx]) / rightSpan; // 0 at centerIdx -> 1 at rightIdx
        weights[i] = 0.5 + 0.5 * Math.cos(Math.PI * v);
      }
    }
  }

  return pts.map((p, i) => {
    const w = weights[i];
    const wPrev = i > 0 ? weights[i - 1] : w;
    const wCtrl = 0.5 * (wPrev + w);
    if (w === 0 && wCtrl === 0) return p;
    return {
      ...p,
      x: p.x + w * dx,
      y: p.y + w * dy,
      cx: p.cx !== undefined ? p.cx + wCtrl * dx : undefined,
      cy: p.cy !== undefined ? p.cy + wCtrl * dy : undefined,
    };
  });
}

/**
 * Checks whether a freehand stroke forms a closed (or nearly closed) loop where one end touches/approaches the other,
 * so it can be filled automatically when drawn with Fill ON (without waiting for Hold-to-Snap!) or toggled via Lasso.
 */
export function isFreehandLoopClosed(pts: BezierPoint[], lenientForManualToggle = false): boolean {
  const n = pts.length;
  if (n < 5) return false;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let totalLen = 0;

  for (let i = 0; i < n; i++) {
    const p = pts[i];
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    if (i > 0) {
      totalLen += distance(pts[i - 1], p);
    }
  }

  const w = maxX - minX;
  const h = maxY - minY;
  const diag = Math.hypot(w, h);

  // Must have a meaningful 2D area (not a tiny dot or flat straight line)
  if (diag < 18 || Math.min(w, h) < 8 || totalLen < Math.max(45, diag * 1.4)) {
    return false;
  }

  const directDist = distance(pts[0], pts[n - 1]);
  const closeThreshold = lenientForManualToggle
    ? Math.max(68, diag * 0.48, totalLen * 0.22)
    : Math.max(44, diag * 0.32, totalLen * 0.16);

  if (directDist <= closeThreshold) {
    return true;
  }

  // Also check if the ending tail crossed or touched near the starting tail (first 20% vs last 20% of points)
  const headCount = Math.max(2, Math.floor(n * 0.2));
  const tailStart = Math.min(n - 2, Math.ceil(n * 0.8));
  const crossThreshold = lenientForManualToggle
    ? Math.max(48, diag * 0.35)
    : Math.max(32, diag * 0.24);

  for (let i = 0; i < headCount; i++) {
    for (let j = tailStart; j < n; j++) {
      if (distance(pts[i], pts[j]) <= crossThreshold) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Tessellates parametric shapes (4-node circle/ellipse, 2-node sine/cosine, 3-node parabola/hyperbola/arc)
 * into a high-resolution polyline of BezierPoints when intersected by the Pixel Eraser.
 */
function tessellateParametricShapeForErase(s: StrokeObject): BezierPoint[] {
  if ((s.shapeType === 'ellipse' || s.shapeType === 'circle') && s.points.length === 4) {
    const pts = s.points;
    const kappa = 0.55228475;
    const out: BezierPoint[] = [];
    const stepsPerQuad = 24;
    for (let i = 0; i < 4; i++) {
      const pA = pts[i];
      const pB = pts[(i + 1) % 4];
      const pPrev = pts[(i + 3) % 4];
      const pNext = pts[(i + 2) % 4];
      const cp1x = pA.x + ((pB.x - pPrev.x) / 2) * kappa;
      const cp1y = pA.y + ((pB.y - pPrev.y) / 2) * kappa;
      const cp2x = pB.x - ((pNext.x - pA.x) / 2) * kappa;
      const cp2y = pB.y - ((pNext.y - pA.y) / 2) * kappa;
      const startStep = i === 0 ? 0 : 1;
      for (let step = startStep; step <= stepsPerQuad; step++) {
        const t = step / stepsPerQuad;
        const u = 1 - t;
        const x =
          u * u * u * pA.x +
          3 * u * u * t * cp1x +
          3 * u * t * t * cp2x +
          t * t * t * pB.x;
        const y =
          u * u * u * pA.y +
          3 * u * u * t * cp1y +
          3 * u * t * t * cp2y +
          t * t * t * pB.y;
        out.push({ x, y, pressure: pA.pressure ?? 0.7 });
      }
    }
    return out;
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
    const steps = 80;
    const out: BezierPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const along = t * spanL;
      const waveOffset =
        s.shapeType === 'sine'
          ? amp * Math.sin(t * halfCycles * Math.PI)
          : -amp * Math.cos(t * halfCycles * Math.PI);
      out.push({
        x: pStart.x + along * ux + waveOffset * nx,
        y: pStart.y + along * uy + waveOffset * ny,
        pressure: pPeak.pressure ?? 0.7,
      });
    }
    return out;
  }

  if ((s.shapeType === 'parabola' || s.shapeType === 'arc') && s.points.length === 3) {
    const [p0, pMid, p2] = s.points;
    const ctrlX = 2 * pMid.x - (p0.x + p2.x) / 2;
    const ctrlY = 2 * pMid.y - (p0.y + p2.y) / 2;
    const steps = 56;
    const out: BezierPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      out.push({
        x: u * u * p0.x + 2 * u * t * ctrlX + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * ctrlY + t * t * p2.y,
        pressure: p0.pressure ?? 0.7,
      });
    }
    return out;
  }

  if (s.shapeType === 'hyperbola' && s.points.length === 3) {
    const [p0, pMid, p2] = s.points;
    const midChordX = (p0.x + p2.x) / 2;
    const midChordY = (p0.y + p2.y) / 2;
    const ux = (p2.x - p0.x) / 2;
    const uy = (p2.y - p0.y) / 2;
    const vx = pMid.x - midChordX;
    const vy = pMid.y - midChordY;
    const k = 2.25;
    const denom = Math.sqrt(1 + k * k) - 1;
    const steps = 64;
    const out: BezierPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = -1 + (2 * i) / steps;
      const phi = (Math.sqrt(1 + k * u * (k * u)) - 1) / denom;
      out.push({
        x: pMid.x + u * ux - phi * vx,
        y: pMid.y + u * uy - phi * vy,
        pressure: p0.pressure ?? 0.7,
      });
    }
    return out;
  }

  if ((s.shapeType === 'resistor' || s.shapeType === 'spring') && s.points.length >= 4) {
    return computeResistorOrSpringPoints(s.shapeType, s.points);
  }

  return s.points;
}

/**
 * Pixel-accurate Eraser ("Ακριβείας / Pixel"):
 * Analytically intersects a stroke (including 2-point straight lines, polygons, parametric curves, and freehand curves)
 * against the eraser circle (center, radius), removing ONLY the exact segment(s) inside the circle
 * and splitting the stroke into clean independent sub-strokes where needed.
 */
export function eraseStrokeByCircle(
  s: StrokeObject,
  center: { x: number; y: number },
  radius: number
): { modified: boolean; pieces: StrokeObject[] } {
  if (s.points.length === 0) return { modified: false, pieces: [] };

  const effRadius = Math.max(2, radius + Math.min(4, (s.width || 2) * 0.35));
  const isParametric =
    ((s.shapeType === 'ellipse' || s.shapeType === 'circle') && s.points.length === 4) ||
    ((s.shapeType === 'sine' || s.shapeType === 'cosine') && s.points.length >= 2) ||
    ((s.shapeType === 'parabola' || s.shapeType === 'arc' || s.shapeType === 'hyperbola') && s.points.length === 3) ||
    ((s.shapeType === 'resistor' || s.shapeType === 'spring') && s.points.length >= 4);

  const basePts = isParametric ? tessellateParametricShapeForErase(s) : s.points;

  // Quick bounding-box rejection
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of basePts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    if (p.cx !== undefined && p.cy !== undefined) {
      if (p.cx < minX) minX = p.cx;
      if (p.cy < minY) minY = p.cy;
      if (p.cx > maxX) maxX = p.cx;
      if (p.cy > maxY) maxY = p.cy;
    }
  }
  if (
    center.x < minX - effRadius ||
    center.x > maxX + effRadius ||
    center.y < minY - effRadius ||
    center.y > maxY + effRadius
  ) {
    return { modified: false, pieces: [s] };
  }

  // Single-point dot
  if (basePts.length === 1) {
    if (distance(basePts[0], center) <= effRadius) {
      return { modified: true, pieces: [] };
    }
    return { modified: false, pieces: [s] };
  }

  // Expand any non-collinear quadratic Bezier segment that lies near the eraser circle into fine linear steps
  const expandedPts: BezierPoint[] = [{ ...basePts[0], cx: undefined, cy: undefined }];
  for (let i = 1; i < basePts.length; i++) {
    const pA = basePts[i - 1];
    const pB = basePts[i];
    if (pB.cx !== undefined && pB.cy !== undefined) {
      const midX = (pA.x + pB.x) / 2;
      const midY = (pA.y + pB.y) / 2;
      const ctrlDev = Math.hypot(pB.cx - midX, pB.cy - midY);
      const segMinX = Math.min(pA.x, pB.x, pB.cx) - effRadius;
      const segMaxX = Math.max(pA.x, pB.x, pB.cx) + effRadius;
      const segMinY = Math.min(pA.y, pB.y, pB.cy) - effRadius;
      const segMaxY = Math.max(pA.y, pB.y, pB.cy) + effRadius;
      const nearCircle =
        center.x >= segMinX && center.x <= segMaxX && center.y >= segMinY && center.y <= segMaxY;

      if (ctrlDev > 0.5 && nearCircle) {
        const approxLen = distance(pA, { x: pB.cx, y: pB.cy }) + distance({ x: pB.cx, y: pB.cy }, pB);
        const subSteps = Math.max(3, Math.min(14, Math.ceil(approxLen / 3)));
        for (let k = 1; k <= subSteps; k++) {
          const t = k / subSteps;
          const u = 1 - t;
          expandedPts.push({
            x: u * u * pA.x + 2 * u * t * pB.cx + t * t * pB.x,
            y: u * u * pA.y + 2 * u * t * pB.cy + t * t * pB.y,
            pressure: (pA.pressure ?? 0.65) + t * ((pB.pressure ?? 0.65) - (pA.pressure ?? 0.65)),
            tiltX: pB.tiltX,
            tiltY: pB.tiltY,
            twist: pB.twist,
          });
        }
        continue;
      }
    }
    expandedPts.push(pB);
  }

  let modified = false;
  const chains: BezierPoint[][] = [];
  let currentChain: BezierPoint[] = [];
  const rSq = effRadius * effRadius;

  for (let i = 1; i < expandedPts.length; i++) {
    const A = expandedPts[i - 1];
    const B = expandedPts[i];
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const a = dx * dx + dy * dy;
    const segLen = Math.sqrt(a);

    if (segLen < 1e-4) {
      if (distance(A, center) <= effRadius) {
        modified = true;
        if (currentChain.length >= 2) {
          chains.push(currentChain);
        }
        currentChain = [];
      }
      continue;
    }

    const fx = A.x - center.x;
    const fy = A.y - center.y;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - rSq;
    const disc = b * b - 4 * a * c;

    let intersects = false;
    let t1 = -1;
    let t2 = -1;

    if (disc > 0) {
      const sqrtDisc = Math.sqrt(disc);
      t1 = (-b - sqrtDisc) / (2 * a);
      t2 = (-b + sqrtDisc) / (2 * a);
      if (t2 > 0 && t1 < 1) {
        intersects = true;
      }
    }

    if (!intersects) {
      if (currentChain.length === 0) {
        currentChain.push({ ...A, cx: undefined, cy: undefined });
      }
      currentChain.push({ ...B });
    } else {
      modified = true;
      const lerpPt = (t: number): BezierPoint => ({
        x: A.x + t * dx,
        y: A.y + t * dy,
        pressure: (A.pressure ?? 0.65) + t * ((B.pressure ?? 0.65) - (A.pressure ?? 0.65)),
        tiltX: A.tiltX,
        tiltY: A.tiltY,
        twist: A.twist,
      });

      // 1. Portion of segment A -> B before entering the eraser circle (t in [0, t1])
      if (t1 > 0) {
        const q1 = lerpPt(t1);
        if (currentChain.length === 0) {
          if (t1 * segLen >= 0.6) {
            chains.push([{ ...A, cx: undefined, cy: undefined }, q1]);
          }
        } else {
          if (t1 * segLen >= 0.25) {
            currentChain.push(q1);
          }
          if (currentChain.length >= 2) {
            chains.push(currentChain);
          }
          currentChain = [];
        }
      } else {
        // Point A itself is inside or on the boundary of the eraser circle
        if (currentChain.length >= 2) {
          chains.push(currentChain);
        }
        currentChain = [];
      }

      // 2. Portion of segment A -> B after exiting the eraser circle (t in [t2, 1])
      if (t2 < 1) {
        const q2 = lerpPt(t2);
        if ((1 - t2) * segLen >= 0.25) {
          currentChain = [q2, { ...B, cx: undefined, cy: undefined }];
        }
      }
    }
  }

  if (!modified) {
    return { modified: false, pieces: [s] };
  }

  if (currentChain.length >= 2) {
    chains.push(currentChain);
  }

  // If the original stroke was a closed loop (e.g. rectangle, triangle, circle, closed freehand)
  // and was cut elsewhere, weld the last chain and the first chain across the original seam!
  const origFirst = basePts[0];
  const origLast = basePts[basePts.length - 1];
  if (basePts.length >= 3 && distance(origFirst, origLast) < 1.5 && chains.length >= 2) {
    const firstChain = chains[0];
    const lastChain = chains[chains.length - 1];
    if (distance(lastChain[lastChain.length - 1], firstChain[0]) < 1.5) {
      chains[0] = [...lastChain, ...firstChain.slice(1)];
      chains.pop();
    }
  }

  // Filter out microscopic dust chains (< 1.0px total length)
  const validChains = chains.filter((ch) => {
    if (ch.length < 2) return false;
    let len = 0;
    for (let i = 1; i < ch.length; i++) {
      len += distance(ch[i - 1], ch[i]);
      if (len >= 1.0) return true;
    }
    return false;
  });

  if (validChains.length === 0) {
    return { modified: true, pieces: [] };
  }

  const wasStraightLine =
    s.shapeType === 'line' ||
    s.shapeType === 'arrow' ||
    s.shapeType === 'double-arrow' ||
    basePts.length === 2;

  const pieces: StrokeObject[] = validChains.map((ch, idx) => {
    const pieceId =
      idx === 0
        ? s.id
        : `${s.id}-seg${idx}-${Math.random().toString(36).slice(2, 6)}`;
    const endsAtOriginalEnd = distance(ch[ch.length - 1], origLast) < 1.2;
    const startsAtOriginalStart = distance(ch[0], origFirst) < 1.2;

    if (wasStraightLine && ch.length === 2) {
      const p0 = ch[0];
      const p1 = ch[1];
      const keepArrowEnd = Boolean(
        (s.arrowEnd || s.shapeType === 'arrow' || s.shapeType === 'double-arrow') && endsAtOriginalEnd
      );
      const keepArrowStart = Boolean(
        (s.arrowStart || s.shapeType === 'double-arrow') && startsAtOriginalStart
      );
      return {
        ...s,
        id: pieceId,
        isShape: true,
        shapeType:
          keepArrowStart && keepArrowEnd
            ? 'double-arrow'
            : keepArrowEnd && (s.shapeType === 'arrow' || s.shapeType === 'double-arrow')
            ? 'arrow'
            : 'line',
        arrowEnd: keepArrowEnd,
        arrowStart: keepArrowStart,
        fillStyle: 'none',
        fillColor: undefined,
        keyNodeIndices: undefined,
        points: [
          { ...p0, cx: undefined, cy: undefined },
          { ...p1, cx: (p0.x + p1.x) / 2, cy: (p0.y + p1.y) / 2 },
        ],
      };
    }

    return {
      ...s,
      id: pieceId,
      isShape: false,
      shapeType: undefined,
      arrowEnd: Boolean(
        (s.arrowEnd || s.shapeType === 'arrow' || s.shapeType === 'double-arrow') && endsAtOriginalEnd
      ),
      arrowStart: Boolean((s.arrowStart || s.shapeType === 'double-arrow') && startsAtOriginalStart),
      fillStyle: 'none',
      fillColor: undefined,
      points: ch,
      keyNodeIndices: computeFreehandKeyNodeIndices(ch),
    };
  });

  return { modified: true, pieces };
}
