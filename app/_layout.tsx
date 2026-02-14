import { Drawer } from "expo-router/drawer";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  console.log("RootLayout rendered");
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="index"
          options={{
            title: "DASHBOARD",
          }}
        />
        <Drawer.Screen name="about" options={{ title: "About Us" }} />
      </Drawer>
    </GestureHandlerRootView>
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
