import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Drawer from "expo-router/drawer";
import React, { useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomHeader from "../../components/CustomHeader";
import { UserContext } from "../../context/UserContext";
import { auth, signOut } from "../../utils/authClient";

const AdminLayout = () => {
  console.log("eee: app/admin/_layout.tsx");

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
        {/* @ts-ignore */}
        <StatusBar style="dark" />
        <Drawer
          screenOptions={{
            headerTitle: (props) => <CustomHeader {...props} />,
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
                        router.push("/admin/profile");
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
            name="profile"
            options={{
              title: "Profile",
              drawerIcon: ({ color, size }) => (
                <Icon name="account-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="add-student"
            options={{
              title: "Add Student",
              drawerIcon: ({ color, size }) => (
                <Icon name="account-plus-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="create-teacher"
            options={{
              title: "Add Teacher",
              drawerIcon: ({ color, size }) => (
                <Icon name="account-tie-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="create-parent"
            options={{
              title: "Add Parent",
              drawerIcon: ({ color, size }) => (
                <Icon name="account-heart-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="create-class"
            options={{
              title: "Create Class",
              drawerIcon: ({ color, size }) => (
                <Icon name="google-classroom" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="manage-classes"
            options={{
              title: "Manage Classes",
              drawerIcon: ({ color, size }) => (
                <Icon name="clipboard-text-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="create-fee-structure"
            options={{
              title: "Create Fee Structure",
              drawerIcon: ({ color, size }) => (
                <Icon name="cash-plus" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="manage-fees"
            options={{
              title: "Manage Fees",
              drawerIcon: ({ color, size }) => (
                <Icon name="cash-multiple" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="create-notification"
            options={{
              title: "Create Notifications",
              drawerIcon: ({ color, size }) => (
                <Icon name="bell-outline" color={color} size={size} />
              ),
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </UserContext.Provider>
  );
};

export default AdminLayout;

// const styles = StyleSheet.create({});
