import React, { useState, useEffect, useRef } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Shapes,
  Lasso,
  Layers,
  Search,
  Sparkles,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  GripVertical,
  Copy,
  Plus,
  FileText,
  FolderOpen,
  LogOut,
  User as UserIcon,
  X,
  Move,
  ZoomIn,
  RotateCcw,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type User,
} from '../firebase';

interface LandingPageProps {
  currentUser: User | null;
  onEnterApp: () => void;
  onOpenAuthModal: (initialMode: 'signin' | 'signup') => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  authMode: 'signin' | 'signup';
  setAuthMode: (m: 'signin' | 'signup') => void;
}

type ShowcaseTabId =
  | 'water-cycle'
  | 'photosynthesis'
  | 'acids'
  | 'blood-vessels'
  | 'mass-physics'
  | 'sine-3d'
  | 'layers-groups';

export interface ScienceNoteAsset {
  id: ShowcaseTabId;
  tabLabel: string;
  shortTitle: string;
  title: string;
  subjectBadge: string;
  subjectColor: string;
  src: string;
  highlightColor: string;
  highlightText: string;
  secondaryHighlightText: string;
  description: string;
  formulaBadge: string;
}

const SCIENCE_NOTES: ScienceNoteAsset[] = [
  {
    id: 'water-cycle',
    tabLabel: '1. Whiteboard • Κύκλος Νερού',
    shortTitle: 'Ο Κύκλος του Νερού',
    title: 'Ο Κύκλος του Νερού — Διαδραστικό Whiteboard',
    subjectBadge: 'Γεωγραφία & Φυσική',
    subjectColor: '#0284c7',
    src: '/showcase/kyklos-nerou.png',
    highlightColor: '#fde047',
    highlightText: '1. Εξάτμιση ➔ 2. Συμπύκνωση ➔ 3. Κατακρήμνιση',
    secondaryHighlightText: '4. Συγκέντρωση σε λίμνες, ποτάμια & θάλασσες',
    description:
      'Συνδύασε χειρόγραφες σημειώσεις σε τετραγωνισμένο χαρτί με εικονογραφήσεις, βέλη ροής, φωσφορούχο υπογραμμιστήριο και σύρε ελεύθερα τις κάρτες με το ποντίκι.',
    formulaBadge: '☀️ Εξάτμιση & Συμπύκνωση Η₂Ο',
  },
  {
    id: 'photosynthesis',
    tabLabel: '2. PDF • Φωτοσύνθεση',
    shortTitle: 'Η Φωτοσύνθεση',
    title: 'Η Φωτοσύνθεση — Υπογράμμιση PDF με Apple Pencil',
    subjectBadge: 'Βιολογία',
    subjectColor: '#16a34a',
    src: '/showcase/fotosynthesi.jpg',
    highlightColor: '#4ade80',
    highlightText: '6CO₂ + 6H₂O ➔ C₆H₁₂O₆ (Γλυκόζη) + 6O₂',
    secondaryHighlightText: 'Χλωροπλάστης • Θυλακοειδή & Grana',
    description:
      'Υπογράμμισε με φωσφορούχο μαρκαδόρο τις χημικές εξισώσεις της φωτοσύνθεσης, κύκλωσε τον χλωροπλάστη και το φυτικό κύτταρο και κάνε zoom σε κάθε λεπτομέρεια.',
    formulaBadge: '🌿 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
  },
  {
    id: 'acids',
    tabLabel: '3. Documents • Τα Οξέα',
    shortTitle: 'Τα Οξέα (Χημεία)',
    title: 'Τα Οξέα — Μικρά στη γεύση, μεγάλα σε δράση!',
    subjectBadge: 'Χημεία',
    subjectColor: '#dc2626',
    src: '/showcase/oxea.jpg',
    highlightColor: '#fde047',
    highlightText: 'HA ➔ H⁺ + A⁻ (Ιοντισμός Οξέων σε Διάλυμα)',
    secondaryHighlightText: 'HCl, H₂SO₄, CH₃COOH • Δείκτες pH & Μέταλλα',
    description:
      'Οργάνωσε πολύχρωμα φύλλα Χημείας με ξύδι, λεμόνι, γαλακτικό & υδροχλωρικό οξύ, μετατροπή εξισώσεων με MathOCR και φωσφορούχες επισημάνσεις.',
    formulaBadge: '🧪 HA → H⁺ + A⁻ | pH < 7',
  },
  {
    id: 'blood-vessels',
    tabLabel: '4. Notebooks • Αιμοφόρα Αγγεία',
    shortTitle: 'Αιμοφόρα Αγγεία',
    title: 'Αιμοφόρα Αγγεία — Αρτηρίες, Φλέβες & Τριχοειδή',
    subjectBadge: 'Ανατομία & Βιολογία',
    subjectColor: '#e11d48',
    src: '/showcase/aimofora-aggeia.jpg',
    highlightColor: '#f472b6',
    highlightText: 'Αρτηρίες (O₂) ➔ Τριχοειδή (Ανταλλαγή) ➔ Φλέβες (CO₂)',
    secondaryHighlightText: 'Ροή Πίεσης & Βαλβίδες Φλεβικής Επιστροφής',
    description:
      'Μελέτησε το κυκλοφορικό σύστημα με ζωντανή υπογράμμιση Apple Pencil, ορθογώνιο λάσο επιλογής και ανεξάρτητα Layers για εξάσκηση.',
    formulaBadge: '❤️ Αρτηρίες • Φλέβες • Τριχοειδή',
  },
  {
    id: 'mass-physics',
    tabLabel: '5. Φυσική • Η Μάζα',
    shortTitle: 'Τι είναι η Μάζα',
    title: 'Τι είναι η Μάζα και Πώς την Μετράμε',
    subjectBadge: 'Φυσική & Μετρήσεις',
    subjectColor: '#2563eb',
    src: '/showcase/maza.png',
    highlightColor: '#38bdf8',
    highlightText: 'Η μάζα είναι η ποσότητα ύλης που περιέχει ένα σώμα',
    secondaryHighlightText: '1. Με ζυγό ισορροπίας • 2. Με ηλεκτρονική ζυγαριά (185.4 g)',
    description:
      'Σχεδίασε πειράματα μέτρησης μάζας με ζυγό ισορροπίας, σταθμά (100g, 50g, 20g, 5g) και ηλεκτρονική ζυγαριά με αυτόματο zoom και MathOCR.',
    formulaBadge: '⚖️ m = 185.4 g (Σταθερή Παντού)',
  },
];

