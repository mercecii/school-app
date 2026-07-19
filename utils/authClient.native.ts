import { webAuth } from "@/firebaseSetup/firebaseSetup";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  getAuth,
  onAuthStateChanged as nativeOnAuthStateChanged,
  sendPasswordResetEmail as nativeSendPasswordResetEmail,
  signInWithEmailAndPassword as nativeSignInWithEmailAndPassword,
  signInWithPhoneNumber as nativeSignInWithPhoneNumber,
  signOut as nativeSignOut,
} from "@react-native-firebase/auth";
import { getFunctions, httpsCallable } from "@react-native-firebase/functions";
import { signInWithCustomToken, signOut as webSignOut } from "firebase/auth";
import type {
  AuthClient,
  AuthConfirmationResult,
  AuthStateCallback,
  AuthUser,
  AuthUserCredential,
  NativeAuth,
  Unsubscribe,
} from "./authClient.types";

export const auth: AuthClient = getAuth();

const mintFirestoreToken = httpsCallable<undefined, { token: string }>(
  getFunctions(),
  "mintFirestoreToken",
);

/**
 * Exchanges the native session for a custom-token sign-in on the web
 * Firestore client's Auth instance. See mintFirestoreToken cloud function
 * and the comment on firebaseSetup.ts's `webAuth` export for why this
 * exists — without it, every Firestore call on native carries no
 * request.auth and fails every isSignedIn()-gated rule.
 */
export async function ensureFirestoreSession(_user: AuthUser): Promise<void> {
  const { data } = await mintFirestoreToken();
  await signInWithCustomToken(webAuth, data.token);
}

export function onAuthStateChanged(
  currentAuth: AuthClient,
  callback: AuthStateCallback,
): Unsubscribe {
  return nativeOnAuthStateChanged(
    currentAuth as NativeAuth,
    callback as (user: FirebaseAuthTypes.User | null) => void,
  );
}

// Play Integrity's "standard" app-recognition verdict requires the app to be
// distributed through Google Play (even just an internal testing track) —
// a locally-built debug APK is unrecognized regardless of correct SHA
// fingerprints and an enabled Play Integrity API, and Firebase rejects it
// with auth/app-not-authorized ("Invalid app info in play_integrity_token").
// auth/missing-client-identifier is the equivalent failure on the older
// SafetyNet path. Both are expected for local dev builds, never for a
// Play-distributed one, so this bypass is __DEV__-gated the same way.
const APP_VERIFICATION_BYPASS_CODES = [
  "auth/missing-client-identifier",
  "auth/app-not-authorized",
];

export async function signInWithPhoneNumber(
  currentAuth: AuthClient,
  phoneNumber: string,
): Promise<AuthConfirmationResult> {
  const nativeAuth = currentAuth as NativeAuth;

  try {
    return await nativeSignInWithPhoneNumber(nativeAuth, phoneNumber);
  } catch (error: any) {
    const code = String(error?.code ?? "");

    if (
      __DEV__ &&
      APP_VERIFICATION_BYPASS_CODES.some((c) => code.includes(c))
    ) {
      nativeAuth.settings.appVerificationDisabledForTesting = true;
      return nativeSignInWithPhoneNumber(nativeAuth, phoneNumber);
    }

    throw error;
  }
}

export async function signInWithEmailAndPassword(
  currentAuth: AuthClient,
  email: string,
  password: string,
): Promise<AuthUserCredential> {
  return nativeSignInWithEmailAndPassword(
    currentAuth as NativeAuth,
    email,
    password,
  );
}

export async function signOut(currentAuth: AuthClient): Promise<void> {
  // Both sessions must clear together — leaving the web Firestore session
  // signed in after native sign-out would let a "signed out" app keep
  // reading/writing as the previous user.
  await Promise.all([
    nativeSignOut(currentAuth as NativeAuth),
    webSignOut(webAuth).catch(() => undefined),
  ]);
}

export async function sendPasswordResetEmail(
  currentAuth: AuthClient,
  email: string,
): Promise<void> {
  await nativeSendPasswordResetEmail(currentAuth as NativeAuth, email);
}
