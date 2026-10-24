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
  | 'whiteboard'
  | 'pdf'
  | 'documents'
  | 'notebooks'
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

/* ============================================================================
   REUSABLE ANIMATED PEN & HIGHLIGHTER SVG TOOLS (Authentic Goodnotes Motion)
   ============================================================================ */
const AnimatedPenTool: React.FC<{
  className?: string;
  color?: string;
  label?: string;
}> = ({ className = '', color = '#2563eb', label }) => (
  <div className={`pointer-events-none select-none z-30 ${className}`}>
    <svg width="88" height="88" viewBox="0 0 88 88" className="drop-shadow-xl overflow-visible">
      <g transform="rotate(-38 44 44)">
        {/* Stylus Body */}
        <rect x="38" y="14" width="12" height="54" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Color Grip Band */}
        <rect x="38" y="48" width="12" height="11" fill={color} />
        {/* Cone Tip */}
        <polygon points="38,68 50,68 44,82" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        {/* Colored Nib */}
        <polygon points="41.5,76 46.5,76 44,83" fill={color} />
        {/* Glowing Ink Pulse at Tip */}
        <circle cx="44" cy="83" r="3.5" fill={color} opacity="0.45" />
      </g>
    </svg>
    {label && (
      <span
        className=" -mt-3 ml-8 inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    )}
  </div>
);

const AnimatedHighlighterTool: React.FC<{
  className?: string;
  color?: string;
}> = ({ className = '', color = '#facc15' }) => (
  <div className={`pointer-events-none select-none z-30 ${className}`}>
    <svg width="92" height="92" viewBox="0 0 92 92" className="drop-shadow-xl overflow-visible">
      <g transform="rotate(-28 46 46)">
        {/* Highlighter Barrel */}
        <rect x="36" y="12" width="18" height="52" rx="6" fill="#fef9c3" stroke="#eab308" strokeWidth="1.6" />
        <rect x="36" y="46" width="18" height="14" fill={color} />
        {/* Chisel Tip */}
        <polygon points="38,64 52,64 50,79 36,75" fill={color} stroke="#ca8a04" strokeWidth="1" />
      </g>
    </svg>
  </div>
);

/* ============================================================================
   SCIENCE & ANATOMY SKETCH ILLUSTRATIONS (Replacing Goodnotes Chair Sketches)
   ============================================================================ */
const HumanSkeletonSketch: React.FC<{ className?: string }> = ({ className = 'w-36 h-44' }) => (
  <svg className={className} viewBox="0 0 150 190" fill="none">
    {/* Cranium / Skull */}
    <circle cx="75" cy="26" r="16" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.2" />
    <rect x="68" y="38" width="14" height="8" rx="2" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
    {/* Eye sockets */}
    <circle cx="69" cy="25" r="3.2" fill="#1e293b" />
    <circle cx="81" cy="25" r="3.2" fill="#1e293b" />
    <path d="M 71 42 L 79 42" stroke="#1e293b" strokeWidth="1.5" />
    {/* Cervical & Thoracic Spine */}
    <line x1="75" y1="46" x2="75" y2="122" stroke="#1e293b" strokeWidth="3" strokeDasharray="4 2" />
    {/* Clavicles (Collarbone) */}
    <path d="M 42 56 Q 75 50 108 56" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" />
    {/* Ribcage (Thorax) */}
    <ellipse cx="75" cy="72" rx="24" ry="8" stroke="#1e293b" strokeWidth="2" />
    <ellipse cx="75" cy="84" rx="26" ry="8.5" stroke="#1e293b" strokeWidth="2" />
    <ellipse cx="75" cy="96" rx="22" ry="7.5" stroke="#1e293b" strokeWidth="2" />
    <ellipse cx="75" cy="107" rx="17" ry="6" stroke="#1e293b" strokeWidth="1.8" />
    {/* Sternum */}
    <line x1="75" y1="56" x2="75" y2="104" stroke="#0284c7" strokeWidth="3.2" strokeLinecap="round" />
    {/* Left & Right Humerus + Radius/Ulna */}
    <line x1="42" y1="56" x2="28" y2="95" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="28" y1="95" x2="22" y2="128" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <line x1="108" y1="56" x2="122" y2="95" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="122" y1="95" x2="128" y2="128" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Pelvis */}
    <path
      d="M 54 122 C 48 118, 46 138, 63 140 L 75 134 L 87 140 C 104 138, 102 118, 96 122 Z"
      fill="rgba(14,165,233,0.12)"
      stroke="#1e293b"
      strokeWidth="2.2"
    />
    {/* Femurs */}
    <line x1="62" y1="140" x2="57" y2="180" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="88" y1="140" x2="93" y2="180" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
    {/* Anatomical callout labels */}
    <circle cx="99" cy="72" r="3" fill="#ef4444" />
    <line x1="99" y1="72" x2="132" y2="66" stroke="#ef4444" strokeWidth="1.4" />
    <text x="112" y="62" fill="#dc2626" fontSize="8.5" fontWeight="bold">Θώρακας</text>
    <circle cx="57" cy="160" r="3" fill="#2563eb" />
    <line x1="57" y1="160" x2="18" y2="164" stroke="#2563eb" strokeWidth="1.4" />
    <text x="6" y="159" fill="#1d4ed8" fontSize="8.5" fontWeight="bold">Μηριαίο</text>
  </svg>
);

