# Browser tasks for Claude Cowork

**This is a living document, not a one-time brief.** Deepak runs Claude Code (VS Code) and Claude Cowork (browser) against this same repo, and there's no automatic sync between the two — the repo itself is the sync point. Convention:

- **This file always lists the current outstanding browser/console tasks.** When you finish one, it should get cleared or replaced by whoever updates this file next — don't leave completed tasks listed as pending.
- **`docs/decisions.md`** is the running decision log both sides read and write to. If you find something noteworthy while doing a task (a security issue, an inconsistency, an unexpected console state), add it there under a new dated entry or append to the current one — don't just report it back verbally and let it evaporate. That's exactly how the admin-rules vulnerability below got caught: it was logged there, not just mentioned in chat.
- Read `docs/decisions.md` before starting anything here if you want fuller context than this file gives.

Background: this app (`school-app`) is mid-migration to a proper dev/staging/production environment setup, driven from Claude Code / VS Code. Two Firebase projects: `ssr-juniors-dev` (dev + staging/QA) and `ssr-juniors` (production).

---

## Current status: no browser tasks pending

Both previously-listed tasks are done:
- ✅ `com.mercecii.schoolapp.dev` and `com.mercecii.schoolapp.staging` registered as Android apps under `ssr-juniors-dev`; `google-services.dev.json` / `google-services.staging.json` are in the repo.
- ✅ Firestore rules pulled from both projects' consoles → `firestore.dev.rules` / `firestore.prod.rules` in the repo root.

**Heads up if you're picking this up next:** that rules pull surfaced a real security bug — production's rules currently let any signed-in user grant themselves the admin role (`/admins/{adminId}` allows `write` if `request.auth.uid == adminId`, with no check that the writer is already an admin). Claude Code is drafting a fix; this doesn't need browser/console work to fix (it's a rules-file edit), but **deploying** the corrected rules to the live `ssr-juniors` project, when that's ready, will need someone to run `firebase deploy --only firestore:rules --project ssr-juniors` — that could be a future task listed here.

Nothing else needed from Cowork right now. Check back here before starting anything new.
