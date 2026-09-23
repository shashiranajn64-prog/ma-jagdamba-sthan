import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google OAuth Provider with Workspace Scopes
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));

// CRITICAL: Cache access token in memory ONLY (never in localStorage or sessionStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

type AuthSuccessCallback = (user: User, token: string) => void;
type AuthFailureCallback = () => void;

const listeners: { success?: AuthSuccessCallback; failure?: AuthFailureCallback }[] = [];

/**
 * Initialize Google Auth state listener.
 */
export const initGoogleAuth = (
  onAuthSuccess?: AuthSuccessCallback,
  onAuthFailure?: AuthFailureCallback
) => {
  listeners.push({ success: onAuthSuccess, failure: onAuthFailure });

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      listeners.forEach((l) => l.success?.(user, cachedAccessToken!));
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        listeners.forEach((l) => l.failure?.());
      }
    }
  });
};

/**
 * Sign in with Google popup and obtain Workspace OAuth access token.
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google OAuth Access Token प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।');
    }

    cachedAccessToken = credential.accessToken;
    listeners.forEach((l) => l.success?.(result.user, cachedAccessToken!));
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory cached access token.
 */
export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Set in-memory token (e.g., during active session).
 */
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Sign out of Google.
 */
export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  listeners.forEach((l) => l.failure?.());
};
