import { Slot } from "expo-router";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  return <Slot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f6fa",
  },
});
