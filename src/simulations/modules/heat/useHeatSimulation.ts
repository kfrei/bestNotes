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
  toggleGraph: () => void;
  handleFillContainer: (containerId?: string) => void;
  handleDeleteSelectedObject: (idOrIds?: string | string[]) => void;
  setSelectedObjectIds: (ids: string[]) => void;
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
        liveSimRef.current.selectedObjectIds = activeHeatSim.selectedObjectIds;
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
        objects: cur.objects.map((obj) => {
          if (obj.type === 'burner' && obj.burnerState) {
            return {
              ...obj,
              burnerState: {
                ...obj.burnerState,
                isOn: true,
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
        objects: cur.objects.map((obj) => {
          if (obj.type === 'burner' && obj.burnerState) {
            // When starting simulation, auto-ignite burner if off so heating begins
            if (willRun && !obj.burnerState.isOn) {
              return {
                ...obj,
                burnerState: {
                  ...obj.burnerState,
                  isOn: true,
                },
              };
            }
          }
          return obj;
        }),
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
      const nextOn = !targetBurner?.burnerState?.isOn;
      const next = {
        ...cur,
        isRunning: nextOn ? true : cur.isRunning,
        objects: cur.objects.map((obj) => {
          if (obj.type === 'burner' && obj.burnerState && (!targetId || obj.id === targetId)) {
            return {
              ...obj,
              burnerState: {
                ...obj.burnerState,
                isOn: nextOn,
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
              },
            };
          }
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

  // Pointer interactions on canvas (handles, resizing, selection, actions, dragging)
  const handlePointerDown = useCallback(
    (_e: React.PointerEvent | PointerEvent, lx: number, ly: number, currentTool?: string): boolean => {
      const sim = liveSimRef.current || activeHeatSim;
      if (!sim) return false;

      // 0. Permanent Flame Toggle Button (bottom-right of burner cast-iron base, matching media_1794729887270_8981dcf2.png)
      for (const obj of sim.objects) {
        if (obj.type === 'burner') {
          const cx = obj.x + obj.width / 2;
          const baseW = obj.width * 0.67;
          const baseRightX = cx + baseW / 2;
          const groundY = obj.y + obj.height - 12;
          const cyBot = groundY - 5.2;
          const btnCenterX = baseRightX + 4;
          const btnCenterY = cyBot - 6;
          if (Math.hypot(lx - btnCenterX, ly - btnCenterY) <= 20) {
            toggleBurner(obj.id);
            return true;
          }
        }
      }

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
        const hitSelectedObj = selectedObjs.find(
          (o) =>
            lx >= o.x - 4 &&
            lx <= o.x + o.width + 4 &&
            ly >= o.y - 4 &&
            ly <= o.y + o.height + 4
        );
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
            (o) =>
              !selectedIds.includes(o.id) &&
              lx >= o.x - 4 &&
              lx <= o.x + o.width + 4 &&
              ly >= o.y - 4 &&
              ly <= o.y + o.height + 4
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
        const pillY = maxY + 24;

        const hasContainer =
          selectedObj.type === 'beaker' || selectedObj.type === 'wide-basin' || selectedObj.type === 'flask';

        // Floating Action Bar Pills
        if (hasContainer) {
          // Fill button [ 💧 Γέμισμα ] / [ 💧 250ml ]
          const fillX = cx - 14;
          if (
            (Math.abs(lx - fillX) <= 44 || Math.abs(lx - (cx - 24)) <= 40) &&
            Math.abs(ly - pillY) <= 22
          ) {
            handleFillContainer(selectedObj.id);
            return true;
          }
          // Edit pencil [ ✎ ]
          const editX = cx + 32;
          if (
            Math.hypot(lx - editX, ly - pillY) <= 24 ||
            Math.hypot(lx - (cx + 18), ly - pillY) <= 20
          ) {
            setEditingContainer(selectedObj);
            return true;
          }
        }

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
          // Direct tap on container action pills even before selecting
          const hasCont = obj.type === 'beaker' || obj.type === 'wide-basin' || obj.type === 'flask';
          const pY = obj.y + obj.height + 32;
          const cX = obj.x + obj.width / 2;
          if (hasCont && Math.abs(ly - pY) <= 22) {
            if (Math.abs(lx - (cX - 14)) <= 44 || Math.abs(lx - (cX - 24)) <= 40) {
              setSelectedObjectIds([obj.id]);
              handleFillContainer(obj.id);
              return true;
            }
            if (Math.hypot(lx - (cX + 32), ly - pY) <= 24 || Math.hypot(lx - (cX + 18), ly - pY) <= 20) {
              setSelectedObjectIds([obj.id]);
              setEditingContainer(obj);
              return true;
            }
          }

          const inside =
            lx >= obj.x - 4 &&
            lx <= obj.x + obj.width + 4 &&
            ly >= obj.y - 4 &&
            ly <= obj.y + obj.height + 4;

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
          const nextW = Math.max(220, (drag.origGraphW || 290) + dx);
          const nextH = Math.max(160, (drag.origGraphH || 200) + dy);
          if (liveSimRef.current) {
            liveSimRef.current.graph.width = nextW;
            liveSimRef.current.graph.height = nextH;
            liveSimRef.current.graph.customMoved = true;
          }
        } else {
          if (liveSimRef.current) {
            liveSimRef.current.graph.x = (drag.origObjX ?? 0) + dx;
            liveSimRef.current.graph.y = (drag.origObjY ?? 0) + dy;
            liveSimRef.current.graph.customMoved = true;
          }
        }
        return true;
      }

      // Group manipulation (Move, Proportional Scale, Aspect Ratio Stretch)
      if (liveSimRef.current && drag.isGroup && drag.origObjects) {
        if (drag.mode === 'move') {
          for (const item of drag.origObjects) {
            const obj = liveSimRef.current.objects.find((o) => o.id === item.id);
            if (obj) {
              obj.x = item.x + dx;
              obj.y = item.y + dy;
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
            obj.x = (drag.origObjX ?? 0) + dx;
            obj.y = (drag.origObjY ?? 0) + dy;
          }
        }
      }
      return true;
    },
    [activeHeatSim]
  );

  const handlePointerUp = useCallback((): boolean => {
    if (!dragRef.current) return false;
    dragRef.current = null;
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
    isDragging,
    handleConvertLassoSketch,
    stepPhysicsFrame,
    toggleRun,
    startHeatingAndSim,
    pauseHeatingAndSim,
    toggleBurner,
    resetSim,
    toggleGraph,
    handleFillContainer,
    handleDeleteSelectedObject,
    setSelectedObjectIds,
  };
}