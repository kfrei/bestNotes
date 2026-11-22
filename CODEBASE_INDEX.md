# 🗺️ BestNotes Master Codebase Index & Domain Architecture Guide (`v1.15 — 2dto3drenderFeature & GravitySimulation`)

> **Σημείωση:** Το πλήρες ευρετήριο αρχείων και αρχιτεκτονικής βρίσκεται συγχρονισμένο και στο [docs/CODEBASE_INDEX.md](./docs/CODEBASE_INDEX.md).
> **Κανόνας Απόδοσης (`Zero-Slowdown Charter`):** Κάθε προσομοίωση/διάγραμμα πρέπει να συμμορφώνεται με το [docs/SIMULATION_GUIDELINES.md](./docs/SIMULATION_GUIDELINES.md) (`0.00 ms / 0 RAF` σε παύση, `< 4.0 ms` ενεργό, lazy `simCanvas`, viewport culling).
> **Υποχρεωτικός Κανόνας Αναίρεσης (`Undo-First Guarantee`):** ΚΑΘΕ νέο feature που προσθέτει, τροποποιεί, συνδυάζει, ενώνει ή διαγράφει strokes, σχήματα, εικόνες ή κείμενα **ΠΡΕΠΕΙ** να υποστηρίζει 100% Αναίρεση (`Undo`) — πάντα `suppressNextUndoRecordRef.current = false` πριν το `updateActivePage(..., true)` (ή ρητό `pushUndoSnapshot`), και πάντα έλεγχος ότι το `Undo` επαναφέρει ακριβώς την προηγούμενη κατάσταση!

## 🏛️ Δομή Domains (`v1.15 — 2dto3drenderFeature & GravitySimulation`)

- **`src/simulations/`** (`feature-simulations` chunk):
  - **`modules/gravity/` (Μηχανική & Βαρύτητα — Modular Engine `v1.15`)**:
    - `GravityLabEngine.ts`: Thin facade/barrel export για όλα τα υπο-άρθρα της Μηχανικής.
    - `gravityGeometry.ts`: `GRAVITY_PX_PER_M`, `getStrokeBounds`, `sampleStrokeToSegments` (3D Studio Floor/Wedge, κλειστές κυκλικές τροχιές loop-the-loop 64 τμημάτων, 64-segment cubic Bézier για ακριβές Τεταρτοκύκλιο 90°).
    - `gravitySceneBuilder.ts`: `buildGravitySceneFromStrokes` — αυτόματη ταξινόμηση δυναμικών σωμάτων, καρφιτσωμένων/ακίνητων δαπέδων (auto-pin εγκλειόντων κύκλων), αυστηρού εκκρεμούς μόνο σε ευθύγραμμα τμήματα με κέντρο σφαίρας στο άκρο, αρχικών ταχυτήτων `u₀` & πολλαπλών Stickmen (`F₁`, `F₂`, `ΣF`).
    - `gravityPhysicsStep.ts`: `stepGravityScene` & `computeGravityEnergyStats` — symplectic sub-stepping (8 substeps/frame), ακριβής διατήρηση μηχανικής ενέργειας $E_0$ σε απότομα τοιχώματα/U-bowls/ράφια, **Τροχιά-Οδηγός** (`guideRailEnabled`), καθαρή εκτόξευση & εφαπτομενική επανείσοδος σε ελεύθερα άκρα (και με Τροχιά-Οδηγό OFF), επίλυση V-trough pinch.
    - `gravityRenderer.ts`: `renderGravityOverlay` — ίχνος τροχιάς με ομαλό fade-out ουράς, διανύσματα **`u`**, **Δυνάμεις**, **`ΣF` / `ΣF = 0`**, και αχνή κόκκινη κεκλιμένη πινέζα εκτός περιγράμματος για καρφιτσωμένα δάπεδα.
    - `GravityControlPanel.tsx`: Αυτόνομο Dashboard UI Μηχανικής (Play/Pause με πάγωμα θέσης, Reset ↺, `📌 Ορισμός ως Ακίνητο Δάπεδο`, `Τροχιά-Οδηγός`, 3 checkboxes διανυσμάτων σε 1 σειρά, live μπάρες ενέργειας $K, U, E$).
    - `types.ts`: `GravityBodyState`, `GravityLabConfig`, `GravitySegment`, `GravityEnergyStats`, `DEFAULT_GRAVITY_CONFIG`.
  - **`modules/circuits/`**:
    - `types.ts`: `CircuitComponentKind`, `CircuitComponentInfo`, `CircuitSimulationData`, `CircuitSimConfig`, κ.ά.
    - `circuitEngine.ts`: Πλήρης μηχανή αναγνώρισης, αυτόματης ευθυγράμμισης/ένωσης αγωγών, αυτόματης γεφύρωσης `bulb-bridge` για ασύμμετρους εικονιστικούς ακροδέκτες λαμπτήρα (`14587c8`), μετατροπής `Σχήματα ↔ Σύμβολα` και επίλυσης κόμβων Kirchhoff (`analyzeCircuitForSimulation` με `O(1)` LRU Memoization Cache & `m.active` για ζωντανό βολτόμετρο πηγής `V_πηγής` ακόμα και με ανοιχτό διακόπτη `c09a552`).
    - `circuitHelpers.ts`: `getValidCircuitSims`, `getAllNotebookCircuitSims`, `getActiveCircuitSim`, `getNextDefaultCircuitSimName`, `getSimExpandedStrokeSet`, `expandWholeCircuitStrokeIds`, `runScopedCircuitOperationOnPage`, `splitWiresAndSyncPageSims`.
    - `CircuitControlPanel.tsx`: Αυτόνομο Dashboard UI για τα Ηλεκτρικά Κυκλώματα (πράσινα ενεργά / μαύρα ανενεργά pills σε όλα τα 5 Sim tabs `fcf607f`).
    - `CircuitSimulationModule.ts`: Module εγγραφής στο `SimulationRegistry`.
  - **`modules/heat/`**:
    - `types.ts`, `heatPhysicsEngine.ts`, `HeatRenderer.ts`, `useHeatSimulation.ts`, `HeatControlPanel.tsx`, `HeatLiquidConfigModal.tsx`, `HeatGraphChoiceModal.tsx`, `HeatSketchRecognizer.ts`, `HeatSimulationModule.ts`.
  - **`modules/mechanics/pendulum/`**:
    - `pendulumPhysics.ts`, `PendulumModule.ts`.
  - **`ui/`**:
    - `StopwatchWidget.tsx` (με επιλογέα ταχύτητας `1x` → `2x` → `5x`), `FullscreenLaserCanvas.tsx`, `SimulationObjectRibbon.tsx`.
