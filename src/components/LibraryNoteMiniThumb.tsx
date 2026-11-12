import React, { useMemo } from 'react';
import {
  getEffectivePaperColor,
  getPageLogicalHeight,
  getPageLogicalWidth,
  getPaperRuleColors,
  type NotePage,
} from '../types/note';
import { computeResistorOrSpringPoints } from '../utils/geometryAndAlgorithms';
import {
  decimatePointsForMiniThumb,
  selectStrokesForMiniThumb,
} from '../utils/libraryUiHelpers';

export interface LibraryNoteMiniThumbProps {
  notebookId: string;
  title: string;
  updatedAt?: string;
  coverColor: string;
  firstPage?: NotePage;
  p0BgUrl?: string;
  variant: 'list' | 'recent' | 'preview';
  className?: string;
  style?: React.CSSProperties;
}

const MINI_THUMB_CONFIG = {
  list: {
    containerClass: 'w-10 h-[52px] rounded-r-lg rounded-l-[4px]',
    spineClass: 'w-1.5',
    svgPadClass: 'pl-1.5',
    maxStrokes: 160,
    maxPts: 14,
    maxImages: 24,
    maxTexts: 64,
    maxLinesPerText: 6,
    minStrokeWidth: 4.5,
    gridPx: '7px 7px',
  },
  recent: {
    containerClass: 'w-[76px] h-[102px] rounded-r-xl rounded-l-md',
    spineClass: 'w-2',
    svgPadClass: 'pl-2',
    maxStrokes: 240,
    maxPts: 20,
    maxImages: 24,
    maxTexts: 80,
    maxLinesPerText: 10,
    minStrokeWidth: 3.2,
    gridPx: '10px 10px',
  },
  preview: {
    containerClass: 'w-full h-full rounded-r-xl rounded-l-md',
    spineClass: 'w-2.5',
    svgPadClass: 'pl-2.5',
    maxStrokes: 500,
    maxPts: 48,
    maxImages: 24,
    maxTexts: 100,
    maxLinesPerText: 16,
    minStrokeWidth: 2.2,
    gridPx: '14px 14px',
  },
} as const;

function formatTextSnippetForMiniThumb(raw: string): string {
  return raw
    .replace(/\u200B/g, '')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\(?:text|mathrm|mathbf|mathit|vec)\{([^}]*)\}/g, '$1')
    .replace(/\\Delta(?![A-Za-z])/g, 'Δ')
    .replace(/\\Sigma(?![A-Za-z])/g, 'Σ')
    .replace(/\\Omega(?![A-Za-z])/g, 'Ω')
    .replace(/\\pi(?![A-Za-z])/g, 'π')
    .replace(/\\cdot(?![A-Za-z])/g, '·')
    .replace(/\\times(?![A-Za-z])/g, '×')
    .replace(/\\simeq(?![A-Za-z])/g, '≃')
    .replace(/\\approx(?![A-Za-z])/g, '≈')
    .replace(/\\rightarrow|\\to(?![A-Za-z])/g, '→')
    .replace(/\\[A-Za-z]+|\{|\}|\$/g, '')
    .trim();
}

function wrapTextLinesApprox(
  text: string,
  boxWidth: number | undefined,
  fontSize: number,
  maxLines: number
): string[] {
  const maxChars = boxWidth
    ? Math.max(8, Math.floor(boxWidth / Math.max(8, fontSize * 0.56)))
    : 42;
  const out: string[] = [];
  for (const para of text.split(/\r?\n/)) {
    const trimmed = para.trim();
    if (!trimmed) {
      if (out.length < maxLines) out.push('');
      continue;
    }
    let cur = '';
    for (const word of trimmed.split(/\s+/)) {
      if (!cur) {
        cur = word.length > maxChars ? word.slice(0, maxChars) : word;
      } else if (cur.length + 1 + word.length <= maxChars) {
        cur += ` ${word}`;
      } else {
        out.push(cur);
        if (out.length >= maxLines) return out;
        cur = word.length > maxChars ? word.slice(0, maxChars) : word;
      }
    }
    if (cur && out.length < maxLines) out.push(cur);
    if (out.length >= maxLines) return out;
  }
  return out;
}

