import React from 'react';
import { Play, Pause, RotateCcw, LineChart, Flame, Sparkles, Droplets, Clock } from 'lucide-react';
import { SimulationObjectRibbon } from '../../ui/SimulationObjectRibbon';
import { HEAT_SIMULATION_OBJECTS } from './HeatSimulationModule';
import { HeatSimConfig, HeatObjectType } from './types';

export interface HeatControlPanelProps {
  sim: HeatSimConfig | null;
  onToggleRun: () => void;
  onReset: () => void;
  onToggleGraph: () => void;
  showStopwatch?: boolean;
  onToggleStopwatch?: () => void;
  onToggleBurner?: () => void;
  onAddObject: (type: HeatObjectType) => void;
  selectedStrokeIdsCount: number;
  onConvertLassoSketch: () => void;
  className?: string;
}

export const HeatControlPanel: React.FC<HeatControlPanelProps> = ({
  sim,
  onToggleRun,
  onReset,
  onToggleGraph,
  showStopwatch = false,
  onToggleStopwatch,
  onToggleBurner,
  onAddObject,
  selectedStrokeIdsCount,
  onConvertLassoSketch,
  className = '',
}) => {
  const isRunning = sim?.isRunning ?? false;
  const isGraphVisible = sim?.graph.visible ?? true;
  const objects = sim?.objects || [];

  const burner = objects.find((o) => o.type === 'burner');
  const primaryContainer =
    objects.find((o) => o.id === sim?.selectedObjectId && o.containerState) ||
    objects.find((o) => o.type === 'beaker' || o.type === 'flask') ||
    objects.find((o) => o.type === 'wide-basin');

  const thermometer = objects.find((o) => o.type === 'thermometer');
  const tempReading = thermometer?.thermometerState?.temperature ?? primaryContainer?.containerState?.temperature;

  return (
    <div className={`space-y-3 select-none text-[#2c3e50] ${className}`}>
      {/* 1. Quick Controls Grid (2x2 action buttons, identical logic & layout to Pendulum) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Play / Pause & Reset */}
        <div className="flex items-center gap-1 w-full">
          <button
            type="button"
            onClick={onToggleRun}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs ${
              isRunning
                ? 'bg-[#234978] hover:bg-[#1c3c63] text-white shadow-xs'
                : 'bg-[#efebe3] hover:bg-[#e4ded2] text-[#2c3e50] border border-[#dfd8cb]'
            }`}
            title={isRunning ? 'Παύση Προσομοίωσης & Χρονομέτρου' : 'Εκκίνηση Θέρμανσης & Χρονομέτρου'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Παύση' : 'Εκκίνηση'}</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-xl bg-[#efebe3] hover:bg-[#e4ded2] text-[#2c3e50] border border-[#dfd8cb] cursor-pointer transition shadow-2xs shrink-0"
            title="Επαναφορά αρχικών θερμοκρασιών, χρόνου & χρονομέτρου"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stopwatch (Χρονόμετρο) - Matching Pendulum */}
        <button
          type="button"
          onClick={onToggleStopwatch}
          className={`w-full py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs ${
            showStopwatch
              ? 'bg-[#234978] text-white shadow-xs'
              : 'bg-[#efebe3] hover:bg-[#e4ded2] text-[#2c3e50] border border-[#dfd8cb]'
          }`}
          title="Εμφάνιση / Απόκρυψη ψηφιακού χρονομέτρου (ίδιο με το εκκρεμές)"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Χρονόμετρο</span>
        </button>

        {/* Dynamic Graph T-t Toggle */}
        <button
          type="button"
          onClick={onToggleGraph}
          className={`w-full py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs ${
            isGraphVisible
              ? 'bg-[#234978] text-white shadow-xs'
              : 'bg-[#efebe3] hover:bg-[#e4ded2] text-[#2c3e50] border border-[#dfd8cb]'
          }`}
          title="Εμφάνιση / Απόκρυψη δυναμικού διαγράμματος T(t)"
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>Διάγραμμα T(t)</span>
        </button>

        {/* Burner Quick Flame Toggle */}
        <button
          type="button"
          onClick={onToggleBurner}
          className={`w-full py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs ${
            burner?.burnerState?.isOn
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
              : 'bg-[#efebe3] hover:bg-[#e4ded2] text-[#2c3e50] border border-[#dfd8cb]'
          }`}
          title="Άναμμα / Σβήσιμο φλόγας καμινέτου Bunsen"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{burner?.burnerState?.isOn ? 'Φλόγα: ON' : 'Φλόγα: OFF'}</span>
        </button>
      </div>

      {/* 2. Live Apparatus Status Telemetry */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs text-[11px]">
        {/* Flame State */}
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              burner?.burnerState?.isOn
                ? 'bg-amber-100 text-amber-600 animate-pulse'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[9.5px] font-bold text-slate-400 uppercase">Καμινέτο</span>
            <span className="font-bold text-slate-700">
              {burner?.burnerState?.isOn ? 'Αναμμένο' : 'Σβηστό'}
            </span>
          </div>
        </div>

        {/* Temperature Reading */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[9.5px] font-bold text-slate-400 uppercase">Θερμοκρασία</span>
            <span className="font-bold text-slate-800">
              {tempReading !== undefined ? `${tempReading.toFixed(1)} °C` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Lasso Sketch Recognition Convert Button */}
      {selectedStrokeIdsCount > 0 && (
        <button
          type="button"
          onClick={onConvertLassoSketch}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#234978] to-[#1c3c63] hover:from-[#1c3c63] hover:to-[#152e4d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          title="Αναγνωρίζει το σκίτσο (καμινέτο, τρίποδας, ποτήρι, θερμόμετρο) και το αντικαθιστά με διαδραστικό εργαστηριακό αντικείμενο"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Αναγνώριση & Μετατροπή Σκίτσου ({selectedStrokeIdsCount})</span>
        </button>
      )}

      {/* 4. Apparatus Ribbon (1-click addition of 6 objects) */}
      <SimulationObjectRibbon
        objects={HEAT_SIMULATION_OBJECTS}
        onSelectObject={(obj) => onAddObject(obj.id as HeatObjectType)}
      />

      {/* 5. Educational Tip Card */}
      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[10.5px] text-amber-900 leading-snug space-y-1">
        <p className="font-bold flex items-center gap-1 text-[#234978]">
          <span>💡 Εργαστηριακός Οδηγός:</span>
        </p>
        <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[10px]">
          <li>
            Κάνε κλικ στο αχνό μολυβάκι (<b>✎</b>) πάνω δεξιά σε κάθε δοχείο για αλλαγή υγρού, όγκου και αρχικής θερμοκρασίας.
          </li>
          <li>
            Το <b>Ελαιόλαδο</b> (c = 2.0 J/g°C) θερμαίνεται <b>διπλάσια γρήγορα</b> από το νερό!
          </li>
          <li>
            Σύρε το ποτήρι μέσα στην <b>πλατιά λεκάνη</b> για παρατήρηση Θερμικής Ισορροπίας με 2 δυναμικές καμπύλες.
          </li>
        </ul>
      </div>
    </div>
  );
};
