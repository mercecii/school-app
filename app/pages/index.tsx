import {
  Entypo,
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
import { useUser } from "../(context)/UserContext";

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
    key: "calendar",
    route: "calendar",
    label: "CALENDAR",
    icon: <MaterialIcons name="calendar-today" size={48} color="#2196f3" />,
  },
  {
    key: "attendance",
    route: "attendance",
    label: "ATTENDANCE",
    icon: <FontAwesome5 name="user-check" size={48} color="#4caf50" />,
  },
  {
    key: "homework",
    route: "homework",
    label: "HOMEWORK",
    icon: <Entypo name="book" size={48} color="#e91e63" />,
  },
  {
    key: "notes",
    route: "notes",
    label: "ACADEMIC NOTES",
    icon: <MaterialCommunityIcons name="notebook" size={48} color="#ffc107" />,
  },
  {
    key: "video",
    route: "video",
    label: "ACADEMIC VIDEO",
    icon: <Entypo name="video" size={48} color="#f44336" />,
  },
  {
    key: "syllabus",
    route: "syllabus",
    label: "SYLLABUS",
    icon: (
      <MaterialCommunityIcons
        name="file-document-edit"
        size={48}
        color="#3f51b5"
      />
    ),
  },
  {
    key: "circular",
    route: "circular",
    label: "CIRCULAR",
    icon: (
      <MaterialCommunityIcons name="bulletin-board" size={48} color="#00bcd4" />
    ),
  },
  {
    key: "previous-year-question-paper",
    route: "previous-year-question-paper",
    label: "PREVIOUS YEAR QUESTION PAPER",
    icon: (
      <MaterialCommunityIcons
        name="file-document-outline"
        size={48}
        color="#009688"
      />
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
  {
    key: "news-gallery",
    route: "news-gallery",
    label: "NEWS & GALLERY",
    icon: (
      <MaterialCommunityIcons
        name="image-multiple-outline"
        size={48}
        color="#795548"
      />
    ),
  },
  {
    key: "events",
    route: "events",
    label: "EVENTS",
    icon: (
      <MaterialCommunityIcons name="calendar-star" size={48} color="#673ab7" />
    ),
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
    key: "download",
    route: "download",
    label: "DOWNLOAD",
    icon: (
      <MaterialCommunityIcons
        name="download-outline"
        size={48}
        color="#cddc39"
      />
    ),
  },
  {
    key: "daily-timetable",
    route: "daily-timetable",
    label: "DAILY TIMETABLE",
    icon: (
      <MaterialCommunityIcons name="clock-outline" size={48} color="#e91e63" />
    ),
  },
  {
    key: "calendar-remove",
    route: "calendar-remove",
    label: "CALENDAR REMOVE",
    icon: (
      <MaterialCommunityIcons
        name="calendar-remove-outline"
        size={48}
        color="#9e9e9e"
      />
    ),
  },
  {
    key: "events",
    route: "events",
    label: "EVENTS",
    icon: (
      <MaterialCommunityIcons name="calendar-star" size={48} color="#673ab7" />
    ),
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
    key: "syllabus",
    route: "syllabus",
    label: "SYLLABUS",
    icon: (
      <MaterialCommunityIcons
        name="file-document-edit"
        size={48}
        color="#3f51b5"
      />
    ),
  },
];

export default function StudentHomePage() {
  const user = useUser();
  console.log("eee: app/pages/index.tsx | user from context:", user);
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        console.log("Tapped:", item.label);
        // @ts-ignore
        router.push(`/pages/${item.route}`);
      }}
      style={styles.card}
    >
      {item.icon}
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );
  console.log("DashboardScreen rendered");

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
