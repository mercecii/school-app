import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Privacy = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>KPS School App Privacy Policy</Text>
      <Text style={styles.text}>
        We collect limited information such as student name, class, and
        attendance data to provide school services. Data is used only for
        communication between school and parents. We do not sell or share data
        with third parties. For queries, contact: d9572712747@gmail.com or
        +919572712747
      </Text>
    </View>
  );
};

export default Privacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
});
