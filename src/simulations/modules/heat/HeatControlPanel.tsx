import React from 'react';
import { Play, Pause, RotateCcw, Sparkles, Clock, Thermometer } from 'lucide-react';
import { SimulationObjectRibbon } from '../../ui/SimulationObjectRibbon';
import { HEAT_SIMULATION_OBJECTS } from './HeatSimulationModule';
import { HeatSimConfig, HeatObjectType } from './types';

export interface HeatControlPanelProps {
  sim: HeatSimConfig | null;
  onToggleRun: () => void;
  onReset: () => void;
  onToggleGraph?: () => void;
  showStopwatch?: boolean;
  onToggleStopwatch?: () => void;
  onToggleBurner?: () => void;
  onFillContainer?: () => void;
  ambientTemperature?: number;
  onSetAmbientTemperature?: (temp: number) => void;
  onAddObject: (type: HeatObjectType) => void;
  selectedStrokeIdsCount: number;
  onConvertLassoSketch: () => void;
  className?: string;
}

export const HeatControlPanel: React.FC<HeatControlPanelProps> = ({
  sim,
  onToggleRun,
  onReset,
  showStopwatch = false,
  onToggleStopwatch,
  ambientTemperature,
  onSetAmbientTemperature,
  onAddObject,
  selectedStrokeIdsCount,
  onConvertLassoSketch,
  className = '',
}) => {
  const isRunning = sim?.isRunning ?? false;
  const currentAmbient = ambientTemperature ?? sim?.ambientTemperature ?? 20;

  const handleAmbientChange = (val: number) => {
    onSetAmbientTemperature?.(val);
  };

  return (
    <div className={`space-y-3 select-none text-[#2c3e50] ${className}`}>
      {/* 1. Quick Controls Grid (Play / Pause / Reset & Stopwatch) */}
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
      </div>

      {/* 2. Large Horizontal Ambient Temperature Control with Slider (0 - 50 °C, step 5) */}
      <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-[#dfd8cb] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#234978] flex items-center justify-center border border-blue-200/60 shadow-2xs">
              <Thermometer className="w-4 h-4 text-[#234978]" />
            </div>
            <div>
              <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                Περιβάλλον
              </span>
              <span className="font-extrabold text-xs text-[#2c3e50]">
                Θερμοκρασία Περιβάλλοντος
              </span>
            </div>
          </div>
          <span className="py-1 px-2.5 rounded-lg font-black text-xs bg-blue-50 text-[#234978] border border-blue-200 shadow-2xs">
            {currentAmbient} °C
          </span>
        </div>

        {/* Range Slider 0 to 50 with step 5 */}
        <div className="px-1 pt-0.5 space-y-1.5">
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={currentAmbient}
            onChange={(e) => handleAmbientChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#234978]"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 px-0.5 select-none">
            {[0, 10, 20, 30, 40, 50].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleAmbientChange(t)}
                className={`hover:text-[#234978] cursor-pointer transition ${
                  currentAmbient === t ? 'text-[#234978] font-extrabold scale-110' : ''
                }`}
                title={`Ορισμός σε ${t} °C`}
              >
                {t}°
              </button>
            ))}
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
            Η <b>Θερμοκρασία Περιβάλλοντος</b> δρα ως σταθερή δεξαμενή θερμότητας: ζεστά δοχεία (π.χ. 50°C) ψύχονται αργά προς τη θερμοκρασία του χώρου (Νόμος Ψύξης Νεύτωνα), ενώ κρύα θερμαίνονται.
          </li>
          <li>
            Κάνε κλικ στο αχνό μολυβάκι (<b>✎</b>) δίπλα σε κάθε δοχείο για επιλογή υγρού, όγκου και αρχικής θερμοκρασίας.
          </li>
          <li>
            Κάνε κλικ στη σταγόνα (<b>💧</b>) ή στο γράφημα (<b>📈</b>) δίπλα στο δοχείο για άμεσο γέμισμα ή δυναμικό διάγραμμα.
          </li>
          <li>
            Κάνε κλικ στη φλόγα (<b>🔥</b>) δίπλα στο καμινέτο για άναμμα ή σβήσιμο.
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
