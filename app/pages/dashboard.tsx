import { ClassDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import { ParentWithStringDate } from "@/store/slices/auth.type";
import { setSelectedChildId } from "@/store/slices/authSlice";
import { AppState, useAppDispatch, useAppSelector } from "@/store/store";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  const parent = useAppSelector(
    (state: AppState) => state.auth.userInfo,
  ) as ParentWithStringDate;
  const { children, selectedChildId } = useAppSelector(
    (state: AppState) => state.auth,
  );
  const dispatch = useAppDispatch();

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const [className, setClassName] = useState("");

  useEffect(() => {
    if (!selectedChild?.classId) {
      setClassName("");
      return;
    }
    getDoc(doc(firestore, "classes", selectedChild.classId)).then((snap) => {
      setClassName(snap.exists() ? (snap.data() as ClassDoc).name : "");
    });
  }, [selectedChild?.classId]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DASHBOARD</Text>
        <Text style={styles.headerSubtitle}>
          Welcome, {parent?.fullName || "Parent"}
        </Text>
      </View>

      {children.length > 1 && (
        <View style={styles.childSwitcher}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childChip,
                child.id === selectedChildId && styles.childChipActive,
              ]}
              onPress={() => dispatch(setSelectedChildId(child.id))}
            >
              <Text
                style={[
                  styles.childChipText,
                  child.id === selectedChildId && styles.childChipTextActive,
                ]}
              >
                {child.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedChild ? (
        <>
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {selectedChild.fullName.charAt(0)}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <InfoRow label="Name" value={selectedChild.fullName} />
            <InfoRow label="Class" value={className || "-"} />
            <InfoRow label="Roll No" value={selectedChild.rollNumber} />
            <InfoRow label="Gender" value={selectedChild.gender} />
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>No children linked to this account.</Text>
      )}
    </ScrollView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    backgroundColor: "#4a90e2",
    paddingVertical: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#fff",
    marginTop: 4,
    fontSize: 14,
  },
  childSwitcher: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
  },
  childChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },
  childChipActive: {
    backgroundColor: "#4a90e2",
  },
  childChipText: {
    color: "#374151",
    fontWeight: "600",
  },
  childChipTextActive: {
    color: "#fff",
  },
  profileCard: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#26a69a",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  infoSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowLabel: {
    fontSize: 14,
    color: "#555",
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
  },
});
