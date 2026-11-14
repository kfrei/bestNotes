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
 */
export function getBurnerPowerWatts(burner?: HeatBurnerState): number {
  if (!burner || !burner.isOn) return 0;
  switch (burner.intensity) {
    case 'safety':
      return 320;
    case 'normal':
      return 680;
    case 'roaring':
      return 1150;
    default:
      return 680;
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
  if (!sim.isRunning && dt <= 0) return sim;

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
    let targetGauzeTemp = ROOM_TEMPERATURE_C;

    // Check if any active burner is positioned directly under the tripod
    const burnerUnderneath = burners.find((b) => {
      if (!b.burnerState?.isOn) return false;
      const dx = Math.abs(b.x + b.width / 2 - (tripod.x + tripod.width / 2));
      const dy = b.y - (tripod.y + tripod.height);
      return dx < 36 && dy >= -45 && dy < 40;
    });

    if (burnerUnderneath && burnerUnderneath.burnerState) {
      const pWatts = getBurnerPowerWatts(burnerUnderneath.burnerState);
      targetGauzeTemp = ROOM_TEMPERATURE_C + (pWatts / 1150) * 480; // Up to ~500°C
    }

    const currentGauze = tripod.tripodState.wireGauzeTemp ?? ROOM_TEMPERATURE_C;
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

    // A. Check if resting on a heated tripod
    const tripodBelow = tripods.find((t) => {
      const dx = Math.abs(container.x + container.width / 2 - (t.x + t.width / 2));
      const dy = Math.abs(container.y + container.height - t.y);
      return dx < 45 && dy < 28;
    });

    if (tripodBelow?.tripodState && tripodBelow.tripodState.wireGauzeTemp > ROOM_TEMPERATURE_C) {
      // Heat transfer from wire gauze
      const deltaTGauze = tripodBelow.tripodState.wireGauzeTemp - cs.temperature;
      if (deltaTGauze > 0) {
        receivedPowerWatts += deltaTGauze * 1.85; // Watts
      }
    } else {
      // B. Direct flame if burner is directly below container (without tripod)
      const directBurner = burners.find((b) => {
        if (!b.burnerState?.isOn) return false;
        const dx = Math.abs(container.x + container.width / 2 - (b.x + b.width / 2));
        const dy = b.y - (container.y + container.height);
        return dx < 40 && dy >= -25 && dy < 45;
      });
      if (directBurner && directBurner.burnerState) {
        receivedPowerWatts += getBurnerPowerWatts(directBurner.burnerState) * 0.7;
      }
    }

    // Apply Q = P·dt => ΔT = dQ / (m·c)
    const massGrams = Math.max(10, cs.volumeMl * liquidProps.density);
    const heatCapJoulesPerC = massGrams * liquidProps.specificHeat;

    if (receivedPowerWatts > 0) {
      const dQ = receivedPowerWatts * timeStep;
      cs.temperature += dQ / heatCapJoulesPerC;
    }

    // Ambient cooling to room temperature
    const coolDelta = cs.temperature - ROOM_TEMPERATURE_C;
    if (coolDelta > 0) {
      cs.temperature -= coolDelta * AMBIENT_COOLING_COEFF * timeStep;
    }

    // Boiling plateau check
    if (cs.temperature >= liquidProps.boilingPoint) {
      cs.temperature = liquidProps.boilingPoint;
      cs.isBoiling = receivedPowerWatts > 50;
      cs.boilingIntensity = Math.min(1.0, receivedPowerWatts / 800);
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
        0.92,
        Math.max(0.08, c.containerState.volumeMl / c.containerState.capacityMl)
      );
      const liquidTopY = c.y + c.height * (1.0 - liquidLevelFraction * 0.88);
      const liquidBottomY = c.y + c.height;

      return (
        bulbX >= c.x + 4 &&
        bulbX <= c.x + c.width - 4 &&
        bulbY >= liquidTopY &&
        bulbY <= liquidBottomY + 8
      );
    });

    let targetTemp = ROOM_TEMPERATURE_C;
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
  const nextElapsed = sim.elapsedSec + timeStep;
  let nextHistory = sim.history;

  if (sim.graph.visible && containers.length > 0) {
    const primaryVessel =
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
      }

      // Sample every 0.1s to avoid overflowing history array
      const lastPoint = sim.history[sim.history.length - 1];
      if (!lastPoint || nextElapsed - lastPoint.timeSec >= 0.1) {
        const point = {
          timeSec: Math.round(nextElapsed * 10) / 10,
          temp1: Math.round(temp1 * 10) / 10,
          temp2: temp2 !== undefined ? Math.round(temp2 * 10) / 10 : undefined,
          tempEquilibrium:
            tempEquilibrium !== undefined ? Math.round(tempEquilibrium * 10) / 10 : undefined,
        };
        // Keep up to 600 points (~60 seconds running buffer)
        nextHistory = [...sim.history.slice(-599), point];
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
