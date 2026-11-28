import React from 'react';
import {
  Pen,
  Eraser,
  Shapes,
  Radio,
  Lasso,
  Scissors,
  Image as ImageIcon,
  Ruler,
  Highlighter,
  Type,
  Layers,
  X,
  Sparkles,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import {
  type NotePage,
  type PaperTemplateType,
  PAPER_WHITE_GREY_SWATCHES,
  PAPER_BEIGE_VINTAGE_SWATCHES,
  getEffectivePaperColor,
  isDarkPaperColor,
  getPaperRuleColors,
} from '../../types/note';
import { WarmStudioToggle } from '../WarmStudioToggle';

interface PageSettingsModalProps {
  open: boolean;
  onClose: () => void;
  activePage: NotePage;
  updateActivePage: (updater: (page: NotePage) => NotePage, recordUndo?: boolean) => void;
  onRotatePage: (direction: 'left' | 'right') => void;
  holdToSnapEnabled: boolean;
  onChangeHoldToSnap: (val: boolean) => void;
  scribbleToEraseEnabled: boolean;
  onChangeScribbleToErase: (val: boolean) => void;
  doubleTapEmptyEraserEnabled: boolean;
  onChangeDoubleTapEmptyEraser: (val: boolean) => void;
  bezierNodesIcon: React.ReactNode;
}

const PageSettingsModalInner: React.FC<PageSettingsModalProps> = ({
  open,
  onClose,
  activePage,
  updateActivePage,
  onRotatePage,
  holdToSnapEnabled,
  onChangeHoldToSnap,
  scribbleToEraseEnabled,
  onChangeScribbleToErase,
  doubleTapEmptyEraserEnabled,
  onChangeDoubleTapEmptyEraser,
  bezierNodesIcon,
}) => {
  if (!open) return null;

  const activePaperHex = getEffectivePaperColor(activePage);
  const activePattern: PaperTemplateType =
    activePage.template === 'dark-grid' ? 'grid' : activePage.template || 'grid';
  const activeRules = getPaperRuleColors(activePaperHex);
  const isLand = activePage.orientation === 'landscape';
  const allSwatches = [
    ...PAPER_WHITE_GREY_SWATCHES,
    ...PAPER_BEIGE_VINTAGE_SWATCHES,
    { id: 'dark-slate', hex: '#0f172a', label: 'Σκούρο' },
  ];
  const activeColorLabel =
    allSwatches.find((s) => s.hex.toLowerCase() === activePaperHex.toLowerCase())?.label ||
    'Κρεμ Χαρτί';

  const renderMiniPatternSvg = (
    pat: PaperTemplateType,
    wBox: number,
    hBox: number,
    stepPx: number
  ) => {
    const effPat = pat === 'dark-grid' ? 'grid' : pat;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let x = stepPx; x < wBox; x += stepPx) xs.push(x);
    for (let y = stepPx; y < hBox; y += stepPx) ys.push(y);
    return (
      <svg
        viewBox={`0 0 ${wBox} ${hBox}`}
        className="w-full h-full block pointer-events-none"
        preserveAspectRatio="none"
      >
        {effPat === 'grid' && (
          <g stroke={activeRules.grid} strokeWidth="0.9">
            {xs.map((x) => (
              <line key={`gx-${x}`} x1={x} y1={0} x2={x} y2={hBox} />
            ))}
            {ys.map((y) => (
              <line key={`gy-${y}`} x1={0} y1={y} x2={wBox} y2={y} />
            ))}
          </g>
        )}
        {(effPat === 'ruled' || effPat === 'cornell') && (
          <>
            <g stroke={activeRules.grid} strokeWidth="0.9">
              {ys
                .filter((_, idx) => idx >= 1)
                .map((y) => (
                  <line key={`ry-${y}`} x1={0} y1={y} x2={wBox} y2={y} />
                ))}
            </g>
            {effPat === 'cornell' && (
              <g stroke={activeRules.cornell} strokeWidth="1.2">
                <line
                  x1={Math.round(wBox * 0.28)}
                  y1={stepPx * 1.6}
                  x2={Math.round(wBox * 0.28)}
                  y2={Math.round(hBox * 0.8)}
                />
                <line
                  x1={0}
                  y1={Math.round(hBox * 0.8)}
                  x2={wBox}
                  y2={Math.round(hBox * 0.8)}
                />
              </g>
            )}
          </>
        )}
        {effPat === 'dotted' && (
          <g fill={activeRules.dot}>
            {xs.map((x) =>
              ys.map((y) => <circle key={`d-${x}-${y}`} cx={x} cy={y} r="0.85" />)
            )}
          </g>
        )}
      </svg>
    );
  };

  const templateOptions: { id: PaperTemplateType; label: string }[] = [
    { id: 'grid', label: 'Τετραγων.' },
    { id: 'ruled', label: 'Γραμμές' },
    { id: 'dotted', label: 'Τελείες' },
    { id: 'cornell', label: 'Cornell' },
    { id: 'blank', label: 'Κενό' },
  ];
  const activeTplLabel =
    templateOptions.find((t) => t.id === activePattern)?.label || 'Τετραγων.';

  const keyboardShortcuts = [
    { keys: 'P / Π', label: 'Pen (Μολύβι)', icon: <Pen className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'E / Ε', label: 'Erase (Σβήστρα)', icon: <Eraser className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'O / Ο', label: 'Objects (Σχήματα)', icon: <Shapes className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    {
      keys: 'A / Α',
      label: 'Arrow (Βελάκι)',
      icon: (
        <svg className="w-3.5 h-3.5 text-[#64748b] shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="2.5" y1="8" x2="13.5" y2="8" />
          <polyline points="9.5 4 13.5 8 9.5 12" />
        </svg>
      ),
    },
    {
      keys: 'B / Β',
      label: 'Battery (Μπαταρία)',
      icon: (
        <svg className="w-3.5 h-3.5 text-[#64748b] shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4.5" width="10.5" height="7" rx="1.4" />
          <line x1="14" y1="6.5" x2="14" y2="9.5" strokeWidth="2" />
          <line x1="4.8" y1="8" x2="7.2" y2="8" strokeWidth="1.3" />
          <line x1="6" y1="6.8" x2="6" y2="9.2" strokeWidth="1.3" />
        </svg>
      ),
    },
    {
      keys: 'G / Γ',
      label: 'Spring (Ελατήριο)',
      icon: (
        <svg className="w-3.5 h-3.5 text-[#64748b] shrink-0" viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 1.5 8 L 3.5 8 C 4 3.5, 6.8 3.5, 6.5 8 C 6.2 12.5, 5 12.5, 5.4 8 C 5.8 3.5, 9.8 3.5, 9.5 8 C 9.2 12.5, 8 12.5, 8.4 8 C 8.8 3.5, 12.8 3.5, 12.5 8 C 12.2 12.5, 11 12.5, 11.4 8 C 11.8 3.5, 14.5 3.5, 14.5 8 L 16.5 8" />
        </svg>
      ),
    },
    { keys: 'L / Λ', label: 'Laser (Κόκκινο Laser)', icon: <Radio className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'F / Φ', label: 'Fill (Γέμισμα)', icon: <Shapes className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'S / Σ', label: 'Select (Λάσο)', icon: <Lasso className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'C / Ψ', label: 'Crop (Ξάκρισμα)', icon: <Scissors className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'N / Ν', label: 'Nodes (Κόμβοι)', icon: bezierNodesIcon },
    { keys: 'I / Ι', label: 'Images (Συλλογή)', icon: <ImageIcon className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'R / Ρ', label: 'Ruler (Χάρακας)', icon: <Ruler className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'H / Η', label: 'Highlight (Υπογραμμιστής)', icon: <Highlighter className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'T / Τ', label: 'Text (Κείμενο)', icon: <Type className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    { keys: 'G / Γ', label: 'Group (2+ Επιλ.)', icon: <Layers className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
    {
      keys: 'BB / ΒΒ',
      label: 'Μαύρο (Black)',
      icon: <span className="w-3 h-3 rounded-full bg-[#111827] border border-white/80 shadow-2xs shrink-0" />,
    },
    {
      keys: 'RR / ΡΡ',
      label: 'Κόκκινο (Red)',
      icon: <span className="w-3 h-3 rounded-full bg-[#dc2626] border border-white/80 shadow-2xs shrink-0" />,
    },
    {
      keys: 'GG / ΓΓ',
      label: 'Πράσινο (Green)',
      icon: <span className="w-3 h-3 rounded-full bg-[#16a34a] border border-white/80 shadow-2xs shrink-0" />,
    },
    {
      keys: 'CC / ΨΨ',
      label: 'Μπλε (Ciel)',
      icon: <span className="w-3 h-3 rounded-full bg-[#2563eb] border border-white/80 shadow-2xs shrink-0" />,
    },
    { keys: 'Esc', label: 'Escape (Κλείσιμο)', icon: <X className="w-3.5 h-3.5 text-[#64748b] shrink-0" /> },
  ];

  const pencilGestures = [
    {
      keys: '2× Κενό',
      label: 'Μολύβι ↔ Σβήστρα',
      icon: <Eraser className="w-3.5 h-3.5 text-[#64748b] shrink-0" />,
    },
    {
      keys: '2× Άκρο',
      label: 'Βέλος σε Γραμμή',
      icon: (
        <svg className="w-3.5 h-3.5 text-[#64748b] shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="2.5" y1="8" x2="13.5" y2="8" />
          <polyline points="9.5 4 13.5 8 9.5 12" />
        </svg>
      ),
    },
    {
      keys: '2× Κορυφή',
      label: 'Μέτρηση Γωνίας (°)',
      icon: (
        <svg className="w-3.5 h-3.5 text-[#64748b] shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 12 3 3" />
          <polyline points="3 12 13 12" />
          <path d="M 3 7 A 5 5 0 0 1 8 12" />
        </svg>
      ),
    },
    {
      keys: 'Κράτημα',
      label: 'Αυτόματο Σχήμα',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#64748b] shrink-0" />,
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        data-ui-panel="true"
        data-popover-panel="settings"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="rounded-2xl ipados-liquid-glass bg-[#fdfbf7]/38 backdrop-blur-2xl backdrop-saturate-200 text-[#2c3e50] border border-white/85 p-6 w-full max-w-md shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 id="settingsDialogTitle" className="text-lg font-bold text-[#234978]">
            Ρυθμίσεις Σελίδας & Apple Pencil
          </h2>
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-[#efebe3] border border-[#dfd8cb] text-xs font-semibold text-[#2c3e50] hover:bg-[#e4ded2] transition cursor-pointer"
          >
            Κλείσιμο
          </button>
        </div>

        {/* Page Orientation: Portrait / Landscape + 90° Rotation */}
        <div>
          <label className="block text-xs font-semibold text-[#234978] mb-1.5">
            Προσανατολισμός & Περιστροφή Σελίδας:
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() =>
                updateActivePage((page) => ({ ...page, orientation: 'portrait' }))
              }
              className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition flex items-center justify-center gap-1.5 ${
                (activePage.orientation || 'portrait') === 'portrait'
                  ? 'bg-[#234978] border-[#234978] text-white shadow-xs'
                  : 'bg-[#efebe3] border-[#dfd8cb] text-[#2c3e50] hover:bg-[#e4ded2]'
              }`}
              title="Κάθετη Διάταξη Σελίδας (Portrait)"
            >
              <span className="inline-block w-2.5 h-3.5 border border-current rounded-xs shrink-0" />
              <span>Κάθετη (Portrait)</span>
            </button>
            <button
              onClick={() =>
                updateActivePage((page) => ({ ...page, orientation: 'landscape' }))
              }
              className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition flex items-center justify-center gap-1.5 ${
                activePage.orientation === 'landscape'
                  ? 'bg-[#234978] border-[#234978] text-white shadow-xs'
                  : 'bg-[#efebe3] border-[#dfd8cb] text-[#2c3e50] hover:bg-[#e4ded2]'
              }`}
              title="Οριζόντια Διάταξη Σελίδας (Landscape)"
            >
              <span className="inline-block w-3.5 h-2.5 border border-current rounded-xs shrink-0" />
              <span>Οριζόντια (Landscape)</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onRotatePage('left')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#efebe3] hover:bg-[#e4ded2] border border-[#dfd8cb] text-xs font-semibold text-[#2c3e50] cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Περιστροφή -90° Αριστερά</span>
            </button>
            <button
              onClick={() => onRotatePage('right')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#efebe3] hover:bg-[#e4ded2] border border-[#dfd8cb] text-xs font-semibold text-[#2c3e50] cursor-pointer transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Περιστροφή +90° Δεξιά</span>
            </button>
          </div>
        </div>

        {/* Paper Color & Template */}
        <div>
          <label className="block text-xs font-semibold text-[#234978] mb-1.5">
            Χρώμα & Πρότυπο Χαρτιού (Paper Color & Template):
          </label>
          <div className="rounded-2xl bg-[#efebe3]/40 border border-[#dfd8cb] p-3 space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="flex flex-col items-center shrink-0 w-[88px]">
                <div
                  style={{ backgroundColor: activePaperHex }}
                  className={`relative rounded-lg border shadow-md overflow-hidden transition-all ${
                    isDarkPaperColor(activePaperHex)
                      ? 'border-slate-700'
                      : 'border-slate-300/95'
                  } ${isLand ? 'w-[86px] h-[61px]' : 'w-[66px] h-[92px]'}`}
                  title={`Προεπισκόπηση χαρτιού: ${activeColorLabel} • ${activeTplLabel}`}
                >
                  {renderMiniPatternSvg(
                    activePattern,
                    isLand ? 86 : 66,
                    isLand ? 61 : 92,
                    9
                  )}
                  <svg
                    viewBox="0 0 60 20"
                    className="absolute bottom-2 left-1.5 w-11 h-3.5 pointer-events-none opacity-75"
                  >
                    <path
                      d="M3 13 C 9 5, 14 15, 20 9 S 31 14, 38 8 S 48 13, 55 10"
                      fill="none"
                      stroke={isDarkPaperColor(activePaperHex) ? '#e2e8f0' : '#1e293b'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="mt-1 text-[10px] font-semibold text-[#64748b] text-center leading-tight">
                  {activeColorLabel}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-[#64748b] mb-1">
                    <span>Λευκό → Απαλό Γκρι</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {PAPER_WHITE_GREY_SWATCHES.map((sw) => {
                      const isSel = activePaperHex.toLowerCase() === sw.hex.toLowerCase();
                      return (
                        <button
                          key={sw.id}
                          type="button"
                          onClick={() =>
                            updateActivePage((page) => ({
                              ...page,
                              paperColor: sw.hex,
                              template:
                                page.template === 'dark-grid' ? 'grid' : page.template,
                            }))
                          }
                          style={{ backgroundColor: sw.hex }}
                          title={sw.label}
                          className={`h-7 flex-1 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                            isSel
                              ? 'border-[#234978] ring-2 ring-[#234978]/35 shadow-xs'
                              : 'border-[#dfd8cb] hover:border-[#a8a29e]'
                          }`}
                        >
                          {isSel && (
                            <span className="w-2 h-2 rounded-full bg-[#234978]" />
                          )}
                        </button>
                      );
                    })}
                    {(() => {
                      const isDarkSel = activePaperHex.toLowerCase() === '#0f172a';
                      return (
                        <button
                          type="button"
                          onClick={() =>
                            updateActivePage((page) => ({
                              ...page,
                              paperColor: '#0f172a',
                            }))
                          }
                          style={{ backgroundColor: '#0f172a' }}
                          title="Σκούρο Χαρτί"
                          className={`h-7 w-7 shrink-0 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                            isDarkSel
                              ? 'border-[#38bdf8] ring-2 ring-[#234978]/45 shadow-xs'
                              : 'border-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {isDarkSel && (
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                          )}
                        </button>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-[#64748b] mb-1">
                    <span>Μπεζ Ανοιχτό → Vintage (ήπιοι τόνοι)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {PAPER_BEIGE_VINTAGE_SWATCHES.map((sw) => {
                      const isSel = activePaperHex.toLowerCase() === sw.hex.toLowerCase();
                      return (
                        <button
                          key={sw.id}
                          type="button"
                          onClick={() =>
                            updateActivePage((page) => ({
                              ...page,
                              paperColor: sw.hex,
                              template:
                                page.template === 'dark-grid' ? 'grid' : page.template,
                            }))
                          }
                          style={{ backgroundColor: sw.hex }}
                          title={sw.label}
                          className={`h-7 flex-1 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                            isSel
                              ? 'border-[#234978] ring-2 ring-[#234978]/35 shadow-xs'
                              : 'border-[#dfd8cb] hover:border-[#a8a29e]'
                          }`}
                        >
                          {isSel && (
                            <span className="w-2 h-2 rounded-full bg-[#234978]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1 border-t border-[#dfd8cb]">
              {templateOptions.map((tpl) => {
                const isSelTpl = activePattern === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() =>
                      updateActivePage((page) => ({
                        ...page,
                        template: tpl.id,
                        paperColor: getEffectivePaperColor(page),
                      }))
                    }
                    className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                      isSelTpl
                        ? 'bg-[#efebe3] border-[#234978] text-[#234978] ring-1 ring-[#234978]/30 shadow-2xs font-bold'
                        : 'bg-[#fdfbf7] border-[#dfd8cb] text-[#2c3e50] hover:bg-[#efebe3]/50'
                    }`}
                  >
                    <div
                      style={{ backgroundColor: activePaperHex }}
                      className={`relative w-8 h-10 rounded border overflow-hidden shadow-2xs ${
                        isDarkPaperColor(activePaperHex)
                          ? 'border-slate-600'
                          : 'border-[#dfd8cb]'
                      }`}
                    >
                      {renderMiniPatternSvg(tpl.id, 32, 40, 6.4)}
                    </div>
                    <span className="truncate max-w-full">{tpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-[#dfd8cb]">
          <WarmStudioToggle
            checked={holdToSnapEnabled}
            onChange={onChangeHoldToSnap}
            label="Hold-to-Snap (Αυτόματο σχήμα σε 0.3s)"
            icon={<Sparkles className="w-4 h-4" />}
            className="w-full justify-between"
          />
          <WarmStudioToggle
            checked={scribbleToEraseEnabled}
            onChange={onChangeScribbleToErase}
            label="Scribble-to-Erase (Μουτζούρωμα για σβήσιμο)"
            icon={<Eraser className="w-4 h-4" />}
            className="w-full justify-between"
          />
          <WarmStudioToggle
            checked={doubleTapEmptyEraserEnabled}
            onChange={onChangeDoubleTapEmptyEraser}
            label="Double-Tap σε Κενό (Μολύβι ↔ Σβήστρα)"
            icon={<Pen className="w-4 h-4" />}
            className="w-full justify-between"
          />
        </div>

        {/* Keyboard Shortcuts Quick Reference */}
        <div className="pt-2 border-t border-[#dfd8cb]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#234978]">Συντομεύσεις Πληκτρολογίου (EN / GR):</span>
            <span className="text-[10px] text-[#64748b]">SHORTCUTS.md</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {keyboardShortcuts.map((sc) => (
              <div
                key={`${sc.keys}-${sc.label}`}
                className="flex items-center justify-between gap-1.5 bg-[#efebe3]/50 border border-[#dfd8cb] rounded-lg px-2 py-1"
              >
                <span className="flex items-center gap-1.5 text-[#2c3e50] font-medium truncate">
                  {sc.icon}
                  <span className="truncate">{sc.label}</span>
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#fdfbf7] border border-[#dfd8cb] text-[10px] font-bold text-[#234978] shadow-2xs shrink-0">
                  {sc.keys}
                </kbd>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2.5 mb-1.5">
            <span className="text-xs font-bold text-[#234978]">Χειρονομίες Apple Pencil & Καμβά:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {pencilGestures.map((sc) => (
              <div
                key={`${sc.keys}-${sc.label}`}
                className="flex items-center justify-between gap-1.5 bg-[#efebe3]/50 border border-[#dfd8cb] rounded-lg px-2 py-1"
              >
                <span className="flex items-center gap-1.5 text-[#2c3e50] font-medium truncate">
                  {sc.icon}
                  <span className="truncate">{sc.label}</span>
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#fdfbf7] border border-[#dfd8cb] text-[10px] font-bold text-[#234978] shadow-2xs shrink-0">
                  {sc.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PageSettingsModal = React.memo(PageSettingsModalInner);
