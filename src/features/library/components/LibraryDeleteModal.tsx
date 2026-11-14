import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Notebook } from '../../../types/note';

export interface LibraryDeleteModalProps {
  pendingDeleteNotebook: Notebook | null;
  onCancel: () => void;
  onConfirm: (nb: Notebook) => void;
}

export const LibraryDeleteModal: React.FC<LibraryDeleteModalProps> = ({
  pendingDeleteNotebook,
  onCancel,
  onConfirm,
}) => {
  if (!pendingDeleteNotebook) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[220] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm ipados-liquid-glass bg-[#fdfbf7]/38 backdrop-blur-2xl backdrop-saturate-200 rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.95)] border border-white/85 ring-1 ring-black/5 p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 mb-4 shadow-2xs">
          <Trash2 className="w-7 h-7" />
        </div>

        <h3 className="text-base font-extrabold text-[#1b2a4a]">Διαγραφή Σημείωσης;</h3>

        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Είσαι σίγουρος ότι θέλεις να διαγράψεις τη σημείωση{' '}
          <span className="font-bold text-[#1b2a4a]">«{pendingDeleteNotebook.title}»</span> (
          {pendingDeleteNotebook.pages.length}{' '}
          {pendingDeleteNotebook.pages.length === 1 ? 'σελίδα' : 'σελίδες'});
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2.5 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Ακύρωση
          </button>
          <button
            type="button"
            onClick={() => onConfirm(pendingDeleteNotebook)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Διαγραφή</span>
          </button>
        </div>
      </div>
    </div>
  );
};
