import SelectField from "@/components/SelectField";
import { ParentDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import { isValidE164 } from "@/utils/phoneValidation";
import { useStudentOptions } from "@/utils/useStudents";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ParentRow = { id: string; data: ParentDoc };

export default function ManageParentsScreen() {
  const [parents, setParents] = useState<ParentRow[]>([]);
  const studentOptions = useStudentOptions();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(firestore, "parents"), orderBy("fullName")),
      (snap) =>
        setParents(
          snap.docs.map((d) => ({ id: d.id, data: d.data() as ParentDoc })),
        ),
    );
    return unsubscribe;
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Manage Parents</Text>
      <Text style={styles.subHeading}>
        Fix a wrong phone number, change which children are linked, or turn a
        parent off.
      </Text>

      {parents.map((p) => (
        <ParentCard key={p.id} row={p} studentOptions={studentOptions} />
      ))}

      {parents.length === 0 && (
        <Text style={styles.emptyText}>No parents yet.</Text>
      )}
    </ScrollView>
  );
}

function ParentCard({
  row,
  studentOptions,
}: {
  row: ParentRow;
  studentOptions: { id: string; label: string }[];
}) {
  const [fullName, setFullName] = useState(row.data.fullName);
  const [email, setEmail] = useState(row.data.email);
  const [phone, setPhone] = useState(row.data.phone);
  const [childStudentIds, setChildStudentIds] = useState<string[]>(
    row.data.childStudentIds,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone || childStudentIds.length === 0) {
      Alert.alert(
        "Missing fields",
        "Name, phone number, and at least one linked child are required.",
      );
      return;
    }
    if (!isValidE164(trimmedPhone)) {
      Alert.alert(
        "Invalid phone number",
        "Enter the phone number in E.164 format (e.g. +919876543210).",
      );
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(firestore, "parents", row.id), {
        fullName: trimmedName,
        email: email.trim(),
        phone: trimmedPhone,
        childStudentIds,
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Saved", "Parent record updated.");
    } catch (error) {
      console.error("Failed to update parent:", error);
      Alert.alert("Error", "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (value: boolean) => {
    try {
      await updateDoc(doc(firestore, "parents", row.id), {
        isActive: value,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to toggle parent active state:", error);
      Alert.alert("Error", "Could not update status. Please try again.");
    }
  };

  return (
    <View style={[styles.card, !row.data.isActive && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{row.data.fullName}</Text>
        <View style={styles.activeRow}>
          <Text style={styles.activeLabel}>
            {row.data.isActive ? "Active" : "Inactive"}
          </Text>
          <Switch value={row.data.isActive} onValueChange={handleToggleActive} />
        </View>
      </View>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone (E.164)</Text>
      <TextInput value={phone} onChangeText={setPhone} style={styles.input} />

      <SelectField
        label="Linked Children"
        placeholder="Select one or more students"
        options={studentOptions.map((s) => ({ label: s.label, value: s.id }))}
        value={childStudentIds}
        onChange={setChildStudentIds}
        multiple
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving…" : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </View>
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
  subHeading: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flexShrink: 1,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeLabel: {
    fontSize: 12,
    color: "#6b7280",
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
  saveButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    color: "#6b7280",
    marginTop: 20,
    textAlign: "center",
  },
});
