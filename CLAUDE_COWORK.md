# Cross-surface task board (Claude Code ⇄ Claude Cowork ⇄ Claude Design)

**This is a living document, not a one-time brief, and it is bidirectional.** Deepak runs Claude Code (VS Code/terminal), Claude Cowork (browser), and Claude Design against this same repo, with no automatic sync between them — the repo itself is the sync point. Convention:

- **Each surface has its own section below** listing tasks *for that surface*, written by whichever other surface found the need. If you're Claude Code and you hit something only Cowork's browser access (or Design's tooling) can do, add it to *their* section — don't just mention it in chat and move on. Same in reverse: if you're Cowork or Design and you hit something only a terminal/IDE session can do (running a CLI command, editing source, a full rebuild), add it to **Claude Code's** section.
- **Whoever finishes a task clears or replaces it** in that surface's section — don't leave completed items listed as pending, and don't let a section go stale.
- **`docs/decisions.md`** is the running decision log all three sides read and write to. If you find something noteworthy while doing a task (a security issue, an inconsistency, an unexpected console state), add it there under a new dated entry or append to the current one — don't just report it back verbally and let it evaporate. That's exactly how the admin-rules vulnerability below got caught: it was logged there, not just mentioned in chat.
- Read `docs/decisions.md` before starting anything here if you want fuller context than this file gives.

Background: this app (`school-app`) is mid-migration to a proper dev/staging/production environment setup. Two Firebase projects: `ssr-juniors-dev` (dev + staging/QA) and `ssr-juniors` (production).

---

## Tasks for Claude Cowork (browser/console work)

### Current status: in progress (2026-07-18) — new staging app created, App content declarations underway

**Progress so far:** app created ("KPS School App (Staging)", package `com.mercecii.schoolapp.staging`, App ID `4975794778424579644`). All required App content declarations are done and saved: Privacy policy, Ads, Data safety (via CSV export/import from production), Sign in details (test account `+11234567891` / code `123456`), Content ratings (matched production's "Everyone/All ages" via the IARC questionnaire), Target audience (18+, matching production), Government apps (No), Financial features (none), Health apps (none), Advertising ID (No).

Default store listing (`main-store-listing`) cloned from production: App name, short description, and full description copied over and **saved as draft**. App icon, feature graphic, and phone screenshots could **not** be uploaded automatically — Play Console's "Add assets" control uses a native OS file picker with no underlying `<input type=file>` in the DOM, so there's no way for browser automation to attach a file to it. **Needs Deepak to do manually (2 minutes):** open [Store listings → Default store listing](https://play.google.com/console/u/0/developers/6294260353922799990/app/4975794778424579644/main-store-listing), click "Add assets" under App icon and upload `assets/images/icon.png`, then the same for Feature graphic with `assets/images/feature-graphic.png`. Phone screenshots (2-8 required) aren't in the repo — production's 5 live screenshots can be seen/re-saved from [production's listing page](https://play.google.com/console/u/0/developers/6294260353922799990/app/4972477407842530110/main-store-listing) if Deepak wants pixel-identical ones, or new ones can be taken from the staging build once it's running.

Testing → Closed testing is set up: the "Closed testing - Alpha" track has countries targeted (177) and testers selected — created a new email list "Staging Testers" containing `kpsclosedtesting1@gmail.com` (Deepak's own alternate account, used for self-testing) and checked it for the track. Setup is now 2 of 4 steps complete ("Select countries" and "Select testers" both done); remaining: create/upload a release (needs the staging AAB) and send it to Google for review.

Staging AAB uploaded (from `https://expo.dev/artifacts/eas/ug39L2NP4F_n_9PuMQHufSRHlPxR18eVa_Yq9mM4hQQ.aab`, verified package `com.mercecii.schoolapp.staging`, 82MB — Deepak drag-and-dropped it manually since Cowork's file-upload tool caps at 10MB). App category (Education) and store contact email (`d9572712747@gmail.com`) cloned from production. Store listing graphics (App icon, Feature graphic, 2 phone screenshots) were also blocked on the same native-file-picker limitation — Deepak uploaded those manually too, including a freshly designed feature graphic (exact 1024x500 Play spec, vs. the old 1536x1024 off-ratio one) built from the same brand colors/seal. Store listing now shows "Ready to send for review."

**Submitted 2026-07-19:** filled in release notes, created the closed testing release (version 3 / 1.0.0, only 1 harmless warning about a missing deobfuscation file), and submitted all 14 pending changes via Publishing overview → "Submit changes for review" (confirmed with Deepak first since this is a real send-to-Google action). Status is now "Changes in review" — Play's automated pre-launch checks were running (~11 min) at submission time; full review can take up to 7 days per Google's messaging, though closed testing reviews are often much faster than production.

**Done 2026-07-19:** review cleared, track is Active with release 3 (1.0.0) live to 177 countries. Opt-in URL: `https://play.google.com/apps/testing/com.mercecii.schoolapp.staging` — tester `kpsclosedtesting1@gmail.com` needs to open this URL while signed into that Google account, tap "Become a tester", then install/update from the Play Store. Task complete — nothing further pending on this from Cowork.

**Goal:** Deepak wants to share the staging/QA build with a friend via a real Play Console closed-testing track (not Internal App Sharing this time — he explicitly wants the formal closed-testing flow with a shareable opt-in link). This needs a **brand-new Play Console app** — the existing "KPS School App" is permanently tied to the production package (`com.mercecii.schoolapp`) and its production Firebase project; Play requires the uploaded package name to match exactly what an app was registered with, so the staging package can't go through that same app.

**Steps:**
1. Play Console → **Create app**.
   - Name: "KPS School App (Staging)" — internal-only name, never shown to real users.
   - Package name must end up as exactly: `com.mercecii.schoolapp.staging` (matches `app.config.ts` staging env and the `e2-store` EAS build profile).
   - Default language, App/Free, accept the standard policy declarations.
2. Complete whatever App content declarations Play requires before allowing a release (content rating, target audience, data safety, privacy policy URL) — same as was needed for the production app earlier. Use the existing repo assets if a store listing/icon is required: `assets/images/icon.png`, `assets/images/feature-graphic.png`.
3. Go to **Testing → Closed testing**, create a track (any name, e.g. "Friends & Family" or reuse "Alpha" if Play defaults to one), and under **Testers** add the friend's Google account email (ask Deepak for it if not already known).
4. Claude Code is building the staging AAB now (`yarn build-e2-store`, package `com.mercecii.schoolapp.staging`, Firebase project `ssr-juniors-dev` — safe test data, not production). Once it finishes, Deepak will provide the file — upload it as the first release on the closed testing track. First-ever upload on a brand-new track/app has to be done manually via the Play Console web UI (no linked service account for automated `eas submit` on this new app yet).
5. Publish the release, then find and copy the **opt-in URL** for that closed testing track (Play Console shows this once a release is live — usually on the track's own page, something like "Share this link so testers can opt in"). Hand that link back so Deepak can send it to his friend.

**Important:** this app points at `ssr-juniors-dev` (safe test/QA data), completely separate from the production app already submitted for review — don't confuse the two, and don't touch the production app's tracks/application status while doing this.

**Known gaps to mention to Deepak if relevant, not to fix yourself:**
- No teacher/parent/student/class data exists in `ssr-juniors` (production) yet — irrelevant to this task since this app points at `ssr-juniors-dev`, which already has the session's test data (Test Teacher, Test Parent, Test Student, Class 5-A).
- Push notification delivery is already fixed for all three environments as of today (2026-07-18) — no longer a caveat to mention.

**Report back:** update this section (or clear it) with what happened — the app's URL/ID, the closed-testing opt-in link once generated, and anything blocked along the way — and log anything noteworthy in `docs/decisions.md` per the usual convention.

**✅ Done 2026-07-15 (Cowork):** Granted `roles/iam.serviceAccountTokenCreator` to `400666905468-compute@developer.gserviceaccount.com` on `ssr-juniors-dev` via IAM & Admin console. Verified directly in the console (row now lists "Service Account Token Creator" alongside its existing roles) — not just self-reported, per this repo's own verify-manual-steps convention. IAM propagation can take a minute or two.

**Next (Claude Code, terminal-side):** relaunch the app on the emulator, check `adb logcat` for `ReactNativeJS.*(Restoring|Failed)`, and tail `firebase functions:log --only mintFirestoreToken --project ssr-juniors-dev` to confirm `createCustomToken` no longer throws and the app reaches its role-based redirect. Cowork's sandbox has no adb/emulator/authenticated firebase CLI access, so this leg has to run on the user's machine.

Everything from the previous round is done:
- ✅ `com.mercecii.schoolapp.dev` and `com.mercecii.schoolapp.staging` registered as Android apps under `ssr-juniors-dev`; `google-services.dev.json` / `google-services.staging.json` are in the repo.
- ✅ Firestore rules pulled from both projects' consoles → `firestore.dev.rules` / `firestore.prod.rules` in the repo root.
- ✅ The admin self-promotion rules vulnerability found during that pull was fixed and reconciled into the single `firestore.rules` file.

---

## Tasks for Claude Code (terminal/IDE work)

### Current status: no tasks pending

**Resolved:** the signing-key mismatch Cowork flagged (EAS's only keystore, `owc1Vx9wTM`, didn't match Play's expected `EB:2C:11:...93:55`) turned out to be a locate-the-file problem, not a lost-key problem — Deepak had the real original keystore (`kps-upload-key.keystore`) saved locally. Built a correctly-signed production AAB with it directly via local `./gradlew bundleRelease` (bypassing EAS entirely for this one build, since `eas credentials` import needs an interactive terminal session this agent can't drive) — see `docs/decisions.md` for the full fingerprint-verification writeup.

**Deferred, not urgent:** import `kps-upload-key.keystore` into EAS's managed Android credentials for `com.mercecii.schoolapp` so future `eas build --profile e3` runs are correctly signed without this manual workaround. Needs an interactive `eas credentials` session — a terminal task, but one only Deepak can drive interactively (or explicitly hand off with clear steps).

---

Nothing else outstanding from Cowork or Design right now. If you're Cowork or Design and you hit something that needs a terminal — running a build, editing source/rules/functions, installing a dependency, a full `yarn android` rebuild — list it here with the same level of detail as the Cowork section above: what's needed, why, and how to verify it worked.

---

## Tasks for Claude Design

### Current status: no tasks pending

Nothing outstanding yet. If you're Claude Code or Cowork and something needs Design's tooling (assets, UI/visual work), list it here.
