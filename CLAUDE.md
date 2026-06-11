# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn install          # Install dependencies
npx expo start        # Start dev server
npx expo start --web  # Web only
yarn android          # Android emulator
yarn ios              # iOS simulator

# Build
yarn export-web       # Export web to dist/
yarn generate-apk     # EAS Build Android preview
yarn generate-ipa     # EAS Build iOS preview

# Lint & type-check
yarn lint             # ESLint (expo lint)
npx tsc --noEmit      # Type-check

# Cloud Functions (run from functions/)
cd functions
yarn build            # Compile TypeScript
yarn build:watch      # Watch mode
yarn lint
yarn serve            # Firebase emulator
yarn deploy-dev       # Deploy to ssr-juniors-dev
yarn deploy-prod      # Deploy to ssr-juniors
```

There are no test commands — the project has no test suite configured.

## Architecture

**KPS School App** is an Expo 54 / React Native 0.81 / TypeScript app using file-based routing (`expo-router` v6). Students access a school portal (dashboard, attendance, fees, homework, etc.). Admins manage students and send push notifications.

**Backend:** Firebase (Auth, Firestore, Cloud Functions). Two projects: `ssr-juniors` (production) and `ssr-juniors-dev` (development). Cloud Functions live in `functions/` as a separate TypeScript workspace.

### Auth Flow (`app/_layout.tsx`)

`AuthGate` wraps the entire router tree:
1. `onAuthStateChanged` fires → queries `admins` then `students` collection by UID
2. Dispatches role (`admin` | `student`) + user data to Redux
3. Redirects: no auth → `/(auth)/login`, admin → `/admin`, student → `/pages`

**Student linking:** Phone OTP login uses `ensureStudentDocUsesUid()` (`utils/studentLinking.ts`) to find an existing student by `parentPhone` and migrate their Firestore document to use the Firebase Auth UID (atomic batch). Admin pre-creates student records; students cannot self-register.

### Navigation

- `app/(auth)/` — login screens (student phone OTP, admin email/password)
- `app/pages/_layout.tsx` — student drawer (18+ screens)
- `app/admin/_layout.tsx` — admin drawer (4 screens)

### State Management

Redux Toolkit (`store/slices/authSlice.ts`) holds auth state globally. Firestore Timestamps must be serialized to strings before dispatch — use `AdminWithStringDate` / `StudentwithStringDate` types. Redux Logger middleware is always active.

### Push Notifications

Each student stores up to 5 device tokens as a subcollection: `students/{uid}/devices/{deviceId}`. Device ID is persisted in AsyncStorage (`@school_app_device_id`). Always use `savePushToken()` / `removePushToken()` from `utils/pushTokenManager.ts` — never write tokens to Firestore directly. The Cloud Function `sendExpoNotification` (`functions/src/index.ts`) triggers on `notifications/{id}` creation and batch-sends via Expo Push API, auto-cleaning dead tokens.

### Platform-Specific Auth

`utils/authClient.ts` re-exports from platform-specific files:
- `authClient.native.ts` — `initializeAuth()` with AsyncStorage adapter
- `authClient.web.ts` — standard `getAuth()` from `firebase/auth`

### Key Conventions

- Firestore document ID for students **must** match Firebase Auth UID (`students/{uid}`)
- Student name field is `fullname` (not `name`)
- Phone comparison: strip non-digits, compare last 10 digits
- Path alias `@/*` maps to the project root (e.g., `@/store/store`)
- School branding (name, logo, primary color) lives in `config/branding.ts`
- New student screens go in `app/pages/` and must be registered in the drawer `_layout.tsx`
- Before adding Firestore fields, check `functions/exports/firestore-schema.json` and existing types in `firebaseSetup/fireBase.types.ts`
- `getLastNotificationResponseAsync()` is unavailable on web — guard with platform checks
