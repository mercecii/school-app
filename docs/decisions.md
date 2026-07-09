# Decisions log

Running record of non-obvious architectural/process decisions and the reasoning behind them. Append new entries as decisions get made — don't rewrite history, add to it. Each entry: what we decided, why, and what's still open.

---

## 2026-07-09 — Environment management overhaul (dev / staging / prod)

**Context:** App has zero live users. Audit found the app's dev/staging/prod wiring was broken in ways that predate any users: every built Android app (including the E2 "QA" APK) read/wrote Firestore against **production**, because `firebaseSetup.ts` picked config via `__DEV__`, which is `false` in any standalone build, not just release ones. Every PR preview on web also served against production Firestore for the same reason. Full original audit: see the Artifact linked in this conversation (not persisted to the repo).

### Decided

- **One explicit signal, everywhere: `EXPO_PUBLIC_APP_ENV`** (`development` \| `staging` \| `production`). Never infer environment from `__DEV__` in a built app again — `__DEV__` only means "running under Metro," nothing else.
  **Why:** the whole bug class existed because environment was *implicit*. Making it one named, explicit value that both `app.config.ts` (Node, build-time) and the client bundle (`EXPO_PUBLIC_*` inlined by Expo's babel preset) read the same way closes it structurally, not just at this one call site.

- **Fail loud, never default to production.** If `EXPO_PUBLIC_APP_ENV` is unset in a built (non-Metro) context, `firebaseSetup.ts` throws at startup instead of silently falling back to the prod config like it did before.
  **Why:** a silent prod default is exactly how this bug shipped originally. Throwing turns "forgot to set the env var" into an immediate crash during QA, not a quiet data-integrity leak discovered later.

- **Firebase config *values* stay as hardcoded objects** (`firebaseConfigDev` / `firebaseConfigProd`), keyed by the env var — not exploded into more `EXPO_PUBLIC_FIREBASE_*` vars.
  **Why:** these values aren't secrets (Firebase web config is safe client-side, scoped by security rules), so more env vars would add indirection across `.env.*` files / `eas.json` / 3 workflows without a security benefit. Only the *selector* needs to be wired everywhere.

- **Staging (E2) shares the `ssr-juniors-dev` Firebase project with local development** — no third Firebase project introduced yet.
  **Why:** zero users means QA/dev data collision is cheap right now. Revisit only once QA data volume makes that collision actually costly (noted as deferred, not forgotten).

- **Branch strategy: adopt `main` as the protected production branch.** `main` was a one-commit local stub (the original `create-expo-app` scaffold) that had never been pushed to GitHub — `develop` was the real trunk (GitHub's default branch, only branch on origin, all real history). Confirmed `main`'s commit was an ancestor of `develop`, so we fast-forwarded local `main` to `develop`'s tip (lossless) and pushed it to origin for the first time.
  **Why:** the original CI had `develop → prod Hosting` and `main → dev Hosting` — backwards from any sane convention, and made worse by `main` not really existing on GitHub. Rather than patch around a dead branch, we made `main` real and gave it the meaning its name implies.
  **Resulting mapping:** `develop` → auto-deploys to staging (`ssr-juniors-dev` Hosting). `main` → deploys to production (`ssr-juniors` Hosting), gated by a GitHub Environment (`production`) requiring manual reviewer approval.

- **PR previews (`firebase-hosting-pull-request.yml`) now force `EXPO_PUBLIC_APP_ENV=staging`.** This was the single most severe finding — every open PR previously got a live preview URL whose Firestore calls silently hit production. Fixed alongside the other two workflows, same mechanism.

- **Each environment gets its own Android package id** (`com.mercecii.schoolapp.dev` / `.staging` / unchanged `com.mercecii.schoolapp` for prod), instead of all three sharing one identity.
  **Why:** one shared package id meant a QA APK install could silently overwrite a prod install (or vice versa) on the same device, and testers couldn't tell builds apart by icon/name alone.
  **Trade-off accepted:** this requires a manual Firebase Console prerequisite (registering two new Android apps under `ssr-juniors-dev`, one per new package name, each needing its own `google-services.*.json`) before the corresponding code path is live — user chose to do this rather than defer it, given the migration is already in progress and there are no users to disrupt.

- **Firestore Security Rules will be pulled from what's actually deployed today, not written from scratch,** before being brought under version control.
  **Why:** nothing is checked into the repo currently — rules exist only in each project's console, unversioned. Starting from ground truth avoids accidentally tightening or loosening access on first deploy.

- **Rules deploys stay a manual, human-reviewed command** (`deploy-rules-dev` / `deploy-rules-prod`, mirroring the existing `functions` deploy scripts) — not wired into the auto-deploy CI workflows.
  **Why:** security rules are high-blast-radius; auto-deploying them on every push removes the review step that matters most for this particular file.

- **`app.json` replaced entirely by `app.config.ts`**, function-based, keyed off `EXPO_PUBLIC_APP_ENV`. Verified via `npx expo config --json` under all three env values plus unset: production resolves byte-for-byte identical to the old `app.json` (name, package, icon background all unchanged); staging/development get distinct names (`KPS (Staging)` / `KPS (Dev)`) and adaptive-icon background tints (no new icon artwork this pass — cheapest visual differentiator); unset defaults to `development`, never production.
  **Why byte-for-byte for prod:** the existing Play Store listing and installed base must be completely undisturbed by this migration.

- **Landed the package-id split immediately, accepting that it breaks `yarn build-e2` until the Firebase Console prerequisite is done** — `eas.json`'s `e2` profile now points at `google-services.staging.json`, which doesn't exist yet.
  **Why:** user chose "land it now" over staging the rollout behind the old package id — zero users means no build-cadence pressure, and one clear blocking TODO beats a two-step migration with a silent intermediate state.

- **`production` GitHub Environment reviewer gate: created via UI, but the required-reviewer rule silently didn't save** (`gh api repos/mercecii/school-app/environments` showed `protection_rules: []` after the user believed it was configured). Fixed via `gh api -X PUT .../environments/production` with `reviewers: [{type: User, id: 14855460}]` (mercecii), then re-verified via the same GET — confirmed `required_reviewers` now present.
  **Why this matters:** a UI step that looks complete isn't the same as a verified one — always check state via API/CLI after a manual console step where feasible, rather than trusting "I did it" at face value. This is now the second console step (after the branch-topology surprise) that didn't match what was assumed.

- **`com.mercecii.schoolapp.dev` registered in Firebase Console**, `google-services.dev.json` updated with the real two-entry file (old `com.mercecii.schoolapp` + new `.dev`).

- **`com.mercecii.schoolapp.staging` registered too — done via Claude Cowork** (a separate browser-capable agent the user runs, briefed via `CLAUDE_COWORK.md`), not manually. `google-services.staging.json` added with all three client entries (original, `.dev`, `.staging`), verified package name matches what `app.config.ts`/`eas.json`'s `e2` profile expect. **`yarn build-e2` is unblocked.**

- **Firestore rules pulled from console via Claude Cowork, checked into the repo as `firestore.dev.rules` (covers `ssr-juniors-dev`, i.e. local dev + staging) and `firestore.prod.rules` (covers `ssr-juniors`).** Console copy, not hand-written — matches ground truth as of 2026-07-09. Neither project had any composite (Manual) indexes deployed.
  **Notable drift found between the two:** prod's rules are looser than dev/staging's — no subcollection deny-all under `/students/{studentId}`, no admin-full-access clause on `/students`, and `/notifications` write logic differs (dev/staging: blanket `allow write: if false`; prod: split `create`/`update`/`delete` with real admin/student-authored logic on `update`). Not yet reconciled — flagged for follow-up, not fixed here.
  **Not yet wired up:** `firebase.json` has no `firestore.rules` field yet, `.firebaserc` only has a `default` alias (`ssr-juniors`, no `ssr-juniors-dev` alias), and the planned `deploy-rules-dev`/`deploy-rules-prod` package.json scripts don't exist yet. Rules files are checked in but not yet deployable via a single command.

### Still open (as of this entry)
- `develop-with-claude` has been pushed to origin but not yet merged into `develop` — the new staging auto-deploy pipeline hasn't been exercised end-to-end yet. User will merge after review.
- Vestigial `google-services.json` (bare, unused by `app.config.ts` now) to be deleted in a later cleanup pass — intentionally left alone for now per user request.
- `firestore.dev.rules` / `firestore.prod.rules` are checked in but not wired to `firebase.json` or a deploy command yet, and the dev/prod rules drift noted above hasn't been reconciled.

### Tooling notes
- `gh` CLI was not installed at the start of this work; installed partway through, which unblocked direct GitHub API verification/fixes (see reviewer-gate fix above).
- `firebase` CLI is installed and already authenticated on this machine (confirmed via `firebase projects:list`, shows both `ssr-juniors` and `ssr-juniors-dev`) — useful for future scripted Firebase operations, but it has no built-in command to fetch currently-deployed Firestore rules; that still requires the console.
