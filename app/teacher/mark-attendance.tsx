import SelectField from "@/components/SelectField";
import { AttendanceStatus, StudentDoc } from "@/firebaseSetup/fireBase.types";
import { TeacherWithStringDate } from "@/store/slices/auth.type";
import { AppState, useAppSelector } from "@/store/store";
import { useClassOptions } from "@/utils/useClasses";
import { auth } from "@/utils/authClient";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { firestore } from "../../firebaseSetup/firebaseSetup";

const STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];
const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "#16a34a",
  absent: "#dc2626",
  late: "#d97706",
  excused: "#6b7280",
};

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

type StudentRow = { id: string; fullName: string; rollNumber: string };

export default function MarkAttendanceScreen() {
  const teacher = useAppSelector(
    (state: AppState) => state.auth.userInfo,
  ) as TeacherWithStringDate;
  const allClasses = useClassOptions();
  const myClassOptions = allClasses.filter((c) =>
    (teacher?.classIds ?? []).includes(c.id),
  );

  const [classId, setClassId] = useState<string | null>(null);
  const [date, setDate] = useState(todayString());
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (myClassOptions.length && !classId) {
      setClassId(myClassOptions[0].id);
    }
  }, [myClassOptions, classId]);

  useEffect(() => {
    if (!classId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      const studentSnap = await getDocs(
        query(
          collection(firestore, "students"),
          where("classId", "==", classId),
          where("isActive", "==", true),
        ),
      );
      const roster: StudentRow[] = studentSnap.docs
        .map((d) => {
          const data = d.data() as StudentDoc;
          return { id: d.id, fullName: data.fullName, rollNumber: data.rollNumber };
        })
        .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }));

      const attendanceSnap = await getDocs(
        query(
          collection(firestore, "attendance"),
          where("classId", "==", classId),
          where("date", "==", date),
        ),
      );
      const existing: Record<string, AttendanceStatus> = {};
      attendanceSnap.docs.forEach((d) => {
        const data = d.data();
        existing[data.studentId] = data.status;
      });

      const initialStatuses: Record<string, AttendanceStatus> = {};
      roster.forEach((s) => {
        initialStatuses[s.id] = existing[s.id] ?? "present";
      });

      if (!cancelled) {
        setStudents(roster);
        setStatuses(initialStatuses);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [classId, date]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !classId || students.length === 0) return;

    try {
      setSubmitting(true);
      const batch = writeBatch(firestore);
      students.forEach((student) => {
        const attendanceRef = doc(firestore, "attendance", `${student.id}_${date}`);
        batch.set(attendanceRef, {
          studentId: student.id,
          classId,
          date,
          status: statuses[student.id] ?? "present",
          markedBy: uid,
          markedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      Alert.alert("Success", "Attendance saved.");
    } catch (error) {
      console.error("Failed to save attendance:", error);
      Alert.alert("Error", "Could not save attendance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Mark Attendance</Text>

      <SelectField
        label="Class"
        placeholder="Select class"
        options={myClassOptions.map((c) => ({ label: c.label, value: c.id }))}
        value={classId}
        onChange={setClassId}
      />

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput value={date} onChangeText={setDate} style={styles.input} />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      {!loading &&
        students.map((student) => (
          <View key={student.id} style={styles.studentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{student.fullName}</Text>
              <Text style={styles.studentMeta}>Roll {student.rollNumber}</Text>
            </View>
            <View style={styles.statusRow}>
              {STATUSES.map((status) => {
                const active = statuses[student.id] === status;
                return (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setStatus(student.id, status)}
                    style={[
                      styles.statusChip,
                      active && { backgroundColor: STATUS_COLORS[status] },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        active && { color: "#fff" },
                      ]}
                    >
                      {status[0].toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

      {!loading && classId && students.length === 0 && (
        <Text style={styles.emptyText}>No active students in this class.</Text>
      )}

      {students.length > 0 && (
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Attendance</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f6f9",
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
    color: "#374151",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  studentMeta: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusRow: {
    flexDirection: "row",
    gap: 6,
  },
  statusChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  emptyText: {
    color: "#6b7280",
    marginTop: 16,
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
