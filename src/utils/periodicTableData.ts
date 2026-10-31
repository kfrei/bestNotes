export type ElementCategory = 'metal' | 'nonmetal' | 'metalloid' | 'noble';

export interface PeriodicElement {
  z: number; // Ατομικός αριθμός Z
  a: number; // Μαζικός αριθμός A
  symbol: string;
  nameEl: string;
  period: number; // 1..6
  group: number; // 1..18
  shells: number[]; // Ηλεκτρόνια ανά στιβάδα K, L, M, N, O, P
  category: ElementCategory;
}

// Στοιχεία Περιόδων 1 έως 6 (Ομάδες 1 έως 18, από Υδρογόνο H έως Ραδόνιο Rn)
export const PERIODIC_ELEMENTS_H_TO_RN: PeriodicElement[] = [
  // Περίοδος 1
  { z: 1, a: 1, symbol: 'H', nameEl: 'Υδρογόνο', period: 1, group: 1, shells: [1], category: 'nonmetal' },
  { z: 2, a: 4, symbol: 'He', nameEl: 'Ήλιο', period: 1, group: 18, shells: [2], category: 'noble' },

  // Περίοδος 2
  { z: 3, a: 7, symbol: 'Li', nameEl: 'Λίθιο', period: 2, group: 1, shells: [2, 1], category: 'metal' },
  { z: 4, a: 9, symbol: 'Be', nameEl: 'Βηρύλλιο', period: 2, group: 2, shells: [2, 2], category: 'metal' },
  { z: 5, a: 11, symbol: 'B', nameEl: 'Βόριο', period: 2, group: 13, shells: [2, 3], category: 'metalloid' },
  { z: 6, a: 12, symbol: 'C', nameEl: 'Άνθρακας', period: 2, group: 14, shells: [2, 4], category: 'nonmetal' },
  { z: 7, a: 14, symbol: 'N', nameEl: 'Άζωτο', period: 2, group: 15, shells: [2, 5], category: 'nonmetal' },
  { z: 8, a: 16, symbol: 'O', nameEl: 'Οξυγόνο', period: 2, group: 16, shells: [2, 6], category: 'nonmetal' },
  { z: 9, a: 19, symbol: 'F', nameEl: 'Φθόριο', period: 2, group: 17, shells: [2, 7], category: 'nonmetal' },
  { z: 10, a: 20, symbol: 'Ne', nameEl: 'Νέον', period: 2, group: 18, shells: [2, 8], category: 'noble' },

  // Περίοδος 3
  { z: 11, a: 23, symbol: 'Na', nameEl: 'Νάτριο', period: 3, group: 1, shells: [2, 8, 1], category: 'metal' },
  { z: 12, a: 24, symbol: 'Mg', nameEl: 'Μαγνήσιο', period: 3, group: 2, shells: [2, 8, 2], category: 'metal' },
  { z: 13, a: 27, symbol: 'Al', nameEl: 'Αργίλιο', period: 3, group: 13, shells: [2, 8, 3], category: 'metal' },
  { z: 14, a: 28, symbol: 'Si', nameEl: 'Πυρίτιο', period: 3, group: 14, shells: [2, 8, 4], category: 'metalloid' },
  { z: 15, a: 31, symbol: 'P', nameEl: 'Φωσφόρος', period: 3, group: 15, shells: [2, 8, 5], category: 'nonmetal' },
  { z: 16, a: 32, symbol: 'S', nameEl: 'Θείο', period: 3, group: 16, shells: [2, 8, 6], category: 'nonmetal' },
  { z: 17, a: 35, symbol: 'Cl', nameEl: 'Χλώριο', period: 3, group: 17, shells: [2, 8, 7], category: 'nonmetal' },
  { z: 18, a: 40, symbol: 'Ar', nameEl: 'Αργό', period: 3, group: 18, shells: [2, 8, 8], category: 'noble' },

  // Περίοδος 4
  { z: 19, a: 39, symbol: 'K', nameEl: 'Κάλιο', period: 4, group: 1, shells: [2, 8, 8, 1], category: 'metal' },
  { z: 20, a: 40, symbol: 'Ca', nameEl: 'Ασβέστιο', period: 4, group: 2, shells: [2, 8, 8, 2], category: 'metal' },
  { z: 21, a: 45, symbol: 'Sc', nameEl: 'Σκάνδιο', period: 4, group: 3, shells: [2, 8, 9, 2], category: 'metal' },
  { z: 22, a: 48, symbol: 'Ti', nameEl: 'Τιτάνιο', period: 4, group: 4, shells: [2, 8, 10, 2], category: 'metal' },
  { z: 23, a: 51, symbol: 'V', nameEl: 'Βανάδιο', period: 4, group: 5, shells: [2, 8, 11, 2], category: 'metal' },
  { z: 24, a: 52, symbol: 'Cr', nameEl: 'Χρώμιο', period: 4, group: 6, shells: [2, 8, 13, 1], category: 'metal' },
  { z: 25, a: 55, symbol: 'Mn', nameEl: 'Μαγγάνιο', period: 4, group: 7, shells: [2, 8, 13, 2], category: 'metal' },
  { z: 26, a: 56, symbol: 'Fe', nameEl: 'Σίδηρος', period: 4, group: 8, shells: [2, 8, 14, 2], category: 'metal' },
  { z: 27, a: 59, symbol: 'Co', nameEl: 'Κοβάλτιο', period: 4, group: 9, shells: [2, 8, 15, 2], category: 'metal' },
  { z: 28, a: 59, symbol: 'Ni', nameEl: 'Νικέλιο', period: 4, group: 10, shells: [2, 8, 16, 2], category: 'metal' },
  { z: 29, a: 64, symbol: 'Cu', nameEl: 'Χαλκός', period: 4, group: 11, shells: [2, 8, 18, 1], category: 'metal' },
  { z: 30, a: 65, symbol: 'Zn', nameEl: 'Ψευδάργυρος', period: 4, group: 12, shells: [2, 8, 18, 2], category: 'metal' },
  { z: 31, a: 70, symbol: 'Ga', nameEl: 'Γάλλιο', period: 4, group: 13, shells: [2, 8, 18, 3], category: 'metal' },
  { z: 32, a: 73, symbol: 'Ge', nameEl: 'Γερμάνιο', period: 4, group: 14, shells: [2, 8, 18, 4], category: 'metalloid' },
  { z: 33, a: 75, symbol: 'As', nameEl: 'Αρσενικό', period: 4, group: 15, shells: [2, 8, 18, 5], category: 'metalloid' },
  { z: 34, a: 79, symbol: 'Se', nameEl: 'Σελήνιο', period: 4, group: 16, shells: [2, 8, 18, 6], category: 'nonmetal' },
  { z: 35, a: 80, symbol: 'Br', nameEl: 'Βρώμιο', period: 4, group: 17, shells: [2, 8, 18, 7], category: 'nonmetal' },
  { z: 36, a: 84, symbol: 'Kr', nameEl: 'Κρυπτό', period: 4, group: 18, shells: [2, 8, 18, 8], category: 'noble' },

  // Περίοδος 5
  { z: 37, a: 85, symbol: 'Rb', nameEl: 'Ρουβίδιο', period: 5, group: 1, shells: [2, 8, 18, 8, 1], category: 'metal' },
  { z: 38, a: 88, symbol: 'Sr', nameEl: 'Στρόντιο', period: 5, group: 2, shells: [2, 8, 18, 8, 2], category: 'metal' },
  { z: 39, a: 89, symbol: 'Y', nameEl: 'Ύττριο', period: 5, group: 3, shells: [2, 8, 18, 9, 2], category: 'metal' },
  { z: 40, a: 91, symbol: 'Zr', nameEl: 'Ζιρκόνιο', period: 5, group: 4, shells: [2, 8, 18, 10, 2], category: 'metal' },
  { z: 41, a: 93, symbol: 'Nb', nameEl: 'Νιόβιο', period: 5, group: 5, shells: [2, 8, 18, 12, 1], category: 'metal' },
  { z: 42, a: 96, symbol: 'Mo', nameEl: 'Μολυβδαίνιο', period: 5, group: 6, shells: [2, 8, 18, 13, 1], category: 'metal' },
  { z: 43, a: 98, symbol: 'Tc', nameEl: 'Τεχνήτιο', period: 5, group: 7, shells: [2, 8, 18, 13, 2], category: 'metal' },
  { z: 44, a: 101, symbol: 'Ru', nameEl: 'Ρουθήνιο', period: 5, group: 8, shells: [2, 8, 18, 15, 1], category: 'metal' },
  { z: 45, a: 103, symbol: 'Rh', nameEl: 'Ρόδιο', period: 5, group: 9, shells: [2, 8, 18, 16, 1], category: 'metal' },
  { z: 46, a: 106, symbol: 'Pd', nameEl: 'Παλλάδιο', period: 5, group: 10, shells: [2, 8, 18, 18], category: 'metal' },
  { z: 47, a: 108, symbol: 'Ag', nameEl: 'Άργυρος', period: 5, group: 11, shells: [2, 8, 18, 18, 1], category: 'metal' },
  { z: 48, a: 112, symbol: 'Cd', nameEl: 'Κάδμιο', period: 5, group: 12, shells: [2, 8, 18, 18, 2], category: 'metal' },
  { z: 49, a: 115, symbol: 'In', nameEl: 'Ίνδιο', period: 5, group: 13, shells: [2, 8, 18, 18, 3], category: 'metal' },
  { z: 50, a: 119, symbol: 'Sn', nameEl: 'Κασσίτερος', period: 5, group: 14, shells: [2, 8, 18, 18, 4], category: 'metal' },
  { z: 51, a: 122, symbol: 'Sb', nameEl: 'Αντιμόνιο', period: 5, group: 15, shells: [2, 8, 18, 18, 5], category: 'metalloid' },
  { z: 52, a: 128, symbol: 'Te', nameEl: 'Τελλούριο', period: 5, group: 16, shells: [2, 8, 18, 18, 6], category: 'metalloid' },
  { z: 53, a: 127, symbol: 'I', nameEl: 'Ιώδιο', period: 5, group: 17, shells: [2, 8, 18, 18, 7], category: 'nonmetal' },
  { z: 54, a: 131, symbol: 'Xe', nameEl: 'Ξένο', period: 5, group: 18, shells: [2, 8, 18, 18, 8], category: 'noble' },

  // Περίοδος 6
  { z: 55, a: 133, symbol: 'Cs', nameEl: 'Καίσιο', period: 6, group: 1, shells: [2, 8, 18, 18, 8, 1], category: 'metal' },
  { z: 56, a: 137, symbol: 'Ba', nameEl: 'Βάριο', period: 6, group: 2, shells: [2, 8, 18, 18, 8, 2], category: 'metal' },
  { z: 57, a: 139, symbol: 'La', nameEl: 'Λανθάνιο', period: 6, group: 3, shells: [2, 8, 18, 18, 9, 2], category: 'metal' },
  { z: 72, a: 178, symbol: 'Hf', nameEl: 'Άφνιο', period: 6, group: 4, shells: [2, 8, 18, 32, 10, 2], category: 'metal' },
  { z: 73, a: 181, symbol: 'Ta', nameEl: 'Ταντάλιο', period: 6, group: 5, shells: [2, 8, 18, 32, 11, 2], category: 'metal' },
  { z: 74, a: 184, symbol: 'W', nameEl: 'Βολφράμιο', period: 6, group: 6, shells: [2, 8, 18, 32, 12, 2], category: 'metal' },
  { z: 75, a: 186, symbol: 'Re', nameEl: 'Ρήνιο', period: 6, group: 7, shells: [2, 8, 18, 32, 13, 2], category: 'metal' },
  { z: 76, a: 190, symbol: 'Os', nameEl: 'Όσμιο', period: 6, group: 8, shells: [2, 8, 18, 32, 14, 2], category: 'metal' },
  { z: 77, a: 192, symbol: 'Ir', nameEl: 'Ιρίδιο', period: 6, group: 9, shells: [2, 8, 18, 32, 15, 2], category: 'metal' },
  { z: 78, a: 195, symbol: 'Pt', nameEl: 'Λευκόχρυσος', period: 6, group: 10, shells: [2, 8, 18, 32, 17, 1], category: 'metal' },
  { z: 79, a: 197, symbol: 'Au', nameEl: 'Χρυσός', period: 6, group: 11, shells: [2, 8, 18, 32, 18, 1], category: 'metal' },
  { z: 80, a: 201, symbol: 'Hg', nameEl: 'Υδράργυρος', period: 6, group: 12, shells: [2, 8, 18, 32, 18, 2], category: 'metal' },
  { z: 81, a: 204, symbol: 'Tl', nameEl: 'Θάλλιο', period: 6, group: 13, shells: [2, 8, 18, 32, 18, 3], category: 'metal' },
  { z: 82, a: 207, symbol: 'Pb', nameEl: 'Μόλυβδος', period: 6, group: 14, shells: [2, 8, 18, 32, 18, 4], category: 'metal' },
  { z: 83, a: 209, symbol: 'Bi', nameEl: 'Βισμούθιο', period: 6, group: 15, shells: [2, 8, 18, 32, 18, 5], category: 'metal' },
  { z: 84, a: 209, symbol: 'Po', nameEl: 'Πολώνιο', period: 6, group: 16, shells: [2, 8, 18, 32, 18, 6], category: 'metalloid' },
  { z: 85, a: 210, symbol: 'At', nameEl: 'Άστατο', period: 6, group: 17, shells: [2, 8, 18, 32, 18, 7], category: 'nonmetal' },
  { z: 86, a: 222, symbol: 'Rn', nameEl: 'Ραδόνιο', period: 6, group: 18, shells: [2, 8, 18, 32, 18, 8], category: 'noble' },
];

