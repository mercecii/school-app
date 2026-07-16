// DATABASE TABLES
// v2 schema — see docs/firestore-schema.md for the authoritative reference
// and docs/decisions.md for the reasoning behind each shape.

import { Timestamp } from "firebase/firestore";

/**
 * admins/{uid} — UID-keyed. Seeded manually (console / privileged backend),
 * never self-registered through the app.
 */
export type AdminDoc = {
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  role: "admin";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
};

/**
 * {admins,teachers,parents}/{id}/devices/{deviceId} — push tokens live under
 * the three login-holding roles only. Students never authenticate in v1.
 */
export type DeviceDoc = {
  token: string;
  platform: string;
  updatedAt: Timestamp;
};

/**
 * teachers/{autoId} — auto-ID, not UID-keyed. Admin pre-creates with a phone
 * number; teacher self-serves via OTP, app looks up by `phone` and sets
 * `authUid` (same mechanism as parents — share the implementation).
 */
export type TeacherDoc = {
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  authUid: string | null;
  classIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
};

/**
 * parents/{autoId} — auto-ID, not UID-keyed. Replaces the old doc-ID
 * migration (`ensureStudentDocUsesUid`) that keyed the student doc itself
 * by UID. Same phone-adopt pattern as teachers.
 */
export type ParentDoc = {
  fullName: string;
  phone: string;
  email: string;
  isActive: boolean;
  authUid: string | null;
  childStudentIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
};

export type FeePaymentStatus = "unpaid" | "partial" | "paid";
export type FeePaymentMethod = "cash" | "bank_transfer" | "cheque" | "other";

/**
 * students/{studentId}/feePayments/{autoId} — materialized per applicable
 * student when a feeStructures doc is created/activated, not inferred from
 * absence of a record.
 */
export type FeePaymentDoc = {
  feeStructureId: string;
  amountDue: number;
  amountPaid: number;
  status: FeePaymentStatus;
  method: FeePaymentMethod | null;
  paidAt: Timestamp | null;
  recordedBy: string; // admin uid
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/**
 * students/{autoId} — auto-ID, admin-created. Never an auth identity in v1:
 * no authUid, no devices subcollection.
 */
export type StudentDoc = {
  fullName: string;
  gender: string;
  classId: string; // current class only; no year-over-year history in v1
  rollNumber: string;
  isActive: boolean;
  parentUids: string[]; // auth UIDs (not parent doc IDs) — set at parent-adoption time
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/**
 * classes/{autoId} — normalizes what were free-text class/section fields
 * duplicated per student.
 */
export type ClassDoc = {
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  classTeacherId: string | null; // admin-assigned teacher doc ID — source of truth, always known even before the teacher has logged in
  classTeacherUid: string | null; // derived auth UID, synced server-side once that teacher has adopted (same "don't key by a UID that doesn't exist yet" problem as parents/students)
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

/**
 * attendance/{studentId}_{date} — per-student, per-day. Not a per-class map:
 * Firestore rules grant read access per-document, never per-map-key, so a
 * map-per-class doc would let any authorized reader see every student's
 * status for that class. Teacher still marks a whole class in one UI
 * action — it's a single batched write producing many of these docs.
 */
export type AttendanceDoc = {
  studentId: string;
  classId: string;
  date: string; // "YYYY-MM-DD", sortable
  status: AttendanceStatus;
  markedBy: string; // teacher auth uid
  markedAt: Timestamp;
};

/**
 * feeStructures/{autoId} — defines what's owed. v1 is manual/offline
 * tracking only, no payment gateway.
 */
export type FeeStructureDoc = {
  name: string;
  classId: string | null; // null = school-wide
  amount: number;
  dueDate: Timestamp;
  academicYear: string;
  isActive: boolean;
  createdBy: string; // admin uid
  createdAt: Timestamp;
};

export type NotificationTargetType = "school" | "class" | "individual";
export type NotificationCreatorRole = "admin" | "teacher";
export type NotificationTargetRole = "admin" | "teacher" | "parent";

/**
 * notifications/{autoId} — flat collection, not fanned out per recipient.
 * `targetValue` is null for "school", a classId for "class", and the
 * recipient's role-doc `profileId` (not an auth UID — they may not have
 * logged in yet) for "individual". An individual notice "about" a student
 * targets the parent's profileId, since students never log in.
 * `targetRole` says which collection that profileId lives in — only
 * meaningful (and required) when targetType is "individual"; rules don't
 * need it (a caller only ever compares against their own authz.profileId,
 * which is unambiguous), but the Cloud Function that fans out push
 * notifications does, since it has to look the recipient up by ID going
 * the other direction.
 */
export type NotificationDoc = {
  title: string;
  message: string;
  targetType: NotificationTargetType;
  targetValue: string | null;
  targetRole: NotificationTargetRole | null;
  createdBy: string;
  createdByRole: NotificationCreatorRole;
  isActive: boolean;
  readBy: string[]; // no per-user read timestamp in v1
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type AuthzRole = "admin" | "teacher" | "parent";

/**
 * authz/{uid} — UID-keyed authorization index. Firestore rules can only
 * get() by a known path; they can't query "which parents doc has
 * authUid == request.auth.uid". This restores that resolution. Written at
 * phone-adoption time and whenever an admin changes a parent's children or
 * a teacher's classes.
 */
export type AuthzDoc = {
  role: AuthzRole;
  profileId: string; // the corresponding admins/teachers/parents doc ID
  childStudentIds?: string[]; // role === "parent"
  classIds?: string[]; // role === "teacher" (assigned classes), or role === "parent" (derived from children's classIds)
  updatedAt: Timestamp;
};

// DATABASE TABLES - END

// FIREBASE AUTH USER INFO
export type FirebaseUserInfo = {
  localId: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  passwordUpdatedAt: number;
  providerUserInfo: ProviderInfo[];
  validSince: string;
  disabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  lastRefreshAt: string;
};

export type ProviderInfo = {
  providerId: string;
  federatedId: string;
  email: string;
  rawId: string;
};

export type GetAccountInfoResponse = {
  kind: "identitytoolkit#GetAccountInfoResponse";
  users: FirebaseUserInfo[];
};

// FIREBASE AUTH USER INFO - END
