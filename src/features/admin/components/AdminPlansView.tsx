import React, { useState } from 'react';
import {
  Crown,
  Plus,
  Save,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  X,
  Users,
  Cpu,
} from 'lucide-react';
import {
  AI_TOKEN_FEATURES_CATALOG,
  GUEST_LIMITS,
  type SubscriptionPlan,
} from '../../plans/types';
import type { UserProfileStats } from '../types';
import { ADMIN_EMAIL } from '../services/userStatsService';

export interface AdminPlansViewProps {
  plans: SubscriptionPlan[];
  users: UserProfileStats[];
  isLoading?: boolean;
  onSavePlan: (plan: SubscriptionPlan) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
  onRefresh: () => void;
}

const BADGE_COLOR_PRESETS = [
  { label: 'Slate', hex: '#64748b' },
  { label: 'Sky', hex: '#0284c7' },
  { label: 'Violet', hex: '#7c3aed' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Amber', hex: '#d97706' },
  { label: 'Rose', hex: '#e11d48' },
  { label: 'Navy', hex: '#1b2a4a' },
];

export const AdminPlansView: React.FC<AdminPlansViewProps> = ({
  plans,
  users,
  isLoading,
  onSavePlan,
  onDeletePlan,
  onRefresh,
}) => {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const countUsersOnPlan = (planId: string): number => {
    return users.filter((u) => {
      const effectiveId =
        u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
          ? 'ultra'
          : (u.planId || 'free').toLowerCase();
      return effectiveId === planId.toLowerCase();
    }).length;
  };

  const openCreateNew = () => {
    setFeedback(null);
    setIsCreatingNew(true);
    setEditingPlan({
      id: '',
      name: '',
      description: '',
      badgeColor: '#059669',
      order: plans.length,
      isBuiltIn: false,
      isUnlimited: false,
      maxFiles: 30,
      maxPagesPerNativeFile: 15,
      maxStorageMb: 25,
      aiCallsPerDay: 10,
      aiCallsPerWeek: 50,
      allowAutoTags: false,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setFeedback(null);

    const slug = (
      isCreatingNew
        ? editingPlan.id || editingPlan.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : editingPlan.id
    )
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

    if (!slug) {
      setFeedback({ type: 'err', text: 'Συμπλήρωσε έγκυρο ID/όνομα πλάνου (λατινικοί χαρακτήρες).' });
      return;
    }
    if (!editingPlan.name.trim()) {
      setFeedback({ type: 'err', text: 'Συμπλήρωσε το όνομα εμφάνισης του πλάνου.' });
      return;
    }
    if (isCreatingNew && plans.some((p) => p.id.toLowerCase() === slug)) {
      setFeedback({ type: 'err', text: `Υπάρχει ήδη πλάνο με ID "${slug}".` });
      return;
    }

    setSavingId(slug);
    try {
      await onSavePlan({
        ...editingPlan,
        id: slug,
      });
      setFeedback({
        type: 'ok',
        text: isCreatingNew
          ? `Το νέο πλάνο «${editingPlan.name.trim()}» δημιουργήθηκε και αποθηκεύτηκε!`
          : `Οι αλλαγές στο πλάνο «${editingPlan.name.trim()}» αποθηκεύτηκαν!`,
      });
      setEditingPlan(null);
      setIsCreatingNew(false);
    } catch (err: any) {
      setFeedback({
        type: 'err',
        text: err?.message || 'Σφάλμα αποθήκευσης πλάνου στο Cloud Firestore.',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (plan.isBuiltIn) return;
    if (!window.confirm(`Διαγραφή του πλάνου «${plan.name}»; Οι χρήστες του θα μεταπέσουν σε FREE.`)) {
      return;
    }
    setDeletingId(plan.id);
    setFeedback(null);
    try {
      await onDeletePlan(plan.id);
      setFeedback({ type: 'ok', text: `Το πλάνο «${plan.name}» διαγράφηκε.` });
    } catch (err: any) {
      setFeedback({
        type: 'err',
        text: err?.message || 'Σφάλμα διαγραφής πλάνου.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const renderLimitInput = (
    label: string,
    field: 'maxFiles' | 'maxPagesPerNativeFile' | 'maxStorageMb' | 'aiCallsPerDay' | 'aiCallsPerWeek',
    unit: string
  ) => {
    if (!editingPlan) return null;
    const val = editingPlan[field];
    const isUnl = Boolean(editingPlan.isUnlimited) || val < 0;
    return (
      <div className="p-3 rounded-xl bg-white border border-[#dfd8cb] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-extrabold text-[#1b2a4a]">{label}</label>
          <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isUnl}
              disabled={Boolean(editingPlan.isUnlimited)}
              onChange={(e) => {
                setEditingPlan((prev) =>
                  prev
                    ? {
                        ...prev,
                        [field]: e.target.checked ? -1 : 10,
                      }
                    : null
                );
              }}
              className="rounded border-slate-300"
            />
            <span>Απεριόριστο</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            disabled={isUnl}
            value={isUnl ? '' : val}
            placeholder={isUnl ? '∞ Απεριόριστο' : '0'}
            onChange={(e) => {
              const num = Math.max(0, parseInt(e.target.value || '0', 10) || 0);
              setEditingPlan((prev) => (prev ? { ...prev, [field]: num } : null));
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#fdfbf7] border border-[#dfd8cb] text-xs font-bold text-[#1b2a4a] disabled:opacity-50"
          />
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#1b2a4a] uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#1b2a4a]" />
            <span>Διαχείριση Πλάνων & Ορίων ({plans.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Επεξεργάσου τα όρια των FREE / PLUS / ULTRA ή δημιούργησε νέα προσαρμοσμένα πλάνα. Οι αλλαγές εφαρμόζονται άμεσα σε όλους τους χρήστες.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#dfd8cb] text-xs font-bold text-[#1b2a4a] hover:bg-[#efebe3] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Ανανέωση</span>
          </button>
          <button
            type="button"
            onClick={openCreateNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Νέο Πλάνο</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Edit / Create Form Drawer */}
      {editingPlan && (
        <form
          onSubmit={(e) => void handleSave(e)}
          className="ipados-liquid-glass bg-[#fdfbf7]/95 backdrop-blur-2xl border-2 border-[#1b2a4a]/30 rounded-3xl p-5 sm:p-6 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#dfd8cb]">
            <h4 className="text-sm font-black text-[#1b2a4a] flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>
                {isCreatingNew ? 'Δημιουργία Νέου Πλάνου' : `Επεξεργασία Πλάνου: ${editingPlan.name}`}
              </span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setEditingPlan(null);
                setIsCreatingNew(false);
              }}
              className="p-1.5 rounded-xl bg-white hover:bg-rose-50 border border-[#dfd8cb] text-slate-500 hover:text-rose-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-[#1b2a4a] mb-1">
                ID Πλάνου (slug)
              </label>
              <input
                type="text"
                disabled={!isCreatingNew}
                value={editingPlan.id}
                onChange={(e) =>
                  setEditingPlan((prev) => (prev ? { ...prev, id: e.target.value } : null))
                }
                placeholder="π.χ. pro ή student"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd8cb] text-xs font-bold text-[#1b2a4a] disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#1b2a4a] mb-1">
                Όνομα Εμφάνισης
              </label>
              <input
                type="text"
                value={editingPlan.name}
                onChange={(e) =>
                  setEditingPlan((prev) => (prev ? { ...prev, name: e.target.value } : null))
                }
                placeholder="π.χ. PRO"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd8cb] text-xs font-bold text-[#1b2a4a]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#1b2a4a] mb-1">
                Χρώμα Badge & Σειρά
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 flex-wrap">
                  {BADGE_COLOR_PRESETS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() =>
                        setEditingPlan((prev) => (prev ? { ...prev, badgeColor: c.hex } : null))
                      }
                      className={`w-6 h-6 rounded-full cursor-pointer transition ${
                        editingPlan.badgeColor === c.hex
                          ? 'ring-2 ring-offset-2 ring-[#1b2a4a] scale-110'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
                <input
                  type="number"
                  value={editingPlan.order}
                  onChange={(e) =>
                    setEditingPlan((prev) =>
                      prev ? { ...prev, order: parseInt(e.target.value || '0', 10) || 0 } : null
                    )
                  }
                  className="w-14 px-2 py-1.5 rounded-lg bg-white border border-[#dfd8cb] text-xs font-bold text-center text-[#1b2a4a]"
                  title="Σειρά εμφάνισης"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-[#1b2a4a] mb-1">
              Περιγραφή Πλάνου
            </label>
            <input
              type="text"
              value={editingPlan.description}
              onChange={(e) =>
                setEditingPlan((prev) => (prev ? { ...prev, description: e.target.value } : null))
              }
              placeholder="Σύντομη περιγραφή που εμφανίζεται στο modal αναβάθμισης..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd8cb] text-xs font-medium text-[#1b2a4a]"
            />
          </div>

          {/* Global Toggles */}
          <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-[#eef3f8] border border-[#1b2a4a]/15">
            <label className="flex items-center gap-2 text-xs font-extrabold text-[#1b2a4a] cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editingPlan.isUnlimited)}
                onChange={(e) => {
                  const unl = e.target.checked;
                  setEditingPlan((prev) =>
                    prev
                      ? {
                          ...prev,
                          isUnlimited: unl,
                          maxFiles: unl ? -1 : prev.maxFiles < 0 ? 20 : prev.maxFiles,
                          maxPagesPerNativeFile: unl
                            ? -1
                            : prev.maxPagesPerNativeFile < 0
                            ? 10
                            : prev.maxPagesPerNativeFile,
                          maxStorageMb: unl ? -1 : prev.maxStorageMb < 0 ? 10 : prev.maxStorageMb,
                          aiCallsPerDay: unl ? -1 : prev.aiCallsPerDay < 0 ? 5 : prev.aiCallsPerDay,
                          aiCallsPerWeek: unl
                            ? -1
                            : prev.aiCallsPerWeek < 0
                            ? 20
                            : prev.aiCallsPerWeek,
                          allowAutoTags: unl ? true : prev.allowAutoTags,
                        }
                      : null
                  );
                }}
                className="rounded border-slate-300"
              />
              <span>Πλήρως Απεριόριστο Πλάνο (όπως ULTRA)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-extrabold text-[#1b2a4a] cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editingPlan.allowAutoTags)}
                onChange={(e) =>
                  setEditingPlan((prev) =>
                    prev ? { ...prev, allowAutoTags: e.target.checked } : null
                  )
                }
                className="rounded border-slate-300"
              />
              <span>Επιτρέπονται τα AI Auto-Tags (#tags)</span>
            </label>
          </div>

          {/* Numeric Limits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderLimitInput('Μέγιστα Αρχεία', 'maxFiles', 'αρχεία')}
            {renderLimitInput('Σελίδες / Δικό μας Αρχείο', 'maxPagesPerNativeFile', 'σελίδες')}
            {renderLimitInput('Χώρος Αποθήκευσης', 'maxStorageMb', 'MB')}
            {renderLimitInput('AI Κλήσεις / Ημέρα', 'aiCallsPerDay', 'κλήσεις')}
            {renderLimitInput('AI Κλήσεις / Εβδομάδα', 'aiCallsPerWeek', 'κλήσεις')}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditingPlan(null);
                setIsCreatingNew(false);
              }}
              className="px-4 py-2 rounded-xl bg-white border border-[#dfd8cb] text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={savingId !== null}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1b2a4a] hover:bg-[#152238] text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingId ? 'Αποθήκευση...' : 'Αποθήκευση Πλάνου'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Active Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const userCount = countUsersOnPlan(plan.id);
          return (
            <div
              key={plan.id}
              className="ipados-liquid-glass bg-[#fdfbf7]/85 backdrop-blur-2xl border border-white/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider text-white"
                        style={{ backgroundColor: plan.badgeColor || '#1b2a4a' }}
                      >
                        {plan.name}
                      </span>
                      <span className="text-[10.5px] font-mono text-slate-400">#{plan.id}</span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                      {plan.description || 'Χωρίς περιγραφή'}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#eef3f8] text-[#1b2a4a] text-[11px] font-extrabold shrink-0">
                    <Users className="w-3 h-3" />
                    <span>{userCount}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11.5px] pt-1">
                  <div className="p-2 rounded-xl bg-white border border-[#dfd8cb]/80">
                    <span className="text-[10px] text-slate-400 block font-bold">Αρχεία</span>
                    <span className="font-extrabold text-[#1b2a4a]">
                      {plan.isUnlimited || plan.maxFiles < 0 ? '∞ Απεριόριστα' : plan.maxFiles}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#dfd8cb]/80">
                    <span className="text-[10px] text-slate-400 block font-bold">Σελίδες / Αρχείο</span>
                    <span className="font-extrabold text-[#1b2a4a]">
                      {plan.isUnlimited || plan.maxPagesPerNativeFile < 0
                        ? '∞ Απεριόριστες'
                        : `${plan.maxPagesPerNativeFile} (δικά μας)`}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#dfd8cb]/80">
                    <span className="text-[10px] text-slate-400 block font-bold">Χώρος</span>
                    <span className="font-extrabold text-[#1b2a4a]">
                      {plan.isUnlimited || plan.maxStorageMb < 0
                        ? '∞ Απεριόριστος'
                        : `${plan.maxStorageMb} MB`}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#dfd8cb]/80">
                    <span className="text-[10px] text-slate-400 block font-bold">AI Κλήσεις</span>
                    <span className="font-extrabold text-[#1b2a4a]">
                      {plan.isUnlimited || (plan.aiCallsPerDay < 0 && plan.aiCallsPerWeek < 0)
                        ? '∞ Απεριόριστες'
                        : `${plan.aiCallsPerDay < 0 ? '∞' : plan.aiCallsPerDay}/ημ • ${
                            plan.aiCallsPerWeek < 0 ? '∞' : plan.aiCallsPerWeek
                          }/εβδ`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-xl bg-white/80 border border-[#dfd8cb]/70">
                  <span className="font-bold text-slate-600">AI Auto-Tags (#tags)</span>
                  <span
                    className={`font-black ${
                      plan.allowAutoTags || plan.isUnlimited ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {plan.allowAutoTags || plan.isUnlimited ? 'Ενεργό' : 'Κλειδωμένο'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#dfd8cb]/70">
                <button
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setIsCreatingNew(false);
                    setEditingPlan({ ...plan });
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#eef3f8] hover:bg-[#dfe8f2] text-[#1b2a4a] text-xs font-bold transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Επεξεργασία Ορίων</span>
                </button>
                {!plan.isBuiltIn && (
                  <button
                    type="button"
                    disabled={deletingId === plan.id}
                    onClick={() => void handleDelete(plan)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition cursor-pointer disabled:opacity-50"
                    title="Διαγραφή προσαρμοσμένου πλάνου"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guest Policy Reference Box */}
      <div className="p-4 rounded-2xl bg-white/85 border border-[#dfd8cb] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="font-black text-[#1b2a4a]">Πολιτική Επισκέπτη (Χωρίς Σύνδεση): </span>
          <span className="text-slate-600 font-medium">
            {GUEST_LIMITS.maxFiles} προσωρινό αρχείο • έως {GUEST_LIMITS.maxPagesPerNativeFile} σελίδες • 0 κλήσεις AI • Καμία αποθήκευση στη βάση/συσκευή (διαγράφεται στο κλείσιμο).
          </span>
        </div>
      </div>

      {/* AI Token-Consuming Features Catalog */}
      <div className="ipados-liquid-glass bg-[#fdfbf7]/85 backdrop-blur-2xl border border-white/85 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#1b2a4a] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#1b2a4a]" />
              <span>Κατάλογος Λειτουργιών AI (Κατανάλωση Gemini Tokens)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Πλήρης καταγραφή όλων των εργαλείων που καταναλώνουν AI κλήσεις/tokens σε σχέση με τα τοπικά εργαλεία (0 tokens).
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-[#eef3f8] text-[#1b2a4a] text-[11px] font-extrabold shrink-0">
            {AI_TOKEN_FEATURES_CATALOG.filter((f) => f.consumesTokens).length} AI Features •{' '}
            {AI_TOKEN_FEATURES_CATALOG.filter((f) => !f.consumesTokens).length} Local
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#dfd8cb] text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Λειτουργία</th>
                <th className="py-2.5 px-3">Κατηγορία</th>
                <th className="py-2.5 px-3">Tokens</th>
                <th className="py-2.5 px-3">Διαθεσιμότητα Πλάνων</th>
                <th className="py-2.5 px-3">Περιγραφή</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfd8cb]/60">
              {AI_TOKEN_FEATURES_CATALOG.map((item) => (
                <tr key={item.id} className="hover:bg-white/60 transition">
                  <td className="py-2.5 px-3 font-extrabold text-[#1b2a4a] whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-bold">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {item.consumesTokens ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-extrabold">
                        <Sparkles className="w-3 h-3" />
                        <span>Καταναλώνει Tokens</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-extrabold">
                        <span>0 Tokens (Τοπικό)</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700 whitespace-nowrap">
                    {item.planRequirement}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
