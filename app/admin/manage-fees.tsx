import SelectField from "@/components/SelectField";
import {
  FeePaymentDoc,
  FeePaymentMethod,
} from "@/firebaseSetup/fireBase.types";
import { useStudentOptions } from "@/utils/useStudents";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { firestore } from "../../firebaseSetup/firebaseSetup";

type PaymentRow = { id: string; data: FeePaymentDoc };

const METHODS: FeePaymentMethod[] = ["cash", "bank_transfer", "cheque", "other"];

export default function ManageFeesScreen() {
  const studentOptions = useStudentOptions();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [method, setMethod] = useState<FeePaymentMethod>("cash");

  useEffect(() => {
    if (!studentId) {
      setPayments([]);
      return;
    }
    const unsubscribe = onSnapshot(
      collection(firestore, "students", studentId, "feePayments"),
      (snap) =>
        setPayments(
          snap.docs.map((d) => ({ id: d.id, data: d.data() as FeePaymentDoc })),
        ),
    );
    return unsubscribe;
  }, [studentId]);

  const startRecording = (payment: PaymentRow) => {
    setRecordingId(payment.id);
    setAmountPaid(String(payment.data.amountDue - payment.data.amountPaid));
    setMethod("cash");
  };

  const submitPayment = async (payment: PaymentRow) => {
    if (!studentId) return;
    const parsedAmount = Number(amountPaid);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a positive amount paid.");
      return;
    }

    const newAmountPaid = payment.data.amountPaid + parsedAmount;
    const status =
      newAmountPaid >= payment.data.amountDue ? "paid" : "partial";

    try {
      await updateDoc(
        doc(firestore, "students", studentId, "feePayments", payment.id),
        {
          amountPaid: newAmountPaid,
          status,
          method,
          paidAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      );
      setRecordingId(null);
      setAmountPaid("");
    } catch (error) {
      console.error("Failed to record payment:", error);
      Alert.alert("Error", "Could not record payment. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Manage Fees</Text>

      <SelectField
        label="Student"
        placeholder="Select a student"
        options={studentOptions.map((s) => ({ label: s.label, value: s.id }))}
        value={studentId}
        onChange={setStudentId}
      />

      {studentId && payments.length === 0 && (
        <Text style={styles.emptyText}>
          No fee records for this student yet.
        </Text>
      )}

      {payments.map((payment) => (
        <View key={payment.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.amount}>₹{payment.data.amountDue}</Text>
            <Text style={[styles.status, styles[`status_${payment.data.status}`]]}>
              {payment.data.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.meta}>
            Paid so far: ₹{payment.data.amountPaid}
          </Text>

          {payment.data.status !== "paid" &&
            (recordingId === payment.id ? (
              <View>
                <Text style={styles.label}>Amount to record</Text>
                <TextInput
                  value={amountPaid}
                  onChangeText={setAmountPaid}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <SelectField
                  label="Method"
                  options={METHODS.map((m) => ({ label: m, value: m }))}
                  value={method}
                  onChange={(v) => setMethod((v as FeePaymentMethod) ?? "cash")}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => submitPayment(payment)}
                >
                  <Text style={styles.buttonText}>Save Payment</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={() => startRecording(payment)}
              >
                <Text style={styles.recordButtonText}>Record Payment</Text>
              </TouchableOpacity>
            ))}
        </View>
      ))}
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  status: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  status_unpaid: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  status_partial: { backgroundColor: "#fef3c7", color: "#92400e" },
  status_paid: { backgroundColor: "#dcfce7", color: "#15803d" },
  meta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 8,
    color: "#374151",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  recordButton: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  recordButtonText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  emptyText: {
    color: "#6b7280",
    marginTop: 16,
  },
});
