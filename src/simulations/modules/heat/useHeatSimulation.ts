import { useState, useRef, useCallback } from 'react';
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
  editingContainer: HeatObject | null;
  setEditingContainer: (c: HeatObject | null) => void;
  ensureActiveHeatSim: (page: NotePage) => HeatSimConfig;
  updateActiveHeatSim: (updater: (prev: HeatSimConfig) => HeatSimConfig) => void;
  handleAddObject: (type: HeatObjectType, clientX?: number, clientY?: number) => void;
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
        if (!activeId) return page;

        const nextSims = curSims.map((s: HeatSimConfig) => (s.id === activeId ? updater(s) : s));
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
        return found;
      }
      const newSim = createDefaultHeatSim(280, 360);
      updatePage((p: NotePage) => ({
        ...p,
        heatSims: [newSim],
        activeHeatSimId: newSim.id,
      }));
      return newSim;
    },
    [updatePage]
  );

  const handleAddObject = useCallback(
    (type: HeatObjectType, clientX?: number, clientY?: number) => {
      const targetX = clientX ?? 320;
      const targetY = clientY ?? 380;

      const newObj = createHeatObjectFromRecognition(
        type,
        {
          minX: targetX - 50,
          minY: targetY - 60,
          maxX: targetX + 50,
          maxY: targetY + 60,
        },
        `-${Date.now()}`
      );

      updateActiveHeatSim((prev: HeatSimConfig) => ({
        ...prev,
        objects: [...prev.objects, newObj],
        selectedObjectId: newObj.id,
      }));
    },
    [updateActiveHeatSim]
  );

  const toggleRun = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  }, [updateActiveHeatSim]);

  const resetSim = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => ({
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
    }));
  }, [updateActiveHeatSim]);

  const toggleGraph = useCallback(() => {
    updateActiveHeatSim((prev: HeatSimConfig) => ({
      ...prev,
      graph: {
        ...prev.graph,
        visible: !prev.graph.visible,
      },
    }));
  }, [updateActiveHeatSim]);

  // Pointer interactions on canvas (clicking pencil, toggling burner, dragging objects)
  const handlePointerDown = useCallback(
    (_e: React.PointerEvent | PointerEvent, lx: number, ly: number): boolean => {
      if (!activeHeatSim) return false;

      // 1. Check Graph window hit
      if (activeHeatSim.graph.visible) {
        const g = activeHeatSim.graph;
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
      const reversed = [...activeHeatSim.objects].reverse();

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
            updateActiveHeatSim((prev: HeatSimConfig) => ({
              ...prev,
              objects: prev.objects.map((o: HeatObject) =>
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
            }));
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

        updateActiveHeatSim((prev: HeatSimConfig) => ({
          ...prev,
          selectedObjectId: obj.id,
        }));
        return true;
      }

      return false;
    },
    [activeHeatSim, updateActiveHeatSim]
  );

  const handlePointerMove = useCallback(
    (lx: number, ly: number): boolean => {
      const drag = dragRef.current;
      if (!drag || !activeHeatSim) return false;

      const dx = lx - drag.startX;
      const dy = ly - drag.startY;

      if (drag.isGraph) {
        if (drag.isGraphResize) {
          const nextW = Math.max(220, (drag.origGraphW || 290) + dx);
          const nextH = Math.max(160, (drag.origGraphH || 200) + dy);
          updateActiveHeatSim((prev: HeatSimConfig) => ({
            ...prev,
            graph: {
              ...prev.graph,
              width: nextW,
              height: nextH,
              customMoved: true,
            },
          }));
        } else {
          updateActiveHeatSim((prev: HeatSimConfig) => ({
            ...prev,
            graph: {
              ...prev.graph,
              x: drag.origObjX + dx,
              y: drag.origObjY + dy,
              customMoved: true,
            },
          }));
        }
        return true;
      }

      // Dragging a laboratory object
      let nextX = drag.origObjX + dx;
      let nextY = drag.origObjY + dy;

      // Smart Snapping Logic:
      const movingObj = activeHeatSim.objects.find((o: HeatObject) => o.id === drag.objectId);
      if (movingObj) {
        // A. Burner snapping under Tripod
        if (movingObj.type === 'burner') {
          const tripod = activeHeatSim.objects.find((o: HeatObject) => o.type === 'tripod');
          if (tripod) {
            const targetX = tripod.x + tripod.width / 2 - movingObj.width / 2;
            const targetY = tripod.y + tripod.height - movingObj.height * 0.45;
            if (Math.hypot(nextX - targetX, nextY - targetY) < 36) {
              nextX = targetX;
              nextY = targetY;
            }
          }
        }

        // B. Beaker / Flask snapping on top of Tripod
        if (movingObj.type === 'beaker' || movingObj.type === 'flask') {
          const tripod = activeHeatSim.objects.find((o: HeatObject) => o.type === 'tripod');
          if (tripod) {
            const targetX = tripod.x + tripod.width / 2 - movingObj.width / 2;
            const targetY = tripod.y - movingObj.height + 6;
            if (Math.hypot(nextX - targetX, nextY - targetY) < 38) {
              nextX = targetX;
              nextY = targetY;
            }
          }

          // C. Beaker / Flask snapping inside Wide Basin (Water Bath / Υδατόλουτρο)
          const basin = activeHeatSim.objects.find((o: HeatObject) => o.type === 'wide-basin');
          if (basin && basin.id !== movingObj.id) {
            const targetX = basin.x + basin.width / 2 - movingObj.width / 2;
            const targetY = basin.y + basin.height - movingObj.height - 4;
            if (Math.hypot(nextX - targetX, nextY - targetY) < 42) {
              nextX = targetX;
              nextY = targetY;
            }
          }
        }

        // D. Thermometer dipping inside any Container
        if (movingObj.type === 'thermometer') {
          const container = activeHeatSim.objects.find(
            (o: HeatObject) => o.type === 'beaker' || o.type === 'flask' || o.type === 'wide-basin'
          );
          if (container) {
            const targetX = container.x + container.width * 0.45;
            const targetY = container.y + container.height * 0.2;
            if (Math.hypot(nextX - targetX, nextY - targetY) < 45) {
              nextX = targetX;
              nextY = targetY;
            }
          }
        }
      }

      updateActiveHeatSim((prev: HeatSimConfig) => ({
        ...prev,
        objects: prev.objects.map((o: HeatObject) =>
          o.id === drag.objectId ? { ...o, x: nextX, y: nextY } : o
        ),
      }));

      return true;
    },
    [activeHeatSim, updateActiveHeatSim]
  );

  const handlePointerUp = useCallback((): boolean => {
    if (dragRef.current) {
      dragRef.current = null;
      return true;
    }
    return false;
  }, []);

  // Converts hand-drawn strokes to heat lab object
  const handleConvertLassoSketch = useCallback(
    (selectedStrokeIds: string[], strokes: StrokeObject[]): boolean => {
      const selectedStrokes = strokes.filter((s: StrokeObject) => selectedStrokeIds.includes(s.id));
      if (selectedStrokes.length === 0) return false;

      const recognition = recognizeHeatSketch(selectedStrokes);
      if (!recognition) return false;

      const newObj = createHeatObjectFromRecognition(
        recognition.type,
        recognition.bounds,
        `-${Date.now()}`
      );

      // Add to active heat sim (or create one if none exists)
      updatePage((page: NotePage) => {
        const curSims = page.heatSims || [];
        const activeId = page.activeHeatSimId || curSims[0]?.id;

        if (activeId && curSims.length > 0) {
          return {
            ...page,
            // Remove the hand-drawn strokes from the page
            strokes: page.strokes.filter((s: StrokeObject) => !selectedStrokeIds.includes(s.id)),
            heatSims: curSims.map((s: HeatSimConfig) =>
              s.id === activeId
                ? {
                    ...s,
                    objects: [...s.objects, newObj],
                    selectedObjectId: newObj.id,
                  }
                : s
            ),
          };
        } else {
          const freshSim = createDefaultHeatSim(
            recognition.bounds.minX - 40,
            recognition.bounds.minY - 20
          );
          freshSim.objects = [newObj];
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

  // Advances physics frame
  const stepPhysicsFrame = useCallback(
    (dt: number) => {
      if (!activeHeatSim || !activeHeatSim.isRunning) return;
      updateActiveHeatSim((prev: HeatSimConfig) => stepHeatSimulation(prev, dt));
    },
    [activeHeatSim, updateActiveHeatSim]
  );

  return {
    activeHeatSim,
    editingContainer,
    setEditingContainer,
    ensureActiveHeatSim,
    updateActiveHeatSim,
    handleAddObject,
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
