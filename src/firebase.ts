import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocFromServer,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  projectId: 'bestnotes-2026',
  appId: '1:867655609873:web:b8f97622f20abf90448bb0',
  storageBucket: 'bestnotes-2026.firebasestorage.app',
  apiKey: 'AIzaSyD-Cj9b-8PaoUlrZntNwkHjd9XYIDyJZcI',
  authDomain: 'bestnotes-2026.firebaseapp.com',
  messagingSenderId: '867655609873',
};

export const GOOGLE_OAUTH_CLIENT_ID =
  '867655609873-t8lm31dtq13mkmeuc5tkn8t0odum0bhf.apps.googleusercontent.com';

export const firebaseApp = initializeApp(firebaseConfig);
export const driveFirebaseApp = initializeApp(firebaseConfig, 'bestnotes-drive-oauth');
export const auth = getAuth(firebaseApp);
export const driveAuth = getAuth(driveFirebaseApp);
export const db = getFirestore(firebaseApp);
export const cloudFunctions = getFunctions(firebaseApp, 'europe-west1');

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const googleDriveProvider = new GoogleAuthProvider();
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive');
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive.file');

let inflightSilentRefreshPromise: Promise<{
  accessToken: string;
  email: string;
  expiresAtMs: number;
} | null> | null = null;

/**
 * GoodNotes-style silent server-to-server Google Drive token refresh via Firebase Cloud Functions.
 * Never calls `window.open` and never triggers any browser/iPadOS popup window.
 */
export async function refreshGoogleDriveTokenSilently(
  forceRefresh = false
): Promise<{
  accessToken: string;
  email: string;
  expiresAtMs: number;
} | null> {
  if (!auth.currentUser) return null;
  if (inflightSilentRefreshPromise) return inflightSilentRefreshPromise;

  inflightSilentRefreshPromise = (async () => {
    try {
      const fn = httpsCallable<
        { forceRefresh?: boolean },
        { accessToken?: string; email?: string; expiresAtMs?: number }
      >(cloudFunctions, 'getFreshDriveAccessToken');
      const res = await fn({ forceRefresh });
      const data = res.data;
      if (data && typeof data.accessToken === 'string' && data.accessToken.length > 0) {
        return {
          accessToken: data.accessToken,
          email: typeof data.email === 'string' ? data.email : '',
          expiresAtMs:
            typeof data.expiresAtMs === 'number' ? data.expiresAtMs : Date.now() + 3500 * 1000,
        };
      }
      return null;
    } catch {
      return null;
    } finally {
      inflightSilentRefreshPromise = null;
    }
  })();

  return inflightSilentRefreshPromise;
}

let gisScriptPromise: Promise<boolean> | null = null;

function loadGoogleIdentityServicesScript(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(false);
  }
  const win = window as any;
  if (win.google?.accounts?.oauth2?.initCodeClient) {
    return Promise.resolve(true);
  }
  if (gisScriptPromise) return gisScriptPromise;

  gisScriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve(Boolean((window as any).google?.accounts?.oauth2?.initCodeClient));
    };
    script.onerror = () => {
      gisScriptPromise = null;
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

async function requestOfflineAuthCodeViaGis(
  hintEmail?: string | null,
  forceAccountSelect = false
): Promise<string | null> {
  const ready = await loadGoogleIdentityServicesScript();
  if (!ready) return null;
  const oauth2 = (window as any).google?.accounts?.oauth2;
  if (!oauth2?.initCodeClient) return null;

  return new Promise<string | null>((resolve, reject) => {
    let settled = false;
    const client = oauth2.initCodeClient({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      scope:
        'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file openid email profile',
      ux_mode: 'popup',
      select_account: forceAccountSelect || !hintEmail,
      ...(hintEmail && hintEmail.includes('@') && !forceAccountSelect
        ? { hint: hintEmail.trim(), login_hint: hintEmail.trim() }
        : {}),
      callback: (resp: { code?: string; error?: string; error_description?: string }) => {
        if (settled) return;
        settled = true;
        if (resp?.code) {
          resolve(resp.code);
        } else if (resp?.error === 'access_denied' || resp?.error === 'popup_closed_by_user') {
          reject(new Error('Ακυρώθηκε από τον χρήστη.'));
        } else {
          resolve(null);
        }
      },
      error_callback: (err: { type?: string }) => {
        if (settled) return;
        settled = true;
        if (err?.type === 'popup_closed') {
          reject(new Error('Ακυρώθηκε από τον χρήστη.'));
        } else {
          resolve(null);
        }
      },
    });
    client.requestCode();
  });
}

export async function signInToGoogleDrive(
  hintEmail?: string | null,
  forceAccountSelect = false
): Promise<{
  accessToken: string;
  email: string;
  displayName: string;
}> {
  // 1. Try 100% silent server-side refresh_token exchange FIRST (0 popups!)
  if (!forceAccountSelect) {
    const silent = await refreshGoogleDriveTokenSilently(true);
    if (silent?.accessToken) {
      return {
        accessToken: silent.accessToken,
        email: silent.email || hintEmail || '',
        displayName: silent.email || hintEmail || 'Google Drive',
      };
    }
  }

  // 2. One-time offline Authorization Code flow -> stores permanent refresh_token in Cloud Function
  if (auth.currentUser) {
    const authCode = await requestOfflineAuthCodeViaGis(hintEmail, forceAccountSelect);
    if (authCode) {
      try {
        const exchangeFn = httpsCallable<
          { code: string; redirectUri: string },
          { accessToken?: string; email?: string }
        >(cloudFunctions, 'exchangeDriveAuthCode');
        const res = await exchangeFn({ code: authCode, redirectUri: 'postmessage' });
        if (res.data?.accessToken) {
          const resolvedEmail = res.data.email || hintEmail || auth.currentUser.email || '';
          return {
            accessToken: res.data.accessToken,
            email: resolvedEmail,
            displayName: resolvedEmail || 'Google Drive',
          };
        }
      } catch {
        // Fallback to standard popup below if Cloud Functions are not deployed yet (e.g. before Blaze upgrade)
      }
    }
  }

  // 3. Fallback browser OAuth popup (used only if Cloud Function is not yet deployed)
  if (forceAccountSelect) {
    if (hintEmail && hintEmail.includes('@')) {
      googleDriveProvider.setCustomParameters({
        prompt: 'consent',
        login_hint: hintEmail.trim(),
      });
    } else {
      googleDriveProvider.setCustomParameters({ prompt: 'consent select_account' });
    }
  } else if (hintEmail && hintEmail.includes('@')) {
    googleDriveProvider.setCustomParameters({ login_hint: hintEmail.trim() });
  } else {
    googleDriveProvider.setCustomParameters({ prompt: 'select_account' });
  }

  const result = await signInWithPopup(driveAuth, googleDriveProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;
  if (!accessToken) {
    throw new Error('Δεν ελήφθη Google Drive Access Token.');
  }
  return {
    accessToken,
    email: result.user.email || '',
    displayName: result.user.displayName || result.user.email || 'Google Drive',
  };
}

export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  doc,
  collection,
  getDoc,
  getDocFromServer,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  increment,
  type User,
};
