import { BezierPoint, StrokeObject, ShapePresetType, Notebook } from '../types/note';

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Converts raw Apple Pencil points into smooth Quadratic Bezier curves with StreamLine filtering.
 */
export function smoothStrokeToBezier(rawPoints: BezierPoint[], _streamline = 0.54): BezierPoint[] {
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

  /*
   * NOTE (Backup / Restore Point):
   * Post-stroke StreamLine EMA + 2-pass Gaussian-Laplacian relaxation ("στρώσιμο" after lifting the pencil)
   * is disabled per user request ("οτι γραφω ας μενει ιδιο ... θα το δουμε πολυ πολυ μετα") so the committed
   * stroke matches 100% what was drawn live on the canvas without shifting or morphing on pointerUp.
   */
  const pts = rawPoints;

  // Exact 1:1 C1-continuous Quadratic Bezier Midpoint Spline matching drawIncrementalSegment live ink!
  const result: BezierPoint[] = [{ ...pts[0] }];
  const firstMidX = (pts[0].x + pts[1].x) / 2;
  const firstMidY = (pts[0].y + pts[1].y) / 2;
  result.push({
    x: firstMidX,
    y: firstMidY,
    cx: (pts[0].x + firstMidX) / 2,
    cy: (pts[0].y + firstMidY) / 2,
    pressure: pts[0].pressure,
    tiltX: pts[0].tiltX,
    tiltY: pts[0].tiltY,
    twist: pts[0].twist,
  });

  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
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

  const last = pts[pts.length - 1];
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
    return buildPresetShape(start, end, minX, minY, maxX, maxY, forcedPreset, rawPoints);
  }

  if (totalLen < 8) return null;
  const directDist = distance(start, end);

  // If the user paused at the end of a straight line and the stylus hooked/retraced slightly in the last 25% of points,
  // find the farthest point in the tail so the end-hook never ruins the straight-line chord or straightness ratio!
  let trueEnd = end;
  const tailStartIdx = Math.max(1, Math.floor(rawPoints.length * 0.72));
  let maxTailDist = directDist;
  for (let i = tailStartIdx; i < rawPoints.length; i++) {
    const d = distance(start, rawPoints[i]);
    if (d > maxTailDist) {
      maxTailDist = d;
      trueEnd = rawPoints[i];
    }
  }
  const useTrueEnd =
    maxTailDist > directDist * 1.02 &&
    distance(end, trueEnd) <= Math.max(26, maxTailDist * 0.24);
  const lineEnd = useTrueEnd ? trueEnd : end;
  const lineDist = distance(start, lineEnd);
  const straightness = lineDist / Math.max(1, totalLen);

  // Compute maximum perpendicular deviation of stroke points from the chord (start -> lineEnd)
  let maxPerpDev = 0;
  if (lineDist > 6) {
    const ux = (lineEnd.x - start.x) / lineDist;
    const uy = (lineEnd.y - start.y) / lineDist;
    for (let i = 1; i < rawPoints.length - 1; i++) {
      const vx = rawPoints[i].x - start.x;
      const vy = rawPoints[i].y - start.y;
      const perp = Math.abs(vx * uy - vy * ux);
      if (perp > maxPerpDev) maxPerpDev = perp;
    }
  }

  const snapLineFromStartTo = (targetEnd: BezierPoint) => {
    let x2 = targetEnd.x;
    let y2 = targetEnd.y;
    const angleDeg = (Math.atan2(y2 - start.y, x2 - start.x) * 180) / Math.PI;
    const absAngle = Math.abs(angleDeg);

    if (absAngle < 4.5 || absAngle > 175.5) {
      y2 = start.y; // Horizontal snap
    } else if (Math.abs(absAngle - 90) < 4.5) {
      x2 = start.x; // Vertical snap
    }

    return {
      shapeType: 'line',
      points: [
        { x: start.x, y: start.y, pressure: 0.7 },
        { x: x2, y: y2, pressure: 0.7 },
      ],
    };
  };

  // 1. Straight Line Test (snaps horizontal, vertical, or any diagonal line reliably even with slight hand arc or end-hold hook!)
  const isStraightLine =
    lineDist >= 8 &&
    ((straightness > 0.80 && maxPerpDev < Math.max(28, lineDist * 0.19)) ||
      (straightness > 0.64 && maxPerpDev < Math.max(24, lineDist * 0.16)) ||
      (lineDist >= totalLen * 0.50 && maxPerpDev < Math.max(15, lineDist * 0.10)));

  if (isStraightLine) {
    return snapLineFromStartTo(lineEnd);
  }

  // 2. Closed Shape Test (Circle, Ellipse, Square, Rectangle, Parallelogram, Triangle)
  const w = Math.max(16, maxX - minX);
  const h = Math.max(16, maxY - minY);
  const diag = Math.hypot(w, h);
  const isClosed = directDist < totalLen * 0.35 || directDist < Math.max(52, diag * 0.32);

  if (isClosed && diag > 22) {
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = Math.max(8, w / 2);
    const ry = Math.max(8, h / 2);

    // Helper: Euclidean distance from point P to line segment AB
    const distToSeg = (
      px: number,
      py: number,
      ax: number,
      ay: number,
      bx: number,
      by: number
    ): number => {
      const abx = bx - ax;
      const aby = by - ay;
      const lenSq = abx * abx + aby * aby;
      if (lenSq < 1e-6) return Math.hypot(px - ax, py - ay);
      const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lenSq));
      return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
    };

    // 2a. Robust Trimmed Bounding Box (3rd–97th percentile) so a single corner overshoot doesn't skew an entire box wall
    const sortedX = rawPoints.map((p) => p.x).sort((a, b) => a - b);
    const sortedY = rawPoints.map((p) => p.y).sort((a, b) => a - b);
    const pLowIdx = Math.floor((rawPoints.length - 1) * 0.03);
    const pHighIdx = Math.ceil((rawPoints.length - 1) * 0.97);
    const trimMinX = sortedX[pLowIdx];
    const trimMaxX = sortedX[pHighIdx];
    const trimMinY = sortedY[pLowIdx];
    const trimMaxY = sortedY[pHighIdx];

    // 2b. Measure Bounding-Box Fit Error, Ellipse Fit Error, and Diagonal-to-Cardinal Radial Expansion
    let rectErrSum = 0;
    let ellipseDistErrSum = 0;
    let diagRadiusSum = 0;
    let diagRadiusCount = 0;
    let cardRadiusSum = 0;
    let cardRadiusCount = 0;

    for (const p of rawPoints) {
      const distToBoxEdge = Math.min(
        Math.abs(p.x - trimMinX),
        Math.abs(trimMaxX - p.x),
        Math.abs(p.y - trimMinY),
        Math.abs(trimMaxY - p.y)
      );
      rectErrSum += distToBoxEdge / diag;

      const ux = (p.x - cx) / rx;
      const uy = (p.y - cy) / ry;
      const normR = Math.hypot(ux, uy);
      const ang = Math.atan2(uy, ux);
      const ex = cx + rx * Math.cos(ang);
      const ey = cy + ry * Math.sin(ang);
      ellipseDistErrSum += Math.hypot(p.x - ex, p.y - ey) / diag;

      // cos(2*ang) is near ±1 on cardinal axes (0°, 90°, 180°, 270°) and near 0 on diagonals (±45°, ±135°)
      const cos2A = Math.abs(Math.cos(2 * ang));
      if (cos2A < 0.45) {
        diagRadiusSum += normR;
        diagRadiusCount++;
      } else if (cos2A > 0.55) {
        cardRadiusSum += normR;
        cardRadiusCount++;
      }
    }
    const rectErr = rectErrSum / rawPoints.length;
    const ellipseDistErr = ellipseDistErrSum / rawPoints.length;
    const diagonalExpansion =
      diagRadiusCount >= 3 && cardRadiusCount >= 3
        ? diagRadiusSum / diagRadiusCount / Math.max(0.1, cardRadiusSum / cardRadiusCount)
        : 1.0;

    // 2c. Distance from the 4 Bounding-Box Corners to the stroke
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

    // 2d. Resample closed loop into N=64 equidistant points (with wrap-around!) so the start/end corner is never missed
    const closedPoly: BezierPoint[] = [...rawPoints];
    if (distance(rawPoints[rawPoints.length - 1], rawPoints[0]) > 2) {
      closedPoly.push(rawPoints[0]);
    }
    const cumLen: number[] = [0];
    for (let i = 1; i < closedPoly.length; i++) {
      cumLen.push(cumLen[i - 1] + distance(closedPoly[i - 1], closedPoly[i]));
    }
    const loopTotalLen = Math.max(1, cumLen[cumLen.length - 1]);
    const N_SAMPLES = 64;
    const loopSamples: { x: number; y: number }[] = [];
    let segPtr = 0;
    for (let k = 0; k < N_SAMPLES; k++) {
      const targetS = (k / N_SAMPLES) * loopTotalLen;
      while (segPtr < cumLen.length - 2 && cumLen[segPtr + 1] < targetS) {
        segPtr++;
      }
      const s0 = cumLen[segPtr];
      const s1 = cumLen[segPtr + 1];
      const t = s1 > s0 ? (targetS - s0) / (s1 - s0) : 0;
      loopSamples.push({
        x: closedPoly[segPtr].x + (closedPoly[segPtr + 1].x - closedPoly[segPtr].x) * t,
        y: closedPoly[segPtr].y + (closedPoly[segPtr + 1].y - closedPoly[segPtr].y) * t,
      });
    }

    // Compute local turning angle (in degrees) at each of the 64 samples using a ±4-step wrap-around chord (~6.25% of perimeter)
    const bendDegs: number[] = new Array(N_SAMPLES).fill(0);
    let flatSampleCount = 0;
    const STEP = 4;
    for (let k = 0; k < N_SAMPLES; k++) {
      const prev = loopSamples[(k - STEP + N_SAMPLES) % N_SAMPLES];
      const curr = loopSamples[k];
      const next = loopSamples[(k + STEP) % N_SAMPLES];
      const v1x = curr.x - prev.x;
      const v1y = curr.y - prev.y;
      const v2x = next.x - curr.x;
      const v2y = next.y - curr.y;
      const m1 = Math.hypot(v1x, v1y);
      const m2 = Math.hypot(v2x, v2y);
      if (m1 > 1e-3 && m2 > 1e-3) {
        const cosB = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)));
        const deg = (Math.acos(cosB) * 180) / Math.PI;
        bendDegs[k] = deg;
        if (deg < 16) flatSampleCount++;
      }
    }
    const flatSideRatio = flatSampleCount / N_SAMPLES;

    // Count distinct wrap-around corner peaks (local maxima with bend >= 38°, separated by >= 7 samples around the loop)
    const peakIndices: number[] = [];
    for (let k = 0; k < N_SAMPLES; k++) {
      const b = bendDegs[k];
      if (b < 38) continue;
      let isLocalMax = true;
      for (let d = -3; d <= 3; d++) {
        if (d !== 0 && bendDegs[(k + d + N_SAMPLES) % N_SAMPLES] > b) {
          isLocalMax = false;
          break;
        }
      }
      if (isLocalMax) {
        const tooClose = peakIndices.some((pi) => {
          const diff = Math.abs(k - pi);
          return Math.min(diff, N_SAMPLES - diff) < 7;
        });
        if (!tooClose) {
          peakIndices.push(k);
        }
      }
    }
    const loopCornerCount = peakIndices.length;

    // 2e. Corner-Anchored RDP Polygon Extraction:
    // Rotate rawPoints so index 0 is the point farthest from the center (guaranteed to be a true polygon vertex, never mid-side!)
    let farthestIdx = 0;
    let maxNormDist = -1;
    for (let i = 0; i < rawPoints.length; i++) {
      const nd = Math.hypot((rawPoints[i].x - cx) / rx, (rawPoints[i].y - cy) / ry);
      if (nd > maxNormDist) {
        maxNormDist = nd;
        farthestIdx = i;
      }
    }
    const rotatedLoop: BezierPoint[] = [
      ...rawPoints.slice(farthestIdx),
      ...rawPoints.slice(0, farthestIdx),
      rawPoints[farthestIdx],
    ];

    const rdp = rdpSimplify(rotatedLoop, diag * 0.062);
    const mergedCorners: BezierPoint[] = [];
    for (const pt of rdp) {
      if (mergedCorners.length === 0 || distance(mergedCorners[mergedCorners.length - 1], pt) > diag * 0.14) {
        mergedCorners.push(pt);
      }
    }
    if (mergedCorners.length > 2 && distance(mergedCorners[0], mergedCorners[mergedCorners.length - 1]) < diag * 0.20) {
      mergedCorners.pop();
    }

    // Filter out collinear mid-side vertices (require corner turn angle > 34°, cosTurn < 0.829)
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
        if (cosTurn < 0.829) {
          trueCorners.push(curr);
        }
      }
    }

    // Measure how closely rawPoints hug the extracted polygon's straight edges (polyEdgeErr)
    let polyEdgeErr = Infinity;
    if (trueCorners.length >= 3 && trueCorners.length <= 6) {
      let sumPolyDist = 0;
      const m = trueCorners.length;
      for (const p of rawPoints) {
        let minEdgeD = Infinity;
        for (let k = 0; k < m; k++) {
          const a = trueCorners[k];
          const b = trueCorners[(k + 1) % m];
          const d = distToSeg(p.x, p.y, a.x, a.y, b.x, b.y);
          if (d < minEdgeD) minEdgeD = d;
        }
        sumPolyDist += minEdgeD / diag;
      }
      polyEdgeErr = sumPolyDist / rawPoints.length;
    }

    // A. Triangle (3 distinct corners, polygon edge fit beats ellipse fit)
    if (
      trueCorners.length === 3 &&
      loopCornerCount >= 2 &&
      polyEdgeErr < ellipseDistErr * 0.90 &&
      ellipseDistErr > 0.042
    ) {
      const [p0, p1, p2] = trueCorners;
      return {
        shapeType: 'triangle',
        points: makePolygonBezier([p0, p1, p2]),
      };
    }

    // B. Square / Rectangle / Parallelogram vs Circle / Ellipse:
    // Compare the best 4-sided straight-edge model (bestQuadErr) directly against the smooth Ellipse model (ellipseDistErr),
    // combined with wrap-around corner count, flat-side ratio, and diagonal corner expansion!
    const bestQuadErr = trueCorners.length === 4 ? Math.min(rectErr, polyEdgeErr) : rectErr;
    const isBoxLike =
      // Case 1: 4-sided polygon/box model fits the stroke better than the ellipse, backed by corners & flat sides
      (bestQuadErr < ellipseDistErr * 0.96 &&
        (loopCornerCount >= 3 || trueCorners.length === 4) &&
        (flatSideRatio >= 0.26 || diagonalExpansion >= 1.075 || avgBoxCornerDist < 0.115)) ||
      // Case 2: Clear 4-corner axis-aligned box with diagonal corner expansion & flat sides (even if drawn fast with soft corners)
      (avgBoxCornerDist < 0.105 &&
        diagonalExpansion >= 1.085 &&
        rectErr < ellipseDistErr * 1.05 &&
        (loopCornerCount >= 3 || flatSideRatio >= 0.30));

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
        if (Math.abs(cosAngle) >= 0.26 && polyEdgeErr < rectErr * 0.85) {
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

      // Check if it's a Square (width and height within 18% of each other) vs Rectangle
      const isSquare = Math.abs(w - h) < Math.max(w, h) * 0.18;
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
          return {
            shapeType: 'cosine',
            points: makeWaveBezierPoints('cosine', leftX, yMid, spanW, amp, halfCycles, -signDir),
          };
        } else {
          return {
            shapeType: 'sine',
            points: makeWaveBezierPoints('sine', leftX, yMid, spanW, amp, halfCycles, signDir),
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

  // Fallback for open flat strokes: if the user held the pen to snap an open segment that didn't arch enough to be a curve,
  // always perfect it into a clean straight line ('line') rather than leaving it unperfected!
  if (!isClosed && lineDist >= 8 && maxPerpDev < Math.max(24, lineDist * 0.20)) {
    return snapLineFromStartTo(lineEnd);
  }

  return null;
}

/**
 * Generates a `2 * halfCycles + 1` node cubic Bézier spline for a Sine ('sine') or Cosine ('cosine') wave
 * (5 nodes for 1 period: Left Endpoint, 1st Quarter, Center, 3rd Quarter, Right Endpoint) with exact cubic
 * Bézier handles so both endpoints are true editable/connectable nodes and there are no text labels.
 */
export function makeWaveBezierPoints(
  shapeType: 'sine' | 'cosine',
  leftX: number,
  yMid: number,
  spanW: number,
  amp: number,
  halfCycles = 2,
  signDir = 1
): BezierPoint[] {
  const numHalf = Math.max(1, Math.round(halfCycles));
  const numQuarters = numHalf * 2;
  const evalWave = (u: number): { x: number; y: number } => {
    const theta = u * numHalf * Math.PI;
    const x = leftX + u * spanW;
    const y =
      shapeType === 'sine'
        ? yMid - signDir * amp * Math.sin(theta)
        : yMid + signDir * amp * Math.cos(theta);
    return { x, y };
  };

  const nodes: BezierPoint[] = [];
  for (let j = 0; j <= numQuarters; j++) {
    const u = j / numQuarters;
    const pt = evalWave(u);
    nodes.push({
      x: pt.x,
      y: pt.y,
      pressure: 0.7,
      smooth: false,
      twist: 777,
    });
  }

  for (let j = 0; j < numQuarters; j++) {
    const u0 = j / numQuarters;
    const u3 = (j + 1) / numQuarters;
    const p0 = nodes[j];
    const p3 = nodes[j + 1];
    const q1 = evalWave(u0 + (u3 - u0) / 3);
    const q2 = evalWave(u0 + (2 * (u3 - u0)) / 3);
    const cp1x = (-5 * p0.x + 18 * q1.x - 9 * q2.x + 2 * p3.x) / 6;
    const cp1y = (-5 * p0.y + 18 * q1.y - 9 * q2.y + 2 * p3.y) / 6;
    const cp2x = (2 * p0.x - 9 * q1.x + 18 * q2.x - 5 * p3.x) / 6;
    const cp2y = (2 * p0.y - 9 * q1.y + 18 * q2.y - 5 * p3.y) / 6;
    p0.outDx = cp1x - p0.x;
    p0.outDy = cp1y - p0.y;
    p3.inDx = cp2x - p3.x;
    p3.inDy = cp2y - p3.y;
  }

  return nodes;
}

/**
 * Upgrades any legacy 2/3-point parametric `'sine'` or `'cosine'` stroke into a 5-node (or `2 * halfCycles + 1`-node)
 * cubic Bézier wave spline so both endpoints and all extrema/zero-crossings are normal editable nodes.
 */
export function ensureWaveBezierPoints(s: {
  shapeType?: string;
  points: BezierPoint[];
}): BezierPoint[] {
  if (
    (s.shapeType === 'sine' || s.shapeType === 'cosine') &&
    s.points.length >= 2 &&
    s.points.length <= 3 &&
    s.points[0]?.outDx === undefined &&
    s.points[1]?.inDx === undefined
  ) {
    const pPeak = s.points[0];
    const pEnd = s.points[1];
    const pStart = s.points[2] || {
      x: pPeak.x - (pEnd.x - pPeak.x) / 3,
      y: pEnd.y,
      twist: 2,
    };
    const dx = pEnd.x - pStart.x;
    const dy = pEnd.y - pStart.y;
    const spanL = Math.hypot(dx, dy) || 1;
    const ux = dx / spanL;
    const uy = dy / spanL;
    const nx = uy;
    const ny = -ux;
    const amp = (pPeak.x - pStart.x) * nx + (pPeak.y - pStart.y) * ny;
    const numHalf = Math.max(1, Math.round(pStart.twist || 2));
    const numQuarters = numHalf * 2;
    const evalRotWave = (u: number): { x: number; y: number } => {
      const along = u * spanL;
      const waveOffset =
        s.shapeType === 'sine'
          ? amp * Math.sin(u * numHalf * Math.PI)
          : -amp * Math.cos(u * numHalf * Math.PI);
      return {
        x: pStart.x + along * ux + waveOffset * nx,
        y: pStart.y + along * uy + waveOffset * ny,
      };
    };
    const nodes: BezierPoint[] = [];
    for (let j = 0; j <= numQuarters; j++) {
      const pt = evalRotWave(j / numQuarters);
      nodes.push({
        x: pt.x,
        y: pt.y,
        pressure: pPeak.pressure ?? 0.7,
        smooth: false,
        twist: 777,
      });
    }
    for (let j = 0; j < numQuarters; j++) {
      const u0 = j / numQuarters;
      const u3 = (j + 1) / numQuarters;
      const p0 = nodes[j];
      const p3 = nodes[j + 1];
      const q1 = evalRotWave(u0 + (u3 - u0) / 3);
      const q2 = evalRotWave(u0 + (2 * (u3 - u0)) / 3);
      const cp1x = (-5 * p0.x + 18 * q1.x - 9 * q2.x + 2 * p3.x) / 6;
      const cp1y = (-5 * p0.y + 18 * q1.y - 9 * q2.y + 2 * p3.y) / 6;
      const cp2x = (2 * p0.x - 9 * q1.x + 18 * q2.x - 5 * p3.x) / 6;
      const cp2y = (2 * p0.y - 9 * q1.y + 18 * q2.y - 5 * p3.y) / 6;
      p0.outDx = cp1x - p0.x;
      p0.outDy = cp1y - p0.y;
      p3.inDx = cp2x - p3.x;
      p3.inDy = cp2y - p3.y;
    }
    return nodes;
  }
  return s.points;
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
  preset: ShapePresetType,
  rawPoints: BezierPoint[] = []
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
        { x: x2, y: y2, pressure: 0.7 },
      ],
    };
  }
  if (preset === 'sine') {
    const yAxis = (minY + maxY) / 2;
    const amp = Math.max(24, h / 2);
    return {
      shapeType: 'sine',
      points: makeWaveBezierPoints('sine', minX, yAxis, w, amp, 2, 1),
    };
  }
  if (preset === 'cosine') {
    const yAxis = (minY + maxY) / 2;
    const amp = Math.max(24, h / 2);
    return {
      shapeType: 'cosine',
      points: makeWaveBezierPoints('cosine', minX, yAxis, w, amp, 2, 1),
    };
  }
  if (preset === 'hyperbola') {
    // Rectangular / Inverse-Proportional Hyperbola branch (y = c/x style, e.g. isothermal P-V curve):
    // Respects the exact start/end direction and whether the user drew it with concavity up (κοίλα πάνω) or down (κοίλα κάτω)!
    const x0 = start.x <= end.x ? minX : minX + w;
    const x2 = start.x <= end.x ? minX + w : minX;
    const y0 = start.y <= end.y ? minY : minY + h;
    const y2 = start.y <= end.y ? minY + h : minY;

    const cornerA = { x: x0, y: y2 };
    const cornerB = { x: x2, y: y0 };
    let sumDistA = 0;
    let sumDistB = 0;
    const iStart = Math.max(0, Math.floor(rawPoints.length * 0.18));
    const iEnd = Math.min(rawPoints.length - 1, Math.ceil(rawPoints.length * 0.82));
    for (let i = iStart; i <= iEnd; i++) {
      const rp = rawPoints[i];
      sumDistA += Math.hypot(rp.x - cornerA.x, rp.y - cornerA.y);
      sumDistB += Math.hypot(rp.x - cornerB.x, rp.y - cornerB.y);
    }
    const asymCorner = sumDistA <= sumDistB ? cornerA : cornerB;
    const midX = (x0 + x2) / 2;
    const midY = (y0 + y2) / 2;
    const wHyp = 1.85;
    const ratio = wHyp / (1 + wHyp);

    return {
      shapeType: 'hyperbola',
      points: [
        { x: x0, y: y0, pressure: 0.7 },
        {
          x: midX + ratio * (asymCorner.x - midX),
          y: midY + ratio * (asymCorner.y - midY),
          pressure: 0.7,
        },
        { x: x2, y: y2, pressure: 0.7 },
      ],
    };
  }
  if (preset === 'parabola' || preset === 'arc') {
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
  if (preset === 'trapezoid') {
    const inset = Math.min(w * 0.22, 48);
    return {
      shapeType: 'trapezoid',
      points: makePolygonBezier([
        { x: minX + inset, y: minY },
        { x: minX + w - inset, y: minY },
        { x: minX + w, y: minY + h },
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
  preset: 'cylinder' | 'axes' | 'wave-axes' | 'resistor',
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  layerId: string,
  guideColor = '#2563eb'
): StrokeObject[] {
  const groupId = preset === 'wave-axes' ? `wave-axes-grp-${Date.now()}` : `group-${Date.now()}`;
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
  } else if (preset === 'wave-axes') {
    // Oscillation / Wave Axes Diagram:
    // 1. Vertical axis (bottom to top with upward arrow)
    // 2. Central horizontal axis (left to right at yMid with rightward arrow)
    // 3. Upper & Lower dashed horizontal amplitude guides (+A / -A) with independent color & vertical movement!
    const yMid = y + h / 2;
    const amp = Math.max(18, h * 0.34);
    const yTop = yMid - amp;
    const yBot = yMid + amp;
    const guideRightX = x + Math.max(40, w - Math.min(20, w * 0.045));
    const axisColor = '#111827';

    // 1. Vertical Y-axis (bottom -> top with arrow)
    out.push({
      id: `st-${Date.now()}-way`,
      tool: 'pen',
      color: axisColor,
      width: 2.8,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x, y: y + h, pressure: 0.7 },
        { x, y, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-y',
    });

    // 2. Horizontal X/t-axis (middle left -> middle right with arrow)
    out.push({
      id: `st-${Date.now()}-wax`,
      tool: 'pen',
      color: axisColor,
      width: 2.8,
      opacity: 1,
      arrowEnd: true,
      points: [
        { x, y: yMid, pressure: 0.7 },
        { x: x + w, y: yMid, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-axis-x',
    });

    // 3. Top Dashed Guide (+A) — strictly straight & parallel to horizontal axis
    out.push({
      id: `st-${Date.now()}-wgt`,
      tool: 'pen',
      color: guideColor,
      width: 2.2,
      opacity: 1,
      lineStyle: 'dashed',
      points: [
        { x, y: yTop, pressure: 0.7 },
        { x: guideRightX, y: yTop, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-guide-top',
    });

    // 4. Bottom Dashed Guide (-A) — strictly straight & parallel to horizontal axis
    out.push({
      id: `st-${Date.now()}-wgb`,
      tool: 'pen',
      color: guideColor,
      width: 2.2,
      opacity: 1,
      lineStyle: 'dashed',
      points: [
        { x, y: yBot, pressure: 0.7 },
        { x: guideRightX, y: yBot, pressure: 0.7 },
      ],
      layerId,
      groupId,
      isShape: true,
      shapeType: 'wave-guide-bottom',
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
 * High-efficiency canvas-to-dataUrl encoder:
 * - For opaque images (no alpha < 250): uses WebP (0.85) or JPEG (0.85), picking whichever is smaller (typically 10x-20x smaller than PNG).
 * - For transparent images (alpha < 250): uses WebP (0.86) with alpha if supported by the browser, or gently 15-bit quantized PNG (3x-4x smaller than raw 24-bit PNG).
 */
export function encodeCanvasOptimizedDataUrl(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  if (!ctx || w === 0 || h === 0) {
    return canvas.toDataURL('image/png');
  }

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  let hasTransparency = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) {
      hasTransparency = true;
      break;
    }
  }

  if (!hasTransparency) {
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.85);
    const webpUrl = canvas.toDataURL('image/webp', 0.85);
    if (webpUrl.startsWith('data:image/webp') && webpUrl.length < jpegUrl.length) {
      return webpUrl;
    }
    return jpegUrl;
  }

  // Transparent image: try native alpha WebP first (supported in Chrome/Edge & modern WebKit)
  const webpUrl = canvas.toDataURL('image/webp', 0.86);

  // Also quantize RGB noise slightly (32 levels/channel = 32,768 colors) so PNG DEFLATE compresses 3x smaller on Safari
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 10) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    } else {
      data[i] = Math.min(255, (data[i] + 3) & 0xf8);
      data[i + 1] = Math.min(255, (data[i + 1] + 3) & 0xf8);
      data[i + 2] = Math.min(255, (data[i + 2] + 3) & 0xf8);
      data[i + 3] = a > 246 ? 255 : (a + 7) & 0xf0;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const pngUrl = canvas.toDataURL('image/png');

  if (webpUrl.startsWith('data:image/webp') && webpUrl.length < pngUrl.length) {
    return webpUrl;
  }
  return pngUrl;
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
      const maxDim = 1350;
      const scale = Math.min(1, maxDim / Math.max(1, img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample 4 corner pixels as background reference color (supports BOTH white paper AND black chalkboard backgrounds!)
      const corners = [
        0,
        (w - 1) * 4,
        (h - 1) * w * 4,
        ((h - 1) * w + (w - 1)) * 4,
      ];
      let bgR = 255,
        bgG = 255,
        bgB = 255;
      for (const cIdx of corners) {
        if (data[cIdx + 3] > 128) {
          bgR = data[cIdx];
          bgG = data[cIdx + 1];
          bgB = data[cIdx + 2];
          break;
        }
      }

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
            // Smooth anti-aliased alpha transition so diagram lines stay razor-sharp
            const factor = (d - lowT) / (highT - lowT);
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
        }
      } else {
        // Outer Flood-Fill (Magic Wand from image borders - keeps insides of shapes opaque!)
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
      resolve(encodeCanvasOptimizedDataUrl(canvas));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Photoshop Magnetic Lasso: Computes Multi-Channel (Alpha Silhouette + RGB Color + Luminance)
 * Sobel Edge Map with Non-Maximum Suppression (NMS) and snaps cursor smoothly along contour ridges.
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
  const n = w * h;
  const rCh = new Float32Array(n);
  const gCh = new Float32Array(n);
  const bCh = new Float32Array(n);
  const aCh = new Float32Array(n);
  const lum = new Float32Array(n);

  // Composite RGBA over white paper (255,255,255) AND keep raw alpha channel
  // so transparent PNG silhouettes and dark/colored strokes both produce strong gradients!
  for (let i = 0; i < n; i++) {
    const a = data[i * 4 + 3] / 255;
    const r = data[i * 4] * a + 255 * (1 - a);
    const g = data[i * 4 + 1] * a + 255 * (1 - a);
    const b = data[i * 4 + 2] * a + 255 * (1 - a);
    rCh[i] = r;
    gCh[i] = g;
    bCh[i] = b;
    aCh[i] = data[i * 4 + 3];
    lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const rawMag = new Float32Array(n);
  const gradDirX = new Float32Array(n);
  const gradDirY = new Float32Array(n);

  const sobelAt = (arr: Float32Array, x: number, y: number) => {
    const idxTL = (y - 1) * w + (x - 1);
    const idxTC = (y - 1) * w + x;
    const idxTR = (y - 1) * w + (x + 1);
    const idxML = y * w + (x - 1);
    const idxMR = y * w + (x + 1);
    const idxBL = (y + 1) * w + (x - 1);
    const idxBC = (y + 1) * w + x;
    const idxBR = (y + 1) * w + (x + 1);
    const gx = -arr[idxTL] + arr[idxTR] - 2 * arr[idxML] + 2 * arr[idxMR] - arr[idxBL] + arr[idxBR];
    const gy = -arr[idxTL] - 2 * arr[idxTC] - arr[idxTR] + arr[idxBL] + 2 * arr[idxBC] + arr[idxBR];
    return { gx, gy, mag: Math.hypot(gx, gy) };
  };

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const sLum = sobelAt(lum, x, y);
      const sAlpha = sobelAt(aCh, x, y);
      const sR = sobelAt(rCh, x, y);
      const sG = sobelAt(gCh, x, y);
      const sB = sobelAt(bCh, x, y);

      const maxColorMag = Math.max(sR.mag, sG.mag, sB.mag);
      // Prioritize alpha silhouette transitions (2.2x) + color/luminance edges
      const combinedMag = Math.max(sAlpha.mag * 2.2, sLum.mag, maxColorMag * 0.9);
      rawMag[idx] = combinedMag;

      const dom = sAlpha.mag * 2.2 >= sLum.mag ? sAlpha : sLum;
      const len = dom.mag || 1;
      gradDirX[idx] = dom.gx / len;
      gradDirY[idx] = dom.gy / len;
    }
  }

  // Non-Maximum Suppression (NMS) with soft 35% shoulder so contour ridges are sharp and 1-2px thin
  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      const idx = y * w + x;
      const mag = rawMag[idx];
      if (mag < 25) continue;
      const dx = Math.round(gradDirX[idx]);
      const dy = Math.round(gradDirY[idx]);
      const m1 = rawMag[(y + dy) * w + (x + dx)];
      const m2 = rawMag[(y - dy) * w + (x - dx)];
      if (mag >= m1 && mag >= m2) {
        edgeMap[idx] = mag * 1.25;
      } else {
        edgeMap[idx] = mag * 0.35;
      }
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
  searchRadius = 14,
  prevLocalX?: number,
  prevLocalY?: number
): { x: number; y: number } {
  const cx = Math.round(localX);
  const cy = Math.round(localY);
  let bestScore = -1;
  let bestX = localX;
  let bestY = localY;

  const hasPrev = prevLocalX !== undefined && prevLocalY !== undefined;
  const moveDx = hasPrev ? localX - (prevLocalX as number) : 0;
  const moveDy = hasPrev ? localY - (prevLocalY as number) : 0;
  const moveDist = Math.hypot(moveDx, moveDy);

  const r = Math.round(searchRadius);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const distToCursor = Math.hypot(dx, dy);
      if (distToCursor > searchRadius) continue;
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 1 || nx >= w - 1 || ny < 1 || ny >= h - 1) continue;
      const grad = edgeMap[ny * w + nx];
      if (grad < 45) continue;

      // Strong Gaussian preference for edges close to the cursor tip
      const cursorWeight = Math.exp(-(distToCursor * distToCursor) / (2 * (searchRadius * 0.52) ** 2));

      // Continuity weight: prevent erratic sideways jumps away from the previous contour point
      let continuityWeight = 1.0;
      if (hasPrev && moveDist > 0.5) {
        const stepFromPrev = Math.hypot(nx - (prevLocalX as number), ny - (prevLocalY as number));
        // Penalize points that jump backwards or way farther than the cursor moved
        const jumpDiff = Math.abs(stepFromPrev - moveDist);
        continuityWeight = 1 / (1 + (jumpDiff / Math.max(6, searchRadius * 0.6)) ** 2);
      }

      const score = grad * (0.35 + 0.65 * cursorWeight) * continuityWeight;
      if (score > bestScore) {
        bestScore = score;
        bestX = nx;
        bestY = ny;
      }
    }
  }

  // Smoothly blend 80% snapped edge + 20% raw cursor if edge is moderate so hand motion always feels fluid
  if (bestScore > 0 && bestScore < 140) {
    return {
      x: bestX * 0.78 + localX * 0.22,
      y: bestY * 0.78 + localY * 0.22,
    };
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

  const isWeldedClosed =
    pts[0]?.twist === 999 &&
    keyNodeIndices.length >= 3 &&
    (keyNodePosIdx === 0 || keyNodePosIdx === keyNodeIndices.length - 1);

  if (isWeldedClosed) {
    // Move BOTH the start segment [0 .. keyNodeIndices[1]] and end segment [keyNodeIndices[last-1] .. n-1] together as 1 unified node!
    const firstInteriorIdx = Math.min(n - 1, Math.max(1, keyNodeIndices[1]));
    const lastInteriorIdx = Math.max(0, Math.min(n - 2, keyNodeIndices[keyNodeIndices.length - 2]));

    const cumStart = new Float64Array(firstInteriorIdx + 1);
    for (let i = 1; i <= firstInteriorIdx; i++) {
      cumStart[i] = cumStart[i - 1] + distance(pts[i - 1], pts[i]);
    }
    const startSpan = Math.max(1e-4, cumStart[firstInteriorIdx]);

    const cumEnd = new Float64Array(n);
    for (let i = lastInteriorIdx + 1; i < n; i++) {
      cumEnd[i] = cumEnd[i - 1] + distance(pts[i - 1], pts[i]);
    }
    const endSpan = Math.max(1e-4, cumEnd[n - 1] - cumEnd[lastInteriorIdx]);

    const weights = new Float64Array(n);
    for (let i = 0; i <= firstInteriorIdx; i++) {
      const v = cumStart[i] / startSpan; // 0 at idx=0 -> 1 at firstInteriorIdx
      weights[i] = Math.max(weights[i], 0.5 + 0.5 * Math.cos(Math.PI * v));
    }
    for (let i = lastInteriorIdx; i < n; i++) {
      const u = (cumEnd[i] - cumEnd[lastInteriorIdx]) / endSpan; // 0 at lastInteriorIdx -> 1 at n-1
      weights[i] = Math.max(weights[i], 0.5 - 0.5 * Math.cos(Math.PI * u));
    }
    weights[0] = 1.0;
    weights[n - 1] = 1.0;

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
 * Magnetically welds and smoothly blends the two endpoints of a freehand stroke into a single unified vertex
 * at `(targetX, targetY)`, smoothing the transition near the seam and marking `twist: 999` on `pts[0]` and `pts[n-1]`
 * so they behave permanently as 1 single node!
 */
export function weldFreehandEndpointsSmoothly(
  pts: BezierPoint[],
  keyNodeIndices: number[],
  draggedKeyPosIdx: number,
  targetX: number,
  targetY: number
): BezierPoint[] {
  if (pts.length < 3) return pts;
  const deformed = deformStrokeAtKeyNode(pts, keyNodeIndices, draggedKeyPosIdx, targetX, targetY);
  const n = deformed.length;
  const res = deformed.map((p) => ({ ...p }));

  // Lock both endpoints to exact targetX, targetY and mark twist = 999 (welded single node)
  res[0].x = targetX;
  res[0].y = targetY;
  res[0].twist = 999;
  res[n - 1].x = targetX;
  res[n - 1].y = targetY;
  res[n - 1].twist = 999;

  // Apply 2 passes of gentle Laplacian smoothing near the seam (points 1..min(5, n-2) and max(1, n-6)..n-2)
  // so the curve enters and leaves the welded vertex with zero jagged step ("ψιλοτέλεια ένωση")!
  const seamWindow = Math.min(5, Math.floor((n - 2) / 3));
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 1; i <= seamWindow; i++) {
      const prev = res[i - 1];
      const curr = res[i];
      const next = res[i + 1];
      curr.x = 0.25 * prev.x + 0.5 * curr.x + 0.25 * next.x;
      curr.y = 0.25 * prev.y + 0.5 * curr.y + 0.25 * next.y;
    }
    for (let i = n - 2; i >= n - 1 - seamWindow && i >= 1; i--) {
      const prev = res[i - 1];
      const curr = res[i];
      const next = res[i + 1];
      curr.x = 0.25 * prev.x + 0.5 * curr.x + 0.25 * next.x;
      curr.y = 0.25 * prev.y + 0.5 * curr.y + 0.25 * next.y;
    }
  }

  // Recompute smooth midpoint quadratic Bézier control points (cx, cy) near both ends
  for (let i = 1; i < n; i++) {
    if (i <= seamWindow + 1 || i >= n - 1 - seamWindow) {
      res[i].cx = (res[i - 1].x + res[i].x) / 2;
      res[i].cy = (res[i - 1].y + res[i].y) / 2;
    }
  }

  return res;
}

/**
 * Checks whether a freehand stroke forms a closed (or nearly closed) loop where one end touches/approaches the other,
 * so it can be filled automatically when drawn with Fill ON (without waiting for Hold-to-Snap!) or toggled via Lasso.
 */
export function isFreehandLoopClosed(pts: BezierPoint[], lenientForManualToggle = false): boolean {
  const n = pts.length;
  if (pts[0]?.twist === 999 && n >= 2) return true;
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
    const wavePts = ensureWaveBezierPoints(s);
    const out: BezierPoint[] = [];
    for (let i = 0; i < wavePts.length - 1; i++) {
      const pA = wavePts[i];
      const pB = wavePts[i + 1];
      const ctrl = getCubicSegmentControlPoints(pA, pB);
      const segSteps = 20;
      for (let k = i === 0 ? 0 : 1; k <= segSteps; k++) {
        const t = k / segSteps;
        const u = 1 - t;
        if (ctrl) {
          out.push({
            x: u * u * u * pA.x + 3 * u * u * t * ctrl.cp1x + 3 * u * t * t * ctrl.cp2x + t * t * t * pB.x,
            y: u * u * u * pA.y + 3 * u * u * t * ctrl.cp1y + 3 * u * t * t * ctrl.cp2y + t * t * t * pB.y,
            pressure: pA.pressure ?? 0.7,
          });
        } else {
          out.push({
            x: pA.x + t * (pB.x - pA.x),
            y: pA.y + t * (pB.y - pA.y),
            pressure: pA.pressure ?? 0.7,
          });
        }
      }
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
    const wHyp = 1.85;
    const midX = (p0.x + p2.x) / 2;
    const midY = (p0.y + p2.y) / 2;
    const ctrlX = midX + ((1 + wHyp) / wHyp) * (pMid.x - midX);
    const ctrlY = midY + ((1 + wHyp) / wHyp) * (pMid.y - midY);
    const steps = 64;
    const out: BezierPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const b0 = u * u;
      const b1 = 2 * wHyp * u * t;
      const b2 = t * t;
      const denom = b0 + b1 + b2;
      out.push({
        x: (b0 * p0.x + b1 * ctrlX + b2 * p2.x) / denom,
        y: (b0 * p0.y + b1 * ctrlY + b2 * p2.y) / denom,
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
 * Returns the exact drawn polyline sub-paths for 3D shapes ('cuboid', 'cylinder', 'sphere', 'pyramid')
 * so hit-testing and erasing operate strictly on the visible 3D wireframe curves/edges (never the invisible bounding box).
 */
export function get3DShapeSubPaths(s: StrokeObject): BezierPoint[][] {
  if (
    (s.shapeType !== 'cuboid' &&
      s.shapeType !== 'cylinder' &&
      s.shapeType !== 'sphere' &&
      s.shapeType !== 'pyramid') ||
    s.points.length < 4
  ) {
    return [];
  }

  const [p0, p1, p2, p3] = s.points;
  const pr = p0.pressure ?? 0.7;
  const bilerp = (u: number, v: number): BezierPoint => ({
    x: (1 - u) * (1 - v) * p0.x + u * (1 - v) * p1.x + u * v * p2.x + (1 - u) * v * p3.x,
    y: (1 - u) * (1 - v) * p0.y + u * (1 - v) * p1.y + u * v * p2.y + (1 - u) * v * p3.y,
    pressure: pr,
  });

  const sampleEllipseBilerp = (
    uc: number,
    vc: number,
    ru: number,
    rv: number,
    startAng = 0,
    endAng = Math.PI * 2,
    steps = 48
  ): BezierPoint[] => {
    const pts: BezierPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const ang = startAng + ((endAng - startAng) * i) / steps;
      pts.push(bilerp(uc + ru * Math.cos(ang), vc + rv * Math.sin(ang)));
    }
    return pts;
  };

  if (s.shapeType === 'sphere') {
    return [
      sampleEllipseBilerp(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 48),
      sampleEllipseBilerp(0.5, 0.5, 0.5, 0.18, 0, Math.PI, 28),
    ];
  }

  if (s.shapeType === 'cylinder') {
    const topLeft = bilerp(0, 0.14);
    const topRight = bilerp(1, 0.14);
    const botLeft = bilerp(0, 0.86);
    const botRight = bilerp(1, 0.86);
    return [
      sampleEllipseBilerp(0.5, 0.14, 0.5, 0.14, 0, Math.PI * 2, 40),
      sampleEllipseBilerp(0.5, 0.86, 0.5, 0.14, 0, Math.PI * 2, 40),
      [topLeft, botLeft],
      [topRight, botRight],
    ];
  }

  if (s.shapeType === 'cuboid') {
    const fTL = bilerp(0, 0.26);
    const fTR = bilerp(0.78, 0.26);
    const fBR = bilerp(0.78, 1.0);
    const fBL = bilerp(0, 1.0);
    const bTL = bilerp(0.22, 0);
    const bTR = bilerp(1.0, 0);
    const bBR = bilerp(1.0, 0.74);
    return [
      [fTL, fTR, fBR, fBL, fTL],
      [fTL, bTL, bTR, fTR],
      [bTR, bBR, fBR],
    ];
  }

  // 'pyramid'
  const pApex = bilerp(0.5, 0);
  const pLeft = bilerp(0, 0.76);
  const pFront = bilerp(0.5, 1.0);
  const pRight = bilerp(1.0, 0.76);
  return [
    [pApex, pLeft, pFront, pRight, pApex],
    [pApex, pFront],
  ];
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

  const strokeHalfW = s.tool === 'highlighter' ? (s.width || 3) * 1.9 : Math.min(4, (s.width || 2) * 0.5);
  const effRadius = Math.max(2, radius + strokeHalfW);

  // If 3D shape ('cuboid', 'cylinder', 'sphere', 'pyramid'), test against its true drawn 3D sub-paths (never the invisible 4-corner bounding box!)
  const subPaths3D = get3DShapeSubPaths(s);
  if (subPaths3D.length > 0) {
    let hit3D = false;
    for (const sp of subPaths3D) {
      for (let i = 1; i < sp.length; i++) {
        const a = sp[i - 1];
        const b = sp[i];
        const vx = b.x - a.x;
        const vy = b.y - a.y;
        const lenSq = vx * vx + vy * vy;
        const t = lenSq > 0.001 ? Math.max(0, Math.min(1, ((center.x - a.x) * vx + (center.y - a.y) * vy) / lenSq)) : 0;
        const projX = a.x + t * vx;
        const projY = a.y + t * vy;
        if (Math.hypot(center.x - projX, center.y - projY) <= effRadius) {
          hit3D = true;
          break;
        }
      }
      if (hit3D) break;
    }
    if (!hit3D) {
      return { modified: false, pieces: [s] };
    }
    // Convert hit 3D shape into its independent sub-path strokes and erase the touched segment(s)
    const piecesOut: StrokeObject[] = [];
    const grpId = s.groupId || `grp-3d-${s.id}`;
    subPaths3D.forEach((sp, idx) => {
      const subStroke: StrokeObject = {
        ...s,
        id: `${s.id}-3d-${idx}`,
        isShape: false,
        shapeType: undefined,
        fillStyle: 'none',
        fillColor: undefined,
        groupId: grpId,
        points: sp,
      };
      const subRes = eraseStrokeByCircle(subStroke, center, radius);
      piecesOut.push(...subRes.pieces);
    });
    return { modified: true, pieces: piecesOut };
  }

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

/**
 * Strips Greek diacritics/accents (τόνους, διαλυτικά) and normalizes final sigma (ς -> σ).
 */
export function normalizeGreekSearchText(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ς/g, 'σ')
    .trim();
}

/**
 * Computes the inflection-insensitive Greek stem of a single normalized word
 * so e.g. "νερο", "νερου", "νερα" -> "νερ" and "βροχη", "βροχησ", "βροχεσ" -> "βροχ".
 */
export function stemGreekWord(rawWord: string): string {
  const w = normalizeGreekSearchText(rawWord).replace(/[^a-zα-ω0-9]/g, '');
  if (w.length <= 3) return w;

  // Ordered longest-first common Greek inflectional suffixes
  const suffixes = [
    'ιουσ',
    'ιων',
    'ιου',
    'ουδ',
    'ματ',
    'αδων',
    'ηδων',
    'εων',
    'ουσ',
    'ων',
    'ου',
    'οι',
    'εσ',
    'ησ',
    'ασ',
    'οσ',
    'ια',
    'εισ',
    'ησε',
    'ησα',
    'α',
    'ο',
    'η',
    'ε',
    'υ',
    'ι',
    'ω',
  ];

  for (const suf of suffixes) {
    if (w.endsWith(suf) && w.length - suf.length >= 3) {
      return w.slice(0, w.length - suf.length);
    }
  }
  return w;
}

/**
 * Checks whether a single normalized query token matches a candidate text string
 * using both accent-insensitive substring matching and Greek inflectional stem matching.
 */
export function matchesSingleGreekToken(candidateText: string, rawToken: string): boolean {
  const normCandidate = normalizeGreekSearchText(candidateText);
  const normToken = normalizeGreekSearchText(rawToken).replace(/^#+/, '');
  if (!normToken) return true;
  if (!normCandidate) return false;

  // 1. Direct accent-insensitive substring match (great while typing partial words)
  if (normCandidate.includes(normToken)) return true;

  // 2. Word-level Greek stem match (e.g. query "νερο" -> stem "νερ" matches "Νερού" -> stem "νερ")
  const tokenStem = stemGreekWord(normToken);
  if (tokenStem.length < 3) return false;

  const candidateWords = normCandidate.split(/[^a-zα-ω0-9]+/).filter(Boolean);
  for (const cw of candidateWords) {
    if (cw.includes(tokenStem)) return true;
    const cwStem = stemGreekWord(cw);
    if (cwStem.length >= 3 && (cwStem.startsWith(tokenStem) || tokenStem.startsWith(cwStem))) {
      return true;
    }
  }
  return false;
}

/**
 * Smart Greek query matcher for folders or simple titles.
 * - Comma-separated groups ("βροχη, νερο") act as OR.
 * - Space-separated words within a group ("κυκλος νερο") act as AND.
 */
export function matchesGreekSmartQuery(candidateText: string, rawQuery: string): boolean {
  const q = rawQuery.trim();
  if (!q) return true;
  const orGroups = q
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
  if (orGroups.length === 0) return true;

  return orGroups.some((group) => {
    const andTokens = group
      .split(/\s+/)
      .map((t) => t.replace(/^#+/, '').trim())
      .filter(Boolean);
    return andTokens.every((tok) => matchesSingleGreekToken(candidateText, tok));
  });
}

/**
 * Searches across a Notebook's title, folder, tags, page titles, page tags, and typed page texts/LaTeX.
 * Returns whether it matches and a list of matched tags/snippets to highlight in the UI.
 */
export function matchesNotebookSmartSearch(
  nb: Notebook,
  rawQuery: string
): { matched: boolean; matchedTags: string[]; matchedTextSnippet?: string } {
  const q = rawQuery.trim();
  if (!q) return { matched: true, matchedTags: [] };

  const allTags = Array.from(
    new Set([
      ...(nb.tags || []),
      ...nb.pages.flatMap((p) => p.tags || []),
    ])
  );
  const pageTitles = nb.pages.map((p) => p.title || '');
  const pageTexts = nb.pages.flatMap((p) =>
    (p.texts || []).flatMap((t) => [t.text || '', t.latex || ''])
  );

  const combinedCorpus = [
    nb.title || '',
    nb.folder || '',
    ...allTags,
    ...pageTitles,
    ...pageTexts,
  ].join(' ');

  const orGroups = q
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
  if (orGroups.length === 0) return { matched: true, matchedTags: [] };

  const matched = orGroups.some((group) => {
    const andTokens = group
      .split(/\s+/)
      .map((t) => t.replace(/^#+/, '').trim())
      .filter(Boolean);
    return andTokens.every((tok) => matchesSingleGreekToken(combinedCorpus, tok));
  });

  if (!matched) {
    return { matched: false, matchedTags: [] };
  }

  const allQueryTokens = q
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#+/, '').trim())
    .filter(Boolean);

  const matchedTags = allTags.filter((tag) =>
    allQueryTokens.some((tok) => matchesSingleGreekToken(tag, tok))
  );

  let matchedTextSnippet: string | undefined;
  for (const txt of pageTexts) {
    if (txt && allQueryTokens.some((tok) => matchesSingleGreekToken(txt, tok))) {
      matchedTextSnippet = txt.length > 48 ? txt.slice(0, 48) + '…' : txt;
      break;
    }
  }

  return { matched: true, matchedTags, matchedTextSnippet };
}

/**
 * Downscales a dataUrl image to a compact <= 480px JPEG base64 payload (~20 KB) for fast, low-token Vision tagging.
 */
async function downscaleImageDataUrlForVision(dataUrl: string): Promise<{ mimeType: string; base64: string } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxDim = 720;
      const scale = Math.min(1, maxDim / Math.max(1, img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      // Fill white background so transparent-bg dark text or light text is clearly legible
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const jpegUrl = canvas.toDataURL('image/jpeg', 0.82);
      const m = jpegUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!m) {
        resolve(null);
        return;
      }
      resolve({ mimeType: m[1], base64: m[2] });
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

/**
 * Renders handwritten strokes (`page.strokes`) onto a crisp white offscreen canvas
 * so Gemini Vision can read handwritten Greek notes, equations, and diagrams!
 */
export function renderPageStrokesToSnapshotDataUrl(strokes: StrokeObject[]): string | null {
  if (!strokes || strokes.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of strokes) {
    for (const pt of s.points || []) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  const pad = 36;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const rawW = Math.max(160, maxX - minX);
  const rawH = Math.max(120, maxY - minY);
  const maxDim = 800;
  const scale = Math.min(1.5, maxDim / Math.max(rawW, rawH));
  const w = Math.max(160, Math.round(rawW * scale));
  const h = Math.max(120, Math.round(rawH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-minX, -minY);

  for (const s of strokes) {
    const pts = s.points || [];
    if (pts.length === 0) continue;
    ctx.save();
    ctx.strokeStyle = s.color || '#0f172a';
    ctx.lineWidth = Math.max(2, s.width || 3);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = s.opacity ?? (s.tool === 'highlighter' ? 0.35 : 1);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.85);
}

let cachedWorkingVisionModel: string | null = null;

/**
 * Uses Gemini Flash Vision (free tier on project bestnotes-2026) to inspect up to 4 images/texts
 * on a notebook page and return 3-4 clean Greek keyword tags in nominative singular.
 * Includes automatic evergreen model resolution ('gemini-flash-latest', 'gemini-3.8-flash',
 * 'gemini-3.5-flash', 'gemini-flash-lite-latest') plus live /v1beta/models auto-discovery
 * so future model upgrades (3.8 -> 4.0 -> 5.0) work automatically without code changes.
 */
export async function generateSmartGreekTagsFromImages(
  notebookTitle: string,
  imageDataUrls: string[],
  pageTexts: string[] = []
): Promise<string[]> {
  const partA = ((import.meta as any).env?.VITE_GV_A || '') as string;
  const partB = ((import.meta as any).env?.VITE_GV_B || '') as string;
  if (!partA || !partB) return [];
  const apiKey = (partA + partB).split('').reverse().join('');

  const parts: any[] = [
    {
      text: `Δες το περιεχόμενο της σχολικής σημείωσης${
        !/^(νέα\s+)?σημείωση\s*\d*$/i.test(notebookTitle.trim()) ? ` με τίτλο "${notebookTitle}"` : ''
      }${
        pageTexts.length > 0 ? ` και κείμενα: "${pageTexts.join(' | ').slice(0, 400)}"` : ''
      }. Διάβασε προσεκτικά το ΕΛΛΗΝΙΚΟ ΧΕΙΡΟΓΡΑΦΟ ή τυπωμένο κείμενο, τους τύπους και τα σχήματα μέσα στις εικόνες και επέστρεψε ΑΥΣΤΗΡΑ ένα JSON array με τις 3 έως 4 πιο σημαντικές ελληνικές λέξεις-κλειδιά (tags) στην ονομαστική ενικού (π.χ. ["νεύτωνας", "ισορροπία", "νόμος", "δύναμη"] ή ["φωτοσύνθεση", "γλυκόζη", "οξυγόνο", "φως"]). Μόνο 3 έως 4 ουσιαστικές ελληνικές λέξεις!`,
    },
  ];

  for (const url of imageDataUrls.slice(0, 4)) {
    const compact = await downscaleImageDataUrlForVision(url);
    if (compact) {
      parts.push({
        inlineData: {
          mimeType: compact.mimeType,
          data: compact.base64,
        },
      });
    }
  }

  const candidateModels = Array.from(
    new Set([
      ...(cachedWorkingVisionModel ? [cachedWorkingVisionModel] : []),
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-flash-lite-latest',
    ])
  );

  const tryGenerateWithModel = async (modelName: string): Promise<string[] | null> => {
    try {
      const cleanName = modelName.replace(/^models\//, '');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        const tags = parsed
          .map((t) => String(t || '').replace(/^#+/, '').trim().toLowerCase())
          .filter((t) => t.length >= 2)
          .slice(0, 4);
        if (tags.length > 0) {
          cachedWorkingVisionModel = cleanName;
          return tags;
        }
      }
    } catch {
      // try next model
    }
    return null;
  };

  for (const modelName of candidateModels) {
    const tags = await tryGenerateWithModel(modelName);
    if (tags && tags.length > 0) return tags;
  }

  // Automatic Future-Proof Discovery: query /v1beta/models dynamically if all known aliases/versions rotated
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      const discovered: string[] = (listData?.models || [])
        .filter(
          (m: any) =>
            Array.isArray(m?.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes('generateContent') &&
            typeof m.name === 'string' &&
            m.name.includes('gemini') &&
            m.name.includes('flash') &&
            !m.name.includes('tts') &&
            !m.name.includes('transcribe') &&
            !m.name.includes('embedding')
        )
        .map((m: any) => String(m.name).replace(/^models\//, ''))
        .sort((a: string, b: string) => b.localeCompare(a, undefined, { numeric: true }));

      for (const dynModel of discovered) {
        if (candidateModels.includes(dynModel)) continue;
        const tags = await tryGenerateWithModel(dynModel);
        if (tags && tags.length > 0) return tags;
      }
    }
  } catch {
    // ignore discovery error
  }

  return [];
}

/**
 * Uses Gemini Flash Vision to transcribe Lasso-selected Greek handwritten strokes into clean
 * Greek text (preserving line breaks and accents) so it can be rendered in a Calligraphic font.
 */
export async function transcribeHandwrittenStrokesWithGemini(
  imageDataUrl: string,
  notebookTitle = ''
): Promise<string | null> {
  const partA = ((import.meta as any).env?.VITE_GV_A || '') as string;
  const partB = ((import.meta as any).env?.VITE_GV_B || '') as string;
  if (!partA || !partB) return null;
  const apiKey = (partA + partB).split('').reverse().join('');

  const compact = await downscaleImageDataUrlForVision(imageDataUrl);
  if (!compact) return null;

  const contextHint =
    notebookTitle && !/^(νέα\s+)?σημείωση\s*\d*$/i.test(notebookTitle.trim())
      ? ` (από σχολική σημείωση με θέμα "${notebookTitle}")`
      : '';

  const parts: any[] = [
    {
      text: `Διάβασε με απόλυτη ακρίβεια το ΕΛΛΗΝΙΚΟ ΧΕΙΡΟΓΡΑΦΟ κείμενο (ή αριθμούς/σύμβολα) που φαίνεται στην εικόνα${contextHint}. Διόρθωσε αυτόματα τυχόν ατελή γράμματα ή τόνους ώστε οι ελληνικές λέξεις να είναι ορθογραφικά σωστές και να βγάζουν νόημα, διατήρησε τις αλλαγές γραμμής (\\n) αν το κείμενο είναι γραμμένο σε πολλές σειρές, και επέστρεψε ΑΥΣΤΗΡΑ JSON της μορφής {"text": "..."} χωρίς κανένα άλλο σχόλιο.`,
    },
    {
      inlineData: {
        mimeType: compact.mimeType,
        data: compact.base64,
      },
    },
  ];

  const candidateModels = Array.from(
    new Set([
      ...(cachedWorkingVisionModel ? [cachedWorkingVisionModel] : []),
      'gemini-3.5-flash',
      'gemini-3-flash-preview',
      'gemini-3.6-flash',
      'gemini-flash-lite-latest',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ])
  );

  const tryTranscribeWithModel = async (
    modelName: string,
    timeoutMs = 4200
  ): Promise<string | null> => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const cleanName = modelName.replace(/^models\//, '');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (!res.ok) {
        if (cachedWorkingVisionModel === cleanName) cachedWorkingVisionModel = null;
        return null;
      }
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;
      const parsed = JSON.parse(rawText);
      const transcribed =
        typeof parsed?.text === 'string'
          ? parsed.text.trim()
          : Array.isArray(parsed)
          ? parsed.join(' ').trim()
          : '';
      if (transcribed.length > 0) {
        cachedWorkingVisionModel = cleanName;
        return transcribed;
      }
    } catch {
      if (cachedWorkingVisionModel === modelName.replace(/^models\//, '')) {
        cachedWorkingVisionModel = null;
      }
    } finally {
      window.clearTimeout(timer);
    }
    return null;
  };

  // 1. Try primary fastest model first with a tight 3.6s timeout
  const primaryModel = candidateModels[0];
  if (primaryModel) {
    const firstTry = await tryTranscribeWithModel(primaryModel, 3600);
    if (firstTry) return firstTry;
  }

  // 2. If primary model timed out or returned 503/429, race the backup models in parallel so the fastest responder wins immediately!
  const backupModels = candidateModels.slice(1, 5);
  if (backupModels.length > 0) {
    try {
      const fastestBackup = await Promise.any(
        backupModels.map(async (m) => {
          const res = await tryTranscribeWithModel(m, 4500);
          if (!res) throw new Error('empty');
          return res;
        })
      );
      if (fastestBackup) return fastestBackup;
    } catch {
      // All parallel backup models failed; try remaining candidates if any
    }
  }

  for (const modelName of candidateModels.slice(5)) {
    const out = await tryTranscribeWithModel(modelName, 3800);
    if (out) return out;
  }

  return null;
}

/**
 * Splits a single-line or multi-line LaTeX string into clean individual row strings
 * so each row can be rendered cleanly on its own line in KaTeX without broken `\[6pt]`
 * or `\begin{aligned}` escaping artifacts.
 */
export function splitAndCleanMathLatexLines(rawLatex: string): string[] {
  if (!rawLatex || !rawLatex.trim()) return [];
  const stripped = rawLatex
    .replace(/^\$\$+|\$\$+$/g, '')
    .replace(/^\\\[|\\\]$/g, '')
    .replace(/\\begin\{(aligned|align\*?|gathered|gather\*?|split)\}/gi, '\n')
    .replace(/\\end\{(aligned|align\*?|gathered|gather\*?|split)\}/gi, '\n')
    // Replace `\\[6pt]`, `\[6pt]`, or `[6pt]` with a clean newline break
    .replace(/\\*\[\s*\d+(?:\.\d+)?\s*(?:pt|px|em|ex|mm|cm)\s*\]/gi, '\n')
    // Replace `\\` (LaTeX newline) or `\newline` / `\cr` with a clean newline break
    .replace(/\\\\+/g, '\n')
    .replace(/\\(?:newline|cr)\b/g, '\n');

  return stripped
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/\\*\[\s*\d+(?:\.\d+)?\s*(?:pt|px|em|ex|mm|cm)\s*\]/gi, '')
        .replace(/^\s*&\s*/, '')
        .replace(/\s*&\s*/g, ' ')
        .trim()
    )
    .filter((line) => line.length > 0);
}

/**
 * MathOCR via Gemini Flash Vision:
 * Reads Lasso-selected handwritten Physics / Mathematics / Chemistry equations and derivations
 * (simple & compound fractions, implication arrows \Rightarrow, equals =, multiplication \cdot,
 * deltas \Delta, subscripts/superscripts, roots, circled numbers, and units of measurement like s, m/s, kg, N)
 * and returns KaTeX-ready LaTeX + plain text fallback.
 */
export async function transcribeHandwrittenMathWithGemini(
  imageDataUrl: string,
  notebookTitle = ''
): Promise<{ latex: string; plainText: string } | null> {
  const partA = ((import.meta as any).env?.VITE_GV_A || '') as string;
  const partB = ((import.meta as any).env?.VITE_GV_B || '') as string;
  if (!partA || !partB) return null;
  const apiKey = (partA + partB).split('').reverse().join('');

  const compact = await downscaleImageDataUrlForVision(imageDataUrl);
  if (!compact) return null;

  const contextHint =
    notebookTitle && !/^(νέα\s+)?σημείωση\s*\d*$/i.test(notebookTitle.trim())
      ? ` (από σχολική σημείωση με θέμα "${notebookTitle}")`
      : '';

  const parts: any[] = [
    {
      text: `Είσαι εξειδικευμένο σύστημα MathOCR για ελληνικές σημειώσεις Φυσικής, Μαθηματικών και Χημείας${contextHint}.
Διάβασε με απόλυτη ακρίβεια τις χειρόγραφες εξισώσεις, κλάσματα, συνεπαγωγές, σύμβολα και μονάδες μέτρησης που φαίνονται στην εικόνα και μετάτρεψέ τα σε έγκυρο κώδικα KaTeX LaTeX:
1. Απλά & σύνθετα κλάσματα: χρησιμοποίησε \\frac{αριθμητής}{παρονομαστής} (π.χ. \\frac{\\Delta x}{\\Delta t}, \\frac{5}{1}, \\frac{20}{\\Delta t}, \\frac{20}{5}).
2. Συνεπαγωγές & βέλη: χρησιμοποίησε \\Rightarrow (για συνεπάγεται), \\Leftrightarrow (ισοδύναμα), \\rightarrow.
3. Πολλαπλασιασμός & σύμβολα: χρησιμοποίησε \\cdot για την τελεία πολλαπλασιασμού (π.χ. 5 \\cdot \\Delta t = 20), \\Delta για το Δέλτα (π.χ. \\Delta x, \\Delta t), δείκτες/εκθέτες (x_1, v_0, t^2), ρίζες (\\sqrt{...}), διανύσματα (\\vec{F}, \\vec{u}, \\vec{a}).
4. Κυκλωμένοι αριθμοί ασκήσεων (αν υπάρχουν στην αρχή, π.χ. ①, ②, ③): γράψε τους ως \\text{①}\\; ή \\text{②}\\; ή \\text{③}\\;.
5. Μονάδες μέτρησης & ελληνικές λέξεις: βάλε τις μονάδες μέτρησης σε \\text{ ... } με ένα μικρό κενό πριν (π.χ. 4\\,\\text{s}, 10\\,\\text{m/s}, 5\\,\\text{kg}, 25\\,\\text{N}). Αν υπάρχουν ελληνικές λέξεις, βάλε τες μέσα σε \\text{...}.
6. Πολλές γραμμές (σειρές): αν το χειρόγραφο έχει 2 ή περισσότερες σειρές (η μία κάτω από την άλλη), βάλε κάθε σειρά ως ξεχωριστό στοιχείο στον πίνακα "lines" (και ένωσέ τες με απλό χαρακτήρα αλλαγής γραμμής "\\n" στο "latex"). ΜΗΝ χρησιμοποιείς ΠΟΤΕ \\[6pt], \\\\[6pt] ή \\begin{aligned}.
7. ΜΗΝ βάζεις εξωτερικά σύμβολα $$ ή \\[ \\] γύρω από το latex string.
Επέστρεψε ΑΥΣΤΗΡΑ JSON της μορφής:
{"lines": ["σειρά 1 σε LaTeX", "σειρά 2 σε LaTeX"], "latex": "σειρά 1\\nσειρά 2", "plainText": "..."}
χωρίς κανένα άλλο σχόλιο.`,
    },
    {
      inlineData: {
        mimeType: compact.mimeType,
        data: compact.base64,
      },
    },
  ];

  const candidateModels = Array.from(
    new Set([
      ...(cachedWorkingVisionModel ? [cachedWorkingVisionModel] : []),
      'gemini-3.5-flash',
      'gemini-3-flash-preview',
      'gemini-3.6-flash',
      'gemini-flash-lite-latest',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ])
  );

  const tryMathWithModel = async (
    modelName: string,
    timeoutMs = 4500
  ): Promise<{ latex: string; plainText: string } | null> => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const cleanName = modelName.replace(/^models\//, '');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (!res.ok) {
        if (cachedWorkingVisionModel === cleanName) cachedWorkingVisionModel = null;
        return null;
      }
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;
      const parsed = JSON.parse(rawText);
      const fromLines = Array.isArray(parsed?.lines)
        ? parsed.lines
            .map((l: any) => (typeof l === 'string' ? l.trim() : ''))
            .filter((l: string) => l.length > 0)
            .join('\n')
        : '';
      const rawLatex =
        fromLines ||
        (typeof parsed?.latex === 'string'
          ? parsed.latex.trim()
          : typeof parsed?.text === 'string'
          ? parsed.text.trim()
          : '');
      const cleanedRows = splitAndCleanMathLatexLines(rawLatex);
      const cleanLatex = cleanedRows.join('\n').trim();
      const plainText =
        typeof parsed?.plainText === 'string' && parsed.plainText.trim().length > 0
          ? splitAndCleanMathLatexLines(parsed.plainText).join('\n').trim()
          : cleanLatex;
      if (cleanLatex.length > 0) {
        cachedWorkingVisionModel = cleanName;
        return { latex: cleanLatex, plainText };
      }
    } catch {
      if (cachedWorkingVisionModel === modelName.replace(/^models\//, '')) {
        cachedWorkingVisionModel = null;
      }
    } finally {
      window.clearTimeout(timer);
    }
    return null;
  };

  // 1. Try primary fastest model first with a tight 3.8s timeout
  const primaryModel = candidateModels[0];
  if (primaryModel) {
    const firstTry = await tryMathWithModel(primaryModel, 3800);
    if (firstTry) return firstTry;
  }

  // 2. If primary model timed out or returned 503/429, race the backup models in parallel so the fastest responder wins immediately!
  const backupModels = candidateModels.slice(1, 5);
  if (backupModels.length > 0) {
    try {
      const fastestBackup = await Promise.any(
        backupModels.map(async (m) => {
          const res = await tryMathWithModel(m, 4800);
          if (!res) throw new Error('empty');
          return res;
        })
      );
      if (fastestBackup) return fastestBackup;
    } catch {
      // All parallel backup models failed; try remaining candidates if any
    }
  }

  for (const modelName of candidateModels.slice(5)) {
    const out = await tryMathWithModel(modelName, 4000);
    if (out) return out;
  }

  return null;
}

/**
 * Returns the two cubic Bézier control points `(cp1x, cp1y, cp2x, cp2y)` for a segment `pA -> pB`
 * when either `pA` has outgoing Illustrator handle `(outDx, outDy)` or `pB` has incoming handle `(inDx, inDy)`,
 * or `null` if the segment does not use cubic Bézier tangent handles.
 */
export function getCubicSegmentControlPoints(
  pA: BezierPoint,
  pB: BezierPoint
): { cp1x: number; cp1y: number; cp2x: number; cp2y: number } | null {
  const hasOutA = pA.outDx !== undefined && pA.outDy !== undefined;
  const hasInB = pB.inDx !== undefined && pB.inDy !== undefined;
  if (!hasOutA && !hasInB) return null;

  const hInBx = hasInB ? pB.x + (pB.inDx as number) : pB.x;
  const hInBy = hasInB ? pB.y + (pB.inDy as number) : pB.y;
  const hOutAx = hasOutA ? pA.x + (pA.outDx as number) : pA.x;
  const hOutAy = hasOutA ? pA.y + (pA.outDy as number) : pA.y;

  const cp1x = hasOutA ? hOutAx : pA.x + 0.5 * (hInBx - pA.x);
  const cp1y = hasOutA ? hOutAy : pA.y + 0.5 * (hInBy - pA.y);
  const cp2x = hasInB ? hInBx : pB.x + 0.5 * (hOutAx - pB.x);
  const cp2y = hasInB ? hInBy : pB.y + 0.5 * (hOutAy - pB.y);
  return { cp1x, cp1y, cp2x, cp2y };
}

/**
 * Recomputes symmetrical Catmull-Rom / Cardinal Bézier tangent handles (`inDx, inDy, outDx, outDy`)
 * for all nodes in `pts` that have `smooth === true` and have not been manually locked (`twist !== 777`).
 * Guarantees that dragging an interior node on a line creates a 100% symmetrical smooth arch (τόξο)!
 */
export function recomputeAutoSmoothHandles(pts: BezierPoint[], isClosed = false): BezierPoint[] {
  if (pts.length < 2) return pts;
  const out = pts.map((p) => ({ ...p }));
  const n = out.length;
  const hasClosingDup = isClosed && n > 2 && distance(out[0], out[n - 1]) < 1.5;
  const uniqueN = hasClosingDup ? n - 1 : n;

  for (let i = 0; i < uniqueN; i++) {
    const p = out[i];
    if (!p.smooth || p.twist === 777) continue;

    if (isClosed && uniqueN >= 3) {
      const pPrev = out[(i - 1 + uniqueN) % uniqueN];
      const pNext = out[(i + 1) % uniqueN];
      const tx = pNext.x - pPrev.x;
      const ty = pNext.y - pPrev.y;
      const tLen = Math.hypot(tx, ty) || 1;
      const ux = tx / tLen;
      const uy = ty / tLen;
      const dPrev = distance(p, pPrev);
      const dNext = distance(pNext, p);
      p.inDx = -ux * dPrev * 0.36;
      p.inDy = -uy * dPrev * 0.36;
      p.outDx = ux * dNext * 0.36;
      p.outDy = uy * dNext * 0.36;
      p.cx = undefined;
      p.cy = undefined;
    } else if (i > 0 && i < n - 1) {
      const pPrev = out[i - 1];
      const pNext = out[i + 1];
      const tx = pNext.x - pPrev.x;
      const ty = pNext.y - pPrev.y;
      const tLen = Math.hypot(tx, ty) || 1;
      const ux = tx / tLen;
      const uy = ty / tLen;
      const dPrev = distance(p, pPrev);
      const dNext = distance(pNext, p);
      p.inDx = -ux * dPrev * 0.38;
      p.inDy = -uy * dPrev * 0.38;
      p.outDx = ux * dNext * 0.38;
      p.outDy = uy * dNext * 0.38;
      p.cx = undefined;
      p.cy = undefined;
      if (out[i + 1]) {
        out[i + 1].cx = undefined;
        out[i + 1].cy = undefined;
      }
    } else if (i === 0 && n >= 2) {
      const pNext = out[1];
      p.outDx = (pNext.x - p.x) * 0.38;
      p.outDy = (pNext.y - p.y) * 0.38;
      p.inDx = -p.outDx;
      p.inDy = -p.outDy;
      p.cx = undefined;
      p.cy = undefined;
    } else if (i === n - 1 && n >= 2) {
      const pPrev = out[n - 2];
      p.inDx = (pPrev.x - p.x) * 0.38;
      p.inDy = (pPrev.y - p.y) * 0.38;
      p.outDx = -p.inDx;
      p.outDy = -p.inDy;
      p.cx = undefined;
      p.cy = undefined;
    }
  }

  if (hasClosingDup && uniqueN >= 3) {
    out[n - 1] = {
      ...out[n - 1],
      x: out[0].x,
      y: out[0].y,
      inDx: out[0].inDx,
      inDy: out[0].inDy,
      outDx: out[0].outDx,
      outDy: out[0].outDy,
      smooth: out[0].smooth,
      twist: out[0].twist,
    };
  }

  return out;
}

/**
 * Reverses a `BezierPoint[]` spline array so the drawn curve remains 100% identical pixel-for-pixel,
 * upgrading any quadratic `(cx, cy)` control points to cubic `(inDx, inDy, outDx, outDy)` and swapping
 * incoming/outgoing tangent handles on every vertex.
 */
export function reverseBezierPointsExact(pts: BezierPoint[]): BezierPoint[] {
  const n = pts.length;
  if (n === 0) return [];
  const upgraded = pts.map((p) => ({ ...p }));
  for (let i = 1; i < n; i++) {
    const prev = upgraded[i - 1];
    const curr = upgraded[i];
    if (
      curr.cx !== undefined &&
      curr.cy !== undefined &&
      prev.outDx === undefined &&
      curr.inDx === undefined
    ) {
      prev.outDx = (2 / 3) * (curr.cx - prev.x);
      prev.outDy = (2 / 3) * (curr.cy - prev.y);
      curr.inDx = (2 / 3) * (curr.cx - curr.x);
      curr.inDy = (2 / 3) * (curr.cy - curr.y);
      curr.cx = undefined;
      curr.cy = undefined;
    }
  }
  const out: BezierPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const p = upgraded[i];
    out.push({
      ...p,
      inDx: p.outDx,
      inDy: p.outDy,
      outDx: p.inDx,
      outDy: p.inDy,
      cx: undefined,
      cy: undefined,
    });
  }
  return out;
}

/**
 * Converts any open stroke (`!s.isShape` freehand curve, 3-point parabola/arc/hyperbola, or `'line'` spline)
 * into a sparse cubic Bézier spline (`BezierPoint[]`) that preserves the exact curve geometry and key nodes.
 */
export function convertOpenStrokeToBezierSplinePoints(s: StrokeObject): BezierPoint[] {
  if (!s.isShape) {
    const kIndices =
      s.keyNodeIndices && s.keyNodeIndices.length >= 2
        ? s.keyNodeIndices
        : computeFreehandKeyNodeIndices(s.points);
    const nodes: BezierPoint[] = kIndices.map((kIdx) => {
      const kp = s.points[Math.max(0, Math.min(s.points.length - 1, kIdx))];
      return {
        x: kp.x,
        y: kp.y,
        pressure: kp.pressure ?? 0.7,
        smooth: false,
        twist: 777,
      };
    });

    const sampleAtFraction = (idxA: number, idxB: number, frac: number): { x: number; y: number } => {
      if (idxB <= idxA) {
        const p = s.points[idxA];
        return { x: p.x, y: p.y };
      }
      let totalArc = 0;
      const cum: number[] = [0];
      for (let i = idxA + 1; i <= idxB; i++) {
        totalArc += distance(s.points[i - 1], s.points[i]);
        cum.push(totalArc);
      }
      if (totalArc < 1e-4) {
        const p = s.points[idxA];
        return { x: p.x, y: p.y };
      }
      const targetArc = totalArc * frac;
      for (let k = 1; k < cum.length; k++) {
        if (cum[k] >= targetArc) {
          const segStart = cum[k - 1];
          const segLen = Math.max(1e-4, cum[k] - segStart);
          const u = (targetArc - segStart) / segLen;
          const p1 = s.points[idxA + k - 1];
          const p2 = s.points[idxA + k];
          return {
            x: p1.x + u * (p2.x - p1.x),
            y: p1.y + u * (p2.y - p1.y),
          };
        }
      }
      const pEnd = s.points[idxB];
      return { x: pEnd.x, y: pEnd.y };
    };

    for (let pos = 0; pos < kIndices.length - 1; pos++) {
      const idxA = Math.max(0, Math.min(s.points.length - 1, kIndices[pos]));
      const idxB = Math.max(0, Math.min(s.points.length - 1, kIndices[pos + 1]));
      const p0 = nodes[pos];
      const p3 = nodes[pos + 1];
      const q1 = sampleAtFraction(idxA, idxB, 1 / 3);
      const q2 = sampleAtFraction(idxA, idxB, 2 / 3);
      const cp1x = (-5 * p0.x + 18 * q1.x - 9 * q2.x + 2 * p3.x) / 6;
      const cp1y = (-5 * p0.y + 18 * q1.y - 9 * q2.y + 2 * p3.y) / 6;
      const cp2x = (2 * p0.x - 9 * q1.x + 18 * q2.x - 5 * p3.x) / 6;
      const cp2y = (2 * p0.y - 9 * q1.y + 18 * q2.y - 5 * p3.y) / 6;
      p0.outDx = cp1x - p0.x;
      p0.outDy = cp1y - p0.y;
      p3.inDx = cp2x - p3.x;
      p3.inDy = cp2y - p3.y;
    }
    return nodes;
  }

  if (
    (s.shapeType === 'parabola' || s.shapeType === 'arc' || s.shapeType === 'hyperbola') &&
    s.points.length >= 3
  ) {
    const rawPts = s.points.map((p, idx) => ({
      ...p,
      smooth: idx === 1,
    }));
    return recomputeAutoSmoothHandles(rawPts, false);
  }

  if (s.shapeType === 'sine' || s.shapeType === 'cosine') {
    return ensureWaveBezierPoints(s).map((p) => ({ ...p }));
  }

  const out = s.points.map((p) => ({ ...p }));
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1];
    const curr = out[i];
    if (
      curr.cx !== undefined &&
      curr.cy !== undefined &&
      prev.outDx === undefined &&
      curr.inDx === undefined
    ) {
      prev.outDx = (2 / 3) * (curr.cx - prev.x);
      prev.outDy = (2 / 3) * (curr.cy - prev.y);
      curr.inDx = (2 / 3) * (curr.cx - curr.x);
      curr.inDy = (2 / 3) * (curr.cy - curr.y);
      curr.cx = undefined;
      curr.cy = undefined;
    }
  }
  return out;
}




