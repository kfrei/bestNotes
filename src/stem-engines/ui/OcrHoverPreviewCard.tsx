import React from 'react';

export type OcrHoverPreviewMode =
  | 'text'
  | 'equation'
  | 'graph'
  | 'polygon'
  | 'code'
  | 'reaction'
  | 'molecule3d'
  | 'atom2d';

interface PreviewMeta {
  title: string;
  subtitle: string;
  badge: string;
}

const PREVIEW_META: Record<OcrHoverPreviewMode, PreviewMeta> = {
  text: {
    title: 'textOCR',
    subtitle: 'Χειρόγραφο κείμενο → Καθαρά γράμματα',
    badge: 'Aa',
  },
  equation: {
    title: 'Εξίσωση',
    subtitle: 'Χειρόγραφος τύπος → Τυπωμένο LaTeX',
    badge: 'Σ',
  },
  graph: {
    title: 'Διάγραμμα',
    subtitle: 'Τύπος συνάρτησης → Σύστημα αξόνων',
    badge: 'f(x)',
  },
  polygon: {
    title: 'Πολύγωνο',
    subtitle: 'Ξεχωριστές ευθείες → Κλειστό σχήμα',
    badge: '⬠',
  },
  code: {
    title: 'Κώδικας',
    subtitle: 'Ψευδογλώσσα ΑΕΠΠ με αυτόματες εσοχές',
    badge: '</>',
  },
  reaction: {
    title: 'Αντιδράσεις',
    subtitle: 'Αναγνώριση χημικής αντίδρασης & ατόμων',
    badge: '→',
  },
  molecule3d: {
    title: '3D Μόριο',
    subtitle: 'Διαδραστικό 3D μόριο με νέφη φορτίου',
    badge: '3D',
  },
  atom2d: {
    title: '2D Άτομο',
    subtitle: 'Πυρήνας & τροχιές ηλεκτρονίων Bohr',
    badge: 'e⁻',
  },
};

