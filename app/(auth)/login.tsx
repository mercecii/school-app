import { defaultBranding } from "@/config/branding";
import { ensureStudentDocUsesUid } from "@/utils/studentLinking";
import { registerForPushNotificationsAsync } from "@/utils/utils";
import { useRouter } from "expo-router";
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
  AuthConfirmationResult,
  signInWithPhoneNumber,
  signOut,
} from "../../utils/authClient";

const PRIMARY = defaultBranding.primaryColor;

export default function Login() {
  const isWeb = Platform.OS === "web";
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [confirmationResult, setConfirmationResult] =
    useState<AuthConfirmationResult | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSendOtp = async () => {
    if (isWeb) {
      Alert.alert(
        "Not supported",
        "Phone login is only supported on mobile app",
      );
      return;
    }

    const trimmed = phoneNumber.trim();

    if (!/^\+\d{10,15}$/.test(trimmed)) {
      Alert.alert(
        "Invalid phone number",
        "Enter a valid phone number in E.164 format.",
      );
      return;
    }

    setLoading(true);
    try {
      console.log("Using project:", auth.app.options.projectId);
      console.log("Sending OTP to:", trimmed);

      // Use modular SDK's signInWithPhoneNumber which works on React Native
      // with the auth instance initialized in firebaseSetup.ts
      const result = await signInWithPhoneNumber(auth, trimmed);
      setConfirmationResult(result);
    } catch (e: any) {
      console.error("OTP send error:", e);

      Alert.alert(
        "OTP failed",
        "Failed to send OTP. Check the phone number and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (isWeb) {
      Alert.alert(
        "Not supported",
        "Phone login is only supported on mobile app",
      );
      return;
    }

    if (!confirmationResult) {
      console.error(
        "OTP verification attempted without a confirmation result.",
      );
      Alert.alert("OTP required", "Please request OTP first.");
      return;
    }

    const trimmed = otp.trim();
    if (!trimmed) {
      Alert.alert("OTP required", "Enter OTP code.");
      return;
    }

    if (!/^\d{6}$/.test(trimmed)) {
      Alert.alert("Invalid OTP", "Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(trimmed);
      if (!userCredential) {
        Alert.alert("Login failed", "Please try again.");
        return;
      }
      const user = userCredential.user;
      if (!user) {
        Alert.alert("Login failed", "Please try again.");
        return;
      }

      const studentData = await ensureStudentDocUsesUid(user);

      if (!studentData) {
        await signOut(auth);
        router.replace("/(auth)/account-not-activated");
        return;
      }

      await registerForPushNotificationsAsync();
      router.replace("/pages");
    } catch (e: any) {
      console.error("OTP verify error:", e);
      console.error("Error code:", e.code);
      Alert.alert("Invalid OTP", "Please try again.");
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
          style={[styles.button, (loading || isWeb) && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading || isWeb}
        >
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>

        {isWeb ? (
          <Text style={styles.infoText}>
            Phone login is only supported on mobile app
          </Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="123456"
          placeholderTextColor="#888"
          value={otp}
          onChangeText={setOtp}
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

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/(auth)/admin-login")}
          disabled={loading}
        >
          <Text style={styles.secondaryText}>Admin? Login with email</Text>
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
    marginTop: 8,
  },
});
