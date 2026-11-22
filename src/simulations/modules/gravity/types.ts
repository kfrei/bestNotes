export interface GravitySegment {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  strokeId: string;
}

export interface GravityTether {
  strokeId: string;
  pivotX: number;
  pivotY: number;
  length: number;
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
  mass: number;
  // Live physics telemetry (updated each physics step)
  normalX: number;
  normalY: number;
  normalForceN: number;
  onGround: boolean;
  trail: { x: number; y: number }[];
  tether?: GravityTether;
  v0ArrowStrokeId?: string;
}

export interface GravityLabConfig {
  gravity: number; // m/s^2 (0 = space, 1.6 = Moon, 9.8 = Earth, 24.8 = Jupiter)
  restitution: number; // 0 = plastic stop, 0.78 = damped bounce, 1.0 = elastic
  frictionEnabled: boolean;
  frictionMu: number; // 0.02 .. 0.80
  airDragEnabled: boolean;
  airDragCoeff: number; // 0.02 .. 0.30
  showVectors: boolean;
  showTrail: boolean;
  showEnergy: boolean;
}

export const DEFAULT_GRAVITY_CONFIG: GravityLabConfig = {
  gravity: 9.8,
  restitution: 0.78,
  frictionEnabled: false,
  frictionMu: 0.18,
  airDragEnabled: false,
  airDragCoeff: 0.08,
  showVectors: true,
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
