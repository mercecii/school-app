# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
yarn install

# Start local dev server (hits E2/QA Firebase via __DEV__=true)
yarn start-dev

# Run on Android device/emulator (local native build)
yarn android

# Run as web app
yarn web

# Lint
yarn lint

# Build E2 (QA) APK — uses google-services.dev.json, distributed internally
yarn build-e2

# Build E3 (production) AAB — uses google-services.prod.json, for Play Store
yarn build-e3

# Submit E3 build to Play Store production track
yarn release
```

There is no test suite configured. TypeScript type-checking is the primary static check, done implicitly by the Expo toolchain.

## Platforms

Android and Web only. iOS support has been dropped. The dual Firebase SDK abstraction (`authClient.native` / `authClient.web`) covers both remaining platforms.

## Architecture

### Dual Firebase SDK

The app targets three platforms (Android, iOS, web). Native builds use `@react-native-firebase/*` (the React Native Firebase SDK); the web build uses the `firebase` JS SDK. This incompatibility is resolved via platform-specific files:

- `utils/authClient.native.ts` — wraps `@react-native-firebase/auth`
- `utils/authClient.web.ts` — wraps `firebase/auth`
- `utils/authClient.ts` — re-exports; Metro/webpack resolves the right file at build time
- `utils/authClient.types.ts` — shared types bridging both SDKs

All auth calls elsewhere import from `@/utils/authClient` and go through these typed wrappers. Phone number login is only supported on native (the web client throws on `signInWithPhoneNumber`).

Firebase is initialized in `firebaseSetup/firebaseSetup.ts`, which selects dev or prod config based on `__DEV__`. Firestore is exported from there and used directly throughout the app.

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
