import React from 'react';
import type { Notebook, NotePage } from '../../../types/note';
import { LibraryNoteMiniThumb } from '../../../components/LibraryNoteMiniThumb';

export interface RecentlyOpenedStripProps {
  recentlyOpenedNotebooks: Notebook[];
  recentOpenedAtMap: Record<string, number>;
  resolvePageBackgroundUrl: (
    notebookId: string,
    page: NotePage | undefined,
    mode?: 'full' | 'thumb'
  ) => string | undefined;
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

  // Skeleton shimmer placeholder while library data is loading (zero CLS, 6 compact vertical cards)
  if (isLoading && recentlyOpenedNotebooks.length === 0) {
    return (
      <div className="bn-library-cascade-4 select-none pointer-events-none">
        <div className="flex items-center gap-2 mb-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Πρόσφατα Ανοιγμένα
          </h2>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
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
    <div className="bn-library-cascade-4">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
        Πρόσφατα Ανοιγμένα
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {recentlyOpenedNotebooks.slice(0, 6).map((rNb) => {
          const p0Url = resolvePageBackgroundUrl(rNb.id, rNb.pages[0], 'thumb');
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
                coverColor={rNb.coverColor}
                firstPage={rNb.pages[0]}
                p0BgUrl={p0Url}
                variant="recent"
                className="w-full h-full border-0 shadow-none"
              />

              {/* Top Liquid Grey Glass Strip on the paper: Title */}
              <div className="absolute top-0 left-2.5 right-0 z-10 px-2.5 py-1.5 bg-slate-200/72 backdrop-blur-md border-b border-white/65 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <p className="text-[11.5px] font-bold text-[#0f172a] group-hover:text-[#234978] truncate leading-tight">
                  {rNb.title}
                </p>
              </div>

              {/* Bottom Liquid Grey Glass Strip on the paper: Folder Path + Size */}
              <div className="absolute bottom-0 left-2.5 right-0 z-10 px-2 py-1.5 bg-slate-200/72 backdrop-blur-md border-t border-white/65 flex items-center justify-between gap-1.5">
                <span className="inline-block max-w-[76%] truncate px-2 py-0.5 rounded-md bg-[#234978]/90 text-white text-[9.5px] font-bold leading-tight shadow-2xs">
                  {fullFolderPath}
                </span>
                <span className="text-[9.5px] font-semibold text-slate-600 tabular-nums shrink-0">
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
