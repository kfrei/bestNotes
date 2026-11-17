import React from 'react';
import { Plus, Zap } from 'lucide-react';
import type { Notebook, NotePage, CircuitSimConfig } from '../../../types/note';
import { WarmStudioToggle } from '../../../components/WarmStudioToggle';
import { analyzeCircuitForSimulation } from './circuitEngine';
import {
  getAllNotebookCircuitSims,
  getValidCircuitSims,
  getActiveCircuitSim,
  getNextDefaultCircuitSimName,
  getSimExpandedStrokeSet,
} from './circuitHelpers';

export interface CircuitControlPanelProps {
  activeNotebook: Notebook;
  activePage: NotePage;
  selectedStrokeIds: string[];
  isSimulating: boolean;
  simCircuitSwitchClosed: boolean;
  simShowElectrons: boolean;
  simFlowDirection: 'electrons' | 'conventional';
  simShowDarkWireTrack: boolean;
  simSpeedMultiplier: number;
  editingSimId: string | null;
  editingSimName: string;
  setEditingSimId: (id: string | null) => void;
  setEditingSimName: (name: string) => void;
  onCommitSimName: (simPageId: string, simId: string, trimmedName: string) => void;
  onSelectSim: (entry: { pageId: string; pageIdx: number; sim: CircuitSimConfig }) => void;
  onRemoveSim: (entry: { pageId: string; pageIdx: number; sim: CircuitSimConfig }) => void;
  onRegisterFromLasso: () => void;
  onTogglePlayPause: () => void;
  onJoinAndAlign: () => void;
  onStartCompletion: () => void;
  hasActiveProposal: boolean;
  onAcceptProposal: () => void;
  onCancelProposal: () => void;
  onToggleSwitch: (nextClosed: boolean) => void;
  onConvertMode: (mode: 'pictorial' | 'schematic') => void;
  onChangeShowElectrons: (checked: boolean) => void;
  onChangeFlowDirection: (dir: 'electrons' | 'conventional') => void;
  onChangeDarkWireTrack: (checked: boolean) => void;
  onChangeSpeedMultiplier: (val: number) => void;
}

