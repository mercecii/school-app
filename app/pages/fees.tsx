import { FeePaymentDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import { AppState, useAppSelector } from "@/store/store";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type PaymentRow = { id: string; data: FeePaymentDoc };

export default function Fees() {
  const { children, selectedChildId } = useAppSelector(
    (state: AppState) => state.auth,
  );
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  useEffect(() => {
    if (!selectedChildId) {
      setPayments([]);
      return;
    }
    const unsubscribe = onSnapshot(
      collection(firestore, "students", selectedChildId, "feePayments"),
      (snap) =>
        setPayments(
          snap.docs.map((d) => ({ id: d.id, data: d.data() as FeePaymentDoc })),
        ),
    );
    return unsubscribe;
  }, [selectedChildId]);

  if (!selectedChild) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Select a child from Dashboard first.</Text>
      </View>
    );
  }

  const totalDue = payments.reduce((sum, p) => sum + p.data.amountDue, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.data.amountPaid, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Fees — {selectedChild.fullName}</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Due</Text>
          <Text style={styles.summaryValue}>₹{totalDue}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Paid</Text>
          <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
            ₹{totalPaid}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Outstanding</Text>
          <Text style={[styles.summaryValue, { color: "#dc2626" }]}>
            ₹{totalDue - totalPaid}
          </Text>
        </View>
      </View>

      {payments.length === 0 && (
        <Text style={styles.emptyText}>No fee records yet.</Text>
      )}

      {payments.map((payment) => (
        <View key={payment.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.amount}>₹{payment.data.amountDue}</Text>
            <Text
              style={[styles.status, styles[`status_${payment.data.status}`]]}
            >
              {payment.data.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.meta}>Paid: ₹{payment.data.amountPaid}</Text>
          {payment.data.method && (
            <Text style={styles.meta}>Method: {payment.data.method}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f4f6f9", flexGrow: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#1f2937" },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 14, color: "#6b7280" },
  summaryValue: { fontSize: 15, fontWeight: "700", color: "#111827" },
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { fontSize: 18, fontWeight: "700", color: "#111827" },
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
  meta: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  emptyText: { textAlign: "center", marginTop: 20, color: "#6b7280" },
});
