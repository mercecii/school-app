import { ExpoPushTokenEntry } from "@/firebaseSetup/fireBase.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { firestore } from "../firebaseSetup/firebaseSetup";

const DEVICE_ID_STORAGE_KEY = "@school_app_device_id";
const MAX_DEVICES_PER_USER = 5;

/**
 * Generate or retrieve deviceId from local storage
 */
export const getOrCreateDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);

  if (!deviceId) {
    // Generate a unique deviceId: timestamp + random string
    deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    console.log("Created new deviceId:", deviceId);
  } else {
    console.log("Retrieved existing deviceId:", deviceId);
  }

  return deviceId;
};

/**
 * Save push token for current device
 * - If deviceId exists in Firestore, update token + lastSeenAt
 * - Else, add new entry
 * - Limit max devices per user to 5 (remove oldest)
 */
export const savePushToken = async (
  uid: string,
  token: string,
): Promise<void> => {
  try {
    const deviceId = await getOrCreateDeviceId();
    const platform = (Platform.OS === "android" ? "android" : "ios") as
      | "android"
      | "ios";

    const studentRef = doc(firestore, "students", uid);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      console.error("Student document not found");
      return;
    }

    const currentTokens: ExpoPushTokenEntry[] =
      studentSnap.data().expoPushTokens || [];

    // Find and update existing device entry
    const existingIndex = currentTokens.findIndex(
      (entry) => entry.deviceId === deviceId,
    );

    let updatedTokens: ExpoPushTokenEntry[];

    if (existingIndex !== -1) {
      // Update existing device
      updatedTokens = [...currentTokens];
      updatedTokens[existingIndex] = {
        token,
        deviceId,
        platform,
        lastSeenAt: serverTimestamp() as any,
      };
      console.log("Updated existing device token for:", deviceId);
    } else {
      // Add new device entry
      updatedTokens = [
        ...currentTokens,
        {
          token,
          deviceId,
          platform,
          lastSeenAt: serverTimestamp() as any,
        },
      ];
      console.log("Added new device token for:", deviceId);
    }

    // Enforce max 5 devices (remove oldest by lastSeenAt)
    if (updatedTokens.length > MAX_DEVICES_PER_USER) {
      updatedTokens.sort(
        (a, b) =>
          (a.lastSeenAt as any).toMillis?.() -
          (b.lastSeenAt as any).toMillis?.(),
      );
      updatedTokens = updatedTokens.slice(-MAX_DEVICES_PER_USER);
      console.log("Trimmed to max 5 devices");
    }

    // Update student document
    await updateDoc(studentRef, {
      expoPushTokens: updatedTokens,
    });

    console.log(
      "Successfully saved push token. Active devices:",
      updatedTokens.length,
    );
  } catch (error) {
    console.error("Error saving push token:", error);
    throw error;
  }
};

/**
 * Remove push token by deviceId (useful for cleanup)
 */
export const removePushToken = async (
  uid: string,
  deviceId: string,
): Promise<void> => {
  try {
    const studentRef = doc(firestore, "students", uid);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) return;

    const currentTokens: ExpoPushTokenEntry[] =
      studentSnap.data().expoPushTokens || [];
    const updatedTokens = currentTokens.filter(
      (entry) => entry.deviceId !== deviceId,
    );

    await updateDoc(studentRef, {
      expoPushTokens: updatedTokens,
    });

    console.log("Removed push token for deviceId:", deviceId);
  } catch (error) {
    console.error("Error removing push token:", error);
  }
};
