/**
 * BestNotes / ExplainBoards Subscription Plans, Quotas & Entitlements Types
 */

export type BuiltInPlanId = 'free' | 'plus' | 'ultra';
export type PlanId = BuiltInPlanId | (string & {});

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  order: number;
  isBuiltIn?: boolean;
  isUnlimited?: boolean;
  /** Maximum number of notebooks/files (-1 = unlimited) */
  maxFiles: number;
  /** Maximum pages per native/own notebook (-1 = unlimited). Does NOT block opening PDFs within maxStorageMb. */
  maxPagesPerNativeFile: number;
  /** Maximum total storage in MB (-1 = unlimited) */
  maxStorageMb: number;
  /** Maximum AI calls per day (-1 = unlimited, 0 = disabled) */
  aiCallsPerDay: number;
  /** Maximum AI calls per week (-1 = unlimited, 0 = disabled) */
  aiCallsPerWeek: number;
  /** Automatic & manual AI #tags extraction (ULTRA-only by default) */
  allowAutoTags: boolean;
  updatedAt?: string;
}

export const GUEST_LIMITS = {
  maxFiles: 1,
  maxPagesPerNativeFile: 3,
  maxStorageMb: 5,
  aiCallsPerDay: 0,
  aiCallsPerWeek: 0,
  allowAutoTags: false,
} as const;

export const UPGRADE_CONTACT_EMAIL = 'FreiderikosKostas@gmail.com';

export interface UserAiUsage {
  dayKey: string;      // YYYY-MM-DD (local calendar date)
  dayCount: number;
  weekKey: string;     // YYYY-Www (ISO week)
  weekCount: number;
  totalCount: number;
  updatedAt: string;
}

export type LimitHitKind =
  | 'view_plans'
  | 'files'
  | 'pages'
  | 'storage'
  | 'ai_daily'
  | 'ai_weekly'
  | 'ai_guest'
  | 'auto_tags'
  | 'drive_sync'
  | 'live_broadcast'
  | 'live_sim_links'
  | 'guest_save';

export interface UpgradeModalContext {
  reason: LimitHitKind;
  featureLabel?: string;
  currentValue?: string;
  limitValue?: string;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: LimitHitKind;
  currentValue?: string;
  limitValue?: string;
}

export interface AiFeatureCatalogItem {
  id: string;
  name: string;
  category: 'OCR' | 'Vision' | 'Chemistry' | 'Library' | 'Local (0 Tokens)';
  consumesTokens: boolean;
  planRequirement: string;
  description: string;
  codeEntryPoint: string;
}

/**
 * Authoritative catalog of AI token-consuming features vs local 0-token tools.
 */
