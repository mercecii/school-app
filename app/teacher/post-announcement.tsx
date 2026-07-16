import SelectField from "@/components/SelectField";
import { NotificationDoc } from "@/firebaseSetup/fireBase.types";
import { TeacherWithStringDate } from "@/store/slices/auth.type";
import { AppState, useAppSelector } from "@/store/store";
import { auth } from "@/utils/authClient";
import { useClassOptions } from "@/utils/useClasses";
import {
  addDoc,
  collection,
  CollectionReference,
  serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
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

export default function PostAnnouncementScreen() {
  const teacher = useAppSelector(
    (state: AppState) => state.auth.userInfo,
  ) as TeacherWithStringDate;
  const allClasses = useClassOptions();
  const myClassOptions = allClasses.filter((c) =>
    (teacher?.classIds ?? []).includes(c.id),
  );

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [classId, setClassId] = useState<string | null>(
    myClassOptions[0]?.id ?? null,
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    const uid = auth.currentUser?.uid;

    if (!trimmedTitle || !trimmedMessage || !classId || !uid) {
      Alert.alert("Missing fields", "Enter a title, message, and class.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(
        collection(firestore, "notifications") as CollectionReference<
          NotificationDoc,
          NotificationDoc
        >,
        {
          title: trimmedTitle,
          message: trimmedMessage,
          targetType: "class",
          targetValue: classId,
          targetRole: null,
          createdBy: uid,
          createdByRole: "teacher",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          readBy: [],
        },
      );
      Alert.alert("Success", "Announcement posted to your class.");
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error("Failed to post announcement:", error);
      Alert.alert("Error", "Could not post announcement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Post Announcement</Text>
        <Text style={styles.subHeading}>
          Visible only to your class&apos;s parents and this
          class&apos;s teacher(s).
        </Text>

        <SelectField
          label="Class"
          placeholder="Select class"
          options={myClassOptions.map((c) => ({ label: c.label, value: c.id }))}
          value={classId}
          onChange={setClassId}
        />

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
          style={styles.input}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Enter message"
          style={[styles.input, styles.textArea]}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSend}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>Post Announcement</Text>
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
