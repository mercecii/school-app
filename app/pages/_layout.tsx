import { Drawer } from "expo-router/drawer";
// ...existing code...
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// @ts-ignore
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { UserContext } from "../(context)/UserContext";
import { auth } from "../../firebaseSetup/firebaseSetup";
import CustomHeader from "../components/CustomHeader";

export default function RootLayoutLevel2() {
  console.log("eee: app/pages/_layout.tsx");
  const fullname = "";
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  console.log("RootLayoutLevel2 rendered", auth.currentUser, fullname);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuVisible(false);
    router.replace("/(auth)/login");
  };

  return (
    <UserContext.Provider value={auth.currentUser}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Drawer
          screenOptions={{
            headerTitle: () => <CustomHeader />,
            headerRight: () => (
              <View style={{ marginRight: 16 }}>
                <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                  <Icon name="account-circle-outline" size={26} />
                </TouchableOpacity>

                {menuVisible && (
                  <View
                    style={{
                      position: "absolute",
                      top: 40,
                      right: 0,
                      backgroundColor: "white",
                      borderRadius: 6,
                      elevation: 5,
                      paddingVertical: 8,
                      width: 150,
                    }}
                  >
                    <TouchableOpacity
                      style={{ padding: 10 }}
                      onPress={() => {
                        setMenuVisible(false);
                        router.push("/pages/profile");
                      }}
                    >
                      <Text>My Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ padding: 10 }}
                      onPress={handleLogout}
                    >
                      <Text style={{ color: "red" }}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ),
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              title: "Home",
              drawerIcon: ({ color, size }) => (
                <Icon name="home" color={color} size={size} />
              ),
            }}
          />
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
                <Icon
                  name="clipboard-check-outline"
                  color={color}
                  size={size}
                />
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
                <Icon
                  name="calendar-remove-outline"
                  color={color}
                  size={size}
                />
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
    </UserContext.Provider>
  );
}
