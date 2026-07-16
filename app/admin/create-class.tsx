import { ClassDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import {
  addDoc,
  collection,
  CollectionReference,
  serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
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

export default function CreateClassScreen() {
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedGrade = grade.trim();
    const trimmedSection = section.trim();
    const trimmedYear = academicYear.trim();

    if (!trimmedGrade || !trimmedSection || !trimmedYear) {
      Alert.alert("Missing fields", "Please fill all fields.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(
        collection(firestore, "classes") as CollectionReference<
          ClassDoc,
          ClassDoc
        >,
        {
          name: `Class ${trimmedGrade} - ${trimmedSection}`,
          grade: trimmedGrade,
          section: trimmedSection,
          academicYear: trimmedYear,
          classTeacherId: null,
          classTeacherUid: null,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      );

      Alert.alert("Success", "Class created.");
      setGrade("");
      setSection("");
      setAcademicYear("");
    } catch (error) {
      console.error("Failed to create class:", error);
      Alert.alert("Error", "Could not create class. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Create Class</Text>
        <Text style={styles.subHeading}>
          The homeroom teacher can be assigned afterwards from Manage
          Teachers.
        </Text>

        <Text style={styles.label}>Grade</Text>
        <TextInput
          value={grade}
          onChangeText={setGrade}
          placeholder="e.g. 5"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Section</Text>
        <TextInput
          value={section}
          onChangeText={setSection}
          placeholder="e.g. A"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Academic Year</Text>
        <TextInput
          value={academicYear}
          onChangeText={setAcademicYear}
          placeholder="e.g. 2026"
          style={styles.input}
          editable={!submitting}
        />

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Class</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f6f9",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
    marginBottom: 10,
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
  button: {
    marginTop: 20,
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
