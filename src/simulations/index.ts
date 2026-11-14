/**
 * Master Index for the BestNotes / ExplainBoards Simulations Domain.
 * Exports types, core services, registry, UI widgets, and science modules.
 */

// Types
export * from './types';

// Core Services & Math
export * from './core/PhysicsMath';
export * from './core/UniversalStopwatchBridge';
export * from './core/VirtualPencilAnimator';

// Registry
export * from './registry/SimulationRegistry';

// Modules
export * from './modules/mechanics/pendulum/pendulumPhysics';
export * from './modules/mechanics/pendulum/PendulumModule';

// UI Components
export * from './ui/StopwatchWidget';
export * from './ui/FullscreenLaserCanvas';

// Auto-register built-in simulation modules
import { SimulationRegistry } from './registry/SimulationRegistry';
import { PendulumModule } from './modules/mechanics/pendulum/PendulumModule';

SimulationRegistry.register(PendulumModule);
