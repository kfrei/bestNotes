import React, { useEffect, useRef, useState } from 'react';

export type RichTipId =
  // Mirror & Library & 3D
  | 'mirror-h'
  | 'mirror-v'
  | 'add-library'
  | 'extrude-3d'
  // Z-Order
  | 'z-back'
  | 'z-down'
  | 'z-up'
  | 'z-front'
  // Align & Group
  | 'align-left'
  | 'align-center-x'
  | 'align-right'
  | 'align-top'
  | 'align-center-y'
  | 'align-bottom'
  | 'align-center-xy'
  | 'group-toggle'
  // Main Toolbar
  | 'tool-pen'
  | 'tool-eraser'
  | 'tool-highlighter'
  | 'tool-shape'
  | 'tool-text'
  | 'tool-rect-lasso'
  | 'tool-lasso'
  | 'tool-direct-node'
  | 'tool-tape'
  | 'tool-laser'
  | 'tool-import'
  | 'tool-paste'
  | 'tool-stickers'
  | 'tool-ruler'
  | 'tool-calc'
  | 'tool-layers'
  | 'tool-sim';

interface TipDef {
  title: string;
  subtitle: string;
  shortcut?: string;
}

const TIP_DEFS: Record<RichTipId, TipDef> = {
  'mirror-h': { title: 'Οριζόντιο Mirror', subtitle: 'Κατοπτρισμός Αριστερά ↔ Δεξιά' },
  'mirror-v': { title: 'Κατακόρυφο Mirror', subtitle: 'Κατοπτρισμός Πάνω ↕ Κάτω' },
  'add-library': { title: '+Βιβλιοθήκη', subtitle: 'Αποθήκευση στα «Δικά μου» σχήματα' },
  'extrude-3d': { title: '2D → 3D Μετατροπή', subtitle: 'Εξώθηση επιπέδου σχήματος σε 3D (π.χ. Κύλινδρος, Κύβος)' },
  'z-back': { title: 'Τέρμα Πίσω', subtitle: 'Μεταφορά πίσω από όλα τα αντικείμενα' },
  'z-down': { title: 'Πίσω (-1)', subtitle: 'Κατέβασμα κατά ένα επίπεδο' },
  'z-up': { title: 'Μπροστά (+1)', subtitle: 'Ανέβασμα κατά ένα επίπεδο' },
  'z-front': { title: 'Τέρμα Μπροστά', subtitle: 'Μεταφορά μπροστά από όλα τα αντικείμενα' },
  'align-left': { title: 'Στοίχιση Αριστερά', subtitle: 'Ευθυγράμμιση αριστερών άκρων' },
  'align-center-x': { title: 'Κέντρο X', subtitle: 'Οριζόντια στοίχιση στον ίδιο άξονα' },
  'align-right': { title: 'Στοίχιση Δεξιά', subtitle: 'Ευθυγράμμιση δεξιών άκρων' },
  'align-top': { title: 'Στοίχιση Πάνω', subtitle: 'Ευθυγράμμιση επάνω άκρων' },
  'align-center-y': { title: 'Κέντρο Y', subtitle: 'Κατακόρυφη στοίχιση στην ίδια γραμμή' },
  'align-bottom': { title: 'Στοίχιση Κάτω', subtitle: 'Ευθυγράμμιση κάτω άκρων' },
  'align-center-xy': { title: 'Κέντρο X+Y', subtitle: 'Ομόκεντρη ευθυγράμμιση σχημάτων' },
  'group-toggle': { title: 'Ομαδοποίηση (Group)', subtitle: 'Ένωση επιλεγμένων σε ενιαίο σύνολο' },
  'tool-pen': { title: 'Πένα / Μολύβι', subtitle: 'Ελεύθερη γραφή & Hold-to-Snap', shortcut: 'P / Π' },
  'tool-eraser': { title: 'Σβήστρα', subtitle: 'Σβήσιμο γραμμών ή τμημάτων', shortcut: 'E / Ε' },
  'tool-highlighter': { title: 'Υπογραμμιστής', subtitle: 'Ημιδιαφανής τονισμός κειμένου', shortcut: 'H / Η' },
  'tool-shape': { title: 'Σχήματα & Γεωμετρία', subtitle: 'Ευθείες, κύκλοι, βελάκια, τεταρτοκύκλιο', shortcut: 'O / Ο' },
  'tool-text': { title: 'Κείμενο', subtitle: 'Πλαίσια κειμένου, LaTeX & ελληνικές γραμματοσειρές', shortcut: 'T / Τ' },
  'tool-rect-lasso': { title: 'Ορθογώνια Επιλογή', subtitle: 'Σύρε ορθογώνιο πλαίσιο από τη γωνία για επιλογή' },
  'tool-lasso': { title: 'Λάσο Επιλογής', subtitle: 'Ελεύθερη επιλογή, μετακίνηση, OCR & συνδυασμός', shortcut: 'S / Σ' },
  'tool-direct-node': { title: 'Επεξεργασία Κόμβων', subtitle: 'Κίνηση κορυφών & καμπυλότητας Bézier' },
  'tool-tape': { title: 'Ταινία Απόκρυψης', subtitle: 'Κάλυψη & αποκάλυψη απαντήσεων με 1 κλικ' },
  'tool-laser': { title: 'Laser Παρουσίασης', subtitle: 'Κόκκινος δείκτης που σβήνει απαλά' },
  'tool-import': { title: 'Εισαγωγή Αρχείου', subtitle: 'Εικόνες, PDF ή .goodnotes / .bestnotes' },
  'tool-paste': { title: 'Επικόλληση', subtitle: 'Επικόλληση από το πρόχειρο (Paste)' },
  'tool-stickers': { title: 'Σκίτσα & Εικονίδια', subtitle: 'STEM εικονίδια, σκίτσα & 53 επιστήμονες' },
  'tool-ruler': { title: 'Χάρακας & Μοιρογνωμόνιο', subtitle: 'Μέτρηση αποστάσεων & ακριβείς ευθείες' },
  'tool-calc': { title: 'Επιστημονική Αριθμομηχανή', subtitle: 'Υπολογισμοί & αντιγραφή αποτελέσματος' },
  'tool-layers': { title: 'Επίπεδα (Layers)', subtitle: 'Οργάνωση, κλείδωμα & ορατότητα επιπέδων' },
  'tool-sim': { title: 'Προσομοιώσεις Φυσικής', subtitle: 'Μηχανική, Κυκλώματα, Ελατήρια, Δυνάμεις, Θερμότητα, Άτομο' },
};

