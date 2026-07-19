# Test accounts (ssr-juniors-dev only)

Dev/QA credentials for manual testing against the `ssr-juniors-dev` Firebase project. Not real users, not production data. Phone numbers below are Firebase Console "test phone numbers" (Authentication → Sign-in method → Phone → Phone numbers for testing) — they don't send real SMS, and only work against `ssr-juniors-dev`.

## Logins

| Role | Identifier | Code / Password | Notes |
|---|---|---|---|
| Admin | `d9572712747@gmail.com` | (not recorded here — you know it) | Email/password login screen |
| Teacher (test number) | `+11234567891` | `123456` | Firebase test number |
| Teacher (real number) | `+919572712747` | real SMS OTP | Hit `auth/too-many-requests` during heavy testing on 2026-07-16/17 — may still be cooling down |
| Parent (test number) | `+11234567892` | `123456` | Firebase test number. **Active/working one.** |
| ~~Parent (test number, retired)~~ | ~~`+11234567890`~~ | ~~`123456`~~ | Deleted from Firebase Console by accident on 2026-07-16 — deleting a test number also deletes its Auth user, so re-adding the same number later mints a new UID and no longer matches the old adopted `authUid`. Don't reuse; if you need it again, create a fresh parent doc instead of trying to relink. |

## Seeded test data

- **Class**: "Class 5 - A" (grade 5, section A, academic year 2026)
- **Student**: "Test Student" (roll 1, Male, in Class 5-A)
- **Teacher**: "Test Teacher" (`+11234567891`), assigned to Class 5-A
- **Parent**: linked to Test Student (`+11234567892`)
- **Fee structure**: "Term 1 Tuition", ₹5000, whole school, due 2026-08-01

## Adding another test phone number

Firebase Console → project `ssr-juniors-dev` → Build → Authentication → Sign-in method tab → click the **Phone** row → expand **"Phone numbers for testing (optional)"** → Add number + a 6-digit code of your choice → Save.
