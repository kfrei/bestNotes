import React from 'react';

export interface FullscreenLaserCanvasProps {
  canvasRef: React.Ref<HTMLCanvasElement | null>;
  activeTool: string;
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  dpr?: number;
}

export const FullscreenLaserCanvas: React.FC<FullscreenLaserCanvasProps> = ({
  canvasRef,
}) => {
  return (
    <canvas
      ref={canvasRef}
      id="global-laser-canvas"
      width={1}
      height={1}
      style={{
        display: 'none',
        pointerEvents: 'none',
      }}
    />
  );
};
