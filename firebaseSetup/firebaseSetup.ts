import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, inMemoryPersistence, initializeAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfigDev = {
  apiKey: "AIzaSyDTlIS5HeMiYqll3bcTh2_Wz14z1pUkSSM",
  authDomain: "ssr-juniors-dev.firebaseapp.com",
  projectId: "ssr-juniors-dev",
  storageBucket: "ssr-juniors-dev.firebasestorage.app",
  messagingSenderId: "400666905468",
  appId: "1:400666905468:web:648be4cda66a37a3dfb2f9",
  measurementId: "G-6T5DPF0JTE",
};

const firebaseConfigProd = {
  apiKey: "AIzaSyBpTknX0aGx9RnlY_39OVsSz0k011T_1Gk",
  authDomain: "ssr-juniors.firebaseapp.com",
  projectId: "ssr-juniors",
  storageBucket: "ssr-juniors.firebasestorage.app",
  messagingSenderId: "198371863429",
  appId: "1:198371863429:web:bd6cb1d9ced76fb8f472ec",
};

// __DEV__ only reflects "running under Metro" — it's false in every
// standalone build (EAS internal or store alike), so it's only a valid
// fallback for local dev. Every built app must set EXPO_PUBLIC_APP_ENV
// explicitly; we never silently fall back to production.
const APP_ENV =
  process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? "development" : undefined);

if (!APP_ENV) {
  throw new Error(
    "EXPO_PUBLIC_APP_ENV is not set — refusing to guess which Firebase project to use."
  );
}

type FirebaseWebConfig = Omit<typeof firebaseConfigDev, "measurementId"> & {
  measurementId?: string;
};

const configsByEnv: Record<string, FirebaseWebConfig> = {
  development: firebaseConfigDev,
  staging: firebaseConfigDev,
  production: firebaseConfigProd,
};

const firebaseConfig = configsByEnv[APP_ENV];
if (!firebaseConfig) {
  throw new Error(`Unknown EXPO_PUBLIC_APP_ENV: "${APP_ENV}"`);
}

console.log(`Firebase config loaded: ${APP_ENV} (${firebaseConfig.projectId})`);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore
export const firestore: Firestore = getFirestore(app);

// Web Auth SDK instance on the *same* app as Firestore above. On native
// this carries no session by itself — the real sign-in happens via
// @react-native-firebase/auth (a separate native App instance). See
// utils/firestoreAuthBridge.ts, which exchanges the native session for a
// custom-token sign-in here so Firestore calls carry a valid request.auth.
// On web, authClient.web.ts's `auth` already *is* this instance, so no
// bridging is needed there.
//
// On native, this session is re-minted from scratch on every native auth
// state change (see ensureFirestoreSession) — it's never the source of
// truth, so it deliberately uses in-memory persistence rather than pulling
// in AsyncStorage just to persist a session that gets rebuilt anyway. Web
// needs its default (browser-local) persistence since there it's the real,
// only session.
export const webAuth: Auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, { persistence: inMemoryPersistence });

export default app;