- **`src/stem-engines/`**: `ocr/OcrPrompts.ts`, `chemistry/periodicTableData.ts`, `math/physicsEquationsLibrary.ts`, `ui/LassoOcrButtons.tsx` (`textOCR`, `Σ Math ▾` με ξεχωριστό `Κώδικας` για ΑΕΠΠ/εσοχές `c453bca`, `⚗ Chem ▾`).
- **`src/canvas-tools/`**: `palette/colorPresets.ts`, `tools/toolCatalog.ts`, `geometry/index.ts`.
- **`src/features/library/`**: `RecentlyOpenedStrip.tsx`, `LibraryDeleteModal.tsx`, `FolderEditModal.tsx`, `constants/folderPresets.tsx`.
- **`src/services/storage/`**: `storageCleaners.ts` (`compactStrokeForStorage` lossless συμπίεση σημείων 240Hz κατά 55%–70%), `indexedDb.ts` (singleton IDB connection cache `b6f78d2`), `localAndIdbSync.ts`, `firestoreSync.ts`.
- **`src/data/`**: `seedIds.ts` (lightweight seed IDs για lazy φόρτωση του chunk `data-seeds`, `-888.7 KB` gzip στο αρχικό boot `b6f78d2`), `seeds/index.ts`, & `vectors/` (κατάλογοι STEM εικονιδίων & **53 μουσειακές γκραβούρες Da-Vinci επιστημόνων** με σφραγισμένο αγγλικό όνομα + έτη και έξυπνη οριζόντια κατοπτρική αντιστροφή `flipDataUrl` που κρατά τη λεζάντα ευανάγνωστη).
- **`2D→3D & Σχήματα/Μελάνι (v1.15)`**: 2D-to-3D rendering & σκιώδη 3D σχήματα (`shaded-floor`, `shaded-wedge`, `shaded-arrow`, `shaded-sphere`, `shaded-cuboid`), ακριβές 90° **Τεταρτοκύκλιο** (`quarter-circle`) πριν το Ημίτονο, **Photoshop/Illustrator Pathfinder Boolean Operations** (`src/utils/shapeBooleanOps.ts` + `src/components/ShapeBooleanDropdown.tsx`: Ένωση, Τομή, Αφαίρεση, Εκτός Τομής, Τεμαχισμός με hover mini-animation & πλήρες Undo), συντόμευση **`A / Α` → Βελάκι**, διπλό πάτημα σε άκρο γραμμής για εναλλαγή βέλους (`arrow`/`double-arrow`), μαγνητικός δακτύλιος σύγκλισης σε άκρα & εκκρεμές, Κεκλιμένο Επίπεδο `0°–90°`, και backward-compatible `.png?v=... → .webp` media fallback.
- **`src/utils/`**:
  - `geometryAndAlgorithms.ts`: Multi-key Gemini OCR failover (`Admin key → VITE_GV_PRIMARY → VITE_GV_A/B`) με χειρισμό HTTP `402` και κατάργηση σιωπηλής αλλοίωσης `beautifyHandwritingStrokes` σε αποτυχία OCR (`fcf607f`), επαναφορά `textOCR` & διαχωρισμός `Math → Κώδικας` (`c453bca`), Unicode PUA sentinels για μονάδες SI (`d0d00be`) & Unicode-safe ελληνικό LaTeX (`b6f78d2`).
  - `googleDrivePdfSync.ts`: Εξαγωγή PDF & `Live PDF` με Circuits Option A (καμία αυθαίρετη ανίχνευση σε μη καταχωρημένα σκίτσα, σεβασμός αποθηκευμένων per-circuit `switchClosed`/`showElectrons` & συνεχείς αλυσίδες σωματιδίων), font stack/weight parity + `document.fonts.load` preloading, Pendulum `forceSims` validation, απόκρυψη στατικών strokes, πλήρη διανυσματική ισοδυναμία & διόρθωση φόντου `Live PDF` (`c453bca`).
  - `perfTelemetry.ts` & `src/components/AdminPerfPill.tsx`: Μηδενικού κόστους Live Telemetry Απόδοσης (Sim Frame ms, Active Live Loops, Long Tasks `>50ms`, RAM & Canvas VRAM, 1-click Παύση Όλων).
- **`src/features/admin/`** (`feature-admin` chunk): `AdminPortal.tsx`, `AdminDashboard.tsx`, `components/AdminFirebaseBillingView.tsx`, `components/AdminPerformanceView.tsx`, `services/userStatsService.ts`, `services/trafficService.ts`.
- **`firestore.rules` & `index.html`**: Θωρακισμένοι κανόνες ασφαλείας Firestore και διόρθωση `_vcheck` redirect (`b6f78d2`).
