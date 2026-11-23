# 🗺️ BestNotes Master Codebase Index & Domain Architecture Guide (`buttonHoverAnimations v1.1.2`)

> **Σημείωση:** Το πλήρες ευρετήριο αρχείων και αρχιτεκτονικής βρίσκεται συγχρονισμένο και στο [docs/CODEBASE_INDEX.md](./docs/CODEBASE_INDEX.md).
> **Κανόνας Απόδοσης (`Zero-Slowdown Charter`):** Κάθε προσομοίωση/διάγραμμα πρέπει να συμμορφώνεται με το [docs/SIMULATION_GUIDELINES.md](./docs/SIMULATION_GUIDELINES.md) (`0.00 ms / 0 RAF` σε παύση, `< 4.0 ms` ενεργό, lazy `simCanvas`, viewport culling).
> **Υποχρεωτικός Κανόνας Αναίρεσης (`Undo-First Guarantee`):** ΚΑΘΕ νέο feature που προσθέτει, τροποποιεί, συνδυάζει, ενώνει ή διαγράφει strokes, σχήματα, εικόνες, γωνίες ή κείμενα **ΠΡΕΠΕΙ** να υποστηρίζει 100% Αναίρεση (`Undo`) — πάντα `suppressNextUndoRecordRef.current = false` πριν το `updateActivePage(..., true)` (ή ρητό `pushUndoSnapshot`), και πάντα έλεγχος ότι το `Undo` επαναφέρει ακριβώς την προηγούμενη κατάσταση!

## 🏛️ Δομή Domains (`buttonHoverAnimations v1.1.2`)

- **`src/components/` (Interactive Hover Animations, Pathfinder & Slice UI — `v1.1.2`)**:
  - `RichHoverTooltip.tsx`: Global zero-overhead `RichHoverTooltipHost` (`data-rich-tip="..."`, pure CSS `@keyframes`, 0% CPU σε idle) για όλη την κύρια μπάρα εργαλείων, Σβήστρα (`Stroke` corner-tap / `Pixel` partial-side erase), Κείμενο (`α, β, γ` typing), Ορθογώνια Επιλογή (growing corner marquee), Ελεύθερο Λάσο (draw closed loop from 0 & catch), Χάρακα (γκρι-ασημί), Σκίτσα (θαυμαστικό → φύλλο), 3D Extrude (κύκλος → κύλινδρος), Mirror, +Βιβλιοθήκη, Z-Order, Align & Group.
  - `ShapeBooleanDropdown.tsx` & `src/utils/shapeBooleanOps.ts`: Photoshop/Illustrator Pathfinder (`Συνδυασμός ▾` για `2+` κλειστά σχήματα — Ένωση, Τομή, Αφαίρεση, Εκτός Τομής, Τεμαχισμός) με 72-pt ellipse sampling, καθαρά `twist: 888` evenodd holes χωρίς bridge lines, live hover animations & εγγυημένο Undo.
  - `ShapeSliceDropdown.tsx` & `src/utils/shapeSliceOps.ts`: `✂️ Κόψιμο ▾` για `1` κλειστό σχήμα — **🔪 Μαχαίρι** (γραμμή/γωνία), **¼ + ¾**, **Ίσα Κομμάτια (`2, 3, 4, 6, 8`)**, και 2-way toggle **`🍕 Κλειστά κομμάτια` | `〰️ Μόνο περίγραμμα`** (ανοιχτά τόξα) με hover animations & εγγυημένο Undo.
  - `src/stem-engines/ui/OcrHoverPreviewCard.tsx`: Photoshop-style live SVG hover mini-animations για `textOCR`, `Σ Math ▾` και `⚗ Chem ▾`.
