import React from 'react';
import { Type, ChevronDown, FlaskConical, Atom } from 'lucide-react';

export interface LassoOcrButtonsProps {
  isConvertingHandwriting: boolean;
  openMenu: 'math' | 'chem' | null;
  setOpenMenu: (menu: 'math' | 'chem' | null | ((prev: 'math' | 'chem' | null) => 'math' | 'chem' | null)) => void;
  onConvertTextOcr: () => void;
  onConvertMathOcr: () => void;
  onConvertMathGraph: () => void;
  onConvertToPolygon: () => void;
  onConvertChemOcr: () => void;
  onConvert3DMoleculeOcr: () => void;
  onActivateAtomSim: () => void;
}

export const LassoOcrButtons: React.FC<LassoOcrButtonsProps> = ({
  isConvertingHandwriting,
  openMenu,
  setOpenMenu,
  onConvertTextOcr,
  onConvertMathOcr,
  onConvertMathGraph,
  onConvertToPolygon,
  onConvertChemOcr,
  onConvert3DMoleculeOcr,
  onActivateAtomSim,
}) => {
  return (
    <div className="flex items-center gap-1 bg-[#efebe3] p-0.5 rounded-full border border-[#dfd8cb] relative">
      {/* 1. Direct textOCR (Single Tap) */}
      <button
        type="button"
        onClick={() => {
          setOpenMenu(null);
          onConvertTextOcr();
        }}
        disabled={isConvertingHandwriting}
        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
          isConvertingHandwriting
            ? 'bg-[#e4ded2] text-[#64748b] border-[#dfd8cb] cursor-wait'
            : 'bg-[#fdfbf7] hover:bg-[#e8e2d6] text-[#234978] border-[#dfd8cb] shadow-2xs'
        }`}
        title="textOCR: Άμεση μετατροπή χειρόγραφου κειμένου (Καλλιγραφική, Πένα, Μαρκαδόρος, Χειρόγραφο, Ρέουσα, Τυπωμένο)"
      >
        <Type className="w-3.5 h-3.5" />
        <span>{isConvertingHandwriting ? 'OCR...' : 'textOCR'}</span>
      </button>

      {/* 2. Math Dropdown (Εξίσωση, Διάγραμμα, Πολύγωνο) */}
      <div className="relative">
        <button
          type="button"
          data-popover-trigger="lasso-ocr"
          onClick={() => setOpenMenu((v) => (v === 'math' ? null : 'math'))}
          disabled={isConvertingHandwriting}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
            openMenu === 'math'
              ? 'bg-[#234978] text-white border-[#234978] shadow-xs'
              : 'bg-[#fdfbf7] hover:bg-[#e8e2d6] text-[#234978] border-[#dfd8cb]'
          }`}
          title="Μαθηματικά & Γεωμετρία OCR (Εξίσωση, Διάγραμμα, Πολύγωνο)"
        >
          <span className="font-serif font-bold text-[12px] leading-none">Σ</span>
          <span>Math</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform ${openMenu === 'math' ? 'rotate-180' : ''}`}
          />
        </button>

        {openMenu === 'math' && (
          <div
            data-ui-panel="true"
            data-popover-panel="lasso-ocr"
            onPointerDown={(e) => e.stopPropagation()}
            className="fixed md:absolute top-full left-0 mt-1.5 z-50 w-64 ipados-liquid-glass bg-[#fdfbf7]/38 backdrop-blur-2xl backdrop-saturate-200 border border-white/85 rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.14),0_4px_16px_-2px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 p-2 flex flex-col gap-1"
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
              Math · Μαθηματικά & Γεωμετρία
            </div>
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onConvertMathOcr();
              }}
              disabled={isConvertingHandwriting}
              className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left hover:bg-[#efebe3] text-[#234978] transition cursor-pointer"
              title="MathOCR: Αναγνώριση χειρόγραφων εξισώσεων, κλασμάτων, συνεπαγωγών (⇒), ίσον (=)"
            >
              <span className="flex items-center gap-2 font-semibold text-xs">
                <span className="w-5 h-5 rounded-md bg-[#efebe3] border border-[#dfd8cb] flex items-center justify-center font-serif text-[12px]">
                  Σ
                </span>
                <span>Εξίσωση</span>
              </span>
              <span className="text-[10px] text-[#64748b] font-medium">MathOCR / LaTeX</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onConvertMathGraph();
              }}
              disabled={isConvertingHandwriting}
              className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left hover:bg-[#efebe3] text-[#234978] transition cursor-pointer"
              title="Διάγραμμα OCR: Αναγνώριση χειρόγραφων εξισώσεων (π.χ. y₁ = x² - 9) και σχεδίαση σε σύστημα αξόνων"
            >
              <span className="flex items-center gap-2 font-semibold text-xs">
                <span className="w-5 h-5 rounded-md bg-[#efebe3] border border-[#dfd8cb] flex items-center justify-center text-[11px]">
                  📈
                </span>
                <span>Διάγραμμα</span>
              </span>
              <span className="text-[10px] text-[#64748b] font-medium">Συναρτήσεις / Άξονες</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onConvertToPolygon();
              }}
              className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left hover:bg-[#efebe3] text-[#234978] transition cursor-pointer"
              title="Ένωση των επιλεγμένων διακριτών ευθειών/γραμμών στο πιο κοντινό κλειστό Πολύγωνο"
            >
              <span className="flex items-center gap-2 font-semibold text-xs">
                <span className="w-5 h-5 rounded-md bg-[#efebe3] border border-[#dfd8cb] flex items-center justify-center text-[12px]">
                  ⬠
                </span>
                <span>Πολύγωνο</span>
              </span>
              <span className="text-[10px] text-[#64748b] font-medium">Ένωση γραμμών</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Chem Dropdown (Αντιδράσεις, 3D, 2D Άτομο) */}
      <div className="relative">
        <button
          type="button"
          data-popover-trigger="lasso-ocr"
          onClick={() => setOpenMenu((v) => (v === 'chem' ? null : 'chem'))}
          disabled={isConvertingHandwriting}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
            openMenu === 'chem'
              ? 'bg-[#234978] text-white border-[#234978] shadow-xs'
              : 'bg-[#fdfbf7] hover:bg-[#e8e2d6] text-[#234978] border-[#dfd8cb]'
          }`}
          title="Χημεία & Άτομο (Αντιδράσεις ChemOCR, 3D Μόριο, 2D Άτομο)"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Chem</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform ${openMenu === 'chem' ? 'rotate-180' : ''}`}
          />
        </button>

        {openMenu === 'chem' && (
          <div
            data-ui-panel="true"
            data-popover-panel="lasso-ocr"
            onPointerDown={(e) => e.stopPropagation()}
            className="fixed md:absolute top-full left-0 mt-1.5 z-50 w-64 ipados-liquid-glass bg-[#fdfbf7]/38 backdrop-blur-2xl backdrop-saturate-200 border border-white/85 rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.14),0_4px_16px_-2px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 p-2 flex flex-col gap-1"
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
              Chem · Χημεία & Άτομα
            </div>
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onConvertChemOcr();
              }}
              disabled={isConvertingHandwriting}
              className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left hover:bg-[#efebe3] text-[#234978] transition cursor-pointer"
              title="ChemOCR: Αναγνώριση χειρόγραφης χημικής αντίδρασης (π.χ. C + O₂ → CO₂) με δομή ατόμων & κίνηση ηλεκτρονίων"
            >
              <span className="flex items-center gap-2 font-semibold text-xs">
                <span className="w-5 h-5 rounded-md bg-[#efebe3] border border-[#dfd8cb] flex items-center justify-center">
                  <FlaskConical className="w-3.5 h-3.5" />
                </span>
                <span>Αντιδράσεις</span>
              </span>
              <span className="text-[10px] text-[#64748b] font-medium">ChemOCR / Ισοστάθμιση</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onConvert3DMoleculeOcr();
              }}
              disabled={isConvertingHandwriting}
              className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left hover:bg-[#efebe3] text-[#234978] transition cursor-pointer"
              title="3D.OCR: Αναγνώριση χειρόγραφης ένωσης (H₂O, CH₄, CO₂...) και εμφάνιση Draggable 3D Μορίου με νέφη φορτίου"
            >
              <span className="flex items-center gap-2 font-semibold text-xs">
                <span className="w-5 h-5 rounded-md bg-[#efebe3] border border-[#dfd8cb] flex items-center justify-center text-[10px] font-bold">
                  3D
                </span>
                <span>3D Μόριο</span>
              </span>
              <span className="text-[10px] text-[#64748b] font-medium">3D.OCR / Νέφη</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onActivateAtomSim();
              }}
              className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left hover:bg-[#efebe3] text-[#234978] transition cursor-pointer"
              title="2D (Άτομο): Μετατροπή του σχεδίου (πυρήνας & τροχιές) σε διαδραστική Προσομοίωση Δομής Ατόμου"
            >
              <span className="flex items-center gap-2 font-semibold text-xs">
                <span className="w-5 h-5 rounded-md bg-[#efebe3] border border-[#dfd8cb] flex items-center justify-center">
                  <Atom className="w-3.5 h-3.5" />
                </span>
                <span>2D (Άτομο)</span>
              </span>
              <span className="text-[10px] text-[#64748b] font-medium">Μοντέλο Bohr Sim</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
