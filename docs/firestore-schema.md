# Firestore Schema — v2 target design

**Status: proposed, not yet implemented.** This is the target schema for the four-role rebuild (admin/teacher/parent/student + attendance + fees), decided in `docs/decisions.md` (see the 2026-07-14 entry and its follow-ups) before any of it was built. This file is a living reference, not a decision log — update it in place as the schema evolves; check `docs/decisions.md` for the *why* behind each shape.

This supersedes the previous version of this file, which described a `students/{uid}`-centric design (student-as-login, `students/{uid}/fees`, `students/{uid}/notifications`) that never matched what was actually deployed and predates the role redesign.

---

## admins/{uid}

UID-keyed — admin accounts are seeded manually (console / privileged backend), never self-registered.

- fullName: string
- email: string
- phone: string
- isActive: boolean
- role: "admin"
- createdAt, updatedAt, lastLoginAt: timestamp

### admins/{uid}/devices/{deviceId}
- platform: string
- token: string
- updatedAt: timestamp

---

## teachers/{autoId}

Auto-ID — admin pre-creates with a phone number, no UID yet. Teacher self-serves via OTP login; app looks up by `phone` and sets `authUid` (same mechanism as `parents`, share the implementation).

- fullName: string
- email: string
- phone: string
- isActive: boolean
- authUid: string | null
- classIds: string[] — classes this teacher is assigned to teach
- createdAt, updatedAt, lastLoginAt: timestamp

### teachers/{autoId}/devices/{deviceId}
- platform: string
- token: string
- updatedAt: timestamp

---

## parents/{autoId}

Auto-ID — same phone-adopt pattern as `teachers`. Replaces the old doc-ID-migration approach (`ensureStudentDocUsesUid`) that keyed the student doc itself by UID.

- fullName: string
- phone: string
- email: string
- isActive: boolean
- authUid: string | null
- childStudentIds: string[] — student doc IDs this parent can see
- createdAt, updatedAt, lastLoginAt: timestamp

### parents/{autoId}/devices/{deviceId}
- platform: string
- token: string
- updatedAt: timestamp

---

## students/{autoId}

Auto-ID, admin-created. **Never an auth identity in v1** — no `authUid`, no `devices` subcollection.

- fullName: string
- gender: string
- classId: string — current class only; no year-over-year history in v1
- rollNumber: string
- isActive: boolean
- parentUids: string[] — **auth UIDs** (not parent doc IDs) of guardians, populated at parent-adoption time so rules can check `request.auth.uid in parentUids` directly
- createdAt, updatedAt: timestamp

### students/{autoId}/feePayments/{autoId}
Materialized per applicable student when a `feeStructures` doc is created/activated — not inferred from absence.

- feeStructureId: string
- amountDue: number
- amountPaid: number
- status: "unpaid" | "partial" | "paid"
- method: "cash" | "bank_transfer" | "cheque" | "other" | null
- paidAt: timestamp | null
- recordedBy: string (admin uid)
- notes: string
- createdAt, updatedAt: timestamp

---

## classes/{autoId}

New collection — normalizes what was free-text `class`/`section` fields duplicated per student.

- name: string (e.g. "Class 5 - A")
- grade: string
- section: string
- academicYear: string
- classTeacherId: string | null — admin-assigned **teacher doc ID**, source of truth, always known even before that teacher has ever logged in
- classTeacherUid: string | null — derived **auth UID**, synced server-side (Cloud Function, see `authz` below) once that teacher has adopted — same reasoning as `students.parentUids`
- isActive: boolean
- createdAt, updatedAt: timestamp

*Deferred:* whether attendance-marking permission is homeroom-only (`classTeacherUid`) or extends to any teacher assigned via `teacherIds`/`teacherUids` — settle when writing rules.

---

## attendance/{studentId}_{date}

