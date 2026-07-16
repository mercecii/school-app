import { Platform } from "react-native";
import type {
  AuthClient,
  AuthConfirmationResult,
  AuthStateCallback,
  AuthUserCredential,
  EnsureFirestoreSession,
  Unsubscribe,
} from "./authClient.types";

type AuthModule = {
  auth: AuthClient;
  onAuthStateChanged: (
    currentAuth: AuthClient,
    callback: AuthStateCallback,
  ) => Unsubscribe;
  signInWithPhoneNumber: (
    currentAuth: AuthClient,
    phoneNumber: string,
  ) => Promise<AuthConfirmationResult>;
  signInWithEmailAndPassword: (
    currentAuth: AuthClient,
    email: string,
    password: string,
  ) => Promise<AuthUserCredential>;
  signOut: (currentAuth: AuthClient) => Promise<void>;
  sendPasswordResetEmail: (
    currentAuth: AuthClient,
    email: string,
  ) => Promise<void>;
  ensureFirestoreSession: EnsureFirestoreSession;
};

const authModule: AuthModule =
  Platform.OS === "web"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./authClient.web")
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./authClient.native");

export const {
  auth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  ensureFirestoreSession,
} = authModule;

export type {
  AuthClient,
  AuthConfirmationResult,
  AuthStateCallback,
  AuthUser,
  AuthUserCredential,
  BrowserAuth,
  NativeAuth,
  Unsubscribe,
} from "./authClient.types";