export const OcrHoverPreviewCard: React.FC<{ mode: OcrHoverPreviewMode }> = ({ mode }) => {
  const meta = PREVIEW_META[mode];

  return (
    <div className="mt-1 pt-1.5 border-t border-[#e5dfd3]">
      <div className="relative rounded-xl bg-[#fdfbf7] border border-[#e5dfd3] overflow-hidden flex items-center justify-between px-2.5 py-2 gap-2.5">
        <style>{`
          @keyframes ocrHandFade {
            0%, 24% { opacity: 0.92; transform: translateY(0px); }
            52%, 88% { opacity: 0.12; transform: translateY(-2px); }
            100% { opacity: 0.92; transform: translateY(0px); }
          }
          @keyframes ocrCleanIn {
            0%, 24% { opacity: 0.08; transform: translateY(3px) scale(0.96); }
            52%, 88% { opacity: 1; transform: translateY(0px) scale(1); }
            100% { opacity: 0.08; transform: translateY(3px) scale(0.96); }
          }
          @keyframes ocrScanBeam {
            0% { transform: translateX(-18px); opacity: 0; }
            20% { opacity: 0.85; }
            60% { transform: translateX(96px); opacity: 0.85; }
            75%, 100% { transform: translateX(104px); opacity: 0; }
          }
          @keyframes ocrDrawCurve {
            0%, 15% { stroke-dashoffset: 110; }
            55%, 88% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 110; }
          }
          @keyframes ocrPolySnap1 {
            0%, 22% { transform: translate(-6px, -4px) rotate(-6deg); }
            55%, 88% { transform: translate(0px, 0px) rotate(0deg); }
            100% { transform: translate(-6px, -4px) rotate(-6deg); }
          }
          @keyframes ocrPolySnap2 {
            0%, 22% { transform: translate(6px, -3px) rotate(5deg); }
            55%, 88% { transform: translate(0px, 0px) rotate(0deg); }
            100% { transform: translate(6px, -3px) rotate(5deg); }
          }
          @keyframes ocrPolySnap3 {
            0%, 22% { transform: translate(5px, 5px) rotate(-4deg); }
            55%, 88% { transform: translate(0px, 0px) rotate(0deg); }
            100% { transform: translate(5px, 5px) rotate(-4deg); }
          }
          @keyframes ocrPolySnap4 {
            0%, 22% { transform: translate(-5px, 5px) rotate(6deg); }
            55%, 88% { transform: translate(0px, 0px) rotate(0deg); }
            100% { transform: translate(-5px, 5px) rotate(6deg); }
          }
          @keyframes ocrPolyFill {
            0%, 42% { opacity: 0; }
            62%, 88% { opacity: 0.22; }
            100% { opacity: 0; }
          }
          @keyframes ocrCodeIndent {
            0%, 22% { transform: translateX(0px); opacity: 0.55; }
            52%, 88% { transform: translateX(10px); opacity: 1; }
            100% { transform: translateX(0px); opacity: 0.55; }
          }
          @keyframes ocrChemSlide {
            0%, 20% { transform: translateX(-5px); opacity: 0.5; }
            55%, 88% { transform: translateX(0px); opacity: 1; }
            100% { transform: translateX(-5px); opacity: 0.5; }
          }
          @keyframes ocrMolFloat {
            0%, 100% { transform: translateY(0px) rotate(-4deg); }
            50% { transform: translateY(-3px) rotate(5deg); }
          }
          @keyframes ocrOrbitSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <svg
          key={mode}
          width="92"
          height="58"
          viewBox="0 0 104 66"
          className="shrink-0 overflow-visible rounded-lg bg-white border border-slate-200/70"
        >
          {/* Subtle notebook grid */}
          <g stroke="#e2e8f0" strokeWidth="0.6" opacity="0.65">
            <line x1="0" y1="16" x2="104" y2="16" />
            <line x1="0" y1="33" x2="104" y2="33" />
            <line x1="0" y1="50" x2="104" y2="50" />
            <line x1="26" y1="0" x2="26" y2="66" />
            <line x1="52" y1="0" x2="52" y2="66" />
            <line x1="78" y1="0" x2="78" y2="66" />
          </g>

          {mode === 'text' && (
            <g>
              <path
                d="M 14 38 Q 22 20, 28 38 T 42 36 Q 50 24, 58 37 T 76 35 Q 84 26, 90 36"
                fill="none"
                stroke="#64748b"
                strokeWidth="2.2"
                strokeLinecap="round"
                style={{ animation: 'ocrHandFade 2.2s ease-in-out infinite' }}
              />
              <text
                x="52"
                y="40"
                textAnchor="middle"
                fill="#1b2a4a"
                fontSize="17"
                fontWeight="700"
                fontFamily="Georgia, serif"
                style={{ animation: 'ocrCleanIn 2.2s ease-in-out infinite' }}
              >
                Αβγδ
              </text>
              <line
                x1="0"
                y1="10"
                x2="0"
                y2="56"
                stroke="#2563eb"
                strokeWidth="2"
                style={{ animation: 'ocrScanBeam 2.2s ease-in-out infinite' }}
              />
            </g>
          )}

          {mode === 'equation' && (
            <g>
              <path
                d="M 14 40 L 24 28 M 14 28 L 24 40 M 30 24 Q 34 20, 32 28 M 38 34 L 48 34 M 43 29 L 43 39 M 54 32 L 66 32 M 54 37 L 66 37 M 74 34 Q 80 24, 86 34 Q 80 44, 74 34"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.9"
                strokeLinecap="round"
                style={{ animation: 'ocrHandFade 2.2s ease-in-out infinite' }}
              />
              <text
                x="52"
                y="40"
                textAnchor="middle"
                fill="#1b2a4a"
                fontSize="16"
                fontWeight="700"
                fontStyle="italic"
                fontFamily="Georgia, serif"
                style={{ animation: 'ocrCleanIn 2.2s ease-in-out infinite' }}
              >
                x² + 2x = 0
              </text>
              <line
                x1="0"
                y1="12"
                x2="0"
                y2="54"
                stroke="#2563eb"
                strokeWidth="2"
                style={{ animation: 'ocrScanBeam 2.2s ease-in-out infinite' }}
              />
            </g>
          )}

          {mode === 'graph' && (
            <g>
              {/* Axes */}
              <line x1="16" y1="52" x2="92" y2="52" stroke="#334155" strokeWidth="1.6" />
              <polygon points="94,52 88,49 88,55" fill="#334155" />
              <line x1="52" y1="58" x2="52" y2="10" stroke="#334155" strokeWidth="1.6" />
              <polygon points="52,7 49,13 55,13" fill="#334155" />
              {/* Animated parabola */}
              <path
                d="M 22 16 Q 52 78, 82 16"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray="110"
                style={{ animation: 'ocrDrawCurve 2.2s ease-in-out infinite' }}
              />
              <circle cx="52" cy="47" r="2.8" fill="#ef4444" />
            </g>
          )}

          {mode === 'polygon' && (
            <g>
              <polygon
                points="28,16 76,16 84,50 20,50"
                fill="#2563eb"
                style={{ animation: 'ocrPolyFill 2.2s ease-in-out infinite' }}
              />
              <line
                x1="28" y1="16" x2="76" y2="16"
                stroke="#1b2a4a" strokeWidth="2.4" strokeLinecap="round"
                style={{ transformOrigin: '52px 16px', animation: 'ocrPolySnap1 2.2s ease-in-out infinite' }}
              />
              <line
                x1="76" y1="16" x2="84" y2="50"
                stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round"
                style={{ transformOrigin: '80px 33px', animation: 'ocrPolySnap2 2.2s ease-in-out infinite' }}
              />
              <line
                x1="84" y1="50" x2="20" y2="50"
                stroke="#1b2a4a" strokeWidth="2.4" strokeLinecap="round"
                style={{ transformOrigin: '52px 50px', animation: 'ocrPolySnap3 2.2s ease-in-out infinite' }}
              />
              <line
                x1="20" y1="50" x2="28" y2="16"
                stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round"
                style={{ transformOrigin: '24px 33px', animation: 'ocrPolySnap4 2.2s ease-in-out infinite' }}
              />
            </g>
          )}

          {mode === 'code' && (
            <g fontFamily="ui-monospace, SFMono-Regular, monospace" fontSize="9.5" fontWeight="700">
              <text x="12" y="21" fill="#7c3aed">ΑΝ x &gt; 0 ΤΟΤΕ</text>
              <g style={{ animation: 'ocrCodeIndent 2.2s ease-in-out infinite' }}>
                <rect x="12" y="28" width="4" height="10" rx="1.5" fill="#cbd5e1" />
                <text x="20" y="36" fill="#0f766e">ΓΡΑΨΕ x</text>
              </g>
              <text x="12" y="52" fill="#7c3aed">ΤΕΛΟΣ_ΑΝ</text>
            </g>
          )}

          {mode === 'reaction' && (
            <g fontFamily="system-ui, sans-serif" fontWeight="700">
              <text x="10" y="38" fill="#1b2a4a" fontSize="11.5">2H₂+O₂</text>
              <text x="53" y="38" fill="#2563eb" fontSize="12">→</text>
              <g style={{ animation: 'ocrChemSlide 2.2s ease-in-out infinite' }}>
                <text x="66" y="38" fill="#059669" fontSize="12.5">2H₂O</text>
              </g>
            </g>
          )}

          {mode === 'molecule3d' && (
            <g style={{ transformOrigin: '52px 34px', animation: 'ocrMolFloat 2.2s ease-in-out infinite' }}>
              <defs>
                <radialGradient id="ocrMolO" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#fca5a5" />
                  <stop offset="55%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </radialGradient>
                <radialGradient id="ocrMolH" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="65%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#64748b" />
                </radialGradient>
              </defs>
              {/* Electron cloud halo */}
              <ellipse cx="52" cy="34" rx="34" ry="20" fill="#3b82f6" fillOpacity="0.11" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2.5" />
              {/* Bonds */}
              <line x1="52" y1="28" x2="31" y2="44" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
              <line x1="52" y1="28" x2="73" y2="44" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
              {/* Atoms */}
              <circle cx="52" cy="28" r="11" fill="url(#ocrMolO)" />
              <circle cx="31" cy="44" r="7.5" fill="url(#ocrMolH)" />
              <circle cx="73" cy="44" r="7.5" fill="url(#ocrMolH)" />
            </g>
          )}

          {mode === 'atom2d' && (
            <g>
              <circle cx="52" cy="33" r="14" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
              <circle cx="52" cy="33" r="24" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />
              {/* Nucleus */}
              <circle cx="52" cy="33" r="5.5" fill="#dc2626" />
              <text x="52" y="36" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">+</text>
              {/* Inner orbit electrons */}
              <g style={{ transformOrigin: '52px 33px', animation: 'ocrOrbitSpin 3.2s linear infinite' }}>
                <circle cx="66" cy="33" r="3" fill="#2563eb" />
                <circle cx="38" cy="33" r="3" fill="#2563eb" />
              </g>
              {/* Outer orbit electron */}
              <g style={{ transformOrigin: '52px 33px', animation: 'ocrOrbitSpin 5.0s linear infinite reverse' }}>
                <circle cx="52" cy="9" r="3" fill="#0ea5e9" />
              </g>
            </g>
          )}
        </svg>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#1b2a4a]">{meta.title}</span>
            <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-[#ece7dc] text-[#234978]">
              {meta.badge}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{meta.subtitle}</p>
        </div>
      </div>
    </div>
  );
};
