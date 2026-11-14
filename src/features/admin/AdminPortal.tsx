import React, { Suspense, useState, lazy } from 'react';
import type { User } from 'firebase/auth';
import type { Notebook } from '../../types/note';
import { AuthModal } from '../../components/LandingPage';
import { Sparkles, Loader2 } from 'lucide-react';

// Code-split: AdminDashboard is only downloaded over the network when AdminPortal is opened!
const LazyAdminDashboard = lazy(() =>
  import('./AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

export interface AdminPortalProps {
  currentUser: User | null;
  notebooks?: Notebook[];
  onClose: () => void;
}

const AdminLoadingFallback: React.FC = () => (
  <div className="fixed inset-0 w-screen h-screen z-[9999] bg-[#f7f5f0] flex flex-col items-center justify-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-[#1b2a4a] text-white flex items-center justify-center shadow-xl">
      <Loader2 className="w-7 h-7 animate-spin text-[#dfd8cb]" />
    </div>
    <div className="text-center">
      <h3 className="text-sm font-extrabold text-[#1b2a4a] tracking-tight">
        ExplainBoards Admin
      </h3>
      <p className="text-xs text-[#64748b] mt-0.5 font-medium">
        Φόρτωση Πίνακα Ελέγχου Διαχειριστή...
      </p>
    </div>
  </div>
);

/**
 * Isolated entry gate for ExplainBoards Admin Dashboard
 * Completely decoupled from the primary canvas note-taking application
 */
export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  notebooks = [],
  onClose,
}) => {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] overflow-hidden bg-[#f7f5f0] select-auto touch-pan-y">
      <Suspense fallback={<AdminLoadingFallback />}>
        <LazyAdminDashboard
          currentUser={currentUser}
          notebooks={notebooks}
          onBackToNotes={onClose}
          onSignInGoogle={() => {
            setAuthMode('signin');
            setShowAuthModal(true);
          }}
        />
      </Suspense>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setMode={setAuthMode}
        onSuccess={() => {
          setShowAuthModal(false);
        }}
      />
    </div>
  );
};
