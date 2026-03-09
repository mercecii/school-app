import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ApplyLeave() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.label}>START DATE</Text>
        <TextInput placeholder="Select start date" style={styles.input} />

        <Text style={styles.label}>END DATE</Text>
        <TextInput placeholder="Select end date" style={styles.input} />

        <Text style={styles.label}>REASON FOR LEAVE</Text>
        <TextInput
          placeholder="Enter reason"
          style={[styles.input, styles.reasonBox]}
          multiline
        />

        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>LEAVE DETAILS</Text>

        <View style={styles.tableHeader}>
          <Text style={styles.cell}>S.No</Text>
          <Text style={styles.cell}>Date</Text>
          <Text style={styles.cell}>Start</Text>
          <Text style={styles.cell}>End</Text>
          <Text style={styles.cell}>Reason</Text>
          <Text style={styles.cell}>Status</Text>
        </View>

        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>No leave records yet</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  formSection: {
    padding: 20,
    backgroundColor: "white",
  },

  label: {
    fontSize: 14,
    color: "#4a6fa5",
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
    fontSize: 16,
  },

  reasonBox: {
    height: 60,
  },

  sendButton: {
    marginTop: 30,
    backgroundColor: "#e31b23",
    paddingVertical: 16,
    alignItems: "center",
  },

  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  tableContainer: {
    margin: 20,
    backgroundColor: "white",
    paddingBottom: 10,
  },

  tableTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a6fa5",
    padding: 15,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#6f8edb",
  },

  cell: {
    flex: 1,
    paddingVertical: 12,
    textAlign: "center",
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  emptyRow: {
    padding: 20,
    alignItems: "center",
  },

  emptyText: {
    color: "#888",
  },
});
