import React from 'react';
import { Play, Pause, RotateCcw, ScanSearch } from 'lucide-react';
import type { GravityBodyState, GravityEnergyStats, GravityLabConfig } from './types';

interface GravityControlPanelProps {
  config: GravityLabConfig;
  setConfig: React.Dispatch<React.SetStateAction<GravityLabConfig>>;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onRescan: () => void;
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
  onRescan,
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
        <button
          type="button"
          onClick={onRescan}
          className="p-2 rounded-lg bg-[#efebe3] hover:bg-[#d6cbb8] text-[#2c3e50] border border-[#dfd8cb] transition cursor-pointer"
          title="Επανασάρωση σχημάτων από τη σελίδα"
        >
          <ScanSearch className="w-3.5 h-3.5" />
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

      {/* Gravity g Presets + Slider */}
      <div className="space-y-1.5 p-2.5 rounded-lg bg-white/55 border border-[#e3ddd2]">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Βαρύτητα g</span>
          <span className="font-bold text-[#234978]">{config.gravity.toFixed(1)} m/s²</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { g: 0, label: '0 (Κενό)' },
            { g: 1.6, label: 'Σελήνη' },
            { g: 9.8, label: 'Γη 9.8' },
            { g: 24.8, label: 'Δίας' },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setConfig((c) => ({ ...c, gravity: opt.g }))}
              className={`py-1 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                Math.abs(config.gravity - opt.g) < 0.2
                  ? 'bg-[#d6cbb8] text-[#2c251d] border border-[#bfb097]'
                  : 'bg-[#efebe3] hover:bg-[#e5ded1] text-[#5c5346]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={25}
          step={0.2}
          value={config.gravity}
          onChange={(e) => setConfig((c) => ({ ...c, gravity: parseFloat(e.target.value) }))}
          className="w-full accent-[#234978]"
        />
      </div>

      {/* Restitution e (Bounce Elasticity) */}
      <div className="space-y-1 p-2.5 rounded-lg bg-white/55 border border-[#e3ddd2]">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Ελαστικότητα e</span>
          <span className="font-bold text-[#234978]">
            {config.restitution.toFixed(2)}{' '}
            <span className="font-normal text-[10px] text-[#64748b]">
              ({config.restitution <= 0.05 ? 'Πλαστική' : config.restitution >= 0.96 ? 'Ελαστική' : 'Φθίνουσα'})
            </span>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={config.restitution}
          onChange={(e) => setConfig((c) => ({ ...c, restitution: parseFloat(e.target.value) }))}
          className="w-full accent-[#234978]"
        />
      </div>

      {/* Friction & Air Drag Toggles */}
      <div className="space-y-2 p-2.5 rounded-lg bg-white/55 border border-[#e3ddd2]">
        <div className="flex items-center justify-between">
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

      {/* Visual Options */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setConfig((c) => ({ ...c, showVectors: !c.showVectors }))}
          className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
            config.showVectors
              ? 'bg-[#d6cbb8] text-[#2c251d] border border-[#bfb097]'
              : 'bg-[#efebe3] text-[#64748b]'
          }`}
        >
          Διανύσματα (v,W,N)
        </button>
        <button
          type="button"
          onClick={() => setConfig((c) => ({ ...c, showTrail: !c.showTrail }))}
          className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
            config.showTrail
              ? 'bg-[#d6cbb8] text-[#2c251d] border border-[#bfb097]'
              : 'bg-[#efebe3] text-[#64748b]'
          }`}
        >
          Ίχνος Τροχιάς
        </button>
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
