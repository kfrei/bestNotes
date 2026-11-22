import React from 'react';
import { Play, Pause, RotateCcw, ScanSearch } from 'lucide-react';
import type { GravityBodyState, GravityEnergyStats, GravityLabConfig } from './types';

interface GravityControlPanelProps {
  config: GravityLabConfig;
  setConfig: React.Dispatch<React.SetStateAction<GravityLabConfig>>;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onLoadFromLasso: () => void;
  onClearScene: () => void;
  lassoSelectedCount: number;
  hasBoundScene: boolean;
  bodies: GravityBodyState[];
  segmentCount: number;
  energy: GravityEnergyStats;
  onToggleBodyPin: (strokeId: string) => void;
}

export const GravityControlPanel: React.FC<GravityControlPanelProps> = ({
  config,
  setConfig,
  isRunning,
  onToggleRun,
  onReset,
  onLoadFromLasso,
  onClearScene,
  lassoSelectedCount,
  hasBoundScene,
  bodies,
  segmentCount,
  energy,
  onToggleBodyPin,
}) => {
  const maxE = Math.max(0.5, energy.totalJ, energy.kineticJ + energy.potentialJ);
  const kPct = Math.min(100, (energy.kineticJ / maxE) * 100);
  const uPct = Math.min(100, (energy.potentialJ / maxE) * 100);

  return (
    <div className="space-y-3 text-xs text-[#2c3e50]">
      {/* Lasso Selection Binding Button (Explicit user-controlled study scope!) */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onLoadFromLasso}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-bold transition cursor-pointer border text-[11px] ${
            lassoSelectedCount > 0
              ? 'bg-[#d6cbb8] hover:bg-[#c8baa3] text-[#2c251d] border-[#bfb097] shadow-2xs'
              : 'bg-[#efebe3] hover:bg-[#e5ded1] text-[#5c5346] border-[#dfd8cb]'
          }`}
          title="Φόρτωση μόνο των σχημάτων που έχεις επιλέξει με το Λάσο"
        >
          <ScanSearch className="w-3.5 h-3.5" />
          <span>
            {lassoSelectedCount > 0
              ? `Φόρτωση από Λάσο (${lassoSelectedCount})`
              : 'Επίλεξε με Λάσο & Πάτα εδώ'}
          </span>
        </button>
        {hasBoundScene && (
          <button
            type="button"
            onClick={onClearScene}
            className="px-2 py-1.5 rounded-lg bg-[#efebe3] hover:bg-rose-100 text-[#64748b] hover:text-rose-700 border border-[#dfd8cb] text-[11px] font-semibold transition cursor-pointer"
            title="Καθαρισμός ενεργής σκηνής Μηχανικής"
          >
            ✕
          </button>
        )}
      </div>

      {!hasBoundScene && (
        <div className="px-2.5 py-2 rounded-lg bg-[#f5f1e8] border border-[#e3ddd2] text-[11px] text-[#5c5346] leading-snug">
          Επίλεξε με το <strong>Λάσο</strong> μόνο το σώμα και το δάπεδο/καμπύλη που θέλεις να
          μελετήσεις και πάτα <strong>«Φόρτωση από Λάσο»</strong> (ή απευθείας{' '}
          <strong>Έναρξη</strong>).
        </div>
      )}

      {/* Primary Transport Row */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleRun}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition cursor-pointer shadow-xs ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-[#234978] hover:bg-[#1b3a61] text-white'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Παύση' : 'Έναρξη'}</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="p-2 rounded-lg bg-[#efebe3] hover:bg-[#d6cbb8] text-[#2c3e50] border border-[#dfd8cb] transition cursor-pointer"
          title="Επαναφορά στην αρχική θέση"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scene Summary Pill */}
      <div className="px-2.5 py-1.5 rounded-lg bg-[#f5f1e8] border border-[#e3ddd2] flex items-center justify-between text-[11px]">
        <span>
          Σώματα: <strong>{bodies.filter((b) => !b.pinned).length}</strong> · Επιφάνειες:{' '}
          <strong>{segmentCount > 0 ? '✓' : '—'}</strong>
        </span>
        <span className="text-[#64748b]">
          v = <strong>{energy.speedMs.toFixed(1)}</strong> m/s
        </span>
      </div>

      {/* Contextual Stickmen Signed Forces F / F₁, F₂ (-40..+40 N each + Live Net Resultant Fολ!) */}
      {(() => {
        const activePushers = bodies.flatMap((b) => (!b.pinned && b.pushers ? b.pushers : []));
        if (activePushers.length === 0) return null;
        const multi = activePushers.length >= 2;
        const getForceVal = (p: (typeof activePushers)[number]) =>
          config.pusherForcesN[p.strokeId] !== undefined
            ? config.pusherForcesN[p.strokeId]
            : p.dir * (Math.abs(config.pushForceN) || 14);
        const netForceN = activePushers.reduce((sum, p) => sum + getForceVal(p), 0);
        return (
          <div className="space-y-2 p-2.5 rounded-lg bg-white/55 border border-[#e3ddd2]">
            {activePushers.map((p, idx) => {
              const fVal = getForceVal(p);
              return (
                <div
                  key={p.strokeId}
                  className={idx > 0 ? 'pt-2 border-t border-[#ece7dc] space-y-1' : 'space-y-1'}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      {multi && (
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: p.color || '#2563eb' }}
                        />
                      )}
                      <span>
                        {multi ? `Δύναμη ${p.label}` : 'Δύναμη'}{' '}
                        <span className="text-[#64748b] font-normal">
                          ({fVal > 0 ? '→' : fVal < 0 ? '←' : '0'})
                        </span>
                      </span>
                    </span>
                    <span className="font-bold text-[#234978]">
                      {fVal > 0 ? `+${fVal.toFixed(0)}` : fVal.toFixed(0)} N
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-40}
                    max={40}
                    step={1}
                    value={fVal}
                    onChange={(e) => {
                      const nextVal = parseFloat(e.target.value);
                      setConfig((c) => ({
                        ...c,
                        pushForceN: multi ? c.pushForceN : nextVal,
                        pusherForcesN: { ...c.pusherForcesN, [p.strokeId]: nextVal },
                      }));
                    }}
                    className="w-full accent-[#234978]"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#64748b] font-medium">
                    <span>← -40 N</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          pushForceN: multi ? c.pushForceN : 0,
                          pusherForcesN: { ...c.pusherForcesN, [p.strokeId]: 0 },
                        }))
                      }
                      className="px-1.5 py-0.5 rounded hover:bg-[#e5dfd3] text-[#2c3e50] cursor-pointer"
                      title="Μηδενισμός δύναμης"
                    >
                      0
                    </button>
                    <span>+40 N →</span>
                  </div>
                </div>
              );
            })}

            {multi && (
              <div className="pt-1.5 border-t border-[#e3ddd2] flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#475569]">Συνισταμένη Fολ</span>
                <span
                  className={`font-bold ${
                    Math.abs(netForceN) < 0.2 ? 'text-emerald-700' : 'text-[#234978]'
                  }`}
                >
                  {Math.abs(netForceN) < 0.2
                    ? '0 N (Ισορροπία)'
                    : `${netForceN > 0 ? '+' : ''}${netForceN.toFixed(0)} N (${
                        netForceN > 0 ? '→' : '←'
                      })`}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Elastic Collisions, Friction & Air Drag Toggles */}
      <div className="space-y-2 p-2.5 rounded-lg bg-white/55 border border-[#e3ddd2]">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={config.restitution >= 0.99}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  restitution: e.target.checked ? 1.0 : 0.78,
                }))
              }
              className="accent-[#234978] rounded"
            />
            <span>Ελαστικές Κρούσεις</span>
          </label>
          <span className="text-[11px] font-bold text-[#234978]">
            {config.restitution >= 0.99
              ? 'ON (Ιδανικό)'
              : `e=${config.restitution.toFixed(2)}`}
          </span>
        </div>
        {config.restitution < 0.99 && (
          <input
            type="range"
            min={0}
            max={0.98}
            step={0.02}
            value={config.restitution}
            onChange={(e) => setConfig((c) => ({ ...c, restitution: parseFloat(e.target.value) }))}
            className="w-full accent-[#234978]"
          />
        )}

        <div className="flex items-center justify-between pt-1 border-t border-[#ece7dc]">
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={config.frictionEnabled}
              onChange={(e) => setConfig((c) => ({ ...c, frictionEnabled: e.target.checked }))}
              className="accent-[#234978] rounded"
            />
            <span>Τριβή Επιφάνειας (μ)</span>
          </label>
          <span className="text-[11px] font-bold text-[#234978]">
            {config.frictionEnabled ? config.frictionMu.toFixed(2) : 'OFF (Ιδανικό)'}
          </span>
        </div>
        {config.frictionEnabled && (
          <input
            type="range"
            min={0.02}
            max={0.8}
            step={0.02}
            value={config.frictionMu}
            onChange={(e) => setConfig((c) => ({ ...c, frictionMu: parseFloat(e.target.value) }))}
            className="w-full accent-[#234978]"
          />
        )}

        <div className="flex items-center justify-between pt-1 border-t border-[#ece7dc]">
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={config.airDragEnabled}
              onChange={(e) => setConfig((c) => ({ ...c, airDragEnabled: e.target.checked }))}
              className="accent-[#234978] rounded"
            />
            <span>Αντίσταση Αέρα</span>
          </label>
          <span className="text-[11px] font-bold text-[#234978]">
            {config.airDragEnabled ? 'ON' : 'OFF (Κενό)'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#ece7dc]">
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={config.pageBoundsEnabled}
              onChange={(e) => setConfig((c) => ({ ...c, pageBoundsEnabled: e.target.checked }))}
              className="accent-[#234978] rounded"
            />
            <span>Όρια Σελίδας</span>
          </label>
          <span className="text-[11px] font-bold text-[#234978]">
            {config.pageBoundsEnabled ? 'ON' : 'OFF (Ελεύθερο)'}
          </span>
        </div>
      </div>

      {/* Live Energy Bars (K, U, E) */}
      {config.showEnergy && (
        <div className="space-y-1.5 p-2.5 rounded-lg bg-white/55 border border-[#e3ddd2]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold">Μηχανική Ενέργεια</span>
            <span className="font-bold text-[#234978]">E = {energy.totalJ.toFixed(1)} J</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-12 text-[#2563eb] font-bold">K = {energy.kineticJ.toFixed(1)}</span>
              <div className="flex-1 h-2 rounded bg-[#ece7dc] overflow-hidden">
                <div className="h-full bg-[#2563eb] transition-all duration-75" style={{ width: `${kPct}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-12 text-[#059669] font-bold">U = {energy.potentialJ.toFixed(1)}</span>
              <div className="flex-1 h-2 rounded bg-[#ece7dc] overflow-hidden">
                <div className="h-full bg-[#059669] transition-all duration-75" style={{ width: `${uPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vector Overlay Checkboxes (all unchecked by default; Forces <-> Net Force mutually exclusive!) + Trail */}
      <div className="space-y-1.5 p-2.5 rounded-lg bg-white/55 border border-[#e3ddd2]">
        <div className="text-[10px] font-bold text-[#64748b] uppercase">Διανύσματα</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={config.showVelocity}
              onChange={(e) =>
                setConfig((c) => ({ ...c, showVelocity: e.target.checked }))
              }
              className="accent-[#2563eb] rounded"
            />
            <span>Ταχύτητα</span>
          </label>
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={config.showForces}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  showForces: e.target.checked,
                  showNetForce: e.target.checked ? false : c.showNetForce,
                }))
              }
              className="accent-[#234978] rounded"
            />
            <span>Δυνάμεις</span>
          </label>
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={config.showNetForce}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  showNetForce: e.target.checked,
                  showForces: e.target.checked ? false : c.showForces,
                }))
              }
              className="accent-[#7c3aed] rounded"
            />
            <span>Συνισταμένη</span>
          </label>
        </div>
        <div className="pt-1.5 border-t border-[#ece7dc]">
          <button
            type="button"
            onClick={() => setConfig((c) => ({ ...c, showTrail: !c.showTrail }))}
            className={`w-full py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
              config.showTrail
                ? 'bg-[#d6cbb8] text-[#2c251d] border border-[#bfb097]'
                : 'bg-[#efebe3] text-[#64748b]'
            }`}
          >
            Ίχνος Τροχιάς
          </button>
        </div>
      </div>

      {/* 1-Click Dynamic <-> Pinned Body List */}
      {bodies.length > 0 && (
        <div className="space-y-1 p-2 rounded-lg bg-[#f5f1e8] border border-[#e3ddd2]">
          <div className="text-[10px] font-bold text-[#64748b] uppercase">
            Σώματα Σκηνής (κλικ για Κινούμενο ↔ Καρφιτσωμένο)
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1">
            {bodies.map((bd) => (
              <button
                key={bd.strokeId}
                type="button"
                onClick={() => onToggleBodyPin(bd.strokeId)}
                className="w-full flex items-center justify-between px-2 py-1 rounded-md bg-white/75 hover:bg-[#ebe4d7] border border-[#e3ddd2] text-[11px] cursor-pointer transition"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: bd.color }}
                  />
                  <span>{bd.label}</span>
                  {bd.tether && <span className="text-[9px] text-[#64748b]">(Νήμα)</span>}
                  {bd.v0ArrowStrokeId && <span className="text-[9px] text-[#2563eb]">(v₀)</span>}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    bd.pinned
                      ? 'bg-[#e5ded1] text-[#5c5346]'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {bd.pinned ? '📌 Δάπεδο' : '🟢 Κινούμενο'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
