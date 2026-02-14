import { useEffect } from "react";
import { Text, View } from "react-native";
import { auth } from "./firebase/firebase";

export default function RootLayout() {
  useEffect(() => {
    console.log("RootLayout mounted");
    return () => {
      console.log("RootLayout unmounted");
    };
  }, []);
  useEffect(() => {
    console.log("Firebase App:", auth.app.name);
  }, []);
  // const [user, setUser] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (u) => {
  //     debugger;
  //     console.log("Auth state changed:", u);
  //     setUser(u);
  //     setLoading(false);
  //   });

  //    return unsubscribe;
  // }, []);

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
    <Text style={{ flex: 1, textAlign: "center", marginTop: 50 }}>
      Welcome to the app!
    </Text>
  );
}

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