const PulleySystemSketch: React.FC<{ className?: string }> = ({ className = 'w-44 h-40' }) => (
  <svg className={className} viewBox="0 0 190 165" fill="none">
    {/* Ceiling Support Hatching */}
    <line x1="20" y1="14" x2="165" y2="14" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    <path d="M 30 14 L 38 4 M 50 14 L 58 4 M 70 14 L 78 4 M 90 14 L 98 4 M 110 14 L 118 4 M 130 14 L 138 4 M 150 14 L 158 4" stroke="#64748b" strokeWidth="1.5" />
    {/* Fixed Pulley mount */}
    <line x1="65" y1="14" x2="65" y2="42" stroke="#334155" strokeWidth="2.8" />
    <circle cx="65" cy="42" r="18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
    <circle cx="65" cy="42" r="4" fill="#0f172a" />
    {/* Movable Pulley */}
    <circle cx="115" cy="88" r="18" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
    <circle cx="115" cy="88" r="4" fill="#0f172a" />
    {/* Ceiling anchor for right rope */}
    <line x1="133" y1="14" x2="133" y2="88" stroke="#1e293b" strokeWidth="2.2" />
    {/* Rope from Fixed Pulley to Movable Pulley */}
    <line x1="83" y1="42" x2="97" y2="88" stroke="#1e293b" strokeWidth="2.2" />
    {/* Rope on Left going down to Force / Mass m1 */}
    <line x1="47" y1="42" x2="47" y2="112" stroke="#1e293b" strokeWidth="2.2" />
    {/* Block m1 */}
    <rect x="31" y="112" width="32" height="26" rx="4" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2.2" />
    <text x="39" y="129" fill="#1e3a8a" fontSize="10" fontWeight="bold">m₁</text>
    {/* Hanging Block m2 from Movable Pulley */}
    <line x1="115" y1="88" x2="115" y2="122" stroke="#334155" strokeWidth="2.5" />
    <rect x="95" y="122" width="40" height="30" rx="5" fill="#dcfce7" stroke="#15803d" strokeWidth="2.2" />
    <text x="107" y="141" fill="#14532d" fontSize="10.5" fontWeight="bold">m₂</text>
    {/* Force Vectors */}
    <path d="M 47 36 L 47 19" stroke="#dc2626" strokeWidth="2.2" />
    <polygon points="47,16 43,23 51,23" fill="#dc2626" />
    <text x="20" y="30" fill="#dc2626" fontSize="10" fontWeight="bold">T = F</text>
    <text x="140" y="62" fill="#0369a1" fontSize="10" fontWeight="bold">F = m₂g / 2</text>
  </svg>
);

const ChemistryFlasksSketch: React.FC<{ className?: string }> = ({ className = 'w-44 h-40' }) => (
  <svg className={className} viewBox="0 0 190 160" fill="none">
    {/* 1. Erlenmeyer Conical Flask */}
    <path
      d="M 45 24 L 45 52 L 20 126 C 17 134 22 140 31 140 L 83 140 C 92 140 97 134 94 126 L 69 52 L 69 24"
      fill="#ffffff"
      stroke="#0f172a"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <ellipse cx="57" cy="24" rx="14" ry="3.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.2" />
    {/* Green/Cyan Liquid inside Erlenmeyer */}
    <path
      d="M 31 96 Q 45 91 57 96 T 83 96 L 93 125 C 95 132 90 137 82 137 L 32 137 C 24 137 19 132 21 125 Z"
      fill="rgba(16, 185, 129, 0.32)"
      stroke="#059669"
      strokeWidth="1.8"
    />
    {/* Rising Bubbles */}
    <circle cx="48" cy="118" r="3.5" fill="#10b981" />
    <circle cx="62" cy="108" r="2.8" fill="#10b981" />
    <circle cx="55" cy="82" r="3" fill="#10b981" />
    <circle cx="59" cy="66" r="2.2" fill="#10b981" />

    {/* 2. Round-Bottom Volumetric Flask */}
    <path d="M 132 20 L 132 58" stroke="#0f172a" strokeWidth="2.3" />
    <path d="M 146 20 L 146 58" stroke="#0f172a" strokeWidth="2.3" />
    <ellipse cx="139" cy="20" rx="9" ry="2.8" stroke="#0f172a" strokeWidth="2" />
    <circle cx="139" cy="98" r="36" fill="#ffffff" stroke="#0f172a" strokeWidth="2.4" />
    {/* Violet/Pink Titration Liquid */}
    <path
      d="M 105 102 Q 122 96 139 102 T 173 102 A 34 34 0 0 1 105 102 Z"
      fill="rgba(236, 72, 153, 0.30)"
      stroke="#db2777"
      strokeWidth="1.8"
    />
    <text x="116" y="122" fill="#9d174d" fontSize="9.5" fontWeight="bold">pH = 8.4</text>
    <text x="26" y="154" fill="#065f46" fontSize="9.5" fontWeight="bold">ΔH &lt; 0 (Εξώθερμη)</text>
  </svg>
);

