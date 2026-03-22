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

type ExpoPushTokenEntry = {
  token: string;
  deviceId: string;
  platform: "android" | "ios";
  lastSeenAt: any;
};

type StudentDocument = {
  id: string;
  class?: string;
  expoPushTokens?: ExpoPushTokenEntry[];
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
    if (!snapshot) return;

    const notification = snapshot.data() as NotificationDocument;

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

    // 2. Collect tokens
    const tokenMap: Record<string, { studentId: string; deviceId: string }[]> =
      {};
    const tokens: string[] = [];

    students.forEach((student) => {
      (student.expoPushTokens || []).forEach((entry: ExpoPushTokenEntry) => {
        if (!tokenMap[entry.token]) tokenMap[entry.token] = [];
        tokenMap[entry.token].push({
          studentId: student.id,
          deviceId: entry.deviceId,
        });
        tokens.push(entry.token);
      });
    });

    const uniqueTokens = Array.from(new Set(tokens));

    if (uniqueTokens.length === 0) return;

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
      try {
        const res = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch),
        });
        const result = (await res.json()) as ExpoPushResponse;

        // 5. Cleanup tokens
        if (Array.isArray(result.data)) {
          result.data.forEach((ticket: ExpoTicket, idx: number) => {
            if (
              ticket.status === "error" &&
              ticket.details &&
              ticket.details.error === "DeviceNotRegistered"
            ) {
              const badToken = batch[idx].to;
              const entries = tokenMap[badToken] || [];

              entries.forEach(({ studentId, deviceId }) => {
                // Get current tokens and filter out the bad device
                db.collection("students")
                  .doc(studentId)
                  .get()
                  .then((doc) => {
                    if (!doc.exists) return;

                    const data = doc.data();
                    if (!data) return;

                    const currentTokens: ExpoPushTokenEntry[] =
                      data.expoPushTokens || [];
                    const filteredTokens = currentTokens.filter(
                      (entry: ExpoPushTokenEntry) =>
                        entry.deviceId !== deviceId,
                    );

                    db.collection("students").doc(studentId).update({
                      expoPushTokens: filteredTokens,
                    });

                    console.log(
                      `Removed invalid token for device ${deviceId} in student ${studentId}`,
                    );
                  });
              });
            }
          });
        }
      } catch {
        // Ignore batch errors
      }
    }
  },
);
