import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBpTknX0aGx9RnlY_39OVsSz0k011T_1Gk",
  authDomain: "ssr-juniors.firebaseapp.com",
  projectId: "ssr-juniors",
  storageBucket: "ssr-juniors.firebasestorage.app",
  messagingSenderId: "198371863429",
  appId: "1:198371863429:web:bd6cb1d9ced76fb8f472ec",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore
export const firestore: Firestore = getFirestore(app);

// Singleton-safe auth initialization
let authInstance: Auth;

if (Platform.OS === "web") {
  authInstance = getAuth(app);
  console.log("Auth init:", "web-getAuth");
} else {
  try {
    // Use RN persistence explicitly
    const { getReactNativePersistence } = require("firebase/auth");
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log("Auth init:", "rn-initializeAuth");
  } catch (e) {
    // If already initialized elsewhere, fallback to existing instance
    authInstance = getAuth(app);
    console.log("Auth init:", "rn-getAuth-fallback");
  }
}

export const auth: Auth = authInstance;

export default app;
