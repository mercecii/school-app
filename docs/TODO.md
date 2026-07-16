# v2 build TODO — roles, attendance, fees

Living checklist for turning the schema in `docs/firestore-schema.md` (design rationale in `docs/decisions.md`) into a working app. Check items off as they land; add new ones as they surface — don't let this drift out of sync with reality.

Three deferred decisions are baked into the checklist below where they matter (attendance-marking permission, notification read-scoping, dual-role tie-break) — settle each one when its task comes up, not before.

## 0. Prerequisite decision
- [ ] Resolve dual-role tie-break: can one phone hold both `teacher` and `parent`? **Default now actually implemented** in `AuthGate` (`app/_layout.tsx`): first-match-wins, checked in order admin → teacher → parent. Revisit only if a real dual-role person turns up.

## 1. Types (`firebaseSetup/fireBase.types.ts`) — DONE
- [x] `TeacherDoc`, `ParentDoc` (with `authUid: string | null`)
- [x] `StudentDoc` v2 (drop dead `pushToken` field, add `classId`, `parentUids: string[]`, drop auth-related fields)
- [x] `ClassDoc`
- [x] `AttendanceDoc`
- [x] `FeeStructureDoc`, `FeePaymentDoc`
- [x] `AuthzDoc`
- [x] `NotificationDoc` v2 (add `createdByRole`, extend `targetType`, drop `readAt`/`readReceipt`, `targetValue` now a role-doc `profileId` for "individual")

## 2. Firestore rules (`firestore.rules`) — DONE
- [x] `admins` — unchanged from today
- [x] `teachers` / `parents` — auto-ID, self-adopt authorized via `request.auth.token.phone_number` matching the doc's `phone` (restricted to setting `authUid`/`lastLoginAt`/`updatedAt` only); admin has full write
- [x] `students` — read scoped to admin, assigned teacher (`classId in authz.classIds`), or parent (`request.auth.uid in parentUids`); write admin-only for v1
- [x] `classes` — admin write; broad signed-in read (low-sensitivity roster metadata, not worth scoping)
- [x] `attendance` — per-student-per-day docs; create/update scoped to admin or any teacher assigned to the class (deferred homeroom-only-vs-any-assigned decided as any-assigned for now, easy to tighten later); read scoped to admin, that class's connected teacher, or specifically the student's own parent (not class-wide — this is the fix that made the per-student-doc flip meaningful); no teacher delete
- [x] `feeStructures` — admin-only write, signed-in read
- [x] `feePayments` (subcollection) — admin write; read scoped to admin/the specific student's parent
- [x] `notifications` — read/update scoped by `targetType`/`targetValue` resolved via `authz` (school → any signed-in; class → connected via `authz.classIds`; individual → `authz.profileId == targetValue`); create scoped to admin (any target) or teacher (class-only, own classes); readBy-append update rule repeats the read predicate
- [x] `authz` — `allow write: if false` — never client-writable; must be maintained server-side (Cloud Function on teacher/parent doc writes, see §3) — same principle as the admin self-promotion fix
- [x] Dry-run against both `ssr-juniors-dev` and `ssr-juniors` — compiled clean, no warnings
- [x] **Deployed to `ssr-juniors-dev`** (2026-07-16) — rules + `firestore.indexes.json`, via `firebase deploy --project ssr-juniors-dev --only firestore:rules,firestore:indexes`. Not deployed to `ssr-juniors` (production) — that's untouched. See §9 for what prompted this.

