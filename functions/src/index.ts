import { initializeApp } from "firebase-admin/app";

initializeApp();

export { syncTeacherAuthz, syncParentAuthz } from "./authzSync";
export { sendExpoNotification } from "./sendNotification";
export { materializeFeePayments } from "./feeFanOut";
export { mintFirestoreToken } from "./mintFirestoreToken";
