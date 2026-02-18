import * as ExpoNotifications from "expo-notifications";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseSetup/firebaseSetup";

export const registerForPushNotificationsAsync = async (uid: string) => {
  // if (!Device.isDevice) {
  //   console.log("Push notifications require a physical device");
  //   return;
  // }

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

  try {
    const token = (await ExpoNotifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
    ExpoNotifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    await updateDoc(doc(db, "students", uid), {
      expoPushToken: token,
    });
    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return "";
  }

  // Save token to Firestore under student document
};
