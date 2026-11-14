/**
 * Types & Data Models for the Heat & Thermodynamics Interactive Simulation.
 * BestNotes / ExplainBoards.
 *
 * Implements:
 * 1. Burner (Bunsen) with 3 flame states and animations.
 * 2. Tripod with fireproof wire gauze and heating glow.
 * 3. Cylindrical Beaker (resizable, liquid fill, meniscus, boiling & steam, pencil config).
 * 4. Wide Basin (Water bath / Υδατόλουτρο) supporting nested vessels & thermal equilibrium.
 * 5. Erlenmeyer Flask (narrow neck, graduated marks, liquid fill).
 * 6. Thermometer (dynamic gradient fill 0-100°C, numeric badge, snapping).
 */

export type HeatObjectType =
  | 'burner'
  | 'tripod'
  | 'beaker'
  | 'wide-basin'
  | 'flask'
  | 'thermometer';

export type LiquidType = 'water' | 'milk' | 'oil';

export interface LiquidPhysicalProperties {
  type: LiquidType;
  nameEl: string;
  density: number; // g/cm³ (or g/ml)
  specificHeat: number; // J/(g·°C)
  boilingPoint: number; // °C
  color: string; // Base fill color with alpha
  deepColor: string; // Meniscus / edge stroke color
  glowColor: string; // Vapor / thermal tint
  descriptionEl: string;
}

export const LIQUID_REGISTRY: Record<LiquidType, LiquidPhysicalProperties> = {
  water: {
    type: 'water',
    nameEl: 'Νερό (H₂O)',
    density: 1.0,
    specificHeat: 4.184,
    boilingPoint: 100.0,
    color: 'rgba(56, 189, 248, 0.45)', // Sky blue translucent
    deepColor: '#0284c7',
    glowColor: 'rgba(186, 230, 253, 0.6)',
    descriptionEl: 'Υψηλή ειδική θερμοχωρητικότητα c = 4.18 J/(g·°C). Απαιτεί πολλή θερμότητα για να ζεσταθεί.',
  },
  milk: {
    type: 'milk',
    nameEl: 'Γάλα',
    density: 1.03,
    specificHeat: 3.93,
    boilingPoint: 100.5,
    color: 'rgba(254, 252, 232, 0.88)', // Milky ivory translucent
    deepColor: '#ca8a04',
    glowColor: 'rgba(254, 240, 138, 0.6)',
    descriptionEl: 'Ειδική θερμοχωρητικότητα c = 3.93 J/(g·°C). Πυκνότητα ελαφρώς μεγαλύτερη από το νερό.',
  },
  oil: {
    type: 'oil',
    nameEl: 'Ελαιόλαδο',
    density: 0.92,
    specificHeat: 2.0,
    boilingPoint: 300.0,
    color: 'rgba(245, 158, 11, 0.55)', // Golden amber translucent
    deepColor: '#b45309',
    glowColor: 'rgba(251, 191, 36, 0.6)',
    descriptionEl: 'Χαμηλή ειδική θερμοχωρητικότητα c = 2.00 J/(g·°C). Ζεσταίνεται 2 φορές ταχύτερα από το νερό!',
  },
};

export type FlameIntensity = 'off' | 'safety' | 'normal' | 'roaring';

export interface HeatBurnerState {
  isOn: boolean;
  intensity: FlameIntensity; // safety (yellow, 300W), normal (orange, 600W), roaring (blue, 1000W)
  flameCycle: number; // 0..1 for flicker phase
}

export interface HeatTripodState {
  wireGauzeTemp: number; // Celsius of wire gauze (20°C to 500°C)
  snappedBurnerId?: string;
  snappedVesselId?: string;
}

export interface HeatContainerState {
  capacityMl: number; // Total max volume e.g. 250, 500, 750, 1000 ml
  volumeMl: number; // Current liquid volume e.g. 250 ml
  liquidType: LiquidType;
  temperature: number; // Current temperature in °C
  initialTemp: number; // Starting temperature in °C (for reset)
  isBoiling: boolean;
  boilingIntensity: number; // 0..1
  nestedVesselId?: string; // ID of a beaker/flask placed inside this basin
  parentBasinId?: string; // ID of the basin this container is resting in
  snappedTripodId?: string; // ID of tripod underneath
  pencilHovered?: boolean;
}

export interface HeatThermometerState {
  temperature: number; // Live measured temperature in °C
  dippedVesselId?: string; // Container whose liquid it is dipping into
  showBadge: boolean; // Digital numeric overlay badge
}

export interface HeatObject {
  id: string;
  type: HeatObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  burnerState?: HeatBurnerState;
  tripodState?: HeatTripodState;
  containerState?: HeatContainerState;
  thermometerState?: HeatThermometerState;
}

export interface HeatGraphDataPoint {
  timeSec: number;
  temp1: number; // Primary vessel temperature
  temp2?: number; // Secondary (nested vessel or bath) temperature
  tempEquilibrium?: number; // Theoretical asymptote
}

export interface HeatGraphConfig {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  customMoved?: boolean;
}

export interface HeatSimConfig {
  id: string;
  name: string; // e.g. 'θερμ01'
  objects: HeatObject[];
  selectedObjectId?: string | null;
  isRunning: boolean;
  elapsedSec: number;
  graph: HeatGraphConfig;
  history: HeatGraphDataPoint[];
}
