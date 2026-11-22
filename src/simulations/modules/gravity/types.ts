export interface GravitySegment {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  strokeId: string;
  halfWidth?: number;
}

export interface GravityTether {
  strokeId: string;
  pivotX: number;
  pivotY: number;
  length: number;
}

export interface GravityPusher {
  strokeId: string;
  dir: 1 | -1; // auto-detected from torso lean (+1 = right →, -1 = left ←)
  role: 'push' | 'pull';
  color: string;
  label: string; // 'F' when single, 'F₁' / 'F₂' when multiple
  initCx: number;
}

export interface GravityBodyState {
  strokeId: string;
  label: string;
  color: string;
  shapeKind: 'ball' | 'box';
  pinned: boolean;
  initCx: number;
  initCy: number;
  cx: number;
  cy: number;
  initVx: number;
  initVy: number;
  vx: number;
  vy: number;
  radius: number;
  halfW: number;
  halfH: number;
  initAngle?: number;
  angle?: number;
  mass: number;
  // Live physics telemetry (updated each physics step)
  normalX: number;
  normalY: number;
  normalForceN: number;
  frictionForceN: number;
  onGround: boolean;
  trail: { x: number; y: number }[];
  tether?: GravityTether;
  pushers?: GravityPusher[];
  v0ArrowStrokeId?: string;
}

export interface GravityLabConfig {
  gravity: number; // m/s^2 (0 = space, 1.6 = Moon, 9.8 = Earth, 24.8 = Jupiter)
  restitution: number; // 0 = plastic stop, 0.78 = damped bounce, 1.0 = elastic
  frictionEnabled: boolean;
  frictionMu: number; // 0.02 .. 0.80
  airDragEnabled: boolean;
  airDragCoeff: number; // 0.02 .. 0.30
  pageBoundsEnabled: boolean; // true = bounce off page edges; false = fly/fall freely off-page
  guideRailEnabled: boolean; // true = hug convex ramp/shelf corners smoothly without ski-jump liftoff
  pushForceN: number; // Legacy/default magnitude in Newtons (-40 .. +40 N)
  pusherForcesN: Record<string, number>; // Per-Stickman signed force F (-40 .. +40 N) keyed by strokeId
  showVelocity: boolean; // Velocity vector v (drawn outside, slightly above & ahead of body)
  showForces: boolean; // Individual forces (W, N, F, T) — mutually exclusive with showNetForce
  showNetForce: boolean; // Net resultant force F_ol — mutually exclusive with showForces
  showVectors: boolean; // Legacy alias kept for compatibility
  showTrail: boolean;
  showEnergy: boolean;
}

export const DEFAULT_GRAVITY_CONFIG: GravityLabConfig = {
  gravity: 9.8,
  restitution: 1.0,
  frictionEnabled: false,
  frictionMu: 0.18,
  airDragEnabled: false,
  airDragCoeff: 0.08,
  pageBoundsEnabled: true,
  guideRailEnabled: true,
  pushForceN: 14,
  pusherForcesN: {},
  showVelocity: false,
  showForces: false,
  showNetForce: false,
  showVectors: false,
  showTrail: true,
  showEnergy: true,
};

export interface GravityEnergyStats {
  kineticJ: number;
  potentialJ: number;
  totalJ: number;
  speedMs: number;
  heightM: number;
  refFloorY: number;
}