export const CircuitControlPanel: React.FC<CircuitControlPanelProps> = ({
  activeNotebook,
  activePage,
  selectedStrokeIds,
  isSimulating,
  simCircuitSwitchClosed,
  simShowElectrons,
  simFlowDirection,
  simShowDarkWireTrack,
  simSpeedMultiplier,
  editingSimId,
  editingSimName,
  setEditingSimId,
  setEditingSimName,
  onCommitSimName,
  onSelectSim,
  onRemoveSim,
  onRegisterFromLasso,
  onTogglePlayPause,
  onJoinAndAlign,
  onStartCompletion,
  hasActiveProposal,
  onAcceptProposal,
  onCancelProposal,
  onToggleSwitch,
  onConvertMode,
  onChangeShowElectrons,
  onChangeFlowDirection,
  onChangeDarkWireTrack,
  onChangeSpeedMultiplier,
}) => {
  const allNotebookSims = getAllNotebookCircuitSims(activeNotebook);
  const validPageSims = getValidCircuitSims(activePage);
  const activeSim = getActiveCircuitSim(activePage);
  const nextSimLabel = getNextDefaultCircuitSimName(activeNotebook, activePage);
  const isSelectionAlreadyRegisteredSim =
    selectedStrokeIds.length > 0 &&
    validPageSims.some((sim) => {
      const simSet = getSimExpandedStrokeSet(activePage, sim);
      const overlap = selectedStrokeIds.filter((id) => simSet.has(id)).length;
      return overlap >= Math.max(1, selectedStrokeIds.length * 0.45);
    });

  const activeSimStrokes = activeSim
    ? activePage.strokes.filter((s) => activeSim.strokeIds.includes(s.id))
    : [];
  const detectedMode =
    activeSim?.componentMode ||
    (activeSimStrokes.some((s) => s.shapeType === 'resistor' || s.shapeType === 'voltage-source')
      ? 'schematic'
      : 'pictorial');

  const curShowElectrons =
    typeof activeSim?.showElectrons === 'boolean' ? activeSim.showElectrons : simShowElectrons;
  const curFlowDirection = activeSim?.flowDirection || simFlowDirection;
  const curDarkWireTrack =
    typeof activeSim?.showDarkWireTrack === 'boolean'
      ? activeSim.showDarkWireTrack
      : simShowDarkWireTrack;
  const curSpeedMultiplier =
    typeof activeSim?.speedMultiplier === 'number'
      ? activeSim.speedMultiplier
      : simSpeedMultiplier;

  return (
    <>
      {/* Named Lasso Circuit Simulations Selector (sim01, sim02, ... — 1 Active at a Time across the Notebook) */}
      <div className="ipados-liquid-card bg-white/45 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 shadow-2xs space-y-2">
        {selectedStrokeIds.length > 0 && !isSelectionAlreadyRegisteredSim && (
          <button
            type="button"
            onClick={onRegisterFromLasso}
            className="w-full py-1.5 px-2.5 rounded-lg bg-[#234978] hover:bg-[#1c3c63] text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
            title="Προσθέτει το επιλεγμένο με Λάσο κύκλωμα ως προσομοίωση και κλείνει αυτόματα το πλαίσιο επιλογής"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Προσθήκη από Λάσο ({nextSimLabel})</span>
          </button>
        )}

        {allNotebookSims.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                Ενεργό Κύκλωμα:
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {allNotebookSims.map((entry) => {
                const { sim, pageId: simPageId } = entry;
                const isCurrent = simPageId === activePage.id && activeSim?.id === sim.id;
                const isEditingThis = editingSimId === sim.id;
                const commitSimName = () => {
                  const trimmed = editingSimName.trim() || sim.name;
                  onCommitSimName(simPageId, sim.id, trimmed);
                };
                return (
                  <div
                    key={sim.id}
                    className={`inline-flex items-center rounded-lg border text-[11px] font-bold transition ${
                      isCurrent
                        ? 'bg-[#efebe3] text-[#234978] border-[#234978]/50 shadow-2xs'
                        : 'bg-[#fdfbf7] text-[#475569] border-[#dfd8cb] hover:bg-[#efebe3]'
                    }`}
                  >
                    {isEditingThis ? (
                      <input
                        type="text"
                        value={editingSimName}
                        autoFocus
                        onChange={(e) => setEditingSimName(e.target.value)}
                        onBlur={commitSimName}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            commitSimName();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            setEditingSimId(null);
                          }
                        }}
                        className="w-16 px-1.5 py-0.5 m-0.5 rounded bg-white border border-[#234978] text-[11px] font-bold text-[#234978] focus:outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectSim(entry)}
                        className="pl-2 pr-1 py-1 cursor-pointer flex items-center gap-1.5"
                        title={`Μετάβαση & Ενεργοποίηση κυκλώματος "${sim.name}" (${
                          sim.switchClosed ? 'Κλειστό 🟢' : 'Ανοιχτό 🔴'
                        }, ${
                          sim.flowDirection === 'conventional'
                            ? 'Συμβατική φορά'
                            : 'Πραγματική φορά'
                        })`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                            sim.switchClosed ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                          }`}
                          title={
                            sim.switchClosed
                              ? 'Διακόπτης: Κλειστός (ON)'
                              : 'Διακόπτης: Ανοιχτός (OFF)'
                          }
                        />
                        <span>{sim.name}</span>
                      </button>
                    )}
                    {!isEditingThis && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSimId(sim.id);
                          setEditingSimName(sim.name);
                        }}
                        className={`px-1 py-1 text-[10px] cursor-pointer transition ${
                          isCurrent
                            ? 'text-[#475569] hover:text-[#234978]'
                            : 'text-[#94a3b8] hover:text-[#234978]'
                        }`}
                        title={`Μετονομασία "${sim.name}"`}
                      >
                        ✎
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveSim(entry)}
                      className={`pr-1.5 pl-0.5 py-1 text-[10px] cursor-pointer transition ${
                        isCurrent
                          ? 'text-[#475569] hover:text-[#b91c1c]'
                          : 'text-[#94a3b8] hover:text-[#b91c1c]'
                      }`}
                      title={`Αφαίρεση "${sim.name}" από τη λίστα προσομοιώσεων`}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-[10.5px] font-medium text-[#64748b] bg-[#f7f5f0] border border-[#e8e2d6] rounded-lg p-2 leading-snug text-center">
            Επιλέξτε με το <b>Λάσο</b> ένα κλειστό κύκλωμα (με Μπαταρία/Πηγή) και πατήστε <b>Sim</b> για να δημιουργηθεί το <b>{nextSimLabel}</b>.
          </div>
        )}
      </div>

      {/* Single-Row Controls: Small Square Play/Pause Button + Simple Warm "Ένωση" & "Ολοκλήρωση" */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onTogglePlayPause}
          className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center shadow-2xs transition cursor-pointer ${
            isSimulating && activeSim
              ? 'bg-[#fdf6f6] hover:bg-[#fae8e8] border border-[#f3d4d4] text-[#b91c1c]'
              : 'bg-[#234978] hover:bg-[#1c3c63] text-white'
          }`}
          title={
            isSimulating && activeSim ? 'Διακοπή Προσομοίωσης' : 'Έναρξη Προσομοίωσης'
          }
        >
          {isSimulating && activeSim ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current ml-0.5" aria-hidden="true">
              <path d="M6 4.75L19.25 12 6 19.25V4.75z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={onJoinAndAlign}
          className="flex-1 h-8 px-2 rounded-lg bg-[#fdfbf7] hover:bg-[#efebe3] border border-[#dfd8cb] text-[#2c3e50] font-semibold text-[11px] flex items-center justify-center transition cursor-pointer"
          title="Ευθυγραμμίζει αυτόματα τους οριζόντιους/κάθετους αγωγούς του ενεργού κυκλώματος"
        >
          <span>Ένωση</span>
        </button>

        <button
          type="button"
          onClick={onStartCompletion}
          className="flex-1 h-8 px-2 rounded-lg bg-[#fdfbf7] hover:bg-[#efebe3] border border-[#dfd8cb] text-[#2c3e50] font-semibold text-[11px] flex items-center justify-center transition cursor-pointer"
          title="Προτείνει αυτόματη ολοκλήρωση του κυκλώματος με διακεκομμένη γραμμή, διακόπτη και 4 κόμβους ρύθμισης καλωδίων"
        >
          <span>Ολοκλήρωση</span>
        </button>
      </div>

      {/* Automatic Left-Wire Switch Toggle */}
      <div className="grid grid-cols-1 gap-1.5">
        {isSimulating &&
          activeSim &&
          (() => {
            const simSet = getSimExpandedStrokeSet(activePage, activeSim);
            const simStrokes = activePage.strokes.filter((s) => simSet.has(s.id));
            const simPreviewEval = analyzeCircuitForSimulation(simStrokes, true);
            const hasCompleteLoop = simPreviewEval.isCircuitClosed;
            if (!hasCompleteLoop) {
              const hasOpenSourceVoltmeter = simPreviewEval.components.some(
                (cs) => cs.comp.kind === 'voltmeter' && cs.active
              );
              if (hasOpenSourceVoltmeter) {
                return (
                  <div className="w-full py-1.5 px-2.5 rounded-xl bg-[#f1f6f3] border border-[#c8dfd0] text-[#15803d] font-semibold text-[10.5px] leading-snug text-center">
                    Ανοιχτό κύκλωμα (I = 0) — Το βολτόμετρο μετράει ενεργά την τάση της πηγής!
                  </div>
                );
              }
              return (
                <div className="w-full py-1.5 px-2.5 rounded-xl bg-[#f7f5f0] border border-[#dfd8cb] text-[#64748b] font-medium text-[10.5px] leading-snug text-center">
                  Το κύκλωμα "{activeSim.name}" είναι ανοιχτό. Κλείστε τους αγωγούς για να εμφανιστεί ο διακόπτης.
                </div>
              );
            }
            const curClosed =
              typeof activeSim.switchClosed === 'boolean'
                ? activeSim.switchClosed
                : simCircuitSwitchClosed;
            return (
              <button
                type="button"
                onClick={() => onToggleSwitch(!curClosed)}
                className={`w-full py-1.5 px-2.5 rounded-lg font-bold text-[10.5px] flex items-center justify-center gap-2 border shadow-2xs transition cursor-pointer ${
                  curClosed
                    ? 'bg-[#f1f6f3] border-[#c8dfd0] text-[#15803d] hover:bg-[#e7f0eb]'
                    : 'bg-[#fdf6f6] border-[#f3d4d4] text-[#b91c1c] hover:bg-[#fae8e8]'
                }`}
                title="Κάνε κλικ στον διακόπτη ή πάτα εδώ για Άνοιγμα/Κλείσιμο"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    curClosed ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                  }`}
                />
                <span>{curClosed ? 'Διακόπτης: Κλειστός' : 'Διακόπτης: Ανοιχτός'}</span>
              </button>
            );
          })()}

        {hasActiveProposal && (
          <div className="grid grid-cols-2 gap-1.5 pt-0.5 animate-pulse">
            <button
              type="button"
              onClick={onAcceptProposal}
              className="py-1.5 px-2 rounded-lg bg-[#234978] hover:bg-[#1c3c63] text-white font-bold text-[10.5px] flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer"
              title="Αποδοχή του προτεινόμενου κυκλώματος"
            >
              <span>✓ Αποδοχή</span>
            </button>
            <button
              type="button"
              onClick={onCancelProposal}
              className="py-1.5 px-2 rounded-lg bg-[#fdf6f6] hover:bg-[#fae8e8] border border-[#f3d4d4] text-[#b91c1c] font-bold text-[10.5px] flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer"
              title="Ακύρωση πρότασης ολοκλήρωσης"
            >
              <span>✕ Ακύρωση</span>
            </button>
          </div>
        )}
      </div>

      {/* 1-Click Scoped Circuit View Conversion: "Σχήματα" <-> "Σύμβολα" */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onConvertMode('pictorial')}
          className={`px-2 py-2 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition flex items-center justify-center gap-1.5 ${
            detectedMode === 'pictorial'
              ? 'bg-[#234978] text-white border border-[#234978]'
              : 'bg-[#fdfbf7] hover:bg-[#efebe3] border border-[#dfd8cb] text-[#2c3e50]'
          }`}
          title="Μετατρέπει τις Πηγές σε Μπαταρίες και τους Αντιστάτες σε Λαμπτήρες/Φτερωτή στο ενεργό κύκλωμα"
        >
          <svg
            viewBox="0 0 28 18"
            className={`w-7 h-4.5 shrink-0 ${
              detectedMode === 'pictorial' ? 'text-white' : 'text-[#234978]'
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M 2 6.2 H 6.5 V 2.4 H 26 V 15.6 H 6.5 V 11.8 H 2 Z" />
          </svg>
          <span>Σχήματα</span>
        </button>
        <button
          type="button"
          onClick={() => onConvertMode('schematic')}
          className={`px-2 py-2 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition flex items-center justify-center gap-1.5 ${
            detectedMode === 'schematic'
              ? 'bg-[#234978] text-white border border-[#234978]'
              : 'bg-[#fdfbf7] hover:bg-[#efebe3] border border-[#dfd8cb] text-[#2c3e50]'
          }`}
          title="Μετατρέπει τις Μπαταρίες σε Πηγές Τάσης και τους Λαμπτήρες & τη Φτερωτή σε Αντιστάτες στο ενεργό κύκλωμα"
        >
          <svg
            viewBox="0 0 28 18"
            className={`w-7 h-4.5 shrink-0 ${
              detectedMode === 'schematic' ? 'text-white' : 'text-[#234978]'
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M 1 9 H 4.2 L 6.2 2.2 L 9.4 15.8 L 12.6 2.2 L 15.8 15.8 L 19 2.2 L 22.2 15.8 L 24.2 9 H 27" />
          </svg>
          <span>Σύμβολα</span>
        </button>
      </div>

      {/* Simulation Visual Options */}
      <div className="ipados-liquid-card bg-white/45 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 shadow-2xs space-y-2 divide-y divide-[#e8e2d6]/70">
        <div className="space-y-1.5">
          <WarmStudioToggle
            checked={curShowElectrons}
            onChange={onChangeShowElectrons}
            icon={<Zap className="w-3.5 h-3.5" />}
            label="Ηλεκτρόνια / Φορτία"
            className="w-full"
          />

          {curShowElectrons && (
            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <button
                type="button"
                onClick={() => onChangeFlowDirection('electrons')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  curFlowDirection === 'electrons'
                    ? 'bg-[#234978] text-white border-[#234978] shadow-2xs'
                    : 'bg-[#fdfbf7] text-[#475569] border-[#dfd8cb] hover:bg-[#efebe3]'
                }`}
              >
                Πραγματική φορά
              </button>
              <button
                type="button"
                onClick={() => onChangeFlowDirection('conventional')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  curFlowDirection === 'conventional'
                    ? 'bg-[#234978] text-white border-[#234978] shadow-2xs'
                    : 'bg-[#fdfbf7] text-[#475569] border-[#dfd8cb] hover:bg-[#efebe3]'
                }`}
              >
                Συμβατική Φορά
              </button>
            </div>
          )}
        </div>

        <div className="pt-1.5">
          <WarmStudioToggle
            checked={curDarkWireTrack}
            onChange={onChangeDarkWireTrack}
            label="Σκούρος Σωλήνας Καλωδίων"
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="text-[10.5px] font-semibold text-[#475569]">
            Ταχύτητα (<span className="text-[#234978] font-bold">{curSpeedMultiplier.toFixed(1)}x</span>):
          </span>
          <input
            type="range"
            min="0.4"
            max="2.4"
            step="0.2"
            value={curSpeedMultiplier}
            onChange={(e) => onChangeSpeedMultiplier(parseFloat(e.target.value))}
            className="w-28 accent-[#234978] cursor-pointer"
          />
        </div>
      </div>
    </>
  );
};
