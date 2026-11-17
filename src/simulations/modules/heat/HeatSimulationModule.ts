/**
 * Heat & Thermodynamics Simulation Module.
 * BestNotes / ExplainBoards.
 *
 * Implements the universal ISimulationModule interface for registry and ribbon discovery.
 */

import { ISimulationModule, SimulationObjectItem } from '../../types';
import { HeatSimConfig, HeatObject, HeatObjectType } from './types';
import { stepHeatSimulation } from './heatPhysicsEngine';
import { renderHeatSimulation } from './HeatRenderer';
import { createHeatObjectFromRecognition } from './HeatSketchRecognizer';

export const HEAT_SIMULATION_OBJECTS: readonly SimulationObjectItem[] = [
  {
    id: 'burner',
    nameEl: 'Καμινέτο Bunsen',
    category: 'heat',
    shapePreset: 'burner',
    handwritingHintEl: 'Βάση με κατακόρυφο σωλήνα και φλόγα',
  },
  {
    id: 'tripod',
    nameEl: 'Τρίποδας Εργαστηρίου',
    category: 'heat',
    shapePreset: 'tripod',
    handwritingHintEl: 'Τρεις ράβδοι με μεταλλικό δακτύλιο και πλέγμα',
  },
  {
    id: 'beaker',
    nameEl: 'Ποτήρι Ζέσεως',
    category: 'heat',
    shapePreset: 'beaker',
    handwritingHintEl: 'Κυλινδρικό ποτήρι με κλίμακα ml και χείλος εκροής',
  },
  {
    id: 'wide-basin',
    nameEl: 'Πλατιά Λεκάνη (Υδατόλουτρο)',
    category: 'heat',
    shapePreset: 'wide-basin',
    handwritingHintEl: 'Χαμηλό πλατύ δοχείο για υδατόλουτρο & θερμική ισορροπία',
  },
  {
    id: 'flask',
    nameEl: 'Κωνική Φιάλη Erlenmeyer',
    category: 'heat',
    shapePreset: 'flask',
    handwritingHintEl: 'Κωνικό δοχείο με στενό λαιμό',
  },
  {
    id: 'thermometer',
    nameEl: 'Εργαστηριακό Θερμόμετρο',
    category: 'heat',
    shapePreset: 'thermometer',
    handwritingHintEl: 'Κατακόρυφος τριχοειδής σωλήνας 0–100°C',
  },
];

/**
 * Creates default heat simulation configuration (empty container until user explicitly places apparatus).
 */
export function createDefaultHeatSim(originX: number = 240, originY: number = 320): HeatSimConfig {
  return {
    id: `heat-sim-${Date.now()}`,
    name: 'θερμ01',
    objects: [],
    selectedObjectId: null,
    selectedObjectIds: [],
    isRunning: false,
    elapsedSec: 0,
    graph: {
      visible: false,
      x: originX + 180,
      y: originY - 120,
      width: 290,
      height: 200,
    },
    history: [],
  };
}

export const HeatSimulationModule: ISimulationModule<HeatSimConfig, {}> = {
  id: 'heat',
  name: 'Heat & Thermodynamics',
  nameEl: 'Θερμότητα & Θερμοδυναμική',
  category: 'heat',
  descriptionEl:
    'Προσομοίωση θέρμανσης, ειδικής θερμοχωρητικότητας Q=m·c·ΔT, βρασμού και θερμικής ισορροπίας με 6 εργαστηριακά αντικείμενα.',
  version: '1.0',
  objects: HEAT_SIMULATION_OBJECTS,

  initState: (): HeatSimConfig => {
    return createDefaultHeatSim();
  },

  stepPhysics: (state: HeatSimConfig, dt: number): HeatSimConfig => {
    return stepHeatSimulation(state, dt);
  },

  render: (ctx: CanvasRenderingContext2D, state: HeatSimConfig, _params, options) => {
    renderHeatSimulation(ctx, state, {
      isDark: options?.activeTheme === 'dark',
      scale: options?.scale,
    });
  },
};
