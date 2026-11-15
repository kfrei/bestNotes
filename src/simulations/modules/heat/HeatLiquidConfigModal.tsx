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
  const [volumeMl, setVolumeMl] = useState<number>(
    typeof container.containerState.volumeMl === 'number' ? container.containerState.volumeMl : 0
  );
  const [liquidType, setLiquidType] = useState<LiquidType>(container.containerState.liquidType || 'water');
  const [temperature, setTemperature] = useState<number>(container.containerState.temperature || 20);

  useEffect(() => {
    if (container.containerState) {
      setCapacityMl(container.containerState.capacityMl || 500);
      setVolumeMl(
        typeof container.containerState.volumeMl === 'number' ? container.containerState.volumeMl : 0
      );
      setLiquidType(container.containerState.liquidType || 'water');
      setTemperature(Math.round(container.containerState.temperature || 20));
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

  // Dynamic theme matching the chosen liquid: Water = cyan, Milk = soft ivory white, Oil = green-lime olive oil
  const liquidTheme = {
    water: {
      name: 'Νερό',
      accent: '#0284c7', // cyan / sky blue
      trackFill: '#38bdf8', // bright sky blue
      activeBtn: 'bg-[#0284c7] text-white shadow-xs',
      badgeBg: 'bg-sky-100 text-sky-800 border border-sky-300',
      cardRing: 'border-[#0284c7] ring-2 ring-[#0284c7]/20',
    },
    milk: {
      name: 'Γάλα',
      accent: '#64748b', // slate accent for thumb visibility
      trackFill: '#f1f5f9', // pure neutral white-grey
      activeBtn: 'bg-white text-slate-800 border-2 border-slate-400 shadow-xs font-bold',
      badgeBg: 'bg-white text-slate-700 border border-slate-300 shadow-2xs',
      cardRing: 'border-slate-400 ring-2 ring-slate-400/20',
    },
    oil: {
      name: 'Ελαιόλαδο',
      accent: '#65a30d', // rich green-lime olive oil
      trackFill: '#84cc16', // vibrant green-lime
      activeBtn: 'bg-[#65a30d] text-white shadow-xs',
      badgeBg: 'bg-lime-100 text-lime-900 border border-lime-300',
      cardRing: 'border-[#65a30d] ring-2 ring-[#65a30d]/25',
    },
  }[liquidType];

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#faf8f5] border border-[#e4dfd5] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.28),0_4px_16px_-2px_rgba(0,0,0,0.08)] ring-1 ring-black/5 p-6 text-[#2c3e50] space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e5dfd3]">
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
                Επιλογή υγρού, χωρητικότητας, όγκου και αρχικής θερμοκρασίας
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#eae4d8] text-[#64748b] hover:text-[#234978] transition cursor-pointer"
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
              const cardRing =
                type === 'water'
                  ? 'border-[#0284c7] ring-2 ring-[#0284c7]/20'
                  : type === 'milk'
                  ? 'border-slate-400 ring-2 ring-slate-400/20'
                  : 'border-[#65a30d] ring-2 ring-[#65a30d]/25';

              return (
                <div
                  key={type}
                  onClick={() => setLiquidType(type)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSel
                      ? `bg-white ${cardRing} shadow-sm scale-102`
                      : 'bg-[#f4efe6] hover:bg-white/90 border-[#e2dbce] hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1e293b]">{lp.nameEl}</span>
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                        style={{ backgroundColor: lp.color }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-block text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/50">
                        ρ = {lp.density} g/ml
                      </div>
                      <div className="inline-block text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/50">
                        c = {lp.specificHeat} J/g°C
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Container Capacity (Dimension sliders removed as dimensions are resized on canvas) */}
        <div className="p-3.5 rounded-2xl bg-[#f4efe6] border border-[#e2dbce] shadow-2xs space-y-2">
          <label className="text-[11.5px] font-bold text-[#475569] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-[#234978]" />
              <span>Χωρητικότητα Δοχείου:</span>
            </span>
            <span className="text-[11px] font-bold text-[#234978] px-2.5 py-0.5 rounded-md bg-white border border-[#dfd8cb] shadow-2xs">
              {capacityMl >= 1000 ? '1 L' : `${capacityMl} ml`}
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[250, 500, 750, 1000].map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => handleCapacityChange(cap)}
                className={`py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  capacityMl === cap
                    ? 'bg-[#234978] text-white shadow-2xs'
                    : 'bg-white/95 hover:bg-white text-[#475569] border border-[#dcd5c7] hover:border-[#c5bcab] shadow-2xs'
                }`}
              >
                {cap >= 1000 ? '1 L' : `${cap} ml`}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Liquid Volume Slider with dynamic liquid-themed color */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-[#f4efe6] border border-[#e2dbce] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#234978]" />
              <span>Όγκος Υγρού στο Δοχείο:</span>
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${liquidTheme.badgeBg} shadow-2xs`}>
              {volumeMl} ml / {capacityMl} ml ({Math.round((volumeMl / capacityMl) * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            {[
              { label: 'Άδειο (0 ml)', val: 0 },
              { label: '25%', val: Math.round(capacityMl * 0.25) },
              { label: '50%', val: Math.round(capacityMl * 0.5) },
              { label: 'Γεμάτο (100%)', val: capacityMl },
            ].map((p) => {
              const isPActive = volumeMl === p.val;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setVolumeMl(p.val)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    isPActive
                      ? liquidTheme.activeBtn
                      : 'bg-white/95 text-slate-600 border border-[#dcd5c7] hover:bg-white hover:text-slate-800 shadow-2xs'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            <input
              type="range"
              min={0}
              max={capacityMl}
              step={10}
              value={volumeMl}
              onChange={(e) => setVolumeMl(Number(e.target.value))}
              className="w-full cursor-pointer h-2.5 rounded-lg appearance-none transition-all"
              style={{
                accentColor: liquidTheme.accent,
                background: `linear-gradient(to right, ${liquidTheme.trackFill} ${(volumeMl / capacityMl) * 100}%, #d1d5db ${(volumeMl / capacityMl) * 100}%)`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-500 italic">
            * Ακόμα και σε πλήρωση 100%, διατηρείται λεπτή κενή στάθμη επάνω για λόγους ασφαλείας.
          </p>
        </div>

        {/* 4. Initial Temperature Slider */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-[#f4efe6] border border-[#e2dbce] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-[#234978]" />
              <span>Αρχική Θερμοκρασία Υγρού (T₀):</span>
            </span>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-md text-white shadow-2xs"
              style={{ backgroundColor: tempBadgeColor }}
            >
              {temperature} °C
            </span>
          </div>
          <div className="pt-1">
            <input
              type="range"
              min={5}
              max={95}
              step={1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full cursor-pointer h-2.5 rounded-lg appearance-none transition-all"
              style={{
                accentColor: tempBadgeColor,
                background: `linear-gradient(to right, ${tempBadgeColor} ${((temperature - 5) / 90) * 100}%, #d1d5db ${((temperature - 5) / 90) * 100}%)`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5dfd3]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#eae4d8] transition cursor-pointer"
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
