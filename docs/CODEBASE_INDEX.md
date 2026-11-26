# 🗺️ BestNotes / ExplainBoards — Master Codebase Index & Χάρτης Ενοτήτων (`v1.1.5`)

> **Έκδοση:** **`precisionNodes & inclineFlex v1.1.5`** (26 Νοεμβρίου 2026)  
> **Συγχρονισμός:** Το ευρετήριο αυτό διατηρείται 100% ταυτόσημο σε [`CODEBASE_INDEX.md`](./CODEBASE_INDEX.md) και [`docs/CODEBASE_INDEX.md`](./docs/CODEBASE_INDEX.md).  
> **Κανόνας Απόδοσης (`Zero-Slowdown Charter`):** Κάθε προσομοίωση/διάγραμμα πρέπει να συμμορφώνεται με το [`docs/SIMULATION_GUIDELINES.md`](./docs/SIMULATION_GUIDELINES.md) (`0.00 ms / 0 RAF` σε παύση, `< 4.0 ms` ενεργό, lazy `simCanvas`, viewport culling, αυτόματο πάγωμα όταν κλείνει το Sim ή αλλάζει σελίδα/σημείωση).  
> **Υποχρεωτικός Κανόνας Αναίρεσης (`Undo-First Guarantee`):** ΚΑΘΕ feature που προσθέτει, τροποποιεί, συνδυάζει, κόβει ή διαγράφει strokes, σχήματα, εικόνες, γωνίες ή κείμενα **ΠΡΕΠΕΙ** να υποστηρίζει 100% 1-click Undo (`suppressNextUndoRecordRef.current = false` πριν το `updateActivePage(..., true)`).

---

## 🧭 1. Πίνακας Πλοήγησης & Χάρτης Ενοτήτων του `src/App.tsx` (~79.000 γραμμές)

| Ενότητα | Γραμμές (περίπου) | Περιγραφή & Βασικά Σύμβολα |
| :--- | :---: | :--- |
| **Imports, Constants & Helper Types** | `L1 – L1464` | Imports domains, `getMonotonicIsoTimestamp`, constants χαρτιού/πλέγματος (`A4_GRID_STEP_PX`). |
| **App State, Refs & Plans/Quotas** | `L1465 – L5856` | `export default function App()`, state editor/library/sim, **Subscription Plans & AI Entitlements** (`L1651`), Undo/Redo stacks, IndexedDB hydration. |
| **Cloud Sync, Firestore & Showcase** | `L5857 – L14226` | `pushNotebookToCloudTracked` (`L5857`), `10s` idle debounce, instant flush (delete/rename/move/tags), **Public Showcase `Σημειώσεις`** (`L7622`), Google Drive Delta Sync. |
| **Static Canvas 2D Renderer** | `L14227 – L22087` | `renderStaticScene` (`L14354`), rendering strokes/shapes, `twist === 888` subpath breaks (`L13982`), `angleMarks`, 3D shapes, images & `KaTeX` overlays. |
| **Simulation Helpers (Circuits / Springs / Forces / Atom)** | `L22088 – L30905` | Named Circuits (`L22089`), Springs (`L22359`), `getValidForceSims` (`L22404`), **`attachBlockToInclineForSim` (`L22976`)** & **`registerOrActivateForceSimFromLasso` (`L23171`)** (ανοιχτό `∠` + με/χωρίς σώμα), Atom/Bohr (`L24836`). |
| **60/120fps Simulation Overlays** | `L30906 – L38443` | Circuit Overlay (`L30907`), Spring/AAT Overlay (`L32377`), Force/Incline/Pendulum Overlays (`L34018`, `incline` at `L34692`), Atom/3D Molecule Overlay (`L35673`). |
| **Live 16:9 TV Sync Engine** | `L38444 – L41386` | WebRTC-first P2P (`<15ms`, 0 Firestore writes) + Firestore fallback, πάντα OFF στην εκκίνηση. |
| **Pointer Events, Precision Nodes & Gestures** | `L41387 – L54957` | `handlePointerDown` (`L41387`), `handlePointerMove` (`L45623`, `incline-peak` drag με `twist: 888` at `L46665`), `handlePointerUp` (`L51665`), **Precision Nodes 1000% zoom**, magnetic midpoint `+`, symmetric Bézier (`⇄` / `Shift`), Retina Liquid Glass node capsule. |
| **Global Keyboard Shortcuts (EN/GR)** | `L54958 – L59412` | `GLOBAL KEYBOARD SHORTCUTS` (`L54958`), εργαλεία `P/E/O/L/F/S/C/N/I/R/H/T/G/A`, Micro-Nudge `↑↓←→`, Copy/Paste/Duplicate/Undo/Redo. |
| **Top Bar & Library View (GPU FLIP)** | `L59413 – L64593` | Top Navy Bar (`L59414`), Profile Dropdown με Google Avatar & Animated BG selector, **Library Icons/List View** (`L62604`) με GPU FLIP `scaleX` sidebar animation & 6-column sleek folder cards. |
| **Live PDF Bar & Main Toolbars** | `L64594 – L67920` | Live PDF Player (`L64595`), Light Main Toolbar (`L64687`), Contextual Sub-Toolbars, OCR (`textOCR`, `Σ Math ▾`, `⚗ Chem ▾`), Pathfinder & Slice dropdowns. |
| **Dual-Canvas 120Hz Workspace & Sim Panel** | `L67921 – L77642` | Dual-Canvas Workspace (`L67922`), Floating Dashboards (Forces/Incline UI at `L71040`, Circuits, Springs, Gravity, Heat, Atom), Layers, Periodic Table. |
| **Multi-Page Thumbnail Grid & Modals** | `L77643 – EOF` | Virtualized Multi-Page Grid (`L77644`) για 170+ σελίδες PDF, Upgrade/Export/Settings modals. |

