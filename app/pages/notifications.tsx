import { getAuth } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseSetup/firebaseSetup";

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const auth = getAuth();
  const currentUser = auth.currentUser;

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

  const unreadNotifications = notifications.filter(
    (n) => !n.readBy?.includes(currentUser?.uid),
  );

  const readNotifications = notifications.filter((n) =>
    n.readBy?.includes(currentUser?.uid),
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Notifications</Text>

      {/* UNREAD SECTION */}
      <Text style={styles.sectionTitle}>Unread</Text>

      {unreadNotifications.length === 0 && (
        <Text style={styles.emptyText}>No unread notifications.</Text>
      )}

      {unreadNotifications.map((n) => (
        <View key={n.id} style={[styles.card, styles.unreadCard]}>
          <Text style={styles.title}>{n.title}</Text>
          <Text style={styles.message}>{n.message}</Text>

          <TouchableOpacity
            style={styles.markButton}
            onPress={async () => {
              if (!currentUser) return;

              await updateDoc(doc(db, "notifications", n.id), {
                readBy: arrayUnion(currentUser.uid),
              });
            }}
          >
            <Text style={styles.markButtonText}>Mark as Read</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* READ SECTION */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Read</Text>

      {readNotifications.length === 0 && (
        <Text style={styles.emptyText}>No read notifications yet.</Text>
      )}

      {readNotifications.map((n) => (
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
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  markButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  markButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#374151",
  },
});
