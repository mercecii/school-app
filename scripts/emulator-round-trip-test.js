/**
 * One-shot verification script (not part of the app or CI) exercising the
 * exact trace advisor recommended before building screens on top of the
 * v2 foundation: admin seeds a class/students/parent -> parent "logs in"
 * (phone-adopt, replicating utils/phoneRoleAdoption.ts) -> the
 * syncParentAuthz Cloud Function fires -> authz + parentUids fan-out
 * lands -> the parent can read their own child's attendance/profile and
 * is denied a classmate's.
 *
 * Run against `firebase emulators:start --only auth,firestore,functions`.
 */
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
process.env.GCLOUD_PROJECT = "demo-schoolapp";

const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  connectAuthEmulator,
  signInWithCustomToken,
} = require("firebase/auth");
const {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  writeBatch,
  serverTimestamp,
} = require("firebase/firestore");

const PROJECT_ID = "demo-schoolapp";

admin.initializeApp({ projectId: PROJECT_ID });
const adb = admin.firestore();

const clientApp = initializeApp({ projectId: PROJECT_ID, apiKey: "fake-api-key" });
const clientAuth = getAuth(clientApp);
connectAuthEmulator(clientAuth, "http://localhost:9099", {
  disableWarnings: true,
});
const cdb = getFirestore(clientApp);
connectFirestoreEmulator(cdb, "localhost", 8080);

// Separate app instance for the teacher so their session doesn't clobber
// the parent's — both actors need to be live at once to test cross-role
// rules (teacher writes attendance, parent reads only their own child's).
const teacherApp = initializeApp(
  { projectId: PROJECT_ID, apiKey: "fake-api-key" },
  "teacherApp",
);
const teacherAuth = getAuth(teacherApp);
connectAuthEmulator(teacherAuth, "http://localhost:9099", {
  disableWarnings: true,
});
const tdb = getFirestore(teacherApp);
connectFirestoreEmulator(tdb, "localhost", 8080);

let pass = 0;
let fail = 0;
function check(label, condition) {
  if (condition) {
    console.log(`✅ ${label}`);
    pass++;
  } else {
    console.log(`❌ ${label}`);
    fail++;
  }
}

async function waitForAuthz(uid, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const snap = await adb.collection("authz").doc(uid).get();
    if (snap.exists) return snap.data();
    await new Promise((r) => setTimeout(r, 300));
  }
  return null;
}

