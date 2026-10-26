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
  setDoc,
  deleteDoc,
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
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const googleDriveProvider = new GoogleAuthProvider();
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
    googleDriveProvider.setCustomParameters({ prompt: 'consent select_account' });
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
  setDoc,
  deleteDoc,
  onSnapshot,
  type User,
};
