import type { StrokeObject, CircuitSimConfig } from '../../../types/note';

export type { CircuitSimConfig };

export type CircuitComponentKind =
  | 'battery'
  | 'voltage-source'
  | 'bulb'
  | 'resistor'
  | 'switch'
  | 'fan'
  | 'ammeter'
  | 'voltmeter';

export interface CircuitComponentInfo {
  key: string; // groupId or stroke.id
  kind: CircuitComponentKind;
  strokeIds: string[];
  color: string;
  layerId: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  leftTerm: { x: number; y: number };
  rightTerm: { x: number; y: number };
  topTerm?: { x: number; y: number };
  bottomTerm?: { x: number; y: number };
  circleCx?: number;
  circleCy?: number;
  circleR?: number;
  orientation?: 'h' | 'v';
  switchClosed?: boolean;
}

export interface HandDrawnCircuitRecognitionResult {
  changed: boolean;
  strokes: StrokeObject[];
  removedStrokeIds: string[];
  addedCompStrokeIds: string[];
  addedWireStrokeIds?: string[];
  removedTextIds: string[];
}

export interface SimulatedWireSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  active: boolean;
  inClosedLoop: boolean;
  currentSpeed: number;
  highEnergy: boolean;
  pathPoints?: { x: number; y: number }[];
}

export interface SimulatedComponentState {
  comp: CircuitComponentInfo;
  active: boolean;
  powerFactor: number;
}

export interface AutoVerticalSwitchInfo {
  x: number;
  yCenter: number;
  yTop: number;
  yBottom: number;
  wireIdx: number;
  closed: boolean;
}

export interface CircuitSimulationData {
  hasSource: boolean;
  isCircuitClosed: boolean;
  sourceCount: number;
  wireSegments: SimulatedWireSegment[];
  components: SimulatedComponentState[];
  autoSwitch: AutoVerticalSwitchInfo | null;
}
