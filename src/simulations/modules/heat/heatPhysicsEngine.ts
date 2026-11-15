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
const AMBIENT_COOLING_COEFF = 0.004; // Gentle cooling to room temp
const WATER_BATH_HEAT_TRANSFER_COEFF = 18.0; // W / °C effective contact transfer

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

  // 1. Update Tripod wire gauze temperatures & burner snap states
  for (const tripod of tripods) {
    if (!tripod.tripodState) continue;
    let targetGauzeTemp = ambientTemp;

    // Check if any active burner is positioned directly under or within the tripod base
    const burnerUnderneath = burners.find((b) => {
      if (!b.burnerState?.isOn) return false;
      const dx = Math.abs(b.x + b.width / 2 - (tripod.x + tripod.width / 2));
      const isHoriz = dx < Math.max(70, tripod.width * 0.65);
      // Burner top is within/under tripod wire gauze
      const isUnderGauze =
        b.y <= tripod.y + tripod.height + 70 && b.y + b.height >= tripod.y + 10;
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
      const isHorizAligned = dx < Math.max(75, (t.width + container.width) * 0.48);
      // Container base rests near or on wire gauze
      const isVertOnGauze = cBot >= t.y - 25 && cBot <= t.y + Math.max(75, t.height * 0.65);
      return isHorizAligned && isVertOnGauze;
    });

    let burnerUnderTripod: HeatObject | undefined;
    if (tripodBelow) {
      burnerUnderTripod = burners.find((b) => {
        if (!b.burnerState?.isOn) return false;
        const dx = Math.abs(b.x + b.width / 2 - (tripodBelow.x + tripodBelow.width / 2));
        const isHoriz = dx < Math.max(70, tripodBelow.width * 0.65);
        const isUnderGauze =
          b.y <= tripodBelow.y + tripodBelow.height + 70 && b.y + b.height >= tripodBelow.y + 10;
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

    // B. Direct flame check (burner positioned directly below container, with or without tripod)
    const directBurner = burners.find((b) => {
      if (!b.burnerState?.isOn) return false;
      const dx = Math.abs(container.x + container.width / 2 - (b.x + b.width / 2));
      const cBot = container.y + container.height;
      const isHoriz = dx < Math.max(75, (container.width + b.width) * 0.48);
      // Burner nozzle / flame reaches container base
      const isVert = b.y >= cBot - 70 && b.y <= cBot + 170;
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
      // Per thermodynamic & educational requirements:
      // As long as a burner is active under the vessel (even on low), the liquid must
      // steadily heat up until it reaches its boiling point without flatlining.
      const dQ = receivedPowerWatts * timeStep;
      const heatDT = dQ / heatCapJoulesPerC;

      // Gentle ambient convective loss:
      const ambientLossDT = Math.max(0, (cs.temperature - ambientTemp) * 0.00025 * timeStep);
      // Flame power strictly guarantees continuous upward heating (at least 75% of power)
      const netDT = Math.max(heatDT * 0.75, heatDT - ambientLossDT);

      if (cs.temperature < liquidProps.boilingPoint) {
        cs.temperature = Math.min(liquidProps.boilingPoint, cs.temperature + netDT);
      }
    } else {
      // No active heating: Natural cooling towards room ambient temperature (Newton's Law of Cooling)
      const coolDelta = cs.temperature - ambientTemp;
      if (Math.abs(coolDelta) > 0.005) {
        cs.temperature -= coolDelta * 0.0012 * timeStep;
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

  // 3. Thermal Equilibrium between nested vessels (Water Bath / Υδατόλουτρο)
  const basins = containers.filter((c) => c.type === 'wide-basin');
  for (const basin of basins) {
    if (!basin.containerState) continue;
    const bs = basin.containerState;

    // Find any beaker or flask physically resting inside this basin
    const innerVessels = containers.filter((c) => {
      if (c.id === basin.id) return false;
      const cx = c.x + c.width / 2;
      const cy = c.y + c.height;
      return (
        cx >= basin.x + 8 &&
        cx <= basin.x + basin.width - 8 &&
        cy >= basin.y + 10 &&
        cy <= basin.y + basin.height + 20
      );
    });

    for (const inner of innerVessels) {
      if (!inner.containerState) continue;
      const is = inner.containerState;

      // Link IDs
      bs.nestedVesselId = inner.id;
      is.parentBasinId = basin.id;

      // Conduction between outer basin liquid and inner vessel liquid
      const pOuter = LIQUID_REGISTRY[bs.liquidType];
      const pInner = LIQUID_REGISTRY[is.liquidType];

      const mOuter = bs.volumeMl * pOuter.density;
      const mInner = is.volumeMl * pInner.density;

      const cOuter = pOuter.specificHeat;
      const cInner = pInner.specificHeat;

      const capOuter = Math.max(1, mOuter * cOuter);
      const capInner = Math.max(1, mInner * cInner);

      const tempDiff = bs.temperature - is.temperature; // Outer - Inner
      const dQ = WATER_BATH_HEAT_TRANSFER_COEFF * tempDiff * timeStep; // Joules

      bs.temperature -= dQ / capOuter;
      is.temperature += dQ / capInner;

      // Clamp to boiling if reached
      if (bs.temperature > pOuter.boilingPoint) bs.temperature = pOuter.boilingPoint;
      if (is.temperature > pInner.boilingPoint) is.temperature = pInner.boilingPoint;
    }
  }

  // 4. Update Thermometer readings (smooth probe response)
  for (const therm of thermometers) {
    if (!therm.thermometerState) continue;
    const ts = { ...therm.thermometerState };

    // Check if thermometer bulb is dipping into any container with liquid
    const bulbX = therm.x + therm.width / 2;
    const bulbY = therm.y + therm.height - 4; // Bottom tip

    const vesselDipped = containers.find((c) => {
      if (!c.containerState || c.containerState.volumeMl <= 0) return false;
      const liquidLevelFraction = Math.min(
        0.96,
        Math.max(0.08, c.containerState.volumeMl / c.containerState.capacityMl)
      );
      const liquidTopY = c.y + c.height * (1.0 - liquidLevelFraction * 0.94);
      const liquidBottomY = c.y + c.height;

      return (
        bulbX >= c.x + 4 &&
        bulbX <= c.x + c.width - 4 &&
        bulbY >= liquidTopY &&
        bulbY <= liquidBottomY + 8
      );
    });

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

      const primaryVessel =
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
