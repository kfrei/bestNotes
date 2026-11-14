/**
 * Core types and interfaces for the BestNotes / ExplainBoards Simulation Engine.
 * Supports physics-accurate simulations built on top of user-drawn strokes and shapes.
 */

export type SimulationCategory =
  | 'mechanics'
  | 'electricity'
  | 'springs'
  | 'atoms'
  | 'fluids'
  | 'waves'
  | 'chemistry'
  | 'math';

export type StopwatchAction = 'start' | 'pause' | 'resume' | 'reset';

export interface Vector2D {
  x: number;
  y: number;
}

export interface SimulationBoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Common configuration for any simulation module.
 */
export interface ISimulationMeta {
  id: string;
  name: string;
  nameEl: string;
  category: SimulationCategory;
  descriptionEl: string;
  iconSvg?: string;
  version: string;
}

/**
 * Universal Simulation Module Interface.
 * Allows plug-and-play addition of new STEM topics (projectile motion, hydrostatics, circuits, etc.)
 */
export interface ISimulationModule<TState = unknown, TParams = unknown> extends ISimulationMeta {
  /**
   * Evaluates if user strokes/shapes match this simulation's requirements
   */
  canAssemble?: (strokes: unknown[], shapes: unknown[]) => boolean;

  /**
   * Initializes or resets the simulation state
   */
  initState: (params?: Partial<TParams>) => TState;

  /**
   * Advances the simulation physics by dt seconds (at 60fps/120fps)
   */
  stepPhysics?: (state: TState, dt: number, params: TParams) => TState;

  /**
   * Renders the simulation overlay/elements on the 2D canvas
   */
  render?: (
    ctx: CanvasRenderingContext2D,
    state: TState,
    params: TParams,
    options?: {
      scale?: number;
      isPaused?: boolean;
      activeTheme?: 'warm' | 'dark' | 'white';
    }
  ) => void;

  /**
   * Responds to digital stopwatch events (start, pause, resume, reset)
   */
  onStopwatchEvent?: (action: StopwatchAction, state: TState) => Partial<TState> | void;
}