- **`src/simulations/`** (`feature-simulations` chunk):
  - **`modules/gravity/` (Μηχανική & Βαρύτητα — Modular Engine `v1.1.2`)**:
    - `GravityLabEngine.ts`: Thin facade/barrel export για όλα τα υπο-άρθρα της Μηχανικής.
    - `gravityGeometry.ts`: `GRAVITY_PX_PER_M`, `getStrokeBounds`, **`getOrientedHalfExtents`** (OBB ακριβές μισό-πάχος & γωνία άξονα για περιστραμμένα σώματα σε ράμπες), `sampleStrokeToSegments` (3D Studio Floor/Wedge, 64-segment loop-the-loop & 90° Τεταρτοκύκλιο Bézier).
    - `gravitySceneBuilder.ts`: `buildGravitySceneFromStrokes` — αυτόματη ταξινόμηση δυναμικών σωμάτων με OBB πάχος & αρχική γωνία `initAngle`, auto-pin εγκλειόντων κύκλων, αυστηρό εκκρεμές μόνο σε ευθύγραμμα τμήματα με κέντρο σφαίρας στο άκρο, αρχικές ταχύτητες `u₀` & πολλαπλοί Stickmen (`F₁`, `F₂`, `ΣF`).
    - `gravityPhysicsStep.ts`: `stepGravityScene` & `computeGravityEnergyStats` — symplectic sub-stepping (8 substeps/frame), διατήρηση ενέργειας $E_0$, **Τροχιά-Οδηγός** (`guideRailEnabled`), καθαρή εκτόξευση & εφαπτομενική επανείσοδος, και **ομαλή περιστροφή προσανατολισμού (`b.angle`)** για ορθογώνια σώματα που κινούνται μεταξύ κεκλιμένων & οριζόντιων επιπέδων (`45° ↔ 0°`).
    - `gravityRenderer.ts`: `renderGravityOverlay` — fade-out ίχνος τροχιάς, διανύσματα **`u`**, **Δυνάμεις**, **`ΣF` / `ΣF = 0`**, απόκρυψη μπλε διανύσματος `u₀` όταν η Ταχύτητα είναι OFF (εμφάνιση μόνο της ζωντανής τιμής `u₀`), double-pulse flash highlight κατά το edit της `u₀`, και αχνή κόκκινη πινέζα εκτός περιγράμματος για καρφιτσωμένα δάπεδα.
    - `GravityControlPanel.tsx`: Αυτόνομο Dashboard UI Μηχανικής (Play/Pause, Reset ↺, **inline επεξεργασία `u = ... m/s`** με κλικ χωρίς αλλαγή μήκους του ζωγραφιστού βέλους, `📌 Ορισμός ως Ακίνητο Δάπεδο`, `Τροχιά-Οδηγός`, 3 checkboxes διανυσμάτων σε 1 σειρά, live μπάρες ενέργειας $K, U, E$).
    - `types.ts`: `GravityBodyState` (incl. `initAngle`, `angle`), `GravityLabConfig`, `GravitySegment`, `GravityEnergyStats`, `DEFAULT_GRAVITY_CONFIG`.
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
- **`src/data/` & `public/sketches/springs/`**: `seedIds.ts` (lightweight seed IDs για lazy φόρτωση του chunk `data-seeds`, `-888.7 KB` gzip στο αρχικό boot `b6f78d2`), `seeds/index.ts`, `stickersCatalog.ts` (iPadOS WebKit alpha-WebP bypass & 10 νέα μονόχρωμα χαρακτικά SVG στην κατηγορία **«Εφαρμογές Ελατηρίων»**: δυναμόμετρο, ποδήλατο, ζυγαριά, αμορτισέρ, όργανο γυμναστικής, στυλό, πλήκτρα, παιχνίδι, αποσβεστήρας ανελκυστήρα, στρώμα), & `vectors/` (**53 μουσειακές γκραβούρες Da-Vinci επιστημόνων** incl. Robert Hooke με εμπλουτισμένα tags).
- **`2D→3D, Σχήματα, Γωνίες & Χάρακας (v1.1.2)`**:
  - `src/utils/interactiveAngleTool.ts` + `NotePage.angleMarks` (`src/types/note.ts`): Διπλό κλικ/tap σε οποιαδήποτε κορυφή γωνίας (2 ευθείες ή πολύγωνο) → **μόνιμη απαλή πράσινη γωνία** με ακέραιη τιμή (`1°..180°`, χωρίς πλαίσιο/κουκκίδες, τετραγωνάκι στις `90°`), σύρσιμο πλευρών ως 100% ευθείες, ήπιο μαγνητικό κλείδωμα `±0.85°` στις **`30°, 45°, 60°, 90°, 120°`**, toggle off με 2ο διπλό κλικ & πλήρες Undo.
  - **Χάρακας**: ισχυρό `±10°` οριζόντιο/κατακόρυφο κλείδωμα + 1-click `0° / 90°` κουμπί. **Κόμβοι (`direct-node`)**: ήπιο `±3.1° / 8px` οριζόντιο/κατακόρυφο κλείδωμα για ευθείες/πολυγραμμές. **Διαφάνεια Γεμίσματος**: slider έως **`0%`** (100% συμπαγές).
  - **Cross-Device Sync & Βιβλιοθήκη (`v1.1.2`)**: Per-folder & per-subfolder persistent sorting (`bestnotes_folder_sort_map_v1`), compact notebook tabs, bulletproof clock-skew monotonic timestamps (`getMonotonicIsoTimestamp`), άμεσο push σε rename/μετακίνηση φακέλου/tags/αγαπημένα, και οριστική διαγραφή Κάδου με `deleteDoc` fallback ώστε διαγραμμένα αρχεία να μην κολλάνε ποτέ μεταξύ iPad/Mac.
  - **2D→3D & Μελάνι**: 3D σχήματα (`shaded-floor`, `shaded-wedge`, `shaded-arrow`, `shaded-sphere`, `shaded-cuboid`), 90° Τεταρτοκύκλιο, συντόμευση `A / Α` → Βελάκι, μαγνητικός δακτύλιος σε άκρα & εκκρεμές, διόρθωση iPad Safari PNG `(253..255 + 3) & 0xf8` overflow (`eaa967b`).
