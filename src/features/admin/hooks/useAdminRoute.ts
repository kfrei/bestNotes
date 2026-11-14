import { useState, useEffect, useCallback } from 'react';

/**
 * Checks whether the current window location represents the Admin view
 */
export function checkIsAdminUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get('admin') === 'true' ||
    params.get('view') === 'admin' ||
    window.location.pathname.startsWith('/admin') ||
    window.location.hostname.startsWith('explainboards.dash')
  );
}

export interface UseAdminRouteReturn {
  isAdminOpen: boolean;
  openAdmin: () => void;
  closeAdmin: () => void;
}

/**
 * Isolated hook that manages Admin Panel navigation and URL synchronization
 */
export function useAdminRoute(): UseAdminRouteReturn {
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(checkIsAdminUrl);

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminOpen(checkIsAdminUrl());
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const openAdmin = useCallback(() => {
    setIsAdminOpen(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('admin', 'true');
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore in non-browser environments
    }
  }, []);

  const closeAdmin = useCallback(() => {
    setIsAdminOpen(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      url.searchParams.delete('view');
      const newSearch = url.searchParams.toString();
      const newPath = url.pathname.startsWith('/admin') ? '/' : url.pathname;
      window.history.replaceState({}, '', newPath + (newSearch ? `?${newSearch}` : ''));
    } catch {
      // ignore
    }
  }, []);

  return { isAdminOpen, openAdmin, closeAdmin };
}