## 3. Auth / adoption logic
- [x] Shared client-side "resolve by phone, adopt authUid" helper — `utils/phoneRoleAdoption.ts`, parameterized by collection (`teachers` | `parents`). Writes only `authUid`/`lastLoginAt`/`updatedAt` on the doc itself (rules-enforced — see §2). Returns a discriminated result (`resolved` / `not-found` / `phone-format-mismatch` / `already-adopted-by-other-account`) rather than collapsing every failure to null — in particular, `phone-format-mismatch` exists because rules authorize the adopt-write via an *exact* match against `request.auth.token.phone_number`, but the candidate lookup that finds the doc is deliberately fuzzy (to tolerate how admin data entry formatted the number). **Consequence for §4 admin screens: teacher/parent `phone` fields must be entered in E.164 form (same format Firebase Phone Auth reports) or self-adopt will find the doc but fail the write with permission-denied.** Not yet wired into `AuthGate` — that's the next item below.
- [x] All of the `tsc --noEmit` fallout above is now fixed — full `tsc --noEmit` across the whole app is clean.
- [x] **Cloud Function** `functions/src/authzSync.ts` (`syncTeacherAuthz`, `syncParentAuthz` — `onDocumentWritten` on `teachers/{id}`/`parents/{id}`): maintains `authz/{uid}` (the only writer, since rules are `write: if false`), fans `authUid` into `students.parentUids` and `classes.classTeacherUid` (via the new `classTeacherId` field — see below), derives a parent's `authz.classIds` from their children's classes. Handles adopt, reassignment, and teardown (doc deleted / authUid cleared), not just the add case. `tsc --noEmit` + `eslint` + `npm run build` all clean in `functions/`.
- [x] `classes.classTeacherId` (teacher doc ID, admin-assigned) added alongside `classTeacherUid` (derived) — same deferred-UID problem as parents/students, caught while building the sync function. Logged in `docs/decisions.md`.
- [x] `AuthGate` (`app/_layout.tsx`) rewritten: admin → teacher → parent resolution, plus a `waitForAuthz` readiness gate (`utils/authzReady.ts`) so a freshly-adopted user doesn't hit permission-denied on their own first-session reads before the Cloud Function's fan-out lands. Distinct UI states for `phone-format-mismatch` / `already-adopted-by-other-account` / provisioning timeout instead of collapsing everything to "not registered."

