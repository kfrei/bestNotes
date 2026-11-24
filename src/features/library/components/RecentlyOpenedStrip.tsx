import React, { useEffect, useRef, useState } from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import type { Notebook, NotePage } from '../../../types/note';
import { LibraryNoteMiniThumb } from '../../../components/LibraryNoteMiniThumb';

const RECENT_VIEW_MODE_KEY = 'bestnotes_recent_view_mode_v1';
type RecentViewMode = 'cards' | 'horizontal';

function readSavedRecentViewMode(): RecentViewMode {
  try {
    const raw = window.localStorage.getItem(RECENT_VIEW_MODE_KEY);
    if (raw === 'horizontal' || raw === 'cards') return raw;
  } catch {
    // ignore storage errors
  }
  return 'cards';
}

function computeVisibleRecentCount(containerWidth: number): number {
  if (containerWidth >= 1260) return 6;
  if (containerWidth >= 1000) return 5;
  if (containerWidth >= 700) return 4;
  if (containerWidth >= 480) return 3;
  return 2;
}

function computeVisibleHorizontalRecentCount(containerWidth: number): number {
  if (containerWidth >= 1340) return 5;
  if (containerWidth >= 1040) return 4;
  if (containerWidth >= 760) return 3;
  if (containerWidth >= 500) return 2;
  return 1;
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
  const [recentViewMode, setRecentViewMode] = useState<RecentViewMode>(() =>
    typeof window !== 'undefined' ? readSavedRecentViewMode() : 'cards'
  );
  const [visibleCount, setVisibleCount] = useState<number>(() =>
    typeof window !== 'undefined'
      ? computeVisibleRecentCount(Math.max(320, window.innerWidth - 64))
      : 6
  );
  const [visibleHorizontalCount, setVisibleHorizontalCount] = useState<number>(() =>
    typeof window !== 'undefined'
      ? computeVisibleHorizontalRecentCount(Math.max(320, window.innerWidth - 64))
      : 5
  );

  const toggleRecentViewMode = () => {
    setRecentViewMode((prev) => {
      const next: RecentViewMode = prev === 'cards' ? 'horizontal' : 'cards';
      try {
        window.localStorage.setItem(RECENT_VIEW_MODE_KEY, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) {
        const nextCards = computeVisibleRecentCount(w);
        const nextHoriz = computeVisibleHorizontalRecentCount(w);
        setVisibleCount((prev) => (prev === nextCards ? prev : nextCards));
        setVisibleHorizontalCount((prev) => (prev === nextHoriz ? prev : nextHoriz));
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
  const horizGridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${visibleHorizontalCount}, minmax(0, 1fr))`,
  };

  // Skeleton shimmer placeholder while library data is loading (zero CLS, matches active viewMode)
  if (isLoading && recentlyOpenedNotebooks.length === 0) {
    return (
      <div ref={containerRef} className="bn-library-cascade-4 select-none pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Πρόσφατα Ανοιγμένα
          </h2>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
        </div>
        {recentViewMode === 'horizontal' ? (
          <div className="grid gap-3.5" style={horizGridStyle}>
            {Array.from({ length: visibleHorizontalCount }).map((_, idx) => (
              <div
                key={`recent-skel-${idx}`}
                className="bg-white/95 rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-4"
              >
                <div className="w-[82px] h-[110px] rounded-r-xl rounded-l-md shrink-0 relative overflow-hidden bn-shimmer border border-slate-200/80 shadow-2xs">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-300/60" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between self-stretch py-1">
                  <div>
                    <div className="h-5 w-32 rounded-md bn-shimmer mb-2" />
                    <div className="h-4 w-4/5 rounded-md bn-shimmer" />
                  </div>
                  <div className="h-3 w-1/3 rounded-md bn-shimmer mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  if (recentlyOpenedNotebooks.length === 0) return null;

  return (
    <div ref={containerRef} className="bn-library-cascade-4">
      <button
        type="button"
        onClick={toggleRecentViewMode}
        className="group/hdr inline-flex items-center gap-1.5 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#1b2a4a] transition cursor-pointer select-none focus:outline-none"
        title={
          recentViewMode === 'cards'
            ? 'Πάτα για εναλλαγή σε οριζόντιες κάρτες'
            : 'Πάτα για εναλλαγή σε κάθετες μικρογραφίες'
        }
      >
        <span>Πρόσφατα Ανοιγμένα</span>
        {recentViewMode === 'cards' ? (
          <LayoutList className="w-3.5 h-3.5 text-slate-400 group-hover/hdr:text-[#234978] transition-colors" />
        ) : (
          <LayoutGrid className="w-3.5 h-3.5 text-slate-400 group-hover/hdr:text-[#234978] transition-colors" />
        )}
      </button>

      {recentViewMode === 'horizontal' ? (
        <div className="grid gap-3.5" style={horizGridStyle}>
          {recentlyOpenedNotebooks.slice(0, visibleHorizontalCount).map((rNb) => {
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
                key={`recent-horiz-${rNb.id}`}
                onPointerDown={(e) => {
                  onClearThumbHover();
                  onNotebookPointerDrag(e, rNb);
                }}
                onClick={() => onOpenNotebook(rNb)}
                className="group bg-white/95 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-3.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition flex items-center gap-4 cursor-pointer select-none"
              >
                <div
                  onPointerEnter={(e) => onThumbPointerEnter(e, rNb.id)}
                  onPointerLeave={() => onClearThumbHover(rNb.id)}
                  className="shrink-0"
                >
                  <LibraryNoteMiniThumb
                    notebookId={rNb.id}
                    title={rNb.title}
                    updatedAt={rNb.updatedAt}
                    coverColor={spineColor}
                    firstPage={rNb.pages[0]}
                    p0BgUrl={p0Url}
                    variant="recent"
                    className="!w-[82px] !h-[110px] rounded-r-xl rounded-l-md group-hover:shadow-sm transition"
                  />
                </div>
                <div
                  className="min-w-0 flex-1 flex flex-col justify-between self-stretch py-1"
                  title={`Άνοιγμα «${rNb.title}» (${fullFolderPath})`}
                >
                  <div>
                    <span className="inline-block max-w-full break-words px-2.5 py-0.5 rounded-lg bg-indigo-50/90 text-[#234978] text-[10.5px] font-semibold leading-snug mb-1.5">
                      {fullFolderPath}
                    </span>
                    <p className="text-[13.5px] font-bold text-[#0f172a] group-hover:text-[#234978] line-clamp-2 leading-snug">
                      {rNb.title}
                    </p>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1.5 tabular-nums">
                    {rNbSizeLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
              className="group relative aspect-[3/4] rounded-r-2xl rounded-l-md overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer select-none ring-1 ring-slate-200/90 hover:ring-[#234978]/35 bg-white"
            >
              {/* Pure crisp white squared paper with live page content & colored left spine */}
              <LibraryNoteMiniThumb
                notebookId={rNb.id}
                title={rNb.title}
                updatedAt={rNb.updatedAt}
                coverColor={spineColor}
                firstPage={rNb.pages[0]}
                p0BgUrl={p0Url}
                variant="recent"
                forceWhitePaper
                className="w-full h-full border-0 shadow-none"
              />

              {/* Top Frosted Liquid Glass Ribbon (slightly deeper slate-grey, inset from top, full-width over spine) */}
              <div className="absolute top-6 left-0 right-0 z-20 pl-3.5 pr-2.5 py-2 bg-slate-300/72 backdrop-blur-[3px] border-y border-slate-400/55 shadow-[0_2px_10px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]">
                <p className="text-[11.5px] font-bold text-[#0f172a] group-hover:text-[#234978] truncate leading-snug">
                  {rNb.title}
                </p>
              </div>

              {/* Bottom Frosted Liquid Glass Ribbon (slightly deeper slate-grey, inset from bottom, full-width over spine) */}
              <div className="absolute bottom-3 left-0 right-0 z-20 pl-3.5 pr-2.5 py-2 bg-slate-300/72 backdrop-blur-[3px] border-y border-slate-400/55 shadow-[0_2px_10px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] flex items-center justify-between gap-1.5">
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
      )}
    </div>
  );
};
