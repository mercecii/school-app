import * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";
import { PushTokenCollection, savePushToken } from "./pushTokenManager";

let notificationsConfigured = false;
let activePushRegistration: {
  key: string;
  promise: Promise<string>;
} | null = null;

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

/**
 * Registers the current device for push notifications under
 * {collectionName}/{docId}/devices/{deviceId}. `docId` is the role doc's
 * own ID — the Firebase Auth UID for admins, but the auto-ID `profileId`
 * for teachers/parents (they aren't UID-keyed, see docs/decisions.md).
 */
export const registerForPushNotificationsAsync = async (
  collectionName: PushTokenCollection,
  docId: string,
): Promise<string> => {
  if (!docId) {
    console.log("❌ docId not available, skipping token save");
    return "";
  }

  const key = `${collectionName}/${docId}`;

  if (activePushRegistration?.key === key) {
    console.log("⏳ Push registration already in progress for:", key);
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
      console.log("👤 Registering under:", key);

      await savePushToken(collectionName, docId, token);
      return token;
    } catch (e) {
      console.error("❌ Token save failed:", e);
      return "";
    }
  })();

  activePushRegistration = { key, promise: registrationPromise };

  try {
    return await registrationPromise;
  } finally {
    if (activePushRegistration?.promise === registrationPromise) {
      activePushRegistration = null;
    }
  }
};
