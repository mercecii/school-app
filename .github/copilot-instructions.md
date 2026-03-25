# Project Guidelines — KPS School App

## Overview

React Native / Expo school management app with Firebase backend. Students view dashboards, attendance, homework, fees, timetables, etc. Admins manage content and send notifications.

**Stack:** Expo SDK 54 · React Native 0.81 · TypeScript (strict) · Firebase (Auth, Firestore, Cloud Functions) · Redux Toolkit · Expo Router v6

## Architecture

```
app/                   # Expo Router file-based routing
  (auth)/              # Auth screens (login)
  admin/               # Admin drawer navigation
  pages/               # Student drawer navigation (18+ screens)
  _layout.tsx          # Root layout — AuthGate controls routing
components/            # Shared UI components
config/                # Branding (school name, logo, primary color)
context/               # React Context (minimal — Firebase User only)
store/                 # Redux Toolkit store + slices
  slices/              # authSlice (userInfo, role, loading)
firebaseSetup/         # Firebase init, Firestore types
functions/             # Firebase Cloud Functions (TypeScript)
utils/                 # Push tokens, role detection, helpers
types/                 # Shared TypeScript types
```

### Key patterns

- **Auth flow:** `AuthGate` in root layout listens to `onAuthStateChanged`, queries `admins` then `students` collection by UID, dispatches role + user to Redux, redirects accordingly
- **State management:** Redux Toolkit with typed hooks (`useAppDispatch`, `useAppSelector`). Context API used minimally for Firebase `User` object only
- **Push notifications:** Multi-device token storage with `ExpoPushTokenEntry[]` array per student, max 5 devices, device ID persisted in AsyncStorage. Cloud Function triggers on `notifications/{id}` creation, batches via Expo Push API, auto-cleans dead tokens
- **Platform auth init:** Web uses `getAuth()`, native uses `initializeAuth()` with AsyncStorage persistence

## Firestore Collections

| Collection      | Purpose            | Key fields                                                                     |
| --------------- | ------------------ | ------------------------------------------------------------------------------ |
| `admins`        | Admin users        | email, fullName, role, isActive                                                |
| `students`      | Student users      | fullname, class, section, rollNumber, expoPushTokens[], parentName/Email/Phone |
| `notifications` | Push notifications | title, message, targetType (ALL/CLASS/USER), targetValue, readBy[], createdBy  |

## Build & Test

```bash
npm install                    # Install dependencies
npx expo start                 # Dev server
npm run android                # Run on Android
npm run ios                    # Run on iOS
npm run lint                   # ESLint
npm run export-web             # Static web export
npm run generate-apk           # EAS Build — Android release
npm run generate-ipa           # EAS Build — iOS release
```

**Cloud Functions:** `cd functions && npm install && npm run build`

**EAS profiles:** `development` (internal), `preview` (internal APK/IPA), `production` (store)

## Conventions

- **Path alias:** `@/*` maps to project root — use `@/store/store` not `../../store/store`
- **Typed Firestore:** Use `getTypedDoc<T>()` helper for type-safe document fetches
- **Schema discipline:** Before creating/updating Firestore docs, verify field names against `functions/exports/firestore-schema.json` and existing TS types; avoid ad-hoc fields unless schema is intentionally updated
- **Auth types:** `AdminWithStringDate` / `StudentwithStringDate` convert Firestore timestamps to strings for Redux serialization
- **Role detection:** `getRoleAsync(uid)` checks `admins` first, then `students`
- **Students writes:** Use `fullname` (not `name`) and keep student document shape aligned with schema-backed fields (`class`, `parentPhone`, timestamps, etc.)
- **Push token management:** Always use `savePushToken()` / `removePushToken()` from `utils/pushTokenManager.ts` — never write tokens directly to Firestore
- **Branding:** School name, logo, and primary color live in `config/branding.ts`
- **New screens:** Add to `app/pages/` for students or `app/admin/` for admins, register in the corresponding drawer `_layout.tsx`

## Gotchas

- Firebase auth is initialized differently per platform (web vs native) — see `firebaseSetup/firebaseSetup.ts`
- `expoPushTokens` field uses structured `ExpoPushTokenEntry[]` objects (not plain strings) — see `fireBase.types.ts`
- Cloud Functions deploy from `functions/` with separate `tsconfig.json` and `package.json`
- Android package: `com.mercecii.schoolapp` · Firebase project: `ssr-juniors`
- React Compiler and typed routes are experimental features enabled in `app.json`
