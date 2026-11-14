/**
 * Pure 2D vector and numerical utilities for the Simulation Engine.
 */

import { Vector2D } from '../types';

export const vec = (x: number, y: number): Vector2D => ({ x, y });

export const vecAdd = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const vecSub = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const vecScale = (v: Vector2D, s: number): Vector2D => ({
  x: v.x * s,
  y: v.y * s,
});

export const vecMag = (v: Vector2D): number => Math.hypot(v.x, v.y);

export const vecMagSq = (v: Vector2D): number => v.x * v.x + v.y * v.y;

export const vecDist = (a: Vector2D, b: Vector2D): number => Math.hypot(a.x - b.x, a.y - b.y);

export const vecNorm = (v: Vector2D): Vector2D => {
  const m = vecMag(v);
  return m > 1e-9 ? { x: v.x / m, y: v.y / m } : { x: 0, y: 0 };
};

export const vecDot = (a: Vector2D, b: Vector2D): number => a.x * b.x + a.y * b.y;

export const vecCross = (a: Vector2D, b: Vector2D): number => a.x * b.y - a.y * b.x;

export const vecRotate = (v: Vector2D, rad: number): Vector2D => {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
};

export const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
