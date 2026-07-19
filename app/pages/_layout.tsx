import CustomHeader from "@/components/CustomHeader";
import HeaderRight from "@/components/HeaderRight";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserContext } from "../../context/UserContext";
import { auth } from "../../utils/authClient";

// Only screens with real v2 data behind them are in the drawer — see the
// comment in app/pages/index.tsx for what's intentionally left unlinked.
export default function RootLayoutLevel2() {
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
            name="dashboard"
            options={{
              title: "Dashboard",
              drawerIcon: ({ color, size }) => (
                <Icon name="view-dashboard-outline" color={color} size={size} />
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
            name="fees"
            options={{
              title: "Fees",
              drawerIcon: ({ color, size }) => (
                <Icon name="cash-multiple" color={color} size={size} />
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
            name="calendar"
            options={{
              title: "Calendar",
              drawerIcon: ({ color, size }) => (
                <Icon name="calendar-month-outline" color={color} size={size} />
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
