import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { db } from "../firebaseSetup/firebaseSetup";

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];

      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      setNotifications(data);
    });

    return unsubscribe;
  }, []);

  return (
    <View>
      <Text>Notifications</Text>
      {notifications.map((n) => (
        <View key={n.id} style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold" }}>{n.title}</Text>
          <Text>{n.message}</Text>
        </View>
      ))}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({});
