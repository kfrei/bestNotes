import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  projectId: 'bestnotes-2026',
  appId: '1:867655609873:web:b8f97622f20abf90448bb0',
  storageBucket: 'bestnotes-2026.firebasestorage.app',
  apiKey: 'AIzaSyD-Cj9b-8PaoUlrZntNwkHjd9XYIDyJZcI',
  authDomain: 'bestnotes-2026.firebaseapp.com',
  messagingSenderId: '867655609873',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
};
