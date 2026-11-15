import { useState, useRef, useCallback, useEffect } from 'react';
import type { NotePage, StrokeObject } from '../../../types/note';
import {
  HeatSimConfig,
  HeatGraphConfig,
  HeatObject,
  HeatObjectType,
  FlameIntensity,
} from './types';
import { stepHeatSimulation } from './heatPhysicsEngine';
import { createDefaultHeatSim } from './HeatSimulationModule';
import { recognizeHeatSketch, createHeatObjectFromRecognition } from './HeatSketchRecognizer';
import {
  getContainerActionButtonsWorldPos,
  getBurnerActionButtonWorldPos,
  triggerContainerFillFeedback,
  notifyContainerSloshMotion,
  getTripodContainerDockPos,
  getTripodBurnerDockPos,
  getWaterBathNestedDockPos,
  isPointOnHeatObject,
} from './HeatRenderer';

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
    canvasLogicalY: number,
    currentTool?: string
  ) => boolean;
  handlePointerMove: (
    canvasLogicalX: number,
    canvasLogicalY: number
  ) => boolean;
  handlePointerUp: () => boolean;
  isDragging: () => boolean;
  handleConvertLassoSketch: (selectedStrokeIds: string[], strokes: StrokeObject[]) => boolean;
  stepPhysicsFrame: (dt: number) => void;
  toggleRun: () => void;
  startHeatingAndSim: () => void;
  pauseHeatingAndSim: () => void;
  toggleBurner: (burnerId?: string) => void;
  resetSim: () => void;
  setAmbientTemperature: (temp: number) => void;
  toggleGraph: () => void;
  handleFillContainer: (containerId?: string) => void;
  handleDeleteSelectedObject: (idOrIds?: string | string[]) => void;
  setSelectedObjectIds: (ids: string[]) => void;
  handleZOrderSelected: (action: 'to-back' | 'step-back' | 'step-front' | 'to-front') => boolean;
  graphChoicePrompt: {
    isOpen: boolean;
    targetContainer: HeatObject | null;
    existingGraph: HeatGraphConfig | null;
  } | null;
  handleGraphChoice: (choice: 'existing' | 'new') => void;
  cancelGraphChoice: () => void;
  handleToggleContainerGraph: (targetContainer: HeatObject) => void;
  handleHover: (canvasLogicalX: number, canvasLogicalY: number) => void;
  clearHover: () => void;
  getHoverPoint: () => { x: number; y: number } | null;
  getSelectedObjects: () => HeatObject[];
  handleCopy: () => HeatObject[];
  handlePasteObjects: (objectsToPaste: HeatObject[], targetPos?: { x: number; y: number }) => string[];
  handleDuplicateSelected: () => string[];
  handleCut: () => HeatObject[];
}

export const HEAT_SIM_BACKUP_KEY = 'bestnotes_heat_sim_live_backup';
export const HEAT_SIM_BY_ID_PREFIX = 'bestnotes_heat_sim_';

export function persistHeatSimLive(sim: HeatSimConfig): void {
  try {
    const safeSim = { ...sim, isRunning: false };
    const serialized = JSON.stringify(safeSim);
    localStorage.setItem(HEAT_SIM_BACKUP_KEY, serialized);
    localStorage.setItem(`${HEAT_SIM_BY_ID_PREFIX}${safeSim.id}`, serialized);
  } catch {
    // ignore quota errors
  }
}

export function restoreHeatSimFromStorage(simFromPage: HeatSimConfig): HeatSimConfig {
  try {
    const rawBackup =
      localStorage.getItem(`${HEAT_SIM_BY_ID_PREFIX}${simFromPage.id}`) ||
      localStorage.getItem(HEAT_SIM_BACKUP_KEY);
    if (rawBackup) {
      const parsed: HeatSimConfig = JSON.parse(rawBackup);
      if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
        // If the backup has progress (elapsedSec > 0 or history or modified liquid/temp), restore it!
        const hasPageProgress =
          (simFromPage.elapsedSec || 0) > 0 || (simFromPage.history && simFromPage.history.length > 1);
        const hasBackupProgress =
          (parsed.elapsedSec || 0) > 0 || (parsed.history && parsed.history.length > 1);
        const hasCustomObjects = parsed.objects.some(
          (o) =>
            (o.containerState?.temperature && o.containerState.temperature !== 20) ||
            (o.containerState?.liquidType && o.containerState.liquidType !== 'water') ||
            o.type === 'flask'
        );
        if (parsed.id === simFromPage.id || (!hasPageProgress && (hasBackupProgress || hasCustomObjects))) {
          return {
            ...parsed,
            id: simFromPage.id,
            isRunning: false,
          };
        }
      }
    }
  } catch {
    // ignore
  }
  return simFromPage;
}

