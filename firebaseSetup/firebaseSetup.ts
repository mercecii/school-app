import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
// @ts-ignore
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpTknX0aGx9RnlY_39OVsSz0k011T_1Gk",
  authDomain: "ssr-juniors.firebaseapp.com",
  projectId: "ssr-juniors",
  storageBucket: "ssr-juniors.firebasestorage.app",
  messagingSenderId: "198371863429",
  appId: "1:198371863429:web:bd6cb1d9ced76fb8f472ec",
};

const app = initializeApp(firebaseConfig);

// ✅ Proper React Native auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
// Auth emulator removed for production
// connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });

// Firestore
export const db = getFirestore(app);

export default app;
