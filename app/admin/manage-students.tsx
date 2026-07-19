import SelectField from "@/components/SelectField";
import { StudentDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import { useClassOptions } from "@/utils/useClasses";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type StudentRow = { id: string; data: StudentDoc };

export default function ManageStudentsScreen() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const classOptions = useClassOptions();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(firestore, "students"), orderBy("fullName")),
      (snap) =>
        setStudents(
          snap.docs.map((d) => ({ id: d.id, data: d.data() as StudentDoc })),
        ),
    );
    return unsubscribe;
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Manage Students</Text>
      <Text style={styles.subHeading}>
        Fix a name, move a student to a different class, or turn a student
        off (e.g. they&apos;ve left the school).
      </Text>

      {students.map((s) => (
        <StudentCard key={s.id} row={s} classOptions={classOptions} />
      ))}

      {students.length === 0 && (
        <Text style={styles.emptyText}>No students yet.</Text>
      )}
    </ScrollView>
  );
}

function StudentCard({
  row,
  classOptions,
}: {
  row: StudentRow;
  classOptions: { id: string; label: string }[];
}) {
  const [fullName, setFullName] = useState(row.data.fullName);
  const [classId, setClassId] = useState<string | null>(row.data.classId);
  const [rollNumber, setRollNumber] = useState(row.data.rollNumber);
  const [gender, setGender] = useState(row.data.gender);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    const trimmedRoll = rollNumber.trim();
    const trimmedGender = gender.trim();

    if (!trimmedName || !classId || !trimmedRoll || !trimmedGender) {
      Alert.alert("Missing fields", "Please fill all fields, including class.");
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(firestore, "students", row.id), {
        fullName: trimmedName,
        classId,
        rollNumber: trimmedRoll,
        gender: trimmedGender,
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Saved", "Student record updated.");
    } catch (error) {
      console.error("Failed to update student:", error);
      Alert.alert("Error", "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (value: boolean) => {
    try {
      await updateDoc(doc(firestore, "students", row.id), {
        isActive: value,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to toggle student active state:", error);
      Alert.alert("Error", "Could not update status. Please try again.");
    }
  };

  return (
    <View style={[styles.card, !row.data.isActive && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{row.data.fullName}</Text>
        <View style={styles.activeRow}>
          <Text style={styles.activeLabel}>
            {row.data.isActive ? "Active" : "Inactive"}
          </Text>
          <Switch value={row.data.isActive} onValueChange={handleToggleActive} />
        </View>
      </View>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <SelectField
        label="Class"
        placeholder="Select class"
        options={classOptions.map((c) => ({ label: c.label, value: c.id }))}
        value={classId}
        onChange={setClassId}
      />

      <Text style={styles.label}>Roll Number</Text>
      <TextInput
        value={rollNumber}
        onChangeText={setRollNumber}
        style={styles.input}
      />

      <Text style={styles.label}>Gender</Text>
      <TextInput value={gender} onChangeText={setGender} style={styles.input} />

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving…" : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 6,
    color: "#1f2937",
  },
  subHeading: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flexShrink: 1,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeLabel: {
    fontSize: 12,
    color: "#6b7280",
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
  saveButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    color: "#6b7280",
    marginTop: 20,
    textAlign: "center",
  },
});
