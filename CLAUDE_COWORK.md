# Browser tasks for Claude Cowork

This file is a self-contained task list for browser/console work this repo currently needs. It assumes no prior context — everything you need is below. When done, report results back to the user (Deepak) so they can hand them to the coding assistant working in this repo.

Background in one paragraph: this app (`school-app`) is mid-migration to a proper dev/staging/production environment setup. Two Firebase projects exist — `ssr-juniors-dev` (used for both local development and staging/QA) and `ssr-juniors` (production). Each environment is getting its own Android app identity so builds don't collide on a test device. One of the two new Android app registrations is already done; the other, plus pulling the currently-deployed Firestore security rules, are still open. Full rationale, if you want it: `docs/decisions.md` in this repo.

---

## Task 1: Register the staging Android app in Firebase

Go to **https://console.firebase.google.com/project/ssr-juniors-dev/settings/general**

Under "Your apps", you should already see two Android apps registered: `com.mercecii.schoolapp` and `com.mercecii.schoolapp.dev`. Add a third:

1. Click **"Add app"** → the Android icon
2. **Android package name**: `com.mercecii.schoolapp.staging`
3. **App nickname**: `KPS Staging`
4. Leave the SHA-1 field blank
5. Click **Register app**, then download the `google-services.json` it offers
6. Click through the remaining SDK-setup steps (no code changes needed) until "Continue to console"

**Report back:** the full contents of the downloaded `google-services.json` (paste as text, or hand over the file). It will contain three app entries (the original, `.dev`, and `.staging`) — that's expected, Firebase bundles every app under a project into one file.

## Task 2: Copy the currently-deployed Firestore security rules

For **both** Firebase projects, open the Rules tab and copy the full text shown in the editor:

- **`ssr-juniors-dev`** (dev/staging data): https://console.firebase.google.com/project/ssr-juniors-dev/firestore/rules
- **`ssr-juniors`** (production data): https://console.firebase.google.com/project/ssr-juniors/firestore/rules

Select all the text in each rules editor and copy it.

**Report back:** both blocks of rules text, clearly labeled by project (`ssr-juniors-dev` vs `ssr-juniors`). Also check the **Indexes** tab (same left sidebar) on each project and note whether any composite indexes exist, or if the list is empty.

---

## When you're done

Hand both results (the `google-services.json` content from Task 1, and the two rules texts from Task 2) back to Deepak, who will pass them to the coding assistant to wire in. Nothing here requires touching this repo's code or git — it's read-only console work plus two downloads/copies.
