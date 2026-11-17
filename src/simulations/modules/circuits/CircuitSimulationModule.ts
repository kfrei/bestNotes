import type { ISimulationModule, SimulationObjectItem } from '../../types';
import type { StrokeObject } from '../../../types/note';
import { classifyCircuitStrokeKind, analyzeCircuitForSimulation } from './circuitEngine';
import type { CircuitSimulationData } from './types';

export const CIRCUIT_OBJECT_CATALOG: readonly SimulationObjectItem[] = [
  {
    id: 'battery',
    nameEl: 'Μπαταρία',
    category: 'electricity',
    shapePreset: 'battery',
    handwritingHintEl: 'Πηγή συνεχούς ρεύματος με θετικό (+) και αρνητικό (-) πόλο',
  },
  {
    id: 'voltage-source',
    nameEl: 'Πηγή Τάσης',
    category: 'electricity',
    shapePreset: 'voltage-source',
    handwritingHintEl: 'Σχηματικό σύμβολο ηλεκτρικής πηγής συνεχούς τάσης',
  },
  {
    id: 'bulb',
    nameEl: 'Λαμπτήρας',
    category: 'electricity',
    shapePreset: 'bulb',
    handwritingHintEl: 'Ηλεκτρικός λαμπτήρας πυρακτώσεως με δυναμική φωτοβολία',
  },
  {
    id: 'resistor',
    nameEl: 'Αντιστάτης',
    category: 'electricity',
    shapePreset: 'resistor',
    handwritingHintEl: 'Ωμικός αντιστάτης R για κυκλώματα σειράς και παράλληλης σύνδεσης',
  },
  {
    id: 'switch',
    nameEl: 'Διακόπτης',
    category: 'electricity',
    shapePreset: 'switch',
    handwritingHintEl: 'Μαχαιρωτός διακόπτης ανοίγματος/κλεισίματος κυκλώματος',
  },
  {
    id: 'ammeter',
    nameEl: 'Αμπερόμετρο',
    category: 'electricity',
    shapePreset: 'ammeter',
    handwritingHintEl: 'Όργανο μέτρησης έντασης ηλεκτρικού ρεύματος I (σύνδεση σε σειρά)',
  },
  {
    id: 'voltmeter',
    nameEl: 'Βολτόμετρο',
    category: 'electricity',
    shapePreset: 'voltmeter',
    handwritingHintEl: 'Όργανο μέτρησης ηλεκτρικής τάσης V (παράλληλη σύνδεση)',
  },
  {
    id: 'fan',
    nameEl: 'Μοτέρ / Φτερωτή',
    category: 'electricity',
    shapePreset: 'fan',
    handwritingHintEl: 'Ηλεκτρικός κινητήρας με περιστρεφόμενη φτερωτή',
  },
];

export const CircuitSimulationModule: ISimulationModule<CircuitSimulationData> = {
  id: 'electric-circuits',
  name: 'Electric Circuits & Charge Flow',
  nameEl: 'Ηλεκτρικά Κυκλώματα & Ροή Φορτίων',
  category: 'electricity',
  version: '1.02',
  descriptionEl:
    'Σχεδίαση ηλεκτρικών κυκλωμάτων, αυτόματη ευθυγράμμιση αγωγών, μετατροπή Σχημάτων ↔ Συμβόλων, επίλυση κόμβων Kirchhoff, κίνηση ηλεκτρονίων και μετρήσεις με Αμπερόμετρο & Βολτόμετρο.',
  objects: CIRCUIT_OBJECT_CATALOG,
  canAssemble(strokes: unknown[]): boolean {
    return (strokes as StrokeObject[]).some((s) => classifyCircuitStrokeKind(s) !== null);
  },
  initState(): CircuitSimulationData {
    return analyzeCircuitForSimulation([], false);
  },
  stepPhysics(state: CircuitSimulationData): CircuitSimulationData {
    return state;
  },
  render(): void {
    // Rendered via BestNotes multi-circuit canvas layer pipeline
  },
};
