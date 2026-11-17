/**
 * Physics Engine for Thermodynamics & Heat Simulation (BestNotes / ExplainBoards).
 * Accurate implementation of Q = m·c·ΔT, Newton's law of cooling,
 * phase change plateaus, and dual-vessel thermal equilibrium.
 */

import {
  HeatBurnerState,
  HeatContainerState,
  HeatObject,
  HeatSimConfig,
  LIQUID_REGISTRY,
} from './types';

export const ROOM_TEMPERATURE_C = 20.0;
// Calibrated to 6.35 W/°C for borosilicate glass wall conduction so thermal equilibrium
// between nested vessels stabilizes over ~10–12 minutes, matching the Greek school textbook!
const WATER_BATH_HEAT_TRANSFER_COEFF = 6.35; // W / °C effective contact conduction between nested vessels

/**
 * Finds the outer vessel (water bath / larger beaker / basin) in which `inner` is physically nested.
 * Works for any combination of containers (e.g., beaker inside wide-basin, beaker inside wider beaker,
 * flask inside beaker or wide-basin).
 */
export function findParentVessel(
  inner: HeatObject,
  allObjects?: HeatObject[]
): HeatObject | undefined {
  if (!allObjects) return undefined;
  if (inner.type !== 'beaker' && inner.type !== 'flask' && inner.type !== 'wide-basin') {
    return undefined;
  }

  const candidates = allObjects.filter((outer) => {
    if (outer.id === inner.id) return false;
    if (outer.type !== 'wide-basin' && outer.type !== 'beaker' && outer.type !== 'flask') {
      return false;
    }
    // Outer container must be wider than inner container (or wide-basin with equal width)
    const isWider =
      outer.width > inner.width + 2 ||
      (outer.type === 'wide-basin' && inner.type !== 'wide-basin' && outer.width >= inner.width);
    if (!isWider) return false;

    const isInsideX = inner.x >= outer.x - 25 && inner.x + inner.width <= outer.x + outer.width + 25;
    const cx = inner.x + inner.width / 2;
    const isCenterInsideX = cx >= outer.x + 4 && cx <= outer.x + outer.width - 4;
    const isInsideY =
      inner.y + inner.height >= outer.y + 12 &&
      inner.y + inner.height <= outer.y + outer.height + 30 &&
      inner.y <= outer.y + outer.height;

    return isInsideX && isCenterInsideX && isInsideY;
  });

  if (candidates.length === 0) return undefined;
  // Pick the closest enclosing vessel (narrowest outer width)
  candidates.sort((a, b) => a.width - b.width);
  return candidates[0];
}

/**
 * Computes the world-space Y coordinate of the liquid surface inside a container.
 */
export function getContainerLiquidTopWorldY(c: HeatObject): number {
  const cs = c.containerState;
  if (!cs || cs.volumeMl <= 0) return c.y + c.height;
  const fillRatio = Math.max(0, Math.min(1.0, cs.volumeMl / cs.capacityMl));
  const cPad = 8;
  const cBh = c.height - cPad * 2 - 6;
  const isBasin = c.type === 'wide-basin';
  const cHeadspace = isBasin ? (0.15 * cBh + 8.5) * 0.40 : (0.14 * cBh + 8.6) * 0.40;
  const cLiquidH = Math.max(0, (cBh - cHeadspace) * fillRatio);
  return c.y + cPad + 4 + cBh - cLiquidH;
}

/**
 * Finds which container a thermometer is dipped into.
 * Crucially prioritizes INNER nested vessels (narrower width / nested inside a bath) over outer vessels,
 * so lowering a thermometer deeper inside an inner container Γ never falsely switches to measuring the outer container Β!
 */
