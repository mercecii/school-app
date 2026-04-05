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

console.log("Firebase config loaded:", __DEV__ ? "Development" : "Production");
const firebaseConfig = __DEV__ ? firebaseConfigDev : firebaseConfigProd;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore
export const firestore: Firestore = getFirestore(app);

export default app;
