import app from "@/firebaseSetup/firebaseSetup";
import type { User as WebUser } from "firebase/auth";
import {
  getAuth,
  onAuthStateChanged as webOnAuthStateChanged,
  sendPasswordResetEmail as webSendPasswordResetEmail,
  signInWithEmailAndPassword as webSignInWithEmailAndPassword,
  signOut as webSignOut,
} from "firebase/auth";
import type {
  AuthClient,
  AuthConfirmationResult,
  AuthStateCallback,
  AuthUserCredential,
  BrowserAuth,
  Unsubscribe,
} from "./authClient.types";

export const auth: AuthClient = getAuth(app);

export function onAuthStateChanged(
  currentAuth: AuthClient,
  callback: AuthStateCallback,
): Unsubscribe {
  return webOnAuthStateChanged(
    currentAuth as BrowserAuth,
    callback as (user: WebUser | null) => void,
  );
}

export async function signInWithPhoneNumber(
  _currentAuth: AuthClient,
  _phoneNumber: string,
): Promise<AuthConfirmationResult> {
  throw new Error("Phone login is only supported on mobile app");
}

export async function signInWithEmailAndPassword(
  currentAuth: AuthClient,
  email: string,
  password: string,
): Promise<AuthUserCredential> {
  return webSignInWithEmailAndPassword(
    currentAuth as BrowserAuth,
    email,
    password,
  );
}

export async function signOut(currentAuth: AuthClient): Promise<void> {
  await webSignOut(currentAuth as BrowserAuth);
}

export async function sendPasswordResetEmail(
  currentAuth: AuthClient,
  email: string,
): Promise<void> {
  await webSendPasswordResetEmail(currentAuth as BrowserAuth, email);
}
