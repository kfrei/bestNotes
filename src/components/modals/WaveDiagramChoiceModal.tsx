import React from 'react';

export interface WaveDiagramPromptData {
  info: {
    depName: string;
    depSymbol: string;
  };
  displayEq: string;
}

export interface WaveDiagramChoiceModalProps {
  waveDiagramPrompt: WaveDiagramPromptData | null;
  onConfirm: (mode: 'snapshot-x' | 'oscillation-t' | 'both') => void;
  onClose: () => void;
}

export const WaveDiagramChoiceModal: React.FC<WaveDiagramChoiceModalProps> = ({
  waveDiagramPrompt,
  onConfirm,
  onClose,
}) => {
  if (!waveDiagramPrompt) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl ipados-liquid-glass bg-[#fdfbf7]/38 backdrop-blur-2xl backdrop-saturate-200 border border-white/85 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 p-5 flex flex-col gap-3.5 text-[#2c3e50]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-lg">
              🌊
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Εξίσωση Κύματος Δύο Μεταβλητών (x, t)
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Μέγεθος:{' '}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {waveDiagramPrompt.info.depName} ({waveDiagramPrompt.info.depSymbol})
                </span>{' '}
                • Ποιο διάγραμμα θέλετε να σχεδιαστεί;
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
            title="Κλείσιμο"
          >
            ✕
          </button>
        </div>

        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-200 truncate">
          {waveDiagramPrompt.displayEq}
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onConfirm('snapshot-x')}
            className="w-full text-left p-3.5 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 transition-all cursor-pointer flex items-start gap-3"
          >
            <span className="text-xl leading-none mt-0.5">📸</span>
            <div className="flex-1">
              <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Στιγμιότυπο Κύματος {waveDiagramPrompt.info.depSymbol} = f(x) με t = σταθ.
              </div>
              <div className="text-[11px] text-blue-700/90 dark:text-blue-300/80 mt-0.5 leading-snug">
                Γραφική παράσταση {waveDiagramPrompt.info.depSymbol}(x) τη χρονική στιγμή t₁ σε
                συνάρτηση με τη θέση x (μέτωπο κύματος x₁ = u·t₁, ακίνητα σημεία για x &gt; x₁).
              </div>
            </div>
          </button>

          <button
            onClick={() => onConfirm('oscillation-t')}
            className="w-full text-left p-3.5 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-950/40 hover:bg-red-100/80 dark:hover:bg-red-900/50 transition-all cursor-pointer flex items-start gap-3"
          >
            <span className="text-xl leading-none mt-0.5">⏱️</span>
            <div className="flex-1">
              <div className="text-xs font-bold text-red-900 dark:text-red-200">
                Διάγραμμα Ταλάντωσης Σημείου {waveDiagramPrompt.info.depSymbol} = f(t) με x = σταθ.
              </div>
              <div className="text-[11px] text-red-700/90 dark:text-red-300/80 mt-0.5 leading-snug">
                Γραφική παράσταση {waveDiagramPrompt.info.depSymbol}(t) για συγκεκριμένο σημείο x₁:
                παραμένει ακίνητο (0) από t = 0 έως t_αφ = x/u και εκτελεί Α.Α.Τ. για t ≥ t_αφ!
              </div>
            </div>
          </button>

          <button
            onClick={() => onConfirm('both')}
            className="w-full text-left p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition-all cursor-pointer flex items-center gap-3"
          >
            <span className="text-lg leading-none">📊</span>
            <div className="flex-1">
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Και τα δύο Διαγράμματα ({waveDiagramPrompt.info.depSymbol} = f(x) &amp;{' '}
                {waveDiagramPrompt.info.depSymbol} = f(t))
              </div>
              <div className="text-[11px] text-emerald-700/90 dark:text-emerald-300/80">
                Σχεδιάζει το στιγμιότυπο κύματος και από κάτω το διάγραμμα ταλάντωσης (από t_αφ =
                x/u).
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          Ακύρωση
        </button>
      </div>
    </div>
  );
};
