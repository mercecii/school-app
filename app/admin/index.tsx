import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { auth, db } from "../../firebaseSetup/firebaseSetup";
import { AdminWithStringDate } from "../store/slices/auth.type";
import { AppState } from "../store/store";

export default function AdminNotifications() {
  const userInfo: AdminWithStringDate = useSelector(
    (state: AppState) => state.auth.userInfo,
  ) as AdminWithStringDate;
  console.log("eee: app/admin/index.tsx");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    await addDoc(collection(db, "notifications"), {
      title,
      message,
      targetType: "ALL",
      createdBy: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
      isActive: true,
    });
  };

  console.log("eee: app/admin/index.tsx | user:", userInfo);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Send Notification</Text>
        <Text style={styles.subHeading}>
          Hi {userInfo?.fullName || "Admin"},
        </Text>
        <Text style={styles.subHeading}>
          Publish announcements to all students & parents
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
