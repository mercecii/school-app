import { getFirestore } from "firebase-admin/firestore";
import {
  FirestoreEvent,
  Change,
  DocumentSnapshot,
  onDocumentWritten,
} from "firebase-functions/v2/firestore";

// Lazy on purpose: this module is re-exported from index.ts, and ES module
// evaluation runs imports before the importing module's own top-level code —
// so a module-scope `getFirestore()` here would execute before index.ts's
// `initializeApp()` call and throw on cold start.
function db() {
  return getFirestore();
}

/**
 * Server-side sync for everything that has to be derived once a
 * teacher/parent adopts an authUid — never done client-side. See
 * docs/decisions.md: `authz` is `allow write: if false` in Firestore
 * rules, specifically so a client can't write itself an elevated role or
 * fabricated class/child assignments (the same shape as the admin
 * self-promotion bug already fixed in this repo).
 *
 * Three things get kept in sync off `teachers/{id}` and `parents/{id}`
 * writes:
 *   1. authz/{uid} — the "who is calling" index rules resolve against.
 *   2. students/{id}.parentUids — fanned out from a parent's authUid.
 *   3. classes/{id}.classTeacherUid — fanned out from a teacher's authUid,
 *      for any class whose classTeacherId points at this teacher.
 */

type TeacherDoc = {
  authUid: string | null;
  classIds?: string[];
};

type ParentDoc = {
  authUid: string | null;
  childStudentIds?: string[];
};

async function upsertAuthz(
  uid: string,
  data: Record<string, unknown>,
): Promise<void> {
  await db()
    .collection("authz")
    .doc(uid)
    .set({ ...data, updatedAt: new Date() }, { merge: false });
}

async function deleteAuthz(uid: string): Promise<void> {
  await db().collection("authz").doc(uid).delete().catch(() => undefined);
}

/**
 * Diff two id arrays and apply arrayUnion/arrayRemove of `uid` on the
 * given field across the affected docs in `collectionName`.
 */
async function syncUidOnLinkedDocs(
  collectionName: string,
  field: string,
  uid: string,
  before: string[],
  after: string[],
): Promise<void> {
  const removed = before.filter((id) => !after.includes(id));
  const added = after.filter((id) => !before.includes(id));

  const { FieldValue } = await import("firebase-admin/firestore");

  await Promise.all([
    ...removed.map((id) =>
      db()
        .collection(collectionName)
        .doc(id)
        .update({ [field]: FieldValue.arrayRemove(uid) })
        .catch(() => undefined),
    ),
    ...added.map((id) =>
      db()
        .collection(collectionName)
        .doc(id)
        .update({ [field]: FieldValue.arrayUnion(uid) })
        .catch(() => undefined),
    ),
  ]);
}

export const syncTeacherAuthz = onDocumentWritten(
  "teachers/{teacherId}",
  async (
    event: FirestoreEvent<
      Change<DocumentSnapshot> | undefined,
      { teacherId: string }
    >,
  ) => {
    const teacherId = event.params.teacherId;
    const before = event.data?.before?.exists
      ? (event.data.before.data() as TeacherDoc)
      : null;
    const after = event.data?.after?.exists
      ? (event.data.after.data() as TeacherDoc)
      : null;

    const beforeUid = before?.authUid ?? null;
    const afterUid = after?.authUid ?? null;

    // Deleted, or authUid cleared: tear down what this teacher owned.
    if (!after || (!afterUid && beforeUid)) {
      if (beforeUid) {
        await deleteAuthz(beforeUid);
        await clearClassTeacherUid(teacherId, beforeUid);
      }
      return;
    }

    if (!afterUid) return; // not adopted yet — nothing to sync

    if (beforeUid && beforeUid !== afterUid) {
      // authUid changed identity (shouldn't normally happen) — tear down old.
      await deleteAuthz(beforeUid);
      await clearClassTeacherUid(teacherId, beforeUid);
    }

    await upsertAuthz(afterUid, {
      role: "teacher",
      profileId: teacherId,
      classIds: after.classIds ?? [],
    });

    await syncClassTeacherUid(teacherId, afterUid);
  },
);

export const syncParentAuthz = onDocumentWritten(
  "parents/{parentId}",
  async (
    event: FirestoreEvent<
      Change<DocumentSnapshot> | undefined,
      { parentId: string }
    >,
  ) => {
    const parentId = event.params.parentId;
    const before = event.data?.before?.exists
      ? (event.data.before.data() as ParentDoc)
      : null;
    const after = event.data?.after?.exists
      ? (event.data.after.data() as ParentDoc)
      : null;

    const beforeUid = before?.authUid ?? null;
    const afterUid = after?.authUid ?? null;
    const beforeChildren = before?.childStudentIds ?? [];
    const afterChildren = after?.childStudentIds ?? [];

    // Deleted, or authUid cleared: tear down what this parent owned.
    if (!after || (!afterUid && beforeUid)) {
      if (beforeUid) {
        await deleteAuthz(beforeUid);
        await syncUidOnLinkedDocs(
          "students",
          "parentUids",
          beforeUid,
          beforeChildren,
          [],
        );
      }
      return;
    }

    if (!afterUid) return; // not adopted yet — nothing to sync

    if (beforeUid && beforeUid !== afterUid) {
      await deleteAuthz(beforeUid);
      await syncUidOnLinkedDocs(
        "students",
        "parentUids",
        beforeUid,
        beforeChildren,
        [],
      );
    }

    const priorChildrenForThisUid = beforeUid === afterUid ? beforeChildren : [];
    await syncUidOnLinkedDocs(
      "students",
      "parentUids",
      afterUid,
      priorChildrenForThisUid,
      afterChildren,
    );

    const classIds = await deriveClassIdsForStudents(afterChildren);
    await upsertAuthz(afterUid, {
      role: "parent",
      profileId: parentId,
      childStudentIds: afterChildren,
      classIds,
    });
  },
);

async function deriveClassIdsForStudents(
  studentIds: string[],
): Promise<string[]> {
  if (!studentIds.length) return [];
  const snaps = await Promise.all(
    studentIds.map((id) => db().collection("students").doc(id).get()),
  );
  const classIds = new Set<string>();
  snaps.forEach((snap) => {
    const classId = snap.exists ? (snap.data()?.classId as string) : null;
    if (classId) classIds.add(classId);
  });
  return Array.from(classIds);
}

async function syncClassTeacherUid(
  teacherId: string,
  teacherUid: string,
): Promise<void> {
  const snap = await db()
    .collection("classes")
    .where("classTeacherId", "==", teacherId)
    .get();
  await Promise.all(
    snap.docs.map((d) =>
      d.ref.update({ classTeacherUid: teacherUid }).catch(() => undefined),
    ),
  );
}

async function clearClassTeacherUid(
  teacherId: string,
  teacherUid: string,
): Promise<void> {
  const snap = await db()
    .collection("classes")
    .where("classTeacherId", "==", teacherId)
    .where("classTeacherUid", "==", teacherUid)
    .get();
  await Promise.all(
    snap.docs.map((d) =>
      d.ref.update({ classTeacherUid: null }).catch(() => undefined),
    ),
  );
}
