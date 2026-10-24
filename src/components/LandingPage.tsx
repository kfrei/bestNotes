import React, { useState, useEffect } from 'react';
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
  Cloud,
  FileText,
  FolderOpen,
  LogOut,
  User as UserIcon,
  X,
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
  | 'notebooks'
  | 'pdf'
  | 'whiteboard'
  | 'documents'
  | 'sine-3d'
  | 'layers-groups';

const SHOWCASE_TABS: { id: ShowcaseTabId; label: string; badge?: string }[] = [
  { id: 'whiteboard', label: 'Whiteboard' },
  { id: 'pdf', label: 'PDF Annotation' },
  { id: 'documents', label: 'Documents' },
  { id: 'notebooks', label: 'Notebooks' },
  { id: 'sine-3d', label: 'Ημίτονα & 3D Σχήματα', badge: 'PRO' },
  { id: 'layers-groups', label: 'Layers & Groups', badge: 'PRO' },
];

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
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0066ff] shadow-2xs">
            <Pen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              {mode === 'signin' ? 'Σύνδεση στο BestNotes' : 'Δημιουργία Λογαριασμού'}
            </h2>
            <p className="text-xs text-slate-500">
              Συγχρόνισε τα τετράδια και τα σχήματά σου παντού
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

        {/* Semantic HTML Form following modern-web-guidance autofill-sign-in-form & autofill-sign-up-form */}
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
  const [activeTab, setActiveTab] = useState<ShowcaseTabId>('notebooks');
  const [tabProgress, setTabProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-cycle through the 6 animated Goodnotes + BestNotes showcase tabs!
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
        return prev + 1.6;
      });
    }, 85);
    return () => window.clearInterval(interval);
  }, [isPaused]);

  const handleSelectTab = (id: ShowcaseTabId) => {
    setActiveTab(id);
    setTabProgress(0);
  };

  return (
    <div
      data-ui-panel="true"
      style={{ touchAction: 'pan-y' }}
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-white text-slate-900 select-none"
    >
      {/* Keyframe animations for live drawing, floating cards & interactive handles */}
      <style>{`
        @keyframes bnDrawStroke {
          0% { stroke-dashoffset: 600; }
          60%, 100% { stroke-dashoffset: 0; }
        }
        @keyframes bnFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes bnSineMorph {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.55); }
        }
        @keyframes bnPulseRing {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.18); opacity: 0.45; }
        }
        .bn-animate-draw {
          stroke-dasharray: 600;
          animation: bnDrawStroke 4.2s ease-in-out infinite;
        }
        .bn-animate-float {
          animation: bnFloatSlow 4.5s ease-in-out infinite;
        }
        .bn-animate-sine {
          transform-origin: center 135px;
          animation: bnSineMorph 3.2s ease-in-out infinite;
        }
      `}</style>

      {/* =====================================================================
          1. TOP NAVIGATION BAR (Authentic Goodnotes.com Minimalist Header)
         ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Left: BestNotes Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <div
              onClick={onEnterApp}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-[#0095ff] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                <Pen className="w-4 h-4 text-[#0095ff]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                BestNotes
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
              <button
                type="button"
                onClick={() => handleSelectTab('notebooks')}
                className="hover:text-[#0066ff] transition cursor-pointer"
              >
                Product ▾
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('sine-3d')}
                className="hover:text-[#0066ff] transition cursor-pointer"
              >
                3D & Μαθηματικά
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('layers-groups')}
                className="hover:text-[#0066ff] transition cursor-pointer"
              >
                Layers & Groups
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('pdf')}
                className="hover:text-[#0066ff] transition cursor-pointer"
              >
                PDF & AI
              </button>
            </nav>
          </div>

          {/* Right: Login + Cyan "Start Free / Έναρξη >" Pill + User Profile */}
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
                  className="p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Αποσύνδεση"
                >
                  <LogOut className="w-4 h-4" />
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
          2. HERO SECTION (Matches Goodnotes.com Layout & Cyan Start Free Button)
         ===================================================================== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight text-slate-950 leading-[1.12]">
            Take BestNotes wherever you work
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Η απόλυτη εμπειρία χειρόγραφων σημειώσεων, Φυσικής, 3D Σχημάτων &amp; Μαθηματικών
            <br className="hidden sm:inline" /> για επαγγελματίες, καθηγητές και μαθητές σε iPad &amp; Web
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
          </div>
        </div>

        {/* ===================================================================
            3. FOLDER-STYLE SHOWCASE TABS (4 Goodnotes Tabs + 2 Exclusive PRO Tabs!)
           =================================================================== */}
        <div
          className="mt-12 max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Folder Tab Headers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 px-2">
            {SHOWCASE_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`relative flex items-center justify-center gap-1.5 px-3 py-3.5 rounded-t-2xl text-xs sm:text-[13px] transition cursor-pointer overflow-hidden border border-b-0 ${
                    isSelected
                      ? 'bg-[#efefef] text-slate-950 font-bold border-slate-200 shadow-2xs'
                      : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200/80 font-medium'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#0066ff] text-white text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                      {tab.badge}
                    </span>
                  )}
                  {/* Animated bottom progress bar like Goodnotes.com */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-300/70">
                      <div
                        className="h-full bg-slate-900 transition-all duration-75"
                        style={{ width: `${tabProgress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Tablet / App Showcase Frame */}
          <div className="relative rounded-2xl rounded-tl-none bg-[#f5f6f8] border border-slate-200/90 shadow-2xl overflow-hidden min-h-[470px]">
            {/* Top Navy App Bar inside Preview */}
            <div className="bg-[#1e40af] text-white px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-4 h-4 text-sky-200" />
                <Search className="w-4 h-4 text-sky-200" />
                <span className="font-semibold text-sky-100 hidden sm:inline">
                  BestNotes — {SHOWCASE_TABS.find((t) => t.id === activeTab)?.label}
                </span>
              </div>

              {/* Simulated Toolbar Icons */}
              <div className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full">
                <Pen className="w-3.5 h-3.5 text-white" />
                <Eraser className="w-3.5 h-3.5 text-sky-200" />
                <Highlighter className="w-3.5 h-3.5 text-amber-300" />
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
            <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex items-center justify-center gap-3 text-[11px] text-slate-600">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0066ff] text-white font-semibold">
                ✏️ Pencil Only
              </span>
              <span className="h-3.5 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block" />
              </div>
              <span className="h-3.5 w-px bg-slate-200" />
              <span className="font-semibold text-slate-700">🎨 Γέμισμα (F)</span>
              <span className="font-semibold text-slate-700">─── Συνεχής / Διακεκομμένη</span>
            </div>

            {/* ===============================================================
                TAB 1: NOTEBOOKS (Matches Goodnotes.com Screenshot + Live Ink)
               =============================================================== */}
            {activeTab === 'notebooks' && (
              <div className="relative p-6 sm:p-8 flex justify-center">
                {/* Floating Search Card on Left (just like Goodnotes screenshot!) */}
                <div className="hidden md:block absolute left-6 top-16 w-60 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 p-3.5 z-20 bn-animate-float">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <span>Search</span>
                    <span className="text-slate-400">✕</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-blue-400 text-xs font-semibold text-slate-800 mb-2.5">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ταλάντωση</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pages</div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                    <div className="font-bold text-slate-800">Σελίδα 1</div>
                    <p className="mt-0.5 text-[10px] leading-snug">
                      ...απλή αρμονική <mark className="bg-amber-200 px-0.5 rounded">ταλάντωση</mark> x = A·ημ(ωt)...
                    </p>
                  </div>
                </div>

                {/* Center Paper Sheet */}
                <div
                  className="w-full max-w-lg rounded-xl bg-[#fffdf7] border border-slate-200 shadow-md p-6 min-h-[340px] relative"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(180,190,205,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(180,190,205,0.25) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                  }}
                >
                  <div className="text-sky-600 font-extrabold text-lg italic">
                    Φυσική Γ&apos; Λυκείου – Μηχανικές Ταλαντώσεις
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Η απομάκρυνση <span className="font-semibold text-slate-900">x(t)</span> στην απλή αρμονική ταλάντωση δίνεται από τη σχέση <span className="bg-yellow-200/80 px-1 rounded font-semibold">x = A · ημ(ωt + φ₀)</span> με σταθερό πλάτος A.
                  </p>

                  {/* Animated Handwriting & Sticky Notes */}
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <svg className="w-64 h-36 overflow-visible" viewBox="0 0 260 130">
                      <ellipse
                        cx="95"
                        cy="60"
                        rx="78"
                        ry="26"
                        fill="rgba(37, 99, 235, 0.08)"
                        stroke="#2563eb"
                        strokeWidth="2.4"
                        className="bn-animate-draw"
                      />
                      <text x="36" y="56" fill="#1e3a8a" fontSize="12" fontWeight="bold">
                        Ε = ½ D A² = σταθ.
                      </text>
                      <text x="42" y="74" fill="#334155" fontSize="11">
                        Διατήρηση Ενέργειας
                      </text>
                      <path
                        d="M 95 88 L 95 118 M 89 112 L 95 119 L 101 112"
                        stroke="#2563eb"
                        strokeWidth="2.2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="flex gap-2 shrink-0">
                      <div className="w-20 h-20 bg-pink-200/90 -rotate-3 rounded-md p-2 shadow-xs text-[10px] font-bold text-pink-950">
                        Πρόσεξε τη φάση φ₀ για t = 0!
                      </div>
                      <div className="w-20 h-20 bg-emerald-300/90 rotate-2 rounded-md p-2 shadow-xs text-[10px] font-bold text-emerald-950">
                        ω = 2π / T = √(D/m)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating AI / Math Card on Bottom Right (just like Goodnotes screenshot!) */}
                <div className="hidden md:block absolute right-6 bottom-8 w-64 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 p-4 z-20 bn-animate-float">
                  <div className="text-xs font-bold text-slate-800 leading-snug">
                    Επίλυση εξισώσεων &amp; αυτόματη αναγνώριση σχημάτων Φυσικής
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100 text-[#0066ff] text-[11px] font-bold">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Math Solver</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      LaTeX
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 2: ΗΜΙΤΟΝΑ & 3D ΣΧΗΜΑΤΑ (EXCLUSIVE BESTNOTES PRO TAB!)
               =============================================================== */}
            {activeTab === 'sine-3d' && (
              <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-6">
                {/* Left Card: Interactive 2-Node Sine Wave & 3-Node Hyperbola */}
                <div className="w-full lg:w-1/2 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-md p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#0066ff] uppercase tracking-wider">
                      〰️ Ημίτονο 2 Κόμβων &amp; ╰ Υπερβολή (y = c/x)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066ff] text-[10px] font-bold">
                      Αποκλειστικό BestNotes
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Τράβηξε τον κίτρινο κόμβο <b>↕ Κορυφή</b> μόνο πάνω/κάτω για το πλάτος και το <b>↔ Άκρο</b> μόνο αριστερά/δεξιά, ή σχεδίασε ασυμπτωτική <b>Υπερβολή</b> με τα κοίλα πάνω ή κάτω!
                  </p>

                  <svg className="w-full h-52 bg-white rounded-xl border border-slate-200/80" viewBox="0 0 420 200">
                    {/* Grid Axes */}
                    <line x1="25" y1="135" x2="255" y2="135" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1="35" y1="35" x2="35" y2="185" stroke="#94a3b8" strokeWidth="1.5" />

                    {/* Animated 2-Node Sine Wave */}
                    <g className="bn-animate-sine">
                      <path
                        d="M 35 135 C 62 45, 88 45, 115 135 C 142 225, 168 225, 195 135"
                        fill="none"
                        stroke="#0066ff"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Handle 0: Peak */}
                      <rect x="68" y="61" width="14" height="14" fill="#fef08a" stroke="#2563eb" strokeWidth="2.2" />
                      <text x="48" y="54" fill="#1e3a8a" fontSize="10" fontWeight="bold">
                        ↕ Κορυφή
                      </text>
                    </g>
                    {/* Handle 1: Right Endpoint */}
                    <rect x="188" y="128" width="14" height="14" fill="#ffffff" stroke="#2563eb" strokeWidth="2.2" />
                    <text x="206" y="139" fill="#1e3a8a" fontSize="10" fontWeight="bold">
                      ↔ Άκρο
                    </text>

                    {/* Right Side: Rectangular Hyperbola (y = c/x, P-V Isotherm) */}
                    <line x1="285" y1="25" x2="285" y2="175" stroke="#64748b" strokeWidth="1.5" />
                    <line x1="285" y1="175" x2="405" y2="175" stroke="#64748b" strokeWidth="1.5" />
                    <path
                      d="M 295 35 Q 302 158 395 166"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="bn-animate-draw"
                    />
                    <rect x="316" y="128" width="12" height="12" fill="#fef08a" stroke="#dc2626" strokeWidth="2" />
                    <text x="315" y="95" fill="#991b1b" fontSize="10" fontWeight="bold">
                      Υπερβολή P·V = σταθ.
                    </text>
                  </svg>
                </div>

                {/* Right Card: 3D Cuboid (-90°), 3D Sphere with Sine Wave inside, Cylinder, Resistor & Spring */}
                <div className="w-full lg:w-1/2 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-md p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                      📦 3D Σχήματα, Αντιστάτης &amp; Ελατήριο
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      1-Click Γέμισμα (F)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Έτοιμο 3D Παραλληλεπίπεδο, Σφαίρα (όπου μπορείς να σβήσεις εσωτερικό ημίτονο χωρίς να σβηστεί η σφαίρα!), Κύλινδρος, Πυραμίδα, Αντιστάτης και Ελατήριο.
                  </p>

                  <svg className="w-full h-52 bg-white rounded-xl border border-slate-200/80" viewBox="0 0 420 200">
                    {/* 1. 3D Cuboid (-90 deg orientation: Front + Top + Right faces) */}
                    <g transform="translate(22, 26)">
                      <polygon points="0,24 68,24 68,92 0,92" fill="rgba(220,38,38,0.16)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <polygon points="0,24 20,0 88,0 68,24" fill="rgba(220,38,38,0.10)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <polygon points="68,24 88,0 88,68 68,92" fill="rgba(220,38,38,0.28)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <text x="8" y="112" fill="#991b1b" fontSize="10" fontWeight="bold">3D Κυβόλιθος</text>
                    </g>

                    {/* 2. 3D Sphere with inner Sine Wave */}
                    <g transform="translate(150, 22)">
                      <circle cx="52" cy="52" r="46" fill="rgba(37,99,235,0.14)" stroke="#2563eb" strokeWidth="2.4" />
                      <path d="M 6 52 A 46 16 0 0 0 98 52" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
                      {/* Inner Sine Wave */}
                      <path d="M 20 52 C 36 22, 46 22, 52 52 C 58 82, 68 82, 84 52" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                      <text x="14" y="116" fill="#1e3a8a" fontSize="10" fontWeight="bold">3D Σφαίρα + Κύμα</text>
                    </g>

                    {/* 3. 3D Cylinder */}
                    <g transform="translate(285, 22)">
                      <path d="M 10 18 L 10 86 A 38 12 0 0 0 86 86 L 86 18" fill="rgba(147,51,234,0.16)" stroke="#9333ea" strokeWidth="2.3" />
                      <ellipse cx="48" cy="18" rx="38" ry="12" fill="rgba(147,51,234,0.26)" stroke="#9333ea" strokeWidth="2.3" />
                      <ellipse cx="48" cy="86" rx="38" ry="12" fill="none" stroke="#9333ea" strokeWidth="2" strokeDasharray="4 3" />
                      <text x="12" y="116" fill="#6b21a8" fontSize="10" fontWeight="bold">3D Κύλινδρος</text>
                    </g>

                    {/* 4. Physics Resistor & Spring at bottom */}
                    <path
                      d="M 25 168 L 55 168 L 63 154 L 77 182 L 91 154 L 105 182 L 119 154 L 133 182 L 141 168 L 170 168"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="178" y="172" fill="#334155" fontSize="10" fontWeight="bold">⚡ Αντιστάτης R</text>
                  </svg>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 3: LAYERS & GROUPS (EXCLUSIVE BESTNOTES PRO TAB!)
               =============================================================== */}
            {activeTab === 'layers-groups' && (
              <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-6">
                {/* Left: Interactive Multi-Layer Stack Preview */}
                <div className="w-full lg:w-5/12 rounded-2xl bg-white border border-slate-200 shadow-lg p-4">
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#0066ff]" />
                      <span className="text-xs font-extrabold text-slate-900">
                        Διαχείριση Ενθέτων (Layers)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[#0066ff] text-[10px] font-bold">
                      + Νέο Layer
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-[#0066ff] text-xs">
                      <div className="flex items-center gap-2 font-bold text-[#1b2a4a]">
                        <GripVertical className="w-4 h-4 text-[#0066ff]" />
                        <span>1. Λύση &amp; Πράξεις (8)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Eye className="w-3.5 h-3.5 text-[#0066ff]" />
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <GripVertical className="w-4 h-4 text-slate-400" />
                        <span>2. Σχήμα Εκφώνησης (Κλειδωμένο)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs opacity-60">
                      <div className="flex items-center gap-2 font-semibold text-slate-500">
                        <GripVertical className="w-4 h-4 text-slate-400" />
                        <span>3. Εναλλακτική Μεθοδολογία (Κρυφό)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                    Κλείδωσε το σχήμα της άσκησης σε ξεχωριστό Layer ώστε η σβήστρα να σβήνει <b>μόνο τις πράξεις σου</b>, ή κρύψε τη λύση κατά την παράδοση του μαθήματος!
                  </p>
                </div>

                {/* Right: Lasso Grouping, Z-Order & Personal Shape Library */}
                <div className="w-full lg:w-7/12 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-lg p-5">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <span className="text-xs font-extrabold text-slate-900">
                      🪢 Lasso Groups, Z-Order &amp; Βιβλιοθήκη Σχημάτων
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Αντίγραφο
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                        <Plus className="w-3 h-3" /> (+) Βιβλιοθήκη
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        ⏬ Πίσω | -1 | +1 | ⏫ Μπροστά
                      </span>
                    </div>
                  </div>

                  <div className="relative h-48 rounded-xl bg-white border border-slate-200 p-4 flex items-center justify-around">
                    {/* Grouped Inclined Plane Diagram with Oriented Blue Lasso Box */}
                    <div className="relative p-4 border-2 border-dashed border-[#0066ff] rounded-xl bg-sky-50/30">
                      {/* Rotation Badge */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#0066ff] flex items-center justify-center text-[10px] font-bold text-[#0066ff]">
                        ↻
                      </div>
                      {/* Corner & Mid-side handles */}
                      <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-[#0066ff] border border-white" />
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#0066ff] border border-white" />
                      <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-[#0066ff] border border-white" />
                      <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#0066ff] border border-white" />
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#f97316] border border-white" />
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#f97316] border border-white" />

                      <svg className="w-44 h-28" viewBox="0 0 180 110">
                        <polygon points="15,95 165,95 15,25" fill="rgba(148,163,184,0.2)" stroke="#334155" strokeWidth="2.2" />
                        <rect x="62" y="34" width="32" height="22" transform="rotate(25 78 45)" fill="rgba(37,99,235,0.22)" stroke="#2563eb" strokeWidth="2.2" />
                        <line x1="78" y1="48" x2="122" y2="68" stroke="#dc2626" strokeWidth="2.4" />
                        <polygon points="122,68 113,60 116,70" fill="#dc2626" />
                        <text x="125" y="68" fill="#dc2626" fontSize="11" fontWeight="bold">F</text>
                      </svg>
                    </div>

                    {/* Saved Library Cards Preview */}
                    <div className="hidden sm:flex flex-col gap-2 w-44">
                      <div className="text-[11px] font-bold text-emerald-800">📚 Αποθηκευμένα Σχήματα:</div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                        <span>📐 Κεκλιμένο Επίπεδο</span>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                        <span>🔋 Κύκλωμα R-L-C</span>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 4: PDF ANNOTATION
               =============================================================== */}
            {activeTab === 'pdf' && (
              <div className="p-6 sm:p-8 flex justify-center">
                <div className="w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-md p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Πανελλαδικές_Φυσική_Θέμα_Δ.pdf — Άμεση Σημείωση πάνω σε PDF &amp; Εικόνες
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      2x Retina PDF Engine
                    </span>
                  </div>
                  <div className="space-y-3 text-xs text-slate-700">
                    <p className="leading-relaxed">
                      <b>ΘΕΜΑ Δ:</b> Σφαίρα μάζας <mark className="bg-yellow-200 px-1 rounded">m = 2 kg</mark> εκτελεί κύλιση χωρίς ολίσθηση σε οριζόντιο επίπεδο με ταχύτητα κέντρου μάζας <mark className="bg-emerald-200 px-1 rounded">υ_cm = 4 m/s</mark>.
                    </p>
                    <div className="p-4 rounded-xl bg-[#fffdf7] border border-slate-200 font-semibold text-[#0066ff] flex items-center justify-between">
                      <span>✍️ K_ολ = ½ m υ_cm² + ½ I_cm ω² = 7/10 m υ_cm² = 22.4 J</span>
                      <span className="text-emerald-600 font-bold">✓ Σωστό!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 5: WHITEBOARD
               =============================================================== */}
            {activeTab === 'whiteboard' && (
              <div className="p-6 sm:p-8 flex justify-center">
                <div className="w-full max-w-2xl rounded-xl bg-[#fffdf7] border border-slate-200 shadow-md p-6 flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Διαδραστικός Πίνακας Παράδοσης Μαθήματος + 🔴 Laser Pointer (Πλήκτρο L)
                  </div>
                  <svg className="w-full h-48" viewBox="0 0 500 170">
                    <rect x="20" y="55" width="120" height="54" rx="12" fill="#eff6ff" stroke="#2563eb" strokeWidth="2.2" />
                    <text x="42" y="86" fill="#1e3a8a" fontSize="12" fontWeight="bold">Νόμος Gauss</text>

                    <path d="M 140 82 L 195 82" stroke="#2563eb" strokeWidth="2.2" />
                    <rect x="195" y="55" width="130" height="54" rx="12" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2.2" />
                    <text x="215" y="86" fill="#14532d" fontSize="12" fontWeight="bold">Φ = Q_εσ / ε₀</text>

                    <path d="M 325 82 L 375 82" stroke="#16a34a" strokeWidth="2.2" />
                    <rect x="375" y="55" width="105" height="54" rx="12" fill="#fef2f2" stroke="#dc2626" strokeWidth="2.2" />
                    <text x="392" y="86" fill="#991b1b" fontSize="12" fontWeight="bold">Πεδίο Σφαίρας</text>

                    {/* Animated Red Laser Trail */}
                    <circle cx="428" cy="82" r="38" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.75" className="bn-animate-draw" />
                  </svg>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 6: DOCUMENTS
               =============================================================== */}
            {activeTab === 'documents' && (
              <div className="p-6 sm:p-8 flex justify-center">
                <div className="w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold text-slate-800">
                      📚 Πολλαπλά Ανοιχτά Τετράδια (Chrome-Style Tabs) &amp; Cloud Sync
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-[#0066ff] text-[11px] font-bold">
                      <Cloud className="w-3.5 h-3.5" /> Auto-Sync 30s
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { title: 'Ηλεκτρομαγνητισμός', color: '#2563eb', pages: '12 σελίδες' },
                      { title: 'Μηχανική Στερεού', color: '#7c3aed', pages: '8 σελίδες' },
                      { title: 'Κβαντομηχανική', color: '#059669', pages: '15 σελίδες' },
                    ].map((doc) => (
                      <div
                        key={doc.title}
                        onClick={onEnterApp}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition cursor-pointer flex items-center gap-3"
                      >
                        <div
                          className="w-8 h-10 rounded-md shrink-0 shadow-2xs"
                          style={{ backgroundColor: doc.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{doc.title}</div>
                          <div className="text-[10px] text-slate-500">{doc.pages}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