## 4. Admin screens — DONE (v1)
- [x] Create teachers (`create-teacher.tsx`: phone E.164-validated, assign classes)
- [x] Create parents + link students (`create-parent.tsx`: phone E.164-validated, multi-select children via new `components/SelectField.tsx`)
- [x] Create students (`add-student.tsx` reworked: `classId` picker, no more embedded parent fields)
- [x] Create classes (`create-class.tsx`) + assign homeroom teacher (`manage-classes.tsx`, sets `classTeacherId`; `classTeacherUid` derives server-side)
- [x] Create fee structures (`create-fee-structure.tsx`) — fan-out wired via `materializeFeePayments` (§7)
- [x] Record fee payments (`manage-fees.tsx`: pick student, record partial/full payment, status auto-computed)
- [x] `create-notification.tsx` reworked for new targeting (school/class, `targetRole` unused for admin-created since it's only relevant to "individual")
- [x] `admin/_layout.tsx` drawer + `admin/index.tsx` tiles updated with all new screens
- Not built (out of v1 scope, no admin UI yet): editing/deactivating existing teacher/parent/student/class records, individual-targeted notifications from the admin UI (schema/rules support it, no screen yet)

## 5. Teacher screens — DONE (v1)
- [x] New `app/teacher/_layout.tsx` drawer route group (mirrors admin/pages pattern), `AuthGate` routes teacher role here
- [x] Mark daily attendance for an assigned class (`mark-attendance.tsx`) — single batched write → per-student docs; also loads and lets the teacher re-mark an already-recorded date (no separate edit window enforced yet — still an open deferred decision)
- [x] Post class-scoped announcement (`post-announcement.tsx`, `targetType: "class"`, `createdByRole: "teacher"`, scoped to the teacher's own `classIds`)
- [x] `components/CustomHeader.tsx` updated to show teacher/parent info too, not just admin/student

## 6. Parent screens — DONE (v1)
- [x] `dashboard.tsx` reworked: parent identity, child switcher (`setSelectedChildId` in Redux) for multi-child families, selected child's info
- [x] `attendance.tsx` reworked: real per-student attendance query + calendar view + monthly present/absent summary, scoped to `selectedChildId`
- [x] `fees.tsx` reworked: real `feePayments` subcollection query, due/paid/outstanding summary, scoped to `selectedChildId`
- [x] `notifications.tsx` reworked: the 3-query merge (school ∪ my class(es) ∪ individual-to-me) described in the schema doc, actually implemented
- [x] `calendar.tsx`, `profile.tsx`, `components/CustomHeader.tsx` fixed for the new `ParentDoc`/`StudentDoc` shapes (was reading dead `fullname`/`class`/`parentName`/`parentPhone` fields)
- [x] `pages/index.tsx` + `pages/_layout.tsx` pruned to only the screens with real v2 data behind them — pre-existing placeholder screens (homework, notes, video, syllabus, circular, apply-leave, daily-timetable, download, news-gallery, previous-year-question-paper) left untouched as files but unlinked, since they were out of scope for this pass and shouldn't masquerade as live features
- Full `tsc --noEmit` across the whole app is clean

## 7. Cloud Functions — DONE
- [x] `functions/src/feeFanOut.ts` (`materializeFeePayments`): creating a `feeStructures` doc materializes one `unpaid` `feePayments` doc per applicable student (by `classId`, or all active students if school-wide), chunked at 400/batch. Verified in emulator — both students in a seeded class got exactly one `feePayments` doc each.
- [x] `functions/src/sendNotification.ts` (`sendExpoNotification`, rewritten): reads devices from `admins`/`teachers`/`parents` (not `students`) — the structural fix for the already-logged "prod push non-functional" issue. Resolves recipients per `targetType`: "school" → everyone across all three role collections; "class" → teachers via `teachers.classIds array-contains`, parents via `authz` (`role=="parent" && classIds array-contains`); "individual" → direct lookup via the new `targetRole` field (added to `NotificationDoc` — needed because rules don't care which collection a profileId is in, but the function resolving push tokens does).
- [x] **Deployed to `ssr-juniors-dev`** (2026-07-16): `syncTeacherAuthz`, `syncParentAuthz`, `materializeFeePayments` (new), plus `sendExpoNotification`/`mintFirestoreToken` (updated) — via `firebase deploy --project ssr-juniors-dev --only functions`. See §9 for the bug found in `mintFirestoreToken` during this pass.

## 8. Cleanup carried over from the old schema
- [x] Confirmed nothing reads/writes `students/{uid}/devices` anymore — `pushTokenManager.ts`/`utils.ts` generalized to `{admins,teachers,parents}/{id}/devices`, `sendExpoNotification` rewritten to match
- [x] Dead `StudentDoc.pushToken` field — gone, the v2 `StudentDoc` type was written from scratch without it
- [x] Dead `utils/studentLinking.ts` (`ensureStudentDocUsesUid`) and `utils/getRoleAsync.ts` deleted — students no longer log in, so the doc-ID-migration login path is fully obsolete, not just unused
- [ ] Legacy prod `expoPushTokens` array (on the one real prod student doc) — still open, this is real production data on `ssr-juniors`, not something to touch from a dev session. Decide migrate-vs-discard with the user before touching prod.

## 8b. Foundation verification — DONE
- [x] `scripts/emulator-round-trip-test.js` — now covers **both** the parent path (admin seeds → parent phone-adopts → `syncParentAuthz` fan-out → reads own child's student doc + attendance, denied a classmate's) **and** the teacher path (teacher phone-adopts via a second client app instance → `syncTeacherAuthz` fan-out → reads own class roster → marks attendance via the same batched-write pattern the UI uses → parent re-verified to still only see their own child afterward). 18/18 checks passing.
- [x] Caught and fixed a real rules bug this way (not findable by `tsc`/dry-run): attendance read incorrectly used `isConnectedToClass()`, letting a parent read any classmate's attendance via class-wide connection. Logged in `docs/decisions.md`. Re-run this script after any future change to `firestore.rules` or `functions/src/authzSync.ts`.
- [x] **`firestore.indexes.json` populated** — was empty, which the emulator run couldn't have caught (the emulator auto-creates missing indexes; production doesn't). Six composite indexes added covering every multi-field query in the app/functions. Validated via `firebase deploy --only firestore:indexes --dry-run` against both real projects (structural check only — true sufficiency is only proven by the queries running in production without a `FAILED_PRECONDITION` error). Caught by the advisor during final review, not self-discovered — flagged prominently so "18/18 passing" isn't read as "indexes are proven correct."

## 9. QA
- [x] End-to-end **data layer**: admin seeds class/student/parent → parent phone-adopts → fan-out lands → parent reads own child's attendance, denied a classmate's — verified in the emulator (`scripts/emulator-round-trip-test.js`, 11/11 passing), including the actual rules bug caught along the way.
- [x] Basic **UI boot smoke test**: `expo start --web` against the real `ssr-juniors-dev` project — Metro bundles clean, Redux store initializes, `AuthGate` renders the login screen for an unauthenticated session with no runtime errors in the console.
- [x] **Manual click-through started** (2026-07-16, real device via `yarn android` against `ssr-juniors-dev`): first attempt hit `permission-denied` restoring an existing session, because none of this session's rules/indexes/functions had actually been deployed yet (only dry-run/emulator-validated) — the live rules were still the pre-redesign snapshot with no `teachers`/`parents` match blocks at all. Deployed all three to `ssr-juniors-dev` (see §2/§7). While tracing this, also found and fixed a real bug: `functions/src/mintFirestoreToken.ts` minted the custom token used to bridge native auth into the web Firestore SDK session *without* the `phone_number` claim, which `isPhoneOwner()` in `firestore.rules` depends on — this would have broken every teacher/parent first-login read even with correct rules live. Fixed by passing `{ phone_number }` from `request.auth.token` into `createCustomToken`.
- [x] **Retried on-device, hit a second real bug, same symptom**: `utils/phoneRoleAdoption.ts`'s `findByPhone()` queried Firestore with a 10-candidate `where("phone","in",[...])` (fuzzy formats, to tolerate admin data-entry variance) — Firestore's rules engine can't statically prove that shape safe against `isPhoneOwner()`, so it rejected the whole query with `permission-denied` unconditionally, before ever checking for a match. This made the `"phone-format-mismatch"` status dead code — unreachable, since the query always threw first. Fixed by querying only the exact `where("phone","==",authPhone)` — the one shape rules can prove — matching the E.164-only constraint already enforced at data entry (`utils/phoneValidation.ts`). Removed the now-unreachable `candidatesFor`/`normalizePhone` helpers and the `"phone-format-mismatch"` status/UI branch rather than leave dead code. `scripts/emulator-round-trip-test.js` never caught this because it drove the adopt step through a known doc ID from Admin-SDK seeding, never actually calling the real phone-lookup query — added explicit checks for that exact query shape (`"...phone lookup query allowed by rules"`) for both parent and teacher paths; **22/22 passing** (was 18/18). Pure app code (Metro-hot-reloaded), no redeploy needed.
- [x] **Session restore re-confirmed working on the physical device against real `ssr-juniors-dev`**: retried the same login, clean `setUser`/`setRole`/`setChildren` dispatch with no error, cross-checked server-side via `firebase functions:log` (multiple successful `mintFirestoreToken` invocations, none failing). Login/session-restore path is now genuinely verified end-to-end, not just emulator-tested.
- [ ] **Still not done**: full click-through of admin/teacher/parent screens with real data (create a teacher/parent/student/class through the UI, log in as each role, mark attendance, record a payment, post/receive a notification), especially the multi-child switcher and the SelectField picker component, which have zero runtime verification beyond typecheck.
- [ ] Push notification round-trip (actual delivery to a device) on all three login-holding roles — blocked on the separate, already-logged Expo/FCM credential gap in `docs/decisions.md`, unrelated to this pass.
