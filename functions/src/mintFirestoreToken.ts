import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";

/**
 * Bridges the native `@react-native-firebase/auth` session into the web
 * `firebase/firestore` JS SDK client used for Firestore on every platform
 * (see docs/decisions.md and firebaseSetup.ts). The two are separate
 * Firebase App instances with no shared session on native, so Firestore
 * calls there would otherwise carry no `request.auth` at all and fail
 * every isSignedIn()-gated rule.
 *
 * Called via the native Functions SDK, which authenticates the request
 * with the caller's verified native ID token — `request.auth.uid` below
 * is populated by that verification, not client-supplied.
 */
export const mintFirestoreToken = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  const phoneNumber = request.auth.token.phone_number as string | undefined;
  const token = await getAuth().createCustomToken(
    request.auth.uid,
    phoneNumber ? { phone_number: phoneNumber } : undefined,
  );
  return { token };
});
