import * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";
import { savePushToken } from "./pushTokenManager";

let notificationsConfigured = false;
let activePushRegistration: { uid: string; promise: Promise<string> } | null =
  null;

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

export const registerForPushNotificationsAsync = async (
  uid: string,
): Promise<string> => {
  if (!uid) {
    console.log("❌ UID not available, skipping token save");
    return "";
  }

  if (activePushRegistration?.uid === uid) {
    console.log("⏳ Push registration already in progress for UID:", uid);
    return activePushRegistration.promise;
  }

  const registrationPromise = (async (): Promise<string> => {
    try {
      await configureNotificationHandlingAsync();

      const { status } = await ExpoNotifications.requestPermissionsAsync();

      if (status !== "granted") {
        console.log("Push permission not granted");
        return "";
      }

      const tokenResponse = await ExpoNotifications.getExpoPushTokenAsync({
        projectId: "10c5a46a-0e7f-4427-8a11-69c484df6407",
      });
      const token = tokenResponse.data;
      console.log("🔥 TOKEN:", token);
      console.log("👤 UID:", uid);

      await savePushToken(uid, token);
      return token;
    } catch (e) {
      console.error("❌ Token save failed:", e);
      return "";
    }
  })();

  activePushRegistration = { uid, promise: registrationPromise };

  try {
    return await registrationPromise;
  } finally {
    if (activePushRegistration?.promise === registrationPromise) {
      activePushRegistration = null;
    }
  }
};
