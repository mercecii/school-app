import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  getAuth,
  onAuthStateChanged as nativeOnAuthStateChanged,
  sendPasswordResetEmail as nativeSendPasswordResetEmail,
  signInWithEmailAndPassword as nativeSignInWithEmailAndPassword,
  signInWithPhoneNumber as nativeSignInWithPhoneNumber,
  signOut as nativeSignOut,
} from "@react-native-firebase/auth";
import type {
  AuthClient,
  AuthConfirmationResult,
  AuthStateCallback,
  AuthUserCredential,
  NativeAuth,
  Unsubscribe,
} from "./authClient.types";

export const auth: AuthClient = getAuth();

export function onAuthStateChanged(
  currentAuth: AuthClient,
  callback: AuthStateCallback,
): Unsubscribe {
  return nativeOnAuthStateChanged(
    currentAuth as NativeAuth,
    callback as (user: FirebaseAuthTypes.User | null) => void,
  );
}

export async function signInWithPhoneNumber(
  currentAuth: AuthClient,
  phoneNumber: string,
): Promise<AuthConfirmationResult> {
  const nativeAuth = currentAuth as NativeAuth;

  try {
    return await nativeSignInWithPhoneNumber(nativeAuth, phoneNumber);
  } catch (error: any) {
    const code = String(error?.code ?? "");

    if (__DEV__ && code.includes("auth/missing-client-identifier")) {
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
  await nativeSignOut(currentAuth as NativeAuth);
}

export async function sendPasswordResetEmail(
  currentAuth: AuthClient,
  email: string,
): Promise<void> {
  await nativeSendPasswordResetEmail(currentAuth as NativeAuth, email);
}
