import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const dashboardItems = [
  {
    key: "create-notification",
    route: "create-notification",
    label: "CREATE NOTIFICATIONS",
    icon: (
      <MaterialCommunityIcons name="bell-outline" size={48} color="#9c27b0" />
    ),
  },
  {
    key: "add-student",
    route: "add-student",
    label: "ADD STUDENT",
    icon: (
      <MaterialCommunityIcons
        name="account-plus-outline"
        size={48}
        color="#3f51b5"
      />
    ),
  },
];

export default function AdminHomePage() {
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        console.log("Tapped:", item.label);
        router.push(`./admin/${item.route}`);
      }}
      style={styles.card}
    >
      {item.icon}
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dashboardItems}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    paddingTop: 16,
  },
  grid: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    margin: 12,
    flexBasis: "42%",
    minHeight: 140,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
