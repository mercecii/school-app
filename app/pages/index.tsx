import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Only screens with real v2 data behind them are linked here. Several
// pre-existing placeholder screens (homework, notes, video, syllabus,
// circular, apply-leave, daily-timetable, download, news-gallery,
// previous-year-question-paper) still exist under app/pages/ but were out
// of scope for the roles/attendance/fees/notifications rebuild — left
// untouched, just not exposed as if they were live features yet.
const dashboardItems = [
  {
    key: "dashboard",
    route: "dashboard",
    label: "DASHBOARD",
    icon: (
      <MaterialCommunityIcons name="speedometer" size={48} color="#ff9800" />
    ),
  },
  {
    key: "attendance",
    route: "attendance",
    label: "ATTENDANCE",
    icon: <FontAwesome5 name="user-check" size={48} color="#4caf50" />,
  },
  {
    key: "fees",
    route: "fees",
    label: "FEES",
    icon: (
      <MaterialCommunityIcons name="cash-multiple" size={48} color="#8bc34a" />
    ),
  },
  {
    key: "notifications",
    route: "notifications",
    label: "NOTIFICATIONS",
    icon: (
      <MaterialCommunityIcons name="bell-outline" size={48} color="#9c27b0" />
    ),
  },
  {
    key: "calendar",
    route: "calendar",
    label: "CALENDAR",
    icon: <MaterialIcons name="calendar-today" size={48} color="#2196f3" />,
  },
  {
    key: "profile",
    route: "profile",
    label: "PROFILE",
    icon: (
      <MaterialCommunityIcons
        name="account-outline"
        size={48}
        color="#607d8b"
      />
    ),
  },
];

export default function ParentHomePage() {
  const renderItem = ({ item }: { item: (typeof dashboardItems)[number] }) => (
    <TouchableOpacity
      onPress={() => router.push(`./pages/${item.route}`)}
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