export function useHeatSimulation(
  activePage: NotePage | null,
  updatePage: (updater: (p: NotePage) => NotePage) => void
): UseHeatSimulationReturn {
  const [editingContainer, setEditingContainer] = useState<HeatObject | null>(null);
  const [graphChoicePrompt, setGraphChoicePrompt] = useState<{
    isOpen: boolean;
    targetContainer: HeatObject | null;
    existingGraph: HeatGraphConfig | null;
  } | null>(null);

  // Active heat simulation config from activePage
  const activeHeatSim = activePage?.heatSims?.find(
    (s: HeatSimConfig) => s.id === activePage.activeHeatSimId
  ) || activePage?.heatSims?.[0] || null;

  // In-memory live simulation state ref for smooth 60fps canvas rendering without React re-render thrashing
  const liveSimRef = useRef<HeatSimConfig | null>(null);
  const lastStateSyncTimeRef = useRef<number>(0);
  const hoverPointRef = useRef<{ x: number; y: number } | null>(null);

  const handleHover = useCallback((canvasLogicalX: number, canvasLogicalY: number) => {
    hoverPointRef.current = { x: canvasLogicalX, y: canvasLogicalY };
  }, []);

  const clearHover = useCallback(() => {
    hoverPointRef.current = null;
  }, []);

  const getHoverPoint = useCallback(() => hoverPointRef.current, []);

  // Flush live simulation state to localStorage & page on unload / refresh
  useEffect(() => {
    const flushOnUnload = () => {
      const live = liveSimRef.current;
      if (live) {
        persistHeatSimLive(live);
        updateActiveHeatSim(() => ({ ...live, isRunning: false }));
      }
    };
    window.addEventListener('beforeunload', flushOnUnload);
    window.addEventListener('pagehide', flushOnUnload);
    return () => {
      window.removeEventListener('beforeunload', flushOnUnload);
      window.removeEventListener('pagehide', flushOnUnload);
    };
  }, []);

  // Keep liveSimRef synced when activeHeatSim changes from page or user actions
  useEffect(() => {
    if (activeHeatSim) {
      if (!liveSimRef.current || liveSimRef.current.id !== activeHeatSim.id) {
        const candidate = restoreHeatSimFromStorage(activeHeatSim);
        const cloned: HeatSimConfig = JSON.parse(JSON.stringify(candidate));
        cloned.isRunning = false;
        liveSimRef.current = cloned;
        if (activeHeatSim.isRunning) {
          updateActiveHeatSim((prev) => ({ ...prev, isRunning: false }));
        }
        // If restored candidate has user progress beyond default, sync back to page immediately
        if (
          candidate.elapsedSec !== activeHeatSim.elapsedSec ||
          JSON.stringify(candidate.objects) !== JSON.stringify(activeHeatSim.objects)
        ) {
          updateActiveHeatSim(() => cloned);
        }
      } else {
        liveSimRef.current.name = activeHeatSim.name;
        liveSimRef.current.isRunning = activeHeatSim.isRunning;
        liveSimRef.current.graph = activeHeatSim.graph;
        liveSimRef.current.graphs = activeHeatSim.graphs;
        liveSimRef.current.selectedObjectId = activeHeatSim.selectedObjectId;
        liveSimRef.current.selectedObjectIds = activeHeatSim.selectedObjectIds;
        liveSimRef.current.ambientTemperature = activeHeatSim.ambientTemperature;
        if (!liveSimRef.current.isRunning && activeHeatSim.elapsedSec !== undefined) {
          liveSimRef.current.elapsedSec = activeHeatSim.elapsedSec;
          liveSimRef.current.history = activeHeatSim.history;
        }
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
    objectId?: string;
    isGroup?: boolean;
    mode?: 'move' | 'scale-corner' | 'stretch-side';
    handle?: 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w';
    isGraph?: boolean;
    isGraphResize?: boolean;
    targetGraph?: HeatGraphConfig;
    startX: number;
    startY: number;
    origObjX?: number;
    origObjY?: number;
    origW?: number;
    origH?: number;
    origRatio?: number;
    origGraphW?: number;
    origGraphH?: number;
    origObjects?: { id: string; x: number; y: number; width: number; height: number }[];
    origBounds?: { minX: number; minY: number; maxX: number; maxY: number };
    anchorX?: number;
    anchorY?: number;
  } | null>(null);

  const dragMotionHistoryRef = useRef<{ time: number; x: number } | null>(null);

  const updateActiveHeatSim = useCallback(
    (updater: (prev: HeatSimConfig) => HeatSimConfig) => {
      updatePage((page: NotePage) => {
        const curSims = page.heatSims || [];
        const activeId = page.activeHeatSimId || curSims[0]?.id;
        if (!activeId || curSims.length === 0) {
          const freshSim = createDefaultHeatSim(320, 380);
          const candidate = restoreHeatSimFromStorage(freshSim);
          const updated = updater(candidate);
          liveSimRef.current = JSON.parse(JSON.stringify(updated));
          persistHeatSimLive(updated);
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
          persistHeatSimLive(matched);
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
        const restored = restoreHeatSimFromStorage(found);
        liveSimRef.current = JSON.parse(JSON.stringify(restored));
        return restored;
      }
      let candidateSim: HeatSimConfig | null = null;
      try {
        const raw = localStorage.getItem(HEAT_SIM_BACKUP_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
            candidateSim = { ...parsed, isRunning: false };
          }
        }
      } catch {
        // ignore
      }

      const newSim = candidateSim || createDefaultHeatSim(280, 360);
      liveSimRef.current = JSON.parse(JSON.stringify(newSim));
      persistHeatSimLive(newSim);
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
            graph: {
              ...freshSim.graph,
              visible: false,
            },
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
      const curSim = liveSimRef.current || activeHeatSim;
      const existingObjs = curSim?.objects || [];

      const defDims: Record<string, { w: number; h: number }> = {
        burner: { w: 70, h: 110 },
        tripod: { w: 120, h: 140 },
        beaker: { w: 110, h: 130 },
        'wide-basin': { w: 200, h: 90 },
        flask: { w: 110, h: 140 },
        thermometer: { w: 24, h: 160 },
      };
      const def = defDims[type] || { w: 100, h: 120 };

      let targetX = clientX ?? 340;
      let targetY = clientY ?? 400;

      // Smart Lab Apparatus Auto-Alignment & Staggering:
      if (existingObjs.length > 0) {
        const burner = existingObjs.find((o) => o.type === 'burner');
        const tripod = existingObjs.find((o) => o.type === 'tripod');
        const containers = existingObjs.filter(
          (o) => o.type === 'beaker' || o.type === 'flask' || o.type === 'wide-basin'
        );
        const primaryContainer = containers[0];

        if (type === 'tripod' && burner && !tripod) {
          // Tripod centers over burner!
          targetX = burner.x + burner.width / 2;
          targetY = burner.y + burner.height - def.h / 2;
        } else if (type === 'burner' && tripod && !burner) {
          // Burner centers under tripod!
          targetX = tripod.x + tripod.width / 2;
          targetY = tripod.y + tripod.height - def.h / 2;
        } else if ((type === 'beaker' || type === 'flask') && tripod && containers.length === 0) {
          // Container sits on tripod wire gauze!
          targetX = tripod.x + tripod.width / 2;
          targetY = tripod.y - def.h / 2 + 10;
        } else if (type === 'thermometer' && primaryContainer) {
          // Thermometer dips into primary container!
          targetX = primaryContainer.x + primaryContainer.width - 30;
          targetY = primaryContainer.y + def.h / 2 - 40;
        } else {
          // Stagger horizontally to the right of all existing objects so they never pile up!
          const maxRight = Math.max(...existingObjs.map((o) => o.x + o.width));
          const lastObj = existingObjs[existingObjs.length - 1];
          targetX = maxRight + 28 + def.w / 2;
          targetY = (lastObj ? lastObj.y + lastObj.height : 460) - def.h / 2;
        }
      }

      handleAddObjectWithBounds(type, {
        minX: targetX - def.w / 2,
        minY: targetY - def.h / 2,
        maxX: targetX + def.w / 2,
        maxY: targetY + def.h / 2,
      });
    },
    [activeHeatSim, handleAddObjectWithBounds]
  );

  const startHeatingAndSim = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => {
      const cur = liveSimRef.current || prev;
      const next = {
        ...cur,
        isRunning: true,
      };
      liveSimRef.current = next;
      return next;
    });
  }, [updateActiveHeatSim]);

  const pauseHeatingAndSim = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => {
      const cur = liveSimRef.current || prev;
      const next = {
        ...cur,
        isRunning: false,
      };
      liveSimRef.current = next;
      return next;
    });
  }, [updateActiveHeatSim]);

  const toggleRun = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => {
      const cur = liveSimRef.current || prev;
      const willRun = !cur.isRunning;
      const next = {
        ...cur,
        isRunning: willRun,
      };
      liveSimRef.current = next;
      return next;
    });
  }, [updateActiveHeatSim]);

  const toggleBurner = useCallback((burnerId?: string) => {
    updateActiveHeatSim((prev: HeatSimConfig) => {
      const cur = liveSimRef.current || prev;
      const targetId =
        burnerId ||
        (cur.selectedObjectId && cur.objects.find((o) => o.id === cur.selectedObjectId && o.type === 'burner')?.id);
      const targetBurner = targetId
        ? cur.objects.find((o) => o.id === targetId)
        : cur.objects.find((o) => o.type === 'burner');

      // 4-step cycling: Off -> Low (Χαμηλή) -> Medium (Μεσαία) -> High (Υψηλή) -> Off
      const curState = targetBurner?.burnerState;
      let nextOn = true;
      let nextIntensity: FlameIntensity = 'medium';

      if (!curState || !curState.isOn) {
        // Off -> Low
        nextOn = true;
        nextIntensity = 'low';
      } else {
        const curInt = curState.intensity;
        if (curInt === 'low' || curInt === 'safety') {
          // Low -> Medium
          nextOn = true;
          nextIntensity = 'medium';
        } else if (curInt === 'medium' || curInt === 'normal') {
          // Medium -> High
          nextOn = true;
          nextIntensity = 'high';
        } else {
          // High -> Off
          nextOn = false;
          nextIntensity = 'off';
        }
      }

      const noticeUntil = Date.now() + 3000;

      const next = {
        ...cur,
        isRunning: cur.isRunning,
        objects: cur.objects.map((obj) => {
          if (obj.type === 'burner' && obj.burnerState && (!targetId || obj.id === targetId)) {
            return {
              ...obj,
              burnerState: {
                ...obj.burnerState,
                isOn: nextOn,
                intensity: nextIntensity,
                noticeUntil,
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

  const resetSim = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => {
      const next = {
        ...prev,
        elapsedSec: 0,
        isRunning: false,
        history: [],
        objects: prev.objects.map((obj: HeatObject) => {
          if (obj.type === 'burner' && obj.burnerState) {
            return {
              ...obj,
              burnerState: {
                ...obj.burnerState,
                isOn: false,
                flameCycle: 0,
                intensity: 'medium' as const,
                noticeUntil: undefined,
              },
            };
          }
          if (obj.containerState) {
            return {
              ...obj,
              containerState: {
                ...obj.containerState,
                temperature: obj.containerState.initialTemp || (prev.ambientTemperature ?? 20),
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
                temperature: prev.ambientTemperature ?? 20,
              },
            };
          }
          if (obj.tripodState) {
            return {
              ...obj,
              tripodState: {
                ...obj.tripodState,
                wireGauzeTemp: prev.ambientTemperature ?? 20,
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

  const handleSetAmbientTemperature = useCallback(
    (temp: number) => {
      const clamped = Math.max(0, Math.min(50, Math.round(temp / 5) * 5));
      updateActiveHeatSim((prev: HeatSimConfig) => {
        const cur = liveSimRef.current || prev;
        const next: HeatSimConfig = {
          ...cur,
          ambientTemperature: clamped,
          objects: cur.objects.map((obj) => {
            // Undipped thermometer in room air adjusts to room ambient immediately when paused
            if (obj.thermometerState && !obj.thermometerState.dippedVesselId && !cur.isRunning) {
              return {
                ...obj,
                thermometerState: {
                  ...obj.thermometerState,
                  temperature: clamped,
                },
              };
            }
            if (obj.tripodState && !cur.isRunning) {
              return {
                ...obj,
                tripodState: {
                  ...obj.tripodState,
                  wireGauzeTemp: clamped,
                },
              };
            }
            return obj;
          }),
        };
        liveSimRef.current = next;
        return next;
      });
    },
    [updateActiveHeatSim]
  );

  const toggleGraph = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => {
      const cur = liveSimRef.current || prev;
      const allGraphs = cur.graphs && cur.graphs.length > 0 ? [...cur.graphs] : [{ ...cur.graph }];
      const nextVisible = !cur.graph.visible;
      allGraphs[0].visible = nextVisible;
      const next = {
        ...cur,
        graph: {
          ...cur.graph,
          visible: nextVisible,
        },
        graphs: allGraphs,
      };
      liveSimRef.current = next;
      return next;
    });
  }, [updateActiveHeatSim]);

  const handleToggleContainerGraph = useCallback(
    (targetContainer: HeatObject) => {
      updateActiveHeatSim((prev: HeatSimConfig) => {
        const cur = liveSimRef.current || prev;
        const allGraphs = cur.graphs && cur.graphs.length > 0 ? [...cur.graphs] : [{ ...cur.graph }];
        const visibleGraphs = allGraphs.filter((g) => g.visible);

        // Check if container is already in an open graph
        const existingWithContainer = visibleGraphs.find((g) =>
          g.boundContainerIds?.includes(targetContainer.id)
        );

        if (existingWithContainer) {
          // Toggle off / remove from that graph
          const updatedBound = (existingWithContainer.boundContainerIds || []).filter(
            (id) => id !== targetContainer.id
          );
          if (updatedBound.length === 0) {
            existingWithContainer.visible = false;
          } else {
            existingWithContainer.boundContainerIds = updatedBound;
          }
          const next = {
            ...cur,
            graph: { ...allGraphs[0] },
            graphs: allGraphs,
          };
          liveSimRef.current = next;
          return next;
        }

        // Container is NOT in any open graph:
        // If there is already at least one visible graph, prompt user with modal
        if (visibleGraphs.length > 0) {
          setGraphChoicePrompt({
            isOpen: true,
            targetContainer,
            existingGraph: visibleGraphs[0],
          });
          return cur;
        }

        // No open graph: open primary graph and bind to targetContainer
        allGraphs[0].visible = true;
        allGraphs[0].boundContainerIds = [targetContainer.id];
        const next = {
          ...cur,
          graph: { ...allGraphs[0] },
          graphs: allGraphs,
        };
        liveSimRef.current = next;
        return next;
      });
    },
    [updateActiveHeatSim]
  );

  const handleGraphChoice = useCallback(
    (choice: 'existing' | 'new') => {
      if (!graphChoicePrompt?.targetContainer) {
        setGraphChoicePrompt(null);
        return;
      }
      const target = graphChoicePrompt.targetContainer;
      updateActiveHeatSim((prev: HeatSimConfig) => {
        const cur = liveSimRef.current || prev;
        const allGraphs = cur.graphs && cur.graphs.length > 0 ? [...cur.graphs] : [{ ...cur.graph }];
        const existing = allGraphs.find((g) => g.visible) || allGraphs[0];

        if (choice === 'existing') {
          const bound = existing.boundContainerIds || [];
          if (!bound.includes(target.id)) {
            existing.boundContainerIds = [...bound, target.id];
          }
          existing.visible = true;
        } else {
          // Create new graph window offset by 35px
          const newGraph: HeatGraphConfig = {
            id: `graph-${Date.now()}`,
            visible: true,
            x: Math.min(window.innerWidth - 380, existing.x + 35),
            y: Math.min(window.innerHeight - 260, existing.y + 35),
            width: existing.width || 340,
            height: existing.height || 220,
            customMoved: true,
            boundContainerIds: [target.id],
          };
          allGraphs.push(newGraph);
        }

        const next = {
          ...cur,
          graph: { ...allGraphs[0] },
          graphs: allGraphs,
        };
        liveSimRef.current = next;
        return next;
      });
      setGraphChoicePrompt(null);
    },
    [graphChoicePrompt, updateActiveHeatSim]
  );

  const cancelGraphChoice = useCallback(() => {
    setGraphChoicePrompt(null);
  }, []);

  const handleFillContainer = useCallback(
    (containerId?: string) => {
      updateActiveHeatSim((prev: HeatSimConfig) => {
        const cur = liveSimRef.current || prev;
        const targetContainer = containerId
          ? cur.objects.find((o) => o.id === containerId && o.containerState)
          : cur.objects.find((o) => o.id === cur.selectedObjectId && o.containerState) ||
            cur.objects.find((o) => o.containerState);

        if (!targetContainer || !targetContainer.containerState) return cur;

        const cap = targetContainer.containerState.capacityMl || 500;
        const curVol = targetContainer.containerState.volumeMl || 0;
        const nextVol = curVol === 0 ? Math.round(cap * 0.5) : curVol < cap ? cap : 0;

        triggerContainerFillFeedback(targetContainer.id, nextVol, cap);

        const next = {
          ...cur,
          objects: cur.objects.map((o) =>
            o.id === targetContainer.id && o.containerState
              ? {
                  ...o,
                  containerState: {
                    ...o.containerState,
                    volumeMl: nextVol,
                  },
                }
              : o
          ),
        };
        liveSimRef.current = next;
        return next;
      });
    },
    [updateActiveHeatSim]
  );

  const setSelectedObjectIds = useCallback(
    (ids: string[]) => {
      updateActiveHeatSim((prev: HeatSimConfig) => {
        const cur = liveSimRef.current || prev;
        const next = {
          ...cur,
          selectedObjectId: ids[0] || null,
          selectedObjectIds: ids,
        };
        liveSimRef.current = next;
        return next;
      });
    },
    [updateActiveHeatSim]
  );

  const handleDeleteSelectedObject = useCallback(
    (idOrIds?: string | string[]) => {
      updateActiveHeatSim((prev: HeatSimConfig) => {
        const cur = liveSimRef.current || prev;
        const targetIds = idOrIds
          ? Array.isArray(idOrIds)
            ? idOrIds
            : [idOrIds]
          : cur.selectedObjectIds && cur.selectedObjectIds.length > 0
          ? cur.selectedObjectIds
          : cur.selectedObjectId
          ? [cur.selectedObjectId]
          : [];
        if (targetIds.length === 0) return cur;
        const toDelete = new Set(targetIds);
        const next = {
          ...cur,
          selectedObjectId: null,
          selectedObjectIds: [],
          objects: cur.objects.filter((o) => !toDelete.has(o.id)),
        };
        liveSimRef.current = next;
        return next;
      });
    },
    [updateActiveHeatSim]
  );

  // Retrieves currently selected heat simulation objects (single or multiple)
  const getSelectedObjects = useCallback((): HeatObject[] => {
    const cur = liveSimRef.current || activeHeatSim;
    if (!cur) return [];
    const targetIds =
      cur.selectedObjectIds && cur.selectedObjectIds.length > 0
        ? cur.selectedObjectIds
        : cur.selectedObjectId
        ? [cur.selectedObjectId]
        : [];
    if (targetIds.length === 0) return [];
    const idSet = new Set(targetIds);
    return cur.objects.filter((o) => idSet.has(o.id));
  }, [activeHeatSim]);

  // Copy: returns a deep clone of the currently selected objects
  const handleCopy = useCallback((): HeatObject[] => {
    const selected = getSelectedObjects();
    return structuredClone(selected);
  }, [getSelectedObjects]);

  // Paste: duplicates provided objects into the heat simulation, offsetting or centering at targetPos
  const handlePasteObjects = useCallback(
    (objectsToPaste: HeatObject[], targetPos?: { x: number; y: number }): string[] => {
      if (!objectsToPaste || objectsToPaste.length === 0) return [];

      let createdIds: string[] = [];

      updateActiveHeatSim((prev: HeatSimConfig) => {
        const cur = liveSimRef.current || prev;

        // Compute offset
        let dx = 28;
        let dy = 28;

        if (targetPos) {
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;
          for (const o of objectsToPaste) {
            if (o.x < minX) minX = o.x;
            if (o.y < minY) minY = o.y;
            if (o.x + o.width > maxX) maxX = o.x + o.width;
            if (o.y + o.height > maxY) maxY = o.y + o.height;
          }
          if (Number.isFinite(minX) && Number.isFinite(minY)) {
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            dx = targetPos.x - cx;
            dy = targetPos.y - cy;
          }
        }

        // Mapping oldId -> newId for maintaining container links (e.g. water bath nested vessel)
        const idMap = new Map<string, string>();
        const now = Date.now();
        objectsToPaste.forEach((o, idx) => {
          const rand = Math.random().toString(36).slice(2, 6);
          idMap.set(o.id, `${o.type}-${now + idx}-${rand}`);
        });

        const newObjects: HeatObject[] = objectsToPaste.map((orig) => {
          const newId = idMap.get(orig.id) || `${orig.type}-${Date.now()}`;
          const cloned: HeatObject = {
            ...structuredClone(orig),
            id: newId,
            x: Math.round(orig.x + dx),
            y: Math.round(orig.y + dy),
          };

          // Container state
          if (cloned.containerState) {
            cloned.containerState = {
              ...cloned.containerState,
              isBoiling: false,
              boilingIntensity: 0,
              parentBasinId:
                orig.containerState?.parentBasinId && idMap.has(orig.containerState.parentBasinId)
                  ? idMap.get(orig.containerState.parentBasinId)
                  : undefined,
              nestedVesselId:
                orig.containerState?.nestedVesselId && idMap.has(orig.containerState.nestedVesselId)
                  ? idMap.get(orig.containerState.nestedVesselId)
                  : undefined,
            };
          }

          // Burner state: starts turned off
          if (cloned.burnerState) {
            cloned.burnerState = {
              ...cloned.burnerState,
              isOn: false,
            };
          }

          // Tripod state: gauze temp resets to 20°C
          if (cloned.tripodState) {
            cloned.tripodState = {
              ...cloned.tripodState,
              wireGauzeTemp: 20,
            };
          }

          // Thermometer state: emergent, ambient
          if (cloned.thermometerState) {
            cloned.thermometerState = {
              ...cloned.thermometerState,
              temperature: orig.thermometerState?.temperature ?? 20,
              dippedVesselId:
                orig.thermometerState?.dippedVesselId && idMap.has(orig.thermometerState.dippedVesselId)
                  ? idMap.get(orig.thermometerState.dippedVesselId)
                  : undefined,
              showBadge: orig.thermometerState?.showBadge ?? true,
            };
          }

          return cloned;
        });

        createdIds = newObjects.map((o) => o.id);

        const next: HeatSimConfig = {
          ...cur,
          selectedObjectId: createdIds[0] || null,
          selectedObjectIds: createdIds,
          objects: [...cur.objects, ...newObjects],
        };

        liveSimRef.current = next;
        return next;
      });

      return createdIds;
    },
    [updateActiveHeatSim]
  );

  // Instant Duplicate of selected heat objects (+28px, +28px)
  const handleDuplicateSelected = useCallback((): string[] => {
    const selected = getSelectedObjects();
    if (selected.length === 0) return [];
    return handlePasteObjects(selected);
  }, [getSelectedObjects, handlePasteObjects]);

  // Cut: copy selected objects then delete them from simulation
  const handleCut = useCallback((): HeatObject[] => {
    const selected = getSelectedObjects();
    if (selected.length === 0) return [];
    handleDeleteSelectedObject();
    return structuredClone(selected);
  }, [getSelectedObjects, handleDeleteSelectedObject]);

  // Z-Order: Send to Back, -1 Step Backward, +1 Step Forward, Bring to Front
  const handleZOrderSelected = useCallback(
    (action: 'to-back' | 'step-back' | 'step-front' | 'to-front'): boolean => {
      const sim = liveSimRef.current || activeHeatSim;
      if (!sim) return false;

      const selectedIds =
        sim.selectedObjectIds && sim.selectedObjectIds.length > 0
          ? sim.selectedObjectIds
          : sim.selectedObjectId
          ? [sim.selectedObjectId]
          : [];

      if (selectedIds.length === 0) return false;

      const objects = [...sim.objects];
      const selSet = new Set(selectedIds);

      if (action === 'to-back') {
        const selected = objects.filter((o) => selSet.has(o.id));
        const unselected = objects.filter((o) => !selSet.has(o.id));
        const nextObjects = [...selected, ...unselected];
        updateActiveHeatSim((prev) => {
          const next = { ...prev, objects: nextObjects };
          liveSimRef.current = next;
          return next;
        });
        return true;
      }

      if (action === 'to-front') {
        const unselected = objects.filter((o) => !selSet.has(o.id));
        const selected = objects.filter((o) => selSet.has(o.id));
        const nextObjects = [...unselected, ...selected];
        updateActiveHeatSim((prev) => {
          const next = { ...prev, objects: nextObjects };
          liveSimRef.current = next;
          return next;
        });
        return true;
      }

      if (action === 'step-back') {
        const nextObjects = [...objects];
        for (let i = 1; i < nextObjects.length; i++) {
          if (selSet.has(nextObjects[i].id) && !selSet.has(nextObjects[i - 1].id)) {
            const temp = nextObjects[i];
            nextObjects[i] = nextObjects[i - 1];
            nextObjects[i - 1] = temp;
          }
        }
        updateActiveHeatSim((prev) => {
          const next = { ...prev, objects: nextObjects };
          liveSimRef.current = next;
          return next;
        });
        return true;
      }

      if (action === 'step-front') {
        const nextObjects = [...objects];
        for (let i = nextObjects.length - 2; i >= 0; i--) {
          if (selSet.has(nextObjects[i].id) && !selSet.has(nextObjects[i + 1].id)) {
            const temp = nextObjects[i];
            nextObjects[i] = nextObjects[i + 1];
            nextObjects[i + 1] = temp;
          }
        }
        updateActiveHeatSim((prev) => {
          const next = { ...prev, objects: nextObjects };
          liveSimRef.current = next;
          return next;
        });
        return true;
      }

      return false;
    },
    [activeHeatSim, updateActiveHeatSim]
  );

  // Pointer interactions on canvas (handles, resizing, selection, actions, dragging)
  const handlePointerDown = useCallback(
    (_e: React.PointerEvent | PointerEvent, lx: number, ly: number, currentTool?: string): boolean => {
      const sim = liveSimRef.current || activeHeatSim;
      if (!sim) return false;

      // 0. Permanent Flame Toggle Button (bottom-right of burner cast-iron base)
      for (const obj of sim.objects) {
        if (obj.type === 'burner') {
          const { btnCenterX, btnCenterY } = getBurnerActionButtonWorldPos(obj);
          if (Math.hypot(lx - btnCenterX, ly - btnCenterY) <= 16) {
            setSelectedObjectIds([]);
            toggleBurner(obj.id);
            return true;
          }
        }
      }

      // 0b. Permanent Container Action Buttons (Droplet, Pencil & Graph at bottom-right of container glassware)
      // Clicking these action buttons directly toggles actions without lasso-selecting the container!
      for (const obj of sim.objects) {
        if (obj.type === 'beaker' || obj.type === 'wide-basin' || obj.type === 'flask') {
          const { dropletX, dropletY, pencilX, pencilY, graphX, graphY } =
            getContainerActionButtonsWorldPos(obj, sim.objects);
          const dDroplet = Math.hypot(lx - dropletX, ly - dropletY);
          const dPencil = Math.hypot(lx - pencilX, ly - pencilY);
          const dGraph = Math.hypot(lx - graphX, ly - graphY);

          if (dGraph <= 15 && dGraph <= dPencil && dGraph <= dDroplet) {
            setSelectedObjectIds([]);
            handleToggleContainerGraph(obj);
            return true;
          }

          if (dDroplet <= 15 && dDroplet <= dPencil) {
            setSelectedObjectIds([]);
            handleFillContainer(obj.id);
            return true;
          }

          if (dPencil <= 15) {
            setSelectedObjectIds([]);
            setEditingContainer(obj);
            return true;
          }
        }
      }

      // 1. Check Graph window hit (Close 'X' button, Resize handle, Header drag, Card click absorption)
      const allGraphs = sim.graphs && sim.graphs.length > 0 ? sim.graphs : [sim.graph];
      const visibleGraphs = allGraphs.filter((g) => g.visible);
      for (let i = visibleGraphs.length - 1; i >= 0; i--) {
        const g = visibleGraphs[i];

        // A. Close button '✕' (g.x + g.width - 18, g.y + 17, hit radius 12)
        const closeX = g.x + g.width - 18;
        const closeY = g.y + 17;
        if (Math.hypot(lx - closeX, ly - closeY) <= 12) {
          updateActiveHeatSim((prev: HeatSimConfig) => {
            const cur = liveSimRef.current || prev;
            const curAll = cur.graphs && cur.graphs.length > 0 ? [...cur.graphs] : [{ ...cur.graph }];
            const match = curAll.find((ag) => (ag.id && ag.id === g.id) || ag === g);
            if (match) {
              match.visible = false;
            } else if (curAll[0]) {
              curAll[0].visible = false;
            }
            const next = {
              ...cur,
              graph: { ...curAll[0] },
              graphs: curAll,
            };
            liveSimRef.current = next;
            return next;
          });
          return true;
        }

        // B. Resize handle at bottom-right
        if (
          lx >= g.x + g.width - 24 &&
          lx <= g.x + g.width + 4 &&
          ly >= g.y + g.height - 24 &&
          ly <= g.y + g.height + 4
        ) {
          dragRef.current = {
            objectId: g.id || 'graph',
            targetGraph: g,
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

        // C. Inside Graph Card: Header drag or card click absorption
        if (lx >= g.x && lx <= g.x + g.width && ly >= g.y && ly <= g.y + g.height) {
          if (ly <= g.y + 36) {
            dragRef.current = {
              objectId: g.id || 'graph',
              targetGraph: g,
              isGraph: true,
              startX: lx,
              startY: ly,
              origObjX: g.x,
              origObjY: g.y,
            };
          }
          // Return true so clicking inside the graph does NOT deselect objects or draw lines
          return true;
        }
      }

      // 2. Check if currently selected object's Handles / Action Pills were clicked!
      const selectedIds =
        sim.selectedObjectIds && sim.selectedObjectIds.length > 0
          ? sim.selectedObjectIds
          : sim.selectedObjectId
          ? [sim.selectedObjectId]
          : [];
      const selectedObjs = sim.objects.filter((o) => selectedIds.includes(o.id));

      // 2A. Multiple objects selected: Check Group Selection Handles, Trash Button, and Group Drag
      if (selectedObjs.length > 1) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const obj of selectedObjs) {
          minX = Math.min(minX, obj.x);
          minY = Math.min(minY, obj.y);
          maxX = Math.max(maxX, obj.x + obj.width);
          maxY = Math.max(maxY, obj.y + obj.height);
        }

        const pad = 10;
        const boxX = minX - pad;
        const boxY = minY - pad;
        const boxW = maxX - minX + pad * 2;
        const boxH = maxY - minY + pad * 2;
        const cx = boxX + boxW / 2;
        const pillY = boxY < 48 ? boxY + boxH + 24 : boxY - 24;

        // 4 Corner Handles (proportional scaling of all objects relative to opposite corner)
        const corners: { id: 'nw' | 'ne' | 'se' | 'sw'; x: number; y: number; ax: number; ay: number }[] = [
          { id: 'nw', x: boxX, y: boxY, ax: boxX + boxW, ay: boxY + boxH },
          { id: 'ne', x: boxX + boxW, y: boxY, ax: boxX, ay: boxY + boxH },
          { id: 'se', x: boxX + boxW, y: boxY + boxH, ax: boxX, ay: boxY },
          { id: 'sw', x: boxX, y: boxY + boxH, ax: boxX + boxW, ay: boxY },
        ];
        for (const c of corners) {
          if (Math.hypot(lx - c.x, ly - c.y) <= 14) {
            dragRef.current = {
              isGroup: true,
              mode: 'scale-corner',
              handle: c.id,
              startX: lx,
              startY: ly,
              anchorX: c.ax,
              anchorY: c.ay,
              origBounds: { minX: boxX, minY: boxY, maxX: boxX + boxW, maxY: boxY + boxH },
              origObjects: selectedObjs.map((o) => ({
                id: o.id,
                x: o.x,
                y: o.y,
                width: o.width,
                height: o.height,
              })),
            };
            return true;
          }
        }

        // 4 Side Midpoint Handles (aspect ratio stretch)
        const sides: { id: 'n' | 'e' | 's' | 'w'; x: number; y: number }[] = [
          { id: 'n', x: cx, y: boxY },
          { id: 'e', x: boxX + boxW, y: boxY + boxH / 2 },
          { id: 's', x: cx, y: boxY + boxH },
          { id: 'w', x: boxX, y: boxY + boxH / 2 },
        ];
        for (const s of sides) {
          if (Math.hypot(lx - s.x, ly - s.y) <= 14) {
            dragRef.current = {
              isGroup: true,
              mode: 'stretch-side',
              handle: s.id,
              startX: lx,
              startY: ly,
              anchorX: s.id === 'e' ? boxX : s.id === 'w' ? boxX + boxW : cx,
              anchorY: s.id === 's' ? boxY : s.id === 'n' ? boxY + boxH : boxY + boxH / 2,
              origBounds: { minX: boxX, minY: boxY, maxX: boxX + boxW, maxY: boxY + boxH },
              origObjects: selectedObjs.map((o) => ({
                id: o.id,
                x: o.x,
                y: o.y,
                width: o.width,
                height: o.height,
              })),
            };
            return true;
          }
        }

        // Check if clicked directly on an already-selected object
        const hitSelectedObj = selectedObjs.find((o) => isPointOnHeatObject(o, lx, ly));
        if (hitSelectedObj) {
          if (_e.shiftKey) {
            const nextIds = selectedIds.filter((id) => id !== hitSelectedObj.id);
            setSelectedObjectIds(nextIds);
            return true;
          }
          // Normal drag starts collective move
          dragRef.current = {
            isGroup: true,
            mode: 'move',
            startX: lx,
            startY: ly,
            origObjects: selectedObjs.map((o) => ({
              id: o.id,
              x: o.x,
              y: o.y,
              width: o.width,
              height: o.height,
            })),
          };
          return true;
        }

        // Check if clicked inside the group bounding box
        if (lx >= boxX && lx <= boxX + boxW && ly >= boxY && ly <= boxY + boxH) {
          const unselectedObj = sim.objects.find(
            (o) => !selectedIds.includes(o.id) && isPointOnHeatObject(o, lx, ly)
          );
          if (unselectedObj) {
            if (_e.shiftKey) {
              setSelectedObjectIds([...selectedIds, unselectedObj.id]);
              return true;
            }
            dragRef.current = {
              objectId: unselectedObj.id,
              mode: 'move',
              startX: lx,
              startY: ly,
              origObjX: unselectedObj.x,
              origObjY: unselectedObj.y,
              origW: unselectedObj.width,
              origH: unselectedObj.height,
              origRatio: unselectedObj.width / unselectedObj.height,
            };
            setSelectedObjectIds([unselectedObj.id]);
            return true;
          }

          // Otherwise dragging inside the group box moves the group!
          dragRef.current = {
            isGroup: true,
            mode: 'move',
            startX: lx,
            startY: ly,
            origObjects: selectedObjs.map((o) => ({
              id: o.id,
              x: o.x,
              y: o.y,
              width: o.width,
              height: o.height,
            })),
          };
          dragMotionHistoryRef.current = { time: performance.now(), x: lx };
          return true;
        }
      }

      // 2B. Single object selected: Check Single Object Handles & Action Pills
      else if (selectedObjs.length === 1) {
        const selectedObj = selectedObjs[0];
        const pad = 8;
        const minX = selectedObj.x - pad;
        const minY = selectedObj.y - pad;
        const maxX = selectedObj.x + selectedObj.width + pad;
        const maxY = selectedObj.y + selectedObj.height + pad;
        const cx = selectedObj.x + selectedObj.width / 2;
        const cy = selectedObj.y + selectedObj.height / 2;

        // C. 4 Corner Handles (proportional scaling)
        const corners: { id: 'nw' | 'ne' | 'se' | 'sw'; x: number; y: number }[] = [
          { id: 'nw', x: minX, y: minY },
          { id: 'ne', x: maxX, y: minY },
          { id: 'se', x: maxX, y: maxY },
          { id: 'sw', x: minX, y: maxY },
        ];
        for (const c of corners) {
          if (Math.hypot(lx - c.x, ly - c.y) <= 14) {
            dragRef.current = {
              objectId: selectedObj.id,
              mode: 'scale-corner',
              handle: c.id,
              startX: lx,
              startY: ly,
              origObjX: selectedObj.x,
              origObjY: selectedObj.y,
              origW: selectedObj.width,
              origH: selectedObj.height,
              origRatio: selectedObj.width / selectedObj.height,
            };
            return true;
          }
        }

        // D. 4 Side Midpoint Handles (aspect ratio / αναλογία stretch)
        const sides: { id: 'n' | 'e' | 's' | 'w'; x: number; y: number }[] = [
          { id: 'n', x: cx, y: minY },
          { id: 'e', x: maxX, y: cy },
          { id: 's', x: cx, y: maxY },
          { id: 'w', x: minX, y: cy },
        ];
        for (const s of sides) {
          if (Math.hypot(lx - s.x, ly - s.y) <= 14) {
            dragRef.current = {
              objectId: selectedObj.id,
              mode: 'stretch-side',
              handle: s.id,
              startX: lx,
              startY: ly,
              origObjX: selectedObj.x,
              origObjY: selectedObj.y,
              origW: selectedObj.width,
              origH: selectedObj.height,
              origRatio: selectedObj.width / selectedObj.height,
            };
            return true;
          }
        }
      }

      // 3. Check objects in reverse z-order (topmost first)
      const isDrawingTool =
        currentTool === 'pen' || currentTool === 'pencil' || currentTool === 'highlighter';

      if (!isDrawingTool) {
        const reversed = [...sim.objects].reverse();

        for (const obj of reversed) {
          const inside = isPointOnHeatObject(obj, lx, ly);

          if (!inside) continue;

          if (_e.shiftKey) {
            const nextIds = selectedIds.includes(obj.id)
              ? selectedIds.filter((id) => id !== obj.id)
              : [...selectedIds, obj.id];
            setSelectedObjectIds(nextIds);
            return true;
          }

          // Select and start dragging single object
          dragRef.current = {
            objectId: obj.id,
            mode: 'move',
            startX: lx,
            startY: ly,
            origObjX: obj.x,
            origObjY: obj.y,
            origW: obj.width,
            origH: obj.height,
            origRatio: obj.width / obj.height,
          };
          dragMotionHistoryRef.current = { time: performance.now(), x: lx };

          setSelectedObjectIds([obj.id]);
          return true;
        }
      }

      // 4. Clicked outside on empty canvas -> Deselect
      if (sim.selectedObjectId || (sim.selectedObjectIds && sim.selectedObjectIds.length > 0)) {
        setSelectedObjectIds([]);
      }

      return false;
    },
    [activeHeatSim, updateActiveHeatSim, handleDeleteSelectedObject, handleFillContainer, toggleBurner, setSelectedObjectIds]
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
          const nextW = Math.max(260, (drag.origGraphW || 340) + dx);
          const nextH = Math.max(160, (drag.origGraphH || 220) + dy);
          if (drag.targetGraph) {
            drag.targetGraph.width = nextW;
            drag.targetGraph.height = nextH;
            drag.targetGraph.customMoved = true;
          }
          if (liveSimRef.current) {
            if (drag.targetGraph && liveSimRef.current.graphs) {
              const match = liveSimRef.current.graphs.find(
                (g) => (g.id && g.id === drag.targetGraph?.id) || g === drag.targetGraph
              );
              if (match) {
                match.width = nextW;
                match.height = nextH;
                match.customMoved = true;
              }
            }
            liveSimRef.current.graph.width = nextW;
            liveSimRef.current.graph.height = nextH;
            liveSimRef.current.graph.customMoved = true;
          }
        } else {
          const nextX = (drag.origObjX ?? 0) + dx;
          const nextY = (drag.origObjY ?? 0) + dy;
          if (drag.targetGraph) {
            drag.targetGraph.x = nextX;
            drag.targetGraph.y = nextY;
            drag.targetGraph.customMoved = true;
          }
          if (liveSimRef.current) {
            if (drag.targetGraph && liveSimRef.current.graphs) {
              const match = liveSimRef.current.graphs.find(
                (g) => (g.id && g.id === drag.targetGraph?.id) || g === drag.targetGraph
              );
              if (match) {
                match.x = nextX;
                match.y = nextY;
                match.customMoved = true;
              }
            }
            liveSimRef.current.graph.x = nextX;
            liveSimRef.current.graph.y = nextY;
            liveSimRef.current.graph.customMoved = true;
          }
        }
        return true;
      }

      // Group manipulation (Move, Proportional Scale, Aspect Ratio Stretch)
      if (liveSimRef.current && drag.isGroup && drag.origObjects) {
        if (drag.mode === 'move') {
          const now = performance.now();
          const prev = dragMotionHistoryRef.current;
          let calculatedVx = 0;
          if (prev) {
            const dt = Math.max(0.005, (now - prev.time) / 1000);
            calculatedVx = (lx - prev.x) / dt;
          }
          dragMotionHistoryRef.current = { time: now, x: lx };

          for (const item of drag.origObjects) {
            const obj = liveSimRef.current.objects.find((o) => o.id === item.id);
            if (obj) {
              obj.x = item.x + dx;
              obj.y = item.y + dy;
              if (obj.containerState && calculatedVx !== 0) {
                notifyContainerSloshMotion(obj.id, calculatedVx);
              }
            }
          }
          return true;
        }

        if (
          drag.mode === 'scale-corner' &&
          drag.origBounds &&
          drag.anchorX !== undefined &&
          drag.anchorY !== undefined
        ) {
          const origW = drag.origBounds.maxX - drag.origBounds.minX;
          let currW = origW;
          if (drag.handle === 'se' || drag.handle === 'ne') {
            currW = origW + dx;
          } else {
            currW = origW - dx;
          }
          const scale = Math.max(0.2, Math.min(5.0, currW / origW));

          for (const item of drag.origObjects) {
            const obj = liveSimRef.current.objects.find((o) => o.id === item.id);
            if (obj) {
              obj.x = Math.round(drag.anchorX + (item.x - drag.anchorX) * scale);
              obj.y = Math.round(drag.anchorY + (item.y - drag.anchorY) * scale);
              obj.width = Math.max(20, Math.round(item.width * scale));
              obj.height = Math.max(20, Math.round(item.height * scale));
            }
          }
          return true;
        }

        if (
          drag.mode === 'stretch-side' &&
          drag.origBounds &&
          drag.anchorX !== undefined &&
          drag.anchorY !== undefined
        ) {
          const origW = drag.origBounds.maxX - drag.origBounds.minX;
          const origH = drag.origBounds.maxY - drag.origBounds.minY;

          if (drag.handle === 'e') {
            const scaleX = Math.max(0.2, Math.min(5.0, (origW + dx) / origW));
            for (const item of drag.origObjects) {
              const obj = liveSimRef.current.objects.find((o) => o.id === item.id);
              if (obj) {
                obj.x = Math.round(drag.anchorX + (item.x - drag.anchorX) * scaleX);
                obj.width = Math.max(20, Math.round(item.width * scaleX));
              }
            }
          } else if (drag.handle === 'w') {
            const scaleX = Math.max(0.2, Math.min(5.0, (origW - dx) / origW));
            for (const item of drag.origObjects) {
              const obj = liveSimRef.current.objects.find((o) => o.id === item.id);
              if (obj) {
                obj.x = Math.round(drag.anchorX - (drag.anchorX - item.x) * scaleX);
                obj.width = Math.max(20, Math.round(item.width * scaleX));
              }
            }
          } else if (drag.handle === 's') {
            const scaleY = Math.max(0.2, Math.min(5.0, (origH + dy) / origH));
            for (const item of drag.origObjects) {
              const obj = liveSimRef.current.objects.find((o) => o.id === item.id);
              if (obj) {
                obj.y = Math.round(drag.anchorY + (item.y - drag.anchorY) * scaleY);
                obj.height = Math.max(20, Math.round(item.height * scaleY));
              }
            }
          } else if (drag.handle === 'n') {
            const scaleY = Math.max(0.2, Math.min(5.0, (origH - dy) / origH));
            for (const item of drag.origObjects) {
              const obj = liveSimRef.current.objects.find((o) => o.id === item.id);
              if (obj) {
                obj.y = Math.round(drag.anchorY - (drag.anchorY - item.y) * scaleY);
                obj.height = Math.max(20, Math.round(item.height * scaleY));
              }
            }
          }
          return true;
        }
      }

      // Live object manipulation (Move, Proportional Scale, Aspect Ratio Stretch)
      if (liveSimRef.current) {
        const obj = liveSimRef.current.objects.find((o) => o.id === drag.objectId);
        if (obj) {
          if (drag.mode === 'scale-corner') {
            const ratio = drag.origRatio || (drag.origW! / drag.origH!) || 1;
            if (drag.handle === 'se') {
              const newW = Math.max(50, (drag.origW || 100) + dx);
              const newH = Math.round(newW / ratio);
              obj.width = newW;
              obj.height = newH;
            } else if (drag.handle === 'ne') {
              const newW = Math.max(50, (drag.origW || 100) + dx);
              const newH = Math.round(newW / ratio);
              obj.y = (drag.origObjY ?? 0) + ((drag.origH || 100) - newH);
              obj.width = newW;
              obj.height = newH;
            } else if (drag.handle === 'sw') {
              const newW = Math.max(50, (drag.origW || 100) - dx);
              const newH = Math.round(newW / ratio);
              obj.x = (drag.origObjX ?? 0) + ((drag.origW || 100) - newW);
              obj.width = newW;
              obj.height = newH;
            } else if (drag.handle === 'nw') {
              const newW = Math.max(50, (drag.origW || 100) - dx);
              const newH = Math.round(newW / ratio);
              obj.x = (drag.origObjX ?? 0) + ((drag.origW || 100) - newW);
              obj.y = (drag.origObjY ?? 0) + ((drag.origH || 100) - newH);
              obj.width = newW;
              obj.height = newH;
            }
          } else if (drag.mode === 'stretch-side') {
            if (drag.handle === 'e') {
              obj.width = Math.max(40, (drag.origW || 100) + dx);
            } else if (drag.handle === 's') {
              obj.height = Math.max(40, (drag.origH || 100) + dy);
            } else if (drag.handle === 'w') {
              const newW = Math.max(40, (drag.origW || 100) - dx);
              obj.x = (drag.origObjX ?? 0) + ((drag.origW || 100) - newW);
              obj.width = newW;
            } else if (drag.handle === 'n') {
              const newH = Math.max(40, (drag.origH || 100) - dy);
              obj.y = (drag.origObjY ?? 0) + ((drag.origH || 100) - newH);
              obj.height = newH;
            }
          } else {
            // mode === 'move'
            let nextX = (drag.origObjX ?? 0) + dx;
            let nextY = (drag.origObjY ?? 0) + dy;

            // Magnetic snap / pull to base (tripod / wire gauze or water bath):
            if (obj.type === 'beaker' || obj.type === 'flask' || obj.type === 'wide-basin') {
              const tripods = liveSimRef.current.objects.filter((o) => o.type === 'tripod' && o.id !== obj.id);
              for (const tripod of tripods) {
                const { dockX, dockY } = getTripodContainerDockPos(tripod, obj);
                if (Math.abs(nextX - dockX) <= 52 && Math.abs(nextY - dockY) <= 44) {
                  nextX = dockX;
                  nextY = dockY;
                  break;
                }
              }

              if (obj.type !== 'wide-basin') {
                const basins = liveSimRef.current.objects.filter((o) => o.type === 'wide-basin' && o.id !== obj.id);
                for (const basin of basins) {
                  const { dockX, dockY } = getWaterBathNestedDockPos(basin, obj);
                  if (Math.abs(nextX - dockX) <= 46 && Math.abs(nextY - dockY) <= 38) {
                    nextX = dockX;
                    nextY = dockY;
                    break;
                  }
                }
              }
            } else if (obj.type === 'tripod') {
              // 1. Dragging tripod near a sitting container snaps tripod under the container
              const containers = liveSimRef.current.objects.filter(
                (o) => (o.type === 'beaker' || o.type === 'flask' || o.type === 'wide-basin') && o.id !== obj.id
              );
              for (const c of containers) {
                const { dockX: cDockX, dockY: cDockY } = getTripodContainerDockPos(obj, c);
                const diffX = c.x - cDockX;
                const diffY = c.y - cDockY;
                const targetTripodX = obj.x + diffX;
                const targetTripodY = obj.y + diffY;
                if (Math.abs(nextX - targetTripodX) <= 52 && Math.abs(nextY - targetTripodY) <= 44) {
                  nextX = targetTripodX;
                  nextY = targetTripodY;
                  break;
                }
              }

              // 2. Dragging tripod near a sitting burner snaps tripod centered over the burner
              const burners = liveSimRef.current.objects.filter((o) => o.type === 'burner' && o.id !== obj.id);
              for (const b of burners) {
                const { dockX: bDockX, dockY: bDockY } = getTripodBurnerDockPos(obj, b);
                const diffX = b.x - bDockX;
                const diffY = b.y - bDockY;
                const targetTripodX = obj.x + diffX;
                const targetTripodY = obj.y + diffY;
                if (Math.abs(nextX - targetTripodX) <= 52 && Math.abs(nextY - targetTripodY) <= 44) {
                  nextX = targetTripodX;
                  nextY = targetTripodY;
                  break;
                }
              }
            } else if (obj.type === 'burner') {
              // Dragging burner near tripod snaps burner centered underneath tripod
              const tripods = liveSimRef.current.objects.filter((o) => o.type === 'tripod' && o.id !== obj.id);
              for (const tripod of tripods) {
                const { dockX, dockY } = getTripodBurnerDockPos(tripod, obj);
                if (Math.abs(nextX - dockX) <= 52 && Math.abs(nextY - dockY) <= 44) {
                  nextX = dockX;
                  nextY = dockY;
                  break;
                }
              }
            }

            obj.x = nextX;
            obj.y = nextY;

            if (obj.containerState) {
              const now = performance.now();
              const prev = dragMotionHistoryRef.current;
              if (prev) {
                const dt = Math.max(0.005, (now - prev.time) / 1000);
                const vx = (lx - prev.x) / dt;
                notifyContainerSloshMotion(obj.id, vx);
              }
              dragMotionHistoryRef.current = { time: now, x: lx };
            }
          }
        }
      }
      return true;
    },
    [activeHeatSim]
  );

  const handlePointerUp = useCallback((): boolean => {
    if (!dragRef.current) return false;
    const drag = dragRef.current;
    dragRef.current = null;
    dragMotionHistoryRef.current = null;

    if (liveSimRef.current && drag.mode === 'move' && drag.objectId) {
      const obj = liveSimRef.current.objects.find((o) => o.id === drag.objectId);
      if (obj) {
        if (obj.type === 'beaker' || obj.type === 'flask' || obj.type === 'wide-basin') {
          const tripods = liveSimRef.current.objects.filter((o) => o.type === 'tripod' && o.id !== obj.id);
          for (const tripod of tripods) {
            const { dockX, dockY } = getTripodContainerDockPos(tripod, obj);
            if (Math.abs(obj.x - dockX) <= 56 && Math.abs(obj.y - dockY) <= 48) {
              obj.x = dockX;
              obj.y = dockY;
              break;
            }
          }
          if (obj.type !== 'wide-basin') {
            const basins = liveSimRef.current.objects.filter((o) => o.type === 'wide-basin' && o.id !== obj.id);
            for (const basin of basins) {
              const { dockX, dockY } = getWaterBathNestedDockPos(basin, obj);
              if (Math.abs(obj.x - dockX) <= 50 && Math.abs(obj.y - dockY) <= 42) {
                obj.x = dockX;
                obj.y = dockY;
                break;
              }
            }
          }
        } else if (obj.type === 'tripod') {
          // Check sitting containers
          const containers = liveSimRef.current.objects.filter(
            (o) => (o.type === 'beaker' || o.type === 'flask' || o.type === 'wide-basin') && o.id !== obj.id
          );
          for (const c of containers) {
            const { dockX: cDockX, dockY: cDockY } = getTripodContainerDockPos(obj, c);
            const diffX = c.x - cDockX;
            const diffY = c.y - cDockY;
            const targetTripodX = obj.x + diffX;
            const targetTripodY = obj.y + diffY;
            if (Math.abs(obj.x - targetTripodX) <= 56 && Math.abs(obj.y - targetTripodY) <= 48) {
              obj.x = targetTripodX;
              obj.y = targetTripodY;
              break;
            }
          }
          // Check sitting burners underneath
          const burners = liveSimRef.current.objects.filter((o) => o.type === 'burner' && o.id !== obj.id);
          for (const b of burners) {
            const { dockX: bDockX, dockY: bDockY } = getTripodBurnerDockPos(obj, b);
            const diffX = b.x - bDockX;
            const diffY = b.y - bDockY;
            const targetTripodX = obj.x + diffX;
            const targetTripodY = obj.y + diffY;
            if (Math.abs(obj.x - targetTripodX) <= 56 && Math.abs(obj.y - targetTripodY) <= 48) {
              obj.x = targetTripodX;
              obj.y = targetTripodY;
              break;
            }
          }
        } else if (obj.type === 'burner') {
          const tripods = liveSimRef.current.objects.filter((o) => o.type === 'tripod' && o.id !== obj.id);
          for (const tripod of tripods) {
            const { dockX, dockY } = getTripodBurnerDockPos(tripod, obj);
            if (Math.abs(obj.x - dockX) <= 56 && Math.abs(obj.y - dockY) <= 48) {
              obj.x = dockX;
              obj.y = dockY;
              break;
            }
          }
        }
      }
    }

    // Persist final position and dimensions to note page
    if (liveSimRef.current) {
      updateActiveHeatSim(() => liveSimRef.current!);
    }
    return true;
  }, [updateActiveHeatSim]);

  const isDragging = useCallback((): boolean => {
    return dragRef.current !== null;
  }, []);

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

  // Advances physics frame at 60fps in memory, throttling page state sync & localStorage backup
  const stepPhysicsFrame = useCallback(
    (dt: number) => {
      const cur = liveSimRef.current || activeHeatSim;
      if (!cur) return;
      const next = stepHeatSimulation(cur, dt);
      liveSimRef.current = next;

      // Throttle persistent sync to activePage & localStorage backup (every 800ms)
      const now = performance.now();
      if (now - lastStateSyncTimeRef.current > 800) {
        lastStateSyncTimeRef.current = now;
        persistHeatSimLive(next);
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
    isDragging,
    handleConvertLassoSketch,
    stepPhysicsFrame,
    toggleRun,
    startHeatingAndSim,
    pauseHeatingAndSim,
    toggleBurner,
    resetSim,
    setAmbientTemperature: handleSetAmbientTemperature,
    toggleGraph,
    handleFillContainer,
    handleDeleteSelectedObject,
    setSelectedObjectIds,
    graphChoicePrompt,
    handleGraphChoice,
    cancelGraphChoice,
    handleToggleContainerGraph,
    handleHover,
    clearHover,
    getHoverPoint,
    getSelectedObjects,
    handleCopy,
    handlePasteObjects,
    handleDuplicateSelected,
    handleCut,
    handleZOrderSelected,
  };
}