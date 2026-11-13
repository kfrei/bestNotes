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
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'bestnotes-2026',
  appId: '1:867655609873:web:b8f97622f20abf90448bb0',
  storageBucket: 'bestnotes-2026.firebasestorage.app',
  apiKey: 'AIzaSyD-Cj9b-8PaoUlrZntNwkHjd9XYIDyJZcI',
  authDomain: 'bestnotes-2026.firebaseapp.com',
  messagingSenderId: '867655609873',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const driveFirebaseApp = initializeApp(firebaseConfig, 'bestnotes-drive-oauth');
export const auth = getAuth(firebaseApp);
export const driveAuth = getAuth(driveFirebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const googleDriveProvider = new GoogleAuthProvider();
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive');
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive.file');

export async function signInToGoogleDrive(
  hintEmail?: string | null,
  forceAccountSelect = false
): Promise<{
  accessToken: string;
  email: string;
  displayName: string;
}> {
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

  // If we already know the user's email, position the popup window off-screen & tiny
  // so the user does NOT see a white blank popup flashing on their screen
  const shouldHidePopup = !forceAccountSelect && Boolean(hintEmail && hintEmail.includes('@'));
  const originalOpen = typeof window !== 'undefined' ? window.open : null;
  let popupHandle: Window | null = null;

  if (shouldHidePopup && originalOpen) {
    try {
      window.open = function (url?: string | URL, target?: string, features?: string) {
        const hiddenFeatures =
          'width=10,height=10,left=12000,top=12000,menubar=no,toolbar=no,location=no,status=no,resizable=no';
        popupHandle = originalOpen.call(window, url, target, hiddenFeatures);
        try {
          if (popupHandle) {
            popupHandle.resizeTo(1, 1);
            popupHandle.moveTo(
              (window.screen?.availWidth || 2000) + 1000,
              (window.screen?.availHeight || 2000) + 1000
            );
          }
        } catch {
          // ignore
        }
        return popupHandle;
      };
    } catch {
      // ignore
    }
  }

  try {
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
  } finally {
    if (shouldHidePopup && originalOpen && typeof window !== 'undefined') {
      window.open = originalOpen;
    }
  }
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
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  type User,
};
