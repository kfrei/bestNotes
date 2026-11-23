---
trigger: always_on
description: Permanent project rules, deploy workflow, architecture invariants, and preferences for BestNotes / ExplainBoards.
---

# BestNotes / ExplainBoards — Permanent Project Rules

## 1. Communication
- Keep responses concise in **Greek**, formatted in GitHub-style Markdown with clickable `file://` links to referenced files/lines.

## 2. Build, Dual-Remote Git Push & Single-Site Hosting Deploy
- Always verify with `npm run build` (`tsc -b && vite build`) — and `npm --prefix functions run build` whenever `functions/` changes — before committing.
- Always stage files **explicitly** (`git add <files>`); never run blind `git add -A`.
- **ALWAYS push to BOTH GitHub remotes**:
  - `git push origin main` (`https://github.com/kfrei/bestNotes.git`)
  - `git push explainboards main` (`git@github-freiderikosk:freiderikosk/explainboards.git`)
- **Deploy Firebase Hosting ONLY to `explainboards`** (`https://explainboards.web.app`):
  ```bash
  FIREBASE_HOSTING_UPLOAD_CONCURRENCY=4 /usr/local/bin/firebase deploy --only hosting:explainboards
  ```
  *(Do NOT clone to `mybestnotes` or `bestnotes-2026` — `mybestnotes` was deleted and `bestnotes-2026` is intentionally disabled to stay under the 10 GB free tier.)*

## 3. Documentation & Indexing Rule
- Whenever asked to update documentation or codebase indexing, **ALWAYS update `README.md` FIRST** (it is the GitHub repo homepage), alongside `CODEBASE_INDEX.md` and `docs/CODEBASE_INDEX.md` (plus `SHORTCUTS.md` / `docs/SIMULATIONS_GUIDE.md` when relevant).

## 4. Undo-First Guarantee
- Every feature that adds, modifies, merges, slices, or deletes strokes, shapes, images, texts, or `angleMarks` **MUST** support 100% 1-click Undo: always reset `suppressNextUndoRecordRef.current = false` before `updateActivePage(..., true)` (or explicitly push an Undo snapshot).

## 5. UI Consistency, Zero-Slowdown & Fluidity Invariants
- **UI & Liquid Glass Consistency:** Every new button, modal, dropdown, or panel MUST follow the existing BestNotes / ExplainBoards design language — warm cream/paper **Liquid Glass** (`ipados-liquid-glass`, `bg-[#fdfbf7]/90`, `backdrop-blur-2xl`, soft `#dfd8cb` / `border-white/85` borders), deep navy accents (`#1b2a4a` / `#234978`), crisp monochrome icons, matching button sizes/radii (`rounded-xl`/`rounded-2xl`/`rounded-3xl`) with adjacent controls, and clean Greek labels.
- **120Hz Writing, Scroll & Responsiveness:** Never degrade Apple Pencil / stylus drawing latency, touch/trackpad scrolling, pinch-zoom, or UI responsiveness. Avoid React state re-renders inside hot pointer/draw/drag loops, keep canvas rendering allocation-light, and maintain `0.00 ms / 0 RAF` when idle (use pure CSS `@keyframes` for hover tooltips).
- **Simulations:** The `Sim` panel and all simulations MUST start closed/paused on startup and auto-freeze immediately when `Sim` closes, when returning to Library, or when switching notebooks/pages (preserving static snapshots on canvas).
- **Live TV 16:9:** MUST always start OFF (`false`) on startup (never auto-resume from `sessionStorage`) and use WebRTC-first (0 Firestore writes while P2P DataChannels are open).

## 6. Protected Prompts & Firestore Security Rules
- **NEVER modify the `textOCR` prompt** inside `transcribeHandwrittenStrokesWithGemini` (`src/utils/geometryAndAlgorithms.ts`).
- **Gemini AI Chain:** Use pure Gemini models only (no Groq/Mistral fallbacks), cascading from `gemini-4-hydrogen` → `3.8 Flash` → `3.6 Flash` → `3 Flash` → `3.5 Flash Lite` (500 RPD) → `3.1 Flash Lite` (500 RPD) → `2.5 Flash`.
- **Firestore Rules (`firestore.rules`):** Always delegate any `firestore.rules` edits to the `firestore-rules-author` specialist subagent and verify with `firebase deploy --only firestore:rules --dry-run`.

## 7. React 19 & Cross-Device Sync Invariants
- Never populate an outer variable inside a functional `setNotebooks(prev => ...)` updater and read it synchronously afterward (React 19 defers updaters). Compute payloads synchronously from `notebooksRef.current` before calling `setNotebooks` and `pushNotebookToCloudTracked`.
- Always use `getMonotonicIsoTimestamp` for Firestore notebook writes so Mac ↔ iPad clock skew never causes `permission-denied` rejections.
- Preserve instant cross-device sync on delete, Recycle Bin purge, rename, folder move, tags, favorites, page/notebook switch, exit, and tab hide — while keeping idle stroke debounce at `10s` with `persistentLocalCache` and chunk-level diffing to stay well inside the Firebase Free Tier (`€0,00/μήνα`).

## 8. Admin, Plans & Public Showcase Context
- Admin email: `freiderikoskostas@gmail.com` (`ADMIN_EMAIL`, always compared case-insensitively).
- Subscription plans (`ULTRA`, `PLUS`, `FREE` + custom plans) are stored in Firestore `app_plans/{planId}`; user plan assignments live in `user_profiles/{uid}.planId` (Admin-writable only).
- Public read-only demo folder (`Σημειώσεις`) lives in `public_showcase_meta/config` and `public_showcase_notebooks` (public read, Admin-only write; excluded from user file/MB quotas).
