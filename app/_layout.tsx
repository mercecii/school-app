import { Slot, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { auth } from "../firebase/firebase";

export default function RootLayout() {
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
        router.replace("/about"); // Redirect to pages layout
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
      <Slot />
      {/* This will render the child routes (e.g., /home, /homework) */}
      {/* </Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f6fa",
  },
});

// Custom header component for subtitle support
function HeaderWithSubtitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={{ padding: 16, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>{title}</Text>
      <Text style={{ fontSize: 14, color: "#666" }}>{subtitle}</Text>
    </View>
  );
}