export function findDippedVesselForThermometer(
  therm: HeatObject,
  allObjects: HeatObject[],
  requireBulbInLiquid: boolean = true
): HeatObject | undefined {
  const bulbX = therm.x + therm.width / 2;
  const bulbY = therm.y + therm.height - 4; // Bottom tip of bulb

  const matching = allObjects.filter((c) => {
    if (c.type !== 'beaker' && c.type !== 'flask' && c.type !== 'wide-basin') return false;
    if (requireBulbInLiquid && (!c.containerState || c.containerState.volumeMl <= 0)) return false;

    const isHorizInside = bulbX >= c.x + 4 && bulbX <= c.x + c.width - 4;
    if (!isHorizInside) return false;

    if (requireBulbInLiquid) {
      const liquidTopY = getContainerLiquidTopWorldY(c);
      const liquidBottomY = c.y + c.height;
      return bulbY >= liquidTopY - 4 && bulbY <= liquidBottomY + 10 && therm.y <= liquidBottomY;
    } else {
      return bulbY >= c.y + 10 && bulbY <= c.y + c.height + 12 && therm.y <= c.y + c.height;
    }
  });

  if (matching.length === 0) return undefined;

  // Prioritize inner nested vessels first, then smallest width
  matching.sort((a, b) => {
    const aIsInner = Boolean(a.containerState?.parentBasinId || findParentVessel(a, allObjects));
    const bIsInner = Boolean(b.containerState?.parentBasinId || findParentVessel(b, allObjects));
    if (aIsInner !== bIsInner) return aIsInner ? -1 : 1;
    return a.width - b.width;
  });

  return matching[0];
}

/**
 * Returns power output in Watts for a burner state.
 * Calibrated for 500ml water (C = 2092 J/°C):
 * - Low (Χαμηλή, 470W): reaches 100°C in ~7 min
 * - Medium (Μεσαία, 770W): reaches 100°C in ~4 min
 * - High (Υψηλή, 1470W): reaches 100°C in ~2 min
 */
export function getBurnerPowerWatts(burner?: HeatBurnerState): number {
  if (!burner || !burner.isOn) return 0;
  switch (burner.intensity) {
    case 'low':
    case 'safety':
      return 470;
    case 'medium':
    case 'normal':
      return 770;
    case 'high':
    case 'roaring':
      return 1470;
    default:
      return 770;
  }
}

/**
 * Calculates theoretical equilibrium temperature for two liquids in contact:
 * T_eq = (m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)
 */
export function calculateEquilibriumTemperature(
  vessel1: HeatContainerState,
  vessel2: HeatContainerState
): number {
  const p1 = LIQUID_REGISTRY[vessel1.liquidType];
  const p2 = LIQUID_REGISTRY[vessel2.liquidType];

  const m1 = vessel1.volumeMl * p1.density; // grams
  const m2 = vessel2.volumeMl * p2.density; // grams

  const c1 = p1.specificHeat; // J/(g·°C)
  const c2 = p2.specificHeat;

  const cap1 = Math.max(0.1, m1 * c1);
  const cap2 = Math.max(0.1, m2 * c2);

  return (cap1 * vessel1.temperature + cap2 * vessel2.temperature) / (cap1 + cap2);
}

/**
 * Advances physics of all heat objects by dt (seconds).
 */
