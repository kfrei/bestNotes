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

export function toSubscriptDigits(s: string): string {
  if (!s) return '';
  return s
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0) - 48;
      return code >= 0 && code <= 9 ? SUBSCRIPT_DIGITS[code] : ch;
    })
    .join('');
}

export function formatChemEquationText(raw: string): string {
  let s = normalizeAsciiChem(raw)
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

  const rawElemMatches = rawEq.match(/[A-Z][a-z]?/g) || [];
  const elemSet = new Set(
    rawElemMatches
      .map((s) => getPeriodicElementBySymbol(s)?.symbol)
      .filter((s): s is string => Boolean(s))
  );
  const onlyHas = (...syms: string[]) =>
    elemSet.size === syms.length && syms.every((s) => elemSet.has(s));

  // Συχνές πρότυπες αντιδράσεις με ιδανική παιδαγωγική διάταξη ατόμων (ΜΟΝΟ όταν περιέχουν αποκλειστικά αυτά τα στοιχεία!)
  if (onlyHas('C', 'H', 'O') && norm.includes('CH4') && norm.includes('O2') && !norm.includes('C2') && !norm.includes('C3')) {
    return {
      equationDisplay: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
      bondType: 'covalent',
      atomZList: [1, 8, 1],
      transfers: [],
      sharedPairs: [
        { atomAIdx: 0, atomBIdx: 1, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 2, pairsCount: 1 },
      ],
    };
  }
  if (onlyHas('C', 'H') && !norm.includes('C2') && !norm.includes('C3') && !norm.includes('C4') && !norm.includes('C6')) {
    return {
      equationDisplay: 'C + 2H₂ → CH₄',
      bondType: 'covalent',
      atomZList: [1, 6, 1, 1, 1],
      transfers: [],
      sharedPairs: [
        { atomAIdx: 0, atomBIdx: 1, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 2, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 3, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 4, pairsCount: 1 },
      ],
    };
  }
  if (onlyHas('C', 'O') && !norm.includes('CO+')) {
    return {
      equationDisplay: 'C + O₂ → CO₂',
      bondType: 'covalent',
      atomZList: [8, 6, 8],
      transfers: [],
      sharedPairs: [
        { atomAIdx: 0, atomBIdx: 1, pairsCount: 2 },
        { atomAIdx: 1, atomBIdx: 2, pairsCount: 2 },
      ],
    };
  }
  if (onlyHas('H', 'O') && !norm.includes('H2O2')) {
    return {
      equationDisplay: '2H₂ + O₂ → 2H₂O',
      bondType: 'covalent',
      atomZList: [1, 8, 1],
      transfers: [],
      sharedPairs: [
        { atomAIdx: 0, atomBIdx: 1, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 2, pairsCount: 1 },
      ],
    };
  }
  if (onlyHas('N', 'H')) {
    return {
      equationDisplay: 'N₂ + 3H₂ → 2NH₃',
      bondType: 'covalent',
      atomZList: [1, 7, 1, 1],
      transfers: [],
      sharedPairs: [
        { atomAIdx: 0, atomBIdx: 1, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 2, pairsCount: 1 },
        { atomAIdx: 1, atomBIdx: 3, pairsCount: 1 },
      ],
    };
  }
  if (onlyHas('Na', 'Cl')) {
    return {
      equationDisplay: 'Na + Cl → Na⁺Cl⁻',
      bondType: 'ionic',
      atomZList: [11, 17],
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 1 }],
      sharedPairs: [],
    };
  }
  if (onlyHas('K', 'Cl')) {
    return {
      equationDisplay: 'K + Cl → K⁺Cl⁻',
      bondType: 'ionic',
      atomZList: [19, 17],
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 1 }],
      sharedPairs: [],
    };
  }
  if (onlyHas('Li', 'F')) {
    return {
      equationDisplay: 'Li + F → Li⁺F⁻',
      bondType: 'ionic',
      atomZList: [3, 9],
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 1 }],
      sharedPairs: [],
    };
  }
  if (onlyHas('Mg', 'O')) {
    return {
      equationDisplay: '2Mg + O₂ → 2MgO',
      bondType: 'ionic',
      atomZList: [12, 8],
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 2 }],
      sharedPairs: [],
    };
  }
  if (onlyHas('Ca', 'O')) {
    return {
      equationDisplay: '2Ca + O₂ → 2CaO',
      bondType: 'ionic',
      atomZList: [20, 8],
      transfers: [{ fromAtomIdx: 0, toAtomIdx: 1, count: 2 }],
      sharedPairs: [],
    };
  }
  if (onlyHas('Mg', 'Cl')) {
    return {
      equationDisplay: 'Mg + Cl₂ → MgCl₂',
      bondType: 'ionic',
      atomZList: [17, 12, 17],
      transfers: [
        { fromAtomIdx: 1, toAtomIdx: 0, count: 1 },
        { fromAtomIdx: 1, toAtomIdx: 2, count: 1 },
      ],
      sharedPairs: [],
    };
  }
  if (onlyHas('Ca', 'Cl')) {
    return {
      equationDisplay: 'Ca + Cl₂ → CaCl₂',
      bondType: 'ionic',
      atomZList: [17, 20, 17],
      transfers: [
        { fromAtomIdx: 1, toAtomIdx: 0, count: 1 },
        { fromAtomIdx: 1, toAtomIdx: 2, count: 1 },
      ],
      sharedPairs: [],
    };
  }
  if (onlyHas('H', 'Cl')) {
    return {
      equationDisplay: 'H₂ + Cl₂ → 2HCl',
      bondType: 'covalent',
      atomZList: [1, 17],
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
  if ((counts.get(6) || 0) === 1 && (counts.get(1) || 0) >= 2) {
    return parseChemicalReactionToAtomSetup('C + 2H2 -> CH4');
  }
  if ((counts.get(7) || 0) === 1 && (counts.get(1) || 0) >= 2) {
    return parseChemicalReactionToAtomSetup('N2 + 3H2 -> 2NH3');
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

// ============================================================================
// ΔΕΤΕΡΜΙΝΙΣΤΙΚΟΣ ΕΛΕΓΧΟΣ & ΔΙΟΡΘΩΣΗ ΔΕΙΚΤΩΝ / ΣΥΝΤΕΛΕΣΤΩΝ ΜΕ ΚΟΚΚΙΝΟ (Χωρίς AI)
// ============================================================================
export interface ChemDiffSegment {
  text: string;
  isCorrection?: boolean; // Αν true, σχεδιάζεται με έντονο ΚΟΚΚΙΝΟ χρώμα (#dc2626)
  wrongText?: string;     // Αν ο μαθητής έγραψε λάθος αριθμό (π.χ. H3O αντί H₂O), εμφανίζεται διαγραμμένο δίπλα στο κόκκινο
  reason?: string;        // Επεξήγηση (π.χ. "Έλειπε ο δείκτης ₂ στο H₂O" ή "Συντελεστής ισοστάθμισης 2")
}

export interface ChemValidationResult {
  hasCorrections: boolean;
  userRawFormatted: string;
  correctedEquation: string;
  segments: ChemDiffSegment[];
  explanationNotes: string[];
}

interface ParsedTermToken {
  coeff: string; // '' αν δεν γράφτηκε συντελεστής (δηλ. 1)
  atoms: { sym: string; sub: string }[]; // sub = '' αν δεν γράφτηκε δείκτης (δηλ. 1)
}

function normalizeAsciiChem(raw: string): string {
  let s = (raw || '')
    .trim()
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9')
    // Ομόγλυφα Ελληνικά -> Λατινικά χημικά σύμβολα (Κεφαλαία & Πεζά)
    .replace(/Η/g, 'H')
    .replace(/Ο/g, 'O')
    .replace(/Ν/g, 'N')
    .replace(/Κ/g, 'K')
    .replace(/Μg/g, 'Mg')
    .replace(/ΜG/g, 'Mg')
    .replace(/Μ/g, 'M')
    .replace(/Α/g, 'A')
    .replace(/Β/g, 'B')
    .replace(/Ε/g, 'E')
    .replace(/Ζ/g, 'Z')
    .replace(/Ι/g, 'I')
    .replace(/Ρ/g, 'P')
    .replace(/Τ/g, 'T')
    .replace(/Υ/g, 'Y')
    .replace(/Χ(?=[lLaAuUoOhH0-9\s+>-]|$)/g, 'C')
    .replace(/Ϲ/g, 'C')
    .replace(/([A-Z])α/g, '$1a')
    .replace(/([A-Z])ο/g, '$1o')
    .replace(/([A-Z])ε/g, '$1e')
    .replace(/([A-Z])ι/g, '$1i')
    .replace(/([A-Z])υ/g, '$1u')
    .replace(/([A-Z])ρ/g, '$1r')
    .replace(/([A-Z])ν/g, '$1n')
    .replace(/-->|->|=>|➔|⟶|⇒|=/g, '->');

  // Διόρθωση συχνών οπτικών συγχύσεων OCR/πληκτρολόγησης μέσα σε χημικούς τύπους:
  // 1) "0" (μηδέν) αντί για "O" (Οξυγόνο): π.χ. 02 -> O2, C02 -> CO2, H20 -> H2O, Mg0 -> MgO, S02 -> SO2, Na0H -> NaOH
  s = s
    .replace(/(^|[\s+>])(\d*)0(\d*)(?=$|[\s+-])/g, '$1$2O$3')
    .replace(/([A-Za-z])0(?=\d|[A-Z\s+>-]|$)/g, '$1O')
    .replace(/\b(H2|Na2|K2|Li2|Al2|Fe2|Fe3|N2|P2|Cl2)0(\d*)\b/g, '$1O$2')
    .replace(/\(0H\)/g, '(OH)');

  // 2) "C1" / "CI" αντί για "Cl" (Χλώριο) και "A1" / "AI" αντί για "Al" (Αργίλιο)
  s = s
    .replace(/\b(\d*)(Na|K|Li|H|Ag|Mg|Ca|Zn|Fe|Al|Cu)?C[1I](\d*)\b/g, '$1$2Cl$3')
    .replace(/\b(\d*)A[1I](\d*O\d*|\d*Cl\d*|\b)/g, '$1Al$2');

  // 3) Case-insensitive κανονικοποίηση αν ο μαθητής έγραψε με πεζά (π.χ. "c + o2 -> co2", "2h2 + o2 -> 2h2o", "na + cl2 -> nacl")
  const COMMON_LOWER_FORMULAS: Record<string, string> = {
    h: 'H', h2: 'H2', o: 'O', o2: 'O2', o3: 'O3', n: 'N', n2: 'N2', c: 'C', s: 'S', p: 'P',
    f: 'F', f2: 'F2', cl: 'Cl', cl2: 'Cl2', br: 'Br', br2: 'Br2', i: 'I', i2: 'I2',
    na: 'Na', k: 'K', li: 'Li', mg: 'Mg', ca: 'Ca', ba: 'Ba', al: 'Al', zn: 'Zn', fe: 'Fe', cu: 'Cu', ag: 'Ag',
    h2o: 'H2O', h2o2: 'H2O2', ho: 'HO', co2: 'CO2', co: 'CO', so2: 'SO2', so3: 'SO3',
    nh3: 'NH3', nh: 'NH', ch4: 'CH4', ch: 'CH', c2h6: 'C2H6', c2h4: 'C2H4', c2h2: 'C2H2', c3h8: 'C3H8',
    hcl: 'HCl', hbr: 'HBr', hi: 'HI', hf: 'HF', h2s: 'H2S', h2so4: 'H2SO4', hno3: 'HNO3', h2co3: 'H2CO3', h3po4: 'H3PO4',
    nacl: 'NaCl', kcl: 'KCl', licl: 'LiCl', lif: 'LiF', naf: 'NaF', kf: 'KF',
    mgcl2: 'MgCl2', mgcl: 'MgCl', cacl2: 'CaCl2', cacl: 'CaCl', zncl2: 'ZnCl2', zncl: 'ZnCl',
    fecl2: 'FeCl2', fecl3: 'FeCl3', alcl3: 'AlCl3', cucl2: 'CuCl2', agcl: 'AgCl',
    mgo: 'MgO', cao: 'CaO', bao: 'BaO', zno: 'ZnO', cuo: 'CuO', feo: 'FeO',
    na2o: 'Na2O', nao: 'NaO', k2o: 'K2O', ko: 'KO', al2o3: 'Al2O3', alo: 'AlO', fe2o3: 'Fe2O3', fe3o4: 'Fe3O4',
    no: 'NO', no2: 'NO2', n2o: 'N2O', n2o5: 'N2O5', p2o5: 'P2O5',
    naoh: 'NaOH', koh: 'KOH', caoh2: 'Ca(OH)2', mgoh2: 'Mg(OH)2', caco3: 'CaCO3',
  };
  s = s.replace(/\b(\d*)([a-zA-Z]{1,6}\d*[a-zA-Z]*\d*)\b/g, (full, coeff: string, word: string) => {
    const mapped = COMMON_LOWER_FORMULAS[word.toLowerCase()];
    return mapped ? `${coeff}${mapped}` : full;
  });

  return s;
}

/**
 * Ολιστική διόρθωση συμβόλων στοιχείων μιας αντίδρασης (Αρχή Διατήρησης Στοιχείων LHS <-> RHS):
 * Αν κάποιο γράμμα στη μία πλευρά του βέλους (π.χ. "GO2" αντί "CO2", "CQ2" αντί "CO2", "MH3" αντί "NH3",
 * "NaGl" αντί "NaCl", "Fc2O3" αντί "Fe2O3", "GuO" αντί "CuO") δεν είναι έγκυρο στοιχείο ή δε βρίσκεται
 * στην άλλη πλευρά της αντίδρασης, το μαντεύει από τα στοιχεία που υπάρχουν καθαρά στην απέναντι πλευρά,
 * κρατώντας ΑΘΙΚΤΟΥΣ τους συντελεστές και τους δείκτες του μαθητή!
 */
function inferReactionSideTokensFromConservation(
  userLhs: ParsedTermToken[],
  userRhs: ParsedTermToken[]
): void {
  if (userLhs.length === 0 || userRhs.length === 0) return;

  const VISUAL_ELEMENT_CANDIDATES: Record<string, string[]> = {
    G: ['C', 'Cl', 'Ca', 'Cu'],
    Q: ['O'],
    D: ['O'],
    M: ['N', 'Mg', 'Mn'],
    L: ['Cl', 'Li', 'Al'],
    R: ['K', 'Br', 'Cr'],
    E: ['F', 'Fe'],
    T: ['F', 'I'],
    Fc: ['Fe'],
    Fe: ['Fe'],
    Gu: ['Cu'],
    Cn: ['Cu', 'Zn', 'Ca'],
    Gl: ['Cl', 'Al'],
    Cl: ['Cl'],
    Ma: ['Na', 'Mg', 'Ca'],
    Nq: ['Na'],
    No: ['Na'],
    Mq: ['Mg'],
    Cq: ['Ca', 'Cu', 'Co'],
    Zq: ['Zn'],
    Zh: ['Zn'],
  };

  const resolveSide = (thisSide: ParsedTermToken[], otherSide: ParsedTermToken[]) => {
    const otherSyms = new Set(otherSide.flatMap((t) => t.atoms.map((a) => a.sym)));
    for (const term of thisSide) {
      for (const atom of term.atoms) {
        const isKnownElement = Boolean(getPeriodicElementBySymbol(atom.sym));
        // Αν το σύμβολο υπάρχει ήδη στην άλλη πλευρά και είναι έγκυρο στοιχείο, είναι 100% σωστό
        if (isKnownElement && otherSyms.has(atom.sym)) continue;

        const candidates = VISUAL_ELEMENT_CANDIDATES[atom.sym] || [];
        const matchedFromOtherSide = candidates.find((cand) => otherSyms.has(cand));
        if (matchedFromOtherSide) {
          atom.sym = matchedFromOtherSide;
          continue;
        }

        // Αν δεν είναι καν έγκυρο χημικό στοιχείο του Περιοδικού Πίνακα (π.χ. G, Q, D, M, Fc, Gu, Gl)
        if (!isKnownElement) {
          if (candidates.length > 0) {
            atom.sym = candidates[0];
          } else if (atom.sym.length === 1) {
            // Αν λείπει ΑΚΡΙΒΩΣ 1 στοιχείο από αυτή την πλευρά σε σχέση με την απέναντι πλευρά, συμπλήρωσέ το!
            const currentThisSyms = new Set(thisSide.flatMap((t) => t.atoms.map((a) => a.sym)));
            const missingFromThisSide = Array.from(otherSyms).filter((s) => !currentThisSyms.has(s));
            if (missingFromThisSide.length === 1) {
              atom.sym = missingFromThisSide[0];
            }
          }
        }
      }
    }
  };

  resolveSide(userLhs, userRhs);
  resolveSide(userRhs, userLhs);
}

function parseFormulaToken(tokenStr: string): ParsedTermToken {
  const clean = tokenStr.replace(/\s+/g, '');
  const mCoeff = clean.match(/^(\d+)(.*)$/);
  const coeff = mCoeff ? mCoeff[1] : '';
  const rawRest = mCoeff ? mCoeff[2] : clean;

  // Ανάπτυξη παρενθέσεων πολυατομικών ιόντων, π.χ. Ba(NO3)2 -> BaN2O6, Ca(OH)2 -> CaO2H2, Al2(SO4)3 -> Al2S3O12
  const expandedRest = rawRest.replace(/\(([A-Za-z0-9]+)\)(\d*)/g, (_, inner: string, multStr: string) => {
    const mult = Math.max(1, parseInt(multStr || '1', 10) || 1);
    return inner.replace(/([A-Z][a-z]?)(\d*)/g, (__, sym: string, subStr: string) => {
      const sub = Math.max(1, parseInt(subStr || '1', 10) || 1) * mult;
      return `${sym}${sub > 1 ? sub : ''}`;
    });
  });

  const atoms: { sym: string; sub: string }[] = [];
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(expandedRest)) !== null) {
    atoms.push({ sym: m[1], sub: m[2] || '' });
  }
  return { coeff, atoms };
}

interface CanonicalReactionSpec {
  id: string;
  matchElements: (lhsSyms: string[], rhsSyms: string[], rawAscii: string) => boolean;
  lhs: { coeff: string; atoms: { sym: string; sub: string; reason?: string }[]; coeffReason?: string }[];
  rhs: { coeff: string; atoms: { sym: string; sub: string; reason?: string }[]; coeffReason?: string }[];
}

const CANONICAL_REACTIONS: CanonicalReactionSpec[] = [
  {
    id: 'water',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('H') && all.has('O') && !raw.includes('H2O2');
    },
    lhs: [
      { coeff: '2', coeffReason: 'Συντελεστής 2 για ισοστάθμιση 4 ατόμων H', atoms: [{ sym: 'H', sub: '2', reason: 'Το Υδρογόνο είναι διατομικό μόριο (H₂)' }] },
      { coeff: '', atoms: [{ sym: 'O', sub: '2', reason: 'Το Οξυγόνο είναι διατομικό μόριο (O₂)' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 για ισοστάθμιση 2 ατόμων O',
        atoms: [
          { sym: 'H', sub: '2', reason: 'Δείκτης ₂ στο H₂O (το Οξυγόνο έχει σθένος 2)' },
          { sym: 'O', sub: '' },
        ],
      },
    ],
  },
  {
    id: 'br2_h2o_redox',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 3 && all.has('Br') && all.has('H') && all.has('O') && raw.includes('BRO3');
    },
    lhs: [
      {
        coeff: '3',
        coeffReason: 'Συντελεστής 3 στο 3Br₂ (οξειδοαναγωγή / δυσαναλογοποίηση Βρωμίου)',
        atoms: [{ sym: 'Br', sub: '2', reason: 'Το Βρώμιο είναι διατομικό μόριο (Br₂)' }],
      },
      {
        coeff: '3',
        coeffReason: 'Συντελεστής 3 στο 3H₂O για ισοστάθμιση Οξυγόνου και Υδρογόνου',
        atoms: [
          { sym: 'H', sub: '2', reason: 'Δείκτης ₂ στο H₂O' },
          { sym: 'O', sub: '' },
        ],
      },
    ],
    rhs: [
      {
        coeff: '',
        atoms: [
          { sym: 'H', sub: '', reason: 'Βρωμικό οξύ (HBrO₃) — το Br οξειδώνεται από 0 σε +5' },
          { sym: 'Br', sub: '' },
          { sym: 'O', sub: '3', reason: 'Δείκτης ₃ στο HBrO₃' },
        ],
      },
      {
        coeff: '5',
        coeffReason: 'Συντελεστής 5 στο 5HBr (5 άτομα Br ανάγονται από 0 σε -1)',
        atoms: [
          { sym: 'H', sub: '' },
          { sym: 'Br', sub: '', reason: 'Υδροβρώμιο (HBr) — προϊόν αναγωγής του Br₂' },
        ],
      },
    ],
  },
  {
    id: 'cl2_h2o_redox',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 3 && all.has('Cl') && all.has('H') && all.has('O') && raw.includes('CLO3');
    },
    lhs: [
      {
        coeff: '3',
        coeffReason: 'Συντελεστής 3 στο 3Cl₂ (οξειδοαναγωγή / δυσαναλογοποίηση Χλωρίου)',
        atoms: [{ sym: 'Cl', sub: '2', reason: 'Το Χλώριο είναι διατομικό μόριο (Cl₂)' }],
      },
      {
        coeff: '3',
        coeffReason: 'Συντελεστής 3 στο 3H₂O για ισοστάθμιση Οξυγόνου και Υδρογόνου',
        atoms: [
          { sym: 'H', sub: '2', reason: 'Δείκτης ₂ στο H₂O' },
          { sym: 'O', sub: '' },
        ],
      },
    ],
    rhs: [
      {
        coeff: '',
        atoms: [
          { sym: 'H', sub: '', reason: 'Χλωρικό οξύ (HClO₃) — το Cl οξειδώνεται από 0 σε +5' },
          { sym: 'Cl', sub: '' },
          { sym: 'O', sub: '3', reason: 'Δείκτης ₃ στο HClO₃' },
        ],
      },
      {
        coeff: '5',
        coeffReason: 'Συντελεστής 5 στο 5HCl (5 άτομα Cl ανάγονται από 0 σε -1)',
        atoms: [
          { sym: 'H', sub: '' },
          { sym: 'Cl', sub: '', reason: 'Υδροχλώριο (HCl) — προϊόν αναγωγής του Cl₂' },
        ],
      },
    ],
  },
  {
    id: 'methane_combustion',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      const cleanRaw = raw.replace(/\s+/g, '');
      return (
        all.size === 3 &&
        all.has('C') &&
        all.has('H') &&
        all.has('O') &&
        !/C[2-9]|CH3|COOH|CHO|OH\b/.test(cleanRaw) &&
        (cleanRaw.includes('CH4') || cleanRaw.includes('CH+'))
      );
    },
    lhs: [
      {
        coeff: '',
        atoms: [
          { sym: 'C', sub: '' },
          { sym: 'H', sub: '4', reason: 'Δείκτης ₄ στο Μεθάνιο CH₄ (ο Άνθρακας έχει 4 ηλεκτρόνια σθένους)' },
        ],
      },
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2O₂ για ισοστάθμιση 4 ατόμων O',
        atoms: [{ sym: 'O', sub: '2', reason: 'Το Οξυγόνο είναι διατομικό (O₂)' }],
      },
    ],
    rhs: [
      {
        coeff: '',
        atoms: [
          { sym: 'C', sub: '' },
          { sym: 'O', sub: '2', reason: 'Δείκτης ₂ στο CO₂' },
        ],
      },
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2H₂O για ισοστάθμιση 4 ατόμων H',
        atoms: [
          { sym: 'H', sub: '2', reason: 'Δείκτης ₂ στο H₂O' },
          { sym: 'O', sub: '' },
        ],
      },
    ],
  },
  {
    id: 'co2',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      const cleanRaw = raw.replace(/\s+/g, '');
      return all.size === 2 && all.has('C') && all.has('O') && !cleanRaw.includes('CO+');
    },
    lhs: [
      { coeff: '', atoms: [{ sym: 'C', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'O', sub: '2', reason: 'Το Οξυγόνο είναι διατομικό μόριο (O₂)' }] },
    ],
    rhs: [
      {
        coeff: '',
        atoms: [
          { sym: 'C', sub: '' },
          { sym: 'O', sub: '2', reason: 'Δείκτης ₂ στο CO₂ (διπλοί δεσμοί O=C=O)' },
        ],
      },
    ],
  },
  {
    id: 'methane_synthesis',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('C') && all.has('H') && !/C[2-9]/.test(raw);
    },
    lhs: [
      { coeff: '', atoms: [{ sym: 'C', sub: '' }] },
      { coeff: '2', coeffReason: 'Συντελεστής 2 στο 2H₂ (4 άτομα H)', atoms: [{ sym: 'H', sub: '2', reason: 'Διατομικό H₂' }] },
    ],
    rhs: [
      {
        coeff: '',
        atoms: [
          { sym: 'C', sub: '' },
          { sym: 'H', sub: '4', reason: 'Δείκτης ₄ στο Μεθάνιο CH₄ (σθένος C = 4)' },
        ],
      },
    ],
  },
  {
    id: 'ammonia',
    matchElements: (lhs, rhs) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('N') && all.has('H');
    },
    lhs: [
      { coeff: '', atoms: [{ sym: 'N', sub: '2', reason: 'Το Άζωτο είναι διατομικό μόριο (N₂)' }] },
      { coeff: '3', coeffReason: 'Συντελεστής 3 στο 3H₂ (6 άτομα H)', atoms: [{ sym: 'H', sub: '2', reason: 'Διατομικό H₂' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2NH₃',
        atoms: [
          { sym: 'N', sub: '' },
          { sym: 'H', sub: '3', reason: 'Δείκτης ₃ στην Αμμωνία NH₃ (σθένος N = 3)' },
        ],
      },
    ],
  },
  {
    id: 'mgcl2',
    matchElements: (lhs, rhs) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Mg') && all.has('Cl');
    },
    lhs: [
      { coeff: '', atoms: [{ sym: 'Mg', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'Cl', sub: '2', reason: 'Το Χλώριο είναι διατομικό (Cl₂)' }] },
    ],
    rhs: [
      {
        coeff: '',
        atoms: [
          { sym: 'Mg', sub: '' },
          { sym: 'Cl', sub: '2', reason: 'Δείκτης ₂ στο MgCl₂ (το Mg²⁺ δίνει 2e⁻ σε δύο Cl⁻)' },
        ],
      },
    ],
  },
  {
    id: 'cacl2',
    matchElements: (lhs, rhs) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Ca') && all.has('Cl');
    },
    lhs: [
      { coeff: '', atoms: [{ sym: 'Ca', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'Cl', sub: '2', reason: 'Το Χλώριο είναι διατομικό (Cl₂)' }] },
    ],
    rhs: [
      {
        coeff: '',
        atoms: [
          { sym: 'Ca', sub: '' },
          { sym: 'Cl', sub: '2', reason: 'Δείκτης ₂ στο CaCl₂ (το Ca²⁺ έχει σθένος 2)' },
        ],
      },
    ],
  },
  {
    id: 'hcl',
    matchElements: (lhs, rhs) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('H') && all.has('Cl');
    },
    lhs: [
      { coeff: '', atoms: [{ sym: 'H', sub: '2', reason: 'Διατομικό H₂' }] },
      { coeff: '', atoms: [{ sym: 'Cl', sub: '2', reason: 'Διατομικό Cl₂' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2HCl',
        atoms: [
          { sym: 'H', sub: '' },
          { sym: 'Cl', sub: '' },
        ],
      },
    ],
  },
  {
    id: 'nacl',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Na') && all.has('Cl') && (raw.includes('CL2') || raw.includes('2NA') || raw.includes('NA+CL'));
    },
    lhs: [
      { coeff: '2', coeffReason: 'Συντελεστής 2 στο 2Na για ισοστάθμιση 2 ατόμων Na', atoms: [{ sym: 'Na', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'Cl', sub: '2', reason: 'Το Χλώριο είναι διατομικό μόριο (Cl₂)' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2NaCl για ισοστάθμιση 2 ατόμων Cl',
        atoms: [
          { sym: 'Na', sub: '' },
          { sym: 'Cl', sub: '' },
        ],
      },
    ],
  },
  {
    id: 'cao',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Ca') && all.has('O') && !raw.includes('⁺') && !raw.includes('⁻');
    },
    lhs: [
      { coeff: '2', coeffReason: 'Συντελεστής 2 στο 2Ca για ισοστάθμιση 2 ατόμων Ca', atoms: [{ sym: 'Ca', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'O', sub: '2', reason: 'Το Οξυγόνο είναι διατομικό μόριο (O₂)' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2CaO για ισοστάθμιση 2 ατόμων O',
        atoms: [
          { sym: 'Ca', sub: '' },
          { sym: 'O', sub: '', reason: 'Στο CaO η αναλογία Ca²⁺:O²⁻ είναι 1:1' },
        ],
      },
    ],
  },
  {
    id: 'mgo',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Mg') && all.has('O') && !raw.includes('⁺') && !raw.includes('⁻');
    },
    lhs: [
      { coeff: '2', coeffReason: 'Συντελεστής 2 στο 2Mg για ισοστάθμιση 2 ατόμων Mg', atoms: [{ sym: 'Mg', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'O', sub: '2', reason: 'Το Οξυγόνο είναι διατομικό μόριο (O₂)' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2MgO για ισοστάθμιση 2 ατόμων O',
        atoms: [
          { sym: 'Mg', sub: '' },
          { sym: 'O', sub: '', reason: 'Στο MgO η αναλογία Mg²⁺:O²⁻ είναι 1:1' },
        ],
      },
    ],
  },
  {
    id: 'na2o',
    matchElements: (lhs, rhs) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Na') && all.has('O');
    },
    lhs: [
      { coeff: '4', coeffReason: 'Συντελεστής 4 στο 4Na για ισοστάθμιση 4 ατόμων Na', atoms: [{ sym: 'Na', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'O', sub: '2', reason: 'Το Οξυγόνο είναι διατομικό μόριο (O₂)' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2Na₂O για ισοστάθμιση 2 ατόμων O',
        atoms: [
          { sym: 'Na', sub: '2', reason: 'Δείκτης ₂ στο Na₂O (σθένος Na = 1, O = 2)' },
          { sym: 'O', sub: '' },
        ],
      },
    ],
  },
  {
    id: 'k2o',
    matchElements: (lhs, rhs) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('K') && all.has('O');
    },
    lhs: [
      { coeff: '4', coeffReason: 'Συντελεστής 4 στο 4K για ισοστάθμιση 4 ατόμων K', atoms: [{ sym: 'K', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'O', sub: '2', reason: 'Το Οξυγόνο είναι διατομικό μόριο (O₂)' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2K₂O για ισοστάθμιση 2 ατόμων O',
        atoms: [
          { sym: 'K', sub: '2', reason: 'Δείκτης ₂ στο K₂O (σθένος K = 1, O = 2)' },
          { sym: 'O', sub: '' },
        ],
      },
    ],
  },
  {
    id: 'al2o3',
    matchElements: (lhs, rhs) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Al') && all.has('O');
    },
    lhs: [
      { coeff: '4', coeffReason: 'Συντελεστής 4 στο 4Al για ισοστάθμιση 4 ατόμων Al', atoms: [{ sym: 'Al', sub: '' }] },
      { coeff: '3', coeffReason: 'Συντελεστής 3 στο 3O₂ για ισοστάθμιση 6 ατόμων O', atoms: [{ sym: 'O', sub: '2', reason: 'Διατομικό O₂' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2Al₂O₃',
        atoms: [
          { sym: 'Al', sub: '2', reason: 'Δείκτης ₂ στο Al₂O₃ (σθένος Al = 3, O = 2)' },
          { sym: 'O', sub: '3', reason: 'Δείκτης ₃ στο Al₂O₃' },
        ],
      },
    ],
  },
  {
    id: 'fe2o3',
    matchElements: (lhs, rhs, raw) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Fe') && all.has('O') && !raw.includes('FE3O4');
    },
    lhs: [
      { coeff: '4', coeffReason: 'Συντελεστής 4 στο 4Fe για ισοστάθμιση 4 ατόμων Fe', atoms: [{ sym: 'Fe', sub: '' }] },
      { coeff: '3', coeffReason: 'Συντελεστής 3 στο 3O₂ για ισοστάθμιση 6 ατόμων O', atoms: [{ sym: 'O', sub: '2', reason: 'Διατομικό O₂' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2Fe₂O₃',
        atoms: [
          { sym: 'Fe', sub: '2', reason: 'Δείκτης ₂ στο Fe₂O₃' },
          { sym: 'O', sub: '3', reason: 'Δείκτης ₃ στο Fe₂O₃' },
        ],
      },
    ],
  },
  {
    id: 'cuo',
    matchElements: (lhs, rhs) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Cu') && all.has('O');
    },
    lhs: [
      { coeff: '2', coeffReason: 'Συντελεστής 2 στο 2Cu για ισοστάθμιση 2 ατόμων Cu', atoms: [{ sym: 'Cu', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'O', sub: '2', reason: 'Διατομικό O₂' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2CuO για ισοστάθμιση 2 ατόμων O',
        atoms: [
          { sym: 'Cu', sub: '' },
          { sym: 'O', sub: '' },
        ],
      },
    ],
  },
  {
    id: 'zno',
    matchElements: (lhs, rhs) => {
      const all = new Set([...lhs, ...rhs]);
      return all.size === 2 && all.has('Zn') && all.has('O');
    },
    lhs: [
      { coeff: '2', coeffReason: 'Συντελεστής 2 στο 2Zn για ισοστάθμιση 2 ατόμων Zn', atoms: [{ sym: 'Zn', sub: '' }] },
      { coeff: '', atoms: [{ sym: 'O', sub: '2', reason: 'Διατομικό O₂' }] },
    ],
    rhs: [
      {
        coeff: '2',
        coeffReason: 'Συντελεστής 2 στο 2ZnO για ισοστάθμιση 2 ατόμων O',
        atoms: [
          { sym: 'Zn', sub: '' },
          { sym: 'O', sub: '' },
        ],
      },
    ],
  },
];

// Πίνακας Κύριων & Επιτρεπτών Αριθμών Οξείδωσης (Α.Ο.) ανά Στοιχείο Περιοδικού Πίνακα
const ELEMENT_PRIMARY_POS_AO: Record<string, number> = {
  H: 1, Li: 1, Na: 1, K: 1, Rb: 1, Cs: 1, Ag: 1,
  Be: 2, Mg: 2, Ca: 2, Sr: 2, Ba: 2, Zn: 2, Cd: 2, Hg: 2, Cu: 2, Fe: 2, Co: 2, Ni: 2, Mn: 2, Pb: 2, Sn: 2,
  B: 3, Al: 3, Ga: 3, In: 3, Sc: 3, Y: 3, La: 3, Cr: 3, Bi: 3, Sb: 3, As: 3,
  C: 4, Si: 4, Ge: 4, Ti: 4, Zr: 4, Pt: 4,
  N: 3, P: 3, V: 5,
  S: 4, Se: 4, Te: 4,
  Cl: 1, Br: 1, I: 1, Au: 3,
};

const ELEMENT_ALLOWED_POS_AO: Record<string, number[]> = {
  H: [1], Li: [1], Na: [1], K: [1], Rb: [1], Cs: [1], Ag: [1],
  Be: [2], Mg: [2], Ca: [2], Sr: [2], Ba: [2], Zn: [2], Cd: [2],
  B: [3], Al: [3], Ga: [3], In: [3], Sc: [3],
  C: [2, 4], Si: [2, 3, 4], Ge: [2, 4], Sn: [2, 4], Pb: [2, 4],
  N: [1, 2, 3, 4, 5], P: [3, 5], As: [3, 5], Sb: [3, 5], Bi: [3, 5],
  S: [4, 6], Se: [4, 6], Te: [4, 6],
  Cl: [1, 3, 5, 7], Br: [1, 3, 5, 7], I: [1, 3, 5, 7],
  Fe: [2, 3], Cu: [1, 2], Cr: [2, 3, 6], Mn: [2, 3, 4, 6, 7], Co: [2, 3], Ni: [2], Hg: [1, 2], Au: [1, 3],
};

const ELEMENT_PRIMARY_NEG_AO: Record<string, number> = {
  F: -1, Cl: -1, Br: -1, I: -1, H: -1,
  O: -2, S: -2, Se: -2,
  N: -3, P: -3, C: -4,
};

const DIATOMIC_ELEMENTS_SET = new Set(['H', 'N', 'O', 'F', 'Cl', 'Br', 'I']);

export interface PolyatomicAnionSpec {
  formulaAscii: string;
  formulaPretty: string;
  charge: number; // π.χ. -1 για NO3, -2 για SO4, -3 για PO4
  nameStemEl: string; // π.χ. 'Νιτρικό', 'Θειικό', 'Υδροξείδιο'
  centralSym: string;
  centralAO: number;
  peripheralSym: string;
  peripheralCount: number;
  peripheralAO: number;
}

const POLYATOMIC_ANIONS: PolyatomicAnionSpec[] = [
  { formulaAscii: 'NO3', formulaPretty: 'NO₃', charge: -1, nameStemEl: 'Νιτρικό', centralSym: 'N', centralAO: 5, peripheralSym: 'O', peripheralCount: 3, peripheralAO: -2 },
  { formulaAscii: 'NO2', formulaPretty: 'NO₂', charge: -1, nameStemEl: 'Νιτρώδες', centralSym: 'N', centralAO: 3, peripheralSym: 'O', peripheralCount: 2, peripheralAO: -2 },
  { formulaAscii: 'OH', formulaPretty: 'OH', charge: -1, nameStemEl: 'Υδροξείδιο', centralSym: 'O', centralAO: -2, peripheralSym: 'H', peripheralCount: 1, peripheralAO: 1 },
  { formulaAscii: 'SO4', formulaPretty: 'SO₄', charge: -2, nameStemEl: 'Θειικό', centralSym: 'S', centralAO: 6, peripheralSym: 'O', peripheralCount: 4, peripheralAO: -2 },
  { formulaAscii: 'SO3', formulaPretty: 'SO₃', charge: -2, nameStemEl: 'Θειώδες', centralSym: 'S', centralAO: 4, peripheralSym: 'O', peripheralCount: 3, peripheralAO: -2 },
  { formulaAscii: 'CO3', formulaPretty: 'CO₃', charge: -2, nameStemEl: 'Ανθρακικό', centralSym: 'C', centralAO: 4, peripheralSym: 'O', peripheralCount: 3, peripheralAO: -2 },
  { formulaAscii: 'PO4', formulaPretty: 'PO₄', charge: -3, nameStemEl: 'Φωσφορικό', centralSym: 'P', centralAO: 5, peripheralSym: 'O', peripheralCount: 4, peripheralAO: -2 },
  { formulaAscii: 'ClO4', formulaPretty: 'ClO₄', charge: -1, nameStemEl: 'Υπερχλωρικό', centralSym: 'Cl', centralAO: 7, peripheralSym: 'O', peripheralCount: 4, peripheralAO: -2 },
  { formulaAscii: 'ClO3', formulaPretty: 'ClO₃', charge: -1, nameStemEl: 'Χλωρικό', centralSym: 'Cl', centralAO: 5, peripheralSym: 'O', peripheralCount: 3, peripheralAO: -2 },
  { formulaAscii: 'ClO2', formulaPretty: 'ClO₂', charge: -1, nameStemEl: 'Χλωριώδες', centralSym: 'Cl', centralAO: 3, peripheralSym: 'O', peripheralCount: 2, peripheralAO: -2 },
  { formulaAscii: 'ClO', formulaPretty: 'ClO', charge: -1, nameStemEl: 'Υποχλωριώδες', centralSym: 'Cl', centralAO: 1, peripheralSym: 'O', peripheralCount: 1, peripheralAO: -2 },
  { formulaAscii: 'BrO3', formulaPretty: 'BrO₃', charge: -1, nameStemEl: 'Βρωμικό', centralSym: 'Br', centralAO: 5, peripheralSym: 'O', peripheralCount: 3, peripheralAO: -2 },
  { formulaAscii: 'IO3', formulaPretty: 'IO₃', charge: -1, nameStemEl: 'Ιωδικό', centralSym: 'I', centralAO: 5, peripheralSym: 'O', peripheralCount: 3, peripheralAO: -2 },
  { formulaAscii: 'MnO4', formulaPretty: 'MnO₄', charge: -1, nameStemEl: 'Υπερμαγγανικό', centralSym: 'Mn', centralAO: 7, peripheralSym: 'O', peripheralCount: 4, peripheralAO: -2 },
];

export interface CompoundOxidationAnalysis {
  inputAscii: string;
  inputPretty: string;
  suggestedAscii: string;
  suggestedPretty: string;
  compoundNameEl: string;
  isValidOxidation: boolean;
  hadInitialError: boolean;
  initialWrongPretty?: string;
  items: { label: string; aoText: string; detail?: string }[];
  sumEquationText: string;
  explanationEl: string;
  polyatomicMatch?: {
    metalEl: PeriodicElement;
    metalCount: number;
    metalAO: number;
    anion: PolyatomicAnionSpec;
    anionCount: number;
  };
  alternativeCompounds?: {
    posAO: number;
    formulaAscii: string;
    formulaPretty: string;
    isCurrent: boolean;
  }[];
}

export function analyzeCompoundOxidationNumbers(
  formulaRaw: string,
  rawReactionEquation?: string
): CompoundOxidationAnalysis {
  const gcd2 = (a: number, b: number): number => (b === 0 ? a : gcd2(b, a % b));
  const cleanAscii = normalizeAsciiChem(formulaRaw || '')
    .replace(/\s+/g, '')
    .replace(/^\d+/, '');
  const inputPretty = formatChemEquationText(cleanAscii);

  // Αν δόθηκε η αρχική (χειρόγραφη) εξίσωση του μαθητή, βρες αν ο αντίστοιχος όρος είχε γραφτεί με λάθος Α.Ο. (π.χ. BaNO3 αντί Ba(NO3)2, SiO αντί SiO2, PCl αντί PCl3)
  let userInitialTermAscii: string | undefined;
  if (rawReactionEquation) {
    const rawTerms = normalizeAsciiChem(rawReactionEquation)
      .split(/->|\+/)
      .map((t) => t.trim().replace(/^\d+/, ''))
      .filter(Boolean);
    const targetSyms = Array.from(cleanAscii.matchAll(/[A-Z][a-z]?/g)).map((m) => m[0]);
    const matchedRaw = rawTerms.find((rt) => {
      const rSyms = Array.from(rt.matchAll(/[A-Z][a-z]?/g)).map((m) => m[0]);
      return (
        rSyms.length === targetSyms.length &&
        targetSyms.every((s) => rSyms.includes(s)) &&
        rt.toUpperCase() !== cleanAscii.toUpperCase()
      );
    });
    if (matchedRaw) {
      userInitialTermAscii = matchedRaw;
    }
  }

  // 1. Έλεγχος αν είναι άλας ή υδροξείδιο με πολυατομικό ανιόν: π.χ. Ba(NO3)2, BaNO3, Ca(OH)2, CaOH, Na2SO4, NaSO4, Al2(SO4)3
  for (const anion of POLYATOMIC_ANIONS) {
    const parenRegex = new RegExp(`^([A-Z][a-z]?)(\\d*)\\(${anion.formulaAscii}\\)(\\d+)$`);
    const directRegex = new RegExp(`^([A-Z][a-z]?)(\\d*)${anion.formulaAscii}(\\d*)$`);
    const mParen = cleanAscii.match(parenRegex);
    const mDirect = !mParen ? cleanAscii.match(directRegex) : null;
    const m = mParen || mDirect;
    if (m && m[1] !== 'H') {
      const metalEl = getPeriodicElementBySymbol(m[1]);
      const metalAO = metalEl ? ELEMENT_PRIMARY_POS_AO[metalEl.symbol] : undefined;
      if (metalEl && metalAO) {
        const curMetalCount = Math.max(1, parseInt(m[2] || '1', 10) || 1);
        const curAnionCount = Math.max(1, parseInt(m[3] || '1', 10) || 1);
        const g = gcd2(metalAO, Math.abs(anion.charge));
        const reqMetalCount = Math.abs(anion.charge) / g;
        const reqAnionCount = metalAO / g;

        const mSub = reqMetalCount > 1 ? String(reqMetalCount) : '';
        const aPart =
          reqAnionCount > 1 ? `(${anion.formulaAscii})${reqAnionCount}` : anion.formulaAscii;
        const suggestedAscii = `${metalEl.symbol}${mSub}${aPart}`;
        const suggestedPretty = formatChemEquationText(suggestedAscii);

        const isValid = curMetalCount * metalAO + curAnionCount * anion.charge === 0;
        const hadInitialError = !isValid || Boolean(userInitialTermAscii);
        const wrongPretty = !isValid
          ? inputPretty
          : userInitialTermAscii
          ? formatChemEquationText(userInitialTermAscii)
          : undefined;

        const compoundNameEl =
          anion.formulaAscii === 'OH'
            ? `Υδροξείδιο του ${metalEl.nameEl.endsWith('ο') ? metalEl.nameEl.slice(0, -1) + 'ου' : metalEl.nameEl}`
            : `${anion.nameStemEl} ${metalEl.nameEl}`;

        const anionSignStr = anion.charge < 0 ? String(anion.charge) : `+${anion.charge}`;
        const periphSignStr = anion.peripheralAO < 0 ? String(anion.peripheralAO) : `+${anion.peripheralAO}`;
        const centralSignStr = anion.centralAO > 0 ? `+${anion.centralAO}` : String(anion.centralAO);

        return {
          inputAscii: cleanAscii,
          inputPretty,
          suggestedAscii,
          suggestedPretty,
          compoundNameEl,
          isValidOxidation: isValid,
          hadInitialError,
          initialWrongPretty: wrongPretty,
          items: [
            { label: metalEl.symbol, aoText: `+${metalAO}` },
            {
              label: `${anion.formulaPretty}${anion.charge === -1 ? '⁻' : `²⁻`}`,
              aoText: anionSignStr,
              detail: `${anion.centralSym}: ${centralSignStr}, ${anion.peripheralSym}: ${periphSignStr}`,
            },
          ],
          sumEquationText: `${reqMetalCount > 1 ? `${reqMetalCount}·` : ''}(+${metalAO}) + ${reqAnionCount > 1 ? `${reqAnionCount}·` : ''}(${anionSignStr}) = 0`,
          explanationEl: hadInitialError
            ? `Το ${metalEl.nameEl} (${metalEl.symbol}) έχει Α.Ο. = +${metalAO} και το ιόν ${anion.formulaPretty} έχει φορτίο ${anionSignStr}. Για Σ(Α.Ο.) = 0 απαιτείται η ένωση ${suggestedPretty}.`
            : `Σωστοί Αριθμοί Οξείδωσης: ${metalEl.symbol} (+${metalAO}) και ${anion.formulaPretty} (${anionSignStr}) με Σ(Α.Ο.) = 0.`,
          polyatomicMatch: {
            metalEl,
            metalCount: reqMetalCount,
            metalAO,
            anion,
            anionCount: reqAnionCount,
          },
        };
      }
    }
  }

  // 2. Έλεγχος αν ο μαθητής είχε γράψει αρχικά BaNO3 (χωρίς παρένθεση) και τώρα το cleanAscii είναι Ba(NO3)2
  const parsed = parseFormulaToken(cleanAscii);

  // 3. Ελεύθερο στοιχείο (π.χ. Si, O2, P4, Cl2, H2, Na)
  if (parsed.atoms.length === 1) {
    const a0 = parsed.atoms[0];
    const el = getPeriodicElementBySymbol(a0.sym) || getPeriodicElementByZ(6);
    const isDiatomic = DIATOMIC_ELEMENTS_SET.has(el.symbol);
    const curSub = a0.sub || '1';
    const isValid = !isDiatomic || curSub === '2' || curSub === '3';
    const suggestedAscii = isDiatomic && curSub === '1' ? `${el.symbol}2` : cleanAscii;
    const suggestedPretty = formatChemEquationText(suggestedAscii);
    return {
      inputAscii: cleanAscii,
      inputPretty,
      suggestedAscii,
      suggestedPretty,
      compoundNameEl: el.nameEl,
      isValidOxidation: isValid,
      hadInitialError: !isValid || Boolean(userInitialTermAscii),
      initialWrongPretty: !isValid ? inputPretty : userInitialTermAscii ? formatChemEquationText(userInitialTermAscii) : undefined,
      items: [{ label: el.symbol, aoText: '0', detail: 'Ελεύθερο στοιχείο' }],
      sumEquationText: 'Α.Ο. = 0 (Ελεύθερο Στοιχείο)',
      explanationEl: `Κάθε ελεύθερο χημικό στοιχείο (${suggestedPretty}) έχει Αριθμό Οξείδωσης Α.Ο. = 0.`,
    };
  }

  // 4. Δυαδική ένωση AxBy (π.χ. SiO2, SiO, PCl3, PCl, BaCl2, HCl, Al2O3)
  if (parsed.atoms.length === 2) {
    const aA = parsed.atoms[0];
    const aB = parsed.atoms[1];
    const elA = getPeriodicElementBySymbol(aA.sym) || getPeriodicElementByZ(6);
    const elB = getPeriodicElementBySymbol(aB.sym) || getPeriodicElementByZ(8);
    const curX = Math.max(1, parseInt(aA.sub || '1', 10) || 1);
    const curY = Math.max(1, parseInt(aB.sub || '1', 10) || 1);
    const negB = ELEMENT_PRIMARY_NEG_AO[elB.symbol] ?? -1;
    const allowedPosA = ELEMENT_ALLOWED_POS_AO[elA.symbol] || [ELEMENT_PRIMARY_POS_AO[elA.symbol] || 1];
    const primaryPosA = ELEMENT_PRIMARY_POS_AO[elA.symbol] || allowedPosA[0] || 1;

    const matchedPosA = allowedPosA.find((posAO) => curX * posAO + curY * negB === 0);
    const isValid = Boolean(matchedPosA);
    const activePosA = matchedPosA ?? primaryPosA;

    const g = gcd2(activePosA, Math.abs(negB));
    const reqX = isValid ? curX : Math.abs(negB) / g;
    const reqY = isValid ? curY : activePosA / g;
    const suggestedAscii = `${elA.symbol}${reqX > 1 ? reqX : ''}${elB.symbol}${reqY > 1 ? reqY : ''}`;
    const suggestedPretty = formatChemEquationText(suggestedAscii);
    const hadInitialError = !isValid || Boolean(userInitialTermAscii);
    const wrongPretty = !isValid
      ? inputPretty
      : userInitialTermAscii
      ? formatChemEquationText(userInitialTermAscii)
      : undefined;

    const alternativeCompounds =
      allowedPosA.length > 1
        ? allowedPosA.map((ao) => {
            const ga = gcd2(ao, Math.abs(negB));
            const rx = Math.abs(negB) / ga;
            const ry = ao / ga;
            const fAscii = `${elA.symbol}${rx > 1 ? rx : ''}${elB.symbol}${ry > 1 ? ry : ''}`;
            return {
              posAO: ao,
              formulaAscii: fAscii,
              formulaPretty: formatChemEquationText(fAscii),
              isCurrent: ao === activePosA,
            };
          })
        : undefined;

    return {
      inputAscii: cleanAscii,
      inputPretty,
      suggestedAscii,
      suggestedPretty,
      compoundNameEl: `${elA.nameEl} - ${elB.nameEl} (${suggestedPretty})`,
      isValidOxidation: isValid,
      hadInitialError,
      initialWrongPretty: wrongPretty,
      items: [
        {
          label: elA.symbol,
          aoText: `+${activePosA}`,
          detail: allowedPosA.length === 1 ? 'μοναδικός Α.Ο.' : `επιτρεπτοί: ${allowedPosA.map((x) => `+${x}`).join(', ')}`,
        },
        { label: elB.symbol, aoText: `${negB}` },
      ],
      sumEquationText: `${reqX > 1 ? `${reqX}·` : ''}(+${activePosA}) + ${reqY > 1 ? `${reqY}·` : ''}(${negB}) = 0`,
      explanationEl: hadInitialError
        ? `Α.Ο.(${elA.symbol}) = +${activePosA} και Α.Ο.(${elB.symbol}) = ${negB}. Για να ισχύει Σ(Α.Ο.) = 0 η σωστή ένωση είναι ${suggestedPretty}.`
        : `Σωστοί Αριθμοί Οξείδωσης: ${elA.symbol} (+${activePosA}) και ${elB.symbol} (${negB}) με Σ(Α.Ο.) = 0.`,
      alternativeCompounds,
    };
  }

  // 5. Οξυοξέα / Τριαδικές ενώσεις HxXyOz (π.χ. HNO3, H2SO4, HBrO3, H2CO3, H3PO4)
  if (parsed.atoms.length === 3 && parsed.atoms[0].sym === 'H' && parsed.atoms[2].sym === 'O') {
    const aH = parsed.atoms[0];
    const aX = parsed.atoms[1];
    const aO = parsed.atoms[2];
    const nH = Math.max(1, parseInt(aH.sub || '1', 10) || 1);
    const nX = Math.max(1, parseInt(aX.sub || '1', 10) || 1);
    const nO = Math.max(1, parseInt(aO.sub || '1', 10) || 1);
    const xAO = Math.round((2 * nO - nH) / nX);
    return {
      inputAscii: cleanAscii,
      inputPretty,
      suggestedAscii: cleanAscii,
      suggestedPretty: inputPretty,
      compoundNameEl: inputPretty,
      isValidOxidation: true,
      hadInitialError: Boolean(userInitialTermAscii),
      initialWrongPretty: userInitialTermAscii ? formatChemEquationText(userInitialTermAscii) : undefined,
      items: [
        { label: 'H', aoText: '+1' },
        { label: aX.sym, aoText: `+${xAO}` },
        { label: 'O', aoText: '-2' },
      ],
      sumEquationText: `${nH > 1 ? `${nH}·` : ''}(+1) + ${nX > 1 ? `${nX}·` : ''}(+${xAO}) + ${nO > 1 ? `${nO}·` : ''}(-2) = 0`,
      explanationEl: `Αριθμοί Οξείδωσης στο ${inputPretty}: H (+1), ${aX.sym} (+${xAO}), O (-2) με Σ(Α.Ο.) = 0.`,
    };
  }

  return {
    inputAscii: cleanAscii,
    inputPretty,
    suggestedAscii: cleanAscii,
    suggestedPretty: inputPretty,
    compoundNameEl: inputPretty,
    isValidOxidation: true,
    hadInitialError: Boolean(userInitialTermAscii),
    initialWrongPretty: userInitialTermAscii ? formatChemEquationText(userInitialTermAscii) : undefined,
    items: parsed.atoms.map((a) => ({
      label: a.sym,
      aoText: a.sym === 'O' ? '-2' : a.sym === 'H' ? '+1' : `+${ELEMENT_PRIMARY_POS_AO[a.sym] || 2}`,
    })),
    sumEquationText: 'Σ(Α.Ο.) = 0',
    explanationEl: `Έλεγχος Αριθμών Οξείδωσης για ${inputPretty}: Σ(Α.Ο.) = 0.`,
  };
}

// Αυτόματος αλγεβρικός ισοσταθμιστής συντελεστών + Διορθωτής Αριθμών Οξείδωσης (Α.Ο.) για χημικές εξισώσεις (LHS -> RHS)
function tryAutoBalanceReactionSpec(
  userLhs: ParsedTermToken[],
  userRhs: ParsedTermToken[]
): CanonicalReactionSpec | undefined {
  if (userLhs.length === 0 || userRhs.length === 0) return undefined;
  const totalTerms = userLhs.length + userRhs.length;
  if (totalTerms < 2 || totalTerms > 6) return undefined;
  if (userLhs.some((t) => t.atoms.length === 0) || userRhs.some((t) => t.atoms.length === 0)) {
    return undefined;
  }

  const gcd2 = (a: number, b: number): number => (b === 0 ? a : gcd2(b, a % b));

  // Βήμα 1: Έλεγχος & Διόρθωση Χημικών Τύπων μέσω Αριθμών Οξείδωσης (Σ(Α.Ο.) = 0) και Διατομικών Στοιχείων
  const correctTermAtoms = (
    term: ParsedTermToken
  ): { sym: string; sub: string; reason?: string }[] => {
    // 1α. Ελεύθερο διατομικό στοιχείο (H₂, N₂, O₂, F₂, Cl₂, Br₂, I₂) με Α.Ο. = 0
    if (term.atoms.length === 1) {
      const a0 = term.atoms[0];
      if (DIATOMIC_ELEMENTS_SET.has(a0.sym) && (!a0.sub || a0.sub === '1')) {
        return [{ sym: a0.sym, sub: '2', reason: `Διατομικό στοιχείο ${a0.sym}₂ (Α.Ο. = 0)` }];
      }
      return [{ sym: a0.sym, sub: a0.sub }];
    }

    // 1β. Δυαδική ένωση AxBy (π.χ. SiO -> SiO2, PCl -> PCl3, AlO -> Al2O3, BaCl -> BaCl2, NaO -> Na2O)
    if (term.atoms.length === 2) {
      const aA = term.atoms[0];
      const aB = term.atoms[1];
      const negB = ELEMENT_PRIMARY_NEG_AO[aB.sym];
      const allowedPosA = ELEMENT_ALLOWED_POS_AO[aA.sym];
      const primaryPosA = ELEMENT_PRIMARY_POS_AO[aA.sym];

      if (negB && primaryPosA && allowedPosA) {
        const curX = Math.max(1, parseInt(aA.sub || '1', 10) || 1);
        const curY = Math.max(1, parseInt(aB.sub || '1', 10) || 1);
        // Αν ο μαθητής έγραψε απλή σύνθεση 2 στοιχείων χωρίς συντελεστή και χωρίς δείκτες (π.χ. Si + O₂ → SiO),
        // προτιμάμε τον κύριο Α.Ο. (+4 ⇒ SiO₂), ενώ αν έβαλε συντελεστή (2Si + O₂ → 2SiO) ή δείκτες (Si₂O₃), κρατάμε τον επιλεγμένο Α.Ο.!
        const isUnsubscriptedSimpleSynthesis =
          (aA.sym === 'Si' || aA.sym === 'Ge') &&
          !aA.sub &&
          !aB.sub &&
          !term.coeff &&
          userLhs.length === 2 &&
          userRhs.length === 1;
        // Ελέγχουμε αν οι τρέχοντες δείκτες ικανοποιούν Σ(Α.Ο.) = 0 για κάποιον επιτρεπτό Α.Ο. του A
        const isValidAO =
          !isUnsubscriptedSimpleSynthesis &&
          allowedPosA.some((posAO) => curX * posAO + curY * negB === 0);
        if (!isValidAO) {
          const g = gcd2(primaryPosA, Math.abs(negB));
          const reqX = Math.abs(negB) / g;
          const reqY = primaryPosA / g;
          const subX = reqX > 1 ? String(reqX) : '';
          const subY = reqY > 1 ? String(reqY) : '';
          const formulaUnicode = `${aA.sym}${toSubscriptDigits(subX)}${aB.sym}${toSubscriptDigits(subY)}`;
          const aoReason = `Αριθμοί Οξείδωσης: ${aA.sym} (+${primaryPosA}) και ${aB.sym} (${negB}) ⇒ ${formulaUnicode}`;
          return [
            { sym: aA.sym, sub: subX, reason: subX !== aA.sub ? aoReason : undefined },
            { sym: aB.sym, sub: subY, reason: subY !== aB.sub ? aoReason : undefined },
          ];
        }
      }
    }

    return term.atoms.map((a) => ({ sym: a.sym, sub: a.sub }));
  };

  const corrLhsAtoms = userLhs.map(correctTermAtoms);
  const corrRhsAtoms = userRhs.map(correctTermAtoms);

  const lhsElemSet = new Set(corrLhsAtoms.flatMap((atoms) => atoms.map((a) => a.sym)));
  const rhsElemSet = new Set(corrRhsAtoms.flatMap((atoms) => atoms.map((a) => a.sym)));
  if (lhsElemSet.size === 0 || lhsElemSet.size !== rhsElemSet.size) return undefined;
  for (const sym of lhsElemSet) {
    if (!rhsElemSet.has(sym)) return undefined;
  }
  const elements = Array.from(lhsElemSet);

  const countAtomInList = (atoms: { sym: string; sub: string }[], sym: string): number =>
    atoms
      .filter((a) => a.sym === sym)
      .reduce((acc, a) => acc + Math.max(1, parseInt(a.sub || '1', 10) || 1), 0);

  const isBalancedWithCoeffs = (coeffs: number[]): boolean => {
    for (const sym of elements) {
      let lSum = 0;
      for (let i = 0; i < corrLhsAtoms.length; i++) {
        lSum += coeffs[i] * countAtomInList(corrLhsAtoms[i], sym);
      }
      let rSum = 0;
      for (let j = 0; j < corrRhsAtoms.length; j++) {
        rSum += coeffs[corrLhsAtoms.length + j] * countAtomInList(corrRhsAtoms[j], sym);
      }
      if (lSum !== rSum || lSum === 0) return false;
    }
    return true;
  };

  const gcdArr = (arr: number[]): number => arr.reduce((g, x) => gcd2(g, x), arr[0] || 1);

  let bestCoeffs: number[] | null = null;
  let bestSum = Infinity;
  const maxC = totalTerms <= 3 ? 12 : totalTerms === 4 ? 10 : totalTerms === 5 ? 8 : 5;
  const cur: number[] = new Array(totalTerms).fill(1);

  const search = (idx: number, runningSum: number) => {
    if (runningSum >= bestSum) return;
    if (idx === totalTerms) {
      if (gcdArr(cur) === 1 && isBalancedWithCoeffs(cur)) {
        bestSum = runningSum;
        bestCoeffs = [...cur];
      }
      return;
    }
    for (let c = 1; c <= maxC; c++) {
      if (runningSum + c + (totalTerms - 1 - idx) >= bestSum) break;
      cur[idx] = c;
      search(idx + 1, runningSum + c);
    }
  };
  search(0, 0);

  if (!bestCoeffs) return undefined;
  const solved: number[] = bestCoeffs;

  return {
    id: 'auto_balanced',
    matchElements: () => true,
    lhs: corrLhsAtoms.map((atoms, i) => {
      const c = solved[i];
      const formulaStr = atoms.map((a) => `${a.sym}${toSubscriptDigits(a.sub)}`).join('');
      return {
        coeff: c === 1 ? '' : String(c),
        coeffReason: c > 1 ? `Συντελεστής ${c} στο ${c}${formulaStr} για ισοστάθμιση των ατόμων` : undefined,
        atoms,
      };
    }),
    rhs: corrRhsAtoms.map((atoms, j) => {
      const c = solved[corrLhsAtoms.length + j];
      const formulaStr = atoms.map((a) => `${a.sym}${toSubscriptDigits(a.sub)}`).join('');
      return {
        coeff: c === 1 ? '' : String(c),
        coeffReason: c > 1 ? `Συντελεστής ${c} στο ${c}${formulaStr} για ισοστάθμιση των ατόμων` : undefined,
        atoms,
      };
    }),
  };
}

// Μνήμη Cache για αποτελέσματα AI ChemOCR / AI Ισοστάθμισης (Οξειδοαναγωγή, Οργανική Χημεία, Οξέα-Βάσεις)
const aiChemValidationCache = new Map<string, ChemValidationResult>();

function normalizeChemCacheKey(raw: string): string {
  return normalizeAsciiChem(raw || '').replace(/\s+/g, '').toUpperCase();
}

/**
 * Δημιουργεί δομή ChemValidationResult συγκρίνοντας χαρακτήρα-προς-χαρακτήρα (μέσω LCS ανά όρο)
 * την αρχική εξίσωση του μαθητή (`rawInput`) με τη διορθωμένη/ισοσταθμισμένη εξίσωση του AI (`correctedEquation`),
 * ώστε όσα έγραψε ο μαθητής να εμφανίζονται με ΜΑΥΡΟ και όσα συμπλήρωσε/διόρθωσε το AI με ΚΟΚΚΙΝΟ!
 */
export function buildChemValidationFromAiCorrection(
  rawInput: string,
  correctedEquation: string,
  explanationNotes: string[] = []
): ChemValidationResult {
  const userFormatted = formatChemEquationText(rawInput);
  const corrFormatted = formatChemEquationText(correctedEquation);

  const userSides = userFormatted.split('→');
  const corrSides = corrFormatted.split('→');
  const segments: ChemDiffSegment[] = [];
  let hasCorrections = false;
  const defaultReason =
    explanationNotes[0] || 'Συμπληρώθηκαν οι σωστοί δείκτες, ενώσεις & συντελεστές ισοστάθμισης';

  const extractElemSyms = (term: string): string[] => {
    const ascii = normalizeAsciiChem(term);
    return Array.from(ascii.matchAll(/[A-Z][a-z]?/g)).map((m) => m[0]);
  };

  const diffTermStrings = (uStr: string, cStr: string, reasonNote: string): ChemDiffSegment[] => {
    if (uStr === cStr) {
      return [{ text: cStr, isCorrection: false }];
    }
    hasCorrections = true;
    if (!uStr) {
      return [{ text: cStr, isCorrection: true, reason: reasonNote }];
    }
    const uChars = Array.from(uStr);
    const cChars = Array.from(cStr);
    const m = uChars.length;
    const n = cChars.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (uChars[i] === cChars[j]) {
          dp[i][j] = 1 + dp[i + 1][j + 1];
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    const pairs: [number, number][] = [];
    let i = 0;
    let j = 0;
    while (i < m && j < n) {
      if (uChars[i] === cChars[j]) {
        pairs.push([i, j]);
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        i++;
      } else {
        j++;
      }
    }

    const out: ChemDiffSegment[] = [];
    let prevU = 0;
    let prevC = 0;
    for (const [uIdx, cIdx] of [...pairs, [m, n] as [number, number]]) {
      const uRem = uChars.slice(prevU, uIdx).join('');
      const cAdd = cChars.slice(prevC, cIdx).join('');
      if (cAdd || uRem) {
        out.push({
          text: cAdd,
          isCorrection: true,
          wrongText: uRem || undefined,
          reason: reasonNote,
        });
      }
      if (uIdx < m && cIdx < n) {
        const last = out[out.length - 1];
        if (last && !last.isCorrection && !last.wrongText) {
          last.text += cChars[cIdx];
        } else {
          out.push({ text: cChars[cIdx], isCorrection: false });
        }
      }
      prevU = uIdx + 1;
      prevC = cIdx + 1;
    }
    return out;
  };

  corrSides.forEach((corrSideStr, sIdx) => {
    if (sIdx > 0) {
      segments.push({ text: ' → ', isCorrection: false });
    }
    const cTerms = corrSideStr.split('+').map((t) => t.trim()).filter(Boolean);
    const uTerms = (userSides[sIdx] || '').split('+').map((t) => t.trim()).filter(Boolean);
    const usedU = new Set<number>();

    cTerms.forEach((cTerm, tIdx) => {
      if (tIdx > 0) {
        segments.push({ text: ' + ', isCorrection: false });
      }
      const cSyms = extractElemSyms(cTerm);
      let bestUIdx = -1;
      let bestScore = 0;
      uTerms.forEach((uTerm, uIdx) => {
        if (usedU.has(uIdx)) return;
        const uSyms = extractElemSyms(uTerm);
        let score = 0;
        for (const sym of cSyms) {
          if (uSyms.includes(sym)) {
            score += sym !== 'H' && sym !== 'O' ? 4 : 1;
          }
        }
        if (uIdx === tIdx && score > 0) score += 0.5;
        if (score > bestScore) {
          bestScore = score;
          bestUIdx = uIdx;
        }
      });
      if (bestUIdx === -1 && tIdx < uTerms.length && !usedU.has(tIdx)) {
        bestUIdx = tIdx;
      }

      const noteForTerm =
        explanationNotes.find((n) => {
          const asciiN = normalizeAsciiChem(n);
          const asciiC = normalizeAsciiChem(cTerm);
          return asciiN.includes(asciiC) || cSyms.some((sym) => sym !== 'H' && sym !== 'O' && asciiN.includes(sym));
        }) || defaultReason;

      if (bestUIdx >= 0) {
        usedU.add(bestUIdx);
        const termSegs = diffTermStrings(uTerms[bestUIdx], cTerm, noteForTerm);
        segments.push(...termSegs);
      } else {
        hasCorrections = true;
        segments.push({
          text: cTerm,
          isCorrection: true,
          reason: noteForTerm,
        });
      }
    });
  });

  return {
    hasCorrections,
    userRawFormatted: userFormatted,
    correctedEquation: corrFormatted,
    segments: segments.length > 0 ? segments : [{ text: corrFormatted, isCorrection: false }],
    explanationNotes: explanationNotes.length > 0 ? explanationNotes : hasCorrections ? [defaultReason] : [],
  };
}

function isEquationChemicallyValidAndBalanced(eqStr: string): boolean {
  const ascii = normalizeAsciiChem(eqStr || '').trim();
  if (!ascii.includes('->')) return false;
  const parts = ascii.split('->');
  if (parts.length !== 2) return false;
  const lhsTokensRaw = parts[0].split('+').map((s) => s.trim()).filter(Boolean);
  const rhsTokensRaw = parts[1].split('+').map((s) => s.trim()).filter(Boolean);
  if (lhsTokensRaw.length === 0 || rhsTokensRaw.length === 0) return false;

  for (const tok of [...lhsTokensRaw, ...rhsTokensRaw]) {
    const ox = analyzeCompoundOxidationNumbers(tok);
    if (!ox.isValidOxidation) return false;
  }

  const lhsParsed = lhsTokensRaw.map(parseFormulaToken);
  const rhsParsed = rhsTokensRaw.map(parseFormulaToken);
  const lhsCounts = new Map<string, number>();
  const rhsCounts = new Map<string, number>();

  for (const t of lhsParsed) {
    const c = Math.max(1, parseInt(t.coeff || '1', 10) || 1);
    for (const a of t.atoms) {
      const sub = Math.max(1, parseInt(a.sub || '1', 10) || 1);
      lhsCounts.set(a.sym, (lhsCounts.get(a.sym) || 0) + c * sub);
    }
  }
  for (const t of rhsParsed) {
    const c = Math.max(1, parseInt(t.coeff || '1', 10) || 1);
    for (const a of t.atoms) {
      const sub = Math.max(1, parseInt(a.sub || '1', 10) || 1);
      rhsCounts.set(a.sym, (rhsCounts.get(a.sym) || 0) + c * sub);
    }
  }
  if (lhsCounts.size === 0 || lhsCounts.size !== rhsCounts.size) return false;
  for (const [sym, cnt] of lhsCounts.entries()) {
    if (rhsCounts.get(sym) !== cnt) return false;
  }
  return true;
}

export function registerAiChemValidation(
  rawInput: string,
  correctedEquation: string,
  explanationNotes: string[] = []
): ChemValidationResult {
  const res = buildChemValidationFromAiCorrection(rawInput, correctedEquation, explanationNotes);
  const key = normalizeChemCacheKey(rawInput);
  if (key && isEquationChemicallyValidAndBalanced(correctedEquation)) {
    aiChemValidationCache.set(key, res);
  }
  return res;
}

export function validateAndCorrectChemicalEquation(
  userRawInput: string,
  savedOrAiCorrectedEq?: string
): ChemValidationResult {
  const ascii = normalizeAsciiChem(userRawInput);
  const parts = ascii.split('->');
  const lhsRaw = (parts[0] || '').trim();
  const rhsRaw = (parts[1] || '').trim();

  const lhsTokensRaw = lhsRaw ? lhsRaw.split('+').map((s) => s.trim()).filter(Boolean) : [];
  const rhsTokensRaw = rhsRaw ? rhsRaw.split('+').map((s) => s.trim()).filter(Boolean) : [];

  // Αν η εξίσωση περιέχει άλας/υδροξείδιο με πολυατομικό ιόν (π.χ. BaNO3 -> Ba(NO3)2, CaOH -> Ca(OH)2),
  // διορθώνουμε πρώτα τους πολυατομικούς τύπους με τις παρενθέσεις τους και ισοσταθμίζουμε τους συντελεστές!
  if (lhsTokensRaw.length > 0 && rhsTokensRaw.length > 0) {
    const lhsOx = lhsTokensRaw.map((t) => analyzeCompoundOxidationNumbers(t));
    const rhsOx = rhsTokensRaw.map((t) => analyzeCompoundOxidationNumbers(t));
    const hasPolyatomicTerm = [...lhsOx, ...rhsOx].some((ox) => Boolean(ox.polyatomicMatch));
    if (hasPolyatomicTerm) {
      const fixedLhsParsed = lhsOx.map((ox) => parseFormulaToken(ox.suggestedAscii));
      const fixedRhsParsed = rhsOx.map((ox) => parseFormulaToken(ox.suggestedAscii));
      const polyBalanced = tryAutoBalanceReactionSpec(fixedLhsParsed, fixedRhsParsed);
      if (polyBalanced) {
        const lhsStr = lhsOx
          .map((ox, i) => `${polyBalanced.lhs[i]?.coeff || ''}${ox.suggestedPretty}`)
          .join(' + ');
        const rhsStr = rhsOx
          .map((ox, j) => `${polyBalanced.rhs[j]?.coeff || ''}${ox.suggestedPretty}`)
          .join(' + ');
        const fullPolyEq = `${lhsStr} → ${rhsStr}`;
        const polyNotes = [...lhsOx, ...rhsOx]
          .filter((ox) => !ox.isValidOxidation)
          .map((ox) => ox.explanationEl);
        return buildChemValidationFromAiCorrection(userRawInput, fullPolyEq, polyNotes);
      }
    }
  }

  const userLhs = lhsTokensRaw.map(parseFormulaToken);
  const userRhs = rhsTokensRaw.map(parseFormulaToken);

  // Ολιστική ανάλυση ολόκληρης της αντίδρασης (Αρχή Διατήρησης Στοιχείων LHS <-> RHS):
  // αν κάποιο γράμμα στοιχείου γράφτηκε δυσανάγνωστα (π.χ. GO2 αντί CO2, MH3 αντί NH3, NaGl αντί NaCl),
  // διορθώνει το σύμβολο του στοιχείου από την απέναντι πλευρά του βέλους!
  inferReactionSideTokensFromConservation(userLhs, userRhs);

  const lhsSyms = userLhs.flatMap((t) => t.atoms.map((a) => a.sym));
  const rhsSyms = userRhs.flatMap((t) => t.atoms.map((a) => a.sym));
  const reconstructedAscii = `${userLhs
    .map((t) => `${t.coeff}${t.atoms.map((a) => `${a.sym}${a.sub}`).join('')}`)
    .join(' + ')}${ascii.includes('->') ? ' -> ' : ''}${userRhs
    .map((t) => `${t.coeff}${t.atoms.map((a) => `${a.sym}${a.sub}`).join('')}`)
    .join(' + ')}`.trim();

  const hasReactionStructure = ascii.includes('->') || ascii.includes('+');
  const autoBalancedSpec = hasReactionStructure
    ? tryAutoBalanceReactionSpec(userLhs, userRhs)
    : undefined;
  const canonicalSpec = hasReactionStructure
    ? CANONICAL_REACTIONS.find(
        (spec) =>
          spec.lhs.length === userLhs.length &&
          spec.rhs.length === userRhs.length &&
          spec.matchElements(lhsSyms, rhsSyms, reconstructedAscii.toUpperCase())
      )
    : undefined;
  // Αν ο χρήστης επέλεξε ή έγραψε έγκυρη ένωση με δευτερεύοντα Α.Ο. (π.χ. 2Fe + O₂ → 2FeO, 4Cu + O₂ → 2Cu₂O, 2C + O₂ → 2CO, 4Si + 3O₂ → 2Si₂O₃)
  // ή αντίδραση διάσπασης/δυσαναλογοποίησης (π.χ. 2Si₂O₃ → Si + 3SiO₂), προτιμάμε το autoBalancedSpec!
  const rhsFirstAscii = userRhs[0]?.atoms.map((a) => `${a.sym}${a.sub}`).join('') || '';
  const rhsHasExplicitValidAltAO =
    userRhs.length === 1 &&
    Boolean(rhsFirstAscii) &&
    !['CH', 'NH', 'HO', 'OH'].includes(rhsFirstAscii.toUpperCase()) &&
    analyzeCompoundOxidationNumbers(rhsFirstAscii).isValidOxidation;
  const matchedSpec = rhsHasExplicitValidAltAO
    ? autoBalancedSpec || canonicalSpec
    : canonicalSpec || autoBalancedSpec;

  if (!matchedSpec) {
    const cacheKey = normalizeChemCacheKey(userRawInput);
    const cachedAi = cacheKey ? aiChemValidationCache.get(cacheKey) : undefined;
    if (cachedAi && isEquationChemicallyValidAndBalanced(cachedAi.correctedEquation)) {
      return cachedAi;
    }
    // Αν υπάρχει ήδη αποθηκευμένη/διορθωμένη εξίσωση (π.χ. από AI ChemOCR σε σύνθετη οξειδοαναγωγή/οργανική) ΚΑΙ είναι χημικά έγκυρη & ισοσταθμισμένη:
    if (
      savedOrAiCorrectedEq &&
      normalizeChemCacheKey(savedOrAiCorrectedEq) !== normalizeChemCacheKey(userRawInput) &&
      isEquationChemicallyValidAndBalanced(savedOrAiCorrectedEq)
    ) {
      return buildChemValidationFromAiCorrection(userRawInput, savedOrAiCorrectedEq);
    }
    const formatted = formatChemEquationText(userRawInput);
    const arrowParts = formatted.split('→');
    const fallbackSegs: ChemDiffSegment[] = [];
    arrowParts.forEach((sideStr, sIdx) => {
      if (sIdx > 0) {
        fallbackSegs.push({ text: ' → ', isCorrection: false });
      }
      const plusTerms = sideStr.split('+').map((t) => t.trim()).filter(Boolean);
      plusTerms.forEach((termStr, tIdx) => {
        if (tIdx > 0) {
          fallbackSegs.push({ text: ' + ', isCorrection: false });
        }
        fallbackSegs.push({ text: termStr, isCorrection: false });
      });
    });
    return {
      hasCorrections: false,
      userRawFormatted: formatted,
      correctedEquation: formatted,
      segments: fallbackSegs.length > 0 ? fallbackSegs : [{ text: formatted, isCorrection: false }],
      explanationNotes: [],
    };
  }

  const segments: ChemDiffSegment[] = [];
  const explanationNotes: string[] = [];
  let hasCorrections = false;

  const compareSide = (
    canonicalTerms: CanonicalReactionSpec['lhs'],
    userTerms: ParsedTermToken[]
  ) => {
    canonicalTerms.forEach((cTerm, idx) => {
      if (idx > 0) {
        segments.push({ text: ' + ', isCorrection: false });
      }
      // Βρες τον αντίστοιχο όρο που έγραψε ο μαθητής (με βάση το πρώτο χημικό σύμβολο)
      const primarySym = cTerm.atoms[0]?.sym;
      const uTerm =
        matchedSpec.id === 'auto_balanced'
          ? userTerms[idx] || ({ coeff: '', atoms: [] } as ParsedTermToken)
          : userTerms.find((ut) => ut.atoms.some((ua) => ua.sym === primarySym)) ||
            userTerms[idx] ||
            ({ coeff: '', atoms: [] } as ParsedTermToken);

      const uCoeffNorm = uTerm.coeff === '1' ? '' : uTerm.coeff;
      const cCoeffNorm = cTerm.coeff === '1' ? '' : cTerm.coeff;

      if (uCoeffNorm !== cCoeffNorm) {
        hasCorrections = true;
        if (cTerm.coeffReason && !explanationNotes.includes(cTerm.coeffReason)) {
          explanationNotes.push(cTerm.coeffReason);
        }
        if (cCoeffNorm !== '') {
          segments.push({
            text: cCoeffNorm,
            isCorrection: true,
            wrongText: uCoeffNorm || undefined,
            reason: cTerm.coeffReason || `Συντελεστής ${cCoeffNorm}`,
          });
        } else if (uCoeffNorm !== '') {
          // Ο μαθητής έβαλε περιττό συντελεστή
          segments.push({
            text: '',
            isCorrection: true,
            wrongText: uCoeffNorm,
            reason: 'Περιττός συντελεστής',
          });
        }
      } else if (cCoeffNorm !== '') {
        segments.push({ text: cCoeffNorm, isCorrection: false });
      }

      // Σύγκριση κάθε ατόμου και του δείκτη του (subscript)
      cTerm.atoms.forEach((cAtom, aIdx) => {
        const uAtom =
          uTerm.atoms.length === cTerm.atoms.length && uTerm.atoms[aIdx]?.sym === cAtom.sym
            ? uTerm.atoms[aIdx]
            : uTerm.atoms.find((ua) => ua.sym === cAtom.sym);
        if (!uAtom) {
          // Ο μαθητής ξέχασε ολόκληρο το άτομο/δείκτη (π.χ. έγραψε μόνο αντιδρώντα "2H2 + O2 ->")
          hasCorrections = true;
          const subUnicode = toSubscriptDigits(cAtom.sub);
          segments.push({
            text: `${cAtom.sym}${subUnicode}`,
            isCorrection: true,
            reason: cAtom.reason || `Συμπλήρωση ${cAtom.sym}${subUnicode}`,
          });
          if (cAtom.reason && !explanationNotes.includes(cAtom.reason)) {
            explanationNotes.push(cAtom.reason);
          }
          return;
        }

        // Το σύμβολο του στοιχείου είναι σωστό
        segments.push({ text: cAtom.sym, isCorrection: false });

        const uSubNorm = uAtom.sub === '1' ? '' : uAtom.sub;
        const cSubNorm = cAtom.sub === '1' ? '' : cAtom.sub;

        if (uSubNorm !== cSubNorm) {
          hasCorrections = true;
          if (cAtom.reason && !explanationNotes.includes(cAtom.reason)) {
            explanationNotes.push(cAtom.reason);
          }
          const cSubUni = toSubscriptDigits(cSubNorm);
          const uSubUni = uSubNorm ? toSubscriptDigits(uSubNorm) : undefined;
          segments.push({
            text: cSubUni,
            isCorrection: true,
            wrongText: uSubUni,
            reason: cAtom.reason || `Σωστός δείκτης ατόμου: ${cSubUni || '1 (κανένας δείκτης)'}`,
          });
        } else if (cSubNorm !== '') {
          segments.push({ text: toSubscriptDigits(cSubNorm), isCorrection: false });
        }
      });
    });
  };

  compareSide(matchedSpec.lhs, userLhs);
  segments.push({ text: ' → ', isCorrection: false });
  compareSide(matchedSpec.rhs, userRhs);

  const correctedEquation = segments.map((s) => s.text).join('');
  return {
    hasCorrections,
    userRawFormatted: formatChemEquationText(userRawInput),
    correctedEquation,
    segments,
    explanationNotes,
  };
}

// ============================================================================
// 3D ΜΟΡΙΑΚΗ ΓΕΩΜΕΤΡΙΑ (VSEPR) & ΗΛΕΚΤΡΟΣΤΑΤΙΚΟ ΝΕΦΟΣ ΦΟΡΤΙΟΥ (δ⁺ / δ⁻)
// ============================================================================
export interface Atom3DNode {
  id: string;
  z: number;
  symbol: string;
  x: number; // 3D συντεταγμένες σε κανονικοποιημένες μονάδες (-1.2 έως +1.2)
  y: number;
  z3d: number;
  radiusFactor: number;
  color: string;
  electronegativity: number; // Κλίμακα Pauling
  partialCharge: number;     // -1.0 (έντονο δ⁻ κόκκινο/πορτοκαλί) έως +1.0 (έντονο δ⁺ μπλε/κυανό)
  chargeLabel: string;       // π.χ. 'δ⁻', '2δ⁻', 'δ⁺', 'Na⁺', 'Cl⁻'
}

export interface Bond3DEdge {
  fromIdx: number;
  toIdx: number;
  order: 1 | 2 | 3;
  isIonic?: boolean;
}

export interface LonePair3DLobe {
  x: number;
  y: number;
  z3d: number;
}

export interface Molecule3DModel {
  id: string;
  formula: string;
  nameEl: string;
  geometryLabel: string;
  bondAngleText: string;
  polarityLabel: string;
  dipoleVector?: { dx: number; dy: number; dz: number; label: string };
  atoms: Atom3DNode[];
  bonds: Bond3DEdge[];
  lonePairs: LonePair3DLobe[];
}

export const PRESET_3D_MOLECULES: Record<string, Molecule3DModel> = {
  H2O: {
    id: 'H2O',
    formula: 'H₂O',
    nameEl: 'Νερό (H₂O)',
    geometryLabel: 'Γωνιακή 3D Γεωμετρία (VSEPR AX₂E₂)',
    bondAngleText: '104.5°',
    polarityLabel: 'Ισχυρά Πολικό Μόριο',
    dipoleVector: { dx: 0, dy: -1, dz: 0, label: 'p⃗' },
    atoms: [
      {
        id: 'O1',
        z: 8,
        symbol: 'O',
        x: 0,
        y: -0.22,
        z3d: 0,
        radiusFactor: 1.25,
        color: '#ef4444',
        electronegativity: 3.44,
        partialCharge: -0.84,
        chargeLabel: '2δ⁻',
      },
      {
        id: 'H1',
        z: 1,
        symbol: 'H',
        x: -0.82,
        y: 0.42,
        z3d: 0.22,
        radiusFactor: 0.78,
        color: '#38bdf8',
        electronegativity: 2.20,
        partialCharge: +0.42,
        chargeLabel: 'δ⁺',
      },
      {
        id: 'H2',
        z: 1,
        symbol: 'H',
        x: 0.82,
        y: 0.42,
        z3d: -0.22,
        radiusFactor: 0.78,
        color: '#38bdf8',
        electronegativity: 2.20,
        partialCharge: +0.42,
        chargeLabel: 'δ⁺',
      },
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, order: 1 },
      { fromIdx: 0, toIdx: 2, order: 1 },
    ],
    lonePairs: [
      { x: 0, y: -0.78, z3d: 0.52 },
      { x: 0, y: -0.78, z3d: -0.52 },
    ],
  },
  CH4: {
    id: 'CH4',
    formula: 'CH₄',
    nameEl: 'Μεθάνιο (CH₄)',
    geometryLabel: 'Τετραεδρική 3D Γεωμετρία (VSEPR AX₄)',
    bondAngleText: '109.5°',
    polarityLabel: 'Μη Πολικό Μόριο',
    atoms: [
      {
        id: 'C1',
        z: 6,
        symbol: 'C',
        x: 0,
        y: 0,
        z3d: 0,
        radiusFactor: 1.18,
        color: '#334155',
        electronegativity: 2.55,
        partialCharge: -0.44,
        chargeLabel: '4δ⁻',
      },
      {
        id: 'H1',
        z: 1,
        symbol: 'H',
        x: 0,
        y: -0.96,
        z3d: 0,
        radiusFactor: 0.76,
        color: '#38bdf8',
        electronegativity: 2.20,
        partialCharge: +0.11,
        chargeLabel: 'δ⁺',
      },
      {
        id: 'H2',
        z: 1,
        symbol: 'H',
        x: 0.90,
        y: 0.32,
        z3d: 0,
        radiusFactor: 0.76,
        color: '#38bdf8',
        electronegativity: 2.20,
        partialCharge: +0.11,
        chargeLabel: 'δ⁺',
      },
      {
        id: 'H3',
        z: 1,
        symbol: 'H',
        x: -0.45,
        y: 0.32,
        z3d: 0.78,
        radiusFactor: 0.76,
        color: '#38bdf8',
        electronegativity: 2.20,
        partialCharge: +0.11,
        chargeLabel: 'δ⁺',
      },
      {
        id: 'H4',
        z: 1,
        symbol: 'H',
        x: -0.45,
        y: 0.32,
        z3d: -0.78,
        radiusFactor: 0.76,
        color: '#38bdf8',
        electronegativity: 2.20,
        partialCharge: +0.11,
        chargeLabel: 'δ⁺',
      },
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, order: 1 },
      { fromIdx: 0, toIdx: 2, order: 1 },
      { fromIdx: 0, toIdx: 3, order: 1 },
      { fromIdx: 0, toIdx: 4, order: 1 },
    ],
    lonePairs: [],
  },
  CO2: {
    id: 'CO2',
    formula: 'CO₂',
    nameEl: 'Διοξείδιο του Άνθρακα (CO₂)',
    geometryLabel: 'Γραμμική 3D Γεωμετρία (O = C = O)',
    bondAngleText: '180.0°',
    polarityLabel: 'Μη Πολικό Μόριο',
    atoms: [
      {
        id: 'O1',
        z: 8,
        symbol: 'O',
        x: -1.06,
        y: 0,
        z3d: 0,
        radiusFactor: 1.15,
        color: '#ef4444',
        electronegativity: 3.44,
        partialCharge: -0.65,
        chargeLabel: 'δ⁻',
      },
      {
        id: 'C1',
        z: 6,
        symbol: 'C',
        x: 0,
        y: 0,
        z3d: 0,
        radiusFactor: 1.12,
        color: '#475569',
        electronegativity: 2.55,
        partialCharge: +0.85,
        chargeLabel: '2δ⁺',
      },
      {
        id: 'O2',
        z: 8,
        symbol: 'O',
        x: 1.06,
        y: 0,
        z3d: 0,
        radiusFactor: 1.15,
        color: '#ef4444',
        electronegativity: 3.44,
        partialCharge: -0.65,
        chargeLabel: 'δ⁻',
      },
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, order: 2 },
      { fromIdx: 1, toIdx: 2, order: 2 },
    ],
    lonePairs: [],
  },
  NH3: {
    id: 'NH3',
    formula: 'NH₃',
    nameEl: 'Αμμωνία (NH₃)',
    geometryLabel: 'Τριγωνική Πυραμίδα 3D (VSEPR AX₃E)',
    bondAngleText: '107.0°',
    polarityLabel: 'Ισχυρά Πολικό Μόριο',
    dipoleVector: { dx: 0, dy: -1, dz: 0, label: 'p⃗' },
    atoms: [
      {
        id: 'N1',
        z: 7,
        symbol: 'N',
        x: 0,
        y: -0.25,
        z3d: 0,
        radiusFactor: 1.22,
        color: '#2563eb',
        electronegativity: 3.04,
        partialCharge: -0.78,
        chargeLabel: '3δ⁻',
      },
      {
        id: 'H1',
        z: 1,
        symbol: 'H',
        x: 0.84,
        y: 0.38,
        z3d: 0,
        radiusFactor: 0.76,
        color: '#38bdf8',
        electronegativity: 2.20,
        partialCharge: +0.26,
        chargeLabel: 'δ⁺',
      },
      {
        id: 'H2',
        z: 1,
        symbol: 'H',
        x: -0.42,
        y: 0.38,
        z3d: 0.73,
        radiusFactor: 0.76,
        color: '#38bdf8',
        electronegativity: 2.20,
        partialCharge: +0.26,
        chargeLabel: 'δ⁺',
      },
      {
        id: 'H3',
        z: 1,
        symbol: 'H',
        x: -0.42,
        y: 0.38,
        z3d: -0.73,
        radiusFactor: 0.76,
        color: '#38bdf8',
        electronegativity: 2.20,
        partialCharge: +0.26,
        chargeLabel: 'δ⁺',
      },
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, order: 1 },
      { fromIdx: 0, toIdx: 2, order: 1 },
      { fromIdx: 0, toIdx: 3, order: 1 },
    ],
    lonePairs: [{ x: 0, y: -0.84, z3d: 0 }],
  },
  NaCl: {
    id: 'NaCl',
    formula: 'Na⁺Cl⁻',
    nameEl: 'Χλωριούχο Νάτριο (Na⁺Cl⁻)',
    geometryLabel: 'Ετεροπολικός (Ιοντικός) Δεσμός 3D',
    bondAngleText: '180.0°',
    polarityLabel: 'Ιοντική Ένωση (Ισχυρά Πολική)',
    dipoleVector: { dx: -1, dy: 0, dz: 0, label: 'Na⁺ → Cl⁻' },
    atoms: [
      {
        id: 'Na1',
        z: 11,
        symbol: 'Na',
        x: -0.78,
        y: 0,
        z3d: 0,
        radiusFactor: 1.02,
        color: '#3b82f6',
        electronegativity: 0.93,
        partialCharge: +0.95,
        chargeLabel: 'Na⁺',
      },
      {
        id: 'Cl1',
        z: 17,
        symbol: 'Cl',
        x: 0.78,
        y: 0,
        z3d: 0,
        radiusFactor: 1.34,
        color: '#10b981',
        electronegativity: 3.16,
        partialCharge: -0.95,
        chargeLabel: 'Cl⁻',
      },
    ],
    bonds: [{ fromIdx: 0, toIdx: 1, order: 1, isIonic: true }],
    lonePairs: [],
  },
};

const PAULING_ELECTRONEGATIVITY: Record<number, number> = {
  1: 2.20,  // H
  2: 0.0,   // He
  3: 0.98,  // Li
  4: 1.57,  // Be
  5: 2.04,  // B
  6: 2.55,  // C
  7: 3.04,  // N
  8: 3.44,  // O
  9: 3.98,  // F
  11: 0.93, // Na
  12: 1.31, // Mg
  13: 1.61, // Al
  14: 1.90, // Si
  15: 2.19, // P
  16: 2.58, // S
  17: 3.16, // Cl
  19: 0.82, // K
  20: 1.00, // Ca
  26: 1.83, // Fe
  29: 1.90, // Cu
  30: 1.65, // Zn
  32: 2.01, // Ge
  33: 2.18, // As
  34: 2.55, // Se
  35: 2.96, // Br
  47: 1.93, // Ag
  50: 1.96, // Sn
  53: 2.66, // I
  56: 0.89, // Ba
};

const CPK_ATOM_COLORS: Record<number, string> = {
  1: '#38bdf8',  // H - Light Blue
  5: '#f472b6',  // B - Salmon/Pink
  6: '#334155',  // C - Charcoal
  7: '#2563eb',  // N - Royal Blue
  8: '#ef4444',  // O - Red
  9: '#22c55e',  // F - Green
  11: '#8b5cf6', // Na - Violet
  12: '#10b981', // Mg - Emerald
  13: '#94a3b8', // Al - Silver
  14: '#d97706', // Si - Ochre
  15: '#f97316', // P - Orange
  16: '#eab308', // S - Yellow
  17: '#10b981', // Cl - Green
  19: '#a855f7', // K - Purple
  20: '#14b8a6', // Ca - Teal
  35: '#991b1b', // Br - Dark Red
  53: '#6b21a8', // I - Deep Violet
};

const GREEK_COMPOUND_NAMES: Record<string, string> = {
  H2O: 'Νερό',
  CH4: 'Μεθάνιο',
  CO2: 'Διοξείδιο του Άνθρακα',
  NH3: 'Αμμωνία',
  NACL: 'Χλωριούχο Νάτριο',
  HCL: 'Υδροχλώριο',
  HF: 'Υδροφθόριο',
  HBR: 'Υδροβρώμιο',
  HI: 'Υδροϊώδιο',
  H2S: 'Υδρόθειο',
  SO2: 'Διοξείδιο του Θείου',
  SO3: 'Τριοξείδιο του Θείου',
  NO2: 'Διοξείδιο του Αζώτου',
  NO: 'Μονοξείδιο του Αζώτου',
  N2O: 'Υποξείδιο του Αζώτου',
  CO: 'Μονοξείδιο του Άνθρακα',
  O2: 'Οξυγόνο',
  N2: 'Άζωτο',
  H2: 'Υδρογόνο',
  CL2: 'Χλώριο',
  F2: 'Φθόριο',
  BR2: 'Βρώμιο',
  I2: 'Ιώδιο',
  O3: 'Όζον',
  BF3: 'Τριφθοριούχο Βόριο',
  BCL3: 'Τριχλωριούχο Βόριο',
  CCL4: 'Τετραχλωράνθρακας',
  CHCL3: 'Χλωροφόρμιο',
  PCL3: 'Τριχλωριούχος Φωσφόρος',
  PCL5: 'Πενταχλωριούχος Φωσφόρος',
  SF6: 'Εξαφθοριούχο Θείο',
  PH3: 'Φωσφίνη',
  SIH4: 'Σιλάνιο',
  SICL4: 'Τετραχλωριούχο Πυρίτιο',
  NF3: 'Τριφθοριούχο Άζωτο',
  OF2: 'Διφθοριούχο Οξυγόνο',
  CS2: 'Διθειούχος Άνθρακας',
  BECL2: 'Χλωριούχο Βηρύλλιο',
  MGO: 'Οξείδιο του Μαγνησίου',
  CAO: 'Οξείδιο του Ασβεστίου',
  CACL2: 'Χλωριούχο Ασβέστιο',
  MGCL2: 'Χλωριούχο Μαγνήσιο',
  LIF: 'Φθοριούχο Λίθιο',
  KCL: 'Χλωριούχο Κάλιο',
  KBR: 'Βρωμιούχο Κάλιο',
  KI: 'Ιωδιούχο Κάλιο',
  CH2O: 'Φορμαλδεΰδη',
  HCN: 'Υδροκυάνιο',
  H2O2: 'Υπεροξείδιο του Υδρογόνου',
  C2H4: 'Αιθένιο',
  C2H2: 'Αιθίνιο',
  C2H6: 'Αιθάνιο',
  H2SO4: 'Θειικό Οξύ',
  HNO3: 'Νιτρικό Οξύ',
  NAOH: 'Υδροξείδιο του Νατρίου',
  KOH: 'Υδροξείδιο του Καλίου',
  SIO2: 'Διοξείδιο του Πυριτίου',
  SI2O3: 'Τριοξείδιο του Πυριτίου',
  SIO3: 'Τριοξείδιο του Πυριτίου',
  SIO: 'Μονοξείδιο του Πυριτίου',
  AL2O3: 'Τριοξείδιο του Αργιλίου',
  FE2O3: 'Τριοξείδιο του Σιδήρου',
  FEO: 'Οξείδιο του Σιδήρου',
  FE3O4: 'Επιτεταρτοξείδιο του Σιδήρου',
  B2O3: 'Τριοξείδιο του Βορίου',
  P2O5: 'Πεντοξείδιο του Φωσφόρου',
  P2O3: 'Τριοξείδιο του Φωσφόρου',
  P4O10: 'Πεντοξείδιο του Φωσφόρου',
  N2O5: 'Πεντοξείδιο του Αζώτου',
  N2O3: 'Τριοξείδιο του Αζώτου',
  N2O4: 'Τετροξείδιο του Αζώτου',
  CL2O7: 'Επτοξείδιο του Χλωρίου',
  CL2O: 'Μονοξείδιο του Χλωρίου',
  CLO2: 'Διοξείδιο του Χλωρίου',
  CUO: 'Οξείδιο του Χαλκού',
  CU2O: 'Υποξείδιο του Χαλκού',
  ZNO: 'Οξείδιο του Ψευδαργύρου',
  NA2O: 'Οξείδιο του Νατρίου',
  K2O: 'Οξείδιο του Καλίου',
  LI2O: 'Οξείδιο του Λιθίου',
  ALCL3: 'Τριχλωριούχο Αργίλιο',
  FECL3: 'Τριχλωριούχος Σίδηρος',
  FECL2: 'Διχλωριούχος Σίδηρος',
  CUCL2: 'Διχλωριούχος Χαλκός',
  ZNCL2: 'Χλωριούχος Ψευδάργυρος',
  AGCL: 'Χλωριούχος Άργυρος',
  H3PO4: 'Φωσφορικό Οξύ',
  H2CO3: 'Ανθρακικό Οξύ',
  H2SO3: 'Θειώδες Οξύ',
  HNO2: 'Νιτρώδες Οξύ',
  HCLO4: 'Υπερχλωρικό Οξύ',
  HCLO3: 'Χλωρικό Οξύ',
  HCLO2: 'Χλωριώδες Οξύ',
  HCLO: 'Υποχλωριώδες Οξύ',
  HBRO3: 'Βρωμικό Οξύ',
  HBRO4: 'Υπερβρωμικό Οξύ',
  HBRO: 'Υποβρωμιώδες Οξύ',
  BRO3: 'Βρωμικό Ιόν',
  CLO3: 'Χλωρικό Ιόν',
  HIO3: 'Ιωδικό Οξύ',
  KMNO4: 'Υπερμαγγανικό Κάλιο',
  K2CR2O7: 'Διχρωμικό Κάλιο',
  MNO2: 'Διοξείδιο του Μαγγανίου',
  CACO3: 'Ανθρακικό Ασβέστιο',
  NA2CO3: 'Ανθρακικό Νάτριο',
  NAHCO3: 'Όξινο Ανθρακικό Νάτριο',
  CUSO4: 'Θειικός Χαλκός',
  KNO3: 'Νιτρικό Κάλιο',
  NANO3: 'Νιτρικό Νάτριο',
  BANO32: 'Νιτρικό Βάριο',
  BAN2O6: 'Νιτρικό Βάριο',
  BACL2: 'Χλωριούχο Βάριο',
  BAO: 'Οξείδιο του Βαρίου',
  SRO: 'Οξείδιο του Στροντίου',
  SRCL2: 'Χλωριούχο Στρόντιο',
  P4: 'Λευκός Φωσφόρος (P₄)',
  CAOH2: 'Υδροξείδιο του Ασβεστίου',
  CAO2H2: 'Υδροξείδιο του Ασβεστίου',
  MGOH2: 'Υδροξείδιο του Μαγνησίου',
  MGO2H2: 'Υδροξείδιο του Μαγνησίου',
  CH3OH: 'Μεθανόλη',
  C2H5OH: 'Αιθανόλη',
  CH3COOH: 'Οξικό Οξύ',
  C6H6: 'Βενζόλιο',
  C6H12O6: 'Γλυκόζη',
  C3H8: 'Προπάνιο',
  C4H10: 'Βουτάνιο',
  C3H6: 'Προπένιο',
  C3H4: 'Προπίνιο',
};

const ELEMENT_GENITIVE_EL: Record<number, string> = {
  1: 'του Υδρογόνου',
  3: 'του Λιθίου',
  4: 'του Βηρυλλίου',
  5: 'του Βορίου',
  6: 'του Άνθρακα',
  7: 'του Αζώτου',
  8: 'του Οξυγόνου',
  9: 'του Φθορίου',
  11: 'του Νατρίου',
  12: 'του Μαγνησίου',
  13: 'του Αργιλίου',
  14: 'του Πυριτίου',
  15: 'του Φωσφόρου',
  16: 'του Θείου',
  17: 'του Χλωρίου',
  19: 'του Καλίου',
  20: 'του Ασβεστίου',
  22: 'του Τιτανίου',
  24: 'του Χρωμίου',
  25: 'του Μαγγανίου',
  26: 'του Σιδήρου',
  27: 'του Κοβαλτίου',
  28: 'του Νικελίου',
  29: 'του Χαλκού',
  30: 'του Ψευδαργύρου',
  32: 'του Γερμανίου',
  33: 'του Αρσενικού',
  34: 'του Σεληνίου',
  35: 'του Βρωμίου',
  38: 'του Στροντίου',
  47: 'του Αργύρου',
  50: 'του Κασσιτέρου',
  53: 'του Ιωδίου',
  54: 'του Ξένου',
  56: 'του Βαρίου',
  78: 'του Λευκοχρύσου',
  79: 'του Χρυσού',
  80: 'του Υδραργύρου',
  82: 'του Μολύβδου',
};

function inferGreekCompoundName(
  groups: { el: PeriodicElement; count: number }[],
  upperKey: string,
  prettyFormula: string
): string {
  if (GREEK_COMPOUND_NAMES[upperKey]) return GREEK_COMPOUND_NAMES[upperKey];

  // Αυτόματη Ελληνική Ονοματολογία για δυαδικές ενώσεις A_m B_n (Οξείδια, Αλογονίδια, Θειούχα, Υδρίδια, Νιτρίδια)
  if (groups.length === 2) {
    const [g1, g2] = groups;
    const gen1 = ELEMENT_GENITIVE_EL[g1.el.z] || `του ${g1.el.nameEl}`;
    const n2 = g2.count;

    // 1. Οξείδια (π.χ. Si2O3 -> Τριοξείδιο του Πυριτίου, Cl2O7 -> Επτοξείδιο του Χλωρίου, MnO2 -> Διοξείδιο του Μαγγανίου)
    if (g2.el.z === 8) {
      const oxidePrefix: Record<number, string> = {
        1: g1.el.category === 'nonmetal' || g1.el.category === 'metalloid' ? 'Μονοξείδιο' : 'Οξείδιο',
        2: 'Διοξείδιο',
        3: 'Τριοξείδιο',
        4: 'Τετροξείδιο',
        5: 'Πεντοξείδιο',
        6: 'Εξοξείδιο',
        7: 'Επτοξείδιο',
        8: 'Οκτοξείδιο',
      };
      const oxWord = oxidePrefix[n2] || 'Οξείδιο';
      return `${oxWord} ${gen1}`;
    }

    // 2. Αλογονίδια (F, Cl, Br, I)
    const halideStem: Record<number, string> = {
      9: 'φθοριούχο',
      17: 'χλωριούχο',
      35: 'βρωμιούχο',
      53: 'ιωδιούχο',
    };
    if (halideStem[g2.el.z] && g1.el.z !== 1) {
      const numPref: Record<number, string> = {
        1: '',
        2: 'Δι',
        3: 'Τρι',
        4: 'Τετρα',
        5: 'Πεντα',
        6: 'Εξα',
      };
      const pref = numPref[n2] ?? '';
      const stem = halideStem[g2.el.z];
      const capWord = pref ? `${pref}${stem}` : stem[0].toUpperCase() + stem.slice(1);
      const isMasc = [6, 15, 26, 29, 30, 47, 50, 78, 79, 80, 82].includes(g1.el.z);
      const adj = isMasc ? `${capWord}ς` : capWord;
      return `${adj} ${g1.el.nameEl}`;
    }

    // 3. Θειούχα (S)
    if (g2.el.z === 16 && g1.el.z !== 1) {
      const numPref: Record<number, string> = { 1: '', 2: 'Δι', 3: 'Τρι', 4: 'Τετρα', 5: 'Πεντα' };
      const pref = numPref[n2] ?? '';
      const base = pref ? `${pref}θειούχο` : 'Θειούχο';
      const isMasc = [6, 15, 26, 29, 30, 47, 50, 78, 79, 80, 82].includes(g1.el.z);
      return `${isMasc ? `${base}ς` : base} ${g1.el.nameEl}`;
    }

    // 4. Υδρίδια (H)
    if (g2.el.z === 1) {
      return `Υδρίδιο ${gen1}`;
    }
  }

  return `Ένωση ${prettyFormula}`;
}

/**
 * Καθαρίζει τυπικά OCR σφάλματα σε χειρόγραφους χημικούς τύπους (π.χ. "H20" -> "H2O", "C02" -> "CO2", "S02" -> "SO2").
 */
export function normalizeHandwrittenCompoundFormula(rawInput: string): string {
  let s = normalizeAsciiChem(rawInput || '').trim();
  // Αν είναι αντίδραση (π.χ. 2H2 + O2 -> 2H2O), πάρε το κύριο προϊόν
  if (s.includes('->')) {
    const rhs = (s.split('->')[1] || s).trim();
    s = (rhs.split('+')[0] || rhs).trim();
  }
  // Αφαίρεση αρχικού στοιχειομετρικού συντελεστή (π.χ. "2H2O" -> "H2O", "2 H2O" -> "H2O")
  s = s.replace(/^\d+\s*/, '').replace(/\s+/g, '');
  // Διόρθωση "0" (μηδέν) που γράφτηκε αντί για "O" (Οξυγόνο): π.χ. H20 -> H2O, C02 -> CO2, S02 -> SO2, S03 -> SO3, N02 -> NO2
  s = s
    .replace(/^([A-Za-z]+\d*)0(\d*)$/i, '$1O$2')
    .replace(/^([CHNSPKMgCaAlFe]+)0(\d*)$/i, '$1O$2');
  return s;
}

/**
 * Καθολικός VSEPR + Pauling 3D Γεννήτορας Μορίων (100% χωρίς AI API!).
 * Δέχεται οποιονδήποτε χημικό τύπο (π.χ. HCl, SO2, SO3, BF3, CCl4, PH3, SF6, PCl5, O2, N2, H2S, CaCl2, κ.λπ.)
 * και κατασκευάζει αυτόματα τις 3D συντεταγμένες VSEPR, τα μονήρη ζεύγη, το χρωματικό νέφος φορτίου δ⁺/δ⁻ και την πολικότητα!
 */
export function buildProcedural3DMoleculeFromFormula(formulaRaw: string): Molecule3DModel {
  const oxInfo = analyzeCompoundOxidationNumbers(formulaRaw);
  const cleanFormula = normalizeHandwrittenCompoundFormula(oxInfo.suggestedAscii || formulaRaw);

  // Ειδικός 3D Γεννήτορας για Άλατα/Υδροξείδια με Πολυατομικά Ιόντα (π.χ. Ba(NO3)2, Ca(OH)2, Mg(OH)2, Cu(NO3)2, KNO3, CaCO3, Na2SO4)
  if (oxInfo.polyatomicMatch) {
    const { metalEl, metalCount, metalAO, anion, anionCount } = oxInfo.polyatomicMatch;
    const centralAnionEl = getPeriodicElementBySymbol(anion.centralSym) || getPeriodicElementByZ(7);
    const periphAnionEl = getPeriodicElementBySymbol(anion.peripheralSym) || getPeriodicElementByZ(8);
    const chiMetal = PAULING_ELECTRONEGATIVITY[metalEl.z] ?? 1.0;
    const chiCenter = PAULING_ELECTRONEGATIVITY[centralAnionEl.z] ?? 3.0;
    const chiPeriph = PAULING_ELECTRONEGATIVITY[periphAnionEl.z] ?? 3.5;

    const atoms3D: Atom3DNode[] = [
      {
        id: `${metalEl.symbol}0`,
        z: metalEl.z,
        symbol: metalEl.symbol,
        x: 0,
        y: 0,
        z3d: 0,
        radiusFactor: 1.28,
        color: CPK_ATOM_COLORS[metalEl.z] || '#6366f1',
        electronegativity: chiMetal,
        partialCharge: 0.85,
        chargeLabel: metalAO > 1 ? `δ⁺` : `δ⁺`,
      },
    ];
    const bonds3D: Bond3DEdge[] = [];

    // Αν έχουμε >1 κατιόντα μετάλλου (π.χ. Na2SO4, Na2CO3), τοποθέτησε το επιπλέον κατιόν από πάνω
    for (let mIdx = 1; mIdx < Math.min(3, metalCount); mIdx++) {
      atoms3D.push({
        id: `${metalEl.symbol}${mIdx}`,
        z: metalEl.z,
        symbol: metalEl.symbol,
        x: 0,
        y: mIdx === 1 ? -0.95 : 0.95,
        z3d: 0,
        radiusFactor: 1.18,
        color: CPK_ATOM_COLORS[metalEl.z] || '#6366f1',
        electronegativity: chiMetal,
        partialCharge: 0.8,
        chargeLabel: 'δ⁺',
      });
    }

    const nGroups = Math.min(3, Math.max(1, anionCount));
    for (let gIdx = 0; gIdx < nGroups; gIdx++) {
      const dirX = nGroups === 1 ? 0.88 : gIdx === 0 ? -0.95 : gIdx === 1 ? 0.95 : 0;
      const dirY = nGroups === 3 && gIdx === 2 ? -0.95 : 0;
      const cIdx = atoms3D.length;
      atoms3D.push({
        id: `${centralAnionEl.symbol}_${gIdx}`,
        z: centralAnionEl.z,
        symbol: centralAnionEl.symbol,
        x: dirX,
        y: dirY,
        z3d: 0,
        radiusFactor: centralAnionEl.z <= 10 ? 1.06 : 1.14,
        color: CPK_ATOM_COLORS[centralAnionEl.z] || '#2563eb',
        electronegativity: chiCenter,
        partialCharge: 0.35,
        chargeLabel: 'δ⁺',
      });
      bonds3D.push({
        fromIdx: 0,
        toIdx: cIdx,
        order: 1,
        isIonic: true,
      });

      const pCount = Math.min(4, Math.max(1, anion.peripheralCount));
      const sign = dirX < 0 ? -1 : 1;
      const pOffsets =
        pCount === 1
          ? [{ dx: sign * 0.58, dy: 0, dz: 0 }]
          : pCount === 2
          ? [
              { dx: sign * 0.52, dy: 0.48, dz: 0.16 },
              { dx: sign * 0.52, dy: -0.48, dz: -0.16 },
            ]
          : pCount === 3
          ? [
              { dx: sign * 0.62, dy: 0, dz: 0 },
              { dx: sign * 0.24, dy: 0.58, dz: 0.24 * sign },
              { dx: sign * 0.24, dy: -0.58, dz: -0.24 * sign },
            ]
          : [
              { dx: sign * 0.62, dy: 0, dz: 0 },
              { dx: sign * 0.22, dy: 0.58, dz: 0.28 },
              { dx: sign * 0.22, dy: -0.58, dz: 0.28 },
              { dx: sign * 0.22, dy: 0, dz: -0.58 },
            ];

      pOffsets.forEach((off, pIdx) => {
        const pAtomIdx = atoms3D.length;
        atoms3D.push({
          id: `${periphAnionEl.symbol}_${gIdx}_${pIdx}`,
          z: periphAnionEl.z,
          symbol: periphAnionEl.symbol,
          x: dirX + off.dx,
          y: dirY + off.dy,
          z3d: off.dz,
          radiusFactor: periphAnionEl.z === 1 ? 0.72 : 0.96,
          color: CPK_ATOM_COLORS[periphAnionEl.z] || '#ef4444',
          electronegativity: chiPeriph,
          partialCharge: periphAnionEl.z === 1 ? 0.35 : -0.55,
          chargeLabel: periphAnionEl.z === 1 ? 'δ⁺' : 'δ⁻',
        });
        bonds3D.push({
          fromIdx: cIdx,
          toIdx: pAtomIdx,
          order: pIdx === 0 && periphAnionEl.z === 8 && pCount >= 2 ? 2 : 1,
          isIonic: false,
        });
      });
    }

    return {
      id: oxInfo.suggestedAscii,
      formula: oxInfo.suggestedPretty,
      nameEl: `${oxInfo.compoundNameEl} (${oxInfo.suggestedPretty})`,
      geometryLabel: `Ιοντική Ένωση ${metalEl.symbol}⁺${metalAO} με ${anionCount}× ${anion.formulaPretty}⁻`,
      bondAngleText: anion.peripheralCount === 3 ? '120.0°' : '109.5°',
      polarityLabel: 'Ιοντική Ένωση (Ισχυρά Πολική)',
      atoms: atoms3D,
      bonds: bonds3D,
      lonePairs: [],
    };
  }

  const parsed = parseFormulaToken(cleanFormula);
  if (!parsed.atoms || parsed.atoms.length === 0) {
    return PRESET_3D_MOLECULES.H2O;
  }

  // Κανονικοποίηση συμβόλων (π.χ. "cl" -> "Cl", "na" -> "Na", "o" -> "O")
  const groups: { el: PeriodicElement; count: number }[] = [];
  for (const item of parsed.atoms) {
    const normSym =
      item.sym.length >= 2
        ? item.sym[0].toUpperCase() + item.sym.slice(1).toLowerCase()
        : item.sym.toUpperCase();
    const foundEl =
      PERIODIC_ELEMENTS_H_TO_RN.find((e) => e.symbol.toLowerCase() === normSym.toLowerCase()) ||
      PERIODIC_ELEMENTS_H_TO_RN[0];
    const subNum = parseInt(item.sub || '1', 10);
    groups.push({ el: foundEl, count: Math.max(1, Number.isFinite(subNum) ? subNum : 1) });
  }

  const canonicalAscii = groups
    .map((g) => `${g.el.symbol}${g.count > 1 ? g.count : ''}`)
    .join('');
  const upperKey = canonicalAscii.toUpperCase();

  if (PRESET_3D_MOLECULES[canonicalAscii]) return PRESET_3D_MOLECULES[canonicalAscii];
  if (PRESET_3D_MOLECULES[upperKey]) return PRESET_3D_MOLECULES[upperKey];

  const prettyFormula = formatChemEquationText(canonicalAscii);
  const greekName = inferGreekCompoundName(groups, upperKey, prettyFormula);
  const fullNameEl = `${greekName} (${prettyFormula})`;
  const isMetalEl = (el: PeriodicElement) =>
    el.category !== 'nonmetal' && el.category !== 'noble' && el.category !== 'metalloid';

  // 0. Μονοατομικό στοιχείο (π.χ. C, Na, Mg, Fe, He, Ne, Ar)
  if (groups.length === 1 && groups[0].count === 1) {
    const el = groups[0].el;
    const chi = PAULING_ELECTRONEGATIVITY[el.z] ?? 2.0;
    const col = CPK_ATOM_COLORS[el.z] || '#38bdf8';
    return {
      id: canonicalAscii,
      formula: el.symbol,
      nameEl: `${el.nameEl} (${el.symbol})`,
      geometryLabel: 'Μονοατομικό Στοιχείο 3D',
      bondAngleText: '—',
      polarityLabel: 'Μη Πολικό (Ελεύθερο Άτομο)',
      atoms: [
        {
          id: `${el.symbol}1`,
          z: el.z,
          symbol: el.symbol,
          x: 0,
          y: 0,
          z3d: 0,
          radiusFactor: el.z === 1 ? 0.92 : el.z <= 10 ? 1.25 : 1.38,
          color: col,
          electronegativity: chi,
          partialCharge: 0,
          chargeLabel: '',
        },
      ],
      bonds: [],
      lonePairs: [],
    };
  }

  // 1. Διατομικό ομοπυρηνικό μόριο (π.χ. H2, O2, N2, Cl2, F2)
  if (groups.length === 1 && groups[0].count === 2) {
    const el = groups[0].el;
    const chi = PAULING_ELECTRONEGATIVITY[el.z] ?? 2.2;
    const col = CPK_ATOM_COLORS[el.z] || '#38bdf8';
    const rFac = el.z === 1 ? 0.78 : el.z <= 10 ? 1.12 : 1.24;
    const bondOrder: 1 | 2 | 3 = el.z === 7 ? 3 : el.z === 8 ? 2 : 1;
    return {
      id: canonicalAscii,
      formula: prettyFormula,
      nameEl: fullNameEl,
      geometryLabel: 'Γραμμική 3D Γεωμετρία',
      bondAngleText: '180.0°',
      polarityLabel: 'Μη Πολικό Μόριο',
      atoms: [
        {
          id: `${el.symbol}1`,
          z: el.z,
          symbol: el.symbol,
          x: -0.78,
          y: 0,
          z3d: 0,
          radiusFactor: rFac,
          color: col,
          electronegativity: chi,
          partialCharge: 0,
          chargeLabel: '',
        },
        {
          id: `${el.symbol}2`,
          z: el.z,
          symbol: el.symbol,
          x: 0.78,
          y: 0,
          z3d: 0,
          radiusFactor: rFac,
          color: col,
          electronegativity: chi,
          partialCharge: 0,
          chargeLabel: '',
        },
      ],
      bonds: [{ fromIdx: 0, toIdx: 1, order: bondOrder }],
      lonePairs: [],
    };
  }

  // 1β. Τετρατομικό ομοπυρηνικό μόριο (π.χ. P4 — Τετραεδρικός Λευκός Φωσφόρος)
  if (groups.length === 1 && groups[0].count === 4) {
    const el = groups[0].el;
    const chi = PAULING_ELECTRONEGATIVITY[el.z] ?? 2.19;
    const col = CPK_ATOM_COLORS[el.z] || '#f97316';
    const coords = [
      { x: 0, y: -0.82, z3d: 0 },
      { x: 0.78, y: 0.34, z3d: 0 },
      { x: -0.39, y: 0.34, z3d: 0.68 },
      { x: -0.39, y: 0.34, z3d: -0.68 },
    ];
    return {
      id: canonicalAscii,
      formula: prettyFormula,
      nameEl: el.z === 15 ? `Λευκός Φωσφόρος (${prettyFormula})` : fullNameEl,
      geometryLabel: 'Τετραεδρικό Κλουβί 3D (P₄)',
      bondAngleText: '60.0°',
      polarityLabel: 'Μη Πολικό Μόριο',
      atoms: coords.map((c, idx) => ({
        id: `${el.symbol}${idx + 1}`,
        z: el.z,
        symbol: el.symbol,
        x: c.x,
        y: c.y,
        z3d: c.z3d,
        radiusFactor: 1.14,
        color: col,
        electronegativity: chi,
        partialCharge: 0,
        chargeLabel: '',
      })),
      bonds: [
        { fromIdx: 0, toIdx: 1, order: 1 },
        { fromIdx: 0, toIdx: 2, order: 1 },
        { fromIdx: 0, toIdx: 3, order: 1 },
        { fromIdx: 1, toIdx: 2, order: 1 },
        { fromIdx: 1, toIdx: 3, order: 1 },
        { fromIdx: 2, toIdx: 3, order: 1 },
      ],
      lonePairs: [],
    };
  }

  // 2. Διατομικό ετεροπυρηνικό μόριο (π.χ. HCl, HF, HBr, HI, CO, NO, LiF, KCl, MgO, CaO)
  if (
    groups.length === 2 &&
    groups[0].count === 1 &&
    groups[1].count === 1
  ) {
    const el1 = groups[0].el;
    const el2 = groups[1].el;
    const chi1 = PAULING_ELECTRONEGATIVITY[el1.z] ?? 2.0;
    const chi2 = PAULING_ELECTRONEGATIVITY[el2.z] ?? 2.5;
    const dChi = Math.abs(chi2 - chi1);
    const isIonic = dChi >= 1.7 || isMetalEl(el1) !== isMetalEl(el2);
    const sign1 = chi1 < chi2 ? 1 : -1;
    const pMag = Math.min(0.95, Math.max(0.18, dChi / 2.2));
    const bondOrder: 1 | 2 | 3 =
      (el1.z === 6 && el2.z === 8) || (el1.z === 7 && el2.z === 8) ? 2 : 1;

    return {
      id: canonicalAscii,
      formula: prettyFormula,
      nameEl: fullNameEl,
      geometryLabel: isIonic ? 'Ετεροπολικός (Ιοντικός) Δεσμός 3D' : 'Γραμμική 3D Γεωμετρία',
      bondAngleText: '180.0°',
      polarityLabel: isIonic
        ? 'Ιοντική Ένωση (Ισχυρά Πολική)'
        : dChi >= 0.8
        ? 'Ισχυρά Πολικό Μόριο'
        : dChi >= 0.35
        ? 'Πολικό Μόριο'
        : 'Μη Πολικό Μόριο',
      dipoleVector: dChi >= 0.35 ? { dx: -sign1, dy: 0, dz: 0, label: 'p⃗' } : undefined,
      atoms: [
        {
          id: `${el1.symbol}1`,
          z: el1.z,
          symbol: el1.symbol,
          x: -0.78,
          y: 0,
          z3d: 0,
          radiusFactor: el1.z === 1 ? 0.78 : 1.12,
          color: CPK_ATOM_COLORS[el1.z] || '#38bdf8',
          electronegativity: chi1,
          partialCharge: sign1 * pMag,
          chargeLabel: isIonic ? (sign1 > 0 ? `${el1.symbol}⁺` : `${el1.symbol}⁻`) : sign1 > 0 ? 'δ⁺' : 'δ⁻',
        },
        {
          id: `${el2.symbol}1`,
          z: el2.z,
          symbol: el2.symbol,
          x: 0.78,
          y: 0,
          z3d: 0,
          radiusFactor: el2.z === 1 ? 0.78 : 1.24,
          color: CPK_ATOM_COLORS[el2.z] || '#10b981',
          electronegativity: chi2,
          partialCharge: -sign1 * pMag,
          chargeLabel: isIonic ? (-sign1 > 0 ? `${el2.symbol}⁺` : `${el2.symbol}⁻`) : -sign1 > 0 ? 'δ⁺' : 'δ⁻',
        },
      ],
      bonds: [{ fromIdx: 0, toIdx: 1, order: bondOrder, isIonic }],
      lonePairs: [],
    };
  }

  // 2β. Ενώσεις A₂B₃ (π.χ. Si₂O₃, Al₂O₃, Fe₂O₃, N₂O₃, P₂O₃, B₂O₃) — Δομή Γέφυρας B = A — B — A = B
  if (groups.length === 2 && groups[0].count === 2 && groups[1].count === 3) {
    const elA = groups[0].el;
    const elB = groups[1].el;
    const chiA = PAULING_ELECTRONEGATIVITY[elA.z] ?? 1.9;
    const chiB = PAULING_ELECTRONEGATIVITY[elB.z] ?? 3.44;
    const isIonic = isMetalEl(elA) && !isMetalEl(elB);
    const colA = CPK_ATOM_COLORS[elA.z] || '#0284c7';
    const colB = CPK_ATOM_COLORS[elB.z] || '#ef4444';
    return {
      id: canonicalAscii,
      formula: prettyFormula,
      nameEl: fullNameEl,
      geometryLabel: `Γεφυρωμένη 3D Δομή (${elB.symbol}=${elA.symbol}—${elB.symbol}—${elA.symbol}=${elB.symbol})`,
      bondAngleText: '120.0°',
      polarityLabel: isIonic ? 'Ιοντική Ένωση (Ισχυρά Πολική)' : 'Πολικό Μόριο',
      atoms: [
        {
          id: `${elB.symbol}_bridge`,
          z: elB.z,
          symbol: elB.symbol,
          x: 0,
          y: -0.26,
          z3d: 0,
          radiusFactor: 1.06,
          color: colB,
          electronegativity: chiB,
          partialCharge: -0.48,
          chargeLabel: 'δ⁻',
        },
        {
          id: `${elA.symbol}1`,
          z: elA.z,
          symbol: elA.symbol,
          x: -0.76,
          y: 0.22,
          z3d: 0.12,
          radiusFactor: 1.18,
          color: colA,
          electronegativity: chiA,
          partialCharge: 0.65,
          chargeLabel: 'δ⁺',
        },
        {
          id: `${elA.symbol}2`,
          z: elA.z,
          symbol: elA.symbol,
          x: 0.76,
          y: 0.22,
          z3d: -0.12,
          radiusFactor: 1.18,
          color: colA,
          electronegativity: chiA,
          partialCharge: 0.65,
          chargeLabel: 'δ⁺',
        },
        {
          id: `${elB.symbol}_left`,
          z: elB.z,
          symbol: elB.symbol,
          x: -1.36,
          y: -0.28,
          z3d: -0.22,
          radiusFactor: 1.04,
          color: colB,
          electronegativity: chiB,
          partialCharge: -0.45,
          chargeLabel: 'δ⁻',
        },
        {
          id: `${elB.symbol}_right`,
          z: elB.z,
          symbol: elB.symbol,
          x: 1.36,
          y: -0.28,
          z3d: 0.22,
          radiusFactor: 1.04,
          color: colB,
          electronegativity: chiB,
          partialCharge: -0.45,
          chargeLabel: 'δ⁻',
        },
      ],
      bonds: [
        { fromIdx: 0, toIdx: 1, order: 1, isIonic },
        { fromIdx: 0, toIdx: 2, order: 1, isIonic },
        { fromIdx: 1, toIdx: 3, order: isIonic ? 1 : 2, isIonic },
        { fromIdx: 2, toIdx: 4, order: isIonic ? 1 : 2, isIonic },
        ...(elA.z === 14 ? [{ fromIdx: 1, toIdx: 2, order: 1 as const, isIonic: false }] : []),
      ],
      lonePairs: [],
    };
  }

  // 3. Γενικό πολυατομικό μόριο AX_n E_m (π.χ. H2S, SO2, SO3, BF3, CCl4, PH3, PCl3, PCl5, SF6, NF3, OF2, CS2, CaCl2...)
  // Επιλογή κεντρικού ατόμου: προτιμάμε άτομο με count === 1 που ΔΕΝ είναι H (π.χ. στο H2S είναι το S, στο SO2 είναι το S, στο CH2O είναι το C)
  let centralGroupIdx = groups.findIndex((g) => g.count === 1 && g.el.z !== 1);
  if (centralGroupIdx === -1) {
    centralGroupIdx = groups.findIndex((g) => g.el.z !== 1);
  }
  if (centralGroupIdx === -1) centralGroupIdx = 0;

  const centralEl = groups[centralGroupIdx].el;
  const ligandList: PeriodicElement[] = [];
  groups.forEach((g, idx) => {
    const cnt = idx === centralGroupIdx ? g.count - 1 : g.count;
    for (let k = 0; k < cnt; k++) {
      ligandList.push(g.el);
    }
  });

  const nLigands = Math.min(6, Math.max(1, ligandList.length));
  const valenceE = centralEl.shells[centralEl.shells.length - 1] || 4;
  // Αριθμός ηλεκτρονίων που χρειάζεται κάθε περιφερειακό άτομο (1 για H/αλογόνα, 2 για O/S)
  const usedElectrons = ligandList.reduce((acc, lig) => {
    if (lig.z === 8 || lig.z === 16) return acc + 2;
    return acc + 1;
  }, 0);
  const lonePairCount = Math.max(0, Math.floor((valenceE - usedElectrons) / 2));

  // Υπολογισμός 3D θέσεων περιφερειακών ατόμων & μονήρων ζευγών κατά VSEPR
  let centralPos = { x: 0, y: 0, z3d: 0 };
  let ligandCoords: { x: number; y: number; z3d: number }[] = [];
  let lonePairs: LonePair3DLobe[] = [];
  let geometryLabel = '3D Μοριακή Γεωμετρία';
  let bondAngleText = '109.5°';
  let isSymmetricGeometry = false;

  if (nLigands === 2) {
    if (lonePairCount === 0) {
      // Γραμμικό AX2 (π.χ. CO2, CS2, BeCl2)
      geometryLabel = 'Γραμμική 3D Γεωμετρία (VSEPR AX₂)';
      bondAngleText = '180.0°';
      isSymmetricGeometry = true;
      ligandCoords = [
        { x: -1.02, y: 0, z3d: 0 },
        { x: 1.02, y: 0, z3d: 0 },
      ];
    } else {
      // Γωνιακό AX2E ή AX2E2 (π.χ. H2O, H2S, SO2, OF2, NO2, O3)
      geometryLabel = 'Γωνιακή 3D Γεωμετρία (VSEPR)';
      bondAngleText = lonePairCount === 1 ? '119.0°' : '104.5°';
      isSymmetricGeometry = false;
      centralPos = { x: 0, y: -0.22, z3d: 0 };
      ligandCoords = [
        { x: -0.84, y: 0.42, z3d: 0.18 },
        { x: 0.84, y: 0.42, z3d: -0.18 },
      ];
      lonePairs =
        lonePairCount === 1
          ? [{ x: 0, y: -0.82, z3d: 0 }]
          : [
              { x: 0, y: -0.78, z3d: 0.50 },
              { x: 0, y: -0.78, z3d: -0.50 },
            ];
    }
  } else if (nLigands === 3) {
    if (lonePairCount === 0) {
      // Επίπεδο Τριγωνικό AX3 (π.χ. SO3, BF3, BCl3, CH2O)
      geometryLabel = 'Επίπεδη Τριγωνική 3D Γεωμετρία (VSEPR AX₃)';
      bondAngleText = '120.0°';
      isSymmetricGeometry = true;
      ligandCoords = [
        { x: 0, y: -0.96, z3d: 0 },
        { x: 0.86, y: 0.48, z3d: 0.15 },
        { x: -0.86, y: 0.48, z3d: -0.15 },
      ];
    } else {
      // Τριγωνική Πυραμίδα AX3E (π.χ. NH3, PH3, PCl3, NF3, AsH3)
      geometryLabel = 'Τριγωνική Πυραμίδα 3D (VSEPR AX₃E)';
      bondAngleText = '107.0°';
      isSymmetricGeometry = false;
      centralPos = { x: 0, y: -0.24, z3d: 0 };
      ligandCoords = [
        { x: 0.84, y: 0.38, z3d: 0 },
        { x: -0.42, y: 0.38, z3d: 0.73 },
        { x: -0.42, y: 0.38, z3d: -0.73 },
      ];
      lonePairs = [{ x: 0, y: -0.84, z3d: 0 }];
    }
  } else if (nLigands === 4) {
    // Τετραεδρικό AX4 (π.χ. CH4, CCl4, SiH4, SiCl4)
    geometryLabel = 'Τετραεδρική 3D Γεωμετρία (VSEPR AX₄)';
    bondAngleText = '109.5°';
    isSymmetricGeometry = lonePairCount === 0;
    ligandCoords = [
      { x: 0, y: -0.96, z3d: 0 },
      { x: 0.90, y: 0.32, z3d: 0 },
      { x: -0.45, y: 0.32, z3d: 0.78 },
      { x: -0.45, y: 0.32, z3d: -0.78 },
    ];
  } else if (nLigands === 5) {
    // Τριγωνική Διπυραμίδα AX5 (π.χ. PCl5)
    geometryLabel = 'Τριγωνική Διπυραμίδα 3D (VSEPR AX₅)';
    bondAngleText = '90° / 120°';
    isSymmetricGeometry = true;
    ligandCoords = [
      { x: 0, y: -1.0, z3d: 0 },
      { x: 0, y: 1.0, z3d: 0 },
      { x: 0.92, y: 0, z3d: 0 },
      { x: -0.46, y: 0, z3d: 0.80 },
      { x: -0.46, y: 0, z3d: -0.80 },
    ];
  } else {
    // Οκταεδρικό AX6 (π.χ. SF6)
    geometryLabel = 'Οκταεδρική 3D Γεωμετρία (VSEPR AX₆)';
    bondAngleText = '90.0°';
    isSymmetricGeometry = true;
    ligandCoords = [
      { x: 0, y: -1.0, z3d: 0 },
      { x: 0, y: 1.0, z3d: 0 },
      { x: 0.95, y: 0, z3d: 0 },
      { x: -0.95, y: 0, z3d: 0 },
      { x: 0, y: 0, z3d: 0.95 },
      { x: 0, y: 0, z3d: -0.95 },
    ];
  }

  const chiCentral = PAULING_ELECTRONEGATIVITY[centralEl.z] ?? 2.2;
  const allSameLigand = ligandList.every((l) => l.z === ligandList[0]?.z);
  const avgLigChi =
    ligandList.reduce((acc, l) => acc + (PAULING_ELECTRONEGATIVITY[l.z] ?? 2.5), 0) /
    Math.max(1, ligandList.length);
  const maxDChi = Math.max(
    ...ligandList.map((l) => Math.abs((PAULING_ELECTRONEGATIVITY[l.z] ?? 2.5) - chiCentral))
  );
  const isIonicMol = isMetalEl(centralEl);

  const centralChargeSign = chiCentral < avgLigChi ? 1 : -1;
  const centralChargeMag = Math.min(0.88, Math.max(0.25, maxDChi * 0.45));

  const atoms3D: Atom3DNode[] = [
    {
      id: `${centralEl.symbol}0`,
      z: centralEl.z,
      symbol: centralEl.symbol,
      x: centralPos.x,
      y: centralPos.y,
      z3d: centralPos.z3d,
      radiusFactor: centralEl.z <= 10 ? 1.18 : 1.28,
      color: CPK_ATOM_COLORS[centralEl.z] || '#6366f1',
      electronegativity: chiCentral,
      partialCharge: centralChargeSign * centralChargeMag,
      chargeLabel: centralChargeSign > 0 ? 'δ⁺' : 'δ⁻',
    },
  ];

  const bonds3D: Bond3DEdge[] = [];
  for (let i = 0; i < Math.min(ligandList.length, ligandCoords.length); i++) {
    const ligEl = ligandList[i];
    const coord = ligandCoords[i];
    const chiLig = PAULING_ELECTRONEGATIVITY[ligEl.z] ?? 2.5;
    const ligSign = chiLig < chiCentral ? 1 : -1;
    const ligMag = Math.min(0.85, Math.max(0.22, Math.abs(chiLig - chiCentral) * 0.42));
    atoms3D.push({
      id: `${ligEl.symbol}${i + 1}`,
      z: ligEl.z,
      symbol: ligEl.symbol,
      x: coord.x,
      y: coord.y,
      z3d: coord.z3d,
      radiusFactor: ligEl.z === 1 ? 0.76 : ligEl.z <= 10 ? 1.08 : 1.18,
      color: CPK_ATOM_COLORS[ligEl.z] || '#38bdf8',
      electronegativity: chiLig,
      partialCharge: ligSign * ligMag,
      chargeLabel: ligSign > 0 ? 'δ⁺' : 'δ⁻',
    });
    const order: 1 | 2 | 3 =
      (ligEl.z === 8 || ligEl.z === 16) && centralEl.z !== 1 && !isIonicMol ? 2 : 1;
    bonds3D.push({
      fromIdx: 0,
      toIdx: i + 1,
      order,
      isIonic: isIonicMol,
    });
  }

  // Καθορισμός πολικότητας μορίου
  const isNonPolar = isSymmetricGeometry && allSameLigand && !isIonicMol;
  let polarityLabel = 'Πολικό Μόριο';
  if (isIonicMol) {
    polarityLabel = 'Ιοντική Ένωση (Ισχυρά Πολική)';
  } else if (isNonPolar) {
    polarityLabel = 'Μη Πολικό Μόριο';
  } else if (maxDChi >= 0.75 || lonePairCount >= 1) {
    polarityLabel = 'Ισχυρά Πολικό Μόριο';
  }

  return {
    id: canonicalAscii,
    formula: prettyFormula,
    nameEl: fullNameEl,
    geometryLabel,
    bondAngleText,
    polarityLabel,
    dipoleVector: isNonPolar ? undefined : { dx: 0, dy: -1, dz: 0, label: 'p⃗' },
    atoms: atoms3D,
    bonds: bonds3D,
    lonePairs,
  };
}

export function get3DMoleculeModel(reactionText?: string, atomZList?: number[], forcedMolId?: string): Molecule3DModel {
  if (forcedMolId) {
    const cleanForced = normalizeHandwrittenCompoundFormula(forcedMolId);
    if (PRESET_3D_MOLECULES[cleanForced]) return PRESET_3D_MOLECULES[cleanForced];
    if (PRESET_3D_MOLECULES[cleanForced.toUpperCase()]) {
      return PRESET_3D_MOLECULES[cleanForced.toUpperCase()];
    }
    return buildProcedural3DMoleculeFromFormula(cleanForced);
  }
  if (reactionText && reactionText.trim()) {
    const cleanTarget = normalizeHandwrittenCompoundFormula(reactionText);
    if (PRESET_3D_MOLECULES[cleanTarget]) return PRESET_3D_MOLECULES[cleanTarget];
    if (PRESET_3D_MOLECULES[cleanTarget.toUpperCase()]) {
      return PRESET_3D_MOLECULES[cleanTarget.toUpperCase()];
    }
    if (cleanTarget.length > 0) {
      return buildProcedural3DMoleculeFromFormula(cleanTarget);
    }
  }

  // Έλεγχος από τα άτομα στον καμβά
  if (atomZList && atomZList.length > 0) {
    const counts = new Map<number, number>();
    for (const z of atomZList) counts.set(z, (counts.get(z) || 0) + 1);
    if ((counts.get(1) || 0) >= 2 && (counts.get(8) || 0) === 1 && !counts.has(6)) return PRESET_3D_MOLECULES.H2O;
    if ((counts.get(6) || 0) === 1 && (counts.get(8) || 0) >= 2) return PRESET_3D_MOLECULES.CO2;
    if ((counts.get(6) || 0) === 1 && (counts.get(1) || 0) >= 2) return PRESET_3D_MOLECULES.CH4;
    if ((counts.get(7) || 0) === 1 && (counts.get(1) || 0) >= 2) return PRESET_3D_MOLECULES.NH3;
    if ((counts.get(11) || 0) >= 1 && (counts.get(17) || 0) >= 1) return PRESET_3D_MOLECULES.NaCl;
  }

  return PRESET_3D_MOLECULES.H2O;
}

// ============================================================================
// ΦΥΣΙΚΗ ΚΛΙΜΑΚΩΣΗ ΑΚΤΙΝΑΣ ΠΥΡΗΝΑ & ΤΡΟΧΙΩΝ ΑΝΑΛΟΓΑ ΜΕ ΤΟΝ ΑΤΟΜΙΚΟ ΑΡΙΘΜΟ Z
// & ΔΟΜΗΣΗ ΑΤΟΜΩΝ/ΜΟΡΙΟΥ ΟΤΑΝ Ο ΧΡΗΣΤΗΣ ΚΑΝΕΙ ΚΛΙΚ ΣΕ ΑΝΤΙΔΡΩΝ Ή ΠΡΟΪΟΝ
// ============================================================================
export function getNaturalNucleusRadiusPx(z: number): number {
  if (z <= 1) return 8;     // Υδρογόνο (Z=1): εμφανώς μικρός πυρήνας (8px)!
  if (z === 2) return 10.5; // Ήλιο (Z=2)
  if (z <= 5) return 13;    // Li, Be, B
  if (z <= 10) return 16.5; // C (Z=6), N, O (Z=8), F, Ne: πάνω από 2x μεγαλύτερος από του Υδρογόνου!
  if (z <= 18) return 19.5; // Na, Mg, Cl, Ar
  return 22;
}

export function getNaturalOuterOrbitRadiusPx(z: number): number {
  const el = getPeriodicElementByZ(z);
  const shells = el.shells.length;
  if (shells <= 1) return 38;  // 1 στιβάδα (H, He): μικρή τροχιά!
  if (shells === 2) return 66;  // 2 στιβάδες (C, N, O...)
  if (shells === 3) return 84;  // 3 στιβάδες (Na, Mg, Cl...)
  if (shells === 4) return 104; // 4 στιβάδες (K, Ca, Br...)
  if (shells === 5) return 124; // 5 στιβάδες (Rb, Sr, I...)
  return 144;                   // 6 στιβάδες (Cs, Ba, Au, Pb...) — άνετη απόσταση μεταξύ των 6 τροχιών!
}

export function buildAtomNodesAndBondsForTerm(
  termRaw: string,
  centerX: number,
  centerY: number
): {
  atoms: {
    id: string;
    z: number;
    x: number;
    y: number;
    outerRadiusPx: number;
    extraElectrons: number;
    color: string;
  }[];
  bonds: {
    id: string;
    kind: 'ionic' | 'covalent';
    fromAtomId: string;
    toAtomId: string;
    count: number;
  }[];
} {
  const oxInfo = analyzeCompoundOxidationNumbers(termRaw);
  const ascii = normalizeAsciiChem(oxInfo.suggestedAscii || termRaw)
    .replace(/\s+/g, '')
    .replace(/[⁺⁻²³]/g, '');
  const parsed = parseFormulaToken(ascii);
  const ts = Date.now();
  const covShellGap = 24;

  // 0. Άλατα/Υδροξείδια με Πολυατομικά Ιόντα (π.χ. Ba(NO3)2, Ca(OH)2, Mg(OH)2, Cu(NO3)2, KNO3, CaCO3, Na2SO4)
  if (oxInfo.polyatomicMatch) {
    const { metalEl, metalCount, metalAO, anion, anionCount } = oxInfo.polyatomicMatch;
    const centralAnionEl = getPeriodicElementBySymbol(anion.centralSym) || getPeriodicElementByZ(7);
    const periphAnionEl = getPeriodicElementBySymbol(anion.peripheralSym) || getPeriodicElementByZ(8);
    const rMetal = getNaturalOuterOrbitRadiusPx(metalEl.z);
    const rAnionCenter = getNaturalOuterOrbitRadiusPx(centralAnionEl.z);
    const rPeriph = getNaturalOuterOrbitRadiusPx(periphAnionEl.z);

    const nodes: {
      id: string;
      z: number;
      x: number;
      y: number;
      outerRadiusPx: number;
      extraElectrons: number;
      color: string;
    }[] = [];
    const bonds: {
      id: string;
      kind: 'ionic' | 'covalent';
      fromAtomId: string;
      toAtomId: string;
      count: number;
    }[] = [];

    const mId = `atom-${ts}-metal0`;
    nodes.push({
      id: mId,
      z: metalEl.z,
      x: Math.round(centerX),
      y: Math.round(centerY),
      outerRadiusPx: rMetal,
      extraElectrons: -metalAO,
      color: '#0284c7',
    });

    for (let mIdx = 1; mIdx < Math.min(2, metalCount); mIdx++) {
      const mId2 = `atom-${ts}-metal${mIdx}`;
      nodes.push({
        id: mId2,
        z: metalEl.z,
        x: Math.round(centerX),
        y: Math.round(centerY - (rMetal * 2 + 28)),
        outerRadiusPx: rMetal,
        extraElectrons: -metalAO,
        color: '#0284c7',
      });
    }

    const nGroups = Math.min(2, Math.max(1, anionCount));
    const distMetalToGroup = rMetal + rAnionCenter + 24;
    const distGroupToPeriph = rAnionCenter + rPeriph + covShellGap;

    for (let gIdx = 0; gIdx < nGroups; gIdx++) {
      const sign = nGroups === 1 ? 1 : gIdx === 0 ? -1 : 1;
      const gx = centerX + sign * distMetalToGroup;
      const gy = centerY;
      const gCenterId = `atom-${ts}-ac${gIdx}`;
      nodes.push({
        id: gCenterId,
        z: centralAnionEl.z,
        x: Math.round(gx),
        y: Math.round(gy),
        outerRadiusPx: rAnionCenter,
        extraElectrons: Math.abs(anion.charge),
        color: '#10b981',
      });
      bonds.push({
        id: `abond-${ts}-ion-${gIdx}`,
        kind: 'ionic',
        fromAtomId: mId,
        toAtomId: gCenterId,
        count: Math.abs(anion.charge),
      });

      const pCount = Math.min(3, Math.max(1, anion.peripheralCount));
      const baseAng = sign < 0 ? Math.PI : 0;
      const pAngles =
        pCount === 1
          ? [baseAng]
          : pCount === 2
          ? [baseAng - 0.85, baseAng + 0.85]
          : [baseAng, baseAng - 1.05, baseAng + 1.05];

      pAngles.forEach((ang, pIdx) => {
        const pId = `atom-${ts}-ap-${gIdx}-${pIdx}`;
        nodes.push({
          id: pId,
          z: periphAnionEl.z,
          x: Math.round(gx + Math.cos(ang) * distGroupToPeriph),
          y: Math.round(gy + Math.sin(ang) * distGroupToPeriph),
          outerRadiusPx: rPeriph,
          extraElectrons: 0,
          color: '#ef4444',
        });
        bonds.push({
          id: `abond-${ts}-cov-${gIdx}-${pIdx}`,
          kind: 'covalent',
          fromAtomId: gCenterId,
          toAtomId: pId,
          count: pIdx === 0 && periphAnionEl.z === 8 && pCount >= 2 ? 2 : 1,
        });
      });
    }

    return { atoms: nodes, bonds };
  }

  // Συνολική φόρμουλα χωρίς τον μπροστινό συντελεστή (π.χ. "2H2" -> "H2", "2H2O" -> "H2O", "CH4" -> "CH4")
  const formulaUpper = parsed.atoms
    .map((a) => `${a.sym.toUpperCase()}${a.sub}`)
    .join('');

  // 1. CH4 (Μεθάνιο): 1 Άνθρακας στο κέντρο + 4 μικρά Υδρογόνα γύρω του (πάνω, κάτω, αριστερά, δεξιά) με 4 απλούς ομοιοπολικούς δεσμούς!
  if (formulaUpper === 'CH4') {
    const rC = getNaturalOuterOrbitRadiusPx(6); // 66
    const rH = getNaturalOuterOrbitRadiusPx(1); // 38
    const dist = rC + rH + covShellGap;
    const cId = `atom-${ts}-c`;
    const hIds = [0, 1, 2, 3].map((i) => `atom-${ts}-h${i}`);
    const offsets = [
      { dx: -dist, dy: 0 }, // Αριστερά
      { dx: dist, dy: 0 },  // Δεξιά
      { dx: 0, dy: -dist }, // Πάνω
      { dx: 0, dy: dist },  // Κάτω
    ];
    return {
      atoms: [
        {
          id: cId,
          z: 6,
          x: Math.round(centerX),
          y: Math.round(centerY),
          outerRadiusPx: rC,
          extraElectrons: 0,
          color: '#0284c7',
        },
        ...offsets.map((off, idx) => ({
          id: hIds[idx],
          z: 1,
          x: Math.round(centerX + off.dx),
          y: Math.round(centerY + off.dy),
          outerRadiusPx: rH,
          extraElectrons: 0,
          color: '#8b5cf6',
        })),
      ],
      bonds: hIds.map((hId, idx) => ({
        id: `abond-${ts}-ch4-${idx}`,
        kind: 'covalent' as const,
        fromAtomId: cId,
        toAtomId: hId,
        count: 1,
      })),
    };
  }

  // 2. H2O (Νερό): 1 Οξυγόνο στο κέντρο + 2 μικρά Υδρογόνα αριστερά/δεξιά με 2 απλούς ομοιοπολικούς δεσμούς!
  if (formulaUpper === 'H2O' || formulaUpper === 'OH2') {
    const rO = getNaturalOuterOrbitRadiusPx(8); // 66
    const rH = getNaturalOuterOrbitRadiusPx(1); // 38
    const dist = rO + rH + covShellGap;
    const oId = `atom-${ts}-o`;
    const h1Id = `atom-${ts}-h1`;
    const h2Id = `atom-${ts}-h2`;
    return {
      atoms: [
        {
          id: h1Id,
          z: 1,
          x: Math.round(centerX - dist),
          y: Math.round(centerY),
          outerRadiusPx: rH,
          extraElectrons: 0,
          color: '#8b5cf6',
        },
        {
          id: oId,
          z: 8,
          x: Math.round(centerX),
          y: Math.round(centerY),
          outerRadiusPx: rO,
          extraElectrons: 0,
          color: '#0284c7',
        },
        {
          id: h2Id,
          z: 1,
          x: Math.round(centerX + dist),
          y: Math.round(centerY),
          outerRadiusPx: rH,
          extraElectrons: 0,
          color: '#8b5cf6',
        },
      ],
      bonds: [
        { id: `abond-${ts}-h2o-1`, kind: 'covalent', fromAtomId: h1Id, toAtomId: oId, count: 1 },
        { id: `abond-${ts}-h2o-2`, kind: 'covalent', fromAtomId: oId, toAtomId: h2Id, count: 1 },
      ],
    };
  }

  // 3. CO2 (Διοξείδιο του Άνθρακα): O = C = O με 2 διπλούς ομοιοπολικούς δεσμούς!
  if (formulaUpper === 'CO2') {
    const rC = getNaturalOuterOrbitRadiusPx(6); // 66
    const rO = getNaturalOuterOrbitRadiusPx(8); // 66
    const dist = rC + rO + covShellGap;
    const o1Id = `atom-${ts}-o1`;
    const cId = `atom-${ts}-c`;
    const o2Id = `atom-${ts}-o2`;
    return {
      atoms: [
        { id: o1Id, z: 8, x: Math.round(centerX - dist), y: Math.round(centerY), outerRadiusPx: rO, extraElectrons: 0, color: '#8b5cf6' },
        { id: cId, z: 6, x: Math.round(centerX), y: Math.round(centerY), outerRadiusPx: rC, extraElectrons: 0, color: '#0284c7' },
        { id: o2Id, z: 8, x: Math.round(centerX + dist), y: Math.round(centerY), outerRadiusPx: rO, extraElectrons: 0, color: '#8b5cf6' },
      ],
      bonds: [
        { id: `abond-${ts}-co2-1`, kind: 'covalent', fromAtomId: o1Id, toAtomId: cId, count: 2 },
        { id: `abond-${ts}-co2-2`, kind: 'covalent', fromAtomId: cId, toAtomId: o2Id, count: 2 },
      ],
    };
  }

  // 4. NH3 (Αμμωνία): 1 Άζωτο στο κέντρο + 3 μικρά Υδρογόνα (αριστερά, δεξιά, κάτω) με 3 απλούς ομοιοπολικούς δεσμούς!
  if (formulaUpper === 'NH3' || formulaUpper === 'H3N') {
    const rN = getNaturalOuterOrbitRadiusPx(7); // 66
    const rH = getNaturalOuterOrbitRadiusPx(1); // 38
    const dist = rN + rH + covShellGap;
    const nId = `atom-${ts}-n`;
    const hIds = [`atom-${ts}-h1`, `atom-${ts}-h2`, `atom-${ts}-h3`];
    const offsets = [
      { dx: -dist, dy: 0 },
      { dx: dist, dy: 0 },
      { dx: 0, dy: dist },
    ];
    return {
      atoms: [
        { id: nId, z: 7, x: Math.round(centerX), y: Math.round(centerY), outerRadiusPx: rN, extraElectrons: 0, color: '#0284c7' },
        ...offsets.map((off, idx) => ({
          id: hIds[idx],
          z: 1,
          x: Math.round(centerX + off.dx),
          y: Math.round(centerY + off.dy),
          outerRadiusPx: rH,
          extraElectrons: 0,
          color: '#8b5cf6',
        })),
      ],
      bonds: hIds.map((hId, idx) => ({
        id: `abond-${ts}-nh3-${idx}`,
        kind: 'covalent' as const,
        fromAtomId: nId,
        toAtomId: hId,
        count: 1,
      })),
    };
  }

  // 5. Διατομικά μόρια ίδιου στοιχείου (π.χ. H2, O2, N2, Cl2, F2)
  if (parsed.atoms.length === 1 && parsed.atoms[0].sub === '2') {
    const el = getPeriodicElementBySymbol(parsed.atoms[0].sym) || getPeriodicElementByZ(1);
    const rOut = getNaturalOuterOrbitRadiusPx(el.z);
    const dist = rOut * 2 + covShellGap;
    const val = el.shells[el.shells.length - 1] || 1;
    const pairsCount = el.z === 1 ? 1 : Math.max(1, Math.min(3, 8 - val));
    const a1Id = `atom-${ts}-1`;
    const a2Id = `atom-${ts}-2`;
    return {
      atoms: [
        { id: a1Id, z: el.z, x: Math.round(centerX - dist / 2), y: Math.round(centerY), outerRadiusPx: rOut, extraElectrons: 0, color: '#8b5cf6' },
        { id: a2Id, z: el.z, x: Math.round(centerX + dist / 2), y: Math.round(centerY), outerRadiusPx: rOut, extraElectrons: 0, color: '#0284c7' },
      ],
      bonds: [
        { id: `abond-${ts}-di`, kind: 'covalent', fromAtomId: a1Id, toAtomId: a2Id, count: pairsCount },
      ],
    };
  }

  // 5β. Τετρατομικά ομοπυρηνικά μόρια (π.χ. P4 — Λευκός Φωσφόρος)
  if (parsed.atoms.length === 1 && parsed.atoms[0].sub === '4') {
    const el = getPeriodicElementBySymbol(parsed.atoms[0].sym) || getPeriodicElementByZ(15);
    const rOut = getNaturalOuterOrbitRadiusPx(el.z);
    const step = Math.round((rOut * 2 + covShellGap) * 0.72);
    const ids = [0, 1, 2, 3].map((i) => `atom-${ts}-p4-${i}`);
    const colors = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b'];
    const pos = [
      { x: centerX - step, y: centerY - step },
      { x: centerX + step, y: centerY - step },
      { x: centerX + step, y: centerY + step },
      { x: centerX - step, y: centerY + step },
    ];
    return {
      atoms: pos.map((p, i) => ({
        id: ids[i],
        z: el.z,
        x: Math.round(p.x),
        y: Math.round(p.y),
        outerRadiusPx: rOut,
        extraElectrons: 0,
        color: colors[i],
      })),
      bonds: [
        { id: `abond-${ts}-p4-01`, kind: 'covalent', fromAtomId: ids[0], toAtomId: ids[1], count: 1 },
        { id: `abond-${ts}-p4-12`, kind: 'covalent', fromAtomId: ids[1], toAtomId: ids[2], count: 1 },
        { id: `abond-${ts}-p4-23`, kind: 'covalent', fromAtomId: ids[2], toAtomId: ids[3], count: 1 },
        { id: `abond-${ts}-p4-30`, kind: 'covalent', fromAtomId: ids[3], toAtomId: ids[0], count: 1 },
      ],
    };
  }

  // 6. Μεμονωμένο άτομο (π.χ. C, Mg, Na, Ca, K, O, H, Si)
  if (parsed.atoms.length === 1 && (!parsed.atoms[0].sub || parsed.atoms[0].sub === '1')) {
    const el = getPeriodicElementBySymbol(parsed.atoms[0].sym) || getPeriodicElementByZ(6);
    const rOut = getNaturalOuterOrbitRadiusPx(el.z);
    return {
      atoms: [
        {
          id: `atom-${ts}-single`,
          z: el.z,
          x: Math.round(centerX),
          y: Math.round(centerY),
          outerRadiusPx: rOut,
          extraElectrons: 0,
          color: '#0284c7',
        },
      ],
      bonds: [],
    };
  }

  // 6β. Ενώσεις A₂B₃ (π.χ. Si₂O₃, Al₂O₃, Fe₂O₃, N₂O₃, P₂O₃, B₂O₃) — Δομή Γέφυρας B = A — B — A = B
  if (parsed.atoms.length === 2 && parsed.atoms[0].sub === '2' && parsed.atoms[1].sub === '3') {
    const elA = getPeriodicElementBySymbol(parsed.atoms[0].sym) || getPeriodicElementByZ(14);
    const elB = getPeriodicElementBySymbol(parsed.atoms[1].sym) || getPeriodicElementByZ(8);
    const rA = getNaturalOuterOrbitRadiusPx(elA.z);
    const rB = getNaturalOuterOrbitRadiusPx(elB.z);
    const isIonic = elA.category === 'metal' && elB.category !== 'metal';
    const distAB = rA + rB + (isIonic ? 24 : covShellGap);
    const oBridgeId = `atom-${ts}-ob`;
    const a1Id = `atom-${ts}-a1`;
    const a2Id = `atom-${ts}-a2`;
    const oLeftId = `atom-${ts}-ol`;
    const oRightId = `atom-${ts}-or`;

    return {
      atoms: [
        {
          id: oBridgeId,
          z: elB.z,
          x: Math.round(centerX),
          y: Math.round(centerY - distAB * 0.36),
          outerRadiusPx: rB,
          extraElectrons: isIonic ? 2 : 0,
          color: '#ef4444',
        },
        {
          id: a1Id,
          z: elA.z,
          x: Math.round(centerX - distAB * 0.92),
          y: Math.round(centerY + distAB * 0.12),
          outerRadiusPx: rA,
          extraElectrons: isIonic ? -3 : 0,
          color: '#0284c7',
        },
        {
          id: a2Id,
          z: elA.z,
          x: Math.round(centerX + distAB * 0.92),
          y: Math.round(centerY + distAB * 0.12),
          outerRadiusPx: rA,
          extraElectrons: isIonic ? -3 : 0,
          color: '#0284c7',
        },
        {
          id: oLeftId,
          z: elB.z,
          x: Math.round(centerX - distAB * 0.92),
          y: Math.round(centerY + distAB * 1.12),
          outerRadiusPx: rB,
          extraElectrons: isIonic ? 2 : 0,
          color: '#8b5cf6',
        },
        {
          id: oRightId,
          z: elB.z,
          x: Math.round(centerX + distAB * 0.92),
          y: Math.round(centerY + distAB * 1.12),
          outerRadiusPx: rB,
          extraElectrons: isIonic ? 2 : 0,
          color: '#10b981',
        },
      ],
      bonds: [
        { id: `abond-${ts}-b1`, kind: isIonic ? 'ionic' : 'covalent', fromAtomId: a1Id, toAtomId: oBridgeId, count: 1 },
        { id: `abond-${ts}-b2`, kind: isIonic ? 'ionic' : 'covalent', fromAtomId: a2Id, toAtomId: oBridgeId, count: 1 },
        { id: `abond-${ts}-t1`, kind: isIonic ? 'ionic' : 'covalent', fromAtomId: a1Id, toAtomId: oLeftId, count: isIonic ? 2 : 2 },
        { id: `abond-${ts}-t2`, kind: isIonic ? 'ionic' : 'covalent', fromAtomId: a2Id, toAtomId: oRightId, count: isIonic ? 2 : 2 },
      ],
    };
  }

  // 7. Τριατομικά μόρια/ενώσεις AB2 (π.χ. MgCl2, CaCl2, BaCl2, SiO2, SO2, CS2)
  if (parsed.atoms.length === 2 && parsed.atoms[1].sub === '2') {
    const elA = getPeriodicElementBySymbol(parsed.atoms[0].sym) || getPeriodicElementByZ(12);
    const elB = getPeriodicElementBySymbol(parsed.atoms[1].sym) || getPeriodicElementByZ(17);
    const rA = getNaturalOuterOrbitRadiusPx(elA.z);
    const rB = getNaturalOuterOrbitRadiusPx(elB.z);
    const isIonic = elA.category === 'metal' && elB.category !== 'metal';
    const valB = elB.shells[elB.shells.length - 1] || 7;
    const covBondCount = elB.z === 1 ? 1 : Math.max(1, Math.min(2, 8 - valB));
    const dist = rA + rB + (isIonic ? 24 : covShellGap);
    const b1Id = `atom-${ts}-b1`;
    const aId = `atom-${ts}-a`;
    const b2Id = `atom-${ts}-b2`;
    return {
      atoms: [
        { id: b1Id, z: elB.z, x: Math.round(centerX - dist), y: Math.round(centerY), outerRadiusPx: rB, extraElectrons: isIonic ? 1 : 0, color: '#8b5cf6' },
        { id: aId, z: elA.z, x: Math.round(centerX), y: Math.round(centerY), outerRadiusPx: rA, extraElectrons: isIonic ? -2 : 0, color: '#0284c7' },
        { id: b2Id, z: elB.z, x: Math.round(centerX + dist), y: Math.round(centerY), outerRadiusPx: rB, extraElectrons: isIonic ? 1 : 0, color: '#8b5cf6' },
      ],
      bonds: isIonic
        ? [
            { id: `abond-${ts}-ion1`, kind: 'ionic', fromAtomId: aId, toAtomId: b1Id, count: 1 },
            { id: `abond-${ts}-ion2`, kind: 'ionic', fromAtomId: aId, toAtomId: b2Id, count: 1 },
          ]
        : [
            { id: `abond-${ts}-cov1`, kind: 'covalent', fromAtomId: b1Id, toAtomId: aId, count: covBondCount },
            { id: `abond-${ts}-cov2`, kind: 'covalent', fromAtomId: aId, toAtomId: b2Id, count: covBondCount },
          ],
    };
  }

  // 8. Πολυατομικά μόρια, οξυοξέα, οξείδια & οργανικές ενώσεις (π.χ. HBrO3, BrO3, HNO3, H2SO4, SO2, SO3, BF3, CCl4, CH3OH)
  const expandedAtomsList: { sym: string; el: PeriodicElement }[] = [];
  for (const a of parsed.atoms) {
    const el = getPeriodicElementBySymbol(a.sym);
    if (!el) continue;
    const count = Math.min(8, Math.max(1, parseInt(a.sub || '1', 10) || 1));
    for (let k = 0; k < count; k++) {
      expandedAtomsList.push({ sym: a.sym, el });
    }
  }

  if (expandedAtomsList.length >= 3) {
    // Επιλογή κεντρικού ατόμου: προτεραιότητα σε C, Si, S, P, N, Br, Cl, I, B, Al, Mn, Cr, Fe (όχι H και κατά προτίμηση όχι O)
    const centralPriority = (sym: string): number => {
      if (sym === 'H') return 0;
      if (sym === 'O' || sym === 'F') return 1;
      if (['C', 'Si', 'S', 'P', 'N', 'B'].includes(sym)) return 10;
      if (['Br', 'Cl', 'I', 'Mn', 'Cr', 'Al', 'Fe', 'Cu', 'Zn', 'Mg', 'Ca'].includes(sym)) return 8;
      return 5;
    };
    let centralIdx = 0;
    let bestPrio = -1;
    expandedAtomsList.forEach((item, idx) => {
      const p = centralPriority(item.sym);
      if (p > bestPrio) {
        bestPrio = p;
        centralIdx = idx;
      }
    });

    const centralItem = expandedAtomsList[centralIdx];
    const peripheralItems = expandedAtomsList.filter((_, idx) => idx !== centralIdx);
    const rCenter = getNaturalOuterOrbitRadiusPx(centralItem.el.z);
    const centerId = `atom-${ts}-center`;
    const colors = ['#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

    const nodes: {
      id: string;
      z: number;
      x: number;
      y: number;
      outerRadiusPx: number;
      extraElectrons: number;
      color: string;
    }[] = [
      {
        id: centerId,
        z: centralItem.el.z,
        x: Math.round(centerX),
        y: Math.round(centerY),
        outerRadiusPx: rCenter,
        extraElectrons: 0,
        color: '#0284c7',
      },
    ];
    const bonds: {
      id: string;
      kind: 'ionic' | 'covalent';
      fromAtomId: string;
      toAtomId: string;
      count: number;
    }[] = [];
    const nPer = peripheralItems.length;

    peripheralItems.forEach((pItem, pIdx) => {
      const rPer = getNaturalOuterOrbitRadiusPx(pItem.el.z);
      const isIonic =
        (centralItem.el.category === 'metal' && pItem.el.category !== 'metal') ||
        (pItem.el.category === 'metal' && centralItem.el.category !== 'metal');
      const dist = rCenter + rPer + (isIonic ? 24 : covShellGap);
      // Κατανομή γύρω από το κεντρικό άτομο
      const angle =
        nPer === 2
          ? pIdx === 0
            ? Math.PI
            : 0
          : nPer === 3
          ? -Math.PI / 2 + (pIdx * 2 * Math.PI) / 3
          : -Math.PI / 2 + (pIdx * 2 * Math.PI) / nPer;
      const pId = `atom-${ts}-p${pIdx}`;
      nodes.push({
        id: pId,
        z: pItem.el.z,
        x: Math.round(centerX + Math.cos(angle) * dist),
        y: Math.round(centerY + Math.sin(angle) * dist),
        outerRadiusPx: rPer,
        extraElectrons: 0,
        color: colors[pIdx % colors.length],
      });
      const bondCount = !isIonic && pItem.sym === 'O' && nPer <= 3 ? 2 : 1;
      bonds.push({
        id: `abond-${ts}-p${pIdx}`,
        kind: isIonic ? 'ionic' : 'covalent',
        fromAtomId: centerId,
        toAtomId: pId,
        count: bondCount,
      });
    });

    return { atoms: nodes, bonds };
  }

  // 9. Δυαδικές ενώσεις AB (π.χ. HCl, NaCl, MgO, CaO, LiF, KCl)
  if (parsed.atoms.length >= 2) {
    const el1 = getPeriodicElementBySymbol(parsed.atoms[0].sym) || getPeriodicElementByZ(11);
    const el2 = getPeriodicElementBySymbol(parsed.atoms[1].sym) || getPeriodicElementByZ(17);
    const r1 = getNaturalOuterOrbitRadiusPx(el1.z);
    const r2 = getNaturalOuterOrbitRadiusPx(el2.z);
    const isIonic =
      (el1.category === 'metal' && el2.category !== 'metal') ||
      (el2.category === 'metal' && el1.category !== 'metal');
    const dist = r1 + r2 + (isIonic ? 26 : covShellGap);
    const vMetal = Math.min(2, el1.shells[el1.shells.length - 1] || 1);
    const a1Id = `atom-${ts}-1`;
    const a2Id = `atom-${ts}-2`;
    return {
      atoms: [
        { id: a1Id, z: el1.z, x: Math.round(centerX - dist / 2), y: Math.round(centerY), outerRadiusPx: r1, extraElectrons: isIonic ? -vMetal : 0, color: '#8b5cf6' },
        { id: a2Id, z: el2.z, x: Math.round(centerX + dist / 2), y: Math.round(centerY), outerRadiusPx: r2, extraElectrons: isIonic ? vMetal : 0, color: '#0284c7' },
      ],
      bonds: [
        {
          id: `abond-${ts}-ab`,
          kind: isIonic ? 'ionic' : 'covalent',
          fromAtomId: a1Id,
          toAtomId: a2Id,
          count: isIonic ? vMetal : 1,
        },
      ],
    };
  }

  // Fallback
  const rC = getNaturalOuterOrbitRadiusPx(6);
  return {
    atoms: [
      { id: `atom-${ts}-def`, z: 6, x: Math.round(centerX), y: Math.round(centerY), outerRadiusPx: rC, extraElectrons: 0, color: '#0284c7' },
    ],
    bonds: [],
  };
}

/**
 * Εξασφαλίζει ότι σε κάθε ομοιοπολικό μόριο (π.χ. CO₂, H₂O, CH₄, NH₃, O₂, N₂, HCl)
 * υπάρχει καθαρό διάκενο ~24px (αναλογικά με την κλίμακα) ανάμεσα στις εξωτερικές στιβάδες των συνδεδεμένων ατόμων,
 * ώστε τα κοινά ζεύγη ηλεκτρονίων να στέκονται λίγο πιο έξω (ανάμεσα στις εξωτερικές στιβάδες)
 * και η σιέλ έλλειψη να πατάει ελάχιστα (~1.5px) στην εξωτερική στιβάδα χωρίς να περνούν άλλα ηλεκτρόνια από μέσα της.
 */
export function normalizeCovalentAtomPositions<
  T extends { id: string; z: number; x: number; y: number; outerRadiusPx?: number }
>(
  atoms: T[],
  bonds?: { kind: 'ionic' | 'covalent'; fromAtomId: string; toAtomId: string; count: number }[]
): T[] {
  if (!bonds || bonds.length === 0 || atoms.length < 2) return atoms;
  const covBonds = bonds.filter((b) => b.kind === 'covalent');
  if (covBonds.length === 0) return atoms;

  if (atoms.length === 2 && covBonds.length >= 1) {
    const a1 = atoms[0];
    const a2 = atoms[1];
    const nat1 = getNaturalOuterOrbitRadiusPx(a1.z);
    const nat2 = getNaturalOuterOrbitRadiusPx(a2.z);
    const r1 = a1.outerRadiusPx || nat1;
    const r2 = a2.outerRadiusPx || nat2;
    const avgScale = (r1 / nat1 + r2 / nat2) / 2;
    const targetDist = r1 + r2 + Math.round(24 * avgScale);
    const dx = a2.x - a1.x;
    const dy = a2.y - a1.y;
    const curDist = Math.hypot(dx, dy);
    if (curDist >= targetDist - 2) return atoms;
    const ux = curDist > 0.5 ? dx / curDist : 1;
    const uy = curDist > 0.5 ? dy / curDist : 0;
    const midX = (a1.x + a2.x) / 2;
    const midY = (a1.y + a2.y) / 2;
    return [
      {
        ...a1,
        x: Math.round(midX - ux * (targetDist / 2)),
        y: Math.round(midY - uy * (targetDist / 2)),
      },
      {
        ...a2,
        x: Math.round(midX + ux * (targetDist / 2)),
        y: Math.round(midY + uy * (targetDist / 2)),
      },
    ];
  }

  // Πολυατομικά μόρια (>=3 άτομα, π.χ. CO2, H2O, CH4, NH3): βρίσκουμε το κεντρικό άτομο με τους περισσότερους δεσμούς
  const degMap = new Map<string, number>();
  for (const b of covBonds) {
    degMap.set(b.fromAtomId, (degMap.get(b.fromAtomId) || 0) + 1);
    degMap.set(b.toAtomId, (degMap.get(b.toAtomId) || 0) + 1);
  }
  let centralAtom = atoms[0];
  let maxDeg = -1;
  for (const a of atoms) {
    const d = degMap.get(a.id) || 0;
    if (d > maxDeg) {
      maxDeg = d;
      centralAtom = a;
    }
  }

  const natC = getNaturalOuterOrbitRadiusPx(centralAtom.z);
  const rC = centralAtom.outerRadiusPx || natC;
  let modified = false;
  const nextPosMap = new Map<string, { x: number; y: number }>();

  for (const b of covBonds) {
    const ligId =
      b.fromAtomId === centralAtom.id
        ? b.toAtomId
        : b.toAtomId === centralAtom.id
        ? b.fromAtomId
        : null;
    if (!ligId) continue;
    const ligAt = atoms.find((a) => a.id === ligId);
    if (!ligAt) continue;
    const natL = getNaturalOuterOrbitRadiusPx(ligAt.z);
    const rL = ligAt.outerRadiusPx || natL;
    const avgScale = (rC / natC + rL / natL) / 2;
    const targetDist = rC + rL + Math.round(24 * avgScale);
    const dx = ligAt.x - centralAtom.x;
    const dy = ligAt.y - centralAtom.y;
    const curDist = Math.hypot(dx, dy);
    if (curDist < targetDist - 2) {
      const ux = curDist > 0.5 ? dx / curDist : 1;
      const uy = curDist > 0.5 ? dy / curDist : 0;
      nextPosMap.set(ligAt.id, {
        x: Math.round(centralAtom.x + ux * targetDist),
        y: Math.round(centralAtom.y + uy * targetDist),
      });
      modified = true;
    }
  }

  if (!modified) return atoms;
  return atoms.map((a) => {
    const p = nextPosMap.get(a.id);
    return p ? { ...a, x: p.x, y: p.y } : a;
  });
}

