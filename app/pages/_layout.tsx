import { Drawer } from "expo-router/drawer";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayoutLevel2() {
  console.log("RootLayoutLevel2 rendered");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen name="index" options={{ title: "Dashboard" }} />
        <Drawer.Screen name="calendar" options={{ title: "Calendar" }} />
        <Drawer.Screen name="attendance" options={{ title: "Attendance" }} />
        <Drawer.Screen name="homework" options={{ title: "Homework" }} />
        <Drawer.Screen name="notes" options={{ title: "Academic Notes" }} />
        <Drawer.Screen name="video" options={{ title: "Academic Video" }} />
        <Drawer.Screen
          name="previous-year-question-paper"
          options={{ title: "Previous Year Question Paper" }}
        />
        <Drawer.Screen name="apply-leave" options={{ title: "Apply Leave" }} />
        <Drawer.Screen
          name="daily-timetable"
          options={{ title: "Daily Timetable" }}
        />
        <Drawer.Screen name="download" options={{ title: "Download" }} />
        <Drawer.Screen name="fees" options={{ title: "Fees" }} />
        <Drawer.Screen
          name="news-gallery"
          options={{ title: "News & Gallery" }}
        />
        <Drawer.Screen name="video-page" options={{ title: "Video" }} />
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
