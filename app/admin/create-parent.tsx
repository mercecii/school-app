import SelectField from "@/components/SelectField";
import { ParentDoc } from "@/firebaseSetup/fireBase.types";
import { isValidE164 } from "@/utils/phoneValidation";
import { useStudentOptions } from "@/utils/useStudents";
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

export default function CreateParentScreen() {
  const studentOptions = useStudentOptions();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [childStudentIds, setChildStudentIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFullName || !trimmedPhone || childStudentIds.length === 0) {
      Alert.alert(
        "Missing fields",
        "Name, phone number, and at least one linked child are required.",
      );
      return;
    }
    if (!isValidE164(trimmedPhone)) {
      Alert.alert(
        "Invalid phone number",
        "Enter the phone number in E.164 format (e.g. +919876543210) — this must exactly match what the parent will sign in with, or their first login will be rejected.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(
        collection(firestore, "parents") as CollectionReference<
          ParentDoc,
          ParentDoc
        >,
        {
          fullName: trimmedFullName,
          email: trimmedEmail,
          phone: trimmedPhone,
          isActive: true,
          authUid: null,
          childStudentIds,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: null,
        },
      );

      Alert.alert("Success", "Parent record created and linked.");
      setFullName("");
      setEmail("");
      setPhone("+91");
      setChildStudentIds([]);
    } catch (error) {
      console.error("Failed to create parent:", error);
      Alert.alert("Error", "Could not create parent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Add Parent</Text>
        <Text style={styles.subHeading}>
          The parent signs in with this exact phone number via OTP and sees
          only the children linked below.
        </Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter parent name"
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
          label="Linked Children"
          placeholder="Select one or more students"
          options={studentOptions.map((s) => ({ label: s.label, value: s.id }))}
          value={childStudentIds}
          onChange={setChildStudentIds}
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
            <Text style={styles.buttonText}>Add Parent</Text>
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
