import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Button, TextInput, View } from "react-native";
import { auth, db } from "../firebaseSetup/firebaseSetup";

export default function AdminNotifications() {
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
    });
  };

  return (
    <View>
      <TextInput placeholder="Title" onChangeText={setTitle} />
      <TextInput placeholder="Message" onChangeText={setMessage} />
      <Button title="Send Notification" onPress={handleSend} />
    </View>
  );
}
