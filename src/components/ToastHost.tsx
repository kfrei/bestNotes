import React, { useEffect, useState } from 'react';

type BannerListener = (msg: string | null) => void;

const listeners = new Set<BannerListener>();
let currentMessage: string | null = null;
let autoHideTimer: number | null = null;

/**
 * Sets or clears the floating status banner WITHOUT triggering a re-render of App.tsx!
 */
export function emitStatusBanner(msg: string | null): void {
  if (autoHideTimer !== null) {
    window.clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
  currentMessage = msg;
  listeners.forEach((fn) => fn(msg));
}

/**
 * Displays a transient toast notification for `durationMs` (default 2600ms) with ZERO App.tsx re-renders.
 */
export function emitToast(msg: string, durationMs = 2600): void {
  emitStatusBanner(msg);
  autoHideTimer = window.setTimeout(() => {
    autoHideTimer = null;
    if (currentMessage === msg) {
      currentMessage = null;
      listeners.forEach((fn) => fn(null));
    }
  }, durationMs);
}

const ToastHostInner: React.FC = () => {
  const [message, setMessage] = useState<string | null>(currentMessage);

  useEffect(() => {
    const handler: BannerListener = (next) => setMessage(next);
    listeners.add(handler);
    setMessage(currentMessage);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1b2a4a] text-white text-xs font-medium shadow-xl pointer-events-none">
      {message}
    </div>
  );
};

export const ToastHost = React.memo(ToastHostInner);
