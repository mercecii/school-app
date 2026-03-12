import { auth } from "@/firebaseSetup/firebaseSetup";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface HeaderRightProps {
  tintColor?: string | undefined;
  pressColor?: string | undefined;
  pressOpacity?: number | undefined;
  canGoBack: boolean;
}

const HeaderRight = (props: HeaderRightProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const handleLogout = async () => {
    await signOut(auth);
    setMenuVisible(false);
    router.replace("/(auth)/login");
  };
  return (
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

          <TouchableOpacity style={{ padding: 10 }} onPress={handleLogout}>
            <Text style={{ color: "red" }}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HeaderRight;

const styles = StyleSheet.create({});
