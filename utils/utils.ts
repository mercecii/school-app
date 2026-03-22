import * as ExpoNotifications from "expo-notifications";
import { savePushToken } from "./pushTokenManager";

export const registerForPushNotificationsAsync = async (uid: string) => {
  const { status: existingStatus } =
    await ExpoNotifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push permission not granted");
    return "";
  }

  try {
    const token = (await ExpoNotifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);

    ExpoNotifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    ExpoNotifications.addNotificationResponseReceivedListener((response) => {
      console.log("User tapped notification:", response);
    });

    // Save token with device tracking
    await savePushToken(uid, token);

    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return "";
  }
};
