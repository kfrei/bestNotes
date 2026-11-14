import React, { useState, useEffect } from 'react';
import { X, Check, Droplets, Thermometer, Box, Sparkles } from 'lucide-react';
import { HeatObject, LiquidType, LIQUID_REGISTRY } from './types';
import { getThermometerColor } from './HeatRenderer';

export interface HeatLiquidConfigModalProps {
  isOpen: boolean;
  container: HeatObject | null;
  onSave: (updated: HeatObject) => void;
  onClose: () => void;
}

export const HeatLiquidConfigModal: React.FC<HeatLiquidConfigModalProps> = ({
  isOpen,
  container,
  onSave,
  onClose,
}) => {
  if (!isOpen || !container || !container.containerState) return null;

  const [capacityMl, setCapacityMl] = useState<number>(container.containerState.capacityMl || 500);
  const [volumeMl, setVolumeMl] = useState<number>(container.containerState.volumeMl || 250);
  const [liquidType, setLiquidType] = useState<LiquidType>(container.containerState.liquidType || 'water');
  const [temperature, setTemperature] = useState<number>(container.containerState.temperature || 20);
  const [widthPx, setWidthPx] = useState<number>(container.width || 120);
  const [heightPx, setHeightPx] = useState<number>(container.height || 160);

  useEffect(() => {
    if (container.containerState) {
      setCapacityMl(container.containerState.capacityMl || 500);
      setVolumeMl(container.containerState.volumeMl || 250);
      setLiquidType(container.containerState.liquidType || 'water');
      setTemperature(Math.round(container.containerState.temperature || 20));
      setWidthPx(container.width || 120);
      setHeightPx(container.height || 160);
    }
  }, [container]);

  // Ensure volume never exceeds capacity
  const handleCapacityChange = (cap: number) => {
    setCapacityMl(cap);
    if (volumeMl > cap) setVolumeMl(cap);
  };

  const handleSave = () => {
    if (!container.containerState) return;

    const updated: HeatObject = {
      ...container,
      width: widthPx,
      height: heightPx,
      containerState: {
        ...container.containerState,
        capacityMl,
        volumeMl: Math.min(capacityMl, volumeMl),
        liquidType,
        temperature,
        initialTemp: temperature,
      },
    };
    onSave(updated);
    onClose();
  };

  const currentLiquidProps = LIQUID_REGISTRY[liquidType];
  const tempBadgeColor = getThermometerColor(temperature);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-lg rounded-3xl ipados-liquid-glass bg-[#fdfbf7]/85 backdrop-blur-2xl backdrop-saturate-200 border border-white/90 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.22),0_4px_16px_-2px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 p-6 text-[#2c3e50] space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#234978]/10 flex items-center justify-center text-[#234978]">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#234978]">
                {container.type === 'beaker'
                  ? 'Ρυθμίσεις Ποτηριού Ζέσεως'
                  : container.type === 'wide-basin'
                  ? 'Ρυθμίσεις Πλατιάς Λεκάνης (Υδατόλουτρο)'
                  : 'Ρυθμίσεις Κωνικής Φιάλης'}
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Επιλογή υγρού, όγκου, διαστάσεων και αρχικής θερμοκρασίας
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#efebe3] text-[#64748b] hover:text-[#234978] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Liquid Selection Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#475569] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#234978]" />
            <span>Επιλογή Υγρού Περιεχομένου:</span>
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            {(['water', 'milk', 'oil'] as LiquidType[]).map((type) => {
              const lp = LIQUID_REGISTRY[type];
              const isSel = liquidType === type;
              return (
                <div
                  key={type}
                  onClick={() => setLiquidType(type)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSel
                      ? 'bg-white border-[#234978] shadow-md ring-2 ring-[#234978]/20 scale-102'
                      : 'bg-[#efebe3]/55 hover:bg-white/80 border-[#dfd8cb] hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1e293b]">{lp.nameEl}</span>
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: lp.color }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-block text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        ρ = {lp.density} g/ml
                      </div>
                      <div className="inline-block text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
                        c = {lp.specificHeat} J/g°C
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-[#64748b] mt-2 line-clamp-2 leading-tight">
                    {lp.descriptionEl}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Container Dimensions & Capacity */}
        <div className="grid grid-cols-2 gap-4 p-3 rounded-2xl bg-[#efebe3]/45 border border-[#e8e2d6]">
          {/* Capacity Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#475569] flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-[#234978]" />
              <span>Χωρητικότητα Δοχείου:</span>
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[250, 500, 750, 1000].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => handleCapacityChange(cap)}
                  className={`py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    capacityMl === cap
                      ? 'bg-[#234978] text-white shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-[#475569] border border-[#dfd8cb]'
                  }`}
                >
                  {cap >= 1000 ? '1 L' : `${cap}ml`}
                </button>
              ))}
            </div>
          </div>

          {/* Width / Height adjusters */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#475569]">
              <span>Διαστάσεις Δοχείου:</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {widthPx} × {heightPx} px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-slate-500 w-8">Πλάτος:</span>
              <input
                type="range"
                min={80}
                max={220}
                value={widthPx}
                onChange={(e) => setWidthPx(Number(e.target.value))}
                className="w-full accent-[#234978] cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-slate-500 w-8">Ύψος:</span>
              <input
                type="range"
                min={90}
                max={260}
                value={heightPx}
                onChange={(e) => setHeightPx(Number(e.target.value))}
                className="w-full accent-[#234978] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Liquid Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#234978]" />
              <span>Όγκος Υγρού στο Δοχείο:</span>
            </span>
            <span className="text-xs font-bold text-[#234978] px-2 py-0.5 rounded-md bg-[#234978]/10">
              {volumeMl} ml / {capacityMl} ml ({Math.round((volumeMl / capacityMl) * 100)}%)
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={capacityMl}
            step={10}
            value={volumeMl}
            onChange={(e) => setVolumeMl(Number(e.target.value))}
            className="w-full accent-[#234978] cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <p className="text-[10px] text-slate-400 italic">
            * Ακόμα και σε πλήρωση 100%, διατηρείται λεπτή κενή στάθμη επάνω για λόγους ασφαλείας.
          </p>
        </div>

        {/* 4. Initial Temperature Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-[#234978]" />
              <span>Αρχική Θερμοκρασία Υγρού (T₀):</span>
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md text-white shadow-2xs"
              style={{ backgroundColor: tempBadgeColor }}
            >
              {temperature} °C
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={95}
            step={1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full cursor-pointer h-2 bg-slate-200 rounded-lg"
            style={{ accentColor: tempBadgeColor }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e8e2d6]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#efebe3] transition cursor-pointer"
          >
            Ακύρωση
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#234978] hover:bg-[#1a385c] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Εφαρμογή</span>
          </button>
        </div>
      </div>
    </div>
  );
};
