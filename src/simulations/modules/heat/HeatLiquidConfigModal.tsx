import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Droplets, Thermometer, Box, Sparkles, GripVertical } from 'lucide-react';
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

  // Floating draggable position (remembers last dragged position, default to convenient side of screen)
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('bestnotes_heat_config_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return {
            x: Math.max(10, Math.min(window.innerWidth - 380, parsed.x)),
            y: Math.max(50, Math.min(window.innerHeight - 300, parsed.y)),
          };
        }
      }
    } catch {
      // ignore
    }
    const defaultX = Math.max(20, Math.min(window.innerWidth - 440, window.innerWidth - 460));
    const defaultY = Math.max(60, Math.min(window.innerHeight - 560, 95));
    return { x: defaultX, y: defaultY };
  });

  const dragRef = useRef<{
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
    lastPos?: { x: number; y: number };
  } | null>(null);

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

  // Real-time live update function so adjustments show instantly on the canvas
  const applyLive = (newCap: number, newVol: number, newType: LiquidType, newTemp: number) => {
    if (!container.containerState) return;
    const bp = LIQUID_REGISTRY[newType]?.boilingPoint || 100;
    const isBoil = newTemp >= bp - 2;
    const intensity = isBoil ? 0.85 : newTemp > 75 ? Math.min(0.8, (newTemp - 75) / (bp - 75)) : 0;
    const updated: HeatObject = {
      ...container,
      containerState: {
        ...container.containerState,
        capacityMl: newCap,
        volumeMl: Math.min(newCap, newVol),
        liquidType: newType,
        temperature: newTemp,
        initialTemp: newTemp,
        isBoiling: isBoil,
        boilingIntensity: intensity,
      },
    };
    onSave(updated);
  };

  const handleLiquidTypeChange = (type: LiquidType) => {
    setLiquidType(type);
    applyLive(capacityMl, volumeMl, type, temperature);
  };

  const handleCapacityChange = (cap: number) => {
    setCapacityMl(cap);
    const newVol = volumeMl > cap ? cap : volumeMl;
    if (volumeMl > cap) setVolumeMl(cap);
    applyLive(cap, newVol, liquidType, temperature);
  };

  const handleVolumeChange = (vol: number) => {
    setVolumeMl(vol);
    applyLive(capacityMl, vol, liquidType, temperature);
  };

  const handleTempChange = (temp: number) => {
    setTemperature(temp);
    applyLive(capacityMl, volumeMl, liquidType, temp);
  };

  const handleApplyAndClose = () => {
    applyLive(capacityMl, volumeMl, liquidType, temperature);
    onClose();
  };

  const currentLiquidProps = LIQUID_REGISTRY[liquidType];
  const tempBadgeColor = getThermometerColor(temperature);

  // Dynamic theme matching the chosen liquid
  const liquidTheme = {
    water: {
      name: 'Νερό',
      accent: '#0284c7',
      trackFill: '#38bdf8',
      activeBtn: 'bg-[#0284c7] text-white shadow-xs',
      badgeBg: 'bg-sky-100 text-sky-800 border border-sky-300',
      cardRing: 'border-[#0284c7] ring-2 ring-[#0284c7]/20',
    },
    milk: {
      name: 'Γάλα',
      accent: '#64748b',
      trackFill: '#f1f5f9',
      activeBtn: 'bg-white text-slate-800 border-2 border-slate-400 shadow-xs font-bold',
      badgeBg: 'bg-white text-slate-700 border border-slate-300 shadow-2xs',
      cardRing: 'border-slate-400 ring-2 ring-slate-400/20',
    },
    oil: {
      name: 'Ελαιόλαδο',
      accent: '#65a30d',
      trackFill: '#84cc16',
      activeBtn: 'bg-[#65a30d] text-white shadow-xs',
      badgeBg: 'bg-lime-100 text-lime-900 border border-lime-300',
      cardRing: 'border-[#65a30d] ring-2 ring-[#65a30d]/25',
    },
  }[liquidType];

  return (
    <div
      data-ui-panel="true"
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      className="fixed z-40 w-[380px] sm:w-[440px] max-h-[88vh] overflow-y-auto rounded-3xl ipados-liquid-glass bg-[#fdfbf7]/42 backdrop-blur-2xl backdrop-saturate-200 border border-white/85 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18),0_4px_16px_-2px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 p-3.5 sm:p-4 text-[#2c3e50] space-y-3 select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Draggable Liquid Header */}
      <div
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          e.stopPropagation();
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // ignore
          }
          dragRef.current = {
            startClientX: e.clientX,
            startClientY: e.clientY,
            origX: pos.x,
            origY: pos.y,
          };
        }}
        onPointerMove={(e) => {
          const drag = dragRef.current;
          if (!drag) return;
          e.stopPropagation();
          const nextX = Math.max(
            8,
            Math.min(window.innerWidth - 390, drag.origX + (e.clientX - drag.startClientX))
          );
          const nextY = Math.max(
            40,
            Math.min(window.innerHeight - 150, drag.origY + (e.clientY - drag.startClientY))
          );
          const nextPos = { x: nextX, y: nextY };
          drag.lastPos = nextPos;
          setPos(nextPos);
        }}
        onPointerUp={() => {
          const last = dragRef.current?.lastPos;
          dragRef.current = null;
          if (last) {
            try {
              localStorage.setItem('bestnotes_heat_config_pos', JSON.stringify(last));
            } catch {
              // ignore
            }
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        style={{ touchAction: 'none' }}
        className="flex items-center justify-between pb-2 border-b border-[#e2dbce]/70 cursor-grab active:cursor-grabbing select-none"
        title="Σύρε από εδώ για μετακίνηση του παραθύρου ρυθμίσεων"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#234978]/10 flex items-center justify-center text-[#234978] shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-[#234978]">
                {container.type === 'beaker'
                  ? 'Ρυθμίσεις Ποτηριού Ζέσεως'
                  : container.type === 'wide-basin'
                  ? 'Ρυθμίσεις Πλατιάς Λεκάνης (Υδατόλουτρο)'
                  : 'Ρυθμίσεις Κωνικής Φιάλης'}
              </h3>
              <GripVertical className="w-3.5 h-3.5 text-[#94a3b8] opacity-60" />
            </div>
            <p className="text-[10px] text-[#64748b]">
              Ζωντανή προσαρμογή υγρού, όγκου & θερμοκρασίας
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/80 text-[#64748b] hover:text-[#234978] transition cursor-pointer"
          title="Κλείσιμο παραθύρου"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Liquid Selection Cards */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#475569] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#234978]" />
          <span>Επιλογή Υγρού:</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {(['water', 'milk', 'oil'] as LiquidType[]).map((type) => {
            const lp = LIQUID_REGISTRY[type];
            const isSel = liquidType === type;
            const cardRing =
              type === 'water'
                ? 'border-[#0284c7] ring-2 ring-[#0284c7]/25'
                : type === 'milk'
                ? 'border-slate-400 ring-2 ring-slate-400/25'
                : 'border-[#65a30d] ring-2 ring-[#65a30d]/30';

            return (
              <div
                key={type}
                onClick={() => handleLiquidTypeChange(type)}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSel
                    ? `bg-white/95 ${cardRing} shadow-sm scale-102`
                    : 'bg-white/60 hover:bg-white/85 border-white/80 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] sm:text-[11.5px] font-bold text-[#1e293b] truncate">
                      {lp.nameEl}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full border border-black/15 shadow-2xs shrink-0"
                      style={{ backgroundColor: lp.color }}
                    />
                  </div>

                  {/* Physical Properties: Density (ρ) & Specific Heat (c) with standard units */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[8.5px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50/90 text-blue-800 border border-blue-200/60 shadow-2xs">
                      <span className="font-bold">ρ =</span>
                      <span>{lp.density} g/cm³</span>
                    </div>
                    <div className="flex items-center justify-between text-[8.5px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-50/90 text-amber-900 border border-amber-200/60 shadow-2xs">
                      <span className="font-bold">c =</span>
                      <span>{lp.specificHeat} J/(g·°C)</span>
                    </div>
                  </div>

                  {/* Thermal Phase Change Points: Melting Point & Boiling Point */}
                  <div className="pt-1.5 border-t border-slate-200/70 space-y-0.5 text-[8px] sm:text-[8.5px]">
                    <div className="flex items-center justify-between gap-0.5 text-slate-600">
                      <span className="text-slate-500 font-medium" title="Σημείο Τήξης">
                        <span className="hidden sm:inline">Σημείο </span><span className="sm:hidden">Σ. </span>Τήξης:
                      </span>
                      <span className="font-bold text-sky-700">{lp.meltingPoint} °C</span>
                    </div>
                    <div className="flex items-center justify-between gap-0.5 text-slate-600">
                      <span className="text-slate-500 font-medium" title="Σημείο Ζέσεως">
                        <span className="hidden sm:inline">Σημείο </span><span className="sm:hidden">Σ. </span>Ζέσεως:
                      </span>
                      <span className="font-bold text-rose-700">{lp.boilingPoint} °C</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentLiquidProps?.descriptionEl && (
          <p className="text-[9.5px] text-slate-500 italic bg-white/45 px-2.5 py-1 rounded-xl border border-white/70">
            ℹ️ {currentLiquidProps.descriptionEl}
          </p>
        )}
      </div>

      {/* 2. Container Capacity */}
      <div className="p-2.5 rounded-2xl bg-white/55 backdrop-blur-md border border-white/80 shadow-2xs space-y-1.5">
        <label className="text-[11px] font-bold text-[#475569] flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Box className="w-3 h-3 text-[#234978]" />
            <span>Χωρητικότητα Δοχείου:</span>
          </span>
          <span className="text-[10.5px] font-bold text-[#234978] px-2 py-0.2 rounded-md bg-white border border-[#dfd8cb] shadow-2xs">
            {capacityMl >= 1000 ? '1 L' : `${capacityMl} ml`}
          </span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[250, 500, 750, 1000].map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => handleCapacityChange(cap)}
              className={`py-1 rounded-xl text-[10.5px] font-bold transition cursor-pointer ${
                capacityMl === cap
                  ? 'bg-[#234978] text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-[#475569] border border-[#dcd5c7] hover:border-[#c5bcab] shadow-2xs'
              }`}
            >
              {cap >= 1000 ? '1 L' : `${cap} ml`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Liquid Volume Slider with dynamic liquid theme */}
      <div className="space-y-1.5 p-2.5 rounded-2xl bg-white/55 backdrop-blur-md border border-white/80 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#475569]">
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-[#234978]" />
            <span>Όγκος Υγρού στο Δοχείο:</span>
          </span>
          <span className={`text-[10.5px] font-bold px-2 py-0.2 rounded-md ${liquidTheme.badgeBg} shadow-2xs`}>
            {volumeMl} ml / {capacityMl} ml ({Math.round((volumeMl / capacityMl) * 100)}%)
          </span>
        </div>

        <div className="flex items-center gap-1 pt-0.5">
          {[
            { label: '0 ml', val: 0 },
            { label: '25%', val: Math.round(capacityMl * 0.25) },
            { label: '50%', val: Math.round(capacityMl * 0.5) },
            { label: '100%', val: capacityMl },
          ].map((p) => {
            const isPActive = volumeMl === p.val;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleVolumeChange(p.val)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  isPActive
                    ? liquidTheme.activeBtn
                    : 'bg-white/85 text-slate-600 border border-[#dcd5c7] hover:bg-white hover:text-slate-800 shadow-2xs'
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
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full cursor-pointer h-2.5 rounded-lg appearance-none transition-all"
            style={{
              accentColor: liquidTheme.accent,
              background: `linear-gradient(to right, ${liquidTheme.trackFill} ${(volumeMl / capacityMl) * 100}%, #d1d5db ${(volumeMl / capacityMl) * 100}%)`,
            }}
          />
        </div>
      </div>

      {/* 4. Initial Temperature Slider */}
      <div className="space-y-1.5 p-2.5 rounded-2xl bg-white/55 backdrop-blur-md border border-white/80 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#475569]">
          <span className="flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-[#234978]" />
            <span>Αρχική Θερμοκρασία Υγρού (T₀):</span>
          </span>
          <span
            className="text-[10.5px] font-bold px-2 py-0.2 rounded-md text-white shadow-2xs"
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
            onChange={(e) => handleTempChange(Number(e.target.value))}
            className="w-full cursor-pointer h-2.5 rounded-lg appearance-none transition-all"
            style={{
              accentColor: tempBadgeColor,
              background: `linear-gradient(to right, ${tempBadgeColor} ${((temperature - 5) / 90) * 100}%, #d1d5db ${((temperature - 5) / 90) * 100}%)`,
            }}
          />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2dbce]/70">
        <button
          type="button"
          onClick={handleApplyAndClose}
          className="px-4 py-1.5 rounded-xl bg-[#234978] hover:bg-[#1a385c] text-white text-xs font-bold shadow-xs hover:shadow transition cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Εντάξει</span>
        </button>
      </div>
    </div>
  );
};
