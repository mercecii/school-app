import SelectField from "@/components/SelectField";
import { ClassDoc, TeacherDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
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

type ClassRow = { id: string; data: ClassDoc };
type TeacherRow = { id: string; data: TeacherDoc };

export default function ManageClassesScreen() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);

  useEffect(() => {
    const unsubClasses = onSnapshot(
      query(collection(firestore, "classes"), orderBy("name")),
      (snap) =>
        setClasses(
          snap.docs.map((d) => ({ id: d.id, data: d.data() as ClassDoc })),
        ),
    );
    const unsubTeachers = onSnapshot(
      query(collection(firestore, "teachers"), where("isActive", "==", true)),
      (snap) =>
        setTeachers(
          snap.docs.map((d) => ({ id: d.id, data: d.data() as TeacherDoc })),
        ),
    );
    return () => {
      unsubClasses();
      unsubTeachers();
    };
  }, []);

  const teacherOptions = teachers.map((t) => ({
    label: t.data.fullName,
    value: t.id,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Manage Classes</Text>
      <Text style={styles.subHeading}>
        Fix a class&apos;s details, assign a homeroom teacher, or turn a
        class off. If the teacher hasn&apos;t logged in yet, the assignment
        still saves — access syncs automatically once they do.
      </Text>

      {classes.map((c) => (
        <ClassCard key={c.id} row={c} teacherOptions={teacherOptions} />
      ))}

      {classes.length === 0 && (
        <Text style={styles.emptyText}>No classes yet — create one first.</Text>
      )}
    </ScrollView>
  );
}

function ClassCard({
  row,
  teacherOptions,
}: {
  row: ClassRow;
  teacherOptions: { label: string; value: string }[];
}) {
  const [grade, setGrade] = useState(row.data.grade);
  const [section, setSection] = useState(row.data.section);
  const [academicYear, setAcademicYear] = useState(row.data.academicYear);
  const [classTeacherId, setClassTeacherId] = useState<string | null>(
    row.data.classTeacherId,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedGrade = grade.trim();
    const trimmedSection = section.trim();
    const trimmedYear = academicYear.trim();

    if (!trimmedGrade || !trimmedSection || !trimmedYear) {
      Alert.alert("Missing fields", "Please fill all fields.");
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(firestore, "classes", row.id), {
        name: `Class ${trimmedGrade} - ${trimmedSection}`,
        grade: trimmedGrade,
        section: trimmedSection,
        academicYear: trimmedYear,
        classTeacherId,
        // classTeacherUid is derived server-side by syncTeacherAuthz once
        // that teacher has adopted — not set here.
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Saved", "Class updated.");
    } catch (error) {
      console.error("Failed to update class:", error);
      Alert.alert("Error", "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (value: boolean) => {
    try {
      await updateDoc(doc(firestore, "classes", row.id), {
        isActive: value,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to toggle class active state:", error);
      Alert.alert("Error", "Could not update status. Please try again.");
    }
  };

  return (
    <View style={[styles.card, !row.data.isActive && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <Text style={styles.className}>{row.data.name}</Text>
        <View style={styles.activeRow}>
          <Text style={styles.activeLabel}>
            {row.data.isActive ? "Active" : "Inactive"}
          </Text>
          <Switch value={row.data.isActive} onValueChange={handleToggleActive} />
        </View>
      </View>

      <Text style={styles.label}>Grade</Text>
      <TextInput value={grade} onChangeText={setGrade} style={styles.input} />

      <Text style={styles.label}>Section</Text>
      <TextInput value={section} onChangeText={setSection} style={styles.input} />

      <Text style={styles.label}>Academic Year</Text>
      <TextInput
        value={academicYear}
        onChangeText={setAcademicYear}
        style={styles.input}
      />

      <SelectField
        label="Homeroom Teacher"
        placeholder="Unassigned"
        options={teacherOptions}
        value={classTeacherId}
        onChange={setClassTeacherId}
      />

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
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  className: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    flexShrink: 1,
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
