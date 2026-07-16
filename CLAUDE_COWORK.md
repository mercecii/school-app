# Cross-surface task board (Claude Code ⇄ Claude Cowork ⇄ Claude Design)

**This is a living document, not a one-time brief, and it is bidirectional.** Deepak runs Claude Code (VS Code/terminal), Claude Cowork (browser), and Claude Design against this same repo, with no automatic sync between them — the repo itself is the sync point. Convention:

- **Each surface has its own section below** listing tasks *for that surface*, written by whichever other surface found the need. If you're Claude Code and you hit something only Cowork's browser access (or Design's tooling) can do, add it to *their* section — don't just mention it in chat and move on. Same in reverse: if you're Cowork or Design and you hit something only a terminal/IDE session can do (running a CLI command, editing source, a full rebuild), add it to **Claude Code's** section.
- **Whoever finishes a task clears or replaces it** in that surface's section — don't leave completed items listed as pending, and don't let a section go stale.
- **`docs/decisions.md`** is the running decision log all three sides read and write to. If you find something noteworthy while doing a task (a security issue, an inconsistency, an unexpected console state), add it there under a new dated entry or append to the current one — don't just report it back verbally and let it evaporate. That's exactly how the admin-rules vulnerability below got caught: it was logged there, not just mentioned in chat.
- Read `docs/decisions.md` before starting anything here if you want fuller context than this file gives.

Background: this app (`school-app`) is mid-migration to a proper dev/staging/production environment setup. Two Firebase projects: `ssr-juniors-dev` (dev + staging/QA) and `ssr-juniors` (production).

---

## Tasks for Claude Cowork (browser/console work)

### Current status: no tasks pending (last done: 2026-07-15)

**✅ Done 2026-07-15 (Cowork):** Granted `roles/iam.serviceAccountTokenCreator` to `400666905468-compute@developer.gserviceaccount.com` on `ssr-juniors-dev` via IAM & Admin console. Verified directly in the console (row now lists "Service Account Token Creator" alongside its existing roles) — not just self-reported, per this repo's own verify-manual-steps convention. IAM propagation can take a minute or two.

**Next (Claude Code, terminal-side):** relaunch the app on the emulator, check `adb logcat` for `ReactNativeJS.*(Restoring|Failed)`, and tail `firebase functions:log --only mintFirestoreToken --project ssr-juniors-dev` to confirm `createCustomToken` no longer throws and the app reaches its role-based redirect. Cowork's sandbox has no adb/emulator/authenticated firebase CLI access, so this leg has to run on the user's machine.

Everything from the previous round is done:
- ✅ `com.mercecii.schoolapp.dev` and `com.mercecii.schoolapp.staging` registered as Android apps under `ssr-juniors-dev`; `google-services.dev.json` / `google-services.staging.json` are in the repo.
- ✅ Firestore rules pulled from both projects' consoles → `firestore.dev.rules` / `firestore.prod.rules` in the repo root.
- ✅ The admin self-promotion rules vulnerability found during that pull was fixed and reconciled into the single `firestore.rules` file.

---

## Tasks for Claude Code (terminal/IDE work)

### Current status: no tasks pending

Nothing outstanding from Cowork or Design right now. If you're Cowork or Design and you hit something that needs a terminal — running a build, editing source/rules/functions, installing a dependency, a full `yarn android` rebuild — list it here with the same level of detail as the Cowork section above: what's needed, why, and how to verify it worked.

---

## Tasks for Claude Design

### Current status: no tasks pending

Nothing outstanding yet. If you're Claude Code or Cowork and something needs Design's tooling (assets, UI/visual work), list it here.
