import SelectField from "@/components/SelectField";
import { StudentDoc } from "@/firebaseSetup/fireBase.types";
import { useClassOptions } from "@/utils/useClasses";
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
import { firestore } from "../../firebaseSetup/firebaseSetup";

export default function AddStudentScreen() {
  const classOptions = useClassOptions();
  const [fullName, setFullName] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [rollNumber, setRollNumber] = useState("");
  const [gender, setGender] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedFullName = fullName.trim();
    const trimmedRollNumber = rollNumber.trim();
    const trimmedGender = gender.trim();

    if (!trimmedFullName || !classId || !trimmedRollNumber || !trimmedGender) {
      Alert.alert("Missing fields", "Please fill all fields, including class.");
      return;
    }

    try {
      setSubmitting(true);

      await addDoc(
        collection(firestore, "students") as CollectionReference<
          StudentDoc,
          StudentDoc
        >,
        {
          fullName: trimmedFullName,
          classId,
          rollNumber: trimmedRollNumber,
          gender: trimmedGender,
          isActive: true,
          parentUids: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      );

      console.log("Student record created successfully");
      Alert.alert(
        "Success",
        "Student record added. Link a parent from Manage Parents to give them access.",
      );
      setFullName("");
      setClassId(null);
      setRollNumber("");
      setGender("");
    } catch (error) {
      console.error("Failed to add student:", error);
      Alert.alert("Error", "Could not add student. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Add Student</Text>
        <Text style={styles.subHeading}>
          Parent contact info is managed separately under Manage Parents —
          link this student there once created.
        </Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter student name"
          style={styles.input}
          editable={!submitting}
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
          placeholder="Enter roll number"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Gender</Text>
        <TextInput
          value={gender}
          onChangeText={setGender}
          placeholder="Enter gender"
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
            <Text style={styles.buttonText}>Submit</Text>
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
