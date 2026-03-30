import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  getAuth as getNativeAuth,
  onAuthStateChanged as nativeOnAuthStateChanged,
  signInWithEmailAndPassword as nativeSignInWithEmailAndPassword,
  signInWithPhoneNumber as nativeSignInWithPhoneNumber,
  signOut as nativeSignOut,
} from "@react-native-firebase/auth";
import { Platform } from "react-native";

type NativeAuth = FirebaseAuthTypes.Module;
type WebUnsupportedAuth = {
  currentUser: null;
  settings: {
    appVerificationDisabledForTesting: boolean;
  };
  app: {
    options: {
      projectId: string;
    };
  };
};

export type AuthClient = NativeAuth | WebUnsupportedAuth;

export type AuthUser = FirebaseAuthTypes.User;
export type AuthConfirmationResult = FirebaseAuthTypes.ConfirmationResult;

type AuthStateCallback = (user: AuthUser | null) => void;
type Unsubscribe = () => void;

const webUnsupportedAuth: WebUnsupportedAuth = {
  currentUser: null,
  settings: {
    appVerificationDisabledForTesting: false,
  },
  app: {
    options: {
      projectId: "web-unsupported",
    },
  },
};

export const auth: AuthClient =
  Platform.OS === "web" ? webUnsupportedAuth : getNativeAuth();

export function onAuthStateChanged(
  currentAuth: AuthClient,
  callback: AuthStateCallback,
): Unsubscribe {
  if (Platform.OS === "web") {
    callback(null);
    return () => {};
  }

  return nativeOnAuthStateChanged(
    currentAuth as NativeAuth,
    callback as (user: FirebaseAuthTypes.User | null) => void,
  );
}

export async function signInWithPhoneNumber(
  currentAuth: AuthClient,
  phoneNumber: string,
): Promise<AuthConfirmationResult> {
  if (Platform.OS === "web") {
    throw new Error("Phone login is only supported on mobile app");
  }

  const nativeAuth = currentAuth as NativeAuth;

  try {
    return await nativeSignInWithPhoneNumber(nativeAuth, phoneNumber);
  } catch (error: any) {
    const code = String(error?.code ?? "");

    // In local/dev builds, Android phone auth can fail app attestation on emulators.
    // Retry once with testing verification disabled so developer test numbers continue working.
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
): Promise<FirebaseAuthTypes.UserCredential> {
  if (Platform.OS === "web") {
    throw new Error("Email/password login is only supported on mobile app");
  }

  return nativeSignInWithEmailAndPassword(
    currentAuth as NativeAuth,
    email,
    password,
  );
}

export async function signOut(currentAuth: AuthClient): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  await nativeSignOut(currentAuth as NativeAuth);
}
