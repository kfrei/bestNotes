/**
 * Virtual Pencil Animator: Renders step-by-step animated drawings
 * using a virtual pencil PNG (e.g. constructing parallelogram lines,
 * resultant vectors, axes, and paths).
 */

import { Vector2D } from '../types';

export interface PencilStepProgress {
  from: Vector2D;
  to: Vector2D;
  current: Vector2D;
  progress01: number; // 0 to 1
  isComplete: boolean;
}

export const computePencilStepProgress = (
  from: Vector2D,
  to: Vector2D,
  startTimeMs: number,
  durationMs: number,
  nowMs: number = performance.now()
): PencilStepProgress => {
  const elapsed = Math.max(0, nowMs - startTimeMs);
  const rawProgress = durationMs > 0 ? elapsed / durationMs : 1;
  const progress01 = Math.min(1, Math.max(0, rawProgress));
  
  // Ease-out cubic for natural hand motion
  const easeProgress = 1 - Math.pow(1 - progress01, 3);

  const current: Vector2D = {
    x: from.x + (to.x - from.x) * easeProgress,
    y: from.y + (to.y - from.y) * easeProgress,
  };

  return {
    from,
    to,
    current,
    progress01,
    isComplete: progress01 >= 1,
  };
};

/**
 * Draws the virtual pencil PNG image at the given tip coordinates on the canvas
 */
export const drawVirtualPencilTip = (
  ctx: CanvasRenderingContext2D,
  tip: Vector2D,
  pencilImage?: HTMLImageElement | null,
  angleRad: number = -Math.PI / 4,
  scale: number = 0.35
): void => {
  if (!pencilImage || !pencilImage.complete || pencilImage.naturalWidth === 0) {
    // Fallback: draw a small neat pencil indicator dot
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(angleRad);
  const w = pencilImage.naturalWidth * scale;
  const h = pencilImage.naturalHeight * scale;
  // Position so the tip touches (tip.x, tip.y)
  ctx.drawImage(pencilImage, 0, -h, w, h);
  ctx.restore();
};
