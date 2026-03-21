import { initializeApp } from "firebase-admin/app";
import {
  DocumentData,
  FieldValue,
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
  expoPushTokens?: string[];
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
    const tokenMap: Record<string, string[]> = {};
    const tokens: string[] = [];
    students.forEach((student) => {
      (student.expoPushTokens || []).forEach((token: string) => {
        if (!tokenMap[token]) tokenMap[token] = [];
        tokenMap[token].push(student.id);
        tokens.push(token);
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
              (tokenMap[badToken] || []).forEach((studentId: string) => {
                db.collection("students")
                  .doc(studentId)
                  .update({
                    expoPushTokens: FieldValue.arrayRemove(badToken),
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
