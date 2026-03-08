import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpTknX0aGx9RnlY_39OVsSz0k011T_1Gk",
  authDomain: "ssr-juniors.firebaseapp.com",
  projectId: "ssr-juniors",
  storageBucket: "ssr-juniors.firebasestorage.app",
  messagingSenderId: "198371863429",
  appId: "1:198371863429:web:bd6cb1d9ced76fb8f472ec",
};

// const app = initializeApp(firebaseConfig);

// let auth;

// if (Platform.OS === "web") {
//   // Web uses default browser persistence automatically
//   auth = getAuth(app);
// } else {
//   // React Native needs explicit AsyncStorage persistence
//   // ✅ Proper React Native auth with persistence
//   const { getReactNativePersistence } = require("firebase/auth/react-native");
//   const persistence = getReactNativePersistence(AsyncStorage);
//   console.log("persistence = ", persistence);

//   auth = initializeAuth(app, {
//     persistence,
//   });
//   // Auth emulator removed for production
// }

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore
export const firestore: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

export default app;
