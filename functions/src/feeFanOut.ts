import { getFirestore } from "firebase-admin/firestore";
import {
  FirestoreEvent,
  QueryDocumentSnapshot,
  onDocumentCreated,
} from "firebase-functions/v2/firestore";

// Lazy — see functions/src/authzSync.ts for why.
function db() {
  return getFirestore();
}

type FeeStructureDocument = {
  name: string;
  classId: string | null;
  amount: number;
  createdBy: string;
};

/**
 * Materializes one unpaid feePayments doc per applicable student when a
 * feeStructures doc is created — dues are materialized, not inferred (see
 * docs/decisions.md). classId null means school-wide.
 */
export const materializeFeePayments = onDocumentCreated(
  "feeStructures/{feeStructureId}",
  async (event: FirestoreEvent<QueryDocumentSnapshot | undefined>) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const feeStructureId = event.params.feeStructureId;
    const feeStructure = snapshot.data() as FeeStructureDocument;

    const studentsQuery = feeStructure.classId
      ? db().collection("students").where("classId", "==", feeStructure.classId)
      : db().collection("students");

    const studentsSnap = await studentsQuery.where("isActive", "==", true).get();

    console.log("💰 Materializing fee payments", {
      feeStructureId,
      classId: feeStructure.classId,
      studentCount: studentsSnap.size,
    });

    const now = new Date();
    const chunkSize = 400; // stay well under Firestore's 500-op batch limit
    const studentDocs = studentsSnap.docs;

    for (let i = 0; i < studentDocs.length; i += chunkSize) {
      const batch = db().batch();
      studentDocs.slice(i, i + chunkSize).forEach((studentDoc) => {
        const paymentRef = studentDoc.ref.collection("feePayments").doc();
        batch.set(paymentRef, {
          feeStructureId,
          amountDue: feeStructure.amount,
          amountPaid: 0,
          status: "unpaid",
          method: null,
          paidAt: null,
          recordedBy: feeStructure.createdBy,
          notes: "",
          createdAt: now,
          updatedAt: now,
        });
      });
      await batch.commit();
    }

    console.log("✅ Fee payments materialized", {
      feeStructureId,
      count: studentDocs.length,
    });
  },
);