function TipAnimationSvg({ id }: { id: RichTipId }) {
  return (
    <svg
      key={id}
      width="84"
      height="54"
      viewBox="0 0 96 62"
      className="shrink-0 overflow-visible rounded-lg bg-white border border-slate-200/80"
    >
      {/* Subtle notebook grid */}
      <g stroke="#e2e8f0" strokeWidth="0.6" opacity="0.65">
        <line x1="0" y1="15" x2="96" y2="15" />
        <line x1="0" y1="31" x2="96" y2="31" />
        <line x1="0" y1="47" x2="96" y2="47" />
        <line x1="24" y1="0" x2="24" y2="62" />
        <line x1="48" y1="0" x2="48" y2="62" />
        <line x1="72" y1="0" x2="72" y2="62" />
      </g>

      {id === 'mirror-h' && (
        <g>
          <line x1="48" y1="6" x2="48" y2="56" stroke="#ef4444" strokeWidth="1.4" strokeDasharray="3 2.5" />
          <polygon points="18,46 42,46 42,16" fill="#94a3b8" fillOpacity="0.28" stroke="#64748b" strokeWidth="1.4" strokeDasharray="2.5 2" />
          <g style={{ transformOrigin: '48px 31px', animation: 'rtFlipX 2.1s ease-in-out infinite' }}>
            <polygon points="18,46 42,46 42,16" fill="#2563eb" fillOpacity="0.65" stroke="#1d4ed8" strokeWidth="1.8" />
          </g>
        </g>
      )}

      {id === 'mirror-v' && (
        <g>
          <line x1="10" y1="31" x2="86" y2="31" stroke="#ef4444" strokeWidth="1.4" strokeDasharray="3 2.5" />
          <polygon points="26,26 70,26 56,10" fill="#94a3b8" fillOpacity="0.28" stroke="#64748b" strokeWidth="1.4" strokeDasharray="2.5 2" />
          <g style={{ transformOrigin: '48px 31px', animation: 'rtFlipY 2.1s ease-in-out infinite' }}>
            <polygon points="26,26 70,26 56,10" fill="#2563eb" fillOpacity="0.65" stroke="#1d4ed8" strokeWidth="1.8" />
          </g>
        </g>
      )}

      {id === 'add-library' && (
        <g>
          <rect x="52" y="18" width="32" height="28" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1.8" />
          <path d="M 52 24 L 64 24 L 67 20 L 84 20" fill="none" stroke="#d97706" strokeWidth="1.5" />
          <g style={{ animation: 'rtFlyToLib 2.1s ease-in-out infinite' }}>
            <polygon points="14,38 28,16 42,38" fill="#2563eb" fillOpacity="0.72" stroke="#1d4ed8" strokeWidth="1.6" />
          </g>
        </g>
      )}

      {id === 'extrude-3d' && (
        <g>
          <defs>
            <linearGradient id="rtCylBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.75" />
              <stop offset="42%" stopColor="#60a5fa" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.82" />
            </linearGradient>
          </defs>
          {/* Base ellipse (always anchored at bottom) */}
          <ellipse cx="48" cy="48" rx="22" ry="8" fill="#2563eb" fillOpacity="0.35" stroke="#1d4ed8" strokeWidth="1.6" />
          {/* Extruded cylinder walls growing upward */}
          <rect
            x="26"
            y="18"
            width="44"
            height="30"
            fill="url(#rtCylBody)"
            style={{ transformOrigin: '48px 48px', animation: 'rtCylGrow 2.2s ease-in-out infinite' }}
          />
          <line
            x1="26"
            y1="18"
            x2="26"
            y2="48"
            stroke="#1d4ed8"
            strokeWidth="1.7"
            style={{ transformOrigin: '26px 48px', animation: 'rtCylGrow 2.2s ease-in-out infinite' }}
          />
          <line
            x1="70"
            y1="18"
            x2="70"
            y2="48"
            stroke="#1d4ed8"
            strokeWidth="1.7"
            style={{ transformOrigin: '70px 48px', animation: 'rtCylGrow 2.2s ease-in-out infinite' }}
          />
          {/* Top ellipse rising smoothly from base to top */}
          <g style={{ animation: 'rtCylTopRise 2.2s ease-in-out infinite' }}>
            <ellipse cx="48" cy="48" rx="22" ry="8" fill="#bfdbfe" fillOpacity="0.92" stroke="#1d4ed8" strokeWidth="1.8" />
          </g>
        </g>
      )}

      {(id === 'z-back' || id === 'z-down' || id === 'z-up' || id === 'z-front') && (
        <g>
          {id === 'z-back' || id === 'z-down' ? (
            <>
              <g style={{ animation: 'rtZBlueDown 2.1s ease-in-out infinite' }}>
                <rect x="20" y="14" width="36" height="26" rx="3" fill="#2563eb" fillOpacity="0.88" stroke="#1d4ed8" strokeWidth="1.8" />
              </g>
              <rect x="38" y="24" width="36" height="26" rx="3" fill="#e2e8f0" stroke="#475569" strokeWidth="1.8" />
            </>
          ) : (
            <>
              <rect x="38" y="24" width="36" height="26" rx="3" fill="#e2e8f0" stroke="#475569" strokeWidth="1.8" />
              <g style={{ animation: 'rtZBlueUp 2.1s ease-in-out infinite' }}>
                <rect x="20" y="14" width="36" height="26" rx="3" fill="#2563eb" fillOpacity="0.88" stroke="#1d4ed8" strokeWidth="1.8" />
              </g>
            </>
          )}
        </g>
      )}

      {id === 'align-left' && (
        <g>
          <line x1="16" y1="8" x2="16" y2="54" stroke="#ef4444" strokeWidth="1.6" />
          <rect x="18" y="13" width="32" height="13" rx="2.5" fill="#334155" fillOpacity="0.8" style={{ animation: 'rtAlignL1 2s ease-in-out infinite' }} />
          <rect x="18" y="34" width="48" height="13" rx="2.5" fill="#2563eb" fillOpacity="0.82" style={{ animation: 'rtAlignL2 2s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'align-center-x' && (
        <g>
          <line x1="48" y1="8" x2="48" y2="54" stroke="#ef4444" strokeWidth="1.6" strokeDasharray="3 2" />
          <rect x="32" y="13" width="32" height="13" rx="2.5" fill="#334155" fillOpacity="0.8" style={{ animation: 'rtAlignCX1 2s ease-in-out infinite' }} />
          <rect x="24" y="34" width="48" height="13" rx="2.5" fill="#2563eb" fillOpacity="0.82" style={{ animation: 'rtAlignCX2 2s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'align-right' && (
        <g>
          <line x1="80" y1="8" x2="80" y2="54" stroke="#ef4444" strokeWidth="1.6" />
          <rect x="46" y="13" width="32" height="13" rx="2.5" fill="#334155" fillOpacity="0.8" style={{ animation: 'rtAlignR1 2s ease-in-out infinite' }} />
          <rect x="30" y="34" width="48" height="13" rx="2.5" fill="#2563eb" fillOpacity="0.82" style={{ animation: 'rtAlignR2 2s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'align-top' && (
        <g>
          <line x1="10" y1="12" x2="86" y2="12" stroke="#ef4444" strokeWidth="1.6" />
          <rect x="20" y="14" width="20" height="26" rx="2.5" fill="#334155" fillOpacity="0.8" style={{ animation: 'rtAlignT1 2s ease-in-out infinite' }} />
          <rect x="52" y="14" width="20" height="36" rx="2.5" fill="#2563eb" fillOpacity="0.82" style={{ animation: 'rtAlignT2 2s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'align-center-y' && (
        <g>
          <line x1="10" y1="31" x2="86" y2="31" stroke="#ef4444" strokeWidth="1.6" strokeDasharray="3 2" />
          <rect x="20" y="19" width="20" height="24" rx="2.5" fill="#334155" fillOpacity="0.8" style={{ animation: 'rtAlignCY1 2s ease-in-out infinite' }} />
          <rect x="52" y="13" width="20" height="36" rx="2.5" fill="#2563eb" fillOpacity="0.82" style={{ animation: 'rtAlignCY2 2s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'align-bottom' && (
        <g>
          <line x1="10" y1="50" x2="86" y2="50" stroke="#ef4444" strokeWidth="1.6" />
          <rect x="20" y="24" width="20" height="24" rx="2.5" fill="#334155" fillOpacity="0.8" style={{ animation: 'rtAlignB1 2s ease-in-out infinite' }} />
          <rect x="52" y="12" width="20" height="36" rx="2.5" fill="#2563eb" fillOpacity="0.82" style={{ animation: 'rtAlignB2 2s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'align-center-xy' && (
        <g>
          <line x1="48" y1="8" x2="48" y2="54" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2.5 2" />
          <line x1="14" y1="31" x2="82" y2="31" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2.5 2" />
          <rect x="24" y="15" width="48" height="32" rx="3" fill="#334155" fillOpacity="0.55" stroke="#1e293b" strokeWidth="1.6" style={{ animation: 'rtCenterXY1 2.1s ease-in-out infinite' }} />
          <circle cx="48" cy="31" r="11" fill="#2563eb" fillOpacity="0.8" stroke="#1d4ed8" strokeWidth="1.6" style={{ animation: 'rtCenterXY2 2.1s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'group-toggle' && (
        <g>
          <rect x="16" y="14" width="26" height="22" rx="3" fill="#334155" fillOpacity="0.7" />
          <circle cx="64" cy="36" r="14" fill="#2563eb" fillOpacity="0.7" />
          <rect
            x="11"
            y="9"
            width="72"
            height="44"
            rx="5"
            fill="none"
            stroke="#234978"
            strokeWidth="2"
            strokeDasharray="4 3"
            style={{ animation: 'rtFadePulse 2s ease-in-out infinite' }}
          />
        </g>
      )}

      {id === 'tool-pen' && (
        <path
          d="M 14 42 Q 30 14, 48 32 T 82 22"
          fill="none"
          stroke="#1b2a4a"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeDasharray="110"
          style={{ animation: 'rtDrawLine 2.1s ease-in-out infinite' }}
        />
      )}

      {id === 'tool-eraser' && (
        <g>
          <defs>
            <clipPath id="rtEraseClip">
              <rect x="0" y="0" width="96" height="62" style={{ animation: 'rtEraseClipWipe 2.2s ease-in-out infinite' }} />
            </clipPath>
          </defs>
          {/* Inked letters + underline that actually get wiped away as the eraser passes over */}
          <g clipPath="url(#rtEraseClip)">
            <text x="48" y="34" textAnchor="middle" fill="#1b2a4a" fontSize="16" fontWeight="700" fontFamily="Georgia, serif">
              Αβγ
            </text>
            <path d="M 18 42 Q 48 38, 78 42" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          {/* Pink eraser gliding across left -> right synchronously with the wipe clip */}
          <g style={{ animation: 'rtEraseSweep 2.2s ease-in-out infinite' }}>
            <rect x="14" y="21" width="18" height="22" rx="3.5" fill="#fda4af" stroke="#e11d48" strokeWidth="1.6" transform="rotate(-14 23 32)" />
            <rect x="15.5" y="22" width="15" height="7" rx="2" fill="#ffe4e6" transform="rotate(-14 23 32)" />
          </g>
        </g>
      )}

      {id === 'tool-highlighter' && (
        <g>
          <text x="48" y="36" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="700" fontFamily="Georgia, serif">
            Φυσική
          </text>
          <line
            x1="16"
            y1="32"
            x2="80"
            y2="32"
            stroke="#facc15"
            strokeWidth="12"
            strokeOpacity="0.48"
            strokeLinecap="round"
            strokeDasharray="70"
            style={{ animation: 'rtDrawLine 2.1s ease-in-out infinite' }}
          />
        </g>
      )}

      {id === 'tool-shape' && (
        <g>
          <rect x="14" y="16" width="26" height="26" rx="2.5" fill="#2563eb" fillOpacity="0.2" stroke="#2563eb" strokeWidth="1.8" style={{ animation: 'rtFadePulse 2.2s ease-in-out infinite' }} />
          <circle cx="64" cy="32" r="14" fill="#0ea5e9" fillOpacity="0.24" stroke="#0284c7" strokeWidth="1.8" />
        </g>
      )}

      {id === 'tool-text' && (
        <g>
          <rect x="14" y="16" width="68" height="30" rx="4" fill="#f8fafc" stroke="#2563eb" strokeWidth="1.4" strokeDasharray="3 2" />
          <text x="44" y="36" textAnchor="middle" fill="#1b2a4a" fontSize="15" fontWeight="700" fontFamily="Georgia, serif">
            Αβγ
          </text>
          <line x1="64" y1="22" x2="64" y2="40" stroke="#2563eb" strokeWidth="2" style={{ animation: 'rtBlink 1.1s steps(2) infinite' }} />
        </g>
      )}

      {id === 'tool-rect-lasso' && (
        <g>
          <circle cx="48" cy="31" r="10" fill="#2563eb" fillOpacity="0.55" />
          <g style={{ transformOrigin: '16px 11px', animation: 'rtRectSelectGrow 2.1s ease-in-out infinite' }}>
            <rect
              x="16"
              y="11"
              width="64"
              height="40"
              rx="2.5"
              fill="#2563eb"
              fillOpacity="0.1"
              stroke="#234978"
              strokeWidth="1.8"
              strokeDasharray="4.5 3"
            />
            <circle cx="16" cy="11" r="2.6" fill="#234978" />
            <circle cx="80" cy="51" r="2.6" fill="#2563eb" />
          </g>
        </g>
      )}

      {id === 'tool-lasso' && (
        <g>
          <circle cx="48" cy="31" r="10" fill="#2563eb" fillOpacity="0.55" />
          <ellipse
            cx="48"
            cy="31"
            rx="28"
            ry="18"
            fill="none"
            stroke="#234978"
            strokeWidth="1.8"
            strokeDasharray="5 3"
            style={{ animation: 'rtDashMarch 1.4s linear infinite' }}
          />
        </g>
      )}

      {id === 'tool-direct-node' && (
        <g>
          <path d="M 16 46 Q 48 8, 80 46" fill="none" stroke="#1b2a4a" strokeWidth="2.2" />
          <line x1="30" y1="24" x2="66" y2="24" stroke="#2563eb" strokeWidth="1.2" />
          <circle cx="30" cy="24" r="3" fill="#2563eb" />
          <circle cx="66" cy="24" r="3" fill="#2563eb" />
          <rect x="44" y="20" width="8" height="8" rx="1.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" style={{ animation: 'rtNodeBounce 2s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'tool-tape' && (
        <g>
          <text x="48" y="35" textAnchor="middle" fill="#1b2a4a" fontSize="13" fontWeight="700">
            E = mc²
          </text>
          <rect
            x="16"
            y="20"
            width="64"
            height="22"
            rx="4"
            fill="#f59e0b"
            stroke="#b45309"
            strokeWidth="1.5"
            style={{ animation: 'rtTapePeek 2.2s ease-in-out infinite' }}
          />
        </g>
      )}

      {id === 'tool-laser' && (
        <g>
          <path
            d="M 14 40 Q 42 14, 78 30"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeOpacity="0.6"
            strokeDasharray="90"
            style={{ animation: 'rtDrawLine 1.8s ease-in-out infinite' }}
          />
          <circle cx="78" cy="30" r="4.5" fill="#ef4444" style={{ animation: 'rtFadePulse 1.2s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'tool-import' && (
        <g>
          <rect x="26" y="32" width="44" height="18" rx="3" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.6" />
          <g style={{ animation: 'rtNodeBounce 1.8s ease-in-out infinite' }}>
            <line x1="48" y1="36" x2="48" y2="14" stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" />
            <polyline points="41,21 48,13 55,21" fill="none" stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      )}

      {id === 'tool-paste' && (
        <g>
          <rect x="30" y="14" width="36" height="36" rx="4" fill="#f8fafc" stroke="#475569" strokeWidth="1.8" />
          <rect x="40" y="10" width="16" height="7" rx="2" fill="#234978" />
          <rect x="38" y="25" width="20" height="16" rx="2" fill="#2563eb" fillOpacity="0.35" style={{ animation: 'rtFadePulse 1.8s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'tool-stickers' && (
        <g>
          <circle cx="34" cy="31" r="13" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.8" />
          <polygon points="62,16 66,27 78,27 68,34 72,46 62,39 52,46 56,34 46,27 58,27" fill="#fbbf24" stroke="#d97706" strokeWidth="1.4" style={{ transformOrigin: '62px 31px', animation: 'rtSpinSlow 5s linear infinite' }} />
        </g>
      )}

      {id === 'tool-ruler' && (
        <g transform="rotate(-14 48 31)">
          <rect x="12" y="22" width="72" height="18" rx="2.5" fill="#fef3c7" stroke="#b45309" strokeWidth="1.6" />
          {[22, 32, 42, 52, 62, 72].map((x) => (
            <line key={x} x1={x} y1="22" x2={x} y2="29" stroke="#b45309" strokeWidth="1.3" />
          ))}
        </g>
      )}

      {id === 'tool-calc' && (
        <g>
          <rect x="30" y="8" width="36" height="46" rx="5" fill="#f1f5f9" stroke="#334155" strokeWidth="1.8" />
          <rect x="35" y="13" width="26" height="10" rx="2" fill="#dbeafe" />
          <text x="58" y="21" textAnchor="end" fill="#1e40af" fontSize="8" fontWeight="700">9.81</text>
          {[37, 45, 53].map((x) =>
            [28, 36, 44].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill="#64748b" />)
          )}
        </g>
      )}

      {id === 'tool-layers' && (
        <g>
          <polygon points="48,38 78,47 48,56 18,47" fill="#cbd5e1" stroke="#475569" strokeWidth="1.4" />
          <polygon points="48,26 78,35 48,44 18,35" fill="#93c5fd" stroke="#2563eb" strokeWidth="1.4" />
          <polygon points="48,12 78,21 48,30 18,21" fill="#234978" fillOpacity="0.85" stroke="#0f172a" strokeWidth="1.4" style={{ animation: 'rtNodeBounce 2s ease-in-out infinite' }} />
        </g>
      )}

      {id === 'tool-sim' && (
        <g>
          <path d="M 16 16 Q 28 52, 78 46" fill="none" stroke="#1b2a4a" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="30" cy="36" r="6" fill="#2563eb" style={{ animation: 'rtSimRoll 2s ease-in-out infinite' }} />
        </g>
      )}
    </svg>
  );
}

export const RichHoverTooltipHost: React.FC = () => {
  const [activeTip, setActiveTip] = useState<{ id: RichTipId; x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const currentTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as HTMLElement | null)?.closest?.('[data-rich-tip]') as HTMLElement | null;
      if (!el) return;
      if (currentTargetRef.current === el) return;
      const tipId = el.getAttribute('data-rich-tip') as RichTipId | null;
      if (!tipId || !TIP_DEFS[tipId]) return;

      currentTargetRef.current = el;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (!document.body.contains(el)) return;
        const rect = el.getBoundingClientRect();
        const cardW = 248;
        const centerX = rect.left + rect.width / 2;
        const clampedX = Math.max(12 + cardW / 2, Math.min(window.innerWidth - 12 - cardW / 2, centerX));
        const belowY = rect.bottom + 8;
        const y = belowY + 86 > window.innerHeight ? Math.max(8, rect.top - 86) : belowY;
        setActiveTip({ id: tipId, x: clampedX, y });
      }, 260);
    };

    const onPointerOut = (e: PointerEvent) => {
      const target = currentTargetRef.current;
      if (!target) return;
      const rel = e.relatedTarget as Node | null;
      if (rel && target.contains(rel)) return;
      currentTargetRef.current = null;
      clearTimer();
      setActiveTip(null);
    };

    const onPointerDown = () => {
      currentTargetRef.current = null;
      clearTimer();
      setActiveTip(null);
    };

    document.addEventListener('pointerover', onPointerOver, true);
    document.addEventListener('pointerout', onPointerOut, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      clearTimer();
      document.removeEventListener('pointerover', onPointerOver, true);
      document.removeEventListener('pointerout', onPointerOut, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, []);

  if (!activeTip) return null;
  const meta = TIP_DEFS[activeTip.id];

  return (
    <div
      className="fixed z-[100001] pointer-events-none select-none"
      style={{
        left: activeTip.x,
        top: activeTip.y,
        transform: 'translateX(-50%)',
      }}
    >
      <style>{`
        @keyframes rtFlipX { 0%, 24% { transform: scaleX(1); } 55%, 85% { transform: scaleX(-1); } 100% { transform: scaleX(1); } }
        @keyframes rtFlipY { 0%, 24% { transform: scaleY(1); } 55%, 85% { transform: scaleY(-1); } 100% { transform: scaleY(1); } }
        @keyframes rtFlyToLib { 0%, 20% { transform: translate(0, 0) scale(1); opacity: 1; } 60%, 82% { transform: translate(36px, 4px) scale(0.55); opacity: 0.25; } 100% { transform: translate(0, 0) scale(1); opacity: 1; } }
        @keyframes rtZBlueDown { 0%, 22% { transform: translate(0, 0); opacity: 0.95; } 55%, 85% { transform: translate(8px, 6px); opacity: 0.5; } 100% { transform: translate(0, 0); opacity: 0.95; } }
        @keyframes rtZBlueUp { 0%, 22% { transform: translate(8px, 6px); opacity: 0.55; } 55%, 85% { transform: translate(-2px, -2px); opacity: 1; } 100% { transform: translate(8px, 6px); opacity: 0.55; } }
        @keyframes rtAlignL1 { 0%, 20% { transform: translateX(22px); } 55%, 86% { transform: translateX(0px); } 100% { transform: translateX(22px); } }
        @keyframes rtAlignL2 { 0%, 20% { transform: translateX(12px); } 55%, 86% { transform: translateX(0px); } 100% { transform: translateX(12px); } }
        @keyframes rtAlignCX1 { 0%, 20% { transform: translateX(-14px); } 55%, 86% { transform: translateX(0px); } 100% { transform: translateX(-14px); } }
        @keyframes rtAlignCX2 { 0%, 20% { transform: translateX(12px); } 55%, 86% { transform: translateX(0px); } 100% { transform: translateX(12px); } }
        @keyframes rtAlignR1 { 0%, 20% { transform: translateX(-20px); } 55%, 86% { transform: translateX(0px); } 100% { transform: translateX(-20px); } }
        @keyframes rtAlignR2 { 0%, 20% { transform: translateX(-10px); } 55%, 86% { transform: translateX(0px); } 100% { transform: translateX(-10px); } }
        @keyframes rtAlignT1 { 0%, 20% { transform: translateY(14px); } 55%, 86% { transform: translateY(0px); } 100% { transform: translateY(14px); } }
        @keyframes rtAlignT2 { 0%, 20% { transform: translateY(6px); } 55%, 86% { transform: translateY(0px); } 100% { transform: translateY(6px); } }
        @keyframes rtAlignCY1 { 0%, 20% { transform: translateY(-9px); } 55%, 86% { transform: translateY(0px); } 100% { transform: translateY(-9px); } }
        @keyframes rtAlignCY2 { 0%, 20% { transform: translateY(8px); } 55%, 86% { transform: translateY(0px); } 100% { transform: translateY(8px); } }
        @keyframes rtAlignB1 { 0%, 20% { transform: translateY(-14px); } 55%, 86% { transform: translateY(0px); } 100% { transform: translateY(-14px); } }
        @keyframes rtAlignB2 { 0%, 20% { transform: translateY(-6px); } 55%, 86% { transform: translateY(0px); } 100% { transform: translateY(-6px); } }
        @keyframes rtCenterXY1 { 0%, 20% { transform: translate(-8px, -5px); } 55%, 86% { transform: translate(0, 0); } 100% { transform: translate(-8px, -5px); } }
        @keyframes rtCenterXY2 { 0%, 20% { transform: translate(10px, 6px); } 55%, 86% { transform: translate(0, 0); } 100% { transform: translate(10px, 6px); } }
        @keyframes rtFadePulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
        @keyframes rtDrawLine { 0%, 15% { stroke-dashoffset: 110; } 60%, 88% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 110; } }
        @keyframes rtEraseSweep { 0%, 14% { transform: translateX(-6px); opacity: 0.95; } 64%, 82% { transform: translateX(58px); opacity: 0.95; } 90% { transform: translateX(62px); opacity: 0; } 100% { transform: translateX(-6px); opacity: 0; } }
        @keyframes rtEraseClipWipe { 0%, 14% { transform: translateX(0px); } 64%, 88% { transform: translateX(74px); } 92%, 100% { transform: translateX(0px); } }
        @keyframes rtBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes rtDashMarch { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -16; } }
        @keyframes rtRectSelectGrow { 0%, 14% { transform: scale(0.18); opacity: 0.7; } 56%, 86% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.18); opacity: 0.7; } }
        @keyframes rtNodeBounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes rtTapePeek { 0%, 25% { opacity: 0.96; } 55%, 82% { opacity: 0.16; } 100% { opacity: 0.96; } }
        @keyframes rtSpinSlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes rtSimRoll { 0%, 100% { transform: translate(-10px, -16px); } 50% { transform: translate(38px, 6px); } }
        @keyframes rtCylGrow { 0%, 20% { transform: scaleY(0); opacity: 0; } 55%, 85% { transform: scaleY(1); opacity: 1; } 100% { transform: scaleY(0); opacity: 0; } }
        @keyframes rtCylTopRise { 0%, 20% { transform: translateY(0px); } 55%, 85% { transform: translateY(-30px); } 100% { transform: translateY(0px); } }
      `}</style>
      <div className="w-[248px] rounded-xl bg-[#fdfbf7]/96 backdrop-blur-xl border border-[#dfd8cb] shadow-[0_14px_34px_-8px_rgba(15,23,42,0.22)] p-2 flex items-center gap-2.5">
        <TipAnimationSvg id={activeTip.id} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11.5px] font-bold text-[#1b2a4a] truncate">{meta.title}</span>
            {meta.shortcut && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#ece7dc] text-[#234978] shrink-0">
                {meta.shortcut}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{meta.subtitle}</p>
        </div>
      </div>
    </div>
  );
};
