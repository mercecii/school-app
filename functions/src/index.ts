import { initializeApp } from "firebase-admin/app";
import {
  DocumentData,
  getFirestore,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import {
  FirestoreEvent,
  QueryDocumentSnapshot as FunctionsQueryDocumentSnapshot,
  onDocumentCreated,
} from "firebase-functions/v2/firestore";
import fetch from "node-fetch";

initializeApp();

const db = getFirestore();

type NotificationTargetType = "ALL" | "CLASS" | "USER";

type NotificationDocument = {
  title: string;
  message: string;
  targetType: NotificationTargetType;
  targetValue: string;
};

type StudentDocument = {
  id: string;
  class?: string;
};

type DeviceDocument = {
  token?: string;
  platform?: "android" | "ios";
  updatedAt?: any;
};

type ExpoMessage = {
  to: string;
  sound: "default";
  title: string;
  body: string;
  data: {
    screen: "notifications";
  };
};

type ExpoTicket = {
  status?: string;
  details?: {
    error?: string;
  };
};

type ExpoPushResponse = {
  data?: ExpoTicket[];
};

export const sendExpoNotification = onDocumentCreated(
  "notifications/{id}",
  async (event: FirestoreEvent<FunctionsQueryDocumentSnapshot | undefined>) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("🔕 sendExpoNotification fired without snapshot data");
      return;
    }

    const notificationId = event.params.id;
    const notification = snapshot.data() as NotificationDocument;

    console.log("🚀 sendExpoNotification triggered", {
      notificationId,
      targetType: notification.targetType,
      targetValue: notification.targetValue ?? "",
      title: notification.title,
    });

    // 1. Fetch target students
    let students: StudentDocument[] = [];
    if (notification.targetType === "ALL") {
      const snap = await db.collection("students").get();
      students = snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...(doc.data() as Omit<StudentDocument, "id">),
      }));
    } else if (notification.targetType === "CLASS") {
      const snap = await db
        .collection("students")
        .where("class", "==", notification.targetValue)
        .get();
      students = snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...(doc.data() as Omit<StudentDocument, "id">),
      }));
    } else if (notification.targetType === "USER") {
      const doc = await db
        .collection("students")
        .doc(notification.targetValue)
        .get();
      if (doc.exists) {
        students = [
          {
            id: doc.id,
            ...(doc.data() as Omit<StudentDocument, "id">),
          },
        ];
      }
    }

    console.log("👥 Target students resolved", {
      notificationId,
      count: students.length,
      studentIds: students.map((student) => student.id),
    });

    // 2. Collect tokens from students/{uid}/devices/{deviceId}
    const tokenMap: Record<string, { studentId: string; deviceId: string }[]> =
      {};
    const tokens: string[] = [];

    const deviceSnaps = await Promise.all(
      students.map((student) =>
        db.collection("students").doc(student.id).collection("devices").get(),
      ),
    );

    deviceSnaps.forEach((snap, studentIdx) => {
      const studentId = students[studentIdx].id;
      snap.docs.forEach((deviceDoc) => {
        const data = deviceDoc.data() as DeviceDocument;
        const token = typeof data.token === "string" ? data.token : "";
        if (!token) return;

        if (!tokenMap[token]) tokenMap[token] = [];
        tokenMap[token].push({ studentId, deviceId: deviceDoc.id });
        tokens.push(token);
      });
    });

    const uniqueTokens = Array.from(new Set(tokens));

    console.log("📱 Device tokens collected", {
      notificationId,
      rawTokenCount: tokens.length,
      uniqueTokenCount: uniqueTokens.length,
    });

    if (uniqueTokens.length === 0) {
      console.log("⚠️ No device tokens found for notification", {
        notificationId,
      });
      return;
    }

    // 3. Prepare messages
    const messages: ExpoMessage[] = uniqueTokens.map((token) => ({
      to: token,
      sound: "default",
      title: notification.title,
      body: notification.message,
      data: { screen: "notifications" },
    }));

    // 4. Send in batches
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

        // 5. Cleanup tokens
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
                entries.map(async ({ studentId, deviceId }) => {
                  await db
                    .collection("students")
                    .doc(studentId)
                    .collection("devices")
                    .doc(deviceId)
                    .delete();

                  console.log(
                    `Removed invalid token for device ${deviceId} in student ${studentId}`,
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
