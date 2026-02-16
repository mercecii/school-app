import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert("Use a physical device");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Permission not granted");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  return token;
}
