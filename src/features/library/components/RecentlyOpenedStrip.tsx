import React, { useEffect, useRef, useState } from 'react';
import type { Notebook, NotePage } from '../../../types/note';
import { LibraryNoteMiniThumb } from '../../../components/LibraryNoteMiniThumb';

function computeVisibleRecentCount(containerWidth: number): number {
  if (containerWidth >= 1260) return 6;
  if (containerWidth >= 1000) return 5;
  if (containerWidth >= 700) return 4;
  if (containerWidth >= 480) return 3;
  return 2;
}

export interface RecentlyOpenedStripProps {
  recentlyOpenedNotebooks: Notebook[];
  recentOpenedAtMap: Record<string, number>;
  resolvePageBackgroundUrl: (
    notebookId: string,
    page: NotePage | undefined,
    mode?: 'full' | 'thumb'
  ) => string | undefined;
  resolveNotebookSpineColor: (nb: Notebook) => string;
  getNotebookSizeBytes: (nb: Notebook) => number;
  formatNotebookSizeLabel: (bytes: number) => string;
  formatRecentRelativeLabel: (isoOrTs: string | number) => string;
  onOpenNotebook: (nb: Notebook) => void;
  onNotebookPointerDrag: (e: React.PointerEvent<HTMLDivElement>, nb: Notebook) => void;
  onThumbPointerEnter: (e: React.PointerEvent<HTMLDivElement>, nbId: string) => void;
  onClearThumbHover: (nbId?: string) => void;
  isLoading?: boolean;
}

export const RecentlyOpenedStrip: React.FC<RecentlyOpenedStripProps> = ({
  recentlyOpenedNotebooks,
  recentOpenedAtMap,
  resolvePageBackgroundUrl,
  resolveNotebookSpineColor,
  getNotebookSizeBytes,
  formatNotebookSizeLabel,
  formatRecentRelativeLabel,
  onOpenNotebook,
  onNotebookPointerDrag,
  onThumbPointerEnter,
  onClearThumbHover,
  isLoading = false,
}) => {
  void recentOpenedAtMap;
  void formatRecentRelativeLabel;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(() =>
    typeof window !== 'undefined'
      ? computeVisibleRecentCount(Math.max(320, window.innerWidth - 64))
      : 6
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) {
        const next = computeVisibleRecentCount(w);
        setVisibleCount((prev) => (prev === next ? prev : next));
      }
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recentlyOpenedNotebooks.length, isLoading]);

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))`,
  };

  // Skeleton shimmer placeholder while library data is loading (zero CLS, responsive 2-6 compact vertical cards)
  if (isLoading && recentlyOpenedNotebooks.length === 0) {
    return (
      <div ref={containerRef} className="bn-library-cascade-4 select-none pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Πρόσφατα Ανοιγμένα
          </h2>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
        </div>
        <div className="grid gap-5 sm:gap-6 lg:gap-7 xl:gap-8" style={gridStyle}>
          {Array.from({ length: visibleCount }).map((_, idx) => (
            <div
              key={`recent-skel-${idx}`}
              className="aspect-[3/4] rounded-r-2xl rounded-l-md relative overflow-hidden bn-shimmer border border-slate-200/90 shadow-2xs"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-slate-300/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentlyOpenedNotebooks.length === 0) return null;

  return (
    <div ref={containerRef} className="bn-library-cascade-4">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
        Πρόσφατα Ανοιγμένα
      </h2>
      <div className="grid gap-5 sm:gap-6 lg:gap-7 xl:gap-8" style={gridStyle}>
        {recentlyOpenedNotebooks.slice(0, visibleCount).map((rNb) => {
          const p0Url = resolvePageBackgroundUrl(rNb.id, rNb.pages[0], 'thumb');
          const spineColor = resolveNotebookSpineColor(rNb);
          const rNbBytes = getNotebookSizeBytes(rNb);
          const rNbSizeLabel = formatNotebookSizeLabel(rNbBytes);
          const fullFolderPath = rNb.folder
            ? rNb.folder
                .split('/')
                .map((s) => s.trim())
                .filter(Boolean)
                .join(' / ')
            : 'Βιβλιοθήκη';

          return (
            <div
              key={`recent-${rNb.id}`}
              onPointerDown={(e) => {
                onClearThumbHover();
                onNotebookPointerDrag(e, rNb);
              }}
              onPointerEnter={(e) => onThumbPointerEnter(e, rNb.id)}
              onPointerLeave={() => onClearThumbHover(rNb.id)}
              onClick={() => onOpenNotebook(rNb)}
              title={`Άνοιγμα «${rNb.title}» (${fullFolderPath})`}
              className="group relative aspect-[3/4] rounded-r-2xl rounded-l-md overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer select-none ring-1 ring-slate-200/90 hover:ring-[#234978]/35"
            >
              {/* Full-bleed paper thumbnail with colored left spine */}
              <LibraryNoteMiniThumb
                notebookId={rNb.id}
                title={rNb.title}
                updatedAt={rNb.updatedAt}
                coverColor={spineColor}
                firstPage={rNb.pages[0]}
                p0BgUrl={p0Url}
                variant="recent"
                className="w-full h-full border-0 shadow-none"
              />

              {/* Soft warm beige-grey graduated veil over paper content for calm visual cohesion (lifts slightly on hover) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-2.5 right-0 z-[12] transition-opacity duration-200 group-hover:opacity-45"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(244, 241, 234, 0.56) 0%, rgba(236, 233, 226, 0.36) 44%, rgba(232, 229, 222, 0.58) 100%)',
                }}
              />

              {/* Top Frosted Liquid Glass Ribbon (inset lower from top edge, full-width over spine) */}
              <div className="absolute top-6 left-0 right-0 z-20 pl-3.5 pr-2.5 py-2 bg-slate-200/68 backdrop-blur-[3px] border-y border-slate-300/75 shadow-[0_2px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.65)]">
                <p className="text-[11.5px] font-bold text-[#0f172a] group-hover:text-[#234978] truncate leading-snug">
                  {rNb.title}
                </p>
              </div>

              {/* Bottom Frosted Liquid Glass Ribbon (inset from bottom edge, full-width over spine) */}
              <div className="absolute bottom-3 left-0 right-0 z-20 pl-3.5 pr-2.5 py-2 bg-slate-200/68 backdrop-blur-[3px] border-y border-slate-300/75 shadow-[0_2px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] flex items-center justify-between gap-1.5">
                <span
                  className="inline-block max-w-[74%] truncate px-2 py-0.5 rounded-md text-white text-[9.5px] font-bold leading-tight shadow-2xs"
                  style={{ backgroundColor: spineColor }}
                >
                  {fullFolderPath}
                </span>
                <span className="text-[9.5px] font-semibold text-slate-700 tabular-nums shrink-0">
                  {rNbSizeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
