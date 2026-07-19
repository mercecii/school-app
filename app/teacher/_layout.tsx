import CustomHeader from "@/components/CustomHeader";
import HeaderRight from "@/components/HeaderRight";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserContext } from "../../context/UserContext";
import { auth } from "../../utils/authClient";

export default function TeacherLayout() {
  return (
    <UserContext.Provider value={auth.currentUser}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Drawer
          screenOptions={{
            headerTitle: CustomHeader,
            headerRight: () => <HeaderRight canGoBack={false} />,
            headerTitleAlign: "center",
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
            name="mark-attendance"
            options={{
              title: "Mark Attendance",
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
            name="post-announcement"
            options={{
              title: "Post Announcement",
              drawerIcon: ({ color, size }) => (
                <Icon name="bullhorn-outline" color={color} size={size} />
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
        </Drawer>
      </GestureHandlerRootView>
    </UserContext.Provider>
  );
}
