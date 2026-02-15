import { Slot } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { auth } from "./firebaseSetup/firebaseSetup";

export default function RootLayout() {
  console.log("eee: app/_layout.tsx");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u?.uid) {
        setUser(u);
      } else {
        setUser(null);
      }
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

  // Otherwise just render the route

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
