/**
 * Simple Pendulum Simulation Module (Απλό Εκκρεμές).
 * Provides physics modeling, metadata, and control hooks.
 */

import { ISimulationModule } from '../../../types';
import {
  calculatePendulumPeriod,
  calculatePendulumFrequency,
  calculatePendulumTensionMultiplier,
  computePendulumBobPosition,
  pendulumMetersToPixels,
  pendulumPixelsToMeters,
  PendulumState,
} from './pendulumPhysics';

export interface PendulumParams {
  lengthM: number;
  initialAngleRad: number;
  maxAngleRad: number;
}

export const PendulumModule: ISimulationModule<PendulumState, PendulumParams> = {
  id: 'pendulum',
  name: 'Simple Pendulum',
  nameEl: 'Απλό Εκκρεμές',
  category: 'mechanics',
  descriptionEl: 'Προσομοίωση απλού εκκρεμούς με ακριβή φυσική ταλάντωσης και τάσης νήματος.',
  version: '0.99',
  objects: [
    {
      id: 'pendulum-bob',
      nameEl: 'Σφαιρίδιο & Νήμα',
      category: 'mechanics',
      shapePreset: 'circle',
      handwritingHintEl: 'Σχεδίασε ευθύγραμμο τμήμα με κύκλο στο κάτω άκρο',
    },
    {
      id: 'ruler-scale',
      nameEl: 'Χάρακας Μήκους',
      category: 'mechanics',
      shapePreset: 'ruler',
      handwritingHintEl: 'Κατακόρυφος χάρακας 0.3m – 2.0m',
    },
    {
      id: 'stopwatch',
      nameEl: 'Χρονόμετρο',
      category: 'mechanics',
      shapePreset: 'stopwatch',
      handwritingHintEl: 'Ψηφιακό χρονόμετρο μετρήσεων περιόδου T',
    },
  ],

  initState: (params?: Partial<PendulumParams>): PendulumState => {
    const lengthM = params?.lengthM ?? 1.0;
    const initialAngleRad = params?.initialAngleRad ?? Math.PI / 6;
    const maxAngleRad = params?.maxAngleRad ?? Math.PI / 6;

    return {
      angleRad: initialAngleRad,
      angularVelocity: 0,
      maxAngleRad,
      lengthM,
      lengthPx: pendulumMetersToPixels(lengthM),
      originX: 0,
      originY: 0,
      isPaused: true,
      trajectory: [],
    };
  },

  onStopwatchEvent: (action, state) => {
    if (action === 'start' || action === 'resume') {
      return { isPaused: false };
    }
    if (action === 'pause') {
      return { isPaused: true };
    }
    if (action === 'reset') {
      return {
        angleRad: state.maxAngleRad,
        angularVelocity: 0,
        isPaused: true,
        trajectory: [],
      };
    }
  },
};

export {
  calculatePendulumPeriod,
  calculatePendulumFrequency,
  calculatePendulumTensionMultiplier,
  computePendulumBobPosition,
  pendulumMetersToPixels,
  pendulumPixelsToMeters,
};