export function getPeriodicElementByZ(z: number): PeriodicElement {
  return (
    PERIODIC_ELEMENTS_H_TO_RN.find((el) => el.z === z) || PERIODIC_ELEMENTS_H_TO_RN[1] // default He
  );
}

export function getPeriodicElementBySymbol(symbol: string): PeriodicElement | undefined {
  const clean = symbol.trim();
  return PERIODIC_ELEMENTS_H_TO_RN.find(
    (el) => el.symbol.toLowerCase() === clean.toLowerCase()
  );
}

const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉';

export function toSubscriptNumber(n: number): string {
  return String(n)
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0) - 48;
      return code >= 0 && code <= 9 ? SUBSCRIPT_DIGITS[code] : ch;
    })
    .join('');
}

export function formatChemEquationText(raw: string): string {
  let s = raw
    .trim()
    .replace(/-->|->|→|⇒|=/g, ' → ')
    .replace(/\s*\+\s*/g, ' + ')
    .replace(/\s+/g, ' ');
  // Convert trailing digits after element symbols (e.g. O2, H2O, CO2, Cl2, NH3) to Unicode subscripts
  s = s.replace(/([A-Za-z\])])(\d+)/g, (_, prefix: string, digits: string) => {
    return `${prefix}${toSubscriptNumber(parseInt(digits, 10))}`;
  });
  return s.trim();
}

