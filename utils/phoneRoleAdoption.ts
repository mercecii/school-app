import { firestore } from "@/firebaseSetup/firebaseSetup";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

/**
 * Shared phone-adopt resolver for `teachers` and `parents` — both are
 * auto-ID collections, pre-created by an admin with a `phone` field and a
 * null `authUid`. On first login the caller is matched by phone and the
 * *same* doc gets its `authUid` set in place (no doc-ID migration, unlike
 * the old students/{uid} approach — see docs/decisions.md).
 *
 * Firestore rules only authorize the adopting update when
 * `request.auth.token.phone_number` exactly equals the doc's stored
 * `phone` field, via `isPhoneOwner(resource.data.phone)`. The lookup query
 * below must therefore filter on the *exact* auth phone number and nothing
 * else: Firestore's rules engine only permits a list query when it can
 * statically prove every possible match satisfies the rule, which for
 * `isPhoneOwner` only holds when the query's equality filter is literally
 * `request.auth.token.phone_number`. An `in`-query over several candidate
 * formats (previously used here to tolerate admin data-entry variance) is
 * not provable that way and gets the whole query rejected with
 * `permission-denied` — even when a matching doc exists — which is a
 * dead end, not a fallback. Phone numbers must be stored in exact E.164
 * form (already enforced at entry by `utils/phoneValidation.ts`).
 */
export type PhoneLoginCollection = "teachers" | "parents";

export type PhoneAdoptableDoc = {
  phone: string;
  authUid: string | null;
  isActive: boolean;
};

type AuthUserLike = {
  uid: string;
  phoneNumber: string | null;
};

export type ResolvePhoneLoginResult<T> =
  | { status: "resolved"; id: string; data: T }
  | { status: "not-found" }
  | { status: "already-adopted-by-other-account"; id: string }
  | { status: "deactivated" };

async function findByAuthUid<T extends PhoneAdoptableDoc>(
  collectionName: PhoneLoginCollection,
  uid: string,
): Promise<{ id: string; data: T } | null> {
  const snapshot = await getDocs(
    query(
      collection(firestore, collectionName),
      where("authUid", "==", uid),
    ),
  );
  if (snapshot.empty) return null;
  const first = snapshot.docs[0];
  return { id: first.id, data: first.data() as T };
}

async function findByPhone<T extends PhoneAdoptableDoc>(
  collectionName: PhoneLoginCollection,
  phoneNumber: string,
): Promise<{ id: string; data: T } | null> {
  if (!phoneNumber) return null;

  // Must filter on the exact auth phone number — see the module-level
  // comment on why a fuzzy/multi-candidate query can't be authorized.
  const snapshot = await getDocs(
    query(
      collection(firestore, collectionName),
      where("phone", "==", phoneNumber),
    ),
  );
  if (snapshot.empty || snapshot.docs.length !== 1) return null;
  const match = snapshot.docs[0];
  return { id: match.id, data: match.data() as T };
}

/**
 * Resolves the caller's `teachers`/`parents` doc by phone, adopting
 * `authUid` on first login. Never creates a new doc — admin must
 * pre-create it. Returns a discriminated result so the caller can tell
 * "not registered" apart from "found, but can't adopt" instead of both
 * collapsing to null.
 */
export async function resolvePhoneLoginRole<T extends PhoneAdoptableDoc>(
  collectionName: PhoneLoginCollection,
  authUser: AuthUserLike,
): Promise<ResolvePhoneLoginResult<T>> {
  const byUid = await findByAuthUid<T>(collectionName, authUser.uid);
  if (byUid) {
    if (!byUid.data.isActive) return { status: "deactivated" };
    return { status: "resolved", ...byUid };
  }

  const authPhone = authUser.phoneNumber;
  if (!authPhone) return { status: "not-found" };

  const matched = await findByPhone<T>(collectionName, authPhone);
  if (!matched) return { status: "not-found" };

  if (matched.data.authUid === authUser.uid) {
    if (!matched.data.isActive) return { status: "deactivated" };
    return { status: "resolved", id: matched.id, data: matched.data };
  }
  if (matched.data.authUid) {
    return {
      status: "already-adopted-by-other-account",
      id: matched.id,
    };
  }
  if (!matched.data.isActive) return { status: "deactivated" };

  const docRef = doc(firestore, collectionName, matched.id);
  await updateDoc(docRef, {
    authUid: authUser.uid,
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const updated = await getDoc(docRef);
  if (!updated.exists()) return { status: "not-found" };
  return { status: "resolved", id: updated.id, data: updated.data() as T };
}
