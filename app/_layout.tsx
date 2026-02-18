import {
  addNotificationResponseReceivedListener,
  getLastNotificationResponse,
} from "expo-notifications";
import { Redirect, Slot, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { auth, db } from "../firebaseSetup/firebaseSetup";
import { setRole, setUser } from "./store/slices/authSlice";
import { AppState, store } from "./store/store";

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

      const adminDoc = await getDoc(doc(db, "admins", uid));
      console.log("Admin doc:", adminDoc);
      if (adminDoc.exists()) {
        dispatch(setRole("admin"));
        const temp = {
          ...adminDoc.data(),
          updatedAt: adminDoc.data().updatedAt?.toDate().toISOString(),
          createdAt: adminDoc.data().createdAt?.toDate().toISOString(),
        };
        dispatch(setUser(temp));
        setLoading(false);
        return;
      }
      // USER SET
      // SETTING UP USER'S COMPLETE PROFILE IN LOCAL REDUX
      const studentDoc = await getDoc(doc(db, "students", uid));
      console.log("Student doc:", studentDoc);
      if (studentDoc.exists()) {
        dispatch(setRole("student"));
        const temp = {
          ...studentDoc.data(),
          updatedAt: studentDoc.data().updatedAt?.toDate().toISOString(),
          createdAt: studentDoc.data().createdAt?.toDate().toISOString(),
        };
        dispatch(setUser(temp));
        setLoading(false);
        return;
      }
      // DEFAULT HANDLING FOR ADMIN
      dispatch(setUser(u));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return; // wait until auth + layout is ready

    const subscription = addNotificationResponseReceivedListener((response) => {
      handleNotification(response);
    });

    const checkInitial = async () => {
      const response = await getLastNotificationResponse();
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
      await updateDoc(doc(db, "notifications", id), {
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
    return <Redirect href="/pages/dashboard" />;
  }

  return <Slot />;
}
