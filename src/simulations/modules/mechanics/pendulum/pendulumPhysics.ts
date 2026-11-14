/**
 * Physics engine for the Simple Pendulum simulation.
 * Compliant with classical mechanics:
 *   - Period: T = 2π√(L/g)
 *   - Tension: T_tension = mg(3cosθ - 2cosθ_max)
 *   - Angular acceleration: α = -(g/L)sinθ
 */

export const PENDULUM_G = 9.81; // m/s^2
export const PENDULUM_PIXELS_PER_METER = 230; // 23px = 0.1m, 230px = 1.0m (10 grid boxes)
export const PENDULUM_MIN_LENGTH_M = 0.3;
export const PENDULUM_MAX_LENGTH_M = 2.0;

export interface PendulumState {
  angleRad: number;
  angularVelocity: number;
  maxAngleRad: number;
  lengthM: number;
  lengthPx: number;
  originX: number;
  originY: number;
  isPaused: boolean;
  trajectory: Array<{ x: number; y: number }>;
}

/**
 * Calculates the theoretical period of oscillation: T = 2π√(L/g)
 */
export const calculatePendulumPeriod = (lengthM: number, g: number = PENDULUM_G): number => {
  const safeL = Math.max(0.01, lengthM);
  return 2 * Math.PI * Math.sqrt(safeL / g);
};

/**
 * Calculates the theoretical frequency of oscillation: f = 1/T
 */
export const calculatePendulumFrequency = (lengthM: number, g: number = PENDULUM_G): number => {
  const period = calculatePendulumPeriod(lengthM, g);
  return period > 0 ? 1 / period : 0;
};

/**
 * Calculates dynamic string tension:
 *   T_tension = mg * (3*cos(θ) - 2*cos(θ_max))
 * Returns normalized multiplier relative to mg (e.g. at θ=0 it is 3 - 2*cos(θ_max) ≥ 1)
 */
export const calculatePendulumTensionMultiplier = (
  currentAngleRad: number,
  maxAngleRad: number
): number => {
  const curCos = Math.cos(currentAngleRad);
  const maxCos = Math.cos(maxAngleRad);
  const rawMult = 3 * curCos - 2 * maxCos;
  return Math.max(0.1, rawMult);
};

/**
 * Computes bob coordinates from pivot and length
 */
export const computePendulumBobPosition = (
  originX: number,
  originY: number,
  lengthPx: number,
  angleRad: number
): { x: number; y: number } => {
  return {
    x: originX + lengthPx * Math.sin(angleRad),
    y: originY + lengthPx * Math.cos(angleRad),
  };
};

/**
 * Converts length in meters to screen pixels
 */
export const pendulumMetersToPixels = (meters: number): number => {
  const clamped = Math.max(PENDULUM_MIN_LENGTH_M, Math.min(PENDULUM_MAX_LENGTH_M, meters));
  return Math.round(clamped * PENDULUM_PIXELS_PER_METER);
};

/**
 * Converts screen pixels to length in meters
 */
export const pendulumPixelsToMeters = (pixels: number): number => {
  const rawM = pixels / PENDULUM_PIXELS_PER_METER;
  const rounded = Math.round(rawM * 10) / 10;
  return Math.max(PENDULUM_MIN_LENGTH_M, Math.min(PENDULUM_MAX_LENGTH_M, rounded));
};
