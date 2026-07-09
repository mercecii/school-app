# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
yarn install

# Start local dev server (development env — .env.development sets EXPO_PUBLIC_APP_ENV=development)
yarn start-dev

# Run on Android device/emulator (local native build, development env)
yarn android

# Run as web app
yarn web

# Lint
yarn lint

# Build E2 (staging/QA) APK — uses google-services.staging.json, package com.mercecii.schoolapp.staging
yarn build-e2

# Build E3 (production) AAB — uses google-services.prod.json, for Play Store
yarn build-e3

# Submit E3 build to Play Store production track
yarn release
```

There is no test suite configured. TypeScript type-checking is the primary static check, done implicitly by the Expo toolchain.

## Environments (development / staging / production)

Three environments, driven by one explicit env var — never inferred from `__DEV__` in a built app (that only means "running under Metro," and is `false` in every standalone build including E2). See `docs/decisions.md` for the full rationale and running decision log; this is the load-bearing summary.

| Environment | `EXPO_PUBLIC_APP_ENV` | Firebase project | Android `applicationId` | Deploys on |
|---|---|---|---|---|
| Development | `development` | `ssr-juniors-dev` | `com.mercecii.schoolapp.dev` | local only |
| Staging / QA (E2) | `staging` | `ssr-juniors-dev` | `com.mercecii.schoolapp.staging` | push → `develop` |
| Production (E3) | `production` | `ssr-juniors` | `com.mercecii.schoolapp` | push → `main`, reviewer-gated |

- `EXPO_PUBLIC_APP_ENV` is set via `.env.development` / `.env.production` (committed, no secrets — loaded automatically by Expo based on the command), overridden explicitly per `eas.json` build profile (`e2`→`staging`, `e3`→`production`), and set explicitly in each GitHub Actions workflow's build step `env:` block.
- `firebaseSetup/firebaseSetup.ts` reads it and **throws at startup if it's unset in a built (non-Metro) context** — it never silently falls back to production.
- `app.config.ts` (replaces the old static `app.json`) reads the same var to compute `android.package`, the app name, and the adaptive-icon tint per environment — production resolves byte-for-byte identical to the pre-migration `app.json`.
- `main` and `develop` are both real, pushed branches — `develop` is the trunk (GitHub's default branch), `main` is the protected production branch gated by a GitHub Environment (`production`) with a required reviewer.

## Platforms

Android and Web only. iOS support has been dropped. The dual Firebase SDK abstraction (`authClient.native` / `authClient.web`) covers both remaining platforms.

## Architecture

### Dual Firebase SDK

Native builds use `@react-native-firebase/*` (the React Native Firebase SDK); the web build uses the `firebase` JS SDK. This incompatibility is resolved via platform-specific files:

- `utils/authClient.native.ts` — wraps `@react-native-firebase/auth`
- `utils/authClient.web.ts` — wraps `firebase/auth`
- `utils/authClient.ts` — re-exports; Metro/webpack resolves the right file at build time
- `utils/authClient.types.ts` — shared types bridging both SDKs

All auth calls elsewhere import from `@/utils/authClient` and go through these typed wrappers. Phone number login is only supported on native (the web client throws on `signInWithPhoneNumber`).

Firebase is initialized in `firebaseSetup/firebaseSetup.ts`. Unlike `authClient`, this file has **no native/web split** — the same `firebase/app` + `firebase/firestore` JS SDK client is used for Firestore access on every platform, including native Android. It selects dev vs prod config based on `EXPO_PUBLIC_APP_ENV` (see Environments above) — historically this was based on `__DEV__`, which caused every built Android app to silently read/write Firestore against production regardless of which environment its native Auth was scoped to; see `docs/decisions.md` for the full incident writeup.

### Role-Based Routing

The root layout (`app/_layout.tsx`) wraps everything in a Redux `<Provider>` and then renders `<AuthGate>`, which owns all routing logic:

1. `onAuthStateChanged` fires on app start.
2. Checks Firestore `admins/{uid}` — if found, sets `role = "admin"`.
3. Otherwise calls `ensureStudentDocUsesUid` (see below) — if found, sets `role = "student"`.
4. If neither doc exists, shows `<NotRegisteredScreen>` instead of redirecting.
5. After loading, `<AuthGate>` redirects based on role:
   - Unauthenticated → `/(auth)/login`
   - Admin → `/admin`
   - Student → `/pages`

Route segments map to roles: `(auth)` = public, `admin` = admin-only, `pages` = student-only.

### Student Linking (`utils/studentLinking.ts`)

Students log in via phone number. The admin pre-creates student Firestore documents keyed by a `parentPhone` field, not by UID. On first login, `ensureStudentDocUsesUid` looks up `students/{uid}` — if missing, it searches by phone (normalizing formats, trying `+91` prefix variants). When a match is found under a different doc ID, it atomically migrates the document to `students/{uid}` using a Firestore `writeBatch`.

### Push Notifications (`utils/utils.ts`, `utils/pushTokenManager.ts`)

- `configureNotificationHandlingAsync` — idempotently sets up the global notification handler and creates the Android "default" channel. Called once on app start.
- `registerForPushNotificationsAsync(uid)` — requests permission, gets an Expo push token, then writes it to `students/{uid}/devices/{deviceId}` via `savePushToken`. Uses an in-memory lock (`activePushRegistration`) to prevent concurrent registrations for the same UID.
- Device ID: Android uses the hardware-backed `androidId`; other platforms generate and persist a random ID in AsyncStorage.
- Notification tap handling in `AuthGate` reads `data.screen` from the notification payload and navigates accordingly (currently only `"notifications"` → `/pages/notifications`). It also writes `readBy: arrayUnion(uid)` to the `notifications/{id}` Firestore doc.

### State Management

Redux Toolkit with a single slice (`store/slices/authSlice.ts`). The store holds:
- `userInfo`: `AdminWithStringDate | StudentwithStringDate | null` — Firestore doc with `Timestamp` fields serialized to strings for Redux compatibility
- `role`: `"admin" | "student" | null`
- `loading`: boolean

Redux Logger is included and active in all builds.

### Navigation Structure

Both `app/admin/_layout.tsx` and `app/pages/_layout.tsx` use `expo-router/drawer` (Drawer navigator) with `GestureHandlerRootView`. Both provide `auth.currentUser` via `UserContext`. The `CustomHeader` and `HeaderRight` components are shared between layouts.

### Firestore Collections

| Collection | Doc ID | Notes |
|---|---|---|
| `admins` | Firebase Auth UID | Admin profiles |
| `students` | Firebase Auth UID | Migrated from phone-keyed docs on first login |
| `students/{uid}/devices` | deviceId | Push tokens, one per device |
| `notifications` | auto-ID | `readBy: string[]` tracks per-user read receipts |
