import { useState, useRef, useCallback, useEffect } from 'react';
import type { NotePage, StrokeObject } from '../../../types/note';
import {
  HeatSimConfig,
  HeatObject,
  HeatObjectType,
} from './types';
import { stepHeatSimulation } from './heatPhysicsEngine';
import { createDefaultHeatSim } from './HeatSimulationModule';
import { recognizeHeatSketch, createHeatObjectFromRecognition } from './HeatSketchRecognizer';

export interface UseHeatSimulationReturn {
  activeHeatSim: HeatSimConfig | null;
  getLiveSim: () => HeatSimConfig | null;
  editingContainer: HeatObject | null;
  setEditingContainer: (c: HeatObject | null) => void;
  ensureActiveHeatSim: (page: NotePage) => HeatSimConfig;
  updateActiveHeatSim: (updater: (prev: HeatSimConfig) => HeatSimConfig) => void;
  handleAddObject: (type: HeatObjectType, clientX?: number, clientY?: number) => void;
  handleAddObjectWithBounds: (
    type: HeatObjectType,
    bounds: { minX: number; minY: number; maxX: number; maxY: number }
  ) => void;
  handlePointerDown: (
    e: React.PointerEvent | PointerEvent,
    canvasLogicalX: number,
    canvasLogicalY: number
  ) => boolean;
  handlePointerMove: (
    canvasLogicalX: number,
    canvasLogicalY: number
  ) => boolean;
  handlePointerUp: () => boolean;
  handleConvertLassoSketch: (selectedStrokeIds: string[], strokes: StrokeObject[]) => boolean;
  stepPhysicsFrame: (dt: number) => void;
  toggleRun: () => void;
  resetSim: () => void;
  toggleGraph: () => void;
}

