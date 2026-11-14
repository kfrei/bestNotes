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
  activeTool,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  dpr = 2,
}) => {
  const isLaserActive = activeTool === 'laser';
  const widthPx = typeof window !== 'undefined'
    ? Math.round(window.innerWidth * (window.devicePixelRatio || dpr || 1))
    : 1920;
  const heightPx = typeof window !== 'undefined'
    ? Math.round(window.innerHeight * (window.devicePixelRatio || dpr || 1))
    : 1080;

  return (
    <canvas
      ref={canvasRef}
      id="global-laser-canvas"
      width={widthPx}
      height={heightPx}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100000,
        pointerEvents: isLaserActive ? 'auto' : 'none',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: isLaserActive ? 'crosshair' : 'default',
      }}
    />
  );
};
