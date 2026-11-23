import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  Crown,
  Check,
  Lock,
  Mail,
  Copy,
  CheckCircle2,
  LogIn,
  FileText,
  Layers,
  HardDrive,
  Wand2,
  Tags,
  Cloud,
} from 'lucide-react';
import {
  UPGRADE_CONTACT_EMAIL,
  GUEST_LIMITS,
  type SubscriptionPlan,
  type UpgradeModalContext,
  type UserAiUsage,
} from '../types';

export interface LiquidUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: UpgradeModalContext | null;
  plans: SubscriptionPlan[];
  currentPlan: SubscriptionPlan | null; // null = Guest
  isAuthenticated: boolean;
  aiUsage?: UserAiUsage;
  onSignInGoogle?: () => void;
}

function getReasonHeadline(ctx: UpgradeModalContext | null): {
  title: string;
  subtitle: string;
} {
  if (!ctx || ctx.reason === 'view_plans') {
    return {
      title: 'Πλάνα & Όρια ExplainBoards',
      subtitle: 'Δες τις δυνατότητες και τα όρια κάθε πλάνου και επικοινώνησε μαζί μας για αναβάθμιση.',
    };
  }
  switch (ctx.reason) {
    case 'ai_guest':
      return {
        title: `Το ${ctx.featureLabel || 'AI εργαλείο'} απαιτεί λογαριασμό`,
        subtitle:
          'Ως επισκέπτης μπορείς να δοκιμάσεις 1 προσωρινό αρχείο έως 3 σελίδες χωρίς κλήσεις AI και χωρίς αποθήκευση. Συνδέσου δωρεάν για να ξεκλειδώσεις AI & Cloud!',
      };
    case 'ai_daily':
      return {
        title: `Έφτασες το ημερήσιο όριο AI κλήσεων`,
        subtitle: `Για το ${ctx.featureLabel || 'AI εργαλείο'}: έχεις χρησιμοποιήσει ${ctx.currentValue || 'όλες τις διαθέσιμες κλήσεις'}. Το όριο ανανεώνεται αύριο ή με αναβάθμιση πλάνου.`,
      };
    case 'ai_weekly':
      return {
        title: `Έφτασες το εβδομαδιαίο όριο AI κλήσεων`,
        subtitle: `Για το ${ctx.featureLabel || 'AI εργαλείο'}: έχεις χρησιμοποιήσει ${ctx.currentValue || 'όλες τις εβδομαδιαίες κλήσεις'}. Αναβάθμισε το πλάνο σου για περισσότερες κλήσεις.`,
      };
    case 'auto_tags':
      return {
        title: 'Τα αυτόματα #tags (Auto-Tags) είναι διαθέσιμα στο ULTRA',
        subtitle:
          'Η αυτόματη ανάλυση χειρόγραφων και εικόνων για εξαγωγή #tags περιλαμβάνεται αποκλειστικά στο πλάνο ULTRA.',
      };
    case 'drive_sync':
      return {
        title: 'Ο συγχρονισμός Google Drive είναι διαθέσιμος σε PLUS & ULTRA',
        subtitle:
          'Η σύνδεση και ο αυτόματος συγχρονισμός σημειώσεων PDF με το Google Drive διατίθεται στα πλάνα PLUS και ULTRA (δεν περιλαμβάνεται σε Επισκέπτη ή FREE).',
      };
    case 'files':
      return {
        title: 'Έφτασες το όριο αρχείων του πλάνου σου',
        subtitle: `Τρέχουσα χρήση: ${ctx.currentValue || ''}. Διέγραψε κάποιο παλιό αρχείο ή αναβάθμισε το πλάνο σου για περισσότερα αρχεία.`,
      };
    case 'pages':
      return {
        title: 'Έφτασες το όριο σελίδων ανά δικό μας αρχείο',
        subtitle: `Τρέχουσα χρήση: ${ctx.currentValue || ''}. (Σημείωση: αρχεία PDF ανοίγουν κανονικά ανεξαρτήτως σελίδων, αρκεί να χωρούν στο όριο MB).`,
      };
    case 'storage':
      return {
        title: 'Έφτασες το όριο αποθηκευτικού χώρου',
        subtitle: `Ο απαιτούμενος χώρος (${ctx.currentValue || ''}) ξεπερνά το όριο του πλάνου σου (${ctx.limitValue || ''}).`,
      };
    case 'guest_save':
      return {
        title: 'Η αποθήκευση στο Cloud απαιτεί λογαριασμό',
        subtitle:
          'Ως επισκέπτης οι σημειώσεις σου διαγράφονται μόλις κλείσεις το αρχείο ή βγεις από την εφαρμογή. Συνδέσου δωρεάν για αποθήκευση!',
      };
    default:
      return {
        title: 'Όριο Πλάνου',
        subtitle: 'Επίλεξε ένα ανώτερο πλάνο για να συνεχίσεις χωρίς περιορισμούς.',
      };
  }
}

