import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../../firebaseSetup/firebaseSetup";

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Notifications</Text>

      {notifications.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      )}

      {notifications.map((n) => (
        <View key={n.id} style={styles.card}>
          <Text style={styles.title}>{n.title}</Text>
          <Text style={styles.message}>{n.message}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f4f6f9",
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1f2937",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },
  message: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
  },
});