**Per-student, per-day doc — not a per-class map.** (Reversed from an earlier per-class-map design; see `docs/decisions.md` — Firestore rules grant read access per-document, never per-map-key, so a map-per-class doc would let any authorized reader see every student's status for that class, not just their own child's.)

Teacher still marks a whole class in one UI action — it's a single batched write producing ~30-40 of these docs, not 30-40 separate user actions.

- studentId: string
- classId: string
- date: string ("YYYY-MM-DD", sortable)
- status: "present" | "absent" | "late" | "excused"
- markedBy: string (teacher auth uid)
- markedAt: timestamp

Query patterns:
- Teacher's daily class view: `where('classId','==',X).where('date','==',Y)`
- Parent's child history: `where('studentId','==',X).orderBy('date','desc')`

---

## feeStructures/{autoId}

Defines what's owed. v1 is manual/offline tracking only — no payment gateway.

- name: string (e.g. "Term 1 Tuition")
- classId: string | null — null means school-wide
- amount: number
- dueDate: timestamp
- academicYear: string
- isActive: boolean
- createdBy: string (admin uid)
- createdAt: timestamp

Creating/activating this doc should fan out one `unpaid` `feePayments` doc (see under `students/{autoId}/feePayments`) per applicable student.

---

## notifications/{autoId}

Flat collection, not fanned out per recipient — a school-wide post stays one cheap write. Extended for teacher-authored, class-scoped posts; fixed a per-document-read gap and a stale doc-shape carryover from the pre-redesign schema (see `docs/decisions.md`).

- title: string
- message: string
- targetType: "school" | "class" | "individual"
- targetValue: string | null — null for "school"; `classId` for "class"; the recipient's **role-doc `profileId`** (not an auth UID — the recipient may not have logged in yet) for "individual". An individual notice "about" a student targets the parent's `profileId`, since students never log in.
- targetRole: "admin" | "teacher" | "parent" | null — which collection `targetValue` is a `profileId` in; only set (and required) when targetType is "individual". Rules don't need this (a caller only compares against their own `authz.profileId`), but the push-fanout Cloud Function does — it has to resolve the recipient going the other direction.
- createdBy: string (uid)
- createdByRole: "admin" | "teacher"
- isActive: boolean
- readBy: string[] — who has read it; no per-user read timestamp in v1 (`readAt`/`readReceipt` from the old schema dropped as meaningless on a multi-recipient doc)
- createdAt, updatedAt: timestamp

Read rule shape (resolved via `authz`, see below):
- `targetType == "school"` → any signed-in user
- `targetType == "class"` → caller's `authz.classIds` (teacher) or `authz.classIds` (parent, derived — see below) contains `targetValue`
- `targetType == "individual"` → caller's `authz.profileId == targetValue`
- Admin: always.
- The `readBy`-append update rule must repeat this same predicate — write rules don't inherit read scoping.

Client feed query: `school-wide ∪ my class(es) ∪ individual-to-me` is three queries merged client-side (or a capped `or()` filter), not one query — plan the client code for that.

---

## authz/{uid}

**UID-keyed authorization index — restores the "who is calling" resolution that auto-ID `parents`/`teachers` docs lost.** Firestore rules can only `get()` by a known path; they can't query "which `parents` doc has `authUid == request.auth.uid`". `allow write: if false` in rules — the only writer is the `syncTeacherAuthz`/`syncParentAuthz` Cloud Functions (`functions/src/authzSync.ts`), triggered on `teachers`/`parents` doc writes, at phone-adoption time and whenever an admin changes a parent's children or a teacher's classes.

- role: "admin" | "teacher" | "parent"
- profileId: string — the corresponding `admins`/`teachers`/`parents` doc ID
- childStudentIds: string[] — present for role "parent"
- classIds: string[] — present for role "teacher" (their assigned classes) **and for role "parent"** (derived: the union of `classId` across each linked child in `childStudentIds`) — needed because rules can't loop `childStudentIds → get(student) → classId` at read time; it must be denormalized up front.
- updatedAt: timestamp
