import { NotificationDoc } from "@/firebaseSetup/fireBase.types";
import { ParentWithStringDate } from "@/store/slices/auth.type";
import { AppState, useAppSelector } from "@/store/store";
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { firestore } from "../../firebaseSetup/firebaseSetup";
import { auth } from "../../utils/authClient";

type NotifRow = { id: string; data: NotificationDoc };

/**
 * A parent's feed is "school-wide ∪ my class(es) ∪ individual-to-me" — not
 * expressible as one Firestore query, so it's three listeners merged
 * client-side. See docs/decisions.md / docs/firestore-schema.md.
 */
export default function Notifications() {
  const parent = useAppSelector(
    (state: AppState) => state.auth.userInfo,
  ) as ParentWithStringDate;
  const { children } = useAppSelector((state: AppState) => state.auth);
  const currentUser = auth.currentUser;

  const classIds = useMemo(
    () => Array.from(new Set(children.map((c) => c.classId).filter(Boolean))),
    [children],
  );

  const [schoolNotifs, setSchoolNotifs] = useState<NotifRow[]>([]);
  const [classNotifs, setClassNotifs] = useState<NotifRow[]>([]);
  const [individualNotifs, setIndividualNotifs] = useState<NotifRow[]>([]);

  useEffect(() => {
    const q = query(
      collection(firestore, "notifications"),
      where("targetType", "==", "school"),
    );
    return onSnapshot(q, (snap) =>
      setSchoolNotifs(
        snap.docs.map((d) => ({ id: d.id, data: d.data() as NotificationDoc })),
      ),
    );
  }, []);

  useEffect(() => {
    if (classIds.length === 0) {
      setClassNotifs([]);
      return;
    }
    const q = query(
      collection(firestore, "notifications"),
      where("targetType", "==", "class"),
      where("targetValue", "in", classIds.slice(0, 30)),
    );
    return onSnapshot(q, (snap) =>
      setClassNotifs(
        snap.docs.map((d) => ({ id: d.id, data: d.data() as NotificationDoc })),
      ),
    );
  }, [classIds]);

  useEffect(() => {
    if (!parent?.id) {
      setIndividualNotifs([]);
      return;
    }
    const q = query(
      collection(firestore, "notifications"),
      where("targetType", "==", "individual"),
      where("targetValue", "==", parent.id),
    );
    return onSnapshot(q, (snap) =>
      setIndividualNotifs(
        snap.docs.map((d) => ({ id: d.id, data: d.data() as NotificationDoc })),
      ),
    );
  }, [parent?.id]);

  const notifications = useMemo(() => {
    const merged = new Map<string, NotifRow>();
    [...schoolNotifs, ...classNotifs, ...individualNotifs].forEach((n) =>
      merged.set(n.id, n),
    );
    return Array.from(merged.values()).sort((a, b) => {
      const aTime = (a.data.createdAt as any)?.toMillis?.() ?? 0;
      const bTime = (b.data.createdAt as any)?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
  }, [schoolNotifs, classNotifs, individualNotifs]);

  const unread = notifications.filter(
    (n) => !n.data.readBy?.includes(currentUser?.uid ?? ""),
  );
  const read = notifications.filter((n) =>
    n.data.readBy?.includes(currentUser?.uid ?? ""),
  );

  const markRead = async (id: string) => {
    if (!currentUser) return;
    await updateDoc(doc(firestore, "notifications", id), {
      readBy: arrayUnion(currentUser.uid),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Notifications</Text>

      <Text style={styles.sectionTitle}>Unread</Text>
      {unread.length === 0 && (
        <Text style={styles.emptyText}>No unread notifications.</Text>
      )}
      {unread.map((n) => (
        <View key={n.id} style={[styles.card, styles.unreadCard]}>
          <Text style={styles.title}>{n.data.title}</Text>
          <Text style={styles.message}>{n.data.message}</Text>
          <TouchableOpacity
            style={styles.markButton}
            onPress={() => markRead(n.id)}
          >
            <Text style={styles.markButtonText}>Mark as Read</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Read</Text>
      {read.length === 0 && (
        <Text style={styles.emptyText}>No read notifications yet.</Text>
      )}
      {read.map((n) => (
        <View key={n.id} style={styles.card}>
          <Text style={styles.title}>{n.data.title}</Text>
          <Text style={styles.message}>{n.data.message}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f4f6f9", flexGrow: 1 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#1f2937" },
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
  unreadCard: { borderLeftWidth: 4, borderLeftColor: "#2563eb" },
  markButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  markButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#111827" },
  message: { fontSize: 14, color: "#4b5563", lineHeight: 20 },
  emptyText: { color: "#6b7280", fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: "#374151" },
});
