import SelectField from "@/components/SelectField";
import { ClassDoc, TeacherDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type ClassRow = { id: string; data: ClassDoc };
type TeacherRow = { id: string; data: TeacherDoc };

export default function ManageClassesScreen() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);

  useEffect(() => {
    const unsubClasses = onSnapshot(
      query(collection(firestore, "classes"), where("isActive", "==", true)),
      (snap) =>
        setClasses(
          snap.docs
            .map((d) => ({ id: d.id, data: d.data() as ClassDoc }))
            .sort((a, b) => a.data.name.localeCompare(b.data.name)),
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

  const handleAssign = async (classId: string, teacherId: string | null) => {
    try {
      await updateDoc(doc(firestore, "classes", classId), {
        classTeacherId: teacherId,
        // classTeacherUid is derived server-side by syncTeacherAuthz once
        // that teacher has adopted — not set here.
      });
    } catch (error) {
      console.error("Failed to assign homeroom teacher:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Manage Classes</Text>
      <Text style={styles.subHeading}>
        Assign each class&apos;s homeroom teacher. If the teacher
        hasn&apos;t logged in yet, the assignment still saves — access
        syncs automatically once they do.
      </Text>

      {classes.map((c) => (
        <View key={c.id} style={styles.card}>
          <Text style={styles.className}>{c.data.name}</Text>
          <SelectField
            label="Homeroom Teacher"
            placeholder="Unassigned"
            options={teacherOptions}
            value={c.data.classTeacherId}
            onChange={(teacherId) => handleAssign(c.id, teacherId)}
          />
        </View>
      ))}

      {classes.length === 0 && (
        <Text style={styles.emptyText}>No classes yet — create one first.</Text>
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
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  className: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  emptyText: {
    color: "#6b7280",
    marginTop: 20,
    textAlign: "center",
  },
});