---

## 🏛️ 2. Πίνακας Πλοήγησης Domains & Αρχείων

| Domain / Φάκελος | Chunk / Loading | Βασικά Αρχεία & Αρμοδιότητες |
| :--- | :--- | :--- |
| **`src/simulations/`** | `feature-simulations` | Πυρήνας προσομοιώσεων (`core/`, `registry/`, `ui/`) + Modules: `circuits/`, `gravity/`, `heat/`, `mechanics/pendulum/`. |
| **`src/features/admin/`** | `feature-admin` (lazy) | `AdminPortal`, `AdminDashboard`, `AdminUsersTable`, `AdminPlansView`, `AdminFirebaseBillingView`, `AdminUsageCharts`, `AdminOcrAnalyticsView`, `AdminPerformanceView`, `AdminTrafficView`. |
| **`src/features/plans/`** | Core | `types.ts`, `quotaLogic.ts`, `plansService.ts`, `components/LiquidUpgradeModal.tsx` (`ULTRA`, `PLUS`, `FREE`, Guest). |
| **`src/features/library/`** | Core | `RecentlyOpenedStrip.tsx`, `LibraryDeleteModal.tsx`, `FolderEditModal.tsx`, `constants/folderPresets.tsx`. |
| **`src/services/storage/`** | Core | `indexedDb.ts` (singleton IDB), `firestoreSync.ts` (chunk diffing), `localAndIdbSync.ts`, `storageCleaners.ts` (240Hz lossless compaction), `publicShowcaseLogic.ts`, `publicShowcaseSync.ts`. |
| **`src/stem-engines/`** | Core | `ocr/OcrPrompts.ts`, `chemistry/periodicTableData.ts`, `math/physicsEquationsLibrary.ts`, `ui/LassoOcrButtons.tsx`, `ui/OcrHoverPreviewCard.tsx`. |
| **`src/canvas-tools/`** | Core | `palette/colorPresets.ts`, `tools/toolCatalog.ts`, `geometry/index.ts`. |
| **`src/components/`** | Core | `LandingPage.tsx`, `LibraryAmbientArcDial.tsx`, `LibraryNoteMiniThumb.tsx`, `PageHeatSimsThumbCanvas.tsx`, `RichHoverTooltip.tsx`, `ShapeBooleanDropdown.tsx`, `ShapeSliceDropdown.tsx`, `WarmStudioToggle.tsx`, `AdminPerfPill.tsx`, `modals/` (`NativeShareSheetModal`, `WaveDiagramChoiceModal`). |
| **`src/utils/`** | Core | `geometryAndAlgorithms.ts` (Gemini 7-model chain + geometry), `googleDrivePdfSync.ts` (PDF/Live PDF/Drive Sync), `liveTvSync.ts`, `extrude3DRenderer.ts`, `goodnotesParser.ts`, `pdfAndImageImporter.ts`, `interactiveAngleTool.ts`, `shapeBooleanOps.ts`, `shapeSliceOps.ts`, `notebookStorageSize.ts`, `perfTelemetry.ts`, `libraryUiHelpers.ts`, `simBenchmarkHud.ts` *(+ 11 `*Seed.ts` backward-compatibility forwarding shims προς `src/data/seeds/`)*. |
| **`src/data/`** | `data-seeds` (lazy) | `seedIds.ts` (lightweight IDs, `-888.7 KB` gzip boot), `seeds/` (11 εκπαιδευτικά τετράδια), `vectors/` (`physics`, `chemistry`, `biology`, `geography`, `dimotiko` Native SVGs), `mindMapsCatalog.ts` (1.154 WebP), `stickersCatalog.ts` (incl. `public/sketches/springs/`), `stickFiguresSvg.ts`. |
| **`functions/src/`** | Cloud Functions (`europe-west1`) | `index.ts`: Drive OAuth token refresh (`exchangeDriveAuthCode`, `getFreshDriveAccessToken`) & `getAdminFirebaseUsageStats` (Cloud Monitoring Firestore, Hosting Storage GB, Functions, cross-project Gemini API). |
| **Root Config & Rules** | Deploy | `firestore.rules` (security rules, `app_plans`, `public_showcase_*`, `daily_traffic` incl. `ocrApi1Count/2/CustomKey`), `firebase.json`, `vite.config.ts`, `index.html`. |

