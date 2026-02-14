import { Drawer } from "expo-router/drawer";
// ...existing code...
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomHeader from "../components/CustomHeader";
import { auth } from "../firebaseSetup/firebaseSetup";

export default function RootLayoutLevel2() {
  const [fullname, setFullname] = useState("");

  // useEffect(() => {
  //   const fetchFullname = async () => {
  //     if (auth.currentUser) {
  //       const uid = auth.currentUser.uid;
  //       const userDoc = doc(db, "students", uid);
  //       console.log("userDoc", userDoc);
  //       const docSnap = await getDoc(userDoc);
  //       console.log("docSnap", docSnap);
  //       if (docSnap.exists()) {
  //         setFullname(docSnap.data().fullname || "");
  //       }
  //     }
  //   };
  //   fetchFullname();
  // }, []);
  console.log("RootLayoutLevel2 rendered", auth.currentUser, fullname);
  console.log();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Drawer
        screenOptions={{
          headerTitle: () => <CustomHeader />,
        }}
      >
        <Drawer.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            drawerIcon: ({ color, size }) => (
              <Icon name="view-dashboard-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="calendar"
          options={{
            title: "Calendar",
            drawerIcon: ({ color, size }) => (
              <Icon name="calendar-month-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="attendance"
          options={{
            title: "Attendance",
            drawerIcon: ({ color, size }) => (
              <Icon name="clipboard-check-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="homework"
          options={{
            title: "Homework",
            drawerIcon: ({ color, size }) => (
              <Icon name="book-open-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="notes"
          options={{
            title: "Academic Notes",
            drawerIcon: ({ color, size }) => (
              <Icon name="note-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="video"
          options={{
            title: "Academic Video",
            drawerIcon: ({ color, size }) => (
              <Icon name="video-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="previous-year-question-paper"
          options={{
            title: "Previous Year Question Paper",
            drawerIcon: ({ color, size }) => (
              <Icon name="file-document-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="apply-leave"
          options={{
            title: "Apply Leave",
            drawerIcon: ({ color, size }) => (
              <Icon name="calendar-remove-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="daily-timetable"
          options={{
            title: "Daily Timetable",
            drawerIcon: ({ color, size }) => (
              <Icon name="clock-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="download"
          options={{
            title: "Download",
            drawerIcon: ({ color, size }) => (
              <Icon name="download-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="fees"
          options={{
            title: "Fees",
            drawerIcon: ({ color, size }) => (
              <Icon name="cash-multiple" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="news-gallery"
          options={{
            title: "News & Gallery",
            drawerIcon: ({ color, size }) => (
              <Icon name="image-multiple-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="notifications"
          options={{
            title: "Notifications",
            drawerIcon: ({ color, size }) => (
              <Icon name="bell-outline" color={color} size={size} />
            ),
          }}
        />

        <Drawer.Screen
          name="profile"
          options={{
            title: "Profile",
            drawerIcon: ({ color, size }) => (
              <Icon name="account-outline" color={color} size={size} />
            ),
          }}
        />

        <Drawer.Screen
          name="circular"
          options={{
            title: "Circular",
            drawerIcon: ({ color, size }) => (
              <Icon name="file-document-outline" color={color} size={size} />
            ),
          }}
        />

        <Drawer.Screen
          name="syllabus"
          options={{
            title: "Syllabus",
            drawerIcon: ({ color, size }) => (
              <Icon
                name="file-document-edit-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
