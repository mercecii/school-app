import { getRoleAsync } from "@/utils/getRoleAsync";
import * as Device from "expo-device";
import * as ExpoNotifications from "expo-notifications";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseSetup/firebaseSetup";

export default function Login() {
  console.log("eee: app/(auth)/login.tsx");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const registerForPushNotificationsAsync = async (uid: string) => {
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return;
    }

    const { status: existingStatus } =
      await ExpoNotifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push permission not granted");
      return;
    }

    const token = (await ExpoNotifications.getExpoPushTokenAsync()).data;

    console.log("Expo Push Token:", token);

    // Save token to Firestore under student document
    await updateDoc(doc(db, "students", uid), {
      expoPushToken: token,
    });
  };

  const handleLogin = async () => {
    setError("");
    try {
      const temp = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", temp.user.email);
      if (temp.user.email) {
        const email = temp.user.email;
        console.log("Logged in user email:", email);
        const role = await getRoleAsync(temp.user.uid);
        await registerForPushNotificationsAsync(temp.user.uid);
        console.log("User role:", role);
        if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/pages/dashboard");
        }
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to your school-app account</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
  },
  card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3f51b5",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fafbfc",
    color: "#222",
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#3f51b5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 4,
    shadowColor: "#3f51b5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  error: {
    color: "#e53935",
    marginBottom: 8,
    fontSize: 15,
    textAlign: "center",
  },
});
