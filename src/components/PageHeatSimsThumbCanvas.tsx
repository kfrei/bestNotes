import React, { useEffect, useRef } from 'react';
import { getEffectivePaperColor, isDarkPaperColor, type NotePage } from '../types/note';
import { renderHeatSimulation } from '../simulations/modules/heat';

export interface PageHeatSimsThumbCanvasProps {
  page?: NotePage;
  width: number;
  height: number;
  scale?: number;
  className?: string;
}

export const PageHeatSimsThumbCanvas: React.FC<PageHeatSimsThumbCanvasProps> = React.memo(
  ({ page, width, height, scale = 0.45, className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const heatSims = page?.heatSims;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !heatSims || heatSims.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cw = Math.max(1, Math.round(width * scale));
      const ch = Math.max(1, Math.round(height * scale));
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;

      ctx.save();
      ctx.clearRect(0, 0, cw, ch);
      ctx.scale(scale, scale);

      const isDark = isDarkPaperColor(getEffectivePaperColor(page));
      for (const hSim of heatSims) {
        if (!hSim) continue;
        renderHeatSimulation(
          ctx,
          {
            ...hSim,
            selectedObjectId: null,
            selectedObjectIds: [],
          },
          { isDark, layer: 'all' }
        );
      }
      ctx.restore();
    }, [page, heatSims, width, height, scale]);

    if (!heatSims || heatSims.length === 0) return null;

    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${className}`}
      />
    );
  }
);