export const LiquidUpgradeModal: React.FC<LiquidUpgradeModalProps> = ({
  isOpen,
  onClose,
  context,
  plans,
  currentPlan,
  isAuthenticated,
  aiUsage,
  onSignInGoogle,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { title, subtitle } = getReasonHeadline(context);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(UPGRADE_CONTACT_EMAIL);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      // fallback
      setCopiedEmail(false);
    }
  };

  const mailtoSubject = encodeURIComponent(
    `Αίτημα Αλλαγής Πλάνου ExplainBoards (${currentPlan?.name || 'Επισκέπτης'})`
  );
  const mailtoBody = encodeURIComponent(
    `Γεια σας,\n\nΘα ήθελα να αναβαθμίσω τον λογαριασμό μου στο ExplainBoards.\nΤρέχον πλάνο: ${
      currentPlan?.name || 'Επισκέπτης'
    }\nΕπιθυμητό πλάνο: PLUS / ULTRA\n\nΕυχαριστώ!`
  );

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center p-3 sm:p-5 bg-slate-900/45 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto overscroll-contain ipados-liquid-glass bg-[#fdfbf7]/92 backdrop-blur-2xl backdrop-saturate-200 border border-white/90 rounded-3xl shadow-[0_28px_70px_-14px_rgba(15,23,42,0.35),inset_0_1px_1px_rgba(255,255,255,0.95)] ring-1 ring-black/5 p-5 sm:p-7 space-y-5 text-[#1b2a4a]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1b2a4a] to-[#3b5998] text-white flex items-center justify-center shadow-md shrink-0">
              {context?.reason === 'auto_tags' || context?.reason?.startsWith('ai_') ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <Crown className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#1b2a4a]">
                  {title}
                </h2>
                {currentPlan ? (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider text-white shadow-2xs"
                    style={{ backgroundColor: currentPlan.badgeColor || '#1b2a4a' }}
                  >
                    Τρέχον: {currentPlan.name}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                    Λειτουργία Επισκέπτη
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/80 hover:bg-rose-50 border border-[#dfd8cb] text-slate-500 hover:text-rose-600 transition cursor-pointer shrink-0"
            aria-label="Κλείσιμο"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live AI Usage Pill for signed-in non-unlimited users */}
        {isAuthenticated && currentPlan && !currentPlan.isUnlimited && aiUsage && (
          <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#eef3f8]/90 border border-[#1b2a4a]/15 text-xs">
            <Wand2 className="w-4 h-4 text-[#1b2a4a] shrink-0" />
            <span className="font-bold text-[#1b2a4a]">Χρήση AI ({currentPlan.name}):</span>
            <span className="px-2 py-0.5 rounded-lg bg-white border border-[#dfd8cb] font-extrabold tabular-nums">
              Σήμερα: {aiUsage.dayCount} /{' '}
              {currentPlan.aiCallsPerDay < 0 ? '∞' : currentPlan.aiCallsPerDay}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-white border border-[#dfd8cb] font-extrabold tabular-nums">
              Εβδομάδα: {aiUsage.weekCount} /{' '}
              {currentPlan.aiCallsPerWeek < 0 ? '∞' : currentPlan.aiCallsPerWeek}
            </span>
          </div>
        )}

        {/* Guest quick sign-in banner */}
        {!isAuthenticated && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#eef3f8] to-[#fdfbf7] border border-[#1b2a4a]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs space-y-0.5">
              <p className="font-extrabold text-[#1b2a4a]">
                Επισκέπτης: {GUEST_LIMITS.maxFiles} προσωρινό αρχείο • έως {GUEST_LIMITS.maxPagesPerNativeFile} σελίδες • 0 AI • χωρίς αποθήκευση
              </p>
              <p className="text-slate-600">
                Κάνε δωρεάν εγγραφή για να ξεκινήσεις αμέσως στο πλάνο <strong>FREE</strong> με Cloud αποθήκευση και AI κλήσεις!
              </p>
            </div>
            {onSignInGoogle && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignInGoogle();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-xs font-extrabold shadow-sm transition cursor-pointer shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Δωρεάν Σύνδεση με Google</span>
              </button>
            )}
          </div>
        )}

        {/* Plans Grid */}
        <div
          className={`grid grid-cols-1 gap-3.5 ${
            plans.length >= 3 ? 'md:grid-cols-3' : plans.length === 2 ? 'md:grid-cols-2' : ''
          }`}
        >
          {plans.map((plan) => {
            const isCurrent = Boolean(currentPlan && currentPlan.id === plan.id);
            const isUltra = plan.id === 'ultra' || Boolean(plan.isUnlimited);
            const isPlus = plan.id === 'plus';

            const filesLabel =
              plan.isUnlimited || plan.maxFiles < 0
                ? 'Απεριόριστα αρχεία'
                : `Έως ${plan.maxFiles} αρχεία`;

            const pagesLabel =
              plan.isUnlimited || plan.maxPagesPerNativeFile < 0
                ? 'Απεριόριστες σελίδες ανά αρχείο'
                : `Έως ${plan.maxPagesPerNativeFile} σελίδες / δικό μας αρχείο`;

            const storageLabel =
              plan.isUnlimited || plan.maxStorageMb < 0
                ? 'Απεριόριστος χώρος (Cloud & PDF)'
                : `Έως ${plan.maxStorageMb} MB χώρος (PDF εντός MB)`;

            const aiLabel =
              plan.isUnlimited || (plan.aiCallsPerDay < 0 && plan.aiCallsPerWeek < 0)
                ? 'Απεριόριστες AI κλήσεις'
                : `${plan.aiCallsPerDay < 0 ? '∞' : plan.aiCallsPerDay}/ημέρα ή ${
                    plan.aiCallsPerWeek < 0 ? '∞' : plan.aiCallsPerWeek
                  }/εβδομάδα`;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition border ${
                  isUltra
                    ? 'bg-gradient-to-b from-[#1b2a4a] to-[#263a66] text-white border-[#1b2a4a] shadow-lg'
                    : isPlus
                    ? 'bg-white/95 border-[#0284c7]/45 shadow-md ring-1 ring-[#0284c7]/15'
                    : 'bg-white/80 border-[#dfd8cb] shadow-xs'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-2xs"
                      style={{ backgroundColor: plan.badgeColor || '#1b2a4a' }}
                    >
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                          isUltra
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        Τρέχον Πλάνο
                      </span>
                    )}
                  </div>

                  {plan.description && (
                    <p
                      className={`text-[11.5px] leading-relaxed ${
                        isUltra ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {plan.description}
                    </p>
                  )}

                  <ul className="space-y-2 text-xs pt-1">
                    <li className="flex items-start gap-2">
                      <FileText
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isUltra ? 'text-sky-300' : 'text-[#1b2a4a]'
                        }`}
                      />
                      <span className="font-semibold">{filesLabel}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isUltra ? 'text-sky-300' : 'text-[#1b2a4a]'
                        }`}
                      />
                      <span className="font-semibold">{pagesLabel}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <HardDrive
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isUltra ? 'text-sky-300' : 'text-[#1b2a4a]'
                        }`}
                      />
                      <span className="font-semibold">{storageLabel}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isUltra ? 'text-amber-300' : 'text-indigo-600'
                        }`}
                      />
                      <span className="font-semibold">AI: {aiLabel}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      {plan.isUnlimited || plan.id !== 'free' ? (
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isUltra ? 'text-emerald-300' : 'text-emerald-600'
                          }`}
                        />
                      ) : (
                        <Lock className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      )}
                      <span
                        className={
                          plan.isUnlimited || plan.id !== 'free'
                            ? 'font-semibold'
                            : 'text-slate-400 line-through'
                        }
                      >
                        <Cloud className="w-3 h-3 inline mr-1 -mt-0.5" />
                        Google Drive Sync (PDF)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      {plan.allowAutoTags || plan.isUnlimited ? (
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isUltra ? 'text-emerald-300' : 'text-emerald-600'
                          }`}
                        />
                      ) : (
                        <Lock className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      )}
                      <span
                        className={
                          plan.allowAutoTags || plan.isUnlimited
                            ? 'font-semibold'
                            : 'text-slate-400 line-through'
                        }
                      >
                        <Tags className="w-3 h-3 inline mr-1 -mt-0.5" />
                        Αυτόματα #tags (Auto-Tags)
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-current/10 text-[10.5px] opacity-80 font-medium">
                  {isUltra
                    ? 'Πλήρης πρόσβαση χωρίς κανένα όριο.'
                    : 'Τα PDF ανοίγουν ανεξαρτήτως σελίδων εντός του ορίου MB.'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact & Upgrade Footer */}
        <div className="p-4 rounded-2xl bg-white/90 border border-[#dfd8cb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#eef3f8] border border-[#1b2a4a]/15 text-[#1b2a4a] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-extrabold text-[#1b2a4a]">
                Θέλεις αλλαγή ή αναβάθμιση πλάνου;
              </p>
              <p className="text-slate-600 mt-0.5">
                Επικοινώνησε μαζί μας στο{' '}
                <a
                  href={`mailto:${UPGRADE_CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`}
                  className="font-extrabold text-[#234978] underline decoration-[#234978]/40 hover:decoration-[#234978]"
                >
                  {UPGRADE_CONTACT_EMAIL}
                </a>{' '}
                για άμεση ενεργοποίηση.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void handleCopyEmail()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#efebe3] hover:bg-[#e5dfd3] text-[#1b2a4a] text-xs font-bold transition cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Αντιγράφηκε!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Αντιγραφή Email</span>
                </>
              )}
            </button>
            <a
              href={`mailto:${UPGRADE_CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-xs font-bold shadow-xs transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Αποστολή Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