async function main() {
  console.log("Seeding via Admin SDK (bypasses rules)...");
  const now = admin.firestore.FieldValue.serverTimestamp();

  const classRef = adb.collection("classes").doc();
  await classRef.set({
    name: "Class 5 - A",
    grade: "5",
    section: "A",
    academicYear: "2026",
    classTeacherId: null,
    classTeacherUid: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  const studentA = adb.collection("students").doc();
  await studentA.set({
    fullName: "Student A",
    gender: "F",
    classId: classRef.id,
    rollNumber: "1",
    isActive: true,
    parentUids: [],
    createdAt: now,
    updatedAt: now,
  });

  const studentB = adb.collection("students").doc();
  await studentB.set({
    fullName: "Student B",
    gender: "M",
    classId: classRef.id,
    rollNumber: "2",
    isActive: true,
    parentUids: [],
    createdAt: now,
    updatedAt: now,
  });

  const parentPhone = "+911111111111";
  const parentRef = adb.collection("parents").doc();
  await parentRef.set({
    fullName: "Parent A",
    phone: parentPhone,
    email: "",
    isActive: true,
    authUid: null,
    childStudentIds: [studentA.id],
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  });

  const teacherPhone = "+912222222222";
  const teacherRef = adb.collection("teachers").doc();
  await teacherRef.set({
    fullName: "Teacher A",
    email: "",
    phone: teacherPhone,
    isActive: true,
    authUid: null,
    classIds: [classRef.id],
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  });

  const dateStr = "2026-07-14";
  await adb
    .collection("attendance")
    .doc(`${studentA.id}_${dateStr}`)
    .set({
      studentId: studentA.id,
      classId: classRef.id,
      date: dateStr,
      status: "present",
      markedBy: "seed-script",
      markedAt: now,
    });
  await adb
    .collection("attendance")
    .doc(`${studentB.id}_${dateStr}`)
    .set({
      studentId: studentB.id,
      classId: classRef.id,
      date: dateStr,
      status: "absent",
      markedBy: "seed-script",
      markedAt: now,
    });

  console.log("Creating Auth user + signing in as the parent...");
  const authUser = await admin.auth().createUser({ phoneNumber: parentPhone });
  const customToken = await admin
    .auth()
    .createCustomToken(authUser.uid, { phone_number: parentPhone });
  await signInWithCustomToken(clientAuth, customToken);

  console.log("Client-side phone lookup + adopt write (replicates phoneRoleAdoption.ts exactly)...");
  // Exercises the actual findByPhone() query shape, not just the adopt
  // write — a prior version of this script skipped straight to the write
  // using the Admin-SDK-known doc ID, which never caught that findByPhone's
  // old fuzzy `where("phone","in",candidates)` query was unauthorizable by
  // rules (Firestore can't statically prove an `in` query safe against
  // isPhoneOwner()) and always threw permission-denied before ever reaching
  // the write. See docs/decisions.md 2026-07-16 entry.
  let lookupError = null;
  let lookupSnap = null;
  try {
    lookupSnap = await getDocs(
      query(collection(cdb, "parents"), where("phone", "==", parentPhone)),
    );
  } catch (e) {
    lookupError = e;
  }
  check("Parent phone lookup query allowed by rules", !lookupError);
  if (lookupError) console.log("   ", lookupError.message);
  check(
    "Parent phone lookup finds exactly the seeded doc",
    !!lookupSnap && lookupSnap.size === 1 && lookupSnap.docs[0].id === parentRef.id,
  );

  let adoptError = null;
  try {
    await updateDoc(doc(cdb, "parents", parentRef.id), {
      authUid: authUser.uid,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    adoptError = e;
  }
  check("Parent adopt write allowed by rules", !adoptError);
  if (adoptError) console.log("   ", adoptError.message);

  console.log("Waiting for syncParentAuthz Cloud Function fan-out...");
  const authzData = await waitForAuthz(authUser.uid);
  check("authz/{uid} created by Cloud Function", !!authzData);
  if (authzData) {
    check("authz.role === 'parent'", authzData.role === "parent");
    check("authz.profileId === parent doc id", authzData.profileId === parentRef.id);
    check(
      "authz.childStudentIds fanned out correctly",
      JSON.stringify(authzData.childStudentIds) === JSON.stringify([studentA.id]),
    );
    check(
      "authz.classIds derived from child's class",
      JSON.stringify(authzData.classIds) === JSON.stringify([classRef.id]),
    );
  }

  const studentASnap = await adb.collection("students").doc(studentA.id).get();
  check(
    "students.parentUids fanned out with parent's authUid",
    (studentASnap.data().parentUids || []).includes(authUser.uid),
  );

  console.log("Testing rules-enforced reads as the parent...");

  let ownChildRead = null;
  try {
    ownChildRead = await getDoc(doc(cdb, "students", studentA.id));
  } catch (e) {
    ownChildRead = e;
  }
  check(
    "Parent CAN read own child's student doc",
    ownChildRead && typeof ownChildRead.exists === "function" && ownChildRead.exists(),
  );

  let otherChildRead = null;
  try {
    otherChildRead = await getDoc(doc(cdb, "students", studentB.id));
    otherChildRead = { deniedButSucceeded: true };
  } catch (e) {
    otherChildRead = e;
  }
  check(
    "Parent CANNOT read classmate's student doc",
    otherChildRead && otherChildRead.code === "permission-denied",
  );

  let ownAttendanceRead = null;
  try {
    ownAttendanceRead = await getDoc(
      doc(cdb, "attendance", `${studentA.id}_${dateStr}`),
    );
  } catch (e) {
    ownAttendanceRead = e;
  }
  check(
    "Parent CAN read own child's attendance",
    ownAttendanceRead &&
      typeof ownAttendanceRead.exists === "function" &&
      ownAttendanceRead.exists(),
  );

  let otherAttendanceRead = null;
  try {
    await getDoc(doc(cdb, "attendance", `${studentB.id}_${dateStr}`));
    otherAttendanceRead = { deniedButSucceeded: true };
  } catch (e) {
    otherAttendanceRead = e;
  }
  check(
    "Parent CANNOT read classmate's attendance (per-student-doc privacy fix)",
    otherAttendanceRead && otherAttendanceRead.code === "permission-denied",
  );

  console.log("\nCreating Auth user + signing in as the teacher...");
  const teacherAuthUser = await admin
    .auth()
    .createUser({ phoneNumber: teacherPhone });
  const teacherCustomToken = await admin
    .auth()
    .createCustomToken(teacherAuthUser.uid, { phone_number: teacherPhone });
  await signInWithCustomToken(teacherAuth, teacherCustomToken);

  console.log("Teacher client-side phone lookup + adopt write...");
  let teacherLookupError = null;
  let teacherLookupSnap = null;
  try {
    teacherLookupSnap = await getDocs(
      query(collection(tdb, "teachers"), where("phone", "==", teacherPhone)),
    );
  } catch (e) {
    teacherLookupError = e;
  }
  check("Teacher phone lookup query allowed by rules", !teacherLookupError);
  if (teacherLookupError) console.log("   ", teacherLookupError.message);
  check(
    "Teacher phone lookup finds exactly the seeded doc",
    !!teacherLookupSnap &&
      teacherLookupSnap.size === 1 &&
      teacherLookupSnap.docs[0].id === teacherRef.id,
  );

  let teacherAdoptError = null;
  try {
    await updateDoc(doc(tdb, "teachers", teacherRef.id), {
      authUid: teacherAuthUser.uid,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    teacherAdoptError = e;
  }
  check("Teacher adopt write allowed by rules", !teacherAdoptError);

  const teacherAuthzData = await waitForAuthz(teacherAuthUser.uid);
  check("authz/{uid} created for teacher by syncTeacherAuthz", !!teacherAuthzData);
  if (teacherAuthzData) {
    check(
      "Teacher authz.classIds matches assigned class",
      JSON.stringify(teacherAuthzData.classIds) === JSON.stringify([classRef.id]),
    );
  }

  console.log("Teacher reads own class roster...");
  let rosterRead = null;
  try {
    rosterRead = await getDocs(
      query(collection(tdb, "students"), where("classId", "==", classRef.id)),
    );
  } catch (e) {
    rosterRead = e;
  }
  check(
    "Teacher CAN read the roster of their assigned class",
    rosterRead && typeof rosterRead.size === "number" && rosterRead.size === 2,
  );

  console.log("Teacher marks attendance via batched write (mark-attendance.tsx path)...");
  let batchError = null;
  try {
    const batch = writeBatch(tdb);
    batch.set(doc(tdb, "attendance", `${studentA.id}_${dateStr}`), {
      studentId: studentA.id,
      classId: classRef.id,
      date: dateStr,
      status: "present",
      markedBy: teacherAuthUser.uid,
      markedAt: serverTimestamp(),
    });
    batch.set(doc(tdb, "attendance", `${studentB.id}_${dateStr}`), {
      studentId: studentB.id,
      classId: classRef.id,
      date: dateStr,
      status: "present",
      markedBy: teacherAuthUser.uid,
      markedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (e) {
    batchError = e;
  }
  check("Teacher's batched attendance write is allowed by rules", !batchError);

  let parentRereadOwnChild = null;
  try {
    parentRereadOwnChild = await getDoc(
      doc(cdb, "attendance", `${studentA.id}_${dateStr}`),
    );
  } catch (e) {
    parentRereadOwnChild = e;
  }
  check(
    "After teacher's write, parent CAN still read own child's attendance",
    parentRereadOwnChild &&
      typeof parentRereadOwnChild.exists === "function" &&
      parentRereadOwnChild.exists(),
  );

  let parentRereadOtherChild = null;
  try {
    await getDoc(doc(cdb, "attendance", `${studentB.id}_${dateStr}`));
    parentRereadOtherChild = { deniedButSucceeded: true };
  } catch (e) {
    parentRereadOtherChild = e;
  }
  check(
    "After teacher's write, parent STILL CANNOT read classmate's attendance",
    parentRereadOtherChild && parentRereadOtherChild.code === "permission-denied",
  );

  console.log(`\n${pass} passed, ${fail} failed.`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Script error:", e);
  process.exit(1);
});
