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

### Still open (as of this entry)
- User to create the `production` GitHub Environment (Settings → Environments) with a required reviewer — referenced by `firebase-hosting-merge.yml` but not yet configured with an actual approval gate.
- **`yarn build-e2` is currently broken** — user needs to register the two new Android apps in Firebase Console (`com.mercecii.schoolapp.dev`, `com.mercecii.schoolapp.staging`, both under `ssr-juniors-dev`) and hand over the resulting `google-services.dev.json` / `google-services.staging.json` before E2 builds work again.
- User to pull current Firestore rules (`firebase firestore:rules:get` or console copy) for both projects.
- `develop-with-claude` has been pushed to origin but not yet merged into `develop` — the new staging auto-deploy pipeline hasn't been exercised end-to-end yet.
