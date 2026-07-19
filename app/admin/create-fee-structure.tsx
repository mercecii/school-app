import SelectField from "@/components/SelectField";
import { FeeStructureDoc } from "@/firebaseSetup/fireBase.types";
import { useClassOptions } from "@/utils/useClasses";
import {
  addDoc,
  collection,
  CollectionReference,
  serverTimestamp,
  Timestamp,
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
import { useSelector } from "react-redux";
import { firestore } from "../../firebaseSetup/firebaseSetup";
import { AdminWithStringDate } from "../../store/slices/auth.type";
import { AppState } from "../../store/store";
import { auth } from "../../utils/authClient";

const SCHOOL_WIDE_VALUE = "__school_wide__";

export default function CreateFeeStructureScreen() {
  const classOptions = useClassOptions();
  const userInfo = useSelector(
    (state: AppState) => state.auth.userInfo,
  ) as AdminWithStringDate | null;

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [classId, setClassId] = useState<string | null>(SCHOOL_WIDE_VALUE);
  const [academicYear, setAcademicYear] = useState("");
  const [dueDate, setDueDate] = useState(""); // YYYY-MM-DD
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const parsedAmount = Number(amount);
    const trimmedYear = academicYear.trim();
    const trimmedDueDate = dueDate.trim();

    if (
      !trimmedName ||
      !parsedAmount ||
      parsedAmount <= 0 ||
      !trimmedYear ||
      !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDueDate)
    ) {
      Alert.alert(
        "Missing or invalid fields",
        "Fill in name, a positive amount, academic year, and due date as YYYY-MM-DD.",
      );
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      setSubmitting(true);
      await addDoc(
        collection(firestore, "feeStructures") as CollectionReference<
          FeeStructureDoc,
          FeeStructureDoc
        >,
        {
          name: trimmedName,
          classId: classId === SCHOOL_WIDE_VALUE ? null : classId,
          amount: parsedAmount,
          dueDate: Timestamp.fromDate(new Date(trimmedDueDate)),
          academicYear: trimmedYear,
          isActive: true,
          createdBy: uid,
          createdAt: serverTimestamp(),
        },
      );

      Alert.alert(
        "Success",
        "Fee structure created — payment records are being generated for applicable students.",
      );
      setName("");
      setAmount("");
      setClassId(SCHOOL_WIDE_VALUE);
      setAcademicYear("");
      setDueDate("");
    } catch (error) {
      console.error("Failed to create fee structure:", error);
      Alert.alert("Error", "Could not create fee structure. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Create Fee Structure</Text>
        <Text style={styles.subHeading}>
          Hi {userInfo?.fullName || "Admin"} — creating this generates one
          unpaid payment record per applicable student automatically.
        </Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Term 1 Tuition"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="e.g. 5000"
          keyboardType="numeric"
          style={styles.input}
          editable={!submitting}
        />

        <SelectField
          label="Applies To"
          options={[
            { label: "Whole School", value: SCHOOL_WIDE_VALUE },
            ...classOptions.map((c) => ({ label: c.label, value: c.id })),
          ]}
          value={classId}
          onChange={setClassId}
        />

        <Text style={styles.label}>Academic Year</Text>
        <TextInput
          value={academicYear}
          onChangeText={setAcademicYear}
          placeholder="e.g. 2026"
          style={styles.input}
          editable={!submitting}
        />

        <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="2026-08-01"
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
            <Text style={styles.buttonText}>Create Fee Structure</Text>
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