---

## 🧩 3. Αναλυτικό Ευρετήριο ανά Έκδοση & Domain

### 3.1 Precision Nodes, Open/Blockless Incline & GPU FLIP Library (`v1.1.5`)
- **Precision Nodes (`src/App.tsx`):** Zoom ακριβείας έως `1000%`, σταθερού screen-space μεγέθους handles με ασφαλή hit-priority, Retina Liquid Glass DOM κουμπιά (0 blur), έξυπνη collision-free τοποθέτηση κάψουλας, μαγνητικό κόκκινο `+` στο μέσο ευθύγραμμων τμημάτων, κλείδωμα μεσοκαθέτου, ανεξάρτητα vs συμμετρικά Bézier handles (`⇄` toggle / `Shift`).
- **Ευέλικτο Κεκλιμένο Επίπεδο (`src/App.tsx`, `src/utils/googleDrivePdfSync.ts`):** Αναγνώριση ανοιχτής γωνίας `∠` (2 ευθείες ή 1 polyline) και κλειστών τριγώνων, με ή χωρίς σώμα (αυτόματη δημιουργία `incline-block` αν λείπει, αναγνώριση rotated polygons/quads και διατήρηση `tCenter` αν υπάρχει), διατήρηση ανοιχτής μορφής `twist: 888` σε render, `incline-peak` drag & PDF export, 100% Undo.
- **Library Sidebar & Rules (`src/App.tsx`, `firestore.rules`):** GPU FLIP `scaleX` push/pull animation sidebar χωρίς end-snap jump, στενότερες κάρτες φακέλων (έως 6 στήλες desktop), και `ocrApi1Count`/`ocrApi2Count`/`ocrCustomKeyCount` στο `daily_traffic`.

### 3.2 Animated Library Backgrounds & Profile Polish (`v1.1.3`)
- **`src/components/LibraryAmbientArcDial.tsx` & `src/index.css`:** 3 επιλογές φόντου Βιβλιοθήκης (`localStorage`: `bestnotes_library_bg_effect_v1`): **`arcs` (Δακτύλιοι)** — Pure-CSS GPU-only (`0% JS / 0 RAF`) με δυναμική τρίχρωμη παλέτα ανά φάκελο; **`plexus` (Κόμβοι)** — 3D προοπτικό ελαστικό πλέγμα (`30×19` desktop / `18×14` mobile, 0 allocations/frame, 30fps cap); **`off`**. Πλήρες unmount εκτός Βιβλιοθήκης.
- **User Profile Dropdown (`src/App.tsx`):** Google Login avatar (`photoURL` + `referrerPolicy="no-referrer"` + fallback), `Αλλαγή Λογαριασμού` κάτω από `Logout`, επιλογέας `Κινούμενο Φόντο`.

