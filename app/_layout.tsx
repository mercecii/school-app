import { Redirect, Slot, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { auth, db } from "./firebaseSetup/firebaseSetup";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("Auth state changed, user:", u);
      if (!u) {
        dispatch(setUser(null));
        dispatch(setRole(null));
        setLoading(false);
        return;
      }

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
      dispatch(setUser(u));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
