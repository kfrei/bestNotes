# 🗺️ BestNotes Master Codebase Index & Domain Architecture Guide (`v1.02 — heatSimFixed`)

> **Σημείωση:** Το πλήρες ευρετήριο αρχείων και αρχιτεκτονικής βρίσκεται συγχρονισμένο και στο [docs/CODEBASE_INDEX.md](file:///Users/freiderikosk/Downloads/BestNotes/docs/CODEBASE_INDEX.md).

## 🏛️ Δομή Domains (`v1.02 — heatSimFixed`)

- **`src/simulations/`** (`feature-simulations` chunk):
  - **`modules/circuits/`**:
    - `types.ts`: `CircuitComponentKind`, `CircuitComponentInfo`, `CircuitSimulationData`, `CircuitSimConfig`, κ.ά.
    - `circuitEngine.ts`: Πλήρης μηχανή αναγνώρισης, αυτόματης ευθυγράμμισης/ένωσης αγωγών, μετατροπής `Σχήματα ↔ Σύμβολα` και επίλυσης κόμβων Kirchhoff (`analyzeCircuitForSimulation` με `O(1)` LRU Memoization Cache).
    - `circuitHelpers.ts`: `getValidCircuitSims`, `getAllNotebookCircuitSims`, `getActiveCircuitSim`, `getNextDefaultCircuitSimName`, `getSimExpandedStrokeSet`, `expandWholeCircuitStrokeIds`, `runScopedCircuitOperationOnPage`, `splitWiresAndSyncPageSims`.
    - `CircuitControlPanel.tsx`: Αυτόνομο Dashboard UI για τα Ηλεκτρικά Κυκλώματα.
    - `CircuitSimulationModule.ts`: Module εγγραφής στο `SimulationRegistry`.
  - **`modules/heat/`**:
    - `types.ts`, `heatPhysicsEngine.ts`, `HeatRenderer.ts`, `useHeatSimulation.ts`, `HeatControlPanel.tsx`, `HeatLiquidConfigModal.tsx`, `HeatGraphChoiceModal.tsx`, `HeatSketchRecognizer.ts`, `HeatSimulationModule.ts`.
  - **`modules/mechanics/pendulum/`**:
    - `pendulumPhysics.ts`, `PendulumModule.ts`.
  - **`ui/`**:
    - `StopwatchWidget.tsx` (με επιλογέα ταχύτητας `1x` → `2x` → `5x`), `FullscreenLaserCanvas.tsx`, `SimulationObjectRibbon.tsx`.
- **`src/stem-engines/`**: `ocr/OcrPrompts.ts`, `chemistry/periodicTableData.ts`, `math/physicsEquationsLibrary.ts`, `ui/LassoOcrButtons.tsx`.
- **`src/canvas-tools/`**: `palette/colorPresets.ts`, `tools/toolCatalog.ts`, `geometry/index.ts`.
- **`src/features/library/`**: `RecentlyOpenedStrip.tsx`, `LibraryDeleteModal.tsx`, `FolderEditModal.tsx`, `constants/folderPresets.tsx`.
- **`src/services/storage/`**: `storageCleaners.ts` (`compactStrokeForStorage` lossless συμπίεση σημείων 240Hz κατά 55%–70%), `indexedDb.ts`, `localAndIdbSync.ts`, `firestoreSync.ts`.
- **`src/features/admin/`** (`feature-admin` chunk): `AdminPortal.tsx`, `AdminDashboard.tsx`, `services/userStatsService.ts`, `services/trafficService.ts`.
