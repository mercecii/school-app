import { AttendanceDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import { AppState, useAppSelector } from "@/store/store";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

const STATUS_COLORS: Record<string, string> = {
  present: "#1E88E5",
  absent: "#E53935",
  late: "#FDD835",
  excused: "#9E9E9E",
};

export default function Attendance() {
  const { children, selectedChildId } = useAppSelector(
    (state: AppState) => state.auth,
  );
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const [records, setRecords] = useState<AttendanceDoc[]>([]);

  useEffect(() => {
    if (!selectedChildId) {
      setRecords([]);
      return;
    }
    const q = query(
      collection(firestore, "attendance"),
      where("studentId", "==", selectedChildId),
      orderBy("date", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => d.data() as AttendanceDoc));
    });
    return unsubscribe;
  }, [selectedChildId]);

  const markedDates = records.reduce<Record<string, any>>((acc, r) => {
    acc[r.date] = { selected: true, selectedColor: STATUS_COLORS[r.status] };
    return acc;
  }, {});

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthRecords = records.filter((r) => r.date.startsWith(currentMonth));
  const presentCount = thisMonthRecords.filter((r) => r.status === "present").length;
  const absentCount = thisMonthRecords.filter((r) => r.status === "absent").length;

  if (!selectedChild) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Select a child from Dashboard first.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Calendar
          markedDates={markedDates}
          theme={{ todayTextColor: "#2196F3", arrowColor: "#2196F3" }}
        />

        <View style={styles.legendContainer}>
          <Legend color="#1E88E5" label="Present" />
          <Legend color="#E53935" label="Absent" />
          <Legend color="#FDD835" label="Late" />
          <Legend color="#9E9E9E" label="Excused" />
        </View>

        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>
            {selectedChild.fullName} — % Attendance
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.monthTitle}>
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </Text>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Marked Days</Text>
              <Text style={styles.blueValue}>{thisMonthRecords.length}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.column}>
              <Text style={styles.label}>Present</Text>
              <Text style={styles.blueValue}>{presentCount}</Text>
            </View>
          </View>

          <View style={styles.absentContainer}>
            <Text style={styles.label}>Absent</Text>
            <Text style={styles.redValue}>{absentCount}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 13 },
  summaryHeader: {
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  summaryHeaderText: { color: "#fff", fontWeight: "bold" },
  summaryCard: { padding: 20 },
  monthTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: "#E53935",
    fontWeight: "600",
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  column: { flex: 1, alignItems: "center" },
  divider: { width: 1, height: 50, backgroundColor: "#ccc" },
  label: { fontSize: 16, marginBottom: 5 },
  blueValue: { fontSize: 28, color: "#1E88E5", fontWeight: "bold" },
  redValue: { fontSize: 28, color: "#E53935", fontWeight: "bold" },
  absentContainer: { marginTop: 25, alignItems: "center" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#6b7280" },
});
