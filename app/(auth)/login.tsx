import { defaultBranding } from "@/config/branding";
import { ensureStudentDocUsesUid } from "@/utils/studentLinking";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
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

const PRIMARY = defaultBranding.primaryColor;

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSendOtp = async () => {
    const trimmed = phoneNumber.trim();

    if (!/^\+\d{10,15}$/.test(trimmed)) {
      setError("Enter a valid phone number in E.164 format.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      console.log("Using project:", auth().app.options.projectId);
      console.log("Sending OTP to:", trimmed);

      const result = await auth().signInWithPhoneNumber(trimmed);
      setConfirmationResult(result);
    } catch (e: any) {
      console.error("OTP send error:", e);
      setError("Failed to send OTP. Check the phone number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      setError("Please request OTP first.");
      return;
    }

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter OTP code.");
      return;
    }

    if (!/^\d{6}$/.test(trimmed)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await confirmationResult.confirm(trimmed);

      const user = auth().currentUser;
      if (!user) {
        setError("Login failed. Please try again.");
        return;
      }

      console.log("OTP verified. UID:", user.uid);
      const studentData = await ensureStudentDocUsesUid(user);
      console.log(
        "Student linking result:",
        studentData ? "linked" : "not-found",
      );

      if (!studentData) {
        await auth().signOut();
        router.replace("/(auth)/account-not-activated");
        return;
      }

      router.replace("/pages");
    } catch (e: any) {
      console.error("OTP verify error:", e);
      setError("Invalid OTP. Please try again.");
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
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          Login with your registered phone number
        </Text>

        <TextInput
          style={styles.input}
          placeholder="+919876543210"
          placeholderTextColor="#888"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="123456"
          placeholderTextColor="#888"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
        />

        <TouchableOpacity
          style={[
            styles.button,
            (loading || !confirmationResult) && styles.buttonDisabled,
          ]}
          onPress={handleVerifyOtp}
          disabled={loading || !confirmationResult}
        >
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>

        {confirmationResult ? (
          <Text style={styles.infoText}>OTP sent. Enter the 6-digit code.</Text>
        ) : null}

        {loading ? <ActivityIndicator style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    color: "#374151",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  loader: {
    marginTop: 8,
  },
  error: {
    marginTop: 10,
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
});
