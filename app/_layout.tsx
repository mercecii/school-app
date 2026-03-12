import { AdminDoc, StudentDoc } from "@/firebaseSetup/fireBase.types";
import {
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
} from "expo-notifications";
import { Redirect, Slot, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { auth, firestore } from "../firebaseSetup/firebaseSetup";
import { setRole, setUser } from "../store/slices/authSlice";
import { AppState, store } from "../store/store";

// Load fonts for web
if (Platform.OS === "web") {
  require("../public/fonts.css");
}

/**
 * Generic Firestore fetch helper
 */
async function getTypedDoc<T>(
  collectionName: string,
  id: string,
): Promise<T | null> {
  const snap = await getDoc(doc(firestore, collectionName, id));
  if (!snap.exists()) return null;

  return snap.data() as T;
}

export default function RootLayout() {
  console.log("RootLayout rendered");
  return (
    <Provider store={store}>
      <AuthGate />
    </Provider>
  );
}

function AuthGate() {
  const segments = useSegments();
  const { userInfo, role } = useSelector((state: AppState) => state.auth);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("Auth state changed, user:", u);
      if (!u) {
        dispatch(setUser(null));
        dispatch(setRole(null));
        setLoading(false);
        return;
      }

      // SETTING UP USER
      const uid = u.uid;

      const adminData = await getTypedDoc<AdminDoc>("admins", uid);
      console.log("Admin data:", adminData);

      if (adminData) {
        dispatch(setRole("admin"));
        dispatch(
          setUser({
            ...adminData,
            updatedAt: adminData.updatedAt.toString(),
            createdAt: adminData.updatedAt.toString(),
          }),
        );
        setLoading(false);
        return;
      }
      // USER SET
      // SETTING UP USER'S COMPLETE PROFILE IN LOCAL REDUX
      const studentData = await getTypedDoc<StudentDoc>("students", uid);
      console.log("Student data:", studentData);

      if (studentData) {
        dispatch(setRole("student"));
        dispatch(
          setUser({
            ...studentData,
            updatedAt: studentData.updatedAt.toString(),
            createdAt: studentData.updatedAt.toString(),
          }),
        );
        setLoading(false);
        return;
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return; // wait until auth + layout is ready

    // Web does not support getLastNotificationResponseAsync
    if (Platform.OS === "web") {
      return;
    }

    const subscription = addNotificationResponseReceivedListener((response) => {
      handleNotification(response);
    });

    const checkInitial = async () => {
      const response = await getLastNotificationResponseAsync();
      if (response) {
        handleNotification(response);
      }
    };

    checkInitial();

    return () => subscription.remove();
  }, [loading]);

  const handleNotification = async (response: any) => {
    const data = response.notification.request.content.data;
    console.log("handleNotofication: response = ", response);
    const id = data?.notificationId;

    if (id && auth.currentUser) {
      await updateDoc(doc(firestore, "notifications", id), {
        readBy: arrayUnion(auth.currentUser.uid),
      });
    }
    // Delay navigation until after layout is fully mounted
    requestAnimationFrame(() => {
      if (data?.screen === "notifications") {
        router.replace("/pages/notifications");
      }
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userInfo && segments[0] !== "(auth)") {
    console.log("Redirecting to login because user is not authenticated");
    return <Redirect href="/(auth)/login" />;
  }

  if (userInfo && segments[0] === "(auth)" && role === "admin") {
    console.log("Redirecting to admin dashboard");
    return <Redirect href="/admin" />;
  }

  if (userInfo && segments[0] === "(auth)" && role === "student") {
    console.log("Redirecting to student dashboard");
    return <Redirect href="/pages" />;
  }

  return <Slot />;
}
