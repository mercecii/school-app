import { getFirestore } from "firebase-admin/firestore";
import {
  FirestoreEvent,
  QueryDocumentSnapshot,
  onDocumentCreated,
} from "firebase-functions/v2/firestore";
import fetch from "node-fetch";

// Lazy — see functions/src/authzSync.ts for why (import order vs.
// initializeApp() in index.ts).
function db() {
  return getFirestore();
}

type NotificationTargetType = "school" | "class" | "individual";
type NotificationTargetRole = "admin" | "teacher" | "parent";

type NotificationDocument = {
  title: string;
  message: string;
  targetType: NotificationTargetType;
  targetValue: string | null;
  targetRole: NotificationTargetRole | null;
};

type DeviceDocument = {
  token?: string;
  platform?: "android" | "ios";
};

type Recipient = { collection: "admins" | "teachers" | "parents"; id: string };

type ExpoMessage = {
  to: string;
  sound: "default";
  title: string;
  body: string;
  data: { screen: "notifications"; notificationId: string };
};

type ExpoTicket = { status?: string; details?: { error?: string } };
type ExpoPushResponse = { data?: ExpoTicket[] };

const ROLE_COLLECTIONS = ["admins", "teachers", "parents"] as const;

async function resolveRecipients(
  notification: NotificationDocument,
): Promise<Recipient[]> {
  if (notification.targetType === "school") {
    const snaps = await Promise.all(
      ROLE_COLLECTIONS.map((c) => db().collection(c).get()),
    );
    return snaps.flatMap((snap, i) =>
      snap.docs.map((d) => ({ collection: ROLE_COLLECTIONS[i], id: d.id })),
    );
  }

  if (notification.targetType === "class") {
    const classId = notification.targetValue;
    if (!classId) return [];

    const [teacherSnap, parentAuthzSnap] = await Promise.all([
      db().collection("teachers").where("classIds", "array-contains", classId).get(),
      db()
        .collection("authz")
        .where("role", "==", "parent")
        .where("classIds", "array-contains", classId)
        .get(),
    ]);

    const teacherRecipients: Recipient[] = teacherSnap.docs.map((d) => ({
      collection: "teachers",
      id: d.id,
    }));
    const parentRecipients: Recipient[] = parentAuthzSnap.docs.map((d) => ({
      collection: "parents",
      id: (d.data().profileId as string) ?? d.id,
    }));
    return [...teacherRecipients, ...parentRecipients];
  }

  // "individual"
  if (notification.targetType === "individual") {
    if (!notification.targetValue || !notification.targetRole) return [];
    return [{ collection: `${notification.targetRole}s` as Recipient["collection"], id: notification.targetValue }];
  }

  return [];
}

async function collectDeviceTokens(
  recipients: Recipient[],
): Promise<{
  tokens: string[];
  tokenMap: Record<string, (Recipient & { deviceId: string })[]>;
}> {
  const tokenMap: Record<string, (Recipient & { deviceId: string })[]> = {};
  const tokens: string[] = [];

  const deviceSnaps = await Promise.all(
    recipients.map((r) =>
      db().collection(r.collection).doc(r.id).collection("devices").get(),
    ),
  );

  deviceSnaps.forEach((snap, idx) => {
    const recipient = recipients[idx];
    snap.docs.forEach((deviceDoc) => {
      const data = deviceDoc.data() as DeviceDocument;
      const token = typeof data.token === "string" ? data.token : "";
      if (!token) return;

      if (!tokenMap[token]) tokenMap[token] = [];
      tokenMap[token].push({ ...recipient, deviceId: deviceDoc.id });
      tokens.push(token);
    });
  });

  return { tokens, tokenMap };
}

export const sendExpoNotification = onDocumentCreated(
  "notifications/{id}",
  async (event: FirestoreEvent<QueryDocumentSnapshot | undefined>) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("🔕 sendExpoNotification fired without snapshot data");
      return;
    }

    const notificationId = event.params.id;
    const notification = snapshot.data() as NotificationDocument;
    if (!notification.title || !notification.message) return;

    console.log("🚀 sendExpoNotification triggered", {
      notificationId,
      targetType: notification.targetType,
      targetValue: notification.targetValue ?? "",
      targetRole: notification.targetRole ?? "",
      title: notification.title,
    });

    const recipients = await resolveRecipients(notification);
    console.log("👥 Recipients resolved", {
      notificationId,
      count: recipients.length,
    });

    const { tokens, tokenMap } = await collectDeviceTokens(recipients);
    const uniqueTokens = Array.from(new Set(tokens));

    console.log("📱 Device tokens collected", {
      notificationId,
      rawTokenCount: tokens.length,
      uniqueTokenCount: uniqueTokens.length,
    });

    if (uniqueTokens.length === 0) {
      console.log("⚠️ No device tokens found for notification", { notificationId });
      return;
    }

    const messages: ExpoMessage[] = uniqueTokens.map((token) => ({
      to: token,
      sound: "default",
      title: notification.title,
      body: notification.message,
      data: { screen: "notifications", notificationId },
    }));

    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      const batch = messages.slice(i, i + chunkSize);
      const batchNumber = Math.floor(i / chunkSize) + 1;

      console.log("📤 Sending Expo push batch", {
        notificationId,
        batchNumber,
        batchSize: batch.length,
      });

      try {
        const res = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch),
        });
        const result = (await res.json()) as ExpoPushResponse;

        console.log("📬 Expo push response", {
          notificationId,
          batchNumber,
          ok: res.ok,
          status: res.status,
          result,
        });

        if (Array.isArray(result.data)) {
          for (const [idx, ticket] of result.data.entries()) {
            if (
              ticket.status === "error" &&
              ticket.details &&
              ticket.details.error === "DeviceNotRegistered"
            ) {
              const badToken = batch[idx].to;
              const entries = tokenMap[badToken] || [];

              await Promise.all(
                entries.map(async ({ collection, id, deviceId }) => {
                  await db()
                    .collection(collection)
                    .doc(id)
                    .collection("devices")
                    .doc(deviceId)
                    .delete();

                  console.log(
                    `Removed invalid token for device ${deviceId} in ${collection}/${id}`,
                  );
                }),
              );
            } else if (ticket.status === "error") {
              console.error("❌ Expo ticket error", {
                notificationId,
                batchNumber,
                token: batch[idx]?.to,
                ticket,
              });
            }
          }
        }
      } catch (error) {
        console.error("❌ Failed to send Expo push batch", {
          notificationId,
          batchNumber,
          error,
        });
      }
    }

    console.log("✅ sendExpoNotification completed", {
      notificationId,
      totalMessages: messages.length,
    });
  },
);
