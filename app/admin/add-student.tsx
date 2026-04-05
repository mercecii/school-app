import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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
  const [fullname, setFullname] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [gender, setGender] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedFullname = fullname.trim();
    const trimmedClass = studentClass.trim();
    const trimmedSection = section.trim();
    const trimmedRollNumber = rollNumber.trim();
    const trimmedGender = gender.trim();
    const trimmedParentName = parentName.trim();
    const trimmedParentEmail = parentEmail.trim();
    const trimmedPhone = parentPhone.trim();

    if (
      !trimmedFullname ||
      !trimmedClass ||
      !trimmedSection ||
      !trimmedRollNumber ||
      !trimmedGender ||
      !trimmedParentName ||
      !trimmedParentEmail ||
      !trimmedPhone
    ) {
      Alert.alert("Missing fields", "Please fill all fields.");
      return;
    }

    try {
      setSubmitting(true);

      await addDoc(collection(firestore, "students"), {
        fullname: trimmedFullname,
        class: trimmedClass,
        section: trimmedSection,
        rollNumber: trimmedRollNumber,
        gender: trimmedGender,
        parentName: trimmedParentName,
        parentEmail: trimmedParentEmail,
        parentPhone: trimmedPhone,
        role: "student",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("Student record created successfully");
      Alert.alert("Success", "Student record added.");
      setFullname("");
      setStudentClass("");
      setSection("");
      setRollNumber("");
      setGender("");
      setParentName("");
      setParentEmail("");
      setParentPhone("");
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

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={fullname}
          onChangeText={setFullname}
          placeholder="Enter student name"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Class</Text>
        <TextInput
          value={studentClass}
          onChangeText={setStudentClass}
          placeholder="Enter class"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Section</Text>
        <TextInput
          value={section}
          onChangeText={setSection}
          placeholder="Enter section"
          style={styles.input}
          editable={!submitting}
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

        <Text style={styles.label}>Parent Name</Text>
        <TextInput
          value={parentName}
          onChangeText={setParentName}
          placeholder="Enter parent name"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Parent Email</Text>
        <TextInput
          value={parentEmail}
          onChangeText={setParentEmail}
          placeholder="Enter parent email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Parent Phone</Text>
        <TextInput
          value={parentPhone}
          onChangeText={setParentPhone}
          placeholder="Enter parent phone"
          keyboardType="phone-pad"
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
    marginBottom: 16,
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
