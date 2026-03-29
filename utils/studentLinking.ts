import { StudentDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

type AuthUserLike = {
  uid: string;
  phoneNumber: string | null;
};

async function getTypedDoc<T>(
  collectionName: string,
  id: string,
): Promise<T | null> {
  const snap = await getDoc(doc(firestore, collectionName, id));
  if (!snap.exists()) return null;
  return snap.data() as T;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

async function findStudentByPhone(phoneNumber: string) {
  const normalizedAuthPhone = normalizePhone(phoneNumber);
  const last10 =
    normalizedAuthPhone.length >= 10
      ? normalizedAuthPhone.slice(-10)
      : normalizedAuthPhone;

  const matchSet = new Set<string>();
  if (phoneNumber) matchSet.add(phoneNumber);
  if (normalizedAuthPhone) {
    matchSet.add(normalizedAuthPhone);
    if (!normalizedAuthPhone.startsWith("+")) {
      matchSet.add(`+${normalizedAuthPhone}`);
    }
  }
  if (last10) {
    matchSet.add(last10);
    matchSet.add(`+91${last10}`);
    matchSet.add(`91${last10}`);
  }

  const candidates = Array.from(matchSet).filter(Boolean).slice(0, 10);
  if (!candidates.length) return null;

  const snapshot = await getDocs(
    query(
      collection(firestore, "students"),
      where("parentPhone", "in", candidates),
    ),
  );

  if (snapshot.empty) return null;

  const exactMatches = snapshot.docs.filter((d) => {
    const stored = normalizePhone(String(d.data()?.parentPhone ?? ""));
    return (
      stored === normalizedAuthPhone ||
      (last10.length === 10 && stored.endsWith(last10))
    );
  });

  return exactMatches.length === 1 ? exactMatches[0] : null;
}

/**
 * Ensures a Firestore student document exists at students/{uid}.
 * If a record is found by parentPhone under a different doc id, it is migrated
 * atomically (set new + delete old). Never creates a new student record —
 * returns null if no matching student is found, which triggers the fallback screen.
 */
export async function ensureStudentDocUsesUid(
  authUser: AuthUserLike,
): Promise<StudentDoc | null> {
  const uid = authUser.uid;

  const existingByUid = await getTypedDoc<StudentDoc>("students", uid);
  if (existingByUid) return existingByUid;

  const authPhone = authUser.phoneNumber;
  if (!authPhone) return null;

  const matchedDoc = await findStudentByPhone(authPhone);
  if (!matchedDoc) return null;

  const matchedData = matchedDoc.data() as StudentDoc;

  if (matchedDoc.id === uid) return matchedData;

  const uidRef = doc(firestore, "students", uid);

  // Guard: another concurrent login may have already migrated it.
  const uidSnap = await getDoc(uidRef);
  if (uidSnap.exists()) return uidSnap.data() as StudentDoc;

  const batch = writeBatch(firestore);
  batch.set(uidRef, matchedData);
  batch.delete(doc(firestore, "students", matchedDoc.id));
  await batch.commit();

  const linked = await getDoc(uidRef);
  return linked.exists() ? (linked.data() as StudentDoc) : null;
}