const BiologyFloraFaunaSketch: React.FC<{ className?: string }> = ({ className = 'w-44 h-40' }) => (
  <svg className={className} viewBox="0 0 190 155" fill="none">
    {/* Botanical Leaf with Veins (Photosynthesis) */}
    <path
      d="M 22 122 C 20 68, 62 26, 114 24 C 112 78, 76 122, 22 122 Z"
      fill="rgba(34, 197, 94, 0.22)"
      stroke="#15803d"
      strokeWidth="2.4"
    />
    {/* Central Midrib & Lateral Veins */}
    <path d="M 16 128 Q 64 76 114 24" stroke="#15803d" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M 48 92 L 36 68 M 66 74 L 52 46 M 84 56 L 74 34 M 54 86 L 82 96 M 72 68 L 98 74" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" />
    {/* Animal / Plant Cell Organelle Cutout on Right */}
    <ellipse cx="144" cy="98" rx="34" ry="26" fill="rgba(56, 189, 248, 0.16)" stroke="#0284c7" strokeWidth="2.2" />
    <circle cx="136" cy="96" r="9" fill="rgba(147, 51, 234, 0.28)" stroke="#7e22ce" strokeWidth="2" />
    <ellipse cx="158" cy="102" rx="7" ry="4" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
    <text x="16" y="24" fill="#15803d" fontSize="10" fontWeight="bold">🌿 6CO₂ + 6H₂O → C₆H₁₂O₆</text>
    <text x="112" y="138" fill="#0369a1" fontSize="9.5" fontWeight="bold">Κύτταρο &amp; Πυρήνας</text>
  </svg>
);

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
  const [activeTab, setActiveTab] = useState<ShowcaseTabId>('whiteboard');
  const [tabProgress, setTabProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-cycle through the 6 animated Goodnotes + BestNotes PRO showcase tabs!
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
        return prev + 1.35;
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
      {/* Keyframe animations for Goodnotes-style moving pens, sweeping highlighters, floating cards & live 3D/Sine morphing */}
      <style>{`
        @keyframes bnDrawStroke {
          0% { stroke-dashoffset: 650; }
          55%, 100% { stroke-dashoffset: 0; }
        }
        @keyframes bnHighlightSweep {
          0%, 10% { transform: scaleX(0); opacity: 0.25; }
          45%, 100% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes bnPenMoveOrbit {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(68px, -18px) rotate(4deg); }
          50% { transform: translate(115px, 14px) rotate(-5deg); }
          75% { transform: translate(38px, 24px) rotate(3deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes bnHighlighterGlide {
          0%, 10% { transform: translateX(0px) translateY(0px) rotate(0deg); }
          45%, 85% { transform: translateX(155px) translateY(-2px) rotate(-3deg); }
          100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
        }
        @keyframes bnFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes bnFloatDelayed {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes bnSineMorph {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.52); }
        }
        @keyframes bnLassoPulse {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-2.5deg) scale(1.03); }
        }
        .bn-animate-draw {
          stroke-dasharray: 650;
          animation: bnDrawStroke 4.2s ease-in-out infinite;
        }
        .bn-animate-highlight {
          transform-origin: left center;
          animation: bnHighlightSweep 4.2s ease-in-out infinite;
        }
        .bn-animate-pen {
          animation: bnPenMoveOrbit 4.2s ease-in-out infinite;
        }
        .bn-animate-highlighter {
          animation: bnHighlighterGlide 4.2s ease-in-out infinite;
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
                onClick={() => handleSelectTab('whiteboard')}
                className="hover:text-[#0066ff] transition cursor-pointer"
              >
                Whiteboard
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('pdf')}
                className="hover:text-[#0066ff] transition cursor-pointer"
              >
                PDF &amp; Σημειώσεις
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('sine-3d')}
                className="hover:text-[#0066ff] transition cursor-pointer"
              >
                3D &amp; Μαθηματικά
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('layers-groups')}
                className="hover:text-[#0066ff] transition cursor-pointer"
              >
                Layers &amp; Groups
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
          2. HERO SECTION (Goodnotes.com Layout + 4 Goodnotes Tabs + 2 PRO Tabs)
         ===================================================================== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-11 pb-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight text-slate-950 leading-[1.12]">
            Take BestNotes wherever you work
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Σημειώσεις, Σκελετός Βιολογίας, Τροχαλίες Φυσικής, Χημεία, Ημίτονα &amp; 3D Σχήματα
            <br className="hidden sm:inline" /> με φυσική κίνηση στυλό και υπογραμμιστηρίου σε iPad &amp; Web
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
            3. FOLDER-STYLE SHOWCASE TABS (4 Goodnotes 1:1 Tabs + 2 PRO Tabs!)
           =================================================================== */}
        <div
          className="mt-11 max-w-5xl mx-auto"
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

          {/* Interactive Tablet / App Showcase Frame (Taller & More Impressive) */}
          <div className="relative rounded-3xl rounded-tl-none bg-[#f2f4f7] border border-slate-200/90 shadow-2xl overflow-hidden min-h-[560px]">
            {/* Top Goodnotes-style App Header inside Preview */}
            <div className="bg-[#1e40af] text-white px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-4 h-4 text-sky-200" />
                <Search className="w-4 h-4 text-sky-200" />
                <span className="font-semibold text-sky-100 hidden sm:inline">
                  BestNotes — {SHOWCASE_TABS.find((t) => t.id === activeTab)?.label}
                </span>
              </div>

              {/* Simulated Goodnotes / BestNotes Toolbar Icons */}
              <div className="flex items-center gap-2.5 bg-white/15 px-3.5 py-1 rounded-full">
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
            <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex items-center justify-center gap-3 text-[11px] text-slate-600 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0066ff] text-white font-semibold">
                ✏️ Pencil Only
              </span>
              <span className="h-3.5 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block" />
              </div>
              <span className="h-3.5 w-px bg-slate-200" />
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                Χωρίς Γέμισμα
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                90%
              </span>
            </div>

            {/* ===============================================================
                TAB 1: WHITEBOARD (1:1 Goodnotes Infinite Canvas Structure,
                replacing Chairs with Human Skeleton, Pulleys, Chemistry Flasks
                & Plants/Cells + Moving Pen & Highlighter!)
               =============================================================== */}
            {activeTab === 'whiteboard' && (
              <div
                className="relative p-6 sm:p-8 min-h-[485px] flex items-center justify-center overflow-hidden"
                style={{
                  backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.45) 1.3px, transparent 1.3px)',
                  backgroundSize: '20px 20px',
                  backgroundColor: '#fcfbf7',
                }}
              >
                {/* TOP-LEFT FLOATING POLAROID CARD (Goodnotes 1:1 position: Human Skeleton instead of Chair) */}
                <div className="hidden md:block absolute left-5 top-6 w-52 rounded-2xl bg-white shadow-xl border border-slate-200 p-3 -rotate-2 z-20 bn-animate-float">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-700 mb-1">
                    <span>🦴 Ανθρώπινος Σκελετός</span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-50 text-[#0066ff]">Ανατομία</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center py-1">
                    <HumanSkeletonSketch className="w-32 h-36" />
                  </div>
                  <div className="mt-1.5 text-[10px] font-semibold text-slate-500 text-center">
                    206 Οστά • Κρανίο, Θώρακας &amp; Μηριαίο
                  </div>
                </div>

                {/* BOTTOM-LEFT STICKY NOTE & FLORA/CELL CARD (Goodnotes 1:1 position) */}
                <div className="hidden md:block absolute left-7 bottom-6 w-52 rounded-2xl bg-[#fef08a] shadow-lg border border-amber-300 p-3.5 rotate-2 z-20 bn-animate-float-delayed">
                  <div className="text-[11px] font-extrabold text-amber-950 mb-1">
                    🌿 Βιολογία – Φυτά &amp; Κύτταρα
                  </div>
                  <BiologyFloraFaunaSketch className="w-44 h-28" />
                </div>

                {/* CENTER INFINITE WHITEBOARD DIAGRAM CLUSTER (Mindmap + Pulleys + Chemistry + Moving Tools) */}
                <div className="relative w-full max-w-xl rounded-2xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-xl p-5 z-10">
                  {/* Animated Highlighter sweeping across title */}
                  <div className="relative inline-block mb-3">
                    <span className="relative z-10 text-sm sm:text-base font-extrabold text-slate-900 px-1">
                      Διαδραστικός Πίνακας Φυσικής, Χημείας &amp; Βιολογίας
                    </span>
                    <span className="absolute inset-0 bg-yellow-300/75 rounded-md bn-animate-highlight -z-0" />
                    <AnimatedHighlighterTool className="hidden sm:block absolute -top-12 left-8 bn-animate-highlighter" />
                  </div>

                  {/* Two Side-by-Side Sketch Areas (Pulleys + Chemistry Flasks) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* Left Sketch Box: Pulleys (Τροχαλίες) */}
                    <div className="relative rounded-xl bg-[#fffdf7] border border-slate-200 p-3 flex flex-col items-center">
                      <div className="text-[11px] font-bold text-sky-800 mb-1">
                        ⚙️ Σύστημα Σταθερής &amp; Κινητής Τροχαλίας
                      </div>
                      <PulleySystemSketch className="w-44 h-36" />
                      {/* Hand-drawn Blue Circle being sketched live by the Moving Pen */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 220 180">
                        <ellipse
                          cx="126"
                          cy="95"
                          rx="42"
                          ry="26"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                          strokeDasharray="5 3"
                          className="bn-animate-draw"
                        />
                      </svg>
                    </div>

                    {/* Right Sketch Box: Chemistry Flasks (Μπουκαλάκια Χημείας) */}
                    <div className="relative rounded-xl bg-[#fffdf7] border border-slate-200 p-3 flex flex-col items-center">
                      <div className="text-[11px] font-bold text-emerald-800 mb-1">
                        🧪 Κωνικές Φιάλες &amp; Ογκομέτρηση
                      </div>
                      <ChemistryFlasksSketch className="w-44 h-36" />
                    </div>
                  </div>

                  {/* Animated Fountain Pen moving across the mindmap */}
                  <AnimatedPenTool
                    className="hidden sm:block absolute bottom-8 left-28 bn-animate-pen"
                    color="#2563eb"
                    label="Apple Pencil"
                  />

                  {/* Bottom Mind-Map Flow Nodes */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] font-bold flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      Μηχανικό Πλεονέκτημα: F = mg / 2
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Εξώθερμη Αντίδραση ΔH &lt; 0
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      🔴 Laser Pointer (L)
                    </span>
                  </div>
                </div>

                {/* RIGHT FLOATING COLLABORATOR / MINDMAP STICKY CARDS (Goodnotes 1:1 position) */}
                <div className="hidden lg:flex flex-col gap-3 absolute right-5 top-8 w-52 z-20">
                  <div className="rounded-2xl bg-pink-200/95 border border-pink-300 p-3 shadow-lg rotate-2 bn-animate-float">
                    <div className="text-[11px] font-extrabold text-pink-950">
                      📌 Σημείωση Εργαστηρίου
                    </div>
                    <p className="mt-1 text-[10px] font-semibold text-pink-900 leading-snug">
                      Στην κινητή τροχαλία η δύναμη F υποδιπλασιάζεται (F = Β/2), ενώ το σχοινί μετατοπίζεται κατά 2h!
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-xl -rotate-1 bn-animate-float-delayed">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ζωντανή Συνεργασία</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-600 leading-snug">
                      Σχεδίασε σκελετούς, τροχαλίες, φιάλες χημείας και εξισώσεις σε άπειρο καμβά!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 2: PDF ANNOTATION (1:1 Goodnotes Academic PDF Layout with
                Left Page Thumbnails, 2-Column Biomechanics/Chemistry/Pulley PDF,
                Moving Highlighter & Fountain Pen + Floating Right Study Card!)
               =============================================================== */}
            {activeTab === 'pdf' && (
              <div className="relative p-6 sm:p-8 min-h-[485px] flex items-center justify-center bg-[#eef1f6]">
                {/* LEFT FLOATING PDF THUMBNAILS SIDEBAR (1:1 Goodnotes PDF Tab) */}
                <div className="hidden lg:flex flex-col gap-2.5 absolute left-6 top-8 w-36 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 p-3 z-20">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Σελίδες PDF (3)
                  </div>
                  {[
                    { page: 1, title: '1. Σκελετός & Μοχλοί', active: true },
                    { page: 2, title: '2. Τροχαλίες & Έργο', active: false },
                    { page: 3, title: '3. Διαλύματα Χημείας', active: false },
                  ].map((item) => (
                    <div
                      key={item.page}
                      className={`p-2 rounded-xl border text-[10px] font-bold transition ${
                        item.active
                          ? 'bg-sky-50 border-[#0066ff] text-[#0066ff]'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="h-10 rounded bg-white border border-slate-200 mb-1 flex items-center justify-center text-[9px] text-slate-400">
                        Σελ. {item.page}
                      </div>
                      <div className="truncate">{item.title}</div>
                    </div>
                  ))}
                </div>

                {/* CENTER ACADEMIC PDF SHEET (2-Column Textbook with Skeleton, Pulleys & Chemistry) */}
                <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 z-10">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-extrabold text-slate-900">
                        Βιομηχανική_Σκελετού_Τροχαλίες_Χημεία.pdf
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Σελίδα 1 από 12 • Retina PDF
                    </span>
                  </div>

                  {/* Two-Column PDF Body */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-slate-700">
                    {/* Column 1: Human Skeleton & Lever/Pulley Biomechanics */}
                    <div className="space-y-2.5">
                      <div className="font-extrabold text-slate-900 text-[13px]">
                        §1.2 Ο Ανθρώπινος Σκελετός ως Σύστημα Μοχλών &amp; Τροχαλιών
                      </div>
                      <p className="leading-relaxed text-[11px]">
                        Κατά την κάμψη του πήχη, ο δικέφαλος βραχιόνιος μυς ασκεί δύναμη{' '}
                        <span className="relative inline-block font-bold text-slate-950 px-1">
                          <span className="relative z-10">F_μυός = 6 · Β_βάρους</span>
                          <span className="absolute inset-0 bg-yellow-300/85 rounded bn-animate-highlight -z-0" />
                        </span>{' '}
                        ώστε να ισορροπήσει η ροπή γύρω από την άρθρωση του αγκώνα:
                      </p>

                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-around">
                        <HumanSkeletonSketch className="w-24 h-32" />
                        <PulleySystemSketch className="w-28 h-28" />
                      </div>

                      {/* Animated Highlighter Tool gliding over the PDF highlight */}
                      <AnimatedHighlighterTool className="hidden sm:block absolute top-14 left-36 bn-animate-highlighter" />
                    </div>

                    {/* Column 2: Chemistry Flasks + Red Ink Margin Notes */}
                    <div className="space-y-2.5">
                      <div className="font-extrabold text-slate-900 text-[13px]">
                        §1.3 Χημική Ενέργεια (ATP) &amp; Ογκομέτρηση Διαλυμάτων
                      </div>
                      <p className="leading-relaxed text-[11px]">
                        Στην κωνική φιάλη Erlenmeyer η υδρόλυση του{' '}
                        <mark className="bg-emerald-200 px-1 rounded font-bold">ATP → ADP + P_i</mark>{' '}
                        απελευθερώνει την απαραίτητη ενέργεια για τη μυϊκή συστολή και την ανύψωση του φορτίου από την τροχαλία.
                      </p>

                      <div className="relative rounded-xl bg-[#fffdf7] border border-slate-200 p-2 flex flex-col items-center">
                        <ChemistryFlasksSketch className="w-36 h-28" />
                        {/* Hand-drawn Red Margin Annotation Circle & Formula */}
                        <svg className="w-full h-12 overflow-visible" viewBox="0 0 220 42">
                          <path
                            d="M 10 22 Q 55 6 108 20 T 205 18"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="2.2"
                            className="bn-animate-draw"
                          />
                          <text x="16" y="37" fill="#dc2626" fontSize="10.5" fontWeight="bold">
                            ✍️ ΣM = 0 ⇒ F₁ · d₁ = F₂ · d₂ (Σωστό!)
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Animated Fountain Pen writing the red margin note */}
                  <AnimatedPenTool
                    className="hidden sm:block absolute bottom-6 right-24 bn-animate-pen"
                    color="#dc2626"
                    label="Σημείωση PDF"
                  />
                </div>

                {/* RIGHT FLOATING STUDY /GOOGLE DRIVE SYNC CARD (1:1 Goodnotes position) */}
                <div className="hidden lg:block absolute right-5 bottom-8 w-56 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 p-3.5 z-20 bn-animate-float">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0066ff]">
                    <Sparkles className="w-4 h-4" />
                    <span>Αυτόματος Συγχρονισμός PDF</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-600 leading-snug">
                    Κάθε υπογράμμιση και σχήμα αποθηκεύεται αυτόματα στο <b>Google Drive (/BestNotes)</b> στο ίδιο όνομα αρχείου PDF!
                  </p>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 3: DOCUMENTS (1:1 Goodnotes Mixed-Media Document Layout,
                replacing the 4 Chair Cards with 4 Science Specimen Cards:
                1. Ανθρώπινος Σκελετός, 2. Τροχαλίες, 3. Μπουκαλάκια Χημείας,
                4. Φυτά & Κύτταρα Βιολογίας + Moving Pen & Lasso!)
               =============================================================== */}
            {activeTab === 'documents' && (
              <div className="relative p-6 sm:p-8 min-h-[485px] flex items-center justify-center bg-[#f4f5f8]">
                {/* Floating Left Goodnotes-style Document Outline Pill */}
                <div className="hidden lg:block absolute left-6 top-10 w-52 rounded-2xl bg-white/95 shadow-xl border border-slate-200 p-3.5 z-20 bn-animate-float">
                  <div className="text-[11px] font-extrabold text-slate-800 mb-2">
                    📑 Δομή Εργαστηριακής Αναφοράς
                  </div>
                  <div className="space-y-1.5 text-[10.5px] font-semibold text-slate-600">
                    <div className="p-1.5 rounded-lg bg-sky-50 text-[#0066ff] font-bold">
                      1. Σκελετός &amp; Ανατομία
                    </div>
                    <div className="p-1.5 rounded-lg hover:bg-slate-50">
                      2. Τροχαλίες &amp; Μηχανική
                    </div>
                    <div className="p-1.5 rounded-lg hover:bg-slate-50">
                      3. Φιάλες Χημείας &amp; Οξέα
                    </div>
                    <div className="p-1.5 rounded-lg hover:bg-slate-50">
                      4. Φυτά, Ζώα &amp; Κύτταρα
                    </div>
                  </div>
                </div>

                {/* CENTER MIXED-MEDIA DOCUMENT PAGE (1:1 Goodnotes Documents Tab Structure) */}
                <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 z-10">
                  {/* Document Title & AI Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 mb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0066ff]">
                        Σημειώσεις Εργαστηρίου • Συνδυασμός Κειμένου, Εικόνων &amp; Σκίτσων
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Άτλας Θετικών Επιστημών: Βιολογία, Φυσική &amp; Χημεία
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-bold">
                      <Sparkles className="w-3.5 h-3.5" /> Smart Layout
                    </span>
                  </div>

                  {/* 4 Science Specimen Cards (Replacing the 4 Chair Cards in Goodnotes' Documents Tab!) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1: Human Skeleton */}
                    <div className="rounded-xl bg-[#fffdf7] border border-slate-200 p-2.5 flex flex-col items-center shadow-2xs">
                      <HumanSkeletonSketch className="w-24 h-28" />
                      <span className="mt-1 text-[10.5px] font-extrabold text-slate-800 text-center">
                        1. Σκελετός Βιολογίας
                      </span>
                      <span className="text-[9.5px] text-slate-500">Οστά &amp; Αρθρώσεις</span>
                    </div>

                    {/* Card 2: Pulleys (Selected with Blue Lasso Handles just like Goodnotes!) */}
                    <div className="relative rounded-xl bg-sky-50/40 border-2 border-dashed border-[#0066ff] p-2.5 flex flex-col items-center shadow-sm bn-animate-lasso">
                      <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 rounded-full bg-[#0066ff]" />
                      <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#0066ff]" />
                      <span className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 rounded-full bg-[#0066ff]" />
                      <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#0066ff]" />
                      <PulleySystemSketch className="w-24 h-28" />
                      <span className="mt-1 text-[10.5px] font-extrabold text-[#0066ff] text-center">
                        2. Τροχαλίες Φυσικής
                      </span>
                      <span className="text-[9.5px] text-sky-700 font-semibold">F = mg / 2</span>
                    </div>

                    {/* Card 3: Chemistry Flasks */}
                    <div className="rounded-xl bg-[#fffdf7] border border-slate-200 p-2.5 flex flex-col items-center shadow-2xs">
                      <ChemistryFlasksSketch className="w-24 h-28" />
                      <span className="mt-1 text-[10.5px] font-extrabold text-slate-800 text-center">
                        3. Φιάλες Χημείας
                      </span>
                      <span className="text-[9.5px] text-slate-500">Erlenmeyer &amp; pH</span>
                    </div>

                    {/* Card 4: Plants & Cells */}
                    <div className="rounded-xl bg-[#fffdf7] border border-slate-200 p-2.5 flex flex-col items-center shadow-2xs">
                      <BiologyFloraFaunaSketch className="w-24 h-28" />
                      <span className="mt-1 text-[10.5px] font-extrabold text-slate-800 text-center">
                        4. Φυτά &amp; Κύτταρα
                      </span>
                      <span className="text-[9.5px] text-slate-500">Φωτοσύνθεση</span>
                    </div>
                  </div>

                  {/* Typed + Highlighted Summary Block below the 4 cards */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-[11px] text-slate-700 leading-relaxed relative">
                    <b>Συμπέρασμα Εργαστηρίου:</b> Συνδυάζοντας τις{' '}
                    <span className="relative inline-block font-bold text-slate-900 px-1">
                      <span className="relative z-10">τροχαλίες (F = mg/2) με τους μοχλούς του ανθρώπινου σκελετού</span>
                      <span className="absolute inset-0 bg-yellow-300/80 rounded bn-animate-highlight -z-0" />
                    </span>{' '}
                    και τις χημικές αντιδράσεις στις κωνικές φιάλες, μελετάμε πλήρως τη μετατροπή ενέργειας.
                  </div>

                  {/* Moving Pen & Highlighter over Document */}
                  <AnimatedPenTool
                    className="hidden sm:block absolute top-28 right-12 bn-animate-pen"
                    color="#7c3aed"
                    label="Lasso & Σκίτσο"
                  />
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 4: NOTEBOOKS (1:1 Goodnotes Notebook Layout with Left Search
                Popup, Grid Paper with Skeleton/Pulley/Chemistry Sketches,
                Moving Pen & Highlighter, Sticky Notes & Bottom-Right AI Card!)
               =============================================================== */}
            {activeTab === 'notebooks' && (
              <div className="relative p-6 sm:p-8 min-h-[485px] flex items-center justify-center">
                {/* FLOATING SEARCH WINDOW ON LEFT (1:1 Goodnotes Notebooks Screenshot!) */}
                <div className="hidden md:block absolute left-6 top-12 w-60 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 p-3.5 z-20 bn-animate-float">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <span>Search Σημειώσεων</span>
                    <span className="text-slate-400">✕</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-blue-400 text-xs font-semibold text-slate-800 mb-2.5">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span>Τροχαλία &amp; Σκελετός</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Αποτελέσματα (Σελίδες)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800">Σελίδα 1 — Μηχανική &amp; Βιολογία</div>
                    <p className="text-[10px] leading-snug">
                      ...σύστημα <mark className="bg-amber-200 px-0.5 rounded">τροχαλίας</mark>, φιάλη χημείας και οστά <mark className="bg-amber-200 px-0.5 rounded">σκελετού</mark>...
                    </p>
                  </div>
                </div>

                {/* CENTER GRID NOTEBOOK PAGE (1:1 Goodnotes Notebook Page + Moving Pen & Highlighter) */}
                <div
                  className="w-full max-w-xl rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-xl p-6 min-h-[410px] relative z-10"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(180,190,205,0.26) 1px, transparent 1px), linear-gradient(to bottom, rgba(180,190,205,0.26) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sky-700 font-extrabold text-lg italic">
                      Σημειώσεις: Τροχαλίες, Χημεία &amp; Βιολογία
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                      Σελίδα 1 / 4
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                    Συνδυασμός <span className="font-bold text-slate-900">μηχανικής τροχαλιών</span>,{' '}
                    <span className="relative inline-block font-bold text-slate-900 px-1">
                      <span className="relative z-10">κωνικής φιάλης χημείας και ανατομίας σκελετού</span>
                      <span className="absolute inset-0 bg-yellow-300/85 rounded bn-animate-highlight -z-0" />
                    </span>{' '}
                    με αυτόματη αναγνώριση σχημάτων (Hold-to-Snap).
                  </p>

                  {/* Animated Highlighter gliding across the notebook line */}
                  <AnimatedHighlighterTool className="hidden sm:block absolute top-10 right-24 bn-animate-highlighter" />

                  {/* Sketches Row inside Notebook: Pulley + Chemistry Flask + Skeleton/Flora */}
                  <div className="mt-4 grid grid-cols-3 gap-2 items-center bg-white/80 rounded-xl p-2.5 border border-slate-200/80">
                    <div className="flex flex-col items-center">
                      <PulleySystemSketch className="w-28 h-28" />
                      <span className="text-[9.5px] font-bold text-sky-800">Τροχαλία F=mg/2</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <ChemistryFlasksSketch className="w-28 h-28" />
                      <span className="text-[9.5px] font-bold text-emerald-800">Φιάλες Χημείας</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <HumanSkeletonSketch className="w-24 h-28" />
                      <span className="text-[9.5px] font-bold text-slate-800">Σκελετός &amp; Οστά</span>
                    </div>
                  </div>

                  {/* Animated Handwriting Equation + Sticky Notes at Bottom */}
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <svg className="w-60 h-24 overflow-visible" viewBox="0 0 250 95">
                      <ellipse
                        cx="102"
                        cy="46"
                        rx="88"
                        ry="28"
                        fill="rgba(37, 99, 235, 0.08)"
                        stroke="#2563eb"
                        strokeWidth="2.4"
                        className="bn-animate-draw"
                      />
                      <text x="32" y="43" fill="#1e3a8a" fontSize="11.5" fontWeight="bold">
                        Ε_ολ = Κ + U = ½ D A²
                      </text>
                      <text x="36" y="61" fill="#047857" fontSize="10.5" fontWeight="bold">
                        F_τροχαλίας = m · g / 2
                      </text>
                    </svg>

                    <div className="flex gap-2 shrink-0">
                      <div className="w-24 h-20 bg-pink-200/95 -rotate-3 rounded-lg p-2 shadow-sm text-[10px] font-bold text-pink-950">
                        🧪 Έλεγξε το pH στην κωνική φιάλη!
                      </div>
                      <div className="w-24 h-20 bg-emerald-300/95 rotate-2 rounded-lg p-2 shadow-sm text-[10px] font-bold text-emerald-950">
                        🦴 Αρθρώσεις = Μοχλοί 3ου είδους
                      </div>
                    </div>
                  </div>

                  {/* Moving Pen sketching the equation oval */}
                  <AnimatedPenTool
                    className="hidden sm:block absolute bottom-6 left-36 bn-animate-pen"
                    color="#2563eb"
                    label="Hold-to-Snap"
                  />
                </div>

                {/* FLOATING AI / SCIENCE CARD ON BOTTOM RIGHT (1:1 Goodnotes Screenshot!) */}
                <div className="hidden md:block absolute right-6 bottom-8 w-64 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 p-4 z-20 bn-animate-float">
                  <div className="text-xs font-extrabold text-slate-800 leading-snug">
                    Επίλυση εξισώσεων &amp; αυτόματο γέμισμα σε σχήματα με κράτημα μολυβιού
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100 text-[#0066ff] text-[11px] font-bold">
                      <Sparkles className="w-3 h-3" />
                      <span>Smart Shapes</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      Google Drive PDF
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 5 (PRO #1): ΗΜΙΤΟΝΑ & 3D ΣΧΗΜΑΤΑ (Enhanced & Taller PRO Tab!)
               =============================================================== */}
            {activeTab === 'sine-3d' && (
              <div className="p-6 sm:p-8 min-h-[485px] flex flex-col lg:flex-row items-stretch justify-center gap-6">
                {/* Left Card: Interactive 2-Node Sine Wave & 3-Node Hyperbola */}
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
                      Τράβηξε τον κίτρινο κόμβο <b>↕ Κορυφή</b> μόνο πάνω/κάτω για το πλάτος και το <b>↔ Άκρο</b> μόνο αριστερά/δεξιά, ή σχεδίασε ασυμπτωτική <b>Υπερβολή (P·V = σταθ.)</b> με τα κοίλα πάνω ή κάτω!
                    </p>
                  </div>

                  <svg className="w-full h-60 bg-white rounded-xl border border-slate-200/80 shadow-inner" viewBox="0 0 420 215">
                    {/* Grid Axes */}
                    <line x1="25" y1="135" x2="255" y2="135" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1="35" y1="25" x2="35" y2="195" stroke="#94a3b8" strokeWidth="1.5" />

                    {/* Animated 2-Node Sine Wave */}
                    <g className="bn-animate-sine">
                      <path
                        d="M 35 135 C 62 42, 88 42, 115 135 C 142 228, 168 228, 195 135"
                        fill="rgba(0, 102, 255, 0.08)"
                        stroke="#0066ff"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />
                      {/* Handle 0: Peak */}
                      <rect x="68" y="59" width="14" height="14" fill="#fef08a" stroke="#2563eb" strokeWidth="2.2" />
                      <text x="46" y="51" fill="#1e3a8a" fontSize="10" fontWeight="bold">
                        ↕ Κορυφή (Πλάτος A)
                      </text>
                    </g>
                    {/* Handle 1: Right Endpoint */}
                    <rect x="188" y="128" width="14" height="14" fill="#ffffff" stroke="#2563eb" strokeWidth="2.2" />
                    <text x="205" y="139" fill="#1e3a8a" fontSize="10" fontWeight="bold">
                      ↔ Άκρο (λ)
                    </text>

                    {/* Right Side: Rectangular Hyperbola (y = c/x, P-V Isotherm) */}
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

                {/* Right Card: 3D Cuboid, 3D Sphere + Sine, 3D Cylinder, Pyramid, Pulley, Flask, Resistor & Spring */}
                <div className="w-full lg:w-1/2 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-lg p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                        📦 3D Στερεά, Τροχαλίες, Αντιστάτης &amp; Ελατήριο
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                        1-Click Γέμισμα (F)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Έτοιμο 3D Παραλληλεπίπεδο, 3D Σφαίρα (όπου σβήνεις εσωτερικό ημίτονο χωρίς να σβηστεί η σφαίρα!), Κύλινδρος, Πυραμίδα, Αντιστάτης και Ελατήριο.
                    </p>
                  </div>

                  <svg className="w-full h-60 bg-white rounded-xl border border-slate-200/80 shadow-inner" viewBox="0 0 420 215">
                    {/* 1. 3D Cuboid (-90 deg orientation: Front + Top + Right faces) */}
                    <g transform="translate(18, 20)">
                      <polygon points="0,24 64,24 64,88 0,88" fill="rgba(220,38,38,0.16)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <polygon points="0,24 20,0 84,0 64,24" fill="rgba(220,38,38,0.10)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <polygon points="64,24 84,0 84,64 64,88" fill="rgba(220,38,38,0.28)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <text x="4" y="106" fill="#991b1b" fontSize="9.5" fontWeight="bold">3D Κυβόλιθος</text>
                    </g>

                    {/* 2. 3D Sphere with inner Sine Wave */}
                    <g transform="translate(125, 18)">
                      <circle cx="46" cy="46" r="42" fill="rgba(37,99,235,0.14)" stroke="#2563eb" strokeWidth="2.4" />
                      <path d="M 4 46 A 42 14 0 0 0 88 46" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
                      <path d="M 16 46 C 30 18, 40 18, 46 46 C 52 74, 62 74, 76 46" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                      <text x="6" y="108" fill="#1e3a8a" fontSize="9.5" fontWeight="bold">3D Σφαίρα + Κύμα</text>
                    </g>

                    {/* 3. 3D Cylinder */}
                    <g transform="translate(236, 18)">
                      <path d="M 8 16 L 8 80 A 34 11 0 0 0 76 80 L 76 16" fill="rgba(147,51,234,0.16)" stroke="#9333ea" strokeWidth="2.3" />
                      <ellipse cx="42" cy="16" rx="34" ry="11" fill="rgba(147,51,234,0.26)" stroke="#9333ea" strokeWidth="2.3" />
                      <ellipse cx="42" cy="80" rx="34" ry="11" fill="none" stroke="#9333ea" strokeWidth="2" strokeDasharray="4 3" />
                      <text x="6" y="108" fill="#6b21a8" fontSize="9.5" fontWeight="bold">3D Κύλινδρος</text>
                    </g>

                    {/* 4. 3D Pyramid */}
                    <g transform="translate(330, 18)">
                      <polygon points="38,4 6,78 52,88" fill="rgba(234,179,8,0.20)" stroke="#ca8a04" strokeWidth="2.2" strokeLinejoin="round" />
                      <polygon points="38,4 52,88 76,68" fill="rgba(234,179,8,0.34)" stroke="#ca8a04" strokeWidth="2.2" strokeLinejoin="round" />
                      <line x1="6" y1="78" x2="76" y2="68" stroke="#ca8a04" strokeWidth="1.6" strokeDasharray="3 3" />
                      <text x="8" y="108" fill="#854d0e" fontSize="9.5" fontWeight="bold">3D Πυραμίδα</text>
                    </g>

                    {/* 5. Physics Resistor & Spring at bottom */}
                    <path
                      d="M 20 172 L 48 172 L 56 156 L 70 188 L 84 156 L 98 188 L 112 156 L 126 188 L 134 172 L 162 172"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="48" y="204" fill="#334155" fontSize="9.5" fontWeight="bold">⚡ Αντιστάτης R</text>

                    {/* 6. Coiled Physics Spring */}
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
                TAB 6 (PRO #2): LAYERS & GROUPS (Enhanced & Taller PRO Tab!)
               =============================================================== */}
            {activeTab === 'layers-groups' && (
              <div className="p-6 sm:p-8 min-h-[485px] flex flex-col lg:flex-row items-stretch justify-center gap-6">
                {/* Left: Interactive Multi-Layer Stack Preview */}
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
                          <span>1. Λύση, Δυνάμεις &amp; Πράξεις (12)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Eye className="w-3.5 h-3.5 text-[#0066ff]" />
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-300 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <GripVertical className="w-4 h-4 text-amber-600" />
                          <span>2. Σκελετός / Τροχαλίες (Κλειδωμένο)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-slate-700" />
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs opacity-65">
                        <div className="flex items-center gap-2 font-semibold text-slate-500">
                          <GripVertical className="w-4 h-4 text-slate-400" />
                          <span>3. Εναλλακτική Λύση (Κρυφό Layer)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                    💡 <b>Για Καθηγητές &amp; Μαθητές:</b> Κλείδωσε το σχήμα της άσκησης (τροχαλία, κεκλιμένο επίπεδο ή σκελετό) στο Layer 2 ώστε η σβήστρα να σβήνει <b>μόνο τις πράξεις σου</b> στο Layer 1!
                  </div>
                </div>

                {/* Right: Lasso Grouping, Z-Order & Personal Shape Library */}
                <div className="w-full lg:w-7/12 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-lg p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <span className="text-xs font-extrabold text-slate-900">
                        🪢 Lasso Groups, Z-Order &amp; Βιβλιοθήκη Σχημάτων
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap">
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

                    <div className="relative h-60 rounded-xl bg-white border border-slate-200 p-4 flex items-center justify-around">
                      {/* Grouped Inclined Plane + Pulley Diagram with Oriented Blue Lasso Box */}
                      <div className="relative p-4 border-2 border-dashed border-[#0066ff] rounded-xl bg-sky-50/30 bn-animate-lasso">
                        {/* Rotation Badge */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#0066ff] flex items-center justify-center text-[10px] font-bold text-[#0066ff]">
                          ↻
                        </div>
                        {/* 4 Blue Corner Handles + 4 Orange Mid-Side Stretch Handles */}
                        <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-[#0066ff] border border-white" />
                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#0066ff] border border-white" />
                        <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-[#0066ff] border border-white" />
                        <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#0066ff] border border-white" />
                        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#f97316] border border-white" />
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#f97316] border border-white" />
                        <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f97316] border border-white" />
                        <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f97316] border border-white" />

                        <svg className="w-48 h-36" viewBox="0 0 195 130">
                          {/* Inclined Plane */}
                          <polygon points="15,110 165,110 15,32" fill="rgba(148,163,184,0.22)" stroke="#334155" strokeWidth="2.3" />
                          {/* Top Pulley at apex */}
                          <circle cx="15" cy="22" r="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="2.2" />
                          {/* Sliding Block */}
                          <rect x="66" y="42" width="34" height="24" transform="rotate(27 83 54)" fill="rgba(37,99,235,0.24)" stroke="#2563eb" strokeWidth="2.2" />
                          {/* Rope from Pulley to Block */}
                          <line x1="22" y1="16" x2="72" y2="42" stroke="#0f172a" strokeWidth="2" />
                          {/* Force Vector F */}
                          <line x1="86" y1="56" x2="132" y2="80" stroke="#dc2626" strokeWidth="2.5" />
                          <polygon points="132,80 122,71 125,81" fill="#dc2626" />
                          <text x="136" y="80" fill="#dc2626" fontSize="11" fontWeight="bold">mg·ημθ</text>
                        </svg>
                      </div>

                      {/* Saved Library Cards Preview */}
                      <div className="hidden sm:flex flex-col gap-2 w-48">
                        <div className="text-[11px] font-extrabold text-emerald-800">
                          📚 Προσωπική Βιβλιοθήκη:
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                          <span>📐 Κεκλιμένο + Τροχαλία</span>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                          <span>🦴 Άρθρωση Αγκώνα</span>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                          <span>🧪 Κωνική Φιάλη Χημείας</span>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>🔵 Γωνίες = Αναλογικό Μέγεθος</span>
                    <span className="text-orange-600">🟠 Πλευρές = Ελεύθερη Παραμόρφωση</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            4. EXTENDED BELOW-THE-FOLD SHOWCASE SECTION (Scroll Down for More
               Animated Diagrams: Skeleton/Biology, Pulleys/Physics & Chemistry!)
           =================================================================== */}
        <section className="mt-20 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0066ff] text-xs font-extrabold uppercase tracking-wider">
              Σχεδιασμένο για Επιστήμες &amp; Εκπαίδευση
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Ζωντανά Σχήματα Βιολογίας, Φυσικής, Χημείας &amp; 3D Γεωμετρίας
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Κράτησε πατημένο το μολύβι στο τέλος της γραμμής για αυτόματο σχήμα με γέμισμα χρώματος, ή χρησιμοποίησε τα εξειδικευμένα εργαλεία 2D/3D.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Showcase Card 1: Biology (Human Skeleton, Plants & Cells) */}
            <div
              onClick={onEnterApp}
              className="group rounded-3xl bg-[#fffdf7] border border-slate-200 p-6 shadow-md hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-extrabold">
                    🦴 Βιολογία &amp; Ανατομία
                  </span>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#0066ff] transition">
                    Δοκίμασέ το →
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Ανθρώπινος Σκελετός, Φυτά &amp; Κύτταρα
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Σημείωσε πάνω σε διαγράμματα σκελετού, οστών, κυττάρων και φωτοσύνθεσης με ανεξάρτητα Layers και υπογραμμιστήρια.
                </p>
              </div>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200/80 p-3 flex items-center justify-around">
                <HumanSkeletonSketch className="w-28 h-36" />
                <BiologyFloraFaunaSketch className="w-32 h-32" />
              </div>
            </div>

            {/* Showcase Card 2: Physics (Pulleys, Springs, Sine Waves & 3D) */}
            <div
              onClick={onEnterApp}
              className="group rounded-3xl bg-[#fffdf7] border border-slate-200 p-6 shadow-md hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-[#0066ff] text-xs font-extrabold">
                    ⚙️ Φυσική &amp; Μηχανική
                  </span>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#0066ff] transition">
                    Δοκίμασέ το →
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Τροχαλίες, Ημίτονα 2 Κόμβων &amp; Ελατήρια
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Σχεδίασε σταθερές και κινητές τροχαλίες, κεκλιμένα επίπεδα, αντιστάτες, ελατήρια και ημιτονοειδή κύματα σε δευτερόλεπτα.
                </p>
              </div>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200/80 p-3 flex items-center justify-center">
                <PulleySystemSketch className="w-48 h-36" />
              </div>
            </div>

            {/* Showcase Card 3: Chemistry & Google Drive PDF Sync */}
            <div
              onClick={onEnterApp}
              className="group rounded-3xl bg-[#fffdf7] border border-slate-200 p-6 shadow-md hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                    🧪 Χημεία &amp; Google Drive PDF
                  </span>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#0066ff] transition">
                    Δοκίμασέ το →
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Φιάλες Χημείας, Ισόθερμες &amp; Cloud PDF
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Σχεδίασε κωνικές φιάλες Erlenmeyer, υπερβολές P·V = σταθ. και συγχρόνισε αυτόματα τις σημειώσεις σου σε PDF στο Google Drive!
                </p>
              </div>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200/80 p-3 flex items-center justify-center">
                <ChemistryFlasksSketch className="w-48 h-36" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
