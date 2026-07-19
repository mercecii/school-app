import { defaultBranding } from "@/config/branding";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, signInWithEmailAndPassword } from "../../utils/authClient";

const PRIMARY = defaultBranding.primaryColor;

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Enter email and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      // AuthGate's onAuthStateChanged fires from here, bridges the Firestore
      // session, resolves the caller against admins/{uid}, sets Redux state,
      // and redirects to /admin (or shows not-registered/link-error). No
      // need to duplicate that work here — see login.tsx for the same
      // pattern on the phone-auth side.
    } catch (e: any) {
      console.error("Admin login error:", e);
      const code = String(e?.code ?? "");
      if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password") || code.includes("auth/user-not-found")) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to sign in. Please try again.");
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAdminLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login as Admin</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/(auth)/forgot-password")}
          disabled={loading}
        >
          <Text style={styles.secondaryText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/(auth)/login")}
          disabled={loading}
        >
          <Text style={styles.secondaryText}>Back to Student Login</Text>
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
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
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
});
