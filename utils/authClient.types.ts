import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import type {
  Auth as WebAuth,
  User as WebUser,
  UserCredential as WebUserCredential,
} from "firebase/auth";

export type NativeAuth = FirebaseAuthTypes.Module;
export type BrowserAuth = WebAuth;
export type AuthClient = NativeAuth | BrowserAuth;
export type AuthUser = FirebaseAuthTypes.User | WebUser;
export type AuthConfirmationResult = FirebaseAuthTypes.ConfirmationResult;
export type AuthUserCredential =
  | FirebaseAuthTypes.UserCredential
  | WebUserCredential;

export type AuthStateCallback = (user: AuthUser | null) => void;
export type Unsubscribe = () => void;

// Bridges the platform's auth session into the web `firebase/firestore`
// client's auth context. Native has a separate Firebase App instance for
// Firestore than for Auth (see firebaseSetup.ts) and needs an explicit
// custom-token exchange; web's Firestore already shares the same app/session
// as auth, so this is a no-op there. Must resolve before any Firestore call.
export type EnsureFirestoreSession = (user: AuthUser) => Promise<void>;
