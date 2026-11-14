/**
 * Smart Stroke Sketch Recognizer for Heat & Laboratory Simulation Objects.
 * BestNotes / ExplainBoards.
 *
 * Classifies hand-drawn user strokes (via bounding box, aspect ratio, stroke direction,
 * width profile from top to bottom) into one of the 6 lab objects:
 * 1. Thermometer
 * 2. Tripod
 * 3. Bunsen Burner
 * 4. Cylindrical Beaker
 * 5. Wide Basin (Υδατόλουτρο)
 * 6. Erlenmeyer Flask
 */

import { HeatObjectType, HeatObject } from './types';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface StrokeLike {
  id: string;
  points: StrokePoint[] | number[]; // supports {x, y} or [x, y, p] flat points
}

/**
 * Computes bounding box for a list of strokes.
 */
export function computeStrokesBoundingBox(strokes: StrokeLike[]): BoundingBox | null {
  if (!strokes || strokes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  let hasPoints = false;
  for (const s of strokes) {
    if (!s.points || s.points.length === 0) continue;

    if (typeof s.points[0] === 'number') {
      const arr = s.points as number[];
      for (let i = 0; i < arr.length; i += 2) {
        const x = arr[i];
        const y = arr[i + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        hasPoints = true;
      }
    } else {
      const pts = s.points as StrokePoint[];
      for (const p of pts) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
        hasPoints = true;
      }
    }
  }

  if (!hasPoints) return null;
  return { minX, minY, maxX, maxY };
}

/**
 * Classifies hand-drawn strokes into the best laboratory heat object.
 */
export function recognizeHeatSketch(strokes: StrokeLike[]): {
  type: HeatObjectType;
  confidence: number;
  bounds: BoundingBox;
} | null {
  const bounds = computeStrokesBoundingBox(strokes);
  if (!bounds) return null;

  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  if (w < 15 || h < 15) return null; // Too small to be a lab apparatus

  const aspectHW = h / w; // > 1 is tall, < 1 is wide
  const aspectWH = w / h;

  // Extract all points into a flat array of {x, y}
  const allPts: StrokePoint[] = [];
  for (const s of strokes) {
    if (typeof s.points[0] === 'number') {
      const arr = s.points as number[];
      for (let i = 0; i < arr.length; i += 2) {
        allPts.push({ x: arr[i], y: arr[i + 1] });
      }
    } else {
      allPts.push(...(s.points as StrokePoint[]));
    }
  }

  if (allPts.length < 4) return null;

  // Measure width profile at top 25%, middle 50%, and bottom 25%
  const topThreshold = bounds.minY + h * 0.25;
  const botThreshold = bounds.minY + h * 0.75;

  let topMinX = Infinity, topMaxX = -Infinity;
  let botMinX = Infinity, botMaxX = -Infinity;

  for (const p of allPts) {
    if (p.y <= topThreshold) {
      if (p.x < topMinX) topMinX = p.x;
      if (p.x > topMaxX) topMaxX = p.x;
    }
    if (p.y >= botThreshold) {
      if (p.x < botMinX) botMinX = p.x;
      if (p.x > botMaxX) botMaxX = p.x;
    }
  }

  const topSpan = topMaxX > topMinX ? topMaxX - topMinX : w * 0.5;
  const botSpan = botMaxX > botMinX ? botMaxX - botMinX : w * 0.5;
  const taperRatio = topSpan / Math.max(1, botSpan); // < 1 means top is narrower than bottom

  // 1. Thermometer: Very tall and slender (aspectHW >= 3.8)
  if (aspectHW >= 3.2 && w <= 45) {
    return { type: 'thermometer', confidence: 0.92, bounds };
  }

  // 2. Wide Basin (Υδατόλουτρο): Extremely wide and low (aspectWH >= 1.7)
  if (aspectWH >= 1.7 && aspectHW <= 0.65) {
    return { type: 'wide-basin', confidence: 0.9, bounds };
  }

  // 3. Erlenmeyer Flask: Narrow neck at top, wide conical body at bottom
  // taperRatio < 0.52 (top is much narrower than bottom) and height is substantial
  if (taperRatio <= 0.55 && aspectHW >= 1.05 && aspectHW <= 2.2) {
    return { type: 'flask', confidence: 0.88, bounds };
  }

  // 4. Tripod vs Burner:
  // Tripod has open space in the middle with angled legs spreading at the bottom
  // Burner has a wide base at the bottom and a narrow vertical tube/column
  if (aspectHW >= 0.9 && aspectHW <= 1.7) {
    // If top is narrower and multiple vertical/diagonal strokes exist:
    if (strokes.length >= 3 || (taperRatio < 0.8 && botSpan >= w * 0.8)) {
      return { type: 'tripod', confidence: 0.84, bounds };
    }
  }

  // 5. Burner: Has a solid base and vertical tube (height > width, aspectHW 1.2 to 2.8)
  if (aspectHW >= 1.3 && aspectHW <= 3.0 && botSpan > topSpan * 1.3) {
    return { type: 'burner', confidence: 0.82, bounds };
  }

  // 6. Cylindrical Beaker: Default container with fairly vertical sides (taperRatio between 0.75 and 1.25)
  if (aspectHW >= 0.75 && aspectHW <= 1.8) {
    return { type: 'beaker', confidence: 0.85, bounds };
  }

  // Fallback if tall: burner or beaker
  if (aspectHW > 1.5) {
    return { type: 'burner', confidence: 0.7, bounds };
  }

  return { type: 'beaker', confidence: 0.65, bounds };
}

/**
 * Factory helper: creates a configured HeatObject from recognized type and bounds.
 */
export function createHeatObjectFromRecognition(
  type: HeatObjectType,
  bounds: BoundingBox,
  idSuffix: string = ''
): HeatObject {
  const id = `${type}-${Date.now()}${idSuffix}`;
  const w = Math.max(bounds.maxX - bounds.minX, type === 'thermometer' ? 36 : 90);
  const h = Math.max(bounds.maxY - bounds.minY, type === 'thermometer' ? 180 : 100);

  switch (type) {
    case 'burner':
      return {
        id,
        type: 'burner',
        x: bounds.minX,
        y: bounds.minY,
        width: Math.max(80, w),
        height: Math.max(110, h),
        burnerState: {
          isOn: false,
          intensity: 'normal',
          flameCycle: 0,
        },
      };

    case 'tripod':
      return {
        id,
        type: 'tripod',
        x: bounds.minX,
        y: bounds.minY,
        width: Math.max(120, w),
        height: Math.max(140, h),
        tripodState: {
          wireGauzeTemp: 20,
        },
      };

    case 'beaker':
      return {
        id,
        type: 'beaker',
        x: bounds.minX,
        y: bounds.minY,
        width: Math.max(100, w),
        height: Math.max(130, h),
        containerState: {
          capacityMl: 500,
          volumeMl: 250,
          liquidType: 'water',
          temperature: 20,
          initialTemp: 20,
          isBoiling: false,
          boilingIntensity: 0,
        },
      };

    case 'wide-basin':
      return {
        id,
        type: 'wide-basin',
        x: bounds.minX,
        y: bounds.minY,
        width: Math.max(180, w),
        height: Math.max(80, h),
        containerState: {
          capacityMl: 800,
          volumeMl: 450,
          liquidType: 'water',
          temperature: 20,
          initialTemp: 20,
          isBoiling: false,
          boilingIntensity: 0,
        },
      };

    case 'flask':
      return {
        id,
        type: 'flask',
        x: bounds.minX,
        y: bounds.minY,
        width: Math.max(110, w),
        height: Math.max(140, h),
        containerState: {
          capacityMl: 500,
          volumeMl: 250,
          liquidType: 'water',
          temperature: 20,
          initialTemp: 20,
          isBoiling: false,
          boilingIntensity: 0,
        },
      };

    case 'thermometer':
      return {
        id,
        type: 'thermometer',
        x: bounds.minX,
        y: bounds.minY,
        width: 32,
        height: Math.max(160, h),
        thermometerState: {
          temperature: 20,
          showBadge: true,
        },
      };
  }
}
