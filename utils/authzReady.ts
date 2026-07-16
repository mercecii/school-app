import { firestore } from "@/firebaseSetup/firebaseSetup";
import { doc, onSnapshot } from "firebase/firestore";

/**
 * Waits for authz/{uid} to exist — populated asynchronously by the
 * syncTeacherAuthz/syncParentAuthz Cloud Functions after a teacher/parent
 * adopts (functions/src/authzSync.ts). Without this wait, a freshly
 * adopted user's very first session would hit permission-denied on every
 * authz-gated read (their own child's data, their own class's students)
 * because the server-side fan-out hasn't landed yet. See
 * docs/decisions.md — the "first-login race" finding.
 */
export function waitForAuthz(uid: string, timeoutMs = 20000): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = onSnapshot(
      doc(firestore, "authz", uid),
      (snap) => {
        if (settled || !snap.exists()) return;
        settled = true;
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        unsubscribe();
        resolve(false);
      },
    );
  });
}
