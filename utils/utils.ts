import * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";
import { auth } from "./authClient";
import { savePushToken } from "./pushTokenManager";

let notificationsConfigured = false;

export const configureNotificationHandlingAsync = async (): Promise<void> => {
  if (Platform.OS === "web") {
    return;
  }

  if (notificationsConfigured) {
    return;
  }

  console.log("🔔 Configuring notification presentation");

  ExpoNotifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  console.log("✅ Notification handler configured");

  if (Platform.OS === "android") {
    await ExpoNotifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: ExpoNotifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563eb",
      sound: "default",
    });

    console.log("📣 Android notification channel ready: default");
  }

  notificationsConfigured = true;
};

export const registerForPushNotificationsAsync = async (): Promise<string> => {
  try {
    await configureNotificationHandlingAsync();

    const { status } = await ExpoNotifications.requestPermissionsAsync();

    if (status !== "granted") {
      console.log("Push permission not granted");
      return "";
    }

    const tokenResponse = await ExpoNotifications.getExpoPushTokenAsync();
    const token = tokenResponse.data;
    console.log("🔥 TOKEN:", token);

    const uid = auth.currentUser?.uid;
    console.log("👤 UID:", uid ?? null);

    if (!uid) {
      console.log("❌ UID not available, skipping token save");
      return "";
    }

    await savePushToken(uid, token);
    return token;
  } catch (e) {
    console.error("❌ Token save failed:", e);
    return "";
  }
};