- **`src/utils/`**:
  - `geometryAndAlgorithms.ts`: Multi-key Gemini OCR failover (`Admin key → VITE_GV_PRIMARY → VITE_GV_A/B`) με χειρισμό HTTP `402` και κατάργηση σιωπηλής αλλοίωσης `beautifyHandwritingStrokes` σε αποτυχία OCR (`fcf607f`), επαναφορά `textOCR` & διαχωρισμός `Math → Κώδικας` (`c453bca`), Unicode PUA sentinels για μονάδες SI (`d0d00be`) & Unicode-safe ελληνικό LaTeX (`b6f78d2`).
  - `googleDrivePdfSync.ts`: Εξαγωγή PDF & `Live PDF` με Circuits Option A (καμία αυθαίρετη ανίχνευση σε μη καταχωρημένα σκίτσα, σεβασμός αποθηκευμένων per-circuit `switchClosed`/`showElectrons` & συνεχείς αλυσίδες σωματιδίων), font stack/weight parity + `document.fonts.load` preloading, Pendulum `forceSims` validation, απόκρυψη στατικών strokes, πλήρη διανυσματική ισοδυναμία & διόρθωση φόντου `Live PDF` (`c453bca`).
  - `perfTelemetry.ts` & `src/components/AdminPerfPill.tsx`: Μηδενικού κόστους Live Telemetry Απόδοσης (Sim Frame ms, Active Live Loops, Long Tasks `>50ms`, RAM & Canvas VRAM, 1-click Παύση Όλων).
- **`src/features/admin/`** (`feature-admin` chunk): `AdminPortal.tsx`, `AdminDashboard.tsx`, `components/AdminFirebaseBillingView.tsx`, `components/AdminPerformanceView.tsx`, `services/userStatsService.ts`, `services/trafficService.ts`.
- **`firestore.rules` & `index.html`**: Θωρακισμένοι κανόνες ασφαλείας Firestore και διόρθωση `_vcheck` redirect (`b6f78d2`).