const SHOWCASE_TABS: { id: ShowcaseTabId; label: string; badge?: string }[] = [
  { id: 'water-cycle', label: '1. Κύκλος Νερού' },
  { id: 'photosynthesis', label: '2. Φωτοσύνθεση' },
  { id: 'acids', label: '3. Τα Οξέα' },
  { id: 'blood-vessels', label: '4. Αιμοφόρα Αγγεία' },
  { id: 'mass-physics', label: '5. Η Μάζα' },
  { id: 'sine-3d', label: 'Ημίτονα & 3D', badge: 'PRO' },
  { id: 'layers-groups', label: 'Layers & Groups', badge: 'PRO' },
];

/* ============================================================================
   INTERACTIVE DRAGGABLE CARD WRAPPER (Mouse & Touch Dragging with Reset)
   ============================================================================ */
const DraggableCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  resetSignal?: number;
  badgeText?: string;
  onClickCard?: () => void;
}> = ({ children, className = '', style, resetSignal = 0, badgeText = '✋ Σύρε με ποντίκι', onClickCard }) => {
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(
    null
  );

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [resetSignal]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.moved = true;
    }
    setOffset({
      x: dragStartRef.current.origX + dx,
      y: dragStartRef.current.origY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const wasMoved = dragStartRef.current?.moved;
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (!wasMoved && onClickCard) {
      onClickCard();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        ...style,
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) ${isDragging ? 'scale(1.04) rotate(0deg)' : ''}`,
        transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease',
        touchAction: 'none',
      }}
      className={`group/drag select-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50 shadow-2xl ring-2 ring-[#0066ff]' : ''
      } ${className}`}
    >
      {badgeText && (
        <div className="pointer-events-none absolute -top-2.5 right-3 z-30 px-2 py-0.5 rounded-full bg-slate-900/85 text-white text-[9px] font-bold tracking-wide shadow-sm opacity-85 group-hover/drag:opacity-100 group-hover/drag:bg-[#0066ff] transition flex items-center gap-1">
          <Move className="w-2.5 h-2.5" />
          <span>{badgeText}</span>
        </div>
      )}
      {children}
    </div>
  );
};

export const isExplainBoardsBrand =
  typeof window !== 'undefined' &&
  (window.location.hostname.toLowerCase().includes('explainboard') ||
    window.location.search.toLowerCase().includes('explainboard'));

export const BestNotesLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  if (isExplainBoardsBrand) {
    return (
      <img
        src="/explainboards-icon.png"
        alt="ExplainBoards"
        className={`${className} object-contain`}
      />
    );
  }
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="23" fill="#ffffff" stroke="#dcdfe4" strokeWidth="5.5" />
      <line x1="42" y1="31" x2="77" y2="31" stroke="#e11d48" strokeWidth="6.6" strokeLinecap="round" />
      <line x1="48" y1="49" x2="77" y2="49" stroke="#e11d48" strokeWidth="6.6" strokeLinecap="round" />
      <path d="M 44 73.5 C 51 82, 69 81, 76 63" stroke="#e11d48" strokeWidth="6.6" strokeLinecap="round" fill="none" />
      <g transform="translate(30.5, 47.5) rotate(-21)">
        <path
          d="M -5.3 -16.5 A 5.3 5.3 0 0 1 5.3 -16.5 L 5.3 8.5 L 1.0 21.2 C 0.5 22.5 -0.5 22.5 -1.0 21.2 L -5.3 8.5 Z"
          fill="#111315"
        />
      </g>
    </svg>
  );
};

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  setMode: (m: 'signin' | 'signup') => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, mode, setMode, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const translateFirebaseError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Λάθος email ή κωδικός πρόσβασης. Έλεγξε τα στοιχεία σου ή κάνε Εγγραφή.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'Αυτό το email χρησιμοποιείται ήδη. Επίλεξε «Σύνδεση» για να μπεις στον λογαριασμό σου.';
    }
    if (code === 'auth/weak-password') {
      return 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Το παράθυρο σύνδεσης Google έκλεισε πριν ολοκληρωθεί.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Το domain προετοιμάζεται στο Firebase Auth — δοκίμασε ξανά σε λίγα δευτερόλεπτα ή συνδέσου με Email.';
    }
    return err?.message || 'Παρουσιάστηκε σφάλμα κατά τη σύνδεση.';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (fullName.trim()) {
          await updateProfile(cred.user, { displayName: fullName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          aria-label="Κλείσιμο"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5">
          <BestNotesLogoIcon className="w-10 h-10 shrink-0 shadow-2xs" />
          <div>
            <h2
              className="text-lg font-semibold tracking-[-0.025em] text-[#111315]"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              {mode === 'signin'
                ? isExplainBoardsBrand
                  ? 'Σύνδεση στο ExplainBoards'
                  : 'Σύνδεση στο BestNotes'
                : 'Δημιουργία Λογαριασμού'}
            </h2>
            <p className="text-xs text-slate-500">
              Συγχρόνισε τις σημειώσεις και τα σχήματά σου παντού
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Σύνδεση (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Εγγραφή (Sign Up)
          </button>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 shadow-2xs transition cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Συνέχεια με Google</span>
        </button>

        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ή με Email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                Ονοματεπώνυμο
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                enterKeyHint="next"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="π.χ. Φρειδερίκος Κ."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
              Διεύθυνση Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="username"
              spellCheck={false}
              enterKeyHint="next"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={mode === 'signin' ? 'current-password' : 'new-password'}
                className="block text-xs font-bold text-slate-700"
              >
                Κωδικός Πρόσβασης
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[11px] font-semibold text-[#0066ff] hover:underline cursor-pointer"
              >
                {showPassword ? 'Απόκρυψη' : 'Εμφάνιση'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id={mode === 'signin' ? 'current-password' : 'new-password'}
              name="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              enterKeyHint="done"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Τουλάχιστον 6 χαρακτήρες"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0066ff] hover:bg-blue-600 text-white text-sm font-bold shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {loading
              ? 'Παρακαλώ περιμένετε...'
              : mode === 'signin'
              ? 'Σύνδεση (Sign In)'
              : 'Δημιουργία Λογαριασμού (Sign Up)'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onSuccess}
            className="text-xs font-semibold text-slate-500 hover:text-[#0066ff] transition cursor-pointer"
          >
            Συνέχεια κατευθείαν στην εφαρμογή χωρίς σύνδεση →
          </button>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onEnterApp,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<ShowcaseTabId>('water-cycle');
  const [tabProgress, setTabProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [dragResetCounter, setDragResetCounter] = useState<number>(0);
  const [zoomedNote, setZoomedNote] = useState<ScienceNoteAsset | null>(null);
  const [activeBentoIndex, setActiveBentoIndex] = useState<number>(0);

  // Auto-cycle through the 5 animated Science Image Tabs + 2 PRO tabs
  useEffect(() => {
    if (isPaused) return;
    const interval = window.setInterval(() => {
      setTabProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((curr) => {
            const idx = SHOWCASE_TABS.findIndex((t) => t.id === curr);
            const nextIdx = (idx + 1) % SHOWCASE_TABS.length;
            return SHOWCASE_TABS[nextIdx].id;
          });
          return 0;
        }
        return prev + 1.25;
      });
    }, 85);
    return () => window.clearInterval(interval);
  }, [isPaused]);

  // Subtle cross-fade & zoom pulse cycle on the below-the-fold gallery
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBentoIndex((prev) => (prev + 1) % SCIENCE_NOTES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const handleSelectTab = (id: ShowcaseTabId) => {
    setActiveTab(id);
    setTabProgress(0);
  };

  const activeScienceNote = SCIENCE_NOTES.find((n) => n.id === activeTab) || null;
  const secondaryNotes = SCIENCE_NOTES.filter((n) => n.id !== activeTab);

  return (
    <div
      data-ui-panel="true"
      style={{ touchAction: 'pan-y' }}
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-white text-slate-900 select-none"
    >
      {/* Keyframe animations: Stronger Ken-Burns Zoom, Hand-drawn Circles & Expanding Selection Frames */}
      <style>{`
        @keyframes bnDrawStroke {
          0% { stroke-dashoffset: 680; opacity: 0.25; }
          45%, 85% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 680; opacity: 0.25; }
        }
        @keyframes bnPenMoveOrbit {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(68px, -18px) rotate(4deg); }
          50% { transform: translate(115px, 14px) rotate(-5deg); }
          75% { transform: translate(38px, 24px) rotate(3deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes bnTabFadeZoomIn {
          0% { opacity: 0; transform: scale(0.93) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0px); }
        }
        @keyframes bnKenBurnsPulse {
          0%, 100% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.28) translate(-10px, -6px); }
        }
        @keyframes bnCrossFadeBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.22); }
        }
        @keyframes bnPopupFrameOpen {
          0%, 12% { transform: scale(0.72); opacity: 0; }
          28%, 80% { transform: scale(1); opacity: 1; }
          94%, 100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes bnFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bnFloatDelayed {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-7px) rotate(1.5deg); }
        }
        @keyframes bnSineMorph {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.52); }
        }
        @keyframes bnLassoPulse {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-1.5deg) scale(1.045); }
        }
        @keyframes bnRectMarqueeSweep {
          0%, 10% { width: 28px; height: 22px; opacity: 0; }
          20% { opacity: 1; }
          55%, 85% { width: 210px; height: 124px; opacity: 1; }
          96%, 100% { width: 210px; height: 124px; opacity: 0; }
        }
        .bn-animate-draw {
          stroke-dasharray: 680;
          animation: bnDrawStroke 4.2s ease-in-out infinite;
        }
        .bn-animate-draw-delayed {
          stroke-dasharray: 680;
          animation: bnDrawStroke 4.2s ease-in-out 1.8s infinite;
        }
        .bn-animate-pen {
          animation: bnPenMoveOrbit 4.4s ease-in-out infinite;
        }
        .bn-tab-stage {
          animation: bnTabFadeZoomIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .bn-ken-burns {
          animation: bnKenBurnsPulse 6.2s ease-in-out infinite;
        }
        .bn-fade-zoom-cycle {
          animation: bnCrossFadeBreath 4.8s ease-in-out infinite;
        }
        .bn-popup-frame {
          transform-origin: center center;
          animation: bnPopupFrameOpen 4.8s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .bn-animate-float {
          animation: bnFloatSlow 4.6s ease-in-out infinite;
        }
        .bn-animate-float-delayed {
          animation: bnFloatDelayed 5.2s ease-in-out infinite;
        }
        .bn-animate-sine {
          transform-origin: center 135px;
          animation: bnSineMorph 3.1s ease-in-out infinite;
        }
        .bn-animate-lasso {
          animation: bnLassoPulse 3.8s ease-in-out infinite;
        }
        .bn-rect-marquee {
          animation: bnRectMarqueeSweep 4.6s ease-in-out infinite;
        }
        .bn-scroll-reveal {
          opacity: 1;
        }
      `}</style>

      {/* =====================================================================
          1. TOP NAVIGATION BAR (Goodnotes.com Minimalist Header)
         ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-8">
            <div
              onClick={onEnterApp}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              {isExplainBoardsBrand ? (
                <img
                  src="/explainboards-logo.png"
                  alt="ExplainBoards"
                  className="h-9 sm:h-10 w-auto object-contain group-hover:scale-[1.02] transition shrink-0"
                />
              ) : (
                <>
                  <BestNotesLogoIcon className="w-9 h-9 group-hover:scale-105 transition shrink-0" />
                  <span
                    className="text-[22px] font-semibold tracking-[-0.03em] text-[#111315] inline-flex items-start leading-none"
                    style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
                  >
                    BestNotes
                    <sup className="text-[7px] font-bold tracking-normal text-[#111315] ml-0.5 mt-0.5">
                      TM
                    </sup>
                  </span>
                </>
              )}
            </div>

            <nav className="hidden lg:flex items-center gap-5 text-xs xl:text-sm font-semibold text-slate-700">
              {SCIENCE_NOTES.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => handleSelectTab(note.id)}
                  className={`transition cursor-pointer ${
                    activeTab === note.id ? 'text-[#0066ff] font-extrabold' : 'hover:text-[#0066ff]'
                  }`}
                >
                  {note.shortTitle}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleSelectTab('sine-3d')}
                className="hover:text-[#0066ff] transition cursor-pointer"
              >
                3D &amp; Μαθηματικά
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  <UserIcon className="w-3.5 h-3.5 text-[#0066ff]" />
                  <span className="max-w-[150px] truncate">
                    {currentUser.displayName || currentUser.email || 'Χρήστης'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition cursor-pointer"
                  title="Αποσύνδεση (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal('signin')}
                className="px-3.5 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              >
                Login
              </button>
            )}

            <button
              type="button"
              onClick={onEnterApp}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#46c8f5] hover:bg-[#2bb8eb] text-slate-950 text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <span>Έναρξη</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. HERO SECTION + 5 ANIMATED SCIENCE SHOWCASE TABS (+ 2 PRO TABS)
         ===================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-28">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-extrabold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ζωντανό Apple Pencil • Φωσφορούχος Μαρκαδόρος • Draggable Καρτέλες • MathOCR</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight text-slate-950 leading-[1.12]">
            {isExplainBoardsBrand ? (
              <>
                Take <span className="text-[#111722]">Explain</span>
                <span className="text-[#df1b3f]">Boards</span> wherever you work
              </>
            ) : (
              'Take BestNotes wherever you work'
            )}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Ο Κύκλος του Νερού, Η Φωτοσύνθεση, Τα Οξέα, Αιμοφόρα Αγγεία &amp; Η Μάζα στη Φυσική —
            <br className="hidden sm:inline" /> σύρε τις καρτέλες με το ποντίκι, κάνε zoom και δες το Apple Pencil να υπογραμμίζει ζωντανά!
          </p>

          <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#46c8f5] hover:bg-[#2bb8eb] text-slate-950 text-sm font-extrabold shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <span>Start Free / Έναρξη</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {!currentUser && (
              <button
                type="button"
                onClick={() => onOpenAuthModal('signup')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold transition cursor-pointer"
              >
                <span>Εγγραφή με Google / Email</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setDragResetCounter((c) => c + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="Επαναφορά όλων των καρτών που έσυρες με το ποντίκι"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Επαναφορά Draggable Καρτών</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            3. FOLDER-STYLE SHOWCASE TABS (5 First Tabs with the 5 Images + 2 PRO Tabs)
           =================================================================== */}
        <div
          className="mt-10 max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Folder Tab Headers (5 Science Tabs + 2 PRO Tabs) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 px-2">
            {SHOWCASE_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`relative flex items-center justify-center gap-1.5 px-2.5 py-3.5 rounded-t-2xl text-xs sm:text-[12.5px] transition cursor-pointer overflow-hidden border border-b-0 ${
                    isSelected
                      ? 'bg-[#efefef] text-slate-950 font-extrabold border-slate-300 shadow-xs scale-[1.02]'
                      : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200/80 font-semibold'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#0066ff] text-white text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                      {tab.badge}
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3.5px] bg-slate-300/70">
                      <div
                        className="h-full bg-[#0066ff] transition-all duration-75"
                        style={{ width: `${tabProgress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Goodnotes Tablet Showcase Frame */}
          <div className="relative rounded-3xl rounded-tl-none bg-[#f2f4f7] border border-slate-200/90 shadow-2xl overflow-hidden min-h-[610px]">
            {/* Top Goodnotes-style App Header inside Preview */}
            <div className="bg-[#1e40af] text-white px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-4 h-4 text-sky-200" />
                <Search className="w-4 h-4 text-sky-200" />
                <span className="font-semibold text-sky-100 hidden sm:inline">
                  {isExplainBoardsBrand ? 'ExplainBoards' : 'BestNotes'} —{' '}
                  {activeScienceNote ? activeScienceNote.title : SHOWCASE_TABS.find((t) => t.id === activeTab)?.label}
                </span>
              </div>

              {/* Simulated Goodnotes / BestNotes Toolbar Icons */}
              <div className="flex items-center gap-2.5 bg-white/15 px-3.5 py-1 rounded-full">
                <Pen className="w-3.5 h-3.5 text-white" />
                <Eraser className="w-3.5 h-3.5 text-sky-200" />
                <Highlighter className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <Shapes className="w-3.5 h-3.5 text-emerald-300" />
                <Lasso className="w-3.5 h-3.5 text-sky-200" />
                <Layers className="w-3.5 h-3.5 text-pink-200" />
              </div>

              <button
                type="button"
                onClick={onEnterApp}
                className="px-3 py-1 rounded-full bg-[#46c8f5] text-slate-950 font-bold text-[11px] hover:bg-sky-300 transition cursor-pointer"
              >
                Άνοιγμα στην Εφαρμογή →
              </button>
            </div>

            {/* Sub-bar inside Preview */}
            <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex items-center justify-between gap-3 text-[11px] text-slate-600 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0066ff] text-white font-semibold">
                  ✏️ Apple Pencil &amp; Φωσφορούχος
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  ⬚ Ορθογώνιο Λάσο &amp; ∑ MathOCR
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-slate-500 hidden md:inline">
                  💡 Tip: Πιάσε οποιαδήποτε πλαϊνή καρτέλα με το ποντίκι και σύρε την!
                </span>
                <button
                  type="button"
                  onClick={() => setDragResetCounter((c) => c + 1)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer transition"
                >
                  ↺ Reset Θέσεων
                </button>
              </div>
            </div>

            {/* ===============================================================
                TABS 1 TO 5: THE 5 UPLOADED SCIENCE NOTES WITH FULL GOODNOTES
                ANIMATIONS (Fade In/Out, Zoom, Draggable Cards, Apple Pencil
                Fluorescent Highlighting, Rectangular Marquee & Magnifier Loupe!)
               =============================================================== */}
            {activeScienceNote && (
              <div
                key={activeScienceNote.id}
                className="bn-tab-stage relative p-5 sm:p-8 min-h-[535px] flex items-center justify-center overflow-hidden"
                style={{
                  backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.42) 1.3px, transparent 1.3px)',
                  backgroundSize: '20px 20px',
                  backgroundColor: '#f8fafc',
                }}
              >
                {/* TOP-LEFT DRAGGABLE FLOATING CARD (Secondary Note #1) */}
                {secondaryNotes[0] && (
                  <DraggableCard
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε με ποντίκι"
                    onClickCard={() => handleSelectTab(secondaryNotes[0].id)}
                    className="hidden lg:block absolute left-4 top-6 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 p-2.5 -rotate-2 z-20"
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-700 mb-1.5">
                      <span className="truncate">{secondaryNotes[0].shortTitle}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-white text-[8.5px]"
                        style={{ backgroundColor: secondaryNotes[0].subjectColor }}
                      >
                        {secondaryNotes[0].subjectBadge}
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={secondaryNotes[0].src}
                        alt={secondaryNotes[0].shortTitle}
                        {...({ fetchpriority: 'low' } as any)}
                        className="w-full h-32 object-cover bn-fade-zoom-cycle"
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9.5px] font-bold text-slate-500">
                      <span className="truncate">{secondaryNotes[0].formulaBadge}</span>
                      <span className="text-[#0066ff] shrink-0">Προβολή →</span>
                    </div>
                  </DraggableCard>
                )}

                {/* BOTTOM-LEFT DRAGGABLE STICKY / POLAROID CARD (Secondary Note #2) */}
                {secondaryNotes[1] && (
                  <DraggableCard
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε με ποντίκι"
                    onClickCard={() => handleSelectTab(secondaryNotes[1].id)}
                    className="hidden lg:block absolute left-6 bottom-6 w-56 rounded-2xl bg-[#fef9c3] shadow-xl border border-amber-300 p-2.5 rotate-2 z-20"
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-950 mb-1.5">
                      <span className="truncate">📌 {secondaryNotes[1].shortTitle}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-300/80 text-amber-950 text-[8.5px]">
                        Σημείωση
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-amber-300 bg-white">
                      <img
                        src={secondaryNotes[1].src}
                        alt={secondaryNotes[1].shortTitle}
                        {...({ fetchpriority: 'low' } as any)}
                        className="w-full h-28 object-cover bn-ken-burns"
                      />
                    </div>
                    <div className="mt-1.5 text-[9.5px] font-bold text-amber-900 truncate">
                      {secondaryNotes[1].highlightText}
                    </div>
                  </DraggableCard>
                )}

                {/* CENTER MAIN INTERACTIVE SHEET (The Active Science Note with Live Apple Pencil + Fluorescent Highlighter + Zoom!) */}
                <DraggableCard
                  resetSignal={dragResetCounter}
                  badgeText="✋ Σύρε τον Καμβά ή Κάνε Κλικ για Zoom"
                  onClickCard={() => setZoomedNote(activeScienceNote)}
                  className="relative w-full max-w-2xl rounded-3xl bg-white border-2 border-slate-200/95 shadow-2xl p-4 sm:p-5 z-10"
                >
                  {/* Sheet Top Info Bar */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-white text-[10.5px] font-extrabold"
                        style={{ backgroundColor: activeScienceNote.subjectColor }}
                      >
                        {activeScienceNote.subjectBadge}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {activeScienceNote.shortTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 text-[10px] font-extrabold">
                        {activeScienceNote.formulaBadge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedNote(activeScienceNote);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0066ff] hover:text-white text-slate-700 text-[10.5px] font-bold transition cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Zoom</span>
                      </button>
                    </div>
                  </div>

                  {/* Main High-Resolution Note Canvas with Strong Zoom & 1 Green Rectangular Selection Frame */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#fffdf9] shadow-inner">
                    <img
                      src={activeScienceNote.src}
                      alt={activeScienceNote.title}
                      {...({ fetchpriority: 'high' } as any)}
                      className="w-full max-h-[370px] object-contain mx-auto bn-ken-burns"
                    />

                    {/* Single Animated Green Rectangular Marquee Selection on Bottom-Right */}
                    <div
                      className="pointer-events-none absolute bottom-5 right-6 border-2 border-dashed border-[#22c55e] bg-emerald-500/10 rounded-xl bn-rect-marquee flex items-start justify-end p-1.5"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-[#22c55e] text-white text-[8.5px] font-extrabold shadow-xs">
                        ⬚ Ορθογώνια Επιλογή
                      </span>
                      <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white" />
                      <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white" />
                      <span className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white" />
                      <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white" />
                    </div>
                  </div>

                  {/* Clean Caption Bar under the Image */}
                  <div className="mt-3.5 flex items-center justify-between gap-3 bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-xs flex-wrap">
                    <span className="font-extrabold text-slate-900 text-[11px]">
                      ✨ {activeScienceNote.highlightText}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {activeScienceNote.secondaryHighlightText}
                    </span>
                  </div>
                </DraggableCard>

                {/* TOP-RIGHT DRAGGABLE FLOATING CARD (Secondary Note #3) */}
                {secondaryNotes[2] && (
                  <DraggableCard
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε με ποντίκι"
                    onClickCard={() => handleSelectTab(secondaryNotes[2].id)}
                    className="hidden lg:block absolute right-4 top-6 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 p-2.5 rotate-2 z-20"
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-700 mb-1.5">
                      <span className="truncate">{secondaryNotes[2].shortTitle}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-white text-[8.5px]"
                        style={{ backgroundColor: secondaryNotes[2].subjectColor }}
                      >
                        {secondaryNotes[2].subjectBadge}
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={secondaryNotes[2].src}
                        alt={secondaryNotes[2].shortTitle}
                        {...({ fetchpriority: 'low' } as any)}
                        className="w-full h-32 object-cover bn-fade-zoom-cycle"
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9.5px] font-bold text-slate-500">
                      <span className="truncate">{secondaryNotes[2].formulaBadge}</span>
                      <span className="text-[#0066ff] shrink-0">Προβολή →</span>
                    </div>
                  </DraggableCard>
                )}

                {/* BOTTOM-RIGHT DRAGGABLE FLOATING CARD (Secondary Note #4) */}
                {secondaryNotes[3] && (
                  <DraggableCard
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε με ποντίκι"
                    onClickCard={() => handleSelectTab(secondaryNotes[3].id)}
                    className="hidden lg:block absolute right-6 bottom-6 w-56 rounded-2xl bg-sky-50/95 shadow-xl border border-sky-200 p-2.5 -rotate-2 z-20"
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-sky-950 mb-1.5">
                      <span className="truncate">🔍 {secondaryNotes[3].shortTitle}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#0066ff] text-white text-[8.5px]">
                        MathOCR
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-sky-200 bg-white">
                      <img
                        src={secondaryNotes[3].src}
                        alt={secondaryNotes[3].shortTitle}
                        {...({ fetchpriority: 'low' } as any)}
                        className="w-full h-28 object-cover bn-ken-burns"
                      />
                    </div>
                    <div className="mt-1.5 text-[9.5px] font-bold text-sky-900 truncate">
                      {secondaryNotes[3].highlightText}
                    </div>
                  </DraggableCard>
                )}
              </div>
            )}

            {/* ===============================================================
                TAB 6 (PRO #1): ΗΜΙΤΟΝΑ & 3D ΣΧΗΜΑΤΑ
               =============================================================== */}
            {activeTab === 'sine-3d' && (
              <div className="bn-tab-stage p-6 sm:p-8 min-h-[535px] flex flex-col lg:flex-row items-stretch justify-center gap-6">
                <div className="w-full lg:w-1/2 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-lg p-5 flex flex-col justify-between relative">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-[#0066ff] uppercase tracking-wider">
                        〰️ Ημίτονο 2 Κόμβων &amp; ╰ Υπερβολή (y = c/x)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold">
                        PRO Εργαλείο
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Τράβηξε τον κίτρινο κόμβο <b>↕ Κορυφή</b> μόνο πάνω/κάτω για το πλάτος και το <b>↔ Άκρο</b> μόνο αριστερά/δεξιά, ή σχεδίασε ασυμπτωτική <b>Υπερβολή (P·V = σταθ.)</b>!
                    </p>
                  </div>

                  <svg className="w-full h-60 bg-white rounded-xl border border-slate-200/80 shadow-inner" viewBox="0 0 420 215">
                    <line x1="25" y1="135" x2="255" y2="135" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1="35" y1="25" x2="35" y2="195" stroke="#94a3b8" strokeWidth="1.5" />
                    <g className="bn-animate-sine">
                      <path
                        d="M 35 135 C 62 42, 88 42, 115 135 C 142 228, 168 228, 195 135"
                        fill="rgba(0, 102, 255, 0.08)"
                        stroke="#0066ff"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />
                      <rect x="68" y="59" width="14" height="14" fill="#fef08a" stroke="#2563eb" strokeWidth="2.2" />
                      <text x="46" y="51" fill="#1e3a8a" fontSize="10" fontWeight="bold">
                        ↕ Κορυφή (Πλάτος A)
                      </text>
                    </g>
                    <rect x="188" y="128" width="14" height="14" fill="#ffffff" stroke="#2563eb" strokeWidth="2.2" />
                    <text x="205" y="139" fill="#1e3a8a" fontSize="10" fontWeight="bold">
                      ↔ Άκρο (λ)
                    </text>

                    <line x1="285" y1="25" x2="285" y2="180" stroke="#64748b" strokeWidth="1.6" />
                    <line x1="285" y1="180" x2="408" y2="180" stroke="#64748b" strokeWidth="1.6" />
                    <path
                      d="M 295 35 Q 302 162 398 170"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      className="bn-animate-draw"
                    />
                    <rect x="316" y="130" width="12" height="12" fill="#fef08a" stroke="#dc2626" strokeWidth="2" />
                    <text x="310" y="92" fill="#991b1b" fontSize="10" fontWeight="bold">
                      Υπερβολή P·V = nRT
                    </text>
                  </svg>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>✓ Κλείδωμα οριζόντιου άξονα</span>
                    <span className="text-[#0066ff]">✓ Κόψιμο με ✂️ Ψαλίδι σε 2 ημίτονα</span>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-lg p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                        📦 3D Στερεά, Αντιστάτης, Ελατήριο &amp; ∑ MathOCR
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                        1-Click Γέμισμα (F)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Έτοιμο 3D Παραλληλεπίπεδο, 3D Σφαίρα, Κύλινδρος, Πυραμίδα, Αντιστάτης, Ελατήριο και μετατροπή χειρόγραφων κλασμάτων σε τύπους με <b>∑ MathOCR</b>.
                    </p>
                  </div>

                  <svg className="w-full h-60 bg-white rounded-xl border border-slate-200/80 shadow-inner" viewBox="0 0 420 215">
                    <g transform="translate(18, 20)">
                      <polygon points="0,24 64,24 64,88 0,88" fill="rgba(220,38,38,0.16)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <polygon points="0,24 20,0 84,0 64,24" fill="rgba(220,38,38,0.10)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <polygon points="64,24 84,0 84,64 64,88" fill="rgba(220,38,38,0.28)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <text x="4" y="106" fill="#991b1b" fontSize="9.5" fontWeight="bold">3D Κυβόλιθος</text>
                    </g>

                    <g transform="translate(125, 18)">
                      <circle cx="46" cy="46" r="42" fill="rgba(37,99,235,0.14)" stroke="#2563eb" strokeWidth="2.4" />
                      <path d="M 4 46 A 42 14 0 0 0 88 46" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
                      <path d="M 16 46 C 30 18, 40 18, 46 46 C 52 74, 62 74, 76 46" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                      <text x="6" y="108" fill="#1e3a8a" fontSize="9.5" fontWeight="bold">3D Σφαίρα + Κύμα</text>
                    </g>

                    <g transform="translate(236, 18)">
                      <path d="M 8 16 L 8 80 A 34 11 0 0 0 76 80 L 76 16" fill="rgba(147,51,234,0.16)" stroke="#9333ea" strokeWidth="2.3" />
                      <ellipse cx="42" cy="16" rx="34" ry="11" fill="rgba(147,51,234,0.26)" stroke="#9333ea" strokeWidth="2.3" />
                      <ellipse cx="42" cy="80" rx="34" ry="11" fill="none" stroke="#9333ea" strokeWidth="2" strokeDasharray="4 3" />
                      <text x="6" y="108" fill="#6b21a8" fontSize="9.5" fontWeight="bold">3D Κύλινδρος</text>
                    </g>

                    <g transform="translate(330, 18)">
                      <polygon points="38,4 6,78 52,88" fill="rgba(234,179,8,0.20)" stroke="#ca8a04" strokeWidth="2.2" strokeLinejoin="round" />
                      <polygon points="38,4 52,88 76,68" fill="rgba(234,179,8,0.34)" stroke="#ca8a04" strokeWidth="2.2" strokeLinejoin="round" />
                      <line x1="6" y1="78" x2="76" y2="68" stroke="#ca8a04" strokeWidth="1.6" strokeDasharray="3 3" />
                      <text x="8" y="108" fill="#854d0e" fontSize="9.5" fontWeight="bold">3D Πυραμίδα</text>
                    </g>

                    <path
                      d="M 20 172 L 48 172 L 56 156 L 70 188 L 84 156 L 98 188 L 112 156 L 126 188 L 134 172 L 162 172"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="48" y="204" fill="#334155" fontSize="9.5" fontWeight="bold">⚡ Αντιστάτης R</text>

                    <path
                      d="M 215 172 L 235 172 C 240 150, 252 150, 250 172 C 248 190, 260 190, 265 172 C 270 150, 282 150, 280 172 C 278 190, 290 190, 295 172 C 300 150, 312 150, 310 172 L 335 172"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <rect x="335" y="156" width="30" height="30" rx="5" fill="rgba(2,132,199,0.2)" stroke="#0284c7" strokeWidth="2.2" />
                    <text x="242" y="204" fill="#0369a1" fontSize="9.5" fontWeight="bold">🌀 Ελατήριο (F = -kx)</text>
                  </svg>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>✓ Αυτόματο γέμισμα με κράτημα μολυβιού</span>
                    <span className="text-emerald-700">✓ Διαφάνεια 25% / 45% / 90%</span>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 7 (PRO #2): LAYERS & GROUPS
               =============================================================== */}
            {activeTab === 'layers-groups' && (
              <div className="bn-tab-stage p-6 sm:p-8 min-h-[535px] flex flex-col lg:flex-row items-stretch justify-center gap-6">
                <div className="w-full lg:w-5/12 rounded-2xl bg-white border border-slate-200 shadow-lg p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#0066ff]" />
                        <span className="text-xs font-extrabold text-slate-900">
                          Διαχείριση Ενθέτων (Layers)
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0066ff] text-[10px] font-bold">
                        + Νέο Layer
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-[#0066ff] text-xs shadow-2xs">
                        <div className="flex items-center gap-2 font-bold text-[#1b2a4a]">
                          <GripVertical className="w-4 h-4 text-[#0066ff]" />
                          <span>1. Υπογραμμίσεις &amp; MathOCR (12)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Eye className="w-3.5 h-3.5 text-[#0066ff]" />
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-300 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <GripVertical className="w-4 h-4 text-amber-600" />
                          <span>2. Κύκλος Νερού / Φωτοσύνθεση (Κλειδωμένο)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-slate-700" />
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs opacity-65">
                        <div className="flex items-center gap-2 font-semibold text-slate-500">
                          <GripVertical className="w-4 h-4 text-slate-400" />
                          <span>3. Λύσεις Ασκήσεων (Κρυφό Layer)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                    💡 <b>Για Καθηγητές &amp; Μαθητές:</b> Κλείδωσε το σχεδιάγραμμα (Κύκλος του Νερού, Φωτοσύνθεση, Οξέα, Αιμοφόρα Αγγεία ή Μάζα) στο Layer 2 ώστε η σβήστρα να σβήνει <b>μόνο τις πράξεις σου</b> στο Layer 1!
                  </div>
                </div>

                <div className="w-full lg:w-7/12 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-lg p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <span className="text-xs font-extrabold text-slate-900">
                        ⬚ Ορθογώνιο Λάσο, Ελεύθερο Λάσο &amp; Καρτέλες Επιστημών
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Αντίγραφο
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
                          ∑ MathOCR
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                          <Plus className="w-3 h-3" /> (+) Βιβλιοθήκη
                        </span>
                      </div>
                    </div>

                    <div className="relative h-64 rounded-xl bg-white border border-slate-200 p-3 grid grid-cols-3 gap-2.5 items-center">
                      {SCIENCE_NOTES.slice(0, 3).map((note, idx) => (
                        <DraggableCard
                          key={note.id}
                          resetSignal={dragResetCounter}
                          badgeText="✋ Σύρε"
                          className={`rounded-xl p-2 border-2 ${
                            idx === 1
                              ? 'border-dashed border-[#22c55e] bg-emerald-50/30 bn-animate-lasso'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <img
                            src={note.src}
                            alt={note.shortTitle}
                            loading="lazy"
                            className="w-full h-36 object-cover rounded-lg"
                          />
                          <div className="mt-1.5 text-[10px] font-extrabold text-slate-800 truncate text-center">
                            {note.shortTitle}
                          </div>
                        </DraggableCard>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>🟢 Ορθογώνια Επιλογή (Διαγώνια Έλξη)</span>
                    <span className="text-[#0066ff]">🔵 Ελεύθερο Λάσο &amp; ∑ MathOCR</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            4. INTERACTIVE DRAGGABLE 5-CARD SCIENCE STUDIO WALL (All 5 Images
               Visible Together — Drag with Mouse, Fade/Zoom & Fluorescent Pen!)
           =================================================================== */}
        <section className="mt-24 max-w-6xl mx-auto bn-scroll-reveal">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-extrabold uppercase tracking-wider">
              Διαδραστικός Πίνακας 5 Σημειώσεων • Σύρε τις Καρτέλες με το Ποντίκι
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
              Και οι 5 Σημειώσεις Ζωντανά μπροστά σου — Κάνε Drag, Zoom &amp; Υπογράμμιση
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600">
              Πιάσε οποιαδήποτε από τις 5 καρτέλες με το ποντίκι (ή το δάχτυλο) και μετακίνησέ την ελεύθερα στον χώρο, ή πάτησε πάνω της για μεγέθυνση (Zoom) και άνοιγμα στην εφαρμογή!
            </p>
          </div>

          {/* 5-Card Interactive Draggable Grid */}
          <div
            className="relative rounded-3xl border border-slate-200 bg-[#f8fafc] p-6 sm:p-8 shadow-xl overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {SCIENCE_NOTES.map((note, idx) => {
                const isSpotlight = activeBentoIndex === idx;
                return (
                  <DraggableCard
                    key={note.id}
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε με το ποντίκι"
                    onClickCard={() => setZoomedNote(note)}
                    className={`rounded-3xl bg-white border-2 p-4 shadow-lg flex flex-col justify-between transition-all ${
                      idx === 0 ? 'lg:col-span-2' : ''
                    } ${
                      isSpotlight
                        ? 'border-[#0066ff] shadow-2xl ring-4 ring-[#0066ff]/15'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="px-2.5 py-1 rounded-lg text-white text-xs font-extrabold"
                          style={{ backgroundColor: note.subjectColor }}
                        >
                          {note.subjectBadge}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900 text-[10px] font-extrabold">
                            {note.formulaBadge}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomedNote(note);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#0066ff] hover:text-white text-slate-700 transition cursor-pointer"
                            title="Μεγέθυνση (Zoom)"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#fffdf9]">
                        <img
                          src={note.src}
                          alt={note.title}
                          loading="lazy"
                          className={`w-full ${
                            idx === 0 ? 'h-64 sm:h-72' : 'h-56'
                          } object-contain mx-auto transition-transform duration-700 ${
                            isSpotlight ? 'bn-ken-burns' : 'group-hover/drag:scale-[1.22]'
                          }`}
                        />

                        {/* Single Green Rectangular Selection Frame on Spotlight Card */}
                        {isSpotlight && (
                          <div className="pointer-events-none absolute bottom-3 right-3 border-2 border-dashed border-[#22c55e] bg-emerald-500/10 rounded-xl px-2.5 py-1.5 bn-rect-marquee flex items-start justify-end">
                            <span className="px-1.5 py-0.5 rounded bg-[#22c55e] text-white text-[9px] font-extrabold">
                              ⬚ Ορθογώνια Επιλογή
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="mt-3.5 text-base font-extrabold text-slate-900">
                        {note.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {note.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[10.5px] font-extrabold text-slate-800 truncate">
                        ✨ {note.highlightText}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnterApp();
                        }}
                        className="text-xs font-extrabold text-[#0066ff] hover:underline shrink-0 cursor-pointer"
                      >
                        Άνοιγμα →
                      </button>
                    </div>
                  </DraggableCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            5. FULL-PAGE ALTERNATING GOODNOTES SHOWCASE SECTIONS (All 5 Images
               Large & Detailed Down the Page with Zoom, Circles & Expanding Frames)
           =================================================================== */}
        <section className="mt-24 max-w-6xl mx-auto space-y-20">
          <div className="text-center max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0066ff] text-xs font-extrabold uppercase tracking-wider">
              Αναλυτική Παρουσίαση Σημειώσεων • Goodnotes Εμπειρία
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
              Δες κάθε μία από τις 5 Σημειώσεις σε Πλήρες Μέγεθος &amp; Κίνηση
            </h2>
          </div>

          {SCIENCE_NOTES.map((note, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={note.id}
                className={`flex flex-col ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } items-center gap-8 lg:gap-12 rounded-3xl bg-[#fffdf9] border border-slate-200/90 p-6 sm:p-10 shadow-xl`}
              >
                {/* Image Showcase Side (Draggable + Strong Zoom & 1 Green Rectangular Selection Frame) */}
                <div className="w-full lg:w-7/12 relative">
                  <DraggableCard
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε την εικόνα ή Πάτα για Zoom"
                    onClickCard={() => setZoomedNote(note)}
                    className="relative rounded-2xl overflow-hidden bg-white border-2 border-slate-200 shadow-2xl p-3"
                  >
                    <img
                      src={note.src}
                      alt={note.title}
                      loading="lazy"
                      className="w-full max-h-[420px] object-contain mx-auto bn-ken-burns"
                    />

                    {/* Single Green Rectangular Selection Frame */}
                    <div
                      className="pointer-events-none absolute bottom-5 right-6 border-2 border-dashed border-[#22c55e] bg-emerald-500/10 rounded-xl bn-rect-marquee flex items-start justify-end p-1.5"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-[#22c55e] text-white text-[8.5px] font-extrabold shadow-xs">
                        ⬚ Ορθογώνια Επιλογή
                      </span>
                      <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white" />
                      <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white" />
                      <span className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white" />
                      <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white" />
                    </div>
                  </DraggableCard>
                </div>

                {/* Text & Interactive Features Side */}
                <div className="w-full lg:w-5/12 space-y-4">
                  <div className="inline-flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-white text-xs font-extrabold"
                      style={{ backgroundColor: note.subjectColor }}
                    >
                      0{index + 1} • {note.subjectBadge}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                      {note.formulaBadge}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
                    {note.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {note.description}
                  </p>

                  {/* Clean Callout Box */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Βασικές Έννοιες &amp; Εξισώσεις:
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-950">
                      ✨ {note.highlightText}
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      ✓ {note.secondaryHighlightText}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={onEnterApp}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0066ff] hover:bg-blue-600 text-white text-xs sm:text-sm font-extrabold shadow-md transition cursor-pointer"
                    >
                      <span>Άνοιγμα στον Καμβά</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomedNote(note)}
                      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition cursor-pointer"
                    >
                      <ZoomIn className="w-4 h-4 text-[#0066ff]" />
                      <span>Πλήρες Zoom</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* =====================================================================
          6. FULLSCREEN ZOOM LIGHTBOX MODAL (When clicking Zoom on any of the 5 Notes)
         ===================================================================== */}
      {zoomedNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-8"
          onClick={() => setZoomedNote(null)}
        >
          <div
            className="relative max-w-5xl w-full rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 overflow-hidden bn-tab-stage"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span
                  className="px-3 py-1 rounded-full text-white text-xs font-extrabold"
                  style={{ backgroundColor: zoomedNote.subjectColor }}
                >
                  {zoomedNote.subjectBadge}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {zoomedNote.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setZoomedNote(null);
                    onEnterApp();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0066ff] hover:bg-blue-600 text-white text-xs font-extrabold transition cursor-pointer"
                >
                  Άνοιγμα στην Εφαρμογή →
                </button>
                <button
                  type="button"
                  onClick={() => setZoomedNote(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  aria-label="Κλείσιμο Zoom"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-[#fffdf9] border border-slate-200 flex items-center justify-center">
              <img
                src={zoomedNote.src}
                alt={zoomedNote.title}
                className="max-h-[75vh] w-auto object-contain mx-auto bn-ken-burns"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