export interface ParsedReactionAtoms {
  equationDisplay: string;
  bondType: 'ionic' | 'covalent';
  atomZList: number[]; // Ordered Z of atoms to display side-by-side below the reaction
  transfers: {
    fromAtomIdx: number;
    toAtomIdx: number;
    count: number;
  }[];
  sharedPairs: {
    atomAIdx: number;
    atomBIdx: number;
    pairsCount: number; // 1 = single bond, 2 = double bond, 3 = triple bond
  }[];
}

// Αναλύει μια χημική εξίσωση (π.χ. "C + O2 -> CO2", "Na + Cl -> NaCl", "2H2 + O2 -> 2H2O", "Mg + O -> MgO")
// και επιστρέφει τη διάταξη των ατόμων και την κίνηση των ηλεκτρονίων για το 2s animation!
export function parseChemicalReactionToAtomSetup(rawEq: string): ParsedReactionAtoms {
  const norm = rawEq
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (ch) => String(SUBSCRIPT_DIGITS.indexOf(ch)))
    .replace(/\s+/g, '')
    .toUpperCase();

  // Συχνές πρότυπες αντιδράσεις με ιδανική παιδαγωγική διάταξη ατόμων (π.χ. O - C - O για CO2, H - O - H για H2O)
  if (norm.includes('CO2') || (norm.includes('C+') && norm.includes('O'))) {
    return {
      equationDisplay: 'C + O₂ → CO₂',
      bondType: 'covalent',
      atomZList: [8, 6, 8], // O — C — O
      transfers: [],
      sharedPairs: [
        { atomAIdx: 0, atomBIdx: 1, pairsCount: 2 },
        { atomAIdx: 1, atomBIdx: 2, pairsCount: 2 },
      ],
    };
  }
  if (norm.includes('H2O') || (norm.includes('H2') && norm.includes('O2'))) {
    return {
      equationDisplay: '2H₂ + O₂ → 2H₂O',
      bondType: 'covalent',
      atomZList: [1, 8, 1], // H — O — H
      transfers: [],
      sharedPairs: [
        { atomAIdx: 0, atomBIdx: 1, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 2, pairsCount: 1 },
      ],
    };
  }
  if (norm.includes('NH3') || (norm.includes('N2') && norm.includes('H2'))) {
    return {
      equationDisplay: 'N₂ + 3H₂ → 2NH₃',
      bondType: 'covalent',
      atomZList: [1, 7, 1, 1], // H — N — H (+ H)
      transfers: [],
      sharedPairs: [
        { atomAIdx: 0, atomBIdx: 1, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 2, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 3, pairsCount: 1 },
      ],
    };
  }
  if (norm.includes('CH4')) {
    return {
      equationDisplay: 'C + 2H₂ → CH₄',
      bondType: 'covalent',
      atomZList: [1, 6, 1],
      transfers: [],
      sharedPairs: [
        { atomAIdx: 0, atomBIdx: 1, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 2, pairsCount: 1 },
      ],
    };
  }
  if (norm.includes('NACL') || (norm.includes('NA') && norm.includes('CL'))) {
    return {
      equationDisplay: 'Na + Cl → Na⁺Cl⁻',
      bondType: 'ionic',
      atomZList: [11, 17], // Na, Cl
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 1 }],
      sharedPairs: [],
    };
  }
  if (norm.includes('KCL') || (norm.includes('K') && norm.includes('CL'))) {
    return {
      equationDisplay: 'K + Cl → K⁺Cl⁻',
      bondType: 'ionic',
      atomZList: [19, 17], // K, Cl
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 1 }],
      sharedPairs: [],
    };
  }
  if (norm.includes('LIF') || (norm.includes('LI') && norm.includes('F'))) {
    return {
      equationDisplay: 'Li + F → Li⁺F⁻',
      bondType: 'ionic',
      atomZList: [3, 9], // Li, F
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 1 }],
      sharedPairs: [],
    };
  }
  if (norm.includes('MGO') || (norm.includes('MG') && norm.includes('O'))) {
    return {
      equationDisplay: 'Mg + O → Mg²⁺O²⁻',
      bondType: 'ionic',
      atomZList: [12, 8], // Mg, O
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 2 }],
      sharedPairs: [],
    };
  }
  if (norm.includes('CAO') || (norm.includes('CA') && norm.includes('O'))) {
    return {
      equationDisplay: 'Ca + O → Ca²⁺O²⁻',
      bondType: 'ionic',
      atomZList: [20, 8], // Ca, O
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 2 }],
      sharedPairs: [],
    };
  }
  if (norm.includes('MGCL2') || (norm.includes('MG') && norm.includes('CL'))) {
    return {
      equationDisplay: 'Mg + Cl₂ → MgCl₂',
      bondType: 'ionic',
      atomZList: [17, 12, 17], // Cl, Mg, Cl
      transfers: [
        { fromAtomIdx: 1, toAtomIdx: 0, count: 1 },
        { fromAtomIdx: 1, toAtomIdx: 2, count: 1 },
      ],
      sharedPairs: [],
    };
  }
  if (norm.includes('CACL2') || (norm.includes('CA') && norm.includes('CL'))) {
    return {
      equationDisplay: 'Ca + Cl₂ → CaCl₂',
      bondType: 'ionic',
      atomZList: [17, 20, 17], // Cl, Ca, Cl
      transfers: [
        { fromAtomIdx: 1, toAtomIdx: 0, count: 1 },
        { fromAtomIdx: 1, toAtomIdx: 2, count: 1 },
      ],
      sharedPairs: [],
    };
  }
  if (norm.includes('HCL') || (norm.includes('H') && norm.includes('CL'))) {
    return {
      equationDisplay: 'H₂ + Cl₂ → 2HCl',
      bondType: 'covalent',
      atomZList: [1, 17], // H — Cl
      transfers: [],
      sharedPairs: [{ atomAIdx: 0, atomBIdx: 1, pairsCount: 1 }],
    };
  }

  // Γενικός parser συμβόλων από το αριστερό μέλος της αντίδρασης
  const lhs = rawEq.split(/-->|->|→|⇒|=/)[0] || rawEq;
  const symbolMatches = lhs.match(/[A-Z][a-z]?/g) || [];
  const parsedElements: PeriodicElement[] = [];
  for (const sym of symbolMatches) {
    const found = getPeriodicElementBySymbol(sym);
    if (found) parsedElements.push(found);
  }

  if (parsedElements.length >= 2) {
    const e1 = parsedElements[0];
    const e2 = parsedElements[1];
    const hasMetal = e1.category === 'metal' || e2.category === 'metal';
    const hasNonMetal = e1.category === 'nonmetal' || e2.category === 'nonmetal';
    if (hasMetal && hasNonMetal) {
      const metalIdx = e1.category === 'metal' ? 0 : 1;
      const nonMetalIdx = metalIdx === 0 ? 1 : 0;
      const metalEl = parsedElements[metalIdx];
      const vMetal = metalEl.shells[metalEl.shells.length - 1] || 1;
      return {
        equationDisplay: formatChemEquationText(rawEq.includes('->') || rawEq.includes('→') ? rawEq : `${e1.symbol} + ${e2.symbol} → ${e1.symbol}${e2.symbol}`),
        bondType: 'ionic',
        atomZList: [e1.z, e2.z],
        transfers: [{ fromAtomIdx: metalIdx, toAtomIdx: nonMetalIdx, count: Math.min(2, vMetal) }],
        sharedPairs: [],
      };
    }
    return {
      equationDisplay: formatChemEquationText(rawEq.includes('->') || rawEq.includes('→') ? rawEq : `${e1.symbol} + ${e2.symbol} → ${e1.symbol}${e2.symbol}`),
      bondType: 'covalent',
      atomZList: [e1.z, e2.z],
      transfers: [],
      sharedPairs: [{ atomAIdx: 0, atomBIdx: 1, pairsCount: 1 }],
    };
  }

  // Fallback σε C + O2 -> CO2
  return {
    equationDisplay: formatChemEquationText(rawEq || 'C + O₂ → CO₂'),
    bondType: 'covalent',
    atomZList: [8, 6, 8],
    transfers: [],
    sharedPairs: [
      { atomAIdx: 0, atomBIdx: 1, pairsCount: 2 },
      { atomAIdx: 1, atomBIdx: 2, pairsCount: 2 },
    ],
  };
}