const LibraryNoteMiniThumbInner: React.FC<LibraryNoteMiniThumbProps> = ({
  title,
  coverColor,
  firstPage,
  p0BgUrl,
  variant,
  className = '',
  style,
}) => {
  const cfg = MINI_THUMB_CONFIG[variant];
  const pW = getPageLogicalWidth(firstPage);
  const pH = getPageLogicalHeight(firstPage);
  const hasDocBg = Boolean(p0BgUrl || firstPage?.pdfPageNumber);

  const paperStyle = useMemo(() => {
    const bgColor = hasDocBg ? '#ffffff' : getEffectivePaperColor(firstPage);
    const rules = getPaperRuleColors(bgColor);
    const tpl = firstPage?.template;
    let bgImage: string | undefined;
    if (!hasDocBg) {
      if (tpl === 'grid' || tpl === 'dark-grid' || !tpl) {
        bgImage = `linear-gradient(to right, ${rules.grid} 1px, transparent 1px), linear-gradient(to bottom, ${rules.grid} 1px, transparent 1px)`;
      } else if (tpl === 'ruled' || tpl === 'cornell') {
        bgImage = `linear-gradient(to bottom, ${rules.grid} 1px, transparent 1px)`;
      } else if (tpl === 'dotted') {
        bgImage = `radial-gradient(${rules.dot} 1px, transparent 1px)`;
      }
    }
    return {
      backgroundColor: bgColor,
      backgroundImage: bgImage,
      backgroundSize: cfg.gridPx,
    };
  }, [firstPage, hasDocBg, cfg.gridPx]);

  const svgShapes = useMemo(() => {
    if (!firstPage) return null;
    const rawStrokes = firstPage.strokes || [];
    const chosen = selectStrokesForMiniThumb(rawStrokes, cfg.maxStrokes);

    const strokeEls = chosen.map((st) => {
      if (!st.points || st.points.length === 0) return null;
      if (st.points.length === 1) {
        return (
          <circle
            key={st.id}
            cx={Math.round(st.points[0].x)}
            cy={Math.round(st.points[0].y)}
            r={Math.max(4, st.width * 1.3)}
            fill={st.color}
          />
        );
      }
      const renderPts =
        (st.shapeType === 'resistor' || st.shapeType === 'spring') &&
        st.points.length >= 4
          ? computeResistorOrSpringPoints(st.shapeType, st.points)
          : st.points;
      const simplePts = decimatePointsForMiniThumb(renderPts, cfg.maxPts);
      const ptsStr = simplePts.map((pt) => `${pt.x},${pt.y}`).join(' ');
      return (
        <polyline
          key={st.id}
          fill={st.fillStyle && st.fillStyle !== 'none' ? st.color : 'none'}
          fillOpacity={Math.max(
            0.08,
            Math.min(0.9, (100 - (st.fillTransparency ?? 90)) / 100)
          )}
          stroke={st.color}
          strokeWidth={Math.max(cfg.minStrokeWidth, st.width * 1.4)}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={st.opacity ?? 1}
          points={ptsStr}
        />
      );
    });

    const imageEls = (firstPage.images || []).slice(0, cfg.maxImages).map((im) => (
      <image
        key={im.id}
        href={im.dataUrl}
        x={Math.round(im.x)}
        y={Math.round(im.y)}
        width={Math.round(im.width)}
        height={Math.round(im.height)}
      />
    ));

    const textEls = (firstPage.texts || []).slice(0, cfg.maxTexts).map((tx) => {
      const raw = (tx.isMath ? tx.latex || tx.text : tx.text || tx.latex) || '';
      const cleaned = formatTextSnippetForMiniThumb(raw);
      if (!cleaned) return null;
      const fSize = Math.max(16, tx.fontSize || 22);
      const lineStep = fSize * 1.25;
      const lines = wrapTextLinesApprox(cleaned, tx.boxWidth, fSize, cfg.maxLinesPerText);
      if (lines.length === 0) return null;
      return (
        <text
          key={tx.id}
          x={Math.round(tx.x)}
          y={Math.round(tx.y + fSize * 0.9)}
          fontSize={fSize}
          fontWeight={tx.bold ? '700' : '500'}
          fill={tx.color || '#1e293b'}
        >
          {lines.map((line, lIdx) => (
            <tspan key={lIdx} x={Math.round(tx.x)} dy={lIdx === 0 ? 0 : lineStep}>
              {line}
            </tspan>
          ))}
        </text>
      );
    });

    return { strokeEls, imageEls, textEls };
  }, [
    firstPage,
    cfg.maxStrokes,
    cfg.maxPts,
    cfg.maxImages,
    cfg.maxTexts,
    cfg.maxLinesPerText,
    cfg.minStrokeWidth,
  ]);

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-slate-300/90 shadow-2xs select-none pointer-events-none ${cfg.containerClass} ${className}`}
      style={{ ...paperStyle, ...style }}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 z-10 ${cfg.spineClass}`}
        style={{ backgroundColor: coverColor }}
      />
      {p0BgUrl && (
        <img
          src={p0BgUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`absolute inset-0 w-full h-full object-cover ${cfg.svgPadClass}`}
        />
      )}
      {svgShapes && (
        <svg
          viewBox={`0 0 ${pW} ${pH}`}
          preserveAspectRatio="xMidYMid meet"
          className={`absolute inset-0 w-full h-full ${cfg.svgPadClass}`}
        >
          {svgShapes.imageEls}
          {svgShapes.strokeEls}
          {svgShapes.textEls}
        </svg>
      )}
    </div>
  );
};

export const LibraryNoteMiniThumb = React.memo(
  LibraryNoteMiniThumbInner,
  (prev, next) =>
    prev.notebookId === next.notebookId &&
    prev.updatedAt === next.updatedAt &&
    prev.coverColor === next.coverColor &&
    prev.p0BgUrl === next.p0BgUrl &&
    prev.variant === next.variant &&
    prev.firstPage === next.firstPage &&
    prev.className === next.className &&
    prev.style?.width === next.style?.width &&
    prev.style?.height === next.style?.height
);
