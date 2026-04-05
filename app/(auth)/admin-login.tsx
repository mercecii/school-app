import { defaultBranding } from "@/config/branding";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  auth,
  signInWithEmailAndPassword,
  signOut,
} from "../../utils/authClient";

const PRIMARY = defaultBranding.primaryColor;

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    console.log("Attempting admin login with email:", trimmedEmail);
    if (!trimmedEmail || !password) {
      Alert.alert("Missing details", "Enter email and password.");
      console.log("Login failed: Missing email or password");
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        password,
      );
      const uid = credential.user?.uid;

      if (!uid) {
        console.log(
          "Login failed: No UID returned from signInWithEmailAndPassword",
        );
        Alert.alert("Login failed", "Unable to validate admin account.");
        await signOut(auth);
        return;
      }

      const adminSnap = await getDoc(doc(firestore, "admins", uid));

      if (!adminSnap.exists()) {
        await signOut(auth);
        Alert.alert("Unauthorized access", "You are not an admin user.");
        return;
      }

      router.replace("/admin");
    } catch (error: any) {
      console.error("Admin login error:", error);
      const code = String(error?.code ?? "");
      if (code.includes("auth/invalid-credential")) {
        Alert.alert("Login failed", "Invalid email or password.");
      } else {
        Alert.alert("Login failed", "Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>
          Sign in with admin email and password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="admin@school.com"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAdminLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Login as Admin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/(auth)/login")}
          disabled={loading}
        >
          <Text style={styles.secondaryText}>Back to Student Login</Text>
        </TouchableOpacity>

        {loading ? <ActivityIndicator style={styles.loader} /> : null}
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
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111",
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  button: {
    width: "100%",
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
  loader: {
    marginTop: 12,
  },
});
