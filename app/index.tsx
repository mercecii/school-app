import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { auth } from "./firebaseSetup/firebaseSetup";

const Index = () => {
  const router = useRouter();
  useEffect(() => {
    console.log("RootLayout mounted");
    return () => {
      console.log("RootLayout unmounted");
    };
  }, []);
  useEffect(() => {
    console.log("Firebase Auth:", auth);
  }, []);
  // const [user, setUser] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      debugger;
      console.log("Auth state changed:", u?.email);

      if (u?.email) {
        console.log("User is authenticated, redirecting to /pages");
        router.replace("/pages"); // Redirect to pages layout
      } else {
        console.log("No authenticated user, redirecting to /login");
        router.replace("/login"); // Redirect to login page
      }
      // setLoading(false);
    });

    return unsubscribe;
  }, []);

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center" }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  // if (!user) {
  //   return <Redirect href="/login" />;
  // }

  return (
    <View style={styles.container}>
      {/* <Text style={{ flex: 1, textAlign: "center", marginTop: 50 }}>
          <div style={{ color: "#000", border: "1px solid #ccc" }}>
            Welcome to the app!
          </div> */}
      <Text>Hi</Text>
      {/* This will render the child routes (e.g., /home, /homework) */}
      {/* </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
  },
});

export default Index;
