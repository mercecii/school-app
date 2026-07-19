import SelectField from "@/components/SelectField";
import { NotificationDoc, NotificationTargetType } from "@/firebaseSetup/fireBase.types";
import { useClassOptions } from "@/utils/useClasses";
import {
  addDoc,
  collection,
  CollectionReference,
  serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { firestore } from "../../firebaseSetup/firebaseSetup";
import { AdminWithStringDate } from "../../store/slices/auth.type";
import { AppState } from "../../store/store";
import { auth } from "../../utils/authClient";

const TARGET_TYPES: { label: string; value: NotificationTargetType }[] = [
  { label: "Whole School", value: "school" },
  { label: "One Class", value: "class" },
];

export default function AdminNotifications() {
  const userInfo: AdminWithStringDate = useSelector(
    (state: AppState) => state.auth.userInfo,
  ) as AdminWithStringDate;
  const classOptions = useClassOptions();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<NotificationTargetType>("school");
  const [classId, setClassId] = useState<string | null>(null);

  const showToast = (toastMessage: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
      return;
    }
    Alert.alert("Notification", toastMessage);
  };

  const handleSend = async () => {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      showToast("Please enter both title and message.");
      return;
    }
    if (targetType === "class" && !classId) {
      showToast("Select a class to target.");
      return;
    }

    try {
      await addDoc(
        collection(firestore, "notifications") as CollectionReference<
          NotificationDoc,
          NotificationDoc
        >,
        {
          title: trimmedTitle,
          message: trimmedMessage,
          targetType,
          targetValue: targetType === "class" ? classId : null,
          targetRole: null,
          createdBy: auth.currentUser?.uid as string,
          createdByRole: "admin",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          readBy: [],
        },
      );

      setTitle("");
      setMessage("");
      setTargetType("school");
      setClassId(null);
      showToast("Notification sent.");
    } catch (error) {
      console.error("Failed to add notification:", error);
      showToast("Failed to add notification.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Send Notification</Text>
        <Text style={styles.subHeading}>
          Hi {userInfo?.fullName || "Admin"},
        </Text>
        <Text style={styles.subHeading}>
          Publish announcements to the whole school or a single class
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="Enter notification title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            placeholder="Enter notification message"
            value={message}
            onChangeText={setMessage}
            style={[styles.input, styles.textArea]}
            multiline
          />
        </View>

        <SelectField
          label="Audience"
          options={TARGET_TYPES}
          value={targetType}
          onChange={(v) => setTargetType((v as NotificationTargetType) ?? "school")}
        />

        {targetType === "class" && (
          <SelectField
            label="Class"
            placeholder="Select class"
            options={classOptions.map((c) => ({ label: c.label, value: c.id }))}
            value={classId}
            onChange={setClassId}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSend}>
          <Text style={styles.buttonText}>Send Notification</Text>
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1f2937",
  },
  subHeading: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#374151",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});
