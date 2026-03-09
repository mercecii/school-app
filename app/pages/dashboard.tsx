import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StudentwithStringDate } from "../../store/slices/auth.type";
import { useAppSelector } from "../../store/store";

export default function DashboardScreen() {
  const user: StudentwithStringDate = useAppSelector(
    (state) => state.auth.userInfo,
  ) as StudentwithStringDate;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DASHBOARD</Text>
        <Text style={styles.headerSubtitle}>
          {user?.fullname || "Student Name"} - Class {user?.class || ""}
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.fullname ? user.fullname.charAt(0) : "S"}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <InfoRow label="Admission No" value={user?.rollNumber || "-"} />
        <InfoRow label="Student Type" value="Regular" />
        <InfoRow label="Scholar No" value="-" />
        <InfoRow label="Child ID" value="-" />
        <InfoRow label="Roll No" value={user?.rollNumber || "-"} />
        <InfoRow label="Aadhar Card" value="-" />
        <InfoRow label="Date of Birth" value="-" />
        <InfoRow label="Father's Name" value={user?.parentName || "-"} />
        <InfoRow label="Father's Mobile No." value={user?.parentPhone || "-"} />
        <InfoRow label="Mother's Name" value="-" />
        <InfoRow label="Mother's Mobile No." value="-" />
      </View>
    </View>
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
  profileCard: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#26a69a",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  avatarText: {
    fontSize: 48,
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
});