### 3.3 Plans, Public Showcase, Admin Panel & Firebase Cost Optimization (`v1.1.2`)
- **`src/features/plans/`:** `ULTRA` / `PLUS` / `FREE` + custom plans (`app_plans/{planId}`), Guest Mode (1 αρχείο / 3 σελίδες / 0 AI / no save), `LiquidUpgradeModal.tsx`.
- **`src/services/storage/publicShowcaseLogic.ts` & `publicShowcaseSync.ts`:** Δημόσιος read-only φάκελος **`Σημειώσεις`**, 8-note Admin auto-seed, sandbox reset, IndexedDB cache.
- **`src/features/admin/` (`feature-admin`):** `AdminPlansView`, `AdminUsersTable` (plan switcher), `AdminFirebaseBillingView`, `AdminUsageCharts` (7d Firebase Build SVG charts + cross-project Gemini API `FreiderikosK` + Hosting Storage 10 GB), `AdminOcrAnalyticsView` (`1.100 RPD` stacked bar: 80 Flash + 1.020 Lite), `AdminPerformanceView`.
- **Sync & Hosting:** `persistentLocalCache`, `10s` idle debounce, chunk-level diffing, WebRTC-first Live TV, μοναδικό Hosting site (`explainboards.web.app`, `€0,00/μήνα`).

### 3.4 Pathfinder, Slice, Hover Animations, Interactive Angles & Simulations (`v1.02 – v1.1.2`)
- **`src/components/RichHoverTooltip.tsx` & `src/stem-engines/ui/OcrHoverPreviewCard.tsx`:** Pure CSS `@keyframes` (`0% CPU` σε idle) Photoshop-style live SVG hover animations σε όλη τη μπάρα εργαλείων & OCR μενού.
- **`ShapeBooleanDropdown.tsx` / `shapeBooleanOps.ts` & `ShapeSliceDropdown.tsx` / `shapeSliceOps.ts`:** Pathfinder (`Συνδυασμός ▾`: Ένωση, Τομή, Αφαίρεση, Εκτός Τομής, Τεμαχισμός με `twist: 888`) & `✂️ Κόψιμο ▾` (Μαχαίρι, `¼+¾`, Ίσα Κομμάτια, Κλειστά / Μόνο περίγραμμα).
- **`src/utils/interactiveAngleTool.ts`:** Διπλό κλικ/tap σε κορυφή → μόνιμη πράσινη γωνία (`page.angleMarks`, `1°..180°`, snap `±0.85°` στις `30°/45°/60°/90°/120°`, 100% Undo).
- **`src/simulations/modules/gravity/`:** `GravityLabEngine`, `gravityGeometry` (`getOrientedHalfExtents` OBB), `gravitySceneBuilder`, `gravityPhysicsStep` (symplectic sub-stepping, guide rail, smooth `45° ↔ 0°` rotation), `gravityRenderer`, `GravityControlPanel` (inline edit `u₀`).
- **`src/simulations/modules/circuits/`:** `circuitEngine` (`O(1)` LRU Kirchhoff cache, `m.active` για `V_πηγής`, `bulb-bridge`), `circuitHelpers`, `CircuitControlPanel`, `CircuitSimulationModule`.
- **`src/simulations/modules/heat/`:** `heatPhysicsEngine`, `HeatRenderer`, `useHeatSimulation`, `HeatControlPanel`, `HeatLiquidConfigModal`, `HeatGraphChoiceModal`, `HeatSketchRecognizer`.
- **`src/simulations/modules/mechanics/pendulum/` & `ui/`:** `pendulumPhysics`, `PendulumModule`, `StopwatchWidget` (`1x/2x/5x`), `FullscreenLaserCanvas`, `SimulationObjectRibbon`.
