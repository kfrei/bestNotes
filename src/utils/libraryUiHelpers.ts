import type { BezierPoint, Notebook, StrokeObject } from '../types/note';
import { normalizeGreekSearchText } from './geometryAndAlgorithms';

export interface LibraryFilterChip {
  key: string;
  label: string;
  color: string;
  count: number;
  isSubject: boolean;
}

interface SubjectDef {
  key: string;
  label: string;
  color: string;
  explicitTags: string[];
  keywords: string[];
}

const SUBJECT_DEFS: SubjectDef[] = [
  {
    key: 'subject:physics',
    label: 'Φυσική',
    color: '#2563eb',
    explicitTags: ['φυσικη', 'physics', 'ηλεκτρισμος', 'μηχανικη', 'ταλαντωσεις', 'κυματα', 'οπτικη'],
    keywords: [
      'αγωγ',
      'μονωτ',
      'ρευμ',
      'αντιστασ',
      'κυκλωμ',
      'hooke',
      'βαρος',
      'μαζα',
      'δυναμ',
      'ταχυτ',
      'επιταχυν',
      'ταλαντ',
      'εκκρεμ',
      'φακος',
      'κατοπτρ',
      'ενεργει',
      'ισχυ',
      'ταση',
      'βολτ',
      'αμπερ',
      'ελατηρ',
      'βαρυτ',
      'κινηματ',
      'ομ',
      'ohm',
      'φυσικ',
    ],
  },
  {
    key: 'subject:chemistry',
    label: 'Χημεία',
    color: '#dc2626',
    explicitTags: ['χημεια', 'chemistry', 'οξεα', 'βασεις', 'ατομα', 'μορια', 'περιοδικος'],
    keywords: [
      'οξ',
      'βασ',
      'αλατ',
      'χημ',
      'μορι',
      'ατομ',
      'αντιδρασ',
      'ισοσταθμ',
      'περιοδικ',
      'δεσμ',
      'ιοντ',
      'ομοιοπολ',
      'διαλυμ',
      'φασεις και μεταβολες',
      'φασεις του νερου',
      'μεταβολες του νερου',
      'το νερο',
    ],
  },
  {
    key: 'subject:biology',
    label: 'Βιολογία',
    color: '#16a34a',
    explicitTags: ['βιολογια', 'biology', 'κυτταρο', 'φωτοσυνθεση', 'dna'],
    keywords: [
      'φωτοσυνθ',
      'κυτταρ',
      'μιτοχονδρ',
      'χλωροπλαστ',
      'ενζυμ',
      'νευρων',
      'καρδι',
      'οφθαλμ',
      'dna',
      'rna',
      'βιολογ',
      'μιτωσ',
      'μειωσ',
      'οργανισμ',
      'βακτηρ',
      'ιος',
    ],
  },
  {
    key: 'subject:geography',
    label: 'Γεωγραφία / Γη',
    color: '#d97706',
    explicitTags: ['γεωγραφια', 'γη', 'geography', 'ηφαιστειο', 'υδροσφαιρα'],
    keywords: [
      'ηφαιστ',
      'κυκλος νερου',
      'γεωγραφ',
      'πλανητ',
      'ηπειρ',
      'λιθοσφ',
      'ατμοσφ',
      'κλιμα',
      'σεισμ',
      'η γη',
      'της γης',
    ],
  },
  {
    key: 'subject:math',
    label: 'Μαθηματικά',
    color: '#7c3aed',
    explicitTags: ['μαθηματικα', 'math', 'αλγεβρα', 'γεωμετρια', 'εξισωσεις', 'συναρτησεις'],
    keywords: [
      'μαθηματ',
      'αλγεβρ',
      'γεωμετρ',
      'εξισωσ',
      'συναρτησ',
      'παραβολ',
      'υπερβολ',
      'τριγων',
      'ολοκληρ',
      'παραγωγ',
      'πολυωνυμ',
      'ανισωσ',
    ],
  },
];

const GENERIC_PLACEHOLDER_TAGS = new Set([
  'σχημα',
  'γραμμη',
  'κυκλος',
  'τετραγωνο',
  'ορθογωνιο',
  'βελος',
  'σημειωση',
]);

