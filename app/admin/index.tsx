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
  {
    key: "create-teacher",
    route: "create-teacher",
    label: "ADD TEACHER",
    icon: (
      <MaterialCommunityIcons
        name="account-tie-outline"
        size={48}
        color="#0d9488"
      />
    ),
  },
  {
    key: "manage-teachers",
    route: "manage-teachers",
    label: "MANAGE TEACHERS",
    icon: (
      <MaterialCommunityIcons
        name="account-tie-hat-outline"
        size={48}
        color="#0f766e"
      />
    ),
  },
  {
    key: "create-parent",
    route: "create-parent",
    label: "ADD PARENT",
    icon: (
      <MaterialCommunityIcons
        name="account-heart-outline"
        size={48}
        color="#db2777"
      />
    ),
  },
  {
    key: "manage-parents",
    route: "manage-parents",
    label: "MANAGE PARENTS",
    icon: (
      <MaterialCommunityIcons
        name="account-supervisor-outline"
        size={48}
        color="#be185d"
      />
    ),
  },
  {
    key: "manage-students",
    route: "manage-students",
    label: "MANAGE STUDENTS",
    icon: (
      <MaterialCommunityIcons
        name="account-school-outline"
        size={48}
        color="#4338ca"
      />
    ),
  },
  {
    key: "create-class",
    route: "create-class",
    label: "CREATE CLASS",
    icon: (
      <MaterialCommunityIcons
        name="google-classroom"
        size={48}
        color="#ea580c"
      />
    ),
  },
  {
    key: "manage-classes",
    route: "manage-classes",
    label: "MANAGE CLASSES",
    icon: (
      <MaterialCommunityIcons
        name="clipboard-text-outline"
        size={48}
        color="#65a30d"
      />
    ),
  },
  {
    key: "create-fee-structure",
    route: "create-fee-structure",
    label: "CREATE FEE STRUCTURE",
    icon: <MaterialCommunityIcons name="cash-plus" size={48} color="#059669" />,
  },
  {
    key: "manage-fees",
    route: "manage-fees",
    label: "MANAGE FEES",
    icon: (
      <MaterialCommunityIcons name="cash-multiple" size={48} color="#16a34a" />
    ),
  },
  {
    key: "create-notification",
    route: "create-notification",
    label: "CREATE NOTIFICATIONS",
    icon: (
      <MaterialCommunityIcons name="bell-outline" size={48} color="#9c27b0" />
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
