import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { firestore } from "../firebaseSetup/firebaseSetup";

const DEVICE_ID_STORAGE_KEY = "@school_app_device_id";

// Push tokens live under the three login-holding roles only — students
// never authenticate in v1, so they never had a devices subcollection to
// begin with (see docs/decisions.md).
export type PushTokenCollection = "admins" | "teachers" | "parents";

/**
 * Generate or retrieve a stable deviceId.
 * Android uses hardware-backed androidId; other platforms persist a fallback id.
 */
export const getOrCreateDeviceId = async (): Promise<string> => {
  if (Platform.OS === "android") {
    const androidId = await Application.getAndroidId();
    if (androidId) {
      return `android-${androidId}`;
    }
  }

  let deviceId = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);

  if (!deviceId) {
    deviceId = `${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  }

  return deviceId;
};

/**
 * Save push token for current device at {collectionName}/{docId}/devices/{deviceId}
 */
export const savePushToken = async (
  collectionName: PushTokenCollection,
  docId: string,
  token: string,
): Promise<void> => {
  try {
    const deviceId = await getOrCreateDeviceId();
    console.log("📱 Device ID:", deviceId);
    console.log("📡 Writing token...");

    await setDoc(doc(firestore, collectionName, docId, "devices", deviceId), {
      token,
      platform: Platform.OS,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Token saved");
  } catch (e) {
    console.error("❌ Token save failed:", e);
    throw e;
  }
};

/**
 * Remove push token document for a device.
 */
export const removePushToken = async (
  collectionName: PushTokenCollection,
  docId: string,
  deviceId: string,
): Promise<void> => {
  try {
    const deviceRef = doc(firestore, collectionName, docId, "devices", deviceId);
    await deleteDoc(deviceRef);
  } catch (error) {
    console.error("Error removing push token:", error);
  }
};
