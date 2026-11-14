import React from 'react';
import { Share2 } from 'lucide-react';

export interface PendingShareFile {
  file: File;
  title: string;
}

export interface NativeShareSheetModalProps {
  pendingShareFile: PendingShareFile | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const NativeShareSheetModal: React.FC<NativeShareSheetModalProps> = ({
  pendingShareFile,
  onClose,
  onToast,
}) => {
  if (!pendingShareFile) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        data-ui-panel="true"
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl ipados-liquid-glass bg-[#fdfbf7]/38 backdrop-blur-2xl backdrop-saturate-200 text-[#2c3e50] border border-white/85 p-6 w-full max-w-sm shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 space-y-4 text-center"
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#234978]">
          <Share2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#1b2a4a]">
            Το PDF «{pendingShareFile.title}.pdf» είναι έτοιμο!
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Πάτησε παρακάτω για να ανοίξει το παράθυρο κοινοποίησης του iPadOS (AirDrop, Viber, Messenger, Goodnotes, Mail, Αρχεία).
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={async () => {
              const ready = pendingShareFile;
              onClose();
              try {
                await navigator.share({
                  files: [ready.file],
                });
                onToast(`✅ Κοινοποιήθηκε το «${ready.file.name}»!`);
              } catch (err: any) {
                if (err?.name !== 'AbortError') {
                  const url = URL.createObjectURL(ready.file);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = ready.file.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
                }
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#234978] hover:bg-blue-600 text-white text-sm font-bold shadow-md cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Άνοιγμα iPadOS Share ({pendingShareFile.title}.pdf)</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
          >
            Ακύρωση
          </button>
        </div>
      </div>
    </div>
  );
};
