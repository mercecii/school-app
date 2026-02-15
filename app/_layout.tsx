import { Redirect, Slot, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth, db } from "./firebaseSetup/firebaseSetup";

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  // if user is of role admin, redirect to admin dashboard
  const getRoleAsync = async (uid: string) => {
    try {
      const studentsDoc = await getDoc(doc(db, "students", uid));
      const adminsDoc = await getDoc(doc(db, "admins", uid));
      console.log({ studentsDoc, adminsDoc });
      // return doc.data()?.role || "user";
      return adminsDoc.exists() ? (
        <Redirect href="/admin" />
      ) : (
        <Redirect href="/pages/dashboard" />
      ); // Placeholder for testing
    } catch (e) {
      console.error("Error fetching user role:", e);
      return "student"; // Default to student on error
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      u && u.uid && getRoleAsync(u.uid);
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
  console.log("Segments:", segments);
  const isInsideAuthRouteSegment = segments[0] === "(auth)";

  // If not logged in and NOT already on login → redirect to login
  if (!user && !isInsideAuthRouteSegment) {
    console.log("User not logged in, redirecting to login page.");
    return <Redirect href="/(auth)/login" />;
  }

  // If logged in and currently in auth → redirect to pages
  if (user && isInsideAuthRouteSegment) {
    console.log("User is logged in, redirecting to dashboard.");
    return <Redirect href="/pages/dashboard" />;
  }

  // Otherwise just render the route
  return <Slot />;
}
