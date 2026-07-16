import { ParentWithStringDate } from "@/store/slices/auth.type";
import { AppState, useAppSelector } from "@/store/store";
import { StyleSheet, Text, View } from "react-native";

export default function Profile() {
  const parent = useAppSelector(
    (state: AppState) => state.auth.userInfo,
  ) as ParentWithStringDate;
  const { children } = useAppSelector((state: AppState) => state.auth);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{parent?.fullName}</Text>
      <Text style={styles.meta}>{parent?.phone}</Text>
      {parent?.email ? <Text style={styles.meta}>{parent.email}</Text> : null}

      <Text style={styles.sectionTitle}>Linked Children</Text>
      {children.map((c) => (
        <Text key={c.id} style={styles.childItem}>
          {c.fullName} (Roll {c.rollNumber})
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  name: { fontSize: 20, fontWeight: "700", color: "#111827" },
  meta: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginTop: 24,
    marginBottom: 8,
  },
  childItem: { fontSize: 14, color: "#111827", marginBottom: 6 },
});