function normalizeTagToken(raw: string): string {
  return normalizeGreekSearchText(raw.replace(/^#+/, '').trim());
}

/**
 * Resolves the filter category keys (subjects + explicit custom #tags) associated with a notebook.
 * Explicit user/AI #tags always take priority over title/content keyword inference.
 */
export function resolveNotebookFilterCategories(nb: Notebook): {
  chips: Array<{ key: string; label: string; color: string; isSubject: boolean }>;
} {
  const rawTags = [
    ...(nb.tags || []),
    ...nb.pages.flatMap((p) => p.tags || []),
  ]
    .map((t) => t.trim())
    .filter(Boolean);

  const matchedSubjects = new Map<string, SubjectDef>();
  const customTags: Array<{ key: string; label: string }> = [];
  const seenCustom = new Set<string>();

  for (const raw of rawTags) {
    const cleanDisplay = raw.replace(/^#+/, '').trim();
    const norm = normalizeTagToken(raw);
    if (!norm || GENERIC_PLACEHOLDER_TAGS.has(norm)) continue;

    const subj = SUBJECT_DEFS.find((def) =>
      def.explicitTags.some((alias) => norm === alias || norm.includes(alias))
    );
    if (subj) {
      matchedSubjects.set(subj.key, subj);
    } else if (!seenCustom.has(norm)) {
      seenCustom.add(norm);
      customTags.push({ key: `tag:${norm}`, label: `#${cleanDisplay}` });
    }
  }

  // Fallback to automatic subject classification from title + folder + page 1 texts
  // only when the note has no explicit subject tag yet.
  if (matchedSubjects.size === 0) {
    const p0Texts = (nb.pages[0]?.texts || [])
      .slice(0, 6)
      .map((t) => t.text || t.latex || '')
      .join(' ');
    const normHaystack = normalizeGreekSearchText(`${nb.title} ${nb.folder || ''} ${p0Texts}`);

    for (const def of SUBJECT_DEFS) {
      if (def.keywords.some((kw) => normHaystack.includes(kw))) {
        matchedSubjects.set(def.key, def);
        break;
      }
    }
  }

  const chips: Array<{ key: string; label: string; color: string; isSubject: boolean }> = [];
  for (const subj of matchedSubjects.values()) {
    chips.push({ key: subj.key, label: subj.label, color: subj.color, isSubject: true });
  }
  for (const ct of customTags) {
    chips.push({ key: ct.key, label: ct.label, color: '#475569', isSubject: false });
  }
  return { chips };
}

/**
 * Builds the active filter chips bar from notebooks in the current Library scope,
 * keeping only categories with at least `minCount` notes (default 3) and sorting
 * subjects first, followed by popular custom #tags.
 */
export function buildLibraryFilterChips(
  notebooksInScope: Notebook[],
  minCount = 3
): {
  chips: LibraryFilterChip[];
  noteChipKeys: Map<string, Set<string>>;
} {
  const chipCounts = new Map<string, LibraryFilterChip>();
  const noteChipKeys = new Map<string, Set<string>>();

  for (const nb of notebooksInScope) {
    const { chips } = resolveNotebookFilterCategories(nb);
    if (chips.length === 0) continue;
    const keysForNote = new Set<string>();
    for (const c of chips) {
      keysForNote.add(c.key);
      const existing = chipCounts.get(c.key);
      if (existing) {
        existing.count += 1;
      } else {
        chipCounts.set(c.key, { ...c, count: 1 });
      }
    }
    noteChipKeys.set(nb.id, keysForNote);
  }

  const allChips = Array.from(chipCounts.values()).filter((c) => c.count >= minCount);
  const subjects = allChips.filter((c) => c.isSubject).sort((a, b) => b.count - a.count);
  const custom = allChips
    .filter((c) => !c.isSubject)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'el'))
    .slice(0, 6);

  return {
    chips: [...subjects, ...custom],
    noteChipKeys,
  };
}

/**
 * Decimates a stroke's points array down to `maxPts` integer coordinates for crisp, lag-free mini thumbnails.
 */
export function decimatePointsForMiniThumb(
  pts: BezierPoint[],
  maxPts = 16
): Array<{ x: number; y: number }> {
  const n = pts.length;
  if (n === 0) return [];
  if (n <= maxPts) {
    return pts.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) }));
  }
  const out: Array<{ x: number; y: number }> = [];
  const step = (n - 1) / (maxPts - 1);
  for (let i = 0; i < maxPts - 1; i++) {
    const p = pts[Math.round(i * step)];
    out.push({ x: Math.round(p.x), y: Math.round(p.y) });
  }
  const last = pts[n - 1];
  out.push({ x: Math.round(last.x), y: Math.round(last.y) });
  return out;
}

/**
 * Selects a representative subset of strokes (prioritizing shapes, then evenly sampling handwriting)
 * so miniature list thumbnails never bloat the DOM on heavy pages.
 */
export function selectStrokesForMiniThumb(
  strokes: StrokeObject[],
  maxStrokes = 90
): StrokeObject[] {
  if (strokes.length <= maxStrokes) return strokes;
  const shapes: StrokeObject[] = [];
  const ink: StrokeObject[] = [];
  for (const st of strokes) {
    if (st.isShape) shapes.push(st);
    else ink.push(st);
  }
  if (shapes.length >= maxStrokes) {
    const step = shapes.length / maxStrokes;
    return Array.from({ length: maxStrokes }, (_, i) => shapes[Math.floor(i * step)]);
  }
  const remaining = maxStrokes - shapes.length;
  if (ink.length <= remaining) return [...shapes, ...ink];
  const step = ink.length / remaining;
  const sampledInk = Array.from({ length: remaining }, (_, i) => ink[Math.floor(i * step)]);
  return [...shapes, ...sampledInk];
}

/**
 * Formats a concise Greek relative timestamp label for "Recently Opened" home cards.
 */
export function formatRecentRelativeLabel(isoOrMs?: string | number): string {
  if (!isoOrMs) return '';
  const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDay) / 86400000);
  if (diffDays === 0) return `Σήμερα · ${hh}:${min}`;
  if (diffDays === 1) return `Χθες · ${hh}:${min}`;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}
