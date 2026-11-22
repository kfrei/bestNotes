// Modular Gravity & Mechanics Simulation Engine facade
// Split into focused submodules:
//  - gravityGeometry.ts      (stroke bounds, Bézier/circle/3D floor segment sampling)
//  - gravitySceneBuilder.ts  (scene classification, loop-the-loop auto-pin, strict pendulum binding)
//  - gravityPhysicsStep.ts   (symplectic sub-stepping, exact E0 conservation, Guide Rail, open-tip launch)
//  - gravityRenderer.ts      (trajectory fade-out trail, u / Forces / ΣF vectors, pushpin badge)

export { GRAVITY_PX_PER_M, getStrokeBounds, sampleStrokeToSegments } from './gravityGeometry';
export { buildGravitySceneFromStrokes } from './gravitySceneBuilder';
export { stepGravityScene, computeGravityEnergyStats } from './gravityPhysicsStep';
export { renderGravityOverlay } from './gravityRenderer';
