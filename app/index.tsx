import {
  Entypo,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const dashboardItems = [
  {
    key: "dashboard",
    label: "DASHBOARD",
    icon: (
      <MaterialCommunityIcons name="speedometer" size={48} color="#ff9800" />
    ),
  },
  {
    key: "calendar",
    label: "CALENDAR",
    icon: <MaterialIcons name="calendar-today" size={48} color="#2196f3" />,
  },
  {
    key: "attendance",
    label: "ATTENDANCE",
    icon: <FontAwesome5 name="user-check" size={48} color="#4caf50" />,
  },
  {
    key: "homework",
    label: "HOMEWORK",
    icon: <Entypo name="book" size={48} color="#e91e63" />,
  },
  {
    key: "notes",
    label: "ACADEMIC NOTES",
    icon: <MaterialCommunityIcons name="notebook" size={48} color="#ffc107" />,
  },
  {
    key: "video",
    label: "ACADEMIC VIDEO",
    icon: <Entypo name="video" size={48} color="#f44336" />,
  },
  {
    key: "syllabus",
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
    label: "CIRCULAR",
    icon: (
      <MaterialCommunityIcons
        name="file-document-box-multiple"
        size={48}
        color="#00bcd4"
      />
    ),
  },
];

export default function DashboardScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        console.log("Tapped:", item.label);
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

// export default function Index() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text>Body of index.tsx</Text>
//     </View>
//   );
// }
