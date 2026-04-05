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
