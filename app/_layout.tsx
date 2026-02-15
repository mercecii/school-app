import { Redirect, Slot, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { auth, db } from "./firebaseSetup/firebaseSetup";

export default function RootLayout() {
  console.log("eee: app/_layout.tsx");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }

      const uid = u.uid;

      // Check if admin
      const adminDoc = await getDoc(doc(db, "admins", uid));
      if (adminDoc.exists()) {
        setUser({ ...u, role: "admin" });
        setLoading(false);
        return;
      }

      // Check if student
      const studentDoc = await getDoc(doc(db, "students", uid));
      if (studentDoc.exists()) {
        setUser({ ...u, role: "student" });
        setLoading(false);
        return;
      }

      setUser(null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  console.log("Segments in RootLayout:", segments);
  console.log("Current user in RootLayout:", user);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Otherwise just render the route
  if (!user && segments[0] !== "(auth)") {
    console.log("eee: app/_layout.tsx no user, redirecting to login");
    return <Redirect href="/(auth)/login" />;
  }
  if (user && segments[0] === "(auth)" && user.role === "admin") {
    return <Redirect href="/admin" />;
  }
  if (user && segments[0] === "(auth)" && user.role === "student") {
    console.log("redirecting from app/_layout.tsx");
    return <Redirect href="/pages/dashboard" />;
  }
  if (user) {
    console.log("eee: app/_layout.tsx rendering Slot with user:", user);
    return (
      <View style={{ flex: 1 }}>
        <Text>Welcome {user.email}</Text>
        <Slot />
      </View>
    );
  }
  return <Slot />;
}