export function stepHeatSimulation(sim: HeatSimConfig, dt: number): HeatSimConfig {
  if (dt <= 0) return sim;

  const ambientTemp = sim.ambientTemperature ?? ROOM_TEMPERATURE_C;
  const timeStep = Math.min(0.1, Math.max(0.001, dt));
  const objects = sim.objects.map((obj) => ({ ...obj }));

  // Index objects for fast spatial / relational lookups
  const tripods = objects.filter((o) => o.type === 'tripod');
  const burners = objects.filter((o) => o.type === 'burner');
  const containers = objects.filter(
    (o) => o.type === 'beaker' || o.type === 'wide-basin' || o.type === 'flask'
  );
  const thermometers = objects.filter((o) => o.type === 'thermometer');

  // Pre-detect nested container pairs (e.g., vessel Γ placed inside wider vessel Β)
  // so both thermal conduction and ambient shielding know which vessels are nested!
  for (const c of containers) {
    if (c.containerState) {
      c.containerState = {
        ...c.containerState,
        parentBasinId: undefined,
        nestedVesselId: undefined,
      };
    }
  }

  const nestedPairs: { outer: HeatObject; inner: HeatObject }[] = [];
  for (const inner of containers) {
    if (!inner.containerState) continue;
    const outer = findParentVessel(inner, containers);
    if (outer && outer.containerState) {
      inner.containerState.parentBasinId = outer.id;
      outer.containerState.nestedVesselId = inner.id;
      nestedPairs.push({ outer, inner });
    }
  }

  // Strictly gate ALL thermal interactions (burner heating, tripod gauze heating/cooling,
  // container-to-environment cooling/heating, and nested container-to-container heat transfer)
  // behind `sim.isRunning` (i.e. only when the Heat Stopwatch is active and running)!
  if (sim.isRunning) {
    // 1. Update Tripod wire gauze temperatures & burner snap states
    for (const tripod of tripods) {
      if (!tripod.tripodState) continue;
      let targetGauzeTemp = ambientTemp;

      // Check if any active burner is positioned directly under the tripod base
      const burnerUnderneath = burners.find((b) => {
        if (!b.burnerState?.isOn) return false;
        const dx = Math.abs(b.x + b.width / 2 - (tripod.x + tripod.width / 2));
        const isHoriz = dx <= 35;
        // Burner top is under tripod wire gauze (including the lower locked position)
        const isUnderGauze = b.y >= tripod.y - 10 && b.y <= tripod.y + 85;
        return isHoriz && isUnderGauze;
      });

      if (burnerUnderneath && burnerUnderneath.burnerState) {
        const pWatts = getBurnerPowerWatts(burnerUnderneath.burnerState);
        targetGauzeTemp = ambientTemp + (pWatts / 1470) * 580; // Up to ~600°C
      }

      const currentGauze = tripod.tripodState.wireGauzeTemp ?? ambientTemp;
      const gauzeAlpha = 1.0 - Math.exp(-timeStep * 1.8);
      tripod.tripodState = {
        ...tripod.tripodState,
        wireGauzeTemp: currentGauze + (targetGauzeTemp - currentGauze) * gauzeAlpha,
      };
    }

    // 2. Identify heat sources for each container
    for (const container of containers) {
      if (!container.containerState) continue;
      const cs = { ...container.containerState };
      const liquidProps = LIQUID_REGISTRY[cs.liquidType];

      let receivedPowerWatts = 0;

      // A. Check if resting on a tripod (with heated wire gauze)
      const tripodBelow = tripods.find((t) => {
        const dx = Math.abs(container.x + container.width / 2 - (t.x + t.width / 2));
        const cBot = container.y + container.height;
        const isHorizAligned = dx <= 35;
        // Container base rests directly on or very close to the wire gauze ring
        const isVertOnGauze = cBot >= t.y && cBot <= t.y + 42;
        return isHorizAligned && isVertOnGauze;
      });

      let burnerUnderTripod: HeatObject | undefined;
      if (tripodBelow) {
        burnerUnderTripod = burners.find((b) => {
          if (!b.burnerState?.isOn) return false;
          const dx = Math.abs(b.x + b.width / 2 - (tripodBelow.x + tripodBelow.width / 2));
          const isHoriz = dx <= 35;
          const isUnderGauze = b.y >= tripodBelow.y - 10 && b.y <= tripodBelow.y + 85;
          return isHoriz && isUnderGauze;
        });
      }

      if (burnerUnderTripod?.burnerState) {
        // Direct heat transfer from active burner through the tripod wire gauze
        receivedPowerWatts = Math.max(receivedPowerWatts, getBurnerPowerWatts(burnerUnderTripod.burnerState));
      } else if (tripodBelow?.tripodState && tripodBelow.tripodState.wireGauzeTemp > ambientTemp) {
        // Residual cooling heat transfer from the hot wire gauze after burner was turned off
        const deltaTGauze = tripodBelow.tripodState.wireGauzeTemp - cs.temperature;
        if (deltaTGauze > 0) {
          receivedPowerWatts = Math.max(receivedPowerWatts, deltaTGauze * 2.0);
        }
      }

      // B. Direct flame check (burner positioned directly below container, touching flame)
      const directBurner = burners.find((b) => {
        if (!b.burnerState?.isOn) return false;
        const dx = Math.abs(container.x + container.width / 2 - (b.x + b.width / 2));
        const cBot = container.y + container.height;
        const isHoriz = dx <= 32;
        // Burner nozzle / flame physically reaches container base
        const isVert = b.y >= cBot - 25 && b.y <= cBot + 40;
        return isHoriz && isVert;
      });

      if (directBurner?.burnerState) {
        receivedPowerWatts = Math.max(receivedPowerWatts, getBurnerPowerWatts(directBurner.burnerState));
      }

      // Apply Q = P·dt => ΔT = dQ / (m·c)
      const massGrams = Math.max(10, cs.volumeMl * liquidProps.density);
      const heatCapJoulesPerC = massGrams * liquidProps.specificHeat;

      if (receivedPowerWatts > 0) {
        // Actively being heated by burner / flame!
        const dQ = receivedPowerWatts * timeStep;
        const heatDT = dQ / heatCapJoulesPerC;

        // Gentle ambient convective loss:
        const ambientLossDT = Math.max(0, (cs.temperature - ambientTemp) * 0.00025 * timeStep);
        // Flame power strictly guarantees continuous upward heating (at least 75% of power)
        const netDT = Math.max(heatDT * 0.75, heatDT - ambientLossDT);

        if (cs.temperature < liquidProps.boilingPoint) {
          cs.temperature = Math.min(liquidProps.boilingPoint, cs.temperature + netDT);
        }
      } else if (cs.volumeMl > 0) {
        // No active heating: Natural cooling towards room ambient temperature (Newton's Law of Cooling),
        // properly scaled by thermal capacity (m · c) so quantity and material affect cooling rate!
        const coolDelta = cs.temperature - ambientTemp;
        if (Math.abs(coolDelta) > 0.005) {
          const baseEnvWattsPerDeg = 1.78 * Math.pow(Math.max(50, cs.volumeMl) / 500, 0.45);
          // When nested in a water bath, the inner vessel is shielded by the outer liquid,
          // and the ambient environment plays a subtle secondary role over the ~12-minute equilibration.
          const envShieldFactor = cs.parentBasinId ? 0.03 : cs.nestedVesselId ? 0.05 : 1.0;
          const dQEnv = envShieldFactor * baseEnvWattsPerDeg * coolDelta * timeStep;
          cs.temperature -= dQEnv / heatCapJoulesPerC;
        }
      }

      // Boiling plateau check (only if container has liquid!)
      if (cs.volumeMl > 0 && cs.temperature >= liquidProps.boilingPoint - 1.5) {
        if (cs.temperature > liquidProps.boilingPoint) {
          cs.temperature = liquidProps.boilingPoint;
        }
        cs.isBoiling = true;
        cs.boilingIntensity = receivedPowerWatts > 0
          ? Math.min(1.0, Math.max(0.65, receivedPowerWatts / 500))
          : 0.65;
      } else if (cs.volumeMl > 0 && cs.temperature >= liquidProps.boilingPoint * 0.88) {
        // Simmering / near boil active bubbles
        cs.isBoiling = true;
        cs.boilingIntensity = Math.max(
          0.3,
          ((cs.temperature - liquidProps.boilingPoint * 0.88) / (liquidProps.boilingPoint * 0.12)) * 0.6
        );
      } else {
        cs.isBoiling = false;
        cs.boilingIntensity = 0;
      }

      container.containerState = cs;
    }

    // 3. Thermal Interaction & Calorimetric Equilibrium between ANY nested vessels (e.g., Γ inside Β)
    for (const { outer, inner } of nestedPairs) {
      if (!outer.containerState || !inner.containerState) continue;
      const bs = outer.containerState;
      const is = inner.containerState;

      if (bs.volumeMl <= 0 || is.volumeMl <= 0) continue;

      // Conduction between outer vessel liquid and inner vessel liquid: Q = m · c · ΔT
      const pOuter = LIQUID_REGISTRY[bs.liquidType];
      const pInner = LIQUID_REGISTRY[is.liquidType];

      const mOuter = bs.volumeMl * pOuter.density;
      const mInner = is.volumeMl * pInner.density;

      const cOuter = pOuter.specificHeat;
      const cInner = pInner.specificHeat;

      const capOuter = Math.max(1, mOuter * cOuter);
      const capInner = Math.max(1, mInner * cInner);

      // Contact area scales gently with the wetted liquid level of the submerged vessel
      const wettedScale = Math.pow(Math.max(80, Math.min(bs.volumeMl, is.volumeMl)) / 500, 0.55);
      const chainBoost = nestedPairs.length >= 2 ? 1.35 : 1.0;
      const effectiveK = WATER_BATH_HEAT_TRANSFER_COEFF * wettedScale * chainBoost;

      const instEq = (capOuter * bs.temperature + capInner * is.temperature) / (capOuter + capInner);
      const tempDiff = bs.temperature - is.temperature; // Outer - Inner
      const rawDQ = effectiveK * tempDiff * timeStep; // Joules
      // Clamp so vessels converge smoothly to instEq without overshooting in a single step
      const maxDQ = Math.abs(bs.temperature - instEq) * capOuter;
      const dQ = Math.sign(rawDQ) * Math.min(Math.abs(rawDQ), maxDQ);

      bs.temperature -= dQ / capOuter;
      is.temperature += dQ / capInner;

      // Clamp to boiling if reached
      if (bs.temperature > pOuter.boilingPoint) bs.temperature = pOuter.boilingPoint;
      if (is.temperature > pInner.boilingPoint) is.temperature = pInner.boilingPoint;
    }
  }

  // 4. Update Thermometer readings (smooth probe response, prioritizing inner nested vessels)
  for (const therm of thermometers) {
    if (!therm.thermometerState) continue;
    const ts = { ...therm.thermometerState };

    const vesselDipped = findDippedVesselForThermometer(therm, containers, true);

    let targetTemp = ambientTemp;
    if (vesselDipped?.containerState) {
      targetTemp = vesselDipped.containerState.temperature;
      ts.dippedVesselId = vesselDipped.id;
    } else {
      ts.dippedVesselId = undefined;
    }

    // Smooth response curve for realistic mercury/alcohol movement
    const alpha = 1.0 - Math.exp(-timeStep * (vesselDipped ? 3.5 : 0.8));
    ts.temperature += (targetTemp - ts.temperature) * alpha;

    therm.thermometerState = ts;
  }

  // 5. Burner flame animation phase
  for (const burner of burners) {
    if (burner.burnerState?.isOn) {
      burner.burnerState.flameCycle = ((burner.burnerState.flameCycle || 0) + timeStep * 8) % 1;
    }
  }

  // 6. Record history for real-time dynamic graph
  // Only measure elapsed time and record graph points when the stopwatch / simulation is started!
  // "όμως σε διάγραμμα μετρά μόνο με έναρξη από το χρονόμετρο"
  if (sim.isRunning) {
    const nextElapsed = sim.elapsedSec + timeStep;
    let nextHistory = sim.history ? [...sim.history] : [];

    if (containers.length > 0) {
      // Record temperatures of ALL containers by ID
      const tempsMap: Record<string, number> = {};
      for (const c of containers) {
        if (c.containerState) {
          tempsMap[c.id] = Math.round(c.containerState.temperature * 10) / 10;
        }
      }

      // Prefer a container that is part of an active nested water-bath pair so tempEquilibrium is recorded accurately
      const nestedVesselInGraph =
        (sim.graph.boundContainerIds &&
          containers.find(
            (c) =>
              sim.graph.boundContainerIds!.includes(c.id) &&
              (c.containerState?.parentBasinId || c.containerState?.nestedVesselId)
          )) ||
        containers.find((c) => c.containerState?.parentBasinId || c.containerState?.nestedVesselId);

      const primaryVessel =
        nestedVesselInGraph ||
        (sim.graph.boundContainerIds && containers.find((c) => c.id === sim.graph.boundContainerIds![0])) ||
        containers.find((c) => c.id === sim.selectedObjectId) ||
        containers.find((c) => c.type === 'beaker' || c.type === 'flask') ||
        containers[0];

      if (primaryVessel?.containerState) {
        const temp1 = primaryVessel.containerState.temperature;
        let temp2: number | undefined;
        let tempEquilibrium: number | undefined;

        // If in a water bath, record both curves!
        if (primaryVessel.containerState.parentBasinId) {
          const basin = containers.find((c) => c.id === primaryVessel.containerState?.parentBasinId);
          if (basin?.containerState) {
            temp2 = basin.containerState.temperature;
            tempEquilibrium = calculateEquilibriumTemperature(
              primaryVessel.containerState,
              basin.containerState
            );
          }
        } else if (primaryVessel.containerState.nestedVesselId) {
          const nested = containers.find((c) => c.id === primaryVessel.containerState?.nestedVesselId);
          if (nested?.containerState) {
            temp2 = nested.containerState.temperature;
            tempEquilibrium = calculateEquilibriumTemperature(
              primaryVessel.containerState,
              nested.containerState
            );
          }
        } else {
          // Single vessel interacting with the ambient environment
          tempEquilibrium = ambientTemp;
        }

        // If history is empty at the start of stopwatch run, insert the t = 0 starting point!
        if (nextHistory.length === 0) {
          nextHistory.push({
            timeSec: 0,
            temp1: Math.round(temp1 * 10) / 10,
            temp2: temp2 !== undefined ? Math.round(temp2 * 10) / 10 : undefined,
            tempsByContainerId: { ...tempsMap },
            tempEquilibrium:
              tempEquilibrium !== undefined ? Math.round(tempEquilibrium * 10) / 10 : undefined,
          });
        }

        // Sample every 0.25s to record smooth, high-fidelity temperature curves
        const lastPoint = nextHistory[nextHistory.length - 1];
        if (!lastPoint || nextElapsed - lastPoint.timeSec >= 0.25) {
          const point = {
            timeSec: Math.round(nextElapsed * 10) / 10,
            temp1: Math.round(temp1 * 10) / 10,
            temp2: temp2 !== undefined ? Math.round(temp2 * 10) / 10 : undefined,
            tempsByContainerId: tempsMap,
            tempEquilibrium:
              tempEquilibrium !== undefined ? Math.round(tempEquilibrium * 10) / 10 : undefined,
          };
          nextHistory.push(point);

          // Bound memory gracefully while strictly PRESERVING complete history from t = 0 onwards!
          // Never slice off the beginning of the experiment: if history exceeds 8,000 points
          // (~33 minutes of continuous 0.25s samples), decimate by keeping every 2nd point,
          // strictly maintaining the t = 0 origin point and the latest point.
          if (nextHistory.length > 8000) {
            const first = nextHistory[0];
            const downsampled = nextHistory.filter((_, idx) => idx % 2 === 0);
            if (downsampled.length === 0 || downsampled[0].timeSec !== first.timeSec) {
              downsampled.unshift(first);
            }
            nextHistory = downsampled;
          }
        }
      }
    }

    return {
      ...sim,
      elapsedSec: nextElapsed,
      objects,
      history: nextHistory,
    };
  }

  // When stopwatch / sim timer is NOT running:
  // Live physics (temperature changes, flame, thermometer) update in real-time on canvas,
  // but graph time (elapsedSec) and history remain paused waiting for stopwatch start!
  return {
    ...sim,
    objects,
  };
}