export function useHeatSimulation(
  activePage: NotePage | null,
  updatePage: (updater: (p: NotePage) => NotePage) => void
): UseHeatSimulationReturn {
  const [editingContainer, setEditingContainer] = useState<HeatObject | null>(null);

  // Active heat simulation config from activePage
  const activeHeatSim = activePage?.heatSims?.find(
    (s: HeatSimConfig) => s.id === activePage.activeHeatSimId
  ) || activePage?.heatSims?.[0] || null;

  // In-memory live simulation state ref for smooth 60fps canvas rendering without React re-render thrashing
  const liveSimRef = useRef<HeatSimConfig | null>(null);
  const lastStateSyncTimeRef = useRef<number>(0);

  // Keep liveSimRef synced when activeHeatSim changes from page or user actions
  useEffect(() => {
    if (activeHeatSim) {
      if (!liveSimRef.current || liveSimRef.current.id !== activeHeatSim.id) {
        liveSimRef.current = JSON.parse(JSON.stringify(activeHeatSim));
      } else {
        liveSimRef.current.name = activeHeatSim.name;
        liveSimRef.current.isRunning = activeHeatSim.isRunning;
        liveSimRef.current.graph = activeHeatSim.graph;
        liveSimRef.current.selectedObjectId = activeHeatSim.selectedObjectId;
        // Sync object positions and states
        for (const o of activeHeatSim.objects) {
          const live = liveSimRef.current.objects.find((x) => x.id === o.id);
          if (live) {
            live.x = o.x;
            live.y = o.y;
            live.width = o.width;
            live.height = o.height;
            if (!liveSimRef.current.isRunning) {
              if (o.burnerState) live.burnerState = o.burnerState;
              if (o.containerState) live.containerState = o.containerState;
              if (o.thermometerState) live.thermometerState = o.thermometerState;
              if (o.tripodState) live.tripodState = o.tripodState;
            }
          } else {
            liveSimRef.current.objects.push(JSON.parse(JSON.stringify(o)));
          }
        }
        liveSimRef.current.objects = liveSimRef.current.objects.filter((lo) =>
          activeHeatSim.objects.some((o) => o.id === lo.id)
        );
      }
    } else {
      liveSimRef.current = null;
    }
  }, [activeHeatSim]);

  const getLiveSim = useCallback((): HeatSimConfig | null => {
    return liveSimRef.current || activeHeatSim;
  }, [activeHeatSim]);

  // Dragging state
  const dragRef = useRef<{
    objectId: string;
    isGraph?: boolean;
    isGraphResize?: boolean;
    startX: number;
    startY: number;
    origObjX: number;
    origObjY: number;
    origGraphW?: number;
    origGraphH?: number;
  } | null>(null);

  const updateActiveHeatSim = useCallback(
    (updater: (prev: HeatSimConfig) => HeatSimConfig) => {
      updatePage((page: NotePage) => {
        const curSims = page.heatSims || [];
        const activeId = page.activeHeatSimId || curSims[0]?.id;
        if (!activeId || curSims.length === 0) {
          const freshSim = createDefaultHeatSim(320, 380);
          const updated = updater(freshSim);
          liveSimRef.current = JSON.parse(JSON.stringify(updated));
          return {
            ...page,
            heatSims: [updated],
            activeHeatSimId: updated.id,
          };
        }

        const nextSims = curSims.map((s: HeatSimConfig) => (s.id === activeId ? updater(s) : s));
        const matched = nextSims.find((s) => s.id === activeId);
        if (matched) {
          liveSimRef.current = JSON.parse(JSON.stringify(matched));
        }
        return {
          ...page,
          heatSims: nextSims,
        };
      });
    },
    [updatePage]
  );

  const ensureActiveHeatSim = useCallback(
    (page: NotePage): HeatSimConfig => {
      if (page.heatSims && page.heatSims.length > 0) {
        const found = page.heatSims.find((s: HeatSimConfig) => s.id === page.activeHeatSimId) || page.heatSims[0];
        liveSimRef.current = JSON.parse(JSON.stringify(found));
        return found;
      }
      const newSim = createDefaultHeatSim(280, 360);
      liveSimRef.current = JSON.parse(JSON.stringify(newSim));
      updatePage((p: NotePage) => ({
        ...p,
        heatSims: [newSim],
        activeHeatSimId: newSim.id,
      }));
      return newSim;
    },
    [updatePage]
  );

  const handleAddObjectWithBounds = useCallback(
    (type: HeatObjectType, bounds: { minX: number; minY: number; maxX: number; maxY: number }) => {
      const newObj = createHeatObjectFromRecognition(type, bounds, `-${Date.now()}`);

      updatePage((page: NotePage) => {
        const curSims = page.heatSims || [];
        const activeId = page.activeHeatSimId || curSims[0]?.id;
        let targetSim = curSims.find((s: HeatSimConfig) => s.id === activeId);
        let nextSims: HeatSimConfig[];
        let finalActiveId = activeId;

        if (!targetSim) {
          const freshSim = createDefaultHeatSim(bounds.minX, bounds.minY);
          targetSim = {
            ...freshSim,
            objects: [newObj],
            selectedObjectId: newObj.id,
          };
          nextSims = [targetSim];
          finalActiveId = targetSim.id;
        } else {
          targetSim = {
            ...targetSim,
            objects: [...targetSim.objects, newObj],
            selectedObjectId: newObj.id,
          };
          nextSims = curSims.map((s: HeatSimConfig) => (s.id === targetSim!.id ? targetSim! : s));
          finalActiveId = targetSim.id;
        }

        liveSimRef.current = JSON.parse(JSON.stringify(targetSim));

        return {
          ...page,
          heatSims: nextSims,
          activeHeatSimId: finalActiveId,
        };
      });
    },
    [updatePage]
  );

  const handleAddObject = useCallback(
    (type: HeatObjectType, clientX?: number, clientY?: number) => {
      const targetX = clientX ?? 340;
      const targetY = clientY ?? 400;

      const defDims: Record<string, { w: number; h: number }> = {
        burner: { w: 70, h: 110 },
        tripod: { w: 120, h: 140 },
        beaker: { w: 110, h: 130 },
        'wide-basin': { w: 200, h: 90 },
        flask: { w: 110, h: 140 },
        thermometer: { w: 24, h: 160 },
      };
      const def = defDims[type] || { w: 100, h: 120 };

      handleAddObjectWithBounds(type, {
        minX: targetX - def.w / 2,
        minY: targetY - def.h / 2,
        maxX: targetX + def.w / 2,
        maxY: targetY + def.h / 2,
      });
    },
    [handleAddObjectWithBounds]
  );

  const toggleRun = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => {
      const cur = liveSimRef.current || prev;
      const next = {
        ...cur,
        isRunning: !cur.isRunning,
      };
      liveSimRef.current = next;
      return next;
    });
  }, [updateActiveHeatSim]);

  const resetSim = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => {
      const next = {
        ...prev,
        elapsedSec: 0,
        history: [],
        objects: prev.objects.map((obj: HeatObject) => {
          if (obj.containerState) {
            return {
              ...obj,
              containerState: {
                ...obj.containerState,
                temperature: obj.containerState.initialTemp || 20,
                isBoiling: false,
                boilingIntensity: 0,
              },
            };
          }
          if (obj.thermometerState) {
            return {
              ...obj,
              thermometerState: {
                ...obj.thermometerState,
                temperature: 20,
              },
            };
          }
          if (obj.tripodState) {
            return {
              ...obj,
              tripodState: {
                ...obj.tripodState,
                wireGauzeTemp: 20,
              },
            };
          }
          return obj;
        }),
      };
      liveSimRef.current = next;
      return next;
    });
  }, [updateActiveHeatSim]);

  const toggleGraph = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => {
      const cur = liveSimRef.current || prev;
      const next = {
        ...cur,
        graph: {
          ...cur.graph,
          visible: !cur.graph.visible,
        },
      };
      liveSimRef.current = next;
      return next;
    });
  }, [updateActiveHeatSim]);

  // Pointer interactions on canvas (clicking pencil, toggling burner, dragging objects)
  const handlePointerDown = useCallback(
    (_e: React.PointerEvent | PointerEvent, lx: number, ly: number): boolean => {
      const sim = liveSimRef.current || activeHeatSim;
      if (!sim) return false;

      // 1. Check Graph window hit
      if (sim.graph.visible) {
        const g = sim.graph;
        // Check resize handle
        if (
          lx >= g.x + g.width - 24 &&
          lx <= g.x + g.width + 4 &&
          ly >= g.y + g.height - 24 &&
          ly <= g.y + g.height + 4
        ) {
          dragRef.current = {
            objectId: 'graph',
            isGraph: true,
            isGraphResize: true,
            startX: lx,
            startY: ly,
            origObjX: g.x,
            origObjY: g.y,
            origGraphW: g.width,
            origGraphH: g.height,
          };
          return true;
        }

        // Check header drag
        if (lx >= g.x && lx <= g.x + g.width && ly >= g.y && ly <= g.y + 32) {
          dragRef.current = {
            objectId: 'graph',
            isGraph: true,
            startX: lx,
            startY: ly,
            origObjX: g.x,
            origObjY: g.y,
          };
          return true;
        }
      }

      // 2. Check objects in reverse z-order (topmost first)
      const reversed = [...sim.objects].reverse();

      for (const obj of reversed) {
        const inside =
          lx >= obj.x - 4 &&
          lx <= obj.x + obj.width + 4 &&
          ly >= obj.y - 4 &&
          ly <= obj.y + obj.height + 4;

        if (!inside) continue;

        // Check if pencil icon was clicked (for beaker, basin, flask)
        if (obj.containerState) {
          const pencilX = obj.x + obj.width - 14;
          const pencilY = obj.y - 6;
          const distPencil = Math.hypot(lx - pencilX, ly - pencilY);
          if (distPencil <= 18) {
            setEditingContainer(obj);
            return true;
          }
        }

        // Check if Burner On/Off button was clicked
        if (obj.type === 'burner' && obj.burnerState) {
          const btnX = obj.x + obj.width / 2;
          const btnY = obj.y + obj.height - 10;
          if (Math.abs(lx - btnX) <= 32 && Math.abs(ly - btnY) <= 16) {
            updateActiveHeatSim((prev: HeatSimConfig) => {
              const cur = liveSimRef.current || prev;
              const next = {
                ...cur,
                objects: cur.objects.map((o: HeatObject) =>
                  o.id === obj.id
                    ? {
                        ...o,
                        burnerState: {
                          ...o.burnerState!,
                          isOn: !o.burnerState?.isOn,
                        },
                      }
                    : o
                ),
              };
              liveSimRef.current = next;
              return next;
            });
            return true;
          }
        }

        // Otherwise start dragging this object
        dragRef.current = {
          objectId: obj.id,
          startX: lx,
          startY: ly,
          origObjX: obj.x,
          origObjY: obj.y,
        };

        updateActiveHeatSim((prev: HeatSimConfig) => {
          const cur = liveSimRef.current || prev;
          const next = {
            ...cur,
            selectedObjectId: obj.id,
          };
          liveSimRef.current = next;
          return next;
        });
        return true;
      }

      return false;
    },
    [activeHeatSim, updateActiveHeatSim]
  );

  const handlePointerMove = useCallback(
    (lx: number, ly: number): boolean => {
      const drag = dragRef.current;
      const sim = liveSimRef.current || activeHeatSim;
      if (!drag || !sim) return false;

      const dx = lx - drag.startX;
      const dy = ly - drag.startY;

      if (drag.isGraph) {
        if (drag.isGraphResize) {
          const nextW = Math.max(220, (drag.origGraphW || 290) + dx);
          const nextH = Math.max(160, (drag.origGraphH || 200) + dy);
          if (liveSimRef.current) {
            liveSimRef.current.graph.width = nextW;
            liveSimRef.current.graph.height = nextH;
            liveSimRef.current.graph.customMoved = true;
          }
        } else {
          if (liveSimRef.current) {
            liveSimRef.current.graph.x = drag.origObjX + dx;
            liveSimRef.current.graph.y = drag.origObjY + dy;
            liveSimRef.current.graph.customMoved = true;
          }
        }
        return true;
      }

      // Dragging an object: update in liveSimRef immediately for smooth 60fps response
      if (liveSimRef.current) {
        const obj = liveSimRef.current.objects.find((o) => o.id === drag.objectId);
        if (obj) {
          obj.x = drag.origObjX + dx;
          obj.y = drag.origObjY + dy;
        }
      }
      return true;
    },
    [activeHeatSim]
  );

  const handlePointerUp = useCallback((): boolean => {
    if (!dragRef.current) return false;
    dragRef.current = null;
    // Persist final position to note page
    if (liveSimRef.current) {
      updateActiveHeatSim(() => liveSimRef.current!);
    }
    return true;
  }, [updateActiveHeatSim]);

  // Recognition from Lasso selection
  const handleConvertLassoSketch = useCallback(
    (selectedStrokeIds: string[], strokes: StrokeObject[]): boolean => {
      const selected = strokes.filter((s) => selectedStrokeIds.includes(s.id));
      if (selected.length === 0) return false;

      const rec = recognizeHeatSketch(selected);
      if (!rec) return false;

      const newObj = createHeatObjectFromRecognition(rec.type, rec.bounds, `-${Date.now()}`);

      updatePage((page: NotePage) => {
        const curSims = page.heatSims || [];
        const activeId = page.activeHeatSimId || curSims[0]?.id;
        const targetSim = curSims.find((s: HeatSimConfig) => s.id === activeId);

        if (targetSim) {
          const updated: HeatSimConfig = {
            ...targetSim,
            objects: [...targetSim.objects, newObj],
            selectedObjectId: newObj.id,
          };
          liveSimRef.current = JSON.parse(JSON.stringify(updated));
          return {
            ...page,
            strokes: page.strokes.filter((s: StrokeObject) => !selectedStrokeIds.includes(s.id)),
            heatSims: curSims.map((s: HeatSimConfig) => (s.id === activeId ? updated : s)),
          };
        } else {
          const freshSim = createDefaultHeatSim(rec.bounds.minX, rec.bounds.minY);
          freshSim.objects = [newObj];
          freshSim.selectedObjectId = newObj.id;
          liveSimRef.current = JSON.parse(JSON.stringify(freshSim));
          return {
            ...page,
            strokes: page.strokes.filter((s: StrokeObject) => !selectedStrokeIds.includes(s.id)),
            heatSims: [freshSim],
            activeHeatSimId: freshSim.id,
          };
        }
      });

      return true;
    },
    [updatePage]
  );

  // Advances physics frame at 60fps in memory, throttling page state sync
  const stepPhysicsFrame = useCallback(
    (dt: number) => {
      const cur = liveSimRef.current || activeHeatSim;
      if (!cur || !cur.isRunning) return;
      const next = stepHeatSimulation(cur, dt);
      liveSimRef.current = next;

      // Throttle persistent sync to activePage (every 1.5 seconds) so React does not re-render at 60fps
      const now = performance.now();
      if (now - lastStateSyncTimeRef.current > 1500) {
        lastStateSyncTimeRef.current = now;
        updateActiveHeatSim(() => next);
      }
    },
    [activeHeatSim, updateActiveHeatSim]
  );

  return {
    activeHeatSim,
    getLiveSim,
    editingContainer,
    setEditingContainer,
    ensureActiveHeatSim,
    updateActiveHeatSim,
    handleAddObject,
    handleAddObjectWithBounds,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleConvertLassoSketch,
    stepPhysicsFrame,
    toggleRun,
    resetSim,
    toggleGraph,
  };
}