import { TeacherWithStringDate } from "@/store/slices/auth.type";
import { AppState, useAppSelector } from "@/store/store";
import { StyleSheet, Text, View } from "react-native";

export default function TeacherProfile() {
  const teacher = useAppSelector(
    (state: AppState) => state.auth.userInfo,
  ) as TeacherWithStringDate;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{teacher?.fullName}</Text>
      <Text style={styles.meta}>{teacher?.phone}</Text>
      {teacher?.email ? <Text style={styles.meta}>{teacher.email}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  name: { fontSize: 20, fontWeight: "700", color: "#111827" },
  meta: { fontSize: 14, color: "#6b7280", marginTop: 4 },
});
