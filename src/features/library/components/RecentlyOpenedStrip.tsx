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
}) => {
  if (recentlyOpenedNotebooks.length === 0) return null;

  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
        Πρόσφατα Ανοιγμένα
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {recentlyOpenedNotebooks.map((rNb) => {
          const recentTs = Math.max(
            recentOpenedAtMap[rNb.id] || 0,
            new Date(rNb.updatedAt || 0).getTime() || 0
          );
          const p0Url = resolvePageBackgroundUrl(rNb.id, rNb.pages[0], 'thumb');
          const rNbBytes = getNotebookSizeBytes(rNb);
          const rNbSizeLabel = formatNotebookSizeLabel(rNbBytes);

          return (
            <div
              key={`recent-${rNb.id}`}
              onPointerDown={(e) => {
                onClearThumbHover();
                onNotebookPointerDrag(e, rNb);
              }}
              onClick={() => onOpenNotebook(rNb)}
              className="group bg-white/95 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-3 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition flex items-center gap-3.5 cursor-pointer select-none"
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
                  coverColor={rNb.coverColor}
                  firstPage={rNb.pages[0]}
                  p0BgUrl={p0Url}
                  variant="recent"
                  className="group-hover:shadow-sm transition"
                />
              </div>
              <div
                className="min-w-0 flex-1 flex flex-col justify-between self-stretch py-0.5"
                title={`Άνοιγμα «${rNb.title}»`}
              >
                <div>
                  <p className="text-[13px] font-bold text-[#0f172a] group-hover:text-[#234978] line-clamp-2 leading-snug">
                    {rNb.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {formatRecentRelativeLabel(recentTs || rNb.updatedAt)}
                  </p>
                  <p className="text-[10.5px] font-semibold text-slate-400 mt-0.5 tabular-nums">
                    {rNbSizeLabel}
                  </p>
                </div>
                <span className="inline-block self-start max-w-full truncate px-2 py-0.5 rounded-md bg-indigo-50/90 text-[#234978] text-[10.5px] font-semibold mt-2">
                  {rNb.folder || 'Βιβλιοθήκη'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