export const AI_TOKEN_FEATURES_CATALOG: AiFeatureCatalogItem[] = [
  {
    id: 'text-ocr',
    name: 'textOCR (Χειρόγραφο Κείμενο)',
    category: 'OCR',
    consumesTokens: true,
    planRequirement: 'FREE / PLUS / ULTRA (με όριο κλήσεων)',
    description: 'Μετατροπή χειρόγραφου ελληνικού/αγγλικού κειμένου από λάσο σε ψηφιακό κείμενο.',
    codeEntryPoint: 'transcribeHandwrittenStrokesWithGemini',
  },
  {
    id: 'math-equation',
    name: 'Σ Math → Εξίσωση (MathOCR)',
    category: 'OCR',
    consumesTokens: true,
    planRequirement: 'FREE / PLUS / ULTRA (με όριο κλήσεων)',
    description: 'Αναγνώριση χειρόγραφων μαθηματικών εξισώσεων & μετατροπή σε LaTeX.',
    codeEntryPoint: 'transcribeHandwrittenMathWithGemini',
  },
  {
    id: 'math-graph',
    name: 'Σ Math → Διάγραμμα',
    category: 'OCR',
    consumesTokens: true,
    planRequirement: 'FREE / PLUS / ULTRA (με όριο κλήσεων)',
    description: 'Αναγνώριση χειρόγραφης συνάρτησης & σχεδίαση 2D γραφικής παράστασης.',
    codeEntryPoint: 'transcribeEquationForGraphWithGemini',
  },
  {
    id: 'math-code',
    name: 'Σ Math → Κώδικας (ΑΕΠΠ)',
    category: 'OCR',
    consumesTokens: true,
    planRequirement: 'FREE / PLUS / ULTRA (με όριο κλήσεων)',
    description: 'Μετατροπή χειρόγραφου κώδικα / ψευδοκώδικα με σωστές εσοχές.',
    codeEntryPoint: 'transcribeHandwrittenCodeWithGemini',
  },
  {
    id: 'chem-reactions',
    name: '⚗ Chem → Αντιδράσεις (ChemOCR)',
    category: 'Chemistry',
    consumesTokens: true,
    planRequirement: 'FREE / PLUS / ULTRA (με όριο κλήσεων)',
    description: 'Αναγνώριση & εξισορρόπηση χειρόγραφων χημικών αντιδράσεων.',
    codeEntryPoint: 'transcribeHandwrittenChemistryWithGemini',
  },
  {
    id: 'chem-3d',
    name: '⚗ Chem → 3D Μόριο',
    category: 'Chemistry',
    consumesTokens: true,
    planRequirement: 'FREE / PLUS / ULTRA (με όριο κλήσεων)',
    description: 'Αναγνώριση χειρόγραφου χημικού τύπου για διαδραστικό 3D μόριο.',
    codeEntryPoint: 'transcribeHandwrittenChemistryWithGemini',
  },
  {
    id: 'smart-animate',
    name: '✨ Ζωντάνεμα (+ Επανανάλυση & Οδηγία)',
    category: 'Vision',
    consumesTokens: true,
    planRequirement: 'FREE / PLUS / ULTRA (με όριο κλήσεων)',
    description: 'Ανάλυση σκίτσου/εικόνας με Gemini Vision για κίνηση & φυσικό ήχο.',
    codeEntryPoint: 'analyzeImageForSmartSketchAnimation',
  },
  {
    id: 'chem-typed-fallback',
    name: 'Έλεγχος Χημικής Εξίσωσης (AI Fallback)',
    category: 'Chemistry',
    consumesTokens: true,
    planRequirement: 'FREE / PLUS / ULTRA (μόνο για σύνθετες αντιδράσεις)',
    description: 'Εφεδρική κλήση Gemini όταν ο τοπικός parser δεν βρίσκει διόρθωση σε σύνθετη αντίδραση.',
    codeEntryPoint: 'analyzeTypedChemistryWithGemini',
  },
  {
    id: 'auto-tags',
    name: '✨ Auto-Tags (#tags Βιβλιοθήκης)',
    category: 'Library',
    consumesTokens: true,
    planRequirement: 'Μόνο ULTRA',
    description: 'Αυτόματη & χειροκίνητη εξαγωγή 3–4 βασικών #tags από χειρόγραφα και εικόνες.',
    codeEntryPoint: 'generateSmartGreekTagsFromImages',
  },
  {
    id: 'local-polygon',
    name: 'Σ Math → Πολύγωνο',
    category: 'Local (0 Tokens)',
    consumesTokens: false,
    planRequirement: 'Διαθέσιμο παντού (και Επισκέπτες)',
    description: 'Τοπική γεωμετρική ένωση γραμμών σε πολύγωνο (0 AI tokens).',
    codeEntryPoint: 'handleConvertSelectedStrokesToPolygon',
  },
  {
    id: 'local-atom-2d',
    name: '⚗ Chem → 2D (Άτομο / Bohr Sim)',
    category: 'Local (0 Tokens)',
    consumesTokens: false,
    planRequirement: 'Διαθέσιμο παντού (και Επισκέπτες)',
    description: 'Τοπική προσομοίωση ατόμου Bohr (0 AI tokens).',
    codeEntryPoint: 'registerOrActivateAtomSimFromLasso',
  },
];
