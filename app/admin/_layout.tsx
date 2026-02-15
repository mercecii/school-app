import { Slot } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const AdminLayout = () => {
  console.log("eee: app/admin/_layout.tsx");
  return (
    <View>
      <Slot />
    </View>
  );
};

export default AdminLayout;

const styles = StyleSheet.create({});
