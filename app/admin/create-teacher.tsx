import SelectField from "@/components/SelectField";
import { TeacherDoc } from "@/firebaseSetup/fireBase.types";
import { isValidE164 } from "@/utils/phoneValidation";
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

export default function CreateTeacherScreen() {
  const classOptions = useClassOptions();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFullName || !trimmedPhone) {
      Alert.alert("Missing fields", "Name and phone number are required.");
      return;
    }
    if (!isValidE164(trimmedPhone)) {
      Alert.alert(
        "Invalid phone number",
        "Enter the phone number in E.164 format (e.g. +919876543210) — this must exactly match what the teacher will sign in with, or their first login will be rejected.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(
        collection(firestore, "teachers") as CollectionReference<
          TeacherDoc,
          TeacherDoc
        >,
        {
          fullName: trimmedFullName,
          email: trimmedEmail,
          phone: trimmedPhone,
          isActive: true,
          authUid: null,
          classIds,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: null,
        },
      );

      Alert.alert("Success", "Teacher record created.");
      setFullName("");
      setEmail("");
      setPhone("+91");
      setClassIds([]);
    } catch (error) {
      console.error("Failed to create teacher:", error);
      Alert.alert("Error", "Could not create teacher. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Add Teacher</Text>
        <Text style={styles.subHeading}>
          The teacher signs in with this exact phone number via OTP — no
          password to set here.
        </Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter teacher name"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email (optional)"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Phone (E.164, e.g. +919876543210)</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+919876543210"
          keyboardType="phone-pad"
          style={styles.input}
          editable={!submitting}
        />

        <SelectField
          label="Assigned Classes"
          placeholder="Select classes taught"
          options={classOptions.map((c) => ({ label: c.label, value: c.id }))}
          value={classIds}
          onChange={setClassIds}
          multiple
        />

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Teacher</Text>
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
