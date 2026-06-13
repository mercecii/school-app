import { getApp, getApps, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

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

// On native, __DEV__ correctly signals dev vs release builds.
// On web static exports, __DEV__ is always false, so we also check
// EXPO_PUBLIC_FIREBASE_ENV to allow build-time environment selection.
const useDevConfig =
  __DEV__ || process.env.EXPO_PUBLIC_FIREBASE_ENV === "dev";

console.log("Firebase config loaded:", useDevConfig ? "Development (E2)" : "Production (E3)");
const firebaseConfig = useDevConfig ? firebaseConfigDev : firebaseConfigProd;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore
export const firestore: Firestore = getFirestore(app);

export default app;