// Δημιουργεί αυτόματα τη χημική αντίδραση όταν ο χρήστης έχει βάλει 2 ή περισσότερα άτομα δίπλα-δίπλα στον καμβά!
export function inferReactionFromCanvasAtoms(atomZList: number[]): ParsedReactionAtoms {
  const counts = new Map<number, number>();
  for (const z of atomZList) counts.set(z, (counts.get(z) || 0) + 1);

  if (counts.get(6) === 1 && counts.get(8) === 2) {
    return parseChemicalReactionToAtomSetup('C + O2 -> CO2');
  }
  if (counts.get(1) === 2 && counts.get(8) === 1) {
    return parseChemicalReactionToAtomSetup('2H2 + O2 -> 2H2O');
  }
  if ((counts.get(11) || 0) >= 1 && (counts.get(17) || 0) >= 1) {
    return parseChemicalReactionToAtomSetup('Na + Cl -> NaCl');
  }
  if (counts.get(12) === 1 && counts.get(8) === 1) {
    return parseChemicalReactionToAtomSetup('Mg + O -> MgO');
  }
  if (counts.get(12) === 1 && counts.get(17) === 2) {
    return parseChemicalReactionToAtomSetup('Mg + Cl2 -> MgCl2');
  }
  if (counts.get(20) === 1 && counts.get(17) === 2) {
    return parseChemicalReactionToAtomSetup('Ca + Cl2 -> CaCl2');
  }
  if (counts.get(1) === 1 && counts.get(17) === 1) {
    return parseChemicalReactionToAtomSetup('H2 + Cl2 -> 2HCl');
  }
  if (atomZList.length === 2 && atomZList[0] === atomZList[1]) {
    const el = getPeriodicElementByZ(atomZList[0]);
    const val = el.shells[el.shells.length - 1] || 1;
    const pairs = Math.max(1, Math.min(3, 8 - val));
    return {
      equationDisplay: `${el.symbol} + ${el.symbol} → ${el.symbol}₂`,
      bondType: 'covalent',
      atomZList,
      transfers: [],
      sharedPairs: [{ atomAIdx: 0, atomBIdx: 1, pairsCount: pairs }],
    };
  }
  if (atomZList.length >= 2) {
    const e1 = getPeriodicElementByZ(atomZList[0]);
    const e2 = getPeriodicElementByZ(atomZList[1]);
    return parseChemicalReactionToAtomSetup(`${e1.symbol} + ${e2.symbol} -> ${e1.symbol}${e2.symbol}`);
  }
  const single = getPeriodicElementByZ(atomZList[0] || 2);
  return {
    equationDisplay: `${single.symbol}`,
    bondType: 'covalent',
    atomZList,
    transfers: [],
    sharedPairs: [],
  };
}
