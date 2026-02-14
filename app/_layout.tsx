import { Redirect, Slot, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "./firebaseSetup/firebaseSetup";

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
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

  const inAuthGroup = segments[0] === "(auth)";

  // If not logged in and NOT already on login → redirect to login
  if (!user && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  // If logged in and currently in auth → redirect to pages
  if (user && inAuthGroup) {
    return <Redirect href="/pages/dashboard" />;
  }

  // Otherwise just render the route
  return <Slot />;
}
